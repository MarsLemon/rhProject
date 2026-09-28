# Admin Dashboard - 基于 v2 的重新迁移指南

## 📝 本次修改摘要

### ❌ 删除了之前的错误实现

1. **旧版 API 路径错误**
   - `CardNoticeList`: `/api/admin/notice/list` ❌
   - `CardCourseList`: `/api/admin/course/list/ongoing` ❌  
   - `CardExamList`: `/api/admin/exam/list/ongoing` ❌

2. **环境变量配置混乱**

---

### ✅ 正确的 API 映射（从 v2）

| 组件 | v2 原 API | v3 新 API | 状态 |
|------|---------|----------|------|
| CardStatNums | `/api/stat/total/num/all` | ✅ 已修复 |
| CardNoticeList | `/api/sys/notice/client/paging` | ✅ 已修复 |
| CardCourseList | `/api/stat/course/dash-course-list` | ⚠️ 待确认 |
| CardExamList | `/api/stat/exam/dash-exam-list` | ⚠️ 待确认 |
| LineChartUser | `/api/stat/user/dash-user-week` | ⚠️ 待确认 |
| LineChartCourse | `/api/stat/course/dash-learn-week` | ⚠️ 待确认 |
| LineChartExam | `/api/stat/exam/dash-stat-week` | ⚠️ 待确认 |

---

## 🔧 当前已完成

1. ✅ **CardStatNums.vue** - 统计总览
   - API: `/api/stat/total/num/all`
   - 数据字段正确映射
   
2. ✅ **CardNoticeList.vue** - 系统公告
   - API: `/api/sys/notice/client/paging`
   - Pagination 参数正确

---

## 📋 需要补充的组件

### ⚠️ 高优先级

1. **CardQuickOpt.vue** - 快捷入口
   - 需要从 v2 复制完整逻辑
   - 包含路由导航权限控制

2. **CardCourseList.vue** - 进行中课程
   - API: `/api/stat/course/dash-course-list`

3. **CardExamList.vue** - 进行中考试
   - API: `/api/stat/exam/dash-exam-list`

4. **LineChartUser/Course/Exam.vue** - 图表组件
   - ECharts 配置从 v2 复制
   - 响应式 resize mixin

---

## 🚀 立即修复步骤

### 步骤 1: 读取并运行脚本

```bash
node scripts/rebuild-dashboard.mjs
```

该脚本会自动生成完整的 Dashboard 组件。

### 步骤 2: 手动补充遗漏组件

从 `e:\rhProject\wk-train-center-ui\src\views\admin\dashboard\components` 目录读取所有 Vue 文件，逐个迁移到 v3。

### 步骤 3: 验证环境配置

确保 `.env/.env.development.local`中的配置正确：

```bash
VITE_PORT=4207  # 或您需要的端口
VITE_APP_BASE_API=http://192.168.124.151:8101
```

---

## 🎯 测试验证

重启 dev server 后访问：http://localhost:4207/admin/dashboard

**预期效果：**
1. ✅ 统计总览显示正确数字
2. ✅ 系统公告列表有数据
3. ✅ 快捷入口显示中文
4. ✅ 图表正常渲染
5. ✅ 不再出现 404 错误

---

## 📦 附件：v2 参考文件位置

所有原始文件位于：
```
e:\rhProject\wk-train-center-ui\src\views\admin\dashboard\
```

包含以下关键文件：
- index.vue (主页面)
- components/CardStatNums.vue
- components/CardNoticeList.vue
- components/CardQuickOpt.vue
- components/CardCourseList.vue
- components/CardExamList.vue
- components/LineChartUser.vue
- components/LineChartCourse.vue
- components/LineChartExam.vue
- mixins/resize.ts (响应式支持)

请根据以上文件逐一迁移至 v3！

---

**最后更新时间**: 2026-08-10  
**维护者**: Qoder Team
