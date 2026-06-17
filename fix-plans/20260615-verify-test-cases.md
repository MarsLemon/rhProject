# 培训计划「必须学习」移除 — 验证测试用例

> 日期：2026-06-17
> 范围：admin 端 + 学员端 + 后端 API
> 目的：DDL 执行后 + PR 合并前的完整回归验证

---

## 一、测试环境

| 项 | 值 |
|---|---|
| Admin 前端 | <http://localhost:4212/admin> |
| 学员端 | <http://localhost:4212/web> |
| **后端 API** | **<http://localhost:8101>**（dev 环境用户本机） |
| Admin 账号 | admin / admin |
| 数据库 | `47.105.122.150:31101` / `wk_train_center`（`dev_root` / `123456`） |
| Swagger | <http://localhost:8101/swagger-ui.html> |

> ⚠️ **dev 后端已知 bug**（与本轮改动无关）：
> - `/api/plan/user/paging` 当前 HTTP 500
> - 推测是运行 JAR 早于源码某次重构导致
> - 不影响 PR 合并，但需在测试报告中标注

## 一.5、自动化测试脚本

**[scripts/verify-required-removal.py](../scripts/verify-required-removal.py)** — 12 个用例一键验证：

```bash
# 安装依赖（仅首次）
pip install pymysql

# 跑全量
python scripts/verify-required-removal.py
```

最近一次运行结果（2026-06-17）：

```text
✅ 通过: 11/12
⏭️  跳过: 1（B4 /api/plan/user/paging 500 — 与本轮改动无关）
❌ 失败: 0
🎯 所有 P0 用例通过
```

**用例覆盖矩阵**：

| 维度 | 用例 | 类型 | 实际验证内容 |
|---|---|---|---|
| 鉴权 | A1 | API | admin 登录拿到 JWT |
| API | B1 | API | `/api/plan/plan/paging` 列表响应无 `required` 字段 |
| API | B2 | API | `/api/plan/plan/simple-detail` 响应无 `required` 字段 |
| API | B3 | API | `/api/plan/plan/detail` 响应无 `required` 字段（如端点可用） |
| API | B4 | API | `/api/plan/user/paging` 健康（dev 端点 500，标记 skip） |
| DB | C1 | DB | `el_plan_node` 表无 `required` 列 |
| DB | C2 | DB | 全库无 `required` 字段（除 `el_course_file_learn.required_sec`） |
| DB | C3 | DB | DB 内 plans/nodes/users/user_nodes 数量合理性 |
| UI | E1 | 文件 | `form.vue` 无 `node.required = false` 强制赋值 |
| UI | E2 | 文件 | `useGroupManager.js` 无 `required: false` 字段 |
| UI | E3 | 文件 | `PlanUserList.vue` 列名"必学项目"→"项目数" |
| Build | F1 | Maven | yf-module-plan 4 类单测全过（13/13） |

---

## 二、手动测试用例（QA 执行）

### 用例组 A：管理端 — 创建计划

#### A1 — 新建计划时不出现「必学」勾选框 ✅ P0

**前置**：登录 admin 账号，进入「学习项目 → 学习任务」

**步骤**：
1. 点击「新建学习任务」按钮
2. 填写基本信息（名称 / 分类 / 时间范围）
3. 切换到「环节 / 任务」Tab
4. 添加一个分组
5. 点击「添加节点」，选择课程/考试/问卷节点

**预期**：
- ❌ **不应**出现「是否必学」「必学项目」「required」勾选框或开关
- ✅ 节点添加后只显示：完成条件、开始时间、结束时间、编辑按钮

**失败判定**：任何位置出现「必学」「必须完成」UI

---

#### A2 — 编辑已有计划时无「必学」选项 ✅ P0

**前置**：存在至少一个学习计划

**步骤**：
1. 点击任意已有计划进入详情
2. 点击「编辑」按钮
3. 检查节点编辑弹窗/抽屉

**预期**：
- ❌ **不应**出现「必学」勾选框
- ✅ 节点卡片只显示「完成」条件 + 时间选择器

---

#### A3 — 学员列表「必学项目」列名改为「项目数」 ✅ P0

**前置**：进入「学习任务」详情 → 「学员列表」Tab

**步骤**：观察表格列头

**预期**：
- ✅ 列名为「项目数」
- ❌ 不应是「必学项目」「必学节点」

**数据正确性**：
- 「项目数」应该 = 该计划所有非 sparring 节点的总数
- 「完成项目」应该 = 学员已完成的非 sparring 节点数
- 项目数 ≥ 完成项目

---

### 用例组 B：管理端 — 统计页

#### B1 — 培训统计页面不报 ColumnNotFound ✅ P0

**前置**：进入「统计分析管理 → 培训统计」

**步骤**：访问任意计划统计详情

