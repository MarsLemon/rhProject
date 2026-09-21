# 工作流编排器经验库

> **仅 Orchestrator 适用**的抽象能力教训(适用 = orchestrator-only)。
> **绝对不写业务细节**——只写调度策略、跨 agent 协调、风险拦截的能力教训。

---

## 📋 经验索引(按能力维度)

| 维度        | 数量 | 简述                                                                                                                                                                  |
| ----------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔍 资料检索 | 0    | 待补充                                                                                                                                                                |
| ❓ 反问澄清 | 0    | 待补充                                                                                                                                                                |
| 🔧 实现     | 3    | cron 落盘 3 坑(schtasks /Run 退出 0 ≠ 跑了 + Task To Run 路径核对 + SYSTEM 子进程 PATH 注入 + 派单系统级 CLI 前先验凭据)                                              |
| ✅ 验证     | 0    | 待补充                                                                                                                                                                |
| 🤝 协作     | 9    | 跨主域串行 + 边界契约同步 + 专家团 3 契约 + 多 agent 合并 4 段模板 + Plan/Workflow 合并判据 + 精简方案 D 收工检查 + VS Code 官方 Plan 借鉴 + **「默认派 workflow-plan」A 案混合 SOP(2026-07-14,已被 B 案覆盖) + B 案硬切 SOP(反问主会话托底,2026-07-14)** |
| 📝 表达     | 1    | 多 agent 合并 SOP 4 段模板                                                                                                                                            |
| 🛡 边界     | 2    | 大批量迁移 dry-run + 路径分隔符陷阱 / 跨栈经验归属 unclear 时先归 orchestrator(2026-07-09)                                                                            |

---

## 💡 经验条目

## [2026-07-14] 🤝 协作 — 「默认派 workflow-plan」踩坑 + 硬切 SOP 拍板(B 案现行,反问主会话托底)

**能力维度**: 🤝 协作 / 🛡 边界
**触发**: 主人原话 2026-07-14"我希望你默认用 workflow-plan 这个智能体和我进行对话" → 派 1 轮 workflow-plan 试跑反向暴露 3 硬伤 → 主会话反向汇报 3 案 → 主人三连拍(A → 硬切 → **B 案反问托底+其余硬切**)
**抽象教训**: 「默认派 subagent」≠「无条件接管对话」—— subagent 系统 prompt ≠ 主会话 CLAUDE.md,caveman / 证据链可注入,AskUserQuestion / TodoWrite 难继承;**硬切的现实形态 = 反问主会话托底 + 其余硬切(B 案)**,代价是双进程协调,主会话负责 grill-me 闭环
**反模式**:
- 把"默认派 subagent"读成"反问也归子 agent",致 grill-me 闭环坏掉
- 不派试跑就拍硬切,直接吃工具阉割
- 子 agent 输出无 4 件套证据链 + 无 EVAL
- 翻案不留痕(每次拍板变更必须 grill-me + 落 log,本条即此教训产物)

**正模式(B 案硬切 SOP,2026-07-14 主人拍板现行)**:

1. **触发永真化**:每个新任务默认派 workflow-plan,无关键词判断
2. **派单 prompt 4 件套强制注入**:
   - 契约指针 `coordination-contract-owner.md` 绝对路径
   - caveman 风格指令(中文 + 短句 + 无废话)
   - 4 件套证据链硬要求(原话/触发/验证/可实现)
   - 本会话 MEMORY.md 关键点(domain overview / 跨模块检查 / 端口 v2=4212 v3=4213 / 路径一律绝对)
3. **状态继承最小化**:每轮 prompt 头部注入"MEMORY 摘要"(主会话已 grep 的关键点)
4. **TodoWrite 替代**(双侧均未加载):拆步写文件 `Thinkpad/00-Inbox/plan-todos-{日期}.md`,派单 prompt 引用路径
5. **完工验收**:workflow-plan 自己落 log,主会话做对账
6. **🔑 反问托底主会话**(B 案核心):AskUserQuestion 走主会话 grill-me,**workflow-plan 不参与反问**;workflow-plan 需要反问时降级为消息体罗列 + 写 `Thinkpad/00-Inbox/reverse-questions.md` 落盘,主会话 grill-me 后回传答案

**📎 证据链**:
- 主人原话(2026-07-14):"我希望你默认用 workflow-plan 这个智能体和我进行对话"
- 主人三连拍留痕:
  - 第 1 拍:**A 案**"混合 + 主人显式声明"——主会话反向汇报后拍
  - 第 2 拍:**硬切**"直接硬性使用"——主会话再 grill-me 3 硬伤
  - 第 3 拍(终拍):**B 案**"反问主会话托底 + 其余硬切"——定稿
- 触发可复现:派 1 轮 `Agent` subagent_type=workflow-plan + 4 件套 prompt → 它反回 3 冲突 + 3 选项 + 5 grill-me → 主会话反向汇报 → 主人三连拍
- 验证方式:A→硬切→B 三拍过程完整留痕于本条;落地后下一次派单实战走 B 案
- 可实现性:`read_file Thinkpad/22-entities-实体档案/agent-经验库/orchestrator-experiences.md` 主人随时对账
- 工具阉割事实:本会话 TodoWrite 双侧未加载;AskUserQuestion 仅主会话可用;子 agent 反问通道全坏 → B 案让反问稳态走主会话

