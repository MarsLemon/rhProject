# wk-train-center-ui-v3(PC 前端 Vue3 迁移目标)

> **项目代号**:wk-train-center-ui-v3
> **技术栈**:Vue 3 + Element Plus + Vite
> **职责**:Vue3 迁移目标仓,逐步替代 wk-train-center-ui
> **Owner**:frontend-expert agent
> **最后更新**:2026-07-22(版本归集)

---

## 当前状态

| 维度 | 值 |
|---|---|
| 当前 git 分支 | `master` |
| 当前版本 | **master-tracked**(无版本节奏,迭代缓慢) |
| 已发布版本 | (尚未正式发版) |
| 历史归档 | 无 |

权威源:`docs/version-registry.json`(2026-07-22 摸底时已正确,无需修复)

---

## 目录结构

```
wk-train-center-ui-v3/
├── README.md                       # 本文件
├── docs/                           # 长期:跨版本产物,留根
│   ├── PRD.md                      # Vue3 迁移的产品需求
│   ├── changelog.md                # Vue3 代码变更日志
│   ├── DEPRECATED-FEATURES.md      # 弃用特性登记
│   └── version-registry.json       # 🆕 版本权威源
└── tasks/                          # 短期:迁移任务
```

---

## 版本节奏(本仓特殊)

本仓**未启用** `local/X.X/dev` 多分支节奏,直接在 master 上迭代。原因:
- Vue3 迁移是长期工作,版本节奏跟 wk-train-center-ui 不同步
- 等首个稳定版本发布后再启用 `local/X.X/dev` 多分支

后续如果启用:
- 目录命名跟 wk-train-center-ui 一致(`mobile1.x/` 或 `1.x/`)
- 见 [.products/specs/2026-07-22-products-projects-version-aggregation-design.md](../../specs/2026-07-22-products-projects-version-aggregation-design.md) §3 命名规范

---

## 关联项目

| 角色 | 项目 |
|---|---|
| 产品 | [.products/projects/wk-train-center/](../wk-train-center/) |
| 后端 | [.products/projects/wk-train-center-service/](../wk-train-center-service/) |
| Vue2 老前端(被替代) | [.products/projects/wk-train-center-ui/](../wk-train-center-ui/) |
| 移动端 | [.products/projects/wk-mhc-mobile/](../wk-mhc-mobile/) |

---

## 引用

- 整体规范:[.products/README.md](../../README.md)
- 命名铁律:[.products/specs/2026-07-22-products-projects-version-aggregation-design.md](../../specs/2026-07-22-products-projects-version-aggregation-design.md)
- version-registry:[docs/version-registry.json](docs/version-registry.json)
- ui 仓 registry:[docs/](../wk-train-center-ui/docs/version-registry.json)
