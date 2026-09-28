# AI 智能体配置控制台 DDD 演进计划（v4 — Claude 草稿）

| 项 | 值 |
|---|---|
| 文档版本 | v4 草稿 |
| 草稿日期 | 2026-07-28 |
| 草稿人 | Claude（架构师协作） |
| 关联项目 | wk-train-center 1.5 |
| 关联代码仓 | `E:\rhProject\wk-train-center-service\wk-modules\wk-module-ai\` |
| 关联前端 | `E:\rhProject\wk-train-center-ui\src\views\admin\sys\config\` |
| 关联决策文档 | 主人 2026-07-22 prompts 决策、2026-07-23 第二轮审查、2026-07-28 grill-me 13 项拍板 |
| 关联审核报告 | `reviews/1.5/2026-07-28-AI配置控制台DDD演进-计划审核-by-claude.md`<br/>`reviews/1.5/2026-07-28-AI配置控制台DDD演进v2-计划再审-by-claude.md`<br/>`reviews/1.5/2026-07-28-AI配置控制台DDD演进v2-计划三审-by-claude.md`<br/>`reviews/1.5/2026-07-28-AI配置控制台DDD演进-实施流程图.md` |
| 交付对象 | 第三方架构师审核（独立于 Claude 上下文） |
| 状态 | 🟡 **草稿待审核**（Claude 起草，主人交付第三方） |

---

## 阅读指引

本文档是 **AI 智能体配置控制台** 的完整设计文档，面向第三方架构师审核。

**关键认知**：
- 本项目**不嵌合业务**（课程、学习任务、培训计划），仅做 AI 行为参数的统一管理工具
- 业务方作为**只读消费者**调取配置，不允许改配置
- 所有 AI 调用**统一从配置出口**（AgentInvoker SDK），禁止业务方直连百炼

**第三方阅读顺序建议**：
1. §一 背景与目标（5 分钟）— 理解痛点和目标
2. §二 架构决策 D1-D10（10 分钟）— 理解为何这么做
3. §三 数据模型（15 分钟）— 理解存储设计
4. §四 配置 JSON 完整示例（10 分钟）— 理解配置形态
5. §五 AgentInvoker SDK 设计（15 分钟）— 理解核心架构
6. §六 路由层 + 权限矩阵（10 分钟）— 理解 API 设计
7. §七 实施步骤（30 分钟）— 理解如何落地
8. §八 前端 UI 设计（20 分钟）— 理解交互形态
9. §九 风险与缓解（10 分钟）— 理解潜在问题
10. §十 验收清单 + §十一 决策追溯（10 分钟）— 理解验证标准

---

## 一、背景与目标

### 1.1 当前痛点

平台内有**多套散落的 AI API 调用点**（答疑、陪练、出题等场景），每套场景的参数配置（模型、工具开关、ReAct 调参、提示词）都**散落在后端 yml 文件**中，导致：

1. **配置分裂**：连接配置（apiKey/endpoint/KB ID）走 cfg 表，行为参数（tools/react/prompts/apiMode）走 `AiAgentProperties`（yml 绑定、运行时不可变），前端完全无法管理后者
2. **前端缺位**：现有 `AiConfig.vue` 只管"连接四件套"（chat/voice/vision/kb），模型参数、工具开关、ReAct 调参等高频运维操作仍需改 yml 重启
3. **多场景管理缺位**：答疑、陪练、出题等多个 Agent 场景无统一管理入口，每个 Agent 的参数独立散落
4. **缺少实时调试**：开发/运维想测试不同参数组合的效果，需改代码重启服务
5. **改动追溯缺位**：配置改了没有版本对比，运维误操作难回滚

### 1.2 目标

1. **统一配置出口**：所有 AI 行为参数通过前端管理界面读写，无需改 yml / 重启服务
2. **多 Agent 管理**：支持创建/编辑/复制/删除多个 Agent 实体，每个 Agent 独立配置
3. **业务解耦**：业务方只读配置，配置修改只能通过控制台
4. **实时调试**：右侧调试面板，参数改动立即试效果（不持久化）
5. **改动对比**：保存前弹 git-like diff 表格，无变化灰/新增绿/删除红/修改黄
6. **向后兼容**：新表无值时 fallback 到 `AiAgentProperties` 硬编码默认值，存量配置不丢
7. **增量演进**：每一步可独立发布和回滚

### 1.3 不在本次范围（明确剔除）

| 不做 | 理由 |
|------|------|
| avatar/owner/tags 业务分类 | 与 AI 调控无关，业务域职责 |
| agent 权限管理（谁能改哪个 agent） | 与 AI 调控无关，业务域职责 |
| agent 使用统计 / 监控仪表盘 | 监控属业务域 |
| agent 发布审批流程 | 业务流程 |
| agent 测试集 / 评测 / A/B 实验 | 业务效果域 |
| God Object 拆分（AgentReActExecutorImpl） | 独立关注点，混入会放大风险 |
| Redis Pub/Sub 多实例缓存广播 | 当前单实例部署，引入增加复杂度但无收益 |
| 百炼三级配置（全局 > 应用 > 会话） | 本系统无多租户/多 Agent 实例需求，两级足够 |
| 跨前端公共 npm 包 | 优先级低，4 个前端项目未统一 |

---

## 二、架构决策（D1-D10）

主人于 2026-07-28 与 Claude 完成 13 项关键决策的 grill-me 拍板（详见 §十一）。本节列出最终落地的 10 项架构决策，每项标注决策来源（审核问题 / 主人拍板 / 百炼调研）。

### D1: 多 Agent 管理而非单 Agent 参数配置（主人拍板 #1, 2026-07-28）

**决策**：本项目交付的不是"AI 参数配置控制台"，而是**"多 Agent 配置控制台"**。

每个 Agent 是独立实体（船舶答疑助手 / 培训陪练 / 安规出题等），有独立 ID、独立配置、独立启用状态。

**依据**：
- 主人原话："我目前平台中有太多很散的 AI api 调用，我需要对这些进行管理起来"
- 主人原话："我自己只需要再某个地方填上他的 id，就可以跟问答一样输出"

**对比百炼**：阿里云百炼控制台"我的应用"模块，每个应用（智能体）独立管理，本设计对齐此模式。

### D2: 单表配置存储而非多表（主人拍板 #2）

**决策**：采用单表配置存储（`ai_agent_config`），每个 config_key 一行，通过 `agent_id` 列区分多 Agent。

**对比多表方案**：
| 方案 | 优势 | 劣势 |
|------|------|------|
| **单表（本设计）** | 配置灵活扩展（新增字段不动表结构）、运营熟悉 key-value 模型 | 难做 SQL 字段级查询 |
| 多表（agent 主表 + 5 张配置子表） | 字段类型明确 | 配置扩展需 ALTER TABLE，DDL 维护成本高 |

**依据**：主人接受单表方案，认为本场景配置项总数不超 30 个，JSON 存储足够灵活。

### D3: 业务方只读 + AgentInvoker SDK 软约束（主人拍板 #11, #13）

**决策**：
- 业务方通过 Shiro 权限点 `ai:agent:query`（只读）调取配置
- 配置修改通过 Shiro 权限点 `ai:agent:config`（写），仅 super_admin / 运维可用
- 业务方调 AI **必须通过 AgentInvoker SDK**，禁止直连百炼 SDK
- 强制力采用**软约束**：SDK 普及 + code review 禁直连百炼

**依据**：
- 主人原话："业务只能读取配置,不能往里改配置"
- 主人原话："所有的 AI 都要从这个口输出"
- 主人原话：SDK 软约束（A 方案），非硬拦截

**架构意义**：控制台是**配置中心**，业务方是**配置消费者**。这一约束是本设计的核心架构原则。

### D4: 工具实例级而非工具类型级（主人拍板 #3）

**决策**：每个 Agent 可挂载 N 个工具实例，每个工具实例独立配置。

**典型场景**：
- 船舶答疑助手可挂：工务知识库（启用）、培训知识库（禁用）、联网搜索（启用）、网页抓取（启用）
- 安规出题助手可挂：安规知识库（启用）、联网搜索（禁用）

**关键需求**（主人原话）：
> "问答中我只选择了工务的知识库,那么前台就不会显示培训的知识库"

**实现**：
- 控制台工具列表显示 Agent 配置中所有 KB 工具实例
- 后端实际调 KB 时**只调 enabled=true 的实例**（过滤逻辑详见 §五）
- 前端聊天界面"知识库引用"展示**只显示该 Agent 配置中 enabled=true 的 KB**

### D5: 实时调试面板 conversationId 隔离（主人拍板 #4）

**决策**：调试面板右侧生成 `conversationId`（UUID），临时参数改动 → 旧 conversationId 流标记 cancelled，新参数用新 conversationId 发起新请求。

**依据**：主人接受 A 方案（conversationId 隔离 + 中断旧流），避免新旧参数混在同一对话框中。

**架构意义**：临时参数（调试时改的 temperature/top_p/thinking_budget 等）只在 conversationId 内生效，不持久化，不影响生产。

### D6: 模型参数扩展（主人拍板 #5）

**决策**：`models` 配置新增 3 字段：
- `temperature`（0-2）— 控制 AI 创造性
- `top_p`（0-1）— 核采样阈值
- `thinking_budget`（int tokens）— 思维链最大输出 tokens

**依据**：对齐百炼 qwen3.6-plus 的 `predictConfig` 入参定义（见 `~/.claude/skills/bailian-docs-llm-wiki/models/groups/qwen3.6-plus.json`）。

**保留字段**：`defaultModel`、`reasoningEffort`、`maxOutputTokens`。

### D7: ReAct 边界对齐百炼（主人拍板 #6）

**决策**：`react.maxIterations` 范围从 v3 的 1-20 改为 **1-50**（对齐百炼"ReAct 最大轮次 1-50"）。

**依据**：主人接受 A 方案。生产环境 ReAct 大问题可能需要 30 轮，原 1-20 范围太严。

### D8: SSE 流式输出完整版（主人拍板 #8）

**决策**：v4 直接含 SSE 流式输出，**不**先出非流式版再迭代。

**依据**：主人接受 A 方案（v4 含流式，工期 +1d）。

**实现要点**：
- 后端 SSE 响应每帧带 `conversationId` 字段
- 前端 EventSource 按 conversationId 路由到对应对话框
- 调试面板临时参数用 conversationId 隔离（D5）

### D9: 智能体标签 + 简述（主人拍板补充）

**决策**：`ai_agent` 表加 `short_desc`（VARCHAR(64)）+ `tags`（VARCHAR(255)，逗号分隔）。

**定位**：与业务无深度嵌合前提下，标签是**AI 调控维度的标记**，非业务分类。

**典型标签**：
| 标签 | 含义 | 用途 |
|------|------|------|
| `production` | 生产环境 | 运维筛选 |
| `experimental` | 实验中 | 主人筛 |
| `kb-heavy` | 依赖 KB | 调 KB 工具权重时筛 |
| `fast` / `slow` | 响应速度档 | 调 maxOutputTokens 时筛 |
| `streaming` | 必须流式 | 调 stream_enabled 时筛 |
| `archived` | 已废弃 | 隐藏 |

**简述 vs 描述**：
| 字段 | 字数 | 显示位置 | 用途 |
|------|------|---------|------|
| `short_desc` | 64 字 | 列表项右侧/卡片副标题 | 一眼看清 agent 用途 |
| `description` | 512 字 | 编辑面板"用途描述" | 详细说明 + 注意事项 |

### D10: 提示词 Markdown/预览双模式（主人拍板 #12）

**决策**：提示词编辑器提供两个 Tab：Markdown 原文 + 实时预览。

**实现方案**：
- **A 方案（本设计采用）**：纯前端 `marked.js` 实时渲染，主人原话"实现难度大的话就先原文" → A 满足最小需求
- B 方案（远期）：`@wangeditor/editor` 或 `tiptap` 类 Word 双模式富文本编辑器

**UI 形态**：
```
┌─────────────────────────────────────┐
│ [Markdown 原文] [预览（Word 样式）]   │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ # 角色                           │ │
│ │ 你是船舶设备维保助手              │ │
│ │                                  │ │
│ │ ## 能力                          │ │
│ │ - 设备故障诊断                    │ │
│ │ - 维护建议                        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 三、数据模型

