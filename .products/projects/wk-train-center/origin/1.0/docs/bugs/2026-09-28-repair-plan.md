# 2026-09-28 Bug 修复计划

> **ADR 状态**:待主公拍板(主公已确认 FB-002/FB-003 修复,本计划文档需主公再过一遍)
> **建立日期**:2026-09-28
> **关联文档**:`2026-09-28-business-bug-index.md`(81 项 Bug 索引)

---

## 一、主公最终决策汇总(2026-09-28)

### 修复策略
| 决策点 | 主公口径 |
|---|---|
| 备份策略 | **git tag v0.x.bugfix-N + commit message 注明 bug ID** |
| 批量阈值 | **一次最多 5 个 / 跨类型** |
| 大 bug | **一次一个** |
| 修复原则 | **亲手写代码,不用脚本,符合 DDD,单一职责** |
| 兼容性 | **必须关注修改后影响,兼容前内容** |
| **修复深度** | **抽领域事件,1 个模块示例后推广** |
| **同步更新规范文档** | **CLAUDE.md / AGENTS.md / 项目 README / db/GOVERNANCE.md** |
| **版本号(pom.xml)** | **不升**(2026-09-28 拍板) |
| **changelog** | **出,白话风格,不要中英文穿插**(2026-09-28 拍板) |
| **DB 改动** | **必须先 grill-me**(2026-09-28 规则) |

### Critical 13 项决策
| Bug ID | 决策 |
|---|---|
| `BUG-20260928-B-001` Plan 删除不级联 | ✅ 修 |
| `BUG-20260928-B-002` Course 删除不级联 | ✅ 修 |
| `BUG-20260928-B-003` AI 缺 plan_id/node_ref_id | ✅ 修 |
| `BUG-20260928-B-004` 站内信缺 3 路由字段 | ❌ **本次不修**(主公 2026-09-28 拍板:需 DBA 排期 1.5.2/notify,留到下一轮) |
| `BUG-20260928-B-005` 15 张表软删除 | ❌ **废除**(主公之前加的有 bug) |
| `BUG-20260928-B-006` 11 处事务内 addCronJob | ✅ 修 |
| `BUG-20260928-B-007` PlanFirstCheck Job 无限堆积 | ✅ 修 |
| `BUG-20260928-B-008` 节点软删过滤误伤 | ✅ 修 |
| `BUG-20260928-B-009` 删除课程不校验学习记录 | ✅ 修(并入 B-002) |
| `BUG-20260928-F-001` 年度培训 9 个 404 | ❌ **废除,全删 training-plan/ 整个目录** |
| `BUG-20260928-FB-001` 节点通知三件套假实现 | ✅ 修 |
| `BUG-20260928-FB-002` 编辑计划删节点学员进度丢 | ✅ 修(主公刚拍板) |
| `BUG-20260928-FB-003` 开始培训无防丢锁 | ✅ 修(主公刚拍板) |

### High 23 项决策
| Bug ID | 决策 | 备注 |
|---|---|---|
| `BUG-20260928-B-010` PlanUser 状态机 Javadoc 错 | ✅ 修(更新注释) | — |
| `BUG-20260928-B-011` Plan 状态枚举散落 | ✅ 修(新建枚举管理 + 全仓替换) | — |
| `BUG-20260928-B-012` 节点类型未实现 | ❌ 忽略 | 没这几个功能 |
| `BUG-20260928-B-013` Course.state 无范围校验 | ❌ 忽略 | 无需校验 |
| `BUG-20260928-B-014` Msg.sendState 1 和 3 重复 | ✅ 修(检查后合并) | — |
| `BUG-20260928-B-015` 暂停/取消不发通知 | ✅ 修 | — |
| `BUG-20260928-B-016` 复制培训计划时间错位 | ✅ 修(前端改时间,开始=当前,结束清空强制填写) | 需 grill-me |
| `BUG-20260928-B-017` PlanDTO.password 明文 | ❌ 不关心 | — |
| `BUG-20260928-B-018` incomplete GET | ✅ 修(改 POST + 前后端同步) | — |
| `BUG-20260928-B-019` CourseFileLearn 空串 vs NULL | ✅ 修 | — |
| `BUG-20260928-B-020` reCheck 异常 rollback save | ✅ 修 | — |
| `BUG-20260928-B-021` 节点双份序列化 | ✅ 修(主公 2026-09-28 拍板:**方案 B DDD 合规**,拆 PublicDTO + InternalDTO) | 见 §五 B-021 方案 B |
| `BUG-20260928-B-022` PlanListRespDTO 字段契约未文档化 | ✅ 修(添加文档追踪) | — |
| `BUG-20260928-F-002` 考试口令被清空 | ❌ 不关心 | — |
| `BUG-20260928-F-003` 学员成绩空值崩溃 | ✅ 修 | — |
| `BUG-20260928-F-004` 多语言切换 | ❌ 不关心 | — |
| `BUG-20260928-F-005` 多页签关闭 | ❌ 不关心 | — |
| `BUG-20260928-F-006` 站内信刷新手动 | ❌ 不关心 | — |
| `BUG-20260928-F-007` 批量改教师竞态 | ❌ 不关心 | — |
| `BUG-20260928-F-008` Plan 保存返 ID | ✅ 修 | — |
| `BUG-20260928-B-023` 学员完成判断 O(n²) | ✅ 修 | — |
| `BUG-20260928-FB-004` 考试口令联合 | ❌ 不关心 | — |
| `BUG-20260928-FB-005` 缓存清理组合 bug | ✅ 修 | — |

