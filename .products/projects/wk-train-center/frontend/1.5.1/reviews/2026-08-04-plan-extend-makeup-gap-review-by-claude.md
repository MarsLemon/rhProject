# 一键延期+一键补考 — 计划文档漏洞评审报告

- **评审对象**: `.qoder/plans/一键延期补考功能_bdeb4088.md`
- **评审日期**: 2026-08-04
- **评审人**: Claude (主人委托)
- **评审范围**: 仅审核原计划内容,不蔓延

---

## 漏洞统计

| 级别           | 数量         | 说明                   |
| -------------- | ------------ | ---------------------- |
| P0             | 8            | 阻塞上线,必须修复      |
| P1             | 14           | 高风险,需设计阶段处理  |
| P2             | 8            | 体验/可维护性,建议修复 |
| **合计** | **30** | —                     |

---

## 1. 状态机漏洞 (P0)

### 1.1 state=2 延期完成后无回退路径

- **问题**: 计划只写"完成后根据 extendCount 设 state=1/2",未写 `state=2 → state=0` 的回退路径
- **场景**: 用户延期后完成(state=2),管理员再次发起延期 → state 不动?deadline 覆盖?
- **修**: `batchExtend` 加 `state IN (0, 2)` 过滤,延期后 state 回 0,extendCount 累加

### 1.2 deadline 字段无清理策略

- **问题**: state=2 后 deadline 字段保留,前端列表继续显示该时间
- **修**: state=2 时清空 deadline(已无业务意义)

### 1.3 chanceOverride 多次延期语义不明

- **问题**: 计划写 `chance_override = tryCount + addCount`,但第二次延期 addCount=2,tryCount 已变(补考 pass 后)→ 公式错
- **修**: `MAX(IFNULL(chance_override, Exam.chance), tryCount + addCount)`,或仅首次设置 chanceOverride

### 1.4 extendCount 不区分"补考触发"与"时间触发"

- **问题**: 5.4 "extendCount > 0 → state=2",但 enableMakeup=false 仅延期也是延期;反向仅补考不延期,extendCount 是否增?计划未写
- **修**: deadline 设置即 +1,纯补考 +0;或新增 `makeup_count` 字段区分

---

## 2. 并发/锁漏洞 (P0)

### 2.1 RedisLock 粒度太粗

- **问题**: key = `plan:extend:{planId}` → 同 plan 管理员 A/B 互相阻塞
- **修**: lock key 改 `plan:extend:{planId}:{userIdsHash}` 或 userId 维度分锁

### 2.2 Exam.endTime 全局延长副作用

- **问题**: `UPDATE el_exam SET end_time=newDeadline` 影响所有引用该 exam 的 plan
- **风险**: 其他 plan 的 Plan.endTime 也已过 → 那些用户突然"复活"
- **修**: Exam.endTime 不动,只动 PlanNode.endTime;或新增 PlanNode 级别 endTime(本来就该如此)

### 2.3 PlanNode.endTime 同样被多 plan 共享

- **问题**: 同一 Exam 在多个 PlanNode 出现,全部被 UPDATE
- **修**: 加 WHERE plan_id=? AND ref_id=? AND node_type='exam'(计划已写)→ 需校验 ref_id 是否唯一,否则只更新第一个

### 2.4 PlanExtendNotifyJob vs PlanPassNotifyJob 竞态

- **问题**: 用户在延期后立即 pass → 两个 Job 同时触发 → 通知重复/顺序错
- **修**: 通知 Job 加幂等键(userId+planId+triggerType),JobService 入队前查重

---

## 3. 业务逻辑漏洞 (P1)

### 3.1 is_makeup 标记位置语义待确认

- **问题**: 5.3 "tryCount > 0 标记 is_makeup=true",但 el_paper 是试卷还是答卷?
- **风险**: 若 Paper = 试卷模板 → tryCount 是无关字段 → bug
- **修**: 实施前确认 el_paper 实体语义(查实际代码);如错就改在 ExamRecord 标 is_makeup

### 3.2 补考范围与 PlanUser.state 不一致

- **问题**: 前端"勾选未完成人员"(state=0),但补考逻辑筛 ExamRecord.passed=false
- **场景**: 用户 state=0 但某考试已通过 → 补考范围 ≠ 勾选范围
- **修**: 后端按 ExamRecord.passed=false 二次过滤;前端预览明确显示"该考试以下用户需补考"

### 3.3 预览快照 vs 提交实时态漂移

- **问题**: A 预览 → B 在期间 pass → A 提交时数据已变
- **修**: 提交时 re-check ExamRecord.passed,差异提示用户

### 3.4 enableMakeup=false 时 Exam 校验冲突

- **问题**: 只延期 Exam.endTime → preCheck 放行,但 Exam 启动时仍校验自己的 endTime → 卡住
- **修**: Exam 启动校验时也认 PlanUser.deadline,或把 PlanNode.endTime 作为权威(不动 Exam.endTime)

### 3.5 ExamOverdueJob cronKey 与多 plan 冲突

- **问题**: jobName = `exam:overdue:{examId}` 单一 cron
- **风险**: 多 plan 引用同一 exam,各自的 PlanNode.endTime 不同 → 重调度只能设一个
- **修**: jobName 改 `exam:overdue:{examId}:{planId}` 或按 PlanNode.endTime 最小值

