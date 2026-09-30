# 2026-09-28 业务 Bug 索引

> **报告类型**:业务逻辑 Bug 索引(主公聚焦业务,运维类不收录)
> **建立日期**:2026-09-28
> **关联报告**:
> - `2026-09-27-eval-findings.md`(运维专项)
> - `2026-09-27-business-logic-bugs.md`(业务专项)
> - `2026-06-24-培训学习域增强迭代.md`(历史决策)
>
> **更新约定**:本文件每月新建一份(YYYY-MM-DD 命名),旧 bug 状态变化时同步更新

---

## ID 命名规则

```
BUG-{YYYYMMDD}-{B|F|FB}-{3位序号}
```

- **B** = 后端问题
- **F** = 前端问题
- **FB** = 前后端联合问题
- **3 位序号**:在同一标识内按优先级 Critical → High → Medium → Low 递增

## 状态字段

| 图标 | 含义 |
|---|---|
| ⏳ | 待修复 |
| 🔧 | 修复中 |
| ✅ | 已修复 |
| ❌ | 已废弃(决策不修) |
| 🚫 | 已拒绝(确认不是 bug) |

## 严重度

| 图标 | 含义 | 处理时间 |
|---|---|---|
| 🔴 | Critical — 必修中的必修 | 48 小时内 |
| 🟠 | High — 重要 | 1 周内 |
| 🟡 | Medium — 业务能用但有瑕疵 | 2 周内 |
| 🟢 | Low — 优化项 | 季度内 |

---

## 📊 总览

| 标识 | 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low | 合计 |
|---|---|---|---|---|---|
| **(B) 后端** | 9 | 14 | 18 | 10 | **51** |
| **(F) 前端** | 1 | 7 | 8 | 9 | **25** |
| **(FB) 前后端联合** | 3 | 2 | 0 | 0 | **5** |
| **合计** | **13** | **23** | **26** | **19** | **81** |

---

## 🔴 Critical(13 项)

### `BUG-20260928-B-001`:删除培训计划不级联学员数据
- **标识**:(B) 后端
- **优先级**:🔴 Critical
- **白话**:删除培训计划时,学员的学习进度和补考授权没一起删,变成"孤儿数据",学员端还能看到已删计划的进度
- **文件**:`e:/rhProject/Backend/wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/admin/plan/service/impl/PlanServiceImpl.java` 第 137-148 行
- **影响**:学员困惑 / 管理员审计错乱
- **状态**:✅ **已修复(T1.2 2026-09-28 抽 PlanDeletedEvent 领域事件重构 + T1.8 2026-09-28 IFNULL 兼容)**
- **关联报告**:`2026-09-27-business-logic-bugs.md` BC-002

### `BUG-20260928-B-002`:删除课程不级联学员学习记录
- **标识**:(B) 后端
- **优先级**:🔴 Critical
- **白话**:删除课程时,学员的学习进度没一起删,课程没了学习记录还在
- **文件**:`e:/rhProject/Backend/wk-train-center-service/yf-modules/yf-module-course/src/main/java/com/yf/course/modules/admin/service/impl/CourseServiceImpl.java` 第 119-136 行
- **影响**:学员"我的课程"出现已删课程 / 统计报表错乱
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BC-003

### `BUG-20260928-B-003`:AI 答疑模块缺 plan_id/node_ref_id 字段
- **标识**:(B) 后端
- **优先级**:🔴 Critical
- **白话**:AI 答疑模块缺"计划编号"和"节点编号"字段,陪练记录无法关联到具体学习任务,所有陪练历史混在一起
- **文件**:`e:/rhProject/Backend/wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/infra/entity/TrainingRecordEntity.java` 第 22-77 行
- **影响**:学员无法按学习任务过滤 AI 陪练记录
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BC-004

### `BUG-20260928-B-004`:站内信缺 routeType/routeId/routeUrl 路由字段
- **标识**:(B) 后端
- **优先级**:🔴 Critical
- **白话**:站内信缺"路由类型/编号/链接"3 个字段,点击通知只能跳到模板默认页面,无法直接跳到任务/补考/延期页
- **文件**:`e:/rhProject/Backend/wk-train-center-service/yf-modules/yf-module-notify/src/main/java/com/yf/notify/modules/notify/entity/Msg.java` 第 18-97 行
- **影响**:学员每次点通知都得手动找任务 / 补考通知完全失效
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BC-005

### `BUG-20260928-B-005`:15 张核心数据表无软删除(物理硬删)
- **标识**:(B) 后端
- **优先级**:🔴 Critical
- **白话**:15 张核心数据表的"软删除"功能都没启用,删除就是物理删除,误删无法恢复(培训计划、培训节点、培训学员、课程、站内信、考试、试卷、AI 陪练等)
- **文件**:实体类分散在 `yf-module-plan/.../entity/`、`yf-module-course/.../entity/`、`yf-module-notify/.../entity/`、`yf-module-exam/.../entity/`、`wk-module-ai/.../entity/` 多个目录
- **影响**:全员误删无法恢复 / 产品要求的回收站不存在
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BC-010