### Medium 26 项决策
| 大类 | 数量 | 决策 |
|---|---|---|
| 业务性能 | 8 项 | ✅ 全部修(B-024 ~ B-030 范围) |
| 字段冗余 | 5 项 | ✅ 全部修(B-031 ~ B-035 范围) |
| 异步消息可靠性 | 4 项 | ❌ 不关心(B-036 ~ B-038) |
| 多租户隔离 | 3 项 | ⏸ **记录不决**(B-039 ~ B-041) |
| 前端细节 | 6 项 | ✅ 全部修(F-009 ~ F-016),**不用脚本,不用 i18n** |

### Low 19 项决策
| 类别 | 决策 |
|---|---|
| 大部分(L-001 ~ L-008, L-010 等) | ❌ **先不管** |
| Low 技术债 2 项 + Bug 子类 1 项 | ⏸ **展开说,主公拍板**(见 §六) |

### 废除项
| 项目 | 处理 |
|---|---|
| `BUG-20260928-B-005` 软删除 | 不修,功能废除 |
| `BUG-20260928-F-001` 年度培训收集 | 不修,**全删 `src/api/training-plan/` + `src/views/admin/training-plan/` 整个目录** |
| `src/api/training-plan/my-plan.js` | 全删(同 F-001 范畴) |
| **DB 表** `el_training_plan_annual_collections` + `el_training_plan` | **保留不删**(主公 2026-09-28 拍板,避免 DBA 额外工作 + 历史数据保留) |

---

## 二、T0 准备阶段(详细)

> **主公 2026-09-28 拍板**:grep 全仓验证无引用后再删除

### Step 1:git tag 初始基线
```bash
git tag -a v0.5.bugfix-0 -m "BEFORE: 修复批次起点"
```

### Step 2:grep 全仓验证 training-plan/ 无引用
```bash
# 前端
grep -rn "training-plan" e:/rhProject/Frontend/vue/wk-train-center-ui/src/
grep -rn "annual-training-plan-collections" e:/rhProject/Frontend/vue/wk-train-center-ui/src/
grep -rn "annual-training-plan" e:/rhProject/Frontend/vue/wk-train-center-ui/src/

# 后端(应该 0 命中,前端 9 个端点对应后端无 Controller)
grep -rn "annual-training-plan" e:/rhProject/Backend/wk-train-center-service/src/

# 路由/菜单/权限
grep -rn "training-plan\|annual" e:/rhProject/Frontend/vue/wk-train-center-ui/src/router/
grep -rn "training-plan\|annual" e:/rhProject/Frontend/vue/wk-train-center-ui/src/permission.js
grep -rn "training-plan\|annual" e:/rhProject/Frontend/vue/wk-train-center-ui/src/store/
```

### Step 3:确认 0 命中后,记录哪些文件需要清理
- `src/api/training-plan/annual-plan.js`(主文件)
- `src/api/training-plan/my-plan.js`(同范畴)
- `src/views/admin/training-plan/annual/`(视图)
- `src/views/admin/training-plan/fill/`(视图)
- `src/router/index.js`(路由配置,如有引用)
- `src/store/modules/permission.js`(权限配置,如有引用)

### Step 4:DB 表
- **不删**(主公 2026-09-28 拍板)
- 历史数据保留,以后需要复用时可直接启用

> **DB 改动规则(主公 2026-09-28)**:任何数据库改动(新建表 / 改字段 / DROP / ALTER / 建索引)**必须先 grill-me 主公**,未经批准禁止执行。本计划涉及的 B-004(站内信 3 字段)需要 DBA 排期新建 `db/1.5.2/notify/msg-add-route.sql`,主公已决定"本次不修",留到下一轮。

