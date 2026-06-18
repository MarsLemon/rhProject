"""Windows 守护启动器 — 替代 systemd 跑 Aesculap 守护进程。

为什么需要这个:
  - Aesculap 原本假设 systemd 拉起 + 崩了自动重启。Windows 没 systemd。
  - Windows 任务计划程序能"开机自起" + "失败重试",但不能像 systemd 那样
    紧盯子进程,需要这个包装脚本作为"被任务计划程序启动的入口",它再去 fork
    真守护并守护它(挂了就拉起)。

用法:
  - 手动跑一次: python daemon_launcher.py E:\\rhProject\\.aesculap\\config.yaml
  - 装成开机自起任务: install_task.ps1

设计:
  - 真守护进程用 subprocess.Popen 启动,主线程 sleep 轮询(1 秒一次)。
  - 守护进程退出码 != 0 → 拉起前 sleep restart_delay,避免紧崩紧启拖垮系统。
  - 主线程只在被 Ctrl+C / 任务计划程序终止时退出。
  - 重启间隔指数退避(5s → 10s → 20s → ... → 上限 5 分钟),连续成功 60 秒后重置。
"""

from __future__ import annotations

import os
import subprocess
import sys
import time
from pathlib import Path


def _daemon_cmd(config: str) -> list[str]:
    py = Path(sys.executable)
    return [str(py), "-m", "aesculap", "start", config]


def run(config: str) -> int:
    if not Path(config).is_file():
        print(f"[launcher] config not found: {config}", file=sys.stderr)
        return 2

    print(f"[launcher] starting daemon with config: {config}")
    print(f"[launcher] python: {sys.executable}")
    backoff = 5
    backoff_max = 300
    stable_since: float | None = None

    while True:
        t0 = time.time()
        proc = subprocess.Popen(_daemon_cmd(config))
        rc = proc.wait()
        uptime = time.time() - t0
        now = time.strftime("%Y-%m-%d %H:%M:%S")
        print(
            f"[launcher] {now} daemon exited code={rc} uptime={uptime:.0f}s",
            flush=True,
        )

        if uptime >= 60:
            # Run stable long enough — reset backoff.
            backoff = 5
            stable_since = time.time()
        else:
            backoff = min(backoff * 2, backoff_max)

        print(f"[launcher] restarting in {backoff}s ...", flush=True)
        try:
            time.sleep(backoff)
        except KeyboardInterrupt:
            print("[launcher] interrupted, exiting", flush=True)
            return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: daemon_launcher.py <config.yaml>", file=sys.stderr)
        sys.exit(1)
    sys.exit(run(sys.argv[1]))
