# 计划任务报告

| 文件 | 任务 | 说明 |
|------|------|------|
| `wiki-index-check.txt` | sync-wiki | Repowiki 篇数 vs GENERATED-INDEX 合计 |
| `skill-cleaner-report.txt` | skill-cleaner | Cursor 向 Skill 审计 |
| `skill-cleaner-codex.txt` | skill-cleaner | 可选，全局 skill-cleaner.ts |
| `encoding-scan-report.txt` | scan-chinese | 全仓中文编码扫描（`npm run scan:chinese`） |

手动生成：

```bash
npm run verify:wiki-index
npm run audit:skills
npm run scan:chinese
```
