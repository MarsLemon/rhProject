---
title: "xhs-paper-promotion"
created: 2026-07-14
updated: 2026-07-14
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-14-401407"
cron-counter: 330
source-platform: github
source-url: "https://github.com/Kwwwww74/xhs-paper-promotion"
---

agent: 小马(架构师)
owner: 沈超

# xhs-paper-promotion

## 来源元数据

- 平台: github
- URL: https://github.com/Kwwwww74/xhs-paper-promotion
- 查询: AI LLM agent
- Stars: 2
- Language: JavaScript
- Topics: (无)

## 仓库简介

Generate Xiaohongshu-style Chinese explainer posts for AI, LLM, Agent, RAG, and machine learning papers.

## README 摘录(前 1500 字符)

<div align="center">

🍠 xhs-paper-promotion

**English** | 中文

Turn AI / LLM / Agent / RAG / machine learning papers into Chinese Xiaohongshu-style paper explainer posts.

[](https://github.com/Kwwwww74/xhs-paper-promotion/stargazers)
[](./LICENSE)
[](https://nodejs.org/)

</div>

This project can be used in two ways:

- as a Codex Skill
- as a standalone Node.js CLI powered by an OpenAI-compatible Responses API

✨ Features

- Generate long-form Xiaohongshu paper breakdown posts
- Support paper title, abstract, introduction, conclusion, and experiment results
- Support paper links such as arXiv abstract pages, project pages, and technical blogs
- Support Codex Skill invocation with `$xhs-paper-promotion`
- Support `.env` API configuration
- Support Codex-style config from `~/.codex/config.toml` and `~/.codex/auth.json`
- Include safety rules to avoid overstating model capability, AGI claims, deployment readiness, or unsupported benchmark results

📝 Output Style

The default output follows this structure:

[code]

📁 Project Structure

[code]

⚙️ Requirements

- Node.js 18+
- An API key for an OpenAI-compatible Responses API

No npm dependencies are required.

🧩 Use as a Codex Skill

Install the folder to:

[code]

Then restart Codex or open a new thread.

Example:

[code]

You can also provide a paper link:

[code]

🚀 Use as a CLI

Generate from an input file:

[code]

Generate from a paper link:

[code]

Generate from a link-only example file:

[code]

Save output to a f

