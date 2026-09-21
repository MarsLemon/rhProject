# keep-v3-running.ps1 使用说明

> **创建**: 2026-06-25
> **作用**: 守护 Claude Code 会话, 配合 v3 admin 端完整迁移不中断

## 文件位置

- 脚本: `E:\rhProject\scripts\keep-v3-running.ps1`
- 日志: `C:\Users\RUHAI\Desktop\_private_assistant_archive\keep-v3-running.log`
- 进度: `E:\rhProject\.claude\plans\v3-admin-progress.json`
- Bug 日志: `E:\rhProject\.claude\plans\v3-admin-bugs.md`

## 工作原理

1. 每 30 分钟检查 Claude Code 进程是否在跑
2. 不在 → 启动新会话, 自动喂入从 `v3-admin-progress.json` 读的 resumePrompt
3. 在 → 仅输出心跳日志

## 启动方式

### 方式 1: 手动前台跑
```powershell
powershell -ExecutionPolicy Bypass -File E:\rhProject\scripts\keep-v3-running.ps1
```

### 方式 2: Windows 任务计划 (推荐)
1. 打开 `taskschd.msc`
2. 创建任务 → 触发器 → 新建 → 登录时
3. 操作 → 新建 → 程序 `powershell.exe` → 参数 `-ExecutionPolicy Bypass -File E:\rhProject\scripts\keep-v3-running.ps1`
4. 常规 → 不存储密码 (勾选) → 使用最高权限运行

### 方式 3: 开机自启 (进阶)
把脚本快捷方式放到 `shell:startup` 目录:
```powershell
$startup = [Environment]::GetFolderPath('Startup')
Copy-Item "E:\rhProject\scripts\keep-v3-running.lnk" "$startup\"
```

## 注意事项

- ⚠️ **不要配"每 N 分钟重复"** —— 会导致 Claude Code 多个实例并发冲突
- ✅ 只配"登录时"一次性触发, 脚本内部循环
- ✅ 单个 Claude 会话建议最长 6 小时 (本脚本默认不杀进程)
- ✅ 主人看到日志异常可手动 `taskkill /im claude.exe /f` 后重启

## Claude Code CLI 假设

本脚本假设 `claude` 命令已在 PATH 中 (通常 Claude Code 安装时自动配)。若未配:

```powershell
# 查 claude 可执行路径
Get-Command claude -ErrorAction SilentlyContinue
# 若无, 找 Claude Code 安装目录 (通常 %LocalAppData%\Claude\claude.exe)
# 手动加 PATH 或修改脚本中的 Start-Process -FilePath
```

## 与 .claude/plans/ 的关系

- `v3-admin-progress.json` 是**断点续跑的关键** —— 新会话第一件事读它
- `v3-admin-bugs.md` 是**bug 累积地** —— 不阻塞流程, 攒到 N 条统一汇总
- 每次子阶段完成后, Claude 必须更新 `v3-admin-progress.json` 的状态字段