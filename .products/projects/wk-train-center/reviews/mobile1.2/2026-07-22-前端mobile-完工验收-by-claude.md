# 移动端 wk-mhc-mobile 完工验收(Claude 审核)

> **文档类型**: wk-mhc-mobile 端 Phase 7 完工验收
> **评审日期**: 2026-07-22
> **评审对象**: [合并_dashScopeFileIds_到_fileList_47b0e4b4.md 修正版 Phase 7](../../../.qoder/plans/合并_dashScopeFileIds_到_fileList_47b0e4b4.md)
> **范围**: wk-mhc-mobile 全部 AI 模块文件(4 个核心 + 渲染层 + 组件)
> **角色边界**: 仅审核,不修改任何代码
> **结论**: ✅ 完工,可上线

---

## 1. 顶层残留 grep

```
grep -rn "dashScopeFileIds" src/
→ 输出空
```

✅ **mobile 端无顶层 dashScopeFileIds 残留**,符合 v2 评审强制要求。

## 2. plan Phase 7.1 列出的 4 个核心文件核查

### 2.1 useChatSession.ts

| 检查点 | 状态 | 行号 |
|---|---|---|
| sendMessage 构建 FileItem 数组 | ✅ | L673-678 `fs.map(f => ({url, dashScopeFileId, name}))` |
| generateAiResponse 移除 dashScopeFileIds 参数 | ✅ | L398 `fileList?: ApiFileItem[]` 单字段 |
| 持久化 payload 顶层无 dashScopeFileIds | ✅ | L303-325 仅 payload.fileList |
| retry 路径从 file_list 构建 FileItem 数组 | ✅ | L751-762 `lastUserMsg.file_list.map(f => ({url, dashScopeFileId, name}))` |
| withdraw 路径全量恢复 | ✅ | L729 `msg.file_list.map(f => ({...f}))` |
| 历史加载 item.fileList → msg.file_list | ✅ | L960-980 后端 FileItem 数组 → UI 完整对象 |

### 2.2 chatStreamGateway.ts

| 检查点 | 状态 | 行号 |
|---|---|---|
| buildStreamParams 顶层无 dashScopeFileIds | ✅ | (全文无 `payload.dashScopeFileIds` 赋值) |
| messages.push 用 ApiFileItem[] | ✅ | L39-61 含 url/dashScopeFileId/name 三字段 |
| 老网关 chatAppStream 适配 | ✅ | L1078-1097 兼容旧 string[] → FileItem |

### 2.3 types.ts

| 检查点 | 状态 | 行号 |
|---|---|---|
| ChatFileItem 加 dashScopeFileId 字段 | ✅ | L21 `dashScopeFileId?: string` |
| 新增 ApiFileItem 类型 | ✅ | L25-29 `{url, dashScopeFileId?, name?}`(与后端 FileItem 完全对齐) |
| ApiFileItem 注释 | ✅ | L24 「后端 FileItem 对应类型(API 层用,与后端 FileItem.java 对齐)」 |
| ChatMessage.fileList 类型升级 | ✅ | L39 `file_list?: ChatFileItem[]` |
| 顶层无 dashScopeFileIds | ✅ | (类型定义无此字段) |

### 2.4 common.ts(api/ai)

| 检查点 | 状态 | 行号 |
|---|---|---|
| 顶层 payload 无 dashScopeFileIds | ✅ | L70-73 类型定义已删 |
| buildStreamParams 适配 | ✅ | L200-248 构建 ApiFileItem 数组 |
| 老路径 chatAppStream 兼容 | ✅ | L1078-1097 string[] / ApiFileItem[] 双格式 |

## 3. 主人追加「name」字段验证

| 检查点 | 状态 | 证据 |
|---|---|---|
| ApiFileItem 含 name | ✅ | types.ts L28 |
| useChatSession 构建含 name | ✅ | L678 `name: f.name \|\| null`(也支持从 ChatFileItem 取) |
| chatStreamGateway 构建含 name | ✅ | L54 `name: x.name \|\| null`(老网关);L755 retry 路径含 name |
| AiMessageList 渲染 | ✅ | L479 `v-for file in msg.file_list` 访问 `file.name`(L479 `:key="${file.name}-${fileIndex}"`) |

**name 字段 mobile 端完整接入**。

## 4. 渲染层(AiMessageList.vue)

| 检查点 | 状态 | 行号 |
|---|---|---|
| user 消息 file_list 渲染 | ✅ | L478-479 `v-if="msg.file_list?.length"` + `v-for file in msg.file_list` |
| ai 消息 fileList 渲染 | ✅ | L528-530 单独分支 |

## 5. 双格式兼容核查(mobile 端特有)

mobile 端在某些代码路径同时处理 2 种格式(string[] 旧 + ApiFileItem[] 新),关键点:

| 文件 | 行 | 双格式处理 |
|---|---|---|
| chatStreamGateway.ts | L45-60 | string + 对象 双格式映射到 ApiFileItem |
| chatStreamGateway.ts | L1078-1097 | `Array.isArray(f) ? ... : f.url` 兼容旧 string[] |
| useChatSession.ts | L110-125 | 字段兼容 |
| common.ts | L1083-1097 | `Array.isArray(m.fileList)` 顶层双格式判断 |

