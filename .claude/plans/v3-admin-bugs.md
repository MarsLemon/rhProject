# v3 admin 端迁移 bug 日志

> **创建**: 2026-06-25
> **作用**: admin 端迁移过程中发现的 bug，不中断流程，记录在此
> **分类**: 阻塞(立刻修)/ 缺漏(攒 5 条)/ 风格(攒 10 条)

---

## 🔴 阻塞（立刻修）

### 2026-06-25 admin/exam API 签名错误（5 处）
- **文件列表**:
  - `src/api/admin/paper/paper.ts` — `markAs({ status })` 应为 `{ paperId, valid, exState, exMsg }`（后端 PaperMarkReqDTO）
  - `src/api/admin/paper/paper.ts` — `deletePaper({ ids: [...] })` 应为 `{ id }`（后端 BaseIdReqDTO）
  - `src/api/admin/exam/watch.ts` — `watchStat({ examId })` 应为 `{ id }`（后端 BaseIdReqDTO）
  - `src/api/admin/exam/exam.ts` — `updateState/copy/finishExam` 缺失（v3 createCrudApi 的 updateState 发送 `{ ids, state }`，但后端状态接口 `{ id, state }`）
- **影响**: 考试记录组件 ExamRecord 写完后，markAs/deletePaper 请求发送错误字段，后端 400
- **修复**: 全部改为后端正确签名
- **状态**: ✅ 已修 (v3 commit 64fa09c / 主仓 261a6f8)

### 2026-06-25 admin/exam review/index.vue 组件占位
- **文件**: `src/views/admin/exam/review/index.vue`
- **现象**: AdminPreview/RequirePreview/FreePreview 3 个组件已实现（275/88/87 行），但 index.vue 用 el-empty 占位
- **影响**: 阅卷主页 3 个 Tab 全是"组件待迁移"空提示
- **修复**: 替换为真实组件 import + 路由导航对齐
- **状态**: ✅ 已修 (v3 commit 64fa09c / 主仓 261a6f8)

### 2026-06-25 admin/exam exam/index.vue 4 个 API 占位
- **文件**: `src/views/admin/exam/exam/index.vue`
- **现象**: publishExam/pauseExam/doFinish/handleCopy 全是 ElMessage.warning "API 待补"，不调用后端
- **影响**: 考试管理列表的"发布/暂停/结束/复制"按钮不可用
- **修复**: 接入 examApi.updateState/finishExam/copy
- **状态**: ✅ 已修 (v3 commit 64fa09c / 主仓 261a6f8)

### 2026-06-25 admin/exam ExamRecord 组件缺失
- **文件**: `src/views/admin/exam/exam/record/components/ExamRecord.vue`（v3 缺失）
- **现象**: v2 有 296 行完整 ExamRecord 组件，v3 没有，record/list.vue 用 el-empty 占位
- **影响**: 考试记录列表的"考试记录"弹窗空白
- **修复**: 完整迁移（Options API → script setup, uuid → crypto.randomUUID, ElMessageBox.confirm 等）
- **状态**: ✅ 已修 (v3 commit 64fa09c / 主仓 261a6f8)

---

## 🟡 缺漏（攒 5 条）

### 2026-06-25 admin/dashboard index.vue 漏引 CardExamList/CardCourseList
- **文件**: `wk-train-center-ui-v3/src/views/admin/dashboard/index.vue`
- **现象**: v2 index.vue 在 `moduleExam` 条件下渲染 `<CardExamList />` + `<LineChartExam />` 两列 (12+12), `moduleCourse` 同理; v3 index.vue 漏引两个 Card 组件, 只剩 LineChart 单列
- **修复**: 加 import + 模板里 `moduleExam`/`moduleCourse` 条件改为双列 (Card+LineChart)
- **影响**: 管理首页"进行中的考试/课程"列表丢失, 用户看不到
- **状态**: ✅ 已修 (v3 commit 0e9e02e / 主仓 8daa649)

### 2026-06-25 admin/notify im.vue listUrl API 路径错
- **文件**: `wk-train-center-ui-v3/src/views/admin/notify/im.vue`
- **现象**: v3 listUrl 写的是 `/api/sys/user/im/paging`, 但 v2 实际 API 是 `/api/sys/user/msg/paging` (im.ts API 文件里也没 `paging` 方法)
- **修复**: listUrl 改为 `/api/sys/user/msg/paging` + 加 `delete.config` (`/api/sys/user/msg/user-delete`)
- **影响**: 站内信收件箱列表请求 404, 数据加载失败
- **状态**: ✅ 已修 (v3 commit cff0b71 / 主仓 6619b22)

