# AI 智能体配置控制台 DDD 演进计划（最终版）

> 综合 Qoder v3 + Claude v4 + 三轮审核 + 主人决策，最终可施工版本。
> 核心：多 Agent 管理 + AgentInvoker SDK + God Object 拆分 + Diff/Markdown/Slider 全套 UI。工时 13.5d。

## 一、背景与目标

### 1.1 当前痛点
1. **配置分裂**：连接配置走 cfg 表，行为参数走 AiAgentProperties（yml 绑定、运行时不可变），前端无法管理
2. **多场景散落**：答疑、陪练等多个 Agent 场景无统一管理入口，参数独立散落
3. **缺少调试能力**：想测不同参数组合需改代码重启服务
4. **KB 粒度不足**：无法按 Agent 独立配置挂载哪些知识库

### 1.2 目标
1. **多 Agent 管理**：支持创建/编辑/复制/删除多个 Agent，每个 Agent 独立配置
2. **统一配置出口**：所有 AI 行为参数通过前端管理界面读写，无需改 yml / 重启
3. **AgentInvoker SDK**：业务方调 AI 必须通过统一 SDK，禁止直连百炼（软约束）
4. **工具实例级配置**：每个 Agent 可挂 N 个 KB 工具实例，独立启用/禁用
5. **向后兼容**：DB 无值时 fallback 到 AiAgentProperties 硬编码默认值
6. **增量演进**：每一步可独立发布和回滚

### 1.3 不在本次范围
| 不做 | 理由 |
|------|------|
| Redis Pub/Sub 多实例缓存 | 当前单实例，引入增加复杂度无收益 |
| 跨前端公共 npm 包 | 优先级低 |

---

## 二、架构决策（D1-D10）

### D1: 多 Agent 管理（核心决策）
每个 Agent 是独立实体（船舶答疑助手 / 培训陪练等），有独立 ID、独立配置、独立启用状态。对齐百炼"我的应用"模式。

### D2: 双表存储（ai_agent + ai_agent_config）
- `ai_agent`：Agent 元数据（id/name/description/tags/system_prompt/enabled）
- `ai_agent_config`：key-value JSON 配置，通过 `agent_id` 关联，每 config_key 一行

### D3: AgentInvoker SDK 软约束
- 业务方通过 Shiro `ai:agent:query`（只读）调取配置
- 配置修改通过 Shiro `ai:agent:config`（写），仅 super_admin / 运维
- 业务方调 AI 必须通过 AgentInvoker SDK，禁止直连百炼 SDK
- 强制力：SDK 普及 + code review 禁直连百炼

### D4: 工具实例级配置
每个 Agent 可挂 N 个工具实例（KB/WebSearch/WebExtractor），每个独立配置。关键需求："选了工务知识库就不显示培训的"。

### D5: 调试面板 conversationId 隔离 + 中断旧流
调试面板生成 UUID，临时参数改动 → 用新 conversationId 发起新请求 → 旧 conversationId 流前端**立即停止渲染**（中断）。
实现要点：后端 SSE 每帧带 `conversationId`，前端 EventSource 收到 cancelled 事件后立即停止写入对话框。

### D6: 模型参数扩展
新增 temperature(0-2)、top_p(0-1)、thinking_budget(int tokens) 三个字段，对齐百炼 qwen3.6-plus。

### D7: ReAct 边界对齐百炼
maxIterations 范围从 1-20 改为 1-50（对齐百炼）。

### D8: Prompts 入控制台
推翻 2026-07-22 决策，prompts 纳入控制台管理。白名单 `{answer_assistant, training_assistant}`，`quiz_generator` 不纳入。

### D9: 智能体标签 + 简述
`ai_agent` 表加 `short_desc`(VARCHAR(64)) + `tags`(VARCHAR(255))，纯 AI 调控维度标记。

### D10: 拆分 God Object
趁 Phase 2 修改 AgentReActExecutorImpl 之际，一并拆分：
- 提取 `ChunkBuilder`（SSE chunk 构造辅助方法）
- 提取 `StageEmitter`（阶段 thought emit 逻辑）
- 提取 `FileSummaryService`（文件预读与摘要）
- 主循环只做编排，目标从 1377 行降到 ~500 行

---

## 三、数据模型

### 3.1 DDL

