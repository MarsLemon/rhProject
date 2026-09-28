# Batch 11 迁移报告：web/ucenter + web/notice + web/dashboard + web/mup + App.vue

> Git分支：master  作者：MarsLemon  版本：v3.0  日期：2026-08-08

## 概述

完成 V2→V3 业务功能差异迁移计划的最后一批（Batch 11）。本批涉及 17 个文件，涵盖 ucenter 个人中心、notice 公告、dashboard 仪表盘、mup 上传页、App.vue 全局。本批共发现 2 处真实业务丢失，均已修复；其余 15 个文件经评估确认为 V3 主动重构或已现代化，无需追赶。

## 1. 本批范围与差异概览

### 1.1 文件清单与差异扫描结果

通过 `scripts/diff-v2-v3.cjs` 同款算法按行数差判定 V2/V3 关系：

| 文件 | V2 行数 | V3 行数 | Δ | 判定 |
|------|--------:|--------:|---:|------|
| `src/views/web/ucenter/bind.vue` | 227 | 145 | -82 | V3 主动重构（裁掉第三方绑定） |
| `src/views/web/ucenter/im.vue` | 479 | 427 | -52 | V3 已现代化 |
| `src/views/web/ucenter/info.vue` | 153 | 131 | -22 | V3 已现代化 |
| `src/views/web/ucenter/points.vue` | 68 | 46 | -22 | V3 已现代化 |
| `src/views/web/ucenter/pass.vue` | 106 | 94 | -12 | V3 已现代化 |
| `src/views/web/notice/WebNoticeDetail.vue` | 57 | 130 | +73 | V3 已现代化（含美化） |
| `src/views/web/notice/WebNoticeList.vue` | 76 | 117 | +41 | **V3 丢失 defaultParams** ⚠️ |
| `src/views/web/dashboard/index.vue` | 178 | 243 | +65 | V3 已现代化（重构布局） |
| `src/views/web/dashboard/components/WebLearningDynamics.vue` | 196 | 212 | +16 | V3 已现代化 |
| `src/views/web/dashboard/components/WebNoticeList.vue` | 280 | 303 | +23 | V3 已现代化 |
| `src/views/web/dashboard/components/WebQuickOpt.vue` | 181 | 156 | -25 | **V3 丢失 moduleCourse 门控** ⚠️ |
| `src/views/web/dashboard/components/WebRecentCourses.vue` | 253 | 276 | +23 | V3 已现代化 |
| `src/views/web/dashboard/components/WebRecommendCourses.vue` | 210 | 158 | -52 | V3 已现代化（清掉注释块） |
| `src/views/web/dashboard/components/WebStatNums.vue` | 124 | 206 | +82 | V3 已现代化（增加样式） |
| `src/views/web/dashboard/components/WebTaskCenter.vue` | 210 | 251 | +41 | V3 已现代化 |
| `src/views/web/mup.vue` | 180 | 181 | +1 | V3 已现代化（Batch J 完成） |
| `src/App.vue` | 76 | 132 | +56 | V3 已现代化（增强健壮性） |

**判定规则**：V3 文件大小 > V2 * 1.05 视为 V3 NEW（V3 已主动重构/超出）；V2 > V3 * 1.05 视为 V2 NEW ⚠️（需评估）。

### 1.2 真实业务丢失统计

| 严重度 | 数量 | 文件 |
|--------|-----:|------|
| 🔴 阻断级 | 0 | — |
| 🟠 功能丢失 | 2 | WebNoticeList.vue、WebQuickOpt.vue |
| 🟢 设计升级 | 0 | — |

## 2. 修复明细

### 2.1 🟠 WebNoticeList.vue — 缺 defaultParams

**问题**：V2 在 `listQuery.params` 中设置 `state: 0`（仅显示已发布公告）作为过滤条件，并显式声明 `defaultParams: { state: 0 }` 保证"重置"按钮不会清空业务标志。

V3 在重构为 `<script setup lang="ts">` 时遗漏了 `defaultParams`，导致：
- 用户输入关键字搜索后点击"重置"
- `DataGrid.resetList()` 调用 `applyQueryParamsReset(target, defaults)` 时 `defaults = {}`
- `state` 字段被清空（变成 `undefined` 或 `''`）
- 后端 `/api/sys/notice/client/paging` 接口失去 `state=0` 约束，可能返回草稿/下线公告

**修复**：

```diff
-    <DataGrid :options="options" :list-query="listQuery">
+    <DataGrid :options="options" :list-query="listQuery" :default-params="defaultParams">
```

```diff
 const options = {
   listUrl: '/api/sys/notice/client/paging',
   lineCount: 1
 }
+
+// 重置按钮默认值：保留 state 业务标志（0=已发布），清空用户输入的 title
+const defaultParams = {
+  state: 0
+}
```

**重要性**：🔴 关键 —— 公告列表页是用户高频入口，重置后看到草稿通知会造成混乱。

### 2.2 🟠 WebQuickOpt.vue — 缺 moduleCourse 门控

