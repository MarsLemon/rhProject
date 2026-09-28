# 客户定价后台管理 · 工程说明

> 维保定价后台管理系统的多页拆分版本（由「客户定价 demo-后台管理-全模块.html」拆分而来）。
> 本文档聚焦**工程内可验证的架构与持久化约定**；具体业务规则以对应需求 / 设计文档为准
> （代码注释中引用的「业务梳理 v1.14 / 表设计 v2.8 / DDD v2.13 / 需求文档 v1.11 / 验收用例 v2.7」及 `D15`、`D16`、`D17`、`D18`、`R-32`、`IN-MC-*` 等编号）。
>
> ✅ **D16/D17 已落地（2026-09-11 原型改造完成，浏览器端到端验证通过）**：
> ① **保底价（D16）**——原「基础服务费」页改造为「**保底参数**」（`bfee.html`：保底开关 + 最低计费工时 `minH` 默认 8，`PPARAMS` 持久化），不落配置金额；`preview` 页合计改为「明细合计 → 合计保底价（触发时含补足额）→ 计价基数 → ×影响系数 → 最终报价」，并新增**服务信息模拟器**（紧急/地点三级/日期，实时观察 K 与最终报价）。
> ② **服务信息与影响系数（D17）**——新增「**影响系数**」页（`icoef.html`：紧急程度字典行内编辑 / 服务地点与地点系数（三级树 + 系数合一，弹窗增改）/ 时间系数档位（区间完整性校验 IN-MC-18)）；前台 Demo（PC v2 / H5 v8）STEP 表单已采集三项服务信息（订单级必填，R-21 扩展），预算按新公式实时重算，**客户侧预算页仅展示最终报价**（系数/保底/工时构成不外显，冻结进快照供本后台与销售视图展示——R-36 口径扩展）。
> ③ 「客户定价单」详情已展示服务信息与新价格构成（TC-INQ-05）；前台提交快照冻结 `svc`（三维系数）与保底三要素（IN-INQ-06）。
>
> ✅ **D18 已落地（2026-09-11，件数工时系数退役）**：**去除"件数工时系数"相关功能**——行金额 = 基准单价 × 数量，多件作业不再折减。① 「职级费率」页（原「费率与系数」，已随本次改造更名）的**件数系数卡整卡移除**（`rates.html` 不再加载 `coef.js`，该文件已删除；`COEFS` / `coeffOf()` 从 `assets/data.js` 移除，历史快照中的 `COEFS` 不再恢复）；② 方案预览与「客户定价单」的行金额去系数、明细表去"件数系数"列（快照不再有 `coef`）；③ 前台 PC v2 / H5 v8 行金额改为 `单价 × 数量`。原 R-34 作废、`labor_qty_coefficient` 表退役、`inquiry_snapshot.qty_coefficient` 字段删除。
> 口径以 dev-docs 五份为准（业务梳理 §6.7 / 表设计 3.26～3.30 / 需求文档 FR-11；**件数系数退役见业务梳理 D18 / §6.6**）。

## 目录结构

> 工程根目录（`prototype-design/`）按前台 / 后台分层：
> - `front/` —— 客户视角演示页（`客户定价demo-h5-v8.html` / `客户定价demo-PC-v2.html`），
>   二者引用 `../admin/assets/data.js` 与后台共享同一份种子数据与跨页状态
>   （目录从 `pc-managemnet/` 迁入 `admin/` 后统一引用路径，前台初始化无条件依赖其全局量）；
>   `front/inquiry-store.js` 为前台提交落库脚本（询价单写入共享存储 `pc_mgmt_inquiries_v1` 键，
>   供后台「客户定价单」页展示，见下文持久化设计）；
> - `admin/` —— 本目录，即本文档描述的维保定价后台管理系统；
> - 根目录 `index.html` 为站点导航入口（前台 H5 / 前台 PC / 后台）。

