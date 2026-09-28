---
version: 1.0.0
project: wk-train-center
taskType: task-tracker
status: ACTIVE
createdAt: 2026-07-15
owners:
  - 主人(拍板+验收)
  - Claude(A)
  - Qoder(B)
workflow:
  - 1a: A 做 → 2b: B 审 → 3a: A 根据审改 → 4a: A 复审 → 主人拍板
rule: 不动对方代码,改完立刻更新本表,有问题立刻汇报
---

# AI 网关 M1 任务分工 + 追踪表(2026-07-15 / Claude A 起草)

> **协作铁律**:1a A 做 → 2b B 审 → 3a A 根据审改 → 4a A 复审 → 主人拍板
> **本表规则**:
> - 每次改完任务,**改 column「Status / B 审 / A 改 / A 复审 / 备注」**
> - 有问题立刻在「B 审 / A 改」列写"❌ 改:xxx",A 改完写"✅ 已改:xxx"
> - 主人回滚的,在「备注」列写"⚠️ 回滚:xxx,原因:xxx"
> - 任何一方不动对方代码,跨文件改动先在「备注」标"⚠️ 跨文件:请 B/A 接手"

---

## 〇、任务总览(16 任务,含主人加码)

| # | 任务标题 | 估时 | 实施 | 审核 | 复审 | 主人验收 |
|---|---|---|---|---|---|---|
| 0 | 基线采预(50 题旧答案) | 0.5d | Qoder(B) | Claude(A) | Claude(A) | 主人 |
| 1 | 统一 SSE chunk 协议(8 类型) | 0.5d | Claude(A) | Qoder(B) | Claude(A) | 主人 |
| 2 | 请求 DTO + 配置中心骨架 | 0.5d | Claude(A) | Qoder(B) | Claude(A) | 主人 |
| 3 | ChatApiUtils 扩展 **Responses API** 流式 + include_usage | 1.5d | Claude(A) | Qoder(B) | Claude(A) | 主人 | **D15 全面返工:OpenAI Chat Completions → Responses API** |
| 4 | AgentConfigService 配置中心(简化为 model + vector_store_id) | 0.3d | Claude(A) | Qoder(B) | Claude(A) | 主人 | **D15/D19:删 tool 注册逻辑** |
| 5 | ToolExecutor 简化为配置类(MCP 留口) | 0.2d | Claude(A) | Qoder(B) | Claude(A) | 主人 | **D15:不写 tool 实现** |
| 6 | KB(file_search) + WebSearch + WebExtractor 透传 | 0.2d | Claude(A) | Qoder(B) | Claude(A) | 主人 | **D16/D17:百炼内置 3 工具,纯透传** |
| 7 | AgentReActExecutor 简化为事件透传 | 1d | Claude(A) | Qoder(B) | Claude(A) | 主人 | **D15:百炼自跑 ReAct,我们只透传** |
| 8 | MessageChunkClassifier(12 type) + Controller + Service | 1.3d | Claude(A) | Qoder(B) | Claude(A) | 主人 | **改 12 类型:原 8 + usage/metadata/progress/interrupt** |
| 9 | v2 chatAgentStream 适配(前端切流) | 1.5d | Qoder(B) | Claude(A) | Qoder(B) | 主人 |
| 10 | v2 错误增强 + UI 组件 | 1d | Qoder(B) | Claude(A) | Qoder(B) | 主人 |
| 11 | H5 chatAgentStream + UI 增强(+ 切流开关) | 1d | Qoder(B) | Claude(A) | Qoder(B) | 主人 |
| 12 | 联调与回归测试(50 题基线) | 1.5d | 联合(A+B) | 主人 | - | 主人 |
| 13 | 精确缓存(同 query 命中) | 1d | Claude(A) | Qoder(B) | Claude(A) | 主人 |
| 14 | 成本埋点(按 user/promptKey)+ usage 收口 | 0.5d | Claude(A) | Qoder(B) | Claude(A) | 主人 |
| 15 | Prompt 版本管理(yml version + git tag) | 0.5d | Claude(A) | Qoder(B) | Claude(A) | 主人 |
| 16 | AI 调试台(Playground)+ 管理员权限 | 4.3d | 16.1 A / 16.2~16.6 B | A ↔ B 互审 | 主人 | 主人 |
| **总** | | **~22d** | | | | |

