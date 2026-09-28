# 计划四审：Qoder 最终版 vs Claude v4 草稿 (wk-train-center 1.5)

| 项 | 值 |
|---|---|
| 审核日期 | 2026-07-28 |
| 审核人 | 小马（架构师） |
| 审核范围 | [E:\rhProject\.qoder\plans\AI配置控制台DDD演进计划_d3d51d9c.md](../../../.qoder/plans/AI配置控制台DDD演进计划_d3d51d9c.md)（424 行，Qoder 最终版） |
| 上轮三审 | [2026-07-28-AI配置控制台DDD演进v2-计划三审-by-claude.md](./2026-07-28-AI配置控制台DDD演进v2-计划三审-by-claude.md) |
| 对比基准 | [design/1.5/2026-07-28-AI智能体配置控制台DDD演进计划v4-by-claude.md](../design/1.5/2026-07-28-AI智能体配置控制台DDD演进计划v4-by-claude.md)（Claude v4 草稿，1164 行） |
| 结论 | **🟡 Qoder 已恢复主人 4 决策 + 工时调为 13.5d，但遗留 2 处自相矛盾 + 1 处与主人原意冲突 + 5 处建议补充** |

---

## 0. Scope Check

| 维度 | 判定 |
|------|------|
| **Intent** | Qoder 基于 Claude v4 草稿（含主人 13 项 grill-me 拍板）出最终可施工版计划。 |
| **Delivered** | Qoder 最终版涵盖：① D1-D10 架构决策（10 项）；② 双表 DDL + 8 个 config_key 配置 JSON；③ AgentInvoker SDK 接口与 KB 过滤；④ API 设计（7 管理 + 2 只读）；⑤ Phase 1-4 实施步骤（含工时汇总 13.5d）；⑥ 风险表 + 验收清单 + 决策追溯。 |
| **Scope creep** | Qoder 自主新增 God Object 拆分（超出主人 D5 原意"不拆"），需主人明示是否同意。 |
| **Missing requirements** | 详见 §2 自相矛盾 + §3 主人原意冲突 + §4 5 处建议补充。 |
| **横向一致性** | §二 D10 与 §十二 D10 决策追溯自相矛盾（同一文档说"拆"又说"不拆"）。 |

---

## 1. Qoder 改动总览（4 处对齐 v4 + 1 处超出主人原意）

| # | 改动 | 落地位置 | 评价 |
|---|------|---------|------|
| 1 | §1.3 删除"Diff/Markdown/Slider nice-to-have"3 行 | L22-26 | ✅ 接受 |
| 2 | §D10 决策反转 → 改为"拆分 God Object" | L63-68 | ⚠️ 超出主人 D5 原意 |
| 3 | §Phase 2 增"拆分 AgentReActExecutorImpl"Step 2.2（1.5d） | L240-245 | ⚠️ 配套上条 |
| 4 | §Phase 3 拆 7 个 Step（含 Slider/Markdown/Diff/调试面板） | L253-273 | ✅ 主人 4 决策全恢复 |
| 5 | 工时 10d → **13.5d** | L300 | ✅ 与 v4 接近（v4 是 13-14d）|

**Qoder 架构 100% 基于 v4 草稿**，主人 4 个明示决策（Diff/Markdown/Slider/调试面板）已恢复，工时与 v4 接近对齐。

---

## 2. Critical Issues（P0 — MUST FIX）

### ERR-1. §二 D10 vs §十二决策追溯 D10 自相矛盾 🔴

**类别**：文档内部一致性

**证据**：

- §二 D10（L63-68）写：
  > "趁 Phase 2 修改 AgentReActExecutorImpl 之际，一并拆分：提取 ChunkBuilder / StageEmitter / FileSummaryService，主循环只做编排，目标从 1377 行降到 ~500 行"
- §十二决策追溯（L424）写：
  > `| D10 | 不拆分 God Object | 独立关注点 |`

**后果**：同一份文档 §二与 §十二对 D10 决策完全相反，第三方审核会立即质疑作者逻辑混乱。

**修复**：

