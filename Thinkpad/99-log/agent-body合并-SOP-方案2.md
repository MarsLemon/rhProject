# agent-body 合并 SOP(方案 2 — 抽 4 类)

> **出 SOP 日期**:2026-07-09
> **执行前必读**:本 SOP 是"出活"指南,主人都能查并插手,每步给"主人要做什么"标注
> **抽哪 4 类**:A 业务主域联动 + B wiki 路径 + C 4 条规则模板 + D 反/正模式
> **减重目标**:**~1,500-2,000 行(30-40%)**
> **改动范围**:**18 份 agent 全改**(workflow-orchestrator / plan-orchestrator 单独处理)

---

## TL;DR

把 4 类高度重复的内容(业务主域、wiki 路径、4 条规则模板、反/正模式)从 18 份 agent body 抽到**3 份共享文件**,agent body 缩到 ~50-150 行,**保留独有内容**(主战场 / 反问子问题 / 工具偏好 / 角色定位 / 决策树)。E(必装 skill)和 F(改自身边界)留在 agent body 不动,规避行为漂移风险。

**预计工时**:3-4 小时(主审 ~1.5h + 小马执行 ~2h)

---

## 1. 现状盘点(2026-07-09)

### 1.1 agent 文件清单(19 份,排除 plan-orchestrator)

| #   | 文件                              | 行数 | 类型 | 主战场                     |
| --- | --------------------------------- | ---: | ---- | -------------------------- |
| 1   | workflow-orchestrator.agent.md    |  397 | 调度 | 全工作区                   |
| 2   | architect.agent.md                |  370 | 设计 | SAD/ADR                    |
| 3   | product-manager.agent.md          |  336 | 业务 | `.products/projects/*`     |
| 4   | project-manager.agent.md          |  321 | 业务 | tasks/                     |
| 5   | wiki-maintainer.agent.md          |  298 | 文档 | docs/                      |
| 6   | ppt-expert.agent.md               |  294 | 代码 | `wk-PPTist-ui/`            |
| 7   | java-backend-expert.agent.md      |  265 | 代码 | `wk-train-center-service/` |
| 8   | research-agent.agent.md           |  248 | 检索 | 跨项目                     |
| 9   | h5-expert.agent.md                |  230 | 代码 | `wk-mhc-mobile/`           |
| 10  | angular-expert.agent.md           |  228 | 代码 | `wk-mhc-ui/`               |
| 11  | backend-test-expert.agent.md      |  212 | 测试 | `wk-train-center-service/` |
| 12  | vue3-expert.agent.md              |  208 | 代码 | `wk-train-center-ui-v3/`   |
| 13  | frontend-test-expert.agent.md     |  185 | 测试 | 5 个前端项目               |
| 14  | vue2-expert.agent.md              |  185 | 代码 | `wk-train-center-ui/`      |
| 15  | security-specialist.agent.md      |  109 | 评估 | EVAL 阶段                  |
| 16  | ux-designer-specialist.agent.md   |  105 | 评估 | 前端评审                   |
| 17  | test-strategy-specialist.agent.md |   96 | 评估 | 测试策略                   |
| 18  | code-quality-specialist.agent.md  |   89 | 评估 | 代码质量                   |

**总行数: 4,676 行**

### 1.2 4 类重复点(量化,2026-07-09 grep)

| 重复点               | 频次                                                    | 现状                                                     |
| -------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| **A** 业务主域联动表 | 31(java)+ 21(backend-test) + 其他 ≈ 80 次               | 各 agent 各自写一遍,后端 2 份字面级重复                  |
| **B** wiki 路径表    | 19(research) + 16(architect) + 14(产品) + 其他 ≈ 110 次 | 模板高度相似,内容因项目不同                              |
| **C** 4 条规则模板   | 17/18 ≥10 次,字面级重复 80%                             | 模板: "规则 0/1/2/3/4 启动+读 wiki+反问+查+验+写经验"    |
| **D** 反/正模式      | 7 份高频 + 5 份中频 = 15/18 命中                        | "反模式: 查不到就猜 / 资料矛盾就自己选 / 任务超出就硬上" |

### 1.3 不动的 2 类(规避风险)

| 类别                                                                            | 为什么不抽                                                                    |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **E** 必装 skill 块(caveman + using-superpowers + 遇困难上报)                   | 18 份 100% 命中,但改后 agent 行为可能漂移;agent 启动不确认会跳步骤            |
| **F** 修改自身边界(改 body/description/name 通过 grill-me;改 tools/agents 禁止) | 18 份 100% 命中,这是 agent 自我保护的核心约束,改后主人失去对 agent 改动的控制 |

