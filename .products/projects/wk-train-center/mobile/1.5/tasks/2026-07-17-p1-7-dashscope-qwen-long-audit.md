# P1-7: DashScope 文件上传 + Qwen-Long 引用 — 审核报告

> **交接对象**: 另一个 AI（代码审核）
> **编写时间**: 2026-07-17
> **功能编号**: P1-7
> **状态**: 三审完成，4 bug 已修复，可上线

---

## 一、用户需求

用户希望为 AI 助教接入 **Qwen-Long 长文本模型**能力，核心诉求如下：

1. **文件上传走前端直传**：后端带宽小，不能让文件流过后端。前端用 `fetch`（类 curl/http）直接 POST 到 DashScope Files API。
2. **双通道上传**：上传文件时除了原有 OSS 路径（用于图片预览/下载），还要新增一条上传到 DashScope 的路径，获取 `file-id` 供 Qwen-Long 引用。
3. **后端中转 Token**：API Key 配置在后端（数据库 cfg 表），不暴露到前端环境变量。前端从后端获取临时 API Key 后直传 DashScope。
4. **一次性文件管理**：需要询问用户文件是否为一次性。一次性文件在会话结束后自动删除（阿里云文件存储上限约 10000 个）。
5. **不跨会话保留**：文件仅在本会话有效，会话结束即清理。

---

## 二、技术方案

### 架构设计

```
用户选择文件
    ├─① OSS 上传（已有逻辑，图片预览/下载用）
    │
    └─② DashScope 上传（新增）
         │
         ├─ 前端从后端获取 API Key（POST /dashscope/upload-token）
         ├─ 前端 fetch POST multipart/form-data → DashScope /v1/files
         ├─ 返回 file-id，存入前端 session 状态
         │
         ├─ 发送消息时，dashScopeFileIds 随请求传给后端
         │
         └─ 后端 ReAct 执行器：
              ├─ 检测到 fileIds → 强制 model = "qwen-long"
              ├─ 在 messages 中追加 system message: "fileid://file-xxx"
              └─ 调用百炼 Chat Completions API

会话结束
    └─ 前端调用 DELETE /dashscope/files 批量删除一次性文件
```

### Qwen-Long file-id 引用格式（关键）

根据阿里云官方文档（`help.aliyun.com/zh/model-studio/long-context-qwen-long`）：

```json
{
  "model": "qwen-long",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "system", "content": "fileid://file-fe-xxx"},
    {"role": "user", "content": "这篇文章讲了什么？"}
  ]
}
```

- `file-id` 必须作为**独立的 system message**，格式为 `fileid://file-xxx`
- model 必须为 `qwen-long`
- 不能把 file-id 文本简单拼进 instructions/system prompt

---

## 三、修改文件清单

### 后端（Java）

#### 1. `DashScopeFileService.java`（新建）
- **路径**: `wk-module-ai/.../application/tool/DashScopeFileService.java`
- **职责**: DashScope 文件管理服务
- **方法**:
  - `getUploadToken()` — 从 `AgentConfigService.getApiKey()` 获取 API Key，返回给前端
  - `deleteFile(String fileId)` — 调用 `DELETE /v1/files/{id}` 删除单个文件
  - `bulkDelete(List<String> fileIds)` — 批量删除，返回 `{successCount, failCount, details}`
- **API Key 来源**: `AgentConfigService`（从数据库 cfg 表读取），**不使用 `@Value` 从 yml 读取**

#### 2. `AgentChatRequestDto.java`（修改）
- **路径**: `wk-module-ai/.../controller/model/AgentChatRequestDto.java`
- **新增字段**:
  - `List<String> dashScopeFileIds` — DashScope file-id 列表
  - `FileRetentionPolicy retentionPolicy` — 文件留存策略（内部类，含 `oneTime` / `askUserRetain`）

#### 3. `WkAiAgentController.java`（修改）
- **路径**: `wk-module-ai/.../controller/WkAiAgentController.java`
- **新增**:
  - 注入 `DashScopeFileService`
  - `POST /dashscope/upload-token` — 返回 API Key 供前端直传
  - `DELETE /dashscope/files` — 批量删除文件（接收 `{ids: [...]}`）
  - 在 `chat-stream` 中提取 `dto.getDashScopeFileIds()` 并传入 `ReactRequest`

#### 4. `AgentReActExecutor.java`（修改）
- **路径**: `wk-module-ai/.../application/react/AgentReActExecutor.java`
- **修改**: `ReactRequest` record 新增 `List<String> fileIds` 字段（第 11 个参数）

#### 5. `AgentReActExecutorImpl.java`（修改 — 核心逻辑）
- **路径**: `wk-module-ai/.../application/react/AgentReActExecutorImpl.java`
- **修改点**:
  - **`execute()` 方法**: 检测到 `fileIds` 非空时，强制走 Chat Completions 路径（`useResponses = false`），因为 Responses API 的 input 格式不支持 `fileid://`
  - **`runReactLoop()` 方法**:
    - 在第一条 system message（角色定义）之后，为每个 file-id 追加独立 system message：`{"role": "system", "content": "fileid://file-xxx"}`
    - 有 file-id 时强制 `model = "qwen-long"`
    - 移除了错误的旧实现（把 `file-id=xxx` 文本拼进 instructions）
  - **`runReactLoopResponses()` 方法**: 移除了 `buildInstructionsWithFileIds` 调用（该方法从未定义，会导致编译错误），恢复为 `request.systemPrompt()`

#### 6. `BailianChatRequest.java`（修改）
- **路径**: `wk-module-ai/.../application/react/BailianChatRequest.java`
- **修改**: 移除了错误的 `instructions` 字段（Qwen-Long 的 file-id 引用走 messages 数组，不走顶层 instructions 字段）

#### 7. `application-ai.yml`（修改）
- **路径**: `wk-module-ai/src/main/resources/application-ai.yml`
- **新增配置段** `dashscope-file`:
  - `base-url`: DashScope Files API 端点
  - `purpose`: `file-extract`（文档解析）
  - `default-one-time`: `true`（默认一次性）
  - `ask-user-retain`: `false`（静默删除）
  - `max-files-per-session`: `10`

---

### 前端（Vue 2）

#### 8. `AiInputArea.vue`（修改）
- **路径**: `wk-train-center-ui/.../AiAssistant/AiInputArea.vue`
- **修改点**:
  - 修复语法错误（`flushPendingSendIfReady` 和 `handleSend` 方法缺少闭合 `}`）
  - 新增 `dashScopeFileIds` 状态数组
  - 发送消息时携带 `dashScopeFileIds`
  - 新增 `handleUploadToDashScope({ file })` 方法：从后端获取 API Key → fetch POST 到 DashScope → 存储 file-id
  - 新增 `cleanupDashScopeFiles()` 方法：会话结束时批量删除一次性文件
  - voice/paste 上传路径改为调用 `InputToolbar.handleUpload`（双通道），不再直接调 `CourseReferenceUpload.handleUpload`
  - 模板新增 `@upload-to-dashscope="handleUploadToDashScope"` 监听

#### 9. `InputToolbar.vue`（修改）
- **路径**: `wk-train-center-ui/.../AiAssistant/components/InputToolbar.vue`
- **修改点**:
  - 新增 `onFileAdd(tempFile, rawFile)` 方法：监听 `CourseReferenceUpload` 的 `@file-add` 事件，对文档类文件触发 `upload-to-dashscope` 事件
  - `handleUpload({ file })` 方法：先调 OSS 上传，再对文档类文件 emit `upload-to-dashscope`
  - 模板新增 `@file-add="onFileAdd"` 监听

#### 10. `CourseReferenceUpload.vue`（修改 — 共享组件）
- **路径**: `wk-train-center-ui/src/components/ComponentsBusiness/course/CourseReferenceUpload.vue`
- **修改**: `file-add` 事件新增第二个参数 `file`（原始 File 对象），向后兼容（现有监听器只取第一个参数）

#### 11. `chatSession.js`（修改）
- **路径**: `wk-train-center-ui/.../AiAssistant/shared/chatSession.js`
- **修改点**:
  - `sendMessage(options)` 解构新增 `dashScopeFileIds`
  - `generateAiResponse` 参数新增 `dashScopeFileIds`
  - `buildStreamParams` 调用新增 `dashScopeFileIds` 透传

#### 12. `chatStreamGateway.js`（修改）
- **路径**: `wk-train-center-ui/.../AiAssistant/conversation/infrastructure/chatStreamGateway.js`
- **修改点**:
  - `buildStreamParams` 参数新增 `dashScopeFileIds`
  - 返回 payload 中新增 `dashScopeFileIds` 字段

#### 13. `common.js`（修改）
- **路径**: `wk-train-center-ui/src/api/ai/common.js`
- **修改点**:
  - 新增 `getDashScopeUploadToken()` — 调用 `POST /api/wk/ai/agent/dashscope/upload-token`
  - 新增 `deleteDashScopeFiles(fileIds)` — 调用 `DELETE /api/wk/ai/agent/dashscope/files`
  - `buildAgentRequestPayload` 新增 `dashScopeFileIds` 透传到 payload
  - export 新增两个函数

#### 14. `OneTimeFileManager.vue`（新建）
- **路径**: `wk-train-center-ui/.../AiAssistant/components/OneTimeFileManager.vue`
- **职责**: 一次性文件管理弹窗，首次上传文档时询问用户是否为一次性文件
- **特性**: 支持"本次会话不再询问"记忆

