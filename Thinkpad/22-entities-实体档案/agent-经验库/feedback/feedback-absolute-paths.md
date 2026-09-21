---
name: feedback-absolute-paths
description: 用户要求以后所有文件路径都用绝对路径展示（包括相对项目根的相对路径场景）
metadata:
  node_type: memory
  type: feedback
  originSessionId: 2a89edad-3504-4b88-9aa5-3da7bc9af211
migrated_from: auto-memory-2026-09-07
migrated_path: C:\Users\RUHAI\.claude\projects\E--rhProject\memory\feedback-absolute-paths.md
---

以后所有提到文件的地方都使用**绝对路径**（Windows 风格，含盘符，如 `E:\rhProject\...`），不要再使用 `file_path:line_number` 这类的相对项目根写法，也不要省略盘符。

**Why:** 用户明确要求"以后所有的文件都用绝对路径展示"，便于跨工具（IDE、文件管理器、终端）直接定位。
**How to apply:** 任何输出（消息、影响清单、引用）涉及文件路径时一律写完整绝对路径，包括聊天反馈中的"改动文件列表"。