---

## 2. 目标结构

```
Thinkpad/22-entities-实体档案/agent-经验库/  (已合并为 6 master)
├── shared-experiences.md                    # 已有:跨栈通用经验
├── shared-rules.md                          # 🆕 新建(方案 2 核心)— 抽 C 类(4 条规则模板)
├── shared-patterns.md                       # 🆕 新建 — 抽 D 类(反/正模式)
├── domain-coupling.md                       # 🆕 新建 — 抽 A 类(业务主域联动,后端专属)
├── wiki-index.md                            # 🆕 新建(可选,辅助) — 项目 wiki 路径表
├── 1-research.md / 2-product.md / 3-backend.md / 4-frontend.md / 5-test.md / 6-review.md  # 6 master 不动
└── 7-archive/                               # 17 份旧文件

.github/agents/*.agent.md                   # 18 份 agent,每份 body 缩到 ~50-150 行
                                          # 顶部保留:必装 skill(E)+ 我是谁
                                          # 中部: 引 shared-rules(C) + shared-patterns(D) + domain-coupling(A) + wiki-index(B)
                                          # 底部: 改自身边界(F) + 我独有(主战场/反问子问题/决策树)
```

---

## 3. 4 份共享文件设计

### 3.1 `shared-rules.md` — 抽 C 类(4 条规则模板)

**目标**:所有 agent 共享 "规则 0/1/2/3/4" 模板,agent body 只引不写

**结构**:

```markdown
# Agent 共享规则(全 18 份 expert 通用)

> **适用**:所有 agent(workflow-orchestrator / 18 expert / 18 plan)
> **修改门槛**:任何改这条规则的 agent 必 grill-me 主人

## 规则 0:启动时自检(模板)

**会话第一次响应用户时**,自动读自己的经验文件:

- 步骤 0: `read_file Thinkpad/22-entities-实体档案/agent-经验库/HermesVault-references\.md`(指针)
- 步骤 1: `read_file Thinkpad/22-entities-实体档案/agent-经验库/<本 agent 归类的 master>`(读自己专属 master)
- 步骤 2: 扫一遍 `shared-experiences.md`(共享经验也读)
- 步骤 3: 优先关注 🟢 已验证的经验
- 步骤 4: 接受用户任务时,回顾自己栽过哪些坑

**反模式**:上来就动手,不看历史经验。
**正模式**:启动第一件事 = 读经验。

## 规则 1:动手前按需读 wiki(模板)

**步骤**:

1. 读项目 wiki 根路径(见 wiki-index.md)
2. 按改动模块定位子目录
3. 工具:`file_search` 列目录 + `read_file` 读对应文档,精准定位

**反模式**:通读所有 wiki。
**正模式**:按改动范围精准定位。

## 规则 2:强反问 + 细化(模板)

接到粗需求,必主动拆解成 3-5 个子问题用 vscode_askQuestions 追问。

**反模式**:问"你需要什么?"——太开放,用户答不上来。
**正模式**:问"是改 A、B 还是 C?"——给具体选项,降低回答成本。

**禁止**未填完清单就动手。

## 规则 3:查资料 + 验证双步骤(模板)

| 步骤             | 工具                                | 必做 |
| ---------------- | ----------------------------------- | ---- |
| 查 API           | Context7 MCP / firecrawl-scrape MCP | ✅   |
| 查项目内已有用法 | grep_search + read_file             | ✅   |
| **跑验证**       | typecheck / lint / build            | ✅   |
| **跑业务验证**   | 浏览器 MCP / 命令行测试             | ✅   |

**反模式**:查完 API 文档就信,直接写代码。
**正模式**:查到用法 → 写最小验证 → 跑通 → 才用到项目里。

## 规则 4:纠错归因 + 写抽象经验(模板)

被用户纠正 / 发现自己犯错时,必写一条抽象能力经验到对应 master 文件(若 ≥2 个栈适用则同步写到 shared-experiences.md)。

**关键原则**:写的是"能力教训",不是业务细节。

[模板 markdown 段]
```

### 3.2 `shared-patterns.md` — 抽 D 类(反/正模式)

**目标**:所有 agent 共享"反/正模式"清单

**结构**:

