# wk-train-center 反向索引

> **状态**:跨版本不变
> **创建日期**:2026-09-28
> **更新日期**:2026-09-28(迁移完成)
> **维护人**:product-manager agent
> **工具**:Obsidian(主公指定)

---

## 用途

> 这是**反向索引入口**。
> 别人读 wk-train-center 时,从这里出发,**快速定位**:
> - "v1.5 改了 backend 的 docs/哪个?"
> - "前端 v2 的评审报告在哪?"
> - "AI 网关在哪个版本实现的?"

---

## 索引格式

每条索引包含:
- **关键词 / 概念 / 功能**
- **涉及版本**
- **涉及组件**
- **文档位置**(相对路径)
- **简短说明**

---

## 反向索引表(2026-09-28 迁移后)

### 客户定价相关

| 概念 | 版本 | 组件 | 文档位置 | 说明 |
|---|---|---|---|---|
| 客户询价功能 | 1.5 | backend(c-p) | [customer-pricing/backend/1.0/docs/](../../../customer-pricing/backend/1.0/docs/) | 船舶维保询价入口 |
| 业务梳理 | 1.5 | backend(c-p) | [业务梳理 v1.15](../../../customer-pricing/backend/1.0/docs/船舶维保定价系统-业务梳理.md) | 5 阶段、影响系数 |
| DDD 领域模型 | 1.5 | backend(c-p) | [DDD v2.13](../../../customer-pricing/backend/1.0/docs/船舶维保定价系统-DDD领域梳理.md) | 限界上下文 + 聚合 |
| 数据表结构 | 1.5 | backend(c-p) | [表设计](../../../customer-pricing/backend/1.0/docs/船舶维保定价系统-数据表结构设计.md) | SQL 资产 |
| 借鉴成本大表报告 | 1.5 | backend(c-p) | [调研报告](../../../customer-pricing/backend/1.0/reports/customer-pricing-cost-accounting-reference-report.md) | 借鉴方案 |
| 3 种新定价法 | 1.5 | backend(c-p) | [需求草稿](../../../customer-pricing/backend/1.0/reports/three-pricing-methods-requirement-draft.md) | 批量/VIP/紧急加价 |
| 成本大表教学 | 1.5 | backend(c-p) | [teach/](../../../customer-pricing/backend/1.0/teach/) | 9 lessons + 7 refs |
| 影响系数配置 API | 1.5 | backend(c-p) | [pricing-coefficient.md](../../../customer-pricing/backend/1.0/docs/api/pricing-coefficient.md) | 紧急/地点/时间系数 |
| 设备分类 API | 1.5 | backend(c-p) | [设备分类](../../../customer-pricing/backend/1.0/docs/api/equipment-category/) | 设备目录 |
| 厂家 API | 1.5 | backend(c-p) | [厂家](../../../customer-pricing/backend/1.0/docs/api/manufacturer/) | 厂家主数据 |
| 型号 API | 1.5 | backend(c-p) | [型号](../../../customer-pricing/backend/1.0/docs/api/model/) | 型号主数据 |
| 服务信息与影响系数开发计划 | 1.5 | backend(c-p) | [plans/](../../../customer-pricing/backend/1.0/plans/服务信息与影响系数/) | 影响系数 |
| 设备模块开发计划 | 1.5 | backend(c-p) | [plans/](../../../customer-pricing/backend/1.0/plans/设备模块开发计划/) | 设备模块 |
| 设备分类开发计划 | 1.5 | backend(c-p) | [设备分类](../../../customer-pricing/backend/1.0/plans/设备分类模块开发计划.md) | 设备分类 |
| 厂家开发计划 | 1.5 | backend(c-p) | [厂家](../../../customer-pricing/backend/1.0/plans/厂家模块开发计划.md) | 厂家 |
| 型号开发计划 | 1.5 | backend(c-p) | [型号](../../../customer-pricing/backend/1.0/plans/型号模块开发计划/) | 型号 |
| 评审报告 | 1.5 | backend(c-p) | [reviews/](../../../customer-pricing/backend/1.0/reviews/) | 设备评审 |
| 测试用例 | 1.5 | backend(c-p) | [test/](../../../customer-pricing/backend/1.0/docs/test/) | AI 测试用例 |
| 项目原型 | 1.5 | backend(c-p) | [prototype-design/](../../../customer-pricing/backend/1.0/docs/prototype-design/) | 原型设计 |

### AI 网关相关