### 3.6 addCount=0 或无人员的考试过滤

- **问题**: DTO 说"addCount=0=跳过",7.3 说"自动跳过",但 service 层是否真做了过滤?没明说
- **修**: service 加 assert makeupExams 全部 addCount>0 且 unpassedUsers 非空,否则抛错或日志

---

## 4. 前端漏洞 (P1)

### 4.1 二级表头实现未说明

- **问题**: Element UI 二级表头靠 el-table-column 嵌套 + 固定 prop,动态列(项目数/完成项目)是否用 render-header?没写
- **修**: 7.2c 加 render-header 模板或表格结构示例

### 4.2 考试分数合并列懒加载策略

- **问题**: 翻页/筛选是否重拉?无缓存 key
- **修**: 以 (planId, examId, userId) 为缓存 key,翻页保留,筛选清空

### 4.3 勾选语义模糊

- **问题**: "勾选未完成人员" = 全表显示但 disabled 已完成?还是只显示未完成?
- **修**: planUserListReqDTO 默认 stateFilter=0(未完成),或前端 select 选择器过滤已选

### 4.4 通知文案/i18n 未设计

- **问题**: "延期完成" "补考 N 次" 文案是否走 i18n?模板占位符?
- **修**: el_msg 模板 + i18n key 列表在 4.3 节补充

---

## 5. 数据/迁移漏洞 (P0/P1)

### 5.1 DDL 未考虑锁表 (P0)

- **问题**: el_plan_user / el_exam / el_exam_record 都是大表,ADD COLUMN 可能锁表
- **修**: ALGORITHM=INSTANT(MySQL 8.0+) 或 pt-online-schema-change

### 5.2 现有 ExamRecord.chance_override 历史数据 (P1)

- **问题**: 旧数据 NULL → 走"全局值"分支 OK;但补考时 Exam.chance=1,addCount=2 → chanceOverride=2
- **风险**: tryCount 已存在记录时(非首次),公式重复累加 → bug
- **修**: `MAX(IFNULL(chance_override, Exam.chance), tryCount + addCount)` 或仅首次设置

### 5.3 state 字段类型未校验 (P1)

- **问题**: el_plan_user.state 当前类型?INT/TINYINT?
- **修**: 实施前确认;加 state=2 不需改类型,但需确认长度(INT 默认够)

### 5.4 is_makeup DEFAULT 0 与历史数据 (P1)

- **问题**: 旧答卷 is_makeup=0 默认被当作"正考" → OK
- **风险**: 未来"补考答卷"查询若漏 is_makeup=1 条件 → 数据不准

---

## 6. 权限/审计/撤销漏洞 (P0)

### 6.1 完全无审计日志

- **问题**: 谁延期、延了谁、延多久、补考几次 → 应落 audit_log
- **修**: batchExtend 内写 audit_log 表(操作人/时间/原值/新值)

### 6.2 无撤销/回滚机制

- **问题**: 误操作延期 → deadline 改不回去?extendCount 已 +1
- **修**: 加 `revertExtend(planId, userIds)` 接口,deadline=NULL,extendCount-1,但 audit 留痕

### 6.3 权限控制未设计

- **问题**: 谁能点"一键延期"?管理员=超管?普通管理员?
- **修**: 接口加 @RequiresPermissions("plan:extend")

---

## 7. 测试/文档/其他漏洞

### 7.1 测试计划完全缺失 (P0)

- **问题**: 单测/集成测试/E2E → 整个文档 0 字
- **修**: 第十一部分补:核心 Service 单测 + 状态机转换测试 + 前端组件测试

### 7.2 运维/DBA 通知缺失 (P1)

- **问题**: DDL 需通知 DBA 执行窗口;文档/操作手册未提更新
- **修**: 加 DBA 执行窗口 + 发版手册更新条目

### 7.3 国际化文案未设计 (P2)

- **见 4.4**

### 7.4 现有跨域耦合未审计 (P2)

- **问题**: domain-coupling-course-study-task 提到课程↔学习任务↔培训计划三方耦合
- **风险**: 延期是否触发课程级缓存更新?通知是否走既有 msg 模板?
- **修**: 列"跨域影响"小节,确认 notify/cache 路径

---

## 评审结论

**最大漏洞**:

1. **无测试计划** — 上线即爆
2. **无审计/撤销** — 误操作无法回滚,合规风险
3. **Exam.endTime 全局副作用只给弱缓解** — 影响其他 plan 用户

**建议**: 在批次1(DDL)之前先补:

- 1.1 状态机回退路径
- 2.2/2.3 Exam.endTime 与 PlanNode.endTime 冲突的最终方案
- 6.1/6.2 审计 + 撤销接口
- 7.1 测试用例列表(至少核心 Service 单测覆盖)

---

## 评审元数据

- **评审方法**: 静态文档审核 + 上下文经验检索
- **检索范围**: `.qoder/plans/` + `.qoder/repowiki/zh/content/` + `Thinkpad/22-entities-实体档案/agent-经验库/`
- **检索结果**: 无延期/补考/chance/deadline/is_makeup 相关历史经验 → 本次评审基于文档内部逻辑
- **未涉及代码**: 本报告未读实际实现代码(避免蔓延),3.1 is_makeup 标记位置等需在实施前查代码确认
