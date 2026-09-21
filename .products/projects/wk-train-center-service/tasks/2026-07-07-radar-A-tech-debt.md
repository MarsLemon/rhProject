# Task: radar-A-tech-debt.mjs(技术债雷达)

## 元信息
- 状态:📋 todo
- 负责人:Node 脚本作者
- 依赖:无(独立可启动)
- 估时:4h
- 排期:Day 1(2026-07-07)
- 风险等级:🟢低
- 关联 PRD:[PRD-self-driving-radar.md §4.1](../docs/PRD-self-driving-radar.md#41-雷达-a技术债扫描)

## 范围(SOW)

写 `E:\rhProject\scripts\radar-a-techdebt.mjs`,扫 6 个项目:

| 维度 | 范围 |
|---|---|
| 项目 | 后端 + v2 + v3 + mhc-ui + mhc-mobile + PPTist |
| 路径 | `E:\rhProject\wk-train-center-service\` `wk-train-center-ui\` `wk-train-center-ui-v3\` `wk-mhc-ui\` `wk-mhc-mobile\` `wk-PPTist-ui\` |
| 排除 | `node_modules/` `.git/` `dist/` `target/` `tempImg/` `tasks/inbox/` `wiki/_gaps/` |

扫 5 类:

1. **v3 空壳**:`wk-train-center-ui-v3/src/` 下 `< 1KB` 的 `.vue` 文件清单
2. **TODO/FIXME/XXX**:`grep -rn` 聚合,Top 20
3. **重复代码**:用 jscpd 扫 `> 50 行` 重复块
4. **未跑测试**:找 `*Service.java` 但无对应 `*ServiceTest.java`
5. **孤儿导出**:`export` 但无 `import` 引用

输出:`E:\rhProject\.products\projects\wk-train-center-service\tasks\inbox\{YYYY-MM-DD}-tech-debt.md`,每发现一条按模板:

```
### [发现-N] {标题}
- 类型:v3空壳 / TODO / 重复 / 未测 / 孤儿
- 路径:`相对路径/文件:行号`
- 建议:仅入候选,不修复
```

## 完成判据

- [ ] 跑 `node E:\rhProject\scripts\radar-a-techdebt.mjs` 产 md 文件
- [ ] md 含 5 节(每类一节),每节 ≥ 1 条候选
- [ ] 忽略白名单生效(候选 0 命中 `node_modules/` `tasks/inbox/` `wiki/_gaps/`)
- [ ] 噪音 < 20%(总候选里"无意义项"占比)
- [ ] 跑完 < 5 分钟
- [ ] **PRD §7.1 AC1**:能产 `tasks/inbox/YYYY-MM-DD-techdebt.md`

## 依赖 / 阻塞

- **依赖**:无(可独立启动)
- **被依赖**:radar-runner(任务 5)会串接此脚本
- **风险**:jscpd 全仓扫慢 → 第一次跑可考虑分项目超时 30s

## 红线

- ❌ 删任何文件(只标记)
- ❌ 改 v3 空壳(只标,补错成本高)
- ❌ 修 TODO/FIXME(只进候选)
- ❌ 删孤儿导出(只建议,不执行)
- ❌ 直连数据库 / 跑业务接口

## 验收方式

1. 在干净 git 工作区跑脚本
2. 检查 `tasks/inbox/2026-07-07-techdebt.md`:
   - 文件存在
   - 5 节齐全
   - 候选命中至少 3 类(预期 v3 空壳 + TODO 必出)
3. 检查白名单:`grep "node_modules" inbox/2026-07-07-techdebt.md` → 0 命中
4. 跑完时间 < 5 分钟

## 输出预期

Day 1 末产出:候选清单 md(预计 30-80 条),主人可 review 选 3-5 条进 backlog。
