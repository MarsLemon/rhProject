/**
 * Shared scan paths and walk helpers for verify / scan-all.
 */
import fs from 'fs'
import path from 'path'
import { detectIssues, formatRelPath } from './chinese-encoding-core.mjs'
import { monorepoRoot, v3Root, encodingScriptsDir } from './paths.mjs'

export const skipDirs = new Set(['node_modules', 'public', 'dist', 'build', 'coverage', '.git', 'target', 'logs'])

export const verifyExts = new Set(['.vue', '.ts', '.tsx', '.js', '.mjs', '.mdc', '.md'])

export const fullScanExts = new Set([
  ...verifyExts,
  '.jsx',
  '.java',
  '.xml',
  '.properties'
])

/** Paths for `npm run verify:chinese` (ROS gate). */
export const verifyScanRoots = [
  path.join(v3Root, 'src'),
  path.join(v3Root, 'documents'),
  path.join(v3Root, '.cursor', 'skills'),
  path.join(v3Root, '.cursor', 'rules'),
  encodingScriptsDir,
  path.join(monorepoRoot, '.cursor', 'hooks'),
  path.join(monorepoRoot, '.cursor', 'rules'),
  path.join(monorepoRoot, '.cursor', 'skills'),
  path.join(monorepoRoot, '.cursor', 'wiki'),
  path.join(monorepoRoot, 'wk-train-center-ui', 'documents'),
  path.join(monorepoRoot, 'wk-train-center-service', 'documents'),
  path.join(monorepoRoot, 'wk-train-center-service', '.qoder', 'rules'),
  path.join(monorepoRoot, 'wk-train-center-ui', '.qoder', 'rules')
]

/** [label, absolutePath] for `npm run scan:chinese` (full monorepo report). */
export const fullScanRoots = [
  ['wk-train-center-ui-v3/src', path.join(v3Root, 'src')],
  ['wk-train-center-ui-v3/documents', path.join(v3Root, 'documents')],
  ['wk-train-center-ui-v3/.cursor', path.join(v3Root, '.cursor')],
  ['scripts/chinese-encoding', encodingScriptsDir],
  ['wk-train-center-ui/src', path.join(monorepoRoot, 'wk-train-center-ui/src')],
  ['wk-train-center-ui/documents', path.join(monorepoRoot, 'wk-train-center-ui/documents')],
  ['wk-mhc-mobile/src', path.join(monorepoRoot, 'wk-mhc-mobile/src')],
  ['wk-mhc-ui/remotes', path.join(monorepoRoot, 'wk-mhc-ui/remotes')],
  ['wk-PPTist-ui/src', path.join(monorepoRoot, 'wk-PPTist-ui/src')],
  ['wk-train-center-service/wk-modules', path.join(monorepoRoot, 'wk-train-center-service/wk-modules')],
  ['wk-train-center-service/documents', path.join(monorepoRoot, 'wk-train-center-service/documents')],
  ['wk-train-center-service/sql', path.join(monorepoRoot, 'wk-train-center-service/sql')],
  ['.cursor', path.join(monorepoRoot, '.cursor')],
  ['wk-train-center-service/.qoder/rules', path.join(monorepoRoot, 'wk-train-center-service/.qoder/rules')],
  ['wk-train-center-ui/.qoder/rules', path.join(monorepoRoot, 'wk-train-center-ui/.qoder/rules')]
]

function shouldSkipFile(name, exts) {
  const ext = path.extname(name)
  if (!exts.has(ext)) return true
  if (name.endsWith('.test.md') || name.endsWith('.min.js')) return true
  return false
}

export function walkVerifyRoots(onFile) {
  for (const root of verifyScanRoots) {
    walkDir(root, verifyExts, onFile)
  }
}

export function walkFullScanRoots(onFile) {
  for (const [label, root] of fullScanRoots) {
    walkDir(root, fullScanExts, (file) => onFile(file, label, root))
  }
}

function walkDir(dir, exts, onFile) {
  if (!fs.existsSync(dir)) return
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) {
      if (skipDirs.has(name)) continue
      walkDir(full, exts, onFile)
      continue
    }
    if (shouldSkipFile(name, exts)) continue
    onFile(full)
  }
}

export function collectVerifyProblems() {
  const problems = []
  walkVerifyRoots((file) => {
    const text = fs.readFileSync(file, 'utf8')
    const issues = detectIssues(text, file)
    if (issues.length) {
      problems.push({ rel: formatRelPath(v3Root, file), issues })
    }
  })
  return problems
}

export function collectFullScanProblems() {
  const problems = []
  walkFullScanRoots((file, label, root) => {
    const text = fs.readFileSync(file, 'utf8')
    const issues = detectIssues(text, file)
    if (issues.length) {
      problems.push({
        rel: `${label}/${path.relative(root, file).replace(/\\/g, '/')}`,
        issues
      })
    }
  })
  return problems
}
