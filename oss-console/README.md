# OSS Console

本地自用的阿里云 OSS 文件浏览器，独立于 `rhProject` 主仓库，自带 Git。

与培训系统共用同一套存储配置字段（系统管理 → 存储配置 → 阿里云），凭证只放在本机 `.env`，不会提交到 Git。

## 功能

- 按前缀浏览目录与文件（分页）
- 签名预览 / 复制 Object Key
- 批量删除（需二次确认）

## 快速开始

```bash
cd oss-console
cp .env.example .env
# 编辑 .env：从后台「系统管理 → 存储配置 → 阿里云」复制 endpoint / bucket / accessKeyId / accessKeySecret / accelerate

pnpm install
pnpm test         # 单元测试（endpoint 解析等）
pnpm run dev      # API :5179 + 界面 :5180（需同时起前后端，不要只跑 dev:web）
```

浏览器打开：<http://localhost:5180>

## 配置说明

| `.env` 变量 | 后台表单项 | 说明 |
|-------------|-----------|------|
| `endpoint` | EndPoint | 如 `oss-cn-hangzhou`（字典里的值，可带或不带 `.aliyuncs.com`） |
| `bucket` | Bucket | 存储容器名称 |
| `accessKeyId` | AccessKeyId | RAM 账号 AK，需 list/delete 权限 |
| `accessKeySecret` | AccessKeySecret | RAM 账号 SK |
| `accelerate` | 访问URL | **OssConfig.accelerate**，不是 `url`；私有桶的 `url` 是授权接口路径 |
| `defaultPrefix` | （无） | 本工具默认浏览前缀，如 `AI-training/` |
| `PORT` | （无） | 本地 API 端口，默认 5179 |

兼容旧写法：`OSS_ENDPOINT`、`OSS_BUCKET`、`OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`、`OSS_ACCELERATE` / `OSS_PUBLIC_URL` 仍可用。

## 架构

```
Browser (Vue3 + Element Plus) :5180
    └── proxy /api → Express :5179 → ali-oss SDK
```

## 安全

- `.env` 已在 `.gitignore` 中
- 仅绑定本机，不要暴露到公网
- 删除操作不可恢复，请先在测试前缀验证

## 与主项目关系

| 主项目能力 | 本工具 |
|------------|--------|
| `FileUploadOss.vue` 上传 | 不负责上传 |
| `TempFileCleanJob` 定时清 temp | 可手动浏览/删除任意前缀 |
| `OssController` STS | 使用 AK/SK 直连（个人运维） |

参考实现：`wk-PPTist-ui/src/utils/alioss.ts` 的 list/delete 模式。
