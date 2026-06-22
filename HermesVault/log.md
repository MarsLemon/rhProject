---
color: var(--mk-color-pink)
---
# Wiki Log

> Append-only. 每一行是一次改动。
> 超过 500 条 → 滚动到 `log-YYYY.md`。
> 格式: `## [YYYY-MM-DD] action | subject`

## [2026-06-18] create | Wiki 骨架初始化

- **结构**: 建立 `10-raw-原始材料/{articles,papers,transcripts,assets}` + `22-entities-实体档案/` + `20-concepts-已消化笔记/` + `30-comparisons-对比/` + `31-queries-查询归档/` + `40-_meta-归档索引/`
- **.obsidian/**: app.json(基本显示)+ appearance.json(字号/主题) + file-locations.json(附件归 `10-raw-原始材料/assets/`)
- **.gitignore**: 屏蔽 Obsidian workspace/cache 状态,但保留 `app.json` / `appearance.json` / `file-locations.json` 跨机器同步
- **文档**: SCHEMA.md / index.md / log.md / 8件套插件说明.md / dataview示例.md
- **位置**: `E:\rhProject\HermesVault\`
- **方案**: 走 `llm-wiki` skill(Karpathy 模式) + Obsidian 作为渲染/编辑 UI
- **来源**: 主人拍板 (1-b + 2-b + 3-b + vault 放 rhProject)

## [2026-06-18] upgrade | 主人接通 Obsidian + 8 件套

- **Obsidian 安装**: Windows 版,选 Local vault,路径 `E:\rhProject\HermesVault`(误装到上一级后清理,无残留)
- **第三方插件 8/8 装齐**: dataview / obsidian-excalidraw-plugin / templater-obsidian / calendar / quickadd / obsidian-tasks-plugin / obsidian-kanban / obsidian-mind-map
- **核心插件**: core-plugins.json 全开(bases / canvas / daily-notes / templates / graph 等)
- **Dataview 调试**: index.md 末尾加 `\`\`\`dataview` 代码块,刷新 + Reading 模式后主人确认表格可见 ✅
- **清理**: rhProject 根目录 `未命名.base` / `未命名.canvas` 已删,无残留
- **最终状态**: 14MB / 9 个 markdown / 8 个插件 / 0 错误 / git status 干净
- **总耗时**: ~30 分钟(搭骨架 5min + 主人装 Obsidian+插件 15min + 调试 10min)

## [2026-06-18] merge | 废弃 .obsidian-vault/ 统一到 HermesVault

- **触发**: 主人感觉 rhProject 根目录"乱",要求整理工作空间 + 评估 `skills/` 项目
- **决策**: A 方案(主人拍板)—— 废弃昨天另起的 `.obsidian-vault/`,统一用 `HermesVault/`
- **理由**:
  - `HermesVault/` 已有完整 SCHEMA 规约(Karpathy 模式 LLM Wiki),按 entity/concept/comparison/query/_meta 组织
  - 昨天建的 `.obsidian-vault/` 没按 SCHEMA,无 frontmatter,目录简陋
  - 主人"让记忆更长远"的诉求对应的是 HermesVault 不是 .obsidian-vault/
- **执行**:
  - `HermesVault/22-entities-实体档案/INVENTORY.md` 新建(按 SCHEMA 规约,type=entity,带 frontmatter)
  - `HermesVault/23-Tools-工具用法/README.md` 新建(tools 目录索引,占位待补)
  - `HermesVault/index.md` 加入 INVENTORY 链接
  - 待办: 改 .gitignore(去掉 `/.obsidian-vault/`,加 `HermesVault/.obsidian/` 运行时)
  - 待办: 改 Filesystem MCP 路径从 `.obsidian-vault/` → `HermesVault/`
  - 待办: 删 `E:\rhProject\.obsidian-vault\` 空目录
  - 待办: 评估 `skills/` 子项目(结论:保留,跟 wk-... 一类,独立 git 仓库)
- **不动**: `21-fix-plans-修复经验/`(v2 老修复归档) / `research/`(AI 产出物规范指定位置) / `wk-...`(业务子项目)
- **来源**: 主人拍板(A 选项,2026-06-18)

## [2026-06-18] workflow | 立 Hermes × Obsidian × Claude Code SOP

- **触发**: 主人问"以后关于 obsidian 就这么用,可以先头脑风暴一下" + 说"插件都不懂,按我推荐来"
- **决策**: A+D 混搭(轻量 SOP + 先查 vault),跑两周再决定升级
- **新增文档**:
  - `20-concepts-已消化笔记/hermes-obsidian-workflow.md`(4.5 KB,SOP 主体:三角色分工 + 三条主流程 + 启动清单)
- **更新文档**:
  - `SCHEMA.md` 末尾加"工作流 SOP"小节(新文件必走的 8 条分流表)
  - `23-Tools-工具用法/README.md` 顶部加"魔法词"小节(6 句主人→小马指令)
  - `index.md` Concepts 段加 `[[hermes-obsidian-workflow]]` 链接
- **不动**: `llm-wiki.md` / `hermes-skill-system.md` 已涵盖的"读 SCHEMA+index+log / 每页 ≥ 2 wikilink"等不重复
- **启动清单留 2 项待主人拍板**:
  - 流程 1 消化节奏:每天/每周/随叫(默认:随叫 + 周末提醒)
  - 流程 3 是否启用(默认:启用,Claude 修完 bug 默认问"塞不塞 vault")
- **下一步**: 等主人 review 这 4 份改动 + 拍板两个待定项 → 写进此 log 的下一条
- **来源**: 主人拍板(走我推荐,2026-06-18)

## [2026-06-18] workflow | 主人拍板两个待定项(默认都启用)

- **拍板 1(流程 1 消化节奏)**: 选 C = **随叫 + 周末提醒**
  - 周末提醒走 cron(每周日 20:00 列 Inbox 文件数 + 提醒一句话)
- **拍板 2(流程 3 是否启用)**: 选 A = **启用,Claude 修完默认问**
  - 启用后 `claude-code-orchestration` skill 的 prompt 加一句“修完问你塞不塞 vault”
  - 后续需要时可随时调成 B/C(调 hermes prompt 即可,不动代码)
- **更新文档**:
  - `20-concepts-已消化笔记/hermes-obsidian-workflow.md` 启动清单的 2 个 `[ ]` 改为 `[x]`,补上拍板结果
- **待办**(下个 cron 批次跑):
  - 在 `~/.hermes/cron/` 新建 `周末-inbox-提醒.job`(每周日 20:00,只读 Inbox 列表+提醒)
  - 改 `claude-code-orchestration` skill,加 vault 拍板句子
- **来源**: 主人原话“都默认就可以”,2026-06-18

## [2026-06-18] rename | 9 个目录加数字前缀 + 删 logs/Tags 空目录(A+B 方案)

- **触发**: 主人原话“现在的文件夹顺序我看不懂流程是怎么进行的,能改改文件夹名称让我知道哪个是哪个吗”
- **决策**: A+B(直接改 + 加地图)
  - A = 9 个目录重命名加数字前缀
  - B = index.md 顶部加 5 步流程地图
- **重命名映射**:
  - `Inbox` → `00-Inbox`
  - `raw` → `10-raw-原始材料`
  - `concepts` → `20-concepts-已消化笔记`
  - `fix-plans` → `21-fix-plans-修复经验`
  - `entities` → `22-entities-实体档案`
  - `Tools` → `23-Tools-工具用法`
  - `comparisons` → `30-comparisons-对比`
  - `queries` → `31-queries-查询归档`
  - `_meta` → `40-_meta-归档索引`
- **删除空目录**: `logs/` `Tags/`(都为空)
- **wikilink 批量更新**: 15 个 .md 文件,76 处 wikilink 走 python 脚本一次性重写(原 85 处-9 处新名=76 处)
  - 剩余 9 处为 SOP 文档内部举例引用新名(合法)
- **更新文档**:
  - `index.md` 顶部加“🗺️ 看这里(5 步流程图)”小节
  - `SCHEMA.md` 目录树加 21-fix-plans-修复经验 / 23-Tools-工具用法 两行
- **验证**: grep 旧名残留 76 处全部替换完(剩 9 处为合法新名引用)
- **下一步**: 主人重开 Obsidian,随机点 5 个 wikilink 验证不坏
- **坑**: 一次 perl 命令语法挂(嵌套括号未转义),第二论用 python 脚本才成功;以后跨平台批量改文本用 python 更稳
- **来源**: 主人拍板(A+B,2026-06-18)

## [2026-06-18] fix-paths | 修 vault 内 2 处迁移遗留的相对路径

- **触发**: 主人原话"当时迁移 fix-plans 的时候,里面不少引用文件都是不对的,从 rhProject 迁移到 HermesVaultz 中,深入了一层,没有修改"
- **背景**: fix-plans/ 原位置 `E:\rhProject\fix-plans\`,2026-06-18 迁入 `HermesVault\21-fix-plans-修复经验\` 时深入 1 层,所有用 `../xxx` 写的相对路径(原指向 rhProject 根)全部指到 `E:\rhProject\HermesVault\xxx`(不存在的路径),链子全断
- **改动**:
  - `2026-06-15-manual-test-cases.md:271` — `../wk-mhc-mobile/src/pages/smart-training/page/train-center/train-detail.vue` → `E:\rhProject\wk-mhc-mobile\src\pages\smart-training\page\train-center\train-detail.vue`
  - `2026-06-15-verify-test-cases.md:39` — `../scripts/verify-required-removal.py` → `E:\rhProject\scripts\verify-required-removal.py`
- **新规**: 主人原话"可以记住以后都用绝对路径"——记入 memory(参见下方)
- **不动**(故意保留):
  - `0.规约.md` / `README.md` 里的 `E:\rhProject\fix-plans\` 是**历史叙述**(记录"从哪儿迁过来"),改了反而抹掉历史
  - 30+ 处 `E:\rhProject\wk-...\xxx.java` 已经是绝对路径,只是 Windows 风格(本次顺手统一)
  - `file:///e:/rhProject/...` 协议路径浏览器/VSC 能开,不动
  - `../stat-detail` `../PlanUserServiceImplTest` `../admin/stat/...` 经查是**误报**(Java 测试路径里的省略号 `/.../` 和 API 路径 `/api/.../`,不是相对路径)
- **验证**: grep 0 处真相对路径残留(链接形式 + 裸路径形式)
- **影响**: 16 份 fix-plan 中只 2 份有真错,14 份没动
- **memory 更新**: 新增"Obsidian vault / 文档路径引用铁律"(跨工作区/跨子项目一律绝对路径,wikilink 仅限 vault 内部)
- **来源**: 主人拍板(新规 + 默认执行,2026-06-18)

## [2026-06-18] memory-sync | 把 6 条 memory 干货搬进 vault

- **触发**: 主人原话"你的记忆能迁移到 obsidian 中不"
- **决策**: 主人拍板"按照你的建议来"——A(立刻做) + B(挑 2 条干货搬) + 默认询问策略
- **改动**:
  - `SCHEMA.md` 末尾加"Vault 编辑铁律"小节(4 条,源头指向 cheatsheet)
  - `20-concepts-已消化笔记/cron-runtime-resilience.md` 新建(2.4 KB,MiniMax 5h 窗口/限流/429 工艺)
  - `20-concepts-已消化笔记/审计方法论.md` 新建(2.1 KB,os.walk 别靠 git 3 条铁律)
  - `20-concepts-已消化笔记/hermes-internal-cheatsheet.md` 新建(3.7 KB,6 条干货打包 + 4 条"只给小马用"列表 + 同步策略)
  - `index.md` 加 3 个 wikilink + Total pages 38 → 41
- **策略**:
  - **询问策略**(默认) — 以后 add memory 时,小马主动问"要不要搬 vault",**不自动同步**
  - **判断标准** — 干货(半衰期 > 1 年)→ 建议搬;行为模式(影响对话风格)→ 留 memory
  - **现有 6 条**:本份已是 2026-06-18 快照,以后增删查本 log 的 `## [YYYY-MM-DD] memory-sync` 段
- **故意没搬的 4 条**(写在 cheatsheet 末尾的"不在文档"表):
  - 协作风格(列方案+trade-off+等单字符) — 写文档=锁死对话灵活性
  - 微信 vs 桌面边界 — 跟 IDE 实时交互绑死
  - Claude Code 派发约束(workdir+max-turns+CLAUDE.md 摘要) — 是给小马调度时用的
  - "不写 CLAUDE.md"硬约束 — 在 skill 里更合适
- **来源**: 主人拍板("按照你的建议来",2026-06-18)

## [2026-06-18] fix-paths-ii | 修 SCHEMA.md 第 3 条铁律"双 E:" 残留

- **触发**: 上一条 memory-sync 改动时,`SCHEMA.md` 末尾加"Vault 编辑铁律"小节
- **坑 1**:`patch` 工具的 `new_string` 字符串里,我用 `\n` 想表示"换行",实际 JSON 解码后是字面 `\n`(4 字符),不是真换行;文件里多出 1 个字面 `\n`,Sed 显示成"行 141 末 E:\\" + "行 142 头 hProject\\xxx"
- **坑 2**:后续几次 `patch` 工具看着"匹配成功",实际**没改内容**(老字符串含 CRLF 真换行,新字符串不含,工具模糊匹配返回成功但未替换)
- **坑 3**:我自己写的几个 python 临时脚本反复栽在 `\\r` 被当 unicode escape 上,前后 4 次才用 chr() + lambda 彻底绕开
- **修复**: 用 `re.sub` + lambda 包装 new_text(避免 re 模块的 escape 解析),单次正则替换整段"3. **跨工作区..."到"vault 内部"
- **临时脚本**:`40-_meta-归档索引/_fix_*.py` 4 个文件,已在修完后立即删除
- **铁律更新**:
  - patch 工具 new_string 里**禁止写 `\n` / `\r` 等 escape 序列**(会被当字面)
  - 多行替换用 **python `re.sub` + lambda** 或 **sed 单行** 或 **write_file 整文件重写**
  - 临时调试脚本**不落 vault**,用 `/tmp` 或 `scripts/` 或当场删
- **最终验证**:
  - `sed -n 141p SCHEMA.md` → 单行 `3. **跨工作区/跨子项目引用一律绝对路径** — Windows 反斜杠格式如 \`E:\\rhProject\\xxx\`;\`[[wikilink]]\` 只用于 vault 内部` ✅
  - 4 条铁律完整,无换行残留,无重复 `E:`
- **来源**: 自查自纠(2026-06-18)

## [2026-06-18] folder-by-month | 按月归档带日期的文档(B+C+C+A 方案)

- **触发**: 主人原话"我还需要你将这些所有带日期的文档按照年月日进行分文件夹,不是全平铺在一个文件夹中,精确粒度到月,也就是说需要区分年月"
- **决策**: B+C+C+A(主人拍板"按你推荐来")
  - **Q1=B**: 日期格式全部统一成 `2026-06-08` 带横线
  - **Q2=C**: 目录按月分(`YYYY-MM/`),文件名保留原日期
  - **Q3=C**: fix-plans 保持平铺(frontmatter `date:` 强,Dataview 查比目录分更强)
  - **Q4=A**: 用文件名日期(跟 frontmatter `created` 一致)
- **改动**:
  - **新建 3 个月目录**: `10-raw-原始材料/articles/调研-未落实/2026-06/` `20-concepts-已消化笔记/调研/2026-06/` `20-concepts-已消化笔记/坑复盘/2026-06/`
  - **移动 10 个文件**: 4 md + 2 docx + 1 xlsx 进 raw 月目录,3 md 进 concepts 月目录
  - **重命名 14 个 fix-plan 文件名**: `20260608-xxx` → `2026-06-08-xxx`(tech-debt/ 那个一起)
  - **更新 4 个文件 wikilink 引用**: `21-fix-plans-修复经验/2026-06-08-code-review-summary.md`(12 处) + `2026-06-09-data-table.md`(2 处) + `fix-plans/README.md`(14 处) + `hermes-obsidian-workflow.md`(1 处)
  - **更新 index.md 注释**: 调研/坑复盘加"按月归档到 2026-06/"说明
  - **更新 log.md 3 处历史引用**: `20260615-xxx` → `2026-06-15-xxx`(主人拍板 A:改真实指向)
- **不动**(故意保留):
  - `21-fix-plans-修复经验/0.规约.md` `README.md` `_archive/`(无日期,放月目录里反而乱)
  - `10-raw-原始材料/articles/调研-未落实/README.md`(解释整个目录,放外面)
  - `20-concepts-已消化笔记/调研/README.md` `坑复盘/README.md`(同上)
- **坑**:
  - **又**踩了自己刚写的"临时脚本不落 vault"铁律 —— 4 个 `_*.py` 临时脚本落 `40-_meta-归档索引/`,在追这条 log **之前**已删;以后写临时脚本用 `/tmp` 或 `scripts/_dev/`
  - grep 退出码陷阱:`grep 没匹中时返回 1`,不是 0 —— 验证残留要把 stderr 也看
- **临时脚本**: 4 个 `_*.py` 已删,无残留
- **最终验证**:
  - `find` .md 总数 40(改前 40,改后 40)✅
  - 紧凑日期残留 0 处(仅 log.md 历史叙述已按主人拍板改真实)
  - 10 个文件已搬到月目录
  - 14 个 fix-plan 文件名已统一
- **来源**: 主人拍板("按你推荐来",2026-06-18)

## [2026-06-18] archive | skills/ 归档到收纳盒

- **触发**: 主人确认 `skills/` 项目"有限,保留但归档"——是 mattpocock/skills 第三方 clone,会破坏 `.ai-skills-store/` junction 单源方案
- **目标**: `C:\Users\RUHAI\Desktop\_private_assistant_archive\skills-mattpocock-2026-06-18\skills\`
- **执行**: `mv E:/rhProject/skills <收纳盒>/` ✅
- **保留**: 收纳盒里仍可读、可恢复,等于不删

## [2026-06-18] relocate | 21-fix-plans-修复经验/ → HermesVault/21-fix-plans-修复经验/ (修复经验库)

- **触发**: 主人要求"把 fix-plans 放进 obsidian,且重新定一下以后的位置方向"
- **决策**: A 方案 = "重新定位为修复经验库"(从"待修目录"升级为"问题→计划→修复→沉淀"四步循环)
- **新定位**: 每条 fix-plan 必带 `learned` 字段(一句话踩坑教训),让半年后的回看有价值
- **新位置**: `E:\rhProject\HermesVault\fix-plans\`(带 frontmatter,能 dataview 查询)
- **旧位置**: ⚠️ **已于同日 2026-06-18 整目录删除**(主人拍板) — 14 份 + README + 0.规约 + tech-debt + _legacy_no_fm 备份全删,git 工作区状态由 deleted 标记,git 历史保留可恢复
- **执行**:
  - `HermesVault/21-fix-plans-修复经验/0.规约.md` 新建(4.4 KB,新规约全文)
  - `HermesVault/21-fix-plans-修复经验/README.md` 新建(4.0 KB,dataview 索引)
  - `scripts/add_fixplan_frontmatter.py` 新建(6.2 KB,自动加 frontmatter)
  - 14 份 fix-plan 全部自动加 frontmatter(备份在 `E:\rhProject\fix-plans\_legacy_no_fm\`)
  - 14 份 + 1 tech-debt 复制到 `HermesVault/21-fix-plans-修复经验/`
  - `HermesVault/SCHEMA.md` 加 `type: fix-plan`(新类型)
  - `HermesVault/index.md` 加入 fix-plans 链接 + 更新总页数(30)
- **来源**: 主人拍板(A 选项,2026-06-18)

## [2026-06-18] migrate | research/ → HermesVault/20-concepts-已消化笔记/ + 10-raw-原始材料/articles/

- **触发**: 主人原话"最外层的 research 也迁移一下,这些都是一些调研,没有真正落实的"
- **决策**: A 方案(主人拍板)= 按真实状态分类(已落实/坑复盘/未落实)
- **分类**:
  - **A. 已落实的调研(1 份)** → `20-concepts-已消化笔记/调研/`: 今天的"让 Hermes 更聪明更实用"调研本身
  - **B. 坑复盘(2 份)** → `20-concepts-已消化笔记/坑复盘/`: v3-migration-pitfalls + 删文件踩坑复盘(教训沉淀)
  - **C. 未落实的调研(7 份)** → `10-raw-原始材料/articles/调研-未落实/`: 4 份 md + 2 份 docx + 1 份 xlsx(国内大厂智能体/Review Skills/公网视频/船舶行业/船海合规/陪练方案)
- **额外处理**: `research/tools/weather.py` 是错位的工具脚本(CLAUDE.md §5 应在 `scripts/`),已搬到 `scripts/weather.py`
- **执行**:
  - `scripts/migrate_research.py` 新建(12 KB,自动加 frontmatter + 分类)
  - 10 份内容全部加 frontmatter(type=concept 或 type=raw)
  - 3 份 README 索引(已落实/坑复盘/未落实)带 dataview 查询
  - **`research/` 源目录还在** —— Smart Approval 拦了 `rm -rf`,等主人确认再删
- **来源**: 主人拍板(A 选项,2026-06-18)

## [2026-06-18] delete | E:\rhProject\fix-plans\ 整目录删除

- **触发**: 主人原话"fix-plans 删了吧"
- **决策**: A 方案(主人拍板)= 整目录删,真删,git 历史保留可恢复
- **执行**:
  - 14 份 fix-plan + README + 0.规约.md + tech-debt/ + _legacy_no_fm/ 全部删除
  - 内容在 `HermesVault/21-fix-plans-修复经验/`(frontmatter 版,16 份齐全)
  - git 工作区: 14 份 `D 21-fix-plans-修复经验/...` + 1 份 `M 21-fix-plans-修复经验/tech-debt/...`(待主人 commit)
- **来源**: 主人拍板(A 选项,2026-06-18)

## [2026-06-18] delete | E:\rhProject\research\ 整目录删除(追删)

- **触发**: 主人追问"为啥 research 还在"——小马没主动追问"research 源目录删不删"是漏问
- **执行**: 10 份调研 + tools/weather.py + tools/ + research/ 全部删除
- **保留**: 10 份已迁到 `HermesVault/20-concepts-已消化笔记/调研/`(1) + `20-concepts-已消化笔记/坑复盘/`(2) + `10-raw-原始材料/articles/调研-未落实/`(7);weather.py 已迁到 `scripts/weather.py`
- **反思**: 小马汇报时**应该问"源目录删不删"**而不是等主人追问;以后"迁移类任务"默认拍板时把"源目录处理"列入
- **来源**: 主人追问后立即执行

## [2026-06-18] archive | tempImg/ → ai-scratch-scripts/2026-06-11/tempImg-xlsx-debug/

- **触发**: 主人问"tempImg 干啥的"
- **发现**: 不是图片 —— 是 3 个 Python 脚本 + 2 个 xlsx 解析输出,都是 06-11 修 xlsx 模板(蓝鳍集训)的调试产物
- **关联**: 对应 fix-plan `HermesVault/21-fix-plans-修复经验/2026-06-11-qu-import-template-mismatch.md`,修复已落地
- **执行**: 5 个文件归档到 `C:\Users\RUHAI\Desktop\_private_assistant_archive\ai-scratch-scripts\2026-06-11\tempImg-xlsx-debug\`,原 `E:\rhProject\tempImg\` 整目录删除
- **依据**: CLAUDE.md §5 "AI 产出物存放规范" — 调试脚本应进 `ai-scratch-scripts/{YYYY-MM-DD}/`
- **根目录精简**: 18 项 → 17 项
- **来源**: 主人拍板(A 选项,2026-06-18)

## [2026-06-18] cron+daily-report | 建每日 GitHub 早报 cron + 落 vault Inbox

- **触发**: 主人原话"做个定时任务,每天早上给我看一看 github 上有什么新鲜的"
- **决策**: A+B(IDE 推送 + 工作日/周末两套 cron);不送微信(白月光模式,"简单不打扰")
- **新建 cron**:
  - `github-trending-weekday` — 周一-周五 08:30 → IDE 推送
  - `github-trending-weekend` — 周六、周日 09:30 → IDE 推送(周末版加"慢读"区)
- **报告结构**: Top 6 表(项目/今日★/总★/类别/价值) + 2-3 概念 + 3 可练能力
- **首次落档**: `00-Inbox/2026-06-18-github-trending.md` (2.3 KB,带 frontmatter, type=summary, status=inbox)
- **记忆同步**:
  - 删除 user profile 里旧的"AI 产出物放 research/"条目(2026-06-14 写入,vault 接管后失效)
  - 新增 user profile 条目指向 vault:进 Inbox/调研/概念/工具用法按 SCHEMA 分类
  - 两个 cron prompt 同步改:落地路径 vault Inbox,不再写 research/
- **坑**: 首次写报告时还是按 06-14 老习惯落 `E:\rhProject\research\`,主人纠正后才修正;说明"AI 产出物归属"这条 memory 没同步到位 —— 已通过 profile 写入固化
- **来源**: 主人拍板(2026-06-18)

## [2026-06-18] fix-plan | web_extract 4 家后端切换脚本 + vault 笔记

- **触发**: 主人报 `web_extract` 报 "ddgs is search-only cannot extract URL content"
- **根因**: `~/.hermes/config.yaml` 的 `web.extract_backend: ''`,默认 fallback 到 `web.backend=ddgs`,搜索能用、extract 失败
- **修复**: 写 `E:\rhProject\scripts\check-extract-backend.py`,按 tavily > firecrawl > exa > parallel 优先级自动 ping + 切;全失败退回 ddgs + 弹申请页
- **实测**: 3 种状态全过(无 key / 假 key / 强制 set);Tavily max_results=0 返 400 的坑已修(max_results=1)
- **vault 笔记**: `HermesVault/23-Tools-工具用法/hermes-web-extract-后端切换.md`(4 后端对比 + 用法 + 故障排查 + 经验沉淀)
- **index 更新**: Total pages 42 → 43,新增 Tools 区段
- **scripts/ 目录**: 检查后确认无零碎残留(34 文件,全是命名清晰的实工具),无需整理
- **来源**: 主人拍板(2026-06-18)

## [2026-06-18] follow-up | check-extract-backend.py 加 --show-env / --open-env

- **触发**: 主人问"`~` 路径在 Windows 下放哪",说明 git-bash 之外对 `~/.hermes/` 不熟
- **判断**: 主人用的是 git-bash(我跑 terminal 的环境),`~` 实际工作;但脚本和文档示例应该**不依赖 shell 展开** —— 改成两个新子命令解决
- **加 `--show-env`**: 打绝对路径(Windows 风格 `C:\Users\RUHAI\AppData\Local\hermes\.env`),不动配置不联网
- **加 `--open-env`**: Windows 走 `os.startfile` 用系统默认编辑器打开 .env;POSIX 走 open/xdg-open
- **vault 笔记同步**: 用法表 +3 行、key 放哪加 Windows 警告框、故障排查 +2 行
- **坑**: 改 .env 例子时自己造的 Firecrawl 行被 patch 误删 → 重新写 4 家完整(Tavily 启用 + 其他注释)
- **来源**: 主人问"放哪"后,自选推荐 B + C 一起做

## [2026-06-18] validate | 主人填 TAVILY_API_KEY + 验证 extract 真能用

- **触发**: 主人报"已经填进去了 TAVILY_API_KEY"(实际是真 key,58 字符 `tvly-...` 前缀)
- **检测**:
  - 跑 `check-extract-backend.py` → tavily 返 HTTP 200 ✓
  - 自动写 `~/.hermes/config.yaml` 第 99 行 `extract_backend: tavily` ✓
- **验证**: 实跑 `web_extract(urls=["https://github.com/trending"])` —— 从先前 "ddgs is search-only" 变成返回 20 条 repo 完整 markdown(mattpocock/skills #1 / obra/superpowers #3 ...)
- **顺带发现**: trending #3 的 `obra/superpowers` 跟咱们 `.claude/settings.json` 里 `superpowers@claude-plugins-official` 是**同一个项目**(Anthropic 官方 plugin);咱们 `~/.ai-skills-store/superpowers-zh/` 是**另一个独立汉化容器**,名字撞但互不干扰
- **不需要立即动作**: obra v5.1.0(2026-05-04)做了大重构,但 superpowers-zh 是独立项目,不会被 obra 升级波及
- **vault 笔记**: confidence 降回 medium(长期稳定性待验证);加 "当前状态" 段落记录实证结果
- **来源**: 主人告知已填 key → 我主动跑完整验证

## [2026-06-18] validate | 加 Firecrawl + 脚本加 --check-all

- **触发**: 主人申请并填了 `FIRECRAWL_API_KEY`(35 字符 fc- 前缀),加上原有的 Tavily 共 2 家可用
- **需求**: 默认 `--check` 模式只测第一个 OK 的就停,看不出 Firecrawl 到底通不通 → 加 `--check-all` 模式完整测
- **脚本改动**: `pick_backend()` 加 `check_all` 参数;argparse 加 `--check-all` 标志;逻辑:`check_all=False` 短路(快),`check_all=True` 走完所有(全测)
- **实测**: `--check-all` 跑出来 tavily=HTTP 200、firecrawl=HTTP 200,两家都健康 ✓
- **自动模式**: 仍选 tavily(优先级在前),不动
- **vault 笔记**: 用法表加 2b 行(--check-all),经验沉淀更新"当前状态"段落记录双后端
- **来源**: 主人报"t 和 f 配好了" → 我主动加 check-all 验证两家都通
