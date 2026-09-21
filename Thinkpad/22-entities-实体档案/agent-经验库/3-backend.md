---
title: 3-backend 经验库
created: 2026-07-09
updated: 2026-07-09
type: meta
tags: [meta, master, backend]
owner: 沈超
agent: 小马(架构师)
---

agent: 小马(架构师)
owner: 沈超

# 3-backend 经验库

> **本类涵盖**:Java/Spring、DDD、后端测试、架构设计、安全、DB
> **适用**: backend-only
> **绝对不写业务细节**——只写"如何让后端开发变强"的通用能力教训。

## 📋 经验索引(按能力维度)

| 维度        | 数量 | 简述               |
| ----------- | ---- | ------------------ |
| 🔍 资料检索 | 1    | ADR 与代码现状对账 |
| ❓ 反问澄清 | 0    | 待补充             |
| 🔧 实现     | 0    | 待补充             |
| ✅ 验证     | 0    | 待补充             |
| 🤝 协作     | 0    | 待补充             |
| 🛡 边界     | 0    | 待补充             |
| 📝 表达     | 0    | 待补充             |

## 💡 经验条目

## [2026-07-10] 🔧 实现 — 跨 service 调方法,接口必须显式声明,实现类 public 看不到

**能力维度**: 🔧 实现
**触发**: 主人 2026-07-10 报 RBAC 双角色数据权限反转 bug,方案 3 双保险实施。SysRoleServiceImpl.save() 改完调 `sysRoleMenuService.clearUserRedisCache(roleId)`,mvn compile 报「找不到符号 clearUserRedisCache(String) — 类型为 SysRoleMenuService」。根因:`clearUserRedisCache` 在 SysRoleMenuServiceImpl 是 public,但父接口 SysRoleMenuService 没声明。SysRoleServiceImpl 通过接口注入(@RequiredArgsConstructor final SysRoleMenuService),编译器只看接口方法表。
**抽象教训**: **跨 service 调用的方法,必须在接口层声明,实现类 public 不够用**。这是 Spring DI + Lombok @RequiredArgsConstructor 的常见盲区:实现类随手加 public 方法,本类调没问题,跨 service 调就编译失败。三步自检:

1. 写完 public 方法先想「这个方法要被谁调」 — 跨 service 必须补接口
2. 编译报"找不到符号"且符号是 service 类型 → **90% 是接口没声明**,不要改注入类型
3. 接口声明要带 Javadoc 说明调用场景,避免后续被人当冗余删除

**反模式**:

- ❌ 把 `sysRoleMenuService` 强转成 `SysRoleMenuServiceImpl`(`(SysRoleMenuServiceImpl) sysRoleMenuService`)绕过接口 — 破坏 DI 解耦
- ❌ 在 SysRoleServiceImpl 自己实现一套「清 Redis 缓存」逻辑 — 重复代码,易漏边界
- ❌ 看到编译失败就猜"是不是 import 错了"先看 import 层级 — 90% 是接口问题

**正模式**:

1. 实现类加 public 方法 → **同时在父接口加方法签名**
2. 接口方法必带 Javadoc 写清调用方(@link 到调用方 service),留协作线索
3. 编译一次性过 → 无需 fallback

**📎 证据链**:

- 触发:方案 3 实施,SysRoleServiceImpl.java:133 调 clearUserRedisCache
- 报错:`[ERROR] /E:/rhProject/wk-train-center-service/.../SysRoleServiceImpl.java:[133,31] 找不到符号  方法 clearUserRedisCache(java.lang.String)  位置: 类型为com.yf.system.modules.user.service.SysRoleMenuService的变量 sysRoleMenuService`
- 修复:`SysRoleMenuService.java` 接口加 `void clearUserRedisCache(String roleId);` 声明(3 行方法签名 + 5 行 Javadoc)
- 验证:`mvn clean compile -pl yf-modules/yf-module-system -am -DskipTests -q` exit 0;`mvn test-compile -pl yf-modules/yf-module-system -am -q` exit 0

**适用**: backend-only(Spring DI + Lombok 项目)
**复用计数**: 1
**状态**: 🟡 待验证

## [2026-07-10] 🔍 资料检索 — 子任务派单前先 git status 看 main 端是不是已经做了

