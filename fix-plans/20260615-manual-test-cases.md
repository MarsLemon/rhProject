# 培训计划「必须学习」移除 — 手动测试用例

> 日期：2026-06-17
> 用途：你（用户）自己跑，不是 AI 自动跑
> 范围：admin 端 UI + 学员端 UI + 后端 API + 数据库 schema

---

## 测试环境速查

| 项 | 值 |
|---|---|
| Admin 前端 | <http://localhost:4212/admin> |
| 学员端 | <http://localhost:4212/web> |
| 后端 API | <http://localhost:8101>（dev 后端） |
| Admin 账号 | `admin` / `admin` |
| 测试计划 ID | `2067063118737371137`（"asda"）<br/>`2064513227678154754`（"asdas"） |
| 数据库 | `47.105.122.150:31101` / `wk_train_center`（`dev_root` / `123456`） |

---

## 0. 前置确认（5 分钟）

每条测试开始前先过这一节，确保基础环境 OK。

### 0.1 DDL 已执行

用任意 MySQL 客户端（DBeaver / Navicat / 命令行）连 dev DB，跑：

```sql
SHOW COLUMNS FROM el_plan_node LIKE 'required';
```text

**预期**：Empty set（无结果）

如果返回有 `required` 字段 → **DDL 没跑**，先执行 [drop_plan_node_required_column.sql](wk-train-center-service/sql/1.5/plan/drop_plan_node_required_column.sql) 再继续。

### 0.2 dev 后端可达

浏览器或 Postman 打开：<http://localhost:8101/>

**预期**：返回 Spring Boot 默认错误页（Whitelabel Error Page）或 404 页面（说明服务在跑）

如果连不上 → 启动后端后再继续

### 0.3 admin 能登录

1. 打开 <http://localhost:4212/admin>
2. 输入 `admin` / `admin`
3. 点击登录

**预期**：进入管理后台主页，左侧菜单包含「学习项目 → 学习任务」

---

## 1. 管理端 UI 测试（10 分钟）

### 1.1 [P0] 计划列表 — 不再含「必学」相关字样

**步骤**：

1. 进入「学习项目 → 学习任务」
2. 看列表的列头
3. F12 打开 DevTools → Network 标签
4. 刷新页面，捕获 `/api/plan/plan/paging` 请求
5. 点击「Response」标签看返回 JSON

**预期**：

- ✅ 列表能正常显示 2 条计划（"asda"、"asdas"）
- ✅ 列表列头**不应**含「必学项目」「必学」「required」字段
- ✅ Network 响应 JSON 搜 `required` 关键字 → 0 命中

**失败判定**：列头出现「必学项目」或 JSON 响应含 `required` 字段

### 1.2 [P0] 创建计划 — 节点配置不出现「必学」勾选框

**步骤**：

1. 点击「新建学习任务」
2. 填写：标题 `test_必学移除验证`，分类选「企业内训」，起止时间覆盖今天
3. 切到「环节 / 任务」Tab
4. 添加一个分组，命名 `测试分组`
5. 点击「添加节点」按钮
6. 在弹出的节点选择对话框里选任意课程

**预期**：

- ✅ 节点成功添加到分组
- ✅ 节点卡片只显示：类型标签、标题、完成条件下拉、开始/结束时间
- ❌ **不应**出现「是否必学」「必学项目」「required」勾选框或开关
- F12 检查 Network：保存请求 `/api/plan/plan/save` 的 body 不含 `required` 字段

**失败判定**：任何位置出现「必学」UI 或保存请求 body 含 `required`

### 1.3 [P0] 编辑已有计划 — 节点配置无「必学」选项

**步骤**：

1. 在计划列表点击 `asda` 进入详情
2. 点击「编辑」按钮
3. 找任意一个节点（"电喷主机维保质量管理"），点击「编辑」

**预期**：

- ✅ 节点编辑弹窗打开
- ✅ 只有「完成条件」「开始时间」「结束时间」字段
- ❌ **不应**出现「必学」勾选框

**失败判定**：节点编辑弹窗出现「必学」勾选框

### 1.4 [P1] 学员列表 — 列名改为「项目数」

**步骤**：

1. 进入 `asda` 计划详情
2. 切到「学员」Tab（如果有）或「统计分析」入口
3. 查看学员记录列表

**预期**：

- ✅ 表格列头显示「项目数」
- ❌ **不应**显示「必学项目」
- ✅ 「项目数」列的数字 = 该计划的非 sparring 节点总数（asda 计划 1 个 course 节点 = `1`）

**失败判定**：列头仍显示「必学项目」

### 1.5 [P0] 统计详情页 — 不报 ColumnNotFound

**步骤**：