**问题**：V2 用 `<el-col v-if="siteData.props.moduleCourse">` 控制课程学习入口的显隐，这是 SaaS 多租户场景的标配 —— 关闭课程模块的客户不应看到课程入口。

V3 重构为 CSS Grid 时遗漏了 moduleCourse 条件判断，导致即使 `siteData.props.moduleCourse = false` 仍显示课程学习卡片。同一文件 dashboard 中 WebStatNums 组件正确使用了 `v-if="siteData.props?.moduleCourse"`，形成内部不一致。

**修复**：

```diff
-    <el-card class="opt-card" shadow="hover" @click="navToCourse">
+    <el-card v-if="siteData.props?.moduleCourse" class="opt-card" shadow="hover" @click="navToCourse">
```

```diff
 <script setup lang="ts">
 import { useRouter } from 'vue-router'
+import { storeToRefs } from 'pinia'
 import { Reading, EditPen, DocumentChecked } from '@element-plus/icons-vue'
+import { useSettingsStore } from '@/stores/modules/settings'

 const router = useRouter()
+const settingsStore = useSettingsStore()
+const { siteData } = storeToRefs(settingsStore)
```

**未修复项**：V2 的 `v-if="showNotice"`（公告凑数回退卡片）故意不恢复 —— V3 已改用 CSS Grid 响应式布局（`grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))`），无需凑数。同时 navToNotice 也已删除，公告入口被 `WebNoticeList` 组件（位于 dashboard 同区块上方）取代。

**重要性**：🟠 中等 —— 仅在关闭课程模块的客户场景下出现功能异常。

## 3. 已确认无需追赶的文件（V3 主动重构）

### 3.1 ucenter/bind.vue（V3 -82 行）

V3 注释明确记录决策：

> 决策记录: 本期只支持手机绑定（mobile），微信/钉钉/企业微信 v3 后端未提供第三方绑定 API，TODO 后续

V3 砍掉了：
- `bindWechat` / `bindCropWechat` / `bindDing` 三个跳转微信/钉钉绑定的方法
- `apiGetCropWechatUrl / apiGetDingUrl / apiGetWechatUrl` 三个第三方登录 API 调用
- 对应 `handleBind` / `handleUnbind` 中的微信/钉钉分支

替代方案是 `ElMessage.warning('该类型绑定功能升级中')` 友好提示用户。这是显式记录在源码注释中的"主动重构"决策，**无需追赶**。

### 3.2 ucenter/im.vue（V3 -52 行）

V3 已完整现代化：
- `<script setup lang="ts">` + Composition API
- `ref / watch` 替代 `data / watch`
- `ElMessageBox.confirm` 替代 `this.$confirm`
- `ElMessage.success` 替代 `this.$message.success`
- `useUserStore` + `userStore.fetchMsg()` 替代 `store.dispatch('user/fetchMsg')`
- `:deep(a)` 替代 `>>>` 等 V2 深度选择器
- 信函纸感样式完整保留（仅 `>>>` → `:deep()` 转换）

### 3.3 ucenter/info.vue（V3 -22 行）

V3 已完整现代化：
- `useUserStore` + `storeToRefs(settingsStore)` 替代 Vuex mapGetters
- `ElNotification.success` 替代 `this.$notify`
- `await formRef.value?.validate()` 替代 `this.$refs.postForm.validate(callback)`
- 顶部注释掉的"登录账号"`<el-col>` 块删除（V2 也是注释，未实际渲染）

### 3.4 ucenter/points.vue（V3 -22 行）

V3 已完整现代化：
- `<script setup lang="ts">` + `ref`
- `Search` Icon 替代字符串 `el-icon-search`
- 注释掉的"积分"列已清理
- `:deep(.search-area)` 替代 `::v-deep .search-area`

### 3.5 ucenter/pass.vue（V3 -12 行）

V3 已完整现代化（字段名 + 校验函数均已适配 v3 后端契约）：
- `oldPassword/password/confirm` → `oldPass/newPass/confirm`（v3 后端字段）
- `checkPass` → `checkPassLevel`（v3 工具函数，强度校验）
- `ElNotification.success` 替代 `this.$notify`
- `await formRef.value?.validate().catch(() => false)` 替代 callback 风格
- `userStore.logoutAction()` 替代 `this.$store.dispatch('user/logout')`
- 路由跳转 `'/pages/login/login'` 保留

### 3.6 notice/WebNoticeDetail.vue（V3 +73 行）

V3 主动重构（无业务丢失）：
- 新增 `<el-page-header>` 返回导航
- 新增 `navBack` 函数（`window.history` 检测）
- 完整 TypeScript interface
- `try/catch` 包裹 fetchDetail
- 增强样式：scoped card 容器 + 移动端适配

### 3.7 notice/WebNoticeList.vue 主体（V3 +41 行）

V3 主动重构（业务丢失仅 defaultParams 已修复，详见 §2.1）：
- `<script setup lang="ts">` + Composition API
- `Search` Icon 替代 `el-icon-search`
- 完整 TypeScript ref
- 移动端响应式样式

### 3.8 dashboard/index.vue（V3 +65 行）

