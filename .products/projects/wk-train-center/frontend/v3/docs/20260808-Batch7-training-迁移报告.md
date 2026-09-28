# Batch 7 admin/ai + web/ai 训练助手迁移报告

> Git分支：v3.0  作者：Qoder  版本：v3.0  日期：2026-08-08

## 概述

本次评估覆盖 Batch 7 范围内的文件：剩余 dashboard 文件 + admin/ai + web/ai 训练助手核心组件 `TrainingAssistantView.vue`。

经详细对比，发现 **TrainingAssistantView.vue 是真实的业务功能丢失（不是 BatchJ 误判的"主动重构"）**，但属于跨团队业务实施范畴，本批次不动，写入待办。admin/ai 全部为 V3 主动重构或主动新增。

## 文件清单与评估

### Dashboard 续（已无剩余文件）

Batch 6 已完成 `src/views/admin/dashboard/` 全部 11 个文件的评估（10 个 V2/V3 对 + 1 个 V3 新增 composable）。Batch 7 计划列出的"剩 2 dashboard 组件"实际不存在。

| 范围 | 结论 |
|------|------|
| `src/views/admin/dashboard/` | ✅ Batch 6 全部 11 个文件已评估，无剩余 |

### admin/ai（12 文件 - 全部 V3 主动实现）

| # | V3 文件 | V3 行数 | V2 对应 | 评估 | 备注 |
|---|---------|--------|---------|------|------|
| 1 | `agent/agentStyles.scss` | 225 | (无) | V3 新增 | Agent 管理 UI 样式 |
| 2 | `agent/components/AgentConfigForm.vue` | 393 | (无) | V3 新增 | Agent 配置表单 |
| 3 | `agent/components/AgentDebugDrawer.vue` | 264 | (无) | V3 新增 | Agent 调试抽屉 |
| 4 | `agent/components/AgentDiffDialog.vue` | 95 | (无) | V3 新增 | Agent 差异对比 |
| 5 | `agent/components/AgentListItem.vue` | 128 | (无) | V3 新增 | Agent 列表项 |
| 6 | `agent/index.vue` | 540 | (无) | V3 新增 | Agent 管理主页面 |
| 7 | `components/AiChatPanel.vue` | 465 | (无) | V3 新增 | AI 聊天面板 |
| 8 | `components/AiRoleConfig.vue` | 238 | (无) | V3 新增 | AI 角色配置 |
| 9 | `sparring/components/AiSparringChatPanel.vue` | 475 | `AiSparringChatPanel.vue` (507) | ✅ V3 重写 | script setup + 拆分组件 |
| 10 | `sparring/components/AiSparringFormDialog.vue` | 292 | `AiSparringFormDialog.vue` (251) | ✅ V3 重写 | script setup + 新 API |
| 11 | `sparring/components/SparringFilterBar.vue` | 66 | (无) | V3 新增 | V3 拆出独立筛选条组件 |
| 12 | `sparring/index.vue` | 528 | `sparring/index.vue` (321) + `mixins/sparring-mixin.js` (308) | ✅ V3 重写 | script setup + 吸收 mixin + Pinia |

**不动** —— 12 / 12（其中 8 个 V3 新增，4 个 V3 重写）。

> **V2 仅 4 个文件 vs V3 12 个文件**：V2 的 sparring 模块在 V3 中被**完整重写** + **扩展**（新增 agent 管理、AI 角色配置、调试抽屉等），属于 V3 的产品级主动扩展。

### web/ai 训练助手 - TrainingAssistantView.vue 🔴

| 文件 | V2 | V3 | 行差 | 评估 |
|------|----|----|------|------|
| `modes/training/TrainingAssistantView.vue` | 447 | 271 | -176 | ⚠️ 业务功能丢失 |

## 🔴 TrainingAssistantView.vue 详细分析

### V2 完整架构

V2 训练助手采用 **六层架构 + 多个 useCase**：

