# DataTable 重置按钮与 defaultParams 补全计划

## Context（背景）

`wk-train-center-ui`（v1）的 DataTable / DataGrid 组件存在三个相关的前端 Bug：

1. **Bug 1 — filter-content 插槽重置失效**：`QuList.vue` 3-5 行的 `<el-input v-model="listQuery.params.title">` 在点击"重置"按钮后，输入框内容不会被清空。`DataTable` 内置的"重置"按钮只能重置表格数据，无法重置插槽中的控件。
2. **Bug 2 — 树筛选条件未生效**：桌面截图所示，"选择用户"弹窗点击左侧 `DepartTreeShow` 节点后，右侧用户列表不会按部门过滤。
3. **Bug 3 — 部分表格缺 defaultParams**：v1 中有 25 个 `filter-content` 插槽文件，仅 6 个声明了 `defaultParams`，需逐个补全。

### 根本原因

v1 `DataTable.vue` setup（第 231-248 行）对父组件传入的 `listQuery.params` 做了**浅拷贝**，得到一份独立的内部 `params` 对象。`useTableQuery.js` 的 `resetList` 通过 `listQuery.params = keepParams` **重新赋值**这个内部对象，引用已变，因此：

- 父组件的 `listQuery.params` 不会被清空 → slot 内的 v-model 视觉不更新（Bug 1）。
- `departChange` 直接修改父组件 `listQuery.params.deptCode`，但 DataTable 内部 `params` 还在等 watch 同步，refresh 触发的 `getList` 读到的是旧值（Bug 2）。

v3 项目（`wk-train-center-ui-v3`）已用 `applyQueryParamsReset` + `externalParamsSources` 机制修复同问题。本次任务是把 v3 的修复思路移植到 v1。

## 范围与交付策略

- **项目范围**：仅 `wk-train-center-ui`（v1），含 `DataTable` 与 `DataGrid`。
- **分两批交付**：
  - **第一批（核心修复）**：解决 Bug 1 + Bug 2 的根因。
  - **第二批（defaultParams 补全）**：扫描 25 个 `filter-content` 插槽文件，列出清单 → 用户审阅 → 逐个补全。

## 第一批：核心修复

### Task 1 — 改写 `useTableQuery.js` 引入 `applyQueryParamsReset`

文件：`e:\rhProject\wk-train-center-ui\src\components\ComponentsBase\ComponentsTable\DataTable\useTableQuery.js`

1. 顶部新增 `applyQueryParamsReset(target, defaults)` 纯函数（参考 v3 第 46-55 行）：原地 `delete` 所有 key 后 `Object.assign(target, {...defaults})`，**保持对象引用不变**。
2. `useTableQuery` 函数签名追加第 5 个参数 `externalParamsSources = []`（类型：`Array<() => Record<string, any> | undefined>`），与 v3 一致。
3. 重写 `resetList`：
   - 用 `Set<Record<string, any>>` 收集所有需要清空的 params 引用：`listQuery.params` + `externalParamsSources` 中每个 getter 返回的对象。
   - 对每个 target 调用 `applyQueryParamsReset(target, defaults)`。
   - 重置 `listQuery.current = 1`、调用 `clearSelection()`。
   - 移除 `listQuery.params = keepParams` 这行（核心 Bug 来源）。

### Task 2 — 调整 `DataTable.vue` 共享 params 引用

文件：`e:\rhProject\wk-train-center-ui\src\components\ComponentsBase\ComponentsTable\DataTable\DataTable.vue`

1. setup 第 231-236 行：`params: { ...(props.listQuery.params || {}) }` 改为 `params: props.listQuery.params || {}`，**直接持有父组件引用**（不浅拷贝）。如果父组件未传 params，则赋一个空对象兜底。
2. setup 第 237-248 行 watch：把 `listQuery.params = { ...(val.params || {}) }` 改为原地同步：
   ```js
   applyQueryParamsReset(listQuery.params, val.params || {})
   ```
   这样 props 变化时也保持内部 params 引用稳定，v-model 始终绑定同一对象。
