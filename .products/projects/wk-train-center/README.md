# wk-train-center(产品层主项目)

> **产品代号**:wk-train-center
> **职责**:跨代码仓的产品需求、用户故事、决策、变更日志
> **Owner**:产品经理 agent
> **最后更新**:2026-07-22(版本归集)

---

## 当前状态

| 维度         | 值                                                             |
| ------------ | -------------------------------------------------------------- |
| 当前发布版本 | `mobile1.1`(已发)                                            |
| 当前开发版本 | `mobile1.2`(在途)                                            |
| 主仓 git     | wk-train-center-service:`local/mobile1.2/fix`                |
| 同期前端仓   | wk-train-center-ui:`local/mobile1.2/fix`                     |
| 移动端仓     | wk-mhc-mobile:`train/mobile-v1.1/dev` ⚠️ 跟后端 1.2 不同步 |

> ⚠️ 2026-07-22 摸底发现:**wk-mhc-mobile 实际在 mobile-v1.1**,主人说"current 是 mobile1.2"是训中心仓的口径。后续 wk-mhc-mobile 切 1.2 需主人单独确认。

## 文档结构(2026-07-22 归集后)

```
wk-train-center/
├── README.md                       # 本文件
├── PRD.md → docs/PRD.md           # 产品需求文档(跨版本,留根)
├── changelog.md → docs/changelog.md
├── design/                         # 短期:按版本归集
│   ├── README.md                   # 🆕 命名规则 + 索引
│   ├── mobile1.1/
│   │   └── 2026-07-14-self-ai-gateway(claude)/   # 7-14 self-ai-gateway 完整设计包
│   ├── mobile1.2/
│   │   └── 2026-07-15-student-frontend-migration(claude).md
│   └── _legacy/                    # 7-14 之前的散落设计(暂存,后续归档判定)
│       └── 2026-07-14-self-ai-gateway(qoder)/
├── docs/                           # 长期:跨版本产物,留根
│   ├── PRD.md
│   ├── changelog.md
│   ├── architecture/               # 架构文档
│   ├── decisions/                  # ADR
│   └── user-stories/               # 用户故事
├── iterations/                     # 短期:按版本归集
│   └── README.md                   # 🆕 命名规则(空目录,等填)
├── plans/                           # 后续项目计划统一入口
│   └── README.md                   # 计划命名、版本归集与写作规范
├── reviews/                        # 短期:按版本归集
│   ├── README.md                   # 🆕 命名规则 + 归集判定原则
│   ├── mobile1.1/                  # 7-15 ~ 7-17 评审
│   ├── mobile1.2/                  # 7-22 评审
│   └── _archive/                   # 7-10 之前历史
└── tasks/                          # 短期:按版本归集
    ├── README.md                   # 🆕 命名规则
    ├── task_plan.md                # 跨版本调研产物
    ├── mobile1.1/                  # 7-17 起,AI 模块改造 7 任务
    ├── mobile1.2/                  # 7-14 起,自建 AI 网关统一计划
    └── 2026-07-09-tech-debt-*.{md,json}   # 留根(待主人 confirm 归 mobile1.2)
```

---

## 命名规范(主人 2026-07-22 拍板)

### 版本子目录命名

| 节奏                | 子目录命名                         | 示例                  | Git 分支                  |
| ------------------- | ---------------------------------- | --------------------- | ------------------------- |
| PC/web 端           | `1.x/`                           | `tasks/1.2/`        | `local/1.2/dev`         |
| **Mobile 端** | **`mobile1.x/`(无连字符)** | `tasks/mobile1.2/`  | `local/mobile-v1.2/dev` |
| 旧/历史             | `_archive/`                      | `reviews/_archive/` | 任意                      |
| 跨版本/长期         | 留根                               | `docs/PRD.md`       | —                        |

**禁用**:

- ❌ `mobile-1.x/`(db/ 老命名,2026-07-22 改完)
- ❌ `mobile-v1.x/`(只用于 Git 分支)
- ❌ `v1.x/`(VERSION_GUIDE 老规范,已废)

### 归集判定原则(给 reviews/tasks/design 写)

> 同一时间窗口 → 一个版本
> 主体归属 = 子仓 `git branch --show-current` 在该窗口的实际值

具体:

- 7-15 ~ 7-17 期间 wk-train-center-service 是 `local/mobile-v1.1/dev` → 归 `mobile1.1/`
- 7-22 起 wk-train-center-service 切到 `local/mobile1.2/fix` → 归 `mobile1.2/`
- 跨多版本的整体性任务 → 跟当前版本走
- 时间线判定不确定 → 留根,主人后续 review

---

## 长期 vs 短期产物(放哪)

| 类型               | 放哪                                             | 例子                                 |
| ------------------ | ------------------------------------------------ | ------------------------------------ |
| PRD                | docs/ 根                                         | docs/PRD.md                          |
| 架构文档           | docs/architecture/                               | docs/architecture/cqrs.md            |
| ADR                | docs/decisions/                                  | docs/decisions/2026-06-24-*.md       |
| 长期变更日志       | docs/changelog.md                                | docs/changelog.md                    |
| 用户故事           | docs/user-stories/                               | docs/user-stories/2026-07-15-*.md    |
| **设计稿**   | **design/{version}/**                      | design/mobile1.2/2026-07-15-*.md     |
| **评审报告** | **reviews/{version}/**                     | reviews/mobile1.2/2026-07-22-*.md    |
| **项目计划** | **plans/{version}/**；跨版本留 `plans/` 根 | plans/mobile1.2/2026-07-22-*.md       |
| 历史任务资料       | tasks/{version}/                                 | tasks/mobile1.2/2026-07-14-*.md      |
| **迭代记录** | **iterations/{version}/**                  | iterations/mobile1.2/2026-07-22-*.md |

**判定铁律**:**跨版本仍有效 → 留根;只服务某一版本 → 入版本子目录**。

---

## 关联仓(技术层)

| 仓                      | 角色         | 当前                           | docs/ 入口                                                                |
| ----------------------- | ------------ | ------------------------------ | ------------------------------------------------------------------------- |
| wk-train-center-service | 后端 Java    | `local/mobile1.2/fix`        | [.products/projects/wk-train-center-service/](../wk-train-center-service/) |
| wk-train-center-ui      | PC 前端 Vue2 | `local/mobile1.2/fix`        | [.products/projects/wk-train-center-ui/](../wk-train-center-ui/)           |
| wk-train-center-ui-v3   | PC 前端 Vue3 | `master`                     | [.products/projects/wk-train-center-ui-v3/](../wk-train-center-ui-v3/)     |
| wk-mhc-mobile           | H5 移动端    | `train/mobile-v1.1/dev` ⚠️ | [.products/projects/wk-mhc-mobile/](../wk-mhc-mobile/)                     |

---

## 引用

- 整体规范:[.products/README.md](../../README.md)
- 设计稿归集规则:[design/README.md](design/README.md)
- 评审归集规则:[reviews/README.md](reviews/README.md)
- 项目计划规范:[plans/README.md](plans/README.md)
- 历史任务归集规则:[tasks/README.md](tasks/README.md)
- 版本号权威源:子仓 `git branch --show-current`(2026-07-14 主人铁律)
- version-registry:[docs/version-registry.json](docs/version-registry.json) 🆕
- SPEC 文档:[.products/specs/2026-07-22-products-projects-version-aggregation-design.md](../../specs/2026-07-22-products-projects-version-aggregation-design.md)
- 链接断裂报告:[LINK-BREAKAGE.md](LINK-BREAKAGE.md) 🆕
