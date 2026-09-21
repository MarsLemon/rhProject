# AI 智能体调用迁移到自建业务网关（v2 + H5）实现计划

> **统一计划**(Claude + Qoder 联合出品)
> **面向 AI 代理的工作者：** 本计划**不分阶段**,一次性完成:后端用百炼**纯模型调用**(`/compatible-mode/v1/chat/completions`)自建 ReAct 编排,前端不再透传百炼协议,统一消费后端 8 类型 SSE 事件。请按任务 1→12 顺序执行,每任务完成后跑 `mvn test` / `npm run typecheck` 验证。
>
> **核心架构变化**(2026-07-14 主人 D2 拍板):**从"代理百炼 App"变"纯模型 + 自建 ReAct"**。
> - **废**:百炼 AppId / appKey / `BaiLianConfigServiceImpl.agentChat` 扩展 / `type=raw` 透传百炼 JSON
> - **留**:百炼模型 API(`/compatible-mode/v1/chat/completions`)+ model name + system prompt 后端 yml 管 + 自建 tools + 自建 ReAct 循环

**目标:** 将 wk-train-center-ui（v2）与 wk-mhc-mobile（H5）中的 AI 智能体调用从浏览器直连阿里云百炼（App 模式），改为统一调用 wk-train-center-service 后端业务网关；后端用百炼**纯模型 API + 自建 ReAct 编排**，所有 system prompt、tools、RAG、知识库检索、WebSearch、文件解析都**在后端自己完成**；前端不再暴露 API Key、model name、百炼协议细节；补齐异常处理、引用/思考展示、错误反馈。

**架构:** 后端新增 `/api/wk/ai/agent/chat-stream` SSE 端点（`SseEmitter` MVC 模型），内部：`AgentConfigService`（yml 配 system prompt + tools）+ `AgentReActExecutor`（ReAct 主循环）+ `ChatApiUtils.startChatStream`（百炼纯模型客户端）+ `ToolRegistry`（KB 检索 + WebSearch）；前端 `chatAgentStream(options)` 消费后端 8 类型 SSE 事件渲染 UI。

**技术栈:** Java 17 + Spring Boot 3（`spring-boot-starter-web` + `SseEmitter`，不引 webflux）+ Vue 2.7（Element UI）+ Vue 3 + Vant + TypeScript + SSE。

**协作分工:**
- 后端 1~6(协议/DTO/客户端/配置/工具/ReAct) + 12 联调 — Claude
- 前端 7~9(v2/h5 切流) + 11 UI 增强 — Qoder
- 10 联调测试 — 联合

---

## 核心决策（2026-07-14 主人拍板）

| # | 决策 | 内容 |
|---|---|---|
| D1 | **WebFlux → SseEmitter** | 改用 `SseEmitter`(MVC 模型),无 webflux 依赖,与本仓主流一致 |
| D2 | **废 App 模式,改纯模型 + 自建 ReAct** | 百炼端点 `/compatible-mode/v1/chat/completions`;system prompt 后端 yml 管;tools 后端自建;ReAct 编排器本期就做 |
| D3 | **听 Claude 的 Q1~Q5** | Q1→D1;Q2 废 appKey(appKey 概念废除);Q3 M1 必须拆 `MessageChunkClassifier`,禁止 `type=raw` 长期存在;Q4 v2 错误增强改 `AiAssistant.vue` 具体文件;Q5 KB/WebSearch 拆 2 个真实对接任务 |
| D4 | **Claude 先写补充任务** | T-D2-1~T-D2-6 草案已并入本计划任务 3~6 |
| D5 | **v3 端由 Claude + Qoder 讨论** | 本期 v2 + h5 优先,v3 端 P1 后续 |

---

## 两种百炼 API 模式对比

| 模式 | 端点 | 编排权 | 工具调用 | prompt 配置 | 主人选择 |
|---|---|---|---|---|---|
| **1. 应用调用(Application Completion)** | `POST /api/v1/apps/{appId}/completion` | **百炼控制台**配 App(prompt + RAG pipeline_id + tools 全部在百炼后台) | 工具由百炼自己跑,前端不感知 | system prompt 在百炼 App 配 | ❌ **废** |
| **2. 模型调用(OpenAI 兼容 ChatCompletion)** | `POST /compatible-mode/v1/chat/completions` | **自己**写 ReAct 循环,**自己**配 system prompt,**自己**注册 tools,**自己**做 function calling | `tools: [...]` + `tool_choice: 'auto'`,流式返回 `tool_calls` 字段 | `messages: [{role:system,...}]` 客户端传 | ✅ **采用** |

