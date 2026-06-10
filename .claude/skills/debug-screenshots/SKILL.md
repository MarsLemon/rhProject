---
name: debug-screenshots
description: Use whenever you take a browser screenshot via Chrome DevTools MCP (mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_screenshot), capture console errors via list_console_messages, or debug a browser-side issue. Apply for: taking screenshots, debugging UI bugs, visual regression checks, capturing errors, "open the browser" / "let me see what it looks like" requests, page/layout investigations, before/after fix comparisons. The skill saves all browser debug artifacts to <project>/tempImg/ with timestamp naming (YYYYMMDD_HHMMSS_<简洁中文描述>.png), keeps tempImg in .gitignore, and cleans up files older than 7 days. NEVER save browser screenshots to project root, src/, or arbitrary locations - the user has explicitly required that all browser debug artifacts live in tempImg.
---

# Debug Screenshots Manager

## Purpose

Keep all browser debug artifacts in ONE place: `<project>/tempImg/`. Without this skill, screenshots end up scattered in working directories, get accidentally committed to git, or get lost between sessions. The user has explicitly asked for this convention.

## When This Skill Triggers

Apply this skill on ANY of:

- About to call `mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_screenshot`
- Capturing console errors via `list_console_messages` for a bug report
- Debugging a browser-side bug, UI bug, or layout issue
- User says: "截图", "screenshot", "打开浏览器", "open the browser", "让我看看", "let me see", "视觉检查", "visual check", "页面问题", "page issue"
- Before/after fix comparisons
- Network or console error investigations
- Any context where Claude is about to produce a visual artifact from the browser

**When in doubt, apply this skill.** The cost of following it is one filename. The cost of skipping it is a screenshot lost in `/tmp` or committed to git.

## Required Behaviors

### 1. One-Time Setup (idempotent, run on first trigger in a session)

Before saving the first screenshot of a session, ensure the folder and gitignore are in place:

```bash
mkdir -p tempImg
grep -qE '^tempImg/?$' .gitignore 2>/dev/null || printf '\ntempImg/\n' >> .gitignore
```

- Use forward slashes in paths (Claude Code on Windows accepts these).
- The `grep -qE` works in Git Bash on Windows.
- If `.gitignore` doesn't exist, the `>>` redirect creates it.

### 2. Screenshot Naming Convention

`YYYYMMDD_HHMMSS_<简洁中文描述>.png`

- 时间戳：4 位年份 + 2 位月/日/时/分/秒，除下划线外不加其他分隔符。
- 描述：**2-6 字简洁中文短语**，概括截图核心内容（场景 / 状态 / 问题）。
- 命名原则：
  - **简洁**：能 2 字概括不写 4 字（如「修复」优于「修复完成」）
  - **总结**：用名词/动词短语，不写完整句子
  - **易读**：避免生僻字；纯英文术语（如 `API`、`CDN`、`OAuth`）可保留
- Examples:
  - `20260608_143022_登录错误.png`
  - `20260608_143530_登录修复.png`
  - `20260608_150012_仪表盘.png`
  - `20260608_151245_列表页.png`
  - `20260608_152001_设置页签.png`
  - `20260608_152030_用户管理页.png`

### 3. Screenshot Saving Procedure

When calling `take_screenshot`:

1. 生成时间戳：`20260608_143022`
2. 取 2-6 字简洁中文描述（如「登录错误」）；实在无合适中文时可用英文术语
3. 拼出完整路径：`tempImg/20260608_143022_登录错误.png`
4. Pass the path to the tool's save/output parameter (e.g., `filePath`)
5. Tell the user explicitly: "Saved screenshot to `tempImg/20260608_143022_登录错误.png`"

If the screenshot tool doesn't expose a path parameter, save the returned image via the Write tool using the composed path. Don't let the screenshot get lost.

### 4. Console Log Companion Files

When you call `list_console_messages` as part of a bug investigation, save the full output to a sibling log file using the same timestamp + description base：

`tempImg/20260608_143022_登录错误-console.log`

Include timestamp, level, message, and source for each entry. Reference BOTH files in your response when reporting a bug.

### 5. Sequence Captures (before/after)

多步骤调试时，保持中文描述一致 + 加序号 / 阶段后缀：

- `20260608_143022_登录修复01_修复前.png`
- `20260608_143155_登录修复02_修复后.png`

或使用显式阶段名：

- `20260608_143022_登录页_修复前.png`
- `20260608_143155_登录页_修复后.png`

The goal: when the user opens `tempImg/` later, the sequence is obvious without explanation.

### 6. End-of-Session Cleanup

After a debug session ends (or after significant multi-screenshot work), check for stale files:

```bash
find tempImg -type f -mtime +7
```

If there are old files, ask the user before deleting:

> "tempImg has X files older than 7 days. Delete them, or keep for reference?"

**Never auto-delete.** For trivial single-screenshot sessions, skip cleanup entirely.

### 7. Always Announce the Path

After saving, the user MUST see the full path in your response. Never assume they know to look in tempImg.

## What NOT To Do

- ❌ Save screenshots to project root, `src/`, `public/`, or any code directory
- ❌ Use generic names: `screenshot.png`, `image1.png`, `test.png`, `debug.png`
- ❌ 中文能说清楚时仍用英文/拼音命名 —— 中文优先更易读
- ❌ Use spaces, special characters, or overly long descriptions
- ❌ Commit `tempImg/` to git (it's gitignored)
- ❌ Take screenshots without telling the user the saved path
- ❌ Skip this skill for "quick" screenshots — the convention cost is one filename
- ❌ Take screenshots proactively when the user didn't ask (waste of disk + clutter)

## Edge Cases

| Situation | Action |
|-----------|--------|
| Working dir is a subdir, not project root | Use the project root explicitly: `E:/rhProject/tempImg/...` |
| Screenshot tool fails or browser is broken | Save whatever you have (e.g., console log) and tell the user the failure |
| Multiple browser tabs open | 在描述中加入页签名：`..._设置页签.png`、`..._个人主页签.png` |
| Console logs contain tokens, credentials, or PII | Warn the user before saving; offer to redact or skip the log file |
| User explicitly says "don't save it" or "just for now" | Respect; skip the file, mention the inline path only |
| Many screenshots in one investigation (>10) | Consider asking the user to scope the captures — tempImg isn't a build artifact |
| User asks to share a screenshot from earlier | Just reference the file path in `tempImg/`, user opens it locally |

## Related Skills

- `chinese-encoding-guard` (project skill) — protects Chinese text in any file Claude writes, including log companions
- This skill does NOT cover: non-browser screenshots (OS screenshot tools), generated images (DALL-E etc.), or terminal output captures