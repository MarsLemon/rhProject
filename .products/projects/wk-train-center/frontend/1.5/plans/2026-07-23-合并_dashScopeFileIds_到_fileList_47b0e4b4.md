# 合并 dashScopeFileIds 到 fileList 统一结构（修正版）

## 目标

当前：`fileList: ["url1", "url2"]` + `dashScopeFileIds: ["file-xxx"]`（两个独立数组）
目标：`fileList: [{url: "url1", dashScopeFileId: "file-xxx"}, {url: "url2", dashScopeFileId: null}]`（统一对象数组）

图片文件只有 URL 无 fileId，dashScopeFileId 为 null。
FileItem 只含 `url` + `dashScopeFileId`，不含 `role`（role 是消息级属性，不是文件级）。

---

## Phase 0: 影响范围排查 — wk-train-center-ui-v3

### 0.1 grep 确认

- 在 `e:\rhProject\wk-train-center-ui-v3` 中搜索 `dashScopeFileIds`、`fileList`、`dashScopeFileId`
- 若命中：v3 走同一后端 API，DTO 变更后 v3 请求中 `dashScopeFileIds` 会被 Jackson 忽略 → 标注风险
- 若未命中：v3 不在范围内，plan 头部标注「v3 无影响」
- 记忆明确：「当前AI模块工作范围不含wk-train-center-ui-v3」→ 本次只排查不修改 v3 代码
- 若 v3 有影响，在风险表中列出并建议后续单独处理

---

## Phase 1: 后端 — 新增 FileItem + 双格式反序列化

### 1.1 新增 FileItem 类

- 路径：`wk-module-ai/.../controller/model/FileItem.java`
- 注解：`@Data`（Lombok）— 必须有 getter/setter，Hutool `JSONUtil.toJsonStr()` 序列化依赖
- 字段：`String url; String dashScopeFileId;`
- 不含 `role` 字段
- 构造方法：`FileItem()`（无参，Hutool/Jackson 需要）+ `FileItem(String url, String dashScopeFileId)`

### 1.2 双格式反序列化策略

旧数据格式：`fileList: ["url1", "url2"]`（String 数组）
新数据格式：`fileList: [{url: "url1", dashScopeFileId: "file-xxx"}]`（FileItem 数组）

**DTO 层双格式读取**（Spring @RequestBody 用 Jackson）：

- FileItem 上添加 Jackson `@JsonCreator` 构造方法
- 接受对象形式 `{url, dashScopeFileId}`
- 接受纯字符串形式 `"url1"` → `FileItem{url:"url1", dashScopeFileId:null}`
- 这样 Jackson 反序列化时两种格式都能处理

**Entity 层双格式读取**（Hutool JSONUtil 反序列化 chatHistory）：

- Hutool 不认 Jackson 注解
- 在 `AnswerHistoryRecord` 和 `TrainingRoleRecord` 的 `fileList` 字段上用 Hutool 自定义反序列化
- 或更简单方案：在 Converter 层 `toDomain()` 时手动检测 JSON 格式：
  ```java
  // 如果 JSON 元素是字符串，转成 FileItem{url: string}
  // 如果是对象，直接映射
  ```

### 1.3 数据库迁移脚本（可选但建议）

- SQL 脚本遍历 `el_answer_record` 和 `el_training_record` 表
- 解析 `chat_history` JSON，将旧格式 `fileList: ["url"]` + `dashScopeFileIds: ["id"]` 按索引合并为新格式
- 合并规则：按数组索引对齐，无对应 fileId 的填 null
- 注意：fileList 和 dashScopeFileIds 可能长度不等（图片无 fileId），需按 URL 顺序匹配

---

## Phase 2: 后端 — DTO/Command/Entity/VO 层重构

### 2.1 DTO 层（AgentChatRequestDto — 物理删除所有 dashScopeFileIds）

**AgentChatRequestDto.java**：

- **物理删除**顶层 `fileList`（L62）和顶层 `dashScopeFileIds`（L93）
- **物理删除** `MessageItem.dashScopeFileIds`（L119）
- `MessageItem.fileList`（L110）改为 `List<FileItem>`
- 只保留 MessageItem 级别 fileList，不再有顶层冗余

**AnswerRecordAddDto.java**：

- `fileList` 改为 `List<FileItem>`，移除 `dashScopeFileIds`
- `toCommand()` 映射调整

