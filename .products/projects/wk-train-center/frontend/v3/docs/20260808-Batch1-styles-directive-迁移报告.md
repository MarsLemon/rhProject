# Batch 1：styles + directive + 自动声明迁移报告

> 日期：2026-08-08  作者：MarsLemon  版本：v3.0  状态：✅ 完成

## 一、批次范围

按 `documents/plans/v3.0-20260808-V2V3业务功能差异迁移计划.md` 的 B1，包括 5 个文件：

| # | 文件 | 行差（V2-V3） | 类型 |
|---|------|---------------|------|
| 1 | `src/styles/index.scss` | +16 | SCSS 主入口 |
| 2 | `src/styles/colors.css` | +9 | CSS 变量 |
| 3 | `src/styles/element-variables.scss` | +12 | Element 主题变量 |
| 4 | `src/directive/waves/waves.css` | +12 | 指令样式 |
| 5 | `src/components.d.ts` | +110 | 自动生成声明 |

## 二、逐文件评估

### 2.1 `index.scss`（差 16 行）— ⚠️ 不动

**关键发现**：V3 已主动完成 SCSS 模块化重构（`@use`）取代 V2 的 `@import`，且清理了 `sub-navbar / link-type / filter-container / multiselect` 等 V2 业务风格类。

| 维度 | V2 | V3 |
|------|----|----|
| 语法 | `@import './xxx.scss'` | `@use './xxx.scss'`（现代 Sass 模块化） |
| 元素框架 | 含 `~element-ui` SCSS 引用 | 仅 `element-plus` 配置 |
| 业务类 | `sub-navbar / link-type / filter-container / multiselect` | 已清理 |

**结论**：差异源自跨框架 + SCSS 编译器升级，**不可回退 V2 内容**，**也不需追赶**。

### 2.2 `colors.css`（差 9 行）— ✅ 增量添加

V2 新增一段"补充灰度"色板，V3 未包含。**增量同步 7 个 CSS 变量**：

```css
/* ========== 中性色 - 补充灰度 ========== */
--color-bg-subtle: #f9fafb;
--color-border-subtle: #e8e8e8;
--color-border-muted: #d1d5db;
--color-text-soft: #9ca3af;
--color-text-body: #4b5563;
--color-text-dark: #374151;
--color-text-heading: #1f2937;
```

**落地位置**：`--color-text-muted` 与侧边栏色组之间（V3 已有的"中性色 - 其他文字色"分组之后）。

### 2.3 `element-variables.scss`（差 12 行）— ⚠️ 不动

V2 含 element-ui 字体路径与 SCSS 全量导入，V3 已切 element-plus，引入会重复导入。

**结论**：框架差异，**不动**。

### 2.4 `waves.css`（差 12 行）— ⚠️ 不动

V2 写出 4 个分离的 `transition` 属性以兼容旧版浏览器，V3 已合并为单行。**两者功能等价**，V3 更精简。

**结论**：CSS 同义不同写法，**不动**。

### 2.5 `components.d.ts`（差 110 行）— ⏭ 跳过

文件由 `unplugin-vue-components` 自动生成。**V2/V3 差异源自插件扫描结果差异，非业务功能缺失**。`npm run dev` / `npm run build` 重生成时会自动收敛。

**结论**：无需手工干预，**跳过**。

## 三、本批实际改动

仅 1 个文件，**+9 行**（7 变量 + 2 注释边界/空行）：

```
src/styles/colors.css | +9 -0
```

## 四、验证

| 验证项 | 命令 | 结果 |
|--------|------|------|
| 类型检查 | `npm run typecheck` | ✅ 通过（0 errors） |
| 生产构建 | `npm run build` | ✅ 通过（29.61s） |

构建产物无明显 size 突变。

## 五、Batch 1 关键洞察

> **行数差 ≠ 真实迁移需求**。5 个文件，仅 1 个真实业务缺失（colors.css 灰度变量），4 个为框架/编译器/历史差异导致的同义不同步。

这与 BatchJ 报告的"6 个高优先级文件实为 V3 主动重构"判断一致。

## 六、下一步

进 Batch 2：`ComponentsBase` Table + 通用 6 文件，重点处理 `DataTable.styles.scss`（行差 164）。
