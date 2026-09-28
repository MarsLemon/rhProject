# Radar 实施风险登记

> 最后更新:2026-07-07
> 关联任务:5 个 radar task md
> Owner:项目经理(我)

| ID | 类型 | 描述 | 概率 | 影响 | 缓解 | 责任人 | 状态 |
|---|---|---|---|---|---|---|---|
| R1 | 死循环 | 雷达产物(`inbox/`, `_gaps/`)触发自扫,递归炸 | 中 | 高 | 4 个雷达脚本白名单忽略 `tasks/inbox/` 和 `wiki/_gaps/` | tech-debt 作者 | 🟡 监控中 |
| R2 | 数据丢失 | git checkout 误伤主人未 commit 的修改 | 低 | 高 | 改前必检 `git status` 干净;改完 diff 确认才回滚;AC10 验证 | runner 作者 | 🟡 监控中 |
| R3 | 调度失效 | schtasks 失败无感,雷达停摆数日 | 低 | 中 | watchdog 每天 9:30 检 9:00 日志存在性;无则告警 | runner 作者 | 🟡 监控中 |
| R4 | 资源耗尽 | `logs/radar/` 日志涨爆磁盘 | 低 | 低 | 按月压缩归档到 `logs/radar/archive/{YYYY-MM}.zip` | runner 作者 | 🟢 已规划 |
| R5 | 隐私泄漏 | 雷达 B 输出含手机号 / 邮箱 / 身份证 | 中 | 高 | 强制脱敏:手机号/邮箱/身份证正则替换;AC 验证 | business-pain 作者 | 🔴 待处理 |
| R6 | 噪音淹没 | 候选清单太多,主人疲劳,信任崩塌 | 中 | 高 | Top 20 限流;白名单 `docs/` `node_modules/` `.git/` `dist/` `target/` | 全部 | 🟡 监控中 |
| R7 | 误清理 | 雷达 A 误判"孤儿导出"清理,删公共组件 | 中 | 高 | 清理建议仅入候选,**不自动删**;必须主人二次确认 | tech-debt 作者 | 🟢 已规划 |
| R8 | 阻塞 IDE | 9 点跑占用 CPU,影响主人工作 | 中 | 低 | background mode(async 子进程);30 分钟超时 kill | runner 作者 | 🟢 已规划 |
| R9 | IDE 误改 | 3 个 IDE 中任一误改 8 核心 skill 破坏方案 A | 低 | 高 | `verify-skills.mjs` 防回归 hook 拦截 | runner / 全部 | 🟢 已规划 |
| R10 | PRD 错位 | 主人手改 PRD 后任务未同步 | 中 | 中 | Day 3 收口前做一次 PRD vs 任务对比(本表 owner) | PM(我) | 🟡 监控中 |
| R11 | 红线误触 | AI 误删 `el_training_record` / 补 v3 空壳 | 低 | 极高 | `verify-redline.mjs` 拦截 + git 钩子 | runner 作者 | 🔴 待处理 |
| R12 | 并发撞车 | 9:00 跑时 IDE 正在用,产物冲突 | 低 | 低 | 产物写新文件(带日期戳),不覆盖 | runner 作者 | 🟢 已规划 |

## 状态图例

- 🟢 已规划(已在对应 task 红线/验收中写明)
- 🟡 监控中(实施时盯)
- 🔴 待处理(需在 Day 1 起就处理,否则触发即翻车)
- ⚪ 已发生(写明日期 + 损失 + 后续)

## 升级路径

| 触发 | 升级对象 | 动作 |
|---|---|---|
| R5 / R11 命中 | 立即停跑 + 写事故报告 | 写 `_private_assistant_archive/incidents/{date}-radar-redline.md` |
| R3 连续 3 天失效 | 主人 + Orchestrator | 暂停 cron,排查后重启 |
| R2 数据丢失 | 主人 + 全员 | git reflog 恢复 + 写事故报告 |

## 审阅节奏

- Day 1 末:check R5 / R11 脱敏与红线
- Day 2 末:check R2 / R6 / R7 回滚与噪音
- Day 3 收口:全表 review,过 R3 / R4 / R8

## 与 PRD §8 风险表对应

PRD 8 风险 1→R6(噪音)
PRD 8 风险 2→R2(git 误伤)
PRD 8 风险 3→R8(占 IDE)
PRD 8 风险 4→R1(死循环)
PRD 8 风险 5→R3(watchdog)
PRD 8 风险 6→R7(误清理)
PRD 8 风险 7→R4(日志涨爆)
新增:R5(隐私)/R9(IDE 改 skill)/R10(PRD 错位)/R11(红线误触)/R12(并发)
