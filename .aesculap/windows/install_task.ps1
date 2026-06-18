# Aesculap Windows 任务计划程序安装脚本
# 替代 systemd 单元,功能上接近:
#   - 开机自起(ONSTART)
#   - 当前用户登录时也起
#   - 失败 1 分钟后重试(无限)
#   - 立刻跑一次,验证链路
#
# 用法 (管理员 PowerShell):
#   .\install_task.ps1
#
# 卸载:
#   .\uninstall_task.ps1

$ErrorActionPreference = 'Stop'

$TaskName = 'Aesculap'
$Launcher = 'C:\Users\RUHAI\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe'
$Script   = 'E:\rhProject\.aesculap\windows\daemon_launcher.py'
$Config   = 'E:\rhProject\.aesculap\config.yaml'
$Args     = "`"$Script`" `"$Config`""

# 1) 卸载旧的(幂等)
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "[uninstall] removed existing task '$TaskName'"
}

# 2) 创建新任务
$action = New-ScheduledTaskAction `
    -Execute $Launcher `
    -Argument $Args `
    -WorkingDirectory 'E:\rhProject\.aesculap\windows'

# 触发器:开机 + 登录
$triggerBoot  = New-ScheduledTaskTrigger -AtStartup
$triggerLogin = New-ScheduledTaskTrigger -AtLogOn

# 3) 主体:用当前用户,带最高权限(任务跑在用户会话里,这样能调 hermes gateway)
$principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType Interactive `
    -RunLevel Highest

# 4) 设置:失败重试
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 999 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit (New-TimeSpan -Hours 0)  # 不限时

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $triggerBoot, $triggerLogin `
    -Principal $principal `
    -Settings $settings `
    -Description 'Aesculap — Hermes self-healing daemon (Windows 替代 systemd)' `
    -Force

Write-Host "[install] scheduled task '$TaskName' created"
Write-Host "  launcher: $Launcher"
Write-Host "  args    : $Args"
Write-Host "  triggers: AtStartup + AtLogOn"
Write-Host "  restart : 失败后 1 分钟重试,最多 999 次"
Write-Host ""
Write-Host "立刻跑一次验证:"
Write-Host "  Start-ScheduledTask -TaskName $TaskName"
Write-Host "  Get-ScheduledTask -TaskName $TaskName"
Write-Host ""
Write-Host "查看日志:"
Write-Host "  Get-WinEvent -LogName 'Task Scheduler/Operational' | Where-Object { `$_.Message -like '*Aesculap*' }"
