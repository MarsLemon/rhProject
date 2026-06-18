---
title: llm-wiki
created: 2026-06-18
updated: 2026-06-18
type: concept
tags: [ai, knowledge-base, methodology]
sources: [Hermes skill: research/llm-wiki]
confidence: high
---

# LLM Wiki(Karpathy 模式)

> 一句话:**把 AI 当实习生,让它持续整理你看到的东西**,存成可链接的 markdown,而不是每次 RAG 临时抓。

## 为什么不用普通 RAG

| | 普通 RAG | LLM Wiki |
|---|---|---|
| 知识沉淀 | 每次重新解析,不能累积 | 解析一次,持续更新 |
| 跨源整合 | 通常只查 top-k 段 | 全 wiki 可链接 + 矛盾标记 |
| 查"我之前对 X 的理解" | 查不到,只能查"X 是什么" | 任何 wiki 页都是"我理解过的版本" |
| 改一句话 | 重新跑流程 | patch 一下 markdown |

## 三层结构

- **Layer 1 - raw/**:原始材料,只读,不可改
- **Layer 2 - entities/ concepts/ comparisons/ queries/**:AI 整理的页面,可改
- **Layer 3 - SCHEMA.md / index.md / log.md**:导航 + 规约

## 跟 Obsidian 的衔接

- vault 目录 = wiki 目录
- `[[wikilinks]]` 双向链接
- Dataview 查 frontmatter 字段
- Graph View 看知识图谱

## 跟 Hermes 的衔接

- `llm-wiki` skill 已经实现了 ingest / query / lint 三个核心动作
- 主人(用户)→ 拍板"这篇要消化" → Hermes → 写页面 → 改 index + log
- 下次查询直接读 wiki,不是 web 搜

## 关键纪律

1. **不要跳"先读 SCHEMA + index + 最近 log"** — 会造出重复页、漏交叉引用
2. **每页最少 2 个 wikilink** — 孤页 = 死页
3. **frontmatter 必填** — 否则 Dataview 查不到
4. **原始材料不修改** — 错的解读放 wiki 页,不改 raw

## 相关

- [[hermes-skill-system]]
- [[SCHEMA]]
- [[index]]
