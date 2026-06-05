# Understand Anything — Dashboard 入口

rhProject 是 monorepo,包含 3 个子应用,每个都有独立的 `understand-anything` 知识图谱,根目录有合并视图。

## 当前在线的 4 个仪表板

| 端口 | 名称 | 范围 | 文件数 | 节点数 | URL |
|------|------|------|--------|--------|-----|
| 5180 | rhproject (root, merged) | 全部 3 个子项目合并 | 2974 | 9663 | http://127.0.0.1:5180/?token=rhProject-dashboard-token-2026 |
| 5181 | wk-train-center-service | 后端 Java | 1639 | 6638 | http://127.0.0.1:5181/?token=wk-service-token-2026 |
| 5182 | wk-train-center-ui | 前端 Vue 2.7 | 989 | 2447 | http://127.0.0.1:5182/?token=wk-ui-token-2026 |
| 5183 | wk-PPTist-ui | PPT 编辑器 | 346 | 575 | http://127.0.0.1:5183/?token=wk-pptist-token-2026 |

> ⚠️ 上面 URL 末尾的 `?token=...` **必须保留**,否则会被仪表板的访问令牌网关拦截(403)。

## 推荐使用流程

1. **总览**:打开 5180 根视图,看跨子项目关系、合并图谱、跨模块调用
2. **深入后端**:打开 5181,看 Java 代码、DDD 分层、模块结构
3. **深入前端**:打开 5182,看 Vue 组件树、Pinia/Vuex、AI 助手模块
4. **深入 PPT**:打开 5183,看 Vue 3 元素编辑、画布、导出模块

## 启动 / 停止

| 操作 | 命令 |
|------|------|
| 一键启动 4 个仪表板 | `scripts\start-understand-dashboards.cmd`(双击或终端执行) |
| 一键停止 4 个仪表板 | `scripts\stop-understand-dashboards.cmd` |
| 单个启动(参考) | `cd %USERPROFILE%\.claude\plugins\cache\understand-anything\understand-anything\2.7.5\packages\dashboard && set UNDERSTAND_ACCESS_TOKEN=<token> && set GRAPH_DIR=<项目根> && npx vite --host 127.0.0.1 --port <端口> --strictPort` |

## 重新生成知识图谱

| 操作 | 命令 |
|------|------|
| 单个子项目重新理解 | `cd <子项目> && python .understand-anything/kg_update.py` |
| 重新合并到根 | `node scripts\merge-understand-graph.mjs --apply` |
| 修复单个子项目图谱(规范化) | `node scripts\fix-service-understand-graph.mjs <子项目名> --apply` |

## 仪表板背后的数据来源

| 仪表板 | GRAPH_DIR | 读取的图谱 |
|--------|-----------|-----------|
| 5180 | `E:\rhProject` | `.understand-anything/knowledge-graph.json`(merged) |
| 5181 | `E:\rhProject\wk-train-center-service` | `.understand-anything/knowledge-graph.json` |
| 5182 | `E:\rhProject\wk-train-center-ui` | `.understand-anything/knowledge-graph.json` |
| 5183 | `E:\rhProject\wk-PPTist-ui` | `.understand-anything/knowledge-graph.json` |

## 字段 schema 统一

2026-06-05 已对所有 3 个子项目图谱做了一次性规范化:
- 所有 node ID 加了 `<子项目名>/` 前缀(便于跨子项目合并时 ID 唯一)
- 所有 file 节点补全了 `filePath` 字段(此前有 498 个 service 节点无路径)
- 所有 file 节点的 `filePath` 加了 `<子项目名>/` 前缀
- 元数据 `analyzedFiles` 从 file 节点数(而不是 nodes.length)计算

合并脚本 `scripts\merge-understand-graph.mjs` 也加了幂等保护,防止重复加前缀。

## 注意事项

- 仪表板启动时监听 `127.0.0.1`(localhost only),**不暴露到局域网**
- `UNDERSTAND_ACCESS_TOKEN` 是访问令牌,每次启动会重置(脚本里已固定为可记忆值)
- 修改文件后, 仪表板会自动 HMR 热更新,无需重启
- 不要在浏览器中删除 `?token=` 部分, 否则会卡在 "Access Token Required" 页面
