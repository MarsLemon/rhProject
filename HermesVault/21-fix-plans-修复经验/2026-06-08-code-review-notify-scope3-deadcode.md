---
title: Review Notify Scope3 Deadcode
created: 2026-06-08
updated: 2026-06-08
type: fix-plan
severity: high
status: fixed
tags: [fix-plan, code, backend]
learned: scope=3 限定 PERSON 计划;写业务代码前先看清枚举的所有取值
fixed_in: 待主人 commit 后回填
confidence: high
---

# 培训计划通知 scope=3 对非 PERSON 计划是死代码

- **发现时间**: 2026-06-08
- **来源**: code-review
- **关联提交/PR**: 当前 working tree（PlanPrepareNotifyJob scope=3 新增分支）
- **严重度**: 🟥 阻塞合并

## 现象

非 OpenType=PERSON 的培训计划，调用 `/api/plan/plan/prepare-notify` 携带 `scope=3` + `userIds`，**Job 静默不执行**，前端依旧报"通知已发送"。

## 触发条件

1. 管理员对 OpenType=DEPT（或未来其它类型）的培训计划 A 调用发送通知
2. 显式传 `scope=3` + `userIds=[u1, u2]`（绕过 UI 直接调 API、或未来 UI 误用）
3. `PlanPrepareNotifyJob` 第 71 行 `if (OpenType.PERSON.equals(...))` 不命中 → `userIds` 保持空
4. 第 76 行 `if (CollectionUtils.isEmpty(userIds)) return;` 早返回
5. scope=3 分支（第 92 行）永远跑不到，**无人收到通知**也**无任何错误日志**

## 修复建议

`E:\rhProject\wk-train-center-service\yf-modules\yf-module-plan\src\main\java\com\yf\plan\job\PlanPrepareNotifyJob.java`

**方案 A（推荐）**：在 line 71 之前单独处理 scope=3，让它绕过 OpenType.PERSON 守卫：

```java
// scope=3 强制走指派范围 + 操作人手选
if (dto.getScope() != null && dto.getScope().equals(3)) {
    userIds = enterDistService.listAllUserIds(EnterRefType.PLAN, dto.getPlanId());
} else if (OpenType.PERSON.equals(plan.getOpenType())) {
    userIds = enterDistService.listAllUserIds(EnterRefType.PLAN, dto.getPlanId());
}
```

**方案 B**：PlanServiceImpl.listNotifyUsers 加状态校验，非 PERSON 计划直接 throw 业务异常（"不支持 scope=3"），把 4xx 抛回前端。

## 相关文件

- `E:\rhProject\wk-train-center-service\yf-modules\yf-module-plan\src\main\java\com\yf\plan\job\PlanPrepareNotifyJob.java`
- `E:\rhProject\wk-train-center-service\yf-modules\yf-module-plan\src\main\java\com\yf\plan\modules\admin\plan\service\impl\PlanServiceImpl.java`

## 状态

- [x] 已修复（2026-06-08 工作树）
  - `E:\rhProject\wk-train-center-service\yf-modules\yf-module-plan\src\main\java\com\yf\plan\job\PlanPrepareNotifyJob.java` line 70-78：在原 `if(OpenType.PERSON.equals(...))` 前增加 `if(dto.getScope()==3)` 分支，让 scope=3 走 enterDistService 兜底
  - 修复后非 PERSON 计划 + scope=3 也能正常进入交集校验分支
