---
version: 1.0.0
project: wk-train-center
taskType: unified-plan
status: PENDING-OWNER-APPROVAL
createdAt: 2026-07-14T17:00:00+08:00
lastUpdated: 2026-07-14T18:00:00+08:00
tags:
  - ai-gateway
  - refactor
  - unified-plan
  - qoder-claude
owners:
  - 主人(拍板/验收)
  - Claude(起草+后端实施)
  - Qoder(起草+前端实施)
supersedes:
  - tasks/2026-07-14-self-ai-gateway(claude).md
  - tasks/2026-07-14-ai-agent-gateway-v2-h5-migration(qoder).md
supersededAt: 2026-07-14T17:00:00+08:00
collaboration:
  pattern: 双 agent 联合 + 主人拍板
  coordinationFile: tasks/2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md
  rule: 任何一方不再修改对方文件，本文件为唯一权威
---

# 自建 AI 业务网关 — 统一计划（v1.0 / qoder & claude 联合 / 2026-07-14）

> **状态**:三方共识版本,**待主人最终拍板**。
> **协作约定**:**不再交叉修改各自文件**,本文件为唯一权威。任何修订直接落到本文件,其他两份 v1 文件全部作废(已加 `SUPERSEDED` 标记)。
> **范围**:v2 前端(`wk-train-center-ui`)+ H5 移动端(`wk-mhc-mobile`)的 AI 智能体调用,从直连阿里云百炼迁移到自建后端业务网关。

---

## 1. 核心架构决策(2026-07-14 主人拍板)

| # | 决策 | 内容 | 来源 |
|---|---|---|---|
| **D1** | 流式模型 | **WebFlux `Flux<String>` → Spring MVC `SseEmitter`** | 不引 webflux 依赖,项目主流一致 |
| **D2** | 百炼调用模式 | **废"智能体应用"模式,改"纯模型 + 自建 ReAct"** | 后端调 `/compatible-mode/v1/chat/completions`;system prompt 后端 yml 管;tools 后端自建;ReAct 本期就做 |
| **D3** | 配置中心 | **沿用现有 `ai` type,不动基础,新增 `ai-agent` 段** | 尊重现有配置中心,不破坏 `CfgPropService` |
| **D4** | 网关 ID 抽象 | **废除 appId/appKey**,前端传 `promptKey` + 可选 `model` | D2 衍生,纯模型不需要百炼 App 身份 |
| **D5** | 阶段切分 | **不分阶段,一次性 12 任务做透** | 废 Claude 原 M1~M4 4 阶段、Qoder 原"阶段一/阶段二" |
| **D6** | v3 端范围 | **本期不动 v3**,留待 P1 | 主人原话"v2 和移动端 h5",v3 后续另议 |
| **D7** | 出题 appKey | **P2(本期不动)** | 出题是管理端,流量小 |
| **D8** | 路径风格 | `/api/wk/ai/agent/chat-stream`(沿用本仓 `/api/wk/...` 前缀) | 与现有 `WkAiAgentController` 风格一致 |
| **D9** | 调试台范围 | M1 加极简 Playground(任务 16),聚焦 KB + WebSearch;**不做**智能体/工作流/插件市场 | 主人 §13.10 |
| **D10** | WebSearch provider | **M1 用阿里云百炼联网搜索**(统一鉴权 + 多轮搜索支持);Bocha/Tavily 备选 M2 加 | 主人 §13.11 |
| **D11** | WebSearch API Key | **百炼联网搜索复用公用 API Key**,不独立配 | 主人 §13.12 |
| **D12** | WebSearch 实现 | **百炼模型内置**(responses API tools 数组),我们只做 passthrough;**ReAct 工具列表含 web_search + knowledge_base_search**;多轮搜索由 LLM 决定 | MCP 文档验证 |
| **D13** | 默认模型 | **`qwen3.6-plus`**;`qwen3-max` / `qwen3-plus` 备选;`glm-4.6` 暂留 yml 注释"本期不用" | 主人 §13.13 |
| **D14** | 备选模型 | `glm-4.6` 留 yml 注释,本期不用 | 主人 §13.13 |
| **D15** | ReAct 架构 | **百炼自跑 ReAct**(responses API tools 数组);我们只透传 `response.output` | MCP 文档 |
| **D16** | KB 工具 | 用百炼 `file_search` 工具,`vector_store_ids` 必传(单值) | MCP 文档 |
| **D17** | 工具组合 | `web_search` + `web_extractor` 配套启用;`file_search` 独立启用 | MCP 文档 |
| **D18** | 输出原文开关 | 调试台 + 前端可控制是否输出原文(思考/工具调用/KB 原文/联网结果) | 主人 §13.15 |
| **D19** | 知识库 ID 概念 | **`vector_store_id`**(百炼控制台新概念),**废 `pipeline_id` 概念** | 修订 §13.1 |
| **D20** | M1 主目标 | **不只是做控制台**——M1 主目标是 **AI 问答 + AI 陪练** 业务功能(学员端);**控制台(任务 16)是底层基础,必做但不是主目标**;**多轮对话 + 知识库检索是重点优化** | 主人 §13.16 |
| **D21** | 实现形态 | **结合现有代码**(AI 问答 + AI 陪练老模块)+ **vue demo 形态**——做出"基于我们自己控制台的智能体应用" | 主人 §13.16 |

---

## 2. 百炼两套 API 模式对比(为什么 D2 是核心修正)

| 维度 | 模式 1:智能体应用(废弃) | 模式 2:模型调用(采用) |
|---|---|---|
| **端点** | `POST /api/v1/apps/{appId}/completion` | `POST /compatible-mode/v1/chat/completions` |
| **编排权** | 百炼控制台配 App | **后端自建** ReAct |
| **工具调用** | 百炼内部完成 | **后端自己**接 Tavily / KB |
| **system prompt** | 百炼 App 自带 | **后端 yml 管** |
| **RAG 检索** | 百炼内部 | **后端调** `BailianService.knowledgeBaseSearch` |
| **前端感知** | 透传百炼 chunk | **后端拆 8 类型** SSE 事件再发前端 |
| **vue demo 现状** | demo 不用此模式 | demo `ReActA1.js:182` 已用此模式 |

**证据**:vue 问答 demo 完全走模式 2,不依赖 AppId。本期与 demo 形态对齐。

---

## 3. 文件结构(本计划涉及的全部改动)

### 3.1 后端新增(Claude 负责)

| 路径 | 职责 |
|------|------|
| `wk-modules/wk-module-ai/.../controller/WkAiAgentController.java` | `POST /api/wk/ai/agent/chat-stream`,返回 `SseEmitter` |
| `wk-modules/wk-module-ai/.../controller/WkAiAgentExceptionHandler.java` | 统一异常 envelope |
| `wk-modules/wk-module-ai/.../controller/model/AgentChatChunkVo.java` | SSE chunk 8 类型 VO |
| `wk-modules/wk-module-ai/.../controller/model/AgentChatRequestDto.java` | 请求 DTO(无 appId) |
| `wk-modules/wk-module-ai/.../application/AgentConfigService.java` + impl | yml 配置中心(model + system prompt + tools) |
| `wk-modules/wk-module-ai/.../application/AgentReActExecutor.java` | ReAct 主循环(Java 重写 vue demo `ReActA1.js`) |
| `wk-modules/wk-module-ai/.../application/MessageChunkClassifier.java` | 百炼 chunk → 8 类型拆分(**M1 必做,禁 `type=raw`**) |
| `wk-modules/wk-module-ai/.../application/tool/ToolExecutor.java` | 工具接口 |
| `wk-modules/wk-module-ai/.../application/tool/ToolRegistry.java` | 工具注册表 |
| `wk-modules/wk-module-ai/.../application/tool/KnowledgeBaseSearchTool.java` | 接 `BailianService.knowledgeBaseSearch` |
| `wk-modules/wk-module-ai/.../application/tool/WebSearchTool.java` | 接 Tavily API |
| `wk-modules/wk-module-ai/src/main/resources/application-ai.yml` | `ai-agent` 配置段 |

### 3.2 后端修改(Claude 负责)

| 路径 | 变更 |
|------|------|
| `yf-ability/.../ai/utils/ChatMsgUtils.java` | 新增 `genPureModelReqJson(model, systemMsg, userMsg, tools, toolChoice, stream, enableThinking)` |
| `yf-ability/.../ai/utils/chat/ChatApiUtils.java` | 新增 `startChatStream(apiUrl, apiKey, payload, onChunk)` 流式方法,处理 `tool_calls` 增量累积 |
| **`yf-ability/.../ai/providers/bailian/BaiLianConfigServiceImpl.java`** | **不修改**(D2 决策,纯模型不走 provider 抽象) |

### 3.3 前端修改(Qoder 负责)

| 路径 | 变更 |
|------|------|
| `wk-train-center-ui/src/api/ai/common.js` | 新增 `chatAgentStream(options, callbacks, signal)`,`chatAppStream` 内部转发,保留 `localStorage('ai:useAgentGateway')` 切流 |
| `wk-train-center-ui/src/views/web/ai/components/AiAssistant/conversation/infrastructure/chatStreamGateway.js` | 改走 `chatAgentStream`,**删除 `extractAppTextFromChunk` 调用** |
| `wk-train-center-ui/src/views/web/ai/components/AiAssistant/views/AiAssistant.vue` | catch 块接 `classifyStreamError`,分类提示 |
| `wk-train-center-ui/src/views/web/ai/components/AiAssistant/conversation/presentation/AiMessageMeta.vue`(新增) | 思考折叠 + 引用角标 + 工具调用可视化 |
| `wk-mhc-mobile/src/pages/smart-training/api/ai/common.ts` | 新增 `callAgentChatStream` TypeScript 版 |
| `wk-mhc-mobile/src/pages/smart-training/composables/ai/useChatSession.ts` | 错误分类 + 中断保留 `fullText` |
| `wk-mhc-mobile/src/pages/smart-training/components/ai/CitationDrawer.vue`(新增) | 引用来源抽屉 |
| `wk-mhc-mobile/src/pages/smart-training/components/ai/TrainingAssistantView.vue` | 错误提示 + 加载骨架 + 重试按钮 |

