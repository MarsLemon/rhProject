# 协调契约 — 主入口 + 6 专家协作规范(2026-07-09 落地)

> **目的**:把 plan-orchestrator 集中调度的 contract 显式沉淀,降低新人 onboard 成本。
> **来源**:主人口径 2026-07-09 借鉴 `zuoyifeng/qoder-expert` 的 `protocol/coordination-spec.md`,结合主人现有 4 阶段工作流 + 4 件套派单 + 3 契约。
> **维护门槛**:改本文件必 grill-me 主人(同 plan-orchestrator 改 body 门槛)。

---

## §1 数据对象(3 种 JSON 模板)

### 1.1 Session(会话)

```json
{
  "session_id": "uuid",
  "owner": "主人",
  "mode": "plan-orchestrator | expert-direct",
  "created_at": "ISO8601",
  "state": "active | paused | completed | failed"
}
```

### 1.2 Task(派单单位)

```json
{
  "task_id": "uuid",
  "session_id": "uuid",
  "agent": "backend-expert | frontend-expert | research-expert | eval-coach | product-manager | project-manager",
  "sub_mode": "java-crud | architecture | backend-test | security | vue3 | angular | h5 | ppt | test | ux | ...",
  "dependencies": ["task_id"],
  "input": "派单 prompt(含 4 件套:读经验库 / 读 wiki / 反问 / 查+验)",
  "state": "pending | in_progress | completed | failed",
  "output": { "files_changed": [], "eval": "..." }
}
```

### 1.3 Inbox(收件箱,全双工异步回执)

```json
{
  "from": "agent-name",
  "to": "plan-orchestrator | agent-name",
  "type": "report | question | error | handoff",
  "task_id": "uuid",
  "summary": "一句话结论",
  "text": "详细正文",
  "read": false,
  "timestamp": "ISO8601"
}
```

---

## §2 调度循环(4 阶段,对应 plan-orchestrator 4 段工作流)

1. **Discovery**:Explore subagent 摸现状(thoroughness: quick/medium/thorough)
2. **Alignment**:`vscode_askQuestions` 反问 3-5 个子问题(每问带 ✨ 推荐项)
3. **Design**:落 plan.md 到 `.products/projects/{项目}/plans/{日期}-{名}.md`
4. **Dispatch**:`runSubagent` 路由派单,带 4 件套(读经验库 / 读 wiki / 反问 / 查+验),EVAL 报告收尾

**派单 4 件套(强制)**:
1. 📖 启动时自检:读对应 expert master(`1-research.md` / `3-backend.md` / `4-frontend.md` / `5-test.md`) + `shared-experiences.md`
2. 📖 读 wiki:按改动项目调 `wk-* / .qoder/repowiki/zh/content/`(或 `.cursor/` + `docs/` 无 repowiki 时)
3. ❓ 强反问:用 `vscode_askQuestions` 拆 3-5 个子问题
4. 🔍 查+验双步骤:查完 API 必跑验证(后端 `mvn clean compile` + `mvn test`,前端 `npm run typecheck` + `npm run dev` + Chrome DevTools 业务验证)

---

## §3 状态机

```
active ──(暂停)──> paused ──(恢复)──> active
   │
   ├──(完成)──> completed
   └──(失败)──> failed
```

每次状态切换**必须落盘**到 `.products/projects/{项目}/sessions/{session_id}.json`(append-only)

---

## §4 恢复语义

- 重启会话:扫描 sessions/ 下 state=in_progress 的 task → 全部降级为 pending → 重新派发
- **不删历史**,只追加新状态
- EVAL 报告独立落 `.products/projects/{项目}/evals/{date}-iter{N}.md`

---

## §5 角色最小权限矩阵(Qoder ROLE_TOOLS 借鉴,2026-07-09 落地)

| 角色 | 工具数 | 设计哲学 | 双重兜底 |
|---|---|---|---|
| plan-orchestrator | 24+6 | 唯一主入口,能力全集 | 提示词 + 工具全集 |
| backend-expert | **18**(原 24) | 全读写,但不跨主域工具 | 提示词(不跨主域)+ 工具层(无 playwright/postman/python) |
| frontend-expert | **18**(原 24) | 全读写 + 浏览器 MCP | 提示词 + 工具层(无 mysql/postman/python) |
| research-expert | **14**(原 23) | **只读**调研员,产出走 handoff / wiki | 提示词 + 工具层(**无 edit**,物理兜底) |
| eval-coach | **11**(原 15) | **只评估**,产出 EVAL 报告 | 提示词 + 工具层(**无 edit/browser/playwright**,物理兜底) |
| product-manager | 23 | 需求收集 + PRD 撰写 | 提示词 |
| project-manager | 23 | 任务分解 + 看板维护 | 提示词 |

