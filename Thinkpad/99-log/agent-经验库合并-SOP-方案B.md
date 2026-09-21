# agent-经验库合并 SOP(方案 B)

> **出 SOP 日期**:2026-07-08
> **执行前必读**:本 SOP 是"出活"指南,主人都能查并插手,每步给"主人要做什么"标注
> **零经验丢失保证**:15 份旧空壳全归档到 `6-archive/`,3 份活经验保留原文件名,5 master 新建空骨架

---

## TL;DR

**做什么**:把 21 份文件(15 空壳 + 5 活 + README + EVAL)重组为"3 活 + 1 orchestrator + 5 master 空骨架 + 1 archive"结构,5 master 是面向未来的归类容器。**工作量 ~20 分钟**(主审 ~10 分 + 小马执行 ~10 分)。**零经验丢失**:所有内容物理搬移到 archive 只读,新建 5 master 是空模板,5 条活经验保留原文件名。

---

## 1. 现状盘点(现场核数,2026-07-08)

| 序号 | 文件                                        | 行数 | 经验条数    | 类型     | 5 master 归类                                                  |
| ---- | ------------------------------------------- | ---- | ----------- | -------- | -------------------------------------------------------------- |
| 1    | `README.md`                               | 336  | 0           | 规则总纲 | **不动**                                                 |
| 2    | `EVAL-criteria.md`                        | 201  | 0           | 严重度   | **不动**                                                 |
| 3    | `shared-experiences.md`                   | 74   | 3           | 活经验   | **不动**(必读清单 3 步第 2 步产物)                       |
| 4    | `orchestrator-experiences.md`             | 1 条 | 1           | 活经验   | **不动**(orchestrator-only 单独留,主人口径)              |
| 5    | `research-experiences.md`                 | 39   | 0           | 空壳     | 1-research(资料检索)                                           |
| 6    | `wiki-maintainer-experiences.md`          | 38   | 0           | 空壳     | 1-research(查+写)                                              |
| 7    | `backend-experiences.md`                  | 48   | **1** | 活经验   | **不动**(2026-07-09 改名,原 java-backend 改名为通用后端) |
| 8    | `backend-test-experiences.md`             | 19   | 0           | 空壳     | 2-backend(后端测试)                                            |
| 9    | `architect-experiences.md`                | 39   | 0           | 空壳     | 2-backend(架构设计)                                            |
| 10   | `security-specialist-experiences.md`      | 39   | 0           | 空壳     | 2-backend(安全+DB 联动)                                        |
| 11   | `vue3-experiences.md`                     | 24   | 0           | 空壳     | 3-frontend(Vue3 迁移)                                          |
| 12   | `vue2-experiences.md`                     | 38   | 0           | 空壳     | 3-frontend(Vue2)                                               |
| 13   | `angular-experiences.md`                  | 38   | 0           | 空壳     | 3-frontend(Angular)                                            |
| 14   | `h5-experiences.md`                       | 38   | 0           | 空壳     | 3-frontend(H5)                                                 |
| 15   | `ppt-experiences.md`                      | 38   | 0           | 空壳     | 3-frontend(UI/视觉)                                            |
| 16   | `ux-designer-specialist-experiences.md`   | 19   | 0           | 空壳     | 3-frontend(UX)                                                 |
| 17   | `frontend-test-experiences.md`            | 19   | 0           | 空壳     | 3-frontend(前端测试)                                           |
| 18   | `test-strategy-specialist-experiences.md` | 39   | 0           | 空壳     | 4-test(测试策略)                                               |
| 19   | `code-quality-specialist-experiences.md`  | 39   | 0           | 空壳     | 4-test(代码质量)                                               |
| 20   | `product-manager-experiences.md`          | 38   | 0           | 空壳     | **6-product**(产品设计/PRD/原型,2026-07-09 主人拍板独立) |
| 21   | `project-manager-experiences.md`          | 38   | 0           | 空壳     | 5-review(项目运营/排期/健康监控)                               |