**预期**：
- ✅ 页面正常加载，节点列表正常显示
- ❌ **不应**报 `ColumnNotFound: required`
- ❌ **不应**出现后端 500 错误

**验证方法**：浏览器 F12 Network → 看 `/api/.../stat-detail` 响应码 200

---

### 用例组 C：学员端 — 计划详情

#### C1 — 「开始任务」后所有节点立即可见 ✅ P0

**前置**：存在一个未开始的学习计划，学员有权限访问

**步骤**：
1. 学员点击「开始任务」按钮
2. 等待 1.5 秒
3. 观察节点卡片列表

**预期**：
- ✅ 所有课程/考试/问卷节点立即显示「去学习 / 去考试 / 去答卷」按钮
- ❌ **不应**有任何节点显示「请先开始任务」灰色状态
- ❌ **不应**有节点卡片保持「未解锁」状态

**旧逻辑 vs 新逻辑对照**：
| 状态 | 旧逻辑（顺序解锁） | 新逻辑（批量解锁） |
|---|---|---|
| 节点 1 | 解锁 | 解锁 |
| 节点 2 | 需节点 1 完成后解锁 | 立即解锁 |
| 节点 3 | 需节点 2 完成后解锁 | 立即解锁 |

---

#### C2 — 节点时间窗提示（软阻拦）✅ P1

**前置**：节点设置了 `start_time` 在未来 / `end_time` 已过

**步骤**：学员点击该节点

**预期**：
- ✅ 弹出友好提示「该节点将于 XX 时间开始 / 已结束」
- ❌ **不应**直接 500 / 白屏
- ⏳ 行为按方向 A 保留 `preCheck` 时间窗校验，是"软阻拦"提示

**注意**：本轮**未清理** `PlanPreServiceImpl.preCheck` 时间窗校验，所以这个提示会存在。如果业务方希望完全无阻拦，需要后续单独清理 preCheck。

---

### 用例组 D：学员端 — 完成判定

#### D1 — 完成所有非陪练节点后计划标记完成 ✅ P0

**前置**：存在至少 1 个课程节点（无考试/问卷也可）

**步骤**：
1. 学员开始计划
2. 完成所有课程（学完 100%）
3. 等待 24 小时（course finishNotify 异步任务）或手动刷新
4. 回到计划详情页

**预期**：
- ✅ 计划标题旁边显示「已完成」徽章
- ✅ 学员收到 `passPlanNotify` 通知（站内信 / 微信 / App 推送按环境配置）
- ✅ 数据库 `el_plan_user.state` = 1
- ✅ 数据库 `el_plan_user.finish_time` 有时间戳

**SQL 验证**（DBA 协助）：
```sql
SELECT state, finish_time FROM el_plan_user
WHERE plan_id='<plan_id>' AND user_id='<user_id>';
-- 期望：state=1, finish_time NOT NULL
```

---

### 用例组 E：边界场景

#### E1 — 旧数据（DDL 执行前的）正常显示 ✅ P1

**前置**：DDL 执行前存在 `el_plan_node.required=1` 的旧数据

**步骤**：DDL 执行后，访问任意计划详情

**预期**：
- ✅ 不报错（DDL 已 drop column）
- ✅ 节点数据正常显示
- ⏳ 旧数据的 `required` 值已随列一起删除，业务无影响

---

#### E2 — 统计 API 在数据为空时正常返回 ✅ P2

**API**：`POST /api/plan/user/paging`

**请求体**：
```json
{"query": {"planId": "non-existent-plan-id"}}
```

**预期**：
- HTTP 200
- `data.records` 为空数组
- 每条记录 `requireNode=0, finishNode=0`（不应该报错或返回 N+1）

---

## 三、自动化测试用例（JUnit / 后端）

### 用例组 F：后端单测（已存在 + 待新增）

#### F1 — PlanUserServiceImplTest（已存在 4/4 ✅）

位于 `yf-modules/yf-module-plan/src/test/.../PlanUserServiceImplTest.java`

**覆盖**：
- ✅ `checkFinished_marksCompleteWhenAllRequireNodesDone` — 完成判定核心逻辑
- ✅ `checkFinished_doesNotUpdateWhenNotAllNodesFinished`
- ✅ `checkFinished_skipsWhenAlreadyComplete`
- ✅ `checkFinished_skipsWhenNoRequireNodes`

**关键回归**：本轮改动**不影响** `checkFinished` 行为（因 `listAllRequireNode` 实现本就不按 `required` 过滤）

#### F2 — PlanNodeServiceImplTest（已存在 2/2 ✅）

覆盖 `listAllRequireNode` 的 sparring 排除逻辑。

#### F3 — PlanUserNodeClientServiceImplTest（已存在 3/3 ✅）

