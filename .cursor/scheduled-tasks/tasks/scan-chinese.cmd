@echo off
setlocal EnableExtensions
cd /d "%~dp0..\..\.."

set "ST=%CD%\.cursor\scheduled-tasks"
set "LOG=%ST%\logs\scan-chinese.log"
set "REPORT=%ST%\reports\encoding-scan-report.txt"
if not exist "%ST%\logs" mkdir "%ST%\logs"
if not exist "%ST%\reports" mkdir "%ST%\reports"

echo.>> "%LOG%"
echo ===== %date% %time% scan:chinese start =====>> "%LOG%"

where node >nul 2>&1
if errorlevel 1 (
  echo [%date% %time%] ERROR: node not in PATH>> "%LOG%"
  exit /b 1
)

call npm run scan:chinese > "%REPORT%" 2>> "%LOG%"
set "RC=%ERRORLEVEL%"

echo [%date% %time%] exit=%RC% report=%REPORT%>> "%LOG%"
exit /b %RC%
