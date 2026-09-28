# V2 vs V3 实际内容差异扫描报告

> 生成时间: 2026-08-07 19:44:59
> 扫描文件: 123 个 (来自 02-v3-exists-need-diff.txt)

## 一、扫描结果总览

| 类别 | 数量 | 含义 |
|------|------|------|
| ✅ 内容完全一致 | 3 | V2/V3 完全同步 |
| ✅ V3 比 V2 新 | 59 | V3 已主动超前，无需处理 |
| ⚠️ V3 比 V2 旧 | 60 | **需迁移**（V2 有新代码） |
| ⚠️ V2 不存在 | 0 | V2 已删除，无需处理 |
| ⚠️ V3 不存在 | 1 | V3 已删除，无需处理 |
| ❌ 错误 | 0 | 两边都不存在 |

## 二、需要迁移的文件（V3 比 V2 旧）

> **这些文件 V2 还在改，V3 没同步**。按行数差/大小差排序，行数差越大优先级越高。

| 文件 | V2 行数 | V3 行数 | 差距 | 优先级 |
|------|---------|---------|------|--------|
| src/views/web/course/UserCourseFileList.vue | 490 | 263 | 227 | 🔴 高 |
| src/views/web/course/CourseDetail.vue | 478 | 260 | 218 | 🔴 高 |
| src/views/web/course/WebCourseList/OpenCoursePage.vue | 546 | 369 | 177 | 🔴 高 |
| src/views/web/ai/components/AiAssistant/modes/training/TrainingAssistantView.vue | 447 | 271 | 176 | 🔴 高 |
| src/views/web/exam/WebExamStart.vue | 534 | 421 | 113 | 🔴 高 |
| src/components/ComponentsBase/ComponentsFile/FileUpload/FileUploadOss.vue | 569 | 459 | 110 | 🔴 高 |
| src/components.d.ts | 304 | 195 | 109 | 🔴 高 |
| src/views/web/repo/train/WebTrainProcess.vue | 125 | 41 | 84 | 🟡 中 |
| src/views/web/ucenter/bind.vue | 227 | 145 | 82 | 🟡 中 |
| src/views/web/plan/WebPlanDetail.vue | 426 | 361 | 65 | 🟡 中 |
| src/views/web/course/components/dialog/WebMultiAddCourseFileDialog.vue | 192 | 138 | 54 | 🟡 中 |
| src/views/web/dashboard/components/WebRecommendCourses.vue | 210 | 158 | 52 | 🟡 中 |
| src/views/web/ucenter/im.vue | 479 | 427 | 52 | 🟡 中 |
| src/layout/Admin/Sidebar/SidebarLogo.vue | 127 | 77 | 50 | 🟡 中 |
| src/layout/Web/UserLayout.vue | 88 | 41 | 47 | 🟡 中 |
| src/views/web/plan/components/NodeCardAll.vue | 389 | 347 | 42 | 🟡 中 |
| src/components/ComponentsBase/ComponentsFile/FileUpload/FileUploadPublic.vue | 349 | 309 | 40 | 🟡 中 |
| src/views/web/exam/components/ResultLeftNav.vue | 218 | 190 | 28 | 🟢 低 |
| src/views/admin/dashboard/components/LineChartCourse.vue | 139 | 113 | 26 | 🟢 低 |
| src/views/web/exam/WebExamCheck.vue | 264 | 238 | 26 | 🟢 低 |
| src/views/web/course/components/dialog/components/WebFileListTable.vue | 105 | 83 | 22 | 🟢 低 |
| src/views/web/ucenter/info.vue | 153 | 131 | 22 | 🟢 低 |
| src/views/web/ucenter/points.vue | 68 | 46 | 22 | 🟢 低 |
| src/views/web/dashboard/components/WebQuickOpt.vue | 181 | 160 | 21 | 🟢 低 |
| src/views/web/exam/WebExamList/index.vue | 73 | 52 | 21 | 🟢 低 |
| src/views/web/exam/WebPaperList.vue | 135 | 115 | 20 | 🟢 低 |
| src/views/web/plan/WebPlanList/OpenPlanPage.vue | 96 | 77 | 19 | 🟢 低 |
| src/views/admin/dashboard/components/LineChartUser.vue | 125 | 108 | 17 | 🟢 低 |
| src/styles/index.scss | 1165 | 1149 | 16 | 🟢 低 |
| src/components/ComponentsBase/WebSocket.vue | 132 | 118 | 14 | 🟢 低 |
| src/layout/Admin/index.vue | 113 | 99 | 14 | 🟢 低 |
| src/views/web/exam/WebExamResult/ThanksOnly.vue | 50 | 37 | 13 | 🟢 低 |
| src/views/web/repo/components/QuReportDialog.vue | 97 | 84 | 13 | 🟢 低 |
| src/directive/waves/waves.css | 36 | 24 | 12 | 🟢 低 |
| src/styles/element-variables.scss | 32 | 20 | 12 | 🟢 低 |
| src/views/admin/dashboard/components/CardStatNums.vue | 177 | 165 | 12 | 🟢 低 |
| src/views/web/exam/WebExamResult/index.vue | 62 | 50 | 12 | 🟢 低 |
| src/views/web/ucenter/pass.vue | 106 | 94 | 12 | 🟢 低 |
| src/views/web/exam/components/dialog/ExamApplyDialog.vue | 113 | 102 | 11 | 🟢 低 |
| src/views/web/exam/WebExamBook.vue | 133 | 123 | 10 | 🟢 低 |
| src/views/admin/dashboard/components/LineChartExam.vue | 131 | 122 | 9 | 🟢 低 |
| src/views/web/exam/WebExamResult/ThanksWithScore.vue | 65 | 56 | 9 | 🟢 低 |
| src/views/web/exam/WebExamResult/ResultDetail.vue | 43 | 35 | 8 | 🟢 低 |
| src/views/web/course/WebCourseList/CourseLearnPage.vue | 123 | 116 | 7 | 🟢 低 |
| src/views/web/exam/components/ExamFullMode.vue | 109 | 102 | 7 | 🟢 低 |
| src/views/web/plan/WebPlanList/index.vue | 48 | 41 | 7 | 🟢 低 |
| src/views/web/repo/user/WebUserQuNotes.vue | 40 | 34 | 6 | 🟢 低 |
| src/views/web/repo/train/WebTrainRecord.vue | 30 | 25 | 5 | 🟢 低 |
| src/views/web/repo/user/WebUserQuFav.vue | 39 | 34 | 5 | 🟢 低 |
| src/views/web/exam/components/ExamTimer.vue | 103 | 99 | 4 | 🟢 低 |
| src/layout/Admin/Sidebar/SidebarItem.vue | 133 | 130 | 3 | 🟢 低 |
| src/layout/login/LoginRegister.vue | 120 | 118 | 2 | 🟢 低 |
| src/views/web/course/components/CourseCam.vue | 131 | 129 | 2 | 🟢 低 |
| src/views/web/course/WebCourseQaList/index.vue | 26 | 24 | 2 | 🟢 低 |
| src/views/web/exam/components/ActionChecker.vue | 62 | 60 | 2 | 🟢 低 |
| src/views/web/plan/WebPlanList/MyPlanPage.vue | 111 | 109 | 2 | 🟢 低 |
| src/components/ComponentsBase/ComponentsForm/Tinymce/EditorAttachDialog.vue | 124 | 124 | 0 | 🟢 低 |
| src/layout/Admin/Sidebar/SidebarItemMate.vue | 30 | 30 | 0 | 🟢 低 |
| src/styles/login.scss | 106 | 106 | 0 | 🟢 低 |
| src/views/web/exam/components/QuItemExam.vue | 313 | 313 | 0 | 🟢 低 |

