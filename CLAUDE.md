# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 跨模块硬约束（每次会话必看）

> 改业务代码前必须读 `.claude/projects/E--rhProject/memory/` 下的相关笔记 + 看本节“AI 工具生态”、“临时文件归档”、“AI 产出物规范”三条硬约束。

### 1. 业务主域联动

| 主域 | 必查联动域 | 关键笔记 |
|---|---|---|
| 课程 | 学习任务、培训计划、统计、AI 答疑 | `domain-coupling-course-study-task` |
| 学习任务 | 课程、培训计划、AI 答疑 | `domain-coupling-course-study-task` |
| 培训计划 | 学习任务、课程、考试 | `domain-coupling-course-study-task` |
| 考试 | 培训计划、用户、权限 | `domain-overview` |
| AI 答疑 | 课程（学习记录）、培训计划（节点） | `domain-coupling-course-study-task` |

### 2. AI 工具生态（本轮新增，2026-06-11 起强制）

本工作区由 3 个 IDE（Claude / Cursor / Qoder）共享 1 套 skill 源，方案 A。

| 项 | 事实 |
|---|---|
| 单一源 | `C:\Users\RUHAI\.ai-skills-store\`（**唯一修改入口**）|
| 共享方式 | 3 个 IDE 的 8 个核心 skill + 9 个非核心容器目录 = **junction** 指向单源（共 24 条 junction）|
| 8 个核心 skill | review、grill-me、pixpin-desktop-screenshots、browse、context-restore、using-superpowers、brainstorming、health |
| 9 个非核心 skill | public-video-rights-cn、self-improving-agent、idea-workflow、feynman-summary、smart-summarize、superpowers-zh、repomix、agent-browser、tokscale（**容器**，子 skill 由 hermes `os.walk(followlinks=True)` 递归发现；35 个子 skill 中 `brainstorming-zh` / `using-superpowers-zh` 为重命名避免冲突） |
| 改 skill 内容 | **直接在 `.ai-skills-store` 改** → 3 个 IDE 自动同步 |
| 禁止 | 在 `.claude\skills`、`.cursor\skills`、`.qoder\skills` 直接改这 8 个核心 skill（改动会被 junction 屏蔽或不生效）|
| 55 个 0 频通用型 skill | 已从 `.claude\skills` 移到收纳盒 `zero-freq-skills-2026-06-11\`（`.cursor` `.qoder` 原本就没有 0 频）——3 个 IDE 现各剩 8 核心 junction + 9 非核心 junction + 1 元数据文件（_SKILL-INDEX.md） |
| 索引 | `.ai-skills-store\_SKILL-INDEX.md` 写明每个 skill 的频次和用途 |
| .ai-skills-store 纯净性 | 只含 8 核心 + 9 个白名单非核心容器（32 MB，2026-06-13），不含 gstack/test-driven-development 等非核心杂物 |
| 备份 | `.claude\.cursor\.qoder\skills` 8 个原文件夹完整备份在 `C:\Users\RUHAI\Desktop\_private_assistant_archive\ide-skill-backup-2026-06-11\` |

**2026-06-11 skill-link 落锁事件**（防回归已就位）：

| 项 | 状态 |
|---|---|
| `skills-link@1.3.0` (npm) | **已卸载**（`npm uninstall -g skills-link`，82 个包清掉）|
| `~/.agents/skills/` (34 个 skill) | **整目录归档**到 `_private_assistant_archive\2026-06-11\old-skill-link-stuff\.agents\`（可逆）|
| `~/.cc-switch/` skill 同步 | **已关**：`skillSyncMethod: "auto" → "manual"`，`skillStorageLocation: "unified" → "local"` |
| `~/.claude/skills/` `~/.cursor/skills/` `~/.qoder/skills/` 30 个被劫持 symlink | **已清** + 补回 6 个 grill-me/review junction |
| 防回归脚本 | `E:\rhProject\scripts\verify-skills.mjs`（`npm run verify:skills` 触发，CI/手动）|
| 防回归 hook | `E:\rhProject\scripts\hooks\guard-skills-write.mjs`（已配 `~/.claude/settings.json` 的 PreToolUse）|

### 2.5 代码情报资源（rhproject-codebase-intel，本轮新增 2026-06-12 起强制）

rhProject 已预处理两份"代码情报"资源，**改业务代码前必须先加载 skill 再动键盘**。

| 资源 | 路径 | 角色 | 形态 |
|---|---|---|---|
| **Qoder Wiki** | `<子项目>/.qoder/repowiki/zh/content/*.md` | 业务字典 — 讲"做什么" | 597 份 markdown（16.2 MB） |
| **知识图谱** | `<子项目>/.understand-anything/knowledge-graph.json` | 代码地图 — 讲"怎么连" | 节点/边/分层 JSON（54 MB） |
| **kg_query.py** | `<子项目>/.understand-anything/kg_query.py` | 查询 CLI（**必须走它，别直接读 JSON**） | 6 命令：stats / find / deps / rdeps / layer / tour |

**强制加载规则**（违反 = 跳过此步直接改代码）：

1. **涉及以下任一子项目的业务代码改动 / 调试 / 排查** → 改前 `skill_view(name='rhproject-codebase-intel')` 加载 skill，按其 8 步标准动作执行：
   - `wk-train-center-service`（后端，6199 节点）
   - `wk-train-center-ui`（前端 Vue 2.7，2447 节点）
   - `wk-train-center-ui-v3`（Vue 3，**无 repowiki**，走 `.cursor/wiki/` 或现读代码）
   - `wk-PPTist-ui`（PPT 编辑器，575 节点）
   - `wk-mhc-ui` / `wk-mhc-mobile`（Angular / 移动，mobile 有 100 文档 repowiki）

2. **改前必查**：`python .understand-anything/kg_query.py rdeps "<要改的文件>"` 拿到影响面
3. **跨子项目改动**：根目录 `.understand-anything/knowledge-graph.json` 是合并视图（9663 节点）
4. **不加载的代价**：14 个 SQL + 5 个 Java 实体的速读成本，1 份 repowiki 文档就能省掉

**正确叫法**（避免记忆混乱）：
- ✅ `.understand-anything`（不是 `.under-stand`）
- ✅ `.qoder/repowiki/`（Qoder 生成的业务 wiki）
- ❌ 不要再说 "repowiki 图谱" / "under-stand 文档"

**已知盲区**：
- `wk-train-center-ui-v3` 和 `wk-mhc-ui` 没有 Qoder repowiki，skill 里有降级路径
- 知识图谱是**静态 import 关系**，动态反射 / AOP 不会出现在 rdeps
- 改动后若发现 repowiki/kg 与实际代码对不上 → 提醒用户跑 `kg_update.py` 重新分析

### 3. 临时文件归档（本轮新增）

| 项 | 路径 |
|---|---|
| 收纳盒 | `C:\Users\RUHAI\Desktop\_private_assistant_archive\` |
| 临时文件归宿 | 凡是"暂存、待观察、不直接删"的文件都进这里 |
| 已收纳 | 11 个根目录临时文件 + `.docker` + 24 个 IDE skill 原文件夹 + 333 KB `java_error_in_idea_13556.log` + 66 张调试截图（`tempImg-2026-06-11\`）+ 55 个 0 频 skill（`zero-freq-skills-2026-06-11\`）+ 3 个 AI 临时脚本（`ai-scratch-scripts\2026-06-10\`）+ 4 个动作脚本 |
| 调试截图 | `E:\rhProject\tempImg\` 下 png **全部归档不删**（可能还要回溯看）|
| 禁止 | 直接删 `C:\Users\RUHAI\` 下任何 `.` 前缀的工具/历史目录——**先归档再观察** |

### 4. 改动流程（强化版）

详见 memory 笔记 `workflow-cross-module-check`：

1. 读 `domain-overview` 定位业务域
2. 读对应 `domain-coupling-*` 笔记查耦合点
3. 查 `.ai-skills-store` 看是否要联动改 skill
4. 列影响清单（后端 / Vue2 / Vue3 / H5 / DB / Wiki / AI 工具）给用户确认
5. 改完跑 `verify:chinese` + `mvn compile` + `npm run typecheck`
6. 涉及 8 个核心 skill 改动 → **在 `.ai-skills-store` 改**，**不在 3 个 IDE 改**

**禁止**：
- 跳过"列影响清单"直接改代码
- 删除 `el_training_record` 字段
- 改节点枚举不通知 AI 模块
- 在 3 个 IDE 的 skills 目录直接改 8 个核心 skill
- 直接删 `C:\Users\RUHAI\` 下任何 `.` 前缀的工具/历史目录
- 重新安装 `skills-link`（已卸载）或绕过 Claude 自行操作 skill

### 5. AI 产出物存放规范（本轮新增）

AI（3 个 IDE 中任何一个）产出的临时文件**禁止散落在项目根目录**。

| 类型 | 存放位置 | 示例 |
|---|---|---|
| 临时调试/验证脚本（.py/.ps1/.cmd/.bat） | 收纳盒 `ai-scratch-scripts\{YYYY-MM-DD}\` | `adjust_template.py`、`check_template.py` |
| 批量动作脚本（phase 系列） | 收纳盒根目录 `_run-*` | `_run-2026-06-11-phase5.ps1` |
| 调试截图 | `E:\rhProject\tempImg\`（已有规范） | PixPin 截图、QA 截图 |
| 崩溃日志（hs_err_pid*.log / debug.log） | 收纳盒 `crash-logs\{YYYY-MM-DD}\` | JVM OOM 日志、Chrome crashpad 日志 |
| 可复用工具脚本 | `E:\rhProject\scripts\` | `show-my-desktop.ps1`、`audit-cursor-skills.mjs` |

**禁止**：
- 在 `E:\rhProject\` 根目录直接创建 .py / .ps1 / .cmd / .bat / .log 文件（`start.ps1`、`CLAUDE.md`、项目配置除外）
- 在工作区任意子模块根目录散落 AI 调试产物
- 发现 `hs_err_pid*.log` / `debug.log` 留在工作区或桌面——立即归档到收纳盒

### 6. 技能运维（本轮新增，2026-06-11 起强制）

**Claude 全权接管 skill 管理**，禁止用户/其他工具绕过 Claude 直接操作。

| 操作 | 入口 | 备注 |
|---|---|---|
| 新增 skill | 对 Claude 说"加 skill xxx" | Claude 评估 + 列影响清单 + 用户确认后建到 `.ai-skills-store/` 并自动建 junction |
| 删除 skill | 对 Claude 说"删 skill xxx" | Claude 评估是否在用 + 用户确认后清 3 个 IDE 的 symlink + 归档源 |
| 升级 skill | 对 Claude 说"升级 skill xxx" | Claude 跑 `git pull` 之类更新 + 重新建 junction |
| 检查 skill 健康 | `npm run verify:skills` | 跑 `verify-skills.mjs`，3 IDE + npm + cc-switch 全检 |
| 排查劫持 | 跑 `verify-skills` 看 FAIL 行 | 命中即 Claude 代为清理 |

**禁止**：
- 用 Cursor/Qoder 自带的 skill 商店或 sync 工具（会破坏方案A）
- 用 `skillhub` CLI 操作（独立生态，与 `.ai-skills-store` 无关）
- 跑 `skills-link` / `npm i -g skills-link`（已废）
- 在 `~/.cc-switch/settings.json` 改回 `skillSyncMethod: "auto"`（会被 hook 拦）

## Project Overview

This is a multi-project monorepo for an intelligent training system (智能培训系统). The main projects are:

| Directory | Description | Tech Stack |
|-----------|-------------|------------|
| `wk-train-center-service` | Java backend | Spring Boot 3.2, DDD, MyBatis-Plus, Shiro |
| `wk-train-center-ui` | Vue 2 admin + student frontend | Vue 2.7, Element-UI, Vuex, Vue CLI |
| `wk-train-center-ui-v3` | Vue 3 migration | Vue 3.5, Element-Plus, Pinia, Vite, TypeScript |
| `wk-PPTist-ui` | PPT/AIPPT application | Vue 3, TypeScript, Vite |
| `wk-mhc-ui` | Portal frontend (Angular) | Angular 18, Nx monorepo, Module Federation |
| `wk-mhc-mobile` | Mobile frontend | (check project for details) |

## Build & Development Commands

### Backend (wk-train-center-service)

```bash
# Build all modules
mvn clean compile

# Build without tests
mvn clean compile -DskipTests

# Run tests
mvn test

# Package
mvn clean package -DskipTests

# Run application (from yf-web module)
java -jar yf-web/target/yf-exam-server.jar
```

**Requirements:** JDK 17+, Maven 3.6+, MySQL 8.0+, Redis 6.0+

### Vue 2 Frontend (wk-train-center-ui)

```bash
cd wk-train-center-ui

# Development
npm run dev

# Build for different environments
npm run build:dev    # development
npm run build:fat    # staging
npm run build:uat    # UAT
npm run build:pro    # production

# Lint & format
npm run lint
npm run format
```

**Requirements:** Node.js 14+ (uses legacy OpenSSL provider)

### Vue 3 Frontend (wk-train-center-ui-v3)

```bash
cd wk-train-center-ui-v3

# Development
npm run dev

# Build
npm run build

# Type check
npm run typecheck

# Verify Chinese encoding (runs before build)
npm run verify:chinese
```

**Requirements:** Node.js 18+, npm 9+

### PPT Application (wk-PPTist-ui)

```bash
cd wk-PPTist-ui

npm run dev        # Development
npm run build      # Production build
npm run type-check # TypeScript check
npm run lint       # ESLint
```

### Angular Portal (wk-mhc-ui)

```bash
cd wk-mhc-ui

npm run start      # Development server
npm run build      # Production build
npm run lint       # Lint all apps
npm run format:fix # Format code
```

**Requirements:** Node.js 20+, npm 10+

### Monorepo Scripts (root)

```bash
# Chinese encoding verification
npm run verify:chinese        # Gate: verify v3 src + Cursor metadata
npm run scan:chinese          # Full monorepo scan
npm run fix:encoding          # Repair encoding issues
npm run repair:chinese-from-v2 # Destructive: Vue2 template overwrite

# Wiki sync
npm run sync:wiki             # Sync Cursor wiki index
```

## Architecture

### Backend: DDD Layered Architecture

```
Controller → Application → Service → Domain
                      ↓
Infrastructure → Repository ← Domain
```

| Layer | Responsibility | Forbidden |
|-------|---------------|-----------|
| Controller | Receive requests, call Application | Business logic |
| Application | Transactions, DTO conversion | Domain logic |
| Service | Core business logic | Direct DB operations |
| Domain | Business rules (pure) | External dependencies |
| Repository | Data access interface | Implementation logic |
| Infrastructure | Repository implementation, Mapper | Business logic |

**Key constraint:** Never skip layers. Controller must not call Repository directly.

### Frontend: Vue 2.7 (wk-train-center-ui)

- **MUST use Options API** - Composition API and `<script setup>` are forbidden
- Vue CLI 4.x project structure
- Element-UI 2.x components
- Vuex 3.x for state management

### API Response Codes

| Code | Meaning | Frontend Action |
|------|---------|-----------------|
| 0 | Success | Return data |
| '00000000' | Success (legacy) | Old system only |
| 400 | Parameter error | `Notification.warn` |
| 401 | Not logged in | Redirect to login |
| 403 | No permission | Show no permission |
| 10010002 | Login timeout | Redirect to login |
| 500 | System error | `Notification.error` |

## Documentation Structure

- **项目 wiki**：`E:\rhProject\.cursor\wiki\INDEX.md` - 业务/架构文档入口
- **后端 rules**：`wk-train-center-service/.qoder/rules/` - DDD、API、数据库规范
- **前端 rules**：`wk-train-center-ui/.qoder/rules/` - Vue 2.7、组件、状态规范
- **版本文档**：`wk-train-center-service/documents/` - 每个版本的实现文档
- **AI skill 单源**：`C:\Users\RUHAI\.ai-skills-store\_SKILL-INDEX.md` - 8 个核心 skill 索引
- **临时文件收纳盒**：`C:\Users\RUHAI\Desktop\_private_assistant_archive\` - 归档但保留的临时文件

涉及业务逻辑、模块边界、API 契约时，先查 `.cursor/wiki/INDEX.md`。

## Chinese Encoding Guard

This project has scripts to prevent UTF-8 encoding corruption for Chinese text:

- **Rule:** `.cursor/rules/subagent-chinese-verify.mdc`
- **Hook:** `.cursor/hooks/subagent-verify-chinese.mjs`
- **Skill:** `.cursor/skills/chinese-encoding-guard/SKILL.md`

Run `npm run verify:chinese` before builds to catch encoding issues.

## Skills Available

本工作区由 3 个 IDE 共享 1 套 skill 源（详见上文"AI 工具生态"硬约束）。

**8 个核心 skill**（`C:\Users\RUHAI\.ai-skills-store\` 单源，3 个 IDE 通过 junction 共享）：
- review - PR 落地前审查
- using-superpowers - 发现与使用 skills
- browse - QA 测试无头浏览器
- brainstorming - 创造性工作前探索
- context-restore - 恢复 context-save
- health - 代码质量看板
- grill-me - 持续追问直至共识
- pixpin-desktop-screenshots - 读取 Windows 桌面截图

**9 个非核心 skill 容器**（`scripts/verify-skills.mjs` 的 `NON_CORE_JUNCTIONS` 白名单，2026-06-13 批次新增 8 个）：
- public-video-rights-cn - 公网视频版权风险判定框架（6/12）
- self-improving-agent - 自我反思/学习日志到 `.learnings/`
- idea-workflow - 4 子 skill: idea-superpowers-suite(总入口) / -to-design-doc / -to-implementation-doc / -to-ui-design-brief
- feynman-summary - 费曼技巧摘要
- smart-summarize - 9 子 skill: auto/adler/sq3r/cornell/feynman/concept-map/condense/retrieval/spaced
- superpowers-zh - superpowers 完整汉化（20 子 skill，其中 2 个 `-zh` 后缀）
- repomix - CLI 引导(把整个仓库打包给 LLM 看, npm 已装 v1.14.1)
- agent-browser - CLI 引导(多步浏览器自动化, npm 已装 v0.27.0)
- tokscale - CLI 引导(多 AI CLI token 用量仪表盘, 本机未装,网络被拦)

**项目自带的业务 skill**（`E:\rhProject\.cursor\skills\`、`.qoder\skills\` 各自独立，未收编到 .ai-skills-store）：
- `ddd-analysis`、`ddd-backend-design`、`ddd-implementation-flow` - DDD 建模工作流
- `backend-code-review`、`backend-unit-test-gen` - 后端质量工具
- `chinese-encoding-guard` - UTF-8 编码验证
- `rh-project-wiki` - 项目 wiki 导航

**plugin 自带**（不在 skills 目录，plugin 系统管理）：
- superpowers（systematic-debugging、writing-plans 等）— 2026-06-13 已在 `settings.json` 禁掉，**改用 superpowers-zh 容器里的中文版**
- understand-anything（understand、understand-dashboard 等）
- frontend-design、skill-creator 等

## Key Conventions

### Naming

| Context | Style |
|---------|-------|
| Frontend variables/functions | camelCase |
| Frontend constants | camelCase (Vuex mutations: UPPER_SNAKE) |
| Backend constants | UPPER_SNAKE |
| Java classes | PascalCase |
| Database tables/columns | snake_case |

### Response Structure (Backend)

All APIs must return `Result<T>`:

```java
@PostMapping("/save")
public Result<Void> save(@Valid @RequestBody UserCommand cmd) {
    userAppService.create(cmd);
    return Result.ok();
}
```

### Parameter Validation (Backend)

All request bodies must use `@Valid` annotation for validation.
