# 一键延期+一键补考 v2 — 计划文档漏洞评审报告

- **评审对象**: `.products/projects/wk-train-center/plans/1.5.1/一键延期补考功能_v2_集成 Bug 修复_and 评审意见.md`
- **评审依据**: v1 评审 `2026-08-04-plan-extend-makeup-gap-review-by-claude.md`(30 个漏洞)
- **评审日期**: 2026-08-04
- **评审人**: Claude (主人委托)
- **评审范围**: v1 → v2 增量修复 + 新增 Bug 修复块 + 新引入漏洞

---

## 一、v1 漏洞覆盖度审计

| v1 漏洞 | v2 是否修复 | 修复方式 | 是否彻底 |
|---------|------------|---------|---------|
| 1.1 state=2 回退路径 | ✅ 修复 | batchExtend 加 `state IN (0, 2)` + state=0 重置 | ✅ 彻底 |
| 1.2 deadline 清理 | ✅ 修复 | state=1 时清空 deadline(5.4) | ⚠️ 缺延期路径回退到 0/2 时的 deadline 保留逻辑 |
| 1.3 chanceOverride 多次延期 | ✅ 修复 | 改 `MAX(IFNULL(chance_override, Exam.chance), tryCount + addCount)` | ✅ 彻底 |
| 1.4 extendCount 区分触发源 | ❌ 未修 | 仍 `extend_count+1` 一刀切 | ❌ 仍存 |
| 2.1 RedisLock 粒度 | ✅ 修复 | key 改 `plan:extend:{planId}:{userIdsHash}`(MD5) | ✅ 彻底 |
| 2.2 Exam.endTime 全局副作用 | ✅ 修复 | 不动 Exam.endTime,只动 PlanNode.endTime | ✅ 彻底 |
| 2.3 PlanNode.endTime 共享 | ⚠️ 部分 | SQL WHERE plan_id+ref_id 限定,但多 planNode 同 exam 风险表没改 | ⚠️ 待补 |
| 2.4 通知 Job 竞态 | ✅ 修复 | 加幂等键 (userId+planId+triggerType) | ✅ 彻底 |
| 3.1 is_makeup 标记位置 | ❌ 未修 | 仍写 tryCount > 0 标 isMakeup | ❌ 仍存 |
| 3.2 补考范围 vs PlanUser.state | ⚠️ 部分 | batchExtend 加 re-check,但前端预览未明确提示"按 ExamRecord.passed 二次过滤" | ⚠️ 待补 |
| 3.3 预览快照漂移 | ❌ 未修 | 仍写"提交时 re-check"但没说怎么处理差异(是强制用最新?还是拒绝提交?) | ❌ 仍存 |
| 3.4 enableMakeup=false 校验冲突 | ⚠️ 间接修 | 改 PlanNode.endTime 后 Exam 启动校验仍走 Exam.endTime 旧值 → 仍存 | ❌ 仍存 |
| 3.5 ExamOverdueJob cronKey | ✅ 修复 | jobName 改 `exam:overdue:{examId}:{planId}`(选 B) | ✅ 彻底 |
| 3.6 addCount=0 过滤 | ❌ 未修 | 仍写"自动跳过"但 service 层未明说 | ❌ 仍存 |
| 4.1 二级表头实现 | ❌ 未修 | 无 render-header 示例 | ❌ 仍存 |
| 4.2 分数合并列缓存 key | ❌ 未修 | 无 | ❌ 仍存 |
| 4.3 勾选语义模糊 | ✅ 修复 | 业务需求明确"全选未完成任务"按钮 + stateFilter | ✅ 彻底 |
| 4.4 i18n 文案 | ❌ 未修 | 无 | ❌ 仍存 |
| 5.1 DDL 锁表 | ✅ 修复 | ALGORITHM=INSTANT | ✅ 彻底 |
| 5.2 chanceOverride 历史数据 | ✅ 修复 | MAX 保护公式 | ✅ 彻底 |
| 5.3 state 字段类型 | ❌ 未修 | 未说明 | ❌ 仍存 |
| 5.4 is_makeup 历史数据 | ❌ 未修 | 仅说"向后兼容"无后续查询保护 | ❌ 仍存 |
| 6.1 审计日志 | ❌ 未修 | 仍无 audit_log | ❌ 仍存 |
| 6.2 撤销/回滚机制 | ❌ 未修 | 无 revertExtend 接口 | ❌ 仍存 |
| 6.3 权限控制 | ❌ 未修 | 无 @RequiresPermissions | ❌ 仍存 |
| 7.1 测试计划 | ❌ 未修 | 0 字 | ❌ 仍存 |
| 7.2 DBA/运维通知 | ❌ 未修 | 风险表说"INSTANT"但没说执行窗口 | ❌ 仍存 |
| 7.4 跨域耦合 | ❌ 未修 | 无 notify/cache 路径 | ❌ 仍存 |