**任务 6 实施前硬前置**:
- 🔴 **主人必须在 CfgPropService 配**:type=`ai` provider=`bailian_web_search` key=`apiKey` value=`<主人百炼 key>`(D10 决策,任务 6 启动前必须)
- 🔴 **Qoder 任务 0 在 M1 实施前完成**(50 题基线,任务 12 验收依赖)

---

## 一、详细分工(每任务:谁写、谁测、怎么审、复审节点)

### 任务 0:基线采预(50 题旧答案)

| 维度 | 内容 |
|---|---|
| **实施** | Qoder(B) |
| **代码改动** | 仅前端,不动后端 |
| **步骤** | 1) 主人给 50 题清单(答疑页近 1 个月日志抽) → 2) Qoder 写 Node 脚本 `scripts/baseline-collect.js`,调老的 `chatAppStream` 跑 50 题 → 3) 输出 `baseline-answers.json` |
| **测试** | 1) 跑完 50 题无报错 2) JSON 文件 50 条记录完整 3) 答案长度合理(>50 字) |
| **交付物** | `wk-train-center-service/scripts/ai-baseline-diff.py`(diff 脚本)+ `baseline-answers.json` |
| **B 审** | - |
| **A 改** | - |
| **A 复审** | Claude 校验 JSON 结构 + 抽样 5 条语义合理性 |
| **主人验收** | 拍板 50 题清单 OK 后,Qoder 跑 |

### 任务 1:统一 SSE chunk 协议(8 类型)

| 维度 | 内容 |
|---|---|
| **实施** | Claude(A) |
| **代码改动** | 仅 `wk-modules/wk-module-ai/.../controller/model/AgentChatChunkVo.java`(新增 1 文件) |
| **依赖** | 无 |
| **测试** | Jackson 序列化/反序列化 round-trip 单测 + 8 type 字符串独立单测 |
| **A 改** | - |
| **B 审** | Qoder 看 VO 字段与 §4 schema 是否对得上,字段命名是否符合前端 16.2 调试台预期 |
| **A 复审** | Claude 看完 B 审意见,逐条回复 ✅/❌ |
| **主人验收** | 拍板字段对齐 §4 schema |

### 任务 2:请求 DTO + 配置中心骨架

| 维度 | 内容 |
|---|---|
| **实施** | Claude(A) |
| **代码改动** | `AgentChatRequestDto.java`(新增)+ `application-ai.yml`(新建) |
| **依赖** | 任务 1 |
| **测试** | DTO `@NotEmpty` 校验单测 + yml 加载无格式错误 |
| **B 审** | Qoder 看 DTO 字段是否够前端用(8 type 接收 + 多 fileList + bizParams)+ yml promptKey 列表是否够 3 个(answer/training/quiz) |
| **A 复审** | 逐条 ✅/❌ |
| **主人验收** | 拍板 yml 模型/candidates 是否保留百炼(去掉 glm-4.6) |

### 任务 3:ChatApiUtils 扩展纯模型流式(+ include_usage)

| 维度 | 内容 |
|---|---|
| **实施** | Claude(A) |
| **代码改动** | `yf-ability/.../ai/utils/ChatMsgUtils.java` + `yf-ability/.../ai/utils/chat/ChatApiUtils.java`(修改 2 文件) |
| **依赖** | 任务 1 |
| **测试** | 1) tool_calls 增量累积 3 case 2) reasoning_content 分流 1 case 3) **include_usage 单测**(Qoder 漏洞 4) |
| **B 审** | Qoder 看是否漏掉 `stream_options: {include_usage: true}`(任务 14 成本埋点依赖) |
| **A 复审** | 逐条 ✅/❌ |
| **主人验收** | 拍板 include_usage 字段命名(input_tokens / output_tokens / total_tokens) |

