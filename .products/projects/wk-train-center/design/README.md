# design/ — 设计稿

> **类型**:短期产物,按版本归集
> **命名**:`YYYY-MM-DD-<主题>.md`(不带版本前缀,版本从所在目录继承)
> **Owner**:产品经理 + 研究-expert
> **最后更新**:2026-07-22

---

## 目录结构

```
design/
├── README.md                       # 本文件
├── mobile1.1/                      # 7-15 之前的设计(自建 AI 网关完整设计包)
│   └── 2026-07-14-self-ai-gateway(claude)/  # 7-14 完整设计包
├── mobile1.2/                      # 7-15 之后的设计
│   └── 2026-07-15-student-frontend-migration(claude).md
└── _legacy/                        # 7-14 之前的散落设计(暂存,后续归档判定)
    └── 2026-07-14-self-ai-gateway(qoder)/
```

## 命名规范(2026-07-22 主人拍板)

| 节奏 | 目录命名 | 例子 |
|---|---|---|
| PC/web 端 | `1.x/` | `design/1.2/` |
| **Mobile 端** | **`mobile1.x/`(无连字符)** | `design/mobile1.2/` |
| 旧/历史 | `_legacy/` 或 `_archive/` | `design/_legacy/` |
| 跨版本/长期 | docs/architecture/ 留根 | `docs/architecture/cqrs.md` |

## 归集判定

> 同一时间窗口 → 一个版本
> 主体归属 = 子仓 `git branch --show-current` 在该窗口的实际值
>
> 7-14 之前 wk-train-center-service 是 `local/mobile-v1.1/dev` → 归 `mobile1.1/`
> 7-15 起 → `mobile1.2/`
> 跨多版本整体设计 → 跟当前版本走
> 时间线不确定 → `_legacy/`,主人后续 review

## 引用

- 整体规范:[../README.md](../README.md)
- 命名铁律:[.products/specs/2026-07-22-products-projects-version-aggregation-design.md](../../specs/2026-07-22-products-projects-version-aggregation-design.md)
- reviews/ 平行规范:[../reviews/README.md](../reviews/README.md)
- tasks/ 平行规范:[../tasks/README.md](../tasks/README.md)
