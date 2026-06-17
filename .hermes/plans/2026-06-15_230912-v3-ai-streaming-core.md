# v3 学员端 web/ai 流式核心 完善计划

> **For Hermes:** 本计划由用户 2026-06-15 23:09 明确要求"开始 b"(起手包 B) + "业务公共组件第一个 knowledge 临时放公共位置(写 todo 以后分类)" + "其他 3 个组件归属课件模块" + "逻辑尽量往 ts 放,vue 尽量只写页面" + "保持原有逻辑,有问题就问,不擅自决定,不胡编乱造"。

**Goal:** 把 v3 学员端 web/ai 流式核心(起手包 B)从"80% 就绪"推到"端点 URL 替换可启用",同时**摸清并定义 4 个缺失 v3 公共组件的下一步归属与临时存放**(其中 AssociatedKnowledge 临时放公共位置)。

**当前上下文:**

| 维度 | 状态 |
|---|---|
| v3 学员端 web/ai 累计 | 23 文件 + 1 store,完整闭环 |
| v3 sseStream.ts | 244 行,完整接口 + token 注入 + 注释行处理(本轮) |
| v3 store `fetchSseOrFallback` | 走占位 fallback;真实分支已写好,只差业务方提供端点 URL |
| v3 后端 SSE 真实端点 | ❶ 学员端答疑:`/api/wk/answer/student/stream`  ❷ 学员端陪练:`/api/wk/training/role/student/stream` (写死,未确认真实存在) |
| 环境变量 | `VITE_AI_STREAM_ENABLED` 默认 false(走 fallback) |
| v3 缺 4 个组件(课件管理上下文,但 B 是 web/ai) | 见下面"组件归属" |

**⚠️ 起手包 B 边界 vs 用户原话解析:**
- "开始 b" → 起手包 B = **web/ai 流式核心** (playbook §18)
- "用 claude 开始" → 倾向用 Claude Code 子代理(subagent-driven-development)执行
- "业务公共组件第一个 knowledge 临时放公共位置" → 指的是 **AssociatedKnowledge** 组件(被课件管理 + 课程表单共用,v3 缺失)
- "其他三个归属于课件的组件" → 课件管理缺失的 3 个组件:AdminMultiAddCourseFileDialog / AiPptGenerator / CourseFileRefDialog

**组件归属清单(用户原话确认):**

| 缺失组件 | v2 引用 | 临时归属 | todo 标记 |
|---|---|---|---|
| **AssociatedKnowledge** (关联知识点) | 7 处(file.vue + form.vue 跨模块用) | **`src/components/_temp_/AssociatedKnowledge/`** —— 临时公共,以后分类到 ComponentsBase 或 ComponentsBusiness | todo: "以后分类" |
| **AdminMultiAddCourseFileDialog** (管理端批量添加课件) | 3 处 | `src/views/admin/course/components/File/AdminMultiAddCourseFileDialog.vue` —— 课件模块内 | - |
| **AiPptGenerator** (AI 生成课件) | 4 处 | `src/views/admin/course/components/File/AiPptGenerator.vue` —— 课件模块内 | - |
| **CourseFileRefDialog** (引用对象查看) | 2 处 | `src/views/admin/course/components/File/CourseFileRefDialog.vue` —— 课件模块内 | - |

> 备注: 上面 4 个组件**本次不起手** —— 用户原话"开始 b"(起手包 B = web/ai 流式核心),4 个组件是"分类归属"的认知建立,不起手写。本计划只做 B。

**Tech Stack:** Vue 3 + TypeScript + Element Plus + Pinia + Vite + Vue Router 4

**Architecture:**
- **TS 业务逻辑模块**(store / composable / 工具) —— 重逻辑、可测试、可复用
- **Vue 页面壳** —— 只写模板 + props/emit + lifecycle,逻辑委托给 TS
- **SSE 流式核心** —— 工具 sseStream.ts(已就绪)+ store fetchSseOrFallback(已接)+ 真实端点 URL(等业务方)

---

## 起手包 B 当前完成度(2026-06-15 23:09 现状)

| B.x 任务 | 状态 |
|---|---|
| B.1 摸 v2 chatAppStream 完整实现 | ⏭️ 跳过(已有 sseStream.ts) |
| B.2 设计 v3 流式工具 | ✅ sseStream.ts(244 行)+ token 注入(本轮)+ 注释行处理(本轮) |
| B.3 store `sendAnswer`/`sendTraining` 接流式 | ✅ `fetchSseOrFallback` 已接,占位 fallback 走打字机模拟 |
| B.4 sseStream 自动 token 注入 | ✅ 本轮完成 |
| B.5 AiMessageList 流式渲染 | ⏭️ 跳过(已是 store 推送式,前端 typewriter 已 work) |
| B.6 后端 SSE 端点 URL | ⏸️ **业务方提供(阻塞)** |

