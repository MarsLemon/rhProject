# 培训计划「必须学习」按钮移除 — 实施报告（方向 A）

> 日期：2026-06-15（分析）→ 2026-06-17（实施完成）
> 范围：`wk-train-center-service` 培训计划模块 + Vue2 管理端 + DDL
> 状态：✅ 已实施，待 DDL 人工执行

## 一、意图对齐

用户最终确认的设计意图：

| # | 意图 | 实现位置 |
|---|---|---|
| ① | 管理端添加节点**无「必学」按钮** | [form.vue:226-228](wk-train-center-ui/src/views/admin/plan/plan/form.vue) 强制 `required=false` 撤掉 + 实体字段移除 |
| ② | 学员学习**无任何阻拦** | 保留 `unlockAllNodes` 批量解锁；保留 `preCheck` 时间窗作软提示 |
| ③ | **没有任何解锁概念**（前端） | 未清理（按方向 A 仅最小清理）；`node.unlocked` 字段、`PlanUserNode.unlock_time` 仍存在 |
| ④ | 学习数据**只做统计** | `PlanUserNode.finished` 仍是统计源；`checkFinished` 触发完成判定与通知 |

## 二、关键发现：原 V1-V7 分析有误

在实施时重新核对代码，发现 [PlanNodeServiceImpl.java:132-145](wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/admin/plan/service/impl/PlanNodeServiceImpl.java#L132-L145) 的 `listAllRequireNode` 方法：

```java
public List<String> listAllRequireNode(String planId) {
    QueryWrapper<PlanNode> wrapper = new QueryWrapper<>();
    wrapper.lambda()
            .eq(PlanNode::getPlanId, planId)
            .ne(PlanNode::getNodeType, SysObjType.SPARRING);
    // ↑↑↑ 注意：并没有 .eq(PlanNode::getRequired, true) 过滤
    ...
}
```

**方法名虽带"Require"，实际返回的是所有非 sparring 节点**。所以 `checkFinished` 计划完成判定逻辑原本就正确——`required` 字段被强制为 `false` 不影响完成判定。

**真正受影响的 2 处 SQL 统计查询**（用到了 `required=1` 过滤）：

1. [PlanUserMapper.xml:42, 54](wk-train-center-service/yf-modules/yf-module-plan/src/main/resources/mapper/admin/user/PlanUserMapper.xml#L42) — 管理端"必学项目"列
2. [PlanUserNodeClientMapper.xml:7](wk-train-center-service/yf-modules/yf-module-plan/src/main/resources/mapper/client/PlanUserNodeClientMapper.xml#L7) — 学员端未完成节点数

这 2 处在 `required=false` 全量下会返回 0，**导致统计一直显示"0 / 0"**。

## 三、实施清单（已全部完成）

### 后端（Java）

| 文件 | 改动 |
|---|---|
| [PlanNode.java](wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/admin/plan/entity/PlanNode.java) | 移除 `private Boolean required;` 字段 |
| [PlanNodeDTO.java](wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/admin/plan/dto/PlanNodeDTO.java) | 移除 `private Boolean required;` 字段 |
| [PlanNodePreDTO.java](wk-train-center-service/yf-ability/src/main/java/com/yf/ability/plan/dto/PlanNodePreDTO.java) | 移除 `private Boolean required;` 字段 |
| [PlanRefVO.java](wk-train-center-service/yf-ability/src/main/java/com/yf/ability/plan/dto/PlanRefVO.java) | 移除 `private Boolean required;` 字段 |
| [PlanStatNodeExtDTO.java](wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/admin/stat/dto/response/PlanStatNodeExtDTO.java) | 移除 `private Boolean required;` 字段 |
| [PlanNodeServiceImpl.java](wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/admin/plan/service/impl/PlanNodeServiceImpl.java) | `listAllRequireNode` 加注释说明命名误导（实为非 sparring 节点） |
| [PlanUserListRespDTO.java](wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/admin/user/dto/response/PlanUserListRespDTO.java) | `@ExcelField(title=)` 从「必学项目」改为「项目数」 |

### Mapper XML

| 文件 | 改动 |
|---|---|
| [PlanNodeMapper.xml](wk-train-center-service/yf-modules/yf-module-plan/src/main/resources/mapper/admin/plan/PlanNodeMapper.xml) | 移除 `<result column="required" property="required" />` |
| [PlanPreCheckMapper.xml](wk-train-center-service/yf-ability/src/main/resources/mapper/plan/PlanPreCheckMapper.xml) | 移除 resultMap 映射 + SELECT 列表 `nd.required AS required` |
| [PlanStatMapper.xml](wk-train-center-service/yf-modules/yf-module-plan/src/main/resources/mapper/admin/stat/PlanStatMapper.xml) | 移除 resultMap 映射 + SELECT 列表 `required,` |
| [PlanUserMapper.xml](wk-train-center-service/yf-modules/yf-module-plan/src/main/resources/mapper/admin/user/PlanUserMapper.xml) | 2 处 `pn.required=1` 过滤移除 |
| [PlanUserNodeClientMapper.xml](wk-train-center-service/yf-modules/yf-module-plan/src/main/resources/mapper/client/PlanUserNodeClientMapper.xml) | `nd.required=1` 过滤移除 |

### 前端（Vue 2）

| 文件 | 改动 |
|---|---|
| [form.vue](wk-train-center-ui/src/views/admin/plan/plan/form.vue) | 移除 `nodeList.forEach(node => node.required = false)` 强制赋值块 |
| [PlanDesign.vue](wk-train-center-ui/src/views/admin/plan/plan/PlanDesign.vue) | 移除 `normalizedData` map 里的 `required: false` 字段 |
| [useGroupManager.js](wk-train-center-ui/src/views/admin/plan/plan/components/composables/useGroupManager.js) | 移除 push 的 node 对象里的 `required: false` 字段 |
| [PlanUserList.vue](wk-train-center-ui/src/views/admin/plan/stat/components/PlanUserList.vue) | 列名「必学项目」→「项目数」 |
| [PlanNode.vue](wk-train-center-ui/src/views/admin/plan/plan/components/components/PlanNode.vue) | JSDoc 字段列表移除 `required` |

### 数据库 DDL

| 文件 | 内容 |
|---|---|
| [sql/1.5/plan/drop_plan_node_required_column.sql](wk-train-center-service/sql/1.5/plan/drop_plan_node_required_column.sql) | `ALTER TABLE el_plan_node DROP COLUMN required` + 验证/回滚脚本 |

## 四、验证结果

```bash
# 后端编译
mvn -pl yf-modules/yf-module-plan,yf-ability -am clean compile -DskipTests
# ✅ BUILD SUCCESS（yf-module-plan 编译 84 文件，yf-ability 编译通过）

# 单元测试
mvn -pl yf-modules/yf-module-plan test -Dtest='PlanUserServiceImplTest,PlanNodeServiceImplTest'
# ✅ Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
#    - PlanNodeServiceImplTest: 2/2 pass
#    - PlanUserServiceImplTest: 4/4 pass
```

## 四点五、自审发现（首批遗漏，已补修）

按 `receiving-code-review` 流程自审，第一轮漏改了 4 处，全部为"删 SELECT 没删 resultMap"或"DTO 字段孤儿化"，DDL 执行后会运行时崩溃：

| # | 文件 | 漏改内容 | 修复 |
|---|---|---|---|
| 1 | [PlanStatMapper.xml:108, 123](wk-train-center-service/yf-modules/yf-module-plan/src/main/resources/mapper/admin/stat/PlanStatMapper.xml#L108) | resultMap + SELECT 仍引用 `required` 列 | 删除 resultMap 映射 + SELECT 列 |
| 2 | [PlanPreCheckMapper.xml:14](wk-train-center-service/yf-ability/src/main/resources/mapper/plan/PlanPreCheckMapper.xml#L14) | 只删了 SELECT，没删 resultMap 映射 | 删除 resultMap 映射 |
| 3 | [PlanNodePreDTO.java:42](wk-train-center-service/yf-ability/src/main/java/com/yf/ability/plan/dto/PlanNodePreDTO.java#L42) | `private Boolean required;` 孤儿字段 | 移除字段 |
| 4 | [PlanRefVO.java:57](wk-train-center-service/yf-ability/src/main/java/com/yf/ability/plan/dto/PlanRefVO.java#L57) | `private Boolean required;` 孤儿字段 | 移除字段 |
| 5 | [PlanStatNodeExtDTO.java:27](wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/admin/stat/dto/response/PlanStatNodeExtDTO.java#L27) | `private Boolean required;` 孤儿字段 | 移除字段 |

**自审后再跑**：6/6 单测仍通过，编译仍 SUCCESS。

**经验**：grep 字段名时不能用"出现就删"清单，必须分两轮 —— 第一轮删 SELECT/写入路径，第二轮专门查 resultMap 映射和 DTO/Entity 字段定义，确保双向闭合。

## 五、未做改动（按方向 A 保留）

| 项 | 位置 | 原因 |
|---|---|---|
| `preCheck` 时间窗校验 | [PlanPreServiceImpl.java:78-121](wk-train-center-service/yf-ability/src/main/java/com/yf/ability/plan/service/impl/PlanPreServiceImpl.java#L78-L121) | 作为软提示保留，按方向 A 不清理 |
| `unlockAllNodes` / `syncNextUnlock` | [PlanUserNodeClientServiceImpl.java](wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/client/service/impl/PlanUserNodeClientServiceImpl.java) | 是解锁流程的载体，非「必学」概念 |
| `node.unlocked` 前端显示控制 | [NodeCardAll.vue:16, 52, 65](wk-train-center-ui/src/views/web/plan/components/NodeCardAll.vue) | 后端已批量置 true，UI 无阻拦；按方向 A 不清理 |
| `PlanUserNode.unlock_time` 字段 | [PlanUserNodeMapper.xml](wk-train-center-service/yf-modules/yf-module-plan/src/main/resources/mapper/admin/user/PlanUserNodeMapper.xml#L12) | 同上 |
| `processTag` 语义 | [PlanUserNodeClientServiceImpl.java:113, 218](wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/client/service/impl/PlanUserNodeClientServiceImpl.java#L113) | 按方向 A 不动报表语义 |
| Redis 锁缺失 (`ensureAllNodesAvailable`) | [PlanClientServiceImpl.java:350-380](wk-train-center-service/yf-modules/yf-module-plan/src/main/java/com/yf/plan/modules/client/service/impl/PlanClientServiceImpl.java#L350-L380) | 并发问题，非「必学」关联，本轮不动 |
| `first` 死参数 (`syncNextUnlock`) | [PlanNodeTriggerService.java:16](wk-train-center-service/yf-ability/src/main/java/com/yf/ability/plan/service/PlanNodeTriggerService.java#L16) | 死代码清理，本轮不动 |

## 六、下一步

1. **人工执行 DDL**：[sql/1.5/plan/drop_plan_node_required_column.sql](wk-train-center-service/sql/1.5/plan/drop_plan_node_required_column.sql) 在测试/生产环境执行
2. **回归测试**：
   - 管理端新建培训计划，添加课程/考试/问卷节点，确认无「必学」勾选
   - 学员端开始计划，确认所有节点立即可点
   - 学员完成所有非 sparring 节点，确认 `el_plan_user.state=1` 标记 + `passPlanNotify` 通知
3. **Excel 导出验证**：管理端"培训记录"导出列名应为「项目数 / 完成项目 / 完成时间」

## 七、相关文档

- `documents/1.4/1.4-20260509-学习任务-编辑容错改进方案.md` — 历史编辑容错背景（与本改动无冲突）
- `memory/domain-coupling-course-study-task.md` — 培训计划 ↔ 学习任务耦合点