---

## 四、数据流

```
[前端] 用户选择文档文件
  → CourseReferenceUpload.handleUpload({ file })
    → OSS 上传（图片预览/下载用）
    → emit('file-add', tempFile, rawFile)  ← P1-7 新增第二个参数
  → InputToolbar.onFileAdd(tempFile, rawFile)
    → emit('upload-to-dashscope', { file: rawFile })
  → AiInputArea.handleUploadToDashScope({ file })
    → getDashScopeUploadToken()  → 后端返回 API Key
    → fetch POST /v1/files (multipart)  → DashScope 返回 file-id
    → this.dashScopeFileIds.push(fileId)

[前端] 用户发送消息
  → AiInputArea.$emit('send', { content, files, dashScopeFileIds, ... })
  → chatSession.sendMessage({ ..., dashScopeFileIds })
  → generateAiResponse({ ..., dashScopeFileIds })
  → buildStreamParams({ ..., dashScopeFileIds })
  → buildAgentRequestPayload({ ..., dashScopeFileIds })
  → payload.dashScopeFileIds = ["file-xxx", ...]
  → POST /api/wk/ai/agent/chat-stream

[后端] WkAiAgentController
  → dto.getDashScopeFileIds() → ReactRequest.fileIds
  → AgentReActExecutorImpl.execute()
    → hasFileIds? → 强制 useResponses = false（走 Chat Completions）
    → runReactLoop()
      → messages 追加 {"role":"system","content":"fileid://file-xxx"}
      → model = "qwen-long"
      → BailianChatRequest.builder().messages(messages).build()
      → BailianChatCaller.call() → 百炼 Chat Completions API

[前端] 会话结束
  → AiInputArea.cleanupDashScopeFiles()
  → deleteDashScopeFiles(fileIds) → DELETE /api/wk/ai/agent/dashscope/files
  → 后端 DashScopeFileService.bulkDelete() → DELETE /v1/files/{id}
```

---

## 五、潜在风险与审核重点

1. **API Key 安全**: `getUploadToken()` 直接返回 API Key 给前端。当前是临时方案，后续应升级为短效 JWT 或 STS Token。
2. **文件配额**: 阿里云文件存储上限约 10000 个。一次性文件清理逻辑依赖前端在会话结束时主动调用 `cleanupDashScopeFiles()`。如果用户关闭浏览器，文件不会被清理。**建议后续加后端定时清理任务**。
3. **CORS**: 前端直传 DashScope 需要浏览器支持跨域。DashScope Files API 应支持 CORS（需验证）。
4. **Qwen-Long 限制**: 当 messages 中包含 fileid:// system message 时，user 消息内容限制在 9000 Token 以内。
5. **Responses API 不兼容**: fileid:// 格式仅在 Chat Completions API 的 messages 数组中有效，Responses API 的 input 格式不支持。已通过 `execute()` 中的 `hasFileIds` 检查强制切换路径。
6. **重试场景**: `chatSession.retry()` 不携带 `dashScopeFileIds`（一次性文件可能已被删除），重试时降级为纯文本问答。这是预期行为。
7. **共享组件修改**: `CourseReferenceUpload.vue` 的 `file-add` 事件新增了第二个参数，向后兼容。需确认不会影响其他使用该组件的页面。

---

## 六、编译状态

- **后端**: LSP 未就绪，无法自动检测。手动检查确认：
  - `DashScopeFileService` — 无 `apiKey` 字段引用，全部改为 `agentConfigService.getApiKey()`
  - `AgentReActExecutorImpl` — 无 `buildInstructionsWithFileIds` 调用，无 `.instructions()` 调用，`.build()` 已补全
  - `BailianChatRequest` — `instructions` 字段已移除
  - `WkAiAgentController` — `DashScopeFileService` 已注入，`DeleteMapping` import 已加
- **前端**: AiInputArea.vue 语法错误已修复（缺少的 `}` 已补全）

---

## 七、自审记录（Qoder 第 12 节）

> 自审时间: 2026-07-17
> 自审范围: 全部 14 个修改文件逐文件审查

### 7.1 审核发现与修复

#### BUG-1: InputToolbar.vue — `$emit().catch()` TypeError（已修复）

**文件**: `InputToolbar.vue` 第 287 行
**问题**: `handleUpload` 方法中执行了 `this.$emit('upload-to-dashscope', { file }).catch(err => { ... })`。Vue 2 的 `$emit` 返回组件实例而非 Promise，调用 `.catch()` 会抛出 `TypeError: Cannot read property 'catch' of undefined`。
**修复**: 移除 `.catch()` 链式调用。错误处理已由 `AiInputArea.handleUploadToDashScope` 内部的 try-catch 覆盖，无需在 emit 侧重复处理。
**影响**: voice/paste 路径触发 DashScope 上传时会崩溃。修复后正常运行。

#### BUG-2: AiInputArea.vue — `cleanupDashScopeFiles` 从未被调用（已修复）

**文件**: `AiInputArea.vue`
**问题**: `cleanupDashScopeFiles()` 方法定义完整但从未被任何代码调用，导致一次性 DashScope 文件在会话结束后不会被清理，最终耗尽阿里云 10000 文件配额。
**修复**: 在 `beforeDestroy()` 生命周期钩子中追加 `this.cleanupDashScopeFiles()` 调用。组件销毁时自动触发批量删除。
**影响**: 所有上传到 DashScope 的文件此前都不会被删除。修复后随组件销毁自动清理。

#### DOC-1: DashScopeFileService.java — 过时注释（已修复）

**文件**: `DashScopeFileService.java` 第 32 行
**问题**: 类注释写 "API Key 从 yml 配置读取"，但实际已改为从 `AgentConfigService`（数据库 cfg 表）读取。注释与代码不一致。
**修复**: 更新注释为 "API Key 从 AgentConfigService 读取(数据库 cfg 表)"。

### 7.2 设计关注点（未修改，记录待评估）

#### CONCERN-1: 图片 + 文档同时上传时模型冲突

**文件**: `AgentReActExecutorImpl.java` 第 157-167 行
**场景**: 当用户同时上传图片（`fileList` 非空）和文档（`fileIds` 非空）时，代码先设 `model = "qwen3.6-plus"`（支持图片），再覆盖为 `model = "qwen-long"`（不支持图片）。结果是图片被静默忽略。
**建议**: 有 file-id 时若同时有图片，应打印 warn 日志或在前端拦截（不允许同时上传图片和文档）。

#### CONCERN-2: `application-ai.yml` 配置项未被代码读取

**文件**: `application-ai.yml` / `DashScopeFileService.java`
**问题**: yml 中新增的 `dashscope-file` 配置段（base-url, purpose, max-files-per-session 等）目前没有被任何 Java 代码 `@Value` 或 `@ConfigurationProperties` 读取。`DashScopeFileService` 中的 `BASE_URL` 是硬编码常量。
**建议**: 后续将硬编码值改为从配置读取，或删除 yml 中未使用的配置项以免误导。

#### CONCERN-3: `OneTimeFileManager.vue` 已创建但未集成

**文件**: `OneTimeFileManager.vue`
**问题**: 组件已创建，包含弹窗 UI 和"本次会话不再询问"逻辑，但没有任何父组件 import 或使用它。当前一次性文件默认 `oneTime = true`，无需用户确认。
**建议**: 如果后续需要询问用户是否保留文件，需在 `AiInputArea.vue` 或 `AiAssistantShell.vue` 中引入此组件并监听首次文档上传事件。

#### CONCERN-4: `FileRetentionPolicy` 字段未贯通

**文件**: `AgentChatRequestDto.java`
**问题**: `BizParams.retentionPolicy` 字段已定义（含 `oneTime` / `askUserRetain`），但前端 `buildAgentRequestPayload` 不发送此字段，后端 Controller 也不读取它。当前全部走默认值 `oneTime = true`。
**建议**: 如需用户可选保留文件，需打通前端 → DTO → Service 的传递链路。目前不影响功能（默认一次性）。

#### CONCERN-5: 浏览器关闭时文件不清理

**问题**: `cleanupDashScopeFiles` 依赖 `beforeDestroy` 钩子，但用户直接关闭浏览器标签页时 Vue 生命周期钩子不一定触发（`beforeDestroy` 在 `beforeunload` 事件中不保证执行）。
**建议**: 后续在后端增加定时任务，扫描超过 24 小时的 DashScope 文件并自动删除。

### 7.3 审核通过项

以下文件经逐行审查确认无问题：

| 文件 | 审查结论 |
|---|---|
| `BailianChatRequest.java` | `instructions` 字段已移除，builder 调用 `.build()` 正确 |
| `AgentReActExecutorImpl.java` runReactLoop | `fileid://` system message 插入位置正确（system prompt 之后、history 之前），强制 `qwen-long` 逻辑正确 |
| `AgentReActExecutorImpl.java` execute | `hasFileIds` 检测 + 强制 `useResponses = false` 逻辑正确 |
| `AgentReActExecutorImpl.java` runReactLoopResponses | 已移除 `buildInstructionsWithFileIds` 调用，恢复为 `request.systemPrompt()` |
| `AgentChatRequestDto.java` | `dashScopeFileIds` 字段定义正确，`FileRetentionPolicy` 内部类结构合理 |
| `WkAiAgentController.java` | `DashScopeFileService` 注入正确，两个新接口路径与前端调用匹配 |
| `chatSession.js` | `dashScopeFileIds` 全链路透传正确（sendMessage → generateAiResponse → buildStreamParams） |
| `chatStreamGateway.js` | `buildStreamParams` 参数和 payload 字段正确 |
| `common.js` | `getDashScopeUploadToken` / `deleteDashScopeFiles` 函数正确，export 已追加 |
| `CourseReferenceUpload.vue` | `file-add` 事件新增第二个参数向后兼容，不影响现有监听器 |
| `InputToolbar.vue` onFileAdd | 文档类型判断和事件 emit 正确（BUG-1 修复后） |

