# AI 功能全方位审核（前端 + 后端）

| 项 | 值 |
|---|---|
| 审核日期 | 2026-07-22 |
| 审核范围 | 前端 `wk-train-center-ui@2559e293`（12 文件 +759/-33）<br>后端 `wk-train-center-service@14fdd66`（9 文件 +198/-5） |
| 审核视角 | 完整性 / 正确性 / 影响面（三个 CodeReviewAgent 并行） |
| 涉及功能 | ①对话导出/导入 ②suggest 持久化 ③会话标题自动生成 |

---

## Critical Issues (MUST FIX)

### C1. `WkAiAgentExceptionHandler` 范围过广，吞掉 import 接口的 ServiceException，错误响应格式错位

**影响面**：本模块 controller 包下所有抛 `ServiceException` 的接口（不只是当前 importSession，也包括后续将抛的接口）

**证据**：
- `WkAiAgentExceptionHandler` 声明 `@RestControllerAdvice(basePackages = "com.wk.traincenter.ai.controller")` 且未带 `@Order`
- 该 handler 把 `ServiceException` 序列化为 `AgentChatChunkVo`（`{type/errorCode/content}`），而**不是**约定的 `ApiRest`（`{code/msg/data}`）
- 本次新加的 `importSession` 在 6 处抛 `ServiceException`（参数为空、> 2000 条、首条非用户、类型非法、正文为空、导入后无法取 ID）
- 前端 `AnswerAssistantView.vue` 的 import 调用依赖 `res.code === '00000000'` 与 `res.msg`，`AgentChatChunkVo` 无此字段

**风险**：
- 任何参数非法的导入请求，前端看到 `{type:"error", errorCode:"AI_INTERNAL", content:"..."}`，走 `throw new Error((res && res.msg) || '导入失败，请稍后重试')` 兜底分支，提示变成"导入失败，请稍后重试"——根因被吞
- `WkTrainingRoleStudentController` 同样在 `basePackages` 范围内，若后续抛 ServiceException 也会被错误序列化

**修复（首选）**：缩小 handler 范围（与 `VisionExceptionHandler` / `VoiceExceptionHandler` 保持一致）
```java
@RestControllerAdvice(assignableTypes = WkAiAgentController.class)
```
**修复（兜底）**：在 `importSession` 外层 catch `ServiceException` 手动转 `RespVo.error(msg)`。

---

### C2. 导入功能缺失 `thoughts` 字段 —— 违反需求 #1 完整性

**影响面**：所有导入了含思考过程会话的用户——思考过程永久丢失

