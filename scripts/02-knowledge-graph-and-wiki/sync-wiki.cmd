@echo off
REM [Wiki] 同步 Wiki 索引的 .cmd 快捷入口（与 sync-wiki-only.cmd 功能重复）
REM 调用 sync-cursor-wiki-index.mjs 生成 GENERATED-INDEX.md
REM 运行: 双击或命令行执行 sync-wiki.cmd
cd /d "%~dp0"
node .\sync-cursor-wiki-index.mjs
if errorlevel 1 exit /b 1
echo.
echo GENERATED-INDEX updated: ..\.cursor\wiki\GENERATED-INDEX.md
pause
