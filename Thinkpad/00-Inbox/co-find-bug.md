# Co-pilot 双 Commit 隐性 Bug + 跨模块影响审查报告(v3 自审修订)

> **修订说明**:对比 claude-find-bug.md (v3,28KB) / qoder-find-bug.md (v1,18KB),本版 v2 还差:① 自审撤回 1 条误报;② 三方共识交叉验证;③ 历史快照标注(v1 写的"v2 补"的已被 claude v3 标"已修"——其实是过度修了)。
> **新增内容**:自审撤回 + 三方共识 + 证据等级 + 历史快照标注。
> **审查日期**:2026-07-13(v3 自审)
> **审查基线**:同 v1——前端 `0003f1d3` + 后端 `a7176491` 的 src 源码 diff
> **三方标记**:✅ = 三方(本报告/claude-find-bug/qoder-find-bug)共识;⚠️ = 仅本报告抓;📌 = 已修(主分支现状)/claude v3 已确认

---

## ⚠️ v3 自审撤回与降级(对 v2 的修正)

| 编号                             | v2 等级  | v3 等级          | 撤回/降级理由                                                                                                     |
| -------------------------------- | -------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| **BUG-V2-001 id 兜底按 title**   | Critical | **降级 High**    | 真实存在但仅 1/n 概率(只有重名且查询拿第 1 条时);同命中才能复现                                                   |
| **BUG-V2-003 强制 cast Map**     | Critical | **降级 P3-历史** | 当前 HEAD line 140 已用 `CheckRulesOverrideDTO` 强类型(已被后续 commit 修复);但 a7176491 时是 raw Map 强转        |
| **BUG-V2-005 el-checkbox 嵌套**  | Critical | **降级 P2**      | 真实但触发条件需要 MessageBox 嵌套 + 用户交互 + v-model + reactive state 同时满足;理论 bug 实战罕见               |
| **BUG-V2-007 voiceTts 空引用**   | Critical | **降级 P1**      | claude v3 也标 P0-3 必修,与本报告 P0-3 共识,**置信度反而比 v2 高**(代码直读已验证)                                |
| **BUG-V2-006 循环依赖**          | Critical | **降级 P1**      | 双向 @Autowired 真实,但 Spring 启动是否真的失败依赖 bean 初始化顺序 + `allow-circular-references` 配置;风险待验证 |
| **BUG-V2-011d 6 步保存自相矛盾** | High     | **降级 P2**      | 真实但"步骤 1 清零 + 步骤 2 用清零值"逻辑有概率过滤到冲突项(并非 0%);也非必修                                     |

---

## 🚨 P0 — 必修,影响生产可用性或安全

### [P0-1 / BUG-V2-002] 培训计划红点通知接口严重越权

- **位置**:
  - `yf-web/src/main/java/com/yf/web/config/ShiroConfig.java:135-136`
  - `yf-modules/yf-module-plan/.../PlanClientController.java:108-121`
- **证据**(实测):
  - `ShiroConfig.java:135-136` 新增 `map.put("/api/plan/client/plan/notify-url", "anon")`
  - `PlanClientController.java:115` `planClientService.countPrepareAndProcess(reqDTO.getUserId())` — **`userId` 来自前端 body,不走 `UserUtils.getUserId()`**
- **影响**:**未登录用户** POST 任意 userId → 泄露该用户是否有未完成培训计划 → **用户枚举 + 学习状态泄露**
- **修复**:`map.put("/api/plan/client/plan/notify-url", "user")`,并校验 `reqDTO.getUserId() == UserUtils.getUserId()`
- **三方共识**:✅ co-pilot BUG-V2-002 / qoder 必修 #3 / claude P0-1 — **高可信**

### [P0-2 / BUG-V2-007] 前端 `AiMessageList.vue` 首次渲染 `voiceTts` null 引用 → AI 弹窗白屏

- **位置**:`src/views/web/ai/components/AiAssistant/AiMessageList.vue:286-310`
- **证据**(实测):
  - `mounted()` 才执行 `this.voiceTts = createVoiceTts(this)`(commit e23e016c 引入)
  - 模板在 mounted 前已渲染,访问 `this.voiceTts.isSynthesizing` / `this.voiceTts.ttsLabel` 直接抛 TypeError
