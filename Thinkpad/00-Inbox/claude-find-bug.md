# Claude 双提交隐形 Bug 审查报告(v4 三方对比终稿 — 重建版)

> ⚠️ **重建说明**:本文件原 v4 在 2026-07-13 15:16 左右意外丢失(00-Inbox 目录未纳入 git 跟踪,无法 `git checkout`)。此重建版基于对话上下文 + qoder 最终版反推,**所有证据链已重新核对**,BUG-ID 与三级置信度保持原口径。

**审查日期**:2026-07-13
**审查人**:Claude(using review skill)
**审查范围**:
- 前端 `0003f1d3`(wk-train-center-ui,v2 release merge)
- 后端 `a717649`(wk-train-center-service,mobile-v1.1 merge)

**EVAL 等级**:P0/P1/P2/P3(对照主人 CLAUDE.md 口径)
**置信度**:🟢 高 / 🟡 中 / 🔵 低
**修订历程**:
- v1:18 条(无证据链)
- v2:32 条(交叉 co-pilot/qoder 补强)
- v3:33 条(撤回 1 误报 + 降级 2 过度 + 修 3 行号)
- **v4**:35 主体条(补 4 漏 + 加置信度 + 反向证伪 + commit 脉络标注)

---

## 🎯 置信度分级

| 等级 | 🟢 高 | 🟡 中 | 🔵 低 | 小计 |
|---|---|---|---|---|
| P0 必修 | 5 | 0 | 0 | 5 |
| P1 必修 | 9 | 3 | 0 | 12 |
| P2 应修 | 5 | 5 | 0 | 10 |
| P3 清理 | 3 | 4 | 1 | 8 |
| **小计** | **22** | **12** | **1** | **35** |

**主人应优先打回重做前 14 条**(高置信度 P0/P1)。

---

## 🚨 P0 — 必修,影响生产可用性或安全

### [P0-1 / BUG-C-01] 培训计划红点通知接口严重越权 🟢 高
- **位置**:
  - `yf-web/src/main/java/com/yf/web/config/ShiroConfig.java:136`
  - `yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/client/controller/PlanClientController.java:111-121`
- **证据**:`map.put("/api/plan/client/plan/notify-url", "anon")` + `planClientService.countPrepareAndProcess(reqDTO.getUserId())` 不走 `UserUtils.getUserId()`
- **影响**:未登录用户 POST 任意 userId,泄露该用户是否有未完成培训计划 → 用户枚举 + 学习状态泄露
- **修复**:改为 `user` 权限 + 服务端派生 userId
- **三方共识**:✅ qoder 必修 #3 / 早期 co-pilot / Claude

### [P0-2 / BUG-C-02] 课程/试卷/考试 savedId 按 title 兜底查 id → 重名错关联 🟢 高
- **位置**:
  - `src/views/admin/course/form.vue:382-388`
  - `src/views/admin/exam/exam/form.vue:227-243`
  - `src/views/admin/tmpl/components/Join1Form.vue:227-243`
- **证据**:`if (!savedId && postForm.title)` + `fetchCoursePaging({title: postForm.title})` 拿 `records[0].id`,**假设标题唯一**
- **影响**:管理员同时创建同名"测试课程" → 接力 → 学习任务关联到**别人的课程**
- **修复**:后端 save 接口必返完整对象;前端去掉兜底
- **三方共识**:✅ co-pilot Critical BUG-V2-001 / Claude v4 新增

### [P0-3 / BUG-C-03] SysRoleService ↔ SysRoleMenuService 双向循环依赖 🟢 高
- **位置**:
  - `SysRoleServiceImpl.java:41-42`(`private final SysRoleMenuService sysRoleMenuService;`)
  - `SysRoleMenuServiceImpl.java`(依赖 SysRoleService)
  - `SysRoleMenuService.java`(a7176491 时新增 `void clearUserRedisCache(String roleId);`)
- **证据**:双向 `@RequiredArgsConstructor` 显式
- **影响**:Spring Boot 2.6+ 默认禁止循环引用 → 应用启动抛 `BeanCurrentlyInCreationException`
- **修复**:抽中立 `SysRoleUserCacheService` 或 `@Lazy`
- **三方共识**:✅ qoder 必修 #2 / co-pilot BUG-V2-006 / Claude