```sql
-- 主表：Agent 元数据
CREATE TABLE ai_agent (
  id              VARCHAR(64)   NOT NULL  COMMENT '智能体唯一 ID（业务方调用入口）',
  name            VARCHAR(128)  NOT NULL  COMMENT '显示名',
  short_desc      VARCHAR(64)             COMMENT '简述',
  description     VARCHAR(512)            COMMENT '详细用途描述',
  tags            VARCHAR(255)            COMMENT '标签（逗号分隔，AI 调控维度）',
  system_prompt   TEXT                    COMMENT '系统提示词',
  stream_enabled  TINYINT(1)   DEFAULT 1  COMMENT '流式输出开关',
  enabled         TINYINT(1)   DEFAULT 1  COMMENT '启用开关',
  archived_at     DATETIME                COMMENT '软删除时间',
  created_at      DATETIME   DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_enabled (enabled),
  INDEX idx_tags (tags),
  INDEX idx_archived (archived_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 智能体元数据表';

-- 配置表：key-value JSON 存储
CREATE TABLE ai_agent_config (
  id              BIGINT       NOT NULL AUTO_INCREMENT,
  agent_id        VARCHAR(64)  NOT NULL  COMMENT '关联 ai_agent.id',
  config_key      VARCHAR(64)  NOT NULL  COMMENT '配置域',
  config_value    TEXT         NOT NULL  COMMENT 'JSON 格式配置值',
  enabled         TINYINT(1)   DEFAULT 1  COMMENT 'enabled=0 时走 fallback',
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX uk_agent_key (agent_id, config_key),
  INDEX idx_agent_enabled (agent_id, enabled),
  CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES ai_agent(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 智能体配置表';
```

### 3.2 配置 JSON 结构（8 个 config_key）

```json
{
  "models": {
    "defaultModel": "qwen3.6-plus",
    "temperature": 0.7, "top_p": 0.8,
    "thinking_budget": 4096, "reasoningEffort": "medium",
    "maxOutputTokens": null, "maxContextWindow": 32000
  },
  "tools": [
    { "id": "kb-gongwu", "type": "kb", "name": "工务知识库",
      "enabled": true, "weight": 0.8, "scoreThreshold": 0.6,
      "topK": 50, "timeoutSeconds": 15, "kbId": "kb-001", "scope": "scope-gongwu" },
    { "id": "web-search", "type": "webSearch", "enabled": true, "timeoutSeconds": 15 },
    { "id": "web-extractor", "type": "webExtractor", "enabled": true, "timeoutSeconds": 15 }
  ],
  "react": { "enabled": true, "maxIterations": 10, "maxSearchCount": 5 },
  "context": { "maxHistoryRounds": 10, "enableSessionCache": true, "usePreviousResponseId": true },
  "apiMode": { "useResponsesApi": true },
  "bailian": { "useMaasDomain": false, "maasRegion": "cn-beijing" },
  "rateLimit": { "seconds": 20 },
  "sseTimeout": { "ms": 120000 }
}
```

### 3.3 配置读取优先级
```
DB 存值（enabled=1 + 非 null）→ 用 DB 值
DB 存值（enabled=0 / null / 缺失）→ AiAgentProperties 硬编码默认值
DTO overrides（调试面板临时参数）→ 最高优先级（仅本次 conversationId 内）
```

### 3.4 数据迁移
```sql
START TRANSACTION;
  -- 1. 创建两表（DDL 已先执行）
  -- 2. 插入默认 agent
  INSERT INTO ai_agent (id, name, description, enabled)
  VALUES ('default', '默认 Agent', '兼容旧配置', 1);
  -- 3. 从 cfg 表迁移 model → ai_agent_config（agent_id='default'）
  -- 4. AiAgentProperties 默认值 → REPLACE INTO 其余 config_key 行
  --    prompts 仅迁移白名单 key（answer_assistant, training_assistant）
  -- 5. 验证 8 行齐全
COMMIT;
-- 旧 cfg 行保留不删，代码层不再读
```

---

## 四、AgentInvoker SDK

### 4.1 接口定义
```java
package com.wk.traincenter.ai.application.invoker;

@Component
@RequiredArgsConstructor
public class AgentInvoker {
    private final AgentConfigQueryService configQueryService;
    private final AgentConfigResolver resolver;
    private final BailianResponsesCaller responsesCaller;
    private final BailianChatCaller chatCaller;

    public SseEmitter invoke(String agentId, String userQuery,
                             String conversationId, Map<String, Object> overrides) {
        // 1. 加载配置（DB → fallback AiAgentProperties）
        // 2. 应用 overrides（临时参数）
        // 3. 过滤 enabled=false 的 KB 工具
        // 4. 构建百炼请求
        // 5. 调用百炼（SSE 流式）
    }
}
```

### 4.2 KB 过滤逻辑（D4 关键需求）
```java
List<KbToolConfig> enabledKbs = config.getTools().stream()
    .filter(t -> "kb".equals(t.getType()))
    .filter(KbToolConfig::isEnabled)  // 只调 enabled=true 的 KB
    .collect(Collectors.toList());
```

