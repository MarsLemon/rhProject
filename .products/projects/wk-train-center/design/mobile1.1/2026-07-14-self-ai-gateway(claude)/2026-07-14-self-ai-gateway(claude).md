---
version: 0.1.0-SUPERSEDED
project: wk-train-center
taskType: plan
status: SUPERSEDED-BY-UNIFIED-PLAN
createdAt: 2026-07-14T15:00:00+08:00
supersededBy: ../tasks/2026-07-14-ai-agent-gateway-v2-h5-migration(qoder).md
supersededAt: 2026-07-14T16:30:00+08:00
supersessionReason: 主人 D1~D5 决策(改纯模型 + 自建 ReAct)+ Claude + Qoder 联合出统一计划(12 任务不分阶段)
tags:
  - ai-gateway
  - refactor
  - plan
  - SUPERSEDED
owners:
  - 主人(拍板)
  - Claude(起草)
  - Qoder(审核)
relatedPlan: ../design/2026-07-14-self-ai-gateway/README.md
---

# 自建 AI 调用网关 — 任务登记 v0.1(claude 起草)

> **状态**: pending-review,等 Qoder 审核 + 主人拍板 §7.3
> **总计划**: [../design/2026-07-14-self-ai-gateway/README.md](../design/2026-07-14-self-ai-gateway/README.md)
> **预期**: 4 阶段,M1 起步 5-7 天

---

## 1. 任务拆解

| ID | 阶段 | 标题 | 估时 | 状态 | 负责人 |
|---|---|---|---|---|---|
| AI-GW-M1-01 | M1 | 后端 `wk-module-ai-gateway` 骨架 + pom 依赖 | 0.5d | todo | Claude |
| AI-GW-M1-02 | M1 | `ChatProviderPort` 抽象 + `BailianChatProvider` 实现 | 1d | todo | Claude |
| AI-GW-M1-03 | M1 | `AiGatewayController` + SSE emitter + 异常 envelope | 1d | todo | Claude |
| AI-GW-M1-04 | M1 | `FeatureToggle` 灰度 + 老逻辑 fallback 转发 | 0.5d | todo | Claude |
| AI-GW-M1-05 | M1 | 后端单测:协议解析 / fallback / 灰度判 | 1d | todo | Claude |
| AI-GW-M1-06 | M1 | 前端 v2 `src/utils/sse-client.js` 公共 SSE 客户端 | 0.5d | todo | Claude |
| AI-GW-M1-07 | M1 | v2 答疑页切流 + 灰度开关 | 1d | todo | Claude |
| AI-GW-M1-08 | M1 | 协议文档 v1.1 升级(吸收 Qoder 反问) | 0.5d | todo | Claude |
| AI-GW-M1-09 | M1 | Qoder 审核 + 反问 | 0.5d | todo | Qoder |
| AI-GW-M2-01 | M2 | `KnowledgeBaseTool` + `BailianKnowledgeBaseAdapter` | 1d | blocked(M1) | Claude |
| AI-GW-M2-02 | M2 | `WebSearchTool` + `TavilyWebSearchAdapter` | 0.5d | blocked(M1) | Claude |
| AI-GW-M2-03 | M2 | `ReActOrchestrator` 编排 + `<<<suggest>>>` 后端剥离 | 2d | blocked(M1) | Claude |
| AI-GW-M2-04 | M2 | 后端单测:ReAct 5 case / KB 缓存 / 降级 | 1d | blocked(M1) | Claude |
| AI-GW-M2-05 | M2 | v2 陪练 + 出题 + v3 + h5 切流 | 2d | blocked(M1) | Claude+Qoder |
| AI-GW-M2-06 | M2 | 三端 SSE client 行为对齐 | 0.5d | blocked(M1) | Qoder |
| AI-GW-M3-01 | M3 | `POST /api/ai/files/sign` 文件签名统一 | 0.5d | blocked(M2) | Claude |
| AI-GW-M3-02 | M3 | 会话历史 API 代理(只读) | 1d | blocked(M2) | Claude |
| AI-GW-M3-03 | M3 | `bizParams` 入协议 | 0.5d | blocked(M2) | Claude |
| AI-GW-M3-04 | M3 | 三端 100% 切流 + 灰度默认 true | 1d | blocked(M2) | Claude+Qoder |
| AI-GW-M3-05 | M3 | 切流埋点 + 异常监控 | 0.5d | blocked(M2) | Claude |
| AI-GW-M4-01 | M4 | 老代码全量删除(grep 验证) | 1d | blocked(M3+1m) | Claude |
| AI-GW-M4-02 | M4 | wiki / repowiki 措辞更新 | 0.5d | blocked(M3+1m) | Claude |
| AI-GW-M4-03 | M4 | ENV 紧急回退开关保留 + 文档 | 0.5d | blocked(M3+1m) | Claude |

---

## 2. 关键里程碑

| 节点 | 日期(估) | 准入 |
|---|---|---|
| M1 协议定稿 | T+0 ~ T+3d | 协议 §3 v1.1 + Qoder 拍板 |
| M1 答疑页切流 | T+3d ~ T+7d | v2 答疑 1 周 0 故障 |
| M2 工具上线 | T+8d ~ T+17d | 50 真问题 ≥ 95% 一致 |
| M3 三端全切 | T+18d ~ T+24d | 三端 100% 切流 1 周 |
| M3 稳定期 | T+25d ~ T+55d | 1 个月线上无异常 |
| M4 下线 | T+56d ~ T+60d | 老代码 grep 0 命中 |

---

## 3. 待主人拍板项(汇总)

- [ ] 灰度开关默认值:推荐 **false**(白名单放开)
- [ ] 出题 appKey 是否本期动:推荐 **P2**(放到 v1.1)
- [ ] 自有业务会话历史(落库)是否本期做:推荐 **不做**(v1.1 再说)
- [ ] 老逻辑兜底保留时长:推荐 **M3 后 ≥ 1 个月**
- [ ] M4 启动时间:等 M3 稳定运行 1 个月后

---

## 4. 待 Qoder 拍板项(汇总)

- [ ] 协议 §3 v1.0 8 种 SSE event type 是否够用
- [ ] `FeatureToggle` 放 `yf-ability/config` 还是网关内部
- [ ] `SseEmitter` 超时时间(推荐 5 分钟)
- [ ] 老逻辑 fallback 路径设计
- [ ] KB 检索后端 LRU 缓存策略
- [ ] WebSearch 失败降级到纯 KB 是否做
- [ ] 三端切流分批策略
- [ ] M4 老代码全删 vs 保留 ENV 回退开关

