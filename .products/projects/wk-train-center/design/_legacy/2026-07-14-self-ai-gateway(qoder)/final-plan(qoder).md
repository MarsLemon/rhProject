---
version: 1.0.0
project: wk-train-center
taskType: final-plan
status: PENDING-CLAUDE-REVIEW
createdAt: 2026-07-15T10:00:00+08:00
owner: Qoder (起草) → Claude (验收)
reviewPurpose: 本文档作为最终版实现计划,任务粒度细到 2 小时内可完成 + 明确验收标准
supersedes: 此前所有 v1 / v2 / 统一计划草稿
reviewer: Claude
---
# AI 业务网关 M1 实现最终计划（qoder 起草 / claude 验收）

> **本计划承接统一计划 v1.0+15 的所有决策**,重新组织任务粒度,使每块功能独立可验收。

## 一、总体目标与范围

| 维度   | 内容                                                     |
| ------ | -------------------------------------------------------- |
| 范围   | v2 + H5 两端 AI 调用从直连百炼迁到后端业务网关           |
| 任务数 | 16 个一级任务(任务 1~16)+ 内部子任务                     |
| 总估时 | 约 23 天(后端 17d + 前端 5.5d + 联调 0.5d)               |
| 验收方 | Claude(任务清单可逐项验收)                               |
| 路径   | 后端`/api/wk/ai/agent/chat-stream` SSE + v2 嵌入调试台 |

---

## 二、任务总览（16 任务一览）

| #  | 标题                                          | 负责人                             | 估时 | 依赖    |
| -- | --------------------------------------------- | ---------------------------------- | ---- | ------- |
| 1  | 统一 SSE chunk 协议(8 类型)                   | Claude                             | 0.3d | —      |
| 2  | 请求 DTO + 配置中心骨架                       | Claude                             | 0.5d | —      |
| 3  | ChatApiUtils 扩展纯模型流式                   | Claude                             | 1d   | —      |
| 4  | AgentConfigService 配置中心                   | Claude                             | 0.5d | 2       |
| 5  | ToolExecutor + ToolRegistry 接口              | Claude                             | 0.3d | 4       |
| 6  | KB + WebSearch 工具真实实现(含 MCP 留口)      | Claude                             | 1.5d | 5       |
| 7  | AgentReActExecutor(本期 ReAct 编排)           | Claude                             | 2d   | 3,5     |
| 8  | MessageChunkClassifier + Controller + Service | Claude                             | 1d   | 1,7     |
| 9  | v2 chatAgentStream 适配(前端切流)             | Qoder                              | 1.5d | 8       |
| 10 | v2 错误增强 + UI 组件                         | Qoder                              | 1d   | 9       |
| 11 | H5 chatAgentStream + UI 增强                  | Qoder                              | 1d   | 8       |
| 12 | 联调与回归测试(50 题基线)                     | 联合                               | 1d   | 9,10,11 |
| 13 | 精确缓存(同 query 命中)                       | Claude                             | 1d   | 8       |
| 14 | 成本埋点(按 user/promptKey)                   | Claude                             | 0.5d | 8       |
| 15 | Prompt 版本管理(yml version + git tag)        | Claude                             | 0.5d | 4       |
| 16 | AI 调试台(Playground,聚焦 KB + WebSearch)     | Claude 后端 0.8d + Qoder 前端 3.5d | 4.3d | 8       |

**后端总:约 17d · 前端总:约 5.5d · 联调:1d**

---

## 三、任务清单（逐项可验收）

### 任务 1:统一 SSE chunk 协议(8 类型)

**文件**:

- 创建:`wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AgentChatChunkVo.java`

**操作步骤**:

1. 新建 VO 类,字段:`type`/`content`/`thoughts`/`citations`/`toolCall`/`toolResult`/`files`/`errorCode`/`requestId`
2. 加 `@Data @Builder @NoArgsConstructor @AllArgsConstructor`
3. 8 种 type 注释清楚:content / thoughts / citations / tool_call / tool_result / file / error / done

**验收标准**:

- ✅ 类可被 Spring Jackson 序列化/反序列化
- ✅ 8 种 type 字符串与统一计划 §4 schema 完全一致
- ✅ 编译通过 `mvn -pl wk-modules/wk-module-ai -am compile`