### `BUG-20260928-B-006`:11 处事务内调用定时任务接口(事务回滚无效)
- **标识**:(B) 后端
- **优先级**:🔴 Critical
- **白话**:11 个地方在事务里调用了定时任务接口,事务回滚了但定时任务已经写进数据库
- **文件**:PlanServiceImpl(培训计划)、CourseServiceImpl(课程)、PlanUserServiceImpl(延期)、ExamServiceImpl(考试)等 11 处
- **影响**:全员数据状态与通知不一致,排查极难
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BC-009
- **修复状态**:✅ **T1.6 (2026-09-28) 已修复(仅 plan 模块) — 6 处事务内 addCronJob 改 afterCommit 钩子,主事务提交后才写 Quartz;PlanFirstCheckJob 同时 fixJobName 固定防堆积;4 文件 + 80/-80 commit**

### `BUG-20260928-B-007`:PlanFirstCheckJob 无限堆积(JobName autoName)
- **标识**:(B) 后端
- **优先级**:🔴 Critical
- **白话**:编辑同一个培训计划 5 次,数据库里堆积 5 个定时任务,运维表不断膨胀
- **文件**:`e:/rhProject/Backend/wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/admin/plan/service/impl/PlanServiceImpl.java` 第 127 行
- **影响**:运维定时任务表膨胀 / 重编辑触发多个任务
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BC-006
- **修复状态**:✅ **T1.6 (2026-09-28) 已与 B-006 合并 — PlanFirstCheckJob jobName=null → 固定 'PlanFirstCheck_<planId>',JobServiceImpl 先 deleteJob 后 scheduleJob 自动幂等;同时改 afterCommit**

### `BUG-20260928-B-008`:节点软删除字段过滤误伤历史已删节点
- **标识**:(B) 后端
- **优先级**:🔴 Critical
- **白话**:节点软删除字段过滤会误伤历史已删节点,学员端"重新解锁"流程卡死
- **文件**:`e:/rhProject/Backend/wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/admin/plan/service/impl/PlanNodeServiceImpl.java` 第 228-245 行 `.eq("deleted", 0)`
- **影响**:学员被删除节点的进度卡死,无法继续学习
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BC-011

### `BUG-20260928-B-009`:删除课程不校验是否已有学员学习
- **标识**:(B) 后端
- **优先级**:🔴 Critical
- **白话**:删除课程时已经有学员在学习也能直接删,完全没有阻止
- **文件**:`e:/rhProject/Backend/wk-train-center-service/yf-modules/yf-module-course/src/main/java/com/yf/course/modules/admin/service/impl/CourseServiceImpl.java` 第 119-136 行
- **影响**:学员学习进度孤儿(同 B-002 根因,合并修复)
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-002

