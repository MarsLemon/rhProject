---
version: 1.0.0
project: wk-train-center
taskType: industry-benchmark
status: draft
createdAt: 2026-07-14T18:30:00+08:00
relatedPlan: ../../../tasks/2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md
authors:
  - Claude(调研+主笔)
tags:
  - ai-gateway
  - react
  - benchmark
  - 2025-2026
---

# 业界 AI 网关 + ReAct 编排对标报告(2025-2026 / claude 调研)

> **目的**:把我们自建 AI 网关设计 vs 业界主流方案对标,识别**业界对得上的**(增信心)、**业界罕见的**(可能是创新也可能是反模式)、**业界有我们缺的**(补漏)。
> **范围**:LLM Gateway / Agent ReAct 编排 / SSE 事件协议 / KB+WebSearch 集成
> **调研时间**:2026-07-14
> **方法**:基于训练数据 + 内置 WebSearch 检索 2025-2026 主流方案,无外部 browse 工具

---

## 1. 自建 AI 网关(LLM Gateway)对标

### 1.1 主流方案矩阵

| 方案 | 类型 | 协议层 | 多 Provider 路由 | 配置中心 | 限流 | 灰度 |
|---|---|---|---|---|---|---|
| **Portkey** | SaaS/开源网关 | OpenAI/Anthropic 兼容 | ✅ 优先级+权重 | yml + UI | ✅ 滑动窗口 | ✅ AB |
| **LiteLLM** | 开源 Python | OpenAI 兼容 | ✅ 50+ providers | yml | ✅ RPM/TPM | ✅ 路由 |
| **OpenRouter** | 商业 SaaS | OpenAI 兼容 | ✅ 模型路由 | API | ✅ 配额 | ❌ |
| **Dify** | 自托管平台 | OpenAI 兼容 + 自有 | ✅ | DB | ✅ | ✅ |
| **OneAPI** | 开源 Go | OpenAI 兼容 | ✅ 30+ | yml + DB | ✅ | ✅ |
| **Coze(扣子)** | 商业平台 | 私有 | ❌(单 provider) | UI | ✅ | ❌ |
| **Spring AI** | 框架 | 多协议适配 | ✅ 抽象 ChatClient | Java config | ✅ 框架级 | ❌ |
| **OpenAI Proxy** | 轻量代理 | OpenAI 兼容 | ✅ | yml | ✅ | ❌ |
| **Helicone** | 观测优先 | OpenAI 兼容 | ✅ | DB | ✅ | ✅ |

### 1.2 我们的设计 vs 业界

| 维度 | 我们设计 | 业界主流做法 | 一致性 |
|---|---|---|---|
| 后端转发 | `SseEmitter` MVC 透传 | Portkey/Spring AI 同款 | ✅ |
| 多 Provider 抽象 | 暂用 ChatApiUtils 静态调,M2 加抽象 | LiteLLM `Router` 抽象 | ⚠️ 暂简,合理 |
| 限流 | Redis 20s/userId 简单窗口 | 滑动窗口 + 令牌桶 | ⚠️ 简单,够用 |
| 灰度 | localStorage + yml userId 白名单 | Portkey AB test + 用户分桶 | ✅ 主流做法 |
| 敏感配置 | `CfgPropService` (主人决策) | Vault / K8s Secret / .env | ✅ 与本仓一致 |

---

## 2. Agent / ReAct 编排框架对标

### 2.1 主流方案矩阵

| 框架 | 语言 | ReAct 模式 | 工具调用 | 流式 | 状态机 |
|---|---|---|---|---|---|
| **LangChain** | Python/JS | `AgentExecutor` | `bind_tools()` | ✅ | 单循环 |
| **LangGraph** | Python/JS | **图状态机** | Node 工具 | ✅ | DAG |
| **AutoGen** | Python | 多 Agent 对话 | Function call | ✅ | 对话式 |
| **CrewAI** | Python | 角色协作 | 工具 | ✅ | 多 Agent |
| **Semantic Kernel** | C#/Python | Planner | Function call | ✅ | 单循环 |
| **Spring AI** | Java | `ChatClient` + advisor | `Function` | ✅ | 单循环 |
| **Spring AI Alibaba** | Java | DashScope Agent | ✅ | ✅ | 单循环 |
| **阿里百炼 App** | 商业 | **服务端 ReAct**(自家) | ✅ | ✅ | 隐式 |
| **Coze** | 商业 | 工作流 DAG | Node 工具 | ✅ | DAG |
| **Smolagents** | Python | CodeAgent | Function | ✅ | 单循环 |

### 2.2 我们的设计 vs 业界

