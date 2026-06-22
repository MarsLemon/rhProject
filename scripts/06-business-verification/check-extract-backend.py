#!/usr/bin/env python3
"""
check-extract-backend.py
========================
检测 web_extract 4 个可选后端(TAVILY/FIRECRAWL/EXA/PARALLEL) 哪些能用,
然后把 hermes config 的 web.extract_backend 切到第一个能用的,
全部失败就退 ddgs + 弹申请页。

用法:
    python check-extract-backend.py            # 选最优 + 自动应用
    python check-extract-backend.py --check    # 只检测,不动配置
    python check-extract-backend.py --set X    # 强制指定 X (tavily|firecrawl|exa|parallel|ddgs)

设计原则:
- 4 个 key 按"LLM 抓页面体验"排优先: tavily > firecrawl > exa > parallel
- 检测用最小成本 ping,不耗真实额度(各家都有 /me 或 health 端点)
- 失败回退时不静默: stderr 写明原因, exit code 非 0
- 全 0 → 弹各家申请页(用 start 打开浏览器,Windows 友好)

被坑过的:
- ddgs 是 Hermes 默认,extract 报 "search-only backend";如果忘了 set,啥都抓不到
- .env 在 hermes 安装目录,不是 CWD
"""

import argparse
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

HERMES_HOME = Path(os.environ.get("HERMES_HOME") or Path.home() / "AppData/Local/hermes")
ENV_FILE = HERMES_HOME / ".env"
CONFIG_FILE = HERMES_HOME / "config.yaml"

# 优先级顺序: 先用体验最好的,失败一个回退下一个
BACKENDS = [
    {
        "name": "tavily",
        "key_env": "TAVILY_API_KEY",
        "ping": "https://api.tavily.com/search",
        # 用 /search 但只发 1 条带 extract 的最小请求,消耗 = 1 credit
        "ping_method": "POST",
        "ping_body": {"query": "ping", "max_results": 1, "include_answer": False},
        "signup_url": "https://tavily.com/",
    },
    {
        "name": "firecrawl",
        "key_env": "FIRECRAWL_API_KEY",
        "ping": "https://api.firecrawl.dev/v1/scrape",
        "ping_method": "POST",
        "ping_body": {"url": "https://example.com"},  # 极小页面,1 credit
        "signup_url": "https://firecrawl.dev/",
    },
    {
        "name": "exa",
        "key_env": "EXA_API_KEY",
        "ping": "https://api.exa.ai/search",
        "ping_method": "POST",
        "ping_body": {"query": "ping", "numResults": 1, "contents": {"text": False}},
        "signup_url": "https://exa.ai/",
    },
    {
        "name": "parallel",
        "key_env": "PARALLEL_API_KEY",
        "ping": "https://api.parallel.ai/v1beta/search",
        "ping_method": "POST",
        "ping_body": {"objective": "ping"},
        "signup_url": "https://parallel.ai/",
    },
]

DDGS_BACKEND = {"name": "ddgs", "key_env": None}


def load_env_keys() -> dict:
    """读 .env 文件 + 进程环境变量, 返回 {KEY_NAME: value}"""
    keys = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8", errors="ignore").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            # 去引号
            v = v.strip().strip('"').strip("'")
            keys[k.strip()] = v
    # 进程 env 覆盖 .env
    for k in (b["key_env"] for b in BACKENDS if b["key_env"]):
        v = os.environ.get(k)
        if v:
            keys[k] = v
    return keys


def ping_backend(backend: dict, key: str, timeout: float = 8.0) -> tuple[bool, str]:
    """ping 后端,返回 (ok, reason)"""
    url = backend["ping"]
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    # tavily / exa 用 X-API-Key 而非 Bearer,特判
    if backend["name"] in ("exa", "tavily", "firecrawl"):
        headers["Authorization"] = f"Bearer {key}"
    data = json.dumps(backend["ping_body"]).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, headers=headers, method=backend["ping_method"]
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            code = resp.getcode()
            if 200 <= code < 300:
                return True, f"HTTP {code}"
            return False, f"HTTP {code}"
    except urllib.error.HTTPError as e:
        body = ""
        try:
            body = e.read().decode("utf-8", errors="ignore")[:200]
        except Exception:
            pass
        # 401/403 = key 无效, 402 = 额度耗尽, 429 = 限流
        if e.code in (401, 403):
            return False, f"HTTP {e.code} (key 无效或被拒)"
        if e.code == 402:
            return False, f"HTTP 402 (额度用完)"
        if e.code == 429:
            return False, f"HTTP 429 (限流,稍后重试)"
        return False, f"HTTP {e.code} {body}"
    except urllib.error.URLError as e:
        return False, f"网络错误: {e.reason}"
    except Exception as e:
        return False, f"未知错误: {e}"


def pick_backend(keys: dict, check_all: bool = False) -> tuple[dict | None, str, list[dict]]:
    """
    按优先级逐个 ping,返回 (选中的backend, 原因, 全部尝试日志)

    check_all=False(默认): 找到第一个 OK 就停,适合"快速自动选最优"
    check_all=True: 全测一遍不停,适合"--check-all 看所有后端健康度"
    """
    log = []
    for b in BACKENDS:
        key = keys.get(b["key_env"])
        if not key:
            log.append({"backend": b["name"], "result": "skip", "reason": "key 未配置"})
            continue
        ok, reason = ping_backend(b, key)
        log.append({"backend": b["name"], "result": "ok" if ok else "fail", "reason": reason})
        if ok and not check_all:
            return b, f"{b['name']} 健康", log
    # check_all=True 走完所有:从 log 里挑第一个 ok 的
    for entry in log:
        if entry["result"] == "ok":
            b = next(x for x in BACKENDS if x["name"] == entry["backend"])
            return b, f"{b['name']} 健康(check_all 模式)", log
    return None, "4 家全部不可用", log


