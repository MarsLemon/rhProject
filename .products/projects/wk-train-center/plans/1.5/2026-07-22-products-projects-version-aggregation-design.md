# Spec: .products/projects 版本目录归集与命名统一

> 日期: 2026-07-22
> 范围: train-center 全家桶 4 个子项目
> Owner: project-manager + research-expert(双 owner)
> 状态: 拍板完成,待 writing-plans

---

## 0. 背景与问题(why)

### 0.1 主人原始反馈(2026-07-22)

> 我发现关于项目文档管理这里其实有问题 `E:\rhProject\.products\projects` 这些所有的子项目文件其实应该是分版本的,目前看来全都在一个目录底下,结构应该是 `wk-train-center/xxx版本(当前是mobile1.2)/(design|docs|iterations|review|tasts)` 当前所有版本都放在一起,结果文件夹下面一堆文件根本不知道哪个功能是哪个版本下面的

### 0.2 现状(已 grep 验证)

| 子项目                       | docs 子目录                          | 短期产物散落度                                                                                       | 已有的版本目录                   |
| ---------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------- |
| `wk-train-center/`         | design/docs/iterations/reviews/tasks | 🔴**重** — reviews/ 16 个 md 全 flat, design/ 2 大目录, tasks/ 已开 `mobile1.1/` 但其他散落 | 部分:`tasks/mobile1.1/`        |
| `wk-train-center-service/` | db/docs/plans/tasks                  | 🟡 中 —`db/` 已按 `1.1/1.2/1.3/1.4/1.5/mobile-1.1/` 分版本(但 1.x 与 mobile-1.x 命名不一致)     | `db/1.x/` + `db/mobile-1.1/` |
| `wk-train-center-ui/`      | docs/tasks                           | 🟢 轻 — 只 4 个长期文件                                                                             | 无                               |
| `wk-train-center-ui-v3/`   | docs/tasks                           | 🟢 轻 — 只 4 个长期文件                                                                             | 无                               |

### 0.3 已命中历史拍板(vault)

