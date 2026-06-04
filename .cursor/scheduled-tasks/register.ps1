# Register rhProject Windows scheduled tasks
# Run from repo root: npm run register:scheduled-tasks

param(
  [ValidateSet('All', 'Wiki', 'SkillCleaner', 'ScanChinese', 'PruneLogs')]
  [string]$Task = 'All',
  [string]$WikiDailyAt = '08:00',
  [string]$SkillCleanerWeeklyAt = '09:00',
  [ValidateSet('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')]
  [string]$SkillCleanerWeeklyDay = 'Sunday',
  [string]$ScanChineseWeeklyAt = '07:00',
  [ValidateSet('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')]
  [string]$ScanChineseWeeklyDay = 'Monday',
  [string]$PruneLogsMonthlyAt = '03:00',
  [int]$PruneLogsDayOfMonth = 1,
  [switch]$Unregister
)

$ErrorActionPreference = 'Stop'
$ScheduledTasksDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = (Resolve-Path (Join-Path $ScheduledTasksDir '..\..')).Path
$TasksDir = Join-Path $ScheduledTasksDir 'tasks'
$LogsDir = Join-Path $ScheduledTasksDir 'logs'

$tasks = @{
  Wiki = @{
    Name = 'rhProject-sync-wiki'
    Runner = Join-Path $TasksDir 'sync-wiki.cmd'
    Log = Join-Path $LogsDir 'sync-wiki.log'
    Description = 'rhProject: sync:wiki + verify:wiki-index'
  }
  SkillCleaner = @{
    Name = 'rhProject-skill-cleaner'
    Runner = Join-Path $TasksDir 'skill-cleaner.cmd'
    Log = Join-Path $LogsDir 'skill-cleaner.log'
    Description = 'rhProject: skill audit -> scheduled-tasks/reports/'
  }
  ScanChinese = @{
    Name = 'rhProject-scan-chinese'
    Runner = Join-Path $TasksDir 'scan-chinese.cmd'
    Log = Join-Path $LogsDir 'scan-chinese.log'
    Description = 'rhProject: scan:chinese encoding report'
  }
  PruneLogs = @{
    Name = 'rhProject-prune-logs'
    Runner = Join-Path $TasksDir 'prune-logs.cmd'
    Log = Join-Path $LogsDir 'prune-logs.log'
    Description = 'rhProject: prune scheduled-tasks logs older than 30 days'
  }
}

function Remove-RhTask([string]$Name) {
  Unregister-ScheduledTask -TaskName $Name -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'SilentlyContinue'
  try {
    & schtasks.exe /Delete /TN $Name /F *> $null
  } finally {
    $ErrorActionPreference = $prev
  }
  Write-Host "Removed: $Name (if existed)"
}

function Register-RhDailyTask {
  param(
    [string]$Name,
    [string]$Runner,
    [string]$Log,
    [string]$Description,
    [string]$DailyAt
  )
  if (-not (Test-Path $Runner)) { throw "Runner not found: $Runner" }
  New-Item -ItemType Directory -Force -Path (Split-Path $Log) | Out-Null
  $time = [DateTime]::ParseExact($DailyAt, 'H:mm', $null)
  $action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument "/c `"$Runner`""
  $trigger = New-ScheduledTaskTrigger -Daily -At $time
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
  $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
  Register-ScheduledTask -TaskName $Name -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description $Description -Force | Out-Null
  Write-Host "Registered: $Name (daily $DailyAt)"
  Write-Host "  Runner: $Runner"
  Write-Host "  Log   : $Log"
}

function Register-RhWeeklyTask {
  param(
    [string]$Name,
    [string]$Runner,
    [string]$Log,
    [string]$Description,
    [string]$WeeklyAt,
    [string]$DayOfWeek
  )
  if (-not (Test-Path $Runner)) { throw "Runner not found: $Runner" }
  New-Item -ItemType Directory -Force -Path (Split-Path $Log) | Out-Null
  $time = [DateTime]::ParseExact($WeeklyAt, 'H:mm', $null)
  $action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument "/c `"$Runner`""
  $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $DayOfWeek -At $time
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
  $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
  Register-ScheduledTask -TaskName $Name -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description $Description -Force | Out-Null
  Write-Host "Registered: $Name (weekly $DayOfWeek $WeeklyAt)"
  Write-Host "  Runner: $Runner"
  Write-Host "  Log   : $Log"
}

