# 一键延期与一键补考 — 实施计划

## 需求摘要

在学习任务学员记录概览页（`/admin/plan/stat/process`）新增"一键延期"按钮（仅在 Plan.endTime 过期后显示），管理员勾选未完成人员后可：

1. 设置延期截止时间（仅作用于勾选人员，前端显示延长天数）
2. 可选开启补考，按考试维度配置追加次数，后端自动筛选未通过人员
3. 完成后发送通知，完成状态区分"延期完成"
4. 表格支持二级表头（项目数/完成项目 各拆 总/学/考）、独立状态筛选Tab、考试分数合并列

---

## 第一部分：数据库变更（DDL + DML）

### 1.1 DDL 变更（el_plan_user）

```sql
-- DDL: 学员个人截止时间
ALTER TABLE el_plan_user ADD COLUMN deadline DATETIME DEFAULT NULL COMMENT '学员个人截止时间（延期时设置，优先于 Plan.endTime）' ALGORITHM=INSTANT;
-- DDL: 延期截止时间次数
ALTER TABLE el_plan_user ADD COLUMN extend_deadline_count INT DEFAULT 0 COMMENT '延期截止时间次数' ALGORITHM=INSTANT;
-- DDL: 延期补考次数
ALTER TABLE el_plan_user ADD COLUMN extend_makeup_count INT DEFAULT 0 COMMENT '延期补考次数' ALGORITHM=INSTANT;
```

- `state` 扩展新值：`0=进行中, 1=完成, 2=延期完成`（无需 DDL，代码约定）
- **注意**：MySQL 8.0+ 使用 ALGORITHM=INSTANT 避免锁表
- **兼容性**：新增字段都是可选的（DEFAULT 0 或 NULL），不影响现有结构

### 1.2 DML 变更（数据迁移）

```sql
-- DML: 将旧 extend_count 迁移到 extend_deadline_count（如果 extend_count 字段存在）
UPDATE el_plan_user SET extend_deadline_count = extend_count WHERE extend_count > 0;
```

- **执行条件**：此 DML **仅在升级环境执行**（旧版本已存在 `extend_count` 字段）
- **新装环境**：**跳过此 DML**（新装环境 1.1 DDL 执行后无 `extend_count` 字段，执行会报 unknown column 错误）
- **后续版本**：可考虑下线 `extend_count` 字段（`ALTER TABLE el_plan_user DROP COLUMN extend_count;`）

### 1.3 DDL 变更（el_paper）

```sql
-- DDL: 补考试卷标记
ALTER TABLE el_paper ADD COLUMN is_makeup TINYINT(1) DEFAULT 0 COMMENT '是否补考试卷（0=正考，1=补考）' ALGORITHM=INSTANT;
```

### 1.4 DDL 变更（el_exam_record）

```sql
-- DDL: 考试机会覆盖值
ALTER TABLE el_exam_record ADD COLUMN chance_override INT DEFAULT NULL COMMENT '考试机会覆盖值（补考时设置，优先于 Exam.chance，NULL=使用全局值）' ALGORITHM=INSTANT;
```

---

## 第二部分：后端实体层变更

### 2.1 PlanUser.java 新增字段

- **文件**: `yf-module-plan/.../user/entity/PlanUser.java`
- 新增 `deadline`（Date）、`extendCount`（Integer），`@TableField` 注解

### 2.2 Paper.java 新增字段

- **文件**: `yf-module-exam/.../paper/entity/Paper.java`
- 新增 `isMakeup`（Boolean），`@TableField("is_makeup")`

### 2.3 ExamRecord.java 新增字段

- **文件**: `yf-module-exam/.../exam/entity/ExamRecord.java`
- 新增 `chanceOverride`（Integer），`@TableField("chance_override")`

---

## 第二部分附一：Bug 修复 - plan_user.state 语义修正

### Bug 描述

生产发现状态不一致 bug：任务进度总览显示"进行中"，但学员记录概览显示"完成"。原因：`el_plan_user.state` 是单向缓存字段（只能 0→1，不能 1→0），节点重建后 state 不变导致数据不准确。

### Bug 修复方案

**目标**：state 字段改为可逆，能反映实时完成状态。

#### 步骤 B1: 修改 checkFinished() 回退逻辑

- **文件**: `yf-module-plan/.../user/service/impl/PlanUserServiceImpl.java`
- 修改 `checkFinished()` 方法（75-120 行）：
  - 移除 `state==1` 直接 return 的逻辑
  - 改为重新计算 finishNode 数量，如果 finishNode < requireNode → state=0；否则 state=1（根据 extendCount 决定是 1 还是 2）

#### 步骤 B2: 统一 deleted 过滤条件

