---
title: "sentry-agents"
created: 2026-07-19
updated: 2026-07-19
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-19-400987"
cron-counter: 461
source-platform: github
source-url: "https://github.com/ihoka/sentry-agents"
---

agent: 小马(架构师)
owner: 沈超

# sentry-agents

## 来源元数据

- 平台: github
- URL: https://github.com/ihoka/sentry-agents
- 查询: AI LLM agent
- Stars: 7
- Language: Ruby
- Topics: (无)

## 仓库简介

Sentry Gen AI instrumentation for AI/LLM agents in Ruby applications

## README 摘录(前 1500 字符)

Sentry Agents

[](https://badge.fury.io/rb/sentry-agents)
[](https://github.com/rubocop/rubocop)
[](https://rubygems.org/gems/sentry-agents)

Sentry Gen AI instrumentation for AI/LLM agents in Ruby applications.

Provides Sentry's AI Agents monitoring capabilities for Ruby, supporting multiple LLM providers (Anthropic, OpenAI, Cohere, Google Gemini, etc.).

Installation

Add this line to your application's Gemfile:

[code]

And then execute:

[code]

Or install it yourself as:

[code]

Requirements

- Ruby >= 3.1.0
- sentry-ruby >= 5.0.0

Configuration

[code]

Usage

Manual Instrumentation

Include the `Sentry::Agents::Instrumentation` module in any class:

[code]

Custom Provider Override

Override the default provider on a per-span basis:

[code]

Span Types

Agent Invocation (`gen_ai.invoke_agent`)

Wraps the overall agent execution lifecycle.

[code]

Chat Completion (`gen_ai.chat`)

Wraps individual LLM API calls. Automatically captures:
- Token usage (input/output tokens)
- Response text

[code]

Tool Execution (`gen_ai.execute_tool`)

Wraps tool/function executions. Captures:
- Tool name
- Tool input
- Tool output

[code]

Handoff (`gen_ai.handoff`)

Tracks stage transitions or agent handoffs.

[code]

Graceful Degradation

All instrumentation methods gracefully degrade when Sentry is not available or tracing is disabled. Your code will continue to work normally without any errors.

[code]

Development

After checking out the repo, run:

[code]

Releasing

Releases ar