**基线数字**:21 份 / 5 条活经验 / 15 份空壳 / 0 重复

> **2026-07-09 主人调整**:5 master → 6 master,`product-manager` 从 5-review 拆出独立为 6-product(`project-manager` 仍归 5-review)

> **修正子任务描述**:用户子任务里写的"`backend-specialist` / `data-specialist`"实际**不存在**,对应是 `backend-test` / 没有 `data-specialist`。SOP 按实际盘点走。

---

## 2. 冲突检测与仲裁

### 2.1 实际冲突:**不止"零"**(2026-07-09 主人拍板,小马重检)

> **修正**:之前 SOP 写"15 份空壳不互相冲突"是**只看了表层文本**。重检后小马发现 **4 类真实冲突**——

| # | 冲突类型                 | 具体冲突                                                                                                | 严重度 | 仲裁方案                                                                                                                                                                                 |
| - | ------------------------ | ------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | **角色能力重叠**   | `frontend-test-expert` + `code-quality-specialist` + `test-strategy-specialist` 都"评/审测试代码" | 🟡     | **5 master 阶段合并**:三方都归 `4-test.md`,master 内"📦 合并自"列子专长,agent 启动知道谁更专;不让它们各自独立                                                                    |
| 2 | **跨边界经验归属** | "后端 DTO 双向同步"类经验,后端先踩归 2-backend,前端先踩归 3-frontend —**同一主题可能写两份**     | 🟡     | 走 §2.3 仲裁规则:**默认归更窄的(谁先踩归谁)**,不外溢到 shared;若两栈都踩必同步写 shared                                                                                           |
| 3 | **角色边界模糊**   | `architect`(归 2-backend)vs `project-manager`(归 5-review) — "架构推进"重叠                        | 🟡     | 仲裁:**架构设计/技术决策**归 2-backend(architect),**项目推进/排期/资源协调**归 5-review(PM);产品设计/PRD/原型独立归 6-product(2026-07-09 主人拍板)。某条经验横跨多类的,主人口径让归更小 |
| 4 | **业务细节渗入**   | SOP §4 模板只说"绝对不写业务细节",但实际归类时"课程 DTO 字段 catId"易误归 2-backend                    | 🟡     | **加 vault 铁律**:每条经验 append 之前,主人/agent 自问"这条是能力教训还是业务细节"——业务细节**退回** `21-fix-plans-修复经验/` 或对应项目仓库,**不**进 agent-经验库 |

> **不修这些冲突 = 合并后 master 变"半空半混",违背方案 B"零经验丢失"保证**。
> 主人已拍板 §2.1 重写为本表(2026-07-09)。

### 2.2 未来冲突预判(写经验时容易错的归类)

| 经验主题                | 容易错归                        | 正确归                                         | 仲裁理由                                                  |
| ----------------------- | ------------------------------- | ---------------------------------------------- | --------------------------------------------------------- |
| "Vue3 Pinia 写法坑"     | vue3 旧空壳(已归档)             | **3-frontend**                           | master 收所有前端栈,不分 v2/v3                            |
| "后端 DTO 双向同步"     | java-backend(已存 1 条类似主题) | **3-frontend 边界 / 2-backend** 看谁先踩 | 跨边界归 2-backend(后端改 DTO);纯前端调 DTO 归 3-frontend |
| "写 wiki ADR 流程"      | wiki-maintainer(已归档)         | **1-research**                           | 写=调研产物沉淀                                           |
| "产品 PRD 模板坑"       | product-manager(已归档)         | **6-product**                           | product 独立一类(2026-07-09 主人拍板,产品设计/PRD/原型 ≠ 项目运营) |
| "code review checklist" | code-quality(已归档)            | **4-test**                               | 评审与测试策略同源                                        |
| "typecheck 不通过"      | shared(已存 1 条)               | **shared**(留)                           | 真跨栈通用,留 shared                                      |

