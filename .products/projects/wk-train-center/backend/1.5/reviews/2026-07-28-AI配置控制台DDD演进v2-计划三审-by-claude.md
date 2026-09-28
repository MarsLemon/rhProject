# 计划三审：AI 配置控制台 DDD 演进 v2 (wk-train-center 1.5)

| 项 | 值 |
|---|---|
| 审核日期 | 2026-07-28 |
| 审核人 | 小马（架构师） |
| 审核范围 | [E:\rhProject\.qoder\plans\AI配置控制台DDD演进计划_d3d51d9c.md](../../../.qoder/plans/AI配置控制台DDD演进计划_d3d51d9c.md)（509 行，v2 第二次主人修订版） |
| 上轮再审 | [2026-07-28-AI配置控制台DDD演进v2-计划再审-by-claude.md](./2026-07-28-AI配置控制台DDD演进v2-计划再审-by-claude.md) |
| 上轮再审问题 | 1 P0 + 1 P1 + 4 P2（共 6 项） |
| 本轮整改 | **7/7 已落地**（v1 冗余已清） + 主人自主修订：§五/§十一 去掉 v3 前端同步、工时 7-8.5d → 6.5-8d、§十三 新增 v2 再审追溯表 7 项 |
| 结论 | **🟡 主人主动修订到位,但遗留 1 项事实错误 + 3 项新发现**：上轮 7 项 ✅，本轮遗留 ERR-1 + NEW-1/2/3 共 4 处需主人裁断。**禁止直接动工**。 |

---

## 0. Scope Check（必填）

| 维度 | 判定 |
|---|---|
| **Intent** | v2 计划整改 13 项上轮审核问题 + 7 项上轮再审问题；v3 提交到主人当前 IDE 编辑后的最新版本（509 行）。 |
| **Delivered** | v2 当前涵盖：① 8 项架构决策 D1-D8；② §3 5 个子节（DDL + Migration + 优先级 + DTO + UI）；③ §四 Phase 0-3 + Phase 4 调试台远期；④ §五 依赖图（v3 暂不做）；⑤ §十一 工时 6.5-8d（v3 暂不做，主人自主减 0.5d）；⑥ §十二 上轮 13 项追溯；⑦ §十三 v2 再审 7 项追溯。 |
| **Scope creep** | 主人自主决定 v3 暂不做（§五/§十一/§九 第 9 条），聚焦 train-center-ui + train-center-service 单栈。 |
| **Missing requirements** | 见 ERR-1：Phase 0 表格 R-1/R-2/R-3 bug 全已闭环（2026-07-23 主人审查），plan 内容与现状严重脱节。 |
| **横向一致性** | §十一 总工时 6.5-8d 含 Phase 0 (1h)，但 Phase 0 无活可干 → 前后矛盾（详见 NEW-1）。 |

---

## 1. 上轮再审 6 项整改核验（上轮 → 本轮落地）

| 编号 | 上轮描述 | v2 当前整改位置 | 核验 |
|------|----------|-----------------|------|
| **P0-A** | L478-794 错误追加 v1 原文 317 行 | §十三 L504 + 全文缩到 509 行（v1 冗余已删） | ✅ **已整改** |
| **P1-A** | DDL 缺 enabled 语义 + 索引 | §3.1 L87 `enabled=0 时走 fallback` 语义注释 + L91 `INDEX idx_enabled` | ✅ **已整改** |
| **P1-B** | migration 缺事务回滚 | §3.2 L115-126 `START TRANSACTION` + `REPLACE INTO` 幂等 + L128 关键约束 + §六 L389-390 补充回滚 | ✅ **已整改** |
| **P2-A** | quiz_generator migration 未显式排除 | §3.2 L121（prompts 仅迁移白名单 key: answer_assistant, training_assistant；quiz_generator 不写入） + Step 1.2 L221 | ✅ **已整改** |
| **P2-B** | BailianResponsesCaller 行号可能漂移 | §Step 2.4 L305 `开工前重新 grep` | ✅ **已整改** |
| **P2-C** | 前端 API 端点路径未明确 | §Step 3.3 L350-354 明确 3 个端点 + 权限 | ✅ **已整改** |
| **P2-D** | 依赖图与 Phase 0 注释不一致 | §五 L373 `Phase 0 ... 建议串行先完成（单工作人避免上下文切换）` | ✅ **已整改** |