**提交规范**:`feat(ai): 统一 AI 网关 SSE chunk 协议(8 类型)`

---

### 任务 2:请求 DTO + 配置中心骨架

**文件**:

- 创建:`wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AgentChatRequestDto.java`
- 修改:`wk-train-center-service/wk-modules/wk-module-ai/src/main/resources/application-ai.yml`(新建文件)

**操作步骤**:

1. DTO 字段:`prompt`/`messages[]`/`fileList`/`tools{enableKbSearch, enableWebSearch, enableThinking}`/`bizParams{promptKey, model, extra}`
2. **无 appId 字段**(主人 D2 决策废 App 模式)
3. yml 加 `ai-agent:` 顶层段,含 `models.default`/`prompts.answer_assistant`/`tools.knowledge_base_search.enabled` 等
4. DTO 加 `@NotEmpty` 校验 messages

**验收标准**:

- ✅ DTO 字段与统一计划 §4 schema 完全一致
- ✅ yml 加载无格式错误
- ✅ 编译通过

**提交规范**:`feat(ai): 请求 DTO + 配置中心骨架(废 appId)`

---

### 任务 3:ChatApiUtils 扩展纯模型流式

**文件**:

- 修改:`wk-train-center-service/yf-ability/src/main/java/com/yf/ability/ai/utils/ChatMsgUtils.java`
- 修改:`wk-train-center-service/yf-ability/src/main/java/com/yf/ability/ai/utils/chat/ChatApiUtils.java`

**操作步骤**:

1. `ChatMsgUtils` 新增方法 `genPureModelReqJson(model, systemMsg, userMsg, tools, toolChoice, stream, enableThinking)`,生成 OpenAI 兼容 payload
2. `ChatApiUtils` 新增方法 `startChatStream(apiUrl, apiKey, payload, onChunk)`,HTTP POST + SSE 流读取
3. **关键**:tool_calls 按 `index` 增量累积(参考 `ReActA1.js:447-490`)
4. **关键**:content 与 reasoning_content 双字段分流(参考 `memory 86d5a6b2`)
5. **不修改** `BailianConfigServiceImpl`(主人 D2 决策)

**验收标准**:

- ✅ 调用百炼 `/compatible-mode/v1/chat/completions` 端点返回 200
- ✅ 单元测试覆盖:tool_calls 增量累积 3 case、reasoning_content 分流 1 case
- ✅ 编译通过 + `mvn test` 通过

**提交规范**:`feat(ai): ChatApiUtils 支持百炼纯模型流式调用(messages + tools)`

---

### 任务 4:AgentConfigService 配置中心

**文件**:

- 创建:`wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/AgentConfigService.java`
- 创建:impl

**操作步骤**:

1. 接口方法:`getSystemPrompt(promptKey)` / `getDefaultModel()` / `isToolEnabled(toolName)` / `resolveTools(tools)` / `getMaxIterations()` / `getMaxSearchCount()`
2. 实现从 yml 读取并缓存(`@ConfigurationProperties` 或 `Environment` 注入)
3. **关键**:Tavily API Key 走 `CfgPropService` 读 type=`ai` provider=`web_search`(Claude §13.3 建议)

**验收标准**:

- ✅ 单测覆盖:`getSystemPrompt("answer_assistant")` 返回 yml 配置
- ✅ `getDefaultModel()` 返回 "qwen3-max"
- ✅ `isToolEnabled("web_search")` 返回 yml 配置 boolean
- ✅ 编译通过

**提交规范**:`feat(ai): AgentConfigService 配置中心`

---

### 任务 5:ToolExecutor + ToolRegistry 接口

**文件**:

- 创建:`wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/tool/ToolExecutor.java`
- 创建:`ToolRegistry.java`

**操作步骤**:

1. `ToolExecutor` 接口:`String name()` / `Map<String, Object> execute(Map<String, Object> args, String userId)`
2. `ToolRegistry` 实现:根据 tool name 路由,Spring `@Component` 注入实现类列表
3. **预留 MCP 兼容**:接口命名 + 实现类预留(本期不实现 MCP,但接口风格兼容)(主人 §13.9 A2)

