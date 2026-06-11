#!/usr/bin/env node
/**
 * [Wiki-Lib] wiki 索引生成的核心工具库
 * 暴露 walkMd / groupByTop / buildGeneratedIndexLines / syncWikiIndex 四个函数。
 * 被 _emit-wiki-index.mjs / sync-cursor-wiki-index.mjs / verify-wiki-index.mjs 调用。
 * 运行: 不直接运行，供其他脚本 import 使用。
 */
import fs from 'node:fs'
import path from 'node:path'

export function walkMd(dir, prefix = '') {
  const entries = []
  if (!fs.existsSync(dir)) return entries
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${name.name}` : name.name
    const full = path.join(dir, name.name)
    if (name.isDirectory()) {
      entries.push(...walkMd(full, rel))
    } else if (name.name.endsWith('.md')) {
      entries.push(rel.replace(/\\/g, '/'))
    }
  }
  return entries.sort((a, b) => a.localeCompare(b, 'zh'))
}

export function groupByTop(files) {
  const groups = new Map()
  for (const f of files) {
    const top = f.includes('/') ? f.split('/')[0] : '(root)'
    if (!groups.has(top)) groups.set(top, [])
    groups.get(top).push(f)
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh'))
}

export function buildGeneratedIndexLines(sources, generatedAt = new Date().toISOString()) {
  const lines = [
    '# GENERATED-INDEX（自动生成，勿手改）',
    '',
    `> 生成时间：${generatedAt}`,
    '> 命令：`node scripts/sync-cursor-wiki-index.mjs` 或 `npm run sync:wiki`',
    '',
  ]
  let total = 0
  for (const { label, base } of sources) {
    const files = walkMd(base)
    total += files.length
    lines.push(`## ${label}`, '')
    if (files.length === 0) {
      lines.push('_尚未找到 `.qoder/repowiki`，请在 Qoder 中生成后再跑脚本。_', '', '')
      continue
    }
    lines.push(`共 **${files.length}** 篇，Repowiki 根：\`${label}/.qoder/repowiki/zh/content/\``, '')
    for (const [top, list] of groupByTop(files)) {
      lines.push(`### ${top}`, '')
      for (const f of list) {
        lines.push(`- \`${f}\``)
      }
      lines.push('')
    }
  }
  lines.push('---', '', `**合计**：${total} 篇`, '')
  return { lines, total }
}

export function syncWikiIndex(root, outFile = path.join(root, '.cursor/wiki/GENERATED-INDEX.md')) {
  const sources = [
    {
      label: 'wk-train-center-service',
      base: path.join(root, 'wk-train-center-service/.qoder/repowiki/zh/content'),
    },
    {
      label: 'wk-train-center-ui',
      base: path.join(root, 'wk-train-center-ui/.qoder/repowiki/zh/content'),
    },
  ]
  const { lines, total } = buildGeneratedIndexLines(sources)
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, lines.join('\n'), 'utf8')
  return { outFile, total }
}