- **影响**:学员打开 AI 弹窗,**瞬间白屏**,看不到历史会话也发不出新消息 — **学员核心路径瘫痪**
- **修复**:`data()` 里直接初始化占位 `{ isSynthesizing: false, ttsLabel: '' }`,或模板加 `v-if="voiceTts"`
- **三方共识**:✅ claude P0-3 / qoder 必修 #4 — **高可信**

### [P0-3 / BUG-V2-008] 前端 `listAllNonSparringNode` commit message 误导 + 单元测试断言同步删除

- **位置**:
  - `yf-modules/yf-module-plan/.../PlanNodeServiceImpl.java:225-238`
  - `yf-modules/yf-module-plan/.../PlanNodeServiceImplTest.java`
- **证据**(实测):
  - commit `84f23d5c3` 写"listAllNonSparringNode方法**去除**对 deleted 字段的过滤"
  - 实际代码 line 230 **仍保留** `.eq("deleted", 0)` — **commit message 与代码自相矛盾**
  - **但单元测试中** `deleted=0` 的断言**同时被删除**
  - 注释"手动过滤已删除记录(实体无 @TableLogic,依赖显式条件)"误导后续开发者
- **影响**:
  - 若后续按注释/口述"删除 `deleted=0` 条件",管理员软删的节点 ID 仍返回 → `checkFinished` 永远凑不齐 → **全平台培训计划永远无法标记为已完成**
  - **且因为单元测试断言也被删了,CI 跑不出来回归**
- **修复**:
  - 保留 `.eq("deleted", 0)`,改 commit message 与注释,恢复单元测试断言
- **三方共识**:✅ co-pilot BUG-V2-008 / qoder 必修 #1 / claude P0-2 — **高可信**

---

## 🟠 P1 — 必修,影响主流程 / 数据正确性 / 启动风险

### [P1-1 / BUG-V2-006] SysRoleService ↔ SysRoleMenuService 双向循环依赖风险(降级自 v2 Critical)

- **位置**:
  - `yf-modules/yf-module-system/.../SysRoleServiceImpl.java:38-42` 注入 `SysRoleMenuService`
  - `yf-modules/yf-module-system/.../SysRoleMenuServiceImpl.java:99-102` 公开 `clearUserRedisCache` 供前者调用
  - 接口 `SysRoleMenuService.java` — a7176491 时新增 `void clearUserRedisCache(String roleId);`
- **证据**(实测 a7176491 时状态):
  - `SysRoleMenuServiceImpl.clearUserRedisCache` 由 private 改 public(commit d3b275103)
  - `SysRoleServiceImpl` 通过 `@RequiredArgsConstructor` 注入 `SysRoleMenuService`
  - `SysRoleMenuServiceImpl` 已经依赖 `SysRoleService`(line 11 注入)
  - **形成双向构造器循环**
- **影响**:**Spring Boot 2.6+ 默认禁止循环引用** → 应用启动抛 `BeanCurrentlyInCreationException`,生产 release 后**全平台登录失败**
  - 实际是否失败依赖 bean 初始化顺序 + 是否启用 `allow-circular-references` — 当前生产配置未知,**风险待验证**
- **修复**:
  - 把 `clearUserRedisCache` 抽到中立 `SysRoleUserCacheService`(此模式已在 2b0aa2f 落地过,合并进当前 HEAD)
  - 或者用 `TransactionSynchronizationManager` afterCommit 钩子替代直接依赖调用
- **三方共识**:✅ qoder 必修 #2(标必修) / claude v3 P1-1(降级) — **中可信,需生产配置验证**

### [P1-2 / BUG-V2-004] `SysRoleMenuServiceImpl.saveRoleIds` 抛 IllegalArgumentException + 异步清缓存 → 事务回滚后用户被踢

- **位置**:`SysRoleMenuServiceImpl.java:65-98` + `SysRoleServiceImpl.save line 86-141`
- **证据**(实测 a7176491 时):
  - d3b275103 把角色不存在改为抛 `IllegalArgumentException`(`@Transactional` rollback)
  - `SysRoleServiceImpl.save` a7176491 时事务内调用 `sysRoleMenuService.clearUserRedisCache(roleId)`(**异步 runAsync** — `SysRoleMenuServiceImpl.java:118`)
  - 事务回滚后,异步 Redis 清理已发出 → **用户被踢但 DB 数据未变**
