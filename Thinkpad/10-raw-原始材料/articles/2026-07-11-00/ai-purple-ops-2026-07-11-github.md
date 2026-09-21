---
title: "AI-Purple-Ops"
created: 2026-07-11
updated: 2026-07-11
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-11-401209"
cron-counter: 177
source-platform: github
source-url: "https://github.com/tyrianinstitute/AI-Purple-Ops"
---

agent: 小马(架构师)
owner: 沈超

# AI-Purple-Ops

## 来源元数据

- 平台: github
- URL: https://github.com/tyrianinstitute/AI-Purple-Ops
- 查询: AI LLM agent
- Stars: 5
- Language: Python
- Topics: (无)

## 仓库简介

Unified AI/LLM/Agentic security testing CLI. Orchestrates Promptfoo, Garak, PyRIT under one harness with OWASP Agentic Top 10 coverage and compliance-ready evidence packs.

## README 摘录(前 1500 字符)

<p align="center">
  <img src="branding/logo.webp" alt="aipop" width="400">
</p>

<p align="center">
  <img src="branding/demo-3guard-bypass.svg" width="800" alt="aipop fuzz — live dashboard bypassing 3 guardrails with morphed payloads">
</p>

<p align="center">
  <code>pip install aipop</code> · Python 3.11+ · <a href="https://academy.tyrianinstitute.com">docs</a>
</p>

---

AI security testing CLI. Recon, scan, fuzz, chain, gate.

Quick start

[code]

What it does

**`scan`** — recon + injection testing in one command. Fingerprints the framework, probes for RAG/tools/memory, detects guardrails, then runs targeted tests. Returns findings with confidence levels.

**`fuzz`** — indirect prompt injection via document upload. Crafts poisoned PDFs with hidden text, metadata injection, or annotation payloads. Uploads to the target's RAG pipeline, triggers with a benign query, catches leaked data. Starts a local callback listener for OOB exfil proof.

**`run`** — batch test execution against any LLM. 250+ built-in test cases across 19 suites. Adapters for OpenAI, Anthropic, Ollama, Bedrock, MCP, or any HTTP endpoint.

**`chain`** — multi-step attack sequences defined in YAML. Upload → wait → trigger → classify. Ship your own chains or use the 5 built-in templates.

**`gate`** — CI/CD quality gate. Fails the build if critical findings exist. Generates evidence packs with OWASP, MITRE ATLAS, and CVSS mappings. Exports to Ghostwriter, Dradis, or PDF.

The scan output

[code]

Findings 

