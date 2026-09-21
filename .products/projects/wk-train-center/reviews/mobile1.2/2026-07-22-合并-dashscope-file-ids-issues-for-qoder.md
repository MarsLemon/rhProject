# 合并 dashScopeFileIds 到 fileList — Plan Review (Claude → Qoder)

> **目标读者**: Qoder(按此清单改 plan)
> **评审对象**: [.qoder/plans/合并_dashScopeFileIds_到_fileList_47b0e4b4.md](../../.qoder/plans/合并_dashScopeFileIds_到_fileList_47b0e4b4.md)
> **评审结论**: 方向正确,但 5 处致命/重要缺陷,**不能直接派工**
> **评审日期**: 2026-07-22

---

## TL;DR

| 缺陷 | 严重度 | 必须修? |
|---|---|---|
| wk-mhc-mobile 完全漏掉 | 🔴 致命 | ✅ |
| DTO 顶层 vs MessageItem 嵌套的 `dashScopeFileIds` 处置模糊 | 🔴 致命 | ✅ |
| FileItem.role 语义模糊(plan 1.1) | 🟡 重要 | ✅ |
| 历史 chatHistory JSON 没写迁移方案 | 🟡 重要 | ✅ |
| wk-train-center-ui-v3 没纳入排查 | 🟡 重要 | ✅ |
| 风险表提到的 AnswerAssistantView:88 bug | ✅ 真实 | 保留 |

---

## 🔴 #1 wk-mhc-mobile 完全漏掉(致命)

**证据**: grep `dashScopeFileIds` 在 mobile 项目命中 4 个关键文件:

| 文件 | 行 | 角色 |
|---|---|---|
| `wk-mhc-mobile/src/pages/smart-training/composables/ai/useChatSession.ts` | 531, 576, 673, 740, 935-944 | sendMessage / retry / history load |
| `wk-mhc-mobile/src/pages/smart-training/composables/ai/chatStreamGateway.ts` | 148-149 | buildStreamParams |
| `wk-mhc-mobile/src/pages/smart-training/composables/ai/types.ts` | 45, 184, 205 | TS 类型 |
| `wk-mhc-mobile/src/pages/smart-training/api/ai/common.ts` | 1125-1126 | 顶层 payload 构造 |

**后果**: web 端合并后,DTO 已删 `dashScopeFileIds` 字段,mobile 端发请求仍带 → 反序列化忽略该字段 → mobile 用户上传文档丢 file-id → AI 看不到文件内容。**等于 web 改完白改**。

**修复要求**: Phase 4/5 拆出独立的 wk-mhc-mobile 子阶段,覆盖上述 4 文件 + types.ts 第 935-944 行历史加载(fileList → ChatFileItem[] 转换逻辑)。

参考 [v2_AI网关移动端收尾清点_2026-07-19.md](../../.qoder/plans/v2_AI网关移动端收尾清点_2026-07-19.md) 里的 mobile 端结构。

---

## 🔴 #2 DTO 嵌套字段处置未明确(致命)

[AgentChatRequestDto.java](../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/model/AgentChatRequestDto.java) 当前 **3 处**都有 `dashScopeFileIds`:

| 行 | 字段 | 当前用法 |
|---|---|---|
| L92 | 顶层 `dashScopeFileIds` | 顶层附件 |
| L119 | `MessageItem.dashScopeFileIds` | 单条 user message 内 |

controller 走 MessageItem 优先 ([WkAiAgentController.java:163](../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk\traincenter\ai\controller\WkAiAgentController.java) 注释 + [extractDashScopeFileIds() L367](../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk\traincenter\ai\controller\WkAiAgentController.java))。

**plan Phase 2.1 只说"AgentChatRequestDto 顶层和 MessageItem 的 fileList 改为 List<FileItem>,移除 dashScopeFileIds"**,但没说清:
- 顶层 `dashScopeFileIds` 字段是否物理删除?
- MessageItem 的 `dashScopeFileIds` 是否同步物理删除?
- 若只删顶层不删 MessageItem,controller `extractDashScopeFileIds()` 怎么改?

**修复要求**: Phase 2.1 明确写「DTO 物理删除所有 `dashScopeFileIds` 字段,包括顶层 + MessageItem 嵌套层」+「controller 改成从 MessageItem.fileList (List<FileItem>) 提取 dashScopeFileId 字段」。

---

