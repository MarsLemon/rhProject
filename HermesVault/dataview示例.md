---
title: Dataview 示例
created: 2026-06-18
updated: 2026-06-18
type: meta
tags: [meta, obsidian, dataview]
---

# Dataview + Templater 示例

> 装完 Dataview / Templater 后,把这页打开,所有代码块直接出结果。
> 想试哪个 → 复制到自己的笔记里。

---

## 1. 最常用的 4 类查询

### 列出所有 concept 页(按更新时间倒序)

```dataview
TABLE title, updated
FROM ""
WHERE type = "concept"
SORT updated DESC
LIMIT 20
```

### 列出"还没确定"的页面(confidence = low)

```dataview
LIST
FROM ""
WHERE confidence = "low"
```

### 列出最近 7 天改动的页面

```dataview
TABLE title, type, updated
FROM ""
WHERE updated >= date(today) - dur(7 days)
SORT updated DESC
```

### 列出某标签下的所有页(以 ai 标签为例)

```dataview
TABLE title, type
FROM ""
WHERE contains(tags, "ai")
SORT file.cday ASC
```

---

## 2. 实战:看主人知识库现状

### 多少页 / 按类型分组

```dataview
TABLE length(rows) as "页数"
FROM ""
GROUP BY type
```

### 待消化的"原始材料"(raw/ 下但还没引用过)

```dataview
LIST
FROM "raw"
WHERE !contains(sources, this.file.path)
```

### 高置信度 vs 低置信度

```dataview
TABLE title, type
FROM ""
WHERE confidence = "high"
SORT updated DESC
```

```dataview
TABLE title, type, sources
FROM ""
WHERE confidence = "low" OR confidence = "medium"
SORT updated DESC
```

---

## 3. 跟 Templater 配合的 3 个模板

把下面 3 段直接复制到 Templater 设置里:

### 模板 1:日清单(`Daily`)

文件名:`YYYY-MM-DD-日清单.md`

```markdown
---
title: <% tp.date.now("YYYY-MM-DD") %> 日清单
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
type: summary
tags: [daily]
---

# <% tp.date.now("YYYY-MM-DD") %> 日清单

## 今日核心
-

## 任务
- [ ]

## 想法 / 灵感
-

## 明日
-
```

### 模板 2:研究笔记(`Research`)

文件名:`<主题>.md`,触发:QuickAdd → Research

```markdown
---
title: <% tp.file.title %>
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
type: concept
tags: []
sources: []
confidence: medium
---

# <% tp.file.title %>

## 一句话定义

## 为什么关心

## 关键事实
-

## 还没弄清的
-

## 相关
-

## 来源
-
```

### 模板 3:小红书 / 文章速记(`Article`)

文件名:`<日期>-<标题>.md`,触发:QuickAdd → Article

```markdown
---
title: <% tp.file.title %>
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
type: summary
tags: [article]
sources: []
---

# <% tp.file.title %>

## 链接
<% tp.user.url() %>

## 核心观点(3 条内)
1.
2.
3.

## 我的想法

## 行动项
- [ ]
```

---

## 4. 性能小贴士

| 坑 | 解决 |
|---|---|
| 几百页后查询变慢 | 加重索引:Settings → Dataview → "Index" 全开 |
| 想查非 frontmatter 内容 | 用 `dataviewjs` 不是 `dataview` |
| 排序乱 | 显式 `SORT field ASC/DESC` |
| 中文标签查不到 | `contains(tags, "前端")` 直接匹配 |

---

## 5. 一键试

把下面这段**整段**粘到 vault 任意一页(主测试页),看有没有渲染出表格:

````markdown
```dataview
TABLE title, type, updated
FROM ""
WHERE type = "meta"
SORT updated DESC
```
````

应该出 3 行:`SCHEMA` / `Wiki Index` / `8件套插件说明` / `Dataview 示例`(第 4 行就是这个示例自己)。
