#!/usr/bin/env node
/**
 * [Skill] 执行 P0/P1 skill 清理
 * 归档/删除 skill-cleaner 报告标记的冗余 skill，修复 doc-sync frontmatter。
 * 运行: node scripts/apply-skill-cleanup.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const home = os.homedir()
const rhProject = 'e:\\rhProject'
const archiveRoots = [
  path.join(home, '.cursor', 'skills-archived'),
  path.join(home, '.claude', 'skills-archived'),
]
const skillRoots = [
  path.join(home, '.cursor', 'skills'),
  path.join(home, '.claude', 'skills'),
]

const toArchive = [
  'angular-spec-generator',
  'form-generator',
  'module-generator',
  'fullstack-developer',
  'dws',
]

const toDelete = ['�������-skill']

function rmrf(p) {
  if (!fs.existsSync(p)) return
  fs.rmSync(p, { recursive: true, force: true })
  console.log('DELETED', p)
}

function moveSkill(fromRoot, archiveRoot, name) {
  const src = path.join(fromRoot, name)
  const dest = path.join(archiveRoot, name)
  if (!fs.existsSync(src)) return
  fs.mkdirSync(archiveRoot, { recursive: true })
  if (fs.existsSync(dest)) rmrf(dest)
  fs.renameSync(src, dest)
  console.log('ARCHIVED', src, '->', dest)
}

for (const ar of archiveRoots) {
  fs.mkdirSync(ar, { recursive: true })
}

for (let i = 0; i < skillRoots.length; i++) {
  const root = skillRoots[i]
  const archive = archiveRoots[i]
  for (const name of toDelete) moveSkill(root, archive, name) // delete via archive? no - delete entirely
  for (const name of toDelete) rmrf(path.join(root, name))
  for (const name of toArchive) moveSkill(root, archive, name)
}

// P0: remove ui-v3 chinese-encoding-guard stub
rmrf(path.join(rhProject, 'wk-train-center-ui-v3', '.cursor', 'skills', 'chinese-encoding-guard'))

// P0: fix doc-sync frontmatter (both cursor/claude if present)
const docSyncBody = `# Document Synchronization Skill

## Description
Synchronize markdown documentation files to the remote ShowDoc knowledge base.

## When to use
- After creating or updating any technical documentation (.md files)
- When the user asks to "sync docs", "upload docs", or "update knowledge base"
- Before closing a task that involved documentation changes to ensure the remote KB is up-to-date

## Instructions
1. **Locate Script**: Verify the existence of \`sync_docs.js\` in \`e:\\rhProject\\wk-train-center-ui\\docs\\����\\ai��ع���\\\`.
2. **Execute Sync**: Run the synchronization script using Node.js.
3. **Report Result**: Confirm to the user that documents have been successfully synced to ShowDoc (Root Category: 1.1).

## Command
\`\`\`bash
node "e:\\rhProject\\wk-train-center-ui\\docs\\����\\ai��ع���\\sync_docs.js"
\`\`\`
`

const docSyncFixed = `---
name: doc-sync
description: Sync markdown docs to ShowDoc via sync_docs.js. Use when user asks to sync/upload docs or after documentation task completion.
---

${docSyncBody}`

for (const root of skillRoots) {
  const f = path.join(root, 'doc-sync', 'SKILL.md')
  if (fs.existsSync(f)) {
    fs.writeFileSync(f, docSyncFixed, 'utf8')
    console.log('FIXED', f)
  }
}

const archiveReadme = `# Archived Agent Skills

Moved out of active \`~/.cursor/skills\` to reduce discovery noise.
Restore: move folder back to \`~/.cursor/skills/<name>\`.

| Skill | Reason |
|-------|--------|
| angular-spec-generator | Angular stack, not rhProject Vue3 |
| form-generator | ng-zorro Angular |
| module-generator | Angular business modules |
| fullstack-developer | React/Next focused |
| dws | DingTalk; install on demand |
`

for (const ar of archiveRoots) {
  fs.writeFileSync(path.join(ar, 'README.md'), archiveReadme, 'utf8')
}

console.log('Done.')
