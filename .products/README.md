# `.products` 工作区目录

> 本目录存放工作区的"业务文档 / 教学 / 交接 / 元规则",与代码项目对齐
> **不**放代码、不放配置、不放临时文件

---

## §0 写文档前必看

**任何文档类文件落笔前,必须先问主公**:
1. 放在哪个项目下?
2. 具体路径是什么?
3. 主公确认后才能写

**位置铁律**:项目文档 → `.products/projects/{项目名}/...`;**绝不**放到 `.products/docs/` 顶层。

详见:`.products/CLAUDE.md`(项目级 hook)

---

## §1 当前目录结构

```
.products/
├── README.md                    ← 本文件(总览)
├── CLAUDE.md                    ← 项目级 hook(写文档规则)
├── projects/                    ← 项目文档(每个代码项目一个子目录)
│   ├── wk-train-center/        ← 集合(包含 5 组件)
│   │   ├── README.md
│   │   ├── _index.md
│   │   ├── LINK-BREAKAGE.md
│   │   ├── backend/            ← 组件:后端
│   │   ├── frontend/           ← 组件:前端(Vue2 + Vue3)
│   │   ├── mobile/             ← 组件:移动端
│   │   ├── pptist/             ← 组件:PPT 工具
│   │   └── origin/             ← 组件:原始资料 + 反向索引
│   ├── customer-pricing/       ← 集合(包含 4 组件)
│   │   ├── README.md
│   │   ├── _index.md
│   │   ├── backend/            ← 组件:后端(主)
│   │   ├── frontend/           ← 组件:前端(框架)
│   │   ├── mobile/             ← 组件:移动端(框架)
│   │   └── origin/             ← 组件:原始资料(待建)
│   ├── wk-mhc-ui/              ← 单集项目
│   └── wk-user/                ← 单集项目
├── docs/                        ← 跨项目元规则(慎放,只放工作区级)
│   └── (按需)
└── BROKEN-LINKS-REPORT.md(临时报告,主公查看用)
```

---

## §2 标准目录结构(项目 + 组件 + 版本号)

```
{项目名}/                          ← 集合根
├── README.md                    ← 集合级说明 + 版本跟踪表
├── _index.md                    ← 组件索引
├── LINK-BREAKAGE.md             ← 链接断裂追踪(主公定的)
│
├── {组件名}/                    ← 组件目录(平级)
│   ├── README.md                ← 组件级说明
│   └── {版本号}/                ← 版本号目录(必在组件下)
│       ├── README.md            ← 版本级说明(待补)
│       ├── docs/                ← 文档类型(标准)
│       ├── plans/
│       ├── reviews/
│       ├── tasks/
│       ├── db/                  ← 后端专属
│       └── *.md                  ← 文档或引用类文件
│
└── (无集合级子目录,如 design/ iterations/ plans/ reviews/ tasks/)
   (这些全部归到 origin/1.0/ 跨版本不变)
```

**核心约束**:
- ✅ 集合层**只有** 5 组件 + 元数据
- ❌ 集合层**禁止**有 design/ iterations/ plans/ reviews/ tasks/ 子目录
- ✅ 版本号目录**必须**在组件目录下(不是集合下)
- ✅ 集合级资料 → `origin/{版本号}/`(跨版本不变)

---

## §3 已知项目目录速查

### 集合项目(2 个)

| 项目 | 组件 | 文档位置 |
|---|---|---|
| **wk-train-center** | backend / frontend / mobile / pptist / origin | `.products/projects/wk-train-center/` |
| **customer-pricing** | backend / frontend / mobile / origin | `.products/projects/customer-pricing/` |

### 单集项目(2 个)

| 项目 | 文档位置 |
|---|---|
| wk-mhc-ui | `.products/projects/wk-mhc-ui/` |
| wk-user | `.products/projects/wk-user/` |

### wk-train-center 集合详情

| 组件 | 对应原项目 | 当前版本 |
|---|---|---|
| `backend/` | wk-train-center-service | 1.5 |
| `frontend/` | wk-train-center-ui(1.5) + wk-train-center-ui-v3(v3) | 1.5 + v3 |
| `mobile/` | wk-mhc-mobile | 1.5 |
| `pptist/` | wk-PPTist-ui | 1.0 |
| `origin/` | (新增) | 1.0 |

### customer-pricing 集合详情

| 组件 | 当前版本 |
|---|---|
| `backend/` | 1.0(已有内容) |
| `frontend/` | 1.0(框架,待补) |
| `mobile/` | 1.0(框架,待补) |
| `origin/` | 1.0(待建) |

---

## §4 文档类型与位置对照

| 文档类型 | 应该放的位置 |
|---|---|
| **集合级说明 + 版本跟踪表** | `.products/projects/{项目名}/README.md` |
| **集合级组件索引** | `.products/projects/{项目名}/_index.md` |
| **集合级断链追踪** | `.products/projects/{项目名}/LINK-BREAKAGE.md` |
| **组件级说明** | `.products/projects/{项目名}/{组件名}/README.md` |
| **项目报告 / 需求草稿** | `.products/projects/{项目名}/{组件名}/{版本号}/docs/` 或 `reports/`(legacy) |
| **项目计划** | `.products/projects/{项目名}/{组件名}/{版本号}/plans/` |
| **项目评审** | `.products/projects/{项目名}/{组件名}/{版本号}/reviews/` |
| **项目任务** | `.products/projects/{项目名}/{组件名}/{版本号}/tasks/` |
| **SQL 资产** | `.products/projects/{项目名}/{组件名}/{版本号}/db/`(后端专属) |
| **原始资料 / PRD / 战略** | `.products/projects/{项目名}/origin/{版本号}/` |
| **跨项目元规则** | `.products/CLAUDE.md` / `.products/README.md` |

---

## §5 命名规范

| 类型 | 命名 | 示例 |
|---|---|---|
| 项目目录 | 与代码项目同名,全小写,短横线 | `customer-pricing` |
| 组件目录 | 单数英文 | `backend`、`frontend`、`mobile`、`pptist`、`origin` |
| 版本号 | `{主}.{次}` 或 `v{代号}` | `1.0`、`1.5`、`v3` |
| 归档版本 | `{版本号}_archive/` | `1.5_archive/` |
| 文档类型 | 复数英文 | `docs/`、`plans/`、`reviews/`、`tasks/` |

---

## §6 代码仓不写文档(2026-09-28 主公拍板)

源代码仓库(`Backend/*/`、`Frontend/*/`)中**不写** `.md` 等文档类内容:
- 所有项目文档 → `.products/projects/`
- 代码仓根 `README.md` 可保留(简短指向 `.products/` 归档位置)
- 例外:代码仓内**已有**的 `docs/` / `README.md` 历史保留(只是新写禁止)
- `db/` SQL 资产特殊(代码仓是源真相,`.products/` 是归档副本)

详见:`.products/CLAUDE.md`

---

## §7 关联

- **主公全局硬约束**:`C:\Users\RUHAI\.claude\CLAUDE.md` §8(写文档前必须先问)
- **项目级 hook**:`E:\rhProject\.products\CLAUDE.md`
- **Agent 经验库**:`E:\rhProject\Thinkpad\22-entities-实体档案\agent-经验库\shared-experiences.md`

---

## §8 历史

- 2026-09-28 重构:从平级项目结构 → 集合(项目 + 组件 + 版本号)二级结构
- 2026-09-28 代码仓不写文档(主公全局规则)
- 2026-09-28 写文档前必须先问(主公全局规则)
- 备份:原 `wk-train-center/` 和 `customer-pricing/` 已被整合,无 `-backup/` 目录