# Batch 9 web/exam 前半迁移报告

> Git分支：v3.0  作者：Qoder  版本：v3.0  日期：2026-08-08

## 概述

本次评估覆盖 Batch 9 前半 7 个文件 + 修复 1 个真实 bug（`ExamTimer.vue` 计时器秒数解析错误）。

| 类别 | 数量 |
|------|------|
| V3 已现代化，无需追赶 | 6 |
| 真实 bug 修复（含 API 类型收紧） | 1（涉及 3 文件） |
| **合计** | **7** |

## 文件清单与评估

| # | V3 文件 | V3 行数 | V2 行数 | 差距 | 评估 | 备注 |
|---|---------|--------|---------|------|------|------|
| 1 | `src/views/web/exam/components/ResultLeftNav.vue` | 189 | 217 | -28 | ✅ V3 已现代化 | script setup + defineProps |
| 2 | `src/views/web/exam/WebExamCheck.vue` | 237 | 263 | -26 | ✅ V3 已现代化 + 新增三路监控设备调试确认 | script setup + 直接 import |
| 3 | `src/views/web/exam/components/dialog/ExamApplyDialog.vue` | 101 | 112 | -11 | ✅ V3 已现代化 | script setup + FormInstance |
| 4 | `src/views/web/exam/components/ExamFullMode.vue` | 101 | 108 | -7 | ✅ V3 已现代化 + 抽出 `formatGroupStats` | 清理 `pageLoading`（未用） |
| 5 | `src/views/web/exam/components/ExamTimer.vue` | 96 | 102 | -6 | 🔴 **BUG修复** | 后端返回 `data: number`，旧 V3 误读 |
| 6 | `src/views/web/exam/components/ActionChecker.vue` | 59 | 61 | -2 | ✅ V3 已现代化 | script setup + 类型化 props |
| 7 | `src/views/web/exam/components/QuItemExam.vue` | 312 | 312 | 0 | ✅ V3 已现代化 | 同步升级 icon + slot 语法 |

## 🔴 BUG 修复：ExamTimer.vue 计时器一启动就超时

### 现象

学员进入考试页面，`ExamTimer.vue` 立即触发 `emit('timeout')`，考试被强制结束。

### 根因

后端 `PaperController.leftTime`（`PaperController.java:304-307`）返回：

```java
@PostMapping("/left-time")
public ApiRest<Long> leftTime(@RequestBody BaseIdReqDTO reqDTO) {
    return super.success(baseService.leftTime(reqDTO.getId()));
}
```

响应 `data` 是 `Long` 秒数（不是对象）。

但 V3 旧代码（`ExamTimer.vue:52-55`）：

```typescript
leftTime(props.paperId).then((res) => {
  const data = res.data as { leftTime?: number; leftSeconds?: number }
  initTime(data.leftTime ?? data.leftSeconds ?? 0)   // ← 永远取 0
})
```

`res.data` 实际是 `number`（秒数），但代码把它 cast 成 `{ leftTime?: number; leftSeconds?: number }`，导致 `data.leftTime` 和 `data.leftSeconds` 都是 `undefined`，`??` 落到 `0` → `initTime(0)` → `emit('timeout')`。

### 修复

**1. `src/api/admin/paper/paper.ts`** — 收紧 `leftTime` API 类型：

```typescript
export function leftTime(paperId: string | number): Promise<ApiResponse<number>> {
  return import('@/utils/request').then(m => m.post('/api/paper/paper/left-time', { id: paperId }))
}
```

**2. `src/views/web/exam/components/ExamTimer.vue`** — 直接用 `res.data` 作为秒数：

```typescript
function fetchLeft() {
  if (!props.paperId) return
  init.value = false
  leftTime(props.paperId).then((res) => {
    initTime(Number(res.data ?? 0))
  })
}
```

**3. `src/api/client/exam/client.ts`** — 顺手收紧 `checkProcess` 类型（同步修复同 Batch 内的同类问题）：

```typescript
export interface ClientExamProcessInfo {
  id?: string | number
  examId?: string | number
  title?: string
  totalTime?: number
  userTime?: number
  [key: string]: unknown
}

export function checkProcess(): Promise<ApiResponse<ClientExamProcessInfo | null>> {
  return post('/api/paper/paper/check-process', {})
}
```