### `BUG-20260928-F-001`:年度培训计划收集 9 个接口 404
- **标识**:(F) 前端
- **优先级**:🔴 Critical
- **白话**:年度培训计划收集模块前端有 9 个接口点了没反应(404)——管理员"年度培训计划收集"菜单加载空,学员填报入口完全坏掉
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/src/api/training-plan/annual-plan.js` + `my-plan.js` + `api/plan/user.js:44`(score-merge 端点)
- **影响**:管理员菜单空 / 学员填报入口失效
- **状态**:⏳ 待修复(主公拍板:删前端 OR 补后端)
- **关联报告**:`2026-09-27-business-logic-bugs.md` FC-001

### `BUG-20260928-FB-001`:节点通知三件套假实现
- **标识**:(FB) 前后端联合
- **优先级**:🔴 Critical
- **白话**:节点通知里"只通知未开始学员""提前 N 天提醒""定时发送"3 个功能都是假的——管理员选了"未开始学员"实际全员都收到,选了"提前 3 天"根本不调度,选了"定时发送"只是打个日志没真发
- **文件**:后端 `e:/rhProject/Backend/wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/admin/node/controller/NodeController.java` 第 60-93 行;前端 `e:/rhProject/Frontend/vue/wk-train-center-ui/src/views/admin/plan/plan/components/NodeNotifyDialog.vue`
- **影响**:管理员误以为功能正常 / 学员收到全员骚扰投诉
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FC-004 / BC-007

### `BUG-20260928-FB-002`:编辑培训计划删节点后学员进度悄悄丢失
- **标识**:(FB) 前后端联合
- **优先级**:🔴 Critical
- **白话**:编辑培训计划删节点后,学员的进度被悄悄丢失,管理员看不到任何提示,学员端突然完成度倒退
- **文件**:后端 `e:/rhProject/Backend/wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/admin/plan/service/impl/PlanGroupServiceImpl.java` 第 117-160 行;前端:表单保存后无感知
- **影响**:学员完成度倒退投诉"我明明看了那个课程"
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FC-005 / BC-008

### `BUG-20260928-FB-003`:管理员点开始培训无防重复机制
- **标识**:(FB) 前后端联合
- **优先级**:🔴 Critical
- **白话**:管理员点"开始培训"按钮无防重复机制,前端无加载锁、后端无锁,高并发会重复插入参加记录,完成率超过 100%
- **文件**:前端 `e:/rhProject/Frontend/vue/wk-train-center-ui/src/views/admin/plan/plan/index.vue` 第 252-258 行;后端 `PlanUserClientServiceImpl.firstStart` 无 `@RedisLock`
- **影响**:学员收到 2-3 条重复通知 / 统计完成率数据脏
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FC-003

---

## 🟠 High(23 项)

### `BUG-20260928-B-010`:PlanUser 状态机注释 3 态 vs 代码 5 态不一致
- **标识**:(B) 后端
- **优先级**:🟠 High
- **白话**:PlanUser 学员状态字段代码注释写"3 个状态",实际代码有 5 个状态,新人接手会写错
- **文件**:注释 `yf-module-plan/.../entity/PlanUser.java` 第 59-64 行 vs 代码 `PlanClientServiceImpl.java:543`
- **影响**:开发误判延期进行中学员为已超期
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-001

### `BUG-20260928-B-011`:培训计划状态枚举散落无统一管理
- **标识**:(B) 后端
- **优先级**:🟠 High
- **白话**:培训计划状态枚举散落各处,没有统一管理类
- **文件**:`yf-module-plan/.../service/impl/PlanServiceImpl.java` 第 102 行 + 各 Controller
- **影响**:开发字段含义靠记忆
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-002

### `BUG-20260928-B-012`:节点类型 cert/survey/battle/activity 仅 log 未实现
- **标识**:(B) 后端
- **优先级**:🟠 High
- **白话**:节点类型(cert/survey/battle/activity 等)只 log 一行没真实现
- **文件**:`yf-module-plan/.../service/impl/PlanNodeServiceImpl.java`
- **影响**:管理员这些节点类型不可用
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-003

### `BUG-20260928-B-013`:课程状态改动无范围校验
- **标识**:(B) 后端
- **优先级**:🟠 High
- **白话**:课程状态改动无范围校验,可设任意值
- **文件**:`yf-module-course/.../service/impl/CourseServiceImpl.changeState`
- **影响**:开发可绕过业务规则
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-004

### `BUG-20260928-B-014`:站内信发送状态 1 和 3 重复定义
- **标识**:(B) 后端
- **优先级**:🟠 High
- **白话**:站内信发送状态字段 1 和 3 重复定义(应合并)
- **文件**:`yf-module-notify/.../Msg.java` + `MsgState.java`
- **影响**:开发状态码歧义
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-005

### `BUG-20260928-B-015`:暂停/取消培训计划不发通知
- **标识**:(B) 后端
- **优先级**:🟠 High
- **白话**:暂停/取消培训计划时不给学员发通知,学员不知道培训去哪了
- **文件**:`PlanServiceImpl.java:200-225`(`state=1/2` 不发通知)
- **影响**:学员客诉"我的培训去哪了"
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-008

### `BUG-20260928-B-016`:复制培训计划后节点时间还是旧的副本过期
- **标识**:(B) 后端
- **优先级**:🟠 High
- **白话**:复制培训计划后,节点级开始/结束时间还是旧的,副本节点已过期无法开始
- **文件**:`PlanServiceImpl.copy()` 第 285-301 行
- **影响**:学员复制后的计划无法学习
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-009

### `BUG-20260928-B-017`:培训计划密码字段明文返回给前端
- **标识**:(B) 后端
- **优先级**:🟠 High
- **白话**:培训计划密码字段明文返回给前端,管理员可越权看口令密码
- **文件**:`yf-module-plan/.../dto/PlanDTO.java` 第 58-59 行 + `PlanServiceImpl.simpleDetail:177-188`
- **影响**:管理员可自助开班
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-010

### `BUG-20260928-B-018`:学员未完成列表接口用 GET 与模块其他 POST 不一致
- **标识**:(B) 后端
- **优先级**:🟠 High
- **白话**:学员未完成列表接口用 GET,与同模块其他接口风格不一致
- **文件**:`yf-module-plan/.../controller/PlanUserController.java` 第 100-103 行
- **影响**:开发 API 风格不统一
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-011

### `BUG-20260928-B-019`:课程文件学习记录空字符串和空值判断错
- **标识**:(B) 后端
- **优先级**:🟠 High
- **白话**:课程文件学习记录空字符串和空值判断错,误归类自学/指派
- **文件**:`yf-module-course/.../mapper/CourseFileLearnMapper.xml`
- **影响**:统计学分口径分裂
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-012

### `BUG-20260928-B-020`:课程保存时重算学员进度异常导致整个保存失败
- **标识**:(B) 后端
- **优先级**:🟠 High
- **白话**:课程保存时重算学员进度,异常导致整个保存失败
- **文件**:`CourseServiceImpl.java:208-212` `courseLearnService.reCheck()`
- **影响**:管理员改个标题就报错
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-013

### `BUG-20260928-B-021`:培训节点数据双份返回(JSON 字符串 + 对象)
- **标识**:(B) 后端
- **优先级**:🟠 High
- **白话**:培训节点数据双份返回(JSON 字符串 + 对象)
- **文件**:`yf-module-plan/.../dto/PlanNodeDTO.java` 第 57-61 行
- **影响**:前端数据冗余
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-015

### `BUG-20260928-B-022`:培训计划列表字段契约未文档化
- **标识**:(B) 后端
- **优先级**:🟠 High
- **白话**:培训计划列表"延期进行中/累计延期"2 个数字段契约没文档化
- **文件**:`yf-module-plan/.../mapper/PlanMapper.xml` 第 39-46 行
- **影响**:前端 Vue 渲染逻辑硬编码魔数
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-016

### `BUG-20260928-B-023`:学员节点完成判断用 List.contains 是慢速算法
- **标识**:(B) 后端
- **优先级**:🟠 High
- **白话**:学员节点完成判断用 List.contains 是慢速算法
- **文件**:`PlanUserServiceImpl.java:131-139`
- **影响**:性能:1000 节点 × 100 学员 = 100 万次比较
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BH-021

### `BUG-20260928-F-002`:编辑既有考试前端保存清空原口令
- **标识**:(F) 前端
- **优先级**:🟠 High
- **白话**:编辑既有考试时,前端保存会清空原口令(后端不返口令字段,前端校验通过保存即覆盖)
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/src/views/admin/exam/exam/form.vue:329`
- **影响**:管理员每次编辑都改密码
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FH-001

