---
title: Agent 数量精简合并 SOP(方案 D — 7-8 份,砍 11 份)
created: 2026-07-09
updated: 2026-07-09
type: sop
tags: [sop, agent-精简, 方案-D, 4-类职能]
owner: 沈超
agent: 小马(架构师)
---

agent: 小马(架构师)
owner: 沈超

# Agent 数量精简合并 SOP(方案 D — 19 → 8,砍 11)

> **出 SOP 日期**:2026-07-09
> **主人拍板**:方案 D = 7-8 份(调研 1 + 后端 2 + 前端 1 + 调度 4),砍 vue2-expert
> **协同**:**Phase 3 必先于 Phase 2** —— 本 SOP 是方案 [[agent-body合并-SOP-方案2]] 的前置,**先决定"砍哪几份"再决定"抽 4 类共享"**(避免重复劳动:砍的 agent 不用抽共享,留的才抽)
> **方法**:所有数据现场盘点(2026-07-09 grep + ls),**5-10 分钟可读完**

---

## TL;DR

19 份 agent → **保留 8 份,砍 11 份**,跟方案 2 SOP 协同,Phase 3 先于 Phase 2。
**工作量 ~30 分钟**(主审 ~10 分 + 小马执行 ~20 分)。
**零经验丢失**:所有被砍 agent 的独有内容(主战场段 / 反问子问题 / 角色定位 / 决策树)按"内容迁移表"逐份迁到接收新 agent,删除 = 物理移到 `8-archive/`(30 天可回滚)。

**目标 8 份清单**(精简比例 ~58%):

| # | 新文件名 | 行数估算 | 接收旧 agent |
| - | --- | --: | --- |
| 1 | `research-expert.agent.md` | ~120 | research + wiki-maintainer |
| 2 | `java-backend-expert.agent.md` | ~150 | (保留不动,合并后端主力) |
| 3 | `backend-expert.agent.md` | ~180 | backend-test + architect + security + 后端子模式 |
| 4 | `frontend-expert.agent.md` | ~200 | vue3 + angular + h5 + ppt + ux(段)+ frontend-test |
| 5 | `plan-orchestrator.md` | ~600 | (保留不动,**主路由入口**,含原 workflow-orchestrator 派单能力,**2026-07-09 workflow 已合并到此**) |
| 6 | `product-manager.agent.md` | ~200 | (保留不动,2-product 唯一来源) |
| 7 | `project-manager.agent.md` | ~180 | (保留不动,6-review 唯一来源) |
| 8 | `eval-coach.agent.md` | ~150 | security + ux(主体)+ test-strategy + code-quality |

---

## 1. 目标 8 份清单(主战场对应确认)

### 1.1 调研 → 1 份 → `research-expert.agent.md`

| 维度 | 内容 |
|---|---|
| **行数估算** | ~120 行(原 research-agent 248 + wiki-maintainer 298,抽 4 类共享后合) |
| **主战场** | 跨项目查资料 + 写 wiki + 出 ADR/SOP/调研报告 |
| **独有职责** | 找资料(MCP 工具栈)/ 写库(vault SOP/经验库)/ 跨栈归档 |
| **接收旧** | `research-agent.agent.md`(248) + `wiki-maintainer.agent.md`(298) |

### 1.2 后端 → 2 份 → `java-backend-expert` + `backend-expert`

#### 1.2.1 `java-backend-expert.agent.md`(保留)

| 维度 | 内容 |
|---|---|
| **行数估算** | ~150 行(原 265 行,方案 2 抽 4 类共享后缩) |
| **主战场** | `wk-train-center-service/` Spring Boot 3 + DDD + MyBatis-Plus |
| **独有职责** | 改 DTO / Service / Repository / Controller / 跨主域 service 调用 |
| **接收旧** | (保留,不接收) |

#### 1.2.2 `backend-expert.agent.md`(新)

| 维度 | 内容 |
|---|---|
| **行数估算** | ~180 行 |
| **主战场** | (同 java-backend,作为"后端子模式/辅助"入口) |
| **独有职责** | 后端架构设计(SAD/ADR)/ 后端测试(/集成测试/DB 验证)/ 后端安全(OWASP)/ 后端评审(architect mode + security mode + test mode) |
| **接收旧** | `backend-test-expert.agent.md`(212) + `architect.agent.md`(370) + `security-specialist.agent.md`(109) |
| **关键设计** | 后端子模式(by role 切换):`mode: architect` / `mode: backend-test` / `mode: security`,agent 启动时根据任务定位 mode |

### 1.3 前端 → 1 份 → `frontend-expert.agent.md`

| 维度 | 内容 |
|---|---|
| **行数估算** | ~200 行 |
| **主战场** | 5 个前端项目:`wk-train-center-ui-v3/`(Vue3)+ `wk-mhc-ui/`(Angular)+ `wk-mhc-mobile/`(H5)+ `wk-PPTist-ui/`(PPT)+ 跨栈测试 |
| **独有职责** | 5 栈开发 / 测试 / UX 评审(node-by-node 路由 to 5 项目) |
| **接收旧** | `vue3-expert.agent.md`(208) + `angular-expert.agent.md`(228) + `h5-expert.agent.md`(230) + `ppt-expert.agent.md`(294) + `frontend-test-expert.agent.md`(185) + `ux-designer-specialist.agent.md`(105,主体进 eval-coach,**UX 段共享**) |
| **关键设计** | 节点路由 by 项目:`proj: vue3` / `proj: angular` / `proj: h5` / `proj: ppt`,5 项目对应 5 个段落,不破"6 项目 1:1 对应"硬约束(v2 待清理) |

### 1.4 调度 → 4 份

#### 1.4.1 `plan-orchestrator.md`(保留,主路由入口)

> **2026-07-09 主入口拍板**:`plan-orchestrator.md` = 主路由入口(= VS Code Plan 模式唯一能调子 agent 的入口),原 `workflow-orchestrator.agent.md` 的派单能力已 100% 合并到此文件(包含:自我进化机制 4 段 + 关键行为约束矩阵 + 修改自身边界表),workflow-orchestrator.agent.md 已物理删