```
TrainingAssistantView.vue (Options API)
  ├─ trainingAdapter.js (REST Port)
  ├─ sessionFactory.js → createTrainingChatSession
  │   ├─ trainingSessionAdapter.js (Adapter)
  │   ├─ createChatSession.js (通用会话核心)
  │   └─ trainingContext.js (上下文聚合根)
  ├─ historyPanelMixin.js (历史面板交互)
  ├─ application/startTrainingUseCase.js (启动)
  │   └─ openingRemarkUseCase.js (开场白)
  └─ application/endTrainingUseCase.js (结束+评分)
      ├─ retryPendingScoreSave (重试)
      ├─ streamChatCompletion (流式生成)
      └─ SCORE_PROMPT (评分提示词)
```

### V3 简化架构

V3 训练助手仅**单层架构**：

```
TrainingAssistantView.vue (script setup)
  └─ useAiStore (Pinia)
      └─ TrainingAssistant.listRoles / getRecord / pageRecords (REST)
```

### 🔴 11 项核心业务能力丢失

| # | 丢失能力 | V2 实现 | V3 状态 | 业务影响 |
|---|---------|---------|---------|---------|
| 1 | **AI 开场白** | `runOpeningRemark` + `OPENING_USER_PROMPT` + `buildSystemPromptForRole` | ❌ 缺失（`handleStartTraining` 内硬编码字符串） | 用户点击"开始陪练"无 AI 自我介绍 |
| 2 | **训练评分流程** | `runEndTrainingWithScore` 流式生成评价 + 保存 | ❌ 缺失（`// TODO: 真实场景下会调 runEndTrainingWithScore 触发评分`） | 学员无法收到 AI 评分反馈 |
| 3 | **评分重试机制** | `retryPendingScoreSave` + `findPendingScoreMessageIndex` | ❌ 缺失 | 网络失败时评分丢失 |
| 4 | **训练上下文状态机** | `createTrainingContext` + `sessionEnded` + `endingTraining` | ⚠️ 部分简化（`trainingState.endingTraining` 有，但 `sessionEnded` 无） | 结束状态判断不准 |
| 5 | **发送消息守卫** | `beforeTrainingSendGuard(ctx)` 检查 endingTraining/sessionEnded/currentRole | ❌ 缺失 | 错误状态下可发送消息 |
| 6 | **从历史恢复角色** | `restoreTrainingRoleFromHistory(roleName, allowStart)` | ❌ 缺失 | 历史会话点开无对应角色 |
| 7 | **预设角色初始化（含历史）** | `initFromPresetRoleWithHistory` 完整流程 | ❌ 简化（仅 `setCurrentRole` + `newTrainingSession`） | 预设角色路径无历史恢复 |
| 8 | **从历史恢复（通用）** | `initFromHistory` + `getLastValidAskId` | ❌ 缺失 | 学员端刷新页面无自动恢复 |
| 9 | **新建会话状态机** | `startNewSession` 返回 `{ action: 'busy' | 'created' | 'noop', onReuse }` | ❌ 简化（无 busy 判定） | 重复点击可能创建空会话 |
| 10 | **DashScope 文件清理** | `chatPanel.resetDashScopeState()` 在新建会话时调用 | ❌ 缺失 | 文件状态可能泄漏 |
| 11 | **训练完成事件** | `onPlanComplete` 回调 → `$emit('training-complete')` | ❌ 缺失（`emit('training-complete')` 仍调用但前置评分未跑） | 训练计划节点无法自动完成 |

### V3 已"标记 TODO"的简化

```typescript
// V3 TrainingAssistantView.vue 第 194-195 行
async function handleStartTraining() {
  // ...
  // TODO: 真实场景下这里会调 runStartTraining 启动 AI 开场白
  if (messages.value.length === 0) {
    messages.value.push({
      role: 'ai',
      content: `您好,我是${currentRole.value.roleName},陪练开始。`  // 硬编码占位
    })
  }
}

// V3 TrainingAssistantView.vue 第 213-216 行
async function handleEndTraining() {
  // ...
  aiStore.endTraining()
  // TODO: 真实场景下会调 runEndTrainingWithScore 触发评分
  ElMessage.success('陪练已结束')
  emit('training-complete')
}
```

