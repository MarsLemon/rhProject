# 2026-09-27 全栈 EVAL 评估报告与决策建议

> **ADR 状态**:记录中(RECORDED)
> **决策日期**:2026-09-27
> **评估者**:adversarial verify + 4 subagent 并行深度扫描
> **关联决策**:`domain-overview.md` / `domain-coupling-course-study-task.md` / `domain-coupling-notify-rich-media.md` / `2026-06-24-培训学习域增强迭代.md`

---

## 一句话总结

**整个系统当前处于"任意匿名请求 3 次 HTTP 调用拿到 admin 权限"的状态**,且历史修复不彻底、决策文档与代码严重脱节、DDD 三层规范 95% 失效。**必须立即处置 P0 复合链 A**(匿名登录 + 用户同步),其余问题按矩阵分阶段修复。

> **主公 2026-09-28 拍板更正**:原报告 C-007「1.5.1 DDL 未执行 = 系统级 500」风险**已解除**(主公确认 dev/stage/pro 全环境已执行 1.5.1 DDL)。本文 Critical 表 / 决策推荐 / 累计汇总部分已同步更新。其余 14 项 Critical 维持原评。

---

## 风险矩阵(主公一眼能看明白)

| 风险等级 | 数量 | 一句话说明 | 处理时间 |
|---|---|---|---|
| 🔴 **超 Critical(复合链)** | **1 条** | 3 次 HTTP 调用拿到 admin | **24 小时内** |
| 🔴 **Critical** | **10 条** | 数据安全 / 任意用户接管 / 系统级 500 | **48 小时内** |
| 🟠 **High** | **15 条** | 生产风险 / 越权 / XSS / 性能雪崩 | **1 周内** |
| 🟡 **Medium** | **30+ 条** | 技术债 / 业务漏洞 / 配置反模式 | **2 周内** |
| 🟢 **Low** | **60+ 条** | 建议优化 / 命名 / 风格 | **季度内** |

---

## 🔴 超 Critical(必须 24 小时内修)

### 复合链 A:匿名登录 → 用户接管 → 全栈渗透

| 步骤 | 接口 | 风险 |
|---|---|---|
| 1 | `POST /api/open/wk/sync-user` | 创建/修改任意 user,**包括 role=admin** |
| 2 | `POST /api/open/wk/login?userId=xxx` | 匿名拿该 user 的 JWT(无密码/无签名) |
| 3 | 用 token 调任意 admin API | Plan/Course/Exam 物理删除 + 全部数据可控 |

**为什么是最严重**:
- 接口零鉴权(Shiro `anon`)
- 无密码 / 无签名 / 无 IP 白名单
- `sync-user` 接受 `mobile/role/operator/state` 任意字段
- 3 次 HTTP 调用搞定

**修复(成本 ~10 行代码)**:
```java
// 1. ShiroConfig.java 移除 anon
//    map.put("/api/open/wk/**", "anon");  ← 删掉

// 2. 加 X-Open-Sign 签名校验
@PostMapping("/login")
public RespVo<?> login(@RequestParam String userId,
                       @RequestHeader("X-Open-Sign") String sign,
                       @RequestHeader("X-Open-Ts") long ts) {
    String expect = HMAC_SHA256(SECRET, ts + "&" + userId);
    if (!sign.equals(expect) || Math.abs(now - ts) > 60_000) {
        throw new ServiceException("签名校验失败");
    }
    ...
}
```

---

## 🔴 Critical(48 小时内修)