### 4.3 迁移路径
现有 `WkAiAgentController.chatStream()` 内部改为调用 `AgentInvoker.invoke()`，保持 SSE 协议兼容（12 种 chunk type 不变）。前端无需改动。

---

## 五、API 设计

### 5.1 管理端（写权限 `ai:agent:config`）
| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/admin/ai/agent/list` | 智能体列表（含标签筛选） |
| GET | `/admin/ai/agent/{agentId}` | 智能体详情（含完整配置） |
| POST | `/admin/ai/agent/save` | 保存（主表 + 配置表批量） |
| POST | `/admin/ai/agent/{agentId}/copy` | 复制 |
| DELETE | `/admin/ai/agent/{agentId}` | 软删除 |
| POST | `/admin/ai/agent/{agentId}/disable` | 禁用 |
| POST | `/admin/ai/agent/{agentId}/reset-config` | 重置配置走 fallback |

### 5.2 业务端（只读权限 `ai:agent:query`）
| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/agent/{agentId}` | 完整配置（AgentInvoker 用） |
| GET | `/api/agent/list/enabled` | 已启用的列表（业务方选择用） |

---

## 六、实施步骤

### Phase 1：数据层 + CRUD（2.5d）
- **Step 1.1** DDL 建表（0.5d）
- **Step 1.2** Migration 脚本（事务化 + 幂等 REPLACE INTO）（0.5d）
- **Step 1.3** Entity + Mapper + Repository（DDD 四层）（1d）
  - `infra/entity/AiAgentEntity.java` + `AiAgentConfigEntity.java`
  - `infra/mapper/AiAgentMapper.java` + `AiAgentConfigMapper.java`
  - `wk-module-ai/src/main/resources/mapper/AiAgentMapper.xml` + `AiAgentConfigMapper.xml`
  - `domain/AiAgentRepository.java` + `AiAgentConfigRepository.java`
- **Step 1.4** 应用层 Service（0.5d）
  - `application/config/AgentConfigService.java`（CRUD 接口）
  - `application/config/AgentConfigServiceImpl.java`（实现）
  - `application/config/AgentConfigQueryService.java`（只读，业务方用）

### Phase 2：AgentInvoker + Resolver + God Object 拆分 + 文件切换（5d）
- **Step 2.1** 新建 AgentInvoker + AgentConfigResolver（1d）
  - `application/invoker/AgentInvoker.java`
  - `application/config/AgentConfigResolver.java`（DB → YML → overrides 合并）
  - `application/config/AgentCfgData.java`（独立 DTO）
- **Step 2.2** 拆分 AgentReActExecutorImpl God Object（1.5d）
  - 提取 `ChunkBuilder`（SSE chunk 构造辅助方法，约 150 行）
  - 提取 `StageEmitter`（阶段 thought emit 逻辑，约 100 行）
  - 提取 `FileSummaryService`（文件预读与摘要，约 200 行）
  - 主循环只做编排，目标从 1377 行降到 ~500 行
  - 同时完成 Resolver 切换：**开工前重新 grep** `aiAgentProperties\.` 找到所有引用（约 9 处）
- **Step 2.3** 修改 AgentConfigServiceImpl → 委托 Resolver（0.5d）
  - **开工前重新 grep** `cfg.ai.bailian` 找到 if 分支删除
- **Step 2.4** 修改 BailianResponsesCaller → Resolver（0.5d）
  - **开工前重新 grep** `getBailian()\.` 找到所有引用（约 3 处）
- **Step 2.5** WkAiAgentController 内部改为调 AgentInvoker（0.5d）
  - 保持 SSE 协议兼容（12 种 chunk type 不变）

### Phase 3：前端管理界面 + Diff + Markdown + Slider（4.5d）
- **Step 3.1** Controller 端点（7 管理 + 2 只读）（0.5d）
- **Step 3.2** 前端 Agent 列表 + 创建/复制/删除（**Vue 2 Options API**）（1d）
  - 文件：`wk-train-center-ui/src/views/admin/sys/agent/index.vue`（新目录）
  - 左侧列表 + 标签筛选 + [+ 新建] / [复制] / [删除] / [禁用]
- **Step 3.3** 中间配置表单（8 大 config_key）（0.5d）
  - 模型参数（含 temperature/top_p/thinking_budget）
  - 工具实例列表（KB 多实例 + 启用/禁用 + 独立参数）
  - ReAct / 上下文 / API 模式 / 端点配置
