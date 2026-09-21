---
title: Wiki Schema
created: 2026-06-18
updated: 2026-06-18
type: meta
tags: [meta, schema]
---

# Wiki Schema

> 这个 vault 是 Hermes + Obsidian + LLM Wiki 三件套的本地知识库。
> Karpathy 模式 — 一份源材料只消化一次,以后查询是查"已经理解过的笔记",不是 RAG 临时抓。

## Domain

> 个人/工作知识库 — 沈超(沈超)看的东西、做的项目、踩过的坑。
> 涵盖:AI 工具流、技术调研、Vue/前端、后端、**思维方法论(不含具体业务)**。
>
> **不涵盖**:具体业务需求、客户定制功能、单一项目实体设计稿 —— 这类内容写到 `.products/projects/wk-train-center/`(产品层)或对应技术项目目录(技术层)。

## 上线状态(2026-06-18)

- ✅ Obsidian Windows 桌面端 + 8 件套第三方插件全部装齐
- ✅ Dataview 渲染验证通过(index.md 末尾查询可见表格)
- ✅ vault 路径: `E:\rhProject\Thinkpad\`
- ✅ git 状态: 未追踪(沈超自行决定是否 commit)

## 目录结构

```
Thinkpad/
├── SCHEMA.md             ← 你正在看的
├── index.md              ← 全站目录(打开 vault 第一眼)
├── log.md                ← 改动流水(append-only)
├── 8件套插件说明.md        ← Obsidian 插件安装指引
├── dataview示例.md         ← 开箱即用的查询样例
├── 10-raw-原始材料/                  ← 原始材料(不动,只追加)
│   ├── articles/         ← 网页、小红书、博客
│   ├── papers/           ← PDF/论文
│   ├── transcripts/      ← 会议、访谈
│   └── assets/           ← 图片、附件
├── 22-entities-实体档案/             ← 实体页(人/项目/工具/产品)
├── 20-concepts-已消化笔记/             ← 概念页(技术/方法/原理)
├── 21-fix-plans-修复经验/          ← 修复经验库
├── 23-Tools-工具用法/              ← 工具详细使用笔记
├── 30-comparisons-对比/          ← 横向对比
├── 31-queries-查询归档/              ← 值得保留的查询结果
└── 40-_meta-归档索引/                ← 索引、主题地图
```

## 命名规范

| 类型     | 规范           | 例                          |
| -------- | -------------- | --------------------------- |
| 文件名   | 小写 + 短横线  | `hermes-agent.md`           |
| 实体页   | 单数,核心名    | `claude-code.md`            |
| 概念页   | 主题或方法名   | `ddd-analysis.md`           |
| 资源原始 | 来源-标题-日期 | `karpathy-llm-wiki-2026.md` |

## Frontmatter(每页必填)

```yaml
---
title: 页面标题
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: entity | concept | comparison | query | summary | meta | fix-plan
tags: [从下方 taxonomy 选]
sources: [10-raw-原始材料/articles/source-name.md] # 引用过哪些原始材料
confidence: high | medium | low # 默认 medium
---
```

**type 说明**:

- `entity / concept / comparison / query / summary / meta / fix-plan` — 既有类型
- superpowers skill 的 `specs/` 与 `plans/` 产物属于业务设计,迁到 `.products/projects/wk-train-center/`,不进 Thinkpad

## 标签 taxonomy

**主题域**:

- `ai` / `frontend` / `backend` / `devops` / `product` / `methodology`

**实体类型**:

- `person` / `company` / `tool` / `project` / `paper` / `event`

**质量信号**:

- `decision` / `pivot` / `open-question` / `deprecated`
- `fix-plan` —— 修复计划/经验（2026-06-18 新增）

新标签先加这里,再用,避免标签通胀。

## 何时新建页面

- ✅ 实体/概念在 2 份以上原始材料里被提及
- ✅ 一个原始材料的**核心主题**
- ❌ 只是顺带提一下的小细节
- ❌ 一次性的临时结论(直接发到 log)

## 何时拆页

- 超过 **200 行** → 拆成子主题,顶层页留摘要 + 子页链接
- 一个页面挂了 3 个以上不同子主题 → 拆

## 何时归档

- 内容被完全替代 → 移到 `40-_meta-归档索引/_archive/`,从 index 移除
- 跟现在的方向完全不一致(过时的技术栈/换赛道)→ 同上

## 引用规范

引用原始材料用 `^[10-raw-原始材料/articles/xxx.md]` 标在段落末尾。
读者一眼能溯源,不需要再翻原始文件。

## 更新策略

1. 同一事实在不同源里冲突 → **以日期近的为准**,老源降为"早期认知"
2. 真冲突且不能消解 → 两个观点都写,frontmatter 加 `contested: true`
3. 任何更新 → 改 `updated` 字段,加 log

## 工作流 SOP(2026-06-18 立)

> 详细流程见 [[20-concepts-已消化笔记/2026-06/2026-06-18-三件套协作SOP]]。这里只写**新文件必须怎么流**。

| 沈超做什么                  | 进哪个目录                                                               | 谁负责落地              |
| --------------------------- | ------------------------------------------------------------------------ | ----------------------- |
| 微信/小红书看到好东西想存   | `00-Inbox/`                                                              | 沈超自己 QuickAdd       |
| 脑子里冒个概念但没想清楚    | `00-Inbox/`                                                              | 沈超随手记,等"小马消化" |
| Bug / 命令 / 小技巧(一次性) | `21-fix-plans-修复经验/2026MMDD-xxx.md`                                  | Hermes 消化时新建       |
| 反复出现的概念 / 方法       | `20-concepts-已消化笔记/xxx.md`                                          | Hermes 消化时新建       |
| 调研材料(URL/文档)          | `10-raw-原始材料/articles/`(原件) + `20-concepts-已消化笔记/调研/`(总结) | Hermes 双写             |
| Claude Code 修完 bug        | 先放工作区,沈超拍板后塞 `00-Inbox/`                                      | 沈超                    |
| 工具用法(IDE/CLI/插件)      | `23-Tools-工具用法/xxx.md`                                               | 沈超或 Hermes           |
| 任何**未确定**的            | 留在 `00-Inbox/`,不打 tag                                                | —                       |

**铁律**:

- 不知道放哪 → 先进 Inbox,**别硬塞**
- 任何新文件必须带 frontmatter,不然 Dataview 查不到
- 任何新文件必须出现在 index.md,不然找不到
- 任何动作必须写 log.md,不然时间线断了

## Vault 编辑铁律(2026-06-18 从 Hermes memory 同步)

> 改 vault 文件**前**必看,踩过的坑都在这。详细 6 条源头见 [[20-concepts-已消化笔记/2026-06/2026-06-18-Hermes内部使用手册]]。

1. **改前必 ls 现场** — 任何 vault 操作先去磁盘/`mcp_filesystem_directory_tree` 确认真实状态,别凭注入的 memory 拍路径
2. **改 vault 文件用 `patch` 工具** — 不用 `mcp_filesystem_edit_file` 的 exact-match 模式(中文引号转义坑,会老挂)
3. **跨工作区/跨子项目引用一律绝对路径** — Windows 反斜杠格式如 `E:\rhProject\xxx`;`[[wikilink]]` 只用于 vault 内部
4. **任何 vault 操作前读 SCHEMA + index + log** — 不读会造重复页、漏交叉引用

---

## 文档编写规范(2026-07-07 立 · 沈超)

> 本节是 vault 内**任何 markdown 文档**的统一写作规约,与"目录结构 / frontmatter / 标签"等并列,**写之前必看**。

### 1. 称呼 / Owner 字段

| 位置                | 写法                                  | 错误示例                      |
| ------------------- | ------------------------------------- | ----------------------------- |
| 正文叙述            | 直接用**沈超**(不写"沈超",不写"用户") | ~~沈超觉得...~~ → 沈超觉得... |
| Frontmatter `owner` | `owner: 沈超`                         | ~~owner: 沈超~~               |
| Frontmatter `agent` | 谁起草写谁,见 §2                      | —                             |

> 历史文档若仍含"沈超"字样,在迁移时一并替换;迁移日志注明。

### 2. agent 行(起草者声明)

每篇文档**正文开头第二行**(frontmatter 之后)起一行,声明本次文档的起草者:

```markdown
---
title: xxx
created: 2026-07-07
agent: 小马(架构师)        ← 或具体专家名
owner: 沈超
---

