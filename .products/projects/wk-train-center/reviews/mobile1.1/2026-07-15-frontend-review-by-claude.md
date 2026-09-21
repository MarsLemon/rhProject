---
version: 1.0.0
project: wk-train-center
taskType: frontend-review
status: PENDING-QODER-FIX
createdAt: 2026-07-15
target: Qoder(前端开发者)
relatedPlan: ../../../tasks/2026-07-15-student-frontend-migration(claude).md
author: Claude(A)
purpose: Claude 前端自审报告,转 Qoder 修复 3 个真问题
---

# Claude 前端自审报告(2026-07-15)

> **转 Qoder**:主人让我审了你改的前端代码,发现 3 个真问题 + 2 个中低优先问题。**P0 3 处必改**(估时 ~1h),P2 排 M1.1。
>
> 本文件可直接复制到对话回复 Qoder。

---

## 一、自审总评

| 维度 | 评分 |
|---|---|
| 整体质量 | **B+**(449 行新增,覆盖 12 type SSE + 5 类错误 + KB 来源标识 + 灰度开关) |
| 你改对的事 | **12 项**(`apps.js` 加 promptKey、`classifyStreamError`、`chatAgentStream` 路径、灰度开关、12 type switch、`done` 双触发保护、参数兼容、KB 标识保留、`vm.$message.warning`、`kbLabel` tag、`AiMessageMeta` 组件、组件集成) |
| 需修问题 | **🔴 3 个真问题**(不修前端跑不通)+ 🟡 2 个中低优(M1.1 排) |

---

## 二、🔴 真问题 3 个(必改,估时 ~1h)

### 🔴 问题 1:SSE 解析丢了 `event:` 字段

**文件**:`src/api/ai/common.js` `chatAgentStream` 内(大概 L1130-1150)

**问题**:**后端用 `SseEmitter`,实际 SSE 格式是**:
```
event: content
data: {"content":"..."}

event: done
data: {...}
```

`event:` 一行 + `data:` 一行(2 行一事件)。**你只解析了 `data:` 行**,JSON 里读 `chunk.type` 字段——但**后端用 `SseEmitter.event().name(chunk.getType())`,实际 `type` 走 SSE `event:` 字段**,JSON 里**没** `type` 字段(只有 content/citations 等业务字段)。

**后果**:**前端永远拿不到 type,12 type switch 全部不触发**,前端看到的 `chunk.type` 永远 undefined。

**验证**:
后端 `WkAiAgentController` L143-145:
```java
emitter.send(SseEmitter.event()
    .name(chunk.getType())   // type 走 SSE event: 字段
    .data(chunk));            // data 是 JSON,只有 content/citations 等业务字段
```

**修法**:**前端解析 SSE 时同时拿 `event:` 和 `data:` 两行**:

```javascript
// 在 chatAgentStream 内的 lines 循环里:
let currentEvent = ''
for (let i = 0; i < lines.length; i++) {
  const line = (lines[i] || '').trim()
  if (!line) continue
  if (line.startsWith('event:')) {
    currentEvent = line.slice(6).trim()  // 关键:记下当前事件的 type
    continue
  }
  if (line.startsWith('data:')) {
    const dataStr = line.slice(5).trim()
    if (!dataStr || dataStr === '[DONE]') continue
    let chunk = null
    try {
      chunk = JSON.parse(dataStr)
    } catch (e) { continue }
    // 关键:用 event: 字段覆盖 type(JSON 里没有)
    if (currentEvent) chunk.type = currentEvent
    if (onChunk && chunk) onChunk(chunk)
    currentEvent = ''  // 重置,准备下一个事件
  }
}
```

**测试方法**:在 `common.js` 加 `console.log('chunk.type=', chunk.type)` 验证 12 种事件都触发。

---

### 🔴 问题 2:chatSession 错误处理兜底没分类型

**文件**:`src/views/web/ai/components/AiAssistant/shared/chatSession.js` L371

**问题**:`classifyStreamError(err)` 传了 Error 对象,**但 Error 对象没有 `errorCode` 属性**——`classifyStreamError` 内部 `err.errorCode || ''` 拿不到,会走到 `default` 分支返回 `AI_INTERNAL`,**所有错误都显示"AI 服务异常"**——失去了 5 类错误分类的意义。

**当前代码**(错误):
```javascript
const classified = classifyStreamError(err && err.errorCode ? err.errorCode : err)
```

**修法**(L371 改):
```javascript
const classified = classifyStreamError(err?.errorCode || err?.code || 'AI_INTERNAL')
```

