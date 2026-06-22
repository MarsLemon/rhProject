# 06-business-verification

业务验证脚本 — 跑真实的 API/DB/前端/Maven 单测,确认改动没破坏现有逻辑。

## 文件

| 文件 | 用途 | 状态 | 备注 |
|---|---|---|---|
| `verify-required-removal.py` | 培训计划"必须学习"字段移除 — 自动化验证 | 🟢 | **2026-06-17 跑过**,4 项验证(API/DB/前端/Maven) |
| `check-extract-backend.py` | web_extract 后端健康检查 + 自动切换 | 🟢 | TAVILY/FIRECRAWL/EXA/PARALLEL/DDGS |

## 用法

```bash
# 培训计划 required 字段移除验证
pip install pymysql requests
python 06-business-verification/verify-required-removal.py

# web_extract 后端健康(自动选最优)
python 06-business-verification/check-extract-backend.py
# 只检查不改 config
python 06-business-verification/check-extract-backend.py --check
# 强制指定
python 06-business-verification/check-extract-backend.py --set tavily
```

## 关联

- 验证脚本需要 `localhost:8101`(后端 dev 服务)
- DB 连接走 `wk-train-center-service` 的 application.yml
- web_extract 配置在 `~\AppData\Local\hermes\profiles\muses\config.yaml`