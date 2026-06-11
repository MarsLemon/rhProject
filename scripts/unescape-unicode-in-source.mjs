/**
 * [Encoding] 把 JS/TS/Vue 源码中的 \uXXXX / \u{XXXXX} 转义还原为 UTF-8 中文
 * 默认扫描: wk-mhc-mobile / wk-train-center-ui / wk-train-center-ui-v3 (src + scripts)
 * 会跳过正则字符类中的 \u 以免破坏 Validators.pattern。
 * 运行: node scripts/unescape-unicode-in-source.mjs [projectDir ...]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const defaultProjects = [
  'wk-mhc-mobile',
  'wk-train-center-ui',
  'wk-train-center-ui-v3',
]

const skipDirs = new Set([
  'node_modules',
  'public',
  'dist',
  'build',
  '.git',
  'coverage',
])

const exts = new Set(['.vue', '.ts', '.tsx', '.js', '.mjs', '.jsx'])

const skipFilePatterns = [
  /\.min\.js$/,
  /\.map$/,
  /unescape-unicode-in-source\.mjs$/,
]

function shouldSkipFile(name) {
  return skipFilePatterns.some(re => re.test(name))
}

function unescapeUnicode(text) {
  return text
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

/** 跳过正则字符类中的 \\uXXXX，避免破坏 Validators.pattern 等 */
function unescapeUnicodeInSource(text) {
  const regexClassPattern = /(\/(?:\\.|[^/\\])+\/[gimsuy]*|\[(?:\\.|[^\]])+\])/g
  const parts = text.split(regexClassPattern)
  return parts
    .map((part, i) => (i % 2 === 1 ? part : unescapeUnicode(part)))
    .join('')
}

function hasUnicodeEscapes(text) {
  return /\\u(?:\{[0-9a-fA-F]+\}|[0-9a-fA-F]{4})/.test(text)
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(ent.name)) continue
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(full, out)
    else if (exts.has(path.extname(ent.name)) && !shouldSkipFile(ent.name)) out.push(full)
  }
  return out
}

function scanRoots(projectRoot) {
  const roots = ['src', 'scripts'].map(r => path.join(projectRoot, r))
  const files = []
  for (const r of roots) walk(r, files)
  return files
}

function processProject(projectName) {
  const projectRoot = path.join(repoRoot, projectName)
  if (!fs.existsSync(projectRoot)) {
    console.warn('skip missing project:', projectName)
    return { changed: 0, scanned: 0 }
  }

  let changed = 0
  let scanned = 0
  for (const file of scanRoots(projectRoot)) {
    scanned++
    const raw = fs.readFileSync(file, 'utf8')
    if (!hasUnicodeEscapes(raw)) continue
    const next = unescapeUnicodeInSource(raw)
    if (next !== raw) {
      fs.writeFileSync(file, next, 'utf8')
      changed++
      console.log('fixed:', path.relative(repoRoot, file).replace(/\\/g, '/'))
    }
  }
  return { changed, scanned }
}

const projects = process.argv.slice(2).length ? process.argv.slice(2) : defaultProjects

console.log('Unescape \\uXXXX in source (UTF-8 write)\n')
let totalChanged = 0
let totalScanned = 0
for (const p of projects) {
  console.log(`\n== ${p} ==`)
  const { changed, scanned } = processProject(p)
  totalChanged += changed
  totalScanned += scanned
  console.log(`scanned ${scanned}, changed ${changed}`)
}
console.log(`\nDone. ${totalChanged} file(s) updated.`)