### 任务 4:AgentConfigService 配置中心

| 维度 | 内容 |
|---|---|
| **实施** | Claude(A) |
| **代码改动** | `application/AgentConfigService.java` + impl(新增 2 文件) |
| **依赖** | 任务 2 |
| **测试** | getSystemPrompt / getDefaultModel / isToolEnabled / resolveTools 各自单测 |
| **B 审** | Qoder 看 promptKey 列表 / KB pipelineId 读取 / web_search.providers 路由逻辑(Qoder 漏洞 3:apiKey 拆分) |
| **A 复审** | 逐条 ✅/❌ |
| **主人验收** | 拍板 CfgPropService provider name 命名(bailian_web_search / tavily_web_search / bocha_web_search) |

### 任务 5:ToolExecutor + ToolRegistry 接口(MCP 留口)

| 维度 | 内容 |
|---|---|
| **实施** | Claude(A) |
| **代码改动** | `application/tool/ToolExecutor.java` + `ToolRegistry.java`(新增 2 文件) |
| **依赖** | 任务 4 |
| **测试** | Registry 路由单测(按 name 找到正确实现) |
| **B 审** | Qoder 看接口命名是否兼容 MCP 风格(主人 §13.9 A2 决策是"实现层留口",不是"接口风格兼容"——A 改完 B 确认留口做对) |
| **A 复审** | 逐条 ✅/❌ |
| **主人验收** | 拍板 MCP 留口位置(实现层空子类,不动接口) |

### 任务 6:KB + WebSearch 工具真实实现(百炼 + include_usage)

| 维度 | 内容 |
|---|---|
| **实施** | Claude(A) |
| **代码改动** | `tool/KnowledgeBaseSearchTool.java` + `tool/WebSearchTool.java`(新增 2 文件)+ yml 改 provider |
| **依赖** | 任务 5 |
| **⚠️ 硬前置** | 1) 主人已配 CfgPropService `bailian_web_search` apiKey(D10 决策) 2) **spike 2d 决定百炼联网搜索接法**(Qoder 漏洞 2) |
| **测试** | 1) KB 真实调通 BailianService 2) WebSearch 真实调通百炼 API 3) 包含 include_usage 透传 4) pipelineId 缺失抛异常 5) apiKey 缺失抛异常 |
| **B 审** | Qoder 看 1) 包含 usage 透传 2) CfgPropService key 拆分 3) spike 报告 |
| **A 复审** | 逐条 ✅/❌ |
| **主人验收** | 拍板 1) spike 走哪条路 2) apiKey 配好后 |

### 任务 7:AgentReActExecutor(本期 ReAct 编排)

| 维度 | 内容 |
|---|---|
| **实施** | Claude(A) |
| **代码改动** | `application/AgentReActExecutor.java`(新增 1 文件) |
| **依赖** | 任务 3 + 5 + 6 |
| **测试** | 5 case(无工具/KB/WebSearch/KB+WebSearch/searchCnt 满)+ tool_calls 累积 + reasoning_content 分流 + max_iterations 保护 + **每轮收尾 + 末轮 emit type=usage** |
| **B 审** | Qoder 看多轮搜索语义(任务 6 决策:1 ReAct 周期内可调 N 次)+ usage 收尾 |
| **A 复审** | 逐条 ✅/❌ |
| **主人验收** | 拍板 usage 收尾字段位置(done 内嵌 vs 独立 type=usage) |

### 任务 8:MessageChunkClassifier + Controller + Service