**B 还剩的真实可推进项(本计划只动这些):**

| B.x | 任务 | 价值 | 阻塞 |
|---|---|---|---|
| **B.7** | **store `fetchSseOrFallback` 真实分支小修**:当 `VITE_AI_STREAM_ENABLED=true` 但流过程中出错时,优雅降级到 fallback(而不是直接 throw) | 🟢 高 —— 真实场景第一坑 | 无 |
| **B.8** | **store `sendAnswer` 错误处理**:对 `fetchSseOrFallback` 抛错时,标记消息为 `error` 状态而不是 `loading` 卡住 | 🟢 高 | 无 |
| **B.9** | **抽出 `SseState` 独立 TS 文件**(枚举 loading / streaming / done / error / aborted) | 🟡 中 —— 跟 Vue 解耦,可复用 | 无 |
| **B.10** | **sseStream 加 `reconnect` 选项**(自动重连 1 次) | 🟡 中 | 用户偏好"不擅自装新库",无库可装,自写轻量版 |
| **B.11** | **改 `VITE_AI_STREAM_ENABLED` 默认 `true`**(撞真后端) | 🟢 启动开关,但真实分支依赖后端 URL | 等业务方确认 |
| **B.12** | **写 mock SSE 测试**(无测试框架,改成写一个可被 vite dev 调用的 mock 工具) | 🟡 中 | 无 |

**本计划只做 B.7 + B.8 + B.9**(3 个 TS 模块改动,无新依赖,跟用户"逻辑尽量往 ts 放"原则一致)。

**B.10 / B.11 / B.12 挂后门,等业务方拍**。

---

## 核心硬约束(用户原话)

1. **保持原有逻辑** —— 任何 v2/v3 已有逻辑不能私自修改语义
2. **有问题就问** —— 不擅自拍板
3. **不胡编乱造** —— 不确定的字段 / API / 类型宁可不写,挂后门
4. **B 不涉及起手包 A(漏洞) / C / D** —— 本计划只动 B 相关
5. **4 个缺失组件本次不起手**,只标记归属

---

## 步骤清单(本计划只动 B.7 + B.8 + B.9)

### Task B.7: 修 `fetchSseOrFallback` 真实分支优雅降级

**Objective:** 当 `VITE_AI_STREAM_ENABLED=true` 且后端 SSE 出错时,优雅降级到 fallback 而不是直接 throw,避免 AI 聊天卡死。

**Files:**
- Modify: `wk-train-center-ui-v3/src/stores/modules/ai.ts` (line ~397-462, `fetchSseOrFallback` 函数)

**Step 1: 读 v2 fallback 的错误处理** —— 确认 v2 是直接 throw 还是降级

```bash
grep -n "chatAppStream" wk-train-center-ui/src/views/web/ai/components/AiAssistant/shared/chatAppStream.js | head -5
grep -n "onError\|catch" wk-train-center-ui/src/views/web/ai/components/AiAssistant/shared/chatAppStream.js | head -20
```

**Step 2: 看 v3 现有真实分支错误处理**

读 `wk-train-center-ui-v3/src/stores/modules/ai.ts` line 397-462,看 `onError` 回调的处理逻辑。

**Step 3: 改 fetchSseOrFallback 真实分支**

```ts
// 修改:在真实流式分支加 try-catch 包装
// 修改前:sseStream 直接 await,出错 throw
// 修改后:出错时返回 fallback 占位,console.error 记录
if (streamEnabled) {
  try {
    const result = await sseStream(streamUrl, { ... }, { ... })
    return {
      data: {
        content: result.final.fullText,
        citations: result.final.citations,
        thoughts: result.final.thoughts,
        fileList: result.final.fileList
      }
    }
  } catch (err) {
    console.error(`[ai-store] SSE 流式失败,降级 fallback:`, err)
    // 降级:复用占位逻辑(避免聊天卡死)
    return await fetchSseOrFallback(_mode, _text, _options, { ...streamCallbacks, signal: undefined })
  }
}
```

**Step 4: 跑 typecheck**