**验收标准**:

- ✅ 接口编译通过
- ✅ Registry 可注入 KB + WebSearch 两个实现(后续任务 6 实现具体类)
- ✅ 单测:Registry 根据 name 路由到正确实现

**提交规范**:`feat(ai): 工具执行接口与注册中心(MCP 兼容预留)`

---

### 任务 6:KB + WebSearch 工具真实实现

**文件**:

- 创建:`tool/KnowledgeBaseSearchTool.java`
- 创建:`tool/WebSearchTool.java`
- 修改:`application-ai.yml`

**操作步骤**:

1. `KnowledgeBaseSearchTool`:注入 `BailianService`(从 `wk-module-file-source` 模块),`execute(args, userId)` 调 `bailianService.knowledgeBaseSearch(args.query, pipelineId, topK)`,pipelineId 从 `AgentConfigService` 读(Claude §13.1 建议后端化)
2. `WebSearchTool`:M1 调**阿里云百炼联网搜索 API**(主人 D10 决策 2026-07-15,**为主 provider**)。**统一鉴权 + 天然一致**;API Key 走 `CfgPropService` type=`ai` provider=`web_search`(同 D3 决策)。
   - **保留 Tavily 兼容**(主人 2026-07-15 复核):代码层 `WebSearchProvider` 接口留 `TavilyProvider` 实现,yml 可开启 `tavily` provider;**业主上全量启用不了要应急切 Tavily**(Bocha/秘塔备选 M2 加)
   - yml 默认仅启用 `bailian_web_search`;Tavily yml 段预置但 `enabled: false`,M1 不实际调用
3. yml `tools.web_search.providers: [{ name: bailian_web_search, priority: 1, enabled: true }, { name: tavily, priority: 2, enabled: false }]`,**apiKey 不写 yml**,走 `CfgPropService`;Tavily 段预置但默认关闭(业主上全量启用不了可应急切)
4. **新增(主人 §13.11 多轮搜索)**:WebSearch 工具允许**多轮调用**,同一 ReAct 周期可被调 N 次(直到 searchCnt 满或 LLM 主动结束),`react.max_search_count: 5` 为上限
5. 返回结构统一:`{ results: [{title, url, snippet, score}] }`

**验收标准**:

- ✅ KB 工具真实调通 `BailianService`,返回 ≥1 条结果
- ✅ WebSearch 工具真实调通百炼联网搜索 API,中文搜索结果
- ✅ **多轮搜索**:同一 ReAct 周期内可调 web_search 2~3 次,searchCnt 累计超过 5 时终止
- ✅ pipelineId 不再硬编码,从 yml 读(全仓 grep 验证)
- ✅ 单测覆盖:KB pipelineId 缺失抛异常、百炼 web_search apiKey 缺失抛异常、searchCnt 上限保护

**提交规范**:`feat(ai): KB + WebSearch 工具真实实现(百炼联网搜索 + 多轮)`

---

### 任务 7:AgentReActExecutor(本期 ReAct 编排)

**文件**:

- 创建:`wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/AgentReActExecutor.java`

**操作步骤**:

1. 主循环伪代码(Java 重写 vue demo `ReActA1.js:268-690`):
   - 循环 maxIter=10 / searchCnt=5
   - 调模型 → 解析 content/reasoning_content/tool_calls
   - 有 tool_calls → 路由工具 → 拼回 messages → 继续循环
   - 无 tool_calls → 终止 + emit done
2. SSE 事件 emit:`content` / `thoughts` / `tool_call` / `tool_result` / `citations` / `done`
3. 工具结果按 `name` 累积 searchCnt
4. **关键**:tool_calls 增量拼接(参考 `memory 86d5a6b2`)

**验收标准**:

- ✅ 单测覆盖 5 个 case:无工具 / KB / WebSearch / KB+WebSearch / searchCnt 满
- ✅ 单测验证 tool_calls 累积逻辑(拼接顺序、参数合并)
- ✅ 单测验证 reasoning_content 分流(Claude §13.2 建议)
- ✅ 单测验证 max_iterations 保护
- ✅ **多轮搜索验证**:同一 ReAct 周期可连续调 web_search 2~3 次(主人 §13.11),达到 `max_search_count: 5` 强制终止

