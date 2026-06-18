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

> 个人/工作知识库 — 主人(RUHAI)看的东西、做的项目、踩过的坑。
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
├── raw/                  ← 原始材料(不动,只追加)
│   ├── articles/         ← 网页、小红书、博客
│   ├── papers/           ← PDF/论文
│   ├── transcripts/      ← 会议、访谈
│   └── assets/           ← 图片、附件
├── entities/             ← 实体页(人/项目/工具/产品)
├── concepts/             ← 概念页(技术/方法/原理)
├── comparisons/          ← 横向对比
├── queries/              ← 值得保留的查询结果
└── _meta/                ← 索引、主题地图
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
type: entity | concept | comparison | query | summary | meta
tags: [从下方 taxonomy 选]
sources: [raw/articles/source-name.md]   # 引用过哪些原始材料
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

- 内容被完全替代 → 移到 `_meta/_archive/`,从 index 移除
- 跟现在的方向完全不一致(过时的技术栈/换赛道)→ 同上

## 引用规范

引用原始材料用 `^[raw/articles/xxx.md]` 标在段落末尾。
读者一眼能溯源,不需要再翻原始文件。

## 更新策略

1. 同一事实在不同源里冲突 → **以日期近的为准**,老源降为"早期认知"
2. 真冲突且不能消解 → 两个观点都写,frontmatter 加 `contested: true`
3. 任何更新 → 改 `updated` 字段,加 log
