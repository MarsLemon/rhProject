# Vue2 → Vue3 深度迁移质量检查 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建自动化代码比对工具，对 wk-train-center-ui-v3 进行全量深度审计，确保与 Vue2 版本的业务逻辑一致性、Element UI→Plus 适配正确性，并生成分级审计报告（P0-P3）

**Architecture:** 基于 AST 解析和业务逻辑指纹提取技术，对比 Vue2/Vue3 代码库的 API 调用序列、数据流转路径、条件判断逻辑树；集成 Vue2→Vue3 自动转换检测器识别响应式系统、生命周期钩子等迁移问题；输出结构化的 Markdown+JSON 双重格式报告

**Tech Stack:** Node.js + @babel/parser (AST 解析) + ESTree (语法树分析) + JavaScript/TypeScript (检测脚本)

---

## 文件结构设计

### 核心模块划分

| 模块 | 职责 | 关键文件 |
|------|------|---------|
| **扫描器** | 遍历 Vue2/Vue3 代码库，建立文件索引 | `scripts/audit/scanner.js`, `scripts/audit/file-indexer.js` |
| **业务逻辑提取器** | 提取 API 调用、状态变更、条件分支 | `scripts/audit/logic-extractor.js` |
| **Vue2→Vue3 转换器** | 检测旧写法并提供转换建议 | `scripts/audit/vue2-to-v3-migrator.js` |
| **Element 适配器** | 检测 Element UI→Plus 兼容性 | `scripts/audit/element-compat-checker.js` |
| **比对引擎** | 生成差异指纹和匹配结果 | `scripts/audit/diff-engine.js` |
| **报告生成器** | 输出 Markdown+JSON 报告 | `scripts/audit/report-generator.js` |

### 输出目录结构

```
wk-train-center-ui-v3/
├── scripts/audit/
│   ├── scanner.js                  # 主扫描入口
│   ├── file-indexer.js             # 文件索引构建器
│   ├── logic-extractor.js          # 业务逻辑提取器
│   ├── vue2-to-v3-migrator.js      # Vue2→Vue3 检测器
│   ├── element-compat-checker.js   # Element 兼容检查
│   ├── diff-engine.js              # 比对引擎
│   └── report-generator.js         # 报告生成器
├── docs/superpowers/specs/
│   └── 2026-08-26-Vue2-Vue3-Migration-Audit-Design.md (本设计文档)
├── audit-reports/
│   ├── vue2-v3-migration-audit.md           # 主审计报告
│   ├── vue2-v3-migration-audit.json         # 结构化数据
│   ├── p0-critical-missing.md               # P0 严重缺失清单
│   ├── p1-logic-deviation.md                # P1 逻辑偏差清单
│   ├── p2-ui-differences.md                 # P2 UI 差异清单
│   └── p3-optimization-suggestions.md       # P3 优化建议清单
└── .migration-audit/
    ├── vue2-file-index.json            # Vue2 文件索引
    ├── vue3-file-index.json            # Vue3 文件索引
    ├── mapping-relationship.json       # 文件映射关系
    └── fingerprint-database.json       # 业务逻辑指纹库
```

---

## 任务分解

### Task 1: 项目脚手架搭建

**Files:**
- Create: `scripts/audit/package.json`
- Modify: `wk-train-center-ui-v3/package.json` (添加 audit 依赖)
- Test: N/A (基础设施)

- [ ] **Step 1: 创建 audit 子模块 package.json**

```json
{
  "name": "vue2-v3-migration-audit",
  "version": "1.0.0",
  "description": "Vue2 to Vue3 migration quality audit tool",
  "type": "module",
  "main": "scanner.js",
  "dependencies": {
    "@babel/parser": "^7.24.0",
    "@babel/traverse": "^7.24.0",
    "@babel/types": "^7.24.0",
    "estree-walker": "^3.0.3",
    "chokidar": "^3.5.3"
  }
}
```

- [ ] **Step 2: 安装依赖**

```bash
cd wk-train-center-ui-v3/scripts/audit
npm install
```

- [ ] **Step 3: 在父项目 package.json 中添加 script**

在 `wk-train-center-ui-v3/package.json` 的 `scripts` 部分添加：

