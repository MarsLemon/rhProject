# V2 → V3 迁移审查报告(已检查内容存档)

> 存档日期: 2026-07-02
> 范围: `wk-train-center-ui` ↔ `wk-train-center-ui-v3`
> 本文件是历史审查结果归档,新发现的缺陷另起一份 `/security-review` 报告。

---

## 1. 安全类(3 真 + 2 误报)

| # | 严重程度 | 文件 | 问题 | Confidence |
|---|---|---|---|---|
| S1 | HIGH | `mcp.json:35,53` | GitHub PAT(`ghp_...`)+ Firecrawl API Key(`fc-...`)硬编码至 git tracked 文件,需立即轮换 | 9/10 |
| S2 | HIGH | `wk-train-center-ui-v3/src/utils/format/html.ts:53-72` + 8 个 Vue 文件 | `formatRichText` 不净化 HTML,被 `v-html` 直接渲染 → Stored XSS(尤其 `CourseQaDetailDialog.vue` 学生问答数据流) | 8/10 |
| S3 | MEDIUM | `scripts/mysql_mcp_server.py:32-71` | `is_safe_query` 子串匹配 allowlist 可绕过(`INTO OUTFILE`/`DUMPFILE`/`LOAD_FILE`/`HANDLER`),`mysql_describe(table)` 表名未校验 | 8/10 |
| S4 | 误报 | `scripts/v3-migration-watcher.py` | 文件内容仅本地布尔比较,无外泄路径 | 1/10 |
| S5 | 误报 | `.claude/settings.json:29` | `Bash(powershell *)` 是 Claude Code 本地 dev 配置,语义是免确认而非授权 | 1/10 |

### S2 受影响 Vue 文件清单

- `wk-train-center-ui-v3/src/views/web/course/CourseDetail.vue:131`
- `wk-train-center-ui-v3/src/views/web/notice/WebNoticeDetail.vue:10`
- `wk-train-center-ui-v3/src/views/web/exam/WebExamCheck.vue:19`
- `wk-train-center-ui-v3/src/views/web/repo/components/QuItemTrain.vue:7,45,79`
- `wk-train-center-ui-v3/src/views/web/exam/components/QuItemExam.vue:36`
- `wk-train-center-ui-v3/src/views/admin/course/components/Qa/CourseQaDialog.vue:34`
- `wk-train-center-ui-v3/src/views/web/course/components/dialog/CourseQaDetailDialog.vue:18,33`
- `wk-train-center-ui-v3/src/views/admin/dashboard/components/NoticeViewDialog.vue:12`

后端落库点:`wk-train-center-service/yf-modules/yf-module-course/src/main/java/com/yf/course/modules/admin/service/impl/CourseQaServiceImpl.java:51-62`(只过 `SensitiveWordHelper.replace`,不净化 HTML,原文存库)

---

## 2. 迁移完整性类

| # | 类别 | 详情 |
|---|---|---|
| M1 | 框架换版 | V2 (Vue 2.7 + Element-UI 2.x + Vuex 3.x + Vue CLI 4.x) → V3 (Vue 3.5.17 + Element-Plus 2.9 + Pinia 2.3 + Vite 6 + TS 5.7) ✅ |
| M2 | 路由挂载 | V3 admin 59 + student 42 = 101 路由全挂,无 PagePlaceholder(学员端) ✅ |
| M3 | 模块覆盖 | 13/13 admin 子阶段 completed,8/8 web 模块有 V3 版本 ✅ |
| M4 | 未迁文件 | 601 个真正未迁文件,123 个需 diff(vs V2 90 天内改过 710 个) |
| M5 | 优先 diff | `web/exam` 19 + `web/course` 17 + `web/repo` 15 + `ComponentsBase/ComponentsTable` 14 |
| M6 | 已标记砍 | `admin/plan` 15 + `web/plan` 5(用户说不做了) |
| M7 | 缺漏档 | `tmpl` 缺 Join1Form/JoinQuList/JoinRuleList/QuItemShow/DicCatalogTree;`paper/detail` 暂无;`paper exportZip/exportPdf` 未实现;`WebTrainStart` 简化版;`SimpleDeviceTest` 未迁 |
| M8 | composables | 仅 1 个文件(`useTrainSession.ts`),V2 mixin 3 个几乎全未迁 |
| M9 | i18n | 仅 zh-CN 占位,多语言未实质迁移 |
| M10 | V3 纯增量 | `admin/act/`(1 文件)+ Pinia 7 模块 + `bootstrap/`(`app-initializer`/`iframe-communication`/`session-manager`) |

---

## 3. 主仓 13 子阶段完成情况(2026-06-25/26)

```
sys, router, repo, notify, tmpl, paper-signin, dashboard, course, exam, ai, ai-stream, paper-detail-skel  →  13/13 completed
plan  →  pending(CLAUDE.md §7 硬约束: training-plan 废弃不管)
bugsFound: 8
主仓 17 commits + v3 子仓 13 commits
浏览器 12/12 路径验收通过(2026-06-26)
AI 流式响应真实接入(777e133,接 /api/wk/training/role/student/stream)
```

---

## 4. 旧 review 备注

本报告存档于 2026-07-02,后续 `/code-review` 阶段新发现的缺陷另起一份报告。
