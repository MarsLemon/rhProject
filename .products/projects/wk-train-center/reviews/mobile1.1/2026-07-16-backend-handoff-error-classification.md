# M1.0 联调 · 后端 BUG：IO 异常被错误归类为 AI_TOOL_FAIL

> **日期**: 2026-07-16
> **Owner**: Claude
> **背景**: 前端 ToolCallProgress 已具备 `errorCode` 显示能力，但发现后端在 LLM 调用的 IO 异常下被错误归类为「知识库/联网工具调用失败」

---

## 现象

`train-center-2026-07-15.log` / `train-center-2026-07-16.log` 出现：

```
[BailianChat] IO 异常 requestId=...: Connection reset
[ReAct] 第 2 次调用 LLM, requestId=...
[BailianChat] 完成 requestId=..., contentLen=0, thinkingLen=281, toolCalls=2
```

但**前端**收到的错误 chunk 带 `errorCode=AI_TOOL_FAIL`，错误文案显示「**知识库/联网工具调用失败,请重试或换个问题试试**」。

---

## 根因

`AgentReActExecutorImpl.java` 中 LLM 调用是 **同步阻塞**在 `BailianChatCaller.call(...)` 上。catch IOException 后填入 `firstError`，然后:

```java
if (firstError.get() != null) {
  String errorCode = firstErrorCode.get() != null
      ? firstErrorCode.get()
      : AiGatewayConstants.ERROR_INTERNAL;
  sink.next(buildErrorChunk(firstError.get(), requestId, errorCode));
}
```

但是上面这行 `buildErrorChunk(...)` 调用的是 **String msg** 重载,而**不是 Throwable** 的重载:

```java
// AgentReActExecutorImpl.java L254-265
private AgentChatChunkVo buildErrorChunk(String msg, String requestId) {
  return buildToolFailErrorChunk(msg, requestId);   // ❌ 强制 AI_TOOL_FAIL
}

private AgentChatChunkVo buildToolFailErrorChunk(String msg, String requestId) {
  return AgentChatChunkVo.builder()
      .type(AiGatewayConstants.CHUNK_TYPE_ERROR)
      .content(msg)
      .errorCode(AiGatewayConstants.ERROR_TOOL_FAIL)
      .requestId(requestId)
      .build();
}
```

也就是说:**`errorCode` 在这段路径里完全被 `buildToolFailErrorChunk` 强制写成 `AI_TOOL_FAIL`,任何上游 `firstErrorCode.get()` 都失效**。

→ IOException (Connection reset, 网络断开, 等) 都被错误地报告为"工具调用失败"。

---

## 影响

- 用户看不到后端真实报错(网络/认证/限流/quota 等),只看到统一"工具失败"
- 联调时无法定位是真工具调用异常还是上游 LLM API 异常

---

## 修复建议

| 选项 | 改动 |
|------|------|
| **A. 直接修 L254** | 把 `buildErrorChunk(String, String)` 重载调用改为调用 `buildErrorChunk(Throwable, String)` (后者会基于错误消息做 heuristic 判断,且 IOException 会被归类为 INTERNAL) |
| **B. 接受上游 firstErrorCode** | 让 String 重载接收上游提供的 `errorCode`,把 `buildErrorChunk(String msg, String requestId)` 改成 `buildErrorChunk(String msg, String errorCode, String requestId)`,调用处传 `firstErrorCode.get()` |
| **C. 真正按异常类型分类** | 捕到 IOException 时单独归类为 ERROR_INTERNAL,工具抛出的异常才走 ERROR_TOOL_FAIL |

推荐**C**(语义最清晰)。在 `BailianChatCaller.call` 内的 IOException 路径上显式 `firstErrorCode.set(ERROR_INTERNAL)` 即可(已有该机制,只是当前调用处没用上)。

具体改法:

```java
} catch (IOException e) {
  firstError.set(e.getMessage());
  firstErrorCode.set(AiGatewayConstants.ERROR_INTERNAL); // ★ 新增
  log.error("[BailianChat] IO 异常 ...");
}
```

---

## P2 · IO 异常时给正在进行的 tool_call 补发失败 tool_result

### 现象

前端 ToolCallProgress 出现「1 个工具长期处在 loading 状态」卡死：

```
[0] 知识库检索 ME型主...        ← phase=call 永远不结束
[1] 知识库检索 ME型主... ✓ 10 条   ← phase=result 正常
[2] 知识库检索 S98ME-C... ✓ ...
...
```

### 根因

`AgentReActExecutorImpl.java` 的 ReAct 主循环同步执行工具:

