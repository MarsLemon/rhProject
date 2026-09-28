---
version: 1.0.0
project: wk-train-center
taskType: student-frontend-migration
status: PENDING-OWNER-APPROVAL
createdAt: 2026-07-15
lastUpdated: 2026-07-15
tags:
  - ai-gateway
  - student-frontend
  - urgent-demo
  - ai-qa
  - ai-training
supersedes: 临时口径,统一计划已作废
supersededAt: 2026-07-15
relatedPlan: ../../../tasks/2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md
owners:
  - 主人(拍板+验收)
  - Claude(后端 A)
  - Qoder(前端 B)
workflow:
  pattern: 1a A 做 → 2b B 审 → 3a A 根据审改 → 4a A 复审 → 主人拍板
  rule: 不动对方文件,有改立刻更新追踪表
relatedNotes:
  - 参考当前统一计划文件设计:"大概兼容"原方案核心(ReAct 透传 + SSE 协议 + yml 配置)
  - 本轮**不做控制台**,排 M1.1
---
# 学员端 AI 网关迁移设计 v1.0(2026-07-15 / claude 起草)

> **状态**:主人紧急口径调整后独立起草。
> **本计划承接统一计划 v1.0+16 的核心**(ReAct 透传 + SSE 协议 + yml 配置 + 百炼 Responses API 三大内置工具),**范围重定义**为"学员端 AI 问答 + AI 陪练业务功能",**控制台任务 16 本轮不做**(后置 M1.1)。

---

## 0. 触发(主人原话)

> "目前接到紧急通知,领导急需先展示出来,也就是重心放在了学员端的直接使用上面,**AI 问答和 AI 陪练这里先要做**,**控制台优先级先往后放一放**。重新根据我们之前谈的,以及 demo 和现有的 train-center-ui(前端) mobile(H5)和后端**重新设计一个可以大概兼容我们本次设计的内容**,**重心放在前台替换,提示词先放在后端**。"

**主人第二次澄清(API Key + 模型 + 多 KB)**:

> "DASHSCOPE_API_KEY 通过 `api/sys/config/prop/detail` 这个接口获取,参数为
>
> - `provider: 'default'`, `type: 'bailian_kb'`(**获取 workspaceId**)
> - `provider: 'bailian'`, `type: 'ai'`(**获取 key**)
>
> 使用百炼的模型 **glm-5.2**
>
> 尽量参考 demo,**不需要 demo 中的 AI 纠错 AI 逻辑(重要)** 只需要
>
> 还有就是**知识库有两个**:
>
> - `{ label: '培训知识库', value: 't7tv9lmp6f' }`
> - `{ label: '工务知识库', value: 'tf6gvf9i8z' }`
>   培训的跟着系统中来获取源文件,工务知识库这个的话先留出口来,**如果是知识库召回的文件需要知道哪个知识库**"
>
> **主人第三次澄清(2026-07-15 下午)**:
> "kb 这个放在数据库中配置吧,正好我的项目中 cfg 有关于知识库的配置" → **D32 决策**

**grill-me 反问已答**:

- API Key 走 CfgPropService(type=`ai` / `bailian` provider=`default` / `bailian`)?**主人说走 `api/sys/config/prop/detail` 接口**——这是本仓现有 `WkAiAgentController` 用的接口
- 默认模型 = **`glm-5.2`**(主人 D27,变更 D13)
- KB = **2 个**:`t7tv9lmp6f`(培训) + `tf6gvf9i8z`(工务)
- demo 范围:**只要"知识库检索 + 联网搜索" 2 个 AI 能力**;**不要 A2 评分 / A3 纠错**

---

## 1. 本轮(M1.0 学员端)范围

### 1.1 必达

- v2 学员端 **AI 问答** 走自建网关(替代老的直连百炼 App)
- H5 学员端 **AI 陪练** 走自建网关(替代老的 `WkTrainingRoleStudentController.aiAsk`)
- 后端统一走 **百炼 Responses API**(`/compatible-mode/v1/responses`)
- **多轮对话重点优化**(主人 D20)
- **知识库检索重点优化**(主人 D20)——对标现有 AI 问答的"展示源"习惯
- **联网搜索支持**(百炼 `web_search` 工具)
- **检索结果展示源文件**(主人 D22 决策)
- 提示词放后端 yml,可改不重启

### 1.2 不做(后置 M1.1)

- ❌ AI 调试台(任务 16,3d)
- ❌ Prompt 版本管理(任务 15,主人拍板可省)
- ❌ 语义缓存 / GPTCache(M2 评估)
- ❌ 精确缓存(任务 13,M1.0 暂不做,M1.1 加)
- ❌ 成本埋点(任务 14,M1.0 暂不做,M1.1 加)
- ❌ Trace / OTel 观测(M2)
- ❌ Human-in-the-loop(M2)
- ❌ Parallel tool calls(M2)
- ❌ MCP 服务 / 插件市场(M3+)
- ❌ 智能体 / 工作流编排画布(M3+)
- ❌ **web_extractor 网页抓取**(本轮不做,主人没提,demo 也不需要)
- ❌ **A2 评分 / A3 纠错 AI 逻辑**(主人 D30 明确不要,demo 也不要)
- ❌ **多 KB 召回源文件展示**(D29 仅做"标识 KB",源文件展示排 M1.1,工务 KB 完整接入)

### 1.3 关于"大概兼容"

主人原话"重新设计一个可以大概兼容我们本次设计的内容"——**保留本次设计的核心**:

| 本次设计核心(统一计划 v1.0+16)         | 本轮是否保留                   |
| -------------------------------------- | ------------------------------ |
| ReAct 编排(百炼自跑)                   | ✅ 保留                        |
| 12 类型 SSE 事件协议                   | ✅ 保留                        |
| yml 配置中心                           | ✅ 保留                        |
| 百炼 Responses API                     | ✅ 保留                        |
| 三大内置工具(file_search + web_search) | ✅ 保留 2 个(去 web_extractor) |
| 多 KB 检索(2 个 vector_store_id)       | ✅ D28 决策                    |
| KB 来源标识                            | ✅ D29 决策                    |
| 灰度开关(localStorage + yml)           | ✅ 保留                        |
| 50 题基线 diff                         | ✅ 保留                        |
| 异常分类(5 类)                         | ✅ 保留                        |
| 引用源文件展示                         | ✅ KB 标识有;源文件详情 M1.1   |
| AI 调试台                              | ❌ 本轮不做                    |
| 精确缓存                               | ❌ 本轮不做                    |
| Prompt 版本管理                        | ❌ 本轮不做                    |
| **A2 评分 / A3 纠错 AI 逻辑**    | ❌ 主人 D30 明确不要           |
| **web_extractor 网页抓取**       | ❌ 本轮不做                    |

---

## 2. 任务清单(11 任务,2 人并行)

### 阶段 0:基线采预(M1.0 启动前,Qoder 必先完成)

#### 任务 0:基线采预(50 题旧答案采)

