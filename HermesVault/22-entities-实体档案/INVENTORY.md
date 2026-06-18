---
title: 工具栈 INVENTORY
created: 2026-06-18
updated: 2026-06-18
type: entity
tags: [tool, project, workflow]
sources: [E:\rhProject\research\2026-06-18-让Hermes更聪明更实用-调研.md]
confidence: high
---

# 工具栈 INVENTORY

> 5 组件工具栈（2026-06-18 拍板）。完整调研见 `E:\rhProject\research\2026-06-18-让Hermes更聪明更实用-调研.md`。

## 一句话版

**Qoder 出知识、VSCode+Claude 插件写代码、Claude Code CLI 跑重型、终端挂服务、Hermes 调度全局。**

## 5 组件详表

| # | 角色 | 工具 | 主用途 | 不做什么 |
|---|---|---|---|---|
| 1 | **知识源** | [[qoder]] | 提供 repowiki 业务字典 | 不直接写代码 |
| 2 | **编码（IDE 内）**| [[vscode-claude-plugin]] | 写前端 / debug 后端 | 不跑重型批处理 |
| 3 | **编码（CLI）**| [[claude-code-cli]] | 纯编码、重型 / 长上下文 | 不做 IDE 实时编辑 |
| 4 | **跑服务** | [[terminal]] | 启前后端 / 挂接口 | 不写业务代码 |
| 5 | **调度 / 协调** | [[hermes-desktop]] | 跨工具链、cron、委派 | 不替代 IDE 编辑 |

## 已退役

| 工具 | 退役时间 | 原因 | 替代 |
|---|---|---|---|
| **IDEA** | 2026-06 | Java 专业 IDE 加成被 VSCode + Claude Code 插件稀释 | VSCode + Claude Code 插件 |
| **Cursor** | 2026-06 | 被 Qoder（知识）+ VSCode+Claude 插件（编码）拆分替代 | Qoder + VSCode |

## 上下游

- **CCSwitch**：模型网关，5 组件底层共享 MiniMax-M3
- **Obsidian Vault（本 vault）**：工具栈快照 + 业务知识
- **Filesystem MCP**：让 Hermes 直接读 / 写本 vault

## 变更记录

| 日期 | 变更 | 决策原因 |
|---|---|---|
| 2026-06-18 | 初版：5 组件工具栈（Qoder / VSCode+Claude 插件 / Claude Code CLI / 终端 / Hermes）| 旧 5 客户端（IDEA / Cursor / Qoder / Claude Code / Hermes）中 IDEA、Cursor 加成不够，被新组合拆分替代 |
