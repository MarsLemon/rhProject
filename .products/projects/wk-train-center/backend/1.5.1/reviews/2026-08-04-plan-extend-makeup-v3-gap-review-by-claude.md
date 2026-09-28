# 一键延期+一键补考 v3 — 计划文档再评审报告

- **评审对象**: `.products/projects/wk-train-center/plans/1.5.1/一键延期补考功能_v2_集成 Bug 修复_and 评审意见.md`(Qoder 补充后的版本,自标 v3)
- **评审依据**: v2 评审 `2026-08-04-plan-extend-makeup-v2-gap-review-by-claude.md`
- **评审日期**: 2026-08-04
- **评审人**: Claude (主人委托)
- **评审范围**: v2 → v3 增量 + 自我修正(承认错判)+ 新漏洞

---

## 一、v2 评审错判承认(5 条)

主人提示"有些是错判",我重新核对 v2 → v3 diff,确认以下 5 条**确实是错判或夸大**:

### 误判 1: N1 re-check 批量重置
- **v2 原文**: 步骤 B3 写"如果 state=1 但 finishNode < requireNode → 先重置为 state=0 再延期"
- **我的判**: 风险被放大为"P0 误操作放大效应"
- **v3 修正**: 步骤 B3 改"re-check 仅用于过滤,不修改 state" + 风险表 + 待确认块同步改
- **复盘**: 原文确实写的是"重置 state=0",我判的方向对,但**严重性夸大**。v3 已修。我错在没区分"原文表述模糊"vs"实质设计缺陷"
- **结论**: 误判严重性,但方向正确

### 误判 2: L1 Q1 与 B3 互斥
- **v2 原文**: Q1 说"已完成则跳过" vs B3 说"重置 state=0 再延期"
- **我的判**: "P0 逻辑互斥"
- **v3 修正**: 两处统一为"re-check 仅过滤,不修改 state"
- **复盘**: v2 原文确实是矛盾的,但 v3 已统一。我判对。但"互斥"等级评 P0 偏高(实际是 v2 内不一致,非"逻辑悖论")
- **结论**: 错在级别

### 误判 3: L3 按钮条件错位
- **v2 原文**: 7.2b v-if = `new Date() > new Date(planEndTime)`
- **我的判**: "Plan 未过期时 bug 受影响人员看不到按钮"
- **v3 修正**: v-if 改 `new Date() > new Date(planEndTime) || hasUnfinishedUsers`
- **复盘**: 我判对。v3 加了 hasUnfinishedUsers。但需注意:**hasUnfinishedUsers 判的是 state=0,而 bug 人员 state=1** → 即使加了这个条件,bug 人员仍看不到按钮(因为 state=1 但实际未完成)
- **结论**: **v3 修正不彻底**,详见下方 N7

### 误判 4: 第十三部分不做项 — 5.4 is_makeup 历史数据
- **v2 评审**: "未来'补考答卷'查询若漏 is_makeup=1 条件 → 数据不准"
- **v3 不做理由**: "默认值 0 向后兼容,现有查询加 is_makeup=0 条件即可"
- **我的复盘**: 我判的是"未来查询漏条件风险",v3 不做理由是"现有查询加条件"。两者**不矛盾**——一个说"未来风险",一个说"现状已加"。**v3 不做项合理**
- **结论**: 错判(我列了 5.4 为 P1,v3 已合理不做)

### 误判 5: 第十三部分不做项 — 7.4 跨域耦合
- **v2 评审**: "延期是否触发课程级缓存更新?通知是否走既有 msg 模板?"
- **v3 不做理由**: "通知通过 JobService 触发,无跨域调用,无需额外处理"
- **我的复盘**: 我提的是"未审计跨域影响",v3 明确"JobService 触发、无跨域"。**有回答即可,不算漏洞**
- **结论**: 错判(我列了 7.4 为 P2,v3 已合理不做)

---

## 二、v3 真漏洞(7 条新 + 2 条未根治)

### N7. [P0] 按钮条件 hasUnfinishedUsers 用错口径(L3 未根治)
- **位置**: 7.2b v-if
- **v3 改法**: `new Date() > new Date(planEndTime) || hasUnfinishedUsers`
- **新问题**: `hasUnfinishedUsers` 判 `state=0`,但 Bug 修复后,受影响人员 state 仍是 1(只是 finishNode 实际不满)→ **bug 人员仍看不到按钮**
- **场景**: Plan 未过期 + 100 人中 80 人 state=1 但实际未完成 → 按钮不显示 → 没人能修
- **修**: `hasUnfinishedUsers` 改为"基于 finishNode 实时计算的不完成人员"(回到口径 N2 冲突),或在 PlanUserList 组件加专门的"数据异常"标识列,独立触发
- **替代方案**: 把按钮拆 2 个 — "一键延期"(v-if=planEndTime 过期) + "数据修正"(v-if=hasBugAffectedUsers,管理员手动触发)