| 维度 | 我们设计 | 业界主流做法 | 一致性 |
|---|---|---|---|
| 模式 | 单循环 `while(iter<max)` | LangChain `AgentExecutor.scratchpad` | ✅ 主流 |
| 工具注册 | `ToolRegistry` Map | LangChain `Tool` 列表 / Spring AI `FunctionCallback` | ✅ |
| 工具执行同步/异步 | 同步 execute | LangGraph 异步 Node | ✅ 单 ReAct 够用 |
| 工具结果回填 | `messages.add(tool_result)` | LangChain `ToolMessage` | ✅ |
| 状态持久化 | 无(单次会话) | LangGraph checkpointer | ❌ 我们没做,但 M1 阶段合理 |
| 熔断 | `max_iterations: 10` + `max_search_count: 5` | LangChain `max_iterations=15` 默认 | ✅ |
| ReAct 提示词 | 后端 yml 配 | LangChain `PromptTemplate` / Spring AI `SystemMessage` | ✅ |

### 2.3 业界罕见(我们独特)

| # | 我们的设计 | 业界做法 | 评价 |
|---|---|---|---|
| 1 | `promptKey` 抽象(选 yml prompt) | 直接传完整 system prompt | ✅ 抽象更优雅,业务侧切换友好 |
| 2 | 数组化 `thoughts` items(累积) | LangChain `intermediate_steps`(元组列表) | ✅ 思路一致,我们可读性更好 |
| 3 | `SseEmitter` 2 分钟超时 + `onCompletion` 显式清理 | LangChain 无超时,默认无限 | ✅ 业界没有,我们加上更稳 |

---

## 3. SSE 8 类型事件协议对标

### 3.1 业界事件协议对比

| 方案 | 事件类型数 | 流式粒度 | 关键事件 |
|---|---|---|---|
| **OpenAI ChatCompletion** | 3 (`content`/`role`/`finish_reason`) | token 级 | `data: {choices:[{delta:...}]}` |
| **OpenAI Assistants** | 12 (`thread.*` / `run.*` / `message.*` 等) | 步骤级 | `thread.run.created` / `thread.run.step.delta` |
| **Anthropic Messages** | 6 (`message_start` / `content_block_*` / `message_*` / `ping` / `error`) | token 级 | `content_block_delta` / `ping`(心跳)/ `message_delta` |
| **Google Gemini** | 4 (`content` / `citationMetadata` / `finishReason` / `safetyRating`) | token 级 | inline_data |
| **Dify 工作流** | 8 (`message`/`message_end`/`tts_message`/`tts_message_end`/`message_replace`/`error`/`ping`/`workflow_finished`) | 节点级 | `workflow_finished` 收尾 |
| **Coze(扣子)工作流** | 5 (`message`/`function_call`/`audio`/`verbose`/`done`) | 节点级 | `function_call` + `audio` |
| **阿里百炼 App Completion** | 隐式(无 type 字段,看 `output.thoughts`/`doc_references` 字段) | token 级 | 自定义 |
| **Portkey(日志)** | 透传上游 | 透传 | 透传 |

### 3.2 我们的 8 类型 vs 业界

| 我们的 type | 业界对标 | 一致性 |
|---|---|---|
| `content` | OpenAI `delta.content` / Dify `message` | ✅ 标准 |
| `thoughts` | OpenAI o1 `reasoning_tokens` / Anthropic `thinking` block | ✅ 业界有,我们落地早 |
| `tool_call` | OpenAI `delta.tool_calls` / Coze `function_call` | ✅ 标准 |
| `tool_result` | LangChain `ToolMessage` / Dify 节点输出 | ✅ 标准 |
| `citations` | Gemini `citationMetadata` / 百炼 `doc_references` | ✅ 标准 |
| `file` | Dify `tts_message` / Gemini `inline_data` | ✅ 合理收敛 |
| `error` | 业界一致 | ✅ |
| `done` | OpenAI `finish_reason` / Dify `workflow_finished` | ✅ |

**结论**:8 类型完整,无冗余,无缺失(仅缺 `ping` 心跳,见下条)。

### 3.3 业界有我们缺的(🔴 必补)

| # | 业界 | 缺什么 | 补法 |
|---|---|---|---|
| 1 | **Anthropic/Dify 都有 `ping` 事件** | SSE 长连接中,中间代理/CDN 会超时切断(`30s~60s` 无数据就断),需要心跳保活 | 加 `type=ping` 事件,每 15s 发一次,内容 `{ts: 1700000000}` |
| 2 | **OpenAI `usage` 字段** | 缺 token 计量埋点 → 无法计费、无法做限流优化 | `type=done` 事件增 `usage{prompt_tokens, completion_tokens, total_tokens}` 字段 |
| 3 | **OpenAI `system_fingerprint`** | 缺模型版本追溯 | `type=done` 增 `model` 字段,便于灰度时按 model diff 答案 |

---

## 4. 私有知识库 + 联网搜索 + Function Calling 集成

### 4.1 主流方案

| 方案 | KB 检索 | 联网搜索 | 工具编排 | RAG 增强 |
|---|---|---|---|---|
| **LangChain** | `VectorStoreRetriever` + BM25 | Tavily/SerpAPI/Google | `Tool` 列表 | Reranker |
| **LlamaIndex** | 索引抽象 | 同上 | QueryEngine | HyDE |
| **Spring AI** | `VectorStore` 抽象 | 自由 | `Function` | 自由 |
| **Dify** | 内置知识库 | 联网插件 | 工作流 | 内置 |
| **Coze** | 内置知识库 | 联网插件 | 工作流 | 内置 |
| **阿里百炼 App** | **OSS + 索引** | 自带 | 服务端 ReAct | 自带 |
| **我们** | **复用 BailianService** | **Tavily** | **自建 ToolRegistry** | **暂无** |

