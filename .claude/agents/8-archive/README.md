# 8-archive 说明

> **建档日期**:2026-07-09(精简方案 D 执行落地)
> **保留期**:30 天可回滚(2026-08-09 后可考虑清理)
> **谁能写**:❌ 全部**只读**,新工作直接用主目录 7 份 agent

## 📦 这里装什么

**16 份旧 agent 文件**(原 19 份 - workflow-orchestrator 已合并 = 18 起点 - 4 新建 + java-backend 砍 = 16),按精简方案 D 砍后归档。

## 📋 砍的原因分类

| 砍的旧 agent | 归入新 agent | 砍原因 |
|---|---|---|
| `research-agent.agent.md` | `research-expert.agent.md` | 2 合 1(资料检索主战场) |
| `wiki-maintainer.agent.md` | `research-expert.agent.md` | 2 合 1(写=调研产物沉淀) |
| `vue2-expert.agent.md` | (退场) | 主人 v3 迁移,v2 退场不再维护 |
| `vue3-expert.agent.md` | `frontend-expert.agent.md` | 前端合 1 |
| `angular-expert.agent.md` | `frontend-expert.agent.md` | 前端合 1 |
| `h5-expert.agent.md` | (frontend-expert 主入口) | 前端合 1 |
| `ppt-expert.agent.md` | `frontend-expert.agent.md` | 前端合 1 |
| `frontend-test-expert.agent.md` | `frontend-expert.agent.md` | 前端合 1(`dim: test` 子模式) |
| `architect.agent.md` | `backend-expert.agent.md` | 后端合 1(`mode: architecture` 子模式) |
| `backend-test-expert.agent.md` | `backend-expert.agent.md` | 后端合 1(`mode: backend-test` 子模式) |
| `java-backend-expert.agent.md` | `backend-expert.agent.md`(5 合 1) | 2026-07-09 23:55 主人口径"也移到 archive",Java CRUD 合并到 backend-expert `mode: java-crud` 子模式 |
| `security-specialist.agent.md` | `backend-expert.agent.md` + `eval-coach` | 安全归后端主入口,eval-coach 取抽象评估方法 |
| `ux-designer-specialist.agent.md` | `frontend-expert.agent.md` + `eval-coach` | UX 归前端主入口,eval-coach 取可用性原则 |
| `test-strategy-specialist.agent.md` | `eval-coach.agent.md` | EVAL 阶段工具合 1 |
| `code-quality-specialist.agent.md` | `eval-coach.agent.md` | EVAL 阶段工具合 1 |

> 备注:`vue2-expert` 是"退场"不归入新 agent。
> 备注:`java-backend-expert` 是 23:55 二次调整("Java CRUD 合进 backend-expert")。

## 📖 怎么读

- **只读查阅**:若主目录 8 份 agent 跑活缺独有经验,可来这里 `read_file 旧 agent` 找原内容
- **不回滚**:30 天后清理 — 不要在 archive 改动后用

## 🔗 关联 SOP

- `E:\rhProject\Thinkpad\99-log\2026-07\agent-精简合并-SOP-方案D.md`(方案 D 全 SOP)
- `E:\rhProject\Thinkpad\99-log\2026-07\log-2026-07-09.md`(今晚 log,含 23:45 段"精简方案 D 调整")

## 📜 合并背景

- **触发**:主人 2026-07-08 问"知识库怎么用",小马派 research-agent 调研 multi-agent 模式 → 出方案对比 → 主人拍方案 D(中度合并 7 类 → 主入口反转后 = 8 份)
- **2026-07-09 调整**:
  - 5 master → 6 master(product 独立)
  - 主入口反转:workflow-orchestrator 合并到 plan-orchestrator(物理删 workflow)
  - 砍 11 份 → 砍 14 份(原 18 - 主目录 4 新 = 14,主目录从 18 → 8,等于砍 10,但加上归档基数,从这个 archive 里数起来就是 14)
  - plan-orchestrator 保留作主路由入口(也是 VS Code Plan 模式唯一能调子 agent 的入口)
- **执行 SOP**:`Thinkpad/99-log\2026-07\agent-精简合并-SOP-方案D.md`
- **零经验丢失**:14 份旧 agent 物理保留在 archive 只读;接收内容已并入新 agent(详见主目录新 agent 文件 📦 接收内容段)