- **Step 3.4** Slider UI 重构（1d）
  - 10 个参数全部 el-slider + 左右文字标签（温度/TopP/ThinkingBudget/KB阈值/KB召回/KB权重/maxIterations/maxOutputTokens/maxHistoryRounds/maxContextWindow）
  - 每个 slider 两端 + 中间点有隐喻文字（如"稳定一致 ↔ 创造发散"）
- **Step 3.5** 提示词 Markdown 双 Tab 预览（0.5d）
  - [Markdown 原文] / [预览] 两个 Tab
  - `marked.js` 实时渲染，Word 文档样式对齐
- **Step 3.6** 保存前 Diff 弹窗（0.5d）
  - git-like 改动对比表格：无变化灰 / 新增绿 / 修改黄
  - [取消] / [确认保存]
- **Step 3.7** 右侧调试面板（0.5d）
  - 对话框 + 临时参数面板
  - conversationId 隔离 + 中断旧流

### Phase 4：联调 + 验收（1.5d）
- 端到端：创建 agent → AgentInvoker → 百炼 → SSE 流
- KB 过滤：验证只调 enabled=true 的 KB
- 权限：业务方调管理端 → 403
- 向后兼容：DB 无数据时 fallback 到 AiAgentProperties
- **AgentInvoker 业务方接入 demo**：写 1 个 demo Controller 演示业务方不接触百炼 SDK 即可调 AI；grep `dashscope`/`BailianResponsesCaller` 在 demo 中 0 命中
- **conversationId 隔离测试**：模拟连续 3 次参数变更，验证旧流被中断、新流独立渲染
- `mvn clean compile` + `mvn test` 通过

### 依赖关系
```
Phase 1 (DDL + Migration + CRUD)
    ↓
Phase 2 (AgentInvoker + Resolver + 4 文件切换)
    ↓
Phase 3 (前端 Agent 管理界面)
    ↓
Phase 4 (联调验收)
```

### 工时汇总
| Phase | 内容 | 工时 |
|-------|------|------|
| Phase 1 | 数据层 + CRUD + DTO | 2.5d |
| Phase 2 | AgentInvoker + Resolver + God Object 拆分 + 文件切换 | 5d |
| Phase 3 | 前端 Agent 管理 + Diff + Markdown + Slider | 4.5d |
| Phase 4 | 联调验收 | 1.5d |
| **总计** | | **13.5d** |

---

## 七、前端 UI 布局

```
┌──────────────────┬──────────────────────────┬──────────────────┐
│ 智能体列表        │ 配置面板                   │ 实时调试          │
│ （左侧 25%）      │ （中间 50%）              │ （右侧 25%）      │
├──────────────────┼──────────────────────────┼──────────────────┤
│ [+ 新建]         │ 基础：名称/简述/标签        │ 对话框            │
│                  │                          │                  │
│ ● 船舶答疑助手    │ 模型：[下拉]              │ 临时参数          │
│   production     │ 温度/TopP/ThinkingBudget  │ temperature: 0.7 │
│                  │                          │ top_p: 0.8       │
│ ○ 培训陪练       │ ── 知识库工具 ──          │ thinking: 4096   │
│   experimental   │ ☑ 工务知识库 (权重/阈值)   │                  │
│                  │ ☐ 培训知识库 [启用]        │ [测试(流式)]      │
│                  │ ── 网络工具 ──            │                  │
│                  │ ☑ 联网搜索 ☑ 网页抓取     │ ───────────      │
│                  │ ── ReAct / 上下文 ──      │ 历史对话          │
│                  │ ── 提示词 ──              │                  │
│                  │ [textarea 编辑]           │                  │
│                  │                          │                  │
│                  │ [保存] [恢复默认] [删除]    │                  │
└──────────────────┴──────────────────────────┴──────────────────┘
```

**技术栈**：Vue 2 Options API + Element UI（与 train-center-ui 一致）

---

## 八、风险与缓解

| 风险 | 等级 | 缓解 |
|------|------|------|
| 多 Agent 缓存 key 未按 agent 区分 | 🔴 高 | `@Cacheable(value="ai:agent:config", key="#agentId + ':' + #configKey")` — 避免 agent A 缓存了 agent B 的配置；`@CacheEvict` 也必须按 agentId 精确失效 |
| 删除/禁用 agent 后业务方调用失败 | 🟠 中 | 软删除 + AgentNotFoundException/DisabledException |
| AgentInvoker 业务方直连百炼绕过 | 🟠 中 | 软约束 + code review 红线 + 定期 grep |
| KB 多实例检索性能 | 🟠 中 | 单次联合检索（百炼 API） |
| 调试面板临时参数混用 | 🟠 中 | conversationId 隔离 + 中断旧流 |
| migration 脚本数据丢失 | 🟢 低 | 事务化 + REPLACE INTO 幂等 + 旧表保留 30 天 |

