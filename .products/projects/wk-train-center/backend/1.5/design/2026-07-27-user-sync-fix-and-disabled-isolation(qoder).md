# 用户同步修复与禁用用户全链路隔离

> **日期**: 2026-07-27
> **版本**: 1.5（PC/web 端）
> **作者**: claude（与主人结对排查/修复）
> **涉及仓库**: wk-train-center-service、wk-user、wk-train-center-ui（v2）、wk-train-center-ui-v3、wk-generic（净变化 0）
> **状态**: 代码完成、编译通过，待发版 + 运维配置 + 数据治理

---

## 一、背景与问题

生产学习中心（train-center.winkong.pro）790 个用户中大量账号**缺工号、缺职务、缺部门**（用户管理页面肉眼可见），且离职员工账号仍可登录。

### 根因清单（测试库数据交叉验证实锤）

| # | 根因 | 位置 |
|---|---|---|
| 1 | 增量同步（加培训角色触发）报文**不含工号/职务字段**，新用户天生残缺 | 协议设计 |
| 2 | 全量同步接收端：部门/职务编号匹配不上就 `continue` **静默跳过整个用户**（连工号都不更新，无日志） | train `UserSyncServiceImpl` |
| 3 | 两套部门体系打架：增量按**名称**建部门（无 deptNo），全量按 **deptNo** 匹配，名称部门下的用户全部命中根因 2 | 架构缺陷 |
| 4 | wk-user 任职 SQL 缺 `state=1` 和任职起止时间过滤，可能推送已失效任职 | `EmployeeDepartmentMapper.xml` |
| 5 | 批量加角色的异步同步循环无 try/catch，一人失败整批漏同步 | wk-user `RoleServiceImpl` |
| 6 | 职务 `toMap(functionNo)` 单键，跨部门同名职务 → Duplicate key 炸整次全量 | train 两处 |
| 7 | 部门职务周任务接收端只按 functionNo 匹配已有职务 → 同名职务被**跨部门搬家**，职务错乱 | train `SysDepartServiceImpl#batchAddFunction` |
| 8 | `new RestTemplate()` 无超时 + `@Transactional` 事务内同步 HTTP → 学习中心卡死可拖垮用户中心连接池 | wk-user `TrainCenterUserSyncRepositoryImpl` |
| 9 | 只判 HTTP body 非空不判业务 code（train 报错返回 HTTP 200 + 错误码）→ 同步失败被当成功 | 同上 |
| 10 | 企业成员查不到直接抛异常 → 一人炸掉整个全量组装 | wk-user `UserServiceImpl` |
| 11 | 离职员工被 `continue` 过滤出同步 → 离职账号在学习中心**永远正常、可登录** | 同上 |
| 12 | 禁用用户仍可被指派任务、仍计入所有统计（全系统仅登录和评审人圈选过滤 state） | train 多处 |

关键验证数据（测试库）：挂在"有 deptNo 部门"下的 32 个用户字段 **0 缺失**；挂在"名称部门/无部门"下的 62 个用户大面积缺失——实锤根因 2+3。

---

## 二、代码改动明细

### 2.1 wk-train-center-service（接收端 + 禁用隔离）

