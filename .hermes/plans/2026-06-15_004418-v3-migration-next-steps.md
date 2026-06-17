# v3 学员端迁移下一步实现计划

> **For Hermes:** 本计划基于会话 `20260613_004812_2c9977` 第 14 轮 (2026-06-14 → 2026-06-15) 上下文编写。

**Goal:** 明确 wk-train-center-ui-v3 学员端迁移**剩余缺口**的优先级 + 起手路径,让下次会话有完整上下文推进。

**当前会话成果(已落地,无需再做):**

| 维度 | 数量 | 备注 |
|---|---|---|
| web/ai 学员端闭环 | 23 文件 + 1 store | 已闭环(本会话系列多次补完) |
| 公共组件 bug 修复 | 3 | DataTable / DataGrid / DicTree 等 |
| 公共组件补完 | 2 | DepartTreeShow + DepartTreeSelect |
| 漏洞修复 | 6 文件 | 登录密码强度(3) + 2 处裸 v-html sanitize + TS2308 alias |
| TS 化统一 | 8 文件 | `<script setup>` → `<script setup lang="ts">` |
| ucenter 挂后门补完 | 1 | capability.vue 能力画像 |
| 密码最小位数限制 | 已改 8→4 位 | validate.ts (用户要求) |

**验证状态:** `vue-tsc --noEmit` ✅ 0 errors,`npm run verify:chinese` ✅ OK,vite dev 实测编译 ✅ HTTP 200。

**Tech Stack:** Vue 3 + TypeScript + Element Plus + Pinia + Vite + Vue Router 4

**Architecture:** v3 学员端采用模块化布局 (`views/web/<module>/` + `components/` + `stores/modules/` + `api/client/`)

---

## 当前 v3 学员端剩余缺口(优先级排序)

### 🟡 挂后门清单(需决策点)

| # | 模块 | 文件 | 触发场景 | 决策点 |
|---|---|---|---|---|
| 1 | ucenter/bind | `views/web/ucenter/bind.vue` + `views/web/ucenter/components/BindMobile.vue` | 依赖 `@business.SmsInput`,v3 没 SmsInput 组件 | SmsInput 自写 / 降级 / 挂后门 |
| 2 | ucenter/init | `views/web/ucenter/init.vue` | `initAccount` v3 API 业务含义变了(单人改账号 → 批量初始化学员账号 + 过期时间),不能简单照搬 v2 | 业务方确认 v3 initAccount 真实用途 |
| 3 | web/ai 流式核心 | `views/web/ai/components/AiAssistant/shared/` 下缺 `chatAppStream` 工具 | SSE / WebSocket 选型,store `fetchSseOrFallback` 兜底返回占位 | SSE vs WebSocket 单独决策 |
| 4 | web/ai markdown 高亮 | `markdownRenderer.ts` 用了 `marked`,但没 `highlight.js` | AI 回复代码块不高亮 | 装库 vs 简化 |
| 5 | ComponentsBusiness/ai | `views/web/ai/components/` 下缺 2 个业务组件(AiAnalysisButton / SparringSelectDialog) | 缺 | 评估使用频率 |
| 6 | web/ai AiButtonGroup | `components/AiButtonGroup/index.vue` 已存在但内部实现可能简化 | 待核实 vs v2 | 待摸 |

### 🔵 学员端非 AI 模块剩余页面(已迁但未深度验证)

| # | 模块 | 已迁文件 | 待验证项 |
|---|---|---|---|
| 1 | course | CourseDetail.vue + UserCourseFileList.vue | 课件文件管理 / AI PPT 集成(`WebAiPptGeneratorButton` 高风险挂后门) |
| 2 | exam | WebExamBook + WebExamCheck + WebExamStart + WebPaperList | 考试流程完整性,特别是截图上传 |
| 3 | repo | WebRepoDetail + WebRepoList | 题库训练流程 |
| 4 | plan | WebPlanDetail | v-html 漏洞已修,但跟 plan/plan-detail 联动逻辑待验证 |
| 5 | ucenter | info / im / bind+BindMobile / init / real / pass / points | 5/8 完成,bind+init 挂后门 |
| 6 | notice | WebNoticeDetail + WebNoticeList | 已迁,但通知中心集成待验 |

### 🟢 管理端缺口(整个 admin/ 仅 dashboard 迁了,12 个模块 ~80 页面待迁)