function Register-RhMonthlyTask {
  param(
    [string]$Name,
    [string]$Runner,
    [string]$Log,
    [string]$Description,
    [string]$MonthlyAt,
    [int]$DayOfMonth
  )
  if (-not (Test-Path $Runner)) { throw "Runner not found: $Runner" }
  New-Item -ItemType Directory -Force -Path (Split-Path $Log) | Out-Null

  # Windows PowerShell 5.1: use schtasks (/Create /F overwrites existing task).
  $tr = "cmd.exe /c `"$Runner`""
  $schtasksArgs = @(
    '/Create', '/F',
    '/TN', $Name,
    '/TR', $tr,
    '/SC', 'MONTHLY',
    '/D', [string]$DayOfMonth,
    '/ST', $MonthlyAt,
    '/RU', $env:USERNAME,
    '/RL', 'LIMITED'
  )
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    & schtasks.exe @schtasksArgs
    if ($LASTEXITCODE -ne 0) { throw "schtasks failed with exit $LASTEXITCODE" }
  } finally {
    $ErrorActionPreference = $prev
  }

  Write-Host "Registered: $Name (monthly day $DayOfMonth $MonthlyAt via schtasks)"
  Write-Host "  Runner: $Runner"
  Write-Host "  Log   : $Log"
  if ($Description) { Write-Host "  Note  : $Description" }
}

Write-Host "rhProject root: $Root"
Write-Host "Scheduled tasks dir: $ScheduledTasksDir"
Write-Host ''

if ($Unregister) {
  if ($Task -eq 'All' -or $Task -eq 'Wiki') { Remove-RhTask $tasks.Wiki.Name }
  if ($Task -eq 'All' -or $Task -eq 'SkillCleaner') { Remove-RhTask $tasks.SkillCleaner.Name }
  if ($Task -eq 'All' -or $Task -eq 'ScanChinese') { Remove-RhTask $tasks.ScanChinese.Name }
  if ($Task -eq 'All' -or $Task -eq 'PruneLogs') { Remove-RhTask $tasks.PruneLogs.Name }
  exit 0
}

if ($Task -eq 'All' -or $Task -eq 'Wiki') {
  $w = $tasks.Wiki
  Register-RhDailyTask -Name $w.Name -Runner $w.Runner -Log $w.Log -Description $w.Description -DailyAt $WikiDailyAt
}
if ($Task -eq 'All' -or $Task -eq 'SkillCleaner') {
  $s = $tasks.SkillCleaner
  Register-RhWeeklyTask -Name $s.Name -Runner $s.Runner -Log $s.Log -Description $s.Description -WeeklyAt $SkillCleanerWeeklyAt -DayOfWeek $SkillCleanerWeeklyDay
}
if ($Task -eq 'All' -or $Task -eq 'ScanChinese') {
  $c = $tasks.ScanChinese
  Register-RhWeeklyTask -Name $c.Name -Runner $c.Runner -Log $c.Log -Description $c.Description -WeeklyAt $ScanChineseWeeklyAt -DayOfWeek $ScanChineseWeeklyDay
}
if ($Task -eq 'All' -or $Task -eq 'PruneLogs') {
  $p = $tasks.PruneLogs
  Register-RhMonthlyTask -Name $p.Name -Runner $p.Runner -Log $p.Log -Description $p.Description -MonthlyAt $PruneLogsMonthlyAt -DayOfMonth $PruneLogsDayOfMonth
}

Write-Host ''
Write-Host 'Test:'
if ($Task -eq 'All' -or $Task -eq 'Wiki') { Write-Host "  schtasks /Run /TN $($tasks.Wiki.Name)" }
if ($Task -eq 'All' -or $Task -eq 'SkillCleaner') { Write-Host "  schtasks /Run /TN $($tasks.SkillCleaner.Name)" }
if ($Task -eq 'All' -or $Task -eq 'ScanChinese') { Write-Host "  schtasks /Run /TN $($tasks.ScanChinese.Name)" }
if ($Task -eq 'All' -or $Task -eq 'PruneLogs') { Write-Host "  schtasks /Run /TN $($tasks.PruneLogs.Name)" }