**证据**：
- 前端 [conversationTransfer.js#L94-L107](file:///e:/rhProject/wk-train-center-ui/src/views/web/ai/components/AiAssistant/shared/conversationTransfer.js#L94-L107) `buildExportPayload` 在 AI 记录分支只导出 `type/chatHistory/citations/fileList`，**未导出 thoughts**
- 后端 [AnswerImportRecordDto.java#L26-L41](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AnswerImportRecordDto.java#L26-L41) **无 thoughts 字段**
- 后端 `toRecordCommand()` 也未透传

**修复（三处对齐）**：
```java
// 1. AnswerImportRecordDto 增加
private String thoughts;

// 2. AnswerImportRecordDto.toRecordCommand 增加
command.setThoughts(thoughts);
```
```js
// 3. 前端 buildExportPayload AI 记录增加
thoughts: typeof group.aiMsg.thoughts !== 'undefined'
  ? JSON.stringify({ items: group.aiMsg.thoughts, duration: group.aiMsg.thoughtDuration || null })
  : undefined
```

---

### C3. 导入功能缺失 `suggestions` 字段（会话级）—— 违反需求 #1 完整性

**影响面**：所有导入了含追问建议会话的用户——会话级 suggestions 永久丢失

**证据**：
- 后端 [AnswerImportCommand.java#L21-L31](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/domain/command/AnswerImportCommand.java#L21-L31) 只有 `overview + records`，无 `suggestions`
- 后端 `AnswerImportDto` 同步缺失
- 后端 `AnswerRecordAppOpServiceImpl.importSession` 中 `if (StringUtils.isNotBlank(command.getOverview())) domain.setOverview(...)`，**无 setSuggestions**

**修复（三处对齐）**：
```java
// 1. AnswerImportCommand + AnswerImportDto 增加
private List<String> suggestions;

// 2. importSession 末尾（save 之前）增加
if (command.getSuggestions() != null && !command.getSuggestions().isEmpty()) {
    domain.setSuggestions(command.getSuggestions());
}
```
```js
// 3. 前端 export 顶层 + records 同级增加 suggestions
// buildExportPayload 顶层：
suggestions: Array.isArray(latestAiSuggestions) ? latestAiSuggestions : []

// parseImportText 解析：s.suggestions
// importSession 上传 payload：增加 suggestions 字段
```

---

### C4. import 链路"save → findByAskId"主键获取脆弱

**影响面**：import 接口响应时间；主从延迟场景下可能查不到刚插入的数据

**证据**：
- [AnswerRecordAppOpServiceImpl.java#L82-L106](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/impl/AnswerRecordAppOpServiceImpl.java#L82-L106)：先 `answerRecordRepository.save(domain)`，再 `findByAskId(askId)` 拿主键
- 多一次查询；且若开启读写分离/主从延迟，存在查不到的风险

**修复（首选）**：直接读 `domain.getId()`（MyBatis-Plus insert 后会回填主键）
```java
answerRecordRepository.save(domain);
if (domain.getId() == null) {
    throw new ServiceException("导入后无法获取会话 ID");
}
return domain.getId();
```

---

## Warnings (SHOULD FIX)

### W1. import DTO 列表元素无 `@Valid` 级联校验，`records:[null]` 触发未捕获 NPE → 500

**类别**：边界 / 异常处理

**证据**：[AnswerImportDto.java#L28-L37](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AnswerImportDto.java#L28-L37) 仅对根 DTO 使用 `@Valid`，列表元素无 `@NotNull` 也无级联校验；Controller `records.stream().map(...::toRecordCommand)` 在 `null` 元素上抛 NPE。

**修复**：
```java
@NotEmpty(message = "导入内容不能为空")
@Size(max = 2000, message = "最多支持导入 2000 条对话记录")
private List<@NotNull @Valid AnswerImportRecordDto> records;
```
同时在 `toImportCommand()` 转换前防御性 `if (r == null) throw new ServiceException(...)`。

---

### W2. 后端 import 接口未校验 `version`/`source`，绕过前端可灌入任意 JSON

**类别**：API / 隐式依赖

**证据**：前端 `parseImportText` 严格校验 `version === SHARE_VERSION` 与 `source === SHARE_SOURCE`，但后端 `importSession` 完全不校验。

**修复**：
```java
// AnswerImportDto 增加
private Integer version;
private String source;

// AnswerImportCommand 同步
// importSession 入口校验
if (command.getVersion() == null || command.getVersion() != 1
    || !"wk-train-center-answer".equals(command.getSource())) {
    throw new ServiceException("不支持的分享文件版本");
}
```

---

### W3. `WkAiAgentController` 限流时长 20→10 秒全局收紧

**类别**：配置 / 下游漂移

**影响面**：所有 `/api/wk/ai/agent/chat-stream` 调用方（答疑 + 陪练 + 未来 SDK）

**证据**：[WkAiAgentController.java#L100](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/WkAiAgentController.java#L100) `redisService.set(rateKey, rateKey, 10L)`（原值 20L）。与 SSE 超时已拉到 5 分钟的设计意图相悖——长对话用户"我先看下 → 11 秒后接着问"会直接撞限流。

**修复**：通过配置项 `ai.agent.rate-limit-seconds` 暴露；或至少恢复 20 秒。监控点：`log.warn [WkAiAgent] rate limit hit` 频率。

---

### W4. 前端自动标题生成无并发/去抖保护

**类别**：隐式依赖 / 并发

**证据**：[chatSession.js#L327-L351](file:///e:/rhProject/wk-train-center-ui/src/views/web/ai/components/AiAssistant/shared/chatSession.js#L327-L351) `isFirstUserMessage` 判断依赖"消息 push 前 messages 没有 user"。`autoGenerateTitle` 是 fire-and-forget。

**风险**：用户快速连发"你好"/"能帮我…"，两条都触发自动标题，第二次 `changeOverview` 用错误 askId 覆盖第一条会话的标题。

**修复**：
```js
// sendMessage 入口加并发锁
if (state.firstUserMessageLock) return
if (isFirstUserMessage) state.firstUserMessageLock = true

// 或更简单：等 AI 回复结束后再触发自动标题（不与用户并发）
```

---

### W5. overview 字段无 `@Size` 限制，自动标题可能被撑爆 DB 列

**类别**：数据库 / Schema

**证据**：
- [AnswerImportDto.java#L21-L29](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AnswerImportDto.java#L21-L29) `overview` 无 `@Size`
- 前端 `buildAutoTitle` 最长 `30字总结 + 5字前缀 + 2括号 + 3省略号 ≈ 40 字`，但用户手动编辑历史标题可能更长

**修复**：
```java
@Size(max = 200, message = "会话概述长度不能超过 200 字符")
private String overview;
```

---

### W6. 自动标题「」外层方括号未对齐

**证据**：[chatSession.js#L739-L744](file:///e:/rhProject/wk-train-center-ui/src/views/web/ai/components/AiAssistant/shared/chatSession.js#L739-L744) `buildAutoTitle` 输出 `summary + '（' + prefix + ellipsis + '）'`，无外层「」。需求文字描述的格式含「」；但两条示例与「」无关。

**修复**：与产品/UX 对齐；如需「」则改为
```js
return '「' + summary + '（' + prefix + ellipsis + '）' + '」'
```

---

### W7. 导出文件名无最大长度截断

**证据**：[conversationTransfer.js#L120-L132](file:///e:/rhProject/wk-train-center-ui/src/views/web/ai/components/AiAssistant/shared/conversationTransfer.js#L120-L132) `sanitizeFileName` 仅清洗非法字符、不截断。极端 overview（含超长 emoji / 罕见汉字组合）→ Windows 260 字符路径限制报错。

**修复**：
```js
if (cleaned.length > 50) cleaned = cleaned.slice(0, 50)
```

---

### W8. 二次导出已导入会话时 `分享会话-` 前缀重复

**证据**：[AnswerAssistantView.vue#L253-L256](file:///e:/rhProject/wk-train-center-ui/src/views/web/ai/components/AiAssistant/modes/answer/AnswerAssistantView.vue#L253-L256) 导入时 overview 加前缀 `'分享会话-' + overview`；[conversationTransfer.js#L133-L138](file:///e:/rhProject/wk-train-center-ui/src/views/web/ai/components/AiAssistant/shared/conversationTransfer.js#L133-L138) 导出时文件名再次加前缀 → `分享会话-分享会话-你好呀.json`。

**修复**：`parseImportText` 解析后去掉 `分享会话-` 前缀 `overview = overview.replace(/^分享会话-?/, '')`，或导出探测是否已含前缀。

---

### W9. AiButtonGroup SSE 修复改变了 assistantKey 自增行为，需确认 assistantMode 同步

**证据**：[AiButtonGroup.vue#L171-L210](file:///e:/rhProject/wk-train-center-ui/src/views/web/ai/components/AiButtonGroup.vue#L171-L210) 新逻辑 `var needRecreate = !ai.isOpen || ai.assistantMode !== type`；AiAssistant.vue 内部 `assistantMode` 是 data 还是 prop 需要确认（prop 单向数据流 vs data 内部状态）。

**建议**：上线后监控 `abort` 相关错误频率；确认 askId 在切换模式下不串位。

---

## Suggestions (CONSIDER)

### S1. `enableAutoTitle` 默认值无契约，新 mode 容易忘记设置

**证据**：[answerAdapter.js#L13-L17](file:///e:/rhProject/wk-train-center-ui/src/views/web/ai/components/AiAssistant/modes/answer/answerAdapter.js#L13-L17) trainingAdapter 未设 `enableAutoTitle`（falsy）→ 正确不触发；但新加 mode 若漏设，默认不触发或默认触发取决于实现。

**建议**：在 adapter 接口显式声明 `enableAutoTitle: false`（默认关闭）。

---

### S2. 导入默认 overview `分享会话` 无差异化

**证据**：[AnswerAssistantView.vue#L636-L638](file:///e:/rhProject/wk-train-center-ui/src/views/web/ai/components/AiAssistant/modes/answer/AnswerAssistantView.vue#L636-L638) 多用户同时导入空 overview 时标题相同，影响辨识。

**建议**：`分享会话-${new Date().toISOString().slice(0,16)}` 或追加用户 ID 后缀。

---

### S3. 导出 payload schema 硬编码 `SHARE_VERSION=1`，无版本演进机制

**证据**：[conversationTransfer.js#L856-L857](file:///e:/rhProject/wk-train-center-ui/src/views/web/ai/components/AiAssistant/shared/conversationTransfer.js#L856-L857) `if (parsed.version !== SHARE_VERSION)` 硬相等；未来改 records 结构，老版本文件无法导入。

**建议**：引入 `MIN_SUPPORTED_VERSION` 与 `MAX_SUPPORTED_VERSION` 区间判断 + migration 路径。

---

### S4. 自动标题 AI provider 配置使用全局默认，未区分模式

**证据**：[chatSession.js#L954-L993](file:///e:/rhProject/wk-train-center-ui/src/views/web/ai/components/AiAssistant/shared/chatSession.js#L954-L993) `chatModelStream` 未传 `provider`，取系统默认 AI provider；若答疑用百炼、标题想用更便宜的 GPT-4o-mini，无法配置。

**建议**：通过 adapter 暴露 `titleConfigProvider`，默认沿用主对话 provider。

---

### S5. 历史搜索 LIKE 受自动标题影响扩大命中范围

**证据**：[AnswerRecordMapper.xml#L25](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-ai/src/main/resources/mapper/AnswerRecordMapper.xml#L25) 后端搜索 `overview LIKE '%keyword%'`；自动标题格式 `AI总结（用户首句前5字...）`，用户搜"AI总结"会命中所有自动标题会话（噪音）。

**建议**：告知产品；若严格要求可在 DB 加 `overview_source` 字段或搜索时排除自动标题前缀。

---

### S6. AI 消息 fileList 未在 `mapRecordListToMessages` 还原（pre-existing，导入后用户会感知）

**证据**：[historyContext.js#L119-L161](file:///e:/rhProject/wk-train-center-ui/src/views/web/ai/components/AiAssistant/conversation/domain/historyContext.js#L119-L161) 仅 `type === 20` 时还原 `file_list`，AI 消息（type=10）的 fileList 完全不映射。导入后用户看不到 AI 响应中的文件链接（数据已落库）。

**建议**：单独 PR 优化，与 `citations/thoughts` 还原对齐。

---

## Summary of Changes

本次审核**整体通过**，但发现 **4 个 Critical**、**9 个 Warning**、**6 个 Suggestion**，按优先级：

1. **必须立即修复 Critical**：C1（C2/C3/C4）—— 影响面最大的统一是 `WkAiAgentExceptionHandler` 范围过广（涉及整个 controller 包的 ServiceException 序列化路径）+ import 链路丢失 `thoughts`/`suggestions` 字段（违反原始需求 #1 的"完整还原"承诺）。
2. **应当尽快修复 Warning**：W1（`[null]` 元素 NPE）+ W2（后端 version/source 校验）+ W3（限流 20→10s 全局收紧影响长对话用户）+ W4（自动标题并发保护）四项与可观测性 / 上线风险强相关。
3. **其余 Warning/Suggestion**：可纳入下个迭代。

完整交付清单：
- 需求 #1（导出/导入）：**部分交付**——记录主体通，但 **thoughts/suggestions 字段未透传**（Critical C2/C3）
- 需求 #2（suggest 持久化）：**完整交付**——三处断点（AddDto/InfoVo/前端 loadHistoryDetail）全部修复
- 需求 #3（自动标题）：**完整交付**——链路完整、门控正确、失败降级、跨会话保护齐全

**整体得分**：7.5 / 10（10 = Critical 全部修复）

---

## 监控/灰度建议（上线前后）

| 监控点 | 命令/路径 |
|---|---|
| import 接口响应格式是否被错误序列化 | ELK：`POST /api/wk/answer/student/import` 响应体格式 |
| 限流收紧后用户命中 | ELK：`[WkAiAgent] rate limit hit` 频率 |
| 自动标题失败率 | ELK：`console.warn 自动生成会话标题失败` 频率 |
| import 后主键查询慢查询 | MySQL slow log：`SELECT WHERE ask_id = ?` |
| 灰度建议 | 先 `enableAutoTitle: false` 小流量验证 1 周再放开 |