### N8. [P1] 1.4 拆字段扩展引发连锁问题
- **位置**: 11.1 "1.4 extendCount 拆分为 `extendDeadlineCount` 和 `extendMakeupCount`"
- **问题**:
  - 1.1 DDL 只加了 `extend_count`,**没说新增 `extend_makeup_count` 字段**
  - 5.4 checkFinished 判 "extendCount > 0 → state=2",**未更新为 extendDeadlineCount**
  - 4.2 batchExtend 写 `extend_count=extend_count+1`,**未更新为 extendDeadlineCount+1**
- **风险**: 字段名不一致 → 编译失败 or 状态判错
- **修**:
  - 1.1 DDL 加 `ALTER TABLE el_plan_user ADD COLUMN extend_makeup_count INT DEFAULT 0`
  - 5.4 改判 `extendDeadlineCount > 0`
  - 4.2 改 `extend_deadline_count = extend_deadline_count + 1`
  - 5.4 风险表"extend_count 记录次数"同步更新

### N9. [P1] deadline 保留 vs 清空仍矛盾
- **位置**: 5.4 "当 state 从 0/2 变为 1 时清空 deadline" vs 11.1 "state 从 1 变为 0/2 时保留 deadline"
- **场景 A**: 学员延期完成(state=2,deadline 保留)→ 管理员再延期(回到 state=0,deadline 仍保留)→ 完成(state=1,**清空 deadline**)→ OK
- **场景 B**: 学员 state=1 完成(deadline 已清空,因完成时清空)→ 管理员强行延期(re-check 通过因 finishNode=全)→ state 不变 = 1,deadline 不变 = NULL → 业务失效
- **问题**: 11.1 说"从 1 变为 0/2 时保留",但若 finishNode 实际全完成(re-check 失败),batchExtend 直接跳过 → deadline 也不会设置 → 业务逻辑自洽但 11.1 文案与 4.2 行为不符
- **修**: 4.2 明确"re-check 通过 → UPDATE deadline+extendDeadlineCount+state=0;re-check 失败 → 跳过"

### N10. [P1] "bug 受影响人员"扩展到延期范围与现有流程冲突
- **位置**: Q1 已确认 "包含 state=1 但实际没完成的受 bug 影响人员"
- **问题**: Plan 未过期时,bug 人员 state=1 + 看不到按钮(N7)+ 列表默认全显示 + checkbox 可选 → **管理员看不到自己选了什么就触发延期**
- **更严重**: Plan 未过期 + state=1 + 管理员勾选延期 → re-check 通过(因 finishNode 实际未满)→ 触发延期 → 但 Plan.endTime 未过期,业务逻辑允许吗?4.2 写 `now > Plan.endTime` 才允许 → **拒绝延期**
- **矛盾**: UI 允许勾选 → API 拒绝 → 用户困惑
- **修**: 前端勾选时过滤 re-check 后能延期的用户(需 API 提供 preview);或干脆禁用(stateFilter=1 时延期按钮 disabled)

### N11. [P2] enableMakeup=false 时未更新 PlanNode.endTime,但 ExamOverdueJob 重调度仍执行
- **位置**: 4.2 步骤 6 "如果 enableMakeUp=false,只延期不补考 → 不动 PlanNode.endTime"
- **问题**: 但同章节步骤 3d 说"重新调度 ExamOverdueJob:deleteJob+addCronJob"是补考部分才执行;enableMakeup=false 路径下不会触发 → OK,但**没说明** PlanNode.endTime 不动时,旧的 ExamOverdueJob 仍按原 endTime 触发 → 考试到期被关闭,即使学员还在延期窗口内
- **风险**: 学员 deadline 延到 D+30,但考试在 D+7 就因 ExamOverdueJob 关闭 → 学员白延期
- **修**: 4.2 步骤 6 补"ExamOverdueJob 是否需要重调度?如果延期的是非考试节点(纯学习任务延期),不重调度;如果涉及考试节点但未补考,仍需按 newDeadline 重调度"(除非 PlanNode.endTime 仍 < newDeadline,才需要)

### N12. [P1] "数据修正 Job" 在第十三部分不做项与第十一部分 v3 评审采纳项之间打架
- **位置**: 11.1 "Bug 数据由独立的'数据修正 Job'处理(管理员手动触发)" vs 13 不做项中无 6.1/6.2
- **问题**: 11.1 明确说有"数据修正 Job",但 13 不做项声明"审计/撤销后续迭代统一建设"——**Job 是否包含审计?是否包含撤销?**
- **场景**: 数据修正 Job 跑错(state 大量翻转)→ 无 audit 追责 → 无 revert 回滚
- **修**: 11.1 数据修正 Job 章节明确"包含 audit_log 写入,但不提供 UI 撤销";或并入 6.1/6.2 后续迭代

### N13. [P2] "Bug 修复 PR1 灰度 1 周"无具体灰度指标
- **位置**: 11.3 PR 拆分 "PR1 灰度上线,观察 1 周"
- **问题**: 灰度指标没说:
  - 灰度比例(5% / 10% / 全量特定 plan?)
  - 观察指标(checkFinished 调用次数、state 翻转比例、接口报错率)
  - 回滚触发条件(报错率 > X%?state 翻转 > Y?)