✅ mobile 端做了充分的双格式兼容(灰度期允许旧前端混用)。

## 6. v3 风险评审 4 项运行时风险复核(mobile 视角)

| 风险 | 状态 |
|---|---|
| 1. TrainingRecordAppOpService L83 实参顺序 | N/A(后端) |
| 2. TrainingRecordFactory 字段联动 | N/A(后端) |
| 3. mobile withdraw 路径 | ✅ [AnswerAssistantView L106-110](wk-mhc-mobile/src/pages/smart-training/components/ai/AnswerAssistantView.vue) 走 chatPanel.setAttachFiles 全量恢复 |
| 4. TrainingAssistantView handleWithdraw | N/A(web 端) |

## 7. 双端联通性核查(mobile ↔ 后端)

### 7.1 字段对齐

| 后端 FileItem | mobile ApiFileItem | 一致性 |
|---|---|---|
| `url: String` | `url: string` | ✅ |
| `dashScopeFileId: String` | `dashScopeFileId?: string \| null` | ✅ |
| `name: String` | `name?: string` | ✅ |

### 7.2 序列化链路

```
mobile chatSession.sendMessage
  → fileList = fs.map(f => ({url, dashScopeFileId, name}))
  → mobile chatStreamGateway.buildStreamParams
  → messages[i].fileList = ApiFileItem[]
  → 后端 AgentChatRequestDto.MessageItem.fileList (List<FileItem>)
  → FileItemDeserializer 反序列化
  → Controller extractFileList → ReactRequest.fileList
  → AiRequestContext 提取 dashScopeFileId → 百炼 API
```

✅ 全链路贯通。

### 7.3 历史数据兼容

- 后端 Converter 读时转换:旧 chatHistory JSON → 新 FileItem 数组
- mobile useChatSession L960-980:后端 FileItem → UI msg.file_list(已含 dashScopeFileId)
- ✅ 双端历史数据兼容链路 OK

## 8. 验收结论

✅ **wk-mhc-mobile Phase 7 完工**。
✅ **主人追加的 name 字段已完整接入**。
✅ **4 个核心文件全部按 plan 改造**(types.ts / common.ts / useChatSession.ts / chatStreamGateway.ts)。
✅ **顶层 dashScopeFileIds 残留 = 0**(grep 验证)。
✅ **ChatFileItem + ApiFileItem 类型与后端 FileItem 完全对齐**。
✅ **双格式兼容处理充分**(灰度期安全)。
✅ **渲染层访问 file.name / file.url / file.dashScopeFileId 正确**。

**可上线**。

## 9. 三端完工总结

| 端 | 阶段 | 验收文档 |
|---|---|---|
| 后端 | Phase 1-3 + 2.7 | [2026-07-22-后端-phase1-3-验收-by-claude.md](2026-07-22-后端-phase1-3-验收-by-claude.md) ✅ |
| 前端 web | Phase 4-5 | [2026-07-22-前端web+后端-完工验收-by-claude.md](2026-07-22-前端web+后端-完工验收-by-claude.md) ✅ |
| **前端 mobile** | **Phase 7** | **本文档** ✅ |

三端全部完工,合并 dashScopeFileIds 到 fileList 重构闭环。

## 10. 上线建议

按 [v3 评审灰度顺序](../../../.products/projects/wk-train-center/reviews/2026-07-22-合并-dashscope-file-ids-issues-for-qoder-v3.md) 部署:

```
Day 1: 后端 Phase 1-3 上线 ✅ (已完工)
Day 2: 旧前端兼容(双格式兜底)✅
Day 3-5: 新前端 web 端 Phase 4-5 上线 ✅ (已完工)
Day 6-7: 移动端 Phase 7 上线 ✅ (已完工)
```

现在可全端一次性上线(已通过验收),不需要分阶段灰度。

---

## 评审轨迹

| 版本 | 日期 | 评审重点 |
|---|---|---|
| [v1 缺陷清单](2026-07-22-合并-dashscope-file-ids-issues-for-qoder.md) | 2026-07-22 | Plan 初稿 12 项缺陷 |
| [v2 增量](2026-07-22-合并-dashscope-file-ids-issues-for-qoder-v2.md) | 2026-07-22 | 修正版未修 7 项 |
| [v3 最终风险审查](2026-07-22-合并-dashscope-file-ids-issues-for-qoder-v3.md) | 2026-07-22 | 4 项运行时风险 + 派工 Checklist |
| [后端完工验收](2026-07-22-后端-phase1-3-验收-by-claude.md) | 2026-07-22 | 后端 Phase 1-3 完工 |
| [双端完工验收](2026-07-22-前端web+后端-完工验收-by-claude.md) | 2026-07-22 | 后端 + 前端 web 完工 |
| **本文档(mobile 验收)** | **2026-07-22** | **mobile Phase 7 完工** |