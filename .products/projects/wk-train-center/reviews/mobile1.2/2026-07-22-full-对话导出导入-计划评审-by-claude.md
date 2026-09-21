# 对话片段导出/导入功能 — 实施计划评审

| 项 | 值 |
|---|---|
| 评审对象 | `.qoder/plans/对话导出导入功能_43438e20.md` |
| 评审日期 | 2026-07-22 |
| 评审人 | Claude (主路由入口) |
| 目标工程 | `wk-train-center-ui`(v2, 4212)+ `wk-train-center-service`(`wk-module-ai`) |
| 评审范围 | 后端 B1–B6 + 前端 F1–F7 + 任务依赖 + 测试计划 + 数据契约 |

---

## 1. 总体结论

**计划整体可执行,设计合理,数据契约与现有 DDD 分层对齐**。
- 后端复用 `factory.create` + `factory.edit` 单次落库的方案(关键路径 B4)符合现有 `add` 路径惯例,原子性由 `@Transactional` 保障。
- 前端最小侵入:选择模式用 `v-if="selectMode"` 包裹,非特性路径 DOM 与行为保持不变。
- 数据契约(导出 JSON schema)与后端 `AnswerRecordAddDto` / `AnswerHistoryRecordVo` 字段对齐,`citations` 字符串 / `fileList` 双形态(`String` 与 `FileItem`)复用现有 Jackson 反序列化器。

**但存在 12 个待修复项(2 严重 / 4 高 / 4 中 / 2 低)**,其中 #1 #3 必须在开工前修,否则落地阶段会引发 NPE / 数据错乱。

---

## 2. 数据契约评审