### 3.1 DDL 完整版

```sql
-- 主表：Agent 元数据
CREATE TABLE ai_agent (
  id              VARCHAR(64)   NOT NULL  COMMENT '智能体唯一 ID（业务方调用入口）',
  name            VARCHAR(128)  NOT NULL  COMMENT '显示名',
  short_desc      VARCHAR(64)              COMMENT '简述（一句话用途）',
  description     VARCHAR(512)             COMMENT '详细用途描述',
  tags            VARCHAR(255)             COMMENT '标签（逗号分隔，AI 调控维度）',
  system_prompt   TEXT                     COMMENT '系统提示词（Markdown 格式）',
  stream_enabled  TINYINT(1)   DEFAULT 1   COMMENT '流式输出开关',
  enabled         TINYINT(1)   DEFAULT 1   COMMENT '启用开关',
  archived_at     DATETIME                 COMMENT '软删除时间',
  created_at      DATETIME   DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_enabled (enabled),
  INDEX idx_tags (tags),
  INDEX idx_archived (archived_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 智能体元数据表';

-- 配置表：key-value JSON 存储
CREATE TABLE ai_agent_config (
  id              BIGINT        NOT NULL  AUTO_INCREMENT,
  agent_id        VARCHAR(64)   NOT NULL  COMMENT '关联 ai_agent.id',
  config_key      VARCHAR(64)   NOT NULL  COMMENT '配置域：models/tools/react/context/apiMode/bailian/rateLimit/sseTimeout',
  config_value    TEXT          NOT NULL  COMMENT 'JSON 格式配置值',
  enabled         TINYINT(1)    DEFAULT 1  COMMENT '是否启用（0 时该行跳过，走 AiAgentProperties fallback）',
  created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX uk_agent_key (agent_id, config_key),
  INDEX idx_agent_enabled (agent_id, enabled),
  CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES ai_agent(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 智能体配置表';
```

### 3.2 字段约束说明

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `ai_agent.id` | VARCHAR(64) | PRIMARY KEY | 业务方调用时填的 ID，建议命名规范 `agent-{业务域}-{场景}` 如 `agent-gongwu-qa` |
| `ai_agent.tags` | VARCHAR(255) | 无索引但建索引 | 逗号分隔，前端按 tag 筛选（纯前端过滤，不依赖 SQL） |
| `ai_agent.archived_at` | DATETIME NULL | 索引 | NULL = 未删除；非 NULL = 软删除时间 |
| `ai_agent_config.uk_agent_key` | UNIQUE (agent_id, config_key) | UNIQUE INDEX | 保证每个 agent 每个 config_key 唯一 |
| `ai_agent_config.enabled` | TINYINT(1) | DEFAULT 1 | 语义：enabled=0 时该行跳过，走 AiAgentProperties fallback（与 config_key 不存在等价） |

