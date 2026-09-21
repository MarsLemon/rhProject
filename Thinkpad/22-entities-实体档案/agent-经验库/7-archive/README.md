---
title: agent-经验库 archive 说明
created: 2026-07-09
updated: 2026-07-09
type: meta
tags: [meta, archive]
owner: 沈超
agent: 小马(架构师)
---

agent: 小马(架构师)
owner: 沈超

# agent-经验库 归档目录(7-archive)

> **建档日期**:2026-07-09(合并方案 B 执行落地)
> **保留期**:30 天可回滚(2026-08-09 后可考虑清理)
> **谁能写**:❌ 全部**只读**,任何新经验写到 6 master 对应文件,不再写 archive

## 📦 这里装什么

15 份旧空壳(占位模板) + 1 份 research-experiences.md(已转 1-research,原文件保留) + **1 份 backend-experiences.md(legacy 活经验存档,2026-07-09 主人口径不进 master,移到 archive)**,共 **17 份**物理上保留原内容便于主人回溯和查阅。

## 🗂️ 文件清单(17 份)

| 原文件名                              | 归入新 master       | 备注                                  |
| ------------------------------------- | ------------------- | ------------------------------------- |
| `angular-experiences.md`              | 4-frontend          | Angular 栈专属,旧空壳                |
| `architect-experiences.md`            | 3-backend           | 架构设计,旧空壳                      |
| `backend-test-experiences.md`         | 3-backend           | 后端测试,旧空壳                      |
| `code-quality-specialist-experiences.md` | 5-test           | 代码质量,旧空壳                      |
| `frontend-test-experiences.md`        | 4-frontend          | 前端测试,旧空壳                      |
| `h5-experiences.md`                   | 4-frontend          | H5 栈专属,旧空壳                    |
| `ppt-experiences.md`                  | 4-frontend          | PPT 栈专属,旧空壳                   |
| `product-manager-experiences.md`      | 2-product           | 产品设计,旧空壳(主人拍板独立一类)   |
| `project-manager-experiences.md`      | 6-review            | 项目运营,旧空壳                      |
| `research-experiences.md`             | 1-research          | 资料检索,1 条活经验已转 1-research   |
| `security-specialist-experiences.md`  | 3-backend           | 安全,旧空壳                          |
| `test-strategy-specialist-experiences.md` | 5-test          | 测试策略,旧空壳                      |
| `ux-designer-specialist-experiences.md` | 4-frontend         | UX,旧空壳                            |
| `vue2-experiences.md`                 | 4-frontend          | Vue2 栈专属,旧空壳                  |
| `vue3-experiences.md`                 | 4-frontend          | Vue3 栈专属,旧空壳                  |
| `wiki-maintainer-experiences.md`      | 1-research          | wiki 维护,旧空壳                     |
| `backend-experiences.md`             | (legacy)             | **后端 1 条活经验存档(2026-07-09 主人拍板:不进 master,迁 archive)**,新经验写 3-backend.md  |

## 📖 怎么读

- **只读查阅**:`read_file 7-archive/<文件名>.md` 即可,无需复制
- **新经验不写这里**——新写经验直接写 6 master 对应文件(`1-research.md` / `2-product.md` / `3-backend.md` / `4-frontend.md` / `5-test.md` / `6-review.md`)
- **回滚**:若 30 天内主人想撤回合并,`git mv 7-archive/* ../` 即可把 17 份文件移回根目录

## ⚠️ 注意

- 旧空壳是**占位模板**(`(暂无经验 — 首个经验将由 <类别> 在纠错时写入)`),主人误开不要慌,**不是新经验丢失**
- 真实活经验**没丢**:`shared-experiences.md` 3 条 + `orchestrator-experiences.md` 3 条 + `1-research.md` 1 条(从 research 转) + `7-archive/backend-experiences.md` 1 条(legacy)= **8 条活经验**

## 📜 合并背景

- **触发**:2026-07-08 主人问"知识库怎么用",小马派 research-agent 调研 multi-agent 模式 → 出方案对比 → 主人拍方案 B(中度合并,7 类)
- **2026-07-09 调整**:5 master → 6 master(product 独立);序号重排 1-research/2-product/3-backend/4-frontend/5-test/6-review;archive 序号 6→7
- **执行 SOP**:`Thinkpad/99-log/agent-经验库合并-SOP-方案B.md`
- **零经验丢失**:15 份空壳物理保留在 archive;3 份活经验保留原文件名;1 份 research 的 1 条活经验转入 1-research