---

## 三、备份策略

```bash
# 修复前每次 git tag
git tag -a v0.5.bugfix-1 -m "BEFORE: B-001 Plan 删除不级联"
git tag -a v0.5.bugfix-2 -m "BEFORE: B-002 Course 删除不级联"
... 依次类推

# commit 格式
git commit -m "fix(bug-20260928-B-001): PlanServiceImpl.delete 加级联清理 el_plan_user/plan_user_node/plan_makeup

- Plan 删除时事务内串行删 5 张表关联数据
- el_paper.plan_id 脱钩为 NULL
- enterCleanJob 改 afterCommit 异步
- 兼容前内容:历史数据无脏数据风险(物理删除无法回滚)
"
```

**版本号说明**:
- `v0.x.bugfix-N`:每次修复前的快照标签
- `v0.5` = 主版本 0.5(当前生产)
- `.bugfix-N` = 第 N 次修复批次

---

## 四、修复批次(分阶段进度表)

> **主公 2026-09-28 拍板**:
> - **修复顺序**:Critical 全做完再做 High(不允许交叉)
> - **测试覆盖**:每修一个 bug 必写单元测试覆盖修复点 + 兼容性验证

### 顺序示意

```
T0(准备 + grep)
   ↓
T1.1(废除 training-plan/)
   ↓
T1.2 → T1.3 → T1.4 → T1.6 → T1.7 → T1.8 → T1.9 → T1.10 → T1.11 (Critical 全做完)
   ↓
T2.1 → T2.2 → T2.3 → T2.4 → T2.5 (High 5 批)
   ↓
T3.1 → T3.2 → T3.3 → T3.4 → T3.5 (Medium 5 批)
   ↓
T1.12(待启动 B-004,等 DBA 排期)
```

### 测试用例模板

```java
// PlanServiceImplTest.java
@Test
public void delete_cascadePlanUserAndProgress() {
    // given
    String planId = "test-plan-001";
    PlanUser existUser = new PlanUser();
    existUser.setPlanId(planId);
    existUser.setUserId("user-001");
    planUserService.save(existUser);
    
    // when
    planService.delete(Arrays.asList(planId));
    
    // then
    assertNull(planUserService.getOne(
        new QueryWrapper<PlanUser>().eq("plan_id", planId)));
}
```

### 兼容性验证模板

```java
// 删除的兼容场景测试
@Test
public void delete_compatibleWithOrphanHistoricalData() {
    // 历史孤儿数据(plan_id 指向已不存在的 plan)应在删除时清掉
    // 但需要先 grep 历史数据量
}
```

### 总览

> **主公 2026-09-28 拍板(深层决策)**:
> - **修复深度**:**抽领域事件**,1 个模块示例后推广(从 B-001 Plan 删除开始,后续 B-002 等按同模式)
> - **同步更新规范文档**:**同步更新** CLAUDE.md / AGENTS.md / 项目 README / db/GOVERNANCE.md
> - **B-011 枚举替换范围**:限关键路径,**不查全路**
> - **review 机制**:**一批次出报告**(T1.x 全部 Critical 修完一次性报告 + git diff 汇总)

