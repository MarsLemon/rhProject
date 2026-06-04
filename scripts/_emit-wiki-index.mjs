#!/usr/bin/env node
import { syncWikiIndex } from './lib/wiki-index.mjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { outFile, total } = syncWikiIndex(root)
process.stdout.write(`OK ${total} ${outFile}\n`)
