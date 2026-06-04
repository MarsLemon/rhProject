/**
 * Replace \\uXXXX escape sequences with UTF-8 Chinese in source files.
 * Usage: node scripts/decode-unicode-escapes.mjs [dir...]
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultRoots = [
  path.join(__dirname, '../wk-mhc-mobile/src/pages/smart-training'),
  path.join(__dirname, '../wk-train-center-ui/src/views/web/ai'),
  path.join(__dirname, '../wk-train-center-ui-v3/src/views/web/ai'),
]

const skipDirs = new Set(['node_modules', 'dist', 'public', '.git'])
const exts = new Set(['.vue', '.ts', '.tsx', '.js', '.mjs'])

function decodeUnicodeEscapes(text) {
  if (!/\\u[0-9a-fA-F]{4}/.test(text))
    return null
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  )
}

function walk(dir, changed) {
  if (!fs.existsSync(dir))
    return
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const st = fs.statSync(full)
    if (st.isDirectory()) {
      if (skipDirs.has(name))
        continue
      walk(full, changed)
      continue
    }
    const ext = path.extname(name)
    if (!exts.has(ext))
      continue
    const raw = fs.readFileSync(full, 'utf8')
    const decoded = decodeUnicodeEscapes(raw)
    if (decoded != null && decoded !== raw) {
      fs.writeFileSync(full, decoded, 'utf8')
      changed.push(full)
    }
  }
}

const roots = process.argv.length > 2
  ? process.argv.slice(2).map(r => path.resolve(r))
  : defaultRoots

const changed = []
for (const root of roots)
  walk(root, changed)

if (changed.length === 0) {
  console.log('No \\uXXXX escapes found to decode.')
}
else {
  console.log(`Decoded ${changed.length} file(s):`)
  for (const f of changed)
    console.log(`  ${f}`)
}
