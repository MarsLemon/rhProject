# Batch 10：web/exam 后半 + web/repo 部分迁移报告

> Git分支：master  作者：MarsLemon  版本：v3.0  日期：2026-08-08

## 📋 范围

按 `documents/plans/v3.0-20260808-V2V3业务功能差异迁移计划.md` §3.10，覆盖 8 个文件：

| # | 模块 | 文件 | V2 行数 | V3 行数 | 评估 |
|---|------|------|--------:|--------:|------|
| 1 | web/exam | WebExamBook.vue | 132 | 118 | ⚠️ 真落后：`defaultParams` 缺失（重置后 examId 被清空） |
| 2 | web/exam | WebExamList/index.vue | 72 | 52 | ✅ 已现代化（无功能差异） |
| 3 | web/exam | WebExamList/MyExamPage.vue | 166 | 203 | ⚠️ 真落后：`defaultParams` 缺失 |
| 4 | web/exam | WebExamList/OpenExamPage.vue | 114 | 135 | ✅ 已现代化（V2 标记废弃，V3 注释为保留入口） |
| 5 | web/exam | WebPaperList.vue | 134 | 116 | ⚠️ 真落后：`defaultParams` 缺失 |
| 6 | web/exam | WebExamStart.vue | 533 | 354（拆分前 595） | 🔴 重大业务丢失：交卷未答题统计/未答题确认弹窗、考试模式状态、清屏/水印清理、路由缓存重置倒计时、试卷空异常弹窗、进入考试模式 localStorage 缓存全部丢失 |
| 7 | web/exam | WebExamResult/index.vue | 61 | 49 | ✅ 已现代化（handleBack 跳转从 `/pages/plan` 改为 `/pages/exam` 是 V3 主动重构） |
| 8 | web/exam | WebExamResult/ThanksOnly.vue | 49 | 36 | ✅ 已现代化 |
| 9 | web/exam | WebExamResult/ThanksWithScore.vue | 64 | 55 | ✅ 已现代化 |
| 10 | web/exam | WebExamResult/ResultDetail.vue | 42 | 33 | ⚠️ 失回归：丢失 V2 的 `ResultQuList ref="joinQuList"` |
| 11 | web/repo | QuReportDialog.vue | 96 | 83 | ✅ 已现代化（API 路径从 `@/api/client/qu/report` 迁移到 `@/api/client/report`，是 V3 模块化重构） |

> 注：File 数量超出"8 文件"是因为 ResultDetail/Thanks* 拆分为 4 个子文件。原计划文件统计在 V2 是 5 个 .vue，本批次对应 8 个目标 .vue。

## ✅ 已完成工作

### 1. WebExamBook.vue：补齐 `defaultParams`（V2 等价行为恢复）

**V2 行为**（132 行）：
```js
defaultParams: { examId: this.$route.query.examId || '' }
onMounted() { this.listQuery.params.examId = this.$route.query.examId }
```

**V3 旧行为**：直接 `onMounted` 赋值，但缺失 `defaultParams`。DataTable 工具栏点击"重置"按钮时会把 `params.examId` 清空，导致用户从某场考试入口进入错题本后，重置筛选会丢失考试过滤条件。

**V3 修复后**（118 行）：
```ts
const examId = String(route.query.examId || '')

const listQuery = ref({
  current: 1,
  size: 10,
  params: { title: '', examId }
})

const defaultParams = { examId }
```

模板同步添加 `:default-params="defaultParams"`。这样即使学员在错题列表搜索题目后点击重置，仍能保留 `examId` 过滤（只清空 `title`）。

### 2. WebExamList/MyExamPage.vue：补齐 `defaultParams`（+3 行）

**V2 行为**：
```js
defaultParams: { catId: '' }   // 保留分类树选中，清空 title/dateRange
```

**V3 旧行为**：没有 `defaultParams`，重置按钮把 `catId` 也清空。

**V3 修复后**（206 行）：
```ts
const defaultParams = {
  catId: ''
}
```

模板同步添加 `:default-params="defaultParams"`。`flag` 由 `stateList` 内部处理，无需出现在 defaultParams。

### 3. WebPaperList.vue：补齐 `defaultParams`（+2 行）

与 WebExamBook 同源问题——`examId` 来自路由，点击"重置"按钮后丢失考试过滤。

**V3 修复后**（117 行）：同 WebExamBook，`defaultParams = { examId }` + `examId` 直接初始化在 params 中。移除冗余的 `onMounted`（路由参数直接在 setup 顶层读取，更早可用，避免首次渲染携带错误过滤）。

### 4. WebExamStart.vue：恢复 6 处被 Batch K 拆分时丢失的业务逻辑（+66 行）

