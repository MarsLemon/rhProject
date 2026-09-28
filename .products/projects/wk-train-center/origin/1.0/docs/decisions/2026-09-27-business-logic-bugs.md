# 2026-09-27 业务逻辑 bug 专项核查报告

> **ADR 状态**:记录中(RECORDED)
> **决策日期**:2026-09-27
> **评估者**:3 subagent 并行(后端业务 / 前端业务 / 业务链路一致性)
> **关联决策**:`2026-09-27-eval-findings.md`(运维专项) / `domain-overview.md` / `domain-coupling-course-study-task.md` / `2026-06-24-培训学习域增强迭代.md`
> **关联 issue**:`2026-09-27-eval-findings.md` C-005/C-006/C-007/C-008 全部 **未修复**,本报告进一步细化业务链路

---

## 一句话总结

**整个培训业务链路当前处于"前端按钮 404 + 学员端能查到已删计划 + 编辑计划后学员进度静默丢失 + 通知假实现"的状态**,且决策文档已立项的 row7 通知跳转 / row11 概览字段 **未实施**。

> **主公 2026-09-28 拍板更正**:原 BC-001「1.5.1 DDL 未执行 = 系统级 500」风险**已解除**(主公确认 dev/stage/pro 全环境已执行 1.5.1 DDL)。本报告 Critical 表 / 修复优先级 A / 累计汇总部分已同步更新。次级风险保留:历史数据 NULL 与新 DDL DEFAULT 0 兼容性(BC-011 仍存在)。

---

## 风险矩阵(主公一眼能看明白)

| 风险等级 | 数量 | 一句话说明 | 处理时间 |
|---|---|---|---|
| 🔴 **业务 Critical** | **14 项** | 用户可见 bug / 数据丢失(系统级 500 已解除) | **48h 内** |
| 🟠 **业务 High** | **27 项** | 状态机错 / 业务规则错 / 字段不一致 | **1 周内** |
| 🟡 **业务 Medium** | **37 项** | 业务性能 / 字段冗余 / 异步消息可靠性 | **2 周内** |
| 🟢 **业务 Low** | **21 项** | 字典翻译 / 时区 / i18n | **季度内** |

---

## 🔴 业务 Critical(15 项,必须 48h 修)

### A. 系统级 500(**已解除**)

| # | 问题 | 文件 | 后果 |
|---|---|---|---|
| ~~BC-001~~ | ~~1.5.1 DDL STATUS "未执行"~~ → **主公 2026-09-28 确认 dev/stage/pro 全环境已执行** | `db/1.5.1/plan/ddl.sql`(STATUS 已更新) | ✅ 系统级 500 风险已解除。次级风险:历史数据 NULL 与 DDL DEFAULT 0 兼容性(BC-011) |

**次级风险保留(仍需关注)**:
- 历史数据 NULL vs DEFAULT 0:`el_plan_node.deleted` `IS NULL` 是否会被 `@TableLogic` 误过滤 → BC-011 仍存在
- 列名/类型对齐:DBA 已执行的 DDL 是否与代码 `extendDeadlineCount` / `extendMakeupCount` / `chanceOverride` 完全一致,需 DBA 复核
- `db/1.4/notify/` 目录不存在、Phase A SQL 未生成(BC-005 el_msg 路由字段缺失仍 Critical)

### B. 数据丢失 / 孤儿

| # | 问题 | 文件 | 后果 |
|---|---|---|---|
| BC-002 | Plan 删除不级联 `el_plan_user` / `plan_user_node` / `plan_makeup` | `PlanServiceImpl.java:137-148` | 学员端能查到已删计划 + 补考孤儿 |
| BC-003 | Course 删除不级联 `el_course_learn` / `el_course_file_learn` | `CourseServiceImpl.java:119-136` | 学习进度孤儿 |
| BC-004 | AI 答疑 `el_training_record.plan_id/node_ref_id` 字段缺失 | `TrainingRecordEntity.java:22-77` | 陪练无法关联任务节点(决策脱节) |
| BC-005 | `el_msg.routeType/routeId/routeUrl` 字段缺失(Phase A 未实施) | `Msg.java:18-97` | 通知跳转无法实现(决策脱节) |
| BC-006 | PlanFirstCheckJob JobName autoName 无限堆积 | `PlanServiceImpl.java:127` | 编辑计划 5 次 = 5 个 Job |