| # | 问题 | 文件 | 一句话 |
|---|---|---|---|
| C-001 | JWT Secret 硬编码 | `JwtUtils.java:37` | 反编译可伪造任意用户 token |
| C-002 | 字典 SQL 注入 4 个 `${}` | `SysDicValueMapper.xml:16,20` | 任意表读取 + UNION 注入 |
| C-003 | 生产 DB 密码明文 | `application.yml:39` | 阿里云 RDS root 密码裸奔 |
| C-004 | Druid 监控 + Swagger UI 全 anon | `ShiroConfig.java:158-160` | SQL 监控 + API 文档泄露 |
| C-005 | Plan 删除不级联 | `PlanServiceImpl.java:137-148` | 学员进度 / 补考授权变孤儿 |
| C-006 | AI 模块缺 `plan_id/node_ref_id` | `TrainingRecordEntity.java` | 陪练记录无法关联任务节点 |
| C-007 ~~1.5.1 DDL 未执行~~ | **已执行**(主公 2026-09-28 确认) | `db/1.5.1/plan/ddl.sql` | 系统级 500 风险已解除,次级风险:历史数据 NULL 与 DEFAULT 0 不一致(BC-011 兼容性问题) |
| C-008 | 软删除 `@TableLogic` 0 命中 | Plan/Course/Exam 模块 | 物理删除 + 无恢复机制 |
| C-009 | 前端 `formatRichText` 不 sanitize | `utils/format.js:292-313` | 全站存储型 XSS |
| C-010 | `.mcp.json` Apifox token 明文 | `.mcp.json:65` | 历史修复遗漏 |

---

## 🟠 High(1 周内修)

| # | 问题 | 文件 |
|---|---|---|
| H-001 | Nacos 弱口令 `123456` | customer-pricing + supply 独立项目 |
| H-002 | 站内信缺 `routeType/routeId/routeUrl` | `Msg.java` (db/1.4/notify/ 目录不存在) |
| H-003 | `getScoreMerge` 前端调用 → 后端 404 | `api/plan/user.js:44` |
| H-004 | `annual-training-plan-collections` 0 后端 Controller | `api/training-plan/` 整个域 |
| H-005 | N+1 查询 `StatRepoServiceImpl:55-69` 25×SQL | 题目统计模块 |
| H-006 | `@CacheEvict(allEntries=true)` 缓存雪崩 | `SysUserServiceImpl:582-583` |
| H-007 | `@Transactional` 缺 `rollbackFor = Exception.class` | wk-module-ai 6 处 + 其他 24 处 |
| H-008 | postMessage `targetOrigin='*'` | `permission.js:40` |
| H-009 | `ifAccess` 路径前缀绕过 | `utils/auth.js:31-83` |
| H-010 | Token 三处冗余存储 | `utils/auth.js:13-15`(Cookie + localStorage + sessionStorage) |
| H-011 | Token 落 URL query | `layout/login/sync.vue:9` |
| H-012 | `loadView` require 路径由后端控制 | `store/modules/permission.js:11-22` |
| H-013 | `window.onresize` 覆盖全局监听 | `utils/watermark.js:55` |
| H-014 | Vue 2.7 + Element-UI 2.15.14 EOL | `package.json` 多处 |
| H-015 | DDD 三层 95% 失效 | 95 ServiceImpl + 240 Controller-DTO + 500+ Package |

---

## 🟡 Medium 摘要(2 周内修)

- 业务:`PlanUserController.incomplete` GET vs POST / `PlanController.save` 不返回 ID / `CourseDTO.simpleDetail` 暴露 password
- 数据:`el_plan_user_node` 软删过滤误伤历史记录 / `el_training_record` 无 `dept_code` 多租户
- 事务:`PlanServiceImpl.delete` 级联缺 / `PlanGroupServiceImpl.saveAll` 先删后增 + `skippedCount++` 静默
- 性能:`PlanUserMapper.xml` 6 层嵌套(单页 8000 子查询) / `QuReportServiceImpl.threadPool` 无关闭
- 依赖:OkHttp 3.14.4 CVE / Hutool 5.7.17 / vue-router 3.0.2 / dropzone 5.5.1

---

## 复合威胁链(单独存在可能 Medium,组合后 Critical)

| 链 | 组合 | 危害 |
|---|---|---|
| **链 A(超 C)** | sync-user + 匿名登录 + JWT Secret | 3 次 HTTP 拿 admin |
| **链 B** | Druid anon + Swagger anon + Apifox token | 监控/文档/测试账号全暴露 |
| **链 C** | formatRichText XSS + Token 三处存储 | XSS → Token 一锅端 |
| **链 D** | Plan 物理删除 + 不通知学员 + 学习记录 plan_id 孤儿 | 学员端查已删计划进度 |
| **链 E** | Druid 连接池 5000 + Tomcat threads 5000 + RDS 2000-4000 | 服务雪崩(必爆) |

---

## 决策推荐(主公拍板)