| 维度               | 内容                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **实施**     | Qoder(B)                                                                                                                                                                  |
| **代码改动** | 仅前端,不动后端                                                                                                                                                           |
| **步骤**     | 1) 主人给 50 题清单(答疑页近 1 个月日志抽) → 2) Qoder 写 Node 脚本`scripts/baseline-collect.js`,调老的 `chatAppStream` 跑 50 题 → 3) 输出 `baseline-answers.json` |
| **测试**     | 跑完 50 题无报错 / JSON 50 条完整 / 答案长度合理(>50 字)                                                                                                                  |
| **交付物**   | `wk-train-center-service/scripts/ai-baseline-diff.py`(diff 脚本)+ `baseline-answers.json`                                                                             |
| **估时**     | **0.5d**                                                                                                                                                            |
| **前置**     | 主人给 50 题清单                                                                                                                                                          |

### 阶段 1:后端基础(Claude 实施,Qoder 审)

#### 任务 1:统一 SSE chunk 协议(12 type + citation)

| 维度               | 内容                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| **实施**     | Claude(A)                                                                    |
| **代码改动** | `wk-modules/wk-module-ai/.../controller/model/AgentChatChunkVo.java`(新增) |
| **依赖**     | 无                                                                           |
| **测试**     | Jackson 序列化 round-trip / 12 type 字符串独立单测                           |
| **估时**     | **0.5d**                                                               |

**12 类型**(+ 主人 D22 新增 `citation`):

```java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AgentChatChunkVo {
    /** 12 种类型:content / thoughts / tool_call / tool_result / citations / file / progress / usage / metadata / interrupt / error / done */
    private String type;
    private Object content;
    private List<Object> thoughts;
    private List<Map<String, Object>> citations;       // 已有,本轮重点
    private Map<String, Object> toolCall;
    private Map<String, Object> toolResult;
    private List<String> files;
    private Map<String, Object> progress;             // 新
    private Map<String, Object> usage;                // 新:独立 chunk 推 token 用量
    private Map<String, Object> metadata;             // 新:model/trace_id/conversation_id
    private Map<String, Object> interrupt;            // 新:human-in-the-loop(M1.1 启用)
    private String errorCode;
    private String requestId;
}
```

#### 任务 2:请求 DTO + yml 骨架

| 维度               | 内容                                                             |
| ------------------ | ---------------------------------------------------------------- |
| **实施**     | Claude(A)                                                        |
| **代码改动** | `AgentChatRequestDto.java`(新增)+ `application-ai.yml`(新建) |
| **依赖**     | 任务 1                                                           |
| **测试**     | DTO`@NotEmpty` 校验 + yml 加载无格式错误                       |
| **估时**     | **0.5d**                                                   |

**DTO 字段**(沿用统一计划 §4):

```java
public class AgentChatRequestDto {
    private String prompt;
    @NotEmpty private List<MessageItem> messages;
    private List<String> fileList;
    private Tools tools;                              // enableKbSearch/enableWebSearch/enableThinking
    private BizParams bizParams;                     // promptKey/model
}
```

**yml**(本轮提示词放这里,**可改不重启**):

```yaml
ai-agent:
  models:
    default: glm-5.2                                 # 主人 D27 决策(从 qwen3.6-plus 改)
    candidates: [glm-5.2, qwen3.6-plus, qwen3.7-plus]
  prompts:
    answer_assistant: |
      你是船舶设备与部件领域的资深答疑导师...
    training_assistant: |
      你是船舶陪练教练,通过角色扮演帮助学员提升业务能力...
  tools:
    knowledge_base_search:
      enabled: true
      # D32 决策:KB 配置走数据库(cfg 表),yml 不写 ID
      # 数据库 cfg 中配置(主人项目已有):
      #   provider: "kb_training", type: "ai"  → 培训 KB(vector_store_id=t7tv9lmp6f)
      #   provider: "kb_gongwu",   type: "ai"  → 工务 KB(vector_store_id=tf6gvf9i8z)
      # AgentConfigService 通过 POST /api/sys/config/prop/detail 读
    web_search:
      enabled: true
    # D17 web_extractor 本轮不加(主人没提,demo 也不需要)
  react:
    max_iterations: 10
  rate_limit_seconds: 20
  sse_timeout_ms: 120000

# 主人 D26 决策:API Key 走 sys/config/prop/detail
# 2 个 provider:
#   - provider: "default", type: "bailian_kb"  → workspaceId
#   - provider: "bailian", type: "ai"          → apiKey
ai-gateway:
  config:
    workspaceId:
      provider: default
      type: bailian_kb
    apiKey:
      provider: bailian
      type: ai
# 主人 D33 决策:删 ai-gateway 段,所有 provider 在 Java 代码硬编码
# 专门类:`AiGatewayConstants`(独立类,不改 yml)
# AgentConfigService 引用:
#   WORKSPACE_ID_PROVIDER = "default",    TYPE = "bailian_kb"
#   API_KEY_PROVIDER      = "bailian",     TYPE = "ai"
#   KB_TRAINING_PROVIDER  = "kb_training", TYPE = "ai"  → 数据库读 vector_store_id
#   KB_GONGWU_PROVIDER    = "kb_gongwu",   TYPE = "ai"  → 数据库读 vector_store_id
```

**新文件 `AiGatewayConstants.java`**(D33,D34 决策:专门类,不混入 AgentConfigService):

**位置**:`wk-modules/wk-module-ai/.../application/config/AiGatewayConstants.java`

**职责**:

- 纯常量(单一职责,只放 provider/type 硬编码)
- 改 provider 名:仅改本类
- 改 API Key/KB ID:改数据库 cfg 表

```java
package com.wk.traincenter.ai.application.config;

/**
 * AI 网关配置中心元数据(D33 + D34 决策)
 * 
 * 职责:硬编码"配置从哪里读"(provider/type),不存真实配置
 *       真实配置(API Key / KB ID)走数据库 cfg 表
 * 
 * 改 provider 名 → 仅改本类 → 重发代码
 * 改 API Key/KB ID → 改数据库 cfg 表 → 不动代码
 */
public final class AiGatewayConstants {

    private AiGatewayConstants() {}

    // 百炼基础配置
    public static final String WORKSPACE_ID_PROVIDER = "default";
    public static final String WORKSPACE_ID_TYPE     = "bailian_kb";
    public static final String API_KEY_PROVIDER      = "bailian";
    public static final String API_KEY_TYPE          = "ai";

    // 知识库配置(D28 + D32 决策)
    public static final String KB_TRAINING_PROVIDER  = "kb_training";
    public static final String KB_GONGWU_PROVIDER    = "kb_gongwu";
    public static final String KB_TYPE               = "ai";

    // 数据库 cfg 表返回的字段名
    public static final String FIELD_WORKSPACE_ID    = "workspaceId";
    public static final String FIELD_API_KEY         = "apiKey";
    public static final String FIELD_VECTOR_STORE_ID = "vectorStoreId";

    // KB 标签(用于 D29 SSE 事件 kbLabel 字段)
    public static final String KB_LABEL_TRAINING     = "培训知识库";
    public static final String KB_LABEL_GONGWU       = "工务知识库";
}
```

**AgentConfigService 引用**(任务 4):