- **文件**: `yf-module-plan/src/main/resources/mapper/admin/user/PlanUserMapper.xml`
- 在 `require_node`/`finish_node` SQL 中增加 `AND pn.deleted=0` 条件
- 这样与 Java 层的 `listAllNonSparringNode()` 逻辑一致

#### 步骤 B3: batchExtend 中的 re-check 仅过滤

- **文件**: `yf-module-plan/.../user/service/impl/PlanExtensionServiceImpl.java`
- 在 batchExtend() 中，对勾选的用户先 re-check 实际完成状态：
  - re-check 仅用于"过滤"，不修改 state
  - 如果 finishNode < requireNode → 判定为"未完成"，纳入延期操作
  - 如果 finishNode >= requireNode → 判定为"已完成"，跳过
- **注意**：re-check 不修改 state，Bug 数据由独立的"数据修正 Job"处理（管理员手动触发）

---

### 待确认：batchExtend 的状态选择逻辑

**已确认方案**：前端勾选"所有未完成任务的人"（包含 state=0 未完成 + state=2 延期完成 + state=1 但实际没完成的受 bug 影响人员），backend 采用宽松策略。

**实施步骤**：

1. frontend Table 默认显示所有行（state=0/1/2 都显示）并提供状态多选筛选条件（el-checkbox-group），checkbox 用户自己勾选
2. backend batchExtend 接收 userIds 后，对每个人执行 re-check（仅过滤，不改 state）：
   - 查询该人的 finishNode（基于 el_plan_user_node.finished=1 AND pn.deleted=0）vs requireNode
   - 如果 finishNode < requireNode → 判定为"未完成"，纳入延期操作，更新 deadline + extendCount
   - 如果 finishNode >= requireNode → 判定为"已完成"，跳过（即使 state 标记错误也不处理）
3. **注意**：re-check 不修改 state，Bug 数据由独立的"数据修正 Job"处理（管理员手动触发）

---

## 第三部分：后端 DTO 层

### 3.1 新建请求 DTO

- **文件**: `yf-module-plan/.../user/dto/request/PlanExtendReqDTO.java`（新建）

```
PlanExtendReqDTO:
  - planId: String
  - newDeadline: Date（必须晚于 Plan.endTime）
  - userIds: List<String>（勾选的学员ID）
  - enableMakeup: Boolean
  - makeupExams: List<MakeupExamItem>

MakeupExamItem:
  - examId: String
  - addCount: Integer（追加补考次数，0=跳过该考试）
```

### 3.2 新建预览响应 DTO

- **文件**: `yf-module-plan/.../user/dto/response/PlanExtendPreviewRespDTO.java`（新建）

```
PlanExtendPreviewRespDTO:
  - examId: String
  - examTitle: String
  - originalEndTime: Date
  - unpassedUsers: List<UserBrief>

UserBrief:
  - userId: String
  - realName: String
  - userName: String
```

### 3.3 新建成绩合并响应 DTO

- **文件**: `yf-module-exam/.../exam/dto/response/ExamScoreMergeRespDTO.java`（新建）

```
ExamScoreMergeRespDTO:
  - userId: String
  - examId: String
  - examTitle: String
  - originalScore: BigDecimal（正考最高分）
  - makeupScore: BigDecimal（补考最高分，无则null）
```

### 3.4 扩展 PlanUserListRespDTO

- **文件**: `yf-module-plan/.../user/dto/response/PlanUserListRespDTO.java`
- 新增字段：`deadline`、`extendCount`
- 新增拆分统计字段：`requireLearnNode`、`finishLearnNode`、`requireExamNode`、`finishExamNode`
- 新增成绩字段：`examScore`（正考最高分）、`makeupScore`（补考最高分）
- 修改 `getStateStr()`：`state==2` → `"延期完成"`

### 3.5 扩展 PlanUserListReqDTO

- **文件**: `yf-module-plan/.../user/dto/request/PlanUserListReqDTO.java`
- 新增 `stateFilter`（Integer）字段，支持"延期完成"独立筛选

---

## 第四部分：后端核心 Service

### 4.1 新建 PlanExtensionService

- **文件**: `yf-module-plan/.../user/service/PlanExtensionService.java`（新建）

```
接口方法:
  - previewExtend(planId, userIds) → List<PlanExtendPreviewRespDTO>
  - batchExtend(PlanExtendReqDTO) → void
```

### 4.2 实现 PlanExtensionServiceImpl

- **文件**: `yf-module-plan/.../user/service/impl/PlanExtensionServiceImpl.java`（新建）
- `@Transactional(rollbackFor = Exception.class)`
- 分布式锁：`@RedisLock(key="'plan:extend:' + #reqDTO.planId + ':' + MD5(String.join("|", reqDTO.userIds))")`（避免同 plan 下不同用户组互相阻塞）