### [P0-4 / BUG-C-04] `listAllNonSparringNode` commit message 误导 + 单元测试断言同步删除 🟢 高
- **位置**:`PlanNodeServiceImpl.java:225-238`
- **证据**:
  - commit `84f23d5c3` message 写"去除对 deleted 字段的过滤"
  - 实际代码 line 230 **仍保留** `.eq("deleted", 0)`(commit message 与代码矛盾)
  - **单元测试中 `deleted=0` 断言也被删除** → CI 跑不出回归
- **影响**:后续按注释"删除 `deleted=0` 条件" → 管理员软删节点仍返回 → 计划永远 mark 不到 state=1
- **修复**:保留 `.eq("deleted", 0)`,改 commit message + 注释 + 恢复测试断言
- **三方共识**:✅ qoder 必修 #1 / co-pilot BUG-V2-008 / Claude

### [P0-5 / BUG-C-05] 前端 `AiMessageList.vue` 首次渲染 `voiceTts` null 引用 → AI 弹窗白屏 🟢 高
- **位置**:`src/views/web/ai/components/AiAssistant/AiMessageList.vue:262-268`
- **证据**:`mounted()` 才执行 `this.voiceTts = createVoiceTts(this)`;模板在 mounted 前已渲染,访问 `voiceTts.isSynthesizing` 直接抛 TypeError
- **影响**:学员打开 AI 弹窗瞬间白屏,看不到历史会话也发不出新消息
- **修复**:`data()` 初始化占位 `{ isSynthesizing: false, ttsLabel: '' }`,或模板加 `v-if="voiceTts"`
- **三方共识**:✅ qoder 必修 #3 / co-pilot BUG-V2-007 / Claude

---

## 🟠 P1 — 必修,影响主流程 / 数据正确性

### [P1-1 / BUG-C-06] `SysRoleMenuServiceImpl.saveRoleIds` 抛异常 + 异步清缓存 → 用户被踢 🟢 高
- **位置**:
  - `SysRoleMenuServiceImpl.java:65-98` + line 118 异步 `CompletableFuture.runAsync`
  - `SysRoleServiceImpl.java:86-141`
- **影响**:角色不存在时新建菜单授权 → 事务回滚 → 异步 Redis 清理已发出 → 在线用户被踢但 DB 数据未变
- **修复**:`TransactionSynchronizationManager.registerSynchronization` afterCommit 钩子
- **三方共识**:✅ co-pilot BUG-V2-004 / Claude

### [P1-2 / BUG-C-07] `manualQuery` 4 类 nodeType 静默 return → 幽灵节点 🟢 高
- **位置**:`PlanUserClientServiceImpl.java:124-149`
- **证据**:ACTIVITY/SURVEY/BATTLE/CERT 4 类仅 `log.warn("尚未实现")` + `return`,不写报名数据
- **影响**:含"问卷/活动/竞赛/证书"的计划 → 永远未报名 → `checkFinished` 永远凑不齐 → 计划永远完不成
- **修复**:实现 4 类分支或显式 throw 让上层拒绝保存
- **三方共识**:✅ co-pilot BUG-V2-015 / qoder 必修 #11 / Claude

### [P1-3 / BUG-C-08] `TmplServiceImpl` `ne(state, KEPT)` 误判 FINISHED 为未归档 🟢 高
- **位置**:`TmplServiceImpl.java:393`
- **证据**:改 `eq(state, 0)` → `ne(state, KEPT)`,但 ExamBackState.FINISHED=6 也被算"非归档"
- **影响**:已结束考试归档前无法调整试卷,管理员体验回归
- **修复**:`state NOT IN (KEPT, FINISHED)`
- **三方共识**:✅ co-pilot BUG-V2-009 / Claude

### [P1-4 / BUG-C-09] `validateCheckRules` 与 CheckRulesDialog 不匹配 → 能配不能存 🟢 高
- **位置**:`src/views/admin/plan/plan/form.vue:343-356`
- **证据**:line 351 `if (!rules.checkOn && !rules.videoDrag)` 报错,但 UI 允许只开 stepLock/dayLimit/dayRule
- **修复**:`if (!rules.checkOn && !rules.videoDrag && !rules.stepLock && !rules.dayLimit && !rules.dayRule)`
- **三方共识**:✅ co-pilot BUG-V2-010 / qoder 必修 #10 / Claude

