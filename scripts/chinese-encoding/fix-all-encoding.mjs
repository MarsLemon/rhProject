/**

 * One-shot metadata encoding repair (v3 meta + docs + rules + repo doc + README).

 * Usage: node scripts/chinese-encoding/fix-all-encoding.mjs

 * Does NOT overwrite .cursor/skills — use git restore if ROS docs are corrupted.

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