主人需先裁定 D10 取向（拆/不拆），再二选一改齐：

| 选项 | §二 D10 | §十二 D10 |
|------|---------|-----------|
| **A 拆**（Qoder §二 现状）| 保留 | 改为：`D10 | 拆分 God Object | 主人 Phase 2 同意拆分（ChunkBuilder/StageEmitter/FileSummaryService）` |
| **B 不拆**（Qoder §十二 现状）| 改为"不拆" | 保留 |

### ERR-2. §D5 弱化主人"中断旧流"原意 🔴

**类别**：与主人原意冲突

**证据**：

- 主人 D5 原话（grill-me 拍板）："a"（A 方案 = conversationId 隔离 + 中断旧流）
- Qoder §D5 L49 措辞："调试面板生成 UUID，临时参数改动用新 conversationId 发起请求，旧流标记 cancelled"

**后果**：主人原意是**中断旧流**（前端停止渲染旧响应），Qoder 改成"标记 cancelled"（后端置标志位，但前端可能还在渲染旧数据）。两者实际效果差很远。

**修复**：

§D5 改为：

```
### D5: 调试面板 conversationId 隔离 + 中断旧流
调试面板生成 UUID，临时参数改动 → 用新 conversationId 发起新请求 → 旧 conversationId 流前端停止渲染（中断）。

实现要点：
- 后端 SSE 响应每帧带 `conversationId` 字段
- 前端 EventSource 收到 cancelled 事件后，立即停止写入对话框
```

---

## 3. Important（P1 — SHOULD FIX，开工前必须补）

### P1-A. 主人 D5 原意与 Qoder §D10 超范围决策冲突 🟠

**类别**：决策范围越界

**证据**：

- 主人 D5 原话（Claude v4 §十一 决策追溯 #13）："本次不拆分 God Object"
- Claude v4 §二 D10 写："本次不拆分 God Object。AgentReActExecutorImpl（73.9KB/1377行）拆分是独立关注点，混入配置控制台会放大风险。本次仅改其配置读取方式"
- Qoder §D10 L63-68 反转：改为"拆分 God Object"

**后果**：Qoder 自主变更主人决策方向，引入额外 1.5d 工作量（Phase 2 Step 2.2），但主人未明示同意。

**修复**：

主人裁定：

| 选项 | 影响 |
|------|------|
| A 同意 Qoder 拆分 | 工时 13.5d 不变；Phase 2 Step 2.2 执行 ChunkBuilder/StageEmitter/FileSummaryService 拆分 |
| B 回退到"不拆" | 删除 Phase 2 Step 2.2；Phase 2 工时从 5d → 3.5d；总工时 13.5d → 12d |
| C 拆 + 推迟到 Phase 5 远期 | Qoder §九 远期演进加一条"God Object 拆分"；本期 Phase 2 只做配置读取切换 |

---

## 4. Medium（P2 — 落地阶段必须注意）

### P2-A. §Phase 4 缺 AgentInvoker 业务方接入 demo 🟠

**类别**：验收完整性

**证据**：

- Claude v4 §十.1 验收清单明确："AgentInvoker SDK 业务方 demo 通过"
- Qoder §十一验收清单仅 10 条，无业务方接入 demo

**修复**：

§Phase 4 联调测试末尾增加：

```markdown
- **AgentInvoker 业务方接入 demo**：
  - 写 1 个 demo Controller（如 `BusinessAskController`）演示业务方代码不接触百炼 SDK 即可调 AI
  - 验证业务方代码 grep `dashscope` / `BailianResponsesCaller` 0 命中
  - 验证业务方调管理端 → 403（Shiro 拦截）
```

### P2-B. §Phase 4 缺 conversationId 隔离单元测试 🟠

**类别**：核心机制可测性

**证据**：

- conversationId 隔离 + 中断旧流是主人 D5 核心需求
- Qoder §十一验收清单无对应测试

**修复**：

§Phase 4 加测试用例：

