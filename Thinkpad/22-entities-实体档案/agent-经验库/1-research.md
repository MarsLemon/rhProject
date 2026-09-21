---
title: 1-research 经验库
created: 2026-07-09
updated: 2026-07-09
type: meta
tags: [meta, master, research]
owner: 沈超
agent: 小马(架构师)
---

agent: 小马(架构师)
owner: 沈超

# 1-research 经验库

> **本类涵盖**:资料检索、wiki 维护、调研、查+写
> **适用**: research-only
> **绝对不写业务细节**——只写"如何让资料检索变强"的通用能力教训。

## 📋 经验索引(按能力维度)

| 维度        | 数量 | 简述                                  |
| ----------- | ---- | ------------------------------------- |
| 🔍 资料检索 | 1    | 出 SOP 前必核实际文件清单             |
| ❓ 反问澄清 | 1    | 子任务假设与实际差 ≥30% 必反问         |
| 🔧 实现     | 0    | 待补充                                |
| ✅ 验证     | 0    | 待补充                                |
| 🤝 协作     | 0    | 待补充                                |
| 🛡 边界     | 0    | 待补充                                |
| 📝 表达     | 0    | 待补充                                |

## 💡 经验条目

## [2026-07-08] 🔍 资料检索 — 出"目录重组 SOP"前必先核实际文件清单,不信子任务描述

**能力维度**: 🔍 资料检索 / ❓ 反问澄清
**触发**: 派单"出 agent-经验库合并 SOP"时,子任务写"18 份 expert 文件全有内容" + "`backend-specialist` + `data-specialist` 合并到 2-backend",但实际用 ls 核数 → 15 份是空壳(19-39 行占位模板),`backend-specialist`/`data-specialist` 文件根本不存在,真实存在的是 `backend-test`/`frontend-test`。
**抽象教训**: 子任务描述常带"假设性清单"(基于过往印象或类比),出 SOP/规范/合并方案时**第一步必用 ls/grep 数实际文件**,数清条数 + 数清名字再出方案;数完发现"假设与实际差太多"时,立刻反问主人确认方向,不擅自按"假设清单"硬出 SOP。
**反模式**: 信子任务描述直接出"18 份分类表" / 把不存在的文件名塞进归类映射 / 凭"该有"脑补"有"
**正模式**: 派单前 5 分钟 → `ls` 核目录 → `grep -c '^## \[20'` 数每份文件经验条数 → 出"现场盘点表" → 若与子任务描述差 ≥30%,反问主人拍方向(3 选项:按实际改/维持原/暂缓) → 据拍板出 SOP
**适用**: research-only
**复用计数**: 1
**状态**: 🟡 待验证

---

## [2026-07-20] 🔧 实现 — cron 频率拍板必带"行动项核验",否则沦为数据堆

**能力维度**: 🔧 实现 / 🛡 边界
**触发**: 主人 2026-07-20 反馈"之前做的 github 调研简单看一看,改为周调研 + 深度分析"。摸现状:`scripts/research-cron/run-research-batch.mjs` 每 5h 跑一次(老 cron `rhProject-research-cron` 每天每 10h 重复),从 7/9 至今 11 天 cron-counter 从 0 涨到 526,落盘 480+ raw + 26 个 20-concepts 主档。但翻老档案发现:**所有"行动项"checkbox 全员 `_待决_`,从未被打勾过** — 主人从没回过头消化这批数据。
**抽象教训**: **cron 类工具的"频率拍板"必须配套"行动项闭环"检查,缺一不可**。频率不只影响 IO,影响主人 / 小马能否真正消化。三层判断:

1. **数据生成 ≠ 数据消化** — cron 跑得越频繁,落盘越多,但**行动项不打勾 = 全部进 vault 等同于垃圾**。核心指标不是"采到多少条",而是"行动项勾选率"。本次 cron-counter 526 / 行动项 0 勾选 = 100% 数据积累、0% 数据消化
2. **频率 ↔ 节奏 ↔ 触达** — 频率太高(每 5h)→ 主人/小马不会每天去翻 20-concepts,行动项永不打勾;频率太低(每月)→ 完全失时效。中间节奏 = "周"是 sweet spot:周中能有时间消化 + 周日能捡 5 主题全覆盖 + 周三精读一次
3. **浅扫 + 精读分离,不要耦合在同一个 cron 里** — 浅扫是机器能干的(关键词 + stars 排序);精读需要语义判断(挑哪 3-5 条升 entity 卡 / 工具卡),必须留给主人开新会话 + 小马手工做

**反模式**:

- ❌ 把 cron 当"自动代理"用,以为跑得越多越有价值 — 实际无行动项闭环 = 100% 数据浪费
- ❌ 拍新频率不调旧 cron → 两条 cron 同时跑,数据互相冲突(老任务还在跑,新任务也开始跑,counter 链断)
- ❌ cron 直接调 LLM 做"深度分析" — 无 API key / Win 平台变量不注入 / 输出不稳定;改用"评分排序脚手架"先生成候选清单,精读留给新会话
- ❌ 拍板时只改频率,不改配套(行动项模板 / 候选清单格式 / 精读触发机制)— 改了也白搭

