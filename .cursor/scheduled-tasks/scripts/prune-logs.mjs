#!/usr/bin/env node
/**
 * Prune scheduled-task logs older than N days (default 30).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const days = Number(process.env.PRUNE_LOG_DAYS || '30')
const maxAgeMs = days * 24 * 60 * 60 * 1000
const logsDir = path.join(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  'logs',
)

if (!fs.existsSync(logsDir)) {
  console.log('No logs dir:', logsDir)
  process.exit(0)
}

const now = Date.now()
let removed = 0
for (const name of fs.readdirSync(logsDir)) {
  if (!name.endsWith('.log')) continue
  const full = path.join(logsDir, name)
  const st = fs.statSync(full)
  if (now - st.mtimeMs > maxAgeMs) {
    fs.unlinkSync(full)
    removed++
    console.log('Removed:', name)
  }
}
console.log(`Prune done: ${removed} file(s) older than ${days} days`)
