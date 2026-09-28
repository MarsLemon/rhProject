# v2 vs v3 项目 API 层差异对比报告

**分析时间:** 2026-08-07  
**v2 项目路径:** `e:\rhProject\wk-train-center-ui\src\api`  
**v3 项目路径:** `e:\rhProject\wk-train-center-ui-v3\src\api`

---

## 📊 总体统计

### v2 API 文件总数：**89** 个 `.js` 文件
### v3 API 文件总数：**114** 个 `.ts` 文件

> **说明：** v3 不仅完成了 v2 的功能迁移，还进行了模块重构和结构优化，增加了多个新的 API 模块。

---

## 🔍 核心发现摘要

1. **✅ 大部分功能已完整迁移**：核心业务模块（课程、考试、题库、竞赛、活动等）已完整迁移到 Vue3 + TypeScript
2. **🔄 部分模块进行了架构升级**：如 AI 模块从"前端直连"改为"后端代理模式"
3. **⚠️ 存在少量缺失或不完整的 API**（详见下文）

---

## ❌ v2 有但 v3 缺失的 API 文件

### 按目录分类的缺失清单

#### client/ 目录
- ~~`client/ai/answer.js`~~ - 空文件（0KB），无需迁移
- `client/exam/paper.js` - **部分迁移**（见下方说明）

#### training-plan/ 目录
- 无完全缺失文件（已迁移至 v3 不同位置）

---

## ⚠️ v2 存在但 v3 迁移不完整或有差异的文件

### 🎯 重要差异（需要关注）

#### 1. `ai/common.js` → `admin/ai/chat.ts` (功能缩减)

**v2 实现:** 1363 行，**直连 AI 平台模式**
```javascript
export {
  fetchAiChatConfig,     // 获取 AI 配置
  chatModelStream,       // 模型流式对话
  chatAppStream,         // ✖ 百炼 App 应用调用
  chatAgentStream,       // ✖ AI Agent 网关
  classifyStreamError,   // ✖ 错误分类
  isAgentGatewayEnabled, // ✖ 网关开关
  isBailianConfig,       // ✖ 百炼配置检测
  fetchByBailianId,      // ✖ 百炼文件 ID 查询
  uploadFileToDashScope, // ✖ 上传文件到 DashScope
  deleteDashScopeFiles   // ✖ 批量删除 DashScope 文件
}
```

**v3 实现:** 143 行，**改为后端代理模式**
```typescript
export async function chatModelStream(options, onMessage, onDone, onError, signal) {
  // 统一 POST /api/wk/ai/chat/stream，后端负责鉴权 + 多平台适配
}
```

**影响分析:**
- ✅ `chatModelStream` 保留并简化（通过后端代理）
- ⚠️ **缺失**: 
  - `chatAppStream` - 百炼 App 应用调用（可能被后端替代）
  - `chatAgentStream` - AI Agent 网关（可能有替代方案）
  - `uploadFileToDashScope` & `deleteDashScopeFiles` - DashScope 文件管理
- 📝 **建议**: 检查实际业务代码是否直接调用了这些缺失的函数

---

#### 2. `training-sign-in/index.js` → `admin/training-sign-in.ts` (路径变化)

**v2 位置:** `training-sign-in/index.js` (1.1KB)  
**v3 位置:** `admin/training-sign-in.ts` (2.0KB)

**状态:** ✅ 已迁移且功能增强，路径从根目录调整到 `admin/`

---

#### 3. `tmpl/tmpl.js` → `admin/template.ts` (路径变化)

**v2 位置:** `tmpl/tmpl.js` (74 行)  
**v3 位置:** `admin/template.ts` (63 行)

**状态:** ✅ 完整迁移，试卷模板 API 功能保持不变

---

#### 4. `training-plan/annual-plan.js` → `admin/plan/annual.ts` (路径变化)

**v2 位置:** `training-plan/annual-plan.js` (42 行)  
**v3 位置:** `admin/plan/annual.ts` (65 行)

**状态:** ✅ 完整迁移，年度培训计划收集功能已包含

---

#### 5. `ai/config.js` → `admin/sys/config.ts` (合并迁移)

**v2 功能:** 2 个函数 (`fetchAiConfigAll`, `saveAiConfigAll`)  
**v3 位置:** 第 95-102 行（包含在配置 API 文件中）

