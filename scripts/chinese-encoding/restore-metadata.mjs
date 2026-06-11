#!/usr/bin/env node
/**
 * [Encoding] verify 前的预处理：自动重生成 v3 repo doc 为 UTF-8
 * Skill / reference / rules 不在本脚本恢复（用 git restore 恢复）。
 * 运行: 被 verify-chinese-encoding.mjs 自动 import。
 */
import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import { detectIssues } from './chinese-encoding-core.mjs'
import { monorepoRoot, v3Root, encodingScriptsDir } from './paths.mjs'

const repoDocScript = path.join(encodingScriptsDir, '_write-repo-doc-utf8.mjs')
const repoDocCanonical = path.join(
  v3Root,
  'documents/20260530-\u77e5\u8bc6\u5e93\u6a21\u5757-Vue3\u5b9e\u73b0\u8bf4\u660e.md'
)

function scoreCjk(text) {
  return (text.match(/[\u4e00-\u9fff]/g) || []).length
}

function repoDocNeedsRestore() {
  if (!fs.existsSync(repoDocCanonical)) return true
  const text = fs.readFileSync(repoDocCanonical, 'utf8')
  return scoreCjk(text) < 50 || detectIssues(text, repoDocCanonical).length > 0
}

export function restoreMetadataIfNeeded({ silent = false } = {}) {
  if (!fs.existsSync(repoDocScript) || !repoDocNeedsRestore()) {
    return false
  }
  if (!silent) console.log('Auto-restore: v3 repo doc')
  spawnSync(process.execPath, [repoDocScript], { cwd: monorepoRoot, encoding: 'utf8', stdio: silent ? 'ignore' : 'inherit' })
  return true
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  restoreMetadataIfNeeded()
}