- **行数**:~600 行(原 plan-orchestrator + 合并的 workflow-orchestrator 内容)
- **目标**:8 份清单的核心"调度入口",**不砍**,**不**走方案 2 抽 4 类共享(已是完整派单模板,不能拆)
- **handoff 链**:2 个 handoff (Start Implementation / Open in Editor) 指向 `workflow-plan`(自身)= 点按钮 = 阶段 4 派单

| 维度 | 内容 |
|---|---|
| **行数估算** | ~400 行(原 397/532 行,方案 2 抽 4 类共享后略缩) |
| **主战场** | 全工作区,4 阶段流程(产品→项目→代码→Wiki)+ EVAL |
| **接收旧** | (保留,轻减重) |

#### 1.4.2 `product-manager.agent.md`(保留)

| 维度 | 内容 |
|---|---|
| **行数估算** | ~200 行(原 336/468 行,方案 2 抽 4 类共享后缩) |
| **主战场** | `.products/projects/*/docs/` PRD/用户故事/验收标准 |
| **接收旧** | (保留,2-product master 唯一来源) |

#### 1.4.3 `project-manager.agent.md`(保留)

| 维度 | 内容 |
|---|---|
| **行数估算** | ~180 行(原 321/434 行,方案 2 抽 4 类共享后缩) |
| **主战场** | `.products/projects/*/tasks/` 排期/看板/风险登记 |
| **接收旧** | (保留,6-review master 唯一来源) |

#### 1.4.4 `eval-coach.agent.md`(新)

| 维度 | 内容 |
|---|---|
| **行数估算** | ~150 行 |
| **主战场** | EVAL 阶段(代码任务完成 → 评估 → 报告) |
| **独有职责** | 多维度评审(安全/UX/测试策略/代码质量),EVAL 报告输出 |
| **接收旧** | `security-specialist.agent.md`(109) + `ux-designer-specialist.agent.md`(105,主体)+ `test-strategy-specialist.agent.md`(96) + `code-quality-specialist.agent.md`(89) |
| **关键设计** | 维度路由:任务涉及安全 → `dim: security`;涉及 UI → `dim: ux`;涉及测试 → `dim: test`;涉及代码质量 → `dim: code`。**必填至少 1 维** |

---

## 2. 内容迁移表(11 砍 → 8 留)

> **零经验丢失保证**:每份被砍 agent 的"独有段"都必须迁到对应新 agent,迁移表逐份落实。

| # | 旧 agent | 接收新 agent | 接收什么段(独有内容) | 接收什么工具集 |
| - | --- | --- | --- | --- |
| 1 | **wiki-maintainer.agent.md** | `research-expert` (新) | "wiki 写库流程" + "SOP 模板" + "ADR 模板" + "changelog 同步" + 文档同步"4 阶段"段 | `vscode.*` + `git/*` + `create_*` |
| 2 | **backend-test-expert.agent.md** | `backend-expert` (新) | "@SpringBootTest / mvn test / Mockito / Testcontainers"段 + "mcp__mysql-mcp__*"使用 | `java/junit` + `mvn` + `mcp__mysql-mcp__*` |
| 3 | **architect.agent.md** | `backend-expert` (新) | "SAD/ADR 撰写流程" + "分层架构图" + "决策树 (何时拆服务/何时单库)" 段 | `mermaid` + `ms-python.python` + 全部调研工具 |
| 4 | **security-specialist.agent.md** | `eval-coach` (新) | "OWASP Top 10 检查清单" + "注入/认证/加密/依赖漏洞" 段(EVAL 维度) | EVAL 工具(浏览器 + Playwright + grep) |
| 5 | **ux-designer-specialist.agent.md** | `eval-coach`(主)+ `frontend-expert`(段共享) | 主体进 eval-coach:"可用性 4 原则 + Nielsen 启发" + "PRD/i18n 评审 + 走查清单";**UX 段共享**进 frontend-expert:"5 项目 UI 一致性 + 设计 token 复用" | `vscode` + 浏览器 + `frontend-design` skill |
| 6 | **test-strategy-specialist.agent.md** | `eval-coach` (新) | "E2E 覆盖矩阵" + "覆盖率阈值表" + "vitest + jest + 浏览器 MCP 选型" 段(EVAL 维度) | EVAL 工具 |
| 7 | **code-quality-specialist.agent.md** | `eval-coach` (新) | "SOLID 检查清单" + "循环复杂度阈值" + "DRY/KISS 评审" 段(EVAL 维度) | EVAL 工具 + `pylance-mcp-server` + `seq-th` |
| 8 | **vue3-expert.agent.md** | `frontend-expert` (新,proj: vue3 段) | "Vue 3.5 + Element-Plus + Pinia 迁移" + "v3 迁移工作流" + "v3 双绿原则" 段 | Vue 工具链 + `vscode` |
| 9 | **vue2-expert.agent.md** | **🗑️ 砍**(主人在迁 v3,v2 退场) | (退场,不迁) | (无) |
| 10 | **angular-expert.agent.md** | `frontend-expert` (新,proj: angular 段) | "Angular 18 + Nx + Module Federation" 段 | Angular 工具链 + `nx.json` 相关 |
| 11 | **h5-expert.agent.md** | `frontend-expert` (新,proj: h5 段) | "Vue 3 + Vite + UnoCSS 移动 H5" + "移动适配" 段 | H5 工具链 |
| 12 | **ppt-expert.agent.md** | `frontend-expert` (新,proj: ppt 段) | "Vue 3 + pptxgenjs 幻灯片编辑/生成" 段 | pptxgenjs + Vue + 工具链 |
| 13 | **frontend-test-expert.agent.md** | `frontend-expert` (新,维度: test) | "vitest + Playwright + 浏览器 MCP" 段(跨栈测试,5 项目通用) | 测试工具 + `playwright/*` |
| 14 | **plan-orchestrator.md** | **� 保留**(主路由入口,2026-07-09 主入口拍板) | (不迁,自身已 100% 吸收 workflow-orchestrator 派单能力) | (无,不动) |

**汇总**:14 个迁移条目 → 4 份新 agent 各填内容;1 个砍(`vue2-expert`)只删不迁;`plan-orchestrator.md` 保留(主入口)。

