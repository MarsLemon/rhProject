#!/usr/bin/env node
/** Install deep-dive-skill to global Cursor skills */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const base = 'https://raw.githubusercontent.com/davethegut/deep-dive-skill/main'
const dest = path.join(os.homedir(), '.cursor', 'skills', 'skill-deep-dive')

const files = [
  'SKILL.md',
  'template.html',
  'AGENTS.md',
  'README.md',
  'LICENSE',
  'examples/sample-deep-dive-output.html',
]

async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return await res.text()
}

for (const rel of files) {
  const url = `${base}/${rel}`
  const out = path.join(dest, rel)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  const text = await fetchText(url)
  fs.writeFileSync(out, text, 'utf8')
  console.log('OK', rel)
}

console.log('Installed:', dest)
