@echo off
setlocal EnableExtensions
cd /d "%~dp0..\..\.."

set "ST=%CD%\.cursor\scheduled-tasks"
set "LOG=%ST%\logs\sync-wiki.log"
if not exist "%ST%\logs" mkdir "%ST%\logs"

echo.>> "%LOG%"
echo ===== %date% %time% sync:wiki start =====>> "%LOG%"

where node >nul 2>&1
if errorlevel 1 (
  echo [%date% %time%] ERROR: node not in PATH>> "%LOG%"
  exit /b 1
)

call npm run sync:wiki >> "%LOG%" 2>&1
set "RC=%ERRORLEVEL%"

if %RC% equ 0 (
  call npm run verify:wiki-index >> "%LOG%" 2>&1
  if errorlevel 1 set "RC=1"
)

echo [%date% %time%] exit=%RC%>> "%LOG%"
exit /b %RC%
