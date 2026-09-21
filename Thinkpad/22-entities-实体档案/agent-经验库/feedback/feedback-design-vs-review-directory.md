---
name: feedback-design-vs-review-directory
description: rhProject .products/projects/{project}/ 目录结构规范：设计/评审/任务三目录严格分工
metadata:
  node_type: memory
  type: feedback
  title: 设计 vs 评审 vs 任务文档目录区分
  createdAt: 2026-07-15
  trigger: "主人纠错\"放到 design 中,这个不应该放到 review 中\""
  relatedFiles:
    - .products/projects/wk-train-center/reviews/2026-07-15-frontend-issues-for-qoder.md
    - .products/projects/wk-train-center/reviews/2026-07-15-frontend-review-by-claude.md
  originSessionId: eae54487-5bc0-41e7-8101-d05d692ec018
migrated_from: auto-memory-2026-09-07
migrated_path: C:\Users\RUHAI\.claude\projects\E--rhProject\memory\feedback-design-vs-review-directory.md
---

# rhProject `.products/projects/{project}/` 目录结构规范

## 5 个目录职责(2026-07-15 主人纠错后明确)

| 目录 | 职责 | 文件命名规范 |
|---|---|---|
| `design/` | **设计文档**(计划、架构、原型 demo) | `{date}-{topic}.md` |
| `reviews/` | **评审文档**(review + issues) | `{date}-{topic}-review-by-{author}.md` 或 `{date}-{topic}-issues-for-{recipient}.md` |
| `tasks/` | **任务看板 + 任务文档** | `{date}-{task}.md` 或 JSON |
| `iterations/` | 迭代记录 |  |
| `docs/` | 长期产品文档(PRD 等) |  |

## 关键纠错(2026-07-15 主人原话)

> "放到 design 中,这个不应该放到 review 中"

**错误行为**:
- Claude 写前端自审报告时,**习惯性放 `design/` 子目录**
- 主人口径:"评审类文档放 `reviews/`"
- 主人已建立的规范:`reviews/2026-07-15-backend-issues-for-claude.md` + `reviews/2026-07-15-backend-review-by-qoder.md`(Qoder 后端 review)

**正确行为**:
- 自审 / 评审报告 → `reviews/`
- 计划 / 架构 / 实施方案 → `design/`
- 任务追踪 → `tasks/`

## 命名规范细节(主人已建模式)

| 类型 | 命名 | 例子 |
|---|---|---|
| 问题清单(给某人改) | `{topic}-issues-for-{recipient}.md` | `frontend-issues-for-qoder.md`(Qoder 改) |
| Review 报告(某人写) | `{topic}-review-by-{author}.md` | `frontend-review-by-claude.md`(Claude 写) |
| Backend 同样规范 | 同上 | `backend-issues-for-claude.md`、`backend-review-by-qoder.md` |

## Why:避免重复犯

- `.products/projects/{project}/` 是按"工作流阶段"分目录,不是按"主题"分目录
- 评审类文档堆在 `design/` 会混淆"计划"vs"评审"——后续查找困难
- 主人每次纠错都打断 Claude 流程,降低协作效率

## How to apply(下次写评审/issue 文档时)

1. **先想文档性质**:是"设计"还是"评审"?
2. **评审类**:`reviews/` + 命名 `{topic}-review-by-{author}.md` 或 `{topic}-issues-for-{recipient}.md`
3. **设计类**:`design/` + 命名 `{date}-{topic}.md`
4. **不创建新的子目录**——直接放对应顶层目录

## 例外情况

- 设计文档里的"实施计划"含自审部分:留在 `design/`,自审内容标"任务 8 验收"等
- 评审文档引用设计文档:`reviews/...md` 里 link 到 `design/...md`,反向不引