---
version: 2.0.0
project: wk-train-center
taskType: industry-benchmark
status: final-for-m1-decision
createdAt: 2026-07-14T19:00:00+08:00
relatedPlan: ../../../tasks/2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md
supersedes: 2026-07-14-industry-benchmark(claude).md
authors:
  - Claude(4 份调研综合)
tags:
  - ai-gateway
  - react
  - benchmark
  - rag
  - sse-protocol
  - 2025-2026
---

# 业界 AI 网关 + ReAct 编排对标报告 v2(2025-2026 / claude 综合)

> **v2 增**:第 3 份(SSE 事件协议 11 款)+ 第 4 份(RAG + WebSearch)结论并入
> **v1 保留**:整体对标 + 网关 8 款产品
> **结论**:M1 必加 4 类 SSE 事件 + 选型 Tavily;M2 抄 Portkey fallback/限流/cache;M3 BGE-rerank + CRAG

---

## 一、4 份调研核心结论速览

| # | 调研主题 | 关键发现 | 落地建议 |
|---|---|---|---|
| 1 | 整体对标 + 反模式 | 整体对齐,3 个反模式 | M1:改 `<<<suggest>>>` 为结构化;M2 加 provider 抽象 |
| 2 | 网关 8 款产品(Portkey/LiteLLM/Higress/...) | 像 Portkey > LiteLLM > Higress | M2 抄 fallback 嵌套 + token 限流 + semantic cache |
| 3 | **SSE 事件协议 11 款(OpenAI/Anthropic/Gemini/Dify/Coze/...)** | 我们 8 类型**chat 满分,agent 缺 4 类** | 🔴 **M1 必加**:`usage`独立 / `metadata` / `progress` / `interrupt` |
| 4 | **RAG + WebSearch(Tavily/Brave/SerpAPI/阿里云 IQS)** | Tavily 首选 Agent 联网 | 🔴 **M1 必做** Tavily 接入;**M2 抄** GPTCache semantic cache;M3 BGE-rerank + CRAG |

---

## 二、SSE 事件协议 v2 schema(12 类型,chat 满分 + agent 必需)

### 原 8 类型 + 4 类新

```
content | thoughts | tool_call | tool_result | citations | file |
metadata | progress | usage | interrupt | error | done
```

### 每类业界对照(11 款产品数据点)

| 我们 type | 业界形态 | 来源 |
|---|---|---|
| `content` | OpenAI `delta.content` / Anthropic `content_block_delta(text)` / Gemini `parts[].text` | 100% 共识 |
| `thoughts` | Anthropic `thinking_blocks` / DeepSeek `reasoning_content` / Gemini `thought` part / Dify `agent_thought` | 命名分歧,schema 需含 `signature`/`reasoning_effort` 兼容 |
| `tool_call` | OpenAI `delta.tool_calls[*].function` / Dify `agent_thought.tool` | 100% |
| `tool_result` | Dify `agent_thought.observation` / OpenAI Realtime `function_call_output` | 80%,建议加 `is_error` + `status_code` |
| `citations` | Gemini `groundingChunks` / Dify `retriever_resources` / Anthropic `citations` 块 | 含 `document_id`/`segment_id`/`score`/`url`/`title` |
| `file` | Dify `message_file` / Coze `image` event / Gemini `inline_data` | ⚠️ **不要与 citations 合并**,加 `category: image/audio/video/document/pdf` |
| `metadata` 🔴 新 | Anthropic `message_start.model` / Dify `execution_metadata` / Spring AI advisor | 透传 model/trace_id/conversation_id |
| `progress` 🔴 新 | Dify `node_started`/`node_finished` / LangGraph `tasks` mode | `step_index` + `total_steps` + `node_type`,前端画 timeline |
| `usage` 🔴 新 | OpenAI `usage` (opt-in `include_usage`) / Anthropic `message_delta.usage` / Gemini `usageMetadata` / Dify `message_end.metadata.usage` | 64% 共识,流末或倒数第二 chunk |
| `interrupt` 🔴 新 | OpenAI Assistants `thread.run.requires_action` / Coze `INTERRUPT` / LangGraph `values` mode | human-in-the-loop,M2 真正实现,M1 schema 预留 |
| `error` | OpenAI/Anthropic 扁平 / Dify 平面 / Coze 嵌套 3 派 | 91% 共识,推荐 `{type, code, message, http_status, retryable, cause}` |
| `done` | OpenAI Chat `[DONE]` 哨兵 / Anthropic `message_stop` / Dify `workflow_finished` / Coze 隐式 4 派 | 8/11 共识,推荐 `type:"done"` + 内嵌 `usage` + `conversation_id` |

