#!/usr/bin/env node
/**
 * [Encoding] 一次性生成完整编码扫描报告到 _encoding-report.txt
 * 同时跑 verify (v3 + Cursor metadata) 和 full scan (整个 monorepo)。
 * 运行: node scripts/chinese-encoding/_run-report.mjs
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