| 批次 | 类型 | 项数 | Bug ID | 工时(估) |
| **T0 准备** | 备份 + grep 验证 | — | grep 谁在用 training-plan/(全仓验证无引用)+ git tag v0.5.bugfix-0 | 30 min |
| **T1.1 废除** | 删除 orphan(grep 验证后) | — | 全删 training-plan/(前端 API + 视图) + router/menu 同步清理 + **DB 表保留不删**(主公拍板) | 1 dev·day |
| **T1.2 大 bug** | Critical B-001(写单元测试) | 1 | PlanServiceImpl.delete 加级联 + JUnit 覆盖修复点 | 2h |
| **T1.3 大 bug** | Critical B-002+B-009 | 1 | CourseServiceImpl.delete 加级联 + 校验 | 2h |
| **T1.4 大 bug** | Critical B-003 | 1 | TrainingRecordEntity 加 planId/nodeRefId | 3h |
| **T1.5 大 bug** | ~~Critical B-004~~ | 0 | ~~Msg.java 加 routeType/routeId/routeUrl + DDL~~ **本次跳过**(主公拍板:需 DBA 排期,留到下一轮) | — |
| **T1.6 大 bug** | Critical B-006 | 1 | 11 处 addCronJob 改 afterCommit | 4h |
| **T1.7 大 bug** | Critical B-007 | 1 | PlanFirstCheckJob 固定 jobName | 1h |
| **T1.8 大 bug** | Critical B-008 | 1 | PlanNodeServiceImpl 兼容 IFNULL(deleted,0) | 1h |
| **T1.9 大 bug** | Critical FB-001 | 1 | NodeController.notify 三件套实现 | 4h |
| **T1.10 大 bug** | Critical FB-002 | 1 | PlanGroupServiceImpl.migrateProgress 抛 ServiceException | 3h |
| **T1.11 大 bug** | Critical FB-003 | 1 | index.vue loading 锁 + PlanUserClientServiceImpl @RedisLock | 2h |
| **T1.12 待启动** | Critical B-004 | 0 | 等 DBA 排期 1.5.2/notify 后启动 | 4h(待 DBA) |
| **T2.1 小 bug 批量** | High + Medium 混合 | 5 | B-010 + B-011(限关键路径枚举)+ B-014 + B-022(元数据+文档) | 3h |
| **T2.2 小 bug 批量** | High 业务规则 | 5 | B-015 + B-018 + B-019 + B-020 + B-023 | 5h |
| **T2.3 小 bug 批量** | High 业务规则 | 3 | B-016 + F-003 + F-008 | 3h |
| **T2.4 小 bug 批量** | High 字段 | 1 | B-021(方案 B: 拆 PublicDTO + InternalDTO) | 1h |
| **T2.5 小 bug 批量** | High 组合 | 1 | FB-005 | 2h |
| **T3.1 小 bug 批量** | Medium 性能 | 5 | B-024 + B-025 + B-026 + B-027 + B-030 | 5h |
| **T3.2 小 bug 批量** | Medium 缓存 | 3 | B-028 + B-029 + (B-025 性能复用) | 3h |
| **T3.3 小 bug 批量** | Medium 字段冗余 | 5 | B-031 + B-032 + B-033 + B-034 + B-035 | 4h |
| **T3.4 小 bug 批量** | Medium 前端性能 | 5 | F-009 + F-010 + F-011 + F-012 + F-013 | 5h |
| **T3.5 小 bug 批量** | Medium 前端字段 | 3 | F-014 + F-015 + F-016(不用 i18n) | 3h |
| **T4 总结** | 落文档 + 决策 | — | 更新 bug 索引 + 决策文档 | 1h |

**总工时估算**:~50 dev·hour(2 dev·day 可全部完成)

---

## 五、修复详情 + 兼容性分析

### T1.2:Critical B-001 — Plan 删除不级联

> **主公 2026-09-28 拍板:抽领域事件,1 个模块示例后推广**

**修复模式 — 领域事件模式**:
```java
// 1. PlanServiceImpl.delete() 改为发布领域事件
@Transactional(rollbackFor = Exception.class)
@Override
public void delete(List<String> ids) {
    for (String id : ids) {
        planGroupService.removeByPlanId(id);
        this.removeByIds(ids);
        // 发布 PlanDeletedEvent(领域事件)
        eventPublisher.publishEvent(new PlanDeletedEvent(id, "admin_delete"));
    }
}

// 2. 各模块订阅 PlanDeletedEvent(异步处理,跨域调用通过事件解耦)
// - PlanUserListener:@EventListener 删 el_plan_user/plan_user_node/plan_makeup
// - CourseLearnListener:@EventListener 脱钩 el_course_learn.plan_id
// - PaperListener:@EventListener 脱钩 el_paper.plan_id
// - EnterCleanListener:@EventListener 清理 el_enter_dist
// - PlanMakeupListener:@EventListener 清理 el_plan_makeup
```

**领域事件优势**:
- 符合 DDD 跨域边界(plan 不直接调 course/paper 模块)
- 各模块独立订阅,职责单一
- 后续 B-002 / B-009 同模式复用

**兼容性分析**:
- **兼容**:PlanService 不再直接调跨域 Service,通过事件解耦
- **风险**:事件订阅者 @Transactional 需独立,异步处理可能延迟
- **回滚**:git tag v0.5.bugfix-1 一键回滚

### T1.3:Critical B-002 + B-009 — Course 删除不级联 + 校验

**修复**:
```java
@Transactional(rollbackFor = Exception.class)
@Override
public void delete(List<String> ids) {
    for (String id : ids) {
        // 新增:校验学习记录(>=0 抛错,提示改"禁用")
        int learnCount = courseLearnService.countByCourseId(id);
        if (learnCount > 0) {
            throw new ServiceException("课程已有 " + learnCount + " 名学员学习,无法删除!请改为'禁用'。");
        }
        // 已存在
        boolean hasRef = planPreService.hasRef(SysObjType.COURSE, ids);
        if (hasRef) throw new ServiceException("已在学习任务中关联,无法删除!");
    }
    this.removeByIds(ids);
    enterCleanJob.create(EnterRefType.COURSE, ids);
    courseRefFileService.deleteByCourseIds(ids);
    courseRefDirService.deleteByCourseIds(ids);
}
```

