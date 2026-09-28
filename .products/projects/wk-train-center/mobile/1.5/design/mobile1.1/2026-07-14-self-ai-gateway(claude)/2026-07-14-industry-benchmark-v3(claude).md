---
version: 3.0.0
project: wk-train-center
taskType: industry-benchmark
status: final
createdAt: 2026-07-14T20:00:00+08:00
relatedPlan: ../../../tasks/2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md
supersedes:
  - 2026-07-14-industry-benchmark(claude).md
  - 2026-07-14-industry-benchmark-v2(claude).md
authors:
  - Claude(5 份调研综合)
tags:
  - ai-gateway
  - react
  - benchmark
  - rag
  - sse-protocol
  - frameworks
  - 2025-2026
---

# 业界 AI 网关 + ReAct 编排对标报告 v3(2025-2026 / claude 综合 5 份)

> **v3 增**:第 5 份(ReAct 框架 10 款 + Dify)结论并入 → "骨架 A vs 骨架 B"主线
> **v2 保留**:SSE 12 类型 schema + WebSearch 选型(Tavily)
> **v1 保留**:整体对标 + 反模式
> **主线**:M1 补 4 项骨架 B 基线 → M2 抄 Spring AI Alibaba StateGraph → M3 落地 CRAG/BGE-rerank

---

## 一、5 份调研综合表

| # | 主题 | 框架/产品数 | 关键发现 |
|---|---|---|---|
| 1 | 整体对标 + 反模式 | - | 3 个反模式 |
| 2 | 网关产品 | 8 款 | 像 Portkey > LiteLLM > Higress |
| 3 | SSE 事件协议 | 11 款 | chat 满分 / agent 缺 4 类 |
| 4 | RAG + WebSearch | 4 工具 | Tavily 首选 |
| 5 | **ReAct 框架** | **11 款** | 主流迁向"骨架 B"图状态机 |

---

## 二、ReAct 主循环:骨架 A vs 骨架 B(2025-2026 主流方向)

### 骨架 A — 单循环 while-loop(scratchpad 累积式)

```
state = {messages, scratchpad, iter=0}
while iter < max_iter and not finished:
    response = llm(state.messages + scratchpad)
    if has tool_calls(response):
        for call in tool_calls:
            obs = execute(call)
            scratchpad.append((call, obs))
    else:
        state.final = response.content
    iter += 1
return state.final
```

**代表**:LangChain `AgentExecutor` / Smolagents `CodeAgent` / Spring AI `ToolCallingAdvisor` / CrewAI sequential / Dify Agent 节点 react strategy / **我们当前**.

### 骨架 B — 图状态机(superstep + 条件路由)

```
graph = StateGraph(MessageState)
graph.add_node("agent", call_llm)
graph.add_node("tools", execute_tools)
graph.add_edge(START → agent)
graph.add_conditional_edges("agent", lambda s: "tools" if s.last.tool_calls else END)
graph.add_edge("tools" → agent)
app = graph.compile(checkpointer=...)
for chunk in app.stream(input, config={"configurable":{"thread_id":...}}):
    yield chunk
```

**代表**:LangGraph v1.0 / Spring AI Alibaba v1.1.2.2 / Coze Studio / Dify workflow / AutoGen Swarm.

**方向**:**2025-2026 业界主流从 A 迁向 B**(LangChain 自己都推 LangGraph,CrewAI sequential 被 hierarchical + manager 取代,Dify 直接整成 workflow + agent node 二合一)。

### 我们对位

| 我们当前 | 对位 |
|---|---|
| 骨架 A 单循环 + scratchpad 累积 | LangChain AgentExecutor 同源 |
| `ToolRegistry` Map 静态注册 | LangChain Tool / Spring AI `FunctionToolCallback` |
| `BailianChatProvider` 单 provider | Spring AI `ChatClient` 单 bean |
| `SseEmitter` 2 分钟超时显式清理 | **业界罕见,创新** |
| `promptKey` 抽象 + yml 配 system | **业界罕见,创新** |
| 数组化 `thoughts` 累积 | 比 LangChain `intermediate_steps` 元组列表更可读 |

**结论**:我们跟的是**骨架 A 的"主流 + 小创新"**,不是骨架 B 的"工程化重器"。**M1 阶段合理;M2/M3 引入图化或 checkpointer 会让我们跟 LangGraph/Spring AI Alibaba 更接近**。

---

## 三、🔴 M1 必补 4 项(骨架 B 基线)

| # | 能力 | 业界谁家 | 状态 | 落地 |
|---|---|---|---|---|
| **1** | **Tool retry policy / circuit breaker** | LangChain `ToolCallLimitMiddleware(exit_behavior)` / SK `FunctionInvocationFilter` | 完全无 | M1+ per-tool 重试(指数退避 1s/2s/4s)+ `max_retries` |
| **2** | **SSE `ping` 心跳** | Anthropic / Dify | 完全无 | M1 加(防 nginx/CDN 30-60s 切断) |
| **3** | **`usage` 独立 type** | OpenAI / Anthropic / Dify | 缺 | M1 改 `done.usage` 为独立 `type=usage` chunk |
| **4** | **`metadata` + `progress` 透传** | Anthropic / Dify | 缺 | M1 增 type(供前端画 timeline) |

