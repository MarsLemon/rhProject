#!/usr/bin/env node
/**
 * [Encoding-Lib] 中文编码检测与 Vue2 模板/脚本转换的核心库
 * 暴露: allowsPlaceholderDocs / isBlockBroken / detectIssues / transformVue2Template / transformVue2ScriptImports / transformVue2File / formatRelPath / extractPart。
 * 运行: 不直接运行，供同目录下其他脚本 import 使用。
 */
import path from 'path'

export const Q = '\u003f'
export const PLACEHOLDER4 = Q.repeat(4)

const MOJIBAKE_SEQ = /(?:\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]|\u00EF\u00BC[\u0080-\u00BF])/

const PLACEHOLDER_DOC_ALLOW = [
  /chinese-encoding-guard\/SKILL\.md$/,
  /chinese-encoding-guard\/reference\.md$/,
  /chinese-encoding\/README\.md$/,
  /_write-readme-utf8\.mjs$/,
  /chinese-encoding-core\.mjs$/
]

const ATTR_SCAN = [
  ['label', /label="([^"]*)"/g],
  ['content', /content="([^"]*)"/g],
  ['description', /description="([^"]*)"/g],
  ['placeholder', /placeholder="([^"]*)"/g],
  ['title', /title="([^"]*)"/g]
]

export function allowsPlaceholderDocs(filePath = '') {
  const norm = filePath.replace(/\\/g, '/')
  return PLACEHOLDER_DOC_ALLOW.some(re => re.test(norm))
}

export function extractPart(text, tag) {
  const re = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'i')
  return text.match(re)?.[0] ?? ''
}

export function isBlockBroken(text) {
  if (!text) return false
  if (text.includes(PLACEHOLDER4)) return true
  if (text.includes('\uFFFD')) return true
  if (MOJIBAKE_SEQ.test(text)) return true
  if (/[\u0080-\u00BF]{2,}/.test(text) && !/[\u4e00-\u9fff]/.test(text)) return true
  return false
}

export function detectIssues(text, filePath = '') {
  const issues = []
  const allowPlaceholder = allowsPlaceholderDocs(filePath)

  if (!allowPlaceholder && text.includes(PLACEHOLDER4)) {
    issues.push('contains 4-question-mark placeholder')
  }
  if (text.includes('\uFFFD')) {
    issues.push('contains Unicode replacement char U+FFFD')
  }
  if (MOJIBAKE_SEQ.test(text)) {
    issues.push('suspected mojibake byte sequences')
  }

  for (const [name, re] of ATTR_SCAN) {
    let hit = false
    for (const m of text.matchAll(re)) {
      const val = m[1]
      if (MOJIBAKE_SEQ.test(val) || (/[\u0080-\u00BF]{2,}/.test(val) && !/[\u4e00-\u9fff]/.test(val))) {
        issues.push(`suspected mojibake in ${name} attribute`)
        hit = true
        break
      }
    }
    if (hit) continue
  }

  if (/followup_message[\s\S]*(?:\uFFFD|(?:\u00C3[\u0080-\u00BF]))/.test(text)) {
    issues.push('suspected mojibake in followup_message')
  }

  const template = extractPart(text, 'template')
  if (template && isBlockBroken(template)) {
    issues.push('suspected corruption in template block')
  }

  const script = extractPart(text, 'script')
  if (script && isBlockBroken(script)) {
    issues.push('suspected corruption in script block')
  }

  return [...new Set(issues)]
}

export function transformVue2Template(content) {
  return content
    .replace(/size="mini"/g, 'size="small"')
    .replace(/::v-deep/g, ':deep')
    .replace(/:visible\.sync=/g, 'v-model:visible=')
    .replace(/\$navBack/g, 'navBack')
    .replace(/@business/g, '@/components/ComponentsBusiness')
}

export function transformVue2ScriptImports(content) {
  return content
    .replace(/from '@\/api\/client\/plan\/plan'/g, "from '@/api/client/plan/client'")
    .replace(/\bplanDetail\(/g, 'planGetDetail(')
    .replace(/\bjoinPlan\(/g, 'planJoin(')
}

export function transformVue2File(content) {
  return transformVue2ScriptImports(transformVue2Template(content))
}

export function formatRelPath(projectRoot, file) {
  const rel = path.relative(projectRoot, file).replace(/\\/g, '/')
  if (rel.startsWith('..')) {
    return rel.replace(/^\.\.\//, '')
  }
  return rel
}