**提交规范**:`feat(ai): ReAct 编排器(本期 M1 必做)`

---

### 任务 8:MessageChunkClassifier + Controller + Service

**文件**:

- 创建:`application/MessageChunkClassifier.java`
- 创建:`application/WkAiAgentService.java` + impl
- 创建:`controller/WkAiAgentController.java`
- 创建:`controller/WkAiAgentExceptionHandler.java`

**操作步骤**:

1. `MessageChunkClassifier`:百炼 chunk → 8 类事件,**强制分流 content/reasoning_content**(禁 `type=raw` 长期存在)
2. `WkAiAgentService`:编排入口,接收 DTO + `SseEmitter`,调 ReActExecutor
3. `WkAiAgentController`: `POST /api/wk/ai/agent/chat-stream`,Redis 限流 20s,SseEmitter 超时 120s(D7 决策),`onCompletion/onTimeout` 清理 Redis
4. `WkAiAgentExceptionHandler`:4 种 errorCode(`AI_AUTH_FAIL` / `AI_QUOTA_EXCEED` / `AI_TOOL_FAIL` / `AI_INTERNAL` / `AI_RATE_LIMIT`),`fallback: false`

**验收标准**:

- ✅ curl 测试 SSE 端点返回 200 + 8 类事件流
- ✅ 限流:同一用户 20s 内第二次调用返回 RATE_LIMIT 错误
- ✅ 异常场景:百炼 401 返回 `AI_AUTH_FAIL` + 中文文案
- ✅ 超时 120s 后 SSE 自动 complete
- ✅ grep 验证后端无 `type=raw` 透传(Claude §13.5 建议 4 条 grep)

**提交规范**:`feat(ai): MessageChunkClassifier + Controller + Service`

---

### 任务 9:v2 chatAgentStream 适配(前端切流)

**文件**:

- 修改:`wk-train-center-ui/src/api/ai/common.js`
- 修改:`wk-train-center-ui/src/views/web/ai/components/AiAssistant/conversation/infrastructure/chatStreamGateway.js`

**操作步骤**:

1. 新增 `chatAgentStream(options, callbacks, signal)`,POST `/api/wk/ai/agent/chat-stream`
2. 解析 8 类 SSE event,调 `onContent/onThought/onToolCall/onToolResult/onCitation/onFile/onError/onDone` 回调
3. `chatAppStream` 内部转发到 `chatAgentStream`,`localStorage('ai:useAgentGateway')` 默认 true
4. **删除** v2 老 `extractAppTextFromChunk` 调用(后端已拆好)
5. 灰度策略:服务端优先,前端开关作为本地调试辅助(主人 §13.8 决策)

**验收标准**:

- ✅ v2 答疑页 Network 请求为 `/api/wk/ai/agent/chat-stream` 而非 dashscope
- ✅ `localStorage('ai:useAgentGateway', '0')` 切回老 chatAppStream 直连(灰度回退可用)
- ✅ 文字/图片/文档消息可正常发送并接收
- ✅ 引用来源(citations)正常显示

**提交规范**:`feat(ai): v2 chatAgentStream 适配后端业务代理`

---

### 任务 10:v2 错误增强 + UI 组件

**文件**:

- 修改:`wk-train-center-ui/src/views/web/ai/components/AiAssistant/views/AiAssistant.vue`
- 新增:`wk-train-center-ui/src/views/web/ai/components/AiAssistant/conversation/presentation/AiMessageMeta.vue`

**操作步骤**:

1. `AiAssistant.vue` catch 块接 `classifyStreamError`,5 类错误分别提示(AUTH/RATE_LIMIT/SERVICE/NETWORK/UNKNOWN)
2. 错误时保留已生成内容 + 追加中断说明(沿用 H5 已有逻辑)
3. 新增 `AiMessageMeta.vue`:思考折叠面板 + 引用角标 + 工具调用可视化
4. 默认折叠 / 展开策略遵循 `memory a9d57052`(外部面板默认展开,内部详情默认折叠)

**验收标准**:

- ✅ 5 类错误分别显示对应中文文案
- ✅ 中断时已生成内容不丢失
- ✅ 思考面板外层默认展开,内层 detail 默认折叠
- ✅ 引用角标可点击弹出抽屉