```markdown
# Agent 共享反/正模式

> **适用**:所有 agent
> **更新门槛**:写新反/正模式需 grill-me 主人

## 全员反模式(7 条)

| 反模式                     | 后果                          |
| -------------------------- | ----------------------------- |
| 查不到资料就猜             | 主人纠正 → 返工               |
| 多个资料源结论矛盾就自己选 | 主人期望多确认,不是替拍       |
| 任务超出就硬上             | 越权 → 主人失去对改动的控制   |
| 上来就动手,不看历史经验    | 重复栽坑                      |
| 通读所有 wiki 不精准       | token 浪费                    |
| 问"你需要什么?"开放问题    | 主人答不上来                  |
| 写业务细节到 agent 经验库  | 违反 vault 铁律(只写能力教训) |

## 全员正模式(7 条)

| 正模式                  | 效果         |
| ----------------------- | ------------ |
| 查不到必上报,不擅自决定 | 留主人决策权 |
| 资料矛盾必上报          | 让主人拍板   |
| 任务超出必 grill-me     | 守住边界     |
| 启动第一件事 = 读经验   | 累积型智能体 |
| 按改动范围精准读 wiki   | 节省 token   |
| 问"是 A/B/C?"具体选项   | 降低回答成本 |
| 写能力教训,不写业务     | 跨项目可复用 |

## 编排者特有(workflow-orchestrator 专属)

| 反模式                       | 正模式                     |
| ---------------------------- | -------------------------- |
| 静默派单                     | 派单必报告领域 + 4 件套    |
| 替主拍板                     | 拍板 = 锁死,不再评估换方向 |
| 把跨栈经验写到某 expert 文件 | 默认归更窄的               |
```

### 3.3 `domain-coupling.md` — 抽 A 类(业务主域联动)

**目标**:后端 agent 共享"业务主域联动表"

**结构**:

```markdown
# 业务主域联动表(wk-train-center-service 后端专属)

> **适用**:java-backend-expert / backend-test-expert(其他 agent 不必读)
> **来源**:CLAUDE.md §1 硬约束

| 主域     | 必查联动域                           |
| -------- | ------------------------------------ |
| 课程     | 学习任务 / 培训计划 / 统计 / AI 答疑 |
| 学习任务 | 课程 / 培训计划 / AI 答疑            |
| 培训计划 | 学习任务 / 课程 / 考试               |
| 考试     | 培训计划 / 用户 / 权限               |
| AI 答疑  | 课程(学习记录)/ 培训计划(节点)       |

**联动笔记位置**:`.claude/projects/E--rhProject/memory/`(查 `domain-coupling-*` / `domain-overview`)

**主战场**:后端改 DTO / Service / Repository / 跨主域 service 调用前必读
```

### 3.4 `wiki-index.md` — 抽 B 类(wiki 路径表)

**目标**:14 份 agent 共享"项目 wiki 根路径"表

**结构**:

```markdown
# 项目 wiki 索引

> **适用**:14 份"业务型" agent(不适用于 4 specialist)
> **更新门槛**:新增项目 wiki 路径必 grill-me 主人

| 项目                    | wiki 根路径                                     | 备注                              |
| ----------------------- | ----------------------------------------------- | --------------------------------- |
| wk-train-center-service | `.qoder/repowiki/zh/content/` + `knowledge/zh/` | 主 wiki + 辅助                    |
| wk-train-center-ui      | `.qoder/repowiki/zh/content/` + `knowledge/zh/` | Vue2                              |
| wk-train-center-ui-v3   | `.qoder/repowiki/zh/content/` + `knowledge/zh/` | Vue3                              |
| wk-mhc-mobile           | `.qoder/repowiki/zh/content/`                   | H5                                |
| wk-PPTist-ui            | `.qoder/repowiki/zh/content/`                   | PPT                               |
| wk-mhc-ui               | `.cursor/` + `docs/`                            | **无 repowiki**,信息少,主动问用户 |
| 跨项目                  | (无单一路径)                                    | 由 Orchestrator 路由              |

**改前必查**:此项目有 wiki → 改前必读根路径 + 改模块子目录;无 wiki → 主动 grill-me 问用户要参考材料

**工具**:file_search 列目录 + read_file 读对应文档,**别贪多**,精准定位
```

---

## 4. 抽离判据(每段类型)