## 三、按模块汇总（V3 落后）

| 模块 | 文件数 |
|------|--------|
| web/exam | 15 |
| web/course | 8 |
| web/repo | 5 |
| web/ucenter | 5 |
| web/plan | 5 |
| components/ComponentsBase | 4 |
| layout/Admin | 4 |
| admin/dashboard | 4 |
| styles | 3 |
| web/dashboard | 2 |
| web/ai | 1 |
| components.d.ts | 1 |
| layout/Web | 1 |
| directive | 1 |
| layout/login | 1 |

## 四、高优先级迁移清单（行数差 > 100）

| 文件 | V2 | V3 | 差 |
|------|-----|-----|-----|
| src/views/web/course/UserCourseFileList.vue | 490 | 263 | 227 |
| src/views/web/course/CourseDetail.vue | 478 | 260 | 218 |
| src/views/web/course/WebCourseList/OpenCoursePage.vue | 546 | 369 | 177 |
| src/views/web/ai/components/AiAssistant/modes/training/TrainingAssistantView.vue | 447 | 271 | 176 |
| src/views/web/exam/WebExamStart.vue | 534 | 421 | 113 |
| src/components/ComponentsBase/ComponentsFile/FileUpload/FileUploadOss.vue | 569 | 459 | 110 |
| src/components.d.ts | 304 | 195 | 109 |

## 五、内容完全一致的文件（无需处理）

共 3 个文件 V2/V3 完全同步：

```
src/styles/colors.css
src/styles/mixin.scss
src/styles/sidebar.scss
```