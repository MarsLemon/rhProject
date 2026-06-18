---
title: Hermes 内部使用手册(从 memory 同步的干货)
created: 2026-06-18
updated: 2026-06-18
type: concept
tags: [ai, hermes, methodology]
sources: [Hermes memory: 全量 2026-06-18]
confidence: high
---

# Hermes 内部使用手册

> 这份是 **Hermes memory 干货版**——把分散在 memory 里的 6 条"有半衰期"的规矩
> 打包成主人和小马都能看的文档。
>
> **不是** memory 全量(还有 4 条是"行为模式",**只给小马用**,写成文档反而死板)。
> **同步策略**:memory 有新干货 → 小马主动问主人要不要搬 vault,默认询问,不自动同步。

## 6 条干货

### 1. 工具栈 5 组件(2026-06-18 变阵)

> 详细见 [[INVENTORY]]。

| 角色 | 工具 |
|---|---|
| 出知识 | **Qoder**(repowiki) |
| 写代码 | **VSCode + Claude Code 插件**(前端+后端 debug) |
| 跑重型 | **Claude Code CLI**(-p / tmux / -w 三模式) |
| 跑服务 | **终端** |
| 调度全局 | **Hermes**(跨 IDE 批量改 / kg_query 跨模块分析 / 定时后台) |

**已退役**: IDEA(2026-06,Java 加成被稀释)+ Cursor(2026-06,被 Qoder+VSCode 拆分替代)。

**底层共享 MiniMax-M3**。

### 2. 审计方法论(见 [[审计方法论]])

用 `os.walk` 不用 git;选项给 context;结论带字节数。

### 3. 陪练方案沟通节奏(2026-06-17)

RUHAI 给领导汇报类方案会做 5+ 轮迭代压缩:
1) 完整初稿 6-9 章 → 2) 砍掉 1-2 章(成本/落地) → 3) 压到 1 页 →
4) 换格式(docx→xlsx 嵌入需求单) → 5) 再压

要点:
- **领导拍板后不再问"要不要再调", 直接执行**
- 术语用**中文 AI 行话**(多智能体/自我审视/数据飞轮),**别用纯英文** RLHF/Self-Critique
- 案例用**真业务场景**(船舶英语/工务/教务)别用泛例(光合作用)

### 4. Cron 任务运行韧性(见 [[cron-runtime-resilience]])

MiniMax 5h 窗口实测是 24h 周期(每日 0:00 重置);限流和 429 两种错要分别处理;改底层脚本别改 cron prompt。

### 5. Vault 编辑铁律(见 [[SCHEMA]] 编辑铁律节)

- 改前必 ls 现场
- 改 vault 用 `patch` 不用 `mcp_filesystem_edit_file`
- 跨工作区一律绝对路径
- 操作前必读 SCHEMA + index + log

### 6. Hermes persona 配置(主人级,慎动)

- 路径:`C:\Users\RUHAI\.hermes\persona.md`(default profile)
- **改完必须重启 Hermes 桌面 app 新会话才生效**(已踩坑)
- 文件用 HTML 注释开头 + 自然语言描述
- 其他 profile / 其他 IDE(Cursor/Qoder/IDEA AI)不读这份文件

## 不在文档的 4 条(只给小马用,锁在 memory)

| 内容 | 为什么留 memory |
|---|---|
| 协作风格(列 2-4 方案+trade-off+等单字符) | 写文档=锁死,以后想改反而要同步两份 |
| 微信 vs 桌面边界 | 跟 IDE 实时交互绑死,文档化反而变味 |
| 工具栈 5 组件里"Cron 派发必带 workdir+max-turns+CLAUDE.md 摘要" | 是给小马**调度时**的,主人不需要 |
| 工具栈里"不写 CLAUDE.md" | 是小马对 Claude Code 的**硬约束**,写在 skill 里更合适 |

## 同步策略(2026-06-18 立)

- **memory 新增/更新** → 小马**主动问**主人"要不要搬 vault"
- 默认**询问**,**不自动同步**(避免误把行为模式文档化)
- **判断标准**:干货(半衰期 > 1 年)→ 建议搬;行为模式(影响对话风格)→ 不搬
- **现有 6 条**:本份已是 2026-06-18 快照,以后增删查 [[log]] 里 `## [YYYY-MM-DD] memory-sync` 段

## 相关

- [[SCHEMA]] — vault 规约(编辑铁律的源头)
- [[hermes-skill-system]] — Hermes skill 体系
- [[INVENTORY]] — 工具栈 5 组件档案
- [[审计方法论]] — 第 2 条
- [[cron-runtime-resilience]] — 第 4 条
- [[log]] — 同步流水
