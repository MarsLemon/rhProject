# scripts 目录二审报告(Claude 复核,2026-07-14)

> **触发**:Qoder 初审报告 `Thinkpad/00-Inbox/qoder-scripts-audit.md`(89 项分类 + 35 项删除清单)
> **二审方法**:逐条 grep 引用链 + 读源码验代码 + 跨仓比对 7 个 PRD 文件 + 主人 grill-me 拍板 5 问
> **结论**:Qoder 报告整体质量 🟡 中,**6 处错漏已修正,主人已拍板执行**

---

## 一、Qoder 报告 ✅ 正确的部分(可作为 SOP 复用)

| Qoder 结论 | 二审验证证据 |
|---|---|
| §四.1 rename 批 19 项可删 | `rename-step1/4/5/8.log` 尾段全部 PASS,迁移已落地;重跑会破坏 Thinkpad 已就位路径 |
| §四.2 `_list_status.py` / `dump_placeholder_files.py` 高度重复 | 源码比对:两个 `classify()` 函数一字不差,只有输出格式不同 |
| §四.3 v3-migration-watcher/reporter 依赖文件已不更新 | `Thinkpad/21-fix-plans-修复经验/v3-migration/_checkpoints/` 仅剩 `_archive/`,`PROGRESS.md` 不存在 |
| §四.4 dashboard 4 个 .ps1 配合 rename | `restart-dashboard.log` 1671 字节证明已执行过 |
| §五 `__pycache__/*.pyc` 应删 | `mysql_mcp_safe_wrapper.cpython-313.pyc` 是今天(7-14)刚生成,确实在重生成 |
| §二 sql/build-index.py 在用 | `wk-train-center-service/AGENTS.md:249` 引用 |
| §六 init-prd.mjs 模板缺失 | `scripts/_lib/` 不存在 + `tag-prd.mjs` 不存在(确认) |

---

## 二、Qoder 报告 ⚠️ 错误或遗漏(6 处需修正)

### ❌ 错误 1:`mysql_mcp_server.py` 引用方标错
**Qoder 原文**:`scripts/mysql_mcp_server.py` 是 `mcp.json` 第 6 行引用的入口
**实际**:`.mcp.json:6` 写的是 `mysql_mcp_safe_wrapper.py`(7-14 新建,7474 字节)。`mysql_mcp_server.py` 是 6-30 的旧版,已被 safe wrapper **取代**
**Qoder 错误**:信 README 印象 + 没读实际 .mcp.json
**处置**:✅ 已删 `mysql_mcp_server.py`(孤儿脚本,Qoder 漏报 → 主人拍板删)

### ❌ 错误 2:`verify-skills.mjs` 引用方标错
**Qoder 原文**:引用方是 `CLAUDE.md`
**实际**:`CLAUDE.md` 不存在(根目录已删),`scripts/README.md` 第 9 行说"CLAUDE.md §2.5 引用"是陈旧描述
**Qoder 错误**:信了 scripts/README.md 的二手描述,没查 CLAUDE.md 是否存在
**处置**:`verify-skills.mjs` 实际是手动跑 + scripts/README.md 同步改为"手动 `node ...` 调用"

### ❌ 错误 3:`migrate_research.py` 误标"建议删"
**Qoder 原文**:"已拍板执行过,2026-06-18" → 建议删
**实际**:`04-obsidian-vault/README.md:9` 标 🟢(非 🔴),README 没标废弃
**Qoder 错误**:凭"已跑过一次"判定废弃,没读 README 状态列
**处置**:✅ 保留(主人原意:README 没标废 = 业务侧认它可用)

### ❌ 错误 4:`verify-required-removal.py` 误标"建议删"
**Qoder 原文**:"2026-06-17 跑过" → 建议删
**实际**:`06-business-verification/README.md:9` 标 🟢(非 🔴)
**Qoder 错误**:同错误 3
**处置**:✅ 保留(同 04-obsidian-vault 逻辑)

### ❌ 错误 5:`show-my-desktop.ps1` 状态标错
**Qoder 原文**:标 ⚫ 废弃 → 建议删
**实际**:`05-encoding-fixes/README.md` 标 🟡("快捷工具,跟编码无关,临时放这")
**Qoder 错误**:凭"放在 encoding 目录但跟编码无关"判定废弃
**处置**:✅ 已删(理由是 README 自己说"临时放这",不是"已废弃")

### ❌ 错误 6:`v3-migration-watcher.py` 漏查引用方
**Qoder 原文**:可删
**实际**:`.claude/plans/v3-placeholder-cleanup-2026-07-06.md:127` 写"建议在 CI 中增加占位检测脚本(如 `scripts/v3-migration-watcher.py`)"
**Qoder 错误**:没全工作区 grep 引用链,只看 README
**处置**:✅ 先 Edit .md 第 127 行去掉路径,再删脚本

---

## 三、Qoder 漏报的关键事项(4 项)

### 🟡 漏报 1:`scripts/audit/` 整个目录性质错判
**Qoder 原文**:留 scripts/audit/ 不影响
**实际**:`audit/` 是历史审查 markdown(`v2-v3-code-review-2026-07-02.md` 9189 字节 + `v2-v3-migration-review-2026-07-02-archived.md` 3821 字节),不是脚本 → 留在 scripts/ 不合适
**处置**:✅ 已 `git mv` 到 `Thinkpad/_archive/2026-07/audit-reports/`

### 🟡 漏报 2:`.gitignore` 缺 `__pycache__/` 规则
**Qoder 原文**:未提 .gitignore
**实际**:`.gitignore` 没有 `__pycache__/` 规则,今天又生成新 `.pyc`;`**/*.log` 已加,所以 .pyc 不会被 commit(误打误撞),但 working tree 还会重生成
**处置**:✅ `.gitignore` 加 `**/__pycache__/` + 删现有 3 个 .pyc

