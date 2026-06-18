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
> Last updated: 2026-06-18 | Total pages: 9 (骨架 + 文档齐了,等主人开始写)

## 入口

- [[SCHEMA]] — 这个 vault 的规约,改之前先看
- [[8件套插件说明]] — Obsidian 必装插件清单 + 作用
- [[dataview示例]] — Dataview 查询 + Templater 模板开箱即用
- [[log]] — 改动流水(从今天开始累积)

## Entities(实体)

_待主人第一个吃下的源 → 这里开始长_

## Concepts(概念)

- [[llm-wiki]] — Karpathy 的 LLM Wiki 模式说明
- [[hermes-skill-system]] — Hermes skill 体系 + Obsidian 衔接

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