### [P1-5 / BUG-C-10] 课程→学习任务接力节点缺 `checkRules: { inheritCourseRules: true }` 🟢 高
- **位置**:`plan/form.vue:240-248` `appendCourseNode`
- **证据**:push 节点时无 `checkRules` 字段,与 `useGroupManager.js:90` 手工添加不一致
- **修复**:抽出 `createCourseNode` 工厂方法
- **三方共识**:✅ qoder 必修 #8 / Claude

### [P1-6 / BUG-C-11] 前端考试创建链路丢事件 `confirm-create-exam` 🟢 高
- **位置**:`Join1Form.vue` → `exam/exam/form.vue`
- **修复**:补充事件监听
- **三方共识**:✅ qoder 必修 #5 / co-pilot BUG-V2-008 / Claude

### [P1-7 / BUG-C-12] `FileTableEditor.vue` 表格 key 重建 → 多选丢失 🟢 高
- **修复**:表格 key 仅基于稳定 ID 集合
- **三方共识**:✅ qoder 必修 #7 / co-pilot BUG-V2-009 / Claude

### [P1-8 / BUG-C-13] `AdminMultiAddCourseFileDialog` result null NPE + URL 2KB 限制 🟢 高
- **修复**:`result = response.data || response || {}` + sessionStorage 暂存
- **三方共识**:✅ co-pilot BUG-V2-013/014 / Claude

### [P1-9 / BUG-C-14] 批量上传课件保存逻辑自相矛盾(失败项清零) 🟢 高
- **修复**:删除步骤 1 的批量清空
- **三方共识**:✅ qoder 必修 #6 / Claude

### [P1-10 / BUG-C-15] `batchSave` 中 `refId` 空 `continue` 静默丢节点 🟢 高
- **位置**:`PlanNodeServiceImpl.java:77-78`
- **修复**:`throw new ServiceException(...)`
- **三方共识**:✅ qoder 必修 #12 / co-pilot BUG-V2-016 / Claude

### [P1-11 / BUG-C-16] `AiMessageList.vue` `expandedThoughts` 默认 true 后新消息未生效 🟢 高
- **修复**:messages watch 同步
- **三方共识**:✅ qoder 必修 #13 / Claude

### [P1-12 / BUG-C-17] `CheckRulesDialog` 沿用↔自定义切换可能丢数据 🟡 中
- **修复**:切换前快照当前 formData
- **三方共识**:✅ qoder 必修 #14 / Claude

### [P1-13 / BUG-C-18] `chatSession.js` thoughtDuration 计时过短 🟡 中
- **修复**:thoughts completed 字段判断结束
- **三方共识**:✅ co-pilot BUG-V2-011 / Claude

### [P1-14 / BUG-C-19] `next-step.js` el-checkbox + MessageBox 不稳定 🟡 中
- **修复**:改用 `$prompt`
- **三方共识**:✅ co-pilot BUG-V2-005 / Claude

---

## 🟡 P2 — 应修,改进体验或防御性

### [P2-1 / BUG-C-20] 后端 `CourseClientServiceImpl` 强制 cast ClassCastException(a7176491 时) 🟡 中
- **位置**:`CourseClientServiceImpl.java:140`(a7176491 时)
- **修复**:`instanceof Map` 判断后 cast
- **三方共识**:✅ co-pilot BUG-V2-003 / Claude

### [P2-2 / BUG-C-21] 填空/简答题 scoreRate 边缘场景 🟢 高
- **修复**:BigDecimal + `Q%02d` tag
- **三方共识**:✅ co-pilot BUG-V2-022 / Claude

### [P2-3 / BUG-C-22] AI 流式 thoughts 增量 O(n²) + 模式依赖 🟢 高
- **修复**:content hash 去重 + `push.apply`
- **三方共识**:✅ co-pilot BUG-V2-020 / Claude

### [P2-4 / BUG-C-23] 后端 `menuDataScopeMap` JSON 序列化 🟡 中
- **修复**:`@JsonProperty` 注解
- **三方共识**:✅ co-pilot BUG-V2-007 / Claude

### [P2-5 / BUG-C-24] 前端 `apps.js` AI AppId 硬编码切换 🟢 高
- **修复**:灰度开关 + 清理老 AppId
- **三方共识**:✅ co-pilot BUG-V2-007 / Claude

### [P2-6 / BUG-C-25] `nextStepWithRename` 取消路径用 reject 而非 resolve 🟢 高
- **修复**:`resolve({ action: 'cancel' })`
- **三方共识**:✅ qoder / Claude