| 维度 | 内容 |
|---|---|
| **实施** | Claude(A) |
| **代码改动** | `application/MessageChunkClassifier.java` + `application/WkAiAgentService.java` + impl + `controller/WkAiAgentController.java` + `controller/WkAiAgentExceptionHandler.java`(新增 5 文件) |
| **依赖** | 任务 1 + 7 |
| **测试** | 1) Classifier 8 type 拆分 2) Controller 限流 20s 3) 异常场景百炼 401 → AI_AUTH_FAIL 4) SseEmitter 120s 超时 5) grep 验证无 `type=raw` |
| **B 审** | Qoder 看异常文案 5 类(401/429/500/超时/网络) |
| **A 复审** | 逐条 ✅/❌ |
| **主人验收** | 拍板异常文案中文 5 类 |

### 任务 9:v2 chatAgentStream 适配(前端切流)

| 维度 | 内容 |
|---|---|
| **实施** | Qoder(B) |
| **代码改动** | `wk-train-center-ui/src/api/ai/common.js` + `chatStreamGateway.js`(修改 2 文件) |
| **依赖** | 任务 8 |
| **测试** | 1) v2 Network 请求是 `/api/wk/ai/agent/chat-stream` 不是 dashscope 2) 8 type 事件回调 3) `localStorage('ai:useAgentGateway','0')` 切回老链路 |
| **A 审** | Claude 看 1) 灰度策略"服务端优先"实现(主人 §13.8)2) `extractAppTextFromChunk` 已删 3) 8 type 回调完整 |
| **B 改** | Qoder 改完回标 ✅ |
| **A 复审** | Claude 跑 v2 答疑页 + Network + DevTools 验证 |
| **主人验收** | 拍板 8 type 触发与显示正确 |

### 任务 10:v2 错误增强 + UI 组件

| 维度 | 内容 |
|---|---|
| **实施** | Qoder(B) |
| **代码改动** | `AiAssistant.vue`(改)+ `AiMessageMeta.vue`(新增) |
| **依赖** | 任务 9 |
| **测试** | 1) 5 类错误分别显示中文 2) 中断时已生成内容不丢 3) 思考面板外层展开 + 内层折叠 4) 引用角标可点 |
| **A 审** | Claude 看 1) 错误分类函数复用 H5 2) 中断保留 fullText 3) 引用角标 4) 思考面板 UX |
| **B 改** | Qoder 改完回标 ✅ |
| **A 复审** | Claude 跑 5 类错误手动触发 |
| **主人验收** | 拍板 5 类错误文案 |

### 任务 11:H5 chatAgentStream + UI 增强(+ 切流开关)

| 维度 | 内容 |
|---|---|
| **实施** | Qoder(B) |
| **代码改动** | H5 `common.ts` + `useChatSession.ts` + `CitationDrawer.vue`(新增)+ `TrainingAssistantView.vue`(改) |
| **依赖** | 任务 8 |
| **测试** | 1) H5 Network 是 `/api/wk/ai/agent/chat-stream` 2) vitest `common.chatStream.spec.ts` 通过 3) 引用抽屉可开 4) **H5 加 `localStorage('ai:useAgentGateway')` 切流**(Qoder 漏洞 6)5) 错误文案与 v2 一致 |
| **A 审** | Claude 看 1) 切流开关实现(与 v2 共用 localStorage key)2) 引用抽屉 UX 3) 加载骨架 + 重试按钮 |
| **B 改** | Qoder 改完回标 ✅ |
| **A 复审** | Claude H5 手动跑 5 类错误 |
| **主人验收** | 拍板 H5 切流 UX |

### 任务 12:联调与回归测试(50 题基线)

