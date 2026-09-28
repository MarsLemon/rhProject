# 培训系统 iframe 集成通信协议文档

## 概述

本文档描述了**培训系统子应用**（`wk-train-center-ui`）与**中台父应用**（`wk-mhc-ui`）之间的 iframe 嵌入通信机制。

---

## 文件关系

| 文件                                                                                                           | 角色                         | 说明                                                          |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------- |
| `wk-train-center-ui/src/main.js`                                                                             | **子应用（被嵌入方）** | Vue 应用启动文件，负责接收父应用参数、发送状态通知            |
| `wk-mhc-ui/apps/wk-mhc-ui/src/app/train-center/external-training-embed/external-training-embed.component.ts` | **父应用（嵌入方）**   | Angular 组件，负责加载 iframe、发送初始化参数、监听子应用状态 |

---

## 通信架构

```
┌─────────────────────────────────────────────────────────────┐
│                    父应用（Angular - 中台）                    │
│  external-training-embed.component.ts                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. 加载 iframe（带 initialRedirect 参数）              │ │
│  │  2. 发送 INIT_PARAMS { userId, initialRedirect }       │ │
│  │  3. 监听子应用消息（CHILD_READY, 心跳等）              │ │
│  │  4. 定时发送心跳 HEARTBEAT_PING                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕ postMessage
┌─────────────────────────────────────────────────────────────┐
│                   子应用（Vue - 培训系统）                     │
│  main.js                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. 发送 CHILD_SCRIPT_READY 握手信号                   │ │
│  │  2. 接收 INIT_PARAMS 并获取 token                      │ │
│  │  3. 渲染 Vue 应用，发送 CHILD_READY                    │ │
│  │  4. 定时发送心跳 HEARTBEAT_CHILD_TO_PARENT            │ │
│  │  5. 请求会话续期 REFRESH_SESSION                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 完整消息协议

### 1️⃣ 初始化阶段

#### 父应用 → 子应用

**`INIT_PARAMS`** - 初始化参数

```javascript
{
  type: 'INIT_PARAMS',
  userId: string,              // 用户 ID
  nonce: string,               // 安全随机校验码（新增）
  initialRedirect: string      // 初始路由路径（可选）
}
```

> **注意**：子应用通过 `const { type, userId, initialRedirect, nonce } = event.data` 直接解构。

#### 子应用 → 父应用

**`CHILD_SCRIPT_READY`** - 脚本加载完成

```javascript
{
  type: 'CHILD_SCRIPT_READY',
  timestamp: number,
  message: '培训系统脚本已加载，等待参数'
}
```

**`CHILD_INIT_START`** - 开始初始化

```javascript
{
  type: 'CHILD_INIT_START',
  nonce: string,              // 必须回传父应用下发的 nonce
  timestamp: number
}
```

**`CHILD_INIT_FAILED`** - 初始化失败

```javascript
{
  type: 'CHILD_INIT_FAILED',
  error: string,
  nonce: string,
  timestamp: number
}
```

**`CHILD_RENDERING`** - 开始渲染

```javascript
{
  type: 'CHILD_RENDERING',
  nonce: string,
  timestamp: number
}
```

**`CHILD_READY`** - 渲染完成，应用就绪

```javascript
{
  type: 'CHILD_READY',
  nonce: string,
  timestamp: number
}
```

---

### 2️⃣ 心跳机制

#### 父应用 → 子应用

**`HEARTBEAT_PING`** - 父应用心跳请求

```javascript
{
  type: 'HEARTBEAT_PING',
    timestamp
:
  number,
    message
:
  '父应用心跳请求'
}
```

#### 子应用 → 父应用

**`HEARTBEAT_CHILD_TO_PARENT`** - 子应用心跳包（主动发送，30秒一次）

```javascript
{
  type: 'HEARTBEAT_CHILD_TO_PARENT',
    timestamp
:
  number,
    message
:
  '子应用心跳包',
    sessionStatus
:
  {
    lastActivity: number,    // 最后活动时间戳
      isActive
  :
    boolean        // 应用是否活跃
  }
}
```

**`HEARTBEAT_PONG`** - 心跳响应

```javascript
{
  type: 'HEARTBEAT_PONG',
    timestamp
:
  number,
    message
:
  '子应用在线',
    sessionActive
:
  boolean
}
```

---

### 3️⃣ 会话管理

#### 子应用 → 父应用

**`REFRESH_SESSION`** - 请求会话续期（10分钟一次）

```javascript
{
  type: 'REFRESH_SESSION',
    timestamp
:
  number
}
```

#### 父应用 → 子应用

**`SESSION_REFRESHED`** - 会话已刷新

```javascript
{
  type: 'SESSION_REFRESHED',
    timestamp
:
  number
}
```

**`SESSION_EXPIRED`** - 会话已过期

```javascript
{
  type: 'SESSION_EXPIRED'
}
```

---

### 4️⃣ 其他消息

#### 子应用 → 父应用

**`CHANGE_TITLE`** - 修改页面标题

```javascript
{
  type: 'CHANGE_TITLE',
  title: string
}
```

**`CHILD_ROUTE_CHANGED`** - 子应用路由变化（用于同步父应用 URL）

```javascript
{
  type: 'CHILD_ROUTE_CHANGED',
  path: string,      // 子应用相对路径 (包含 search, 如 /pages/course/index?id=1)
  nonce: string,     // 安全校验码
  timestamp: number
}
```

---

## 路由同步与刷新保持机制

### 1. 同步过程 (子 -> 父)
1. 子应用监听 `router.afterEach`。
2. 路由变化时，发送 `CHILD_ROUTE_CHANGED` 消息。
3. 父应用收到消息后，调用 `router.navigate` 更新地址栏的 `redirect` 查询参数。
4. 父应用使用 `replaceUrl: true` 更新，确保不会增加多余的历史记录。

### 2. 恢复过程 (刷新/重新加载)
1. 用户刷新浏览器，父应用从 URL 的 `redirect` 参数中读取子应用路径。
2. 父应用初始化 iframe，并将该路径作为 `initialRedirect` 参数传递。
3. 子应用启动后，读取 `initialRedirect` 并自动执行 `this.$router.push()`。
4. 子应用成功定位到刷新前的页面。

---

## 时序图

### 正常初始化流程

```
父应用                               子应用
  │                                   │
  │──── 加载 iframe ──────────────────▶│
  │                                   │ 脚本加载完成
  │◀──── CHILD_SCRIPT_READY ──────────│
  │                                   │
  │──── INIT_PARAMS ──────────────────▶│
  │     { userId, nonce, ... }        │ 
  │                                   │ 获取 token
  │◀──── CHILD_INIT_START ────────────│
  │                                   │
  │                                   │ 渲染 Vue 应用
  │◀──── CHILD_RENDERING ─────────────│
  │                                   │
  │◀──── CHILD_READY ─────────────────│ mounted 完成