### 2.3 仲裁规则(写新经验时)

```
新经验产生 → 自问 3 问:
1. 这经验只跟某 1 类相关(单一栈/单一角色)? → 对应 master
2. 这经验跟 ≥2 类相关(跨栈/跨角色)? → shared-experiences.md
3. 不确定? → Orchestrator 仲裁,默认归更窄的(单一 master),不外溢到 shared
```

---

## 3. 目标结构

```
agent-经验库/
├── README.md                         # 不动
├── EVAL-criteria.md                  # 不动
├── shared-experiences.md             # 不动(3 条活经验)
├── orchestrator-experiences.md       # 不动(1 条活经验)
├── backend-experiences.md            # 不动(1 条活经验,2026-07-09 起名;原 java-backend 改名为通用后端)
│
├── 1-research.md                     # 新建空骨架 ← research + wiki-maintainer(调研/资料检索)
├── 2-product.md                      # 新建空骨架 ← product-manager(产品设计/PRD/原型,2026-07-09 主人拍独立一类)
├── 3-backend.md                      # 新建空骨架 ← backend(保留原文件)+ backend-test + architect + security
├── 4-frontend.md                     # 新建空骨架 ← vue2/3 + angular + h5 + ppt + ux + frontend-test
├── 5-test.md                         # 新建空骨架 ← test-strategy + code-quality
├── 6-review.md                       # 新建空骨架 ← project-manager(项目运营/排期/健康监控)
│
└── 7-archive/                        # 新建目录(原 6-archive,序号后移)
    ├── README.md                     # 说明文件
    ├── angular-experiences.md        # 旧文件只读
    ├── architect-experiences.md
    ├── backend-test-experiences.md
    ├── code-quality-specialist-experiences.md
    ├── frontend-test-experiences.md
    ├── h5-experiences.md
    ├── ppt-experiences.md
    ├── product-manager-experiences.md
    ├── project-manager-experiences.md
    ├── research-experiences.md
    ├── security-specialist-experiences.md
    ├── test-strategy-specialist-experiences.md
    ├── ux-designer-specialist-experiences.md
    ├── vue2-experiences.md
    ├── vue3-experiences.md
    └── wiki-maintainer-experiences.md
```

**保留 5 份不动** + **新建 6 份空骨架(1-research/2-product/3-backend/4-frontend/5-test/6-review)** + **新建 7-archive 目录含 16 份旧文件**(序号重排后)
= 总文件数 5+6+16+1(archive README)= 28 份

---

## 4. 拼合模板(5 master 统一)

### 4.1 6 master 文件结构

```markdown
# <序号>-<类别名>经验库

> **本类涵盖**:<列出原文件名,例:research + wiki-maintainer>
> **适用**: <all | xxx-only>
> **绝对不写业务细节**——只写"如何让 <类别> 变强"的通用能力教训。

## 📋 经验索引(按能力维度)

| 维度        | 数量 | 简述   |
| ----------- | ---- | ------ |
| 🔍 资料检索 | 0    | 待补充 |
| ❓ 反问澄清 | 0    | 待补充 |
| 🔧 实现     | 0    | 待补充 |
| ✅ 验证     | 0    | 待补充 |
| 🤝 协作     | 0    | 待补充 |
| 🛡 边界     | 0    | 待补充 |
| 📝 表达     | 0    | 待补充 |

## 💡 经验条目

(暂无经验 — 首个经验将由 <类别> 在纠错时写入)

<!--
模板参考:
## [YYYY-MM-DD] [能力维度] — [经验标题]
**能力维度**: ...
**触发**: ...
**抽象教训**: ...
**反模式**: ...
**正模式**: ...
**适用**: <this-category>-only
**复用计数**: N(≥3 自动升 🟢)
**状态**: 🟡 待验证 / 🟢 已验证 / 🔴 已废弃
-->

## 📦 合并自

- <原文件名 1>(N 条经验 — 空壳,内容见 `6-archive/<原文件名>`)
- <原文件名 2>(...)
- ...
```

