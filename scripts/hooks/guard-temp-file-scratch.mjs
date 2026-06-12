#!/usr/bin/env node
/**
 * [Hook] 拦截 AI 在 E:\rhProject 根目录散落临时脚本
 * PreToolUse hook for Claude Code
 *
 * 目的：把 CLAUDE.md §3 / §5 "AI 临时文件归档"硬约束变成"必经提醒 + 日志"
 * 模式：log-only（不阻断，只 log 到固定文件 + 提醒）
 *
 * 命中：
 *   - 写 E:\rhProject\ 根目录的 .py / .log
 *   - 写 wk-train-center-* / wk-mhc-* / wk-PPTist-* 等子项目根目录的 .py / .log
 * 允许：
 *   - 写 scripts/、tempImg/、fix-plans/ 等规范目录（不在根）
 *   - 写 CLAUDE.md / package.json / start.ps1 等已存在的项目配置（白名单）
 *   - 写业务代码 .java / .vue / .ts（任何目录都放行）
 *
 * 退出码：0（不阻断）+ log 写入 + systemMessage 提醒
 */
import { readFileSync, existsSync } from 'node:fs'

let raw = ''
try { raw = readFileSync(0, 'utf8') } catch { process.exit(0) }
if (!raw.trim()) process.exit(0)

let payload
try { payload = JSON.parse(raw) } catch { process.exit(0) }

const tool = payload.tool_name
const inp = payload.tool_input || {}
const filePath = (inp.file_path || inp.path || '').replace(/\\/g, '/')

if (!['Write', 'Edit', 'MultiEdit'].includes(tool)) process.exit(0)
if (!filePath) process.exit(0)

// 命中规则：在 rhProject 根或子项目根 写临时脚本
// 同时容忍 / 和 \ 两种分隔符（避免 path 标准化问题）
const WORKSPACE = /^e:[\/\\]rhproject[\/\\]?$/i
const PROJECTS = [
  'wk-train-center-service',
  'wk-train-center-ui',
  'wk-train-center-ui-v3',
  'wk-PPTist-ui',
  'wk-mhc-ui',
  'wk-mhc-mobile',
]
const ALLOW_EXT = /\.(java|vue|ts|tsx|js|mjs|cjs|json|md|yml|yaml|toml|xml|html|css|scss|sass|less|sql|sh|bat|cmd|ps1|gradle|properties)$/i
const DENY_EXT = /\.(py|log)$/i  // .py 和 .log 是高风险"散落物"

let inScratchZone = false
let scratchZone = ''

// 拆 segment 算"是否在 rhProject 根或子项目根写文件"
const normalized = filePath.replace(/\/$/, '').replace(/\\$/, '')
const segments = normalized.split(/[\/\\]/).filter(Boolean)
// segments 形如: ['e:', 'rhproject', <...>]
// 命中 1: ['e:', 'rhproject', <filename>]  → rhProject 根直接散落
// 命中 2: ['e:', 'rhproject', <proj>, <filename>]  → 子项目根散落
if (segments.length === 3 && segments[0].toLowerCase() === 'e:' && segments[1].toLowerCase() === 'rhproject') {
  inScratchZone = true
  scratchZone = 'rhProject 根'
} else if (segments.length === 4 && segments[0].toLowerCase() === 'e:' && segments[1].toLowerCase() === 'rhproject' && PROJECTS.includes(segments[2])) {
  inScratchZone = true
  scratchZone = `${segments[2]} 根`
}

if (!inScratchZone) process.exit(0)
if (!DENY_EXT.test(filePath)) process.exit(0)  // 只拦截 .py / .log（.ps1 / .cmd / .bat 已通过 ALLOW_EXT 放行——项目配置可能有）

// 白名单：CLAUDE.md, package.json, start.ps1 等项目配置即使在根也放过
const ALLOW_FILES = /(\/|\\)(CLAUDE\.md|package\.json|package-lock\.json|pnpm-lock\.yaml|start\.ps1|config\.yaml|\.gitignore)$/i
if (ALLOW_FILES.test(filePath)) process.exit(0)

const today = new Date().toISOString().slice(0, 10)
const archiveDir = `C:/Users/RUHAI/Desktop/_private_assistant_archive/ai-scratch-scripts/${today}`

// 写 log
const LOG_DIR = 'C:/Users/RUHAI/Desktop/_private_assistant_archive/hooks-log'
const LOG_FILE = `${LOG_DIR}/temp-file-scratch.log`
try {
  // 用 fs.appendFileSync
  const { appendFileSync, mkdirSync } = await import('node:fs')
  if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true })
  const ts = new Date().toISOString()
  const session = process.env.HERMES_SESSION_ID || 'unknown'
  appendFileSync(LOG_FILE,
    `${ts} | session=${session} | tool=${tool} | zone=${scratchZone} | file=${filePath}\n`,
    'utf8')
} catch {
  // log 失败不阻断
}

const out = {
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    additionalContext:
      `📁 [guard-temp-file-scratch] 检测到在 ${scratchZone} 写临时脚本（CLAUDE.md §3 §5）\n` +
      `   文件：${filePath}\n` +
      `   建议路径：${archiveDir}/<新文件名>\n` +
      `   log-only 模式：已记录到 ${LOG_FILE}，不阻断写入。请考虑归档。`,
  },
  systemMessage:
    `📁 [guard-temp-file-scratch] 建议归档 → ${archiveDir}/<新文件名>\n` +
    `   当前路径：${filePath}`,
}
process.stdout.write(JSON.stringify(out) + '\n')
process.exit(0)
