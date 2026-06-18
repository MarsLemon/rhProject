---
title: Review 类 Skill 调研
created: 2026-06-18
updated: 2026-06-18
type: raw
tags: [research, ai, skill, code-review, not-implemented]
sources:
  - E:\rhProject\research\2026-06-15-review-skills-调研.md
learned: anthropics/claude-code pr-review-toolkit 含 6 个专门 agent(code-reviewer/code-simplifier/silent-failure-hunter 等) 值得试
status: not-implemented
not_implemented_reason: 调研完成,未实际试用 pr-review-toolkit 任何 agent
confidence: medium
---

# Review 类 Skill 调研（2026-06-15）

## 信源

- 官方：`github.com/anthropics/claude-code`（**15.1 万星**，主仓）+ `github.com/anthropics/skills`（**创作类**，无 review）
- 第三方：`alirezarezvani/claude-skills`（5,200 星，337 个综合）/ `travisvn/awesome-claude-skills`（列表站）

## 官方 3 个 review plugin（仓库 `anthropics/claude-code/plugins/`）

### 1. `pr-review-toolkit/` ⭐ 首选试用

**6 个专门 agent**（`plugins/pr-review-toolkit/agents/`）：

| Agent | 职责 |
|---|---|
| `code-reviewer.md` | 通用代码评审（逻辑、风格、潜在 bug） |
| `code-simplifier.md` | 代码简化（去冗余、提升可读性） |
| `comment-analyzer.md` | 注释质量审查 |
| `pr-test-analyzer.md` | PR 测试覆盖分析 |
| `silent-failure-hunter.md` | 静默失败捕获（try/catch 吞错、空 catch） |
| `type-design-analyzer.md` | 类型设计审查（DTO/Entity 字段合理性） |

**结构**：`.claude-plugin/` + `agents/` + `commands/`（plugin 格式，不是 SKILL.md）
**拉取路径**：`https://github.com/anthropics/claude-code/tree/main/plugins/pr-review-toolkit`

### 2. `code-review/`

单 agent，自动 code review。轻量场景。
**拉取路径**：`https://github.com/anthropics/claude-code/tree/main/plugins/code-review`

### 3. `security-guidance/`

安全审查（命令注入、XSS、SQLi、密钥泄露）。
**拉取路径**：`https://github.com/anthropics/claude-code/tree/main/plugins/security-guidance`

## 试用规则（按 memory Skill 管理铁律）

| 步骤 | 内容 |
|---|---|
| 1. 拉取 | 克隆到 `~/.ai-skills-store/<name>/`（单源入口，3 IDE 自动同步） |
| 2. 格式适配 | plugin 格式（`.claude-plugin/`）vs SKILL.md 格式 —— 可能要适配 junction |
| 3. 试用 | 下一个真实 PR 任务时启用 |
| 4. 留/删 | 任务结束判断：日常高频 → 留；用一次就够 → 删 |

## 留/删判断标准（结合本工作区）

**留下的条件**：
- 每周 ≥ 1 次真实 PR review 用到
- 比 Hermes + Claude Code 手动 prompt 更省力
- 适配成本可控（junction / SKILL.md 转换 1 次性）

**删除的条件**：
- 试用一次后不再用
- 适配成本高（plugin 格式转 junction 复杂）
- 与现有工作流重复（CLAUDE.md §4 改动流程已有 review 步骤）

## 下次真实任务时怎么用

下次 v3 迁移 PR 或 Java 重构 PR 落地前：
1. 拉 `pr-review-toolkit` 到 `.ai-skills-store/`
2. 用 `code-reviewer` + `silent-failure-hunter` + `type-design-analyzer` 三个 agent 并行扫
3. 跑完后按上面留/删标准判断

## 调研信号记录

- skillsmp.com 是**第三方聚合站**，内容可能脱节；看真实内容直接走 GitHub API
- `anthropics/skills` 仓库**没有 review 类**，只装创作类（PDF/PPTX/设计/文档）——别误以为它是大全
- web_extract 后端只走 ddgs（搜索）拿不到正文，要看真实内容用 `curl` + GitHub API