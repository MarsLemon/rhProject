# AI 三工具协同 — 参考

## Windows 计划任务统一目录

见 [`.cursor/scheduled-tasks/README.md`](../../scheduled-tasks/README.md)。

| 项 | 路径 |
|----|------|
| 文档与注册 | `.cursor/scheduled-tasks/` |
| 任务脚本 | `.cursor/scheduled-tasks/tasks/` |
| 日志 | `.cursor/scheduled-tasks/logs/` |
| 报告 | `.cursor/scheduled-tasks/reports/` |
| 注册命令 | `npm run register:scheduled-tasks` |

## Claude 交接口

```markdown
## 背景
- 仓库：rhProject
- 任务：[一句话]
- 业务域：[域]

## 建议阅读
- .cursor/wiki/INDEX.md
- [1–3 篇 repowiki 路径]

## 期望输出
- 结论 + 涉及路径 + 风险 + 建议改动文件清单

## 约束
- 不要直接改含中文的 .vue/.ts
```

## Cursor 执行块

```markdown
## Claude 结论摘要
[粘贴]

## 待 Cursor 执行
- [ ] 文件清单
- [ ] npm run verify:chinese（若改中文）
- [ ] build / test

## Wiki 跟进
- [ ] Qoder 刷新 repowiki
- [ ] npm run sync:wiki 或等待计划任务
```