```

---

## 配置参数

### 子应用（main.js）

```javascript
const HEARTBEAT_INTERVAL = 30000      // 心跳间隔：30秒
const HEARTBEAT_TIMEOUT = 120000      // 心跳超时：2分钟
const SESSION_REFRESH_INTERVAL = 600000  // 会话续期：10分钟
const STANDALONE_INIT_TIMEOUT = 1000  // 独立访问超时：1秒
```

### 父应用（component.ts）

```javascript
private
readonly
MAX_RETRIES = 5              // 参数发送最大重试次数
private
readonly
RETRY_INTERVAL_MS = 300     // 重试间隔：300ms
private
readonly
HEARTBEAT_INTERVAL_MS = 30000 // 心跳间隔：30秒
```

---

## 关键实现细节

### 1. 双向握手机制

**问题**：子应用脚本加载时机不确定，父应用可能过早发送 `INIT_PARAMS`。

**解决方案**：

- 子应用加载完成后主动发送 `CHILD_SCRIPT_READY`
- 父应用 iframe `onLoad` 后立即发送 `INIT_PARAMS`，并重试 5 次（间隔 300ms）
- 子应用收到参数后返回 `CHILD_READY` 确认

### 2. 路由跳转传递

**父应用**：

```typescript
// URL: http://parent.com/train?redirect=http://child.com/course/123
const redirectUrl = params['redirect'];  // 从查询参数获取
// iframe src: http://child.com?initialRedirect=/course/123
```

**子应用**：

```javascript
// 从 INIT_PARAMS 接收 initialRedirect
if (extraData?.initialRedirect) {
  this.$router.push(extraData.initialRedirect);
}
```

### 3. 会话同步策略

- **子应用每 10 分钟**主动请求 `REFRESH_SESSION`
- 父应用响应 `SESSION_REFRESHED` 或 `SESSION_EXPIRED`
- 子应用收到 `SESSION_EXPIRED` 后清空本地存储并跳转登录页

### 4. 心跳监测

**目的**：检测父子应用连接状态，及时发现网络问题。

**实现**：

- 子应用每 10 秒发送心跳包
- 父应用每 10 秒发送心跳请求
- 子应用 2 分钟未收到父应用消息时警告网络异常

---

## 安全规范

### 安全规范

#### 1. 严格 Origin 域名校验

为防止 XSS 攻击，两端必须开启域名白名单校验。**禁止使用 `includes` 进行模糊匹配**，必须使用全等匹配或 `URL.origin` 匹配。

**子应用 (main.js)**:

```javascript
const isAllowedOrigin = ALLOWED_PARENT_ORIGINS.some((origin) => {
  return new URL(origin).origin === new URL(event.origin).origin;
});
```

#### 2. 目标来源保护 (Target Origin)

子应用在发送消息时，禁止使用 `*` 作为目标来源（握手信号除外）。必须在接收到合法的 `INIT_PARAMS` 后记录 `parentOrigin`，并作为后续通信的 Target。

#### 3. Handshake Nonce 机制

父应用在初始化时生成一个不可预测的随机字符串 `nonce`，子应用在所有回复消息中必须带回该 `nonce`。父应用校验不匹配的消息将被丢弃，防止跨站请求伪造或重放攻击。

#### 4. 认证凭证三重保障

为解决跨域 iframe 可能拦截 Cookie 的问题，系统采用了三重存储备份机制：

1. **Cookie**（标准存储）
2. **LocalStorage**（持久化存储）
3. **SessionStorage**（会话级存储，iframe 中最稳定）

子应用在启动时会同步将 Token 注入 Vuex Store，确保路由守卫在第一时间能够获取有效的登录状态。

#### 5. 异常自动恢复

当父应用检测到子应用加载超时、初始化失败或心跳严重丢失时，会执行 `handleError` 逻辑，在 1.5 秒后**自动刷新当前页面**尝试重新进入。

#### 6. 状态清理

在发生 `SESSION_EXPIRED` 或 `CHILD_TIMEOUT` 等严重错误时，必须执行：

1. `clearInterval` 清除所有定时器。
2. `removeEventListener` 移除消息监听器。
3. 清空敏感存储（`localStorage`/`sessionStorage`）。

---

## 故障排查

### 问题：子应用一直显示 "加载中"

**可能原因**：

1. 父应用未发送 `INIT_PARAMS`
2. 子应用未收到消息（跨域或 origin 校验失败）
3. `userId` 为空，导致初始化中断

**排查方法**：

```javascript
// 父应用控制台查看
console.log('[中台] 已发送 INIT_PARAMS:', {userId, initialRedirect});