```java
@Service
public class AgentConfigService {
    private CfgPropService cfgPropService;  // 主人项目已有

    public String getWorkspaceId() {
        return getCfgValue(AiGatewayConstants.WORKSPACE_ID_PROVIDER,
                          AiGatewayConstants.WORKSPACE_ID_TYPE,
                          AiGatewayConstants.FIELD_WORKSPACE_ID);
    }
    public String getApiKey() {
        return getCfgValue(AiGatewayConstants.API_KEY_PROVIDER,
                          AiGatewayConstants.API_KEY_TYPE,
                          AiGatewayConstants.FIELD_API_KEY);
    }
    public List<KBConfig> getKnowledgeBases() {
        return List.of(
            new KBConfig(AiGatewayConstants.KB_TRAINING_PROVIDER,
                        getCfgValue(AiGatewayConstants.KB_TRAINING_PROVIDER,
                                  AiGatewayConstants.KB_TYPE,
                                  AiGatewayConstants.FIELD_VECTOR_STORE_ID),
                        AiGatewayConstants.KB_LABEL_TRAINING),
            new KBConfig(AiGatewayConstants.KB_GONGWU_PROVIDER,
                        getCfgValue(AiGatewayConstants.KB_GONGWU_PROVIDER,
                                  AiGatewayConstants.KB_TYPE,
                                  AiGatewayConstants.FIELD_VECTOR_STORE_ID),
                        AiGatewayConstants.KB_LABEL_GONGWU)
        );
    }
    private String getCfgValue(String provider, String type, String key) {
        return cfgPropService.getDetail(type, provider, true).parse(key);
    }
}
```

#### 任务 3:ChatApiUtils 扩展 **Responses API** 流式

| 维度               | 内容                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **实施**     | Claude(A)                                                                                                                       |
| **代码改动** | `yf-ability/.../ai/utils/ChatMsgUtils.java` + `yf-ability/.../ai/utils/chat/ChatApiUtils.java`                              |
| **依赖**     | 任务 1                                                                                                                          |
| **测试**     | tool_calls 增量累积 3 case / reasoning_content 分流 1 case /**include_usage 透传** 1 case / Responses API 事件分类 5 case |
| **估时**     | **1.5d**                                                                                                                  |

**关键**:本次新决策 D15——**改用 Responses API**(`/compatible-mode/v1/responses`),不用 OpenAI 兼容 Chat Completions。

```java
// 拼 payload
public static String genResponsesApiJson(String model, String systemMsg, String userMsg,
                                         List<Map<String, Object>> tools,
                                         boolean stream, boolean enableThinking) {
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("model", model);
    payload.put("input", List.of(
        Map.of("role", "system", "content", systemMsg == null ? "" : systemMsg),
        Map.of("role", "user", "content", userMsg)
    ));
    if (tools != null && !tools.isEmpty()) payload.put("tools", tools);
    if (stream) payload.put("stream", true);
    if (enableThinking) payload.put("extra_body", Map.of("enable_thinking", true));
    return JsonHelper.toJson(payload);
}

// SSE 读流 + 分类响应事件
public static void startResponsesStream(String apiUrl, String apiKey, String jsonPayload,
                                        Consumer<Map<String, Object>> onChunk) {
    // POST apiUrl, headers: Authorization Bearer + X-DashScope-SSE enable
    // 读 SSE 流,解析 data: {...},回调 onChunk
    // 处理 tool_calls 增量累积
    // include_usage 末帧透传
}
```

#### 任务 4:AgentConfigService 配置中心(简化为 yml 读)

| 维度               | 内容                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **实施**     | Claude(A)                                                                                                                                  |
| **代码改动** | `application/config/AiGatewayConstants.java`(新增,纯常量,单一职责,D34 决策)+ `application/AgentConfigService.java` + impl(新增 2 文件) |
| **依赖**     | 任务 2                                                                                                                                     |
| **测试**     | getSystemPrompt / getDefaultModel / isToolEnabled / getWorkspaceId / getApiKey / getKnowledgeBases / getKBLabelMap 各自单测                |
| **估时**     | **0.3d**(从 0.5d 压到 0.3d,简化版)                                                                                                   |

```java
@Service
@Data
public class AgentConfigService {
    // yml 配的(model + prompt + 工具开关 + react 上限)
    private Models models = new Models();
    private Map<String, String> prompts = new HashMap<>();
    private Map<String, ToolConfig> tools = new HashMap<>();
    private React react = new React();
    private RateLimit rateLimit = new RateLimit();

    // D26 + D32 决策:API Key + KB ID 都从数据库读(走 sys/config/prop/detail)
    private CfgPropService cfgPropService;             // 主人项目已有
    private CfgApiConfig config;                       // yml 中 ai-gateway.config 段

    public String getApiKey() {
        return getCfgValue(config.getApiKey().getProvider(), config.getApiKey().getType(), "apiKey");
    }
    public String getWorkspaceId() {
        return getCfgValue(config.getWorkspaceId().getProvider(), config.getWorkspaceId().getType(), "workspaceId");
    }
    /** D32:从数据库读 KB 列表 */
    public List<KBConfig> getKnowledgeBases() {
        return config.getKnowledgeBases().stream()
            .map(kb -> new KBConfig(
                kb.getProvider(),                                                  // "kb_training" / "kb_gongwu"
                getCfgValue(kb.getProvider(), kb.getType(), "vectorStoreId"),       // 真实 ID
                kb.getProvider()                                                  // 用作 label
            ))
            .toList();
    }
    /** D29:KB 来源标识反查(用于 SSE 事件 kbLabel) */
    public Map<String, String> getKBLabelMap() {
        return getKnowledgeBases().stream()
            .collect(Collectors.toMap(KBConfig::getId, KBConfig::getLabel));
    }
    private String getCfgValue(String provider, String type, String key) {
        // 调 POST /api/sys/config/prop/detail {provider, type},返回 data 字段
        // yf-ability 已有 CfgPropService 封装(主人项目)
        return cfgPropService.getDetail(type, provider, true).parse(key);
    }
}
```

#### 任务 5:ToolExecutor 简化为配置类(MCP 留口)

| 维度               | 内容                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| **实施**     | Claude(A)                                                                   |
| **代码改动** | `application/tool/ToolExecutor.java` + `ToolRegistry.java`(新增 2 文件) |
| **依赖**     | 任务 4                                                                      |
| **测试**     | Registry 路由单测(按 name 找到正确实现)                                     |
| **估时**     | **0.2d**(从 0.3d 压到 0.2d,本轮简化)                                  |

**本轮简化**:`ToolExecutor` 接口定义保留(留 MCP 兼容),实现类暂不写(KB 走百炼 file_search 不需要我们实现)。

```java
public interface ToolExecutor {
    String name();
    String description();
    Map<String, Object> parametersSchema();
    Object execute(Map<String, Object> args, String userId);
    // MCP 留口(M1.1 启用)
}
```

#### 任务 6:KB 多库检索 + WebSearch 透传(file_search + web_search,**2 个 KB**)

| 维度               | 内容                                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **实施**     | Claude(A)                                                                                                                                     |
| **代码改动** | 无新工具类(百炼内置),**仅在 ReAct 编排器**组装 tools 数组                                                                               |
| **依赖**     | 任务 5                                                                                                                                        |
| **硬前置**   | 主人已在百炼控制台建 2 个`vector_store_id`:`t7tv9lmp6f`(培训)+ `tf6gvf9i8z`(工务)                                                       |
| **测试**     | 1)**并行 2 次 file_search** 正确发请求 2) 合并 2 个 KB 召回结果 3) **每个 result 携带 KB 来源标识** 4) 1 case 模拟完整 ReAct 流程 |
| **估时**     | **0.4d**(从 0.3d 增 0.1d,实现并行 2 次 + 合并)                                                                                          |

**关键**:D28 决策——**2 个 KB 都查**;D29 决策——**每个召回文件带 KB 来源标识**;**D31 决策——百炼 API 限制 1 个 ID/次,后端并行 2 次 file_search**(主人截图证据)。

```java
// D31 实际实现:并行 2 次 file_search(每次带 1 个 KB)
// 原因:百炼 vector_store_ids 1 个/次
// 占位 KB ID(主人本轮硬前置提供):
//   - t7tv9lmp6f(培训知识库)
//   - tf6gvf9i8z(工务知识库)
List<Map<String, Object>> tools = new ArrayList<>();
if (config.isToolEnabled("knowledge_base_search")) {
    // 单次请求只带 1 个 KB(D31 限制)
    String kbTraining = config.getKBConfigMap().get("t7tv9lmp6f").getId();
    String kbGongwu  = config.getKBConfigMap().get("tf6gvf9i8z").getId();
    tools.add(Map.of("type", "file_search", "vector_store_ids", List.of(kbTraining)));
    tools.add(Map.of("type", "file_search", "vector_store_ids", List.of(kbGongwu)));
    // 注:同名 tool 在 1 次 responses 调用中会冲突
    // 实际:并行 2 次 responses API(每次 1 个 KB)
}
if (config.isToolEnabled("web_search")) {
    tools.add(Map.of("type", "web_search"));
    // D17 web_extractor 本轮不加
}

