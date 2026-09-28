# DEPRECATED-FEATURES.md — 废弃功能清单

> **目的**: 防止 AI agent 在新需求里回头找/复辟已废弃功能
> **Owner**: Wiki 维护 agent
> **更新时机**: 每次产品层 PRD 标记"功能废弃"时,Wiki 维护 agent 必须同步追加本表
> **读取时机**: 所有 agent 接需求/调代码前必读

---

## 🔍 Agent 使用协议

1. **接任务第一步**:读本文 + grep 任务关键词
2. **命中处理**:立即在响应里显式引用 + 反问主人「此功能已废弃,确认仍要继续吗?」
3. **不命中**:不当作安全,继续按需求执行,但任务完成后回写本表(如发现新废弃)

---

## 📋 废弃功能登记表

### 表结构

| 字段 | 说明 |
|---|---|
| 功能名 | 功能/模块/表/API 路径 |
| 废弃版本 | 从哪个版本开始废弃 |
| 替代方案 | 用什么替代 |
| 废弃原因 | 为什么废弃 |
| 关联代码 | 类名/文件路径/路由(便于 grep) |
| 关联 wiki | repowiki 中引用此功能的页面(便于修死链) |

### 废弃记录

| 功能名 | 废弃版本 | 替代方案 | 废弃原因 | 关联代码 | 关联 wiki |
|---|---|---|---|---|---|
| (暂无) | - | - | - | - | - |

> **首次写本表的时间**: 2026-07-14 — 主人约定建立机制,首条记录等首个废弃功能出现时填入。

---

## 🛡 机制设计背景

### 为什么需要

主人痛点场景:
- 当前代码在 **mobile-v1.1** 分支(local/mobile-v1.1/dev,主分支 master)
- 几个月前 mobile-v1.0 / train-center-v1.4 / 1.3 / 1.2 时代有过某些废弃功能
- 新需求里提到关键词,AI 不读历史 → 翻老代码 → 找到 v1.0 实现 → 提议复活

### 怎么解决

- **写**: 产品层 PRD 标记废弃 → Wiki 维护 agent 同步追加本表 + git tag 不可变锚点
- **读**: 所有 agent 启动必读本表 + grep 任务关键词
- **验证**: backend-expert 实施任务前 → 必跑 `grep -rn "{功能名}" wk-train-center-service/src/` → 命中且本表有记录 → 反问

### 跟 version-registry.json 的关系

- `version-registry.json` = 版本号登记表(回答"现在在哪个版本")
- `DEPRECATED-FEATURES.md` = 废弃功能清单(回答"哪些功能不能用")
- **两者必须配套更新**:版本号 bump + 新功能废弃 → 两个文件一起改

---

## 🔗 关联文件

- `.products/projects/wk-train-center-service/docs/version-registry.json` — 版本号登记表
- `.products/projects/wk-train-center/docs/PRD.md` — 产品层 PRD(废弃决策源头)
- `Thinkpad/_archive/2026-07-documents-snapshot/README.md` — 老 documents/ 快照废弃说明
- `Thinkpad/22-entities-实体档案/agent-经验库/shared-experiences.md` — 含「version-registry 防复辟模式」经验条

---

## 📅 维护记录

| 日期 | 操作 | 说明 |
|---|---|---|
| 2026-07-14 | 小马建立 | 主人拍板建立机制,首条记录待首个废弃功能出现时填入 |