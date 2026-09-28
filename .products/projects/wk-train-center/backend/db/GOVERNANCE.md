# SQL 资产治理规范

> 完整规范，所有 AI 工具和开发者必读。
> 配套文件：[HEADER-TEMPLATE.sql](HEADER-TEMPLATE.sql) · [README.md](README.md) · [lint-report.md](lint-report.md)
> 主规范在 AGENTS.md 中有快速参考段：`wk-train-center-service/AGENTS.md`

---

## §1 适用范围

本规范约束 `wk-train-center-service` 项目的所有 SQL 资产，位于 `.products/projects/wk-train-center-service/db/` 目录下。

| 版本目录 | 模块目录 | 状态 |
|---|---|---|
| `1.1/` | `kg/`, `train-ai/`, 根目录 | 历史 |
| `1.2/` | `course/`, `course_qa/`, `depart/`, `lecturer/`, `sys/`, `training-plan/` | 历史 |
| `1.3/` | 根目录 | 历史 |
| `1.4/` | 根目录 | 历史 |
| `1.5/` | `plan/`, `sys/`, `train-sign-in/` | 当前活跃 |
| `mobile1.1/` | `plan/`, `sys/` | 移动端 |

---

## §2 头部 8 字段（必填）

每个 SQL 文件**第一段**必须是如下 8 字段头部（顺序固定、不可缺）：

```sql
-- ============================================================
-- 版本: 1.6
-- 模块: course
-- 用途: 给课程增加 category_id 字段
-- 影响表: el_course, el_course_file
-- 创建日期: 2026-07-14
-- 作者: zhangsan
-- 审核人: qoder:claude-sonnet-4.5
-- 审核日期: 2026-07-15
-- ============================================================
```

| # | 字段 | 必填 | 格式 | 备注 |
|---|---|---|---|---|
| 1 | 版本 | ✅ | 字符串 | 对应一级目录名（`1.1` / `1.2` / ... / `mobile1.1`） |
| 2 | 模块 | ✅ | 字符串 | 对应父目录名（`sys` / `depart` / `course` / `training-plan` / ...） |
| 3 | 用途 | ✅ | 一句话 | 不超过 80 字符，说明"做了什么"，不要"为什么" |
| 4 | 影响表 | ✅ | 逗号分隔 | 去重后的表名清单，**必须与正文去重一致** |
| 5 | 创建日期 | ✅ | YYYY-MM-DD | ISO 日期 |
| 6 | 作者 | ✅ | 标识 | github-handle 或姓名 |
| 7 | 审核人 | ✅ | `<ide>:<model>` | AI 工具标识（见 §4） |
| 8 | 审核日期 | ✅ | YYYY-MM-DD | AI 自审通过时间 |

---

## §3 SQL 正文强制结构（4 条铁律）

### 3.1 库名限定

所有 DDL 必须使用 `TABLE \`wk_train_center\`.\`table_name\`` 完整限定。

```sql
-- ✅ 正确
ALTER TABLE `wk_train_center`.`el_course` ADD COLUMN ...;

-- ❌ 错误
ALTER TABLE el_course ADD COLUMN ...;
```

### 3.2 按表分块

每张表前用 `-- ============== 表名 ==============` 划块。

```sql
-- ============== el_course ==============
-- ALTER: ADD COLUMN
ALTER TABLE `wk_train_center`.`el_course` ...;

-- ============== el_course_file ==============
-- ALTER: ADD COLUMN
ALTER TABLE `wk_train_center`.`el_course_file` ...;
```

### 3.3 块首操作类型

块首行必须注明操作类型，可选值：

| 类型 | 用途 |
|---|---|
| `-- ALTER: ADD COLUMN xxx` | 加字段 |
| `-- ALTER: ADD INDEX xxx` | 加索引 |
| `-- ALTER: MODIFY COLUMN xxx` | 改字段 |
| `-- CREATE: 新建表 xxx` | 建表 |
| `-- DROP: 删除 xxx` | 删除 |
| `-- UPDATE: 数据回填 / 数据修复` | 数据 DML |
| `-- INDEX: 创建索引` | 索引 |

### 3.4 影响表一致

头部"影响表" = 正文去重表名，**严格字符串相等**。

```sql
-- 头部写
-- 影响表: el_course, el_course_file

-- 正文必须严格只操作这两张表
-- 头部说 2 张，正文有 3 张 → 不合规
```

---

## §4 AI 自审机制

### 4.1 触发