| 路径 | 职责 |
|------|------|
| `assets/data.js` | 静态种子数据、领域模型、跨页状态持久化（IndexedDB）；含 D16/D17 的 `PPARAMS` / `URGENT` / `LOCATIONS` / `LEAD_BANDS` 配置与解析函数（`urgentOf` / `locResolve` / `leadBandOf` / `floorRateOf` / `locRegions` 级联取数） |
| `assets/core.js` | 工具函数、侧边导航、视图框架、异步 `boot()` 引导、操作反馈三件套（`flashSave`/`flashNewRow`/`liveFilter`） |
| `assets/dp.js` | **DatePicker 日期选择**（antd 风静态自绘版，自注入样式）：触发器日历图标 + hover 清除、年月导航 / 今天快捷 / 当月外弱化 / 下限置灰（读 `input.min`）、选择与清除后向 input 派发 `change` 复用既有监听；前台 PC/H5 服务时间与 preview 模拟器共用 |
| `assets/sel.js` | **Select 选择器**（antd 风静态自绘版，自注入样式）：32px 触发器（hover #4096FF / open #1677FF+光圈 / 箭头旋转）+ 下拉面板（选中加粗 + 主色对勾、hover #F5F5F5、空态「暂无数据」、越界翻转）、清除 / 键盘巡航（↑↓/Enter/Esc，与树选择同款协议）/ 占位灰显；升级既有原生 `<select>`（隐藏保结构，选项每次打开现读，选中派发 `change` 复用级联监听）；服务信息下拉（紧急 / 地点三级）与组件规范演示共用，页面重建 options 后调 `SEL.syncAll()` |
| `assets/msel.js` | **Select 多选**（antd 风静态自绘版，自注入样式）：触发器内 tag（可单独移除）+ 内联搜索、hover 清除、面板选中浅底 + 主色对勾、键盘巡航 / Backspace 删 tag / 外点关闭；工时标准新增抽屉「适用型号」使用（`MSEL.mount(el, { options, value, placeholder, onChange })`，容器重建后重新 mount） |
| `assets/style.css` | 全局样式（Ant Design v6 风格设计令牌，静态版） |
| `js/*.js` | 各页面视图与交互（preview / category / models / vendors / mtype / sitems / sgroups / labor / rates（职级费率卡；件数系数卡已随 D18 退役）/ bfee（保底参数，D16）/ icoef（影响系数，D17）/ pkg / rule / inquiry） |
| `*.html` | 各页面入口，底部内联 `boot()` 引导首屏 |

> 页面按任务而非数据表收纳：制造厂家 / 项目分组作为独立字典页置于「基础数据」（与设备、服务项同级），
> 件数系数已整体退役（D18，2026-09-11：`coef.js` 已删除、`rates.html` 仅保留职级费率卡）；
> 服务地点树与地点系数在 demo 数据模型中合一（`LOCATIONS` 扁平行：region/country/site 任一为空即该维度"任意"，
> 对应表设计 3.26 `service_location` + 3.27 `location_coefficient` 两表），由「影响系数」页统一维护。

## 低心智负担设计约定（产品视角）

1. **方案预览是落地页**（`preview.html`，站点落地页；原「总览」入口与页面已下架）：两级视图——默认「全部型号方案预览总表」（问题型号排前，点行进入）；单型号详情含档案结论 + 服务信息模拟器 + 每个类型场景的客户视角预览（逐行推导单价与项保底价、不可计价缺口 + 补工时深链、明细合计 → 合计保底价 → 计价基数 → 影响系数 → 最终报价）。运营改完任何配置回这里验证；支持 `preview.html?model=型号名` 深链。
2. **缺口驱动配置**：工时标准页在当前上下文（范围+类型+周期）实时列出「两级回溯未命中」的服务项清单（§8.3 口径），点「配置它」自动选中到新增抽屉；服务项台账的「查看工时标准」以**模态窗**透视该服务项在 型号级/设备级 的全部配置（`siStdOpen`/`siStdHtml`，覆盖计数以 `LABOR_STANDARDS` 单一数据源为准）。
3. **就地操作优先**：服务项覆盖透视（模态窗查看工时标准）与查询筛选保留就地操作，避免"看到问题→跳页→开弹窗→找目标"的长链路；工时标准型号级配置的**型号多选池**收进新增抽屉（勾选即入草稿 + 关键词过滤 + 批量选入过滤结果）。

