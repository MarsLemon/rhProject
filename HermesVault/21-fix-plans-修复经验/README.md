---
title: fix-plans 索引
created: 2026-06-18
updated: 2026-06-18
type: meta
tags: [meta, fix-plans, index]
sources:
  - E:\rhProject\fix-plans\README.md
confidence: high
---

# fix-plans 索引

> **修复经验库**：问题 → 计划 → 修复 → 沉淀（learned）。完整规约见 [[0.规约]]。
> **入口**：旧的 `E:\rhProject\fix-plans\` 完整保留作为只读副本（git 还在跟踪），**新内容写到本目录**。

## 📊 修复经验速览（Dataview）

### 按状态

```dataview
TABLE WITHOUT ID
  status as "状态",
  severity as "严重度",
  title as "标题",
  learned as "学到了什么"
FROM "fix-plans"
WHERE type = "fix-plan"
SORT status ASC, created DESC
```

### 按模块（tags 第 3 个元素）

```dataview
TABLE WITHOUT ID
  tags[2] as "模块",
  length(rows.status) as "数量"
FROM "fix-plans"
WHERE type = "fix-plan"
GROUP BY tags[2]
```

### 已修 / 待修 比例

```dataview
TABLE WITHOUT ID
  status as "状态",
  length(rows.title) as "数量"
FROM "fix-plans"
WHERE type = "fix-plan"
GROUP BY status
```

## 📁 按时间倒序

| 日期 | 来源 | 标题 | 状态 | 严重度 | 学到 |
|---|---|---|---|---|---|
| 2026-06-15 | manual | [[2026-06-15-manual-test-cases]] | open | meta | DDL 验证用 SHOW COLUMNS;手动测试清单按 前置/操作/预期 三段写最稳 |
| 2026-06-15 | unlock | [[2026-06-15-unlock-flow-required-button-removed-vulns]] | fixed | high | 删除 el_training_record.required 字段后,前端解锁按钮的判断要重新走查;字段下线 ≠ 业务下线 |
| 2026-06-15 | verify | [[2026-06-15-verify-test-cases]] | open | meta | v3 迁移 6 文件的 lang=ts 验证清单;vue-tsc 跟 esbuild 是不同编译器,双绿不等于运行绿 |
| 2026-06-11 | qu | [[2026-06-11-qu-import-template-mismatch]] | fixed | high | Excel 模板列名变化必须同步 DTO @ExcelField;字段严格相等匹配,新模板前要 importDryRun |
| 2026-06-11 | plan | [[2026-06-11-plan-notify-dialog-destroy-on-close]] | fixed | medium | Element-UI dialog 默认缓存实例;destroy-on-close 防止残留 watcher |
| 2026-06-09 | data | [[2026-06-09-data-table-filter-reset-and-default-params]] | open | medium | 筛选器切换时未重置分页;分页参数和筛选条件必须联动 |
| 2026-06-08 | code | [[2026-06-08-code-review-summary]] | fixed | meta | code-review 一次 14 条结论,按 必修/技术债 分类沉淀;问题分桶比逐条修更高效 |
| 2026-06-08 | code | [[2026-06-08-code-review-ai-file-list-typeerror]] | open | blocker | AI 流式回复前端持久化前未做空值检查;处理 SSE chunk 时必须 try/catch |
| 2026-06-08 | code | [[2026-06-08-code-review-exam-mapper-list-resultmap]] | open | blocker | MyBatis resultMap 缺列会运行时炸;反向引用 SQL 必须穷举返回字段 |
| 2026-06-08 | code | [[2026-06-08-code-review-notify-scope3-deadcode]] | fixed | high | scope=3 限定 PERSON 计划;写业务代码前先看清枚举的所有取值 |
| 2026-06-08 | code | [[2026-06-08-code-review-notify-scope3-dup-userids]] | fixed | high | 入参 userIds 必须先去重;调用方不可信原则 |
| 2026-06-08 | code | [[2026-06-08-code-review-plan-dialog-loading-hint]] | fixed | medium | 加载中文案在切换 plan 时未清空;dialog 状态隔离要彻底 |
| 2026-06-08 | code | [[2026-06-08-code-review-plan-dialog-stale-userids]] | fixed | high | dialog 切换 plan 时残留上一份 userIds;onPlanChange 必须 reset |
| 2026-06-08 | code | [[2026-06-08-code-review-tech-debt\|技术债汇总]] | open | medium | 8 条技术债集中在 api/ai/common.js;逻辑过度复杂 + 调试代码长期在线是腐烂温床 |

## 命名规范（沿用）

```
<YYYYMMDD>-<来源>-<主题>.md
```

- `<来源>`：`code-review` / `manual-test` / `prod-incident` / `tech-debt` / `refactor` / `spike`
- `<主题>`：3-5 个词的英文 / 拼音简述

## 入口

- `E:\rhProject\fix-plans\` —— 旧位置（只读副本，git 还在跟踪）
- `HermesVault\fix-plans\` —— 新位置（本目录，**新内容写这里**）
