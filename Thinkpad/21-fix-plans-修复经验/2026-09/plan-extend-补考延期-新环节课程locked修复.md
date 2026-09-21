# plan 补考/延期 — 新环节课程 locked 修复 (asda plan 案例)

## 背景
asda 学习任务(planId=`2084860923533455361`)学员端显示"新环节"里的课程"AI 船舶海专业技能培训"为"请先开始任务",无"去学习"按钮。同 group 内考试节点"小学数学2" unlocked=true(因补考触发),只有 course 节点 locked。

## 根因
学员端 `unlocked` 判定只看 `el_plan_user_node` 表是否有记录:
- `startPlan` 调 `unlockAllNodes`(一次性给 plan 下所有节点建 user_node)
- `unlockMakeupNodes`(extend 流程中)硬编码 `node_type=EXAM`,**只补 exam 节点**
- course 节点在 extend 流程中**永远不被自动解锁**

**触发场景**:admin 在 startPlan 之后给 plan 模板**后加了新 group**(asda 第二个"新环节"),新 group 的 course 节点无 user_node 记录 → unlocked=false。

## 修复方案
`PlanUserServiceImpl#unlockAllPlanNodes` — `extend` 流程末尾追加,补建缺失 user_node 记录。**内联核心循环而非跨服务调用**(`unlockAllNodes` 在 client 模块,反向注入 admin 模块会循环依赖)。

## 改动清单
| # | 文件 | 改动 |
|---|---|---|
| 1 | `yf-module-plan/.../PlanUserServiceImpl.java` | 新增 `unlockAllPlanNodes(planId, userIds)` 私有方法,`extend` 末尾调用 |
| 2 | `yf-module-plan/.../PlanUserNodeServiceImpl.java` + `PlanUserNodeService.java` | 加 `insertIgnoreBatch(List)` + `insertIgnore(entity)` 接口/实现 |
| 3 | `yf-module-plan/.../PlanUserNodeMapper.java` + `PlanUserNodeMapper.xml` | 自定义 MyBatis `INSERT IGNORE` 批量/单条方法 |
| 4 | `yf-module-plan/.../PlanUserNodeClientServiceImpl.java:saveUserNode` | 改 `save` → `insertIgnore`(修复 client 端同样 race) |
| 5 | `db/1.5.1/plan/fix-plan-user-node-duplicate.sql` | dedup 重复行 + ALTER TABLE ADD UNIQUE KEY uk_plan_user_node (user_id, plan_id, node_id) |
| 6 | `Backend/wk-train-center-service/db/`(整个目录副本) | 同步 .products 所有 SQL 到后端项目 |

## 修复过程踩过的坑

### 坑 1:循环依赖 — admin 端不能直接调 client 端 unlockAllNodes
- `unlockAllNodes` 在 `PlanUserNodeClientServiceImpl`,依赖 `PlanUserService`(admin 模块)
- 反向注入 → Spring bean 循环依赖
- **解决**:内联核心循环,只搬用到的几行(saveUserNode 的 INSERT 部分)

### 坑 2:el_plan_user_node 没有唯一索引 → 并发 race
- 5 个并发 extend 全部 200 成功 → race window 确认存在
- 主键是雪花 id,**不是 (userId, planId, nodeId) 联合唯一**
- **解决**:加 unique index + 应用层 INSERT IGNORE 双保险

### 坑 3:courseAI.finished=true 副作用(已回滚)
- 加 `checkFinished` 调用想重算 planUser.state
- 实测发现 admin × courseAI(没学过)的 plan_user_node.finished 从 false 变 true
- **静态分析所有代码路径没人写 course 的 finished=true** → 推测是历史脏数据,但 checkFinished 调用确实触发了未知副作用
- **解决**:回滚 checkFinished 调用,保留 insertIgnoreBatch 修复

### 坑 4:el_plan_user_node.deleted 字段未过滤
- `PlanNode.deleted` 字段在 v1.2 升级 SQL 补齐,entity 未声明
- 课程解锁查询没过滤 deleted=1 节点 → 已删除节点也会被建 user_node
- **解决**:`.eq("deleted", 0)` 加到 planNodeService.list 查询(PlanNodeServiceImpl.listAllNonSparringNode 已有同样过滤)

## 验证证据(7/7)
1. ✅ el_plan_user_node 无唯一索引(v1.2 + v1.4 + v1.5.1 SQL 都没 UNIQUE KEY)
2. ✅ 现有数据可能重复(v1.5.1 fix-passed-user-nodes.sql 已用 INSERT IGNORE 暗示)
3. ✅ MP saveBatch 是简单 INSERT(MP 3.5.11 IService 接口签名确认)
4. ✅ Client 端 saveUserNode 同样 race(无锁)
5. ✅ v1.4 fix_plan_user_duplicate 模式可直接套用
6. ✅ 自定义 insertIgnoreBatch 可行(v1.5.1 SQL 已用 INSERT IGNORE)
7. ✅ 实际能复现 race window(5 个并发 extend 全 200)

## 复现路径(playwright + 学员端 API)
```js
const planId = '2084860923533455361'
await fetch('http://localhost:8101/api/plan/client/plan/detail', {
  method: 'POST',
  body: JSON.stringify({ id: planId })
}).then(r => r.json()).then(j => {
  // 第二个 group 的 course 节点 unlocked:false → 修复后 unlocked:true
})
```

## 状态
- ✅ 主修复(unlockAllPlanNodes + insertIgnoreBatch)已落地
- ✅ Bug 3(deleted 过滤)保留
- ⏸ Bug 2(checkFinished 调用)回滚
- ✅ Bug 1(并发 race)修复完成,SQL 待 DBA 执行

## 关联
- [[plan-extend-补考延期-exam-record跨plan共享-技术债]] — 同会话评估的另一类技术债
- shared-experiences.md 新增 2 条:[2026-09-17] 跨服务复用方法警惕循环依赖 + UI 按钮不显示类 bug 三层串

## 数据库脚本维护约定(2026-09-17 新增)
- 副本位置:`Backend/wk-train-center-service/db/`(从 `.products/.../db/` 同步)
- 同步方向:两边都要改
- SQL 文件头部 STATUS 头格式:
  ```
  -- STATUS:
  --   dev: 已执行 @ YYYY-MM-DD | 未执行 @ -
  --   stage: 已执行 @ YYYY-MM-DD | 未执行 @ -
  --   pro: 已执行 @ YYYY-MM-DD | 未执行 @ -
  ```
- 索引:`db/README.md` 状态总览表
- **环境命名**:dev(开发) / stage(测试) / pro(生产)
- 每个环境**单行展示**,不要集合在一起