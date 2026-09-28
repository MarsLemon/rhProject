# H5 移动端 AI 模块改造（mobile1.1）

> **范围**: H5 移动端（wk-mhc-mobile）AI 模块改造
> **Owner**: Qoder（前端）+ Claude（后端接口对齐）
> **前置依赖**: 统一计划 v1.0 任务 1~8（后端 AI 网关）已完成
> **创建时间**: 2026-07-17

---

## 背景

H5 移动端（wk-mhc-mobile）当前 AI 模块仍走**直连百炼**架构（`chatAppStream` → `fetchAiChatConfig` 获取 apiUrl/apiKey → 直接调百炼 `/api/v1/apps/{appId}/completion`）。需迁移到自建后端业务网关 `/api/wk/ai/agent/chat-stream`，与 v2 端（wk-train-center-ui）对齐。

### 现状关键文件

| 文件 | 行数 | 职责 | 改造方向 |
|---|---|---|---|
| `api/ai/common.ts` | 939 | AI 配置获取 + 流式调用 + chunk 解析 | 新增 `callAgentChatStream`，保留旧 `chatAppStream` 灰度 |
| `composables/ai/useChatSession.ts` | 765 | 会话状态管理 + 历史记录 + 流式消费 | 切流到 `callAgentChatStream`，错误分类 |
| `composables/ai/types.ts` | 71 | 类型定义 + `KNOWLEDGE_BASE_PIPELINE_ID` 硬编码 | 删除硬编码，改后端返回 |
| `components/ai/TrainingAssistantView.vue` | 821 | AI 陪练视图 | 教学反馈 + 角色扮演优化 |
| `components/ai/AnswerAssistantView.vue` | 157 | AI 问答视图 | 切流 + KB 检索优化 |
| `components/ai/AiInputBar.vue` | 875 | 输入栏（文字/语音/图片/文件） | 新增 DashScope 文档上传 |
| `components/ai/AiMessageList.vue` | 752 | 消息列表渲染 | 12 类 SSE 事件渲染 + 原文按钮 |

### 与 v2 端的差异

| 维度 | v2（wk-train-center-ui） | H5（wk-mhc-mobile） |
|---|---|---|
| 框架 | Vue 2.7 + Element UI | Vue 3 + Vant |
| 语言 | JavaScript | TypeScript |
| 流式调用 | `chatAgentStream`（已迁移） | `chatAppStream`（待迁移） |
| DashScope 文件上传 | ✅ P1-7 已完成 | ❌ 待实施 |
| SSE 事件类型 | 12 type（已适配） | 8 type（旧版，待升级） |
| KB pipelineId | 后端管理 | 硬编码 `t7tv9lmp6f` |
| 灰度开关 | `localStorage('ai:useAgentGateway')` | 待实施 |

---

## 任务清单

### M1.1-1: H5 `callAgentChatStream` 适配 — Qoder

**文件**: `src/pages/smart-training/api/ai/common.ts`

**内容**:
- 新增 `callAgentChatStream(options, callbacks, signal)` 函数
- POST `/api/wk/ai/agent/chat-stream`（与 v2 端同一端点）
- 解析 12 类 SSE 事件：`content / thoughts / citations / tool_call / tool_result / file / error / done / usage / metadata / progress / interrupt`
- 回调接口：`onContent / onThoughts / onCitations / onToolCall / onToolResult / onFile / onError / onDone / onUsage / onMetadata`
- 保留旧 `chatAppStream` 100% 不动（灰度回退）
- 新增 `localStorage('ai:useAgentGateway')` 切流逻辑

**请求体**（与 v2 对齐，废 appId）:
```typescript
interface AgentChatStreamOptions {
  prompt?: string
  messages: Array<{ role: string, content: string, fileList?: string[] }>
  fileList?: string[]
  dashScopeFileIds?: string[]  // P1-7: DashScope file-id
  tools: {
    enableKbSearch?: boolean
    enableWebSearch?: boolean
    enableThinking?: boolean
  }
  bizParams: {
    promptKey: 'answer_assistant' | 'training_assistant'
    model?: string
  }
}
```

**估时**: 1d

---

### M1.1-2: H5 `useChatSession` 切流 + 错误分类 — Qoder

**文件**: `src/pages/smart-training/composables/ai/useChatSession.ts`

