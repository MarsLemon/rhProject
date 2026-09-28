# 合并 dashScopeFileIds 到 fileList — Plan Review v2 (Claude → Qoder)

> **目标读者**: Qoder(按此清单继续改 plan)
> **基准文档**: [合并_dashScopeFileIds_到_fileList_47b0e4b4.md (修正版)](../../../.qoder/plans/合并_dashScopeFileIds_到_fileList_47b0e4b4.md) — 2026-07-22 13:28
> **增量来源**: v1 评审 [2026-07-22-合并-dashscope-file-ids-issues-for-qoder.md](2026-07-22-合并-dashscope-file-ids-issues-for-qoder.md) 后,Qoder 做了大量修订,本 v2 聚焦**仍未修**的 7 项
> **评审日期**: 2026-07-22
> **状态**: 待 Qoder 处理

---

## TL;DR

| v1 已采纳 ✅ | v1 未采纳 / 新增 ❌ |
|---|---|
| FileItem 删 role 字段 | ReactRequest record 调用方全量未列 🔴 |
| 历史数据 Converter 懒迁移 | Controller extractFileList 双参改单参未列 🔴 |
| Phase 0 排查 v3 | Service 层 chatHistory 写回链路 Hutool 序列化未验 |
| Phase 7 wk-mhc-mobile 完整适配 | mobile 端 AnswerAssistantView checkAndResume 判断错 |
| AiRequestContext 联动 | DTO 顶层 fileList/dashScopeFileIds 处置自相矛盾 |
| HistoryMessage 保留字段 | 前端未删顶层 dashScopeFileIds 字段会静默丢 |
| DTO 字段移除说明 | Converter 后处理逻辑描述不完整 |

合计 **2 致命 + 5 重要**待修。

---

## 🔴 #1 ReactRequest record 改造下游全量调用点未列

**Plan 现状**: Phase 3.2 L196-214 仅描述字段合并策略,**未列下游调用方改造清单**。

**真实情况**: grep 命中下游 **7 处** `request.fileIds()` 调用:

| 文件 | 行 | 代码 |
|---|---|---|
| [AgentReActExecutor.java](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/react/AgentReActExecutor.java) | 49, 62 | 字段定义 + JavaDoc |
| [AgentReActExecutorImpl.java](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/react/AgentReActExecutorImpl.java) | 69 | `AiRequestContext.setFileIds(request.fileIds())` |
| 同上 | 77 | `request.fileIds()` 影响 useResponses 强制走 Chat Completions 的判定 |
| 同上 | 358 | `AiRequestContext.getFileIds()` |
| 同上 | 562 | `AiRequestContext.getFileIds()` |

**关键风险**: record 字段名从 `fileIds` 改成 `fileList` 后,`request.fileIds()` 这个访问器消失 → 编译期全部报错。如果 plan 不列全量调用点,Coding agent 极可能漏改某处 → 运行时 NPE。

**修复要求**: Phase 3.2 补充子章节:

### 3.2.1 ReactRequest 字段定义
- 删除 `List<String> fileIds` 字段
- 保留 `List<FileItem> fileList`(已合并)

### 3.2.2 下游调用方全量改造
- `AgentReActExecutorImpl.java:69` — 改为 `AiRequestContext.setFileItems(request.fileList())` + 内部提取 dashScopeFileId
- `AgentReActExecutorImpl.java:77` — 改为基于 FileItem 列表判空(`!request.fileList().isEmpty() && hasDashScopeFileId`)
- `AgentReActExecutorImpl.java:358, 562` — 同步改造
- `AiRequestContext.java` — 新增 `setFileItems(List<FileItem>)` / `getFileItems()`,保留 `setFileIds/getFileIds` 为 deprecated 兼容方法(或删除,看 Service 层有无外部调用)

### 3.2.3 编译验证
- `mvn clean compile` 必须零错

---

## 🔴 #2 Controller extractFileList 双参改单参,调用方未列

**Plan 现状**: Phase 3.1 L172-194 写「删除 `extractFileList()` 和 `extractDashScopeFileIds()` 两个方法,新增统一 `extractFileList(List<MessageItem>)`」。

**真实情况**: [WkAiAgentController.java:160](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/WkAiAgentController.java) 当前调用是:

```java
List<String> fileList = extractFileList(dto, history);
```

