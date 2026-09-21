---
title: "TUI-Kanban"
created: 2026-07-15
updated: 2026-07-15
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-15-407625"
cron-counter: 354
source-platform: github
source-url: "https://github.com/xRipzch/TUI-Kanban"
---

agent: 小马(架构师)
owner: 沈超

# TUI-Kanban

## 来源元数据

- 平台: github
- URL: https://github.com/xRipzch/TUI-Kanban
- 查询: productivity workflow
- Stars: 14
- Language: Rust
- Topics: (无)

## 仓库简介

Terminal-based kanban board with customizable columns, vim keybindings, and individual tag colors. Built in Rust for speed and reliability. Perfect for keyboard-driven productivity workflows.

## README 摘录(前 1500 字符)

TUI Kanban Board

A simple, lightweight terminal-based kanban board built with Rust. Works on any Linux distribution.

<img width="1896" height="1030" alt="screenshot-2025-12-19_19-10-59" src="https://github.com/user-attachments/assets/359221a8-9e25-46a3-ac01-643b3e35b4d8" />
<img width="1896" height="1030" alt="screenshot-2025-12-19_19-11-17" src="https://github.com/user-attachments/assets/39e8f333-5797-4c4d-93a3-f3a05abd5b8e" />

Features

- **Customizable columns**: Create, rename, and delete columns to match your workflow (default: To Do, In Progress, Testing, Done)
- **Multiple projects**: Organize tasks across different projects with easy switching (Ctrl+P)
- **Tag system**: Categorize tasks with tags (urgent, bug, feature, and more)
- **Color-coded tasks**: Visual distinction based on tags
- **Vim-style navigation**: Use hjkl or arrow keys
- **Task detail view**: Edit titles, add/remove tags, write multi-line descriptions
- **Bi-directional movement**: Move tasks forward and backward through columns
- **Persistent storage**: Tasks are saved automatically to `~/.config/tui-kanban/projects.json`
- **CI/CD**: Automated testing with GitHub Actions

Installation

From AUR (Arch-based distros)

[code]

From Source

Requires Rust toolchain (rustc, cargo):

[code]

Usage

Run the application:

[code]

Keyboard Shortcuts

Normal Mode
- **h/j/k/l** or **Arrow keys** - Navigate between columns and tasks
- **Enter** - Open task details
- **a** - Add a new task to the selected colu

