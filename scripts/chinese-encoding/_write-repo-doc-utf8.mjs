/**
 * Restore repo module doc as UTF-8.
 * Usage: node scripts/chinese-encoding/_write-repo-doc-utf8.mjs
 */
import fs from 'fs'
import path from 'path'
import { v3Root } from './paths.mjs'

const docs = path.join(v3Root, 'documents')
const asciiSrc = path.join(docs, '20260530-repo-vue3-impl.md')
const canonical = path.join(
  docs,
  '20260530-\u77e5\u8bc6\u5e93\u6a21\u5757-Vue3\u5b9e\u73b0\u8bf4\u660e.md'
)

function scoreCjk(text) {
  return (text.match(/[\u4e00-\u9fff]/g) || []).length
}

function readSource() {
  if (fs.existsSync(asciiSrc)) {
    const text = fs.readFileSync(asciiSrc, 'utf8')
    if (scoreCjk(text) > 50) return text
  }
  return buildFallbackContent()
}

function buildFallbackContent() {
  return [
    '# \u77e5\u8bc6\u5e93\u6a21\u5757\uff08repo / \u5237\u9898\u8bad\u7ec3\uff09Vue3 \u5b9e\u73b0\u8bf4\u660e',
    '',
    '> \u7248\u672c\uff1av1.0  \u4f5c\u8005\uff1aAI\u52a9\u624b  \u66f4\u65b0\uff1a2026-05-30',
    '',
    '---',
    '',
    '## \u672f\u8bed\u8bf4\u660e',
    '',
    '\u672c\u6587\u6863\u6307 repo \u5237\u9898\u8bad\u7ec3\u6a21\u5757\uff1b\u5bfc\u822a\u300c\u77e5\u8bc6\u5e93\u300d\u8bfe\u7a0b\u5165\u53e3\u89c1 `src/views/web/course/`\u3002',
    '',
    '*\u6700\u540e\u66f4\u65b0\uff1a2026-05-30*'
  ].join('\n')
}

const content = readSource().replace(/\r\n/g, '\n')
fs.writeFileSync(asciiSrc, content, 'utf8')
fs.writeFileSync(canonical, content, 'utf8')

console.log('OK: wrote', asciiSrc)
console.log('OK: wrote', canonical)
console.log('CJK score:', scoreCjk(content))
console.log('Preview:', content.slice(0, 80))