1. 进入「统计分析管理 → 培训统计」（如果菜单存在）
2. 选择任一计划查看详情
3. F12 → Network 看 `/api/plan/stat/detail` 响应

**预期**：

- ✅ 页面正常加载
- ✅ Network 响应 code=0，body 搜 `required` 字段 → 0 命中
- ❌ **不应**报 HTTP 500 或 "ColumnNotFound" 错误

**失败判定**：HTTP 500 或响应含 `required` 字段

---

## 2. 学员端 UI 测试（10 分钟）

### 2.1 [P0] 计划详情 — 节点卡片无「请先开始任务」状态

**步骤**：

1. 用一个**已经能访问 `asda` 计划**的学员账号登录 <http://localhost:4212/web>
2. 进入「我的学习任务」或「培训项目」入口
3. 找到 `asda` 计划
4. 如果显示「开始任务」按钮 → 先点开始
5. 进入计划详情页

**预期**：

- ✅ 节点卡片正常显示
- ✅ 1 个 course 节点显示「去学习」按钮（**未完成**状态）
- ❌ **不应**出现「请先开始任务」灰色文案
- ❌ **不应**有节点保持「未解锁」状态

**失败判定**：任何节点显示「请先开始任务」

### 2.2 [P0] 点击节点进入课程

**步骤**：

1. 在计划详情点「去学习」按钮
2. 观察跳转

**预期**：

- ✅ 跳转到课程详情页（不报错）
- ✅ 课程正常展示，可播放
- ⏳ 如果节点设置了未来 `start_time`，**应该**弹出友好提示「节点尚未开始」（这是 preCheck 时间窗的软提示，按方向 A 保留）

**失败判定**：HTTP 500 / 白屏 / 跳到错误页

### 2.3 [P1] 计划刷新 — 进度自动同步

**步骤**：

1. 进入课程并学完一部分内容
2. 返回计划详情
3. 点击「刷新进度」按钮

**预期**：

- ✅ 节点「未完成/已完成」状态正确
- ✅ 无控制台报错
- ⏳ 进度可能因异步任务（finishNotify）有 24 小时延迟，这是**已知行为**

**失败判定**：刷新后状态异常 / HTTP 500

#### 2.4 [P0] 节点时间窗外按钮隐藏 + 时间标红

**步骤**：

1. 在 `asda` 计划里找一个 `startTime` 在未来或 `endTime` 已过的节点
2. 学员端打开计划详情

**预期**：

- ✅ 该节点的「去学习 / 去考试 / 去陪练」**按钮消失**
- ✅ 任务状态显示「⏰ 未开始」或「⏰ 已结束」红色文字
- ✅ 「开始时间」文字在 startTime 未到时**变红**，前面带 ⏰ 图标
- ✅ 「结束时间」文字在 endTime 已过时**变红**，前面带 ⏰ 图标
- ✅ 右下角「未完成」图标被红色锁定图标（`ps-locked`）替代，半透明
- ✅ sparring（陪练）节点**不受**时间窗限制（按钮仍显示）

**失败判定**：

- 节点未到开始时间但「去学习」按钮仍亮
- 时间文字没标红 / 没用警示色
- sparring 节点时间窗外按钮消失（这是 bug — 陪练应不受限）

**对照后端防御**：万一前端 JS 报错或被绕过，学员点进课程页面会被后端 `PlanPreServiceImpl.preCheck` 拦截，弹「节点尚未开始」错误（按方向 A 保留此防御层）

#### 2.5 [P1] 结束时间超 1 年隐藏

**背景**：admin 端给节点设置 endTime 时常用「2099-12-31 23:59:59」之类的"永不结束"占位值，UI 显示给学员没意义。前端按 "endTime 距今 > 1 年" 隐藏该行，**数据本身保留在 node.endTime**，不影响后端 preCheck 等逻辑。

**步骤**：

1. 在 admin 端新建或编辑计划，给某个节点设置 endTime 为 `2099-12-31 23:59:59`（或距今 1 年之后的任意日期）
2. 学员端打开计划详情
3. 找到该节点

**预期**：

- ✅ 该节点的「结束时间」一栏**不显示**
- ✅ 「开始时间」「任务状态」「完成条件」等其他信息正常显示
- ❌ 学员端看到的是干净布局，没有 "2099" 这种噪音

**对照数据保留**：

- 后端 `el_plan_node.end_time` 字段值不变（仍是 `2099-12-31 23:59:59`）
- 后端 `PlanPreServiceImpl.preCheck` 仍按 endTime 校验（学员不会因 UI 隐藏而绕过时间窗检查）
- 管理员仍可在 admin 端看到并修改 endTime

**边界场景**：

