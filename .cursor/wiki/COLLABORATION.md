# Cursor × Claude × Qoder 协作说明

rhProject 三工具固定分工与同步流程。Cursor Agent 详见 Rule：`.cursor/rules/ai-tool-orchestration.mdc`。

## 分工

| 工具 | 角色 |
|------|------|
| **Cursor** | 主开发：改代码、迁移、验证、Git、PR |
| **Claude** | 辅助：拆需求、方案评审、产出 deep-dive 文档 |
| **Qoder** | 知识库：生成 RepoWiki、`.qoder/rules` |

## 同步 ritual

1. Qoder 刷新 Repowiki → 提交 Git
2. rhProject 根目录：`npm run sync:wiki`（或由 Windows 计划任务自动执行）
3. 含中文元数据变更后：`npm run verify:chinese`

## 权威顺序

**源码（当前分支）** > `.qoder/rules` > Repowiki > `documents/` > AI 推断

## 交接模板

见 `.cursor/skills/ai-tool-orchestration/reference.md`。

## 相关入口

| 类型 | 路径 |
|------|------|
| Rule（常驱） | `.cursor/rules/ai-tool-orchestration.mdc` |
| Skill | `.cursor/skills/ai-tool-orchestration/SKILL.md` |
| Wiki 导航 | `.cursor/skills/rh-project-wiki/SKILL.md` |
| 编码 ROS | `.cursor/skills/chinese-encoding-guard/SKILL.md` |
| Hook | `.cursor/hooks/session-tool-context.mjs` |
| Plugin | `.cursor/plugins/rh-ai-orchestration/` |
| **Windows 定时任务** | [`.cursor/scheduled-tasks/README.md`](../scheduled-tasks/README.md) |
