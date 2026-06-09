# 2026-06-08 code-review 汇总

本目录由 `/code-review` 跑出的 14 条结论拆分而来，按"本次改动必修" vs "技术债"分类。

## 本次改动必修（6 条，根目录）

| 严重度 | 文件 | 标题 | 状态 |
|---|---|---|---|
| 🟥 | `fix-plans/20260608-code-review-exam-mapper-list-resultmap.md` | Exam 反向引用 SQL resultMap 缺列 | [ ] 待修复 |
| 🟥 | `fix-plans/20260608-code-review-notify-scope3-deadcode.md` | 培训计划通知 scope=3 对非 PERSON 计划是死代码 | [x] 已修复 |
| 🟥 | `fix-plans/20260608-code-review-ai-file-list-typeerror.md` | AI 文本回复 syncToBackend 抛 TypeError | [ ] 待修复 |
| 🟧 | `fix-plans/20260608-code-review-plan-dialog-stale-userids.md` | PlanNotifyDialog 切 plan 后残留 userIds | [x] 已修复 |
| 🟧 | `fix-plans/20260608-code-review-notify-scope3-dup-userids.md` | 培训计划通知 scope=3 不去重 userIds | [x] 已修复 |
| 🟨 | `fix-plans/20260608-code-review-plan-dialog-loading-hint.md` | PlanNotifyDialog 加载中文案重叠 | [x] 已修复 |

## 任务中指定学员（scope=3）相关 — 本次处理 5 条

| # | 标题 | 文件 | 状态 |
|---|---|---|---|
| 1 | scope=3 对非 PERSON 计划是死代码 | `20260608-code-review-notify-scope3-deadcode.md` | [x] |
| 2 | scope=3 不去重 userIds | `20260608-code-review-notify-scope3-dup-userids.md` | [x] |
| 3 | PlanNotifyDialog 切 plan 残留 userIds | `20260608-code-review-plan-dialog-stale-userids.md` | [x] |
| 4 | PlanNotifyDialog 加载中文案重叠 | `20260608-code-review-plan-dialog-loading-hint.md` | [x] |
| 6 | PlanServiceImpl.listNotifyUsers 违反 BeanMapper 约定 | `tech-debt/20260608-code-review-tech-debt.md` 第 1 条 | [x] |

> **跳过 #5**：PlanController.notifyUsers 拆独立权限需要 Shiro 端配置 + 角色矩阵同步改，影响面更大，建议下次单独开 PR。

## 技术债（8 条，tech-debt/ 子目录）

详见 `fix-plans/tech-debt/20260608-code-review-tech-debt.md`，包括：

- ~~PlanServiceImpl.listNotifyUsers 手写 setter 映射（违反 BeanMapper 约定）~~ **[x] 已修**
- 3 个反向引用 mapper 缺统一的 blank-check 约定
- PlanController.notifyUsers 权限粒度过粗（PII 暴露面）
- PlanPreCheckMapper XML 缺 `(ref_id, node_type)` 联合索引
- api/ai/common.js extractAppTextFromChunk 过度复杂
- api/ai/common.js streamDebug 调试代码长期在线
- chatSession.js onDone 重复设置 fileList（死代码）
- AiMessageList handlePreviewAiFile 事件链依赖父组件监听

## 仍待处理（2 条，本次未修）

- 🟥 Exam 反向引用 SQL resultMap 缺列（`/api/exam/tmpl/referenced-exams` 必坏）
- 🟥 AI 文本回复 syncToBackend TypeError（普通 AI 回复都会崩持久化）

## Reviewer

code-review v1 (max effort)