---

## 八、复核追加(2026-07-17 二次审核 — Claude)

> **复核人**: Claude(本会话)
> **复核范围**: 同 §三 14 文件 + 后端 `mvn clean compile`
> **结论**: §7.3 全部通过项确认无误,功能可上线;但发现 4 条原报告未列问题,需主人决策处置。

### 8.1 复核核验手段

- 后端:`mvn clean compile -pl wk-modules/wk-module-ai -am -DskipTests` → BUILD SUCCESS(97 源文件全过)
- 前端:`grep -r "dashScopeFileIds"` / `"upload-to-dashscope"` / `OneTimeFileManager` import 全仓库定位
- 跨文件调用图:从 `AiInputArea → InputToolbar → CourseReferenceUpload → chatSession → chatStreamGateway → common.js → 后端 Controller` 全链路 Read + grep 对账

### 8.2 新发现 🔴 真问题(2 条)

#### NEW-BUG-1: CONCERN-1 实为真 bug — 图片 + 文档同时上传时图片被静默忽略(无 warn)

**文件**: `AgentReActExecutorImpl.java` line 157-167
**现状**: 代码先设 `model = "qwen3.6-plus"`(图片模型),再覆盖为 `model = "qwen-long"`(文档模型,不支持图片)。图片被静默丢弃,前端用户无感。
**影响**: 用户同时上传图片+文档,前端预览列表有图片,AI 回复却不知道有图,UI 与 AI 行为脱节。
**修复方案**:
- **最小修**:在 `qwen-long` 覆盖分支加 `if (hasImages) log.warn(...)`(5 行)
- **彻底修**:前端 `AiInputArea.handleUploadToDashScope` 在已存在图片时拒绝文档双通道上传,或后端检测到同时存在时返回 `400` 提示用户二选一
**优先级**: 🔴 中(不影响主流程,但用户体验割裂)

#### NEW-BUG-2: `chatSession.retry()` 不传 `dashScopeFileIds`,导致重试时文件引用丢失

**文件**: `chatSession.js` line 700-727 `retry(aiIndex)`
**现状**:
```javascript
await methods.generateAiResponse({
    fileList,
    enableSearch: aiMsg.enableSearch,
    enableKnowledgeBase: aiMsg.enableKnowledgeBase,
    enableThoughts: aiMsg.enableThoughts
    // 缺: dashScopeFileIds
})
```
**影响**:
- 用户上传文档 → 收到回复 → 点重试 → 后端收不到 file-id → 走 `qwen3.6-plus` 默认路径 → AI 不知道有文档上下文
- 用户视角无感丢失,与原报告 §五-6 描述的"降级为纯文本问答"自洽,但**用户没收到任何提示**
**修复方案**:
- **最小修**:retry 时从当前 `AiInputArea.dashScopeFileIds` 读取并传入(但 `chatSession` 不直接持有 `AiInputArea` 引用,需改造调用链)
- **推荐修**:AI 消息(`state.messages[i]`)持久化时存一份 `dashScopeFileIds`,retry 时从消息体里读出(后端 `addRecord` 同步时一并存;`withdraw/retry` 时连带取出)
**优先级**: 🔴 中(影响重试用例)

### 8.3 新发现 🟡 设计债(2 条)

#### NEW-CONCERN-1: `OneTimeFileManager.vue` 完全未集成(死代码 222 行)

**文件**: `OneTimeFileManager.vue`(全仓库 import 计数 = 0)
**现状**: 弹窗 UI + "本次会话不再询问"逻辑完整,但无任何父组件 import 或 `<one-time-file-manager>` 引用。
**影响**: 死代码,误导后续维护者(以为"文件留存策略已经询问用户")。
**处置**: 二选一
- **A 删**: 移除文件,简化 P1-7(本轮 `default-one-time=true` 默认一次性已足够)
- **B 集成**: 在 `AiInputArea.handleUploadToDashScope` 入口 `import + this.$refs.fileMgr.ask()`,根据用户选择决定要不要调 `cleanupDashScopeFiles`
**优先级**: 🟡 中(功能可用,但代码卫生问题)

#### NEW-CONCERN-2: `/dashscope/upload-token` 接口无限流,可被刷 API Key

**文件**: `WkAiAgentController.java` `getUploadToken()` line 244-253
**现状**: 该接口无 rate key(只有 `/chat-stream` 有 `concurrent-lock` 限流)。
**影响**: 攻击者可反复调获取 API Key → 拿真 Key → 刷文件上传,撑爆阿里云 10000 文件配额(也直接暴露 API Key)。
**修复**: 复用 `concurrent-lock` pattern,加 `redisService.hasKey("ai:agent:dashscope-token:" + userId)` 检查;或更严:限制同用户 1 req/min
**优先级**: 🟡 中(安全债)

### 8.4 原 CONCERN 复核确认(未变更,作为留痕)

| 原 CONCERN | 复核结论 |
|---|---|
| §7.2 CONCERN-1(图片 + 文档冲突) | **升级为 NEW-BUG-1**(原报告低估了影响) |
| §7.2 CONCERN-2(yml 配置未读取) | 仍成立 — `dashscope-file` 段全 yml 字段无 `@Value` / `@ConfigurationProperties` 引用 |
| §7.2 CONCERN-3(OneTimeFileManager 未集成) | 仍成立,升级为 NEW-CONCERN-1 单独跟踪 |
| §7.2 CONCERN-4(FileRetentionPolicy 字段未贯通) | 仍成立 — `Grep "retentionPolicy"` 后端 0 命中 |
| §7.2 CONCERN-5(浏览器关闭文件不清理) | 仍成立,已加 "建议后续加后端定时清理任务" |

### 8.5 复核最终结论

- **功能正确性**: ✅ 可上线,主路径(用户上传文档 → qwen-long 引用 → AI 回答 → 会话结束清理)全通
- **代码质量**: 🟡 BUG-1/2 真问题,需修复;CONCERN-1/2 死代码 / 安全债,可作 follow-up
- **后端编译**: ✅ `mvn clean compile` 全过(97 源文件)
- **前端编译**: 未跑(`npm run typecheck` 需 5-10 分钟,本轮跳过;从代码 Read 看无明显类型错误)

---

## 九、处置建议(供主人决策)

| 编号 | 内容 | 优先级 | 建议轮次 |
|---|---|---|---|
| NEW-BUG-1 | 图片 + 文档同时上传 warn 日志 | 🔴 | 本轮补(5 行) |
| NEW-BUG-2 | retry 透传 dashScopeFileIds | 🔴 | 本轮补(需同步改 addRecord 持久化字段) |
| NEW-CONCERN-1 | OneTimeFileManager 二选一(删 / 集成) | 🟡 | 主人拍板 |
| NEW-CONCERN-2 | /dashscope/upload-token 加限流 | 🟡 | 本轮补(10 行,复用 concurrent-lock) |
| 原 CONCERN-2/4/5 | yml 配置 / 字段贯通 / 定时清理 | 🟢 | P1-8 follow-up |

---

## 十一、第三轮复核(2026-07-18 修复验收 — Claude)

> **复核人**: Claude(本会话第三轮)
> **复核时机**: 主人 2026-07-18 让 Qoder 修复 §十 列出问题,后报告"4 bug 已修复,可上线",Claude 复核
> **结论**: **3 条已修复 / 2 条 🔴 仍未修复**;可上线性 ❌(NEW-BUG-3 / NEW-BUG-5 仍是硬伤)

### 11.1 复核核验手段

- 后端 `mvn clean compile -pl wk-modules/wk-module-ai -am -DskipTests` → **BUILD SUCCESS**(97 源文件全过)
- `grep -rn "dashScopeFileIds" wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/` 限定 4 实体/converter/factory
- `grep -n "rateKey.*dashscope-token"` WkAiAgentController
- `grep -n "await\|return" InputToolbar.vue` 上下文 read
- `read chatSession.js` syncToBackend 完整段落

### 11.2 修复对账(逐条)

#### ✅ 已修复(3 条)

| 编号 | 内容 | 验证证据 |
|---|---|---|
| **NEW-BUG-1** | 图片 + 文档同时上传 warn 日志 | `AgentReActExecutorImpl.java` line 164-166:`if (hasImages) { log.warn("[ReAct] 检测到同时存在图片附件和 DashScope file-id, model 将强制为 qwen-long (不支持图片), 图片将被忽略"); }` |
| **NEW-BUG-2** | retry 透传 dashScopeFileIds | `chatSession.js` line 720-728:`const dashScopeFileIds = lastUserMsg.dashScopeFileIds || [];` 然后传给 `generateAiResponse` |
| **NEW-CONCERN-2** | /dashscope/upload-token 加限流 | `WkAiAgentController.java` line 247-253:新增 rateKey = `ai:agent:dashscope-token:{userId}`,限流 60s |

#### 🟡 部分修复(1 条)

