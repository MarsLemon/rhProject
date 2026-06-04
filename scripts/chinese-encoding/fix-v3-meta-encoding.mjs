/**
 * Fix v3 project meta UTF-8 (index.html, settings.ts, package.json fields).
 * Usage: node scripts/chinese-encoding/fix-v3-meta-encoding.mjs
 */
import fs from 'fs'
import path from 'path'
import { v3Root } from './paths.mjs'

function writeUtf8(rel, content) {
  const file = path.join(v3Root, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content, { encoding: 'utf8' })
  console.log('OK:', rel)
}

writeUtf8(
  'index.html',
  `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>\u667a\u80fd\u57f9\u8bad\u7cfb\u7edf</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`
)

const pkgPath = path.join(v3Root, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
pkg.description = '\u667a\u80fd\u57f9\u8bad\u7cfb\u7edf Vue3 + TypeScript \u7248'
pkg.author = '\u9752\u5c9b\u5112\u6d77'
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
console.log('OK: package.json')

writeUtf8(
  'src/settings.ts',
  `export default {
  title: '\u667a\u80fd\u57f9\u8bad\u7cfb\u7edf',
  showSettings: false,
  tagsView: false,
  fixedHeader: false,
  sidebarLogo: true,
  errorLog: 'production'
}
`
)

console.log('\n\u5b8c\u6210\u3002\u82e5 docs \u4ecd\u4e71\u7801\uff0c\u8bf7\u6267\u884c: npm run fix:encoding')
