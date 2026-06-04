#!/usr/bin/env node
/**
 * Cursor-oriented skill audit (skill-cleaner style).
 * Scans ~/.cursor/skills, project .cursor/skills, optional plugin cache.
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const home = os.homedir()
const roots = [
  path.join(home, '.cursor', 'skills'),
  path.join(home, '.claude', 'skills'),
  path.join(home, '.cursor', 'plugins', 'local'),
  path.join(monorepoRoot, '.cursor', 'skills'),
  path.join(monorepoRoot, 'wk-train-center-ui-v3', '.cursor', 'skills'),
].filter((r) => fs.existsSync(r))

const CONTEXT_TOKENS = 272_000
const BUDGET_PERCENT = 2
const budgetTokens = Math.floor(CONTEXT_TOKENS * (BUDGET_PERCENT / 100))

function walkSkills(root, maxDepth = 12) {
  const out = []
  function walk(dir, depth) {
    if (depth > maxDepth) return
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    const skillMd = path.join(dir, 'SKILL.md')
    if (fs.existsSync(skillMd)) {
      out.push(skillMd)
      return
    }
    for (const e of entries) {
      if (e.name === 'node_modules' || e.name === '.git') continue
      const full = path.join(dir, e.name)
      if (e.isDirectory()) walk(full, depth + 1)
    }
  }
  walk(root, 0)
  return out
}

function parseFrontmatter(file) {
  const text = fs.readFileSync(file, 'utf8')
  const lines = text.split(/\r?\n/)
  if (lines[0]?.trim() !== '---') return null
  let end = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === '---') {
      end = i
      break
    }
  }
  if (end < 0) return null
  let name, description
  for (let i = 1; i < end; i++) {
    const m = /^name:\s*(.+)$/.exec(lines[i] ?? '')
    if (m) name = m[1].trim().replace(/^["']|["']$/g, '')
    const d = /^description:\s*(.+)$/.exec(lines[i] ?? '')
    if (d) description = d[1].trim().replace(/^["']|["']$/g, '')
  }
  if (!name) name = path.basename(path.dirname(file))
  const body = lines.slice(end + 1).join('\n')
  return { name, description: description ?? '', body, file }
}

function tokenCost(text) {
  return Math.ceil(Buffer.byteLength(text, 'utf8') / 4)
}

function bodyHash(body) {
  return createHash('sha1').update(body.replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 12)
}

function scopeFor(file) {
  const n = file.replace(/\\/g, '/').toLowerCase()
  if (n.includes('/.cursor/skills/')) return 'cursor-global'
  if (n.includes('/.claude/skills/')) return 'claude-global'
  if (n.includes('/plugins/local/')) return 'cursor-plugin-local'
  if (n.includes('wk-train-center-ui-v3/.cursor/skills')) return 'rhProject-ui-v3'
  if (n.includes('rhproject/.cursor/skills')) return 'rhProject-root'
  return 'other'
}

const byReal = new Map()
for (const root of roots) {
  for (const file of walkSkills(root)) {
    const parsed = parseFrontmatter(file)
    if (!parsed) continue
    let real
    try {
      real = fs.realpathSync(file)
    } catch {
      real = file
    }
    const line = `- ${parsed.name}: ${parsed.description} (file: ${file})`
    const skill = {
      ...parsed,
      realPath: real,
      scope: scopeFor(file),
      descChars: [...parsed.description].length,
      lineChars: [...line].length,
      lineTokens: tokenCost(`${line}\n`),
      bodyHash: bodyHash(parsed.body),
    }
    if (!byReal.has(real)) byReal.set(real, skill)
  }
}

const skills = [...byReal.values()].sort((a, b) => a.name.localeCompare(b.name))
const byName = new Map()
for (const s of skills) {
  const k = s.name.toLowerCase()
  if (!byName.has(k)) byName.set(k, [])
  byName.get(k).push(s)
}
const byBody = new Map()
for (const s of skills) {
  if (!byBody.has(s.bodyHash)) byBody.set(s.bodyHash, [])
  byBody.get(s.bodyHash).push(s)
}

const totalLineTokens = skills.reduce((n, s) => n + s.lineTokens, 0)
const longDesc = skills.filter((s) => s.descChars >= 120 || s.lineChars >= 200).sort((a, b) => b.descChars - a.descChars)
const dupNames = [...byName.entries()].filter(([, list]) => list.length > 1)
const dupBodies = [...byBody.entries()].filter(([, list]) => list.length > 1 && list.some((s) => s.body.length > 80))

const lines = []
lines.push('# Skill Cleaner Report (Cursor audit)', '')
lines.push(`generated: ${new Date().toISOString()}`)
lines.push(`roots_scanned: ${roots.length}`)
lines.push(`skills_discovered: ${skills.length}`)
lines.push(`description_chars_total: ${skills.reduce((n, s) => n + s.descChars, 0)}`)
lines.push(`discovery_line_tokens_total: ${totalLineTokens}`, '')

lines.push('## Skill Budget (discovery metadata)', '')
lines.push(`context_tokens_assumed: ${CONTEXT_TOKENS.toLocaleString()}`)
lines.push(`${BUDGET_PERCENT}%_budget_tokens: ${budgetTokens.toLocaleString()}`)
lines.push(`all_skill_descriptions_tokens: ${totalLineTokens.toLocaleString()}`)
lines.push(`used_of_2%_budget: ${((totalLineTokens / budgetTokens) * 100).toFixed(1)}%`)
lines.push(`used_of_context: ${((totalLineTokens / CONTEXT_TOKENS) * 100).toFixed(2)}%`)
if (totalLineTokens > budgetTokens) {
  lines.push(`⚠ 超出 Codex 式 2% 描述预算约 ${totalLineTokens - budgetTokens} tokens；Cursor 实际加载策略可能不同，但 description 越长越容易挤占上下文。`)
}
lines.push('')

lines.push('## Root Summary', '')
for (const root of roots) {
  const count = skills.filter((s) => s.file.startsWith(root)).length
  lines.push(`- ${root}: ${count} skills`)
}
lines.push('')

lines.push('## Duplicates By Name', '')
if (dupNames.length === 0) lines.push('- none')
else {
  for (const [name, list] of dupNames.sort((a, b) => b[1].length - a[1].length)) {
    lines.push(`- **${name}** (${list.length} copies)`)
    for (const s of list) lines.push(`  - [${s.scope}] ${s.file}`)
  }
}
lines.push('')

lines.push('## Duplicates By Body (near-copy content)', '')
if (dupBodies.length === 0) lines.push('- none')
else {
  for (const [, list] of dupBodies.slice(0, 25)) {
    lines.push(`- ${list.map((s) => s.name).join(', ')}`)
    for (const s of list) lines.push(`  - [${s.scope}] ${s.file}`)
  }
}
lines.push('')

lines.push('## Description Candidates (>=120 chars or line >=200)', '')
if (longDesc.length === 0) lines.push('- none')
else {
  for (const s of longDesc.slice(0, 20)) {
    lines.push(`- **${s.name}** (${s.descChars} chars, ~${s.lineTokens} tok)`)
    lines.push(`  path: ${s.file}`)
    lines.push(`  desc: ${s.description.slice(0, 160)}${s.description.length > 160 ? '…' : ''}`)
  }
}
lines.push('')

lines.push('## Stack relevance (rhProject / Vue3)', '')
const keep = ['rh-project-wiki', 'chinese-encoding-guard', 'vue2-to-vue3-component-migration', 'api-development', 'page-adaptation', 'style-management', 'el-link-to-detail-link', 'vue-best-practices', 'vue-router-best-practices', 'pinia', 'vite', 'backend-code-review', 'ddd-backend-design', 'code-quality-gate', 'find-skills', 'skill-cleaner']
const lowValueForRh = skills.filter((s) =>
  ['angular-spec-generator', 'form-generator', 'module-generator', 'fullstack-developer'].includes(s.name.toLowerCase())
)
lines.push('**建议保留（业务/栈）**: ' + keep.filter((k) => skills.some((s) => s.name.toLowerCase() === k)).join(', '))
if (lowValueForRh.length) {
  lines.push('**与当前 Vue3 栈弱相关（可考虑移出全局）**:')
  for (const s of lowValueForRh) lines.push(`  - ${s.name} → ${s.file}`)
}
lines.push('')

lines.push('## Full inventory', '')
for (const s of skills) {
  lines.push(`- ${s.name} [${s.scope}] desc=${s.descChars}ch ~${s.lineTokens}tok`)
}

const report = lines.join('\n')
const reportsDir = path.join(monorepoRoot, '.cursor', 'scheduled-tasks', 'reports')
fs.mkdirSync(reportsDir, { recursive: true })
const outFile = path.join(reportsDir, 'skill-cleaner-report.txt')
fs.writeFileSync(outFile, report, 'utf8')
console.log(report)
console.log('\n---\nReport saved:', outFile)
