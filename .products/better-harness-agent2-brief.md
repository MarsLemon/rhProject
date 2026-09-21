# Agent 2: 软件流利度评估简报

## 范围与历史边界

- **目标仓库**: `e:\rhProject`（多项目 monorepo）
- **窗口**: 30 天（2026-07-04 ~ 2026-08-03）
- **历史置信度**: high（147 commits / 312 changed files）
- **贡献者**: Claude, Hermes Agent, MarsLemon（3 个 owner）
- **子项目**: wk-mhc-ui (Angular/Nx, 370 文件), wk-mhc-mobile (Vue 3, 213 文件), wk-train-center-service (Spring Boot, 176 文件), wk-PPTist-ui (101 文件)
- **语言分布**: TypeScript (580), Vue (200), Java (176), JavaScript (61), Python (11)
- **核心变更热点**: AI 对话服务链路（ReAct 主循环、百炼 API 调用、前端聊天组件）

---

## 一、Context Map（上下文地图）

### 子指标评估

| 子指标 | 证据等级 | 说明 |
|--------|----------|------|
| 任务入口 | 部分/声明式 | 工作区根无 AGENTS.md / CLAUDE.md / .cursorrules；入口依赖 `start.ps1` 脚本 |
| 上下文与边界图 | 部分/可运行 | `wk-train-center-service/AGENTS.md`（250 行，含 DDD 三层架构规范、SQL 治理规范）质量较高；`wk-mhc-ui/AGENTS.md` 仅含 Nx 通用指南 |
| 风险与下一步路由 | 部分/声明式 | `.qoder/rules/` 含架构、命名、API 设计等规范目录；`.github/agents/` 含 20+ 专家 agent 定义（部分已 disabled）；`.claude/agents/` 含 7 个 agent |

### 关键发现

- 工作区根缺少统一项目指引文件，agent 需自行推断 monorepo 结构与子项目边界
- `wk-train-center-service/AGENTS.md` 是最高质量的上下文文件，包含完整 DDD 三层规范、数据流图、SQL 资产治理规范
- `.github/agents/` 存在大量 disabled agent（accessibility, devops, i18n, performance），表明曾经尝试建立完整 agent 矩阵但未持续维护

---

## 二、Environment Readiness（环境就绪度）

### 子指标评估

| 子指标 | 证据等级 | 说明 |
|--------|----------|------|
| 环境入口 | 可运行基线 | `start.ps1`（361 行）：端口检测、hosts 检查、Windows Terminal 集成、6 个服务一键启动 |
| 运行与诊断命令面 | 部分/可运行 | 各子项目有独立 `npm run dev` / `mvn spring-boot:run`；无统一 `doctor` 或健康检查命令 |
| 状态重置与隔离 | 部分/声明式 | `wk-mhc-ui` 有 `nx reset`；`start.ps1` 有端口清理逻辑；无数据库/Redis 重置脚本 |

### 关键发现

- `start.ps1` 是亮点：自动检测 6 个端口占用、提供清理、支持 Windows Terminal Tab 式启动或独立窗口降级
- 环境配置分散：`wk-mhc-mobile/.env.development` 含远程 API 地址（dev/test/staging/uat 多环境），但无本地 mock 全栈方案
- Docker 支持不完整：`wk-mhc-ui/Dockerfile` 仅 6 行且只服务 trade-center；`compose.yml` 仅含一个服务
- 后端依赖外部基础设施（MySQL、Redis），但无容器化开发环境配置

---

## 三、Fast Feedback（快速反馈）

### 子指标评估

| 子指标 | 证据等级 | 说明 |
|--------|----------|------|
| 验证信号层 | 部分/声明式 | 存在 lint、type-check、build 层；测试层极度薄弱 |
| 信号速度与可操作性 | 部分/可运行 | GitLab CI 做 affected lint+build；本地无全量一键测试 |
| 受影响检查路由 | 不可用 | 无工作区级 test runner；无 affected test 路由 |

### 测试覆盖实况

| 子项目 | 测试框架 | 实际测试文件数 | 热点路径覆盖 |
|--------|----------|---------------|-------------|
| wk-mhc-ui | Jest (Nx 集成) | 5 个 spec 文件（排除 node_modules） | 无 AI 聊天相关测试 |
| wk-mhc-mobile | Vitest + happy-dom | 1 个 spec 文件 (`useMarkdown.spec.ts`) | 无聊天组件测试 |
| wk-train-center-service | JUnit (Maven) | 15 个 Java 测试（集中在 yf-module-plan, yf-module-system） | **AI 模块 (wk-module-ai) 零测试** |
| wk-PPTist-ui | 无 | 0 | N/A |

### 关键发现

- **核心热点路径（AI ReAct 循环 1064 行）完全无测试保护**——这是 30 天内最高频变更的代码路径
- `wk-mhc-ui` 的 `pre-commit` hook 中 `npx lint-staged` 被注释掉，lint-staged 配置存在但未执行
- 工作区根 `package.json` 的 `scripts` 为空对象——无统一测试、构建、lint 入口

---

