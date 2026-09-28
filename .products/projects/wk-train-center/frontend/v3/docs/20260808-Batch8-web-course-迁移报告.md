# Batch 8 web/course 迁移报告

> Git分支：v3.0  作者：Qoder  版本：v3.0  日期：2026-08-08

## 概述

本次评估覆盖 `src/views/web/course/` 全部 26 个 V3 文件（plan 中列出 6 个核心文件 + 4 个 V3 新增 + 16 个其他）与 V2 的 22 个源文件对比。

**结论**：6 / 6 plan 列出的文件全部已现代化，无需迁移。V3 在多个文件上**主动优化了实现**（如 WebMultiAddCourseFileDialog 修复了 `val === 'true'` bug，CourseDetail 拆分为薄入口 + 升级安全机制）。

## 文件清单与评估

### Plan 列出的 6 个文件

| # | V3 文件 | V3 行 | V2 行 | 行差 | 评估 | 备注 |
|---|---------|------|------|------|------|------|
| 1 | `CourseDetail.vue` | 260 | 477 | -217 | ✅ V3 拆分+安全升级 | Batch K 拆分（506 → 295 → 260） |
| 2 | `components/CourseCam.vue` | 129 | 130 | -1 | ✅ 现代化 | canvas 生成 base64 替代 V2 文件依赖 |
| 3 | `components/dialog/WebMultiAddCourseFileDialog.vue` | 138 | 192 | -54 | ✅ 现代化+修 bug | `useWebFileUpload` composable 替代 mixin + 修 `val === 'true'` bug |
| 4 | `components/dialog/components/WebFileListTable.vue` | 83 | 105 | -22 | ✅ 现代化 | script setup + TS 类型化 emit |
| 5 | `components/dialog/CourseQaDetailDialog.vue` | 230 | 199 | +31 | ✅ 现代化 | script setup + 完整 chat 气泡样式 |
| 6 | `WebCourseQaList/index.vue` | 24 | 25 | -1 | ✅ 现代化 | 薄入口 |

**不动** —— 6 / 6。

### 其他 web/course 文件（不在 plan 但相关）

| # | V3 文件 | V3 行 | V2 行 | 评估 |
|---|---------|------|------|------|
| 7 | `UserCourseFileList.vue` | 251 | 489 | ✅ 已迁（BatchJ #1） |
| 8 | `WebCourseList/AssignedCoursePage.vue` | 156 | 151 | ✅ V3 重写 |
| 9 | `WebCourseList/CourseLearnPage.vue` | 116 | 122 | ✅ V3 重写 |
| 10 | `WebCourseList/LecturerCenterPage.vue` | 243 | 236 | ✅ V3 重写 |
| 11 | `WebCourseList/OpenCoursePage.vue` | 369 | 545 | ✅ V3 重写 |
| 12 | `WebCourseList/SelfStudyCoursePage.vue` | 149 | 124 | ✅ V3 重写 |
| 13 | `WebCourseList/index.vue` | 120 | 74 | ✅ V3 重写 |
| 14 | `WebCourseList/CourseCard.vue` | 189 | (无) | V3 新增 |
| 15 | `WebCourseQaList/WebCourseQa.vue` | 336 | 161 | ✅ V3 重写 |
| 16 | `components/AIPPT/WebAddCourseFileDialog.vue` | 265 | 331 | ✅ V3 重写 |
| 17 | `components/AIPPT/WebAiPptGeneratorButton.vue` | 334 | 308 | ✅ V3 重写 |
| 18 | `components/CourseLive.vue` | 100 | 80 | ✅ V3 重写 |
| 19 | `components/FileFrame.vue` | 319 | 317 | ✅ V3 重写 |
| 20 | `components/ReadCheck.vue` | 150 | 148 | ✅ V3 重写 |
| 21 | `components/ReadSocket.vue` | 88 | 82 | ✅ V3 重写 |
| 22 | `components/UserCourseSelect.vue` | 125 | 124 | ✅ V3 重写 |
| 23 | `components/CourseFileItem.vue` | 152 | (无) | V3 新增（Batch K 从 CourseDetail 拆出） |
| 24 | `components/CourseIntroPanel.vue` | 139 | (无) | V3 新增（Batch K 从 CourseDetail 拆出） |
| 25 | `components/CourseSelect.vue` | 117 | (无) | V3 新增 |
| 26 | `components/dialog/CourseQaPublishDialog.vue` | 132 | 116 | ✅ V3 重写 |

**V3 26 个 vs V2 22 个**：V3 多出 4 个文件，全部为 Batch K 拆分产物或主动新增组件。

## 详细对比分析

