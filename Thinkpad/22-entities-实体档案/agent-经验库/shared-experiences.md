# 共享经验池

> **所有 agent 跨栈可复用**的抽象能力教训(适用 = all,或 ≥2 个栈相关)。
> **绝对不写业务细节**——只写"如何让 agent 变强"的通用能力教训。

---

## 📋 经验索引(按能力维度)

| 维度        | 数量 | 简述                                                                         |
| ----------- | ---- | ---------------------------------------------------------------------------- |
| 🔍 资料检索 | 1    | 查 wiki 按改动模块定位                                                       |
| ❓ 反问澄清 | 1    | 反问给具体选项不问开放问题                                                   |
| 🔧 实现     | 9    | 改跨边界契约必双向同步;plugin hook 配置 Win 不信占位符写绝对路径(2026-07-10);antrun 部署钩子参数化 + 默认 skip + 日志带环境名(2026-07-14);mysql MCP safe wrapper 部署 4 步前置验证(2026-07-14);前端 flex 横向溢出滚动三件套 + 状态守卫双保险(2026-09-11);跨服务复用方法警惕循环依赖,优先内联核心逻辑 + 幂等补建用 insert-only 不动旧字段(2026-09-17);Vue 3 ref + v-for 不自动聚合为数组,ref=null 单实例 + onUnmounted 必 cancel debounce(2026-09-17);**考试/表单 loading 重置必须双向放 if 之外 + 公共组件修 vs 调用方修选风险小(2026-09-17)** |
| ✅ 验证     | 3    | typecheck 不通过不算完成;**批量 bug 修前必须逐个验证真实性 + 评估修复复杂度(2026-09-17)**;**lint baseline 必须 git stash 鉴别 pre-existing vs 引入(2026-09-17)** |
| 🤝 协作     | 0    | 待补充                                                                       |
| 🐛 调试     | 6    | 持久化 set/get 必须单向解一层 payload(写时不能再包)(2026-09-11);ng-zorro nz-icon 静态替代方案 emoji / unicode 字符(2026-09-11);MyBatis-Plus BaseMapper 接口 mock 失败 + JDK Proxy + Spy 子类三件套绕坑(2026-09-14);UI 按钮不显示类 bug 必须串三层(后端字段 → 前端 computed → 模板 v-if)才算定位完整(2026-09-17);history.go(-N) 与 router.back() 区别 + 空 catch 是代码异味必须 console.warn 留痕(2026-09-17);**MyBatis-Plus 雪花 ID 配 INT 列必溢出 + 同策略表对比定位漏 BIGINT 的表(2026-09-18)** |
| 🛡 边界     | 4    | 主人已拍板方向不二次劝退;评估先读 README/SCHEMA(+ 3 条均带证据链 2026-07-09);version-registry + DEPRECATED 三件套防 AI 复辟废弃功能(2026-07-14);**前端改公共组件前必须评估调用方数量,跨端一致性问题用真实代码对比而非假设(2026-09-17)** |
| 📝 表达     | 1    | 写中文报告时英文术语头一次出现必加中文别名(2026-07-09)                       |

---

## 💡 经验条目

<!--
新经验模板:
## [YYYY-MM-DD] [能力维度] — [经验标题]

**能力维度**: ...
**触发**: ...
**抽象教训**: ...
**反模式**: ...
**正模式**: ...
**适用**: all
**复用计数**: N(≥3 自动升 🟢)
**状态**: 🟡 待验证 / 🟢 已验证 / 🔴 已废弃
-->

## [2026-07-08] 🛡 边界 — 主人已拍板的方向不二次劝退

**能力维度**: 🛡 边界
**触发**: 主人在评审知识库定位时,第一轮我错误地把"迁到 HermesVault"列为推荐项并据此生成了 SOP+log 文件,被主人 undo 并明确口径"所有内容都以 Thinkpad 为主"
**抽象教训**: 主人一旦对一个方向拍板,后续所有派单 / 报告 / 建议只能在该方向内推进,不得再次评估"要不要换方向",即使新信息出现也只能作为"在该方向内调整"提
**反模式**: 反复在结论中重申"其实可以选 X" / 生成"如果主人改主意"的备选路径 / 拍板后还写"考虑到主人可能..."的退路
**正模式**: 拍板 = 锁死,所有精力投到"怎么把这个方向做对",遇到方向冲突先停下反问"主人确认 X 方向"再继续
**📎 证据链**:

- 主人原话:"不是不是,这个还没开始用,我说单纯只是架构,我该怎么使用起来,这个足以支撑么.之前的选项也是错误的,所有的内容都是以这个文件夹为主" — 明确锁定 Thinkpad 为主,不要再次给出"HermesVault"备选
- 验证方式:本条触发来自首轮评审时小马擅自推荐"迁 HermesVault"被主人 undo,可复现
- 可实现性:`read_file` 列出当前 vault 即可验证主人后续每次拍板都遵守"Thinkpad 为主"原则
  **适用**: all
  **复用计数**: 1
  **状态**: 🟡 待验证

---

## [2026-07-08] ❓ 反问澄清 — 反问必须"先摸现场再弹选项框",不要拍脑袋

**能力维度**: ❓ 反问澄清
**触发**: 评审 vault 架构时,我第一轮直接派单 + 弹选项框"内容去哪儿了",没先 Explore 摸现场文件分布,导致建议方向跑偏(默认假设"已迁走"是错的)
**抽象教训**: 涉及已有资产(目录 / 仓库 / vault / 文档库)的方向性问题,反问之前必先用 Explore subagent 或 grep/ls 摸现场,5 分钟出数据,再据实弹选项;否则选项框只能基于注入的旧记忆瞎猜
**反模式**: 凭注入记忆/上一次会话印象直接出"建议方案" / 派单时不让 subagent 先读现场 / 反问选项是开放问题"你想要什么"
**正模式**: 派 subagent 读现场 → 出"现状数据+差距分析" → 据实弹 2-4 个具体选项(带 recommended:true + ✨ 标记) → 主人单字符拍板
**📎 证据链**:

- 触发可复现:首轮小马凭记忆判定"vault 几乎全空,4 份 \_deprecated 残骸" → 实际 ls 显示 21 份活 .md 完整骨架
- 同模式后续已发生 2 次(知识库评审 + Qoder 介绍后),均先 ls 后弹选项
- 可实现性:`grep "deprecated"` 在 `.github/agents/` + `Thinkpad/` 都跑过,无"凭后缀判废"失误
- 数据源:2026-07-08 首轮评审的反问记录
  **适用**: all
  **复用计数**: 1
  **状态**: 🟡 待验证

---

## [2026-07-08] 🛡 边界 — "目录 / 架构"类评估必须先读 README/SCHEMA,不要凭第一印象评

**能力维度**: 🛡 边界
**触发**: 评审 Thinkpad 时,我第一轮判定"vault 几乎全空、4 份 \_deprecated 残骸",但实际主人刚补回 21 份活 .md 完整骨架,我的判读基于"上次会话印象"而非现场读
**抽象教训**: 评估任何已存在的目录/库/项目,第一步必读其 README/SCHEMA/index 三件套(在主人工作区=在仓库根 + 顶层 4 文件),完全理解主人的规则体系后再评;主人口径里的"残骸/废弃/空壳"必须用 grep/ls 现场验证,不能凭文件后缀名判定
**反模式**: 看一眼目录列表就出结论 / 凭"\_deprecated"后缀判定为废页 / 凭"上次状态"判定本次状态
**正模式**: read_file 三件套 → ls 实际文件 → 数活 .md → 才出"够不够 / 怎么用"结论;遇到主人说"误删补回"或类似修正信号,先重新摸全现场再继续
**📎 证据链**:

- 触发:首轮小马看后缀 `_deprecated` 判 vault 空,实际数到 21 份活 .md
- 验证方式:`grep -l "_deprecated" Thinkpad/22-entities-实体档案/agent-经验库/*.md` 当前应为 0(已修复)
- 当前可用工具集:`read_file` 读 README + SCHEMA + index + `.claude-skills.md`= 顶层 4 文件,本条强制执行
- 可实现性:`file_search "Thinkpad/"` + `ls Thinkpad/` 即可 5 分钟出实际分布,与 SOP §1 盘点表对照
- 同模式已发生多次:2026-07-08 评审(本触发) + 经验库合并 SOP(2026-07-09 workflow-orchestrator 出 SOP 必核实际清单)+ Qoder 介绍后调研
  **适用**: all
  **复用计数**: 1
  **状态**: 🟡 待验证

## [2026-07-09] 📝 表达 — 写中文报告时英文术语头一次出现必加中文别名(caveman 自检)

**能力维度**: 📝 表达
**触发**: 给主人写中文报告(降级演示报告、调研笔记、plan 摘要、subagent 派单指令),整段出现 6+ 个英文术语无中文解释 → 主人截图红框 6 处英文黑词(本触发:`enable skills 链` / `catchup` / `2-Action Rule` / `Stop gate` / `takeaway` / `outage`)
**抽象教训**: 写中文给主人时,英文术语**第一次出现必加中文别名**,后续可简称;**caveman 永久约束的延伸**——主人偏好中文,英文术语得让主人能扫读,不能堆黑话
**反模式**: (1) 直接堆英文术语(像英文 README 翻一遍);(2) 缩写词没全名(给主人猜 PWF / K8s 之类);(3) 表格 / 列表里塞一长串英文黑词
**正模式**: (1) 头一次出现:「catchup(上下文恢复)」「2-Action Rule(两步操作规则)」「Stop gate / completion gate(完工门禁)」「5-Question Reboot(五问自检)」「3-strike protocol(三振出局)」「outage(服务中断)」「 akeaway(收获)」;(2) 术语表速查自维护,跨对话缓存到本条;(3) 主人专属术语表(主路径 / vault 路径 / agent 名称)必留,新进 1 个术语补 1 个
**适用**: all(所有给主人产中文输出的场景,包括但不限于 subagent 报告 / wiki 笔记 / 派单 prompt / 任务摘要)
**复用计数**: 1
**状态**: 🟡 待验证(等主人下次复现一次"术语堆叠"事故后升 🟢)

- 实施检查清单:写完中文报告 → 自检 grep 一下英文术语密度 → 超过 5 个 / 段必补中文别名 → 表格列名 / bullet 标题 / 状态描述 三处重点扫
- 工具化:可在 coordination-contract-owner.md §8 必装技能后追加「术语表速查」段,引用本条
- 关联:caveman 永久约束(CLAUDE.md 顶) / using-superpowers 启动自检 / 主人 Hermes × Obsidian × Claude Code 三件套迭代主线

## [2026-07-10] 🔧 实现 — plugin hook 配置不要信占位符,Win 上 Claude Code 不注入 `${CLAUDE_PLUGIN_ROOT}`,写死绝对路径

