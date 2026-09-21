# 后端 M1.0 待 Claude 修复的问题清单

> **Qoder 审 → Claude 改**(2026-07-15)
> 完整审阅记录见: `reviews/2026-07-15-backend-review-by-qoder.md`
> 当前任务: 修 P0 → 实测验证 → 修 P1 → 顺手清 P2

---

## 必读（先理解上下文）

- 主人 2026-07-15 拍板: **默认模型 = `glm-5.2`**,走 **Chat Completions API** + **Java 端手写 ReAct 循环**(demo 模式)
- Qoder 之前把 `qwen3.6-plus` 写进 Constants/yml 是错的(擅自改主人口径),已改回
- glm-5.2 不支持 Responses API(报 "Unsupported model"),但 Chat Completions API 完美支持 function-calling + enable_thinking
- 5 类错误码契约必须严格遵守,前端 `classifyStreamError` 按 errorCode 区分提示

---

## P0 联调前必修(4 条)

### P0-1 端点 URL 走 Maas 模式未实测

**文件**: `wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/react/BailianChatCaller.java` line 72-73, 118

**现状**:
```java
private static final String BAILIAN_CHAT_COMPLETIONS_URL_TEMPLATE =
        "https://%s.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions";
```

**问题**:
- D37 决策改 Maas 模式,但鉴权方式可能不匹配(可能需 `accessKeyId + accessKeySecret` 而非 `Bearer ${apiKey}`)
- 生产 workspaceId 跑通与否未验证

**待 Claude**:
1. 用真实 workspaceId 跑 curl,确认 Maas 模式 + apiKey 鉴权能通
2. 不通则改用 `getAccessKeyId() + getAccessKeySecret()`
3. 实在不行降级回 `dashscope.aliyuncs.com`

---

### P0-2 HTTP 错误码全归 INTERNAL

**文件**: `BailianChatCaller.java` line 281

**现状**:
```java
private static AgentChatChunkVo buildErrorChunk(String msg, String requestId) {
    return AgentChatChunkVo.builder()
            .type(...).content(msg)
            .errorCode(AiGatewayConstants.ERROR_INTERNAL)  // 永远 INTERNAL
            ...
}
```

**问题**: 401/403/429/5xx 全被映射成 INTERNAL,前端 `classifyStreamError` 永远显示"AI 服务异常",5 类错误码契约失效

**待 Claude**: 按 HTTP 状态码映射:
```java
private static String mapHttpErrorCode(int status) {
    if (status == 401 || status == 403) return ERROR_AUTH_FAIL;
    if (status == 429) return ERROR_RATE_LIMIT;
    return ERROR_INTERNAL;
}
```
在 `if (!response.isSuccessful())` 分支里调用 `mapHttpErrorCode(response.code())` 传入 `buildErrorChunk`

---

### P0-3 KB 鉴权换 OSS 双 key 未实测

**文件**: `KnowledgeBaseSearchTool.java` line 129-135

**现状**:
```java
String accessKeyId = agentConfigService.getAccessKeyId();
String accessKeySecret = agentConfigService.getAccessKeySecret();
Config config = new Config()
        .setAccessKeyId(accessKeyId)
        .setAccessKeySecret(accessKeySecret)
        .setEndpoint("bailian.cn-beijing.aliyuncs.com")
        .setType("access_key");
```

**问题**: D38 改用 OSS 双 key,但百炼 OpenAPI SDK 是否接受 OSS 凭据未验证

**待 Claude**:
1. 准备一组 OSS accessKeyId/accessKeySecret 跑 retrieve
2. 不通则降级:用 `apiKey` 兼容(像原 `BailianService.retrieve` 一样)

---

### P0-4 tool_result 漏发 kbLabel 导致前端 KB 来源标识不显示

**文件**:
- `ToolExecutor.java` `ToolResult` record
- `KnowledgeBaseSearchTool.java` `execute()` 内 `ToolResult.ok(...)` 调用处
- `AgentReActExecutorImpl.java` `buildToolResultChunk()` line 193-208