| 维度 | 内容 |
|---|---|
| **实施** | 联合(A+B) |
| **代码改动** | 仅 `ai-baseline-diff.py` 脚本(任务 0 已建),无业务代码改动 |
| **依赖** | 任务 9 + 10 + 11 + 0(任务 0 必填) |
| **测试** | 1) 50 题新链路 ≥ 95% 一致 2) 4 条 grep 0 命中 3) v2 + H5 文字/图片/文档/停止/断网 4) 切流回滚 |
| **A 审** | Claude 跑 diff + grep + 手动 5 类 |
| **B 改** | Qoder 修复前端 bug |
| **A 复审** | Claude 复跑 |
| **主人验收** | 拍板 50 题 ≥ 95% 一致 |

### 任务 13:精确缓存(同 query 命中)

| 维度 | 内容 |
|---|---|
| **实施** | Claude(A) |
| **代码改动** | `application/AgentCacheService.java`(新增)+ `WkAiAgentService.java`(改) |
| **依赖** | 任务 8 |
| **测试** | 1) 同 query 第二次跳过模型(Spy)2) 不同 promptKey 互不命中 3) 不同 userId 互不命中 4) TTL 过期重调 |
| **B 审** | Qoder 看 1) 缓存粒度(简单场景才缓存)2) 命中率统计 |
| **A 复审** | 逐条 ✅/❌ |
| **主人验收** | 拍板缓存粒度(简单 vs 复杂) |

### 任务 14:成本埋点(按 user/promptKey)+ usage 收口

| 维度 | 内容 |
|---|---|
| **实施** | Claude(A) |
| **代码改动** | `application/AgentMetricsService.java`(新增)+ `WkAiAgentService.java`(改) |
| **依赖** | 任务 3 + 8(依赖 include_usage 透传) |
| **测试** | 1) Redis 可见按 userId/promptKey 计数 2) LogInject 4 字段 3) `/metrics/me` 返回 7 天统计 |
| **B 审** | Qoder 看 1) Redis key 格式 2) `/metrics/me` 是否对接未来可视化 |
| **A 复审** | 逐条 ✅/❌ |
| **主人验收** | 拍板 Redis key 命名 |

### 任务 15:Prompt 版本管理(yml version + git tag)

| 维度 | 内容 |
|---|---|
| **实施** | Claude(A) |
| **代码改动** | `application-ai.yml`(改)+ `docs/prompt-versions.md`(新增) |
| **依赖** | 任务 4 |
| **测试** | 1) `getSystemPrompt` 返回含 version 字段 2) version 倒退校验(部署前人工 review,M1 不做运行时)3) `prompt-versions.md` 至少 1 条 |
| **B 审** | Qoder 看 1) version 字段在 yml 嵌套结构(`answer_assistant: { version: "1.0.0", content: "..." }`)2) 文档模板 |
| **A 复审** | 逐条 ✅/❌ |
| **主人验收** | 拍板 yml 结构(嵌套 vs 平铺) |

### 任务 16:AI 调试台(Playground)+ 管理员权限

| 维度 | 内容 |
|---|---|

#### 任务 16.1:后端 API(Claude 0.8d)

| 维度 | 内容 |
|---|---|
| **实施** | Claude(A) |
| **代码改动** | `controller/PlaygroundController.java`(新增) |
| **依赖** | 任务 8 + 4 |
| **测试** | 1) 4 个 endpoint 返回 200 2) `/playground/websearch` 多 provider 并行 + latency_ms 3) `/playground/run` 覆盖 system prompt 4) **权限校验**(Qoder 漏洞 5:管理员才能访问) |
| **B 审** | Qoder 看 1) 4 个 endpoint 设计 2) 权限注解 |
| **A 复审** | 逐条 ✅/❌ |
| **主人验收** | 拍板权限注解(`@PreAuthorize("hasRole('ADMIN')")`) |

#### 任务 16.2:前端骨架(Qoder 1d)

