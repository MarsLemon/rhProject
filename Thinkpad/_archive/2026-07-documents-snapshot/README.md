# 📦 2026-07 后端 documents/ 离线快照(已废弃)

> **状态**: 🟡 已废弃 (2026-07-14)
> **Owner**: 小马(架构师)
> **归档原因**: 这 4 个文件是 `wk-train-center-service/documents/` 的离线快照(2026-07 复制),但真实的 `documents/` 目录已从后端仓删除。`repowiki/zh/content/` 大量 wiki 链接仍指向 `documents/...`,属于**死链**。

---

## 🚫 不要再用这些文件

| 文件 | 真实身份 | 正确位置 |
|---|---|---|
| `menus.json` | `wk-train-center-service/documents/menus.json` 菜单权限种子数据 | 见下方"复活指引" |
| `VERSION_GUIDE.md` | v1.x 多分支开发规范(已过时) | 不复活,见下方说明 |
| `开发规范与最佳实践总结.md` | 后端 DDD/分层/API 规范总结 | 精华已沉淀到 `Thinkpad/22-entities-实体档案/agent-经验库/3-backend.md` |
| ~~`versions.json`~~ | ~~v1.x 分支版本映射(已彻底废弃)~~ | **完全删除**,由 `.products/projects/wk-train-center-service/docs/version-registry.json` 替代 |

---

## 📜 历史背景

2026-04 后端仓进入 v1.3 多分支开发时代,文档按 `documents/{version}/` 组织,版本与 Git 分支通过 `versions.json` 映射。2026-06 主人拍板「单分支 main + semver」路线,Phase D 收尾版本号机制,`documents/` 目录随之删除。但 Thinkpad 这 4 个文件没清理,继续以"幽灵快照"形态留在这里,导致:

1. **repowiki 大量死链**:`wk-train-center-service/.qoder/repowiki/zh/content/` 至少 30+ 处 `[file://documents/...]` 引用断链
2. **AI 错版本号**:agent 看到 `local/1.3/dev` 可能误以为当前是 v1.3,实际 git 现状只有 main
3. **2 套版本机制并存**:PRD frontmatter 的 semver + 老 versions.json 的 local/X.X/dev,口径混乱

---

## 🔄 复活指引(仅当主人在某个具体任务里需要原始数据时)

### menus.json

- **物理位置**:本目录 `menus.json`
- **格式**:JSON,1828 行,菜单权限树(管理首页/课程/考试/题库/...)
- **使用场景**:仅当主人显式调「查旧菜单权限数据」时读,作为历史快照参考
- **不要做的事**:不要复制回后端仓作为种子数据,菜单权限管理模块有专门的 SQL 初始化脚本

### VERSION_GUIDE.md

- **物理位置**:本目录 `VERSION_GUIDE.md`
- **状态**:**永久废弃**,不要复活
- **替代**:`.products/projects/wk-train-center-service/docs/version-registry.json` + `DEPRECATED-FEATURES.md`

### 开发规范与最佳实践总结.md

- **物理位置**:本目录 `开发规范与最佳实践总结.md`
- **状态**:精华已沉淀,完整保留作为参考
- **替代**:`Thinkpad/22-entities-实体档案/agent-经验库/3-backend.md` 已含 DDD 分层/对象转换/API 设计 等核心能力教训
- **使用方式**:主人偶尔需要详细案例时翻阅,Agent 不主动 read

---

## 🔗 相关指针

- `.products/projects/wk-train-center-service/docs/version-registry.json` — 新版版本号登记表(替代 versions.json)
- `.products/projects/wk-train-center-service/docs/DEPRECATED-FEATURES.md` — 废弃功能清单(防止 AI 复辟)
- `Thinkpad/22-entities-实体档案/agent-经验库/3-backend.md` — 后端能力教训
- `Thinkpad/22-entities-实体档案/agent-经验库/shared-experiences.md` — 跨栈能力教训(含 version-registry 模式)

---

## 📅 维护记录

| 日期 | 操作 | 说明 |
|---|---|---|
| 2026-07-14 | 小马归档 | 4 文件从 `2026-07/` 移入 `_archive/2026-07-documents-snapshot/`,版本机制统一到 version-registry.json |