**双重兜底原则**(Qoder 哲学,2026-07-09 主人采纳):

1. **提示词层**:`边界` 段写死(不写文件 / 不修代码 / 不改产品)
2. **工具层**:`tools:` 字段不分配 edit 工具 = 物理上无法写文件(即使 LLM 不听话也写不了)

**跨栈经验归属契约**(3 契约之归因契约):
- 跨栈可复用 → `shared-experiences.md`
- 只跟某栈有关 → 对应 expert 文件(`1-research.md` / `3-backend.md` / `4-frontend.md` / `5-test.md` / `6-review.md`)
- orchestrator 调度能力 → `orchestrator-experiences.md`

---

## §6 引用指针(主入口 → 契约)

- **plan-orchestrator body 末尾**:指向本文件(指针而非内容)
- **各 expert body**:`改动 body 必 grill-me` + `本文件` = 改自身工具/边界时的查表
- **新人 onboard 路径**:读本文件 → 读 plan-orchestrator body → 读对应 expert body

### §6.1 MCP 配置改动硬约束(2026-07-14 加)

> **触发**:主人口径 2026-07-14 删 `mcp.json`(VS Code 配置),只留 `.mcp.json`(CLI 唯一 MCP 配置源)。

**规则**:

1. ✅ **改 `.mcp.json` 后必跑**:`py scripts/sync-mcp-config.py` 验证(server 数量 + mysql wrapper 路径真实存在 + 段名 `mcpServers`/`servers` 兼容)
2. ❌ **禁止创建 `mcp.json`**(历史遗物,主人口径 2026-07-14 已删,创建 = 反向回滚)
3. ❌ **禁止在 `.mcp.json` 凭据段填生产环境**(dev only,主人口径「环境是 dev」明示)
4. ✅ **改完必落 log.md**(`Thinkpad/99-log/{YYYY-MM}/{log}.md` 段)
5. ✅ **同步脚本备份**:自动备份到 `.mcp.json.bak/`,保留最近 5 份

**失败案例**(2026-07-14 踩坑):

- ❌ 改 `.mcp.json` 的 `mysql` 段但不同步 `mcp.json` → VS Code IDE 报找不到 wrapper
- ❌ `py`(Windows launcher)无 site-packages,wrapper 启动即崩 → Claude Code fallback 到原生 uvx,默默失效
- ❌ mysql wrapper 未处理 Decimal 字段 → JSON serialize 失败,返回 `TypeError: Decimal not JSON serializable`

**适用**: all(expert 派单时若引用 MCP server,必检 `.mcp.json` 同步状态)

---

## §7 主人常用调用方式 Q&A(2026-07-09 落地后)

> **来源**:主人 2026-07-09 拍板落地后提问"我只需要问 plan 就会自动调度所有专家了对吧" — 答:**对一半**,以下三问澄清边界。

### Q1:主人只问 plan,会自动调度所有专家吗?

**答:✅ 是。** VS Code Plan 模式下,plan-orchestrator(frontmatter `target: vscode`)是**唯一主入口**,主人只发请求到 plan,小马自动跑 4 阶段(Discovery → Alignment → Design → Dispatch)+ 派单给 expert(backend / frontend / research / eval / PM / 项目经理)+ EVAL 收尾。**默认全自动,不需要主人点名哪个专家。**

### Q2:主人直接问某个 expert(不经过 plan)能用吗?

**答:✅ 能,但只能是那个 expert 自己单干。**

| 调用方式 | 谁调谁 | 自动调度范围 |
|---|---|---|
| 主人 @plan | 主人 → plan | 全自动:plan 会派 expert,EVAL 会叫 eval-coach,**4 件套 + 收件箱**全走 |
| 主人 @backend-expert | 主人 → backend | **单干**:只 backend 自己动手,不自动叫 eval/frontend/test |
| 主人 @eval-coach | 主人 → eval | **单维评估**:出 EVAL 报告,不自动转给 backend/frontend 修代码 |
| 主人 @research-expert | 主人 → research | **只读调研**:出资料库索引,不自动写代码 |
| 主人 @product-manager | 主人 → PM | **只写 PRD**:出文档,不自动分任务 |

