# 计划审核：AI 配置控制台 DDD 演进 (wk-train-center 1.5)

| 项 | 值 |
|---|---|
| 审核日期 | 2026-07-28 |
| 审核人 | 小马（架构师） |
| 审核范围 | [E:\rhProject\.products\projects\wk-train-center\plans\1.5\AI配置控制台DDD演进计划_d3d51d9c.md](../plans/AI配置控制台DDD演进计划_d3d51d9c.md) |
| 关联代码 | `E:\rhProject\wk-train-center-service\wk-modules\wk-module-ai\src\main\java\com\wk\traincenter\ai\controller\AiConfigController.java`<br/>`…/application/impl/AgentConfigServiceImpl.java`<br/>`…/application/react/AgentReActExecutorImpl.java`<br/>`…/application/react/BailianResponsesCaller.java`<br/>`…/application/config/AiAgentProperties.java`<br/>`E:\rhProject\wk-train-center-service\wk-commons\src\main\java\com\wk\traincenter\common\service\impl\CfgPropServiceImpl.java` |
| 关联历史决策 | 2026-07-22 主人拍板：prompts 写死后端不再入库<br/>2026-07-14 §3.6 决策前查 vault<br/>2026-07-15 主人纠错：评审放 reviews/，设计放 design/ |
| 结论 | **🔴 不通过**：方向正确（前端控制 AI 参数实时生效是真实运维痛点），但落地实现存在 3 个 P0 致命缺陷 + 5 个 P1 严重问题 + 5 个 P2 风险点，必须在开工前全部整改。**禁止直接动工**。8 项关键决策已与主人 grill-me 拍板（详见 §6）。 |

---

## 0. Scope Check（必填，参照 CLAUDE.md 与 shared-experiences）

