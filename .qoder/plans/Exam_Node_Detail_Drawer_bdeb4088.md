
## 需求分析

用户在 `PlanNodeView.vue` 中看到每个学员的考试节点状态徽章（完成/延期完成/未完成/进行中），点击徽章后需要展示该学员在该计划中该考试的详细数据：
- 考了几次（正考次数）
- 补考了几次
- 每次的分数
- 每次用了多少时间

## 数据源

`el_paper` 表已包含所有所需数据：
- `plan_id` - 计划隔离
- `user_id` - 学员
- `exam_id` - 考试（对应 `el_plan_node.ref_id`）
- `user_score` - 分数
- `user_time` - 用时（秒）
- `is_makeup` - 是否补考
- `hand_time` - 交卷时间
- `passed` - 是否通过
- `valid` / `mark_invalid` - 是否有效

## 实现方案

### 1. 后端：新增 API 接口

**文件**: `PlanStatController.java`
- 路径: `POST /api/plan/stat/exam-detail`
- 参数: `planId`, `userId`, `examId`
- 返回: 该学员在该计划中该考试的所有试卷记录列表

**文件**: `PlanStatService.java` / `PlanStatServiceImpl.java`
- 新增方法 `findExamDetail(planId, userId, examId)`
- 查询 `el_paper` 表，条件: `plan_id=? AND user_id=? AND exam_id=? AND valid=1 AND IFNULL(mark_invalid,0)=0`
- 按 `create_time` 升序排列

**DTO**: 新建 `ExamDetailRespDTO`
- `examTitle` - 考试标题
- `totalScore` - 总分
- `qualifyScore` - 及格分
- `records` - 考试记录列表
  - `tryNo` - 第几次（正考=1, 补考=2,3...）
  - `isMakeup` - 是否补考
  - `userScore` - 分数
  - `userTime` - 用时（秒）
  - `passed` - 是否通过
  - `handTime` - 交卷时间

### 2. 前端：新增抽屉组件

**文件**: `src/views/admin/plan/stat/components/ExamDetailDrawer.vue`（新建）
- Props: `visible`, `planId`, `userId`, `examId`, `examTitle`
- 调用 `/api/plan/stat/exam-detail` 获取数据
- 展示表格：次数 | 类型（正考/补考）| 分数 | 用时 | 结果 | 交卷时间
- 底部汇总：共考 X 次，正考 Y 次，补考 Z 次，最高分 XX

### 3. 前端：修改 PlanNodeView.vue

- 考试节点徽章添加 `@click` 事件
- 点击时打开 `ExamDetailDrawer`
- 传递 `planId`, `row.userId`, `item.refId`（考试ID）, `item.title`（考试标题）
- 仅考试类型节点可点击（`item.nodeType === 'exam'`），课程节点保持原样

### 4. 前端：API 层

**文件**: `src/api/plan/stat.js`
- 新增 `fetchExamDetail(data)` 方法

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `PlanStatController.java` | 修改 | 新增 `exam-detail` 接口 |
| `PlanStatService.java` | 修改 | 新增 `findExamDetail` 方法声明 |
| `PlanStatServiceImpl.java` | 修改 | 新增 `findExamDetail` 实现 |
| `ExamDetailRespDTO.java` | 新建 | 考试详情响应 DTO |
| `stat.js` (API) | 修改 | 新增 `fetchExamDetail` |
| `ExamDetailDrawer.vue` | 新建 | 考试详情抽屉组件 |
| `PlanNodeView.vue` | 修改 | 徽章添加点击事件 + 引入抽屉 |

## 验证要点

1. 点击考试节点徽章，弹出抽屉
2. 抽屉显示该学员在该计划中该考试的所有有效试卷记录
3. 正考/补考区分正确（`is_makeup` 字段）
4. 分数和用时显示正确
5. 数据按计划隔离（不同计划的同一考试互不干扰）
6. 课程节点徽章不可点击（或点击无反应）