**关键证据**:vue demo `ReActA1.js:182` 已经走 `/dashscope/compatible-mode/v1/chat/completions`(纯模型),自己用 `ReActA1.call()` 主循环做工具决策与回填,完全不依赖百炼 AppId。

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/WkAiAgentController.java` | 新增业务网关控制器，暴露 `/api/wk/ai/agent/chat-stream` SSE 端点（`SseEmitter` MVC） |
| `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/AgentConfigService.java` | yml 配置中心化（model + system prompt + tools） |
| `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/AgentReActExecutor.java` | ReAct 主循环（Java 重写 vue demo `ReActA1.js`） |
| `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/MessageChunkClassifier.java` | 百炼 chunk 拆 8 类型（**M1 必做,禁 `type=raw` 长期存在**） |
| `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/tool/ToolExecutor.java` | 工具接口 |
| `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/tool/ToolRegistry.java` | 工具注册表 |
| `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/tool/KnowledgeBaseSearchTool.java` | 真实接 `BailianService.knowledgeBaseSearch` |
| `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/tool/WebSearchTool.java` | 真实接 Tavily API |
| `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AgentChatChunkVo.java` | SSE chunk 统一响应体（8 类型） |
| `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AgentChatRequestDto.java` | 请求 DTO：prompt、messages、fileList、tools、bizParams（无 appId） |
| `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/WkAiAgentExceptionHandler.java` | 统一异常 envelope |
| `wk-train-center-service/yf-ability/src/main/java/com/yf/ability/ai/utils/chat/ChatApiUtils.java` | 扩展 `startChatStream` 支持 `messages + tools + tool_choice`（纯模型） |
| `wk-train-center-service/yf-ability/src/main/java/com/yf/ability/ai/utils/ChatMsgUtils.java` | 新增 `genPureModelReqJson` 生成 OpenAI 兼容 payload |
| `wk-train-center-service/wk-modules/wk-module-ai/src/main/resources/application-ai.yml` | yml 配置：model、system prompt、tools、ReAct 上限、灰度 |
| `wk-train-center-ui/src/api/ai/common.js` | 新增 `chatAgentStream` 函数（不再透传百炼 JSON） |
| `wk-train-center-ui/src/views/web/ai/components/AiAssistant/conversation/infrastructure/chatStreamGateway.js` | 改走 `chatAgentStream`,删除 `extractAppTextFromChunk` 引用 |
| `wk-train-center-ui/src/views/web/ai/components/AiAssistant/conversation/presentation/AiMessageMeta.vue` | 新增：思考折叠 + 引用抽屉 + 工具调用可视化 |
| `wk-train-center-ui/src/views/web/ai/components/AiAssistant/views/AiAssistant.vue` | catch 块接 `classifyStreamError`,分类提示 |
| `wk-mhc-mobile/src/pages/smart-training/api/ai/common.ts` | 新增 `chatAgentStream` TypeScript 版 |
| `wk-mhc-mobile/src/pages/smart-training/composables/ai/useChatSession.ts` | 错误分类 + 中断保留 `fullText` |
| `wk-mhc-mobile/src/pages/smart-training/components/ai/CitationDrawer.vue` | 新增：引用来源抽屉 |
| `wk-mhc-mobile/src/pages/smart-training/components/ai/TrainingAssistantView.vue` | 错误提示 + 加载骨架 + 重试按钮 |

---

## 任务 1：定义统一 SSE 协议（8 种类型）

**文件：** `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AgentChatChunkVo.java`

**步骤：**

- [ ] **步骤 1.1：编写 AgentChatChunkVo**

```java
package com.wk.traincenter.ai.controller.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentChatChunkVo {
    /** 事件类型（8 种）：content / thoughts / citations / tool_call / tool_result / file / error / done */
    private String type;
    /** 文本增量（type=content）或错误消息（type=error） */
    private Object content;
    /** 思考过程快照（type=thoughts） */
    private List<Object> thoughts;
    /** 引用来源快照（type=citations） */
    private List<Map<String, Object>> citations;
    /** 工具调用（type=tool_call）：{id, name, args} */
    private Map<String, Object> toolCall;
    /** 工具结果（type=tool_result）：{id, results[]} */
    private Map<String, Object> toolResult;
    /** 文件（type=file）：AI 生成/引用的文件 URL 列表 */
    private List<String> files;
    /** 仅在 type=error 时使用，便于前端分类 */
    private String errorCode;
    /** requestId，用于日志关联 */
    private String requestId;
}
```

- [ ] **步骤 1.2：Commit**

```bash
git add wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AgentChatChunkVo.java
git commit -m "feat(ai): 统一 AI 网关 SSE chunk 协议（8 类型）"
```

---

## 任务 2：定义请求 DTO（废 appId，改 promptKey + model）

**文件：** `wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AgentChatRequestDto.java`

**步骤：**

- [ ] **步骤 2.1：编写 AgentChatRequestDto**

```java
package com.wk.traincenter.ai.controller.model;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AgentChatRequestDto {
    /** 当前用户问题原文（必传） */
    private String prompt;
    /** 历史消息，role 支持 user/assistant/system */
    @NotEmpty(message = "messages 不能为空")
    private List<MessageItem> messages;
    /** 文档/图片附件 URL 列表（后端会重新签名） */
    private List<String> fileList;
    /** 工具开关 */
    private Tools tools;
    /** 业务透传：选 system prompt + 指定 model */
    private BizParams bizParams;

    @Data public static class MessageItem {
        private String role;
        private String content;
        private List<String> fileList;
    }
    @Data public static class Tools {
        private Boolean enableKbSearch;
        private Boolean enableWebSearch;
        private Boolean enableThinking;
    }
    @Data public static class BizParams {
        private String promptKey;                    // yml 配的 system prompt key
        private String model;                        // 不传走 yml default
        private Map<String, Object> extra;           // 透传业务参数
    }
}
```

- [ ] **步骤 2.2：Commit**

```bash
git add wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AgentChatRequestDto.java
git commit -m "feat(ai): 定义 AI 网关聊天请求 DTO（废 appId）"
```

---

## 任务 3：扩展 ChatApiUtils 支持百炼纯模型流式调用

**文件：**
- 修改：`yf-ability/.../ai/utils/ChatMsgUtils.java` — 新增 `genPureModelReqJson`
- 修改：`yf-ability/.../ai/utils/chat/ChatApiUtils.java` — 新增 `startChatStream`
- **不修改**：`BaiLianConfigServiceImpl`（D2 决策：纯模型不经过 provider 抽象）

**步骤：**

- [ ] **步骤 3.1：ChatMsgUtils 新增 `genPureModelReqJson`**

```java
public static String genPureModelReqJson(String model, String systemMsg, String userMsg,
                                          List<Map<String, Object>> tools, String toolChoice,
                                          boolean stream, boolean enableThinking) {
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("model", model);
    payload.put("stream", stream);
    payload.put("messages", List.of(
        Map.of("role", "system", "content", systemMsg == null ? "" : systemMsg),
        Map.of("role", "user", "content", userMsg)
    ));
    if (tools != null && !tools.isEmpty()) {
        payload.put("tools", tools);
        payload.put("tool_choice", toolChoice == null ? "auto" : toolChoice);
    }
    if (enableThinking) payload.put("extra_body", Map.of("enable_thinking", true));
    return JsonHelper.toJson(payload);
}
```

- [ ] **步骤 3.2：ChatApiUtils 新增 `startChatStream`（处理 tool_calls 增量累积）**

```java
/**
 * 百炼纯模型流式调用（OpenAI 兼容 /compatible-mode/v1/chat/completions）
 * 内部用 HttpURLConnection 读 SSE 流，解析 data: {...} 后回调
 * 关键：tool_calls 按 index 累积合并（参考 vue demo ReActA1.js:447-490）
 */
