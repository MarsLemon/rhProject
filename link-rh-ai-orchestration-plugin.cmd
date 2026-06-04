@echo off
set SRC=%~dp0.cursor\plugins\rh-ai-orchestration
set DEST=%USERPROFILE%\.cursor\plugins\local\rh-ai-orchestration
if exist "%DEST%" (
  echo Already exists: %DEST%
  echo Remove or rename it first, then re-run.
  exit /b 1
)
mklink /J "%DEST%" "%SRC%"
if errorlevel 1 exit /b 1
echo Linked: %DEST% -^> %SRC%
pause
