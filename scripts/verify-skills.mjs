#!/usr/bin/env node
/**
 * [Skill] 验证 3 IDE (Claude/Cursor/Qoder) skills 目录的单源策略
 * 方案A：.ai-skills-store/ 是唯一来源；3 个 IDE 的 skills/ 必须是到 .ai-skills-store/ 的 junction
 * 报警条件：
 *   1. skills/ 下出现指向 .agents/skills/ / AISkills/ / 其他非 ai-skills-store 的 symlink
 *   2. npm 全局复活 skills-link
 *   3. cc-switch skillSyncMethod != "manual" 或 skillStorageLocation != "local"
 *   4. 任何 IDE 的 8 核心 junction (brainstorming/browse/context-restore/grill-me/health/
 *      pixpin-desktop-screenshots/review/using-superpowers) 缺失
 *   5. 任何 IDE 的非核心 skill junction (public-video-rights-cn 等) 缺失或被劫持
 * 运行: npm run verify:skills
 * 退出码: 0=通过, 1=有违规
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const home = os.homedir()
const AI_STORE = path.join(home, '.ai-skills-store')
const IDE_SKILLS = [
  path.join(home, '.claude', 'skills'),
  path.join(home, '.cursor', 'skills'),
  path.join(home, '.qoder', 'skills'),
]
const CORE_8 = [
  'brainstorming', 'browse', 'context-restore', 'grill-me',
  'health', 'pixpin-desktop-screenshots', 'review', 'using-superpowers',
]
// 非核心 skill junction 白名单：3 个 IDE 都必须存在且指向 .ai-skills-store/
// 2026-06-12 新增 public-video-rights-cn（research 类，非核心，按需自取）
// 2026-06-13 批量新增：CLI 引导 + idea-workflow 套件 + smart-summarize 套件 + superpowers-zh 中文版
//   注意: skill 名是容器名，子 skill 在容器下由 hermes os.walk 递归发现，不需要再列入白名单
const NON_CORE_JUNCTIONS = [
  'public-video-rights-cn',
  'report-writer-cn',   // 2026-06-12 新增：中文调研报告 + Word 导出
  // === 2026-06-13 批次 ===
  'self-improving-agent',   // peterskoett/self-improving-agent — 自我反思/学习日志
  'idea-workflow',          // AkoliteZA/hermes-agent-idea-workflow 容器(4 子 skill)
  'feynman-summary',        // merttcetn/feynman-summary — 费曼技巧摘要
  'smart-summarize',        // developerjeremylive/smart-summarize-etheroi 容器(9 子 skill)
  'superpowers-zh',         // jnMetaCode/superpowers-zh 容器(20 个中文 skill,其中 2 个重命名为 -zh)
  'repomix',                // CLI 引导 skill: yamadashy/repomix
  'agent-browser',          // CLI 引导 skill: vercel-labs/agent-browser
  'tokscale',               // CLI 引导 skill: junhoyeo/tokscale (本机 CLI 未装,仅 skill 引导)
]
const FORBIDDEN_TARGET_PATTERNS = [
  '.agents/skills',
  'AISkills',
  path.join(home, 'AISkills'),
]
const CC_SWITCH_SETTINGS = path.join(home, '.cc-switch', 'settings.json')

let violations = 0

function warn(ide, name, reason) {
  console.log(`  [FAIL] ${ide}/${name} — ${reason}`)
  violations++
}

function ok(ide, name, reason) {
  console.log(`  [OK]   ${ide}/${name} — ${reason}`)
}

console.log(`\n=== verify-skills @ ${new Date().toISOString()} ===\n`)

// Check 1: 3 IDE skills/ symlink integrity
for (const dir of IDE_SKILLS) {
  const ide = path.basename(path.dirname(dir))
  console.log(`[${ide}] ${dir}`)
  if (!fs.existsSync(dir)) {
    warn(ide, '<dir>', 'directory missing')
    continue
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const symlinks = []
  const files = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    let isLink = false
    try { isLink = fs.lstatSync(full).isSymbolicLink() } catch {}
    if (isLink) symlinks.push(e.name)
    else files.push(e.name)
  }

  // Check forbidden targets
  for (const name of symlinks) {
    const full = path.join(dir, name)
    let target = ''
    try { target = fs.readlinkSync(full) } catch {}
    const targetNorm = target.replace(/\\/g, '/')
    const isForbidden = FORBIDDEN_TARGET_PATTERNS.some((p) => targetNorm.includes(p.replace(/\\/g, '/')))
    if (isForbidden) {
      warn(ide, name, `forbidden target: ${target}`)
      continue
    }
    if (!targetNorm.includes('.ai-skills-store')) {
      warn(ide, name, `target not in .ai-skills-store: ${target}`)
      continue
    }
    ok(ide, name, `→ ${target}`)
  }

  // Check 8 core presence
  for (const core of CORE_8) {
    if (!symlinks.includes(core)) {
      warn(ide, core, '8-core junction missing')
    }
  }

  // Check non-core junction presence (防止被误删或被劫持)
  for (const nc of NON_CORE_JUNCTIONS) {
    if (!symlinks.includes(nc)) {
      warn(ide, nc, 'non-core junction missing (应指向 .ai-skills-store/ 下的同名目录)')
    }
  }
  if (files.length) {
    console.log(`  [info] ${ide} has ${files.length} non-symlink entries: ${files.join(', ')}`)
  }
  console.log()
}


// Check 3: cc-switch settings
console.log(`[cc-switch] ${CC_SWITCH_SETTINGS}`)
if (!fs.existsSync(CC_SWITCH_SETTINGS)) {
  warn('cc-switch', 'settings.json', 'file missing')
} else {
  try {
    const cfg = JSON.parse(fs.readFileSync(CC_SWITCH_SETTINGS, 'utf8'))
    if (cfg.skillSyncMethod !== 'manual') {
      warn('cc-switch', 'skillSyncMethod', `expected "manual", got "${cfg.skillSyncMethod}"`)
    } else {
      ok('cc-switch', 'skillSyncMethod', '"manual"')
    }
    if (cfg.skillStorageLocation !== 'local') {
      warn('cc-switch', 'skillStorageLocation', `expected "local", got "${cfg.skillStorageLocation}"`)
    } else {
      ok('cc-switch', 'skillStorageLocation', '"local"')
    }
  } catch (e) {
    warn('cc-switch', 'settings.json', `parse failed: ${e.message}`)
  }
}
console.log()

// Summary
console.log('=== Summary ===')
if (violations === 0) {
  console.log('✓ All checks passed. Single-source policy intact.')
  process.exit(0)
} else {
  console.log(`✗ ${violations} violation(s) found. See above.`)
  process.exit(1)
}