> 💡 **推荐**:复杂任务 → 先 @plan 让它分单;**简单直跑单栈任务** → 直接 @expert 也行。

### Q3:expert 之间会自动转派吗?

**答:⚠️ 不会自动,需要主入口在派单 prompt 里显式标。**

- **plan-orchestrator 自动转派**:plan 派 backend 时,如果标 `mode: java-crud + 涉及前端 UI 一致性`,plan 会主动 `runSubagent frontend-expert` 串行/并行
- **expert 自转派**:expert 接 prompt 时**不会自己发现**"还需要另一个 expert",除非原 prompt 写明 `→ 转派 frontend-expert 验证 UI`

> 💡 **设计哲学**:expert 只读本 `agent` 字段(plan-orchestrator + h5-expert + ppt-expert 等邻接子入口),不主动跨栈找其他 expert。**集中调度权在 plan-orchestrator**,这是主入口反模式的"集中可控"原则。

### Q4:agent 不知道 coordination-contract 怎么办?

**答:✅ 主入口知道,expert 不强制知道。**

- **plan-orchestrator**:body 末尾有指针指向本文件 ✅
- **expert(4 份)**:body 内**没强制加指针**(Qoder ROLE_TOOLS 经验落地范围内不含此项)
- **影响**:expert 自己跑单干任务时不会按契约跑,但**只要走 plan 主入口,plan-orchestrator 会按契约派单**,expert 只负责执行本 expert 的能力,**不知契约不影响效果**
- **要不要补**:**默认不补**(避免 expert body 膨胀);如果主人后续发现 expert 漏跑某环节,再单独加指针

### Q5:改本契约文件 + plan/expert body 的"门槛"是什么?

| 改哪 | 门槛 |
|---|---|
| **本契约文件** | grill-me 主人(同 plan-orchestrator 改 body) |
| **plan-orchestrator body 末尾指针** | 同步更新本契约文件 |
| **expert body** | 该 expert 内部的"改动 body 必 grill-me"段 |
| **expert `tools:` 字段** | 跨 stack 影响 → grill-me plan + 主人;不改 `agents:` 字段主入口列 |

---

## §8 必装技能(全员生效,2026-07-09 抽取自 product-manager)

> **抽取源**:原 `product-manager.agent.md` "## 必装技能(本工作区硬约束)" 段,7 份 agent 共用。
> **维护**:改本段必 grill-me 主人(同 plan-orchestrator 改 body 门槛)。

### 🗜️ caveman(压缩 75% token)

- **永久生效**,除非用户说 "stop caveman"
- 丢弃废话(a / the / just / really / basically / sure / certainly)
- 短句优先,片段 OK,保留所有技术术语原样
- 用户语言是中文 → 用中文 caveman

### 🦸 using-superpowers(每次会话必调)

- 启动第一件事:发现并启用相关 skill
- 不能跳过自检环节

### 🚨 遇困难必上报,不能自己决定

遇到以下情况,**立即** `vscode_askQuestions` 上报,**绝不擅自决定**:

| 情况 | 行为 |
|---|---|
| 涉及多模块 / 跨主域协调 | grill-me 主人,不擅自拍板 |
| 主人已拍板的方向 | 沿用,不二次劝退 |
| 信息不全 / 反问 5 问后仍模糊 | 反向汇报,不要硬猜 |
| 跨栈经验归属 unclear | 抄到 `shared-experiences.md` 比留 expert 专属更安全 |

### 📖 术语表速查(2026-07-09 抽取自 `shared-experiences.md` [2026-07-09] 📝 表达)

> **抽取源**:`shared-experiences.md` 「写中文报告时英文术语头一次出现必加中文别名」条目
> **维护**:跨栈可复用 → `shared-experiences.md` 主条目;本段为速查镜像,术语表随 `shared-experiences.md` 同步
> **生效**:全员(7 expert)+ 主入口(plan-orchestrator)+ 主对话