**问题**:
- 前端 [chatSession.js L302](file:///e:/rhProject/wk-train-center-ui/src/views/web/ai/components/AiAssistant/shared/chatSession.js) 从 `tool_result` 读 `kbLabel` 字段,聚合到 `msg.citations` 上,`CitationList` 用这个字段在引用项右侧显示 KB tag(D29 决策)
- 当前后端 `buildToolResultChunk` emit 的 resultMap 只有 `id/name/success/results/error` 5 个字段,**没有 `kbLabel`**
- 全 wk-module-ai 代码 `grep kbLabel` 命中 **0 处** — 后端从来没下发过这个字段
- 结果:学员端 KB 来源标识(培训知识库/工务知识库)永远不显示

**待 Claude**(3 处改动):
1. `ToolExecutor.java` `ToolResult` record:加 `String kbLabel` 字段(放在 `errorMessage` 后面)
2. `KnowledgeBaseSearchTool.java` `execute()` 的 for-each kb 循环:把 `ToolResult.ok(content, mergedResults)` 改成 `ToolResult.ok(content, mergedResults, kb.label())` 带上 KB 名(培训知识库/工务知识库)
3. `AgentReActExecutorImpl.java` `buildToolResultChunk()`:在 resultMap 加 `resultMap.put("kbLabel", result.kbLabel())`

**优先级**:P0(跟 P0-1/2/3 一起改,联调前必修)

**验证方法**:
- 跑一次 KB 检索,curl 看 SSE 输出 `event: tool_result\ndata: {...}` 里的 JSON 有 `"kbLabel":"培训知识库"` 或 `"工务知识库"` 字段
- V5 项加到实测清单

---

## P1 尽快修(4 条)

### P1-1 WebSearchTool 是空壳

**文件**: `WebSearchTool.java` line 70-86

**现状**: `execute()` 直接 return `(联网搜索由百炼内置完成)`,Java 端没真做搜索

**问题**: Chat Completions API 的 function-calling 需要 Java 端真执行工具;如果 glm-5.2 没有百炼内置 web_search,LLM 拿到假结果后会用假结果继续

**待 Claude**:
1. 实测:问"最新的 SOLAS 公约修订",看是否真返回了网络内容
2. 不内置则改用 Tavily(参考 demo `ReActA1.js:88-105`)

---

### P1-2 限流语义错(yml 20s vs 代码"请求进行中锁")

**文件**:
- `application-ai.yml` line 69: `rate-limit-seconds: 20`
- `WkAiAgentController.java` line 80-86, 151

**现状**:
```java
String rateKey = "ai:agent:chat-stream:" + userId;
if (redisService.hasKey(rateKey)) { /* 限流 */ }
redisService.set(rateKey, rateKey, 20L);
// ...
.doFinally(sig -> redisService.del(rateKey));  // 请求结束立刻 del
```

**问题**: yml 写 20s 频率限制,实际是"防并发"锁

**待 Claude 二选一**:
- **A 改语义**: yml 改 `concurrent-lock: true`,注释明确
- **B 改实现**: 去掉 doFinally 的 del,让 TTL = 20s 真的生效

---

### P1-3 Throwable 错误码全归 INTERNAL

**文件**: `AgentReActExecutorImpl.java` line 215-222

**现状**:
```java
private AgentChatChunkVo buildErrorChunk(Throwable e, String requestId) {
    return ... .errorCode(AiGatewayConstants.ERROR_INTERNAL)  // 永远 INTERNAL
}
```

**问题**: 工具执行抛异常应该是 ERROR_TOOL_FAIL

**待 Claude**:
- 工具执行异常 → ERROR_TOOL_FAIL
- 通用兜底 → ERROR_INTERNAL

---

### P1-4 搜索上限错误用了 ERROR_RATE_LIMIT

**文件**: `AgentReActExecutorImpl.java` line 224-231

**现状**: `buildErrorChunk(String msg, ...)` 永远用 `ERROR_RATE_LIMIT`

**问题**: "搜索次数已达上限"是工具问题,不是频率问题;前端会提示"提问太频繁"

**待 Claude**: 改 ERROR_TOOL_FAIL

---

## P2 顺手清(5 条)

### P2-1 全文件 `@author Qoder` 应改 Claude

所有 wk-module-ai 新增的 .java 文件 `@author` 标错。批量改 `@author Qoder` → `@author Claude`

涉及: `AgentChatChunkVo`, `AgentChatRequestDto`, `WkAiAgentController`, `AiGatewayConstants`, `AiAgentProperties`, `AiAgentConfig`, `AgentConfigService`(+Impl), `ToolExecutor`, `KnowledgeBaseSearchTool`, `WebSearchTool`, `ToolRegistry`, `AgentReActExecutor`(+Impl), `BailianChatRequest`, `BailianChatCaller`

### P2-2 注释带情绪

`application-ai.yml` line 11 + `AiGatewayConstants.java` line 135 有 "Qoder 之前擅自改 qwen3.6-plus 是错的,已改回" 这种情绪化措辞

**待 Claude**: 改成中性:
```yaml
# 2026-07-15 决策:从 qwen3.6-plus 改回 glm-5.2(主人 D27 拍板)
# glm-5.2 在 Chat Completions API 完全可用 + 支持 function-calling + web_search 内置
```

### P2-3 Stale 文档注释(3 处)

| 文件:行 | 当前 | 应改为 |
|---|---|---|
| `application-ai.yml` line 62 | `# 当前轮使用百炼自跑 ReAct(Responses API tools 数组)` | `# 当前轮使用 Java 端手写 ReAct(Chat Completions API + function-calling)` |
| `BailianChatRequest.java` line 17 | `glm-5.2 不可用,qwen3.6-plus 可用` | `glm-5.2 在 Chat Completions API 完全可用(2026-07-15 实测)` |
| `BailianChatCaller.java` line 37 | `(实测 qwen3.6-plus):` | `(实测 glm-5.2, 2026-07-15):` |

### P2-4 BailianChatCaller 无中断检查

SSE 读取循环里加 `if (sink.isCancelled()) break;`,客户端断开后停止读流

### P2-5 每次 KB 检索都重读 cfg

`KnowledgeBaseSearchTool` 构造函数 cache `accessKeyId`/`accessKeySecret`,避免每次 retrieve 都查 cfg(同 workspaceId 变更频率低)

---

## 5 件事必须实测验证(不实测不要标 done)

| 编号 | 验证项 | 依赖 |
|---|---|---|
| V1 | Maas 端点 + apiKey 鉴权能跑通 | P0-1 |
| V2 | OSS accessKeyId/accessKeySecret 调百炼 OpenAPI retrieve 能跑通 | P0-3 |
| V3 | glm-5.2 + web_search 工具是百炼内置(实测问"最新 SOLAS"看是否返回网络内容) | P1-1 |
| V4 | errorCode 实际下发的值(401/429/工具失败/上限)与前端契约一致 | P0-2, P1-3, P1-4 |
| V5 | tool_result emit 的 JSON 含 `kbLabel` 字段(curl 看 SSE data 行) | P0-4 |

---

## 验收

- P0 全过(4 条) + 5 项实测全通 → 联调
- P1 改完后标 done
- P2 提交时一并改了就行
- 改完在 `reviews/2026-07-15-backend-review-by-qoder.md` 上把状态推进(可建一个 `2026-07-15-claude-fix-log.md` 记录每条处理结果)