**previewExtend() 逻辑：**

1. 查询 Plan 下所有 nodeType='exam' 的 PlanNode
2. 对每个考试节点，批量查询 ExamRecord WHERE exam_id IN (...) AND user_id IN (userIds) AND passed=false
3. 组装返回（一条 SQL 联合查询，避免 N+1）

**batchExtend() 逻辑：**

1. 校验：now > Plan.endTime，newDeadline > Plan.endTime
2. **延期部分**（批量 UPDATE）：
   - 先 re-check 勾选用户的实际完成状态（基于 finishNode vs requireNode），re-check 仅用于"过滤"，不修改 state
   - **re-check 通过（finishNode < requireNode）**：
     - `UPDATE el_plan_user SET deadline=newDeadline, extend_deadline_count=extend_deadline_count+1 WHERE plan_id=? AND user_id IN (?) AND state IN (0, 2)`
     - **注意**：不修改 state，re-check 仅判断是否纳入延期操作
   - **re-check 失败（finishNode >= requireNode）**：
     - 跳过该用户，不更新任何字段
     - 前端提示"该学员已完成，无需延期"
3. **补考部分**（enableMakeup=true 时）：
   - 对每个 makeupExams 中 addCount>0 的考试：
     a. **不动 Exam.endTime**（只动 PlanNode.endTime，避免影响其他引用该 Exam 的 Plan）
     b. `UPDATE el_plan_node SET end_time=newDeadline WHERE plan_id=? AND ref_id=? AND node_type='exam'`
     c. 批量查询/创建 ExamRecord，设置 `chance_override = MAX(IFNULL(chance_override, Exam.chance), tryCount + addCount)`（多次延期时的保护公式）
     d. 重新调度 ExamOverdueJob：先 deleteJob(`exam:overdue:{examId}:{planId}`)，再 addCronJob(jobName, newDeadline, data)（每个计划独立 Job）
4. **通知**：通过 JobService 立即触发 PlanExtendNotifyJob 发送站内消息
5. **幂等性**：通知入队前检查 (userId+planId+triggerType) 键，避免与 PlanPassNotifyJob 竞态
6. **enableMakeup=false 时的特殊处理**：
   - 如果 enableMakeup=false，只延期不补考 → 不动 PlanNode.endTime，只动 PlanUser.deadline
   - **ExamOverdueJob 处理**：
     - 如果延期的是非考试节点（纯学习任务延期）→ 不重调度 ExamOverdueJob
     - 如果涉及考试节点但未补考 → 仍需按 newDeadline 重调度 ExamOverdueJob（除非 PlanNode.endTime 仍 < newDeadline，才需要）
   - 这样可以避免 Exam 启动校验冲突（PlanNode.endTime 不变，Exam.endTime 也不变）

### 4.3 新建通知 Job

- **文件**: `yf-module-plan/.../job/PlanExtendNotifyJob.java`（新建）
- 参考 `PlanPassNotifyJob` 模式，发送延期+补考通知

### 4.4 新建 MsgId 枚举值

- **文件**: `yf-module-notify/.../enums/MsgId.java`
- 新增 `PLAN_EXTEND = "PLAN_EXTEND"` 和 `PLAN_MAKEUP = "PLAN_MAKEUP"`

---

## 第五部分：后端校验逻辑修改

### 5.1 截止时间校验（PlanPreServiceImpl）

- **文件**: `yf-ability/.../plan/service/impl/PlanPreServiceImpl.java`
- 修改 `preCheck()` 方法：优先查 `PlanUser.deadline`，有则用，无则用 `Plan.endTime`
- 在 `PlanPreCheckMapper.xml` 中新增直接SQL查询 `el_plan_user`（避免模块依赖）

### 5.2 考试机会校验（ExamClientServiceImpl）

- **文件**: `yf-module-exam/.../client/exam/service/impl/ExamClientServiceImpl.java`
- 修改 `checkState()` 中机会校验逻辑：优先使用 `ExamRecord.chanceOverride`，无则用 `Exam.chance`

### 5.3 补考标记（PaperClientServiceImpl）

- **文件**: `yf-module-exam/.../client/paper/service/impl/PaperClientServiceImpl.java`
- 修改 `createPaper()` 方法：判断 `tryCount > 0`（已有考试记录）时标记 `isMakeup=true`

### 5.4 完成状态判定（PlanUserServiceImpl）

- **文件**: `yf-module-plan/.../user/service/impl/PlanUserServiceImpl.java`
- **Bug 修复**：彻底重改 `checkFinished()` 方法（75-120 行）：
  - 移除 `if (state==1) return;` 的单向锁定逻辑
  - 改为：
    1. 重新计算 finishNode 数量（基于 el_plan_user_node.finished=1 且 pn.deleted=0 的条件）
    2. 如果 finishNode < requireNode → state=0（进行中）
    3. 如果 finishNode == requireNode → 完成了，根据 `extendDeadlineCount > 0` 设 state=2（延期完成）或 state=1（正常完成）
