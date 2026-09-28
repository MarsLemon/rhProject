# 百炼 API 三层路由方案调研

## Goal
验证「纯文本→Chat+GLM5.2 / 图片→Chat+3.6plus / 文件→Responses」三层路由方案可行性

## 问题背景
- Chat 形式需要 qwen-long 才能看文档，文件需先上传解析，服务器带宽压力大
- Responses 形式可以直接用 URL 传文件
- 需要确认：能否根据输入类型动态路由到不同 API

## Current Phase
- [x] Phase 1: catchup 检查现有档案
- [x] Phase 2: 调研 Responses API 文件 URL 传参能力
- [x] Phase 3: 调研 Chat API vs Responses API 能力对比
- [x] Phase 4: 分析三层路由方案可行性 + 坑点
- [x] Phase 5: 输出结论报告 ✅ 完成

## 决策表
| 问题 | 结论 | 依据 |
|------|------|------|
| Responses API 支持文件 URL 传参？ | ❌ 不支持 | 文档明确：必须先上传文件获取 file_id |
| 文件大小限制？ | 150MB（文档）/ 500MB（batch） | 百炼存储限制 |
| 三层路由是否可行？ | ⚠️ 部分可行 | 文档文件需先上传，无法绕过 |