public static void startChatStream(String apiUrl, String apiKey, String jsonPayload,
                                    Consumer<Map<String, Object>> onChunk) {
    // 1. POST apiUrl, headers: Authorization Bearer + X-DashScope-SSE enable + Content-Type: application/json
    // 2. 读 SSE 流，解析 data: {...} 行，回调 onChunk(chunkJson)
    // 3. 处理 [DONE] 收尾
    // 4. 工具调用增量：维护 Map<Integer, ToolCall>，按 index 拼接 name + arguments
    // 5. 异常转 onError callback
}
```

- [ ] **步骤 3.3：编译验证**

```bash
cd e:/rhProject/wk-train-center-service
mvn -pl yf-ability -am clean compile -DskipTests
```

- [ ] **步骤 3.4：Commit**

```bash
git add wk-train-center-service/yf-ability/src/main/java/com/yf/ability/ai/utils/ChatMsgUtils.java \
        wk-train-center-service/yf-ability/src/main/java/com/yf/ability/ai/utils/chat/ChatApiUtils.java
git commit -m "feat(ai): ChatApiUtils 支持百炼纯模型流式调用（messages + tools）"
```

---

## 任务 4：yml 配置中心化

**文件：**
- 新建：`wk-module-ai/src/main/resources/application-ai.yml`
- 新建：`AgentConfigService.java`（`@ConfigurationProperties(prefix = "ai-agent")`）

**步骤：**

- [ ] **步骤 4.1：编写 application-ai.yml**

```yaml
ai-agent:
  models:
    default: qwen3-max
    candidates: [qwen3-max, qwen-plus, glm-4.6]
    apiUrl: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
    timeout: 400000
  prompts:
    answer_assistant: |
      你是船舶设备与部件领域的资深答疑导师...
      ## 工作流程
      1. 收到问题后，先调用工具搜索，再回答。
      2. 涉及法规、标准、检修流程时，必须调用 knowledge_base_search。
      3. 涉及最新动态、行业新闻时，必须调用 web_search。
      ## 引用标注
      回答中涉及具体事实、法规、设备参数，紧随其后用角标 [1] [2] 标注来源。
      ## 拓展学习建议
      工具调用结束后，在最末尾追加 <<<suggest>>> 块，每条 ≤20 字，1-3 条。
    training_assistant: |
      你是船舶陪练教练，通过角色扮演帮助学员提升业务能力。
    quiz_generator: |
      你是出题助手，根据用户需求生成试题。
  tools:
    knowledge_base_search:
      enabled: true
      timeout: 15s
    web_search:
      enabled: true
      provider: tavily
      apiKey: ${TAVILY_API_KEY:tvly-dev-placeholder}
      timeout: 15s
      maxResults: 5
  react:
    maxIterations: 10
    maxSearchCount: 5
  fallback:
    enabled: true
    userIds: []
```

- [ ] **步骤 4.2：在 yf-web application.yml 引用**

```yaml
spring:
  profiles:
    include: ai
```

- [ ] **步骤 4.3：编写 AgentConfigService**

```java
@Service
@ConfigurationProperties(prefix = "ai-agent")
@Data
public class AgentConfigService {
    private Models models = new Models();
    private Map<String, String> prompts = new HashMap<>();
    private Map<String, ToolConfig> tools = new HashMap<>();
    private React react = new React();
    private Fallback fallback = new Fallback();

    public String getPrompt(String key) { return prompts.get(key); }
    public String getModel(String override) { return override != null ? override : models.getDefault(); }
    public boolean isToolEnabled(String name) { return tools.containsKey(name) && tools.get(name).isEnabled(); }
    public boolean isFallbackEnabled(String userId) { return fallback.isEnabled() && (fallback.getUserIds().isEmpty() || fallback.getUserIds().contains(userId)); }

    // 内部类 Models / ToolConfig / React / Fallback（lombok @Data）
}
```

- [ ] **步骤 4.4：Commit**

```bash
git add wk-train-center-service/wk-modules/wk-module-ai/src/main/resources/application-ai.yml \
        wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/AgentConfigService.java
git commit -m "feat(ai): AgentConfigService + yml 配置中心化（model + prompt + tools）"
```

---

## 任务 5：ToolExecutor + ToolRegistry + 两个真实工具

**文件：**
- `application/tool/ToolExecutor.java`（接口）
- `application/tool/ToolRegistry.java`（注册表）
- `application/tool/KnowledgeBaseSearchTool.java`（真实接 `BailianService`）
- `application/tool/WebSearchTool.java`（真实接 Tavily）

**步骤：**

- [ ] **步骤 5.1：定义 ToolExecutor 接口**

```java
public interface ToolExecutor {
    String name();                                    // 工具名（与 function.name 对应）
    String description();                             // 给 LLM 看的描述
    Map<String, Object> parametersSchema();           // JSON Schema
    List<Map<String, Object>> execute(String query);   // 执行查询，返回结果列表
}
```

- [ ] **步骤 5.2：KnowledgeBaseSearchTool（真实接 `BailianService`）**

```java
@Component
@RequiredArgsConstructor
public class KnowledgeBaseSearchTool implements ToolExecutor {
    private final BailianService bailianService;