| 文件 | 改动 |
|---|---|
| `wk-modules/wk-module-openapi/.../UserSyncServiceImpl.java` | ① 部门/职务匹配失败 → **降级更新基础字段**（工号/姓名/手机号照常同步）+ warn 日志，不再整人跳过；② 职务索引改 `deptNo#functionNo` 复合键 + merge function 防 Duplicate key；③ `sysUsers`/`departList` 为空不再整批静默终止；④ deptNos 空集合防 `IN ()` 非法 SQL；⑤ **离职冻结**：`state=1` → `UserState.DISABLED`，离职者不创建新账号，state 为空不动状态（防止解冻管理端手动禁用）；⑥ 同步完成统计日志 |
| `.../UserInfoSyncReqDto.java` / `UserInfoSyncCommand.java` / `WkUserSyncController.java` | 同步协议新增 `state` 字段（1=禁用/离职冻结，空=不变更） |
| `yf-modules/yf-module-system/.../SysDepartServiceImpl.java#batchAddFunction` | 复合键匹配职务，只更新本部门记录，**不再跨部门搬职务**；functionCodeList 空集合防护。⚠️ 此修复与 UserSyncServiceImpl 复合键设计**强耦合**：不修则用户全量同步创建跨部门同名职务后，下个周一部门职务任务必炸 |
| `yf-modules/yf-module-system/.../EnterDistJob.java` | 指派展开（部门/群组/手选人三路合并）写入 `el_enter_dist` 前统一 `filterNormalUsers()` 只留 state=0 —— **禁用用户不再被指派的总闸门** |
| `mapper/enter/EnterDepartMapper.xml` / `EnterGroupMapper.xml` | 部门/群组展开 SQL 加 `uc.state=0`（与 EnterDistJob 双保险） |
| `mapper/admin/stat/PlanStatMapper.xml` | 计划总览/学员分页/环节参与/完成人数全部排除禁用用户 |
| `mapper/admin/user/PlanUserMapper.xml` | 计划学员进度名单排除禁用（queryUser 的条件 WHERE 重构为常驻 WHERE） |
| `mapper/exam/StatExamMapper.xml` | 考试总览（含公开考试子查询）、成绩分页、错题统计、错题人员、考试导出全部排除禁用 |
| `mapper/exam/StatTotalScoreMapper.xml` / `StatScoreRangeMapper.xml` | 总分排行/分数段排除禁用；`userScopeQuery` 统一为 `<trim prefix="AND (" suffix=")">` 写法（见 3.1） |
| `mapper/exam/StatExamGroupMapper.xml` | 群组统计：群组行保留，禁用成员不计入人数/均分 |
| `yf-modules/yf-module-openapi/mapper/UserListStatMapper.xml` | 门户学习动态排除禁用用户 |

### 2.2 wk-user（发送端）

| 文件 | 改动 |
|---|---|
| `RoleServiceImpl.java` | 批量加角色异步循环内 `syncUser` 包 try/catch，单人失败记 error（含 userCode）不中断 |
| `EmployeeDepartmentMapper.xml#getEmployeeDepartmentSyncInfo` | 补 `state=1` + `office_begin_date<=now()` + `(office_end_date>=now() OR IS NULL)`，只取有效任职（已在库上实跑验证） |
| `TrainCenterUserSyncRepositoryImpl.java` | ① 双 RestTemplate：单人（连接 3s/读 15s）、全量（连接 3s/读 120s）；② 三处请求校验业务 code=`00000000`，失败记 error + 抛 SYNC_FAIL_ERROR；③ `getAuthAccess` 判空链防 NPE；④ 全量报文带 `state` |
| `UserServiceImpl.java` | ① 组装循环单人 try/catch（企业成员已删等不炸全批）；② 组装推送抽公共方法 `syncUsersToTrainCenter`；③ 新增**增量同步** `userSyncChangedInfo(hours)`：先查变更 userCode 集合，只推这批人；④ 离职员工不再过滤，改带 `state=1` 推送（工号/姓名照常携带） |
| `TrainCenterConstants` / `TrainCenterUserSyncInfoCommand` / `TrainCenterUserSyncInfo` / `TrainCenterUserSyncServiceImpl` | `state` 字段全链路透传（`USER_STATE_DISABLED=1`，对齐 train 侧 UserState） |
| `UserDao.java` + `UserMapper.xml#findChangedUserCodes` + `UserRepository(+Impl)` | 变更检测：`wk_user`/`wk_account`/`wk_employee`/`wk_employee_department` 四表任一 `update_time` 落在窗口内即视为变更（注意 wk-user 侧 `state=1` 为正常，与 train 相反，SQL 已按各自口径写） |
| `TrainCenterUserSyncTask.java` | xxl-job handler `trainCenterUserSyncTask`，参数分流：空=增量 25h 窗口（24h+1h 重叠防漏）/ `full`=全量 / 数字=自定义小时（补跑用） |

### 2.3 前端（v2 + v3 同步修改）

| 文件 | 改动 |
|---|---|
| `views/admin/sys/user/index.vue`（两工程） | 用户列表新增"状态"列：`el-tag` 纯展示（绿=正常 红=禁用 橙=待审核/过期），文本取 `state_dictText` 兜底"正常/禁用"。**只展示不可点**（主人拍板），改状态走原有批量操作 |
| `components/ComponentsBusiness/user/UserSelect.vue`（仅 v3） | 下拉选人补传 `state:'0'`（`UserSelectDialog` 两工程本就默认 state='0'，无需改） |

