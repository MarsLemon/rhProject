#!/usr/bin/env node
/**
 * [Hook] 业务改动感知 log-only hook
 * PreToolUse hook for Claude Code
 *
 * 目的：把 CLAUDE.md §1 "改业务代码前先读 domain-coupling-*" 的软约束
 *       变成"必经日志"——记录谁在什么时间碰了什么业务模块
 *
 * 模式：log-only（不拦截，只 log 到固定文件 + 提醒）
 *   用户在澄清阶段选 log-only：先把"触碰事实"沉淀下来，
 *   1-2 周后看 log 决定要不要升级为 strict
 *
 * 检测范围（命中即 log）：
 *   - 写 Java 后端文件（含 DDD 域、应用、控制器、Mapper、Repository）
 *   - 改 SQL/数据库迁移
 *   - 改跨模块共享枚举、常量
 *   - 改 el_training_record 等"硬约束保护字段"（靠关键词模糊匹配）
 *
 * 退出码：0（不阻断）+ 额外 systemMessage 提醒（Claude 看到会读）
 */
import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

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
const filePath = inp.file_path || inp.path || inp.command || ''

// 只关心"写"动作
const WRITE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit'])
if (!WRITE_TOOLS.has(tool)) process.exit(0)

// 业务改动识别规则
const BUSINESS_RULES = [
  { re: /[/\\]src[/\\].*[/\\]domain[/\\]/,                    tag: 'DDD-domain' },
  { re: /[/\\]src[/\\].*[/\\]application[/\\]/,               tag: 'DDD-application' },
  { re: /[/\\]src[/\\].*[/\\]infrastructure[/\\]/,            tag: 'DDD-infrastructure' },
  { re: /[/\\]src[/\\].*[/\\]interfaces[/\\]/,                tag: 'DDD-controller' },
  { re: /[/\\]src[/\\].*[/\\]repository[/\\]/,                tag: 'DDD-repository' },
  { re: /[/\\]src[/\\]main[/\\]java[/\\].*\.(java)$/i,         tag: 'java-backend' },
  { re: /[/\\](migration|db)[/\\].*\.(sql)$/i,                tag: 'db-migration' },
  { re: /[/\\]enums?[/\\]/,                                   tag: 'shared-enum' },
  { re: /[/\\]constants?[/\\]/,                               tag: 'shared-constant' },
  { re: /el_training_record/i,                                tag: 'protected-field-el_training_record' },
  { re: /TrainingRecord\.(java|sql)$/i,                       tag: 'protected-field-el_training_record' },
  { re: /wk-modules[/\\].*[/\\]api[/\\]/,                     tag: 'shared-api-module' },
  // 前端：跨项目共享组件 / API client
  { re: /[/\\]src[/\\].*\.(vue|ts)$/i,                        tag: 'frontend-code' },
]

let matchedTag = null
for (const { re, tag } of BUSINESS_RULES) {
  if (re.test(filePath)) {
    matchedTag = tag
    break
  }
}

if (!matchedTag) process.exit(0)  // 不命中业务改动，不 log

// 写 log
const LOG_DIR = 'C:/Users/RUHAI/Desktop/_private_assistant_archive/hooks-log'
const LOG_FILE = `${LOG_DIR}/business-edits.log`
if (!existsSync(LOG_DIR)) {
  try { mkdirSync(LOG_DIR, { recursive: true }) } catch {}
}

const ts = new Date().toISOString()
const session = process.env.HERMES_SESSION_ID || 'unknown'
const line = `${ts} | session=${session} | tool=${tool} | tag=${matchedTag} | file=${filePath}\n`

try {
  appendFileSync(LOG_FILE, line, 'utf8')
} catch {
  // log 失败也不阻断主流程
}

// 输出 systemMessage 提醒 Claude 主动告知用户
const reminder =
  `\n🪝 [guard-business-edit] 检测到业务改动 (${matchedTag})\n` +
  `   文件：${filePath}\n` +
  `   提醒用户检查 CLAUDE.md §1 跨模块联动 + §4 改动流程：\n` +
  `   1) 是否读了 .claude/projects/E--rhProject/memory/ 下的 domain-coupling-* 笔记？\n` +
  `   2) 是否列了影响清单（后端/Vue2/Vue3/H5/DB/Wiki/AI 工具）？\n` +
  `   3) 改完跑 verify:chinese + mvn compile + npm run typecheck\n` +
  `   （log-only 模式：以上是建议，不阻断写入）\n`

const out = {
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    additionalContext: reminder,
  },
  systemMessage: reminder,
}
process.stdout.write(JSON.stringify(out) + '\n')
process.exit(0)
