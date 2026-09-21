# M1.0 联调追踪

> **日期**: 2026-07-15
> **范围**: 任务 12 — v2 学员端 AI 问答 + H5 学员端 AI 陪练 + 50 题基线
> **参与者**: Claude(后端) + Qoder(前端)

---

## 联调入口验证

### 1. 后端 SSE 链路验证（Claude 负责）

**验证命令**:
```bash
curl -N -X POST http://localhost:8080/api/wk/ai/agent/chat-stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "MAN B&W 缸套油温度高"}],
    "bizParams": {"promptKey": "answer_assistant"},
    "tools": {"enableKbSearch": true, "enableWebSearch": false, "enableThinking": false}
  }'
```

**期望输出**:
- SSE 流含 `event: content` / `event: tool_call` / `event: tool_result` / `event: done`
- `event: tool_result` 行 JSON 含 `"kbLabel":"培训知识库"` 或 `"kbLabel":"工务知识库"`

| 测试项 | 状态 | 备注 |
|--------|------|------|
| SSE 正常返回 | ⬜ | |
| content 流式输出 | ⬜ | |
| tool_result 含 kbLabel | ⬜ | |
| done 事件正常 | ⬜ | |
| 限流生效(20s) | ⬜ | |

---

### 2. 前端 v2 验证（Qoder 负责）

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 请求走 `/api/wk/ai/agent/chat-stream` | ⬜ | 不是 dashscope |
| 12 type 事件消费正常 | ⬜ | |
| kbLabel tag 显示正确 | ⬜ | |
| 多轮对话历史累积 | ⬜ | |
| 5 类错误文案显示 | ⬜ | |
| 灰度开关切回老链路 | ⬜ | |

---

### 3. 前端 H5 验证（Qoder 负责）

| 测试项 | 状态 | 备注 |
|--------|------|------|
| AI 陪练走新链路 | ⬜ | |
| 引用源展示正常 | ⬜ | |
| 错误处理与 v2 一致 | ⬜ | |

---

### 4. 50 题基线验证

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 新链路 50 题 ≥ 95% 一致 | ⬜ | |
| 4 条 grep 0 命中 | ⬜ | 见下方 |

**4 条 grep**:
```bash
# 1. v2 无 type=raw
grep -rn "type.*raw\|'raw'\|\"raw\"" wk-train-center-ui/src/ --include="*.js" --include="*.ts" --include="*.vue"
# 2. v2 无 extractAppTextFromChunk
grep -rn "extractAppTextFromChunk" wk-train-center-ui/src/api/ai/
# 3. H5 无 type=raw
grep -rn "type.*raw\|'raw'\|\"raw\"" wk-mhc-mobile/src/
# 4. 后端无 type=raw
grep -rn "type.*raw\|type.*=.*\"raw\"" wk-train-center-service/wk-modules/wk-module-ai/src/
```

---

## 问题记录

| # | 问题描述 | 发现阶段 | 修复人 | 状态 |
|---|---------|---------|--------|------|
| | | | | |

---

## 验收签字

- [ ] Claude(后端) SSE 链路验收
- [ ] Qoder(前端) v2 + H5 验收
- [ ] 主人 50 题基线验收
