# Vue 3 迁移占位清理报告

> **日期**: 2026-07-06  
> **范围**: wk-train-center-ui-v3 全量占位审计与修复  
> **构建验证**: vue-tsc --noEmit ✅ | npm run build ✅ (3468 模块, 1m 2s)

---

## 一、概述

本次对 Vue 3 迁移项目中的占位组件、虚假导出、TODO 残留及调试日志进行了系统性清理。共完成 **P0 Bug 修复 3 处**、**虚假占位替换 10 处**、**安全 Composables 迁移 4 个**、**TODO/调试残留清理 30 处**、**真实缺失组件评估 5 项**，并通过完整构建验证。

---

## 二、各 Task 详情

### Task 1: P0 Bug 修复（3 处）

| # | 类型 | 文件 | 问题描述 | 修复方式 |
|---|------|------|----------|----------|
| 1 | 导出路径错误 | `ComponentsFile/index.ts` | ExcelPreview 导出指向不存在的 `FileReader/index.vue` | 修正为 `FileReader/components/ExcelPreview.vue` |
| 2 | 空壳文件删除 | `user/DepartTreeSelect.vue`<br>`user/DepartTreeShow.vue`<br>`user/MenuUpdateDialog.vue` | 3 个文件仅含占位 template，无实际功能，被 index.ts 虚假导出 | 删除文件并移除对应导出 |
| 3 | 缺失导出补全 | `ComponentsBusiness/index.ts` | LivePlayer、PrismPlayer、Recorder、ImagePreview 4 个组件缺少导出 | 补全导出声明，确保外部引用可达 |

### Task 2: 虚假占位批量替换（10 处）

| # | 占位文件 | 替换为真实组件 | 涉及模块 |
|---|----------|----------------|----------|
| 1 | `LiveList.vue` | `LivePlayer` | 直播列表 |
| 2 | `DirList.vue` | `CourseFileDialog` | 课程文件目录 |
| 3 | `qa.vue` | `CourseSelect` | 问答模块 |
| 4 | `statfull.vue` | `CourseSelectDialog` + `UserRange` | 统计面板 |
| 5 | `plan/form.vue` | `UserRange` | 计划表单 |
| 6 | `SendMsgDialog.vue` | `MsgTmplSelect` | 消息发送 |
| 7 | `TestMsgDialog.vue` | `MsgTmplSelect` + `UserSelect` | 消息测试 |
| 8 | `QuCorrectDialog.vue` | `QuItemCorrect` + `AssociatedKnowledge` | 题目纠错 |
| 9 | `QuItemSave.vue` | `RepoSelect` + `ChapterSelect` + `AssociatedKnowledge` + `FillItemEditor`(×2) | 题目保存 |
| 10 | `tmpl/Tinymce.vue` | 真实 Tinymce 编辑器 | 富文本模板 |

### Task 3: FileReader 安全 Composables 迁移（4 个）

| # | 文件 | 说明 |
|---|------|------|
| 1 | `useIframeFocusTracker.ts` | **新建** — iframe 焦点追踪，从原 SFC 内联逻辑抽取 |
| 2 | `useMouseEdgeGuard.ts` | **新建** — 鼠标边缘防护，防止拖拽越界 |
| 3 | `useScreenGuard.ts` | **新建** — 屏幕安全区域守护 |
| 4 | `useFileSecurity.ts` | **增强** — 整合上述 composables，统一安全策略入口 |

### Task 4: TODO / 调试残留清理

#### 4.1 高优 TODO 修复（3 处）

| # | 文件 | 修复内容 |
|---|------|----------|
| 1 | `BindMobile.vue` | 接入真实绑定手机号 API，替换硬编码占位逻辑 |
| 2 | `QuestionBankSelector.vue` | 替换 mock 数据为真实题库接口调用 |
| 3 | `paper/index.vue` | 更新过时注释，标注当前实现状态 |

#### 4.2 低优 TODO 注释更新（4 处）

对非阻塞性 TODO 注释进行了状态标注，标明原因及预期处理时间。

#### 4.3 console.log 清理（22 处）

| 处理方式 | 数量 | 说明 |
|----------|------|------|
| `if (import.meta.env.DEV)` 包裹 | 14 | 仅开发环境保留的调试日志 |
| 转为 `console.warn` | 5 | 有诊断价值的运行时警告 |
| 转为 `console.error` | 1 | 错误路径日志 |
| 转为代码注释 | 1 | 已无运行时意义的说明 |
| 保留不动 | 1 | 生产必需的日志输出 |

### Task 5: 真实缺失组件评估（5 项）

| # | 文件 | 评估结论 | 处理方式 |
|---|------|----------|----------|
| 1 | `review/papers.vue` | 虚假占位 — 对应业务尚未开发 | 更新注释标注为待开发 |
| 2 | `plan/stat/process.vue` | 虚假占位 — 对应业务尚未开发 | 更新注释标注为待开发 |
| 3 | `tmpl/form.vue` | 已有覆盖 — JoinQuList / JoinRuleList / Join1Form 已实现 | 无需处理 |
| 4 | `wrong/index.vue` | API 已存在，前端调用链路有误 | 修复错误提示，对齐后端接口 |
| 5 | `user/index.vue` (naviToPoints) | 保留 — admin 端无积分页面，跳转逻辑合理 | 无需处理 |

### Task 6: 构建验证

| 检查项 | 结果 |
|--------|------|
| `vue-tsc --noEmit` 类型检查 | ✅ 通过 |
| `npm run build` 生产构建 | ✅ 通过 (3468 模块, 耗时 1m 2s) |

#### 构建过程中额外修复

| # | 文件 | 问题 | 修复 |
|---|------|------|------|
| 1 | `tmpl/Tinymce.vue` | 替换后出现双 `<template>` 标签 | 移除多余 template 块 |
| 2 | `useFileSecurity.ts` | composable 重复导出导致构建失败 | 去重导出声明 |

---

## 三、构建产物概况

| 指标 | 值 |
|------|-----|
| 最大 chunk | `vendor-oss` — 862 kB (gzip 237 kB) |
| 超 600 kB chunk 数 | 6 个 |

> 后续可通过 `manualChunks` 策略进一步拆分大体积 chunk。

---

## 四、遗留项清单

| 优先级 | 项目 | 说明 |
|--------|------|------|
| P2 | `review/papers.vue` | 待业务开发后替换占位 |
| P2 | `plan/stat/process.vue` | 待业务开发后替换占位 |
| P3 | 6 个超大 chunk | manualChunks 拆分优化 |
| P3 | 低优 TODO 注释 | 按标注时间跟进处理 |

---

## 五、风险与后续建议

1. **Composables 回归测试** — FileReader 安全相关 composables 为新建文件，建议在集成测试中覆盖 iframe 焦点切换、鼠标拖拽越界、屏幕安全区域等场景。
2. **Tinymce 编辑器兼容性** — 从占位替换为真实编辑器后，需验证富文本内容在 V2→V3 迁移中的格式兼容性。
3. **构建产物体积** — 6 个 chunk 超过 600 kB，建议下一迭代配置 `manualChunks` 将 OSS SDK、富文本编辑器等独立拆包。
4. **mock 数据残留** — QuestionBankSelector 已替换为真实接口，建议全局扫描是否还有其他组件使用硬编码 mock 数据。
5. **占位组件监控** — 建议在 CI 中增加占位检测脚本（防止新增代码引入虚假占位）。
