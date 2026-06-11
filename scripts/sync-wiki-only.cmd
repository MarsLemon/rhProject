@echo off
REM [Wiki] 同步 Wiki 索引的 .cmd 快捷入口
REM 调用 sync-cursor-wiki-index.mjs 扫描 RepoWiki 生成 GENERATED-INDEX.md
REM 运行: 双击或命令行执行 sync-wiki-only.cmd
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