**TrainingRecordAddDto.java**：同上

### 2.2 Command 层

- `AnswerRecordCommand.java`：`fileList` 改为 `List<FileItem>`，移除 `dashScopeFileIds`
- `TrainingRecordAddCommand.java`：同上

### 2.3 Entity 层（chatHistory JSON 内嵌 + 顶层 fileList）

**chatHistory 内嵌记录**（`dashScopeFileIds` 仅存在于此，非独立 DB 列）：

- `AnswerHistoryRecord.java`：`fileList` 改为 `List<FileItem>`，**物理删除** `dashScopeFileIds` 字段
- `TrainingRoleRecord.java`：同上

**顶层领域对象**：

- `AnswerRecord.java`：`fileList` 字段类型保持 `String`（JSON 字符串），内部 JSON 结构从 `fileList:String[] + dashScopeFileIds:String[]` 变为 `fileList:FileItem[]`
- `TrainingRecord.java`：同上
- 注意：`AnswerRecord` / `TrainingRecord` 顶层无 `dashScopeFileIds` 字段（研究确认）

**DB 实体**：

- `AnswerRecordEntity.java`：`file_list` 列（String JSON）保持不变，内部 JSON 结构随上层变化
- `TrainingRecordEntity.java`：`chat_history` 列（String JSON）保持不变，内部 JSON 结构随上层变化
- DB 无 `dashScopeFileIds` 独立列，无需删列操作

### 2.4 VO 层

- `AnswerHistoryRecordVo.java`：`fileList` 改为 `List<FileItem>`，移除 `dashScopeFileIds`
- `TrainingRecordVo.java`：移除 `dashScopeFileIds`，`fileList` 改为 `List<FileItem>`
- 映射方法 `vo.setFileList()` / `vo.setDashScopeFileIds()` 合并为 `vo.setFileList()`

### 2.5 Factory 层

- `TrainingRecordFactory.java`（接口）：`create()` 和 `edit()` 移除 `dashScopeFileIds` 参数
- `TrainingRecordFactoryImpl.java`：移除 `setDashScopeFileIds()`，只 `setFileList()`
- `AnswerRecordFactoryImpl.java`：同上

### 2.6 Service 层

- `TrainingRecordAppOpServiceImpl.java`：`saveAskRecord` 签名移除 `dashScopeFileIds`
- `AnswerRecordAppOpServiceImpl.java`：`add()` 中移除 dashScopeFileIds 处理

### 2.7 Converter 层（关键：旧数据懒迁移，读时转换不写回 DB）

旧 chatHistory JSON 中每条记录可能同时包含：

- `fileList: ["url1", "url2"]`（String 数组，旧格式）
- `dashScopeFileIds: ["file-xxx"]`（String 数组，旧格式，即将被删除的字段）

两个数组可能长度不等（图片文件有 URL 无 fileId）。

**AnswerRecordConverter.java**：

- `toDomain()`：读取 `entity.getFileList()`（String JSON），自定义解析逻辑：
  ```java
  // 1. 解析原始 JSON
  JSONArray rawFileList = JSONUtil.parseArray(entity.getFileList());
  JSONArray rawFileIds = JSONUtil.parseArray(entity.getDashScopeFileIds()); // 旧字段，可能不存在

  // 2. 构建 FileItem 列表
  List<FileItem> result = new ArrayList<>();
  for (int i = 0; i < rawFileList.size(); i++) {
      Object item = rawFileList.get(i);
      if (item instanceof String) {
          // 旧格式：纯 URL 字符串
          String url = (String) item;
          String fileId = (i < rawFileIds.size()) ? rawFileIds.getStr(i) : null;
          result.add(new FileItem(url, fileId));
      } else if (item instanceof JSONObject) {
          // 新格式：已经是 FileItem 对象
          result.add(item.toJavaObject(FileItem.class));
      }
  }
  // 3. 不写回 DB — 旧数据在读时转换，新写入永远用新格式
  ```
- `toEntity()`：`domain.getFileList()` 序列化为 FileItem 数组 JSON（新格式）
- 注意：`AnswerRecordEntity` 无 `dashScopeFileIds` 列（研究确认），无需保留任何旧列

**TrainingRecordConverter.java**（唯一路径：JSON 预处理）：