**V3 开发者明确意识到这些是"待完成"项**（不是迁移遗漏），但 BatchJ 报告（2026-08-07）的"主动重构，无需追赶"判断**不准确** —— 这些是真实的业务能力丢失。

### V3 store 也简化

`stores/modules/ai.ts` 中训练部分仅有：
- `loadTrainingRoles` / `newTrainingSession` / `setCurrentRole`
- `startTraining` (仅改 isStarted=true) / `endTraining` (仅改状态)
- `isTrainingEnded` (简化判定 `endingTraining || false`)
- `sendTraining` (复用 `sendAnswer`)
- 历史 CRUD 6 个方法

V3 store **完全没有**：评分流程、开场白调用、上下文状态机、发送守卫等业务实现。

### 评分提示词（SCORE_PROMPT）也丢失

V2 `trainingContext.js` 中的 SCORE_PROMPT 是一份精心设计的评分模板（5 个评分等级 + 输出格式要求），V3 完全缺失。

## 决策与建议

### 决策：TrainingAssistantView.vue **不动**（本批次）

**原因**：
1. **V3 当前是有意识的不完整状态**（带 TODO 标记），不是迁移遗漏
2. **完整迁移涉及后端 SSE 评分 API**（`/api/wk/training/role/student/stream` 仅答疑 + 陪练对话，无评分端点）+ **评分重试机制** + **训练上下文状态机**
3. **属于跨团队业务功能实施**（需后端 + AI 算法 + 前端协同），不是单纯的迁移任务
4. **现有 UI 框架完整**，学员可手动触发（虽然评分缺失）
5. **强行迁移会破坏 V3 的 Pinia 单层架构**，且与 V3 的整体简化方向冲突

### 行动项（建议后续 sprint）

| # | 任务 | 优先级 | 工作量 | 依赖 |
|---|------|--------|--------|------|
| 1 | 与后端确认训练评分 SSE 端点（`/api/wk/training/score/stream` 或类似） | 🔴 高 | 1d | 后端 |
| 2 | 在 `useAiStore` 中实现 `runTrainingScore(streamText)` 流式评分方法 | 🔴 高 | 2d | 后端端点 |
| 3 | 实现 `runTrainingOpeningRemark()` 触发 AI 开场白 | 🟡 中 | 1d | 后端 SSE |
| 4 | 恢复 `trainingContext` 状态机（sessionEnded + endingTraining） | 🟡 中 | 1d | 前端 |
| 5 | 实现历史角色恢复（`restoreTrainingRoleFromHistory`） | 🟡 中 | 1d | 前端 |
| 6 | 评估 V3 简化架构 vs V2 六层架构，决定是否回归分层 | 🟢 低 | 1d | 架构师 |

### 不要做的事

- ❌ 不要把 V2 的 `trainingAdapter.js`、`endTrainingUseCase.js` 等文件原样迁到 V3（破坏 V3 Pinia 架构）
- ❌ 不要在 TrainingAssistantView.vue 中直接调用 V2 风格的 `session.methods.xxx`（V3 已无 session 对象）
- ❌ 不要在缺少后端评分端点的情况下"假装实现"评分流程

## 验证

- **Typecheck**：`npm run typecheck` 通过（0 errors）
- **V3 admin/ai 全部为 Vue3 idioms**：100% `<script setup lang="ts">` + Composition API + Pinia
- **V3 admin/ai 中无 Vue2 残留**：0 处

## 结论

| 范围 | 文件数 | 结论 |
|------|--------|------|
| admin/dashboard 续 | 0 | 无剩余（Batch 6 已 11/11 完成） |
| admin/ai | 12 | ✅ 全部不动（V3 主动重构/新增） |
| web/ai TrainingAssistantView.vue | 1 | ⚠️ 业务功能丢失，记录到待办，本批次不动 |
| **合计** | **13** | **不动 13 / 待办 1** |

## 下一步

进入 Batch 8（web/course 6 个文件）。