### 1. WebMultiAddCourseFileDialog.vue（V3 修复 bug + 现代化）

**V2 bug**（已修复）：
```javascript
watch: {
  visible(val) {
    this.dialogVisible = val === 'true'  // ❌ 字符串永远不等于 boolean
  }
}
```

**V3 修复**：
```typescript
watch(() => props.modelValue, (val) => { dialogVisible.value = val }, { immediate: true })
watch(dialogVisible, (val) => emit('update:modelValue', val))
```

**架构差异**：
- V2 使用 mixin (`mixins: [useWebFileUpload]`) - V3 改用 composable 函数返回（更符合 Vue3 模式）
- V2 的 `addData` API - V3 改用 `courseFileAdd`
- V2 手动引用 `@viewComponents` - V3 用静态 import

### 2. CourseCam.vue（V3 改进 fillEmpty 实现）

**V2 实现**：
```javascript
fillEmpty() {
  const file = require('@/assets/web/no-cam.png')
  localToBase64(file).then((res) => {
    this.handleCapture(res)
  })
}
```

**V3 实现**：
```typescript
function createBlankBase64(): string {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 480
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.fillStyle = '#262626'
  ctx.fillRect(0, 0, 640, 480)
  return canvas.toDataURL('image/jpeg').replace(/^data:image\/\w+;base64,/, '')
}

function fillEmpty() {
  handleCapture(createBlankBase64())
}
```

**V3 改进**：移除 `@/assets/web/no-cam.png` 文件依赖（V3 项目中该文件已移除），改用 canvas 程序化生成空白图片（更轻量）。

### 3. CourseDetail.vue（Batch K 拆分 + 安全升级）🔒

**V3 拆分结果**（V3 是 260 行薄入口）：
- `CourseFileItem.vue` (152 行) - 文件项 + 进度条 + 解锁状态
- `CourseIntroPanel.vue` (139 行) - 课程介绍卡片
- `CourseDetail.vue` (260 行) - 协调所有子组件

**V2 → V3 行为对比**：

| 功能 | V2 实现 | V3 实现 | 评估 |
|------|---------|---------|------|
| 键盘快捷键阻止 | 内联 `keyListener` (F12/Meta/Alt/Ctrl) | 已迁移到 `useFileSecurity` composable + `EventControl.vue` 全局组件 | 🔒 **V3 升级**（更强大：Ctrl+S/C/P/U/A、F系列、PrintScreen、截图快捷键、devtools 检测） |
| 路由跳转（考试） | `this.$router.push({ name: 'WebExamCheck', ... })` | `router.push({ name: 'WebExamStart', ... })` | ✅ V3 路由重命名 |
| `changeLearnMin` | `$forceUpdate()` | 直接赋值 | ✅ V3 响应式自动 |
| `checkBreak` | `this.$router.push('/pages/course?break')` | `ElMessageBox.confirm` + 标记 `courseData.finished = true` | ✅ V3 UX 改进 |
| `handleQaUpdate` | `this.fetchData()` 重新拉详情 | 直接 `+1` 计数 | ✅ V3 简化（避免网络请求） |
| `payVisible`/`handleBuy` | 已注释代码 | 已删除 | ✅ 非功能 |
| `<face-check-dialog>` | 已注释代码 | 已删除 | ✅ 非功能 |
| `SecFormat` 组件 | 直接 `<SecFormat>` | `CourseFileItem` 内 computed | ✅ V3 拆分 |
| `doCheckFace` | 设置 `faceVisible` + `faceChecked` | 仅设 `faceChecked` | ✅ V3 简化（faceVisible 已被 faceChecked 替代） |

### 🔒 V3 安全机制升级详解

V2 简单阻止：
```javascript
keyListener: function (e) {
  if (
    e.code === 'F12' ||
    e.code === 'MetaLeft' || e.code === 'MetaRight' ||
    e.code === 'AltLeft' || e.code === 'AltRight' ||
    e.code === 'ControlLeft' || e.code === 'ControlRight'
  ) {
    e.stopPropagation()
    e.preventDefault()
  }
}
```

V3 已拆分为两个强大的安全模块：

**模块 1：`useFileSecurity` composable**（155 行）
- 高风险 Ctrl 组合键阻止（Ctrl+S/C/P/U/A）
- Meta 键（Mac 截图）
- F1-F12 全部拦截 + F12 单独阻止默认行为
- Alt+PrintScreen 阻止截取当前窗口
- PrintScreen 截屏键 keydown 阻止
- macOS Shift+Command+S 截图
- Windows Ctrl+Shift+3/4/5 截图
- macOS Command+Shift+3/4/5 截图
- Ctrl+Shift+I 开发者工具快捷键
- 完整的 keydown/keyup 配对监听
- 隐私保护遮罩（`showModifierMask` + `maskMessage`）
- 50ms / 1000ms 延迟检测
- `startProtection()` / `stopProtection()` / `recoverView()` 完整生命周期