- `toDomain()`：在 `JSONUtil.toList()` 之前预处理 JSON，将旧格式转为新格式
  ```java
  public List<TrainingRoleRecord> toDomain(TrainingRecordEntity entity) {
      JSONArray rawHistory = JSONUtil.parseArray(entity.getChatHistory());
      for (Object obj : rawHistory) {
          JSONObject record = (JSONObject) obj;
          JSONArray oldFileList = record.getJSONArray("fileList");
          JSONArray oldFileIds = record.getJSONArray("dashScopeFileIds");
          if (oldFileList != null && oldFileList.isNotEmpty()
              && oldFileList.get(0) instanceof String) {
              // 旧格式：fileList 是 String[]，按索引合并 dashScopeFileIds
              JSONArray newFileList = new JSONArray();
              for (int i = 0; i < oldFileList.size(); i++) {
                  JSONObject fileItem = new JSONObject();
                  fileItem.set("url", oldFileList.getStr(i));
                  fileItem.set("dashScopeFileId",
                      (oldFileIds != null && i < oldFileIds.size())
                          ? oldFileIds.getStr(i) : null);
                  newFileList.add(fileItem);
              }
              record.set("fileList", newFileList);
              record.remove("dashScopeFileIds");
          }
      }
      return rawHistory.toList(TrainingRoleRecord.class);
  }
  ```
- `toEntity()`：`JSONUtil.toJsonStr(domain.getChatHistory())` 序列化，FileItem 有 `@Data` 确保 Hutool 正确序列化

### 2.7.1 Hutool 序列化验证

- FileItem 已加 `@Data`（Phase 1.1），Hutool `toJsonStr()` 通过 getter 序列化
- 写回后 JSON 不含 `dashScopeFileIds` 顶层字段（已从 record 中 remove）
- 单元测试：
  - 输入旧格式 `{fileList:["url1","url2"], dashScopeFileIds:["fid1"]}`
  - 期望输出 `{fileList:[{url:"url1",dashScopeFileId:"fid1"},{url:"url2",dashScopeFileId:null}]}`
  - 验证 `dashScopeFileIds` 字段不存在

### 2.7.2 Service 层直写路径排查

- grep `entity.setChatHistory(JSONUtil.toJsonStr(` 和 `entity.setFileList(` 全量调用点
- 确保所有写回路径走 `domain.getChatHistory()` / `domain.getFileList()`（已转换过的 List）
- 不允许任何路径绕过 Converter 直接写入旧格式 JSON 字符串

---

## Phase 3: 后端 — Controller + Executor 层重构

### 3.1 Controller 层

**WkAiAgentController.java**：

**3.1.1 extractFileList 签名改造**：

- 旧：`private List<String> extractFileList(AgentChatRequestDto dto, List<HistoryMessage> history)`
- 新：`private List<FileItem> extractFileList(List<MessageItem> messages)` — 仅从 dto.messages 提取
- 整体删除 `extractDashScopeFileIds()` 方法

**3.1.2 L160 调用点改造**：

- 旧：`List<String> fileList = extractFileList(dto, history);`
- 新：`List<FileItem> fileItems = extractFileList(dto.getMessages());`
- 后续从 fileItems 提取 URL 数组传给 ReactRequest
- `history` 中间变量不再从 extractFileList 获取，HistoryMessage 构造改成从 `messages[i].getFileList()` 直接提取 dashScopeFileId

**3.1.3 HistoryMessage 构造**：

```java
  // HistoryMessage 仍需 dashScopeFileIds 传给 DashScope API
  // 从 message.getFileList() 中提取 dashScopeFileId（filter null）
  List<String> fileIds = message.getFileList().stream()
      .map(FileItem::getDashScopeFileId)
      .filter(Objects::nonNull)
      .collect(Collectors.toList());
  history.add(new HistoryMessage(role, content, fileIds));
```

- 调用 ReactRequest 时，fileList 从 MessageItem.fileList 中提取 URL：
  ```java
  List<String> urls = extractFileList(dto).stream()
      .map(FileItem::getUrl)
      .filter(Objects::nonNull)
      .collect(Collectors.toList());
  ```

### 3.2 Executor 层

**AgentReActExecutor.java**：

- `ReactRequest` record：删除 `List<String> fileIds` 字段，保留 `List<FileItem> fileList`（已合并）
- `HistoryMessage` record：保留 `dashScopeFileIds`（DashScope API 仍需纯 ID 数组），但从 FileItem 列表提取