**提交规范**:`feat(ui): v2 AI 错误分类 + 思考/引用 UI 组件`

---

### 任务 11:H5 chatAgentStream + UI 增强

**文件**:

- 修改:`wk-mhc-mobile/src/pages/smart-training/api/ai/common.ts`
- 修改:`wk-mhc-mobile/src/pages/smart-training/composables/ai/useChatSession.ts`
- 新增:`wk-mhc-mobile/src/pages/smart-training/components/ai/CitationDrawer.vue`
- 修改:`wk-mhc-mobile/src/pages/smart-training/components/ai/TrainingAssistantView.vue`

**操作步骤**:

1. 新增 `callAgentChatStream(options, onMessage, onDone, signal)` TypeScript 版
2. 8 类事件回调,复用 `classifyStreamError`(与 v2 共用一套分类函数)
3. `useChatSession.ts` 替换 `chatAppStream` → `callAgentChatStream`
4. 新增 `CitationDrawer.vue`(Vant `van-popup`),复用 v2 错误分类逻辑
5. `TrainingAssistantView.vue` 加加载骨架 + 重试按钮

**验收标准**:

- ✅ H5 Network 请求为 `/api/wk/ai/agent/chat-stream`
- ✅ vitest 测试 `common.chatStream.spec.ts` 通过(根据新实现更新测试)
- ✅ 引用抽屉可在 H5 中打开并查看引用条目
- ✅ 错误时 H5 提示与 v2 文案一致

**提交规范**:`feat(ai): H5 chatAgentStream + UI 增强`

---

### 任务 12:联调与回归测试(50 题基线)

**文件**:

- 新增:`wk-train-center-service/scripts/ai-baseline-diff.py`(语义相似度 diff 脚本)

**操作步骤**:

1. **任务 1 启动前**:主人提供 50 题清单,Qoder 并行采老直连基线,保存为 `baseline-answers.json`
2. 任务 9~11 完成后,用新链路跑同一批 50 题,保存为 `new-answers.json`
3. 跑 `ai-baseline-diff.py`,语义相似度 ≥ 95% 验收通过;< 95% → 回滚 + 优化 prompt
4. **grep 强制验证 4 条**(Claude §13.5 建议):
   - `grep "type.*raw" wk-train-center-ui/src/ wk-mhc-mobile/src/` → 0 命中
   - `grep "extractAppTextFromChunk" wk-train-center-ui/src/api/ai/ wk-mhc-mobile/src/pages/smart-training/api/ai/` → 0 命中
   - `grep "dashscope.aliyuncs.com" wk-train-center-ui/src/ wk-mhc-mobile/src/` → 0 命中
   - `grep "type.*raw" wk-train-center-service/wk-modules/wk-module-ai/src/` → 0 命中

**验收标准**:

- ✅ 50 题新链路语义相似度 ≥ 95%
- ✅ 4 条 grep 全部 0 命中
- ✅ v2 + H5 联调通过:文字/图片/文档/停止按钮/断网超时
- ✅ 切流与回滚:`localStorage('ai:useAgentGateway', '0')` 切回老链路 100% 可用

**提交规范**:`chore: M1 联调通过 + 灰度开关验证 + 50 题基线 diff`

---

### 任务 13:精确缓存(同 query 命中)

**文件**:

- 创建:`application/AgentCacheService.java`
- 修改:`application/WkAiAgentService.java`(注入 + 调用)

**操作步骤**:

1. 内存 LRU + TTL 缓存,key 为 `SHA256(promptKey + ":" + userId + ":" + messages[-2:].content)`
2. 命中:直接返回历史 answer(跳过模型调用)
3. 未命中:走 ReAct → 写入缓存
4. yml 加 `ai-agent.cache: { maxSize: 1000, ttlSeconds: 300 }`
5. 仅缓存 `enableWebSearch=false && enableKbSearch=false` 的简单场景(避免 KB 结果过期)

**验收标准**:

- ✅ 单测覆盖:同 query 第二次调用跳过模型(Spy 验证)
- ✅ 不同 promptKey 互不命中
- ✅ 不同 userId 互不命中
- ✅ TTL 过期后重新调模型

