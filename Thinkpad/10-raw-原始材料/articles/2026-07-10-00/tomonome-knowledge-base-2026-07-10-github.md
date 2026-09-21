---
title: "tomonome-knowledge-base"
created: 2026-07-10
updated: 2026-07-10
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-10-402180"
cron-counter: 127
source-platform: github
source-url: "https://github.com/modagavr/tomonome-knowledge-base"
---

agent: 小马(架构师)
owner: 沈超

# tomonome-knowledge-base

## 来源元数据

- 平台: github
- URL: https://github.com/modagavr/tomonome-knowledge-base
- 查询: AI LLM agent
- Stars: 7
- Language: Shell
- Topics: (无)

## 仓库简介

Structured marketing knowledge base optimized for AI, LLMs, agents, and prompt workflows. Modular, reusable, and high-density content for sales, marketing, and copywriting.

## README 摘录(前 1500 字符)

Marketing Knowledge Base

[](https://tomonome.com)

A structured, modular knowledge base designed for AI systems, large language models (LLMs), and agent-based workflows. Contains reusable, high-density marketing, sales, and copywriting knowledge optimized for prompt engineering and automation.gned for use with AI systems, agents, and prompt-based workflows.

Purpose
- Serve as a source of truth for marketing, sales, and growth knowledge
- Provide reusable, LLM-optimized content
- Enable modular usage across tools, chats, and APIs

Structure

/knowledge
Core structured knowledge, organized by domain.
- sales/
- marketing/
- copywriting/
- frameworks/
- index.md (complete knowledge index)

Each file:
- Covers one concept
- Is self-contained
- Includes metadata for retrieval and reuse

See @knowledge/index.md for a complete list of all knowledge entries.

/modules
Optional extracted modules for direct prompt insertion.

/compressed
Highly condensed versions of the knowledge base for direct use in chats.

/skills
Agent behaviors, instructions, and prompt logic.

Usage

For humans
Navigate by domain and topic.

For AI / prompts
- Use individual files as modular context
- Combine multiple files when needed
- Prefer compressed versions when context size is limited

Design Principles
- Atomic knowledge units
- High information density
- Minimal redundancy
- Optimized for LLM consumption

Adding New Knowledge

Each knowledge unit must follow a standard structure to ensure consistency