// D31 实际伪代码(并行 2 次 + 合并):
public List<Citation> search2KB(String query) {
    List<CompletableFuture<Response>> futures = List.of(
        client.responses.create(buildReq(query, kbTrainingId)),  // 培训 KB
        client.responses.create(buildReq(query, kbGongwuId))    // 工务 KB
    );
    return futures.parallelStream()
        .map(CompletableFuture::join)
        .flatMap(resp -> resp.output.stream()
            .filter(item -> "file_citation".equals(item.type)))
        .map(item -> Citation.builder()
            .fileId(item.file_id)
            .kbLabel(kbConfigMap.get(item.vector_store_id).getLabel())  // D29:KB 来源
            .title(item.title)
            .url(item.url)
            .snippet(item.snippet)
            .build())
        .toList();
}
```

#### 任务 7:AgentReActExecutor 事件透传(**多轮对话重点优化**)

| 维度               | 内容                                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **实施**     | Claude(A)                                                                                                                                     |
| **代码改动** | `application/AgentReActExecutor.java`(新增)                                                                                                 |
| **依赖**     | 任务 3 + 5 + 6                                                                                                                                |
| **测试**     | 5 case(无工具/KB/WebSearch/KB+WebSearch/多轮)/ tool_calls 累积 / reasoning_content 分流 / max_iterations 保护 /**多轮对话消息历史累积** |
| **估时**     | **1d**(从 2d 砍到 1d,D15 简化:百炼自跑 ReAct,我们只透传)                                                                                |

**关键变更**(D15):

- 之前:我们自己写 ReAct 循环
- 现在:**百炼自己跑 ReAct**(`responses` 端点),**我们只解析响应事件 + 透传**

```java
// 主循环简化:1 次 responses API 调用,百炼内部跑多轮
for (event : stream) {
    if (event.type == "response.output_text.delta") {
        emit(AgentChatChunkVo.builder().type("content").content(event.delta).build());
    } else if (event.type == "response.reasoning_summary_text.delta") {
        emit(AgentChatChunkVo.builder().type("thoughts").content(event.delta).build());
    } else if (event.type == "response.file_search_call.searching") {
        emit(AgentChatChunkVo.builder().type("tool_call").toolCall(Map.of("id", event.call_id, "name", "knowledge_base_search", "kbId", event.vector_store_id)).build());  // D29:带 kbId
    } else if (event.type == "response.file_search_call.completed") {
        // D29:召回结果带 KB 来源标识(反查 yml 的 KBConfig)
        String kbLabel = config.getKBConfigMap().getOrDefault(event.vector_store_id, new KBConfig("未知 KB")).getLabel();
        emit(AgentChatChunkVo.builder().type("tool_result").toolResult(Map.of(
            "id", event.call_id, "name", "knowledge_base_search",
            "kbLabel", kbLabel,                                                    // D29:KB 来源
            "results", event.results
        )).build());
    } else if (event.type == "response.web_search_call.searching") {
        emit(AgentChatChunkVo.builder().type("tool_call").toolCall(Map.of("id", event.call_id, "name", "web_search")).build());
    } else if (event.type == "response.web_search_call.completed") {
        emit(AgentChatChunkVo.builder().type("tool_result").toolResult(Map.of(
            "id", event.call_id, "name", "web_search", "results", event.results
        )).build());
    } else if (event.type == "response.output_item.done" && event.item.type == "file_citation") {
        // D22:展示源文件
        emit(AgentChatChunkVo.builder().type("citation").citations(item.citations).build());
    } else if (event.type == "response.completed") {
        emit(AgentChatChunkVo.builder().type("done").usage(...).build());
    }
}
```

**多轮对话重点优化**(主人 D20):

- `messages` 数组累积历史 assistant/user 消息
- 上下文窗口管理:超过 1M token 截断
- 短期记忆:本次会话内完整历史
- 长期记忆:排 M1.1(本期不做)

#### 任务 8:MessageChunkClassifier(12 type) + Controller + Service(**citation 事件重点**)

| 维度               | 内容                                                                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **实施**     | Claude(A)                                                                                                                                                                                         |
| **代码改动** | `application/MessageChunkClassifier.java` + `application/WkAiAgentService.java` + impl + `controller/WkAiAgentController.java` + `controller/WkAiAgentExceptionHandler.java`(新增 5 文件) |
| **依赖**     | 任务 1 + 7                                                                                                                                                                                        |
| **测试**     | Classifier 12 type 拆分 / Controller 限流 20s / 异常 5 类(401/429/500/超时/网络)/ SseEmitter 120s 超时 / grep 验证无`type=raw`                                                                  |
| **估时**     | **1.3d**(从 1d 增 0.3d,新增 citation 事件)                                                                                                                                                  |

**Controller 入口**:

```java
@PostMapping(value = "/chat-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter chatStream(@Valid @RequestBody AgentChatRequestDto dto) {
    String userId = UserUtils.getUserId();
    String rateKey = "ai:agent:chat:" + userId;
    if (redisService.hasKey(rateKey)) {
        SseEmitter emitter = new SseEmitter();
        emitter.complete();
        return emitter;  // 简化:返回 RATE_LIMIT 错误事件
    }
    redisService.set(rateKey, rateKey, 20L);
    SseEmitter emitter = new SseEmitter(120_000L);
    try {
        agentReActExecutor.execute(dto, emitter);
    } finally {
        redisService.del(rateKey);
    }
    return emitter;
}
```

**5 类异常**(Qoder 漏洞修复):

```java
public class WkAiAgentExceptionHandler {
    // AI_AUTH_FAIL: 401
    // AI_QUOTA_EXCEED: 429
    // AI_TOOL_FAIL: tool 调用失败
    // AI_INTERNAL: 500 + timeout
    // AI_RATE_LIMIT: 限流
}
```

### 阶段 2:前端学员端切流(Qoder 实施,Claude 审)

#### 任务 9:v2 学员端 AI 问答改造(切流 + KB 引用源展示 + 多轮对话)

| 维度               | 内容                                                                                                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **实施**     | Qoder(B)                                                                                                                                                                                                    |
| **代码改动** | `wk-train-center-ui/src/api/ai/common.js` + `chatStreamGateway.js` + `AiAssistant.vue` + 新增 `AiMessageMeta.vue`                                                                                   |
| **依赖**     | 任务 8                                                                                                                                                                                                      |
| **测试**     | 1) Network 是`/api/wk/ai/agent/chat-stream` 不是 dashscope 2) 12 type 事件消费 3) **`type=citation` 引用源列表展示** 4) 多轮对话消息历史 5) `localStorage('ai:useAgentGateway','0')` 切回老链路 |
| **估时**     | **2d**(从 1.5d 增 0.5d,业务功能深度:多轮 + KB 引用源)                                                                                                                                                 |

**关键变更**(D22):**前端消息气泡下展示 KB + 联网引用源**——对标现有 `WkAnswerStudentController.aiAskId` 行为。

```vue
<template>
  <div class="ai-message">
    <div class="msg-bubble">{{ content }}</div>
    <AiMessageMeta
      :thoughts="thoughts"
      :tool-calls="toolCalls"
      :citations="citations"     <!-- D22:新增引用源展示 -->
      :files="files"
    />
  </div>
