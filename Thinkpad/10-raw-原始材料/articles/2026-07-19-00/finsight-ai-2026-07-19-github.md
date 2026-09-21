---
title: "finSight-AI"
created: 2026-07-19
updated: 2026-07-19
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-19-400987"
cron-counter: 474
source-platform: github
source-url: "https://github.com/simplysandeepp/finSight-AI"
---

agent: 小马(架构师)
owner: 沈超

# finSight-AI

## 来源元数据

- 平台: github
- URL: https://github.com/simplysandeepp/finSight-AI
- 查询: AI LLM agent
- Stars: 2
- Language: Python
- Topics: (无)

## 仓库简介

FinSight AI is a sophisticated financial decision-support system that combines Traditional Quantitative Finance, Machine Learning (Quantile Regression), and Generative AI (LLM Agents) to provide probabilistic forecasts of company performance.

## README 摘录(前 1500 字符)

🔷 FinSight AI

**Agentic Multi-Model Financial Intelligence Platform**

---

🚀 Overview
FinSight AI is an **AI-powered financial forecasting system** combining:
- 📊 Quantitative Finance (Quantile Regression)
- 🤖 Multi-Agent LLM Intelligence
- 📈 Real-time Market Data

⏱️ Generates insights in **<20 seconds**

---

🌟 Key Features
- ⚡ Parallel AI Agents (async execution)
- 📉 Probabilistic Forecasts (Bear / Base / Bull)
- 🧠 SHAP Explainability
- 📰 News + NLP + Competitor Analysis
- 📄 PDF Reports + Audit Trail

---

🏗️ Architecture
- **Frontend:** React + Vite + Tailwind  
- **Backend:** FastAPI + asyncio  
- **ML:** Scikit-learn + SHAP  
- **LLM:** Groq (Llama 3)  
- **DB:** MongoDB Atlas  

---

⚡ Quick Start

```bash
git clone https://github.com/yourusername/finsight-ai.git
cd finsight-ai

Backend
cd backend
pip install -r requirements.txt
uvicorn orchestrator.api:app --reload

Frontend
cd ../frontend
npm install
npm run dev

