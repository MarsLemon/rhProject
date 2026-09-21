# AGENTS.md — 工作区任务-规则路由表

> 本文件为 AI Agent 提供任务类型到规范规则的路由索引。
> 当接收到开发任务时，根据任务类型自动加载对应规则。

---

## 1. 始终加载的规则（trigger: always）

以下核心规则在每次会话中自动生效，无需手动引用：

| 规则文件 | 路径 | 说明 |
|---------|------|------|
| AI 编码原则 | `.qoder/rules/principles/AI_Coding_Principles.md` | 企业级人机协作全链路原则 |
| 开发需求规范 | `.qoder/rules/core/requirements-spec.zh-CN.md` | 13 条核心编码规则（完整性、复用、依赖管理） |
| 工作流规范 | `.qoder/rules/core/workflow-spec.zh-CN.md` | 12 条工作流规则（分支、审查、发布） |
| 命名约定 | `.qoder/rules/core/naming-conventions.zh-CN.md` | 12 条命名约定（变量、函数、类、文件） |
| 规范索引 | `.qoder/rules/core/spec-index.zh-CN.md` | 规范套件中心控制文件 |
| API 设计规范 | `.qoder/rules/architecture/api-design-spec.zh-CN.md` | RESTful 接口设计约定 |
| 阿里云 AI 架构 | `.qoder/rules/architecture/alibaba-cloud-ai-spec.zh-CN.md` | 通义千问/DashVector/PAI 等 AI 服务规范 |
| SQL 治理规范 | `.qoder/rules/process/sql-governance.zh-CN.md` | SQL 资产头部 8 字段 + 结构 4 条 |
| Git 工作流 | `.qoder/rules/process/git-workflow-spec.zh-CN.md` | 分支策略、提交规范、合并流程 |

---

## 2. 任务-规则路由表

根据任务类型，按需加载对应规则（trigger: manual，需 `@` 引用）：

### 2.1 后端开发（Java / Spring Boot）

| 任务场景 | 推荐规则 |
|---------|---------|
| 新建 Controller/Service/Repository | `@core/requirements-spec.zh-CN.md` + `@core/naming-conventions.zh-CN.md` |
| API 接口设计 | `@architecture/api-design-spec.zh-CN.md` |
| 数据库 SQL 变更 | `@process/sql-governance.zh-CN.md` |
| 阿里云 AI 服务集成 | `@architecture/alibaba-cloud-ai-spec.zh-CN.md` |
| DDD 分层架构（train-center） | 参考 `wk-train-center-service/AGENTS.md` |

### 2.2 前端开发（Vue / Angular）

| 任务场景 | 推荐规则 |
|---------|---------|
| 组件开发 | `@core/naming-conventions.zh-CN.md` + `@quality/testing-spec.zh-CN.md` |
| 安全相关（XSS/CSRF） | `@quality/security-spec.zh-CN.md` |
| 错误处理 | `@quality/error-handling-spec.zh-CN.md` |
| Nx 工作区（wk-mhc-ui） | 参考 `wk-mhc-ui/AGENTS.md` |

### 2.3 测试与质量

| 任务场景 | 推荐规则 |
|---------|---------|
| 编写单元测试 | `@quality/testing-spec.zh-CN.md` |
| 安全审计 | `@quality/security-spec.zh-CN.md` |
| 异常处理改造 | `@quality/error-handling-spec.zh-CN.md` |

### 2.4 运维与部署

| 任务场景 | 推荐规则 |
|---------|---------|
| 部署配置 | `@operations/deployment-spec.zh-CN.md` |
| Git 分支/提交 | `@process/git-workflow-spec.zh-CN.md` |

### 2.5 SDLC 角色提示词

角色级指导位于 `.qoder/rules/sdlc/prompts/`，按角色按需引用：

| 角色 | 文件 |
|------|------|
| 架构师 | `@sdlc/prompts/architect.md` |
| 后端开发 | `@sdlc/prompts/backend-developer.md` |
| 后端组长 | `@sdlc/prompts/backend-lead.md` |
| 前端开发 | `@sdlc/prompts/frontend-developer.md` |
| 前端组长 | `@sdlc/prompts/frontend-lead.md` |
| 测试工程师 | `@sdlc/prompts/qa-engineer.md` |
| 运维工程师 | `@sdlc/prompts/devops-engineer.md` |
| 产品经理 | `@sdlc/prompts/product-manager.md` |
| 项目经理 | `@sdlc/prompts/project-manager.md` |
| 安全专家 | `@sdlc/prompts/security-expert.md` |
| 反思者 | `@sdlc/prompts/reflector.md` |

---

## 3. 子项目专属指南

| 子项目 | AGENTS.md | 说明 |
|--------|-----------|------|
| wk-train-center-service | `wk-train-center-service/AGENTS.md` | DDD 三层架构 + SQL 治理 |
| wk-mhc-ui | `wk-mhc-ui/AGENTS.md` | Nx 工作区指南 |

---

## 4. CTO 画布与 Demo 资料状态

### 4.1 CTO 画布（`.qoder/rules/cto/`）— 📦 存档

CTO 目录下的文件为历史参考资料，非活跃规则，不参与自动加载。

| 文件 | 状态 | 说明 |
|------|------|------|
| `cto-canvas.html` | 📦 存档 | 企业 AI 编码辅助资料清单画布（A3） |
| `cto-ai-coding-cheatsheet-canvas.html` | 📦 存档 | AI 编码速查表画布 |
| `cto-copilot-metrics-canvas.html` | 📦 存档 | Copilot 指标画布 |
| `cto-copilot-metrics-dashboard.html` | 📦 存档 | Copilot 指标仪表盘 |
| `employee-ai-coding-practice-canvas.html` | 📦 存档 | 员工 AI 编码实践画布 |
| `bu-step1-pilot-canvas.html` | 📦 存档 | BU 推广 Step1 试点画布 |
| `bu-step2-rollout-canvas.html` | 📦 存档 | BU 推广 Step2 推广画布 |
| `bu-step3-mature-canvas.html` | 📦 存档 | BU 推广 Step3 成熟画布 |

### 4.2 Demo 资料（`.qoder/rules/demo/`）— 📦 存档

Demo 目录为灵码（Lingma）集成演示材料，非活跃规则。

| 子目录 | 状态 | 说明 |
|--------|------|------|
| `lingma-instructions/` | 📦 存档 | 灵码 Instructions 配置演示（Roadmap + Prompts） |
| `lingma-knowledge/` | 📦 存档 | 灵码知识库演示（Badge/Form 组件知识） |
| `lingma-memory/` | 📦 存档 | 灵码 Memory 系统演示 |

> **如需激活**：将对应文件移出 `cto/` 或 `demo/`，添加 `trigger: always` 或 `trigger: manual` frontmatter，放入对应规则分类目录即可。

---

## 5. 规则触发配置说明

| trigger 值 | 行为 |
|-----------|------|
| `always` | 每次 AI 会话自动加载，无需手动引用 |
| `manual` | 需要用户或 Agent 通过 `@路径` 显式引用 |

**配置位置**：每个 `.md` 规则文件顶部的 YAML frontmatter：

```yaml
---
trigger: always          # always | manual
description: 可选说明     # 描述何时自动加载
---
```

---

## 6. 快速命令参考

```bash
# 查看所有 always 规则
grep -rl "trigger: always" .qoder/rules/

# 查看所有 manual 规则
grep -rl "trigger: manual" .qoder/rules/

# 查看规则统计
find .qoder/rules -name "*.md" | wc -l
```
