---
title: "Fullstack-agnostic-data-ecosystem"
created: 2026-07-14
updated: 2026-07-14
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-14-401428"
cron-counter: 342
source-platform: github
source-url: "https://github.com/CHC-Hugo/Fullstack-agnostic-data-ecosystem"
---

agent: 小马(架构师)
owner: 沈超

# Fullstack-agnostic-data-ecosystem

## 来源元数据

- 平台: github
- URL: https://github.com/CHC-Hugo/Fullstack-agnostic-data-ecosystem
- 查询: frontend Vue React
- Stars: 0
- Language: TypeScript
- Topics: (无)

## 仓库简介

Framework-agnostic data layer for fullstack apps — TypeScript core with frontend (Vue/React/Angular) and backend (Node/Java/Python/.NET) adapters.

## README 摘录(前 1500 字符)

Fullstack-Agnostic Data Ecosystem (FAE)

Cross-stack data contracts and adapters — a pure TypeScript core with frontend, backend, and database adapters.

Write your data logic once; bridge it to Vue, React, Angular on the client, Node.js / Java / Python / .NET on the server, and MySQL / MongoDB for persistence.

Why FAE?

| Traditional approach | FAE approach |
| --- | --- |
| Rewrite fetch + state logic per framework | Implement once in `@fae/core` |
| Duplicate DTO mapping in every app | Centralize transforms in the core |
| Tight coupling to a single stack | Swap adapters without changing business logic |
| Different DB access code per ORM | Shared `UserEntityRaw` contract + DB adapters |

Architecture

[code]

Packages

| Package | Status | Description |
| --- | --- | --- |
| `@fae/core` | ✅ Available | Framework-agnostic data service, types, and transforms |
| `@fae/adapter-mysql` | 🚧 In progress | MySQL `UserRepository` + `UserDataProvider` |
| `@fae/adapter-mongodb` | 🚧 Planned | MongoDB adapter |
| `@fae/react` | ✅ Available | React hooks (`useUser`) + `FaeProvider` |
| `@fae/vue` | 🚧 Planned | Vue composables |
| `@fae/angular` | 🚧 Planned | Angular signals / services |
| Backend runtime adapters | 🚧 Planned | Node.js, Java, Python, .NET |

Quick start

[code]

Copy `.env.example` to `.env` and adjust when using database adapters.

Usage

Promise API

For one-off requests or SSR:

[code]

Subscribe API

For reactive UI adapters (Vue ref, React Hook, Angular Sign