---

## 4. SSE chunk 协议(8 种类型,前后端统一)

```json
{ "type": "content",      "delta": "...", "full": "..." }
{ "type": "thoughts",     "items": [...] }
{ "type": "tool_call",    "id": "...", "name": "knowledge_base_search", "args": {...} }
{ "type": "tool_result",  "id": "...", "name": "...", "results": [...] }
{ "type": "citations",    "items": [{"title":"...","url":"...","snippet":"..."}] }
{ "type": "file",         "items": [{"fileId":"...","url":"...","type":"image|file"}] }
{ "type": "error",        "errorCode": "AI_AUTH_FAIL|AI_QUOTA_EXCEED|AI_TOOL_FAIL|AI_INTERNAL|AI_RATE_LIMIT", "content": "...", "fallback": false }
{ "type": "done" }
```

**请求体**:

```json
{
  "prompt": "用户当前问题",
  "messages": [{"role":"user|assistant|system","content":"...","fileList":["url"]}],
  "fileList": ["url1"],
  "tools": { "enableKbSearch": true, "enableWebSearch": true, "enableThinking": true },
  "bizParams": {
    "promptKey": "answer_assistant|training_assistant|quiz_generator",
    "model": "qwen3-max",
    "extra": {}
  }
}
```

**注意**:**无 appId/appKey**,`promptKey` 必传(后端查 yml 选 system prompt),`model` 可选(走 yml default)。

---

## 5. 配置模板(application-ai.yml)

```yaml
ai-agent:
  models:
    default: qwen3-max
    candidates: [qwen3-max, qwen-plus, glm-4.6]
  prompts:
    answer_assistant: |
      你是船舶设备与部件领域的资深答疑导师...（从 documents/AI任务拆分 抽取）
    training_assistant: |
      （陪练 prompt）
    quiz_generator: |
      （出题 prompt，本期不动）
  tools:
    knowledge_base_search:
      enabled: true
      timeout: 15s
    web_search:
      enabled: true
      providers:
        - name: bailian_web_search      # 阿里云百炼联网搜索(主人 D10 决策,2026-07-15)
          priority: 1
          # apiKey 不写 yml,走 CfgPropService type=ai provider=web_search(同 D3 决策)
      timeout: 15s
  react:
    max_iterations: 10
    max_search_count: 5
  rate_limit_seconds: 20
  sse_timeout_ms: 120000
```

---

## 6. 任务清单(12 个任务,不分阶段)

### 任务 1:统一 SSE chunk 协议 — Claude

**文件**: `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AgentChatChunkVo.java`

```java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AgentChatChunkVo {
    /** 8 种类型:content / thoughts / citations / tool_call / tool_result / file / error / done */
    private String type;
    private Object content;
    private List<Object> thoughts;
    private List<Map<String, Object>> citations;
    private Map<String, Object> toolCall;
    private Map<String, Object> toolResult;
    private List<String> files;
    private String errorCode;
    private String requestId;
}
```

Commit: `feat(ai): 统一 AI 网关 SSE chunk 协议(8 类型)`

---

### 任务 2:请求 DTO(废 appId) — Claude

**文件**: `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AgentChatRequestDto.java`

字段:`prompt`、`messages[]`(含 `fileList`)、`fileList`、`tools{enableKbSearch, enableWebSearch, enableThinking}`、`bizParams{promptKey, model, extra}`。**无 appId 字段**。

Commit: `feat(ai): 定义 AI 网关聊天请求 DTO(废 appId)`

---

### 任务 3:ChatApiUtils 支持百炼纯模型流式 — Claude

**文件**:
- 修改:`yf-ability/.../ai/utils/ChatMsgUtils.java`
- 修改:`yf-ability/.../ai/utils/chat/ChatApiUtils.java`
- **不修改**:`BaiLianConfigServiceImpl.java`

新增方法:

```java
// ChatMsgUtils
public static String genPureModelReqJson(String model, String systemMsg, String userMsg,
                                          List<Map<String, Object>> tools, String toolChoice,
                                          boolean stream, boolean enableThinking);

// ChatApiUtils
public static void startChatStream(String apiUrl, String apiKey, String jsonPayload,
                                    Consumer<Map<String, Object>> onChunk);
```

**关键技术点**:`tool_calls` 按 `index` 增量累积,参考 vue demo `ReActA1.js:447-490` 与项目记忆 `memory 86d5a6b2`(百炼 SSE 增量拼接规范)。

Commit: `feat(ai): ChatApiUtils 支持百炼纯模型流式调用(messages + tools)`

---

### 任务 4:AgentConfigService 配置中心 — Claude

**文件**: `wk-modules/wk-module-ai/.../application/AgentConfigService.java` + impl

```java
public interface AgentConfigService {
    String getSystemPrompt(String promptKey);
    String getDefaultModel();
    boolean isToolEnabled(String toolName);
    List<Map<String, Object>> resolveTools(AgentTools tools);
    int getMaxIterations();
    int getMaxSearchCount();
}
```

Commit: `feat(ai): AgentConfigService 配置中心化`

---

### 任务 5:ToolExecutor 接口 + ToolRegistry — Claude

**文件**: `wk-modules/wk-module-ai/.../application/tool/`

```java
public interface ToolExecutor {
    String name();
    Map<String, Object> execute(Map<String, Object> args, String userId);
}
```

Commit: `feat(ai): 工具执行接口与注册中心`

---

### 任务 6:KB / WebSearch 工具真实实现 — Claude

**文件**:
- `tool/KnowledgeBaseSearchTool.java`:注入 `BailianService`,调 `knowledgeBaseSearch(query, pipelineId, topK)`
- `tool/WebSearchTool.java`:注入 `TavilyClient`(M1 单 provider,M2 加多 provider 路由)

Commit: `feat(ai): KB / WebSearch 工具真实对接`

---

### 任务 7:ReAct 编排器(本期必做,Java 重写 vue demo) — Claude

**文件**: `wk-modules/wk-module-ai/.../application/AgentReActExecutor.java`

主循环伪代码(从 vue demo `ReActA1.js:268-690` 移植,Java 重写):

```java
while (iter++ < cfg.getMaxIterations()) {
    List<StreamEvent> events = chatApiUtils.streamPureModel(...);
    emitContentAndThought(emitter, events);

    List<ToolCall> toolCalls = extractToolCalls(events);
    if (toolCalls.isEmpty()) break;

    for (ToolCall tc : toolCalls) {
        sseHelper.send(emitter, toolCallEvent(tc));
        Map<String, Object> result = toolRegistry.execute(tc.name, tc.args, userId);
        sseHelper.send(emitter, toolResultEvent(tc, result));
        messages.add(toolResultMessage(tc, result));
        if (isSearchTool(tc.name)) searchCnt++;
    }
    if (searchCnt >= cfg.getMaxSearchCount()) break;
}
sseHelper.done(emitter);
```

**单元测试**:5 个 case(无工具 / KB / WebSearch / KB+WebSearch / searchCnt 满)。

Commit: `feat(ai): ReAct 编排器(本期 M1 必做)`

---

### 任务 8:MessageChunkClassifier + WkAiAgentService + Controller — Claude

**文件**:
- `application/MessageChunkClassifier.java`:百炼 chunk → 8 类型,**禁 `type=raw` 长期存在**
- `application/WkAiAgentService.java` + impl:编排入口
- `controller/WkAiAgentController.java`:

```java
@PostMapping(value = "/chat-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter chatStream(@Valid @RequestBody AgentChatRequestDto dto) {
    SseEmitter emitter = new SseEmitter(120_000L);  // 2 分钟超时
    String rateKey = "ai:agent:chat:" + UserUtils.getUserId();
    if (redisService.hasKey(rateKey)) {
        sseHelper.error(emitter, "AI_RATE_LIMIT", "操作过于频繁，请稍后再试");
        return emitter;
    }
    redisService.set(rateKey, rateKey, 20L);
    emitter.onCompletion(() -> redisService.del(rateKey));
    emitter.onTimeout(() -> redisService.del(rateKey));
    wkAiAgentService.chat(dto, emitter);
    return emitter;
}
```

Commit: `feat(ai): WkAiAgentController 暴露 SSE 端点`

---

### 任务 9:v2 前端 chatAgentStream 适配 — Qoder

**文件**: `wk-train-center-ui/src/api/ai/common.js`

新增 `chatAgentStream(options, callbacks, signal)`:
- POST `/api/wk/ai/agent/chat-stream`
- 解析 8 种 SSE event
- 调对应回调:`onContent / onThought / onToolCall / onToolResult / onCitation / onFile / onError / onDone`

`chatAppStream` 内部转发到 `chatAgentStream`,保留签名;`localStorage('ai:useAgentGateway')` 切流。

**删除**原百炼 `extractAppTextFromChunk` 调用(后端已拆好)。

Commit: `feat(ai): v2 chatAgentStream 适配`

---

### 任务 10:v2 错误增强 + UI 组件 — Qoder

**文件**:
- `views/web/ai/components/AiAssistant/views/AiAssistant.vue`:catch 块接 `classifyStreamError`,分类提示
- `views/web/ai/components/AiAssistant/conversation/presentation/AiMessageMeta.vue`(新增):思考折叠 + 引用角标 + 工具调用可视化

Commit: `feat(ui): v2 AI 消息错误分类 + 思考/引用 UI`

---

### 任务 11:H5 前端 chatAgentStream + UI 增强 — Qoder

