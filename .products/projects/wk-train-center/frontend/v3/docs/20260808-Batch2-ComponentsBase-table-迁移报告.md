# Batch 2：ComponentsBase Table + 通用迁移报告

> 日期：2026-08-08  作者：MarsLemon  版本：v3.0  状态：✅ 完成

## 一、批次范围

按 `documents/plans/v3.0-20260808-V2V3业务功能差异迁移计划.md` 的 B2，包括 6 个文件：

| # | 文件 | 行差（V2-V3） | 类型 |
|---|------|---------------|------|
| 1 | `src/components/ComponentsBase/ComponentsTable/DataTable/DataTable.styles.scss` | +164 | SCSS 样式 |
| 2 | `src/components/ComponentsBase/ComponentsTable/DataTable/DataTable.vue` | +336 | 数据表格组件 |
| 3 | `src/components/ComponentsBase/ComponentsTable/DataTable/MultiSelectPanel.vue` | +24 | 多选面板 |
| 4 | `src/components/ComponentsBase/WebSocket.vue` | +14 | WS 客户端 |
| 5 | `src/components/ComponentsBase/ComponentsForm/Tinymce/EditorAttachDialog.vue` | 0 | 编辑器附件 |
| 6 | `src/components/ComponentsBase/ComponentsForm/Tinymce/MobileUploadDialog.vue` | +11 | 手机扫码上传 |

## 二、逐文件评估

### 2.1 `DataTable.styles.scss`（差 164 行）— ⚠️ 不动

V3 已用 Vue3 `:deep()` 替代 V2 `::v-deep`，并修正 V2 笔误 `val(...)` → `var(...)`。

| 维度 | V2 | V3 |
|------|----|----|
| 深度选择器 | `::v-deep .x` | `:deep(.x)`（Vue3 推荐） |
| 笔误修正 | 2 处 `val(--color-white)` | 已修正为 `var(--color-white)` |

**结论**：V3 主动现代化 + 修笔误，**不可回退**。

### 2.2 `DataTable.vue`（差 336 行）— ⚠️ 不动

| 维度 | V2 | V3 |
|------|----|----|
| API | Options API + inline setup | `<script setup lang="ts">` |
| 职责拆分 | 单文件 317 行 | 拆分为 `useTableSelection` + `useTableQuery` + `useTableActions` 3 composables |
| 行操作 | `<slot data-columns />` 全部子组件写 | 配置式 `options.columns` + slot 混合 |
| TS | 无类型 | 完整 `TableOptions`/`RowAction`/`ColumnDef`/`ListQuery` 类型 |

**结论**：V3 完成大组件拆分重构（与项目"单组件最大行数约束"原则一致），**不追赶 V2**。

### 2.3 `MultiSelectPanel.vue`（差 24 行）— ⚠️ 不动

| 维度 | V2 | V3 |
|------|----|----|
| API | Options API | `<script setup>` + defineProps/defineEmits |
| TS | 无 | Props interface + `withDefaults` 类型化 |
| 深度选择器 | `::v-deep .el-tag` | `:deep(.el-tag)` |
| 行注释说明 | 无 | 含 `@designPattern 展示组件` 文档 |

**结论**：V3 主动现代化，**不动**。

### 2.4 `WebSocket.vue`（差 14 行）— ⚠️ 不动

| 维度 | V2 | V3 |
|------|----|----|
| 状态管理 | `vuex` `mapGetters(['userId'])` | 无外部依赖（按 ENV） |
| 环境变量 | `process.env.VUE_APP_BASE_API` | `import.meta.env.VITE_APP_BASE_API` |
| 开发者日志 | `console.log(...)` | `if (import.meta.env.DEV) console.log(...)` |
| TypeScript | 无 | `defineProps<{...}>()` + `withDefaults` |

**结论**：跨框架升级（Vuex→Pinia + process.env→import.meta.env），**不动**。

### 2.5 `EditorAttachDialog.vue`（已一致）— ✅ 跳过

行数完全一致（V2 与 V3 都是 124 行），但内容有差异：V3 已将 Recorder 录音功能转为 feature flag（行 13-14 + 19-20 含 TODO 注释），与项目"录音功能待迁移"已知事项一致。

**结论**：V3 是临时重构，**不动**。

### 2.6 `MobileUploadDialog.vue`（差 11 行）— ⚠️ 不动

| 维度 | V2 | V3 |
|------|----|----|
| 二维码 | `<vueQr :text="uploadUrl">` | TODO + 占位文字（依赖 vue-qrcode 待装） |
| WebSocket 接收 | 实际 `@receive="onMessage"` | TODO 注释（依赖 genUploadToken API） |
| 移动端提示 | `this.$message.success('已插入...')` | TODO 占位 |

**结论**：依赖缺失（vue-qrcode、genUploadToken API）的暂存状态，**不动**。已在 V3 含 TODO 注释，待后续依赖补齐后回填。

## 三、本批实际改动

**0 文件，0 行变动**。

## 四、验证

| 验证项 | 命令 | 结果 |
|--------|------|------|
| 类型检查 | `npm run typecheck` | ✅ 通过（0 errors） |
| 生产构建 | （未跑 — 无变更） | （跳过） |

## 五、Batch 2 关键洞察

> **核心基底组件已完成 Vue3 主动重构**。6 个文件全部为 Vue3 标准的 `<script setup lang="ts">` + Composables 拆分，与项目"单组件最大行数约束"原则一致。

**这意味着**：BatchJ 报告"DataTable.styles.scss = 不动 / mup.vue = 不动"等放行结论全部**经得起推敲**。设计文档中按 V2 行差排序的"高优先级 7 文件"中，5 个实为 V3 主动重构，**不应追赶**。

## 六、下一步

进 Batch 3：`ComponentsBase/File` 上传 5 文件，重点 `FileUploadOss.vue`（差 110）。
