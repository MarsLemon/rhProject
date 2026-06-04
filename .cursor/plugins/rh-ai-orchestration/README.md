# rh-ai-orchestration

将 **Cursor / Claude / Qoder** 职责路由打包为可安装的 Cursor/Claude 插件。

## 内容

- Skill：`skills/ai-tool-orchestration/SKILL.md`
- 完整 Rule / Hook / 参考文档在 monorepo：`.cursor/rules/`、`.cursor/hooks/`、`.cursor/wiki/COLLABORATION.md`

## 在 rhProject 内（推荐）

直接打开 `e:\rhProject` 即可，无需安装本插件：

- 常驱 Rule：`.cursor/rules/ai-tool-orchestration.mdc`
- Skill：`.cursor/skills/ai-tool-orchestration/`
- sessionStart Hook：`.cursor/hooks/session-tool-context.mjs`

## 全局安装（可选）

将本目录链接到 Cursor 本地插件：

```bat
mklink /J "%USERPROFILE%\.cursor\plugins\local\rh-ai-orchestration" "e:\rhProject\.cursor\plugins\rh-ai-orchestration"
```

或在 rhProject 根目录双击 `link-rh-ai-orchestration-plugin.cmd`。

## 协作流程

1. **Qoder** 刷新 Repowiki → Git 提交
2. **Cursor** 根目录 `npm run sync:wiki`
3. **Claude** 产出方案/评审 → 按 `reference.md` 交接口给 **Cursor** 执行

详见 `.cursor/wiki/COLLABORATION.md`。
