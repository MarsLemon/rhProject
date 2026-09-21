---
version: 0.1.0
project: wk-train-center
status: draft-v1
lastUpdated: 2026-07-14T15:00:00+08:00
tags:
  - ai-gateway
  - architecture
  - refactor
owners:
  - 主人
  - Claude (起草)
  - Qoder (审核)
---

# 自建 AI 调用网关 — 总计划 v1(claude 起草)

> **状态**: 第一版,等 Qoder 审核与反问。
> **范围**: 把 wk-train-center-ui(v2) + wk-train-center-ui-v3 + wk-mhc-mobile(h5) 三个前端中所有"阿里云百炼"直连调用,**统一收敛到后端自建 AI 网关**。
> **核心约束**(2026-07-14 主人拍板):
> 1. 所有内容(对话/工具/会话/文件)**都必须经过后端**
> 2. **知识库仍走百炼**(沿用 BailianSyncJob + BailianService 已有能力,后端自调)
> 3. **websearch 自己调**(对接 Tavily/其他,后端自调)
> 4. **回退策略**:灰度开关 + 老逻辑兜底
> 5. **4 阶段推进**:M1 协议 → M2 工具 → M3 会话 → M4 下线

---

## 1. 背景与现状(基于代码扫描)

### 1.1 三端当前直连点(已扫)

| 端 | 文件 | 入口 | 协议 |
|---|---|---|---|
| v2(学员/管理) | [src/api/ai/common.js](wk-train-center-ui/src/api/ai/common.js) | `chatAppStream` / `chatModelStream` | 百炼 App Completion / ChatCompletion,前端直接 fetch dashscope.aliyuncs.com |
| v2 | [src/views/web/ai/components/AiAssistant/conversation/infrastructure/chatStreamGateway.js](wk-train-center-ui/src/views/web/ai/components/AiAssistant/conversation/infrastructure/chatStreamGateway.js) | `streamChatCompletion` | 调上 |
| v3 | [src/utils/ai/bailian.ts](wk-train-center-ui-v3/src/utils/ai/bailian.ts) | Agent 上下文管理 + buildAgentHeaders | X-Agent-Id / token 头 |
| v3 | [src/api/client/ai/apps.ts](wk-train-center-ui-v3/src/api/client/ai/apps.ts) | 三个 AppId 硬编码 | 走 `src/api/ai/common.js` 同源(同包体复用) |
| h5 | `src/pages/smart-training/api/ai/common.ts` / `src/api/ai-assistant.ts` / `src/api/knowledge-ai/knowledgeAiAssistant.ts` | 同上 | 复刻 v2 协议 |

**百炼 AppId 现状**(硬编码在 v3 端):
- `quiz_gen_agent` → `202dd7f7ca16445da9da7029be337b5f`(出题)
- `answer_assistant_app` → `e23e7edc65dc48968e114e0a7051668f`(学员答疑)
- `training_assistant_app` → `fa6fc426f1c24cfd87502f537e320b64`(AI 陪练)
- 知识库 `pipeline_id` = `t7tv9lmp6f`(v2 硬编码)

### 1.2 后端已有能力(可复用,不重造)

- `wk-modules/wk-module-ai/` — 已有 domain/application/infra 三层,但 **没有 Controller 暴露 AI 调用**,只暴露了 `WkAnswerStudentController` / `WkTrainingRole*` 等**数据层**接口
- `wk-modules/wk-module-file-source/src/main/java/com/wk/traincenter/oss/service/BailianService.java` — 百炼 OSS 知识库同步/上传/检索(基于 bailian20231229 SDK)
- `yf-ability/ai/providers/bailian/BaiLianConfigServiceImpl.java` + `AiFactory.java` — Provider 抽象层(已抽象,新增 provider 容易)
- `yf-ability/config/dto/BailianKnowledgeConfig.java` + `BailianVisionConfig.java` + `BailianVoiceConfig.java` — 配置 DTO 已有 voice/vision,**缺 ChatConfig**
- `wk-modules/wk-module-voice/infra/dashscope/` + `wk-modules/wk-module-vision/infra/dashscope/` — voice/vision 已自建薄包装,**没有 chat 包装**
- `BailianSyncJob` / `CourseClientService` / `WkFileResourceController` — 文件同步链路完整

