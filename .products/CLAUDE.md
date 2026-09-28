# 写文档的强制规则(项目级展开)

> 主公于 2026-09-28 拍板
> 主规则在主公全局 CLAUDE.md(跨项目生效),本文件是项目级展开

---

## 🚨 铁律(与全局一致)

**任何文档类文件落笔前必须先问主公**:

1. **放在哪个项目下?**
2. **具体路径是什么?**
3. **主公确认后才能写**

---

## 🚨 代码仓不写文档(2026-09-28 主公拍板)

> **源代码仓库不写 .md 等文档类内容**。
> 所有项目文档归档到 `.products/projects/` 下。

### 适用范围

| 仓库类型 | 包含 | 是否写文档 |
|---|---|---|
| 后端代码仓 | `Backend/{项目}/` 下的 `*.java` 等代码目录 | ❌ 禁止写新文档 |
| 前端代码仓 | `Frontend/{vue,angular}/{项目}/` 下的 `*.ts/*.vue` 等代码目录 | ❌ 禁止写新文档 |
| 代码仓根 README.md | 代码仓根的 `README.md` | ✅ 可保留(简短指向 .products/) |
| 历史已有文档 | 代码仓内已存在的 docs/ README.md 等 | ✅ 保留(不删) |

### 归档流向

```
代码仓(SQL/SQL)→ .products/db/(代码仓是源真相)
代码仓(.md)  → .products/docs/(.products/ 是权威源)
其他代码     → 不动
```

### 例外

- ✅ 代码仓根 README.md 可保留(但内容应简短,主功能指向 `.products/` 归档位置)
- ✅ 代码仓内历史已有 docs/ / README.md 不删(只是新写禁止)
- ✅ db/ SQL 资产特殊(代码仓是源真相,.products/ 是归档副本)

---

## 项目文档位置规则(本文件展开)

| 文档类型 | 应该放的位置 |
|---|---|
| **项目报告** | `.products/projects/{项目名}/reports/` |
| **项目交接** | `.products/projects/{项目名}/handoff/` |
| **项目教学** | `.products/projects/{项目名}/teach/` |
| **项目决策/ADR** | `.products/projects/{项目名}/decisions/` |
| **项目速查表** | `.products/projects/{项目名}/reference/` |
| **项目 README** | `.products/projects/{项目名}/README.md` |

**绝对禁止**:
- ❌ 把项目文档放到 `.products/docs/` 顶层
- ❌ 混放不同项目的文档

**项目目录命名规范**:
- 与代码项目同名(全小写,短横线连接)
- 例:`customer-pricing`、`wk-train-center`、`wk-mhc-ui`

---

## 已知项目目录(速查)

### 集合项目(2 个)

| 项目 | 文档位置 |
|---|---|
| **wk-train-center** | `.products/projects/wk-train-center/` |
| **customer-pricing** | `.products/projects/customer-pricing/` |

### 单集项目(2 个)

| 项目 | 文档位置 |
|---|---|
| wk-mhc-ui | `.products/projects/wk-mhc-ui/` |
| wk-user | `.products/projects/wk-user/` |

### wk-train-center 集合下组件(5 个)

> 2026-09-28 重构:**组件 + 版本号**二级结构

| 组件 | 对应原项目 | 当前版本 | 角色 |
|---|---|---|---|
| `backend/` | wk-train-center-service | 1.5 | 后端 |
| `frontend/` | wk-train-center-ui(1.5)+ wk-train-center-ui-v3(v3) | 1.5 + v3 | PC 前端 |
| `mobile/` | wk-mhc-mobile | 1.5 | H5 移动端 |
| `pptist/` | wk-PPTist-ui | 1.0 | PPT 工具 |
| `origin/` | (新增) | 1.0 | 原始资料 + 反向索引 |

### customer-pricing 集合下组件(4 个)

| 组件 | 当前版本 | 角色 |
|---|---|---|
| `backend/` | 1.0(已有内容) | 后端 |
| `frontend/` | 1.0(框架,待补) | 前端 |
| `mobile/` | 1.0(框架,待补) | 移动端 |
| `origin/` | 1.0(待建) | 原始资料 |

### 标准目录结构

```
{项目名}/{组件名}/{版本号}/{docs|plans|reviews|tasks|db}/
```

> `vault/` 不是项目,是跨项目知识库,不放项目文档。
> `wk-train-center-backup/` / `customer-pricing-backup/` 是重构前的备份。

---

## 触发场景(必须 hook)

- ✍️ 准备用 Write/Edit 创建文档类文件
- 📄 准备生成报告 / 草稿 / 交接文档
- 📚 准备建教学课程 / 速查表
- 📊 准备画流程图 / Mermaid / 架构图
- 📑 准备生成 Word / PDF
- 📁 准备建新目录(项目级)

**例外**(可自行决定位置):
- 修缮已有文件(不创建新文件)
- 在主人明确指定的位置写

---

## 关联

- 主公全局规则:`C:\Users\RUHAI\.claude\CLAUDE.md` §8 自我进化机制(写文档前必须先问)
- 项目级工作区规则:`E:\rhProject\CLAUDE.md`
- 项目级 Agent 路由:`E:\rhProject\AGENTS.md`(若存在)