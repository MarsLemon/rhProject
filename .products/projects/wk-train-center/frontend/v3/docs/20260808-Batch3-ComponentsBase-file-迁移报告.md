# Batch 3 · ComponentsBase/File + ComponentsBusiness/sys · 迁移报告

> 范围：`src/components/ComponentsBase/ComponentsFile/FileUpload/`、`src/components/ComponentsBusiness/sys/SimpleDeviceTest.vue`
> 对比基准：`wk-train-center-ui`（V2）
> 结果：4 文件全部评估完成，**均判定「不动」**；typecheck ✅ 通过，0 变更不触发 build

## 一、评估总览

| # | 文件 | V3 行数 | V2 行数 | 行数差 | 判定 | 关键差异 |
|---|------|---------|---------|--------|------|----------|
| 1 | FileUpload.vue | 257 | 210 | +47 | 不动 | V3 主动重构为 script setup + 文件分载降级 |
| 2 | FileUploadOss.vue | 459 | 569 | -110 | 不动 | V3 主动重构 + 精简重复逻辑 + 抽 composable |
| 3 | FileUploadPublic.vue | 309 | 349 | -40 | 不动 | V3 主动重构 + 加 prefix 默认值 |
| 4 | SimpleDeviceTest.vue | 92 | 81 | +11 | 不动 | V3 主动重构为 script setup + 事件升级 + 常量外提 |

> 备注：行数增减均为 V3 自身的 Vue3 重构工作（Options API → script setup 等），并不代表"功能缺失"。
> 本批次**无功能缺失**。

## 二、逐文件判定依据

### 3.1 FileUpload.vue — 不动

**V3 已具备的能力**

- `<script setup lang="ts">` + `defineProps` + `defineEmits` + `defineExpose` ✅
- ElMessage 提示、fetchPropDetail 配置获取 ✅
- **`FileUploadLocal` 降级分支**（V2 无）：`provider !== 'aliyun'` 时自动 fallback，避免 UI 空白
- `defineExpose({ cancelAllUploads })`：父组件可主动取消上传
- 样式：`:deep()` 已是 Vue3 写法

**V2 → V3 主动变化**（非 V3 缺失）

- `this.$message` → `ElMessage`
- `this.$refs.ossRef` → `ref<InstanceType<typeof FileUploadOss>>`
- `watch` + `defineProps` 替代 `watch.value`
- 业务字段抽取为 `FileItem` interface
- `process.env` 等无依赖，跨版本兼容

**结论**：V3 已完整覆盖 V2 全部能力，且在「Provider 兜底」「暴露取消 API」上**比 V2 更完善**。无需迁移。

### 3.2 FileUploadOss.vue — 不动

**V3 已具备的能力**

- `<script setup lang="ts">` + 全 TypeScript interface（`Props`、`FileItem`、`UploadTask`）✅
- 阿里 OSS SDK 通过 `loadAliOSS()` 动态加载 ✅
- `fetchOssSts`（V3 已迁移到 `@/api/admin/sys/config`）✅
- `Plus / Upload` 图标（V2 用 `<i class="el-icon-plus">`）✅
- `ElMessageBox.confirm` 替代 `this.$confirm` ✅
- `multipartUpload` + 分片进度回退保护 + `cancelAllUploads` 全部保留 ✅
- `defineExpose({ cancelAllUploads })`：父组件可调用 ✅
- `onBeforeUnmount` 替代 `beforeDestroy` ✅
- `ImageCropper` 走 `<script setup>` 子组件 ✅

**V2 → V3 主动变化**（非 V3 缺失）

- `this.$message`/`this.$confirm` → `ElMessage`/`ElMessageBox`
- `this.$refs.fileUpload` → `uploadRef.value`
- `this.uploadTasks[uid]` 改为 `uploadTasks.value[uid]`（响应式 ref）
- `<slot="tip">` → `<template #tip>`（Vue3 slot 语法）
- `::v-deep` → `:deep()`
- `import.meta.env.DEV` 替代 `process.env.NODE_ENV` 判断
- `cleanup`/`fetchConfig` 抽为具名函数

**结论**：V3 已完整覆盖 V2 全部能力，分片上传、取消、裁剪、进度保护、错误处理全部保留。

### 3.3 FileUploadPublic.vue — 不动

**V3 已具备的能力**

- `<script setup lang="ts">` + 全 TypeScript interface ✅
- 匿名 OSS 配置：`getAnonymousOssConfig(props.prefix)` ✅
- 文件大小分流：`< 5MB` 单次 `put`、`>= 5MB` `multipartUpload` ✅
- 取消上传 + abort 分片 + 进度保护 ✅
- 默认 `prefix: 'AI-training/tempFile/'`（V2 无此默认值）✅
- `ElMessage`/`ElMessageBox` 全套 ✅

**V2 → V3 主动变化**（非 V3 缺失）

- 与 FileUploadOss 一致的 Vue3 重构模式
- 类型化回调：`UploadProps['onChange']`、`UploadRequestHandler`
- `:deep()` 样式

**结论**：V3 不仅保留全部能力，还主动补齐 prefix 默认值，符合 AI 培训业务约定。

### 3.4 SimpleDeviceTest.vue — 不动

**V3 已具备的能力**

- `<script setup lang="ts">` + `defineProps<{ visible?: boolean }>()` + `defineEmits` ✅
- `v-model="dialogVisible"` 替代 `:visible.sync` ✅
- **双向 watch**：外→内（props.visible 变化时同步 dialogVisible）；内→外（dialogVisible 变化时 emit `update:visible`）✅
- `TrackingCam` 事件升级：`@started` → `@video-live`（语义更准确）✅
- `success` 事件：`camSuccess === true` 时点击关闭即触发 `success`（V2 无此事件）✅
- 字符串常量外提：`TITLE`、`TIP_CLOSE`、`TIP_1/2/3` ✅
- `defineOptions({ name: 'SimpleDeviceTest' })`：devtools 名称清晰

**V2 → V3 主动变化**（非 V3 缺失）

- Options API → script setup
- `data()` → `ref`
- `watch: { visible: { ... } }` → `watch(() => props.visible, ...)`
- `:visible.sync` → `v-model` + emit

**结论**：V3 不仅完整保留 V2 全部能力，且**新增了 `success` 事件**让父组件能感知到设备正常，比 V2 行为更精确。

## 三、本批次小结

| 项 | 数值 |
|----|------|
| 评估文件数 | 4 |
| 修改文件数 | 0 |
| typecheck | ✅ 通过 |
| build | ⏭ 未触发（无变更） |
| 新增能力（V3 > V2） | 3 处：`FileUploadLocal` 降级 / `cancelAllUploads` 暴露 / `SimpleDeviceTest` 成功事件 |
| 实际业务功能缺口 | **0** |

**关键结论**：本批次 4 个文件均已完成 Vue3 重构，业务能力完整甚至超越 V2。**无任何代码变更需要执行**。

## 四、下一步

进入 Batch 4：layout/Admin 框架（`src/layout/Admin/`），预计 6 个文件，含 TagsView（+172 行 🔴 高优先级）。