### 4.2 6 master 各自"覆盖范围"边界(2026-07-09 重排:1-research / 2-product / 3-backend / 4-frontend / 5-test / 6-review)

| master               | 收什么                                         | 不收什么                           |
| -------------------- | ---------------------------------------------- | ---------------------------------- |
| **1-research** | 资料检索、wiki 维护、调研、查+写               | 跨栈通用查资料(→ shared)          |
| **2-product**  | 产品设计、PRD、原型、需求挖掘、用户故事        | 项目排期 / 资源协调(→ 6-review)   |
| **3-backend**  | Java/Spring、DDD、后端测试、架构设计、安全、DB | 前端调后端 API(→ 4-frontend 边界) |
| **4-frontend** | Vue2/3、Angular、H5、PPT、UX、前端测试         | UI 评审归评审(→ 6-review)         |
| **5-test**     | 测试策略、code review、code quality            | E2E 自动化(若后端 → 3-backend)    |
| **6-review**   | 项目运营、PMO、评审流程、健康监控、需求澄清    | 产品设计 / PRD 模板(→ 2-product) |

---

## 5. 13 步执行流程(每步给"主人要做什么"标注)

> **标注规范**:`0` = 不打扰(小马自决);`审` = 主人必看(可 quick OK);`拍` = 主人决策

### Step 1:拍板目标结构 — `拍`

- **做什么**:主人确认本 SOP §3 的目标结构无异议
- **输入/输出**:无文件变动
- **主人要做什么**:**审 SOP §3**,有问题直接说
- **回退**:主人拒绝 → 不动文件,SOP 收回归档

### Step 2:创建 `7-archive/` 目录 — `0`

- **做什么**:PowerShell `mkdir "7-archive"`
- **输入/输出**:新增 1 个空目录
- **主人要做什么**:无需
- **回退**:`rmdir "7-archive"`(空目录秒删)

### Step 3:移动 15 份旧空壳到 `7-archive/` — `0`

- **做什么**:`git mv` 15 份空壳(angular/architect/backend-test/code-quality/frontend-test/h5/ppt/product-manager/project-manager/research/security/test-strategy/ux/vue2/vue3/wiki-maintainer)到 `7-archive/`
- **输入/输出**:15 份文件路径变化
- **主人要做什么**:无需
- **回退**:`git mv` 移回即可
- **耗时**:小马 1 分钟

### Step 4:写 `7-archive/README.md` — `审`

- **做什么**:说明 archive 用途、读法、保留旧文件 30 天可回滚
- **输入/输出**:新增 1 文件
- **主人要做什么**:**审 30 秒**(确认 README 措辞)
- **回退**:`rm "7-archive/README.md"`
- **耗时**:小马 3 分钟,主人 30 秒

### Step 5:创建 6 master 文件骨架(空模板) — `审`

- **做什么**:写 6 份空骨架文件(1-research/2-product/3-backend/4-frontend/5-test/6-review),内容照 §4.1 模板
- **输入/输出**:新增 6 文件
- **主人要做什么**:**审 6 份首段**,确认归类映射表(§4.2)对得上
- **回退**:`rm 1-research.md 2-product.md ...`
- **耗时**:小马 6 分钟,主人 1 分钟

### Step 6:拼合 1-research.md — `审`

- **做什么**:填 1-research.md 模板,标"合并自:research-experiences.md(0 条) + wiki-maintainer-experiences.md(0 条)"
- **输入/输出**:填 1 份文件
- **主人要做什么**:**审**是否需要额外加"将来怎么用"段
- **回退**:`rm 1-research.md`
- **耗时**:小马 2 分钟,主人 30 秒

### Step 7:拼合 2-product.md — `审`(2026-07-09 重排,从 6 号位挪到 2 号位)