- [shared-experiences.md:262](E:\rhProject\Thinkpad\22-entities-实体档案\agent-经验库\shared-experiences.md#L262) — 主人 2026-07-14 铁律:**版本号权威 = 子仓 `git branch --show-current`**,不准凭根仓 git 推断
- [.products/projects/wk-train-center-service/docs/version-registry.json](E:\rhProject\.products\projects\wk-train-center-service\docs\version-registry.json) — 主人已建的 single-source-of-truth,需复用为模板
- [Thinkpad/_archive/2026-07-documents-snapshot/VERSION_GUIDE.md](E:\rhProject\Thinkpad\_archive\2026-07-documents-snapshot\VERSION_GUIDE.md) — 老规范(用 `1.x/` 数字),已部分失效(漏 mobile 节奏)
- [feedback-design-vs-review-directory.md](E:\rhProject\.claude\projects\e--rhProject\memory\feedback-design-vs-review-directory.md) — 主人 2026-07-15 纠错:design/ 装设计、reviews/ 装评审,不要混

### 0.4 已识别的命名混乱(必须统一)

主人项目里 3 种 mobile 命名都在用:

1. `mobile1.1/`(无连字符,出现在 `tasks/mobile1.1/`)
2. `mobile-1.1/`(有连字符,出现在 `db/mobile-1.1/`)
3. `mobile-v1.1/`(version-registry 写法的 Git 分支形式,出现在文档里)

→ **主人 Q2 拍板**:统一用 `mobile1.x/` 现状习惯(无连字符)。SPEC 必须显式注明这是 single source of truth,后续不准再用另外 2 种。

---

## 1. 目标(what)

1. 4 个 train-center 子项目**短期产物(设计/任务/评审/迭代)按版本归集**,不再 flat 散落
2. `db/` 目录的 `1.x/` 与 `mobile-1.x/` 命名统一(都用 `mobile1.x/` + `1.x/` 区分 PC 端与 mobile 端)
3. 4 个子项目都补 `docs/version-registry.json` + 项目根 `README.md`
4. 主目录 `.products/projects/` 补 `README.md` 总规范
5. 长期文档(PRD/changelog/architecture/decisions/user-stories)留根目录,**不**进版本子目录

---

## 2. 目标目录结构(after)

### 2.1 主目录 `.products/projects/`

```
.products/projects/                     # 共 7 个子项目,本次动 4 个
├── README.md                          # 🆕 新建 — 整体规范 + 命名对照表
├── wk-train-center/                   # 主项目(产品层)— 本次动
├── wk-train-center-service/           # 后端 — 本次动
├── wk-train-center-ui/                # PC 前端 Vue2 — 本次动
├── wk-train-center-ui-v3/             # PC 前端 Vue3 — 本次动
├── wk-mhc-ui/                         # 本次不动
├── wk-mhc-mobile/                     # 本次不动
└── wk-PPTist-ui/                      # 本次不动
```

### 2.2 `wk-train-center/`(主项目,改动最大)

```
wk-train-center/
├── README.md                          # 🆕 新建 — 主项目说明 + 当前版本
├── docs/                              # 长期文档(不动)
│   ├── PRD.md
│   ├── changelog.md
│   ├── architecture/                  # (空,保留)
│   ├── decisions/
│   └── user-stories/                  # (空,保留)
├── design/
│   ├── README.md                      # 🆕 新建 — 命名规则
│   ├── mobile1.1/                     # 🆕 新建 — 1.1 期设计
│   │   └── self-ai-gateway(claude)/... # 从根搬入
│   ├── mobile1.2/                     # 🆕 新建 — 1.2 期设计(2026-07-15 student-frontend-migration)
│   │   ├── README.md
│   │   └── 2026-07-15-student-frontend-migration(claude).md
│   └── _legacy/                       # 🆕 新建 — 1.2 之前的散落设计暂存,后续归档判定
│       └── 2026-07-14-self-ai-gateway(qoder)/...
├── iterations/                        # 历史散落统一暂存
│   ├── README.md                      # 🆕 新建
│   └── (空,等待主人后续填)
├── reviews/
│   ├── README.md                      # 🆕 新建 — 命名规则 + 归集判定原则
│   ├── mobile1.1/                     # 🆕 新建 — 7-15 ~ 7-17 的评审(判定:7-15 wk-train-center-service mobile-v1.1 还在途,7-17 是 1.1 收官)
│   │   ├── README.md
│   │   ├── 2026-07-15-backend-handoff-kb-choose.md
│   │   ├── 2026-07-15-backend-issues-for-claude.md
│   │   ├── 2026-07-15-backend-issues-for-claude-v2.md
│   │   ├── 2026-07-15-backend-review-by-qoder.md
│   │   ├── 2026-07-15-frontend-issues-for-qoder.md
│   │   ├── 2026-07-15-frontend-review-by-claude.md
│   │   ├── 2026-07-15-integration-tracker.md
│   │   ├── 2026-07-16-backend-handoff-error-classification.md
│   │   ├── 2026-07-16-DELIVERY_NOTES_P3_SUGGEST_AND_STAGES.md
│   │   └── 2026-07-17-AI_ASSISTANT_TEST_REPORT.md
│   ├── mobile1.2/                     # 🆕 新建 — 7-22 的评审(判定:7-22 是 mobile1.2 阶段合并 dashscope file ids)
│   │   ├── README.md
│   │   ├── 2026-07-22-合并-dashscope-file-ids-issues-for-qoder.md
│   │   ├── 2026-07-22-合并-dashscope-file-ids-issues-for-qoder-v2.md
│   │   ├── 2026-07-22-合并-dashscope-file-ids-issues-for-qoder-v3.md
│   │   └── 2026-07-22-后端-phase1-3-验收-by-claude.md
│   ├── _archive/                      # 🆕 新建 — 7-10 之前(过老,不再判定版本)
│   │   └── CONVENTIONS.md             # 从根搬入
│   └── (其他散落评审保持根,后续 manual 归集)
└── tasks/
    ├── README.md                      # 已存在,刷新内容
    ├── task_plan.md                   # 留根(跨版本产物,跟 mobile1.x 无关)
    ├── mobile1.1/                     # 已存在,不动
    └── mobile1.2/                     # 🆕 新建 — 7-14 起的任务(判定:7-14 unified plan 是 mobile1.2 准备)
        ├── README.md
        ├── 2026-07-14-self-ai-gateway-unified-plan(qoder&claude).md
        └── 2026-07-09-tech-debt-data-table-api-func.{md,json}  # 7-09 但主人判定跟 mobile1.2 有关,留待主人 confirm
```

**归集判定原则**(写进 `reviews/README.md` + `tasks/README.md`):

- 同一时间窗口(7-15 ~ 7-17) → 一个版本,主体归属 = `mobile1.1`(因为 wk-train-center-service 当时 `git branch` 是 `local/mobile-v1.1/dev`,7-17 后切到 v1.2)
- 7-22 起的 → `mobile1.2`(对应 wk-train-center-service 当前 `local/mobile1.2/fix`)
- 跨多个版本的整体性任务(自建 AI 网关统一计划)→ 跟当前版本走
- 时间线判定不确定的 → 留根,主人后续 review

### 2.3 `wk-train-center-service/`(db/ 命名统一)

```
wk-train-center-service/
├── README.md                          # 🆕 新建
├── db/
│   ├── README.md                      # 已存在
│   ├── GOVERNANCE.md                  # 已存在
│   ├── HEADER-TEMPLATE.sql            # 已存在
│   ├── lint-report.md                 # 已存在
│   ├── 1.1/                           # ✅ 保留(PC 端 v1.1)
│   ├── 1.2/                           # ✅ 保留(PC 端 v1.2)
│   ├── 1.3/                           # ✅ 保留(PC 端 v1.3)
│   ├── 1.4/                           # ✅ 保留(PC 端 v1.4)
│   ├── 1.5/                           # ✅ 保留(PC 端 v1.5)
│   ├── mobile1.1/                     # 🔄 重命名 db/mobile-1.1/ → db/mobile1.1/
│   │   ├── 1.sql                      # 跟 mobile-1.1 内容相同
│   │   ├── 2.sql
│   │   └── README.md
│   └── (未来 mobile1.2/ 新建)
├── docs/                              # 长期文档,不动
└── tasks/                             # 短期任务,不动(7 个 radar 任务已 flat 但不属于 mobile 节奏)
```

### 2.4 `wk-train-center-ui/`(只补 README + version-registry)

```
wk-train-center-ui/
├── README.md                          # 🆕 新建
├── docs/
│   ├── PRD.md                         # 已存在
│   ├── changelog.md                   # 已存在
│   ├── DEPRECATED-FEATURES.md         # 已存在
│   └── version-registry.json          # 🆕 新建(复用后端模板)
└── tasks/                             # 空(只有 README),不动
```

### 2.5 `wk-train-center-ui-v3/`(同上)

```
wk-train-center-ui-v3/
├── README.md                          # 🆕 新建
├── docs/
│   ├── PRD.md                         # 已存在
│   ├── changelog.md                   # 已存在
│   ├── DEPRECATED-FEATURES.md         # 已存在
│   └── version-registry.json          # 🆕 新建
└── tasks/                             # 空,不动
```

### 2.6 version-registry.json 模板(4 仓共用,字段同后端已有)

```json
{
  "_comment": "项目版本号登记表 - 权威源 = 子仓 git branch --show-current",
  "_spec": {
    "owner": "Wiki 维护 agent",
    "authority": "git 现状分支名 = 版本号(local/{X.X}/dev 模式或 local/mobile-v{X.X}/dev)",
    "currentVersionSource": "git branch --show-current(子仓独立 origin)",
    "namingConvention": {
      "docDir": "mobile1.x/  ←注意:无连字符,跟 db/ 旧命名 mobile-1.x 区分,2026-07-22 主人口径统一为无连字符",
      "gitBranch": "local/mobile-v1.x/dev 或 local/{X.X}/dev"
    }
  },
  "current": {
    "branch": "(子仓 git branch --show-current 输出)",
    "version": "(从分支名解析)",
    "releasedAt": null,
    "nextPlanned": "(下一版)"
  },
  "history": [
    { "version": "mobile-v1.0", "branch": "local/mobile-v1.0/dev", "status": "已发布", "releasedAt": "..." }
  ],
  "allKnownBranches": { ... }
}
```

---

## 3. 命名规范(写入主目录 README,硬约束)

### 3.1 版本子目录命名(Q2 主人口径,2026-07-22 拍板)

| 节奏        | 子目录命名               | 示例                  | Git 分支                  |
| ----------- | ------------------------ | --------------------- | ------------------------- |
| PC/web 端   | `1.x/`                 | `tasks/1.2/`        | `local/1.2/dev`         |
| Mobile 端   | `mobile1.x/`(无连字符) | `tasks/mobile1.2/`  | `local/mobile-v1.2/dev` |
| 旧/历史     | `_archive/`            | `reviews/_archive/` | 任意                      |
| 跨版本/长期 | 留根目录                 | `docs/PRD.md`       | —                        |

**禁用形式**(本次规范,后续 AI 看到报错):

- ❌ `mobile-1.x/`(db/ 老命名,统一改)
- ❌ `mobile-v1.x/`(版本号,只用于 Git 分支,不准用作目录名)
- ❌ `v1.x/`(VERSION_GUIDE 老规范,已废)

### 3.2 文件命名

沿用 `YYYY-MM-DD-<主题>.md`,**不带版本前缀**(版本信息从所在目录继承)。

### 3.3 长期 vs 短期产物判定

| 类型         | 放哪                  | 例子                                 |
| ------------ | --------------------- | ------------------------------------ |
| PRD          | docs/ 根              | docs/PRD.md                          |
| 架构文档     | docs/architecture/    | docs/architecture/cqrs.md            |
| ADR / 决策   | docs/decisions/       | docs/decisions/2026-06-24-*.md       |
| 长期变更日志 | docs/changelog.md     | docs/changelog.md                    |
| 用户故事     | docs/user-stories/    | docs/user-stories/2026-07-15-*.md    |
| 设计稿       | design/{version}/     | design/mobile1.2/2026-07-15-*.md     |
| 评审报告     | reviews/{version}/    | reviews/mobile1.2/2026-07-22-*.md    |
| 任务计划     | tasks/{version}/      | tasks/mobile1.2/2026-07-14-*.md      |
| 迭代记录     | iterations/{version}/ | iterations/mobile1.2/2026-07-22-*.md |

**判定铁律**:跨版本仍有效 → 留根;只服务某一版本 → 入版本子目录。

---

## 4. 数据流与触发

### 4.1 新建文档时的归位流程

```
1. 主人/agent 接到任务
2. 问:这份文档长期有效还是某个版本专属?
   ├─ 长期 → 走 docs/(具体子目录)
   └─ 某版本 → 问:哪个版本?
       ├─ 查 docs/version-registry.json 的 current
       ├─ 或 cd {子仓} && git branch --show-current
       └─ 落到 {子目录}/{version}/ 下
3. 命名:YYYY-MM-DD-<主题>.md(不带版本前缀)
4. 更新 {子目录}/{version}/README.md 索引
```

### 4.2 版本切换时的归档

版本发版后(从 git tag 触发),由 `research-expert`(写库流程)执行:

1. 把 `mobile1.2/` 改名为 `mobile1.2-archived-YYYY-MM-DD/` 或保持原名(目录名带状态标识)
2. 在 `version-registry.json` 把 current.version 改为新版本,history 加新条目
3. 写 docs/changelog.md

(本规范范围内**不**自动执行,等发版时手动触发)

---

## 5. 错误处理与边界

### 5.1 不动的东西

- `wk-mhc-ui/` `wk-mhc-mobile/` `wk-PPTist-ui/`(本次范围外)
- `Thinkpad/`(vault,本身就有月份分层,不动)
- 任何 `.md` 的 frontmatter 内容(只动文件位置)

### 5.2 命名判定不明的处理

如果一个文档不知道该归 mobile1.1 还是 mobile1.2:

- 默认归 `_legacy/`,由主人在 README 写一段说明,后续 review 再判定

### 5.3 链接断裂

移动文件后,其他文件里的相对路径链接会断。**第一阶段只动位置,不修复链接**(因为很多链接是写时人工复制,质量参差)。写一个 `LINK-BREAKAGE.md` 列已知断链,后续按项目修。

### 5.4 Git 操作

不用 git 命令——主人工作流里这是文件级管理,不动 git 历史。文件移动用 `mv` 而非 `git mv`,避免污染 git blame(主人有 `feedback-parallel-ide-commit` 铁律,Cursor/Qoder 并行 commit 时会冲突)。

---

## 6. 验收标准(Definition of Done)

- [ ] `wk-train-center/` 下所有短期产物在 `mobile1.1/` `mobile1.2/` `_archive/` 中,根目录不再有 `2026-07-*.md`
- [ ] `wk-train-center-service/db/mobile-1.1/` 重命名为 `db/mobile1.1/`,README 更新
- [ ] 4 仓根目录都有 `README.md`
- [ ] 4 仓 docs/ 下都有 `version-registry.json`(wk-train-center 也补)
- [ ] `.products/projects/README.md` 总规范写出,含命名对照表 + 长期/短期判定铁律
- [ ] 命名对照表覆盖 Q2 拍板的 3 种历史混乱(mobile1.x/mobile-1.x/mobile-v1.x)
- [ ] 写一条 `Thinkpad/22-entities-实体档案/agent-经验库/shared-experiences.md` 教训:产品层 docs/ 按版本归集 + 命名统一

---

## 7. 风险与回退

| 风险                          | 缓解                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------ |
| 移动文件后 IDE bookmark 失效  | 影响小,主人 IDE 主要是 open file 不用 bookmark                                 |
| 移动文件后 git blame 变乱     | 用`mv` 不用 `git mv`;主人接受短期影响                                      |
| 命名规范写进 README 后被忽略  | 写入 agent 共享文件`wiki-index.md` + `domain-coupling.md`,agent 触发时自检 |
| 4 仓现状不一,部分仓没短期产物 | v3/ui 的 tasks/ 空目录,不动;只补 README + version-registry                     |

回退:整体回退用 git 即可(主人 git status 经常看,改动可见)。回退时按本次 SPEC 的"验收标准"反向执行。

---

## 8. 不在本次范围(明确边界)

- ❌ 移动 `wk-mhc-ui/` `wk-mhc-mobile/` `wk-PPTist-ui/` 任何文件
- ❌ 修改任何 `.md` 的内容(只动位置)
- ❌ 改 git 分支、tag、commit
- ❌ 改 `Thinkpad/` vault 任何文件
- ❌ 改 `.qoder/plans/`(那是 plan-orchestrator 落盘,不动)
- ❌ 改 `Thinkpad/_archive/2026-07-documents-snapshot/VERSION_GUIDE.md`(已废,主人可能后续自己删)

---

## 9. 引用

主人 2026-07-22 原始拍板:

- Q1 范围: train-center 全家桶 4 个
- Q2 命名: `mobile1.2/` 现状习惯(无连字符)
- Q3 版本范围: 只归当前 mobile1.2
- Q4 跨版本产物: docs/ 全部留根目录
- Q5 其他子仓: 4 个都动 + 统一 db/
- Q6 version-registry: 4 仓都补齐 + 主目录补 README 规范

历史拍板:

- [shared-experiences.md:262](E:\rhProject\Thinkpad\22-entities-实体档案\agent-经验库\shared-experiences.md#L262) — 铁律:版本号权威 = 子仓 git
- [.products/projects/wk-train-center-service/docs/version-registry.json](E:\rhProject\.products\projects\wk-train-center-service\docs\version-registry.json) — 模板来源
- [Thinkpad/_archive/2026-07-documents-snapshot/VERSION_GUIDE.md](E:\rhProject\Thinkpad\_archive\2026-07-documents-snapshot\VERSION_GUIDE.md) — 老规范,部分已废
- [feedback-design-vs-review-directory.md](E:\rhProject\.claude\projects\e--rhProject\memory\feedback-design-vs-review-directory.md) — design/ vs reviews/ 分类铁律