> **⚠️ 主入口拍板反转**:原方案 14 把 `plan-orchestrator.md` 划为"🗑️ 砍",2026-07-09 主人口径反转:"VS Code Plan 模式唯一能调子 agent 的入口 = plan-orchestrator",workflow-orchestrator 的派单能力已 100% 合并到 plan-orchestrator。原"合并建议进 workflow-orchestrator description"已无意义(workflow-orchestrator.agent.md 已物理删)。

**关键设计点**:
- **`ux-designer-specialist` 双引**:UX 评审 = "评估维度"(→ eval-coach 主体)+ "前端 UI 共性"(→ frontend-expert 段共享),**两段共享 + 互引**
- **`frontend-expert` 5 段 by 节点路由**:`proj: vue3/angular/h5/ppt`,主体 + 5 段(各段独占接收对应 agent 的"主战场"段)
- **`backend-expert` 4 子模式**:`mode: architect/test/security/auxiliary`,主体 + 3 段(各段独占接收对应 agent 的"评估职责"段)

---

## 3. 4 份新 agent 模板

### 3.1 `research-expert.agent.md`(新)

#### Frontmatter

```yaml
---
name: research-expert
description: 调研 + 写库。负责跨项目资料检索、wiki/ADR/SOP/调研报告撰写、Vault 维护。本工作区唯一调研角色,合并自 research-agent + wiki-maintainer。
user-invocable: true
disable-model-invocation: false
tools:
  - vscode
  - execute
  - read
  - agent
  - web
  - browser
  - context7/*
  - fetch/*
  - firecrawl/firecrawl-mcp-server/*
  - github/*
  - io.github.tavily-ai/tavily-mcp/*
  - microsoft/markitdown/*
  - sequential-thinking/*
  - todo
  - create_file
  - replace_string_in_file
  - multi_replace_string_in_file
  - grep_search
  - file_search
agents:
  - workflow-orchestrator
---
```

#### Body 模板

````markdown
# 研究 + 写库专家(Research & Wiki Expert)

## 必装技能(本工作区硬约束)
### 🗜️ caveman / 🦸 using-superpowers / 🚨 遇困难必上报

## 4 条规则(共享)
详见 `Thinkpad/22-entities-实体档案/agent-经验库/shared-rules.md`(方案 2 产物):
- 规则 0:启动时自检(读 `1-research.md` master)
- 规则 1:动手前按需读 wiki
- 规则 2:强反问 + 细化
- 规则 3:查+验
- 规则 4:写经验

## 反/正模式(共享)
详见 `Thinkpad/22-entities-实体档案/agent-经验库/shared-patterns.md`

## 我是谁

**研究 + 写库** 二合一角色,主战场:
- **查资料**:跨项目 / 跨技术栈的资料检索、ADR/SDK 调研、对比报告
- **写库**:vault 维护、SOP 撰写、wiki 文档、changelog/ADR

**独有工具偏好**(区别于其他 agent):
- `firecrawl/firecrawl-mcp-server/*` + `io.github.tavily-ai/tavily-mcp/*` — 联网调研
- `microsoft/markitdown/*` + `fetch/*` — 文件→Markdown 转换
- `create_file` + `multi_replace_string_in_file` — vault/ADR/SOP 直接写

## 主战场专属段

### A. 调研流程(原 research-agent 独有)
- 5 步调研法:定问题 → 列源 → 批量取 → 交叉验 → 写报告
- 报告模板见 §B

### B. 写库流程(原 wiki-maintainer 独有)
- SOP 8 段模板:TL;DR → 现状盘点 → 冲突检测 → 目标结构 → 执行流程 → 风险预案 → 试运行建议 → 检查清单
- ADR 模板:上下文 → 决策 → 后果

