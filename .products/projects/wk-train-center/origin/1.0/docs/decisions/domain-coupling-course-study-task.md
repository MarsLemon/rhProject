---
name: domain-coupling-course-study-task
description: 课程 / 学习任务 / 培训计划 三方硬耦合点速查，改任一域前必读
metadata:
  node_type: memory
  type: project
  originSessionId: bc7cc3e6-cb7f-4754-9b22-b31d52b9535c
migrated_from: auto-memory-2026-09-07
migrated_path: C:\Users\RUHAI\.claude\projects\E--rhProject\memory\domain-coupling-course-study-task.md
---

# 课程 / 学习任务 / 培训计划 耦合点

## 业务流（已核对 repowiki 与代码）

```
培训计划 (TrainingPlan)
  └─ 节点 (Node) 生成 → 学习任务（绑定到员工）
       └─ 课程挂载点：TrainingPlanCourseRelation
            └─ 学习进度跟踪 (el_training_record)
                 └─ 完成条件触发 → 节点状态机推进
```

## 三张关键表（都在 `wk_train_center` 库）

| 表名 | 实体类 | 所在模块 | 关键字段 |
|---|---|---|---|
| `el_training_plans` | `TrainingPlan` | `yf-module-training-plan` | `id`, `state` |
| `el_training_plan_courses` | `TrainingCourse` | `yf-module-training-plan` | `id`, `training_plan_id`, `course_id` |
| `tp_training_plan_course_relations` | `TrainingPlanCourseRelation` | `yf-module-training-plan` | `id`, `training_plan_id`, `training_course_id` |
| `el_training_record` | （学习任务实例） | 课程模块 + AI 模块共用 | `id`, `plan_id` (v1.2 新增), `node_ref_id` (v1.2 新增) |

## 实际跨模块 import 方向

- ✅ `yf-module-training-plan` → `yf-module-course`（单向）
- ✅ `wk-module-ai` → `el_training_record`（学习任务陪练历史）
- ❌ `yf-module-course` 没有反向 import training-plan

→ 修改培训计划时**不需要**改课程模块；修改课程模块时**必须**查培训计划。

## 改这 5 类字段前必须停下检查

| 改动类型 | 必查域 | 检查方式 |
|---|---|---|
| 课程时长/类型枚举 | 学习任务节点完成条件 | 读 `wk-train-center-service/.qoder/repowiki/zh/content/业务功能/学习任务课件时长差异化配置技术方案.md` |
| 课程下架/删除 | 培训计划节点 + 学习任务 | 跑 SQL 查 `tp_training_plan_course_relations` 是否有引用 |
| 培训计划节点类型新增 | 学习任务 + 课程 + AI 陪练 | v1.3 陪练节点扩展是真实案例（见 repowiki） |
| `el_training_record` 字段 | AI 答疑 + 培训计划 | v1.2 加 `plan_id`/`node_ref_id` 是真实案例 |
| 前端 3 端（Vue2/Vue3/学员）API 变更 | `wk-train-center-ui` + `wk-train-center-ui-v3` + 学员端 H5 | 读 `.cursor/wiki/INDEX.md` 业务域速查表 |

## 历史踩坑（来自 repowiki 真实事件）

- **v1.3 陪练节点扩展**：节点类型枚举改了，但下游学习任务节点类型没同步，回归 1 次
- **v1.2 学习任务关联字段**：给 `el_training_record` 加 `plan_id`/`node_ref_id` 后，AI 答疑模块需要适配
- **学习任务课件时长差异化**：方案散落在 3 篇 wiki，必须同时读

## 检查命令（复制就能跑）

```bash
# 1. 查培训计划模块所有 import 课程的类
grep -rn "import com.yf.course" wk-train-center-service/yf-modules/yf-module-training-plan/src

# 2. 查课程模块对培训计划的所有引用（应该是 0）
grep -rn "trainingplan" wk-train-center-service/yf-modules/yf-module-course/src

# 3. 查 el_training_record 表的字段演进
ls wk-train-center-service/sql/1.2/training-plan/
ls wk-train-center-service/sql/1.3/
```

## 相关

- [domain-overview](./domain-overview.md) — 五大域总览
- [workflow-cross-module-check](../../../../Thinkpad/22-entities-实体档案/agent-经验库/workflow/workflow-cross-module-check.md) — 改动检查流程