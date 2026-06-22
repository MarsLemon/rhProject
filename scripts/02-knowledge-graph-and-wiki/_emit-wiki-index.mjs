#!/usr/bin/env node
/**
 * [Wiki] 生成 wiki 索引
 * 调用 lib/wiki-index.mjs 扫描项目 wiki 并输出索引文件。
 * 运行: node scripts/_emit-wiki-index.mjs
 */
import { syncWikiIndex } from './lib/wiki-index.mjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { outFile, total } = syncWikiIndex(root)
process.stdout.write(`OK ${total} ${outFile}\n`)