### 3.3 数据迁移策略

**迁移原则**：
- ai_agent_config 表**新建**（v3 单表 → v4 加 agent_id 列需数据合并）
- 原 v3 单表无 agent_id 数据 → **视为默认 agent**（`id='default'`），保证向后兼容
- 旧 cfg 表（ai/voice/vision/bailian_kb 4 行）**保留不删**，仅代码层不再读它

```sql
-- 1. 创建 ai_agent + ai_agent_config 表（DDL 见 §3.1）

-- 2. 插入默认 agent
INSERT INTO ai_agent (id, name, description, system_prompt, stream_enabled, enabled)
VALUES ('default', '默认 Agent（兼容旧配置）',
        'v3 单表配置迁移目标，存量配置自动归属此 agent',
        NULL, 1, 1);

-- 3. 从 v3 ai_agent_config 表迁移数据（按 config_key 分行）
--    原 v3 单表无 agent_id → 全部写入 agent_id='default'
INSERT INTO ai_agent_config (agent_id, config_key, config_value, enabled)
SELECT 'default', config_key, config_value, enabled
FROM ai_agent_config_v3_old;  -- v3 旧表（暂未删除）

-- 4. 验证 ai_agent_config 8 行齐全 + 数据非空
SELECT config_key, COUNT(*) FROM ai_agent_config WHERE agent_id='default' GROUP BY config_key;
-- 预期：8 个 config_key 各 1 行（models/tools/react/context/apiMode/bailian/rateLimit/sseTimeout）

-- 5. 验证通过后，软删除 v3 旧表（行保留以兼容历史查询）
-- ALTER TABLE ai_agent_config_v3_old RENAME TO ai_agent_config_v3_archived;
```

**回滚策略**：
- migration 步骤 3 出错 → ROLLBACK，业务不中断（v3 旧表仍在）
- migration 步骤 4 验证失败 → ROLLBACK，业务不中断
- 整套方案上线后 → v3 旧表保留 30 天观察期再 DROP

---

## 四、配置 JSON 完整示例

### 4.1 完整配置 JSON

```json
{
  "models": {
    "defaultModel": "qwen3.6-plus",
    "temperature": 0.7,
    "top_p": 0.8,
    "thinking_budget": 4096,
    "reasoningEffort": "medium",
    "maxOutputTokens": null,
    "maxContextWindow": 32000
  },
  "tools": [
    {
      "id": "kb-gongwu",
      "type": "kb",
      "name": "工务知识库",
      "enabled": true,
      "maxSearchCount": 5,
      "weight": 0.8,
      "scoreThreshold": 0.6,
      "topK": 50,
      "timeoutSeconds": 15,
      "kbId": "kb-gongwu-001",
      "scope": "scope-gongwu"
    },
    {
      "id": "kb-peixun",
      "type": "kb",
      "name": "培训知识库",
      "enabled": false,
      "maxSearchCount": 5,
      "weight": 0.3,
      "scoreThreshold": 0.6,
      "topK": 50,
      "timeoutSeconds": 15,
      "kbId": "kb-peixun-001",
      "scope": "scope-peixun"
    },
    {
      "id": "web-search",
      "type": "webSearch",
      "enabled": true,
      "maxRounds": 3,
      "timeoutSeconds": 15
    },
    {
      "id": "web-extractor",
      "type": "webExtractor",
      "enabled": true,
      "timeoutSeconds": 15
    }
  ],
  "react": {
    "enabled": true,
    "maxIterations": 10,
    "maxSearchCount": 5
  },
  "context": {
    "maxHistoryRounds": 10,
    "enableSessionCache": true,
    "usePreviousResponseId": true
  },
  "apiMode": {
    "useResponsesApi": true,
    "enableSessionCache": true
  },
  "bailian": {
    "useMaasDomain": false,
    "maasRegion": "cn-beijing"
  },
  "rateLimit": {
    "seconds": 20
  },
  "sseTimeout": {
    "ms": 120000
  }
}
```

### 4.2 8 个 config_key 字段说明

| config_key | 字段 | 范围/类型 | 默认值 | 说明 |
|-----------|------|----------|--------|------|
| **models** | defaultModel | 字符串 | "qwen3.6-plus" | 百炼模型 ID |
| | temperature | (0, 2) | 0.7 | 随机性，0=稳定一致，2=创造发散 |
| | top_p | (0, 1) | 0.8 | 核采样阈值，0=聚焦，1=多样 |
| | thinking_budget | int tokens | 4096 | 思维链最大输出 tokens |
| | reasoningEffort | enum(low/medium/high) | "medium" | 思考档位（粗档位，与 thinking_budget 配合）|
| | maxOutputTokens | int 或 null | null | 单次回复字数上限，null=不限制 |
| | maxContextWindow | int tokens | 32000 | 单次请求最大 tokens（Q2 决策 C：agent 优先）|
| **tools** | (数组) | N 个工具实例 | 4 个默认 | 每个工具有 id/type/enabled/独立配置 |
| | - kb.* | 见 D4 | 5 个 KB 字段 | weight/scoreThreshold/maxSearchCount/topK/timeoutSeconds/kbId/scope |
| | - webSearch.maxRounds | (1, 10) | 3 | 联网搜索最大轮次 |
| | - webExtractor | 仅 timeoutSeconds | 15s | 网页抓取超时 |
| **react** | enabled | bool | true | 是否启用 ReAct |
| | maxIterations | (1, 50) | 10 | 最大循环次数 |
| | maxSearchCount | (1, 10) | 5 | 每次循环最大搜索数 |
| **context** | maxHistoryRounds | (0, 30) | 10 | 短期记忆轮数（百炼 0-30） |
| | enableSessionCache | bool | true | 7 天会话锚缓存 |
| | usePreviousResponseId | bool | true | 多轮上下文传递 |
| **apiMode** | useResponsesApi | bool | true | 百炼新版 Responses API（支持 previous_response_id） |
| | enableSessionCache | bool | true | 同 context.enableSessionCache |
| **bailian** | useMaasDomain | bool | false | 切换到 Maas 域名（海外部署）|
| | maasRegion | enum | "cn-beijing" | 区域 |
| **rateLimit** | seconds | int | 20 | 同一问题 N 秒内不重复调 AI |
| **sseTimeout** | ms | int | 120000 | SSE 流超时 |

### 4.3 配置读取优先级

```
DB 存值（enabled=1 + 字段非 null）  → 用 DB 值
DB 存值（enabled=0 / null / 缺失）   → 用 AiAgentProperties 硬编码默认值
DTO overrides（临时调试参数）       → 最高优先级（仅本次 conversationId 内）
```

**关键**：
- **agent_id 维度优先**：每个 agent 独立配置，不共享
- **DB → YML 兜底**：DB 无值时 fallback 到 `AiAgentProperties`（v3 硬编码默认值，存量配置不丢）
- **DTO overrides 仅本会话**：调试面板临时参数，刷新即失效，不持久化

---

## 五、AgentInvoker SDK 设计

### 5.1 架构定位