// 子应用控制台查看
console.log('[培训] 收到 INIT_PARAMS:', event.data);
```

### 问题：心跳超时警告

**可能原因**：

1. 父应用页面被最小化或隐藏
2. 网络连接不稳定
3. 浏览器限制后台 `setInterval` 执行频率

**解决方案**：

- 增大 `HEARTBEAT_TIMEOUT` 阈值（如改为 5 分钟）
- 使用 `visibilitychange` 事件暂停/恢复心跳

---

## 版本兼容性

| 浏览器  | 最低版本 | 说明                                  |
| ------- | -------- | ------------------------------------- |
| Chrome  | 60+      | 完全支持                              |
| Firefox | 55+      | 完全支持                              |
| Safari  | 11+      | 完全支持                              |
| Edge    | 79+      | Chromium 内核，完全支持               |
| IE      | ❌       | 不支持（需 polyfill `postMessage`） |

---

## 未来优化方向

1. **消息加密**：敏感数据（如 token）通过加密传输
2. **断线重连**：心跳超时后自动尝试重新初始化
3. **性能监控**：记录消息传递耗时，优化通信效率
4. **类型定义**：使用 TypeScript 定义消息接口

---

## 联系方式

如有疑问，请联系：

- **培训系统维护团队**
- **中台架构团队**

---

**最后更新**：2026-01-29