    public String name() { return "knowledge_base_search"; }
    public String description() { return "搜索百炼 OSS 知识库，获取相关技术文档和检修规范。"; }
    public Map<String, Object> parametersSchema() {
        return Map.of("type", "object",
                      "properties", Map.of("query", Map.of("type", "string", "description", "搜索查询词")),
                      "required", List.of("query"));
    }
    public List<Map<String, Object>> execute(String query) {
        // 调 bailianService.knowledgeBaseSearch(query)
        // 返回 [{title, url, snippet, type: "kb"}]
    }
}
```

- [ ] **步骤 5.3：WebSearchTool（真实接 Tavily）**

```java
@Component
public class WebSearchTool implements ToolExecutor {
    @Value("${ai-agent.tools.web_search.apiKey}") private String apiKey;
    @Value("${ai-agent.tools.web_search.maxResults:5}") private int maxResults;

    public String name() { return "web_search"; }
    public String description() { return "搜索互联网获取最新行业信息。"; }
    public Map<String, Object> parametersSchema() {
        return Map.of("type", "object",
                      "properties", Map.of("query", Map.of("type", "string")),
                      "required", List.of("query"));
    }
    public List<Map<String, Object>> execute(String query) {
        // POST https://api.tavily.com/search {apiKey, query, maxResults}
        // 返回 [{title, url, content, type: "web"}]
    }
}
```

- [ ] **步骤 5.4：ToolRegistry**

```java
@Component
public class ToolRegistry {
    private final Map<String, ToolExecutor> tools = new HashMap<>();
    private final AgentConfigService config;

    public ToolRegistry(AgentConfigService config, KnowledgeBaseSearchTool kbTool, WebSearchTool webTool) {
        this.config = config;
        if (config.isToolEnabled("knowledge_base_search")) tools.put(kbTool.name(), kbTool);
        if (config.isToolEnabled("web_search")) tools.put(webTool.name(), webTool);
    }

    /** 按 tools 开关返回启用的工具列表（给 LLM 用） */
    public List<Map<String, Object>> resolveForLlm(ToolsDto tools) { ... }
    /** 按 tool_call.name 找到执行器 */
    public ToolExecutor get(String name) { return tools.get(name); }
}
```

- [ ] **步骤 5.5：Commit**

```bash
git add wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/tool/
git commit -m "feat(ai): ToolRegistry + KB/WebSearch 工具（真实对接 BailianService + Tavily）"
```

---

## 任务 6：AgentReActExecutor + MessageChunkClassifier（D2 决策：本期必做）

**文件：**
- `application/MessageChunkClassifier.java`（M1 必做,禁 `type=raw` 长期存在）
- `application/AgentReActExecutor.java`（主循环）

**步骤：**

- [ ] **步骤 6.1：MessageChunkClassifier — 百炼 chunk 拆 8 类型**

```java
@Component
public class MessageChunkClassifier {
    /**
     * 输入：百炼 OpenAI 兼容 chunk（已 JSON 解析）
     * 输出：8 类型 AgentChatChunkVo 之一
     */
    public AgentChatChunkVo classify(Map<String, Object> dashscopeChunk) {
        // 1. choices[0].delta
        //    - delta.content → type=content
        //    - delta.reasoning_content → type=thoughts（累积）
        //    - delta.tool_calls[] → type=tool_call（按 index 合并）
        // 2. output.doc_references / references → type=citations
        // 3. finish_reason → type=done（最后一次）
        // 4. 错误状态 → type=error
    }
}
```

- [ ] **步骤 6.2：AgentReActExecutor 主循环（从 vue demo ReActA1.js:268-690 移植，Java 重写）**

```java
@Component
@RequiredArgsConstructor
public class AgentReActExecutor {
    private final AgentConfigService config;
    private final ToolRegistry toolRegistry;
    private final MessageChunkClassifier classifier;

    public void execute(AgentChatRequestDto request, SseEmitter emitter) {
        // 1. 拼 messages：[system(promptKey)] + history + user(prompt)
        // 2. maxIter = config.react.maxIterations, maxSearch = config.react.maxSearchCount
        // 3. while (iter < maxIter):
        //      a. ChatApiUtils.startChatStream(model, messages, tools, toolChoice="auto")
        //         → classifier.classify(chunk) → emitter.send(chunk)
        //      b. 累积 content + toolCalls（增量合并）
        //      c. 若无 toolCalls：触发流式输出 done 事件，break
        //      d. 若有 toolCalls：对每个 tc → toolRegistry.get(tc.name).execute(query)
        //         → emitter.send(tool_result) → 追加 tool result message → searchCount++
        // 4. searchCount 满时强制 tool_choice='none'（参考 vue demo ReActA1.js:517-525）
        // 5. 收尾：emitter.send(type=done) → emitter.complete()
        // 6. 异常：emitter.send(type=error) → emitter.completeWithError()
    }
}
```

- [ ] **步骤 6.3：Commit**

```bash
git add wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/AgentReActExecutor.java \
        wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/MessageChunkClassifier.java
git commit -m "feat(ai): AgentReActExecutor + MessageChunkClassifier（自建 ReAct）"
```

---

## 任务 7：WkAiAgentController 暴露 SSE 端点

**文件：** `wk-module-ai/.../controller/WkAiAgentController.java`

**步骤：**

- [ ] **步骤 7.1：编写控制器（`SseEmitter` MVC，20 秒限流）**

```java
@Tag(name = "AI 业务代理网关")
@RestController
@RequestMapping("/api/wk/ai/agent")
@Validated
@AllArgsConstructor
public class WkAiAgentController {

    private final AgentReActExecutor reactExecutor;
    private final AgentConfigService configService;
    private final RedisService redisService;

