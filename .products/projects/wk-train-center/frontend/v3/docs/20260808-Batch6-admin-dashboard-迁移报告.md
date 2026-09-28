# Batch 6 admin/dashboard 迁移报告

> Git分支：v3.0  作者：Qoder  版本：v3.0  日期：2026-08-08

## 概述

本次评估覆盖 `src/views/admin/dashboard/` 全部 V3 文件（11 个，含 1 个新增 composable）与 V2 源文件（10 个）的差异。V3 的 dashboard 模块已经被**主动重构**，所有组件都完成了 Vue3 化（`<script setup lang="ts">` + Pinia + 组合式 API），无需追加迁移。

## 文件清单与评估

| # | V3 文件 | V3 行数 | V2 文件 | V2 行数 | 评估 | 备注 |
|---|---------|--------|---------|--------|------|------|
| 1 | `index.vue` | 96 | `index.vue` | 78 | ✅ 现代化 | script setup + 静态引用子组件 |
| 2 | `composables/useChartResize.ts` | 82 | (无) | - | V3 新增 | 替代 V2 `mixins/resize.js`，含防抖与 sidebar 联动 |
| 3 | `CardCourseList.vue` | 104 | `CardCourseList.vue` | 71 | ✅ 重写 | 新 API `/api/admin/course/list/ongoing` + 6 列 + 操作按钮 |
| 4 | `CardExamList.vue` | 104 | `CardExamList.vue` | 69 | ✅ 重写 | 新 API `/api/admin/exam/list/ongoing` + 6 列 + 操作按钮 |
| 5 | `CardNoticeList.vue` | 146 | `CardNoticeList.vue` | 108 | ✅ 重写 | 改用 `<ul><li>` 列表 + 新 API `/api/admin/notice/list/latest` |
| 6 | `CardQuickOpt.vue` | 254 | `CardQuickOpt.vue` | 229 | ✅ 重写 | 图标卡片方案 + 7 个功能入口（含 V3 新增的 AI 题库、AI 助手、学员端开关） |
| 7 | `CardStatNums.vue` | 165 | `CardStatNums.vue` | 176 | ✅ 现代化 | script setup，但**主动移除** `vue-count-to` 数字滚动动画 |
| 8 | `LineChartCourse.vue` | 113 | `LineChartCourse.vue` | 138 | ✅ 迁移 | API `dashCourseWeek` → `dashLearnWeek`，独立 resize 监听 |
| 9 | `LineChartExam.vue` | 122 | `LineChartExam.vue` | 130 | ✅ 迁移 | API 路径保持，独立 resize 监听 |
| 10 | `LineChartUser.vue` | 108 | `LineChartUser.vue` | 124 | ✅ 迁移 | API 路径保持，独立 resize 监听 |
| 11 | `NoticeViewDialog.vue` | 90 | `NoticeViewDialog.vue` | 89 | ✅ 重写 | 改用 `v-model:visible` + 传入整个 notice 对象（替代 V2 fetchDetail） |

**不动** —— 11 / 11。

## 详细对比分析

### 1. 整体：V3 主动重构，非迁移遗漏

V3 dashboard 模块的整体策略是**对每张卡片重做**：

- **API 端点迁移到新 stat/admin 接口**
  - V2 路径：`/api/stat/course/dash-course-list`、`/api/stat/exam/dash-exam-list`、`/api/sys/notice/client/paging`
  - V3 路径：`/api/admin/course/list/ongoing`、`/api/admin/exam/list/ongoing`、`/api/admin/notice/list/latest`
  - 这些端点已在 V3 `src/api/admin/stat/stat.ts` 与各业务模块中定义，类型对齐 OK。

- **全部组件使用 `<script setup lang="ts">`**：
  - `defineProps` + `withDefaults` 替代 props/default
  - `ref`/`computed`/`onMounted`/`onBeforeUnmount` 替代 data/computed/mounted/beforeDestroy
  - 移除 Vuex 的 `mapGetters(['siteData'])`，改用 `useSettingsStore`
  - `request.post` 替代 `postData` + `.then(res => res.data)`

### 2. CardCourseList / CardExamList（V3 主动重写）

| 对比点 | V2 | V3 |
|--------|----|----|
| API | `/api/stat/{exam,course}/dash-{exam,course}-list` | `/api/admin/{exam,course}/list/ongoing` |
| 列数 | 3 列（标题/操作/分类） | 6 列（编号/名称/学员/创建人/时间/操作） |
| 操作列 | 链接 "查看" | 操作按钮 "查看"（链接到详情路由） |
| 分页 | 后端返回 `res.data.records` | 后端返回 `res.data`（直接是数组） |