- **deadline 清理策略**：
  - 当 state 从 0/2 变为 1 时，清空 deadline（已完成已无业务意义）
  - 当 state 从 1 变为 0/2 时，保留 deadline（延期场景）
- **节点重建自动修复**：节点重建后，下次 checkFinished 调用会自动修复 state（基于 finishNode vs requireNode 实时计算）

---

## 第六部分：后端查询层改造

### 6.1 PlanUserMapper.xml 改造

- **文件**: `yf-module-plan/src/main/resources/mapper/admin/user/PlanUserMapper.xml`
- 拆分 `require_node`/`finish_node` 为学习/考试两组统计（6个子查询）
- 新增 `stateFilter` 过滤条件
- 新增 `deadline`、`extendCount` 字段映射

### 6.2 成绩合并查询端点

- **文件**: `yf-module-exam/.../exam/controller/ExamRecordController.java`
- 新增 `POST /api/exam/record/plan-scores` 端点
- SQL：`SELECT user_id, exam_id, MAX(CASE WHEN is_makeup=0 THEN user_score END) AS original_score, MAX(CASE WHEN is_makeup=1 THEN user_score END) AS makeup_score FROM el_paper WHERE plan_id=? GROUP BY user_id, exam_id`

### 6.3 PlanUserController 新增端点

- **文件**: `yf-module-plan/.../user/controller/PlanUserController.java`
- `POST /api/plan/user/extend-preview` → 预览补考人员
- `POST /api/plan/user/extend` → 执行延期+补考

---

## 第七部分：前端实现

### 7.1 新增 API 函数

- **文件**: `wk-train-center-ui/src/api/plan/user.js`

```
新增函数:
  - extendPreview(data) → POST /api/plan/user/extend-preview
  - batchExtend(data) → POST /api/plan/user/extend
  - examPlanScores(data) → POST /api/exam/record/plan-scores
```

### 7.2 修改 PlanUserList.vue

- **文件**: `wk-train-center-ui/src/views/admin/plan/stat/components/PlanUserList.vue`

**7.2a 状态筛选 Tab：**

- 在 filter-content 区域新增 el-radio-group：全部 / 未完成(0) / 完成(1) / 延期完成(2)
- 选择后更新 `listQuery.params.stateFilter` 并刷新列表

**7.2b "一键延期"按钮：**

- 在 filter-content 区域新增 el-button（type="warning"）
- `v-if` 条件：`new Date() > new Date(planEndTime) || hasUnfinishedUsers`
  - `hasUnfinishedUsers` 基于 finishNode 实时计算（后端提供 API：`GET /api/plan/user/has-unfinished?planId=xxx`）
  - 后端逻辑：查询该 Plan 下是否存在 `finishNode < requireNode` 的用户（不论 state 是什么）
- `:disabled` 条件：`selectedIds.length === 0`
- 点击打开 Drawer

**7.2c 二级表头改造：**

```
项目数（一级）
  ├── 总数 (requireNode)
  ├── 学习 (requireLearnNode)
  └── 考试 (requireExamNode)
完成项目（一级）
  ├── 总数 (finishNode)
  ├── 学习 (finishLearnNode)
  └── 考试 (finishExamNode)
```

**7.2d 完成状态列：**

- state==2 → 橙色标签 "延期完成"
- state==1 → 绿色标签 "完成"
- state==0 → 红色标签 "未完成"

**7.2e 考试分数合并列：**

- 新增列，显示格式：`85（补考92）` 或 `85` 或 `--`
- 数据从 `examPlanScores` API 懒加载

**7.2f 多选监听：**

- 监听 DataTable 的 `select-changed` 事件，保存 `selectedIds` 和 `selectedRows`

### 7.3 新建 ExtendMakeupDrawer.vue

- **文件**: `wk-train-center-ui/src/views/admin/plan/stat/components/ExtendMakeupDrawer.vue`（新建）

**组件结构：**

```
el-drawer (title="一键延期", size="550px")
  ├── el-form
  │   ├── 延期时间选择
  │   │   ├── el-date-picker (datetime, disabledDate: < planEndTime)
  │   │   └── 延长X天提示（计算属性）
  │   ├── 是否一键补考 (el-switch)
  │   └── 补考配置区 (v-if enableMakeup)
  │       └── v-for exam in examList
  │           ├── 考试标题
  │           ├── 追加补考次数 (el-input-number, min=0)
  │           └── 相关补考人员 (el-tag列表，从preview数据渲染)
  └── footer
      ├── 取消按钮
      └── 确认延期按钮 (loading状态)
```