3. 第 257 行 `useTableQuery` 调用：追加第 5 个参数 `[() => props.listQuery?.params]`，把父组件的 params 引用注入重置流程。
4. import 顶部新增 `import { applyQueryParamsReset } from './useTableQuery'`。

### Task 3 — 修复 `DataGrid.vue` 的 `resetList`

文件：`e:\rhProject\wk-train-center-ui\src\components\ComponentsBase\ComponentsTable\DataGrid.vue`

- 第 245-259 行 `resetList`：把 `this.listQuery.params = keepParams` 替换为原地清空：
  ```js
  if (this.listQuery.params) {
    Object.keys(this.listQuery.params).forEach(k => delete this.listQuery.params[k])
    Object.assign(this.listQuery.params, keepParams)
  } else {
    this.listQuery.params = { ...keepParams }
  }
  ```
- `this.$set(this.listQuery.params, this.stateParam, this.defaultStateValue)` 保持不变。
- `this.$refs.dicTreeRef.clearSelection()` 保持不变。
- DataGrid 是 Options API，listQuery 在组件内部，无外部引用需要注入，`externalParamsSources` 留空即可。

### Task 4 — 验证 Bug 1 + Bug 2

启动 dev 服务器（`pnpm dev` 或 `npm run dev`，端口参考 4212）。

1. **Bug 1 验证**：
   - 进入"课程管理 → 课程评论"（`/admin/course/qa` 或类似路径，使用 `QuList.vue`）。
   - 在搜索框输入"测试"，观察列表过滤。
   - 点击"重置"按钮 → 搜索框应被清空，列表回到全量。
2. **Bug 2 验证**：
   - 进入"添加计划 → 船舶考评"（`/admin/plan/plan/add`）。
   - 弹出"选择用户"对话框。
   - 点击左侧部门树"业务支持部"节点 → 右侧用户列表应只剩该部门用户。
   - 点击"清空"或重新选择"全部" → 列表回到全量。
3. **回归验证**（必须做）：
   - 翻页：点击第 2、3 页，列表正常切换。
   - 排序：点击表头排序，列表按序排列。
   - 勾选：勾选 1 条 / 多条 / 跨页勾选（`reserveSelection` 开启的页面）。
   - 新增 / 编辑 / 删除按钮在受控条件下正常启用禁用。
4. 截图归档到 `e:\rhProject\fix-plans\tech-debt\20260609-data-table-fix-verification\`。

### 关键修改文件清单（第一批）

| 文件 | 改动类型 | 行数估计 |
|------|---------|---------|
| `wk-train-center-ui/src/components/ComponentsBase/ComponentsTable/DataTable/useTableQuery.js` | 重构 | +20 / -3 |
| `wk-train-center-ui/src/components/ComponentsBase/ComponentsTable/DataTable/DataTable.vue` | 修改 | +6 / -2 |
| `wk-train-center-ui/src/components/ComponentsBase/ComponentsTable/DataGrid.vue` | 修改 | +6 / -1 |

`useTableQuery()` 全项目调用方 grep 结果仅有 2 处（自身 + `DataTable.vue`），改动函数签名安全。

## 第二批：defaultParams 补全

### Task 5 — 扫描生成缺失清单

执行 `grep -rn '#filter-content' e:/rhProject/wk-train-center-ui/src`（已在 Phase 1 完成）得到 25 个文件，对每个文件：

1. 解析其 `data()` / `setup()` 中 `listQuery.params` 的初始值。
2. 解析其 `#filter-content` 模板中所有 `v-model="listQuery.params.xxx"` 字段。
3. 解析是否声明了 `defaultParams` prop。
4. 生成 CSV / Markdown 表格输出到 `e:\rhProject\fix-plans\20260609-data-table-default-params-audit.md`，每行包含：
   - 文件路径
   - 现有 `listQuery.params` 初始值（JSON）
   - 推测的 `defaultParams` 候选值（JSON）
   - 是否已有 `defaultParams` 属性
   - 备注（页面级 / 组件级 / 业务特殊说明）

