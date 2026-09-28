# reviews/ — 评审报告

> **类型**:短期产物,按版本归集
> **命名**:`YYYY-MM-DD-<评审类型>-by-<reviewer>.md`
> **Owner**:review-expert + backend-expert + frontend-expert
> **最后更新**:2026-07-22

---

## 目录结构

```
reviews/
├── README.md                       # 本文件
├── mobile1.1/                      # 7-15 ~ 7-17 评审(10 个)
│   ├── 2026-07-15-backend-handoff-kb-choose.md
│   ├── 2026-07-15-backend-issues-for-claude.md
│   ├── 2026-07-15-backend-issues-for-claude-v2.md
│   ├── 2026-07-15-backend-review-by-qoder.md
│   ├── 2026-07-15-frontend-issues-for-qoder.md
│   ├── 2026-07-15-frontend-review-by-claude.md
│   ├── 2026-07-15-integration-tracker.md
│   ├── 2026-07-16-backend-handoff-error-classification.md
│   ├── 2026-07-16-DELIVERY_NOTES_P3_SUGGEST_AND_STAGES.md
│   └── 2026-07-17-AI_ASSISTANT_TEST_REPORT.md
├── mobile1.2/                      # 7-22 评审(4 个)
│   ├── 2026-07-22-合并-dashscope-file-ids-issues-for-qoder.md
│   ├── 2026-07-22-合并-dashscope-file-ids-issues-for-qoder-v2.md
│   ├── 2026-07-22-合并-dashscope-file-ids-issues-for-qoder-v3.md
│   └── 2026-07-22-后端-phase1-3-验收-by-claude.md
└── _archive/                       # 7-10 之前历史
    └── CONVENTIONS.md
```

## 命名规范(2026-07-22 主人拍板)

| 节奏 | 目录命名 | 例子 |
|---|---|---|
| **Mobile 端** | **`mobile1.x/`(无连字符)** | `reviews/mobile1.2/` |
| 旧/历史 | `_archive/` | `reviews/_archive/` |

文件命名:
- `YYYY-MM-DD-{front|back|full}-<主题>-by-<reviewer>.md`
- 例:`2026-07-22-后端-phase1-3-验收-by-claude.md`

## 归集判定

> 7-15 ~ 7-17 期间 wk-train-center-service 是 `local/mobile-v1.1/dev` → 归 `mobile1.1/`
> 7-22 起 wk-train-center-service 切到 `local/mobile1.2/fix` → 归 `mobile1.2/`
> 7-10 之前的评审 → `_archive/`
> 时间线不确定 → 留根,主人后续 review

## 引用

- 整体规范:[../README.md](../README.md)
- 命名铁律:[.products/specs/2026-07-22-products-projects-version-aggregation-design.md](../../specs/2026-07-22-products-projects-version-aggregation-design.md)
- design/ 平行规范:[../design/README.md](../design/README.md)
- tasks/ 平行规范:[../tasks/README.md](../tasks/README.md)