其中 `history` 参数来自上游 `history.add(new HistoryMessage(...))` 累积,改成单参后:
- L160 调用点怎么改?
- `history` 这个中间变量从哪儿取?(可能要从 DTO.messages 拆出来)
- 返回值类型从 `List<String>`(URL)变成 `List<FileItem>` 后,下游 `fileList` 作为 ReactRequest.fileList 传入 → 类型匹配 OK,但内部调用如 L190-193 的 `extractFileList(dto).stream().map(FileItem::getUrl)` 是否仍有意义?

**修复要求**: Phase 3.1 补充子章节:

### 3.1.1 extractFileList 签名改造
- 旧: `private List<String> extractFileList(AgentChatRequestDto dto, List<HistoryMessage> history)`
- 新: `private List<FileItem> extractFileList(AgentChatRequestDto dto)` — 仅从 dto.messages 提取,不再接收 history

### 3.1.2 L160 调用点改造
- 调用改为 `List<FileItem> fileItems = extractFileList(dto);`
- 后续从 fileItems 提取 URL 数组传给 ReactRequest.fileList
- `history` 变量移除(HistoryMessage 构造改成从 messages[i].fileList 直接提取)

### 3.1.3 extractDashScopeFileIds 删除
- 整体删除,逻辑并入 `extractFileList` + HistoryMessage 构造时按需提取 dashScopeFileId

---

## 🟡 #3 Service 层 chatHistory 写回链路 Hutool 序列化未验证

**Plan 现状**: Phase 2.7 L124 写「不写回 DB — 旧数据在读时转换,新写入永远用新格式」。

**真实风险**: [TrainingRecordAppOpServiceImpl.java:73](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/impl/TrainingRecordAppOpServiceImpl.java) 和 [AnswerRecordAppOpServiceImpl.java:65, 79](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/impl/AnswerRecordAppOpServiceImpl.java) 都有 `chatHistory.stream().filter().collect()` 内存修改后通过 `entity.setChatHistory(JSONUtil.toJsonStr(domain.getChatHistory()))` 序列化的路径。

**问题**:
1. FileItem 是否能被 Hutool `toJsonStr` 正确序列化(需要 getter 或 public 字段)
2. chatHistory JSON 写回后,旧顶层 `dashScopeFileIds` 字段是否会以未知字段形式残留(脏数据)
3. 写回链路如果在某处直接 `entity.setChatHistory(jsonStr)` 用旧 JSON 字符串,绕过了 Converter → 旧格式保留

**修复要求**: Phase 2.7 补充子章节:

### 2.7.1 写回链路 Hutool 序列化验证
- FileItem 必须有公开 getter / setter(Lombok `@Data` 或显式 `public String getUrl()`)
- 写回前 `JSONUtil.toJsonStr(domain.getChatHistory())` 输出格式确认是 FileItem 数组
- 测试用例:旧 record 写入后再读出,验证无 `dashScopeFileIds` 顶层字段残留

### 2.7.2 Service 层直写路径排查
- grep `entity.setChatHistory(JSONUtil.toJsonStr(...)` 全量调用点
- 确保所有写回路径都走 `domain.getChatHistory()`(已转换过的 List)而不是绕过 Converter

---

## 🟡 #4 mobile 端 AnswerAssistantView checkAndResume 判断错

**Plan 现状**: Phase 7.2 L339 写「mobile 端无 AnswerAssistantView 等价物,无 checkAndResume bug」。

**真实情况**: grep 命中 [wk-mhc-mobile/src/pages/smart-training/components/ai/AnswerAssistantView.vue](../../../wk-mhc-mobile/src/pages/smart-training/components/ai/AnswerAssistantView.vue) — **mobile 端存在 AnswerAssistantView 文件**。

**风险**:
- 如果 mobile 端也有 `checkAndResumeAiResponse` 同款 bug(漏传 dashScopeFileIds),plan 完全没覆盖 → mobile 端文件恢复后仍丢 file-id
- 如果 mobile 端无此 bug,需要 grep 证据明确写出,而不是简单断言「无等价物」

**修复要求**: Phase 7.2 修正 + 补充:

### 7.2.1 mobile 端 AnswerAssistantView 排查
- grep `checkAndResume` 在 mobile 端结果:`[AnswerAssistantView.vue](../../../wk-mhc-mobile/src/pages/smart-training/components/ai/AnswerAssistantView.vue)` 命中
- 阅读该文件 L*~ checkAndResume 方法,确认是否有同款 bug
- 若有 → 列为 Phase 7 子项,逻辑跟 web 端 5.5 一致修复
- 若无 → grep 证据明确写出「已读 mobile AnswerAssistantView L* 检查,无 checkAndResume 等价逻辑」

---

## 🟡 #5 DTO 顶层 fileList/dashScopeFileIds 处置自相矛盾

**Plan 现状**: Phase 2.1 L60-63 写「移除顶层 fileList 和顶层 dashScopeFileIds」,但 Phase 2.7 L127 写「`AnswerRecordEntity` 的 `dashScopeFileIds` 列保留但不再写入新值」。

**冲突点**: `AnswerRecord` 是 Entity 层,而 `AgentChatRequestDto` 是 DTO 层 — 两者不同对象,但 plan 文字表述容易混淆。

**真实情况**:
- [AgentChatRequestDto.java:62, 93](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AgentChatRequestDto.java) 顶层 fileList + dashScopeFileIds 都是 `List<String>`
- [AnswerRecord.java:42, 57](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/domain/entity/AnswerRecord.java) 同名字段(从 grep 推断,需确认)
- [TrainingRecord.java:50, 56](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/domain/entity/TrainingRecord.java) 同名字段

**修复要求**: Phase 2.1 + 2.7 统一表述:

### 2.1 DTO 层 (AgentChatRequestDto)
- **物理删除**顶层 `fileList` 和 `dashScopeFileIds` 字段
- `MessageItem.fileList` 改为 `List<FileItem>`,**物理删除** MessageItem.dashScopeFileIds

### 2.3 Entity 层 (AnswerRecord / TrainingRecord)
- 顶层 `fileList` 字段类型从 `String`(JSON 字符串) 保持不变(因存的就是 chatHistory JSON)
- 但**内部 JSON 结构** 从 `fileList:String[] + dashScopeFileIds:String[]` 变成 `fileList:FileItem[]`
- 顶层 `dashScopeFileIds` 字段**物理删除**(因 MessageItem 内嵌,无意义再在顶层)

### 2.7 Converter 层
- 读路径:处理 `fileList:String[]` + `dashScopeFileIds:String[]` 双格式 → 转 FileItem[]
- 写路径:序列化 FileItem[] 数组为 JSON,不再含 `dashScopeFileIds` 顶层字段

---

## 🟡 #6 前端未删顶层 dashScopeFileIds 字段会静默丢

**Plan 现状**: Phase 2.1 L62 写 DTO 物理删除 `dashScopeFileIds`,Phase 4/5/7 列前端改造点但**没说"前端必须同步删除顶层 dashScopeFileIds 字段"**。

**风险链路**:
1. 后端 DTO 删 `dashScopeFileIds` 字段
2. 前端 web 端 / mobile 端如果忘了删前端类型定义中的 `dashScopeFileIds`
3. 前端仍在顶层 payload 发 `dashScopeFileIds: ['file-xxx']`
4. Jackson 反序列化时未知字段被静默丢弃(Spring Boot 默认 `FAIL_ON_UNKNOWN_PROPERTIES = false`)
5. **完全静默,无日志无报错**,file-id 丢失

**真实情况**: grep 命中前端 `dashScopeFileIds` 仍在顶层 payload 中:
- [chatStreamGateway.js:148-149](../../../wk-train-center-ui/src/views/web/ai/components/AIAssistant/conversation/infrastructure/chatStreamGateway.js) — `result.dashScopeFileIds = options.dashScopeFileIds...`
- [useChatSession.ts:285-293](../../../wk-mhc-mobile/src/pages/smart-training/composables/ai/useChatSession.ts) — `payload.dashScopeFileIds = msg.dashScopeFileIds...`

**修复要求**: Phase 4/5/7 顶部增加**强制要求**:

> ⚠️ **前端必须同步删除顶层 `dashScopeFileIds` 字段**。否则后端 DTO 删字段后,前端发出去的 `dashScopeFileIds` 被 Jackson 静默忽略,file-id 丢失但无日志。

