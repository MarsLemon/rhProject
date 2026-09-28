# wk-train-center-service 数据库脚本

> **源真相**: `.products/projects/wk-train-center-service/db/`(本目录是副本)
> **同步时间**: 2026-09-17

## 状态总览

| 版本     | dev     | stage   | pro     |
| ------ | ------- | ------- | ------- |
| 1.1    | 已执行     | 已执行     | 已执行     |
| 1.2    | 已执行     | 已执行     | 已执行     |
| 1.3    | 已执行     | 已执行     | 已执行     |
| 1.4    | 已执行     | 已执行     | 已执行     |
| 1.5    | 已执行     | 已执行     | 已执行     |


> **主公 2026-09-28 确认**:1.5 DDL 已全环境执行(系统级 500 风险已解除)
> 详情见 `.products/projects/wk-train-center/docs/decisions/2026-09-27-business-logic-bugs.md`

每个文件顶部都有 STATUS 头:

```
-- STATUS:
--   dev: 已执行 @ YYYY-MM-DD
--   stage: 已执行 @ YYYY-MM-DD
--   pro: 已执行 @ YYYY-MM-DD
```

## 1.5 已执行清单

- [plan/ddl.sql](../../1.5/db/plan/ddl.sql) — `el_plan_user.deadline` / `extend_deadline_count` / `extend_makeup_count` + `el_paper.is_makeup` + `el_exam_record.plan_id/is_makeup/chance_override`
- [plan/dml.sql](../../1.5/db/plan/dml.sql) — 去重 `el_plan_user_node`
- [plan/fix-plan-user-node-duplicate.sql](../../1.5/db/plan/fix-plan-user-node-duplicate.sql) — `el_plan_user_node` 加唯一索引 `uk_plan_user_node`
- [log/ddl.sql](../../1.5/db/log/ddl.sql) — 操作日志表结构

执行步骤(脚本内有注释):

1. 备份表:`CREATE TABLE el_plan_user_node_bak_v1_5_2 AS SELECT * FROM el_plan_user_node;`
2. 跑 SQL 文件(脚本内含 dedup + ALTER TABLE ADD UNIQUE KEY,顺序正确)

## 同步约定

- 新增/修改 SQL:`.products/.../db/<v>/<module>/<name>.sql` 与本目录两边同步
- 执行后:更新对应文件的 STATUS 头 + 本 README 状态总览
