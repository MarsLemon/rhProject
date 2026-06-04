# 移动端图片扫描（拍照识题）功能开发现状盘点

> 工作区: `e:/rhProject/wk-mhc-mobile`
> 模块: `src/pages/smart-training/`
> 范围: 拍照/相册选图 → 多模态识别 → 文本回填输入框
> 调研日期: 2026-06-03

## 一、Context（为什么做这次盘点）

您要求"检查一下我移动端扫描图片的功能开发的怎么样了"。经澄清，您所指的具体能力是**拍照识题**（图片 → 文字，回填到 AI 助手的输入框），而**不是**二维码扫描、文档扫描或以图搜图。

经对 `wk-mhc-mobile` 项目的全面代码搜索（已排除 `node_modules`），定位到该能力位于 `smart-training/ai/image` 子模块中。**经核实，该能力已基本完成闭环**（从 UI 触发到后端识别再到回填），且已接入两个核心 AI 助手视图。本计划文件即作为**现状报告**输出。

## 二、整体链路（一图概览）

```
┌──────────────────────────────────────────────────────────────┐
│ AiInputBar（输入条）                                          │
│  └─ 拍照/相册按钮 (van-action-sheet)                           │
│      └─ <input type="file" capture="environment">             │
│           └─ useImageCapture (File + ObjectURL)               │
│                └─ AiImageCapturePreview（确认/重拍弹窗）         │
│                     └─ "识别并填入"                              │
│                          └─ useImageRecognition               │
│                                ├─ uploadReferenceFileToOss    │
│                                │    (ali-oss, >5MB 分片)       │
│                                ├─ signReferenceFileUrls       │
│                                │    (签名 600s)                │
│                                └─ postImageRecognize           │
│                                     POST /api/wk/vision/      │
│                                          recognize            │
│                                      ↓ 阿里百炼多模态            │
│                                text → inputText + 附件列表       │
└──────────────────────────────────────────────────────────────┘
```

## 三、文件清单（按层级）

### 3.1 API 层

