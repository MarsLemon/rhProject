# Spring Bean 循环依赖：SysRoleServiceImpl ↔ SysRoleMenuServiceImpl

## 问题现象

应用启动时 Spring 抛出循环依赖错误：

```text
realPersonAddJob
  ↓
sysUserServiceImpl
  ↓
sysRoleServiceImpl
  ↑     ↓
  └ sysRoleMenuServiceImpl

Relying upon circular references is discouraged and they are prohibited by default.
```

Spring Boot 2.6+ 默认禁止循环引用，导致服务无法启动。

## 根因

两个 Service 互相注入：

- `SysRoleServiceImpl` 依赖 `SysRoleMenuService`
  - 用途：角色 `data_scope` 变更时调用 `sysRoleMenuService.clearUserRedisCache(roleId)` 清理相关用户登录缓存。
- `SysRoleMenuServiceImpl` 依赖 `SysRoleService`
  - 用途：`saveRoleIds()` 中调用 `sysRoleService.getById(roleId)` 实时读取角色当前 `dataScope`。

## 解决方案（重构消除循环）

**不推荐使用 `@Lazy` 绕过，优先通过抽取独立 Service 彻底切断循环。**

新增 `SysRoleUserCacheService`，把 `clearUserRedisCache` 逻辑从 `SysRoleMenuServiceImpl` 迁移过去：

- 新组件依赖：`SysUserRoleMapper`、`SysUserMapper`、`RedisService`。
- `SysRoleServiceImpl` 改为依赖 `SysRoleUserCacheService`，不再依赖 `SysRoleMenuServiceImpl`。
- `SysRoleMenuServiceImpl` 也改为依赖 `SysRoleUserCacheService`，内部不再自己实现缓存清理。
- 从 `SysRoleMenuService` 接口中移除 `clearUserRedisCache` 方法。

### 涉及文件

- 新增：
  - `wk-train-center-service/yf-modules/yf-module-system/src/main/java/com/yf/system/modules/user/service/SysRoleUserCacheService.java`
  - `wk-train-center-service/yf-modules/yf-module-system/src/main/java/com/yf/system/modules/user/service/impl/SysRoleUserCacheServiceImpl.java`
- 修改：
  - `wk-train-center-service/yf-modules/yf-module-system/src/main/java/com/yf/system/modules/user/service/SysRoleMenuService.java`
  - `wk-train-center-service/yf-modules/yf-module-system/src/main/java/com/yf/system/modules/user/service/impl/SysRoleMenuServiceImpl.java`
  - `wk-train-center-service/yf-modules/yf-module-system/src/main/java/com/yf/system/modules/user/service/impl/SysRoleServiceImpl.java`
  - `wk-train-center-service/yf-modules/yf-module-system/src/test/java/com/yf/system/modules/user/service/impl/SysRoleMenuServiceImplTest.java`

### 验证

```powershell
mvn -f wk-train-center-service/pom.xml -pl yf-modules/yf-module-system test -q
```

- `SysRoleMenuServiceImplTest`：3 个测试全部通过
- `yf-module-system` 全模块测试：通过，无回归

## 经验总结

1. **不要依赖 `@Lazy` 解决循环依赖**：它只能让应用启动，循环本身仍然存在，长期会埋下隐患。
2. **通过抽取第三方组件解耦**：把两个 Service 都需要的横切逻辑（如缓存清理、事件通知）下沉到独立的 Service/Component，让原双方都不再直接互相引用。
3. **写单测时留意**：`ServiceImpl` 子类若同时用 `@RequiredArgsConstructor` + Mockito，`baseMapper` 不会自动注入，需要 `ReflectionTestUtils.setField` 手动设置或用 `@Spy` 打桩。
