---
title: "noteplan-plugin"
created: 2026-07-19
updated: 2026-07-19
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-19-000789"
cron-counter: 524
source-platform: github
source-url: "https://github.com/clkao/noteplan-plugin"
---

agent: 小马(架构师)
owner: 沈超

# noteplan-plugin

## 来源元数据

- 平台: github
- URL: https://github.com/clkao/noteplan-plugin
- 查询: productivity workflow
- Stars: 2
- Language: Python
- Topics: (无)

## 仓库简介

NotePlan productivity workflows for Claude Code

## README 摘录(前 1500 字符)

NotePlan Companion Plugin

A Claude Code plugin that provides productivity workflows for NotePlan.

Features

Commands

| Command | Description |
|---------|-------------|
| `/noteplan:file-inbox` | File unfiled tasks from inbox to project notes |
| `/noteplan:weekly-plan` | Plan the upcoming week (best on Monday) |
| `/noteplan:weekly-review` | Review and close out the week (best on Friday) |
| `/noteplan:scan-past-due` | Find and handle overdue tasks |
| `/noteplan:analyze-sessions` | Analyze Claude Code usage for weekly review |

Skills

- **noteplan-productivity** - Knowledge of the NotePlan productivity system including tag scheme, file naming conventions, and workflows

Agents

- **productivity-assistant** - Proactively suggests workflows when in NotePlan directory based on day of week and context

Hooks

- **SessionStart** - Detects NotePlan directory and reminds about available workflows

Installation

Option 1: From GitHub (Recommended)

In Claude Code, first add the marketplace:
[code]

Then install the plugin:
[code]

Option 2: Local Plugin Directory

[code]

Option 3: Copy to Project

[code]

Requirements

- Must be run from within the NotePlan data directory (or a symlink to it)
- NotePlan data directory should have:
  - `Notes/00 - Projects/TBL.md` with Active Projects section
  - `Calendar/` directory with daily/weekly notes
  - `CLAUDE.md` for context

Tag Scheme

| Tag | Meaning |
|-----|---------|
| `@waiting` | Blocked, ball in someone else's court |
| `@ar

