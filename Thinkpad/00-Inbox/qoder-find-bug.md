# 双提交隐形 Bug 与跨模块影响审查报告（v3 优化）

> **范围**：前端 `0003f1d3`（wk-train-center-ui，56 个业务文件 / +5556/-2865）+ 后端 `a717649`（wk-train-center-service，45 个业务文件 / +1028/-100）。
> **审查日期**：2026-07-13
> **修订版本**：v1 初始（10 项必修 + 13 项建议）→ v2 补齐缺口（16 项必修 + 12 项建议 + 已验证安全 + API 契约）→ **v3 补全行号定位 + 合并 Co-pilot 漏掉的细节 bug + 拆出移动端对接盲区为必修 #17**
> **审查基线**：已排除 dist、tinymce、.understand-anything、.qoder 等产物，仅针对纯业务代码 diff。
> **对照报告**：[claude-find-bug.md](file:///E:/rhProject/Thinkpad/00-Inbox/claude-find-bug.md) / [co-pilot-find-bug.md](file:///E:/rhProject/Thinkpad/00-Inbox/co-pilot-find-bug.md)

---

## 必修（建议阻塞发布，共 17 项）

### 业务连续性高危（必修 #1–#3）
直接影响线上业务连续性：服务启动 / 计划完成 / AI 助手可用性。

#### #1 后端：培训计划完成判定会**永远凑不齐课程数**（高危回归）
- **位置**：`PlanNodeServiceImpl.java:225-231`（`listAllNonSparringNode`）
- **影响**：管理员软删的节点仍被返回 → `checkFinished` 统计不到完整课程数 → 全平台培训计划**永远无法标记为已完成**。
- **关联**：单元测试中对应的 `deleted=0` 断言**同时被删除**（`PlanNodeServiceImplTest.java`），掩盖了回归；diff 中残留的历史"2026-06-17 修复"注释也被一起删除。
- **建议**：恢复 `deleted=0` 过滤与对应测试断言。

#### #2 后端：角色权限模块**循环依赖**，应用可能无法启动
- **位置**：`SysRoleServiceImpl.java:36-41, 118-130` ↔ `SysRoleMenuServiceImpl.java:110-115` 双向互相注入
- **影响**：Spring Boot 2.6+ 默认禁止循环引用 → release 分支启动失败；若靠 `allow-circular-references=true` 救场，循环本身仍存在。
- **关联风险**：`clearUserRedisCache` 从 `private` 改 `public` 后**任何 service 误调都会清整个角色的 Redis 登录态**，是循环依赖治理的伴生故障。
- **历史经验**：团队在 commit `2b0aa2f` 已通过抽取 `SysRoleUserCacheService` 解决过类似问题，本次又把同一模式带了回来。
- **建议**：把 `clearUserRedisCache` 抽到中立服务切断双向依赖，同时保持 `package-private` + `@VisibleForTesting`。

#### #3 前端：AI 消息列表**首次渲染即报错**
- **位置**：`AiMessageList.vue:6701, 6758, 6782-6785, 6603, 6607-6614`（模板中 TTS 状态判断 `ttsLabel`、`voiceTts.isSynthesizing`）
- **影响**：AI 弹窗打开瞬间，若存在历史 AI 消息或欢迎消息，整个消息列表**直接空白**，用户既看不到旧会话也发不出新消息。
- **建议**：给 `voiceTts` 加 null 守护或在 `data()` 里直接初始化占位对象。

### 安全/数据正确性高危（必修 #4–#6）

#### #4 后端：**匿名红点接口接收任意 userId**（用户枚举漏洞）
- **位置**：`ShiroConfig.java:135-136` + `PlanClientController.java:111-121`
- **影响**：任何人无需登录即可查询任意 userId 的"是否有未完成培训计划"，既是用户枚举也泄露活跃状态。
- **关联风险**（必修 #4 同源隐患）：`CourseClientServiceImpl.java:139-142` 强制 cast `(Map<String, Object>)`，**当 `resolveCheckRules` 返回 null 或不同类型时直接 `ClassCastException`**，会把"防呆规则解析"链路打断到所有依赖 `getCheckRules` 的入口（学员端课程详情 + 计划节点详情）。
- **建议**：必修 #4 + 必修 #4 同源必修都必修：改 anon 为鉴权、userId 从 token 取、cast 前 `instanceof Map` 判断。

#### #5 后端：防呆规则**用户自定义值被静默覆盖**
- **位置**：`PlanNodeServiceImpl.java#saveAll#66-101`
- **影响**：管理员在 UI 配置的非空自定义规则（如 `dayLimit=30`、`dayRule=...`）会被**悄悄覆盖**为课程默认配置，前端以为保存成功，服务端默默丢数据。
- **建议**：仅当用户未填或明确"沿用"时走课程快照分支。

#### #6 前端：课程/试卷保存后按标题兜底查 id → **可能串号**
- **位置**：`course/form.vue:237-249` + `exam/exam/form.vue:227-241` + `Join1Form.vue:227-243` 中"按标题兜底查 id"逻辑
- **影响**：课件/课程/试卷允许同名。两个管理员几乎同时创建同名"入职培训"，其中一人走完接力 → 学习任务**关联到对方已存在的课程/考试**。属于数据串号型故障，比"应用报错"更难追查。
- **关联风险**：`AdminMultiAddCourseFileDialog.vue:191-198` `askToCreateCourse` 通过 `$router.push` 携带 `JSON.stringify` 大对象，URL 长度限制通常 2KB，~100 个课件就会超 → 跳过去 `JSON.parse(q.relayDirList)` 失败 catch 兜底后**无任何提示**，用户以为接力成功，实际 dirList 为空。
- **建议**：必修 #6 + URL 超长必修都必修：后端 `save` 接口必须 resolve 后返回真实 id，**禁止前端按标题兜底**；URL 接力改为 sessionStorage / Pinia 暂存。

### 业务流程缺陷（必修 #7–#10）

#### #7 前端：考试创建链路**丢失事件**
- **位置**：`Join1Form.vue` → `exam/exam/form.vue`（嵌入式使用 `<Join1Form @back @cancel>`，未监听 `confirm-create-exam`）
- **影响**：在考试管理页选"新建试卷"并保存后，弹窗"继续创建考试"点击后**没有任何反应**，永远卡在第二步。
- **建议**：在考试表单补充事件监听和处理函数，与 `tmpl/form.vue` 保持一致。

#### #8 前端：批量上传课件保存逻辑**自相矛盾**
- **位置**：`AdminMultiAddCourseFileDialog.vue` 保存流程
- **影响**：保存时先把后端标记的失败项清零，下一步又用清零后的值过滤冲突 → **冲突项永远过滤不到**，后端真实失败信息被静默吞掉。
- **关联风险**：6 步保存流程 `batchSaveFiles` 用 `result.successFiles / result.failedFiles`，但 `result` 可能为 `null`/`undefined`（后端异常返回）→ `result.successFiles.length` 直接 NPE。
- **建议**：删除步骤 1 的批量清空 + `result = response.data || response || {}` 兜底。

#### #9 前端：上传弹窗表格**反复重建，多选丢失**
- **位置**：`FileTableEditor.vue` 表格 `:key` 基于 `hasError:uid:saved` 拼接
- **影响**：每次冲突重检都重建 el-table → 多选状态被异步清空 → 用户确认提交时选中的文件已悄悄丢失。
- **建议**：表格 key 仅基于稳定 ID 集合，用单元格样式表达标红而非整表重建。

#### #10 前端：防呆规则校验**与对话框暴露的合法配置不匹配**
- **位置**：`plan/form.vue:351`（`validateCheckRules`）↔ `CheckRulesDialog.vue` 默认配置
- **影响**：仅开启"按顺序解锁"或"每日学习时段/次数上限"等 UI 合法配置 → 保存学习任务会被前端校验直接拒绝（"必须开启防呆弹窗或禁止拖动"），**能配不能存**。
- **建议**：将 `stepLock`/`dayLimit`/`dayRule` 任一启用也视作合法通过条件。

### 哑巴功能 / 数据丢失型（必修 #11–#12）
这一类是**最危险的 bug**：表面上功能存在并提交成功，实际后端啥也没做，UI 无任何报错，比"应用报错"更隐蔽。

#### #11 后端：培训计划新增 4 类节点**报名数据永不写入**
- **位置**：`PlanUserClientServiceImpl.java:124-149` 中 `ACTIVITY/SURVEY/BATTLE/CERT` 四个 nodeType 分支
- **影响**：管理员把"问卷/竞赛/活动/证书"加入计划时，`manualQuery` 直接 `return` + `log.warn("尚未实现")`，**报名数据永远不写入**。但完成校验会去查这些节点的状态 → 计划**永远完不成**，且运营/管理员毫无察觉。
- **建议**：要么补齐 4 类节点的报名数据写入逻辑，要么**显式 throw 让上层知道**；不允许静默 skip。

#### #12 后端：批量保存计划节点 `refId` 缺失被**静默跳过**
- **位置**：`PlanNodeServiceImpl.java:78-79`
- **影响**：`if (StringUtils.isBlank(item.getRefId())) continue;` 让 `refId` 为空的节点被悄悄跳过，管理员保存时**无任何提示**，但节点列表里仍有这些"孤儿"节点。常见触发场景：管理员拖入节点时异步加载未完成即保存 → **部分节点悄无声息消失，数据丢失**。
- **建议**：`refId` 为空应 `throw` 或 `$message.error`，**禁止 silently continue**。

### AI 体验核心回归（必修 #13–#14）
本次主推的"AI 思考与检索交付全链路"功能目标直接相关的回归。

#### #13 前端：AI 新消息**思考过程默认收起**，与设计目标完全相悖
- **位置**：`AiMessageList.vue:264-266`（`mounted()` 与 `messages` 监听器）
- **影响**：`mounted()` 只把已有 messages 的 `expandedThoughts[index] = true`；**流式追加的新 AI 消息没有 watch 触发同步展开**。长对话场景下学员的新提问对应的思考过程**默认收起**，与"思考过程默认可见"的本期产品目标**完全相悖**。
- **建议**：在 `messages` watch 中同步 `expandedThoughts`，或在消息 push 时主动 set。

#### #14 前端：防呆规则对话框**沿用↔自定义切换可能丢数据**
- **位置**：`CheckRulesDialog.vue:214-233`（`handleInheritBeforeChange` 沿用→自定义切换）
- **影响**：从沿用切到自定义时**没有保存当前自定义值快照**，只刷新预览。用户来回切换 inheritCourseRules 时，**中间编辑的自定义字段值不会被记忆**，管理员配置工作前功尽弃。
- **建议**：切换前先快照当前 formData 到 `customRulesSnapshot`，切回时恢复。

### 数据泄露（必修 #15）

#### #15 前端：生产环境 **AI 控制台日志泄露用户问题内容**
- **位置**：`chatSession.js:249, 355` + `src/api/ai/common.js` 中的 `console.log('[SSE Chunk]')`、`console.log('[syncToBackend] thoughts')` 等埋点；附加 `voiceTts.js:24-30` 的 `base64ToBlob + URL.createObjectURL` 未及时 revoke 风险
- **影响**：生产打包未移除 `console.log`，用户提问原文直接打印到生产浏览器控制台 + 上报到前端监控，属于**用户隐私泄露**。同时 `voiceTts.stop()` → `cleanupAudio` → `revokeObjectURL` 但 `audioEl.onended` 还在异步回调里，可能 revoke 之后 audioEl 还引用已释放 blob URL，浏览器 console warn。
- **建议**：生产打包用 terser 移除 `console.log`，加 `if (process.env.NODE_ENV !== 'production')` 保护；`cleanupAudio` 里先 `audioEl.pause()` 再 revoke。

### 数据完整性补充（必修 #16）

#### #16 前端：课程→学习任务接力**节点缺防呆规则**
- **位置**：`plan/form.vue` 接力 push 节点
- **影响**：保存课程后点"继续创建学习任务"会自动添加一个 course 节点，但**没有继承课程防呆规则**，与手工添加同一类型节点结果不一致；后端按 `inheritCourseRules=false` 默认值处理。
- **建议**：补充 `checkRules: { inheritCourseRules: true }`，或抽出 `createCourseNode` 工厂方法。

#### #17 移动端：**学员端对接盲区**（必修 #4 的衍生必修项）
- **位置**：wk-mhc-mobile / wk-mhc-ui（前端 v2 diff **未见 `/api/plan/client/plan/notify-url` 调用代码**，强烈怀疑移动端独立分支对接）
- **影响**：必修 #4 必修后，移动端若仍按 anon 鉴权调用此接口，**未登录用户能直接消费学员红点信息**；同时 `notify-url` 接口返回的 `url` 字段若指向 v2 后台而非移动端 H5，红点点击会跳错端。
- **建议**：
  1. wk-mhc-mobile / wk-mhc-ui 仓库 owner **必须**复核是否对接此接口
  2. 若已对接，必修 #4 必修先于移动端发版生效
  3. `url` 字段建议区分 `appType`（pc/mobile）或拆分为两个接口

---

## 建议修复（不阻塞但应排期，共 12 项）

| # | 范围 | 摘要 | 业务影响 |
|---|---|---|---|
| A1 | 后端 | 模板编辑状态条件由"等于草稿"改为"非已归档" | 试卷发布后无法再改题；可能影响运营流程，需产品确认 |
| A2 | 后端 | AI 模块留存 AI-DEBUG 日志且高频热路径打 payload 长度 | 高并发下日志风暴 + 性能损耗 |
| A3 | 后端 | `clearUserRedisCache` 用异步 runAsync，未绑定事务回调 | 数据/缓存小窗口脏读（事务回滚后异步仍跑导致误清缓存） |
| A4 | 后端 | 课程详情每次打开都远程解析防呆规则 | 数据库 QPS 放大；建议加缓存 |
| A5 | 后端 | 填空题/简答题导入 tag 用单字符，超过 26 道时下标溢出 | 低概率但潜在 |
| A6 | 前端 | TTS 标签/状态在 `voiceTts` 异步初始化窗口期未守护 | 与必修 #3 同源 |
| A7 | 前端 | 流式 thoughts 累积依赖未默认开启的 `incrementalOutput` | AI 思考过程可能只保留最后一段 |
| A8 | 前端 | `apps.js` 答疑 AppId 硬编码切换 | 学员升级后历史会话无法关联 |
| A9 | 前端 | 培训签到列表按钮绕过 `v-permission` 指令 | 无权限用户可点击创建，被服务端拒绝才看到 403 |
| A10 | 前端 | `next-step.js` 用 `vnode.elm` 拿 DOM 引用，弹窗关闭后 elm 引用 dangling | 复选框勾选/取消时输入框显隐不同步 |
| A11 | 前端 | `CheckRulesDialog.vue` 加载课程原规则无竞态保护 | 快速切换课程时预览错位 |
| A12 | 前端 | `chatSession.js` 计时字段复用，复用消息时未清零 | "已思考 X 秒"显示错误时长 |

---

## 已验证安全（反向清单）

以下变更曾被怀疑为 bug，经核对代码确认**实际行为正常**，发版前无需处理：

- **PlanClientMapper.xml 的 `SUM(CASE WHEN...)` → `COUNT(CASE WHEN...)`**：本次正向修复。当 LEFT JOIN 无匹配时 SUM 返回 NULL 会导致 Java 端 `Map<Long,Long>` 出现 `NullPointerException`，改用 COUNT 后自动返回 0，是正确的修复。
- **`fillRoleData` 可见性从 `private` 改 package-private**：`SysUserServiceImpl.java:1250` 仅供同包测试用，无外部调用方，影响面受限。
- **Commit `d3b275103` 的 `fillRoleData` 数据权限 MAX 兜底**：多角色用户取 `dataScope` 最大值是正确的业务约定，前端展示与后端解析一致。
- **`PlanNode.setDayLimit` 缺省为 0**：当后端返回 0 时前端 `v-if` 不显示，符合预期，不会出现"老浏览器死循环"问题。
- **`d3b275103` 的 `dataScope` 变更检测**：原 a7176491 时代码虽漏检"新增角色"场景，但**已被 2b0aa2f 修复**，当前 HEAD 已 OK；a7176491 merge 窗口期线上可能命中，但已过窗口。
- **`InputToolbar.vue` 删除 voice 按钮后 props 残留**：`voiceButtonTitle` 等 computed 仍定义但 template 无引用，Vue 不调用，不会运行时报错。
- **`TmplServiceImpl.saveOrUpdate` 跳过 paper/exam 引用检查**：新增试卷场景理论上不存在引用，无实际风险。

---

## API 契约变更清单

### 新增接口（前端是否对齐需 QA 确认）

| 接口 | 说明 | 前端对接状态 |
|---|---|---|
| `POST /api/plan/client/plan/notify-url` | 学员端红点通知，body `{userId}`，返回 `{url, title}` | ⚠️ 前端 v2 diff 未见调用，需确认 wk-mhc-mobile/wk-mhc-ui 是否对接 |
| `GET /api/tmpl/tmpl/paging` | 按 title 分页查询试卷（`apiFetchTmplPaging`） | ✅ course form / exam form / Join1Form 兜底用 |
| `POST /api/course/file/batch-save` | 批量保存课件（`AdminMultiAddCourseFileDialog` 使用） | ✅ |
| `POST /api/wk/voice/tts` | AI 语音合成（`voiceTts.js` 调用），body `{text, voiceId}`，返回 `{audioBase64, mime}` | ⚠️ 后端 yf-web 是否真实现？需 diff 复核 |

### 行为变更接口

| 接口 | 变更 | 风险点 |
|---|---|---|
| `POST /api/sys/role/save` | 新增 `@Transactional(rollbackFor=Exception.class)` + data_scope 变更时清 Redis | 配合必修 #2 循环依赖治理同步处理 |
| `POST /api/sys/role-menu/save` | `saveRoleIds` 实时读 `el_sys_role.data_scope`，角色不存在抛 `IllegalArgumentException` | ⚠️ 角色管理前端若未处理 422 异常会白屏 |
| `POST /api/sys/user/login` 内部：`fillRoleData` 返回 `menuDataScopeMap` | 跨包可见性放宽 | ⚠️ 需确认 DTO 序列化含此 map，前端才能拿到完整权限数据 |

---

### 删除接口

无

---

## 跨模块影响摘要

### 前后端联动隐患
- 前端 `apps.js` 答疑 AppId 切换 + 后端 `AnswerHistoryRecordVo`/`TrainingRecordVo` 新增 `citations`/`thoughts` 字段：会话上下文是否随 AppId 迁移，QA 需确认。
- 前端 `CheckRulesDialog.vue` 字段（`inheritCourseRules`/`checkOn`/`stepLock`/`dayLimit`/`dayRule`）与后端 `PlanNode.checkRulesJson` 字段名完全一致但**没有共享枚举/常量**，依赖字符串硬编码维护，重命名时易断裂。
- 前端 `Join1Form.vue` 发出 `confirm-create-exam`，后端无需变更；但**嵌入式创建试卷场景缺少监听方**，与必修 #7 互锁。

### 前端模块间
- AI 模块（`AiMessageList`/`ThoughtsSection`/`CitationList`/`voiceTts`/`chatSession`/`common.js`）整体改造，相互耦合密集；任一字段/事件变更都会级联到 6+ 个文件。
- 课件上传链路（`useFileUploadState`/`useFileValidation`/`FileTableEditor`/`AdminMultiAddCourseFileDialog`/`FileUpload`/`FileUploadOss`）新增 mixin 间 `hasError` 写入路径，存在互相覆盖风险（与必修 #8 相关）。
- 防呆规则组件（`CheckRulesDialog` ↔ `PlanDesign`/`PlanNode`/`PlanGroup`/`useGroupManager` ↔ `plan/form.vue`）数据流未完全对齐，是必修 #10/#14/#16 的根因。

### 后端模块间
- `plan` 模块新增 `CourseMapper` 直接依赖 `course` 模块内部表（领域上下文穿透），反向又通过 `PlanCheckRulesResolver` 接口注入 course；任一模块调整易导致编译期耦合。
- `system` 模块角色/菜单/用户缓存改动波及 Shiro 全平台鉴权链路，单元测试新增但缺联调覆盖。
- AI 模块的 `citations`/`thoughts` 长 JSON 入库，需确认数据库列宽与脱敏/合规策略。

### 移动端/外部系统
- 后端新增 `/api/plan/client/plan/notify-url` 走 anon 路径，移动端（wk-mhc-mobile / wk-mhc-ui）若对接此接口将绕过登录态校验；必修 #4 必须先于移动端发版处理。
- 前端 v2 diff 未见此接口调用代码，**强烈怀疑移动端分支独立开发并直接对接**，请相关 owner 复核鉴权链路。

---

## 历史经验命中

- **循环依赖治理**（"禁止 @Lazy、必须抽取独立 Service"）：必修 #2 是该经验明确警告的反模式，本次走了历史否定路径。
- **MyBatis-Plus 显式过滤软删除**：必修 #1 直接回退了 2026-06-17 已落地的修复。
- **Vue 异步初始化导致首次渲染空引用**：必修 #3 + 建议 #A6 是该历史坑位的复现。
- **AI 流式 thoughts 累积**：建议 #A7 命中"thoughts 字段增量累积"技能。
- **Element UI 表格 key 重建**：必修 #9 命中历史反模式记录。
- **前端权限按钮 v-permission 契约**：建议 #A9 命中。
- **防呆规则快照模式决策**（已记忆）：必修 #5/#16 与"快照模式"原则冲突——快照应在新建时一次定型，不应在保存时反向覆盖用户输入，也不应在接力场景被跳过。
- **新沉淀经验（来自对比其他智能体报告）**：
  - **Vue 2.x + Element UI 2.x render 函数内 `el-checkbox` 用 `props.value + on.input` 不稳定**（建议 #A10 命中）。
  - **SpringBoot `@Transactional` + `CompletableFuture.runAsync` 清理缓存**：建议 #A3 是该反模式，必须改用 `TransactionSynchronizationManager.registerSynchronization(afterCommit)`。
  - **MyBatis-Plus 删 `eq("deleted", 0)` 前必须确认实体无 `@TableLogic`**，否则"幽灵数据"排查极难。
  - **前端按"标题兜底查 id"是高危反模式**，只要业务允许重名就是定时炸弹，后端 save 接口必返完整对象是契约底线。
    - **后端 service 强制 cast `(Map<String, Object>)` 必须 `instanceof Map` 守护**（必修 #4 同源风险）——否则上游返回 null 或其他类型会 ClassCastException 打断整条接口。
    - **生产打包必须移除 `console.log`**（必修 #15 命中）——SSE 流式 / AI 同步 / 用户提问原文等调试日志会泄露隐私，建议 `if (process.env.NODE_ENV !== 'production')` 保护或 terser drop_console。

---

## 结论与修复优先级建议

**P0 必修（发版阻塞，必须 100% 修复）**：必修 #1–#16 全部 16 项。

**修复顺序建议**（按业务影响半径排序）：

| 阶段 | 必修项 | 修复理由 |
|---|---|---|
| 第一批（服务可用性） | #2、#1、#4 | 影响应用启动 + 计划完成链路 + 安全漏洞，发布前必须 |
| 第二批（数据正确性） | #11、#12、#5、#6 | 哑巴功能/数据丢失/静默覆盖类，是最难追查的故障类型 |
| 第三批（学员核心路径） | #3、#7、#8、#9、#13 | 影响 AI 助手 / 考试创建 / 课件上传等学员侧主流程 |
| 第四批（次要体验） | #10、#14、#15、#16、#17 | 防呆规则配置体验 + 隐私保护 + 接力路径一致性 + 移动端对接 |

**建议项 A1–A12**：排入下个迭代，可与必修项修复同步开发但**不阻塞本次发版**。

**团队决策点（待主人拍板）**：
1. 必修 #11（4 类 nodeType 静默 skip）：是 feature flag 灰度中还是直接拒绝保存？
2. 必修 #6（按标题兜底查 id）：要打回重做吗（后端 save 接口必返 id）？
3. 必修 #13（新消息 thoughts 收起）：是否本期产品目标已变更（默认收起）？需 PM 确认。
4. 必修 #17（移动端对接盲区）：wk-mhc-mobile / wk-mhc-ui 是否已对接 `notify-url` 接口？必修 #4 必修前必须先确认。

---

## 审查元信息

- **审查人**：Qoder (using review skill)
- **审查方法**：对 merge commit 的两个 parent 之间的纯业务代码 diff 逐行分析（已排除 dist / docs / JSON / zip / .qoder / .understand-anything），并行启动专项 review agent 做隐式 bug 与跨模块影响识别，最后由 Qoder 整合 v1/v2/v3 三版迭代。
- **关注维度**：业务连续性 / 安全越权 / 数据正确性 / 哑巴功能 / AI 体验回归 / 跨模块契约 / 历史经验命中。
- **v3 相比 v2 的优化**：补全 17 项必修 + 12 项建议 + 8 项关键必修的行号定位（从 Claude/Co-pilot 报告交叉验证）；合并 Co-pilot 漏掉的 5 个细节 bug（ClassCastException / NPE 兜底 / URL 超长 / clearUserRedisCache public / TTS 对象 URL 泄漏）作为必修项的"关联风险"；拆出移动端对接盲区为独立必修 #17；新增 2 条新沉淀经验（cast 守护 + vnode.elm dangling）。
- **未覆盖（已知边界）**：本次未做代码运行验证、未做单元测试覆盖率统计、未做数据库迁移脚本复核（建议 QA 在测试环境跑迁移后核对必修 #1/#5 的 SQL 影响）。