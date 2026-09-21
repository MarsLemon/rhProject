---
title: "agent-tasks-template"
created: 2026-07-16
updated: 2026-07-16
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-16-401370"
cron-counter: 373
source-platform: github
source-url: "https://github.com/redhat-vmeperf/agent-tasks-template"
---

agent: 小马(架构师)
owner: 沈超

# agent-tasks-template

## 来源元数据

- 平台: github
- URL: https://github.com/redhat-vmeperf/agent-tasks-template
- 查询: AI LLM agent
- Stars: 3
- Language: ?
- Topics: (无)

## 仓库简介

AI/LLM Agent Tasks Template

## README 摘录(前 1500 字符)

agent-tasks-template

A template repository that provides a structured set of tasks, skills, and commands for AI/LLM agents to process. Use this repo as a starting point for new projects that leverage AI-assisted software development workflows.

Goals

This template provides a framework for AI/LLM agents to follow structured workflows when performing software engineering tasks. The included configuration defines:

- **Agent roles** with specialized responsibilities (architect, engineer, reviewer, etc.)
- **Pipelines** that define multi-gate processes (SDLC, Jira) with human approval gates
- **Skills** that invoke pipelines from platform-specific entry points
- **Shared context** (personality, lessons learned, requirements) that agents load before each task
- **A Cynefin-based classification system** to match response strategy to problem complexity

Platform Support

- **Claude Code** — fully supported via `.claude/` configuration
- **Cursor IDE** — fully supported via `.cursor/rules/` configuration
- **OpenCode** — fully supported via `.opencode/` configuration and `opencode.json`

Quickstart

[code]

Repository Structure

[code]

License

This project is released under the Unlicense.

