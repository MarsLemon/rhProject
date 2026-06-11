#!/usr/bin/env node
/**
 * [Encoding] ROS gate：检测源码/文档/Agent metadata 中的中文乱码（占位符 / mojibake / U+FFFD）
 * 失败时 exit 非零，可作为 prebuild / precommit 钩子。
 * 运行: node scripts/chinese-encoding/verify-chinese-encoding.mjs
 * 对应 npm run verify:chinese
 */

import { restoreMetadataIfNeeded } from './restore-metadata.mjs'

import { collectVerifyProblems } from './scan-config.mjs'



restoreMetadataIfNeeded({ silent: true })



const problems = collectVerifyProblems()



if (problems.length === 0) {

  console.log('OK: no Chinese encoding issues found')

  process.exit(0)

}



console.error(`Found ${problems.length} file(s) with encoding issues:\n`)

for (const p of problems) {

  console.error(`  ${p.rel}`)

  for (const i of p.issues) console.error(`    - ${i}`)

}

console.error('\nFix: npm run fix:encoding  (rhProject root)')

console.error('Or:  npm run repair:chinese-from-v2  (destructive, Vue2 templates)')

console.error('Or:  npm run scan:chinese  (full monorepo report)')

process.exit(1)

