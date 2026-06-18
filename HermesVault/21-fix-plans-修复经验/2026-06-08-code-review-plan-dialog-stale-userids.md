---
title: Review Plan Dialog Stale Userids
created: 2026-06-08
updated: 2026-06-08
type: fix-plan
severity: high
status: fixed
tags: [fix-plan, code, ui]
learned: dialog 切换 plan 时残留上一份 userIds;onPlanChange 必须 reset
fixed_in: 待主人 commit 后回填
confidence: high
---

# PlanNotifyDialog 切 plan 后残留 userIds 选择

- **发现时间**: 2026-06-08
- **来源**: code-review
- **关联提交/PR**: 当前 working tree（PlanNotifyDialog.vue scope=3 弹窗）
- **严重度**: 🟧 建议合并前修复

## 现象

切换培训计划后，el-select 仍残留上一个计划选中的学员 ID。后端交集校验静默丢弃，但 UI 仍弹"通知已发送"。

## 触发条件

1. 管理员给 plan A 选 u1、u2，点发送（或点取消）
2. 再次点 plan B 的"分享"按钮打开弹窗
3. `watch.visible(val)` 触发 → 只调 `fetchPlan()`，**没**重置 `postForm.userIds`、**没**清 `notifyUserList`
4. 管理员可能直接点发送（或者误以为已清空）
5. 后端用 u1∩planB指派 算交集 → 0 人 → warn 日志记录被丢弃
6. UI 弹"通知已发送"

## 修复建议

`E:\rhProject\wk-train-center-ui\src\views\admin\plan\plan\components\PlanNotifyDialog.vue`

在 `watch.visible` 处理器里同步重置：

```javascript
visible(val) {
  this.dialogVisible = val
  if (val) {
    this.fetchPlan()
  } else {
    // 关闭时清掉选择，避免下次打开残留
    this.postForm.userIds = []
    this.notifyUserList = []
  }
}
```

或者在 `fetchPlan` 开头统一清：

```javascript
fetchPlan() {
  if (!this.postForm.planId) return
  this.postForm.userIds = []  // 切计划时强制清空
  this.notifyUserList = []
  // ... 原逻辑
}
```

## 相关文件

- `E:\rhProject\wk-train-center-ui\src\views\admin\plan\plan\components\PlanNotifyDialog.vue`

## 状态

- [x] 已修复（2026-06-08 工作树）
  - `E:\rhProject\wk-train-center-ui\src\views\admin\plan\plan\components\PlanNotifyDialog.vue` `watch.visible` 处理器：关闭弹窗（`val=false`）时清空 `postForm.userIds` + `notifyUserList`，与 `watch.planId` 行为一致