### C. 文档同步(原 wiki-maintainer 独有)
- 代码完成后 → 同步 .products/projects/*/docs/ + changelog

## 反问子问题(我专属)
1. 调研是为 SOP/ADR/对比/issue 哪类?
2. 信息源限定某个项目/某个域/全网?
3. 报告存 vault 还是 wiki?
4. 要不要顺道改 docs/changelog?
5. 有没有 ground truth 必须先核(避免被过期资料误导)?

## 主入口 vs 别名(原 plan-orchestrator 整合)
- 主入口:`research-expert`(本 agent)
- 子入口:`workflow-orchestrator` description 提及 "也支持 plan 模式"(吸收 plan-orchestrator.md 内容)

## 修改自身边界
- ❌ 不擅自改 tools/agents
- ❌ 不擅自删除自己
- ✅ 改 body/description/name 必 grill-me Orchestrator
````

#### 接收工具集验证
- ✅ `vscode` + `read` + `file_search` + `grep_search` + `create_file` — vault 写
- ✅ `web` + `fetch/*` + `firecrawl/*` — 联网调研
- ✅ `browser` + `markitdown/*` — 网页/文件→Markdown
- ✅ `sequential-thinking/*` + `todo` — 调研流程

---

### 3.2 `backend-expert.agent.md`(新)

#### Frontmatter

```yaml
---
name: backend-expert
description: 后端架构 + 后端测试 + 后端安全 + 后端评审。子模式 (mode=architect/test/security/auxiliary) 切换。本工作区唯一后端辅助角色,合并自 backend-test-expert + architect + security-specialist。java-backend-expert 是后端主力,本 agent 是后端辅助/评估入口。
user-invocable: true
disable-model-invocation: false
tools:
  - vscode
  - execute
  - read
  - agent
  - search
  - web
  - browser
  - mysql/*
  - context7/*
  - pylance-mcp-server/*
  - sequential-thinking/*
  - todo
  - create_file
  - replace_string_in_file
  - multi_replace_string_in_file
agents:
  - workflow-orchestrator
  - java-backend-expert
---
```

#### Body 模板

````markdown
# 后端辅助 + 评估专家(Backend Expert)

## 必装技能(本工作区硬约束)
### 🗜️ caveman / 🦸 using-superpowers / 🚨 遇困难必上报

## 4 条规则(共享)
详见 `Thinkpad/22-entities-实体档案/agent-经验库/shared-rules.md`(方案 2 产物):
- 规则 0:启动时自检(读 `3-backend.md` master)
- 规则 1:动手前按需读 wiki
- 规则 2:强反问 + 细化
- 规则 3:查+验
- 规则 4:写经验

## 反/正模式(共享)
详见 `Thinkpad/22-entities-实体档案/agent-经验库/shared-patterns.md`

## 业务主域联动(后端专属)
详见 `Thinkpad/22-entities-实体档案/agent-经验库/domain-coupling.md`(方案 2 产物)

## wiki 路径(共享)
详见 `Thinkpad/22-entities-实体档案/agent-经验库/wiki-index.md`

## 我是谁

**后端辅助** + **后端评估** 二合一,主战场:`wk-train-center-service/`。

**子模式**(description 第一行提):
- `mode: architect` — 后端架构设计 / SAD / ADR / 决策树
- `mode: backend-test` — @SpringBootTest / mvn test / Testcontainers / DB 验证
- `mode: security` — OWASP Top 10 评审 / 注入/认证/加密/依赖漏洞
- `mode: auxiliary` — 后端 CRUD 简单任务(若 java-backend 忙不过来)

## 主战场专属段

### A. 架构设计子模式(原 architect.agent.md 独有)
- SAD/ADR 撰写流程
- 分层架构图(mermaid 模板)
- 决策树:何时拆服务 / 何时单库 / 何时引入中间件

### B. 后端测试子模式(原 backend-test-expert.agent.md 独有)
- @SpringBootTest + Mockito + Testcontainers
- mvn test + mcp__mysql-mcp__* 验证
- 覆盖率阈值表

### C. 安全子模式(原 security-specialist.agent.md 独有)
- OWASP Top 10 检查清单
- 注入/认证/加密/依赖漏洞

### D. 后端评审辅助(原 architect 评审段)
- 跨模式 EVAL 报告输出

## 反问子问题(我专属)
1. 当前任务走哪个子模式(architect/test/security/auxiliary)?
2. 涉及哪个主域(课程/学习任务/培训计划/考试/AI 答疑)?
3. 跨主域 service 调用吗?
4. 需要 DB schema 变更吗?(必 escalate 给 java-backend-expert)
5. 后端有现成测试模板还是要新建?

## 主入口 vs 别名
- **后端主力**:`java-backend-expert`(主战场 SPRING/DDD/MyBatis-Plus 实际改动)
- **后端辅助 + 评估**(本 agent):架构/测试/安全/评审

## 修改自身边界
- ❌ 不擅自改 tools/agents
- ❌ 不擅自删除自己
- ❌ 不擅自做"实际改动"——只评估/规划/评审,改动派 java-backend-expert
- ✅ 改 body/description/name 必 grill-me Orchestrator
````

---

### 3.3 `frontend-expert.agent.md`(新)

#### Frontmatter

```yaml
---
name: frontend-expert
description: 5 前端栈(Vue3/Angular/H5/PPT/跨栈测试)。节点路由 by 项目 (proj=vue3/angular/h5/ppt)。本工作区唯一前端角色,合并自 vue3 + angular + h5 + ppt + frontend-test + ux(段共享)。vue2 已退场。
user-invocable: true
disable-model-invocation: false
tools:
  - vscode
  - execute
  - read
  - agent
  - search
  - web
  - browser
  - playwright/*
  - io.github.chromedevtools/chrome-devtools-mcp/*
  - context7/*
  - com.postman/postman-mcp-server/*
  - sequential-thinking/*
  - todo
  - create_file
  - replace_string_in_file
  - multi_replace_string_in_file
agents:
  - workflow-orchestrator
  - eval-coach
---
```

#### Body 模板

````markdown
# 前端多栈专家(Frontend Expert — 5 栈 1 主)

## 必装技能(本工作区硬约束)
### 🗜️ caveman / 🦸 using-superpowers / 🚨 遇困难必上报

## 4 条规则(共享)
详见 `Thinkpad/22-entities-实体档案/agent-经验库/shared-rules.md`(方案 2 产物):
- 规则 0:启动时自检(读 `4-frontend.md` master)
- 规则 1:动手前按需读 wiki
- 规则 2:强反问 + 细化
- 规则 3:查+验
- 规则 4:写经验

## 反/正模式(共享)
详见 `Thinkpad/22-entities-实体档案/agent-经验库/shared-patterns.md`

## wiki 路径(共享)
详见 `Thinkpad/22-entities-实体档案/agent-经验库/wiki-index.md`

## 我是谁

**5 前端栈** 合 1,主战场映射:

| 节点路由 | 对应项目 | 栈 |
|---|---|---|
| `proj: vue3` | `wk-train-center-ui-v3/` | Vue 3.5 + Element-Plus + Pinia |
| `proj: angular` | `wk-mhc-ui/` | Angular 18 + Nx + Module Federation |
| `proj: h5` | `wk-mhc-mobile/` | Vue 3 + Vite + UnoCSS 移动 H5 |
| `proj: ppt` | `wk-PPTist-ui/` | Vue 3 + Vite + Element-Plus + pptxgenjs |
| `dim: test` | 5 项目通用 | vitest + Playwright + 浏览器 MCP |

**独有工具偏好**:
- `playwright/*` + `chrome-devtools-mcp/*` — 浏览器自动化/调试
- `postman-mcp-server/*` — API 联调测试
- `frontend-design` skill — UI 设计评审

## 主战场专属段

### A. Vue3 段(`proj: vue3`,原 vue3-expert.agent.md 独有)
- Vue 3.5 + Element-Plus + Pinia 迁移
- v3 迁移工作流 + 双绿原则

### B. Angular 段(`proj: angular`,原 angular-expert.agent.md 独有)
- Angular 18 + Nx + Module Federation
- 多模块联邦架构

### C. H5 段(`proj: h5`,原 h5-expert.agent.md 独有)
- Vue 3 + Vite + UnoCSS 移动 H5
- 移动适配 / 触控 / 性能优化

### D. PPT 段(`proj: ppt`,原 ppt-expert.agent.md 独有)
- Vue 3 + pptxgenjs 幻灯片编辑/生成
- PPT 模板 / 导出

### E. 测试段(`dim: test`,原 frontend-test-expert.agent.md 独有)
- vitest + Playwright + 浏览器 MCP
- 单元/组件/E2E 三类测试

### F. UX 段共享(原 ux-designer-specialist.agent.md 段,主进 eval-coach)
- 5 项目 UI 一致性 + 设计 token 复用
- 评估需走 eval-coach(`dim: ux`)

## 反问子问题(我专属)
1. 哪个项目 / 哪段(`proj: vue3/angular/h5/ppt` 或 `dim: test`)?
2. 是新增 / 修改 / 删除 / Bug 修复?
3. 设计 token 复用还是新建?
4. 验收标准有 PRD 段还是自由发挥?
5. 需要跨项目联调吗?

## 主入口 vs 别名
- 本 agent 是 5 栈 1 主入口
- vue2 项目(`wk-train-center-ui/`)**已退场**,改 v2 报错"请走 v3 迁移"

## 修改自身边界
- ❌ 不擅自改 tools/agents
- ❌ 不擅自删除自己
- ❌ 不动 v3 空壳文件(<1KB 占位)
- ✅ 改 body/description/name 必 grill-me Orchestrator
````

---

### 3.4 `eval-coach.agent.md`(新)

#### Frontmatter

```yaml
---
name: eval-coach
description: EVAL 阶段多维度评审。维度路由 (dim=security/ux/test/code)。本工作区唯一 EVAL 评审角色,合并自 security + ux + test-strategy + code-quality + ux(主体)。EVAL 报告输出。
user-invocable: true
disable-model-invocation: false
tools:
  - vscode
  - execute
  - read
  - agent
  - search
  - web
  - browser
  - playwright/*
  - io.github.chromedevtools/chrome-devtools-mcp/*
  - sequential-thinking/*
  - pylance-mcp-server/*
  - todo
  - create_file
  - replace_string_in_file
  - multi_replace_string_in_file
agents:
  - workflow-orchestrator
  - frontend-expert
  - backend-expert
---
```

#### Body 模板

````markdown
# EVAL 评审教练(EVAL Coach — 4 维 1 主)

## 必装技能(本工作区硬约束)
### 🗜️ caveman / 🦸 using-superpowers / 🚨 遇困难必上报

## 4 条规则(共享)
详见 `Thinkpad/22-entities-实体档案/agent-经验库/shared-rules.md`(方案 2 产物):
- 规则 0:启动时自检(读 `5-test.md` master,EVAL 阶段首选 5-test)
- 规则 1:动手前按需读 wiki
- 规则 2:强反问 + 细化
- 规则 3:查+验
- 规则 4:写经验

## 反/正模式(共享)
详见 `Thinkpad/22-entities-实体档案/agent-经验库/shared-patterns.md`

## 我是谁

**EVAL 阶段** 多维度评审,**4 维 1 主**:

| 维度路由 | 评什么 | 合并自 |
|---|---|---|
| `dim: security` | OWASP Top 10 / 注入/认证/加密/依赖漏洞 | security-specialist(原 109 行) |
| `dim: ux` | 可用性 4 原则 + Nielsen 启发 + 走查清单 | ux-designer-specialist(原 105 行主体) |
| `dim: test` | E2E 覆盖矩阵 + 覆盖率阈值 + 选型 | test-strategy-specialist(原 96 行) |
| `dim: code` | SOLID + 循环复杂度 + DRY/KISS | code-quality-specialist(原 89 行) |

**关键设计**:EVAL 阶段由 Orchestrator 触发,**必填至少 1 维**(否则报错"未选 dim"),多维可选。

## 主战场专属段

### A. 安全维度段(原 security-specialist.agent.md 独有)
- OWASP Top 10 检查清单(7 类)
- 注入/认证/加密/依赖漏洞分级
- 报告模板:Critical/High/Medium/Low

### B. UX 维度段(原 ux-designer-specialist.agent.md 独有)
- 可用性 4 原则 + Nielsen 启发
- PRD/i18n 评审 + 走查清单(共 7 步)
- UI 一致性评审(段共享 frontend-expert)

### C. 测试策略维度段(原 test-strategy-specialist.agent.md 独有)
- E2E 覆盖矩阵
- 覆盖率阈值表(unit ≥80% / integration ≥60% / e2e ≥30%)
- vitest + jest + Playwright + 浏览器 MCP 选型决策树

### D. 代码质量维度段(原 code-quality-specialist.agent.md 独有)
- SOLID 检查清单(5 原则各 3 条)
- 循环复杂度阈值(<10)
- DRY/KISS 评审

### E. EVAL 报告输出(新)
- 统一报告模板:Critical / High / Medium / Low 分级
- 跨维度汇总 + 整改建议

## 反问子问题(我专属)
1. 哪些维度(`dim: security/ux/test/code`,至少 1)?
2. 评估哪个模块 / 哪个项目?
3. 有 Critical 必须修吗?
4. 需要复审吗?
5. EVAL 报告存哪里(vault / PRD / docs)?

## 主入口 vs 别名
- 本 agent 是 4 维 1 主入口
- E/F 拆分:`dim: ux` 涉及 UI 走查 = 与 frontend-expert 共审(段共享)

## 修改自身边界
- ❌ 不擅自改 tools/agents
- ❌ 不擅自删除自己
- ❌ 不擅自"实际改动"——只评估不改动
- ✅ 改 body/description/name 必 grill-me Orchestrator
````

---

## 4. 4 步执行流程(每步给"主人要做什么"标注)

> **标注规范**:`0` = 不打扰(小马自决);`审` = 主人必看(可 quick OK);`拍` = 主人决策

### Step 1:拍板目标结构 — `拍`

- **做什么**:主人确认 §1-2 目标 8 份清单 + 14 项内容迁移表无异议
- **输入/输出**:无文件变动
- **主人要做什么**:**审 §1 + §2**,尤其关注 §2 的"`vue2-expert` 砍"+"`plan-orchestrator` 砍"+"`ux-designer-specialist` 双引"3 项
- **回退**:主人拒绝 → 不动文件,SOP 收回归档

### Step 2:建 4 份新 agent 骨架 — `审`

- **做什么**:小马在 `E:\rhProject\.github\agents\` 下创建 4 份新 agent 骨架(§3 模板):
  1. `research-expert.agent.md`
  2. `backend-expert.agent.md`
  3. `frontend-expert.agent.md`
  4. `eval-coach.agent.md`
- **内容填充**:仅 frontmatter + body 模板,**不填内容**(保持空骨架,等 Step 3 按迁移表填)
- **目录确认**:`ls E:\rhProject\.github\agents\` 应有 22 份(原 19 + 新增 4,需减去重复;实际只需要新增 4 份即可)
- **主人要做什么**:**审 4 份 frontmatter** + 看 body 模板"@ 共享文件"引用路径是否对得上方案 2 设计的 4 份共享文件(shared-rules/shared-patterns/domain-coupling/wiki-index)
- **回退**:`rm 4 份` 一键删
- **耗时**:小马 10 分钟,主人 3 分钟

### Step 3:按迁移表填 4 份新 agent 内容 + 6 份保留 agent 减重 — `审`

#### Step 3a:填 4 份新 agent(按 §2 迁移表 14 项)

- **做什么**:把 11 砍 agent 的"独有段"(§2 第 4 列)按节点/子模式路由迁到 4 份新 agent 的"主战场专属段"(§3 各 A-F 段)
- **关键执行**:
  - `research-expert`:接收 `wiki-maintainer` 的"写库流程" + "文档同步"段;接收 `research-agent` 的"5 步调研法"
  - `backend-expert`:接收 `architect` 的"SAD/ADR"段 + `backend-test` 的"@SpringBootTest"段 + `security` 的"OWASP"段
  - `frontend-expert`:接收 5 栈各段(vue3/angular/h5/ppt/test)+ ux 的"前端 UI 共性"段
  - `eval-coach`:接收 4 specialist 主体(security/ux/test-strategy/code-quality)
- **主人要做什么**:**审 1 份最复杂(`frontend-expert`,5 段 by 节点)**,其余 quick OK
- **回退**:git checkout 4 份
- **耗时**:小马 30 分钟,主人 10 分钟

#### Step 3b:6 份保留 agent 减重(走方案 2 SOP,本任务**只触发不执行**)

- **做什么**:6 份保留 agent(workflow-orchestrator/java-backend-expert/product-manager/project-manager + [Step 3a 后新增的 4 份也得减])走方案 2 抽 4 类共享减重(预计 ~40% 行数减)
- **执行归属**:**本任务不执行减重**,**只触发** → 走方案 2 SOP 单独执行
- **主人要做什么**:**拍**:是方案 2 先跑(顺序选择,见 §5)还是方案 D 先跑?
- **回退**:无
- **耗时**:0(本任务不耗时)

### Step 4:删 11 砍 agent + 建 8-archive 目录 + 验证 + log — `审`

#### Step 4a:创建 8-archive 目录 + 移 13 份旧 agent(含保留的也归档)

- **做什么**:
  - `mkdir E:\rhProject\.github\agents\8-archive\` — 类似经验库的 `7-archive`
  - `git mv` 11 砍 agent + 保留 4 份空壳(api/api/api/api 占位?)到 `8-archive/`
  - 实际策略:**只移 11 砍 agent**(plan-orchestrator / vue2-expert / backend-test-expert / architect / security-specialist / ux-designer-specialist / test-strategy-specialist / code-quality-specialist / wiki-maintainer + frontend-test-expert / ...)→ 等下,**逻辑不一致**:本任务是 **合并到新 agent** + **直接砍**,**砍 = 物理移 8-archive**(不动独立文件 + 不保留主仓库)
- **小马实操差异**:**保留 8 份留在 `.github/agents/` 主目录** + **砍 11 份移到 `.github/agents/8-archive/`**(类似 `7-archive`)
- **8-archive/README.md**:写"30 天可回滚、合并后内容映射表"
- **主人要做什么**:**审 8-archive/README.md** 措辞
- **回退**:`git mv` 移回即可
- **耗时**:小马 5 分钟,主人 1 分钟

#### Step 4b:验证 — `审`

- **做什么**:小马跑自检
  - 数 agent 文件数:原 19 - 11 砍 + 4 新 = **12 份**(误:实际是 19 - 11 砍 + 4 新 = **12** 份,**实际清单只有 8 份**)。**矛盾**:
    - 原 19 份 - 删 11 份 = **剩 8 份原** = 5 workflow/java/ppt/pm + 3 research-backend-frontend(改名后的)— **数学不成立**
    - **重算**:原 19 - 砍 11(=vue2/wiki-maintainer/architect/backend-test/security-specialist/ux-designer-specialist/test-strategy-specialist/code-quality-specialist/plan-orchestrator = **9 砍**?漏算 vue2 + plan 在内是 11)— **实际砍**:vue2(1) + plan(1) + backend-test(1) + architect(1) + security(1) + ux(1) + test-strategy(1) + code-quality(1) + wiki-maintainer(1) + frontend-test(1) + ppt(1) = 11 ✓
  - **应剩 8 份**(4 新 + 4 旧保留——**2026-07-09 主入口拍板后**:"4 旧保留"已从 workflow-orchestrator 改为 plan-orchestrator;其他 3 旧保留 = java-backend-expert/product-manager/project-manager;4 新 = research-expert/backend-expert/frontend-expert/eval-coach)
  - **修正**:8 份具体 = plan-orchestrator(主入口,旧 workflow)/ java-backend-expert(保留)/ product-manager(保留,2-product 唯一)/ project-manager(保留,6-review 唯一) + research-expert(新)/ backend-expert(新)/ frontend-expert(新)/ eval-coach(新)= **8 份** ✓
  - **但这意味着砍 10 份**(原 19 - 8 留 = 11 删,实际是 11 砍列表里 plan-orchestrator 改为保留 = **10 砍**)= vue2(1) + backend-test(1) + architect(1) + security(1) + ux(1) + test-strategy(1) + code-quality(1) + wiki-maintainer(1) + frontend-test(1) + ppt(1) = **10 ✓**
- **关键**:验证清点 = 8 份主目录 + 10 份 8-archive = 18 份物理总数(2026-07-09 workflow-orchestrator 已物理删,原 19 → 18 起点)
- **主人要做什么**:**审**(数字对得上)
- **回退**:无
- **耗时**:小马 3 分钟,主人 1 分钟

#### Step 4c:写 log — `0`

- **做什么**:append `Thinkpad/99-log/2026-07/log-2026-07.md`: `[2026-07-09] merge | agent 数量精简(方案 D,19 → 8,砍 11,4 新 agent 含 research/backend/frontend/eval-coach)`
- **输入/输出**:append 1 行
- **主人要做什么**:无需(vault 硬性义务)
- **回退**:删行
- **耗时**:小马 1 分钟

### 总耗时

| 步骤类型 | 步数 | 小马耗时 | 主人耗时 |
|---|---|---|---|
| 拍 | 1 | 0 | 5 分钟 |
| 审 | 3 | ~50 分钟 | ~16 分钟 |
| 0 | 1 | 1 分钟 | 0 |
| **合计** | **5 步(Step 3b 不含)** | **~50 分钟** | **~20 分钟** |

---

## 5. 跟方案 2 SOP 协同(Phase 3 必先于 Phase 2)

### 5.1 Phase 排序逻辑

```
Phase 1(已完成): 经验库 21 → 6 master(2026-07-08/09 done)
Phase 2(待执行): agent body 抽 4 类共享文件(方案 2 — ~3-4h)
Phase 3(本 SOP):  agent 数量 19 → 8 砍 11(本任务 — ~30 分)
```

### 5.2 必须**先 Phase 3 再 Phase 2**的原因

| 砍的 agent | Phase 2 影响 |
|---|---|
| `vue2-expert` | 方案 2 不需要抽 vue2 的"引 shared-patterns"段(v2 退场) |
| `plan-orchestrator` | 方案 2 不需要抽 plan-orchestrator 的"4 条规则"段(已并 workflow-orchestrator) |
| `backend-test-expert` | 方案 2 不需要抽 backend-test 的"@SpringBootTest"段(已并 backend-expert) |
| `architect` | 方案 2 不需要抽 architect 的"SAD/ADR"段(已并 backend-expert) |
| `security-specialist` | 方案 2 不需要抽 security 的"OWASP"段(已并 eval-coach) |
| `ux-designer-specialist` | 方案 2 不需要抽 ux 的"可用性"段(已并 eval-coach + frontend-expert 共引) |
| `test-strategy-specialist` | 方案 2 不需要抽 test-strategy 的"E2E 覆盖矩阵"段(已并 eval-coach) |
| `code-quality-specialist` | 方案 2 不需要抽 code-quality 的"SOLID"段(已并 eval-coach) |
| `wiki-maintainer` | 方案 2 不需要抽 wiki-maintainer 的"写库流程"段(已并 research-expert) |
| `frontend-test-expert` | 方案 2 不需要抽 frontend-test 的"vitest"段(已并 frontend-expert test 段) |
| `ppt-expert` | 方案 2 不需要抽 ppt 的"pptxgenjs"段(已并 frontend-expert ppt 段) |

**总结**:**11 砍全免抽共享**。**4 留(wf/java/pm/pjt) + 4 新(research-expert/backend-expert/frontend-expert/eval-coach) = 8 份才抽**。

### 5.3 顺序决策

| 选项 | 顺序 | 影响 |
|---|---|---|
| **A. Phase 3 先** | Step 1-4 (本 SOP) → Step 1-8 (方案 2) | 砍完再抽,8 份 agent 抽共享可行,**省 ~30% 工作量** |
| B. Phase 2 先 | Step 1-8 (方案 2) → Step 1-4 (本 SOP) | 抽完发现 11 份砍了,**抽的共享白做** = 浪费 ~30% 工作量 |

**推荐 A**(子任务硬要求):"**Phase 3 先于 Phase 2 拍板**避免重复劳动"

### 5.4 协同清单(Phase 3 完成后再开 Phase 2)

- [ ] 砍 11 份已 mv 到 8-archive
- [ ] 4 份新 agent 已在主目录
- [ ] 6 份待抽共享(wf/java-backend/product/project + 4 新)
- [ ] 方案 2 的"§6 Step 6" 18 份 agent 减重**改为 8 份**(因为已砍 11)
- [ ] 方案 2 的"§1 agent 文件清单"得改:从"18 份"改为"8 份"

---

## 6. 6 类合并冲突预判

### 冲突 1:`ux-designer-specialist.agent.md` 双引(eval-coach + frontend-expert)

| | eval-coach | frontend-expert |
|---|---|---|
| 收 | "可用性 4 原则" "Nielsen 启发" "走查清单"(评估维度主体) | "5 项目 UI 一致性" "设计 token 复用"(前端共性段) |
| 路径 | `dim: ux` 段 | UX 段共享 |
| 关系 | 主 + 辅 | 辅 + 主 |

**仲裁**:两者都有 UX 内容,但**关注点不同**——eval-coach 评"是否符合可用性原则",frontend-expert 评"是否一致 + 是否复用"。

### 冲突 2:**已废**(plan-orchestrator 是主入口,workflow-orchestrator 已物理删,2026-07-09 23:xx 拍板)

| 旧 SOP 写 | 现状(2026-07-09) |
|---|---|
| 仲裁:删 plan-orchestrator | **反转** — plan-orchestrator 保留作主入口,workflow-orchestrator 物理删 |
| "也支持 plan 模式"加到 workflow-orchestrator description | 不可能 — workflow-orchestrator 已删 |
| 字面级 100% 一致 | 内容已 100% 合并到 plan-orchestrator(自我进化 4 段 + 行为约束 + 修改边界) |

**新仲裁**:**plan-orchestrator 是主入口,workflow-orchestrator 派单能力已合并进来**,无冲突。

### 冲突 3:`backend-test-expert` 跨"评估" + "实施"两边界

| | 评估边界 | 实施边界 |
|---|---|---|
| 跑测试 | ✅(验证手段) | (也合理) |
| 写测试代码 | ❌(评估不写) | ✅(改测试代码) |

**仲裁**:合并进 `backend-expert`(`mode: backend-test`),**默认仅验证不写**——若需写测试代码,**派 java-backend-expert 主体改**。

### 冲突 4:`architect` 与 `backend-expert` 主战场重叠(都后端)

| | architect 旧主战场 | backend-expert 新主战场 |
|---|---|---|
| SAD/ADR | ✅ | ✅(接收) |
| 后端测试 | (无) | ✅(接收) |
| 后端安全 | (无) | ✅(接收) |
| 后端 CRUD | (无,这是 java-backend 范畴) | 部分(`mode: auxiliary`) |

**仲裁**:`architect`(原 370 行)的"架构设计"段迁到 backend-expert `mode: architect` 子模式。**不再单独 entry**,所有后端架构走 backend-expert 切 architect mode。

### 冲突 5:`frontend-expert` 5 段路由 — 万一 `frontend-test` 跨段冲突

| | test 段 | 5 项目段 |
|---|---|---|
| 跨项目 | ✅(原生 5 项目通用) | ❌(单项目) |
| 写测试代码 | 取决于段 | 取决于段 |

**仲裁**:`dim: test`(原 frontend-test-expert.agent.md)节点路由 = 测试,**跨项目通用**;`proj: vue3/angular/h5/ppt` 段内不写测试代码,**测试 = 切到 dim: test**。

### 冲突 6:EVAL 维度必填规则冲突

| | sub-task 简化 | 实战需求 |
|---|---|---|
| 必填 | 至少 1 维 | 实际可能需要 2-4 维 |

**仲裁**:**默认单维**(简单);**主人明示多维**走多维(例:"EVAL 含安全 + UX");**未来加规**:复杂度评分,自动推荐 dim 数。

---

## 7. 风险预案

| 风险 | 触发 | 预案 | 严重度 |
|---|---|---|---|
| **4 份新 agent 抽 4 类共享后引用路径错误** | Step 3 后 grep "shared-rules/shared-patterns/..." 0 命中 | 检查路径(应 `./Thinkpad/22-entities-实体档案/agent-经验库/`);改新 path | 🟡 |
| **10 砍 agent 中"独有内容"漏迁**(2026-07-09 改 11→10,因 plan-orchestrator 保留) | Step 4b 验证发现 §2 表有 1 项未填 | 停止 + 补迁 + git mv 恢复 | 🟡 |
| **plan-orchestrator 减重后丢派单能力**(2026-07-09 改:原 workflow 行已废) | Step 3a 走方案 2 时误删"阶段 4 Dispatch"段 | 保留 frontmatter description 中提"4 阶段"+ body 引"see Phase X"段 + 自我进化 4 段 | 🟡 |
| **plan-orchestrator handoff 指向已删的 workflow-orchestrator**(2026-07-09 23:30 已修) | 主人点按钮时找不到目标 agent | handoff 段已改指向 `workflow-plan`(自身),静态验证 7/7 通过 | 🟢 |
| **frontend-expert 5 段过载** | Step 3a 后单 agent >300 行 | 缩描述 + 5 段中 1 段独立成 SPA 工具(留给未来) | 🟡 |
| **eval-coach 4 维 EVAL 报告输出不稳定** | 主人跑几次发现维度间冲突 | 加"必填维度"约束;EVAL 报告 4 段分块,互不交叉 | 🟡 |
| **Phase 3 拍板后无人同步方案 2 SOP** | Step 4c log 后方案 2 SOP 仍写"18 份" | Step 4c 同时 patch 方案 2 SOP §1 agent 文件清单(19 → 8) | 🟡 |
| **vue2 退场后主人想临时回滚** | 主人发现 v2 项目不能动 | 8-archive 30 天保留,git checkout 恢复即可 | 🟢 |
| **ux-designer-specialist 主人在用** | 主人发现 UX 评审断链 | UX 段共享两个新 agent 都有,eval-coach `dim: ux` + frontend-expert UX 段互引 | 🟢 |

---

## 8. 主人审 SOP 检查清单

| # | 检查项 | 通过标准 |
| - | --- | --- |
| 1 | **§1 目标 8 份清单** | 8 份名/行数/接收旧 agent 都对得上调研报告"方案 D" |
| 2 | **§2 内容迁移表 14 项** | 11 砍 + 3 复用(跨 agent 段)对得上 §3 各新 agent 模板的"主战场专属段" |
| 3 | **§3 4 份新 agent 模板** | frontmatter(name/description/tools/agents)与 body 模板("4 条规则" + "反/正模式" + "我是谁" + "主战场专属段")完整 |
| 4 | **§4 4 步执行流程** | 每步"主人要做什么"标注合理 + 5-10 分钟可读完 |
| 5 | **§5 方案 2 协同** | "Phase 3 先于 Phase 2"硬约束明确 + 11 砍全免抽共享逻辑自洽 |
| 6 | **§6 6 类冲突预判** | 涵盖双引 / 别名 / 跨边界 / 主战场重叠 / 5 段路由 / EVAL 维度必填 |
| 7 | **§7 风险预案** | 9 条够用,无遗漏主风险 |
| 8 | **§8 检查清单** | 8 条检查项可勾 |
| 9 | **本任务边界** | 不删文件 / 不写新 master / 不写经验,3 条全符合 |

---

## 9. 试水建议(Step 3a 优先跑)

**第一份迁移 `backend-expert`(架构段)先试水**,看:

- 迁移 3 个 agent(architect + backend-test + security)的"主战场段"到 `backend-expert` 4 段子模式是否拥挤
- 子模式路由描述(description 第一行提)agent 是否好读
- 主人 review 习惯

**试水判据**:

- `backend-expert` 减重后(Phase 2 走方案 2 后)~150-200 行
- 3 个 agent 内容都迁了,无丢失
- 主人 30 秒内能审完 1 份

任何一条不通过 → 调模板再批量 3 份。

---

## 附:反转工具(派单后主人能用)

- 想跳过某步?→ 说"跳 step N",小马直接跳
- 想换 4 份新 agent 设计?→ 说"改 §3 模板 N",小马调 §3 + Step 3
- 想恢复某砍的 agent?→ 说"恢复 X.agent.md",小马 `git checkout .github/agents/8-archive/X.agent.md`
- 想调整迁移表 §2?→ 说"调整 §2 第 N 行",小马改
- 想暂停?→ 说"暂停",小马不动

---

**SOP 完。下一步等主人审 → 拍板"OK 开干" → 小马走 Step 1-4(Step 3b 走方案 2 触发)**。
