# Vue2→Vue3 Migration - Task List

**生成时间**: 2026-8-26  
**来源**: Session-2 Audit Report  
**总任务数**: 277 P0 真缺失 (待迁移) + 406 已映射 (待检查) + 9 移位  

---

## 📊 优先级排序逻辑

| 优先级 | 标准 | 示例 |
|--------|------|------|
| ⭐⭐⭐ | 高频使用核心业务 | exam/course/repo |
| ⭐⭐ | 基础组件/基础设施 | DataTable/FileUpload/components |
| ⭐ | 低频/边缘功能 | ai/notify/tmpl |

---

## 🎯 Phase 1: Core Business Modules (优先完成)

### Block A: Admin Exam (考试管理后台)

| # | V2 路径 | V3 路径 | 优先级 | 估时 | 依赖 | Status | Notes |
|---|-------|-------|--------|------|------|--------|-------|
| 1 | views/admin/exam/exam-manage.vue | views/admin/exam/exam-manage.vue | ⭐⭐⭐ | 中 2-4h | 无 | pending | 核心考试管理 |
| 2 | views/admin/exam/exam/form.vue | views/admin/exam/exam/form.vue | ⭐⭐⭐ | 中 2-4h | No.1 | pending | 试卷表单 |
| 3 | views/admin/exam/exam/index.vue | views/admin/exam/exam/index.vue | ⭐⭐⭐ | 小 <2h | No.1 | pending | 列表页 |
| 4 | views/admin/exam/review/audit.vue | views/admin/exam/review/audit.vue | ⭐⭐⭐ | 中 2-4h | No.2 | pending | ⚠️ 可疑需确认 |
| 5 | views/admin/exam/apply.vue | views/admin/exam/apply.vue | ⭐⭐ | 中 2-4h | No.1 | pending | 报名管理 |
| 6 | views/admin/exam/correct.vue | views/admin/exam/correct.vue | ⭐⭐ | 中 2-4h | No.2 | pending | 批改管理 |
| 7 | views/admin/exam/record.vue | views/admin/exam/record.vue | ⭐⭐ | 小 <2h | No.1 | pending | 记录查询 |

### Block B: Admin Course (课程管理后台)

| # | V2 路径 | V3 路径 | 优先级 | 估时 | 依赖 | Status | Notes |
|---|-------|-------|--------|------|------|--------|-------|
| 1 | views/admin/course/file.vue | views/admin/course/file.vue | ⭐⭐⭐ | 中 2-4h | 无 | pending | ⚠️ Branch diff +200% |
| 2 | views/admin/course/form.vue | views/admin/course/form.vue | ⭐⭐⭐ | 中 2-4h | No.1 | pending | ⚠️ 可疑需确认 |
| 3 | views/admin/course/index.vue | views/admin/course/index.vue | ⭐⭐⭐ | 小 <2h | No.1 | pending | 列表页 |
| 4 | views/admin/course/qa.vue | views/admin/course/qa.vue | ⭐⭐ | 小 <2h | No.1 | pending | QA 管理 |
| 5 | views/admin/course/live.vue | views/admin/course/live.vue | ⭐⭐ | 中 2-4h | No.1 | pending | 直播管理 |

### Block C: Admin Repo (题库管理后台)

| # | V2 路径 | V3 路径 | 优先级 | 估时 | 依赖 | Status | Notes |
|---|-------|-------|--------|------|------|--------|-------|
| 1 | views/admin/repo/form.vue | views/admin/repo/form.vue | ⭐⭐⭐ | 大 >4h | 无 | pending | 复杂表单 |
| 2 | views/admin/repo/index.vue | views/admin/repo/index.vue | ⭐⭐⭐ | 小 <2h | No.1 | pending | 列表页 |
| 3 | views/admin/repo/qu/form.vue | views/admin/repo/qu/form.vue | ⭐⭐⭐ | 大 >4h | No.1 | pending | 问卷表单 |
| 4 | views/admin/repo/qu/index.vue | views/admin/repo/qu/index.vue | ⭐⭐ | 中 2-4h | No.3 | pending | 问卷列表 |

### Block D: Web Exam (学员端考试)

| # | V2 路径 | V3 路径 | 优先级 | 估时 | 依赖 | Status | Notes |
|---|-------|-------|--------|------|------|--------|-------|
| 1 | views/web/exam/WebExamStart.vue | views/web/exam/WebExamStart.vue | ⭐⭐⭐ | 大 >4h | 无 | pending | 考生端核心 |
| 2 | views/web/exam/WebPaperList.vue | views/web/exam/WebPaperList.vue | ⭐⭐⭐ | 中 2-4h | No.1 | pending | 试卷列表 |
| 3 | views/web/exam/components/ActionChecker.vue | views/web/exam/components/ActionChecker.vue | ⭐⭐ | 小 <2h | No.1 | pending | 计时器组件 |

