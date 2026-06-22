---
title: 2026-06-19 GitHub 早报
created: 2026-06-19
updated: 2026-06-19
type: summary
tags: [ai, methodology, daily]
status: inbox
---

# 2026-06-19 · GitHub 早报

## 今日 Top 6

| # | 项目 | 今日★ | 总★ | 类别 | 一句话价值 |
|---|---|---:|---:|---|---|
| 1 | [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | 2,322 | 7,022 | 工具/MCP | 纯 C 写的代码知识图谱引擎,3 分钟索引 Linux 内核,14 个 MCP 工具,11 个 Agent 即插即用 |
| 2 | [obra/superpowers](https://github.com/obra/superpowers) | 1,429 | 232,402 | 方法论/Skills | 编码 Agent 的技能包 + Spec-Driven 流程,Claude Code/Codex/Cursor 等 8+ harness 通吃 |
| 3 | [Kilo-Org/kilocode](https://github.com/Kilo-Org/kilocode) | 1,345 | 22,125 | 编码 Agent | 500+ 模型开放路由的 VS Code/JetBrains/CLI Agent,无 API key 起步、零加价 |
| 4 | [google-research/timesfm](https://github.com/google-research/timesfm) | 844 | 23,152 | 基础模型/时序 | Google 出的时序预训练基础模型,zero-shot 预测、不用专门训练 |
| 5 | [n0-computer/iroh](https://github.com/n0-computer/iroh) | 369 | 10,002 | 网络栈/Rust | 用"dial keys"替代 IP 的模块化网络栈,P2P 场景不再需要服务器中转 |
| 6 | [alibaba/zvec](https://github.com/alibaba/zvec) | 259 | 11,212 | 基础设施/向量库 | 进程内嵌入式向量数据库,轻量到嵌入应用,补齐本地 RAG 最后一公里 |

> 过滤:freeCodeCamp/Kong/Plane/dotnet-aspnetcore/mattermost 这类成熟或教程型仓库一律不进 Top。

---

## 概念 · 今日主流化的新东西

### **Long-Horizon Agentic Engineering · 长程智能体工程**

GLM-5.1/5.2 的 README 把"Agentic Engineering"作为新一代旗舰定位:**模型不再"快闪发挥后撞墙",而是在数百轮迭代、几千次工具调用里持续优化策略**。配合 1M 上下文 + IndexShare 稀疏注意力,Agent 终于能在不烧光算力的前提下跑长任务。

**为什么重要**:前端时代你写组件、写交互;Agent 时代你写工作流、设计长程任务。GLM-5.2 在 Terminal-Bench 2.1 上 81.0 逼近 Claude Opus 4.8(85.0),意味着开源模型首次在"长程工程任务"这个核心战场摸到闭源脚踝。 ([zai-org/GLM-5](https://github.com/zai-org/GLM-5))

### **Programmable Agent Harness · 可编程的 Agent 套件**

Flue 框架的 README 明确说"不是又一个 SDK"——它把 Claude Code 那种"真 Agent 跑通"的架构抽象成 TypeScript 可编程单元:**Agent = 模型 + 工具 + 技能 + 沙箱 + 指令**,支持子 Agent 委派、长任务持久化、Slack/GitHub 事件通道接入。Superpowers + Kilo + Flue 三个仓库同日爆,说明 "Agent 框架"作为独立工程品类已经站住。

**为什么重要**:对前端转全栈的你,这是把 Vue 组件式思维搬到 Agent 时代——每个 Agent 是一个可组合的"路由处理器",可测试、可观测、可部署到 Node/边缘。 ([withastro/flue](https://github.com/withastro/flue))

### **Codebase Knowledge Graph via MCP · 代码库知识图谱**

codebase-memory-mcp 用 tree-sitter 解析 158 种语言 + Hybrid LSP 给 9 种主流语言做语义类型解析,产出**函数/类/调用链/跨服务 HTTP 路由的持久知识图谱**。效果数据:5 个结构化查询只用 ~3,400 tokens(传统 grep/read 路径要 ~412,000),减 120 倍。

**为什么重要**:Agent 时代最大的瓶颈是"上下文不够",但真正的解法不是塞更长上下文,而是让 Agent 能用**结构化查询**替代"读一堆文件"。这是 RAG 之后的下一波工程化:把代码本身结构化,让 Agent 像查 SQL 一样查代码库。([DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp))

---

## 能力 · 今天/本周能动手的 3 件事

| 能力 | 抓手 | 用时 |
|---|---|---|
| **把 Kilo Code 装进 VS Code,挑个陌生项目跑一次 500+ 模型路由** | VS Code 里装 `kilocode.Kilo-Code` 扩展,建账号,选一个你最近没碰过的 repo 跑"先解释后改 Bug";切 2 个不同模型(比如 Sonnet 4.6 + Gemini 3.1)看输出差异 | 30 分钟首装 + 20 分钟体验 |
| **给 Claude Code 装 Superpowers,体验 Spec-Driven 流程** | 在 Claude Code 里跑 `/plugin marketplace add obra/superpowers-marketplace` → `/plugin install superpowers@obra-superpowers`,下次开新需求时让 Agent 先问 spec,不要直接出代码 | 10 分钟安装 + 1 个真实任务练手 |
| **用 codebase-memory-mcp 索引自己的主力项目,体验结构化查询** | 下载对应平台 binary,跑 `./install`,重启 Agent,让它用 `search`/`trace`/`impact` 工具查"这个函数被谁调用",对比纯 grep 的 token 消耗 | 40 分钟首次索引 + 15 分钟熟悉查询 |

---

[每日早报 · 完成]