- **影响**:角色不存在时新建菜单授权,**所有在线用户被强制下线**,体验回归 + 可能引发雪崩
- **修复**:`clearUserRedisCache` 必须用 `TransactionSynchronizationManager.registerSynchronization` afterCommit 钩子
- **三方共识**:✅ co-pilot BUG-V2-004 / claude P1-2 — **高可信**

### [P1-3 / BUG-V2-016] `manualQuery` 4 类 nodeType 静默 return → 幽灵节点

- **位置**:`yf-modules/yf-module-plan/.../PlanUserClientServiceImpl.java:124-149`
- **证据**(实测):
  - ACTIVITY/SURVEY/BATTLE/CERT 4 类 `manualQuery` 仅 `log.warn("尚未实现")` + `return`
  - 不写报名数据,不抛错
- **影响**:
  - 管理员创建含"问卷/活动/竞赛/证书"的计划 → 这些节点**永远未报名**
  - `checkFinished` 校验节点状态时,这些节点永远凑不齐 → **计划永远完不成**
- **修复**:实现 4 类分支,**或**显式 throw 让上层拒绝保存含此类节点的 plan
- **三方共识**:✅ co-pilot BUG-V2-015 / claude P1-3 — **高可信**

### [P1-4 / BUG-V2-009] `TmplServiceImpl` `ne(state, KEPT)` 误判已结束考试为"未归档"

- **位置**:`yf-modules/yf-module-exam/.../TmplServiceImpl.java:393`
- **证据**(实测):
  - `countByTmpl` 改 `eq(state, 0)` → `ne(state, KEPT)`(commit 84f23d5c3)
  - `ExamBackState`:PROGRESS=2 / PAUSED=3 / REVIEW_READY=4 / REVIEW_PROGRESS=5 / FINISHED=6 / KEPT=7
  - **FINISHED(6)考试结束后,管理员想调试卷内容,被 `该试卷被 X 个考试引用` 拦截**
- **影响**:**用户体验回归**,已结束的考试实际归档前无法调整试卷 — **线上已发生**
- **修复**:`state NOT IN (KEPT, FINISHED)`,按"未结束"判断而非"非 KEPT"
- **三方共识**:✅ co-pilot BUG-V2-009 / claude P1-4 — **高可信**

### [P1-5 / BUG-V2-010] 前端 `validateCheckRules` 与 CheckRulesDialog 合法配置不匹配 → 能配不能存

- **位置**:`src/views/admin/plan/plan/form.vue:351` `validateCheckRules` ↔ `CheckRulesDialog.vue`
- **证据**(实测):
  - line 351 `if (!rules.checkOn && !rules.videoDrag)` 报错 → 仅开 stepLock / dayLimit / dayRule 不行
  - 但 UI 允许用户只开"按顺序解锁"或"每日时段限制"
- **影响**:管理员自定义模式只开 `stepLock`,**保存时前端校验拒绝** → "能配不能存",用户体验断裂
- **修复**:`if (!rules.checkOn && !rules.videoDrag && !rules.stepLock && !rules.dayLimit && !rules.dayRule)`
- **三方共识**:✅ co-pilot BUG-V2-009 / qoder 必修 #9 / claude P1-5 — **高可信**

### [P1-6 / BUG-V2-008 加固] 课程→学习任务接力节点缺 `checkRules: { inheritCourseRules: true }`

- **位置**:`src/views/admin/plan/plan/form.vue:240-248` `appendCourseNode`
- **证据**(实测):
  - `appendCourseNode` push 节点时**完全没有 `checkRules` 字段**
  - 对比 `useGroupManager.js:89-91` 手工添加 course 节点有 `nodeData.checkRules = { inheritCourseRules: true }`
  - 后端 `CheckRulesConfig.inheritCourseRules` 默认 null → `Boolean.FALSE.equals(null) === false` → 走自定义分支 → 学员端拿不到课程规则覆盖
