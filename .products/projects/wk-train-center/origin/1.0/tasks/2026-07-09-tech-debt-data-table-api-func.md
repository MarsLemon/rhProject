---
version: 1.0.0
project: wk-train-center
scope: wk-train-center-ui (Vue 2.7 + Element UI 2.15.14 + Vuex 3)
type: tech-debt
severity: P2 (基础性,但不改不影响功能)
status: draft
date: 2026-07-09
owners:
  - 主人
relatedScan: 2026-07-09 agent 扫描报告 (类 C-1 + 类 D-5 合并)
relatedDecisions:
  - .products/projects/wk-train-center/docs/decisions/
---

# wk-train-center-ui 技术债:消除 DataTable 内联 URL + API 函数化

> 状态: draft
> Owner: 主人
> 关联扫描: 2026-07-09 vue3-expert 全仓扫描 (类 C-1 + 类 D-5 合并产物)
> 范围: `E:/rhProject/wk-train-center-ui/` (Vue 2 + Element UI)
> 关联代码仓: 后端 `E:/rhProject/wk-train-center-service/` 不涉及,本 spec 仅前端

---

## 1. Problem Statement

**核心问题**:DataTable 组件(被 admin 后台 10+ 页面共依赖)目前通过 `options.delete.url / listUrl / stateUrl / multiActions[].url` **字符串字段**消费 API 路径;但前端 `src/api/` 下每个业务域其实都已经定义好了具名函数(例 `src/api/sys/user/user.js` 导出 `updateData / saveData / fetchDetail / fetchPaging`)。结果是:

- 25 个 .vue 文件、38+ 处 `url: '/api/...'` 字面量硬编码,**完全绕过 `src/api/` 封装**
- 后端改一次路径要 `git grep "/api/sys/user"` 全仓手动同步,极易漏改
- IDE 无法做引用追踪 / 重命名,新人 onboarding 看不懂"DataTable 里那个 url 字符串到底是哪个后端 endpoint"
- `src/api/` 下 18 个 api 文件存在,但实际**只被少量非 DataTable 页面消费**,DataTable 系列页面是 API 封装的最大盲区
 
**影响人群**:wk-train-center-ui 全栈前端开发者(主人 + 后端协作者)
**成本**:
- 单次后端路径重构需前端 1-2 小时全仓 grep + 测试回归
- 新人理解"为什么 DataTable 配置不直接 import api 函数"需 30-60 分钟
- 未来若引入 TypeScript / OpenAPI 自动生成,这套 url 字符串生态将是最大迁移阻力

---

## 2. Goals

| # | 目标 | 可度量 |
|---|------|--------|
| G1 | **零内联 URL**:DataTable 系列页面不再含 `url: '/api/...'` 字面量 | `git grep -nE "url:\s*'/api" src/views/` 返回 0 条 |
| G2 | **DataTable 函数化**:DataTable 支持 `deleteApi / listApi / multiActionApis` 函数 prop,保留字符串 url 作为 v1 → v2 过渡期兼容 | 1 个 PR 完成迁移,DataTable 调用点 25 处全部可使用函数 |
| G3 | **API 工厂落地**:抽 `src/api/_factory/crud.js`,暴露 `createCrudApi(prefix)` 工厂,`src/api/sys/user/user.js` 等存量 18 个文件自愿迁或不迁(不强制,以免 scope creep) | factory 单元测试通过,user/plan/course 3 个模块优先迁移 |
| G4 | **下游消费方零侵入**:后端路径变更时,前端只改 `src/api/` 下对应文件 1 处 | 验证案例:把 `/api/sys/user/delete` 改成 `/api/sys/user/v2/delete`,DataTable 调用点零改动 |

---

## 3. Non-Goals

| # | 不做 | 理由 |
|---|------|------|
| NG1 | **强制迁移所有 18 个 api 文件到 factory 模式** | scope 过大,且现有具名函数签名已经稳定;owner 自愿迁 |
| NG2 | **TypeScript 化或 OpenAPI 自动生成** | 引入类型系统是另一个独立 spec;本次只解决运行时路径耦合 |
| NG3 | **DataTable UI 行为变更**(列宽/排序/筛选) | 本次只动 props API,不重构 template/script 行为 |
| NG4 | **后端路由变更** | 后端按需自行调整,本 spec 只保证前端改一处即生效 |
| NG5 | **Vue 3 / v3 仓同步** | v3 仓是 Element Plus + script-setup,问题不同;另起 spec |

---

## 4. User Stories

按优先级排序(对应 P0 → P2):