### error envelope 业界 3 派(推荐我们用)

```json
// OpenAI/Anthropic 扁平
{ "type": "error", "error": { "type": "...", "code": "...", "message": "..." } }

// Dify 平面
{ "type": "error", "status": 500, "code": "...", "message": "..." }

// Coze 嵌套
{ "type": "error", "error": { "error_message": "...", "error_code": "..." } }
```

**推荐**:
```json
{ "type": "error", "code": "AI_AUTH_FAIL|AI_QUOTA_EXCEED|...", "message": "...", "http_status": 500, "retryable": true, "cause": "..." }
```

### v3+ 预留(本期不做)

`audio` / `message_replace` / `refusal` / `logprobs` / `safetyRatings`

---

## 三、RAG + WebSearch 选型(M1~M3 路径)

### WebSearch 工具对照

| 工具 | 价格(2025) | 适合 | 选型 |
|---|---|---|---|
| **Tavily** | Free 1000/月,Researcher/Pro/Enterprise 阶梯 | Agent 通用 + 自带 answer 字段(LLM 友好) | ✅ **M1 首选** |
| **Brave Search** | Free 1 QPS,Pro $3/月 20 QPS,Data for AI $9 CPM 无月限 | 成本敏感 + SERP 细节 | M2 兜底 |
| **SerpAPI** | $0.01-0.015/次(Starter $75/月 5000 次) | 电商/SEO 监控 | ⚠️ 暂不上(Google 2026 反诉法律风险) |
| **阿里云 IQS** | 实例 ¥0.5-1.5/小时 + QPS ¥30-60/月 + token ¥0.004-0.12/千 | 私有 RAG,通用联网弱 | 已有 BailianService 等价,不上 |

### RAG 范式对照(11 款)

| 范式 | Spring AI 1.0 GA | LangChain | 阿里云百炼 | Coze |
|---|---|---|---|---|
| 向量召回 | 20+ starter | 50+ 实现 | DashVector / Lindorm / ES knn | 闭源(豆包 embedding) |
| BM25 关键词 | ❌ 不内置,需 OpenSearch/Bedrock KB HYBRID | ✅ `BM25Retriever` + `EnsembleRetriever` RRF | ✅ 内置语义+关键词混合 | ✅ 内置 |
| Rerank | ❌ 需自接 Cohere/BGE | ✅ `CohereRerank` / `BGERerank` | ✅ 内置 GTE-Rerank / Qwen3-Rerank | ✅ 内置 |
| 语义缓存 | ❌ 无 | ✅ `GPTCache`(阈值 0.85) | ✅ 黑盒 | ✅ 黑盒 |
| Function Calling | ✅ `@Tool` + `MethodToolCallback` | ✅ `bind_tools` | ✅ `tools` JSON Schema | 插件/节点 |
| Agent 范式 | `Advisor` 链式 | ✅ `LangGraph` 状态机 + 循环 | `ReactAgent` / `MultiAgent` workflow | 可视化 Workflow |

### 我们栈(对照 Spring AI Alibaba 1.1 主推)

