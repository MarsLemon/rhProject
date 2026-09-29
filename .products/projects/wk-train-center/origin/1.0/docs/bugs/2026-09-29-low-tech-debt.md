# 2026-09-29 Low 技术债 3 项展开

> **ADR 状态**:仅记录(主公 2026-09-29 拍板"不修,但展开说让主公决策")
> **建立日期**:2026-09-29
> **关联文档**:`bugs/2026-09-28-business-bug-index.md`(81 项索引)/ `changelogs/2026-09-28-fix.md`(T1+T2+T3 修复记录)

---

## 一句话总结

**Low 技术债 3 项中,1 项(L-Bug-2)有真实安全风险建议立即修,2 项是技术债/可用性问题可逐步优化**。主公原口径"不关心运维/低优先 + 仅记录不修",本次展开是为让主公未来有据可查。

---

## L-Bug-1:DDD 三层规范 95% 失效

### 现状

- **95 个 ServiceImpl** extends `ServiceImpl<Mapper, Entity>`(直接持有 Mapper + Entity)
- **240 处 / 81 文件** Controller `@RequestBody DTO`(违反 `AGENTS.md` 规则 3)
- **500+ 个包路径** 不符(`modules.<area>.<sub>.{controller,dto,entity,mapper,service}` 而非 AGENTS.md 要求的 `controller.vo` / `service.dto` / `repository.entity`)
- 唯一合规模块:`yf-module-training-sign-in`(规范模板)

### 业务影响

- Service 直接持有 Entity,业务逻辑和持久化未分离
- 改字段类型从 Controller 一路穿透到 DB,无边界
- 跨模块依赖:`PlanUserServiceImpl` 直接 `import com.yf.exam.modules.admin.exam.entity.Exam`,plan ↔ exam 域边界破
- 维护成本:新人接手要理解"AGENTS.md 写的 vs 实际写的"两层现实

### 修复方案(3 选 1)

- **A 全量重构**:95 个 Service 拆 Service + Repository,工作量大 ~3 dev·月
- **B 灰度重构**:挑 1 个模块(yf-module-plan)做模板,~2 dev·周,然后推广 → **推荐**
- **C 写新代码按 DDD,旧代码不动**:增量改善,~1 dev·周/月

### 优先级:**中**(技术债,不影响业务,但阻碍新功能开发)

### 资源需求

- 方案 A:3 dev·月
- 方案 B:2 dev·周(短期可见回报)
- 方案 C:每月 1 周

---

## L-Bug-2:`SysDepartController.batch-add` 无 Shiro 注解

### ⚠️ 安全风险(主公原口径"运维不关心"应排除此项)

### 现状

- `SysDepartController.java:68` `@PostMapping("/batch-add")` **无 `@RequiresPermissions`**
- 同时 `ShiroConfig.java:80-81` `map.put("/api/sys/depart/batch-add", "anon")` + `map.put("/api/sys/depart/batch-add-function", "anon")`
- **双层无防护**:即使 Controller 加注解,Shiro anon 名单放过直接绕过

### 业务影响

- 任何登录用户可批量添加部门,污染组织架构
- `batch-add-function` 类似(批量加部门功能权限),同样 anon
- 测试场景:`curl -X POST /api/sys/depart/batch-add -d '...'` 不需任何权限

### 修复方案

```java
// Controller 加注解
@RequiresPermissions("sys:depart:batchAdd")
@PostMapping("/batch-add")
public ApiRest<?> batchAdd(...) { ... }

// ShiroConfig 移除 anon
// map.put("/api/sys/depart/batch-add", "anon");  ← 删
// map.put("/api/sys/depart/batch-add-function", "anon");  ← 删
```

### 优先级:**高**(安全风险,主公原口径"运维不关心"应排除此项)

### 资源需求
~2 dev·hour(2 文件改动)

---

## L-Bug-3:`SysUserService` 角色变更触发全局菜单缓存清空

### 现状

- `SysUserServiceImpl.java:583-584` `@CacheEvict(value = CacheKey.MENU, allEntries = true) public void save(...)`
- 改任意用户角色 → 清所有 MENU 缓存(全用户)

### 业务影响

- admin 批量导入 1000 用户 → 1000 次 `@CacheEvict(allEntries=true)` → 所有在线用户下次请求穿透到 DB → DB CPU 100%
- 缓存击穿

### 修复方案

```java
// 改精准清(只清受影响 userId)
@CacheEvict(value = CacheKey.MENU, key = "#userName")
public void save(...) { ... }

// 或加载角色受影响用户集合后循环精准清
List<String> affectedUserIds = roleService.listUserIdsByRoleId(roleId);
for (String uid : affectedUserIds) {
    cacheManager.getCache(CacheKey.MENU).evict(uid);
}
```

### 优先级:**中**(可用性问题,不是安全)

### 资源需求
~1 dev·hour(1 文件)

---

## 决策矩阵

| Bug | 主公原口径 | 实际影响 | 主公下一步建议 |
|---|---|---|---|
| **L-Bug-1** DDD 失效 | 不修 | 拒绝(技术债,不阻塞业务)| 长期灰度重构 |
| **L-Bug-2** batch-add 无 Shiro | 不修 | **真实安全风险** | **建议立即修(~2h)** |
| **L-Bug-3** 缓存全清 | 不修 | 可用性(高峰期 DB 100%)| 批量导入前临时修 |

---

## 教训记录(shared-experiences 引用)

按 shared-experiences.md 经验 22"写文档前必须先问",本次先 grill-me 主公位置(`E:\rhProject\.products\projects\wk-train-center\origin\1.0\docs\bugs`),主公拍板后再写。后续 Low 技术债新增条目也按此流程。

按经验 15"批量 bug 修前必须逐个验证真实性",本次仅展开不修 — 留主公决策空间。