| 维度 | 判定 |
|---|---|
| **Intent** | 让运维在管理后台直接调整 AI 行为参数（模型、工具开关、ReAct 限制、API 模式、提示词、端点配置），无需改 yml 重启服务。 |
| **Delivered** | 计划覆盖：① D1-D6 架构决策（六条）；② 配置域模型（cfg JSON 结构 + 读取优先级 + 前端 UI 草图）；③ Phase 0-5 实施步骤（含工时估算 4-5.5d）；④ 回滚策略；⑤ 风险与缓解。 |
| **Scope creep** | 无。范围严格限定"配置读取链路改造 + 前端 UI 扩展"，不拆分 God Object（plan D4 自约束）。 |
| **Missing requirements** | 见下文 P0-1/P0-2/P0-3：① plan D2 "复用 cfg 表" 与主人 2026-07-22 "prompts 不入库" 决策正面冲突；② plan 漏 BailianResponsesCaller 文件；③ plan 漏 CfgPropService.disableOtherEnabled() 全表清缓存副作用。 |
| **横向一致性** | 计划 §二 D2 "复用 cfg 表" 与 [AgentConfigServiceImpl.java:188-200](../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/impl/AgentConfigServiceImpl.java#L188-L200) 已有 `cfg type=ai provider=bailian data.model` 优先级逻辑存在**双源冲突**（详见 P1-3）。 |

---

## 1. 整体评价

**方向正确，痛点真实**。`AiAgentProperties` yml 绑定运行时不可变，"改 tool 开关需重启服务"确实是运维噩梦；前端管理后台缺失工具开关/ReAct 调参也是真实缺口（plan §一陈述属实）。

**但 qoder 看不到主人 CLAUDE.md 全局决策**，直接撞三个隐藏地雷：

1. **plan D2 "复用 cfg 表" 与主人 2026-07-22 拍板"prompts 不入库"正面冲突** —— plan 给出方案等于让主人撤销刚拍板 6 天的决策。
2. **plan 完全漏 BailianResponsesCaller 文件** —— grep 证 `aiAgentProperties.getBailian()` 实际在 BailianResponsesCaller L129/135/199 三处引用，plan Phase 2.2 只列 AgentReActExecutorImpl + AgentConfigServiceImpl 两个文件，前端改了 useMaasDomain/maasRegion 在生产**不会生效**。
3. **plan 完全漏 CfgPropService.save() 副作用** —— `disableOtherEnabled(type, provider)` 对非 ConfigType 枚举类型会清空所有 enabled 行；新 `type=ai_agent` 一键保存即所有 AI 翻车。

**单独跑这一份改动会引入 3 类新故障**：① 现有配置被误清零；② 前端改的参数不生效；③ 主人最近决策被悄悄推翻。

**好消息**：8 项关键决策已与主人 grill-me 完成拍板（详见 §6），可直接进入整改方案。

---

## 2. Critical Issues (P0 — MUST FIX)

### P0-1. plan D2 "复用 cfg 表" 与 2026-07-22 主人决策正面冲突

**类别**：架构 / 决策冲突

**证据**：

- [AgentConfigServiceImpl.java:207](../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/impl/AgentConfigServiceImpl.java#L207) 注释明说："系统提示词（ai_prompt）自 2026-07-22 起写死在后端 AiAgentProperties，不再入库，此接口不再处理"
- [AiConfigController.java:31](../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/controller/AiConfigController.java#L31) 同样有 "2026-07-22 prompts 写死" 注释
- plan §二 D1 决策 "场景层 prompts 走 cfg 控制台" → 正面撞 6 天前主人拍板

**修复**（已与主人 grill-me 拍板，见 §6-F-1）：

**推翻 2026-07-22 决策，prompts 入 cfg 控制台**。落地配套：
1. 先清 cfg 旧 `ai_prompt` 行（否则 saveAll 走"脱敏变 ..**.." 后必须重新填写"逻辑会要求强制重填）
2. AgentConfigResolver.resolvedPrompt() 优先读 cfg，fallback AiAgentProperties
3. AiConfigController.saveAll() 增加 ai_prompt 行处理

### P0-2. CfgPropService.save() 对 type=ai_agent 触发 disableOtherEnabled 全表清零

**类别**：并发 / 数据一致性 / 业务事故

**证据**：

- [CfgPropServiceImpl.java:75-77](../../wk-train-center-service/wk-commons/src/main/java/com/wk/traincenter/common/service/impl/CfgPropServiceImpl.java#L75-L77) 对**非** ConfigType 枚举内的类型强制 `disableOtherEnabled(type, provider)`
- 当前 cfg 已有 ai/voice/vision/bailian_kb 四行 enabled=1
- 新增 type=ai_agent 一行 → save() 会把上述四行 enabled 全置 0
- **前端一键保存即所有 AI 翻车**

**修复**（已与主人 grill-me 拍板，见 §6-F-2）：

**不放在 cfgprop，专门在 wk-module-ai 内独立配置**。新建 MySQL 表 `ai_agent_config` + 全套 CRUD + 独立 Shiro 权限，复用 wk-module-ai/AiConfigController 扩展。具体：
1. Phase 1.1: DDL（`id`/`config_key`/`config_value`/`enabled`/`created_at`/`updated_at` + 唯一索引 `config_key`）
2. Phase 1.2: migration 脚本（ai/voice/vision/bailian_kb 行 + ai.bailian.data.model 字段合并 → ai_agent_config，废弃 cfg 旧行 + ai.bailian.model）
3. Phase 1.3: Entity/Mapper/Service/Controller + Shiro `@RequiresPermissions("ai:agent:*")`
4. Phase 1.4: AgentConfigResolver 独立 DTO `AgentCfgData`（不复用 AiAgentProperties 内部类）

### P0-3. plan Phase 2.2 漏 BailianResponsesCaller，useMaasDomain/maasRegion 改完不生效

**类别**：范围漏列 / 隐性死代码

**证据**：

- grep `aiAgentProperties.` 在 wk-module-ai 全量命中 3 个文件：
  - `AgentReActExecutorImpl.java`（plan 已列）
  - `AgentConfigServiceImpl.java`（plan 已列）
  - **`BailianResponsesCaller.java:129/135/199`**（plan 完全漏列）
- grep `useMaasDomain` 在 BailianResponsesCaller L129 有 `getUseMaasDomain()` 调用
- grep `getBailian()` 在 AgentReActExecutorImpl 内 **0 引用**
- plan Section 3.1 data JSON 列了 `bailian.useMaasDomain/maasRegion` 但根本无人读
- **前端改了 useMaasDomain/maasRegion → 生产不生效 → 隐性"改了等于没改"**

**修复**（已与主人 grill-me 拍板，见 §6-F-3）：

**BailianResponsesCaller 一并切 Resolver，Phase 2 范围扩大**。具体：
1. BailianResponsesCaller 构造函数改为同时持有 `AiAgentProperties props` 和 `AgentConfigResolver resolver`
2. L129/L135/L199 三处改为 `resolver.resolvedBailian().getUseMaasDomain()` / `getMaasRegion()`
3. props 保留为兜底源（Resolver fallback 链不变）
4. Phase 2 工时从 1d 升到 2d

---

## 3. Important (P1 — SHOULD FIX，开工前必须补)

### P1-1. cfg JSON 反序列化目标选错 → 写入后读不到 / 默认值被覆盖

**类别**：数据契约 / 反序列化陷阱

**证据**：

- plan Section 3.1 JSON 结构 `prompts.{answer_assistant, training_assistant}` 是嵌套对象
- [AiAgentProperties.java:33](../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/config/AiAgentProperties.java#L33) `prompts` 是 `Map<String,String>` 平铺字段
- 若 AgentConfigResolver 反序列化到现有内部类（plan D3 决策），Jackson 会用 cfg 数据**整体覆盖** Java 硬编码默认值
- 主人 2026-07-16 决策"prompts 默认值硬编码"被悄悄打破
- 另一个隐藏坑：`AiAgentProperties.prompts` 含 `quiz_generator`（plan 完全漏列），cfg 一旦写入会把 quiz_generator 默认值也顶掉

**修复**：

**新建独立 DTO `AgentCfgData`** 接收 cfg JSON，Resolver 做"cfg 优先 + null 不覆盖 defaults"合并：

```java
@Data
public class AgentCfgData {
    private Models models;
    private Tools tools;
    private React react;
    private ApiMode apiMode;
    private BailianEndpoint bailian;
    private Map<String,String> prompts;  // prompt key → 文本
    private Integer rateLimitSeconds;
    private Integer sseTimeoutMs;
    // null 字段不覆盖 AiAgentProperties 默认值
}
```

配套已与主人拍板（§6-S-3）：`prompts` 白名单过滤为 `{answer_assistant, training_assistant}`，`quiz_generator` 不纳入控制台。

### P1-2. cfg.ai.bailian.data.model 与 ai_agent.models.defaultModel 双源冲突

**类别**：配置治理 / 单源原则

**证据**：

- [AgentConfigServiceImpl.java:188-200](../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/impl/AgentConfigServiceImpl.java#L188-L200) 已有 `getDefaultModel()` 优先读 `cfg type=ai provider=bailian data.model`，fallback AiAgentProperties
- plan D2 决策"复用 cfg 表"理由是"无现成 model 配置" → **不成立**
- plan Section 3.1 data JSON 又有 `models.defaultModel` → **与现有 data.model 双源冲突**
- 运维改 ai_agent 行不生效（仍读 ai.bailian.model），改 ai.bailian 行不生效（被 ai_agent 行覆盖，取决于优先级）→ 行为不可预测

**修复**（已与主人 grill-me 拍板，见 §6-S-2）：

**合并到 `ai_agent.models.defaultModel`，废弃 `ai.bailian.model`**。具体：
1. migration 脚本读 cfg.ai.bailian.data.model 值 → 写入新 ai_agent_config 表 defaultModel
2. Phase 2 切换后，cfg.ai.bailian 行 model 字段废弃（行仍保留以兼容历史逻辑，但 AgentConfigServiceImpl.getDefaultModel() 不再读它）
3. AgentConfigResolver.resolvedModels().getDefaultModel() 单源 → 写入 ai_agent_config 行

### P1-3. maxOutputTokens=null vs 65536 默认值语义丢失

**类别**：边界语义 / 默认值破坏

**证据**：

- [AiAgentProperties.java:155-158](../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/config/AiAgentProperties.java#L155-L158) 注释："null = 不限制，模型使用自身上限"
- 默认值 65536
- plan Section 3.1 data JSON 写死 `"maxOutputTokens": 65536` 入 cfg
- 前端清空输入框保存 → 写入 65536 → 行为从"不限制"变成"限制到 65536"
- 数字相同但语义丢失（后续默认值若改为 0 或 null，行为会突然变化）

**修复**：

前端空值不入库（v-model 配 `null-value` 转换），后端 Resolver fallback 保留 null 语义：

```java
public Integer resolvedMaxOutputTokens() {
    AgentCfgData.Models m = cfgData.getModels();
    return (m != null && m.getMaxOutputTokens() != null)
        ? m.getMaxOutputTokens()
        : aiAgentProperties.getModels().getMaxOutputTokens();  // 可能是 null
}
```

### P1-4. AgentConfigResolver 自身缓存 vs @Cacheable 缓存 → 双层缓存不一致

**类别**：缓存治理

**证据**：

- [CfgPropServiceImpl.java:110](../../wk-train-center-service/wk-commons/src/main/java/com/wk/traincenter/common/service/impl/CfgPropServiceImpl.java#L110) 有 `@Cacheable(value="sys:config", key="#type+'-'+#provider")`
- 默认 Spring Cache 是进程内（没看到 Redis CacheManager 配置）
- plan D6 决定"暂不引入 Redis Pub/Sub"
- plan §七 风险表"30s TTL 缓存"写在 Resolver 内 → **新增二级缓存 + 缓存不一致问题**
- 用户前端保存 → 30s 内继续读旧值，运营体验差

**修复**：

**Resolver 不加 TTL，直接 `cfgPropService.detail()` 走原 @Cacheable**：

1. `CfgPropService.save()` 已有的 `@CacheEvict allEntries=true` 范围太广（清掉整个 sys:config 缓存，含 ai/voice/vision/bailian_kb 全行）→ 改为精确 `@CacheEvict(value="sys:config", key="#type+'-'+#provider")`（仅清单条）
2. AgentConfigResolver 不再加 TTL 缓存，直接走 cfgPropService.detail()
3. 用户保存 → 立即失效 → 下次读取穿透到 DB → 写回缓存

### P1-5. Plan 工时估算严重偏低（4-5.5d vs 实际 7-8.5d）

**类别**：排期 / 资源估算

**证据**：

- grep `aiAgentProperties.` 在 AgentReActExecutorImpl 内 **9 处引用**（L78/238/243/304/471/482/500/505/512），plan Phase 2.2 描述"所有 aiAgentProperties.getTools/getReact/getApiMode/getBailian"四类枚举**只覆盖 4 处**，其余 5 处未明确
- AgentReActExecutorImpl 1377 行，逐字段替换+编译验证实际需 2-3d
- BailianResponsesCaller 漏列（+1d）
- 缓存治理 P1-4（+0.5d）
- DTO 改造 P1-1（+0.5d）
- migration 脚本 + 数据合并 + 废弃 ai.bailian.model（+0.5d）
- 双 cfgPropService.@CacheEvict 精确化改造（+0.5d）

**修复**（已与主人 grill-me 拍板，见 §6-M-4）：

**工时修订为 7-8.5d**。Phase 拆分：
- Phase 0: Bug 修复（R-1/R-2/R-3）1h
- Phase 1: DDL + migration + CRUD + DTO（2d）
- Phase 2: Resolver + 3 文件切换（2d）
- Phase 3: 前端 v2 UI（1-2d）
- Phase 4: v3 同步（0.5d）
- 联调测试（1d）

---

## 4. Medium (P2 — 落地阶段必须注意)

### P2-1. Phase 1.3 "扩展 AiGatewayConstants 可选" 误导

- AiGatewayConstants 已存在（plan 注释里 L5 引用证实）
- Step 1.3 标"可选"会让人误以为可跳过 → AGENT_CONFIG_TYPE/PROVIDER 散落在 Controller/Resolver 两处
- **整改**：必做 Step 1.3（提常量），删"可选"字样

### P2-2. AiConfig.vue 已存在字典组件与 plan UI 设计冲突

- [AiConfig.vue:21](../../wk-train-center-ui/src/views/admin/sys/config/components/AiConfig.vue#L21) 已用 `<DicListSelect dic-code="bailian_model">` 让用户从字典选模型
- plan Section 3.3 新设计"模型选择(下拉框)"没说是否复用字典
- 若新建自由下拉框 → 字典失效；若复用字典 → plan UI 描述不准
- **整改**：UI 草图必须先 Read 现有 AiConfig.vue 完整内容再设计

### P2-3. Phase 5 引用不存在的方法 `dto.getTools().getThinkingLevel()`

- plan Phase 5："利用 chatStream() 已有的 dto.getTools().getThinkingLevel() 机制"
- grep 全 wk-module-ai **0 命中** `getThinkingLevel`
- **整改**：要么补 Phase 5 实现说明，要么删 Phase 5 章节（避免假数据）

### P2-4. prompts 字段名重名风险

- plan Section 3.1 JSON 结构 `prompts.{answer_assistant, training_assistant}` 嵌套
- AiAgentProperties.prompts 是 Map<String,String> 平铺
- 反序列化若用现有 prompts Map field 接收会冲突
- **整改**：P1-1 已通过 AgentCfgData 独立 DTO 解决

### P2-5. Plan 漏洞密度反映 qoder 看不到 CLAUDE.md 全局决策

- qoder 出计划时不知道主人 2026-07-22 prompts 不入库决策
- 也不知道 2026-07-14 §3.6 决策前查 vault 规则
- **整改建议**：后续 Qoder 出计划前先喂 CLAUDE.md + 最近 7 天 .qoder/repowiki 决策日志（见 §3.7）

---

## 5. 拒绝方案回顾（plan §九 补充）

主人拍板新增 1 条拒绝方案：

| 方案 | 来源 | 拒绝理由 |
|------|------|----------|
| 复用 cfg 表存 ai_agent 行 | 原 plan D2 | ① 与主人 2026-07-22 prompts 决策冲突；② CfgPropService.save() 对非枚举类型强制 disableOtherEnabled 会清零其他行；③ 业务 AI 配置与系统通用配置语义不同 |

---

## 6. 主人 grill-me 拍板汇总（决策锁定）

按 CLAUDE.md §3.3 + using-superpowers grill-me skill，9 项关键决策已与主人逐条拍板：

| # | 问题 | 拍板结果 |
|---|------|---------|
| F-1 | prompts 入库 | ✅ **推翻 2026-07-22 决策，prompts 入 cfg 控制台** |
| F-2 | 配置存储 | ✅ **新建 MySQL 表 `ai_agent_config` + 全套 CRUD**（plan D2 "复用 cfg 表"作废） |
| F-2a | 旧 cfg 行迁移 | ✅ 一次性脚本迁移 + 废弃 ai/voice/vision/bailian_kb 行 |
| F-2b | Controller 位置 | ✅ 扩展 wk-module-ai/AiConfigController.java |
| F-2c | 权限模型 | ✅ Shiro `@RequiresPermissions("ai:agent:*")` |
| F-3 | 切换范围 | ✅ BailianResponsesCaller 一并切 Resolver（plan 漏列） |
| S-2 | model 双源 | ✅ 合并到 `ai_agent.models.defaultModel`，废弃 `ai.bailian.model` |
| S-3 | quiz_generator | ✅ 不纳入，Resolver 白名单过滤为 `{answer_assistant, training_assistant}` |
| M-4 | 工时 | ✅ 修订为 **7-8.5d**（plan 原 4-5.5d 严重偏低） |

### 6.1 拍板触发的架构变更清单

| 维度 | 原 plan | 拍板后 |
|------|---------|--------|
| 配置存储 | 复用 cfg 表 + JSON | **新建 ai_agent_config 表 + 全套 CRUD** |
| Prompts 来源 | cfg 优先 + YML 兜底 | **prompts 入 cfg**（反推 2026-07-22） |
| DTO | 复用 AiAgentProperties 内部类 | **新建独立 AgentCfgData DTO** |
| Controller 范围 | all/save-all 加 agent 字段 | **AiConfigController 扩展**（已采纳） |
| 切换文件 | 2 个文件 | **3 个文件**（+BailianResponsesCaller） |
| 权限模型 | 复用 cfg 行权限 | **新 Shiro `ai:agent:*` 权限点** |
| 工时 | 4-5.5d | **7-8.5d** |

---

## 7. 下一步建议（主人裁断后启动）

按主人"仅交付审核报告，不落盘"指示，**本任务止步于审核报告**。后续 Qoder / 主人重写 plan 时，本 §6 拍板汇总为输入。

待 Phase 0 启动前，建议主人先对齐以下 3 件：

1. **data migration 范围确认**：ai/voice/vision/bailian_kb 四行的 data 字段 schema 是否完全相同？需先 grep `cfg.type IN ('ai','voice','vision','bailian_kb')` 引用点
2. **新表 DDL 字段映射**：ai_agent_config 字段顺序需与 plan Section 3.1 JSON 结构对齐（建议 `models`/`tools`/`react`/`apiMode`/`bailian`/`prompts`/`rateLimitSeconds`/`sseTimeoutMs` 八个 JSON 字段 + 主键）
3. **Phase 0 bug 修复 R-1/R-2/R-3 是否与 Phase 1 并行**：plan 标"可并行"，但实际工作人若为同一人会上下文切换成本 → 建议先串行 Phase 0 再开 Phase 1

---

## 8. 经验归档（self-improving-agent 反馈）

按 CLAUDE.md §3.5 自我进化机制：

**踩坑教训**：Qoder 出的 plan **看不到主人 CLAUDE.md 全局决策**（2026-07-22 prompts 不入库决策就是直接撞，导致 9 处 plan 内容返工）。

**正模式**：审 Qoder plan 前必查主人最近 7 天决策日志（2026-07-14 §3.7 后规则）。本报告因 grill-me 前已 grep `shared-experiences` + 主人拍板摘要，未直接撞雷。

**经验归档路径**：跨栈经验 → `E:\rhProject\Thinkpad\22-entities-实体档案\agent-经验库\shared-experiences.md` §"Qoder plan 审核" 章节（待归档）。