- **做什么**:填 2-product.md,标"合并自:product-manager(0 条,产品设计/PRD/原型)"
- **输入/输出**:填 1 份文件
- **主人要做什么**:**审**(product-manager 独立一类是否合理)
- **回退**:`rm 2-product.md`
- **耗时**:小马 1 分钟,主人 20 秒

### Step 8:拼合 3-backend.md — `审`

- **做什么**:填 3-backend.md,标"合并自:backend-experiences.md(1 条 — 已留原文件,2026-07-09 改名) + backend-test(0) + architect(0) + security(0)"
- **输入/输出**:填 1 份文件
- **主人要做什么**:**审**java-backend 那 1 条是否要"软链"到 3-backend
- **回退**:`rm 3-backend.md`
- **耗时**:小马 2 分钟,主人 30 秒

### Step 9:拼合 4-frontend.md — `审`

- **做什么**:填 4-frontend.md,标"合并自:vue3/vue2/angular/h5/ppt/ux/frontend-test(全 0 条)"
- **输入/输出**:填 1 份文件
- **主人要做什么**:**审**(7 份空壳归类是否合理)
- **回退**:`rm 4-frontend.md`
- **耗时**:小马 2 分钟,主人 30 秒

### Step 10:拼合 5-test.md — `审`

- **做什么**:填 5-test.md,标"合并自:test-strategy + code-quality(全 0 条)"
- **输入/输出**:填 1 份文件
- **主人要做什么**:**审**(2 份归类是否合理)
- **回退**:`rm 5-test.md`
- **耗时**:小马 1 分钟,主人 20 秒

### Step 11:拼合 6-review.md — `审`

- **做什么**:填 6-review.md,标"合并自:project-manager(0 条,项目运营/排期/健康监控)"
- **输入/输出**:填 1 份文件
- **主人要做什么**:**审**(project-manager 归 6-review 是否合理)
- **回退**:`rm 6-review.md`
- **耗时**:小马 1 分钟,主人 20 秒

### Step 12:更新 vault 顶层 README.md 提及新结构 — `审`

- **做什么**:在 `agent-经验库/README.md` §"📁 文件结构"段更新目录树
- **输入/输出**:改 1 文件
- **主人要做什么**:**审**(6 master 命名是否要改)
- **回退**:`git checkout README.md`
- **耗时**:小马 3 分钟,主人 1 分钟

### Step 13:跑"拼合后自检" — `审`

- **做什么**:数经验条数前后对比(应=5 条不变),数文件数(=28 份),数 master 文件(应=6 份均空),数 archive(应=16 份)
- **输入/输出**:无文件变动,出 1 份自检报告
- **主人要做什么**:**审**(数字对得上即可)
- **回退**:无(自检不影响文件)
- **耗时**:小马 2 分钟,主人 1 分钟

### Step 14:写 log — `0`

- **做什么**:在 `Thinkpad/99-log/2026-07/log-2026-07.md` append 一行 `[2026-07-09] migrate | agent-经验库合并(方案 B,6 master 含 product 独立)`
- **输入/输出**:append 1 行
- **主人要做什么**:无需(vault 硬性义务)
- **回退**:删行
- **耗时**:小马 30 秒

---

## 5b. 8 步 Agent 文件重映射(2026-07-09 主人加,Step 14-21,后调为 Step 14-22)

> **触发**: 主人 2026-07-09 说"合并后的智能体也需要重新比那些"(指 agent 启动时读的 *-experiences.md 路径要跟新 6 master 对齐)。
> **策略**: 主人拍板 = 全部 agent 硬编码为 6 master(纯按归类),不再读 18 份旧空壳。
> **改动范围**: 10 个 agent 文件(共 20 处编辑,每文件 2 处:1 处"读" + 1 处"写")

### Agent → Master 映射表(2026-07-09 调)