```bash
cd /e/rhProject/wk-train-center-ui-v3 && npx vue-tsc --noEmit -p tsconfig.check.json --skipLibCheck 2>&1 | grep -cE "error TS"
# 期望:0
```

**Step 5: vite dev 实测编译**

```bash
npx vite --port 4218 --host 0.0.0.0 &  # 后台
sleep 15
curl -s -o /tmp/ai-store.js -w "HTTP %{http_code} size %{size_download}\n" \
  "http://localhost:4218/src/stores/modules/ai.ts"
# 期望:HTTP 200
# kill vite
```

**Step 6: commit**

```bash
git add wk-train-center-ui-v3/src/stores/modules/ai.ts
git commit -m "refactor(ai-store): 真实流式分支加 try-catch 降级 fallback"
```

---

### Task B.8: 修 `sendAnswer` 错误处理,标记消息为 `error` 状态

**Objective:** 当流式或 fallback 都失败时,把刚 push 的 AI 消息标记为 `error` 状态(显示"加载失败,点击重试"),而不是 `loading: true` 卡住。

**Files:**
- Modify: `wk-train-center-ui-v3/src/stores/modules/ai.ts` (line ~105-148, `sendAnswer` 函数)

**Step 1: 看现有 `sendAnswer` try-catch 结构**

读 `wk-train-center-ui-v3/src/stores/modules/ai.ts` line 105-148,确认 `aiMsgIndex` 引用。

**Step 2: 改 catch 块**

```ts
// 修改前:
try {
  await fetchSseOrFallback('answer', text, options, { ... })
} catch (err) {
  console.error('AI 答复失败:', err)
} finally {
  isLoading.value = false
  abortController.value = null
}

// 修改后:
try {
  await fetchSseOrFallback('answer', text, options, { ... })
} catch (err) {
  console.error('AI 答复失败:', err)
  // 标记 AI 消息为错误状态(而不是卡在 loading)
  const aiMsg = messages.value[aiMsgIndex]
  if (aiMsg) {
    aiMsg.loading = false
    aiMsg.error = true  // ← 新字段
    aiMsg.content = '加载失败,请点击重试'
  }
} finally {
  isLoading.value = false
  abortController.value = null
}
```

**Step 3: 同步改 `AiMessage` 类型定义**

在 `wk-train-center-ui-v3/src/stores/modules/ai.ts` 顶部 `interface AiMessage` 加 `error?: boolean` 字段。

**Step 4: 同步改 `AiMessageList.vue` 渲染**

读 `wk-train-center-ui-v3/src/views/web/ai/components/AiAssistant/AiMessageList.vue`,在 AI 消息渲染块加 `error` 状态展示(红色背景 + "重试"按钮),emit `'retry'` 事件。

**Step 5: 同步改 `AnswerAssistantView.vue` 接收 retry 事件**

读 `wk-train-center-ui-v3/src/views/web/ai/components/AiAssistant/modes/answer/AnswerAssistantView.vue`,在 `@retry` 处理中调 `handleRetry` 函数(已有 v3 版)。

**Step 6-7: typecheck + vite dev curl**

(同 Task B.7 Step 4-5)

**Step 8: commit**

```bash
git add wk-train-center-ui-v3/src/stores/modules/ai.ts \
        wk-train-center-ui-v3/src/views/web/ai/components/AiAssistant/AiMessageList.vue \
        wk-train-center-ui-v3/src/views/web/ai/components/AiAssistant/modes/answer/AnswerAssistantView.vue
git commit -m "fix(ai): 错误时消息标记 error 状态而非卡 loading"
```

---

### Task B.9: 抽 `SseState` 独立 TS 文件(枚举)

**Objective:** 把流式状态(`loading` / `streaming` / `done` / `error` / `aborted`)从 Vue 模板散落的字符串中抽出,做成 TS enum + 类型守卫,跟 Vue 解耦,可复用。

**Files:**
- Create: `wk-train-center-ui-v3/src/views/web/ai/components/AiAssistant/shared/sseState.ts`

**Step 1: 创建文件**

