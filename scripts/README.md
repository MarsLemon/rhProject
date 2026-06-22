# rhProject scripts

按功能分组的工具脚本集合。所有非临时脚本都按用途归类,**避免平铺找不到**。

## 📁 目录结构

```
scripts/
├── README.md                          ← 本文件
├── 01-skill-maintenance/             ← Skill 维护(8 核心 + 9 非核心 + 安装/校验)
├── 02-knowledge-graph-and-wiki/      ← 知识图谱 + Cursor Wiki 同步
├── 03-cron-and-watchdog/             ← (占位,定时任务在 AppData/global/scripts)
├── 04-obsidian-vault/                ← Obsidian Vault 迁移 / frontmatter 工具
├── 05-encoding-fixes/                ← 中文编码 / Unicode escape 修复
├── 06-business-verification/         ← 业务验证脚本(培训计划/后端健康)
├── 07-utilities/                     ← 小工具(天气/定时注册)
├── chinese-encoding/                 ← 原有子模块,未动
├── hooks/                            ← 原有 hook 脚本目录,未动
└── lib/                              ← 原有 lib,未动
```

## 🚦 状态图例

- 🟢 **在用** — 主动使用,有引用、有最近运行记录
- 🟡 **备用** — 偶尔手动跑,没被自动调度
- 🔴 **废弃** — 已不用 / 跟其他文件重复,准备归档(暂未删)

## ⚠️ 跨位置说明

| 资源 | 位置 | 备注 |
|---|---|---|
| **Hermes profile 自己的脚本** | `~\AppData\Local\hermes\profiles\muses\scripts\` | muses 专用,不动 |
| **Hermes 全局 cron/watchdog** | `~\AppData\Local\hermes\scripts\` | 全局,不动 |
| **CLAUDE.md 引用的脚本** | `verify-skills.mjs` 在 `01-skill-maintenance/` | 改 path 后 CLAUDE.md 也得跟着改 |
| **hooks/chinese-encoding/lib** | 根目录保留 | 历史遗留子目录,未动 |

## ⚠️ 引用路径变更

以下脚本**被其他文件引用**,移动后需要同步更新:

| 脚本 | 被谁引用 | 需要改的位置 |
|---|---|---|
| `01-skill-maintenance/verify-skills.mjs` | `CLAUDE.md` 末尾提及 | 路径改了不影响运行(因为是用 `npm run` 间接调用),但要保证 package.json 的 scripts 指向新路径 |
| `01-skill-maintenance/install-cursor-skills.{mjs,ps1}` | 内部互引 | 看 mjs 文件内的 require/import |

> 注:rhProject **根目录没有 package.json**,5 个子项目都有自己的 package.json 但**不引用根 scripts/**。
> 所以路径变更**只影响手动 `node scripts/xxx.mjs` 调用**的情况,**不影响自动化**。