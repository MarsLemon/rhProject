# Scripts 目录说明

> 本目录包含项目分析和检测脚本，用于代码质量检查和规范验证。

## 📋 脚本清单

| 执行优先级 | 编号 | 文件名 | 功能描述 |
|-----------|------|--------|----------|
| 高 | 03 | [03-check-component-usage.js](03-check-component-usage.js) | 组件使用检测 |
| 高 | 11 | [11-check-api-usage.js](11-check-api-usage.js) | 接口使用检查 |
| 高 | 07 | [07-analyze-routes.js](07-analyze-routes.js) | 路由配置分析 |
| 高 | 05 | [05-scan-i18n.js](05-scan-i18n.js) | 国际化缺失检查 |
| 中 | 01 | [01-analyze-dependency-usage.js](01-analyze-dependency-usage.js) | 第三方依赖使用分析 |
| 中 | 06 | [06-detect-unused-components.js](06-detect-unused-components.js) | 未使用组件检测 |
| 中 | 09 | [09-check-static-assets.js](09-check-static-assets.js) | 静态资源检查 |
| 低 | 04 | [04-scan-todo-fixme.js](04-scan-todo-fixme.js) | 待办标记扫描 |
| 低 | 02 | [02-scan-large-components.js](02-scan-large-components.js) | Vue 大组件扫描 |
| 低 | 08 | [08-analyze-component-complexity.js](08-analyze-component-complexity.js) | 组件复杂度分析 |
| 低 | 10 | [10-detect-duplicate-code.js](10-detect-duplicate-code.js) | 重复代码检测 |
| 低 | 12 | [12-analyze-component-usage-frequency.js](12-analyze-component-usage-frequency.js) | 组件使用频率统计 |
| 工具 | 99 | [99-organize-reports.js](99-organize-reports.js) | 历史报告规整（迁移到按日期目录） |

---

## 🧭 推荐执行顺序（按优先级）

当使用 `00-run-all-analysis.js` 全量执行时，已按以下顺序运行：

1. 03 组件使用检测
2. 11 接口使用检查
3. 07 路由配置分析
4. 05 国际化缺失检查
5. 01 第三方依赖使用分析
6. 06 未使用组件检测
7. 09 静态资源检查
8. 04 待办标记扫描
9. 02 Vue 大组件扫描
10. 08 组件复杂度分析
11. 10 重复代码检测（耗时）
12. 12 组件使用频率统计

---

## 📖 脚本详情

### 01 - 第三方依赖使用分析

**文件**: `01-analyze-dependency-usage.js`

分析 `package.json` 中的第三方依赖在源码中的使用情况。

```bash
node scripts/01-analyze-dependency-usage.js
```

**输出**:
- `documents/reports/YYYY-MM-DD/01-第三方依赖分析报告.md`

---

### 02 - Vue 大组件扫描

**文件**: `02-scan-large-components.js`

扫描超过指定行数的 Vue 组件，帮助识别需要拆分的组件。

```bash
node scripts/02-scan-large-components.js          # 默认阈值 300 行
node scripts/02-scan-large-components.js 500       # 自定义阈值 500 行
```

**输出**:
- `documents/reports/YYYY-MM-DD/02-大组件扫描报告.md`

---

### 03 - 组件使用检测

**文件**: `03-check-component-usage.js`

检测 `ComponentsBusiness` 目录下的业务组件是否被正确导入使用。

```bash
node scripts/03-check-component-usage.js
```

**输出**:
- `documents/reports/YYYY-MM-DD/03-组件使用检测报告.md`

---

### 04 - 待办标记扫描

**文件**: `04-scan-todo-fixme.js`

扫描代码中的待办事项、修复标记等。

**支持的标签**: `TODO`, `FIXME`, `HACK`, `XXX`, `BUG`, `NOTE`, `OPTIMIZE`, `REFACTOR`

```bash
node scripts/04-scan-todo-fixme.js                  # 扫描所有标签
node scripts/04-scan-todo-fixme.js TODO FIXME        # 只扫描特定标签
```

**输出**:
- `documents/reports/YYYY-MM-DD/04-待办标记扫描报告.md`

---

### 05 - 国际化缺失检查

**文件**: `05-scan-i18n.js`

检测 Vue 文件中的硬编码中文字符串，推动国际化规范。

```bash
node scripts/05-scan-i18n.js                          # 扫描所有硬编码中文
node scripts/05-scan-i18n.js --ignore-urls            # 忽略 URL 中的中文
node scripts/05-scan-i18n.js --min-length=4           # 只报告 4 字符以上的中文
```

