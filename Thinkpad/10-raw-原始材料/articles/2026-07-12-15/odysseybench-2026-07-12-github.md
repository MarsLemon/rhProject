---
title: OdysseyBench
created: 2026-07-12
updated: 2026-07-12
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-12-401259"
cron-counter: 260
source-platform: github
source-url: "https://github.com/microsoft/OdysseyBench"
---

agent: 小马(架构师)
owner: 沈超

# OdysseyBench

## 来源元数据

- 平台: github
- URL: https://github.com/microsoft/OdysseyBench
- 查询: productivity workflow
- Stars: 14
- Language: Jupyter Notebook
- Topics: (无)

## 仓库简介

Repo for the OdysseyBench Benchmark for Evaluating Agent Memory on Long-horizon Productivity Workflows

## README 摘录(前 1500 字符)

OdysseyBench: Evaluating LLM Agents on Long-Horizon Complex Office Application Workflows

OdysseyBench is a comprehensive benchmark and evaluation suite for task-oriented agent systems, supporting both the OdysseyBench+ and OdysseyBench-Neo tracks. This project provides tools for task generation, execution, validation, and in-depth evaluation of agent performance, with a focus on memory and retrieval-augmented generation (RAG) capabilities.

💼 Preparation

[code]

🛠️ Setup

[code]

---

📁 Tasks Directory Structure

- **/tasks/substasks_plus**: Tasks for OdysseyBench+
- **/tasks/chat_histories_plus**: Dialogues for OdysseyBench+

- **/tasks/substasks_neo**: Tasks for OdysseyBench-Neo
- **/tasks/chat_histories_neo**: Dialogues for OdysseyBench-Neo

- **/tasks/outputs/**: Results of task execution

- **/tasks/testbed/**: Files required for task execution

---

📊 Evaluation on OdysseyBench

Configuration

Edit `config/base_config.yaml`:

[code]

- **Long-Context Evaluation:**  
  Set `mode: raw_chat` to include all dialogues in the prompt (ignores `rag_mode` and `top_k`).
- **RAG Evaluation:**  
  - For raw context: set `rag_mode` to `dialoguesession` or `dialogueutterance`.
  - For summary: set `rag_mode` to `summarysession` or `summarychunk`.

---

Run Evaluations

OdysseyBench+

[code]

OdysseyBench-Neo

[code]

---

🚀 Run HomerAgents+

[code]

🚀 Run HomerAgents-Neo

🪄 Generate Synthesized Tasks

[code]

🧱 Quality Verification

- **Cross Validation**

Select the inters