**能力维度**: 🔧 实现 / 🛡 边界
**触发**: 主人 2026-07-10 装 pm-skills-arsenal v2.1.0,每次调 Skill 工具后 VS Code 弹警告面板:1️⃣ `-File 参数后面缺少参数`(powershell 行);2️⃣ `/bin/bash: /hooks/scripts/track-telemetry.sh: No such file or directory`(bash 行)。原 plugin hooks.json 用 `${CLAUDE_PLUGIN_ROOT}/hooks/scripts/track-telemetry.{ps1,sh}`,Claude Code Win 上没注入这个 var → 命令被拼成 `powershell -File "/hooks/scripts/..."`(空根路径)
**抽象教训**: **plugin hook schema 的 `${VAR}` 占位符,Win + Claude Code 不一定注入**;**宁可写绝对路径也不要赌变量**。三层判断:

1. 先看 plugin 自带 hook 脚本本身对不对(`-Test`/`--test` self-test 必须 PASS) — 本次 .ps1 PASS / .sh PASS,**脚本 100% 无锅**
2. 再看 hook 调用方给的变量是否被注入(用 `$env:VAR` 在 hook 脚本里 echo 看空不空)— 本次 `${CLAUDE_PLUGIN_ROOT}` 空,确认是变量没传
3. 最后选方案:绝对路径写死(主人拍板)/ wrapper 用 `$PSScriptRoot` 自定位 / fork plugin 改 schema 兼容多端 — 选代价最小、迁移时主人能手动改的

**反模式**:

- ❌ 看到 hook 报错就改 plugin 自带脚本(脚本 self-test 是 PASS 的,改它没意义)
- ❌ `replace_string_in_file` 失败不查 raw content,信工具返回 "success"(我之前踩过:`replace` 报成功但实际没改动,因 `newString` 多吃字符)
- ❌ pwsh here-string `@"..."@` 里写 `${...}`,变量被吃 → 改用单引 `@'...'@`
- ❌ 用 `${CLAUDE_PLUGIN_ROOT}` 当默认占位符却不验证 Win 注入(只 Copilot 的 `${PLUGIN_ROOT}` 是跨平台稳定;`${CLAUDE_PLUGIN_ROOT}` 仅 Claude Code + 上下文内)
- ❌ Win shell adapter:`$env:WINDIR\system32\bash.exe`(WSL launcher)调 .sh 时把 `C:\Users\...` 反斜杠吞成 `C:UsersRUHAI...` → exit 127

**正模式(三步法)**:

1. **先 self-test 验脚本**:`powershell -File xxx.ps1 -Test` / `bash xxx.sh --test`,exit 0 才算脚本 OK
2. **再验变量注入**:在 hook 脚本头部 echo `$env:VAR`(ps1) / `echo "${VAR:-empty}"`(sh),Claude Code 调一次看 var 空不空
3. **变量空就改绝对路径**:hooks.json 里直接写 `C:\Users\<real-path>\track-telemetry.{ps1,sh}`,plugin 升级时主人手动同步路径(版本号变了才需改)
4. **双 hook 兜底**:commands 数组里 powershell + bash 两行都写,跨 Win/Mac/Linux 任意平台至少有一个能跑

**📎 证据链**:

- 主人 2026-07-10 截图:VS Code "工具使用后挂钩的警告"面板 2 条 — `-File 参数后面缺少参数` + `/bin/bash: /hooks/scripts/track-telemetry.sh: No such file or directory`
- self-test 实跑:`track-telemetry.ps1 -Test` → `PASS` / exit 0
- 变量验证:`$env:CLAUDE_PLUGIN_ROOT` 在主人 Win shell 为空(grep_search + Get-ChildItem 都没匹配的 Claude 设置注入点)
- 端到端:echo payload → `powershell -NoProfile -ExecutionPolicy Bypass -File <绝对路径>` → exit 0 + telemetry log 写出 `{"host":"claude-code","skill":"competitive-market-analysis","plugin":"pm-skills","plugin_version":"2.1.0"}`
- Win shell adapter 坑:`bash "C:\Users\..."` 经 `C:\Windows\System32\bash.exe`(WSL launcher)路径被吞成 `C:Users...`,exit 127 — 不影响 powershell 行,但说明 .sh 行 Win 上仍可能偶发
- 落地文件:`C:\Users\RUHAI\.vscode\agent-plugins\github.com\Avyayalaya\pm-skills-arsenal\ref_v2.1.0\hooks\hooks.json` 写死绝对路径,commands 含 powershell + bash 双 hook

**适用**: all(所有调 plugin / extension / MCP hook 配置的场景,跨 Vue/Java/MCP)
**复用计数**: 1(本次首次)
**状态**: 🟡 待验证(下次主人升级 plugin v2.2 触发路径失效时复现验证)

---

- 实施检查清单:改 plugin hook 前 → 1️⃣ self-test 脚本(必须 PASS) → 2️⃣ echo env var 看注入 → 3️⃣ 写绝对路径 + 双 hook 兜底 → 4️⃣ 端到端 echo payload → log 写出
- 工具化:本条可写进 `coordination-contract-owner.md` §6 派单规则包附件 — `runSubagent` 调 plugin 类任务时,subagent 必先跑 self-test
- 关联:`track-telemetry.{ps1,sh}` 是 vendor 自带 hook,主人升级 plugin 会被覆盖 → 长期方案 fork + 本地装(plugin 仓库主人的,不在 rhProject 工作区,无法本地 audit)

---

## [2026-07-14] 🔧 实现 — maven-antrun-plugin 部署钩子必须参数化 + 默认 skip,日志带环境名

**能力维度**: 🔧 实现
**触发**: 主人 2026-07-14 反馈 `mvn package` 日志无环境标识,实际 `yf-web/pom.xml` `maven-antrun-plugin` 在 `package` 阶段硬编码 `scp` + `ssh` 推到 `root@47.104.4.152:/opt/wk-train-center/test/` —— 本地 `mvn package` 静默误推测试环境,主人看到的报错日志跟自己预期环境对不上无法根因
**抽象教训**: **maven-antrun-plugin 的部署钩子(任何 scp/ssh/exec 推送代码)** 满足下面三个条件才合格,缺一不可:

1. **用 POM `<properties>` 占位符**(`<deploy.env>`/`<deploy.host>`/`<deploy.user>`/`<skipDeploy>`),不直接在 antrun `<arg>` 里写死环境名 —— `-D` 命令行参数通过 properties 块才能被 antrun `${}` 读到
2. **默认 `<skip>${skipDeploy}</skip>` = true** + `<skipDeploy>true</skipDeploy>` —— 本地开发/IDE 触发 `mvn package` 时永远不推送,需要主动 `-DskipDeploy=false` 才生效,防误推测试/pre/prod 任何环境
3. **antrun `<target>` 顶部必须 echo 横幅** + `DONE env=xxx` 收尾日志,日志里必须有 `[deploy] env=...` 字样让主人一眼看出推到了哪里

**反模式**:

- ❌ antrun `<exec>` 里硬编码 `root@x.x.x.x:/path/test/` 三个字段(主机/路径/环境)—— 主人不知道当前推到哪
- ❌ 主人本地 `mvn clean package` 必跑 → antrun 必触发推送 → 静默改测试环境代码,主人与 root cause 隔离
- ❌ 想用 `properties-maven-plugin` 把 `-D` 属性暴露给 antrun —— 多此一举,POM `<properties>` 块默认值 + `-D` override 就能把命令行参数透给 `${}`
- ❌ antrun 默认 skip 走 `<target if="...">` 条件分支 —— 不直观,后期维护 `<skip>` 顶层属性更显式
- ❌ 把"推送环境"藏到服务器端脚本里(服务端 `run.sh` 写死)—— 反向不可见,主人日志里看不到

**正模式(三条 golden rule)**:

1. **POM 占位 + 默认值**:`<properties>` 块加 `<skipDeploy>true</skipDeploy>` + `<deploy.env>UNSET</deploy.env>` + `<deploy.host>x.x.x.x</deploy.host>` + `<deploy.user>root</deploy.user>`
2. **antrun 顶层 skip + 三段 echo**:`<skip>${skipDeploy}</skip>` 兜底跳过,`<target>` 第一行 `<echo message="[deploy] env=${deploy.env}...">` 横幅提示,中间 `scp` 用 `${deploy.user}@${deploy.host}:/opt/${deploy.env}/` 拼路径,收尾 `<echo message="[deploy] DONE env=${deploy.env}"/>`
3. **使用方式**:
   - 本地/CI dev:`mvn package`(默认推不上去,日志干净)
   - 推测试:`mvn package -DskipDeploy=false -Ddeploy.env=test`
   - 推预发/生产:`mvn package -DskipDeploy=false -Ddeploy.env=pre|prod`,**主人必须显式拍板才推 prod**

**📎 证据链**:

- 主人 2026-07-14 原话:"后端在打包后会自动推送,能在日志中加一下推送的是哪个环境么" → 暴露出主人不知道推送是哪个环境
- 现场 `yf-web/pom.xml:264-286` 原 antrun 段:硬编码 `root@47.104.4.152:/opt/wk-train-center/test/` + `bash /opt/wk-train-center/test/run.sh restart`,日志零提示
- 反模式复现:本地直接 `mvn -DskipTests -pl yf-web -am package` → antrun 自动触发 scp → 测试环境 jar 被静默覆盖,主人无法察觉
- 验证命令 1:`mvn -DskipTests -pl yf-web -am package -Ddeploy.env=test -DskipDeploy=false` → 实测日志出现 `[deploy] env=test  user=root@47.104.4.152` + `[deploy] target=/opt/wk-train-center/test/` + `[deploy] DONE env=test` + 真实 scp/ssh 调用(终端看到 openssh 服务器升级提示),`BUILD SUCCESS`
- 验证命令 2:`mvn -DskipTests -pl yf-web -am package`(不传 `-Ddeploy.env`)→ 日志完全干净,无 `[deploy]` 字样,无 scp/ssh 调用,`BUILD SUCCESS`,**本地开发零打扰**
- 落地文件:`E:\rhProject\wk-train-center-service\yf-web\pom.xml:16-21`(properties 块默认值)+ `:270-307`(antrun 段重写,top-level `<skip>` + 三段 echo)

**适用**: all(任何用 Maven + antrun 做 CI/CD 推送的项目,Vue 后端/Java/Kotlin/Scala 通用)

**复用计数**: 1(本次首次)
**状态**: 🟢 已验证(两条验证路径都跑过,e2e OK)

---