**输出**:
- `documents/reports/YYYY-MM-DD/05-国际化缺失检查报告.md`

---

### 06 - 未使用组件检测

**文件**: `06-detect-unused-components.js`

检测 `ComponentsBusiness` 目录下的业务组件哪些没有被使用。

```bash
node scripts/06-detect-unused-components.js
```

**输出**:
- `documents/reports/YYYY-MM-DD/06-未使用组件检测报告.md`

---

### 07 - 路由配置分析

**文件**: `07-analyze-routes.js`

分析项目中的路由配置，检测路由定义、权限配置、嵌套层级等。

```bash
node scripts/07-analyze-routes.js
```

**输出**:
- `documents/reports/YYYY-MM-DD/07-路由配置分析报告.md`

---

### 08 - 组件复杂度分析

**文件**: `08-analyze-component-complexity.js`

分析 Vue 组件的复杂度，包括 props、computed、watch、methods 数量。

```bash
node scripts/08-analyze-component-complexity.js              # 默认阈值 15
node scripts/08-analyze-component-complexity.js --threshold=20  # 自定义阈值
```

**输出**:
- `documents/reports/YYYY-MM-DD/08-组件复杂度分析报告.md`

---

### 09 - 静态资源检查

**文件**: `09-check-static-assets.js`

检查 `public` 目录中未使用的图片、字体等静态资源。

```bash
node scripts/09-check-static-assets.js
```

**输出**:
- `documents/reports/YYYY-MM-DD/09-静态资源检查报告.md`

---

### 10 - 重复代码检测

**文件**: `10-detect-duplicate-code.js`

检测项目中重复或高度相似的代码片段。

```bash
node scripts/10-detect-duplicate-code.js                    # 默认阈值 80%
node scripts/10-detect-duplicate-code.js --threshold=90       # 自定义阈值
```

**输出**:
- `documents/reports/YYYY-MM-DD/10-重复代码检测报告.md`

---

### 11 - 接口使用检查

**文件**: `11-check-api-usage.js`

检测 `api` 目录中定义但未调用的接口。

```bash
node scripts/11-check-api-usage.js
```

**输出**:
- `documents/reports/YYYY-MM-DD/11-接口使用检查报告.md`

---

### 12 - 组件使用频率统计

**文件**: `12-analyze-component-usage-frequency.js`

统计组件在项目中被哪些文件使用，以及使用频率（引用次数）。

组件范围：
- `ComponentsBase`（基础/公共组件）
- `ComponentsBusiness`（业务组件，@business）
- `views/**/components`（页面内组件，@viewComponents）

```bash
node scripts/12-analyze-component-usage-frequency.js
node scripts/12-analyze-component-usage-frequency.js --top=50
node scripts/12-analyze-component-usage-frequency.js --min=2
node scripts/12-analyze-component-usage-frequency.js --only=base,business,view
```

**输出**:
- `documents/reports/YYYY-MM-DD/12-组件使用频率统计报告.md`

---

### 99 - 历史报告规整（迁移到按日期目录）

**文件**: `99-organize-reports.js`

将 `documents/` 根目录或 `documents/YYYY-MM-DD/` 下旧格式报告迁移到新的目录结构：

- `documents/reports/YYYY-MM-DD/NN-xxx.md`

```bash
node scripts/99-organize-reports.js
```

---

## 📁 输出规范

所有脚本遵循以下输出规范：

| 规范项 | 要求 |
|--------|------|
| 输出目录 | `documents/reports/YYYY-MM-DD/` |
| 文件名格式 | `NN-报告名称.md` |
| 文件路径 | 使用 `file:///` 协议，支持点击跳转 |
| 报告格式 | Markdown |

---

## ⚙️ 通用参数

大多数脚本支持以下通用参数：

| 参数 | 说明 |
|------|------|
| `--help` 或 `-h` | 显示帮助信息 |

---

## 🔧 添加新脚本

添加新脚本时请遵循以下规范：

1. **编号**: 使用下一个可用编号（如 `06-xxx.js`）
2. **文档注释**: 包含功能描述、使用方法和输出规范
3. **输出格式**: 必须输出 Markdown 到 `documents/reports/` 目录
4. **文件命名**: 使用 `YYYY-MM-DD-xxx报告.md` 格式
5. **路径链接**: 使用 `file:///` 协议实现可跳转链接
6. **更新本文档**: 在脚本清单中添加新脚本的说明