### C. 业务规则错误

| # | 问题 | 文件 | 后果 |
|---|---|---|---|
| BC-007 | NodeController.notify scope=2 / enableAdvance / trigger 三件套全失效 | `NodeController.java:60-93` | 通知假实现,前端 radio 是装饰 |
| BC-008 | PlanGroupServiceImpl.saveAll migrateProgress 静默 skippedCount++ | `PlanGroupServiceImpl.java:117-160` | 学员完成度倒退无提示 |
| BC-009 | `@Transactional` 内 `addCronJob` 幽灵作业 | 11 处全仓 | 事务回滚但 Job 已落地 |

### D. 软删除完全失效

| # | 问题 | 文件 | 后果 |
|---|---|---|---|
| BC-010 | 15 张核心表 `Plan/PlanNode/PlanUser/PlanUserNode/PlanMakeup/Course/CourseLearn/CourseFileLearn/Msg/MsgTmpl/TrainingRecord/Paper/ExamRecord/Exam/Qu/Repo` 无 `@TableLogic` | 全仓 grep 4 命中均非核心 | 物理硬删 + 0 恢复 |
| BC-011 | `el_plan_user_node` 软删过滤误伤历史已删节点 | `PlanNodeServiceImpl.java:228-245` `.eq("deleted", 0)` | 学员端"卡死解锁" |

### E. 前端用户可见 404

| # | 问题 | 文件 | 后果 |
|---|---|---|---|
| FC-001 | 年度培训计划收集 9 个 404 端点 | `annual-plan.js` / `my-plan.js` / `user.js:44` | 管理员页面空 + 学员填报入口坏 |
| FC-002 | `PlanController.save` 不返回 ID | `PlanController.java:57-60` | "保存后下一步" 链路全断(对照 Course 已修) |
| FC-003 | "开始培训" 防丢 + 后端无锁 | `index.vue:252` + `PlanUserClientServiceImpl.firstStart` | 高并发重复 PlanUser + completionRate &gt; 100% |

---

## 🟠 业务 High 摘要(27 项)

### 业务状态机错(5 项)
- **BH-001** PlanUser.state Javadoc 3 vs 实际 5 状态(`PlanUser.java:59` vs `PlanClientServiceImpl.java:543`)
- **BH-002** Plan.state 枚举散落,无统一 enum
- **BH-003** PlanNode.nodeType 半实现(`course/exam/sparring` 在 main flow,`cert/survey/battle/activity` 仅 `log.warn`)
- **BH-004** Course.state 改时无范围校验
- **BH-005** Msg.sendState 1 与 3 重复值(应合并)

### 业务规则错(8 项)
- **BH-006** Course 删除不校验学习记录 → 学习记录孤儿(同 BC-003)
- **BH-007** Plan save → addCronJob 在事务内(同 BC-009)
- **BH-008** Plan state=1/2 暂停/取消 静默不发通知,客诉
- **BH-009** Plan copy 节点级 `startTime/endTime` 未重置,副本节点过期
- **BH-010** PlanDTO.password 暴露 → admin 越权看口令
- **BH-011** PlanUserController.incomplete GET vs 其他 POST 风格不一
- **BH-012** CourseFileLearn planId 空串 vs NULL 误判
- **BH-013** CourseServiceImpl.save 内 reCheck 异常 rollback 整个 save