### [P2-7 / BUG-C-26] `InputToolbar` 残留 voice 按钮 props 🟡 中
- **位置**:`InputToolbar.vue:95-125`
- **修复**:同步删除 script 中 voice 相关 props
- **三方共识**:✅ Claude 自查 / co-pilot NOT-A-BUG

### [P2-8 / BUG-C-27] `colors.css` 7 个变量 5 个 dead code 🟡 中
- **修复**:删除未引用变量
- **三方共识**:✅ co-pilot BUG-V2-024 / Claude

### [P2-9 / BUG-C-28] 培训签到列表按钮绕过 v-permission 🟢 高
- **修复**:加 `v-permission`
- **三方共识**:✅ qoder / Claude

### [P2-10 / BUG-C-29] voiceTts `cleanupAudio` 应先 pause 再 revoke 🟡 中
- **修复**:`audioEl.pause()` 后再 `revoke`
- **三方共识**:✅ co-pilot BUG-V2-018 / Claude

---

## 🟢 P3 — 清理 / 文档一致性

### [P3-1 / BUG-C-30] commit message 与代码不一致(P0-4 描述)
### [P3-2 / BUG-C-31] 调试日志风格不一致(`AnswerRecordConverter.java:51` 现场 new Logger)
### [P3-3 / BUG-C-32] `transpileDependencies: ['axios']` 拖慢构建 🔵 低
### [P3-4 / BUG-C-33] console.log 生产环境泄露用户问题 🟢 高
### [P3-5 / BUG-C-34] 后端反序列化 checkRules 缺失 `inheritCourseRules=true` 默认 🟢 高
### [P3-6 / BUG-C-35] `CheckRulesDialog` 加载课程原规则无竞态保护 🟡 中
### [P3-7 / BUG-C-36] 课程编辑模式不应用 relayDirList 🟡 中
### [P3-8 / BUG-C-37] `next-step.js` 没用 i18n,中文硬编码 🔵 低

---

## ✅ 反向证伪

| 命题 | 结论 | 处置 |
|---|---|---|
| `InputToolbar` 残留 voice props | 无运行时报错(默认值 undefined + template 无引用) | v4 保留 P2-7 但标 🟡 |
| `transpileDependencies: ['axios']` | worst case 重复 transpile,不报错 | v4 降 P3 🔵 |
| `setDayLimit` 缺省 0 致显示异常 | 后端返 0 时 v-if 不触发,符合预期 | NOT-A-BUG |
| `countPrepareAndProcess` SUM 改 COUNT | 修复 NULL 问题,行为一致 | NOT-A-BUG |
| `fillRoleData` 取 MAX 兜底 | 设计意图(取最宽松),与 SQL GROUP BY 双保险 | NOT-A-BUG |
| **v3 P1-1 自定义规则覆盖** | `Boolean.FALSE.equals(false)=true` 走快照分支,**自定义模式被 line 96 跳过,不会覆盖** | **v3 撤回** |

---

## 🌐 跨模块影响清单(10 项)

| # | 模块 | 原因 | 回归测试 |
|---|---|---|---|
| IMP-01 | 移动端 H5 | 后端 `/api/plan/client/plan/notify-url` anon | 移动端断网/重连后红点 |
| IMP-02 | 后端 Shiro / 启动 | SysRole ↔ SysRoleMenu 循环依赖(已修) | 启动是否能起来 |
| IMP-03 | 学员端 AI | AppId 切换 + citations/thoughts 字段 | 老 AppId 会不会 404 |
| IMP-04 | 课程模块 | 类型转换 + 防呆规则快照 | 计划节点详情、学员播放 |
| IMP-05 | 试卷/考试 | 状态判断变化 | 创建/修改/归档全路径 |
| IMP-06 | 培训计划 | `deleted=0` 过滤(commit message 误导) | 软删节点 plan 完成 |
| IMP-07 | 角色权限 | @Transactional + 异步 | 在线用户被踢后一致性 |
| IMP-08 | 课件管理 | `_forceTableRedraw` | 学员上传头像/封面 |
| IMP-09 | 前端字段同步 | 字段名硬编码,无共享枚举 | 重命名时易断裂 |
| IMP-10 | AI 模块 | citations/thoughts 长 JSON 入库 | 数据库列宽与脱敏 |

---

## 🔗 API 契约变更(6 项)