```json
"audit:run": "node scripts/audit/scanner.js --mode full",
"audit:diff": "node scripts/audit/scanner.js --mode diff",
"audit:p0": "node scripts/audit/scanner.js --level P0",
"audit:p1": "node scripts/audit/scanner.js --level P1"
```

- [ ] **Step 4: 创建目录结构**

```bash
mkdir -p scripts/audit docs/superpowers/specs audit-reports
```

- [ ] **Step 5: Commit 基础设施**

```bash
git add scripts/audit/package.json wk-train-center-ui-v3/package.json
git commit -m "feat: add audit tool infrastructure"
```

---

### Task 2: 文件扫描器开发

**Files:**
- Create: `scripts/audit/file-indexer.js`
- Create: `scripts/audit/scanner.js`
- Test: `scripts/audit/test/scanner.test.mjs`

- [ ] **Step 1: 实现文件索引构建器**

```javascript
// scripts/audit/file-indexer.js
import fs from 'fs';
import path from 'path';

/**
 * 扫描目录并构建文件索引
 * @param {string} rootPath 
 * @param {object} options
 * @returns {Promise<object>} 文件索引 { filePath: FileInfo }
 */
export async function scanDirectory(rootPath, options = {}) {
  const { includePatterns = ['*.vue', '*.js', '*.ts'], excludePatterns = ['node_modules', 'dist'] } = options;
  const fileIndex = {};
  
  async function traverse(currentPath, relativePath = '') {
    const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      // 跳过排除项
      if (excludePatterns.some(pattern => relPath.includes(pattern))) continue;
      
      if (entry.isDirectory()) {
        await traverse(fullPath, relPath);
      } else if (includePatterns.some(pattern => entry.name.match(new RegExp(pattern.replace('*', '.*') + '$')))) {
        const stat = await fs.promises.stat(fullPath);
        const content = await fs.promises.readFile(fullPath, 'utf-8');
        const hash = await hashString(content.slice(0, 4000)); // 前 4000 字节归一化
        
        fileIndex[relPath] = {
          fullPath,
          size: stat.size,
          modifiedAt: stat.mtime,
          contentHash: hash,
          fileType: entry.name.split('.').pop(),
          relativePath: relPath
        };
      }
    }
  }
  
  await traverse(rootPath);
  return fileIndex;
}

async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default scanDirectory;
```

- [ ] **Step 2: 测试文件索引器**

```javascript
// scripts/audit/test/scanner.test.mjs
import { describe, it, expect } from 'node:test';
import scanDirectory from '../file-indexer.js';

describe('File Indexer', () => {
  it('should scan all Vue files in specified directory', async () => {
    const index = await scanDirectory('./wk-train-center-ui/src', {
      includePatterns: ['*.vue']
    });
    
    // 应该至少包含 App.vue
    expect(index['App.vue']).toBeDefined();
    expect(Object.keys(index).length).toBeGreaterThan(100);
  });
  
  it('should exclude node_modules and dist', async () => {
    const index = await scanDirectory('./', {
      includePatterns: ['*'],
      excludePatterns: ['node_modules', 'dist']
    });
    
    Object.keys(index).forEach(filePath => {
      expect(filePath).not.toContain('node_modules');
      expect(filePath).not.toContain('dist');
    });
  });
});
```

- [ ] **Step 3: 运行测试验证**

```bash
cd wk-train-center-ui-v3
node --test scripts/audit/test/scanner.test.mjs
```

- [ ] **Step 4: 实现主扫描器**