### `BUG-20260928-F-003`:学员成绩字段空值前端 toFixed 崩溃白屏
- **标识**:(F) 前端
- **优先级**:🟠 High
- **白话**:学员成绩字段空值时前端 `.toFixed(2)` 直接崩溃白屏
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/src/views/admin/plan/stat/components/PlanUserList.vue`
- **影响**:管理员表格渲染崩溃
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FH-002

### `BUG-20260928-F-004`:多语言切换只影响 Element-UI 内置文案
- **标识**:(F) 前端
- **优先级**:🟠 High
- **白话**:多语言切换只影响 Element-UI 内置文案,业务文案 90% 都是硬编码中文
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/src/i18n/index.js:18` locale 写死 `'zh'`
- **影响**:业务国际化失效
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FH-003

### `BUG-20260928-F-005`:多页签工作流默认关闭
- **标识**:(F) 前端
- **优先级**:🟠 High
- **白话**:多页签工作流默认关闭,管理员同时编辑多个计划/考试时需反复走列表
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/src/settings.js:14` `tagsView: false`
- **影响**:管理员效率降低
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FH-004

### `BUG-20260928-F-006`:学员站内信刷新靠用户手动点
- **标识**:(F) 前端
- **优先级**:🟠 High
- **白话**:学员站内信刷新靠用户手动点,容易漏通知
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/src/views/web/ucenter/WebNoticeList.vue`
- **影响**:学员漏通知
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FH-005

