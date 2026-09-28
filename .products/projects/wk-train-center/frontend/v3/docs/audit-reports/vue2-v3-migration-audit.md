# Vue2 → Vue3 深度迁移质量审计报告

**生成时间**: 2026-08-26T06:06:13.856Z
**审计模式**: full

## 一、项目版本信息

- **Vue2 版本**: 68880f8
- **Vue3 版本**: 7f2d334
- **总文件数 (Vue2)**: 683
- **总文件数 (Vue3)**: 802

## 二、统计总览

| 指标 | 数量 | 说明 |
|------|------|------|
| 已映射文件 | 406 | Vue2/Vue3 同路径或移位文件 |
| 未迁移文件 | 277 | Vue3 完全不存在的文件 |
| 移位/重命名 | 9 | 内容相同但路径改变 |

### 问题严重程度分布

| 级别 | 含义 | 数量 | 优先级 |
|------|------|------|--------|
| P0 | 严重缺失 (功能丢失) | 277 | 🔴 CRITICAL |
| P1 | 逻辑偏差 (业务不一致) | 377 | 🟠 HIGH |
| P2 | UI 差异 (样式/组件变化) | 0 | 🟡 MEDIUM |
| P3 | 优化建议 (可现代化) | 29 | 🟢 LOW |

## 三、P0 严重缺失清单

⚠️ 发现 **277** 个严重问题:

| 序号 | Vue2 文件路径 | 原因 |
|------|---------------|------|
| 1 | `api/ability/captcha.js` | File not migrated |
| 2 | `api/ability/login.js` | File not migrated |
| 3 | `api/ability/sign.js` | File not migrated |
| 4 | `api/agent.js` | File not migrated |
| 5 | `api/ai/apps.js` | File not migrated |
| 6 | `api/ai/assistant.js` | File not migrated |
| 7 | `api/ai/common.js` | File not migrated |
| 8 | `api/ai/config.js` | File not migrated |
| 9 | `api/ai/sparring.js` | File not migrated |
| 10 | `api/client/activity/activity.js` | File not migrated |
| 11 | `api/client/battle/battle.js` | File not migrated |
| 12 | `api/client/battle/paper.js` | File not migrated |
| 13 | `api/client/course/course.js` | File not migrated |
| 14 | `api/client/exam/exam.js` | File not migrated |
| 15 | `api/client/exam/paper.js` | File not migrated |
| 16 | `api/client/lecturer/lecturer.js` | File not migrated |
| 17 | `api/client/plan/plan.js` | File not migrated |
| 18 | `api/client/qu/qu.js` | File not migrated |
| 19 | `api/client/qu/report.js` | File not migrated |
| 20 | `api/client/repo/book.js` | File not migrated |
| 21 | `api/client/repo/repo.js` | File not migrated |
| 22 | `api/client/survey/survey.js` | File not migrated |
| 23 | `api/client/train/process.js` | File not migrated |
| 24 | `api/common.js` | File not migrated |
| 25 | `api/course/course.js` | File not migrated |
| 26 | `api/course/face.js` | File not migrated |
| 27 | `api/course/file.js` | File not migrated |
| 28 | `api/course/live.js` | File not migrated |
| 29 | `api/course/qa.js` | File not migrated |
| 30 | `api/exam/apply.js` | File not migrated |
| 31 | `api/exam/correct.js` | File not migrated |
| 32 | `api/exam/exam.js` | File not migrated |
| 33 | `api/exam/record.js` | File not migrated |
| 34 | `api/exam/review/paper.js` | File not migrated |
| 35 | `api/exam/review/qu.js` | File not migrated |
| 36 | `api/exam/review.js` | File not migrated |
| 37 | `api/exam/watch.js` | File not migrated |
| 38 | `api/login/ding.js` | File not migrated |
| 39 | `api/notify/msg.js` | File not migrated |
| 40 | `api/notify/tmpl.js` | File not migrated |
| 41 | `api/paper/capture.js` | File not migrated |
| 42 | `api/paper/exam.js` | File not migrated |
| 43 | `api/paper/paper.js` | File not migrated |
| 44 | `api/plan/node.js` | File not migrated |
| 45 | `api/plan/plan.js` | File not migrated |
| 46 | `api/plan/stat.js` | File not migrated |
| 47 | `api/plan/user.js` | File not migrated |
| 48 | `api/qu/gen.js` | File not migrated |
| 49 | `api/qu/qu.js` | File not migrated |
| 50 | `api/qu/report.js` | File not migrated |
| 51 | `api/repo/chapter.js` | File not migrated |
| 52 | `api/repo/repo.js` | File not migrated |
| 53 | `api/repo/stat.js` | File not migrated |
| 54 | `api/repo/train.js` | File not migrated |
| 55 | `api/stat/course.js` | File not migrated |
| 56 | `api/stat/exam.js` | File not migrated |
| 57 | `api/stat/repo.js` | File not migrated |
| 58 | `api/stat/stat.js` | File not migrated |
| 59 | `api/sys/config/base.js` | File not migrated |
| 60 | `api/sys/config/cos.js` | File not migrated |
| 61 | `api/sys/config/oss.js` | File not migrated |
| 62 | `api/sys/config/prop.js` | File not migrated |
| 63 | `api/sys/config/switch.js` | File not migrated |
| 64 | `api/sys/depart/depart.js` | File not migrated |
| 65 | `api/sys/depart/function.js` | File not migrated |
| 66 | `api/sys/dict/dict.js` | File not migrated |
| 67 | `api/sys/dict/value.js` | File not migrated |
| 68 | `api/sys/group/group.js` | File not migrated |
| 69 | `api/sys/group/user.js` | File not migrated |
| 70 | `api/sys/kp/kp.js` | File not migrated |
| 71 | `api/sys/kp/ref.js` | File not migrated |
| 72 | `api/sys/kp/stat.js` | File not migrated |
| 73 | `api/sys/lecturer/lecturer.js` | File not migrated |
| 74 | `api/sys/log/log.js` | File not migrated |
| 75 | `api/sys/menu/menu.js` | File not migrated |
| 76 | `api/sys/notice/notice.js` | File not migrated |
| 77 | `api/sys/points/points.js` | File not migrated |
| 78 | `api/sys/role/role.js` | File not migrated |
| 79 | `api/sys/user/bind.js` | File not migrated |
| 80 | `api/sys/user/im.js` | File not migrated |
| 81 | `api/sys/user/real.js` | File not migrated |
| 82 | `api/sys/user/sms.js` | File not migrated |
| 83 | `api/sys/user/user.js` | File not migrated |
| 84 | `api/tmpl/tmpl.js` | File not migrated |
| 85 | `api/training-plan/annual-plan.js` | File not migrated |
| 86 | `api/training-plan/my-plan.js` | File not migrated |
| 87 | `api/training-sign-in/index.js` | File not migrated |
| 88 | `api/web/dashboard.js` | File not migrated |
| 89 | `bootstrap/app-initializer.js` | File not migrated |
| 90 | `bootstrap/element.js` | File not migrated |
| 91 | `bootstrap/iframe-communication.js` | File not migrated |
| 92 | `bootstrap/index.js` | File not migrated |
| 93 | `bootstrap/session-manager.js` | File not migrated |
| 94 | `components/ComponentsBase/ComponentsDic/DicCatalogTree.vue` | File not migrated |
| 95 | `components/ComponentsBase/ComponentsDic/DicListSelect.vue` | File not migrated |
| 96 | `components/ComponentsBase/ComponentsDic/DicListShow.vue` | File not migrated |
| 97 | `components/ComponentsBase/ComponentsDic/DicRadioSelect.vue` | File not migrated |
| 98 | `components/ComponentsBase/ComponentsDic/DicTree.vue` | File not migrated |
| 99 | `components/ComponentsBase/ComponentsDic/SysDicValue.vue` | File not migrated |
| 100 | `components/ComponentsBase/ComponentsFile/ComponentsFace/FaceTracking.vue` | File not migrated |
| 101 | `components/ComponentsBase/ComponentsFile/ComponentsFace/TrackingCam.vue` | File not migrated |
| 102 | `components/ComponentsBase/ComponentsFile/ComponentsImage/ImageBox.vue` | File not migrated |
| 103 | `components/ComponentsBase/ComponentsFile/ComponentsImage/ImageCropper.vue` | File not migrated |
| 104 | `components/ComponentsBase/ComponentsFile/ComponentsImage/ImagePreview.vue` | File not migrated |
| 105 | `components/ComponentsBase/ComponentsFile/FilePreview/FilePreview.vue` | File not migrated |
| 106 | `components/ComponentsBase/ComponentsFile/FileReader/composables/useFileSecurity.js` | File not migrated |
| 107 | `components/ComponentsBase/ComponentsFile/FileReader/composables/useIframeFocusTracker.js` | File not migrated |
| 108 | `components/ComponentsBase/ComponentsFile/FileReader/composables/useKeyboardGuard.js` | File not migrated |
| 109 | `components/ComponentsBase/ComponentsFile/FileReader/composables/useMouseEdgeGuard.js` | File not migrated |
| 110 | `components/ComponentsBase/ComponentsFile/FileReader/composables/useScreenGuard.js` | File not migrated |
| 111 | `components/ComponentsBase/ComponentsFile/FileReader/ExcelPreview.vue` | File not migrated |
| 112 | `components/ComponentsBase/ComponentsFile/FileReader/FileReader.vue` | File not migrated |
| 113 | `components/ComponentsBase/ComponentsFile/FileReader/PrivacyOverlay.vue` | File not migrated |
| 114 | `components/ComponentsBase/ComponentsFile/FileReader/utils/fileUrlBuilder.js` | File not migrated |
| 115 | `components/ComponentsBase/ComponentsFile/FileReader/WatermarkLayer.vue` | File not migrated |
| 116 | `components/ComponentsBase/ComponentsFile/ImageViewer/ImageViewer.vue` | File not migrated |
| 117 | `components/ComponentsBase/ComponentsFile/VideoPlayer/VideoPlayer.vue` | File not migrated |
| 118 | `components/ComponentsBase/ComponentsForm/DateTimePicker.vue` | File not migrated |
| 119 | `components/ComponentsBase/ComponentsForm/ElTreeSelect.vue` | File not migrated |
| 120 | `components/ComponentsBase/ComponentsForm/TimeRangePicker.vue` | File not migrated |
| 121 | `components/ComponentsBase/ComponentsForm/Tinymce/dynamicLoadScript.js` | File not migrated |
| 122 | `components/ComponentsBase/ComponentsForm/Tinymce/Tinymce.vue` | File not migrated |
| 123 | `components/ComponentsBase/ComponentsTable/DataGrid.vue` | File not migrated |
| 124 | `components/ComponentsBase/ComponentsTable/DataTable/useTableActions.js` | File not migrated |
| 125 | `components/ComponentsBase/ComponentsTable/DataTable/useTableQuery.js` | File not migrated |
| 126 | `components/ComponentsBase/ComponentsTable/DataTable/useTableSelection.js` | File not migrated |
| 127 | `components/ComponentsBase/ComponentsTable/DetailLink.vue` | File not migrated |
| 128 | `components/ComponentsBase/ComponentsTable/ImportExcel.vue` | File not migrated |
| 129 | `components/ComponentsBase/ComponentsTable/Pagination.vue` | File not migrated |
| 130 | `components/ComponentsBase/ComponentsTable/SecFormat.vue` | File not migrated |
| 131 | `components/ComponentsBase/ComponentsTable/SecondSet.vue` | File not migrated |
| 132 | `components/ComponentsBase/ComponentsTable/StateBar.vue` | File not migrated |
| 133 | `components/ComponentsBase/ComponentsTable/Timer.vue` | File not migrated |
| 134 | `components/ComponentsBase/ComponentsUI/Avatar.vue` | File not migrated |
| 135 | `components/ComponentsBase/ComponentsUI/Captcha.vue` | File not migrated |
| 136 | `components/ComponentsBase/ComponentsUI/Hamburger.vue` | File not migrated |
| 137 | `components/ComponentsBase/ComponentsUI/HeaderMenuSearch.vue` | File not migrated |
| 138 | `components/ComponentsBase/ComponentsUI/HelpTips.vue` | File not migrated |
| 139 | `components/ComponentsBase/ComponentsUI/IconDialog.vue` | File not migrated |
| 140 | `components/ComponentsBase/ComponentsUI/Screenfull.vue` | File not migrated |
| 141 | `components/ComponentsBase/ComponentsUI/SizeSelect.vue` | File not migrated |
| 142 | `components/ComponentsBase/ComponentsUI/StateMsgShow.vue` | File not migrated |
| 143 | `components/ComponentsBase/ComponentsUI/SvgIcon.vue` | File not migrated |
| 144 | `components/ComponentsBase/ComponentsUI/TaskMsg.vue` | File not migrated |
| 145 | `components/ComponentsBase/ComponentsUI/ToolTip.vue` | File not migrated |
| 146 | `components/ComponentsBase/index.js` | File not migrated |
| 147 | `components/ComponentsBusiness/user/MenuUpdateDialog.vue` | File not migrated |
| 148 | `components/USAGE_EXAMPLE.vue` | File not migrated |
| 149 | `directive/clipboard/clipboard.js` | File not migrated |
| 150 | `directive/clipboard/index.js` | File not migrated |
| 151 | `directive/draggable/draggable.js` | File not migrated |
| 152 | `directive/draggable/index.js` | File not migrated |
| 153 | `directive/el-drag-dialog/drag.js` | File not migrated |
| 154 | `directive/el-drag-dialog/index.js` | File not migrated |
| 155 | `directive/el-table/adaptive.js` | File not migrated |
| 156 | `directive/el-table/index.js` | File not migrated |
| 157 | `directive/permission/index.js` | File not migrated |
| 158 | `directive/permission/permission.js` | File not migrated |
| 159 | `directive/sign-html/index.js` | File not migrated |
| 160 | `directive/sticky.js` | File not migrated |
| 161 | `directive/waves/index.js` | File not migrated |
| 162 | `directive/waves/waves.js` | File not migrated |
| 163 | `i18n/index.js` | File not migrated |
| 164 | `i18n/lang/zh-CN.js` | File not migrated |
| 165 | `icons/index.js` | File not migrated |
| 166 | `layout/Admin/Sidebar/FixiOSBug.js` | File not migrated |
| 167 | `layout/Admin/Sidebar/Sidebar.vue` | File not migrated |
| 168 | `layout/Admin/Sidebar/sidebarLink.vue` | File not migrated |
| 169 | `layout/components/index.js` | File not migrated |
| 170 | `layout/login/components/RegDepartSelect.vue` | File not migrated |
| 171 | `layout/mixin/ResizeHandler.js` | File not migrated |
| 172 | `main.js` | File not migrated |
| 173 | `permission.js` | File not migrated |
| 174 | `router/index.js` | File not migrated |
| 175 | `router/modules/course.js` | File not migrated |
| 176 | `router/modules/dashboard.js` | File not migrated |
| 177 | `router/modules/exam.js` | File not migrated |
| 178 | `router/modules/exam_mobile.js` | File not migrated |
| 179 | `router/modules/notice.js` | File not migrated |
| 180 | `router/modules/plan.js` | File not migrated |
| 181 | `router/modules/repo.js` | File not migrated |
| 182 | `router/modules/training-sign-in.js` | File not migrated |
| 183 | `router/modules/ucenter.js` | File not migrated |
| 184 | `settings.js` | File not migrated |
| 185 | `store/getters.js` | File not migrated |
| 186 | `store/index.js` | File not migrated |
| 187 | `store/modules/app.js` | File not migrated |
| 188 | `store/modules/knowledge.js` | File not migrated |
| 189 | `store/modules/permission.js` | File not migrated |
| 190 | `store/modules/settings.js` | File not migrated |
| 191 | `store/modules/tagsView.js` | File not migrated |
| 192 | `store/modules/user.js` | File not migrated |
| 193 | `utils/ali-oss-loader.js` | File not migrated |
| 194 | `utils/auth.js` | File not migrated |
| 195 | `utils/bailian.js` | File not migrated |
| 196 | `utils/base64.js` | File not migrated |
| 197 | `utils/calc.js` | File not migrated |
| 198 | `utils/clipboard.js` | File not migrated |
| 199 | `utils/common.js` | File not migrated |
| 200 | `utils/dev-log.js` | File not migrated |
| 201 | `utils/dynamic-import.js` | File not migrated |
| 202 | `utils/echarts-config.js` | File not migrated |
| 203 | `utils/error-log.js` | File not migrated |
| 204 | `utils/file-utils.js` | File not migrated |
| 205 | `utils/finishNotifyQueue.js` | File not migrated |
| 206 | `utils/format.js` | File not migrated |
| 207 | `utils/get-page-title.js` | File not migrated |
| 208 | `utils/index.js` | File not migrated |
| 209 | `utils/math-parser.js` | File not migrated |
| 210 | `utils/msg.js` | File not migrated |
| 211 | `utils/next-step.js` | File not migrated |
| 212 | `utils/open-window.js` | File not migrated |
| 213 | `utils/permission.js` | File not migrated |
| 214 | `utils/portal-switcher.js` | File not migrated |
| 215 | `utils/qu-parser.js` | File not migrated |
| 216 | `utils/request.js` | File not migrated |
| 217 | `utils/sanitize.js` | File not migrated |
| 218 | `utils/scroll-to.js` | File not migrated |
| 219 | `utils/sse.js` | File not migrated |
| 220 | `utils/training-plan-field-types.js` | File not migrated |
| 221 | `utils/upload.js` | File not migrated |
| 222 | `utils/validate.js` | File not migrated |
| 223 | `utils/watermark.js` | File not migrated |
| 224 | `views/admin/ai/sparring/mixins/sparring-mixin.js` | File not migrated |
| 225 | `views/admin/course/components/File/composables/useDirectoryOps.js` | File not migrated |
| 226 | `views/admin/course/components/File/composables/useDragSort.js` | File not migrated |
| 227 | `views/admin/course/components/File/composables/useFileSync.js` | File not migrated |
| 228 | `views/admin/course/components/File/composables/useFileUploadState.js` | File not migrated |
| 229 | `views/admin/course/components/File/composables/useFileValidation.js` | File not migrated |
| 230 | `views/admin/dashboard/mixins/resize.js` | File not migrated |
| 231 | `views/admin/exam/review/composables/useReviewTracker.js` | File not migrated |
| 232 | `views/admin/exam/review/composables/useScrollNav.js` | File not migrated |
| 233 | `views/admin/plan/plan/components/composables/useGroupManager.js` | File not migrated |
| 234 | `views/admin/plan/stat/components/ExamDetailDrawer.vue` | File not migrated |
| 235 | `views/admin/repo/qu/composables/usePromptOptimizer.js` | File not migrated |
| 236 | `views/admin/repo/qu/composables/useStreamGeneration.js` | File not migrated |
| 237 | `views/admin/repo/qu/ImportDialog.vue` | File not migrated |
| 238 | `views/admin/repo/qu/useQuGen.js` | File not migrated |
| 239 | `views/admin/sys/agent/components/AgentConfigForm.vue` | File not migrated |
| 240 | `views/admin/sys/agent/components/AgentDebugDrawer.vue` | File not migrated |
| 241 | `views/admin/sys/agent/components/AgentDiffDialog.vue` | File not migrated |
| 242 | `views/admin/sys/agent/index.vue` | File not migrated |
| 243 | `views/admin/sys/kp/composables/useKpCrud.js` | File not migrated |
| 244 | `views/admin/sys/kp/composables/useKpRelation.js` | File not migrated |
| 245 | `views/admin/sys/user/composables/useBatchOperation.js` | File not migrated |
| 246 | `views/index.js` | File not migrated |
| 247 | `views/index.vue` | File not migrated |
| 248 | `views/web/ai/components/AiAssistant/conversation/application/sessionFactory.js` | File not migrated |
| 249 | `views/web/ai/components/AiAssistant/conversation/domain/conversationRules.js` | File not migrated |
| 250 | `views/web/ai/components/AiAssistant/conversation/domain/historyContext.js` | File not migrated |
| 251 | `views/web/ai/components/AiAssistant/conversation/infrastructure/chatStreamGateway.js` | File not migrated |
| 252 | `views/web/ai/components/AiAssistant/modes/answer/answerAdapter.js` | File not migrated |
| 253 | `views/web/ai/components/AiAssistant/modes/training/application/endTrainingUseCase.js` | File not migrated |
| 254 | `views/web/ai/components/AiAssistant/modes/training/application/openingRemarkUseCase.js` | File not migrated |
| 255 | `views/web/ai/components/AiAssistant/modes/training/application/startTrainingUseCase.js` | File not migrated |
| 256 | `views/web/ai/components/AiAssistant/modes/training/application/trainingSessionAdapter.js` | File not migrated |
| 257 | `views/web/ai/components/AiAssistant/modes/training/domain/trainingContext.js` | File not migrated |
| 258 | `views/web/ai/components/AiAssistant/modes/training/trainingAdapter.js` | File not migrated |
| 259 | `views/web/ai/components/AiAssistant/preview/citationPreviewFacade.js` | File not migrated |
| 260 | `views/web/ai/components/AiAssistant/shared/aiUploadLimits.js` | File not migrated |
| 261 | `views/web/ai/components/AiAssistant/shared/chatSession.js` | File not migrated |
| 262 | `views/web/ai/components/AiAssistant/shared/conversationTransfer.js` | File not migrated |
| 263 | `views/web/ai/components/AiAssistant/shared/fileType.js` | File not migrated |
| 264 | `views/web/ai/components/AiAssistant/shared/historyPanelMixin.js` | File not migrated |
| 265 | `views/web/ai/components/AiAssistant/shared/historyTitle.js` | File not migrated |
| 266 | `views/web/ai/components/AiAssistant/shared/markdownRenderer.js` | File not migrated |
| 267 | `views/web/ai/components/AiAssistant/shared/sanitizeHtml.js` | File not migrated |
| 268 | `views/web/ai/components/AiAssistant/shared/tableOperations.js` | File not migrated |
| 269 | `views/web/ai/components/AiAssistant/shared/ttsPlainText.js` | File not migrated |
| 270 | `views/web/ai/components/AiAssistant/shared/voiceTts.js` | File not migrated |
| 271 | `views/web/ai/components/AiAssistant/views/AiAssistant.vue` | File not migrated |
| 272 | `views/web/ai/components/AiAssistant/voice/mediaCapture.js` | File not migrated |
| 273 | `views/web/ai/components/AiAssistant/voice/parseAsrPlainText.js` | File not migrated |
| 274 | `views/web/ai/components/AiAssistant/voice/voiceAsr.js` | File not migrated |
| 275 | `views/web/ai/components/AiAssistant/voice/voiceRecorder.js` | File not migrated |
| 276 | `views/web/ai/components/AiButtonGroup.vue` | File not migrated |
| 277 | `views/web/course/components/dialog/composables/useWebFileUpload.js` | File not migrated |

