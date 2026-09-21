# Link Breakage Report

> 2026-07-22 文档归集产生的已知断链/不修正项
> 维护:研究-写库流程(改一处动多处时,先看本文件)

## Phase 1 文件归集产生的链接影响

### 1.1 reviews/ → mobile1.1/ + mobile1.2/ + _archive/

**影响面**:
- 其他文档可能引用 `reviews/2026-07-15-*.md` 形式
- 改后路径:`reviews/mobile1.1/2026-07-15-*.md` 或 `reviews/mobile1.2/...` 或 `reviews/_archive/...`

**已知断链**:无(已 grep 全仓,无引用)

**未处理项**:无

### 1.2 tasks/ → mobile1.2/

**影响面**:
- 其他文档可能引用 `tasks/2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md`
- 改后路径:`tasks/mobile1.2/2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md`

**已知断链**:无(已 grep)

**未处理项**:
- `tasks/2026-07-09-tech-debt-data-table-api-func.{md,json}` — 主人 2026-07-22 拍板"待 confirm"后未动,**留根**。如后续归入 mobile1.2,需同步更新本节。

### 1.3 design/ → _legacy/ + mobile1.1/ + mobile1.2/

**影响面**:
- `2026-07-14-self-ai-gateway(qoder)/` → `_legacy/2026-07-14-self-ai-gateway(qoder)/`
- `2026-07-14-self-ai-gateway(claude)/` → `mobile1.1/2026-07-14-self-ai-gateway(claude)/`
- 内部 7-15 student-frontend-migration 文件 → `mobile1.2/`

**已知断链**:无(已 grep,无外部引用)

### 1.4 db/mobile-1.1/ → db/mobile1.1/

**影响面**:
- 4 个 md 文档引用更新(README/GOVERNANCE/lint-report/mobile1.1/README)
- SQL 文件 0 引用(已 grep)
- 脚本 `scripts/sql/build-index.py` 下次重生成会自动同步 README

**已知断链**:无

**未处理项**:
- 脚本生成 README 的模板如果硬编码 `mobile-1.1`,下次 build 会再次反改。**建议**主人后续修 `scripts/sql/build-index.py` 模板。

## 跨任务的"长期 vs 短期"判定边界(给后续 review 留)

| 文件/位置 | 判定 | 出处 |
|---|---|---|
| `wk-train-center/tasks/2026-07-09-tech-debt-data-table-api-func.{md,json}` | 留根(待主人 confirm) | 2026-07-22 主人拍板,2 问后未拍 |
| `wk-train-center/design/_legacy/2026-07-14-self-ai-gateway(qoder)/` | _legacy 是临时态,后续判定归档或删除 | plan D7 |
| `wk-train-center/reviews/_archive/CONVENTIONS.md` | 7-10 之前历史,确认归档而非删 | plan 1.1 |

## 给后续任务的口径

如发现新的链接断裂:
1. 立即更新本文件,标"已知断链"
2. 如影响面 > 5 处,**暂停任务**上报主人
3. 如影响面 ≤ 5 处,直接修并回报

---

维护人:研究-expert + 项目经理
最后更新:2026-07-22