**提交规范**:`feat(ai): 同 query 精确缓存(节省 token)`

---

### 任务 14:成本埋点(按 userId/promptKey)

**文件**:

- 创建:`application/AgentMetricsService.java`
- 修改:`application/WkAiAgentService.java`

**操作步骤**:

1. Redis 计数器,key 格式:`ai:metrics:token:{userId}:{promptKey}:{YYYYMMDD}`
2. 每次调用结束写入:`tokens_input` / `tokens_output` / `latency_ms` / `cache_hit`
3. 写入 `LogInject(title = "AI_METRICS")` 业务日志
4. 提供 `/api/wk/ai/agent/metrics/me` GET 接口,返回当前用户最近 7 天统计(用于未来可视化)

**验收标准**:

- ✅ Redis 可见按 userId/promptKey 维度的计数 key
- ✅ LogInject 日志格式包含上述 4 个字段
- ✅ 调用后能在 Redis 中查到当天 key 自增
- ✅ 单测覆盖:计数器自增、key 格式正确

**提交规范**:`feat(ai): 成本埋点(按 user/promptKey)`

---

### 任务 15:Prompt 版本管理(yml version + git tag)

**文件**:

- 修改:`application-ai.yml`
- 新增:`docs/prompt-versions.md`(版本日志)

**操作步骤**:

1. yml 每个 prompt 加 `version` 字段:`answer_assistant: { version: "1.0.0", content: "..." }`
2. 后端启动时校验:同一 prompt 的 version 必须 ≥ 历史最高(防止误降级)
3. 维护 `prompt-versions.md`:每次改动一行记录(版本号 / 改动人 / 改动说明 / git tag)
4. 回滚指引:`git checkout <tag> -- application-ai.yml` + 重启服务

**验收标准**:

- ✅ `getSystemPrompt("answer_assistant")` 返回的 Map 含 version 字段
- ✅ yml 加载校验:version 倒退抛异常(单元测试)
- ✅ `prompt-versions.md` 至少有 1 条初始记录
- ✅ 重启服务后 version 自增可被前端调试台读到

**提交规范**:`feat(ai): Prompt 版本管理(yml version + git tag)`

---

### 任务 16:AI 调试台(Playground,聚焦 KB + WebSearch)

**16.1 后端 API(Claude,0.8d)**

**文件**:

- 创建:`controller/PlaygroundController.java`

**操作步骤**:

1. `GET /api/wk/ai/agent/playground/config` 返回 promptKey 列表 / model 列表 / KB pipelineId 列表 / WebSearch providers 列表(Qoder §13.11 补充要求)
2. `GET /api/wk/ai/agent/playground/kb` 返回 pipeline 列表(从 BailianService 读)
3. `POST /api/wk/ai/agent/playground/websearch` 直跑 WebSearch,Body `{query, providers[], topK}`,Response 含 `latency_ms` 字段(Qoder §13.11 补充要求)
4. `POST /api/wk/ai/agent/playground/run` 复用 `/api/wk/ai/agent/chat-stream`,支持自定义 system prompt 覆盖

**验收标准**:

- ✅ 4 个 endpoint 全部返回 200 + 正确结构
- ✅ `/playground/websearch` 多 provider 并行跑,返回各 provider 的 latency_ms
- ✅ `/playground/run` 可手动覆盖 system prompt

**提交规范**:`feat(ai): Playground 调试台后端 API`

---

**16.2 前端骨架(Qoder,1d)**

**文件**:

- 新增:`wk-train-center-ui/src/views/web/ai/components/Playground/index.vue`
- 修改:`wk-train-center-ui/src/router/index.js`(加菜单路由)
- 修改:`wk-train-center-ui/src/views/admin/AdminLayout.vue` 或顶部菜单(加菜单入口)

**操作步骤**:

1. 单页布局:左侧配置面板(system prompt / 模型下拉 / 工具开关)+ 右侧调试区(问题输入 + 8 类 SSE 渲染)
2. **用 Element UI textarea + 占位符预览**(Qoder §13.11 修正 1,不用 Monaco)
3. 顶部菜单加 "AI 调试台" 入口(v2 项目内)
4. 8 类 SSE 事件流用 Element UI Timeline / Collapse 渲染