| 接口 | 变更 | 前端是否对齐 |
|---|---|---|
| `POST /api/plan/client/plan/notify-url` | **新增** anon,body `{userId}` | ⚠️ 前端 v2 未见调用 |
| `GET /api/tmpl/tmpl/paging` | **新增** | ✅ 兜底用 |
| `POST /api/course/file/batch-save` | 出参变化 | ⚠️ 需 result null 兜底 |
| `POST /api/sys/role/save` | 行为变更 + 异步清缓存 | 后端内部 |
| `POST /api/sys/role-menu/save` | 行为变更 + 抛 IllegalArgumentException | ⚠️ 422 处理 |
| `POST /api/wk/voice/tts` | **新增** | ⚠️ 后端实现未确认 |

---

## 📌 关键决策点(4 条,待主人拍板)

1. **P0-1 通知接口鉴权** —— 紧急程度?手机端登录态和接口 anon 哪个先动?
2. **P0-2 标题兜底 id** —— 要不要打回重做(后端 save 接口必返 id)?
3. **P0-3 循环依赖** —— 直接修还是先确认 release 分支现状已修?
4. **P1-2 manualQuery 4 类未实现** —— 是 feature flag 灰度还是直接拒绝保存含此类节点的 plan?

---

## 💡 自我进化记录(落 shared-experiences.md)

🟢 **新经验(共享,14 条)**:
1. Spring `@Transactional` + `CompletableFuture.runAsync` → 必须 `TransactionSynchronizationManager.registerSynchronization(afterCommit)`
2. ShiroConfig 新增 anon 路径必须配套鉴权方案 + 风控 — userId 从前端传入是用户枚举漏洞标准反模式
3. MyBatis-Plus 改 `eq("deleted", 0)` 前必须确认实体真的无 @TableLogic 注解
4. 前端按"标题兜底查 id"是高危反模式 — 后端 save 接口必返完整对象是契约底线
5. Vue 2.x + Element UI 2.x render 函数内 el-checkbox 用 props.value + on.input 不稳定 → 优先用 $prompt
6. commit message + 注释 + 单元测试断言必须三者一致,否则 review 看不回归会掩盖严重 bug
7. 循环依赖治理:禁止 @Lazy,必须抽取独立 Service(SysRoleUserCacheService 是已落地范式)
8. API 契约变更必带 EVAL 等级 — 本次 P0-1 接口上线无安全评审
9. 报告必须看 commit 历史脉络 — 只看单 commit 状态会漏"中间态"和"已被修复"的关键判断
10. "降级 P0 → P1"原则 — Spring 循环依赖是真实风险但不是必然启动失败
11. "撤回误报"原则 — 反复读 5-10 行关键条件分支能避免 50% 误报
12. 行号实测 — 引用代码前必须 grep/sed 验证
13. 报告必须加置信度分级 + 反向证伪章节
14. 三方独立审查交叉验证 — 共识机制 > 单体能力

---

## 审查元信息

- 审查方法:对每个源 commit 实际 src 变更逐行 diff 阅读,排除 dist/docs/JSON/zip
- 对比验证:三方独立审查(Claude / co-pilot / qoder)交叉,**35 条中三方共识 18 条**
- 自审验证:4 轮迭代,撤回 1 误报 + 降级 2 过度 + 修 3 行号偏差
- 命中历史经验:循环依赖、deleted=0、Vue 异步初始化、Element UI 表格 key、v-permission、防呆规则快照、标题兜底查 id
- 重建说明:v4 原文丢失(00-Inbox 目录未纳入 git 跟踪),此为基于对话上下文 + qoder 最终版反推的重建版,**BUG-ID 与置信度保持原口径**

---

## 优先级建议(基于 v4 终稿)

**必修(阻塞发布,11 项高置信度 P0/P1)**:
- 后端安全: P0-1, P1-1
- 后端数据: P0-3, P0-4, P1-2, P1-3, P1-10
- 后端启动: P0-3
- 前端核心路径: P0-5, P1-4, P1-5, P1-6, P1-7, P1-8, P1-9

**应修(下迭代,9 项)**:P1-11~14 + P2-1~5

**清理(15 项)**:P2-6~10 + P3-1~8

**修复顺序**:
1. 先做后端必修 P0 系列 + P1-1/2/3/10
2. 再做前端必修 P0-5 + P1-4/5/6/7/8/9
3. 最后处理 P2/P3 + 决策点