**7/7 上轮再审问题全部整改到位**。

---

## 2. 主人自主修订核验（§5/§11/§9/§13）

| 主人自主修订 | 位置 | 核验 |
|--------------|------|------|
| v3 前端同步暂不做 | §D6 L59 `v3 前端暂不做，专注 train-center-ui + train-center-service` | ✅ 主人决策明确 |
| §九 增加拒绝方案第 9 条 | L441 `v3 前端同步做配置页 → 主人裁断：v3 暂不做` | ✅ 已拒绝方案记录 |
| §四 Phase 4（原 v3 同步）已删除 | §Phase 4 改为"调试台实时切换"（即原 Phase 5 上位） | ✅ 结构清晰 |
| §五 依赖图调整 | L373-381 重画：Phase 4 调试台 → 独立远期（v3 前端同步暂不做） | ✅ 与 §D6 一致 |
| §十一 工时 | L466-477 重命名为"v3 修订，去除 v3 前端同步"，总计 6.5-8d | ✅ 工时与主人决策一致 |
| §M-4 拍板备注 | §七 L412 `6.5-8d（v3 暂不做，原 7-8.5d 减 0.5d）` | ✅ 与 §十一 一致 |
| §十三 v2 再审追溯 | L500-509 新增 7 项追溯表 | ✅ 整改记录完整 |

**主人自主修订 7/7 全部合理且到位**。

---

## 3. Critical Issues (P0 — MUST FIX)

### ERR-1. Phase 0 表格 R-1/R-2/R-3 Bug 全已闭环（plan 内容过期）

**类别**：事实陈述 / 文档与现状不一致

**证据**：