### 2.4 wk-generic

**净变化为 0，不需要发版**。中途实现过"部门任务链式 Feign 调用用户同步"，因超时误报风险 + 发版依赖，按主人决定改回单独 xxl-job 方案并完全还原。

---

## 三、本次终审发现并修复的 bug

### 3.1 空范围生成非法 SQL（自引入，已修）

统计排除禁用时把 `StatTotalScoreMapper.userScopeQuery` 从 `<where>` 改成裸 `<trim>` 后用 `AND (<include/>)` 拼接——若部门/人员/群组范围全为空会生成 `AND ()` 语法错误（`StatScoreRangeMapper.rangeBySelf` 原代码同样存在此隐患）。

**修复**：两处统一改为 `<trim prefix="AND (" suffix=")" prefixOverrides="OR">`——trim 内容为空时前后缀整体不输出，空范围安全退化为只有 `uc.state=0`。

### 3.2 终审确认无问题的项

- 状态列显示：`SysUserMapper.ListResultMap` 确认映射 `state`，`UserListRespDTO` 带 `@Dict(user_state)` 自动出字典文本
- `findChangedUserCodes` 的 state 口径：wk-user 侧 `state=1`=正常（与 train 相反），SQL 正确
- `el_sys_user` 无 mobile/user_name 唯一索引，全量建用户不会撞唯一键
- `EnterDistJob` 空列表守卫、`PlanStatMapper.countUser` 被 include 后追加条件的拼接均正确
- train 老入口 `/api/open/user/sync`（yf 体系）不在 Shiro 匿名名单，实际不可用，无旁路风险

---

## 四、已知边界与口径变化（发版前须知）

1. **统计口径变化**：禁用（离职）用户的历史成绩/学习记录不再计入通过率、排行榜、分数段、完成率（主人拍板"统计一律排除"）。业务方若问"某人成绩不见了"，答案是账号被禁用，启用即恢复，数据未删
2. **存量指派名单**：`el_enter_dist` 里已有的禁用用户不会立即消失，但统计查询已过滤（报表立即干净）；下次编辑保存计划/考试触发 `EnterDistJob` 重建时自动剔除
3. **只冻结不解冻**：同步永不把禁用改回正常（防解冻管理端手动禁用）；返聘复职需管理端手动启用；手动启用的离职者会在下次同步再被冻结（HR 数据为准）
4. **wk-user 账号本身被停用（wk_user.state≠1）的用户不参与同步**（`allUser()` 只取正常账号，历史如此）——若 HR 离职同时停用了 wk-user 账号，冻结信号到不了 train。观察期留意，若出现此场景需追加"停用账号也推送冻结"逻辑
5. **merchant（企业成员）用户**无工号/部门/职务是设计使然，非 bug
6. **多任职压扁**：每人只同步最新一条有效任职（LIMIT 1），多对多方案（主部门 + `el_sys_user_dept` 附属表）为独立迭代，建议部门体系治理干净后再做
7. v2 前端（Vue2 工程）改动为纯模板+方法，未跑完整 webpack 构建，上线前本地 `npm run dev` 点一遍用户列表

---

## 五、待办清单（按执行顺序）

### 5.1 发版（先 train-center 后 wk-user，generic 不发）

- [ ] wk-train-center-service 发版（接收端修复 + 禁用隔离）
- [ ] wk-user 发版（发送端修复 + 同步任务）
- [ ] 前端 v2/v3 按线上实际使用的工程发版（状态列）
- [ ] 发版前生产库留底：

```sql
-- 留底①：残缺用户总量（发版补数后对比，no_job 应≈归零）
SELECT COUNT(*) total,
       SUM(job_number IS NULL OR job_number='') no_job,
       SUM(dept_code IS NULL OR dept_code='') no_dept,
       SUM(function_id IS NULL OR function_id='') no_func
FROM el_sys_user;
-- 留底②：无编号孤儿部门清单（治理用）
SELECT dept_code, dept_name, create_time FROM el_sys_depart
WHERE dept_no IS NULL OR dept_no = '';
```