### Task 6 — 用户审阅清单

- 把 Task 5 的清单提交给用户审核。
- 用户确认每个文件的 `defaultParams` 值。
- 用户对"页面级 defaultParams"是否需要与 `listQuery.params` 初始值重复表态（可简化或保持）。

### Task 7 — 批量补充 `defaultParams`

按 Task 6 确认的清单逐个修改，每个文件改动模板：
- 在 `data()` / `setup()` 中新增 `defaultParams: () => ({...})`。
- 在 `<DataTable>` 上加 `:default-params="defaultParams"`。
- 若是组件级（被父组件复用），按 `SubUserList.vue` 模式在 `watch.defaultParams` 中合并到 `listQuery.params`。

每改完 1 个文件立即在浏览器中点击"重置"按钮验证：
- 默认字段保留（如 `state: '0'`、`roleIds: []`）。
- 用户输入字段清空（如 `userName: ''`、`content: ''`）。

## 风险与回退

- **风险 1**：改动 `useTableQuery` 签名虽安全（仅 2 处调用），但 `applyQueryParamsReset` 的引用语义改变可能在极端时序下影响其他页面（watch 触发时父组件 params 被原地清空）。
  - **缓解**：Task 4 的回归验证覆盖核心交互（分页、排序、勾选）。
- **风险 2**：`DataTable.vue` watch 改为原地清空后，外部频繁修改 `props.listQuery.params` 可能引起意外清空。
  - **缓解**：原地清空只在 props 真正变化时触发，watch 默认 lazy。
- **回退方案**：每批提交一次 git，失败立即 `git revert`。

## 关键文件路径速查

修改文件：
- `e:\rhProject\wk-train-center-ui\src\components\ComponentsBase\ComponentsTable\DataTable\useTableQuery.js`
- `e:\rhProject\wk-train-center-ui\src\components\ComponentsBase\ComponentsTable\DataTable\DataTable.vue`
- `e:\rhProject\wk-train-center-ui\src\components\ComponentsBase\ComponentsTable\DataGrid.vue`

参考实现（v3 已修复版本）：
- `e:\rhProject\wk-train-center-ui-v3\src\components\ComponentsBase\ComponentsTable\DataTable\useTableQuery.ts`（applyQueryParamsReset 模板）
- `e:\rhProject\wk-train-center-ui-v3\src\components\ComponentsBase\ComponentsTable\DataTable\DataTable.vue`（externalParamsSources 注入点，line 463-469）

验证用例文件：
- `e:\rhProject\wk-train-center-ui\src\views\admin\course\components\Qa\QuList.vue`（Bug 1）
- `e:\rhProject\wk-train-center-ui\src\components\ComponentsBusiness\user\UserSelectDialog.vue`（Bug 2）

## 端到端验证

1. **Bug 1 端到端**：
   - 启动项目 → 登录 → 进入"课程评论"页 → 输入搜索词 → 点击重置 → 期望输入框被清空 + 列表回到全量。
2. **Bug 2 端到端**：
   - 进入"添加计划 → 船舶考评" → 打开"选择用户"弹窗 → 点击左侧部门树节点 → 期望右侧用户列表按部门过滤。
3. **回归端到端**（必做）：
   - 至少验证 3 个使用 DataTable 的页面：分页、排序、勾选、删除按钮无异常。
4. **第二批端到端**（按文件逐一）：
   - 每个补全 `defaultParams` 的页面，点击重置 → 核对预期保留字段 + 清空字段。

## 后续可选优化（不在本批范围）

- 给 `DataTable` 增加 `slotProps` 模式，让 `listQuery` 引用直接暴露给 slot，彻底消除"内部 / 外部"两套 params 的概念。
- 把 `applyQueryParamsReset` 提取到 `utils/reset.js` 公共模块。
- 给 `DataTable` 加 E2E 测试（Playwright），覆盖重置 + 树筛选场景。