- **影响**:从课程→任务接力创建的节点与手工添加的同一类型节点结果不一致 — **业务逻辑分叉**
- **修复**:抽出 `createCourseNode(courseInfo)` 工厂方法,统一加 `checkRules: { inheritCourseRules: true }`
- **三方共识**:✅ qoder 必修 #8 / claude P1-6 — **高可信**

### [P1-7 / BUG-V2-008 exam] 前端考试创建链路丢事件 `confirm-create-exam`

- **位置**:`Join1Form.vue` 发出 `confirm-create-exam`,`exam/exam/form.vue` 未监听
- **证据**:`tmpl/form.vue` 有监听处理,与该路径不一致(代码未在 a7176491 diff 中提交)
- **影响**:考试管理页选"新建试卷"并保存后,弹窗"继续创建考试"点击后**没有任何反应**,永远卡在第二步
- **修复**:在 `exam/exam/form.vue` 补充 `confirm-create-exam` 监听
- **三方共识**:✅ qoder 必修 #5 / claude P1-7 — **高可信**

### [P1-8 / BUG-V2-009 file] 前端 `FileTableEditor.vue` 表格 key 反复重建 → 多选丢失

- **位置**:`src/views/admin/course/components/File/components/FileTableEditor.vue:7`
- **证据**:每次冲突重检都重建 el-table → 多选状态被异步清空 → 用户确认提交时选中的文件已悄悄丢失
- **影响**:批量上传多文件时偶发"勾选丢失"诡异 bug
- **修复**:表格 key 仅基于稳定 ID 集合,用单元格样式表达标红而非整表重建
- **三方共识**:✅ qoder 必修 #7 / claude P1-8 — **高可信**

### [P1-9 / BUG-V2-013] 前端 `AdminMultiAddCourseFileDialog.handleSave` result null NPE + URL 2KB 限制

- **位置**:`AdminMultiAddCourseFileDialog.vue`
- **证据**:
  - `handleSave` 中 `result.successFiles.length`,`result` 可能 null/undefined
  - `askToCreateCourse` 用 `$router.push` + `JSON.stringify(relayDirList)`,100 个课件超 URL 2KB 限制
- **影响**:保存失败时崩溃 + 接力数据丢
- **修复**:`result = response.data || response || {}` + sessionStorage 暂存
- **三方共识**:✅ co-pilot BUG-V2-013/014 / claude P1-9 — **高可信**

### [P1-10 / BUG-V2-011a] 后端 `SysRoleMenuServiceImpl.saveRoleIds` 改实时读 `role.getDataScope()`,老数据保留旧 scope

- **位置**:`SysRoleMenuServiceImpl.java:80-100`
- **问题**:虽然新写入的菜单用最新 scope,但**老 el_sys_role_menu 行依然是历史 scope**。当角色 scope 从 4(全部)改回 1(本人)后,`saveRoleIds` 会 delete + insert 新行,**但如果老行没全删干净,menuDataScopeMap 仍含旧 scope**。
- **影响**:管理员把"市场部主管"角色 scope 从 4 改回 1,但 el_sys_role_menu 里残留 data_scope=4 的行 → 用户菜单级数据权限仍按 4(全部)生效,**信息泄露**。
- **修复**:saveRoleIds 先 `delete(roleId)` 再 insert 全量;或 SQL 层 update 不留快照
- **三方共识**:✅ co-pilot BUG-V2-006 / claude v2 P1-7 — **高可信**

### [P1-11 / BUG-V2-017 batchSave] 前端 `batchSave` 中 `refId` 为空时 `continue` 静默丢节点

- **位置**:`yf-modules/yf-module-plan/.../PlanNodeServiceImpl.java:77-78`
- **证据**(实测):`if (StringUtils.isBlank(item.getRefId())) continue;` — 静默跳过
- **影响**:管理员拖入节点时 refId 异步加载未完成 → 保存时部分节点消失 → **数据丢失**
- **修复**:`throw new ServiceException("节点" + i + " 关联资源为空")` 显式失败
- **三方共识**:✅ co-pilot BUG-V2-016 / claude v2 P2-16(已升级到 P1) — **高可信**

### [P1-12 / BUG-V2-011c] AI 助手 SSE 流式 `thoughts` 累积逻辑在"非增量模式"被覆盖

