---
name: ai-tool-orchestration
description: >-
  Routes work across Cursor (primary coding), Claude (auxiliary analysis/review),
  and Qoder (RepoWiki/rules generation). Use when user mentions Cursor+Claude+Qoder
  collaboration, tool 分工, handoff, wiki sync, scheduled task, or which tool should handle a task.
---

# AI 三工具协同编排（rhProject）

## 何时触发

- 用户问「用哪个工具」「Claude 做什么」「Qoder wiki」
- 跨工具交接：方案 → 实现、Wiki 维护
- 需要在工具间传递结论

## 工作流

```
需要改仓库代码 / build / test？
  → Cursor（本仓库 Agent）
  → 若要刷新/补齐 Repowiki
       → Qoder → git commit → npm run sync:wiki
       → 若要方案/评审/对比/ deep-dive
              → Claude → 交接口给 Cursor
              → 若只查已有知识 → rh-project-wiki（INDEX + repowiki）
```

## Cursor Agent 执行清单

1. 业务任务先走 `rh-project-wiki`（精读 1–3 篇）
2. 含中文文件由本会话 Write；子 Agent 只读分析
3. 子 Agent 批次后：`npm run verify:chinese`
4. Qoder 刷新后：`npm run sync:wiki`（Windows 计划任务见 scheduled-tasks）

## Wiki / 定时任务

```bash
npm run sync:wiki
npm run verify:chinese
```

Windows 计划任务（脚本、日志、注册）：[`.cursor/scheduled-tasks/README.md`](../../scheduled-tasks/README.md)

交接模板：[reference.md](./reference.md)

协作说明：`.cursor/wiki/COLLABORATION.md`