| endTime | 显示？ |
|---|---|
| `null` / 空 | ❌ 不显示（`!node.endTime`） |
| `2026-06-17`（今天之前 1 天） | ❌ 不显示（已过 → timeState='after'，按钮隐藏，但结束时间该行还是显示？不，正常逻辑：已过时间会显示「已结束」红色，但 endTime 距今 > 1 年则不显示） |
| `2026-12-31`（距今 6 个月） | ✅ 显示，红色「已结束」 |
| `2027-06-17`（距今 1 年） | ✅ 临界显示 |
| `2027-06-18`（距今 1 年 + 1 天） | ❌ 不显示 |
| `2099-12-31` | ❌ 不显示 |

> ⚠️ 上述「已过时间」边界需要根据 UI 测试时机的"今天"来判断。规则就是 `endTime - now <= 365 天` 才显示。

### 移动端（H5）覆盖

> 移动端是 Vue 3 + `<script setup>` + UnoCSS 风格，与 V2 写法差异较大。移植到 [train-detail.vue:235-275](../wk-mhc-mobile/src/pages/smart-training/page/train-center/train-detail.vue)，逻辑等价。

#### M-1 [P0] H5 时间窗按钮隐藏 + 状态标红

**步骤**：

1. H5 打开计划详情（学员端）
2. 找时间窗外的节点（startTime 在未来 / endTime 已过）

**预期**：

- ✅ 节点卡片背景保持白色（不是灰色）— 因为 `unlocked=true`
- ✅ 「去学习」/「去考试」按钮**不显示**
- ✅ 「任务状态」文字**变红** + 600 字重，显示「未开始」或「已结束」
- ✅ 「开始时间」或「结束时间」**变红**（按时间窗方向）
- ✅ 「结束时间」如果是 `2099-12-31` 之类远超 1 年的值，**不显示**（连 `~` 都不显示）
- ✅ sparring 节点**不受**时间窗限制

**移动端具体路径**：H5 学员 → 我的学习任务 → 任一计划详情

---

## 3. 后端 API 测试（Postman / curl，10 分钟）

> 如果用 Postman，先建一个环境变量 `{{token}}` 存登录返回的 JWT。

### 3.1 [P0] 登录拿 token

**Postman**：`POST <http://localhost:8101/api/sys/user/login>`

Body：
```json
{"username": "admin", "password": "admin"}
```

Headers：不需要 token

**预期**：

- 响应 `code: 0`
- `data.token` 是个 100+ 字符的 JWT（以 `eyJ` 开头）
- 把这个 token 复制下来，存到 `{{token}}` 变量

### 3.2 [P0] 计划列表无 required 字段

**Postman**：`POST <http://localhost:8101/api/plan/plan/paging>`

Body：
```json
{"current": 1, "size": 10}
```text

Headers：

- `Content-Type: application/json`
- `token: {{token}}`  ← **小写**

**预期**：

- 响应 `code: 0`
- `data.records` 是个数组，2 条记录
- 在 Postman 搜索响应体找字符串 `required` → **0 命中**（连 "requiredSec" 都不应该出现在 plan 列表响应里）

### 3.3 [P0] 计划详情无 required 字段

**Postman**：`POST <http://localhost:8101/api/plan/plan/detail>`

Body：
```json
{"id": "2067063118737371137"}
```

Headers：同 3.2

**预期**：

- 响应 `code: 0`
- `data.groupList[*].nodeList[*]` 里搜 `required` → 0 命中
- 节点对象应该有：`id`, `nodeType`, `refId`, `title`, `startTime`, `endTime`, `unlocked`, `finished` 等
- **不应有**：`required` 字段

### 3.4 [P0] 学员列表无 required 字段 + requireNode 数字正确

**Postman**：`POST <http://localhost:8101/api/plan/user/paging>`

Body：
```json
{
  "current": 1,
  "size": 20,
  "params": {"planId": "2067063118737371137"}
}
```text

> ⚠️ body 字段名是 **`params`** 不是 `query`（这是 Spring Boot 框架约定）

Headers：同 3.2

**预期**：

- 响应 `code: 0`
- `data.records` 至少 1 条
- 每条记录**有** `requireNode` 字段，值应该 = `1`（asda 计划只有 1 个 course 节点）
- 搜 `required` 关键字 → 0 命中（除了 `requireNode` 字段名本身含 "require"）

### 3.5 [P1] 统计详情无 required 字段

**Postman**：`POST <http://localhost:8101/api/plan/stat/detail>`

Body：
```json
{"planId": "2067063118737371137"}
```

> ⚠️ body 字段是 **`planId`** 不是 `id`

Headers：同 3.2

**预期**：

- 响应 `code: 0`
- `data.groupList` 1 个分组（asda 计划）
- 搜 `required` → 0 命中

---

## 4. 数据库验证（5 分钟，MySQL 客户端）