agent: Java 后端专家 ← 或更细:产品经理 / Wiki 维护 / 前端测试专家 / ...
owner: 沈超

# 文档标题

... 正文 ...
```

| 角色                       | 用谁写                                         | 例                                 |
| -------------------------- | ---------------------------------------------- | ---------------------------------- |
| 跨域路由文档 / 元方法论    | 小马(架构师)                                   | SOP / 流程图 / 跨栈调度经验        |
| 单一后端改动               | Java 后端专家                                  | API 文档 / 实体设计 / SQL 脚本说明 |
| 单一前端改动               | Vue2 专家 / Vue3 专家 / Angular 专家 / H5 专家 | 组件文档 / 页面迁移笔记            |
| 测试相关                   | 前端测试专家 / 后端测试专家                    | 测试用例 / 验证报告                |
| PRD / 用户故事 / 验收标准  | 产品经理                                       | PRD / 用户故事 / 验收卡            |
| 任务排期 / 进度            | 项目经理                                       | 任务分解 / 排期表                  |
| 文档同步 / changelog / ADR | Wiki 维护                                      | changelog / ADR / 接口契约         |

> 一个文档多人参与 → 多个 `agent:` 行,按贡献度排序,第一行为**主笔**。

### 3. 目录结构(强制月目录)

任何**业务文档**(非顶级入口)必须落在**创建月份**目录下:

```
Thinkpad/
├── SCHEMA.md                  ← 顶级,不动
├── index.md                   ← 顶级,不动
├── README.md                  ← 顶级,不动
├── 99-log/                    ← log 月目录(2026-07-07 改)
│   ├── 2026-06/
│   │   └── log-2026-06.md     ← 当月改动流水
│   └── 2026-07/
│       └── log-2026-07.md     ← 本月新建
├── 00-Inbox/                  ← inbox 不走月目录(临时)
├── 10-raw-原始材料/
│   └── 2026-07/
│       └── 2026-07-07-xxx-原始材料.md
├── 20-concepts-已消化笔记/
│   └── 2026-07/
│       └── 2026-07-07-xxx(中文主旨).md
├── 21-fix-plans-修复经验/
│   └── 2026-07/
│       └── 2026-07-07-xxx(中文主旨).md
├── 22-entities-实体档案/
│   └── 2026-07/
│       └── 2026-07-07-xxx(中文主旨).md
├── 23-Tools-工具用法/
│   └── 2026-07/
│       └── 2026-07-07-xxx(中文主旨).md
├── 30-comparisons-对比/
│   └── 2026-07/
│       └── 2026-07-07-xxx(中文主旨).md
├── 31-queries-查询归档/
│   └── 2026-07/
│       └── 2026-07-07-xxx(中文主旨).md
└── 40-_meta-归档索引/
    └── 2026-07/
        └── 2026-07-07-xxx(中文主旨).md