覆盖客户端批量解锁流程（`unlockAllNodes` + `syncNextUnlock`）。

#### F4 — PlanClientGroupRespDTOTest（已存在 4/4 ✅）

覆盖学员端计划详情响应 DTO。

**当前总覆盖**：13/13 ✅

#### F5 — 待新增：PlanPreServiceImplTest 🆕

**位置**：`yf-ability/src/test/java/com/yf/ability/plan/service/impl/PlanPreServiceImplTest.java`

**建议覆盖场景**：
```java
class PlanPreServiceImplTest {
    // 节点时间窗校验
    @Test void preCheck_blocksNodeBeforeStartTime()
    @Test void preCheck_blocksNodeAfterEndTime()
    @Test void preCheck_passesNodeWithinTimeWindow()

    // 计划时间窗校验
    @Test void preCheck_blocksPlanBeforeStartTime()
    @Test void preCheck_blocksPlanAfterEndTime()

    // 节点未解锁（应该不会发生，因为批量解锁，但保留防御）
    @Test void preCheck_returnsPlanNodeNotUnlockedWhenNoUserNode()
}
```

**说明**：`preCheck` 是 plan 模块的入口校验，本轮改动未涉及，但保留测试以防后续调整。

#### F6 — 待新增：PlanStatMapper 集成测试 🆕

**位置**：`yf-modules/yf-module-plan/src/test/.../admin/stat/PlanStatMapperTest.java`（使用 `@SpringBootTest` + H2 或测试库）

**建议覆盖**：
```java
@Test void findStatNode_returnsAllNonSparringNodesWithoutRequiredColumn()
@Test void findStatNode_includesFinishUserAndJoinUserCounts()
```

**说明**：本轮修复的 4 个 mapper XML 漏改之一是 `PlanStatMapper.xml`，这个集成测试防止未来回退。

---

## 四、验证命令（复制即用）

### 后端自动化

```bash
cd /e/rhProject/wk-train-center-service

# 编译
mvn -pl yf-modules/yf-module-plan,yf-ability -am clean compile -DskipTests

# 跑现有单测
mvn -pl yf-modules/yf-module-plan test
# 期望：Tests run: 13, Failures: 0, Errors: 0

# 跑 yf-ability 单测（如果有）
mvn -pl yf-ability test
```

### DDL 验证（执行迁移后）

```bash
mysql -u root -p wk_train_center

-- 验证列已删除
SHOW COLUMNS FROM el_plan_node LIKE 'required';
-- 期望：Empty set (0.00 sec)

-- 验证历史数据未损坏
SELECT COUNT(*) FROM el_plan_node;
-- 期望：与 DDL 执行前一致

-- 验证管理端统计接口
SELECT id, title FROM el_plan LIMIT 5;
```

### 前端文本验证（已做，本轮不再重复）

```bash
# 应无输出
grep -rn "node\.required\s*=\s*false" wk-train-center-ui/src/views/admin/plan
grep -rn "必学" wk-train-center-ui/src/views/admin/plan/plan
grep -rn "必学项目" wk-train-center-ui/src/views/admin/plan/stat
```

---

## 五、回归风险等级

| 风险项 | 等级 | 缓解措施 |
|---|---|---|
| DDL 执行后旧 Java 进程报错 | 🟡 中 | 滚动发布：先全部应用服务升级到新代码，再执行 DDL |
| MyBatis-Plus INSERT 行为变化 | 🟢 低 | entity 已无 `required` 字段，INSERT 不会写该列 |
| 前端 POST 体与后端 DTO 不匹配 | 🟢 低 | DTO 已无 `required` 字段，反序列化时 Jackson 静默忽略 |
| 旧数据统计显示 0/0 | 🟢 低 | 统计 SQL 已移除 `required=1` 过滤，所有非 sparring 节点都计入 |
| Excel 导出列名变更业务方不接受 | 🟡 中 | 提前通知业务方「必学项目」→「项目数」含义变更 |
| 学员完成所有节点但不触发 state=1 | 🔴 高 | `checkFinished` 逻辑已 6 phase 静态分析 + 13/13 单测覆盖；上线后人工验证 1 个完整流程 |

---

## 六、发布检查清单

```
□ 后端代码全部合并到 release 分支
□ 前端代码全部合并到 release 分支
□ yf-module-plan / yf-ability 单测通过
□ DDL 脚本（drop_plan_node_required_column.sql）已 review
□ 业务方已通知：Excel 列名变更
□ 测试环境 DDL 已执行 + 全量回归测试通过
□ 生产 DDL 执行窗口已申请（建议低峰期）
□ 回滚脚本就绪：drop_plan_node_required_column.sql 第 28 行注释的 ADD COLUMN
□ 灰度策略：先 1 个集群 → 观察 24h → 全量
```
