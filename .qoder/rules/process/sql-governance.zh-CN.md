---
trigger: always_on
alwaysApply: true
---

# SQL 资产治理规范 (Qoder 桥接)
# ============================================
# AI 辅助开发的 SQL 资产规范
# 完整规范见主文件：.products/projects/wk-train-center-service/db/GOVERNANCE.md
# 本文件仅作 Qoder 快速引用，详细规则请查阅主规范
#
# 依赖规范：AGENTS.md
# 最后更新：2026-08-04
# ============================================

## [规则 1] SQL 资产位置 [ENABLED]

STATUS: ENABLED
PRIORITY: HIGH

SQL 资产位于 `.products/projects/wk-train-center-service/db/`，**不在后端代码仓内**。

**版本目录动态识别**：

1. **获取子项目分支**：进入后端子项目目录（如 `wk-train-center-service`），执行 `git branch --show-current` 获取分支名
2. **提取版本号**：从分支名中提取版本号，规则如下：
   - 分支名一般为数字格式（如 `1.5.1`、`2.0.0`、`mobile-1.1`）
   - 排除前缀词：`local/`、`train/`、`dev/`、`test/`、`feature/`、`hotfix/`
   - 示例：
     - `1.5.1` → `1.5.1`
     - `local/1.5.1` → `1.5.1`
     - `dev/2.0.0` → `2.0.0`
     - `mobile-1.1` → `mobile-1.1`
3. **确认版本目录**：
   - **能确认**：提取的版本号在 `db/` 目录下存在对应子目录 → 直接使用
   - **需确认**：出现以下情况时询问用户：
     - 提取的版本号在 `db/` 目录下不存在
     - 分支名无法提取出有效版本号
     - 存在多个相似版本（如 `1.5.0` 和 `1.5.1`）

## [规则 2] 头部 8 字段 [ENABLED]

STATUS: ENABLED
PRIORITY: HIGH

新建/修改 SQL 必须含 8 字段头部（顺序固定）：
1. 版本  2. 模块  3. 用途  4. 影响表  5. 创建日期  6. 作者  7. 审核人  8. 审核日期
模板：`.products/projects/wk-train-center-service/db/HEADER-TEMPLATE.sql`

## [规则 3] 强制结构 4 条 [ENABLED]

STATUS: ENABLED
PRIORITY: HIGH

1. DDL 必须用 `wk_train_center`.`table_name` 库名限定
2. 按表分块：`-- ============== 表名 ==============`
3. 块首注明操作类型：`-- ALTER: ADD COLUMN` / `-- UPDATE: 数据回填`
4. 头部"影响表" = 正文去重表名

## [规则 4] AI 自审 [ENABLED]

STATUS: ENABLED
PRIORITY: HIGH

生成新 SQL 后自动调用 skill：规范化SQL头部与结构生成技能。
通过后填头部"审核人"为 `qoder:<model>`，"审核日期"为当天。
**不审 SQL 语义**（DROP 安全、UPDATE 带 WHERE）—— DBA 职责。

## [规则 5] DDL/DML 严格分离 [ENABLED]

STATUS: ENABLED
PRIORITY: CRITICAL

**所有 SQL 必须严格区分 DDL（数据定义语言）和 DML（数据操作语言）**，以便通过 Yearning 平台审核。

- DDL 文件：`ddl-{功能描述}.sql`（如 `ddl-extend-makeup.sql`）
- DML 文件：`dml-{功能描述}.sql`（如 `dml-extend-makeup.sql`）
- 禁止混合 DDL 和 DML 在同一文件
- 禁止使用泛化名称（如 `ddl.sql`、`dml.sql`）

## [规则 6] Yearning 审核验证 [ENABLED]

STATUS: ENABLED
PRIORITY: CRITICAL

**所有 SQL 必须经过 Yearning 审核验证后才能执行**。

Yearning 审核要点：
- DDL 和 DML 必须分离提交
- 表名必须全限定：`` `wk_train_center`.`表名` ``
- DML 语句必须有明确的 WHERE 条件，避免全表更新/删除
- 禁止使用 `SELECT *`（DML 中）

## [规则 7] 分支隔离与功能分割 [ENABLED]

STATUS: ENABLED
PRIORITY: CRITICAL

**不同功能分支的 SQL 必须分开存放，按版本号 + 功能模块分子目录**。

- 存放位置：`.products/projects/wk-train-center-service/db/{版本号}/{功能模块}/`
- 功能模块目录名：与后端模块名一致（如 `plan/`、`exam/`、`course/`）
- 每个功能模块的 DDL 和 DML 分别独立文件
- 示例：`db/1.5.1/plan/ddl-extend-makeup.sql` + `db/1.5.1/plan/dml-extend-makeup.sql`

**写前检查（强制）**：
1. 创建 SQL 前，先检查目标目录是否已有同名或相关文件
2. 如已有文件，**修改已有文件**而不是创建新文件
3. 参考已有文件的格式和风格，保持一致性

## [规则 8] DDL 写法 [ENABLED]

STATUS: ENABLED
PRIORITY: HIGH

DDL 语句使用**直接 ALTER TABLE** 写法，与项目现有风格保持一致：
- 直接写 `ALTER TABLE ... ADD COLUMN ...`
- 不需要幂等化条件判断（由 Yearning 审核控制执行顺序）
- 新增字段必须是可选的（`DEFAULT NULL` 或 `DEFAULT 0`），不影响现有结构

## [规则 9] 历史 SQL 处理 [ENABLED]

STATUS: ENABLED
PRIORITY: HIGH

历史 SQL 缺字段不强求补全。在文件顶部加：
`-- TODO(legacy): 补全 8 字段头部 + 审核记录`
不删除现有 legacy 头部。

## [规则 10] MyBatis XML 查询字段一致性 [ENABLED]

STATUS: ENABLED
PRIORITY: CRITICAL

**实体类字段变更后，必须同步检查 MyBatis XML 查询语句**。

**强制检查清单**：
1. 实体类添加字段 → 检查所有引用该表的 XML 查询
2. `SELECT 表.*` 与显式选择同一列**禁止同时存在**
3. 多表 JOIN 时，确保不同表的列名不冲突（使用别名）
4. ResultMap 映射与 SELECT 列保持一致

**错误示例**：
```xml
<!-- ❌ 错误：pu.* 已包含 deadline，又显式选择 -->
SELECT pu.*, pu.deadline, pu.extend_deadline_count FROM el_plan_user pu

<!-- ✅ 正确：使用 pu.* 即可 -->
SELECT pu.* FROM el_plan_user pu
```

**修改后验证**：
- 检查 XML 中是否有 `表.*` 与显式列重复
- 检查多表 JOIN 是否有同名列冲突
- 检查 ResultMap 映射是否完整

WHY: 统一规范让所有 AI 工具（Qoder/Claude/Copilot/Cursor）都能识别 SQL 资产，自动生成合规 SQL。