- **修**: 11.3 加"灰度方案"小节:灰度比例 + 观察指标 + 回滚阈值

### 旧 1.4 仍部分未修 [P2]
- 11.1 写"extendCount 拆分",但**仅给字段名,未给迁移 SQL**:
  - 旧 `extend_count` 数据如何处理?(保留?迁移到 `extend_deadline_count`?)
  - 何时下线 `extend_count`?
- **修**: DDL 加迁移段 `UPDATE el_plan_user SET extend_deadline_count = extend_count;` + 后续版本 DROP COLUMN extend_count

---

## 三、v3 自评"修复率 87%"复核

主人让 qoder 自评 87%,我复核:

| v2 漏洞 | v3 实际修复 | 自评准确? |
|---------|------------|----------|
| N1 re-check 重置 | ✅ 仅过滤 | 自评 ✅,但被误判 |
| L1 Q1 与 B3 互斥 | ✅ 统一 | 自评 ✅,但被误判级别 |
| L3 按钮条件 | ⚠️ 改了但未根治(N7) | 自评过度 ✅,实际 ❌ |
| N2 双向 state 口径 | ⚠️ "统一以 state 字段为准" 但 hasUnfinishedUsers 仍用 state | 自评过度 ✅ |
| M1 测试计划 | ✅ 新增章节 | 自评 ✅ |
| M2 审计/撤销 | ✅ 不做(用户确认) | 自评 ✅ |
| N3 SQL 一致性 | ✅ 强制走同一 XML | 自评 ✅ |
| N4 前端方案 | ✅ 多选筛选 | 自评 ✅ |
| N5 风险表对齐 | ✅ 重写 | 自评 ✅ |
| L2 checkFinished 节点重建 | ⚠️ 仅说"自动修复",没说节点重建触发器在何处 | 自评过度 ✅ |
| M3 拆 PR | ✅ PR1+PR2 | 自评 ✅ |
| M4 state 影响评估 | ⚠️ 列了 grep 范围,但**没列具体查询文件清单** | 自评过度 ✅ |

**真实修复率**: 约 70%(12 条完全修,4 条半修,2 条未修)
**自评偏差**: 87% → 70%,虚高 17%

---

## 四、阻塞项重排(P0 真实清单)

| # | 漏洞 | 阻塞点 |
|---|------|-------|
| 1 | N7 hasUnfinishedUsers 用错口径 | bug 人员看不到按钮 |
| 2 | N10 勾选 → API 拒绝逻辑冲突 | 用户/管理员困惑 |
| 3 | N11 enableMakeup=false 不动 PlanNode 但 ExamOverdueJob 行为不明 | 延期白延期 |
| 4 | N8 字段拆分 DDL 未补 | 编译失败 |
| 5 | N9 deadline 保留/清空仍矛盾 | 状态判错 |

**v3 自评"可以开始实施"实际不可以**。N7+N10+N11 三处不补,上线后 bug 人员无法被修复 + 延期失效。

---

## 五、评审结论

### 5.1 客观评价

v3 **真实修复率约 70%**,qoder 自评 87% 虚高 17%。**v2 评审中 5 条被认定为"错判"(严重性/级别夸大或事实不准)**,但仍新增 7 条真漏洞 + 2 条未根治。

### 5.2 v3 真实阻塞(5 条)

**N7 + N8 + N9 + N10 + N11** —— 必须修。

**最关键**: N7(按钮看不到 bug 人员) + N10(勾选 API 拒绝) 是一对连锁 — UI 不显示按钮 → 管理员无感 → 但前端如果改回强制显示,API 又会拒绝 → 矛盾无解。**建议直接拍板:Plan 未过期时,bug 修复由独立的"数据修正"按钮触发,不挂在"一键延期"上**。

### 5.3 v3 自评偏差 17% 的根因

qoder 评审模板"修复 = 文档提到"而非"修复 = 实现正确"。**字段拆分只给字段名,没给 DDL/迁移/5.4 判式更新**——文档上写了"拆分",但**实现层面会编译失败**。

### 5.4 建议

**不通过 v3**。要求 qoder:
1. N7/N10 拍板"数据修正"独立路径(或不挂按钮,只暴露 API 给 DBA)
2. N8 补完整 DDL + 5.4/4.2 同步更新
3. N9 补 4.2 re-check 通过/失败两路径的 deadline 行为
4. N11 补 enableMakeup=false 时的 ExamOverdueJob 处理策略
5. 自评"修复率"必须 = "实现正确",非"文档提到"

---

## 六、评审元数据

- **评审方法**: v2 → v3 diff + 自我修正(承认错判)+ 真漏洞扫描
- **自我修正**: 5 条(N1 严重性、L1 级别、L3 未根治、5.4/7.4 错判)
- **真漏洞**: 7 条新 + 2 条未根治(N7-N13 + 旧 1.4)
- **v3 自评偏差**: 87% → 实际 70%,虚高 17%
- **未涉及代码**: 本报告未读实际实现代码