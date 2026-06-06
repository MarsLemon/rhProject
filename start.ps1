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

# 一次性拉取所有 Listen 端口, 本地哈希查找
# (避免对每个端口都调一次 Get-NetTCPConnection, 那样需扫全表 N 次)
function Get-ListeningPortMap {
    $map = @{}
    try {
        $conns = Get-NetTCPConnection -State Listen -ErrorAction Stop
        foreach ($c in $conns) {
            $map[[int]$c.LocalPort] = $c
        }
    } catch {}
    return $map
}

function Format-PortStatus {
    param([int]$Port, [hashtable]$Map)
    $conn = $Map[$Port]
    if ($conn) {
        $procId = $conn.OwningProcess
        Write-Host "  ⚠️  端口 $Port 已被占用 (PID: $procId)" -ForegroundColor Yellow
        return @{ Busy = $true; Pid = $procId }
    } else {
        Write-Host "  ✅ 端口 $Port 可用" -ForegroundColor Green
        return @{ Busy = $false; Pid = $null }
    }
}

function Kill-Port {
    param([int]$Port, [hashtable]$Map)
    $conn = $Map[$Port]
    if ($conn) {
        Write-Host "  正在关闭 PID $($conn.OwningProcess) ..." -ForegroundColor DarkYellow
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

$sw = [System.Diagnostics.Stopwatch]::StartNew()
Write-Host ""
Write-Host "[检查] 正在检查端口占用情况..." -ForegroundColor Cyan
Write-Host ""

$listenMap = Get-ListeningPortMap

$portStatus = @{}
foreach ($p in $Ports) {
    $portStatus[$p] = Format-PortStatus -Port $p -Map $listenMap
}

Write-Host ("  耗时: {0}ms" -f $sw.ElapsedMilliseconds) -ForegroundColor DarkGray

# 如果所有端口都忙, 询问清理
$allBusy = -not ($portStatus.Values | Where-Object { -not $_.Busy } | Select-Object -First 1)
$retry = 0
while ($allBusy -and $retry -lt 3) {
    $retry++
    if ($retry -gt 3) {
        Write-Host "❌ 端口清理失败超过3次, 可能无权限或其他问题" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
    Write-Host "所有端口均被占用!" -ForegroundColor Yellow
    $clean = Read-Host "是否清理所有占用的端口? (Y/N, 默认Y)"
    if ($clean -eq 'N') { break }
    Write-Host ""
    Write-Host "[清理] 正在清理占用的端口..." -ForegroundColor Cyan
    foreach ($p in $Ports) { Kill-Port -Port $p -Map $listenMap }
    Write-Host "  等待端口释放..." -ForegroundColor DarkYellow
    Start-Sleep -Seconds 2
    # 清理后重新查一次, 状态以新表为准
    $listenMap = Get-ListeningPortMap
    $portStatus = @{}
    foreach ($p in $Ports) {
        $portStatus[$p] = Format-PortStatus -Port $p -Map $listenMap
    }
    Write-Host "  ✅ 端口清理完成" -ForegroundColor Green
    Write-Host ""
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
Write-Host "  0.  全部启动 (除后端 5)" -ForegroundColor Gray
Write-Host "  00. 全部启动 (含后端 5)" -ForegroundColor Gray
foreach ($s in $Services) {
    Write-Host ("  {0}. {1,-22} (端口 {2})" -f $s.Key, $s.Name, $s.Port) -ForegroundColor Gray
}
Write-Host "  示例: 0, 00, 1/2/3, 1,2,5" -ForegroundColor DarkGray
Write-Host ""

$choice = Read-Host "请选择 (默认 0 = 除后端外全部)"
if ([string]::IsNullOrWhiteSpace($choice)) { $choice = '0' }

# 解析选择: 支持 0(全部除后端), 00(全部含后端), 1-6, 组合如 1,2/3
$selected = New-Object System.Collections.Generic.List[object]

# 00 优先: 全部启动 (含后端)
$isAll = $false
if ($choice -match '(^|[\s/,，])00($|[\s/,，])') {
    $isAll = $true
}

# 0: 全部启动 (除后端 5)
# 注意: 需在 00 判定之后再判定 0, 避免被 00 吞掉
$cleanChoice = $choice
if (-not $isAll) {
    if ($cleanChoice -match '(^|[\s/,，])0($|[\s/,，])') {
        $isAllButBackend = $true
    }
    # 去掉单独的 0 token
    $cleanChoice = $cleanChoice -replace '(^|[\s/,，])0($|[\s/,，])', '$1$2'
}

# 解析剩余的具体编号 1-6
$tokens = $cleanChoice -split '[/,\s，]+' | Where-Object { $_ }
$validTokens = $tokens | Where-Object { $_ -match '^[1-6]$' }

if ($isAll) {
    # 00: 全部启动 (含后端)
    $selected.AddRange($Services)
} elseif ($isAllButBackend) {
    # 0: 全部启动 (除后端 5)
    foreach ($s in $Services) {
        if ($s.Key -ne '5') { $selected.Add($s) }
    }
    # 补充用户额外指定的具体编号 (跳过 5)
    foreach ($t in $validTokens) {
        if ($t -eq '5') { continue }
        $s = $Services | Where-Object { $_.Key -eq $t }
        if ($s -and -not ($selected | Where-Object { $_.Name -eq $s.Name })) {
            $selected.Add($s)
        }
    }
} else {
    foreach ($t in $validTokens) {
        $s = $Services | Where-Object { $_.Key -eq $t }
        if ($s -and -not ($selected | Where-Object { $_.Name -eq $s.Name })) {
            $selected.Add($s)
        }
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

    # wt 把 -- 后面的所有 token 拼成单个字符串传给 CreateProcessW 的 lpApplicationName,
    # 只要路径含空格 (如 "Program Files") 就会产生多个 token 被拼接, 导致 0x80070002。
    # 修复: 创建临时 .cmd 文件, 将 pwsh 命令写入其中, 然后把 .cmd 路径
    # (TEMP 路径无空格 = 单 token) 传给 wt, 确保 wt 只看到一个文件名。
    $cmdFile = Join-Path $env:TEMP "wt-$TabName-$([Guid]::NewGuid().ToString('N').Substring(0,8)).cmd"
    $scriptText = "Set-Location -LiteralPath `"$Cwd`"; $Command"
    $encodedCmd = [Convert]::ToBase64String(
        [System.Text.Encoding]::Unicode.GetBytes($scriptText))
    @(
        '@echo off'
        "`"$PwshExe`" -NoLogo -NoExit -e `"$encodedCmd`""
    ) | Set-Content -LiteralPath $cmdFile -Encoding ASCII

    # cmdFile 路径无空格, 是 -- 后面的唯一 token, wt 能正确找到并执行
    $wtArgs = @(
        '-w', $WindowFlag, 'nt',
        '--suppressApplicationTitle',
        '--title', $TabName,
        '-d', $Cwd,
        '--', $cmdFile
    )
    Start-Process -FilePath $WtExe -ArgumentList $wtArgs
}

function Open-Independent {
    param(
        [string]$PwshExe,
        [string]$TabName,
        [string]$Cwd,
        [string]$Command
    )
    # 独立 PowerShell 窗口: 使用完整路径确保可靠找到 pwsh
    Start-Process -FilePath $PwshExe -ArgumentList @(
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
