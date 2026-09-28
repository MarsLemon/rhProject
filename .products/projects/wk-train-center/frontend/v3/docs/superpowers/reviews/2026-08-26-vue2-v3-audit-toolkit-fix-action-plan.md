# 🛠 Vue2→Vue3 审计工具包 — 修复行动方案

> **配套文件**:审查报告 `2026-08-26-vue2-v3-audit-toolkit-review.md`(同目录)
> **目标**:让工具真正能用 + 让主人达成"逐文件无遗漏"目标
> **预估投入**:Step 1-5 共 ~3 天,Step 6 另算

---

## 🎯 总策略(给主人拍板)

### 三条路任选

| 路线 | 内容 | 时长 | 适用 |
|---|---|---|---|
| **A. 完整修复(推荐)** | Step 1-5 全做 + 实际跑通验证 | ~3 天 | 主人想靠工具完成迁移 |
| **B. 快速止血 + 迭代** | 只修 Step 1(P0)+ Step 2(componentMethods 对比),其他按需补 | ~半天 | 主人急着先看到报告 |
| **C. 废弃工具,人工 diff** | 跳过 audit 工具,直接用 `.migration-audit/REPORT.md` + 人工逐文件 diff | 0 投入 | 主人觉得工具不划算 |

**默认推荐 A**,因为工具一旦跑通,后续每次 master 改 vue 文件都能跑一遍,长期价值高。

---

## 📋 详细执行步骤

### Step 1 — 修 3 条真 P0(~10 分钟)

**目标**:工具能从"跑就崩"变成"能跑出报告"

#### 1.1 修 `@babel/traverse` import

**文件**:`scripts/audit/logic-extractor.js:10`

```js
// 改前
import traverse from '@babel/traverse';

// 改后
import traverse from '@babel/traverse';
const { traverse: doTraverse } = traverse;
// 全文所有 traverse(ast, ...) 改成 doTraverse(ast, ...)
```

或更简洁:

```js
// 改后(方案 B)
import { traverse as doTraverse } from '@babel/traverse';
```

**验证**:
```bash
cd scripts/audit && node -e "
import('./logic-extractor.js').then(m => 
  m.extractBusinessLogic('E:/rhProject/wk-train-center-ui/src/store/index.js')
    .then(r => console.log('OK:', r.error || 'apiCalls=' + r.apiCalls.length))
    .catch(e => console.error('CRASH:', e.message))
);
"
# 期望:OK: apiCalls=N(数字)
```

#### 1.2 修 `crypto` 缺 import

**文件**:`scripts/audit/logic-extractor.js` 顶部(import 段)

```js
// 加这一行
import crypto from 'crypto';
```

#### 1.3 修 filters 检测条件

**文件**:`scripts/audit/logic-extractor.js:112`

```js
// 改前
if (name === 'filters' && t.isCallExpression(path.node.value)) {

// 改后
if (name === 'filters' && t.isObjectExpression(path.node.value)) {
```

**理由**:vue 的 `filters: { formatDate() {} }` 是 ObjectExpression,不是 CallExpression。`isCallExpression` 永远 false → filters 永远检测不到。

---

### Step 2 — 补 compareFingerprints componentMethods 对比(~30 分钟)

**目标**:主人"业务逻辑完全一致"核心目标能落地

#### 2.1 加 method 对比逻辑

**文件**:`scripts/audit/logic-extractor.js:212-272` 的 `compareFingerprints` 函数内

```js
// 在 lifecycle hook 对比后加
const v2Methods = new Set(v2Logic.componentMethods.map(m => m.name));
const v3Methods = new Set(v3Logic.componentMethods.map(m => m.name));
const missingMethods = [...v2Methods].filter(m => !v3Methods.has(m));
const addedMethods = [...v3Methods].filter(m => !v2Methods.has(m));

if (missingMethods.length > 0) {
  result.level = 'P1';
  result.issues.push({
    type: 'method_missing',
    description: `Vue3 缺失以下 Vue2 方法: ${missingMethods.join(', ')}`,
    missing: missingMethods,
    extra: addedMethods,
    severity: 'high'
  });
}
```

#### 2.2 跑验证

```bash
# 找一个 v2/v3 都存在 + 方法数差异大的文件
node scanner.js --mode diff --target views/admin/exam/exam-manage.vue
```

**期望**:P1 报告里出现 `method_missing` 类型。

---

### Step 3 — SFC template 解析(~半天)

