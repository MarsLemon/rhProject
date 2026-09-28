# AI 配置控制台 DDD 演进计划

## 一、背景与目标

### 当前问题
- **配置分裂**：连接配置（apiKey/endpoint/KB ID）走 cfg 表，行为参数（tools/react/prompts/apiMode）走 AiAgentProperties（yml 绑定、运行时不可变），前端完全无法管理后者
- **前端缺位**：现有 AiConfig.vue 只管"连接四件套"（chat/voice/vision/kb），模型参数、工具开关、ReAct 调参等高频运维操作仍需改 yml 重启
- **用户核心诉求**：像百炼控制台一样，在前端页面上直接调整 AI 参数并实时生效

### 目标
1. 所有 AI 行为参数可通过前端管理界面读写，无需改 yml / 重启服务
2. 配置读取遵循 DDD 分层：Controller 暴露 → Application 层合并 → Domain 层兜底
3. 向后完全兼容：cfg 表无值时行为与当前完全一致
4. 增量式演进，每一步可独立发布和回滚

---

## 二、架构决策

### D1: 两级配置而非百炼三级

百炼的"全局 > 应用 > 会话"三级对本系统过度设计。当前只有一种 Agent 类型（答疑/陪练），无多租户需求。

**决策**：两级配置
- **全局层**（系统管理员设置）：模型参数、工具开关、ReAct 限制、端点配置
- **场景层**（按 promptKey 区分）：系统提示词（answer_assistant / training_assistant）
- 会话级参数（reasoningEffort 等）已在请求 DTO 中按场景传递，不纳入配置控制台

### D2: 复用 cfg 表而非新建专用表

cfg 表已有成熟的 CRUD（CfgPropService）、权限控制（`@RequiresPermissions`）、前端读写通道（AiConfigController + AiConfig.vue）。新建专用表需配套 mapper/service/controller/前端 API，投入产出比极低。

**决策**：新增 `type=ai_agent, provider=default` 一行，data 字段存储 JSON

### D3: AgentConfigResolver 合并层

引入 `AgentConfigResolver` 组件负责"cfg 优先、AiAgentProperties 兜底"的合并逻辑，复用 AiAgentProperties 的内部类作为反序列化目标，不新建 DTO。

### D4: 本次不拆分 God Object

AgentReActExecutorImpl（73.9KB/1377行）拆分是独立关注点，混入配置控制台会放大风险。本次仅改其配置读取方式。

### D5: 在 wk-train-center-ui（Vue 2）扩展

现有 AiConfig.vue 已在此项目中，管理端用户群固定。v3 前端可按需同步。

### D6: 暂不引入 Redis Pub/Sub 缓存层

当前单实例部署，cfg 表单行查询性能足够。如未来多实例部署，再引入 Eric 方案的双层缓存 + Pub/Sub 广播。

---

## 三、配置域模型

### 3.1 cfg 表新增行

```
type = ai_agent
provider = default
data = {
  "models": {
    "defaultModel": "qwen3.6-plus",
    "maxOutputTokens": 65536
  },
  "tools": {
    "knowledgeBaseSearch": { "enabled": true, "timeoutSeconds": 15 },
    "webSearch": { "enabled": true, "timeoutSeconds": 15 },
    "webExtractor": { "enabled": true, "timeoutSeconds": 15 }
  },
  "react": {
    "maxIterations": 10,
    "maxSearchCount": 5
  },
  "apiMode": {
    "useResponsesApi": true,
    "reasoningEffort": "medium",
    "enableSessionCache": true
  },
  "bailian": {
    "useMaasDomain": false,
    "maasRegion": "cn-beijing"
  },
  "prompts": {
    "answer_assistant": "你是船舶设备维保培训助手...",
    "training_assistant": "你是船舶设备维保陪练..."
  },
  "rateLimitSeconds": 20,
  "sseTimeoutMs": 120000
}
```

### 3.2 配置读取优先级

```
cfg 表有值 → 用 cfg 表值
cfg 表无值 → 用 AiAgentProperties 的 yml 绑定值（含硬编码默认值）
```

### 3.3 前端 UI 结构

在 AiConfig.vue 中用 `<el-tabs>` 分为两个 Tab：
- **Tab 1：连接配置**（现有内容不动）：对话接入 / 知识库 / 语音 / 视觉
- **Tab 2：Agent 行为**（新增）：
  - 模型选择（下拉框）+ maxOutputTokens（数字输入）
  - 工具开关（3 个 el-switch：知识检索 / 联网搜索 / 网页抓取）
  - ReAct 参数（maxIterations / maxSearchCount 数字输入框）
  - API 模式（useResponsesApi 开关 / reasoningEffort 下拉框）
  - 提示词编辑（2 个 textarea，按 promptKey 分开展示，含"恢复默认"按钮）
  - 高级参数（rateLimitSeconds / sseTimeoutMs / useMaasDomain / maasRegion）

---

## 四、实施步骤

### Phase 0: 前置——修复上线阻塞 Bug（可并行）