| 能力 | 当前 | 缺口 | 落地时机 |
|---|---|---|---|
| KB 检索 | `BailianService.knowledgeBaseSearch` | 无 | ✅ 已有 |
| KB BM25 + Rerank | 百炼内置(从 `BailianKnowledgeConfig` 拿) | 无 | ✅ 已有 |
| 联网搜索 | 暂用 Tavily(M1 接入) | 缺 Brave 兜底 | M2 加 |
| 语义缓存 | 暂无 | GPTCache | M2 |
| Rerank 升级 | 百炼内置 | BGE-rerank 自建(便宜 60-80%) | M3 |
| CRAG 范式 | 简单 RAG | 三路分流 | M3 |

### M1~M3 优先级

| 时机 | 工作 | 估时 | 价值 |
|---|---|---|---|
| **M1** | Tavily 接入(走 CfgPropService) | 0.5 天(主人给 key) | Agent 联网能力上线 |
| **M1** | 4 类新 SSE 事件(usage/metadata/progress/interrupt) | 0.5 天 | agent 场景对得上业界 |
| **M1** | ping 心跳(防 nginx/CDN 30-60s 切断) | 0.5 天 | 稳定性 |
| M2 | 抄 Portkey Lua 做 Redis Token Bucket | 2 天 | 防大 prompt 打爆 |
| M2 | GPTCache 语义缓存(threshold 0.85) | 3 天 | 砍 30-50% LLM 调用 |
| M2 | Portkey onStatusCodes fallback 嵌套 | 2 天 | 401/429/5xx 分级 |
| M2 | Brave 兜底(成本敏感) | 1 天 | Tavily 挂了有备选 |
| M3 | BGE-rerank + pgvector 自建混合检索 | 1 周 | 便宜 60-80% |
| M3 | CRAG 三路分流(KB/联网/混合) | 1 周 | 准确 +15-30% |

---

## 四、5 个业界反模式(主人判断)

| # | 我们设计 | 业界做法 | 评价 |
|---|---|---|---|
| 1 | `<<<suggest>>>` 文本块前端剥离(主人原话提到) | OpenAI 1.x / Coze 用结构化字段 `suggested_questions: []` 或独立 `type=suggestion` | ⚠️ **是反模式**,改结构化 |
| 2 | 灰度基于 userId 白名单 | Portkey / OpenRouter 用请求级别 AB 路由 | ⚠️ 不是反模式,粒度粗 |
| 3 | M1 直接调百炼(不走 provider 抽象) | LiteLLM/Spring AI 都有 `ProviderRouter` | ⚠️ M1 简,M2 必加抽象 |
| 4 | 老的 `chatAppStream` 用 `extractAppTextFromChunk` 把 `content` 和 `reasoning_content` 混 | OpenAI o1 / Anthropic thinking 显式分独立字段 | ⚠️ 联合版 §13.2 已修 |
| 5 | 8 类型 SSE 事件(缺 agent 必需) | OpenAI Assistants 10+ / Coze 12+ / Dify 14+ / OpenAI Realtime 20+ | ⚠️ 联合版 §15(本调研)→ v1.0.0+14 增 4 类 |

---

## 五、3 项主人必拍板

1. **M1 增量(1.5 天)**:4 类新 SSE + Tavily + ping → **推荐接受**
2. **M2 增量(8 天)**:抄 Portkey fallback/Lua 限流 + GPTCache + Brave 兜底 → **推荐排期**
3. **M3 增量(2 周)**:BGE-rerank + CRAG → **推荐排期**

---

## 六、关联文档

- [统一计划 v1.0](2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md) — 待升 v1.0.0+14
- [v1 调研报告](2026-07-14-industry-benchmark(claude).md) — 整体对标
- vue demo:`E:\otherProject\vue问答Demo\src\ReActA1.js`

---

**调研完成时间**:2026-07-14
**作者**:Claude(claude)综合 4 份调研
**版本**:v2.0(取代 v1.0)