AI 工具（Qoder / Claude / Copilot / Cursor）在生成新 SQL 时自动调用 skill：[规范化SQL头部与结构生成技能](#)。

### 4.2 自审内容（仅结构）

| 检查项 | 不通过处理 |
|---|---|
| 头部 8 字段齐全 | 自动补全，标 `TODO: 人工补字段` |
| 所有 DDL 使用库名限定 | 自动加 `wk_train_center.` 前缀 |
| 按表分块 | 自动插入分块 |
| 块首操作类型注释 | 自动加 `-- ALTER: ...` |
| 头部"影响表"=正文去重 | 自动从正文提取并回填头部 |

### 4.3 不审语义

AI **不审**以下内容（属于 DBA / 部署负责人职责）：

- DROP 是否安全
- UPDATE 是否带 WHERE
- 索引设计是否合理
- 字段类型选择是否合适

### 4.4 审核人字段格式

`<ide>:<model>`，**无空格、小写 ide、模型名保留原始大小写**：

| AI 工具 | 示例值 |
|---|---|
| Qoder | `qoder:claude-sonnet-4.5` / `qoder:gpt-4o` |
| Claude Code | `claude:opus-4` / `claude:sonnet-4.5` |
| GitHub Copilot | `copilot:gpt-4` / `copilot:claude-sonnet-4.5` |
| Cursor | `cursor:claude-3.5-sonnet` / `cursor:gpt-4o` |

---

## §5 历史 SQL 处理（legacy）

- 现有 ~30 个历史 SQL **不强求补全 8 字段**，避免大爆炸式 diff
- 缺字段的历史 SQL 在文件顶部插入一行：

```sql
-- TODO(legacy): 补全 8 字段头部 + 审核记录
```

- 索引导航中（`README.md`）会自动标 ⚠️
- 不删除现有 legacy 头部（即使不规范）

---

## §6 索引导航

- 总入口：`db/README.md`（由 `scripts/sql/build-index.py` 生成）
- 按版本：每个版本目录下有 `README.md`
- 校验报告：`db/lint-report.md`

### 6.1 重新生成索引

```bash
python scripts/sql/build-index.py
```

### 6.2 查看某版本 SQL 详情

```bash
cat db/1.5/README.md
```

---

## §7 跨智能体兼容

主规范在所有 AI 工具中通过 5 个文件协同生效：

| 入口文件 | 作用 |
|---|---|
| `wk-train-center-service/AGENTS.md` | 通用入口（Claude/Cursor/Copilot/Continue/Aider 识别） |
| `.qoder/rules/process/sql-governance.zh-CN.md` | Qoder IDE 桥接 |
| `.claude/skills/sql-governance/SKILL.md` | Claude Code 桥接 |
| `.cursor/rules/sql-governance.mdc` | Cursor 桥接 |
| `.github/copilot-instructions.md` | GitHub Copilot 桥接 |

**重要**：所有桥接文件**只指向本规范**，不重复内容。如发现桥接与本规范不一致，以本规范为准并同步桥接。

---

## §8 不在本规范范围内（明确划清）

以下工作**不属于本规范**，留给后续轮次：

- ❌ 使用 SQL 时的留档（谁/何时/何环境执行了哪份 SQL）—— 部署流程
- ❌ Git 提交信息规范 / PR review 流程 —— 流程规范
- ❌ CI 自动化拦截（PR 时跑 lint）—— 工具链
- ❌ 主动加载 hooks（打开 SQL 文件时自动提示）—— 工具链
- ❌ SQL 语义审核（DROP 安全、UPDATE 带 WHERE）—— DBA 职责
- ❌ 历史 SQL 头部补全 —— 长期清理
- ❌ 多项目 SQL 统一（PC + 移动 + 其他端）—— 跨端治理

---

## §9 验证清单

完成 SQL 编写后自检：

- [ ] 头部 8 字段齐全且格式正确
- [ ] 所有 DDL 使用 `wk_train_center`.`table_name` 限定
- [ ] 每张表前有 `-- ============== 表名 ==============`
- [ ] 块首有操作类型注释
- [ ] 头部"影响表"=正文去重表名
- [ ] 审核人字段格式 `<ide>:<model>`
- [ ] 跑 `python scripts/sql/build-index.py` 无错误
- [ ] README.md 中本文件状态为 ✅

---

**最后更新**: 2026-07-14
**主维护者**: Wiki 维护 agent
**问题反馈**: 在仓库根 issue 中提