> R-1/R-2/R-3 优先级最高，配置控制台开发不得占用 bug 修复时间。

| Bug | 内容 | 工时 |
|-----|------|------|
| R-1 | BailianChatCaller errorCode 丢失 | 0.5h |
| R-2 | BailianHttpException.java untracked | 5min |
| R-3 | previousResponseId 链路 bug | 10min |

**与 Phase 1-2 不冲突**：bug 修复集中在 SSE 序列化/文件管理/会话缓存，代码路径不重叠。

---

### Phase 1: 后端——新建 AgentConfigResolver + 扩展 Controller

**Step 1.1: 新建 AgentConfigResolver.java**

文件：`wk-module-ai/.../application/config/AgentConfigResolver.java`

```java
@Component
@RequiredArgsConstructor
public class AgentConfigResolver {
    private final CfgPropService cfgPropService;
    private final AiAgentProperties aiAgentProperties;

    public Models resolvedModels() { ... }
    public Tools resolvedTools() { ... }
    public React resolvedReact() { ... }
    public ApiMode resolvedApiMode() { ... }
    public BailianEndpoint resolvedBailian() { ... }
    public String resolvedPrompt(String promptKey) { ... }

    // 核心方法：cfg JSON → 反序列化为 AiAgentProperties 内部类，null 则 fallback
    private <T> T readCfgOrDefault(String field, Function<AiAgentProperties, T> fallback) { ... }
}
```

**Step 1.2: 扩展 AiConfigController**

文件：`wk-module-ai/.../controller/AiConfigController.java`

- `all()` 方法增加：`result.put("agent", parseData(cfgPropService.detail("ai_agent", "default")))`
- `saveAll()` 方法增加：`rows.add(buildRow("ai_agent", "default", body.get("agent")))`

**Step 1.3: 扩展 AiGatewayConstants**（可选）

文件：`wk-module-ai/.../application/config/AiGatewayConstants.java`

新增常量：
```java
public static final String AGENT_CONFIG_TYPE = "ai_agent";
public static final String AGENT_CONFIG_PROVIDER = "default";
```

---

### Phase 2: 后端——消费方切换到 Resolver

**Step 2.1: 修改 AgentConfigServiceImpl**

文件：`wk-module-ai/.../application/impl/AgentConfigServiceImpl.java`

- 注入 `AgentConfigResolver`
- `getDefaultModel()` → `agentConfigResolver.resolvedModels().getDefaultModel()`
- `getSystemPrompt()` → `agentConfigResolver.resolvedPrompt(promptKey)`

**Step 2.2: 修改 AgentReActExecutorImpl**

文件：`wk-module-ai/.../application/react/AgentReActExecutorImpl.java`

- 注入 `AgentConfigResolver`（与 `AiAgentProperties` 并存过渡）
- 所有 `aiAgentProperties.getTools()` → `agentConfigResolver.resolvedTools()`
- 所有 `aiAgentProperties.getReact()` → `agentConfigResolver.resolvedReact()`
- 所有 `aiAgentProperties.getApiMode()` → `agentConfigResolver.resolvedApiMode()`
- 所有 `aiAgentProperties.getBailian()` → `agentConfigResolver.resolvedBailian()`

**关键**：逐个替换 + 编译验证，不做大规模重构。先 grep 所有 `aiAgentProperties.` 引用点确保无遗漏。

---

### Phase 3: 前端——扩展 AiConfig.vue

**Step 3.1: 扩展后端 AiConfig.vue**

文件：`wk-train-center-ui/src/views/admin/sys/config/components/AiConfig.vue`

- 在现有表单下方（或改为 `<el-tabs>` 分区）新增"Agent 行为配置"区块
- `fetchData()` 新增：`fetchPropDetail('ai_agent', 'default', false)`
- `submitForm()` 新增 `buildAgentPayload()` → 构建 `{ type: 'ai_agent', provider: 'default', data: {...} }`
- 每个字段旁显示 AiAgentProperties 默认值作为 placeholder
- 提示词编辑区增加"恢复默认"按钮
- 敏感字段（如 apiKey 如果纳入）显示脱敏值

**Step 3.2: 前端 API 适配**

文件：`wk-train-center-ui/src/api/ai/config.js`

无需新增 API 函数——现有 `fetchAiConfigAll()` / `saveAiConfigAll()` 已支持透传 JSON，只需在调用处增加 `agent` 字段处理。

---

### Phase 4: 前端 v3 同步（可选，低优先级）

文件：`wk-train-center-ui-v3/src/views/admin/sys/config/components/AiConfig.vue`（如已有）

策略同 Phase 3，复用相同后端 API。若 v2 即将下线可跳过。

---

### Phase 5（远期）: 调试台实时切换

在 AI 对话界面增加"调试台"面板，允许临时切换模型/思考档位（不改 cfg 持久化）。利用 `chatStream()` 已有的 `dto.getTools().getThinkingLevel()` 机制，纯前端变更。

