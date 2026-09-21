# plan 补考/延期 — 考试记录 (el_exam_record) 跨 plan 共享 tryCount 技术债

## 现象
- `el_exam_record` 表存在 `plan_id` 字段,但所有写入路径都不填
- `countExam(userId, examId)` 不带 planId,跨 plan 全局共享 tryCount
- `chanceOverride` 在 `el_plan_makeup` 按 plan 区分,跟 tryCount 不一致 → 跨 plan 延期可能"次数超限"误报

## 现状(2026-09-17 排查确认)
- `ExamRecordServiceImpl.countExam` (第 157 行):按 (userId, examId) 全局
- `ExamRecordServiceImpl.increaseTryCount` (第 178 行):按 (userId, examId) 全局,**完全不带 planId**
- `ExamRecordServiceImpl.joinResult` (第 84 行):按 (userId, examId) 全局,planId 只用于 syncPlan
- `PlanUserServiceImpl.grantMakeup` (第 628-639 行):创建新 record,**未 setPlanId**

## 为什么没爆发(asda 计划验证)
- 业务上同 exam 跨多 plan 极少(asda 单 plan 场景下不触发)
- 单 plan 内 countExam 跟 plan_makeup.chanceOverride 数据一致

## 真修复工作清单(评估后没做)
需 8 处 Java 改动 + 业务影响评估:
1. `grantMakeup` 创建 record 时 setPlan_id
2. `joinResult` 加 planId 参数 + 按 (userId, examId, plan_id) 查重
3. `increaseTryCount` 加 planId 参数 + 按 (userId, examId, plan_id) 查重
4. `countExam` 加 planId 参数,plan_id=null 老数据 fallback
5. 业务确认:跨 plan 共享 exam 时,tryCount 是共享还是独立?
6. 老 el_exam_record 数据回填(plan_id=NULL 的)

## 风险
- 改 joinResult/increaseTryCount 影响**核心考试结算流程**,回归测试覆盖不足
- 老数据 plan_id=NULL,新逻辑分支多,边界 case 多

## 决定
**2026-09-17 暂不做**,记录为技术债。等专门迭代或生产真出现跨 plan 共享 exam 的 issue 时再做。

## 相关
- asda plan (id=2084860923533455361) 复现验证,unlockAllPlanNodes 已修
- [[plan-extend-补考延期-course解锁修复]] — 本次同会话内的兄弟修复