V3 提供了**更丰富的列表信息**和**更现代的视觉布局**，属于产品级主动迭代，不是迁移遗漏。

### 3. CardNoticeList（V3 主动改 UI）

- V2 用 `<el-table>` + `DetailLink`，数据从 `paging` 接口获取
- V3 改用 `<ul><li>` 自定义列表 + `formatTime` 时间格式化 + `top` 置顶标签 + 点击行打开 `NoticeViewDialog`
- 视觉与交互均升级，是产品级重写。

### 4. CardQuickOpt（V3 主动扩展功能）

V2 含 5 个功能：添加课程、AI 题库、题库管理、创建考试、公告管理。

V3 含 7 个功能（含 3 个新增）：
1. 添加课程（`toAddCourse`）
2. **AI 题库** (`siteData.props.isAIRepo` 控制，新增)
3. 题库管理
4. 创建考试
5. 公告管理
6. **AI 助手** (`siteData.props.isWebAiEnable` 控制，新增)
7. **学员端开关** (`toggleWebAi` 通过 `/api/sys/config/update` 切换 `isWebAiEnable`，新增)

V3 比 V2 功能更多，是产品级主动扩展。

### 5. CardStatNums（主动简化 vue-count-to）

- V2 使用 `<CountTo :start-val="0" :end-val="stat.fileCount" :duration="2000" />` 数字滚动动画
- V3 改用静态 `{{ stat.fileCount }}` 直接展示
- **原因**：V3 `package.json` 未安装 `vue-count-to` 依赖，BatchA 评估已记录为 V3 主动简化。

### 6. LineChart* 三件套（独立 resize，未使用 useChartResize）

- V2 使用 mixin (`mixins: [resize]`) 共享 resize 逻辑
- V3 三件套各自实现了相同的 resize 逻辑（监听 `window.resize` + `chart.dispose`）
- V3 的 `composables/useChartResize.ts` 已实现（82 行，含防抖与 sidebar 联动），但 LineChart* 三件套尚未引用
- **结论**：当前是重复代码，**待未来重构统一调用 `useChartResize`**（非迁移遗漏，是优化机会）

### 7. NoticeViewDialog（V3 重写为 props 接收 notice）

- V2：组件挂载时根据 `id` prop 调用 `fetchDetail` 拉取数据
- V3：组件接收 `notice: Notice | null` prop，由父组件 `CardNoticeList` 直接传入（已经在列表里获取过数据）
- 减少了网络请求，是 V3 的主动简化

## V3 主动新增的文件

### `composables/useChartResize.ts`（82 行）

- 替代 V2 的 `dashboard/mixins/resize.js`
- 支持传入 `getChart: () => { resize: () => void } | null`
- 防抖 100ms
- 同时监听 `window.resize` + `.sidebar-container` 的 `transitionend`
- 完整的 `onMounted`/`onBeforeUnmount` 清理
- 注释完整，使用示例清晰
- **当前未在 LineChart* 中引用**，是后续可优化的复用点

## 验证

- **Typecheck**：`npm run typecheck` 通过（0 errors）
- **所有 V3 文件均为 Vue3 idioms**：
  - 100% 使用 `<script setup lang="ts">`
  - 100% 使用 Composition API（`ref`/`computed`/`onMounted`）
  - 100% 使用 Pinia（无 Vuex mapGetters）
  - 100% TypeScript interface 化（Notice、StatData）

## 结论

Batch 6 `admin/dashboard` **全部 11 个文件不动**，无需迁移。

- V3 已主动重构所有 dashboard 组件
- 全部使用新 stat API
- 全部 TypeScript 类型化
- V3 主动扩展了 CardQuickOpt 的功能（+3 个）
- V3 主动简化了 CardStatNums（去 vue-count-to）和 NoticeViewDialog（去 fetchDetail）

## 后续优化建议（非本次范围）

1. **LineChart* 三件套**应改用 `composables/useChartResize.ts` 复用 resize 逻辑（减少重复代码 + 启用 sidebar 联动）
2. **CardStatNums** 可选：若希望恢复数字滚动动画，需安装 `vue-count-to` 并补充类型声明（见 [20260526-Vue3迁移进度全面审核报告-v1.2.md]）

## 下一步

进入 Batch 7（admin/dashboard 续 + admin/ai）。