**文件**:
- `wk-mhc-mobile/src/pages/smart-training/api/ai/common.ts`:新增 `callAgentChatStream` TypeScript 版
- `composables/ai/useChatSession.ts`:错误分类 + 中断保留 `fullText`
- `components/ai/CitationDrawer.vue`(新增):引用来源抽屉
- `components/ai/TrainingAssistantView.vue`:错误提示 + 加载骨架 + 重试按钮

Commit: `feat(ai): H5 chatAgentStream + UI 增强`

---

### 任务 12:联调与回归 — 联合(Claude + Qoder)

**步骤**:

12.1 后端 `mvn clean compile` + `mvn test` 通过

12.2 curl 测 SSE 端点:

```bash
curl -N -X POST http://localhost:8080/api/wk/ai/agent/chat-stream \
  -H "Content-Type: application/json" \
  -d '{"prompt":"hello","messages":[{"role":"user","content":"hello"}],"tools":{"enableKbSearch":true,"enableWebSearch":true,"enableThinking":true},"bizParams":{"promptKey":"answer_assistant"}}'
```

12.3 v2 答疑页手动测试:文字/图片/文档/停止按钮/断网/KB/WebSearch

12.4 H5 智能训练页手动测试:同 v2

12.5 切流与回滚:
- `localStorage.setItem('ai:useAgentGateway', '0')` → 切回老 `chatAppStream` 直连
- 老的 `chatAppStream` 直连 100% 保留(M3/M4 才删)

Commit: `chore: M1 联调通过 + 灰度开关验证`

---

## 7. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| 后端代理引入额外延迟 | 首字响应变慢 | `SseEmitter` 同步转发百炼 SSE;后端与百炼同 Region |
| v2/H5 SSE 解析逻辑分叉 | 同一模型表现不同 | 后端 `MessageChunkClassifier` 统一拆 8 类型 |
| `thoughts`/`citations` 透传丢失 | UI 空白 | `extra_body: {enable_thinking: true}` 显式开启 |
| AbortController 中断资源泄漏 | 连接泄漏 | `SseEmitter` 2 分钟超时 + `onCompletion/onTimeout` 清理 Redis |
| ReAct 循环死循环 | 资源耗尽 | `max_iterations: 10` + `max_search_count: 5` 上限保护 |
| `type=raw` 透传百炼 JSON 半直连 | 前端继续依赖百炼 | D2 决策:M1 必须拆 `MessageChunkClassifier`,禁止长期存在 |
| WebSearch key 泄露 | 外部 API 暴露 | 走 `CfgPropService` + type=`ai`,yml 仅 placeholder(主人 D3 决策) |
| 多 provider 路由未做 | 主 provider 挂了全挂 | M1 先上单 provider,M2 加路由检查降级 |

---

## 8. 协作分工最终版

| 角色 | 负责任务 | 状态 |
|---|---|---|
| **Claude** | 任务 1~8(后端协议/DTO/客户端/配置/工具/ReAct/Controller) | 进行中 |
| **Qoder** | 任务 9~11(v2/H5 前端切流 + 错误处理 + UI 增强) | 待启动 |
| **联合** | 任务 12 联调 + 回归 | 待启动 |
| **主人** | D1~D8 拍板(已完成)+ 灰度白名单 + 验收 | 验收待启动 |

**协作铁律**:**任何一方不再修改对方文件**。本文件为唯一权威。后续修订直接落到本文件 §0 元数据 bump 版本号。

---

## 9. 验收口径

- [ ] 后端 `mvn clean compile` + `mvn test` 通过
- [ ] 前端 v2 `npm run typecheck` + `npm run dev` 通过
- [ ] H5 `npx vitest run` 通过
- [ ] v2 答疑页 50 个真实问题答案与原直连 ≥ 95% 一致
- [ ] KB 检索后端走 `BailianService.knowledgeBaseSearch` 真实数据
- [ ] WebSearch 走 Tavily 真实数据
- [ ] 引用来源三端展示一致
- [ ] 异常统一:401/429/5xx 三端文案一致
- [ ] 灰度开关可控制切流
- [ ] 老的 `chatAppStream` 直连 100% 保留(M4 才删)
- [ ] ReAct 循环 5 个单元测试 case 全过

---

## 10. 待主人最终拍板项(已收敛到 8 项决策 D1~D8)

主人已对所有反问给出决策,本计划 8 项决策已全部纳入正文。如有调整,请直接在本文件 §1 表中修订并 bump `version`。

---

## 11. 变更日志

- **2026-07-14 v1.0.0**:Claude + Qoder 联合出统一计划,作废:
  - `tasks/2026-07-14-self-ai-gateway(claude).md`(原 4 阶段 v1)
  - `tasks/2026-07-14-ai-agent-gateway-v2-h5-migration(qoder).md`(原 Qoder v1 + Claude 反馈 + 主人决策 整合稿)
  - `design/2026-07-14-self-ai-gateway(claude)/` 全部 M1~M4 子文档

---

## 12. 关联资源

- vue 问答 demo 形态参考:`E:\otherProject\vue问答Demo\src\ReActA1.js`(只读参考,不直接复用)
- vue 问答 demo prompt 参考:`E:\otherProject\vue问答Demo\src\prompts.js`
- 后端已有百炼能力:`wk-train-center-service/wk-modules/wk-module-file-source/.../BailianService.java`
- 项目记忆 — 百炼 SSE 思考累积:`memory 86d5a6b2`
- 项目记忆 — has_thoughts 必传:`memory 608be533`
- v2 端老直连:`wk-train-center-ui/src/api/ai/common.js`
- v2 端老流式入口:`chatStreamGateway.js`
- H5 端老直连:`wk-mhc-mobile/src/pages/smart-training/api/ai/common.ts`
- v3 端(本期不动):`wk-train-center-ui-v3/src/utils/ai/bailian.ts`

---

**统一计划作者**:Claude + Qoder 联合
**统一计划时间**:2026-07-14
**协议版本**:v1.0

---

## 13. Claude 补充建议(2026-07-14,基于扫 v2 老代码后)

> **6 个建议**,全部基于 [wk-train-center-ui/src/api/ai/common.js](wk-train-center-ui/src/api/ai/common.js) 实际代码细节,联合版 v1.0 没覆盖到。

### 13.1 任务 6 补:KB pipelineId 后端化(避免迁移不到位)

**问题**:v2 老代码硬编码 `KNOWLEDGE_BASE_PIPELINE_ID = 't7tv9lmp6f'`(散落在多文件)。**只把 App 改纯模型,KB pipelineId 仍硬编码就半吊子**。

**建议**:
- `application-ai.yml` 增:

```yaml
ai-agent:
  tools:
    knowledge_base_search:
      enabled: true
      pipelineId: t7tv9lmp6f        # 后端化,与 yml prompt 风格一致
      topK: 5
      timeout: 15s
```

- `KnowledgeBaseSearchTool.execute(query)` 从 yml 读 `pipelineId` 传给 `BailianService.knowledgeBaseSearch(query, pipelineId, topK)`
- 联合验证:全仓 `grep -rn "pipeline_id\|pipelineId\|t7tv9lmp6f" wk-train-center-ui/ wk-mhc-mobile/` 应该 0 命中(都走 yml)

**原因**:主人原话"自己做一套类似于阿里云的,更加偏向我们业务的"——KB pipeline 跟业务深度耦合,必须 yml 管。

### 13.2 任务 3 补:`reasoning_content` 与 `content` 双字段分流

**问题**:联合版任务 3 写"按 index 累积 tool_calls",**漏了 content 与 reasoning_content 的分流**。百炼纯模型在开启 `enable_thinking: true` 时,SSE chunk 同时返回:
- `choices[0].delta.content` — 最终回答增量
- `choices[0].delta.reasoning_content` — 深度思考增量

**v2 老代码错误**:把两者混在一起(用 `extractAppTextFromChunk` 时没区分)→ 思考过程污染主回答。

**建议**:`MessageChunkClassifier.classify()` 必须分流:

```java
if (delta.containsKey("reasoning_content") && delta.get("reasoning_content") != null) {
    return chunk(AgentChatChunkVo.builder()
        .type("thoughts")
        .content(delta.get("reasoning_content"))   // 累积
        .requestId(...)
        .build());
}
if (delta.containsKey("content") && delta.get("content") != null) {
    return chunk(AgentChatChunkVo.builder()
        .type("content")
        .content(delta.get("content"))              // 流式输出
        .build());
}
```

→ 任务 3 步骤加 1 步:"MessageChunkClassifier 必须分流 content / reasoning_content"。

**原因**:vue demo `ReActA1.js` 走 `dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` 同样需要此分流,这是**本期最容易踩的坑**。

### 13.3 任务 4 补:API Key 走 `CfgPropService` 不走 yml 明文

**问题**:联合版 §5 配置模板 `web_search.providers[0].apiKey: ${TAVILY_API_KEY_PLACEHOLDER}` 用 env 注入,**但主人 D3 决策"沿用现有 ai type"暗示走项目 `CfgPropService` + type='ai' 的统一配置中心**。

**建议**:
- yml 中 **不**放 `apiKey` 字段(只放 `enabled` / `provider` / `timeout`)
- `WebSearchTool` 启动时通过 `CfgPropService` 读 type='ai' provider='web_search' 的 `apiKey`
- 与现有 `WkAnswerStudentController` 等模块的 ai 配置拉取方式一致

**实施**:
```java
@Component
public class WebSearchTool {
    @Autowired private CfgPropService cfgPropService;
    
    @PostConstruct
    public void init() {
        CfgProp prop = cfgPropService.getDetail("ai", "web_search", true);
        this.apiKey = JsonHelper.parse(prop.getData()).getString("apiKey");
    }
}
```

**原因**:主人 D3 决策原文"沿用现有 ai type,不动基础,新增 ai-agent 段"——这个"沿用"指的是**配置中心**,不只是 yml 段。Tavily key 这种敏感配置走 yml 风险高(运维误提交 git)。

