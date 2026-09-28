# origin(原始资料 + 全局策略)

> **组件代号**:origin
> **职责**:存放跨版本不变的原始资料
> **Owner**:product-manager agent

---

## origin/ 装什么

> 不是"某个版本的产物",而是**所有版本都用**的"根资料"。

| 文件 | 用途 |
|---|---|
| `PRD.md` | 原始 PRD(跨版本不变) |
| `strategy.md` | 产品定位/战略/全局策略 |
| `index.md` | **反向索引**:哪个版本改了哪个组件的什么 |
| `user-guide.md` | 用户说明书 |
| `*.md` | 其他跨版本不变的全局文档 |

---

## 当前版本

| 维度 | 值 |
|---|---|
| 当前版本 | **1.0** |
| 说明 | origin 的版本号代表"原始资料"的版本(自身会演进) |

---

## 反向索引(.obsidian 管理)

> `index.md` 是 **反向索引** 入口,让其他人快速定位:
> - "v1.5 改了 backend 的 docs/,frontend 的 plans/,mobile 的 reviews/..."
> - "v3 改了 frontend/v3/docs/..."

主公决定用 **Obsidian** 来管理反向索引(可视化链接、双向引用)。

---

## 目录结构

```
origin/
├── README.md          # 本文件
└── 1.0/
    ├── PRD.md
    ├── strategy.md
    ├── index.md       # 反向索引
    ├── user-guide.md
    └── *.md
```

---

## 引用

- 集合 README:[../README.md](../README.md)
- 集合索引:[../_index.md](../_index.md)
- 当前版本:[1.0/](1.0/README.md)