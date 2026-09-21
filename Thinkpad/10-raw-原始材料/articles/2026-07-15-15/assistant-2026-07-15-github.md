---
title: assistant
created: 2026-07-15
updated: 2026-07-15
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-15-407625"
cron-counter: 349
source-platform: github
source-url: "https://github.com/kcosr/assistant"
---

agent: 小马(架构师)
owner: 沈超

# assistant

## 来源元数据

- 平台: github
- URL: https://github.com/kcosr/assistant
- 查询: productivity workflow
- Stars: 87
- Language: TypeScript
- Topics: (无)

## 仓库简介

Panel-based personal assistant with a plugin architecture for productivity workflows. AI agents share a workspace of notes, lists and other panels with the user. Supports Claude Code, Codex, and pi CLI agents with text and voice interfaces. Extend with custom plugins or use built-in plugins exported as skills with CLIs.

## README 摘录(前 1500 字符)

assistant

> **⚠️ Experimental Software**
>
> This is personal software shared with the community for educational purposes.
> Qustions and contributions are welcome, but don't expect stability or support.

A personal AI assistant with a panel-based plugin system, multi-agent CLI integrations, and text/voice UI.
Plugins define panels and operations so agents can collaborate on lists, notes, and diff reviews,
or extend the app with custom user-provided plugins.
OpenAI-compatible sessions are limited in functionality today and will likely be replaced
by an integration with the badlogic/pi-mono agent SDK.

<table>
  <tr>
    <td valign="top"><img src="assets/screenshot.png" alt="Assistant Screenshot" width="600"></td>
    <td valign="top"><img src="assets/mobile.jpeg" alt="Assistant Mobile" width="200"></td>
  </tr>
</table>

Table of Contents

- Features
- Quick Start
- Repository Layout
- Documentation
- External Integrations
- Configuration
- Development
- Architecture
- License

Features

- **Text chat** with streaming responses
- **Voice input** using browser-based speech recognition (Web Speech API)
- **Voice output** via OpenAI TTS or ElevenLabs streaming TTS (optional)
- **CLI agent integrations** (Claude, Codex, Pi) alongside built-in providers
- **Scheduled sessions** for cron-driven CLI runs
- **Panel plugins** for lists, notes, diff review, and custom workflows
- **Tool integration** via MCP (Model Context Protocol) over stdio
- **Built-in session tools** – agent can 

