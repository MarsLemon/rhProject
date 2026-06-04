/**

 * Verify Chinese text is not corrupted (placeholder/mojibake).

 * Usage: node scripts/chinese-encoding/verify-chinese-encoding.mjs

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