### `BUG-20260928-F-007`:批量修改教师按钮逻辑有竞态
- **标识**:(F) 前端
- **优先级**:🟠 High
- **白话**:"批量修改教师"按钮逻辑有竞态,失败时部分课程已更新
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/src/views/admin/course/index.vue:80-101`
- **影响**:管理员数据不一致
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FH-006

### `BUG-20260928-F-008`:培训计划保存后端漏返 ID 前端无兜底
- **标识**:(F) 前端
- **优先级**:🟠 High
- **白话**:培训计划保存后端不返回新编号,前端"保存后下一步"流程直接卡死(课程模块已修复,计划模块漏修)
- **文件**:前端 `views/admin/plan/plan/form.vue`
- **影响**:管理员新建培训计划后无法继续操作
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FC-002

### `BUG-20260928-FB-004`:编辑既有考试口令被清空(前后端联合)
- **标识**:(FB) 前后端联合
- **优先级**:🟠 High
- **白话**:编辑既有考试口令被清空(后端 `Exam.java:72` DTO 缺字段不返 + 前端 `exam/form.vue:329` 必填校验)
- **文件**:后端 `e:/rhProject/Backend/wk-train-center-service/yf-modules/yf-module-exam/src/main/java/com/yf/exam/modules/admin/exam/entity/Exam.java` 第 72 行;前端 `views/admin/exam/exam/form.vue:329`
- **影响**:管理员每次编辑都改密码
- **状态**:⏳ 待修复(优先)
- **关联报告**:`2026-09-27-business-logic-bugs.md` F-002

### `BUG-20260928-FB-005`:缓存清理/标记字段/异步加载组合 bug
- **标识**:(FB) 前后端联合
- **优先级**:🟠 High
- **白话**:缓存清理标记字段异步加载组合 bug,后端清缓存与前端表单状态不同步
- **文件**:多文件
- **影响**:开发调试困难
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FH(综合)

---

## 🟡 Medium(26 项)

### `BUG-20260928-B-024`:培训计划学员列表每页查 8000 次子查询
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:培训计划学员列表每翻一页查 8000 次子查询,大列表 5-8 秒
- **文件**:`yf-module-plan/src/main/resources/mapper/admin/user/PlanUserMapper.xml` 第 71-79、92-101 行
- **影响**:管理员慢
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-015

### `BUG-20260928-B-025`:题库统计每次访问查 125 次数据库
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:题库统计每次访问查 125 次数据库
- **文件**:`yf-module-stat/src/main/java/com/yf/stat/modules/repo/service/impl/StatRepoServiceImpl.java` 第 50-72 行
- **影响**:管理员 5-8 秒
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-016

### `BUG-20260928-B-026`:编辑计划迁移进度 1000 条 = 1000 次单条更新
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:编辑计划迁移进度,1000 条 = 1000 次单条更新
- **文件**:`yf-module-plan/.../PlanGroupServiceImpl.java` 第 147-153 行
- **影响**:管理员 30 秒+
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-018

### `BUG-20260928-B-027`:钉钉工作通知循环嵌套 100 万次
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:钉钉工作通知循环里嵌套循环,1 万学员 × 100 计划 = 100 万次
- **文件**:`PlanClientServiceImpl.java:215-300`
- **影响**:运维数据库压力
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-025

### `BUG-20260928-B-028`:缓存清理用清空所有导致缓存雪崩(7 处)
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:缓存清理用"清空所有"导致缓存雪崩(7 处)
- **文件**:`SysUserServiceImpl:582-583`、`SysMenuServiceImpl:56/118/325/367`、`SysKeyPointServiceImpl:64`、`SysDepartServiceImpl:67/75`、`CfgPropServiceImpl:171`、`SysRoleMenuServiceImpl:64`
- **影响**:全员高峰期 DB 100%
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-017

### `BUG-20260928-B-029`:缓存过期注释掉模板答案改了学员答对判错
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:缓存过期注释掉了,模板答案改了学员答对判错
- **文件**:`ExamQuCorrectServiceImpl.java:110`、`TmplQuServiceImpl.java:48`
- **影响**:学员评分事故
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-018

### `BUG-20260928-B-030`:培训计划学员 5 状态计算走两套算法易漂移
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:培训计划学员 5 状态计算走两套算法,易漂移
- **文件**:`PlanUserServiceImpl.checkFinished` vs `PlanClientServiceImpl.calculateActualStateSnapshot`
- **影响**:学员状态判定错
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-026

### `BUG-20260928-B-031`:培训计划保存消息接口是空实现静默丢消息
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:培训计划保存消息接口是空实现,静默丢消息
- **文件**:`yf-module-notify/.../service/impl/MsgServiceImpl.java` 第 254-258 行
- **影响**:开发
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BM-011

### `BUG-20260928-B-032`:课程 forPlan 字段已废弃但还在序列化暴露前端
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:课程"forPlan"字段已废弃但还在,序列化暴露前端
- **文件**:`yf-module-course/.../entity/Course.java` 第 174-176 行
- **影响**:前端
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-029

### `BUG-20260928-B-033`:复制标记字段 fromCopy 内部用但暴露给前端
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:复制标记字段 fromCopy 内部用但暴露给前端
- **文件**:`yf-module-plan/.../dto/PlanDTO.java:80`
- **影响**:前端
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-030

### `BUG-20260928-B-034`:课程删除无软删/禁用通道
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:课程删除走"是否有人学习"校验但没"软删/禁用"通道
- **文件**:`yf-module-course/.../service/impl/CourseServiceImpl.java:119-136`
- **影响**:管理员无标准暂停流程
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-027

### `BUG-20260928-B-035`:__splice_abc 脏数据让整条消息详情接口 500
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:`__splice_abc` 脏数据会让整条消息详情接口 500
- **文件**:`yf-module-notify/.../service/impl/MsgPropServiceImpl.java:79-116`
- **影响**:管理员消息详情打不开
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-024

### `BUG-20260928-B-036`:14 个定时任务失败仅日志业务层感知不到
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:所有 14 个定时任务失败仅日志,业务层完全感知不到
- **文件**:`yf-job/src/main/java/com/yf/job/service/impl/JobServiceImpl.java` 第 87-89 行
- **影响**:全员通知漏发无人知晓
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-028

### `BUG-20260928-B-037`:定时任务没有失败重试机制
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:定时任务没有失败重试机制
- **文件**:同上
- **影响**:全员网络抖动丢通知
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-029

### `BUG-20260928-B-038`:定时任务没有死信队列 DLQ
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:定时任务没有死信队列(DLQ)
- **文件**:同上
- **影响**:全员失败即丢
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-029

### `BUG-20260928-B-039`:8 张核心表无部门编号字段跨部门数据混在一起
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:课程学习记录、AI 陪练历史、培训学员节点、站内信、试卷、考试记录、培训学员、补考授权 8 张表都无"部门编号"字段,跨部门数据混在一起
- **文件**:表 `el_course_learn` / `el_training_record` / `el_plan_user_node` / `el_msg` / `el_paper` / `el_exam_record` / `el_plan_user` / `el_plan_makeup`
- **影响**:合规跨部门数据泄漏
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-014

### `BUG-20260928-B-040`:培训计划有部门字段但查询时不加过滤
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:培训计划有部门字段但查询时不加过滤,管理员全局可见所有部门
- **文件**:`yf-module-plan/.../mapper/PlanMapper.xml:paging`
- **影响**:管理员越权查看
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-014

### `BUG-20260928-B-041`:站内信无部门隔离字段
- **标识**:(B) 后端
- **优先级**:🟡 Medium
- **白话**:站内信无部门隔离字段
- **文件**:`yf-module-notify/.../entity/Msg.java`
- **影响**:全员跨部门通知
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-014

### `BUG-20260928-F-009`:大列表无虚拟滚动 500 行以上卡死
- **标识**:(F) 前端
- **优先级**:🟡 Medium
- **白话**:大列表无虚拟滚动,500 行以上卡死 3-5 秒
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/src/views/admin/plan/stat/process.vue` 等多页面
- **影响**:管理员卡
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FM-011

### `BUG-20260928-F-010`:列表渲染缺 key 共 62 处
- **标识**:(F) 前端
- **优先级**:🟡 Medium
- **白话**:列表渲染缺 key 共 62 处(148 个 v-for / 86 个有 key)
- **文件**:全前端项目 `e:/rhProject/Frontend/vue/wk-train-center-ui/src/views/**/*.vue`
- **影响**:开发维护负担 + 性能
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FM-012

