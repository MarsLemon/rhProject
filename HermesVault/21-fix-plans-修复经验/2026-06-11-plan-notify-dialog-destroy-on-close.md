---
title: Notify Dialog Destroy On Close
created: 2026-06-11
updated: 2026-06-11
type: fix-plan
severity: medium
status: fixed
tags: [fix-plan, plan, ui]
learned: Element-UI dialog 默认缓存实例;destroy-on-close 防止残留 watcher
fixed_in: 待主人 commit 后回填
confidence: high
---

# 分享学习任务弹窗常驻挂载 + 重开不重拉人员列表

- **发现时间**: 2026-06-11
- **来源**: 用户反馈（结合 2026-06-08 系列 code-review 结论）
- **关联文件**:
  - `E:\rhProject\wk-train-center-ui\src\views\admin\plan\plan\index.vue`
  - `E:\rhProject\wk-train-center-ui\src\views\admin\plan\plan\components\PlanNotifyDialog.vue`
- **严重度**: 🟥 功能不可用（私发通知一直拿不到学员列表）

## 现象

1. 打开「分享学习任务」弹窗 → 切到「任务中指定学员」tab → 学员下拉为空 → 提示"该计划未指派学员，无法选择"
2. 该计划后端实际有指派学员，但在前端永远拉不到
3. 即使先关闭再重开同一个计划，问题依旧

## 根因

1. 父组件 `<PlanNotifyDialog :visible.sync="notifyVisible" :plan-id="planId" />` 没有任何销毁条件，弹窗组件**常驻挂载**，`dialogVisible` 只是内部切显隐
2. 弹窗在 `watch.visible(false)` 时把 `notifyUserList` 清空
3. 弹窗在 `watch.visible(true)` 时**只**调 `fetchPlan()`、**没**调 `loadNotifyUsers()`，因此重新打开后人员列表永远是空
4. 配合第 1 点的常驻挂载 + 残留状态，每次开都拿不到数据
5. notify-users 后端接口本身没问题，问题完全在前端

## 修复

### 1. 父组件销毁式挂载

`index.vue`：

```vue
<!-- 旧：常驻挂载，状态永远不销毁 -->
<PlanNotifyDialog :visible.sync="notifyVisible" :plan-id="planId" />

<!-- 新：v-if 控制生命周期，关闭即销毁 -->
<PlanNotifyDialog v-if="notifyVisible" :visible.sync="notifyVisible" :plan-id="planId" />
```

`v-if` 让组件在 `notifyVisible = false` 时被卸载，下次 `true` 时重新走 `created()`，人员接口自动再调一次，所有残留状态清零。

### 2. 弹窗内补防御

`PlanNotifyDialog.vue` `watch.visible`：

```js
visible(val) {
  this.dialogVisible = val
  if (val) {
    this.fetchPlan()
    // 防御：父组件若后续移除 v-if，仍能保证重新打开时拉一次学员
    this.loadNotifyUsers()
  } else {
    this.postForm.userIds = []
    this.notifyUserList = []
  }
}
```

防止以后有人把 `v-if` 拆掉后老问题复现。

## 验证

- 打开弹窗 → 学员下拉正常显示该计划已指派学员
- 关闭 → 再打开（同一计划）→ 列表自动重新拉取
- 切到不同计划 → 列表按新计划重新拉取
- 选中若干学员 → 关闭 → 再打开 → 选中状态已清空，无残留

## 状态

- [x] 已修复（2026-06-11 工作树）