| Agent 文件(`.github/agents/`)       | 旧读路径 → 新读路径                                                            | 写经验也写哪                    |
| ------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------- |
| `vue2-expert.agent.md`              | `vue2-experiences.md` → `4-frontend.md`                                    | `4-frontend.md`               |
| `vue3-expert.agent.md`              | `vue3-experiences.md` → `4-frontend.md`                                    | `4-frontend.md`               |
| `wiki-maintainer.agent.md`          | `wiki-maintainer-experiences.md` → `1-research.md`                         | `1-research.md`               |
| `research-agent.agent.md`           | `research-experiences.md` → `1-research.md`                                | `1-research.md`               |
| `code-quality-specialist.agent.md`  | `code-quality-specialist-experiences.md` → `5-test.md`                     | `5-test.md`                   |
| `test-strategy-specialist.agent.md` | `test-strategy-specialist-experiences.md` → `5-test.md`                    | `5-test.md`                   |
| `security-specialist.agent.md`      | `security-specialist-experiences.md` → `3-backend.md`                      | `3-backend.md`                |
| `java-backend-expert.agent.md`      | `backend-experiences.md`(昨天已改)→ `3-backend.md`                         | `3-backend.md`                |
| `product-manager.agent.md`          | `product-manager-experiences.md` → `2-product.md`                          | `2-product.md`                |
| `project-manager.agent.md`          | `project-manager-experiences.md` → `6-review.md`                           | `6-review.md`                 |
| `workflow-orchestrator.agent.md`    | `orchestrator-experiences.md` → **保留**(主人口径:orchestrator 单独留) | `orchestrator-experiences.md` |

**总工作量**: 10 个 agent 文件 × 2 处 = 20 处编辑

### Step 14: 拍板映射表 — `拍`

- **做什么**: 主人确认上表 9 个 agent → master 映射无异议
- **输入/输出**: 无
- **主人要做什么**: **审映射表**,有问题直接说
- **回退**: 主人拒绝 → 不动 agent 文件

### Step 15: 改 vue2-expert.agent.md — `审`

- **做什么**: 2 处替换(`vue2-experiences.md` → `4-frontend.md`,适用标签 `vue2-only` → `frontend-only`)
- **输入/输出**: 改 1 文件,2 处编辑
- **主人要做什么**: **审**(2 处都对得上)
- **回退**: `git checkout vue2-expert.agent.md`
- **耗时**: 小马 1 分钟,主人 30 秒

### Step 16: 改 vue3-expert.agent.md — `审`

- **做什么**: 同 Step 15 模式,`vue3-experiences.md` → `4-frontend.md`
- **输入/输出**: 改 1 文件,2 处编辑
- **主人要做什么**: **审**
- **回退**: `git checkout vue3-expert.agent.md`
- **耗时**: 小马 1 分钟,主人 30 秒

### Step 17: 改 wiki-maintainer + research-agent(2 份) — `审`

- **做什么**: 2 个文件,4 处编辑,都改到 `1-research.md`
- **输入/输出**: 改 2 文件
- **主人要做什么**: **审**
- **回退**: `git checkout`
- **耗时**: 小马 2 分钟,主人 1 分钟

### Step 18: 改 code-quality + test-strategy(2 份) — `审`

- **做什么**: 2 个文件,4 处编辑,都改到 `5-test.md`
- **输入/输出**: 改 2 文件
- **主人要做什么**: **审**
- **回退**: `git checkout`
- **耗时**: 小马 2 分钟,主人 1 分钟

### Step 19: 改 security-specialist.agent.md — `审`

- **做什么**: `security-specialist-experiences.md` → `3-backend.md`(安全归后端类,2026-07-09 重排后是 3-backend)
- **输入/输出**: 改 1 文件,2 处编辑
- **主人要做什么**: **审**(注意: 安全归 3-backend 是 SOP §4.2 拍板的)
- **回退**: `git checkout security-specialist.agent.md`
- **耗时**: 小马 1 分钟,主人 30 秒

