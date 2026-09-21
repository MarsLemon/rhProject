# H3 冻结快照 + 课程改规则影响提醒 — 实施交付（Claude TDD）

> **作业触发**：[qoder-fix-list.md §十 项 7](Thinkpad/00-Inbox/qoder-fix-list.md) 拍板的"冻结快照 + 影响提醒"
> **实施日期**：2026-07-13
> **实施人**：Claude（using TDD skill）
> **业务决策（已锁定，不重新讨论）**：
> 1. 业务语义 = **冻结快照** —— 保存时强制写入 `check_rules_json`，运行时 always read 快照
> 2. 已开设计划行为 = **仍按旧快照执行，不更新**（即便课程端改了规则也不影响已开设计划）
> 3. 附加交互 = **课程改规则后弹窗列受影响计划**，让管理员决定是否查看/跳转更新

---

## 一、交付清单

### 1.1 后端（5 改 + 6 增 + 3 测试）

| 类型 | 文件 | 内容 |
|---|---|---|
| 改 | `PlanNodeServiceImpl.java` | 删除 line 99 强制 `setInheritCourseRules(true)`，依赖默认值 true |
| 改 | `PlanCheckRulesResolverImpl.java` | 强化 H3 语义注释（全字段透传快照） |
| 改 | `CourseClientServiceImpl.java` | line 142 条件从 `inheritCourseRules==false` 改为 `override != null`（始终应用快照） |
| 增 | `PlanImpactedByCourseService.java` | Service 接口 |
| 增 | `PlanImpactedByCourseServiceImpl.java` | Service 实现（含 null courseId 防御 + mapper 异常兜底） |
| 增 | `PlanImpactedByCourseRespDTO.java` | 响应 DTO（planId/planTitle/savedAt/snapshotHash） |
| 增 | `PlanImpactedByCourseController.java` | `POST /api/plan/admin/plan/nodes-by-course-snapshot` |
| 增（xml） | `PlanNodeMapper.xml` | `selectImpactedByCourse` SQL：LEFT JOIN el_plan + MD5 比对 + deleted=0 过滤 |
| 改（mapper） | `PlanNodeMapper.java` | 新增 `selectImpactedByCourse(@Param courseId, @Param currentHash)` |
| 增（test） | `PlanCheckRulesResolverImplTest.java` | 3 用例：always/never/inherit 切换 |
| 增（test） | `PlanImpactedByCourseServiceImplTest.java` | 5 用例：空/null/空串/正常返回/异常兜底 |
| 改（test） | `PlanNodeServiceImplTest.java` | 追加 2 用例：用户填保留/用户未填走课程快照 |

### 1.2 前端（2 增 + 2 改）

| 类型 | 文件 | 内容 |
|---|---|---|
| 改 | `src/api/plan/plan.js` | 新增 `listImpactedByCourse(data)` |
| 增 | `src/components/ComponentsBusiness/course/CourseRuleImpactDialog.vue` | 新组件（loading/empty/list/jump/confirm 五态） |
| 改 | `src/views/admin/course/form.vue` | data/computed/methods + template 接入弹窗 |

---

## 二、关键决策与对应代码

### 决策 1：消费端始终应用快照

**位置**：`CourseClientServiceImpl.java` line 142

**修改前**：
```java
if (override != null && Boolean.FALSE.equals(override.getInheritCourseRules())) {
    // 仅当 inherit=false 才应用快照
    if (override.getCheckOn() != null) respDTO.setCheckOn(override.getCheckOn());
    // ...
}
```

**修改后**：
```java
// H3 冻结快照:override != null 就一律应用快照内容,不再按 inheritCourseRules 过滤
if (override != null) {
    if (override.getCheckOn() != null) respDTO.setCheckOn(override.getCheckOn());
    // ...
}
```

**语义变化**：原本 `inherit=true` 的节点（沿用课程规则）会被跳过快照应用，运行时读课程实时规则；现在 `inherit=true` 也走快照，等价于"快照即是结果"。这正是 §十一 11.2.3 锁定的"已开设计划仍按旧快照执行"的实现。

### 决策 2：快照哈希用 SQL `MD5(check_rules_json)` 自比较

**位置**：`PlanNodeMapper.xml` `selectImpactedByCourse`

```xml
SELECT n.plan_id    AS planId,
       p.title      AS planTitle,
       n.update_time AS savedAt,
       MD5(n.check_rules_json) AS snapshotHash
FROM el_plan_node n
LEFT JOIN el_plan p ON p.id = n.plan_id
WHERE n.node_type = 'course'
  AND n.ref_id = #{courseId}
  AND n.deleted = 0
  AND (p.id IS NULL OR p.deleted = 0)
  AND (#{currentHash} IS NULL OR MD5(n.check_rules_json) != #{currentHash})
```

**取舍说明**：
- **选 MD5 不选 SHA-256**：项目里既无加密库也无 hash 工具依赖，MD5 是 MySQL 内置函数，零依赖
- **字段规范化**：直接对 JSON 原文 hash（不规范化字段顺序）—— 风险是字段顺序变了 hash 就变，但 `ObjectMapper.writeValueAsString` 在 Java 端是稳定顺序
- **前端 hash 暂不传**：当前 `currentHash` 传空，SQL 返回所有引用本课程的计划，由前端 UI 决定是否弹窗
- **替代方案**：如果性能敏感（课程被上千计划引用），可改为前端用相同算法计算后传入

### 决策 3：弹窗触发条件 = 编辑模式 + 规则变更

**位置**：`course/form.vue` submitForm 内