```markdown
- **conversationId 隔离测试**：
  - 模拟同一会话连续 3 次参数变更（temperature 0.5 → 0.7 → 0.9）
  - 验证：旧 conversationId 流被中断（前端 EventSource 收到 cancelled 事件立即停止写入）
  - 验证：新流独立渲染，不与旧流数据混淆
- **SSE 流式响应测试**：
  - 用 MockWebServer 模拟百炼流式响应
  - 验证前端 EventSource 逐字渲染（100ms 内首字、200ms 内后续字）
```

### P2-C. §六风险表缺缓存 key 命名规范示例 🟠

**类别**：风险可执行性

**证据**：

- Qoder §八风险表 L337 写："多 Agent 缓存 key 未按 agent 区分 | 🔴 高 | `@Cacheable` key 必含 agentId"
- 仅给出方向，无具体命名规范示例

**修复**：

§八风险表"多 Agent 缓存 key"行展开：

```markdown
| 多 Agent 缓存 key 未按 agent 区分 | 🔴 高 | `@Cacheable(value="ai:agent:config", key="#agentId + ':' + #configKey")` — 避免 agent A 缓存了 agent B 的配置；同样 `@CacheEvict` 也必须按 `agentId` 精确失效 |
```

### P2-D. §三 DDL `short_desc` 字段缺长度约束 🟡

**类别**：DDL 完整性

**证据**：

- Qoder §3.1 DDL L81：`short_desc VARCHAR(64) COMMENT '简述'`
- 主人 D9 原话"加一下这个智能体的标签或者说简述"+ §四 v4 注释"64 字"
- 主人希望简述一目了然，但 DDL 无显示长度校验

**修复**：

§3.1 DDL `short_desc` 字段加 CHECK 约束（MySQL 8.0.16+ 支持）或前端表单 maxlength=64 校验。Qoder 已有前端 maxlength 校验场景，DDL 层加 `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci` 已有，建议前端 maxlength=64 + 后端 `@Size(max=64)` Bean Validation 注解。

### P2-E. §三 DDL 缺 `idx_tags` 索引 🟡

**类别**：DDL 性能

**证据**：

- Claude v4 §三.1 DDL 有 `INDEX idx_tags (tags)`（主人标签筛选场景）
- Qoder §3.1 DDL 仅 `idx_enabled` + `idx_archived`，无 `idx_tags`

**修复**：

§3.1 DDL `ai_agent` 表加：

```sql
INDEX idx_tags (tags),
```

标签筛选（生产/实验等）走索引，纯前端过滤时 SQL 仍可走索引避免全表扫描。

---

## 5. Qoder vs v4 全维度对比

| 维度 | Claude v4（1164 行）| Qoder 最终版（424 行）| 差异 |
|------|---------------------|----------------------|------|
| 总行数 | 1164 | 424 | v4 是 2.8 倍详细 |
| DDL 字段 | 11 + 索引 + 注释 | 11 + 索引 | v4 注释更详细 |
| AgentInvoker SDK | 有（详细 30 行流程）| 有（接口骨架）| v4 更详细 |
| API 端点 | 10 个（7+3）| 9 个（7+2）| v4 多 1 个 schema |
| KB 过滤逻辑 | 有（L1/L2 分层）| 有（基础版）| v4 更详细 |
| Markdown 双 Tab | ✅ A 方案（marked.js）| ✅ 恢复 | 已恢复 |
| Slider UI 重构 | ✅ 10 个 slider | ✅ 恢复 | 已恢复 |
| Diff 弹窗 | ✅ git-like 表格 | ✅ 恢复 | 已恢复 |
| Frontend 调试面板 | ✅ SSE 流式 | ✅ 恢复 | 已恢复 |
| God Object 拆分 | ❌ D5 不拆 | ✅ Qoder 自主拆 | ⚠️ Qoder 越界 |
| 业务方接入 demo | ✅ 验收清单 | ❌ 缺 | Qoder 缺 |
| conversationId 测试 | ✅ 验收清单 | ❌ 缺 | Qoder 缺 |
| 缓存 key 命名示例 | 风险表有 | 风险表无 | Qoder 缺 |
| `idx_tags` 索引 | ✅ 有 | ❌ 缺 | Qoder 缺 |
| 工时估算 | 13-14d | 13.5d | ✅ 一致 |
| 风险表 | 11 项 | 6 项 | v4 更详细 |
| 决策追溯 | 13 项 | 10 项 | v4 更完整 |

