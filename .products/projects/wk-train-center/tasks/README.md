# tasks/ — 任务计划与看板

> **类型**:短期产物,按版本归集
> **Owner**:project-manager agent
> **最后更新**:2026-07-22

---

## 目录结构

```
tasks/
├── README.md                       # 本文件
├── task_plan.md                    # 跨版本调研产物(留根,跟 mobile1.x 无关)
├── mobile1.1/                      # 7-17 起,H5 移动端 AI 模块改造(7 任务)
│   ├── README.md                   # 任务索引
│   ├── 2026-07-17-h5-ai-gateway-migration.md
│   ├── 2026-07-17-p1-7-dashscope-qwen-long-audit.md
│   └── ... (7 个任务,详细见 mobile1.1/README.md)
├── mobile1.2/                      # 7-14 起,自建 AI 网关统一计划
│   ├── README.md                   # 🆕 任务索引
│   └── 2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md
└── (留根)
    └── 2026-07-09-tech-debt-data-table-api-func.{md,json}   # 待主人 confirm 归 mobile1.2
```

## 命名规范(2026-07-22 主人拍板)

| 节奏 | 目录命名 | 例子 |
|---|---|---|
| **Mobile 端** | **`mobile1.x/`(无连字符)** | `tasks/mobile1.2/` |
| 跨版本/长期 | 留根 | `tasks/task_plan.md` |

文件命名:
- `YYYY-MM-DD-<任务主题>.md`
- 例:`2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md`

## 待主人 confirm(2026-07-22)

> `tasks/2026-07-09-tech-debt-data-table-api-func.{md,json}` 暂留根。
> 判定争议:7-09 出,但跟 7-14 unified plan 是同一主题(自建 AI 网关)。
> 主人 Q2 拍板"只归当前 mobile1.2",但严格按日期应归 mobile1.1 前。
> **处理**:等主人后续 review,根据判定结果 mv 到 `mobile1.1/` 或 `mobile1.2/`。

## 引用

- 整体规范:[../README.md](../README.md)
- 命名铁律:[.products/specs/2026-07-22-products-projects-version-aggregation-design.md](../../specs/2026-07-22-products-projects-version-aggregation-design.md)
- design/ 平行规范:[../design/README.md](../design/README.md)
- reviews/ 平行规范:[../reviews/README.md](../reviews/README.md)
