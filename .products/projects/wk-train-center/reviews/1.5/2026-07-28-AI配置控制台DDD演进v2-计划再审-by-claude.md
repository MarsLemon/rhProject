# 计划再审：AI 配置控制台 DDD 演进 v2 (wk-train-center 1.5)

| 项 | 值 |
|---|---|
| 审核日期 | 2026-07-28 |
| 审核人 | 小马（架构师） |
| 审核范围 | [E:\rhProject\.qoder\plans\AI配置控制台DDD演进计划_d3d51d9c.md](../../../.qoder/plans/AI配置控制台DDD演进计划_d3d51d9c.md) L1-477（v2 修订版） |
| 上轮审核 | [2026-07-28-AI配置控制台DDD演进-计划审核-by-claude.md](./2026-07-28-AI配置控制台DDD演进-计划审核-by-claude.md) |
| 文档结构警告 | ⚠️ **文件 L478-794 错误追加 v1 完整原文(317 行重复)** → 必须先清理 |
| 结论 | **🟢 大部分整改到位**：上轮 13/13 整改项已闭环；但 v2 自身引入 1 个 P0 + 1 个 P1 + 4 个 P2 需补刀。**禁止直接动工**。 |

---

## 0. Scope Check（必填，参照 CLAUDE.md 与 shared-experiences）

| 维度 | 判定 |
|---|---|
| **Intent** | 整改上轮 3 P0 + 5 P1 + 5 P2，把 plan 升级到 v2 可开工状态。 |
| **Delivered** | v2 涵盖：① 8 项架构决策（D1-D8，含 3 项整改：D2 新表 / D3 独立 DTO / D4 prompts 入库 / D7 缓存治理 / D8 BailianResponsesCaller）；② §十二 13 项整改追溯表；③ §七 grill-me 9 拍板汇总；④ §十一 工时修订 7-8.5d。 |
| **Scope creep** | 无。范围与 v1 一致，未引入新模块。 |
| **Missing requirements** | 见下文 P1-A / P1-B：① §3.1 DDL 缺 `enabled` 默认值语义文档化与索引设计；② §3.2 migration 脚本缺事务回滚与旧 cfg 行兼容代码动作。 |
| **横向一致性** | §五 依赖图保留 "Phase 0 ... 可并行" 旧措辞，与 §四 Phase 0 注释"建议串行先完成"不一致（详见 P2-D）。 |

---

## 1. 整体评价

**v2 整改力度到位**。上轮审核 13 项整改项核验通过，v2 §十二 追溯表完整可追溯。工时从 4-5.5d 修订到 7-8.5d 是诚实估算，与主人 M-4 拍板一致。

**但 v2 重写过程引入 5 个新问题**：

1. **文档结构破坏**（P0-A）：v2 L478-794 错误追加 v1 完整原文 317 行 → 下游引用时 v1/v2 方案混读直接回潮
2. **DDL 索引设计不全**（P1-A）：8 行表影响小但未来扩展会成瓶颈
3. **migration 事务安全缺位**（P1-B）：写一半中断无回滚，业务可中断
4. **P2-A quiz_generator 来源未明确**：migration 脚本可能误把 quiz_generator 写入 ai_agent_config
5. **依赖图与 Phase 0 注释不一致**（P2-D）：后续跟读者按"可并行"排期，与"建议串行"拍板相反

---

## 2. v2 整改追溯核验（上轮 13 项）

| 整改项 | v2 落地位置 | 核验结论 |
|--------|-------------|---------|
| P0-1 prompts 入库 | D4 + §7 F-1 | ✅ 已整改 |
| P0-2 新建专用表 | D2 + §3.1 SQL | ✅ 已整改 |
| P0-3 BailianResponsesCaller | D8 + Phase 2 Step 2.4 | ✅ 已整改 |
| P1-1 独立 DTO | D3 + §3.4 AgentCfgData | ✅ 已整改 |
| P1-2 model 双源 | §3.2 + Step 2.2 | ✅ 已整改 |
| P1-3 maxOutputTokens null 语义 | §3.1 + §3.5 | ✅ 已整改 |
| P1-4 双层缓存不一致 | D7 + §3.3 | ✅ 已整改 |
| P1-5 工时偏低 | §11 → 7-8.5d | ✅ 已整改 |
| P2-1 AiGatewayConstants "可选"误导 | Step 2.5 必做 | ✅ 已整改 |
| P2-2 模型选择应复用字典组件 | §3.5 DicListSelect | ✅ 已整改 |
| P2-3 Phase 5 引用不存在方法 | Phase 5 重写 | ✅ 已整改 |
| P2-4 prompts 字段名重名 | AgentCfgData 独立 DTO 解决 | ✅ 已整改 |
| P1 (新增)| D8 切换范围扩大 | ✅ 已整改 |