## 四、P1 逻辑偏差清单

⚠️ 发现 **377** 个逻辑偏差：

| 序号 | Vue2 文件 | Vue3 文件 | 问题描述 |
|------|-----------|-----------|----------|
| 1 | `App.vue` | `App.vue` | Vue2 lifecycle hooks not found in Vue3: $route, beforeDestroy, created, data, fetchMsgOnce, fetchMsgTimer, handler, onUnmounted, onBeforeUnmount, onMounted |
| 1 | `App.vue` | `App.vue` | Condition branch count differs: Vue2 (6) vs Vue3 (12) |
| 1 | `App.vue` | `App.vue` | Vuex actions not found in any Pinia store: user/fetchMsg |
| 2 | `components/ComponentsBase/ComponentsFile/ComponentsLive/LivePlayer.vue` | `components/ComponentsBase/ComponentsFile/ComponentsLive/LivePlayer.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handler, onMounted |
| 3 | `components/ComponentsBase/ComponentsFile/ComponentsLive/PrismPlayer.vue` | `components/ComponentsBase/ComponentsFile/ComponentsLive/PrismPlayer.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, data, destroyPlayer, initPlayer, mounted, startPlay, onUnmounted, onBeforeUnmount, onMounted |
| 3 | `components/ComponentsBase/ComponentsFile/ComponentsLive/PrismPlayer.vue` | `components/ComponentsBase/ComponentsFile/ComponentsLive/PrismPlayer.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (3) |
| 4 | `components/ComponentsBase/ComponentsFile/ComponentsLive/Recorder.vue` | `components/ComponentsBase/ComponentsFile/ComponentsLive/Recorder.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, clearFilled, clearRecord, created, data, fillValue, formatSec, getPermission, mounted, playRecord, playRun, saveRecord, startRecord, stopRecord, onUnmounted, onBeforeUnmount, onMounted |
| 4 | `components/ComponentsBase/ComponentsFile/ComponentsLive/Recorder.vue` | `components/ComponentsBase/ComponentsFile/ComponentsLive/Recorder.vue` | Condition branch count differs: Vue2 (6) vs Vue3 (8) |
| 5 | `components/ComponentsBase/ComponentsFile/FileUpload/FileUpload.vue` | `components/ComponentsBase/ComponentsFile/FileUpload/FileUpload.vue` | Vue2 lifecycle hooks not found in Vue3: cancelAllUploads, created, data, fetchConfig, fileDeleted, fileProgress, fileSelected, fileSuccess, fillAccept, fillValue, handler, mounted, successBack, onMounted |
| 5 | `components/ComponentsBase/ComponentsFile/FileUpload/FileUpload.vue` | `components/ComponentsBase/ComponentsFile/FileUpload/FileUpload.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (3) |
| 6 | `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadCos.vue` | `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadCos.vue` | Vue2 lifecycle hooks not found in Vue3: beforeRemove, beforeUpload, buildName, created, data, default, fetchConfig, fillValue, handleChange, handleCropCancel, handleExceed, handleImageCrop, handleRemove, handleSuccess, handler, manualUpload, mounted, onMounted |
| 6 | `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadCos.vue` | `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadCos.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (10) |
| 7 | `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadLocal.vue` | `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadLocal.vue` | Vue2 lifecycle hooks not found in Vue3: beforeRemove, beforeUpload, created, data, default, fillValue, handleChange, handleCropCancel, handleExceed, handleImageCrop, handleRemove, handleSuccess, handler, manualUpload, onMounted |
| 7 | `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadLocal.vue` | `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadLocal.vue` | Condition branch count differs: Vue2 (7) vs Vue3 (8) |
| 8 | `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadOss.vue` | `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadOss.vue` | Vue2 lifecycle hooks not found in Vue3: abortMultipartUpload, addUploadTask, beforeDestroy, beforeRemove, beforeUpload, buildName, cancelAllUploads, cancelUploadByUid, cleanup, created, data, effectiveLimit, emitProgressEvent, fetchConfig, fillValue, handleChange, handleCropCancel, handleError, handleExceed, handleFileObjects, handleImageCrop, handleImageWithCrop, handleRemove, handleSuccess, handleUploadError, handler, initializeComponent, isCropperEnabled, isUploadCancelled, manualUpload, removeUploadTask, startFileUpload, uploadFileWithProgress, onUnmounted, onBeforeUnmount, onMounted |
| 8 | `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadOss.vue` | `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadOss.vue` | Condition branch count differs: Vue2 (22) vs Vue3 (20) |
| 9 | `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadPublic.vue` | `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadPublic.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, beforeRemove, buildName, cancelAllUploads, created, data, effectiveLimit, fetchConfig, handleChange, handleError, handleExceed, handleRemove, handleSuccess, handler, manualUpload, onUnmounted, onBeforeUnmount, onMounted |
| 10 | `components/ComponentsBase/ComponentsForm/Tinymce/EditorAttachDialog.vue` | `components/ComponentsBase/ComponentsForm/Tinymce/EditorAttachDialog.vue` | Vue2 lifecycle hooks not found in Vue3: data, handleClose, handleInsert, handler, recordBack |
| 10 | `components/ComponentsBase/ComponentsForm/Tinymce/EditorAttachDialog.vue` | `components/ComponentsBase/ComponentsForm/Tinymce/EditorAttachDialog.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (6) |
| 11 | `components/ComponentsBase/ComponentsForm/Tinymce/MobileUploadDialog.vue` | `components/ComponentsBase/ComponentsForm/Tinymce/MobileUploadDialog.vue` | Vue2 lifecycle hooks not found in Vue3: data, genQr, handleClose, handler, onMessage |
| 11 | `components/ComponentsBase/ComponentsForm/Tinymce/MobileUploadDialog.vue` | `components/ComponentsBase/ComponentsForm/Tinymce/MobileUploadDialog.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (1) |
| 12 | `components/ComponentsBase/ComponentsTable/DataTable/DataTable.vue` | `components/ComponentsBase/ComponentsTable/DataTable/DataTable.vue` | Vue2 lifecycle hooks not found in Vue3: setup |
| 12 | `components/ComponentsBase/ComponentsTable/DataTable/DataTable.vue` | `components/ComponentsBase/ComponentsTable/DataTable/DataTable.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (15) |
| 13 | `components/ComponentsBase/WebSocket.vue` | `components/ComponentsBase/WebSocket.vue` | Vue2 lifecycle hooks not found in Vue3: beat, clear, connect, data, destroyed, handler, initSocket, mounted, onClose, onError, onMessage, onOpen, ping, onUnmounted, onMounted |
| 13 | `components/ComponentsBase/WebSocket.vue` | `components/ComponentsBase/WebSocket.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (9) |
| 14 | `components/ComponentsBusiness/ai/AiAnalysisButton.vue` | `components/ComponentsBusiness/ai/AiAnalysisButton.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, buildDefaultPrompt, buttonSize, data, dialogVisible, extractLastJson, formatContent, getCorrectAnswer, handleAiAction, handleApply, handleDialogClose, onUnmounted, onBeforeUnmount |
| 15 | `components/ComponentsBusiness/ai/SparringSelectDialog.vue` | `components/ComponentsBusiness/ai/SparringSelectDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handleConfirm, handler, onMounted |
| 15 | `components/ComponentsBusiness/ai/SparringSelectDialog.vue` | `components/ComponentsBusiness/ai/SparringSelectDialog.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (2) |
| 16 | `components/ComponentsBusiness/chart/StatBarChart.vue` | `components/ComponentsBusiness/chart/StatBarChart.vue` | Vue2 lifecycle hooks not found in Vue3: chartId, created, data, handler, initChart, onMounted |
| 16 | `components/ComponentsBusiness/chart/StatBarChart.vue` | `components/ComponentsBusiness/chart/StatBarChart.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (6) |
| 17 | `components/ComponentsBusiness/chart/StatBarYChart.vue` | `components/ComponentsBusiness/chart/StatBarYChart.vue` | Vue2 lifecycle hooks not found in Vue3: chartId, created, data, handler, initChart, onMounted |
| 17 | `components/ComponentsBusiness/chart/StatBarYChart.vue` | `components/ComponentsBusiness/chart/StatBarYChart.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (6) |
| 18 | `components/ComponentsBusiness/chart/StatLineChart.vue` | `components/ComponentsBusiness/chart/StatLineChart.vue` | Vue2 lifecycle hooks not found in Vue3: chartId, created, data, handler, initChart, onMounted |
| 18 | `components/ComponentsBusiness/chart/StatLineChart.vue` | `components/ComponentsBusiness/chart/StatLineChart.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (6) |
| 19 | `components/ComponentsBusiness/chart/StatPieChart.vue` | `components/ComponentsBusiness/chart/StatPieChart.vue` | Vue2 lifecycle hooks not found in Vue3: chartId, created, data, handler, initChart, onMounted |
| 19 | `components/ComponentsBusiness/chart/StatPieChart.vue` | `components/ComponentsBusiness/chart/StatPieChart.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (6) |
| 20 | `components/ComponentsBusiness/course/CheckRulesDialog.vue` | `components/ComponentsBusiness/course/CheckRulesDialog.vue` | Vue2 lifecycle hooks not found in Vue3: data, getDefaultFormData, handleConfirm, handleInheritBeforeChange, hasAnyRule, loadCourseRules, open |
| 20 | `components/ComponentsBusiness/course/CheckRulesDialog.vue` | `components/ComponentsBusiness/course/CheckRulesDialog.vue` | Condition branch count differs: Vue2 (8) vs Vue3 (11) |
| 21 | `components/ComponentsBusiness/course/CourseFileDialog.vue` | `components/ComponentsBusiness/course/CourseFileDialog.vue` | Vue2 lifecycle hooks not found in Vue3: checkSelectable, created, data, handleClose, handleConfirm, handleTableReset, handler, onMounted |
| 21 | `components/ComponentsBusiness/course/CourseFileDialog.vue` | `components/ComponentsBusiness/course/CourseFileDialog.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (5) |
| 22 | `components/ComponentsBusiness/course/CourseFileRefDialog.vue` | `components/ComponentsBusiness/course/CourseFileRefDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handler, id, toCourse, onMounted |
| 22 | `components/ComponentsBusiness/course/CourseFileRefDialog.vue` | `components/ComponentsBusiness/course/CourseFileRefDialog.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (2) |
| 23 | `components/ComponentsBusiness/course/CourseFileSelector.vue` | `components/ComponentsBusiness/course/CourseFileSelector.vue` | Vue2 lifecycle hooks not found in Vue3: backToCourseList, data, fetchCourseFiles, getAllowedExts, getFileExt, getFileExtFromUrl, getFileType, getFileTypeLabel, getResolvedUrl, handleCourseSelect, handleFileCheck, isFileDisabled, isFileSelected, isFileSupported, reset |
| 23 | `components/ComponentsBusiness/course/CourseFileSelector.vue` | `components/ComponentsBusiness/course/CourseFileSelector.vue` | Condition branch count differs: Vue2 (22) vs Vue3 (18) |
| 24 | `components/ComponentsBusiness/course/CourseFolderList.vue` | `components/ComponentsBusiness/course/CourseFolderList.vue` | Vue2 lifecycle hooks not found in Vue3: data, handleSelect, parseTime |
| 25 | `components/ComponentsBusiness/course/CourseRefDialog.vue` | `components/ComponentsBusiness/course/CourseRefDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handler, id, toPlan, onMounted |
| 25 | `components/ComponentsBusiness/course/CourseRefDialog.vue` | `components/ComponentsBusiness/course/CourseRefDialog.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (2) |
| 26 | `components/ComponentsBusiness/course/CourseReferenceUpload.vue` | `components/ComponentsBusiness/course/CourseReferenceUpload.vue` | Vue2 lifecycle hooks not found in Vue3: acceptedTypes, beforeUpload, confirmCourseSelection, data, getAllowedExts, getFileExt, getFileExtFromUrl, handleCourseSelectionChange, handleUpload, handleUploadError, handleUploadLocal, openOnlineCourseDialog |
| 27 | `components/ComponentsBusiness/course/CourseRefSelect.vue` | `components/ComponentsBusiness/course/CourseRefSelect.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handler, handlerChange, onMounted |
| 27 | `components/ComponentsBusiness/course/CourseRefSelect.vue` | `components/ComponentsBusiness/course/CourseRefSelect.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 28 | `components/ComponentsBusiness/course/CourseRuleImpactDialog.vue` | `components/ComponentsBusiness/course/CourseRuleImpactDialog.vue` | Vue2 lifecycle hooks not found in Vue3: data, formatSavedAt, get, handleOpen, onCancel, onConfirmKnown, onJumpPlan, set, visible |
| 28 | `components/ComponentsBusiness/course/CourseRuleImpactDialog.vue` | `components/ComponentsBusiness/course/CourseRuleImpactDialog.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (3) |
| 29 | `components/ComponentsBusiness/course/CourseSelect.vue` | `components/ComponentsBusiness/course/CourseSelect.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handler, handlerChange, onMounted |
| 30 | `components/ComponentsBusiness/course/CourseSelectDialog.vue` | `components/ComponentsBusiness/course/CourseSelectDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handleConfirm, handler, onMounted |
| 31 | `components/ComponentsBusiness/course/FileDurationDialog.vue` | `components/ComponentsBusiness/course/FileDurationDialog.vue` | Vue2 lifecycle hooks not found in Vue3: data, extractOriginalDurations, getDefaultDuration, getFileIcon, getFileTypeText, getRequiredSec, handleConfirm, handleReset, open, resetNodeDurations, setRequiredSec |
| 31 | `components/ComponentsBusiness/course/FileDurationDialog.vue` | `components/ComponentsBusiness/course/FileDurationDialog.vue` | Condition branch count differs: Vue2 (17) vs Vue3 (14) |
| 32 | `components/ComponentsBusiness/exam/ExamRefDialog.vue` | `components/ComponentsBusiness/exam/ExamRefDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handler, id, toPlan, onMounted |
| 32 | `components/ComponentsBusiness/exam/ExamRefDialog.vue` | `components/ComponentsBusiness/exam/ExamRefDialog.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (2) |
| 33 | `components/ComponentsBusiness/exam/ExamSelect.vue` | `components/ComponentsBusiness/exam/ExamSelect.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handler, handlerChange, onMounted |
| 34 | `components/ComponentsBusiness/exam/ExamSelectDialog.vue` | `components/ComponentsBusiness/exam/ExamSelectDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handleConfirm, handler, onMounted |
| 34 | `components/ComponentsBusiness/exam/ExamSelectDialog.vue` | `components/ComponentsBusiness/exam/ExamSelectDialog.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (1) |
| 35 | `components/ComponentsBusiness/exam/FillItemEditor.vue` | `components/ComponentsBusiness/exam/FillItemEditor.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handler, initTags, removeTag, showTagInput, tagInputConfirm, tagsChange, onMounted |
| 36 | `components/ComponentsBusiness/exam/MultiRange.vue` | `components/ComponentsBusiness/exam/MultiRange.vue` | Vue2 lifecycle hooks not found in Vue3: handler, onAddPoint, onDeletePoint, onDragEnd, onDragStart, onDragging, onEmit, onMoveValue, onOffsetLeft, onValueToPercent |
| 36 | `components/ComponentsBusiness/exam/MultiRange.vue` | `components/ComponentsBusiness/exam/MultiRange.vue` | Condition branch count differs: Vue2 (10) vs Vue3 (18) |
| 37 | `components/ComponentsBusiness/exam/MultiRangeSelect.vue` | `components/ComponentsBusiness/exam/MultiRangeSelect.vue` | Vue2 lifecycle hooks not found in Vue3: calcRange, created, data, handleInputConfirm, handler, reInitData, removeSplit, showInput, onMounted |
| 38 | `components/ComponentsBusiness/exam/QuViewDialog.vue` | `components/ComponentsBusiness/exam/QuViewDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handler, showDetail, onMounted |
| 39 | `components/ComponentsBusiness/keyPoint/AssociatedKnowledge.vue` | `components/ComponentsBusiness/keyPoint/AssociatedKnowledge.vue` | Vue2 lifecycle hooks not found in Vue3: addSimilar, confirmAiAdd, confirmJoin, data, getShowList, handleHover, handleRemove, handleSelectChange, handler, openAiDialog, showExplain, showJoin, updateValue |
| 39 | `components/ComponentsBusiness/keyPoint/AssociatedKnowledge.vue` | `components/ComponentsBusiness/keyPoint/AssociatedKnowledge.vue` | Vuex actions not found in any Pinia store: knowledge/explainFunction, knowledge/getSimilarKnowledge |
| 40 | `components/ComponentsBusiness/keyPoint/AssociatedKnowledgeAiExtractDialog.vue` | `components/ComponentsBusiness/keyPoint/AssociatedKnowledgeAiExtractDialog.vue` | Vue2 lifecycle hooks not found in Vue3: cleanJson, data, get, handleAiExtract, handleCheckAllChange, handleCheckedChange, handler, set, visible |
| 40 | `components/ComponentsBusiness/keyPoint/AssociatedKnowledgeAiExtractDialog.vue` | `components/ComponentsBusiness/keyPoint/AssociatedKnowledgeAiExtractDialog.vue` | Condition branch count differs: Vue2 (9) vs Vue3 (10) |
| 41 | `components/ComponentsBusiness/keyPoint/KeyPointSelect.vue` | `components/ComponentsBusiness/keyPoint/KeyPointSelect.vue` | Vue2 lifecycle hooks not found in Vue3: data, handleSelectChange, handler |
| 41 | `components/ComponentsBusiness/keyPoint/KeyPointSelect.vue` | `components/ComponentsBusiness/keyPoint/KeyPointSelect.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (3) |
| 42 | `components/ComponentsBusiness/keyPoint/KeyPointTreeSelect.vue` | `components/ComponentsBusiness/keyPoint/KeyPointTreeSelect.vue` | Vue2 lifecycle hooks not found in Vue3: bind, data, fetchData, handleChange, handleRemoteSearch, handleVisibleChange, handler, loadMore, resetSearch, restValues, unbind |
| 42 | `components/ComponentsBusiness/keyPoint/KeyPointTreeSelect.vue` | `components/ComponentsBusiness/keyPoint/KeyPointTreeSelect.vue` | Condition branch count differs: Vue2 (9) vs Vue3 (12) |
| 43 | `components/ComponentsBusiness/lecturer/LecturerSelectDialog.vue` | `components/ComponentsBusiness/lecturer/LecturerSelectDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handleConfirm, handler, onMounted |
| 43 | `components/ComponentsBusiness/lecturer/LecturerSelectDialog.vue` | `components/ComponentsBusiness/lecturer/LecturerSelectDialog.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (1) |
| 44 | `components/ComponentsBusiness/repo/ChapterSelect.vue` | `components/ComponentsBusiness/repo/ChapterSelect.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handler, handlerChange, onMounted |
| 44 | `components/ComponentsBusiness/repo/ChapterSelect.vue` | `components/ComponentsBusiness/repo/ChapterSelect.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (2) |
| 45 | `components/ComponentsBusiness/repo/RepoDialog.vue` | `components/ComponentsBusiness/repo/RepoDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handleConfirm, handler, onMounted |
| 45 | `components/ComponentsBusiness/repo/RepoDialog.vue` | `components/ComponentsBusiness/repo/RepoDialog.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (1) |
| 46 | `components/ComponentsBusiness/repo/RepoSelect.vue` | `components/ComponentsBusiness/repo/RepoSelect.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handleAddRepo, handler, handlerChange, handlerCode, refresh, showAddRepoDialog, onMounted |
| 46 | `components/ComponentsBusiness/repo/RepoSelect.vue` | `components/ComponentsBusiness/repo/RepoSelect.vue` | Condition branch count differs: Vue2 (8) vs Vue3 (9) |
| 47 | `components/ComponentsBusiness/sys/EventControl.vue` | `components/ComponentsBusiness/sys/EventControl.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, data, devCheck, initPrevent, mounted, resetPrevent, onUnmounted, onBeforeUnmount, onMounted |
| 47 | `components/ComponentsBusiness/sys/EventControl.vue` | `components/ComponentsBusiness/sys/EventControl.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (2) |
| 48 | `components/ComponentsBusiness/sys/FaceCheckDialog.vue` | `components/ComponentsBusiness/sys/FaceCheckDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, failBack, handleClose, handleManual, handleTracked, handler, showManual, successBack, onMounted |
| 49 | `components/ComponentsBusiness/sys/MenuSelectTree.vue` | `components/ComponentsBusiness/sys/MenuSelectTree.vue` | Vue2 lifecycle hooks not found in Vue3: buildTree, cleanChildren, created, data, dataType, filterNode, labelModel, onClickNode, onCloseTree, onHidePopover, onShowPopover, queryTree, refresh, switchTree, value, onMounted |
| 49 | `components/ComponentsBusiness/sys/MenuSelectTree.vue` | `components/ComponentsBusiness/sys/MenuSelectTree.vue` | Condition branch count differs: Vue2 (8) vs Vue3 (13) |
| 50 | `components/ComponentsBusiness/sys/MsgTmplSelect.vue` | `components/ComponentsBusiness/sys/MsgTmplSelect.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handler, handlerChange, onMounted |
| 51 | `components/ComponentsBusiness/sys/SimpleDeviceTest.vue` | `components/ComponentsBusiness/sys/SimpleDeviceTest.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handler, onMounted |
| 51 | `components/ComponentsBusiness/sys/SimpleDeviceTest.vue` | `components/ComponentsBusiness/sys/SimpleDeviceTest.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (3) |
| 52 | `components/ComponentsBusiness/sys/SmsInput.vue` | `components/ComponentsBusiness/sys/SmsInput.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, calc, checkMobile, created, data, handler, sendSms, validate, onUnmounted, onBeforeUnmount, onMounted |
| 52 | `components/ComponentsBusiness/sys/SmsInput.vue` | `components/ComponentsBusiness/sys/SmsInput.vue` | Condition branch count differs: Vue2 (8) vs Vue3 (9) |
| 53 | `components/ComponentsBusiness/sys/ThemePicker.vue` | `components/ComponentsBusiness/sys/ThemePicker.vue` | Vue2 lifecycle hooks not found in Vue3: data, defaultTheme, getCSSString, getThemeCluster, theme, updateStyle |
| 53 | `components/ComponentsBusiness/sys/ThemePicker.vue` | `components/ComponentsBusiness/sys/ThemePicker.vue` | Condition branch count differs: Vue2 (6) vs Vue3 (10) |
| 54 | `components/ComponentsBusiness/tmpl/TmplRefDialog.vue` | `components/ComponentsBusiness/tmpl/TmplRefDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handler, id, toExam, onMounted |
| 54 | `components/ComponentsBusiness/tmpl/TmplRefDialog.vue` | `components/ComponentsBusiness/tmpl/TmplRefDialog.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (2) |
| 55 | `components/ComponentsBusiness/user/DepartRefs.vue` | `components/ComponentsBusiness/user/DepartRefs.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, filterNode, filterText, handleCheckChange, value, onMounted |
| 55 | `components/ComponentsBusiness/user/DepartRefs.vue` | `components/ComponentsBusiness/user/DepartRefs.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (3) |
| 56 | `components/ComponentsBusiness/user/DepartTreeMultiSelect.vue` | `components/ComponentsBusiness/user/DepartTreeMultiSelect.vue` | Vue2 lifecycle hooks not found in Vue3: buildTree, cleanChildren, created, data, dataType, filterNode, filterText, getCheckedNodes, handler, loadDepartTree, onCheckNode, onClear, onHidePopover, onShowPopover, queryTreeNode, switchTree, updateLabelModel, onMounted |
| 56 | `components/ComponentsBusiness/user/DepartTreeMultiSelect.vue` | `components/ComponentsBusiness/user/DepartTreeMultiSelect.vue` | Condition branch count differs: Vue2 (11) vs Vue3 (15) |
| 57 | `components/ComponentsBusiness/user/DepartTreeSelect.vue` | `components/ComponentsBusiness/user/DepartTreeSelect.vue` | Vue2 lifecycle hooks not found in Vue3: buildTree, cleanChildren, created, data, dataType, filterNode, formatLabel, labelModel, onClickNode, onCloseTree, onHidePopover, onShowPopover, queryTree, switchTree, value, onMounted |
| 57 | `components/ComponentsBusiness/user/DepartTreeSelect.vue` | `components/ComponentsBusiness/user/DepartTreeSelect.vue` | Condition branch count differs: Vue2 (8) vs Vue3 (11) |
| 58 | `components/ComponentsBusiness/user/DepartTreeShow.vue` | `components/ComponentsBusiness/user/DepartTreeShow.vue` | Vue2 lifecycle hooks not found in Vue3: clearSelection, created, data, departSelected, filterNode, filterText, handler, onMounted |
| 58 | `components/ComponentsBusiness/user/DepartTreeShow.vue` | `components/ComponentsBusiness/user/DepartTreeShow.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (7) |
| 59 | `components/ComponentsBusiness/user/GroupSelect.vue` | `components/ComponentsBusiness/user/GroupSelect.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handler, handlerChange, onMounted |
| 60 | `components/ComponentsBusiness/user/GroupUserList.vue` | `components/ComponentsBusiness/user/GroupUserList.vue` | Vue2 lifecycle hooks not found in Vue3: data, handleAdd, handler, userSelected |
| 60 | `components/ComponentsBusiness/user/GroupUserList.vue` | `components/ComponentsBusiness/user/GroupUserList.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 61 | `components/ComponentsBusiness/user/KeyPointTreeShow.vue` | `components/ComponentsBusiness/user/KeyPointTreeShow.vue` | Vue2 lifecycle hooks not found in Vue3: clearSelection, created, data, departSelected, filterNode, filterText, onMounted |
| 61 | `components/ComponentsBusiness/user/KeyPointTreeShow.vue` | `components/ComponentsBusiness/user/KeyPointTreeShow.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (3) |
| 62 | `components/ComponentsBusiness/user/NoticeSaveDialog.vue` | `components/ComponentsBusiness/user/NoticeSaveDialog.vue` | Vue2 lifecycle hooks not found in Vue3: clearData, created, data, handleClose, handleSave, handler, initData, preUpdate, onMounted |
| 62 | `components/ComponentsBusiness/user/NoticeSaveDialog.vue` | `components/ComponentsBusiness/user/NoticeSaveDialog.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (4) |
| 63 | `components/ComponentsBusiness/user/RoleSelect.vue` | `components/ComponentsBusiness/user/RoleSelect.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handler, handlerChange, onMounted |
| 64 | `components/ComponentsBusiness/user/SubUserList.vue` | `components/ComponentsBusiness/user/SubUserList.vue` | Vue2 lifecycle hooks not found in Vue3: clearSelection, created, data, formatState, handler, refresh, showFilter, onMounted |
| 64 | `components/ComponentsBusiness/user/SubUserList.vue` | `components/ComponentsBusiness/user/SubUserList.vue` | Condition branch count differs: Vue2 (6) vs Vue3 (2) |
| 65 | `components/ComponentsBusiness/user/UserRange.vue` | `components/ComponentsBusiness/user/UserRange.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fillUsers, handleAdd, handleClear, handleRemove, handleSelected, handler, onMounted |
| 65 | `components/ComponentsBusiness/user/UserRange.vue` | `components/ComponentsBusiness/user/UserRange.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (7) |
| 66 | `components/ComponentsBusiness/user/UserRefs.vue` | `components/ComponentsBusiness/user/UserRefs.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleAdd, handleRemove, handleSelected, onMounted |
| 66 | `components/ComponentsBusiness/user/UserRefs.vue` | `components/ComponentsBusiness/user/UserRefs.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (3) |
| 67 | `components/ComponentsBusiness/user/UserSelect.vue` | `components/ComponentsBusiness/user/UserSelect.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handler, handlerChange, onMounted |
| 68 | `components/ComponentsBusiness/user/UserSelectDialog.vue` | `components/ComponentsBusiness/user/UserSelectDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, departChange, departClear, departSelect, handleBatchImport, handleBatchImportClose, handleBatchImportEnter, handleClose, handleConfirm, handleSearch, handleTableReset, handler, queryUserByName, showBatchImportDialog, onMounted |
| 68 | `components/ComponentsBusiness/user/UserSelectDialog.vue` | `components/ComponentsBusiness/user/UserSelectDialog.vue` | Condition branch count differs: Vue2 (20) vs Vue3 (7) |
| 69 | `layout/Admin/index.vue` | `layout/Admin/index.vue` | Vue2 lifecycle hooks not found in Vue3: classObj, handleClickOutside |
| 69 | `layout/Admin/index.vue` | `layout/Admin/index.vue` | Vuex actions not found in any Pinia store: app/closeSideBar |
| 70 | `layout/Admin/Navbar.vue` | `layout/Admin/Navbar.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleCommand, logout, toStudent, onMounted |
| 70 | `layout/Admin/Navbar.vue` | `layout/Admin/Navbar.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (3) |
| 71 | `layout/Admin/Sidebar/SidebarItem.vue` | `layout/Admin/Sidebar/SidebarItem.vue` | Vue2 lifecycle hooks not found in Vue3: data, handler, hasOneShowingChild, mounted, resolvePath, onMounted |
| 71 | `layout/Admin/Sidebar/SidebarItem.vue` | `layout/Admin/Sidebar/SidebarItem.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (11) |
| 72 | `layout/Admin/Sidebar/SidebarItemMate.vue` | `layout/Admin/Sidebar/SidebarItemMate.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (1) |
| 73 | `layout/Admin/Sidebar/SidebarLogo.vue` | `layout/Admin/Sidebar/SidebarLogo.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, isInIframe, toIndex, onMounted |
| 74 | `layout/Admin/TagsView/TagsView.vue` | `layout/Admin/TagsView/TagsView.vue` | Vue2 lifecycle hooks not found in Vue3: $route, addTags, beforeDestroy, closeAllTags, closeMenu, closeOthersTags, closeSelectedTag, data, filterAffixTags, initTags, isActive, isAffix, mounted, moveToCurrentTag, openMenu, refreshSelectedTag, routes, toLastView, visible, visitedViews, onUnmounted, onBeforeUnmount, onMounted |
| 74 | `layout/Admin/TagsView/TagsView.vue` | `layout/Admin/TagsView/TagsView.vue` | Condition branch count differs: Vue2 (12) vs Vue3 (15) |
| 74 | `layout/Admin/TagsView/TagsView.vue` | `layout/Admin/TagsView/TagsView.vue` | Vuex actions not found in any Pinia store: tagsView/addView, tagsView/addVisitedView, tagsView/delAllViews, tagsView/delCachedView, tagsView/delOthersViews, tagsView/delView, tagsView/updateVisitedView |
| 75 | `layout/Admin/TagsView/TagsViewScrollPane.vue` | `layout/Admin/TagsView/TagsViewScrollPane.vue` | Vue2 lifecycle hooks not found in Vue3: data, handleScroll, moveToTarget, scrollWrapper |
| 75 | `layout/Admin/TagsView/TagsViewScrollPane.vue` | `layout/Admin/TagsView/TagsViewScrollPane.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (9) |
| 76 | `layout/components/AppMain.vue` | `layout/components/AppMain.vue` | Vue2 lifecycle hooks not found in Vue3: cachedViews, key |
| 76 | `layout/components/AppMain.vue` | `layout/components/AppMain.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 77 | `layout/components/Settings.vue` | `layout/components/Settings.vue` | Vue2 lifecycle hooks not found in Vue3: data, get, set, themeChange |
| 77 | `layout/components/Settings.vue` | `layout/components/Settings.vue` | Vuex actions not found in any Pinia store: settings/changeSetting |
| 78 | `layout/login/components/DemoAccount.vue` | `layout/login/components/DemoAccount.vue` | Vue2 lifecycle hooks not found in Vue3: adminLogin, data, handleLogin, studentLogin |
| 78 | `layout/login/components/DemoAccount.vue` | `layout/login/components/DemoAccount.vue` | Vuex actions not found in any Pinia store: user/login |
| 79 | `layout/login/components/FaceLoginDialog.vue` | `layout/login/components/FaceLoginDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, failBack, handleClose, handleTracked, handler, onMounted |
| 79 | `layout/login/components/FaceLoginDialog.vue` | `layout/login/components/FaceLoginDialog.vue` | Vuex actions not found in any Pinia store: user/faceLogin |
| 80 | `layout/login/components/ThirdLogin.vue` | `layout/login/components/ThirdLogin.vue` | Vue2 lifecycle hooks not found in Vue3: cropWechatLogin, data, dingLogin, faceLogin, wechatLogin |
| 80 | `layout/login/components/ThirdLogin.vue` | `layout/login/components/ThirdLogin.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (3) |
| 81 | `layout/login/Login.vue` | `layout/login/Login.vue` | Vue2 lifecycle hooks not found in Vue3: accountLogin, created, data, mobileLogin, mounted, showH5Code, showMpCode, toForgot, toReg, onMounted |
| 81 | `layout/login/Login.vue` | `layout/login/Login.vue` | Vuex actions not found in any Pinia store: user/login |
| 82 | `layout/login/LoginForgot.vue` | `layout/login/LoginForgot.vue` | Vue2 lifecycle hooks not found in Vue3: data, handleReset, toLogin, toReg |
| 82 | `layout/login/LoginForgot.vue` | `layout/login/LoginForgot.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (3) |
| 83 | `layout/login/LoginLayout.vue` | `layout/login/LoginLayout.vue` | Vue2 lifecycle hooks not found in Vue3: data, isActive |
| 83 | `layout/login/LoginLayout.vue` | `layout/login/LoginLayout.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (0) |
| 84 | `layout/login/LoginRegister.vue` | `layout/login/LoginRegister.vue` | Vue2 lifecycle hooks not found in Vue3: data, handleReg, toLogin |
| 84 | `layout/login/LoginRegister.vue` | `layout/login/LoginRegister.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (1) |
| 84 | `layout/login/LoginRegister.vue` | `layout/login/LoginRegister.vue` | Vuex actions not found in any Pinia store: user/reg |
| 85 | `layout/login/sync.vue` | `layout/login/sync.vue` | Vue2 lifecycle hooks not found in Vue3: created, onMounted |
| 85 | `layout/login/sync.vue` | `layout/login/sync.vue` | Vuex actions not found in any Pinia store: user/sync |
| 86 | `layout/profile/components/Account.vue` | `layout/profile/components/Account.vue` | Vue2 lifecycle hooks not found in Vue3: logout, submit |
| 87 | `layout/profile/components/UserCard.vue` | `layout/profile/components/UserCard.vue` | Vue2 lifecycle hooks not found in Vue3: formatRole |
| 87 | `layout/profile/components/UserCard.vue` | `layout/profile/components/UserCard.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 88 | `layout/profile/Profile.vue` | `layout/profile/Profile.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, getUser, onMounted |
| 88 | `layout/profile/Profile.vue` | `layout/profile/Profile.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 89 | `layout/Redirect.vue` | `layout/Redirect.vue` | Vue2 lifecycle hooks not found in Vue3: created, onMounted |
| 90 | `layout/Web/UserBanner.vue` | `layout/Web/UserBanner.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleUserInfo, onMounted |
| 91 | `layout/Web/UserLayout.vue` | `layout/Web/UserLayout.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, onMounted |
| 92 | `layout/Web/WebHeader.vue` | `layout/Web/WebHeader.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, focusMenu, handleCommand, handler, isActive, isInIframe, logout, msgClick, toAdmin, onMounted |
| 92 | `layout/Web/WebHeader.vue` | `layout/Web/WebHeader.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (3) |
| 93 | `views/admin/ai/sparring/components/AiSparringChatPanel.vue` | `views/admin/ai/sparring/components/AiSparringChatPanel.vue` | Vue2 lifecycle hooks not found in Vue3: abortStream, clearChat, convertMarkdownToText, data, handler, initWelcomeMessage, scrollToBottom, sendMessage, stopStream, streamChat |
| 93 | `views/admin/ai/sparring/components/AiSparringChatPanel.vue` | `views/admin/ai/sparring/components/AiSparringChatPanel.vue` | Condition branch count differs: Vue2 (11) vs Vue3 (12) |
| 94 | `views/admin/ai/sparring/components/AiSparringFormDialog.vue` | `views/admin/ai/sparring/components/AiSparringFormDialog.vue` | Vue2 lifecycle hooks not found in Vue3: clearValidate, handleChatPanelInit, handleOptimizeEvalCriteria, handleOptimizeRequirement, validate |
| 95 | `views/admin/ai/sparring/index.vue` | `views/admin/ai/sparring/index.vue` | Vue2 lifecycle hooks not found in Vue3: abortStream, activated, data, dialogTitle, dialogVisible, handleAdd, handleCopy, handleDialogClose, handleEdit, handleView, initWelcomeMessage, onActivated |
| 95 | `views/admin/ai/sparring/index.vue` | `views/admin/ai/sparring/index.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (11) |
| 96 | `views/admin/course/components/File/AdminMultiAddCourseFileDialog.vue` | `views/admin/course/components/File/AdminMultiAddCourseFileDialog.vue` | API calls differ between Vue2 and Vue3 |
| 96 | `views/admin/course/components/File/AdminMultiAddCourseFileDialog.vue` | `views/admin/course/components/File/AdminMultiAddCourseFileDialog.vue` | Vue2 lifecycle hooks not found in Vue3: applyBatchCategory, askToCreateCourse, batchSaveFiles, beforeDestroy, buildDirListFromFiles, catName, cleanupAndClose, cleanupUnsavedFiles, created, data, deleteFile, fileDeleted, fileSelected, fileSuccess, handleClose, handleSave, handleSelectionChange, isSaveDisabled, onProgress, onTitleChange, precheckExistenceAgainstBackend, resetForm, sortConflictFilesToTop, visible, onUnmounted, onBeforeUnmount, onMounted |
| 96 | `views/admin/course/components/File/AdminMultiAddCourseFileDialog.vue` | `views/admin/course/components/File/AdminMultiAddCourseFileDialog.vue` | Condition branch count differs: Vue2 (25) vs Vue3 (20) |
| 97 | `views/admin/course/components/File/AiPptGenerator.vue` | `views/admin/course/components/File/AiPptGenerator.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, buildBridgeContext, clearRetry, data, fetchPexelsConfig, getPptistOrigin, getSessionJson, handleClose, handleGeneratedPpt, handleMessage, isValidOrigin, onIframeLoad, processPptFile, sendMessageToIframe, startRetrySendOssEnv, visible, onUnmounted, onBeforeUnmount |
| 97 | `views/admin/course/components/File/AiPptGenerator.vue` | `views/admin/course/components/File/AiPptGenerator.vue` | Condition branch count differs: Vue2 (14) vs Vue3 (16) |
| 98 | `views/admin/course/components/File/components/BatchOperationBar.vue` | `views/admin/course/components/File/components/BatchOperationBar.vue` | Vue2 lifecycle hooks not found in Vue3: onBatchDelete, onCancel, onSave |
| 99 | `views/admin/course/components/File/components/BatchSettingDialog.vue` | `views/admin/course/components/File/components/BatchSettingDialog.vue` | Vue2 lifecycle hooks not found in Vue3: data, handleConfirm, resetForm |
| 100 | `views/admin/course/components/File/components/DirImportDialog.vue` | `views/admin/course/components/File/components/DirImportDialog.vue` | Vue2 lifecycle hooks not found in Vue3: data, handleImport, resetForm |
| 101 | `views/admin/course/components/File/components/DirTreeNode.vue` | `views/admin/course/components/File/components/DirTreeNode.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (9) |
| 102 | `views/admin/course/components/File/components/FileTableEditor.vue` | `views/admin/course/components/File/components/FileTableEditor.vue` | API calls differ between Vue2 and Vue3 |
| 102 | `views/admin/course/components/File/components/FileTableEditor.vue` | `views/admin/course/components/File/components/FileTableEditor.vue` | Vue2 lifecycle hooks not found in Vue3: hasAnyConflict, onCatChange, onDeleteFile, onDurationChange, onSelectionChange, onVideoLoaded, startEditing, stopEditing, tableRenderKey, tableRowClassName, toggleRowSelection |
| 102 | `views/admin/course/components/File/components/FileTableEditor.vue` | `views/admin/course/components/File/components/FileTableEditor.vue` | Condition branch count differs: Vue2 (6) vs Vue3 (16) |
| 103 | `views/admin/course/components/File/components/FileUploadManager.vue` | `views/admin/course/components/File/components/FileUploadManager.vue` | Vue2 lifecycle hooks not found in Vue3: applyBatchCategory, cancelAllUploads, data, get, getOssComponent, handleRemove, onCatalogManagerClose, onFileDelete, onFileProgress, onFileSelect, onFileSuccess, openCatalogManager, set |
| 103 | `views/admin/course/components/File/components/FileUploadManager.vue` | `views/admin/course/components/File/components/FileUploadManager.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (0) |
| 104 | `views/admin/course/components/File/DirList.vue` | `views/admin/course/components/File/DirList.vue` | Vue2 lifecycle hooks not found in Vue3: allowDrop, batchDialog, closePreview, confirmBatch, createDir, created, data, handleDrop, handleImport, handleLocalUpload, handleLocalUploadFinish, handleOnlineSelect, handleOnlineSelectResult, handlePreview, handler, importCat, removeDir, removeFileByIndex, removeFileFromTree, showDirActions, sortDownDir, sortDownFile, sortUpDir, sortUpFile, syncFileUrl, onMounted |
| 104 | `views/admin/course/components/File/DirList.vue` | `views/admin/course/components/File/DirList.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (24) |
| 105 | `views/admin/course/components/File/ShareCourseDialog.vue` | `views/admin/course/components/File/ShareCourseDialog.vue` | Vue2 lifecycle hooks not found in Vue3: buildUrl, copy, created, data, fetchCourse, goCourse, handleClose, handleSend, handler, saveToImage, onMounted |
| 105 | `views/admin/course/components/File/ShareCourseDialog.vue` | `views/admin/course/components/File/ShareCourseDialog.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (13) |
| 106 | `views/admin/course/components/Live/LiveList.vue` | `views/admin/course/components/Live/LiveList.vue` | Vue2 lifecycle hooks not found in Vue3: closeView, copy, createLive, created, data, handleGen, handleSave, handler, previewLive, removeLive, showLive, onMounted |
| 106 | `views/admin/course/components/Live/LiveList.vue` | `views/admin/course/components/Live/LiveList.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (6) |
| 107 | `views/admin/course/components/Qa/CourseQaDialog.vue` | `views/admin/course/components/Qa/CourseQaDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, formatContent, handleClose, handlePreview, handleSave, handler, onMounted |
| 107 | `views/admin/course/components/Qa/CourseQaDialog.vue` | `views/admin/course/components/Qa/CourseQaDialog.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (4) |
| 108 | `views/admin/course/components/Qa/QuList.vue` | `views/admin/course/components/Qa/QuList.vue` | Vue2 lifecycle hooks not found in Vue3: data, fileList, toUpdate |
| 108 | `views/admin/course/components/Qa/QuList.vue` | `views/admin/course/components/Qa/QuList.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 109 | `views/admin/course/components/Start/CourseFileLearnPaging/CourseCaptureList.vue` | `views/admin/course/components/Start/CourseFileLearnPaging/CourseCaptureList.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handler, load, onMounted |
| 109 | `views/admin/course/components/Start/CourseFileLearnPaging/CourseCaptureList.vue` | `views/admin/course/components/Start/CourseFileLearnPaging/CourseCaptureList.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (1) |
| 110 | `views/admin/course/components/Start/CourseFileLearnPaging/CourseFaceList.vue` | `views/admin/course/components/Start/CourseFileLearnPaging/CourseFaceList.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handler, load, onMounted |
| 111 | `views/admin/course/components/Start/CourseFileLearnPaging/CourseFileLearnPaging.vue` | `views/admin/course/components/Start/CourseFileLearnPaging/CourseFileLearnPaging.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handler, showCapture, showDaily, showFace, onMounted |
| 112 | `views/admin/course/components/Start/CourseFileLearnPaging/LearnDailyPaging.vue` | `views/admin/course/components/Start/CourseFileLearnPaging/LearnDailyPaging.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handler, onMounted |
| 113 | `views/admin/course/components/Start/FileStatPaging.vue` | `views/admin/course/components/Start/FileStatPaging.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleExport, onMounted |
| 114 | `views/admin/course/components/Start/LearnStatPaging.vue` | `views/admin/course/components/Start/LearnStatPaging.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, goToPlanDetail, handleExport, handleModeChange, learnMode, showDetail, onMounted |
| 115 | `views/admin/course/file.vue` | `views/admin/course/file.vue` | API calls differ between Vue2 and Vue3 |
| 115 | `views/admin/course/file.vue` | `views/admin/course/file.vue` | Vue2 lifecycle hooks not found in Vue3: activated, aiSourceUrl, closePreview, created, currentCatName, data, fileDeleted, fileSelected, getAiPptGeneratorResult, handleAdd, handleCreateCourseFromFiles, handleEdit, handleFetchInfo, handleMultiActions, handlePreview, handleSave, handleTableReset, handler, mapToFilePreviewType, onDialogClose, openRefDialog, refresh, showAiPptGenerator, showBailianFileIdField, videoLoaded, onActivated, onMounted |
| 115 | `views/admin/course/file.vue` | `views/admin/course/file.vue` | Condition branch count differs: Vue2 (31) vs Vue3 (9) |
| 116 | `views/admin/course/form.vue` | `views/admin/course/form.vue` | Vue2 lifecycle hooks not found in Vue3: applyRelayFromFile, autoSelectCurrentLecturer, checkRulesChanged, countFiles, created, currentCheckRules, data, fetchData, fetchImpactedPlans, navigateToCourseList, onCancel, onImpactConfirmKnown, onJumpImpactedPlan, scheduleImpactCheck, searchTeacher, submitForm, onMounted |
| 116 | `views/admin/course/form.vue` | `views/admin/course/form.vue` | Condition branch count differs: Vue2 (28) vs Vue3 (10) |
| 116 | `views/admin/course/form.vue` | `views/admin/course/form.vue` | Vuex actions not found in any Pinia store: tagsView/delView |
| 117 | `views/admin/course/index.vue` | `views/admin/course/index.vue` | Vue2 lifecycle hooks not found in Vue3: activated, data, handleBatchLecturer, handleLecturerSelect, handleMultiActions, handleTableReset, openRefDialog, showShare, onActivated |
| 118 | `views/admin/course/qa.vue` | `views/admin/course/qa.vue` | Vue2 lifecycle hooks not found in Vue3: data, refreshTable, showReply |
| 119 | `views/admin/course/stat/components/CourseAssignLearnDetail.vue` | `views/admin/course/stat/components/CourseAssignLearnDetail.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handleCurrentChange, handleExport, handleSizeChange, handler, onMounted |
| 119 | `views/admin/course/stat/components/CourseAssignLearnDetail.vue` | `views/admin/course/stat/components/CourseAssignLearnDetail.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (2) |
| 120 | `views/admin/course/stat/components/CourseStatInfoDetail.vue` | `views/admin/course/stat/components/CourseStatInfoDetail.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handleCurrentChange, handleExport, handleSizeChange, handler, onMounted |
| 120 | `views/admin/course/stat/components/CourseStatInfoDetail.vue` | `views/admin/course/stat/components/CourseStatInfoDetail.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 121 | `views/admin/course/stat/result.vue` | `views/admin/course/stat/result.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, onMounted |
| 121 | `views/admin/course/stat/result.vue` | `views/admin/course/stat/result.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 122 | `views/admin/course/stat.vue` | `views/admin/course/stat.vue` | Vue2 lifecycle hooks not found in Vue3: created, currentStatData, data, fetchData, handleStatModeChange, transformStatData, onMounted |
| 123 | `views/admin/course/statfull.vue` | `views/admin/course/statfull.vue` | Vue2 lifecycle hooks not found in Vue3: courseSelected, created, data, generateStat, handler, removeAll, removeCourse, resetStat, showCourseDialog, onMounted |
| 123 | `views/admin/course/statfull.vue` | `views/admin/course/statfull.vue` | Condition branch count differs: Vue2 (9) vs Vue3 (7) |
| 124 | `views/admin/dashboard/components/CardCourseList.vue` | `views/admin/dashboard/components/CardCourseList.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, onMounted |
| 125 | `views/admin/dashboard/components/CardExamList.vue` | `views/admin/dashboard/components/CardExamList.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, onMounted |
| 126 | `views/admin/dashboard/components/CardNoticeList.vue` | `views/admin/dashboard/components/CardNoticeList.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handler, toDetail, onMounted |
| 127 | `views/admin/dashboard/components/CardQuickOpt.vue` | `views/admin/dashboard/components/CardQuickOpt.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, mounted, navToActivity, navToAddCourse, navToAddExam, navToAiGen, navToBattle, navToCertList, navToNotice, navToRepoList, onMounted |
| 128 | `views/admin/dashboard/components/CardStatNums.vue` | `views/admin/dashboard/components/CardStatNums.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, onMounted |
| 129 | `views/admin/dashboard/components/LineChartCourse.vue` | `views/admin/dashboard/components/LineChartCourse.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, data, initChart, mounted, parseData, onUnmounted, onBeforeUnmount, onMounted |
| 130 | `views/admin/dashboard/components/LineChartExam.vue` | `views/admin/dashboard/components/LineChartExam.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, data, initChart, mounted, parseData, onUnmounted, onBeforeUnmount, onMounted |
| 131 | `views/admin/dashboard/components/LineChartUser.vue` | `views/admin/dashboard/components/LineChartUser.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, data, initChart, mounted, parseData, onUnmounted, onBeforeUnmount, onMounted |
| 131 | `views/admin/dashboard/components/LineChartUser.vue` | `views/admin/dashboard/components/LineChartUser.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (3) |
| 132 | `views/admin/dashboard/components/NoticeViewDialog.vue` | `views/admin/dashboard/components/NoticeViewDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchDetail, formatContent, handleClose, handler, onMounted |
| 132 | `views/admin/dashboard/components/NoticeViewDialog.vue` | `views/admin/dashboard/components/NoticeViewDialog.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (0) |
| 133 | `views/admin/dashboard/index.vue` | `views/admin/dashboard/index.vue` | Vue2 lifecycle hooks not found in Vue3: changeNotice, data |
| 134 | `views/admin/exam/exam/components/PointsRule.vue` | `views/admin/exam/exam/components/PointsRule.vue` | Vue2 lifecycle hooks not found in Vue3: add, created, data, handler, remove, onMounted |
| 135 | `views/admin/exam/exam/components/ReviewSettings.vue` | `views/admin/exam/exam/components/ReviewSettings.vue` | Vue2 lifecycle hooks not found in Vue3: clearAllUser, created, data, fetchGroupList, fetchQuList, fillData, handler, mergeRules, removeUser, showAddUser, syncExcludes, userSelected, onMounted |
| 135 | `views/admin/exam/exam/components/ReviewSettings.vue` | `views/admin/exam/exam/components/ReviewSettings.vue` | Condition branch count differs: Vue2 (21) vs Vue3 (16) |
| 136 | `views/admin/exam/exam/components/ShareExamDialog.vue` | `views/admin/exam/exam/components/ShareExamDialog.vue` | Vue2 lifecycle hooks not found in Vue3: buildUrl, copy, created, data, fetchExam, goExam, handleClose, handleSend, handler, saveToImage, onMounted |
| 136 | `views/admin/exam/exam/components/ShareExamDialog.vue` | `views/admin/exam/exam/components/ShareExamDialog.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (9) |
| 137 | `views/admin/exam/exam/components/WatchSettings.vue` | `views/admin/exam/exam/components/WatchSettings.vue` | Vue2 lifecycle hooks not found in Vue3: clearAllUser, created, data, fillData, genExecutes, handler, removeUser, showAddUser, userSelected, onMounted |
| 138 | `views/admin/exam/exam/form.vue` | `views/admin/exam/exam/form.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, endTime, fetchData, handleBack, handleCancelFromTmpl, handleConfirmCreateExam, handleCreate, handleSaveExam, submitForm, switchType, onMounted |
| 138 | `views/admin/exam/exam/form.vue` | `views/admin/exam/exam/form.vue` | Condition branch count differs: Vue2 (18) vs Vue3 (11) |
| 138 | `views/admin/exam/exam/form.vue` | `views/admin/exam/exam/form.vue` | Vuex actions not found in any Pinia store: tagsView/delView |
| 139 | `views/admin/exam/exam/index.vue` | `views/admin/exam/exam/index.vue` | Vue2 lifecycle hooks not found in Vue3: activated, data, doFinish, getStateTagType, handleCopy, handleFinish, handleTableReset, openRefDialog, pauseExam, publishExam, refreshList, showShare, toCorrect, toQu, toRecord, toReview, onActivated |
| 139 | `views/admin/exam/exam/index.vue` | `views/admin/exam/exam/index.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (1) |
| 140 | `views/admin/exam/exam/qu/components/QuCorrectDialog.vue` | `views/admin/exam/exam/qu/components/QuCorrectDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleAssociateChange, handleClose, handler, quContent, showQuDetail, onMounted |
| 140 | `views/admin/exam/exam/qu/components/QuCorrectDialog.vue` | `views/admin/exam/exam/qu/components/QuCorrectDialog.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (4) |
| 141 | `views/admin/exam/exam/qu/components/QuItemCorrect.vue` | `views/admin/exam/exam/qu/components/QuItemCorrect.vue` | Vue2 lifecycle hooks not found in Vue3: answerChange, checkScore, created, data, fillValue, handleAdd, handleAiApply, handleSave, handler, initValue, mounted, onMounted |
| 142 | `views/admin/exam/exam/qu/correct.vue` | `views/admin/exam/exam/qu/correct.vue` | Vue2 lifecycle hooks not found in Vue3: activated, created, data, dialogVisible, handleBack, showDialog, viewQu, onActivated, onMounted |
| 142 | `views/admin/exam/exam/qu/correct.vue` | `views/admin/exam/exam/qu/correct.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (0) |
| 143 | `views/admin/exam/exam/record/components/ExamRecord.vue` | `views/admin/exam/exam/record/components/ExamRecord.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, deletePaper, handleShowPaper, handler, previewList, saveMarkAs, showMarkAs, showPaper, showVideo, onMounted |
| 143 | `views/admin/exam/exam/record/components/ExamRecord.vue` | `views/admin/exam/exam/record/components/ExamRecord.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (4) |
| 144 | `views/admin/exam/exam/record/list.vue` | `views/admin/exam/exam/record/list.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchStat, handleExport, handleExportPdf, handleExportZip, handleSelected, handler, reload, scoreChange, showPaper, onMounted |
| 144 | `views/admin/exam/exam/record/list.vue` | `views/admin/exam/exam/record/list.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (3) |
| 145 | `views/admin/exam/exam/wrong/detail.vue` | `views/admin/exam/exam/wrong/detail.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchDetail, viewType, onMounted |
| 146 | `views/admin/exam/exam/wrong/index.vue` | `views/admin/exam/exam/wrong/index.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleExport, toWrongDetail, viewQu, onMounted |
| 147 | `views/admin/exam/offline/index.vue` | `views/admin/exam/offline/index.vue` | Vue2 lifecycle hooks not found in Vue3: activated, data, formatState, handleSave, importSuccess, showAdd, showImport, showRecords, showUpdate, onActivated |
| 148 | `views/admin/exam/offline/records.vue` | `views/admin/exam/offline/records.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleSave, importSuccess, showUpdate, onMounted |
| 148 | `views/admin/exam/offline/records.vue` | `views/admin/exam/offline/records.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (0) |
| 149 | `views/admin/exam/review/audit.vue` | `views/admin/exam/review/audit.vue` | API calls differ between Vue2 and Vue3 |
| 149 | `views/admin/exam/review/audit.vue` | `views/admin/exam/review/audit.vue` | Vue2 lifecycle hooks not found in Vue3: backToList, beforeDestroy, created, data, fetchData, filteredGroupList, goAnchor, handleNext, handleScroll, handler, mounted, submitForm, onUnmounted, onBeforeUnmount, onMounted |
| 149 | `views/admin/exam/review/audit.vue` | `views/admin/exam/review/audit.vue` | Condition branch count differs: Vue2 (18) vs Vue3 (9) |
| 150 | `views/admin/exam/review/components/AdminPreview.vue` | `views/admin/exam/review/components/AdminPreview.vue` | Vue2 lifecycle hooks not found in Vue3: activated, data, doInit, handleEnd, handleReInit, handleStart, showError, toProgress, onActivated |
| 151 | `views/admin/exam/review/components/FreePreview.vue` | `views/admin/exam/review/components/FreePreview.vue` | Vue2 lifecycle hooks not found in Vue3: activated, data, toMatchList, onActivated |
| 152 | `views/admin/exam/review/components/MatchDialog.vue` | `views/admin/exam/review/components/MatchDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handReject, handleClose, handleDetail, handler, onMounted |
| 152 | `views/admin/exam/review/components/MatchDialog.vue` | `views/admin/exam/review/components/MatchDialog.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 153 | `views/admin/exam/review/components/QuestionReviewCard.vue` | `views/admin/exam/review/components/QuestionReviewCard.vue` | Vue2 lifecycle hooks not found in Vue3: handleCheck, handleReasonChange, handleScoreChange |
| 154 | `views/admin/exam/review/components/RequirePreview.vue` | `views/admin/exam/review/components/RequirePreview.vue` | Vue2 lifecycle hooks not found in Vue3: activated, data, toMatchList, onActivated |
| 155 | `views/admin/exam/review/components/ReviewAuditDialog.vue` | `views/admin/exam/review/components/ReviewAuditDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleAudit, handleClose, handler, onMounted |
| 156 | `views/admin/exam/review/components/ReviewSettleDialog.vue` | `views/admin/exam/review/components/ReviewSettleDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handleSettle, handler, onMounted |
| 157 | `views/admin/exam/review/detail.vue` | `views/admin/exam/review/detail.vue` | Vue2 lifecycle hooks not found in Vue3: backToList, checkAnswer, created, data, fetchData, handleNext, handleReasonChange, handleScoreChange, handler, submitForm, onMounted |
| 157 | `views/admin/exam/review/detail.vue` | `views/admin/exam/review/detail.vue` | Condition branch count differs: Vue2 (7) vs Vue3 (6) |
| 158 | `views/admin/exam/review/index.vue` | `views/admin/exam/review/index.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handler, toMatchList, toOverviewList, onMounted |
| 158 | `views/admin/exam/review/index.vue` | `views/admin/exam/review/index.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (3) |
| 159 | `views/admin/exam/review/match.vue` | `views/admin/exam/review/match.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, toDetail, toFlow, onMounted |
| 160 | `views/admin/exam/review/papers.vue` | `views/admin/exam/review/papers.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleActions, handleAuditAll, handleSettleAll, reloadGrid, showDetail, showReviewers, onMounted |
| 161 | `views/admin/exam/stat/components/ExamStatDeptScore.vue` | `views/admin/exam/stat/components/ExamStatDeptScore.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handleExport, handler, onMounted |
| 162 | `views/admin/exam/stat/components/ExamStatGroupScore.vue` | `views/admin/exam/stat/components/ExamStatGroupScore.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handleExport, handler, onMounted |
| 163 | `views/admin/exam/stat/components/ExamStatInfoDetail.vue` | `views/admin/exam/stat/components/ExamStatInfoDetail.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handleCurrentChange, handleExport, handleSizeChange, handler, onMounted |
| 164 | `views/admin/exam/stat/components/ExamStatRangeScore.vue` | `views/admin/exam/stat/components/ExamStatRangeScore.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handleExport, handler, initChart, onMounted |
| 165 | `views/admin/exam/stat/components/ExamStatTotalScore.vue` | `views/admin/exam/stat/components/ExamStatTotalScore.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handleExport, handler, onMounted |
| 166 | `views/admin/exam/stat/index.vue` | `views/admin/exam/stat/index.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, examSelected, generateStat, handler, removeAll, removeExam, resetStat, showExamDialog, onMounted |
| 167 | `views/admin/exam/stat/result.vue` | `views/admin/exam/stat/result.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, onMounted |
| 167 | `views/admin/exam/stat/result.vue` | `views/admin/exam/stat/result.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 168 | `views/admin/exam/watch/components/ForceHandDialog.vue` | `views/admin/exam/watch/components/ForceHandDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, doHand, handleClose, handler, onMounted |
| 169 | `views/admin/exam/watch/components/WatchApply.vue` | `views/admin/exam/watch/components/WatchApply.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handAudit, handleActions, showMsg, onMounted |
| 170 | `views/admin/exam/watch/components/WatchFrame.vue` | `views/admin/exam/watch/components/WatchFrame.vue` | Vue2 lifecycle hooks not found in Vue3: batchDialog, beforeDestroy, created, data, fetchStat, handDialog, handleRefresh, handler, queryChange, showHandAll, showHandler, singleDialog, onUnmounted, onBeforeUnmount, onMounted |
| 170 | `views/admin/exam/watch/components/WatchFrame.vue` | `views/admin/exam/watch/components/WatchFrame.vue` | Condition branch count differs: Vue2 (10) vs Vue3 (11) |
| 171 | `views/admin/exam/watch/components/WatchHand.vue` | `views/admin/exam/watch/components/WatchHand.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleReview, handleView, showMsg, onMounted |
| 171 | `views/admin/exam/watch/components/WatchHand.vue` | `views/admin/exam/watch/components/WatchHand.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (0) |
| 172 | `views/admin/exam/watch/components/WatchProcess.vue` | `views/admin/exam/watch/components/WatchProcess.vue` | Vue2 lifecycle hooks not found in Vue3: syncStat |
| 173 | `views/admin/exam/watch/detail.vue` | `views/admin/exam/watch/detail.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, clearTimer, created, data, fetchDetail, fetchStat, handler, initTimer, syncStat, onUnmounted, onBeforeUnmount, onMounted |
| 173 | `views/admin/exam/watch/detail.vue` | `views/admin/exam/watch/detail.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (6) |
| 174 | `views/admin/exam/watch/index.vue` | `views/admin/exam/watch/index.vue` | Vue2 lifecycle hooks not found in Vue3: activated, data, showShare, onActivated |
| 175 | `views/admin/notify/components/EmailConfig.vue` | `views/admin/notify/components/EmailConfig.vue` | Vue2 lifecycle hooks not found in Vue3: changProvider, created, data, fetchData, handler, submitForm, onMounted |
| 175 | `views/admin/notify/components/EmailConfig.vue` | `views/admin/notify/components/EmailConfig.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (2) |
| 176 | `views/admin/notify/components/MsgRead.vue` | `views/admin/notify/components/MsgRead.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handler, stateFormat, onMounted |
| 177 | `views/admin/notify/components/SendMsgDialog.vue` | `views/admin/notify/components/SendMsgDialog.vue` | Vue2 lifecycle hooks not found in Vue3: clearUser, created, data, fetchTmpl, handleClose, handleSave, handler, removeUser, userSelected, onMounted |
| 177 | `views/admin/notify/components/SendMsgDialog.vue` | `views/admin/notify/components/SendMsgDialog.vue` | Condition branch count differs: Vue2 (6) vs Vue3 (9) |
| 178 | `views/admin/notify/components/SmsConfig.vue` | `views/admin/notify/components/SmsConfig.vue` | Vue2 lifecycle hooks not found in Vue3: changProvider, created, data, fetchData, handler, submitForm, onMounted |
| 178 | `views/admin/notify/components/SmsConfig.vue` | `views/admin/notify/components/SmsConfig.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (2) |
| 179 | `views/admin/notify/components/TestMsgDialog.vue` | `views/admin/notify/components/TestMsgDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchTmpl, handleClose, handleSave, handler, userSelected, onMounted |
| 179 | `views/admin/notify/components/TestMsgDialog.vue` | `views/admin/notify/components/TestMsgDialog.vue` | Condition branch count differs: Vue2 (6) vs Vue3 (8) |
| 180 | `views/admin/notify/config.vue` | `views/admin/notify/config.vue` | Vue2 lifecycle hooks not found in Vue3: data |
| 181 | `views/admin/notify/im.vue` | `views/admin/notify/im.vue` | Vue2 lifecycle hooks not found in Vue3: data, formatContent, formatTime, hasUnresolvedPlaceholder, refresh, showDetail, tableActions |
| 181 | `views/admin/notify/im.vue` | `views/admin/notify/im.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (1) |
| 181 | `views/admin/notify/im.vue` | `views/admin/notify/im.vue` | Vuex actions not found in any Pinia store: user/fetchMsg |
| 182 | `views/admin/notify/msg.vue` | `views/admin/notify/msg.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, created, data, handleAdd, handleMultiActions, handler, reSend, refresh, showDetail, stateFormat, onUnmounted, onBeforeUnmount, onMounted |
| 182 | `views/admin/notify/msg.vue` | `views/admin/notify/msg.vue` | Condition branch count differs: Vue2 (7) vs Vue3 (6) |
| 183 | `views/admin/notify/tmpl.vue` | `views/admin/notify/tmpl.vue` | Vue2 lifecycle hooks not found in Vue3: addProp, created, data, doSave, handleCreate, handleDelete, handleSave, handleUpdate, onButtonFieldChange, removeProp, testSend, validateButtonName, validateJumpUrl, onMounted |
| 183 | `views/admin/notify/tmpl.vue` | `views/admin/notify/tmpl.vue` | Condition branch count differs: Vue2 (9) vs Vue3 (4) |
| 184 | `views/admin/paper/paper/detail.vue` | `views/admin/paper/paper/detail.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, checkAnswer, created, data, fetchData, goAnchor, handleScroll, handler, handlerShow, mounted, submitForm, userAnswer, onUnmounted, onBeforeUnmount, onMounted |
| 184 | `views/admin/paper/paper/detail.vue` | `views/admin/paper/paper/detail.vue` | Condition branch count differs: Vue2 (8) vs Vue3 (13) |
| 185 | `views/admin/plan/plan/components/components/PlanGroup.vue` | `views/admin/plan/plan/components/components/PlanGroup.vue` | Vue2 lifecycle hooks not found in Vue3: data, group, hasNodeError, onAddNode |
| 186 | `views/admin/plan/plan/components/components/PlanNode.vue` | `views/admin/plan/plan/components/components/PlanNode.vue` | Vue2 lifecycle hooks not found in Vue3: data, node |
| 187 | `views/admin/plan/plan/components/NodeNotifyDialog.vue` | `views/admin/plan/plan/components/NodeNotifyDialog.vue` | Vue2 lifecycle hooks not found in Vue3: data, dialogTitle, disabledDate, handleClose, handleSend, nodeId, nodeTypeTagType, nodeTypeText, pickerOptions, visible |
| 188 | `views/admin/plan/plan/components/PlanFlowLine.vue` | `views/admin/plan/plan/components/PlanFlowLine.vue` | Vue2 lifecycle hooks not found in Vue3: addGroup |
| 189 | `views/admin/plan/plan/components/PlanNotifyDialog.vue` | `views/admin/plan/plan/components/PlanNotifyDialog.vue` | Vue2 lifecycle hooks not found in Vue3: copyLink, created, data, fetchPlan, goExam, handleClose, handleSend, loadNotifyUsers, planId, visible, onMounted |
| 189 | `views/admin/plan/plan/components/PlanNotifyDialog.vue` | `views/admin/plan/plan/components/PlanNotifyDialog.vue` | Condition branch count differs: Vue2 (8) vs Vue3 (7) |
| 190 | `views/admin/plan/plan/form.vue` | `views/admin/plan/plan/form.vue` | Vue2 lifecycle hooks not found in Vue3: appendCourseNode, appendExamNode, applyRelayFromPrev, created, data, disabledDate, fetchData, handleSave, pickerOptions, validateCheckRules, validateTimeRange, onMounted |
| 190 | `views/admin/plan/plan/form.vue` | `views/admin/plan/plan/form.vue` | Condition branch count differs: Vue2 (40) vs Vue3 (22) |
| 191 | `views/admin/plan/plan/index.vue` | `views/admin/plan/plan/index.vue` | Vue2 lifecycle hooks not found in Vue3: activated, canPause, data, getStateTag, getStateTagType, handleCopy, handleTableReset, isPlanEnded, refreshList, showNotify, updatePlanState, onActivated |
| 191 | `views/admin/plan/plan/index.vue` | `views/admin/plan/plan/index.vue` | Condition branch count differs: Vue2 (6) vs Vue3 (1) |
| 192 | `views/admin/plan/plan/PlanDesign.vue` | `views/admin/plan/plan/PlanDesign.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleCheckRulesConfirm, handleDurationConfirm, handleNodeSelected, handler, hasError, openCheckRulesDialog, openDurationDialog, setError, onMounted |
| 193 | `views/admin/plan/stat/components/ExtendMakeupDrawer.vue` | `views/admin/plan/stat/components/ExtendMakeupDrawer.vue` | Vue2 lifecycle hooks not found in Vue3: baseTimeMs, created, data, extendUserIds, extendUsers, formatDateTime, handleClose, handleSelectedChange, handleSubmit, isAllExtendSelected, isAllSelected, loadMakeupPreview, minDeadlineMs, pickerOptions, selectableUsers, syncNewDeadline, toggleAllExtendUsers, toggleAllUsers, visible, onMounted |
| 193 | `views/admin/plan/stat/components/ExtendMakeupDrawer.vue` | `views/admin/plan/stat/components/ExtendMakeupDrawer.vue` | Condition branch count differs: Vue2 (22) vs Vue3 (7) |
| 194 | `views/admin/plan/stat/components/PlanNodeView.vue` | `views/admin/plan/stat/components/PlanNodeView.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, flexWidth, handleExport, handleSelected, handler, isNodeExtendedFinish, isNodeOverdue, openExamDetail, onMounted |
| 194 | `views/admin/plan/stat/components/PlanNodeView.vue` | `views/admin/plan/stat/components/PlanNodeView.vue` | Condition branch count differs: Vue2 (6) vs Vue3 (2) |
| 195 | `views/admin/plan/stat/components/PlanStatTotal.vue` | `views/admin/plan/stat/components/PlanStatTotal.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, deptCode, fetchStat, onMounted |
| 195 | `views/admin/plan/stat/components/PlanStatTotal.vue` | `views/admin/plan/stat/components/PlanStatTotal.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (2) |
| 196 | `views/admin/plan/stat/components/PlanTotalView.vue` | `views/admin/plan/stat/components/PlanTotalView.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, deptCode, fetchDetail, formatNodeType, goToCourseStat, onMounted |
| 197 | `views/admin/plan/stat/components/PlanUserList.vue` | `views/admin/plan/stat/components/PlanUserList.vue` | Vue2 lifecycle hooks not found in Vue3: activated, created, data, handleExport, handleExtend, handleExtendSuccess, handleMakeup, handleOneKeyExtend, handleSelectChanged, isPlanEnded, isRowOverdue, loadIncompleteUsers, refreshList, showIncompleteTip, onActivated, onMounted |
| 197 | `views/admin/plan/stat/components/PlanUserList.vue` | `views/admin/plan/stat/components/PlanUserList.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (0) |
| 198 | `views/admin/plan/stat/process.vue` | `views/admin/plan/stat/process.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, groupChange, handleDetail, nodeChange, onMounted |
| 198 | `views/admin/plan/stat/process.vue` | `views/admin/plan/stat/process.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 199 | `views/admin/repo/form.vue` | `views/admin/repo/form.vue` | Vue2 lifecycle hooks not found in Vue3: addChapter, created, data, fetchData, handleAdd, initSort, mounted, onCancel, onEnd, removeChapter, submitForm, onMounted |
| 199 | `views/admin/repo/form.vue` | `views/admin/repo/form.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (4) |
| 199 | `views/admin/repo/form.vue` | `views/admin/repo/form.vue` | Vuex actions not found in any Pinia store: tagsView/delView |
| 200 | `views/admin/repo/index.vue` | `views/admin/repo/index.vue` | Vue2 lifecycle hooks not found in Vue3: activated, data, handleTableReset, onActivated |
| 201 | `views/admin/repo/qu/ai.vue` | `views/admin/repo/qu/ai.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fillText, handleRepoAdded, quicklyBiuBiuBiu, removeFile, showAiRecord, showPreview, total, updateQuickList, onMounted |
| 201 | `views/admin/repo/qu/ai.vue` | `views/admin/repo/qu/ai.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (8) |
| 202 | `views/admin/repo/qu/batch.vue` | `views/admin/repo/qu/batch.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleRepoAdded, showPreview, toAiGen, onMounted |
| 202 | `views/admin/repo/qu/batch.vue` | `views/admin/repo/qu/batch.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (2) |
| 203 | `views/admin/repo/qu/components/dialog/AiRecordDialog.vue` | `views/admin/repo/qu/components/dialog/AiRecordDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handleFill, handler, onMounted |
| 204 | `views/admin/repo/qu/components/dialog/BatchPreviewDialog.vue` | `views/admin/repo/qu/components/dialog/BatchPreviewDialog.vue` | Vue2 lifecycle hooks not found in Vue3: batchFill, buildQuList, checkData, confirmSave, created, data, firstLoaded, goAnchor, handleClose, handleRepoAdded, handler, removeQu, repoChange, onMounted |
| 204 | `views/admin/repo/qu/components/dialog/BatchPreviewDialog.vue` | `views/admin/repo/qu/components/dialog/BatchPreviewDialog.vue` | Condition branch count differs: Vue2 (14) vs Vue3 (19) |
| 205 | `views/admin/repo/qu/components/dialog/QuSelectDialog.vue` | `views/admin/repo/qu/components/dialog/QuSelectDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handleConfirm, handler, repoChange, onMounted |
| 205 | `views/admin/repo/qu/components/dialog/QuSelectDialog.vue` | `views/admin/repo/qu/components/dialog/QuSelectDialog.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (3) |
| 206 | `views/admin/repo/qu/components/dialog/ReportAuditDialog.vue` | `views/admin/repo/qu/components/dialog/ReportAuditDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, default, handAudit, handleClose, handler, onMounted |
| 206 | `views/admin/repo/qu/components/dialog/ReportAuditDialog.vue` | `views/admin/repo/qu/components/dialog/ReportAuditDialog.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (4) |
| 207 | `views/admin/repo/qu/components/dialog/ReportViewDialog.vue` | `views/admin/repo/qu/components/dialog/ReportViewDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchDetail, handAudit, handleClose, handler, safeContent, safeQuText, onMounted |
| 207 | `views/admin/repo/qu/components/dialog/ReportViewDialog.vue` | `views/admin/repo/qu/components/dialog/ReportViewDialog.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (7) |
| 208 | `views/admin/repo/qu/components/GenerationProgress.vue` | `views/admin/repo/qu/components/GenerationProgress.vue` | Vue2 lifecycle hooks not found in Vue3: progressPercent, progressText |
| 209 | `views/admin/repo/qu/components/QuAiScoreTest.vue` | `views/admin/repo/qu/components/QuAiScoreTest.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, clearScroll, created, data, fillForm, goBottom, handelTest, handler, startScroll, startStream, onUnmounted, onBeforeUnmount, onMounted |
| 209 | `views/admin/repo/qu/components/QuAiScoreTest.vue` | `views/admin/repo/qu/components/QuAiScoreTest.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (4) |
| 210 | `views/admin/repo/qu/components/QuestionTypeConfig.vue` | `views/admin/repo/qu/components/QuestionTypeConfig.vue` | Vue2 lifecycle hooks not found in Vue3: data, emitUpdate |
| 211 | `views/admin/repo/qu/components/QuItemSave.vue` | `views/admin/repo/qu/components/QuItemSave.vue` | Vue2 lifecycle hooks not found in Vue3: answerChange, clear, created, data, fillValue, handleAdd, handleAiApply, handleAssociateChange, handleTypeChange, handler, initValue, mounted, quContent, removeItem, repoChange, validate, onMounted |
| 212 | `views/admin/repo/qu/components/QuItemShow.vue` | `views/admin/repo/qu/components/QuItemShow.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, escapeHtml, handler, highlightText, safeContent, safeHighlight, userAnswer, onMounted |
| 212 | `views/admin/repo/qu/components/QuItemShow.vue` | `views/admin/repo/qu/components/QuItemShow.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (0) |
| 213 | `views/admin/repo/qu/form.vue` | `views/admin/repo/qu/form.vue` | Vue2 lifecycle hooks not found in Vue3: activated, addChild, beforeDestroy, bindRepoId, childChange, clearForm, clearSortable, created, data, fetchData, formatClearHtml, formatQuType, goAnchor, handler, initScroll, initSortable, makeUpdate, mounted, onCancel, onEnd, removeChild, submitForm, onActivated, onUnmounted, onBeforeUnmount, onMounted |
| 213 | `views/admin/repo/qu/form.vue` | `views/admin/repo/qu/form.vue` | Condition branch count differs: Vue2 (20) vs Vue3 (17) |
| 213 | `views/admin/repo/qu/form.vue` | `views/admin/repo/qu/form.vue` | Vuex actions not found in any Pinia store: tagsView/delView |
| 214 | `views/admin/repo/qu/index.vue` | `views/admin/repo/qu/index.vue` | Vue2 lifecycle hooks not found in Vue3: activated, buildExportFileName, checkAndRefreshRepo, chooseSplitOrMerge, confirmExportFiltered, confirmExportSelected, created, currentRepoTitle, data, exportExcel, fillQuery, handleAdd, handleMultiAction, handler, handlerBatchLevel, handlerBatchPoints, handlerBatchRepo, handlerClearChapters, handlerClearPoints, handlerJoinChapters, importSuccess, repoChange, setBatchPoints, showImport, toAiGen, toBatchAdd, viewQu, onActivated, onMounted |
| 214 | `views/admin/repo/qu/index.vue` | `views/admin/repo/qu/index.vue` | Condition branch count differs: Vue2 (28) vs Vue3 (14) |
| 215 | `views/admin/repo/qu/report.vue` | `views/admin/repo/qu/report.vue` | Vue2 lifecycle hooks not found in Vue3: data, handleActions, handleAudit, handleRefresh, selectable, toRepo |
| 216 | `views/admin/repo/stat/analysis.vue` | `views/admin/repo/stat/analysis.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, onMounted |
| 216 | `views/admin/repo/stat/analysis.vue` | `views/admin/repo/stat/analysis.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 217 | `views/admin/repo/stat/components/StatKeyPointsTreeMap.vue` | `views/admin/repo/stat/components/StatKeyPointsTreeMap.vue` | Vue2 lifecycle hooks not found in Vue3: chartId, created, data, handler, initChart, onMounted |
| 217 | `views/admin/repo/stat/components/StatKeyPointsTreeMap.vue` | `views/admin/repo/stat/components/StatKeyPointsTreeMap.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (5) |
| 218 | `views/admin/repo/stat/components/StatTypeLevelTable.vue` | `views/admin/repo/stat/components/StatTypeLevelTable.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handler, showLevels, showTable, onMounted |
| 218 | `views/admin/repo/stat/components/StatTypeLevelTable.vue` | `views/admin/repo/stat/components/StatTypeLevelTable.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (4) |
| 219 | `views/admin/repo/stat/index.vue` | `views/admin/repo/stat/index.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleExport, onMounted |
| 219 | `views/admin/repo/stat/index.vue` | `views/admin/repo/stat/index.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 220 | `views/admin/sys/banner/index.vue` | `views/admin/sys/banner/index.vue` | Vue2 lifecycle hooks not found in Vue3: addBanner, created, data, fetchData, onDragEnd, removeBanner, submitForm, validateBanners, onMounted |
| 220 | `views/admin/sys/banner/index.vue` | `views/admin/sys/banner/index.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (10) |
| 220 | `views/admin/sys/banner/index.vue` | `views/admin/sys/banner/index.vue` | Vuex actions not found in any Pinia store: settings/getBanners |
| 221 | `views/admin/sys/config/components/AiConfig.vue` | `views/admin/sys/config/components/AiConfig.vue` | Vue2 lifecycle hooks not found in Vue3: allVoices, apiKeyPlaceholder, buildAiPayload, buildKbPayload, buildVisionPayload, buildVoicePayload, created, data, fetchData, filteredVoiceGroups, genderOptions, isMaskedSecret, onVoiceSearch, parseCfgData, resolvedVoiceId, selectedVoice, submitForm, voiceGroups, voiceMeta, onMounted |
| 222 | `views/admin/sys/config/components/BaseConfig.vue` | `views/admin/sys/config/components/BaseConfig.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, resetForm, submitForm, onMounted |
| 222 | `views/admin/sys/config/components/BaseConfig.vue` | `views/admin/sys/config/components/BaseConfig.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (2) |
| 222 | `views/admin/sys/config/components/BaseConfig.vue` | `views/admin/sys/config/components/BaseConfig.vue` | Vuex actions not found in any Pinia store: settings/getSite |
| 223 | `views/admin/sys/config/components/PexelsConfig.vue` | `views/admin/sys/config/components/PexelsConfig.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, submitForm, onMounted |
| 224 | `views/admin/sys/config/components/SwitchConfig.vue` | `views/admin/sys/config/components/SwitchConfig.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, submitForm, onMounted |
| 225 | `views/admin/sys/config/components/UploadConfig/UploadConfig.vue` | `views/admin/sys/config/components/UploadConfig/UploadConfig.vue` | Vue2 lifecycle hooks not found in Vue3: changProvider, created, data, fetchData, handler, submitForm, onMounted |
| 225 | `views/admin/sys/config/components/UploadConfig/UploadConfig.vue` | `views/admin/sys/config/components/UploadConfig/UploadConfig.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (5) |
| 226 | `views/admin/sys/config/components/UploadConfig/UploadOss.vue` | `views/admin/sys/config/components/UploadConfig/UploadOss.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handler, onMounted |
| 227 | `views/admin/sys/config/index.vue` | `views/admin/sys/config/index.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handler, pass, onMounted |
| 228 | `views/admin/sys/depart/index.vue` | `views/admin/sys/depart/index.vue` | Vue2 lifecycle hooks not found in Vue3: allowDrop, applyExpandState, buildAnomalyIndex, canSort, created, data, filterNode, formDialog, getList, getNodeLevel, handleDelete, handleDrop, handleSave, handler, isAnomaly, isDupName, onMigrateSaved, onUserSelectChanged, showFunction, showUser, toggleAnomaly, toggleExpandAll, onMounted |
| 228 | `views/admin/sys/depart/index.vue` | `views/admin/sys/depart/index.vue` | Condition branch count differs: Vue2 (24) vs Vue3 (2) |
| 229 | `views/admin/sys/depart/SubDepartFunction.vue` | `views/admin/sys/depart/SubDepartFunction.vue` | Vue2 lifecycle hooks not found in Vue3: data, flattenTree, handleAdd, handleDeptChange, handleEdit, handleSave, handler, loadDeptTree, mounted, onMounted |
| 230 | `views/admin/sys/dict/catalog.vue` | `views/admin/sys/dict/catalog.vue` | Vue2 lifecycle hooks not found in Vue3: addDicDialog, created, data, editDicDialog, handleSaveDic, showCatalog, onMounted |
| 231 | `views/admin/sys/dict/dict.vue` | `views/admin/sys/dict/dict.vue` | Vue2 lifecycle hooks not found in Vue3: addDicDialog, created, data, editDicDialog, handleSaveDic, showCatalog, onMounted |
| 232 | `views/admin/sys/group/index.vue` | `views/admin/sys/group/index.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, drawerClose, drawerOpen, handleAdd, handleSave, handleUpdate, handler, onMounted |
| 233 | `views/admin/sys/kp/components/KpEditDialog.vue` | `views/admin/sys/kp/components/KpEditDialog.vue` | Vue2 lifecycle hooks not found in Vue3: close, data, handleSave, visible |
| 233 | `views/admin/sys/kp/components/KpEditDialog.vue` | `views/admin/sys/kp/components/KpEditDialog.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (2) |
| 234 | `views/admin/sys/kp/components/KpQuickCreateDialog.vue` | `views/admin/sys/kp/components/KpQuickCreateDialog.vue` | Vue2 lifecycle hooks not found in Vue3: close, data, handleSimpleCreate, visible |
| 234 | `views/admin/sys/kp/components/KpQuickCreateDialog.vue` | `views/admin/sys/kp/components/KpQuickCreateDialog.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (2) |
| 235 | `views/admin/sys/kp/components/KpRelationDialog.vue` | `views/admin/sys/kp/components/KpRelationDialog.vue` | Vue2 lifecycle hooks not found in Vue3: addRelation, data, handleClearAll, loadRelations, onQuickCreated, openSimpleCreate, remoteMethod, removeRelation, visible |
| 236 | `views/admin/sys/kp/components/KpUsageDialog.vue` | `views/admin/sys/kp/components/KpUsageDialog.vue` | Vue2 lifecycle hooks not found in Vue3: clearAllUsage, close, data, handler, removeUsageRef, visible |
| 236 | `views/admin/sys/kp/components/KpUsageDialog.vue` | `views/admin/sys/kp/components/KpUsageDialog.vue` | Condition branch count differs: Vue2 (13) vs Vue3 (4) |
| 237 | `views/admin/sys/kp/index.vue` | `views/admin/sys/kp/index.vue` | Vue2 lifecycle hooks not found in Vue3: data, formDialog, handleDelete, handleDialogSave, handleRelation, handleSort, openUsage |
| 238 | `views/admin/sys/lecturer/components/LecturerCourseDialog.vue` | `views/admin/sys/lecturer/components/LecturerCourseDialog.vue` | Vue2 lifecycle hooks not found in Vue3: data, handleClose, handleCloseComments, handleSearch, handleViewComments, visible |
| 238 | `views/admin/sys/lecturer/components/LecturerCourseDialog.vue` | `views/admin/sys/lecturer/components/LecturerCourseDialog.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (1) |
| 239 | `views/admin/sys/lecturer/components/LecturerDetailDialog.vue` | `views/admin/sys/lecturer/components/LecturerDetailDialog.vue` | API calls differ between Vue2 and Vue3 |
| 239 | `views/admin/sys/lecturer/components/LecturerDetailDialog.vue` | `views/admin/sys/lecturer/components/LecturerDetailDialog.vue` | Vue2 lifecycle hooks not found in Vue3: data, fetchLecturerDetail, fetchStats, handleClose, visible |
| 239 | `views/admin/sys/lecturer/components/LecturerDetailDialog.vue` | `views/admin/sys/lecturer/components/LecturerDetailDialog.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (5) |
| 240 | `views/admin/sys/lecturer/index.vue` | `views/admin/sys/lecturer/index.vue` | Vue2 lifecycle hooks not found in Vue3: activated, data, handleCloseCourse, handleCloseDetail, handleCommand, handleDeptChange, handleEdit, handleSearch, handleSelectionChange, handleStateChange, handleViewComments, handleViewDetail, refreshTable, onActivated |
| 240 | `views/admin/sys/lecturer/index.vue` | `views/admin/sys/lecturer/index.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (1) |
| 241 | `views/admin/sys/log/index.vue` | `views/admin/sys/log/index.vue` | Vue2 lifecycle hooks not found in Vue3: data, handleClear, showClear, showDetail |
| 242 | `views/admin/sys/menu/index.vue` | `views/admin/sys/menu/index.vue` | Vue2 lifecycle hooks not found in Vue3: allowDrop, applyExpandState, canSort, created, data, filterNode, getList, handleDelete, handleDrop, handler, menuTypeText, showDialog, toggleExpandAll, onMounted |
| 242 | `views/admin/sys/menu/index.vue` | `views/admin/sys/menu/index.vue` | Condition branch count differs: Vue2 (19) vs Vue3 (16) |
| 243 | `views/admin/sys/notice/index.vue` | `views/admin/sys/notice/index.vue` | Vue2 lifecycle hooks not found in Vue3: data, formatState, handleMultiAction, refreshTable, showAdd, showUpdate |
| 243 | `views/admin/sys/notice/index.vue` | `views/admin/sys/notice/index.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 244 | `views/admin/sys/role/index.vue` | `views/admin/sys/role/index.vue` | Vue2 lifecycle hooks not found in Vue3: changeGrant, created, data, handleAdd, handleSave, handleUpdate, saveGrant, showUser, onMounted |
| 245 | `views/admin/sys/user/components/FaceUpload.vue` | `views/admin/sys/user/components/FaceUpload.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, importSuccess, onMounted |
| 246 | `views/admin/sys/user/components/UserBatchDeptDialog.vue` | `views/admin/sys/user/components/UserBatchDeptDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handleSave, visible, onMounted |
| 247 | `views/admin/sys/user/components/UserBatchExpireDialog.vue` | `views/admin/sys/user/components/UserBatchExpireDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handleSave, visible, onMounted |
| 248 | `views/admin/sys/user/components/UserBatchGroupDialog.vue` | `views/admin/sys/user/components/UserBatchGroupDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handleSave, visible, onMounted |
| 249 | `views/admin/sys/user/components/UserBatchRoleDialog.vue` | `views/admin/sys/user/components/UserBatchRoleDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handleSave, visible, onMounted |
| 250 | `views/admin/sys/user/components/UserUpdateDialog/UserUpdateBase.vue` | `views/admin/sys/user/components/UserUpdateDialog/UserUpdateBase.vue` | Vue2 lifecycle hooks not found in Vue3: clear, created, data, handleCancel, handleSave, handler, showInfo, onMounted |
| 250 | `views/admin/sys/user/components/UserUpdateDialog/UserUpdateBase.vue` | `views/admin/sys/user/components/UserUpdateDialog/UserUpdateBase.vue` | Condition branch count differs: Vue2 (7) vs Vue3 (14) |
| 251 | `views/admin/sys/user/components/UserUpdateDialog/UserUpdateBind.vue` | `views/admin/sys/user/components/UserUpdateDialog/UserUpdateBind.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleUnbind, handler, refresh, onMounted |
| 251 | `views/admin/sys/user/components/UserUpdateDialog/UserUpdateBind.vue` | `views/admin/sys/user/components/UserUpdateDialog/UserUpdateBind.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (0) |
| 252 | `views/admin/sys/user/components/UserUpdateDialog/UserUpdateDialog.vue` | `views/admin/sys/user/components/UserUpdateDialog/UserUpdateDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handler, onMounted |
| 252 | `views/admin/sys/user/components/UserUpdateDialog/UserUpdateDialog.vue` | `views/admin/sys/user/components/UserUpdateDialog/UserUpdateDialog.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (2) |
| 253 | `views/admin/sys/user/components/UserUpdateDialog/UserUpdateMobileBinder.vue` | `views/admin/sys/user/components/UserUpdateDialog/UserUpdateMobileBinder.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchBind, handler, saveBind, saveUnBind, showBind, onMounted |
| 254 | `views/admin/sys/user/index.vue` | `views/admin/sys/user/index.vue` | Vue2 lifecycle hooks not found in Vue3: activated, created, data, departChange, departClear, departSelect, exportExcel, fillSuccess, handleAdd, handleBatchSaved, handleClearBatchDept, handleMultiActions, handleStateChange, handleTableReset, handleUpdate, handler, importSuccess, naviToPoints, showBatchFace, showImage, showImport, stateTagType, onActivated, onMounted |
| 254 | `views/admin/sys/user/index.vue` | `views/admin/sys/user/index.vue` | Condition branch count differs: Vue2 (8) vs Vue3 (7) |
| 255 | `views/admin/sys/user/points/components/PointsGiveDialog.vue` | `views/admin/sys/user/points/components/PointsGiveDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handleGive, handleIncr, handleSub, handler, labelShow, onMounted |
| 255 | `views/admin/sys/user/points/components/PointsGiveDialog.vue` | `views/admin/sys/user/points/components/PointsGiveDialog.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (5) |
| 256 | `views/admin/sys/user/points/index.vue` | `views/admin/sys/user/points/index.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleRefresh, showIncr, showInfo, showSub, onMounted |
| 257 | `views/admin/sys/user/real/index.vue` | `views/admin/sys/user/real/index.vue` | Vue2 lifecycle hooks not found in Vue3: autoAudit, created, data, handAudit, handleActions, handler, onMounted |
| 258 | `views/admin/tmpl/components/Join1Form.vue` | `views/admin/tmpl/components/Join1Form.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, calcScore, checkForm, createGroup, created, data, fillScore, goAnchor, handleSave, handleScroll, handler, mounted, removeItem, onUnmounted, onBeforeUnmount, onMounted |
| 258 | `views/admin/tmpl/components/Join1Form.vue` | `views/admin/tmpl/components/Join1Form.vue` | Condition branch count differs: Vue2 (24) vs Vue3 (27) |
| 259 | `views/admin/tmpl/components/JoinQuList.vue` | `views/admin/tmpl/components/JoinQuList.vue` | Vue2 lifecycle hooks not found in Vue3: calcScore, calcSub, created, data, fillScore, handleQuBack, handler, openRandomQu, openSelectQu, pathShow, removeItem, sortDown, sortUp, onMounted |
| 259 | `views/admin/tmpl/components/JoinQuList.vue` | `views/admin/tmpl/components/JoinQuList.vue` | Condition branch count differs: Vue2 (7) vs Vue3 (9) |
| 260 | `views/admin/tmpl/components/JoinRuleList.vue` | `views/admin/tmpl/components/JoinRuleList.vue` | Vue2 lifecycle hooks not found in Vue3: calc, created, data, handleRuleBack, handler, openSelectQu, pointNames, removeRule, onMounted |
| 260 | `views/admin/tmpl/components/JoinRuleList.vue` | `views/admin/tmpl/components/JoinRuleList.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (6) |
| 261 | `views/admin/tmpl/components/JoinTopNav.vue` | `views/admin/tmpl/components/JoinTopNav.vue` | Vue2 lifecycle hooks not found in Vue3: createGroup, created, data, handler, onMounted |
| 261 | `views/admin/tmpl/components/JoinTopNav.vue` | `views/admin/tmpl/components/JoinTopNav.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (2) |
| 262 | `views/admin/tmpl/components/QuRandomDialog.vue` | `views/admin/tmpl/components/QuRandomDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, dialogClose, handleRuleBack, handler, onMounted |
| 263 | `views/admin/tmpl/components/RuleBuildDialog.vue` | `views/admin/tmpl/components/RuleBuildDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, dialogClose, handleConfirm, handleStat, handler, repoChange, onMounted |
| 263 | `views/admin/tmpl/components/RuleBuildDialog.vue` | `views/admin/tmpl/components/RuleBuildDialog.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (5) |
| 264 | `views/admin/tmpl/components/TmplPreCreate.vue` | `views/admin/tmpl/components/TmplPreCreate.vue` | Vue2 lifecycle hooks not found in Vue3: clear, created, data, handleConfirm, handler, onMounted |
| 265 | `views/admin/tmpl/form.vue` | `views/admin/tmpl/form.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handleBack, handleConfirmCreateExam, onMounted |
| 265 | `views/admin/tmpl/form.vue` | `views/admin/tmpl/form.vue` | Condition branch count differs: Vue2 (10) vs Vue3 (13) |
| 265 | `views/admin/tmpl/form.vue` | `views/admin/tmpl/form.vue` | Vuex actions not found in any Pinia store: tagsView/delView |
| 266 | `views/admin/tmpl/index.vue` | `views/admin/tmpl/index.vue` | Vue2 lifecycle hooks not found in Vue3: activated, data, handleAdd, handleConfirm, handleCopy, handleSelect, handleTableReset, handleUpdate, openRefDialog, onActivated |
| 267 | `views/admin/tmpl/preview.vue` | `views/admin/tmpl/preview.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, calcSub, created, data, fetchData, goAnchor, handleScroll, handler, mounted, prints, onUnmounted, onBeforeUnmount, onMounted |
| 267 | `views/admin/tmpl/preview.vue` | `views/admin/tmpl/preview.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (0) |
| 268 | `views/admin/training-sign-in/config.vue` | `views/admin/training-sign-in/config.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchConfig, save, onMounted |
| 269 | `views/admin/training-sign-in/create.vue` | `views/admin/training-sign-in/create.vue` | Vue2 lifecycle hooks not found in Vue3: data, goBack, openUserSelect, submit |
| 269 | `views/admin/training-sign-in/create.vue` | `views/admin/training-sign-in/create.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (2) |
| 270 | `views/admin/training-sign-in/edit.vue` | `views/admin/training-sign-in/edit.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchDetail, goBack, openUserSelect, submit, onMounted |
| 271 | `views/admin/training-sign-in/list.vue` | `views/admin/training-sign-in/list.vue` | Vue2 lifecycle hooks not found in Vue3: activated, created, data, fetchDeptTree, getDeptName, handleDelete, handleEdit, handleFilterChange, showQrCode, showRecords, onActivated, onMounted |
| 272 | `views/admin/training-sign-in/qrcode.vue` | `views/admin/training-sign-in/qrcode.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, downloadQrCode, fetchDeptTree, fetchDetail, fetchQrCode, getDeptName, goBack, printQrCode, onMounted |
| 272 | `views/admin/training-sign-in/qrcode.vue` | `views/admin/training-sign-in/qrcode.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (6) |
| 273 | `views/admin/training-sign-in/records.vue` | `views/admin/training-sign-in/records.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, exportRecords, fetchDeptTree, fetchDetail, fetchRecords, getDeptName, goBack, onMounted |
| 274 | `views/web/ai/components/AiAssistant/AiInputArea.vue` | `views/web/ai/components/AiAssistant/AiInputArea.vue` | Vue2 lifecycle hooks not found in Vue3: appendQuote, beforeDestroy, data, flushPendingSendIfReady, getSendFlags, handleDrop, handlePaste, handlePreviewTempFile, handleSend, handleStop, handler, hasSendContent, mounted, onEnter, onKbChange, onVoiceResult, removeFile, setAttachFiles, sizeLimitMB, thinkingLevel, onUnmounted, onBeforeUnmount, onMounted |
| 274 | `views/web/ai/components/AiAssistant/AiInputArea.vue` | `views/web/ai/components/AiAssistant/AiInputArea.vue` | Condition branch count differs: Vue2 (31) vs Vue3 (3) |
| 275 | `views/web/ai/components/AiAssistant/AiMessageList.vue` | `views/web/ai/components/AiAssistant/AiMessageList.vue` | API calls differ between Vue2 and Vue3 |
| 275 | `views/web/ai/components/AiAssistant/AiMessageList.vue` | `views/web/ai/components/AiAssistant/AiMessageList.vue` | Vue2 lifecycle hooks not found in Vue3: allGroupsSelected, beforeDestroy, conversationKey, copySelection, copyText, created, data, emitScrollChange, getFileIconForMessage, getFileNameFromUrl, getUsageStats, groupIndexMap, groupsAndMaps, handleChatBodyClick, handleDocumentMouseDown, handleMouseUp, handleOutlineSelect, handlePreviewAiFile, handleScroll, handleScrollToBottomClick, handleStageUpdate, handleThoughtCollapseChange, isImageFile, isMsgSelected, isTtsActive, jumpToPrevQuestion, messageKey, mounted, msgGroupKey, onRowClick, onSpeak, onSuggest, onToolbarCancel, onToolbarExport, onToolbarSelectAll, openCitation, questionIndexAt, questionIndexMap, questions, quoteSelection, refreshUserMsgRefs, repositionSelectionToolbar, scheduleScrollChange, scrollToBottom, scrollToBottomHard, scrollToQuestion, selectableGroupCount, selectedGroupCount, streamTailSignal, toggleCitation, ttsLabel, onUnmounted, onBeforeUnmount, onMounted |
| 275 | `views/web/ai/components/AiAssistant/AiMessageList.vue` | `views/web/ai/components/AiAssistant/AiMessageList.vue` | Condition branch count differs: Vue2 (83) vs Vue3 (4) |
| 276 | `views/web/ai/components/AiAssistant/base/AiAssistantHistoryPanel.vue` | `views/web/ai/components/AiAssistant/base/AiAssistantHistoryPanel.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, data, emptyText, handleEdit, handleSave, handleSearchInput, handleSearchNow, historyTitle, isActiveItem, onHistoryScroll, searchPlaceholder, onUnmounted, onBeforeUnmount |
| 276 | `views/web/ai/components/AiAssistant/base/AiAssistantHistoryPanel.vue` | `views/web/ai/components/AiAssistant/base/AiAssistantHistoryPanel.vue` | Condition branch count differs: Vue2 (11) vs Vue3 (13) |
| 277 | `views/web/ai/components/AiAssistant/base/AiAssistantPreviewDialog.vue` | `views/web/ai/components/AiAssistant/base/AiAssistantPreviewDialog.vue` | Vue2 lifecycle hooks not found in Vue3: get, set |
| 278 | `views/web/ai/components/AiAssistant/base/AiAssistantShell.vue` | `views/web/ai/components/AiAssistant/base/AiAssistantShell.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, clamp, data, exitFullscreenAndStartDrag, fabStyle, handleClick, isHeaderNoDragTarget, onDrag, onHeaderDblClick, onHeaderMouseDown, onResize, startDrag, startResize, stopDrag, stopResize, toggleChat, windowStyle, onUnmounted, onBeforeUnmount |
| 278 | `views/web/ai/components/AiAssistant/base/AiAssistantShell.vue` | `views/web/ai/components/AiAssistant/base/AiAssistantShell.vue` | Condition branch count differs: Vue2 (24) vs Vue3 (25) |
| 279 | `views/web/ai/components/AiAssistant/components/AiMessageMeta.vue` | `views/web/ai/components/AiAssistant/components/AiMessageMeta.vue` | Vue2 lifecycle hooks not found in Vue3: data, formatToolName, hasContent, isKbTool, isWebTool, kbLabelSet, kbSteps, otherSteps, truncate, webSteps |
| 279 | `views/web/ai/components/AiAssistant/components/AiMessageMeta.vue` | `views/web/ai/components/AiAssistant/components/AiMessageMeta.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (5) |
| 280 | `views/web/ai/components/AiAssistant/components/CitationList.vue` | `views/web/ai/components/AiAssistant/components/CitationList.vue` | Vue2 lifecycle hooks not found in Vue3: allExpanded, data, expanded, getDocContent, getDocName, groupedCitations, openByIndex, openCitation, toggleCitation, toggleExpandAll, toggleItem |
| 280 | `views/web/ai/components/AiAssistant/components/CitationList.vue` | `views/web/ai/components/AiAssistant/components/CitationList.vue` | Condition branch count differs: Vue2 (13) vs Vue3 (0) |
| 281 | `views/web/ai/components/AiAssistant/components/ConversationSelectToolbar.vue` | `views/web/ai/components/AiAssistant/components/ConversationSelectToolbar.vue` | Vue2 lifecycle hooks not found in Vue3: get, set |
| 282 | `views/web/ai/components/AiAssistant/components/FilePreviewList.vue` | `views/web/ai/components/AiAssistant/components/FilePreviewList.vue` | Vue2 lifecycle hooks not found in Vue3: getFileIcon, handlePreview, handleRemove, isImage |
| 282 | `views/web/ai/components/AiAssistant/components/FilePreviewList.vue` | `views/web/ai/components/AiAssistant/components/FilePreviewList.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (0) |
| 283 | `views/web/ai/components/AiAssistant/components/InputToolbar.vue` | `views/web/ai/components/AiAssistant/components/InputToolbar.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, cancelVoiceRecording, checkCompact, clearKb, data, formattedRecordingDuration, handleUpload, isDocumentFile, isKbChecked, kbSuffixText, mounted, onFileAdd, onFileSuccess, onTempFilesChange, onVoiceClick, selectThinkingLevel, sizeLimitMB, startVoiceRecording, stopAndRecognize, thinkingPillText, toggleKb, toggleThinking, uploadToDashScope, voiceButtonTitle, onUnmounted, onBeforeUnmount, onMounted |
| 283 | `views/web/ai/components/AiAssistant/components/InputToolbar.vue` | `views/web/ai/components/AiAssistant/components/InputToolbar.vue` | Condition branch count differs: Vue2 (34) vs Vue3 (0) |
| 284 | `views/web/ai/components/AiAssistant/components/OneTimeFileManager.vue` | `views/web/ai/components/AiAssistant/components/OneTimeFileManager.vue` | Vue2 lifecycle hooks not found in Vue3: ask, confirm, data |
| 285 | `views/web/ai/components/AiAssistant/components/SuggestionSection.vue` | `views/web/ai/components/AiAssistant/components/SuggestionSection.vue` | Vue2 lifecycle hooks not found in Vue3: effectiveSuggestions, handleClick |
| 286 | `views/web/ai/components/AiAssistant/components/ThoughtsSection.vue` | `views/web/ai/components/AiAssistant/components/ThoughtsSection.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, created, data, formatStageLabel, get, getThoughtObject, handler, hasStageDetail, isAnyStageActive, isStageExpanded, isThinking, loading, markReasoningChanging, normalizeWhitespace, parseRetrievalDocsFromItem, parseRetrievalObservation, renderReasoningHtml, scrollReasoningToBottom, set, shouldShow, toggleRetrievalItem, toggleStage, onUnmounted, onBeforeUnmount, onMounted |
| 286 | `views/web/ai/components/AiAssistant/components/ThoughtsSection.vue` | `views/web/ai/components/AiAssistant/components/ThoughtsSection.vue` | Condition branch count differs: Vue2 (92) vs Vue3 (1) |
| 287 | `views/web/ai/components/AiAssistant/components/ToolCallProgress.vue` | `views/web/ai/components/AiAssistant/components/ToolCallProgress.vue` | Vue2 lifecycle hooks not found in Vue3: doneCount, errorText, formatArgs, handler, hasContent, iconClass, isKb, isStuck, isWeb, kbSteps, otherSteps, rowClass, runningCount, webSteps |
| 287 | `views/web/ai/components/AiAssistant/components/ToolCallProgress.vue` | `views/web/ai/components/AiAssistant/components/ToolCallProgress.vue` | Condition branch count differs: Vue2 (10) vs Vue3 (13) |
| 288 | `views/web/ai/components/AiAssistant/modes/answer/AnswerAssistantView.vue` | `views/web/ai/components/AiAssistant/modes/answer/AnswerAssistantView.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, checkAndResumeAiResponse, created, data, doImport, enterSelectMode, exitSelectMode, exportSelection, getWelcomeMessage, handleRetry, handleWithdraw, initFromHistory, onImportFileChange, reset, startNewSession, toggleAll, toggleGroup, triggerImport, onUnmounted, onBeforeUnmount, onMounted |
| 288 | `views/web/ai/components/AiAssistant/modes/answer/AnswerAssistantView.vue` | `views/web/ai/components/AiAssistant/modes/answer/AnswerAssistantView.vue` | Condition branch count differs: Vue2 (20) vs Vue3 (7) |
| 289 | `views/web/ai/components/AiAssistant/modes/training/TrainingAssistantView.vue` | `views/web/ai/components/AiAssistant/modes/training/TrainingAssistantView.vue` | Vue2 lifecycle hooks not found in Vue3: appendQuote, beforeDestroy, bindRole, chatPlaceholder, created, data, getWelcomeMessage, handleDeleteHistory, handleDeleteMessage, handleEndTraining, handleNewTrainingAfterEnd, handleRetry, handleRoleChange, handleStartTraining, handleWithdraw, initFromHistory, initFromPresetRoleWithHistory, isFromPlan, loadTrainingRoles, notifyApi, refreshHistoryListIfOpen, reset, restoreTrainingRoleFromHistory, selectHistoryItem, setMessageField, startNewSession, syncTrainingEndedFlag, toggleHistory, onUnmounted, onBeforeUnmount, onMounted |
| 289 | `views/web/ai/components/AiAssistant/modes/training/TrainingAssistantView.vue` | `views/web/ai/components/AiAssistant/modes/training/TrainingAssistantView.vue` | Condition branch count differs: Vue2 (33) vs Vue3 (12) |
| 290 | `views/web/ai/components/AiAssistant/modes/training/TrainingRoleBar.vue` | `views/web/ai/components/AiAssistant/modes/training/TrainingRoleBar.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, clearCloseTimer, data, filteredRoles, handleHostEnter, handleHostLeave, handleSelect, handleTriggerEnter, mounted, openOnMount, onUnmounted, onBeforeUnmount, onMounted |
| 291 | `views/web/ai/components/AiAssistant/shared/AiChatPanel.vue` | `views/web/ai/components/AiAssistant/shared/AiChatPanel.vue` | Vue2 lifecycle hooks not found in Vue3: appendQuote, bodyStyle, getInputFlags, handleQuote, handleSuggestClick, resetDashScopeState, setAttachFiles, setInputValue |
| 291 | `views/web/ai/components/AiAssistant/shared/AiChatPanel.vue` | `views/web/ai/components/AiAssistant/shared/AiChatPanel.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (0) |
| 292 | `views/web/ai/components/AiAssistant/shared/QuestionOutline.vue` | `views/web/ai/components/AiAssistant/shared/QuestionOutline.vue` | Vue2 lifecycle hooks not found in Vue3: activeIndex, data, onDotEnter, onDotLeave, onItemClick, onItemKey, onPopoverEnter, onPopoverLeave, onTrackEnter, onTrackLeave, popoverStyle, scrollActiveIntoView, showPopover, togglePin, updatePopoverMaxHeight |
| 293 | `views/web/ai/components/SparringDialog.vue` | `views/web/ai/components/SparringDialog.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, data, handleClose, handleEscKey, handleTrainingComplete, handler, isFromPlan, onDialogClosed, toggleHistory, onUnmounted, onBeforeUnmount |
| 293 | `views/web/ai/components/SparringDialog.vue` | `views/web/ai/components/SparringDialog.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (2) |
| 294 | `views/web/course/components/AIPPT/WebAddCourseFileDialog.vue` | `views/web/course/components/AIPPT/WebAddCourseFileDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fileDeleted, fileSelected, get, handleFetchInfo, handleFetchState, handleMultiActions, handleSave, handleTranscode, handler, set, videoLoaded, onMounted |
| 294 | `views/web/course/components/AIPPT/WebAddCourseFileDialog.vue` | `views/web/course/components/AIPPT/WebAddCourseFileDialog.vue` | Condition branch count differs: Vue2 (16) vs Vue3 (8) |
| 295 | `views/web/course/components/AIPPT/WebAiPptGeneratorButton.vue` | `views/web/course/components/AIPPT/WebAiPptGeneratorButton.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, buildBridgeContext, clearRetry, data, dialogVisible, fetchPexelsConfig, getPptistOrigin, getSessionJson, handleClose, handleGeneratedPpt, handleMessage, isValidOrigin, onIframeLoad, processPptFile, sendMessageToIframe, showAiPptGenerator, startRetrySendOssEnv, uploadFinish, onUnmounted, onBeforeUnmount |
| 295 | `views/web/course/components/AIPPT/WebAiPptGeneratorButton.vue` | `views/web/course/components/AIPPT/WebAiPptGeneratorButton.vue` | Condition branch count differs: Vue2 (14) vs Vue3 (17) |
| 296 | `views/web/course/components/CourseCam.vue` | `views/web/course/components/CourseCam.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, destroyed, faceOut, fill, fillEmpty, handleCamError, handleCapture, handler, startTimer, onMounted, onUnmounted |
| 296 | `views/web/course/components/CourseCam.vue` | `views/web/course/components/CourseCam.vue` | Condition branch count differs: Vue2 (6) vs Vue3 (9) |
| 297 | `views/web/course/components/CourseLive.vue` | `views/web/course/components/CourseLive.vue` | Vue2 lifecycle hooks not found in Vue3: autoChange, changeLive, created, data, handler, onMounted |
| 297 | `views/web/course/components/CourseLive.vue` | `views/web/course/components/CourseLive.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 298 | `views/web/course/components/dialog/CourseQaDetailDialog.vue` | `views/web/course/components/dialog/CourseQaDetailDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, formatContent, handleClose, handler, listReply, showDetail, onMounted |
| 298 | `views/web/course/components/dialog/CourseQaDetailDialog.vue` | `views/web/course/components/dialog/CourseQaDetailDialog.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (6) |
| 299 | `views/web/course/components/dialog/CourseQaPublishDialog.vue` | `views/web/course/components/dialog/CourseQaPublishDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handleSave, handler, onMounted |
| 299 | `views/web/course/components/dialog/CourseQaPublishDialog.vue` | `views/web/course/components/dialog/CourseQaPublishDialog.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (5) |
| 300 | `views/web/course/components/dialog/WebMultiAddCourseFileDialog.vue` | `views/web/course/components/dialog/WebMultiAddCourseFileDialog.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, data, handleClose, handleSave, isSaveDisabled, onDurationChange, onTitleChange, resetForm, videoLoaded, visible, onUnmounted, onBeforeUnmount |
| 300 | `views/web/course/components/dialog/WebMultiAddCourseFileDialog.vue` | `views/web/course/components/dialog/WebMultiAddCourseFileDialog.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (6) |
| 301 | `views/web/course/components/FileFrame.vue` | `views/web/course/components/FileFrame.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, checkBreak, created, data, handleFinish, handleProcess, handler, initFile, onEnded, onLoaded, onPause, onPlay, onSocketChange, onTimeUpdate, onVisibilityChange, pause, retryPendingNotifications, sendCourseFinishNotify, sendNotifyWithRetry, onUnmounted, onBeforeUnmount, onMounted |
| 301 | `views/web/course/components/FileFrame.vue` | `views/web/course/components/FileFrame.vue` | Condition branch count differs: Vue2 (24) vs Vue3 (27) |
| 302 | `views/web/course/components/ReadCheck.vue` | `views/web/course/components/ReadCheck.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, clearTimer, data, handleCheck, handler, initTimer, mounted, remindTime, onUnmounted, onBeforeUnmount, onMounted |
| 302 | `views/web/course/components/ReadCheck.vue` | `views/web/course/components/ReadCheck.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (9) |
| 303 | `views/web/course/components/ReadSocket.vue` | `views/web/course/components/ReadSocket.vue` | Vue2 lifecycle hooks not found in Vue3: data, handler, onMessage |
| 303 | `views/web/course/components/ReadSocket.vue` | `views/web/course/components/ReadSocket.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (6) |
| 304 | `views/web/course/components/UserCourseSelect.vue` | `views/web/course/components/UserCourseSelect.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handleBlur, handleClear, handleVisibleChange, handler, handlerChange, onMounted |
| 304 | `views/web/course/components/UserCourseSelect.vue` | `views/web/course/components/UserCourseSelect.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (3) |
| 305 | `views/web/course/CourseDetail.vue` | `views/web/course/CourseDetail.vue` | Vue2 lifecycle hooks not found in Vue3: changeFile, changeLearnMin, checkBreak, created, data, doCheckFace, fetchData, formatContent, handleBuy, handleFinish, handleQaUpdate, percent, toExam, onMounted |
| 305 | `views/web/course/CourseDetail.vue` | `views/web/course/CourseDetail.vue` | Condition branch count differs: Vue2 (20) vs Vue3 (18) |
| 306 | `views/web/course/UserCourseFileList.vue` | `views/web/course/UserCourseFileList.vue` | Vue2 lifecycle hooks not found in Vue3: activated, closePreview, created, data, fileDeleted, fileSelected, handleAdd, handleEdit, handleFetchInfo, handleFetchState, handleMultiActions, handlePreview, handleSave, handleTranscode, handler, mapToFilePreviewType, refresh, videoLoaded, onActivated, onMounted |
| 306 | `views/web/course/UserCourseFileList.vue` | `views/web/course/UserCourseFileList.vue` | Condition branch count differs: Vue2 (18) vs Vue3 (20) |
| 307 | `views/web/course/WebCourseList/AssignedCoursePage.vue` | `views/web/course/WebCourseList/AssignedCoursePage.vue` | Vue2 lifecycle hooks not found in Vue3: continueLearn, data, goToPlanDetail, handelView, reload, toQaList |
| 308 | `views/web/course/WebCourseList/CourseLearnPage.vue` | `views/web/course/WebCourseList/CourseLearnPage.vue` | Vue2 lifecycle hooks not found in Vue3: data, goToPlanDetail |
| 309 | `views/web/course/WebCourseList/index.vue` | `views/web/course/WebCourseList/index.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleTabClick, handler, reloadMy, onMounted |
| 309 | `views/web/course/WebCourseList/index.vue` | `views/web/course/WebCourseList/index.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (10) |
| 310 | `views/web/course/WebCourseList/LecturerCenterPage.vue` | `views/web/course/WebCourseList/LecturerCenterPage.vue` | Vue2 lifecycle hooks not found in Vue3: data, getCourseCountType, handleDrawerClose, handleSearch, handleViewCourseDetail, handleViewCourses |
| 310 | `views/web/course/WebCourseList/LecturerCenterPage.vue` | `views/web/course/WebCourseList/LecturerCenterPage.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (3) |
| 311 | `views/web/course/WebCourseList/OpenCoursePage.vue` | `views/web/course/WebCourseList/OpenCoursePage.vue` | Vue2 lifecycle hooks not found in Vue3: applyAiToList, data, exitAiList, fetchAiList, fetchAiSearch, handelView, handleAiDialogPageChange, handleAiDialogSearch, handleAiDialogSizeChange, handleAiListPageChange, handleAiListSizeChange, handleJoin, handleNormalSearch, openAiSearchDialog |
| 311 | `views/web/course/WebCourseList/OpenCoursePage.vue` | `views/web/course/WebCourseList/OpenCoursePage.vue` | Condition branch count differs: Vue2 (6) vs Vue3 (3) |
| 312 | `views/web/course/WebCourseList/SelfStudyCoursePage.vue` | `views/web/course/WebCourseList/SelfStudyCoursePage.vue` | Vue2 lifecycle hooks not found in Vue3: data, handelView, reload, reset, toQaList |
| 313 | `views/web/course/WebCourseQaList/index.vue` | `views/web/course/WebCourseQaList/index.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, onMounted |
| 314 | `views/web/course/WebCourseQaList/WebCourseQa.vue` | `views/web/course/WebCourseQaList/WebCourseQa.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handelView, handleBack, handleNew, handler, reloadGrid, onMounted |
| 314 | `views/web/course/WebCourseQaList/WebCourseQa.vue` | `views/web/course/WebCourseQaList/WebCourseQa.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (4) |
| 315 | `views/web/dashboard/components/WebLearningDynamics.vue` | `views/web/dashboard/components/WebLearningDynamics.vue` | Vue2 lifecycle hooks not found in Vue3: changeBatch, data, displayList, formatTime, toDetail |
| 315 | `views/web/dashboard/components/WebLearningDynamics.vue` | `views/web/dashboard/components/WebLearningDynamics.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (5) |
| 316 | `views/web/dashboard/components/WebNoticeList.vue` | `views/web/dashboard/components/WebNoticeList.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, created, currentNotice, data, fetchData, formatTime, goToList, isNewNotice, mounted, nextNotice, startAutoPlay, stopAutoPlay, toDetail, onUnmounted, onBeforeUnmount, onMounted |
| 316 | `views/web/dashboard/components/WebNoticeList.vue` | `views/web/dashboard/components/WebNoticeList.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (6) |
| 317 | `views/web/dashboard/components/WebQuickOpt.vue` | `views/web/dashboard/components/WebQuickOpt.vue` | Vue2 lifecycle hooks not found in Vue3: data, mounted, navToCourse, navToExam, navToNotice, navToRepo, onMounted |
| 317 | `views/web/dashboard/components/WebQuickOpt.vue` | `views/web/dashboard/components/WebQuickOpt.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (0) |
| 318 | `views/web/dashboard/components/WebRecentCourses.vue` | `views/web/dashboard/components/WebRecentCourses.vue` | Vue2 lifecycle hooks not found in Vue3: data, toDetail, toMore, toPlanDetail |
| 319 | `views/web/dashboard/components/WebRecommendCourses.vue` | `views/web/dashboard/components/WebRecommendCourses.vue` | Vue2 lifecycle hooks not found in Vue3: data, toDetail, toMore |
| 320 | `views/web/dashboard/components/WebStatNums.vue` | `views/web/dashboard/components/WebStatNums.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, onMounted |
| 320 | `views/web/dashboard/components/WebStatNums.vue` | `views/web/dashboard/components/WebStatNums.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (2) |
| 321 | `views/web/dashboard/components/WebTaskCenter.vue` | `views/web/dashboard/components/WebTaskCenter.vue` | Vue2 lifecycle hooks not found in Vue3: changeTab, data, toCourse, toExam |
| 322 | `views/web/dashboard/index.vue` | `views/web/dashboard/index.vue` | Vue2 lifecycle hooks not found in Vue3: bannerHeight, bannerList, beforeDestroy, created, data, mounted, onImgError, onResize, onStatUpdate, onUnmounted, onBeforeUnmount, onMounted |
| 322 | `views/web/dashboard/index.vue` | `views/web/dashboard/index.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (3) |
| 322 | `views/web/dashboard/index.vue` | `views/web/dashboard/index.vue` | Vuex actions not found in any Pinia store: settings/getBanners |
| 323 | `views/web/exam/components/ActionChecker.vue` | `views/web/exam/components/ActionChecker.vue` | Vue2 lifecycle hooks not found in Vue3: clearCalc, created, data, handler, startCalc, timeChecker, onMounted |
| 324 | `views/web/exam/components/dialog/ExamApplyDialog.vue` | `views/web/exam/components/dialog/ExamApplyDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleApply, handleClose, handler, onMounted |
| 324 | `views/web/exam/components/dialog/ExamApplyDialog.vue` | `views/web/exam/components/dialog/ExamApplyDialog.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (3) |
| 325 | `views/web/exam/components/ExamCamNormal.vue` | `views/web/exam/components/ExamCamNormal.vue` | Vue2 lifecycle hooks not found in Vue3: data, destroyed, faceOut, fillEmpty, handleCamError, saveCapture, startTimer, onUnmounted |
| 325 | `views/web/exam/components/ExamCamNormal.vue` | `views/web/exam/components/ExamCamNormal.vue` | Condition branch count differs: Vue2 (6) vs Vue3 (8) |
| 326 | `views/web/exam/components/ExamFullMode.vue` | `views/web/exam/components/ExamFullMode.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fillPaper, focus, handleAction, handleFocus, handleSave, handler, onMounted |
| 326 | `views/web/exam/components/ExamFullMode.vue` | `views/web/exam/components/ExamFullMode.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (2) |
| 327 | `views/web/exam/components/ExamSocket.vue` | `views/web/exam/components/ExamSocket.vue` | Vue2 lifecycle hooks not found in Vue3: data, onMessage |
| 327 | `views/web/exam/components/ExamSocket.vue` | `views/web/exam/components/ExamSocket.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (3) |
| 328 | `views/web/exam/components/ExamStepMode.vue` | `views/web/exam/components/ExamStepMode.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, errorBack, fetchQuData, fillPaper, focusSub, handleAction, handleSave, handler, onMounted |
| 328 | `views/web/exam/components/ExamStepMode.vue` | `views/web/exam/components/ExamStepMode.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (6) |
| 329 | `views/web/exam/components/ExamTimer.vue` | `views/web/exam/components/ExamTimer.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, clearAll, countdown, created, data, fetchLeft, handler, initTime, onUnmounted, onBeforeUnmount, onMounted |
| 329 | `views/web/exam/components/ExamTimer.vue` | `views/web/exam/components/ExamTimer.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (5) |
| 330 | `views/web/exam/components/LeaveChecker.vue` | `views/web/exam/components/LeaveChecker.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, clearCalc, created, data, fullChecker, handler, leaveBack, mounted, saveIncr, startCalc, toggleFull, visibleChange, onUnmounted, onBeforeUnmount, onMounted |
| 331 | `views/web/exam/components/QuItemExam.vue` | `views/web/exam/components/QuItemExam.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, doPin, fillData, formatContent, handleAction, handleSave, handler, inputFocus, itemClick, markQu, subFocus, tinyInput, onMounted |
| 331 | `views/web/exam/components/QuItemExam.vue` | `views/web/exam/components/QuItemExam.vue` | Condition branch count differs: Vue2 (8) vs Vue3 (9) |
| 332 | `views/web/exam/components/ResultLeftNav.vue` | `views/web/exam/components/ResultLeftNav.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, created, data, goAnchor, handleScroll, mounted, onUnmounted, onBeforeUnmount, onMounted |
| 332 | `views/web/exam/components/ResultLeftNav.vue` | `views/web/exam/components/ResultLeftNav.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (3) |
| 333 | `views/web/exam/components/ResultQuList.vue` | `views/web/exam/components/ResultQuList.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, hasLink, userAnswer, onMounted |
| 333 | `views/web/exam/components/ResultQuList.vue` | `views/web/exam/components/ResultQuList.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (0) |
| 334 | `views/web/exam/WebExamBook.vue` | `views/web/exam/WebExamBook.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handelDelete, handleSelect, showDetail, startTrain, onMounted |
| 335 | `views/web/exam/WebExamCheck.vue` | `views/web/exam/WebExamCheck.vue` | Vue2 lifecycle hooks not found in Vue3: buttonNext, checkBack, created, data, faceBack, fetchData, formatContent, goBack, handleApply, handleBuy, handleCreate, showDeviceTest, onMounted |
| 335 | `views/web/exam/WebExamCheck.vue` | `views/web/exam/WebExamCheck.vue` | Condition branch count differs: Vue2 (8) vs Vue3 (7) |
| 336 | `views/web/exam/WebExamList/index.vue` | `views/web/exam/WebExamList/index.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleJoin, handler, toExam, onMounted |
| 337 | `views/web/exam/WebExamList/MyExamPage.vue` | `views/web/exam/WebExamList/MyExamPage.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, reload, toExamBook, toPaperList, onMounted |
| 338 | `views/web/exam/WebExamList/OpenExamPage.vue` | `views/web/exam/WebExamList/OpenExamPage.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleJoin, onMounted |
| 339 | `views/web/exam/WebExamResult/index.vue` | `views/web/exam/WebExamResult/index.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, handleBack, onMounted |
| 340 | `views/web/exam/WebExamResult/ResultDetail.vue` | `views/web/exam/WebExamResult/ResultDetail.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, onMounted |
| 341 | `views/web/exam/WebExamResult/ThanksOnly.vue` | `views/web/exam/WebExamResult/ThanksOnly.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, onMounted |
| 342 | `views/web/exam/WebExamResult/ThanksWithScore.vue` | `views/web/exam/WebExamResult/ThanksWithScore.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, onMounted |
| 343 | `views/web/exam/WebExamStart.vue` | `views/web/exam/WebExamStart.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, clearPage, countNotAnswered, created, data, doHandler, emptyCheck, enterFullscreen, fetchData, fetchQuData, fillCard, handDirect, handWithEx, handleAction, handleBreak, handleFocus, handleNext, handler, leaveBack, refreshNext, saveBack, onUnmounted, onBeforeUnmount, onMounted |
| 343 | `views/web/exam/WebExamStart.vue` | `views/web/exam/WebExamStart.vue` | Condition branch count differs: Vue2 (19) vs Vue3 (23) |
| 343 | `views/web/exam/WebExamStart.vue` | `views/web/exam/WebExamStart.vue` | Vuex actions not found in any Pinia store: app/setExamMode |
| 344 | `views/web/exam/WebPaperList.vue` | `views/web/exam/WebPaperList.vue` | Vue2 lifecycle hooks not found in Vue3: continueExam, created, data, showExam, onMounted |
| 345 | `views/web/mup.vue` | `views/web/mup.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, calcRetry, checkToken, created, data, fileUrl, handleSubmit, onUnmounted, onBeforeUnmount, onMounted |
| 345 | `views/web/mup.vue` | `views/web/mup.vue` | Vuex actions not found in any Pinia store: user/sync |
| 346 | `views/web/notice/WebNoticeDetail.vue` | `views/web/notice/WebNoticeDetail.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, formatContent, handleDetail, onMounted |
| 346 | `views/web/notice/WebNoticeDetail.vue` | `views/web/notice/WebNoticeDetail.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (5) |
| 347 | `views/web/notice/WebNoticeList.vue` | `views/web/notice/WebNoticeList.vue` | Vue2 lifecycle hooks not found in Vue3: data, toDetail |
| 347 | `views/web/notice/WebNoticeList.vue` | `views/web/notice/WebNoticeList.vue` | Condition branch count differs: Vue2 (0) vs Vue3 (1) |
| 348 | `views/web/plan/components/NodeCardAll.vue` | `views/web/plan/components/NodeCardAll.vue` | Vue2 lifecycle hooks not found in Vue3: buildShowThings, canShowActionButton, created, data, formatNodeType, handleSparringComplete, isInTimeWindow, loadSparringRole, shouldShowEndTime, timeState, toRecord, toTask, onMounted |
| 348 | `views/web/plan/components/NodeCardAll.vue` | `views/web/plan/components/NodeCardAll.vue` | Condition branch count differs: Vue2 (33) vs Vue3 (30) |
| 349 | `views/web/plan/WebPlanDetail.vue` | `views/web/plan/WebPlanDetail.vue` | Vue2 lifecycle hooks not found in Vue3: autoRefreshProgress, checkAndAutoRefresh, created, data, displayEndTime, extended, fetchDetail, handleQuery, handleRefresh, handleStart, pollDetailUntilStable, safeContent, shouldShowEndTime, submitStart, onMounted |
| 349 | `views/web/plan/WebPlanDetail.vue` | `views/web/plan/WebPlanDetail.vue` | Condition branch count differs: Vue2 (19) vs Vue3 (17) |
| 350 | `views/web/plan/WebPlanList/index.vue` | `views/web/plan/WebPlanList/index.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handler, reloadMy, onMounted |
| 351 | `views/web/plan/WebPlanList/MyPlanPage.vue` | `views/web/plan/WebPlanList/MyPlanPage.vue` | Vue2 lifecycle hooks not found in Vue3: data, handelView, reload, shouldShowEndTime |
| 352 | `views/web/plan/WebPlanList/OpenPlanPage.vue` | `views/web/plan/WebPlanList/OpenPlanPage.vue` | Vue2 lifecycle hooks not found in Vue3: data, handelView, handleJoin |
| 353 | `views/web/repo/components/MyRepoPage.vue` | `views/web/repo/components/MyRepoPage.vue` | Vue2 lifecycle hooks not found in Vue3: data, refresh, toBook, toTrainRecord |
| 354 | `views/web/repo/components/OpenRepoPage.vue` | `views/web/repo/components/OpenRepoPage.vue` | Vue2 lifecycle hooks not found in Vue3: data, handleJoin |
| 355 | `views/web/repo/components/QuDetailDialog.vue` | `views/web/repo/components/QuDetailDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handler, initValue, onMounted |
| 355 | `views/web/repo/components/QuDetailDialog.vue` | `views/web/repo/components/QuDetailDialog.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (3) |
| 356 | `views/web/repo/components/QuItemTrain.vue` | `views/web/repo/components/QuItemTrain.vue` | Vue2 lifecycle hooks not found in Vue3: checkAnswer, created, data, formatContent, handleCheck, handler, initValues, mounted, onMounted |
| 356 | `views/web/repo/components/QuItemTrain.vue` | `views/web/repo/components/QuItemTrain.vue` | Condition branch count differs: Vue2 (11) vs Vue3 (6) |
| 357 | `views/web/repo/components/QuMarkItem.vue` | `views/web/repo/components/QuMarkItem.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handelMarkFav, handler, initFav, initNotes, initValue, saveFavNote, showNoteDialog, showReport, onMounted |
| 357 | `views/web/repo/components/QuMarkItem.vue` | `views/web/repo/components/QuMarkItem.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (5) |
| 358 | `views/web/repo/components/QuReportDialog.vue` | `views/web/repo/components/QuReportDialog.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleClose, handler, saveReport, onMounted |
| 358 | `views/web/repo/components/QuReportDialog.vue` | `views/web/repo/components/QuReportDialog.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (3) |
| 359 | `views/web/repo/components/TrainRecordPage.vue` | `views/web/repo/components/TrainRecordPage.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handler, startTrain, toRefDetail, onMounted |
| 359 | `views/web/repo/components/TrainRecordPage.vue` | `views/web/repo/components/TrainRecordPage.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (9) |
| 360 | `views/web/repo/components/UserQuList.vue` | `views/web/repo/components/UserQuList.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleSelect, showDetail, startTrain, onMounted |
| 361 | `views/web/repo/train/WebTrainProcess.vue` | `views/web/repo/train/WebTrainProcess.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleSelect, showDetail, startTrain, onMounted |
| 362 | `views/web/repo/train/WebTrainRecord.vue` | `views/web/repo/train/WebTrainRecord.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, onMounted |
| 363 | `views/web/repo/train/WebTrainResult.vue` | `views/web/repo/train/WebTrainResult.vue` | Vue2 lifecycle hooks not found in Vue3: calcRate, created, data, handleBack, onMounted |
| 363 | `views/web/repo/train/WebTrainResult.vue` | `views/web/repo/train/WebTrainResult.vue` | Condition branch count differs: Vue2 (4) vs Vue3 (3) |
| 364 | `views/web/repo/train/WebTrainStart.vue` | `views/web/repo/train/WebTrainStart.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchNext, fetchPrevious, fetchQuDetail, handleFinish, handleRest, handlerStart, itemClass, switchQu, onMounted |
| 364 | `views/web/repo/train/WebTrainStart.vue` | `views/web/repo/train/WebTrainStart.vue` | Condition branch count differs: Vue2 (12) vs Vue3 (0) |
| 365 | `views/web/repo/user/WebUserQuFav.vue` | `views/web/repo/user/WebUserQuFav.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, startTrain, onMounted |
| 366 | `views/web/repo/user/WebUserQuNotes.vue` | `views/web/repo/user/WebUserQuNotes.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, startTrain, onMounted |
| 367 | `views/web/repo/WebRepoDetail.vue` | `views/web/repo/WebRepoDetail.vue` | Vue2 lifecycle hooks not found in Vue3: conTrain, created, data, fetchLatest, fetchStat, goBack, moreTrain, processFormat, startTrain, toFav, toNotes, toProcess, onMounted |
| 368 | `views/web/repo/WebRepoList.vue` | `views/web/repo/WebRepoList.vue` | Vue2 lifecycle hooks not found in Vue3: conTrain, data, handler, mounted, refreshMy, onMounted |
| 368 | `views/web/repo/WebRepoList.vue` | `views/web/repo/WebRepoList.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (2) |
| 369 | `views/web/ucenter/bind.vue` | `views/web/ucenter/bind.vue` | API calls differ between Vue2 and Vue3 |
| 369 | `views/web/ucenter/bind.vue` | `views/web/ucenter/bind.vue` | Vue2 lifecycle hooks not found in Vue3: bindCropWechat, bindDing, bindWechat, created, data, emptyLogin, enabledListData, fetchList, fixMap, handleBind, handleUnbind, onMounted |
| 369 | `views/web/ucenter/bind.vue` | `views/web/ucenter/bind.vue` | Condition branch count differs: Vue2 (9) vs Vue3 (4) |
| 370 | `views/web/ucenter/capability.vue` | `views/web/ucenter/capability.vue` | Vue2 lifecycle hooks not found in Vue3: beforeDestroy, data, fetchData, getScoreType, initChart, mounted, resizeChart, onUnmounted, onBeforeUnmount, onMounted |
| 370 | `views/web/ucenter/capability.vue` | `views/web/ucenter/capability.vue` | Condition branch count differs: Vue2 (5) vs Vue3 (7) |
| 371 | `views/web/ucenter/components/BindMobile.vue` | `views/web/ucenter/components/BindMobile.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, doBind, handleClose, handleSuccess, handler, unBind, onMounted |
| 371 | `views/web/ucenter/components/BindMobile.vue` | `views/web/ucenter/components/BindMobile.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (9) |
| 372 | `views/web/ucenter/im.vue` | `views/web/ucenter/im.vue` | Vue2 lifecycle hooks not found in Vue3: data, formatContent, formatTime, handelDelete, handleMark, handleSelect, handler, hasUnresolvedPlaceholder, refresh, showDetail |
| 372 | `views/web/ucenter/im.vue` | `views/web/ucenter/im.vue` | Vuex actions not found in any Pinia store: user/fetchMsg |
| 373 | `views/web/ucenter/info.vue` | `views/web/ucenter/info.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, fetchData, showBind, toInit, toReal, updateInfo, onMounted |
| 373 | `views/web/ucenter/info.vue` | `views/web/ucenter/info.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (0) |
| 374 | `views/web/ucenter/init.vue` | `views/web/ucenter/init.vue` | Vue2 lifecycle hooks not found in Vue3: created, data, handleUpdate, onMounted |
| 374 | `views/web/ucenter/init.vue` | `views/web/ucenter/init.vue` | Condition branch count differs: Vue2 (2) vs Vue3 (4) |
| 374 | `views/web/ucenter/init.vue` | `views/web/ucenter/init.vue` | Vuex actions not found in any Pinia store: user/logout |
| 375 | `views/web/ucenter/pass.vue` | `views/web/ucenter/pass.vue` | Vue2 lifecycle hooks not found in Vue3: data, handleUpdate |
| 375 | `views/web/ucenter/pass.vue` | `views/web/ucenter/pass.vue` | Condition branch count differs: Vue2 (3) vs Vue3 (4) |
| 375 | `views/web/ucenter/pass.vue` | `views/web/ucenter/pass.vue` | Vuex actions not found in any Pinia store: user/logout |
| 376 | `views/web/ucenter/points.vue` | `views/web/ucenter/points.vue` | Vue2 lifecycle hooks not found in Vue3: data |
| 377 | `views/web/ucenter/real.vue` | `views/web/ucenter/real.vue` | Vue2 lifecycle hooks not found in Vue3: confirmSubmit, created, data, fetchDetail, handleSubmit, onMounted |
| 377 | `views/web/ucenter/real.vue` | `views/web/ucenter/real.vue` | Condition branch count differs: Vue2 (1) vs Vue3 (2) |

## 五、详细分析 (抽样显示前 10 项)

以下为所有发现的问题详情 (按严重程度排序):

### 1. `api/ai/answer.js` → `components/ComponentsBase/FormComponent/FormTreeSelect.vue`

- **级别**: P3

### 2. `App.vue` → `App.vue`

- **级别**: P1
- ⚠️ lifecycle_hook_missing: Vue2 lifecycle hooks not found in Vue3: $route, beforeDestroy, created, data, fetchMsgOnce, fetchMsgTimer, handler, onUnmounted, onBeforeUnmount, onMounted
- ⚠️ branch_count_mismatch: Condition branch count differs: Vue2 (6) vs Vue3 (12)
- ⚠️ vuex_not_migrated: Vuex actions not found in any Pinia store: user/fetchMsg

### 3. `components/ComponentsBase/ComponentsFile/ComponentsLive/LivePlayer.vue` → `components/ComponentsBase/ComponentsFile/ComponentsLive/LivePlayer.vue`

- **级别**: P1
- ⚠️ lifecycle_hook_missing: Vue2 lifecycle hooks not found in Vue3: created, data, handler, onMounted

### 4. `components/ComponentsBase/ComponentsFile/ComponentsLive/PrismPlayer.vue` → `components/ComponentsBase/ComponentsFile/ComponentsLive/PrismPlayer.vue`

- **级别**: P1
- ⚠️ lifecycle_hook_missing: Vue2 lifecycle hooks not found in Vue3: beforeDestroy, data, destroyPlayer, initPlayer, mounted, startPlay, onUnmounted, onBeforeUnmount, onMounted
- ⚠️ branch_count_mismatch: Condition branch count differs: Vue2 (1) vs Vue3 (3)

### 5. `components/ComponentsBase/ComponentsFile/ComponentsLive/Recorder.vue` → `components/ComponentsBase/ComponentsFile/ComponentsLive/Recorder.vue`

- **级别**: P1
- ⚠️ lifecycle_hook_missing: Vue2 lifecycle hooks not found in Vue3: beforeDestroy, clearFilled, clearRecord, created, data, fillValue, formatSec, getPermission, mounted, playRecord, playRun, saveRecord, startRecord, stopRecord, onUnmounted, onBeforeUnmount, onMounted
- ⚠️ branch_count_mismatch: Condition branch count differs: Vue2 (6) vs Vue3 (8)

### 6. `components/ComponentsBase/ComponentsFile/FileUpload/FileUpload.vue` → `components/ComponentsBase/ComponentsFile/FileUpload/FileUpload.vue`

- **级别**: P1
- ⚠️ lifecycle_hook_missing: Vue2 lifecycle hooks not found in Vue3: cancelAllUploads, created, data, fetchConfig, fileDeleted, fileProgress, fileSelected, fileSuccess, fillAccept, fillValue, handler, mounted, successBack, onMounted
- ⚠️ branch_count_mismatch: Condition branch count differs: Vue2 (4) vs Vue3 (3)

### 7. `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadCos.vue` → `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadCos.vue`

- **级别**: P1
- ⚠️ lifecycle_hook_missing: Vue2 lifecycle hooks not found in Vue3: beforeRemove, beforeUpload, buildName, created, data, default, fetchConfig, fillValue, handleChange, handleCropCancel, handleExceed, handleImageCrop, handleRemove, handleSuccess, handler, manualUpload, mounted, onMounted
- ⚠️ branch_count_mismatch: Condition branch count differs: Vue2 (5) vs Vue3 (10)

### 8. `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadLocal.vue` → `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadLocal.vue`

- **级别**: P1
- ⚠️ lifecycle_hook_missing: Vue2 lifecycle hooks not found in Vue3: beforeRemove, beforeUpload, created, data, default, fillValue, handleChange, handleCropCancel, handleExceed, handleImageCrop, handleRemove, handleSuccess, handler, manualUpload, onMounted
- ⚠️ branch_count_mismatch: Condition branch count differs: Vue2 (7) vs Vue3 (8)

### 9. `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadOss.vue` → `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadOss.vue`

- **级别**: P1
- ⚠️ lifecycle_hook_missing: Vue2 lifecycle hooks not found in Vue3: abortMultipartUpload, addUploadTask, beforeDestroy, beforeRemove, beforeUpload, buildName, cancelAllUploads, cancelUploadByUid, cleanup, created, data, effectiveLimit, emitProgressEvent, fetchConfig, fillValue, handleChange, handleCropCancel, handleError, handleExceed, handleFileObjects, handleImageCrop, handleImageWithCrop, handleRemove, handleSuccess, handleUploadError, handler, initializeComponent, isCropperEnabled, isUploadCancelled, manualUpload, removeUploadTask, startFileUpload, uploadFileWithProgress, onUnmounted, onBeforeUnmount, onMounted
- ⚠️ branch_count_mismatch: Condition branch count differs: Vue2 (22) vs Vue3 (20)

### 10. `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadPublic.vue` → `components/ComponentsBase/ComponentsFile/FileUpload/FileUploadPublic.vue`

- **级别**: P1
- ⚠️ lifecycle_hook_missing: Vue2 lifecycle hooks not found in Vue3: beforeDestroy, beforeRemove, buildName, cancelAllUploads, created, data, effectiveLimit, fetchConfig, handleChange, handleError, handleExceed, handleRemove, handleSuccess, handler, manualUpload, onUnmounted, onBeforeUnmount, onMounted

---

> **审计工具**: Qoder Migration Audit v1.0.0
> **运行命令**: `npm run audit:run`
