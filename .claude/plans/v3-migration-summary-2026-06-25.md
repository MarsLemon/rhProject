# v3 迁移整体状态报告

> **创建**: 2026-06-25
> **会话**: 第一次 v2 ↔ v3 迁移审计 + 修复会话
> **作用**: 总结本会话成果 + 给后续会话/主人亲测指引

---

## 1. 本会话成果汇总

### 1.1 修复类（已 commit）

| 类别 | 改动 | 状态 | 证据 |
|---|---|---|---|
| **P0 #1** bind.vue (128B → 5.5KB) | 完整迁 v2 逻辑 + BindMobile 弹窗 | ✅ | v3 commit `4ace217` / 主仓 `76080c4` |
| **P0 #2** init.vue (77B → 4.2KB) | 完整迁 v2 账号密码修改 | ✅ | 同上 |
| **P0 #3** BindMobile.vue (133B → 4.7KB) | 新建手机绑定弹窗 UI | ✅ | 同上 |
| **Bug #B1** initAccount API 签名 | `{usernames,expiresTime}` → `{userName,password}` 匹配后端 | ✅ | 同上 |
| **P1** AiButtonGroup/index.vue (3202B → 6.7KB) | 重写为 3 菜单 + 接入完整组件 | ✅ | v3 commit `3efcb20` / 主仓 `4bcb924` |
| **P1** WebAiPptGeneratorButton.vue (新建 5.7KB) | AI 课件生成弹窗 | ✅ | 同上 |
| **阶段 3** admin 路由挂载 (52 个路由) | router/modules/admin.ts | ✅ | v3 commit `fe15365` / 主仓 `b320c85` |

### 1.2 文档/基建

| 文件 | 作用 |
|---|---|
| `E:\rhProject\.claude\plans\v3-migration-audit-2026-06-25.md` | 完整审计 + 路线图 |
| `E:\rhProject\.claude\plans\v3-migration-2026-06-25-p0-*.md` | P0 diff 文件 |
| `E:\rhProject\.claude\plans\v3-migration-2026-06-25-p1-*.md` | P1 diff 文件 |
| `E:\rhProject\.claude\plans\v3-admin-progress.json` | 进度跟踪 + resumePrompt |
| `E:\rhProject\.claude\plans\v3-admin-bugs.md` | bug 累积日志 |
| `E:\rhProject\.claude\plans\keep-v3-running-README.md` | 24h 跑脚本说明 |
| `E:\rhProject\scripts\keep-v3-running.ps1` | 守护脚本（§7 白名单） |

---

## 2. v3 现状（实测）

### 2.1 学员端（基本完整）

| 模块 | 状态 |
|---|---|
| dashboard | ✅ 已迁 |
| course（含 AI PPT） | ✅ 已迁 + AI 助手接入 |
| exam | ✅ 已迁 |
| plan | ✅ 已迁 |
| repo | ✅ 已迁 |
| notice | ✅ 已迁 |
| ucenter（**bind / init 已修复**） | ✅ 已迁 |
| AI 助手气泡 (AiButtonGroup) | ✅ 已接入完整功能 |
| AI 答疑 (AiAssistant 4667B) | ✅ |
| AI 陪练 (SparringDialog 3763B) | ✅ |
| AI 课件 (WebAiPptGeneratorButton 5.7KB 新建) | ✅ |

### 2.2 管理端（路由已挂，主体已迁，65 个空壳保留）

| 子模块 | 路由 | 文件状态 |
|---|---|---|
| sys (14 文件) | ✅ 12 路由 | 主体已迁 (1:1 script setup) |
| course (7 文件) | ✅ 8 路由 | 主体已迁 + 4 空壳保留 |
| exam (5 子目录) | ✅ 14 路由 | 主体已迁 + 少量空壳 |
| repo | ✅ 9 路由 | 主体已迁 + 多个空壳保留 |
| notify | ✅ 4 路由 | v3 缺文件走 fallback |
| tmpl | ✅ 3 路由 | 缺 preview 走 fallback |
| paper | ✅ 2 路由 | 缺 detail 走 fallback |
| ai | ✅ 1 路由 | sparring/index.vue |
| dashboard | ✅ 1 路由 | index.vue |
| plan | ❌ 未挂 | CLAUDE.md 硬约束"training-plan 废弃不管" |
| training-sign-in | ❌ 未挂 | CLAUDE.md 硬约束"暂不迁" |

