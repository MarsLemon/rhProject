@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0.cursor\scheduled-tasks\register.ps1" %*
if errorlevel 1 exit /b 1
echo.
pause
