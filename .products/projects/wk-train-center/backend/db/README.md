# SQL 资产索引导航

> 本目录是 wk-train-center-service 项目的 SQL 资产根。
> 本 README 由 `scripts/sql/build-index.py` 自动生成 + 人工校对。
> 最后构建时间: 2026-07-14 13:01:37

## 📊 全局统计

| 版本 | SQL 文件数 | DDL 数 | DML 数 | 未审核 | 创建时间范围 |
|---|---|---|---|---|---|
| mobile1.1 | 2 | 3 | 1 | 2 ⚠️ |  |
| 1.1 | 7 | 20 | 1 | 7 ⚠️ |  |
| 1.2 | 20 | 161 | 12 | 20 ⚠️ |  |
| 1.3 | 2 | 11 | 1 | 2 ⚠️ |  |
| 1.4 | 1 | 3 | 0 | 1 ⚠️ |  |
| 1.5 | 4 | 6 | 4 | 4 ⚠️ |  |
| **合计** | **36** | **204** | **19** | **36** | — |

## 🗂️ 按版本导航

### mobile1.1 （2 个未审核）

- **变更概要**：（待人工补充）
- **影响最大表**：el_plan_node, el_sys_role, el_sys_role_menu
- **详细列表**：

### 1.1 （7 个未审核）

- **变更概要**：（待人工补充）
- **影响最大表**：el_training_record
- **详细列表**：

### 1.2 （20 个未审核）

- **变更概要**：（待人工补充）
- **影响最大表**：el_course, el_course_file, el_course_file_learn
- **详细列表**：

### 1.3 （2 个未审核）

- **变更概要**：（待人工补充）
- **影响最大表**：el_course_file_learn, el_msg_tmpl, el_plan_node
- **详细列表**：

### 1.4 （1 个未审核）

- **变更概要**：（待人工补充）
- **影响最大表**：el_plan_node, el_plan_user_node
- **详细列表**：

### 1.5 （4 个未审核）

- **变更概要**：（待人工补充）
- **影响最大表**：el_cfg_prop, el_plan_node, el_plan_user
- **详细列表**：


## 🔍 按业务模块索引

| 模块 | 涉及版本 | 主要改动表 |
|---|---|---|
| <root> | 1.1, 1.2, 1.3, 1.4 | el_cfg_base, el_course, el_course_comment, el_course_file, el_course_file_learn 等 33 张 |
| course | 1.2 | el_course, el_course_comment, el_course_file, el_course_file_learn, el_course_join 等 27 张 |
| course_qa | 1.2 | el_course, el_course_qa |
| depart | 1.2 | el_sys_depart, el_sys_depart_function, el_sys_user |
| kg | 1.1 |  |
| lecturer | 1.2 | el_sys_role |
| plan | mobile1.1, 1.5 | el_plan_node, el_plan_user, el_plan_user_bak_v1_5 |
| sys | mobile1.1, 1.2, 1.5 | el_cfg_base, el_cfg_prop, el_sys_role, el_sys_role_menu, el_sys_role_menu_backup 等 7 张 |
| train-ai | 1.1 | el_training_record |
| train-sign-in | 1.5 | el_training_sign_in, el_training_sign_in_record |
| training-plan | 1.2 | el_training_record |

## ⚠️ 治理状态

- **未审核 SQL 列表**：见各版本 README.md 中的 ⚠️ 标记
- **TODO(legacy) 标记**：见各版本 README.md 中的 TODO 段
- **头部不合规**：见 [lint-report.md](lint-report.md)

## 📜 规范

- **SQL 头部 8 字段**：[HEADER-TEMPLATE.sql](HEADER-TEMPLATE.sql)
- **治理规范完整版**：[GOVERNANCE.md](GOVERNANCE.md)
- **跨智能体桥接**：`wk-train-center-service/AGENTS.md` + `.qoder/rules/` + `.claude/skills/` + `.cursor/rules/` + `.github/copilot-instructions.md`

> ⚠️ **2026-07-22 命名更新**:目录 `mobile-1.1/` → `mobile1.1/`(无连字符,跟主人 2026-07-22 拍板的 `mobile1.x/` 现状习惯一致)。下次 `scripts/sql/build-index.py` 重生成时会自动同步,本 README 已手动对齐。
