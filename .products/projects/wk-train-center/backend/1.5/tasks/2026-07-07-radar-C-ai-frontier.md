# Task: radar-C-ai-frontier.mjs(AI / 前沿能力缺口雷达)

## 元信息
- 状态:📋 todo
- 负责人:Node 脚本作者
- 依赖:无(独立)
- 估时:3h
- 排期:Day 1(2026-07-07)
- 风险等级:🟢低
- 关联 PRD:<deleted content>

## 范围(SOW)

写 `E:\rhProject\scripts\radar-c-ai-frontier.mjs`,扫 2 个源:

1. **skill 索引**:`C:\Users\RUHAI\.ai-skills-store\_SKILL-INDEX.md`(8 核心 + 9 容器)
2. **IDE 报错日志**:`{{VSCODE_TARGET_SESSION_LOG}}` 路径

扫 3 类:

1. **缺能力**:对照近期主人在 IDE 提的 ask 关键词(从 session log 抽),查 INDEX.md 有无对应 skill
   - 例:主人常说"调研 X"但 INDEX.md 无 `agent-reach` → 候选
2. **agent 报错**:扫 session log 找 `no agent found` / `skill not found` / `tool not available`
3. **新 skill 建议**:关键词频次 Top 5 且 INDEX.md 无 → 推荐查 `awesome-copilot` 仓库(用 `agent-reach` 或 `firecrawl`)

输出:`E:\rhProject\.products\projects\wk-train-center-service\tasks\inbox\{YYYY-MM-DD}-ai-frontier.md`

## 完成判据

- [ ] 跑 `node E:\rhProject\scripts\radar-c-ai-frontier.mjs` 产 md
- [ ] md 含 3 节
- [ ] 对照 `_SKILL-INDEX.md` 给出"近期 ask 关键词 → 是否覆盖"映射表
- [ ] 报错关键词 Top 5 列出来
- [ ] 跑完 < 3 分钟
- [ ] **PRD §7.1 AC3**:含 INDEX.md 对照

## 依赖 / 阻塞

- **依赖**:`_SKILL-INDEX.md` 存在 + session log 可读
- **被依赖**:radar-runner
- **风险**:session log 路径变化 → 用环境变量兜底(找不到就跳过 + 记 TODO)

## 红线

- ❌ 改 `_SKILL-INDEX.md`(只读)
- ❌ 自动装新 skill(只在产物里建议)
- ❌ 自动改 3 个 IDE 的 skills 目录(必须 Claude 全权管)
- ❌ 重新装 `skills-link` / 开 `cc-switch` auto sync(已废)

## 验收方式

1. 跑脚本
2. 检查 `tasks/inbox/2026-07-07-ai-frontier.md`:
   - 含 3 节
   - 关键词映射表至少 5 行
   - 报错关键词 Top 5 至少 3 条
3. 跑完 < 3 分钟

## 输出预期

Day 1 末产出:AI 能力缺口清单(预计 3-8 条),含"是否值得装新 skill"判断。
