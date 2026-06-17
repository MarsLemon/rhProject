# 解锁流程去掉「必须学习」按钮后剩余漏洞

> 日期：2026-06-15
> 范围：`wk-train-center-service` 培训计划模块 + Vue2 / Vue3 / H5 mobile 学员端
> 状态：分析完成，待排期修复

## 一、变更背景

「必须学习」按钮原本的行为是**顺序解锁**：学员必须先点开 A 节点并完成，A 才解锁 B。
本次变更简化为：

- `planStart` → 一次性 `unlockAllNodes(planId, userId)` 批量创建所有节点的 `PlanUserNode` 记录
- `syncNextUnlock` 不再去找下一节点解锁，方法体注释明确写「不再顺序解锁下一节点」
  ([PlanUserNodeClientServiceImpl.java:119](wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/client/service/impl/PlanUserNodeClientServiceImpl.java#L119))

涉及的关键调用点（4 处都改成了 bulk unlock）：

| 入口 | 方法 | 文件:行 |
|---|---|---|
| 普通任务详情 | `PlanClientServiceImpl.ensureAllNodesAvailable` | `PlanClientServiceImpl.java:350-380` |
| 密码任务首次开始 | `PlanUserClientServiceImpl.firstStart` | `PlanUserClientServiceImpl.java:98, 110` |
| 管理员补录/二次补全 | `PlanUserClientServiceImpl.unlock` | `PlanUserClientServiceImpl.java:165-169` |
| 定时通知后兜底 | `PlanClientServiceImpl.startPlan` | `PlanClientServiceImpl.java:344` |

## 二、剩余漏洞清单

### V1（🔴 严重）节点时间窗口在 `syncNextUnlock` 中仍未校验

**1.3 系统逻辑缺陷报告 D-001** 指出 `PlanUserNodeClientServiceImpl.syncNextUnlock` 未对 `el_plan_node.start_time` / `end_time` 校验，本轮变更**没有顺手修掉**。

**复现路径**：

1. 管理员设置节点 N 的 `start_time = 2026-07-01 09:00`、`end_time = 2026-07-15 18:00`
2. 学员 6 月 15 日（计划时间内，但节点时间窗外）完成对应课程
3. `CourseFileLearnServiceImpl.checkProcess` 走到 `syncNextUnlock(..., FINISHED)`
4. `syncNextUnlock` 在 L86-112 没有任何时间窗口判断，直接 `userNode.setFinished(true)` 并通过 `processAfterFinish` 调 `planUserService.checkFinished`
5. 整体进度统计会把这次"提前完成"算进去

**修复方案**：参考 `PlanPreServiceImpl.preCheck` L105-121 的写法，在 `syncNextUnlock` 持久化前增加：

```java
if (node.getStartTime() != null && new Date().before(node.getStartTime())) {
    log.warn("节点未开始: planId={}, nodeId={}, startTime={}",
        node.getPlanId(), node.getId(), node.getStartTime());
    return;
}
if (node.getEndTime() != null && new Date().after(node.getEndTime())) {
    log.warn("节点已结束: planId={}, nodeId={}, endTime={}",
        node.getPlanId(), node.getId(), node.getEndTime());
    return;
}
```

### V2（🔴 严重）`unlockAllNodes` 无视节点 start_time 全部解锁

变更前的设计是"完成 A 才能解锁 B"，隐含了"节点 N 的解锁时间 ≥ N 的 `start_time`"。变更后 `unlockAllNodes` 在 L217 把所有节点 `unlockTime` 都设成 `new Date()`，**与 `start_time` 无关**。

**影响**：

- 学员开始任务后，所有节点卡片的「去学习 / 去考试」按钮立即亮起
- 即使节点 `start_time` 在一个月后，学员点进去可以正常学/考（`courseStateUtils.checkState` 只校验计划级时间窗，不校验节点时间窗）
- 然后触发 V1 的链路，提前完成

**修复方案**：`saveUserNode` L204-229 增加 `unlockTime` 钳制：

```java
Date unlockAt = new Date();
if (node.getStartTime() != null && unlockAt.before(node.getStartTime())) {
    unlockAt = node.getStartTime();
}
node.setUnlockTime(unlockAt);
```

或更彻底：把节点 start_time 前的 `PlanUserNode` 标为"待解锁"，前端在 `node.unlocked` 计算时按 `now >= start_time` 二次过滤。

### V3（🟡 中）`ensureAllNodesAvailable` 无锁，并发写 `PlanUser`

`PlanClientServiceImpl.detail()` 在 L107-109 对非密码任务每次访问详情都调 `ensureAllNodesAvailable`。该方法 L350-380 的 `if (exist == null) { ... planUserMapper.insert(pu); }` **没有 Redis 锁**（对比同模块 `firstStart` L60 有 `@RedisLock`）。

**复现**：双十一场景下 100 个学员同时点开同一计划详情页 → 100 个并发 `ensureAllNodesAvailable` → 都看到 `exist == null` → 都尝试 insert → 主键冲突异常被吃掉（事务回滚），学员看到"任务详情"页空白/失败。

**修复方案**：方法上加 `@RedisLock(key = "#planId+'-'+#userId")`，与 `join()` L149 保持一致。

### V4（🟡 中）`syncNextUnlock` 的 `first` 参数是死代码

`PlanNodeTriggerService` 接口 L13 写「保留参数，兼容历史调用」，但 `PlanUserNodeClientServiceImpl.syncNextUnlock` 方法体内**从未引用** `first` 变量。

调用方传值 100% 是 `false`（`PlanTriggerJob.java:46`、`CourseFileLearnServiceImpl` 3 处、`PlanUserClientServiceImpl.queryCourse` L250），传 `true` 走老逻辑的链路已不存在。

**修复方案**（择一）：

- A. 删掉 `first` 参数，3 个调用方同步去参（推荐，影响面小）
- B. 保留参数但加 `@Deprecated` + JavaDoc 标注

### V5（🟡 中）`processTag` 字段语义不一致

- `unlockAllNodes → saveUserNode` L218：所有节点写 `processTag = PlanActionTag.UNLOCK`
- `syncNextUnlock` L113：节点完成后 `processTag` 被覆盖为 `actionTag`（FINISHED / JOIN / PASSED 等）

**影响**：统计报表 / 后台审计如果按 `processTag = UNLOCK` 筛选"哪些节点曾被学员主动点击解锁"，变更后**永远是 0**——所有节点都是被动批量解锁，区分不出学员行为。

**修复方案**：

- L218 改成 `processTag = null`（"系统自动解锁"语义），区分 `UNLOCK`（历史保留为"主动解锁"）
- 报表侧把"主动解锁 vs 批量解锁"作为新维度展示

### V6（🟢 低）`unlockAllNodes` 已有记录时不同步 `refId` / `nodeType`

`saveUserNode` L208-210 `if (node != null) return;` 提前返回，导致**已存在**的 `PlanUserNode` 不会回写冗余字段。

`PlanUser.findMap` L162-180 同时支持 `nodeId` 精确匹配 + `refId_nodeType` 兜底匹配（见 1.4 编辑容错改进方案），所以**当前不会出错**。但：

- 管理员改了节点 `ref_id`（如更换课程），旧记录的 `refId` 仍是旧值
- 后续 `syncNextUnlock` 用的 `reqDTO.getRefId()` 是新值，会用 `refId + nodeType` 兜底匹配命中旧记录
- 表现上没问题，但 `refId` 字段是冗余存储，**数据上落后**

**修复方案**：`saveUserNode` 改为：

```java
if (node != null) {
    // 冗余字段回写，兼容管理员改任务
    node.setRefId(planNode.getRefId());
    node.setNodeType(planNode.getNodeType());
    planUserNodeService.updateById(node);
    return;
}
```

### V7（🟢 低）`el_training_record` 在 unlock 时不写

`unlockAllNodes` 只插 `PlanUserNode`，不写 `el_training_record`（学习记录表，AI 答疑 / 学习报告 join 的那张）。

**影响窗口**：

- 学员点"开始任务"瞬间
- 到第一次进入任意课程触发 `CourseFileLearnServiceImpl.incr` 之间
- 此时 AI 答疑如果 join 学员的"最近学习记录"会拿不到任何数据
- 学习报告的"已解锁节点数"和"已学课程数"对不上

**修复方案**（可接受忽略）：V7 是数据窗口问题，不影响功能。如果要修，让 `unlockAllNodes` 在 L160 `planUserService.checkFinished` 之后，对每个解锁节点写一条 `el_training_record` 占位（`state=0`、`learn_sec=0`）。

## 三、三端一致性核查（已确认无遗漏）

| 端 | 入口按钮 | 触发 API | 后端方法 |
|---|---|---|---|
| Vue2 学员端 `WebPlanDetail.vue:33-43` | "开始任务" | `planStart` | `firstStart` / `ensureAllNodesAvailable` |
| Vue3 v3 `WebPlanDetail.vue:31-41` | "开始任务" | `planStart` | 同上 |
| H5 mobile `train-detail.vue:293-296` | "开始学习" | `trainStart` | 同上（`train.ts` 走 `planStart`） |
| 管理端 `PlanUserList.vue:25` | 列表"必学项目"列 | `requireNode` 字段 | `PlanUserServiceImpl.checkFinished` L95（仍按 `requireNode` 列表判断整体完成） |

3 个学员端代码逻辑一致（`node.unlocked` + `planStart` + `planQuery` 手动刷新），均无遗留"必学"按钮。**管理端的"必学项目"列是统计字段，不是按钮，不要混淆**。

## 四、修复优先级建议

| 优先级 | 任务 | 工作量估计 |
|---|---|---|
| P0 | V1 + V2（时间窗口相关，连带改） | 0.5 人日（含单测） |
| P1 | V3（Redis 锁） | 0.2 人日 |
| P1 | V4（清理 `first` 参数） | 0.3 人日（3 处调用方） |
| P2 | V5（`processTag` 语义） | 0.2 人日 |
| P2 | V6（`refId` 回写） | 0.2 人日 |
| P3 | V7（`el_training_record` 占位） | 0.5 人日（评估后决定是否真做） |

**合计**：P0+P1 大约 1.3 人日，可以本迭代一并出。

## 五、相关文档

- `documents/1.3/1.3-20260430-系统-逻辑缺陷报告.md` D-001（V1 历史来源）
- `documents/1.4/1.4-20260509-学习任务-编辑容错改进方案.md`（V6 历史背景）
- `memory/domain-coupling-course-study-task.md`（培训计划 ↔ 学习任务耦合点）
- `memory/workflow-cross-module-check.md`（改动前必查清单）

## 六、排查命令（复制即用）

```bash
# 1. 确认所有 unlockAllNodes 调用点都已收敛到 batch
grep -rn "unlockAllNodes" wk-train-center-service/yf-modules/yf-module-plan/src

# 2. 确认 syncNextUnlock 没有遗留「解锁下一节点」逻辑
grep -rn "unlockNextNode\|nextNode\|unlockNext" wk-train-center-service/

# 3. 查 el_plan_node 表上是否还有遗留 unlockTime = start_time 之前的脏数据
# （V2 修复后可能需要数据回填）
# SELECT id, plan_id, start_time FROM el_plan_user_node WHERE unlock_time < start_time;

# 4. 查前端是否还有「必学」按钮残留
grep -rn "必学\|必须学习" wk-train-center-ui/src/views/web/plan/
grep -rn "必学\|必须学习" wk-train-center-ui-v3/src/views/web/plan/
grep -rn "必学\|必须学习" wk-mhc-mobile/src/pages/smart-training/
```
