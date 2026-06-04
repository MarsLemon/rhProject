#Requires -Version 5.1
<#
.SYNOPSIS
  智能培训系统 - 一键启动服务 (Windows Terminal + PowerShell 7)

.DESCRIPTION
  从原 start.bat 移植到 PowerShell。优势：
  - PowerShell 对 WindowsApps symlink 路径处理友好，不会出现 cmd 的 if exist MISSING
  - Start-Process 用数组传参时自动正确加引号，绕开 wt 启动时的引号 bug
  - 路径含空格也不影响
  - 菜单直接显示在 Windows Terminal 的第一个 tab 里（自动 wt 自启）

.USAGE
  双击 start.bat (推荐)
  或: powershell -ExecutionPolicy Bypass -File .\start.ps1

.NOTES
  管理员权限由 start.bat 提权, 本脚本不再 #Requires -RunAsAdministrator
#>

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null
$ErrorActionPreference = 'Stop'

# ==================== wt 自启: 不在 wt 里就跳进 wt ====================
# wt 启动子进程时会设置 $env:WT_SESSION=<guid>
# 没设说明当前不在 wt -> 用 wt 重新启动本脚本
if (-not $env:WT_SESSION) {
    $scriptPath = $MyInvocation.MyCommand.Path
    $scriptDir  = Split-Path -Parent $scriptPath
    $wtCmd = Get-Command wt -ErrorAction SilentlyContinue
    if ($wtCmd) {
        Write-Host "正在跳入 Windows Terminal..." -ForegroundColor Cyan
        # 故意只写 'wt' 和 'pwsh' (不写完整路径), 让 wt 启动子进程时通过 PATH 解析
        # 彻底绕开 wt 内部对完整路径重新 quote 的引号 bug
        Start-Process -FilePath 'wt' -ArgumentList @(
            '-w', '-1', 'nt',
            '--title', 'rh-start',
            '-d', $scriptDir,
            '--', 'pwsh',
            '-NoLogo', '-NoExit',
            '-File', $scriptPath
        )
        # 当前进程退出, 让 wt 新窗口里的 pwsh 跑菜单
        exit 0
    }
    Write-Host "[提示] 未检测到 Windows Terminal, 在当前窗口继续..." -ForegroundColor Yellow
}

# ==================== 路径与基础检查 ====================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RhRoot    = $ScriptDir

# 兜底: 如果脚本在 rhProject 父目录, 找 rhProject 子目录
if (-not (Test-Path (Join-Path $RhRoot 'wk-mhc-ui'))) {
    $alt = Join-Path $RhRoot 'rhProject'
    if (Test-Path (Join-Path $alt 'wk-mhc-ui')) {
        $RhRoot = $alt
    } else {
        Write-Host "未找到 monorepo 根目录(缺少 wk-mhc-ui), 请把 start.ps1 放在 rhProject 根目录。" -ForegroundColor Red
        Read-Host "按 Enter 退出"
        exit 1
    }
}

# ==================== 解析 PowerShell 7 ====================

$PwshCmd = Get-Command pwsh -ErrorAction SilentlyContinue
if (-not $PwshCmd) {
    Write-Host "PowerShell 7 (pwsh) 未找到, 请先安装: https://aka.ms/powershell" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 1
}
$PwshExe = $PwshCmd.Source
Write-Host "PowerShell 7 路径: $PwshExe" -ForegroundColor DarkGray

# ==================== 解析 Windows Terminal ====================

$WtCmd = Get-Command wt -ErrorAction SilentlyContinue
$HasWt = [bool]$WtCmd
if ($HasWt) {
    $WtExe = $WtCmd.Source
    Write-Host "Windows Terminal 路径: $WtExe" -ForegroundColor DarkGray
} else {
    Write-Host "未检测到 Windows Terminal, 各服务将启动为独立 PowerShell 窗口" -ForegroundColor Yellow
}

# ==================== hosts 文件检查 ====================

Write-Host ""
Write-Host "[检查] 正在检查 hosts 文件配置..." -ForegroundColor Cyan
$hostsPath = Join-Path $env:SystemRoot 'System32\drivers\etc\hosts'
$hostsOk = $false
if (Test-Path $hostsPath) {
    try {
        $content = Get-Content $hostsPath -Raw -ErrorAction Stop
        if ($content -match '127\.0\.0\.1.*sbp\.winkong\.local') {
            $hostsOk = $true
        }
    } catch {}
}