**内容**:
- `sendMessage` 内部根据 `localStorage('ai:useAgentGateway')` 切换 `chatAppStream` / `callAgentChatStream`
- 新增错误分类逻辑（与 v2 `classifyStreamError` 对齐）:
  - `AI_AUTH_FAIL` → "AI 配置异常，请联系管理员"
  - `AI_QUOTA_EXCEED` → "AI 额度已用完"
  - `AI_TOOL_FAIL` → "工具调用失败，已降级为纯文本回答"
  - `AI_RATE_LIMIT` → "操作过于频繁，请稍后再试"
  - `AI_INTERNAL` → "AI 服务暂时不可用"
- 中断时保留 `fullText`（AbortController 不丢已生成内容）
- 删除 `KNOWLEDGE_BASE_PIPELINE_ID` 硬编码引用，改由后端 `AgentConfigService` 管理

**估时**: 1d

---

### M1.1-3: H5 DashScope Qwen-Long 文件上传 — Qoder

**文件**:
- `src/pages/smart-training/components/ai/AiInputBar.vue`
- `src/pages/smart-training/api/ai/common.ts`（新增 token/删除 API）
- `src/pages/smart-training/composables/ai/useChatSession.ts`（透传 dashScopeFileIds）

**内容**:
- 与 v2 P1-7 对齐：前端直传 DashScope Files API
- 新增 `getDashScopeUploadToken()` — 调 `POST /api/wk/ai/agent/dashscope/upload-token`
- 新增 `deleteDashScopeFiles(fileIds)` — 调 `DELETE /api/wk/ai/agent/dashscope/files`
- `AiInputBar.vue` 文件选择时双通道上传：
  - ① OSS 上传（图片预览/下载，已有逻辑）
  - ② DashScope 上传（文档类文件：pdf/doc/docx/xls/xlsx/ppt/pptx/txt/md/csv）
- `useChatSession.ts` 透传 `dashScopeFileIds` 到请求体
- 会话结束（`onUnmounted`）调用 `deleteDashScopeFiles` 清理一次性文件

**估时**: 1d

---

### M1.1-4: H5 AI 陪练改造（切流 + 教学反馈 + 角色扮演）— Qoder

**文件**: `src/pages/smart-training/components/ai/TrainingAssistantView.vue`

**内容**:
- 切流走 `callAgentChatStream`，`bizParams.promptKey = 'training_assistant'`
- 角色选择 → 开启陪练 → 多轮对话 → 结束评分 全链路走新网关
- 教学反馈优化：
  - 结束陪练时后端返回评分 + 评价（走新网关 SSE `done` 事件的 `usage` 字段）
  - 评价生成失败时保留 `pendingScoreSave` 重试逻辑
- 角色扮演优化：
  - 角色背景 + 要求作为 system prompt 透传（后端 yml 管理，前端只传 `promptKey`）
  - 多轮对话上下文窗口管理（messages 数组累积，超限时截断旧消息）

**估时**: 1.5d

---

### M1.1-5: H5 AI 问答改造（切流 + KB 检索优化）— Qoder

**文件**: `src/pages/smart-training/components/ai/AnswerAssistantView.vue`

**内容**:
- 切流走 `callAgentChatStream`，`bizParams.promptKey = 'answer_assistant'`
- KB 检索优化：
  - 知识库开关走后端 `tools.enableKbSearch`（不再前端传 `rag_options.pipeline_ids`）
  - `tool_result` 事件中 KB 召回片段高亮显示
- 引用来源展示：
  - `citations` 事件渲染为可点击的引用角标
  - 点击展开引用详情（title / url / snippet）
- 多轮对话优化：
  - 消息历史持久化（已有 `addRecord` / `getRecord` 逻辑保留）
  - 上下文窗口管理（与陪练共用 `useChatSession` 逻辑）

**估时**: 1d

---

### M1.1-6: H5 消息列表 12 类 SSE 事件渲染 + 原文按钮 — Qoder

**文件**: `src/pages/smart-training/components/ai/AiMessageList.vue`

