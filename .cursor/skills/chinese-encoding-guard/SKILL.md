---
name: chinese-encoding-guard
description: >-
  Guards Chinese UTF-8 encoding across rhProject monorepo (wk-train-center-ui-v3,
  Cursor rules/skills/hooks/wiki, documents). Detects and repairs mojibake, ????
  placeholders, U+FFFD. Use when writing/editing Chinese in .vue/.ts/.java/.md/.mdc/
  SKILL.md, verify:chinese failures, garbled UI/docs, subagent batches, Vue2 migration.
---

# 中文 UTF-8 编码管控（rhProject 全局）

## 目标

确保 monorepo 内**源码、文档、Cursor 元数据与 Wiki**中的中文以 **UTF-8** 存储且可读，避免 mojibake、???? 占位、U+FFFD 替换符。

## ROS 分层

| 层级 | 文件 | 用途 |
|------|------|------|
| **Rule（常驱）** | [subagent-chinese-verify.mdc](../../rules/subagent-chinese-verify.mdc) | 子 Agent 批次结束必须校验 |
| **Rule（入口）** | [chinese-encoding-guard.mdc](../../rules/chinese-encoding-guard.mdc) | 按场景指向本 Skill |
| **Operations** | `.cursor/hooks/subagent-verify-chinese.mjs`、`scripts/chinese-encoding/` | 见 [reference.md](./reference.md) |
| **Skill（本文档）** | 流程、硬性规则、修复阶梯 | — |

冲突时以 **Skill + reference** 为准。

## 硬性规则

1. **禁止** PowerShell `Get-Content` / `Set-Content` / 重定向读写含中文的源码或文档。
2. **禁止** 子 Agent 直接 `Write` 含中文的 `.vue` / `.ts`；由 **主会话** 写入或用 `copy-vue2-views.mjs`。
3. 编辑器/工作区统一 **UTF-8**，`files.autoGuessEncoding = false`。
4. 含中文的 `.mjs` 修复脚本优先用 `\uXXXX` 写字符串。
5. 批量写入中文后必须 `npm run verify:chinese` 再 build / 提交。
6. **禁止** 用 ???? 占位原文；禁止在错误编码下重打开后保存。

## 标准工作流

```
- [ ] 确认写入方式安全
- [ ] npm run verify:chinese（rhProject 根目录）
- [ ] 失败：手工对照 Vue2 → fix:encoding → repair:chinese-from-v2（最后手段）
- [ ] 子 Agent 批次后 hook 会自动 verify
```

## 修复阶梯

1. **首选**：对照 `wk-train-center-ui` 手工修复
2. **Vue 批量**：`node wk-train-center-ui-v3/scripts/copy-vue2-views.mjs [module]`
3. **元数据/文档**：`npm run fix:encoding`（rhProject 根目录）
4. **破坏性**：`npm run repair:chinese-from-v2`
5. **ROS 文档损坏**：`git restore`（勿再维护脚本副本）

## 安全写入

| 场景 | 做法 |
|------|------|
| Vue2→Vue3 视图 | `copy-vue2-views.mjs` |
| 中文 UI 文案 | 主会话 Write / 编辑器 UTF-8 |
| 生成脚本 | `\uXXXX` 转义 |

命令、脚本列表、扫描范围详见 **[reference.md](./reference.md)**；人类可读总览见 **[scripts/chinese-encoding/README.md](../../../scripts/chinese-encoding/README.md)**。

## 关联

- [vue2-parity-migration](../../../wk-train-center-ui-v3/.cursor/rules/vue2-parity-migration.mdc)
- [rh-project-wiki](../rh-project-wiki/SKILL.md)

## 反模式

- 在 v3/scripts 重复维护全局编码脚本
- 用 `_write-*` 脚本维护 SKILL 副本（已移除）
- 跳过 verify 直接 build
