#!/usr/bin/env node
/**
 * Scan Qoder RepoWiki trees and write .cursor/wiki/GENERATED-INDEX.md
 * Run from repo root after refreshing Repowiki in Qoder IDE.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { syncWikiIndex } from './lib/wiki-index.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { outFile, total } = syncWikiIndex(root)
console.log(`Wrote ${outFile} (${total} entries)`)
