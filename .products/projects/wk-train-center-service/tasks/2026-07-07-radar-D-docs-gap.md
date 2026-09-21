# Task: radar-D-docs-gap.mjs(文档 / ADR 缺口雷达)

## 元信息
- 状态:📋 todo
- 负责人:Node 脚本作者
- 依赖:radar-A 部分输出(知道哪些模块改过)
- 估时:4h
- 排期:Day 1-2(2026-07-07~08)
- 风险等级:🟢低
- 关联 PRD:[PRD-self-driving-radar.md §4.4](../docs/PRD-self-driving-radar.md#44-雷达-d文档--adr-缺口)

## 范围(SOW)

写 `E:\rhProject\scripts\radar-d-docs-gap.mjs`,扫 3 个源:

1. **Thinkpad 索引**:`E:\rhProject\Thinkpad\index.md` + 22-entities 子目录
2. **项目 PRD**:`.products/projects/{项目}/docs/PRD.md`(6 个项目)
3. **git log 30 天**:`git log --since="30 days ago" --name-only` 找改过的 .java/.vue

扫 3 类:

1. **模块缺 wiki**:
   - 对照 Thinkpad 22-entities 目录(子目录 = 模块档案)
   - 后端 service 目录(`wk-train-center-service/yf-module-*/`)但 22-entities 无对应条目 → 候选
2. **代码/wiki 不一致**:
   - git log 改动的 .java/.vue 涉及模块,但 wiki 未更新 → 候选
3. **ADR 缺失**:
   - 关键决策(框架选型 / 架构变更)无 ADR
   - 例:`.ai-skills-store` 单源方案 / v3 迁移策略 / IDE skill 共享方案 → 应有 ADR

输出双写:

- `E:\rhProject\.products\projects\{项目}\docs\inbox\{YYYY-MM-DD}-docs-gap.md`(候选)
- `E:\rhProject\.cursor\wiki\_gaps\{YYYY-MM-DD}.md`(本次缺口)

## 完成判据

- [ ] 跑 `node E:\rhProject\scripts\radar-d-docs-gap.mjs` 产双写 md
- [ ] 候选 md 含 3 节
- [ ] **至少识别 3 个模块**给具体路径
- [ ] ADR 候选至少 1 条
- [ ] 跑完 < 5 分钟
- [ ] **PRD §7.1 AC4**:含 wiki 缺索引

## 依赖 / 阻塞

- **依赖**:radar-A(知道哪些模块技术债多 → 优先扫这些)
- **被依赖**:radar-runner
- **风险**:`_gaps/` 目录需先建(若不存在)

## 红线

- ❌ 改 `Thinkpad/` 内容(只读)
- ❌ 改 `.cursor/wiki/` 已有内容(只在 `_gaps/` 写新文件)
- ❌ 写 ADR(只建议,主人拍板再写)
- ❌ 改业务代码(只产出候选)

## 验收方式

1. 跑脚本
2. 检查 `tasks/inbox/2026-07-07-docs-gap.md`:
   - 含 3 节
   - 至少 3 个模块有具体路径
3. 检查 `.cursor/wiki/_gaps/2026-07-07.md`:
   - 存在
   - 含本次识别缺口
4. 跑完 < 5 分钟

## 输出预期

Day 1-2 末产出:文档缺口清单(预计 3-10 个模块),ADR 候选 1-3 条。
