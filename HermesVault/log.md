# Wiki Log

> Append-only. 每一行是一次改动。
> 超过 500 条 → 滚动到 `log-YYYY.md`。
> 格式: `## [YYYY-MM-DD] action | subject`

## [2026-06-18] create | Wiki 骨架初始化

- **结构**: 建立 `raw/{articles,papers,transcripts,assets}` + `entities/` + `concepts/` + `comparisons/` + `queries/` + `_meta/`
- **.obsidian/**: app.json(基本显示)+ appearance.json(字号/主题) + file-locations.json(附件归 `raw/assets/`)
- **.gitignore**: 屏蔽 Obsidian workspace/cache 状态,但保留 `app.json` / `appearance.json` / `file-locations.json` 跨机器同步
- **文档**: SCHEMA.md / index.md / log.md / 8件套插件说明.md / dataview示例.md
- **位置**: `E:\rhProject\HermesVault\`
- **方案**: 走 `llm-wiki` skill(Karpathy 模式) + Obsidian 作为渲染/编辑 UI
- **来源**: 主人拍板 (1-b + 2-b + 3-b + vault 放 rhProject)

## [2026-06-18] upgrade | 主人接通 Obsidian + 8 件套

- **Obsidian 安装**: Windows 版,选 Local vault,路径 `E:\rhProject\HermesVault`(误装到上一级后清理,无残留)
- **第三方插件 8/8 装齐**: dataview / obsidian-excalidraw-plugin / templater-obsidian / calendar / quickadd / obsidian-tasks-plugin / obsidian-kanban / obsidian-mind-map
- **核心插件**: core-plugins.json 全开(bases / canvas / daily-notes / templates / graph 等)
- **Dataview 调试**: index.md 末尾加 `\`\`\`dataview` 代码块,刷新 + Reading 模式后主人确认表格可见 ✅
- **清理**: rhProject 根目录 `未命名.base` / `未命名.canvas` 已删,无残留
- **最终状态**: 14MB / 9 个 markdown / 8 个插件 / 0 错误 / git status 干净
- **总耗时**: ~30 分钟(搭骨架 5min + 主人装 Obsidian+插件 15min + 调试 10min)
