# Task: radar-B-business-pain.mjs(业务痛点雷达)

## 元信息
- 状态:📋 todo
- 负责人:Node 脚本作者
- 依赖:无(独立)
- 估时:6h(含脱敏 2h)
- 排期:Day 1(2026-07-07)
- 风险等级:🟡中(隐私脱敏)
- 关联 PRD:<deleted content>

## 范围(SOW)

写 `E:\rhProject\scripts\radar-b-business-pain.mjs`,扫 3 个日志源:

| 日志源 | 路径 | 用途 |
|---|---|---|
| train-center | `E:\rhProject\logs\train-center\` | 后端业务日志 |
| qa | `E:\rhProject\logs\qa\` | QA 测试日志 |
| jvm | `E:\rhProject\logs\jvm\` | JVM 异常 |

扫 4 类:

1. **错误集中页**:grep `ERROR\|Exception` 聚合,出现 `> 10 次/天` 进候选
2. **404/500 路径**:解析 `access.log`,路径出现 `> 5 次/天` 进候选
3. **慢接口**:解析 `> 2000ms` 响应,进 Top 10 候选
4. **用户反馈关键词**:扫 `feedback.log`(若不存在 → 跳过,记 TODO),Top 10 关键词

输出:`E:\rhProject\.products\projects\wk-train-center-service\tasks\inbox\{YYYY-MM-DD}-business-pain.md`

## 完成判据

- [ ] 跑 `node E:\rhProject\scripts\radar-b-business-pain.mjs` 产 md
- [ ] md 含 4 节(每类一节)
- [ ] **强制脱敏**生效:
  - 手机号 `1\d{10}` → `1***********`
  - 邮箱 `@.*` → `@***`
  - 用户名/ID `> 8 位` → `***`
  - 身份证 → `*`
- [ ] 噪音 < 20%(白名单生效)
- [ ] 跑完 < 5 分钟
- [ ] **PRD §7.1 AC2**:含至少 1 类业务痛点

## 依赖 / 阻塞

- **依赖**:日志源存在(若空目录 → 脚本优雅退出 + 记"无日志"提示)
- **被依赖**:radar-runner
- **风险**:**隐私字段泄漏**(中高) → 必须先脱敏再写 md

## 红线

- ❌ 输出含手机号/邮箱/身份证原值
- ❌ 输出含密码/token/session
- ❌ 直连生产库(只读 `E:\rhProject\logs\`)
- ❌ 改业务代码(只产出候选)
- ❌ 跑业务接口

## 验收方式

1. 准备测试日志(注入 3 条含手机号 / 邮箱 / 慢接口的样本)
2. 跑脚本
3. 检查 `tasks/inbox/2026-07-07-business-pain.md`:
   - 含 4 节
   - `grep -E "1[3-9]\d{9}"` → 0 命中(脱敏生效)
   - `grep -E "@[a-z]+\.com"` → 0 命中
4. 跑完 < 5 分钟

## 输出预期

Day 1 末产出:业务痛点清单(预计 5-15 条),含 Top 3 慢接口 / Top 3 错误路径。