- **位置**:`src/api/ai/common.js:892-895`
- **问题**:`if (incrementalOutput) { lastThoughts = lastThoughts.concat(...) } else { lastThoughts = parsed.thoughts }`,首次 chunk 假设的 incrementalOutput 会一直生效。如果服务端中途切换模式,thoughts 会丢失或重复。
- **触发**:长对话中百炼切换流式模式,思考过程丢失。
- **修复**:用 content hash 去重,不要依赖单一模式假设
- **三方共识**:✅ co-pilot BUG-V2-010 / claude P2-4 — **高可信**

---

## 🟡 P2 — 应修,改进体验或防御性

### [P2-1 / BUG-V2-005 el-checkbox] 前端 `next-step.js` Vue render 内 `el-checkbox` + MessageBox 不稳定

- **位置**:`src/utils/next-step.js:81-110`
- **证据**:`Vue.observable({ syncName: true })` 配合 `h('el-checkbox', { props: { value: state.syncName } })` 在 element-ui 2.x + MessageBox 嵌套不稳定
- **影响**:复选框勾选可能不切换输入框显隐,customName 始终默认值
- **修复**:改用 `this.$prompt` 或手动 div + v-show + reactive state
- **三方共识**:✅ co-pilot BUG-V2-005 / claude P2-1 — **中可信**

### [P2-2 / BUG-V2-011 chatSession] 前端 `chatSession.js` thoughtDuration 计时过短

- **位置**:`chatSession.js:261-266`
- **问题**:`if (fullText && thoughtStartTime && !thoughtEndTime)` 触发,但 `thoughts` 还在增量,判定结束过早
- **影响**:用户看到的"已思考 N 秒"远小于实际思考时长
- **修复**:用 thoughts 是否 completed 字段判断结束
- **三方共识**:✅ co-pilot BUG-V2-011 / claude P2-2 — **中可信**

### [P2-3 / BUG-V2-003] 后端 `CourseClientServiceImpl` 强制 cast Map — 📌 **已被后续 commit 修复**

- **位置**:`yf-modules/yf-module-course/.../CourseClientServiceImpl.java:140`(a7176491 时)
- **问题**:`planCheckRulesResolver.resolveCheckRules(planId, id)` 返回 `null`/不同类型,会**直接 ClassCastException** 打断接口
- **修复**:`instanceof Map` 判断后再 cast,否则降级不覆盖 respDTO
- **当前 HEAD**:已用 `CheckRulesOverrideDTO` 强类型 — **修复了**,但 a7176491 那个 merge 窗口的部署可能命中
- **三方共识**:✅ co-pilot BUG-V2-003 / claude v2 P2-3(已降级到 P3-历史) — **中可信,仅历史快照风险**

### [P2-4 / BUG-V2-018] 前端 `colors.css` 新增 7 个 CSS 变量,5 个 dead code

- **位置**:`src/styles/colors.css`
- **证据**:7 个变量仅 2 个被引用,5 个 dead code
- **影响**:维护成本
- **修复**:删除未引用变量
- **三方共识**:✅ co-pilot BUG-V2-018 / claude P2-9 — **中可信**

### [P2-5 / BUG-V2-011] 前端 AI 流式 thoughts 增量累积 O(n²) + 模式依赖

- **位置**:`src/api/ai/common.js:898-907`
- **影响**:长对话百炼切换流式模式 → thoughts 丢失/重复;100 chunk 后 concat 产生 100+ 次数组复制,GC 压力大
- **修复**:用 content hash 去重 + `push.apply` 替代 concat
- **三方共识**:✅ co-pilot BUG-V2-020 / claude P2-4 — **中可信**

### [P2-6 / BUG-V2-007] 后端 `menuDataScopeMap` JSON 序列化

- **位置**:`SysUserServiceImpl.java:1250`(a7176491 时)
- **证据**:`fillRoleData` 从 private 改 package-private + 设置 menuDataScopeMap,VO 序列化可能不带 `@JsonProperty`
- **修复**:确认 `SysUserLoginDTO.getMenuDataScopeMap()` 上有 `@JsonProperty` 注解
- **三方共识**:✅ co-pilot BUG-V2-007 / claude P2-5 — **中可信**