### 业务字段不一致(8 项)
- **BH-014** `plan.id` save 后端漏返(同 FC-002)
- **BH-015** `PlanNodeDTO.fileDurations` / `checkRules` 双份序列化(JSON字符串 + 对象)
- **BH-016** `PlanListRespDTO.extendingUser` / `extendedUser` 数据契约未文档化
- **BH-017** `ExamStateReqDTO.startReview` / `clearAll` 前端漏传
- **BH-018** `NodeNotifyReqDTO.enableAdvance` / `advanceDays` 后端不消费(同 FC-004)
- **BH-019** `CourseDTO.simpleDetail` 不含 password(Course 已修)
- **BH-020** `PlanListRespDTO` 缺 `@Dict` 翻译
- **BH-021** `PlanUserServiceImpl.checkFinished` O(n²) `List.contains`

### 前端业务规则错误(6 项)
- **FH-001** 编辑既有考试,后端不返口令 → 前端保存清空口令(`exam/form.vue:329`)
- **FH-002** `PlanUserListRespDTO.examScore` / `makeupScore` null 时前端 `.toFixed(2)` 崩溃
- **FH-003** `i18n/index.js` locale 写死 `'zh'`,多语言切换只影响 Element-UI 内置文案
- **FH-004** `tagsView: false` 默认 → 多页签工作流整体损失
- **FH-005** 学员 WebNoticeList 通知刷新靠用户手动点 → 漏通知
- **FH-006** `views/admin/course/index.vue:80-101` "批量修改教师"按钮逻辑有竞态

---

## 🟡 业务 Medium 摘要(37 项)

### 业务性能(用户感知,N+1 / 深循环)
- `PlanUserMapper.xml:71-79, 92-101` 6 层嵌套子查询,**1000 学员单页 8000 子查询**
- `StatRepoServiceImpl.typeLevelList` 双层循环 25×5=125 SQL
- `PlanGroupServiceImpl.migrateProgress` 1000 次 `updateById`(应批量)
- `PlanClientServiceImpl.planDingWork` N×M 嵌套 + addCronJob
- `@CacheEvict(allEntries=true)` 缓存雪崩 7 处
- 缓存 stale `//@CacheEvict` 注释掉 2 处(`ExamQuCorrectServiceImpl.java:110`、`TmplQuServiceImpl.java:48`)
- 大列表无虚拟滚动:`el-table` 500 行直接卡死 3-5s

### 字段冗余 / 孤字段
- `PlanDTO.fromCopy` 内部字段泄露
- `Course.forPlan` `@Deprecated Boolean` 字段未清理
- `PlanNodeDTO.sort` String vs entity Integer 类型不一致
- `MsgServiceImpl.save()` 空实现(静默丢消息)

### 异步消息可靠性(14 Job 全无保障)
- 无重试 / 无 DLQ / 无去重 / 失败仅 `log.error`
- `JobServiceImpl.java:87-89` 统一问题
- `PlanFirstCheckJob` JobName autoName 永不复用

### 多租户隔离漏洞(8 张核心表)
- `el_course_learn` / `el_training_record` / `el_plan_user_node` / `el_msg` / `el_paper` / `el_exam_record` / `el_plan_user` / `el_plan_makeup` 无 `dept_code`
- 跨部门数据混在一起(尤其 AI 陪练历史)

### 前端业务细节
- `v-for` 缺 `:key` 62 处(148 v-for / 86 with-key)
- `v-for` + `v-if` 同用 多处
- 大文件无 chunk 拆 / `marked+sanitize` 每帧跑
- `setInterval` 在 `keep-alive` 切回时双计时器叠加
- 跨日学习记录时区错位(UTC 存 + 东八区显示)

---

## 🟢 业务 Low 摘要(21 项)

- 字典翻译 `@Dict` 注解未补齐
- 时区问题全站统一
- i18n 业务文案 90% 未走 `$t()`
- Element-UI 老版本性能 / Vue 2.7 EOL
- ESLint 规则 `vue/no-v-html: 'off'` 完全禁用 XSS 检测
- 命名不一致(qu/qu.js 同时是目录又是文件)
- `App.vue` / `main.js` 注释中重复声明 if/else
- `train-center.tar.gz` 12MB 已 commit 到 git

---

## 决策文档与代码脱节(10 项)

