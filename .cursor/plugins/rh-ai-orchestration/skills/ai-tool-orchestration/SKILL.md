---
name: ai-tool-orchestration
description: >-
  Routes work across Cursor (primary coding), Claude (auxiliary analysis/review),
  and Qoder (RepoWiki/rules). Use for Cursor+Claude+Qoder collaboration, tool 分工,
  handoff, or wiki sync in rhProject monorepo.
---

# AI 三工具协同编排（插件镜像）

canonical 源文件：`rhProject/.cursor/skills/ai-tool-orchestration/SKILL.md`

在 **rhProject 仓库内**以项目 Skill 为准；本插件仅便于安装到 `~/.cursor/plugins/local/` 时在其它会话引用同一路由说明。

## 快速路由

| 任务 | 工具 |
|------|------|
| 改代码 / build / verify | Cursor |
| 方案 / 评审 / deep-dive | Claude → 交接口给 Cursor |
| 刷新 Repowiki | Qoder → `npm run sync:wiki` |
| 查业务知识 | INDEX + rh-project-wiki |

交接模板与详情：从 rhProject 打开 `.cursor/skills/ai-tool-orchestration/reference.md` 与 `.cursor/wiki/COLLABORATION.md`。