## 四、Quality Gates（质量门禁）

### 子指标评估

| 子指标 | 证据等级 | 说明 |
|--------|----------|------|
| 规则覆盖 | 部分/声明式 | ESLint 规则存在但宽松；SQL 治理规范严格但手动 |
| 门禁强度 | 部分/可运行 | GitLab CI affected lint+build；pre-push lint；commitlint |
| 规则修复路径 | 部分/声明式 | `lint:fix` 脚本存在；SQL 有 lint-report.md 和自动化脚本 |

### 关键发现

- `wk-mhc-ui` ESLint 关闭了多个严格规则：`no-unused-vars`, `no-empty-function`, `@typescript-eslint/no-explicit-any` 全部 off
- `wk-mhc-ui` 的 `@nx/enforce-module-boundaries` 是有效的架构约束（scope:app 只能依赖 scope:lib）
- SQL 治理规范是亮点：头部 8 字段、版本化目录、自动索引生成、lint 报告——但仅靠 agent 自审和人工 DBA 把关
- commitlint 在 wk-mhc-ui 配置了 conventional commits，但 wk-mhc-mobile 无此约束
- 多个 `.disabled` agent 文件表明质量门禁曾扩展但被收缩

---

## 五、Change Safety（变更安全）

### 子指标评估

| 子指标 | 证据等级 | 说明 |
|--------|----------|------|
| Agent 生命周期护栏 | 部分/声明式 | 多 agent 定义但无执行约束证据；git history 显示修复式提交模式 |
| 合并验收路径 | 部分/可运行 | GitLab CI MR 触发 lint+build；无 test gate |
| 副作用/权限/恢复边界 | 部分/声明式 | 紧急修复提交（7f3c46c 多角色权限止血）表明生产问题存在；无自动化回滚 |

### 关键发现

- 30 天历史中有多个"紧急止血"类提交（`7f3c46c fix(rbac): 修复多角色数据权限反转的紧急止血问题`），表明变更安全网不足
- AI 模块结构在 30 天内经历了重大重构（`cb5ce6f` 合并 voice/vision 到 ai 模块），但无回归测试
- `AgentReActExecutorImpl.java`（1064 行）是单一 `@Component`，承载双 API 路径（Chat Completions + Responses）、工具执行、历史压缩、文件处理——变更影响面极大
- SQL 变更有版本化治理但无自动化迁移验证（如 Flyway/Liquibase）

---

## 可观测性路由（跨切面）

### AI 对话链路可观测性

**证据来源**: `wk-module-ai/application/react/` 目录

- **可发现**: ✅ 日志使用 `@Slf4j`，带 `[ReAct]`, `[BailianChat]`, `[BailianResponses]` 等前缀标签
- **可读**: ✅ 日志含 `requestId` 贯穿全链路，可关联单次请求的所有日志
- **可关联**: ✅ 日志含 `dashScopeRequestId`、token 统计、工具调用信息
- **可验证**: ❌ 无结构化日志/指标导出证据；日志仅 `log.info/warn/error/debug`，无 metrics
- **安全可逆**: ✅ 客户端中断有优雅处理（`isClientAbort` 检测 + 干净退出）

**映射**: 可观测性证据主要映射到 Fast Feedback（信号可操作性）和 Change Safety（故障诊断能力）。日志质量较高但缺乏结构化 sink 和告警集成。

---

## 最强能力

1. **`start.ps1` 一键启动脚本**：端口检测、hosts 校验、Windows Terminal 集成、服务编排——环境就绪度在同级项目中属上乘
2. **`wk-train-center-service/AGENTS.md`**：DDD 三层架构规范 + SQL 治理规范，为 agent 提供清晰的开发约束和边界
3. **GitLab CI affected 管线**：MR 触发、`nx affected` 增量 lint+build，避免全量构建浪费
4. **AI 链路日志**：requestId 贯穿、分阶段标签、客户端中断优雅处理——为调试提供了基本可观测性

---

## 核心风险

1. **AI ReAct 主循环（1064 行）零测试**：双 API 路径、工具执行、历史压缩、文件处理全部无测试保护，且为 30 天最高频变更路径
2. **工作区级协调缺失**：无根 AGENTS.md、无统一 test/build 脚本、无 docker-compose 全栈环境
3. **pre-commit hook 被禁用**：`wk-mhc-ui` 的 lint-staged 被注释，提交时不做任何代码质量检查
4. **变更安全网薄弱**：紧急止血提交模式表明问题在发布后才被发现；无自动化回归测试 gate

---

## Owner 引用

| Owner | 子项目 | 关注点 |
|-------|--------|--------|
| wk-train-center-service | 后端 AI 模块 | ReAct 执行器测试覆盖、DDD 架构合规 |
| wk-mhc-ui | 前端 Angular | Nx 模块边界、lint 规则收紧、pre-commit 恢复 |
| wk-mhc-mobile | 前端 Vue 3 | 测试基础设施搭建、聊天组件测试 |
| 工作区根 | 全局 | 统一 AGENTS.md、test runner、docker-compose |
| SQL 治理 | 数据库 | SQL 迁移自动化验证（Flyway/Liquibase） |