### US-1 (P0) — 主人视角
> **As a** 主人(项目 owner)
> **I want** 后端路径变更时,前端只改 `src/api/` 一个文件
> **So that** 不用 `git grep` 全仓找 url 字符串,也避免漏改导致线上 404

### US-2 (P0) — 前端开发者视角
> **As a** 前端开发者
> **I want** DataTable 接收 `deleteApi: () => apiDeleteUser` 这种函数 prop
> **So that** IDE 能跳转、重命名友好、新人能看懂调用关系

### US-3 (P1) — 架构维护视角
> **As a** 架构师 / 项目 owner
> **I want** 抽 `createCrudApi(prefix)` 工厂,默认提供 CRUD 5 个方法
> **So that** 新建业务模块(如 `src/api/sys/foo/foo.js`)不必再 copy-paste 5 遍 post + url

### US-4 (P1) — 测试视角
> **As a** 测试 / QA
> **I want** `src/api/_factory/crud.js` 有单元测试,确保 5 个方法签名/错误处理一致
> **So that** 未来重构工厂不会静默破坏业务调用

### US-5 (P2) — 边缘案例
> **As a** 还在用 `url: '/api/...'` 字符串的页面
> **I want** DataTable v1 字符串 prop 仍能工作(deprecated 但不报错)
> **So that** 本次迁移期间老的页面不强制同步改,避免一次性 PR 过大

---

## 5. Requirements

### P0 — Must Have(无此则 spec 不成立)

#### REQ-P0-1:DataTable 新增函数 prop
- **现状**:`options.delete.url / listUrl / stateUrl / multiActions[].url` 接收字符串
- **改造**:
  - `options.delete.api?: (data: object) => Promise` (优先于 `url`)
  - `options.listApi?: (data: object) => Promise` (优先于 `listUrl`)
  - `options.stateApi?: (data: object) => Promise` (优先于 `stateUrl`)
  - `options.multiActions[].api?: (data: object) => Promise` (优先于 `url`)
- **行为**:函数存在 → 调函数;函数不存在 → fallback 到旧 url 字段(给 US-5 留口子)
- **代码位置**:`src/components/ComponentsBase/ComponentsTable/DataTable/useTableActions.js`(推测,落 spec 前需 Read 验证)

#### REQ-P0-2:抽样迁移 3 个业务模块
- 选 **user / plan / course** 3 个最高频模块,改 .vue 调用方走函数 prop
- 涉及文件(基于 2026-07-09 扫描):
  - `src/views/admin/sys/user/index.vue` L195/199/205/211/218/225 → 7 处 url
  - `src/views/admin/plan/plan/index.vue` L191/202/209 → 3 处 url
  - `src/views/admin/course/index.vue` L127/137/143 → 3 处 url
- **产出**:`git grep -nE "url:\s*'/api" src/views/admin/sys/user/ src/views/admin/plan/ src/views/admin/course/` 在迁移完成后返回 0 条

#### REQ-P0-3:CRUD 工厂落地
- 新文件 `src/api/_factory/crud.js`
- API:`createCrudApi(prefix, options?) => { fetchDetail, fetchPaging, saveData, deleteData, updateState }`
- options 支持 `method`(默认 post)、`deleteMethod`(默认 post,部分接口用 delete)
- **示例**:`createCrudApi('/api/sys/foo')` 等价于
  ```js
  export const fetchDetail = (id) => post('/api/sys/foo/detail', { id })
  export const fetchPaging = (data) => post('/api/sys/foo/paging', data)
  export const saveData = (data) => post('/api/sys/foo/save', data)
  export const deleteData = (data) => post('/api/sys/foo/delete', data)
  export const updateState = (data) => post('/api/sys/foo/state', data)
  ```

### P1 — Should Have(应做,但可分批)

#### REQ-P1-1:DataTable 字符串 url prop 标记 deprecated
- 在 DataTable.vue 文件头 JSDoc 加 `@deprecated` 注释(自 v1.0.0 起,计划 v2.0.0 移除)
- 现有 38 处调用方不强制立即迁移(给团队 1 个迭代缓冲)
- 不引入 `console.warn`(避免刷屏,以后用 lint 规则统一治理)

#### REQ-P1-2:CRUD 工厂单元测试
- `tests/unit/api/crud-factory.spec.js`(Jest)
- 覆盖:5 个方法签名、传参透传、错误处理(网络错误 → reject)
- 用 `jest.mock('@/utils/request')` mock 掉真实请求