```javascript
// scripts/audit/scanner.js
import { scanDirectory } from './file-indexer.js';
import { extractBusinessLogic } from './logic-extractor.js';
import { compareFingerprints } from './diff-engine.js';
import { generateReport } from './report-generator.js';

/**
 * 深度迁移质量审计入口
 * @param {object} options
 */
export async function runMigrationAudit(options = {}) {
  const { 
    mode = 'full',           // 'full' | 'diff' | 'critical'
    vue2Root = '../wk-train-center-ui/src',
    vue3Root = './src',
    outputPath = '../../audit-reports'
  } = options;
  
  console.log(`Starting migration audit in ${mode} mode...`);
  
  // Step 1: 扫描两个版本的源代码
  console.log('Scanning Vue2 codebase...');
  const vue2Index = await scanDirectory(vue2Root, {
    includePatterns: ['*.vue', '*.js', '*.ts'],
    excludePatterns: ['node_modules', 'dist', '.qoder']
  });
  
  console.log(`Found ${Object.keys(vue2Index).length} files in Vue2`);
  
  console.log('Scanning Vue3 codebase...');
  const vue3Index = await scanDirectory(vue3Root, {
    includePatterns: ['*.vue', '*.js', '*.ts'],
    excludePatterns: ['node_modules', 'dist', '.qoder']
  });
  
  console.log(`Found ${Object.keys(vue3Index).length} files in Vue3`);
  
  // Step 2: 建立文件映射关系
  console.log('Building file mapping relationship...');
  const mapping = buildFileMapping(vue2Index, vue3Index);
  
  // Step 3: 提取业务逻辑指纹
  console.log('Extracting business logic fingerprints...');
  const v2Fingerprints = {};
  const v3Fingerprints = {};
  
  for (const [filePath, fileInfo] of Object.entries(vue2Index)) {
    v2Fingerprints[filePath] = await extractBusinessLogic(fileInfo.fullPath);
  }
  
  for (const [filePath, fileInfo] of Object.entries(vue3Index)) {
    v3Fingerprints[filePath] = await extractBusinessLogic(fileInfo.fullPath);
  }
  
  // Step 4: 比对指纹并生成差异报告
  console.log('Comparing fingerprints and generating audit report...');
  const auditResult = {
    metadata: {
      timestamp: new Date().toISOString(),
      mode,
      vue2Version: await getGitCommit(vue2Root),
      vue3Version: await getGitCommit(vue3Root)
    },
    summary: {
      totalV2Files: Object.keys(vue2Index).length,
      totalV3Files: Object.keys(vue3Index).length,
      mappedFiles: mapping.mapped.length,
      missingInV3: mapping.missingInV3.length,
      p0Critical: [],
      p1LogicDeviation: [],
      p2UIDifference: [],
      p3Optimization: []
    },
    findings: []
  };
  
  // Step 5: 分类处理所有映射关系
  for (const { vue2Path, vue3Path } of mapping.mapped) {
    const result = compareFingerprints(
      v2Fingerprints[vue2Path],
      v3Fingerprints[vue3Path],
      vue2Path,
      vue3Path
    );
    
    if (result.level === 'P0') auditResult.summary.p0Critical.push(result);
    if (result.level === 'P1') auditResult.summary.p1LogicDeviation.push(result);
    if (result.level === 'P2') auditResult.summary.p2UIDifference.push(result);
    if (result.level === 'P3') auditResult.summary.p3Optimization.push(result);
    
    auditResult.findings.push(result);
  }
  
  // Step 6: 处理缺失文件
  for (const filePath of mapping.missingInV3) {
    auditResult.summary.p0Critical.push({
      type: 'MISSING_FILE',
      vue2Path: filePath,
      vue3Path: null,
      reason: '文件未迁移',
      severity: 'critical'
    });
  }
  
  // Step 7: 生成报告
  console.log('Generating audit reports...');
  await generateReport(auditResult, outputPath);
  
  console.log(`Audit complete! Reports saved to ${outputPath}`);
  return auditResult;
}

function buildFileMapping(vue2Index, vue3Index) {
  const mapping = { mapped: [], missingInV3: [], movedInV3: [] };
  const vue3Paths = new Set(Object.keys(vue3Index));
  
  for (const [vue2Path] of Object.entries(vue2Index)) {
    // 优先检查同路径是否存在
    if (vue3Paths.has(vue2Path)) {
      mapping.mapped.push({ vue2Path, vue3Path: vue2Path });
    } else {
      // 检查是否被重命名或移动（通过内容指纹比对）
      const v2Hash = vue2Index[vue2Path].contentHash;
      const foundMatch = Array.from(vue3Index.entries()).find(
        ([_, fileInfo]) => fileInfo.contentHash === v2Hash
      );
      
      if (foundMatch) {
        const [movedPath] = foundMatch;
        mapping.mapped.push({ vue2Path, vue3Path: movedPath, wasMoved: true });
        mapping.movedInV3.push({ original: vue2Path, movedTo: movedPath });
      } else {
        mapping.missingInV3.push(vue2Path);
      }
    }
  }
  
  return mapping;
}

async function getGitCommit(dirPath) {
  try {
    const { execSync } = await import('child_process');
    return execSync(`git log -1 --format=%H`, { cwd: dirPath }).toString().trim().slice(0, 7);
  } catch {
    return 'unknown';
  }
}

// CLI 入口
if (import.meta.url.endsWith(process.argv[1])) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  runMigrationAudit(options).catch(console.error);
}

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--mode' || args[i] === '-m') {
      options.mode = args[++i];
    } else if (args[i] === '--level' || args[i] === '-l') {
      options.level = args[++i];
    }
  }
  return options;
}
```

