# 百炼 Application Completion 修复 & AI 响应文件存储

> 适用版本：1.3 之后
> 修改日期：2026-06-07

## 背景

1. **入参结构错位**：前端直连百炼 `https://dashscope.aliyuncs.com/api/v1/apps/{appId}/completion` 时，把 `file_list` 放在了 `input` 顶层；按百炼官方规范应放在 `input.messages[].file_list` 的每条消息上。
2. **响应文件链接未存储 / 展示**：百炼响应中 `output.file_list`（AI 生成/引用的文件链接）未保存到后端，前端未展示。
3. **临时文件清理周期太短**：`TempFileCleanJob` 清理 1 天前的临时文件，导致 `AI-training/tempFile/` 下的合法用户文件容易被误删；应改为 30 天。

## 修改清单

### 前端 — wk-train-center-ui

| 文件 | 变更 |
|------|------|
| `src/api/ai/common.js` | `chatAppStream` 不再把 `file_list` 提升到 `input` 顶层；`normalizeAppMessages` 保留 messages 内 file_list；签名逻辑仅针对 messages 内 URL；`extractAppTextFromChunk` 提取 `output.file_list` |
| `src/views/web/ai/components/AiAssistant/conversation/infrastructure/chatStreamGateway.js` | `buildStreamParams` 不再返回顶层 `file_list`；将 fileList 合并到最后一条 user 消息的 `file_list` 字段 |
| `src/views/web/ai/components/AiAssistant/shared/chatSession.js` | 在 AI 消息 onMessage/onDone 回调中写入 `fileList`；`syncToBackend` 同步 `fileList` 字段给后端 |
| `src/views/web/ai/components/AiAssistant/AiMessageList.vue` | 新增 AI 消息 fileList 渲染区；点击触发 `preview-file` 事件，弹文件预览 |
| `src/views/web/ai/components/AiAssistant/shared/AiChatPanel.vue` | 透传 AiMessageList 的 `preview-file` 事件 |

### 后端 — wk-train-center-service

| 文件 | 变更 |
|------|------|
| `wk-modules/wk-module-ai/.../domain/entity/AnswerHistoryRecord.java` | 新增 `fileList: List<String>` 字段 |
| `wk-modules/wk-module-ai/.../domain/entity/TrainingRoleRecord.java` | 新增 `fileList: List<String>` 字段 |
| `wk-modules/wk-module-ai/.../domain/command/AnswerRecordCommand.java` | 新增 `fileList` |
| `wk-modules/wk-module-ai/.../domain/command/TrainingRecordAddCommand.java` | 新增 `fileList` |
| `wk-modules/wk-module-ai/.../controller/model/AnswerRecordAddDto.java` | 新增 `fileList` 字段 + DTO→Command 透传 |
| `wk-modules/wk-module-ai/.../controller/model/TrainingRecordAddDto.java` | 新增 `fileList` 字段 + DTO→Command 透传 |
| `wk-modules/wk-module-ai/.../domain/factory/AnswerRecordFactoryImpl.java` | `create`/`edit` 写入 `fileList` |
| `wk-modules/wk-module-ai/.../domain/factory/TrainingRecordFactory.java` | `create`/`edit` 接口增加 `fileList` 参数 |
| `wk-modules/wk-module-ai/.../domain/factory/TrainingRecordFactoryImpl.java` | `create`/`edit` 写入 `fileList` |
| `wk-modules/wk-module-ai/.../application/TrainingRecordAppOpService.java` | `saveAskRecord` 新增 7 参重载（带 fileList），旧 6 参版本作为 `default` 委托 |
| `wk-modules/wk-module-ai/.../application/impl/TrainingRecordAppOpServiceImpl.java` | 实现 7 参 `saveAskRecord`；`addRecord` 透传 `fileList` |
| `wk-modules/wk-module-ai/.../application/impl/TrainingRecordAppQueryServiceImpl.java` | `aiAsk` 内 `saveAskRecord` 调用改用 7 参（`fileList` 传 null：WSS 通用对话无 file_list） |
| `yf-modules/yf-module-course/.../job/TempFileCleanJob.java` | 清理阈值 `24 * 60 * 60 * 1000L` → `TEMP_FILE_KEEP_DAYS * 24 * 60 * 60 * 1000L`（30 天） |

### v3 同步评估 — wk-train-center-ui-v3

- `src/api/client/ai/assistant.ts`：`addRecord` 接收 `Record<string, unknown>`，**已自动透传 `fileList`**，无需改动
- `src/api/client/ai/apps.ts`：`ANSWER_ASSISTANT_APP.id` 等定义 OK
- 暂未迁移 `chatAppStream` 直连百炼；待迁移时按 v2 修复规范实现
- v3 OSS 路径是 `AI-training/chat-file/`，与 30 天清理无冲突（清理 Job 写死 `AI-training/tempFile/`）

## 兼容性

- `AnswerRecordFactory.edit/create` 未改签名（接受 `AnswerRecordCommand` 整体）
- `TrainingRecordFactory` 的 `create/edit` 签名变了，但项目内仅 `TrainingRecordAppOpServiceImpl` 一处使用，已同步更新
- `TrainingRecordAppOpService.saveAskRecord` 旧 6 参方法保留为 `default`，调用方零侵入
- DTO 新增字段不破坏旧调用（Jackson 容忍未知字段缺失）

## 数据存储说明

- 历史数据：`chat_history` JSON 字符串中历史记录无 `fileList` 字段，反序列化时为 `null`，**安全**
- 新数据：仅当 AI 响应中含 `output.file_list`（URL 字符串数组）时，存入 `AnswerHistoryRecord.fileList` / `TrainingRoleRecord.fileList`
- DB 列无需变更：`chat_history` 已是 JSON 列，hutool `JSONUtil` 自动序列化新字段

## 验证

- `npm run verify:chinese` ✅
- `mvn -pl wk-modules/wk-module-ai,yf-modules/yf-module-course -am compile` ✅ BUILD SUCCESS
- v3 `typecheck` 仅有原有 `src/api/client/index.ts(32)` 错误，与本次变更无关

## 后续 TODO

- 若需在历史记录列表/详情页展示 AI 文件链接，需扩展 `TrainingRecordVo` / `AnswerRecordVo` 输出 `chatHistory`（已含 `fileList`）
- 如需前端解析 `apps/{appId}/completion` 流式响应中的 `output.thoughts`（已在用）/ `output.file_list`（本次新增），关注 `extractAppTextFromChunk`
- 监控 `AI-training/tempFile/` 实际占用，30 天策略是否符合业务需要
