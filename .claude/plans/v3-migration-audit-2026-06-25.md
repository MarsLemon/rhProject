# v2 ↔ v3 迁移审计 + 路线图

> **创建**：2026-06-25
> **作用**：v2 (`wk-train-center-ui`) ↔ v3 (`wk-train-center-ui-v3`) 迁移状态总账
> **写入位置**：`E:\rhProject\.claude\plans\`（CLAUDE.md §7 一次性豁免）
> **关联**：主人 2026-06-25 拍板决定

---

## 0. 主人拍板决定（不可改）

| 序号 | 事项 | 决定 | 时间 |
|---|---|---|---|
| 1 | 计划存放 | `E:\rhProject\.claude\plans\`（§7 一次性豁免） | 2026-06-25 |
| 2 | admin 端范围 | **2C 完整迁移 181 文件** | 2026-06-25 |
| 3 | v3 子仓推送 | **本地 commit 即可，不 push 远端** | 2026-06-25 |
| 4 | 改前列 diff | **4C Claude Code 模式 + diff 审计日志** | 2026-06-25 |
| 5 | bug 三档 | 阻塞立刻报 / 缺漏攒 5 条 / 风格攒 10 条 | 2026-06-25 |

**§7 豁免范围**（仅本任务）：
- ✅ 可写：`E:\rhProject\.claude\plans\`
- ❌ 仍守：不散落 .py/.ps1 到 `E:\rhProject\` 根（§5）
- ❌ 仍守：`E:\rhProject\HermesVault\` 只读 INDEX.md（§7）
- ❌ 仍守：不直接改 8 个核心 skill（CLAUDE.md §2）

---

## 1. 真实数据快照（2026-06-25 审计命令输出）

### 1.1 文件规模

| 维度 | v2 | v3 |
|---|---|---|
| `views/*.vue` 总数 | **295** | **293** |
| 路由数 | 11（admin + web 都有） | **40（仅 web 学员端）** |
| Store modules | 6 | 9（含 knowledge, ai, permission 等） |
| API 文件数 | 87 | 114 |

### 1.2 v3 空壳分级

| 类型 | 大小 | 数量 | 性质 |
|---|---|---|---|
| **A 极小空壳** | < 200B | **6** | 仅 `defineOptions` 或简单 `<el-empty>`（**有 3 个挂了学员端路由 → P0**） |
| **B 占位空壳** | 200-1024B | **74** | 标准 `el-empty` 占位（"通知管理列表"等）— 开发中正常 |
| **C 真实实现** | > 1KB | 213 | 真实代码（其中 116 在 admin/） |

### 1.3 v3 admin 端实现状态

| 子模块 | 文件总数 | 真实实现 (>5KB) | 空壳占位 (<1KB) | 路由挂载 |
|---|---|---|---|---|
| admin/course | ~30 | 14 | 少 | **0** |
| admin/exam | ~30 | 9 | 中 | **0** |
| admin/notify | ~10 | 少 | 多 | **0** |
| admin/plan | ~12 | 0 | 10 | **0** |
| admin/paper | 1 | 0 | 1 | **0** |
| admin/repo | ~25 | 中 | 多 | **0** |
| admin/sys | ~30 | 9 | 少 | **0** |
| admin/tmpl | ~10 | 0 | 9 | **0** |
| admin/ai | 5 | 1 | 3 | **0** |
| admin/training-sign-in | 6 | 0 | 6 | **0** |
| **合计** | **~181** | **~34** | **~65** | **0** |

---

## 2. 🐛 Bug 清单（主人三档分类）

### 🔴 P0 — 阻塞必修（学员端能进但页面空白/坏链）

| # | 文件 | 大小 | 路由名 | 现象 | 修复方案 |
|---|---|---|---|---|---|
| 1 | `views/web/ucenter/bind.vue` | 128B | UserBind | `<BindMobile />` 引用了 type A 空壳 → "账号绑定"空白 | 改用 `el-form` 骨架实现绑定页（参考 v2 同位置） |
| 2 | `views/web/ucenter/init.vue` | 77B | UserInit | 仅 `el-empty` → "修改账号"空白 | 改用 `el-form` 骨架实现 |
| 3 | `views/web/ucenter/UserCourseFileList.vue` | 158B | UserCourse | 自引用不存在的 `course/UserCourseFileList.vue` → 死循环 | 修引用 + 骨架实现（参考 v2 `web/ucenter/course/learn.vue`） |

**P0 修复 diff 文件**：
- [v3-migration-2026-06-25-p0-bind-init-usercoursefile-diff.md](v3-migration-2026-06-25-p0-bind-init-usercoursefile-diff.md)（**待写**）

### 🟡 P1 — 缺漏（views 有，路由没挂）

| # | 模块 | 文件 | 状态 |
|---|---|---|---|
| 4 | 学员端 AI 助手 | `views/web/ai/...` 整组（~10 个文件） | 视图完整，**路由 0 个**（v2 这是热门页面） |
| 5 | 学员端 AIPPT 组件 | `views/web/course/components/AIPPT/...` | 组件完整，未挂 |
| 6 | 学员端课程文件 | `views/web/course/UserCourseFileList.vue` | 仅 v3 的 uc 路由有挂（v2 还有独立位置） |
| 7 | 管理端全部 | `views/admin/...` 181 文件 | 路由 0 个 |

**P1 修复 diff 文件**：
- [v3-migration-2026-06-25-p1-ai-student-mount-diff.md](v3-migration-2026-06-25-p1-ai-student-mount-diff.md)（**待写**）

### 🟢 P2 — 风格/优化（admin 子组件空壳，无用户影响）

- `views/admin/repo/qu/components/QuAiScoreTest.vue` 169B
- `views/admin/repo/qu/components/QuestionTypeConfig.vue` 176B
- `views/admin/repo/qu/components/BindMobile.vue` 133B（注：与 P0 的 web/ucenter/components/BindMobile.vue 是**两个不同文件**）
- `views/admin/repo/stat/components/StatTypeLevelTable.vue` 213B
- `views/admin/repo/stat/components/StatKeyPointsTreeMap.vue` 221B

（+ 70 个 type B el-empty 占位，攒够 10 条再汇总）

---

## 3. 路线图（按主人 2C 决定）

### 阶段 0：建账（本文件）
- [x] 建 `E:\rhProject\.claude\plans\` 目录
- [x] 写审计报告（本文件）
- [ ] 写 P0/P1 详细 diff 文件

### 阶段 1：P0 必修（3 个学员端空壳）
- [ ] 1.1 写 `bind.vue` diff（参考 v2）
- [ ] 1.2 写 `init.vue` diff
- [ ] 1.3 写 `UserCourseFileList.vue` diff
- [ ] 1.4 主人逐个确认 → 改
- [ ] 1.5 `npm run typecheck` + `vite dev` 双绿
- [ ] 1.6 v3 子仓 commit + 主仓同步指针 commit

### 阶段 2：P1 AI 助手学员端挂载
- [ ] 2.1 扫描学员端 ai 路由缺哪些（v2 有 vs v3 有）
- [ ] 2.2 写 `v3-migration-2026-06-25-p1-ai-student-mount-diff.md`
- [ ] 2.3 主人确认 → 改 router/modules/student.ts
- [ ] 2.4 typecheck + 跑 dev

### 阶段 3：admin 端完整迁移（**主人 2C 决定，30+ 轮 diff，1-2 月**）

按子模块拆 **9 个子阶段**，每个子阶段独立 diff 文件 + 独立轮次：

| 子阶段 | 范围 | 工作量 | diff 文件 |
|---|---|---|---|
| 3.1 | admin/sys | ~30 文件（用户/角色/部门/菜单/字典） | `v3-migration-2026-06-25-p3-sys.md` |
| 3.2 | admin/course | ~30 文件（课程/课件/统计） | `v3-migration-2026-06-25-p3-course.md` |
| 3.3 | admin/exam | ~30 文件（考试/试卷/监考/阅卷） | `v3-migration-2026-06-25-p3-exam.md` |
| 3.4 | admin/repo | ~25 文件（题库/题目/AI 出题） | `v3-migration-2026-06-25-p3-repo.md` |
| 3.5 | admin/plan | ~12 文件（培训计划/节点） | `v3-migration-2026-06-25-p3-plan.md` |
| 3.6 | admin/notify | ~10 文件（站内信/模板/邮件） | `v3-migration-2026-06-25-p3-notify.md` |
| 3.7 | admin/tmpl | ~10 文件（试卷模板/规则） | `v3-migration-2026-06-25-p3-tmpl.md` |
| 3.8 | admin/ai | 5 文件（AI 助手管理） | `v3-migration-2026-06-25-p3-ai.md` |
| 3.9 | admin/paper + admin/training-sign-in | 1 + 6 文件 | `v3-migration-2026-06-25-p3-paper-signin.md` |
| 3.10 | admin/dashboard | 1 文件 | `v3-migration-2026-06-25-p3-dashboard.md` |

**每个子阶段流程**：
1. 列 v2 vs v3 差异表
2. 列影响清单（CLAUDE.md §1 业务主域联动）
3. 写 diff 文件
4. 主人确认 → 改
5. typecheck + vite dev
6. v3 子仓 commit + 主仓指针 commit

---

## 4. 风险与边界

### 4.1 已知风险

| 风险 | 影响 | 缓解 |
|---|---|---|
| admin 端 65 个空壳需读 v2 实现对比 | 时间成本翻倍 | 逐个对比，每文件独立 diff |
| admin 改一处动后端/数据库/API | 跨域爆炸 | 每次列 workflow-cross-module-check 影响清单 |
| v3 子仓不 push 远端 → 主人切机器拉不到 | 协作成本 | 主仓指针 commit + 主人定期手动同步远端 |
| 完整迁移 1-2 月 + 9 子阶段 | 工期长 | 主人可中途调整范围 |

### 4.2 边界

- **不修** v2 bug（除非主人指定）
- **不动** 后端 `wk-train-center-service/`（除非 admin 端必须改 API）
- **不删** v2 任何文件（保留 v2 作 fallback）
- **不**绕过 CLAUDE.md §1 业务主域联动表
- **不**写 `E:\rhProject\` 根散落临时产物（§5 仍守）

---

## 5. 执行日志

### 2026-06-25 阶段 0
- ✅ 建 `.claude/plans/` 目录
- ✅ 写本审计报告
- ⏳ 待写：阶段 1 P0 diff 文件
