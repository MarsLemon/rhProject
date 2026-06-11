#!/usr/bin/env node
/**
 * [Hook] 拦截 3 IDE skills/ 目录的非授权写入
 * PreToolUse hook for Claude Code
 * 触发：Write / Edit / MultiEdit / Bash 工具调用
 * 拒绝：
 *   - Write/Edit 到 ~/.claude/skills/、~/.cursor/skills/、~/.qoder/skills/ 下的具体文件
 *   - Bash 中对上述目录的非 junction/symlink 操作
 *   - 任何 skills-link 调用
 * 允许：
 *   - 创建 junction 到 .ai-skills-store (cmd mklink /J)
 *   - 删除断链 symlink (rm/del)
 * 退出码：JSON 输出到 stdout 由 Claude Code 解析
 */
import { readFileSync } from 'node:fs'

let raw = ''
try {
  raw = readFileSync(0, 'utf8')
} catch {
  process.exit(0)
}
if (!raw.trim()) process.exit(0)

let payload
try {
  payload = JSON.parse(raw)
} catch {
  process.exit(0)
}

const tool = payload.tool_name
const inp = payload.tool_input || {}

const IDE_SKILLS_RE = [
  /[/\\]\.claude[/\\]skills[/\\]/,
  /[/\\]\.cursor[/\\]skills[/\\]/,
  /[/\\]\.qoder[/\\]skills[/\\]/,
]
const AI_STORE_RE = /[/\\]\.ai-skills-store[/\\]/

function touchesIdeSkills(text) {
  return IDE_SKILLS_RE.some((re) => re.test(text))
}

let denyReason = null
let warnOnly = null

if (tool === 'Write' || tool === 'Edit' || tool === 'MultiEdit') {
  const fp = inp.file_path || ''
  if (touchesIdeSkills(fp)) {
    denyReason = `禁止直接编辑 IDE skills 目录下的文件 (${fp})。
方案A 单源策略：所有 skill 内容修改请到 C:\\Users\\RUHAI\\.ai-skills-store\\<skill>\\ 改，3 个 IDE 的 junction 会自动同步。
如需新增/删除 skill：直接说"加/删 skill xxx"，由 Claude 代为操作。`
  }
} else if (tool === 'Bash') {
  const cmd = inp.command || ''
  if (/skills-link/i.test(cmd) || /npm\s+(i|install|add)\s+.*-g.*skills-link/i.test(cmd)) {
    denyReason = `禁止调用 skills-link (已 2026-06-11 卸载)。
如需管理 skill，直接对 Claude 说"加/删/更新 skill xxx"，由 Claude 代为操作。`
  } else if (touchesIdeSkills(cmd)) {
    const isJunctionCreate = /mklink\s+\/J/.test(cmd) && AI_STORE_RE.test(cmd)
    const isSymlinkDelete = /^\s*(rm|del|Remove-Item)\s/.test(cmd)
    const isRead = /^\s*(ls|dir|cat|type|Get-Content|Get-Item|Get-ChildItem)\s/.test(cmd)
    if (!isJunctionCreate && !isSymlinkDelete && !isRead) {
      denyReason = `禁止在 IDE skills 目录执行非 junction/symlink 操作。
命令: ${cmd.slice(0, 200)}
允许的操作：mklink /J <ide-skill> <.ai-skills-store-skill>、rm/del 断链 symlink、ls/cat 读操作。`
    }
  }
}

if (denyReason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: denyReason,
    },
  }) + '\n')
} else {
  process.stdout.write('{}\n')
}
