---
name: feedback-skill-management-handover
description: 2026-06-11 skill-link 卸载、cc-switch 同步关闭、verify-skills + pre-tool hook 上线，Claude 全权接管 skill 管理
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7daac8fc-c34b-456e-ac8c-8aa2447249a3
migrated_from: auto-memory-2026-09-07
migrated_path: C:\Users\RUHAI\.claude\projects\E--rhProject\memory\feedback-skill-management-handover.md
---

2026-06-11 治理事件：项目工作区从 3 IDE skill 混乱状态收敛到方案 A 落锁状态。

**事故现场**：
- `skills-link@1.3.0` (npm 全局) 在 6/11 15:20 自动往 3 个 IDE 的 `skills/` 写 30 个 symlink 指向 `~/.agents/skills/`
- 覆盖了 6/11 12:45 方案A 创建的 2 个 8 核心 junction（`grill-me`、`review`）
- `cc-switch` 配置 `skillSyncMethod: "auto"` + `skillStorageLocation: "unified"`，随时可能再次劫持
- 单源被静默双写

**落锁动作**：
1. `npm uninstall -g skills-link`（82 个包清）
2. `~/.agents/` 整目录归档到 `_private_assistant_archive\2026-06-11\old-skill-link-stuff\.agents\`（79M，34 个 skill 完整保留）
3. `~/.cc-switch/settings.json` 改 `skillSyncMethod: "auto" → "manual"`，`skillStorageLocation: "unified" → "local"`，备份在 `_private_assistant_archive\2026-06-11\cc-switch-backup\settings.json.2026-06-11-pre-manual.bak`
4. 3 个 IDE `skills/` 删 30 个被劫持 symlink，补回 6 个 grill-me/review junction
5. 写 `E:\rhProject\scripts\verify-skills.mjs`（`npm run verify:skills` 触发）
6. 写 `E:\rhProject\scripts\hooks\guard-skills-write.mjs` + 配 `~/.claude/settings.json` 的 PreToolUse

**Why:** 方案A 的"单源 = `.ai-skills-store/`"在 6/11 12:45 写好文档，2.5 小时后就被 skill-link 静默覆盖。文档+人守不住，需要工具兜底。

**How to apply:**
- 改 skill 内容 → **永远在 `.ai-skills-store/` 改**，3 IDE 的 junction 自动同步
- 加/删/升级 skill → **直接对 Claude 说**，由 Claude 代为操作（建到 `.ai-skills-store/` + 自动 junction）
- 跑 `npm run verify:skills` 体检（任何改动前后）
- 不要 `npm i -g skills-link`（已被 hook 拒绝）
- 不要用 Cursor/Qoder 自带 skill 商店 / `skillhub` CLI / 改 cc-switch `skillSyncMethod: "auto"`（破坏单源）
- 任何会话开头都应跑 `verify:skills` 确认状态（不阻塞，但发现问题立刻修）
- 相关硬约束在 [[CLAUDE.md]] 第 19-108 行（AI 工具生态 + 技能运维）

**关联：**
- [[CLAUDE.md]] "AI 工具生态"+"技能运维"硬约束
- [workflow-cross-module-check](../workflow/workflow-cross-module-check.md) 改动流程（skill 改动算跨模块）
- 归档位置：`C:\Users\RUHAI\Desktop\_private_assistant_archive\2026-06-11\old-skill-link-stuff\.agents\`