**目标**:主人关心的"模板层 80% 写法"能检测

#### 3.1 装 `@vue/compiler-sfc`

```bash
cd scripts/audit && npm install @vue/compiler-sfc
```

#### 3.2 加 SFC 拆块逻辑

**新文件**:`scripts/audit/sfc-parser.js`

```js
import { parse } from '@vue/compiler-sfc';
import fs from 'fs';

export async function parseSFC(filePath) {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const { descriptor } = parse(content);
  return {
    template: descriptor.template?.content || '',
    script: descriptor.scriptSetup?.content || descriptor.script?.content || '',
    scriptLang: descriptor.scriptSetup?.lang || descriptor.script?.lang || 'js',
    style: descriptor.styles.map(s => s.content).join('\n')
  };
}
```

#### 3.3 在 logic-extractor 里加 template 检测

模板层检测规则(加到 `logic-extractor.js`):

```js
// 新增 Vue2TemplateUsage 数组
const templateChecks = [
  { pattern: /<template\s+slot-scope=/g, type: 'slot_scope_usage', severity: 'medium' },
  { pattern: /<slot\s+name=/g, type: 'legacy_slot_name', severity: 'medium' },
  { pattern: /v-on:\w+\.native/g, type: 'native_modifier', severity: 'medium' },
  { pattern: /:\w+\.sync\s*=/g, type: 'sync_modifier', severity: 'medium' },
  { pattern: /\{\{[^}]*\|\s*\w+/g, type: 'template_filter', severity: 'high' },
  { pattern: /\bkeyCode\b/g, type: 'keycode_modifier', severity: 'low' },
  { pattern: /v-on:click\.exact/g, type: 'exact_modifier', severity: 'low' }
];

// 在 generateFingerprint 前遍历 template 块
```

---

### Step 4 — Vuex mapXxx + Vue Router 4 + Element Plus 高频组件(~1 天)

#### 4.1 Vuex 完整检测

**文件**:`scripts/audit/vue2-to-v3-migrator.js`

加以下规则:

```js
// 新增检测
const vuexPatterns = [
  { pattern: /\bmapState\b/, type: 'map_state_usage' },
  { pattern: /\bmapGetters\b/, type: 'map_getters_usage' },
  { pattern: /\bmapActions\b/, type: 'map_actions_usage' },
  { pattern: /\bmapMutations\b/, type: 'map_mutations_usage' },
  { pattern: /from\s+['"]vuex['"]/, type: 'vuex_import' },
  { pattern: /new\s+Vuex\.Store/, type: 'vuex_store_creation' },
  { pattern: /\$store\.commit\(/, type: 'vuex_commit' },
  { pattern: /\$store\.dispatch\(/, type: 'vuex_dispatch' }
];

vuexPatterns.forEach(({ pattern, type }) => {
  if (pattern.test(content)) {
    issues.push({
      type,
      severity: 'high',
      description: `Vuex 模式残留: ${type},应在 Vue3 改用 Pinia`
    });
  }
});
```

#### 4.2 Vue Router 4 适配检测

**文件**:`scripts/audit/vue2-to-v3-migrator.js` 新增检测段

```js
const routerPatterns = [
  { pattern: /\brouter\.go\(/, type: 'router_go_removed', severity: 'high',
    description: 'Vue Router 4 移除 router.go,改用 router.push' },
  { pattern: /\baddRoutes\b/, type: 'add_routes_removed', severity: 'high',
    description: 'Vue Router 4 移除 addRoutes,改用 addRoute 单条' },
  { pattern: /\bnext\s*\(/, type: 'next_param_changed', severity: 'medium',
    description: 'Vue Router 4 next() 不再推荐,改用返回值' }
];
```

#### 4.3 Element Plus 高频组件

**文件**:`scripts/audit/element-compat-checker.js` 加高频组件

```js
const highFreqComponents = [
  { tag: 'el-tree', issues: ['node-click 事件签名变化', 'check-strictly 默认值变化'] },
  { tag: 'el-tabs', issues: ['v-model 双向绑定变化'] },
  { tag: 'el-cascader', issues: ['options 格式调整', 'props.multiple 行为变化'] },
  { tag: 'el-pagination', issues: ['current-page 改 v-model:current-page'] },
  { tag: 'el-popover', issues: ['v-model 控制显隐变化'] },
  { tag: 'el-tooltip', issues: ['slot 重命名'] },
  { tag: 'el-menu', issues: ['collapse / router 模式行为变化'] },
  { tag: 'el-radio-group', issues: ['v-model 数组支持'] },
  { tag: 'el-checkbox-group', issues: ['v-model 数组支持'] }
];
```