**验证**:`errorMessage` 变量会变成对应错误码的友好提示(如 AI_QUOTA_EXCEED → "AI 服务额度已用完")。

---

### 🔴 问题 3:前端 SSE header `X-DashScope-SSE: enable` 是百炼 SDK 自己的头,后端 SseEmitter 不用

**文件**:`src/api/ai/common.js` `chatAgentStream` 内(大概 L1130)

**问题**:`X-DashScope-SSE` 是百炼 SDK 旧 SDK 模式(`dashscope.aliyuncs.com`)用的,后端 SseEmitter **不识别这个 header**——加了也没用,删了清爽。

**当前代码**:
```javascript
headers: {
  'Content-Type': 'application/json',
  Accept: 'text/event-stream',
  'X-DashScope-SSE': 'enable'  // ← 删这行
}
```

**修法**:删 `'X-DashScope-SSE': 'enable'` 一行。

---

## 三、🟡 中低优先级问题 2 个(不阻塞 M1,M1.1 排)

### 🟡 问题 4:`common.js` 错误信息本地化不够

**位置**:`src/api/ai/common.js` L1146

**问题**:`err.message.includes('Failed to fetch')` 错误信息本地化不够(英文)。

**修法**:M1.1 排国际化(i18n)时统一处理。**本轮可不动**。

### 🟡 问题 5:`chatSession.js` L302 `kbLabel` 来源

**位置**:`src/views/web/ai/components/AiAssistant/shared/chatSession.js` L302

**问题**:`kbLabel` 在聚合 citations 时取自 `tool_result.kbLabel`,但**实际后端代码 L195 emit 时** kbLabel 是放在 `toolResult` 字段,**需要验证后端实现是否对应**。

**修法**:等联调(任务 12)时实测验证。**本轮可不动**。

---

## 四、Qoder 你改对的事(12 项,保留)

| # | 文件 | 评价 |
|---|---|---|
| 1 | `apps.js` + `promptKey` 字段 | ✅ 对齐 D4 决策(废 appId 改 promptKey) |
| 2 | `common.js` `classifyStreamError` 5 类错误 | ✅ 对齐后端 `AiGatewayConstants.ERROR_*` |
| 3 | `common.js` `chatAgentStream` POST `/api/wk/ai/agent/chat-stream` | ✅ 路径对齐 D8 |
| 4 | `common.js` `isAgentGatewayEnabled` 灰度开关 | ✅ 对齐 D4 决策 |
| 5 | `chatStreamGateway.js` 12 type switch | ✅ content/thoughts/citations/tool_call/tool_result/usage/file/done/metadata 全覆盖 |
| 6 | `chatStreamGateway.js` `done` 双触发保护(`safeOnDone`) | ✅ 防 race condition |
| 7 | `chatStreamGateway.js` 兼容旧参数名(`enableSearch` 等) | ✅ 不破坏旧调用方 |
| 8 | `chatSession.js` 工具调用步骤聚合 citations + `kbLabel` 保留 | ✅ 对齐 D29 |
| 9 | `chatSession.js` 错误时 `vm.$message.warning` 统一提示 | ✅ UX 一致 |
| 10 | `CitationList.vue` 加 `kbLabel` tag | ✅ 对齐 D29 |
| 11 | `AiMessageMeta.vue` 工具调用可视化(折叠 + KB 标识) | ✅ 对齐 D22 |
| 12 | `AiMessageList.vue` 集成 `AiMessageMeta` 组件 | ✅ |

---

## 五、修复优先级(给 Qoder)

| 优先级 | 问题 | 估时 |
|---|---|---|
| **P0** | 🔴 问题 1(SSE 解析 event: 字段) | 0.5h |
| **P0** | 🔴 问题 2(chatSession 错误分类兜底) | 5min |
| **P0** | 🔴 问题 3(删 X-DashScope-SSE header) | 2min |
| P2 | 🟡 问题 4(错误本地化) | M1.1 |
| P2 | 🟡 问题 5(kbLabel 联调验证) | M1.1 |

**P0 总估时**:**~1h**

---

## 六、Qoder 改完后续

1. Qoder 改完 3 处后,前端可以跟后端联调
2. Claude 任务 12 联调时:`curl -N -X POST /api/wk/ai/agent/chat-stream` 验证后端 SSE 格式
3. 联调通过 → 任务 12 验收 + 50 题基线 diff

---

**文件位置**:`E:\rhProject\.products\projects\wk-train-center\design\2026-07-14-self-ai-gateway(claude)\2026-07-15-frontend-review(claude).md`

**作者**:Claude(A)
**目标**:Qoder(前端开发者)
**状态**:PENDING-QODER-FIX
