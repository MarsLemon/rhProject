# chinese-encoding-guard 参考（Operations 层）

脚本与扫描配置的唯一详细说明。流程与硬性规则见 [SKILL.md](./SKILL.md)。**总览 README**：[scripts/chinese-encoding/README.md](../../../scripts/chinese-encoding/README.md)。

## npm 命令（rhProject 根目录）

| 命令 | 用途 |
|------|------|
| `verify:chinese` | ROS 门禁：v3 源码 + Cursor 元数据 + 共享文档 |
| `scan:chinese` | 全仓扩展扫描（mobile / service / mhc-ui 等） |
| `fix:encoding` | 一键修复 v3 元数据、迁移文档、v3 rules、知识库 doc、**本目录 README** |
| `repair:chinese-from-v2` | **破坏性**：用 Vue2 template 覆盖损坏的 v3 template |

v3 内仅保留 `verify:chinese` / `prebuild`（经 `scripts/_run-encoding.mjs` 委托到上表）。

## 脚本目录 `scripts/chinese-encoding/`

| 文件 | 用途 |
|------|------|
| `chinese-encoding-core.mjs` | 检测 + Vue2 模板转换 |
| `scan-config.mjs` | verify / scan 共享路径与 walk |
| `restore-metadata.mjs` | verify 前自愈 v3 知识库 doc |
| `verify-chinese-encoding.mjs` | ROS 门禁 |
| `scan-all-encoding-report.mjs` | 全仓报告 |
| `fix-all-encoding.mjs` | `fix:encoding` 编排 |
| `fix-v3-meta-encoding.mjs` | index.html / settings.ts / package.json |
| `write-docs-utf8.mjs` | v3 迁移文档 |
| `fix-cursor-rules-utf8.mjs` | 从 JSON 重写 v3 `.cursor/rules` |
| `_write-repo-doc-utf8.mjs` | v3 知识库模块说明 |
| `repair-chinese-encoding.mjs` | Vue2→v3 template 修复 |
| `cursor-rules-content.json` | v3 rules 源数据 |
| `_write-readme-utf8.mjs` | 恢复本目录 README.md（`\u` 源，防乱码） |

**不再维护**：`_write-chinese-encoding-guard-skill.mjs`（与 SKILL 三份副本重叠）。ROS 文档损坏时用 **git restore**。

## 触发点

| 触发点 | 行为 |
|------|------|
| `subagentStop` hook | `.cursor/hooks/subagent-verify-chinese.mjs` |
| `prebuild` | v3 `package.json` → verify |
| verify 自愈 | `restore-metadata.mjs`（仅 repo doc） |

## 其他子项目

| 项目 | 说明 |
|------|------|
| `wk-mhc-mobile/scripts/fix-ai-chinese.mjs` | 委托 `scripts/unescape-unicode-in-source.mjs` |
| `wk-train-center-ui-v3/scripts/fix-doc-gbk-mojibake.mjs` | 单文件 GBK 误存修复（手工） |
| Vue2→v3 视图 | `wk-train-center-ui-v3/scripts/copy-vue2-views.mjs` |