</template>
```

**多轮对话**:`messages` 数组累积,后端传历史 + 当前 prompt。

#### 任务 10:v2 错误 + UI + 原文按钮 + 引用源展示

| 维度               | 内容                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **实施**     | Qoder(B)                                                                                                                                |
| **代码改动** | `AiAssistant.vue`(改)+ `AiMessageMeta.vue`(新增)                                                                                    |
| **依赖**     | 任务 9                                                                                                                                  |
| **测试**     | 1) 5 类错误分别显示中文 2) 中断时已生成内容不丢 3) 思考面板外层展开 + 内层折叠 4) 引用角标可点弹出抽屉 5)**原文按钮**展开 KB 全文 |
| **估时**     | **1.3d**(从 1d 增 0.3d,业务功能深度)                                                                                              |

**5 类错误文案**:

| 错误          | 中文文案                     | 来源            |
| ------------- | ---------------------------- | --------------- |
| AUTH_FAILED   | AI 服务鉴权失败,请联系管理员 | 401             |
| RATE_LIMIT    | 请求过于频繁,请稍后再试      | 429             |
| SERVICE_ERROR | AI 服务暂时不可用,请稍后再试 | 500 / 超时      |
| NETWORK_ERROR | 网络连接异常,请检查网络      | Failed to fetch |
| UNKNOWN       | AI 生成失败,请重试           | 兜底            |

#### 任务 11:H5 学员端 AI 陪练改造(切流 + 引用源 + 教学反馈)

| 维度               | 内容                                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **实施**     | Qoder(B)                                                                                                                                                                                       |
| **代码改动** | H5`common.ts` + `useChatSession.ts` + `CitationDrawer.vue`(新增)+ `TrainingAssistantView.vue`                                                                                          |
| **依赖**     | 任务 8                                                                                                                                                                                         |
| **测试**     | 1) Network 是`/api/wk/ai/agent/chat-stream` 2) vitest 通过 3) 引用抽屉可开 4) **`localStorage('ai:useAgentGateway')` 切流** 5) 错误文案与 v2 一致 6) **教学反馈**(评分 + 建议) |
| **估时**     | **1.5d**(从 1d 增 0.5d,业务功能深度:角色扮演 + 教学反馈)                                                                                                                                 |

**H5 教学反馈增强**(D22 + 主人 D20 衍生):

- 评分:百炼返回 `usage` 中的 tokens 估算
- 建议:对标 vue demo `prompts.js` 教学建议话术
- 引用源:与 v2 同样的 `type=citation` 渲染

### 阶段 3:联调(联合,Claude 后端 + Qoder 前端)

#### 任务 12:联调 + 50 题基线

| 维度               | 内容                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **实施**     | 联合(A+B)                                                                                      |
| **代码改动** | 仅`ai-baseline-diff.py` 脚本                                                                 |
| **依赖**     | 任务 9 + 10 + 11 +**0**(任务 0 必填)                                                     |
| **测试**     | 1) 50 题新链路 ≥ 95% 一致 2) 4 条 grep 0 命中 3) v2 + H5 文字/图片/文档/停止/断网 4) 切流回滚 |
| **估时**     | **1.5d**                                                                                 |

**4 条 grep**(Qoder 漏洞 5 + Claude §13.5):

```bash
# 1. v2 无 type=raw
grep -rn "type.*raw\|'raw'\|\"raw\"" wk-train-center-ui/src/ --include="*.js" --include="*.ts" --include="*.vue"
# 2. v2 无 extractAppTextFromChunk
grep -rn "extractAppTextFromChunk" wk-train-center-ui/src/api/ai/
# 3. H5 无 type=raw
grep -rn "type.*raw\|'raw'\|\"raw\"" wk-mhc-mobile/src/
# 4. 后端无 type=raw
grep -rn "type.*raw\|type.*=.*\"raw\"" wk-train-center-service/wk-modules/wk-module-ai/src/
# 5. v2/H5 无 pipeline_id 硬编码(D19)
grep -rn "t7tv9lmp6f\|pipeline_id\|pipelineId" wk-train-center-ui/src/ wk-mhc-mobile/src/
```

---

## 3. 任务总览 + 估时

| #  | 任务                                                          | 估时  | 实施   | 依赖      |
| -- | ------------------------------------------------------------- | ----- | ------ | --------- |
| 0  | 基线采预(50 题)                                               | 0.5d  | Qoder  | 主人给题  |
| 1  | SSE 协议(12 type + citation)                                  | 0.5d  | Claude | —        |
| 2  | DTO + yml 骨架                                                | 0.5d  | Claude | 1         |
| 3  | ChatApiUtils Responses API                                    | 1.5d  | Claude | 1         |
| 4  | AgentConfigService + AiGatewayConstants 独立类(D34 决策)      | 0.35d | Claude | 2         |
| 5  | ToolExecutor 配置类                                           | 0.2d  | Claude | 4         |
| 6  | KB 多库检索(并行 2 次)+ WebSearch 透传(2 个 KB + KB 来源标识) | 0.4d  | Claude | 5         |
| 7  | ReAct 编排(多轮优化)                                          | 1d    | Claude | 3+5+6     |
| 8  | Classifier(12 type)+Controller                                | 1.3d  | Claude | 1+7       |
| 9  | v2 学员端 AI 问答改造                                         | 2d    | Qoder  | 8         |
| 10 | v2 错误 + UI + 原文按钮                                       | 1.3d  | Qoder  | 9         |
| 11 | H5 学员端 AI 陪练改造                                         | 1.5d  | Qoder  | 8         |
| 12 | 联调 + 50 题基线                                              | 1.5d  | 联合   | 0+9+10+11 |

**后端总(Claude 1~8)**:6.5d
**前端总(Qoder 9~11)**:4.8d
**基线 + 联调**:2d
**总估时**:**~13d**(Claude 6.5d + Qoder 4.8d + 联调 1.5d,**2 人并行 ~7-8d**可出学员端功能)

---

## 4. 追踪表(每改一次更新一列)

> 状态:⬜ 未开始 / 🟡 进行中 / ✅ 完成 / ❌ 阻塞 / ⚠️ 回滚
> 协作铁律:1a A 做 → 2b B 审 → 3a A 根据审改 → 4a A 复审 → 主人拍板

| #  | 任务                                                          | 实施   | 状态 | B 审 | A 改 | A 复审 | 主人验收 | 备注                                                                 |
| -- | ------------------------------------------------------------- | ------ | ---- | ---- | ---- | ------ | -------- | -------------------------------------------------------------------- |
| 0  | 基线采预(50 题)                                               | Qoder  | ⬜   | -    | -    | -      | ⬜       | 任务 12 硬前置                                                       |
| 1  | SSE 协议 12 type + citation                                   | Claude | ⬜   | ⬜   | ⬜   | ⬜     | ⬜       | D22 新增 citation                                                    |
| 2  | DTO + yml 骨架                                                | Claude | ⬜   | ⬜   | ⬜   | ⬜     | ⬜       |                                                                      |
| 3  | ChatApiUtils Responses API                                    | Claude | ⬜   | ⬜   | ⬜   | ⬜     | ⬜       | **D15 重大返工**                                               |
| 4  | AgentConfigService + AiGatewayConstants 独立类(D34 决策)      | Claude | ⬜   | ⬜   | ⬜   | ⬜     | ⬜       | **D34 决策:独立类,单一职责**                                   |
| 5  | ToolExecutor 配置类                                           | Claude | ⬜   | ⬜   | ⬜   | ⬜     | ⬜       |                                                                      |
| 6  | KB 多库检索(并行 2 次)+ WebSearch 透传(2 个 KB + KB 来源标识) | Claude | ⬜   | ⬜   | ⬜   | ⬜     | ⬜       | **D28/D29/D31 决策**                                           |
| 7  | ReAct 编排(多轮优化)                                          | Claude | ⬜   | ⬜   | ⬜   | ⬜     | ⬜       | D15 简化:透传                                                        |
| 8  | Classifier(12)+Controller                                     | Claude | ⬜   | ⬜   | ⬜   | ⬜     | ⬜       | D22 citation 事件                                                    |
| 9  | v2 学员端 AI 问答 | Qoder  | 🟡   | ⬜   | ⬜   | ⬜     | ⬜       | ✅ P0已修;✅ KB字段配好(trainingVectorStoreId/gongwuVectorStoreId);联调待验 |
| 10 | v2 错误 + UI + 原文按钮                                       | Qoder  | ⬜   | ⬜   | ⬜   | ⬜     | ⬜       |                                                                      |
| 11 | H5 学员端 AI 陪练                                             | Qoder  | ⬜   | ⬜   | ⬜   | ⬜     | ⬜       | D20 业务功能                                                         |
| 12 | 联调 + 50 题基线                                              | 联合   | ⬜   | -    | -    | -      | ⬜       |                                                                      |

**总进度**:⬜ 0/13 完成(0%)

---

## 5. 主人本轮硬前置(M1.0 启动前必做)

| # | 事项                                                                                       | 用途                      |
| - | ------------------------------------------------------------------------------------------ | ------------------------- |
| 1 | 主人给 50 题清单                                                                           | 任务 0                    |
| 2 | 主人给百炼`workspaceId`(`provider=default type=bailian_kb`)                            | 任务 4 AgentConfigService |
| 3 | 主人给百炼`apiKey`(`provider=bailian type=ai`)                                         | 任务 4 AgentConfigService |
| 4 | 主人确认 2 个 vector_store_id 已建(`t7tv9lmp6f` 培训 + `tf6gvf9i8z` 工务)              | 任务 6                    |
| 5 | 主人确认`glm-5.2` 模型已开通(支持 Responses API + file_search 工具)                      | 任务 3 + 7 + 9 + 11       |
| 6 | **主人在数据库 cfg 表配 2 条 KB provider**:`kb_training` + `kb_gongwu`(D32 决策) | 任务 4 + 6                |

---

## 6. 治理规则(沿用统一计划 §0)

### 6.1 汇报规则

- 任一任务在 B 审 / A 改 / A 复审任意环节发现**阻塞性问题**,在「备注」列写:
  ```
  ⚠️ 阻塞:<任务号> <问题描述> @<Y-MM-DD HH:MM>
  ```
- Claude(A) 看到后 24 小时内回标 "🔧 处理方案:..." 或上报主人

### 6.2 回滚规则

- 任一任务在 M1.0 期间主人决定回滚,在「备注」列写:
  ```
  ⚠️ 回滚:<任务号> <原因> @<Y-MM-DD HH:MM> 主人拍板
  ```
- 实施人立即:`git revert <commit>` 或 `git reset --hard HEAD~1` + 标 ⬜ + Claude 评估级联影响

### 6.3 跨文件改动规则

- 任何一方动到对方文件,在「备注」列写:
  ```
  ⚠️ 跨文件:<A/B> 动了 <文件路径>,原因:...
  ```
- **必须**通知对方后再继续

### 6.4 不动对方代码

- A 任务(Claude)只动后端(`wk-train-center-service/`)
- B 任务(Qoder)只动前端(`wk-train-center-ui/` + `wk-mhc-mobile/`)
- 任务 0/12 联合任务在「备注」标谁动哪段

---

## 7. 决策汇总(本轮涉及的所有 D)

| #             | 决策                                | 内容                                                                                                                                                                                                                           | 来源                                |
| ------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| D1            | 流式模型                            | SseEmitter MVC                                                                                                                                                                                                                 | 主人 D1                             |
| D2            | 百炼模式                            | **纯模型 + Responses API 工具**                                                                                                                                                                                          | 主人 D2 + D15                       |
| D3            | 配置中心                            | 沿用 ai type + 新增 ai-agent 段                                                                                                                                                                                                | 主人 D3                             |
| D4            | 网关 ID                             | **废 appId/appKey**                                                                                                                                                                                                      | 主人 D4                             |
| D5            | 阶段切分                            | 不分阶段                                                                                                                                                                                                                       | 主人 D5                             |
| D6            | v3 端                               | 本期不动                                                                                                                                                                                                                       | 主人 D6                             |
| D7            | 出题 appKey                         | P2 不动                                                                                                                                                                                                                        | 主人 D7                             |
| D8            | 路径风格                            | `/api/wk/ai/agent/chat-stream`                                                                                                                                                                                               | 主人 D8                             |
| D10           | WebSearch provider                  | 阿里云百炼内置                                                                                                                                                                                                                 | 主人 D10                            |
| D11           | WebSearch API Key                   | 复用公用 API Key                                                                                                                                                                                                               | 主人 D11                            |
| D12           | WebSearch 实现                      | 百炼内置 + passthrough                                                                                                                                                                                                         | MCP 文档                            |
| D13           | 默认模型                            | qwen3.6-plus                                                                                                                                                                                                                   | 主人 D13                            |
| D14           | 备选模型                            | glm-4.6 留 yml 注释                                                                                                                                                                                                            | 主人 D14                            |
| D15           | ReAct 架构                          | **百炼自跑**                                                                                                                                                                                                             | MCP 文档                            |
| D16           | KB 工具                             | file_search + vector_store_ids                                                                                                                                                                                                 | MCP 文档                            |
| D17           | 工具组合                            | 本轮:**web_search 单独启用**;web_extractor 本轮**不启用**(M1.1 评估);file_search 独立启用                                                                                                                          | 主人 §13.18 调整                   |
| D19           | 知识库 ID 概念                      | vector_store_id 替换 pipeline_id                                                                                                                                                                                               | 修订 §13.1                         |
| D20           | M1 主目标                           | AI 问答 + AI 陪练                                                                                                                                                                                                              | 主人 §13.16                        |
| D21           | 实现形态                            | 结合现有代码 + vue demo                                                                                                                                                                                                        | 主人 §13.16                        |
| **D22** | **检索展示源文件**            | **KB + 联网都展示**                                                                                                                                                                                                      | 主人 §13.16 + 现有 AI 问答功能对标 |
| **D23** | **本轮范围重定义**            | **M1.0 学员端为主,控制台后置 M1.1**                                                                                                                                                                                      | 主人 §13.17 紧急调整               |
| **D24** | **提示词放置**                | **yml + ConfigurationProperties**                                                                                                                                                                                        | 主人 §13.17                        |
| **D25** | **v2/H5 都上**                | 学员端完整闭环                                                                                                                                                                                                                 | 主人 §13.17                        |
| **D26** | **API Key 获取方式**          | **走 `POST /api/sys/config/prop/detail` 接口,2 个 provider**                                                                                                                                                           | 主人 §13.18                        |
| **D27** | **默认模型改 glm-5.2**        | **`glm-5.2` 默认**(从 `qwen3.6-plus` 改)                                                                                                                                                                             | 主人 §13.18                        |
| **D28** | **多 KB 检索**                | **2 个 KB 都要查**——`t7tv9lmp6f`(培训知识库)+ `tf6gvf9i8z`(工务知识库);**培训 KB 跟系统走**(动态从某个接口获取源文件)                                                                                        | 主人 §13.18                        |
| **D29** | **培训 KB 源文件获取**        | 培训 KB 走系统接口,主人前面定;工务 KB 留口;**召回时带 KB 来源标识**                                                                                                                                                      | 主人 §13.18                        |
| **D30** | **demo 范围**                 | **只要"知识库检索 + 联网搜索"2 个 AI 能力**;**不要 demo 中的 A2 评分 / A3 纠错 AI 逻辑**                                                                                                                           | 主人 §13.18                        |
| **D31** | **2 KB 检索实现**             | **百炼 API 限制 `vector_store_ids` 1 个/次**——**并行 2 次 file_search**(每次带 1 个 KB)合并结果;不是单次 multi-KB                                                                                              | 主人 §13.19 截图证据               |
| **D32** | **KB 配置存放**               | **数据库**(`cfg` / `sys_config` 表,主人项目已有 KB 配置);yml 不再写 KB ID;**走 `POST /api/sys/config/prop/detail`** 读(同 D26)                                                                               | 主人 §13.20                        |
| **D33** | **provider 元信息硬编码**     | **ai-gateway 段全删,所有 provider/type 在 Java 代码常量中**(不动 yml);改了要重发代码                                                                                                                                     | 主人 §13.21                        |
| **D34** | **provider 硬编码位置**       | **独立类 `AiGatewayConstants.java`**,不混入 `AgentConfigService`(单一职责);改 provider 名只改本类                                                                                                                    | 主人 §13.22                        |
| **D35** | **D15 回退(架构调整)**        | **glm-5.2 不支持 Responses API**(实测 2026-07-15 Claude curl:400 InvalidParameter);**回退 D15 改用 Chat Completions API + Java 端自建 ReAct 循环**;保留 D27 默认 glm-5.2                                           | Claude 跑 + 主人口径                |
| **D36** | **WebSearch 选型 spike 结果** | **百炼 web_search 完全可用**(Claude 2026-07-15 实测 glm-5.2 + Chat Completions + web_search 工具,LLM 主动调,得 tool_calls 返回);不切 Tavily                                                                              | Claude 跑                           |
| **D37** | **百炼调用 URL**              | **base_url 从 cfg 读**:`https://{WorkspaceId}.cn-beijing.aliyuncs.com/compatible-mode/v1`(百炼 Maas SDK 模式);**不**用公网 `dashscope.aliyuncs.com`;WorkspaceId 从 cfg(`provider=default type=bailian_kb`)取 | 主人 §13.23                        |
| **D38** | **百炼 OpenAPI accessKey**    | **复用阿里云 OSS 的 accessKey**(同一个);从 cfg `provider="" type="upload"` 读;返回字段 `accessKeyId` + `accessKeySecret` + `arn`;接口 `http://192.168.124.151:8101/api/sys/config/prop/detail`                 | 主人 §13.24                        |

