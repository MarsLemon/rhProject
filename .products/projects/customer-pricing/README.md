# customer-pricing(船舶维保定价系统)

> **项目代号**:customer-pricing
> **职责**:船舶维保客户自助询价 + 内部成本核算
> **Owner**:product-manager + backend-expert
> **最后更新**:2026-09-28(目录重构:组件 + 版本号二级结构)

---

## 当前状态

| 维度 | 值 |
|---|---|
| 最新版本 | **1.0** |
| 后端进度 | 已有内容(借鉴成本大表报告 + 需求草稿 + 教学) |
| 前端 | 框架(待补) |
| 移动端 | 框架(待补) |

---

## 版本跟踪表

| 版本 | 状态 | 备注 |
|---|---|---|
| **1.0** | 当前 | 借鉴成本大表已完成(报告 + 需求草稿 + 教学) |

---

## 目录结构

```
customer-pricing/
├── README.md                 # 本文件
├── _index.md                 # 组件索引
│
├── backend/                  # 组件 1:后端(已有内容)
│   ├── README.md
│   └── 1.0/                 # 当前版本
│       ├── docs/             # 长期文档
│       ├── plans/            # 项目计划
│       ├── reviews/          # 评审报告
│       ├── tasks/            # 任务清单
│       ├── reports/          # 已有报告(借鉴成本大表等)
│       ├── handoff/          # 项目交接
│       └── teach/            # 教学课程
│
├── frontend/                 # 组件 2:前端(框架,待补)
│   └── README.md
│
├── mobile/                   # 组件 3:移动端(框架,待补)
│   └── README.md
│
└── origin/                   # 组件 4:原始资料
    ├── README.md
    └── 1.0/                 # 原始资料版本
```

---

## backend/1.0/ 已有内容

> 当前所有产出都在 backend/1.0/ 下:

| 子目录 | 内容 |
|---|---|
| `reports/` | 借鉴成本大表调研报告 + 3 种新定价法需求草稿 |
| `handoff/` | 项目交接文档(2026-09-28) |
| `teach/` | 成本大表教学(9 个 lesson + 7 个速查表) |

---

## 命名规范

| 类型 | 命名 | 示例 |
|---|---|---|
| 产品级版本 | `{主}.{次}` | 1.0 / 1.5 |
| 归档 | `{版本号}_archive/` | 1.0_archive/ |

---

## 历史回退

| 状态 | 文件 |
|---|---|
| 重构前 customer-pricing | `.products/projects/customer-pricing-backup/` |

---

## 引用

- 集合 README:[../README.md](../README.md)
- 项目代码:`Backend/customer-pricing/`
- 借鉴源:`Backend/supply/`(成本大表)+ `Frontend/angular/mhc-ui/`