### 13.4 任务 9 补:灰度开关双端(后端 yml + 前端 localStorage)

**问题**:联合版只提前端 `localStorage('ai:useAgentGateway')`,**缺后端 yml `fallback.userIds` 白名单 + 紧急 ENV 开关**。

**建议**:
- 后端 yml 增:

```yaml
ai-agent:
  fallback:
    enabled: true
    userIds: [u001, u002]      # 白名单:这些用户走老逻辑
    # 白名单为空时按 ENV 决定
    envSwitch: AI_GATEWAY_ENABLED    # ENV=true 走新,false 全量回退
```

- `AgentConfigService` 暴露 `boolean isFallbackEnabled(String userId)`,Controller 入口判:

```java
if (configService.isFallbackEnabled(userId)) {
    // 转发到 /api/wk/ai/legacy/... 100% 保留老入口
    return legacyForward(dto);
}
return chatStream(dto);
```

- **前端 localStorage 是二级开关**:服务端说"用新"、客户端说"用老" → 以**服务端为准**(前端灰度更弱,主要给开发者本地调试用)

**原因**:主人前面决策"灰度开关 + 老逻辑兜底"是**双端灰度**,后端必须有熔断能力,前端开关是辅助。

### 13.5 任务 8 补:强制 grep 验证 `type=raw` 已下线

**问题**:联合版风险表提到"禁 type=raw 长期存在",但**任务 8 没给"如何确认"的可执行步骤**。

**建议**:任务 8 完成后,跑一遍全仓 grep(作为验收强制项):

```bash
# 1. 前端不应再有 type=raw 处理逻辑
grep -rn "type.*raw\|'raw'\|\"raw\"" wk-train-center-ui/src/ wk-mhc-mobile/src/ \
    --include="*.js" --include="*.ts" --include="*.vue" | \
    grep -v node_modules | grep -v "rawFile\|rawUrl"  # 排除 rawFile 之类不相关

# 2. 前端不应再 import 老的 extractAppTextFromChunk 在 AI 域
grep -rn "extractAppTextFromChunk" wk-train-center-ui/src/api/ai/ wk-mhc-mobile/src/pages/smart-training/api/ai/

# 3. 前端不应再 fetch dashscope.aliyuncs.com
grep -rn "dashscope.aliyuncs.com\|bailian.aliyuncs.com" wk-train-center-ui/src/ wk-mhc-mobile/src/

# 4. 后端不应透传 raw 类型
grep -rn "type.*raw\|type.*=.*\"raw\"" wk-train-center-service/wk-modules/wk-module-ai/src/
```

**预期**:4 条 grep 全部 0 命中(除前端 rawFile/rawUrl 等不相关命中)。

**原因**:CLAUDE.md 反馈规则第 5 条"落地前 PR 审查"——grep 0 命中是机器可验证的验收标准,比"我看了觉得没问题"靠谱。

### 13.6 任务 12 补:50 真实问题基准(切流前先记录,切流后做 diff)

**问题**:联合版验收"50 个真实问题答案与原直连 ≥ 95% 一致",**没写"与什么对比"**。

**建议**:
- 任务 12 启动前(任务 1~11 实施期间),并行做:**老直连基线记录**
- 主人协助挑 50 个真实问题(从答疑页近 1 个月日志抽)
- 在任务 11 完成前,跑老 `chatAppStream` 直连百炼 50 题,记录回答
- 任务 12 切流后,跑新链路同一批 50 题,用 `diff` 工具(自建脚本即可)做语义相似度对比
- ≥ 95% 一致 → 验收通过;< 95% → 回滚 + 优化 prompt

**原因**:主人原话"更加偏向我们业务的"——业务侧"觉得答得对不对"是核心指标,不是技术 1xx/2xx 状态码能替代的。

---

### 13.7 建议落地清单

| # | 关联任务 | 落地点 | 谁负责 |
|---|---|---|---|
| 13.1 | 任务 6 | `application-ai.yml` 增 `pipelineId` + 工具从 yml 读 | Claude |
| 13.2 | 任务 3 | `MessageChunkClassifier` 加 content/reasoning_content 分流 | Claude |
| 13.3 | 任务 4 | `WebSearchTool` 改 `CfgPropService` 读 apiKey | Claude |
| 13.4 | 任务 9 | 后端 yml `fallback` 段 + Controller 入口判 | Claude |
| 13.5 | 任务 8 | 4 条 grep 命令加入验收清单 | Qoder |
| 13.6 | 任务 12 | M1 启动前并行采基线,任务 11 完成后做 diff | Qoder(前端可拉老 API 跑) |

### 13.8 主人对 §13 的决策回填(2026-07-14)

| 编号 | 主题 | 主人决策 |
|---|---|---|
| 13.4 | 灰度开关 | **需要保留前端开关**(本地调试辅助),**灰度以后端为准**(服务端优先,前端覆盖逻辑写为:服务端说用新则用新,客户端仅在服务端未表态时可覆盖) |
| 13.6 | 50 真实问题基线 | **可以**,主人同意从答疑页近 1 个月日志挑 50 个真实问题。任务 1 启动前并行采老直连基线,任务 11 完成后用新链路跑同一批问题做 diff 对比 |

**后续动作**:
- 13.4 调整 → Claude 在任务 9 实施时,后端 yml 加 fallback 段 + Controller 入口判;Qoder 任务 9 保留 localStorage 开关,但逻辑改为「服务端优先」
- 13.6 调整 → 主人任务 1 启动前提供 50 题清单,Qoder 任务 1 期间并行采基线,任务 11 完成后做 diff

### 13.9 主人对市面调研建议的决策(2026-07-14,基于 Portkey/LiteLLM/Higress/Bifrost 等 8 个主流方案调研)

| 编号 | 建议项 | 主人决策 | 落地动作 |
|---|---|---|---|
| A1 | **精确缓存 + 成本埋点**(M1 增量) | **补**(本期做) | 新增**任务 13:精确缓存** + **任务 14:成本埋点**,Claude 负责后端 |
| A2 | MCP 协议兼容 | **不需要纳入**(本期不接入),但 **留口** | 任务 6 Tool 层 `ToolExecutor` 接口预留 MCP 兼容能力(接口名命名 + 实现类预留,本期不实现) |
| A3 | Prompt 版本管理 | **需要**(本期纳入) | 新增**任务 15:Prompt 版本管理**,Claude 负责后端配置 + git tag 关联 |

**任务增量一览**:

| 新任务 | 范围 | 负责人 | 估时 |
|---|---|---|---|
| 任务 13 精确缓存 | 同 query hash 直接返回历史回答,内存 LRU + TTL,命中绕过模型调用 | Claude | 1d |
| 任务 14 成本埋点 | 按 userId / promptKey 统计 token / 调用次数 / 平均延迟,Redis 计数器 + LogInject 埋点 | Claude | 0.5d |
| 任务 15 Prompt 版本管理 | yml 段加 `version` 字段 + git tag 记录 + 回滚指引 | Claude | 0.5d |
| 任务 6 增量 | ToolExecutor 接口预留 MCP 兼容(本期不实现) | Claude | 0.2d |

**作废项与顺延项**:

- 语义缓存 / Guardrails / OTel / 虚拟 key + 预算管控 → 本期**不做**,延期到 M2/M3 评估
- 多 provider 自动 fallback → 本期**不做**,延期到 M2

### 13.10 主人对调试台(Playground)的决策(2026-07-15)

**触发**:主人截图阿里云百炼 App 调试台,问"你们设计里有没有类似的"。经 §15 调研对齐百炼/Coze/Dify 形态后,主人拍板"**追加**"。

**主人重点关注 2 项**(基础功能不用说也要做好):
1. **知识库**——KB 检索调试(pipelineId 配置 / 命中片段预览 / 召回率)
2. **网络搜索**——WebSearch 调试(provider 切换 / 多 provider 路由 / 命中结果质量)

**决策**:M1 新增**任务 16:AI 调试台(Playground)** —— 极简版,对标百炼 App 调试台但聚焦知识库 + 网络搜索 2 个核心调试场景。

#### 13.10.1 调试台能力清单(M1 极简版,主人关注的 2 项为重)

| 能力 | 来源 | 必做 | 备注 |
|---|---|---|---|
| **system prompt 编辑器** | 主人截图百炼台"提示词"区 | ✅ 必做 | textarea + Monaco syntax highlight(M1 简化) |
| **自定义变量** `{{jdoc}}` | 主人截图百炼台"自定义变量" | ✅ 必做 | `{{jdoc}}` / `{{$doc_name}}` 占位符实时替换预览 |
| **模型切换** Qwen-Turbo / Qwen-Max | 主人截图百炼台模型下拉 | ✅ 必做 | 对应 RequestDto.bizParams.model |
| **联网搜索开关** | 主人截图百炼台"联网搜索" | ✅ 必做(主人重点) | web-search-turbo / web-search-max 单选 |
| **知识库关联** | 主人截图百炼台"知识"区 | ✅ 必做(主人重点) | pipelineId 列表 + 命中片段预览 |
| **实时调试运行** | 主人截图百炼台右侧调试区 | ✅ 必做 | 输入问题 → 跑 ReAct → 显示 8 类 SSE + 4 类新事件 |
| **短期/长期记忆** | 主人截图百炼台"记忆" | ❌ 不做 | M2 评估,任务 13 精确缓存已覆盖简单场景 |
| **插件/MCP 服务** | 主人截图百炼台"插件" | ❌ 不做 | 任务 6 增量已留口,M2/M3 评估 |
| **智能体/工作流编排** | 主人截图百炼台"工作流" | ❌ 不做 | 超出 M1 范围,完整管理台排 M2 |
| **插件市场 / 数据连接器** | 主人截图百炼台"插件/数据连接器" | ❌ 不做 | 同上 |