---

## 8. M1.1 后置(本轮不做)

- 任务 13 精确缓存(1d)
- 任务 14 成本埋点(0.5d)
- 任务 15 Prompt 版本管理(0.5d,**主人拍板可省**)
- 任务 16 AI 调试台(3d)

**M1.1 估时合计**:**~5d**

---

## 13.18 Claude 前端自审报告(2026-07-15,转 Qoder)

> **触发**:主人原话"qoder 改完了,你审一下他的前端" → Claude 审完 6 改 + 1 新增文件,**3 处真问题需修,2 处中低优先 M1.1 排**。
>
> **本节给 Qoder 看的具体修复点**。

### 13.18.1 自审总评

| 维度           | 评分                                                                                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 整体质量       | **B+**(449 行新增,覆盖 12 type SSE + 5 类错误 + KB 来源标识 + 灰度开关)                                                                                                                                                  |
| Qoder 改对的事 | 12 项(`apps.js` 加 promptKey、`classifyStreamError`、`chatAgentStream` 路径对、灰度开关、12 type switch、`done` 双触发保护、参数兼容、KB 标识保留、`vm.$message.warning`、`kbLabel` tag、`AiMessageMeta` 组件等) |
| 需修问题       | **🔴 3 个真问题**(不修前端跑不通)+ 🟡 2 个中低优(M1.1 排)                                                                                                                                                                |

