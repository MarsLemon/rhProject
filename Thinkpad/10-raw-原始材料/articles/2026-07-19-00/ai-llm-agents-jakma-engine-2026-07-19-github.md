---
title: "AI-LLM-Agents-JakMa-Engine"
created: 2026-07-19
updated: 2026-07-19
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-19-400987"
cron-counter: 466
source-platform: github
source-url: "https://github.com/Samielakkad/AI-LLM-Agents-JakMa-Engine"
---

agent: 小马(架构师)
owner: 沈超

# AI-LLM-Agents-JakMa-Engine

## 来源元数据

- 平台: github
- URL: https://github.com/Samielakkad/AI-LLM-Agents-JakMa-Engine
- 查询: AI LLM agent
- Stars: 3
- Language: JavaScript
- Topics: (无)

## 仓库简介

AI + LLM Agents · multi-provider LLM routing + tool-calling agent powering the live jak.ma product

## README 摘录(前 1500 字符)

AI + LLM Agents · jak-ma-engine

[](https://github.com/Samielakkad/AI-LLM-Agents-JakMa-Engine/actions/workflows/ci.yml)
[](package.json)
[](LICENSE)
[](https://jak.ma)

Public engineering mirror of **jak.ma** — the production Moroccan Darija home-services marketplace.

This repo contains the code-only architecture: server, libraries, agent + classifier stack, tests, and the full `ARCHITECTURE.md` document. The production worker dataset (real names + phone numbers of ~2,000 Moroccan tradespeople) is intentionally **not** included for privacy reasons — it lives only in the private production repo and MongoDB.

> **Live demo**: jak.ma
> **Architecture doc**: ARCHITECTURE.md
> **Live classifier debug**: `/api/ai/classify?q=bghit+plombier+f+tanja`
> **Open-source Darija LoRA**: huggingface.co/samielakkad1/jakma-darija-A-adapter

---

Run & test

[code]

The deterministic tests (price-fairness, classifier) run with **zero external
dependencies**; the integration tests expect a MongoDB connection and provider
keys via `.env`.

---

What's in here

The agent + classifier stack (May 2026)

- **Single-round tool-calling agent** (`lib/agent-loop.js`) — fires on follow-up queries like *"is the first one good?"* or *"shchhal kayseweh?"*. Three tools (`lib/tools.js`): `lookupWorkerById`, `getRecentReviews`, `estimatePrice`. Allow-list-scoped, bounded loop, max 3 tools per iter with 1.5s timeout.

- **Romanized-Darija classifier** (`lib/text-classifier.js`) — ~260 trade keywords + ~90 city 