#### REQ-P1-3:其它 22 个 .vue 文件全量迁移
- 本次 spec 完成 P0 的 3 个模块后,其余 22 个文件分散在后续迭代
- 每个迭代迁移 5-8 个文件,跟踪记录到本 spec 的 `## Changelog` 章节

### P2 — Future Considerations(本次不做,但要预留口子)

#### REQ-P2-1:ESLint 自定义规则
- 加 `no-inline-api-url` 规则,扫到 `url: '/api/...'` 直接报 error
- 本次**不实现**,只在本 spec 设计时考虑 factory 函数 prop 形状与 lint 规则兼容

#### REQ-P2-2:DataTable 字符串 url prop 完全移除
- v2.0.0 删除 `url / listUrl / stateUrl`,只留 `api / listApi / stateApi`
- 在 P0 + P1 全量迁移完成后,单独发 deprecation 公告

#### REQ-P2-3:TypeScript / OpenAPI 自动生成
- v3 仓已经用 TS,可参考;v2 仓技术债另立 spec

---

## 6. Acceptance Criteria

### Given/When/Then

```
Given 后端路径 /api/sys/user/delete 重命名为 /api/sys/user/v2/delete
And 前端 src/api/sys/user/user.js 的 deleteData 函数已改为 post('/api/sys/user/v2/delete', data)
When 我 grep "url: '/api/sys/user" src/views/admin/sys/user/index.vue
Then 应该返回 0 条匹配(DataTable 走函数 prop,不依赖字面量)

Given 主人新建业务模块 src/api/sys/foo/foo.js
When 我用 createCrudApi('/api/sys/foo') 创建 5 个 CRUD 方法
Then 这 5 个方法应能直接 import 给 DataTable 用,无需手写
```

### 清单 checklist

**P0 验收**:
- [ ] `src/api/_factory/crud.js` 文件存在,导出 `createCrudApi`
- [ ] `tests/unit/api/crud-factory.spec.js` 文件存在并通过
- [ ] `src/views/admin/sys/user/index.vue` 0 处 url 字面量
- [ ] `src/views/admin/plan/plan/index.vue` 0 处 url 字面量
- [ ] `src/views/admin/course/index.vue` 0 处 url 字面量
- [ ] `src/components/ComponentsBase/ComponentsTable/DataTable/DataTable.vue` 支持 `api / listApi / stateApi` 函数 prop
- [ ] `useTableActions.js` 优先用函数 prop,fallback 到字符串 url

**P1 验收**:
- [ ] DataTable.vue 文件头 JSDoc 标注 `@deprecated url / listUrl / stateUrl`
- [ ] 3 个抽样模块的 .vue 文件能在浏览器跑通(主人手动验证)

**不应发生 (negative)**:
- [ ] DataTable 调用方改用函数 prop 后,不能出现新的 console error
- [ ] 字符串 url prop 不能被悄悄移除(还在 v1 兼容期)
- [ ] 不能影响非 DataTable 系列页面(如 search 表单、直调 api 函数的地方)

---

## 7. Success Metrics

### Leading(launch 后 1-2 周可观察)

| 指标 | 目标 |
|------|------|
| `git grep -nE "url:\s*'/api" src/views/` 命中数 | 从 38 处降至 ≤ 13 处(P0 3 模块归零后) |
| CRUD 工厂新建业务模块平均时间 | ≤ 5 分钟(对比 copy-paste 5 个 post 函数 ~20 分钟) |
| 新人 PR review 中"url 字符串"反馈次数 | ≤ 1 次/迭代 |

### Lagging(launch 后 1-3 月观察)

| 指标 | 目标 |
|------|------|
| 后端路径变更 → 前端全量同步耗时 | 从 ~2 小时降至 ≤ 15 分钟 |
| DataTable 系列页面 bug 数 | 比上一迭代下降 20%(函数化后行为更可预测) |

### 衡量方法

- `git grep` 命令 + 写一个 `scripts/check-inline-api-url.sh`,加到 CI
- PR review 用 `code-review` skill 跑 `git diff` 检查
- 季度统计看 `git log --diff-filter=M -- src/api/_factory/` 的采纳速度

---

## 8. Open Questions