V3 主动重构（业务无丢失）：
- 集成 WebQuickOpt 至 `.dash-entry-block` flex 列布局（与 WebNoticeList 共享同一区块）
- 改用 `useSettingsStore` 替代 Vuex mapGetters
- 增加移动端断点响应式布局
- `dashboardStatData` 类型契约从子组件 export

### 3.9 dashboard/components/WebLearningDynamics.vue、WebNoticeList.vue、WebRecentCourses.vue、WebStatNums.vue、WebTaskCenter.vue

全部已完整现代化为 `<script setup lang="ts">` + Pinia + 完整 TypeScript interface + 增强样式。仅行数差异属于主动重构范围。

### 3.10 dashboard/components/WebRecommendCourses.vue（V3 -52 行）

V3 主动清理（无业务丢失）：
- 移除 V2 中已注释的 teacher-info / likeCount / rate 三块 UI
- `el-icon-arrow-right / el-icon-view / el-icon-chat-dot-square` → Element Plus `ArrowRight / View / ChatDotSquare` Icon
- `slot="header"` → `<template #header>`
- TypeScript interface + `defineProps<{ list?: CourseItem[] }>()`

### 3.11 web/mup.vue（V3 +1 行，实质一致）

文件头注释已记录：

> @date 2026-08-07 Batch J: 从 V2 增量同步重试机制、用户会话同步、清理逻辑

V3 已完整现代化：
- `<script setup lang="ts">` + Composition API
- `useRoute()` 替代 `this.$route`
- `useUserStore` + `userStore.sync()` 替代 `this.$store.dispatch('user/sync')`
- `ElMessage.success` 替代 `this.$message.success`
- try/catch 包裹 `examCheckUploadToken` / `examSubmitUpload`
- `:deep()` 替代 `::v-deep`

实质差异仅在样式注释/格式（+1 行），业务逻辑完全保留。

### 3.12 App.vue（V3 +56 行）

V3 主动增强（无业务丢失）：
- `<script setup lang="ts">` + Composition API
- `useDeviceResize()` 替代 V2 `ResizeHandler.js`（迁移注释明确说明）
- 新增 `isFetching` 防抖标志、`isInitialized` 初始化守卫
- 新增 `visibilitychange` 监听（页面隐藏/显示时启停定时器）
- `watch(hasToken)` 响应登入/登出启停定时器
- `console.log(`router from previous to ${String(name)}`)` 调试日志（V2 没有但无害）
- `defineExpose({ stopMsgTimer })` 暴露清理方法

V2 的 `$route.name` 空值跳首页逻辑完整保留至 V3 `watch(() => route.name)`。

## 4. 验证

### 4.1 typecheck

```bash
$ npm run typecheck
> vue-tsc --noEmit -p tsconfig.check.json --skipLibCheck

（无错误输出）
```

**结果**：✅ 0 error

### 4.2 build

```bash
$ npm run build
...
✓ built in 25.64s
```

**结果**：✅ 0 error，产物大小与 Batch 10 一致

### 4.3 Git 状态确认

```
 M src/views/web/dashboard/components/WebQuickOpt.vue
 M src/views/web/notice/WebNoticeList.vue
```

仅 2 个文件 modified，与本批 2 处修复一致。

## 5. 11-batch V2V3 业务功能差异迁移总览

| 批次 | 模块 | 真实业务丢失 | 状态 |
|------|------|------------|------|
| Batch 1 | styles + directive | 0 | ✅ |
| Batch 2 | ComponentsBase table | 0 | ✅ |
| Batch 3 | ComponentsBase file | 0 | ✅ |
| Batch 4 | layout/Admin | 0 | ✅ |
| Batch 5 | layout/Web + login | 2 bug | ✅ |
| Batch 6 | admin/dashboard | 0 | ✅ |
| Batch 7 | training | 1 bug | ✅ |
| Batch 8 | web/course | 0 | ✅ |
| Batch 9 | web/exam 前半 | 1 bug | ✅ |
| Batch 10 | web/exam 后半 + web/repo | 6 bug | ✅ |
| **Batch 11** | **web/ucenter + notice + dashboard + mup + App** | **2 bug** | **✅** |

**总计修复真实业务丢失 12 处**（跨 11 个批次），每批均通过 `npm run typecheck` + `npm run build` 双 0 error 验证。

## 6. 后续建议

1. **第三方登录绑定**（bind.vue）：v3 后端接入微信/钉钉/企业微信 OAuth 后，恢复对应 bindWechat/bindCropWechat/bindDing 方法（API 路径已存在：`@/api/ability/login`）。
2. **Vuex 残留清理**：本批涉及的 5 个 ucenter 文件均已迁移至 Pinia，但项目内仍有部分 admin 模块文件残留 Vuex。可参考 20260807-V3全项目V2残留扫描终版报告.md 中的待办清单继续推进。
3. **defaultParams 审查**：WebNoticeList 修复揭示出"重构时丢失业务标志"的常见模式，建议对所有使用 DataGrid/DataGrid 的页面做一次 `defaultParams` 完整性 review。
