---
name: sql-governance
description: 在 wk-train-center-service 项目下生成或修改 SQL 文件时强制遵守 8 字段头部 + 强制结构 4 条 + AI 自审机制。AI 通过后自动填审核字段。不审 SQL 语义。
---

# SQL 治理 (Claude Code 桥接)

## 主规范

- **完整规范**：[.products/projects/wk-train-center-service/db/GOVERNANCE.md](../../../.products/projects/wk-train-center-service/db/GOVERNANCE.md)
- **AGENTS.md 段**：[wk-train-center-service/AGENTS.md](../../../wk-train-center-service/AGENTS.md) 中"SQL 资产治理规范"段
- **索引导航**：[.products/projects/wk-train-center-service/db/README.md](../../../.products/projects/wk-train-center-service/db/README.md)
- **模板**：[HEADER-TEMPLATE.sql](../../../.products/projects/wk-train-center-service/db/HEADER-TEMPLATE.sql)

## 触发条件

当以下场景时自动加载本 skill：

- 用户在 `wk-train-center-service` 项目下请求新建/修改 SQL 文件
- 用户提到"加个字段"、"改个表"、"迁移"、"SQL"、"DDL"、"DML" 等关键词
- 任何对 `.products/projects/wk-train-center-service/db/` 下 .sql 文件的修改

## 执行流程

1. **读取主规范**（如未读过）：`.products/projects/wk-train-center-service/db/GOVERNANCE.md`
2. **确认资产位置**：写入路径必须在 `.products/projects/wk-train-center-service/db/<version>/<module>/` 下
3. **生成 8 字段头部**（顺序固定）：
   - 版本 / 模块 / 用途 / 影响表 / 创建日期 / 作者 / 审核人 / 审核日期
4. **应用强制结构 4 条**：
   - DDL 库名限定
   - 按表分块
   - 块首操作类型
   - 影响表 = 正文去重
5. **AI 自审**：调用 memory 中的"规范化SQL头部与结构生成技能"做结构校验
6. **填审核字段**：
   - 审核人：`claude:<model>`（如 `claude:sonnet-4.5`、`claude:opus-4`）
   - 审核日期：当天 ISO 日期（YYYY-MM-DD）

## 不做什么

- **不审 SQL 语义**：DROP 是否安全、UPDATE 是否带 WHERE、索引设计——这些是 DBA / 部署负责人职责
- **不强行补全历史 SQL**：legacy 文件不强求重写头部
- **不写敏感信息**：不在 SQL 里写真实密钥/数据

## 失败处理

- 头部 8 字段缺一 → 视为不合规，要求补全
- 影响表与正文不一致 → 视为不合规，要求重写头部
- DDL 缺库名限定 → 自动加 `wk_train_center.` 前缀

## 相关 skill

- `规范化SQL头部与结构生成技能`（已有 memory）—— 本 skill 调用它完成结构自审
