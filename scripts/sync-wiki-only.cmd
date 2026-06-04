@echo off
cd /d e:\rhProject
echo Syncing GENERATED-INDEX from Repowiki...
node scripts\sync-cursor-wiki-index.mjs
if errorlevel 1 (
  echo Failed. Ensure Node.js is installed.
  pause
  exit /b 1
)
echo Done: .cursor\wiki\GENERATED-INDEX.md
pause
