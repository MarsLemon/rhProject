---
title: hermes-skill-system
created: 2026-06-18
updated: 2026-06-18
type: concept
tags: [ai, hermes, methodology]
sources: [Hermes skill: autonomous-ai-agents/hermes-agent]
confidence: high
---

# Hermes Skill 系统

> Hermes = 会写"操作手册"给自己看的小马。
> 每做一件 5+ 步 / 经常重复 / 踩过坑的事,写一份 skill 留底,以后自动加载。

## skill 长什么样

```markdown
---
name: skill-名
description: 什么时候触发
platforms: [windows, macos, linux]
---

# 标题

## 步骤
1. ...
2. ...

## 坑
- ...

## 验证
- ...
```

存放在 `~/.hermes/skills/` 下,触发条件命中时自动加载到上下文。

## 怎么跟 Obsidian 衔接

| 场景 | 用什么 |
|---|---|
| 小马写笔记 / 整理资料 | `llm-wiki` skill + Obsidian 渲染 |
| 小马出图 / 画架构 | `excalidraw` skill + `.excalidraw.md` 文件放 vault |
| 主人想"按 skill 的方式"管笔记 | 复制 skill 模板到 vault 当模板源 |

## 跟本 vault 的关系

`8件套插件说明` 和 `dataview示例` 都是**给主人看的小马 skill** —
主人能直接用,不用走 Hermes 加载机制,但内容跟真 skill 一样结构化。

## 相关

- [[llm-wiki]]
- [[SCHEMA]]
- [[8件套插件说明]]
