# SQL mobile1.1 索引

> 版本: mobile1.1
> 创建时间范围:
> 本 README 由脚本生成

## 文件清单

| 文件 | 模块 | 用途 | 影响表 | 创建日期 | 作者 | 审核人 | 状态 |
|---|---|---|---|---|---|---|---|
| fix-double-role-data-scope-snapshot.sql | — | 未填写 | — | — | 小马(Plan + 路由) → backend-expert 实施 | — | ⚠️ 未审核 |
| plan_node_check_rules.sql | — | 未填写 | — | — | — | — | ⚠️ 未审核 |
| ai/alter_answer_record_add_suggestions.sql | ai | 给答疑记录表增加 suggestions 字段存储结构化学习建议 | el_answer_record | 2026-07-17 | claude | claude:opus-4.8 | ✅ 已审核 |
| ai/diag_fill_answer_joined.sql | ai | 诊断填空题导入脏数据(content 用逗号 join 多答案) | el_qu_answer, el_qu | 2026-07-17 | claude | claude:opus-4.8 | ✅ 已审核 |
| ai/fix_fill_01_create_bak_table.sql | ai | 填空题 join 脏数据修复-备份表(Yearning DDL 工单) | el_qu_answer_fillbak_20260717 | 2026-07-17 | claude | claude:opus-4.8 | ✅ 已审核 |
| ai/fix_fill_02_dryrun_diag.sql | ai | 填空题 join 脏数据修复-干跑诊断(Yearning DML 工单,只读) | el_qu_answer, el_qu | 2026-07-17 | claude | claude:opus-4.8 | ✅ 已审核 |
| ai/fix_fill_03_fix.sql | ai | 填空题 join 脏数据修复-拆串写入+删原行(Yearning DML 工单) | el_qu_answer, el_qu_answer_fillbak_20260717 | 2026-07-17 | claude | claude:opus-4.8 | ✅ 已审核 |

## 子模块

### plan

- `plan_node_check_rules.sql` — 未填写

### sys

- `fix-double-role-data-scope-snapshot.sql` — 未填写

### ai

- `alter_answer_record_add_suggestions.sql` — 给答疑记录表增加 suggestions 字段存储结构化学习建议
- `diag_fill_answer_joined.sql` — 诊断填空题导入脏数据(content 用逗号 join 多答案),仅 SELECT 不写
- `fix_fill_01_create_bak_table.sql` — 填空题 join 脏数据修复-备份表(Yearning DDL 工单,先提交)
- `fix_fill_02_dryrun_diag.sql` — 填空题 join 脏数据修复-干跑诊断(Yearning DML 只读,看命中数)
- `fix_fill_03_fix.sql` — 填空题 join 脏数据修复-拆串写入+删原行(Yearning DML 工单,前两步 OK 后提交)


## ⚠️ 待处理

- `plan_node_check_rules.sql` — 未审核
- `fix-double-role-data-scope-snapshot.sql` — 未审核

