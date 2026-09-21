---
title: "AI-LLM-AGENT-FOR-WAZUH"
created: 2026-07-10
updated: 2026-07-10
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-10-402180"
cron-counter: 140
source-platform: github
source-url: "https://github.com/anas-elmendili/AI-LLM-AGENT-FOR-WAZUH"
---

agent: 小马(架构师)
owner: 沈超

# AI-LLM-AGENT-FOR-WAZUH

## 来源元数据

- 平台: github
- URL: https://github.com/anas-elmendili/AI-LLM-AGENT-FOR-WAZUH
- 查询: AI LLM agent
- Stars: 1
- Language: Python
- Topics: (无)

## README 摘录(前 1500 字符)

🛡️ Wazuh AI Reporter
*L'intelligence artificielle au service de votre SOC*

[](https://www.python.org/)
[](https://wazuh.com/)
[](https://ollama.com/)

**Wazuh AI Reporter** est un agent intelligent conçu pour automatiser l'analyse des alertes de sécurité. Au lieu de parcourir manuellement des milliers de lignes de logs JSON, cet outil extrait les données critiques, les fait analyser par une IA locale (**Ollama**) et vous envoie une synthèse actionnable directement par e-mail.

---

🚀 Fonctionnement en 4 étapes

| Étape | Action | Description |
| :--- | :--- | :--- |
| **1** | **Extraction SSH** | Connexion sécurisée au manager Wazuh pour récupérer les logs bruts. |
| **2** | **Tri Intelligent** | Filtrage (Niveau 5+ / 24h) et agrégation par règle et par agent. |
| **3** | **Analyse IA** | Le modèle **Llama 3** interprète les menaces et identifie les patterns d'attaque. |
| **4** | **Notification** | Génération et envoi d'un rapport HTML élégant aux administrateurs. |

---

📊 Exemple de Rapport Généré

Le rapport reçu quotidiennement transforme des données complexes en informations claires :

> 🛡️ Synthèse de Sécurité IA Wazuh
> **Date :** 06/04/2026 à 16:05:52
>
> **1. Résumé des Menaces Critiques**
> * 🔴 **Windows audit failure (Règle 60104) :** *50 027 occurrences.*
>   - 🖥️ **Hôtes :** `SRV-AD-01` (46 502), `SRV-SQL-PROD` (1 396), `DC-MASTER` (1 030).
>   - ⚠️ **Analyse :** Attaque ciblée sur les contrôleurs de domaine (Brute force suspecté).
>
> * 🔴 **Windows appl

