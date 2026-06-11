#!/usr/bin/env node
/**
 * [Encoding] 重新生成 scripts/chinese-encoding/README.md 为 UTF-8（用 \u 转义写入）
 * 防 Cursor / 编辑器误写导致 README.md 本身乱码。
 * 运行: node scripts/chinese-encoding/_write-readme-utf8.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const encodingDir = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(encodingDir, 'README.md')

const content = `# \u4e2d\u6587 UTF-8 \u7f16\u7801\u7ba1\u63a7\uff08rhProject\uff09

\u672c\u76ee\u5f55\u662f monorepo **\u4e2d\u6587\u7f16\u7801 ROS** \u7684\u811a\u672c\u5b9e\u73b0\u5c42\uff0c\u4e0e Cursor Skill / Rule / Hook \u914d\u5408\uff0c\u9632\u6b62\u6e90\u7801\u3001\u6587\u6863\u3001Agent \u5143\u6570\u636e\u51fa\u73b0\u4e71\u7801\uff08mojibake\u3001\`????\` \u5360\u4f4d\u3001\`\uFFFD\` \u66ff\u6362\u7b26\uff09\u3002

> **\u82e5\u672c\u6587\u6863\u663e\u793a\u4e71\u7801**\uff1a\u5728 rhProject \u6839\u76ee\u5f55\u6267\u884c \`node scripts/chinese-encoding/_write-readme-utf8.mjs\`\uff08\u6216 \`npm run fix:encoding\`\uff09\u3002\u52ff\u7528 PowerShell \u91cd\u5b9a\u5411\u7f16\u8f91\u3002

---

## \u8fd9\u5957\u4e1c\u897f\u89e3\u51b3\u4ec0\u4e48\u95ee\u9898\uff1f

\u5728 Windows + \u591a Agent \u534f\u4f5c\u573a\u666f\u4e0b\uff0c\u4e2d\u6587\u5bb9\u6613\u88ab\u9519\u8bef\u7f16\u7801\u8bfb\u5199\uff0c\u8868\u73b0\u4e3a\uff1a

- \u9875\u9762 Toast\u3001\u8868\u5355 label \u663e\u793a\u4e71\u7801
- Markdown / \`.mdc\` \u89c4\u5219\u4e0d\u53ef\u8bfb
- Vue \`template\` \u6574\u5757\u635f\u574f
- \u6784\u5efa\u6216\u63d0\u4ea4\u524d\u624d\u53d1\u73b0\u95ee\u9898

\u672c ROS \u63d0\u4f9b\uff1a**\u68c0\u6d4b\u95e8\u7981**\u3001**\u4fee\u590d\u9636\u68af**\u3001**Agent \u5199\u5165\u7ea6\u675f**\uff0c\u628a UTF-8 \u4f5c\u4e3a\u5168\u4ed3\u9ed8\u8ba4\u3002

---

## \u6574\u4f53\u67b6\u6784\uff08ROS\uff09

| \u5c42\u7ea7 | \u4f4d\u7f6e | \u7ed9\u8c01\u770b | \u505a\u4ec0\u4e48 |
|------|------|--------|--------|
| **Skill** | [\`.cursor/skills/chinese-encoding-guard/SKILL.md\`](../../.cursor/skills/chinese-encoding-guard/SKILL.md) | Cursor Agent / \u5f00\u53d1\u8005 | \u6d41\u7a0b\u3001\u786c\u6027\u89c4\u5219\u3001\u4fee\u590d\u9636\u68af |
| **Reference** | [\`.cursor/skills/chinese-encoding-guard/reference.md\`](../../.cursor/skills/chinese-encoding-guard/reference.md) | \u67e5\u8868 | npm \u547d\u4ee4\u3001\u811a\u672c\u6e05\u5355\u3001\u89e6\u53d1\u70b9 |
| **Rule\uff08\u5e38\u9a71\uff09** | [\`.cursor/rules/subagent-chinese-verify.mdc\`](../../.cursor/rules/subagent-chinese-verify.mdc) | \u59cb\u7ec8\u751f\u6548 | \u5b50 Agent \u7981\u6b62\u5199\u4e2d\u6587 \`.vue/.ts\` |
| **Rule\uff08\u5165\u53e3\uff09** | [\`.cursor/rules/chinese-encoding-guard.mdc\`](../../.cursor/rules/chinese-encoding-guard.mdc) | \u6309\u573a\u666f | \u6307\u5411 Skill |
| **Operations** | \u672c\u76ee\u5f55 + [\`.cursor/hooks/subagent-verify-chinese.mjs\`](../../.cursor/hooks/subagent-verify-chinese.mjs) | \u81ea\u52a8\u6267\u884c | \u626b\u63cf\u3001\u95e8\u7981 |
| **v3 \u59d4\u6258** | [\`wk-train-center-ui-v3/scripts/_run-encoding.mjs\`](../../wk-train-center-ui-v3/scripts/_run-encoding.mjs) | v3 \u5185 npm | \u8f6c\u53d1\u5230\u672c\u76ee\u5f55 |

**\u9605\u8bfb\u987a\u5e8f**\uff1a\u672c README \u2192 \u56db\u6761 npm \u2192 \u6539\u4ee3\u7801\u524d\u8bfb SKILL.md\u3002

---

## \u5feb\u901f\u5f00\u59cb\uff08rhProject \u6839\u76ee\u5f55\uff09

\`\`\`bash
npm run verify:chinese    # \u95e8\u7981\uff08\u6539\u4e2d\u6587\u540e / build \u524d\uff09
npm run scan:chinese      # \u5168\u4ed3\u6269\u5c55\u626b\u63cf
npm run fix:encoding      # \u4fee\u590d v3 \u5143\u6570\u636e\u4e0e\u6587\u6863\uff08\u542b\u672c README\uff09
npm run repair:chinese-from-v2   # \u7834\u574f\u6027\uff1aVue2 template \u8986\u76d6
\`\`\`

v3 \u5185\uff1a\`npm run verify:chinese\`\uff08prebuild \u4f1a\u81ea\u52a8\u6267\u884c\uff09\u3002

---

## npm \u547d\u4ee4\u8bf4\u660e

| \u547d\u4ee4 | \u811a\u672c | \u7528\u9014 |
|------|------|------|
| \`verify:chinese\` | \`verify-chinese-encoding.mjs\` | v3 \u6e90\u7801 + Cursor \u5143\u6570\u636e\uff1b\u65e5\u5e38\u95e8\u7981 |
| \`scan:chinese\` | \`scan-all-encoding-report.mjs\` | \u542b mobile / Java / \u5176\u4ed6\u524d\u7aef |
| \`fix:encoding\` | \`fix-all-encoding.mjs\` | \u5143\u6570\u636e\u3001\u8fc1\u79fb\u6587\u6863\u3001rules\u3001repo doc\u3001\u672c README |
| \`repair:chinese-from-v2\` | \`repair-chinese-encoding.mjs\` | \u4ec5\u66ff\u6362\u635f\u574f\u7684 v3 \`<template>\` |

---

## \u672c\u76ee\u5f55\u811a\u672c

| \u6587\u4ef6 | \u8bf4\u660e |
|------|------|
| \`chinese-encoding-core.mjs\` | \u4e71\u7801\u68c0\u6d4b\u3001Vue2\u2192Vue3 \u6a21\u677f\u8f6c\u6362 |
| \`scan-config.mjs\` | verify / scan \u5171\u4eab\u626b\u63cf\u8def\u5f84 |
| \`restore-metadata.mjs\` | verify \u524d\u81ea\u6108 v3 \u77e5\u8bc6\u5e93 doc |
| \`verify-chinese-encoding.mjs\` | ROS \u95e8\u7981 |
| \`scan-all-encoding-report.mjs\` | \u5168\u4ed3\u62a5\u544a |
| \`fix-all-encoding.mjs\` | \`fix:encoding\` \u7f16\u6392 |
| \`fix-v3-meta-encoding.mjs\` | index.html / settings.ts / package.json |
| \`write-docs-utf8.mjs\` | v3 \u8fc1\u79fb\u6587\u6863 |
| \`fix-cursor-rules-utf8.mjs\` | \u91cd\u5199 v3 \`.cursor/rules\` |
| \`_write-repo-doc-utf8.mjs\` | v3 \u77e5\u8bc6\u5e93\u6a21\u5757\u8bf4\u660e |
| \`_write-readme-utf8.mjs\` | **\u672c README\uff08\u6b64\u6587\u6863\uff09** |
| \`repair-chinese-encoding.mjs\` | \u5bf9\u7167 Vue2 \u4fee\u590d template |
| \`cursor-rules-content.json\` | v3 rules \u5185\u5bb9\u6e90 |

---

## Skill \u4e0e Rule

- **Skill** [\`.cursor/skills/chinese-encoding-guard/\`](../../.cursor/skills/chinese-encoding-guard/SKILL.md)\uff1aAgent \u600e\u4e48\u5199\u3001\u600e\u4e48\u4fee\u3001\u786c\u6027\u7981\u6b62\u9879\uff08\u4ec5 monorepo \u6839 \`.cursor/skills/\`\uff0c\u65e0 ui-v3 \u526f\u672c\uff09\u3002
- **subagent-chinese-verify.mdc**\uff1a\u5b50 Agent \u6279\u6b21\u540e\u5fc5\u987b \`verify:chinese\`\u3002

---

## \u63a8\u8350\u5de5\u4f5c\u6d41

1. \u786e\u8ba4\u7f16\u8f91\u5668 UTF-8\uff1b\u52ff PowerShell \`Get-Content\` / \`Set-Content\` \u5904\u7406\u542b\u4e2d\u6587\u6e90\u7801\u3002
2. \u4e3b\u4f1a\u8bdd Write \u4e2d\u6587\uff1b\u5b50 Agent \u53ea\u8bfb\u5206\u6790\u3002
3. Vue2\u2192Vue3\uff1a\`wk-train-center-ui-v3/scripts/copy-vue2-views.mjs\`\u3002
4. \`npm run verify:chinese\` \u901a\u8fc7\u540e\u518d build / \u63d0\u4ea4\u3002

---

## \u5e38\u89c1\u95ee\u9898

**\`verify\` \u4e0e \`scan\` \u533a\u522b\uff1f** verify \u8303\u56f4\u5c0f\u3001\u901f\u5ea6\u5feb\uff0cbuild \u4f9d\u8d56\u5b83\u3002scan \u8986\u76d6\u5168\u4ed3\u5386\u53f2\u4e71\u7801\u3002

**\u672c README \u518d\u6b21\u4e71\u7801\uff1f** \u6267\u884c \`node scripts/chinese-encoding/_write-readme-utf8.mjs\`\u3002

**Skill \u635f\u574f\uff1f** \u7528 \`git restore\`\uff0c\u4e0d\u518d\u7528\u811a\u672c\u526f\u672c\u8986\u76d6\u3002

---

## \u94fe\u63a5

- [SKILL.md](../../.cursor/skills/chinese-encoding-guard/SKILL.md)
- [reference.md](../../.cursor/skills/chinese-encoding-guard/reference.md)
- [Wiki INDEX](../../.cursor/wiki/INDEX.md)
`

fs.writeFileSync(out, content, { encoding: 'utf8' })
console.log('OK: scripts/chinese-encoding/README.md')
