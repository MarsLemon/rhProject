---
title: Hermes web_extract 后端切换
created: 2026-06-18
updated: 2026-06-18
type: tool
tags: [tool, hermes, fix-plan, ai]
sources: []
confidence: medium   # Tavily 已通,长期稳定性待验证(额度、限流、API 变更)
---

# Hermes web_extract 后端切换

> `web_extract` 工具(`web_search` 的兄弟)—— 把 URL 抓成 markdown 喂给 LLM。
> Hermes 默认用 DuckDuckGo (`ddgs`),但 ddgs **只支持搜索,不能抓页面**。
> 必须显式配 `web.extract_backend`,否则报错:
> `DuckDuckGo (ddgs) is a search-only backend and cannot extract URL content.`

## 为什么有这个坑

`~/.hermes/config.yaml` 默认:

```yaml
web:
  backend: ddgs
  search_backend: ''
  extract_backend: ''    # ← 空,fallback 到 backend=ddgs,extract 就废了
  use_gateway: false
```

空字符串会被代码 fallback 到 `backend` (`ddgs`),所以**即使你不设 extract_backend,搜索能用、抓页面**就是**不能**。

## 4 个可选后端

| 后端 | 优点 | 缺点 | 免费额度 | 申请 |
|---|---|---|---|---|
| `tavily` | 专为 LLM 设计、抓 + 总结一步到位 | 价格中等 | 1000 次/月 | https://tavily.com/ |
| `firecrawl` | 整站抓、Markdown 干净、复杂页面稳 | 单次成本偏高 | 500 页/credit | https://firecrawl.dev/ |
| `exa` | 神经搜索强项在**语义匹配**,纯抓页面一般 | 提取正文不是最强 | 1000 次/月 | https://exa.ai/ |
| `parallel` | 并行抓多 URL 友好 | 生态较小 | 看档位 | https://parallel.ai/ |

## 一键脚本:`E:\rhProject\scripts\check-extract-backend.py`

按"LLM 抓页面体验"自动选: **tavily > firecrawl > exa > parallel**

### 用法

```bash
cd E:/rhProject

# 1. 自动检测 + 应用(查所有 key,挑能 ping 通的第一个)
python scripts/check-extract-backend.py

# 2. 只看不改(默认:找到第一个 OK 就停)
python scripts/check-extract-backend.py --check

# 2b. 完整测所有(看每家健康度,适合配多 key 后确认)
python scripts/check-extract-backend.py --check-all

# 3. 强制指定
python scripts/check-extract-backend.py --set tavily
python scripts/check-extract-backend.py --set ddgs    # 退回搜索-only

# 4. 找路径(Windows 下 ~/.hermes/ 容易看花眼,用这个打绝对路径)
python scripts/check-extract-backend.py --show-env

# 5. 一键用默认编辑器打开 .env(末尾追加 key 即可)
python scripts/check-extract-backend.py --open-env
```

### 行为

- 4 家全部不可用(没 key 或 key 失效)→ 自动切回 ddgs + 弹 4 个申请页
- 选中某家 → `hermes config set web.extract_backend X` + 提示**新会话生效**
- 检测时最小 ping 消耗各家 1 个 credit,**平时跑没事**

### key 放哪

`.env` 文件(`HERMES_HOME/.env`) 或 进程环境变量,二选一:

```bash
# ~/.hermes/.env (推荐,持久,挑一家即可)
TAVILY_API_KEY=tvly-xxx
# FIRECRAWL_API_KEY=fc-xxx
# EXA_API_KEY=exa-xxx
# PARALLEL_API_KEY=par-xxx
```

> ⚠️ **Windows 下 `~/.hermes/` 容易看花眼** —— `~` 只在 git-bash / MSYS 下展开,
> PowerShell / cmd 直接看是字面字符串。**用 `python scripts/check-extract-backend.py --show-env`**
> 拿真实 Windows 路径(`C:\Users\RUHAI\AppData\Local\hermes\.env`),
> 或者 `--open-env` 一键用默认编辑器打开。

## 手动操作(不用脚本)

```bash
hermes config set web.extract_backend tavily
# 验证
hermes config show | grep extract_backend
```

**注意**:改了要 `/reset`(新会话)才生效,平台层是启动时快照的。

## 故障排查

| 现象 | 解法 |
|---|---|
| `extract_backend '' is not a valid choice` | 拼写错,看上面 4 个列表 |
| 改了不生效 | `/reset` 或重启 Hermes 桌面端 |
| Tavily 报 "Invalid max results" | 已是脚本 bug,改 max_results=1,见 [[hermes-internal-cheatsheet]] |
| 弹申请页打不开 | Windows 没装默认浏览器,手动粘 URL |
| 想撤销回默认 | `python scripts/check-extract-backend.py --set ddgs` |
| 找不到 `.env` 在哪 | `python scripts/check-extract-backend.py --show-env`(打绝对路径) |
| 想直接编辑 `.env` | `python scripts/check-extract-backend.py --open-env` |

## 经验沉淀

- **当前状态(2026-06-18)**: 主人填了 `TAVILY_API_KEY`(58 字符 tvly-) 和 `FIRECRAWL_API_KEY`(35 字符 fc-);`--check-all` 实测两家都 HTTP 200;自动模式仍选 tavily(优先级在前);Exa / Parallel 暂未配
- **配置层改 vs 启动层读**: hermes web_extract 后端是启动时读的,改完**必须新会话**
- **ping 端点 ≠ 真实端点**: Tavily `/search` 校验 body 严,假 key 都返 400(看似 key 对);改用最小合法 body 才能暴露 401
- **额度耗尽的判定**: HTTP 402 = 钱没了,401 = key 无效,429 = 限流;脚本已分别处理
- **回退不一定救得了**: ddgs 让搜索能用,extract 还是挂 —— **申请一个免费 key 才是正路**,别靠回退过日子

## 相关

- [[hermes-internal-cheatsheet]] —— Hermes 通用坑(配置缓存、密钥重定向、Windows 行为差异)
- [[INVENTORY]] —— 5 组件工具栈总览
- [[hermes-agent]] skill —— Hermes 自身的 CLI/配置/密钥池权威说明