**3.2.1 下游调用方全量改造**（record 改字段名后 `request.fileIds()` 访问器消失，编译期报错）：

| 文件                        | 行   | 旧代码                                             | 新代码                                                                      |
| --------------------------- | ---- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| AgentReActExecutorImpl.java | L69  | `AiRequestContext.setFileIds(request.fileIds())` | `AiRequestContext.setFileIds(extractFileIds(request.fileList()))`         |
| 同上                        | L77  | `request.fileIds()` 判空走 Chat Completions      | `!request.fileList().isEmpty() && hasDashScopeFileId(request.fileList())` |
| 同上                        | L358 | `AiRequestContext.getFileIds()`                  | 不变（AiRequestContext 内部存储不变，提取逻辑在 setFileIds 时完成）         |
| 同上                        | L562 | `AiRequestContext.getFileIds()`                  | 同上，不变                                                                  |

- `extractFileIds(List<FileItem>)` 为新增私有 helper：
  ```java
  private List<String> extractFileIds(List<FileItem> fileList) {
      return fileList.stream()
          .map(FileItem::getDashScopeFileId)
          .filter(Objects::nonNull)
          .collect(Collectors.toList());
  }
  ```

**AgentReActExecutorImpl.java**：

- `buildUserMessage(text, fileList)`：参数改为 `List<FileItem>`，内部提取 URL 数组构建多模态消息
  ```java
  List<String> urls = fileList.stream()
      .map(FileItem::getUrl).filter(Objects::nonNull).collect(Collectors.toList());
  // 原有逻辑用 urls 构建 image_url 消息
  ```
- `AiRequestContext.setFileIds()`：从 FileItem 列表提取 dashScopeFileId
  ```java
  List<String> fileIds = fileList.stream()
      .map(FileItem::getDashScopeFileId).filter(Objects::nonNull).collect(Collectors.toList());
  AiRequestContext.setFileIds(fileIds);
  ```
- `hasImages` 检测：`!fileList.isEmpty()` 即可（有文件就有图）

**AiRequestContext.java**：保持 ThreadLocal 不变，数据来源从 FileItem 列表提取

---

## Phase 4: 前端 — 核心会话逻辑重构

> **⚠️ 强制要求**：后端 DTO 已物理删除 `dashScopeFileIds` 字段。前端必须同步删除所有顶层 `dashScopeFileIds` 赋值。否则 Spring Boot 默认 `FAIL_ON_UNKNOWN_PROPERTIES = false`，前端发出的 `dashScopeFileIds` 被 Jackson 静默忽略 → fileId 丢失但无日志无报错。

### 4.1 chatSession.js

- `sendMessage()`：

  ```js
  // 统一构建 fileList（FileItem 对象数组）
  const fileList = fs.map(f => ({
    url: f.url || f.rawUrl || f.viewUrl,
    dashScopeFileId: f.dashScopeFileId || null
  }));
  // 移除单独的 dashScopeFileIds 数组
  ```
- `generateAiResponse()`：

  - 历史聚合：遍历 `m.fileList`，flatMap 提取 dashScopeFileId（filter falsy）

  ```js
  const historicalDashScopeFileIds = messages
    .filter(m => m.role === 'user' && m.fileList)
    .flatMap(m => m.fileList.map(f => f.dashScopeFileId).filter(Boolean));
  ```

  - `currentUserFileList = fileList`（直接用 FileItem 数组）
  - `currentUserMsg: { content, fileList }`（移除 dashScopeFileIds）
- `syncToBackend()`：`payload.fileList` 直接发 FileItem 数组，移除 `dashScopeFileIds`
- `withdraw()`：`files = msg.file_list.map(f => ({...f}))` — file_list 已含 dashScopeFileId
- `retry()`：`fileList = lastUserMsg.file_list`（直接用，已是 FileItem 数组），移除 dashScopeFileIds 恢复逻辑

### 4.2 chatStreamGateway.js

- `buildStreamParams()`：

  - 移除 `dashScopeFileIds` 参数
  - 从 `currentUserMsg.fileList` 中提取 dashScopeFileId 数组传给后端

  ```js
  const dashScopeFileIds = currentUserMsg.fileList
    .map(f => f.dashScopeFileId).filter(Boolean);
  ```

  - messages push：`fileList: currentUserMsg.fileList`（FileItem 数组）
  - 移除顶层 `result.dashScopeFileIds`，改为从 messages 内 fileList 提取