## 🟡 #3 FileItem.role 字段语义模糊(主人 2026-07-22 拍板)

**主人口径**: "role 只有 user 的时候才会有上传文件"

→ 即 FileItem.role **固定 = `'user'`**,不是 user_upload / ai_cited 这种来源区分。

**问题**: plan 1.1 写 `String url; String dashScopeFileId; String role;` + plan 4.1 写 `role: 'user'`,但没说:
- role 是常量吗(只取 'user')?
- 后端 Executor / Controller 怎么用 role?
- 需不需要枚举类?

**修复要求**:
- 选项 A(推荐):**删 role 字段**,FileItem 只有 `url + dashScopeFileId`。后端判断"是不是用户上传的"靠 MessageItem.role(user 消息携带的文件就是用户上传)。
- 选项 B:role 字段保留但写明「枚举常量 `'user'`,无其他取值,预留给未来扩展」。

倾向选项 A(简洁)。请 Qoder 选一个。

---

## 🟡 #4 历史 chatHistory JSON 迁移方案(主人 2026-07-22 拍板)

**主人口径**: 「懒迁移:VO 层读时转换(推荐)」

**当前 plan 缺什么**:
- plan 1.2 只说 "@JsonCreator 反序列化自动兼容 String[]" → FileItem[]
- **完全没提** DB 里现有 chatHistory JSON 是「`fileList:String[]` + `dashScopeFileIds:String[]` 两个并列顶层字段」
- 反序列化到 FileItem[] 后,老格式的 `dashScopeFileIds` 顶层字段**无对应字段接住**(DTO 已删)

**修复要求**: Phase 2 之前新增独立章节 **Phase 1.5: 历史数据懒迁移**:

1. 在 VO/History load 路径增加一次性转换器 `LegacyFileListMigrator`
2. 触发点: 任何读 chatHistory JSON 的入口(AnswerHistoryRecord / TrainingRoleRecord / chatHistory 反序列化)
3. 转换逻辑: 检测到旧格式 → 转成新 FileItem[] → 写回 DB(`UPDATE chat_history SET fileList = ? WHERE id = ?`)
4. 兜底: 转换失败保留原数据 + warn 日志,不影响主链路
5. 验证脚本: 跑一次历史会话回放,确认 file-id 100% 恢复

---

## 🟡 #5 wk-train-center-ui-v3 没纳入排查

git status 显示 `wk-train-center-ui-v3` 在 Modified 列表。已存在 v3 端 dashscope audit 任务 [2026-07-17-p1-7-dashscope-qwen-long-audit.md](../../.products/projects/wk-train-center/tasks/mobile1.1/2026-07-17-p1-7-dashscope-qwen-long-audit.md)。

**修复要求**: Phase 0 增加排查步骤:
1. grep `dashScopeFileIds` 在 `wk-train-center-ui-v3/` 命中范围
2. 若 v3 也走 AI 会话 → Phase 4/5 拆 v3 子阶段
3. 若 v3 不走 → 在 plan 头部标注「v3 不在范围内」

---

## ✅ 评审确认正确的点

| 项 | 证据 |
|---|---|
| 重构动机成立(URL/file-id 索引对齐 bug) | AgentChatRequestDto:62/92/119 + chatSession.js:289-302 |
| AnswerAssistantView.vue:88 漏传 dashScopeFileIds bug | [AnswerAssistantView.vue:88](../../wk-train-center-ui/src/views/web/ai/components/AiAssistant/modes/answer/AnswerAssistantView.vue) — grep 确认 `fileList: extractFileUrls(...)` 但无 `dashScopeFileIds: ...` |
| Phase 顺序(后端 DTO → Service → Controller → Executor)合理 | — |
| `dashScopeFileId: null` 用 filter(Boolean) 兜底 | plan L117 |
| 工厂/转换器层覆盖完整 | Phase 2.5/2.7 |

---

## 给 Qoder 的改 plan 优先级

| 优先级 | 项 | 工时估 |
|---|---|---|
| P0 | #1 wk-mhc-mobile 补齐 | 30 min |
| P0 | #2 DTO 字段处置明确化 | 15 min |
| P1 | #4 历史 JSON 懒迁移章节 | 30 min |
| P1 | #3 FileItem.role 选 A 或 B | 10 min |
| P2 | #5 v3 排查 | 15 min |

合计约 1.5-2h。改完再走 evaluate 流程派工。