#### 13.10.2 调试台架构(落地形态)

| 维度 | 设计 |
|---|---|
| 入口 | `GET /api/wk/ai/agent/playground` 静态页(管理端嵌入) |
| 后端能力 | 复用 `/api/wk/ai/agent/chat-stream`(任务 7)+ 新增 `/api/wk/ai/agent/playground/config` 读 yml + CfgPropService |
| 前端 | 单页 HTML + Vue 3(嵌入 wk-train-center-ui-v3 管理端,或独立部署) |
| 数据源 | 复用任务 4 `AgentConfigService` 读 yml + 任务 5/6 工具列表 + 任务 15 prompt 版本 |
| 调试结果 | 复用任务 8 `MessageChunkClassifier` 拆 8 类 SSE + 任务 3.2 (Claude §13.2)分流 reasoning_content |

#### 13.10.3 知识库调试(主人重点 1)

| 能力 | 落地 |
|---|---|
| 列表 | 调 `BailianService.listPipelines()` 或读 yml `tools.knowledge_base_search.pipelineId` |
| 命中片段预览 | 跑 ReAct 看到 `tool_result` event 时,前端高亮显示 `results[].snippet`(KB 召回片段) |
| 召回率评估 | **不实现 UI**,但提供 1 个"对比模式"切换(已选 KB 检索 vs 不选,看答案差异)— 主人 50 题基线场景直接用 |
| 多 pipeline | 暂支持单 pipelineId(主人 D7 决策"出题 P2",知识库多 pipeline 评估 M2) |

**API 形态**(新增):

```http
GET /api/wk/ai/agent/playground/kb
Response: { "pipelines": [{"id":"t7tv9lmp6f","name":"船舶知识库","docCount":1234}] }
```

#### 13.10.4 网络搜索调试(主人重点 2)

| 能力 | 落地 |
|---|---|
| Provider 列表 | 读 yml `tools.web_search.providers[]`,**M1 默认 = 阿里云百炼联网搜索**(主人 §13.10.4 拍板,2026-07-15 改);M2 再加 Bocha / Tavily / IQS 备选 |
| 单 provider 直跑 | 调试台选 provider 后,**跳过 ReAct tool_choice**,直接调该 provider 测试检索质量 |
| 命中结果对比 | 多选 N 个 provider 同时跑,N 列对比结果(title / url / snippet) |
| 是否启用 ReAct | 勾选"启用工具调用"= 走完整 ReAct;不勾 = 直接 web_search 工具单跑 |
| **多轮搜索** | 主人 §13.10.4 拍板:WebSearch 工具支持**多轮搜索**,ReAct 主循环内同一 ReAct 周期可累计调 N 次 web_search(不是单次),直到 searchCnt 满或 LLM 主动结束;`max_search_count: 5` 是上限,默认 1 轮 + 1 搜索,需要时扩到 2~3 轮 |

**API 形态**(新增):

```http
POST /api/wk/ai/agent/playground/websearch
Body: { "query": "...", "providers": ["bocha","tavily"], "topK": 5 }
Response: { "results": { "bocha": [{title,url,snippet}], "tavily": [...] } }
```

#### 13.10.5 任务 16 工作量拆分

| 子任务 | 范围 | 负责人 | 估时 |
|---|---|---|---|
| 16.1 调试台后端 API | 4 个新 endpoint:playground 页 / config / kb 列表 / websearch 直跑 | Claude | 0.8d |
| 16.2 调试台前端骨架 | 单页 HTML + Vue 3 + Monaco(轻量) | Qoder | 1d |
| 16.3 知识库调试 UI | pipeline 列表 + 命中片段预览 + 召回对比切换 | Qoder | 0.5d |
| 16.4 网络搜索调试 UI | provider 多选 + 直跑 + N 列对比 | Qoder | 0.5d |
| 16.5 提示词编辑器 + 实时调试 | Monaco + 占位符预览 + 跑 ReAct + 8 类 SSE 渲染 | Qoder | 0.5d |
| 16.6 集成 + 联调 | 嵌入 wk-train-center-ui 管理端菜单,联调测试 | 联合 | 0.5d |
| **任务 16 合计** | | | **3.8d** |

#### 13.10.6 任务增量(全计划任务一览)

| 新任务 | 范围 | 负责人 | 估时 |
|---|---|---|---|
| 任务 16 AI 调试台 | Playground 极简版,对标百炼 App 调试台,聚焦 KB + WebSearch | Claude 后端 + Qoder 前端 | 3.8d |

**M1 总任务一览**(主人增 16 后):
- 原 1~12(12 任务) + 主人增 13~15(3 任务) + 主人增任务 6 增量(0.2d) + 主人增任务 16 调试台(3.8d)
- **M1 总估时 ≈ 17d 后端 + 5.5d 前端 + 联调 0.5d = ~23d**(对比之前 12 任务 ≈ 15d,主人加码 50%)

#### 13.10.7 不在本调试台的能力(明确说)

| 不做 | 理由 | 落地时机 |
|---|---|---|
| 智能体/工作流画布编排 | 超出 M1 范围,需要后端支持 DAG 引擎(任务 7 重写) | M2 排"完整 Agent 管理台" |
| 插件市场 | M1 工具集固定(任务 6),插件是注册中心能力 | M3 |
| 知识库 CRUD(上传/切片) | 后端 `BailianSyncJob` 已自动同步,前台不做上传 UI | M2 评估 |
| 长期记忆 | LangGraph checkpointer 思路,M1 任务 13 精确缓存已覆盖简单场景 | M2 抄 Spring AI Alibaba |
| 灰度发布 / AB Test | Portkey weight 0.1 思路,M1 后端 yml `fallback.userIds` 已实现基础灰度 | M2 加重 AB 路由 |
| 成本可视化(图表) | 任务 14 成本埋点已采数据,可视化排 M2 | M2 |

#### 13.10.8 后续动作

- 主人本轮:已拍板"**追加 调试台**" + 关注 KB + WebSearch
- Claude 任务 16.1 后端 API(0.8d)先做
- Qoder 任务 16.2~16.6 前端(3d)后做
- 任务 16.6 联调在 任务 12 联调后开始(任务 12 完成后接任务 16 联调)
- 后续:如果主人试用后想加智能体/工作流画布,排 M2 完整管理台

**新增决策 D9**:
| D9 | 调试台范围 | M1 加极简 Playground(任务 16),聚焦 KB + WebSearch;**不做**智能体/工作流/插件市场 | 主人 §13.10 |

### 13.11 主人对 WebSearch provider 的决策(2026-07-15)

**触发**:主人对 §13.10.4 的 WebSearch provider 选型拍板。

**决策**:
1. **provider 用阿里云百炼联网搜索**(原 M1 计划用 Bocha/Tavily 作废)
   - 原因:与百炼 App Completion 模型同 API 域名 + 同 API key,**天然一致**,不用额外接 Bocha 账号
   - 百炼联网搜索 API 端点:`POST /api/v1/web_search`(具体见任务 6 实施时核对百炼最新文档)
   - 走 `CfgPropService` 读 type=`ai` provider=`web_search` 的 apiKey(同 D3 决策)
2. **支持多轮搜索**:WebSearch 工具允许在 1 个 ReAct 周期内被调用 N 次(直到 searchCnt 满或 LLM 主动结束)
   - yml `ai-agent.react.max_search_count: 5` 是上限
   - 默认 1 轮 + 1 搜索,需要时 LLM 可扩到 2~3 轮
   - 与 vue demo `ReActA1.js` 行为对齐
3. **Qoder final-plan 任务 6 需改**:
   - 步骤 2 WebSearchTool 改用阿里云百炼 API
   - yml `tools.web_search.providers: [{ name: bailian_web_search, priority: 1 }]`
   - `tools.web_search.apiKey` 走 `CfgPropService`,不再用 `${TAVILY_API_KEY_PLACEHOLDER}`
4. **任务 6 估时不变**(1.5d,接 API 哪家都差不多)

**新增决策 D10**:
| D10 | WebSearch provider | **M1 用阿里云百炼联网搜索**(统一鉴权 + 多轮搜索支持);Bocha/Tavily 备选 M2 加 | 主人 §13.11 |

**后续动作**:
- Qoder final-plan 任务 6 步骤 2 改 provider + yml
- Claude 任务 6 实施时调通百炼联网搜索 API
- §5 配置模板同步更新(见下条 Edit)

### 13.12 主人对百炼联网搜索 API Key + 实现的澄清(2026-07-15)

**触发**:主人查阿里云百炼"联网搜索"文档(`help.aliyun.com/zh/model-studio/web-search`)后修正 §13.11 D10 决策 + Claude 用 fetch MCP 拉全文验证。

**澄清**(百炼官方文档 3 种调用方式):
1. **OpenAI 兼容-Responses API**(qwen3-max 推荐):`tools: [{"type": "web_search"}]`
2. **OpenAI 兼容-Chat Completions API**:`extra_body: {"enable_search": true}`
3. **DashScope 旧 SDK**:`enable_search=True` 顶层参数

**关键发现**:
- **百炼联网搜索是模型内置能力,没有独立端点**(`POST /api/v1/web_search` 是 Claude §13.11 写错,Qoder 漏洞 2 已点)
- **不需要单独的 API Key**——使用**百炼公用的 API Key**(`DASHSCOPE_API_KEY`)
- 主人原话"bailian_web_search 不需要 key,应该是公用的百炼 API Key"

**关键设计影响**(M1 任务 6/7/8 全要改):

