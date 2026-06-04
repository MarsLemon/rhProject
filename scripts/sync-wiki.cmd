@echo off
cd /d "%~dp0"
node .\sync-cursor-wiki-index.mjs
if errorlevel 1 exit /b 1
echo.
echo GENERATED-INDEX updated: ..\.cursor\wiki\GENERATED-INDEX.md
pause
