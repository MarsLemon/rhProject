---
title: Hermes × Obsidian × Claude Code 工作流
created: 2026-06-18
updated: 2026-06-18
type: concept
tags: [ai, methodology, obsidian, workflow]
sources: []
confidence: high
---

# Hermes × Obsidian × Claude Code 工作流

> 这份是"以后就照着这个走"的 SOP。
> 三个角色边界清楚——别让一个人干两个人的活,效率最低。

## 三角色分工

| 角色 | 干什么 | 不干什么 |
|---|---|---|
| **Hermes(我)** | **知识整理 + 调度 + 查**——把原始材料消化成笔记、回答"以前咱们怎么做的"、跑定时任务 | 不直接调 Obsidian 编辑器 |
| **Obsidian** | **看 + 编辑**——主人翻笔记、画脑图、做 Daily、跑 Dataview 查询 | 不主动改内容(被动响应) |
| **Claude Code** | **写代码 + 临时写技术笔记**——修 bug、改文件、生成 fix-plan 草稿 | 不管"主人想到一句话该放哪"这种生活流 |

**关键边界**:Claude Code 写的 fix-plan 草稿 → 进 `00-Inbox/` → 主人拍板 → Hermes 消化归档。**不直接进 21-fix-plans-修复经验/**(避免 Claude 的命名跟 SCHEMA 不一致)。

## 三条主流程

### 流程 1:主人随手记 → Inbox → 消化(轻)

```
主人(微信/小红书/脑子一闪)
   ↓  QuickAdd(Ctrl+P) 或 跟我说一声
00-Inbox/2026-06-19-xxx.md
   ↓  主人说"小马消化 inbox"(每天/每周任意时刻)
Hermes 读 inbox → 按类型分流:
   ├─ 一次性事实(bug/命令/小技巧)  → 21-fix-plans-修复经验/2026MMDD-xxx.md
   ├─ 反复出现的概念/方法           → 20-concepts-已消化笔记/xxx.md
   ├─ 调研材料(URL/文档)           → 10-raw-原始材料/articles/ + 20-concepts-已消化笔记/调研/总结
   └─ 暂时不分类                    → 留在 Inbox,等下次
   ↓
index.md 加链接 + log.md 追加 + frontmatter 补齐
```

**节奏**:**主人控制**,不主动催。一周不消化不算事故,怕的是**主人没意识到有未消化项**——解决方案是每周日晚 cron 跑一次"列出 Inbox 文件数 > 0 提醒"。

### 流程 2:主人提问 → 先查 vault(重)

```
主人: "上次咱们怎么修那个 xlsx 导入错位的?"
   ↓
Hermes 第一动作:读 index.md + search_files("xlsx 导入")
   ↓
├─ 找到 → 引用 [[21-fix-plans-修复经验/2026-06-11-qu-import-template-mismatch]]
│         直接答,附"以前怎么做的 + 学到什么"
└─ 没找到 → 查外网 / 问主人
   ↓
值得留 → 写进 31-queries-查询归档/YYYY-MM-DD-主人问的问题.md(以后同类问题秒答)
不值得留 → 口头答完结束
```

**节奏**:**每次必走**。哪怕主人问"1+1",我也先 vault 查一遍(虽然 99% 查不到,但保证习惯不丢)。

**例外**:"快速闲聊"不查 vault——主人说"今天天气如何",直接答天气,别先查一遍天气笔记。

### 流程 3:Claude Code 干活 → 自动沉淀(中重)

```
Claude Code 修 bug 完
   ↓
生成 fix-plan 草稿(放工作区临时位置,不直接进 vault)
   ↓
跟主人说"这个 bug 修完了,要不要塞 vault?"
   ↓ 主人点头
塞 00-Inbox/(带 type=fix-plan-draft 标签)
   ↓
下次走流程 1 消化,落到 21-fix-plans-修复经验/
```

**节奏**:**主人拍板**。Claude 不主动改 vault,避免跟 SCHEMA 不一致。

## 角色边界(主人最常踩的坑)

1. **问"Hermes 怎么修这个 bug"** → ❌ 应该让 **Claude Code 修**;我(Hermes)只负责查"以前怎么修过类似的"
2. **问"Hermes 把这段代码贴进 vault"** → ❌ 贴代码用 Claude Code(写者);我负责"这段代码改不改你的笔记体系"
3. **问"Obsidian 这个插件怎么用"** → ✅ 问我,我查 vault + 给你查外网
4. **问"vault 怎么用"** → ✅ 问我,先读 SCHEMA + index + log 三件套,再答

## 启动清单(主人第一次用时)

- [x] Obsidian 装好,打开 `HermesVault/`
- [x] 13 个插件装齐(8 件套 + 5 件)
- [x] Dataview 验证通过(index.md 末尾查询可见)
- [x] **主人拍板流程 1 的消化节奏** — 选 C:**随叫 + 周末提醒**(cron 每周日 20:00 提醒)
- [x] **主人决定流程 3 是否启用** — 选 A:**启用**,Claude 修完 bug 默认问「塞不塞 vault」
- [x] 第一次消化测试 — 等主人随时启动(扔 3 条 Inbox)

## 跟其他概念的关系

- [[llm-wiki]] — Karpathy 模式,这套 SOP 是它的"操作版"
- [[hermes-skill-system]] — 我(Hermes)怎么组织自己的 skill
- [[SCHEMA]] — vault 的字段、命名、frontmatter 规约
- [[INVENTORY]] — 5 组件工具栈快照
- [[8件套插件说明]] — 13 个插件每个干啥
- [[21-fix-plans-修复经验/README]] — 21-fix-plans-修复经验/ 这个目录的子索引
- [[log]] — 改动流水