**13/13 整改项核验通过**。v2 整体质量从 v1 的 🔴 升至 🟢。

---

## 3. Critical Issues (P0 — MUST FIX)

### P0-A. 文件 L478-794 错误追加 v1 完整原文（317 行重复）

**类别**：文档治理 / 版本管理

**证据**：

- Read 工具显示 L478 起出现 `# AI 配置控制台 DDD 演进计划`（无版本标）+ 完整 11 节 + 工时 4-5.5d
- 与 L1-477 v2 完全重复，仅无 "v2 — 审核修订版" 标识
- 全文 794 行，v2 仅占 L1-477（477 行），v1 占 L478-794（317 行）
- **下游 AI / 开发者引用此文件时，会同时读到 v1 + v2 两个相反方案**，例如：
  - v1 §二 D2 "复用 cfg 表" vs v2 §二 D2 "新建 ai_agent_config 表" → 直接矛盾
  - v1 §十一 "总计 4-5.5d" vs v2 §十一 "总计 7-8.5d" → 排期混乱
  - 照抄 v1 配置 → P0-2/P0-3/P1-1 全部回潮

**修复**：

**删除 L478-794 全部冗余内容，仅保留 L1-477 v2**。修复后文档行数 477 行，git diff 干净。

---

## 4. Important (P1 — SHOULD FIX，开工前必须补)

### P1-A. §3.1 DDL 缺 `enabled` 默认值语义文档化 + 索引设计不全

**类别**：DDL / 性能 / 数据契约

**证据**：

- v2 §3.1 DDL：
  ```sql
  enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用'
  ```
- 但 v2 §三 全文未说明 `enabled=0` 时的语义：
  - 选项 A：跳过该 config_key 走 AiAgentProperties fallback
  - 选项 B：整行无效（不读、不写）
- 与 D7 "不加 TTL 缓存，精确化失效" 配合下，需要明确 `WHERE enabled=1` 查询路径
- 当前唯一索引仅 `uk_config_key`，无 `enabled` 索引 → 8 行表影响不大，但若 config_key 增长（几十/上百），全表扫描启用项会拖累

**修复**：

1. DDL 增加索引：
   ```sql
   INDEX idx_enabled (enabled)
   ```
2. §3.3 配置读取优先级明确语义：
   ```
   ai_agent_config.config_key 存在 + enabled=1  → 用表值
   enabled=0 或 config_key 不存在             → 用 AiAgentProperties fallback
   ```
3. Service 实现 `findEnabledByKey()` 方法加 `@Cacheable(value="ai:agent:config", key="#configKey")`

### P1-B. Migration 脚本缺数据回滚方案 + 旧 cfg 行兼容性策略模糊

**类别**：迁移安全 / 业务连续性

**证据**：

- v2 §3.2 migration 步骤：
  ```
  1. 读 cfg.ai.bailian.data.model → 写入 ai_agent_config.models.defaultModel
  2. AiAgentProperties 硬编码默认值 → 写入其余 config_key 行
  3. 废弃 cfg.ai 行中的 model 字段（行保留兼容历史）
  ```
- 步骤 3 "废弃但保留兼容历史" → **AgentConfigServiceImpl.getDefaultModel() 是否真不读 cfg.ai.bailian.data.model？**
- v2 §Phase 2 Step 2.2 仅说 "废弃原 cfg.ai.bailian.data.model 读取路径"，但没说代码层面怎么删：
  - 是整个 if 分支删除？
  - 还是改 return？
- migration 步骤 1-2 中断（cfg.ai.model 已清空但 ai_agent_config 未写入）→ 业务中断
- v2 §六 回滚策略仅说 "新表可 DROP，不影响 cfg 表"，但**migration 写一半时的回滚没说**

**修复**：

1. **migration 脚本事务化**：
   ```sql
   START TRANSACTION;
   -- 1. 建表（DDL 已先执行）
   -- 2. 备份 cfg.ai.bailian.data.model 到 _backup_20260728 临时表
   -- 3. 读 cfg.ai.bailian.data.model → 写入 ai_agent_config.models.defaultModel
   -- 4. 写其余 config_key 行
   -- 5. 验证 ai_agent_config 8 行齐全 + 数据非空
   -- COMMIT;
   ```