```java
for (BailianChatCaller.ToolCallInfo tc : callResult.toolCalls()) {
  searchCount.incrementAndGet();
  sink.next(buildToolCallChunk(tc, request.requestId()));   // 先发 call chunk
  ToolExecutor.ToolResult execResult = toolRegistry.get(tc.name())
      .map(exec -> exec.execute(tc.arguments()))            // 同步等工具完成
      .orElse(ToolExecutor.ToolResult.fail("未注册的工具: " + tc.name()));
  sink.next(buildToolResultChunk(tc, execResult, request.requestId()));  // 再发 result
  ...
}
```

而 `BailianChatCaller.call(...)` 是 **阻塞读百炼 SSE 流**。LLM 返回完 `tool_calls`(sync emit `tool_call` chunk) 后,我们把工具结果回填给 LLM 进行下一次调用——这一次百炼调用如果 IO 异常(Connection reset/timeout),**重抛 IOException 之前**已经发出的 `tool_call` 永远没人给它补 `tool_result` chunk。

### 修复

在 `AgentReActExecutorImpl.runReactLoop` 的异常路径里:**给当前所有 phase=call 的步骤补发失败 tool_result**。

```java
} catch (Throwable t) {
  // 1) 找到仍在 call 阶段的步骤,补一条失败 result
  List<BailianChatCaller.ToolCallInfo> unfinished = ...;
  for (BailianChatCaller.ToolCallInfo tc : unfinished) {
    sink.next(buildToolResultChunk(tc, ToolExecutor.ToolResult.fail(
        "工具调用被中断: " + t.getMessage()), requestId));
  }
  // 2) 然后再 emit error chunk
  sink.next(buildErrorChunk(t, requestId));
  sink.complete();
}
```

或者更简单:在工具执行包一层 try-catch,保证无论后续 LLM 调用是否成功,**单条工具的 result 一定发出**:

```java
for (BailianChatCaller.ToolCallInfo tc : callResult.toolCalls()) {
  searchCount.incrementAndGet();
  sink.next(buildToolCallChunk(tc, request.requestId()));
  ToolExecutor.ToolResult execResult;
  try {
    execResult = toolRegistry.get(tc.name()).map(exec -> exec.execute(tc.arguments()))
        .orElse(ToolExecutor.ToolResult.fail("未注册的工具: " + tc.name()));
  } catch (Throwable ex) {
    execResult = ToolExecutor.ToolResult.fail("工具执行异常: " + ex.getMessage());
  }
  sink.next(buildToolResultChunk(tc, execResult, request.requestId()));  // 始终发出
  ...
}
```

### 验收点

1. LLM 第一次返回 tool_calls 并执行完 KB 检索后,即便第二次 LLM 调用 IO 异常,前端仍能看到所有 KB 检索都是 ✓ 10 条结果
2. ToolCallProgress 不再出现「0 执行中 / 6 已完成 + 1 个永转圈」的情况

---

## 测试

修改后跑一次手动 curl,确认 SSE 输出不再带 `errorCode: AI_TOOL_FAIL`(若 LLM IO 仍通的情况下不应该有 error chunk);断网情况下应该看到 `errorCode: AI_INTERNAL` 或 `errorCode: 连接超时类`。

```bash
# 正常情况:不应出现 AI_TOOL_FAIL
curl -N -X POST http://192.168.124.151:8101/api/wk/ai/agent/chat-stream \
  -H "Content-Type: application/json" -H "token: ..." \
  -d '{"messages":[{"role":"user","content":"..."}],"bizParams":{"promptKey":"answer_assistant"},"tools":{"enableKbSearch":true,"enableWebSearch":false,"enableThinking":false}}' \
  | grep -E "errorCode|type" | head
```

期望:**无 `errorCode=AI_TOOL_FAIL` 行**(除非真的工具抛错)。

---

## 前端已就位

前端 ToolCallProgress 已经把 `errorCode` 作为 prop 接收并显示对应中文文案;P2 也加了「已中断(无响应)」标识(`phase=call && !loading` 时显示)。你这次修完之后无需再改前端,直接看 ToolCallProgress 顶部红条和 ✅/❌ 变化即可:

| errorCode | 中文文案 |
|-----------|---------|
| `AI_TOOL_FAIL` | 知识库/联网工具调用失败 |
| `AI_AUTH_FAIL` | AI 服务认证失败 |
| `AI_QUOTA_EXCEED` | AI 服务额度已用完 |
| `AI_RATE_LIMIT` | 请求过快 |
| `AI_INTERNAL` | AI 服务异常 |

完成 P0 + P2 修复后回贴一下「IO 异常处理 已通过」即可。