### `BUG-20260928-F-011`:流式接收答题时全量重渲染学员切题闪现
- **标识**:(F) 前端
- **优先级**:🟡 Medium
- **白话**:流式接收答题时全量重渲染,学员切题闪现
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/src/views/web/exam/WebExamStart.vue:46-91`
- **影响**:学员体验掉档
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FM-001

### `BUG-20260928-F-012`:时区问题数据库 UTC 存前端东八区显示
- **标识**:(F) 前端
- **优先级**:🟡 Medium
- **白话**:时区问题,数据库 UTC 存,前端东八区显示,跨日学习记录对不上
- **文件**:全前端 `format('YYYY-MM-DD')` 用法
- **影响**:学员日期错乱
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FL-004

### `BUG-20260928-F-013`:错误信息直接展示后端异常细节 SQL 堆栈
- **标识**:(F) 前端
- **优先级**:🟡 Medium
- **白话**:错误信息直接展示后端异常细节(SQL/堆栈)
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/src/views/admin/exam/exam/index.vue:309/317/326` 等
- **影响**:开发信息泄漏
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FM(综合)

### `BUG-20260928-F-014`:i18n 业务文案 90% 未走 $t()
- **标识**:(F) 前端
- **优先级**:🟡 Medium
- **白话**:i18n 业务文案 90% 未走 `$t()`
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/src/i18n/index.js` + 全前端
- **影响**:业务国际化失效
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FM-008

### `BUG-20260928-F-015`:字典翻译未走 @Dict 前端硬编码
- **标识**:(F) 前端
- **优先级**:🟡 Medium
- **白话**:字典翻译未走 `@Dict` 注解,前端硬编码魔数
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/src/views/admin/plan/plan/index.vue:281-307` 等
- **影响**:前端开发
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FM-004

### `BUG-20260928-F-016`:考试状态保存时前端漏传开启阅卷信号
- **标识**:(F) 前端
- **优先级**:🟡 Medium
- **白话**:考试状态保存时前端漏传"开启阅卷"信号,提交手阅失效
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/src/api/exam/exam.js:95-97`
- **影响**:管理员阅卷流程失效
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FM-006

---

## 🟢 Low(19 项)

### `BUG-20260928-B-042`:字典翻译 @Dict 注解缺
- **标识**:(B) 后端
- **优先级**:🟢 Low
- **白话**:字典翻译未补齐(`@Dict` 注解缺)
- **文件**:多个 DTO
- **影响**:前端
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` BL-033

### `BUG-20260928-B-043`:旧版 Docker 镜像 openjdk:8u131
- **标识**:(B) 后端
- **优先级**:🟢 Low
- **白话**:旧版 Docker 镜像 `openjdk:8u131`(2017 已 EOL)
- **文件**:`yf-web/src/main/docker/Dockerfile:2`
- **影响**:运维
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` L-002

### `BUG-20260928-B-044`:手写线程池无 @PreDestroy 4 处资源泄漏
- **标识**:(B) 后端
- **优先级**:🟢 Low
- **白话**:手写线程池无 `@PreDestroy`(4 处资源泄漏)
- **文件**:`QuReportServiceImpl:50`、`ExamApplyServiceImpl:51`、`Downloader.java:79`、`ExamMsgJobStarter.java:26`
- **影响**:运维
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` H-010

### `BUG-20260928-B-045`:SysUser 默认密码硬编码 Welcome@2024
- **标识**:(B) 后端
- **优先级**:🟢 Low
- **白话**:SysUser 默认密码硬编码 `Welcome@2024`
- **文件**:`SysUserServiceImpl.java:116`
- **影响**:运维
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` L-004

### `BUG-20260928-B-046`:培训签到控制器 8 个端点无 Shiro 注解 IDOR
- **标识**:(B) 后端
- **优先级**:🟢 Low
- **白话**:培训签到控制器 8 个端点无 `@RequiresPermissions`(IDOR)
- **文件**:`yf-modules/yf-module-training-sign-in/.../controller/TrainingSignInController.java`(整文件)
- **影响**:运维
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` H-004

### `BUG-20260928-B-047`:@Version 乐观锁缺失并发写热点
- **标识**:(B) 后端
- **优先级**:🟢 Low
- **白话**:`@Version` 乐观锁缺失(PlanUser.state、ExamRecord.score、RepoTrainProcess.progress 并发写热点)
- **文件**:多个 Entity
- **影响**:运维
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` M-012

### `BUG-20260928-B-048`:@Transactional 缺 rollbackFor = Exception.class
- **标识**:(B) 后端
- **优先级**:🟢 Low
- **白话**:`@Transactional` 缺 `rollbackFor = Exception.class`(只对 RuntimeException 回滚)
- **文件**:多个 ServiceImpl
- **影响**:运维
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` M-002

### `BUG-20260928-B-049`:DDD 三层规范 95% 失效技术债
- **标识**:(B) 后端
- **优先级**:🟢 Low
- **白话**:DDD 三层规范 95% 失效(技术债,非业务)
- **文件**:全仓 95 ServiceImpl + 240 Controller-DTO + 500+ Package 违规
- **影响**:开发
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-eval-findings.md` H-001

### `BUG-20260928-B-050`:SysDepartController.batch-add 无 Shiro 注解
- **标识**:(B) 后端
- **优先级**:🟢 Low
- **白话**:SysDepartController.batch-add 无 Shiro 注解(运维,跨域交叉)
- **文件**:`SysDepartController.java:68`
- **影响**:运维
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-eval-findings.md` H-006

### `BUG-20260928-B-051`:SysUserService 角色变更触发全局菜单缓存清空
- **标识**:(B) 后端
- **优先级**:🟢 Low
- **白话**:SysUserService.save 角色变更触发全局菜单缓存清空(可用性)
- **文件**:`SysUserServiceImpl.java:583-584` `@CacheEvict(allEntries=true)`
- **影响**:全员
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` H-023

### `BUG-20260928-F-017`:时区问题全站未统一
- **标识**:(F) 前端
- **优先级**:🟢 Low
- **白话**:时区问题全站未统一
- **文件**:全前端
- **影响**:学员
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` FL-004

