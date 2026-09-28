# AI 架构漏洞修复 — 进度留存

> **作者**:Claude · **日期**:2026-07-22 · **版本归属**:wk-train-center/mobile1.2
> **依据**:[2026-07-23-ai-architecture-mind-gaps-review(claude).md](../../mobile/1.5/design/mobile1.2/2026-07-23-ai-architecture-mind-gaps-review(claude).md) 审查报告
> **范围**:本次只处理用户圈定的 8 条 finding(P0-4 / P1-4 / P2-2 / P2-4 / P1-1 / P0-2 / P0-3 / P1-3)
> **状态**:第一批 + 第二批已完成并编译通过;第三批、第四批待做

---

## 一、背景

审查报告共 21 条 finding。用户圈定其中 8 条要求「先核对真实代码是否可行,再出详细计划」。
核对后发现**报告对部分 finding 的严重性描述与现状不符**,经用户确认后按修正后的计划实施。

### 可行性核对结论(文档 vs 真实代码)

| 编号 | 报告说法 | 真实代码状态 | 判定 |
|---|---|---|---|
| **P0-4** | kbList 无校验直接拼进 prompt | 属实。前端已过滤,但后端 `WkAiAgentController` 无二次校验,直接调 API 可注入 | ✅ 已修 |
| **P0-2** | buildErrorChunk 只分 2 类 | **大部分已实现**:两个 Caller 早有 `HttpErrorException`+`mapHttpErrorCode`,前端 `classifyStreamError` 也映射 5 类;只剩执行器兜底是 substring | ✅ 已收尾 |
| **P0-3** | KB 结果/文件摘要无截断、无 history 压缩 | 属实。`KnowledgeBaseSearchTool` topK=5 无上限;`summarizeFilesWithQwenLong` 摘要无截断 | ⏳ 待做 |
| **P1-1** | isClientDisconnect 靠关键字、误判高 | 属实。纯关键字匹配 | ✅ 已修 |
| **P1-3** | 无半行/半 JSON 边界处理 | **报告有误**。`chatAgentStream` 已有行缓冲,SSE 每条 data 是完整 JSON 行,TCP 切片已被行缓冲解决;`TextDecoder{stream:true}` 已处理多字节 | ⚪ 基本非问题 |
| **P1-4** | promptKey 缺失静默兜底 | **是设计权衡**(主人 2026-07-20 决策,防全员崩),已 `log.warn`;报告建议「直接抛异常」反而更危险 | ⚪ 改告警即可 |
| **P2-2** | requestId 没传百炼 header | 属实。两个 Caller 的 Request.Builder 都没加 | ✅ 已修 |
| **P2-4** | `window.__lastChunks__` 生产污染 | 属实。`chatStreamGateway.js` 无条件执行 | ✅ 已修 |

---

## 二、已完成(第一批 + 第二批,均编译通过)

### 第一批:4 条小改(零风险)

| 编号 | 文件 | 改动 |
|---|---|---|
| **P2-4** | `wk-train-center-ui/.../conversation/infrastructure/chatStreamGateway.js` | `window.__lastChunks__` 调试代码包 `process.env.NODE_ENV === 'development'` 守卫,消除生产全局污染 |
| **P2-2** | `BailianChatCaller.java`(call + callSync)、`BailianResponsesCaller.java` | 3 处请求加 `X-Request-Id` header 透传百炼;建连后回读百炼 `x-request-id` 记日志,实现后端↔百炼双向关联 |
| **P1-1** | `WkAiAgentController.java` `isClientDisconnect` | 强类型优先(`SocketException`/`AsynchronousCloseException`/`AsyncRequestNotUsableException` 按类名),关键字兜底去掉过宽的 `"reset"`、补 `"Connection closed"` |
| **P0-4** | `WkAiAgentController.java` | kbList 后端白名单二次校验(仅 `training`/`gongwu`,去重保序,全非法回退 training);工具描述约束语去 markdown 加粗 |