后端 `PaperServiceImpl.checkProcess`（`PaperServiceImpl.java:194-202`）在无进行中考试时返回 `null`，旧类型 `Promise<ApiResponse<{ id: string }>>` 不允许 null。V3 调用方（`WebExamCheck.vue` / `WebExamList/index.vue`）都已用 `if (res.data?.id)` null-safe 检查，仅需补齐类型。

### 调用方兼容性

| 调用方 | 旧调用 | 新行为 |
|--------|--------|--------|
| `WebExamCheck.vue:180-181` | `if (res.data?.id) { router.push({ name: 'StartExam', query: { id: res.data.id }})}` | ✅ null-safe，无需改 |
| `WebExamList/index.vue:31-34` | `if (res.data && res.data.id) { breakShow.value = true; breakId.value = res.data.id }` | ✅ null-safe，无需改 |

## 各文件现代化要点

### 1. ResultLeftNav.vue（差 -28 行）

V2 → V3 关键改动：
- `data() / mounted / beforeDestroy / created` → `setup + onMounted + onBeforeUnmount + watch(props.data, { immediate: true })`
- `slot="header"` → 移除（el-card 不需要）
- `<i class="el-icon-s-flag">` → `<el-icon><Flag /></el-icon>` + `<Flag>` import
- `type="text"` → `type="primary" link`（Element Plus 弃用 `text` 类型）
- `import scrollTo` 直接从 `@/utils/scroll-to`

行数减少 28 行是因为 V3 的 `defineProps<{ data?: Record<string, unknown> }>()` + `watch` 替代了 V2 的 `created + watch.data`，且移除了 `<slot>`/`<i class="el-icon-s-flag">` 的冗余模板。

### 2. WebExamCheck.vue（差 -26 行）

V2 → V3 关键改动：
- `@business` / `@viewComponents` 别名 → 直接 import `@/components/ComponentsBusiness/sys/FaceCheckDialog.vue` 等
- `$navBack` → `router.back()`
- 注释掉的 V2 pay-box 代码清理（`<!-- v-if="checkData.stateCode==='SYS_MSG.REQUIRE_BAY'" -->`）
- `icon="el-icon-s-promotion"` → `:icon="Promotion"` + `@element-plus/icons-vue`
- `icon="el-icon-help"` → `:icon="QuestionFilled"`
- `size="mini"` → `size="small"`（Element Plus 移除 `mini`）
- `StateMsgShow` 通过 `import { StateMsgShow } from '@/components/ComponentsBase'` 自动组件解析

**V3 新增能力（无 V2 对应）**：

```typescript
// 三路监控考试（examType === '2'）的设备调试确认
async function showDeviceTest() {
  if (checkData.value.examType === '2') {
    try {
      await ElMessageBox.confirm(
        '三路监控考试请在独立窗口完成设备检测。若环境已就绪，请点击确定继续。',
        '设备调试',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      )
      deviceDebug.value = true
    } catch { /* 取消 */ }
    return
  }
  deviceVisible.value = true
}
```

V2 是跳到独立 `RtcDeviceTest` 路由页（`window.open(routeData.href, '_blank')`），V3 简化为确认弹窗（业务侧可能后续接 RTC 检测 SDK）。本批次不动（属于业务简化方向决策）。

### 3. ExamApplyDialog.vue（差 -11 行）

V2 → V3 关键改动：
- `data()/methods/watch` → `setup + ref + watch`
- `$refs.postForm` → `const postFormRef = ref<FormInstance>()`
- `this.$emit` → `emit('update:visible', ...)`
- `this.$message.success` → `ElMessage.success`
- `slot="footer"` → `<template #footer>`
- `:rows="5"` → `:rows="5"` (Element Plus v-model="textarea:rows" 用 number)
- `saveApply` 改用 `@/api/admin/exam/apply`（V2 用 `@/api/exam/apply`，对应 V3 admin/ 模块规范）

行数减少 11 行主要因为 V3 的 `defineEmits` 替代了 `methods: { handleApply() { this.$emit(...) } }`。

### 4. ExamFullMode.vue（差 -7 行）

V2 → V3 关键改动：
- 模板行内表达式 `(共{{ group.quCount }}题,每题{{ group.perScore }}分,合计{{ group.totalScore }}分)` → 抽出 `formatGroupStats(group)` 函数
- 移除 V2 的 `pageLoading`（未用字段）
- `props.paper.id` 检测 → `(props.paper as { id?: string }).id`
- `QuItemExam` 由 `@viewComponents` 别名 → 直接 import
- watch 的 `deep: true` 行为保留，`immediate: true` 是 V3 新增（V2 在 `created` 里调 `fillPaper()`）