### Block E: Web Course (学员端课程)

| # | V2 路径 | V3 路径 | 优先级 | 估时 | 依赖 | Status | Notes |
|---|-------|-------|--------|------|------|--------|-------|
| 1 | views/web/course/list.vue | views/web/course/list.vue | ⭐⭐⭐ | 中 2-4h | 无 | pending | 课程列表 |
| 2 | views/web/course/detail.vue | views/web/course/detail.vue | ⭐⭐⭐ | 中 2-4h | No.1 | pending | 课程详情 |
| 3 | views/web/course/play.vue | views/web/course/play.vue | ⭐⭐⭐ | 大 >4h | No.2 | pending | 播放页 |

---

## 🔧 Phase 2: Base Components (基础设施)

### Block F: File Upload (文件上传组件)

| # | V2 路径 | V3 路径 | 优先级 | 估时 | 依赖 | Status | Notes |
|---|-------|-------|--------|------|------|--------|-------|
| 1 | components/ComponentsBase/ComponentsFile/FileUpload/FileUpload.vue | components/FileUpload.vue | ⭐⭐⭐ | 大 >4h | 无 | pending | ⚠️ Branch diff |
| 2 | components/ComponentsBase/ComponentsFile/FileUpload/FileUploadCos.vue | components/FileUploadCos.vue | ⭐⭐⭐ | 大 >4h | No.1 | pending | ⚠️ Branch diff |
| 3 | components/ComponentsBase/ComponentsFile/FileUpload/FileUploadLocal.vue | components/FileUploadLocal.vue | ⭐⭐⭐ | 中 2-4h | No.1 | pending | ⚠️ Branch diff |
| 4 | components/ComponentsBase/ComponentsFile/FileUpload/FileUploadOss.vue | components/FileUploadOss.vue | ⭐⭐⭐ | 大 >4h | No.1 | pending | ⚠️ Branch diff +22→20 |

### Block G: Data Table (表格组件)

| # | V2 路径 | V3 路径 | 优先级 | 估时 | 依赖 | Status | Notes |
|---|-------|-------|--------|------|------|--------|-------|
| 1 | components/ComponentsBase/ComponentsTable/DataTable/DataTable.vue | components/DataTable.vue | ⭐⭐⭐ | 大 >4h | 无 | pending | ⚠️ Branch diff +200% |
| 2 | components/ComponentsBase/ComponentsTable/DataGrid.vue | components/DataGrid.vue | ⭐⭐ | 中 2-4h | No.1 | pending | 辅助组件 |

---

## 📦 Phase 3: Other Admin Functions

### Block H: Admin Sys (系统管理)

| # | V2 路径 | V3 路径 | 优先级 | 估时 | 依赖 | Status | Notes |
|---|-------|-------|--------|------|------|--------|-------|
| 1 | views/admin/sys/user/index.vue | views/admin/sys/user/index.vue | ⭐⭐ | 中 2-4h | 无 | pending | 用户管理 |
| 2 | views/admin/sys/role/index.vue | views/admin/sys/role/index.vue | ⭐⭐ | 中 2-4h | No.1 | pending | 角色管理 |
| 3 | views/admin/sys/menu/index.vue | views/admin/sys/menu/index.vue | ⭐⭐ | 中 2-4h | No.1 | pending | 菜单管理 |
| 4 | views/admin/sys/dept/index.vue | views/admin/sys/dept/index.vue | ⭐⭐ | 中 2-4h | No.1 | pending | 部门管理 |

### Block I: Admin Plan (培训计划管理)

| # | V2 路径 | V3 路径 | 优先级 | 估时 | 依赖 | Status | Notes |
|---|-------|-------|--------|------|------|--------|-------|
| 1 | views/admin/plan/index.vue | views/admin/plan/index.vue | ⭐ | 小 <2h | 无 | pending | 计划列表 |
| 2 | views/admin/plan/node.vue | views/admin/plan/node.vue | ⭐ | 小 <2h | No.1 | pending | 节点管理 |

### Block J: Admin Notify (通知管理)

| # | V2 路径 | V3 路径 | 优先级 | 估时 | 依赖 | Status | Notes |
|---|-------|-------|--------|------|------|--------|-------|
| 1 | views/admin/notify/im.vue | views/admin/notify/im.vue | ⭐ | 小 <2h | 无 | pending | IM 消息 |
| 2 | views/admin/notify/msg.vue | views/admin/notify/msg.vue | ⭐ | 小 <2h | No.1 | pending | 消息列表 |