### 2026-06-25 admin/course file.vue 导入错误
- **文件**：`views/admin/course/file.vue`
- **现象**：`handleEdit` 用了 `fetchPaging as fetchCourseFilePaging` from `@/api/admin/course/file`，但该 API 模块没导出 `fetchPaging`（只 export 了 `fetchDetail`）
- **触发**：编辑课件时点击"编辑"按钮 → `handleEdit` 跑 → 找不到 `fetchCourseFilePaging` 报错
- **修复**：改用 `@/api/admin/course/file` 已有的 `fetchDetail` API，handleEdit 调用 `fetchDetail(id)` 拿单条数据
- **状态**：✅ 已修（v3 commit c14a22c，链头 cff0b71）

### 2026-06-25 4 个 admin/course 空壳
- **现象**：qa.vue (292B) / stat.vue (294B) / statfull.vue (310B) / stat/result.vue (260B) 全是 el-empty 占位
- **影响**：路由挂了但页面没功能
- **修复**：本会话全部实现为完整 v3 业务页面
  - qa.vue: 问答列表 + 筛选 + 接入 CourseQaDialog 弹窗
  - stat.vue: 课程统计总览 + 自学/指派切换 + LearnStatPaging/FileStatPaging 子组件
  - statfull.vue: 自定义统计条件选择(学习类型/课程/人员范围) + sessionStorage 缓存
  - stat/result.vue: 统计结果展示（基于 statfull 提交的 postForm）
- **状态**：✅ 已修（v3 commit c14a22c，链头 cff0b71）
- **遗留**：CourseStatInfoDetail/CourseAssignLearnDetail 详情组件 v3 ComponentsBusiness 没有，stat/result.vue 用 el-card 占位

---

## 🟡 缺漏（攒 5 条）

### 2026-06-25 admin/course 4 空壳（已合并到阻塞档修掉）
- `views/admin/course/qa.vue` (292B) — 课程问答，v2 113 行
- `views/admin/course/stat.vue` (294B) — 课程统计，v2 203 行
- `views/admin/course/statfull.vue` (310B) — 课程完整统计，v2 206 行
- `views/admin/course/stat/result.vue` (260B) — 课程统计结果
- **状态**：✅ 已迁，详见上方"阻塞档"

### 2026-06-25 admin/course index.vue 3 个弹窗占位
- **文件**：`views/admin/course/index.vue`
- **现象**：ShareCourseDialog / LecturerSelectDialog / CourseRefDialog v3 ComponentsBusiness 暂无，index.vue 用 el-dialog + el-empty 占位
- **影响**：点击"分享链接"/"修改教师"/"引用情况"按钮只展示空弹窗
- **修复策略**：保留占位，等 ComponentsBusiness 补 ShareCourseDialog / LecturerSelectDialog / CourseRefDialog
- **状态**：⏳ 等 ComponentsBusiness

### 2026-06-25 admin/course form.vue 课件列表 Tab 占位
- **文件**：`views/admin/course/form.vue`
- **现象**："课件列表" Tab 用 `<el-empty description="课件列表(DirList)v3 ComponentsBusiness 缺失,本地占位" />`
- **影响**：课程表单的"课件列表" Tab 不可用
- **修复策略**：等 DirList 组件 v3 实现
- **状态**：⏳ 等 DirList

### 2026-06-25 admin/course file.vue 多个占位
- **文件**：`views/admin/course/file.vue`
- **现象**：AiPptGenerator (254B) / FileUpload / KeyPointTreeShow / MultiAddCourseFileDialog / FilePreview / SecondSet 全部 v3 ComponentsBusiness 缺失
- **影响**：AI 生成课件 / 上传 / 关联知识点 / 批量新增 / 文件预览 / 视频时长 等功能不可用
- **修复策略**：保留占位，等 ComponentsBusiness
- **状态**：⏳ 等 ComponentsBusiness

### 2026-06-25 admin/course statfull.vue UserRange / CourseSelectDialog 占位
- **文件**：`views/admin/course/statfull.vue`
- **现象**：自定义人员范围用 el-input readonly 占位；选择课程弹窗用本地 el-dialog + 简单表格实现
- **影响**："自定义人员范围" 功能不可用（无法选部门/组/用户）
- **修复策略**：等 UserRange 组件 v3 实现
- **状态**：⏳ 等 UserRange