    @Operation(summary = "AI 智能体流式对话")
    @PostMapping(value = "/chat-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@Valid @RequestBody AgentChatRequestDto dto) {
        String userId = UserUtils.getUserId();
        // 灰度判：白名单内才走新接口，否则转老逻辑
        if (!configService.isFallbackEnabled(userId)) {
            // TODO: 转发到 /api/wk/ai/legacy/...（M1 必须保留老入口 100%）
        }
        // 限流
        String rateKey = "ai:agent:chat-stream:" + userId;
        if (redisService.hasKey(rateKey)) {
            SseEmitter emitter = new SseEmitter();
            try {
                emitter.send(SseEmitter.event().name("error").data(
                    AgentChatChunkVo.builder().type("error").errorCode("RATE_LIMIT").content("操作过于频繁，请稍后再试").build()
                ));
            } catch (IOException ignored) {}
            emitter.complete();
            return emitter;
        }
        redisService.set(rateKey, rateKey, 20L);
        SseEmitter emitter = new SseEmitter(5 * 60 * 1000L); // 5 分钟超时
        try {
            reactExecutor.execute(dto, emitter);
        } finally {
            redisService.del(rateKey);
        }
        return emitter;
    }
}
```

- [ ] **步骤 7.2：编译验证**

```bash
cd e:/rhProject/wk-train-center-service
mvn -pl wk-modules/wk-module-ai -am clean compile -DskipTests
```

- [ ] **步骤 7.3：Commit**

```bash
git add wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/WkAiAgentController.java
git commit -m "feat(ai): 新增 AI 网关 SSE 端点 /api/wk/ai/agent/chat-stream"
```

---

## 任务 8：v2 前端 chatAgentStream 消费 8 类型 SSE

**文件：**
- 修改：`wk-train-center-ui/src/api/ai/common.js`
- 修改：`wk-train-center-ui/src/views/web/ai/components/AiAssistant/conversation/infrastructure/chatStreamGateway.js`

**说明：** 后端已经把百炼 chunk 拆成 8 类型，**前端不再解析百炼 JSON**。

**步骤：**

- [ ] **步骤 8.1：新增 `chatAgentStream`（消费 8 类型 SSE）**

```javascript
async function chatAgentStream(options, onMessage, onDone, onError, signal) {
  const opts = options || {}
  const { prompt, messages = [], fileList = [], tools = {}, bizParams = {} } = opts
  if (!messages.length) throw new Error('messages 不能为空')

  let signedFileList = fileList
  if (fileList.length) {
    const expires = opts.fileUrlExpires != null ? opts.fileUrlExpires : 600
    const signed = await getPrivateFileUrlBatch(fileList, expires)
    signedFileList = fileList.map((u, i) => signed[i] || u)
  }

  const payload = {
    prompt,
    messages: messages.map(m => {
      const item = { role: m.role, content: m.content || '' }
      if (Array.isArray(m.file_list) && m.file_list.length) item.fileList = m.file_list
      return item
    }),
    fileList: signedFileList,
    tools: {
      enableKbSearch: !!tools.enableKbSearch,
      enableWebSearch: !!tools.enableWebSearch,
      enableThinking: !!tools.enableThinking
    },
    bizParams: { promptKey: opts.promptKey || 'answer_assistant', model: opts.model, extra: opts.extra }
  }

  const controller = new AbortController()
  const combinedSignal = signal || controller.signal
  if (signal) signal.addEventListener('abort', () => controller.abort())

  const response = await fetch('/api/wk/ai/agent/chat-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify(payload),
    signal: combinedSignal
  })

  if (!response.ok) {
    let errorText = ''
    try { const j = await response.json(); errorText = j?.message || JSON.stringify(j) }
    catch { errorText = await response.text().catch(() => '') }
    throw new Error(`AI 服务请求失败：HTTP ${response.status}${errorText ? ' | ' + errorText : ''}`)
  }
  if (!response.body) throw new Error('响应体为空')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = '', fullText = '', lastThoughts = null, lastCitations = null
  let lastToolResults = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() || ''
    for (const line of lines) {
      const trimmed = (line || '').trim()
      if (!trimmed.startsWith('data:')) continue
      const dataStr = trimmed.slice(5).trim()
      if (!dataStr || dataStr === '[DONE]') continue
      let obj
      try { obj = JSON.parse(dataStr) } catch { continue }

      if (obj.type === 'error') throw new Error(obj.content || 'AI 服务返回错误')
      if (obj.type === 'done') {
        if (onDone) onDone({ fullText, thoughts: lastThoughts, citations: lastCitations, toolResults: lastToolResults })
        return
      }
      if (obj.type === 'content') {
        const delta = String(obj.content || '')
        if (delta) { fullText += delta; if (onMessage) onMessage(fullText, { delta, fullText }) }
      } else if (obj.type === 'thoughts') {
        lastThoughts = obj.thoughts
        if (onMessage) onMessage(fullText, { delta: '', fullText, thoughts: lastThoughts })
      } else if (obj.type === 'citations') {
        lastCitations = obj.citations
        if (onMessage) onMessage(fullText, { delta: '', fullText, citations: lastCitations })
      } else if (obj.type === 'tool_call') {
        if (onMessage) onMessage(fullText, { delta: '', fullText, toolCall: obj.toolCall })
      } else if (obj.type === 'tool_result') {
        lastToolResults.push(obj.toolResult)
        if (onMessage) onMessage(fullText, { delta: '', fullText, toolResult: obj.toolResult })
      } else if (obj.type === 'file') {
        if (onMessage) onMessage(fullText, { delta: '', fullText, files: obj.files })
      }
    }
  }
  if (onDone) onDone({ fullText, thoughts: lastThoughts, citations: lastCitations, toolResults: lastToolResults })
}

export { chatAgentStream }
```

- [ ] **步骤 8.2：chatStreamGateway.js 切流到 chatAgentStream**

```javascript
import { chatAgentStream } from '@api/ai/common'