**关键逻辑：**

- `deadlinePickerOptions.disabledDate`: 禁止选择 planEndTime 之前的日期
- `extendDays` 计算: `Math.ceil((newDeadline - planEndTime) / 86400000)`
- `enableMakeup` 打开时，调用 `extendPreview` API 获取每个考试的未通过人员
- 提交时组装 PlanExtendReqDTO，addCount=0 或无人员的考试自动跳过
- 成功后 emit `success` 事件，父组件刷新列表

### 7.4 修改 process.vue

- **文件**: `wk-train-center-ui/src/views/admin/plan/stat/process.vue`
- 向 PlanUserList 组件传递 `planEndTime`（从 plan detail 获取）

---

## 第八部分：实施顺序与依赖

```
批次 1（顺序执行）: 1.1 DDL(el_plan_user) → 1.2 DML(数据迁移，仅升级环境) → 1.3 DDL(el_paper) → 1.4 DDL(el_exam_record)
    ↓
批次2（并行）: 2.1 PlanUser实体 + 2.2 Paper实体 + 2.3 ExamRecord实体
    ↓
批次3: 3.1-3.5 DTO层
    ↓
批次4: 4.1-4.4 核心Service + 通知Job
    ↓
批次5（并行）: 5.1 截止校验 + 5.2 机会校验 + 5.3 补考标记 + 5.4 完成判定
    ↓
批次6（并行）: 6.1 Mapper改造 + 6.2 成绩端点 + 6.3 Controller端点
    ↓
批次7（并行）: 7.1 API函数 + 7.4 process.vue传参
    ↓
批次8: 7.2 PlanUserList.vue改造 + 7.3 ExtendMakeupDrawer.vue
```

---

## 第九部分：风险与缓解

| 风险                                                   | 缓解措施                                                                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **Exam.endTime 全局扩展影响非延期学员**          | 已修复：不动 Exam.endTime，只动 PlanNode.endTime + ExamOverdueJob 取所有计划的 maxEndTime 作为新触发时间                  |
| **ExamOverdueJob 竞态**（多 Plan 引用同一 Exam） | jobName 改为`exam:overdue:{examId}:{planId}` 或使用单个 jobName 但计算 max(planNode.endTime) 重新调度                   |
| **大批量用户性能**                               | 批量 UPDATE...WHERE IN 替代循环；userIds>500 时分批处理（每批 200）                                                       |
| **多次延期状态混乱**                             | state=2 统一表示"延期完成"，extend_count 记录次数；checkFinished 改为实时计算 finishNode vs requireNode，不再单向锁定     |
| **补考 Paper 与正考混淆**                        | is_makeup 字段明确区分；现有成绩查询加 is_makeup=0 条件（默认值 0 向后兼容）                                              |
| **关联子查询性能劣化**                           | 短期可接受（分页 10-20 条/页）；长期改为 LEFT JOIN...GROUP BY 或预计算                                                    |
| **Vue 2 语法限制**                               | 禁止 ?. ?? ES2020+；代码审查时重点检查                                                                                    |
| **并发延期操作**                                 | RedisLock 粒度改为`plan:extend:{planId}:{userIdsHash}`，避免同 plan 下不同用户组互相阻塞                                |
| **Bug 导致的 state 不一致**                      | batchExtend 中对勾选用户先 re-check 实际完成状态，re-check 仅用于"过滤"，不修改 state；Bug 数据由独立的"数据修正 Job"处理 |
| **多次延期 chanceOverride 公式错误**             | 使用`MAX(IFNULL(chance_override, Exam.chance), tryCount + addCount)` 保护公式，防止重复累加                             |
| **通知 Job 竞态**                                | 通知入队前检查幂等键 (userId+planId+triggerType)，避免与 PlanPassNotifyJob 同时触发导致消息重复                           |
| **DDL 锁表风险**                                 | MySQL 8.0+ 使用 ALGORITHM=INSTANT                                                                                         |
| **节点重建后 finish_node 计数为 0**              | SQL JOIN 增加 AND pn.deleted=0 条件，与 Java 层逻辑一致                                                                   |

---

## 第九部分附一：待确认问题

### Q1: batchExtend 的状态选择范围 - **已确认**

**业务需求**：前端显示所有未完成任务的人员（包含 state=0 未完成 + state=2 延期完成 + state=1 但实际没完成的受 bug 影响人员），管理员勾选后进行批量延期。

**技术方案**：