### 2026-06-25 admin/course stat/result.vue 详情组件占位
- **文件**：`views/admin/course/stat/result.vue`
- **现象**：自学/指派详情只用 el-card 展示基础信息
- **影响**：统计详情页无图表
- **修复策略**：等 CourseStatInfoDetail / CourseAssignLearnDetail 组件 v3 实现
- **状态**：⏳ 等详情组件

### 2026-06-25 admin/repo router name 不匹配
- **文件**: `views/admin/repo/index.vue`
- **现象**: 使用 v2 路由名 `RepoUpdate` / `QuList` / `RepoAnalysis` / `RepoAdd`, v3 实际注册名为 `AdminRepoForm` / `AdminRepoQu` / `AdminRepoStatAnalysis`
- **影响**: 点击"试题管理" / "题库分析" / "新增" / "编辑" 链接跳转失败（router.push 落空）
- **修复**: 全部换为 v3 路由名
- **状态**: 已修复

### 2026-06-25 admin/repo form.vue 保存和取消功能不可用
- **文件**: `views/admin/repo/form.vue`
- **现象1**: `saveData` 是本地 stub（`ElMessage.warning('题库保存 API v3 待补')`），`repoApi.save` 实际已存在
- **现象2**: 取消按钮 `$emit('cancel')` 无父组件监听 -> 点击取消无反应
- **影响**: 无法保存题库也无法返回列表
- **修复**: 改用 `repoApi.save` / `repoApi.fetchDetail`，取消按钮改为 `router.push({ name: 'AdminRepo' })`
- **状态**: 已修复

---

## 🟢 风格（攒 10 条）

### 2026-06-25 admin/ai handleOptimizeField 用了空 URL SSE
- **文件**：`src/views/admin/ai/sparring/index.vue`
- **现象**：原代码用 `sseStream('', ...)` 调用，但 sseStream 需要真实 URL 来发 fetch 请求，空字符串会被 fetch 拒绝
- **影响**：点击"一键优化"按钮会失败（fetch 拒绝空 URL），`isOptimizingRequirement/EvalCriteria` loading 状态不会重置
- **修复**：改用后端 AI 优化 API（`POST /api/wk/training/role/management/optimize`），由后端转发 AI 模型请求
- **状态**：✅ 已修（v3 commit c86786a / 主仓 3798437）

（暂无）

---

## 🔴 阻塞（立刻修）

### 2026-06-25 admin/ai API TrainingRoleInfo 字段错误
- **文件**：`src/api/admin/ai/sparring.ts`
- **现象**：`TrainingRoleInfo` 接口字段是 `name/avatar/persona/description/sort/status`，但 v2 实际后端字段是 `roleName/tone/background/requirement/evalCriteria/state/progress`
- **影响**：v3 调用 save/add/edit API 时，传 `payload.roleName` 字段但接口 type 期待 `name`，导致 TypeScript 错误或运行时字段缺失
- **修复**：接口字段改为 v2 实际后端字段名（roleName/tone/background/requirement/evalCriteria/state/progress/createBy/createBy_dictText），保留 `[key: string]: unknown` 兜底
- **状态**：✅ 已修（v3 commit a1242fd / 主仓 680818b）

## 🟡 缺漏（攒 5 条）

### 2026-06-25 admin/ai AiChatPanel 流式调试面板 v3 简化版
- **文件**：`src/views/admin/ai/components/AiChatPanel.vue`
- **现象**：v2 用 `chatModelStream` 直连 AI 模型，v3 用 `sseStream` + 模拟回复 fallback
- **影响**：管理端的"实时调试"面板流式调用走模拟回复（v3 暂未接百炼 chatModelStream）
- **修复策略**：等 v3 接入真实后端 AI 优化接口（同一后端路径 + 流式 SSE），即可让调试面板工作；或复用 v2 `chatModelStream` 工具
- **状态**：⏳ 等后端 optimize SSE 接口或复用 chatModelStream