---

### Step 5 — P2 修复(~3 小时)

#### 5.1 scanner.js 串行 → 并行

**文件**:`scripts/audit/scanner.js:55-61`

```js
// 改前
for (const [filePath, fileInfo] of Object.entries(vue2Index)) {
  v2Fingerprints[filePath] = await extractBusinessLogic(fileInfo.fullPath);
}

// 改后
async function extractParallel(fileIndex, batchSize = 8) {
  const result = {};
  const entries = Object.entries(fileIndex);
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async ([filePath, fileInfo]) => {
        const fp = await extractBusinessLogic(fileInfo.fullPath);
        return [filePath, fp];
      })
    );
    batchResults.forEach(([fp, logic]) => { result[fp] = logic; });
    console.log(`   进度: ${Math.min(i + batchSize, entries.length)}/${entries.length}`);
  }
  return result;
}
```

#### 5.2 `p2UIDifference` 命名统一

**文件**:`scripts/audit/scanner.js:92` + `scripts/audit/report-generator.js:42,45`

```js
// 全部统一改成 p2UIDifferences(加 s)
auditResult.p2UIDifferences  // 取代 auditResult.p2UIDifference
```

#### 5.3 file-indexer.js glob 升级

**方案 A**:换 `globby`(已装,见 package.json)
```js
import { globby } from 'globby';
const files = await globby(includePatterns, { cwd: rootPath, ignore: excludePatterns, absolute: true });
```

**方案 B**:手写 glob 解析器(支持 `{a,b}` / `**` / `?`)

推荐 A,globby 已装。

#### 5.4 excludePaths 改 split

```js
// 改前
if (excludePaths.some(pattern => relPath.includes(pattern))) continue;

// 改后
const pathParts = relPath.split('/');
if (excludePaths.some(pattern => pathParts.includes(pattern))) continue;
```

#### 5.5 report-generator 全量显示

```js
// 改前
findings.slice(0, 10).forEach(...)

// 改后
findings.forEach(...) // 全显示
// 或分组报告,每个 P 级别独立文件完整列
```

---

### Step 6 — TypeScript 类型一致性(~1 天,可选)

需要 `@vue/compiler-sfc` + `vue-eslint-parser` + 自写类型推断 diff。

**判断**:如果主人 TS 类型不重要(都是业务页面不强类型),可跳过此步。

---

## ✅ 验收标准

每 Step 完成后跑:

```bash
cd scripts/audit
node scanner.js --mode full --output ../../audit-reports
cat ../../audit-reports/vue2-v3-migration-audit.md
```

| Step | 期望产出 |
|---|---|
| Step 1 完 | 工具不崩,输出有效 markdown 报告 |
| Step 2 完 | 报告出现 `method_missing` 类型 P1 |
| Step 3 完 | 报告出现 `slot_scope_usage` / `template_filter` 等 P1 |
| Step 4 完 | 报告出现 `map_state_usage` / `router_go_removed` 等 P1 |
| Step 5 完 | 跑一遍 1500 文件 < 2 分钟(并行) |
| Step 6 完 | 报告出现 `prop_type_mismatch` 等 P2 |

---

## 🚦 决策点(给主人)

主人,以下 3 个点拍板我就开干:

1. **路线**:A 完整修复 / B 快速止血 / C 废弃工具
2. **优先级**:全部 Step 1-5 一次做完 / 先做 Step 1-2 验收再加
3. **是否跳 TypeScript**:Step 6 要不要做(影响 ~1 天)

---

## 📎 后续教训归档

修完后,主人确认无误,我把以下经验写到 `Thinkpad/22-entities-实体档案/agent-经验库/shared-experiences.md`:

1. **不要信一次 ls/Read 输出**(本次 v1 报告就因为这翻车)
2. **关键 bug 必须实际跑测试验证**
3. **Read 工具缓存命中 ≠ 文件真为空**(要在不同时段多次确认)
4. **A:完整修复 / B:快速止血 / C:废弃工具** 三选一的决策框架

---

> **作者**:Claude Code(协调契约 plan-orchestrator 派单)
> **归档路径**:`wk-train-center-ui-v3/docs/superpowers/reviews/`
> **关联文档**:审查报告 `2026-08-26-vue2-v3-audit-toolkit-review.md`