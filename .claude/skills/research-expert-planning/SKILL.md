---
name: research-expert-planning
description: "research-expert 调研究任务专用 — Manus-style 文件规划。创建 task_plan.md / findings.md / progress.md 三文件,跨会话续跑调研,context 不会丢。仅在 research-expert 接调研类任务时使用。触发词：research-expert / 调研究 / 查资料 / 调研任务 / 写报告 / 跨会话续跑。"
allowed-tools: "Read Write Edit Bash Glob Grep"
user-invocable: true
metadata:
  version: "0.1.0"
  scope: "research-expert-only"
---

# research-expert-planning

> **scope**:只对 **research-expert(调研究/写库)** 子 agent 生效。勿给 backend-expert / frontend-expert 用(它们直接出代码,workflow 不同)。

## 用法 — 五步曲

### 1. 启动:catchup(必走)

接活头一件事,不动手:

```bash
# Linux/macOS
$(command -v python3 || command -v python) ~/.claude/skills/planning-with-files/scripts/session-catchup.py "$(pwd)"

# Windows PowerShell
& (Get-Command python -ErrorAction SilentlyContinue).Source "$env:USERPROFILE\.claude\skills\planning-with-files\scripts\session-catchup.py" (Get-Location)
```

- 项目根有 `task_plan.md`?→ 读 3 文件 → 接上次没干完的活
- 没有?→ 进入 "2. 初始化"

### 2. 初始化(只在新任务时跑)

在项目根创建 3 文件(别装 skill 目录,装仓库根):

| 文件 | 用途 |
|---|---|
| `task_plan.md` | phases + 进度 + 决策表 |
| `findings.md` | 调研究结果 / 引用 URL / 关键发现 |
| `progress.md` | session log + test 记录 + 错误表 |

模板参考:`~/.claude/skills/planning-with-files/skills/planning-with-files/templates/`

### 3. 工作:2-Action Rule(核心)

> **每 2 次 view / browser / search / Read 之后,立刻把关键发现写 findings.md**。
> 主人工作区常用工具映射:
> - `search` → `grep_search` / `file_search`
> - `browser` → `mcp_chrome_devtoo_*` / `open_browser_page` + `read_page`
> - `web` → `fetch_webpage` / `mcp_firecrawl-fas_firecrawl_scrape`
> - `Read` → `read_file` / `view_image`

### 4. 决策:Read-Before-Decide

> 调研究下一步往哪走之前,**先 `read_file task_plan.md`** —— 把总目标刷回 attention,防止 50 次 tool call 后失向。

### 5. 完工:5-Question Reboot + completion gate

跑 stop 前对照 [templates/progress.md](C:/Users/RUHAI/.claude/skills/planning-with-files/skills/planning-with-files/templates/progress.md) 末尾的 5 个问题:

| Question | 来源 |
|---|---|
| Where am I? | task_plan.md `## Current Phase` |
| Where am I going? | task_plan.md 剩余 phases |
| What's the goal? | task_plan.md `## Goal` |
| What have I learned? | findings.md |
| What have I done? | progress.md |

## 关键规则

| # | 规则 | 主人口径 |
|---|---|---|
| 1 | **永远先建 plan** | 主人:不写 plan 不动手 |
| 2 | **2-action 写盘** | 防 context 漂移 |
| 3 | **决策前重读 plan** | 5+ tool call 后必读 |
| 4 | **动作后更新 phase** | in_progress → complete |
| 5 | **所有 error 写进度** | 防止重复踩坑 |
| 6 | **失败不重做** | next_action ≠ same_action |
| 7 | **add phase 不删旧** | 主人加新需求 → 加 Phase 6/7 |

## 3-strike error protocol

```
ATTEMPT 1: Diagnose & Fix → 读 error,改根因
ATTEMPT 2: Alternative Approach → 换工具/换库,绝不重做同一个动作
ATTEMPT 3: Broader Rethink → 挑战假设,搜外部
3 次失败 → escalate plan-orchestrator / 主人
```

## 与 plan-orchestrator 的关系

- **plan-orchestrator** 是主人 VS Code 主路由,产出 `.products/.../plans/<日期>-<名>.md`
- **本 skill** 是 research-expert 自己的执行档案,产出 `task_plan.md` / `findings.md` / `progress.md`
- 两者**互补**,不替代

## 边界

- ❌ 不动 `~/.claude/skills/research-expert-planning/SKILL.md` 本文件
- ❌ 不替 research-expert 决定"调哪个资料源"——这是 `1-research.md` 的事
- ❌ 不写 vault 既有页(主人私人领地)→ 写新页 + 写 log.md
- ✅ 在项目根写 `task_plan.md` 等是允许的(主人口径:"任务档案落在工作区根")