**兼容性分析**:
- **兼容**:新增"是否有人学习"校验
- **风险**:有学习记录的课程**之前能删,现在不能删**。需要给管理员培训:改用"禁用"按钮代替删除(详见 T1.3 后续子任务:加禁用通道)
- **回滚**:git tag v0.5.bugfix-2 一键回滚

### T1.4:Critical B-003 — AI 加 planId/nodeRefId

**修复**:
```java
// TrainingRecordEntity.java
@Data
@TableName("el_training_record")
public class TrainingRecordEntity extends Model<TrainingRecordEntity> {
    // ... 原有字段保持不变 ...
    @TableField("plan_id") private String planId;       // 新增
    @TableField("node_ref_id") private String nodeRefId; // 新增
}

// TrainingRecordAppOpServiceImpl.add()
public TrainingRecordEntity add(TrainingRecordAddCommand cmd) {
    TrainingRecordEntity entity = new TrainingRecordEntity();
    BeanMapper.copy(cmd, entity);
    // 新增
    entity.setPlanId(cmd.getPlanId());
    entity.setNodeRefId(cmd.getNodeRefId());
    return entity;
}

// 前端 TrainingRecordPageQueryDto 加查询条件
```

**兼容性分析**:
- **兼容**:DB v1.2 已加列,只补实体字段
- **风险**:历史 AI 陪练记录 plan_id/node_ref_id 为 NULL,前端展示时需 `value == null ? '--' : value`(同 F-003 处理)
- **回滚**:git tag v0.5.bugfix-3 一键回滚

### T1.5 ~~Critical B-004 — Msg 加 3 路由字段~~

> **主公 2026-09-28 拍板:本次不修 B-004,需 DBA 排期 1.5.2/notify 后再启动**
>
> 此处保留方案作为下一轮启动参考,不在本批次执行

**下一轮修复方案(预存)**:
1. 新建 `db/1.5.2/notify/msg-add-route.sql`:
```sql
ALTER TABLE `wk_train_center`.`el_msg`
ADD COLUMN route_type VARCHAR(32) DEFAULT NULL COMMENT '路由类型(course/exam/plan/makeup)',
ADD COLUMN route_id VARCHAR(64) DEFAULT NULL COMMENT '路由 ID',
ADD COLUMN route_url VARCHAR(512) DEFAULT NULL COMMENT '路由 URL';
```
2. `Msg.java` 加 3 字段
3. 4 类通知发送处(补考/延期/学习任务/培训通知)填 route
4. `MsgServiceImpl.enrichWithTemplate` 加 dto.setRouteType/dto.setRouteId/dto.setRouteUrl

**兼容性分析**:
- **兼容**:DB 列可空,旧消息 route_type/route_id/route_url 全部 NULL,前端 fallback 到 linkType/linkId(老路径)
- **风险**:前端 `im.vue` 的 `jumpUrl` 渲染逻辑需要判断"是否有 routeType"(有则按 routeType 跳,无则走 linkType/jumpUrl)
- **回滚**:git tag v0.5.bugfix-4 一键回滚

### T1.6:Critical B-006 — 11 处 addCronJob 改 afterCommit

**修复**(模式一致,以 `PlanServiceImpl.save` 为例):
```java
@Transactional(rollbackFor = Exception.class)
@Override
public void save(...) {
    // ... 原有事务代码 ...
    if (update) {
        // ... 计算 firstNode ...
        // 改:beforeCommit → afterCommit(事务提交后再写 Quartz)
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                jobService.addCronJob(PlanFirstCheckJob.class, "PlanFirstCheck_" + planId, 
                                       JsonHelper.toJson(jobDTO));
            }
        });
    }
}
```

**复用模式**:`PlanUserNodeClientServiceImpl.syncNextUnlock:124-130` 已有同款写法,直接照搬。

**兼容性分析**:
- **兼容**:行为变化——Job 在事务提交后才落地,延迟几毫秒
- **风险**:没有"事务回滚但 Job 落地"的情况(主公 B-007 期望)
- **回滚**:git tag v0.5.bugfix-5 一键回滚

### T1.7:Critical B-007 — PlanFirstCheck Job 固定 jobName

**修复**(同上,已合并到 T1.6):
```java
jobService.addCronJob(PlanFirstCheckJob.class, "PlanFirstCheck_" + planId, JsonHelper.toJson(jobDTO));
```