| 维度 | 调整前(§13.11) | 调整后(§13.12) |
|---|---|---|
| **WebSearch 实际行为** | 我们的 ReAct 调外部 WebSearchTool → 调百炼 web_search | **百炼模型内部自动调** web_search(responses API tools)→ 通过 tool_calls 返回 |
| **WebSearchTool.java** | 自己实现 web_search 调用 | **改为 PassthroughHandler**(只识别名字 + 跳过执行,百炼内部完成)或 ReAct 编排器里硬编码"web_search 名字跳过" |
| **多轮搜索** | 我们控制 searchCnt | **LLM 决定调几次**,我们只控制 `max_iterations` 上限 |
| **CfgPropService** | 独立配 web_search apiKey | **废**,复用模型公用 API Key(从 `BailianKnowledgeConfig` 读) |
| **任务 6 估时** | 1.5d(WebSearchTool 实现) | **0.5d**(省 1d,只需注册 + 跳过逻辑) |
| **任务 6 总估时** | 1.5d | **0.5d(KB) + 0.2d(WebSearch passthrough) = 0.7d** |
| **任务 16.4 调试台** | provider 列表 + apiKey 配置项 + 多 provider 对比 | **简化为**:web_search 工具测试 = 跑完整 ReAct 看百炼内部搜索结果,无需单独直跑 |
| **Qoder 漏洞 2 spike 关注点** | 走哪种接法 | **已答:走方案 1 Responses API + tools web_search** |

**ReAct 主循环新伪代码**(关键):
```java
while (iter++ < maxIter) {
    events = chatApi.startChatStream(model, messages, tools, toolChoice);  // tools 含 web_search + knowledge_base_search
    emitContentAndThought(emitter, events);
    toolCalls = extractToolCalls(events);
    if (toolCalls.isEmpty()) break;

    for (tc : toolCalls) {
        if ("web_search".equals(tc.name)) {
            // 百炼已内部完成 web_search,无需执行,只发 tool_call 事件给前端
            emitToolCallEvent(emitter, tc);
            // 不调任何外部 API,直接发 tool_result 占位(标记"百炼内置完成")
            emitToolResultEvent(emitter, tc.id, results:[]);
            // 关键:不追加 tool result message 到 messages(百炼自己知道搜索结果)
        } else if ("knowledge_base_search".equals(tc.name)) {
            // 我们自己执行 KB 检索
            result = kbTool.execute(tc.args, userId);
            emitToolCallEvent(emitter, tc);
            emitToolResultEvent(emitter, tc.id, result);
            messages.add(toolResultMessage(tc, result));  // 追加 tool result 到 messages
        }
    }
    // searchCnt:web_search 计入(LLM 多轮搜索),kb 不计入
}
```

**新增决策 D11 + D12**:
| D11 | WebSearch API Key | **百炼联网搜索复用公用 API Key**,不独立配 | 主人 §13.12 |
| D12 | WebSearch 实现 | **百炼模型内置**(responses API tools 数组),我们只做 passthrough;**ReAct 工具列表含 web_search + knowledge_base_search**;多轮搜索由 LLM 决定 | MCP 文档验证 |

**后续动作**(Qoder final-plan 任务 6 需大改):
- 任务 6 估时:`1.5d → 0.7d`(KB 0.5d + WebSearch passthrough 0.2d)
- 任务 6 步骤 2 `WebSearchTool.java` 改名为 `WebSearchPassthroughHandler` 或删,改为 ReAct 编排器内置逻辑
- 任务 4 `AgentConfigService`:删 `getWebSearchApiKey()`,共用 `getBailianApiKey()`
- 任务 7 `AgentReActExecutor`:伪代码改(区分 web_search / knowledge_base_search 路径)
- 任务 16.4 `WebSearch 调试 UI`:简化为完整 ReAct 跑一遍,看百炼内部搜索结果

### 13.13 主人对默认模型的决策(2026-07-15,基于 MCP 截图证据)