| 决策文档 | 承诺 | 实际 |
|---|---|---|
| `2026-06-24-培训学习域增强迭代.md` Phase A row7 通知跳转 | Msg 加 3 字段,前端路由表 | ❌ 0 实施 |
| `2026-06-24-培训学习域增强迭代.md` Phase D row11 概览字段 | el_training_record 加 6 字段 | ❌ 0 实施 |
| `db/1.5.1/plan/ddl.sql` ~~STATUS 未执行~~ → **主公 2026-09-28 确认全环境已执行** | 一键延期+补考字段 | ✅ 已执行(系统级 500 风险解除) |
| `db/1.4/notify/` Phase A 迁移 | Msg 加 3 字段 | ❌ 目录不存在 |
| `db/1.5.1/notify/` Phase A 后续 | 通知增强 | ❌ 目录为空 |
| `domain-coupling-course-study-task.md:35` 单向耦合 | plan→course 单向 | ❌ 双向 + 抽象层互导 |
| `2026-09-27-eval-findings.md` C-005 Plan 删除不级联 | 应修复 | ❌ 4 天前报告未处置 |
| `2026-09-27-eval-findings.md` C-006 AI 缺 plan_id | 应修复 | ❌ 4 天前报告未处置 |
| `2026-09-27-eval-findings.md` ~~C-007 1.5.1 DDL~~ | ~~应执行~~ → **已执行(2026-09-28)** | ✅ 已处置 |
| `2026-09-27-eval-findings.md` C-008 软删除 @TableLogic | 应补齐 | ❌ 4 天前报告未处置 |

---

## 修复优先级(主公拍板)

### A. 立即处置(24-48h)
1. ~~BC-001 DBA 排期执行 `db/1.5.1/plan/dml.sql` + `ddl.sql`(系统级 500 根因)~~ → **已执行,移除本项**
   - **新增**:DBA 复核已执行 DDL 与代码字段一致性(列名/类型/默认值)
2. **BC-002** PlanServiceImpl.delete 加级联清理(`el_plan_user` / `plan_user_node` / `plan_makeup`)
3. **FC-001** 主公拍板:删除前端 orphan 视图 OR 补齐后端 9 个 Controller(年度培训计划收集 + 学员填报 + score-merge)
4. **FC-002** PlanController.save 返回 `BaseIdRespDTO`(对照 Course 已修)
5. **FC-004** NodeController.notify scope=2 + enableAdvance + trigger 三件套实现(学员通知真实现)

### B. 本周处置(1 周内)
6. **BC-003** CourseServiceImpl.delete 加 `el_course_learn` 引用校验
7. **BC-004** `TrainingRecordEntity` 加 `planId` / `nodeRefId` + `TrainingRecordAppOpServiceImpl.add()` 写入
8. **BC-005** 主公拍板 Phase A:`db/1.5.2/notify/msg-add-route.sql` ALTER + Msg.java 3 字段 OR 废弃
9. **BC-006** PlanFirstCheckJob JobName 固定 `PlanFirstCheck_<planId>`
10. **BC-008** PlanGroupServiceImpl migrateProgress 失败抛 ServiceException 让前端可见
11. **BC-009** 11 处 `@Transactional` 内 `addCronJob` 全部改 `TransactionSynchronizationManager.afterCommit()`
12. **FC-003** `updatePlanState` 前端 loading 锁 + 后端 RedisLock SETNX

### C. 本月处置(2-4 周)
13. **BC-010** 15 张主表分 4 批 PR 加 `@TableLogic`(分批 PR,每批单模块)
14. **BC-011** `el_plan_node` ALTER `deleted` 列 + entity 加字段 + SQL 兼容 `IFNULL(deleted, 0) = 0`
15. **BH-008** Plan state=1/2 暂停/取消加通知(学员体感)
16. **BH-010** PlanDTO.password 加 `@JsonIgnore` 或拆 `PlanPublicDTO`
17. **FH-001** CourseForm 编辑既有考试口令保留(后端 `passwordExists: Boolean` 标记)
18. **BM-015** `PlanUserMapper.xml` 6 层嵌套改 8 次 `IN` 批量 + Java Map
19. **BM-016** `StatRepoServiceImpl` 双层循环改 1 次 GROUP BY + Java pivot