**AgentInvoker 是业务方调 AI 的唯一入口**。业务代码**不接触**：
- ❌ 百炼 SDK（BailianChatCaller / BailianResponsesCaller）
- ❌ 配置存储（ai_agent_config 表）
- ❌ KB 检索 API

业务代码**只需**：
- ✅ 调 `AgentInvoker.invoke(agentId, query, conversationId, overrides)`
- ✅ 拿到 SSE 流返回给前端

### 5.2 接口定义

```java
package com.wk.traincenter.ai.application.invoker;

public class AgentInvoker {
    /**
     * 业务方统一调用入口
     * @param agentId        智能体 ID（如 "agent-gongwu-qa"）
     * @param userQuery      用户问题
     * @param conversationId 会话 ID（前端生成，UUID 用于调试面板隔离）
     * @param overrides     临时参数覆盖（可为 null）
     * @return SSE 流（带 conversationId 字段）
     */
    public SseStream invoke(String agentId,
                            String userQuery,
                            String conversationId,
                            Map<String, Object> overrides);
}
```

### 5.3 内部处理流程

```java
public SseStream invoke(String agentId, String userQuery,
                        String conversationId, Map<String, Object> overrides) {
    // 1. 加载 agent + 配置（从 ai_agent + ai_agent_config 表）
    AgentFullConfig config = agentConfigQueryService.loadFullConfig(agentId);
    if (config == null) {
        throw new AgentNotFoundException(agentId);
    }
    if (!config.isEnabled()) {
        throw new AgentDisabledException(agentId);
    }

    // 2. 应用 overrides（临时参数，本 conversationId 内生效）
    if (overrides != null) {
        config.applyOverrides(overrides);
    }

    // 3. 过滤 enabled=false 的 KB 工具（主人关键需求：D4）
    List<KbToolConfig> enabledKbs = config.getTools().stream()
        .filter(t -> "kb".equals(t.getType()))
        .filter(KbToolConfig::isEnabled)
        .collect(Collectors.toList());

    // 4. KB 联合检索（只调 enabled=true 的，对齐百炼单次多 KB 联合检索）
    List<KbResult> kbResults = kbSearcher.search(
        enabledKbs,
        userQuery,
        config.getModels()
    );

    // 5. 构建百炼请求（含 conversationId、overrides、流式开关）
    BailianResponsesRequest req = buildRequest(
        config, userQuery, conversationId, kbResults
    );

    // 6. 调用百炼（按 stream_enabled 决定 SSE/同步）
    return config.isStreamEnabled()
        ? responsesCaller.stream(req)  // SSE 流式
        : chatCaller.invoke(req);      // 同步（仅当 stream_enabled=false）
}
```

### 5.4 KB 过滤逻辑详解（主人关键需求 D4）

主人原话：
> "问答中我只选择了工务的知识库,那么前台就不会显示培训的知识库"

**两层过滤**：

| 层级 | 过滤对象 | 过滤逻辑 |
|------|---------|---------|
| **L1 后端检索** | 实际 KB 检索调用 | `enabled=true` 的 KB 才调百炼 `POST /api/v1/indices/knowledge/search` |
| **L2 前端展示** | 前端聊天界面"知识库引用"展示 | 只显示该 agent 配置中 `enabled=true` 的 KB 实例 |

**代码示例**（L1 后端过滤）：
```java
// AgentInvoker.invoke() 步骤 4
List<KbToolConfig> enabledKbs = config.getTools().stream()
    .filter(t -> "kb".equals(t.getType()))
    .filter(KbToolConfig::isEnabled)        // ← 关键：过滤掉 disabled 的 KB
    .collect(Collectors.toList());

// 例：agent-X 配置中 kb-gongwu=true, kb-peixun=false
// → enabledKbs 只含 kb-gongwu
// → 只调 kb-gongwu 对应的百炼 KB，不调 kb-peixun
List<KbResult> kbResults = kbSearcher.search(enabledKbs, ...);
```

**前端展示**（L2）：
```vue
<!-- AIChatPanel.vue -->
<div class="kb-references">
  <div v-for="kb in agent.config.tools.filter(t => t.enabled && t.type === 'kb')"
       :key="kb.id" class="kb-ref-item">
    参考来源：{{ kb.name }}
  </div>
</div>
<!-- 例：agent-X 只显示"工务知识库"，不显示"培训知识库" -->
```

### 5.5 KB 联合检索实现（对齐百炼）

**百炼 API**（参考 `~/.claude/skills/bailian-docs-llm-wiki/wiki/concepts/rag.md`）：
- `POST /api/v1/indices/knowledge/search` — 跨多知识库联合语义检索，最多 15 个 KB

**本设计采用单次联合检索**（性能优于并行调多次）：
```java
// KbSearcher.java
public List<KbResult> search(List<KbToolConfig> enabledKbs,
                              String userQuery,
                              ModelsConfig models) {
    BailianSearchRequest req = new BailianSearchRequest();
    req.setIndices(enabledKbs.stream()
        .map(KbToolConfig::getKbId)
        .collect(Collectors.toList()));
    req.setQuery(userQuery);
    req.setTopK(enabledKbs.stream()
        .mapToInt(KbToolConfig::getTopK)
        .max().orElse(50));                              // 取最大 topK
    req.setSimilarityCutoff(enabledKbs.stream()
        .mapToDouble(KbToolConfig::getScoreThreshold)
        .min().orElse(0.0));                            // 取最小阈值（最宽松）
    // 每个 KB 的 weight 作为库内权重传入
    req.setWeights(enabledKbs.stream()
        .collect(Collectors.toMap(
            KbToolConfig::getKbId,
            KbToolConfig::getWeight)));

    return bailianClient.search(req);
}
```

### 5.6 上下文传递（百炼 previous_response_id）

**主人 D6 + D8 配置**：当 `context.usePreviousResponseId=true` 且 `apiMode.useResponsesApi=true` 时，启用百炼多轮上下文自动管理（7 天有效期）。

```java
// AgentInvoker.invoke() 步骤 5
BailianResponsesRequest req = new BailianResponsesRequest();
req.setAppId(config.getModels().getDefaultModel());
req.setPrompt(userQuery);
req.setSystemMessage(config.getSystemPrompt());

if (config.getContext().isUsePreviousResponseId()
    && config.getApiMode().isUseResponsesApi()) {
    // 从会话存储查 previous_response_id
    String prevId = sessionStore.getPreviousResponseId(
        conversationId, agentId
    );
    req.setPreviousResponseId(prevId);
}

// SSE 流返回时，从响应中提取 new previous_response_id 并存
responsesCaller.stream(req).subscribe(
    chunk -> {
        if (chunk.getPreviousResponseId() != null) {
            sessionStore.savePreviousResponseId(
                conversationId, agentId,
                chunk.getPreviousResponseId()
            );
        }
    }
);
```

---

## 六、路由层 + 权限矩阵

### 6.1 路由层 DTO

```java
public class AgentChatRequestDto {
    private String agentId;              // 必填，智能体 ID
    private String userQuery;            // 必填，用户问题
    private String conversationId;       // 可选，前端生成 UUID（用于调试面板隔离）
    private Boolean stream;              // 可选，默认 = agent.stream_enabled
    private Double temperature;          // 临时覆盖（仅本会话）
    private Double topP;                 // 临时覆盖
    private Integer thinkingBudget;      // 临时覆盖
    private Integer topK;                // 临时覆盖（KB 召回数）
    private Double scoreThreshold;       // 临时覆盖
    private Map<String, Object> overrides;  // 通用覆盖字段
}
```