---

## 九、远期演进（本次不做）

1. **Token 消耗监控**：前端展示日均消耗/单对话成本
2. **配置版本管理**：保存前创建快照，支持回滚
3. **v3 前端同步**：train-center-ui-v3 配置页
4. **Redis Pub/Sub 多实例同步**：多实例部署时引入

---

## 十、关键文件清单

### 新建文件（15 个）
| 文件 | 说明 |
|------|------|
| `infra/entity/AiAgentEntity.java` | 主表实体 |
| `infra/entity/AiAgentConfigEntity.java` | 配置表实体 |
| `infra/mapper/AiAgentMapper.java` | Mapper |
| `infra/mapper/AiAgentConfigMapper.java` | Mapper |
| `wk-module-ai/src/main/resources/mapper/AiAgentMapper.xml` | SQL 映射 |
| `wk-module-ai/src/main/resources/mapper/AiAgentConfigMapper.xml` | SQL 映射 |
| `domain/AiAgentRepository.java` | Repository 接口 |
| `domain/AiAgentConfigRepository.java` | Repository 接口 |
| `application/config/AgentConfigService.java` | CRUD 接口 |
| `application/config/AgentConfigServiceImpl.java` | CRUD 实现 |
| `application/config/AgentConfigQueryService.java` | 只读 Service |
| `application/config/AgentConfigResolver.java` | 配置合并层 |
| `application/config/AgentCfgData.java` | 独立 DTO |
| `application/invoker/AgentInvoker.java` | 统一 SDK 入口 |
| `application/react/ChunkBuilder.java` | God Object 拆分：SSE chunk 构造 |
| `application/react/StageEmitter.java` | God Object 拆分：阶段 thought emit |
| `application/react/FileSummaryService.java` | God Object 拆分：文件预读摘要 |
| `wk-train-center-ui/.../views/admin/sys/agent/` | 前端新目录 |

### 修改文件（5 个）
| 文件 | 说明 |
|------|------|
| `controller/WkAiAgentController.java` | 内部改调 AgentInvoker |
| `application/impl/AgentConfigServiceImpl.java` | 委托 Resolver |
| `application/react/AgentReActExecutorImpl.java` | 9 处引用切 Resolver |
| `application/react/BailianResponsesCaller.java` | 3 处引用切 Resolver |
| `application/config/AiGatewayConstants.java` | 新增 8 个 config_key 常量 |

### 不动文件
| 文件 | 说明 |
|------|------|
| `application/config/AiAgentProperties.java` | 保留为 fallback 源 |
| 旧 cfg 表行（ai/voice/vision/bailian_kb） | 保留不删 |

---

## 十一、验收清单

- [ ] 智能体 CRUD：创建/编辑/复制/删除/禁用
- [ ] 每个 Agent 独立配置 8 大 config_key
- [ ] KB 工具多实例 + 独立启用/禁用
- [ ] KB 过滤：只检索 enabled=true 的 KB
- [ ] AgentInvoker SDK 业务方 demo 通过（grep 0 命中百炼 SDK）
- [ ] conversationId 隔离测试通过（旧流中断 + 新流独立）
- [ ] 业务方无写配置权限（Shiro 拦截测试通过）
- [ ] 向后兼容：DB 无数据时 fallback 到 AiAgentProperties
- [ ] `mvn clean compile` + `mvn test` 通过
- [ ] 前端 Vue 2 页面正常渲染

---

## 十二、决策追溯

| # | 决策 | 来源 |
|---|------|------|
| D1 | 多 Agent 管理 | 主人原话"太多散的 AI API 调用需要管理" |
| D2 | 双表存储 | 审核 P0-2 整改（cfg 表 disableOtherEnabled 风险） |
| D3 | AgentInvoker 软约束 | 主人"所有 AI 都要从这个口输出" |
| D4 | 工具实例级 | 主人"选了工务 KB 就不显示培训的" |
| D5 | 调试面板隔离 | 主人接受 A 方案（conversationId 隔离） |
| D6 | 模型参数扩展 | 对齐百炼 qwen3.6-plus predictConfig |
| D7 | ReAct 1-50 | 对齐百炼 |
| D8 | Prompts 入库 | grill-me F-1 拍板推翻 2026-07-22 决策 |
| D9 | 标签+简述 | AI 调控维度标记 |
| D10 | 拆分 God Object | 主人确认：趁 Phase 2 一并拆分（ChunkBuilder/StageEmitter/FileSummaryService） |