**验收标准**:

- ✅ v2 顶部菜单有"AI 调试台"入口
- ✅ 进入页面左侧配置面板可选择 promptKey + model + 工具
- ✅ 右侧问题输入框可输入并触发 ReAct
- ✅ 8 类 SSE 事件实时渲染(逐步显示)

**提交规范**:`feat(ui): AI 调试台骨架 + 8 类 SSE 渲染`

---

**16.3 KB 调试 UI(Qoder,0.5d)**

**文件**:

- 修改:`wk-train-center-ui/src/views/web/ai/components/Playground/index.vue`(加 KB 标签页)

**操作步骤**:

1. 调 `/playground/kb` 加载 pipeline 列表
2. 选中 pipeline → 输入 query → 调 ReAct → 在 tool_result 事件中高亮显示召回片段
3. 对比模式切换:勾选"启用 KB" vs 不勾,看答案差异(主人 §13.10.3)

**验收标准**:

- ✅ pipeline 列表可下拉选择
- ✅ 召回片段以高亮 + 引用形式显示
- ✅ 对比模式切换生效

**提交规范**:`feat(ui): KB 调试面板(pipeline + 召回预览)`

---

**16.4 WebSearch 调试 UI(Qoder,0.5d)**

**文件**:

- 修改:`Playground/index.vue`(加 WebSearch 标签页)

**操作步骤**:

1. 调 `/playground/websearch` 接口,多选 providers + 输入 query
2. N 列对比展示各 provider 检索结果(title/url/snippet)+ latency_ms
3. 勾选"启用工具调用"=走完整 ReAct;不勾=直接 web_search 单跑
4. **provider 下拉默认只显示 `bailian_web_search`**(主人 D10 主选);M1 保留 Tavily 选项在列表(业主上应急切场景,主人 2026-07-15 复核),但**默认不勾选**;M2 加备选 provider(Bocha/秘塔)时再补全下拉

**验收标准**:

- ✅ provider 下拉默认显示 `bailian_web_search` + `tavily` 两个选项,默认仅勾选 `bailian_web_search`
- ✅ 多 provider 同时检索,N 列对比展示
- ✅ latency_ms 字段可见
- ✅ 单跑 vs ReAct 模式切换生效

**提交规范**:`feat(ui): WebSearch 调试面板(多 provider 对比)`

---

**16.5 提示词编辑器 + 实时调试(Qoder,1d,Qoder §13.11 修正)**

**文件**:

- 修改:`Playground/index.vue`(加提示词编辑 + 占位符预览 + 调试运行)

**操作步骤**:

1. system prompt 编辑器:Element UI `<el-input type="textarea">` + 占位符高亮(`{{jdoc}}` / `{{$doc_name}}` 实时替换预览)
2. 调试运行:输入问题 → 调 `/playground/run` → 渲染 8 类 SSE
3. **拆 2 步实施**(Qoder §13.11 修正 2):
   - 16.5a 占位符预览 + 提示词实时渲染(0.5d)
   - 16.5b 8 类 SSE 事件流渲染 + 工具调用可视化(0.5d)

**验收标准**:

- ✅ system prompt 编辑器可修改并实时预览占位符替换
- ✅ 输入问题触发 ReAct,8 类 SSE 事件实时渲染
- ✅ 工具调用事件(tool_call / tool_result)清晰展示执行过程

**提交规范**:`feat(ui): 提示词编辑器 + 实时调试运行`

---

**16.6 集成 + 联调(联合,0.5d)**

**操作步骤**:

1. 16.1~16.5 全部完成后,v2 启动登录 → 顶部菜单进入"AI 调试台"
2. 测试 4 个核心场景:简单问答 / KB 检索 / WebSearch / 完整 ReAct
3. 任务 12 已完成的 50 题基线 diff 再次跑一遍(确认调试台与生产接口一致)

**验收标准**:

- ✅ 调试台 4 个场景全部可用
- ✅ 调试台结果与生产接口结果一致(同一问题)
- ✅ 联调记录写在 `docs/playground-acceptance.md`

**提交规范**:`chore: Playground 联调通过`

---

## 四、跨任务验收硬性标准(全程必查)

