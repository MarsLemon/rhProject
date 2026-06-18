---
title: Tools 索引
created: 2026-06-18
updated: 2026-06-18
type: meta
tags: [meta, index, tool]
sources: []
confidence: high
---

# Tools 索引

> 这里放每个工具的**详细使用笔记 / 经验 / 踩坑**。
> **总览**（5 组件关系）见 [[INVENTORY]]。

## 跟 Hermes 说的"魔法词"

> 主人不知道该说啥时,直接念这句,小马会照做。
> 详细流程见 [[hermes-obsidian-workflow]]。

| 主人说 | 小马做什么 |
|---|---|
| "**小马消化 inbox**" | 读 00-Inbox/ 下所有文件,按 SCHEMA § 工作流 SOP 分流到 21-fix-plans-修复经验/20-concepts-已消化笔记/raw |
| "**小马 vault 里有没有 xx**" | 读 index + search_files 找 xx,引用找到的页 |
| "**小马存一下**" | 把当前对话里主人指定的某条内容写进 00-Inbox/ |
| "**小马 lint vault**" | 按 llm-wiki skill 的 lint 流程跑一遍(孤页/坏链/frontmatter/矛盾) |
| "**小马转成 fix-plan**" | 把当前对话里的 bug/修复方案按 21-fix-plans-修复经验/0.规约 写成新文件 |
| "**小马这周 vault 总结**" | 生成 31-queries-查询归档/YYYY-MM-DD-本周总结.md(本周新增/常被引/坑复盘) |

## 实体页

- [[INVENTORY]] —— 5 组件工具栈总览

## 待补（计划写但还没动笔）

- [ ] [[qoder]] —— Qoder + repowiki 用法细节
- [ ] [[vscode-claude-plugin]] —— VSCode + Claude Code 插件配置 / 快捷键 / 联调后端的姿势
- [ ] [[claude-code-cli]] —— Claude Code CLI 三模式（-p / tmux / -w）+ 派发规约
- [ ] [[terminal]] —— 终端常用命令 / 后台挂服务 / nohup vs tmux
- [ ] [[hermes-desktop]] —— Hermes 调度常用模式（cron / delegate / session_search）
