# rhProject 与 Cursor 项目 Wiki 入口

供 Cursor Agent 使用，与 Qoder RepoWiki 互补；详细流程见 `.cursor/skills/rh-project-wiki/SKILL.md`。

## 仓库视图

| 目录 | 说明 |
|------|------|
| `wk-train-center-service` | Java 后端（Spring Boot、DDD） |
| `wk-train-center-ui` | Vue2 管理端 + 学员端 |
| `wk-train-center-ui-v3` | Vue3 迁移工程 |
| `wk-mhc-ui` | 门户前端（奖补） |

## 特定任务优先打开

| 文档 | 用途 |
|------|------|
| [项目知识库（总览）](../wk-train-center-service/documents/1.2/2026-04.09-【qoder】项目知识库.md) | 架构、模块、API 索引 |
| [后端规范总览](../wk-train-center-service/.qoder/rules/00-规则总览.md) | 响应码、前后端规范等 |
| [学员端页面架构](../wk-train-center-service/.qoder/repowiki/zh/content/业务功能/前端-学员端页面架构.md) | 路由与页面（前后端对齐） |
| [后端项目规范框架](../wk-train-center-service/.qoder/repowiki/zh/content/开发指南/后端项目规范框架.md) | 分层与工程约定 |
| [学员端 API](../wk-train-center-ui/.qoder/repowiki/zh/content/API接口文档/学员端API.md) | 学员端接口清单 |

## 业务域速查

| 域 | 后端 Repowiki | 前端 Repowiki |
|----|---------------|---------------|
| 课程 | `业务功能/课程管理/` | `核心模块/课程管理系统/` |
| 考试 | `业务功能/考试管理/` | `核心模块/在线考试系统/` |
| 培训计划 | `业务功能/培训计划/` | `核心模块/培训计划管理/` |
| 积分 | `业务功能/系统管理/积分管理.md` | `API接口文档/系统管理接口/` |
| 系统/权限 | `业务功能/系统管理/` | `核心模块/系统管理模块/` |
| 统计 | `业务功能/统计分析/` | `Admin Course Statistics.md` 等 |
| AI | `核心模块/wk-modules 业务线定制模块/AI答疑模块/` | `核心模块/AI智能助手系统/` |
| DB 迁移 | `Database Migration/` | — |

更全的关键词表见 `.cursor/skills/rh-project-wiki/reference.md`。

## 全量文件列表

（运行后查看；Qoder 刷新 wiki 后执行：）

```bash
npm run sync:wiki
# 或双击 rhProject 根目录 sync-wiki.cmd
```

输出：`.cursor/wiki/GENERATED-INDEX.md`

**定时任务（Windows）**：见 [`.cursor/scheduled-tasks/README.md`](../scheduled-tasks/README.md)（Wiki 每天 · Skill 每周日 · 编码扫描每周一 · 日志清理每月）。

## 版本化需求文档

- 后端：`wk-train-center-service/documents/`（按版本分子目录）
- 前端：`wk-train-center-ui/documents/`
- Vue3 迁移：`wk-train-center-ui-v3/docs/`、`PLAN.md`

## 与 Qoder 的分工

| 场景 | 工具 |
|------|------|
| 生成/刷新 RepoWiki | Qoder IDE |
| 同步 Cursor 全量目录 | `npm run sync:wiki` · 计划任务见 [scheduled-tasks](../scheduled-tasks/README.md) |
| Skill 审计 | `npm run audit:skills` · 计划任务见 [scheduled-tasks](../scheduled-tasks/README.md) |
| 改代码、跑 build/verify | Cursor |
| 方案/评审/deep-dive | Claude（交接块见 [COLLABORATION.md](./COLLABORATION.md)） |
| 三工具职责路由 | [COLLABORATION.md](./COLLABORATION.md) · Rule `ai-tool-orchestration.mdc` · Skill `ai-tool-orchestration` |
| 中文 UTF-8 编码 ROS | [scripts/chinese-encoding/README.md](../../scripts/chinese-encoding/README.md) · [SKILL](../skills/chinese-encoding-guard/SKILL.md) · `npm run verify:chinese` |