### `BUG-20260928-F-018`:Element-UI 老版本性能
- **标识**:(F) 前端
- **优先级**:🟢 Low
- **白话**:Element-UI 老版本性能
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/package.json`
- **影响**:性能
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` H-015

### `BUG-20260928-F-019`:Vue 2.7 已停止维护 2023-12 EOL
- **标识**:(F) 前端
- **优先级**:🟢 Low
- **白话**:Vue 2.7 已停止维护(2023-12 EOL)
- **文件**:同上
- **影响**:安全
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` H-014

### `BUG-20260928-F-020`:ESLint 规则 vue/no-v-html off 完全禁用 XSS 检测
- **标识**:(F) 前端
- **优先级**:🟢 Low
- **白话**:ESLint 规则 `vue/no-v-html: 'off'` 完全禁用 XSS 检测
- **文件**:`.eslintrc.js:41`
- **影响**:安全
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` M-012

### `BUG-20260928-F-021`:命名不一致 qu/qu.js 同时是目录又是文件
- **标识**:(F) 前端
- **优先级**:🟢 Low
- **白话**:命名不一致(qu/qu.js 同时是目录又是文件)
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/src/api/qu/`
- **影响**:开发
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` L-002

### `BUG-20260928-F-022`:App.vue / main.js 注释中重复声明 if/else
- **标识**:(F) 前端
- **优先级**:🟢 Low
- **白话**:App.vue / main.js 注释中重复声明 if/else
- **文件**:`App.vue`、`main.js`
- **影响**:代码质量
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` L-008

### `BUG-20260928-F-023`:train-center.tar.gz 12MB 已 commit 到 git
- **标识**:(F) 前端
- **优先级**:🟢 Low
- **白话**:`train-center.tar.gz` 12MB 已 commit 到 git
- **文件**:`e:/rhProject/Frontend/vue/wk-train-center-ui/train-center.tar.gz`
- **影响**:仓库体积
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` L-010