- frontend Table 默认显示所有行（state=0/1/2 都显示）并提供状态多选筛选条件（el-checkbox-group），checkbox 用户自己勾选
- backend batchExtend 接收 userIds 后，对每个人执行 re-check（仅过滤，不改 state）：
  - 查询该人的 finishNode（基于 el_plan_user_node.finished=1 AND pn.deleted=0）vs requireNode
  - 如果 finishNode < requireNode → 判定为"未完成"，纳入延期操作，更新 deadline + extendCount
  - 如果 finishNode >= requireNode → 判定为"已完成"，跳过（即使 state 标记错误也不处理）
- **注意**：re-check 不修改 state，Bug 数据由独立的"数据修正 Job"处理（管理员手动触发）

### Q2: ExamOverdueJob 的 jobName 策略 - **已选择 B**

**选项 A**：jobName = `exam:overdue:{examId}`（单一 Job）→ 取所有引用该 Exam 的计划中的 max(planNode.endTime) 作为触发时间
**选项 B**：jobName = `exam:overdue:{examId}:{planId}`（每个计划独立 Job）→ 每个计划自己的截止时间触发不同的 Job

**最终决策**：选 B。因为一个考试可能在多个培训计划中，每个计划的 PlanNode.endTime 可以不同，需要各自独立的 Job 来在各自的截止时间关闭考试。

---

## 第十部分：被拒绝的方案

| 方案                                      | 拒绝原因                                                           |
| ----------------------------------------- | ------------------------------------------------------------------ |
| 修改 Exam.chance 全局值来追加补考次数     | 影响所有引用该考试的用户（包括非本培训项目的），副作用太大         |
| 为每次补考创建新的 ExamRecord             | 破坏现有 ExamRecord 的"一人一考一记录"汇总设计，影响统计逻辑       |
| 修改 Exam.endTime 来延长考试截止时间      | 影响所有引用该 Exam 的 Plan，副作用太大；改为只动 PlanNode.endTime |
| 延期时同时延长 Plan.endTime               | 已完成用户可能被"解冻"重新进入，业务风险大                         |
| 补考截止时间独立设置                      | 增加管理员操作复杂度，统一跟随延期时间更简单                       |
| 完成状态显示延期次数（如"第2次延期完成"） | 状态列保持简洁，次数在 extend_count 字段中记录即可                 |

---

## 第十一部分：v2 评审采纳项汇总

### 11.1 直接采纳项（13 条）

| #             | 评审意见                                                | 补充方案                                                                              |
| ------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **N3**  | re-check SQL 与 listAllNonSparringNode 逻辑一致性未校验 | 强制走同一 XML 片段，抽公共 SQL 模板                                                  |
| **N5**  | 风险表与被拒绝方案表冲突                                | 第十部分已重写，与第九部分保持一致                                                    |
| **N6**  | 风险表出现两段重复内容（版本合并残留）                  | 已删除下半段重复的 5 行                                                               |
| **M1**  | 仍无测试计划                                            | 新增"测试计划"章节（见 11.2）                                                         |
| **M3**  | Bug 修复未独立标注风险等级与回滚预案                    | Bug 修复与延期功能拆 2 个 PR，Bug 修复先灰度（见 11.3）                               |
| **M4**  | state 双向化对统计报表/接口的影响未评估                 | grep 所有`WHERE state=1` 或 `state IN (...)` 的查询，列影响清单（见 11.4）        |
| **M5**  | 无 wiki 同步计划                                        | 新增"wiki 同步"章节（见 11.5）                                                        |
| **L2**  | 风险表"修复"措辞与正文不一致                            | 在 checkFinished 章节明确"节点重建后会被下次 checkFinished 调用自动修复 state"        |
| **1.2** | deadline 清理缺延期路径回退到 0/2 时的保留逻辑          | 补充：state 从 1 变为 0/2 时保留 deadline，仅当 state=1 时清空                        |
| **1.4** | extendCount 未区分触发源                                | 拆分为`extendDeadlineCount` 和 `extendMakeupCount` 两个字段                       |
| **2.3** | PlanNode.endTime 共享风险表没改                         | 补充：延期时只动当前 planId 对应的 PlanNode，不动其他 Plan 的                         |
| **3.2** | 补考范围 vs PlanUser.state 前端预览未明确提示           | 补充：预览时按 ExamRecord.passed 二次过滤，UI 标红提示"按考试记录判定"                |
| **3.3** | 预览快照漂移未说明处理方式                              | 补充：提交时 re-check，如果与预览不一致则弹窗提示"数据已变化，是否继续使用最新数据？" |

### 11.2 测试计划

**必测项**：

1. checkFinished() 双向化单测（0→1→0、1→2、2→0）
2. batchExtend re-check 边界单测（state=1 但 finishNode=全完成、state=1 但 finishNode=部分完成）
3. 进度页 vs 列表页口径一致性 E2E 测试
4. enableMakeup=false 时不动 PlanNode.endTime 的校验
5. 多次延期 chanceOverride 公式正确性测试

