# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 跨模块硬约束（每次会话必看）

> 改业务代码前必须读 `.claude/projects/E--rhProject/memory/` 下的相关笔记。

| 主域 | 必查联动域 | 关键笔记 |
|---|---|---|
| 课程 | 学习任务、培训计划、统计、AI 答疑 | `domain-coupling-course-study-task` |
| 学习任务 | 课程、培训计划、AI 答疑 | `domain-coupling-course-study-task` |
| 培训计划 | 学习任务、课程、考试 | `domain-coupling-course-study-task` |
| 考试 | 培训计划、用户、权限 | `domain-overview` |
| AI 答疑 | 课程（学习记录）、培训计划（节点） | `domain-coupling-course-study-task` |

**改动流程**（详见 memory 笔记 `workflow-cross-module-check`）：

1. 读 `domain-overview` 定位域
2. 读对应 `domain-coupling-*` 笔记查耦合点
3. 列影响清单（后端/Vue2/Vue3/H5/DB/Wiki）给用户确认
4. 改完跑 `verify:chinese` + `mvn compile` + `npm run typecheck`

**禁止**：跳过"列影响清单"直接改代码；删除 `el_training_record` 字段；改节点枚举不通知 AI 模块。

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

- **Project wiki:** `.cursor/wiki/INDEX.md` - Entry point for business/architecture docs
- **Backend rules:** `wk-train-center-service/.qoder/rules/` - DDD, API, database conventions
- **Frontend rules:** `wk-train-center-ui/.qoder/rules/` - Vue 2.7, component, state conventions
- **Version docs:** `wk-train-center-service/documents/` - Per-version implementation docs

When working on business logic, module boundaries, or API contracts, consult `.cursor/wiki/INDEX.md` first.

## Chinese Encoding Guard

This project has scripts to prevent UTF-8 encoding corruption for Chinese text:

- **Rule:** `.cursor/rules/subagent-chinese-verify.mdc`
- **Hook:** `.cursor/hooks/subagent-verify-chinese.mjs`
- **Skill:** `.cursor/skills/chinese-encoding-guard/SKILL.md`

Run `npm run verify:chinese` before builds to catch encoding issues.

## Skills Available

The project has custom skills in `.cursor/skills/` and `.qoder/skills/`:

- `ddd-analysis`, `ddd-backend-design`, `ddd-implementation-flow` - DDD modeling workflows
- `backend-code-review`, `backend-unit-test-gen` - Backend quality tools
- `chinese-encoding-guard` - UTF-8 encoding verification
- `rh-project-wiki` - Project wiki navigation

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
