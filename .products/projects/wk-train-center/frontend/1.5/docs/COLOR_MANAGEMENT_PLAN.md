# 颜色管理系统实施规划

> 版本：v1.0  日期：2026-04-23  项目：wk-train-center-ui

## 引用规范

| 规范文件 | 相关内容 |
|----------|----------|
| [01-架构规范.md](../.qoder/rules/01-架构规范.md) | 样式文件位置、入口文件 |
| [05-代码规范.md](../.qoder/rules/05-代码规范.md) | CSS 类名必须使用 kebab-case |

## 背景

为 Vue 2 → Vue 3 平滑过渡准备，采用 CSS 变量实现统一颜色管理。

## 规范约束

### 样式文件位置
```
src/
└── styles/           # ✅ 样式文件统一放此处
    ├── colors.css    # 新增：统一颜色变量
    ├── variables.scss
    ├── index.scss
    └── ...
```

### CSS 类名命名（必须遵循）
- CSS 类名必须使用 **kebab-case**
- 示例：`.dash-bg`, `.banner-box`, `.card-item`

### CSS 变量命名（新增规范）
- 统一使用 `--color-` 前缀
- 示例：`--color-primary`, `--color-text-regular`

## 当前进度

| 阶段 | 状态 | 说明 |
|------|------|------|
| 阶段一：基础设施 | ✅ 已完成 | 已创建 colors.css，已更新 index.scss 和 sidebar.scss |
| 阶段二：高优先级替换 | ✅ 已完成 | 首页组件、登录页、公告列表已完成 |
| 阶段三：全面替换 | ⏳ 进行中 | 已更新 index.scss, mixin.scss, mup.vue, ucenter 等 |

---

## 阶段一：建立基础设施 ✅

### 1.1 创建统一颜色变量文件
- [x] 创建 `src/styles/colors.css`
- [x] 定义品牌主色、语义色、中性色、专用色等
- [x] 包含 30+ 个 CSS 变量

### 1.2 更新样式入口文件
- [x] 在 `index.scss` 中引入 `colors.css`
- [x] 替换 `index.scss` 中的硬编码颜色为 CSS 变量
- [x] 替换 `sidebar.scss` 中的 SCSS 变量为 CSS 变量

---

## 阶段二：高优先级替换 ✅ 已完成

### 2.1 首页组件颜色替换
- [x] `src/views/web/dashboard/index.vue` 首页主文件
- [x] `WebRecentCourses.vue` 最近在学课程卡片
- [x] `WebRecommendCourses.vue` 课程推荐
- [x] `WebStatNums.vue` 学习概览统计
- [x] `WebTaskCenter.vue` 任务中心
- [x] `WebLearningDynamics.vue` 学习动态
- [x] `WebNoticeList.vue` 公告列表
- [x] `WebQuickOpt.vue` 快捷入口

### 2.2 登录页样式统一
- [x] `src/styles/login.scss`

### 2.3 考试相关组件颜色替换 ✅ 部分完成
- [x] `QuItemExam.vue` 题目组件
- [x] `ExamTimer.vue` 考试计时器
- [x] `ExamFullMode.vue` 整卷模式
- [x] `ActionChecker.vue` 动作检测
- [x] `ResultLeftNav.vue` 结果左侧导航
- [x] `ThanksWithScore.vue` 感谢+分数页面
- [x] `ThanksOnly.vue` 仅感谢页面

### 2.4 全局样式文件替换 ✅ 本次新增
- [x] `src/styles/index.scss` - 全局样式（20+ 处替换）
- [x] `src/styles/mixin.scss` - 滚动条样式
- [x] `src/styles/page.scss` - 页面通用样式
- [x] `src/styles/login.scss` - 登录页样式

### 2.5 其他页面组件替换 ✅ 本次新增
- [x] `src/views/web/exam/check.vue` - 支付检查
- [x] `src/views/web/exam/exam.vue` - 考试主页
- [x] `src/views/web/exam/components/dialog/ExamApplyDialog.vue` - 申请弹窗
- [x] `src/views/web/exam/components/views/MyExamPage.vue` - 我的考试
- [x] `src/views/web/repo/detail.vue` - 练习详情
- [x] `src/views/web/mup.vue` - 通用上传
- [x] `src/views/web/ucenter/im.vue` - 站内消息
- [x] `src/views/web/ucenter/capability.vue` - 能力中心

