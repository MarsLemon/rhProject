---
type: comparison
date: 2026-07-09
tags: [claude-code, skill-loading, plan-mode, subagent, plugin]
status: draft
source-plan: .planning/2026-07-09-wiki-skill-agent-ecosystem/
---

# Claude Code 4 种 Skill / Content 注入路径对比

> **版本基线**:Claude Code `2.1.205`(2026-07-09 stable)
> **目的**:小马决定要不要把 `planning-with-files`(已装在 `~/.claude/skills/planning-with-files/`)推到 7 个 expert agent 的依据。
> **核心问题**:「skill / 内容怎么进 context」在 Claude Code 里有 **4 条不同路径**,触发机制、token 预算、生命周期、可突变能力、持久性都不同。

---

## 1. 核心对比表

| 维度 | **A. 手动放 SKILL.md** | **B. `/plugin marketplace add` + `install`** | **C. 内置 `/plan` mode** | **D. Subagent(Task tool)** |
|---|---|---|---|---|
| **加载机制** | YAML frontmatter `name`+`description` 匹配 → 触发后整 SKILL body 注入 context | marketplace 克隆 → `plugin install` → `.claude-plugin/plugin.json` 自动发现 `commands/`/`agents/`/`skills/`/`hooks/`/`mcp.json` | 系统级 mode flag(`EnterPlanMode` 内部状态);**不是 SKILL.md** | `Agent({subagent_type, prompt})` 工具调用,fork 出独立 model 上下文 |
| **触发条件** | 自动:LLM 读 description 关键词命中;手动:`/skill-name` | 装好即生效;`/plugin install <name>@<marketplace>` 即用 | 用户触发(`/plan`、Shift+Tab)或模型调 `EnterPlanMode` | **模型在决策点主动调 `Agent` 工具**;不能自动注入 |
| **注入到 context 的内容** | **3 层渐进披露**:(1) 元数据 name+description 总在 prompt 尾部列表里(cap 1536 chars/desc,2.1.105+);(2) 触发后 SKILL.md 全文(~5k tokens);(3) 配套 references 按需 Read | 装好等价于手动 A;单个 skill 的披露仍走 A;**多了 commands + agents + hooks + mcp 注册** | 不"注入"任何 skill body,只切换 system mode + 裁剪 tool 列表(只读) | **新窗口**:子 agent 拿不到父对话历史,只拿 `prompt` 字段 + 它自己的工具集;可指定 `model:` |
| **Hooks 可用** | **不支持** —— `~/.claude/skills/<name>/SKILL.md` 不能挂 hook(hook 必须放 `hooks/hooks.json`) | **完整 9 类**:PreToolUse / PostToolUse / Stop / SubagentStop / **SessionStart** / SessionEnd / **UserPromptSubmit** / **PreCompact** / Notification | 只触发固有 hooks(SessionStart 等)+ plan mode 自身 ExitPlanMode;**用户不能额外挂** | 子 agent 自身有 hooks,**继承父的 settings.json**;新 session 重触发 SessionStart;PreToolUse/PostToolUse 在子 agent 作用域 |
| **持久性** | **持久**:写到 `~/.claude/skills/` 或 `.claude/skills/` 直到删文件;survives /clear /compact / 重启(2.1.0+ 有 hot-reload) | **持久**:plugin cache 留 `~/.claude/plugins/...`;`enabledPlugins` 写 `settings.json`;survives 重启 | **瞬态**:当前 session 的 mode flag;`/clear` 不丢(plan 状态在 system prompt),compact 重新评估 | **不持久**:subagent 结束 → transcript 写盘 → 上下文销毁;父只拿回 final result string |
| **能否 mutate 主 agent** | **不能**:不能装命令、不能改工具、不能改 system prompt | **能**:装新 slash commands / subagent types / hooks(9 类)/ MCP tools | **不能**:mode flag 只切 tool allowlist(plan 下只读) | **不能 mutate 父**:子拿不到父 tool set 之外的东西;但**可回传文本结果**给父 |
| **限制 / 容易踩坑** | (1)description 必须含触发词,否则永不激活;(2)body 超 ~5k token 截断;(3)嵌套命名冲突(2.1.178 改成 `<dir>:<name>`) | (1)marketplace 拉 git 失败不重试;(2)plugin 依赖冲突时 disable 拒绝;(3)`${CLAUDE_PLUGIN_ROOT}` 只在 manifest/hooks/MCP 替换,component body 要自己展开 | (1)plan mode 不阻塞有 `Edit(...)` allow rule 的写——已知 bug(2.1.136 修了一部分);(2)不接受 write 工具 → 想"批准 plan 立刻执行"必须 ExitPlanMode | (1)depth 上限 5 层(2.1.172+);(2)背景 subagent 不阻塞父(2.1.198+);(3)transcript 不继承给父;(4)prompt 必须自包含,不能假设父对话 |
| **Token 预算** | SKILL.md body ~5k 是 budget;超过 → 截断 + "see references" | 同 A;plugin 装多了触发 `/plugin` truncation warning(2.1.178) | 几乎 0 额外(mode 是 system 字段) | 子 agent 的 prompt + 它自己的 system prompt + 它自己激活的 skills;**独立预算** |