- 实施检查清单:改任何 antrun 部署钩子前 → 1️⃣ `<properties>` 必有 `<skipDeploy>true</skipDeploy>` 默认值 → 2️⃣ `<skip>${skipDeploy}</skip>` 必置顶层 → 3️⃣ `<target>` 顶部/中间/收尾 echo 三段环境名 → 4️⃣ 跑两条验证命令(传 env / 不传 env)→ 5️⃣ 默认路径不传任何 `-D` 必须零推送
- 工具化:可写进 `3-backend.md` §Maven 部署钩子子节,作为 checklist 模板;跨项目复用到 `yf-ability`/`yf-job` 等其它有 antrun 推送配置的模块
- 关联:`shared-experiences.md` 2026-07-10 [plugin hook 绝对路径] 同源问题(Win 平台变量不注入,Maven 同理 —— 跨平台 ${} 变量都不能完全信任,POM properties + 命令行 -D 是稳态)

---

## [2026-07-14] 🛡 边界 — 「现在在哪个版本 + 哪些功能已废弃」必须先读 version-registry + DEPRECATED-FEATURES,不要凭 PRD 印象

**能力维度**: 🛡 边界 / 🔍 资料检索
**触发**: 主人 2026-07-14 拍板清理 `Thinkpad/22-entities-实体档案/2026-07/` 4 个离线快照文件,核心痛点:**AI agent 经常回头找已废弃功能复活**。原 versions.json 写的是 v1.x 时代的多分支(local/1.3/dev/master/develop),但 git 现状只有 main,Phase D 之后 PRD 走 semver,两套版本机制并存导致 agent 错乱。
**抽象教训**: **版本号 + 废弃功能 = 两份不可缺的登记表,Agent 启动任务第一步必读**。这是为防 AI 凭"上次会话印象"或 PRD 段落描述,翻老代码复辟已废弃功能。三件套:

1. **`.products/projects/{项目}/docs/version-registry.json`** — 当前版本号 + 规划版本 + 历史表 + git 分支命名规范。回答"现在在哪个版本 / 下一个版本是什么 / 历史怎么走"
2. **`.products/projects/{项目}/docs/DEPRECATED-FEATURES.md`** — 废弃功能登记表(功能名/废弃版本/替代方案/关联代码/关联 wiki)。回答"哪些功能不能用 / 用了要反问"
3. **使用协议**:Agent 接需求第一步 → 读 version-registry → 拿 current.version → grep 任务关键词到 DEPRECATED-FEATURES → 命中必反问主人"此功能已废弃,确认仍要继续吗?"

**反模式**:

- ❌ 凭 git tag 判断版本号(本项目 8 个 git tag 全是 PRD-{项目}-v{ver} 快照,不是代码版本)
- ❌ 凭 PRD.md 一段文字判断废弃功能(产品层 PRD 不会全量列出所有废弃点)
- ❌ 看到「local/X.X/dev」分支名就以为是当前分支(本项目 git 现实只有 main,local/X.X/dev 是规划中状态,见 version-registry.json `_spec.currentVersionSource`)
- ❌ 用单一文件同时承担"版本号" + "废弃功能" 两个职责(变更频率不同,合一会互相污染)
- ❌ 让 agent 自己维护 DEPRECATED-FEATURES(应强制 Wiki 维护 agent 同步,产品层 PRD 标记废弃 → DEPRECATED 立即追加)

**正模式(三件套 + 启动协议)**:

1. **version-registry.json 结构**:
   ```json
   {
     "current": { "version": "1.x-inflight", "branch": "main", "nextPlanned": "1.4.0" },
     "history": [{ "version": "1.0.0", "status": "已发布", "deprecatedFeatures": [] }],
     "versionNaming": { "pattern": "^local/(\\d+\\.\\d+)/dev$", "currentState": "尚未创建任何 local/X.X/dev 分支" }
   }
   ```
2. **DEPRECATED-FEATURES.md 结构**:表格列(功能名/废弃版本/替代方案/废弃原因/关联代码/关联 wiki)+ Agent 使用协议段
3. **Agent 启动硬步骤**:
   - backend-expert 接任务 → `read version-registry.json` → 拿 current.version → grep DEPRECATED-FEATURES.md
   - 命中 → 响应里显式引用 `🔍 DEPRECATED 命中:[DEPRECATED-FEATURES.md §X]` → grill-me 主人确认
   - 不命中 → 按需求执行,完工后如发现新废弃点,回写 DEPRECATED-FEATURES.md
4. **更新时机**:版本号 bump / 新功能废弃 → 两个文件必须同步改,不允许单边更新

**📎 证据链**:

- 触发:主人 2026-07-14 拍板 4 文件处置,核心诉求"我如果废弃 versions.json,AI 后期如何能知道我在哪个版本,之前经常遇到我已经在很后面的版本了,前面有些废弃的功能他还是会去找"
- 现状盘点:`git tag -l` → 8 个 tag 全是 `PRD-{项目}-v{ver}` 快照,无代码版本 tag;`git branch -a` → 只有 main,无 local/X.X/dev/master/develop
- 老机制失败:原 versions.json 写的 `local/1.3/dev` 在 git 里不存在,但被 repowiki 30+ 处 `[file://documents/versions.json]` 引用,成为死链陷阱
- 落地文件:
  - `.products/projects/wk-train-center-service/docs/version-registry.json`(新建,2026-07-14)
  - `.products/projects/wk-train-center-service/docs/DEPRECATED-FEATURES.md`(新建,2026-07-14)
  - `Thinkpad/_archive/2026-07-documents-snapshot/README.md`(新建,标注老 documents/ 快照废弃)
  - `Thinkpad/22-entities-实体档案/2026-07/` 4 文件 → 3 移到 _archive + 1 删除
- 同模式已发生多次:2026-07-08 vault 评审时老 HermesVault 残留 → 2026-07-09 经验库合并 SOP 残留 → 2026-07-14 本次 versions.json 残留,均先读现场再清理

**适用**: all(任何有版本号演进 + 功能废弃历史的项目,跨 Java/Vue/Angular/H5/PPT)

**复用计数**: 1(本次首次)

**状态**: 🟡 待验证(等首个废弃功能被 DEPRECATED-FEATURES 命中时升 🟢)

---

- 实施检查清单:Agent 接任务第一步 → 1️⃣ 读 version-registry.json → 2️⃣ grep DEPRECATED-FEATURES.md 任务关键词 → 3️⃣ 命中显式引用 + grill-me → 4️⃣ 不命中执行 + 完工回写新废弃点
- 工具化:可写进 `coordination-contract-owner.md` §6 派单规则包,作为 Agent 启动 checklist 必跑项
- 关联:本条是 2026-07-08 [主人拍板方向不二次劝退] 的延伸 — 拍板方向 = version-registry 锁的"当前版本" + DEPRECATED-FEATURES 锁的"已废弃功能",两者都是「锁死边界」类机制
- 跨栈复用:已落地 4 仓(wk-train-center-service + wk-train-center-ui + wk-train-center-ui-v3 + wk-PPTist-ui),wk-mhc-ui / wk-mhc-mobile 暂不建(主人口径 2026-07-14);其余仓随时可参照 `.products/projects/wk-train-center-service/docs/version-registry.json` 模板复制
- **rhProject 是 monorepo,根仓 git 不代表子仓**:`git -C rhProject branch -a` 只显示根仓分支(main)。6 个子仓(wk-train-center-service / wk-train-center-ui / wk-train-center-ui-v3 / wk-mhc-ui / wk-mhc-mobile / wk-PPTist-ui)各自有独立 origin,真实版本号藏在**子仓的 `git branch --show-current`**。读 version-registry.json 时必须配套 `cd {子仓} && git branch --show-current`,不要凭根仓 git 输出推断版本号(2026-07-14 主人截图纠错)
- **registry 第一稿不可信,必跟 git 实测对账**:写 version-registry.json `current` 段时,凭 PRD frontmatter 或印象拍版本号**必然错**。正确流程:`cd {子仓} && git branch --show-current` → `git log --oneline -1` → 才写 current.version。registry 是 git 的**镜像**,不是 git 的源头。主人 2026-07-14 两次纠错(v0.1.0 误判 → 真实 mobile-v1.1)后确立此条
- **主人 2026-07-22 立 4 类落点铁律(覆盖文档/经验/调研/原话)**:
  - 跟项目有关的文档(计划/设计/验证/问答/SPEC) → **`.products/specs/`** 或各项目子目录
  - 经验(踩坑/教训/方法论) → **`Thinkpad/22-entities-实体档案/agent-经验库/`**(shared-experiences / 1-6-master)
  - 调研(articles) → **`Thinkpad/20-concepts-已消化笔记/调研/`**
  - 主人原话记录 → **`Thinkpad/99-log/`**
  - ❌ **不要**落 `E:\rhProject\docs/`(.gitignore L29-30 隐藏,等于"丢")
  - 触发判断:动手前 30 秒问自己"这属于哪一类",不确定就 grill-me 主人
  - 反模式:文档写成 `docs/superpowers/specs/...` 主人 git status 看不到 → 挪到 `.products/specs/` 才 git 跟踪
  - 已被本任务验证:本次 7-22 落 SPEC 时撞 .gitignore 隐藏问题,主人 14:32 反手发现 → 立刻挪 + 立铁律

---

## [2026-07-22] [落库铁律] — 4 类产物(文档/经验/调研/原话)落点分离,产物零丢失

**能力维度**: 🛡 边界 / 📁 落库

**触发**: 任何 AI 产出物(设计稿/调研报告/经验教训/主人原话)的归档位置

**抽象教训**:

1. **AI 产出物天然 4 类,每类落点不同**:
   - **项目相关文档**(计划/设计/验证/问答/SPEC):服务于项目迭代,要 git 跟踪、git status 能看 → `.products/specs/` 或各项目子目录
   - **经验教训**(踩坑/方法论/能力教训):跨栈复用,主人 + 各 agent 共享 → `Thinkpad/22-entities-实体档案/agent-经验库/`
   - **调研文章**:对外参考材料,主人定期复盘 → `Thinkpad/20-concepts-已消化笔记/调研/`
   - **主人原话记录**:决策历史,跨会话接续用 → `Thinkpad/99-log/`

2. **落 `E:\rhProject\docs/` 是死亡地带**:
   - 主人 2026-07-07 立铁律:superpowers skill 产物迁入 HermesVault,`/docs/` 整个被 .gitignore L29-30 隐藏
   - 后果:任何落 `docs/` 的文件** git status 看不到、git diff 看不到、主人 commit 时不发现** = 永久失踪
   - 触发场景:superpowers skill 默认落 `docs/superpowers/specs/`,Claude Code 跟着走就翻车