| 类型                              | 段特征                                                       | 抽到哪                   |
| --------------------------------- | ------------------------------------------------------------ | ------------------------ |
| **共享 C(规则模板)**              | 出现 4 条规则,内容是"启动 + 读 wiki + 反问 + 查+验 + 写经验" | `shared-rules.md`        |
| **共享 D(反/正模式)**             | 出现"反模式 / 正模式"表                                      | `shared-patterns.md`     |
| **共享 A(主域联动)**              | 出现"主域 / 必查联动"表                                      | `domain-coupling.md`     |
| **共享 B(wiki 路径)**             | 出现"必读 wiki 根路径 + 按改动模块定位子目录"表              | `wiki-index.md`          |
| **半独有**                        | "我专属的反问子问题 / 工具偏好"                              | agent body 留            |
| **独有**                          | "我做什么 / 核心约定 / 主战场 / 决策树 / 路由表"             | agent body 留            |
| **E(必装 skill) / F(改自身边界)** | 18 份字面级相同                                              | **不动,留在 agent body** |

---

## 5. 8 步执行流程

> **标注规范**:`0` = 不打扰(小马自决);`审` = 主人必看(可 quick OK);`拍` = 主人决策

### Step 1:拍板目标结构 — `拍`

- **做什么**:主人确认 §2 目标结构无异议
- **输入/输出**:无文件变动
- **主人要做什么**:**审 §2 4 份共享文件设计**
- **回退**:主人拒绝 → 不动文件

### Step 2:新建 4 份共享文件骨架 — `审`

- **做什么**:在 `Thinkpad/22-entities-实体档案/agent-经验库/` 下创建 `shared-rules.md` / `shared-patterns.md` / `domain-coupling.md` / `wiki-index.md` 4 份空骨架(按 §3 设计)
- **输入/输出**:新增 4 文件
- **主人要做什么**:**审 4 份首段**,确认 §3 抽离判据对得上
- **回退**:`rm shared-rules.md shared-patterns.md domain-coupling.md wiki-index.md`
- **耗时**:小马 15 分钟,主人 5 分钟

### Step 3:填 4 份共享文件内容 — `审`

- **做什么**:按 §3 设计填内容(模板 / 段 / 列表)
- **输入/输出**:填 4 份文件
- **主人要做什么**:**审 1 份最关键(shared-rules.md)**,其余 quick OK
- **回退**:`rm 4 份`
- **耗时**:小马 30 分钟,主人 10 分钟

### Step 4:验证 4 份共享文件自洽 — `审`

- **做什么**:检查 4 份之间引用一致(shared-rules 引 shared-patterns 等)
- **输入/输出**:无文件变动,出 1 份自检报告
- **主人要做什么**:**审**(交叉引用都对得上)
- **回退**:无
- **耗时**:小马 5 分钟,主人 2 分钟

### Step 5:写 README.md §"📁 文件结构" 段更新 — `审`

- **做什么**:在 `agent-经验库/README.md` §"📁 文件结构"段加 4 份共享文件
- **输入/输出**:改 1 文件
- **主人要做什么**:**审**(目录树对得上)
- **回退**:`git checkout README.md`
- **耗时**:小马 5 分钟,主人 2 分钟

### Step 6:18 份 agent 减重(核心 step)— `审`

- **做什么**:18 份 agent 全部减重,删 4 类重复段,加"@ 共享文件"引用
- **输入/输出**:改 18 份 agent
- **每份 agent 的减重模板**:

  ```markdown
  # <agent 名>

  ## 必装技能(本工作区硬约束) ← 保留(E)

  ### 🗜️ caveman / 🦸 using-superpowers / 🚨 遇困难必上报

  ## 4 条规则(共享) ← 新增引用

  详见 `shared-rules.md`:

  - 规则 0:启动时自检
  - 规则 1:动手前按需读 wiki
  - 规则 2:强反问 + 细化
  - 规则 3:查+验
  - 规则 4:写经验

  ## 反/正模式(共享) ← 新增引用

  详见 `shared-patterns.md`

  ## 业务主域联动(wk-train-center-service 后端专属) ← 仅 java-backend + backend-test

  详见 `domain-coupling.md`

  ## wiki 路径(共享) ← 新增引用

  详见 `wiki-index.md`

  ## <我专属> ← 保留独有

  - 反问子问题(我 5 个)
  - 工具偏好(我用什么)
  - 角色定位 + 主战场
  - 核心约定 / 决策树(如有)

  ## 修改自身边界 ← 保留(F)

  - 改 body/description/name 通过 grill-me
  - 改 tools/agents 禁止
  ```