> **机型组已退役**：标准工时回溯由「型号级 > 机型组级 > 设备级」三级简化为「型号级 > 设备级」两级；
> 型号级一条配置可**多选型号**（同缸径系列一次配齐）。历史快照中的「机型组级」配置由
> `migrateLaborScopes()` 自动迁移为型号级多选（成员取组内型号清单），`groups.html` 页面与导航入口同步移除。
4. **导航即流程**：分组与组内顺序对齐 FR-07 维护依赖；页面命名跟随术语表（服务项 / 展示规则 / 职级费率），不加「台账」「与建议项」等修饰；孤儿字典并入宿主页、不单占导航位（制造厂家 / 项目分组已提升为基础数据独立页；件数系数已随 D18 退役，无独立页）。
5. **页头只保留标题**：`.topbar` 的 `<h1>` 已承载页面标题，卡片内不再重复 `<h2>` 子标题（含操作按钮/副信息的卡片头保留）；早期版本的页头面包屑（`CRUMBS`）、步骤式引导条 `pageIntro` 均已下线，职责说明由各页空态/引导文案承接。
6. **查询区与表单区视觉分离**（`.zone.q` / `.zone.f`，工时标准、保底参数、方案预览共用）：灰底虚线=只决定「看什么」，蓝底实线=执行「改什么」，避免筛选控件与新增表单同排被误读为同一个表单。
7. **导航用真实 `<a>` 链接**（可中键新开、键盘可达），跨页引用尽量带上下文深链（如 `labor?si=SI-001` 定位服务项、`sitems?cov=none` 直达待配置过滤、`preview?model=6S60MC-C` 直达方案预览）。

## 操作交互约定（用户操作视角）

**全站一致性审查规则**（每轮改动的验收标准，新增/修改页面必须逐条对照）：

| # | 规则 | 依据 |
|---|------|------|
| ① | **编辑选中对象的区域内不得内嵌新增表单**——新增走弹窗，或放独立新增区（zone f） | 分类树/型号页重构时的业务拍板 |
| ② | 多字段（≥2 业务字段）新增走弹窗；单字段字典条目可内嵌快捷新增 | 型号弹窗 / 厂家·分组·周期内嵌 |
| ③ | 禁止"自动保存 + 保存按钮"并存的假按钮；行内编辑＝失焦即存+绿色闪示；聚合编辑＝草稿+显式保存（抽屉/弹窗）；跨行校验的批量保存是唯一例外（原件数系数卡，已随 D18 退役） | 分类树假按钮 / 工时抽屉 |
| ④ | 同一新增动作入口唯一（多个触发点必须同源打开同一个弹窗） | 分类树三个入口同源 |
| ⑤ | 有筛选的页面必须配「重置」按钮 | 型号页要求，已全站对齐 |
| ⑥ | 关键对象要有验证出口：服务项「查看工时标准」（模态窗）/「去配工时」、分类树空设备叶「去挂载类型」、缺口型号在「方案预览」总表置顶并可直入详情（缺口行「补工时 →」深链） | 配置→验证闭环 |
| ⑦ | **分区不带编号引导头**：zone 只做查询/新增的视觉分区，不放"1 筛选 / 2 新增"这类步骤教学文案 | 型号页拍板，已全站对齐（bfee/labor/preview 同步清理） |

