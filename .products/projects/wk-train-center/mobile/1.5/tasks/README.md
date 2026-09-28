# mobile1.1 — H5 移动端 AI 模块改造

> **范围**: wk-mhc-mobile AI 模块从直连百炼迁移到自建后端业务网关
> **Owner**: Qoder（前端）+ Claude（后端接口对齐）
> **状态**: 待启动
> **创建时间**: 2026-07-17

---

## 任务文件

| 文件 | 类型 | 说明 |
|---|---|---|
| [`2026-07-17-h5-ai-gateway-migration.md`](./2026-07-17-h5-ai-gateway-migration.md) | 任务计划 | H5 AI 网关迁移 + DashScope 文件上传 + 12 类 SSE 适配（7 任务，7d） |
| [`2026-07-17-p1-7-dashscope-qwen-long-audit.md`](./2026-07-17-p1-7-dashscope-qwen-long-audit.md) | 审核报告 | P1-7 DashScope Qwen-Long v2 端实现审核（含自审记录） |

---

## 概要

- 从直连百炼（`chatAppStream` + appId）迁移到自建网关（`callAgentChatStream` + promptKey）
- 与 v2 端（wk-train-center-ui）P1-7 DashScope Qwen-Long 对齐
- 保留旧 `chatAppStream` 灰度回退
- 前置依赖：统一计划 v1.0 任务 1~8（后端 AI 网关）已完成
