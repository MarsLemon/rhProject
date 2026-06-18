---
title: 让 Hermes 更聪明更实用（调研）
created: 2026-06-18
updated: 2026-06-18
type: concept
tags: [concept, research, ai, workflow]
sources:
  - E:\rhProject\research\2026-06-18-让Hermes更聪明更实用-调研.md
learned: Obsidian + Filesystem MCP + Memory/Skill 是当前性价比最高的长期记忆三件套;调研比动手早一步能省大量返工
implemented: ✅ 已落实:Vault 建好 + Filesystem MCP 14/14 tools + 工具栈 INVENTORY.md + 调研文档本身闭环
confidence: high
---

# 让 Hermes 更聪明更实用 —— 调研

> 调研日期：2026-06-18
> 调研人：Hermes（自调研，主人委托）
> 目的：摸清 2026 年 AI 助手"长期记忆 + 工具扩展"的现状和可行路径，匹配主人"装 Obsidian 是想让 Hermes 记忆更长远"的目标

---

## TL;DR —— 一句话结论

主人最划算的"让 Hermes 更聪明"路径只有两条，**不冲突，可叠加**：

1. **Obsidian + Filesystem MCP**（30 分钟装好，记忆+知识库一步到位）
2. **Hermes 自身的 Skill / Memory 系统用满**（已经是现成的能力，只是没系统化）

其他 80% 的"再叠新东西"在主人的工具链下**不划算**：已经 5 客户端 + CCSwitch 网关 + 2 个 MCP（文件系统、终端）+ RAG 知识图谱（54MB / 9663 节点），再叠本地大模型 / Mem0 / 新 MCP 大概率是添乱。

---

## 一、三层架构：让 AI 更聪明的本质

