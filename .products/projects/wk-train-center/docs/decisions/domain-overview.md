---
name: domain-overview
description: rhProject 五大业务域边界、模块归属、典型数据流
metadata:
  node_type: memory
  type: project
  originSessionId: bc7cc3e6-cb7f-4754-9b22-b31d52b9535c
migrated_from: auto-memory-2026-09-07
migrated_path: C:\Users\RUHAI\.claude\projects\E--rhProject\memory\domain-overview.md
---

# 业务域总览

## 五大域

| 域 | 后端模块 | 前端（Vue2） | 前端（Vue3） | 移动端 H5 |
|---|---|---|---|---|
| **培训计划** | `yf-module-training-plan` + `yf-module-plan` | `views/admin/training-plan/` | v3 迁移中 | 我的计划 |
| **学习任务** | 课程模块 + AI 模块（`el_training_record`） | `views/admin/course/` 学习进度相关 | v3 迁移中 | 我的学习 |
| **课程** | `yf-module-course` + `wk-module-course` | `views/admin/course/` | v3 迁移中 | 课程详情 |
| **考试** | `yf-module-exam` | `views/admin/exam/` | v3 迁移中 | 移动考试 |
| **AI 答疑** | `wk-module-ai` | （嵌入课程页） | v3 迁移中 | AI 助手 |

## 数据流主链

```
年度计划收集 (Collection)
  └─→ 培训计划 (Plan)
        └─→ 节点 (Node) → 学习任务 (Task)
              └─→ 课程 (Course) + 课件 (CourseFile)
                    └─→ 学习记录 (el_training_record)
                          └─→ AI 答疑 / 统计 / 完成判定
```

## 关键约束

- **业务域优先级**：改考试/课程不动培训计划；改培训计划必看学习任务
- **前后端同步**：API 变 → Vue2 + Vue3 + H5 三端必须同步（见 `cross-module-coupling` 笔记）
- **DDD 分层**：Controller → Application → Service → Domain ← Repository（详见 `CLAUDE.md`）

## 相关

- [domain-coupling-course-study-task](./domain-coupling-course-study-task.md)
- [workflow-cross-module-check](../../../../Thinkpad/22-entities-实体档案/agent-经验库/workflow/workflow-cross-module-check.md)