### 4.1 [P0] el_plan_node 无 required 列

```sql
SHOW COLUMNS FROM el_plan_node LIKE 'required';
```text

**预期**：Empty set

### 4.2 [P0] 全库无 plan_node 相关 required 字段

```sql
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA='wk_train_center'
  AND COLUMN_NAME LIKE '%required%'
ORDER BY TABLE_NAME, COLUMN_NAME;
```

**预期**：只返回 1 行
```text
el_course_file_learn | required_sec | int
```

（这是课程时长配置，与本轮无关，不应该出现 el_plan_node 相关的行）

### 4.3 [P1] 节点数据完整性

```sql
SELECT
  plan_id,
  COUNT(*) AS node_count,
  SUM(CASE WHEN node_type='sparring' THEN 1 ELSE 0 END) AS sparring_count
FROM el_plan_node
WHERE deleted=0
GROUP BY plan_id;
```text

**预期**（基于 dev DB 实际数据）：
| plan_id 前 8 位 | node_count | sparring_count |
|---|---|---|
| 20670631 | 1 | 0 |
| 20645132 | 8 | 0 |

### 4.4 [P1] 学员记录统计

```sql
SELECT
  state,
  COUNT(*) AS user_count
FROM el_plan_user
WHERE deleted=0
GROUP BY state;
```

**预期**：至少 1 个 `state=0`（进行中）和 1 个 `state=1`（已完成）的记录

---

## 5. 端到端流程（15 分钟，可选）

完整流程：管理端创建 → 学员开始 → 学员完成 → 状态更新

### 5.1 [P1] admin 创建带 2 个节点的计划

**步骤**：

1. 重复 1.2，但这次**添加 2 个节点**（1 个 course + 1 个 exam）
2. 记下新建计划的 ID
3. 给某个测试学员分配权限

**预期**：

- ✅ 创建成功
- ✅ 保存请求 body **不含** `required` 字段

### 5.2 [P0] 学员开始计划 — 2 个节点立即可点

**步骤**：

1. 学员登录
2. 进入新建的计划详情
3. 点「开始任务」

**预期**：

- ✅ **2 个节点**都立即显示「去学习 / 去考试」按钮
- ❌ 不应有节点保持「请先开始任务」灰色状态
- F12 Network：planStart 接口返回成功

### 5.3 [P0] 学员完成所有节点 — 计划标记完成

**步骤**：

1. 完成第 1 个 course 节点（学完 100%）
2. 完成第 2 个 exam 节点（通过考试）
3. 等 30 秒（异步任务可能延迟）
4. 回到计划详情页刷新
5. 用 4.4 SQL 查这个学员的 `el_plan_user.state`

**预期**：

- ✅ 计划详情显示「已完成」徽章
- ✅ SQL 返回 `state=1`（之前是 0）
- ✅ 学员收到完成通知（站内信 / 微信按环境配置）

**失败判定**：

- 学完所有节点但 `state` 仍为 0 → **🚨 关键 bug，需立即排查**
- 节点都「已完成」但计划详情仍显示「未完成」→ UI 缓存问题，刷新可解

---

## 6. 回归检查清单（贴到 PR）

发布前过一遍这 6 组，**全 ✅ 才能合并**：

| 组 | 用例 | 通过 |
|---|---|---|
| 0. 前置确认 | 0.1 / 0.2 / 0.3 全过 | ☐ |
| 1. 管理端 UI | 1.1 / 1.2 / 1.3 / 1.4 / 1.5 全过 | ☐ |
| 2. 学员端 UI | 2.1 / 2.2 / 2.3 全过 | ☐ |
| 3. 后端 API | 3.1 / 3.2 / 3.3 / 3.4 / 3.5 全过 | ☐ |
| 4. 数据库 | 4.1 / 4.2 / 4.3 / 4.4 全过 | ☐ |
| 5. 端到端 | 5.1 / 5.2 / 5.3 全过 | ☐ |

---

## 7. 已知/遗留事项

| 项 | 状态 | 备注 |
|---|---|---|
| 旧文档说 `/api/plan/user/paging` HTTP 500 | ✅ **已澄清是误报** | dev 后端正常，是测试脚本用错 body 字段名（`query` 应为 `params`） |
| `listAllRequireNode` 方法名误导 | ✅ **已重命名** | 改为 `listAllNonSparringNode` |
| `preCheck` 时间窗校验 | ⏳ **保留** | 按方向 A 不清理，作为软提示 |
| `unlockAllNodes` / `unlock_time` 字段 | ⏳ **保留** | 按方向 A 不清理 |
| Excel 导出列名变更 | ⚠️ **需业务方确认** | "必学项目" → "项目数" 业务方是否接受 |