V3 的 `defineExpose({ focus })` 保留了 V2 的 `focus()` 方法（供父组件调用滚动到指定题目）。

### 5. ExamTimer.vue（见上文 BUG 修复）

### 6. ActionChecker.vue（差 -2 行）

V2 → V3 关键改动：
- `data()/watch.created/methods` → `setup + ref + watch + onMounted + onBeforeUnmount`
- `props: { actionOn: Boolean, actionInterval: Number, trigger: Number }` → `defineProps<{ actionOn?: boolean; actionInterval?: number; trigger?: number }>`
- `this.$emit('break')` → `emit('break')`
- `clearCalc()` 增加 `timer.value = null` 重置（V2 没重置）

业务逻辑完全一致：每 1 秒减 1，到 0 emit('break')。行为无差异。

### 7. QuItemExam.vue（已一致，312 = 312）

V2/V3 行数完全一致，但内部已全部现代化：
- `i class="el-icon-s-flag"` → `<el-icon><Flag /></el-icon>` + `Flag` import
- `slot` / `<div slot="footer">` → `<template #footer>`
- `QuItemExam: () => import('@viewComponents').then((m) => m.QuItemExam())` → 直接 import + `defineOptions({ name: 'QuItemExam' })`（Vue3 已支持 setup 自我递归组件）
- `this.$refs.tinymce` → `const tinymceRef = ref<InstanceType<typeof Tinymce> | null>(null)`
- `this.$isDev` → `instance?.appContext.config.globalProperties.$isDev`（通过 `getCurrentInstance()`）
- `this.$nextTick` → `nextTick`
- 内部 `data() { return { paste: this.$isDev } }` → `const paste = ref(!!instance?.appContext.config.globalProperties.$isDev)`
- 类型化 `AnswerItem` / `QuData` interface

V3 在 watch 内增加类型化 QuData 子题列表（`subList?: QuData[]`），递归子组件时 `value: subItem` 类型不会丢失。

## 决策

| 文件 | 决策 | 原因 |
|------|------|------|
| ResultLeftNav.vue | ✅ 不动 | V3 已现代化，无业务差异 |
| WebExamCheck.vue | ✅ 不动（含新增三路监控确认弹窗） | V3 已现代化 + 主动简化 RTC 流程 |
| ExamApplyDialog.vue | ✅ 不动 | V3 已现代化，API 路径正确 |
| ExamFullMode.vue | ✅ 不动 | V3 已现代化 + 抽函数，无差异 |
| ExamTimer.vue | 🔴 **修复** | 计时器秒数解析 bug |
| ActionChecker.vue | ✅ 不动 | V3 已现代化 |
| QuItemExam.vue | ✅ 不动 | V3 已现代化（行数巧合一致） |
| `leftTime` API | 🔴 **修复** | 收紧类型，与后端对齐 |
| `checkProcess` API | 🔴 **修复** | 收紧类型补齐 null 情形 |

## 验证

- **Typecheck**：`npm run typecheck` 通过（0 errors）
- **Build**：`npm run build` 通过（28.56s，0 errors）
- **V3 全部为 Vue3 idioms**：100% `<script setup lang="ts">` + Composition API
- **V3 中无 Vue2 残留**：0 处
- **类型契约与后端对齐**：`leftTime` / `checkProcess` 类型签名已修正

## 结论

| 范围 | 文件数 | 结论 |
|------|--------|------|
| 不动（V3 已现代化） | 6 | ResultLeftNav / WebExamCheck / ExamApplyDialog / ExamFullMode / ActionChecker / QuItemExam |
| 修复 bug（含 API 类型） | 3 | ExamTimer + leftTime API + checkProcess API |
| **合计** | **9** | **不动 6 / 修复 3** |

## 下一步

进入 Batch 10（web/exam 后半 7 文件 + web/repo 1 文件）：
- `WebExamBook.vue` / `WebExamList/*` / `WebPaperList.vue` / `WebExamStart.vue` / `WebExamResult/*` / `Thanks*` / `ResultDetail.vue`
- `web/repo/QuReportDialog.vue`（+13）