---
title: Review Plan Dialog Loading Hint
created: 2026-06-08
updated: 2026-06-08
type: fix-plan
severity: medium
status: fixed
tags: [fix-plan, code, ui]
learned: 加载中文案在切换 plan 时未清空;dialog 状态隔离要彻底
fixed_in: 待主人 commit 后回填
confidence: high
---

# PlanNotifyDialog 加载中文案重叠（"无法选择"在 loading 时也显示）

- **发现时间**: 2026-06-08
- **来源**: code-review
- **关联提交/PR**: 当前 working tree（PlanNotifyDialog.vue scope=3 弹窗）
- **严重度**: 🟨 排期修复（影响 UX，不影响功能）

## 现象

打开弹窗瞬间，select 处于 disabled + loading + 错误文案三态叠加，管理员误以为该计划真的没指派学员，关闭弹窗不发送通知。

## 触发条件

1. 打开弹窗
2. `notifyUserLoading = true` 且 `notifyUserList = []`（初始值）
3. `<span v-if="notifyUserList.length === 0">该计划未指派学员，无法选择</span>` 立即渲染
4. el-select 同时是 disabled（`:disabled="notifyUserList.length === 0"`）
5. 用户看到错误文案 + disabled 控件，**分不清"正在加载"还是"真没数据"**

## 修复建议

`E:\rhProject\wk-train-center-ui\src\views\admin\plan\plan\components\PlanNotifyDialog.vue` line 77

```vue
<!-- 旧 -->
<span v-if="notifyUserList.length === 0" class="scope-hint">
  该计划未指派学员，无法选择
</span>

<!-- 新 -->
<span v-if="!notifyUserLoading && notifyUserList.length === 0" class="scope-hint">
  该计划未指派学员，无法选择
</span>
```

loading 中显示空白或"加载中"提示更合适。

## 相关文件

- `E:\rhProject\wk-train-center-ui\src\views\admin\plan\plan\components\PlanNotifyDialog.vue`

## 状态

- [x] 已修复（2026-06-08 工作树）
  - `E:\rhProject\wk-train-center-ui\src\views\admin\plan\plan\components\PlanNotifyDialog.vue` line 78：提示 `v-if` 改为 `!notifyUserLoading && notifyUserList.length === 0`，加载中不显示错误文案