if ($hostsOk) {
    Write-Host "✅ hosts 文件配置正确" -ForegroundColor Green
} else {
    Write-Host "⚠️  hosts 文件未配置或配置被注释" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "MHC 微前端项目需要配置 hosts 文件:"
    Write-Host "  127.0.0.1  sbp.winkong.local"
    Write-Host ""
    Write-Host "请手动编辑 C:\Windows\System32\drivers\etc\hosts 文件"
    Write-Host "取消注释或添加上述配置(需要管理员权限)"
    Write-Host ""
    $cont = Read-Host "是否继续启动其他服务? (Y/N, 默认Y)"
    if ($cont -eq 'N') { exit 1 }
    Write-Host ""
}

# ==================== 端口检查 ====================

$Ports = @(4201, 4212, 5173, 8101, 8086, 4213)

function Test-PortListening {
    param([int]$Port)
    try {
        $conn = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction Stop
        return $conn
    } catch {
        return $null
    }
}

function Format-PortStatus {
    param([int]$Port)
    $conn = Test-PortListening -Port $Port
    if ($conn) {
        $pid = $conn.OwningProcess
        Write-Host "  ⚠️  端口 $Port 已被占用 (PID: $pid)" -ForegroundColor Yellow
        return @{ Busy = $true; Pid = $pid }
    } else {
        Write-Host "  ✅ 端口 $Port 可用" -ForegroundColor Green
        return @{ Busy = $false; Pid = $null }
    }
}

