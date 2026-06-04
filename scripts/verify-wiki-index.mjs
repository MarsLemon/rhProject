#!/usr/bin/env node
/**
 * Compare Repowiki .md count vs GENERATED-INDEX.md total line.
 * Exit 0 if match; 1 if mismatch or missing index.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { walkMd } from './lib/wiki-index.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const indexFile = path.join(root, '.cursor/wiki/GENERATED-INDEX.md')
const reportDir = path.join(root, '.cursor/scheduled-tasks/reports')
const reportFile = path.join(reportDir, 'wiki-index-check.txt')

const sources = [
  path.join(root, 'wk-train-center-service/.qoder/repowiki/zh/content'),
  path.join(root, 'wk-train-center-ui/.qoder/repowiki/zh/content'),
]

let diskTotal = 0
const perSource = []
for (const base of sources) {
  const n = walkMd(base).length
  diskTotal += n
  perSource.push({ base, count: n, exists: fs.existsSync(base) })
}

let indexTotal = null
if (fs.existsSync(indexFile)) {
  const text = fs.readFileSync(indexFile, 'utf8')
  const m = /\*\*合计\*\*[：:]\s*(\d+)\s*篇/.exec(text)
  if (m) indexTotal = Number(m[1])
}

const lines = [
  `# Wiki index check (${new Date().toISOString()})`,
  '',
  `disk_md_total: ${diskTotal}`,
  `index_total: ${indexTotal ?? 'MISSING'}`,
  '',
  '## Sources',
  ...perSource.map((s) => `- ${s.base} → ${s.count} (${s.exists ? 'ok' : 'missing'})`),
  '',
]

const ok = indexTotal !== null && indexTotal === diskTotal
lines.push(ok ? 'status: OK' : 'status: MISMATCH')
lines.push('')

fs.mkdirSync(reportDir, { recursive: true })
fs.writeFileSync(reportFile, lines.join('\n'), 'utf8')
console.log(lines.join('\n'))
console.log('Report:', reportFile)

if (!ok) process.exit(1)
process.exit(0)