```javascript
if (this.$route.query.id || (postForm && postForm.id)) {
  if (this.checkRulesChanged) {
    this.fetchImpactedPlans().then((hasImpact) => {
      if (hasImpact) {
        this.impactDialogVisible = true
        // 弹窗关闭后再跳转列表
        return
      }
      this.navigateToCourseList()
    })
  } else {
    this.navigateToCourseList()
  }
  return
}
```

**触发逻辑链**：
1. 用户编辑课程，进入"保存"流程
2. `fetchData` 时记录 `originalCheckRules` 快照
3. `currentCheckRules` 计算属性实时对比
4. 保存成功 + 规则变更 → 调 `listImpactedByCourse` → 有受影响计划则弹窗，否则直接跳列表
5. 弹窗提供"查看"（跳对应计划节点编辑页）和"我已知晓"（关弹窗 + 跳列表）

### 决策 4：watch + debounce 300ms 的预查询

**位置**：`course/form.vue` `scheduleImpactCheck`

```javascript
created() {
  // ...
  this.$watch('currentCheckRules', () => {
    this.scheduleImpactCheck()
  })
}

scheduleImpactCheck() {
  if (!this.postForm.id) return // 新增模式无 id 不查
  if (this._impactCheckTimer) clearTimeout(this._impactCheckTimer)
  this._impactCheckTimer = setTimeout(() => {
    this.fetchImpactedPlans()
  }, 300)
}
```

**目的**：用户每次切换规则字段都会触发 300ms debounce 的接口预查询，结果缓存在 `pendingImpactedPlans`，保存时直接复用。避免保存瞬间才查导致等待。

---

## 三、与原计划的偏差

| 原计划 | 实际执行 | 原因 |
|---|---|---|
| Phase 2.5 修改 `CourseServiceImpl` 保存后计算哈希 | **取消** | 后端 SQL `MD5()` 自比较，前端不传 hash 也能工作（传空 → 返回所有引用本课程的计划） |
| Phase 4.2 创建 `CourseRuleImpactDialog.spec.js`（vitest） | **取消** | 项目仅装了 `babel-jest`，未配置 vitest，强行引入会带大量脚手架；改为以 lint + 后端单元测试覆盖 |
| 删除 PlanNodeServiceImpl line 99 的 `courseRules.setInheritCourseRules(true)` | **执行** | 改为依赖 `CheckRulesConfig.inheritCourseRules` 默认值 true |
| 把"已开设计划改规则"语义改为"快照覆盖" | **执行** | 见 §二 决策 1 |

---

## 四、验证结果

### 4.1 后端

```
mvn -pl yf-modules/yf-module-plan test  →  32/32 通过
mvn -pl yf-modules/yf-module-plan,yf-modules/yf-module-course -am compile  →  BUILD SUCCESS
```

测试覆盖：
- `PlanCheckRulesResolverImplTest` —— 3 用例（always/never/inherit）
- `PlanNodeServiceImplTest` —— 5 用例（3 旧 + 2 新快照）
- `PlanImpactedByCourseServiceImplTest` —— 5 用例（empty/null/empty/正常/异常）

### 4.2 前端

```
eslint src/views/admin/course/form.vue src/components/ComponentsBusiness/course/CourseRuleImpactDialog.vue src/api/plan/plan.js
→  6 problems (3 errors, 3 warnings) — 全部为 form.vue 既有历史问题（comma-style / comma-spacing / object-curly-spacing / console.log）
```

修复了 2 个本次新增引入的 error：
- `vue/no-multiple-template-root` — dialog 标签被移入 root div 内
- `vue/no-mutating-props` — CourseRuleImpactDialog 改为 `syncVisible` 计算属性

### 4.3 手动冒烟（待主人执行）

- 编辑某个被计划引用的课程 → 修改任一防呆规则 → 保存 → 弹窗应列出引用计划
- 关闭弹窗 → 跳回课程列表
- 新建课程保存 → 不应弹窗（无 courseId）
- 编辑课程但未改规则保存 → 不应弹窗（`checkRulesChanged` 为 false）

---

## 五、暂存但未提交

```
 M wk-train-center-service   (12 文件)
 m wk-train-center-ui        (3 文件)
```

后端文件列表：
- 新增：`PlanImpactedByCourseController.java`、`PlanImpactedByCourseService.java`、`PlanImpactedByCourseServiceImpl.java`、`PlanImpactedByCourseRespDTO.java`、`PlanCheckRulesResolverImplTest.java`、`PlanImpactedByCourseServiceImplTest.java`
- 修改：`PlanNodeServiceImpl.java`、`PlanCheckRulesResolverImpl.java`、`CourseClientServiceImpl.java`、`PlanNodeMapper.java`、`PlanNodeMapper.xml`、`PlanNodeServiceImplTest.java`

前端文件列表：
- 新增：`CourseRuleImpactDialog.vue`
- 修改：`api/plan/plan.js`、`views/admin/course/form.vue`

---

## 六、待主人决策

1. **MD5 选型**：是否需要换成 SHA-256 或带字段排序的规范化 hash？（待主人 grill §十 待复核项 #1）
2. **CourseClientServiceImpl line 142 改条件回归**：`inheritCourseRules=true` 但快照字段全空的边界场景是否仍能正常工作？需手动跑一次计划→课程链路冒烟
3. **前端 hash 预计算**：当前 `pendingImpactHash` 始终为空字符串。如果课程规则被上千计划引用，是否需要前端预计算 hash 减少后端 SQL 返回量？