`JobServiceImpl.addCronJob` 已先 `deleteJob` 后 `scheduleJob`,自动幂等。

**兼容性分析**:
- **兼容**:JobName 格式变更(从 `PlanFirstCheckJob_<Snowflake>` → `PlanFirstCheck_<planId>`)
- **风险**:历史 JobName 已存在,QRTZ_TRIGGERS 表里有旧 JobName 不会自动清理(运维巡检时手工清)
- **回滚**:git tag v0.5.bugfix-6 一键回滚

### T1.8:Critical B-008 — 节点软删过滤兼容

**修复**(短期方案,不破坏老数据):
```java
// PlanNodeServiceImpl.listAllNonSparringNode
return list(new QueryWrapper<PlanNode>()
    .eq(com.baomidou.mybatisplus.annotation.SqlCondition.custom, 
        "IFNULL(deleted, 0) = 0")
    .orderByAsc(PlanNode::getSort)
);
```

**兼容性分析**:
- **兼容**:用 `IFNULL` 兼容老数据 NULL,新数据走 DDL DEFAULT 0
- **风险**:长期方案需 DBA 跑 `UPDATE el_plan_node SET deleted = 0 WHERE deleted IS NULL`(主公 B-008 已确认 1.5.1 DDL 执行过,但 el_plan_node 的 deleted 列 DDL 时间需 grep 确认)
- **回滚**:git tag v0.5.bugfix-7 一键回滚

### T1.9:Critical FB-001 — 节点通知三件套

**修复**:
```java
@PostMapping("/notify")
public ApiRest<?> notify(@RequestBody NodeNotifyReqDTO reqDTO) {
    PlanNode node = planNodeService.getById(reqDTO.getNodeId());
    if (node == null) return failure("节点不存在");

    List<String> userIds = enterDistService.listAllUserIds(EnterRefType.PLAN, reqDTO.getPlanId());
    if (CollectionUtils.isEmpty(userIds)) return failure("该计划下没有学员");

    // 修复 #1:scope=2 实测过滤
    if (reqDTO.getScope() != null && reqDTO.getScope() == 2) {
        userIds = planUserService.listUnstartedUserIds(reqDTO.getPlanId(), reqDTO.getNodeId());
        if (CollectionUtils.isEmpty(userIds)) return failure("没有需要通知的学员");
    }

    // ... 已有发送逻辑 ...

    // 修复 #2:trigger=true/false 实测实现
    if (Boolean.TRUE.equals(reqDTO.getTrigger())) {
        userMsgService.sendMsg(sendDTO);  // 立即
    } else {
        Date sendAt = StringUtils.isBlank(reqDTO.getSendTime())
                ? new Date() : DateUtil.parse(reqDTO.getSendTime());
        jobService.schedule(new PlanPrepareNotifyJob(sendDTO), sendAt);  // 真正调度
    }

    // 修复 #3:enableAdvance 实测实现
    if (Boolean.TRUE.equals(reqDTO.getEnableAdvance()) && reqDTO.getAdvanceDays() != null) {
        Date advanceAt = DateUtil.offsetDay(node.getStartTime(), -reqDTO.getAdvanceDays());
        jobService.schedule(new PlanPrepareNotifyJob(sendDTO), advanceAt);
    }
    return success();
}
```

**兼容性分析**:
- **兼容**:原 log.info 路径被替换,行为变化——真的筛选 / 真的调度
- **风险**:`planUserService.listUnstartedUserIds` 是新方法,需要先实现(新加 Service 方法,符合 DDD Repository 层)。`PlanPrepareNotifyJob` 需要先存在(grep 确认)
- **回滚**:git tag v0.5.bugfix-8 一键回滚

### T1.10:Critical FB-002 — 编辑计划删节点进度丢

**修复**:
```java
// PlanGroupServiceImpl.migrateProgress
if (newNode == null) {
    List<String> lostUserNodeIds = progressList.stream()
        .map(PlanUserNode::getId).collect(Collectors.toList());
    // 改:不静默,抛 ServiceException 让前端 confirm
    throw new ServiceException(
        "以下节点的学员进度无法迁移(" + progressList.size() + " 条):" + 
        lostUserNodeIds + "。请重新编辑节点 refId/nodeType 后再保存。");
}
```

前端 `plan/form.vue` 保存后:
```javascript
saveData(data).then(res => {
    this.$message.success('保存成功')
    this.refreshList()
}).catch(err => {
    this.$confirm(err.message, '学员进度迁移冲突', {
        confirmButtonText: '继续保存(进度将丢失)',
        cancelButtonText: '取消编辑',
        type: 'warning'
    }).then(() => {
        // 二次提交(加 force=true 跳过 migrateProgress)
    })
})
```