**模块 2：`EventControl.vue` 全局组件**（94 行）
- 禁用右键菜单 + 禁用文本选择
- 阻止粘贴事件
- 每 3 秒检测开发者工具开启（`window.outerWidth - window.innerWidth > 300`）
- 开启 devtools 自动跳转 `WebExamList`

**结论**：V3 安全机制**显著强于** V2，且已结构化、模块化、可复用。

### 4. WebFileListTable.vue（V3 现代化）

**V2 → V3 差异**：
- Options API → `<script setup lang="ts">`
- `$emit('xxx', $event)` → `emit('xxx', val)` + TS 类型化
- `methods: { getFileTypeLabel, formatFileSize }` 注册 → template 中直接调用（V3 自动暴露）
- `<template slot-scope="scope">` → `<template #default="{ row }">`
- `slot-scope="$index, scope.row` → `row, $index` 解构
- `el-button size="mini"` → V3 无 mini（保留 V3 默认 size）

**行为等价**。

### 5. CourseQaDetailDialog.vue（V3 现代化 + UX 升级）

V3 增加了完整的 chat 气泡样式（CSS +30 行），包括：
- `.chat-message--question` / `.chat-message--reply` 不同布局
- `.bubble::before` 三角箭头
- `:deep(.bubble p)` margin 重置
- 适配移动端

V3 还修了 V2 的小问题：
- `top="5vh"` 顶部对齐
- `:append-to-body="true"` 避免层级冲突
- `watch(() => props.qaId)` + `watch(() => props.modelValue)` 分离监听

### 6. WebCourseQaList/index.vue（V3 现代化）

薄入口（24 行）：将 `courseId`/`fileId` 从 `route.query` 提取后传给 `WebCourseQa`。
行为等价。

## V3 主动新增的文件

### `components/CourseFileItem.vue`（152 行，Batch K 拆分）
从 V2 CourseDetail.vue 第 71-114 行的 el-row 文件项 + 进度条 + 解锁状态拆出。
- `<el-progress>` + 完成印章 `.stamp-seal`
- 锁定状态 `.file-locked` + `<el-icon><Lock />`
- 进度计算 `progressPercent`
- 时长格式化 `formattedLearnTime`（"X时Y分Z秒"）

### `components/CourseIntroPanel.vue`（139 行，Batch K 拆分）
从 V2 CourseDetail.vue 第 122-158 行的 el-col 课程介绍卡片拆出。
- 课程名称 + 类型 + 课时 + 发布时间 + 授课教师
- Element Plus icons：Edit / Notebook / Clock / User / Document
- `formatRichText` 富文本格式化

### `components/CourseSelect.vue`（117 行，V3 新增）
V3 新增的课程选择组件（V2 没有）。

### `WebCourseList/CourseCard.vue`（189 行，V3 新增）
V3 新增的课程卡片组件。

## 验证

- **Typecheck**：`npm run typecheck` 通过（0 errors）
- **V3 web/course 全部 Vue3 idioms**：100% `<script setup lang="ts">`
- **V3 无 Vue2 残留**：0 处

## 结论

| 范围 | 文件数 | 结论 |
|------|--------|------|
| Plan 列出 6 文件 | 6 | ✅ 全部不动（已现代化或已主动重构） |
| 其他 web/course | 20 | ✅ 全部不动（V3 重写/新增） |
| **合计** | **26** | **不动 26 / 26** |

## 关键洞察

1. **行数差 ≠ 真实迁移需求**：CourseDetail.vue V3 比 V2 少 217 行，但 V3 是**主动拆分**（Batch K 工作）+ **安全机制升级**（useFileSecurity + EventControl），不是迁移遗漏。

2. **安全性反而升级**：V2 的简单 `keyListener` 已被 V3 的 `useFileSecurity` composable + `EventControl.vue` 全局组件替代，V3 安全机制覆盖更广（Ctrl 组合键、PrintScreen、截图快捷键、devtools 检测等）。

3. **V3 修复了 V2 的 bug**：WebMultiAddCourseFileDialog 的 `val === 'true'` 错误比较已修复。

4. **V3 主动优化 UX**：changeLearnMin（去 $forceUpdate）、checkBreak（用 ElMessageBox 替代跳转）、handleQaUpdate（去重新拉详情）等。

## 下一步

进入 Batch 9（web/exam 前半 7 文件）+ Batch 10（web/exam 后半 + web/repo）。