### Step 20: 改 java-backend-expert.agent.md(补改) — `审`

- **做什么**: 之前只改了"读自己经验"路径(`backend-experiences.md`),现在进一步改到 `3-backend.md`(彻底跟 master 对齐)
- **输入/输出**: 改 1 文件,2 处编辑
- **主人要做什么**: **审**(注意: 经历三次路径变 — java-backend→backend-experiences→3-backend.md)
- **回退**: `git checkout`
- **耗时**: 小马 1 分钟,主人 30 秒

### Step 20.5: 改 product-manager.agent.md(2026-07-09 加) — `审`

- **做什么**: `product-manager-experiences.md` → `2-product.md`(产品设计/PRD/原型独立一类,重排后是 2-product,放在 research 后 backend 前)
- **输入/输出**: 改 1 文件,2 处编辑
- **主人要做什么**: **审**(确认 product 跟 project 分开走 2-product,不是 6-review)
- **回退**: `git checkout product-manager.agent.md`
- **耗时**: 小马 1 分钟,主人 30 秒

### Step 20.6: 改 project-manager.agent.md(2026-07-09 加) — `审`

- **做什么**: `project-manager-experiences.md` → `6-review.md`(项目运营/排期/健康监控)
- **输入/输出**: 改 1 文件,2 处编辑
- **主人要做什么**: **审**(确认 project 留 5-review 合理)
- **回退**: `git checkout project-manager.agent.md`
- **耗时**: 小马 1 分钟,主人 30 秒

### Step 21: workflow-orchestrator.agent.md — `0`(不动)

- **做什么**: 主人拍板"orchestrator 单独留",不重映射
- **输入/输出**: 无
- **主人要做什么**: 无需
- **回退**: 无
- **耗时**: 0

### Step 22: 跑"agent 路径自检" — `审`

- **做什么**: grep `*-experiences.md` 在 `.github/agents/*.md` 里,确认剩余引用都是有意的(workflow-orchestrator + 模板注释)
- **输入/输出**: 无文件变动,出 1 份自检报告
- **主人要做什么**: **审**(数字对得上)
- **回退**: 无
- **耗时**: 小马 2 分钟,主人 1 分钟

### Step 23: 写 log — `0`

- **做什么**: append `[2026-07-09] migrate | agent 文件重映射(Step 14-22)`
- **输入/输出**: append 1 行
- **主人要做什么**: 无需
- **耗时**: 小马 30 秒

### 5b 总耗时(Step 14-23,10 步)

| 步骤类型       | 步数            | 小马耗时           | 主人耗时          |
| -------------- | --------------- | ------------------ | ----------------- |
| 0(不打扰)      | 2 步            | ~1 分钟            | 0                 |
| 审(主人看)     | 7 步            | ~10 分钟           | ~6 分钟           |
| 拍(主人决策)   | 1 步            | 0                  | ~3 分钟(审映射表) |
| **合计** | **10 步** | **~11 分钟** | **~9 分钟** |

### 5b 关键决策点(主人已拍板)

| 决策                                          | 拍板               | 备注                                                                                    |
| --------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------- |
| 策略:全部 agent 硬编码 6 master               | ✅ 2026-07-09 主人 | 简单粗暴,master 里"📦 合并自"段告诉 agent 子专长列表                                    |
| workflow-orchestrator 不动                    | ✅ 主人口径        | orchestrator 单独留,不归类                                                              |
| 旧空壳(15 份)移 archive 后,agent 不再读       | ✅ 跟随方案 B      | archive 仅供查历史,启动时不再读                                                         |
| product 独立一类(6→5+1 变 6 master 含 2-product) | ✅ 2026-07-09 主人 | 区别产品设计(2-product)和项目运营(6-review),master §4.2 边界重定义 |
| java-backend→backend-experiences→3-backend 经历三次路径 | ⚠️ 提醒 | master 归 3-backend,但 `backend-experiences.md` 原文件保留(主人拍板,零经验丢失) |