def set_config_backend(backend_name: str) -> tuple[bool, str]:
    """调 hermes CLI 改 web.extract_backend"""
    if not CONFIG_FILE.exists():
        return False, f"config.yaml 不在 {CONFIG_FILE}"
    try:
        result = subprocess.run(
            ["hermes", "config", "set", "web.extract_backend", backend_name],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode == 0:
            return True, result.stdout.strip() or f"已设为 {backend_name}"
        return False, f"hermes config set 失败: {result.stderr.strip()}"
    except FileNotFoundError:
        return False, "找不到 hermes CLI,确认 PATH 含 hermes"
    except subprocess.TimeoutExpired:
        return False, "hermes config set 超时(>30s)"


def open_signup_pages() -> list[str]:
    """全失败时弹各家申请页,Windows 用 start,POSIX 用 open/xdg-open"""
    urls = [b["signup_url"] for b in BACKENDS]
    try:
        if sys.platform.startswith("win"):
            for u in urls:
                subprocess.Popen(["cmd", "/c", "start", "", u], shell=False)
        elif sys.platform == "darwin":
            for u in urls:
                subprocess.Popen(["open", u])
        else:
            for u in urls:
                subprocess.Popen(["xdg-open", u])
        return urls
    except Exception as e:
        return [f"(打开失败: {e})"] + urls


def print_table(log: list[dict], keys: dict) -> None:
    """打印检测结果表"""
    print(f"\n{'后端':<12} {'结果':<8} {'原因':<30}")
    print("-" * 55)
    for entry in log:
        name = entry["backend"]
        key_status = "✓ key 在" if keys.get([b for b in BACKENDS if b['name']==name][0]['key_env']) else "✗ 无 key"
        print(f"{name:<12} {entry['result']:<8} {entry['reason']:<30} [{key_status}]")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="检测 web_extract 后端 key 健康度,自动切到最优"
    )
    parser.add_argument("--check", action="store_true", help="只检测,不写配置")
    parser.add_argument(
        "--check-all", action="store_true",
        help="完整测所有 key(不停在第一个 ok),适合看每家健康度",
    )
    parser.add_argument(
        "--set", metavar="BACKEND",
        help="强制指定后端 (tavily|firecrawl|exa|parallel|ddgs),跳过检测",
    )
    parser.add_argument(
        "--show-env", action="store_true",
        help="打印 .env / config / HERMES_HOME 的 Windows 绝对路径,方便手动编辑",
    )
    parser.add_argument(
        "--open-env", action="store_true",
        help="用系统默认编辑器打开 .env(Windows 走 os.startfile)",
    )
    args = parser.parse_args()

    # 路径查询模式 (短路,不动配置不联网)
    if args.show_env:
        print(f"HERMES_HOME  : {HERMES_HOME}")
        print(f"ENV 文件     : {ENV_FILE}")
        print(f"Config 文件  : {CONFIG_FILE}")
        print(f"\n手动编辑 .env 可用:")
        if sys.platform.startswith("win"):
            print(f"  notepad \"{ENV_FILE}\"")
            print(f"  code \"{ENV_FILE}\"    # 如果装了 VSCode")
        else:
            print(f"  $EDITOR \"{ENV_FILE}\"")
        print(f"\n查看 config 当前 extract_backend:")
        print(f"  hermes config show | findstr extract_backend")
        return 0

    if args.open_env:
        if not ENV_FILE.exists():
            print(f".env 不存在: {ENV_FILE}", file=sys.stderr)
            return 1
        try:
            if sys.platform.startswith("win"):
                os.startfile(str(ENV_FILE))  # noqa: S606 (有意识)
            elif sys.platform == "darwin":
                subprocess.Popen(["open", str(ENV_FILE)])
            else:
                subprocess.Popen(["xdg-open", str(ENV_FILE)])
            print(f"已用默认编辑器打开: {ENV_FILE}")
            return 0
        except Exception as e:
            print(f"打开失败: {e}", file=sys.stderr)
            print(f"手动: notepad \"{ENV_FILE}\"", file=sys.stderr)
            return 1

    # 强制指定模式
    if args.set:
        name = args.set.lower()
        if name not in ("tavily", "firecrawl", "exa", "parallel", "ddgs"):
            print(f"不支持的后端: {name}", file=sys.stderr)
            return 2
        ok, msg = set_config_backend(name)
        print(f"[强制] {name}: {msg}")
        return 0 if ok else 1

    # 检测模式
    print(f"HERMES_HOME: {HERMES_HOME}")
    print(f"ENV 文件:    {ENV_FILE}")
    keys = load_env_keys()

    check_all = args.check_all
    chosen, reason, log = pick_backend(keys, check_all=check_all)
    print_table(log, keys)

    if args.check or check_all:
        print(f"\n[仅检测] 推荐: {chosen['name'] if chosen else 'ddgs'} — {reason}")
        return 0

    # 应用模式
    if chosen:
        ok, msg = set_config_backend(chosen["name"])
        print(f"\n→ 已切到 {chosen['name']}: {msg}")
        print(f"  下次新会话生效(/reset 或重启 Hermes)")
        return 0 if ok else 1

    # 全失败 → 退 ddgs + 弹申请页
    print("\n4 家全挂 → 退回 ddgs (DDuckDuckGo,仅搜索,抓页面仍会报错)")
    print("  ddgs 满足搜索,但 web_extract 仍会失败 — 申请一个免费 key 才是正路")
    set_config_backend("ddgs")
    urls = open_signup_pages()
    print(f"\n已打开 {len(urls)} 个申请页:")
    for u in urls:
        print(f"  - {u}")
    return 1


if __name__ == "__main__":
    sys.exit(main())