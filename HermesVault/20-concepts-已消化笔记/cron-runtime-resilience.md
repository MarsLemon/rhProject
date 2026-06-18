---
title: Cron 任务运行韧性(限流 / 429 / 窗口重置)
created: 2026-06-18
updated: 2026-06-18
type: concept
tags: [ai, hermes, cron, methodology, fix-plan]
sources: [Hermes memory: cron-runtime-resilience 工艺(06-17)]
confidence: high
---

# Cron 任务运行韧性(限流 / 429 / 窗口重置)

> 跑 MiniMax 限流接口的 cron 任务踩过的坑,沉淀成工艺。
> 适用:任何**限流 API + cron 调度**的组合(如每日微信推送 / 元宝群消息 / Token 用量同步)。

## 三个关键事实

### 1. MiniMax 5h 窗口实测是 **24h 周期**

- **误判**:以为是滚动 5h(每 5h 重置一次)
- **实测**:**每日 0:00 重置**(固定 24h 周期)
- **影响**:夜里跑 cron 比白天更划算(刚重置完),半夜 0-5 点跑能避开白天高峰

### 2. 失败的两种错,处理方式**完全不同**

| 错类型 | 触发场景 | 处理 |
|---|---|---|
| **微信 30s 限流** | 短时间内发消息太快 | `sleep 30s` 后**重试** |
| **Token 429** | 当日配额耗尽 | **静默等下个窗口**(0:00 自动恢复),不重试 |

**致命错误**:**两种错混用同一种处理**(比如都 sleep 30s,或者都重试)→ 429 时疯狂重试浪费时间 / 限流时傻等错过窗口。

### 3. 改底层脚本比改 cron prompt 安全

- **错路**:调 cron job 的 prompt 加重试逻辑(改 hermes 配置)
- **正路**:**底层脚本自己处理**(Python try/except + 限流检测 + 429 检测)
- **理由**:改 hermes 配置影响所有 cron 任务,改脚本只影响这一个,**零改 hermes 配置**

## 标准脚本骨架(参考)

```python
def call_api_with_resilience():
    try:
        resp = call_api()
        resp.raise_for_status()
    except RateLimitError:  # 微信 30s 限流
        time.sleep(30)
        return call_api()  # 重试
    except Token429Error:    # 当日配额耗尽
        log("429 静默等下个窗口(每日 0:00 重置)")
        return None          # 不重试
```

## 配套文件

已写进 `hermes-cron-recipes` skill:
- `check-remaining.py` — 查当日配额
- `cron-runtime-resilience.md` — 完整版
- `minimax-coding-plan-api.md` — API 文档摘录

## 验证清单

- [ ] 跑一次故意限流,确认 sleep 30s 后能成功
- [ ] 跑一次故意 429,确认静默返回 None 而不无限重试
- [ ] 查 0:00 后是否自动恢复(早 8 点查 quota 应是满的)

## 相关

- [[hermes-internal-cheatsheet]]
- [[hermes-skill-system]]
- [[SCHEMA]]