**核心架构 100% 基于 v4 落地**，Qoder 消化能力 OK。但 5 处 v4 细节 Qoder 落地缺失。

---

## 6. 必 grill-me 主人（3 问最终裁定）

| # | 问题 | 选项 |
|---|------|------|
| **Q1** | §十二 D10 矛盾如何修 | A §二"拆" + §十二改"拆" / B §二改"不拆" + §十二"不拆" |
| **Q2** | God Object 拆分决策 | A 同意 Qoder 拆（Phase 2 Step 2.2 1.5d） / B 回退不拆（Phase 2 5d→3.5d） / C 拆 + 推迟到 Phase 5 远期 |
| **Q3** | Qoder 5 处补充是否采纳 | A 全采纳（修 5 处） / B 只采纳 ERR-1/2 + P1-A（必改 3 处） / C 只修 ERR-1/2（自相矛盾 2 处） |

主人裁定后：
- 若同意 Qoder + Qoder 自修 5 处 → Qoder 出 v3（最终终版）
- 若大改 → Claude 出 v5 草稿重写

---

## 7. 经验归档（self-improving-agent 反馈）

按 CLAUDE.md §3.5：

**踩坑教训**：
- Qoder 基于 v4 出计划时，**主人的话被误解为 nice-to-have**（v4 二次修订主人明示"实现难度大就先原文"，Qoder 误读为"先不做"）
- Qoder 跨权限改主人 D5 决策方向（"不拆 God Object" → "拆 God Object"），增加 1.5d 工期但未获明示批准

**正模式**：
- "Qoder 出计划 → Claude 三审 → 主人裁定 → Qoder 二次修订" 循环已收敛
- 主人可在 Qoder 二次修订时直接划掉越界决策（"主人 D5 原意是不拆"）
- 决策追溯表（§十二）作为"决策黑盒"防止 Qoder 二次理解偏差

**经验归档路径**：`Thinkpad/22-entities-实体档案/agent-经验库/shared-experiences.md` §"Qoder plan 跨权限改主人决策" 章节（待归档）。

---

## 8. 总结与下一步

| 维度 | v1 → v2 → v2-二次 → v2-三次 → v3-Qoder-最终版 |
|------|--------------------------------------------------|
| 致命缺陷 | 3 → 0 → 0 → 0 → **2（自相矛盾 + 主人原意冲突）** |
| 严重问题 | 5 → 2 → 0 → 0 → **1（P1-A 越界决策）** |
| 中等问题 | 5 → 4 → 0 → 0 → **5（P2-A/B/C/D/E）** |
| 文档一致性 | 缺追溯 → §十二 → §十二+§十三 → **§十二自相矛盾** |
| 开工状态 | 🔴 → 🟢 → ✅ → ✅ → **🟡 必改 2 处后开工** |

### 整改后状态预估

本次 8 项补完后（ERR-1/2 必改 + P1-A 主人裁定 + 5 处 P2 可选），可从 🟢 升至 ✅ 通过。

### 是否需要五审

不需。本次补刀内容机械明确（修文档措辞 + 主人拍板 D10 取向），按本报告 §2-4 直接 Edit plan 文件即可，无需再启 v5 评审。

---

## 附录：本轮审核过程透明性

| 时间 | 事件 |
|------|------|
| 18:01 | Claude v4 草稿落盘（design/1.5/，1164 行） |
| 18:14 | Qoder 第一次基于 v4 出计划（412 行）— 主人指出砍了 4 决策 |
| 18:29 | Qoder 第二次修订（424 行）— 恢复主人 4 决策 + 工时 13.5d + 自主新增 God Object 拆分 |
| 18:35 | 本报告（四审）：2 自相矛盾 + 1 越界决策 + 5 补充 |