| Bug | plan v2 L203-207 | 真实状态（grep 验证） |
|-----|------------------|----------------------|
| R-1 BailianChatCaller errorCode 丢失 | 0.5h 待修 | ✅ **已修** [BailianChatCaller.java:864](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/react/BailianChatCaller.java#L864) 三参版 buildErrorChunk（注释：`★ R-1 修(2026-07-23 第二轮审查)`） |
| R-2 BailianHttpException.java untracked | 5min 待修 | ✅ **已修** `git ls-files` tracked + commit [`290a5d4 fix(ai-react)`](../../../wk-train-center-service) |
| R-3 previousResponseId 链路 bug | 10min 待修 | ✅ **已修** [AgentReActExecutorImpl.java:589-595](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/react/AgentReActExecutorImpl.java#L589-L595) 守卫条件 `!contentEmittedR`（注释：`★ R-3 修(2026-07-23 第二轮审查)`） |

**修复时间**：均 2026-07-23 主人第二轮审查时闭环，距今 5 天。

**后果**：

1. **Phase 0 实际无活可干** — 主人按 plan 跑 Phase 0 会发现 3 个 bug 都已修，白费 1h 排查
2. **§十一 工时估算失去基础** — 6.5-8d 含 Phase 0 (1h)，但 1h 是基于"R-1/R-2/R-3 待修"的错误假设（详见 NEW-1）
3. **§五 依赖图 Phase 0 节点失去意义** — 节点显示"建议串行先完成"，但无活可串行

**修复建议**（主人裁断方向）：

| 选项 | 行动 | 影响 |
|------|------|------|
| **A: 删 Phase 0 整节** ✨推荐 | 删除 L199-208 整段 + §五 L373 Phase 0 节点 + §十一 L470 表格行 | 总工时从 6.5-8d 升为 **7-8.5d**（实际项目更准）|
| B: Phase 0 改回归测试 | 把"R-1/R-2/R-3 修复"改为"R-1/R-2/R-3 回归测试用例"（3 个 JUnit） | 总工时不变，但语义从"修 bug"变为"写测试用例"，需新增 ~10 个 JUnit/TestNG 用例覆盖 |
| C: 主人有新的 P0 bug 想加 | 主人明示是哪个 bug | 主人驱动 |

**必 grill-me**：按主人选项执行。

---

## 4. Important (P1 — SHOULD FIX，开工前必须补)

### NEW-1. §十一 工时 6.5-8d vs §五 依赖图 Phase 0 1h 不一致

**类别**：文档一致性

**证据**：

- §五 L373 依赖图：`Phase 0 (Bug修复) ──── 建议串行先完成 ────→`（节点仍存在）
- §十一 L470 Phase 0 工时：`1h`
- §十一 L475 总计：`6.5-8d`
- §七 M-4 拍板备注 L412：`6.5-8d（v3 暂不做，原 7-8.5d 减 0.5d）`
- §十三 L504 v2 再审追溯：`本表已二次修订未标注`

**矛盾链**：

- §十一 总工时 6.5-8d = Phase 0（1h）+ Phase 1（2d）+ Phase 2（2d）+ Phase 3（1-2d）+ 联调（1d）= **6.5-8d** ✓（算式正确）
- 但 Phase 0 的 1h 工时是基于"R-1/R-2/R-3 待修"的错误假设
- 若选 A 选项删 Phase 0 → 总工时 = Phase 1（2d）+ Phase 2（2d）+ Phase 3（1-2d）+ 联调（1d）= **6-7.5d**

**修复**：与 ERR-1 合并处理。选 A 后 §十一 总工时自然调整为 6-7.5d。

### NEW-2. §Phase 1 Step 1.3 `resources/mapper` 路径未限定模块

**类别**：文件路径歧义 / 编译失败风险

**证据**：

- v2 §Phase 1 Step 1.3 L231：`resources/mapper/AiAgentConfigMapper.xml`
- wk-module-ai 实际 mapper xml 应在 `wk-module-ai/src/main/resources/mapper/`（各模块独立资源）
- 主人 2026-07-15 反馈 SQL 治理规范（`reference-sql-governance`）要求严格路径命名

**修复**：

Step 1.3 改为：

```
- `wk-module-ai/src/main/resources/mapper/AiAgentConfigMapper.xml`
```

### NEW-3. §Phase 2 Step 2.2/2.3 引用行号未同步改为"开工前重新 grep"

**类别**：代码评审一致性（与上轮 P2-B 同源）

**证据**：

- Step 2.2 L288：`原 L188-200 的 if (cfgModel) {...} 整段删除`
- Step 2.3 L296：`grep 所有 aiAgentProperties. 引用（9 处：L78/238/243/304/471/482/500/505/512）`
- Step 2.4 L305 已自我修复：`开工前重新 grep` ✅
- 但 Step 2.2/2.3 仍写死行号，**Plan 落笔时这些行号可能已漂移**

**修复**：

Step 2.2 改为：

```
- **开工前重新 grep** `cfg.ai.bailian` 在 AgentConfigServiceImpl.java 找到 if 分支行号，删除整段
```

Step 2.3 改为：

```
- **开工前重新 grep** `aiAgentProperties\.` 在 AgentReActExecutorImpl.java 找到所有引用处（约 9 处），逐个替换为 Resolver 调用
```

---

## 5. Medium (P2 — 落地阶段必须注意)

无新增 P2。

---

## 6. v1 → v2 → v2-二次 关键变更对比

| 维度 | v1 | v2（首次）| v2（主人二次修订）|
|------|----|-----------|---------------------|
| 文档行数 | 794 行（含 v1 冗余）| 794 行 | **509 行** ✅ |
| 配置存储 | 复用 cfg 表 + JSON | 新建 ai_agent_config 表 + 全套 CRUD | 同 v2 |
| Prompts 来源 | cfg 优先 + YML 兜底 | prompts 入 cfg | 同 v2 |
| DTO | 复用 AiAgentProperties 内部类 | 新建独立 AgentCfgData DTO | 同 v2 |
| 切换范围 | 2 个文件 | 3 个文件（+BailianResponsesCaller）| 同 v2 |
| 缓存治理 | Resolver 30s TTL | Resolver 无 TTL，精确化 @CacheEvict | 同 v2 |
| 权限 | 复用 cfg 权限 | Shiro `ai:agent:config` | 同 v2 |
| 工时 | 4-5.5d | 7-8.5d | **6.5-8d**（v3 暂不做）|
| v3 前端同步 | 0.5d | 0.5d | **已删除**（主人决策）|
| DDL 索引 | 无 | 无 | **§3.1 增加 idx_enabled** ✅ |
| migration 事务 | 无 | 无 | **§3.2 事务化 + 幂等** ✅ |
| quiz_generator 排除 | 未显式 | 未显式 | **§3.2 L121 + Step 1.2 L221 显式排除** ✅ |
| Phase 0 Bug | 列 R-1/R-2/R-3 待修 | 列 R-1/R-2/R-3 待修 | **仍列待修** 🔴（ERR-1）|

---

## 7. 经验归档（self-improving-agent 反馈）

按 CLAUDE.md §3.5 + self-improving-agent skill，**评审报告也会动态变化**：

**踩坑教训**：本次发现主人 IDE 编辑 plan 后会触发我的第三轮审核，但**主人 IDE 编辑 ≠ 我已知** → 必须 `wc -l` + `stat` 验证文件状态变化（本次 794→509 行 + Modify 时间 15:54→16:21 验证有效）。

**正模式**：

- v2 主人二次修订 6/7 + 自主决策 7/7 全部到位 → 主人决策质量高
- Qoder 写 plan + 主人自主修订 + 我三审 = **人机协作闭环** ✅
- 但 Qoder 出 plan 时**仍缺 CLAUDE.md 全局决策感知**（R-1/R-2/R-3 早已闭环但 plan 仍列待修）→ 与上轮报告 §8 同源问题

**经验归档路径**：`E:\rhProject\Thinkpad\22-entities-实体档案\agent-经验库\shared-experiences.md` §"评审报告自审" + §"Qoder plan 审核" 章节（与前两轮报告同一条目持续追加）。

---

## 8. 结论与开工建议

**🟢 上轮 7 项整改全到位 + 主人自主修订到位 + 遗留 ERR-1 + NEW-1/2/3 共 4 处**

| 维度 | v1（上轮）| v2 首次（上轮再审）| v2 二次（本轮）|
|------|-----------|---------------------|----------------|
| 致命缺陷 | 3 个 | 0 个实质缺陷 + 1 个文档重复 P0-A | **0 个 + 1 个事实错误 ERR-1**（Phase 0 表格过期）|
| 严重问题 | 5 个 | 2 个 | **3 个**（NEW-1/2/3）|
| 中等问题 | 5 个 | 4 个 | 0 个 |
| 文档质量 | 缺整改追溯 | 有 §十二 追溯表 | 有 §十二 + §十三 双追溯表 ✅ |
| 开工状态 | 🔴 禁止 | 🟢 补刀后可开工 | **🟡 补刀 4 处后开工** |

### 必 grill-me（4 问）

| # | 问题 | 选项 |
|---|------|------|
| Q1 | ERR-1 Phase 0 表格 | A 删整节 / B 改回归测试 / C 加新 bug |
| Q2 | NEW-1 §十一 总工时 | 选 A 则总工时调为 6-7.5d / 选 B/C 则保持 6.5-8d |
| Q3 | NEW-2 resources/mapper 路径 | 改为 `wk-module-ai/src/main/resources/mapper/` / 主人有其他约定 |
| Q4 | NEW-3 Step 2.2/2.3 行号 | 改为"开工前重新 grep" / 主人坚持写死行号 |

### 整改后状态预估

本次 4 项补完后，可从 🟢 升至 ✅ 通过，允许开工。

### 整改后是否还需四审

不需。本次补刀内容机械明确（删行 / 改路径 / 改措辞），按本报告 §3-4 直接 Edit plan 文件即可，无需再启 v4 评审。

---

## 附录：本轮审核过程透明性

| 时间 | 事件 |
|------|------|
| 15:43 | 第一轮审核报告落盘（v1 → 主人拍板 9 项决策）|
| 15:54 | Qoder 写 v2 plan（794 行，含 v1 冗余）|
| 15:58 | v2 评审报告落盘（6 项整改）|
| 16:21 | 主人 IDE 编辑 plan（794 → 509 行）+ 上轮 7 项整改 + 自主修订 7 项 |
| 16:25 | 本报告（v3 第三轮审核）：7/7 整改 + 7/7 自主修订 + 4 项遗留 |