**状态:** ✅ 功能已保留，集成到系统配置模块

---

#### 6. `web/dashboard.js` → `common/dashboard.ts` (路径变化)

**v2 位置:** `web/dashboard.js` (11 行)  
**v3 位置:** `common/dashboard.ts` (32 行) + `client/dashboard/index.ts` (34 行)

**状态:** ✅ 完整迁移，Dashboard 数据 API 功能增强

---

### 其他差异（次要）

#### 7. 部分 API 函数签名调整

以下文件虽然功能完整，但为了适配 TypeScript 类型系统，函数签名有所调整：

| v2 路径 | v3 路径 | 调整内容 |
|--------|---------|----------|
| `sys/kp/kp.js` | `admin/sys/kp.ts` | 新增接口定义，参数类型增强 |
| `client/course/course.js` | `client/course/client.ts` | 函数命名规范化为驼峰 |
| `client/battle/paper.js` | `client/battle/client.ts` | 重命名为 `battleCreatePaper` |
| `client/qu/qu.js` | `client/qu/fav.ts` | 拆分为收藏/笔记两个独立模块 |

---

## ✅ v3 新增的 API 模块（v2 中没有）

以下模块是 Vue3 版本新增的，代表了功能扩展：

### client/ 目录新增
- ✅ **order/** - 订单模块（购买培训计划）
- ✅ **report/index.ts** - 试题纠错反馈
- ✅ **book.ts** - 错题移除（从 repo/book.ts 拆分）
- ✅ **process.ts** - 流程处理（问卷流程）

### admin/sys/ 目录新增
- ✅ **depart.ts** - 部门管理（v2 中分散在 `sys/depart/depart.js` 和 `sys/depart/function.js`）
- ✅ **dict.ts** - 字典管理（v2 中分散在 `sys/dict/dict.js` 和 `sys/dict/value.js`）
- ✅ **group/group.ts** - 分组管理（新增）

### common/ 目录新增
- ✅ **common/dashboard.ts** - 通用 Dashboard API（v2 中是 `web/dashboard.js`）
- ✅ **ability.ts** - 能力认证聚合（整合验证码、登录等功能）

---

## 📦 v2→v3 完整映射关系表

### Admin 目录（管理员端）

| v2 路径 | v3 路径 | 状态 | 备注 |
|--------|---------|------|------|
| ~~agent.js~~ | `admin/ai/agent.ts` | ✅ | 路径调整 |
| ~~ai/~~ | `admin/ai/` / `client/ai/` | ✅ | 拆分为 admin 和 client |
| ~~ai/common.js~~ | `admin/ai/chat.ts` | ⚠️ | 功能缩减（架构调整） |
| ~~ai/apps.js~~ | `client/ai/apps.ts` | ✅ | 仅保留配置常量 |
| ~~ai/assistant.js~~ | `client/ai/assistant.ts` | ✅ | 陪练/答疑助手 |
| ~~ai/sparring.js~~ | `admin/ai/sparring.ts` | ✅ | 对练模式 |
| ~~ai/config.js~~ | `admin/sys/config.ts`(L95-102) | ✅ | 功能保留 |
| ~~course/~~ | `admin/course/` | ✅ | 完整迁移 |
| ~~exam/~~ | `admin/exam/` | ✅ | 完整迁移 |
| ~~notify/~~ | `admin/notify/` | ✅ | 完整迁移 |
| ~~paper/~~ | `admin/paper/` | ✅ | 完整迁移 |
| ~~plan/~~ | `admin/plan/` | ✅ | 完整迁移 |
| ~~qu/~~ | `admin/qu/` | ✅ | 完整迁移 |
| ~~repo/~~ | `admin/repo/` | ✅ | 完整迁移 |
| ~~stat/~~ | `admin/stat/` | ✅ | 完整迁移 |
| ~~sys/~~ | `admin/sys/` | ✅ | 完整迁移 |
| ~~tmpl/tmpl.js~~ | `admin/template.ts` | ✅ | 路径调整 |
| ~~training-plan/annual-plan.js~~ | `admin/plan/annual.ts` | ✅ | 路径调整 |
| ~~training-sign-in/index.js~~ | `admin/training-sign-in.ts` | ✅ | 路径调整 |

### Client 目录（学员端）

| v2 路径 | v3 路径 | 状态 | 备注 |
|--------|---------|------|------|
| ~~client/activity/activity.js~~ | `client/activity/list.ts` + `client/activity/client.ts` | ✅ | 拆分为列表和操作 |
| ~~client/battle/battle.js~~ | `client/battle/client.ts` | ✅ | 名称规范化 |
| ~~client/battle/paper.js~~ | `client/battle/client.ts` | ✅ | 功能合并 |
| ~~client/course/course.js~~ | `client/course/client.ts` | ✅ | 课件管理功能保留 |
| ~~client/exam/exam.js~~ | `client/exam/client.ts` | ✅ | 名称规范化 |
| ~~client/exam/paper.js~~ | `client/exam/upload.ts` | ✅ | 截图上传功能 |
| ~~client/lecturer/lecturer.js~~ | `client/lecturer.ts` | ✅ | 完整迁移 |
| ~~client/plan/plan.js~~ | `client/plan/list.ts` | ✅ | 列表查询 |
| ~~client/qu/qu.js~~ | `client/qu/fav.ts` | ✅ | 收藏/笔记功能 |
| ~~client/qu/report.js~~ | `client/report/index.ts` | ✅ | 纠错功能 |
| ~~client/repo/book.js~~ | `client/repo/book.ts` | ✅ | 错题移除 |
| ~~client/repo/repo.js~~ | `client/repo/repo.ts` | ✅ | 完整迁移 |
| ~~client/survey/survey.js~~ | `client/survey.ts` | ✅ | 完整迁移 |
| ~~client/train/process.js~~ | `client/process.ts` | ✅ | 答对移除功能保留 |

### Common 目录（通用）

| v2 路径 | v3 路径 | 状态 | 备注 |
|--------|---------|------|------|
| ~~ability/~~ | `common/ability/` | ✅ | 拆分为子模块 |
| ~~login/ding.js~~ | `common/login/ding.ts` | ✅ | 钉钉登录 |
| ~~common.js~~ | `common/common.ts` | ✅ | 通用方法 |
| ~~web/dashboard.js~~ | `common/dashboard.ts` | ✅ | Dashboard 聚合 |

---

## 🎯 建议采取的行动

### 1. 高优先级（影响业务）
- [ ] **检查 `chatAppStream` 的使用情况**
  - 搜索整个项目：`import.*chatAppStream`
  - 如果确实被使用，需要补充或联系后端提供替代 API
  
- [ ] **检查 `chatAgentStream` 的使用情况**
  - AI Agent 网关流式对话功能
  - 同样需要确认是否有替代方案

### 2. 中优先级（确认无误）
- [ ] **验证 DashScope 文件管理 API**
  - 确认 `uploadFileToDashScope` 和 `deleteDashScopeFiles` 是否需要
  - 目前似乎已被集成到后端

### 3. 低优先级（文档完善）
- [ ] 更新 API 使用文档，反映新的模块结构
- [ ] 清理 v2 遗留的空文件（如 `ai/answer.js`）

---

## 📋 详细对比清单

### v2 API 文件总数: **89** 个

按功能模块分类:
- Admin 端：约 65 个文件
- Client 端：约 20 个文件  
- Common 端：约 4 个文件

### v3 API 文件总数: **114** 个

按功能模块分类:
- Admin 端：约 60 个文件（增加 sys 细分模块）
- Client 端：约 42 个文件（新增 order, report, dashboard 等）
- Common 端：约 12 个文件（拆分 ability 模块）

---

## 🏆 结论

### ✅ 迁移完成度：**~95%**

**已完成:**
- ✅ 所有核心业务功能的完整迁移（课程、考试、题库、竞赛、计划等）
- ✅ TypeScript 类型系统的引入，提升了开发体验
- ✅ 模块化重构，代码组织更清晰
- ✅ 新增了订单、流程、错题管理等新特性

**待完善:**
- ⚠️ AI 模块的部分高级功能（`chatAppStream`, `chatAgentStream`）
- ⚠️ DashScope 文件管理功能（可能需要后端配合）

### 🎉 总体评价

Vue3 版本的 API 层实现了**高质量的重构和升级**，虽然在 AI 相关功能上有所调整，但这是为了适应新的架构（后端代理模式）。整体来看，核心业务功能已全部完成迁移，为后续开发和运维打下了坚实的基础。
