@echo off
setlocal EnableExtensions
cd /d "%~dp0..\..\.."

set "ST=%CD%\.cursor\scheduled-tasks"
set "LOG=%ST%\logs\skill-cleaner.log"
set "REPORT_DIR=%ST%\reports"
if not exist "%ST%\logs" mkdir "%ST%\logs"
if not exist "%REPORT_DIR%" mkdir "%REPORT_DIR%"

echo.>> "%LOG%"
echo ===== %date% %time% skill-cleaner start =====>> "%LOG%"

where node >nul 2>&1
if errorlevel 1 (
  echo [%date% %time%] ERROR: node not in PATH>> "%LOG%"
  exit /b 1
)

call npm run audit:skills >> "%LOG%" 2>&1
set "RC=%ERRORLEVEL%"

set "SKILL_CLEANER=%USERPROFILE%\.cursor\skills\skill-cleaner\scripts\skill-cleaner.ts"
if exist "%SKILL_CLEANER%" (
  echo [%date% %time%] running global skill-cleaner.ts --no-logs>> "%LOG%"
  node --experimental-strip-types "%SKILL_CLEANER%" --no-logs --months 3 >> "%REPORT_DIR%\skill-cleaner-codex.txt" 2>> "%LOG%"
  if errorlevel 1 set "RC=1"
)

echo [%date% %time%] exit=%RC%>> "%LOG%"
exit /b %RC%
