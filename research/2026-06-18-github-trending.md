# GitHub 早报 · 2026-06-18

> 数据源:`github.com/trending`(daily) · `news.ycombinator.com/best`(48h) · `trendshift.io`(daily)
> 今日抓取:2026-06-18 17:00 CST · 候选池 20,过滤后保留 6 项

## Top 6 · 今日★涨幅榜

| # | 项目 | 今日★ | 总★ | 类别 | 一句话价值 |
|---|---|---:|---:|---|---|
| 1 | [mattpocock/skills](https://github.com/mattpocock/skills) | 1,523 | 134,445 | AI Agent · 工程方法 | 给 Claude Code/Codex 装"真实工程师"技能包,核心是 `/grill-me`(开干前反向拷问你需求) |
| 2 | [obra/superpowers](https://github.com/obra/superpowers) | 1,129 | 231,659 | AI Agent · 方法论 | 把编码 Agent 重塑成"先 spec → 出计划 → 子代理驱动开发"的完整工作流 |
| 3 | [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | 1,161 | 33,823 | AI Agent · 工具链 | 一行命令让 Agent 读推特/Reddit/YouTube/B站/小红书,多后端热切换 |
| 4 | [google-research/timesfm](https://github.com/google-research/timesfm) | 606 | 22,178 | AI 基础模型 | Google 出品的时间序列基础模型,零样本预测,业务侧"明天 DAU"不用再训 Prophet |
| 5 | [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | 371 | 6,175 | 编程工具 · MCP | C 写的代码知识图谱 MCP server,158 种语言毫秒级索引,token 比逐文件读少 10× |
| 6 | [n0-computer/iroh](https://github.com/n0-computer/iroh) | 421 | 9,782 | 系统 · 网络 | Rust 模块化网络栈,"IP 会坏,改用密钥拨号",为 P2P/边缘重设计连接层 |

## 概念 · 今日主流化的 3 个新东西

### **Spec-Driven Development · 让规范本身成为可执行产物**

过去需求文档是写完就扔的脚手架;GitHub 官方的 [spec-kit](https://github.com/github/spec-kit)(总★ 113k,持续上榜)把它"反"了过来——规范不再服务代码,而是代码从规范里生成。流程:`/speckit.constitution` 写项目宪法 → `/speckit.specify` 出功能规格 → `/speckit.plan` 出技术方案 → `/speckit.tasks` 拆活 → AI 按活执行。配合今日霸榜的 superpowers、mattpocock/skills,可以看出 GitHub/Anthropic/OpenAI 三家已经把"先 spec、后代码"打成行业默认。**为什么重要**:以后开新项目,先写规范再写代码,会跟今天写测试再写代码一样自然;这是一次流程范式转移。

### **Recursive Language Models(RLM)· 用"会写代码的 LLM"打破上下文长度**

[alexzhang13/rlm](https://github.com/alexzhang13/rlm)(MIT OASYS 实验室)提出新范式:别再把百万 token 一次性塞进 prompt,而是让 LLM 拿到一个 REPL 环境,把上下文当变量,自己用代码去切片、检索、**递归调用自己**。接口从 `llm.completion(prompt)` 变成 `rlm.completion(prompt)`,支持 Modal/E2B/Daytona 等隔离沙箱。**为什么重要**:这是对"上下文越长越好"的反叛。配合本地模型越来越能跑(HN 热帖《Running local models is good now》850+ 票),前端开发者也能在小机器上处理百万行级代码库上下文,直接利好 codebase-memory-mcp 这类工具落地。

### **Agent Skills · 把"个人经验"打包成 Agent 可加载的能力包**

obra/superpowers、mattpocock/skills、vercel-labs/agent-skills 三家今日同时上榜,本质相同:把"干了十年总结的工程经验"封装成 SKILL.md 文件,Agent 启动自动加载,具备 `/grill-me`(反向拷问需求)、`/test-driven-development`、`/simplify` 等工作流技能。Claude Code、Codex、Cursor、Copilot CLI、Gemini CLI 全都支持统一协议。**为什么重要**:以前用 AI 写代码是"模型能力决定一切",现在是"你装了哪些技能决定一切"——抽象层上移,跟前端从 jQuery 进 Vue/React 的转折点是一类事。

## 能力 · 今天/本周能动手的 3 件事

| 能力 | 抓手 | 用时 |
|---|---|---|
| **给 Claude Code 装一套"先对齐再写"工作流** | `npx skills@latest add mattpocock/skills` → 项目里跑 `/setup-matt-pocock-skills` → 任意改动前先用 `/grill-me` 拷问一遍 | 30 分钟首装 + 每次新功能前 5 分钟 |
| **给 AI Agent 接上"全网搜索 + 视频/推特读取"** | 把 `https://raw.githubusercontent.com/Panniantong/Agent-Reach/main/docs/install.md` 复制给 Agent 让它自装;之后 `agent-reach doctor` 自检 | 安装 15 分钟,接入 5 分钟/平台 |
| **用代码知识图谱改造你的 LLM 编码体验** | 装 `DeusData/codebase-memory-mcp`(单二进制零依赖),在 Claude Code/Cursor 挂 14 个 MCP tools,扔个 10 万行老仓库给它,观察 token 量下降 | 装 10 分钟,首个老仓库试跑 20 分钟 |

[每日早报 · 完成]