| 场景 | 约定 | 支撑（core.js） |
|------|------|----------------|
| 模态窗键盘 | **Esc 关闭最上层模态；Enter 提交**（焦点已在按钮上时交给原生，防双触发）；打开即落焦点到首个控件 | `MODAL_CLOSERS` / `topModal()` 全局 keydown |
| 关键词过滤 | **输入即过滤**（220ms 停顿防抖），重绘后焦点与光标回位继续输入；过滤词存原文、比较时统一小写 | `liveFilter()`，各页 `xxQLive` |
| 行内编辑 | 改完即存 + **绿色边框闪示确认**（`flashSave`），不再只靠一闪而过的 toast | `flashSave()` |
| 新增数据 | 新增/重绘后**定位并闪烁新行**（`flashNewRow`，含 `<input value>` 行的匹配），不用在表格里找"刚加的那条" | `flashNewRow()` |
| 批量录入 | 快速新增表单**回车即提交**；提交成功后**焦点留在新增框**（清空待输下一条）；校验失败聚焦出错字段 | 各页 add 函数 |
| 数值防呆 | 不做静默钳制：缸数按 R-05 限 1–20，越界**修正并 toast 说明**；步进器减到 0 时禁用 − 按钮 | models.js / `.stepper button:disabled` |
| 长下拉选择 | 选项 >20 条的下拉（如套餐抽屉添加服务项）配**输入即缩窄的过滤框** + 匹配计数 | pkg.js `pkgAddFilter` |

## 跨页状态持久化设计（`assets/data.js`）

### 为什么用 IndexedDB

- `localStorage` 同步写、整包 JSON 反复序列化会阻塞主线程；
- `localStorage` 仅 5MB 配额，目录 / 工时数据增长到一定量会写不进去；
- IndexedDB 直接存结构化对象、按磁盘配额、写入不阻塞渲染。

### 单一 Object Store

| store | key | 内容 | 写入时机 |
|-------|-----|------|----------|
| `state` | `pc_mgmt_state_v1` | 配置整包快照（单条） | 启动 / 页面卸载（`flushOnLeave`） |
| `state` | `pc_mgmt_inquiries_v1` | 前台提交的询价单数组（追加写，`front/inquiry-store.js` 维护） | 前台「提交询价」点击时 |

要点：配置按「整包快照」单条存储，写入不阻塞渲染；**询价单与配置分键**——前台提交只追加
`pc_mgmt_inquiries_v1`，不触碰配置快照，两侧互不覆盖（对齐表设计的【交易】/【配置】模块边界）。
后台「客户定价单」页（`js/inquiry.js`）读取该键与内存演示种子合并展示；种子只放内存不落库，
保证共享键内只有真实提交。前台提交成功后经 `BroadcastChannel('pc_mgmt_sync')` 广播
`inquiry-added`，询价页收到后静默刷新并 toast 新单号（与既有 `data-updated` 横幅机制互不影响）。

### 脏标记与广播去噪（方案 B）

- 新增 `_dirty` 标记；真实改动会 `markDirty()`；
- `flushPersist` 仅在 `_dirty && !silent` 时通过 `BroadcastChannel` 广播 `data-updated`，并在落盘后复位；
- 纯浏览后关页不会误触发其他标签页的「已更新」提示。

### localStorage 降级 + 旧数据迁移

- `idbConn` 打开失败（隐私模式等）回落 `localStorage` 兜底；
- 首次切到 IndexedDB 时，`migrateFromLocalStorage` 把旧 `localStorage` 快照（`pc_mgmt_state_v1`）
  搬入 `state` store，成功后再清旧键，老数据不丢。

### 多标签页同步

- 本页保存后通过 `BroadcastChannel('pc_mgmt_sync')` 通知其他同源标签页；
- 收到通知的标签页弹出「重载」提示（core.js `window.pcOnRemoteUpdate`），**不直接覆盖**对方内存，
  避免丢失其未保存编辑。

### 版本与升级迁移

- `IDB_VER = 2`；`state` store 为 out-of-line key（无 keyPath）。
- `idbOpen` 的 `onupgradeneeded` 基于 `oldVersion` 做迁移分支（`ov<1` 建 state）；
  未来若改 keyPath / 拆分 state 实体，在对应 `ov<N>` 分支内迁移即可。
- 降级可重试：`idbConn` 失败后进入 10s 冷却，冷却结束后自动重试打开 IndexedDB
  （隐私模式 → 正常模式等场景可自动恢复，不再一次性永久回落 localStorage）。