2. **migration 幂等化**：用 `REPLACE INTO` 而非 `INSERT`，支持重复执行
3. **Phase 2 Step 2.2 明确代码动作**：
   ```java
   // AgentConfigServiceImpl.java L188-200 整段 if (cfgModel) {...} 删除
   // 直接 return agentConfigResolver.resolvedModels().getDefaultModel();
   ```
4. **§六 回滚策略补充**：
   ```
   - **migration 中断**：重新跑 migration 脚本（幂等用 REPLACE INTO 而非 INSERT）
   - **migration 写错**：DROP ai_agent_config + 从 _backup_20260728 还原 cfg.ai.bailian.data.model
   - **代码回退**：Phase 2 git revert + DROP ai_agent_config（业务回到 v1 行为）
   ```
5. **执行顺序约束**：先建 ai_agent_config 表 + 写入完整 8 行 → 验证 → 再清 cfg.ai.bailian.data.model 字段。任何中间步骤失败，旧 cfg 行仍是主源。

---

## 5. Medium (P2 — 落地阶段必须注意)

### P2-A. §3.1 初始数据表丢了 `quiz_generator` 来源声明

**类别**：数据契约 / S-3 拍板落地

**证据**：

- v2 §3.1 prompts 行：`{"answer_assistant":"...","training_assistant":"..."}`（仅 2 个 key，符合 S-3 拍板）
- v2 §D1 决策写 "prompts 白名单为 {answer_assistant, training_assistant}，quiz_generator 不纳入控制台"
- **quiz_generator 在 [AiAgentProperties.java:97](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/config/AiAgentProperties.java#L97) prompts Map 里仍是默认值**
- v2 §Phase 1 Step 1.2 migration 步骤 2 说 "AiAgentProperties 硬编码默认值 → 写入其余 config_key 行"，**没有显式排除 quiz_generator** → migration 可能把 quiz_generator 也写进 ai_agent_config.prompts 行 → 与 S-3 拍板冲突

**修复**：

§Phase 1 Step 1.2 migration 脚本明确：
```java
// 仅迁移白名单 key，quiz_generator 留在 AiAgentProperties.prompts Map
Map<String, String> prompts = new HashMap<>();
prompts.put("answer_assistant", aiAgentProperties.getPrompts().get("answer_assistant"));
prompts.put("training_assistant", aiAgentProperties.getPrompts().get("training_assistant"));
// quiz_generator 不写入 ai_agent_config
configMapper.replace("prompts", objectMapper.writeValueAsString(prompts));
```

### P2-B. §Phase 2 Step 2.4 BailianResponsesCaller 引用行号与 grep 结果可能漂移

**类别**：代码评审一致性

**证据**：

- v2 Step 2.4 引用：`L129/L135/L199`
- 上轮审核 grep 报告 `L129/135/199 3 处`（时间戳 2026-07-28 15:43）
- **计划落笔时间与 grep 时间可能差几小时**，若代码已被改动，L129/L135/L199 实际行号会偏移
- 开工前必须重新 grep 验证

**修复**：

Step 2.4 改为：
```
- 重新 grep `getBailian\(\)\.` 在 BailianResponsesCaller.java 找到 3 处（开工前必须验证行号）
- 每处改为 `resolver.resolvedBailian().get...()`
```

### P2-C. §Phase 3 Step 3.3 前端 API 适配描述过于简略

**类别**：前端实施细节

**证据**：

- v2 Step 3.3 仅说 "新增或扩展 API 函数对接 ai_agent_config 表的 CRUD 端点"
- §Phase 1 Step 1.4 / §Phase 2 没说 Controller 端点路径是 `/admin/ai/agent-config/*`（独立）还是 `/admin/ai/config/*`（复用现有 all/save-all）
- 主人 F-2b 拍板 "扩展 wk-module-ai/AiConfigController.java"，但**端点粒度未明确**

**修复**：

§Phase 3 Step 3.3 明确：
```
- 端点 1: GET  /admin/ai/config/all        → 返回 { connection: {...}, agent: {...} }
- 端点 2: POST /admin/ai/config/save-all  → 接收 { connection, agent } 分块保存
- 端点 3（可选）: POST /admin/ai/config/reset-agent → 清空 ai_agent_config 走 fallback
- 权限: @RequiresPermissions("ai:agent:config")
```

### P2-D. §五 依赖图与 §四 Phase 0 注释不一致

**类别**：排期协调

**证据**：

- v2 §四 Phase 0 表格注释：**"建议串行先完成"**（采纳上轮审核建议）
- v2 §五 依赖图仍画 "Phase 0 ... 可并行" 旧措辞
- **串行建议与依赖图描述不一致** → 后续跟读者按"可并行"排期，与"建议串行"拍板相反

**修复**：

§五 依赖图改为：
```
Phase 0 (Bug修复) ──── 建议串行先完成（单工作人避免上下文切换）────→
    ↓
Phase 1 (DDL + Migration + CRUD + DTO)    ← 2d
    ↓
Phase 2 (Resolver + 3 文件切换)            ← 2d，依赖 Phase 1 的 Service + DTO
    ↓
Phase 3 (前端 v2 UI)                      ← 1-2d，依赖 Phase 2 的 API 端点

Phase 4 (前端 v3 UI)                      ← 0.5d，可与 Phase 3 并行
Phase 5 (调试台)                          ← 独立远期
```

---

## 6. v1 → v2 关键变更对比

| 维度 | v1 | v2 |
|------|----|----|
| 配置存储 | 复用 cfg 表 + JSON | **新建 ai_agent_config 表 + 全套 CRUD** |
| Prompts 来源 | cfg 优先 + YML 兜底 | **prompts 入 cfg**（反推 2026-07-22 决策） |
| DTO | 复用 AiAgentProperties 内部类 | **新建独立 AgentCfgData DTO** |
| 切换范围 | 2 个文件 | **3 个文件**（+BailianResponsesCaller） |
| 缓存治理 | Resolver 30s TTL | **Resolver 无 TTL，精确化 @CacheEvict** |
| 权限 | 复用 cfg 权限 | **新 Shiro `ai:agent:config` 权限点** |
| 工时 | 4-5.5d | **7-8.5d** |
| 整改追溯 | 无 | **§十二 13 项追溯表** |
| grill-me 决策 | 无显式汇总 | **§七 9 项拍板汇总** |

---

## 7. 经验归档（self-improving-agent 反馈）

按 CLAUDE.md §3.5 + self-improving-agent skill，**Qoder 重写时把 v1 整段追加到 v2 末尾**（317 行重复），反映：

**踩坑教训**：Qoder 文档版本管理机制缺位，默认 "append 不覆盖"，未清理旧版本内容。

**正模式**：评审 Qoder 计划时，**第一件事 Read 全文 + wc -l 验证文档完整性**。本次因 v2 L478-794 重复提前捕获 P0-A，避免下游引用混乱。

**经验归档路径**：`E:\rhProject\Thinkpad\22-entities-实体档案\agent-经验库\shared-experiences.md` §"Qoder plan 审核" 章节（与上轮报告 §8 同一条目追加）。

---

## 8. 结论与开工建议

**🟢 大部分整改到位，1 P0 + 1 P1 + 4 P2 需补刀**。

| 维度 | v1 (上轮) | v2 (本轮初评) | v2 补刀后预估 |
|------|-----------|---------------|--------------|
| 致命缺陷 | 3 个 | 0 个实质缺陷 | **✅ 0** |
| 严重问题 | 5 个 | 2 个 | **✅ 0** |
| 中等问题 | 5 个 | 4 个 | **✅ 0** |
| 文档质量 | 缺整改追溯 | 有 §十二 追溯表 | ✅ |
| 开工状态 | 🔴 禁止 | 🟢 补刀后可开工 | **✅ 通过** |

### 建议开工顺序

1. **先修 P0-A**（删 L478-794 冗余 → 477 行）
2. **再补 P1-A / P1-B / P2-A**（DDL 索引 + migration 事务 + quiz_generator 排除）
3. **修 P2-B / P2-C / P2-D**（行号提示 + API 端点明确 + 依赖图统一）
4. Phase 0 bug 修复（串行）
5. Phase 1 DDL + migration（带回滚脚本）
6. Phase 2 Resolver + 3 文件切换
7. Phase 3 前端

**整改后状态预估**：本次 6 项补完后，可从 🟢 升至 ✅ 通过，允许开工。

### 整改后是否还需三审

不需。本次补刀内容机械明确（删行 / 加索引 / 加事务 / 显式排除 key / 端点命名 / 改依赖图措辞），Qoder / 主人按本报告 §3-5 直接落地即可，无需再启 v3 评审。