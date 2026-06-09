# 2026-06-08 code-review 技术债汇总

以下 8 条不是本次改动直接引入的"必坏 bug"，但都属于 review 跑出来的"约定违反 / 设计风险 / 已有代码债"。不阻塞合并，归到本目录待排期。

## 1. PlanServiceImpl.listNotifyUsers 手写 setter 映射

- **文件**: `E:\rhProject\wk-train-center-service\yf-modules\yf-module-plan\src\main\java\com\yf\plan\modules\admin\plan\service\impl\PlanServiceImpl.java:223-233`
- **现象**: 用 `users.stream().map(u -> { dto.setXxx(u.getXxx()); ... }).collect(...)` 手写 SysUser→SysUserSimpleDTO；同文件第 80/137/142/158/244 行均用 `BeanMapper.copy` 约定
- **风险**: 后续 SysUserSimpleDTO 加字段（如 deptName）时，本方法会漏改，导致双源数据漂移
- **建议**: 改用 `BeanMapper.copy` 或 `BeanMapper.mapList(users, SysUserSimpleDTO.class)`
- **严重度**: 🟦 长期
- **状态**: [x] 已修复（2026-06-08 工作树）
  - 改用 `BeanMapper.mapList(users, SysUserSimpleDTO.class)` 单行
  - 删除不再使用的 `import java.util.stream.Collectors`

## 2. 3 个反向引用 mapper 缺统一 blank-check 约定

- **文件**:
  - `E:\rhProject\wk-train-center-service\yf-ability\src\main\java\com\yf\ability\plan\service\impl\PlanPreServiceImpl.java:134`（在 service 层做了 blank-check）
  - `E:\rhProject\wk-train-center-service\yf-modules\yf-module-course\src\main\java\com\yf\course\modules\admin\service\impl\CourseServiceImpl.java:117`（wrapper 没做，靠底层 service 守）
  - `E:\rhProject\wk-train-center-service\yf-modules\yf-module-exam\src\main\java\com\yf\exam\modules\admin\exam\service\impl\ExamServiceImpl.java:218`（同上）
  - `E:\rhProject\wk-train-center-service\yf-modules\yf-module-course\src\main\java\com\yf\course\modules\admin\service\impl\CourseRefFileServiceImpl.java:128`（自己 service 做）
  - `E:\rhProject\wk-train-center-service\yf-modules\yf-module-exam\src\main\java\com\yf\exam\modules\admin\tmpl\service\impl\TmplServiceImpl.java:72`（自己 service 做）
- **现象**: 5 个新方法里 3 种 blank-check 模式混用，且 mapper XML 自身无防御
- **风险**: 未来绕过 service 的直接 mapper 调用会全表扫；约定不一致
- **建议**: 项目级约定"新增 paged mapper 接口必须在 SQL 入口判空"或"AOP 拦截"，避免散落 5 处
- **严重度**: 🟦 长期

## 3. PlanController.notifyUsers 权限粒度过粗

- **文件**: `E:\rhProject\wk-train-center-service\yf-modules\yf-module-plan\src\main\java\com\yf\plan\modules\admin\plan\controller\PlanController.java:155`
- **现象**: `/api/plan/plan/notify-users` 复用 `@RequiresPermissions("plan:plan:list")`，但接口返回 `SysUserSimpleDTO`（id+userName+realName），PII 暴露面与"看计划"语义不一致
- **风险**: 仅该看计划列表的运营角色可 dump 所有 PERSON 计划下指派人员的真实姓名
- **建议**: 拆出独立权限 `plan:notify:user:list`，加到 Shiro/权限配置
- **严重度**: 🟦 长期（合规风险）

## 4. PlanPreCheckMapper XML 缺 (ref_id, node_type) 联合索引

- **文件**: `E:\rhProject\wk-train-center-service\yf-ability\src\main\resources\mapper\plan\PlanPreCheckMapper.xml:60`
- **现象**: WHERE 顺序 `(node_type, ref_id)`，反向引用场景（按 courseId 查所有引用它的 plan）走不到最优索引
- **风险**: 重数据量下退化为 ref_id 索引 scan，附 join el_plan 后变慢
- **建议**: 提个 DDL：`ALTER TABLE el_plan_node ADD INDEX idx_ref_type (ref_id, node_type);`
- **严重度**: 🟦 长期（性能债）

## 5. api/ai/common.js extractAppTextFromChunk 过度复杂

- **文件**: `E:\rhProject\wk-train-center-ui\src\api\ai\common.js:178-225`
- **现象**: 把 fileListSources 二维数组 + 双层去重循环 + 两个 Set 合并，重复"扁平 + 去重"步骤
- **风险**: 后续要改 image_list / file_list 合并规则时需在 3 处同步
- **建议**: 改写为 `[...new Set([].concat(...).filter(Boolean).map(String))]` 单行
- **严重度**: 🟦 可维护性

## 6. api/ai/common.js streamDebug 调试代码长期在线

- **文件**: `E:\rhProject\wk-train-center-ui\src\api\ai\common.js:815-825, 868-885, 932-942`
- **现象**: 生产 bundle 中始终存在 `streamDebug` 分支 + `window.__aiStreamDebug__` 全局 + `console.warn`
- **风险**: hot stream loop 多一个 localStorage 读 + 潜在 window 全局污染
- **建议**: 用 build-time 的 `process.env.NODE_ENV === 'development'` 守护（Vite 编译时 dead-code-eliminate）
- **严重度**: 🟦 可优化

## 7. chatSession.js onDone 重复设置 fileList（死代码）

- **文件**: `E:\rhProject\wk-train-center-ui\src\views\web\ai\components\AiAssistant\shared\chatSession.js:278-285`
- **现象**: onMessage (line 263) 每个 chunk 已设 `state.messages[aiMsgIndex].fileList`，onDone (line 278) 再设一次等价
- **风险**: 维护时改一边忘改另一边
- **建议**: 删 onDone 的 4 行
- **严重度**: 🟦 可维护性

## 8. AiMessageList handlePreviewAiFile 事件链依赖父组件监听

- **文件**:
  - `E:\rhProject\wk-train-center-ui\src\views\web\ai\components\AiAssistant\AiMessageList.vue:311-321`
  - `E:\rhProject\wk-train-center-ui\src\views\web\ai\components\AiAssistant\shared\AiChatPanel.vue:17`
- **现象**: emit 'preview-file' 后由 AiChatPanel 转发，再到父组件 AnswerAssistantView/TrainingAssistantView 处理
- **风险**: 未来新增父容器直接用 <AiMessageList/> 不接事件时，点击 AI 附件是静默 no-op
- **建议**: 在 AiMessageList 内部加 fallback：未监听时弹 `window.open(url, '_blank')`
- **严重度**: 🟦 长期（防御性）