### 4.2 我们设计 vs 业界

| 维度 | 我们设计 | 业界 | 评价 |
|---|---|---|---|
| KB 检索 | 复用 `BailianService.knowledgeBaseSearch` | 自建向量库 / Pinecone / Milvus | ✅ 复用现成,合理 |
| WebSearch | 单 provider Tavily | 多 provider + 路由(SerpAPI/Brave/Tavily) | ⚠️ M1 单 provider 够,M2 加路由 |
| 工具编排 | `ToolRegistry` 静态注册 | LangChain 动态 load / Dify UI 配置 | ✅ 单 ReAct 够用 |
| 重排序 | **无** | Cohere Rerank / BGE Rerank | ⚠️ 检索质量打折,M2 考虑 |
| HyDE / 多查询 | **无** | LlamaIndex / LangChain | ⚠️ M2 考虑 |

---

## 5. 业界罕见(可能是反模式,需要主人判断)

| # | 我们的设计 | 业界做法 | 是否反模式 |
|---|---|---|---|
| 1 | **`<<<suggest>>>` 文本块前端剥离**(v1 调研时主人提到,联合版没提) | OpenAI 1.x 早期产品/Coze 用结构化字段 `suggested_questions: []` | ⚠️ **是反模式**。如果落地,改用结构化字段 `type=suggestion` |
| 2 | **灰度基于 userId 白名单** | Portkey / OpenRouter 用请求级别 AB 路由(同一用户可能命中不同版本) | ⚠️ 不是反模式,但粒度粗 |
| 3 | **直接调 `/compatible-mode/v1/chat/completions`**(不走 provider 抽象) | LiteLLM/Spring AI 都有 `ProviderRouter` | ⚠️ M1 简,M2 必加抽象 |

---

## 6. 业界有但我们没考虑(🔴 必补 2 条 + 🟡 建议 3 条)

### 6.1 🔴 必补(M1 不加后期补成本 >> 一次加对)

| # | 业界标配 | 我们缺什么 | 补法 |
|---|---|---|---|
| 1 | **`type=ping` SSE 心跳** | 长连接 30-60s 无数据会被 nginx/CDN 切断 | 后端每 15s 发 `{type: "ping", ts: ...}`,前端忽略即可 |
| 2 | **`type=done` 含 `usage` 字段** | token 计量 → 计费 / 限流优化 / 成本分析 | `done` 增 `{usage: {prompt_tokens, completion_tokens, total_tokens}, model: "qwen3-max"}` |

### 6.2 🟡 建议(M2 或更后再补)

| # | 业界做法 | 价值 | 时机 |
|---|---|---|---|
| 1 | **Observability/Trace 链** (Langfuse / LangSmith / Phoenix OTel) | 调试、监控、问题定位 | M2 加,接 OpenTelemetry |
| 2 | **多租户配额**(管理员/学员/陪练不同 RPM) | 防止单一用户/角色刷爆配额 | M2 |
| 3 | **流式中断恢复**(OpenAI 支持 stream resume) | 长文场景网络中断后可续传 | M3+ 再说 |

---

## 7. 总体结论

| 维度 | 评分 | 说明 |
|---|---|---|
| 整体方向 | **A** | 4 块设计与业界 2025-2026 主流范式高度对齐 |
| ReAct 编排 | **A-** | 与 LangChain/Spring AI 思路一致,工程实现可学 |
| SSE 协议 | **B+** | 8 类型完整,但**缺 `ping` 心跳 + `usage` 计量 2 项必补** |
| KB/WebSearch 集成 | **B** | M1 复用现成 OK,M2 需加重排序 + HyDE |
| 灰度/限流 | **A-** | 双端灰度(主人 §13.4 决策)与 Portkey 做法一致 |
| 配置中心 | **A** | `CfgPropService` 与本仓一致,业界也用 Vault/K8s Secret |

---

## 8. 主人必拍板项(3 项)

1. **M1 是否增 `ping` + `usage` 事件?**(业界标准,M1 一次加对成本最低)
2. **出题 appKey `quiz_gen_agent` + 大模型选型(`qwen3-max` vs `deepseek-v3`)**:D7 决策"出题 P2 不动",但 promptKey 列表里还留着 `quiz_generator`,要不要本期一并做?
3. **自有会话历史合规评估**:船员培训是否需留痕(法规要求),决定 M3 落库还是 v1.1 再说。当前联合版 §10 "D1~D8 收敛"过于乐观,**实际有 11 项决策**需要主人再次确认。

---

## 9. 关联文档

- [统一计划 v1.0](2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md)
- [Claude §13 补充建议](../2026-07-14-self-ai-gateway(claude)/README.md)
- vue demo 参考:`E:\otherProject\vue问答Demo\src\ReActA1.js`

---

**调研完成时间**:2026-07-14
**作者**:Claude(claude)
**版本**:v1.0
