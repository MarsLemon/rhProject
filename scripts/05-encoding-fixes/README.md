# 05-encoding-fixes

中文编码 / Unicode escape 修复工具。配套 CLAUDE.md "Chinese Encoding Guard" 一节。

## 文件

| 文件 | 用途 | 状态 |
|---|---|---|
| `decode-unicode-escapes.mjs` | 把 `\uXXXX` 形式的 escape 还原成中文字符 | 🟡 |
| `unescape-unicode-in-source.mjs` | 在源码里批量 unescape | 🟡 |
| `ensure-jvm-log-dir.mjs` | 确保 JVM 日志目录存在(避免乱码日志) | 🟡 |
| `show-my-desktop.ps1` | 显示桌面(快捷工具,跟编码无关,临时放这) | 🟡 |

## 用法

```bash
# 把 escape 字符串解码成中文
node 05-encoding-fixes/decode-unicode-escapes.mjs "你好\u4e16\u754c"

# 在源码里批量 unescape
node 05-encoding-fixes/unescape-unicode-in-source.mjs path/to/file
```

## 关联

- CLAUDE.md "Chinese Encoding Guard" 一节
- 钩子:`hooks/subagent-verify-chinese.mjs`