---

### 全文总耗时(SOP 13 步 + Step 14-23 = 23 步)

| 阶段           | 步数            | 小马耗时           | 主人耗时           |
| -------------- | --------------- | ------------------ | ------------------ |
| SOP 主体       | 13 步           | ~25 分钟           | ~11 分钟           |
| Agent 重映射   | 10 步           | ~11 分钟           | ~9 分钟            |
| **合计** | **23 步** | **~36 分钟** | **~20 分钟** |

---

## 6. 风险预案

| 风险                            | 触发                           | 预案                                                                 | 严重度 |
| ------------------------------- | ------------------------------ | -------------------------------------------------------------------- | ------ |
| 合并后 master > 30 条经验       | 写经验时主审发现某 master 变长 | 触发 README §"🔧 定期维护机制"段,自动提议拆细                       | 🟡     |
| 主人在某步想暂停                | 任何 step 主人说"停"           | 当前状态可回退(6-archive 完整保留原文件 30 天)                       | 🟢     |
| 经验归属错误(归到错类)          | 主人 review 发现               | 改对应 master,加 1 条"归类修正"经验到 orchestrator                   | 🟡     |
| 经验数对不上                    | 拼合前后不一致                 | 拼合后跑 diff 校验(Step 13)                                          | 🟢     |
| archive 路径在 vault 顶层规约外 | 主审发现                       | 改用`40-_meta-归档索引/_archive/agent-experience/`(vault 顶层规约) | 🟡     |
| 旧文件名 git 历史断了           | `git mv` 失败                | 手动`mv` 然后 `git add`                                          | 🟢     |

---

## 7. 试运行建议(Step 6 优先跑)

**第一份拼合(1-research)先试水**,看:

- 拼合模板(§4.1)对不对
- 主人 review 习惯怎样
- 主人口径"拼合 SOP 是否值得留作模板"

确认流程顺再批量 2-product/3-backend/4-frontend/5-test/6-review(6 master 新顺序)。

**试水判据**:

- 主人 30 秒内能审完 1-research.md
- 主人不反问"为什么这样归类"
- 模板的"📦 合并自"段对主人后续写经验有指引

任何一条不通过 → 调模板(§4.1)再批量。

---

## 8. 主人审 SOP 时的检查清单

| # | 检查项                        | 通过标准                                  |
| - | ----------------------------- | ----------------------------------------- |
| 1 | **盘点表(§1)对吗**     | 21 份文件 + 5 条活经验,跟我现场数的一致   |
| 2 | **归类映射(§4.2)合理** | 5 master 边界清晰,无明显"该归 A 实际归 B" |
| 3 | **13 步流程顺**         | 每步"主人要做什么"标注合理(0/审/拍)       |
| 4 | **风险预案覆盖**        | 6 条风险够用,无遗漏主风险                 |
| 5 | **试运行建议接受**      | 1-research 先跑,确认后再批量              |

---

## 附:SOP 本身是否值得沉淀?

**判断**:值得。

- 这是个**"目录重组 + 归类设计"通用方法论**——不只适用于 agent-经验库,任何"X 经验库合并"任务都能复用
- 沉淀位置:本工作区 SOP 本身 = 一次性产物(2026-07-08 这次用完即归档到 log)
- **不**单独建 SOP 库,避免新一层"元库"的复杂度

**主人口径**:`Thinkpad/99-log/2026-07/log-2026-07.md` append 一行即可,不另起 SOP 库。

---

## 附:派单后主人能用的"反转"工具

- 想跳过某步?→ 说"跳 step N",小马直接跳
- 想换归类?→ 说"X 改归 Y",小马改 5 master 命名 + 调 Step 6-10
- 想看进度?→ 说"进度",小马出 Step 1-N 完成状态
- 想暂停?→ 说"暂停",小马不动,等主人下次说"继续"