**能力维度**: 🔍 资料检索
**触发**: 主人派"实施方案 3 — 多角色数据权限反转 bug Java 修复",3 改 + 2 测试。一上来读 main 文件发现 SysUserServiceImpl.fillRoleData 已经 MAX、SysRoleMenuServiceImpl.saveRoleIds 已经 throw、SysRoleServiceImpl.save 已经 clearUserRedisCache — **3 个 main 改动全在 working tree(未 commit)**。再 `git status --short` 才确认这套改动是上游已做完的。
**抽象教训**: **子任务派单前必先 `git status --short <path>` 看 main 端是不是已经做了改动**。如果主人描述的"3 改"在 HEAD/working tree 已经生效,**不要重复改**,只补缺口(测试 + 接口声明)。否则会覆盖主人已确认的版本,反而回退。
**反模式**:

- ❌ 看到子任务描述就直接动手 — 不读现状代码 = 盲改
- ❌ 看一眼代码"长得像改完了"就跳过 — working tree 改动 ≠ HEAD,git diff 看清楚
- ❌ 改了之后才发现重复 → 浪费 token 还可能引入 diff 冲突

**正模式**:

1. **第一件事**:并行 `read_file 3 个 main 文件关键行` + `git status --short <path>`(同时跑)
2. **第二件事**:`git diff --stat HEAD <path>` 看改动规模,确认是谁改的、改了啥
3. **第三件事**:如果 main 已改 → 跳到「补缺口」(测试 / 接口声明 / 编译验证),不要碰 main
4. **第四件事**:补完跑 `mvn compile` 验证整体通过,再交付

**📎 证据链**:

- 触发:2026-07-10 子任务派单,实际 3 个 main 文件已改(working tree ` M` 状态,git diff --stat 显示 +39 -8 行)
- 验证:`git status --short yf-modules/yf-module-system/src/main/java/com/yf/system/modules/user/service/impl/` → 3 个 M
- 跳过改动:`mvn compile` 报错「找不到 clearUserRedisCache」→ 才发现接口没声明 → 才补 `SysRoleMenuService.java` 接口签名
- 教训:接口声明这一改不属于原 3 改,是「派单描述漏了第 4 改」(接口),说明子任务的"3 改 + 2 测试"清单是高层描述,落地要靠 git 现状 + 编译反馈兜底

**适用**: backend-only(Java + Spring 项目,改多文件场景)
**复用计数**: 1
**状态**: 🟡 待验证

<!--
模板参考:
## [YYYY-MM-DD] [能力维度] — [经验标题]

**能力维度**: ...
**触发**: ...
**抽象教训**: ...
**反模式**: ...
**正模式**: ...
**适用**: backend-only
**复用计数**: N(≥3 自动升 🟢)
**状态**: 🟡 待验证 / 🟢 已验证 / 🔴 已废弃
-->

## 📦 合并自

- `backend-experiences.md`(1 条活经验 — **legacy 存档已移 7-archive**,本 master 0 条起步)
- `backend-test-experiences.md`(0 条,空壳,内容见 `7-archive/backend-test-experiences.md`)
- `architect-experiences.md`(0 条,空壳,内容见 `7-archive/architect-experiences.md`)
- `security-specialist-experiences.md`(0 条,空壳,内容见 `7-archive/security-specialist-experiences.md`)

---

## 🔗 后端专属外部指针

| 指向 | 用途 | 启动必读时机 |
|---|---|---|
| `.products/projects/wk-train-center-service/docs/version-registry.json` | 后端版本号登记表(替代老 documents/versions.json) | 接任务第一步,确认当前版本号 + 下一版本规划 |
| `.products/projects/wk-train-center-service/docs/DEPRECATED-FEATURES.md` | 后端废弃功能清单(防 AI 复辟) | 接任务第二步,grep 任务关键词,命中必 grill-me |
| `Thinkpad/_archive/2026-07-documents-snapshot/README.md` | 老 documents/ 快照归档说明 + 复活指引 | 仅当主人显式调"查旧菜单权限数据"时 read |
| `Thinkpad/22-entities-实体档案/agent-经验库/shared-experiences.md` | 跨栈共享经验(含 version-registry 防复辟模式条目,2026-07-14) | 季度复盘 / Agent 启动协议修订时读 |

### 本栈专属条目(本 master 维护)

<!--
后端独有的能力教训写在这里,跨栈可复用的写 shared-experiences.md。
判定标准:能力教训只在后端开发/测试/架构场景生效 = backend-only。
-->