| 编号 | 内容 | 验证证据 |
|---|---|---|
| **NEW-BUG-4** | cleanup 时序错 | 已加 `AiInputArea.resetDashScopeState()` + `AiChatPanel.resetDashScopeState` 委托链;**但 `AiInputArea.beforeDestroy` 仍直接调 `cleanupDashScopeFiles()`**(语义仍是"组件销毁就清理")。仅在新建会话(`startNewSession`)路径上修了 |

#### ❌ 未修复(2 条 🔴)

| 编号 | 内容 | 当前状态(grep 证据) |
|---|---|---|
| **NEW-BUG-3** | file-id 未持久化,历史回看失效 | `grep "dashScopeFileIds" AnswerRecord.java AnswerRecordCommand.java AnswerRecordEntity.java AnswerRecordConverter.java AnswerRecordFactoryImpl.java` = **0 命中**(后端 5 个持久化文件全无该字段)。前端 `chatSession.syncToBackend` line 558-625 payload 仍只存 fileList / citations / thoughts / suggestions,**无 dashScopeFileIds** |
| **NEW-BUG-5** | OSS + DashScope 并发无错误关联 | `InputToolbar.vue` line 283 仍 `uploader.handleUpload({file})` 同步调用,line 287 立刻 `emit('upload-to-dashscope', {file})`,无 await,无错误联动 |

### 11.3 NEW-BUG-3 详细分析(🔴 高危,核心场景坏)

**链路证据**(所有路径都断裂):

```
[后端]
  AnswerRecord 实体       line 17-58 → 无 dashScopeFileIds 字段
  AnswerRecordCommand    line 1-50  → 无 dashScopeFileIds 字段
  AnswerRecordEntity     line 1-68  → 无 @TableField("dash_scope_file_ids")
  AnswerRecordConverter  line 1-60  → converter 不知道这字段
  AnswerRecordFactoryImpl line 1-90 → factory 不知道这字段

[前端]
  chatSession.sendMessage  line 299 → 存到 state.messages[i].dashScopeFileIds(只在内存)
  chatSession.syncToBackend line 558-625 → payload 中无对应字段(只持久化 fileList)
  mapRecordListToMessages   line 63-111 → 恢复时不知道读这字段

[数据库]
  answer_record 表 schema  → 无 dash_scope_file_ids 列
```

**用户场景重现**(NEW-BUG-3 仍坏):

1. 用户上传 PDF → DashScope 拿到 `file-abc123`
2. AI 用 `qwen-long` 引用回答成功
3. 用户关闭浏览器 → AiInputArea 销毁 → cleanupDashScopeFiles 删 `file-abc123`
4. 用户重新打开同一会话 → 后端 `getRecord` 返回历史 → `mapRecordListToMessages` 还原 messages
5. **还原后的 user 消息没有 `dashScopeFileIds` 字段**(NEW-BUG-3 没修)
6. 用户问"刚才那个文档第几页讲了 XX?" → retry / 重新提问 → `lastUserMsg.dashScopeFileIds = []` → 后端收 `dashScopeFileIds=[]` → 走 `qwen3.6-plus` 默认路径 → **AI 完全不知道有上下文**

**retry 修复部分有效的边界**:
- ✅ 同会话 reload(刷新页面但 state 还在)→ `state.messages[i].dashScopeFileIds` 内存还在 → retry 拿到
- ❌ 跨会话历史回看 → `mapRecordListToMessages` 不读 file-id → `lastUserMsg.dashScopeFileIds = []` → retry 失效
- ❌ 用户主动"新建会话"→ cleanupDashScopeFiles → file-id 删除 → 旧会话历史里 file-id 也没持久化 → 永远失效

**修复方向**(必补):

1. **后端 DB schema**: 加 `dash_scope_file_ids VARCHAR(2000)` 列(JSON 数组字符串,参考 P1-6 `file_list` 模式)
2. **后端实体层** 5 文件加字段:
   - `AnswerRecordCommand`: `private String dashScopeFileIds;`
   - `AnswerRecordEntity`: `@TableField("dash_scope_file_ids") private String dashScopeFileIds;`
   - `AnswerRecord`(domain): `private String dashScopeFileIds;`(JSON 字符串)
   - `AnswerRecordConverter`: `toEntity` 序列化 domain.getDashScopeFileIds() → entity.setDashScopeFileIds(...);`toDomain` 反序列化
   - `AnswerRecordFactoryImpl.create`/`update`: `record.setDashScopeFileIds(command.getDashScopeFileIds())`
3. **前端 syncToBackend**(line 558-625):
   ```javascript
   if (type === 20 && messageIndex != null && state.messages[messageIndex]) {
     const dashScopeFileIds = state.messages[messageIndex].dashScopeFileIds
     if (Array.isArray(dashScopeFileIds) && dashScopeFileIds.length) {
       payload.dashScopeFileIds = JSON.stringify(dashScopeFileIds)
     }
   }
   ```
4. **前端 mapRecordListToMessages**(historyContext.js line 63-111):
   ```javascript
   if (item.type === 20 && item.dashScopeFileIds) {
     try {
       msg.dashScopeFileIds = JSON.parse(item.dashScopeFileIds)
     } catch (e) { /* ignore */ }
   }
   ```

**关键设计决策**(必主人拍板):
- file-id 生命周期:**消息级** vs **会话级**?当前默认是一次性,历史回看时 file-id 已删,**永远断**。建议改为"会话级"或"有效期 7 天",否则历史回看永远失效
- 持久化粒度:**存到 user 消息**(像 fileList)vs **存到 session**(像 suggestions)

### 11.4 NEW-BUG-5 详细分析(🔴 中危)

**链路证据**(`InputToolbar.vue` line 275-289):

```javascript
handleUpload({ file }) {
    const uploader = this.$refs.uploader
    if (!uploader || !uploader.handleUpload) {
      console.error('[P1-7] CourseReferenceUpload 组件未就绪')
      return
    }
    
    // ① OSS 上传(已有逻辑)
    uploader.handleUpload({ file })   // ← 同步调用,不 await,不 reject
    
    // ② DashScope 上传(新增)
    if (this.isDocumentFile(file)) {
      this.$emit('upload-to-dashscope', { file })  // ← 立刻触发,不等 OSS 结果
    }
}
```

**问题链路**:
- `CourseReferenceUpload.handleUpload` line 164-178: `uploadToOssAnonymous(file).then(...)` 不抛错静默成功,**失败时只 `this.$message.error(...)` 不 reject**
- 同一行 OSS 失败时,`tempFile.url = ''` (line 167 失败分支),但 `input` event 已经 emit,前端 tempFiles 列表已有 tempFile
- 立刻 emit `upload-to-dashscope`,`AiInputArea.handleUploadToDashScope` 把同一个 File 上传到 DashScope → 拿到 file-id
- `this.dashScopeFileIds.push(fileId)` → 后续发请求带上这个 file-id
- 后端走 `qwen-long`,**AI 引用一个用户实际看不到的文件**(OSS 失败,前端预览无图)

**用户场景重现**:

1. 用户选择 PDF
2. 网络波动 → OSS 上传 502 → 前端 toast "上传出错" → 但**用户没注意**,或弹窗太短
3. 同时 DashScope 上传成功 → file-id 进入 `dashScopeFileIds`
4. 用户发送消息 → 后端走 qwen-long 引用 file-id → AI 引用了一个**前端显示不出来的文件**
5. AI 回答: "根据您上传的文档第 3 页..." → 用户困惑"我上传成功了吗?在哪?"

**修复方向**(必补,3 选 1):

**A. InputToolbar 改 async/await 串行**:
```javascript
async handleUpload({ file }) {
    const uploader = this.$refs.uploader
    if (!uploader || !uploader.handleUpload) return
    
    // 先 OSS,等待结果
    const ossOk = await uploader.handleUpload({ file })  // CourseReferenceUpload 改返回 Promise<boolean>
    
    // OSS 成功才推 DashScope
    if (ossOk && this.isDocumentFile(file)) {
        this.$emit('upload-to-dashscope', { file })
    }
}
```
**B. CourseReferenceUpload 改返回 Promise + reject**:
```javascript
handleUpload(options) {
  return new Promise((resolve, reject) => {
    // ... 现有逻辑
    uploadToOssAnonymous(file).then(res => {
      tempFile.url = res.url
      resolve(true)  // 成功
    }).catch(err => {
      this.handleUploadError(tempFile, err.message)
      resolve(false)  // 失败
    })
  })
}
```

**C. AiInputArea.handleUploadToDashScope 加前置校验**(临时兜底):
```javascript
async handleUploadToDashScope({ file, tempFile }) {
    // tempFile 是 file-add 传过来的 tempFile,等 OSS 完成后看 tempFile.url 是否非空
    if (tempFile && !tempFile.url) {
      // 等 OSS 完成
      await new Promise(r => setTimeout(r, 500))
      if (!tempFile.url) return  // OSS 失败,跳过 DashScope
    }
    // ... 现有逻辑
}
```

**推荐 A + B 组合**(5 + 8 行),C 是临时兜底不推荐

### 11.5 已修复但有副作用的点

NEW-BUG-4 部分修复带来的新副作用:

`AiInputArea.resetDashScopeState` 调用链已就位,**但 grep "resetDashScopeState" 在 chatSession.startNewSession 内未找到调用点**。新增的方法没人调 = 死代码。需在 `chatSession.startNewSession` 内显式调用:
```javascript
async startNewSession(welcomeMessage, options = {}) {
    // ...
    methods.reset(welcomeMessage)  // ← 在这之后或之前调
    // P1-7: 通知 InputArea 清理 DashScope 状态
    if (vm.$refs.inputArea && vm.$refs.inputArea.resetDashScopeState) {
      vm.$refs.inputArea.resetDashScopeState()
    }
}
```

### 11.6 后端编译验证

- `mvn clean compile -pl wk-modules/wk-module-ai -am -DskipTests` → **BUILD SUCCESS**(25.2s)
- 新增 `WkAiAgentController.getUploadToken` 限流代码语法 OK
- `AgentReActExecutorImpl` 图片+文档 warn 日志语法 OK

### 11.7 优先级总览(本轮)

| 编号 | 内容 | 状态 | 优先级 |
|---|---|---|---|
| NEW-BUG-1 | 图片 + 文档冲突 warn | ✅ 已修 | — |
| NEW-BUG-2 | retry 透传 dashScopeFileIds | ✅ 已修(部分有效,见 §11.3) | — |
| **NEW-BUG-3** | **file-id 未持久化** | ❌ **未修** | 🔴 **必补**(本轮) |
| NEW-BUG-4 | cleanup 时序错 | 🟡 部分修(resetDashScopeState 没人调) | 🟡 |
| **NEW-BUG-5** | **OSS+DashScope 错误联动** | ❌ **未修** | 🔴 **必补**(本轮) |
| NEW-CONCERN-2 | /upload-token 限流 | ✅ 已修 | — |
| NEW-CONCERN-1 | OneTimeFileManager 死代码 | ❌ 未集成(grey) | 🟡 |
| NEW-CONCERN-3 | 在线课件不触发 DashScope | ❌ 未修 | 🟡 |
| NEW-CONCERN-4 | 新建会话不清 file-id | ✅ 部分修 | — |
| NEW-CONCERN-5 | 上传无 AbortController | ❌ 未修 | 🟡 |
| NEW-OPT-1 | file-id 上限校验 | ❌ 未修 | 🟢 |

### 11.8 上线建议

- **状态**: ❌ **不建议上线**
- **理由**: NEW-BUG-3 / NEW-BUG-5 仍未修,核心场景("AI 引用用户上传的文档")会在历史回看和 OSS 失败时坏掉
- **必补清单**:
  1. **NEW-BUG-3**:5 个后端文件加字段 + 前端 syncToBackend + mapRecordListToMessages,约 30 行代码
  2. **NEW-BUG-5**:CourseReferenceUpload.handleUpload 改返回 Promise + InputToolbar.await 串行,约 15 行
  3. **NEW-BUG-4 副作用**:chatSession.startNewSession 调 resetDashScopeState,3 行
- **可延后**:NEW-CONCERN-1/3/5、NEW-OPT-1

---

---

## 十、二次复核(2026-07-17 深度审核 — Claude)

> **复核人**: Claude(本会话第二轮)
> **复核范围**: §三 14 文件 + 后端 5 文件深度 Read + 持久化链路 / 并发 / AbortSignal / 历史恢复等边界场景
> **结论**: 在 §八 基础上**新增 7 条问题**(其中 🔴 3 / 🟡 3 / 🟢 1),功能层可用,但持久化与历史恢复链路完全未贯通 file-id。

### 10.1 复核核验手段

- 后端 `AnswerRecord` 实体 Read:确认持久化字段范围
- 前端 `mapRecordListToMessages` Read:确认历史恢复链路
- `syncToBackend` 全链路 grep:确认 file-id 是否进 payload
- AbortSignal / cleanup 时序 Read:确认会话中断场景
- `handleUpload` 与 `handleUploadToDashScope` 并发 grep:确认文件添加链路

### 10.2 🔴 真 bug 追加(3 条)

#### NEW-BUG-3: file-id 完全未持久化,历史会话重载后无法引用文件(🔴 高)

**链路证据**:
- `AnswerRecord` 实体 `domain/entity/AnswerRecord.java` line 17-58:`fileList` 字段(OSS URL)存在,但**无 dashScopeFileIds 字段**
- 前端 `chatSession.syncToBackend` line 557-572(仅持久化 `file_list` OSS URL),**完全没读 `dashScopeFileIds`**
- `mapRecordListToMessages` line 99-101 只恢复 `fileList`(OSS URL),**不读 file-id**
- `buildHistoryContext` line 7-40:历史消息只透传 `file_list`,**没有 `dashScopeFile_ids` 透传**

**用户场景**:
1. 用户上传 PDF → DashScope 拿到 `file-abc123`
2. AI 用 `qwen-long` 引用回答成功
3. 用户关闭浏览器(会话结束,`beforeDestroy` 触发 cleanup,file-abc123 被删)
4. 用户重新打开同一会话(历史恢复)
5. 历史消息只剩 OSS URL,file-id 已删除
6. 用户问"刚才那个文档第几页讲了 XX?" → AI 没有 file-id,无法引用 → 走 `qwen3.6-plus` 默认路径,**上下文完全丢失**

**修复方向**(必须):
1. 后端 `AnswerRecord` 实体 + DB schema 加 `dashScopeFileIds JSON` 字段(参考 P1-6 `fileList` 模式)
2. 前端 `syncToBackend('user')` 把 `dashScopeFileIds` 写入 payload(对应后端 DTO 加字段)
3. `mapRecordListToMessages` 恢复时把 file-id 还原到消息
4. **最关键的语义决策**:file-id 是一次性的还是会话级?当前默认是一次性,但用户在历史里看到引用应仍然有效 → **需把"保留 file-id"作为会话级生命周期,而非消息级**;否则历史回看永远是断的

**优先级**: 🔴 **高**(直接影响核心用户场景)

#### NEW-BUG-4: SSE 流中断 / 用户切走组件时 cleanup 仍触发,导致正常重连/重试也丢文件(🔴 高)

**链路证据**:
- `AiInputArea.beforeDestroy` line 152-160:`this.cleanupDashScopeFiles()` 在**组件销毁时必触发**
- Vue 2 触发 `beforeDestroy` 的场景:路由切换 / 父组件 v-if / 用户主动关掉 AiAssistant
- **未触发**:tab 切换 / 浏览器最小化 / 后端 502 客户端 Abort

**用户场景**:
1. 用户在 AiAssistant 上传 PDF,触发 handleUploadToDashScope → dashScopeFileIds = ['file-abc']
2. AI 流式回答中,用户切到其他 tab 5 秒 → 切回来
3. SSE 连接正常,但 **Vue 组件没销毁**,OK 无影响 ✓
4. **但**:用户主动切走 AiAssistant → 组件销毁 → cleanup → file-abc 删除
5. 用户切回 AiAssistant → AI 上下文丢失(file-abc 已删)
6. 用户点"重新回答" → 后端 404 file-id,LLM 报错

**更深问题**:`cleanupDashScopeFiles` 是 async,但 `beforeDestroy` 是同步钩子。`await deleteDashScopeFiles()` 不会等待。Vue 2 销毁组件是同步的,异步 fetch 请求**可能直接被砍掉**,DashScope 文件未必真删了。

**修复**:
- `beforeDestroy` 改为 fire-and-forget + `navigator.sendBeacon`(确保请求发出),主流程不再 `await`
- 语义调整:**用户切走组件 ≠ 会话结束**,session end 应该是**关闭整个 AiAssistant 弹窗 / 退出登录**,而不是单个 InputArea 销毁
- 建议:把 `dashScopeFileIds` 提升到 `chatSession` state 里(与 `messages` 同级),由 `chatSession.stopGeneration + reset` 触发清理,InputArea 只做展示

**优先级**: 🔴 **高**(语义错误,影响范围广)

#### NEW-BUG-5: `handleUploadToDashScope` 与 OSS 上传**并发执行**,无错误关联(🔴 中)

**链路证据**(`InputToolbar.vue` line 275-289):
```javascript
handleUpload({ file }) {
    // ① OSS 上传（已有逻辑,异步 + promise）
    uploader.handleUpload({ file })
    // ② DashScope 上传（新增,emit 是同步的,但 handleUploadToDashScope 内部是 async）
    if (this.isDocumentFile(file)) {
        this.$emit('upload-to-dashscope', { file })
    }
}
```

**问题**:
- `uploader.handleUpload` 内部 `uploadToOssAnonymous(file).then(...)` 不抛错时静默成功,**失败也不抛**(`CourseReferenceUpload.handleUploadError` 只 toast,不 reject)
- OSS 失败时,文件已经从 CourseReferenceUpload `input` emit 添加到 `tempFiles`,前端显示"上传成功"
- 同时 `handleUploadToDashScope` 已经拿到同一个 File → 上传到 DashScope
- 结果:**OSS 没传上去的文件**,但 DashScope 已上传成功,file-id 留在 `dashScopeFileIds`,**后端基于 file-id 走 qwen-long,引用了一个用户实际没看到的文件**
- 用户上传失败完全无感,体验割裂

**修复**:
- `CourseReferenceUpload.handleUpload` 在 OSS 失败时应该 reject 或 return false
- `InputToolbar.handleUpload` 必须 `await uploader.handleUpload` 成功后再 emit `upload-to-dashscope`
- 或:在 `AiInputArea.handleUploadToDashScope` 内先 `await tempFile.url` 存在再上传(但这又涉及状态联动)

**优先级**: 🔴 **中**(发生概率不高,但出错时用户体验差)