### 4.3 historyContext.js

- `buildHistoryContext()`：透传 `fileList`（已含 dashScopeFileId），移除 dashScopeFileIds 透传
- `mapRecordListToMessages()`：
  - 后端返回的 `fileList` 已是 FileItem 数组
  - `msg.file_list = item.fileList.map(f => ({url: f.url, dashScopeFileId: f.dashScopeFileId, name: ...}))`
  - 移除 `msg.dashScopeFileIds` 赋值

---

## Phase 5: 前端 — 组件层适配

### 5.1 AiInputArea.vue

- `_collectDashScopeFileIds()`：改为从 tempFiles 构建 FileItem 数组，或直接用 fileList
  ```js
  // 不再单独收集 dashScopeFileIds 数组
  // 直接在 send payload 中传 fileList（FileItem 数组）
  const fileList = this.tempFiles.map(f => ({
    url: f.url || f.rawUrl || f.viewUrl,
    dashScopeFileId: f.dashScopeFileId || null
  }));
  ```
- `setAttachFiles()`：恢复文件时保留 dashScopeFileId 字段
  ```js
  // files 已含 dashScopeFileId，直接恢复
  this.tempFiles = files.map(f => ({...f}));
  ```
- emit payload：`{ content, files, fileList }`（移除 dashScopeFileIds）

### 5.2 InputToolbar.vue

- `onFileSuccess()`：dashScopeFileId 绑定到 tempFile（已有，不变）
- `getDashScopeFileIds()`：改为 `getFileList()` 返回 FileItem 数组，或保留作为内部 helper
  - AiInputArea 不再调用 `getDashScopeFileIds()`，改为直接从 tempFiles 构建 fileList

### 5.3 AiMessageList.vue

- 渲染逻辑适配：`msg.file_list` 已是 FileItem 对象数组
- URL 访问方式：`f.url`（不变）
- 渲染模板不变（只需确认 file_list 项有 url 字段）

### 5.4 common.js (api/ai)

- `file_list` 规范化逻辑适配 FileItem 对象数组
- `hasFiles` 检测：`fileList.length > 0`（不变，对象数组也有 length）
- `payload.file_list` 赋值：传 FileItem 数组（后端双格式读取兼容）

### 5.5 AnswerAssistantView.vue

- `checkAndResumeAiResponse()`：从最后一条 user 消息取 fileList（已含 dashScopeFileId）
  ```js
  const lastUserMsg = messages.findLast(m => m.role === 'user');
  const fileList = lastUserMsg?.file_list || [];
  generateAiResponse({ fileList, ... });
  ```
- 此修复自然解决行88漏传 dashScopeFileIds 的 bug

### 5.6 TrainingAssistantView.vue

- `handleWithdraw()`：file_list 已含 dashScopeFileId，无需额外处理

---

## Phase 7: wk-mhc-mobile — 移动端适配

移动端走同一后端 API，DTO 变更后必须同步。否则 mobile 请求带旧 `dashScopeFileIds` 被 Jackson 忽略 → fileId 丢失。

> **⚠️ 强制要求**：同 Phase 4 警告。mobile 端必须同步删除所有顶层 `dashScopeFileIds` 赋值（useChatSession.ts L290-293、common.ts L1125-1126、types.ts 顶层类型定义）。

### 7.1 需修改的文件（4 个）

**`wk-mhc-mobile/src/pages/smart-training/composables/ai/useChatSession.ts`**：

- `sendMessage()`（行531）：fileList 改为 FileItem 对象数组，移除单独 dashScopeFileIds
- `retry()`（行740）：从 lastUserMsg.fileList 直接取（已含 dashScopeFileId），移除 dashScopeFileIds 恢复
- 历史加载（行935-944）：fileList → ChatFileItem[] 转换逻辑适配
- `generateAiResponse()`（行576, 673）：历史聚合从 fileList 中 flatMap dashScopeFileId

**`wk-mhc-mobile/src/pages/smart-training/composables/ai/chatStreamGateway.ts`**：

- `buildStreamParams()`（行148-149）：移除 dashScopeFileIds 参数，从 fileList 提取
- messages 构建逻辑适配 FileItem 数组

**`wk-mhc-mobile/src/pages/smart-training/composables/ai/types.ts`**：