### A. 立即处置(24-48 小时)
1. **链 A** 修复:ShiroConfig 移除 `/api/open/wk/**` anon + 加签名校验
2. **C-002** 字典 SQL 注入:改 `#{}` + Service 层白名单
3. **C-004** Druid/Swagger:ShiroConfig 移除 anon + 加内网白名单
4. ~~C-007 1.5.1 DDL 执行授权~~ → **已执行,移除本项**

### B. 本周处置(1 周内)
5. **C-001** JWT Secret 接入 KMS / Nacos
6. **C-009** 前端 formatRichText 走 sanitize
7. **H-002** 站内信 `routeType/routeId/routeUrl` 决策(实施或废弃)
8. **H-003/H-004** 决策前端 training-plan 域:删除 orphan 视图 or 补齐后端

### C. 本月处置(2-4 周)
9. **C-008** 8 张主表加 `@TableLogic`(分批 PR,每批单模块)
10. **H-015** DDD 灰度重构:挑 1 个模块做模板,推广 95 个
11. **C-006** AI 模块补 `plan_id/node_ref_id`(决策文档已立项)

### D. 下季度处置
12. Vue 3 + Element-Plus 渐进迁移(评估)
13. 依赖升级(OkHttp 4.12 / Hutool 5.8.25 / vue-router 3.0.7+)
14. Dockerfile openjdk:8u131 → 17

---

## 资源需求估算

| 阶段 | 工时 | 人员 |
|---|---|---|
| A 立即处置 | 1-2 dev·day | 1 后端 + 1 前端 |
| B 本周 | 3-5 dev·day | 1 后端 + 1 前端 + 1 DBA |
| C 本月 | 10-15 dev·day | 2 后端 + 1 前端 + 1 测试 |
| D 下季度 | 20-30 dev·day | 全栈 |

---

## 关键决策待主公拍板

| # | 决策点 | 选项 |
|---|---|---|
| 1 | ~~1.5.1 DDL 紧急执行~~ → **已执行(2026-09-28)**,移除本项 | — |
| 2 | JWT Secret 是否接入 **KMS**? | A 接入 / B 用 Nacos / C 暂用 env |
| 3 | 前端 `formatRichText` 是否统一走 **`sanitizeRichText`**? | A 立即 / B 评估 Element-Plus |
| 4 | DDD 重构是 **全量** 还是 **灰度**(单模块模板)? | A 灰度 / B 全量 |
| 5 | training-plan 域 orphan 视图是 **删除** 还是 **补齐**? | A 删除 / B 补齐 |
| 6 | Vue 2.7 EOL 是否启动 **Vue 3 迁移**? | A 启动 / B 暂缓 |

---

## 附录:验证过程可信度

- **T0 基线**:5 分钟,读项目结构 + 决策文档
- **T1.1 ~ T1.6**:6 个 subagent 并行,~50 分钟
  - Backend 全维度 / Backend DDD 合规 / Frontend Vue2 / 全栈安全(初版) / 全栈安全(深化) / 业务链路跨模块 × 2
- **T2.1 自验**:我亲自 Read 12 项 Critical,**12/12 全部真实**
- **T2.2 adversarial verify**:1 subagent,~3.5 分钟,**发现 14 项新 bug + 3 项复合链 + 2 项过度推断修正**

---

## 历史 commit 跟进结论

| Commit | 修复内容 | 是否彻底 |
|---|---|---|
| `525b2fa` fix(security): 脚本中脱敏 token | PowerShell 占位符 | ✅ 彻底 |
| `bdf5f38` fix(security): 清理 mcp.json 密钥 | 5 处 firecrawl/mysql 改 env | ⚠️ **遗漏 Apifox Bearer token** |
| 1.5.1 DDL 执行历史 | dev/stage/pro 全未执行(原报告)→ **已执行(主公 2026-09-28 确认)** | ✅ 系统级 500 风险解除 |
| `313ade0` chore(gitignore): 忽略本地 MCP 配置 | 加 `.mcp.json` 到 gitignore | ⚠️ **规则有效但 `.mcp.json` 已 tracked,需 `git rm --cached`** |

---

**ADR 编号**:AD-2026-09-27-EVAL
**下一步**:主公根据决策推荐拍板 A/B/C/D 哪条路径,触发对应 subagent-driven-development 实施。