```

### 4. 文件命名

```
YYYY-MM-DD-xxx(中文主旨概要).md
```

| 字段               | 规范                                                           | 例                                                                         |
| ------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 日期               | `YYYY-MM-DD`,与 `created` 字段一致                             | `2026-07-07`                                                               |
| 连接符             | 一个半角连字符 `-`,不用空格 / 下划线                           | —                                                                          |
| 中文主旨           | **≤ 20 字**,动词或名词短语,**不要写"关于 xxx 的笔记"这种废话** | ✅ `vue3-迁移踩坑记录` / ❌ `关于 vue3 迁移过程中遇到的一些问题的记录笔记` |
| 主题类型前缀(可选) | `调研-` / `坑-` / `对比-` / `实体-` 等,便于 dataview 检索      | `2026-07-07-调研-密码学前沿.md`                                            |

> 同一天多个同主题 → 加后缀 `-v2` / `-补充` 等;不要用 `-1` `-2` 这种无意义编号。

### 5. 文档内部结构模板

```markdown
---
title: <一句话标题>
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: concept | entity | fix-plan | comparison | query | meta | design-doc
owner: 沈超
agent: <具体专家名>
tags: [主题域, 实体类型, 质量信号]
sources: [<引用过的原始材料路径>]
confidence: high | medium | low
---

agent: <具体专家名> ← 与 frontmatter.agent 一致,便于纯文本阅读
owner: 沈超

# <标题>

> 一句话 TL;DR(必填)

## 背景 / 上下文

## 正文

## 跨模块影响 / 后续 TODO

## 引用

- [[相关页面]]
```

### 6. 旧文档迁移规则

- 老文档迁月目录 = `mv` + 按规范起名(中文主旨)
- 老 `[[wikilink]]` 自动失效 → **全文 grep 找 `[[xxx]]`,逐一修正为新路径**
- log.md 改名:根目录 `log.md` → `99-log/2026-06/log-2026-06.md`(归档本月之前的流水)+ 新建 `99-log/2026-07/log-2026-07.md`
- 迁移在 log 写一条 `## [YYYY-MM-DD] migrate | 全 vault 月目录化`

### 7. 例外

- **00-Inbox/** 不走月目录(临时收集,经常变)
- **SCHEMA / index / README / Tags/** 顶级不动
- **10-raw-原始材料/** 可选月目录(整本 PDF / 一篇文章放当月)
- **agent-经验库/** (`22-entities-实体档案/agent-经验库/`) 暂不走月目录(高频追加,稳定性优先);**待观察,后续评估**
