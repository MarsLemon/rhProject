#!/usr/bin/env node
/**
 * [Encoding] 用 cursor-rules-content.json 重新生成 wk-train-center-ui-v3 的 .cursor/rules/ 为 UTF-8
 * 运行: node scripts/chinese-encoding/fix-cursor-rules-utf8.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v3Root } from './paths.mjs'

const encodingDir = path.dirname(fileURLToPath(import.meta.url))
const rulesDir = path.join(v3Root, '.cursor', 'rules')
const content = JSON.parse(
  fs.readFileSync(path.join(encodingDir, 'cursor-rules-content.json'), 'utf8')
)

fs.mkdirSync(rulesDir, { recursive: true })
for (const [name, body] of Object.entries(content)) {
  const file = path.join(rulesDir, name)
  fs.writeFileSync(file, body, 'utf8')
  console.log('OK:', name)
}