### 2.1 ✓ 已对齐
- `version=1` / `source='wk-train-center-answer'` — 前向兼容位
- `records[].type ∈ {10,20}` — 与后端 `AnswerRecordCommand.type` 字段语义一致([AnswerRecordCommand.java:27](wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/domain/command/AnswerRecordCommand.java#L27))
- `citations` 是 JSON 字符串 — 与 `AnswerRecordCommand.citations` 字段一致([AnswerRecordCommand.java:42](wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/domain/command/AnswerRecordCommand.java#L42))
- `fileList` 双形态 — `FileItem` 自定义反序列化器已支持([FileItem.java:64-84](wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/FileItem.java#L64))
- 不写 `thoughts` — 与"不含思考"假设一致

### 2.2 ⚠ 待补
- **首条 type 必须 = 20**(用户消息):B4 `factory.create` 内 `if (command.getType().equals(20)) domain.setOverview(command.getChatHistory())`,首条若为 AI 记录则 `domain.overview` 留空,后续工厂 `edit` 不会补;若导入 overview 为空 → 历史列表标题丢失。**B4 必须校验首条 type**。
- **`citations` 字段类型**:计划只校验 `type∈{10,20}` + `chatHistory` 是字符串,**漏校验 `citations` 必须 string**(用户手改 JSON 后 `citations` 变数组,Jackson 反序列化会抛 `MismatchedInputException`,前端只看到通用网络错误)。
- **`chatHistory` 单条长度**:未设上限。攻击者可构造 1 条 10MB 字符串绕过 3MB 文件上限。

---

## 3. 后端 B1–B6 逐条评审

### B1 `AnswerImportDto` ✓
- 字段:`String overview` + `List<AnswerImportRecordDto> records`(`@NotEmpty`)
- 复用 `FileItem` — ✓ 反序列化器已支持双形态
- **建议**:`records` 加 `@Size(max = 2000)`,与前端校验对齐,深度防御。

### B2 `AnswerImportCommand` ✓
- 复用 `AnswerRecordCommand` — ✓ 字段完全覆盖
- 无新增字段

### B3 Service 接口 ✓
- 方法签名 `String importSession(AnswerImportCommand command)` — 返回**新会话主键 id**
- 注释说"返回主键 id 而非 askId" — ✓ 设计意图清晰

### B4 Service 实现 🔴 **关键路径 3 处问题**

```java
// 问题 #1:findByAskId 在新数据未刷入缓存时可能返回 null
return answerRecordRepository.findByAskId(askId).getId();  // NPE 风险
```
**修复**:
```java
answerRecordRepository.save(domain);
return domain.getId();  // 直接拿回写字段,MyBatis-Plus insert 后会回填
```
或更稳:`return answerRecordRepository.findById(entity.getId()).get().getId();`

```java
// 问题 #2:setOverview 时机在循环结束 save 之前,与工厂隐式 setOverview 行为冲突
if (StringUtils.isNotBlank(command.getOverview())) {
    domain.setOverview(command.getOverview());
}
```
- 工厂 `create` 内若首条 type=20 会 `setOverview(chatHistory)`;若首条 type≠20 则不设
- 工厂 `edit` 内若 `domain.overview` 为空且当前 type=20,会 `setOverview(chatHistory)` —— 后续 type=10 的 edit 因 overview 非空不动
- **结论**:首条必须是 type=20;否则后续 import overview 才生效
- **必须加契约校验**:`if (!command.getRecords().get(0).getType().equals(20)) throw new ServiceException("首条记录必须是用户消息")`

```java
// 问题 #3:userId 注入依赖 UserUtils
```
✓ 计划已隐含(走 `factory.create` 自动 `setUserId(UserUtils.getUserId())`)。
建议在 B4 注释中**显式标注**:"userId 取自 UserUtils,不接受前端传入"。

### B5 Controller ✓(单端点配置)
- 路径 `POST /api/wk/answer/student/import` — ✓ 与现有 controller 路径模式一致
- `RespVo<String>` 返回主键 id
- ⚠ **Shiro 路由白名单未核实**:现有 controller 端点无 `@RequiresPermissions` 注解,但全局 Shiro filter 链可能拦截新路径。**验证步骤**:启动后端 → 用 token 调 `/import` → 若 401/403,在 ShiroConfig 加白名单。

### B6 防御 ✓
- `@Transactional` — ✓ 原子性
- 校验 `type ∈ {10,20}` — ✓
- ⚠ 校验 `records.size() <= 2000` 放在 service 还是 DTO?**建议双层**:DTO `@Size(max = 2000)` 给前端清晰错误码;service 再校验一次防绕过。

---

## 4. 前端 F1–F7 逐条评审

### F1 `conversationTransfer.js` 🟡 深度校验缺失

**已有**:
- `version===1` + `source===SHARE_SOURCE` — ✓
- `records` 非空数组 + `type∈{10,20}` + `chatHistory` 是 string — ✓

**缺失**:
- `citations` 类型校验(必须 string) — 缺
- `chatHistory` 单条长度上限(建议 ≤ 50000) — 缺
- `fileList` 元素类型校验(string 或 `{url, dashScopeFileId, name}`) — 缺
- overview 长度上限(建议 ≤ 200) — 缺

**修复建议**:
```js
function parseImportText(text) {
  // ... 现有校验 ...
  for (const r of data.records) {
    if (typeof r.chatHistory !== 'string') throw new Error('聊天内容格式错误')
    if (r.chatHistory.length > 50000) throw new Error('单条聊天内容过长')
    if (r.type === 10) {
      if (r.citations != null && typeof r.citations !== 'string') {
        throw new Error('引用格式错误')
      }
      if (r.fileList != null && !Array.isArray(r.fileList)) {
        throw new Error('文件列表格式错误')
      }
    }
  }
  if (data.overview && data.overview.length > 200) {
    throw new Error('会话概述过长')
  }
  return { overview: data.overview || '', records: data.records }
}
```

### F2 `ConversationSelectToolbar.vue` ✓
- 展示型组件,无状态依赖
- 样式对齐深色工具条 — 需在实现时确认现有色板

### F3 `AiMessageList.vue` 🟡 勾选圈事件冒泡
- `selectMode=true` 时隐藏 `user-action-left` / `ai-action-right` — ✓
- 点击组任意消息或勾选圈 → `@toggle-group` — ✓
- ⚠ **键盘事件未拦截**:selectMode 时键盘 Enter 仍可能触发 AiInputArea 内的 send —— 需在 AiInputArea 内 `v-if` 或 disabled,或 AiChatPanel 层加 `e.preventDefault()` 拦截

### F4 `AiChatPanel.vue` ✓
- props 透传:`selectMode` / `selectedGroupKeys` / `selectedCount` / `totalGroups` / `allSelected` — ✓
- 底部条件渲染:有 selectMode 显 toolbar,无则显 AiInputArea — ✓
- ⚠ **`AiInputArea` 隐藏时键盘事件未禁用**:见 F3

### F5 `AnswerAssistantView.vue` 🟠 **必须修 stopGeneration**

**问题**:`triggerImport` / `onImportFileChange` 没停 SSE 流。
- 若用户在 AI 流式生成中点导入,新会话载入后,旧流仍在推送,`vm.$set(state.messages[aiMsgIndex], ...)` 会写到**老 askId 的老消息**上,导致老会话 UI 错乱
- **修复**:`triggerImport()` 起手调 `this.session.methods.stopGeneration()`

**问题 2**:`enterSelectMode` 校验 `isLoading`,但 `triggerImport` 没校验 — 同上场景。

**问题 3**:SSE 流在新会话 load 完成后,旧 controller 仍在跑 — 已在 `beforeDestroy` 处理,但 import 不销毁 View。**必须**:`onImportFileChange` 起手 `stopGeneration()`。

**问题 4**:`finally` 清空 `input.value` 让用户无法重复选同文件 — 改为只在成功后清空,失败保留以便重试。

### F6 API + Adapter ✓
- `AnswerAssistant.importSession(data)` 调 `POST /api/wk/answer/student/import` — ✓
- `answerAdapter.importSession` 转发 — ✓ 但 `AnswerAssistantView` 可直接调 `AnswerAssistant` 而非绕 adapter(注释说"也可在 View 直接调",合理)

### F7 Header + AiAssistant.vue 🟡 tooltip + selectMode 自动退出

**问题 1**:Header 图标无 `<el-tooltip>` 包裹,与其他图标风格不一致 — 应补
```vue
<el-tooltip content="导出对话" placement="bottom">
  <i class="el-icon-download icon-btn" @click="$emit('menu','export-conversation')" />
</el-tooltip>
```

**问题 2**:`selectMode=true` 时若有 SSE 流式生成完成,UI 应自动退出多选 — 计划未提
**修复**:在 `AnswerAssistantView` 加 watcher:
```js
watch: {
  'session.state.isLoading'(v) {
    if (!v && this.selectMode) {
      this.$nextTick(() => this.exitSelectMode())
    }
  }
}
```

---

## 5. 交互流程评审

### 5.1 导出流程 ✓
1. 菜单「导出对话」→ `enterSelectMode` — ✓ 校验 `!isLoading`
2. 勾选 / 全选 — ✓
3. 「导出JSON」→ `buildExportPayload` + `downloadPayload` — ✓
4. 自动 `exitSelectMode` + 成功提示 — ✓

### 5.2 导入流程 🟠
1. 菜单「导入对话」→ `triggerImport` — ⚠ **未停 SSE**(见 F5)
2. 选 `.json` → FileReader 读取 — ⚠ **未处理 onerror**
3. `parseImportText` 校验 — ✓
4. `importSession` → 拿主键 id — ✓
5. `loadHistoryDetail(id, welcomeMessage)` — ✓
6. `loadHistoryList(true)` 刷新 — ✓
7. 成功提示 — ✓

---

## 6. 任务依赖评审

### 6.1 ✓ 关键路径清晰
- 后端:1→2→3→9→8
- 前端:4→6→7→8→10

### 6.2 ⚠ 缺并行机会标注
- 步骤 4(F1 conversationTransfer.js 无依赖)可与 1(B1 DTO)并行,但计划未显式说明
- 步骤 5(F2 ConversationSelectToolbar)与 F1 也可并行

**建议**:在「任务分解与依赖」章节加甘特图或文字并行说明,方便双线推进。

### 6.3 ⚠ 缺测试任务
- 后端 unit test `AnswerRecordAppOpServiceImpl.importSession` —— **任务列表无**
- 前端 `conversationTransfer.js` 单测 —— **任务列表无**
- E2E 「可选」力度不够,核心导出→导入回环必须有自动化

**建议**:任务列表加 #11 后端单测、#12 前端单测、#13 E2E(必做而非可选)。

---

## 7. 测试计划评审

### 7.1 后端 🟡
- ✓ 用例覆盖:N 条 records 仅一次 save / 返回非空主键 id / index 依次 askId+1..N / fileList + citations 保留无 thoughts / overview 覆盖 / 空 records 抛异常回滚
- ⚠ **缺**:首条 type≠20 应抛异常 / citations 非字符串应抛异常 / fileList 双形态应兼容 / chatHistory 超长应抛异常
- ⚠ **缺**:并发导入两个文件(askId 不冲突即可,但应验证幂等)

### 7.2 前端 🟡
- ✓ 导出 + 导入回环 / 续聊 / 撤回 / 重试
- ⚠ **缺**:isLoading 时点导入的边界(看 F5 修复后必须测)
- ⚠ **缺**:导入他人分享的 JSON 文件(防越权 — 后端会写当前 userId)

### 7.3 E2E
- 计划标"可选"—— **应改为必做**;导出→清空→导入→比对 messages 是否完全一致

---

## 8. 被否决方案评审

| 方案 | 否决理由 | 评价 |
|------|---------|------|
| 分享 ID + 新表 | 改用本地 JSON | ✓ 简单,但失去集中存储能力 |
| 前端循环 addRecord | 改用单次 /import | ✓ 原子性正确 |
| 导入不调后端 | 改用 loadHistoryDetail | ✓ 正确拿权威 index |
| 返回 askId | 改用主键 id | ✓ 复用 getRecord |
| 抽 selection composable | YAGNI | ✓ 合理 |
| Web Worker 解析 | YAGNI | ✓ 合理 |
| 含 thoughts | 用户决策不含 | ✓ 与假设一致 |

**待补充否决方案**:
- **导入到现有会话(追加而非新建)**:被否决理由?未提 —— **明确"导入永远新建"应写入假设**,避免后续争议
- **批量导入多个文件**:本期不支持 —— 应在"已知限制"章节写明

---

## 9. 假设与已知限制评审

### 9.1 ✓ 假设完整
- 仅答疑模式 ✓
- 成对分组 ✓
- 附件原样存 ✓
- 导入永远新建 ✓
- 文件名 share-<overview> ✓
- 保真度:不含思考 ✓

### 9.2 ⚠ 已知限制散落
- "OSS 预签名 URL 过期"放在「边界与校验」章节,应**独立列「已知限制」章节**,方便用户扫一眼就看到功能边界

### 9.3 ⚠ 缺
- **导入大文件性能**:无明确上限数字(3MB / 2000 条在 F1,但已知限制章节未提及)
- **并发编辑冲突**:两个浏览器标签同时导出会话 → 后端写入不会冲突(每条独立),但 askId 生成是 `System.currentTimeMillis() + userId` 极小概率冲突 —— 应注

---

## 10. 必须修复(开工前 Top 5)

| # | 等级 | 文件 | 修复 |
|---|------|------|------|
| 1 | 🔴严重 | 后端 B4 | `return domain.getId();` 替代 `findByAskId(askId).getId()`,消除 NPE |
| 2 | 🔴严重 | 后端 B4 | 加首条 type=20 校验,抛 ServiceException |
| 3 | 🟠高 | 前端 F5 | `triggerImport` 起手 `session.methods.stopGeneration()` |
| 4 | 🟠高 | 前端 F1 | `parseImportText` 加 citations 类型 + chatHistory 长度校验 |
| 5 | 🟠高 | 前端 F4/F3 | selectMode 时禁用 AiInputArea 键盘事件(Enter 发送) |

## 11. 建议修复(落地阶段 Top 7)

| # | 等级 | 文件 | 修复 |
|---|------|------|------|
| 6 | 🟡中 | 后端 B5 | 启动后端 + curl 验证 Shiro 是否拦截 /import |
| 7 | 🟡中 | 后端 B1 | `records` 加 `@Size(max = 2000)` |
| 8 | 🟡中 | 前端 F5 | FileReader `onerror` 回调 |
| 9 | 🟡中 | 前端 F5 | `input.value` 清空改为仅成功时 |
| 10 | 🟡中 | 前端 F7 | Header 图标补 `<el-tooltip>` |
| 11 | 🟡中 | 前端 F5 | `watch(isLoading)` 实现 selectMode 自动退出 |
| 12 | 🟢低 | 全局 | 任务列表加 #11-13 测试任务,E2E 改必做 |

## 12. 可选优化(后续迭代)

- **取消"导入永远新建"**:增加"导入到当前会话(追加)"模式
- **导出格式可读化**:除 JSON 外加 Markdown / PDF 选项
- **分享链接 + el_answer_share 表**:跨用户分享场景(已否决但有需求时可启用)
- **导入大文件性能**:Web Worker + 流式解析(> 10MB 时启用)

---

## 13. 评审结论

**计划可执行,数据契约对齐,核心路径正确**。
**必须先修 #1-5 再开工**,其中 #1 #3 是不修会导致线上事故的问题(NPE / 老会话数据错乱)。
**建议修 #6-12 同步落地**,测试计划需从"可选 E2E"提升到"必做 E2E"。

**放行条件**:
- #1-5 全部修复后,计划可进入实现阶段
- 落地完成后,跑 #13 E2E 导出→清空→导入回环,确认 messages 完全一致