### 13.18.2 🔴 真问题 3 个(必改)

#### 🔴 问题 1:SSE 解析丢了 `event:` 字段

**文件**:`src/api/ai/common.js` `chatAgentStream` 内

**问题**:**后端用 `SseEmitter`,实际 SSE 格式是**:

```
event: content
data: {"type":"content","content":"..."}

event: done
data: {"type":"done",...}
```

`event:` 一行 + `data:` 一行(2 行一事件)。**Qoder 只解析 `data:` 行**(JSON 里 `chunk.type` 字段),但**后端用 `SseEmitter.event().name(chunk.getType())`,实际 `type` 在 SSE `event:` 字段**,JSON 里**没** `type` 字段——**前端永远拿不到 type,12 type switch 全部不触发**。

**验证**:后端 `WkAiAgentController` L143-145:

```java
emitter.send(SseEmitter.event()
    .name(chunk.getType())   // type 走 SSE event: 字段
    .data(chunk));            // data 是 JSON,只有 content/citations 等业务字段
```

**修法**:**前端解析 SSE 时同时拿 `event:` 和 `data:` 两行**——`event: content` + `data: {...}` 组合成 `chunk = { type: 'content', content: '...', ... }`:

```javascript
let currentEvent = ''
// 在 lines 循环里:
if (line.startsWith('event:')) {
  currentEvent = line.slice(6).trim()
  continue
}
if (line.startsWith('data:')) {
  const dataStr = line.slice(5).trim()
  // ... JSON.parse ...
  chunk.type = currentEvent || chunk.type  // 优先用 event: 字段
  // 触发 onChunk(chunk)
}
```