### 1.3 demo 可参考点(但不照抄)

vue 问答 demo(`E:\otherProject\vue问答Demo`)展示的形态:
- ReAct 循环 + tool_calls 累积 + 流式输出
- A1 答疑 + A2 评分 + A3 纠正(后两者本期**不做**)
- `<<<suggest>>>` 块剥离 + KB/web 工具开关 + 深度思考开关
- 引用来源抽屉 + 验证重试

→ 形态可借鉴,**但本期自建网关是后端代理,前端只做 SSE 消费 + 界面**,不复制 ReAct 复杂度。

### 1.4 现存坑(扫到的)

- 前端硬编码 `KNOWLEDGE_BASE_PIPELINE_ID = 't7tv9lmp6f'`,与百炼控制台强耦合
- 多个端 `isBailianConfig()` 散落,切换服务商要改 3 处
- 老逻辑无统一异常格式,401/429/500 错误中文文案散落
- vue demo 缺:会话持久化、文件解析失败兜底、引用来源点击打开、网络中断重连、并发请求取消

---

## 2. 目标(本期)

### 2.1 必达
- 三端**零直连百炼**:所有 AI 调用走 `POST /api/ai/{appKey}/chat-stream`(SSE)
- 后端**统一协议**:不论走百炼 ChatCompletion / App Completion / 未来自研,前端协议不变
- 知识库检索后端代理(沿用 `BailianService.knowledgeBaseSearch`)
- websearch 后端代理(本期先接 Tavily,vue demo 已验过)
- 灰度开关:按 userId / appKey / 全局 三层控制,失败自动回退老逻辑
- 老逻辑 4 阶段内**全部下线**(M4)

### 2.2 不做(本期)
- 不做 A2 评分/A3 纠正(评估能力超本期)
- 不做会话历史跨端共享(后端不存业务会话,只做 LLM session 透传)
- 不做 token 计量/计费(后端可加埋点,但不暴露给前端)
- 不替换百炼模型(本期不引入其他 LLM provider)
- 不做 RAG 自建(知识库仍 100% 走百炼,自建只做"代理 + 编排")

---

## 3. 协议设计(草案,v1.1 等 Qoder 反问)

### 3.1 对话入口(后端 → 前端,SSE 协议)

```
POST /api/ai/{appKey}/chat-stream
Headers: Authorization: Bearer {userToken}
Body: {
  "messages": [{ "role": "user|assistant|system", "content": "...", "file_list": ["fileId"] }],
  "bizParams": { ... },                    // 业务参数(透传到百炼 biz_params)
  "tools": { "enableKbSearch": true, "enableWebSearch": true, "enableThinking": true },
  "stream": true,                         // 默认 true
  "fileUrlExpires": 600,                  // 文件签名有效期(秒)
  "abortSignal": true
}

SSE Response (text/event-stream):
  data: {"type":"chunk","delta":"...", "fullText":"..."}
  data: {"type":"thought","content":"...","stepNo":1}
  data: {"type":"tool_call","name":"knowledge_base_search","args":{...}}
  data: {"type":"tool_result","name":"knowledge_base_search","results":[...]}
  data: {"type":"citation","items":[{"title":"...","url":"...","snippet":"..."}]}
  data: {"type":"file","items":[{"fileId":"...","url":"...","type":"image|file"}]}
  data: {"type":"error","code":"...","message":"...","requestId":"..."}
  data: {"type":"done","usage":{...},"sessionId":"...","requestId":"..."}
  data: [DONE]
```

### 3.2 异常格式(统一 envelope)

```json
{ "code": "AI_AUTH_FAIL|AI_QUOTA_EXCEED|AI_TOOL_FAIL|AI_INTERNAL", "message": "中文文案", "requestId": "后端日志 ID", "fallback": true }
```

- `fallback: true` 时前端自动切回老逻辑(灰度期关键)

### 3.3 工具协议(后端 → 后端内部,前端不感知)

- `KnowledgeBaseSearch(query)` → 调 `BailianService.knowledgeBaseSearch`
- `WebSearch(query)` → 调 `TavilyClient.search`(本期先 1:1 移植 demo 逻辑)
- 工具结果格式按 vue demo `formatToolResult` 规约(后端 100% 重写,不复用 demo)

