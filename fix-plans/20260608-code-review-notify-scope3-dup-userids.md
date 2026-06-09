# 培训计划通知 scope=3 不去重 userIds 导致重复发送

- **发现时间**: 2026-06-08
- **来源**: code-review
- **关联提交/PR**: 当前 working tree（PlanPrepareNotifyJob scope=3 分支去重逻辑）
- **严重度**: 🟧 建议合并前修复

## 现象

前端 el-select 选同一个学员两次、或某用户在该 plan 有多条 EnterDist 记录时，scope=3 流程下同一用户可能收到多条通知。

## 触发条件

1. 管理员在前端 el-select 连续点击 u1 两次（v-model 数组含两个相同元素）
   - 或某用户在 el_enter_dist 表里有两条 EnterRefType=PLAN/planId 记录
2. `picked.stream().filter(scopeSet::contains)` 不会对 picked 去重
3. `userIds` 留下重复 u1
4. userMsgService.sendMsg 投递时同一人收 2 条

## 修复建议

`E:\rhProject\wk-train-center-service\yf-modules\yf-module-plan\src\main\java\com\yf\plan\job\PlanPrepareNotifyJob.java` line 99

```java
// 旧
userIds = picked.stream().filter(scopeSet::contains).collect(Collectors.toList());

// 新
userIds = picked.stream()
    .filter(scopeSet::contains)
    .distinct()
    .collect(Collectors.toList());
```

或前置 `new ArrayList<>(new HashSet<>(picked))` 一次性去重。

注：第 99 行 log warn 的 `picked.size() != userIds.size()` 是和"原始 entered 范围"对比的，这里加 .distinct 不会影响 warn 统计（dedupe 在 warn 之后）。

## 相关文件

- `E:\rhProject\wk-train-center-service\yf-modules\yf-module-plan\src\main\java\com\yf\plan\job\PlanPrepareNotifyJob.java`

## 状态

- [x] 已修复（2026-06-08 工作树）
  - `E:\rhProject\wk-train-center-service\yf-modules\yf-module-plan\src\main\java\com\yf\plan\job\PlanPrepareNotifyJob.java` line 99-104：`picked.stream().filter(scopeSet::contains).distinct().collect(Collectors.toList())` 加 `.distinct()` 去重