### 2026-06-26 admin/ai AiChatPanel 流式调试面板真实接入
- **文件**：`src/views/admin/ai/components/AiChatPanel.vue` + `src/stores/modules/ai.ts`
- **修复**：详见 progress.json `ai-stream` 子阶段(v3 commit 777e133 / 主仓 8ff7ae3)
- **核心改动**：
  - 修 sseStream('', ...) 空 URL bug → 接 `/api/wk/training/role/student/stream`
  - 移除 mockReply fallback → 真实错误显示明确错误提示
  - streamingContent 用 renderMarkdown(marked) 替代 convertMarkdownToText 文本剥离
  - fetchSseOrFallback 默认走真实 SSE + 注入 buildAgentHeaders + body 增加 askId
- **状态**：✅ 已修

---

## 🟢 风格（攒 10 条）

### 2026-06-26 admin/tmpl 骨架补全（10 个文件 + PaperPreview）
- **范围**：`views/admin/tmpl/{index,form}.vue` + `components/{PaperPreview,TmplPreCreate,TmplRefDialog,QuTypeSelector,QuestionBankSelector,RandomStrategy,ScoreRule,SectionSelector,TimeLimit,Tinymce}.vue`
- **状态**：✅ 骨架补全（el-empty → 完整组件）
- **遗留（仅占位）**：
  - `form.vue` 内 Join1Form / JoinQuList / JoinRuleList v3 ComponentsBusiness 缺失 → 用 el-empty + 简化大题卡片占位
  - `TmplPreCreate` 的 DicCatalogTree + SysDicValue 抽屉 → 简化为 el-cascader
  - `PaperPreview` 的 QuItemShow 真实渲染 → 用 el-empty 占位,展示试卷基本信息
  - `Tinymce` 富文本 → 用 textarea 占位
  - `QuestionBankSelector` 题库列表 → 接 mock 数组,等 repoApi
- **影响**：用户能进列表页 + 创建弹窗 + 表单页 + 预览页,但表单页的"题列表/规则列表"区域不可用
- **状态**：⏳ 等 ComponentsBusiness 补 Join1Form / JoinQuList / JoinRuleList / QuItemShow / DicCatalogTree

### 2026-06-26 admin/tmpl/admin router 更新
- **文件**：`src/router/modules/admin.ts`
- **变更**：`/admin/tmpl/preview` 路由 component 从 fallback `views/admin/tmpl/index.vue` 改为真实 `views/admin/tmpl/components/PaperPreview.vue`
- **影响**：预览页面能显示真实页面(总分/题数/分类),虽然题目详情仍占位
- **状态**：✅ 已修

### 2026-06-26 admin/paper/detail 组件 v3 缺失
- **文件**：`src/views/admin/paper/detail.vue` (v2 有 416 行,v3 缺失)
- **现象**：v2 paper/paper/detail.vue 用 QuItemShow 渲染试卷内容 + 阅卷(主观题判分/重判), v3 只有 paper/index.vue(列表)
- **影响**：router/modules/admin.ts:367-370 paper/detail 路由 fallback 到 paper/index.vue, 点 "查看详情" 跳回列表
- **修复策略**：等 ComponentsBusiness 的 QuItemShow 组件 v3 实现 + 后端 paperResult / reviewPaper API 字段确认
- **状态**：⏳ 等 QuItemShow + paperResult/reviewPaper 字段对齐

### 2026-06-26 admin/paper exportZip/exportPdf 按钮未实现
- **文件**：`src/views/admin/paper/index.vue`
- **现象**：v2 paper 有 "导出 ZIP" 和 "导出 PDF" 按钮(权限 paper:export), v3 paper/index.vue 未实现
- **影响**：管理端用户无法导出试卷(后端 /api/paper/paper/export-zip 和 /api/paper/paper/export-pdf API 已有)
- **修复策略**：等 paper:export 权限定义 + 复用 v3 admin 的 DataTable 操作列 toolbar 模式
- **状态**：⏳ 等权限定义

### 2026-06-26 admin/ai ai-store fetchSseOrFallback 流中止处理
- **文件**：`src/stores/modules/ai.ts:fetchSseOrFallback`
- **现象**：abort 后 sseStream 返回 `{aborted: true, final: {fullText: ''}}`，老代码会返回空内容但 store 的 finally 块不会再调用 onError
- **影响**：用户主动 stop generation 时，AI 消息 content 是空字符串，可能显示空白气泡
- **修复**：本轮已加 `if (result.aborted) return { data: { content: '' } }`，store 在 onDone 触发后会把最后一条 loading 消息从 messages 里清掉/标记停止，stopGeneration 已经处理
- **状态**：✅ 已修