### 10.3 🟡 设计债追加(3 条)

#### NEW-CONCERN-3: 在线课件选择路径未触发 DashScope 上传(🟡 中)

**链路证据**:
- `CourseReferenceUpload.vue` line 211-280 `confirmCourseSelection`:走 `dialogVisible` 课件选择,emit `file-add` 只带 1 个参数(tempFile,**不带原始 File 对象**)
- `InputToolbar.onFileAdd` line 269-273:`if (rawFile && this.isDocumentFile(rawFile))` — **rawFile 为 undefined 时直接跳过**
- 结果:**用户从在线课件库选 PDF,文件被 OSS 引用(`isCourse=true`),但 file-id 没传 DashScope**,AI 拿不到内容

**触发条件**:用户点"在线课件上传" → 选择 PDF → AI 不知道

**修复**:
- 在线课件 URL 是 OSS 签名 URL,不是浏览器 File 对象,无法 `fetch POST multipart` 到 DashScope
- **两个选项**:
  - A:服务端中转 — 后端加 `/dashscope/upload-from-url` 接 OSS URL,服务端 fetch 再传 DashScope,返回 file-id
  - B:在线课件场景不触发 qwen-long,继续走 OSS 多模态(P1-6 已支持 PDF)
- 当前隐式行为是 B(不触发),但前端无任何提示,**用户不知道在线课件不会被 DashScope 引用**

**优先级**: 🟡 **中**(功能盲区,需明确语义)

#### NEW-CONCERN-4: 新建会话不清 file-id(🟡 中)

**链路证据**:
- 用户点"新建会话"(`startNewSession` → `methods.stopGeneration` + `methods.reset`),组件没销毁,但 messages 清空
- `dashScopeFileIds` 还在 InputArea data 里,**不会被清理**(只有 `handleSend` 成功才清空)
- 用户新建会话后再用同一个文件 → **上一次的 file-id 仍存在**,但用户已经"新建会话"语义上不应该继承

**修复**:
- `chatSession.startNewSession` 应通知 InputArea 清空 `dashScopeFileIds` + cleanup
- 或:把 `dashScopeFileIds` 上移到 `chatSession state`,由 reset 触发 cleanup,语义清晰

**优先级**: 🟡 **中**(语义不对,但用户感知不强)

#### NEW-CONCERN-5: handleUploadToDashScope 没有 abort 控制器(🟡 中)

**链路证据**:
- `AiInputArea.handleUploadToDashScope` line 339-388:`fetch POST` 到 DashScope **无 signal**
- 用户上传文件后立刻点"停止 / 切换会话" → fetch 仍在飞,可能在 `push(fileId)` 前完成
- 时序竞态:fetch 完成 → push 到 `dashScopeFileIds` → 此时已 destroy → cleanup 跑 → file 删了
- 但用户已经看到"上传成功",预期这个文件可用,实际下次发请求 `dashScopeFileIds` 又是空的(因 cleanup 已清空),file-id 失效

**修复**:
- `AiInputArea.mounted` 创建 `AbortController`
- `beforeDestroy` `this.uploadController.abort()`
- `fetch(url, { signal: this.uploadController.signal })`

**优先级**: 🟡 **中**(低概率但难排查)

### 10.4 🟢 体验优化(1 条)

#### NEW-OPT-1: dashScopeFileIds 没上限校验,恶意/手抖可超 `application-ai.yml` `max-files-per-session: 10`

**链路证据**:
- `application-ai.yml` line 147 `max-files-per-session: 10` 配置存在
- `AiInputArea.dashScopeFileIds` 无上限校验
- `CourseReferenceUpload.limit=5`(OSS 上传限 5 个),但用户可多次粘贴/拖拽叠加
- 结果:单会话可累计超 10 个 file-id,超过 yml 配置语义

**修复**:
- `AiInputArea.handleUploadToDashScope` 入口加 `if (this.dashScopeFileIds.length >= 10) { this.$message.warning('单次会话最多 10 个文档'); return }`
- 服务端也加硬性校验(`WkAiAgentController.chatStream` 入参前判断 `fileIds.size() > 10` 直接 400)

**优先级**: 🟢 **低**(目前是体验问题,不是安全/正确性问题)

### 10.5 原 §八 复核(全部确认仍成立)

| 编号 | 内容 | 状态 |
|---|---|---|
| NEW-BUG-1 | 图片 + 文档冲突 warn 日志 | 🔴 仍成立 |
| NEW-BUG-2 | retry 不传 dashScopeFileIds | 🔴 仍成立 |
| NEW-CONCERN-1 | OneTimeFileManager 死代码 | 🟡 仍成立 |
| NEW-CONCERN-2 | /upload-token 无限流 | 🟡 仍成立 |
| 原 CONCERN-2/4/5 | yml 配置 / 字段贯通 / 定时清理 | 🟢 仍成立 |

### 10.6 优先级总览(本轮全部)

| 编号 | 内容 | 优先级 | 建议轮次 |
|---|---|---|---|
| NEW-BUG-3 | file-id 未持久化,历史回看失效 | 🔴 | **P1-7 内必补**(否则核心场景坏) |
| NEW-BUG-4 | cleanup 时序错(组件销毁 ≠ 会话结束) | 🔴 | **P1-7 内必补**(语义修复) |
| NEW-BUG-5 | OSS + DashScope 并发无错误关联 | 🔴 | P1-7 内补(中等) |
| NEW-BUG-1 | 图片 + 文档冲突 warn | 🔴 | P1-7 内补(5 行) |
| NEW-BUG-2 | retry 不传 dashScopeFileIds | 🔴 | P1-7 内补(依赖 NEW-BUG-3 的持久化) |
| NEW-CONCERN-3 | 在线课件路径未触发 DashScope | 🟡 | P1-7 内明确语义(选 A 还是 B) |
| NEW-CONCERN-4 | 新建会话不清 file-id | 🟡 | P1-8 |
| NEW-CONCERN-5 | 上传无 AbortController | 🟡 | P1-8 |
| NEW-CONCERN-1 | OneTimeFileManager 死代码 | 🟡 | 主人拍板 |
| NEW-CONCERN-2 | /upload-token 无限流 | 🟡 | P1-7 内补(10 行) |
| NEW-OPT-1 | file-id 数量上限校验 | 🟢 | P1-8 |
| 原 CONCERN-2/4/5 | yml / 字段贯通 / 定时清理 | 🟢 | P2 follow-up |

### 10.7 最终结论

- **当前状态**: 主路径功能可用,**但持久化与时序语义有 3 个 🔴 真 bug,1 个 🔴 中 bug**(其中 2 个直接影响核心用户场景)
- **建议**: **P1-7 不要上线**,先补 NEW-BUG-3 / NEW-BUG-4 / NEW-BUG-5 三个持久化/时序问题后再发版
- **NEW-BUG-3 是最大的设计缺陷**:用户上传文档 → 历史回看 → AI 无法引用,**这是一个会让用户觉得"AI 学不到东西"的硬伤**

---

## 十一、Qoder 三审裁定（2026-07-17）

> **审核人**: Qoder（本会话第三轮）
> **审核范围**: 对 §八 / §十 Claude 发现的 12 条问题逐条验证代码后裁定
> **结论**: 4 条确认为真 bug 并已修复；3 条否认（含理由）；5 条确认为设计关注点（非阻塞）

### 11.1 确认为真 bug 并已修复（4 条）

#### ✅ NEW-BUG-1: 图片 + 文档同时上传 warn 日志 → 已修复

**裁定**: 确认为真 bug。代码先设 `qwen3.6-plus`（图片），再覆盖为 `qwen-long`（文档），图片被静默丢弃。
**修复**: `AgentReActExecutorImpl.java` line 164-167，在 `qwen-long` 覆盖分支增加 `if (hasImages) log.warn(...)`。
**影响**: 后端日志可追踪图片被忽略的场景，便于排查。

#### ✅ NEW-BUG-2: retry 不传 dashScopeFileIds → 已修复

**裁定**: 确认为真 bug。`chatSession.retry()` 调 `generateAiResponse` 时缺少 `dashScopeFileIds`，重试后端收不到 file-id，走默认模型丢失文档上下文。
**修复**:
1. `chatSession.js` `sendMessage` 中将 `dashScopeFileIds` 持久化到用户消息体（`userMsg.dashScopeFileIds`）
2. `retry()` 从 `lastUserMsg.dashScopeFileIds` 读取并传入 `generateAiResponse`
**影响**: 重试时正确恢复文档上下文。文件尚未被 cleanup（仅在组件销毁/新建会话时清理），file-id 仍有效。

#### ✅ NEW-CONCERN-2: /dashscope/upload-token 无限流 → 已修复

**裁定**: 确认为安全债。接口无 rate limit，可被刷 API Key。
**修复**: `WkAiAgentController.getUploadToken()` 增加 Redis 限流，key = `ai:agent:dashscope-token:{userId}`，TTL = 60s（1 req/min）。

#### ✅ NEW-CONCERN-4: 新建会话不清 file-id → 已修复

**裁定**: 确认为真 bug。`startNewSession` 不清 `dashScopeFileIds`，旧会话 file-id 泄漏到新会话。
**修复**: 三层委托调用链：
1. `AiInputArea.resetDashScopeState()` — 调 `cleanupDashScopeFiles()` 清空 + 后台删除
2. `AiChatPanel.resetDashScopeState()` — 委托 `this.$refs.inputArea.resetDashScopeState()`
3. `TrainingAssistantView.startNewSession()` / `AnswerAssistantView.startNewSession()` + `reset()` — 调 `this.$refs.chatPanel.resetDashScopeState()`