Claude 在每一项任务验收时,以下 4 项**必须**验证:

| # | 验证项   | 命令/方法                                                         |
| - | -------- | ----------------------------------------------------------------- |
| 1 | 后端编译 | `mvn -pl wk-modules/wk-module-ai -am clean compile -DskipTests` |
| 2 | 后端单测 | `mvn -pl wk-modules/wk-module-ai -am test`                      |
| 3 | v2 编译  | `npm run typecheck`(如有)+ `npm run dev` 起服务               |
| 4 | H5 编译  | `npx vitest run` + `npm run typecheck`(如有)                  |

**Claude 验收结果判定**:

- 全部 ✅ → 通过,标记任务完成,可进入下一项
- 任一项 ❌ → 打回,Qoder / Claude 修复后重新验收

---

## 五、跨任务全局验收(任务 12 完成后跑一次)

| 项                               | 命令                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| v2 无`type=raw`                | `grep -rn "type.*raw\|'raw'\|\"raw\"" wk-train-center-ui/src/ --include="*.js" --include="*.ts" --include="*.vue"` |
| v2 无`extractAppTextFromChunk` | `grep -rn "extractAppTextFromChunk" wk-train-center-ui/src/api/ai/`                                              |
| H5 无`type=raw`                | 同上,目录`wk-mhc-mobile/src/`                                                                                    |
| H5 无`dashscope`               | `grep -rn "dashscope.aliyuncs.com\|bailian.aliyuncs.com" wk-mhc-mobile/src/`                                      |
| 后端无`type=raw`               | `grep -rn "type.*raw\|type.*=.*\"raw\"" wk-train-center-service/wk-modules/wk-module-ai/src/`                     |
| v2 无`pipeline_id` 硬编码      | `grep -rn "t7tv9lmp6f\|pipeline_id\|pipelineId" wk-train-center-ui/src/ wk-mhc-mobile/src/`                        |

**全部预期 0 命中**。

---

## 六、风险与回退

| 风险                                 | 等级 | 缓解                                                                    | 回退                                |
| ------------------------------------ | ---- | ----------------------------------------------------------------------- | ----------------------------------- |
| 后端代理引入额外延迟                 | 中   | SseEmitter 同步转发百炼 SSE                                             | `ai:useAgentGateway=0` 切回老链路 |
| 纯模型 + 自建 ReAct 出 bug           | 高   | 任务 7 单测覆盖 5 case + 任务 12 50 题基线 diff                         | 临时走百炼 App 模式(老代码保留)     |
| 缓存命中错误答案                     | 中   | 仅缓存`enableWebSearch=false && enableKbSearch=false` 场景 + 短期 TTL | 删除`AgentCacheService` bean 即可 |
| WebSearch 跨境失败(Bocha 应无此问题) | 低   | Bocha 国内服务 + 备选秘塔/360(本期 M2 加)                               | `tools.web_search.enabled=false`  |
| 调试台影响生产                       | 低   | 调试台路由单独权限控制(仅后端/管理员可见)                               | 删除菜单入口                        |

---

## 七、协作铁律

- **Qoder 负责**:任务 9~11 + 16.2~16.6(前端)
- **Claude 负责**:任务 1~8 + 13~15 + 16.1(后端)
- **联合负责**:任务 12 联调 + 任务 16.6 联调
- **不动对方文件**:任何修订直接落到本文件,统一计划文件已作废
- **Claude 验收**:每项任务完成后,Qoder/Claude 在本文件 §三 对应任务后追加 ✅/❌ 标记

---

## 八、计划变更日志

- **2026-07-15 v1.0.0**:Qoder 起草最终版,基于统一计划 v1.0+15(2026-07-14~15 累积决策)
- **2026-07-15 v1.0.0+D10**:同步主人 D10 决策 → 任务 6 改用阿里云百炼联网搜索(原 Bocha/Tavily 作废) + yml 同步 + 任务 16.4 调试台 provider 默认只显示 `bailian_web_search` + 任务 6/7 验收加多轮搜索验证
- 作废:`tasks/2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md`(已迁移至此)

**待 Claude 验收**:每项任务的"验收标准"是否合理、是否需要补充、估时是否可行。
