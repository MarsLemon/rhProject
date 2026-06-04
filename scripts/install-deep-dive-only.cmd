@echo off
cd /d e:\rhProject
echo Installing skill-deep-dive to %%USERPROFILE%%\.cursor\skills ...
node scripts\install-deep-dive-and-sync-wiki.mjs
if errorlevel 1 (
  echo Failed. Check network and Node.js.
  pause
  exit /b 1
)
echo.
echo Done. Restart Cursor Agent chat to load skill-deep-dive.
pause