### 第二批:P0-2 错误码分类收尾

| 文件 | 改动 |
|---|---|
| **`BailianHttpException.java`**(新建) | 公共异常类,继承 `IOException`,带 `errorCode` + 静态 `mapHttpErrorCode`(401/403→AUTH_FAIL、429→RATE_LIMIT、其余→INTERNAL) |
| **`BailianChatCaller.java`** | 改用 `BailianHttpException`,删除原内部类 `HttpErrorException` 和私有 `mapHttpErrorCode`(消除重复) |
| **`BailianResponsesCaller.java`** | 同上,改用公共异常,删除重复的内部类与映射方法 |
| **`AgentReActExecutorImpl.java`** | `buildErrorChunk` 新增 `resolveErrorCode`:沿 cause 链优先识别 `BailianHttpException` 拿准确错误码,再 fallback 到关键字兜底 |

**效果**:错误码统一收口。即使 HTTP 异常逃逸到 `execute()` 的 catch,前端也能拿到正确的 `AI_AUTH_FAIL`/`AI_RATE_LIMIT`,提示用户「找管理员」而非「网络错误」。

### 验证状态

- 后端 `wk-module-ai` → **BUILD SUCCESS**(`mvn -pl wk-modules/wk-module-ai -am compile -o -DskipTests`)
- 前端 `chatStreamGateway.js` → 无语法问题
- 遗留 Warning 均为既有 null-safety / 未用 import 提示,非本次引入,无害

---

## 三、待做

### 第三批:P0-3 工具结果大小限制(约 1~1.5 天,需测试)

| 子项 | 文件 | 方案 | 难度 |
|---|---|---|---|
| **P0-3a** KB 检索结果截断 | `KnowledgeBaseSearchTool.java`(execute 返回前) | yml 加 `ai-agent.tools.kb-search.max-result-chars`(默认 20000),`contentBuilder` 超阈截断 + 标注「已截断」 | 易 |
| **P0-3b** 文件摘要截断 | `AgentReActExecutorImpl.summarizeFilesWithQwenLong` | 摘要超阈截断 | 易 |
| **P0-3c** history 压缩 `compactHistory()` | `AgentReActExecutorImpl` 主循环 | token 估算 + 老 history 摘要 | **复杂,建议单独立项**,联调期不动 |

### 第四批:P1-3 / P1-4(可选,低优先)

| 编号 | 方案 |
|---|---|
| **P1-3** | 现状已基本安全;仅在 `chatAgentStream` 加「JSON.parse 失败时把半行缓存到下个 chunk」的保险(可选) |
| **P1-4** | 把 `getSystemPrompt` 兜底时的 `log.warn` 升级为 `log.error`(便于监控告警),**不抛异常**(保留主人决策的兜底语义) |

### 明确不做(本次范围外)

- P1-2 断线 resume(架构级改造,单独立项)
- P1-5 DRY 抽两路径(高风险重构,功能稳定后再做)
- P2-1 STS 临时凭证(依赖阿里云 STS 接入,安全专项)
- P2-6 / 跨项目 1-3(需协调 v2/v3/mobile/mhc-ui 4 个项目抽公共包)

---

## 四、部署注意事项

1. **前后端一起发**:本批含前端改动(`chatStreamGateway.js`),需重新 build dist 与后端一起部署。
2. **错误码契约**:P0-2 收尾后,前端 `classifyStreamError` 已能正确映射 5 类错误码,无需前端额外改动。
3. **回归验证建议**:
   - 中断对话不再刷 ERROR(P1-1 已修,前序会话已验证)
   - 模拟 401/429 看前端 toast 文案(P0-2)
   - 直接调 API 传非法 kbList 被过滤(P0-4)

---

## 变更历史

| 日期 | 作者 | 变更 |
|---|---|---|
| 2026-07-22 | Claude | 初版:第一批(P2-4/P2-2/P1-1/P0-4)+ 第二批(P0-2 收尾)完成;第三/四批待做 |