### 6.2 Controller 端点设计

**A. 管理端 Controller**（写权限 `ai:agent:config`）

| 方法 | 路径 | 权限 | 功能 |
|------|------|------|------|
| GET | `/admin/ai/agent/list` | `ai:agent:config` | 智能体列表（含分页、标签筛选） |
| GET | `/admin/ai/agent/{agentId}` | `ai:agent:config` | 智能体详情（含完整配置） |
| POST | `/admin/ai/agent/save` | `ai:agent:config` | 保存智能体（含主表 + 配置表批量保存） |
| POST | `/admin/ai/agent/{agentId}/copy` | `ai:agent:config` | 复制现有智能体 |
| DELETE | `/admin/ai/agent/{agentId}` | `ai:agent:config` | 软删除（设置 archived_at） |
| POST | `/admin/ai/agent/{agentId}/disable` | `ai:agent:config` | 禁用（设置 enabled=0） |
| POST | `/admin/ai/agent/{agentId}/reset-config` | `ai:agent:config` | 重置配置（清空该 agent 配置走 AiAgentProperties fallback） |

**B. 业务方查询 Controller**（只读权限 `ai:agent:query`）

| 方法 | 路径 | 权限 | 功能 |
|------|------|------|------|
| GET | `/api/agent/{agentId}` | `ai:agent:query` | 智能体完整配置（业务方 + AgentInvoker 用） |
| GET | `/api/agent/{agentId}/schema` | `ai:agent:query` | 字段定义（前端调试面板 schema） |
| GET | `/api/agent/list/enabled` | `ai:agent:query` | 已启用的智能体列表（业务方选择用） |

### 6.3 权限矩阵（主人 D3 决策）

| 角色 | `ai:agent:config`（写） | `ai:agent:query`（只读） |
|------|------------------------|--------------------------|
| super_admin | ✅ 有 | ✅ 有 |
| 运维子角色 | ✅ 有 | ✅ 有 |
| 业务方 | ❌ **无**（Shiro 自动拒绝） | ✅ 有 |
| 业务方服务调用方 | ❌ 无 | ✅ 有 |

**架构意义**：
- 业务方**架构上禁止写配置**（即使代码绕过 Shiro 也无 Controller 端点可调）
- AgentInvoker 内部调 `/api/agent/{agentId}`（只读权限，业务方服务自动有）

### 6.4 业务方接入 Demo

```java
// BusinessController.java（业务方代码）
@RestController
public class BusinessController {
    @Autowired private AgentInvoker agentInvoker;

    @PostMapping("/api/business/ask")
    public SseStream ask(@RequestBody AskRequest req) {
        return agentInvoker.invoke(
            req.getAgentId(),           // "agent-gongwu-qa"
            req.getQuery(),
            req.getConversationId(),    // 前端生成 UUID
            null                        // 无临时覆盖
        );
    }
}

// AskRequest.java（业务方 DTO）
public class AskRequest {
    private String agentId;
    private String query;
    private String conversationId;
}
```

**业务方代码完全不接触**：
- ❌ ai_agent_config 表（数据库）
- ❌ BailianResponsesCaller / BailianChatCaller（百炼 SDK）
- ❌ KB 检索 API
- ❌ 配置 JSON 解析

**Code Review 红线**：
- ❌ 业务方代码出现 `import com.qwen.dashscope.*` → 拒绝合并
- ❌ 业务方代码出现 `@Autowired CfgPropService` → 拒绝合并
- ✅ 只允许 `import com.wk.traincenter.ai.application.invoker.AgentInvoker`

---

## 七、实施步骤

### 7.1 Phase 1：数据层 + DTO + 路由（3d）

**Step 1.1：DDL 建表**（0.5d）
- 创建 `ai_agent` + `ai_agent_config` 表（见 §3.1）
- 创建 `idx_tags`、`idx_archived`、`idx_enabled` 索引

**Step 1.2：Migration 脚本（事务化 + 幂等）**（0.5d）
```sql
START TRANSACTION;
  -- 1. 备份 v3 旧表到 _backup_20260728
  -- 2. 插入默认 agent（id='default'）
  -- 3. REPLACE INTO ai_agent_config 从 v3 旧表读数据
  -- 4. 验证 8 行齐全（models/tools/react/context/apiMode/bailian/rateLimit/sseTimeout）
COMMIT;
```

**Step 1.3：Entity + Mapper + Service（新建）**（1d）
- `wk-module-ai/.../infra/entity/AiAgentEntity.java`
- `wk-module-ai/.../infra/entity/AiAgentConfigEntity.java`
- `wk-module-ai/.../infra/mapper/AiAgentMapper.java`
- `wk-module-ai/.../infra/mapper/AiAgentConfigMapper.java`
- `wk-module-ai/src/main/resources/mapper/AiAgentMapper.xml`
- `wk-module-ai/src/main/resources/mapper/AiAgentConfigMapper.xml`
- `wk-module-ai/.../domain/AiAgentRepository.java`（接口）
- `wk-module-ai/.../domain/AiAgentConfigRepository.java`（接口）

**Step 1.4：应用层 Service + AgentConfigQueryService（新建）**（0.5d）
- `wk-module-ai/.../application/config/AgentConfigService.java`（接口）
- `wk-module-ai/.../application/config/AgentConfigServiceImpl.java`（实现，CRUD + 复制）
- `wk-module-ai/.../application/config/AgentConfigQueryService.java`（**只读**，业务方用）

**Step 1.5：扩展 AiGatewayConstants（必做）**（0.5d）
```java
public static final String AGENT_CONFIG_KEY_MODELS = "models";
public static final String AGENT_CONFIG_KEY_TOOLS = "tools";
public static final String AGENT_CONFIG_KEY_REACT = "react";
public static final String AGENT_CONFIG_KEY_CONTEXT = "context";   // 新增
public static final String AGENT_CONFIG_KEY_API_MODE = "apiMode";
public static final String AGENT_CONFIG_KEY_BAILIAN = "bailian";
public static final String AGENT_CONFIG_KEY_RATE_LIMIT = "rateLimit";
public static final String AGENT_CONFIG_KEY_SSE_TIMEOUT = "sseTimeout";
```

### 7.2 Phase 2：AgentInvoker SDK + 4 文件切换（3d）

**Step 2.1：新建 AgentInvoker + KbSearcher**（1d）
- `wk-module-ai/.../application/invoker/AgentInvoker.java`
- `wk-module-ai/.../application/invoker/KbSearcher.java`
- 实现 §5.3 完整流程

**Step 2.2：新建 AgentConfigResolver**（0.5d）
- `wk-module-ai/.../application/config/AgentConfigResolver.java`
- 实现 §4.3 配置读取优先级（DB → YML → overrides）

**Step 2.3：修改 AgentConfigServiceImpl**（0.5d）
- 注入 `AgentConfigResolver`
- 委托 Resolver 读取所有 6 类配置
- **开工前重新 grep** `cfg.ai.bailian` 在 AgentConfigServiceImpl.java 找到 if 分支，删除整段，直接 return Resolver 结果

**Step 2.4：修改 AgentReActExecutorImpl**（0.5d）
- 注入 `AgentConfigResolver`
- **开工前重新 grep** `aiAgentProperties\.` 在 AgentReActExecutorImpl.java 找到所有引用处（约 9 处），逐个替换为 Resolver 调用

