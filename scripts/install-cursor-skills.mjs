#!/usr/bin/env node
/**
 * [Skill] 从 GitHub 拉取 find-skills / skill-cleaner 安装到全局 Cursor skills
 * 运行: node scripts/install-cursor-skills.mjs
 * 目标: %USERPROFILE%\.cursor\skills
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const skillsRoot = path.join(process.env.USERPROFILE || process.env.HOME, '.cursor', 'skills')

const items = [
  {
    dir: 'find-skills',
    files: [
      ['SKILL.md', 'https://raw.githubusercontent.com/vercel-labs/skills/main/skills/find-skills/SKILL.md'],
    ],
  },
  {
    dir: 'skill-cleaner',
    files: [
      ['SKILL.md', 'https://raw.githubusercontent.com/steipete/agent-scripts/main/skills/skill-cleaner/SKILL.md'],
      ['scripts/skill-cleaner.ts', 'https://raw.githubusercontent.com/steipete/agent-scripts/main/skills/skill-cleaner/scripts/skill-cleaner.ts'],
    ],
  },
]

async function download(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return await res.text()
}

for (const { dir, files } of items) {
  for (const [rel, url] of files) {
    const out = path.join(skillsRoot, dir, rel)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    const text = await download(url)
    fs.writeFileSync(out, text, 'utf8')
    console.log('OK', path.join(dir, rel))
  }
}

console.log('Done:', skillsRoot)
