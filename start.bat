@echo off
rem ============================================================================
rem start.bat - 一键启动入口（双击运行）
rem 工作流:
rem   1. 本 bat 自提权 (UAC)
rem   2. 调 pwsh -File start.ps1
rem   3. start.ps1 内部检测是否在 wt 里, 不在则用 wt 重新启动自己
rem   4. 最终只看到 1 个 Windows Terminal 窗口, 菜单在第一个 tab
rem ============================================================================

rem ===== 1. 自提权: 不是管理员就重新启动本 bat 为管理员 =====
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

rem ===== 2. 找 PowerShell =====
where pwsh >nul 2>&1
if %errorlevel% equ 0 (
    set "PS_EXE=pwsh"
) else (
    set "PS_EXE=powershell"
    echo [警告] 未找到 PowerShell 7 ^(pwsh^), 回退到 Windows PowerShell 5.1
)

rem ===== 3. 启动 start.ps1 (菜单会自己跳进 Windows Terminal) =====
%PS_EXE% -NoLogo -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
set "PS_EXIT=%errorlevel%"

rem ===== 4. 兜底: 出错时 pause 让你看到错误 =====
if not "%PS_EXIT%"=="0" (
    echo.
    echo ========================================
    echo [start.ps1 退出码: %PS_EXIT%]
    echo ========================================
    echo.
    echo 如果空白一片: Windows Terminal 可能没弹出来, 检查任务栏
    echo 常见原因:
    echo   1. UAC 被取消 (在 UAC 对话框点 "否")
    echo   2. Windows Terminal 未安装
    echo   3. start.ps1 内部抛错 (看上面输出)
    echo.
    pause
)
