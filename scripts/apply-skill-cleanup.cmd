@echo off
REM [Skill] 执行 P0/P1 skill 清理的 .cmd 快捷入口
REM 调用 apply-skill-cleanup.mjs 归档/删除无用 skill、修复 doc-sync frontmatter
node "%~dp0apply-skill-cleanup.mjs"
pause