| 维度 | 内容 |
|---|---|
| **实施** | Qoder(B) |
| **代码改动** | `Playground/index.vue`(新增)+ 路由 + 菜单入口 |
| **依赖** | 任务 16.1 |
| **测试** | 1) v2 顶部菜单"AI 调试台"入口 2) 左侧配置 + 右侧调试 3) 8 type SSE 实时渲染 4) 菜单按角色显示 |
| **A 审** | Claude 看 1) 路由守卫(非管理员 404)2) 8 type 渲染完整 3) UX |
| **B 改** | Qoder 改完回标 ✅ |
| **A 复审** | Claude 跑非管理员 404 验证 |
| **主人验收** | 拍板菜单 + 路由 UX |

#### 任务 16.3:KB 调试 UI(Qoder 0.5d)

| 维度 | 内容 |
|---|---|
| **实施** | Qoder(B) |
| **代码改动** | `Playground/index.vue`(加 KB 标签页) |
| **依赖** | 任务 16.1 + 6 |
| **测试** | 1) pipeline 列表下拉 2) 召回片段高亮 3) 对比模式切换(启用 KB vs 不勾) |
| **A 审** | Claude 看 1) 高亮 UX 2) 对比模式 |
| **B 改** | Qoder 改完回标 ✅ |
| **A 复审** | Claude 跑 KB 调试手动 |
| **主人验收** | 拍板召回片段显示格式 |

#### 任务 16.4:WebSearch 调试 UI(Qoder 0.5d)

| 维度 | 内容 |
|---|---|
| **实施** | Qoder(B) |
| **代码改动** | `Playground/index.vue`(加 WebSearch 标签页) |
| **依赖** | 任务 16.1 + 6 |
| **测试** | 1) 多 provider 同时检索 2) N 列对比展示 + latency_ms 3) 单跑 vs ReAct 模式切换 |
| **A 审** | Claude 看 1) N 列对比 UX 2) 模式切换 |
| **B 改** | Qoder 改完回标 ✅ |
| **A 复审** | Claude 跑 WebSearch 调试手动 |
| **主人验收** | 拍板 latency_ms 显示位置 |

#### 任务 16.5:提示词编辑器 + 实时调试(Qoder 1d,主人决定 16.5a/b 是否拆)

| 维度 | 内容 |
|---|---|
| **实施** | Qoder(B) |
| **代码改动** | `Playground/index.vue`(加提示词编辑 + 占位符预览) |
| **依赖** | 任务 16.2 |
| **测试** | 1) system prompt 编辑器可改 2) `{{jdoc}}` 占位符实时替换预览 3) 调试运行 8 type SSE 渲染 |
| **A 审** | Claude 看 1) 占位符高亮 2) 实时替换 |
| **B 改** | Qoder 改完回标 ✅ |
| **A 复审** | Claude 跑占位符替换 |
| **主人验收** | 拍板占位符语法(`{{var}}` vs `${var}`) |

#### 任务 16.6:集成 + 联调(联合 0.5d)

| 维度 | 内容 |
|---|---|
| **实施** | 联合(A+B) |
| **代码改动** | 无,只联调 |
| **依赖** | 16.1~16.5 |
| **测试** | 1) 4 场景 2) 与生产接口对比 3) 50 题基线复跑 4) 写 `docs/playground-acceptance.md` |
| **A 审** | Claude 跑联调清单 |
| **B 改** | Qoder 修前端 bug |
| **A 复审** | Claude 复跑 |
| **主人验收** | 拍板联调通过 |

---

## 二、任务追踪表(每改一次更新一列)

> 状态:⬜ 未开始 / 🟡 进行中 / ✅ 完成 / ❌ 阻塞 / ⚠️ 回滚