---

## 2. 4 条路径的"加载时序"图

```
Session start
   │
   ├── hooks: SessionStart          ←── 来自 settings.json + plugin 的 hooks.json
   ├── load system prompt
   ├── inject CLAUDE.md (project)
   ├── scan ~/.claude/skills/       ←── A 路径:元数据入 context(只占 description)
   ├── scan .claude/skills/         ←── 同上,project 级
   ├── scan enabled plugins         ←── B 路径:扫 commands/agents/skills/hooks/mcp.json
   │
   ▼
用户输入第 1 轮
   │
   ├── hooks: UserPromptSubmit
   │
   ▼
模型决定:激活哪条路径?
   │
   ├─→ [A] description 命中 → Read SKILL.md → 注入 body → 可能 Read references
   ├─→ [B] 同 A,SKILL.md 来自 plugin cache
   ├─→ [C] 调 EnterPlanMode → system mode = plan → tool 列表裁剪到只读
   └─→ [D] 调 Agent tool(subagent_type, prompt) → fork 子 agent
            │
            ├── 子 agent 自己跑:hooks SessionStart(继承)+ scan skills + inject CLAUDE.md
            ├── 子 agent 完成任务 → 返回 final text
            └── 父继续在原上下文走
```

---

## 3. 决策判据

| 场景 | 选哪条 | 原因 |
|---|:-:|---|
| 给 expert agent 加**持久**的"做某事的固定流程" | **A** 或 **B** | 进 description 列表 → 自动激活;跨 /clear + compact;不动 system prompt |
| 给 expert agent 加**项目级**上下文(只在某仓库生效) | **A** (`.claude/skills/`) | 跟仓库走,clone 就有 |
| 想让 7 个 expert agent **强制走规划再执行** | **C** (`/plan`),**不要**用 skill | skill 不能改 mode flag;plan mode 是唯一硬约束只读开关 |
| 让 expert agent 把**复杂子任务外包**给一次性角色 | **D** (Task/Agent) | 隔离上下文,父不被污染;5 层 depth 够 |
| 想"装个新 slash command"给 expert 用 | **B** (plugin) | A 不支持命令注册,只有 B 能挂 `commands/*.md` |
| 想给 expert agent 加**事件驱动自动化**(例:每次 Edit 前自动校验) | **B** (plugin + hooks) | A 没 hook 接口;hook 必须经 plugin 的 `hooks/hooks.json` |
| 想"运行时动态教 expert 一个新技能" | **A** (写到 `.claude/skills/<name>/SKILL.md`) | 2.1.0+ hot-reload,改文件即生效,不用 restart |

---

## 4. 落地建议(对当前 7 个 expert agent)