**Step 2.5：修改 BailianResponsesCaller**（0.5d）
- 注入 `AgentConfigResolver`
- **开工前重新 grep** `getBailian\(\)\.` 在 BailianResponsesCaller.java 找到所有引用处（约 3 处），每处改为 `resolver.resolvedBailian().get...()`
- 构造函数改为同时持有 `AiAgentProperties props` 和 `AgentConfigResolver resolver`
- props 保留为兜底源

### 7.3 Phase 3：前端 agent 列表 + Markdown + slider UI（3.5d）

**Step 3.1：扩展 AiConfigController + AgentQueryController**（0.5d）
- 管理端 7 个端点（见 §6.2 A 表）
- 业务端 3 个端点（见 §6.2 B 表）

**Step 3.2：前端 agent 列表 + 创建/复制/删除**（1d）
- 左侧 list 组件（Vue 3 Composition API）
- 标签筛选（纯前端过滤）
- [+ 新建] / [复制] / [删除] / [禁用] 按钮

**Step 3.3：中间配置表单**（1d）
- 8 大 config_key 表单（models/tools/react/context/apiMode/bailian/rateLimit/sseTimeout）
- KB 工具列表（多实例 + [+ 添加知识库] 弹窗）
- slider UI 重构（v3 el-input-number → el-slider）

**Step 3.4：Markdown 双 Tab + 预览渲染**（0.5d）
- 提示词编辑器：[Markdown 原文] / [预览（Word 样式）] 两个 Tab
- `marked.js` 实时渲染
- 视觉对齐 Word 文档样式（标题加粗、代码块背景、列表缩进）

**Step 3.5：保存前 Diff 弹窗**（0.5d）
- 弹窗显示改动对比（git-like 表格）
- 颜色：无变化灰 / 新增绿 / 删除红 / 修改黄
- [取消] / [确认保存] 按钮

### 7.4 Phase 4：实时调试面板 + SSE 流式（3d）

**Step 4.1：右侧调试面板布局**（0.5d）
- 对话框（用户 / AI 双气泡）
- 临时参数面板（思考深度 slider + 温度 slider + TopP slider + TopK slider）

**Step 4.2：SSE 流式响应接收**（1d）
- EventSource 监听
- conversationId 路由分桶
- 逐字渲染到对话框

**Step 4.3：临时参数覆盖**（0.5d）
- 调参数立即中断旧流（标记 cancelled）
- 用新 conversationId 发起新请求
- 流式响应期间禁用调试面板参数改动（避免新旧混用）

**Step 4.4：多 KB 过滤前端展示**（0.5d）
- 聊天界面"知识库引用"展示
- 只显示该 agent 配置中 enabled=true 的 KB
- D4 主人关键需求落地

**Step 4.5：历史会话列表**（0.5d）
- 调试面板下方展示历史对话
- 支持点开重看

### 7.5 联调测试（1.5d）

- 端到端：管理端创建 agent → 业务方调 AgentInvoker → 调百炼 → SSE 流
- 流式：验证 conversationId 隔离、中断旧流、新参数立即生效
- 多 KB 过滤：验证只调 enabled=true 的 KB，前端展示过滤
- Markdown 预览：验证 marked.js 渲染样式对齐 Word
- AgentInvoker 业务方接入 demo：验证业务方代码不接触百炼 SDK
- 软删除：验证 archived_at 设置后业务方调 AgentInvoker 抛 AgentDisabledException

### 7.6 工时汇总

| Phase | 内容 | 工时 |
|-------|------|------|
| Phase 1 | 数据层 + DTO + 路由 | 3d |
| Phase 2 | AgentInvoker SDK + 4 文件切换 | 3d |
| Phase 3 | 前端 agent 列表 + Markdown + slider + Diff | 3.5d |
| Phase 4 | 实时调试面板 + SSE 流式 | 3d |
| 联调 | 端到端 + SDK 业务方接入 demo | 1.5d |
| **总计** | | **13-14d** |

### 7.7 依赖关系图

```
Phase 1 (DDL + Migration + CRUD + DTO + QueryService)
    ↓
Phase 2 (AgentInvoker SDK + AgentConfigResolver + 4 文件切换)
    ↓
Phase 3 (前端 agent 列表 + Markdown + slider + Diff)
    ↓
Phase 4 (实时调试面板 + SSE 流式)
    ↓
联调（端到端）
```

---

## 八、前端 UI 设计

### 8.1 整体布局（参考百炼控制台）

```
┌──────────────────┬──────────────────────────┬──────────────────┐
│ 智能体列表        │ 配置面板                   │ 实时调试          │
│ （左侧 25% 宽）   │ （中间 50% 宽）            │ （右侧 25% 宽）   │
├──────────────────┼──────────────────────────┼──────────────────┤
│ [+ 新建]         │ 基础                      │ 对话框            │
│                  │ 名称/简述/标签/描述         │ ┌────────────┐   │
│ ● 船舶答疑助手    │                          │ │ 用户: ...   │   │
│   工务知识库     │ 模型                      │ │ AI: ...   │   │
│   production     │  模型[下拉]                │ └────────────┘   │
│                  │                          │                  │
│ ○ 培训陪练       │  ── 思考深度 ──           │ 临时参数(不存)     │
│   工务+培训 KB   │  粗略 ●━━━━━━━ 精准        │ 思考深度: 精准    │
│   experimental   │  reasoningEffort          │ 温度:    0.7     │
│                  │                          │ TopP:    0.8     │
│                  │  温度 ▓▓▓▓░░ 0.7           │ TopK:    50      │
│                  │  稳定          发散        │                  │
│                  │                          │  [测试(流式)]     │
│                  │  TopP ▓▓▓▓░░ 0.8           │  ───────────     │
│                  │  聚焦          多样        │  历史对话:        │
│                  │                          │  - 会话 1(3轮)   │
│                  │  ── 知识库工具 ──          │  - 会话 2(1轮)   │
│                  │  ☑ 工务知识库              │                  │
│                  │   权重 ▓▓▓▓░░ 0.8          │                  │
│                  │   阈值 ▓▓▓░░░ 0.6          │                  │
│                  │   召回 ▓▓▓▓░░ 5            │                  │
│                  │   [编辑] [删除]            │                  │
│                  │  ☐ 培训知识库 [启用]        │                  │
│                  │                          │                  │
│                  │  ── 网络工具 ──            │                  │
│                  │  ☑ 联网搜索(最多▓轮 3)     │                  │
│                  │  ☑ 网页抓取(15s)          │                  │
│                  │                          │                  │
│                  │  ── ReAct ──              │                  │
│                  │  ☑ 启用                   │                  │
│                  │  最大循环 ▓▓▓░░░ 10        │                  │
│                  │  短思考       长推理        │                  │
│                  │                          │                  │
│                  │  ── 上下文 ──              │                  │
│                  │  历史轮数 ▓▓▓░░░ 10        │                  │
│                  │  ☑ 会话缓存                │                  │
│                  │  ☑ 多轮上下文              │                  │
│                  │                          │                  │
│                  │  ── API 模式 ──            │                  │
│                  │  ☑ 流式输出                │                  │
│                  │  ☐ useResponsesApi        │                  │
│                  │                          │                  │
│                  │  ── 提示词 ──              │                  │
│                  │  [Markdown 原文] [预览]   │                  │
│                  │  ┌─────────────────────┐  │                  │
│                  │  │ # 角色              │  │                  │
│                  │  │ 你是船舶设备维保助手 │  │                  │
│                  │  │                     │  │                  │
│                  │  │ ## 能力             │  │                  │
│                  │  │ - 设备故障诊断       │  │                  │
│                  │  │ - 维护建议           │  │                  │
│                  │  └─────────────────────┘  │                  │
│                  │                          │                  │
│                  │  ── 端点 ──               │                  │
│                  │  区域[下拉]  超时□ms      │                  │
│                  │                          │                  │
│                  │  [保存] [恢复默认] [删除]   │                  │
└──────────────────┴──────────────────────────┴──────────────────┘
```