**兼容性分析**:
- **兼容**:从"静默丢"改为"显式提示",行为变化大
- **风险**:管理员编辑体验改变——以前删节点无感知,现在必须 confirm。需要给管理员培训
- **回滚**:git tag v0.5.bugfix-9 一键回滚

### T1.11:Critical FB-003 — 开始培训防丢锁

**修复**:
前端 `views/admin/plan/plan/index.vue:253-258`:
```javascript
data() {
  return { stateLoadingMap: {} }
},
methods: {
  updatePlanState(id, state, msg) {
    if (this.stateLoadingMap[id]) return
    this.$set(this.stateLoadingMap, id, true)
    updateState([id], state).then(() => {
      this.$message.success(msg)
      this.refreshList()
    }).finally(() => {
      this.$set(this.stateLoadingMap, id, false)
    })
  }
}
```

后端 `PlanUserClientServiceImpl.java:61`:
```java
@RedisLock(key = "'plan:start:' + #planId + '-' + #userId", expire = 30000)
@Transactional(rollbackFor = Exception.class)
@Override
public void firstStart(String planId, String userId, String password) {
    // ... 原有代码 ...
}
```

**兼容性分析**:
- **兼容**:锁 30s 兜底,1.5.1 DDL UNIQUE KEY 已兜底数据库层
- **风险**:锁过期 30s > 业务平均耗时(<5s),不会出现误锁
- **回滚**:git tag v0.5.bugfix-10 一键回滚

---

## 六、B-021 字段冗余方案(已定)

**Bug**:`BUG-20260928-B-021` PlanNodeDTO 双份返回(fileDurationsJson 字符串 + fileDurations List 对象)

### 选定方案:**方案 B DDD 合规**(主公 2026-09-28 拍板)

**修复路径**:
1. 拆 `PlanNodePublicDTO`(对外给前端,不含 JSON 字段)
2. 保留 `PlanNodeInternalDTO`(对内,含 JSON 字段,给内部 Service 调用)
3. `PlanNodeDTO` 标记 `@Deprecated`,逐步替换

**兼容性分析**:
- 前端调用方需 grep 确认是否依赖 JSON 字符串
- 历史 JSON 数据需保留(避免解析失败)
- DTO 反序列化兼容(Jackson 默认忽略未知字段)
- 旧 `PlanNodeDTO` 保留 `@Deprecated` 兼容期,新代码走 `PlanNodePublicDTO`

**预计工作量**:3-5 个文件,~1 dev·hour

---

## 七、Low 技术债 3 项(仅记录,不修)

> **主公 2026-09-28 拍板:仅在文档中记录,本次不修。**

(以下内容作为展开参考,供未来拍板时查询)

### L-Bug-1:DDD 三层规范 95% 失效

**现状**:
- 95 个 ServiceImpl extends ServiceImpl<Mapper, Entity>(违规)
- 240 处 Controller @RequestBody DTO(违规)
- 500+ Package 路径违规(全在 `modules.<area>.<sub>.{controller,dto,entity,mapper}`,而非 AGENTS.md 要求的 `controller.vo` / `service.dto` / `repository.entity`)

**根因**:AGENTS.md 是"愿景",实际只有 1 个模块(yf-module-training-sign-in)符合规范。其他都是历史代码。

**业务影响**:
- Service 直接持有 Mapper + Entity,业务逻辑和持久化未分离
- 改字段类型从 Controller 一路穿透到 DB,无边界
- 跨模块依赖混乱(plan → exam 直引 Entity)

**修复选项**:
- A. **冻结新功能,逐模块灰度重构**(推荐)
- B. 全量重构 95 个模块(工作量巨大,2-3 月)
- C. 写新代码按 DDD,旧代码不改(技术债永远欠着)

**兼容性分析**(所有选项):
- ServiceImpl → Repository 拆分会涉及 Mapper 调用层,改 100+ 处
- 包路径迁移需要 alias 配置
- 测试用例需重新写

---

### L-Bug-2:SysDepartController.batch-add 无 Shiro 注解

**现状**:`SysDepartController.java:68` `@PostMapping("/batch-add")` **无** `@RequiresPermissions`

**业务影响**:任何登录用户可批量添加部门,污染组织架构

**修复**:
- 加 `@RequiresPermissions("sys:depart:batchAdd")`
- 同时检查 `ShiroConfig` 的 anon 名单是否放过这个路径
- 加单元测试覆盖"无权限调用"的拒绝逻辑