const useAgentGateway = () => typeof window !== 'undefined' && window.localStorage
  ? window.localStorage.getItem('ai:useAgentGateway') !== '0'
  : true

export function streamChatCompletion(params, onChunk, onDone, onError, signal) {
  if (useAgentGateway()) return chatAgentStream(params, onChunk, onDone, onError, signal)
  return chatAppStream(params, onChunk, onDone, onError, signal)  // 老逻辑保留
}
```

- [ ] **步骤 8.3：删除 v2 端 `extractAppTextFromChunk` AI 域内引用**

`grep -rn "extractAppTextFromChunk" wk-train-center-ui/src/api/ai/` 应该 0 命中。

- [ ] **步骤 8.4：v2 本地启动验证**

```bash
cd e:/rhProject/wk-train-center-ui
npm run serve:dev
```

打开 v2 的 AI 助手页面，发送消息 → Network 应该请求 `/api/wk/ai/agent/chat-stream`（不是 `dashscope.aliyuncs.com`）。

- [ ] **步骤 8.5：Commit**

```bash
git add wk-train-center-ui/src/api/ai/common.js \
        wk-train-center-ui/src/views/web/ai/components/AiAssistant/conversation/infrastructure/chatStreamGateway.js
git commit -m "feat(ai): v2 chatAgentStream 消费 8 类型 SSE（废 type=raw 透传）"
```

---

## 任务 9：H5 前端 chatAgentStream 消费 8 类型 SSE

**文件：** `wk-mhc-mobile/src/pages/smart-training/api/ai/common.ts`

**说明：** 与 v2 任务 8 完全一致，TypeScript 类型化。

**步骤：**

- [ ] **步骤 9.1：新增 `chatAgentStream`（TypeScript）**

```typescript
export async function chatAgentStream(
  options: AgentChatStreamOptions,
  onMessage: (fullText: string, meta?: StreamMeta) => void,
  onDone?: (meta?: StreamMeta) => void,
  signal?: AbortSignal,
): Promise<StreamMeta | undefined> {
  const { prompt, messages = [], fileList = [], tools = {}, bizParams = {} } = options
  if (!messages.length) throw new Error('messages 不能为空')

  let signedFileList = Array.isArray(fileList) ? fileList : []
  if (signedFileList.length) {
    const expires = options.fileUrlExpires != null ? options.fileUrlExpires : 600
    const signed = await getPrivateFileUrlBatch(signedFileList, expires)
    signedFileList = signedFileList.map((u, i) => signed[i] || u)
  }

  const payload = {
    prompt,
    messages: messages.map(m => {
      const item: any = { role: m.role, content: m.content || '' }
      if (Array.isArray(m.file_list) && m.file_list.length) item.fileList = m.file_list
      return item
    }),
    fileList: signedFileList,
    tools: {
      enableKbSearch: !!tools.enableKbSearch,
      enableWebSearch: !!tools.enableWebSearch,
      enableThinking: !!tools.enableThinking
    },
    bizParams: { promptKey: options.promptKey || 'answer_assistant', model: options.model, extra: options.extra }
  }

  const response = await fetch('/api/wk/ai/agent/chat-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify(payload),
    signal
  })

  if (!response.ok) {
    let errorText = ''
    try { const j = await response.json(); errorText = j?.message || JSON.stringify(j) }
    catch { errorText = await response.text().catch(() => '') }
    throw new Error(`AI 服务请求失败：HTTP ${response.status}${errorText ? ` | ${errorText}` : ''}`)
  }
  if (!response.body) throw new Error('响应体为空')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = '', fullText = '', lastThoughts: any = null, lastCitations: any = null
  let lastToolResults: any[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() || ''
    for (const line of lines) {
      const trimmed = (line || '').trim()
      if (!trimmed.startsWith('data:')) continue
      const dataStr = trimmed.slice(5).trim()
      if (!dataStr || dataStr === '[DONE]') continue
      let obj: any
      try { obj = JSON.parse(dataStr) } catch { continue }

      if (obj.type === 'error') throw new Error(String(obj.content || 'AI 服务返回错误'))
      if (obj.type === 'done') {
        const doneMeta: StreamMeta = { delta: '', fullText, thoughts: lastThoughts, citations: lastCitations, toolResults: lastToolResults }
        onDone?.(doneMeta)
        return doneMeta
      }
      if (obj.type === 'content') {
        const delta = String(obj.content || '')
        if (delta) { fullText += delta; onMessage?.(fullText, { delta, fullText }) }
      } else if (obj.type === 'thoughts') {
        lastThoughts = obj.thoughts
        onMessage?.(fullText, { delta: '', fullText, thoughts: lastThoughts })
      } else if (obj.type === 'citations') {
        lastCitations = obj.citations
        onMessage?.(fullText, { delta: '', fullText, citations: lastCitations })
      } else if (obj.type === 'tool_call') {
        onMessage?.(fullText, { delta: '', fullText, toolCall: obj.toolCall })
      } else if (obj.type === 'tool_result') {
        lastToolResults.push(obj.toolResult)
        onMessage?.(fullText, { delta: '', fullText, toolResult: obj.toolResult })
      } else if (obj.type === 'file') {
        onMessage?.(fullText, { delta: '', fullText, files: obj.files })
      }
    }
  }
  const doneMeta: StreamMeta = { delta: '', fullText, thoughts: lastThoughts, citations: lastCitations, toolResults: lastToolResults }
  onDone?.(doneMeta)
  return doneMeta
}
```

- [ ] **步骤 9.2：H5 切流开关（同 v2）**

`localStorage.getItem('ai:useAgentGateway') !== '0'` 为 true 时走 `chatAgentStream`，false 走老的 `chatAppStream`。

- [ ] **步骤 9.3：运行 H5 单元测试**

```bash
cd e:/rhProject/wk-mhc-mobile
npx vitest run src/pages/smart-training/api/ai/common.chatStream.spec.ts
```

- [ ] **步骤 9.4：Commit**

```bash
git add wk-mhc-mobile/src/pages/smart-training/api/ai/common.ts
git commit -m "feat(ai): H5 chatAgentStream 消费 8 类型 SSE"
```

---

## 任务 10：统一前后端 SSE 错误处理与 UI 反馈

**文件：**
- `wk-mhc-mobile/src/pages/smart-training/composables/ai/useChatSession.ts`
- `wk-train-center-ui/src/views/web/ai/components/AiAssistant/views/AiAssistant.vue`（Q4 修正：v2 改具体文件）
- `wk-mhc-mobile/src/pages/smart-training/components/ai/TrainingAssistantView.vue`

**步骤：**

- [ ] **步骤 10.1：H5 错误分类函数**

```typescript
function classifyStreamError(err: unknown): { message: string; code?: string } {
  const e = err instanceof Error ? err : new Error(String(err))
  const msg = e.message || ''
  if (e.name === 'AbortError' || msg.includes('aborted')) return { message: '' }
  if (msg.includes('401') || msg.includes('认证失败')) return { message: 'AI 服务鉴权失败，请联系管理员', code: 'AUTH_FAILED' }
  if (msg.includes('429') || msg.includes('过于频繁')) return { message: '请求过于频繁，请稍后再试', code: 'RATE_LIMIT' }
  if (msg.includes('500') || msg.includes('服务不可用')) return { message: 'AI 服务暂时不可用，请稍后再试', code: 'SERVICE_ERROR' }
  if (msg.includes('Failed to fetch') || msg.includes('网络')) return { message: '网络连接异常，请检查网络', code: 'NETWORK_ERROR' }
  return { message: 'AI 生成失败，请重试', code: 'UNKNOWN' }
}
```

- [ ] **步骤 10.2：H5 错误处理 - 保留 fullText（Q4 修正）**

```typescript
const handleStreamError = async (err: unknown) => {
  const classified = classifyStreamError(err)
  if (!classified.message) return
  const idx = findAiMsgIndex()
  const msg = idx >= 0 ? messages.value[idx] : undefined
  if (msg) {
    msg.loading = false
    if (fullText) {
      msg.content = `${fullText}\n\n*(输出中断：${classified.message})*`
    } else {
      msg.content = `抱歉，${classified.message}`
    }
  }
  isLoading.value = false
  showToast(classified.message)
}
```

- [ ] **步骤 10.3：v2 端错误增强（Q4 修正：改 AiAssistant.vue 具体 catch 块）**

打开 `wk-train-center-ui/src/views/web/ai/components/AiAssistant/views/AiAssistant.vue`，找到 catch (err) 块：

```javascript
catch (err) {
  // 旧：直接 showToast(err.message)
  // 新：分类提示
  const msg = err.message || ''
  let tip = 'AI 服务异常，请稍后再试'
  if (msg.includes('401') || msg.includes('认证失败')) tip = 'AI 服务鉴权失败，请联系管理员'
  else if (msg.includes('429') || msg.includes('过于频繁')) tip = '请求过于频繁，请稍后再试'
  else if (msg.includes('Failed to fetch') || msg.includes('网络')) tip = '网络连接异常，请检查网络'
  showToast(tip, true)
}
```

- [ ] **步骤 10.4：Commit**

```bash
git add wk-mhc-mobile/src/pages/smart-training/composables/ai/useChatSession.ts \
        wk-mhc-mobile/src/pages/smart-training/components/ai/TrainingAssistantView.vue \
        wk-train-center-ui/src/views/web/ai/components/AiAssistant/views/AiAssistant.vue
