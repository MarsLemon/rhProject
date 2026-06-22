@echo off
REM [System] 注册所有 Cursor scheduled-tasks（转发到 .cursor\scheduled-tasks\register.ps1）
REM 运行: scripts\register-scheduled-tasks.cmd [参数]
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0.cursor\scheduled-tasks\register.ps1" %*
if errorlevel 1 exit /b 1
echo.
pause
