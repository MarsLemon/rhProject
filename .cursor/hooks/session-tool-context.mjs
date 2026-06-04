/**
 * sessionStart: inject rhProject tri-tool routing context for Cursor Agent.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const hookDir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(hookDir, '../..')
const collab = path.join(root, '.cursor/wiki/COLLABORATION.md')

function output(obj) {
  process.stdout.write(`${JSON.stringify(obj)}\n`)
}

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

readStdin()

if (!fs.existsSync(collab)) {
  output({})
  process.exit(0)
}

const text = fs.readFileSync(collab, 'utf8')
const summary = [
  'rhProject 三工具协作（sessionStart）',
  '- Cursor：改代码 / build / verify；先 INDEX + rh-project-wiki',
  '- Claude：方案 / 评审 / deep-dive；结论见 reference.md 交接口',
  '- Qoder：Repowiki / rules；刷新后 npm run sync:wiki',
  '- 详情：.cursor/wiki/COLLABORATION.md',
].join('\n')

output({
  additional_context: summary,
  agent_message: text.length > 500 ? summary : text.slice(0, 1200),
})

process.exit(0)