**这是另一类大决策**,playbook §1 "用户偏好学员端优先 + 不擅自大决策" → **本计划不展开**,只标记待决策。

---

## 下一步起手建议(按 playbook §1 用户偏好 + 按你逻辑原则)

按"用户偏好学员端优先 + 不擅自装新库 + 不擅自大决策 + 模块级粒度",优先级排序:

### ★★★ P0: ucenter/init.vue(用户已关注)

**为什么优先:**
- 学员端剩余挂后门 5 个里**最可能被业务方启动**的(用户改账号是高频操作)
- 仅 1 个文件,代码层面改完就绪
- 缺的只是业务方确认 v3 initAccount 真实用途

**前提:** 业务方确认 v3 `initAccount({ usernames: string[], expiresTime: string })` 是:
- 方案 A:管理员批量初始化学员账号 → v3 init.vue 应改为管理员视角批量初始化页
- 方案 B:v2 老业务已废,v3 init.vue 应改为"我的账号过期信息"展示页(只读)
- 方案 C:其他

**代码层面已就绪:**
- v3 API 签名: `initAccount(data: { usernames: string[]; expiresTime: string }): Promise<ApiResponse<void>>`
- 路由位置: `/pages/uc/init` (UserLayout 下)
- 字段契约需后端确认

### ★★★ P1: web/ai 流式核心 chatAppStream

**为什么优先:**
- AI 业务闭环的最后 1 个大件
- 当前 store `fetchSseOrFallback` 兜底返回占位"AI 回复内容(简化版占位,等 v3 SSE 接入)"
- 没有 SSE 流式,AI 回复体验是"一次性返回"而非"打字机效果"

**前提:** 业务方确认:
- 用 SSE 还是 WebSocket?
- 后端是否已有对应 API?

### ★★ P2: ucenter/bind+BindMobile(2 文件)

**为什么 P2:**
- 学员账号绑定是高频功能
- 但依赖 SmsInput,需先决策 SmsInput 怎么补

**SmsInput 决策:**
- 方案 A:自写 v3 版 SmsInput(短信验证码组件,~150 行)
- 方案 B:降级到 el-input + 验证码按钮(简化版)
- 方案 C:挂后门(等 v3 业务方提供)

### ★ P3: web/ai 缺失库(highlight.js)

**为什么 P3:**
- 影响 AI 代码块渲染体验(不高亮)
- 但不影响 AI 业务核心

**前提:** 业务方确认是否需要代码高亮。

---

## 下次会话推荐起手顺序

按用户"学员端优先 + 模块级粒度"原则,推荐 3 个候选起手包(让用户拍 1 个):

### 起手包 1: ucenter/init.vue(单文件,小步)

**预决策假设:** 业务方确认方案 A(管理员批量初始化学员账号)

| 任务 | 文件 | 说明 |
|---|---|---|
| 1.1 | 摸 v2 init.vue 完整逻辑 | v2 init.vue 105 行已读过 |
| 1.2 | 摸 v3 initAccount API 调用链 | 已确认 v3 user.ts:158 |
| 1.3 | 设计 v3 init.vue 实现方案 | 管理员批量视角:usernames 多账号输入框 + expiresTime 日期选择 |
| 1.4 | 写 v3 init.vue | TS + Element Plus + 调用 initAccount |
| 1.5 | 跑双绿(typecheck + verify:chinese) | |
| 1.6 | vite 实测编译 | |

**风险:** initAccount 业务含义未拍前不能动键盘。

### 起手包 2: web/ai 流式核心(单大件,中步)

**预决策假设:** 业务方选 SSE(主流,简单)

| 任务 | 文件 | 说明 |
|---|---|---|
| 2.1 | 摸 v2 `chatAppStream` 完整实现 | v2 common.js 410-644 行 |
| 2.2 | 设计 v3 流式工具 | 抽到 `shared/sseStream.ts` |
| 2.3 | 改 store `sendAnswer` / `sendTraining` 接流式 | 替代 `fetchSseOrFallback` |
| 2.4 | 改 AiMessageList 渲染流式内容 | 支持打字机效果 |
| 2.5 | 跑双绿 + vite 实测 | |

**风险:** SSE 决策点,不擅自拍。

### 起手包 3: ucenter/bind+BindMobile(2 文件,中步)