### 3.4 会话/文件(本期不新增端点,沿用)

- 文件上传:沿用 `WkFileResourceController`(已存在)
- 会话历史:沿用 `WkAnswerStudentController`(只读,不分流)

---

## 4. 架构分层(后端新增 `wk-module-ai-gateway`)

```
wk-module-ai-gateway/  (新建)
├── api/
│   ├── AiGatewayController.java              # POST /api/ai/{appKey}/chat-stream
│   ├── AiGatewayAppExceptionHandler.java     # 统一异常 → 统一格式
│   └── dto/
│       ├── ChatStreamReq.java
│       ├── SseChunk.java                     # type: chunk/thought/tool_call/...
│       └── ErrorEnvelope.java
├── application/
│   ├── AiChatService.java                    # 主流程
│   ├── ReActOrchestrator.java                # ReAct 循环 + tool_calls 累积
│   └── ToolRegistry.java                     # 注册 KB/WebSearch
├── domain/
│   ├── model/Message.java / ToolCall.java
│   ├── port/ChatProviderPort.java            # 抽象:不绑定百炼
│   └── port/KnowledgeBasePort.java           # 抽象:KB 检索
├── infra/
│   ├── provider/bailian/BailianChatProvider.java    # 调百炼 App/Chat Completion
│   ├── provider/bailian/BailianChatProviderSse.java # SSE 流式封装
│   ├── kb/BailianKnowledgeBaseAdapter.java          # 适配 BailianService
│   ├── websearch/TavilyWebSearchAdapter.java
│   └── config/AiGatewayProperties.java
└── gradle-toggle/                             # 灰度开关配置
    └── FeatureToggle.java                     # userId/appKey/global 三层
```

**关键设计**:
- `ChatProviderPort` 抽象(本期只有 `BailianChatProvider` 一个实现,未来加 OpenAI/自研不破协议)
- 灰度开关在 Controller 入口判,失败 fallback 时**前端不感知**,后端直接降级到老 endpoint(`/api/ai/legacy/...`,临时老路径转发)

---

## 5. 阶段切分

| 阶段 | 范围 | 准入 | 准出 |
|---|---|---|---|
| **M1 协议** | 后端 `wk-module-ai-gateway` 骨架 + 对话入口(SSE) + 异常格式 + 前端 v2 答疑页 1 个端点切换 + 灰度开关 | 三端 mock 接口对通 | v2 答疑页 100% 流量走新接口 1 周无故障 |
| **M2 工具** | KB/WebSearch 后端代理 + ReAct 循环 + 三端统一 `<<<suggest>>>` 块剥离 | demo 的 A1 行为 100% 复刻 | 1 次回归压测:答疑页 50 个真实问题成功率 ≥ 95% |
| **M3 会话/文件** | 历史会话 API 抽象 + 文件签名统一(私有桶 → 后端) | 鉴权全走 userToken | 三端 100% 切流 |
| **M4 下线** | 老 `chatAppStream` / `chatModelStream` 注释 + 半年后删 | M3 稳定运行 1 个月 | 删除老代码 + 关停灰度开关 |

每阶段详细计划见:
- [M1-协议.md](M1-协议.md) ✅
- [M2-工具.md](M2-工具.md) ✅
- [M3-会话文件.md](M3-会话文件.md) ✅
- [M4-下线.md](M4-下线.md) ✅

---

## 6. 风险登记

| 风险 | 等级 | 应对 |
|---|---|---|
| 百炼 SSE 协议变更 | 中 | `BailianChatProviderSse` 单点封装,变更只改这层 |
| 知识库检索后端转发引入额外延迟 | 中 | 后端复用 HTTP 连接池 + timeout 复用 15s(同 demo) |
| 灰度开关误判导致全员走老逻辑 | 高 | 灰度开关默认值 = **false**,需主人显式打开 |
| 前端三端 SSE 重连/取消实现不一致 | 中 | 抽 `@/utils/sse-client`(v2)、`@/utils/ai/sse-compat`(v3)、`@/utils/ai/sse-client`(h5)统一封装 |
| 老逻辑兜底路径未保留完整 | 高 | M1 必须保留 100% 老 `chatAppStream` 入口,M4 才删 |