### `BUG-20260928-F-024`:依赖升级 vue-router / dropzone 等
- **标识**:(F) 前端
- **优先级**:🟢 Low
- **白话**:依赖升级(OkHttp 3.14.4 / Hutool 5.7.17 / vue-router 3.0.2 / dropzone 5.5.1)
- **文件**:`package.json`
- **影响**:运维
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` H-016

### `BUG-20260928-F-025`:缓存缺过期时间多个 @Cacheable 无 TTL
- **标识**:(F) 前端
- **优先级**:🟢 Low
- **白话**:缓存缺过期时间(多个 `@Cacheable` 无 TTL)
- **文件**:多个 ServiceImpl
- **影响**:运维
- **状态**:⏳ 待修复
- **关联报告**:`2026-09-27-business-logic-bugs.md` L-001

---

## 🔍 索引速查(按文件)

### 后端核心文件

| 文件 | 涉及 Bug ID |
|---|---|
| `yf-module-plan/.../service/impl/PlanServiceImpl.java` | B-001, B-007, B-015, B-016 |
| `yf-module-plan/.../service/impl/PlanGroupServiceImpl.java` | B-026, FB-002 |
| `yf-module-plan/.../service/impl/PlanNodeServiceImpl.java` | B-008, B-012 |
| `yf-module-plan/.../controller/NodeController.java` | FB-001 |
| `yf-module-plan/.../entity/PlanUser.java` | B-010 |
| `yf-module-course/.../service/impl/CourseServiceImpl.java` | B-002, B-009, B-020, B-034 |
| `yf-module-notify/.../entity/Msg.java` | B-004, B-014, B-041 |
| `yf-module-notify/.../service/impl/MsgServiceImpl.java` | B-031 |
| `yf-module-notify/.../service/impl/MsgPropServiceImpl.java` | B-035 |
| `wk-module-ai/.../entity/TrainingRecordEntity.java` | B-003 |
| `yf-modules/.../dto/PlanDTO.java` | B-017, B-033 |
| `yf-modules/.../dto/PlanNodeDTO.java` | B-021 |
| `yf-modules/.../mapper/PlanMapper.xml` | B-022, B-040 |
| `yf-modules/.../mapper/PlanUserMapper.xml` | B-024 |
| `yf-modules/.../mapper/CourseFileLearnMapper.xml` | B-019 |
| `yf-stat/.../service/impl/StatRepoServiceImpl.java` | B-025 |
| `yf-modules/.../controller/PlanUserController.java` | B-018 |
| `PlanClientServiceImpl.firstStart` | FB-003 |
| `PlanServiceImpl.copy()` | B-016 |
| `PlanServiceImpl.state()` | B-015 |
| `yf-modules/.../service/impl/PlanUserServiceImpl.java` | B-023 |
| `ExamQuCorrectServiceImpl.java` | B-029 |
| `TmplQuServiceImpl.java` | B-029 |
| `SysUserServiceImpl.java` | B-028, B-045, B-051 |
| `SysMenuServiceImpl.java` | B-028 |
| `SysKeyPointServiceImpl.java` | B-028 |
| `SysDepartServiceImpl.java` | B-028 |
| `CfgPropServiceImpl.java` | B-028 |
| `SysRoleMenuServiceImpl.java` | B-028 |
| `QuReportServiceImpl.java` | B-044 |
| `ExamApplyServiceImpl.java` | B-044 |
| `Downloader.java` | B-044 |
| `ExamMsgJobStarter.java` | B-044 |
| `yf-job/.../service/impl/JobServiceImpl.java` | B-036, B-037, B-038 |
| `yf-web/src/main/docker/Dockerfile` | B-043 |
| `yf-module-training-sign-in/.../controller/TrainingSignInController.java` | B-046 |

### 前端核心文件

| 文件 | 涉及 Bug ID |
|---|---|
| `src/api/training-plan/annual-plan.js` | F-001 |
| `src/api/training-plan/my-plan.js` | F-001 |
| `src/api/plan/user.js:44` | F-001 |
| `src/views/admin/exam/exam/form.vue:329` | F-002, FB-004 |
| `src/views/admin/plan/stat/components/PlanUserList.vue` | F-003 |
| `src/i18n/index.js:18` | F-004, F-014 |
| `src/settings.js:14` | F-005 |
| `src/views/web/ucenter/WebNoticeList.vue` | F-006 |
| `src/views/admin/course/index.vue:80-101` | F-007 |
| `src/views/admin/plan/plan/form.vue` | F-008 |
| `src/views/admin/plan/plan/index.vue:252-258` | FB-003 |
| `src/views/admin/plan/plan/components/NodeNotifyDialog.vue` | FB-001 |
| `src/views/admin/plan/stat/process.vue` | F-009 |
| `src/views/**/*.vue`(62 处 v-for 缺 key) | F-010 |
| `src/views/web/exam/WebExamStart.vue:46-91` | F-011 |
| `src/views/admin/exam/exam/index.vue:309/317/326` | F-013 |
| `src/api/exam/exam.js:95-97` | F-016 |
| `src/api/qu/` | F-021 |
| `App.vue`、`main.js` | F-022 |
| `train-center.tar.gz` | F-023 |
| `package.json` | F-018, F-019, F-024, F-025 |
| `.eslintrc.js:41` | F-020 |

---

## 📋 主公拍板事项(5 项)

| # | 问题 | 选项 |
|---|---|---|
| 1 | 前端年度培训计划收集 9 个 404 端点(**BUG-20260928-F-001**):**删除前端孤儿视图** OR **补齐后端接口**? | A 删除 / B 补齐 |
| 2 | **Phase A 站内信路由跳转**(**BUG-20260928-B-004**):实施 OR 废弃? | A 实施 / B 废弃 |
| 3 | 15 张表软删除功能启用(**BUG-20260928-B-005**):**分批提交** OR **一次性提交**? | A 分批(推荐)/ B 一次性 |
| 4 | 现有数据 `deleted` 字段 NULL 与新 DDL DEFAULT 0 不兼容,如何修复? | A 兼容性 SQL(`UPDATE ... SET deleted=0 WHERE deleted IS NULL`)/ B 字段重命名 |
| 5 | 主公是否需要**自动修复 subagent 立即开干**? | A 立即启动 / B 等主公审阅决策 |

---

## 🎯 修复优先级建议

| 阶段 | 内容 | 工时 | 负责人 |
|---|---|---|---|
| **A 立即(24-48h)** | **Critical 13 项**:`B-001`~`B-009`、`F-001`、`FB-001`~`FB-003` + DBA 复核 1.5.1 字段对齐 | 2 dev·day | 1 后端 + 1 前端 + 1 DBA |
| **B 本周(1 周)** | **High 23 项**:`B-010`~`B-023`、`F-002`~`F-008`、`FB-004`~`FB-005` | 5-7 dev·day | 2 后端 + 1 前端 |
| **C 本月(2-4 周)** | **Medium 26 项**:`B-024`~`B-041`、`F-009`~`F-016` | 12-18 dev·day | 2 后端 + 1 前端 + 1 测试 |
| **D 下季度** | **Low 19 项**:`B-042`~`B-051`、`F-017`~`F-025` | 25-35 dev·day | 全栈 |

---

## 📌 引用方式(主公后期怎么定位)

### 主公查 bug
- "修复 BUG-20260928-B-001" → 立即定位到 Plan 删除不级联
- "BUG-20260928-FB-001 是啥" → 立即定位到节点通知三件套假实现

### 小马回复 bug
- 引用 ID:`根据 BUG-20260928-B-001,已加级联清理 el_plan_user/plan_user_node/plan_makeup`
- 引用文件:`按 BUG-20260928-B-003 修复 TrainingRecordEntity.java 第 22-77 行`

### commit / PR 命名
- `fix(bug-20260928-B-001): PlanServiceImpl.delete 加级联清理`
- `fix(bug-20260928-F-001): 删除前端年度培训计划收集 orphan 视图`

---

## 🗂️ 历史档案

| 文件 | 内容 |
|---|---|
| `bugs/2026-09-28-business-bug-index.md`(本文件) | 81 项业务 Bug 索引 |
| `decisions/2026-09-27-eval-findings.md` | 运维专项(超 Critical 链 A + 10 项 Critical) |
| `decisions/2026-09-27-business-logic-bugs.md` | 业务专项详细报告(99 项) |
| `decisions/2026-06-24-培训学习域增强迭代.md` | 历史决策文档 |

---

**索引建立完成。81 项 Bug,13 Critical / 23 High / 26 Medium / 19 Low。** 主公下一步下令?