```ts
// 文件路径: wk-train-center-ui-v3/src/views/web/ai/components/AiAssistant/shared/sseState.ts

/**
 * SSE 流式响应状态枚举
 * @description 跟 Vue 解耦,纯 TS,可被 store / message / 模板共用
 */

export enum SseState {
  /** 初始态(未开始) */
  Idle = 'idle',
  /** 等待后端响应(连接中) */
  Loading = 'loading',
  /** 正在流式接收 */
  Streaming = 'streaming',
  /** 正常完成 */
  Done = 'done',
  /** 出错 */
  Error = 'error',
  /** 外部 abort(stopGeneration) */
  Aborted = 'aborted'
}

/**
 * 状态是否为终态(不可再切)
 */
export function isTerminalState(state: SseState): boolean {
  return state === SseState.Done || state === SseState.Error || state === SseState.Aborted
}

/**
 * 状态是否可重试
 */
export function isRetryableState(state: SseState): boolean {
  return state === SseState.Error
}
```

**Step 2: 在 `ai.ts` store 顶部 import + 使用**

```ts
// wk-train-center-ui-v3/src/stores/modules/ai.ts 顶部
import { SseState, isTerminalState, isRetryableState } from '@/views/web/ai/components/AiAssistant/shared/sseState'

// 在 sendAnswer 函数内,标记 streaming 时:
aiMsg.state = SseState.Streaming  // ← 替代散落的 loading 布尔
```

(具体怎么替换 `loading` 字段 → `state` 字段,需要看现有 `AiMessage` 接口定义;**保持原有逻辑,不擅自扩展**——只新增 `state` 字段,`loading` 保留兼容)

**Step 3: typecheck + vite dev curl**

(同 B.7)

**Step 4: commit**

```bash
git add wk-train-center-ui-v3/src/views/web/ai/components/AiAssistant/shared/sseState.ts \
        wk-train-center-ui-v3/src/stores/modules/ai.ts
git commit -m "refactor(ai): 抽 SseState enum 到独立 TS 文件,跟 Vue 解耦"
```

---

## 不在本计划范围(挂后门,等用户拍)

| 任务 | 阻塞 |
|---|---|
| B.10 SSE 自动重连 | 用户偏好"不擅自装新库",需要先确认设计 |
| B.11 改 `VITE_AI_STREAM_ENABLED` 默认值 | 等业务方确认后端 SSE 端点 URL 真实存在 |
| B.12 写 SSE mock 测试工具 | 等业务方确认端点 URL 才有意义 |
| 4 个 v3 缺失组件(AssociatedKnowledge / AdminMultiAdd / AiPptGenerator / CourseFileRefDialog) | 用户已确认归属但不起手,等用户拍起手 |
| 起手包 A 漏洞修复 | 已完成,挂后门 |
| 起手包 C/D | 等用户拍 |

---

## 风险/开放问题(必须问用户才能继续)

| # | 问题 | 阻塞 |
|---|---|---|
| 1 | B.7 真实流式失败降级 → 用户体验是"打字机样式占位"还是"报错提示"? | B.7 决策 |
| 2 | B.8 错误消息文案 `加载失败,请点击重试` 是占位,需业务方确认 | B.8 决策 |
| 3 | B.9 新增 `state` 字段后,**是否要删 `loading` 字段**(彻底替换)还是**保留兼容**(渐进迁移)? | B.9 决策 |
| 4 | `VITE_AI_STREAM_ENABLED` 当前写死 false,默认应该 true 还是 false? | B.11 决策 |
| 5 | "开始 b" 是不是真的指 web/ai 流式核心,还是**管理端课程管理 - 课件管理**? | **本计划整个起手** |

---

## 任务总览(3 个,2-5 分钟/任务)

| 任务 | 文件 | 估计 |
|---|---|---|
| B.7 fetchSseOrFallback 优雅降级 | 1 文件 | 5 min |
| B.8 sendAnswer 错误状态标记 | 3 文件 | 5 min |
| B.9 抽 SseState 独立 TS | 2 文件 | 3 min |

**总: 13 min,6 文件改动,符合"按你逻辑"+ 不卡小步**。

---

## 验证(2 绿)

每任务后:
1. `npx vue-tsc --noEmit -p tsconfig.check.json --skipLibCheck` → 0 errors
2. `npx vite` + `curl` 关键文件 → HTTP 200

---

## 下次会话起手

**如果你确认 "b = web/ai 流式核心"**:
- 用户在 IDE 拍"开始执行",我按 Task B.7 → B.8 → B.9 顺序推进
- 关键决策点 5 个,在 plan 执行前 IDE `clarify` 一次

**如果你实际想要 "b = 管理端课件管理"**:
- 本计划废弃,重写 plan(范围是 4 个缺失组件 + file.vue 主体)
- 起手包:AssociatedKnowledge 临时公共位置 + 其他 3 个课件模块内

**期间不动键盘**(plan skill 强制)。
