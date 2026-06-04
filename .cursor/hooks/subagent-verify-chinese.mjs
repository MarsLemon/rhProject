/**
 * After subagent (Task) stops: run Chinese encoding verify.
 * On failure, inject followup_message for the parent agent.
 */
import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const hookDir = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(hookDir, '../..')
const verifyScript = path.join(monorepoRoot, 'scripts/chinese-encoding/verify-chinese-encoding.mjs')
const restoreScript = path.join(monorepoRoot, 'scripts/chinese-encoding/restore-metadata.mjs')

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

function output(obj) {
  process.stdout.write(`${JSON.stringify(obj)}\n`)
}

if (!fs.existsSync(verifyScript)) {
  console.error(
    `[subagent-verify-chinese] verify script not found: ${verifyScript}. ` +
      'Open workspace at monorepo root (e.g. rhProject) or run npm run verify:chinese manually.'
  )
  output({})
  process.exit(0)
}

readStdin()
if (fs.existsSync(restoreScript)) {
  spawnSync(process.execPath, [restoreScript], { cwd: monorepoRoot, encoding: 'utf8', stdio: 'ignore' })
}

const result = spawnSync(process.execPath, [verifyScript], {
  cwd: monorepoRoot,
  encoding: 'utf8'
})

if (result.status === 0) {
  output({})
  process.exit(0)
}

const detail = (result.stderr || result.stdout || '').trim().slice(0, 800)
output({
  followup_message:
    '\u5b50 Agent \u4efb\u52a1\u5df2\u7ed3\u675f\u3002\u4e2d\u6587\u7f16\u7801\u6821\u9a8c\u672a\u901a\u8fc7\uff0c\u8bf7\u7acb\u5373\u6267\u884c\uff1a\n' +
    '1. npm run verify:chinese  \uff08rhProject \u6839\u76ee\u5f55\uff09\n' +
    '2. \u82e5\u5931\u8d25\uff1a\u5bf9\u7167 Vue2 \u624b\u5de5\u4fee\u590d\uff0c\u6216 npm run fix:encoding\uff0c\u6216\u786e\u8ba4\u540e npm run repair:chinese-from-v2\n' +
    '3. \u518d\u6b21 npm run verify:chinese \u76f4\u5230\u901a\u8fc7\n' +
    '4. \u5411\u7528\u6237\u6c47\u62a5\u6821\u9a8c\u7ed3\u679c\n' +
    (detail ? `\n\u6821\u9a8c\u8f93\u51fa\u6458\u8981\uff1a\n${detail}` : '')
})
process.exit(0)
