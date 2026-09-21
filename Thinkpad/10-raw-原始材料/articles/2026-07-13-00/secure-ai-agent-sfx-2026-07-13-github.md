---
title: "secure-ai-agent-sfx"
created: 2026-07-13
updated: 2026-07-13
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-13-401351"
cron-counter: 288
source-platform: github
source-url: "https://github.com/AIDevBody/secure-ai-agent-sfx"
---

agent: 小马(架构师)
owner: 沈超

# secure-ai-agent-sfx

## 来源元数据

- 平台: github
- URL: https://github.com/AIDevBody/secure-ai-agent-sfx
- 查询: AI LLM agent
- Stars: 2
- Language: Shell
- Topics: (无)

## 仓库简介

Self-extracting (SFX), encrypted context packager for AI/LLM agents — git/.gitignore-aware with redaction mapping + inverse mapping.

## README 摘录(前 1500 字符)

Secure AI Agent SFX (Self-Extracting)

[](https://github.com/sponsors/aidevbody)
[](license)

Package and **sanitize your code for AI assistants** — interactively select files, honor `.gitignore`, and **redact secrets via mapping** before sharing. The tool creates a **self‑extracting `.AI` script** that **rebuilds your project** later (and can restore original values when you provide the mapping).

---

Table of contents

- Overview
- Quick start
- Why do I need it?
- Features
- Usage
- Mapping example
- Roadmap
- Tests
- FAQ
- Security model
- Contributing & Support
- Maintainer note
- License

Overview

**Secure AI Agent SFX** helps developers safely share project code with AI assistants. It walks your repository, lets you choose exactly what to include, applies an optional mapping to replace sensitive tokens with placeholders, and builds a **standalone, self‑extracting `.AI` script** containing your selected files (Base64‑encoded). The generated agent can **reconstruct the project** and supports reversing the mapping to restore original values.

Use it when you want **gitignore‑aware packaging**, **secret redaction**, and **reproducible reconstruction** — across macOS, Linux, and Windows (Git Bash/WSL).

Quick start

[code]

See the full guide in docs/USAGE.md.

Why do I need it?

- **Protect secrets**: keep credentials and private values out of what you share.
- **Control scope**: include only what’s necessary; honor `.gitignore` by default.
- **Redact & restore**: swap s

