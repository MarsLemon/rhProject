# 01-skill-maintenance

Skill 安装、清理、验证的统一入口。配套方案 A(`C:\Users\RUHAI\.ai-skills-store\` 单一来源)。

## 文件

| 文件 | 用途 | 状态 | 备注 |
|---|---|---|---|
| `verify-skills.mjs` | 校验 3 IDE + npm + cc-switch 的 skill 单源策略,CI/手动 | 🟢 | **CLAUDE.md 引用**;`npm run verify:skills` 触发 |
| `audit-cursor-skills.mjs` | 扫描 skill 目录,统计 description/token/重复,输出报告 | 🟡 | 报告在 `.cursor/scheduled-tasks/reports/skill-cleaner-report.txt` |
| `apply-skill-cleanup.{mjs,cmd}` | 应用 cleanup(配合 audit) | 🟡 | .cmd 是给 Windows 双击触发 |
| `install-cursor-skills.{mjs,ps1}` | 把 skill 安装到 Cursor | 🟡 | .ps1 是 PowerShell 版本 |
| `install-deep-dive-skill.mjs` | 安装单个 deep-dive skill | 🟡 | |
| `install-deep-dive.ps1` / `.cmd` | PowerShell / cmd 版本 | 🟡 | 跟 .mjs 功能重复,**可能可统一** |
| `install-monorepo-tour.mjs` | monorepo 导航安装 | 🟢 | |

## 用法

```bash
# 校验当前 skill 健康
node 01-skill-maintenance/verify-skills.mjs

# 跑审计(出报告)
node 01-skill-maintenance/audit-cursor-skills.mjs

# 应用 cleanup
node 01-skill-maintenance/apply-skill-cleanup.mjs
```

## 关联

- 触发脚本的 npm 命令见 `package.json`(子项目各自的)
- CLAUDE.md §2.5 "防回归脚本" 一节