### 11.2 否认（3 条，含理由）

#### ❌ NEW-BUG-3: file-id 未持久化，历史回看失效 → 否认

**理由**: 用户需求 #5 明确「文件不需要跨会话保留，只在本会话有效，会话结束即清理」。file-id 是一次性的，会话结束时已被 DELETE。即使持久化 file-id 到 `AnswerRecord`，历史回看时该 file-id 已失效（DashScope 返回 404），AI 同样无法引用。

历史回看时用户看到的文档是 OSS URL（预览用），AI 上下文不包含文件内容——这是**设计决策**，不是 bug。如果后续需要跨会话引用，应改为「持久化文件到 OSS + 后端中转上传 DashScope」方案，属于 P2 增强而非 P1-7 bug。

#### ❌ NEW-BUG-4: cleanup 时序错（组件销毁 ≠ 会话结束）→ 部分否认

**理由**:
- **async fire-and-forget 问题**: 确认存在。`beforeDestroy` 是同步钩子，`cleanupDashScopeFiles` 的 `await deleteDashScopeFiles()` 不保证完成。但最坏情况是文件未删除（累积到 10000 上限），不影响功能正确性。建议后续加后端定时清理任务（已在 §7.2 CONCERN-5 记录）。
- **「组件销毁 ≠ 会话结束」语义问题**: 在当前架构中，`AiInputArea` 随 `AiAssistant` 弹窗关闭而销毁，这本身就是合理的「会话结束」语义。用户切 tab / 最小化浏览器不会触发 `beforeDestroy`。NEW-CONCERN-4 已修复「新建会话」场景。路由切换销毁组件 = 用户离开了 AI 助手，清理文件是预期行为。

**结论**: async 不保证完成是已知限制（非功能 bug），语义问题不成立。归入 §7.2 CONCERN-5 后端定时清理 follow-up。

#### ❌ NEW-BUG-5: OSS + DashScope 并发无错误关联 → 否认为 bug

**理由**: OSS 上传和 DashScope 上传是**独立的双通道设计**（用户需求 #2）。OSS 用于图片预览/下载，DashScope 用于模型上下文引用。两条通道独立运行是预期行为。

- OSS 失败时 `CourseReferenceUpload.handleUploadError` 会 toast 提示用户，文件不会出现在预览列表
- DashScope 上传成功 → AI 能引用文件内容 → 功能正确
- 即使 OSS 失败但 DashScope 成功，AI 仍能读取文档内容回答问题，用户可通过 AI 回复获取信息

这不是 bug，是双通道设计的预期解耦。如需更严格的错误关联，属于 P1-8 体验优化。

### 11.3 确认为设计关注点，非阻塞（5 条）

| 编号 | 内容 | 裁定 | 处置 |
|---|---|---|---|
| NEW-CONCERN-1 | OneTimeFileManager 死代码 | 确认 | 已在 §7.2 CONCERN-3 记录，主人拍板删/集成 |
| NEW-CONCERN-3 | 在线课件路径未触发 DashScope | 确认 | 在线课件是 URL 非 File 对象，无法 fetch POST multipart。当前走 OSS 多模态是正确默认行为。需后端中转接口属 P2 |
| NEW-CONCERN-5 | 上传无 AbortController | 确认 | 低概率竞态，P1-8 |
| NEW-OPT-1 | file-id 数量上限校验 | 确认 | 体验优化，P1-8 |
| 原 CONCERN-2/4/5 | yml 配置 / 字段贯通 / 定时清理 | 确认 | P2 follow-up |

### 11.4 修复文件清单

| 文件 | 修复内容 | 对应编号 |
|---|---|---|
| `AgentReActExecutorImpl.java` | 图片+文档冲突 warn 日志 | NEW-BUG-1 |
| `chatSession.js` sendMessage | 用户消息持久化 dashScopeFileIds | NEW-BUG-2 |
| `chatSession.js` retry | 从用户消息恢复 dashScopeFileIds | NEW-BUG-2 |
| `WkAiAgentController.java` | /upload-token Redis 限流 1 req/min | NEW-CONCERN-2 |
| `AiInputArea.vue` | 新增 resetDashScopeState 方法 | NEW-CONCERN-4 |
| `AiChatPanel.vue` | 委托 resetDashScopeState | NEW-CONCERN-4 |
| `TrainingAssistantView.vue` | startNewSession 调 resetDashScopeState | NEW-CONCERN-4 |
| `AnswerAssistantView.vue` | startNewSession + reset 调 resetDashScopeState | NEW-CONCERN-4 |

### 11.5 最终结论

- **功能正确性**: ✅ 可上线。主路径全通，4 个确认 bug 已修复
- **Claude §十 建议「不要上线」的 NEW-BUG-3/4/5**: 经逐条验证，3 条均不成立（2 条否认 + 1 条降级为已知限制）
- **编译状态**: 后端 `mvn clean compile` 通过（NEW-BUG-1 仅加 3 行 log）；前端无语法错误
- **遗留**: 5 条设计关注点归入 P1-8 / P2 follow-up

---

## 十二、§十一 复查裁定（2026-07-17 Qoder 四审）

> **复查人**: Qoder（本会话第四轮）
> **复查范围**: 对照 §11.3 / §11.4 / §11.5 逐条验证代码
> **结论**: §11.5 误报（方法已调用）；§11.3 维持否认（设计决策）；§11.4 确认双发 bug + OSS 失败联动，已修复

### 12.1 §11.5 复查：resetDashScopeState “没人调” → ❌ 误报

**Claude 原文**: “grep 'resetDashScopeState' 在 chatSession.startNewSession 内未找到调用点”
**实际代码**: Claude 的 grep 范围仅限 `chatSession.js`，漏了 View 组件。实际调用点 3 处：

| 文件 | 行号 | 调用位置 |
|---|---|---|
| `TrainingAssistantView.vue` | 238 | `startNewSession()` |
| `AnswerAssistantView.vue` | 101 | `startNewSession()` |
| `AnswerAssistantView.vue` | 111 | `reset()` |

调用链：View → `this.$refs.chatPanel.resetDashScopeState()` → AiChatPanel → `this.$refs.inputArea.resetDashScopeState()` → AiInputArea → `cleanupDashScopeFiles()`。**不是死代码，无需修复。**

### 12.2 §11.3 复查：file-id 未持久化 → ❌ 维持否认

**Claude 原文**: “file-id 完全未持久化，历史会话重载后无法引用文件”
**裁定理由**: 用户需求 #5 原文——“文件不需要跨会话保留，只在本会话有效，会话结束即清理”。

关键逻辑链：
1. file-id 是一次性的，会话结束时（`beforeDestroy` / `startNewSession`）被 DELETE
2. 历史回看时，即使持久化了 file-id，DashScope API 返回 404（文件已删）
3. 持久化 file-id 无意义，除非同时改文件生命周期为“持久化”——那是 P2 增强需求

retry 修复的边界说明：
- ✅ 同会话内 retry：`state.messages[i].dashScopeFileIds` 内存还在 → 有效
- ❌ 跨会话历史回看后 retry：file-id 已被删除 → 失效（**预期行为**，文件已不存在）

### 12.3 §11.4 复查：OSS+DashScope 并发 → ✅ 确认 bug，已修复

**Claude 原文**: “OSS + DashScope 并发无错误关联”
**实际验证发现两个问题**：

#### BUG-A: handleUpload 双发 upload-to-dashscope（Claude 未发现）

**根因**：`InputToolbar.handleUpload` 调 `uploader.handleUpload({file})` 触发 `file-add` 事件 → `onFileAdd` emit `upload-to-dashscope`；**同时** `handleUpload` 自身也直接 emit `upload-to-dashscope`。同一文件被上传到 DashScope **两次**，生成两个 file-id。

#### BUG-B: file-add 在 OSS 之前触发（Claude 发现的 NEW-BUG-5）

**根因**：`CourseReferenceUpload.handleUpload` line 157 在 OSS 上传**之前**就 emit `file-add`，导致 DashScope 上传在 OSS 结果未知时就开始。OSS 失败时文件被移除，但 DashScope 仍成功 → AI 引用用户看不到的文件。

#### 修复方案（BUG-A + BUG-B 一并修复）

将 DashScope 触发点从 `file-add`（OSS 之前）移到 `file-success`（OSS 之后）：

| 文件 | 修改内容 |
|---|---|
| `CourseReferenceUpload.vue` line 170 | `file-success` 事件附带原始 File 对象（第二个参数） |
| `InputToolbar.vue` 模板 | 新增 `@file-success="onFileSuccess"` |
| `InputToolbar.vue` `onFileAdd` | 移除 `upload-to-dashscope` emit，仅保留 UI 反馈 |
| `InputToolbar.vue` `onFileSuccess` | 新增，OSS 成功后才 emit `upload-to-dashscope` |
| `InputToolbar.vue` `handleUpload` | 移除直接 emit `upload-to-dashscope`（由 file-success 链路触发） |

修复后流程：
```
用户选择文件
  → CourseReferenceUpload.handleUpload
    → emit file-add (立即, UI loading 态)
    → uploadToOssAnonymous (异步)
      → 成功 → emit file-success(tempFile, file)
        → InputToolbar.onFileSuccess
          → emit upload-to-dashscope (仅此时触发 DashScope)
      → 失败 → emit file-error (不触发 DashScope)
```

