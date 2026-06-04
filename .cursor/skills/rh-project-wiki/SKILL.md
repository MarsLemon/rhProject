---
name: rh-project-wiki
description: >-
  Consults rhProject monorepo knowledge (Cursor wiki index, Qoder RepoWiki,
  documents/, .qoder/rules). Use when implementing or reviewing business
  features, APIs, architecture, training/course/exam/plan modules, or when the
  user mentions wiki, repowiki, 知识库, or project conventions.
---

# rhProject 项目知识库（Cursor 侧）

## 目标

在改代码前，通过**已有 Markdown** 对齐业务与规范，避免只凭记忆改代码。与 Qoder IDE 生成内容互补。

## 查阅顺序（强制）

1. **入口索引**：`.cursor/wiki/INDEX.md`（人工维护，速查）
2. **全量目录**（若存在）：`.cursor/wiki/GENERATED-INDEX.md`（`node scripts/sync-cursor-wiki-index.mjs` 生成）
3. **总览文档**：`wk-train-center-service/documents/1.2/2026-04.09-【qoder】项目知识库.md`
4. **Qoder RepoWiki**（按需选子项目）：
   - 后端：`wk-train-center-service/.qoder/repowiki/zh/content/`
   - 前端 Vue2：`wk-train-center-ui/.qoder/repowiki/zh/content/`
5. **编码规范**：对应子项目的 `.qoder/rules/`（实现前必读相关条目）
6. **版本/需求文档**：`wk-train-center-service/documents/`、`wk-train-center-ui/documents/`
7. **源码**：文档与代码冲突时以**当前分支源码**为准，并注明差异

## 按任务选读

| 任务类型 | 优先阅读 |
|----------|----------|
| 后端 Java / DDD | service 的 repowiki `开发指南/`、`核心模块/` + `rules/01-04` |
| 前端 Vue2 | ui 的 repowiki `架构设计/`、`核心模块/` + `rules/01-08` |
| 前端 Vue3 迁移 | `wk-train-center-ui-v3/.cursor/skills/*` + ui repowiki + `vue2-parity-migration` rule |
| 学员端页面 | `业务功能/前端-学员端页面架构.md`（service repowiki） |
| API 契约 | 两端 `03-API规范.md` + repowiki `API接口文档/` |
| DB / 迁移 | repowiki `Database Migration/` + `rules/04-数据库规范.md` |

业务域与路径对照见 [reference.md](./reference.md)。

## 检索策略

1. 在 `INDEX.md` / `GENERATED-INDEX.md` 用关键词定位路径
2. 在 repowiki 目录 `Grep` 中文关键词或英文模块名（如 `training-plan`、`StatCourse`）
3. 只深入读 1–3 篇，避免一次性加载过多

## 输出要求

- 引用文档时写**仓库相对路径**
- 发现 wiki 与源码不一致时列出差异
- 实现方案需引用 3–5 条相关文档结论，再动手改代码

## 索引维护（用户 / Agent）

Qoder 刷新 RepoWiki 后在仓库根目录执行：

```bash
npm run sync:wiki
# 或
node scripts/sync-cursor-wiki-index.mjs
```

**Windows 定时**：见 [`.cursor/scheduled-tasks/README.md`](../../scheduled-tasks/README.md)。

## 全局 Skill（monorepo 根 `.cursor/skills/`）

- `ai-tool-orchestration`：Cursor / Claude / Qoder 职责路由与交接模板（Rule 常驱：`ai-tool-orchestration.mdc`）
- `chinese-encoding-guard`：中文 UTF-8 编码 ROS（Rule + Operations + Skill），含 `verify:chinese` 与修复阶梯
- `rh-project-wiki`：本 Skill，项目知识库查阅顺序
- `skill-deep-dive`（`~/.cursor/skills/`）：单模块深读 + HTML/Markdown 深读文档；**先**用本 Skill 查 INDEX/Repowiki，**再**对某一域做 deep dive（如「培训计划模块 deep dive」）

## 子项目专用 Skill（按需使用）

- `wk-train-center-ui-v3`：`api-development`、`vue2-to-vue3-component-migration`、`page-adaptation` 等
- 后端 Qoder skills 说明：`wk-train-center-service/.qoder/skills/2026-04.09-【qoder】技能配置说明.md`（在 Qoder 中调用；Cursor 侧仅参考）
