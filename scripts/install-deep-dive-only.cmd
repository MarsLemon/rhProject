@echo off
REM [Skill] 安装 skill-deep-dive + 同步 wiki 索引的一键入口
REM 调用 install-deep-dive-and-sync-wiki.mjs（拉 deep-dive 资源 + 重建 wiki 索引）。
REM 运行: scripts\install-deep-dive-only.cmd
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
