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

> 个人/工作知识库 — 主人(沈超)看的东西、做的项目、踩过的坑。
> 涵盖:AI 工具流、技术调研、Vue/前端、后端、业务方法论。

## 上线状态(2026-06-18)

- ✅ Obsidian Windows 桌面端 + 8 件套第三方插件全部装齐
- ✅ Dataview 渲染验证通过(index.md 末尾查询可见表格)
- ✅ vault 路径: `E:\rhProject\HermesVault\`
- ✅ git 状态: 未追踪(主人自行决定是否 commit)

## 目录结构

```
HermesVault/
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

| 类型 | 规范 | 例 |
|---|---|---|
| 文件名 | 小写 + 短横线 | `hermes-agent.md` |
| 实体页 | 单数,核心名 | `claude-code.md` |
| 概念页 | 主题或方法名 | `ddd-analysis.md` |
| 资源原始 | 来源-标题-日期 | `karpathy-llm-wiki-2026.md` |

## Frontmatter(每页必填)

```yaml
---
title: 页面标题
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: entity | concept | comparison | query | summary | meta | fix-plan
tags: [从下方 taxonomy 选]
sources: [10-raw-原始材料/articles/source-name.md]   # 引用过哪些原始材料
confidence: high | medium | low          # 默认 medium
---
```

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

> 详细流程见 [[hermes-obsidian-workflow]]。这里只写**新文件必须怎么流**。

| 主人做什么 | 进哪个目录 | 谁负责落地 |
|---|---|---|
| 微信/小红书看到好东西想存 | `00-Inbox/` | 主人自己 QuickAdd |
| 脑子里冒个概念但没想清楚 | `00-Inbox/` | 主人随手记,等"小马消化" |
| Bug / 命令 / 小技巧(一次性) | `21-fix-plans-修复经验/2026MMDD-xxx.md` | Hermes 消化时新建 |
| 反复出现的概念 / 方法 | `20-concepts-已消化笔记/xxx.md` | Hermes 消化时新建 |
| 调研材料(URL/文档) | `10-raw-原始材料/articles/`(原件) + `20-concepts-已消化笔记/调研/`(总结) | Hermes 双写 |
| Claude Code 修完 bug | 先放工作区,主人拍板后塞 `00-Inbox/` | 主人 |
| 工具用法(IDE/CLI/插件) | `23-Tools-工具用法/xxx.md` | 主人或 Hermes |
| 任何**未确定**的 | 留在 `00-Inbox/`,不打 tag | — |

**铁律**:
- 不知道放哪 → 先进 Inbox,**别硬塞**
- 任何新文件必须带 frontmatter,不然 Dataview 查不到
- 任何新文件必须出现在 index.md,不然找不到
- 任何动作必须写 log.md,不然时间线断了

## Vault 编辑铁律(2026-06-18 从 Hermes memory 同步)

> 改 vault 文件**前**必看,踩过的坑都在这。详细 6 条源头见 [[hermes-internal-cheatsheet]]。

1. **改前必 ls 现场** — 任何 vault 操作先去磁盘/`mcp_filesystem_directory_tree` 确认真实状态,别凭注入的 memory 拍路径
2. **改 vault 文件用 `patch` 工具** — 不用 `mcp_filesystem_edit_file` 的 exact-match 模式(中文引号转义坑,会老挂)
3. **跨工作区/跨子项目引用一律绝对路径** — Windows 反斜杠格式如 `E:\rhProject\xxx`;`[[wikilink]]` 只用于 vault 内部
4. **任何 vault 操作前读 SCHEMA + index + log** — 不读会造重复页、漏交叉引用