### 8.2 Slider 隐喻表（主人决策 10）

| 参数 | slider 范围 | 左侧文字 | 右侧文字 | 隐喻 |
|------|------------|---------|---------|------|
| temperature | 0 - 2 | 稳定一致 | 创造发散 | 主人决策 5 |
| top_p | 0 - 1 | 聚焦 | 多样 | 主人决策 5 |
| 思考深度 | low/medium/high | 粗略快速 | 精准深入 | 主人决策 10 |
| KB 相似度阈值 | 0 - 1 | 宽松召回 | 精准匹配 | 主人原话 |
| KB 召回数量 | 1 - 100 | 少而精 | 多而广 | 主人原话 |
| KB 工具权重 | 0 - 1 | 辅助 | 主源 | 主人原话 |
| maxIterations | 1 - 50 | 短思考 | 长推理 | 主人决策 7 |
| maxOutputTokens | 0 - 100000 | 短答 | 长答 | 主人 V3 决策 1-3 |
| maxHistoryRounds | 0 - 30 | 无记忆 | 长记忆 | 主人新加 context 维度 |
| thinking_budget | 0 - 32768 | 浅思考 | 深思考 | 主人决策 5 |

**设计原则**：每个 slider 左右两端 + 中间点都有文字标签，主人原话"指示那种是更高或者更低,更精准还是更粗略,思考维度是否更多还是少"。

### 8.3 Diff 弹窗样式（主人决策 #5）

保存前弹窗（git-like 字段对比）：

```
┌──────────────────────────────────────────────┐
│ 改动对比                              [×]    │
├──────────────────────────────────────────────┤
│ ┌────────────────┬─────────┬─────────┬─────┐│
│ │ 字段            │ 上一版   │ 新版本   │ 变化││
│ ├────────────────┼─────────┼─────────┼─────┤│
│ │ 模型            │ qwen3.6+│ qwen3.6+│ 无  ││
│ │ 思考深度        │ medium  │ high    │ 提升││
│ │ KB 工务 权重    │ 0.5     │ 0.8     │+0.3 ││
│ │ KB 工务 召回数  │ 5       │ 3       │ -2  ││
│ │ 提示词          │ ...     │ ...     │ 编辑││
│ │ 流式输出        │ 是      │ 是      │ 无  ││
│ └────────────────┴─────────┴─────────┴─────┘│
│ 颜色图例: 无变化(灰) / 新增(绿) / 修改(黄)   │
│                                              │
│              [取消]    [确认保存]              │
└──────────────────────────────────────────────┘
```

### 8.4 Markdown 预览样式

主人原话："可以 markdown 和 word 切换的形式,类似于 vscode 的插件 Office Viewer"

预览 Tab 视觉对齐 Word 文档：

```css
.md-preview {
    font-family: 'Microsoft YaHei', sans-serif;
    line-height: 1.6;
    padding: 20px 40px;
    background: #fff;
}
.md-preview h1 { font-size: 24px; font-weight: bold; margin: 16px 0; }
.md-preview h2 { font-size: 20px; font-weight: bold; margin: 14px 0; }
.md-preview h3 { font-size: 16px; font-weight: bold; margin: 12px 0; }
.md-preview code {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', monospace;
}
.md-preview pre {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
}
.md-preview ul, .md-preview ol { margin-left: 20px; }
```

---

## 九、风险与缓解

| 风险 | 等级 | 缓解 |
|------|------|------|
| **多 Agent 路由缓存 key 未按 agent 区分** | 🔴 高 | `@Cacheable` key 必含 `agentId`，避免 agent A 缓存了 agent B 的配置 |
| **删除/禁用 agent 后业务方调用失败** | 🟠 中 | 软删除（`archived_at`），业务方调 AgentInvoker 抛 `AgentNotFoundException` / `AgentDisabledException` |
| **KB 工具多实例检索性能** | 🟠 中 | 单次联合检索（百炼 `/api/v1/indices/knowledge/search`），对齐百炼 |
| **调试面板临时参数混用** | 🟠 中 | conversationId 隔离 + 中断旧流（D5） |
| **SSE 流式响应中断/超时** | 🟠 中 | `sseTimeout.ms=120000` 可调，前端 EventSource 自动重连 |
| **提示词 Markdown 渲染 XSS** | 🟡 低 | `marked.js` 配置 `sanitize=true` 或 `DOMPurify` 清洗 |
| **多个 Agent 改同一份提示词模板** | 🟡 低 | 提供"复制现有 agent"快捷（§6.2 A 表） |
| **主人新加工具类型需改表结构** | 🟢 低 | 工具数组化设计（D4），新增 type 不动表结构 |
| **AgentInvoker 业务方直连百炼绕过** | 🟠 中 | 软约束（主人决策 #13）+ code review 红线 + 定期 grep |
| **migration 脚本数据丢失** | 🟢 低 | 事务化 + REPLACE INTO 幂等 + v3 旧表保留 30 天观察期 |
| **Q1/Q2/Q3 中主人已闭环的 bug 重提** | 🟢 低 | Phase 0 整节删除（R-1/R-2/R-3 已闭环，见 §十一决策追溯） |

---

## 十、验收清单

### 10.1 功能验收

- [ ] 智能体列表：支持创建/编辑/复制/删除/禁用
- [ ] 每个 Agent 独立配置 8 大 config_key
- [ ] KB 工具支持多实例 + 独立配置
- [ ] 启用/禁用 KB 后，业务方调 AI 实际只检索启用的 KB
- [ ] 调试面板右侧 conversationId 隔离
- [ ] 临时参数覆盖 temperature/top_p/thinking_budget/topK
- [ ] SSE 流式响应正常（逐字渲染）
- [ ] 改动对比 Diff 弹窗（git-like 表格 + 颜色标记）
- [ ] 提示词 Markdown 双 Tab（原文 + 预览）
- [ ] slider UI 全部 10 个参数都有左右文字标签
- [ ] AgentInvoker SDK 业务方 demo 通过
- [ ] 业务方无写配置权限（Shiro 拦截测试通过）

### 10.2 性能验收

- [ ] AgentInvoker.invoke() 平均响应 < 200ms（不含百炼调用）
- [ ] 配置查询走 @Cacheable，二次访问 < 10ms
- [ ] KB 联合检索 < 2s（百炼 API 调用）
- [ ] SSE 流式响应无断流（120s 超时前不断）

### 10.3 安全验收

- [ ] 业务方调 `POST /admin/ai/agent/save` → 403（Shiro 拦截）
- [ ] 业务方调 `POST /admin/ai/agent/{id}/disable` → 403
- [ ] AgentInvoker 内部调 `/api/agent/{id}` → 200（业务方只读权限）
- [ ] SQL 注入测试（参数化查询 + MyBatis-Plus）
- [ ] Markdown 预览 XSS 测试（特殊字符转义）