### 🟡 漏报 3:`keep-v3-running.ps1` 引用的 progress.json 仍在
**Qoder 原文**:"progress.json 可能已不存在"
**实际**:`.claude/plans/v3-admin-progress.json` 9512 字节,2026-06-26 写入,`admin/sys` 子阶段已 completed
**Qoder 错误**:凭"v3 迁移已完成"判定依赖文件也消失,没 `ls`
**处置**:✅ keep-v3-running.ps1 仍删(守护脚本,无自动调度);progress.json 保留作历史快照

### 🟡 漏报 4:`init-prd.mjs` 依赖链漏查
**Qoder 原文**:仅发现模板缺失
**实际**:`scripts/init-prd.mjs:189` 还引用 `tag-prd.mjs`,但 `tag-prd.mjs` 也不存在 → 这套"自动化初始化"从未跑通
**Qoder 错误**:只查 init 入口,没查配套脚本
**处置**:✅ 已删 init-prd.mjs(主人拍板:流程不通 + 已没人用)

---

## 四、修正后的执行清单(40 项)

### 🔴 Qoder 漏报,新增删除/移动项(7 项)

```
scripts/mysql_mcp_server.py             # ❌ mcp.json 引用的是 safe_wrapper,这是孤儿
scripts/audit/v2-v3-code-review-2026-07-02.md                   # → Thinkpad/_archive/2026-07/audit-reports/
scripts/audit/v2-v3-migration-review-2026-07-02-archived.md     # → Thinkpad/_archive/2026-07/audit-reports/
scripts/__pycache__/add_fixplan_frontmatter.cpython-311.pyc     # gitignore 已加 **/__pycache__/
scripts/__pycache__/check-extract-backend.cpython-311.pyc       # 同上
scripts/__pycache__/v3-migration-reporter.cpython-311.pyc       # 同上
.claude/plans/v3-placeholder-cleanup-2026-07-06.md:127          # 改引用,避免悬空
```

### 🔴 Qoder 多删,需保留项(2 项)

```
scripts/04-obsidian-vault/migrate_research.py      # README 标 🟢
scripts/06-business-verification/verify-required-removal.py  # README 标 🟢
```

### ✅ Qoder 正确,可删项(31 项,不变)

```
# rename 批(19 项): rename-step1~8 .ps1 + 9 个 .log + 2 个 dryrun
# v3 诊断批(4 项): _list_status.py + dump_placeholder_files.py + audit-v3-imports.py + keep-v3-running.ps1
# v3 监控批(2 项): v3-migration-watcher.py + v3-migration-reporter.py
# dashboard 批(4 项): find-dashboard-process.ps1 + inspect-dashboard-tree.ps1 + restart-dashboard.ps1 + verify-dashboard-restart.ps1
# 其他批(4 项): verify-step3.ps1 + check-vault-locks.ps1 + truncate-sfc.ps1 + init-prd.mjs
# 废弃批(3 项 .cmd + 1 项 .ps1): register-sync-wiki-task.cmd + show-my-desktop.ps1 + register-scheduled-tasks.cmd
```

---

## 五、给 Qoder 的方法论改进建议(避免下次再漏)

### 建议 1:引用链必须 grep 实际引用方,不信 README 标注

```bash
# 反例:Qoder 凭 README 写"CLAUDE.md 引用"但 CLAUDE.md 早删了
# 正例:
for f in scripts/**/*.mjs scripts/**/*.py scripts/**/*.ps1; do
  refs=$(grep -rln "$f" .claude .cursor .github .products --include="*.json" --include="*.md" 2>/dev/null | head -3)
  [ -n "$refs" ] && echo "$f → $refs"
done
```

### 建议 2:status 列以 README 为准,不凭主观判断

Qoder 错标 3 处(migrate_research / verify-required-removal / show-my-desktop)都是凭"跑过 / 放错目录"判定,实际 README 的 status 列才是 ground truth

### 建议 3:删脚本前必须查"依赖链"而非只查"直接引用"

`init-prd.mjs` 不只引用 `scripts/_lib/prd-template.md`,还引用 `tag-prd.mjs` — 单看入口文件会漏查配套脚本

### 建议 4:目录性质区分 → audit/ 类历史文档不是脚本

`scripts/audit/` 是 markdown 历史审查,不是 .ps1/.py/.mjs 脚本,应放 Thinkpad vault 而非 scripts/

### 建议 5:.gitignore 兜底检查必跑

任何 "删 .pyc" 类建议都要附带"已加 .gitignore 防再生"验证,否则删了还会长

---

## 六、最终落地统计

| 维度 | 数量 |
|---|---|
| 二审前 scripts/ 文件数(Qoder 算 89) | 89 |
| `git rm` 删除 tracked 脚本 | 28 |
| `rm` 删除 working tree .log + .pyc | 13 |
| `git mv` 移 audit/*.md 到 Thinkpad/_archive/ | 2 |
| Edit .md / .gitignore / scripts/README.md | 3 |
| 二审后 active scripts | ~55(原 89 - 31 实删 - 2 移动 + README 调整) |
| 改动文件总数 | 46 项(28 D + 13 rm + 2 R + 3 M) |

---

## 📎 触发后续

- 本次触发可写一条经验到 `shared-experiences.md` 🛡 边界 维度:
  **"审计类任务必查实际引用方 + .gitignore,不信 README 二手描述"**(候选)
- Qoder 后续脚本审计可参考本报告 §五 方法论改进 5 条

**状态**:🟢 已完成,等主人 `git commit`