**预决策假设:** 业务方选方案 A(自写 v3 SmsInput)

| 任务 | 文件 | 说明 |
|---|---|---|
| 3.1 | 摸 v2 SmsInput 完整实现 | 找 v2 ComponentsBusiness SmsInput 源 |
| 3.2 | 设计 v3 SmsInput TS 版 | ~150 行,短信验证码 + 倒计时 + 图片验证码 |
| 3.3 | 写 v3 SmsInput.vue | 放 `views/web/ucenter/components/SmsInput.vue` 或 `components/ComponentsBase/ComponentsForm/SmsInput/index.vue` |
| 3.4 | 补 v3 BindMobile.vue(完整版) | 改 1 行空壳 → 弹窗 + SmsInput |
| 3.5 | 补 v3 bind.vue(完整版) | 改 1 行空壳 → 列表 + 解绑/绑定按钮 + BindMobile 弹窗 |
| 3.6 | 跑双绿 + vite 实测 | |

**风险:** SmsInput 决策点 + 工作量稍大。

---

## 起手包决策表

| 用户回 | 起手哪个 |
|---|---|
| A | 起手包 1: ucenter/init.vue(需先确认 initAccount 业务含义) |
| B | 起手包 2: web/ai 流式核心(需先选 SSE/WS) |
| C | 起手包 3: ucenter/bind+BindMobile(需先选 SmsInput 决策) |
| D | 休息 |
| E | 你直接告诉我起手哪个 |

---

## 当前会话变更文件(本轮未动键盘,仅整理)

修改文件清单(12 个 + 5 未跟踪):

**已修改(M):**
- src/api/client/index.ts
- src/layout/login/Login.vue
- src/layout/login/LoginForgot.vue
- src/layout/login/LoginRegister.vue
- src/views/web/exam/WebExamBook.vue
- src/views/web/exam/WebExamList/MyExamPage.vue
- src/views/web/exam/WebExamList/index.vue
- src/views/web/exam/WebPaperList.vue
- src/views/web/exam/components/ExamStateFlag.vue
- src/views/web/exam/components/QuItemShow.vue
- src/views/web/plan/WebPlanDetail.vue
- src/views/web/ucenter/capability.vue
- src/utils/validate.ts
- src/utils/validate/validate.ts

**未跟踪(??):**
- src/components/ComponentsBusiness/user/DepartTreeSelect/index.vue
- src/components/ComponentsBusiness/user/DepartTreeShow/index.vue
- src/views/web/ai/AiAssistant.vue
- src/views/web/ai/components/AiAssistant/components/InputToolbar.vue
- src/views/web/ai/components/AiAssistant/components/ThoughtsSection.vue

**所有变更均通过 typecheck + verify:chinese + vite 实测编译验证。**

---

## 风险/开放问题汇总

| 问题 | 阻塞 |
|---|---|
| 1. v3 `initAccount` 业务含义待业务方确认 | 起手包 1 阻塞 |
| 2. v3 流式响应 SSE/WS 选型待拍 | 起手包 2 阻塞 |
| 3. v3 是否自写 SmsInput 组件待决策 | 起手包 3 阻塞 |
| 4. v3 fetchStatPaging userId 字段是否生效(本会话 capability.vue 已记录) | capability 潜在问题,业务方确认 |
| 5. v3 checkPassLevel 已改 4 位,后端是否独立校验兜底 | 安全相关,建议确认 |
| 6. 管理端 12 模块缺口 | 整个管理端是另一类大决策 |

---

## 不在本计划范围

按"按你逻辑"原则 + 风险不可逆,以下内容**不擅自启动**:

- ❌ 管理端 12 模块迁移(用户偏好学员端优先 + 大决策)
- ❌ 装新库决策(highlight.js 单独拍)
- ❌ 装新框架决策(Vite 配置改动)
- ❌ 重构现有代码(只补缺,不重构)

---

## 下次会话动作

1. 用户回 A/B/C/D/E 选起手包
2. 起手前先 IDE `clarify` 关键决策点(对应阻塞项)
3. 用户确认后,按本计划推荐的任务顺序推进
4. 模块边界才汇报(playbook §1 第 12 条:模块级汇报节奏)
5. 每次提交后跑双绿(typecheck + verify:chinese) + vite 实测编译