| # | 问题 | 需要谁回答 | 阻塞? |
|---|------|-----------|-------|
| Q1 | `useTableActions.js` 里 `url` 字段是直接 `post(url, data)` 还是有统一 `http({ url, method, data })` 包装? | frontend-expert | 否(spec 时 Read 验证即可) |
| Q2 | CRUD 工厂的 `method` 默认值是 post 还是按 RESTful 分(delete 用 delete、put 用 put)? | 主人 + frontend-expert | 是 — 影响工厂 API 设计 |
| Q3 | 抽样选 user/plan/course 这 3 个模块,是不是过度了?要不要先只迁 1 个做 pilot? | 主人 | 否 — 但影响 PR size |
| Q4 | DataTable 文件头 `@deprecated` 注释是否需要同步在 `console.warn` 里提示?(本 spec 倾向不,改用 lint) | frontend-expert | 否 |
| Q5 | `src/api/_factory/` 路径名带 `_` 前缀,符合仓库 `src/api/` 现有命名吗?(现有是 `ability/ai/course/...` 都不带下划线) | 主人 | 否,只是目录位置决策 |

> **备注**:Q2 是设计核心问题,启动实施前必须确认;Q3 是 PR size 决策;其它可以在实施期间回答。

---

## 9. Timeline / Phasing

| 阶段 | 周期 | 产出 |
|------|------|------|
| **Phase 0:验证 + 拍板** | T+0 ~ T+1 天 | 主人答 Q2/Q3;frontend-expert 答 Q1/Q4/Q5;本文档 v1.1.0 |
| **Phase 1:CRUD 工厂 + 单元测试** | T+2 ~ T+3 天 | `src/api/_factory/crud.js` + `tests/unit/api/crud-factory.spec.js` |
| **Phase 2:DataTable 函数 prop** | T+4 ~ T+5 天 | DataTable.vue 支持 api/listApi/stateApi;旧 url 字段保留兼容 |
| **Phase 3:抽样迁移 3 模块** | T+6 ~ T+8 天 | user/plan/course 模块 .vue 改函数 prop,`git grep` 命中数 -13 |
| **Phase 4:回归 + 浏览器验证** | T+9 ~ T+10 天 | 主人手动验证 admin 后台相关页面,无新 console error |
| **Phase 5:文档 + changelog** | T+11 天 | 本 spec `## Changelog` 写 v1.0.0 → v1.1.0;`.products/projects/wk-train-center/changelog.md` 加一条 |

**总耗时估算**:11 天 (~2 周 1 人)
**Hard deadline**:无 — 本 spec 是 P2 技术债,可与 R2 / 其它需求并行

---

## 10. Risks & Mitigations

| 风险 | 等级 | 缓解 |
|------|------|------|
| DataTable 是 10+ 页面共依赖,改 prop API 影响面广 | 高 | 保留旧 url 字段 fallback;3 模块抽样验证后才全面推广 |
| 字符串 url prop 保留期太长导致 deprecation 失效 | 中 | P1-3 在 changelog 写明 v2.0.0 移除时间,CI 加 lint rule 倒逼 |
| CRUD 工厂错误处理与现有不一致(如错误弹窗样式) | 中 | factory 不强制统一错误处理,业务文件可包一层 try-catch |
| 后端临时改路径不通知前端 | 低 | 文档化约定;CI 加 API path 校验脚本(独立 spec) |
| v2 仓(vue3)有类似问题,本次不处理成长期债务 | 低 | v3 仓新立 spec;v2 spec 中留交叉引用 |

---

## 11. Changelog

- **2026-07-09 v1.0.0** — 初稿;基于 2026-07-09 vue3-expert 扫描报告 (类 C-1 + 类 D-5 合并);owner = 主人;status = draft

---

## 12. References

- **关联扫描**:2026-07-09 全仓 vue3-expert 报告 (类 C-1:25 vue 文件 38 处 url 字面量;类 D-5:DataTable 透传 url 字符串,组件耦合 API 层路径)
- **关键文件**:
  - `E:/rhProject/wk-train-center-ui/src/components/ComponentsBase/ComponentsTable/DataTable/DataTable.vue` — 改造主体(L168-203 props 定义)
  - `E:/rhProject/wk-train-center-ui/src/views/admin/sys/user/index.vue` — 抽样 L195/199/205/211/218/225
  - `E:/rhProject/wk-train-center-ui/src/views/admin/plan/plan/index.vue` — 抽样 L191/202/209
  - `E:/rhProject/wk-train-center-ui/src/views/admin/course/index.vue` — 抽样 L127/137/143
  - `E:/rhProject/wk-train-center-ui/src/api/sys/user/user.js` — 已存具名函数,可被函数 prop 消费
  - `E:/rhProject/wk-train-center-ui/src/api/_factory/crud.js` — 新建(待办)
- **PRD**:`.products/projects/wk-train-center/docs/PRD.md`(本 spec 是技术债类,产品层 PRD 不受影响)
- **架构决策**:见 `.products/projects/wk-train-center/docs/decisions/`
