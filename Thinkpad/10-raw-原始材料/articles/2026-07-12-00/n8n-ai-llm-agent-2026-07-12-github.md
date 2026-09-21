---
title: "n8n-ai-llm-agent"
created: 2026-07-12
updated: 2026-07-12
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-12-401255"
cron-counter: 232
source-platform: github
source-url: "https://github.com/ujjawalkaushik1110/n8n-ai-llm-agent"
---

agent: 小马(架构师)
owner: 沈超

# n8n-ai-llm-agent

## 来源元数据

- 平台: github
- URL: https://github.com/ujjawalkaushik1110/n8n-ai-llm-agent
- 查询: AI LLM agent
- Stars: 2
- Language: Python
- Topics: (无)

## 仓库简介

Advanced n8n AI agent with custom fine-tuned LLM powered by Azure student credits

## README 摘录(前 1500 字符)

n8n Advanced AI Agent with Custom Fine-Tuned LLM

**Build an advanced AI agent powered by n8n + your own fine-tuned LLM on Azure student credits**

🚀 Quick Start

You now have:
- ✅ **Azure Student Account** with $100+ in credits
- ✅ **GitHub Student Pack** with free tools
- 📍 **Project Repository** set up

Step 1: Fine-Tune Your LLM (Google Colab)

1.1 Open Google Colab

Go to colab.research.google.com and create a new notebook.

1.2 Install Fine-Tuning Libraries

[code]

1.3 Create Your Training Dataset

Create a file `training_data.jsonl` with instruction-answer pairs:

[code]

1.4 Fine-Tune a Small Model

[code]

1.5 Export Your Model

[code]

Step 2: Create LLM API (FastAPI + Azure)

2.1 Create `app.py`

[code]

2.2 Create `requirements.txt`

[code]

2.3 Create `Dockerfile`

[code]

Step 3: Deploy to Azure

3.1 Push to Azure Container Registry

[code]

3.2 Deploy to App Service

[code]

Your LLM API will be at: `https://my-llm-api.azurewebsites.net`

Step 4: Deploy n8n on Azure

4.1 Use n8n Docker Image

[code]

n8n will be at: `https://my-n8n.azurewebsites.net`

Step 5: Connect n8n to Your Custom LLM

In n8n UI:

1. Create a new workflow
2. Add a **Chat Model** node
3. Configure:
   - **Provider**: OpenAI (compatible)
   - **Base URL**: `https://my-llm-api.azurewebsites.net/v1`
   - **API Key**: `any-key-here` (you can add auth later)
   - **Model**: `gpt-3.5-turbo` (any name)
4. Test the connection

Step 6: Build Your First AI Agent

Example: Email Summarizer Agent

1