- **每份减重目标**:从原 90-400 行 → 50-150 行
- **主人要做什么**:**审 3 份最复杂**(workflow-orchestrator + java-backend + architect),其余 quick OK
- **回退**:`git checkout .github/agents/`
- **耗时**:小马 90 分钟,主人 15 分钟

### Step 7:跑 agent 减重自检 — `审`

- **做什么**:数 agent 总行数(应从 4,676 → ~2,500-3,200)、4 类重复段是否真抽净、新引用是否一致
- **输入/输出**:无文件变动,出 1 份自检报告
- **主人要做什么**:**审**(数字对得上)
- **回退**:无
- **耗时**:小马 10 分钟,主人 5 分钟

### Step 8:写 log — `0`

- **做什么**:append `[2026-07-09] merge | agent-body 抽 4 类(方案 2) + 18 份减重 30-40%`
- **输入/输出**:append 1 行
- **主人要做什么**:无需
- **耗时**:小马 1 分钟

### 总耗时

| 步骤类型 | 步数     | 小马耗时      | 主人耗时     |
| -------- | -------- | ------------- | ------------ |
| 拍       | 1        | 0             | 5 分钟       |
| 审       | 6        | ~155 分钟     | ~40 分钟     |
| 0        | 1        | 1 分钟        | 0            |
| **合计** | **8 步** | **~2.5 小时** | **~45 分钟** |

---

## 6. 风险预案

| 风险                                 | 触发              | 预案                                                       | 严重度 |
| ------------------------------------ | ----------------- | ---------------------------------------------------------- | ------ |
| 4 份共享文件内部引用不一致           | 主人 review 发现  | 检查所有交叉引用,改对应段                                  | 🟡     |
| 18 份 agent 减重后必装 skill(E)丢失  | Step 6 误删       | Step 7 grep "caveman" 0 命中即告警,git checkout 单文件恢复 | 🟡     |
| 18 份 agent 减重后改自身边界(F)丢失  | Step 6 误删       | 同上,grep "grill-me" 0 命中即告警                          | 🟡     |
| workflow-orchestrator 减重后丢调度表 | Step 6 误删独有段 | Step 7 diff 对比前后行数(应保留 ~200 行)                   | 🟡     |
| 共享文件路径写错导致 agent 找不到    | 主人跑活时发现    | Step 7 grep 验证 18 份 agent 都引对路径                    | 🟢     |
| 主人反悔"我不要抽 4 类,要抽 6 类"    | 任何 step         | Step 1-5 已做(共享文件),Step 6-7 跳过,等方案 3 重启        | 🟢     |

---

## 7. 试运行建议(Step 6 优先跑)

**第一份减重(java-backend-expert)先试水**,看:

- 抽 4 类段时是否丢独有内容
- "引用"格式 agent 是否好读
- 主人 review 习惯

**试水判据**:

- java-backend 减重后 ~50-100 行(从 265)
- 4 类重复段都真抽了
- 主人 30 秒内能审完 1 份

任何一条不通过 → 调模板再批量。

---

## 8. 主人审 SOP 时的检查清单

| #   | 检查项                       | 通过标准                                                                                           |
| --- | ---------------------------- | -------------------------------------------------------------------------------------------------- |
| 1   | **4 份共享文件设计(§3)合理** | shared-rules 模板清晰、shared-patterns 反/正模式覆盖、domain-coupling 仅后端用、wiki-index 14 份用 |
| 2   | **抽离判据(§4)合理**         | "独有"内容不会被误抽,agent 仍有 50-150 行                                                          |
| 3   | **8 步流程顺**               | 每步"主人要做什么"标注合理                                                                         |
| 4   | **风险预案覆盖**             | 6 条风险够用,无遗漏主风险                                                                          |
| 5   | **E/F 保留决定认可**         | 主人认可"必装 skill / 改自身边界" 不抽的判断                                                       |

---

## 附:反转工具(派单后主人能用)

- 想跳过某步?→ 说"跳 step N",小马直接跳
- 想换抽哪几类?→ 说"改抽 A/B/C/D 中 3 个",小马调 §3 + Step 6
- 想恢复某 agent?→ 说"恢复 X.agent.md",小马 `git checkout`
- 想暂停?→ 说"暂停",小马不动

---

**SOP 完。下一步等主人审 → 拍板"OK 开干" → 小马走 Step 1-8。**