| 文件 | 行数 | 状态 | 关键能力 |
|---|---|---|---|
| [image.ts](file:///e:/rhProject/wk-mhc-mobile/src/pages/smart-training/api/ai/image.ts) | 33 | ✅ 完成 | `postImageRecognize` 调用 `POST /api/wk/vision/recognize`，统一错误处理 `imageApiErrorMessage`，与语音模块 `voiceApiErrorMessage` 对齐 |

### 3.2 UI 组件层

| 文件 | 行数 | 状态 | 关键能力 |
|---|---|---|---|
| [AiImageCapturePreview.vue](file:///e:/rhProject/wk-mhc-mobile/src/pages/smart-training/components/ai/AiImageCapturePreview.vue) | 127 | ✅ 完成 | 底部弹窗预览图片，支持 `recognitionEnabled` 切换文案（识别/仅作附件），loading 时禁用遮罩关闭 |

### 3.3 状态/逻辑层（composables）

| 文件 | 行数 | 状态 | 关键能力 |
|---|---|---|---|
| [useImageCapture.ts](file:///e:/rhProject/wk-mhc-mobile/src/pages/smart-training/composables/ai/image/useImageCapture.ts) | 101 | ✅ 完成 | 维护 `pending`（File + ObjectURL），`cameraInputRef` / `albumInputRef` 触发原生 `<input type="file">`，`takeConfirmedFile` 一次性取走并清理，组件卸载时 revoke 资源 |
| [useImageRecognition.ts](file:///e:/rhProject/wk-mhc-mobile/src/pages/smart-training/composables/ai/image/useImageRecognition.ts) | 48 | ✅ 完成 | 三步串联：上传 → 签名 → 调 `/vision/recognize`；`isRecognizing` 暴露 loading 态；空内容 / 异常均通过 Vant toast 提示 |
| [imageCaptureUtils.ts](file:///e:/rhProject/wk-mhc-mobile/src/pages/smart-training/composables/ai/image/imageCaptureUtils.ts) | 28 | ✅ 完成 | 10MB 限制、JPEG/PNG/WebP/GIF/HEIC/HEIF 接受；`revokeObjectUrl` 安全释放 blob URL |

### 3.4 共享依赖（被图片识别复用）

| 文件 | 行数 | 状态 | 关键能力 |
|---|---|---|---|
| [referenceFileUpload.ts](file:///e:/rhProject/wk-mhc-mobile/src/pages/smart-training/composables/ai/referenceFileUpload.ts) | 64 | ✅ 完成 | `ali-oss` 直传（< 5MB 单次，≥ 5MB 分片），凭证来自 `file-service/file-resource/credential`（匿名 source） |

### 3.5 集成点（已落地）

- [AiInputBar.vue](file:///e:/rhProject/wk-mhc-mobile/src/pages/smart-training/components/ai/AiInputBar.vue) 第 11-14 行：imports
- 第 64-76 行：解构 `useImageCapture` + `useImageRecognition`
- 第 103-144 行：`openImagePicker` / `onImagePickerSelect` / `onImageCaptureConfirm`（含附件上限 5 个判断） / `onImageCaptureCancel`
- 第 447-461 行：两个隐藏 `<input>` —— `imageCameraInputRef`（`capture="environment"`） + `imageAlbumInputRef`
- 第 463-470 行：`<AiImageCapturePreview recognition-enabled ...>`
- 第 472-478 行：`<van-action-sheet>` 弹出"拍照 / 从相册选择"

两个宿主视图均已使用该输入条：
- `AnswerAssistantView.vue` —— 答疑助手（mode='answer'）
- `TrainingAssistantView.vue` —— 陪练助手（mode='training'）

## 四、测试覆盖情况

| 范围 | 状态 | 文件 | 备注 |
|---|---|---|---|
| `imageCaptureUtils` | ✅ 已覆盖 | [imageCaptureUtils.spec.ts](file:///e:/rhProject/wk-mhc-mobile/src/pages/smart-training/composables/ai/image/imageCaptureUtils.spec.ts) | 3 用例：合法 mime、非图片拒绝、超 10MB 拒绝 |
| `useImageCapture` | ❌ 无单测 | — | 需用 happy-dom + vitest 模拟 `<input type="file">` 的 change 事件 |
| `useImageRecognition` | ❌ 无单测 | — | 需 mock `uploadReferenceFileToOss` / `signReferenceFileUrls` / `postImageRecognize` |
| `AiImageCapturePreview` | ❌ 无组件测试 | — | 可用 `@vue/test-utils` 验证 prop 切换文案 |
| `api/ai/image.ts` | ❌ 无 API mock 测试 | — | `vite-plugin-mock-dev-server` 已在 `devDependencies`，可补 mock 端到端 |

测试运行命令：`pnpm test` 或 `npm run test`（vitest）。

## 五、外部依赖与运行依赖

- ✅ `ali-oss@^6.20.0`：用于直传 OSS 凭证
- ✅ `vant@^4.9.8`：用于 Popup / ActionSheet / Toast / Loading
- ✅ `vitest@^2.1.2`：已配置测试框架
- ✅ `vite-plugin-mock-dev-server@^1.8.0`：已配置 mock 服务
- 后端接口：`POST /api/wk/vision/recognize`（百炼多模态），`file-service/file-resource/credential`（OSS 凭证）

## 六、与"语音 ASR"模块的对照

图片识别在架构上**对齐了语音识别**：

| 维度 | 语音（`useVoiceAsr`） | 图片（`useImageRecognition`） |
|---|---|---|
| 输入 | MediaRecorder blob | `<input type="file">` File |
| 中转 | 上传 OSS → 签名 | 同上（共用 `referenceFileUpload`） |
| 接口 | 阿里一句话 ASR | `/api/wk/vision/recognize`（百炼多模态） |
| 错误处理 | `voiceApiErrorMessage` | `imageApiErrorMessage`（注释中已声明对齐） |
| 结果回填 | `inputText.value = text` | `inputText.value = text`（AiInputBar 117-140 行） |
| 附件 | 否 | 是（额外 push 到 `tempFiles`，标记 `fileType: 'image'`） |

**对齐度评估：优秀。** 图片识别的额外价值是同时把图片作为附件附带发出。

## 七、待改进项（按优先级，不在本计划内执行，仅盘点）

| 优先级 | 项 | 描述 |
|---|---|---|
| P1 | 补 composable 单测 | `useImageCapture` / `useImageRecognition` 均无单测，核心业务流裸奔 |
| P2 | 补组件测试 | `AiImageCapturePreview` 的 `recognitionEnabled` 文案切换需保护 |
| P2 | iOS Safari 兼容性 | 原生 `<input capture>` 在 iOS 微信/部分浏览器下不会强制拉起相机，需降级到只打开相册 |
| P3 | 大图压缩 | 10MB 上限可接受，但手机拍的原图经常 4-5MB，建议上传前 canvas 压缩到 1920px 长边 |
| P3 | 失败重试 | 当前 `useImageRecognition` 失败后只 toast，无重试入口 |
| P3 | Loading 期间防重复触发 | `openImagePicker` 已判断 `isImageRecognizing`，但 `onImageCaptureConfirm` 内没有再次防御，需检查 |

## 八、验证步骤（如何亲自看一遍）

```bash
cd e:/rhProject/wk-mhc-mobile
pnpm install         # 或 npm install
pnpm start           # 启动 Vite dev server（默认 8086 mock）
# 浏览器打开 H5，进入"智能培训"页
# 1. 点击"+" → 拍照：调起系统相机 → 拍一张题 → 出现预览弹窗
# 2. 点击"识别并填入"：loading → 输入框自动填入识别文本 + 出现图片附件
# 3. 再次"+" → 从相册选择：可挑历史图片 → 同上流程
# 4. 控制台观察网络：file-service/file-resource/credential → OSS PUT → /api/wk/vision/recognize

# 跑单测
pnpm test
# 期望：imageCaptureUtils.spec.ts 通过；其他 spec 也通过
```

模拟后端：在 `mock/` 目录或 `vite-plugin-mock-dev-server` 中增加 `/api/wk/vision/recognize` 的 mock，可直接返回 `{ code: '00000000', data: { text: '测试题目：1+1=?' } }`。

## 九、浏览器自动化测试用例（待执行）

### 9.1 调试环境

| 项 | 值 |
|---|---|
| H5 调试地址 | `http://localhost:3000/smart-training/page/ai/ai-assistant?userId=UC0000000096` |
| 测试账号 | `zzzz`（密码由您临时提供） |
| 浏览器 | Chromium（gstack-browse headless） |
| 视口 | iPhone 14 Pro：`390 × 844`，DPR 3 |
| 网络 | 默认 |

### 9.2 前置条件

1. 启动 `wk-mhc-mobile` 开发服务器（`pnpm start`，默认 8086）
2. 启动 mock 服务，覆盖以下端点（用于在浏览器中端到端跑通）：
   - `POST /api/wk/vision/recognize` → `{ code: '00000000', data: { text: '【测试识别】1+1=?' } }`
   - `GET file-service/file-resource/credential` → 真实 OSS 凭证或本地 mock
3. 在 `vite-plugin-mock-dev-server` 插件配置中确保以上端点生效
4. 启动完成后浏览器访问调试地址

### 9.3 用例列表

#### TC-01 入口可达性

- **步骤**：
  1. 访问 `http://localhost:3000/smart-training/page/ai/ai-assistant?userId=UC0000000096`
  2. 等待页面加载完成
- **预期**：
  - 页面无白屏
  - 顶部出现 AI 助手标题/会话区
  - 底部出现 [AiInputBar](file:///e:/rhProject/wk-mhc-mobile/src/pages/smart-training/components/ai/AiInputBar.vue)，含文字输入框、"+"等快捷按钮
- **截图**：`/tmp/qa/01-entry.png`

#### TC-02 唤起图片选择 ActionSheet

- **步骤**：
  1. 在 AI 助手页面点击底部输入条左侧的"+"按钮（图片附件入口）
  2. 观察底部 ActionSheet
- **预期**：
  - 弹出 ActionSheet，包含两项："拍照"、"从相册选择"
  - 点击"取消"可关闭弹窗
- **截图**：`/tmp/qa/02-action-sheet.png`

#### TC-03 拍照 → 预览弹窗

- **步骤**：
  1. 在 TC-02 的 ActionSheet 中点击"拍照"
  2. （Mock）注入一张测试图片到 hidden `<input type="file">`
  3. 等待 DOM 变化
- **预期**：
  - 出现 [AiImageCapturePreview](file:///e:/rhProject/wk-mhc-mobile/src/pages/smart-training/components/ai/AiImageCapturePreview.vue) 底部弹窗
  - 弹窗中显示预览图
  - 显示两个按钮："重拍"（灰色）/"识别并填入"（主色 #0066ff）
  - 标题为"确认图片"
  - 副标题为"确认后将识别题目文字并填入输入框"
- **截图**：`/tmp/qa/03-preview.png`

#### TC-04 重拍流程

- **步骤**：
  1. 在 TC-03 的预览弹窗中点击"重拍"
- **预期**：
  - 弹窗关闭
  - `pending` 状态被清理（`URL.revokeObjectURL` 调用一次，控制台可见）
  - 不应留下任何残留的预览图
- **截图**：`/tmp/qa/04-retake.png`

#### TC-05 确认 → 识别 → 回填（核心 happy path）

- **步骤**：
  1. 重新触发 TC-02、TC-03
  2. 在预览弹窗点击"识别并填入"
  3. 等待网络请求完成
- **预期网络顺序**：
  1. `GET file-service/file-resource/credential` （OSS 凭证）
  2. `PUT https://<bucket>.<region>.aliyuncs.com/AI-training/tempFile/<ts>_<name>` （OSS 上传）
  3. `POST /api/wk/vision/recognize` （识别接口）
- **预期 UI**：
  - 点击瞬间 loading toast "图片上传中…"，后切换为"图片识别中…"
  - 加载完成后 toast "图片已添加为附件"
  - 输入框文本变为 "【测试识别】1+1=?"（来自 mock）
  - 附件区出现一张图片缩略图
- **截图**：`/tmp/qa/05-confirm.png`

#### TC-06 相册选择路径

- **步骤**：
  1. 点击底部"+" → 选择"从相册选择"
  2. （Mock）注入测试图片到 hidden `<input type="file">`（无 `capture` 属性）
  3. 进入预览 → 点击"识别并填入"
- **预期**：与 TC-05 行为一致
- **截图**：`/tmp/qa/06-album.png`

#### TC-07 文件类型校验

- **步骤**：
  1. 触发"从相册选择"
  2. （Mock）注入一个 `application/pdf` 类型的 File 对象
- **预期**：
  - 不应进入预览弹窗
  - 弹出 toast："请选择图片文件（JPG、PNG 等）"
- **截图**：`/tmp/qa/07-reject-pdf.png`

#### TC-08 文件大小校验

- **步骤**：
  1. 触发"从相册选择"
  2. （Mock）注入一个 11MB 的 PNG 文件
- **预期**：
  - 不应进入预览弹窗
  - 弹出 toast："图片大小不能超过 10MB"
- **截图**：`/tmp/qa/08-reject-oversize.png`

#### TC-09 识别失败兜底

- **步骤**：
  1. 在 mock 中将 `/api/wk/vision/recognize` 配置为返回 `{ code: '99999999', msg: '服务异常' }`
  2. 完整跑 TC-05
- **预期**：
  - 加载 toast 消失
  - 弹出 toast："服务异常"（来自 `imageApiErrorMessage`）
  - 输入框文本不被覆盖
  - 附件列表不变
- **截图**：`/tmp/qa/09-fail-toast.png`

#### TC-10 识别空内容兜底

- **步骤**：
  1. mock `/api/wk/vision/recognize` 返回 `{ code: '00000000', data: { text: '' } }`
  2. 跑 TC-05
- **预期**：
  - toast："未识别到有效内容"
  - 输入框文本不变化
  - 附件不增加
- **截图**：`/tmp/qa/10-empty.png`

#### TC-11 重复点击防御

- **步骤**：
  1. 在 TC-05 加载过程中（loading toast 出现时），再次点击"+" 唤起 ActionSheet
- **预期**：
  - ActionSheet 不应弹出（`openImagePicker` 内 `isImageRecognizing` 判断生效）
  - 或即便弹出，点击"拍照/相册"不会触发新的选择
- **截图**：`/tmp/qa/11-no-reentry.png`

#### TC-12 组件卸载资源释放

- **步骤**：
  1. 进入 TC-03（已打开预览弹窗）
  2. 在浏览器中通过路由跳转到其他页面（如"陪练助手"）
  3. 观察 console
- **预期**：
  - 看到 `URL.revokeObjectURL` 调用一次（onBeforeUnmount 钩子触发）
  - 不应有 console error 或内存泄漏警告
- **截图**：`/tmp/qa/12-unmount.png`

### 9.4 截图与日志保存规范

- 所有截图统一存放在 `e:/rhProject/logs/qa/image-scan/`
- 浏览器 console 日志一并记录到 `e:/rhProject/logs/qa/image-scan/console-*.log`
- 失败用例自动归类到 `e:/rhProject/logs/qa/image-scan/FAILED.md`，含失败步骤与截图路径

### 9.5 验收标准

- TC-01 ~ TC-12 全部通过 ✅
- 无控制台 error（warn 可接受）
- 截图清晰、文字可读
- 关键接口（`/api/wk/vision/recognize`）在 mock 环境下能完整跑通

### 9.6 ⚠️ 关键阻塞：需要退出 plan 模式才能执行

由于 plan 模式禁止运行任何会改变系统状态（包括 dispatch 浏览器子代理点击/截图）的工具，**请在 IDE 侧退出 plan 模式**，退出后我将通过 gstack-browse 启动 Chromium，依次执行 TC-01 ~ TC-12。

---

## 十、结论

✅ **拍照识题功能已完成并已集成**，核心链路 8 个文件（含 1 个共享文件）全部就位，UI 在答疑 / 陪练两个 AI 助手中均可用。

⚠️ **主要短板是测试覆盖**——只有最底层的 util 有 3 个用例，3 个核心 composable/component 全无单测。如果需要打 PR 或上线保险，建议优先补 `useImageRecognition` 的 happy-path + 异常分支单测。

❌ **未发现 TODO / FIXME / HACK 标记**，代码无未完成功能标记；`node_modules` 之外也未发现废弃或半成品文件。

如需进入"补测试"或"iOS 兼容"等具体改造，请告知我创建对应的工作计划。
