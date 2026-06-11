#!/usr/bin/env node
/**
 * [System] 确保 logs/jvm 目录存在，并把根目录散落的 JVM 诊断文件搬过去
 * 匹配规则: hs_err_pid*.log / replay_pid*.log / java_pid*.hprof
 * 运行: node scripts/ensure-jvm-log-dir.mjs
 * 建议加入 git hook 或 Cursor scheduled-tasks 定时运行。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jvmDir = path.join(repoRoot, 'logs', 'jvm')

fs.mkdirSync(jvmDir, { recursive: true })

const patterns = [/^hs_err_pid.+\.log$/i, /^replay_pid.+\.log$/i, /^java_pid.+\.hprof$/i]

let moved = 0
for (const name of fs.readdirSync(repoRoot)) {
  if (!patterns.some((re) => re.test(name))) continue
  const src = path.join(repoRoot, name)
  const dest = path.join(jvmDir, name)
  if (!fs.statSync(src).isFile()) continue
  if (fs.existsSync(dest)) fs.unlinkSync(dest)
  fs.renameSync(src, dest)
  moved++
  console.log('Moved:', name, '-> logs/jvm/')
}

if (moved === 0) console.log('No stray JVM files in repo root.')
else console.log(`Done: ${moved} file(s) moved to logs/jvm/`)
