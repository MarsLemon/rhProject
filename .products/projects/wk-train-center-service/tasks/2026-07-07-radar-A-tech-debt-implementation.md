# T1 雷达 A 实施说明(技术债扫描)

> 写给 IDE **默认 agent** 的任务说明
> 创建: 2026-07-07
> Owner: 产品经理 agent(只写说明,不写代码)
> 父任务: [Self-Driving Radar 实施(D6=a 模式)](2026-07-07-radar-A-tech-debt.md)
> 关联 PRD: [PRD-self-driving-radar.md §4.1](../docs/PRD-self-driving-radar.md#41-雷达-a技术债扫描)

---

## 1. 任务概述

### 1.1 终态产物(do/done)

- **`E:\rhProject\scripts\radar-a-techdebt.mjs`** ← 主交付物,Node.js ESM(`.mjs` 后缀,不可用 `require`)
- `E:\rhProject\.products\projects\wk-train-center-service\tasks\inbox\{YYYY-MM-DD}-techdebt.md` ← 跑通脚本后才生成

### 1.2 调用方式

```bash
node E:/rhProject/scripts/radar-a-techdebt.mjs
# 或在仓库根
node scripts/radar-a-techdebt.mjs
```

### 1.3 范围

| 维度 | 值 |
|---|---|
| 6 项目 | `wk-train-center-service` / `wk-train-center-ui` / `wk-train-center-ui-v3` / `wk-mhc-ui` / `wk-mhc-mobile` / `wk-PPTist-ui` |
| 仓库根 | `E:\rhProject\` |
| 排除 | `node_modules/` `.git/` `dist/` `build/` `target/` `tempImg/` `tasks/inbox/` `wiki/_gaps/` `logs/` `scripts/_tmp/` `.products/_tmp/` |
| 跑完时间 | < 5 分钟 |

---

## 2. 五类扫描的实现指引

> 每类独立 try/catch。**任一抛 throw,捕获后 `console.error` + 写"雷达 A-{类别} 失败: ${err.message}" 到日志,继续下一类,不中断**。

### 2.1 v3 空壳扫描

**核心算法**(伪代码,直接照抄):

```js
// 文件: scripts/radar-a-techdebt.mjs
import { glob } from 'node:fs/promises' // 或 fast-glob
import { statSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const V3_SRC = 'E:/rhProject/wk-train-center-ui-v3/src'
const SHELL_REGEX = /占位|placeholder|TODO|FIXME|空函数|mount\s*\(\s*\)\s*\{\s*\}/

async function scanEmptyShells() {
  const shells = []
  for await (const file of glob('**/*.{vue,ts,tsx}', { cwd: V3_SRC })) {
    const abs = resolve(V3_SRC, file)
    const stat = statSync(abs)
    if (stat.size >= 1024) continue
    const text = readFileSync(abs, 'utf-8')
    if (SHELL_REGEX.test(text)) {
      shells.push({ path: file, size: stat.size, abs })
    }
  }
  return shells
}
```

**判定条件**(三条都满足才入候选):
- 路径必须以 `wk-train-center-ui-v3/src/` 开头
- 文件 size < 1024 bytes
- 内容匹配 shell 特征正则(参见 `dump_placeholder_files.py` 的 classify 函数对照逻辑)

**Top 20 截断** + 按 size 升序(越小的越像空壳)。

### 2.2 TODO/FIXME 扫描

**核心算法**:

```js
const TODO_RE = /\b(TODO|FIXME|XXX|HACK)\b[:：]?\s*([^\n]{1,200})/g
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', 'target',
                      'tempImg', 'tasks/inbox', 'wiki/_gaps', 'logs',
                      'scripts/_tmp', '.products/_tmp']
const PROJECTS = ['wk-train-center-service', 'wk-train-center-ui',
                  'wk-train-center-ui-v3', 'wk-mhc-ui', 'wk-mhc-mobile',
                  'wk-PPTist-ui']
const FILE_GLOBS = ['**/*.java', '**/*.ts', '**/*.tsx', '**/*.vue',
                    '**/*.js', '**/*.jsx']

async function scanTodos(root) {
  const matches = []
  for (const pattern of FILE_GLOBS) {
    for await (const file of glob(pattern, {
      cwd: root,
      ignore: EXCLUDE_DIRS.map(d => `**/${d}/**`),
    })) {
      const text = readFileSync(resolve(root, file), 'utf-8')
      for (const m of text.matchAll(TODO_RE)) {
        const line = text.slice(0, m.index).split('\n').length
        matches.push({
          project: root.split('/').pop(),
          file,
          line,
          type: m[1],
          text: m[2].trim(),
        })
      }
    }
  }
  return matches
}
```

**分组聚合**: 按 `${project}:${file}` 聚合,Top 20 文件(命中数最多)。

### 2.3 重复代码扫描(jscpd)

**命令模板**(跑前用 `execFileSync` 调):

```bash
mkdir -p .products/_tmp/jscpd/

npx jscpd \
  'wk-train-center-ui*/src/**/*.{vue,ts,tsx,js}' \
  'wk-train-center-service/*/src/main/java/**/*.java' \
  'wk-mhc-ui/apps/*/src/**/*.{ts,html}' \
  'wk-mhc-mobile/src/**/*.{ts,vue}' \
  'wk-PPTist-ui/src/**/*.{ts,vue}' \
  --reporters json \
  --output .products/_tmp/jscpd/ \
  --min-lines 50 \
  --min-tokens 100 \
  --ignore '**/node_modules/**' '**/dist/**' '**/target/**'
```

**过滤 + 取前 N**:

```js
import { readFileSync } from 'node:fs'
const report = JSON.parse(
  readFileSync('.products/_tmp/jscpd/jscpd-report.json', 'utf-8')
)
const dupes = report.duplicates
  .filter(d => d.lines >= 50 && d.tokens >= 100)
  .slice(0, 20)
  .map(d => ({
    firstFile: d.firstFile.name,
    secondFile: d.secondFile.name,
    lines: d.lines,
    fragment: d.fragment.slice(0, 120),
  }))
```

**超时保护**: 用 `execFileSync` 加 `{ timeout: 60_000 }`(60 秒),超时就跳过这一类,日志记超时。

### 2.4 未跑测试扫描

**核心算法**(伪代码,参照 `audit-v3-imports.py` 的 glob 思路):

```js
import { execFileSync } from 'node:child_process'
import { glob } from 'node:fs/promises'

const PROJECTS = [
  // 三个真正能跑的命令(其他项目跳过)
  {
    name: 'wk-train-center-service',
    cwd: 'E:/rhProject/wk-train-center-service',
    cmd: 'mvn',
    args: ['test', '-q', '-pl', 'yf-web'],
    timeoutMs: 180_000,
  },
  {
    name: 'wk-train-center-ui-v3',
    cwd: 'E:/rhProject/wk-train-center-ui-v3',
    cmd: 'npm',
    args: ['run', 'typecheck'],
    timeoutMs: 90_000,
  },
  {
    name: 'wk-train-center-ui',
    cwd: 'E:/rhProject/wk-train-center-ui',
    cmd: 'npm',
    args: ['run', 'lint'],
    timeoutMs: 90_000,
  },
]

async function scanUntested() {
  const results = []
  for (const p of PROJECTS) {
    try {
      const out = execFileSync(p.cmd, p.args, {
        cwd: p.cwd,
        timeout: p.timeoutMs,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      results.push({ project: p.name, status: 'OK', exitCode: 0, out: out.slice(-500) })
    } catch (err) {
      // err.stdout / err.stderr 含测试输出
      results.push({
        project: p.name,
        status: 'FAIL',
        exitCode: err.status ?? 1,
        out: (err.stdout ?? err.message ?? '').slice(-500),
      })
    }
  }
  return results
}
```

**说明**: "未测"语义放宽——脚本只跑**项目级测试命令**,失败 = 该项目未绿,进候选(不深究具体哪个 Service 缺测)。要降级为静态扫描时,用 `glob` 找 `*Service.java` 缺对应 `*ServiceTest.java` 的清单。

### 2.5 孤儿导出扫描

**核心算法**(移植自 `scripts/audit-v3-imports.py` 的 list_exports + grep 用法):

```js
import { glob } from 'node:fs/promises'
import { readFileSync } from 'node:fs'

async function scanOrphans() {
  const TS_PROJECTS = [
    'wk-train-center-ui-v3', 'wk-mhc-ui', 'wk-mhc-mobile', 'wk-PPTist-ui',
  ]
  const exportMap = new Map() // name -> [{ file, line, project }]

  // 第一遍: 收集所有命名导出
  for (const proj of TS_PROJECTS) {
    const root = `E:/rhProject/${proj}/src`
    for await (const file of glob('**/*.{ts,tsx,vue}', {
      cwd: root, ignore: ['**/node_modules/**', '**/dist/**'],
    })) {
      const text = readFileSync(`${root}/${file}`, 'utf-8')
      const lines = text.split('\n')
      lines.forEach((line, i) => {
        const m = /^export\s+(?:async\s+)?(?:function|const|class|interface|type|enum)\s+(\w+)/.exec(line)
        if (m && !m[1].startsWith('_')) {
          const key = `${proj}:${m[1]}`
          if (!exportMap.has(key)) exportMap.set(key, [])
          exportMap.get(key).push({ file, line: i + 1, project: proj })
        }
      })
    }
  }

  // 第二遍: 找使用
  const usedNames = new Set()
  for (const proj of TS_PROJECTS) {
    const root = `E:/rhProject/${proj}/src`
    for await (const file of glob('**/*.{ts,tsx,vue}', {
      cwd: root, ignore: ['**/node_modules/**', '**/dist/**'],
    })) {
      const text = readFileSync(`${root}/${file}`, 'utf-8')
      // import { foo, bar } from '...'
      for (const m of text.matchAll(/import\s*(?:type\s*)?\{([^}]+)\}\s*from/g)) {
        m[1].split(',').forEach(n => {
          const real = n.trim().split(/\s+as\s+/)[0].trim()
          if (real && !real.startsWith('type ')) usedNames.add(`${proj}:${real}`)
        })
      }
    }
  }

  // 差集 = 孤儿(同项目内才计,跨项目不算)
  const orphans = []
  for (const [key, locs] of exportMap) {
    const proj = key.split(':')[0]
    const name = key.split(':')[1]
    // 只看同项目内是否有引用
    const usedInProj = [...usedNames].some(k => k.startsWith(proj + ':') && k.endsWith(':' + name))
    if (!usedInProj) orphans.push({ project: proj, name, locs: locs.slice(0, 3) })
  }
  return orphans.slice(0, 20)
}
```

**注意**: `global.d.ts` / `.d.ts` 跳过(声明文件不是真"孤儿")。

---

## 3. 产出 md 模板

```markdown
# Tech Debt Radar Report — {YYYY-MM-DD}

> 跑通时间: {HH:mm}
> 总候选: N 条(🔴 高: X / 🟡 中: Y / 🟢 低: Z)
> 跑通时长: Ns

## 摘要

| 类别 | 命中数 | Top 3 关键词 |
|---|---|---|
| v3 空壳 | N | src/views/user/index.vue, ... |
| TODO/FIXME | N | "学员" 12 处, "权限" 7 处, ... |
| 重复代码 | N 对 | jwt 工具类 × 2, 树形菜单 × 2, ... |
| 未跑测试 | N 项目失败 | wk-train-center-service: 3 failures, ... |
| 孤儿导出 | N | wk-train-center-ui-v3: ElButton, ... |

## 🔴 高优先级(必修 - 等主人拍板才动手)

### HD-001: <一句话标题,例: v3 ucenter 全为空壳页>
- **类别**: v3 空壳
- **项目**: wk-train-center-ui-v3
- **路径**: `src/views/ucenter/index.vue`
- **现象**: file size = 312B,内容仅含 `mount() {}`
- **建议**: 标"只标记不修复"(参考 CLAUDE.md § Vue3 迁移工作流 v3 空壳原则)
- **关联**: PRD §4.1 v3 空壳扫描

(每条候选重复上述 block,加一句"现象" + 一句"建议"。总数 ≤ 20 条)

## 🟡 中优先级(应该修 - 等排期)
... 同上模板 ...

## 🟢 低优先级(可选 - 进 backlog 排队)
... 同上模板 ...

## 跳过(白名单命中,已忽略)

| 命中文件 | 命中原因 |
|---|---|
| `wk-train-center-ui/node_modules/...` | 白名单: node_modules |
| `wk-train-center-ui-v3/.products/...` | 白名单: .products |
```

**优先级判定规则**(写进 .mjs 里):

| 类别 | 🔴 | 🟡 | 🟢 |
|---|---|---|---|
| v3 空壳 | size < 200B 且 ucenter/ 等核心模块 | size 200B-1024B | 其他 |
| TODO/FIXME | FIXME / XXX / HACK | TODO 带具体需求描述 | TODO 仅一句话且无上下文 |
| 重复代码 | lines > 100 | lines 50-100 | - |
| 未跑测试 | exit_code != 0 | timeout | - |
| 孤儿导出 | 公共组件 lib/ | 业务 page/ | utility 工具函数 |

---

## 4. 验收命令

```bash
# 1. 跑通(应在 5 分钟内完成)
cd E:/rhProject
node scripts/radar-a-techdebt.mjs
echo "exit=$?"

# 2. 验证产物存在
ls -la E:/rhProject/.products/projects/wk-train-center-service/tasks/inbox/ | grep techdebt

# 3. 验证 5 类齐全
cat E:/rhProject/.products/projects/wk-train-center-service/tasks/inbox/$(date +%Y-%m-%d)-techdebt.md | grep -E "^## " # 应看到 5 类别小标题 + 跳过小节

# 4. 验证白名单生效(0 命中)
grep -E "node_modules|\.git/|dist/|target/|tasks/inbox/" \
  E:/rhProject/.products/projects/wk-train-center-service/tasks/inbox/$(date +%Y-%m-%d)-techdebt.md
# 预期: 0 命中(或仅"跳过(白名单命中,已忽略)"小节里提到)

# 5. 验证时长 < 5 分钟
# 看日志最后一行: "done in 287s"

# 6. 验证 todo 里没有"自动 commit"指令
grep -i "commit" E:/rhProject/scripts/radar-a-techdebt.mjs
# 预期: 0 命中(脚本绝不能 commit,只入候选)
```

---

## 5. 失败处理

### 5.1 单类失败不中断其他

```js
// 伪代码结构
async function main() {
  const sections = {}
  const scanners = [
    ['v3空壳', scanEmptyShells],
    ['TODO/FIXME', scanTodos],
    ['重复代码', scanDup],
    ['未跑测试', scanUntested],
    ['孤儿导出', scanOrphans],
  ]
  for (const [name, fn] of scanners) {
    try {
      sections[name] = await fn()
      log(`OK ${name}: ${sections[name].length} hits`)
    } catch (err) {
      log(`FAIL ${name}: ${err.message}`, 'error')
      sections[name] = [] // 空数组,不渲染
    }
  }
  writeInbox(renderMd(sections))
}
```

### 5.2 日志路径与格式

```js
// 强制路径
import { mkdirSync, appendFileSync } from 'node:fs'
const LOG_DIR = 'E:/rhProject/logs/radar'
const LOG_FILE = `${LOG_DIR}/$(date +%Y-%m-%d)-techdebt.log`

mkdirSync(LOG_DIR, { recursive: true })
function log(msg, level = 'info') {
  const line = `[${new Date().toISOString()}] [${level}] ${msg}\n`
  appendFileSync(LOG_FILE, line)
  if (level === 'error') console.error(line.trim())
  else console.log(line.trim())
}
```

**日志内容包含**: 启动时间、每类 scanner OK/FAIL、最终命中数、总耗时、退出码。

---

## 6. 红线清单

- ❌ **不改任何业务代码** — 脚本是只读扫描器,产出 md 即停
- ❌ **不删 v3 空壳** — 仅在 md 里"标"为候选(`size < 1024 + SHELL_REGEX 命中`),绝不 `unlink`
- ❌ **不写 `el_training_record` 相关代码** — 即使发现 TODO 涉及此字段也只入候选,不修改
- ❌ **不改 package.json 除加 jscpd devDep** — 唯一允许的写入
- ❌ **不 git add / commit** — 脚本纯只读
- ❌ **不直连 DB / 跑业务接口** — 只读文件系统
- ❌ **不修改 PRD / Wiki** — 只写 `tasks/inbox/` 产出

### 6.1 红线自检(脚本启动必跑)

```js
// 启动时 sanity check:禁止某些破坏性 syscall
const ALLOWED_WRITE = new Set([
  'tasks/inbox',
  'logs/radar',
  '.products/_tmp/jscpd',
])
```

---

## 7. 依赖

### 7.1 必装依赖

| 依赖 | 用途 | 安装方式 |
|---|---|---|
| Node.js 18+ | 跑 `.mjs` | 系统已有 |
| `jscpd` | 重复代码扫描 | `npm i -D jscpd`(用户手动执行) |

### 7.2 jscpd 安装说明

**(用户手动跑,脚本不跑)**:

```bash
cd E:/rhProject
# 方案 A: 加到根 package.json devDependencies
npm i -D jscpd
# 方案 B: 新建 scripts/package.json(若想与根项目隔离)
# 在 scripts/package.json 中:
# {
#   "name": "radar-scripts",
#   "private": true,
#   "type": "module",
#   "devDependencies": { "jscpd": "^4.0.0" }
# }
# 然后: cd scripts && npm i
```

**判断选哪个**: 根 `package.json` 没 jscpd,且担心污染根依赖 → 用 B。简化优先 → 用 A。**二选一即可,不要两个都装**。

### 7.3 不引入新依赖

- ❌ 不要装 `fast-glob`(根 `glob` 用 `node:fs/promises.glob` 够用,版本要求 Node 22+;若 Node < 22,用 `node:fs` 的 `readdirSync` 递归)
- ❌ 不要装 `chalk` / `lodash` 等美化包(脚本是 CLI 内部,主人只读 md)
- ❌ 不要装 `commander` / `yargs`(单文件脚本,参数硬编码即可)

---

## 8. 完成后产物清单

### 8.1 必交(do/done 判据)

- [ ] `scripts/radar-a-techdebt.mjs` — 主交付物,可重复跑
- [ ] `tasks/inbox/{YYYY-MM-DD}-techdebt.md` — 跑通后自动生成
- [ ] `logs/radar/{YYYY-MM-DD}-techdebt.log` — 运行日志

### 8.2 可选(用户手动决策后才交)

- [ ] `package.json` 加 `jscpd` 到 `devDependencies`(或新建 `scripts/package.json`)
- [ ] `.gitignore` 加 `.products/_tmp/`(临时产物的 git 忽略)

### 8.3 不该交(红线)

- [x] ~~改任何业务 .java/.vue/.ts~~ 禁
- [x] ~~改 PRD.md / Wiki~~ 禁
- [x] ~~git commit~~ 禁

---

## 9. IDE 默认 agent 实施步骤(SOP)

按顺序执行,任一步卡住先自查再问主人:

1. **读 `.mjs` 入口模板**: 复制本文件第 2 节"五类扫描的实现指引"里的 5 段伪代码到 `scripts/radar-a-techdebt.mjs`
2. **补全文件框架**: 加 `import`、`main()` 函数、文件写入逻辑(参照第 3 节 md 模板)
3. **加红线条目**: 启动时跑 `ALLOWED_WRITE` 自检(第 6.1 节)
4. **跑 dry-run**: `node scripts/radar-a-techdebt.mjs --dry-run` 验证只 log 不写盘(可选,看进度决定加不加)
5. **真跑**: `node scripts/radar-a-techdebt.mjs`
6. **验收**: 跑第 4 节 6 条验收命令,全过才算完成
7. **回头更新** `2026-07-07-radar-A-tech-debt.md` 把"📋 todo"改成"🚧 doing" → "✅ done"(Orchestrator 来收尾,不归 agent)

### 9.1 卡点兜底

| 卡点 | 怎么办 |
|---|---|
| jscpd 装不上 | 跳过 2.3,日志记"jscpd 安装失败,跳过重复代码扫描",照常产出其他 4 类 |
| Node 版本 < 22 | 把第 2 节伪代码里 `for await (const f of glob(...))` 替换为 `readdirSync` 递归 |
| 5 分钟超时 | 优先砍 2.4(未跑测试,跑 mvn 慢),留其他 4 类;产物里标 "[超时跳过]" |
| inbox 目录不存在 | 脚本启动 `mkdirSync(..., { recursive: true })` |

---

## 10. 参考与边界

### 10.1 参考文件(必读)

- `scripts/audit-v3-imports.py` — 2.5 节孤儿扫描算法源头
- `scripts/dump_placeholder_files.py` — 2.1 节 v3 空壳分类器参照(更宽松,本任务取其 classify 函数简化版)
- `.products/projects/wk-train-center-service/docs/PRD-self-driving-radar.md §4.1` — 任务定义
- `CLAUDE.md § Vue3 迁移工作流` — v3 空壳只标记不修复的依据

### 10.2 边界

- **写代码**: ✅ 写 `.mjs` + 必要时加 jscpd dep
- **跑命令**: ✅ 跑 `npm i -D jscpd`(用户授权后)
- **改业务代码**: ❌ 不动 .java/.vue/.ts 内容
- **commit**: ❌ 不自动 commit
- **删文件**: ❌ 绝不删(只标记)
- **PRD / Wiki 更新**: ❌ 不动

> **本文档结束。默认 agent 可复制第 2 节伪代码 + 第 3 节模板 + 第 9 节 SOP 直接开干。**