### 2.6 颜色变量扩展 ✅ 本次新增
- [x] 添加计划节点标签色 `--color-tag-*`
- [x] 添加 `--color-tag-activity`, `--color-tag-course`, `--color-tag-survey`, `--color-tag-battle`
- [x] 添加问答/评论专用色 `--color-tp-nick`, `--color-chat-*`
- [x] 添加直播/实时专用色 `--color-live-current`
- [x] 添加其他文字色 `--color-text-muted`

### 2.7 剩余 25 处替换 ✅ 已完成
#### 练习模块
- [x] `repo/train/result.vue` - 结果页（答对/已答/总共颜色）
- [x] `repo/components/QuItemTrain.vue` - 练习题目（答案/解析颜色）
- [x] `repo/train/training.vue` - 训练页（背景/边框/文字颜色）
- [x] `repo/detail.vue` - 练习详情（支付价格/正确率）

#### 课程模块
- [x] `course/detail.vue` - 课程详情（锁定图标/文件边框/印章）
- [x] `course/components/dialog/CourseQaDetailDialog.vue` - 问答弹窗（聊天气泡）
- [x] `course/components/views/MyCoursePage.vue` - 我的课程
- [x] `course/components/views/LecturerCenterPage.vue` - 讲师中心
- [x] `course/components/views/OpenCoursePage.vue` - 公开课程
- [x] `course/components/CourseLive.vue` - 课程直播
- [x] `course/components/CourseQa.vue` - 课程问答
- [x] `course/components/FilePlayer.vue` - 文件播放器
- [x] `course/components/AIPPT/WebAiPptGeneratorButton.vue` - AI生成PPT按钮

#### AI 模块
- [x] `ai/components/SparringDialog.vue` - 对练对话框

#### 用户中心
- [x] `ucenter/init.vue` - 初始化页
- [x] `ucenter/bind.vue` - 绑定页
- [x] `ucenter/real.vue` - 实名认证
- [x] `ucenter/pass.vue` - 密码页

#### 全局样式
- [x] `styles/element-ui.scss` - Element-UI 扩展样式

---

## 阶段三：全面替换

### 3.1 全局扫描
- [ ] 扫描 `src/views/` 下所有 Vue 组件
- [ ] 扫描 `src/components/` 下所有组件
- [ ] 生成硬编码颜色清单

### 3.2 分类替换
- [ ] 通用工具类样式替换
- [ ] 业务组件样式替换
- [ ] 页面私有样式替换

### 3.3 建立规范文档
- [ ] 颜色使用规范说明
- [ ] 新增颜色的命名规则
- [ ] 迁移检查清单

---

## 执行清单

```markdown
## 待执行任务

### 首页组件
- [ ] WebRecentCourses.vue    - 最近在学课程卡片
- [ ] WebNoticeList.vue       - 公告列表
- [ ] WebCourseCard.vue        - 课程卡片组件

### 考试模块
- [ ] exam/index.vue           - 考试主页
- [ ] exam/answer.vue          - 答题页面
- [ ] exam/answerCard.vue      - 答题卡组件

### 通用组件
- [ ] components/ 目录下业务组件

### 其他
- [ ] login.scss               - 登录页样式
- [ ] page.scss                - 页面通用样式
```

---

## 颜色变量参考表

| 变量名 | 默认值 | 用途 |
|--------|--------|------|
| `--color-primary` | #002fa7 | 品牌主色 |
| `--color-success` | #13ce66 | 成功色 |
| `--color-warning` | #ffba00 | 警告色 |
| `--color-danger` | #ff4949 | 危险色 |
| `--color-exam-question` | #5794f7 | 题目序号蓝 |
| `--color-exam-current` | #ffba00 | 当前题目黄 |
| `--color-exam-right` | #1890ff | 答对蓝 |
| `--color-exam-error` | #ff4b50 | 答错红 |
