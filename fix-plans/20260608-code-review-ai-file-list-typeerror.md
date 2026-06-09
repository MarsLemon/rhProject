# AI 文本回复 syncToBackend 抛 TypeError（fileList 未初始化）

- **发现时间**: 2026-06-08
- **来源**: code-review
- **关联提交/PR**: 当前 working tree（chatSession.js payload.fileList 新增分支）
- **严重度**: 🟥 阻塞合并

## 现象

AI 普通文本回复（无 file_list）时，syncToBackend 在 `.filter()` 上抛 `TypeError: Cannot read properties of undefined (reading 'filter')`，AI 消息**无法持久化**，刷新后对话记录丢失。

## 触发条件

1. 用户问普通文本问题
2. AI 流式返回不含 fileList（meta.fileList 为 null 或 length=0）
3. onMessage 回调里的 `if (Array.isArray(meta.fileList) && meta.fileList.length)` 不命中 → **`fileList` key 永远不被 $set 到 messages[aiMsgIndex]**
4. 流结束 → syncToBackend('ai', fullText, false, aiMsgIndex) 触发
5. line 328 `state.messages[messageIndex].fileList` 为 undefined
6. line 329 `.filter(...)` 抛 TypeError
7. `catch (e) { console.error('同步后端失败', e) }` 仅 console.error，**用户无感**，但 addRecord 没调成功

## 修复建议

`E:\rhProject\wk-train-center-ui\src\views\web\ai\components\AiAssistant\shared\chatSession.js` line 327-332

```javascript
// 旧
if (type === 10 && messageIndex != null && state.messages[messageIndex]) {
  const fl = state.messages[messageIndex].fileList
  if (Array.isArray(fl) && fl.length) {
    payload.fileList = fl.filter(...).map(...)
  }
}

// 新
if (type === 10 && messageIndex != null && state.messages[messageIndex]) {
  const fl = state.messages[messageIndex].fileList
  if (Array.isArray(fl) && fl.length) {
    payload.fileList = fl.filter(...).map(...)
  } else {
    payload.fileList = []  // 后端接收空数组而非 undefined
  }
}
```

或更稳妥：把 fileList 初始化为 `[]`（在 messages 推入时一并 $set），后续直接 `.filter` 不会报错。

## 相关文件

- `E:\rhProject\wk-train-center-ui\src\views\web\ai\components\AiAssistant\shared\chatSession.js`
- `E:\rhProject\wk-train-center-ui\src\views\web\ai\components\AiAssistant\shared\AiChatPanel.vue`
- `E:\rhProject\wk-train-center-ui\src\api\ai\common.js`

## 状态

- [ ] 待修复
