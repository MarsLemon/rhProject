# V2 → V3 迁移代码审查报告(code-review skill,max effort)

> 生成日期: 2026-07-02
> 范围: `wk-train-center-ui-v3/`(已修改/未提交文件 + HEAD~10..HEAD)
> 模式: 10-angle finder sweep(5 correctness + 3 cleanup + 1 altitude + 1 conventions)+ 1-vote 验证 + gap-sweep
> 已存档: 历史审查(`/security-review` + V2↔V3 迁移状态)存于 `scripts/audit/v2-v3-migration-review-2026-07-02-archived.md`,本报告专注本次 review 新发现的代码缺陷。

---

## 严重度排序:12 个真漏洞(已逐个 1-vote 验证)

```json
[
  {
    "file": "E:/rhProject/wk-train-center-ui-v3/src/views/admin/sys/lecturer/index.vue",
    "line": 50,
    "summary": "缺少 `import { ref }`(脚本里 ref 用 7 次),依赖 unplugin-auto-import 兜底;若 auto-import 漏配或 strict mode 会 typecheck 失败",
    "failure_scenario": "若 `unplugin-auto-import` 关闭或 strict 模式开,`npm run typecheck` 报 `Cannot find name 'ref'`;运行时若组件提前 mount,dataTableRef/currentLecturerId 为 undefined,DataTable v-model:visible 静默失联"
  },
  {
    "file": "E:/rhProject/wk-train-center-ui-v3/src/components/ComponentsBusiness/keyPoint/AssociatedKnowledgeAiExtractDialog.vue",
    "line": 319,
    "summary": "AI 提取知识点回调里 `kpIds: extractedList.map(item => item.pointName)` 把知识点**名称**当 ID 数组传给后端,后端期望 ID 数组",
    "failure_scenario": "AI 提取返回 [{pointId:'kp_123', pointName:'船舶主机'}, ...] → 传给 saveExtracted 时 kpIds=['船舶主机',...] → 后端拿名字当 ID 查不到 / 创建失败 → 用户看到 '未提取到相关知识点',即使 AI 实际抽到了"
  },
  {
    "file": "E:/rhProject/wk-train-center-ui-v3/src/views/admin/sys/notice/index.vue",
    "line": 93,
    "summary": "V3 markTop 调用从 V2 的 `{ ids: obj.ids, top: ... }`(多选批量)改成 `{ id: obj.ids[0], isTop: ... }`(只取第一个),且字段名 top→isTop;多选置顶失效",
    "failure_scenario": "管理员选中 5 条通知 → 点 toolbar '置顶' → 只置顶了第一条;后端若仍按 V2 字段名 `top` 收,V3 的 `isTop` 字段直接被忽略,置顶功能静默失败"
  },
  {
    "file": "E:/rhProject/wk-train-center-ui-v3/src/views/admin/exam/exam/form.vue",
    "line": 386,
    "summary": "V2 dateRange 校验用 isDateRange(检查 start<end / 时间合法),V3 退化成 `{ required: true }` 仅校验非空",
    "failure_scenario": "用户填 dateRange = ['2099-01-01','2024-01-01'](end<start)→ V2 会被 isDateRange 拦截 → V3 通过校验提交后端 → 后端可能存库失败 / 出现 endTime<startTime 的脏数据"
  },
  {
    "file": "E:/rhProject/wk-train-center-ui-v3/src/views/admin/course/file.vue",
    "line": 222,
    "summary": "V3 的 rules 删掉了 `fileUrl` 必填 + 文件扩展名与 fileType 匹配的硬校验,V2 的扩展名白名单(11/22/33/44 文档/PDF/视频/图片)也没了",
    "failure_scenario": "管理员选 fileType='11'(文档)但上传 .mp4 视频 → V2 会弹 '文件类型与选择不匹配' 拦截 → V3 静默入库,污染课件库;批量转码/批量取信息的 fetchInfo/fetchState/transcode 按钮也消失"
  },
  {
    "file": "E:/rhProject/wk-train-center-ui-v3/src/views/admin/plan/plan/form.vue",
    "line": 293,
    "summary": "V3 validateTimeRange 删掉了 V2 的 `this.$refs.design.setError(errorNodes)` 调用,V2 会在设计画布上把错误节点标红,V3 只弹 ElMessageBox",
    "failure_scenario": "培训计划节点时间不合法 → V2 用户看到 PlanDesign 画布上对应节点红框 → V3 只看到一条 '时间范围不在...内' 弹窗,关掉后用户无法定位哪个节点错了,必须逐个打开检查"
  },
  {
    "file": "E:/rhProject/wk-train-center-ui-v3/src/views/admin/notify/components/SendMsgDialog.vue",
    "line": 245,
    "summary": "`document.querySelector('[data-form-send-msg]')` 查模板上根本不存在的属性,formRef 永远为 null,注释 '直接简单校验必填' 实际未跑 el-form rules",
    "failure_scenario": "用户在消息参数表里填了占位符但没填值,规则里没 params 校验所以不报错,提交后端模板渲染时占位符替换失败,消息内容显示 'undefined' 给收件人"
  },
  {
    "file": "E:/rhProject/wk-train-center-ui-v3/src/views/admin/sys/role/index.vue",
    "line": 92,
    "summary": "el-drawer 用了 Element UI 的旧 prop 名 `:wrapper-closable='false'`,Element Plus 已改名为 `:modal='false'`,当前 prop 无效 → 点遮罩关掉 drawer",
    "failure_scenario": "在角色页打开 '用户列表' drawer → 用户在抽屉外点灰色遮罩 → drawer 意外关闭 → 用户正在选用户的进度丢失,必须重开重选"
  },
  {
    "file": "E:/rhProject/wk-train-center-ui-v3/src/layout/Admin/Sidebar/SidebarItem.vue",
    "line": 22,
    "summary": "el-sub-menu 用 Element UI 的 `:popper-append-to-body='false'`,Element Plus 已改名为 `:teleported`,当前 prop 无效 → 子菜单 popper 渲染在 sidebar 内部被 overflow:hidden 裁掉",
    "failure_scenario": "在窄屏 / sidebar 边缘 hover 多级菜单(如 '系统管理 > 菜单管理') → 子菜单 popper 被 sidebar overflow:hidden 裁掉,用户看不到完整菜单项;无 console 警告,静默失败"
  },
  {
    "file": "E:/rhProject/wk-train-center-ui-v3/src/views/admin/dashboard/components/CardNoticeList.vue",
    "line": 78,
    "summary": "props.size 变化触发 `setTimeout(100)` 二次 fetch,没有 loading 锁 / 取消旧请求;先发请求(size=6)可能晚于后发请求(size=4)返回 → 列表显示陈旧 size=6 数据",
    "failure_scenario": "挂载时 onMounted 触发 fetchData(size=6) → 立即 CardQuickOpt emit one 切换 size=4 → 100ms 后第二次 fetchData(size=4) → 网络抖动:第一次 size=6 后返回 → 列表显示 6 条,但当前请求参数是 4"
  },
  {
    "file": "E:/rhProject/wk-train-center-ui-v3/src/stores/modules/user.ts",
    "line": 130,
    "summary": "loginBack() 用 `window.location.href = '/'` 替代 router.push 触发整页刷新,清空所有 Pinia store / keepalive / WebSocket / 心跳,丢失 redirect 参数",
    "failure_scenario": "用户从 /pages/login/login?redirect=/admin/exam/form 登录 → loginBack 全页 reload → userStore.roles 被清空 → 路由守卫重跑 fetchUserInfo + generateRoutes → 用户看到 1-2s 仪表盘闪烁,V2 是 SPA 即时跳转"
  },
  {
    "file": "E:/rhProject/wk-train-center-ui-v3/src/views/admin/dashboard/index.vue",
    "line": 75,
    "summary": "changeNotice() 把 size 改为 small 后没有 onActivated 重置;keep-alive 缓存场景下,从其他页返回 dashboard 时 size 仍是 small,CardNoticeList 仍展示 4 条",
    "failure_scenario": "首次进入 /admin/dashboard → CardQuickOpt 立即 emit one → size='small' 显示 4 条 → 跳 /admin/sys/user 再回 dashboard(走 keep-alive) → onActivated 触发但 size 未重置 → 仍显示 4 条,V2 每次进入回到 6 条"
  }
]
```