### 10.4 向后兼容验收

- [ ] ai_agent_config 表无数据时，fallback 到 AiAgentProperties 硬编码默认值
- [ ] v3 旧表 ai/voice/vision/bailian_kb 4 行 enabled=1 不受影响
- [ ] 存量配置（answer_assistant/training_assistant 提示词）自动归属 agent_id='default'

### 10.5 代码质量验收

- [ ] `mvn clean compile` 通过
- [ ] `mvn test` 通过（新增 AgentInvoker 单元测试 + KB 过滤测试）
- [ ] `npm run typecheck` 通过
- [ ] `npm run lint` 通过

---

## 十一、决策追溯（13 项 grill-me 拍板）

主人于 2026-07-28 与 Claude 完成 13 项关键决策的 grill-me 拍板，过程见 `reviews/1.5/2026-07-28-AI配置控制台DDD演进-计划审核-by-claude.md` §6。

| # | 决策 | 选项 | 落地位置 |
|---|------|------|---------|
| 1 | 数据模型 | 单表派系（ai_agent + ai_agent_config） | §三 |
| 2 | agentId 路由 | DTO 字段（AgentChatRequestDto.agentId） | §六.1 |
| 3 | KB 工具范围 | 工具实例级（每个 agent 可挂多个 KB 工具实例） | §四.2 tools 数组 |
| 4 | 调试面板隔离 | conversationId 隔离 + 中断旧流 | §五.3 / §七.4 Step 4.3 |
| 5 | 模型参数扩展 | 加 temperature + top_p + thinking_budget | §四.1 models |
| 6 | ReAct 边界 | 1-50（对齐百炼） | §四.2 react |
| 7 | 工具数 | N 个（扩展位） | §四.1 tools 数组 |
| 8 | SSE 流式 | v4 含（工期 +1d） | §五.3 / §七.4 |
| 9 | 智能体标签/简述 | 加 short_desc + tags（AI 调控维度） | §三.1 |
| 10 | reasoningEffort | 保留 + 拖动条 UI | §八.2 |
| 11 | 配置 API 化唯一出口 | 业务只读，AgentInvoker 软约束 | §五 / §六.3 |
| 12 | 提示词 Markdown 双模式 | A 方案（marked.js 渲染） | §八.4 |
| 13 | AgentInvoker 强制力 | A 软约束（SDK + code review） | §六.4 |
| 补充 | 上下文 maxContextWindow 来源 | C：两者都行，agent 配优先 | §四.1 models |

---

## 十二、关键文件清单

### 12.1 新建文件（15 个）

| 文件 | 操作 | 说明 |
|------|------|------|
| `wk-module-ai/.../infra/entity/AiAgentEntity.java` | 新建 | 主表实体 |
| `wk-module-ai/.../infra/entity/AiAgentConfigEntity.java` | 新建 | 配置表实体 |
| `wk-module-ai/.../infra/mapper/AiAgentMapper.java` | 新建 | MyBatis Mapper |
| `wk-module-ai/.../infra/mapper/AiAgentConfigMapper.java` | 新建 | MyBatis Mapper |
| `wk-module-ai/src/main/resources/mapper/AiAgentMapper.xml` | 新建 | SQL 映射 |
| `wk-module-ai/src/main/resources/mapper/AiAgentConfigMapper.xml` | 新建 | SQL 映射 |
| `wk-module-ai/.../domain/AiAgentRepository.java` | 新建 | Repository 接口 |
| `wk-module-ai/.../domain/AiAgentConfigRepository.java` | 新建 | Repository 接口 |
| `wk-module-ai/.../application/config/AgentConfigService.java` | 新建 | CRUD Service 接口 |
| `wk-module-ai/.../application/config/AgentConfigServiceImpl.java` | 新建 | CRUD Service 实现 |
| `wk-module-ai/.../application/config/AgentConfigQueryService.java` | 新建 | **只读** Service（业务方用） |
| `wk-module-ai/.../application/config/AgentConfigResolver.java` | 新建 | 配置合并层（DB → YML → overrides） |
| `wk-module-ai/.../application/invoker/AgentInvoker.java` | 新建 | **核心**：业务方统一调用入口 |
| `wk-module-ai/.../application/invoker/KbSearcher.java` | 新建 | KB 联合检索（含 enabled 过滤） |
| `wk-train-center-ui/.../views/admin/agent/` | 新建 | 前端整个模块（新目录） |

### 12.2 修改文件（5 个）

| 文件 | 操作 | 说明 |
|------|------|------|
| `wk-module-ai/.../controller/AiConfigController.java` | 修改 | 扩展 7 个管理端端点（§6.2 A 表） |
| `wk-module-ai/.../controller/AgentQueryController.java` | 修改/新建 | 业务方只读 3 个端点（§6.2 B 表） |
| `wk-module-ai/.../application/impl/AgentConfigServiceImpl.java` | 修改 | 委托 Resolver |
| `wk-module-ai/.../application/react/AgentReActExecutorImpl.java` | 修改 | 9 处引用切换到 Resolver |
| `wk-module-ai/.../application/react/BailianResponsesCaller.java` | 修改 | 3 处引用切换到 Resolver |
| `wk-module-ai/.../application/config/AiGatewayConstants.java` | 修改 | 新增 8 个 config_key 常量 |

### 12.3 不动文件

| 文件 | 说明 |
|------|------|
| `wk-module-ai/.../application/config/AiAgentProperties.java` | 保留为 fallback 源 |
| v3 旧 cfg 表行（ai/voice/vision/bailian_kb） | 保留 30 天观察期 |

---

## 附录 A：百炼调研引用

本次设计参考阿里云百炼控制台 + 文档知识库，关键引用：

- `~/.claude/skills/bailian-docs-llm-wiki/wiki/concepts/agent-application.md` — 智能体应用（Agent 1.0 vs 2.0、ReAct 1-50、内置工具、知识库、MCP）
- `~/.claude/skills/bailian-docs-llm-wiki/wiki/concepts/rag.md` — 检索增强生成（相似度阈值、TopK、权重、Rerank）
- `~/.claude/skills/bailian-docs-llm-wiki/wiki/concepts/function-calling.md` — 函数调用（ReAct 最大轮次、工具数量上限）
- `~/.claude/skills/bailian-docs-llm-wiki/wiki/concepts/streaming-output.md` — 流式输出
- `~/.claude/skills/bailian-docs-llm-wiki/models/groups/qwen3.6-plus.json` — qwen3.6-plus 入参定义（temperature/top_p/enable_search/enable_thinking/thinking_budget）

## 附录 B：术语表

| 术语 | 含义 |
|------|------|
| **Agent** | 智能体，本设计中代表一个独立可调用的 AI 实例（如船舶答疑助手） |
| **agentId** | 智能体唯一 ID，业务方调用入口 |
| **ReAct** | Reason + Act，大模型循环思考 + 工具调用模式 |
| **KB** | Knowledge Base，知识库 |
| **Maas** | Model-as-a-Service，百炼海外部署域名 |
| **SSE** | Server-Sent Events，服务端推送流式响应 |
| **AgentInvoker** | 本设计核心，业务方调 AI 的统一 SDK 入口 |
| **conversationId** | 会话 ID，调试面板临时参数隔离用 |
| **overrides** | 临时参数覆盖，仅本次会话生效，不持久化 |
| **fallback** | 配置 DB 无值时，回退到 AiAgentProperties 硬编码默认值 |