**触发**:主人拍板默认模型用 `qwen3.6-plus`(业务"更加偏向我们业务" + 性价比)+ **MCP 截图证据**:`qwen3.6-plus` 在百炼"Responses API 的联网搜索"支持列表里(https://help.aliyun.com/zh/model-studio/web-search)。

**主人截图证据**(MCP 拉的关键句):
> 仅支持 qwen3.7-plus、qwen3.7-plus-2026-05-26、**qwen3.6-plus**、qwen3.6-plus-2026-04-02、qwen3.5-plus、qwen3.5-plus-2026-02-15、qwen3.6-flash、qwen3.6-flash-2026-04-16、qwen3.5-flash、qwen3.5-flash-2026-02-23;以及思考模式下的 qwen3-max、qwen3-max-2026-01-23 等。

**决策**:
1. **默认模型**:`qwen3.6-plus`(主人 D13 决策)
2. **备选模型**:`qwen3-max` / `qwen3-plus` / `glm-4.6`
   - `glm-4.6` 是智谱,**不在百炼通道**;主人 D14:留 yml 注释"暂不用,本期只用百炼模型"
3. **关键影响——Qoder 漏洞 2 spike 关注点关闭**:
   - **主人截图证实 `qwen3.6-plus` 支持 Responses API + tools web_search**
   - 不用分"方案 A vs 方案 B",**直接走方案 A(Responses API + tools 数组)**
   - 任务 6 估时维持 **0.7d**(passthrough 0.2d + KB 0.5d)

**ReAct 主循环最终伪代码**(D13 收口,spike 已答):
```java
// 单方案,直接走 Responses API + tools
{
  "model": "qwen3.6-plus",
  "input": [...],
  "tools": [
    {"type": "function", "function": {"name": "knowledge_base_search", "description": "...", "parameters": {...}}},
    {"type": "web_search"}  // 百炼内置
  ],
  "stream": true
}
```

**新增决策 D13**:
| D13 | 默认模型 | **`qwen3.6-plus`**(支持 Responses API + tools web_search);`qwen3-max` / `qwen3-plus` 备选;`glm-4.6` 暂留 yml 注释"本期不用" | 主人 §13.13 |
| D14 | 备选模型 | `glm-4.6` 留 yml 注释,本期不用 | 主人 §13.13 |

**落地变更**(Qoder final-plan 任务 6 收口):
- yml §5:`default: qwen3-max` → `default: qwen3.6-plus`
- candidates 列表:`qwen3-max` / `qwen3-plus` / `glm-4.6` 保留(后两者加注释)
- 任务 6 spike:**取消**(主人截图直接答了)
- 任务 7 `AgentReActExecutor`:伪代码**单方案**确定

**M1 总估时**:**~21d**(从 22d 砍 1d,任务 6 spike 取消)

---
- 任务 0(基线采预)不变,任务 12 联调不变

---

### 13.14 Qoder 对任务 16 的审核反馈(2026-07-15)

(内容保持)

### 13.15 主人对百炼 Responses API + 三大内置工具的全面调研(2026-07-15,重大返工)

**触发**:主人 3 次 MCP 拉文档 + 截图证据 + 文生文总览页调研,触发 M1 计划**全面返工**。

**MCP 拉的关键文档**:
1. `help.aliyun.com/zh/model-studio/web-search` — 联网搜索(§13.11~13.13 已分析)
2. `help.aliyun.com/zh/model-studio/web-extractor` — **网页抓取**(新)
3. `help.aliyun.com/zh/model-studio/file-search` — **知识检索**(新)
4. `help.aliyun.com/zh/model-studio/text-generation-model` — **文生文总览**(新)

**4 大关键发现(我之前设计严重错误)**:

#### 错误 1:ReAct 工具架构错了——百炼一锅烩

**之前设计**:我们后端自己写 ReAct 循环 + 自己注册 KB + WebSearch tools + 自己判断 tool_calls。

**百炼实际**:**百炼自己跑 ReAct**。我们只负责把 `tools[]` + `user input` 发到 `/responses` 端点。

```json
POST /compatible-mode/v1/responses
{
  "model": "qwen3.6-plus",
  "input": "...",
  "tools": [
    {"type": "file_search", "vector_store_ids": ["kb_xxx"]},  // KB 检索
    {"type": "web_search"},                                     // 联网搜索
    {"type": "web_extractor"}                                   // 网页抓取
  ],
  "stream": true
}
```

**我们后端只做**:协议适配 + SSE 透传 + 事件解析(12 类型)+ 计数工具调用次数

#### 错误 2:KB 检索用 file_search,不是 BailianService.knowledgeBaseSearch

**之前设计**:KB 走 `BailianService.knowledgeBaseSearch`(老 OSS SDK)

**百炼实际**:**`file_search` tools 形态**——先在百炼控制台建知识库,获取 `vector_store_ids`,发到 responses API 即可。

- 旧 `BailianService`(OSS + 自建索引)→ **本期不用**
- 新 `file_search`(百炼内置向量库)→ **本期用**
- 主人原话"知识库仍走百炼"——指的就是 file_search
- §13.1 决策"`KB pipelineId` 后端化" 修订为 "`vector_store_id` 后端化"

#### 错误 3:WebExtractor 必须配 WebSearch

百炼文档明确:**"要启用网页抓取,需要在 tools 参数中同时添加 web_search 和 web_extractor"**
- `web_search` 找链接
- `web_extractor` 抓内容
- 两者配套启用,不能只开一个

#### 错误 4:知识库 ID 单值

百炼文档:`vector_store_ids` 当前**仅支持传入一个 ID**

**M1 任务 6 KB 工具单 vector_store_id**,多 KB 检索排 M2/M3。

---

### 主人新增需求:**输出原文开关**

**触发**:主人截图文生文总览,原话:
> "最后要让控制台能控制是否输出原文(也就是带出源文件或者网络切片)"

**百炼原生支持**:`response.output` 含完整 tool 调用 + 结果 + 引用源
- 模型最终 answer
- 思考过程
- 工具调用记录(name + args + output)
- KB 原文片段(`output_file_citation`)
- 联网搜索结果
- 网页抓取内容

**M1 影响**:
- 任务 16.5 提示词编辑器**新增"原文输出开关"**——4 个 toggle:思考 / 工具调用 / KB 原文 / 联网结果
- 任务 10/11 错误 + UI:**新增"显示原文"按钮**(v2 答疑页每条 AI 消息下)
- 后端响应(任务 8 协议)增字段:`includeRaw: boolean` —— true 时返回完整原文

---

### 全面返工影响(13 个任务需改)

| 任务 | 之前设计 | 现在设计 | 估时变化 |
|---|---|---|---|
| **3 ChatApiUtils** | OpenAI 兼容 Chat Completions 端点 | **改用 Responses API**(`/responses`)+ 流式解析新 SSE 事件 | **+0.5d** |
| **4 AgentConfigService** | 复杂 system prompt + tools 注册 | 简化为读 model + vector_store_id + tools 开关 | -0.2d |
| **5 ToolExecutor** | 自己实现 tool 接口 | **简化为**:`tools` 数组配置项,**不写 tool 实现**(转 MCP 留口) | -0.3d |
| **6 KB + WebSearch + WebExtractor** | 自己实现 KB + WebSearch passthrough | **完全重写**:`file_search` + `web_search` + `web_extractor` 3 个百炼内置 tools 一起注册,纯透传 | -0.5d |
| **7 ReAct 编排** | 自己写主循环 + 工具执行 | 简化为:`response.output` 透传 + 解析 3 类 tool 调用 + 计数 | -1.0d |
| **8 Classifier + Controller** | 8 type 拆分百炼 chunk | **改 12 类型**(新增 usage/metadata/progress/interrupt)+ Responses API 事件分类 | +0.3d |
| **9 v2 前端切流** | 8 type 事件消费 | 改 12 type + 新增 tool_call 透传百炼完整 record | +0.3d |
| **10/11 错误 + UI** | 错误分类 + 思考/引用 UI | **新增"显示原文"按钮** | +0.3d |
| **16.3 KB 调试 UI** | pipeline 列表 + 召回片段 | 改 vector_store_id 列表 + 召回原文片段 | +0.2d |
| **16.4 WebSearch 调试** | provider 列表 | 简化为 web_search / web_extractor 开关对比 | -0.2d |
| **16.5 提示词编辑器** | system prompt | **新增"原文输出开关"** 4 个 toggle | +0.5d |

**总变化**:估时从 21d → **~22d**(+1d)

---

### 新增决策 D15~D17

| # | 决策 | 内容 | 来源 |
|---|---|---|---|
| **D15** | ReAct 架构 | **百炼自跑 ReAct**(responses API tools 数组);我们只透传 `response.output` | MCP 文档 |
| **D16** | KB 工具 | 用百炼 `file_search` 工具,`vector_store_ids` 必传(单值) | MCP 文档 |
| **D17** | 工具组合 | `web_search` + `web_extractor` 配套启用;`file_search` 独立启用 | MCP 文档 |
| **D18** | 输出原文开关 | 调试台 + 前端可控制是否输出原文(思考/工具调用/KB 原文/联网结果) | 主人 §13.15 |
| **D19** | 知识库 ID 概念 | **`vector_store_id`**(百炼控制台新概念),**废 `pipeline_id` 概念** | 修订 §13.1 |
| **D20** | M1 主目标 | **不只是做控制台**——M1 主目标是 **AI 问答 + AI 陪练** 业务功能(学员端);**控制台(任务 16)是底层基础,必做但不是主目标**;**多轮对话 + 知识库检索是重点优化** | 主人 §13.16 |
| **D21** | 实现形态 | **结合现有代码**(AI 问答 + AI 陪练老模块)+ **vue demo 形态**——做出"基于我们自己控制台的智能体应用" | 主人 §13.16 |

---

### 落地变更(任务 6 全面重写)

**yml §5 改**:
```yaml
ai-agent:
  models:
    default: qwen3.6-plus
    candidates: [qwen3.7-plus, qwen3.6-plus, qwen3.5-plus, qwen3.6-flash, qwen3.5-flash]
  tools:
    knowledge_base_search:                    # file_search 包装
      enabled: true
      vectorStoreId: ${B_VECTOR_STORE_ID}      # 单值,主人 D19 决策
    web_search:                                # 百炼内置
      enabled: true
    web_extractor:                             # 百炼内置(必须配 web_search)
      enabled: true
  react:
    max_iterations: 10                        # 保留(虽然百炼自跑,但 max 输出还是我们能控)
    max_search_count: 5                       # 保留(用作 web_search 调用次数上限)
```

**Tools 数组**(任务 3 调百炼时组装):
```java
List<Map<String, Object>> tools = new ArrayList<>();
if (config.isToolEnabled("knowledge_base_search")) {
    tools.add(Map.of("type", "file_search", "vector_store_ids", List.of(config.getVectorStoreId())));
}
if (config.isToolEnabled("web_search")) {
    tools.add(Map.of("type", "web_search"));
    if (config.isToolEnabled("web_extractor")) tools.add(Map.of("type", "web_extractor"));  // D17 配套
}
```

**ReAct 编排简化版**(任务 7):
```java
// 改用 responses API + stream,解析 12 类 SSE 事件
for (event : stream) {
    if (event.type == "response.output_text.delta") {
        emit(AgentChatChunkVo.builder().type("content").content(event.delta).build());
    } else if (event.type == "response.reasoning_summary_text.delta") {
        emit(AgentChatChunkVo.builder().type("thoughts").content(event.delta).build());
    } else if (event.type == "response.file_search_call.searching") {
        emit(AgentChatChunkVo.builder().type("tool_call").toolCall(...).build());
    } else if (event.type == "response.file_search_call.completed") {
        emit(AgentChatChunkVo.builder().type("tool_result").toolResult(...).build());
    } else if (event.type == "response.web_search_call.searching") {
        // D17 web_search 调用
    } else if (event.type == "response.web_search_call.completed") {
        // D17 web_search 结果
    } else if (event.type == "response.completed") {
        emit(AgentChatChunkVo.builder().type("done").usage(...).build());
    }
}
```

**ReAct 主循环**:**简化到 1 次** responses API 调用(LLM 自己决定调几次工具),`max_iterations` 退化为"输出 token 上限"

---

### 后续动作(紧急)

1. **Claude 任务 3 重写**:改用 Responses API,估时 +0.5d
2. **Claude 任务 4 简化**:删 tool 注册逻辑,留 model + vector_store_id,估时 -0.2d
3. **Claude 任务 5 简化**:ToolExecutor 简化为配置类,估时 -0.3d
4. **Claude 任务 6 重写**:3 个工具 file_search + web_search + web_extractor 全透传,估时 -0.5d
5. **Claude 任务 7 简化**:ReAct 主循环改为事件透传,估时 -1.0d
6. **Claude 任务 8 协议升级**:12 类型 SSE(原 8 类型 + usage/metadata/progress/interrupt)
7. **Qoder 任务 9/10/11 配合**:12 类型事件消费 + 原文显示按钮
8. **Qoder 任务 16.3/16.4/16.5 配合**:vector_store_id 列表 + web_extractor 开关 + 原文输出开关 4 个 toggle

**M1 总估时**:**~22d**(原 21d)

---

#### 总体接受度

**接受**调试台范围与后端 16.1 拆分;**部分修正**前端 16.2~16.6 估时。

#### 逐项反馈

| 任务 | Claude 估时 | Qoder 反馈 | 修正后估时 |
|---|---|---|---|
| 16.1 后端 API | 0.8d | ✅ **接受** | 0.8d(Claude 负责) |
| 16.2 前端骨架 | 1d | 🟡 修正:Monaco 引入成本高 + 重,**M1 极简版改为 textarea + 简单占位符预览**;1d 足够 | 1d |
| 16.3 KB 调试 UI | 0.5d | ✅ 接受 | 0.5d |
| 16.4 WebSearch 调试 UI | 0.5d | ✅ 接受 | 0.5d |
| 16.5 提示词编辑器 + 实时调试 | 0.5d | 🔴 **不接受**:8 类 SSE 渲染 + 占位符预览 + 调试运行状态机复杂度高,0.5d 不够 | **1d** |
| 16.6 集成 + 联调 | 0.5d | ✅ 接受 | 0.5d |

**前端总估时**:3d → **3.5d**(+0.5d,任务 16.5 调试运行状态机补充)。

#### 关键修正点

1. **16.2 Monaco → textarea**:M1 调试台仅供后端 + 研发人员调试,**不追求代码编辑器的专业体验**。textarea + 占位符预览足以。Monaco 引入会多 300KB 资源加载 + 与现有 Element Plus 风格不一致。
2. **16.5 调试运行状态机**:该子任务包含**输入问题→触发 ReAct→逐事件渲染 8 类 SSE + 工具调用可视化**。建议拆为 2 步:
   - 16.5a 占位符预览 + 提示词实时渲染(0.5d)
   - 16.5b 8 类 SSE 事件流渲染 + 工具调用可视化(0.5d,合并到 16.6 联调窗口)
3. **页面嵌入方式**:Claude 推荐"嵌入 wk-train-center-ui-v3 管理端",Qoder 建议先出**独立部署单页**(Vue 3 + Vite,3 天独立项目骨架),联调成熟后再决定是否嵌入。→ **主人 2026-07-15 复核:不做 Vue 3 + Vite 独立项目,也不嵌入 v3,直接做在 wk-train-center-ui(v2)项目里最合适**(复用现有 Vue 2.7 + Element UI 生态,零依赖增加,与现有菜单 / 路由 / 鉴权天然集成)

#### Qoder 后端接口补充要求(影响 16.1 设计)

- 调试台需要拿到**工具实际配置列表**(`AgentConfigService` 读 yml + CfgPropService 合并),16.1.2 `/playground/config` 应返回:可用 promptKey 列表、可用 model 列表、可用工具列表(KB pipelineId / WebSearch providers)
- `WebSearch 直跑 API` 需要支持**返回检索耗时**(便于评估 provider 性能),建议增加 `latency_ms` 字段

#### 后续动作

- 16.1 后端 Claude 先做(Qoder 后端 0.8d 不介入)
- 16.2~16.6 前端 Qoder 接,估时 3.5d
- 调试台独立部署(不嵌入 v3),访问入口放在 wk-train-center-ui 顶部菜单
- 联调顺序:任务 12 联调通过 → 任务 16.6 联调启动

### 13.16 主人对 M1 范围的最终澄清(2026-07-15,口径大调)

**触发**:主人澄清原话——
> "我不只是做控制台,也需要将目前现有的 AI 问答和 AI 陪练一起做出来,需要结合现有代码和 demo 来一起实现类似于 demo,但是又基于我们自己控制台来做的智能体应用。**实际上是需要主要将多轮调查和知识库检索这些功能优化后做到这些详细的业务功能上**。**控制台是我认为很重要,需要重点做的底层基础**。"

**关键修正**(Claude 之前理解错了):

| 维度 | 之前理解(错) | 主人新口径(对) |
|---|---|---|
| **M1 主目标** | 控制台(任务 16)+ 业务功能(顺带) | **AI 问答 + AI 陪练 业务功能**(学员端实际用) |
| **控制台定位** | M1 主目标 | **底层基础**(M1 必做,但不是主目标) |
| **多轮对话** | 隐式(ReAct 自动) | **重点优化**(主人 D20) |
| **知识库检索** | 透传百炼 | **重点优化**(主人 D20) |
| **AI 陪练** | 任务 11 隐式 | **M1 主目标之一** |
| **AI 问答** | 任务 9 隐式 | **M1 主目标之一** |

**澄清**:主人原话"我之前没跟你们说,你们一直以为是只做控制台"——**澄清过去,不是新增需求**。M1 范围从"控制台为主"调整为"业务功能为主,控制台为基础"。

**实现形态约束**(主人 D21):
- **结合现有代码**:wk-train-center-service 已有 AI 问答/AI 陪练老模块(`WkAnswerStudentController` / `WkTrainingRoleStudentController`),不重做,**改造**走自建网关
- **参考 vue demo 形态**:`E:\otherProject\vue问答Demo\src\ReActA1.js` 的多轮对话 + 工具调用 + 思考展示
- **做出"基于我们自己控制台的智能体应用"**——不照搬 demo,但复用 demo 的交互模式

**M1 任务重排序**(D20 调整后):

| 优先级 | 任务 | 类别 |
|---|---|---|
| **P0 业务功能** | 任务 1~12 改造 AI 问答/AI 陪练(走新网关) | 业务 |
| **P0 业务功能** | 任务 7 ReAct 编排(多轮 + KB 重点优化) | 业务 |
| **P0 业务功能** | 任务 6 KB 检索(file_search + KB 重点优化) | 业务 |
| **P1 底层基础** | 任务 13/14/15 缓存/埋点/版本 | 基础 |
| **P1 底层基础** | 任务 16 AI 调试台(管理员工具,**必做但不是主目标**) | 基础 |

**关键变更**:
- **任务 7 ReAct 编排**:**重点优化多轮对话**——消息历史持久化(短期/长期记忆?)、上下文窗口管理、多轮工具调用追踪
- **任务 6 KB 检索**:**重点优化知识库检索**——vector_store_ids 调优、引用原文片段高亮、多 KB 支持(M1 单 ID,M2 多)
- **任务 9 v2 切流**:**重点是 AI 问答**业务功能(不是单纯切流)
- **任务 11 H5 切流**:**重点是 AI 陪练**业务功能(不是单纯切流)
- **任务 16 调试台**:重要但不是主目标,排 P1(必做但估时可压)

**任务 16 调试台估时调整**(D20 衍生):
- 主人 16.1~16.6 总估时 4.3d → **压到 3d**:
  - 16.1 后端 API:0.8d → 0.5d(只保留 4 个核心 endpoint)
  - 16.2 前端骨架:1d → 0.7d
  - 16.3 KB 调试:0.5d → 0.3d
  - 16.4 WebSearch 调试:0.5d → 0.3d
  - 16.5 提示词编辑器 + 原文开关:1d → 0.5d
  - 16.6 联调:0.5d → 0.7d(因联调 50 题 + 业务功能)
- **省 1.3d 移到 P0 业务功能**:
  - 任务 9 v2 切流 + AI 问答:1.5d → 2d(+0.5d,多轮对话 + KB 检索优化)
  - 任务 11 H5 切流 + AI 陪练:1d → 1.5d(+0.5d,角色扮演 + 教学反馈)

**M1 总估时维持**:**~22d**(从调试台省 1.3d 移到业务功能)

**M1 任务重新分组(按 D20 主目标)**:

```
P0 业务功能(M1 主目标):
  任务 1 SSE 协议(12 type)               0.5d  Claude
  任务 2 DTO + yml 骨架                  0.5d  Claude
  任务 3 ChatApiUtils Responses API       1.5d  Claude
  任务 4 AgentConfigService               0.3d  Claude
  任务 5 ToolExecutor 配置类              0.2d  Claude
  任务 6 KB file_search 重点优化          0.2d  Claude + 主人 vector_store_id
  任务 7 ReAct 编排 + 多轮对话重点优化    1d    Claude
  任务 8 Classifier(12 type) + Controller  1.3d  Claude
  任务 9 v2 AI 问答改造(切流 + KB 优化)  2d    Qoder
  任务 10 v2 错误 + UI + 原文按钮         1d    Qoder
  任务 11 H5 AI 陪练改造(切流 + 教学反馈) 1.5d  Qoder
  任务 12 联调 + 50 题基线                1.5d  联合

P1 底层基础(必做但不是主目标):
  任务 13 精确缓存                        1d    Claude
  任务 14 成本埋点                        0.5d  Claude
  任务 15 Prompt 版本管理                 0.5d  Claude
  任务 16 AI 调试台(压到 3d)             3d    Claude 0.5d + Qoder 2.5d
  任务 0 基线采预(50 题)                 0.5d  Qoder
```

**M1 估时合计**:**~22d**(不变,内部重分配)

**Qoder final-plan 任务重排**(需大改):
1. 任务 9 标题:`v2 chatAgentStream 适配(前端切流)` → **`v2 AI 问答改造(切流 + KB 检索优化 + 多轮对话)`**
2. 任务 11 标题:`H5 chatAgentStream + UI 增强(+ 切流开关)` → **`H5 AI 陪练改造(切流 + 教学反馈 + 角色扮演)`**
3. 任务 16 估时 4.3d → 3d(压)
4. 任务 16 6 个子任务估时重排(见上)
5. 新增任务 9/11 估时 +0.5d(业务功能深度)

**后续动作**:
- Qoder 收到 D20/D21 后,重写 final-plan 任务 9/11 标题 + 估时
- 任务 16 估时压到 3d,Qoder 调整 16.2~16.6 子任务分配
- Claude 任务 7 重点优化多轮对话(短期记忆: messages 数组累积;长期记忆: M2 排)
- Claude 任务 6 重点优化 KB 检索(vector_store_ids 调优 + 引用片段高亮)
- 主人主人需要做的事:**在百炼控制台建 1 个 vector_store_id**(知识库上传文档)给 Claude 任务 6 用

---

---

## 14. 变更日志

- **2026-07-14 v1.0.0**:Claude + Qoder 联合出统一计划,作废:
  - `tasks/2026-07-14-self-ai-gateway(claude).md`(原 4 阶段 v1)
  - `tasks/2026-07-14-ai-agent-gateway-v2-h5-migration(qoder).md`(原 Qoder v1 + Claude 反馈 + 主人决策 整合稿)
  - `design/2026-07-14-self-ai-gateway(claude)/` 全部 M1~M4 子文档
- **2026-07-14 v1.0.0+13**:Claude 追加 §13 补充建议 6 条(pipelineId 后端化 / reasoning_content 分流 / API Key 走 CfgPropService / 双端灰度 / grep 验收 / 基线对比),全部由 v2 老代码细节触发
- **2026-07-14 v1.0.0+13+§13.9**:主人对市面调研 3 项决策(任务 13 精确缓存 / 任务 14 成本埋点 / 任务 15 Prompt 版本管理)+ 任务 6 增量(MCP 留口)
- **2026-07-15 v1.0.0+13+§13.10**:主人拍板加**任务 16 AI 调试台(Playground)**——极简版对标百炼 App 调试台,**聚焦知识库 + 网络搜索 2 个核心调试场景**;M1 总任务 1~16 共 16 个
- **2026-07-14 v1.0.0+14**:主人对市面调研 3 项建议拍板 → §13.9 + 新增任务 13/14/15(精确缓存 / 成本埋点 / Prompt 版本管理,Claude 后端)+ 任务 6 增量(ToolExecutor 预留 MCP 兼容口)
- **2026-07-15 v1.0.0+15 Qoder 审核**:Qoder 对 §13.10 任务 16(调试台)拆分反馈→ §13.11,前端任务 16.2~16.6 估时从 3d 调为 3.5d
- **2026-07-15 v1.0.0+16 主人复核**:调试台不用 Vue 3 + Vite 独立项目、也不嵌入 v3,**直接做在 wk-train-center-ui(v2)项目里**(复用 Vue 2.7 + Element UI 生态,16.2 前端骨架调整为 v2 现有技术栈,新增依赖=0)

---

**统一计划作者**:Claude + Qoder 联合
**统一计划时间**:2026-07-14
**协议版本**:v1.0

---

**统一计划作者**:Claude + Qoder 联合
**统一计划时间**:2026-07-14
**协议版本**:v1.0
**协作规则**:不交叉修改各自文件,本文件为唯一权威
**协作规则**:不交叉修改各自文件,本文件为唯一权威