### Block K: Admin Tmpl (模板管理)

| # | V2 路径 | V3 路径 | 优先级 | 估时 | 依赖 | Status | Notes |
|---|-------|-------|--------|------|------|--------|-------|
| 1 | views/admin/tmpl/form.vue | views/admin/tmpl/form.vue | ⭐ | 小 <2h | 无 | pending | 模板表单 |
| 2 | views/admin/tmpl/index.vue | views/admin/tmpl/index.vue | ⭐ | 小 <2h | No.1 | pending | 模板列表 |

---

## 🏫 Phase 4: Web Student Functions

### Block L: Web Dashboard (学员首页)

| # | V2 路径 | V3 路径 | 优先级 | 估时 | 依赖 | Status | Notes |
|---|-------|-------|--------|------|------|--------|-------|
| 1 | views/web/dashboard/index.vue | views/web/dashboard/index.vue | ⭐⭐ | 中 2-4h | 无 | pending | 首页 |

### Block M: Web Ucenter (学员中心)

| # | V2 路径 | V3 路径 | 优先级 | 估时 | 依赖 | Status | Notes |
|---|-------|-------|--------|------|------|--------|-------|
| 1 | views/web/ucenter/bind.vue | views/web/ucenter/bind.vue | ⭐⭐ | 中 2-4h | 无 | pending | 绑定手机 |
| 2 | views/web/ucenter/info.vue | views/web/ucenter/info.vue | ⭐⭐ | 小 <2h | No.1 | pending | 个人信息 |
| 3 | views/web/ucenter/im.vue | views/web/ucenter/im.vue | ⭐⭐ | 小 <2h | No.2 | pending | IM 消息 |
| 4 | views/web/ucenter/points.vue | views/web/ucenter/points.vue | ⭐ | 小 <2h | No.2 | pending | 积分 |

---

## 🤖 Phase 5: AI & Others

### Block N: Web AI (AI 助手)

| # | V2 路径 | V3 路径 | 优先级 | 估时 | 依赖 | Status | Notes |
|---|-------|-------|--------|------|------|--------|-------|
| 1 | views/web/ai/components/AiAssistant/*.vue | web/ai/components/AiAssistant/*.ts | ⭐ | 中 2-4h | 无 | pending | AI 组件重构 |

---

## 📅 Suggested Execution Order

```markdown
Day 1 (Today):
├─ Block F: FileUpload (4 files, ~15h total) - Base infra
└─ Block G: DataTable (1 file, ~4h) - Base infra

Day 2-3:
├─ Block A: Admin Exam (7 files, ~18h total)
└─ Block B: Admin Course (5 files, ~12h total)

Day 4-5:
├─ Block C: Admin Repo (4 files, ~14h total)
└─ Block D: Web Exam (3 files, ~10h total)

Week 2:
├─ Block E: Web Course (3 files, ~10h)
├─ Block H-K: Other Admin (13 files, ~25h)
└─ Block L-M: Web Student (5 files, ~12h)

Week 3+:
└─ Block N: AI & others (remaining ~5h)
```

---

## ⚠️ Critical Items Requiring Attention

1. **⚠️ views/admin/course/file.vue** - Branch count difference (+200%) needs manual review
2. **⚠️ views/admin/exam/review/audit.vue** - Suspicious code pattern needs verification
3. **⚠️ views/admin/course/form.vue** - Suspicious code pattern needs verification
4. **⚠️ components/ComponentsBase/ComponentsFile/FileUpload/Oss.vue** - Branch count difference (22→20)

---

## 🔄 Migration Checklist Template

For each file to be migrated:

- [ ] Copy V2 file to V3 with `.vue` → `.vue`
- [ ] Convert Options API → Composition API (`<script setup lang="ts">`)
- [ ] Update Element UI imports → Element Plus
- [ ] Check Vuex actions → Pinia stores (`vuex_pinia_mapping_v2.csv`)
- [ ] Verify branch logic equivalence (compare V2/V3 conditions)
- [ ] Run `npm run typecheck` for TS errors
- [ ] Test in dev environment
- [ ] Update documentation if needed

---

**Total Estimated Effort**: 
- Core modules (A-E): ~70 hours
- Base components (F-G): ~25 hours
- Other functions (H-N): ~50 hours
- **Grand Total**: ~145 hours (~18 working days)

---

**Last Updated**: 2026-8-26  
**Next Review**: After Day 1 execution review
