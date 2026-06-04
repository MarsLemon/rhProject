/**
 * One-off: write scan results to _encoding-report.txt
 * Usage: node scripts/chinese-encoding/_run-report.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { collectVerifyProblems } from './scan-config.mjs'
import { collectFullScanProblems } from './scan-config.mjs'

const dir = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(dir, '_encoding-report.txt')

const verify = collectVerifyProblems()
const full = collectFullScanProblems()

const lines = [
  `# encoding report ${new Date().toISOString()}`,
  '',
  `## verify:chinese (${verify.length} files)`,
  ...verify.flatMap(p => [p.rel, ...p.issues.map(i => `  - ${i}`), '']),
  '',
  `## scan:chinese (${full.length} files)`,
  ...full.flatMap(p => [p.rel, ...p.issues.map(i => `  - ${i}`), ''])
]

fs.writeFileSync(out, lines.join('\n'), 'utf8')
console.log('Wrote', out)
console.log('verify:', verify.length, 'scan:', full.length)
process.exit(verify.length + full.length > 0 ? 1 : 0)