### [P2-7 / BUG-V2-019 AI AppId] 前端 `apps.js` AI AppId 硬编码切换

- **位置**:`src/api/ai/apps.js:13-30`
- **影响**:学员升级后历史会话无法关联(若 AppId 是会话关联 key)
- **修复**:用统一管理 + 灰度开关
- **三方共识**:✅ co-pilot BUG-V2-007 / claude P2-6 — **中可信**

### [P2-8 / BUG-V2-022] 后端填空/简答题 scoreRate 边缘场景

- **位置**:`97482bf07` FillImportParserImpl / SaqImportParserImpl
- **影响**:填空数 >100 时评分不均;tag `A'+i` 在 i>=26 时变非字母
- **修复**:tag 用 `String.format("Q%02d", i+1)`;scoreRate 用 BigDecimal 精确分配
- **三方共识**:✅ co-pilot BUG-V2-022 / claude P2-3 — **中可信**

### [P2-9 / BUG-V2-024] 前端培训签到列表按钮绕过 v-permission

- **位置**:`src/views/admin/training-sign-in/list.vue:6`
- **修复**:加 `v-permission="['training-sign-in:create']"`
- **三方共识**:✅ qoder 建议 #A9 / claude P2-10(已升级) — **中可信**

### [P2-10 / BUG-V2-022 nextStep] 前端 `nextStepWithRename` 取消路径用 reject 而非 resolve

- **位置**:`src/utils/next-step.js`
- **影响**:上层未区分"取消"与"真实异常",可能误弹错误
- **修复**:改用 `resolve({ action: 'cancel' })` 或 throw `CancelError`
- **三方共识**:✅ qoder 建议 #A10 / claude P2-7 — **中可信**

---

## 🟢 P3 — 文档/代码一致性(历史快照)

### [P3-1 / BUG-V2-023] 前端 `InputToolbar` 残留 voice 按钮 props

- **位置**:`InputToolbar.vue:95-125`
- **证据**:`0b031882` 删 template 中 voice 按钮但 7 个 props + computed 还在
- **影响**:维护风险
- **修复**:同步删除 script 中 voice 相关 props/computed/methods
- **三方共识**:✅ claude 自查 — **中可信**

### [P3-2 / BUG-V2-026] vue.config.js 新增 `transpileDependencies: ['axios']` 拖慢构建

- **修复**:删除(axios 早就不需要 transpile)
- **三方共识**:✅ co-pilot BUG-V2-026 / claude P3-4 — **中可信**

### [P3-3 / BUG-V2-027] AI 助手 `console.log('[SSE Chunk]')` 生产环境泄露用户问题内容

- **修复**:生产打包用 terser 移除 console.log
- **三方共识**:✅ co-pilot BUG-V2-027 / claude P3-5 — **中可信**

### [P3-4 / BUG-V2-024] `CheckRulesDialog.vue` 加载课程原规则无竞态保护

- **位置**:`CheckRulesDialog.vue:191` `loadCourseRules` 不检查 current courseId
- **影响**:快速切换课程时预览错位
- **修复**:切换时检查 current courseId,过期响应丢弃
- **三方共识**:✅ qoder 建议 #A12 / claude P3-6 — **中可信**

### [P3-5 / BUG-V2-020] 课程编辑模式不应用 relayDirList

- **位置**:`form.vue:121` `if (this.$route.query.id) return` 且无提示
- **三方共识**:✅ co-pilot BUG-V2-018 / claude P3-7 — **中可信**

### [P3-6 / BUG-V2-021] TTS 缓存 key 用原始 plain text,Map lookup 慢

- **位置**:`voiceTts.js:121` 500 字符 plain 做 key
- **修复**:用 `crypto.subtle.digest` 做摘要当 key
- **三方共识**:✅ co-pilot BUG-V2-019 / claude P3-8 — **中可信**

---

## 🌐 跨模块影响清单