---

## 7. 反问点(等主人/Qoder)

> Qoder 优先看 §7.1 协议层,Qoder 不熟悉业务的话看 §7.2 业务,主人看 §7.3 拍板项。

### 7.1 协议层(等 Qoder 反问)

1. `POST /api/ai/{appKey}/chat-stream` 路径用 `appKey`(语义:`quiz_gen_agent`)还是 `appId`(百炼 ID)?**推荐 appKey**,原因:不暴露百炼 ID 给前端,便于切换 provider
2. SSE 事件 type 命名:`chunk` / `thought` / `tool_call` / `tool_result` / `citation` / `file` / `error` / `done` 这套够不够?**推荐够用**
3. `bizParams` 是否要进协议?百炼支持但 demo 没用,**推荐本期不透传**,M3 再加
4. 流式 cumulative vs incremental(每 chunk 是 delta 还是 full)?**推荐 incremental**,与 demo 保持一致

### 7.2 业务层(等 Qoder 反问)

1. 答疑/陪练/出题 3 个 appKey,本期是否都迁移?**推荐先答疑 + 陪练,出题 P2**
2. 知识库 pipeline_id 后端化策略:① 后端配置中心 sys_config ② 写死 `application.yml` **推荐 ①**,与现有 `BailianKnowledgeConfig` 风格一致
3. 引用来源字段映射:百炼返回 `doc_references` / `references` / `pages` 三种结构,本期统一抽取成 `[{title, url, snippet, type, score}]`,**推荐**

### 7.3 主人拍板项(等主人)

1. 灰度开关默认值:**推荐 false**(本期手工按 userId 白名单放开)
2. 出题 appKey 是否本期动?**推荐 P2**(出题是管理端,流量小,出问题影响范围小)
3. 老逻辑兜底保留时长:**推荐 M3 后保留 ≥ 1 个月**

---

## 8. 验收口径(总)

| 维度 | 指标 |
|---|---|
| 协议稳定性 | 1 周线上 0 例 5xx 来自新接口 |
| 业务等价 | 答疑页 50 个真实问题 ≥ 95% 行为一致(与老直连对比) |
| 延迟 | P95 推理耗时 + 后端代理开销 ≤ 老直连 × 1.15 |
| 安全 | 前端无任何百炼 apiKey / appId / workspaceId |
| 可维护 | 新增 provider(OpenAI/自研)≤ 1 个新 class,不动协议层 |

---

## 9. 协作分工(主人拍板)

| 角色 | 职责 |
|---|---|
| **Claude(我)** | 起草协议 + 后端 `wk-module-ai-gateway` 实现 + 前端 v2/v3 切换 + 单测 + 集成测试 |
| **Qoder** | ① 审核协议设计(§3) ② 审核后端骨架(§4) ③ 反问 §7 ④ 写 wk-mhc-mobile 端切换实现 ⑤ 复审 code review |
| **主人** | ① 拍板 §7.3 ② 灰度白名单放人 ③ 验收 |

---

## 10. 关联文档(必读,先于开工)

- [[../../../memory/reference-bailian-file-size-limits.md]] — 百炼文件大小上限,KB 检索代理前必看
- [[../../../memory/domain-coupling-course-study-task.md]] — AI 模块与培训计划/学习任务耦合点
- [[../../../memory/domain-overview.md]] — 五大域边界
- [vue 问答 demo ReActA1.js](../../../../otherProject/vue问答Demo/src/ReActA1.js) — ReAct 循环参考实现
- [vue 问答 demo prompts.js](../../../../otherProject/vue问答Demo/src/prompts.js) — 提示词规约
- [wk-train-center-ui AI 入口](../../../../wk-train-center-ui/src/api/ai/common.js) — v2 老直连实现
- [wk-train-center-ui-v3 AI 工具](../../../../wk-train-center-ui-v3/src/utils/ai/bailian.ts) — v3 老直连
- [wk-train-center-service BailianService](../../../../wk-train-center-service/wk-modules/wk-module-file-source/src/main/java/com/wk/traincenter/oss/service/BailianService.java) — 后端已有百炼能力

---

## 11. 变更日志

- 2026-07-14 v0.1.0 (Claude 起草) — 初版,等 Qoder 审核
