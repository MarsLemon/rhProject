---
name: reference-bailian-file-size-limits
description: 阿里云百炼 UNSTRUCTURED 类目单文件大小上限（按类型），改 BailianSyncJob/BailianService 前必看
metadata:
  node_type: memory
  type: reference
  originSessionId: 371fb4ca-f01f-4e3d-8880-0127e6a876bf
migrated_from: auto-memory-2026-09-07
migrated_path: C:\Users\RUHAI\.claude\projects\E--rhProject\memory\reference-bailian-file-size-limits.md
---

阿里云百炼《准备工作-支持上传的文件类型》(2026-06-22 用户截图确认)：

| 类别 | 上限 | 扩展名 |
|---|---|---|
| 文档 | 100 MB | .doc .docx .wps .ppt .pptx .xls .xlsx .md .txt .pdf |
| 图片 | 20 MB | .png .jpg .jpeg .bmp .gif（仅文字图片）|
| 视频 | 512 MB | .mp4 .mkv .avi .mov .wmv |
| 音频 | 512 MB | .aac .amr .flac .flv .m4a .mp3 .mpeg .ogg .opus .wav .webm .wma |

**Why:** 超过上限百炼 API 会以 HTTP 400 `"size too large"` 永久拒绝。是硬限制，无法绕过。

**How to apply:**
- 改百炼导入 / 上传 / 同步逻辑前先核对此表，避免再次出现 "size too large" 死循环刷日志
- 单文件阈值**不是 2GB**，按类型不同
- 文件大小探测走 HTTP HEAD，用 [[FileUtils.getFileSizeFromUrl]]（vision 和 oss 模块已用过）
- 关联历史 bug：[[百炼重复导入问题根因分析与修复]] 修过同类问题