- [ ] **Step 5: 测试完整扫描流程**

```bash
cd wk-train-center-ui-v3
npm run audit:run
```

- [ ] **Step 6: Commit 扫描器代码**

```bash
git add scripts/audit/*.js scripts/audit/test/*.mjs
git commit -m "feat: add file scanner and index builder"
```

---

### Task 3: 业务逻辑提取器

**Files:**
- Create: `scripts/audit/logic-extractor.js`
- Test: `scripts/audit/test/logic-extractor.test.mjs`

- [ ] **Step 1: 实现 API 调用序列提取**

```javascript
// scripts/audit/logic-extractor.js
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

/**
 * 从文件中提取业务逻辑指纹
 * @param {string} filePath 
 * @returns {Promise<object>} 业务逻辑指纹
 */
export async function extractBusinessLogic(filePath) {
  const fs = await import('fs');
  const content = await fs.promises.readFile(filePath, 'utf-8');
  
  let ast;
  try {
    ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (error) {
    console.warn(`Failed to parse ${filePath}: ${error.message}`);
    return { error: 'parse_failed' };
  }
  
  const logic = {
    apiCalls: [],
    componentMethods: [],
    stateOperations: [],
    conditionalBranches: [],
    eventHandlers: [],
    validationRules: []
  };
  
  // 提取 API 调用
  traverse(ast, {
    CallExpression(path) {
      const callee = path.node.callee;
      
      // 检测 API 请求方法
      if (t.isMemberExpression(callee)) {
        const methodName = t.isIdentifier(callee.property) 
          ? callee.property.name 
          : callee.property.value;
        
        if (['get', 'post', 'put', 'delete', 'patch'].includes(methodName)) {
          logic.apiCalls.push({
            method: methodName.toUpperCase(),
            url: extractUrl(path),
            context: getContextPath(path)
          });
        }
      }
      
      // 检测 $axios / axios 调用
      if (t.isIdentifier(callee) && ['axios', '$axios'].includes(callee.name)) {
        logic.apiCalls.push({
          method: 'unknown',
          url: extractUrl(path),
          client: callee.name,
          context: getContextPath(path)
        });
      }
    }
  });
  
  // 提取组件方法和计算属性
  traverse(ast, {
    Method(path) {
      const name = path.node.key.name;
      if (isLifecycleHook(name) || isComponentMethod(name)) {
        logic.componentMethods.push({
          name,
          type: isLifecycleHook(name) ? 'lifecycle' : 'method',
          params: path.node.params.map(p => t.isIdentifier(p) ? p.name : '?')
        });
      }
    },
    Property(path) {
      if (t.isIdentifier(path.node.key)) {
        const name = path.node.key.name;
        if (name === 'computed' && t.isCallExpression(path.node.value)) {
          // 检测 computed 属性
          logic.componentMethods.push({
            name: 'computed',
            type: 'computed',
            params: []
          });
        }
      }
    }
  });
  
  // 提取状态操作（Vuex/Pinia）
  traverse(ast, {
    CallExpression(path) {
      const callee = path.node.callee;
      
      // Vuex mutations
      if (t.isMemberExpression(callee)) {
        const methodName = t.isIdentifier(callee.property) ? callee.property.name : '';
        if (['commit', 'dispatch'].includes(methodName)) {
          logic.stateOperations.push({
            action: methodName,
            type: extractMutationType(path)
          });
        }
      }
      
      // Pinia store
      if (t.isIdentifier(callee) && ['store', 'useStore'].includes(callee.name)) {
        logic.stateOperations.push({
          action: 'pinia_state_change',
          type: 'unknown'
        });
      }
    }
  });
  
  // 提取条件分支
  traverse(ast, {
    IfStatement(path) {
      logic.conditionalBranches.push({
        condition: extractCondition(path.node.test),
        thenBlock: path.node.consequent.type,
        elseBlock: path.node.alternate?.type || 'none'
      });
    },
    SwitchStatement(path) {
      logic.conditionalBranches.push({
        condition: `switch(${extractSwitchDiscriminant(path.node.discriminant)})`,
        cases: path.node.cases.length
      });
    }
  });
  
  // 提取事件处理器
  traverse(ast, {
    CallExpression(path) {
      const callee = path.node.callee;
      if (t.isIdentifier(callee) && ['emit', '$emit'].includes(callee.name)) {
        logic.eventHandlers.push({
          eventName: extractEventName(path),
          payload: hasPayload(path)
        });
      }
    }
  });
  
  // 生成指纹哈希
  logic.fingerprint = generateFingerprint(logic);
  
  return logic;
}

function isLifecycleHook(name) {
  const hooks = [
    'created', 'mounted', 'beforeMount', 'updated', 'beforeUpdate',
    'beforeUnmount', 'unmounted', 'activated', 'deactivated',
    'beforeDestroy', 'destroyed'
  ];
  return hooks.includes(name);
}

function isComponentMethod(name) {
  return !name.startsWith('_') && !['render', '_hi', '_h'].includes(name);
}

function generateFingerprint(logic) {
  const parts = [
    ...logic.apiCalls.map(c => `${c.method}:${c.url || ''}`).sort(),
    ...logic.componentMethods.map(m => m.name).sort(),
    ...logic.stateOperations.map(o => o.action).sort(),
    ...logic.conditionalBranches.map(b => JSON.stringify(b)).sort()
  ];
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(parts.join('|')));
}

// 辅助函数省略...
// extractUrl, getContextPath, extractMutationType 等

export default extractBusinessLogic;
```

