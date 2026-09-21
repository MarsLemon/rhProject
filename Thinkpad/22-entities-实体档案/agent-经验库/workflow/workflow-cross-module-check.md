---
name: workflow-cross-module-check
description: 改一处动多处：标准检查流程
metadata:
  node_type: memory
  type: feedback
  originSessionId: bc7cc3e6-cb7f-4754-9b22-b31d52b9535c
migrated_from: auto-memory-2026-09-07
migrated_path: C:\Users\RUHAI\.claude\projects\E--rhProject\memory\workflow-cross-module-check.md
---

# 跨域改动检查流程

每次**改业务代码前**，按这 4 步走（不要跳）：

## 1. 定位域

读 [domain-overview](../../../.products/projects/wk-train-center/docs/decisions/domain-overview.md)，确认改动落在哪个域。

## 2. 查耦合点

- 查 [domain-coupling-course-study-task](../../../.products/projects/wk-train-center/docs/decisions/domain-coupling-course-study-task.md)（如改动涉及课程/学习任务/培训计划）
- 否则问用户："这个改动会不会影响 X 域？"——**别替用户做判断**

## 3. 列影响清单

下笔前在回复里**显式列出**：

```
本次改动影响：
- [ ] 后端：<模块/类名>（行号或文件路径）
- [ ] 前端 Vue2：<页面/组件>
- [ ] 前端 Vue3：<页面/组件>（v3 迁移状态？）
- [ ] 移动端 H5：<页面>
- [ ] 数据库：<表名/SQL 文件>
- [ ] Wiki：<repowiki 文档路径>
```

## 4. 改完自检

- 跑 `npm run verify:chinese`（含中文）
- 跑 `mvn clean compile`（后端）
- 跑 `npm run typecheck`（v3）
- 在 `.cursor/wiki/` 里更新相关条目（如有需要）

## 红色信号（必须停下问用户）

- 改动涉及**枚举/字典表** → 多半有下游依赖
- 改动涉及**删除字段/表** → 一定有数据迁移
- 改动涉及**API 响应结构** → 前端 3 端全部要同步

**Why**: 来自 v1.3 陪练节点扩展的踩坑教训。
**How to apply**: 任何跨模块改动前先打印这份清单给用户确认。

## 相关

- [domain-overview](../../../.products/projects/wk-train-center/docs/decisions/domain-overview.md) · [domain-coupling-course-study-task](../../../.products/projects/wk-train-center/docs/decisions/domain-coupling-course-study-task.md)