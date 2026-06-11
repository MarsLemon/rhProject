@echo off
REM [System] 仅注册 wiki 同步这一个 Cursor scheduled-task
REM 运行: scripts\register-sync-wiki-task.cmd [参数]
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0.cursor\scheduled-tasks\register-wiki-only.ps1" %*
if errorlevel 1 exit /b 1
echo.
pause