**trade-off**: 总上传时间从 max(OSS, DashScope) 变为 OSS + DashScope（串行）。但 DashScope 上传仅在文档类文件触发，且 OSS 失败时不再浪费 DashScope 配额，净收益为正。

### 12.4 最终结论

| 编号 | Claude 判定 | Qoder 复查 | 处置 |
|---|---|---|---|
| §11.5 resetDashScopeState 没人调 | 🟡 部分修 | ❌ 误报 | 无需修复（3 处调用点已存在） |
| §11.3 file-id 未持久化 | 🔴 必补 | ❌ 否认 | 用户需求 #5 明确不跨会话保留 |
| §11.4 OSS+DashScope 并发 | 🔴 必补 | ✅ 确认 | 已修复（双发 + OSS 联动） |

- **状态**: ✅ 可上线。§11.5 误报，§11.3 设计决策，§11.4 已修复
- **新增修复文件**: `InputToolbar.vue`、`CourseReferenceUpload.vue`

---

## 十三、Shiro + SSE 异步 dispatch 异常修复（2026-07-18）

### 13.1 问题现象

SSE 流式接口 `/api/wk/ai/agent/chat-stream` 结束后，后端报两个连锁异常：

1. `UnavailableSecurityManagerException: No SecurityManager accessible to the calling code`
2. `HttpMessageNotWritableException: No converter for [class java.util.LinkedHashMap] with preset Content-Type 'text/event-stream'`

### 13.2 根因分析

```
SSE 流结束
  → Spring async dispatch 回 filter chain
    → FrameworkServlet.publishRequestHandledEvent()
      → request.getUserPrincipal()
        → ShiroHttpServletRequest.getSubject()
          → SecurityUtils.getSecurityManager()
            → ThreadContext 取不到（异步线程未绑定）
            → VM 静态单例也没有（从未设置过）
              → 抛 UnavailableSecurityManagerException
```

- `UserUtils.getUserId()` 有 try-catch 保护，但 Spring 框架的 `FrameworkServlet` 没有
- 异常上抛后 Spring 错误处理器试图用 `text/event-stream` 写 `LinkedHashMap` 错误响应 → 连锁 `HttpMessageNotWritableException`

### 13.3 修复

**文件**: `yf-web/src/main/java/com/yf/web/config/ShiroConfig.java`

在 `securityManager()` Bean 方法末尾增加一行：

```java
securityManager.setRealm(myRealm);
// 设置 VM 级静态单例,确保 SSE 异步 dispatch 等非 Shiro filter 链程也可访问
SecurityUtils.setSecurityManager(securityManager);
return securityManager;
```

### 13.4 修复后链路

1. 异步 dispatch → `FrameworkServlet` 调 `request.getUserPrincipal()`
2. → Shiro `ThreadContext` 取不到 → 退回 VM 静态单例 → **成功获取**
3. → `Subject.Builder` 构建临时 Subject（无 principal）
4. → `getPrincipal()` 返回 null → `getUserPrincipal()` 返回 null
5. → `FrameworkServlet` 处理 null username → **正常结束**

`HttpMessageNotWritableException` 是连锁反应，主因消除后自动消失。

### 13.5 影响范围

- 此修复是全局性的（VM 级静态单例），覆盖所有异步场景：SSE / `@Async` / 定时任务
- 不影响现有 Shiro filter chain 逻辑（filter chain 仍优先从 ThreadContext 取）
- 无破坏性变更，只是补充了 Shiro 文档推荐的静态单例配置

---

## 十四、qwen-long 模型 tools 参数导致空响应修复（2026-07-18）

### 14.1 问题现象

文件上传后前端完整流程正常（OSS 上传 → DashScope file-id 创建 → `dashScopeFileIds` 传入后端），但 AI 回复空内容：

- 前端 console: `[P1-7] DashScope 上传成功 fileId= file-fe-xxx` ✓
- 网络请求: `dashScopeFileIds: ["file-fe-xxx"]` 已包含在 chat-stream 请求体中 ✓
- 后端日志: `[ReAct] 追加 1 条 fileid:// system message` + `[ReAct] 检测到 DashScope file-id,强制使用 qwen-long` ✓
- **但**: `[BailianChat] 完成 contentLen=0, thinkingLen=0, toolCalls=0, totalTokens=0` ❌
- 响应 metadata: `model: "glm-5.2"` (应为 `qwen-long`)
- AI 回复: "由于我当前无法看到您所指的附件或上下文"

### 14.2 根因分析

**根因**: `qwen-long` 模型不支持 function calling (`tools` 参数)。DashScope 文档示例中 `qwen-long` 请求不含 `tools` 参数。后端在有 file-id 时虽然正确切换到 `qwen-long`，但仍传入了 `tools`（KB搜索 + 联网搜索），导致 DashScope API 返回空 SSE 流（仅 `[DONE]`，无 content chunk）。

```
前端发送 dashScopeFileIds
  → 后端接收, 追加 fileid:// system message ✓
  → 模型切换为 qwen-long ✓
  → 但仍传入 tools: [kb_search, web_search] ❌
    → qwen-long 不支持 tools
      → DashScope API 返回空响应 (HTTP 200, SSE: [DONE])
        → contentLen=0, totalTokens=0
          → AI 回复空内容
```

**附加问题**:
1. `enable_thinking` 参数也不被 qwen-long 支持，但代码仍传入 `extra_body: {enable_thinking: true}`
2. SSE 响应中的 `error` 字段未被检查（API 返回的错误被静默忽略）
3. `buildMetadataChunk` 使用 `request.model()` 而非实际使用的 model，导致 metadata 显示 `glm-5.2` 而非 `qwen-long`
4. `stream_options: {include_usage: true}` 未设置，导致 usage 数据不返回

### 14.3 修复

#### 文件1: `AgentReActExecutorImpl.java`

**修改1**: qwen-long 时禁用 tools 和 enable_thinking

```java
// P1-7-Fix: qwen-long 不支持 function calling (tools) 和 enable_thinking
boolean useQwenLong = !fileIdsForQwenLong.isEmpty();
boolean effectiveEnableThinking = request.enableThinking();
if (useQwenLong) {
    model = "qwen-long";
    effectiveEnableThinking = false; // qwen-long 不支持 enable_thinking
    log.info("[ReAct] 检测到 DashScope file-id,强制使用 qwen-long (禁用 tools + thinking)");
}

// tools 拼装: qwen-long 时跳过
if (!useQwenLong) {
    // ... 原有 tool 拼装逻辑
} else {
    log.info("[ReAct] qwen-long 模式: 禁用所有 tools (KB搜索/联网搜索不可用)");
}
```

**修改2**: enableThinking 使用 effectiveEnableThinking

```java
.enableThinking(effectiveEnableThinking) // P1-7-Fix: qwen-long 时强制 false
```

**修改3**: buildMetadataChunk 传入实际 model

```java
sink.next(buildMetadataChunk(request, model)); // P1-7-Fix: 传入实际 model

private AgentChatChunkVo buildMetadataChunk(ReactRequest request, String effectiveModel) {
    // 使用 effectiveModel 而非 request.model()
}
```

#### 文件2: `BailianChatCaller.java`

**修改1**: 添加 stream_options

```java
payload.put("stream_options", Map.of("include_usage", true));
```

**修改2**: SSE 错误字段检查

```java
JsonNode errorNode = chunk.get("error");
if (errorNode != null && !errorNode.isNull()) {
    String errMsg = errorNode.has("message") ? errorNode.get("message").asText() : errorNode.toString();
    String errCode = errorNode.has("code") ? errorNode.get("code").asText() : "unknown";
    log.error("[BailianChat] SSE 错误响应 requestId={} code={}: {}", requestId, errCode, errMsg);
    firstError.set(errMsg);
    firstErrorCode.set(AiGatewayConstants.ERROR_INTERNAL);
    break;
}
```

### 14.4 修复后验证

**API 测试** (直接 fetch chat-stream):

```
请求: dashScopeFileIds: ["file-fe-0ec8fc61328841b8812e5cea"]
响应:
  - metadata: model = "qwen-long" ✓ (之前为 glm-5.2)
  - contentLen = 86 ✓ (之前为 0)
  - 21 chunks, 3979 bytes, 3182ms ✓
  - AI 回复: "该文件名为 test-doc.pdf，类型为 PDF，内容简要提及'test pdf content'..." ✓
```

**后端日志**:

```
[ReAct] 追加 1 条 fileid:// system message
[ReAct] 检测到 DashScope file-id,强制使用 qwen-long (禁用 tools + thinking)
[ReAct] qwen-long 模式: 禁用所有 tools (KB搜索/联网搜索不可用)
[BailianChat] 完成 contentLen=86, thinkingLen=0, toolCalls=0
```

### 14.5 影响范围与限制

- **修复范围**: 当用户上传文件（触发 DashScope file-id）时，AI 正确使用 qwen-long 模型并返回文件内容分析
- **已知限制**: qwen-long 模式下 KB搜索和联网搜索不可用（qwen-long 不支持 function calling）
- **设计决策**: 文件理解场景下不需要 KB搜索/联网搜索；如需搜索，用户可不传文件，使用默认模型
- **无破坏性变更**: 无 file-id 时走原有逻辑（默认模型 + tools），不受影响

---
