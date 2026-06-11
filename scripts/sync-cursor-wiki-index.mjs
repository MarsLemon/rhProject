#!/usr/bin/env node
/**
 * [Wiki] 扫描 Qoder RepoWiki 生成 .cursor/wiki/GENERATED-INDEX.md
 * 在 Qoder IDE 刷新 Repowiki 后执行，将 .md 文件同步为 Cursor 可识别的索引。
 * 运行: node scripts/sync-cursor-wiki-index.mjs
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { syncWikiIndex } from './lib/wiki-index.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { outFile, total } = syncWikiIndex(root)
console.log(`Wrote ${outFile} (${total} entries)`)