3. **判定铁律**(给 Agent 反问自己用):
   - 这份产物是给项目用还是给经验库用?
   - git 跟踪 + git status 能看 → `.products/specs/` 系
   - 跨会话跨 agent 复用 + 主人定期 review → `Thinkpad/` 系
   - 不确定就 grill-me 主人,不擅自决定

4. **反模式**:
   - ❌ "我以为落哪里都行" → 落 docs/ 后主人发现不了
   - ❌ "superpowers skill 默认路径就听它的" → 主人工作区 docs/ 被 .gitignore,跟 skill 默认路径冲突
   - ✅ 落之前必查 .gitignore(主人 2026-07-22 拍板时立的口径)

**适用**: all(任何 AI agent 落地文档/经验/调研/原话 4 类产物)

**复用计数**: 1(本次首次,2026-07-22 主人口径确立)

**状态**: 🟡 待验证(等下次 AI 误落 docs/ 时主人可反查)

---

## [2026-07-22] [版本归集] — 产品层 docs/ 按 mobile1.x/ 子目录归集,3 种历史命名统一为无连字符

**能力维度**: 🛡 边界 / 📁 落库

**触发**: 项目级文档管理(产品层 docs/ + 设计/任务/评审/迭代)

**抽象教训**:

1. **3 种历史 mobile 命名必统一**(2026-07-22 主人口径):
   - ❌ `mobile-1.x/`(db/ 老命名,有连字符)
   - ❌ `mobile-v1.x/`(只用于 Git 分支描述)
   - ❌ `v1.x/`(VERSION_GUIDE 老规范,已废)
   - ✅ `mobile1.x/`(无连字符,跟现状 tasks/mobile1.1/ 习惯一致)

2. **长期 vs 短期产物判定铁律**:
   - 跨版本仍有效 → 留根(PRD / changelog / architecture / decisions / user-stories)
   - 只服务某一版本 → 入版本子目录(设计稿 / 评审 / 任务 / 迭代)

3. **归集判定原则**(给 review 写):
   - 同一时间窗口 → 一个版本
   - 主体归属 = 子仓 `git branch --show-current` 在该窗口的实际值
   - 例:7-15 ~ 7-17 wk-train-center-service 是 `local/mobile-v1.1/dev` → 归 `mobile1.1/`

4. **version-registry 单点真相**:
   - 4 仓都有 `docs/version-registry.json`,`current` 字段 = 子仓 git 现状(2026-07-22 修过 2 仓过期)
   - 命名规范写进主目录 `.products/README.md`,硬约束
   - 跨仓评审:任何 AI 接任务第一步 = 读 version-registry.json

5. **重命名 + 引用更新的协同**:
   - 重命名目录(`mobile-1.1/` → `mobile1.1/`)时必同步:README / GOVERNANCE / lint-report 4 份规范文档
   - 脚本生成的 README 标"下次 build 自动同步",主人后续跑 build-index.py
   - 旧命名残留(2026-07-22 落库时 SPEC 自己的引用)保留为历史记录,不改

6. **wk-train-center-ui version-registry 数据损坏教训**:
   - L82-L113 明显是两个 JSON 拼合(老 registry 重写时只覆盖了前面,后面残留)
   - 触发:主人用 `Write` 完整重写一个文件,前置是必须 Read 看到完整结构
   - 反模式:在 `Edit` 修改一半就停,残留旧字段
   - ✅ 正确:整文件 `Write` 覆盖,或用工具读完整内容再改

**适用**: all(任何多版本演进的产品层 + 技术层文档管理)

**复用计数**: 1(本次首次落地 4 仓)

**状态**: 🟡 待验证(等下次 4 仓新版本发布时,看命名规范是否被遵守)

---

## [2026-09-08] 🔧 实现 — Vue3 mount 入口必收敛,顶层 + bootstrap 双 mount 触发 insertBefore(parent=null) 运行时错

**能力维度**: 🔧 实现 / 🐛 调试

**触发**: wk-train-center-ui-v3 独立访问模式下,控制台报 `[Vue warn] App has already been mounted` + `TypeError: Cannot read properties of null (reading 'insertBefore')`(error-log.ts:42 是打印位置,不是出错位置 — 这是默认陷阱,error-log 的 console.error 让 source map 把堆栈顶定位到了错误处理函数)

**抽象教训**:

1. **Vue3 mount 入口必须收敛到唯一一处** — 不能"顶层 + bootstrap 流程"双 mount。
   - 反模式:`main.ts` 顶层同步 `app.mount('#app')` + `bootstrap()` 异步 IIFE 调 `renderApp` → `vueApp.mount('#app')` → Vue 第二次 mount 时先 unmount 旧的,patch 流程中旧 DOM 父节点断开 → `insertBefore(parent=null, ...)` 抛错
   - 正模式:删掉顶层 `app.mount('#app')`,所有 mount 走单一入口(如 `renderApp`)。iframe 模式等异步 INIT_PARAMS、独立模式走 `handleStandaloneAccess`,超时/失败走降级 UI(不 mount,显示错误页)。

2. **error-log.ts 的 console.error 行号不可** — 调试时看到 `[Error] TypeError` + `error-log.ts:42` 的 line 一定是 console.error 调用位置,不是 error 真正发生位置。真正的源头在 `info` 字段(如 "component update")或浏览器的"忽略列表"链接(展开看完整堆栈)。

3. **Vue 内部 _container 标志可作防御** — `if ((app as any)._container) return` 在 renderApp 内做兜底,即使将来有人绕过 init 路径再 mount 也不会爆,但**这只是兜底,治本仍是删重复 mount**。

5. **async IIFE 跟同步 mount 的时序陷阱** — `app.mount('#app')` 是同步,但紧随其后的 `;(async function bootstrap() { ... })()` 内的 `await` 让 IIFE 变成 microtask,等当前同步代码执行完 + 浏览器 paint 一次后才跑 → 此时 app 已被挂载,bootstrap 再 mount 就 double。

**📎 证据链**:

- Vue 官方警告:`App has already been mounted.` 是直接证据
- 调试三步:(1) `grep "mount(" src/` 看有几处 mount → 找到 2 处(main.ts:178 + app-initializer.ts:136);(2) 看 `app-initializer.ts:renderApp` 有 `if (appInitialized) return` 但只防自己;(3) 删 main.ts:178 + 加 `_container` 防御

**适用**: all(Vue3 / Nuxt3 / Vite 模板的任何 SPA 项目)

**复用计数**: 1

**状态**: 🟡 待验证(主人刷新页面看是否还报 `App has already been mounted` + insertBefore)

---

## [2026-09-11] 🔧 实现 — 前端 flex 横向溢出滚动三件套 + 状态守卫双保险(预览/只读态必备)

**能力维度**: 🔧 实现 / 🎨 前端布局

**触发**: canvas-editor POC(Angular 18 + Nx)底部 `.footer` 在窄屏下内容超出 `.canvas-panel` 边界,延伸到右侧 `.placeholder-panel` 上方(主人图2);预览历史快照时模式下拉可点击但实际无效,易误编辑(主人图1)

**抽象教训**:

1. **flex 容器横向溢出滚动三件套**(内容 > 容器宽度时,内容在容器内独立滚动,不溢出到隔壁):
   - **容器本身** = `overflow-x: auto` + `width: 100%` + `box-sizing: border-box` + `scrollbar-width: thin`(细滚动条视觉更轻)
   - **子分组** = `flex-shrink: 0`(分组不缩,超出整体滚动而非组内压缩变形)
   - **父容器** = `overflow-x: clip`(裁剪子容器溢出部分,阻止内容溢出到隔壁 panel)
   - ⚠️ 不要用 `min-width: max-content` —— 那会让容器被内容撑大,直接溢出父容器

2. **状态守卫双保险**(只读态 / 预览态 / 加载态 / 禁用态 都要做的三件套):
   - **视觉**:`[disabled]="状态条件"` 让按钮变灰(用户看不到可点)
   - **操作**:handler 函数开头 `if (条件) { this.message.warning(...); return; }`(键盘 / 程序调用绕过 disabled 也拦住)
   - **提示**:`[nz-tooltip]="提示文字"` 加到 **wrapper 元素**而不是 button(disabled button 不响应 hover,tooltip 不显示)

3. **flex 容器布局微调**(溢出场景):
   - `justify-content: flex-start` + `gap: 12px` 优于 `space-between` —— 窄屏 space-between 会把中间组挤瘪
   - `overflow-y: hidden` 跟 `overflow-x: auto` 必同时设,否则垂直滚动条会跟横向滚动条打架

**反模式**:

- ❌ 用 `min-width: max-content` 让 footer 自适应内容(容器撑大溢出父级)
- ❌ 用 `flex-wrap: wrap` 处理溢出(fixed-height 工具栏换行会破坏布局)
- ❌ 把 `nz-tooltip` 加到 `[disabled]` 的 button 上(disabled 不响应 mouseenter,tooltip 不显示)
- ❌ 只在 UI 层 `[disabled]`,handler 不加守卫(键盘 enter / 程序调用仍可触发)
- ❌ 父容器不加 `overflow-x: clip`(子元素溢出后视觉压到隔壁 panel,主人口径"溢出请横向滚动"的反面)
- ❌ `overflow-x: auto` 但不设 `width: 100%`(容器会被父 flex 自动伸缩,溢出检测失效)

**正模式(三件套)**:

```less
/* 1. 父容器:裁剪,不让子元素溢出到隔壁 */
.canvas-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow-x: clip;  /* 关键:不滚动,只裁剪 */
}

/* 2. 子容器:固定 100% 宽 + 内部横向滚动 */
.footer {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
}

/* 3. 分组:不被压缩,超出整体滚动 */
.footer-group {
  display: inline-flex;
  gap: 4px;
  flex-shrink: 0;
}
```

```html
<!-- 状态守卫三件套:tooltip 在 wrapper + disabled 在 button -->
<div class="footer-group" [nz-tooltip]="isPreview ? '预览态不可切换' : ''">
  <button nz-button [disabled]="isPreview" nz-dropdown [nzDropdownMenu]="menu">{{ label }} ▾</button>
  <nz-dropdown-menu #menu>
    <ul nz-menu>
      @for (opt of options; track opt.value) {
        <li nz-menu-item [nzDisabled]="isPreview" (click)="setMode(opt.value)">
          {{ opt.label }}
        </li>
      }
    </ul>
  </nz-dropdown-menu>
</div>
```

```ts
setMode(mode: EditorMode): void {
  // 程序/键盘绕过 disabled 也拦住(双保险第 2 条)
  if (this.previewSnapshotId) {
    this.message.warning('预览状态下不能切换模式,请先点击「退出预览」');
    return;
  }
  this.mode = mode;
  this.editor?.command.executeMode(mode);
  this.scheduleAutosave();
}
```

**📎 证据链**:

- 触发场景:canvas-editor POC `apps/template-editor-demo`,900px 视窗下 footer 内容(551px) > canvas-panel 宽度(347px)
- 修复前:footer 内容溢出 panel,视觉压到右侧 placeholder-panel 上方(主人图2 红框)
- 修复后验证:
  - `evaluate_script`:`footer.clientWidth=347, scrollWidth=551, scrollLeft 可推到 204`(内部滚动条出现)
  - `evaluate_script`:`footerRight=566 === panelRight=566 === placeholderLeft=566`(footer 严格不超 panel)
- 状态守卫验证:
  - 预览快照时 `evaluate_script`:`mode button disabled=true` + `wrapper ng-reflect-directive-title=预览状态下模式不可切换`
  - `take_snapshot` a11y:`button "编辑模式 ▾" disableable disabled`(屏幕阅读器也能识别)
- nx build ✅ + nx test ✅(4/4)+ 浏览器自验 ✅
- 主人拍板:选项1"修溢出 + 修预览模式" + 选项2"横向滚动" + 选项3"保持只读不可切"

**适用**: all(任何 flex 容器溢出 + 任何只读/预览/禁用态场景,跨 Vue/Angular/React/H5)

**复用计数**: 1

**状态**: 🟢 已验证(canvas-editor POC build+test+浏览器三验通过)

---

## [2026-09-11] 🐛 调试 — 持久化服务 set/get 必须单向解一层 payload,写时不能再包一层

**能力维度**: 🐛 调试 / 🔧 实现

**触发**: canvas-editor POC 修复预览切换 bug 时,追到根因: `appendSnapshot` 写的快照存到 localStorage 是 `{version, savedAt, payload: {version, savedAt, payload: {canvas, lightState}}}` —— **双层 payload 嵌套**, `getSnapshotPayload` 解一层后 `wrapped.canvas = undefined` → `executeSetValue(undefined)` 抛 `Cannot destructure property 'header' as undefined` → 预览不切换 + restore 走 fallback 把所有快照当丢失处理.

**抽象教训**: **持久化服务「包一层 / 解一层」必须是单向的**.

1. **写方向**:`service.set(key, payload)` → 服务内部自动包 `StoredData<T> = {version, savedAt, payload}` → 存.
2. **读方向**:`service.get<T>(key)` → 自动解一层,返回 `T`(原始 payload).
3. **调用方写 set 时不要再包一层** —— 这是嵌套 bug 的常见来源(看似"我包一层是为了加 version/savedAt",其实服务做过了).

**反模式**:

- ❌ 在 set() 里又自己包一层 `{version, savedAt, payload: {...}}`(set 已经包过了)
- ❌ 在 get() 后又自己解一层 `result.payload`(get 已经解过了)
- ❌ 跨服务传递时用"已经包过的 StoredData"再 set 一次(嵌套深度无限增加)
- ❌ 写一个 "wrapper service" 包别人,内部又调底层 service 的 set(底层又包一层)

**正模式**:

```ts
// 写:只传业务数据
await storageService.set('snapshots:payload:xxx', {
  canvas: canvas,
  lightState: lightState,
});

// 读:直接得到业务数据
const got = await storageService.get<{canvas: unknown, lightState: unknown}>('snapshots:payload:xxx');
// got.canvas 直接可用,不要再 .payload

// 兼容旧数据(历史 bug 修复时)
if (got.canvas === undefined && got.payload?.canvas !== undefined) {
  // 老格式:{payload:{payload:{canvas,...}}} —— 自动重写
  const migrated = { canvas: got.payload.canvas, lightState: got.payload.lightState };
  void storageService.set(key, migrated);
  return migrated;
}
```

**📎 证据链**:

- canvas-editor POC `apps/template-editor-demo/src/app/storage.service.ts:148-208`
- localStorage 实际值(修复前):`{"version":1,"savedAt":...,"payload":{"version":1,"savedAt":...,"payload":{"canvas":{...}}}}`
- localStorage 实际值(修复后):`{"version":1,"savedAt":...,"payload":{"canvas":{...}}}`
- 浏览器自验: `previewSnapshot` 切换前后 `main[0].value` 从 `B_CONTENT` 变 `A_CONTENT`,退出预览恢复 `B_CONTENT`,成功标志 true.
- 同步修复 `restore:pending` 路径(同根因):`restoreSnapshot` 写 `restore:pending` 时不再多包,`get` 时直接拿到 `canvas/lightState/sourceMeta`.

**适用**: all(任何 LocalStorage / IndexedDB / 自定义 storage service,跨 JS/TS)

**复用计数**: 1

**状态**: 🟢 已验证(canvas-editor POC build + 浏览器自验通过)

---

## [2026-09-11] 🎨 实现 — ng-zorro nz-icon 静态替代方案:缺 HttpClientModule 时用 emoji / unicode 字符

**能力维度**: 🎨 实现 / 🐛 调试

**触发**: canvas-editor POC 控制台一直报 `[@ant-design/icons-angular]: you need to import "HttpClientModule" to use dynamic importing` + `the icon download-o does not exist or is not registered`,设置弹窗触发 modal 关闭事件时尤其明显. 占位符面板的"导入/导出 JSON"按钮用 `<i nz-icon nzType="upload">` 和 `<i nz-icon nzType="download">`.

**抽象教训**: **ng-zorro `nz-icon` 默认 lazy load SVG 资源(需要 HttpClientModule)+ 校验 icon 名是否注册**. 在快速 POC / 不想装 HttpClientModule 的场景下:

1. **检查项目是否装了 HttpClientModule**: 看 `main.ts` 或 `app.config.ts`,没装就跑 lazy load → 报 HttpClientModule 错.
2. **检查 icon 名是否在 ng-zorro 当前版本注册**: `download-o` 是 antd v3 老命名,新版本改叫 `download`,老名查不到 → 报不存在.
3. **静态替代方案**(本项目选用):
   - 删 `<i nz-icon nzType="xxx">` 改 `<span class="icon-text">⬆</span>`
   - 加 `.icon-text { font-size: 14px; font-weight: 600; }`
   - 视觉一致(emoji 跨平台),零运行时依赖.

**反模式**:

- ❌ POC 阶段给 ng-zorro 装 HttpClientModule 只为图标(增加无用依赖)
- ❌ 看到 `the icon X does not exist` 就改 nzType 名字试错(可能下一版本又改名)
- ❌ 引入 `@ant-design/icons-angular` 全量注册(包体膨胀)

**正模式**:

```html
<!-- 之前 -->
<button class="panel-toolbar__btn" nz-tooltip="导入">
  <i nz-icon nzType="upload"></i>
</button>

<!-- 之后:emoji + 静态 span -->
<button class="panel-toolbar__btn" nz-tooltip="导入">
  <span class="icon-text">⬆</span>
</button>
```

```less
.icon-text {
  font-size: 14px;
  line-height: 1;
  font-weight: 600;
}
```

**📎 证据链**:

- 修复前 console 报错(每次 modal 关闭事件触发一次)
- 修复后 `list_console_messages` filter `error` → 0 条
- canvas-editor POC 占位符面板"导入"显示 ⬆ "导出"显示 ⬇
- 跨平台 emoji 不需要 antd 注册

**适用**: all(任何用 ng-zorro + 不愿装 HttpClientModule 的 Angular 项目)

**复用计数**: 1

**状态**: 🟢 已验证(canvas-editor POC build + 浏览器自验 console 0 错)

---

## [2026-09-14] 🐛 调试 — MyBatis-Plus BaseMapper 接口 mock 失败 + JDK Proxy 绕坑

**能力维度**: 🐛 调试(测试基础设施层)

**触发**: 给 `extends ServiceImpl<PaperMapper, Paper>` 的 service 写单测,`@Mock PaperMapper paperMapper` 时 Mockito 抛 `MockitoException: Could not modify all classes [interface ...PaperMapper]`,根因 `NoClassDefFoundError: com/yf/base/api/api/dto/BaseAuditDTO`。

**抽象教训**: **Mockito 5 + ByteBuddy inline mock MyBatis-Plus `BaseMapper<T>` 接口,在测试 classpath 缺 `BaseAuditDTO`(或其继承链上任意基类)时直接挂**。三阶段规避策略,按优先级选:

1. **首选**:继承 service 写 `Spy<Service>`,重写 `list(Wrapper)` / `getOne(Wrapper)` 等方法返回 stub —— 完全绕开 mock 框架。
2. **次选**:对 MyBatis-Plus BaseMapper 接口,改用 `java.lang.reflect.Proxy.newProxyInstance(...)` JDK 动态代理 stub `selectBatchIds` 等少数方法(避开 Mockito 的 ByteBuddy inline)。
3. **末选**:检查模块 test classpath,补齐 `BaseAuditDTO` 所在 artifact(通常是 `yf-core`)。若仍失败,排查 transitive 依赖或 IDE maven 配置。

**反模式**:

- ❌ 给测试模块狂加 `byte-buddy-agent` / `mockito-inline` / `spring-boot-starter-test`,期望"加够依赖就能 mock 起来" —— 真正的拦路虎是 `BaseAuditDTO` 类路径缺失,加依赖不解根因
- ❌ 用 `@SpyBean` / `@MockBean` Spring 全栈注解引入整个 ApplicationContext —— 启动慢、还要配 H2/mock datasource,小题大做
- ❌ 把 mapper 字段直接传 `null` 然后用 `Mockito.when(mapper.selectBatchIds(...))` —— 编译期不报错,运行期 NPE

**正模式**(踩坑后稳定模板,以 `PaperServiceImpl.checkProcess` 测试为例):

```java
// 1. 自定义 Spy 子类,重写 ServiceImpl 提供的 list/getOne
static class SpyPaperServiceImpl extends PaperServiceImpl {
    private List<Paper> listStub;
    SpyPaperServiceImpl(ExamMapper examMapper) {
        super(examMapper, null, null, null, null, null, null, null, null);
    }
    void setListStub(List<Paper> stub) { this.listStub = stub; }
    @Override
    public List<Paper> list(Wrapper<Paper> queryWrapper) {
        return listStub != null ? listStub : Collections.emptyList();
    }
}

// 2. JDK Proxy 替代 @Mock BaseMapper 接口
private static ExamMapper newExamMapperProxy(Map<String, Exam> stub) {
    return (ExamMapper) java.lang.reflect.Proxy.newProxyInstance(
            ExamMapper.class.getClassLoader(),
            new Class<?>[] { ExamMapper.class },
            (proxy, method, args) -> {
                if ("selectBatchIds".equals(method.getName())) {
                    // stub 返回 List<Exam>
                }
                // 其他方法返回默认值(int=0, long=0L, List=emptyList, 其他=null)
                Class<?> r = method.getReturnType();
                if (r == int.class || r == Integer.class) return 0;
                if (r == long.class || r == Long.class) return 0L;
                if (r == boolean.class || r == Boolean.class) return false;
                if (r == List.class) return Collections.emptyList();
                return null;
            }
    );
}

// 3. service 构造函数其他依赖传 null(本测试用不到)
//    TableInfoHelper 必须初始化,否则 list(Wrapper) 仍可能报错
@BeforeEach
void setUp() {
    MybatisConfiguration cfg = new MybatisConfiguration();
    MapperBuilderAssistant assistant = new MapperBuilderAssistant(cfg, "");
    TableInfoHelper.initTableInfo(assistant, Paper.class);
    TableInfoHelper.initTableInfo(assistant, Exam.class);
    examStub = new HashMap<>();
    service = new SpyPaperServiceImpl(newExamMapperProxy(examStub));
}
```