> `interrupt` 推迟 M2(M1 暂用前端拦截),`retry` 简化版 M1 必做(否则 5xx 一次就废)。

## 四、🟡 M2 必补 4 项(骨架 B 完整版)

| # | 能力 | 业界谁家 | 落地 |
|---|---|---|---|
| 1 | **Human-in-the-loop** | LangGraph `interrupt()` / Coze HumanInput / Spring AI Alibaba `InterruptableNodeAction` | 加 `HumanApprovalTool` + 异步审批回调 |
| 2 | **Checkpoint / 中断恢复** | LangGraph `langgraph-checkpoint` / Spring AI Alibaba 7 套 Storage | 对话状态入 MySQL,key=`(userId, appKey, sessionId)`;SSE 断开客户端传 `Last-Event-ID` 续 |
| 3 | **Observability / Trace** | Langfuse / LangSmith / Phoenix OTel / Coze Loop | 接 OpenTelemetry + Spring AI Alibaba ARMS / Langfuse |
| 4 | **Parallel tool calls** | OpenAI `parallel_tool_calls=True`(默认) | `ParallelToolExecutor` + ExecutorService |

## 五、⚪ M3+ 观望(8 项)

- Plan-and-Execute 分离(Smolagents `planning_interval` / LangGraph plan-then-act / CrewAI `planning=True`)
- Per-tool iteration cap + cost cap
- 多 Agent Swarm(AutoGen / CrewAI hierarchical)
- Subgraph + Send 并行(LangGraph / Spring AI Alibaba)
- Stream resume WebSocket(LangGraph v3 / OpenAI WS Mode)
- BGE-rerank + pgvector 自建混合检索(便宜 60-80%)
- CRAG 三路分流(准确 +15-30%)
- 多 provider 抽象(Portkey Router / LiteLLM)

---

## 六、SSE v2 schema(12 类型)

```
content | thoughts | tool_call | tool_result | citations | file |
metadata | progress | usage | interrupt | error | done
```

**业界对照详见 v2 报告**(调研 3)。`interrupt` M1 暂不发,M2 实现。

---

## 七、WebSearch 选型 + RAG 范式

### 工具选型(调研 4)

| 工具 | 价格(2025) | 选型 |
|---|---|---|
| **Tavily** | Free 1000/月,Agent 友好 + 自带 answer | ✅ **M1 首选** |
| **Brave** | $9 CPM 无月限 | M2 兜底 |
| **SerpAPI** | $0.01-0.015/次 | ⚠️ 暂不上(Google 2026 反诉) |
| **阿里云 IQS** | 私有 KB 强 | 已有 BailianService 等价 |

### RAG 范式(调研 4)

| 能力 | 当前 | 缺口 | 时机 |
|---|---|---|---|
| KB 检索 | `BailianService.knowledgeBaseSearch` | 无 | ✅ 已有 |
| BM25 + Rerank | 百炼内置 | 无 | ✅ 已有 |
| 联网搜索 | Tavily(M1 接入) | Brave 兜底 | M1/M2 |
| 语义缓存 | 暂无 | GPTCache | M2 |
| Rerank 升级 | 百炼内置 | BGE-rerank | M3 |
| CRAG | 简单 RAG | 三路分流 | M3 |

---

## 八、3 款阿里百炼 / Coze / Dify 核心差异

| 维度 | 阿里百炼 App | 字节扣子 Coze(开源) | Dify Workflow + Agent |
|---|---|---|---|
| 编排范式 | 服务端闭源 ReAct | 可视化 DAG | 可视化 DAG + Agent 节点 |
| 客户端能控 | `app_id` + `session_id` + messages + stream | `workflow_id` + `bot_id` + inputs | inputs + response_mode + conversation_id |
| ReAct 透明度 | **不透明** | 透明(节点级 SSE) | 半透明(workflow 透明,Agent 节点黑盒) |
| Human-in-the-loop | 弱(`interrupt_data`) | **原生** | **原生** |
| Checkpoint | 弱(session_id) | 服务端 workflow_run_id | 服务端 workflow_run_id |
| 开源 | 闭源(SDK 开源) | Apache 2.0(2025-07-26) | BSL → Apache 2.0 |
| 集成到我们 | **直接**(已主路径) | 重写(Go + React) | 重写(Python + React) |
| 2025-2026 评价 | 省心不可控 | 最强可视化,audit 弱 | 活跃社区,业务方自拖 |