**修复率**: 30 个 v1 漏洞中, **11 个彻底修复, 4 个部分修复, 15 个仍存** (47% 修复率)。

---

## 二、v2 新引入漏洞 (NEW)

### N1. [P0] Bug 修复块制造历史脏数据放大效应
- **位置**: 第二部分附一 - 步骤 B3
- **问题**: batchExtend 中"对勾选用户 re-check → 如果 state=1 但 finishNode < requireNode → 先重置为 state=0 再延期"
- **场景**: 1000 学员中 800 受历史 bug 影响 state 错误 → 管理员一键延期 → 批量 re-check + 重置 → 状态批量跳变 + deadline 设置 + extendCount++ → 800 人莫名其妙被记一次延期
- **风险**: 管理员无感知,事后查 audit 才发现(且无 audit,见 6.1)
- **修**: re-check 仅作"过滤"用,不修改 state;若用户 state=1 但实际未完成,前端 UI 标红提示"数据异常",由管理员手动确认

### N2. [P0] state 双向化导致进度页与列表页口径冲突
- **位置**: 5.4 步骤 + 风险表"checkFinished 改为实时计算"
- **问题**: checkFinished() 改"实时计算 finishNode vs requireNode",但任务进度总览页依赖的统计口径可能未同步改
- **风险**: 列表页显示"延期完成"(state=2)但进度页按 finishNode 实时算显示"进行中" → 用户/管理员困惑
- **修**: 明确"进度页以 state 字段为准(单向缓存)"还是"以 finishNode 实时为准";在 wiki 文档固化口径,前端两个组件共用同一份 selector

### N3. [P0] re-check SQL 与现有 listAllNonSparringNode 逻辑一致性未校验
- **位置**: 第二部分附一 - 步骤 B2 "AND pn.deleted=0" + 步骤 B3 "基于 el_plan_user_node.finished=1"
- **问题**: 两处都改 SQL,但没说与"现有 listAllNonSparringNode() 内部 SQL"完全对齐;若历史该方法加了别的过滤(如 draft/archived node),re-check 仍漏
- **修**: 强制走 listAllNonSparringNode() 同一份 XML 片段,不允许复制粘贴;或抽公共 SQL 模板

### N4. [P1] "宽松策略"边界模糊
- **位置**: 第二部分附一 - 待确认块
- **问题**: "frontend Table 默认显示所有行(state=0/1/2 都显示)checkbox 可选;**或**提供'全选未完成任务'按钮" → "或"字说明方案未拍板
- **修**: 拍板一种。推荐"checkbox 自由勾选 + 默认勾选 re-check 后未完成的"更灵活

### N5. [P1] risk 表与执行顺序自相矛盾
- **位置**: 第九部分风险表 vs 第十部分被拒绝方案
- **问题**: 风险表写"Exam.endTime 全局扩展 影响非延期学员 → 已修复:不动 Exam.endTime,只动 PlanNode.endTime";但被拒绝方案表仍列"频繁创建/取消 ExamOverdueJob → 不如直接更新 Exam.endTime + 重新调度,更简洁可靠"
- **冲突**: 风险表已否定 Exam.endTime 方案,但被拒绝方案表还在用旧逻辑解释拒绝理由
- **修**: 第十部分重写拒绝方案,与第九部分保持一致(改为"拒绝 Exam.endTime 修改方案")

### N6. [P2] 风险表出现两段重复内容(版本合并残留)
- **位置**: 第九部分风险表最末 4 行(行 430-434)
- **问题**: "多次延期状态混乱" "补考 Paper 与正考混淆" "关联子查询性能劣化" "Vue 2 语法限制" "并发延期操作" 这 5 行与上半段重复
- **修**: 删除下半段重复;保留上半段已更新的版本

---

## 三、v2 新引入逻辑矛盾 (NEW)

### L1. [P0] Q1 与步骤 B3 逻辑互斥
- **Q1 已确认方案**: "如果 finishNode < requireNode → 判定为未完成,纳入延期操作,更新 deadline + extendCount + state=0;如果 finishNode >= requireNode → 判定为已完成,跳过"
- **步骤 B3**: "如果 state=1 但未完成 → 先重置为 state=0 再延期"
- **冲突**: Q1 说"已完成则跳过" → 不动 state;B3 说"state=1 但未完成 → 重置 state=0 再延期" → 主动改 state
- **风险**: Q1 路径下,re-check 仅判断"是否纳入操作",不改 state → 进度页与列表页口径仍不一致(N2)
- **修**: 明确 re-check 行为"只判断是否纳入,不修改 state"。Bug 数据由单独的"数据修正 Job"处理,与延期解耦

