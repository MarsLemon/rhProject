# 后端 M1.0 待 Claude 修复的问题清单（第二轮）

> **Qoder 审 → Claude 改**（2026-07-15 第二轮）
> 
> 完整审阅记录见：`reviews/2026-07-15-backend-review-by-qoder.md`

---

## 必读（上下文）

- 默认模型 = `glm-5.2`（主人拍板）
- 走 **Chat Completions API** + **Java 端手写 ReAct 循环**（demo 模式）
- 第一轮问题（P0-1 到 P0-4）见：`2026-07-15-backend-issues-for-claude.md`

---

## P1 必修（3 条）

### P1-1 ✅ 限流 key 释放时机问题

**文件**：`wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/WkAiAgentController.java`
**位置**：第 151-154 行

**现状**：
```java
.doFinally(sig -> {
    redisService.del(rateKey);  // 限流 key 释放
})
```

**问题**：`doFinally` 只在 Flux 正常完成后释放。如果 `agentReActExecutor.execute()` 同步抛异常（key 在 subscribe 之前就失败），限流 key 不会被释放。用户可能被永久限流。

**修复建议**：
```java
} catch (Exception e) {
    log.error("[WkAiAgent] chatStream 异常 requestId={}", requestId, e);
    redisService.del(rateKey);  // 同步异常也要释放 key
    sendErrorAndComplete(emitter, requestId, AiGatewayConstants.ERROR_INTERNAL, e.getMessage());
}
```
同时 `doFinally` 里保留 try-catch 兜底释放。

---

### P1-2 ✅ 冗余 import 未使用

**文件**：`wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/react/AgentReActExecutorImpl.java`
**位置**：第 4 行

**修复**（✅ 已删）：`import com.yf.base.utils.jackson.JsonHelper;` 已删除。

---

### P1-3 ✅ 多 KB 场景 kbLabel 简化说明

**文件**：`wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/impl/AgentConfigServiceImpl.java`
**位置**：第 101 行 `getKnowledgeBases()`

**修复**（✅ 已改）：KB 配置改为从 `type=bailian_kb, provider=default` 单条记录读：
- `data.trainingVectorStoreId` → 培训 KB
- `data.gongwuVectorStoreId` → 工务 KB

**数据库**：`el_cfg_prop` 表 `type=bailian_kb, provider=default` 已有这两个字段 ✅

---

## P2 顺手清（1 条）

### P2-1 ✅ SseEmitter 空指针警告

**文件**：`wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/WkAiAgentController.java`
**位置**：第 147 行

**修复**（✅ 已加）：`String type = chunk.getType(); if (type != null)` 非空校验。
```java
String type = chunk.getType();
if (type != null) {
    emitter.send(SseEmitter.event().name(type).data(chunk));
}
```

---

## 任务9进度同步（Qoder 前端 v2 AI 问答改造）

> **实施**: Qoder(B) | **估时**: 2d | **依赖**: 任务8(后端)

### 9.1 改动范围

| 文件 | 改动说明 |
|------|----------|
| `wk-train-center-ui/src/api/ai/common.js` | 新增 `chatAgentStream`/`classifyStreamError`/`isAgentGatewayEnabled`/`buildAgentRequestPayload` |
| `wk-train-center-ui/src/api/ai/apps.js` | `AI_APPS` 加 `promptKey` 字段 |
| `wk-train-center-ui/src/views/web/ai/components/AiAssistant/conversation/infrastructure/chatStreamGateway.js` | 网关重写，灰度路由 |
| `wk-train-center-ui/src/views/web/ai/components/AiAssistant/shared/chatSession.js` | 错误处理 + toolSteps 聚合 + kbLabel 兜底 |
| `wk-train-center-ui/src/views/web/ai/components/AiAssistant/components/AiMessageMeta.vue` | **新增** 工具调用可视化组件 |
| `wk-train-center-ui/src/views/web/ai/components/AiAssistant/components/CitationList.vue` | KB tag 展示 |
| `wk-train-center-ui/src/views/web/ai/components/AiAssistant/AiMessageList.vue` | 集成 AiMessageMeta |

### 9.2 已修复 P0（3 条，Claude 提）

| # | 问题 | 修复 |
|---|------|------|
| P0-1 | SSE 解析丢 `event:` 字段 | 前端 SSE 解析同时读 `event:` 和 `data:` 两行 |
| P0-2 | 错误分类兜底失效 | 改为 `err && err.errorCode \|\| err && err.code \|\| 'AI_INTERNAL'` |
| P0-3 | 多余 `X-DashScope-SSE` header | 删除该 header |

### 9.3 已修复（Vue 2 语法）

Vue 2 项目不能用 `?.` / `??` ES2020+ 语法，全部改用 `&&` 模式。

### 9.4 待验收（联调时验证）

| # | 测试项 |
|---|--------|
| 1 | Network 是 `/api/wk/ai/agent/chat-stream` |
| 2 | 12 type 事件消费 |
| 3 | `type=citation` 引用源列表展示 |
| 4 | 多轮对话消息历史 |
| 5 | 灰度开关切回老链路 |

### 9.5 kbLabel 多 KB 问题（前端兜底）

后端 P1-3 多 KB 只返回第 1 个 KB 的 label，前端加兜底：`kbLabel: r.kbLabel \|\| step.kbLabel`

---

## 验收

- P1 全修（3 条）+ P2 顺手清（1 条）
- 修完后在原 `reviews/2026-07-15-backend-review-by-qoder.md` 状态栏推进