**配套必备**(缺一即翻车):

- 模块 pom.xml 必须加 `spring-boot-starter-test` (scope=test) + `byte-buddy` / `byte-buddy-agent` (scope=test, version=`${bytebuddy.version}`)
- `@BeforeEach` 必须调 `TableInfoHelper.initTableInfo(assistant, EntityClass.class)`,否则 `service.list(Wrapper)` 内部 MyBatis-Plus 元数据缺失
- 跑命令必须 `-DfailIfNoTests=false`,否则无测试的 transitive 子模块(`yf-core` / `yf-job` 等)直接 BUILD FAILURE

**📎 证据链**:

- 失败 1:`Mockito cannot mock this class: interface PaperMapper` + `Caused by: NoClassDefFoundError: com/yf/base/api/dto/BaseAuditDTO`
- 失败 2:匿名实现类 `ExamMapper` 编译报"未覆盖 `listExamsByTmplIdPaging` 抽象方法" —— MyBatis-Plus mapper 接口有 N 个抽象方法,匿名类实现太累
- 失败 3:`Mockito.mock(clazz, CALLS_REAL_METHODS)` 仍触发同一 ByteBuddy 错
- 成功:`SpyPaperServiceImpl` + JDK Proxy + TableInfoHelper 三件套 → 5/5 测试通过(`Tests run: 5, Failures: 0, Errors: 0`)
- 验证:`mvn -pl yf-modules/yf-module-exam -am test -Dtest=PaperServiceImplTest -DfailIfNoTests=false` → `BUILD SUCCESS`

**适用**: 后端(Java + Spring Boot + MyBatis-Plus + JUnit 5 + Mockito 5+)。任何要测 `ServiceImpl` 子类且依赖 `BaseMapper` 接口的项目。

**复用计数**: 1

**状态**: 🟢 已验证(`yf-module-exam` 模块测试新增,5/5 通过)

---

## [2026-09-17] 🔧 实现 — 跨服务复用方法警惕循环依赖,优先内联核心逻辑 + 幂等补建用 insert-only 不动旧字段

**能力维度**: 实现(跨模块改动 / 数据补建)

**触发**: 修复"plan 补考延期后,新加 group 里的课程节点 unlocked=false"bug 时,需要复用 client 端 `PlanUserNodeClientService.unlockAllNodes()` 方法从 admin 端调用。但 `unlockAllNodes` 内部依赖 `PlanUserService`(admin 模块),反向注入会形成 admin ↔ client 循环依赖,Spring 2.6+ 默认禁止循环 bean 引用。

**抽象教训**:
- **跨模块复用方法前先看依赖图**:即使是"只调一个方法",也要查目标方法的所有 `private`/`@RequiredArgsConstructor` 依赖链,反向注入循环 = 启动失败
- **优先内联核心逻辑**:不调依赖其他模块的封装方法,直接复制 `saveXxx` 的 INSERT-only 逻辑(查重 + 跳过 + 新建),只搬用到的几行,保持改动原子
- **幂等补建必须 insert-only**:补建/补全类方法(如 unlockAllPlanNodes)只允许 `save`/`saveBatch`,**绝不 `updateById`** 已有记录 → 否则会破坏历史 `finishTime/finished/processTag` 等业务字段
- **批量预查减少 N+1**:`WHERE (userId, nodeId) IN (...)` 一次查出已有 key 集合,内存中 `existingKeys.contains()` 判重

**反模式**:
- ❌ 直接 `@Autowired PlanUserNodeClientService clientSvc` 反向注入 admin 模块 → bean 循环依赖 + 方法内部又反向调 `planUserService.checkFinished` → 行为不可预期
- ❌ 补建逻辑用 `saveOrUpdate`,把历史 `finished=true` 的节点误改回 `false`
- ❌ N+1 循环里 `count(planId+userId+nodeId) > 0` → 100 节点 × 50 学员 = 5000 次查询

**正模式**:
- ✅ 内联核心循环:`planNodeService.list` → `planUserNodeService.list` (批量预查) → `existingKeys` set → 只 `saveBatch(toInsert)`
- ✅ 不调外部模块的"会反向调用回当前模块"的方法,即便签名简洁
- ✅ 注入当前模块已有的 service(`planNodeService`/`planUserNodeService`/`planGroupService`)足够,不要新增跨模块依赖

**适用**: all(Spring Boot 后端为主,任何"补建缺失记录"场景通用)

**复用计数**: 1

**状态**: 🟡 待验证(本次会话 `PlanUserServiceImpl#unlockAllPlanNodes` 已落地,mvn compile 通过,Playwright 端到端验证 asda plan 第二个新环节课程 unlocked=true)

---

## [2026-09-17] 🐛 调试 — UI 按钮不显示类 bug 必须串三层(后端字段 → 前端 computed → 模板 v-if)才算定位完整

**能力维度**: 调试(渲染层 bug)

**触发**: 学员端 plan 详情页"新环节"里的课程显示"请先开始任务",无"去学习"按钮。表象在前端,根因在后端 — 但只看后端 API 返回的 `unlocked=false` 是不够的,还要看前端 `canShowActionButton` 的 computed 条件和模板里的 `v-if` 三层。

**抽象教训**:
- **可观测数据要追到最后一根线**:`unlocked` 字段是源头,但 `canShowActionButton = node.unlocked && canShowActionButton(node)` 是渲染条件。`v-if="node.unlocked"` 是模板守卫。三层任一层 false 都会让按钮不显示
- **后端字段 + computed + v-if 三件套**:后端只看 `unlocked:false` 会定位到数据;前端 computed(如 `isInTimeWindow`)会因时间窗锁定加锁;模板 `v-if` 可能因外部条件再挡一层。**完整定位必须三层都看到**
- **不要只看 API 响应**:WebPlanDetail 的 `canShowActionButton` 还依赖 `node.unlocked`、`node.finished`、`node.nodeType`、`isInTimeWindow` 四个 computed。即使后端 `unlocked=true`,前端 `isInTimeWindow=false`(时间窗锁)按钮仍不显示
- **截图 = 事实,但要拆解**:用户给的截图是最终视觉,要从截图反推渲染状态(如"未完成"对应 `unlocked && !finished`;"请先开始任务"对应 `!unlocked`)

**反模式**:
- ❌ 看到"按钮不显示"就改 CSS 或 disabled 状态
- ❌ 只看后端 API,忽略前端 computed 的复合条件
- ❌ 改前端按钮 `v-if` 条件(如把 `unlocked` 去掉)→ 修复表象但掩盖真 bug

**正模式**:
- ✅ 第一步:浏览器开发者工具 → Vue devtools 看组件 props 实际值
- ✅ 第二步:学员端 API 响应直接拉 JSON,确认后端字段(`unlocked`/`finished`/`startTime`/`endTime`)
- ✅ 第三步:对照前端 computed(`canShowActionButton`/`isInTimeWindow`/`shouldShowEndTime`)逐个算一遍
- ✅ 第四步:看模板 `v-if` 链是否有额外守卫(如 `<div v-if="node.unlocked">` 包住按钮)
- ✅ 三层串通后定位到具体哪一层 false → 决定改后端/前端

**适用**: all(任何 Vue/React 框架的"按钮不显示/状态不对"类 bug 通用)

**复用计数**: 1

**状态**: 🟢 已验证(asda plan id=2084860923533455361 复现 → 串三层定位 unlocked=false → 修后端 unlockAllPlanNodes → 截图验证按钮出现)

---

## [2026-09-17] ✅ 验证 — 批量 bug 修前必须逐个验证真实性 + 评估修复复杂度

**能力维度**: 验证(批量修复方法论)

