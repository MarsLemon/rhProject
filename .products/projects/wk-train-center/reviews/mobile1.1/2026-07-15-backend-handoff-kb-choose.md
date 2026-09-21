# M1.0 联调阶段 · 后端待办（交付给 Claude）

> **日期**: 2026-07-15
> **背景**: 前端 v2 联调发现 5 个问题，已修复；其中部分修复需要后端配套改动
> **Owner**: Claude（按角色分工：Claude 负责后端代码编写，本文档只列需求与验收点）

---

## 摘要

前端本轮围绕「学员端 AI 问答工具调用可视化 + KB 多选切换 + Suggestion 渲染 + 输出中断文案」做了改造。改造触发的后端配套需求共 **2 个**：

1. **DTO + Controller 透传 kbList**：把用户勾选的知识库列表（多选）传给后端
2. **KB 检索按 kbList 选择 vectorStoreId**：让检索真实生效

> **v2 变更**：本轮 UI 从单选改成多选。前端用 `kbList: Array<String>` 表达（`['training']` / `['gongwu']` / `['training','gongwu']` / `[]`），不是 `kbChoose: String`。

---

## P0 · DTO + Controller + ReActRequest 透传 kbList

### 现状

- `AgentChatRequestDto.Tools` 没有 `kbList` 字段（只有 enableKbSearch / enableWebSearch / enableThinking）
- `WkAiAgentController` 把 `Tools` 三个 boolean 透传给 `ReactRequest`，但没有 kbList
- `AgentReActExecutor.ReactRequest` 也没有 kbList 字段

### 需要改动

| 文件 | 改动 |
|------|------|
| `AgentChatRequestDto.java` | `Tools` 嵌套类增加 `private List<String> kbList;`（多选知识库：`'training'` / `'gongwu'`，不传视为 `['training']`） |
| `WkAiAgentController.java` | chatStream 读取 `dto.getTools().getKbList()` 并把 `kbList` 传入 `ReactRequest` |
| `AgentReActExecutor.java` | `ReactRequest` record 增加 `List<String> kbList`，同步更新 ReactRequest 构造 |
| `AgentReActExecutorImpl.java` | ReActRequest 解构 `kbList`；当 `kbList` 为 null / 空数组时，把 `enableKbSearch` 当作 false 处理（禁用 KB 工具） |
| `KnowledgeBaseSearchTool.java` | 按 `kbList` 选择 cfg（详见 P1） |

### 验收点

1. 前端发 `tools.kbList=["training","gongwu"]` 时，后端日志能看到 ReactRequest 里有 `kbList=["training","gongwu"]`
2. `tools.kbList=[]` 时，后端 ReAct 不调用 `knowledge_base_search`（工具直接 disable）

---

## P1 · KB 检索按 kbList 选择 vectorStoreId

### 现状

- `KnowledgeBaseSearchTool.execute(arguments)` 当前通过 `AgentConfigService` 拿到所有 `type=bailian_kb` 的 cfg（多 KB 一起查）
- 数据库 cfg 表有 `provider="kb_training"`（vectorStoreId=t7tv9lmp6f）和 `provider="kb_gongwu"`（vectorStoreId=tf6gvf9i8z）
- 多 KB 同时查时 `kbLabel` 取 list[0]，前端 ToolResult 拿到的是混合 label

### 需要改动

| 文件 | 改动 |
|------|------|
| `KnowledgeBaseSearchTool.java` | execute 接受 `kbList` 参数（由 controller 从 ReactRequest 透传），调 `AgentConfigService.getKbConfigs(kbList)` 按列表逐一取 KB：`kbList=['training']` 只取 `provider=kb_training`，`kbList=['training','gongwu']` 两个都取 |
| `AgentConfigService` 接口 + 实现 | 加 `List<KbConfigEntry> getKbConfigs(List<String> kbList)` 方法（kbList 为 null 时按"取全部 KB"行为，向后兼容旧调用） |
| `AgentChatChunkVo` / `ToolResult` | `kbLabel` 字段：单 KB 时直接显示对应 label（如"培训知识库"）；多 KB 时合并显示（如"培训/工务"），让前端 AiMessageMeta 仍能识别 |

### 验收点

1. 前端发 `kbList=['gongwu']`：
   - 检索只命中 KB-工务知识库
   - `event: tool_result` 的 `kbLabel` = `"工务知识库"`
2. 前端发 `kbList=['training']`：
   - 检索只命中 KB-培训知识库
   - `kbLabel` = `"培训知识库"`
3. 前端发 `kbList=['training','gongwu']`：
   - 两 KB 都命中
   - `kbLabel` = `"培训知识库 / 工务知识库"` 或分别出现在多条 tool_result 中
4. 前端发 `kbList=[]`（不使用 KB）：
   - 不调用 knowledge_base_search 工具（等同于 enableKbSearch=false）
5. 兼容旧调用（`kbList` 为 null）：
   - 行为与变更前一致（取所有 KB）

---

## P2 · （可选）verify / 持久化字段

把 `kbList` 也写入 `agent_chat_log`（如果有）便于排查；不强制。

---

## 测试建议

联调前请用 curl 跑一遍，确认 SSE 输出符合预期：

```bash
# 测试 kbList=['gongwu']
curl -N -X POST http://localhost:8080/api/wk/ai/agent/chat-stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "MAN B&W 缸套油温度高"}],
    "bizParams": {"promptKey": "answer_assistant"},
    "tools": {"enableKbSearch": true, "enableWebSearch": false, "enableThinking": false, "kbList": ["gongwu"]}
  }' | grep -E "^(event|data)" | head -30
```

期望：
- 出现 `event: tool_call` 和 `event: tool_result` 行
- `tool_result` 行 JSON 中 `kbLabel` 应为 `"工务知识库"`

---

## 联调追踪

更新 `2026-07-15-integration-tracker.md` 中的 P0/P1 测试项状态。验收完后回贴下「kbList=P1 已通过」即可进入下一轮。
