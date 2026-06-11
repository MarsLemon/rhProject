#!/usr/bin/env node
/**
 * [Encoding] 全 monorepo 编码扫描（mobile / Java / docs / Cursor metadata）
 * 比 verify 范围更广，仅报告，不阻塞。
 * 运行: node scripts/chinese-encoding/scan-all-encoding-report.mjs
 */

import { collectFullScanProblems } from './scan-config.mjs'



const problems = collectFullScanProblems()



console.log(`# Encoding scan report (${new Date().toISOString()})`)

console.log(`Total issues: ${problems.length}\n`)



if (problems.length === 0) {

  console.log('OK: no Chinese encoding issues found')

  process.exit(0)

}



for (const p of problems) {

  console.log(p.rel)

  for (const i of p.issues) console.log(`  - ${i}`)

  console.log('')

}



process.exit(1)

