# wk-train-center(产品层主项目)

> **项目代号**:wk-train-center
> **职责**:跨代码仓的产品需求、用户故事、决策、变更日志
> **Owner**:产品经理 agent
> **最后更新**:2026-09-28(目录重构:组件 + 版本号二级结构)

---

## 当前状态

| 维度 | 值 |
|---|---|
| 最新发布版本 | v3(Vue3,持续补充中) + 1.5(Vue2 当前活跃) |
| 主仓 git | `local/mobile1.2/fix`(后端) |
| 前端 Vue2 | 1.5 活跃 |
| 前端 Vue3 | v3 独立版本,持续补充 |
| 移动端 | 1.5 跟随 |

---

## 版本跟踪表

> 每次开新版本/更新版本,必须更新此表。
> **归档** = 旧版本号 + `_archive` 后缀(如 `1.5_archive/`)

### 当前活跃版本

| 版本 | 状态 | 类型 | 组件 | git 分支 | 备注 |
|---|---|---|---|---|---|
| **1.5** | **当前活跃** | 产品 | backend / frontend (Vue2) / mobile | `local/mobile1.2/fix` | 对齐 mobile1.2 节奏 |
| **v3** | **当前活跃** | 代号 | frontend (Vue3) | `master` | 持续补充,尚未完全顶替 v2 |

### 历史版本(从 wk-train-center-backup 提取)

| 版本 | 状态 | 类型 | 组件 | 备注 |
|---|---|---|---|---|
| 1.0 | 历史 | 产品 | backend / frontend (PC) | PC 端初始版 |
| 1.1 | 历史 | 产品 | frontend (Vue2) | Vue2 早期 |
| 1.2 | 历史 | 产品 | frontend (Vue2) | Vue2 中期 |
| 1.3 | 历史 | 产品 | frontend (Vue2) | Vue2 后期 |
| 1.4 | 历史 | 产品 | frontend (Vue2) | Vue2 末 |
| mobile-v1.0 | 历史 | 产品 | mobile | 移动端初始 |
| mobile-v1.1 | 历史 | 产品 | mobile | 移动端 (2026-07 中旬已发) |

> ⚠️ v3 是**代号版本**(不是产品级 1.x 序列),与 1.1-1.5 并存。
> ⚠️ 旧版本内容暂未迁移(按需从 backup 抽取)。

---

## 目录结构

```
wk-train-center/
├── README.md                # 本文件(集合说明 + 版本跟踪表)
├── _index.md                # 组件索引(快速导航)
│
├── backend/                 # 组件 1:后端
│   ├── README.md
│   ├── 1.0/                 # 版本号目录(组件下先跟版本号)
│   ├── 1.5/                 # 当前版本
│   │   ├── docs/            # 文档类型
│   │   ├── plans/
│   │   ├── reviews/
│   │   ├── tasks/
│   │   ├── db/              # 后端专属:SQL 资产
│   │   └── *.md
│   └── 1.5_archive/         # 历史版本(归档 B 策略)
│
├── frontend/                # 组件 2:前端(Vue2 + Vue3)
│   ├── README.md
│   ├── 1.1/                 # Vue2 早期版本
│   ├── 1.2/                 # Vue2 中期
│   ├── 1.5/                 # Vue2 当前
│   └── v3/                  # Vue3 独立版本(代号)
│
├── mobile/                  # 组件 3:移动端
│   ├── README.md
│   └── 1.5/
│
├── pptist/                  # 组件 4:PPT 工具(注意:pptist 不是 ppt)
│   ├── README.md
│   └── 1.0/
│
└── origin/                  # 组件 5:原始资料(跨版本不变)
    ├── README.md
    └── 1.0/
        ├── PRD.md           # 原始 PRD
        ├── strategy.md      # 产品定位/战略
        ├── index.md         # 反向索引(哪个版本改了什么)
        └── user-guide.md    # 用户说明书
```

---

## 命名规范

### 版本号

| 类型 | 命名 | 示例 | 备注 |
|---|---|---|---|
| 产品级版本 | `{主}.{次}` | 1.0 / 1.5 / 2.0 | 全产品对齐 |
| 代号版本 | `v{代号}` | v3 (Vue3) | 单组件代号,持续补充 |
| 历史归档 | `{版本号}_archive/` | 1.5_archive/ | **B 策略**:加后缀 |

### 文档类型

每个版本号目录下,文档分类型:

| 类型 | 用途 |
|---|---|
| `docs/` | 长期:跨版本产物 |
| `plans/` | 项目计划 |
| `reviews/` | 评审报告 |
| `tasks/` | 任务清单 |
| `db/` | 后端专属:SQL 资产 |

### 组件代码代号

- `backend` ← 原 wk-train-center-service
- `frontend` ← 原 wk-train-center-ui(Vue2) + wk-train-center-ui-v3(Vue3 合并)
- `mobile` ← 原 wk-mhc-mobile
- `pptist` ← 原 wk-PPTist-ui(全名,不是 ppt)
- `origin` ← 原始资料(产品说明/战略/反向索引)

---

## bug 版本分支(临时)

> 产品级版本号对齐,但 bug 可能单开分支:
> - 例:`1.5_bugfix-001/` 临时目录(归档后合并回主版本)

---

## 反向索引(origin/1.0/index.md)

> 关键:**哪个版本改了前后端**,由 `origin/1.0/index.md` 统一索引。
> 读时定位:`origin/1.0/index.md` → 看"v1.5 改了 backend 的 docs/,frontend 的 plans/..."

---

## 历史回退

| 状态 | 文件 |
|---|---|
| 重构前 wk-train-center | `.products/projects/wk-train-center-backup/` |

---

## 引用

- 主公全局硬约束:`C:\Users\RUHAI\.claude\CLAUDE.md` §8
- 项目级 hook:`E:\rhProject\.products\CLAUDE.md`
- 工作区总览:`E:\rhProject\.products\README.md`