- 类型定义（行45, 184, 205）：`dashScopeFileIds` 字段移除，`fileList` 类型改为 `ChatFileItem[]`（含 url + dashScopeFileId）
- 新增或修改 `ChatFileItem` 接口：`{ url: string; dashScopeFileId?: string }`

**`wk-mhc-mobile/src/pages/smart-training/api/ai/common.ts`**：

- 顶层 payload 构造（行1125-1126）：移除 `dashScopeFileIds`，fileList 改为 FileItem 数组

### 7.2 修改策略

- 逻辑与前端 web 端 Phase 4/5 一致
- TypeScript 类型先改（types.ts），再改调用方

### 7.3 mobile 端 AnswerAssistantView 排查

- `wk-mhc-mobile/src/pages/smart-training/components/ai/AnswerAssistantView.vue` 存在（Claude 确认）
- 需 grep `checkAndResume` 确认是否有同款漏传 dashScopeFileIds bug
- 若有 → 修复逻辑与 web 端 Phase 5.5 一致
- 若无 → grep 证据明确记录「已检查，无 checkAndResume 等价逻辑」

---

## Phase 6: 验证

### 后端验证

- `mvn compile` 编译通过
- 单元测试：旧格式 JSON 反序列化测试
- 手动测试：上传文件 → 发送消息 → 后端存储 → 查询返回 → 格式正确

### 前端验证

- `npm run build` 构建通过
- 手动测试完整流程：
  1. 上传文档文件 → 发送 → AI 回复
  2. 撤回消息 → 文件恢复到输入区 → 重发 → 文件仍携带
  3. 上传图片文件 → 发送（无 dashScopeFileId 但有 URL）
  4. 加载历史会话 → fileList 正确恢复
  5. 旧数据兼容：旧格式 chat_history 能正常加载显示

### 移动端验证

- `npm run build` 构建通过 + TypeScript 类型检查无错
- 手动测试：上传文件 → 发送 → 撤回 → 重发 → 文件仍携带
- 历史会话加载 fileList 恢复正确

### v3 影响确认

- Phase 0 grep 结果记录在风险表中
- 若 v3 有影响，标注后续处理建议

---

## 风险与对策

1. **数组长度不对齐**：图片只有 URL 无 fileId → dashScopeFileId 为 null，提取时 filter(Boolean)
2. **旧数据兼容**：Converter 层读时懒转换，不写回 DB；新写入永远新格式；旧数据自然消亡
3. **命名统一**：前端消息对象统一用 `file_list`（保持现状，渲染层引用不变），API 层用 `fileList`（驼峰，与后端 DTO 对齐）
4. **checkAndResumeAiResponse bug**：重构后从 lastUserMsg.file_list 取 fileList，自然修复
5. **Hutool 反序列化**：Converter 层 JSON 预处理，在 `toList()` 前转换旧格式，不依赖注解
6. **wk-mhc-mobile 同步**：mobile 走同一后端 API，DTO 变更必须同步 mobile 端 4 文件，否则 fileId 丢失
7. **wk-train-center-ui-v3**：Phase 0 grep 确认影响范围；记忆明确 v3 不在改动范围；若有影响标注风险后续单独处理
8. **FileItem 序列化**：FileItem 必须加 `@Data`，否则 Hutool `toJsonStr()` 漏序列化字段
9. **Service 层直写路径**：需 grep 确认所有写回路径走 Converter，不绕过直接写旧格式 JSON
10. **前端静默丢 dashScopeFileIds**：Spring Boot `FAIL_ON_UNKNOWN_PROPERTIES = false`，前端忘删顶层 `dashScopeFileIds` → Jackson 静默忽略，无日志无报错。Phase 4/7 已加强制警告

---

## 执行顺序

**串行执行**（降低接口不匹配风险）：

1. **Phase 0**: Research agent grep 确认 v3 影响范围（5 min）
2. **后端 Coding agent**（一个 agent 完成全部后端 Phase 1-3）
3. 后端 Verify：`mvn compile` + 旧格式 JSON 反序列化测试
4. **前端 web Coding agent**（一个 agent 完成全部前端 Phase 4-5，基于已确定的后端 DTO 结构）
5. 前端 web Verify：`npm run build` + 手动流程测试
6. **前端 mobile Coding agent**（一个 agent 完成全部 Phase 7，逻辑与 web 端一致）
7. 前端 mobile Verify：`npm run build` + 类型检查
8. CodeReview：3 个并行 reviewer（completeness / correctness / impact）