**核心差异一句话**:百炼黑盒 ReAct / Coze 白盒 DAG / Dify 白盒 DAG + Agent 节点。**我们自建属于"半白盒"**;**最像 Dify Agent 节点 react strategy + 节点级 SSE 事件协议**。

---

## 九、最值得抄的 ReAct 实现(2025-2026 推荐)

按栈推荐:

| 栈 | 推荐 | 理由 |
|---|---|---|
| **Java/Spring + stateful + multi-agent** | **Spring AI Alibaba v1.1.2.2** | 我们技术栈 100% 吻合,LangGraph 精华搬到 Java |
| Python + 图化 + 可视化 | **LangGraph v1.0** | `create_react_agent` / `interrupt()` / `checkpointer=PostgresSaver` |
| 可视化给非技术业务方 | **Coze Studio** | 拖边,Apache 2.0,集成成本高(Go + React) |
| 轻量/研究/单人 demo | **Smolagents CodeAgent** | Python 代码作 thought,代码可读性好 |
| 生产级 RAG + 多 Agent 对话 | **AutoGen v0.6+ Swarm** | HandoffMessage 显式移交 |

**综合(Spring 栈)**:Spring AI Alibaba v1.1.2.2 是 2026 最值得抄的。理由:
1. Java/Spring 栈迁入成本最低(`@Autowired ReactAgent` 一行注入)
2. LangGraph 精华(StateGraph + checkpointer + interrupt)全搬到 Java
3. 阿里背书 + DashScope native 集成,`BailianChatProvider` 可平替
4. v1.1 `InterruptableNodeAction` 是 LangGraph `interrupt()` 的对位实现

---

## 十、M1~M3 实施路径总表

| 时机 | 工作 | 来源 | 估时 | 价值 |
|---|---|---|---|---|
| **M1.1** | Tool retry 简化版(指数退避) | 调研 5 | 0.5 天 | 5xx 不再废一次 ReAct |
| **M1.2** | Tavily 接入(走 CfgPropService) | 调研 4 | 0.5 天(主人给 key) | Agent 联网能力 |
| **M1.3** | 4 类新 SSE 事件(usage/metadata/progress + 改 done.usage) | 调研 3+5 | 0.5 天 | agent 场景对得上业界 |
| **M1.4** | ping 心跳(每 15s) | 调研 1+5 | 0.5 天 | 防 nginx/CDN 切断 |
| M2.1 | Human-in-the-loop(`HumanApprovalTool` + 异步回调) | 调研 5 | 3 天 | 业务侧"发通知给管理员"等动作可插队 |
| M2.2 | Checkpoint(状态入 MySQL + Last-Event-ID 续) | 调研 5 | 2 天 | 长文不丢 |
| M2.3 | Observability(OpenTelemetry + Langfuse) | 调研 5 | 2 天 | 多跳 ReAct 排障 |
| M2.4 | Parallel tool calls | 调研 5 | 1 天 | 1 轮 N 工具并行 |
| M2.5 | 抄 Portkey Lua 做 Redis Token Bucket | 调研 2 | 2 天 | 防大 prompt 打爆 |
| M2.6 | GPTCache 语义缓存(threshold 0.85) | 调研 4 | 3 天 | 砍 30-50% LLM |
| M2.7 | Portkey onStatusCodes fallback 嵌套 | 调研 2 | 2 天 | 401/429/5xx 分级 |
| M2.8 | Brave 兜底(成本敏感) | 调研 4 | 1 天 | Tavily 挂了有备选 |
| M3.1 | 抄 Spring AI Alibaba StateGraph + checkpointer | 调研 5 | 2 周 | 迁向骨架 B |
| M3.2 | BGE-rerank + pgvector 自建混合检索 | 调研 4 | 1 周 | 便宜 60-80% |
| M3.3 | CRAG 三路分流(KB/联网/混合) | 调研 4 | 1 周 | 准确 +15-30% |
| M3.4 | 多 provider 抽象(Portkey Router) | 调研 2 | 1 周 | OpenAI/DeepSeek/Mistral 混跑 |

---

## 十一、主人 3 选 1

| 选项 | 动作 | 时长 |
|---|---|---|
| **A** | M1 加 4 项(1.5 天)→ 改统一计划 v1.0.0+14,任务 1/7/8 增量 | 1.5 天 |
| **B** | M1 不动,M2/M3 排期 | - |
| **C** | 主人看完报告再拍(已写好) | - |

---

## 十二、关联文档

- [统一计划 v1.0](2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md) — 待升 v1.0.0+14
- [v2 报告](2026-07-14-industry-benchmark-v2(claude).md) — 旧版
- [v1 报告](2026-07-14-industry-benchmark(claude).md) — 旧版
- vue demo:`E:\otherProject\vue问答Demo\src\ReActA1.js`

---

**调研完成时间**:2026-07-14
**作者**:Claude(claude)综合 5 份调研
**版本**:v3.0(取代 v2.0 / v1.0)