---

## 五、依赖关系

```
Phase 0 (Bug修复) ──── 可并行，不阻塞后续 ────→
    ↓
Phase 1 (Resolver + Controller)
    ↓
Phase 2 (消费方切换) ←── 依赖 Phase 1 的 Resolver
    ↓
Phase 3 (前端 v2 UI) ←── 依赖 Phase 1 的 API 扩展
    
Phase 4 (前端 v3 UI) ←── 可与 Phase 3 并行
Phase 5 (调试台)     ←── 独立，无前置依赖
```

---

## 六、回滚策略

每一步都可独立回滚：
- **Phase 1**：删除 Controller 中新增的两行代码
- **Phase 2**：AgentReActExecutorImpl 回退到直接读 AiAgentProperties
- **Phase 3**：删除前端新增的 template 区块
- **数据层**：删除 cfg 行 `type=ai_agent, provider=default` → 全部 fallback 到 AiAgentProperties Java 默认值，零影响

---

## 七、风险与缓解

| 风险 | 等级 | 缓解 |
|------|------|------|
| cfg 表查询频率增加 | 中 | AgentConfigResolver 内部可加 30s TTL 缓存；CfgPropService 已有 @Cacheable |
| AgentReActExecutorImpl 改造范围大 | 中 | 逐字段替换+编译验证，不改业务逻辑 |
| 提示词编辑误操作 | 低 | 前端"恢复默认"按钮 + 后端空字符串 fallback 到默认值 |
| 前端改错参数导致 AI 不可用 | 低 | 前端范围校验（maxIterations: 1-20, maxSearchCount: 1-10）+ 删 cfg 行即回滚 |
| 双层缓存不一致（未来多实例） | 低 | 当前单实例不触发；未来引入 Redis Pub/Sub 广播失效 |

---

## 八、未来演进（本次不做）

1. **God Object 拆分**：AgentReActExecutorImpl 拆为 ChunkBuilder / StageEmitter / FileSummaryService 等独立类
2. **配置版本管理**：保存前创建快照，支持回滚到历史版本
3. **Token 消耗监控**：AiUsageCollector 收集每次对话的 token 消耗，前端展示日均消耗/单对话成本
4. **多场景配置**：为 AI 出题、AI 评估等新场景提供独立配置（sceneConfigs: Map）
5. **Redis Pub/Sub 多实例同步**：多实例部署时引入双层缓存 + 广播失效
6. **跨前端公共 npm 包**：ai-types + error-classifier 统一 4 个前端项目

---

## 九、被拒绝的方案

| 方案 | 来源 | 拒绝理由 |
|------|------|----------|
| 全新配置域 DDD 建模（聚合根+实体+值对象） | Sam 调研建议 | 过度设计，当前只有 20 个配置项，不需要独立聚合根 |
| 百炼式三级配置（空间>应用>会话） | 百炼参考 | 本系统无多租户/多Agent实例需求，两级足够 |
| Redis Pub/Sub + AiConfigSnapshot 双层缓存 | Eric 方案 | 当前单实例部署，引入 Redis Pub/Sub 增加复杂度但无收益 |
| 在 wk-train-center-ui-v3 新建配置页 | 考虑过 | 现有 AiConfig.vue 在 v2 项目，已有完整权限/布局/API通道，不值得单独起 v3 项目 |
| 本次一并拆分 God Object | 考虑过 | 配置源切换和内部重构是两个独立关注点，混在一起放大风险 |
| RESTful 细粒度 API（/config/models, /config/tools...） | 考虑过 | 配置项总数不超 20 个字段，一次传输无性能问题，粗粒度 all/save-all 更简洁 |

---

## 十、关键文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `wk-module-ai/.../application/config/AgentConfigResolver.java` | **新建** | 核心合并逻辑 |
| `wk-module-ai/.../controller/AiConfigController.java` | 修改 | 扩展 all/save-all |
| `wk-module-ai/.../application/impl/AgentConfigServiceImpl.java` | 修改 | 委托 Resolver |
| `wk-module-ai/.../application/react/AgentReActExecutorImpl.java` | 修改 | 改用 Resolver 读配置 |
| `wk-train-center-ui/.../config/components/AiConfig.vue` | 修改 | 新增 Agent 行为 Tab |
| `wk-module-ai/.../application/config/AiAgentProperties.java` | 不动 | 保留为 fallback 源 |

---

## 十一、工时估算

| Phase | 内容 | 预估工时 |
|-------|------|----------|
| Phase 0 | Bug 修复（R-1/R-2/R-3） | 1h |
| Phase 1 | Resolver + Controller 扩展 | 1d |
| Phase 2 | 消费方切换（AgentConfigServiceImpl + ReActExecutor） | 1d |
| Phase 3 | 前端 AiConfig.vue 扩展 | 1-2d |
| Phase 4 | v3 同步（可选） | 0.5d |
| 联调测试 | 端到端验证 | 1d |
| **总计** | | **4-5.5d** |