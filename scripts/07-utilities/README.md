# 07-utilities

小工具 / 单功能脚本。

## 文件

| 文件 | 用途 | 状态 | 备注 |
|---|---|---|---|
| `weather.py` | 命令行天气查询 | 🟡 | `python weather.py Beijing` |
| `register-scheduled-tasks.cmd` | 注册 Windows 定时任务 | 🟡 | **可能废弃**(跟 cron 体系重复) |

## 状态待确认

- `register-scheduled-tasks.cmd`:如果 Hermes cron 已经在用,这个 cmd 可能早就没用了
- `register-sync-wiki-task.cmd`:跟 `sync-wiki.cmd` 重复,**准备归档到 08-deprecated/**

## 用法

```bash
# 查天气
python 07-utilities/weather.py Beijing -j
```