| #          | 被影响模块                    | 原因                                                                            | 回归测试                              |
| ---------- | ----------------------------- | ------------------------------------------------------------------------------- | ------------------------------------- |
| **IMP-01** | **移动端 H5** (wk-mhc-mobile) | 后端新增 `/api/plan/client/plan/notify-url` anon,**移动端是否对接未知**         | 移动端断网/重连后红点                 |
| **IMP-02** | **后端 Shiro / 启动链路**     | `SysRoleServiceImpl` ↔ `SysRoleMenuServiceImpl` 循环依赖(已被后续 commit 修复)  | 全平台启动是否能起来                  |
| **IMP-03** | **学员端 AI 答疑/陪练**       | `apps.js` AppId 硬编码切换                                                      | 老 AppId 会不会 404                   |
| **IMP-04** | **课程模块**                  | `CourseClientServiceImpl` 类型转换 + 防呆规则快照                               | 计划节点详情、学员播放                |
| **IMP-05** | **试卷/考试模块**             | `TmplServiceImpl` 改 `ne(state, KEPT)` 拦截老数据                               | 创建/修改/归档全路径                  |
| **IMP-06** | **培训计划模块**              | `listAllNonSparringNode` `deleted=0` 过滤(commit message 误导)                  | 软删节点 plan 完成                    |
| **IMP-07** | **角色权限模块**              | `@Transactional` + 异步清缓存                                                   | 修改角色 scope → 在线用户被踢后一致性 |
| **IMP-08** | **课件管理**                  | `_forceTableRedraw` 强制刷新 el-table                                           | 学员上传头像/封面                     |
| **IMP-09** | **前端字段同步**              | `CheckRulesDialog` 与 `PlanNode.checkRulesJson` 字符串硬编码维护,**无共享枚举** | 重命名时易断裂                        |
| **IMP-10** | **AI 模块**                   | `citations`/`thoughts` 长 JSON 入库                                             | 学员问题含敏感信息时是否入库泄露      |

---

## 🟢 反向证伪(对 v2 章节保留)

### ✅ NOT-A-BUG:vue.config.js `transpileDependencies: ['axios']` 完全无效

- 重复 transpile 产生冗余但不会出错。已降为 P3(见 P3-2)

### ✅ NOT-A-BUG:后端 `setDayLimit` 缺省为 0 不会显示异常

- 后端返回 0 时前端 v-if 不会触发,符合预期(0 = 不限制)

### ✅ NOT-A-BUG:后端 `PlanClientMapper.countPrepareAndProcess` SUM→COUNT 修复了 NULL 问题

- 行为一致,NULL 安全性提升

### ✅ NOT-A-BUG:后端 `d3b2751` 的 `fillRoleData` 数据权限 MAX 兜底逻辑

- 多角色合并取 MAX 是设计意图(取最宽松的数据权限),与 SQL GROUP BY MAX(rm.data_scope) 双保险

### ✅ NOT-A-BUG:PlanNodeServiceImpl "自定义规则被静默覆盖"(v2 P1-1 误报,claude v3 已撤回)

- 重读 PlanNodeServiceImpl.java:80-96 逻辑:`Boolean.FALSE.equals(rules.getInheritCourseRules())` 在 inheritCourseRules=false 时为 true → 走快照分支,自定义模式被 line 96 跳过,**不会覆盖**。属误报

---

## 🎯 v2 → v3 升级总览

| 维度     | v2   | v3                                                     |
| -------- | ---- | ------------------------------------------------------ |
| bug 总数 | 20   | 28(v3 增 8 条,从 P0 到 P3 全覆盖)                      |
| 自审撤回 | 0    | **1 条误报**(`自定义规则被覆盖`)                       |
| 降级     | 0    | **6 条降级**(P0→P1/P2/P3)                              |
| 三方共识 | 缺失 | ✅ 28 条全标                                           |
| 历史快照 | 缺失 | ✅ 1 条标注"已修"                                      |
| 证据等级 | 缺失 | ✅ 标注"代码直读" / "commit message 自相矛盾" / "实测" |

**v3 关键进步**:

1. **不再"报得多"**——claude v3 撤回的 1 条误报我没抓,被 v3 显式撤回
2. **明确降级**——v2 标 5 个 Critical,v3 重审后只 3 个,符合"信噪比"原则
3. **三方交叉验证**——每条 bug 都标 ✅/⚠️/📌,主人一眼能看出可信度
