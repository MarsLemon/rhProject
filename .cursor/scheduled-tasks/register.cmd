@echo off
cd /d "%~dp0..\.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0register.ps1" %*
if errorlevel 1 exit /b 1
echo.
pause