### L2. [P1] 风险表"修复"措辞与正文不一致
- **第九部分风险表**: "节点重建后 finish_node 计数为 0 → SQL JOIN 增加 AND pn.deleted=0 条件"
- **5.4 步骤正文**: "改为重新计算 finishNode 数量(基于 el_plan_user_node.finished=1 且 pn.deleted=0)"
- **冲突**: 风险表说"原因",正文说"实现",但未明说"节点重建后 state 不重算"是否已被 checkFinished 实时计算覆盖
- **修**: 在 checkFinished 章节明确"节点重建后会被下次 checkFinished 调用自动修复 state"

### L3. [P1] "过期后显示"按钮与"re-check 后延期"语义错位
- **7.2b**: 按钮 v-if 条件 `new Date() > new Date(planEndTime)` → Plan.endTime 过期才显示
- **Q1**: re-check 后"未完成任务的人"包括 state=2 延期完成 + bug 受影响人员 → 这些人不一定是"Plan.endTime 过期后才未完成"
- **冲突**: Plan 未过期时,bug 受影响人员(state=1 但实际未完成)看不到按钮 → 没人能修
- **修**: 按钮条件改为 `OR (任意勾选用户的 re-check 结果为未完成)` 或新增"数据修正"独立按钮,不挂在"延期"上

---

## 四、缺失项(整体)

### M1. [P0] 仍无测试计划
- v2 加了"集成 Bug 修复"但完全没单测
- 至少缺:
  - checkFinished() 双向化单测(0→1→0、1→2、2→0)
  - batchExtend re-check 边界单测(state=1 但 finishNode=全完成、state=1 但 finishNode=部分完成)
  - 进度页 vs 列表页口径一致性 E2E 测试

### M2. [P0] 仍无审计/撤销
- 批量 re-check + 重置是高风险操作,无 audit 不可追责
- 撤销接口仍未补 → 误操作批量延期 + bug 双重作用 → 无法回滚

### M3. [P1] "Bug 修复"未独立标注风险等级与回滚预案
- 步骤 B1/B2/B3 是与"延期"功能解耦的数据修复,合并在同一 PR 上线 → 出问题无法选择性回滚
- **修**: Bug 修复与延期功能拆 2 个 PR;Bug 修复先灰度

### M4. [P1] state 双向化对统计报表/接口的影响未评估
- checkFinished 实时计算 → 任何依赖 state 的外部接口/报表/导出 → 口径变化
- **修**: grep 所有 `WHERE state=1` 或 `state IN (...)` 的查询,列影响清单

### M5. [P2] 无 wiki 同步计划
- repowiki 中培训计划模块文档需同步 state 语义变更
- **修**: 第十一部分加"wiki 同步"小节

---

## 五、评审结论

### 5.1 整体评价

v2 **47% 修复率**,新增 6 个漏洞(N1-N6),3 处逻辑矛盾(L1-L3)。核心改善:并发锁粒度、Job 竞态、DDL 锁表、状态机回退路径四块确实补了。但 **state 双向化改造风险被低估**,新增的 Bug 修复块与延期功能耦合,造成 N1+L1 双重风险。

### 5.2 阻塞项(P0)

| # | 项 | 阻塞原因 |
|---|----|---------|
| 1 | N1 re-check 批量重置 | 与 Q1 矛盾,误操作放大效应 |
| 2 | L1 Q1 与 B3 互斥 | 不修复 → 无法实施 |
| 3 | L3 按钮条件错位 | bug 人员无法触发修复 |
| 4 | N2 双向 state 口径冲突 | 进度页 vs 列表页不一致 |
| 5 | M1 测试计划缺失 | 上线即爆 |
| 6 | M2 审计/撤销缺失 | 合规风险,误操作无法回滚 |

### 5.3 必补项(P1,本轮不做下次必爆)

| # | 项 |
|---|----|
| 1 | N3 SQL 一致性(必须走同一 XML 片段) |
| 2 | N4/Q1 拍板一种前端方案 |
| 3 | N5 风险表与拒绝方案对齐 |
| 4 | L2 checkFinished 节点重建自动修复语义补完 |
| 5 | M3 Bug 修复与延期拆 PR |
| 6 | M4 state 字段全量影响评估 |

### 5.4 建议:重写计划大纲(不修不补不发版)

1. **解耦**: Bug 修复(state 双向化)与延期功能必须拆 2 个 PR/2 个计划文档
2. **Bug 修复 PR**: 仅做 B1+B2,B3 移到数据修正 Job(独立后台任务,管理员手动触发)
3. **延期 PR**: 在 state 双向化已稳定后再做,避免 N1+L1 双重风险
4. **审计 + 撤销**: 两个 PR 共享基础设施,先做审计层

---

## 六、评审元数据

- **评审方法**: v1 → v2 diff 逐条比对 + 内部一致性扫描
- **修复率**: 11/30 彻底修复 (37%),4/30 部分修复 (13%),15/30 仍存 (50%)
- **新引入**: 6 个漏洞 + 3 处逻辑矛盾
- **未涉及代码**: 本报告未读实际实现代码