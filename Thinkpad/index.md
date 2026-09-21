---
title: Wiki Index
created: 2026-06-18
updated: 2026-07-07
type: meta
tags: [meta, index]
owner: 沈超
agent: Wiki 维护
---

agent: Wiki 维护
owner: 沈超

# Wiki Index

> 沈超打开 vault 第一眼看这里。
> 每一行是一个 wikilink + 一句话说明。
> Last updated: 2026-06-22 | Total pages: 60 (新增 1 = PowerShell 选型 / Hermes persona 配置 / Hermes 桌面 vs 微信客服 + vault-essence + 会话验证清单)

## 🗺️ 看这里(5 步流程图,数字 = 流程顺序)

> 左栏文件夹名带数字前缀,**数字小 → 流程靠前**。
> 想动手前先看下面 5 步,一眼能定位该往哪放 / 往哪找。

| 步骤        | 目录                      | 干啥                         | 写啥                                |
| ----------- | ------------------------- | ---------------------------- | ----------------------------------- |
| **1. 收件** | `00-Inbox/`               | 随手记(微信/小红书/脑子一闪) | 一句话、链接、截图、命令            |
| **2. 原料** | `10-raw-原始材料/`        | 调研原件,只读不改            | 文章、PDF、转写、图片               |
| **3. 笔记** | `20-concepts-已消化笔记/` | 反复出现的概念/方法/坑复盘   | 概念卡、调研总结、坑复盘            |
| **3. 笔记** | `21-fix-plans-修复经验/`  | 一次性 bug / 修复 / 漏洞     | 17 份 fix-plan + 0.规约             |
| **3. 笔记** | `22-entities-实体档案/`   | 人/项目/工具/产品的档案      | INVENTORY.md(工具栈)                |
| **3. 笔记** | `23-Tools-工具用法/`      | 工具使用笔记 / 经验 / 踩坑   | Qoder / VSCode / Claude Code CLI 等 |
| **4. 沉淀** | `30-comparisons-对比/`    | 横向对比(方案 A vs B)        | 调研究选型时写                      |
| **4. 沉淀** | `31-queries-查询归档/`    | 值得留的查询结果             | 沈超常问的问题的答                  |
| **5. 归档** | `40-_meta-归档索引/`      | 索引 / 主题地图 / 已废弃     | 整体地图、归档文件                  |

> 不知道放哪 → **扔 `00-Inbox/`**,说"小马消化 inbox",我分流。

## 入口

- [[SCHEMA]] — 这个 vault 的规约,改之前先看
-

## Inbox(待消化)

## Entities(实体)

## Concepts(概念)

## Tools(工具用法)]]

## Comparisons(对比)

_待积累_

## Queries(值得留的查询)

_待积累_

## 最近 7 天改动

_见 [[99-log/2026-07/log-2026-07]]_

## 📊 Vault 速览(Dataview)

```dataview
TABLE title, type, updated
FROM ""
WHERE type = "meta" OR type = "concept"
SORT updated DESC
```

> ⚠️ 必须包在 \`\`\`dataview \`\`\` 里!裸写的 TABLE 不会渲染。
> 上面这行如果看到表格 = Dataview 装对了 ✅