git commit -m "feat(ai): 增强 v2/H5 AI 流式错误分类（Q4 修正：v2 改具体文件）"
```

---

## 任务 11：前端引用/思考 UI 增强

**文件：**
- 新建：`wk-train-center-ui/src/views/web/ai/components/AiAssistant/conversation/presentation/AiMessageMeta.vue`
- 新建：`wk-mhc-mobile/src/pages/smart-training/components/ai/CitationDrawer.vue`

**步骤：**

- [ ] **步骤 11.1：v2 AiMessageMeta.vue（思考折叠 + 引用角标）**

```vue
<template>
  <div class="ai-message-meta">
    <div v-if="thinking" class="thinking-section">
      <div class="thinking-title" @click="showThinking = !showThinking">
        {{ thinkingTitle }}
      </div>
      <div v-show="showThinking" class="thinking-body">{{ thinking }}</div>
    </div>
    <div v-if="citations && citations.length" class="citation-section">
      <span class="citation-label">引用来源：</span>
      <span v-for="(c, i) in citations" :key="i" class="citation-tag" @click="$emit('cite-click', i)">
        [{{ i + 1 }}]
      </span>
    </div>
  </div>
</template>
```

- [ ] **步骤 11.2：H5 CitationDrawer.vue（vant popup）**

```vue
<template>
  <van-popup v-model:show="visible" position="bottom" round :style="{ height: '60%' }">
    <div class="citation-drawer">
      <div class="citation-title">引用来源</div>
      <div v-for="(item, i) in list" :key="i" class="citation-item" @click="open(item)">
        <div class="citation-index">[{{ i + 1 }}]</div>
        <div class="citation-content">
          <div class="citation-title-text">{{ item.title || '未知来源' }}</div>
          <div class="citation-snippet">{{ item.snippet || item.content || '' }}</div>
        </div>
      </div>
    </div>
  </van-popup>
</template>
```

- [ ] **步骤 11.3：Commit**

```bash
git add wk-train-center-ui/src/views/web/ai/components/AiAssistant/conversation/presentation/AiMessageMeta.vue \
        wk-mhc-mobile/src/pages/smart-training/components/ai/CitationDrawer.vue
