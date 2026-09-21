---
title: "agent-runtime-patterns"
created: 2026-07-12
updated: 2026-07-12
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-12-401255"
cron-counter: 225
source-platform: github
source-url: "https://github.com/vasundras/agent-runtime-patterns"
---

agent: 小马(架构师)
owner: 沈超

# agent-runtime-patterns

## 来源元数据

- 平台: github
- URL: https://github.com/vasundras/agent-runtime-patterns
- 查询: AI LLM agent
- Stars: 15
- Language: Python
- Topics: (无)

## 仓库简介

Runtime architecture patterns for production AI/ LLM Agents. Runnable LangGraph + Google ADK code, a composed 90-day contract-renewal example, IBM Telco data, τ-bench eval harness, BYOD lab guide and 30 verified research papers.

## README 摘录(前 1500 字符)

Runtime Architecture Patterns for Agents in Production

> *Reliability is not a model property. It is an engineering problem.*
> *Drift dominates variance.*

Companion repository to the AI Council 2026 talk **"Runtime Architecture Patterns for Agents in Production"** by Vasundra Srinivasan — AI Architect Director (Salesforce), O'Reilly author of *Data Engineering for Multimodal AI*, independent researcher.

This repo packages the talk into six artifacts you can clone, read, and run:

1. **Six runnable patterns** — LangGraph by default, Google ADK where it fits better.
2. **One end-to-end example** — the 90-day contract renewal from the talk, composed from the patterns.
3. **A curated, verified bibliography** — 30 papers grounding every pattern in either distributed-systems classics or recent agent-systems research. All arXiv IDs and DOIs verified.
4. **Public data** — the IBM Telco Customer Churn dataset (7,043 real customer records, plus a fixed 100-row subset), projected into the talk's renewal state machine by `data/load_telco.py`.
5. **An eval harness** — `evals/` ships a τ-bench adapter (Yao et al., arXiv:2406.12045) so the patterns can be evaluated against a published agent-runtime benchmark with `pass^k` consistency metrics.
6. **A bring-your-own-dataset lab guide** — swap in any domain in under 15 minutes; see the BYOD lab section below.

---

The decision model: Runtime → Dimensions → Patterns

There is a specific sequence for making architecture decisions. Start at 