| # | 任务 | 实施 | 状态 | B 审 | A 改 | A 复审 | 主人验收 | 备注 |
|---|---|---|---|---|---|---|---|---|
| 0 | 基线采预(50 题) | Qoder | ⬜ | - | - | - | ⬜ | 任务 12 硬前置 |
| 1 | SSE 协议 8 type | Claude | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 2 | DTO + yml 骨架 | Claude | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 3 | ChatApiUtils + include_usage | Claude | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | **Qoder 漏洞 4 关键** |
| 4 | AgentConfigService | Claude | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | **Qoder 漏洞 3:apiKey 拆分** |
| 5 | ToolExecutor + Registry | Claude | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | **主人 §13.9 A2:留口不兼容** |
| 6 | KB + WebSearch 实现 | Claude | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | **硬前置:主人配 apiKey + Qoder 漏洞 2 spike** |
| 7 | AgentReActExecutor | Claude | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 8 | Classifier + Controller + Service | Claude | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 9 | v2 chatAgentStream 适配 | Qoder | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 10 | v2 错误 + UI | Qoder | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 11 | H5 + 切流开关 | Qoder | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | **Qoder 漏洞 6:H5 切流开关** |
| 12 | 联调 + 50 题基线 | 联合 | ⬜ | - | - | - | ⬜ | **Qoder 漏洞 7:任务 0 必填** |
| 13 | 精确缓存 | Claude | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 14 | 成本埋点 + usage 收口 | Claude | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | **依赖任务 3 include_usage** |
| 15 | Prompt 版本管理 | Claude | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 16.1 | 调试台后端 | Claude | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | **Qoder 漏洞 5:管理员权限** |
| 16.2 | 调试台前端骨架 | Qoder | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | **Qoder 漏洞 5:路由守卫** |
| 16.3 | KB 调试 UI | Qoder | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | **主人重点 1** |
| 16.4 | WebSearch 调试 UI | Qoder | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | **主人重点 2 + D10 多轮** |
| 16.5 | 提示词编辑器 | Qoder | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 16.6 | 调试台联调 | 联合 | ⬜ | - | - | - | ⬜ | |

**总进度**:⬜ 0/21 完成(0%)

---

## 三、汇报 / 回滚 / 跨文件规则

### 3.1 汇报规则
- 任一任务在 B 审 / A 改 / A 复审任意环节发现**阻塞性问题**,在「备注」列写:
  ```
  ⚠️ 阻塞:<任务号> <问题描述> @<Y-MM-DD HH:MM>
  ```
- Claude(A) 看到后 24 小时内回标 "🔧 处理方案:..." 或上报主人

### 3.2 回滚规则
- 任一任务在 M1 期间主人决定回滚,在「备注」列写:
  ```
  ⚠️ 回滚:<任务号> <原因> @<Y-MM-DD HH:MM> 主人拍板
  ```
- 实施人立即:
  1) `git revert <commit>` 或 `git reset --hard HEAD~1`(取决于是否已 push)
  2) 标该任务 ⬜ 状态
  3) Claude 评估是否影响其他任务,写"⚠️ 级联影响:..."

### 3.3 跨文件改动规则
- 任何一方动到对方文件,在「备注」列写:
  ```
  ⚠️ 跨文件:<A/B> 动了 <文件路径>,原因:...
  ```
- **必须**通知对方后再继续,不能闷头改

### 3.4 不动对方代码
- A 任务(Claude)只能动后端文件(`wk-train-center-service/`)
- B 任务(Qoder)只能动前端文件(`wk-train-center-ui/` + `wk-mhc-mobile/`)
- 任务 0/12/16.6 联合任务在「备注」标注谁动了哪段

---

## 四、变更日志

- **2026-07-15 v1.0.0**:Claude 起草任务分工 + 追踪表(基于主人 §A 严格协作流程 1a→2b→3a→4a)

---

**文件位置**:`E:\rhProject\.products\projects\wk-train-center\design\2026-07-14-self-ai-gateway(claude)\task-tracker(claude).md`
**作者**:Claude(A)
**待 Qoder 接收**:主人要 Qoder 也建一份 Qoder(B) 视角的追踪表(2 人各管 1 份,定时同步状态)
