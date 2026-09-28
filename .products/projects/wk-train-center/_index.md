# wk-train-center 组件索引

> 本文档为 wk-train-center 集合下 5 个组件的快速导航
> 2026-09-28 重构后版本

---

## 5 个组件速查

| 组件 | 角色 | 技术栈 | 当前版本 | Owner | README |
|---|---|---|---|---|---|
| **backend/** | 后端 API + SQL 资产 | Java 17 + Spring Boot 3 + DDD + MyBatis-Plus + Shiro | 1.5 | backend-expert | [README](backend/README.md) |
| **frontend/** | PC 端 Web 前端 | Vue 2 (1.5) + Vue 3 (v3) | 1.5 + v3 | frontend-expert | [README](frontend/README.md) |
| **mobile/** | H5 移动端 | Vue + H5 | 1.5 | frontend-expert | [README](mobile/README.md) |
| **pptist/** | PPT 工具 | Vue 3 + PPTist | 1.0 | frontend-expert | [README](pptist/README.md) |
| **origin/** | 原始资料 + 全局策略 | (跨版本不变) | 1.0 | product-manager | [README](origin/README.md) |

---

## 当前活跃版本

| 版本 | 组件 | 状态 |
|---|---|---|
| **1.5** | backend / frontend (Vue2) / mobile | 产品级当前活跃 |
| **v3** | frontend (Vue3) | 代号版本,持续补充 |

> 历史归档见各组件下的 `{版本号}_archive/` 子目录。

---

## 版本号下的标准结构

每个版本号目录下,文档按类型分:

```
{组件}/{版本号}/
├── docs/         长期:跨版本产物(留根)
├── plans/        项目计划
├── reviews/      评审报告
├── tasks/        任务清单
├── db/           后端专属:SQL 资产
└── *.md          文档或引用类文件
```

---

## origin/ 的特殊定位

`origin/` 是**跨版本不变**的原始资料:

```
origin/1.0/
├── PRD.md         ← 原始 PRD(跨版本不变)
├── strategy.md    ← 产品定位/战略/全局策略
├── index.md       ← 反向索引(哪个版本改了什么)
├── user-guide.md  ← 用户说明书
└── *.md
```

> **反向索引**:从 origin/index.md 出发,可以定位"v1.5 改了 backend/1.5/docs/..."。

---

## 跨组件引用

- 从 `backend/1.5/` 引用 `frontend/1.5/` → `../../../frontend/1.5/`
- 从任意组件引用 集合级 README → `../../README.md`
- 从任意版本引用 origin → `../../../origin/1.0/PRD.md`

---

## 历史迁移

> 重构前 wk-train-center → `.products/projects/wk-train-center-backup/`

---

## 已知问题(待补)

- 各组件 README 待建/更新
- origin/1.0/ 示例文件待建
- 历史版本(1.0/1.1/1.2)内容待从 backup 迁移(按需)