**内容**:
- 12 类 SSE 事件渲染：
  - `content` — 流式文本（Markdown 渲染，已有）
  - `thoughts` — 思考过程折叠面板（默认收起，点击展开）
  - `citations` — 引用来源角标 + 抽屉
  - `tool_call` — 工具调用可视化（KB 检索 / 联网搜索）
  - `tool_result` — 工具结果展示（KB 召回片段 / 搜索结果）
  - `file` — 文件附件展示
  - `error` — 错误提示（分类文案）
  - `done` — 完成标记
  - `usage` — token 用量（调试用，默认不显示）
  - `metadata` — 元数据（模型名/响应时间）
  - `progress` — 进度提示（"正在搜索..."）
  - `interrupt` — 中断提示
- 新增"显示原文"按钮（每条 AI 消息下）：
  - 4 个 toggle：思考过程 / 工具调用 / KB 原文 / 联网结果
  - 与 v2 端 D18 决策对齐

**估时**: 1d

---

### M1.1-7: 联调与回归 — 联合

**步骤**:
1. H5 `npm run dev` 启动，验证编译通过
2. AI 问答页手动测试：文字 / 图片 / 文档 / 停止按钮 / KB / WebSearch
3. AI 陪练页手动测试：角色选择 / 开启陪练 / 多轮对话 / 结束评分
4. DashScope 文件上传测试：上传 PDF → 验证 file-id → 验证 qwen-long 引用
5. 灰度开关验证：`localStorage.setItem('ai:useAgentGateway', '0')` → 切回旧 `chatAppStream`
6. 50 题基线对比（与 v2 共用同一批问题，验证 H5 端答案一致性）

**估时**: 0.5d

---

## 估时汇总

| 任务 | 内容 | 负责人 | 估时 |
|---|---|---|---|
| M1.1-1 | `callAgentChatStream` 适配 | Qoder | 1d |
| M1.1-2 | `useChatSession` 切流 + 错误分类 | Qoder | 1d |
| M1.1-3 | DashScope Qwen-Long 文件上传 | Qoder | 1d |
| M1.1-4 | AI 陪练改造 | Qoder | 1.5d |
| M1.1-5 | AI 问答改造 | Qoder | 1d |
| M1.1-6 | 消息列表 12 类 SSE + 原文按钮 | Qoder | 1d |
| M1.1-7 | 联调与回归 | 联合 | 0.5d |
| **合计** | | | **7d** |

---

## 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| H5 网络环境差（4G/弱网） | SSE 长连接易断 | AbortController + 断线保留 fullText + 自动重连（M2） |
| Vant 组件库与 v2 Element UI 交互差异 | UI 不一致 | H5 独立设计，不强制与 v2 一致 |
| DashScope CORS（H5 WebView） | 文件上传被拦截 | 验证 WebView 是否允许跨域 fetch；若不行走后端代理 |
| 旧 `chatAppStream` 直连百炼依赖 appId | 灰度回退时 appId 仍需可用 | 保留旧代码 100% 不动，灰度开关控制 |
| 12 类 SSE 事件与 H5 现有 chunk 解析差异大 | 解析逻辑重写 | `callAgentChatStream` 全新实现，不修改旧 `chatAppStream` |

---

## 验收标准

- [ ] H5 `npm run dev` + `npm run build` 通过
- [ ] `callAgentChatStream` 正确解析 12 类 SSE 事件
- [ ] AI 问答页切流后功能与 v2 端对齐（文字/图片/文档/KB/WebSearch）
- [ ] AI 陪练页切流后角色选择 → 多轮对话 → 结束评分全链路通
- [ ] DashScope 文件上传 → qwen-long 引用 → 回答包含文档内容
- [ ] 灰度开关可控制切流（`localStorage('ai:useAgentGateway')`）
- [ ] 旧 `chatAppStream` 100% 保留（回退可用）
- [ ] `KNOWLEDGE_BASE_PIPELINE_ID` 硬编码已删除
- [ ] 错误分类文案与 v2 端一致

---

## 关联文档

- 统一计划: `tasks/2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md`（任务 11 H5 改造）
- v2 P1-7 审核报告: `wk-module-ai/docs/P1-7-dashscope-qwen-long-audit-report.md`
- v2 前端实现参考: `wk-train-center-ui/src/views/web/ai/components/AiAssistant/`
- H5 现有代码: `wk-mhc-mobile/src/pages/smart-training/`
- 后端网关入口: `POST /api/wk/ai/agent/chat-stream`
- 后端 DashScope 接口: `POST /api/wk/ai/agent/dashscope/upload-token` / `DELETE /api/wk/ai/agent/dashscope/files`
