#!/usr/bin/env node
/**
 * [Encoding] 从 Vue2 源文件合并 template 到 v3 Vue 文件，修复 v3 中损坏的中文
 * 对应 npm run repair:chinese-from-v2。属破坏性操作（覆盖 v3 template）。
 * 运行: node scripts/chinese-encoding/repair-chinese-encoding.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { extractPart, isBlockBroken, transformVue2Template } from './chinese-encoding-core.mjs'
import { monorepoRoot, v3Root, vue2Root } from './paths.mjs'

const V2 = path.join(vue2Root, 'src')
const V3 = path.join(v3Root, 'src')

const TEMPLATE_PROTECTED = new Set([
  'views/web/exam/WebExamCheck.vue',
  'views/web/exam/components/ExamFullMode.vue',
  'views/web/exam/components/QuItemExam.vue'
])

function read(p) {
  return fs.readFileSync(p, 'utf8')
}

function write(rel, content) {
  const file = path.join(V3, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content.replace(/\r\n/g, '\n'), 'utf8')
}

function mergeFromV2(rel) {
  if (TEMPLATE_PROTECTED.has(rel)) return false

  const v2p = path.join(V2, rel)
  const v3p = path.join(V3, rel)
  if (!fs.existsSync(v2p) || !fs.existsSync(v3p)) return false

  const v2 = read(v2p)
  const v3 = read(v3p)
  const v3Template = extractPart(v3, 'template')

  if (!isBlockBroken(v3Template)) return false

  const template = transformVue2Template(extractPart(v2, 'template'))
  const script = extractPart(v3, 'script')
  const style = extractPart(v3, 'style') || extractPart(v2, 'style')
  if (!template) return false

  write(rel, `${template}\n\n${script}\n\n${style}\n`)
  return true
}

const PAIRS = [
  'views/web/exam/WebExamCheck.vue',
  'views/web/exam/WebExamResult/index.vue',
  'views/web/exam/WebExamResult/ThanksOnly.vue',
  'views/web/exam/WebExamResult/ThanksWithScore.vue',
  'views/web/exam/WebExamResult/ResultDetail.vue',
  'views/web/exam/WebExamList/OpenExamPage.vue',
  'views/web/exam/components/QuItemExam.vue',
  'views/web/exam/components/QuItemShow.vue',
  'views/web/exam/components/ExamSocket.vue',
  'views/web/exam/components/LeaveChecker.vue',
  'views/web/exam/components/ResultLeftNav.vue',
  'views/web/exam/components/ExamFullMode.vue',
  'views/web/exam/components/dialog/ExamApplyDialog.vue',
  'views/web/plan/WebPlanDetail.vue',
  'views/web/plan/components/NodeCardAll.vue',
  'layout/Web/UserLayout.vue'
]

let n = 0
for (const rel of PAIRS) {
  if (mergeFromV2(rel)) {
    console.log('MERGE:', rel)
    n++
  }
}

console.log(`\nRepaired ${n} file(s). Protected/skipped files are listed in TEMPLATE_PROTECTED.`)