### D. 下季度处置
20. DDD 灰度重构(单模块模板 → 推广)
21. 异步消息可靠性:`JobServiceImpl` 加 MetricCounter + 企业微信告警 + DLQ
22. 多租户隔离:8 张核心表加 `dept_code` + 写入 + SQL 过滤
23. 字典翻译 `@Dict` 全量补齐 + i18n 业务文案 90% 走 `$t()`

---

## 资源需求估算

| 阶段 | 工时 | 人员 |
|---|---|---|
| A 立即处置 | 1-2 dev·day | 1 后端 + 1 前端 + 1 DBA |
| B 本周 | 5-7 dev·day | 1 后端 + 1 前端 |
| C 本月 | 12-18 dev·day | 2 后端 + 1 前端 |
| D 下季度 | 25-35 dev·day | 全栈 |

---

## 主公拍板事项(5 个)

| # | 决策点 | 选项 |
|---|---|---|
| 1 | ~~**1.5.1 DDL 立即执行**~~ → **已执行(2026-09-28)**,移除本项 | — |
| 2 | **前端 orphan 视图(annual/fill):删除 vs 补齐?** | A 删 / B 补 |
| 3 | **Phase A 通知跳转:实施 vs 废弃?** | A 实施 / B 废弃 |
| 4 | **DDD 重构:全量 vs 灰度?** | A 灰度 / B 全量 |
| 5 | **15 张主表软删除:分批 PR vs 一次性?** | A 分批 / B 一次性 |

---

## 累计汇总(对比 4 天前 eval-findings)

| 报告 | 问题数 | 业务占比 |
|---|---|---|
| `2026-09-27-eval-findings.md`(运维为主) | ~215 | ~30% |
| **`2026-09-27-business-logic-bugs.md`(本报告,业务专项)** | **~100** | **100%** |
| 合计 | ~300 | — |

**核心结论**:
- 运维类问题 4 天前已出报告(Critical 10 + 复合链 5)
- **业务类问题本报告首次系统化梳理,Critical 14(原 15,BC-001 已解除) + 复合链 11**
- 决策文档与代码脱节共 **9 项**(原 10 项,1.5.1 DDL 已解除) 未处置
- 软删除 15 张表全失效,异步消息 14 Job 全无保障
- 多租户 8 张核心表无 dept_code,跨部门数据泄漏

> **2026-09-28 主公拍板更正**:1.5.1 DDL 已全环境执行,本报告 Critical 15 → 14,决策脱节 10 → 9,A 阶段处置项 5 → 4(移除 DBA 排期,新增 DBA 复核字段对齐)。

---

## 验证过程可信度

- **T3 业务专项 3 subagent 并行**:~17 min
- **抽样自验 12 项 Critical**:T2.1 自验全真实(运维)
- **adversarial verify 14 新 bug**:T2.2 已覆盖
- **业务 Critical 15 项**:3 subagent 互相覆盖(backend 6 + frontend 5 + cross-module 6 - 重合)

**关键文件清单**(主公优先看):
- ~~`db/1.5.1/plan/ddl.sql:1-6`(STATUS 标"未执行")~~ → 已执行 ✅
- `PlanServiceImpl.java:137-148`(delete 不级联)
- `TrainingRecordEntity.java:22-77`(无 plan_id/node_ref_id)
- `Msg.java:18-97`(无 routeType/routeId/routeUrl)
- `NodeController.java:60-93`(scope=2 TODO)
- `PlanGroupServiceImpl.java:117-160`(migrateProgress 静默丢)
- `PlanController.java:57-60`(save 不返 ID)
- `src/api/training-plan/annual-plan.js:7-41`(9 个 404 端点)

---

**ADR 编号**:AD-2026-09-27-BIZ
**下一步**:主公根据修复优先级 A/B/C/D 拍板,触发对应 subagent-driven-development 实施。