#### 🔴 问题 2:chatSession 错误处理兜底没分类型

**文件**:`src/views/web/ai/components/AiAssistant/shared/chatSession.js` L371

**问题**:`classifyStreamError(err)` 传了 Error 对象,**但 Error 对象没有 `errorCode` 属性**——`classifyStreamError` 内部 `err.errorCode || ''` 拿不到,会走到 `default` 分支返回 `AI_INTERNAL`,**所有错误都显示"AI 服务异常"**——失去了 5 类错误分类的意义。

**修法**:`chatSession.js` L371 改:

```javascript
const classified = classifyStreamError(err?.errorCode || err?.code || 'AI_INTERNAL')
```

#### 🔴 问题 3:前端 SSE header `X-DashScope-SSE: enable` 是百炼 SDK 自己的头,后端 SseEmitter 不用

**文件**:`src/api/ai/common.js` `chatAgentStream` L1130(大约)

**问题**:`X-DashScope-SSE` 是百炼 SDK 旧 SDK 模式(`dashscope.aliyuncs.com`)用的,后端 SseEmitter **不识别这个 header**——加了也没用,删了清爽。

**修法**:`common.js` L1130 删 `X-DashScope-SSE: enable` 一行(headers 里只留 `Content-Type` + `Accept`)。

### 13.18.3 🟡 中低优先级问题 2 个(不阻塞 M1,M1.1 排)

#### 🟡 问题 4:`common.js` 错误信息本地化不够

**位置**:`common.js` L1146

**问题**:`err.message.includes('Failed to fetch')` 错误信息本地化不够(英文)。

**修法**:M1.1 排国际化(i18n)时统一处理。本轮可不动。

#### 🟡 问题 5:`chatSession.js` L302 `kbLabel` 来源

**位置**:`chatSession.js` L302

**问题**:`kbLabel` 在聚合 citations 时取自 `tool_result.kbLabel`,但**实际后端代码 L195 emit 时** kbLabel 是放在 `toolResult` 字段,**需要验证后端实现是否对应**。

**修法**:等联调(任务 12)时实测验证。本轮可不动。

### 13.18.4 Qoder 改对的事(12 项,保留)

| #  | 文件                                                                    | 评价                                                                                |
| -- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1  | `apps.js` + `promptKey` 字段                                        | ✅ 对齐 D4 决策(废 appId 改 promptKey)                                              |
| 2  | `common.js` `classifyStreamError` 5 类错误                          | ✅ 对齐后端`AiGatewayConstants.ERROR_*`                                           |
| 3  | `common.js` `chatAgentStream` POST `/api/wk/ai/agent/chat-stream` | ✅ 路径对齐 D8                                                                      |
| 4  | `common.js` `isAgentGatewayEnabled` 灰度开关                        | ✅ 对齐 D4 决策                                                                     |
| 5  | `chatStreamGateway.js` 12 type switch                                 | ✅ content/thoughts/citations/tool_call/tool_result/usage/file/done/metadata 全覆盖 |
| 6  | `chatStreamGateway.js` `done` 双触发保护(`safeOnDone`)            | ✅ 防 race condition                                                                |
| 7  | `chatStreamGateway.js` 兼容旧参数名(`enableSearch` 等)              | ✅ 不破坏旧调用方                                                                   |
| 8  | `chatSession.js` 工具调用步骤聚合 citations + `kbLabel` 保留        | ✅ 对齐 D29                                                                         |
| 9  | `chatSession.js` 错误时 `vm.$message.warning` 统一提示              | ✅ UX 一致                                                                          |
| 10 | `CitationList.vue` 加 `kbLabel` tag                                 | ✅ 对齐 D29                                                                         |
| 11 | `AiMessageMeta.vue` 工具调用可视化(折叠 + KB 标识)                    | ✅ 对齐 D22                                                                         |
| 12 | `AiMessageList.vue` 集成 `AiMessageMeta` 组件                       | ✅                                                                                  |

### 13.18.5 修复优先级(给 Qoder)

| 优先级       | 问题                                 | 估时 |
| ------------ | ------------------------------------ | ---- |
| **P0** | 🔴 问题 1(SSE 解析 event: 字段)      | 0.5h |
| **P0** | 🔴 问题 2(chatSession 错误分类兜底)  | 5min |
| **P0** | 🔴 问题 3(删 X-DashScope-SSE header) | 2min |
| P2           | 🟡 问题 4(错误本地化)                | M1.1 |
| P2           | 🟡 问题 5(kbLabel 联调验证)          | M1.1 |

### 13.18.6 Qoder 改完后续

1. Qoder 改完 3 处后,前端可以跟后端联调
2. Claude 任务 12 联调时:`curl -N -X POST /api/wk/ai/agent/chat-stream` 验证后端 SSE 格式
3. 联调通过 → 任务 12 验收 + 50 题基线 diff

---

## 14. 变更日志

- **2026-07-15 v1.0.0**:Claude 起草本文件,基于主人 §13.16 + §13.17 紧急口径
- 参考:统一计划 v1.0+16 的核心(ReAct 透传 + 12 type SSE + yml 配置 + 百炼 Responses API 三大内置工具)
- 范围重定义:M1 范围 = M1.0 学员端(本计划)+ M1.1 控制台(后置)

---

**作者**:Claude(claude) 起草
**状态**:PENDING-OWNER-APPROVAL
**关联**:

- [统一计划 v1.0+16](2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md) — 决策来源
- [任务追踪表(claude)](../../design/2026-07-14-self-ai-gateway(claude)/task-tracker(claude).md) — 老追踪表(本计划有自己 §4 追踪表)
