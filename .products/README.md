# `.products` 工作区目录

> 本目录存放工作区的"业务文档 / 教学 / 交接 / 元规则",与代码项目对齐
> **不**放代码、不放配置、不放临时文件

---

## 目录结构

```
.products/
├── README.md                    ← 本文件(总览)
├── CLAUDE.md                    ← 项目级 hook(写文档规则,详见 §3)
├── projects/                    ← 项目文档(每个代码项目一个子目录)
│   ├── customer-pricing/
│   ├── wk-train-center/
│   ├── wk-train-center-service/
│   ├── wk-mhc-ui/
│   ├── wk-mhc-mobile/
│   ├── wk-user/
│   └── wk-PPTist-ui/
└── docs/                        ← 跨项目元规则(慎放,只放工作区级)
    └── (按需)
```

---

## §1 项目文档目录模板

每个项目子目录内部结构:

```
projects/{项目名}/
├── README.md                ← 项目说明
├── reports/                 ← 报告 / 需求草稿
├── handoff/                 ← 项目交接
├── teach/                   ← 项目学习课程
├── decisions/               ← ADR / 决策记录
└── reference/               ← 速查表
```

**项目目录命名**:与代码项目同名,全小写,短横线连接。

---

## §2 已知项目目录速查

### 独立项目 + 集合(2026-09-28 重构后)

| 项目类型 | 代码项目 | 文档位置 |
|---|---|---|
| 集合 | **wk-train-center** | `.products/projects/wk-train-center/` |
| 集合 | **customer-pricing** | `.products/projects/customer-pricing/` |
| 单集 | wk-mhc-ui | `.products/projects/wk-mhc-ui/` |
| 单集 | wk-user | `.products/projects/wk-user/` |

### wk-train-center 集合下组件(5 个)

> 2026-09-28 重构:**组件 + 版本号 + 文档类型**三级结构

| 组件 | 对应原项目 | 当前版本 | 角色 |
|---|---|---|---|
| `backend/` | 原 wk-train-center-service | 1.5 | 后端 Java |
| `frontend/` | 原 wk-train-center-ui(Vue2)+ wk-train-center-ui-v3(Vue3) | 1.5 + v3 | PC 前端 |
| `mobile/` | 原 wk-mhc-mobile | 1.5 | H5 移动端 |
| `pptist/` | 原 wk-PPTist-ui | 1.0 | PPT 工具 |
| `origin/` | (新增) | 1.0 | 原始资料 + 反向索引 |

### customer-pricing 集合下组件(4 个)

| 组件 | 当前版本 | 角色 |
|---|---|---|
| `backend/` | 1.0(已有内容) | 后端 |
| `frontend/` | 1.0(框架,待补) | 前端 |
| `mobile/` | 1.0(框架,待补) | 移动端 |
| `origin/` | 1.0(待建) | 原始资料 |

### 标准目录结构(项目 + 组件 + 版本)

```
{项目名}/
├── README.md              # 集合级说明 + 版本跟踪表
├── _index.md              # 组件索引
└── {组件名}/
    ├── README.md          # 组件级说明
    └── {版本号}/
        ├── docs/          # 文档类型
        ├── plans/
        ├── reviews/
        ├── tasks/
        ├── db/            # 后端专属
        └── *.md
```

### 其他

> 注:`vault/` 不是项目,是跨项目知识库(主公自有命名),不放项目文档。
> `wk-train-center-backup/` / `customer-pricing-backup/` 是重构前的备份。

---

## §3 文档管理规范

### 3.1 写文档前的强制规则

**任何文档类文件落笔前,必须先问主公**:

1. **放在哪个项目下?**
2. **具体路径是什么?**
3. **主公确认后才能写**

### 3.2 触发场景(必须 hook)

以下场景触发"先问"规则:

- ✍️ 报告 / 草稿 / 交接文档
- 📚 教学课程 / 速查表
- 📊 流程图 / Mermaid / 架构图
- 📑 Word / PDF 生成
- 📁 建新目录(项目级)
- 📂 跨项目元规则(放 `.products/docs/` 顶层时)

### 3.3 例外(可自行决定位置)

- 修缮已有文件(不创建新文件)
- 主人明确指定位置
- 在已有项目 README 中追加内容

### 3.4 禁止位置

| ❌ 禁止 | 原因 |
|---|---|
| `.products/docs/` 顶层(除跨项目元规则) | 项目文档应该归到具体项目 |
| 不同项目混放 | 后续查找难 |

---

## §4 文档类型与位置对照

| 文档类型 | 应该放的位置 |
|---|---|
| **项目报告 / 需求草稿** | `.products/projects/{项目名}/reports/` |
| **项目交接文档** | `.products/projects/{项目名}/handoff/` |
| **项目学习课程** | `.products/projects/{项目名}/teach/` |
| **项目决策 / ADR** | `.products/projects/{项目名}/decisions/` |
| **项目速查表** | `.products/projects/{项目名}/reference/` |
| **项目 README** | `.products/projects/{项目名}/README.md` |
| **跨项目元规则** | `.products/CLAUDE.md` / `.products/README.md` |
| **业务域硬约束**(跨项目业务规则) | `.products/docs/`(如使用) |

---

## §5 文档格式建议

- Markdown 优先(.md),便于 git 跟踪
- Word/PDF 用 pandoc 从 md 生成
- 文档开头标注版本 + 日期 + 性质
- 链接用相对路径(`./xxx.md`)

---

## §6 关联

- **主公全局硬约束**:`C:\Users\RUHAI\.claude\CLAUDE.md` §8(写文档前必须先问)
- **项目级 hook**:`E:\rhProject\.products\CLAUDE.md`
- **Agent 经验库**:`E:\rhProject\Thinkpad\22-entities-实体档案\agent-经验库\shared-experiences.md`