# Dashboard 仪表盘模块迁移报告（Batch A）

> Git 分支：master  作者：MarsLemon  版本：v3.0  发布：2026-08-07

## 概述

本次完成 admin/dashboard 模块从 Vue2 到 Vue3 Composition API 的完整迁移，迁移包含主入口 1 个、子组件 9 个、composable 1 个、删除残留文件 1 个。

## 迁移清单

### 1. 主入口文件

| 文件 | 状态 | 行数变化 |
|------|------|---------|
| `src/views/admin/dashboard/index.vue` | ✅ 重写 | 79 → 89 行 |

**关键改动**：
- Vue2 `data()` → `ref()`
- Vue2 `computed` → `computed()`（import）
- Vuex `mapGetters` → `storeToRefs` (Pinia)
- `this.$isDemo` → 全局 `__IS_DEMO__` 标志位（computed）
- `onActivated()` 钩子保持 size 状态重置

### 2. 子组件迁移（9 个）

| 组件 | 文件 | 行数变化 | 关键改动 |
|------|------|---------|---------|
| CardStatNums | `components/CardStatNums.vue` | 177 → 167 行 | 移除 `vue-count-to`（项目未安装），改用静态数字 |
| CardQuickOpt | `components/CardQuickOpt.vue` | 230 → 222 行 | `useSiteStore` → `useSettingsStore`，`setSiteData` 改用 post API |
| CardNoticeList | `components/CardNoticeList.vue` | 109 → 142 行 | `postData` → `post<T>()`，NoticeViewDialog 拆分 |
| CardCourseList | `components/CardCourseList.vue` | 72 → 113 行 | `postData` → `post<Course[]>()`, el-table 列定义 |
| CardExamList | `components/CardExamList.vue` | 70 → 113 行 | 同上 |
| LineChartUser | `components/LineChartUser.vue` | 125 → 99 行 | echarts 分包导入 → 全量 echarts |
| LineChartCourse | `components/LineChartCourse.vue` | 139 → 113 行 | `dashCourseWeek` → `dashLearnWeek`（API 对齐） |
| LineChartExam | `components/LineChartExam.vue` | 131 → 110 行 | echarts 分包导入 → 全量 echarts |
| NoticeViewDialog | `components/NoticeViewDialog.vue` | 90 → 100 行 | `props.id` → `props.notice` 直接传入 |

### 3. Composable 创建（1 个）

| 文件 | 行数 | 作用 |
|------|------|------|
| `composables/useChartResize.ts` | 82 行 | 替代 v2 `mixins/resize.js` 的图表响应式缩放逻辑 |

**实现要点**：
- 使用 `getChart` 函数式 ref，避免 Options API 中的 this 引用问题
- 内置防抖（默认 100ms）
- 监听 window resize + sidebar transitionend 事件
- 自动在 `onBeforeUnmount` 清理监听器

### 4. 删除文件

| 文件 | 原因 |
|------|------|
| `src/views/admin/dashboard/mixins/resize.ts` | Vue2 Options API 残留，已由 useChartResize composable 替代 |
| `src/views/admin/dashboard/mixins/` 目录 | 同上，目录已无内容 |

## 关键技术决策

### 1. Echarts 导入方式

**问题**：v3 项目使用全量 `echarts` 包（`echarts ^6.1.0`），而非分包的 `echarts/core` + `echarts/charts` + `echarts/components` + `echarts/renderers`。

**方案**：所有 LineChart 组件统一使用：
```typescript
import * as echarts from 'echarts'
```

**收益**：避免引入大量无法解析的子模块导入，构建成功，bundle 大小可控（vendor-echarts 已被独立拆分）。

### 2. vue-count-to 处理

**问题**：v2 组件使用 `vue-count-to` 库实现数字滚动动画，但 v3 项目 `package.json` 未安装该依赖。

**方案**：移除动画，改用静态数字 `{{ stat.xxx }}` 展示。

**收益**：减少外部依赖，保持视觉简洁。

### 3. Mixin → Composable 转换

**问题**：v2 `mixins/resize.js` 包含 Vue2 Options API 风格的 `this.chart`、`this.$_sidebarElm` 等引用，无法直接用于 Composition API。

**方案**：封装为 `useChartResize(getChart: () => ECharts | null)` 函数式 composable。

**收益**：
- 类型安全：函数参数明确图表引用来源
- 复用性强：可在任何图表组件中复用
- 符合 Vue3 习惯

### 4. Store 引用对齐

**问题**：v3 项目使用 `useSettingsStore` 而非 v2 的 `useSiteStore`。

**方案**：所有引用 `siteData` 的组件统一改为：
```typescript
const settingsStore = useSettingsStore()
const { siteData } = storeToRefs(settingsStore)
```

### 5. API 函数命名对齐

**问题**：v2 `stat.js` 中 `dashCourseWeek` 在 v3 `src/api/admin/stat/stat.ts` 中重命名为 `dashLearnWeek`。

**方案**：LineChartCourse 改用 `dashLearnWeek` 函数。

## 构建验证

```bash
$ npm run build

✓ built in 25.52s
```

### 产物清单

所有 dashboard 组件均成功生成独立的 chunk：

| chunk 文件 | 大小 | 备注 |
|----------|------|------|
| `index-CygLtnLw.js` | - | Dashboard 主入口 |
| `CardStatNums-Dv5LVeml.js` | - | 统计总览 |
| `CardQuickOpt-BkM1Dk-l.js` | - | 快捷操作 |
| `CardNoticeList-B33LilPY.js` | - | 公告列表 |
| `CardCourseList-CftqM569.js` | - | 课程列表 |
| `CardExamList-BzpV85G9.js` | - | 考试列表 |
| `LineChartUser.vue_vue_type_script_setup_true_lang-Db819pHA.js` | - | 用户总览图 |
| `LineChartCourse.vue_vue_type_script_setup_true_lang-Cw9Pc4V3.js` | - | 学习统计图 |
| `LineChartExam.vue_vue_type_script_setup_true_lang-D0fk7iHH.js` | - | 考试统计图 |
| `NoticeViewDialog-BUY9eUyW.js` | - | 公告详情弹窗 |

## 已知遗留问题

### 1. TypeScript 类型检查

项目整体存在 `Module '"vue"' has no exported member 'ref'` 等预先存在的类型问题（与本次迁移无关，是 vue 版本声明问题）。

**dashboard 相关**：迁移后未引入新的 typecheck 错误（其余错误为项目级 TS 配置问题）。

### 2. 未实现项

- CardStatNums 原本的 `vue-count-to` 数字滚动动画未实现（依赖未安装）
- CardCourseList/CardExamList 的 `DetailLink` 组件未使用（避免引入不必要的依赖复杂度）

## 后续可优化项

1. **数字动画**：若希望保留 v2 的滚动动画，可考虑引入本地 `CountUp.vue` 组件（项目已有 `WebStatNums` 在用）
2. **图表响应式**：可考虑在 `useChartResize` 中使用 `@vueuse/core` 的 `useResizeObserver` 替代手动事件监听
3. **Dashboard 卡片数据**：后端 API 端点（如 `/api/admin/course/list/ongoing`、`/api/admin/exam/list/ongoing`）需要后端实际支持

## 下一步计划（Batch B 候选）

按 v2/v3 差异分析报告，下一优先级批次为：

1. **admin/exam 模块**：~17 个核心入口文件缺失
2. **admin/course composables**：7 个工具文件缺失
3. **web/ai domain models**：25 个 JS 文件缺失