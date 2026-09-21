---
file: 2026-07-15-backend-review-by-qoder.md
version: 1.0
type: code-review
project: wk-train-center
auditor: Qoder(AI 审,不动代码)
target: 后端 Claude 写的 AI Agent 网关(M1.0)
status: PENDING-OWNER-FIX
createdAt: 2026-07-15
lastUpdated: 2026-07-15
relatedPlan: ../tasks/2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md
relatedDesign: ../design/2026-07-14-self-ai-gateway(claude)/2026-07-15-student-frontend-migration(claude).md
---

# 后端 M1.0 自审问题清单(Qoder → Claude)

> **审阅范围**: wk-module-ai 模块下所有 Claude 新增/改动的文件
> **审阅日期**: 2026-07-15
> **审阅定位**: 只审不改,问题清单给 Claude 处理
> **优先级**: P0(必须修)/ P1(尽快修)/ P2(顺手清)

---

## P0 — 联调前必须修

### P0-1 端点 URL 走 Maas 模式未实测

**文件**: `wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/react/BailianChatCaller.java`
**位置**: line 72-73(常量)+ line 118(运行时拼 URL)

```java
private static final String BAILIAN_CHAT_COMPLETIONS_URL_TEMPLATE =
        "https://%s.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions";
```

**问题**:
- D37 决策改用 Maas 模式,但**未经生产 workspaceId 实测**
- Maas 模式的鉴权可能是 `accessKeyId + accessKeySecret`(从 OSS cfg 读),而不是 `Authorization: Bearer ${apiKey}`(line 122)
- 我之前用 demo key 测的是 `dashscope.aliyuncs.com` 公有云,**Maas 私有域名的鉴权方式不一定相同**

**建议**:
1. 先用真实 workspaceId 跑一次 curl,确认 Maas 模式能用 apiKey 鉴权
2. 如果 Maas 要求 OSS accessKey,改用 `getAccessKeyId()` + `getAccessKeySecret()`
3. 实在不行降级回 `dashscope.aliyuncs.com`

---

### P0-2 HTTP 错误码全归 ERROR_INTERNAL

**文件**: `BailianChatCaller.java` line 281(在 `buildErrorChunk`)

```java
private static AgentChatChunkVo buildErrorChunk(String msg, String requestId) {
    return AgentChatChunkVo.builder()
            .type(AiGatewayConstants.CHUNK_TYPE_ERROR)
            .content(msg)
            .errorCode(AiGatewayConstants.ERROR_INTERNAL)  // ← 永远 INTERNAL
            ...
}
```