| 概念 | 版本 | 组件 | 文档位置 | 说明 |
|---|---|---|---|---|
| 后端 PRD | 1.5 | backend(wk-t-c) | [PRD](../../backend/1.5/docs/PRD.md) | 后端产品需求 |
| 后端归档功能 | 1.5 | backend(wk-t-c) | [DEPRECATED-FEATURES](../../backend/1.5/docs/DEPRECATED-FEATURES.md) | 已退役功能 |
| 后端变更日志 | 1.5 | backend(wk-t-c) | [changelog](../../backend/1.5/docs/changelog.md) | 版本变更 |
| 后端版本登记 | 1.5 | backend(wk-t-c) | [version-registry.json](../../backend/1.5/docs/version-registry.json) | 版本号权威源 |
| 后端 SQL 资产 | 1.5 | backend(wk-t-c) | [db/](../../backend/1.5/db/) | DDL/DML |
| 后端计划 | 1.5 | backend(wk-t-c) | [plans/](../../backend/1.5/plans/) | 项目计划 |
| 后端评审 | 1.5 | backend(wk-t-c) | [reviews/](../../backend/1.5/reviews/) | 评审报告 |

### 前端相关

| 概念 | 版本 | 组件 | 文档位置 | 说明 |
|---|---|---|---|---|
| Vue2 PRD | 1.5 | frontend | [frontend/1.5/docs/PRD.md](../../frontend/1.5/docs/PRD.md) | Vue2 产品需求 |
| Vue3 PRD | v3 | frontend | [frontend/v3/docs/PRD.md](../../frontend/v3/docs/PRD.md) | Vue3 产品需求 |
| Vue2 计划 | 1.5 | frontend | [frontend/1.5/plans/](../../frontend/1.5/plans/) | Vue2 计划 |
| Vue3 计划 | v3 | frontend | [frontend/v3/plans/](../../frontend/v3/plans/) | Vue3 计划 |
| Vue2 评审 | 1.5 | frontend | [frontend/1.5/reviews/](../../frontend/1.5/reviews/) | Vue2 评审 |
| Vue3 评审 | v3 | frontend | [frontend/v3/reviews/](../../frontend/v3/reviews/) | Vue3 评审 |
| 前端归档功能 | 1.5 + v3 | frontend | [DEPRECATED-FEATURES](../../frontend/1.5/docs/DEPRECATED-FEATURES.md) | 已退役功能 |

### 移动端相关

| 概念 | 版本 | 组件 | 文档位置 | 说明 |
|---|---|---|---|---|
| 移动端计划 | 1.5 | mobile | [mobile/1.5/plans/](../../mobile/1.5/plans/) | 移动端计划 |
| 移动端评审 | 1.5 | mobile | [mobile/1.5/reviews/](../../mobile/1.5/reviews/) | 移动端评审 |
| 移动端 mobile1.2 评审 | 1.5(mobile1.2) | mobile | [reviews/mobile1.2/] | 2026-07 评审 |
| 移动端任务 | 1.5 | mobile | [mobile/1.5/tasks/](../../mobile/1.5/tasks/) | mobile1.x 任务 |

### 跨版本不变资料(origin/1.0/)

| 概念 | 说明 | 文档位置 |
|---|---|---|
| 原始 PRD | 跨版本不变 | [origin/1.0/PRD.md](PRD.md) |
| 产品战略 | 3 大方向 | [origin/1.0/strategy.md](strategy.md) |
| 用户说明书 | 6 类角色 | [origin/1.0/user-guide.md](user-guide.md) |
| 集合级 PRD | 跨组件 | [origin/1.0/docs/PRD.md](docs/PRD.md) |
| 集合级架构 | 跨组件 | [origin/1.0/docs/architecture/](docs/architecture/) |
| 集合级决策 | ADR | [origin/1.0/docs/decisions/](docs/decisions/) |
| 集合级用户故事 | 跨组件 | [origin/1.0/docs/user-stories/](docs/user-stories/) |
| 集合级变更日志 | 跨组件 | [origin/1.0/docs/changelog.md](docs/changelog.md) |
| 集合级 bug 跟踪 | 跨组件 | [origin/1.0/docs/bugs/](docs/bugs/) |
| 集合级版本登记 | 跨组件 | [origin/1.0/docs/version-registry.json](docs/version-registry.json) |

---

## 主公维护规则

> **每次新版本 / 大改动后,主公更新本索引**。
> 用 Obsidian 管理,链接双向引用。
> - 新增概念 → 在对应分类下加一行
> - 老概念移动 → 更新路径
> - 删除概念 → 删除对应行

---

## 引用

- 原始 PRD:[PRD.md](PRD.md)
- 战略层:[strategy.md](strategy.md)
- 用户说明书:[user-guide.md](user-guide.md)
- 集合 README:[../../README.md](../../README.md)