## 数据来源 / 业务规范

- 种子数据来自「业务梳理 v1.12 / 表设计 v2.6 / DDD v2.11」及需求文档 v1.9；
- 代码注释中引用了业务规则编号（如 `D15`、`D16`、`D17`、`R-19`、`R-30`、`R-38～R-41`、`IN-MC-16～19`、`IN-INQ-05/06` 等），
  用于对齐领域模型与计价逻辑；
- 本文档不重复业务规则细节，仅记录工程内的架构与持久化约定。

## Ant Design 风格实现（v2 设计语言）

> 全站 UI 按 **Ant Design v6 默认主题（default Algorithm 派生令牌）** 重绘，指导文档：`ant.design/llms.txt`（组件文档 / 语义化文档 / 设计规范）。
> 「组件规范」页（`components.html`，侧边栏「设计规范」分组）是全站 UI 的**活体规范**：
> 设计令牌、组件演示与「页面 → antd 组件」对照总表都在该页，样式改动即时全站生效。

### 设计令牌对照（`assets/style.css` :root）

| antd v6 token | 值 | CSS 变量 |
|---|---|---|
| `colorPrimary`（hover / active） | `#1677FF`（`#4096FF` / `#0958D9`） | `--p` / `--p-hover` / `--p-active` |
| `colorText` 四级 | `rgba(0,0,0,.88/.65/.45/.25)` | `--text` / `--text-2` / `--text-3` / `--text-4` |
| `colorBorder` / `colorSplit` | `#D9D9D9` / `#F0F0F0` | `--border` / `--split` |
| `colorBgLayout` / `colorBgSpot` | `#F5F5F5` / `#FAFAFA` | `--bg-layout` / `--bg-spot` |
| `borderRadius` / `borderRadiusLG` | `6px` / `8px` | `--r` / `--r-lg` |
| `controlHeight` / SM | `32px` / `24px` | `--h` / `--h-sm` |
| `boxShadow`（浮层）/ 卡片阴影 | antd 三段式阴影 | `--shadow-modal` / `--shadow-card` / `--shadow-pop` |
| 字体 | antd system-ui 字体栈，`14px / 1.5715` | `--font` |

旧变量（`--accent`、`--sub`、`--chip` 等）以**别名**形式保留在 `:root`，页面内联样式与业务 JS 不受影响。

### 页面 → antd 组件对照

| 页面 | 建议使用的 antd 组件 |
|---|---|
| 全站布局 | Layout（Sider + Header）、Menu、Breadcrumb、Badge |
| category 设备分类树 | Tree、Modal、Form、Input |
| models 设备与型号 | Table、Modal、TreeSelect、InputNumber、Tag |
| vendors / sgroups 字典页 | Table、Input（快捷新增）、Popconfirm（Modal.confirm）、message |
| mtype 维保类型与周期 | Modal、Form、Radio.Group |
| sitems 服务项 | Table（行内展开）、Select、message、Popconfirm |
| labor 工时标准 | Drawer、Form、Table、Segmented、Alert（缺口清单） |
| rates 职级费率 | Table（聚合编辑）、InputNumber、Popconfirm |
| bfee 保底参数（D16） | Form（行内开关 + 数字输入）、Table（人员配置推导示例） |
| icoef 影响系数（D17） | Table（紧急行内编辑 / 地点树 / 时间档）、Modal（地点与时间档增改）、Tag（层级与区间健康） |
| pkg 套餐配置 | Drawer、Select、Table、Input |
| rule 展示规则 | Table、Modal、Switch |
| inquiry 客户定价单 | Table、Drawer（快照详情，只读）、Input、Pagination |
| preview 方案预览 | Descriptions、Steps、Table、Statistic、DatePicker（服务信息模拟器）、Button（深链） |
| components 组件规范 | 全部组件的活体演示（含 DatePicker） |

### 本轮（v2）UI 变更点