Git diff 对比 Batch K 提交，V3 当前 354 行版本相对 V2 533 行丢失了以下关键逻辑：

#### 4.1 `useAppStore` 与考试模式状态切换
```ts
import { useAppStore } from '@/stores/modules/app'
const appStore = useAppStore()

onMounted(() => {
  appStore.setExamMode(true)
})
onBeforeUnmount(() => {
  appStore.setExamMode(false)
})
```

**业务意义**：考试模式下隐藏 AI 助手按钮等（[AiButtonGroup/index.vue:71](src/components/AiButtonGroup/index.vue#L71) 显式读取 `appStore.examMode`）。原 V3 卸载时只调用了 `screenfullScreen.exit()`，完全遗漏考试模式 flag，导致学员考完试离开页面后，AI 助手仍被错误隐藏。

#### 4.2 `localStorage.setItem(psKey, 'yes')` 考试缓存
```ts
onMounted(() => {
  setTimeout(() => {
    localStorage.setItem(psKey, 'yes')   // psKey = 'exam-process-cache'
  }, 2000)
})
```

**业务意义**：路由层（App.vue 或权限守卫）通过 `localStorage.getItem('exam-process-cache')` 检测当前是否有进行中的考试，避免刷新页面时丢失考试进度。原 V3 拆分时把这一行删了，导致学员按 F5 刷新后系统不能识别"我正在考试"。

#### 4.3 交卷前的"未答题统计 + 确认弹窗"
```ts
function countNotAnswered(): number { /* 递归统计 paperData.groupList[*].quList[*].answered */ }

async function handDirect() {
  const na = countNotAnswered()
  const msg = na > 0 ? `您还有${na}题未作答，确认要交卷吗?` : '确认要交卷吗？'
  try {
    await ElMessageBox.confirm(msg, '提示', { ... })
    handWithEx(0)
  } catch {
    // 用户取消
  }
}

function doHandler(type: number) {
  if (!paperData.value) return
  if (type === 0) handDirect()
  else handWithEx(type)
}
```

**业务意义**：原 V3 `doHandler(0)` 直接调后端并跳转，学员看不到"还有 N 题未作答"提示。严重业务丢失——可能导致学员误交。

#### 4.4 `handWithEx` 异步化 + `clearPage` 清理水印/全屏
```ts
function clearPage() {
  watermark.remove()
  if (screenfullScreen.isFullscreen) screenfullScreen.exit()
}

async function handWithEx(type: number) {
  if (!paperData.value) return
  try {
    await handExam({ id: paperData.value.id, type })
    clearPage()                       // 移除水印 + 退出全屏
    setTimeout(() => {
      router.push({ name: 'WebExamResult', query: { id: paperData.value!.id } })
    }, 500)
  } catch (error) {
    if (import.meta.env.DEV) console.error('交卷失败:', error)
  }
}
```

**业务意义**：交卷后必须移除 DOM 水印（学员看答案页不应再叠用户名水印）并退出全屏（导航到结果页需要看到完整布局）。原 V3 只 `await handExam` 然后跳转，水印永远留在 DOM 上。

#### 4.5 `emptyCheck` 试卷空异常弹窗
```ts
async function emptyCheck() {
  if (allQuIds.value.length === 0) {
    try {
      await ElMessageBox.confirm('试卷内容出现问题，无法继续考试！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
      router.push('/pages/exam?break')
    } catch {
      // 取消
    }
  }
}
```

**业务意义**：当试卷没有题目时，V2 会弹窗"试卷内容出现问题"，学员确认后返回考试大厅。原 V3 只用 `ElMessage.warning('试卷无题目')` 然后 `router.back()`——`router.back()` 可能回到试卷加载前的任意页面，体验不一致。

#### 4.6 `leaveBack` 调用 ExamTimer.fetchLeft() 同步服务端倒计时
```ts
function leaveBack() {
  if (examTimer.value && typeof examTimer.value.fetchLeft === 'function') {
    examTimer.value.fetchLeft()
  }
}
```

**业务意义**：学员切屏后返回，`LeaveChecker` 触发 `@back` 事件，调用 `fetchLeft` 重新查询服务端剩余秒数（避免前端定时器漂移）。原 V3 改为 `fetchData(paperId.value)` 重新加载整个试卷，浪费一次 paperDetail 接口且可能覆盖学员未保存的答案（取决于 ExamStepMode/ExamFullMode 内部缓存）。

#### 4.7 修复 `fetchData` 残留 `allQuIds`
```ts
const res = await paperDetail({ id })
paperData.value = res.data
allQuIds.value = []      // 关键：清空旧值，否则重考时旧题号残留导致上下题按钮错位

for (let i = 0; i < paperData.value.groupList.length; i++) { ... }
```

**业务意义**：同一组件实例上连续考两场考试（A 场 → 返回 → 考 B 场），`allQuIds` 数组如果不重置会累积两场题目，导致"上一题/下一题"按钮行为错乱。

### 5. WebExamResult/ResultDetail.vue：恢复 `ResultQuList ref="joinQuList"`

**V2 行为**（42 行）：
```html
<ResultQuList ref="joinQuList" :data="postForm" />
```

**V3 旧行为**（34 行）：无 ref，直接 `<ResultQuList :data="postForm" />`。

**V3 修复后**（36 行）：
```html
<!-- 题目列表 -->
<ResultQuList ref="joinQuList" :data="postForm" />
```

**业务意义**：`joinQuList` ref 保留供未来父组件访问（如打开题目详情弹窗时定位），同时注释"题目列表"对齐 V2 注释风格。

### 6. QuReportDialog.vue：✅ 无修改

V3 已现代化：
- `defineProps` + `defineEmits` 取代 Vue2 Options API
- `dialogVisible` 用 `computed` getter/setter + `emit('update:visible')` 实现 `v-model:visible` 双向绑定
- `postFormRef` 用 `ref<FormInstance>()` 类型化
- `:deep(.main-bg)` 取代 `::v-deep`
- API 路径从 `@/api/client/qu/report` 迁移到 `@/api/client/report`（V3 模块化重构）

调用方（WebRepoDetail.vue 等）已用 `v-model:visible` 形式绑定，无兼容性影响。

## 🧪 验证

### 1. TypeScript 类型检查
```bash
$ npm run typecheck
> vue-tsc --noEmit -p tsconfig.check.json --skipLibCheck
$ (无错误输出)
```
✅ 通过 0 error

### 2. 构建验证
```bash
$ npm run build
✓ built in 38.24s
```
✅ 通过 0 error

### 3. 迁移回归 smoke 测试
```bash
$ node -e "..."
migration regression test passed
```
✅ 验证：
- 3 个 list 组件（WebExamBook / MyExamPage / WebPaperList）已包含 `default-params`
- WebExamStart 已包含 `countNotAnswered` + `handDirect` + `setExamMode`

## 📝 业务影响

| 修复项 | 影响范围 | 严重度 |
|--------|---------|--------|
| `defaultParams` 重置保留考试过滤 | 3 个考试相关列表页 | 🟡 中（学员体验问题） |
| `useAppStore.setExamMode` 考试模式切换 | 考试中所有页面 + AI 助手显隐 | 🔴 高（业务正确性） |
| `localStorage.setItem(psKey, 'yes')` 路由刷新检测 | 考试中途刷新场景 | 🔴 高（数据丢失风险） |
| 交卷未答题统计 + 确认弹窗 | 所有手动交卷场景 | 🔴 高（用户体验 + 误操作） |
| `clearPage` 移除水印 + 退出全屏 | 交卷后跳结果页 | 🟡 中（DOM 残留 + 全屏卡死） |
| `emptyCheck` 异常试卷确认弹窗 | 试卷无题目场景 | 🟡 中（异常流程降级） |
| `leaveBack` 同步服务端倒计时 | 切屏返回场景 | 🟢 低（计时精度） |
| `fetchData` 清空 `allQuIds` | 连续考两场场景 | 🟡 中（题号错位） |
| `ResultQuList ref="joinQuList"` | ResultDetail | 🟢 低（接口完整性） |

## 📂 产出清单

| 文件 | 变更类型 | 行数变化 |
|------|---------|---------:|
| `src/views/web/exam/WebExamBook.vue` | M | +11 / -9 |
| `src/views/web/exam/WebExamList/MyExamPage.vue` | M | +5 / -1 |
| `src/views/web/exam/WebPaperList.vue` | M | +8 / -9 |
| `src/views/web/exam/WebExamStart.vue` | M | +69 / -2 |
| `src/views/web/exam/WebExamResult/ResultDetail.vue` | M | +3 / -2 |
| `documents/20260808-Batch10-web-exam-part2-web-repo-迁移报告.md` | A | +160 |

## 🚀 下一步

**Batch 11**：web/ucenter + web/notice + web/dashboard + web/mup + App.vue（7 文件）

预计重点：
- `web/ucenter/bind.vue`（+82 🔴）
- `web/ucenter/im.vue`（+52）
- `web/mup.vue`（+136 🔴）
- `App.vue`（需评估 Pinia store 切换 token + 路由缓存恢复逻辑）

---

**Batch 10 完成时间**：2026-08-08  
**typecheck 状态**：✅ 通过  
**build 状态**：✅ 通过（38.24s）  
**迁移回归测试**：✅ passed