# wk-train-center-service(后端)

> **项目代号**:wk-train-center-service
> **技术栈**:Java 17 + Spring Boot 3 + DDD 三层 + MyBatis-Plus + Shiro
> **职责**:后端 API + SQL 资产 + 部署
> **Owner**:backend-expert agent
> **最后更新**:2026-07-22(版本归集)

---

## 当前状态

| 维度 | 值 |
|---|---|
| 当前 git 分支 | `local/mobile1.2/fix` |
| 当前版本 | **mobile1.2**(开发中) |
| 已发布版本 | mobile1.1(2026-07 中旬) |
| 历史归档 | 1.0/1.1/1.2/1.3/1.4/1.5(PC 端) + mobile-v1.0/mobile-v1.1(移动端) |

权威源:`docs/version-registry.json`(`current` 字段,2026-07-22 已修)

---

## 目录结构

```
wk-train-center-service/
├── README.md                       # 本文件
├── docs/                           # 长期:跨版本产物,留根
│   ├── PRD.md                      # 后端实现的产品需求
│   ├── changelog.md                # 后端代码变更日志
│   ├── DEPRECATED-FEATURES.md      # 弃用特性登记
│   └── version-registry.json       # 🆕 版本权威源
├── db/                             # SQL 资产,按版本归集
│   ├── README.md                   # 索引导航
│   ├── GOVERNANCE.md               # 治理规范
│   ├── HEADER-TEMPLATE.sql         # 头部模板
│   ├── lint-report.md              # 校验报告
│   ├── 1.1/ 1.2/ 1.3/ 1.4/ 1.5/   # PC 端 5 个版本(历史)
│   └── mobile1.1/                  # 移动端(2026-07-22 由 mobile-1.1 重命名)
├── plans/                          # 计划(技术层方案)
└── tasks/                          # 短期:技术任务看板(2026-07-07 radar 7 任务)
```

---

## 版本目录命名(2026-07-22 主人拍板)

| 节奏 | 目录命名 | 例子 |
|---|---|---|
| PC/web 端 | `1.x/` | `db/1.2/` |
| **Mobile 端** | **`mobile1.x/`(无连字符)** | `db/mobile1.1/` |
| 旧/历史 | `_archive/` | — |
| 跨版本/长期 | 留根 | `docs/PRD.md` |

**禁用**:
- ❌ `mobile-1.x/`(老命名,2026-07-22 改完)
- ❌ `mobile-v1.x/`(只用于 Git 分支)
- ❌ `v1.x/`(VERSION_GUIDE 老规范,已废)

---

## SQL 资产治理

- 头部 8 字段:`HEADER-TEMPLATE.sql`
- 治理规范:`GOVERNANCE.md`
- 校验报告:`lint-report.md`
- AI 自审机制:见 `coordination-contract-owner.md`(主仓根)

---

## 关联项目(产品层)

| 角色 | 项目 |
|---|---|
| 产品 | [.products/projects/wk-train-center/](../wk-train-center/) |
| 前端 Vue2 | [.products/projects/wk-train-center-ui/](../wk-train-center-ui/) |
| 前端 Vue3 | [.products/projects/wk-train-center-ui-v3/](../wk-train-center-ui-v3/) |
| 移动端 | [.products/projects/wk-mhc-mobile/](../wk-mhc-mobile/) |

---

## 引用

- 整体规范:[.products/README.md](../../README.md)
- 命名铁律:[.products/specs/2026-07-22-products-projects-version-aggregation-design.md](../../specs/2026-07-22-products-projects-version-aggregation-design.md)
- version-registry:[docs/version-registry.json](docs/version-registry.json)
- 主仓 AGENTS.md:`wk-train-center-service/AGENTS.md`