git commit -m "feat(ui): AI 消息思考与引用 UI 组件"
```

---

## 任务 12：联调与回归测试

**步骤：**

- [ ] **步骤 12.1：后端启动验证**

```bash
cd e:/rhProject/wk-train-center-service
mvn clean package -DskipTests
java -jar wk-modules/wk-module-ai/target/wk-module-ai-*.jar
```

使用 curl 测试：

```bash
curl -N -X POST http://localhost:8080/api/wk/ai/agent/chat-stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"prompt":"hello","messages":[{"role":"user","content":"hello"}],"bizParams":{"promptKey":"answer_assistant"}}'
```

预期：返回 SSE 流，包含 `type=content`、`type=done` 事件（无 KB/WebSearch 时）。

- [ ] **步骤 12.2：v2 回归测试**

- 打开 AI 助手页面
- 发送文字、图片、文档消息
- 点击停止按钮确认 AbortController 生效
- 断开网络模拟超时，确认错误提示
- 开启 KB 搜索 → 确认 `tool_call`/`tool_result`/`citations` 事件正常
- 开启 WebSearch → 确认 `tool_call` event

- [ ] **步骤 12.3：H5 回归测试**

- 打开智能训练页面
- 发送消息并观察 Network 是否只请求 `/api/wk/ai/agent/chat-stream`
- 开启/关闭深度思考，确认 `thoughts` 字段展示
- 开启 KB/WebSearch，确认 `citations` 展示

- [ ] **步骤 12.4：切流与回滚**

- `localStorage.setItem('ai:useAgentGateway', '0')` → 切回老的 `chatAppStream` 直连百炼
- 后端 `application-ai.yml` 灰度白名单 `userIds: []` → 控制全量/白名单切流

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 后端代理引入额外延迟 | 首字响应变慢 | `SseEmitter` 同步转发百炼 SSE；后端与百炼同 Region 部署 |
| v2 与 H5 SSE 解析逻辑分叉 | 同一模型表现不同 | 后端 `MessageChunkClassifier` 统一拆 8 类型，前端只消费结果 |
| `thoughts`/`citations` 字段透传丢失 | UI 空白 | `extra_body: {enable_thinking: true}` 显式开启 |
| AbortController 中断后后端资源未释放 | 连接泄漏 | `SseEmitter` 超时 5 分钟 + `finally` 清理 Redis 限流键 |
| 切流开关误关闭导致回滚困难 | 线上问题 | `localStorage` 键统一命名 `ai:useAgentGateway` |
| ReAct 循环死循环 | 资源耗尽 | `maxIterations: 10` + `maxSearchCount: 5` 上限保护 |
| `type=raw` 透传百炼 JSON 半直连 | 前端继续依赖百炼 | D2 决策：M1 必须拆 `MessageChunkClassifier`，禁止长期存在 |

---

## 验收

- [ ] 后端 `mvn clean compile` + `mvn test` 通过
- [ ] 前端 v2 `npm run typecheck` + `npm run dev` 通过
- [ ] H5 `npx vitest run` 通过
- [ ] v2 答疑页 50 个真实问题答案与原直连 ≥ 95% 一致
- [ ] KB 检索后端走 `BailianService.knowledgeBaseSearch` 真实数据
- [ ] WebSearch 走 Tavily 真实数据
- [ ] 引用来源三端展示一致
- [ ] 异常统一:401/429/5xx 三端文案一致
- [ ] 灰度开关可控制切流
- [ ] 老的 `chatAppStream` 直连 100% 保留（M4 才删）

---

## 协作分工（最终）

- **Claude(我)**:任务 3~7(后端协议/DTO/客户端/配置/工具/ReAct/controller) + 任务 12 联调
- **Qoder**:任务 8~11(前端 v2/h5 切流 + 错误处理 + UI 增强)
- **主人**:D1~D5 拍板 + 灰度白名单 + 验收

---

## 关联资源

- vue 问答 demo 形态参考：[E:\otherProject\vue问答Demo\src\ReActA1.js](../../../../otherProject/vue问答Demo/src/ReActA1.js)（只读参考,不直接复用）
- vue 问答 demo prompt 参考：[E:\otherProject\vue问答Demo\src\prompts.js](../../../../otherProject/vue问答Demo/src/prompts.js)
- 后端已有百炼能力：[wk-module-file-source/BailianService.java](../../../../wk-train-center-service/wk-modules/wk-module-file-source/src/main/java/com/wk/traincenter/oss/service/BailianService.java)
- 百炼文件大小上限（KB 检索前必看）：[reference-bailian-file-size-limits.md](../../../../../../Users/RUHAI/.claude/projects/e--rhProject/memory/reference-bailian-file-size-limits.md)
- v2 端老直连：[src/api/ai/common.js](../../../../wk-train-center-ui/src/api/ai/common.js)
- v2 端老流式入口：[chatStreamGateway.js](../../../../wk-train-center-ui/src/views/web/ai/components/AiAssistant/conversation/infrastructure/chatStreamGateway.js)
- H5 端老直连：[src/api/ai-assistant.ts](../../../../wk-mhc-mobile/src/api/ai-assistant.ts)
- v3 端（本期不动）：[src/utils/ai/bailian.ts](../../../../wk-train-center-ui-v3/src/utils/ai/bailian.ts)

---

## 参与者

- 第一版:Claude（自建网关 4 阶段计划，2026-07-14）→ 归档于 `tasks/2026-07-14-self-ai-gateway(claude).md` 与 `design/2026-07-14-self-ai-gateway(claude)/`
- 第二版:Qoder（v2+h5 迁移计划 + 12 任务，2026-07-14）
- 主人 D1~D5 决策（2026-07-14）
- 第三版（**当前主计划**）:Claude + Qoder 联合,作废原 Claude 4 阶段计划,作废原 Qoder "阶段一/阶段二"切分,统一为 12 任务不分阶段

**最后更新时间**: 2026-07-14
**统一计划状态**: 第三版,待主人最终拍板
