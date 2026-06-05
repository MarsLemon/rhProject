@echo off
REM =============================================================
REM  关闭所有 understand-anything 仪表板(5180, 5181, 5182, 5183)
REM =============================================================
setlocal

echo 正在关闭 4 个仪表板进程...

for %%P in (5180 5181 5182 5183) do (
  for /f "tokens=5" %%A in ('netstat -ano ^| findstr "127.0.0.1:%%P "') do (
    echo  端口 %%P -> PID %%A
    taskkill /PID %%A /F >nul 2>&1
  )
)

echo.
echo [DONE] 所有仪表板已关闭。
endlocal
