# wk-train-center-ui(PC 前端 Vue2)

> **项目代号**:wk-train-center-ui
> **技术栈**:Vue 2 + Element UI
> **职责**:PC 端 Web 前端(老,逐步过渡到 v3)
> **Owner**:frontend-expert agent
> **最后更新**:2026-07-22(版本归集)

---

## 当前状态

| 维度 | 值 |
|---|---|
| 当前 git 分支 | `local/mobile1.2/fix` |
| 当前版本 | **mobile1.2**(开发中) |
| 已发布版本 | mobile1.1(2026-07 中旬) |
| 历史归档 | 1.0/1.2/1.3/1.4(PC 端) + mobile-v1.0/mobile-v1.1(移动端) |

权威源:`docs/version-registry.json`(`current` 字段,2026-07-22 已修)
> ⚠️ 2026-07-22 修文件时发现原 registry L82-L113 存在**两个 JSON 拼合**的数据损坏,本次已完整重写

---

## 目录结构

```
wk-train-center-ui/
├── README.md                       # 本文件
├── docs/                           # 长期:跨版本产物,留根
│   ├── PRD.md                      # 前端实现的产品需求
│   ├── changelog.md                # 前端代码变更日志
│   ├── DEPRECATED-FEATURES.md      # 弃用特性登记
│   └── version-registry.json       # 🆕 版本权威源(2026-07-22 重写)
└── tasks/                          # 短期:前端任务
```

---

## 版本目录命名(2026-07-22 主人拍板)

| 节奏 | 目录命名 | 例子 |
|---|---|---|
| PC/web 端 | `1.x/` | `tasks/1.2/` |
| **Mobile 端** | **`mobile1.x/`(无连字符)** | `tasks/mobile1.2/` |
| 旧/历史 | `_archive/` | — |
| 跨版本/长期 | 留根 | `docs/PRD.md` |

**禁用**:
- ❌ `mobile-1.x/`(db/ 老命名,本仓之前未用过)
- ❌ `mobile-v1.x/`(只用于 Git 分支)
- ❌ `v1.x/`(VERSION_GUIDE 老规范,已废)

---

## 关联项目

| 角色 | 项目 |
|---|---|
| 产品 | [.products/projects/wk-train-center/](../wk-train-center/) |
| 后端 | [.products/projects/wk-train-center-service/](../wk-train-center-service/) |
| Vue3 迁移目标 | [.products/projects/wk-train-center-ui-v3/](../wk-train-center-ui-v3/) |
| 移动端 | [.products/projects/wk-mhc-mobile/](../wk-mhc-mobile/) |

---

## 引用

- 整体规范:[.products/README.md](../../README.md)
- 命名铁律:[.products/specs/2026-07-22-products-projects-version-aggregation-design.md](../../specs/2026-07-22-products-projects-version-aggregation-design.md)
- version-registry:[docs/version-registry.json](docs/version-registry.json)
- v3 registry:[docs/v3Registry](../wk-train-center-ui-v3/docs/version-registry.json)