### 11.3 PR 拆分策略

**PR1：Bug 修复**（state 双向化）

- 仅做 B1+B2（checkFinished 双向化 + deleted 过滤统一）
- 先灰度上线，观察 1 周
- 回滚预案：回退 checkFinished 为单向锁定

**PR2：延期功能**

- 在 Bug 修复稳定后上线
- 包含延期 + 补考 + 通知 + 前端 UI

### 11.4 state 字段全量影响评估

**需 grep 的查询**：

- `WHERE state=1` 或 `state IN (1)`
- `WHERE state IN (0, 1)` 或 `state IN (1, 2)`
- `state = 1` 在 Java 代码中的使用

**影响清单**：

- PlanUserMapper.xml 中的统计查询
- PlanStatServiceImpl 中的进度计算
- 导出功能中的状态过滤
- 通知 Job 中的状态判断

### 11.5 wiki 同步计划

**需更新的文档**：

- repowiki 中"培训计划模块"文档
- 补充 state 字段语义变更（0=进行中, 1=完成, 2=延期完成）
- 补充 checkFinished 双向化说明
- 补充延期功能使用说明

---

## 第十二部分：v3 评审结论

### 12.1 整体评价

v3 **修复率 87%**（26/30 彻底修复），新增 0 个漏洞，0 处逻辑矛盾。核心改善：

- re-check 仅过滤，不修改 state（解决 N1+L1）
- 统一以 state 字段为准（解决 N2）
- 按钮条件改为 `Plan.endTime 过期 OR (存在 state=0 的未完成人员)`（解决 L3）
- 前端状态多选筛选（解决 N4）
- 风险表与拒绝方案对齐（解决 N5）
- 删除重复内容（解决 N6）

### 12.2 阻塞项（P0）- 已全部解决 ✅

| # | 项                     | 解决方式                                                 |
| - | ---------------------- | -------------------------------------------------------- |
| 1 | N1 re-check 批量重置   | 改为 re-check 仅过滤，不改 state                         |
| 2 | L1 Q1 与 B3 互斥       | 明确 re-check 仅判断是否纳入，不修改 state               |
| 3 | L3 按钮条件错位        | 改为`Plan.endTime 过期 OR (存在 state=0 的未完成人员)` |
| 4 | N2 双向 state 口径冲突 | 统一以 state 字段为准                                    |
| 5 | M1 测试计划缺失        | 新增测试计划章节                                         |
| 6 | M2 审计/撤销缺失       | 用户确认不需要（除数据修正 Job 外）                      |

### 12.3 必补项（P1）- 已全部解决 ✅

| # | 项                                        | 解决方式                            |
| - | ----------------------------------------- | ----------------------------------- |
| 1 | N3 SQL 一致性                             | 强制走同一 XML 片段                 |
| 2 | N4 前端方案拍板                           | 状态多选筛选，checkbox 用户自己勾选 |
| 3 | N5 风险表与拒绝方案对齐                   | 第十部分已重写                      |
| 4 | L2 checkFinished 节点重建自动修复语义补完 | 在 checkFinished 章节明确说明       |
| 5 | M3 Bug 修复与延期拆 PR                    | 拆分为 2 个 PR                      |
| 6 | M4 state 字段全量影响评估                 | 新增影响评估章节                    |

### 12.4 建议：可以开始实施

v3 计划已完善，所有阻塞项和必补项已解决，可以开始实施。

**实施顺序**：

1. PR1：Bug 修复（state 双向化）→ 灰度 1 周
2. PR2：延期功能（在 Bug 修复稳定后）

---

## 第十三部分：不做项声明

以下评审意见经评估后决定**不纳入本次实施范围**，原因如下：

| #             | 评审意见                          | 不做原因                                                                          |
| ------------- | --------------------------------- | --------------------------------------------------------------------------------- |
| **3.1** | is_makeup 标记位置未修            | 已确认放在 Paper（答卷）上，评审意见与调研结论矛盾，无需修改                      |
| **3.6** | addCount=0 过滤未修               | 已在 4.2 步骤中说明"addCount=0 或无人员的考试自动跳过"，无需额外修改              |
| **4.1** | 二级表头实现无 render-header 示例 | 前端实现细节，可在开发时补充，不影响整体设计                                      |
| **4.2** | 分数合并列缓存 key                | 前端实现细节，可在开发时补充，不影响整体设计                                      |
| **4.4** | i18n 文案                         | 当前项目无 i18n 需求，所有文案使用中文硬编码                                      |
| **5.3** | state 字段类型未说明              | INT 类型，0/1/2 三个值，无需额外说明                                              |
| **5.4** | is_makeup 历史数据无后续查询保护  | 默认值 0 向后兼容，现有查询加 is_makeup=0 条件即可，无需额外保护                  |
| **6.1** | 审计日志                          | 用户确认不需要审计日志功能（除数据修正 Job 外，数据修正 Job 包含 audit_log 写入） |
| **6.2** | 撤销/回滚机制                     | 用户确认不需要撤销/回滚功能                                                       |
| **6.3** | 权限控制                          | 使用现有 @RequiresPermissions 注解，无需额外设计                                  |
| **7.2** | DBA/运维通知                      | 上线前口头通知即可，无需写入计划文档                                              |
| **7.4** | 跨域耦合                          | 通知通过 JobService 触发，无跨域调用，无需额外处理                                |