---

## 缺失证据

- 无法验证：CI 管线是否实际通过（无 CI 状态 badge 或历史记录）
- 无法验证：运行时行为、生产环境稳定性、错误率
- 无法验证：`npm ci` / `mvn install` 是否在当前环境成功执行
- 无法验证：agent 定义文件是否被实际加载和遵守
- 无法验证：数据库迁移是否在生产执行过

---

## 潜在发现

### 发现 1：AI ReAct 核心路径（1064 行单文件）零测试保护

`AgentReActExecutorImpl.java` 承载了整个 AI 对话的核心逻辑——双 API 路由决策（Chat Completions vs Responses）、工具注册与执行、历史消息压缩、文件摘要、多模态消息构建。该文件在 30 天窗口内是最高频变更路径的核心，但 `wk-module-ai` 目录下没有任何测试文件。任何对该文件的修改（如新增工具、调整路由条件、修改历史压缩策略）都没有自动化手段验证其行为正确性，完全依赖人工测试或生产环境发现问题。

**后果**: 修改该文件引入回归时，无快速反馈机制捕获；问题可能在生产环境以"AI 回复异常"形式暴露，难以定位。
**证据**: `wk-train-center-service/wk-modules/wk-module-ai/src/test/` 目录不存在；15 个 Java 测试全在 `yf-modules` 下。
**不确定性**: 可能存在未纳入 git 的集成测试或手动测试清单。

### 发现 2：工作区根缺乏统一项目指引与协调机制

1051 个追踪文件、5 个活跃子项目、3 种技术栈（Angular、Vue 3、Spring Boot），但工作区根没有 AGENTS.md 或任何指引文件告诉 agent（或新成员）：项目整体架构是什么、子项目间如何关联、变更一个子项目时需要注意哪些其他子项目。`package.json` 的 `scripts` 为空，无统一 test/build/lint 入口。

**后果**: Agent 需要自行探索并推断 monorepo 结构，容易遗漏跨子项目依赖（如前端 AI 组件与后端 AI 模块的接口契约）。
**证据**: 根 `package.json` scripts 为空；根目录无 AGENTS.md / CLAUDE.md；`start.ps1` 是唯一跨项目协调文件但仅做启动不做验证。
**不确定性**: 团队可能通过口头或其他渠道（非代码仓）传达项目结构知识。

### 发现 3：wk-mhc-ui pre-commit hook 被禁用，lint-staged 形同虚设

`wk-mhc-ui/.husky/pre-commit` 中 `npx lint-staged` 被注释掉。`package.json` 配置了完整的 lint-staged 规则（`.ts` → eslint+prettier, `.html`/`.json` → prettier），但这些规则在提交时不会执行。ESLint 本身也关闭了 `no-unused-vars`、`no-explicit-any` 等关键规则。

**后果**: 代码质量退化在提交时不被拦截；`no-explicit-any: off` 在 Angular/TypeScript 项目中尤其危险，可能导致类型安全漏洞。
**证据**: `.husky/pre-commit` 第 4 行 `# npx lint-staged` 被注释；`eslint.config.js` 第 41-47 行关闭严格规则。
**不确定性**: 团队可能有意禁用以提高开发速度，依赖 CI 阶段检查。

### 发现 4：变更安全网薄弱——紧急止血提交模式暗示问题后置发现

30 天历史中出现多个"紧急止血"类提交（如 `7f3c46c fix(rbac): 修复多角色数据权限反转的紧急止血问题`、`cd6e5af fix(user-sync): 修复用户同步问题，禁用用户全链路隔离`），表明部分问题在生产或 UAT 环境才被发现。GitLab CI 仅做 lint+build 不做 test gate；即使有测试，wk-train-center-service 的 AI 模块也无测试可执行。

**后果**: 高风险变更（如权限系统、用户同步）缺少自动化验收手段；每次修复可能引入新的未检测回归。
**证据**: git log 中 `fix` 类提交含"紧急"、"止血"等关键词；CI 配置无 test 阶段；AI 模块零测试。
**不确定性**: 可能存在手动回归测试清单或 QA 人工验证流程。

---

## Lead 不得基于本证据做出的声明

1. **不得声明**"项目没有测试"——wk-train-center-service 有 15 个 Java 测试，wk-mhc-ui 有 5 个 spec 文件，只是热点路径未覆盖
2. **不得声明**"CI 管线不工作"——GitLab CI 配置存在且逻辑合理，只是无法验证其实际执行状态
3. **不得声明**"agent 定义文件无用"——声明式指引的价值在于意图传达，无法从静态证据证明其是否被遵守
4. **不得声明**"start.ps1 保证环境可运行"——它只做启动和端口检查，不验证数据库连接、API 可达性或依赖服务状态
5. **不得声明**"日志质量好等于可观测性成熟"——日志是必要条件但非充分条件，缺乏 metrics、tracing、告警集成等结构化可观测性支柱
6. **不得给出最终严重性评分、修复建议或改进路线图**——这些属于 Lead 的判断范围