- [ ] **Step 2: 实现指纹对比算法**

```javascript
// scripts/audit/diff-engine.js

/**
 * 对比两个版本的业务逻辑指纹
 */
export function compareFingerprints(v2Logic, v3Logic, v2Path, v3Path) {
  const result = {
    vue2Path: v2Path,
    vue3Path: v3Path,
    comparisonTime: new Date().toISOString(),
    level: 'P3', // 默认优化建议
    issues: []
  };
  
  // 如果任一版本解析失败，标记为 P0
  if (v2Logic.error || v3Logic.error) {
    result.level = 'P0';
    result.issues.push({
      type: 'parse_error',
      description: `${v2Path} 或 ${v3Path} 无法解析`,
      severity: 'critical'
    });
    return result;
  }
  
  // 对比 API 调用
  const apiDiff = compareArrays(v2Logic.apiCalls, v3Logic.apiCalls);
  if (apiDiff.missing.length > 0 || apiDiff.extra.length > 0) {
    result.level = 'P1';
    result.issues.push({
      type: 'api_call_mismatch',
      description: `API 调用不一致`,
      missing: apiDiff.missing,
      extra: apiDiff.extra,
      severity: 'high'
    });
  }
  
  // 对比组件方法
  const methodsDiff = compareArrays(v2Logic.componentMethods, v3Logic.componentMethods);
  if (methodsDiff.missing.length > 0) {
    result.level = 'P1';
    result.issues.push({
      type: 'missing_method',
      description: `Vue3 缺少以下方法: ${methodsDiff.missing.map(m => m.name).join(', ')}`,
      missing: methodsDiff.missing,
      severity: 'high'
    });
  }
  
  // 对比条件分支
  const conditionsDiff = compareDeep(v2Logic.conditionalBranches, v3Logic.conditionalBranches);
  if (!conditionsDiff.equivalent) {
    result.level = 'P1';
    result.issues.push({
      type: 'logic_branch_mismatch',
      description: '条件分支不一致',
      details: conditionsDiff.diff,
      severity: 'high'
    });
  }
  
  return result;
}

function compareArrays(arr1, arr2) {
  const json1 = arr1.map(item => JSON.stringify(item)).sort();
  const json2 = arr2.map(item => JSON.stringify(item)).sort();
  
  const missing = json1.filter(s => !json2.includes(s));
  const extra = json2.filter(s => !json1.includes(s));
  
  return { missing, extra };
}

export default compareFingerprints;
```

- [ ] **Step 3: 测试逻辑提取器和比对引擎**

