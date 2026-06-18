# Aesculap 安装记录 — 2026-06-18

> **本喵装完了,但 Windows 上它是个"半装"状态**——理由、限制、能/不能干嘛,都写在这里。

## 装了什么

| 项 | 路径 | 状态 |
|---|---|---|
| Aesculap 包 | `C:\...\hermes-agent\venv\Lib\site-packages\aesculap-0.1.0` (editable) | ✅ |
| Config | `E:\rhProject\.aesculap\config.yaml` | ✅ tier A |
| 自身目录(state) | `E:\rhProject\.aesculap\state\` | ✅ |
| Windows patch(进程探针 + log 探针) | `C:\...\Temp\Aesculap-hermes\aesculap\probes\builtin.py` | ✅ |
| Launcher 脚本 | `E:\rhProject\.aesculap\windows\daemon_launcher.py` | ✅ |
| 装任务计划程序脚本 | `E:\rhProject\.aesculap\windows\install_task.ps1` | ❌ 拒绝装(需要 admin) |

## 你拍板的 5 件事

1. **权限档 A** — 只动 `E:\rhProject`
2. **模型 minimax-cn** — `api_key_env: MINIMAX_API_KEY`(**key 没回显**)
3. **身份黑名单** — `persona.md` + `memories\**\*` + `skills\**\*` 三件套
4. **升级到编码工具** — claude(已装)
5. **通知** — Hermes gateway(发到这 IDE 对话框)

## 当前模式

**`mode=observe` + `enabled=True`** — 只检测、不动手。**不会自愈**。
要切回自动修:`aesculap mode fix E:\rhProject\.aesculap\config.yaml`

## 你每天用的 3 个命令

```bash
# 1) 跑探针看基线
aesculap probe E:\rhProject\.aesculap\config.yaml

# 2) 看 daemon / 模式 / 挂起问题
aesculap status E:\rhProject\.aesculap\config.yaml

# 3) 切模式
aesculap mode fix    E:\rhProject\.aesculap\config.yaml
aesculap mode observe E:\rhProject\.aesculap\config.yaml
```

## ⚠️ 没装的部分 — 老实说

### 1. **没有常驻守护**
任务计划程序装不上(要 admin 权限)。**Aesculap 不会在你不在的时候跑**。
要跑守护:手动启 `python E:\rhProject\.aesculap\windows\daemon_launcher.py E:\rhProject\.aesculap\config.yaml`,它会 fork daemon + 挂了重拉。

### 2. **Hermes 不写日志**
`~/.hermes/logs/agent.log` 不存在(Hermes 桌面 GUI 没调 `setup_logging()`)。
`log_error_burst` 探针因此走 WARN,不会触发自愈。**真出错时它看不见**。
真要恢复:改 Hermes 桌面 GUI 启动,加 `setup_logging(mode="gui")` —— 在 A 档范围外,**没改**。

### 3. **minimax-cn 的 base_url 是猜的**
我们配的 `https://api.minimaxi.com/anthropic` 是**从你现有 Hermes config 抄的**(确实跑通了)。
Aesculap 第一次真分诊时会调它——如果 404/401,改 `E:\rhProject\.aesculap\config.yaml` 里 `triage.base_url` + `selffix.base_url`。

## 改了 Aesculap 源码什么

**两个文件**(都是 Windows patch):

1. `aesculap/probes/builtin.py`
   - `ProcessAliveProbe`:加 Windows 分支,调 `tasklist` 找进程(`/proc` 不可用)
   - `LogErrorCountProbe`:日志文件不存在时从 FAIL 改 WARN(不会触发自愈)
   - `re.compile(pattern, re.IGNORECASE)` — 大小写不敏感

2. `tests/test_probes.py`
   - 修两个跟 Windows 兼容相关的测试(原作者没考虑 Windows)

**这些 patch 我留在了 git 仓库**(`/tmp/Aesculap-hermes/`,Aesculap 装的是 editable 模式,所以改完直接生效)。**没提交、没推、没 PR**——你想 PR 给作者我可以帮你提个 issue / PR,或者你自留这个 fork。

## 什么时候它会有用

- 你装了 `pip install -e .[openai,anthropic]` 之后,**任何**装了 `python` 的机器都能跑
- Linux 上一键 OK(`pip install -e .[openai,anthropic]` + `aesculap install ./config.yaml`)
- Windows 上需要这个 patch + 手动跑守护

## 给未来的"我"留的话

- 真要起守护 + 不在,装 NSSM 或用 pywin32 的 service framework——比任务计划程序靠谱
- 想让 Hermes 日志落地,在 Hermes 桌面 GUI 启动处加 `setup_logging(mode="gui")` + 配套 `gateway.log` / `gui.log` 路径
- 跟作者反馈 Windows 支持(`fcntl` 不能硬绑、process_alive 走 tasklist、log missing 应该 warn)
