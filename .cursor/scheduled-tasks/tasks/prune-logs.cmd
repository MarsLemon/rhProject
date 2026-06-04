@echo off
setlocal EnableExtensions
cd /d "%~dp0..\..\.."

set "ST=%CD%\.cursor\scheduled-tasks"
set "LOG=%ST%\logs\prune-logs.log"
if not exist "%ST%\logs" mkdir "%ST%\logs"

echo.>> "%LOG%"
echo ===== %date% %time% prune-logs start =====>> "%LOG%"

where node >nul 2>&1
if errorlevel 1 (
  echo [%date% %time%] ERROR: node not in PATH>> "%LOG%"
  exit /b 1
)

node .cursor\scheduled-tasks\scripts\prune-logs.mjs >> "%LOG%" 2>&1
set "RC=%ERRORLEVEL%"

echo [%date% %time%] exit=%RC%>> "%LOG%"
exit /b %RC%
