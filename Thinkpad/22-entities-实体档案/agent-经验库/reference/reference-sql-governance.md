---
name: reference-sql-governance
description: SQL 资产治理规范：头部 8 字段 + 强制结构 4 条 + AI 自审机制
metadata:
  node_type: memory
  type: reference
  originSessionId: 3ca93861-d87c-4f90-aebe-8bf39b35363c
migrated_from: auto-memory-2026-09-07
migrated_path: C:\Users\RUHAI\.claude\projects\E--rhProject\memory\reference-sql-governance.md
---

# SQL 治理规范速查

## 位置
- 根目录：`.products/projects/wk-train-center-service/db/`
- 规范文件：`GOVERNANCE.md` + `HEADER-TEMPLATE.sql`
- 当前活跃版本：`mobile-1.1/`

## 头部 8 字段（必填）
```sql
-- ============================================================
-- 版本: 1.5
-- 模块: ai
-- 用途: 给答疑记录表增加 xxx 字段
-- 影响表: el_xxx
-- 创建日期: 2026-07-17
-- 作者: claude
-- 审核人: claude:opus-4.8
-- 审核日期: 2026-07-17
-- ============================================================
```

## 强制结构 4 条
1. 所有 DDL 必须用 `wk_train_center`.`table_name` 限定
2. 按表分块：`-- ============== 表名 ==============`
3. 块首注明操作类型：`-- ALTER: ADD COLUMN`
4. 头部"影响表"= 正文去重表名

## 流程
1. 按规范写 SQL → 放入 `db/1.5/<模块>/xxx.sql`
2. 更新 `db/1.5/README.md` 索引
3. 写经验到 `Thinkpad/`

**关联**：
- [reference-sql-governance](./reference-sql-governance.md)
- [feedback-sql-governance-checklist](../feedback/feedback-sql-governance-checklist.md)