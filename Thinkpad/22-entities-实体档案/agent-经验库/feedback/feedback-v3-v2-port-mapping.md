---
name: feedback-v3-v2-port-mapping
description: "v2 = 4212 端口, v3 = 4213 端口（用户多次强调，AI 反复记错）"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 277fe279-82fe-4162-964d-8f9a2e77a609
migrated_from: auto-memory-2026-09-07
migrated_path: C:\Users\RUHAI\.claude\projects\E--rhProject\memory\feedback-v3-v2-port-mapping.md
---

**v2 (wk-train-center-ui) 端口 = 4212**
**v3 (wk-train-center-ui-v3) 端口 = 4213**

**Why:** 用户在 2026-06-28 会话中多次强调过，AI 反复搞混 4212/4213。

**How to apply:**
- 浏览器访问 v3 → `http://127.0.0.1:4213`
- 浏览器访问 v2 → `http://127.0.0.1:4212`
- 区分方法：v3 页面 title 是 "智能培训系统"，v2 title 是空
- 不要再用 4212 访问 v3！