具体改造点:
- **Phase 4.2 chatStreamGateway.js**: 删除 `result.dashScopeFileIds = ...`(L148-149),改为从 currentUserMsg.fileList 提取 dashScopeFileId 列表传给 messages
- **Phase 7.1 wk-mhc-mobile/useChatSession.ts**: 删除 L290-293 顶层 payload.dashScopeFileIds 赋值
- **Phase 7.1 wk-mhc-mobile/common.ts**: 删除 L1125-1126 `payload.dashScopeFileIds = opts.dashScopeFileIds...`
- **Phase 7.1 wk-mhc-mobile/types.ts**: 删除顶层 `dashScopeFileIds` 字段类型定义

---

## 🟡 #7 Converter 后处理逻辑描述不完整

**Plan 现状**: Phase 2.7 L130-140 写「后处理逻辑」,代码片段仅写 `// 如果 Hutool 无法将 String 映射为 FileItem,需在反序列化前手动处理 JSON` —— 猜测性描述,无完整实现。

**真实情况**: [TrainingRecordConverter.java:33](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/infra/converter/TrainingRecordConverter.java) 当前是:
```java
domain.setChatHistory(JSONUtil.toList(entity.getChatHistory(), TrainingRoleRecord.class));
```
Hutool `toList(String, Class)` 反序列化时:
- TrainingRoleRecord.fileList 当前类型 `List<String>` → 旧格式 `["url1","url2"]` 正常反序列化为 String[]
- TrainingRoleRecord.dashScopeFileIds 当前类型 `List<String>` → 同上
- **问题**: 反序列化成功不代表 FileItem 化,需要在 toList 后**遍历每个 record**,检测并合并 fileList + dashScopeFileIds → FileItem[]

**修复要求**: Phase 2.7 L130-164 整理为唯一路径:

### 2.7.1 唯一迁移路径:JSON 预处理
- 删除 L130-140 的猜测性描述
- 唯一路径是 L142-164 的「`JSONUtil.toList()` 之前预处理 JSON」方案
- 完整代码:
  ```java
  public List<TrainingRoleRecord> toDomain(TrainingRecordEntity entity) {
      JSONArray rawHistory = JSONUtil.parseArray(entity.getChatHistory());
      for (Object obj : rawHistory) {
          JSONObject record = (JSONObject) obj;
          JSONArray oldFileList = record.getJSONArray("fileList");
          JSONArray oldFileIds = record.getJSONArray("dashScopeFileIds");
          if (oldFileList != null && oldFileList.isNotEmpty() 
              && oldFileList.get(0) instanceof String) {
              // 旧格式:fileList 是 String[],按索引合并 dashScopeFileIds
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

### 2.7.2 AnswerRecordConverter 同样模式
- 同样预处理 JSON 后再 toList

### 2.7.3 单元测试
- 输入: `[{fileList:["url1","url2"], dashScopeFileIds:["fid1"]}]` (旧格式)
- 期望输出: `[{fileList:[{url:"url1",dashScopeFileId:"fid1"},{url:"url2",dashScopeFileId:null}]}]`
- 验证 `record.getDashScopeFileIds()` 为 null

---

## 给 Qoder 的优先级

| 优先级 | 项 | 工时估 |
|---|---|---|
| P0 | #1 ReactRequest record 调用方全量 | 30 min |
| P0 | #2 Controller extractFileList 签名改造 | 20 min |
| P1 | #7 Converter 完整实现路径 | 30 min |
| P1 | #6 前端必须删顶层 dashScopeFileIds | 15 min |
| P2 | #5 DTO/Entity 顶层字段处置统一表述 | 15 min |
| P2 | #4 mobile 端 AnswerAssistantView 排查 | 15 min |
| P2 | #3 Service 层写回链路 Hutool 序列化验证 | 20 min |

合计约 2-2.5h。改完后再走 evaluate 流程派工。

---

## 给 Coding agent 的额外注意

执行时务必:
1. **跑 `mvn clean compile` 验证**(改 ReactRequest record 后,任何漏改调用点会编译期报错,最容易一次找全)
2. **跑 Service 层单测** 验证 chatHistory 写回链路 Hutool 序列化 FileItem 数组正确
3. **前端 `npm run build`** 验证类型检查 + 构建通过
4. **手动跑一遍 P1-7 验证用例**:上传文档 → 撤回 → 重发 → 文件仍带 file-id → AI 能读 PDF 内容