**兼容性分析**:
- **兼容**:现有 admin 用户不受影响
- **风险**:角色权限配置可能未给"sys:depart:batchAdd"权限,会导致已有用户无法使用(需要给角色补权限)

---

### L-Bug-3:SysUserService 角色变更触发全局菜单缓存清空

**现状**:`SysUserServiceImpl.java:583-584` `@CacheEvict(value = CacheKey.MENU, allEntries = true)`

**业务影响**:
- admin 改任意用户角色 → 触发全局菜单缓存清空
- 所有在线用户下次请求穿透到 DB → DB CPU 100% 雪崩

**修复**:
```java
// 改为定向失效(只清受影响 userId)
@CacheEvict(value = CacheKey.MENU, key = "#userName")
public void save(...) { ... }
```

**兼容性分析**:
- **兼容**:缓存清理从"全清"变"定向清",其他用户不受影响
- **风险**:角色变更可能影响多个 userId 的菜单权限(需要先查受影响 userIds 集合,再循环定向清)

---

## 八、验证策略(主公 2026-09-28 拍板)

> **主公 2026-09-28 拍板:T1.x 全部 Critical 修完一次性出报告 + git diff 汇总**。**每次修复后必跑验证**。

| 维度 | 策略 |
|---|---|
| **后端** | `mvn test`(每修一个 batch 跑一次) |
| **前端** | `npm run lint` + `npm run build:local`(每修一个 batch 跑一次) |
| **规范文档同步** | CLAUDE.md / AGENTS.md / README / db/GOVERNANCE.md 在每批次报告前同步 |

### 验证流程(每个 batch)
```bash
# 后端
mvn clean compile -pl yf-module-plan,yf-modules/...
mvn test -Dtest=PlanServiceImplTest
mvn clean test  # 全量回归

# 前端
cd Frontend/vue/wk-train-center-ui
npm run lint
npm run build:local
```

### 验证项清单
- [ ] 编译通过(mvn compile / tsc)
- [ ] 单元测试通过(覆盖修复点的新测试)
- [ ] lint 无新增警告
- [ ] 手动验证:跑修复的场景(按修复方案写测试用例)
- [ ] 兼容性验证:老数据/老接口调用不报错

---

## 九、待 grill-me 主公的剩余问题

| # | 问题 | 主公待决定 |
|---|---|---|
| 1 | 修复版本号是否同步更新 pom.xml? | 是(升 0.5.0 → 0.5.1)/ 否(只 git tag) |
| 2 | 修复后 bug 索引文档是否同步更新状态? | 是(✅ 标记已修复)/ 否 |
| 3 | 修复前后是否出 changelog? | 是 / 否 |
| 4 | B-001~B-009 等大 bug 修复顺序是否按本计划(T1.2→T1.3→...T1.11)还是按文件路径就近修? | 按本计划(主公可改顺序)/ 按就近 |
| 5 | 删除 training-plan/ 目录前是否 grep 全仓验证无引用? | 是 / 否(主公已确认全删,但稳妥起见 grep 一遍) |

---

## 十、累计 / 下一步候选

| 维度 | 数据 |
|---|---|
| 修复总项数 | **52 项**(13 Critical - 1 跳过 B-004 - 1 废除 B-005 - 1 废除 F-001 + 11 High 修 + 12 High 不关心 + 14 Medium 修 + 12 Medium 不关心/不决 + 19 Low 先不管)|
| 批次总数 | **16 批**(T0 准备 + T1.1 废除 + T1.2-T1.4 大 bug × 3 + ~~T1.5 B-004 跳过~~ + T1.6-T1.11 大 bug × 6 + T1.12 待启动 + T2.1-T2.5 高 5 批 + T3.1-T3.5 中 5 批)|
| 总工时 | ~45 dev·hour(2 dev·day)|
| 备份次数 | 15 次 git tag |
| 验证 | 后端 `mvn test` / 前端 `npm run lint + build:local`(主公 2026-09-28 拍板)|

### 主公下一步

| 选项 | 内容 |
|---|---|
### 待主公最后拍板(剩余 4 项)

| # | 问题 | 主公拍板 |
|---|---|---|
| 1 | 修复版本号是否同步更新 pom.xml? | ❌ **不升**(主公 2026-09-28 拍板) |
| 2 | 修复后 bug 索引文档是否同步更新状态? | ✅ **是**(主公 2026-09-28 拍板) |
| 3 | 修复前后是否出 changelog? | ✅ **是,白话风格,不要中英文穿插**(主公 2026-09-28 拍板) |
| 4 | 修复是否同步更新 db/GOVERNANCE.md? | ⏸ **DB 改动需 grill-me**(主公 2026-09-28 规则) |

---

## 十一、主公下一步