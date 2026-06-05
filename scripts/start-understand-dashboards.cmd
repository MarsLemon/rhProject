@echo off
REM =============================================================
REM  启动 understand-anything 仪表板(根 + 3 个子项目)
REM  用法: 直接双击运行, 或在终端中执行 start-understand-dashboards.cmd
REM  停止: 关闭对应的 4 个终端窗口, 或运行 stop-understand-dashboards.cmd
REM =============================================================
setlocal

set "REPO_ROOT=%~dp0.."
set "DASHBOARD_DIR=%USERPROFILE%\.claude\plugins\cache\understand-anything\understand-anything\2.7.5\packages\dashboard"

if not exist "%DASHBOARD_DIR%\package.json" (
  echo [ERROR] 找不到 dashboard 目录: %DASHBOARD_DIR%
  echo         请确认 understand-anything 插件已正确安装。
  pause
  exit /b 1
)

echo.
echo ============================================================
echo  Understand Anything Dashboard Launcher
echo  REPO_ROOT = %REPO_ROOT%
echo  DASHBOARD = %DASHBOARD_DIR%
echo ============================================================
echo.

REM 检查端口占用
netstat -ano | findstr ":5180 " >nul && (
  echo [WARN] 5180 端口已被占用(根 rhproject 仪表板)
  echo        如需重启, 请先运行 stop-understand-dashboards.cmd
  echo.
)
netstat -ano | findstr ":5181 " >nul && (
  echo [WARN] 5181 端口已被占用(wk-train-center-service 仪表板)
  echo.
)
netstat -ano | findstr ":5182 " >nul && (
  echo [WARN] 5182 端口已被占用(wk-train-center-ui 仪表板)
  echo.
)
netstat -ano | findstr ":5183 " >nul && (
  echo [WARN] 5183 端口已被占用(wk-PPTist-ui 仪表板)
  echo.
)

echo 启动 4 个仪表板(每个一个独立窗口)...
echo.

REM 1) 根 rhproject (merged graph)
start "UA-rhProject" cmd /k "cd /d "%DASHBOARD_DIR%" && set UNDERSTAND_ACCESS_TOKEN=rhProject-dashboard-token-2026&& set GRAPH_DIR=%REPO_ROOT%&& npx vite --host 127.0.0.1 --port 5180 --strictPort"

REM 2) wk-train-center-service
start "UA-service" cmd /k "cd /d "%DASHBOARD_DIR%" && set UNDERSTAND_ACCESS_TOKEN=wk-service-token-2026&& set GRAPH_DIR=%REPO_ROOT%\wk-train-center-service&& npx vite --host 127.0.0.1 --port 5181 --strictPort"

REM 3) wk-train-center-ui
start "UA-ui" cmd /k "cd /d "%DASHBOARD_DIR%" && set UNDERSTAND_ACCESS_TOKEN=wk-ui-token-2026&& set GRAPH_DIR=%REPO_ROOT%\wk-train-center-ui&& npx vite --host 127.0.0.1 --port 5182 --strictPort"

REM 4) wk-PPTist-ui
start "UA-pptist" cmd /k "cd /d "%DASHBOARD_DIR%" && set UNDERSTAND_ACCESS_TOKEN=wk-pptist-token-2026&& set GRAPH_DIR=%REPO_ROOT%\wk-PPTist-ui&& npx vite --host 127.0.0.1 --port 5183 --strictPort"

echo  4 个仪表板已在新窗口启动。等待 5 秒后打印 URL...
timeout /t 5 /nobreak >nul

echo.
echo ============================================================
echo  仪表板访问地址(请在浏览器中打开, 必须带 ?token= 参数):
echo.
echo  [1] rhproject 根(merged view, 2974 files, 9663 nodes)
echo      http://127.0.0.1:5180/?token=rhProject-dashboard-token-2026
echo.
echo  [2] wk-train-center-service(1639 files, 6638 nodes)
echo      http://127.0.0.1:5181/?token=wk-service-token-2026
echo.
echo  [3] wk-train-center-ui(989 files, 2447 nodes)
echo      http://127.0.0.1:5182/?token=wk-ui-token-2026
echo.
echo  [4] wk-PPTist-ui(346 files, 575 nodes)
echo      http://127.0.0.1:5183/?token=wk-pptist-token-2026
echo.
echo  关闭仪表板: 直接关闭对应的 4 个终端窗口, 或运行
echo              scripts\stop-understand-dashboards.cmd
echo ============================================================
echo.
endlocal