---

## 5. 风险与回退

- 风险详见 [README.md §6](../design/2026-07-14-self-ai-gateway/README.md#6-风险登记)
- M1 必修:老逻辑 100% 保留,灰度默认值 = false
- 任一阶段验收失败 → 回退到上一阶段稳定状态,主人拍板下一步

---

## 6. Qoder 审核意见(qoder)

> 本节为 Qoder 对 Claude v0.1 计划的逐项审核与反问。所有标注 **[Q-反问]** 的项需主人/Qoder 在 M1 启动前拍板;**[Q-建议]** 项建议合并到 v1.1。

### 6.1 总体评价

整体是一份专业度极高的迁移蓝图,优于 Qoder 第一版计划的关键点:

1. **独立模块 `wk-module-ai-gateway`** —— 与现有 `wk-module-ai`(数据层)职责切干净,长期可维护。**[Qoder 赞同]**
2. **`ChatProviderPort` 抽象 + Port/Adapter** —— 把 provider 切换的代价降到"新增 1 个 class",正契合"不再绑定百炼"的核心约束。**[Qoder 赞同]**
3. **协议级 `error + fallback: true` envelope** —— 让灰度期前端无感切回老逻辑,这是 Qoder 第一版没考虑到的工程化细节。**[Qoder 采纳]**
4. **4 阶段 + M3 稳定运行 1 个月再 M4** —— 给老代码足够线下验证窗口,降低一次性删老代码的风险。**[Qoder 赞同]**
5. **任务粒度(0.5d ~ 2d) + 估时 + 阻塞关系** —— 比 Qoder 第一版的 12 个大任务更利于排期和复盘。**[Qoder 采纳]**

### 6.2 与 Qoder 第一版的差异 / 采纳项

| 维度 | Qoder 第一版 | Claude v0.1 | Qoder 倾向 |
|---|---|---|---|
| 后端位置 | 扩展现有 `wk-module-ai` | 新建独立 `wk-module-ai-gateway` | **采纳 Claude**,与数据层解耦更彻底 |
| 网关 ID 命名 | `appId`(百炼 ID 直传) | `appKey`(语义键,如 `answer_assistant_app`) | **采纳 Claude**,不暴露百炼 ID,易于切换 provider |
| SSE 协议 | 自定义 `type=content/raw/thoughts/...` 5 种 | 8 种 `chunk/thought/tool_call/tool_result/citation/file/error/done` | **采纳 Claude**,更细分且可扩展 |
| 异常格式 | 在 chunk 内塞 `type=error` | 独立 `error` event + `fallback` 标志 | **采纳 Claude**,fallback 标志是关键 |
| 灰度方式 | 前端 `localStorage` 开关 | 后端 `FeatureToggle`(userId/appKey/global 三层) + 前端兜底 | **采纳 Claude**,后端更可控 |
| KB/WebSearch | 阶段二脚手架,未细化 | M2 完整 plan:`KnowledgeBaseTool` + `BailianKnowledgeBaseAdapter` + `TavilyWebSearchAdapter` + `<<<suggest>>>` 后端剥离 | **采纳 Claude**,Qoder 第一版没覆盖这块 |
| v3 是否在范围 | 不在 | 在(README §1.1) | **需要反问**,主人原话是 v2 + h5 |

### 6.3 需要讨论的疑点(反问)

#### **[Q-反问-1] 范围:v3 是否本期一并切流?**

- Claude README §1.1 把 `wk-train-center-ui-v3` 列入"三端",任务表 M2-05 也含 v3。
- 但用户原话"前端(v2 和移动端 h5)中的智能体调用",未提及 v3。
- **Qoder 建议**:v3 列入 **M3 候选**,M1/M2 暂不动,等 M2 工具稳定后再决定是否扩到 v3。否则范围不可控。

#### **[Q-反问-2] 新建 `wk-module-ai-gateway` 独立模块的成本?**

- 新模块意味着新 `pom.xml`、新 `application.yml`、新 yf-web 路由挂载、新 CI 步骤。
- Qoder 第一版是直接挂在现有 `wk-module-ai` 之下,新增 `WkAiAgentController.java` + 子包,改动更小。
- **Qoder 建议**:**采纳 Claude**(独立模块),但需要 Claude 在 M1-01 任务里明确:
  1. 新模块的 `pom.xml` 继承哪一层(`yf-web` 还是与 `wk-module-ai` 平级)
  2. 路由在 `yf-web` 怎么挂(参考现有 `wk-module-ai` 的路由挂载方式)
  3. 是否复用 `wk-module-ai` 已有的 Redis 限流、用户工具、配置中心

#### **[Q-反问-3] 8 种 SSE event type 是否过细?**

- `tool_call` / `tool_result` 在 M2 §4 验收里写"前端不渲染",那前端为什么要订阅?
- **Qoder 建议**:M1 只实现 5 种 `chunk/thought/citation/file/error/done`,`tool_call/tool_result` 留到 M2,届时决定是否真要 emit 给前端(可能后端内部消化即可,前端零感知)。
- 带来的好处:前端 M1 只需要解析 5 种 event,M2 再加 2 种,渐进式升级。

#### **[Q-反问-4] 老逻辑 fallback 路径 `/api/ai/legacy/{appKey}/chat-stream` 是否真要新建?**

- Claude §2.3 提"老逻辑入口必须保留 100% 可用",但实现是新建 legacy 路径转发。
- 这意味着 M1 阶段前端代码里有 **两套并行调用**,review 时容易混淆。
- **Qoder 建议**:M1 阶段 **前端切流开关** 就够(灰度关闭时前端直接调老 chatAppStream),后端不需要新建 legacy 转发端点。后端只服务"走新网关"的用户,简单清晰。M3 全切流后,前端才真正全部走新接口。

#### **[Q-反问-5] `FeatureToggle` 放网关内部 vs `yf-ability/config`?**

- Claude §6 反问 1 推荐放网关内部。
- 但项目已有 `CfgPropService` 和 `CfgPropDTO`,`AI_GATEWAY_ENABLED` 这种配置完全可以走配置中心,免去 yml 改完要重启。
- **Qoder 建议**:**配置走 `CfgPropService` + type=`ai-gateway`**,代码层面 `FeatureToggle` 作为该配置的消费者,与现有 `BailianConfigServiceImpl` 同构。yml 仅放默认值。

#### **[Q-反问-6] `SseEmitter` 超时 5 分钟是否过长?**

- 5 分钟足够 ReAct 多次迭代 + 工具调用,但 WebFlux 资源占用也大。
- **Qoder 建议**:M1 先定 **2 分钟** 作为默认,ReAct 多轮场景下,可由 `ReActOrchestrator` 显式 `emitter.complete()` 提前结束,不必靠超时。

#### **[Q-反问-7] 出题 appKey 的 system prompt 是否要单独配置?**

- Claude M3 §5 反问 4 推荐"出题不复用答疑 prompt",合理。
- 但目前百炼的出题 agent 是独立 app(`quiz_gen_agent`),system prompt 已经由百炼 app 配置承载,后端只是转发。
- **Qoder 建议**:M3 不引入 `bizParams`,除非主人明确要求"在网关层覆盖 prompt"。默认行为 = 透传百炼 app 自带 prompt。

#### **[Q-反问-8] Tavily key 走 yml vs 配置中心?**

- Claude M2 §2.3 写"Tavily key 走 yml"。
- 但 Tavily 是外部 API key,放 yml 提交进 git 风险大。
- **Qoder 建议**:**走 `CfgPropService` + type=`ai-gateway`**(参考 Bailian apiKey 的处理),yml 仅放 placeholder。

### 6.4 M1 准入前的具体补充(给 Claude)

1. **协议事件类型精简为 5 种**(§6.3-Q-反问-3):M1 不实现 `tool_call/tool_result`,M2 再加。
2. **fallback 不走后端转发,前端切流**(§6.3-Q-反问-4):M1 不创建 `/api/ai/legacy/**`。
3. **`FeatureToggle` 配置中心化**(§6.3-Q-反问-5):type=`ai-gateway`,provider=`default`,data 字段 `{enabled: bool, userIds: []}`。
4. **`SseEmitter` 超时默认 2 分钟**(§6.3-Q-反问-6)。
5. **M1 不切 v3**(§6.3-Q-反问-1):v3 留到 M3 候选。
6. **新增 `AgentChatRequestDto` / `AgentChatChunkVo` 命名**:Claude 用的是 `ChatStreamReq` / `SseChunk`,Qoder 第一版是 `AgentChatRequestDto` / `AgentChatChunkVo`。**Qoder 建议**:`AgentChat*` 命名更贴业务语义(`ChatStream` 太泛),且与现有 `TrainingAiAskDto` 风格对齐。请 Claude 拍板。
7. **路径前缀对齐现有风格**:Claude 用 `/api/ai/{appKey}/chat-stream`,现有项目大量用 `/api/wk/...` 前缀。**Qoder 建议**:`/api/wk/ai/agent/{appKey}/chat-stream`,与 `WkAiAgentController` 命名一致,且便于在 Nginx/网关层统一管理。

### 6.5 Qoder 一方的承诺

- M1 启动后,Qoder 负责 **H5 端切流实现**(`wk-mhc-mobile/src/pages/smart-training/api/ai/common.ts`),参考 Claude M2-06 "三端 SSE client 行为对齐"任务。
- M2 启动前,Qoder 提供 H5 的 `chatStreamProxy` 草稿,便于 Claude 在 M2-05 一并 review。
- 协议定稿前(Qoder 反问全部 closed),H5 不动。

### 6.6 待主人拍板项汇总(继承 Claude §3 + Qoder 补充)

| ID | 拍板项 | Claude 推荐 | Qoder 推荐 | 状态 |
|---|---|---|---|---|
| D-1 | 灰度开关默认值 | false | false | 一致,等主人 |
| D-2 | 出题 appKey 本期是否动 | P2 | P2 | 一致 |
| D-3 | 自有业务会话历史本期是否做 | 不做(v1.1) | 不做(v1.1) | 一致 |
| D-4 | 老逻辑兜底保留时长 | M3 后 ≥ 1 个月 | M3 后 ≥ 1 个月 | 一致 |
| D-5 | M4 启动时间 | M3 后 1 个月 | M3 后 1 个月 | 一致 |
| **D-6(Qoder 新增)** | **v3 是否本期一并切流** | 是 | **M3 候选,M1/M2 暂不动** | **待主人** |
| **D-7(Qoder 新增)** | **M1 异常超时默认值** | 5 分钟 | 2 分钟 | **待主人** |
| **D-8(Qoder 新增)** | **路径前缀** | `/api/ai/...` | `/api/wk/ai/agent/...` | **待主人** |

---

**审核者**:Qoder  
**审核时间**:2026-07-14  
**审核基准**:Claude v0.1 总计划 + M1-M4 子计划 + Qoder 第一版 `2026-07-14-ai-agent-gateway-v2-h5-migration(qoder).md`

---

## 7. 主人拍板 + 架构方向调整(qoder 补充)

> 本节为 Qoder 转述主人回复 + 补充架构重评。涉及一个**重大方向调整**：从百炼“智能体应用”迁到百炼“模型调用” + 自建编排。

### 7.1 主人对 §6.6 拍板项的回复

| ID | 拍板项 | 主人决策 |
|---|---|---|
| D-1 | 灰度开关默认值 | false(不变) |
| D-2 | 出题 appKey 本期是否动 | P2 |
| D-3 | 自有业务会话历史本期是否做 | 不做 |
| D-4 | 老逻辑兜底保留时长 | M3 后 ≥ 1 个月 |
| D-5 | M4 启动时间 | M3 后 1 个月 |
| **D-6** | **v3 是否本期切流** | **不列入本期范围**（M4 后另议） |
| **D-7** | **SseEmitter 超时** | **2 分钟**(听取 qoder) |
| **D-8** | **路径前缀** | **听取 qoder**，改为 `/api/wk/ai/agent/...` |

### 7.2 §6.3 反问点主人决策

| 反问 | 主人决策 | 补充说明 |
|---|---|---|
| §6.3-Q-反问-1 v3 范围 | **不列入** | 本期仅 v2 + h5，与主人原话一致 |
| §6.3-Q-反问-2 新模块 vs 扩展 | **新建独立模块**，与 `wk-module-ai` **同级** | 模块名暂定 `wk-module-ai-gateway`（或 `wk-module-agent`），**复用 `wk-module-ai`** 中 “需要调用 system 中获取参数” 的能力（如限流、UserUtils、BailianConfig DTO 等） |
| §6.3-Q-反问-3 8 种 SSE event | **留出出口**，出口处计入 todo，**先不做逻辑**，后续渐进式开发 | M1 实现 5 种 `chunk/thought/citation/file/error/done`，`tool_call/tool_result` 预留 type，但 onMessage 不处理 |
| §6.3-Q-反问-4 legacy 转发端点 | **听取 qoder**：不建 legacy，M1 全靠前端切流 | 后端保持净态 |
| §6.3-Q-反问-5 FeatureToggle 配置 | **使用当前配置**，不动基础 | 走现有 `ai` type + provider 维度，不新增 `ai-gateway` type |
| §6.3-Q-反问-6 SseEmitter 超时 | **听取 qoder**：2 分钟 | — |
| §6.3-Q-反问-7 出题 bizParams | **需要改用我们自己的**，**完全弃用百炼智能体应用** | 见 §7.3 架构调整 |
| §6.3-Q-反问-8 Tavily key | **走后端配置**，放入 `ai` type 下 | 支持配置**多个**，进行路由检查；**前面的没量了自动弃用下一个** |

### 7.3 重大架构调整：从“百炼智能体应用”变为“模型调用 + 自建编排”

主人明确提出：本期要完成从**百炼智能体应用**类型调用向**模型调用**类型的彻底迁移。

#### 7.3.1 两种 API 类型对比（推荐 Claude 先读）

| 维度 | 百炼智能体应用（App Completion） | 百炼模型调用（Chat Completions / OpenAI 兼容） |
|---|---|---|
| 控制台配置 | 在百炼控制台配置 **appId**，绑定：模型 + system prompt + 知识库 + 插件 | 只需配置 **模型** |
| 调用入口 | `POST /api/v1/apps/{appId}/completion` | `POST /compatible-mode/v1/chat/completions`（OpenAI 兼容） |
| system prompt | 百炼 app 自带 | **调用方传 `messages[0].role=system`** |
| 知识库检索 | 百炼内部完成 | **调用方自己调 KB API + 检索后拼接进 messages** |
| 工具调用 | 百炼内部完成 | **调用方实现 ReAct 循环**，模型返回 `tool_calls`，调用方执行工具后继续 |
| 计费项 | 模型 + 知识库检索 + 插件/外部 API | 仅模型调用（KB 检索走自定义接口） |
| 适合场景 | 快速接入，能力受限于百炼预置插件 | 需自定义业务编排、保护业务资产 |

#### 7.3.2 主人原话拆解

> “需要改用我们自己的，要完全弃用百炼的智能体应用”  
> “是将 1 的类型（在阿里百炼进行配置）变为 2（模型调用，自己可以配置）”

意味着：

1. **不再在百炼控制台维护 appId → 不再调用 `/api/v1/apps/{appId}/completion`**  
2. **后端成为编排层**：system prompt / 知识库检索 / 工具调用 / ReAct 全在后端实现  
3. **后端仅调** `compatible-mode/v1/chat/completions`，让百炼当“裸模型 Provider”  
4. **前端与百炼解耦**：前端只看到后端代理协议，不知道百炼存在  

#### 7.3.3 这对 Claude M1/M2 计划的影响

| 原本计划 | 调整后 | 说明 |
|---|---|---|
| M1 用 `appKey → appId` 映射表调百炼应用 | **M1 就设计 `appKey → {model, systemPrompt, tools, knowledgeBaseId}` 元数据** | 这些元数据全部走主人要求的“ `ai` type 下多 provider 路由”配置 |
| M2 才做 ReAct 编排 | **M1 接口层预留 `tool_call/tool_result` 事件出口，M2 实现逻辑** | 主人明确“出口先计入 todo，不做逻辑” |
| system prompt 走百炼 app 自带 | **M1 后端在调模型前注入 system prompt** | 从配置读取，不走百炼 app |
| 知识库走 `BailianService.knowledgeBaseSearch`（百炼智能体应用 API） | **走百炼 KB 独立 API**（如 `compatible-mode/v1/knowledge_base/search` 或调用 `BailianService` 底层的检索接口） | Qoder 建议复用现有 `wk-module-file-source/BailianService`，不重写 |
| 工具调用（WebSearch）走百炼插件 | **后端自己调 Tavily**，按主人决策“放到 ai 配置中，可配置多个” | 见 §7.4 |

### 7.4 新增需求：ai 配置多实例 + 路由检查（主人原话）

> “走后端配置，放到 ai 配置中，可以配置多个，进行路由检查，前面的没量了自动弃用下一个”

Qoder 解读：

1. **在现有 `ai` type 下支持多 provider / 多模型配置**，例如：
   ```
   ai.development model: qwen-long
   ai.fallback model: deepseek-v3
   ai.search-provider: [tavily, jina, duckduckgo]  // WebSearch 多实例
   ```
2. **路由检查**：每次调用前检查当前 provider 的余量（配额 / 限流 / 调用次数），**耗尽则自动降级到下一个**。  
3. **优先级**：按配置顺序降级（不是随机）。
4. **告警**：被降级时记日志 + 接入主人指定的告警通道（如现有 `LogInject`）。
5. **仅在 §7.3 重构后才有意义**——因为智能体应用模式下不存在多 provider 路由问题。

**Qoder 建议**：
- M1 实现“单 provider + 配置中心化”即可（与现状对齐）。  
- M2 再加“WebSearch 多 provider 路由检查”。  
- 不建议 M1 就做多 provider，因为与“路由检查”的复杂度耦合过高。  

### 7.5 推荐 Claude 必读的百炼官方文档（主人提供）

1. **智能体应用 API**：https://help.aliyun.com/zh/model-studio/new-agent-application-api-reference  
   - 用于理解**旧模式**（本期要弃用），归档为“现状参考”。  
2. **模型调用 API**（Chat Completions）：https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope  
   - 本期主调接口，OpenAI 兼容，**必须读透**。  
3. **应用类型介绍**：https://www.alibabacloud.com/help/zh/model-studio/application-introduction  
   - 帮 Claude 梳理“app 与 model”的产品定义区别。  

Qoder 建议：在 M1 启动前，Claude 先在仓库中创建 `wk-train-center-service/docs/ai-gateway/bailian-api-comparison.md`，把 §7.3.1 表扩充为 3 页详细对比，作为后续开发的参考档。

### 7.6 结论与下一步

**架构目标定调（本期）**：

> 百炼从“能力平台”降级为“底层 LLM Provider”，所有业务编排（system prompt、KB 检索、工具调用、ReAct、出题 prompt、陪练 prompt）全部在后端自管；前端只看到后端业务网关协议。

**期望 Claude 在 v1.1 中做的调整**：

1. **README.md §1.2** “后端已有能力”补一节“百炼 SDK 本期仍用 `compatible-mode/v1/chat/completions`”。  
2. **README.md §3.1** 协议增加 `appKey` 背后的元数据：`{ model, systemPrompt, tools, knowledgeBaseId }`。  
3. **M1-协议.md §1 范围** 增加条目“后端在调模型前注入 system prompt”。  
4. **M1-协议.md §3 协议 v1.1** `tool_call` / `tool_result` 事件**预留类型，不实现**（写明 @todo）。  
5. **M2-工具.md** 调整顺序：“**调模型拿 tool_calls → 后端执行工具 → 结果拼回 messages → 再调模型**” 成为 M2 核心。  
6. **M3-会话文件.md** “`bizParams` 入协议” 改为“**前端 → 后端元数据查询端点**”，system prompt / tool 配置不再走 `bizParams` 透传。  
7. **新增 §7.4 路由检查需求** 在 M2-05 中体现，**单 provider 先上，多 provider 路由检查推迟到 M3 或 v1.1**。  

**Qoder 额外承诺**：M1 启动后负责交付
- H5 端 `chatStreamProxy` 草稿  
- 元数据查询端点（`GET /api/wk/ai/agent/{appKey}/meta`）的字段建议草案  
- 三端 SSE client 行为对齐清单  

---

**转述/补充者**:Qoder  
**转述时间**:2026-07-14  
**主人拍板依据**:用户会话原始输入（8 条决策 + 架构调整方向）

---

## 8. v2 最终主计划（qoder + claude 对齐版）

> **本节为最终主计划**，取代两边 v1（Qoder 第一版与 Claude 第一版）。基于 Claude 审核 Q1~Q5 + 主人拍板 D1~D5 + 百炼两套 API 链接理解后产出。
> Claude 写的原 `design/2026-07-14-self-ai-gateway(claude)/README.md` + Qoder 写的原 `tasks/2026-07-14-ai-agent-gateway-v2-h5-migration(qoder).md` 原任务 1~10 **作废**，均以本节为准。

### 8.1 核心修正（D2 决策）：从百炼智能体应用迁到纯模型调用 + 自建编排

| 模式 | 端点 | 编排权 | 工具调用 | system prompt | 本期 |
|---|---|---|---|---|---|
| 1. 智能体应用（废弃） | `/api/v1/apps/{appId}/completion` | 百炼控制台 | 百炼内部 | 百炼 App 配 | ❌ |
| 2. **纯模型调用（采用）** | `/compatible-mode/v1/chat/completions` | 后端自建 ReAct | 后端自己接 | 后端 yml 管 | ✅ |

> 证据：vue demo `ReActA1.js:181-228` 已经走 `/dashscope/compatible-mode/v1/chat/completions` + `tools: TOOLS` + `tool_choice: 'auto'` + `stream: true`，完全不依赖 AppId。

**带来的根本性变更**：
- 后端调百炼的端点：`/compatible-mode/v1/chat/completions`（而非 `/api/v1/apps/{appId}/completion`）
- 百炼身份：`model` 字段（如 `qwen3-max`）取代 `appId`
- system prompt：**后端 Java / yml 管**，不走百炼 App 控制台
- tools / RAG pipeline：**后端自建** `ToolExecutor` 注册表 + 自维护 KB retrieval
- ReAct 循环：**后端自己跑**，**本期 M1 必做**，不是阶段二
- 前端协议：**后端先拆 8 类型 SSE chunk 再发前端**，前端不感知百炼协议
- **废除 appId/appKey 抽象**：只需 `promptKey` + 可选 `model`

### 8.2 流式模型修正（D1 决策）：WebFlux → SseEmitter

| 维度 | 原设计 | 修正后 |
|---|---|---|
| 流式模型 | WebFlux `Flux<String>` | **Spring MVC `SseEmitter`** |
| 模块依赖 | 需 `spring-boot-starter-webflux` | **不需新依赖**，项目主流一致 |
| 后端流推送 | `Flux.create` | `emitter.send(SseEmitter.event().data(...))` |
| 完成 | `sink.complete()` | `emitter.complete()` |
| 错误 | `sink.error(e)` | `emitter.completeWithError(e)` |

> 理由：`wk-module-ai/pom.xml` 原本无 webflux 依赖，加依赖风险大；项目主流是 MVC + SseEmitter。

### 8.3 协议设计 v2（替换原 §3 / 原任务 1）

#### 8.3.1 SSE chunk 8 种类型（替换原 5 种）

```json
{ "type": "content", "delta": "...", "full": "..." }
{ "type": "thoughts", "items": [...] }
{ "type": "tool_call", "id": "...", "name": "knowledge_base_search", "args": {...} }
{ "type": "tool_result", "id": "...", "name": "...", "results": [...] }
{ "type": "citations", "items": [{"title":"...","url":"...","snippet":"..."}] }
{ "type": "file", "items": [{"fileId":"...","url":"...","type":"image|file"}] }
{ "type": "error", "errorCode": "AI_AUTH_FAIL|AI_QUOTA_EXCEED|AI_TOOL_FAIL|AI_INTERNAL|AI_RATE_LIMIT", "content": "...", "fallback": false }
{ "type": "done" }
```

**说明**：
- `tool_call` / `tool_result` **本期就实现**（T-D2-3 要求），不再仅留出口。
- `fallback: false` 保留位，M1 暂不启用 legacy 转发（D3 决策听取 qoder）。
- `delta` 是增量、`full` 是累积全量；前端可二选一渲染。

#### 8.3.2 请求体 v2

```json
{
  "prompt": "用户当前问题",
  "messages": [{"role":"user|assistant|system","content":"...","fileList":["url"]}],
  "fileList": ["url1"],
  "imageList": ["url2"],
  "tools": {
    "enableKbSearch": true,
    "enableWebSearch": true,
    "enableThinking": true
  },
  "bizParams": {
    "promptKey": "answer_assistant|training_assistant|quiz_generator",
    "model": "qwen3-max"
  }
}
```

**说明**：
- **无 appId / appKey**（D2 决策）。
- `promptKey` 必传，后端查 yml 选 system prompt。
- `model` 可选，不传走 yml `ai-agent.models.default`。
- `messages` 包含历史多轮；`prompt` 是当前用户问题原文（后端自动拼到最后一条 user）。

### 8.4 配置中心化（主人 D3 + T-D2-2）

#### 8.4.1 application.yml 段

```yaml
ai-agent:
  models:
    default: qwen3-max
    candidates: [qwen3-max, qwen-plus, glm-4.6]
  prompts:
    answer_assistant: |
      你是船舶设备与部件领域的资深答疑导师...
      （从 wk-train-center-ui/documents/.../AI任务拆分 中抽取）
    training_assistant: |
      （陪练 prompt）
    quiz_generator: |
      （出题 prompt）
  tools:
    knowledge_base_search:
      enabled: true
      timeout: 15s
    web_search:
      enabled: true
      providers:  # 主人原话：可配置多个，路由检查自动降级
        - name: tavily
          apiKey: ${TAVILY_API_KEY_PLACEHOLDER}
          priority: 1
        - name: jina
          apiKey: ${JINA_API_KEY_PLACEHOLDER}
          priority: 2
      timeout: 15s
  react:
    max_iterations: 10
    max_search_count: 5
```

#### 8.4.2 主人决策对应

- D3：「**使用当前配置，不动基础**」→ 沿用现有 `ai` type 配置中心，**不新增 `ai-gateway` type**。
- D3（WebSearch 路由检查）：**M1 仅配单 provider**，M2 再加多 provider 路由检查降级。

### 8.5 任务清单 v2（替换原 Qoder 任务 1~10 + 原 Claude M1~M2）

#### 任务 1：SseEmitter 改造（D1 + Claude Q1）

**文件：**
- 修改：`wk-train-center-service/wk-modules/wk-module-ai/pom.xml`（**不加 webflux 依赖**，确认依赖链）
- 新建：`wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/util/SseStreamHelper.java`

**步骤：**

1.1 确认 `wk-module-ai/pom.xml` 不引入 webflux；Spring MVC 的 `spring-boot-starter-web` 已传递 `SseEmitter`。

1.2 创建 `SseStreamHelper.java`：

```java
package com.wk.traincenter.ai.util;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public final class SseStreamHelper {
    private SseStreamHelper() {}

    public static void send(SseEmitter emitter, Object payload) {
        try {
            emitter.send(SseEmitter.event().data(payload, MediaType.APPLICATION_JSON));
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    }

    public static void error(SseEmitter emitter, String code, String message) {
        send(emitter, Map.of("type","error","errorCode",code,"content",message,"fallback",false));
        emitter.complete();
    }

    public static void done(SseEmitter emitter) {
        send(emitter, Map.of("type","done"));
        emitter.complete();
    }
}
```

1.3 Commit：`feat(ai): 引入 SseEmitter 工具类，适配 MVC 流式`

#### 任务 2：ChatApiUtils 扩展支持纯模型（T-D2-1）

**文件：**
- 修改：`wk-train-center-service/yf-ability/src/main/java/com/yf/ability/ai/utils/chat/ChatApiUtils.java`
- 修改：`wk-train-center-service/yf-ability/src/main/java/com/yf/ability/ai/utils/ChatMsgUtils.java`

**说明**：百炼纯模型走 `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`（OpenAI 兼容），payload 含 `model + messages + tools + tool_choice + stream`。

**步骤：**

2.1 新增 `ChatMsgUtils.genPureModelReqJson(model, messages, tools, toolChoice, stream, enableThinking)`，输出 OpenAI 兼容 JSON payload。

2.2 扩展 `ChatApiUtils.startChat` 重载，新增方法签名：

```java
public Consumer<SseEmitter> streamPureModel(
    String apiKey,
    String model,
    List<Map<String, Object>> messages,
    List<Map<String, Object>> tools,
    String toolChoice,
    boolean enableThinking,
    SseEmitter emitter
);
```

内部逻辑：
- 构造 OpenAI 兼容 payload
- 发 HTTP 请求 + 流式读取 SSE
- 逐 chunk 解析 `choices[0].delta.content` / `reasoning_content` / `tool_calls`
- 通过回调吐 `StreamEvent { type: content|thought|tool_call|done, ... }`
- 调用方拿到 `Consumer<SseEmitter>` 后自行转发为 SSE

2.3 Commit：`feat(ai): ChatApiUtils 支持纯模型调用 + tools + 流式推理`

#### 任务 3：AgentConfigService 配置中心（T-D2-2）

**文件：**
- 新建：`wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/AgentConfigService.java`
- 新建：impl
- 修改：`application.yml` 添加 §8.4.1 配置

**步骤：**

3.1 定义接口：

```java
public interface AgentConfigService {
    String getSystemPrompt(String promptKey);
    String getDefaultModel();
    boolean isToolEnabled(String toolName);
    List<Map<String, Object>> resolveTools(AgentTools tools);
}
```

3.2 实现从 yml 读取并缓存。

3.3 Commit：`feat(ai): AgentConfigService 配置中心化`

#### 任务 4：ToolExecutor + ToolRegistry

**文件：**
- 新建：`wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/tool/ToolExecutor.java`
- 新建：impl `ToolRegistry.java`

**步骤：**

4.1 定义接口：

```java
public interface ToolExecutor {
    String name();
    Map<String, Object> execute(Map<String, Object> args, String userId);
}
```

4.2 `ToolRegistry` 根据 tool name 路由到具体实现。

4.3 Commit：`feat(ai): 工具执行接口与注册中心`

#### 任务 5：KnowledgeBaseSearchTool 接 BailianService（Claude Q5）

**文件：**
- 新建：`wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/tool/KnowledgeBaseSearchTool.java`

**步骤：**

5.1 注入 `wk-modules/wk-module-file-source/.../BailianService.java`。

5.2 实现 `execute(args, userId)`：
- `args.query` 作为检索查询
- 调 `bailianService.knowledgeBaseSearch(query, pipelineId, topK)`，pipelineId 从 `AgentConfigService` 读取
- 转换返回结构为 `{ results: [{title, url, snippet, score, docId}] }`

5.3 Commit：`feat(ai): 知识库检索工具对接 BailianService`

#### 任务 6：WebSearchTool 接 Tavily（Claude Q5 + 主人 WebSearch 路由）

**文件：**
- 新建：`wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/tool/WebSearchTool.java`
- 修改：`application.yml` 添加 `ai-agent.tools.web_search.providers`

**步骤：**

6.1 M1 实现**单 provider** 逻辑：

```java
public Map<String, Object> execute(Map<String, Object> args, String userId) {
    String query = String.valueOf(args.getOrDefault("query", ""));
    WebSearchProvider provider = configService.getWebSearchProviders().get(0);
    return provider.search(query, 15_000);  // 调用 Tavily API
}
```

6.2 M1 末预留多 provider 路由检查接口（**不做实现，仅留 `TODO` 注释**）。

6.3 Commit：`feat(ai): 网络搜索工具对接 Tavily（M1 单 provider）`

#### 任务 7：ReAct 编排器（本期必做，T-D2-3）

**文件：**
- 新建：`wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/AgentReActExecutor.java`

**说明**：从 vue demo `ReActA1.js:268-690` 移植，**Java 重写不复制**。

**步骤：**

7.1 主循环伪代码：

```java
public void execute(AgentChatRequest req, AgentConfig cfg, SseEmitter emitter) {
    List<Map<String, Object>> messages = buildMessages(cfg, req);  // system + history + user
    List<Map<String, Object>> tools = toolRegistry.resolve(req.getTools());
    int iter = 0, searchCnt = 0;

    while (iter++ < cfg.getMaxIterations()) {
        List<StreamEvent> events = chatApiUtils.streamPureModel(
            cfg.getApiKey(), cfg.getModel(), messages, tools, "auto",
            cfg.isThinkingEnabled(), emitter);

        emitContentAndThought(emitter, events);  // 透传 content/thoughts SSE

        List<ToolCall> toolCalls = extractToolCalls(events);
        if (toolCalls.isEmpty()) break;  // 最终回答

        for (ToolCall tc : toolCalls) {
            sseHelper.send(emitter, Map.of("type","tool_call","id",tc.id,"name",tc.name,"args",tc.args));
            Map<String, Object> result = toolRegistry.execute(tc.name, tc.args, userId);
            sseHelper.send(emitter, Map.of("type","tool_result","id",tc.id,"name",tc.name,"results",result));
            messages.add(toolResultMessage(tc, result));
            if (isSearchTool(tc.name)) searchCnt++;
        }
        if (searchCnt >= cfg.getMaxSearchCount()) break;
    }
    sseHelper.done(emitter);
}
```

7.2 单元测试：5 个 case（无工具 / KB / WebSearch / KB+WebSearch / searchCnt 满）

7.3 Commit：`feat(ai): ReAct 编排器（本期 M1 必做）`

#### 任务 8：WkAiAgentService 编排入口

**文件：**
- 新建：`wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/WkAiAgentService.java`
- 新建：impl

**步骤：**

8.1 接口：

```java
public interface WkAiAgentService {
    void chat(AgentChatRequestDto dto, SseEmitter emitter);
}
```

8.2 实现：
- 注入 `AgentConfigService`、`AgentReActExecutor`、`ToolRegistry`
- 入口做 Redis 限流（参考 `WkTrainingRoleStudentController`）
- 调 `AgentReActExecutor.execute(dto, cfg, emitter)`

8.3 Commit：`feat(ai): WkAiAgentService 编排入口`

#### 任务 9：WkAiAgentController SSE 端点（T-D2-5）

**文件：**
- 新建：`wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/WkAiAgentController.java`

**步骤：**

9.1 控制器：

```java
@PostMapping(value = "/chat-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter chatStream(@Valid @RequestBody AgentChatRequestDto dto) {
    SseEmitter emitter = new SseEmitter(120_000L);  // 2 分钟超时（D 决策）
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

9.2 路径：`POST /api/wk/ai/agent/chat-stream`（D8 决策 + `/chat` → `/chat-stream` 标识流式）

9.3 Commit：`feat(ai): WkAiAgentController 暴露 SSE 端点`

#### 任务 10：SSE chunk 协议类（T-D2-4）

**文件：**
- 新建：`wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AgentChatChunkVo.java`
- 新建：`AgentChatRequestDto.java`

**说明**：含 8 种 type 的统一 VO + 含 `promptKey/bizParams` 的 DTO。

10.1 Commit：`feat(ai): SSE chunk 协议与请求 DTO 定义`

#### 任务 11：v2 前端 chatAgentStream 适配（T-D2-6）

**文件：**
- 修改：`wk-train-center-ui/src/api/ai/common.js`
- 修改：`wk-train-center-ui/src/views/web/ai/components/AiAssistant/...`

**步骤：**

11.1 **新增** `chatAgentStream(options, callbacks, signal)` 函数：
- POST 到 `/api/wk/ai/agent/chat-stream`
- 解析 8 种 type 的 SSE event
- 调对应回调（onContent / onThought / onToolCall / onToolResult / onCitation / onFile / onError / onDone）

11.2 `chatAppStream` 内部转发到 `chatAgentStream`（保留签名），`localStorage('ai:useAgentGateway')` 开关。

11.3 **删除**原百炼 `extractAppTextFromChunk` 调用（后端已拆好，前端不再解析百炼 chunk）。

11.4 v2 错误增强：在 `AiAssistant.vue` 的 catch 块调用 `classifyStreamError`（复用 H5 的分类函数）。

11.5 Commit：`feat(ai): v2 前端 chatAgentStream 适配`

#### 任务 12：H5 前端 chatAgentStream 适配

**文件：**
- 修改：`wk-mhc-mobile/src/pages/smart-training/api/ai/common.ts`
- 修改：`wk-mhc-mobile/src/pages/smart-training/composables/ai/useChatSession.ts`

**步骤：**

12.1 同任务 11，新增 `callAgentChatStream` TypeScript 版本。

12.2 `useChatSession.ts` 替换 `chatAppStream` 调用为 `callAgentChatStream`。

12.3 `classifyStreamError` 保留并增强，复用给 v2。

12.4 Commit：`feat(ai): H5 前端 chatAgentStream 适配`

#### 任务 13：联调与回归

13.1 后端 `mvn clean compile` + `mvn test`

13.2 curl 测 SSE 端点：
```bash
curl -N -X POST http://localhost:8080/api/wk/ai/agent/chat-stream \
  -H "Content-Type: application/json" \
  -d '{"prompt":"hello","messages":[{"role":"user","content":"hello"}],"tools":{"enableKbSearch":true,"enableWebSearch":true,"enableThinking":true},"bizParams":{"promptKey":"answer_assistant"}}'
```

13.3 v2 答疑页手动测试：文字 / 图片 / 文档 / 停止按钮 / 断网

13.4 H5 智能训练页手动测试：同 v2

13.5 切流与回滚：`localStorage.setItem('ai:useAgentGateway','0')` 切回直连（**M1 仍保留旧 chatAppStream 路径不删**，M3 全切后再说）

### 8.6 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| 纯模型 + 自建 ReAct 引入额外开发量 | M1 估时增加 | 复用 vue demo 设计，Java 重写不重设计 |
| Tool tool_calls 增量拼接复杂 | 工具调用丢失 | 参考 `memory 86d5a6b2`：百炼增量模式下 tool_calls 走 `Map<index, accumulated>` 累积 |
| WebSearch key 走 yml 风险 | key 泄露 | M1 走 `CfgPropService` + type=`ai`，yml 仅 placeholder（主人 D3 决策） |
| 多 provider 路由检查未做 | 主 provider 挂了全挂 | M1 先上单 provider，M2 加路由 |
| SseEmitter 2 分钟超时被 ReAct 占用 | 复杂问题被截断 | ReAct `iter >= maxIterations` 时显式 `emitter.complete()` 提前结束 |
| `appKey` / `appId` 路径已被 Qoder v1 沉淀 | 与 v2 协议不一致 | 任务 10/11/12 统一以 v2 为准，旧 `appId` 字段废弃 |

### 8.7 待主人拍板项 v2

| ID | 拍板项 | Claude 推荐 | Qoder 推荐 | 主人决策 |
|---|---|---|---|---|
| T-DEC-v2-1 | M1 是否包含 ReAct？ | 是（D2 决策） | 同 | ✅ 是 |
| T-DEC-v2-2 | `SseEmitter` 超时时长 | 2 分钟（qoder） | 2 分钟 | ✅ 2 分钟 |
| T-DEC-v2-3 | WebSearch M1 多 provider 路由？ | 否（M2 加） | 否 | ❌ 否 |
| T-DEC-v2-4 | 出题 appKey `quiz_gen_agent` | P2 | — | 待主人 |
| T-DEC-v2-5 | v3 端是否纳入 | P1 | — | 待主人 |

### 8.8 与 v1 差异总表（主人拍板依据）

| 维度 | Qoder v1 | Claude v1 | v2 最终（取代两边） |
|---|---|---|---|
| 流式模型 | WebFlux `Flux<String>` | `SseEmitter` | **`SseEmitter`**（D1） |
| 后端调百炼端点 | `/api/v1/apps/{appId}/completion` | 同 v1 | **`/compatible-mode/v1/chat/completions`**（D2） |
| system prompt | 百炼 App 控制台 | 同 | **后端 yml / Java 管**（D2） |
| tools / RAG | 百炼 App 配 | Claude M2 后端做 | **本期 M1 后端做**（D2） |
| ReAct | 阶段二 | M2 | **M1 本期必做**（D2） |
| appId / appKey | appId 透传 | appKey 抽象 | **废除**（D2） |
| 协议类型 | 5 种 | 8 种 | **8 种**（本期全实现） |
| 灰度开关 | localStorage | yml + 白名单 | **localStorage**（M3 再升级） |
| 路径风格 | `/api/wk/ai/agent/chat` | `/api/ai/{appKey}/chat-stream` | **`/api/wk/ai/agent/chat-stream`**（D8） |
| 阶段切分 | 2 阶段 | 4 阶段（M1~M4） | **M1 一阶段做透**（v2 简化） |
| 新模块 vs 扩展 | 扩展 `wk-module-ai` | 新建 `wk-module-ai-gateway` | **扩展 `wk-module-ai`**（Qoder 采纳） |

### 8.9 Claude 审核的 Q1~Q5 落地清单

| Claude 问题 | v2 落地 |
|---|---|
| Q1 WebFlux 依赖 | 任务 1 改 SseEmitter，不加新依赖 |
| Q2 appKey 抽象 | **废除 appId/appKey**（D2 决策），bizParams.promptKey 取代 |
| Q3 `type=raw` 临时透传 | **不再使用**（D2 后端自拆 8 类型，前端不再解析百炼 chunk） |
| Q4 v2 错误增强写虚 | 任务 11.4 明确具体改动文件 `AiAssistant.vue` |
| Q5 ReAct 空壳 | 任务 5/6/7 真实对接 KB / Tavily / ReAct |

### 8.10 协作分工最终版

| 角色 | 职责 | 状态 |
|---|---|---|
| **Claude** | 起草本 v2 主计划 + 后端实现（任务 1~10）+ 单元测试 | 进行中 |
| **Qoder** | ① 复审本 v2 主计划 ② 实施前端切流（任务 11~12） ③ H5 `chatAgentStream` 实现 ④ 三端 SSE client 对齐 ⑤ 复审 Claude 提交的 PR | 待启动 |
| **主人** | ① 拍板 T-DEC-v2-4（出题） ② 拍板 T-DEC-v2-5（v3） ③ 验收 | 待启动 |

### 8.11 计划范围最终版

- **本期**：v2 + H5 两端的 AI 智能体调用迁移到后端业务代理
- **不在本期**：v3 端（P1，待主人拍板）、出题 appKey（P2，待主人拍板）、自有业务会话历史（v1.1）、多 provider 路由降级（M2）

---

**v2 主计划作者**:Qoder + Claude 联合产出  
**v2 主计划时间**:2026-07-14  
**取代范围**:
- Qoder 第一版 `tasks/2026-07-14-ai-agent-gateway-v2-h5-migration(qoder).md` 原任务 1~10
- Claude 第一版 `design/2026-07-14-self-ai-gateway(claude)/` README.md + M1~M4