**触发**: 本次会话先后扫描出 19+15 = 34 个 bug(分两轮)。如果听到报告就动手,会:
- 把误报当 bug 修,引入新问题(本次 #9 "loading 永远 false" 实际是误报,三个方法根本没动 loading)
- 选错修复复杂度(公共组件 vs 调用方),影响范围失控
- 漏掉真实 bug,改了一堆不存在的

**抽象教训**:
- **每个 bug 必须独立验证**:读完整上下文,不只是 agent 报告的那几行 — 看 5-10 行前后调用关系、空值守卫、调用方使用模式
- **三件套真伪判断**:
  1. **真** — 路径可达(能找到触发调用链),调用方没兜底
  2. **部分真** — 报告对一半,但具体描述错了(如 #9 "loading 永远 false" 实际只是"无 catch")
  3. **误报** — 静态分析看着像,运行时根本走不到
- **复杂度评估分级**:1-5 行 / 小(单文件 < 30 行) / 中(< 100) / 大(跨模块)
- **跨端对比**:bug 报告说"v2 有 X 但 mobile 没有",要 grep 两个文件确认"v2 真的有"+ 不是同款 bug

**反模式**:
- ❌ 听 agent 报告"这个是 bug"就直接动手修
- ❌ 批量修完一次提交,git diff 一片红难回滚
- ❌ 把所有 bug 都按"高严重度"修 — 有些是低频角落,有些改动风险大于收益

**正模式**:
- ✅ 第 1 步:验证 1-2 个最严重的 bug,确认 agent 报告可信度
- ✅ 第 2 步:列出"真/部分/误报"分类 + 修复复杂度表
- ✅ 第 3 步:跟主人确认优先级 + 范围(只修真 + 只修易改的先)
- ✅ 第 4 步:逐个修,每修一个跑 typecheck/lint
- ✅ 写经验时把"误报"案例也记下来(下次别再被类似报告误导)

**适用**: all(任何批量修 bug / 批量重构场景)

**复用计数**: 1

**状态**: 🟢 已验证(本次会话 15 个 bug 全修真,1 个误报(#9 loading 描述)正确识别跳过)

---

## [2026-09-17] ✅ 验证 — lint baseline 必须 git stash 鉴别 pre-existing vs 引入

**能力维度**: 验证(lint 解读)

**触发**: 修 v2 文件后跑 eslint 报 15 个问题(7 error 8 warning)。**焦虑**:是不是我改坏了?但 git diff 显示我的改动只新增 1 个 console.warn,问题不大。
标准鉴别:`git stash` → 跑 lint → 看 master 状态 → `git stash pop` → 再跑 lint → 对比 diff

**抽象教训**:
- **eslint 错误 ≠ 我引入**:v2 项目大量 pre-existing lint 错误(变量未用、文件名 `index.vue` 违反 multi-word-component-names、console.log warning)
- **gold standard 鉴别**:stash → lint → unstash → lint,对比行号
- **不要因为 lint 报错回滚我的代码**(主人可能在 IDE 里看到一堆红)
- **lint 增长 vs 减少**:本次 stash 后 14 → 改完 15(+1 warning,新增 console.warn;−2 error,空 try 改 log 后错误消失),净减少 1 个 error

**反模式**:
- ❌ 看到 lint 红就慌,改回去
- ❌ 不读 diff 直接 lint 全部,误把 pre-existing 算成 regression
- ❌ 因为 lint 不通过就放弃修 bug(实际是项目本来就不干净)

**正模式**:
- ✅ 改完后跑 lint,有错先 diff 看是不是我引入的
- ✅ 用 git stash 做 baseline 鉴别
- ✅ 报告时区分"我引入的新错误"vs"pre-existing 未变错误"
- ✅ 给主人的 lint 报告中说明"pre-existing 4 个错误不属于本次改动"

**适用**: all(任何 lint 工具链 + git 工作流场景:ESLint / Pylint / golangci-lint / clippy)

**复用计数**: 1

**状态**: 🟢 已验证(本次 v2 WebPlanDetail.vue ESLint 14 → 15,净 -1 error)

---

## [2026-09-17] 🔧 实现 — Vue 3 ref + v-for 不自动聚合为数组

**能力维度**: 实现(Vue 3 模板引用)

**触发**: mobile `my-courses/index.vue` 想给每个 tab 配一个 PaginationList 实例,用了 `ref="paginationListRef"` + `v-for` + `paginationListRef = ref([])`。**Vue 3 不像 Vue 2 那样自动聚合为数组**:
- `paginationListRef.value` 是**单个** PaginationList 实例(最后挂载的那个)
- `paginationListRef.value[active.value]` → 取对象的 `[0]` 属性 → undefined
- `refreshLoad` 永远不调用 → Tab 切换不刷新列表

**抽象教训**:
- **Vue 3 `ref` + `v-for` 不自动聚合**:这是 Vue 2 → Vue 3 的破坏性变化(没人提)
- **不要假设 ref 默认是数组**:手写 `ref([])` 也不会变数组,Vue 3 仍按 DOM ref 语义
- **如果需要多实例**:用 function ref(Vue 3.5+)或 `provide/inject` + 内部 ref map
- **如果只要当前激活 tab**:用 `ref(null)` 单实例,van-tabs 切换时只挂载新实例(van-tabs 默认 lazy render)

**反模式**:
- ❌ `const paginationListRef = ref([])` 然后 `paginationListRef.value[active.value]`
- ❌ 期望 `ref="x"` 在 v-for 内自动聚合
- ❌ 给每个循环项单独 ref 名(ref="item0", ref="item1"...)

**正模式**:
- ✅ 单实例:`const listRef = ref(null); listRef.value?.refreshLoad?.()`
- ✅ 多实例(Vue 3.5+):`:ref="(el) => refs.value[index] = el"`
- ✅ 用响应式 prop 触发刷新:PaginationList 内部 `watch(() => props.queryParams, refreshLoad)`

**适用**: Vue 3 (任何用 `ref="x"` + `v-for` 的场景)

**复用计数**: 1

**状态**: 🟢 已验证(mobile/my-courses/index.vue 修复后 Tab 切换正常刷新)

---

## [2026-09-17] 🔧 实现 — 考试/表单 loading 重置必须双向放 if 之外 + 公共组件修 vs 调用方修选风险小

**能力维度**: 实现(异步状态管理 + 组件修改决策)

**触发**: 本次会话两次踩同一类坑:
- **#5** v2 `WebExamCheck.handleCreate`:`if (res.code === 0) { loading = false }`,业务失败 code 非 0 时 axios 不 throw, .catch 不触发,loading 永远 true
- **#9** v2 admin `exam/index.vue`:三个状态切换方法 `.then(...)` 完全无 catch(loading 字段压根没动,但无 catch 本身是真 bug)

**抽象教训**:
- **loading 重置必须双向放 if 之外**:`loading = true` 在 if 外(进入函数就锁),`loading = false` 在 if 外(无论成功失败都解锁)。if 内只做业务(跳转/弹错)
- **HTTP 拦截器吞错的连锁影响**:如果后端业务失败返回 `{code: 非0, msg: 'xxx'}`,axios 看到 status=200 不 throw,前端拿不到 reject。**所有 `.catch()` 都不触发,if (res.code === 0) 必须手动判断**
- **改公共组件 vs 改调用方决策树**:
  - 改公共组件:影响 N 个调用方,**只在行为明显错** 时改(如 PaginationList 加 watch queryParams)
  - 改调用方:影响 1 处,优先选(本次 my-courses/index.vue 单实例修复 vs PaginationList 改 watch — 选前者)
  - **判断标准**:调用方数量 + 是否会影响现有调用方的工作

**反模式**:
- ❌ `if (res.code === 0) { loading = false; ... }` — 业务失败时 loading 永远卡
- ❌ `.then(...)` 无 `.catch` — 网络错 unhandled rejection
- ❌ 看到"公共组件应该响应 prop"就改,不看调用方数量
- ❌ 把 loading 重置放 finally(Vue 2 没原生 finally 支持,Vue 3 支持但风格不统一)

**正模式**:
- ✅ `this.loading = true; api().then(res => { if (res.code === 0) 成功; else 弹错 }).catch(网络错).finally(() => this.loading = false)`
- ✅ 公共组件改前 grep 数量:超过 3 处使用就慎重
- ✅ 实在要改公共组件,先列出对其他调用方的影响再下手

**适用**: all(任何调用异步 API 的代码 + 组件修改决策)

**复用计数**: 2(同一类坑踩了 #5 + #9)

**状态**: 🟢 已验证(本次会话 #5 修后 loading 正常 reset,#9 catch 全加)

---

## [2026-09-17] 🐛 调试 — history.go(-N) vs router.back() + 空 catch 是代码异味

**能力维度**: 调试(浏览器 API + 错误处理)

**触发**: mobile `paper-result-detail.vue` 用 `history.go(-(history.length - 1))` 当"返回"。**`history.length` 是浏览器会话总历史**(跨 tab + 外部 deep-link),从推送进入时可能为 2-5,导致返回按钮跳 1-4 页落到不可预测位置。

**抽象教训**:
- **`history.length` ≠ SPA 路由深度**:这是 native browser API,不是 SPA 路由
- **`history.go(-N)` 在 SPA 慎用**:N 是"浏览器历史步数",不是"路由步数"
- **SPA 应统一用 router.back()**:Vue Router 维护自己的 history stack,知道 SPA 内的所有跳转
- **deep-link 防御**:`window.history.state?.back` 可判断是否有上一页,无则 `router.push('/')` fallback
- **空 catch 是代码异味**:隐藏错误,调试困难。catch(e) {} 实际是"我知道这里可能出错但我不想处理"
- **空 catch 的修复路径**:① 删掉(逻辑上不可能抛的)② 改成 console.warn 留痕 ③ 改成弹错 + 重置状态

**反模式**:
- ❌ `history.go(-(history.length - 1))`
- ❌ `history.go(-1)` 兜底 deep-link(应该 router.back + fallback)
- ❌ `catch(e) {}` — 静默吞错
- ❌ `try { ... } catch (e) {}` 套不可能抛的代码

**正模式**:
- ✅ `if (window.history.state?.back) router.back() else router.push('/')`
- ✅ catch 至少 `console.warn('context', e)`
- ✅ 业务逻辑中不可能抛的 try-catch 直接删(代码可读性更高)

**适用**: all(Vue/React SPA 路由 + 任何 try-catch)

**复用计数**: 2(history.length bug + 空 catch 异味)

**状态**: 🟢 已验证(mobile paper-result-detail.vue 修后从 deep-link 进入正确跳首页)

---

## [2026-09-17] 🛡 边界 — 前端改公共组件前必须评估调用方数量,跨端一致性问题用真实代码对比而非假设

**能力维度**: 边界(修改决策 + 跨端一致性)

**触发**: 本次会话评估 #10 修复方案时遇到决策点:
- 方案 A:改 `my-courses/index.vue` 的 ref 使用(影响 1 处,小风险)
- 方案 B:改公共组件 `PaginationList.vue` 加 `watch(() => props.queryParams, refreshLoad)`,影响 4 处调用方

**抽象教训**:
- **改公共组件前必查调用方数量**:grep `PaginationList` 在所有 .vue 引用次数
- **跨端一致性问题不要假设**:agent 报告"v2 有 X 但 mobile 没有",要 grep 两个端确认"v2 真的有 X 实现"+ 确认 mobile 真的缺(可能是 mobile 用其他方式实现)
- **后端能力用代码查而非问**:本次 #15 后端 `createPaper` 是否支持 password,直接 grep `PaperCreateReqDTO.java` + `PaperController.java` 5 分钟确认,**比问主人快 + 准确**
- **跨端迭代的一致性**:v2 / v3 / mobile 三个端通常有部分功能缺失或实现差异,**e2e 跨端测试是必需**,不能靠人工

**反模式**:
- ❌ "公共组件反正调用方都要响应 prop,顺便改" — 实际是 N 处风险
- ❌ "agent 说 v2 有 X"就直接相信 — 不验证 = 可能假报告
- ❌ "后端应该支持 password" — 用代码查,不用猜
- ❌ 一次性"补全"v2/v3/mobile 三端所有差异 — 风险爆炸

**正模式**:
- ✅ 改公共组件前:`grep -r "ComponentName" --include="*.vue" | wc -l`
- ✅ 跨端对比:grep 两端代码,贴出实际差异
- ✅ 后端能力:grep + Read 5 分钟,而不是"我猜应该支持"
- ✅ 修跨端差异:**单端修** + 评估影响范围 + 让主人决定要不要同步其他端

**适用**: all(公共组件修改 / 跨端一致性 / 后端能力确认)

**复用计数**: 2(#10 PaginationList 决策 + #15 后端 password 确认)

**状态**: 🟢 已验证(#10 选单端修 + #15 grep 后端代码 5 分钟确认)

---

## [2026-09-18] [🐛 调试] — MyBatis-Plus `IdType.ASSIGN_ID` 雪花 ID 配 INT 列是定时炸弹

**能力维度**: 调试定位 + 修复验证

**触发**: 服务端报 `Data truncation: Out of range value for column 'id' at row 1`,且走的是 `saveBatch`。

**根因**: 实体声明 `@TableId(type = IdType.ASSIGN_ID)` 配 `String id`,但 DB 列是 `INT AUTO_INCREMENT`(32-bit, 上限 2,147,483,647)。
- MyBatis-Plus 雪花生成 19 位 Long,塞进 String 字段
- JDBC bind 时 MySQL 解析 Long-string 进 INT 列 → INT 上限溢出 → 报 out of range

**关键鉴别**:
- 同模块多张表用同样的 `IdType.ASSIGN_ID`,**能正常 saveBatch 的就是 BIGINT,报错的表就是 INT**——用"同策略表对比"快速定位漏网之鱼
- 防御性校验(id 非空/格式)只缓解**触发条件**,不解决**根因**——bug 会在其他场景(雪花号 > INT 上限)再爆
- 不要被堆栈顶端"字段校验失败"误导——**报错位置在 saveBatch,根因在 schema**

**正模式**:
- ✅ 看到雪花 ID 类实体,先 `grep` 同模块所有 `IdType.ASSIGN_ID`,对比能跑和不能跑的表,锁定 schema 漏 BIGINT 的表
- ✅ 修法用 `ALTER TABLE ... MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT`(配 STEP 2 预检查 INFORMATION_SCHEMA 防猜错列类型)
- ✅ 防御性校验可以做兜底,但要标"未真正修复",不要写成"✅ 已修复"

**反模式**:
- ❌ 看到 `id` 报错就以为是 VARCHAR 字段被覆盖/清空,写防御性校验交差——下次雪花号长一点照样爆
- ❌ 直接 `MODIFY COLUMN id BIGINT` 不先查当前列类型——若列是 unsigned 或带 DEFAULT,MODIFY 后默认值/符号丢了

**适用**: 后端(JPA/MyBatis-Plus + snowflake/雪花 ID 策略的任何项目,凡是有遗留 INT 列的)

**复用计数**: 1(wk-train-center-service `el_msg_tmpl_prop`)

**状态**: 🟡 待验证(SQL 已写好,等主人贴 SHOW CREATE 贴结果 + 执行 ALTER + 业务冒烟)

## [2026-09-28] [📝 工作区规则] — 写文档前必须先问主公放在哪个项目下


**能力维度**: 工作流规范 + 文件位置治理

**触发**: 准备用 Write/Edit 创建"文档类文件"(报告 / 草稿 / 交接 / 教学 / 速查表 / 流程图 / Word / PDF 等)

**位置铁律**:
- ✅ 项目文档 → `E:\rhProject\.products\projects\{项目名}\{reports|handoff|teach|decisions|reference}\`
- ❌ 绝不放到 `E:\rhProject\.products\docs\` 顶层(顶层只放跨项目的元规则,如 CLAUDE.md)
- ❌ 绝不混放不同项目的文档

**正模式**:
- ✅ 落笔前**先问主公**:"放哪个项目?具体路径?"
- ✅ 项目目录命名规范:与代码项目同名(全小写,短横线连接)
- ✅ 已有项目:`customer-pricing` / `wk-train-center` / `wk-train-center-service` / `wk-mhc-ui` / `wk-mhc-mobile` / `wk-user` / `wk-PPTist-ui`
- ✅ 例外:修缮已有文件(不创建新文件)、主人明确指定位置 — 可自行写

**反模式**:
- ❌ 凭印象直接写到 `.products/docs/` 顶层 — 主公 2026-09-28 批评:"放的位置都不对"
- ❌ 把多份不同项目的报告混在一个目录 — 后续难查找
- ❌ 跳过"先问"步骤直接写 — 浪费返工时间

**适用**: 任何 AI 助手 / agent 在 rhProject 工作区写文档

**复用计数**: 1(2026-09-28 customer-pricing 借鉴项目,3 份报告 + 1 个 handoff + 21 个 teaching 文件全部错位,后迁移)

**状态**: 🟢 已落地(主公全局 CLAUDE.md §8 + 项目级 .products/CLAUDE.md + customer-pricing 项目 README)


## [2026-09-28] [🔧 工作区治理] — wk-train-center 5 个组件迁入为子目录


**能力维度**: 项目目录治理 + 大规模迁移

**触发**: wk-train-center 集合下 5 个组件项目(wk-train-center-service / wk-train-center-ui / wk-train-center-ui-v3 / wk-mhc-mobile / wk-PPTist-ui)原本平级 ,**主公决定**物理迁入 wk-train-center/ 下作为子目录(backend/frontend/frontend-v3/mobile/ppt/)

**操作**:
1. mkdir 5 个新子目录
2. cp -r 5 个原项目到对应子目录
3. rm -rf 原 5 个项目
4. 修 wk-train-center/README.md 的"关联仓"表路径(`../xxx/` → `xxx/`)
5. 追加"目录重组(2026-09-28)"章节,含版本号架构(v1.5/.../latest 别名,预留)
6. 更新 .products/README.md 和 .products/CLAUDE.md 项目列表(4 独立 + 1 集合)

**问题**:
- ⚠️ **断链 56 个文件**:迁移后,50+ 个文档里仍引用旧路径(`../wk-train-center-service/` 等),全部失效
- 教训:集合目录重构时,**先 grep 统计断链数量**,再决定是否批量修复,不要只看 README

**正模式**:
- ✅ 大规模迁移前,先 grep `\.\./wk-train-center-(service|ui|ui-v3)|wk-mhc-mobile|wk-PPTist-ui` 统计断链数
- ✅ 一次性 cp -r 复制(原子性比逐文件安全)
- ✅ 主集合 README 先于子目录更新(否则子目录更新时找不到归属)
- ✅ 版本号架构**预留**不实施(单一版本 = 直接放根 = latest 等效)
- ✅ 更新 .products/CLAUDE.md 项目列表(避免新会话找不到)

**反模式**:
- ❌ 直接 mv 不先 cp 验证 — 中途断电会丢文件
- ❌ 只更新 README 不 grep 其他断链 — 用户点链接 404
- ❌ 不写迁移记录 — 后续接手人不知道这结构是迁移来的

**适用**: rhProject 工作区任何"项目目录重构"任务

**复用计数**: 1(wk-train-center 5 组件物理迁移)

**状态**: 🟡 进行中(目录已重组,56 个断链待修复)


## [2026-09-28] [🔧 大规模迁移 + 📝 工作区治理] — 6 个项目目录大迁移(组件+版本号二级结构落地)


**能力维度**: 项目目录治理 + 大规模迁移 + 反向索引

**触发**: 主公拍板"集合 → 组件 → 版本号 → 文档类型"二级结构 + 4 个代码仓文档归档

**操作链路(渐进式)**:
1. 备份原目录为 `-backup/`(保留可回退)
3. 新建空目录树(mkdir,先建框架)
4. 批量迁移(组件级 docs/plans/tasks/db + 集合级 plans/1.5 → 各组件 1.5/plans)
5. 写 README(集合级 + _index + 每个组件 README,共 15 个)
6. 建 origin/1.0/(跨版本不变:PRD/strategy/index/user-guide)
7. 更新反向索引(47 条)
9. 归档 4 个代码仓的文档到对应位置
10. 全局规范声明(主公 CLAUDE.md §9 + .products/CLAUDE.md)

**关键发现**:
- ⚠️ **db 双源矛盾**:Backend/wk-train-center-service/db/README.md 说"源真相是 .products/",但又说代码仓是副本 → 实际是**代码仓是源真相,.products/ 是归档**。主公明确"db 以代码仓为准"
- ⚠️ **mobile1.1 SQL** 是给 mobile 组件用的,但物理位置在 backend/wk-train-center-service/db/ → 归档到 mobile/1.5/db/mobile1.1/(跨组件归属)
- ⚠️ **版本号目录可能不够**:之前 mkdir 只建了 1.0/1.5,实际归档需要 1.1-1.5.1 全建 → 先 grep 实际版本号,再批量 mkdir
- ⚠️ **CWD 锁目录**:Windows bash 下,如果 cwd 在被 mv 的目录里,mv/cp/rm 都报"Device or resource busy" → 先 cd 到上级或 cp + rm(不要 mv)

**正模式**:
- ✅ **先备份再新建**:cp -r → -backup/,rm -rf 原目录(避免 cp 单边失败丢数据)
- ✅ **渐进式迁移**:备份 → mkdir 框架 → 迁组件 → 迁集合级 → 写 README → 建 origin → 写反向索引 → 归档代码仓(每步可中断)
- ✅ **架构预留**:版本号目录先建空,内容按需从 backup/ 代码仓抽取
- ✅ **反向索引是迁移的"灵魂"**:迁移后必须更新 origin/1.0/index.md,否则后人找不到文档(主公强调"注意能够反向索引")
- ✅ **db 例外处理**:跨组件的 db(mobile SQL 在 backend 仓)→ 归档到目标组件 + 在 index.md 说明
- ✅ **全局规范要先落地**:迁移完在主公 CLAUDE.md §9 + .products/CLAUDE.md 声明,新会话自动遵守
- ✅ **代码仓不动**:迁移是 cp(代码仓保留,作为源真相),不是 mv(避免 git 历史丢失)

**反模式**:
- ❌ 直接 mv 不先备份 — 中途断电会丢数据
- ❌ 只更新顶层 README 不迁移子目录内容 — 用户打开新结构还是空的
- ❌ 一次性完成所有迁移无阶段验证 — 出错难定位
- ❌ 把跨组件 db(mobile1.1 SQL)归错位置 — 语义错位
- ❌ 不更新反向索引就认为完成 — 后人无法 reverse-link
- ❌ CWD 在目标目录时 mv/cp/rm(Windows bash "Device or resource busy")
- ❌ 改完代码仓 README 后忘记指向 .products/(造成文档两套不同步)

**关键决策(主公拍板)**:
- 版本号 = 产品级对齐(但 bug 可单开分支)
- 归档策略 B = 版本号 + `_archive` 后缀
- frontend v2 = 1.1-1.5(不建 v2 目录)
- origin/ = 跨版本不变的原始资料 + 反向索引
- 反向索引用 **Obsidian** 管理(主公指定)
- 代码仓 = 不写新文档(主公拍板)
- customer-pricing 单独走 reports/handoff/teach 标准(其他项目不动)

**适用**: rhProject 工作区任何"项目目录重构 + 代码仓文档归档"任务

**复用计数**: 1(2026-09-28 wk-train-center 5 组件 + customer-pricing + 4 代码仓文档归档)

**状态**: 🟢 完成(目录已迁移,反向索引已建,全局规范已声明)

