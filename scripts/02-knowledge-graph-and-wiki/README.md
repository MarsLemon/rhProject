# 02-knowledge-graph-and-wiki

知识图谱(`.understand-anything/knowledge-graph.json`)和 Cursor Wiki 的同步/管理工具。

## 文件

| 文件 | 用途 | 状态 |
|---|---|---|
| `merge-understand-graph.mjs` | 合并多份 knowledge graph(per-subproject → 全局) | 🟡 |
| `split-understand-graph.mjs` | 拆分全局 graph 回 per-subproject | 🟡 |
| `fix-service-understand-graph.mjs` | 修复 graph 中的 service 节点问题 | 🟡 |
| `start-understand-dashboards.cmd` | 启动 understand-graph dashboard | 🟡 |
| `stop-understand-dashboards.cmd` | 停止 dashboard | 🟡 |
| `sync-cursor-wiki-index.mjs` | 同步 Cursor wiki 索引 | 🟢 |
| `sync-wiki.cmd` / `sync-wiki-only.cmd` | 全量/单独同步 | 🟡 |
| `_emit-wiki-index.mjs` | 生成 wiki index(以 `_` 开头表示内部 helper) | 🟢 |
| `verify-wiki-index.mjs` | 验证 wiki 索引完整性 | 🟢 |
| `register-sync-wiki-task.cmd` | 注册 Windows 定时任务跑 sync | 🟡 | **疑似废弃**(功能被 `sync-wiki.cmd` + Hermes cron 取代) |

## 用法

```bash
# 生成 wiki index
node 02-knowledge-graph-and-wiki/_emit-wiki-index.mjs

# 验证 wiki 索引
node 02-knowledge-graph-and-wiki/verify-wiki-index.mjs

# 同步 wiki 到 Cursor
node 02-knowledge-graph-and-wiki/sync-cursor-wiki-index.mjs
```

## 关联

- 数据源:`.understand-anything/knowledge-graph.json`(各子项目 + 全局)
- 输出:`.cursor/wiki/`、`repowiki/`
- `npm run sync:wiki`(如果有) 触发同步