**问题**:
- 前端 [classifyStreamError](file:///e:/rhProject/wk-train-center-ui/src/api/ai/common.js#L1113-L1130) 按 errorCode 分 5 类提示
- 后端 HTTP 401/403/429/5xx 全被映射成 AI_INTERNAL,前端只能显示"AI 服务异常"
- 违背后端 AiGatewayConstants.ERROR_* 5 类设计

**建议**:
```java
// 按 HTTP 状态码映射 errorCode
private static String mapHttpErrorCode(int status) {
    if (status == 401 || status == 403) return ERROR_AUTH_FAIL;
    if (status == 429) return ERROR_RATE_LIMIT;
    if (status >= 500) return ERROR_INTERNAL;
    return ERROR_INTERNAL;
}
```

---

### P0-3 KB 检索鉴权从 apiKey 改成 OSS 双 key 未实测

**文件**: `KnowledgeBaseSearchTool.java` line 129-135(D38 决策)

```java
String accessKeyId = agentConfigService.getAccessKeyId();
String accessKeySecret = agentConfigService.getAccessKeySecret();
Config config = new Config()
        .setAccessKeyId(accessKeyId)
        .setAccessKeySecret(accessKeySecret)
        .setEndpoint("bailian.cn-beijing.aliyuncs.com")
        .setType("access_key");
```

**问题**:
- 原 `BailianService.retrieve()` 用 `apiKey` 当 `accessKeyId` AND `accessKeySecret`(简单粗暴)
- D38 改用 cfg 里真实的 OSS accessKeyId + accessKeySecret
- **百炼 OpenAPI 客户端 SDK 是否接受 OSS 凭据?两套凭据体系可能不通用**
- 如果 OSS 凭据跑不通,KB 检索会全失败

**建议**:
1. 准备一组 OSS accessKeyId/accessKeySecret,跑一次 retrieve
2. 跑不通时降级:用 apiKey 兼容(就像原来的 `BailianService.retrieve`)

---

## P1 — 尽快修

### P1-1 WebSearchTool 是空壳

**文件**: `WebSearchTool.java` line 70-86

```java
@Override
public ToolResult execute(JsonNode arguments) {
    // ...
    return ToolResult.ok("(联网搜索由百炼内置完成,结果已通过 tool_calls 回填)", List.of());
}
```

**问题**:
- Chat Completions API 的 function-calling **需要 Java 端真执行工具**
- 注释说"百炼 LLM 在 Chat Completions 调用时自动识别 web_search 工具"——**未经实测**
- 如果 glm-5.2 没有百炼内置 web_search,链路会断:LLM 调 web_search → Java 端返回假结果 → LLM 用假结果继续 → 答非所问

**建议**:
1. 实测:问"最新的 SOLAS 公约修订",看是否真的返回了网络内容
2. 如果 glm-5.2 不内置 web_search,改用 Tavily(参考 demo)

---

### P1-2 限流语义错(yml 写 20s,代码是"请求进行中锁")

**文件**:
- `application-ai.yml` line 69: `rate-limit-seconds: 20`
- `WkAiAgentController.java` line 80-86 + 151

```java
// 限流判定
String rateKey = "ai:agent:chat-stream:" + userId;
if (redisService.hasKey(rateKey)) { /* 限流 */ }
redisService.set(rateKey, rateKey, 20L);
// ...
.doFinally(sig -> redisService.del(rateKey));  // 请求结束立刻 del
```

**问题**:
- 注释承诺 20s 频率限制,实际是"同一用户并发请求互斥锁"
- 两个串行短请求不受限;一个长请求 + 并发短请求 → 短请求被锁
- yml 里的 `rate-limit-seconds` 形同虚设(没被读)

**建议**:
- 选 A(改语义):yml 改 `concurrent-lock: true`,注释明确"防并发"
- 选 B(改实现):去掉 doFinally 的 del,让 TTL = 20s 真的生效

---

### P1-3 AgentReActExecutorImpl Throwable 错误码全归 INTERNAL

**文件**: `AgentReActExecutorImpl.java` line 215-222

```java
private AgentChatChunkVo buildErrorChunk(Throwable e, String requestId) {
    return AgentChatChunkVo.builder()
            .type(...).content(e.getMessage())
            .errorCode(AiGatewayConstants.ERROR_INTERNAL)  // ← 永远 INTERNAL
            ...
}
```

**问题**:
- 工具执行抛异常应该是 ERROR_TOOL_FAIL
- 与前端契约 5 类错误码不符

**建议**:
- 工具执行异常 → ERROR_TOOL_FAIL
- 通用兜底 → ERROR_INTERNAL

---

### P1-4 搜索上限错误用了 ERROR_RATE_LIMIT

**文件**: `AgentReActExecutorImpl.java` line 224-231

```java
private AgentChatChunkVo buildErrorChunk(String msg, String requestId) {
    return ... .errorCode(AiGatewayConstants.ERROR_RATE_LIMIT)  // ← 错
}
```

**问题**:
- "搜索次数已达上限"是工具问题,不是频率问题
- 前端会提示"提问太频繁" — 用户困惑

**建议**: 改 ERROR_TOOL_FAIL

---

## P2 — 顺手清

### P2-1 全文件 `@author Qoder` 应改 Claude

**文件**: 所有 wk-module-ai 新增的 .java 文件

`AgentChatChunkVo`, `AgentChatRequestDto`, `WkAiAgentController`, `AiGatewayConstants`, `AiAgentProperties`, `AiAgentConfig`, `AgentConfigService`(+Impl), `ToolExecutor`, `KnowledgeBaseSearchTool`, `WebSearchTool`, `ToolRegistry`, `AgentReActExecutor`(+Impl), `BailianChatRequest`, `BailianChatCaller`

**问题**: 主人原话"我让claude重新编写了",但 `@author` 全是 Qoder。署名与实际不符

**建议**: 批量改 `@author Qoder` → `@author Claude`

---

### P2-2 注释带情绪(指责 Qoder 越界)

**文件**:
- `application-ai.yml` line 11: `# Qoder 之前擅自改 qwen3.6-plus 是错的,已改回`
- `AiGatewayConstants.java` line 135: `# Qoder 之前改的 qwen3.6-plus 是错误的(擅自改主人口径),已改回`

**问题**: 事实是主人 D27 决策后改回 glm-5.2,不是 Qoder 擅自改后被纠正。注释带情绪

**建议**: 改成中性表述:
```yaml
# 2026-07-15 决策:从 qwen3.6-plus 改回 glm-5.2(主人 D27 拍板)
# glm-5.2 在 Chat Completions API 完全可用 + 支持 function-calling + web_search 内置
```

---

### P2-3 Stale 文档注释(3 处)

| 文件:行 | 当前内容 | 应改为 |
|---|---|---|
| `application-ai.yml` line 62 | `# 当前轮使用百炼自跑 ReAct(Responses API tools 数组)` | `# 当前轮使用 Java 端手写 ReAct(Chat Completions API + function-calling)` |
| `BailianChatRequest.java` line 17 | `glm-5.2 不可用,qwen3.6-plus 可用` | `glm-5.2 在 Chat Completions API 完全可用(2026-07-15 实测)` |
| `BailianChatCaller.java` line 37 | `(实测 qwen3.6-plus):` | `(实测 glm-5.2, 2026-07-15):` |

---

### P2-4 BailianChatCaller 无中断检查

**文件**: `BailianChatCaller.java` (整个 SSE 读取循环)

**问题**: 客户端断开(emitter cancel)后,Java 端会继续读流到服务端 EOF,浪费资源

**建议**:
```java
while ((line = reader.readLine()) != null) {
    if (sink.isCancelled()) {
        log.info("[BailianChat] 客户端断开,停止读取 requestId={}", requestId);
        break;
    }
    // ...
}
```

---

### P2-5 每次 KB 检索都重读 cfg

**文件**: `KnowledgeBaseSearchTool.java` line 129-130

**问题**: 一次 ReAct 循环调 2 次 KB,每次都调 4 次 cfg 读(workspaceId + 2×accessKey + vectorStoreId × 2)

**建议**:
- `kbList` 已在构造函数 cache,但 accessKey 没有 cache
- 构造函数 cache accessKeyId/accessKeySecret 即可(同 workspaceId,变更频率低)

---

## 待 Claude 实测验证的 4 件事

1. **Maas 端点 + apiKey 鉴权** 是否能跑通(P0-1 依赖)
2. **OSS accessKeyId/accessKeySecret 调百炼 OpenAPI retrieve** 是否能跑通(P0-3 依赖)
3. **glm-5.2 + web_search 工具** 是百炼内置还是需要 Java 端真做(P1-1 依赖)
4. **errorCode 实际下发的值** 与前端契约对齐(P0-2 验证)

---

## 优先级总览

| 优先级 | 数量 | 状态 |
|---|---|---|
| P0 联调前必修 | 3 | 待 Claude 处理 |
| P1 尽快修 | 4 | 待 Claude 处理 |
| P2 顺手清 | 5 | 可后置 |
| 待实测验证 | 4 | 待 Claude 跑通 |

---

## 附:前端契约对照表(供 Claude 核对)

| 后端字段 | 前端期望 | 一致? |
|---|---|---|
| `POST /api/wk/ai/agent/chat-stream` | 同 | ✅ |
| 请求体 `messages`(必填) | 同 | ✅ |
| 请求体 `tools.{enableKbSearch,enableWebSearch,enableThinking}` | 同 | ✅ |
| 请求体 `bizParams.{promptKey,model}` | 同 | ✅ |
| 12 种 chunk type | 同 | ✅ |
| 5 种 errorCode | `AI_AUTH_FAIL / AI_QUOTA_EXCEED / AI_TOOL_FAIL / AI_RATE_LIMIT / AI_INTERNAL` | ⚠️ 实现错(P0-2) |
| SSE `data: {json}\n\n` 格式 | 同 | ✅(SseEmitter) |
| `requestId` 字段 | 前端用于日志关联 | ✅ |

---

**审计**: Qoder(AI 审,不动代码)
**处理方**: Claude(后端)
**验收**: 主人