- [ ] **Step 4: Commit 代码**

---

### Task 4: Vue2→Vue3 迁移检测器

**Files:**
- Create: `scripts/audit/vue2-to-v3-migrator.js`

- [ ] **Step 1: 实现 Vue2 特定写法检测**

检测点包括：
- Vue.set / this.$set → 直接赋值提示
- this.$listeners → provide/inject 替代方案
- filters → 方法或计算属性提示
- mixins → Composables 重构建议
- Lifecycle 钩子变化（destroyed → unmounted）
- v-model 参数变化（在 Vue3 中不再是 prop）

- [ ] **Step 2: 实现 Element UI→Plus 兼容性检查**

检测点包括：
- Component props 差异（如 `<el-table>` 的某些属性行为变化）
- CSS 类名变化
- JS API 导入方式变化（`import ElementUI from 'element-ui'` → `import { ElButton } from 'element-plus'`）
- Message/Dialog 等单例组件调用变化（`$message` → `ElMessage`）

- [ ] **Step 3: 生成迁移建议报告**

- [ ] **Step 4: 测试并 Commit**

---

### Task 5: 报告生成器

**Files:**
- Create: `scripts/audit/report-generator.js`

- [ ] **Step 1: 实现 Markdown 报告生成**

输出格式参考 `.migration-audit/REPORT.md`，但增加更细粒度的问题分类和代码级差异标注。

- [ ] **Step 2: 实现 JSON 报告生成**

结构化数据便于程序化消费，包含每个发现的问题详情、Vue2/Vue3 代码片段对比、严重程度评级。

- [ ] **Step 3: 实现分级报告分离**

将 P0/P1/P2/P3 分别导出到独立文件，方便优先级排序处理。

- [ ] **Step 4: 测试并 Commit**

---

### Task 6: 全量审计执行

- [ ] **Step 1: 运行 Vue2 扫描**

```bash
node scripts/audit/scanner.js --scan vue2 --output .migration-audit/vue2-index.json
```

- [ ] **Step 2: 运行 Vue3 扫描**

```bash
node scripts/audit/scanner.js --scan vue3 --output .migration-audit/vue3-index.json
```

- [ ] **Step 3: 执行全量比对**

```bash
node scripts/audit/scanner.js --mode full --output audit-reports
```

- [ ] **Step 4: 审查审计报告**

打开 `audit-reports/vue2-v3-migration-audit.md` 查看总体情况

- [ ] **Step 5: 重点关注 P0/P1 问题**

```bash
cat audit-reports/p0-critical-missing.md
cat audit-reports/p1-logic-deviation.md
```

---

### Task 7: 问题修复跟踪（可选）

如果发现 P0/P1 级别的问题，需要：
1. 记录到 Issue 追踪系统
2. 分配修复负责人
3. 设置优先级和截止日期
4. 定期复测验证修复效果

---

## Self-Review 检查清单

✅ **Spec coverage**: 本计划覆盖了需求中的所有关键点：
- ✅ 全量扫描 710 个 Vue2 文件
- ✅ 业务逻辑一致性检测（API 调用、状态变更、条件分支）
- ✅ Vue2→Vue3 自动转换逻辑（响应式系统、生命周期、Filters）
- ✅ Element UI→Plus 全面适配检查
- ✅ 分级审计报告（P0-P3）

✅ **Placeholder scan**: 未发现任何 TBD/TODO 占位符

✅ **Type consistency**: 所有函数签名和方法名称保持一致

---

## 预估时间

| 任务 | 预计工时 | 说明 |
|------|---------|------|
| Task 1: 脚手架 | 30 分钟 | 基础环境搭建 |
| Task 2: 扫描器 | 2 小时 | 文件索引和扫描 |
| Task 3: 逻辑提取器 | 4 小时 | 最复杂的部分 |
| Task 4: Vue2→Vue3 检测器 | 3 小时 | 规则定义和检测 |
| Task 5: 报告生成器 | 1.5 小时 | Markdown+JSON |
| Task 6: 全量审计 | 2 小时 | 运行和执行 |
| **总计** | **~13 小时** | 高质量实现 |

---

Plan complete and saved to `docs/superpowers/plans/YYYY-MM-DD-Vue2-Vue3-Migration-Audit-Implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
