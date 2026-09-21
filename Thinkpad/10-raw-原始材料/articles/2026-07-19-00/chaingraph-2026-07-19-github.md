---
title: chaingraph
created: 2026-07-19
updated: 2026-07-19
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-19-400987"
cron-counter: 460
source-platform: github
source-url: "https://github.com/chaingraphlabs/chaingraph"
---

agent: 小马(架构师)
owner: 沈超

# chaingraph

## 来源元数据

- 平台: github
- URL: https://github.com/chaingraphlabs/chaingraph
- 查询: AI LLM agent
- Stars: 15
- Language: TypeScript
- Topics: (无)

## 仓库简介

ChainGraph is a source available, type-safe flow-based programming framework for building AI LLM agents with complex logic and dynamic computational graphs.

## README 摘录(前 1500 字符)

ChainGraph v2

[](LICENSE.txt)

ChainGraph is a source-available, flow-based programming framework that empowers developers to visually design, execute, and manage complex computational graphs. Whether you're building custom AI agents, data processing pipelines, or collaborative automation systems, ChainGraph's modular architecture, strong type-safety guarantees, and real-time features help you build robust workflows efficiently.

> **Disclaimer:** This version is intended for demonstration and experimentation purposes only. The API and internal architecture are still evolving, and breaking changes may occur as new features are added and improvements are made.

Table of Contents

- Key Features
- Architecture & Technologies
- Getting Started
- Installation
- Running in Development Mode
- PostgreSQL Database Storage
- Building for Production
- Docker & Docker-compose
- Project Structure
- Contributing
- Development Tools
- Current Limitations & Work-In-Progress
- Release Process
- Developer Documentation
- License

Key Features

- **Type-Safe Port System:**
  Supports a rich set of port types including primitives (string, number, boolean) and complex types (arrays, objects, streams, enums). Each port is defined with its own configuration and runtime validation (via Zod and SuperJSON) and employs both lazy instantiation and caching for optimal memory usage.

- **Modular and Extensible Nodes:**
  Create custom nodes using decorators and metadata. Nodes feature multiple input and