### 5.2 xxl-job 配置（已完成 ✅，留档）

| 任务 | 执行器 | handler | Cron | 参数 | 状态 |
|---|---|---|---|---|---|
| 103 用户增量同步 | wk-user | `trainCenterUserSyncTask` | `0 0 3 * * ?` | 空 | 发版后启动 |
| 102 用户全量兜底 | wk-user | `trainCenterUserSyncTask` | `0 0 0 1 1 ?`（占位） | `full` | **保持 STOP**，由 96 子任务触发 |
| 96 部门职务同步 | generic | `queryDepartmentFunction` | `0 0 8 ? * MON` | — | 子任务ID=102 已挂 ✅ |

⚠️ 确认 103 的子任务ID已清空（曾误挂 102 导致每天全量）。

### 5.3 首次补数（发版当天，顺序不能反）

- [ ] 任务 96 手动"执行一次"（部门职务先就位，被搬家的职务在正确部门重建）
- [ ] 任务 102 手动"执行一次"（790 人存量补齐 + 离职批量冻结）
- [ ] 对比留底①；核对冻结数量：`SELECT COUNT(*) FROM el_sys_user WHERE state=1` ↔ HR 离职名单
- [ ] 拉取 train `[syncAllUserInfo]` warn 日志（deptNo/functionNo 匹配失败明细）+ wk-user `syncUsersToTrainCenter` warn（组装失败用户）

### 5.4 孤儿部门数据治理（唯一人工决策项）

- [ ] 对留底②逐个判定：与编号部门重复 → 订正（用户挪到编号部门 + 删名称部门）；培训专用虚拟部门（如"岗前电气20260708"）→ 保留
- [ ] 订正 SQL 模板：

```sql
UPDATE el_sys_user SET dept_code='<编号部门dept_code>' WHERE dept_code='<名称部门dept_code>';
DELETE FROM el_sys_depart WHERE dept_code='<名称部门dept_code>'
  AND NOT EXISTS (SELECT 1 FROM el_sys_user u WHERE u.dept_code='<名称部门dept_code>');
```

订正后下一轮定时同步自动刷正 deptNo 归属，无需二次手工。

### 5.5 观察期（一周）

- [ ] T+1：增量任务日志应为"变更用户 N 个：[清单]"或"无变更跳过"
- [ ] 下周一：96 → 102 链路绿色通过；`batchAddFunction` 无 Duplicate key
- [ ] 日志平台对 `[syncAllUserInfo]`、`TrainCenterUserSyncTask` 的 warn/error 配关键字告警
- [ ] 测试环境把计划统计/考试统计/总分排行/分数段各点一遍（MyBatis XML 启动期才校验，重点回归 3.1 修复的两个空范围场景）

### 5.6 遗留项（后续迭代）

- [ ] 多对多任职同步（主部门 + `el_sys_user_dept`，方案已讨论，等部门治理后启动）
- [ ] train 孤儿账号对账（全量为单向推送不删数据，建议每季度对账一次）
- [ ] 大版本清理：删除废弃的 `OpenUserController#/api/open/user/sync` 与 ShiroConfig 中无对应 Controller 的 `/api/sys/user/sync-login` 死配置
- [ ] 边界 4（wk-user 停用账号的冻结传导）视观察期情况决定是否实现

---

## 六、验证状态汇总

| 项 | 方式 | 结果 |
|---|---|---|
| train-center 4 模块（system/stat/plan/openapi）+ wk-module-openapi | `mvn compile` | ✅ |
| wk-user 全模块 | `mvn compile`（wk-dev profile） | ✅ |
| 任职过滤 SQL / 变更检测 SQL | 开发库实跑 | ✅ |
| 归因交叉验证 | 开发库 94 用户按部门 deptNo 有无分组 | ✅ 实锤 |
| v3 前端 | `vue-tsc --noEmit` | ✅ |
| v2 前端 | 人工复核（未跑构建） | ⚠️ 上线前自测 |
| 最终架构 | 实时增量（加固）+ 每日 3 点增量（只推变更）+ 每周一部门职务→用户全量校准 | 三层防护 |