**正模式(本次落地)**:

1. **周节奏拆分**:
   - 周日 09:00 → `run-research-batch.mjs --weekly --all-topics` — 5 主题串行各 20 条 ≈ 100 条/周
   - 周三 14:00 → `run-deep-digest.mjs` — 扫周内新增 raw,按 stars + stack-hint 评分排序,top 5-10 落候选清单到 `Thinkpad/24-deep-digest/YYYY-Wnn.md`
   - 周三夜/周四 → 主人开新会话,小马读候选清单,精读挑 3-5 条升 entity / 工具 / 概念 卡
2. **行动项模板升级**(原老"丢 / 留 / 精读"留 _待决_ 50 多次):
   - cron 浅扫的 checkbox → 不在 cron 时打,留给精读时打
   - 精读 cron 的 checkbox → 落候选清单时**显式标精读要点 3 问 + 3 个候选路径**,减少"打过勾才发现是垃圾"
3. **schtasks 三件套同步改**:
   - 删 `rhProject-research-cron`(每 5h 老任务,490+ 数据堆但 0 消化)
   - 新建 `rhProject-research-weekly`(周日,跑浅扫)
   - 新建 `rhProject-research-deep-digest`(周三,跑候选清单)

**📎 证据链**:

- 现状数据(2026-07-20 实摸):cron-counter = 526 / 行动项 checkbox 勾选数 = 0 / 落盘文件 = 480+ raw + 26 主档 / 老 cron NextRunTime = 2026/7/20 16:00
- 老 cron 命令:`schtasks /Query /TN rhProject-research-cron /V /FO LIST` → "Repeat: Every 10 Hour" + "Days: Every day of the week"
- 老档案验证:`grep -r '\[x\]' Thinkpad/10-raw-原始材料/articles/` 返回 0 条,确认无任何行动项被打勾
- 新脚本验证:`node run-research-batch.mjs --weekly --all-topics --dry-run --max=3` 实跑,5 主题串行各 3 条共 11 条,与预期 100 条/周相符(mac=3 限了条数)
- 新 schtasks 验证:`schtasks /Query` → weekly NextRun=2026/7/26 周日 09:00;deep-digest NextRun=2026/7/22 周三 14:00
- 候选清单验证:`node run-deep-digest.mjs --window=2026-07-13..2026-07-20 --top=5` → 扫 221 条,top 5 排序合理(全部 ai-llm-agent 类,符合 cron 跑 ai-llm 主题的高频)
- 落地文件:
  - `E:\rhProject\scripts\research-cron\run-research-batch.mjs` 加 `--weekly`/`--all-topics`/`--topic=` + 抽 `runOneTopic()` 函数(N=5 主题串行调度)
  - `E:\rhProject\scripts\research-cron\run-deep-digest.mjs` 新建(评分 + 候选清单)
  - Windows Task Scheduler:`rhProject-research-weekly` + `rhProject-research-deep-digest` 已注册,老任务已删

**适用**: all(任何 cron 类工具的频率改写,跨 Java/Vue/research/ops)

**复用计数**: 1(本次首次)
**状态**: 🟡 待验证(待首周日 + 周三实测各跑 1 次后,看候选清单是否真被小马消化,升 🟢)

- **实施检查清单**:任何 cron 频率拍板前 → 1️⃣ 摸现状(cron-counter + 落盘文件数 + 行动项勾选率) → 2️⃣ 算"已经堆了多少没人看"= 数据浪费率 → 3️⃣ 决定频率 + 行动项闭环机制(精读 cron?) → 4️⃣ 改脚本 + 拆 schtasks(删老 + 建新,不留交叉)→ 5️⃣ 首周实测后看行动项是否真被消化
- **关联**:`shared-experiences.md` 2026-07-08 [评估先读 README/SCHEMA] — 拍板前必摸现场(本次先 ls / schtasks /Query 才出方案);2026-07-14 [version-registry 三件套] — 节奏变更也必"产品层 PRD 标记",否则 agent 找不到新节奏;1-research.md [出 SOP 前核实际文件清单] — 同样适用于 cron 频率决策

---

(后续经验由 1-research 在纠错时写入)

<!--
模板参考:
## [YYYY-MM-DD] [能力维度] — [经验标题]

**能力维度**: ...
**触发**: ...
**抽象教训**: ...
**反模式**: ...
**正模式**: ...
**适用**: research-only
**复用计数**: N(≥3 自动升 🟢)
**状态**: 🟡 待验证 / 🟢 已验证 / 🔴 已废弃
-->

## 📦 合并自

- `research-experiences.md`(1 条活经验 — 已转此文件作为首条,原文件归档至 `7-archive/`)
- `wiki-maintainer-experiences.md`(0 条,空壳,内容见 `7-archive/wiki-maintainer-experiences.md`)
