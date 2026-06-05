# OSS Console

本地自用的阿里云 OSS 文件浏览器，独立于 `rhProject` 主仓库，自带 Git。

与培训系统共用同一套存储配置字段（系统管理 → 存储配置 → 阿里云），凭证只放在本机 `.env`，不会提交到 Git。

## 功能

- 按前缀浏览目录与文件（分页）
- **上传**：单/批量，扩展名白名单（pdf / docx / jpg / mp4 …），进度条
- **批量删除**：`deleteMulti` 一次 1000 个 key 分批提交，需二次确认
- 签名预览 / 复制 Object Key
- 公开 / 私有桶自动识别：私有桶直连走签名 URL

## 快速开始

```bash
cd oss-console
cp .env.example .env
# 编辑 .env：从后台「系统管理 → 存储配置 → 阿里云」复制 endpoint / bucket / accessKeyId / accessKeySecret / accelerate

pnpm install
pnpm test         # 单元测试（endpoint 解析、key 校验、上传、deleteMulti 分批等）
pnpm run dev      # API :8101 + 界面 :5180（需同时起前后端，不要只跑 dev:web）
```

浏览器打开：[http://localhost:5180](http://localhost:5180)

## 上传 / 批量删除

### 上传

- 路径：工具栏「上传到当前前缀」按钮（点击弹文件选择框；如需拖拽可改 `<el-upload>` 加 `drag` 属性）
- 协议：`POST /api/objects/upload?prefix=<当前前缀>`，multipart/form-data，`files` 字段
- 流程：浏览器 → Express（multer 内存模式，`maxFileSize` 默认 500MB）→ `ali-oss` 单 `put` 串行
- 扩展名白名单在后端 `server/upload.ts`，命中失败的文件会进 `failed[]`，**不会中断整批**
- 进度条：前端用 `XMLHttpRequest.upload.onprogress`（`fetch` 的上传进度不直观，需要拆 stream）
- 私有桶时 `uploaded[].publicUrl` 为 `''`，前端不展示直链

### 批量删除

- 勾选表格行 → 工具栏「删除选中」 → 弹框确认
- 后端走 `client.deleteMulti(batch, { quiet: true })`，每批 1000 个 key
- 返回 `{ deleted: string[], failed: { key, error }[] }`，前端区分 toast 风格（全部成功/部分失败）

## 配置说明

| `.env` 变量       | 后台表单项      | 说明                                                                          |
| ------------------- | --------------- | ----------------------------------------------------------------------------- |
| `endpoint`        | EndPoint        | 如 `oss-cn-hangzhou`（可带或不带 `.aliyuncs.com`）                        |
| `bucket`          | Bucket          | 存储容器名称                                                                  |
| `accessKeyId`     | AccessKeyId     | RAM 账号 AK，需 list/delete/put 权限                                          |
| `accessKeySecret` | AccessKeySecret | RAM 账号 SK                                                                   |
| `accelerate`      | 访问URL         | **OssConfig.accelerate**，不是 `url`；私有桶的 `url` 是授权接口路径 |
| `security`        | （无）          | `public`（默认）/ `private`；私有桶时直连 URL 强制走签名                  |
| `arn`             | OssConfig.arn   | 占位字段，本工具不接 STS，留空即可                                            |
| `url`             | OssConfig.url   | 占位字段，私有桶授权接口路径，本工具不调用                                    |
| `defaultPrefix`   | （无）          | 工具默认浏览前缀，如 `AI-training/`                                         |
| `maxFileSize`     | （无）          | 单文件上限（字节），默认 `524288000`（500MB），超过 multer 报 400           |
| `PORT`            | （无）          | 本地 API 端口，默认 8101                                                      |

兼容旧写法：`OSS_ENDPOINT`、`OSS_BUCKET`、`OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`、`OSS_ACCELERATE` / `OSS_PUBLIC_URL` 仍可用。

## 架构

```
Browser (Vue3 + Element Plus) :5180
    └── proxy /api → Express :8101→ ali-oss SDK
                          │
                          ├─ GET  /api/health
                          ├─ GET  /api/config          (返回 security + maxFileSize)
                          ├─ GET  /api/objects?prefix=…
                          ├─ POST /api/objects/delete   (deleteMulti 分批)
                          ├─ GET  /api/objects/sign     (签名 URL，expires ∈ [60, 86400])
                          └─ POST /api/objects/upload   (multer 内存模式，串行 put)
```

## 安全

- `.env` 已在 `.gitignore` 中
- 仅绑定本机，不要暴露到公网
- 删除操作不可恢复，请先在测试前缀验证
- 上传白名单在 `server/upload.ts`（前后端均过滤：前端 `accept` 是体验，后端是安全）
- 上传/删除前对 `file.originalname` / `keys[]` 走 `safeJoinKey` 校验，防 `../` 越界与控制字符

## 与主项目关系

| 主项目能力                         | 本工具                                                      |
| ---------------------------------- | ----------------------------------------------------------- |
| `FileUploadOss.vue` 前端上传     | ✅ 后端中转 + 前端 `<el-upload>`                          |
| `OssServiceImpl` 视频转码/缩略图 | ❌ 不做（运维工具场景不需要）                               |
| `TempFileCleanJob` 定时清 temp   | 可手动浏览/删除任意前缀                                     |
| `OssController` STS 临时凭证     | ❌ 不接 STS，AK/SK 直连（**本机自用，绑 127.0.0.1**） |

## 明确边界（不做的事）

- ❌ 不接主项目 DB / `cfg_prop` 表
- ❌ 不接 STS / 临时凭证（AK/SK 已足够；STS 需配 RAM Role，复杂度爆炸）
- ❌ 不直传 OSS（需 CORS + 暴露 AK，与"本机自用最小依赖"冲突）
- ❌ 不分片（`multipartUpload` 只对绕过服务器直传有意义；本工具中转，500MB 内存 Buffer 单 `put` 足够）
- ❌ 不处理桶 versioning（默认没开）
- ❌ 不做多桶切换 / 按前缀删除 / 全局搜索
