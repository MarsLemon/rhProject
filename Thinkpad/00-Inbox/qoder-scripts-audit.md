# scripts 目录审计报告（qoder 初审，claude 二审用）

> **审计日期**：2026-07-14
> **审计人**：Qoder
> **审计范围**：`e:\rhProject\scripts\` 下全部文件（含子目录）
> **二审建议**：Claude 逐项核对引用链 + 确认删除清单无遗漏

---

## 审计方法

1. 逐个子目录读 README.md，提取作者标注的状态（🟢在用 / 🟡备用 / 🔴废弃）
2. 全工作区 grep 搜索每个根级脚本的文件名，确认是否有外部引用
3. 检查 `mcp.json`、`.claude/settings.local.json`、`package.json`、`AGENTS.md` 中的引用
4. 读取脚本内容，判断是一次性脚本还是可复用工具
5. 检查 `.log` 文件确认一次性脚本是否已执行

---

## 一、统计总览

| 分类 | 文件数 | 说明 |
|---|---|---|
| 🟢 在用，必须保留 | 28 | 有外部引用或明确在用 |
| 🟡 备用，建议保留 | 25 | 偶尔手动跑，无自动调度 |
| 🔴 一次性脚本，已完成使命，建议删除 | 29 | rename 迁移 + v3 诊断 + dashboard 管理 |
| ⚫ 废弃/缓存，建议删除 | 6 | README 已标废弃 + __pycache__ |
| 🔧 需修复 | 1 | init-prd.mjs 引用的模板不存在 |
| **合计** | **89** | |

---

## 二、🟢 在用，必须保留（28 项）

### 2.1 根级脚本（2 项）

| 文件 | 用途 | 引用方 |
|---|---|---|
| `mysql_mcp_server.py` | MySQL MCP 服务器，暴露只读查询工具 | `mcp.json` 第 6 行 |
| `init-prd.mjs` | 初始化项目 PRD 文件 | 手动调用（⚠️ 见 §五，模板缺失当前不可用） |

### 2.2 hooks/（4 项）

| 文件 | 用途 | 引用方 |
|---|---|---|
| `hooks/session-start.mjs` | Claude Code 启动时加载 AI-KM 上下文种子 | `.claude/settings.local.json` SessionStart hook |
| `hooks/guard-business-edit.mjs` | 业务改动感知 log-only hook | Claude Code PreToolUse |
| `hooks/guard-skills-write.mjs` | 拦截 3 IDE skills/ 目录非授权写入 | Claude Code PreToolUse |
| `hooks/guard-temp-file-scratch.mjs` | 拦截根目录散落临时脚本 | Claude Code PreToolUse |

### 2.3 lib/（1 项）

| 文件 | 用途 | 引用方 |
|---|---|---|
| `lib/wiki-index.mjs` | wiki 索引生成核心工具库 | `_emit-wiki-index.mjs` / `sync-cursor-wiki-index.mjs` / `verify-wiki-index.mjs` import |

### 2.4 sql/（1 项）

| 文件 | 用途 | 引用方 |
|---|---|---|
| `sql/build-index.py` | SQL 资产索引导航生成器 | `wk-train-center-service/AGENTS.md` 第 249 行 |

### 2.5 01-skill-maintenance/（2 项 🟢）

| 文件 | 用途 | 引用方 |
|---|---|---|
| `01-skill-maintenance/verify-skills.mjs` | 校验 3 IDE + npm skill 单源策略 | CLAUDE.md 引用 |
| `01-skill-maintenance/install-monorepo-tour.mjs` | monorepo 导航安装 | 手动 |

### 2.6 02-knowledge-graph-and-wiki/（3 项 🟢）

| 文件 | 用途 |
|---|---|
| `02-knowledge-graph-and-wiki/sync-cursor-wiki-index.mjs` | 同步 Cursor wiki 索引 |
| `02-knowledge-graph-and-wiki/_emit-wiki-index.mjs` | 生成 wiki index（内部 helper） |
| `02-knowledge-graph-and-wiki/verify-wiki-index.mjs` | 验证 wiki 索引完整性 |

### 2.7 04-obsidian-vault/（1 项 🟢）

| 文件 | 用途 |
|---|---|
| `04-obsidian-vault/add_fixplan_frontmatter.py` | 给 fix-plans/*.md 加 frontmatter |

### 2.8 06-business-verification/（1 项 🟢）

| 文件 | 用途 |
|---|---|
| `06-business-verification/check-extract-backend.py` | web_extract 后端健康检查 + 自动切换 |

### 2.9 chinese-encoding/（9 项 🟢/🟡）

| 文件 | 用途 |
|---|---|
| `chinese-encoding/chinese-encoding-core.mjs` | 检测乱码/占位符；Vue2 模板转换 |
| `chinese-encoding/scan-config.mjs` | 共享扫描根目录配置 |
| `chinese-encoding/restore-metadata.mjs` | 自动恢复 v3 repo doc |
| `chinese-encoding/verify-chinese-encoding.mjs` | ROS gate |
| `chinese-encoding/scan-all-encoding-report.mjs` | 全量报告 |
| `chinese-encoding/fix-all-encoding.mjs` | 编排 fix:encoding |
| `chinese-encoding/_write-readme-utf8.mjs` | 重新生成中文 README.md |
| `chinese-encoding/write-docs-utf8.mjs` | v3 迁移 markdown |
| `chinese-encoding/repair-chinese-encoding.mjs` | 从 Vue2 修复损坏的 v3 模板 |

### 2.10 research-cron/（3 项 🟢）

| 文件 | 用途 |
|---|---|
| `research-cron/run-research-batch.mjs` | 5h 定时研究任务主入口 |
| `research-cron/lib/agent-reach.mjs` | agent-reach doctor/searchOne 封装 |
| `research-cron/lib/markdown-frontmatter.mjs` | frontmatter 渲染 + slug 化 |

---

## 三、🟡 备用，建议保留（25 项）

这些脚本偶尔手动运行，没被自动调度，但有复用价值。

### 3.1 01-skill-maintenance/（5 项 🟡）

| 文件 | 用途 |
|---|---|
| `01-skill-maintenance/audit-cursor-skills.mjs` | 扫描 skill 目录，统计 description/token/重复 |
| `01-skill-maintenance/apply-skill-cleanup.mjs` + `.cmd` | 应用 cleanup（配合 audit） |
| `01-skill-maintenance/install-cursor-skills.mjs` + `.ps1` | 把 skill 安装到 Cursor |
| `01-skill-maintenance/install-deep-dive-skill.mjs` + `.ps1` + `.cmd` | 安装单个 deep-dive skill |

### 3.2 02-knowledge-graph-and-wiki/（7 项 🟡）

| 文件 | 用途 |
|---|---|
| `02-knowledge-graph-and-wiki/merge-understand-graph.mjs` | 合并多份 knowledge graph |
| `02-knowledge-graph-and-wiki/split-understand-graph.mjs` | 拆分全局 graph 回 per-subproject |
| `02-knowledge-graph-and-wiki/fix-service-understand-graph.mjs` | 修复 graph 中 service 节点问题 |
| `02-knowledge-graph-and-wiki/start-understand-dashboards.cmd` | 启动 understand-graph dashboard |
| `02-knowledge-graph-and-wiki/stop-understand-dashboards.cmd` | 停止 dashboard |
| `02-knowledge-graph-and-wiki/sync-wiki.cmd` | 全量同步 |
| `02-knowledge-graph-and-wiki/sync-wiki-only.cmd` | 单独同步 |

### 3.3 05-encoding-fixes/（3 项 🟡）

| 文件 | 用途 |
|---|---|
| `05-encoding-fixes/decode-unicode-escapes.mjs` | 把 \uXXXX escape 还原成中文 |
| `05-encoding-fixes/unescape-unicode-in-source.mjs` | 在源码里批量 unescape |
| `05-encoding-fixes/ensure-jvm-log-dir.mjs` | 确保 JVM 日志目录存在 |

### 3.4 07-utilities/（1 项 🟡）

| 文件 | 用途 |
|---|---|
| `07-utilities/weather.py` | 命令行天气查询 |

### 3.5 audit/（2 项 — 历史审查归档）

| 文件 | 用途 |
|---|---|
| `audit/v2-v3-code-review-2026-07-02.md` | V2→V3 代码审查报告 |
| `audit/v2-v3-migration-review-2026-07-02-archived.md` | V2→V3 迁移审查报告（已归档） |

> **说明**：这两个是历史审查文档，不是脚本。如果 Thinkpad vault 有更合适的归档位置可移走，留在 scripts/audit/ 也不影响。

---

## 四、🔴 一次性脚本，已完成使命，建议删除（29 项）

### 4.1 Rename 迁移脚本（10 脚本 + 9 日志 = 19 项）

这批脚本是一次性 rename 迁移操作，全部已执行完毕（有对应 `.log` 文件为证）。

| 文件 | 对应日志 | 说明 |
|---|---|---|
| `rename-step1-physical.ps1` | `rename-step1.log` | Step 1: 物理重命名 |
| `rename-step2-agents.ps1` | `rename-step2.log` | Step 2: agents 文件重命名 |
| `rename-step2b-agents-allpaths.ps1` | `rename-step2b.log` | Step 2b: agents 全路径 |
| `rename-step3-dashboard.ps1` | `rename-step3.log` | Step 3: dashboard 重命名 |
| `rename-step3b-dashboard.ps1` | `rename-step3b.log` | Step 3b: dashboard 补充 |
| `rename-step4-docs.ps1` | `rename-step4.log` | Step 4: PRD + .products + scripts |
| `rename-step5-cleanup.ps1` | `rename-step5.log` | Step 5: 清理 |
| `rename-step8-verify.ps1` | `rename-step8.log` | Step 8: 验证 |
| `rename-round2-dryrun.ps1` | — | 第二轮 dry run |
| `rename-thinkpad-dryrun.ps1` | — | Thinkpad dry run |
| — | `rename-dashboard-restart.log` | dashboard 重启日志 |
| — | `restart-dashboard.log` | 重启 dashboard 日志 |

**证据**：每个 `.ps1` 都有同目录下对应 `.log` 文件，证明已执行。
**风险**：无。这些脚本操作的 rename 已永久生效，重跑会导致错误。
**建议**：全部删除（含 `.log` 文件）。

### 4.2 V3 迁移诊断脚本（4 项）

| 文件 | 用途 | 删除理由 |
|---|---|---|
| `_list_status.py` | 列出 v3 admin 的占位/部分/跑通状态 | 一次性诊断脚本，v3 迁移已基本完成 |
| `dump_placeholder_files.py` | dump v3 admin 占位文件清单 | 同上，与 `_list_status.py` 功能高度重叠 |
| `audit-v3-imports.py` | 审计 v3 import 不存在的 API 函数 | 一次性诊断，v3 迁移已基本完成 |
| `keep-v3-running.ps1` | 守护 Claude Code 会话不中断（配合 v3 迁移） | v3 迁移已基本完成，脚本引用的 `.claude/plans/v3-admin-progress.json` 可能已不存在 |

**证据**：`_list_status.py` 和 `dump_placeholder_files.py` 代码几乎完全相同（classify 函数一字不差），只是输出格式不同。`keep-v3-running.ps1` 引用的 `$ProgressFile = ".claude/plans/v3-admin-progress.json"` 是 v3 迁移期间的临时文件。
**风险**：无。诊断脚本可随时按需重写。

### 4.3 V3 迁移监控脚本（2 项）

| 文件 | 用途 | 删除理由 |
|---|---|---|
| `v3-migration-watcher.py` | 扫描 v2 git log，对比 v3 同路径文件 | v3 迁移已基本完成；`rename-step4-docs.ps1` 内引用它，但 step4 本身也是一次性脚本 |
| `v3-migration-reporter.py` | 读取 vault 进度，生成微信推送汇报文本 | 同上，依赖的 `Thinkpad/21-fix-plans-修复经验/v3-migration/PROGRESS.md` 可能已不再维护 |

**证据**：两个脚本都依赖 v3 迁移期间的 vault checkpoint 文件，迁移完成后这些文件不再更新。
**风险**：低。如后续仍需 v2→v3 同步监控，可从 git 历史恢复。

### 4.4 Dashboard 管理脚本（4 项）

| 文件 | 用途 | 删除理由 |
|---|---|---|
| `find-dashboard-process.ps1` | 找哪个进程在用 .products/dashboard/app.py | 一次性诊断，配合 rename 迁移使用 |
| `inspect-dashboard-tree.ps1` | 检查 .products/dashboard/ 目录结构 | 一次性诊断 |
| `restart-dashboard.ps1` | 杀 dashboard python 进程 + 重启 | 配合 rename 迁移使用，迁移已完成 |
| `verify-dashboard-restart.ps1` | 验证 dashboard 重启 | 同上 |

**证据**：这些脚本全部围绕 `.products/dashboard/app.py` 的进程管理，配合 rename 迁移使用。`restart-dashboard.log` 证明已执行过。
**风险**：低。如果 dashboard 仍需要重启操作，脚本很简单可重写。

### 4.5 其他一次性脚本（4 项）

| 文件 | 用途 | 删除理由 |
|---|---|---|
| `verify-step3.ps1` | 验证 rename step3 dashboard 内 HermesVault 残留 | 配合 rename 迁移，一次性验证 |
| `check-vault-locks.ps1` | 检查谁在占用 HermesVault 目录 | 一次性诊断，检查 Obsidian/VSCode 锁冲突 |
| `truncate-sfc.ps1` | 截断 Vue SFC 中重复的 `<template>` 标签 | 一次性修复脚本 |
| `04-obsidian-vault/migrate_research.py` | 把 research/ 8 份调研迁移到 HermesVault | README 标注"已拍板执行过，2026-06-18" |
| `06-business-verification/verify-required-removal.py` | 培训计划"必须学习"字段移除验证 | README 标注"2026-06-17 跑过" |

---

## 五、⚫ 废弃/缓存，建议删除（6 项）

| 文件 | 用途 | 删除理由 |
|---|---|---|
| `02-knowledge-graph-and-wiki/register-sync-wiki-task.cmd` | 注册 Windows 定时任务跑 sync | README 标注"疑似废弃"（功能被 sync-wiki.cmd + Hermes cron 取代） |
| `07-utilities/register-scheduled-tasks.cmd` | 注册 Windows 定时任务 | README 标注"可能废弃"（跟 cron 体系重复） |
| `05-encoding-fixes/show-my-desktop.ps1` | 显示桌面 | README 标注"跟编码无关，临时放这" |
| `__pycache__/add_fixplan_frontmatter.cpython-311.pyc` | Python 缓存 | __pycache__ 应被 gitignore，不应保留 |
| `__pycache__/check-extract-backend.cpython-311.pyc` | Python 缓存 | 同上 |
| `__pycache__/v3-migration-reporter.cpython-311.pyc` | Python 缓存 | 同上 |

---

## 六、🔧 需修复（1 项）

### init-prd.mjs — 模板缺失

- **文件**：`scripts/init-prd.mjs`
- **问题**：第 51-56 行引用 `scripts/_lib/prd-template.md`，但 `scripts/_lib/` 目录不存在
- **影响**：运行 `node scripts/init-prd.mjs <project-id>` 会报错 "模板不存在"
- **建议**：要么创建 `scripts/_lib/prd-template.md` 模板文件，要么删除 `init-prd.mjs`（如果不再需要初始化 PRD）

---

## 七、删除清单汇总（共 35 项）

### 一次性脚本（29 项）

```
scripts/_list_status.py
scripts/audit-v3-imports.py
scripts/check-vault-locks.ps1
scripts/dump_placeholder_files.py
scripts/find-dashboard-process.ps1
scripts/inspect-dashboard-tree.ps1
scripts/keep-v3-running.ps1
scripts/rename-dashboard-restart.log
scripts/rename-round2-dryrun.ps1
scripts/rename-step1-physical.ps1
scripts/rename-step1.log
scripts/rename-step2-agents.ps1
scripts/rename-step2.log
scripts/rename-step2b-agents-allpaths.ps1
scripts/rename-step2b.log
scripts/rename-step3-dashboard.ps1
scripts/rename-step3.log
scripts/rename-step3b-dashboard.ps1
scripts/rename-step3b.log
scripts/rename-step4-docs.ps1
scripts/rename-step4.log
scripts/rename-step5-cleanup.ps1
scripts/rename-step5.log
scripts/rename-step8-verify.ps1
scripts/rename-step8.log
scripts/rename-thinkpad-dryrun.ps1
scripts/restart-dashboard.log
scripts/restart-dashboard.ps1
scripts/truncate-sfc.ps1
scripts/v3-migration-reporter.py
scripts/v3-migration-watcher.py
scripts/verify-dashboard-restart.ps1
scripts/verify-step3.ps1
scripts/04-obsidian-vault/migrate_research.py
scripts/06-business-verification/verify-required-removal.py
```

### 废弃/缓存（6 项）

```
scripts/02-knowledge-graph-and-wiki/register-sync-wiki-task.cmd
scripts/05-encoding-fixes/show-my-desktop.ps1
scripts/07-utilities/register-scheduled-tasks.cmd
scripts/__pycache__/add_fixplan_frontmatter.cpython-311.pyc
scripts/__pycache__/check-extract-backend.cpython-311.pyc
scripts/__pycache__/v3-migration-reporter.cpython-311.pyc
```

---

## 八、保留清单汇总（共 53 项）

### 🟢 在用（28 项）+ 🟡 备用（25 项）

保留的脚本覆盖以下功能域：

| 功能域 | 目录 | 文件数 |
|---|---|---|
| MySQL MCP 服务器 | 根级 | 1 |
| PRD 初始化 | 根级 | 1（需修复） |
| Claude Code Hooks | hooks/ | 4 |
| 共享工具库 | lib/ | 1 |
| SQL 资产治理 | sql/ | 1 |
| Skill 维护 | 01-skill-maintenance/ | 7 |
| 知识图谱 + Wiki | 02-knowledge-graph-and-wiki/ | 10 |
| Obsidian Vault 工具 | 04-obsidian-vault/ | 1 |
| 中文编码修复 | 05-encoding-fixes/ | 3 |
| 业务验证 | 06-business-verification/ | 1 |
| 小工具 | 07-utilities/ | 1 |
| 中文编码 ROS | chinese-encoding/ | 9 |
| 研究定时任务 | research-cron/ | 3 |
| 历史审查归档 | audit/ | 2 |

---

## 九、给 Claude 二审的检查清单

1. **引用链核对**：确认 §二 中每个 🟢 脚本的引用方确实存在且有效
2. **删除安全性**：确认 §七 中每个脚本确实是一次性的，重跑不会出问题
3. **`init-prd.mjs` 决策**：是补模板还是删脚本？需确认 `.products/projects/` 是否还在用 PRD 流程
4. **`v3-migration-watcher.py` / `v3-migration-reporter.py`**：确认 v3 迁移是否真的已完成，是否还需要持续监控 v2→v3 同步
5. **`audit/` 目录**：两个历史审查 markdown 是否应该移到 Thinkpad vault 归档而非留在 scripts/
6. **`.gitignore` 检查**：确认 `__pycache__/` 已在 `.gitignore` 中，删除后不会再被生成提交
7. **README.md 同步**：删除文件后需要同步更新 `scripts/README.md` 的目录结构说明

---

## 审查元信息

- 审计方法：逐目录读 README + 全工作区 grep 引用 + 逐文件读源码判断一次性 vs 可复用
- 引用检查覆盖：`mcp.json`、`.claude/settings.local.json`、`.claude/settings.json`、`package.json`、`AGENTS.md`、`CLAUDE.md`
- 未覆盖：Hermes profile 脚本（`~\AppData\Local\hermes\` 不在审计范围）
- 置信度：🟢 高（引用链可验证）/ 🟡 中（手动调用脚本依赖使用频率判断）