function Kill-Port {
    param([int]$Port)
    $conn = Test-PortListening -Port $Port
    if ($conn) {
        Write-Host "  正在关闭 PID $($conn.OwningProcess) ..." -ForegroundColor DarkYellow
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "[检查] 正在检查端口占用情况..." -ForegroundColor Cyan
Write-Host ""

$portStatus = @{}
foreach ($p in $Ports) {
    $portStatus[$p] = Format-PortStatus -Port $p
}

# 如果所有端口都忙, 询问清理
$allBusy = -not ($portStatus.Values | Where-Object { -not $_.Busy } | Select-Object -First 1)
$retry = 0
while ($allBusy -and $retry -lt 3) {
    $retry++
    if ($retry -gt 3) {
        Write-Host "❌ 端口清理失败超过3次, 可能无权限或其他问题" -ForegroundColor Red
        Read-Host "按 Enter 退出"
        exit 1
    }
    Write-Host ""
    Write-Host "所有端口均被占用!" -ForegroundColor Yellow
    $clean = Read-Host "是否清理所有占用的端口? (Y/N, 默认Y)"
    if ($clean -eq 'N') { break }
    Write-Host ""
    Write-Host "[清理] 正在清理占用的端口..." -ForegroundColor Cyan
    foreach ($p in $Ports) { Kill-Port -Port $p }
    Write-Host "  等待端口释放..." -ForegroundColor DarkYellow
    Start-Sleep -Seconds 5
    Write-Host "  ✅ 端口清理完成" -ForegroundColor Green
    Write-Host ""
    $portStatus = @{}
    foreach ($p in $Ports) {
        $portStatus[$p] = Format-PortStatus -Port $p
    }
    $allBusy = -not ($portStatus.Values | Where-Object { -not $_.Busy } | Select-Object -First 1)
}

# ==================== 服务定义 ====================

$Services = @(
    @{ Key = '1'; Name = 'mhc';       Cwd = (Join-Path $RhRoot 'wk-mhc-ui');            Command = 'npm run train:lan';                                    Port = 4201; Url = 'http://localhost:4201' }
    @{ Key = '2'; Name = 'mhc-m';     Cwd = (Join-Path $RhRoot 'wk-mhc-mobile');         Command = 'npm run start';                                        Port = 8086; Url = 'http://localhost:8086' }
    @{ Key = '3'; Name = 'train';     Cwd = (Join-Path $RhRoot 'wk-train-center-ui');     Command = 'cmd /c npm run dev';                                   Port = 4212; Url = 'http://localhost:4212' }
    @{ Key = '4'; Name = 'train-v3';  Cwd = (Join-Path $RhRoot 'wk-train-center-ui-v3');  Command = 'npm run dev';                                          Port = 4213; Url = 'http://localhost:4213' }
    @{ Key = '5'; Name = 'service';   Cwd = (Join-Path $RhRoot 'wk-train-center-service'); Command = 'mvn spring-boot:run -f "yf-web\pom.xml"';            Port = 8101; Url = 'http://localhost:8101' }
    @{ Key = '6'; Name = 'pptist';    Cwd = (Join-Path $RhRoot 'wk-PPTist-ui');          Command = 'npm run dev';                                          Port = 5173; Url = 'http://localhost:5173' }
)

# ==================== 菜单 ====================

Write-Host ""
Write-Host "========================================" -ForegroundColor White
Write-Host "  请选择要启动的服务:" -ForegroundColor White
Write-Host "========================================" -ForegroundColor White
Write-Host ""
Write-Host "  0. 全部启动" -ForegroundColor Gray
foreach ($s in $Services) {
    Write-Host ("  {0}. {1,-22} (端口 {2})" -f $s.Key, $s.Name, $s.Port) -ForegroundColor Gray
}
Write-Host "  示例: 1/2/3 或 1,2,3" -ForegroundColor DarkGray
Write-Host ""

$choice = Read-Host "请选择 (默认0)"
if ([string]::IsNullOrWhiteSpace($choice)) { $choice = '0' }

# 解析选择: 支持 0, 1-6, 1/2/3, 1,2,3
$selected = New-Object System.Collections.Generic.List[object]
$tokens = $choice -split '[/,\s，]+' | Where-Object { $_ }
$validTokens = $tokens | Where-Object { $_ -match '^[0-6]$' }

if (-not $validTokens) {
    Write-Host "无效选择, 请重新运行脚本" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 1
}

if ($validTokens -contains '0') {
    # 全部
    $selected.AddRange($Services)
} else {
    foreach ($t in $validTokens) {
        $s = $Services | Where-Object { $_.Key -eq $t }
        if ($s) { $selected.Add($s) }
    }
}

if ($selected.Count -eq 0) {
    Write-Host "无效选择, 请重新运行脚本" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 1
}

# 去重 (按 Name)
$dedup = $selected | Sort-Object -Property Name -Unique
$selected = $dedup

# ==================== 启动服务 ====================

function Open-WtTab {
    param(
        [string]$WtExe,
        [string]$PwshExe,
        [string]$WindowFlag,    # '-1' 开新窗口, '0' 加到最近窗口
        [string]$TabName,
        [string]$Cwd,
        [string]$Command
    )

    # 关键: 用数组传参, PowerShell 自动正确加引号包裹含空格的元素
    # 注意: 故意只写 'pwsh' (不写 PwshExe 完整路径), 让 wt 启动子进程时通过 PATH 自己解析
    #       这样可以彻底绕开 wt 内部对完整路径重新 quote 的 bug
    $args = @(
        '-w', $WindowFlag, 'nt',
        '--suppressApplicationTitle',
        '--title', $TabName,
        '-d', $Cwd,
        '--', 'pwsh',
        '-NoLogo', '-NoExit',
        '-Command', $Command
    )
    Start-Process -FilePath $WtExe -ArgumentList $args
}

function Open-Independent {
    param(
        [string]$PwshExe,
        [string]$TabName,
        [string]$Cwd,
        [string]$Command
    )
    # 独立 PowerShell 窗口: 同样只写 'pwsh', 让 Windows 自己 PATH 解析
    Start-Process -FilePath 'pwsh' -ArgumentList @(
        '-NoLogo', '-NoExit',
        '-Command', "Set-Location -LiteralPath '$Cwd'; $Command"
    ) -WorkingDirectory $Cwd -WindowStyle Normal
}

Write-Host ""
Write-Host "[启动] 正在启动 $($selected.Count) 个服务..." -ForegroundColor Cyan

$firstTab = $true
foreach ($s in $selected) {
    Write-Host "  [启动] $($s.Name) - $($s.Command)" -ForegroundColor Green

    if ($HasWt) {
        $flag = if ($firstTab) { '-1' } else { '0' }
        Open-WtTab -WtExe $WtExe -PwshExe $PwshExe -WindowFlag $flag -TabName $s.Name -Cwd $s.Cwd -Command $s.Command
        if ($firstTab) {
            # 给 wt 时间开新窗口
            Start-Sleep -Seconds 2
        } else {
            Start-Sleep -Seconds 1
        }
        $firstTab = $false
    } else {
        Open-Independent -PwshExe $PwshExe -TabName $s.Name -Cwd $s.Cwd -Command $s.Command
    }
}

# ==================== 状态展示 ====================

Write-Host ""
Write-Host "========================================" -ForegroundColor White
Write-Host "  ✅ 服务已启动!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor White
Write-Host ""
Write-Host "服务访问地址:" -ForegroundColor Cyan
foreach ($s in $selected) {
    Write-Host ("  - {0,-12} {1}" -f "$($s.Name):", $s.Url)
}

Write-Host ""
if ($HasWt) {
    Write-Host "提示: 所有服务已在同一个 Windows Terminal 窗口中以 Tab 形式启动..." -ForegroundColor DarkGray
} else {
    Write-Host "提示: 未检测到 Windows Terminal, 各服务在独立 PowerShell 7 窗口中启动..." -ForegroundColor DarkGray
}
Write-Host ""
Read-Host "按 Enter 退出"