参考 2026 年主流的"Harness Engineering"（驾驭工程）框架（[来源：2BAB 的九条实践](https://2bab.me/zh/blog/2026-04-12-harness-engineering-best-practices/)、[Anthropic 官方博客](https://jimo.studio/blog/stop-waiting-for-next-generation-models-do-harness-now/)），AI 助手能不能"干活"分三层：

| 层级 | 解决的问题 | 主人当前状态 | 缺口 |
|---|---|---|---|
| **Prompt Engineering**（提示词工程）| "模型乱说话"——怎么问得清楚 | ✅ persona.md / system prompt 已写 | 低 |
| **Context Engineering**（上下文工程）| "模型有足够信息"——怎么把相关材料喂进去 | ⚠️ 有 repowiki + kg_query，但日常没自动化注入 | 中 |
| **Harness Engineering**（驾驭工程）| "模型能动手做事"——工具/MCP/权限/中断 | ✅ 已经有 file + terminal + browser + cron + delegate | 低（但 Obsidian 缺） |

> **结论**：主人目前缺的是"**外部知识源**"这一环（Context Engineering 的尾巴），不是"模型能力"或"工具能力"。Obsidian 正好补这一环。

---

## 二、长期记忆的三种范式（不冲突，可叠加）

2026 年 AI 长期记忆有三种典型实现，**不要混为一谈**：

| 范式 | 原理 | 代表 | 适合场景 | 主人适用度 |
|---|---|---|---|---|
| **Memory（注入式）** | 会话开始时把核心事实塞进 system prompt | Hermes 的 `memory` 工具、Cursor User Rules | 高频反复用的事实（"主人前端转全栈"）| ⭐⭐⭐⭐⭐ 已经在用 |
| **Skill（程序式）** | 把"做事方法"沉淀成可调用的流程 | Hermes 的 `skill` 工具、Claude Code Skills | 5+ 步重复任务（"v3 迁移 8 步"）| ⭐⭐⭐⭐⭐ 已经在用 |
| **RAG / 知识库（检索式）** | 文档外挂 + 语义搜索，需要时拉进来 | Obsidian + Filesystem MCP、Mem0、向量数据库 | 大量笔记/项目/历史对话 | ⭐⭐⭐⭐⭐ **缺这块** |

> **关键判断**：主人想"记忆更长远"，**RAG/知识库这条路才是真正"长远"的**。前两种都有上限（memory 几千字符，skill 也不会无限增长），只有 RAG 是"放多少文档就记多少"。

### 2.1 三种范式要不要上 Mem0？

[Mem0](https://github.com/mem0ai/mem0) 是 2026 年最火的"AI 长期记忆框架"（devin-smith 那篇《Mem0 完全指南》详细讲了），原理是"两段式流水线：抽取 → 更新（ADD/UPDATE/DELETE/NOOP）"。

**我建议主人不要上**。原因：
- 主人的场景是**结构化笔记 + 项目文档**（Obsidian Vault），不是"对话历史"
- Mem0 强项是"自动从对话中提取事实"——但主人已经有 persona + memory 体系，**这个能力是冗余的**
- 上 Mem0 等于又叠一个系统，学习/维护成本 > 收益

如果以后真要做"对话历史自动归档成知识"，再考虑 Mem0 或类似的 **OpenClaw Agent 记忆系统**。现在不必。

---

## 三、Obsidian + AI 的三种接入方式（**核心推荐**）

参考 [ContextBolt 的 2026 Obsidian MCP 指南](https://contextbolt.com/blog/obsidian-mcp-claude/)、[MCPVault 官方文档](https://mcp-obsidian.org/install/)、[Obsidian 社区插件页](https://community.obsidian.md/plugins/obsidian-local-rest-api)。

### 3.1 三种方式对比

| 维度 | **Filesystem MCP**（推荐起步）| Local REST API + mcp-obsidian | Obsidian Local REST API 自带 MCP server（新）|
|---|---|---|---|
| 需要 Obsidian 开着？| ❌ 不需要 | ✅ 需要 | ✅ 需要 |
| 需要装插件？| ❌ 不需要 | ✅ 要装第三方 MCP server | ✅ 要装 Obsidian 插件 |
| 读 / 写笔记 | ✅ | ✅ | ✅ |
| 原子级编辑（按 heading / block）| ❌ 整文件重写 | ✅ | ✅ |
| 用 Obsidian 自带搜索索引 | ❌ grep 文件 | ✅ | ✅ |
| 自动更新链接图谱 | ❌ 需重启 Obsidian | ✅ 实时 | ✅ 实时 |
| 内存占用 | 低 | 较高 | 较高 |
| 适合 | 日常知识工作、起草、检索 | 高级工作流（Dataview / Templater）| 高级工作流（如果不想装第三方）|

### 3.2 强建议：先 Filesystem MCP，30 分钟跑通

**为什么先 Filesystem**：
- 5 分钟配置，0 插件
- 覆盖 80% 场景：读、写、搜索、改（整文件级）
- 不依赖 Obsidian 在不在线
- **和主人"日常写笔记 + 偶尔问 AI"的场景最匹配**

**配置步骤**（以 Claude Desktop 为例，Cursor / Claude Code / Gemini CLI 几乎一样）：

```json
// claude_desktop_config.json（macOS: ~/Library/Application Support/Claude/）
//                       （Windows: %APPDATA%\Claude\）
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\RUHAI\\Documents\\ObsidianVaults\\MainVault"
      ]
    }
  }
}
```

如果**主人用 Hermes 的桌面 app**，需要确认 Hermes 是不是支持 MCP servers 作为工具 —— 见第四节。

### 3.3 进阶路径（用满后再考虑）

如果日常用 Filesystem 半年后，发现"我经常要改某个长笔记里的某一段，不想重写整文件"，再升级到 Local REST API + mcp-obsidian / MCPVault。**不要一开始就上高级方案**，会拖慢启动。

---

## 四、Hermes 现状盘点 —— "更聪明"还有哪些能榨的空间

主人现在的 Hermes 桌面 app + 5 客户端生态，已经有这些**没用满**的能力：

| 能力 | 来源 | 当前用法 | 还能怎么榨 |
|---|---|---|---|
| **Memory 工具** | Hermes 内置 | 写了 21% 偏好的事实 | 系统化：把"项目边界、用户偏好、决策史"分桶管理 |
| **Skill 工具** | Hermes 内置 | 写了几个研究/工具 skill | 沉淀工作流：v3 迁移 8 步、v2→v3 差异对照、A 方案修复等都是 skill 候选 |
| **Session Search** | Hermes 内置 | 偶尔翻历史 | 自动化：每次重要决策落"摘要回写"到 session_search 可检索 |
| **Cron** | Hermes 内置 | 06-17 落地了 cron 周期任务 | 可以跑"每日 Obsidian 笔记摘要"或"周报生成" |
| **Delegate** | Hermes 内置 | 偶尔用 | 跨 IDE 调度：让 Claude Code 写代码、Hermes 总结、Cursor 验证 |
| **浏览器工具** | Hermes 内置 | 偶尔用 | Obsidian 装好后可以做"网页 → 笔记"自动化 |
| **MCP 生态** | ❓ 待确认 | **未确认 Hermes 是否支持自定义 MCP server** | **如果不支持，Filesystem MCP 这条路就走不通** |

### 4.1 ⚠️ 必须先确认的事实

**Hermes 桌面 app 当前是否支持用户自定义 MCP server 作为工具？** 这决定了主人能不能用 Filesystem MCP 路线。

**✅ 已确认：Hermes 支持自定义 MCP server**

证据链：
- `hermes tools` 菜单里有 **"3. Configure MCP server tools"** 选项
- 有专门子命令 `hermes mcp {add, remove, list, test, configure, install, ...}`
- 官方文档：[菜鸟教程 Hermes Agent MCP 集成](https://m.runoob.com/ai-agent/hermes-agent-mcp.html)、[Lushbinary 2026-04 指南](https://lushbinary.com/blog/hermes-agent-mcp-integration-complete-guide/)、[Fastio 2026-05 配置教程](https://fast.io/resources/hermes-agent-mcp-server/)
- 当前 `hermes mcp list` 显示主人已经装了 `hermes-studio` MCP

**关键命令**：
```bash
# 添加 Filesystem MCP（让 Hermes 能读/写 Obsidian Vault）
hermes mcp add filesystem \
  --command npx \
  --args "-y" "@modelcontextprotocol/server-filesystem" "E:/rhProject/.obsidian-vault"

# 验证装好没
hermes mcp list
hermes mcp test filesystem
```

> 注意：`hermes mcp catalog` 的官方列表里**没有** Obsidian/Filesystem（只有 linear / n8n / hermes-studio），所以走 `add` 手工加，不用 `install` 子命令。

---

## 五、主人专享：基于现有工具链的"高 ROI"清单

**只列已经能立刻动手、零成本 / 极低成本的事**：

### 5.1 立刻能做（30 分钟内）

1. **建 Obsidian Vault 目录**：`C:\Users\RUHAI\Documents\ObsidianVaults\MainVault`
2. **装 Filesystem MCP**（5 分钟配置）
3. **写一份"知识库使用规约"** —— 哪些信息放 Obsidian、怎么打 tag、命名规范
4. **用 `clarify` 出 3-5 个 Vault 子目录结构**让主人拍板（Daily / Projects / Research / Skills / Archive）

### 5.2 一个月内能做

5. **把 `E:\rhProject\research\` 下的 8 份文档** 软链接或定期同步到 Obsidian Vault（不是复制，研究文件归研究，Obsidian 是入口）
6. **写一个 Skill：`obsidian-vault-curator`** —— 给 AI 一套"读 vault → 总结 → 写回 vault"的工作流
7. **每月一次 review** 哪些信息应该从 memory 升级到 Obsidian、哪些从 Obsidian 降级到 memory

### 5.3 半年后再说

8. Mem0 / 本地大模型 / Local REST API 升级 —— **等前 7 步跑熟了再决定**

---

## 六、不推荐上 / 暂缓的方向

| 方向 | 不推荐的理由 |
|---|---|
| **本地大模型（Qwen3 / DeepSeek / Llama）** | 主人已经有 5 客户端 + 云端 M3，本地模型只在"断网"或"数据不出本机"场景有意义，**当前场景用不上** |
| **Mem0 长期记忆框架** | 冗余——主人有 Obsidian + memory + skill 三层记忆，再叠 Mem0 是添乱 |
| **新建一套"对话历史自动归档"系统** | 已经有 session_search，**没满就加是添乱** |
| **向量数据库（Qdrant / Chroma / Milvus）** | Obsidian 起步阶段用不上，文本搜索就够；等 vault 上千文件再考虑 |
| **Obsidian Dataview / Templater 高级插件** | 起步阶段不要碰，会把自己绕进"做笔记系统"而不是"记笔记" |

---

## 七、给主人拍板的问题

按主人的偏好（**多方案 + trade-off + 等单字符拍板**），列两个决策点：

### 决策 1：Vault 装哪儿？

- **A. `C:\Users\RUHAI\Documents\ObsidianVaults\MainVault\`**（推荐，Obsidian 官方默认，备份工具都认这个路径）
- **B. `E:\rhProject\.obsidian-vault\`**（和工作区放一起，方便同步；但 git 会扫到要忽略）
- **C. `D:\Obsidian\`**（如果有 D 盘，独立分区最安全）

### 决策 2：Filesystem MCP 先接哪个客户端？

- **A. Claude Desktop**（最成熟，Obsidian 官方文档默认这个）
- **B. Cursor**（主人前端主力，写代码时顺手能问）
- **C. Claude Code**（主人跑重型任务时用）
- **D. 全都接**（配置一次不复杂，但要看主人 Obsidian Vault 的并发安全策略）

> 主人拍板后，我就开始动手。
>
> **已拍板：决策 1 = B. `E:\rhProject\.obsidian-vault\`**（已加入根 `.gitignore`）
>
> **已拍板：决策 2 = D. 先确认 Hermes 是否支持自定义 MCP server** —— **确认结果：✅ 支持**，走 `hermes mcp add` 即可。具体命令已写入第 4.1 节。

### ✅ 执行结果（2026-06-18 当日）

| 步骤 | 结果 |
|---|---|
| 建 Vault 目录 `E:\rhProject\.obsidian-vault\` | ✅ 4 个子目录（Daily / Tools / Research / Archive）|
| 写 `INVENTORY.md`（工具栈快照）| ✅ 3.3 KB，含 YAML frontmatter |
| 写 `23-Tools-工具用法/README.md`（索引）| ✅ 719 B |
| 装 Filesystem MCP | ✅ `hermes mcp add filesystem` → 14/14 tools enabled，写入 `~/AppData\Local/hermes/config.yaml` |
| 根 `.gitignore` 加 `/.obsidian-vault/` | ✅ |
| 主人 memory 更新（旧 5 客户端 → 新 5 组件）| ✅ |

### ✅ 后续合并（2026-06-18 同日）

发现 `HermesVault/`（昨天已存在的 Karpathy 模式 LLM Wiki）比 `.obsidian-vault/`（昨天临时建的简陋版）更对得上主人"让记忆更长远"的诉求，**主人拍板 A 方案：废弃 `.obsidian-vault/`，统一到 `HermesVault/`**。

| 步骤 | 结果 |
|---|---|
| `HermesVault/22-entities-实体档案/INVENTORY.md` 新建（按 SCHEMA 规约，type=entity，带 frontmatter）| ✅ 1.9 KB |
| `HermesVault/23-Tools-工具用法/README.md` 新建（tools 目录索引）| ✅ 807 B |
| `HermesVault/index.md` + `log.md` 更新 | ✅ |
| 删 `E:\rhProject\.obsidian-vault\`（含 2 个文件 + 4 个空目录）| ✅ |
| 改 `.gitignore`（去掉 `/.obsidian-vault/`，加 `HermesVault/.obsidian/` 运行时）| ✅ |
| Filesystem MCP 路径 `.obsidian-vault/` → `HermesVault/` | ✅ 14/14 tools 重新 enabled |
| `skills/` 项目评估 | ✅ 保留：第三方 `mattpocock/skills` clone，跟 `wk-...` 一类（独立 git 子项目），不建议动（会破坏 `.ai-skills-store/` junction 单源方案）|
| 工作区整理总评 | 根目录 4 个空目录消失；只留项目配置 + 业务子项目 + 两个 git 子项目（`skills/` + `HermesVault/` 在 git 里） |

---

## 参考资料

| 资料 | 链接 | 用途 |
|---|---|---|
| ContextBolt: Obsidian MCP 2026 指南 | https://contextbolt.com/blog/obsidian-mcp-claude/ | 三种 MCP 方案对比表 |
| MCPVault 官方文档 | https://mcp-obsidian.org/install/ | 配置示例（Claude Desktop / Cursor / Claude Code）|
| Obsidian 社区 Local REST API 插件 | https://community.obsidian.md/plugins/obsidian-local-rest-api | 高级方案 |
| 阿里云：AI Agent 三重记忆机制 | https://developer.aliyun.com/article/1741403 | Memory / Skill / RAG 三范式 |
| Mem0 完全指南 | https://www.devin-smith.dev/posts/ai-agent-Mem0 | 决策是否上 Mem0 |
| Harness Engineering 九条实践 | https://2bab.me/zh/blog/2026-04-12-harness-engineering-best-practices/ | 三层架构框架 |
| Agent-IO：文件是 Agent 的终极上下文 | https://www.agent-io.com/posts/effective-ai-agent-item10 | Mem0 / Manus 范式对比 |
| Anthropic：Harness Engineering | https://jimo.studio/blog/stop-waiting-for-next-generation-models-do-harness-now/ | Harness 概念权威来源 |
| AGENTS.md / CLAUDE.md / .cursorrules 2026 对比 | https://thepromptshelf.dev/blog/agents-md-vs-claude-md-vs-cursorrules-three-way-2026/ | 项目级配置文件差异 |
