@echo off
cd /d "%~dp0"
node scripts\install-deep-dive-skill.mjs
if errorlevel 1 exit /b 1
echo.
echo Installed: %USERPROFILE%\.cursor\skills\skill-deep-dive
pause