1. **布局骨架**：Sider（232px）+ 56px Header + `#F5F5F5` 内容区，品牌区加渐变 Logo 徽标；
2. **菜单**：antd Menu 令牌（项高 40、radius 6、hover `rgba(0,0,0,.06)`、选中 `#E6F4FF`），图标换为
   antd 风格线性 SVG（`core.js NAV_ICONS`，跟随 `currentColor`）；角标为 Badge 计数样式（红底白字描白边）；
3. **反馈组件**：toast 升级为 **message**（顶部居中、白底 + 语义色圆形图标、撤销为链接按钮）；
   确认框升级为 **Modal.confirm**（标题前置红叹号 / 蓝问号图标，危险确认主按钮为实心 danger）；
4. **数据录入**：Input/Select/TextArea 统一 32px 高、hover `#4096FF`、focus `#1677FF` + 2px 光圈；
   新增 Switch（`.sw`）、Alert（`.alert` 四色）、Segmented（`.seg`）、Pagination（`.pager`）、
   Steps（`.steps`）、Statistic（`.stat`）、Descriptions（`.desc`）等演示组件；
5. **表格**：表头 `#FAFAFA`、行 hover `#FAFAFA`、容器 radius 8、末行去底线（antd Table 观感）。

## 键盘与语义化（对齐 antd llms.txt / 语义化文档体系）

> 依据 antd 官方文档体系（`ant.design/llms.txt` → 组件文档 / 语义化文档 / 动效规范），
> 在不改变静态技术栈（HTML + 原生 JS + CSS 变量）前提下补齐浮层与控件的可达性协议，全部改动落在共享层（core.js / style.css / *.html），各页面 JS 无需感知。

| 能力 | 行为（对齐 antd） | 支撑（core.js / style.css） |
|------|------|------|
| 焦点圈定 | 模态 / 抽屉打开时 **Tab 在浮层内循环**（首尾环绕），焦点不落到遮罩底层；误聚焦时自动拉回首个控件 | `trapTab()` / `focusablesIn()`，全局 keydown |
| 背景滚动锁定 | 任一浮层（modal / drawer / mask）打开时锁页面滚动，全关后恢复 | MutationObserver 监听 show class → `html.modal-open`（零侵入各页 JS） |
| 树选择键盘协议 | 触发器 **Enter / Space / ↓ 开合**；面板内 **↑↓ 巡航**可见选项、**Enter 选中**、**Esc 关闭并把焦点还回触发器**；`aria-expanded` 随开合同步 | `tsKeydown()`；trigger `role=combobox tabindex=0`、panel `role=listbox`、选项 `role=option` + `aria-selected` |
| 分页语义 | `<nav class="pager" aria-label="分页">`，页码 `aria-label="第 N 页"` + 当前页 `aria-current="page"`，上/下页与每页条数均有 `aria-label` | `pagerHtml()` |
| 导航语义 | 当前菜单项 `aria-current="page"` | `renderNav()` |
| 浮层语义 | 抽屉容器 `role="dialog" aria-modal="true"`（各 *.html 模板）；确认框 / 表单模态原有 `alertdialog` / `dialog` 不变 | 13 个 HTML |
| 控件语义 | 查询区清除按钮 `<a>` 升级为 `<button type=button>`（键盘可达）；步进器 ± 按钮 `aria-label="增加/减少+岗位"`；查询区下拉补 `id`（消除 a11y 告警） | 7 个页面 JS + labor.js |
| 动效偏好 | `prefers-reduced-motion: reduce` 时全局动画 / 过渡即时完成（antd 动效规范） | `@media` 全局覆盖 |
| 遮罩过渡 | 遮罩 / 确认框背景入场淡入 `.2s`（antd mask fade） | `.mask.show,.cfmask.show` |

> 键盘协议总表（现有）：`Esc` 关最上层浮层（确认框 > 表单模态 > 抽屉 > 树选择面板）；`Enter` 提交（焦点在按钮上交给原生，防双触发）；`Tab` 在浮层内圈定；树选择面板内 `↑↓` + `Enter`。