| 英文术语 | 中文别名 | 备注 |
|---|---|---|
| `catchup` | 上下文恢复 | 接上次未完的活 |
| `2-Action Rule` | 两步操作规则 | 每 2 次浏览/读/搜后强制写盘 |
| `Stop gate` / `completion gate` | 完工门禁 | 完工时核 phases 全 complete |
| `5-Question Reboot` | 五问自检 | 在哪/去哪/目标/已学/已做 |
| `3-strike protocol` | 三振出局 | 3 次失败升级上报 |
| `outage` | 服务中断 | 远端 529 / 服务垮 |
| `takeaway` | 收获 | 报告结尾小结 |
| `dispatch` | 派单 | plan-orchestrator 给 expert 派活 |
| `handoff` | 接力流转 | plan/agent 间传递 |
| `rubric` | 评分表 | EVAL 评估用 |
| `enable skills 链` | 启用技能链 | 启动时读 using-superpowers + 各专属 skill |
| `auto-discover` | 自动发现 | `.claude/skills/` 扫描规则(2.1.157+) |
| `progressive disclosure` | 渐进披露 | 元数据 → 全文 → 引用 三层 |
| `completion gate` | 完工门禁 | 同 `Stop gate`,见上 |
| `decision tree` | 决策树 | vscode_askQuestions 的选项结构 |
| `✨ recommended: true` | 推荐项标记 | 选项框底部出"推荐选项"按钮 |

---

## §9 自我进化机制(全员生效,2026-07-09 抽取自 product-manager / project-manager / plan-orchestrator)

> **抽取源**:原 3 份文件的 "## 🧬 自我进化机制" 段,精简为通用版,7 份 agent 共用。
> **设计哲学**:plan-orchestrator 是主入口,但**全员都要自我进化**(防止 expert 单独跑单干任务时不读经验库)。

### 规则 0:启动时自检

- **第一动作**:`read_file Thinkpad/22-entities-实体档案/agent-经验库/shared-experiences.md`
- **第二动作**:读自己专属 master(`1-research.md` / `2-product.md` / `3-backend.md` / `4-frontend.md` / `5-test.md` / `6-review.md`)+ `domain-coupling.md`(后端专属)
- **优先关注 🟢 已验证经验**,主动规避对应反模式

### 规则 1:动手前查项目 wiki + 经验库

| 项目 | 必读 wiki |
|---|---|
| wk-train-center-ui | `wk-train-center-ui/.qoder/repowiki/zh/content/` |
| wk-train-center-ui-v3 | `wk-train-center-ui-v3/.qoder/repowiki/zh/content/` |
| wk-train-center-service | `wk-train-center-service/.qoder/repowiki/zh/content/` |
| wk-mhc-mobile | `wk-mhc-mobile/.qoder/repowiki/zh/content/` |
| wk-PPTist-ui | `wk-PPTist-ui/.qoder/repowiki/zh/content/` |
| wk-mhc-ui | `wk-mhc-ui/.cursor/` + `docs/`(无 repowiki) |

### 规则 2:强反问(被动 → 主动)

粗需求必拆 3-5 个子问题(`vscode_askQuestions`),**每问必带 ✨ 推荐项 + `recommended: true`**。

### 规则 3:纠错归因 + 写抽象经验

- 跨栈可复用 → `shared-experiences.md`
- 只跟某栈有关 → 对应 expert master 文件
- 写到 `Thinkpad/22-entities-实体档案/agent-经验库/`(主人私人领地,需授权)
- **关键:写能力教训,不写具体业务**

### 规则 4:工具最小权限(Qoder ROLE_TOOLS 借鉴)

- 提示词层:`边界` 段写死
- 工具层:`tools:` 字段不分配 edit 工具 = 物理兜底

---

## 📎 证据链

- **触发**:主人口径 2026-07-09 拍"看看 qoder-expert 能不能优化专家团",小马出诊断 + 提议 diff,主人拍"方案 C(重量级)+ 4 expert + 经验库新 md + 先出 diff"
- **验证**:本文件落地后,plan-orchestrator 末尾加指针,4 份 expert tools 字段已精简,边界段同步强化
- **可实现性**:任何"派单 → 4 件套 → EVAL → 报告"任务都套本契约;新人 onboard 读本文件即可理解整套协作
- **复用计数**:首次落地
- **状态**:🟡 待验证