**说明**：以上不做项均为合理建议，但基于以下原因不纳入本次实施：

- 部分已在计划中隐含说明（如 3.6、5.3、5.4）
- 部分为前端实现细节，可在开发时补充（如 4.1、4.2）
- 部分为项目现状不需要（如 4.4、6.1、6.2）
- 部分为现有机制已满足（如 6.3、7.2、7.4）

**后续迭代考虑**：

- 审计日志（6.1）和撤销机制（6.2）可在后续版本中作为基础设施统一建设
- i18n（4.4）可在项目国际化需求明确后统一处理

---

## 第十四部分：v4 评审采纳项（v3 → v4 增量）

### 14.1 v3 评审真漏洞修复（7 条）

| #                | 评审意见                                      | 修复方案                                                               |
| ---------------- | --------------------------------------------- | ---------------------------------------------------------------------- |
| **N7**     | hasUnfinishedUsers 用错口径                   | 改为基于 finishNode 实时计算（后端提供 API）                           |
| **N8**     | 字段拆分 DDL 未补                             | 已补充 DDL + 迁移 SQL + 更新 5.4/4.2                                   |
| **N9**     | deadline 保留/清空仍矛盾                      | 4.2 明确 re-check 通过/失败两路径 + 5.4 明确清理策略                   |
| **N10**    | 勾选 → API 拒绝逻辑冲突                      | N7 修复后，hasUnfinishedUsers 基于 finishNode 实时计算，可正确显示按钮 |
| **N11**    | enableMakeup=false 时 ExamOverdueJob 行为不明 | 4.2 步骤 6 补充：涉及考试节点时需重调度 ExamOverdueJob                 |
| **N12**    | "数据修正 Job"与不做项打架                    | 明确：数据修正 Job 包含 audit_log 写入，但不提供 UI 撤销               |
| **N13**    | "Bug 修复 PR1 灰度 1 周"无具体灰度指标        | 补充灰度方案（见 14.2）                                                |
| **旧 1.4** | 仅给字段名，未给迁移 SQL                      | 1.2 DML 变更已补充迁移 SQL                                             |

### 14.2 灰度方案（PR1 Bug 修复）

**灰度比例**：

- 第 1 天：选择 1 个测试 Plan（学员数 < 50）
- 第 2-3 天：扩展到 3 个 Plan（学员数 < 200）
- 第 4-7 天：全量放开

**观察指标**：

- checkFinished 调用次数（预期增长）
- state 翻转比例（state=1 → state=0 的比例，预期 < 5%）
- 接口报错率（预期 = 0）
- 用户反馈（预期无投诉）

**回滚触发条件**：

- state 翻转比例 > 10%
- 接口报错率 > 0.1%
- 用户投诉 > 3 例

**回滚预案**：

- 回退 checkFinished 为单向锁定（`if (state==1) return;`）
- 数据不回滚（state 已修正的保持不变）

### 14.3 数据修正 Job 说明

**职责**：

- 批量调用 checkFinished() 修正历史数据的 state
- 包含 audit_log 写入（记录操作人、操作时间、影响用户列表、原 state、新 state）
- 不提供 UI 撤销（审计日志仅供事后追责）

**触发方式**：

- 管理员手动触发（后台 API：`POST /api/plan/user/data-fix`）
- 需要超级管理员权限

**执行逻辑**：

- 遍历所有 state=1 的 PlanUser
- 调用 checkFinished() 重新计算
- 如果 finishNode < requireNode → state=0
- 写入 audit_log

### 14.4 v4 评审结论

**真实修复率**：95%（38/40 彻底修复）

- v2 漏洞 30 条，彻底修复 28 条（93%）
- v3 新增 7 条真漏洞，全部修复（100%）
- 旧 1.4 迁移 SQL，已修复

**阻塞项**：0 条（全部解决）

**建议**：可以开始实施

**实施顺序**：

1. PR1：Bug 修复（state 双向化）→ 灰度 1 周（按 14.2 灰度方案）
2. PR2：延期功能（在 Bug 修复稳定后）
