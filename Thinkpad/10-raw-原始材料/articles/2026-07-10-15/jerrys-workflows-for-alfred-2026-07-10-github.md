---
title: "jerrys-workflows-for-alfred"
created: 2026-07-10
updated: 2026-07-10
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-10-401171"
cron-counter: 161
source-platform: github
source-url: "https://github.com/Royaljerry/jerrys-workflows-for-alfred"
---

agent: 小马(架构师)
owner: 沈超

# jerrys-workflows-for-alfred

## 来源元数据

- 平台: github
- URL: https://github.com/Royaljerry/jerrys-workflows-for-alfred
- 查询: productivity workflow
- Stars: 9
- Language: Python
- Topics: (无)

## 仓库简介

Some productivity workflows I sporadically created thoughout the years

## README 摘录(前 1500 字符)

Jerry’s Workflows for Alfred

*Some productivity workflows I have sporadically created thoughout the years.*

RJ: Create Project

*This script creates a folder structure defined in a text file.*

Prerequisites

- Python 3.x
- Alfred Powerpack

Setup

Normally you won’t need to set it up, the workflow should work out of the box – in case you’d still need it, here is a breakdown:

The Workflow

The File Action

The Script

Usage

Create an UTF-8 encoded text file – the *definition file*, select the it in Finder (or any file manager app), get Alfred actions panel (with the hotkey set in Preferences → Features → Universal Actions → Selection Hotkey), and run **RJ: Create Project**. The folder structure will be created where the *definition file* resides.

Syntax

- One line represents a folder.
- Lines on the same indention level represent sibling folders.
- A positive indention to the previous line represents a subfolder.
- A negative indention to the previous line represents a parent folder.
- Indentions must be written with TAB characters.
- The script will replace the `%date%` string in the *definition file* with the actual date.

Example 1

Contents of the *definition file*:

[code]

Example 2

Contents of the *definition file*:

[code]

Downloads

- RJ: Create Project

Contact

Adam Pócs

- `royaljerry@gmail.com`
- Facebook
- Portfolio
- GitHub
- LinkedIn

Copyright

These workflows and scripts are licensed under The Unlicense license.

And

Free 🇺🇦 Ukraine, free 🇮🇱 Isr

