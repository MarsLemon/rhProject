# rhProject 定时任务（Windows）

**唯一入口**：脚本、注册、日志、报告均在本目录。

```
.cursor/scheduled-tasks/
├── README.md
├── register.ps1 / register.cmd
├── tasks/                    # 计划任务执行的 .cmd
├── scripts/                  # 辅助 Node 脚本（如日志清理）
├── logs/                     # 运行日志
└── reports/                  # 审计报告
```

## 任务一览

| Windows 任务名 | 脚本 | 默认调度 | 产出 |
|----------------|------|----------|------|
| `rhProject-sync-wiki` | `tasks/sync-wiki.cmd` | **每天 08:00** | `.cursor/wiki/GENERATED-INDEX.md` + `reports/wiki-index-check.txt` |
| `rhProject-skill-cleaner` | `tasks/skill-cleaner.cmd` | **每周日 09:00** | `reports/skill-cleaner-report.txt` |
| `rhProject-scan-chinese` | `tasks/scan-chinese.cmd` | **每周一 07:00** | `reports/encoding-scan-report.txt` |
| `rhProject-prune-logs` | `tasks/prune-logs.cmd` | **每月 1 日 03:00** | 删除 30 天前的 `logs/*.log` |

### sync-wiki 链路

1. `npm run sync:wiki`
2. `npm run verify:wiki-index`（磁盘 Repowiki 篇数 vs 索引「合计」）

索引不一致时任务 exit code 为 1，详见 `logs/sync-wiki.log`。

### scan-chinese

- 跑 `npm run scan:chinese`（全仓编码扫描，**不自动修复**）
- 有问题时 exit 1，报告见 `reports/encoding-scan-report.txt`

## 注册（四个任务）

```powershell
cd e:\rhProject
npm run register:scheduled-tasks
```

或双击 `.cursor/scheduled-tasks/register.cmd`。

**若曾注册过旧版任务，建议先卸载再注册：**

```powershell
powershell -ExecutionPolicy Bypass -File .cursor/scheduled-tasks/register.ps1 -Unregister
npm run register:scheduled-tasks
```

### 单独注册

```powershell
powershell -ExecutionPolicy Bypass -File .cursor/scheduled-tasks/register.ps1 -Task Wiki
powershell -ExecutionPolicy Bypass -File .cursor/scheduled-tasks/register.ps1 -Task ScanChinese
powershell -ExecutionPolicy Bypass -File .cursor/scheduled-tasks/register.ps1 -Task PruneLogs -PruneLogsDayOfMonth 1
```

## 手动运行

```bash
npm run sync:wiki
npm run verify:wiki-index
npm run audit:skills
npm run scan:chinese
```

```bat
.cursor\scheduled-tasks\tasks\sync-wiki.cmd
.cursor\scheduled-tasks\tasks\scan-chinese.cmd
```

## 测试

```bat
schtasks /Run /TN "rhProject-sync-wiki"
schtasks /Run /TN "rhProject-skill-cleaner"
schtasks /Run /TN "rhProject-scan-chinese"
schtasks /Run /TN "rhProject-prune-logs"
```

## 卸载

```powershell
powershell -ExecutionPolicy Bypass -File .cursor/scheduled-tasks/register.ps1 -Unregister
```

## npm 脚本（根 package.json）

| 命令 | 说明 |
|------|------|
| `register:scheduled-tasks` | 注册全部 |
| `sync:wiki` | 生成 GENERATED-INDEX |
| `verify:wiki-index` | 索引自检 |
| `audit:skills` | Skill 审计 |
| `scan:chinese` | 编码扫描报告 |

## 变更记录

| 日期 | 说明 |
|------|------|
| 2026-06-02 | sync-wiki、skill-cleaner |
| 2026-06-02 | 收敛至 `.cursor/scheduled-tasks/` |
| 2026-06-02 | 新增 verify:wiki-index、scan-chinese、prune-logs |