---

## 误报清单(REFUTED,避免重复关注)

| # | 文件 | 误报内容 |
|---|---|---|
| R1 | `utils/upload/upload.ts:442-444` | `value.data.sign` 是正确访问(ApiResponse 解包),非"shape 错" |
| R2 | `stores/modules/ai.ts:450` | `fetchSseOrFallback` 实际**使用**了 mode 参数(URL 路由 + 日志),只是 askId 优先级用错 |
| R3 | `views/admin/training-plan/annual/form.vue:124` | git diff 未显示该文件被改,CLAUDE.md 约束未被违反 |
| R4 | `utils/common/useCommon.ts` | `onActivated` 是 Vue 原生 API,不是 useCommon 提供,C13 框架错 |
| R5 | `views/web/course/CourseDetail.vue:154` | V2 的 F12 屏蔽器不在 CourseDetail,而在 exam play 页;CourseDetail 本来就没有 |

---

## 调研方法学

### Phase 1 — 10 个并行 finder 角度

| Angle | 类型 | 输出数 | 重点关注 |
|---|---|---|---|
| A | line-by-line 扫描 | 0(并行启动失败,合并入 C/D/E) | 60+ 修改文件逐行 |
| B | 删除行为审计 | 8 | V2 守门 → V3 是否保留 |
| C | 跨文件追踪 | 8 | API/组件契约变更 |
| D | 语言陷阱 | 8 | Vue 3 + TS + Pinia + Element Plus |
| E | 包装/代理正确性 | 8 | upload/ai/store/request/sse-compat |
| R | 复用机会 | 8 | 重复实现的工具/组件 |
| S | 简化 | 8 | 不必要复杂度 |
| Eff | 效率 | 8 | 启动/渲染热路径 |
| Alt | 高度 | 8 | 通用化 vs bandaid |
| Conv | CLAUDE.md 约定 | 8 | 跨模块硬约束 / V3 迁移工作流 |

### Phase 2 — 1-vote 验证

14 个候选 → 8 CONFIRMED + 2 PLAUSIBLE + 4 REFUTED

### Phase 3 — Gap sweep

8 个新发现(主要在 router/stores/sidebar/dashboard),筛掉与已确认重复的部分,留 4 个新确认。

### 最终排序

按影响 × 可触达性排序,保留 top 12。

---

## 优先级建议

| 优先级 | 数量 | 修复时间 |
|---|---|---|
| 🔴 P0(影响核心业务功能) | 5 | 必修:lecturer ref / kpIds 字段 / notice markTop / exam isDateRange / course fileUrl |
| 🟡 P1(UX / 可发现性) | 4 | 应该修:plan setError / SendMsgDialog 死代码 / role modal / Sidebar popper |
| 🟢 P2(边界 case) | 3 | 可缓修:CardNoticeList race / user.loginBack reload / dashboard size 缓存 |