---

## 3. 主人亲测指引

### 3.1 启动 dev

```bash
cd E:\rhProject\wk-train-center-ui-v3
npm run dev
# 访问 http://localhost:4213 (或 vite 给的实际端口)
```

### 3.2 测试清单

| # | 路径 | 预期 |
|---|---|---|
| 1 | `/pages/dashboard` | 学习概览页 |
| 2 | `/pages/uc/bind` | 账号绑定页（**修复后**：4 类型列表 + 绑定/解绑按钮 + BindMobile 弹窗） |
| 3 | `/pages/uc/init` | 修改账号页（**修复后**：表单 + 校验 + 提交） |
| 4 | `/pages/course` | 课程学习列表 |
| 5 | 右下角 AI 气泡 → 答疑 | AiAssistant 弹窗 |
| 6 | 右下角 AI 气泡 → 陪练 | SparringDialog 弹窗 |
| 7 | 右下角 AI 气泡 → AI 课件 | WebAiPptGeneratorButton 弹窗 |
| 8 | `/admin/dashboard` | 管理首页 |
| 9 | `/admin/sys/user` | 用户管理列表 |
| 10 | `/admin/course/qa` | 课程问答 - el-empty 占位（**正常**） |

### 3.3 预期 vs 实际

| 项 | 预期 | 不符 |
|---|---|---|
| AI 真实流式响应 | 暂未接（mock 回复） | 主人测出来"AI 功能开发中..."文本，正常 |
| 微信/钉钉/企业微信绑定 | 弹"升级中"提示 | 正常 |
| 65 个 admin 空壳 | el-empty 占位 | 正常（按硬约束） |
| AI 答辩流式响应 | 暂未接百炼 | 下个 PR 任务 |

---

## 4. 剩余工作量

### 4.1 按 CLAUDE.md 硬约束"v3 空壳只标记不修复"保留的 65 个 admin 空壳

工作量大（每个要迁几百行 v2 Options API 逻辑），建议：
- **不做**：保留占位
- **做**：30+ 小时纯体力活，分批做

### 4.2 AI 流式响应真实接入

- v3 `utils/ai/bailian.ts` 已具备基础
- 接入 AiAssistant 各模式（answer/training）的真实流式
- 工作量：中等（API 调用 + 状态管理）

### 4.3 admin 端功能验证 + bug 修复

- 每个 admin 子模块真实跑通
- 修发现的 bug（缺漏档）

### 4.4 学员端真实 AI 助手联调（百炼）

- 现状：mock 回复
- 目标：真实 API + 流式响应

---

## 5. 续跑指引（给新会话）

新会话开场 Claude Code 时，prompt 模板：

```
继续 v3 admin 端迁移。当前已完成的子阶段:
- E:\rhProject\.claude\plans\v3-admin-progress.json (completed: ["sys", "router"])
- 学员端 P0 + P1 已修

读取以下文件了解上下文:
1. E:\rhProject\.claude\plans\v3-migration-audit-2026-06-25.md (审计报告)
2. E:\rhProject\.claude\plans\v3-admin-progress.json (进度)
3. E:\rhProject\.claude\plans\v3-admin-bugs.md (bug)

按 progress.json 的 resumePrompt 节奏继续推。每个子阶段一个 commit。
bug 写进 v3-admin-bugs.md 不中断流程。
```

---

## 6. 24h 跑脚本

主人想持续跑：

```powershell
# 手动前台跑
powershell -ExecutionPolicy Bypass -File E:\rhProject\scripts\keep-v3-running.ps1

# 或配置 Windows 任务计划 (登录时触发)
# 详见 E:\rhProject\.claude\plans\keep-v3-running-README.md
```

⚠️ **注意**：脚本只检测 Claude Code 进程是否在跑，不续接会话。需要主人在脚本检测到 Claude 不在时手动启动新会话并贴续跑 prompt。

---

## 7. 主人需要做的

1. ✅ **拉取代码**：`git pull` 或本地 `git log` 看 `b320c85`
2. ✅ **亲测 P0/P1/admin 路由**：按 §3.2 测试清单
3. ✅ **配置 keep-v3-running**（可选）：主人想 24h 跑就配任务计划
4. ✅ **审阅本报告**：确认方向无误
5. ⏳ **决定剩余 65 空壳是否补**：主人拍板"做"或"留"