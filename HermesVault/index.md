---
title: Wiki Index
created: 2026-06-18
updated: 2026-06-18
type: meta
tags: [meta, index]
---

# Wiki Index

> 主人打开 vault 第一眼看这里。
> 每一行是一个 wikilink + 一句话说明。
> Last updated: 2026-06-18 | Total pages: 43 (新增 1 = `23-Tools-工具用法/hermes-web-extract-后端切换.md`)

## 🗺️ 看这里(5 步流程图,数字 = 流程顺序)

> 左栏文件夹名带数字前缀,**数字小 → 流程靠前**。
> 想动手前先看下面 5 步,一眼能定位该往哪放 / 往哪找。

| 步骤 | 目录 | 干啥 | 写啥 |
|---|---|---|---|
| **1. 收件** | `00-Inbox/` | 主人随手记(微信/小红书/脑子一闪) | 一句话、链接、截图、命令 |
| **2. 原料** | `10-raw-原始材料/` | 调研原件,只读不改 | 文章、PDF、转写、图片 |
| **3. 笔记** | `20-concepts-已消化笔记/` | 反复出现的概念/方法/坑复盘 | 概念卡、调研总结、坑复盘 |
| **3. 笔记** | `21-fix-plans-修复经验/` | 一次性 bug / 修复 / 漏洞 | 16 份 fix-plan + 0.规约 |
| **3. 笔记** | `22-entities-实体档案/` | 人/项目/工具/产品的档案 | INVENTORY.md(工具栈) |
| **3. 笔记** | `23-Tools-工具用法/` | 工具使用笔记 / 经验 / 踩坑 | Qoder / VSCode / Claude Code CLI 等 |
| **4. 沉淀** | `30-comparisons-对比/` | 横向对比(方案 A vs B) | 调研究选型时写 |
| **4. 沉淀** | `31-queries-查询归档/` | 值得留的查询结果 | 主人常问的问题的答 |
| **5. 归档** | `40-_meta-归档索引/` | 索引 / 主题地图 / 已废弃 | 整体地图、归档文件 |

> 不知道放哪 → **扔 `00-Inbox/`**,说"小马消化 inbox",我分流。

## 入口

- [[SCHEMA]] — 这个 vault 的规约,改之前先看
- [[21-fix-plans-修复经验|21-fix-plans-修复经验/]] — 修复经验库(2026-06-18 从 `E:\rhProject\fix-plans\` 迁入)
- [[8件套插件说明]] — Obsidian 必装插件清单 + 作用
- [[dataview示例]] — Dataview 查询 + Templater 模板开箱即用
- [[log]] — 改动流水(从今天开始累积)

## Inbox(待消化)

- [[2026-06-18-github-trending]] — GitHub 早报样张(cron 每日产出,待主人 review 后决定是否升级到 `20-concepts/`)

## Entities(实体)

- [[INVENTORY]] — 5 组件工具栈快照(Qoder / VSCode+Claude 插件 / Claude Code CLI / 终端 / Hermes)

## Concepts(概念)

- [[llm-wiki]] — Karpathy 的 LLM Wiki 模式说明
- [[hermes-skill-system]] — Hermes skill 体系 + Obsidian 衔接
- [[hermes-obsidian-workflow]] — Hermes × Obsidian × Claude Code 协作 SOP(以后就照这个走)
- [[hermes-internal-cheatsheet]] — Hermes 内部使用手册(memory 干货版,6 条同步来的)
- [[cron-runtime-resilience]] — Cron 任务运行韧性(限流/429/窗口重置)
- [[审计方法论]] — 审计/检查类任务的 3 条铁律
- [[调研/]] — 已落实的调研（20-concepts-已消化笔记/调研/,1 份;按月归档到 2026-06/）
- [[坑复盘/]] — 坑复盘（20-concepts-已消化笔记/坑复盘/,2 份: v3 迁移 + 删文件;按月归档到 2026-06/）

## Tools(工具用法)

- [[hermes-web-extract-后端切换]] — web_extract 4 家后端(tavily/firecrawl/exa/parallel)自动检测 + 一键切换脚本

## Comparisons(对比)

_待积累_

## Queries(值得留的查询)

_待积累_

## 最近 7 天改动

_见 [[log]]_

## 📊 Vault 速览(Dataview)

```dataview
TABLE title, type, updated
FROM ""
WHERE type = "meta" OR type = "concept"
SORT updated DESC
```

> ⚠️ 必须包在 \`\`\`dataview \`\`\` 里!裸写的 TABLE 不会渲染。
> 上面这行如果看到表格 = Dataview 装对了 ✅