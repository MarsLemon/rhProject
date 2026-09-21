# Task: radar-runner.mjs(主入口 + 9 点 cron + git 回滚)

## 元信息
- 状态:📋 todo
- 负责人:Node 脚本作者 + DevOps 专家(schtasks)
- 依赖:T1-T4 全部完成
- 估时:8h(含 cron 1h + 回滚 2h + watchdog 1h)
- 排期:Day 2-3(2026-07-08~09)
- 风险等级:🔴高(回滚 + 调度)
- 关联 PRD:[PRD-self-driving-radar.md §4.5 §4.6 §6](../docs/PRD-self-driving-radar.md)

## 范围(SOW)

写 `E:\rhProject\scripts\radar-runner.mjs`,做 4 件事:

### 1. 串联 4 雷达(PRD §4.5 流程图)

```
9:00 触发
  → git status 干净检查(脏则中止 + 告警)
  → 雷达 A(独立 try/catch,失败 LogA + 继续)
  → 雷达 B(同上)
  → 雷达 C(同上)
  → 雷达 D(同上)
  → 汇总 → tasks/inbox/{date}-radar-summary.md
  → 生成 .cursor/wiki/_gaps/{date}.md
  → 主人 review 通知
```

### 2. Git 回滚机制(PRD §4.6 序列图)

```
对每条候选:
  git checkout -b radar/{date}
  改业务代码
  跑 mvn test / npm run typecheck
  alt 通过:
    git add(不 commit,等主人 review)
    写 inbox 产物
  else 失败:
    git checkout -- <file>
    记日志 + 跳过该项
```

**关键**:改前必检 `git status` 干净(AC10)。

### 3. 调度(PRD §6)

```powershell
schtasks /create /sc daily /st 09:00 /tn "Self-Driving Radar" `
  /tr "node E:\rhProject\scripts\radar-runner.mjs" /rl highest
```

- 失败重试 3 次(指数退避 1s/4s/16s)
- 单次超时 30 分钟,kill + 告警
- 日志:`E:\rhProject\logs\radar\radar-{YYYY-MM-DD}.log`

### 4. Watchdog

写 `E:\rhProject\scripts\radar-watchdog.mjs`,每天 9:30 检 9:00 日志:

- 无日志 → 告警
- 日志含 `FAIL` > 2 → 告警

告警方式:写 `logs/radar/watchdog-{date}.log` + 主人短通知。

## 完成判据

- [ ] **PRD §7.2 AC5**:跑 `node scripts/radar-runner.mjs` 串联 4 雷达
- [ ] **PRD §7.2 AC6**:故意让雷达 A 抛错,雷达 B/C/D 照常产 md
- [ ] **PRD §7.2 AC7**:汇总 md `tasks/inbox/{date}-radar-summary.md` 格式正确
- [ ] **PRD §7.3 AC8**:故意改坏 1 个 .java → 自动回滚
- [ ] **PRD §7.3 AC9**:故意触红线(删 `el_training_record`)→ 拒绝执行 + 日志
- [ ] **PRD §7.3 AC10**:git status 脏时执行 → 中止
- [ ] **PRD §7.4 AC11**:schtasks 建好 9:00 自动触发
- [ ] **PRD §7.4 AC12**:日志完整
- [ ] **PRD §7.4 AC13**:跑完主人收到短通知
- [ ] **PRD §7.5 AC14**:inbox 按日期归档,默认 90 天
- [ ] **PRD §7.5 AC15**:漏看第 2 天仍能 grep 到第 1 天产物
- [ ] Watchdog 9:30 检 9:00 日志存在性
- [ ] 红线拦截脚本 `verify-redline.mjs` 就位

## 依赖 / 阻塞

- **依赖**:T1(雷达 A) + T2(雷达 B) + T3(雷达 C) + T4(雷达 D) 全完成
- **被依赖**:无(收口)
- **风险**:
  - **R2**:git checkout 误伤(高) → 改前 git status 干净检查
  - **R3**:schtasks 失败无感(中) → 9:30 watchdog
  - **R4**:日志涨爆(低) → 按月压缩归档
  - **R5**:隐私字段泄漏(中) → 雷达 B 强制脱敏

## 红线

- ❌ 自动 commit(必须主人 review)
- ❌ 改业务代码不留回滚路径
- ❌ 触发红线(删 el_training_record / 补 v3 空壳 / 改节点枚举)
- ❌ 改 `.ai-skills-store` 下的 8 个核心 skill(只建议)
- ❌ 直连生产库
- ❌ 改 inbox/`_gaps/` 已有内容(只追加新日期文件)
- ❌ 用 `npm i -g skills-link` / 开 `cc-switch` auto sync

## 验收方式

1. 干净 git 跑 `node scripts/radar-runner.mjs` → 检查 4 雷达 + summary
2. 故意让 A 抛错 → 检查 B/C/D 仍产 md
3. 故意改坏 1 个 .java → 跑回滚 demo → 文件恢复
4. 故意删 `el_training_record` → 拒绝 + 日志
5. git status 脏时跑 → 中止
6. 配 schtasks → 等到 9:00(可改时间实测)
7. 检查 `logs/radar/radar-2026-07-09.log` 完整

## 输出预期

Day 2-3 末产出:可被主人手工 / schtasks 9:00 触发的"自驱需求雷达",每早产当天候选清单。
