#!/usr/bin/env node
/**
 * [Encoding] 一次性编排 v3 meta + docs + rules + repo doc + README 的 UTF-8 修复
 * 依次 spawn: fix-v3-meta-encoding / write-docs-utf8 / fix-cursor-rules-utf8 / _write-repo-doc-utf8 / _write-readme-utf8。
 * 对应 npm run fix:encoding。不会覆盖 .cursor/skills（用 git restore 恢复）。
 * 运行: node scripts/chinese-encoding/fix-all-encoding.mjs
 */

import { spawnSync } from 'child_process'

import path from 'path'

import { fileURLToPath } from 'url'



const encodingDir = path.dirname(fileURLToPath(import.meta.url))

const monorepoRoot = path.join(encodingDir, '../..')



const steps = [

  'fix-v3-meta-encoding.mjs',

  'write-docs-utf8.mjs',

  'fix-cursor-rules-utf8.mjs',

  '_write-repo-doc-utf8.mjs',

  '_write-readme-utf8.mjs'

]



for (const step of steps) {

  console.log(`\n== ${step} ==`)

  const result = spawnSync(process.execPath, [path.join(encodingDir, step)], {

    cwd: monorepoRoot,

    encoding: 'utf8',

    stdio: 'inherit'

  })

  if (result.status !== 0) process.exit(result.status ?? 1)

}



console.log('\nDone: fix:encoding')