> 主人口径:`.github/agents/{name}.agent.md` 已经 7 个 expert(plan-orchestrator / backend-expert / frontend-expert / research-expert / eval-coach / product-manager / project-manager)。
>
> **planning-with-files 要不要推?推成哪条?**

| Agent | 推荐路径 | 理由 |
|---|:-:|---|
| `plan-orchestrator` | **B**(plugin) + **C**(/plan 模式内嵌) | 需要 hook 自动注入 plan context;本身已经是 plan 模式入口 |
| `backend-expert` / `frontend-expert` | **A** (`SKILL.md`) | 子任务执行,简单流程,无需 hook |
| `research-expert` | **A** + 自带 findings.md 模板 | 调研类天然适配 planning-with-files 的 3 文件模式 |
| `eval-coach` | **A** | 评估流程固定,SKILL.md 够用 |
| `product-manager` / `project-manager` | **A** | 文档/排期类,不需要 hook |

**第一步**(本周):只给 `research-expert` 推 A 路径,验证 3 文件模式能不能撑住调研任务的跨 /clear 续跑。

---

## 5. Sources

### 一手源码 / Anthropic 官方仓

1. [`anthropics/claude-code` 主仓 README](https://github.com/anthropics/claude-code) — 当前 2.1.205、Plugin System 介绍
2. [`plugins/plugin-dev/skills/plugin-structure/SKILL.md`](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/skills/plugin-structure/SKILL.md) — Plugin 标准结构、auto-discovery、9 类 hook
3. [`plugins/plugin-dev/README.md`](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/README.md) — 7 个 plugin-dev skills、progressive disclosure 三层
4. [`plugins/plugin-dev/agents/agent-creator.md`](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/agents/agent-creator.md) — agent frontmatter schema
5. [`plugins/README.md`](https://github.com/anthropics/claude-code/blob/main/plugins/README.md) — 仓内官方插件清单
6. [`anthropics/claude-code/CHANGELOG.md`](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) — 版本轨迹事实证据:
   - **2.1.205**:当前最新(2026-07-09 验证)
   - **2.1.198**:subagent 默认 background
   - **2.1.186**:Skill frontmatter 新字段
   - **2.1.178**:嵌套 skills 命名冲突规则
   - **2.1.172**:subagent depth cap 5
   - **2.1.157**:`.claude/skills` 自动加载
   - **2.1.136**:plan mode `Edit(...)` allow rule bug 修复
   - **2.1.105**:description cap 250→1536 chars;PreCompact hook
   - **2.1.0**:skill hot-reload;`context: fork`
   - **2.0.20**:"Added support for Claude Skills"
   - **2.0.12**:"Plugin System Released"

### Skills 标准规范

7. [`anthropics/skills` 主仓 README](https://github.com/anthropics/skills/blob/main/README.md) — 官方 Anthropic skills;spec 当前权威位置在 `agentskills.io`

### 用户文档(本会话未拉到,需主人在浏览器核对)

8. [docs.claude.com/en/docs/claude-code/skills](https://docs.claude.com/en/docs/claude-code/skills)
9. [docs.claude.com/en/docs/claude-code/plugins](https://docs.claude.com/en/docs/claude-code/plugins)
10. [docs.claude.com/en/docs/claude-code/plan-mode](https://docs.claude.com/en/docs/claude-code/plan-mode)
11. [docs.claude.com/en/docs/claude-code/sub-agents](https://docs.claude.com/en/docs/claude-code/sub-agents)

---

## 6. 不确定项(诚实声明)

- `docs.claude.com` 用户文档全文本会话因网络策略拒访 → 所有 #8–#11 的具体字段名/UI 文本均来自 GitHub 仓内真实代码(plugin-dev skills/agents/CHANGELOG)反推
- Agent Skills spec 当前权威位置在 `agentskills.io`(anthropics/skills README 已搬迁,本会话未拉到原文)
- SKILL.md body ~5k tokens 是 plugin-dev 文档建议值,非 spec 硬值

**建议主人手动浏览器打开 #7、#8、#11 三条核对最终措辞**。