**适用**: orchestrator-only
**复用计数**: 0
**状态**: 🟡 待验证(下一次派单实战走 B 案)

---

## [2026-07-14] 🤝 协作 — 「默认派 workflow-plan」A 案混合 SOP 拍板(已被 B 案覆盖,留痕)

**能力维度**: 🤝 协作 / 🛡 边界
**触发**: 主人原话 2026-07-14"我希望你默认用 workflow-plan 这个智能体和我进行对话" → 派 1 轮试跑反向暴露 3 硬伤 → 主会话推第 4 案(混合 A) → 主人第 1 拍 A 案
**抽象教训**: 「默认派 subagent」≠「无条件接管对话」—— subagent 系统 prompt ≠ 主会话 CLAUDE.md,caveman / 反问 / TodoWrite / AskUserQuestion 在子 agent 侧都可能掉,硬切=盲切;A 案"混合(主会话做前台、主人显式声明才派单)"是规避硬切风险的工程解,但在主人"默认硬切"强口径下不达标,被主人主动翻为 B 案

> **备注**:本条作为过程留痕保留,已被上方 B 案条目覆盖;读 vault 时以 B 案为现行 SOP。本条不再独立支持"派单触发"判断,仅供反查三连拍轨迹。

---

- **🤝 协作 — 「默认派 workflow-plan」踩坑 + 混合 SOP 拍板(2026-07-14)**

**能力维度**: 🤝 协作 / 🛡 边界
**触发**: 主人原话 2026-07-14"我希望你默认用 workflow-plan 这个智能体和我进行对话" + 拍板"硬切"前先派 1 轮试跑反向暴露 3 硬伤
**抽象教训**: 「默认派 subagent」≠「无条件接管对话」—— subagent 系统 prompt ≠ 主会话 CLAUDE.md,caveman / 反问 / TodoWrite / AskUserQuestion 在子 agent 侧都可能掉,硬切=盲切;**正模式 = 混合(主会话做前台、主人显式声明才派单)**
**反模式**:
- 把"默认派 subagent"读成"每轮硬派",忽略主会话规则归属冲突
- 不派试跑就拍硬切,直接吃工具阉割 + 反问坏
- 子 agent 输出交给主人,无 4 件套证据链 + 无 EVAL

**正模式(SOP,2026-07-14 主人拍板 A 案)**:

1. **触发关键词**(任一即派):主人说"派 plan / 调 workflow-plan / 拆这个 / 走计划流程";或任务复杂度 ≥2 子任务(多模块 / 跨栈 / 涉及派 expert)
2. **不派**(主会话直答):寒暄 / 单行 vault grep / 一句话解释 / 单文件 ±5 行改 / 工具怎么用
3. **反问通道**:**主会话承担**(AskUserQuestion / TodoWrite 主会话可用)→ caveman + grill-me 不丢
4. **派单 prompt 注入**(4 件套):
   - 契约指针 `coordination-contract-owner.md` 绝对路径
   - caveman 风格指令(中文 + 短句 + 无废话)
   - 4 件套证据链硬要求(原话/触发/验证/可实现)
   - 本会话 MEMORY.md 关键点(domain overview / 跨模块检查 / 端口 v2=4212 v3=4213 / 路径一律绝对)

**📎 证据链**:
- 主人原话(2026-07-14):"我希望你默认用 workflow-plan 这个智能体和我进行对话"——明确要求默认派
- 主人二次拍板:A 案"混合 + 主人显式声明"
- 触发可复现:派 1 轮 `Agent` subagent_type=workflow-plan,带上述 4 件套 prompt;它反回 3 冲突 + 3 选项 + 5 反问 → 主会话据此反向汇报 + 推第 4 方案(混合)
- 验证方式:本会话「拒硬切 X/Y/Z、推混合 A」完整跑完,主人选 A 后落地
- 可实现性:`read_file Thinkpad/22-entities-实体档案/agent-经验库/orchestrator-experiences.md` 主人随时对账;后续对话主人说"派 plan"即触发
- 工具阉割事实:本会话 deferred(TodoWrite / AskUserQuestion)未加载给主会话,但子 agent 侧 TodoWrite 也缺、AskUserQuestion 也缺 → 双侧都让 AskUserQuestion 走主会话保险

**适用**: orchestrator-only
**复用计数**: 0
**状态**: 🟡 待验证(下一次主人说"派 plan"时实战验证)

---

## [2026-07-08] 🤝 协作 — 默认走"Qoder 专家团模式"工作流(3 契约)

**能力维度**: 🤝 协作 / 🛡 边界
**触发**: 主人明确要求小马按 Qoder 专家团模式协作(多 expert + orchestrator 调度 + EVAL 自评)
**抽象教训**: Orchestrator 接需求后,默认按 3 契约推进;不静默、不替主拍、不擅补
**反模式**:

- 派单过程静默(主人看不到进度)
- 把跨栈通用经验写到某个 expert 文件(归属错)
- 主动给 18 个空架 expert 补"默认经验"刷库(主人没让)
  **正模式(3 契约)**:

1. **首动作契约**:接需求 → 小马说"这单 X 领域,派 Y expert" → 派单带 4 件套(读经验库/读 wiki/查+验/EVAL)→ 干完 EVAL 报告。**默认走,不需要主人下令**
2. **归因契约**:主人纠正时 → 跨栈可复用的写 `shared-experiences.md`;只跟某栈有关写对应 expert 文件。**默认走,不需要主人下令**
3. **补库契约**:18 个空架 expert 文件,主人没下令不主动补;主人问"要不要补"才补。**默认停,等主人说**
   **📎 证据链**:

- 主人原话(2026-07-08):"你知道qoder有个专家团模式么,我希望你能做到这样" — 明确要求按 Qoder 模式工作
- 触发可复现:Qoder 文档原话"5 类核心 AI 角色:调研员/后端/前端/测试/代码评审员",映射到主人 21 个 expert 是 Qoder 思路的扩展实现
- 验证方式:本次会话所有派单均按"接单→报告领域→带 4 件套→EVAL"执行,不再静默
- "补库契约"已验证 1 次:2026-07-09 主人口径"补到什么程度主人说,小马拍掌" → 小马停手不主动补
- 可实现性:`read_file Thinkpad/22-entities-实体档案/agent-经验库/orchestrator-experiences.md` 主人随时可对账
  **适用**: orchestrator-only
  **复用计数**: 1
  **状态**: 🟡 待验证

---

## [2026-07-09] 🤝 协作 — 多 agent 合并 SOP 的"4 段模板"(目标清单 + 迁移表 + 新模板 + Phase 排序)

**能力维度**: 🤝 协作 / 📝 表达
**触发**: 派单"出 agent 精简合并 SOP"任务,目标 D(19 → 8 砍 11,4 新 agent),需把"砍清单 + 迁移表 + 新 agent 设计 + 执行流程"4 件事塞进 1 份主人 5-10 分钟可读的文档
**抽象教训**: 多 agent 合并 SOP 的标准结构 = **§1 目标清单(每份接谁)** + **§2 内容迁移表(行=旧 agent,列=独有段+工具集)** + **§3 N 份新 agent 模板(frontmatter+body)** + **§4 4 步执行流程(0/审/拍标注)** + **§5 协同约束(Phase 排序)** + **§6 冲突预判(双引/别名/边界)**;**§2 迁移表是核心**,每行必落实"独有段 + 工具集"双列,空缺 = 经验丢失
**反模式**:

- 直接列"砍哪些"不写"独有内容迁哪里" → 主人审 SOP 时无法判断"砍 X 会丢什么"
- 写"SOP 流程"省略"跟其他 SOP 的 Phase 排序" → 双 SOP 重复劳动(本任务就是避免方案 2 重抽 11 砍共享)
- N 份新 agent 只写 frontmatter 不写 body 模板 → 主人审时无法判断"独有段真的接住了"
  **正模式**: §1-9 标准 SOP,9 节齐 + 反转工具附录 + 试水建议第一份先跑;Phase 排序必独立成节(避免双 SOP 叠加浪费)
  **📎 证据链**:
- 触发可复现:本次任务 owner = workflow-orchestrator,生成了 660 行 SOP,内含 9 节标准结构
- 验证方式:同模式复用 1 次(2026-07-09 精简方案 D 4 套方案对比)
- 可实现性:任何"砍 N 个 agent / 合并 M 个 agent / 改 agent 名字"任务都套此模板
  **适用**: orchestrator-only
  **复用计数**: 2(经验库合并 SOP + 精简方案 D SOP)
  **状态**: 🟡 待验证

---

## [2026-07-09] 🤝 协作 — 合并多 agent 时,主入口 = "VS Code 唯一能调子 agent 的入口"判据

**能力维度**: 🤝 协作 / 🛡 边界
**触发**: 主人口径"工作流和计划的合并一个",小马内部先推"workflow 是主入口(被用得多)"——主人 freeText 纠正"VS Code 说只有 plan 模式才能调用子 agent",反转了判断
**抽象教训**: 合并 2 份 agent 选主入口时,**判据不是"被用得多"**,而是"VS Code 唯一能调子 agent 的入口"(Plan 模式专属);`agents:` 列表长 ≠ 主入口,要看**主入口是 VS Code 直接选**还是**被其他 agent handoff**
**反模式**:

- 凭"被用得多"判主入口(workflow-orchestrator 在别处被调 ≠ VS Code 主入口)
- 不读 freeText 关键事实("Plan 模式唯一能调子 agent")
- 合并前不查"两个 agent 在 VS Code 里如何被启动"(`target: vscode` / `name:` / `handoffs:` 是关键)
  **正模式**:

1. **判主入口**:看 `target:` 字段(plan-orchestrator = `target: vscode` = VS Code Plan 模式入口;workflow-orchestrator 无 `target` = 普通 agent)
2. **判能力覆盖**:删的 agent 派单能力是否被保留方涵盖(plan-orchestrator 阶段 4 Dispatch 已涵盖 workflow 派单)
3. **判 handoff 链**:删的 agent 是否被其他 agent handoff 引用(plan-orchestrator 的 2 个 handoff 指向 workflow,但 plan 自身有阶段 4 派单,可自给自足)
4. **内容 100% 合并**:砍 agent 前,3 段核心(自我进化机制 / 行为约束 / 修改边界)必搬到保留方
   **📎 证据链**:

- 主人原话:"VS Code 说只有 plan 模式才能调用子 agent,你审查一下这两个,看看怎么样能让最后决定的能调用子 agent" — VS Code 机制是 Plan 模式专属调子 agent
- 验证方式:`grep -l "target: vscode" .github/agents/` 当前应为 1(只有 plan-orchestrator)
- 现场状态:workflow-orchestrator 已物理删,plan-orchestrator 的 `target: vscode` + 19 专家 agents 列表 + 2 handoff 按钮 = 完整主入口
- 派单能力 100% 继承:plan 阶段 4 Dispatch 含路由决策树(后端→java-backend-expert / 前端→vue3-expert / 测试→对应 expert)
- 可实现性:同模式用于未来"合并 X + Y agent"任务,直接套此 3 段判据
  **适用**: orchestrator-only
  **复用计数**: 1(本次首次)
  **状态**: 🟡 待验证

---

## [2026-07-09] 🤝 协作 — 精简方案 D 收工检查(主入口双反转 + 数学一致 + PowerShell 砍文件必从 SOP 生成)

**能力维度**: 🤝 协作 / 🛡 边界
**触发**: 主人 2026-07-09 拍"b"(信小马,直接开干精简方案 D) + 23:55 二次拍"java-backend-expert 也移 archive",全程 19 → 8 → 7 份 agent 落地
**抽象教训**: 精简方案 D 类"砍/合 agent"任务,3 个核心动作缺一不可:

1. **主入口双反转判据** = 不是"被用得多",是"VS Code 唯一能调子 agent 的入口"(plan-orchestrator,不是 workflow-orchestrator);agent `target: vscode` 字段是金标
2. **数学一致 = 物理总数对得上** = 主目录 + archive = 现场总数(7+16=23),不是"4+4=8"对得上就够;每次修订必重算
3. **PowerShell 砍文件数组必从 SOP §2 表生成** = 不手敲数组(小马漏 4 份因为手敲 `$toArchive` 数组没从 SOP 生成);执行前必 1 步"按 SOP §2 砍列表 grep 自动生成"

**反模式**:

- 凭"被用得多"判主入口(workflow 之前在别处被调 ≠ VS Code Plan 模式主入口)
- 砍 agent 前不查 `target:` / `handoffs:` 字段(漏 handoff 链引用 → 点按钮报错)
- 拍板后直接执行 PowerShell 数组,没从 SOP §2 表生成(漏 4 份)
- 主人实时推翻 SOP 不警觉(主人口径"java-backend 也要砍"是二次调整)
  **正模式**:

1. **合并 2 份 agent 前必先 3 段判据**:主入口(target vscode)/ 能力覆盖(派单能力是否被对方涵盖)/ handoff 链(被其他 agent 引用)
2. **执行前 1 步 SOP §2 砍列表 grep**:`grep "^| [0-9] " agent-精简合并-SOP-方案D.md | grep "🗑️" | awk -F'`' '{print $2}'` → PowerShell 数组自动生成
3. **改 `agents:` 列表是软约束**:列了能调,不列不一定不能调(但 UI 显眼度有差,主入口 `agents:` 列满了反而看不清)
4. **改 1 处动 N 处同步**:主入口反转影响 agents: / description / 路由决策树 / handoff / 收下子入口 4 处必全改
   **📎 证据链**:

- 触发可复现:本次任务 owner = workflow-orchestrator,出 660 行 SOP 方案 D,执行时主入口从 workflow 反转到 plan-orchestrator(主人口径 VS Code 机制)+ java-backend-expert 二次调整(主人口径"也移")
- 数学一致验证:7(主目录)+ 16(archive)= 23(物理总数)= 原 19 - workflow 1 + 4 新 + 1 java = 23 ✓
- 同模式可复现 1 次:本次 23:55 主人拍"java-backend 也移",完全套此 3 段判据
- 可实现性:任何"砍 N 个 / 合 M 个 agent"任务必走此 3 段判据 + 1 步 SOP §2 砍列表生成
  **适用**: orchestrator-only
  **复用计数**: 1(本次首次)
  **状态**: 🟡 待验证

---

## [2026-07-09] 🔧 实现 — cron 落盘 3 坑(schtasks /Run 退出码 0 + Task To Run 路径核对 + SYSTEM 子进程 PATH 注入)

**能力维度**: 🔧 实现 / 🛡 边界
**触发**: 主人想"每 5h 自动从网上拉技术研究 → 落 Thinkpad"——封盘走 Windows schtasks + Node 脚本,结果 3 次失败 1 次才通
**抽象教训**: Windows schtasks + Node 脚本做无人值守 cron,3 个隐藏坑必在派单时同步给子 agent:

1. **`schtasks /Run` 退出码 0 ≠ 任务跑了** — 必须 `schtasks /Query /V /FO LIST` 查 `Last Result` 字段(267011=SCHED_S_TASK_HAS_NOT_RUN,才是真相)
2. **`schtasks /Create` 创建后必查 `Task To Run` 字段** — PowerShell `-Argument` 路径含空格/反斜杠会被截断或转义错,导致记的路径变成不存在文件(主人 2026-07-09 现场:`-Argument "node run-research-batch.mjs"` → Task To Run 变成 `research-cron.mjs`,Last Result=267011)
3. **SYSTEM 账号 PATH 最小,不包含 user-local bin** — `C:\Users\RUHAI\.local\bin\`(agent-reach / pip user install)/ `C:\Program Files\GitHub CLI\`(gh CLI)等路径需脚本层手动 `spawn(cmd, args, { env: { ...process.env, PATH: USER_BIN_PATHS.join(';') + ';' + process.env.PATH } })` 注入;不然 spawn 返 ENOENT

**反模式**:

- 只看 `schtasks /Run` 退出码不看 `Last Result`(主人 2026-07-09 第一次以为成功了,实际从未跑)
- 用 PowerShell `Start-Process` + `-Argument` 配 schtasks(转义不可靠,转 cmd 简洁版 `schtasks /Create /TR "node.exe <绝对路径>"`)
- 凭"主人在 pwsh 跑通了"推断 SYSTEM 跑通(SYSTEM 凭据/PATH/config 都跟 user 隔离)
- doctor 健全性检查只看"通道数 > 0",不验关键 CLI 路径(SYSTEM 找不到二进制也算"通道已注册")
  **正模式**:

1. **`schtasks /Create` 后**:`schtasks /Query /V /FO LIST | grep "Task To Run"` 人工核对路径
2. **`schtasks /Run` 后**:`Start-Sleep N` + `schtasks /Query /V /FO LIST | grep "Last Result"` 验真
3. **spawn PATH 注入**:`USER_BIN_PATHS = ['C:\\Users\\RUHAI\\.local\\bin', 'C:\\Program Files\\GitHub CLI']` + `buildEnv()` 函数返回的 env 传给所有 `spawn` 调用;同时 `loadDoctor()` 返 0 通道时直接 throw(避免静默 0 任务)
4. **三件套验收**:`schtasks /Run` 退出码 + `Last Result` + 实际产物目录(`Get-ChildItem <落盘目录>`)三者一致才算通
   **📎 证据链**:

- 触发可复现:主人 2026-07-09 当日,从"能做个定时任务么"→ 落盘 7 文件 → 3 次失败 → PATH 注入 + 路径修正后 Last Result=0
- `Last Result=267011`:主人原话"没有新文件" → 查 `Task To Run` 字段发现路径错;改 cmd 简洁版重建后 Last Result=0
- `spawn agent-reach ENOENT`:主人 3 cmd `where` 输出锁定 `agent-reach=C:\Users\RUHAI\.local\bin\` → 加 USER_BIN_PATHS → doctor 13 通道
- 三件套同验:`2026-07-09-555024.log` 显示 Last Result=0 + doctor 13 通道 + 产物目录 0 .md(下一步要解决 gh 凭据问题,见下条)
- 可实现性:任何"Windows 无人值守定时任务 + 系统级 CLI"任务必带此 3 坑同步给子 agent
  **适用**: orchestrator-only(可下沉到 shared-experiences.md 给 backend-expert / research-expert 复用,本轮先归 orchestrator)
  **复用计数**: 1(本次首次)
  **状态**: 🟡 待验证

---

## [2026-07-09] 🔧 实现 — 派单系统级 CLI 子任务前,先验凭据/账号/PATH 三件套隔离

**能力维度**: 🔧 实现 / 🛡 边界
**触发**: 主人 2026-07-09 最终拍"先走 github 吧"——小马改完主入口跑 schtasks /Run,Last Result=0 但 0 产物;查 log 发现 `gh 退出码 4: To get started with GitHub CLI, please run: gh auth login`
**抽象教训**: 派子任务前,如果涉及"系统级 CLI 无人值守执行"(gh / aws / gcloud / az / gh auth 之类),必先派 Explore 验 3 件隔离:**凭据隔离**(`%USERPROFILE%\.config\gh` 在 SYSTEM 下不存在 = gh 走匿名失败)/ **账号隔离**(SYSTEM 跑 vs user 跑 token 缓存目录不同)/ **PATH 隔离**(上条已说)
**反模式**:

- 凭"主人在 pwsh 跑通了"(同一台机,但 SYSTEM 账号隔离)推断 SYSTEM 也能跑
- doctor 标 `status=ok` 就放过(doctor 只看配置,不实际试跑;gh auth 缺失 doctor 也可能标 ok)
- 派单前不验"无人值守态"=手工态,直接改 cron 脚本
- gh API 错误码 4 当成"网络问题"重试,实际是 auth 缺失
  **正模式**:

1. **派单前用 `runas /user:SYSTEM cmd` 或 `psexec -s -i cmd` 模拟 SYSTEM 跑**:验 `where gh` / `gh auth status` / `gh search repos --limit 1` 三个命令
2. **凭据方案三选一**:
   - (a) `schtasks /Create /RU SYSTEM /RP ""` 改 Run As User 为主人 user(凭据跟着 user 走,缺点:机器重启若 user 不自动登录就挂)
   - (b) `GH_TOKEN=<PAT>` 环境变量塞 schtasks(`/Set /TN ... /TR "set GH_TOKEN=xxx && node ..."`)— 经典做法,推荐
   - (c) 改用匿名 API(gh `search repos` 部分端点无需 auth,但有 60/h rate limit;够 cron 5h 一次)
3. **fallback 设计**:主流程拿 0 命中不报错(软上限 0 = 退出码 0 + log 写"cron-counter: 0 → 0"),而不是 panic — 避免空轮刷屏
   **📎 证据链**:

- 触发可复现:`2026-07-09-555024.log` Last Result=0 + `[ERR] github / "frontend Vue React": gh 退出码 4: ... gh auth login` + 0 落盘
- 主人在 pwsh `node --dry-run` 能拿到 5 条(SYSTEM vs user 凭据隔离实证)
- 解法选型:`GH_TOKEN` 环境变量法(crontab 经典,稳定,rate limit 5000/h)优于改 Run As User(机器重启风险)优于纯匿名(60/h 限制紧)
- 验证:`schtasks /Set /TN "rhProject-research-cron" /TR "set GH_TOKEN=xxx&& node E:\...\run-research-batch.mjs"` 后 `/Run` + 45s + `Get-ChildItem <10-raw/articles/2026-07-09>` 应有 .md
- 可实现性:任何"Windows 无人值守 + 系统级 CLI(gh/aws/gcloud/az/docker login/...)"任务必走此三件隔离预检
  **适用**: orchestrator-only(可下沉到 shared-experiences.md 给所有涉及无人值守 CLI 的 expert)
  **复用计数**: 1(本次首次)
  **状态**: 🟡 待验证

---

## [2026-07-09] 🛡 边界 — 跨栈经验归属 unclear 时,先归 orchestrator(决策点),不抢下沉到 shared

**能力维度**: 🛡 边界 / 🤝 协作
**触发**: 本轮 cron 3 坑 — schtasks 是 Windows 平台知识(跨栈应给 shared-experiences.md?)/ gh 凭据隔离是 backend/research 通识(应下沉?)/ PATH 注入是 Node spawn 通识(应下沉?)。3 条经验归属 unclear
**抽象教训**: 跨栈经验归属 unclear 时,**先归 orchestrator**(决策点);等沉淀 ≥2 个独立场景复用后,再下沉到 `shared-experiences.md`。判据:

- orchestrator-only = 派单策略 / 跨 agent 协调 / 风险拦截 / 能力教训
- shared = ≥2 个栈可复用 + 不绑特定任务
  **反模式**:
- 一有新经验就下沉到 shared(稀释,别人读不到关键决策)
- 一有新经验就归 orchestrator(膨胀,重复)
- 凭"看着通用"下沉 — 没用 ≥2 次不算通用
  **正模式**:

1. **新经验先放 orchestrator-experiences.md**(当前文件)
2. **观察 ≥2 个独立任务复用** 才下沉到 shared-experiences.md
3. **下沉时标注"由 <任务> 上报,orchestrator 同步"**(沿用 2026-07-08 多 agent 合并 SOP 第 4 条)
   **📎 证据链**:

- 本轮 cron 3 坑:已归 orchestrator(决策点)/ 沉淀 1 次,等下次"Windows + 无人值守"任务再评估下沉
- shared-experiences.md 当前 5 条,全 ≥2 次复用 — 沿用此门槛
- 可实现性:任何"新经验归属 unclear"任务走此 3 步(归 orchestrator → 观察 ≥2 次 → 评估下沉)
  **适用**: orchestrator-only
  **复用计数**: 1(本次首次)
  **状态**: 🟡 待验证

---

## [2026-07-09] 🔧 实现 — schtasks 第 4 坑:/Set 不存在,改 /TR 必须删 + 建(不是改)

**能力维度**: 🔧 实现 / 🛡 边界
**触发**: 主人 2026-07-09 想给现有 schtasks 任务加 GH_TOKEN,小马推 /Set /TR ...,主人跑报 ERROR: Invalid argument/option - '/Set'。查文档 schtasks 没有 /Set,只有 /Change,但 /Change 只支持 /ENABLE / /DISABLE / /RU / /RP 等字段,**改不了 /TR**
**抽象教训**: Windows schtasks 修改已存在任务的 /TR(Task To Run),**必须 /Delete + /Create**,没有 in-place 改 /TR 的命令。流程:

1. schtasks /Delete /TN "<task>" /F
2. schtasks /Create /TN "<task>" /TR "<new TR>" ...(其他参数照抄 /Query 出来的)

**反模式**:

- 凭 Unix/Linux 习惯用 /Set 改 cron 命令(Windows schtasks 没这命令)
- 用 /Change /TR ...(报错"参数无效")
- 删了不重建(下一次 cron 自动跑就跳过了)

**正模式**:

1. **改 /TR 前先 /Query /V /FO LIST > /tmp/task-backup.txt** — 完整备份当前配置
2. **/Delete /F + /Create 重建** — /Create 用回原 XML 里的所有字段(Run As User / Schedule Type / Start Time / Days of Week 等)
3. **重建后 /Query /V /FO LIST | grep "Task To Run" 核对** — 同上一条经验第 2 步
4. **凭据外置**:GH_TOKEN 不要硬编进 /TR,用 wrapper .bat/.ps1 读 C:\secrets\gh-token.txt 或环境变量,任务定义保持纯净
   **📎 证据链**:

- 触发可复现:主人 2026-07-09 截图 ERROR: Invalid argument/option - '/Set'. Type "SCHTASKS /QUERY /?" for usage.
- 文档依据:schtasks /? 命令列表只 /Change(不含 /Set);schtasks /Change /? 列出可改字段,无 /TR
- 正确流程:schtasks /Delete /TN "rhProject-research-cron" /F → schtasks /Create /TN "rhProject-research-cron" /TR "cmd /c set GH_TOKEN=...&& node ..." /SC HOURLY /MO 5 /ST 00:00 /RU SYSTEM /F
- 可实现性:任何"改 schtasks 任务命令行"任务走此 3 步(备份 → 删 → 建),不依赖 /Set
  **适用**: orchestrator-only
  **复用计数**: 1(本次首次)
  **状态**: 🟡 待验证

---

## [2026-07-09] 🔧 实现 — 抓取/消化双落空是 3 种不同的"空",要分别诊断

**能力维度**: 🔧 实现 / 🛡 边界
**触发**: 主人 2026-07-09 看首批 8 个 cron 产物反馈"内容只有 URL,20-concepts 质量低"。现场查 3 个不同位置的"空",根因各不相同
**抽象教训**: cron/research 类任务产物"空"有 3 种独立根因,**必须分层诊断**:

1. **数据没抓** = searchOne 返空或报错。日志里 [ERR] xxx: ... 是真信号
2. **抓到了但落盘模板** = ody: it.snippet || "(无摘要)" 这种 fallback 把空字段当数据写进去。读产物 .md 直接看到 (无摘要) 字符串
3. **落盘了但模板套娃** = 20-concepts 永远只写 ## 来源 / ## 摘要(待补) / ## 行动项 模板,真实信息没填。读产物 .md 看 body 段是不是"有占位符 + 没数据"

本轮根因(主人反馈"质量低"后 3 次返工才全通):

- **第 1 次根因(数据没抓 README)**:gh search repos --json 只返 metadata(description/stars/url),没 README。修:加 etchReadme() 单独 gh api repos/{owner}/{repo}/readme 拿 base64 + 截 1500 字符
- **第 2 次根因(gh 字段名错)**:gh search repos --json primaryLanguage,repositoryTopics 报错"Unknown JSON field"——这些字段是
  epos/{id} 端点的,不是 search 端点。修:用合法字段
  ame,description,url,stargazersCount,language,fullName;topics 从 README #hashtag 扫
- **第 3 次根因(tags "(无)" 进 YAML + slug 截 word 切一半)**: ags: [..., "(无)"] 丑 + mircro-frontend 切 word 错。修:renderMarkdown 过滤 "(无)"/"(无 topics)"/"unknown";slugify 按 - 切 word 累加到 30 字符

**反模式**:

- 看 Last Result=0 就放过 — **Last Result=0 不代表产物合格**,只代表脚本退出码 0
- "schema 落得对就完事" — schema/frontmatter 对了但 body 是占位符,等于白落
- ody: it.snippet || "(无摘要)" — 把空当数据写,主人看到就是"(无摘要)"三个字,无意义
- 模板套娃(## 摘要\n\n\n)— summary 本来就是空,(待补) 是隐式承认没做
- 凭"我代码看起来对"就放过 — 必读产物 1-2 份核真内容

**正模式(三件套必查)**:

1. **数据**:log 里 [OK] xxx / "query": N 条 N > 0
2. **落盘**:Get-ChildItem 数 .md 数 = 落盘数
3. **内容质量**:随机抽 1 份 .md 读 body 段 — 必含**真信息**(description 一句 / README 800 字符 / 语言规模),不是占位符

**📎 证据链**:

- 主人 2026-07-09 原话:"为什么内容只有来源url,再20中的内容质量很低,你自己检查一下"
- 三次返工日志:680182.log(gh 字段错)/809255.log(通)/943536.log(干净)
- 产物对比:第 1 批 (无摘要) 3 行 → 第 4 批 description 1 句 + README 800 字符 + 行动项
- 可实现性:任何"cron 拉数据 → 落盘 → 主人阅读"任务必走 3 件套(数据/落盘/内容),不能只看退出码
  **适用**: orchestrator-only(可下沉到 research-expert / backend-expert 任何"自动入库"任务)
  **复用计数**: 1(本次首次)
  **状态**: 🟡 待验证

---

## [2026-07-10] 🛡 边界 — 产物结构(目录/文件名/单档多档)听主人的,不是工程师的

**能力维度**: 🛡 边界 / 🔧 实现
**触发**: 主人 2026-07-10 看了首批 cron 产物反馈 3 件事:

1. 每天 1 文件夹太散 — 要"时间段文件夹"
2. 20-concepts 每 repo 1 文件太多 — 要"1 段时间 1 文件"
3. 内容要中文

小马第一版按"每天 1 文件夹 + 每 repo 1 文件 + 英文"做,看着技术合理,主人看了起反感
**抽象教训**: **自动入库类任务的产物结构,听主人的阅读习惯,不听工程师的"应该这样组织"**。技术合理性(每天 1 目录方便 grep / 每 repo 1 文件方便追踪)跟主人阅读习惯(一段时间聚合看 1 个主档)冲突时,**主人习惯赢**。

具体决策树(2026-07-10 拍板):
| 维度 | 工程师惯性 | 主人习惯 | 修法 |
|------|-----------|---------|------|
| 时间粒度 | 每天 1 目录(简单) | 5h 槽(00/05/10/15/20)1 段时间 1 目录 | slotDir() 函数,文件名加 -HH |
| 20-concepts 文件数 | 每 repo 1 .md(易追踪) | **1 段时间 1 主档**(append,可跳转) | ppendFile() 单文件,带"本段时间总表" |
| 内容语言 | 全英文 | **中文 + 英文原文 + 中英对照** | 关键术语查表(ZH_TERMS 100+ 条)+ 中文占位让主人手填 |
| 中文来源 | 调 LLM 翻译(加 key 复杂度) | **不调 LLM,加术语对照 + 5 分钟手填** | extractTermsZh() 查表,zhFallback() 留占位 |

**反模式**:

- "技术上看,每天 1 目录合理" — 主人的脑容量 5 个 5h 槽 = 5 份/天,5 个/天 × N 天 = 心智负担
- "每 repo 1 文件方便追踪" — 主人 5 分钟看 1 段时间全部内容,不要 19 个文件
- "调 LLM 翻译" — 加 API key + 增 cron 依赖 + 月费,不值得;**查术语表 + 主人 5 分钟填** 比 LLM 翻译更适合"主人参与的 research"
- "全自动" — **半自动(机器抓 + 主人消化)才是 vault 类工具的正确形态**

**正模式**:

1. **派单前问"产物结构"**:时间粒度 / 文件数 / 内容语言 / 自动化程度 4 维必问
2. **3 维反问选项弹 vscode_askQuestions**:
   - 时间粒度:5h 槽 / 上下晚 / 每天
   - 文件数:1 段 1 主档 / 1 段 1 主档+分页 / 拼接
   - 中文来源:原文+中文脚注(推荐) / 调 LLM / 仅译 description
3. **每项必带 ✨ 推荐** — 让主人 30 秒拍
4. **改完 dry-run → 跑 → 读 1 份产物核真内容** — 三件套核

**📎 证据链**:

- 主人 2026-07-10 原话(3 条):"加上时间段文件夹" + "消化后的笔记是需要中文的笔记" + "一个时间段一个文件,而不是每个调研的都是一个"
- 主档 2026-07-10-00.md 19 节 append,每节含 1 句话(中)/(英)/术语对照/README/行动项
- 关键术语表 ZH_TERMS 100+ 条(框架/库/工作流/部署/认证/性能…)
- 产物对比:第 1 版每 repo 1 文件 8 个 → 新版 1 段时间 1 主档 1 个,主人心智负担 -8x
- 可实现性:任何"自动入库 / cron 落盘 / 抓取类"任务,派单前必走 4 维反问,不替主拍
  **适用**: orchestrator-only
  **复用计数**: 1(本次首次)
  **状态**: 🟡 待验证

---

## [2026-07-10] 🔧 实现 — 主人要"总结"不是"翻译":抽 README 好句 + 类型模板,不要半吊子中英混读

**能力维度**: 🔧 实现 / 🛡 边界
**触发**: 主人 2026-07-10 看了第 2 版中文(我做的"中英对照"版)反馈"翻译了和没翻译差不多,我需要你读一下这个仓库的 readme 然后总结一下"。截图红框标的就是"ChainGraph is a source available, type-safe flow-based programming 框架 for building 人工智能大语言模型 agents with complex l..." — 半中半英,主人看不懂
**抽象教训**: **"翻译"和"总结"是 2 件事,产物质量天差地别**。翻译 = 字符一对一映射(英文 hello → 中文 你好,信息量不变);总结 = 读完 1500 字符 README 后,**重新组织成 1 句话**(类型 + 做什么 + 适用),信息密度更高,字数更少

自动入库类任务的"中文产物"实现路径:

1. ❌ 字符翻译(is a curated list → "是一个精选清单",保留原句所有 token)— 啰嗦,主人生厌
2. ❌ 中英对照(is a curated(精选) list(清单) of → 保留原 token + 括号注)— 啰嗦,主人生厌(本轮红框证据)
3. ❌ 调 LLM 翻译 — 加 key + 钱 + cron 依赖,主人 2026-07-10 否了
4. ✅ **类型模板 + 抽好句**:用 description 锁"类型"(20 模板),从 README 抽"做什么"句(过滤 markdown 烂结构 + 价值动词排序),全部中文表达,专有名词 ChainGraph 用括号注(ChainGraph(框架))

关键过滤(避免抽到烂句):

- markdown 列表 - item / \* item / > blockquote / [link] / <html> — 全 filter 掉
- 太短(< 50 字符)/ 太长(> 320 字符) — 滤
- 句子权重排序:有 provides/offers/ships/comes/includes/features/lets/empowers/helps/enables 排前,有 is/are 配 or/designed/built 排中

**反模式**:

- "翻译" 框中 = 主人生厌(本轮红框证据)
- 写 zhSummary 不知道 README 上下文,只读 description 一句 — 总结质量差
- README 第 1 句往往是项目标题(ChainGraph v2),不是描述 — 必须用"价值动词"排序过滤
- 翻译版本号(v1/v2/alpha/beta) — 应保留原文
- 中英对照堆在一行(xxx(精选) yyy(清单))— 看着累

**正模式(三件套)**:

1. **类型模板**(20 条 is/are/for/companion/... 命中) → 锁"是什么"
2. **README 价值句抽取**(过滤 markdown 烂结构 + 价值动词排序) → 锁"做什么"
3. **专有名词括号注**(ChainGraph(框架) / LangGraph(LLM 编排框架)) → 主人一眼能读

**📎 证据链**:

- 主人 2026-07-10 原话:"这翻译了和没翻译差不多,我不需要你翻译,我需要你读一下这个仓库的 readme 然后总结一下"
- 截图红框:ChainGraph is a source available, type-safe flow-based programming 框架 for building 人工智能大语言模型 agents with complex l... — 烂产物
- 第 3 版:是一个开发框架/库。做什么:Each port is defined with... + 5 条主档 4/5 命中类型模板
- 落地函数 zhSummary(description, readme_excerpt, repoName) ~80 行
- 可实现性:任何"自动入库 + 主人要中文"任务用此 3 件套(类型模板 + 价值句抽 + 括号注)
  **适用**: orchestrator-only
  **复用计数**: 1(本次首次)
  **状态**: 🟡 待验证
