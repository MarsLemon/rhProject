/* ============================================================
   data.js —— 静态数据 / 领域模型 / 跨页状态持久化（IndexedDB）
   由「客户定价demo-后台管理-全模块.html」拆分生成
   注：机型组概念已退役（工时标准两级回溯 型号级 > 设备级，
   型号级配置支持多选型号；原「机型组级」历史数据由
   migrateLaborScopes() 自动迁移为型号级多选配置）
   ============================================================ */

/* ============================================================
   种子数据：文档体系（业务梳理 v1.11 / 表设计 v2.5 / DDD v2.10 / 需求文档 v1.8）
   + 工时模型 + 保底参数与影响系数（D16/D17）
   ============================================================ */
const RANK_META = {  // 颜色采用 Ant Design 预设色板，保证全站色调统一
  T5: { role: '高级技术专家', fg: '#2f54eb', bg: '#f0f5ff' },   // geekblue
  T4: { role: '主修技师/组长', fg: '#1677ff', bg: '#e6f4ff' },   // blue（主色）
  P5: { role: '熟练技工', fg: '#13c2c2', bg: '#e6fffb' },        // cyan
  P4: { role: '技工', fg: '#52c41a', bg: '#f6ffed' },           // green
  P3: { role: '初级技工', fg: '#d48806', bg: '#fffbeb' },        // gold
  P2: { role: '辅助工', fg: '#8c8c8c', bg: '#fafafa' }           // default
};
let RANKS = Object.keys(RANK_META);
function refreshRanks() { RANKS = Object.keys(RANK_META); }
const DEFAULT_RATES = { T5: 80, T4: 68, P5: 56, P4: 46, P3: 36, P2: 28 };
const BASIS_LABEL = { unit: '单件 · 可调', cylinder: '每缸 × 缸数', two_cylinder: '每 2 缸一档', engine: '整台工程', engine_tiered: '整台 · 分缸数档' };
const DAY_H = 8;

/* ---- 主数据 ---- */
const VENDORS = ["HD HYUNDAI", "Hanwha(Doosan/HSD)", "HME(STX)", "HHM", "CSSC", "MITSUI", "Kawasaki", "Hitachi Zosen", "Sulzer", "Makita", "J-ENG", "Akasaka"];
const MTYPES = [{ "code": "HYDELEC", "name": "液压和电控系统保养", "cycle": true }, { "code": "HEALTH", "name": "健康检查", "cycle": false }, { "code": "SUPV", "name": "监工服务", "cycle": false }, { "code": "ENGINE_OVERHAUL", "name": "常规吊缸类", "cycle": false }, { "code": "TRBL", "name": "故障排查维修", "cycle": false }, { "code": "REFIT", "name": "部件翻新", "cycle": false }, { "code": "SHOP", "name": "车间保养测试", "cycle": false }];
const CYCLES = ['5年保养', '10年保养'];
const SGROUPS = ["HCU", "HPS", "Electric control system", "Tacho system", "Pneumatic control system Overhaul", "Hydraulic system calibration and function test", "Sea trial", "Mechanical control gear"];

/* ---- 型号 ---- */
/* 型号主数据按 D3 口径使用「具体机型」：型号名自带缸数（如 6S60MC-C = 6 缸 S60 MC-C），
   覆盖低速机三大品牌家族（按实际行业主数据整理）：
   · MAN B&W——MC-C 世代（凸轮轴机械式，存量船队维保主力）+ ME-B/ME-C 世代（电控，HCU/FIVA 液压电控保养主场景）；
   · WinGD（Sulzer 血统）——RTA/RT-flex（共轨）存量 + X 世代新造；
   · J-ENG UEC（三菱 UE 系）。
   厂家为对应品牌的授权制造厂：Sulzer 仅挂在 WinGD 系列，不再出现在 MAN 系列厂家中。 */
const MAN_VENDORS = ['HD HYUNDAI', 'Hanwha(Doosan/HSD)', 'HME(STX)', 'HHM', 'CSSC', 'MITSUI', 'Kawasaki', 'Hitachi Zosen', 'Makita'];
const WINGD_VENDORS = ['HD HYUNDAI', 'Hanwha(Doosan/HSD)', 'HME(STX)', 'CSSC', 'Sulzer'];
const UEC_VENDORS = ['J-ENG', 'CSSC', 'Akasaka'];
function vendorsOf(name) {
  if (/UEC/.test(name)) return UEC_VENDORS.slice();
  if (/RTA|RT-flex|X\d\d/.test(name)) return WINGD_VENDORS.slice();
  return MAN_VENDORS.slice();
}
// 各型号持有独立 vendors 数组（后台厂家更名会原地 splice，禁止跨型号共享引用）
function mkModel(name, cyl, vendors) { return { name: name, dev: '601.001', cyl: cyl, vendors: vendors.slice(), dv: vendors[0] || '' }; }
// 型号表（D3 拆分后口径：型号 = 具体机型，名称含缸数，共 35 型）—— 型号挂设备（D1），
// 工时标准按 型号级(可多选) > 设备级 回溯
const MODELS = [
  // MAN B&W MC-C 世代（机械式，存量维保市场主力）
  mkModel('6L35MC-C', 6, MAN_VENDORS),        // 支线集装箱/小型油化船
  mkModel('6S42MC', 6, MAN_VENDORS),          // 灵便型散货船主力机型
  mkModel('6S46MC-C', 6, MAN_VENDORS),
  mkModel('5S50MC-C', 5, MAN_VENDORS),
  mkModel('6S50MC-C', 6, MAN_VENDORS),        // 超灵便/巴拿马型散货船，存量极大
  mkModel('7S50MC-C', 7, MAN_VENDORS),
  mkModel('5S60MC-C', 5, MAN_VENDORS),
  mkModel('6S60MC-C', 6, MAN_VENDORS),
  mkModel('7S60MC-C', 7, MAN_VENDORS),
  mkModel('6S70MC-C', 6, MAN_VENDORS),        // 苏伊士型油轮/好望角型散货船
  mkModel('7S80MC-C', 7, MAN_VENDORS),        // VLCC
  mkModel('8K90MC-C', 8, MAN_VENDORS),        // 集装箱船
  mkModel('12K98MC-C', 12, MAN_VENDORS),      // 大型集装箱船
  // MAN B&W ME-B / ME-C 世代（电控）
  mkModel('6S35ME-B9.3', 6, MAN_VENDORS),
  mkModel('5S50ME-B9.3', 5, MAN_VENDORS),
  mkModel('6S60ME-C10.5', 6, MAN_VENDORS),
  mkModel('6G60ME-C9.5', 6, MAN_VENDORS),     // 新造好望角型散货船主力
  mkModel('6G70ME-C9.5', 6, MAN_VENDORS),     // VLCC
  mkModel('6G80ME-C9.5', 6, MAN_VENDORS),     // VLCC 新造主力
  mkModel('11G95ME-C9.5', 11, MAN_VENDORS),   // 超大型集装箱船
  // WinGD（Sulzer 血统）：RTA/RT-flex 存量 + X 世代新造
  mkModel('6RTA48T-B', 6, WINGD_VENDORS),
  mkModel('6RT-flex58T-B', 6, WINGD_VENDORS), // 巴拿马型散货船存量极大
  mkModel('7RT-flex60C', 7, WINGD_VENDORS),
  mkModel('7RT-flex84T-D', 7, WINGD_VENDORS),
  mkModel('12RTA96C', 12, WINGD_VENDORS),     // 大型集装箱船
  mkModel('6X62-S2.0', 6, WINGD_VENDORS),
  mkModel('7X72', 7, WINGD_VENDORS),
  mkModel('6X82-2.0', 6, WINGD_VENDORS),
  // J-ENG UEC（三菱 UE 系）
  mkModel('5UEC33LSE-C2', 5, UEC_VENDORS),
  mkModel('6UEC33LSH-C2', 6, UEC_VENDORS),
  mkModel('6UEC45LSE-Eco-B2', 6, UEC_VENDORS),
  mkModel('6UEC50LSH-Eco-C2', 6, UEC_VENDORS),
  mkModel('6UEC60LSH-Eco-C3', 6, UEC_VENDORS),
  mkModel('8UEC60LSE-Eco-A2', 8, UEC_VENDORS),
  mkModel('7UEC80LSE-Eco-A2', 7, UEC_VENDORS)
];
function deviceLeaves() {
  const out = [];
  (function walk(nodes) { nodes.forEach(n => { if (!n.children.length) out.push(n); else walk(n.children); }); })(CATALOG);
  return out;
}
function devicePath(code) {
  const parts = []; let cur = code;
  while (cur) { const n = catFind(cur); if (!n) break; parts.unshift(n.name); const p = catParentOf(cur); cur = p && p.code ? p.code : null; }
  return parts.join(' / ');
}

const SITEMS = [{ "code": "SI-001", "name": "Accumulator overhaul", "grp": "HCU", "unit": "EA", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-002", "name": "F.O. booster overhaul", "grp": "HCU", "unit": "EA", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-003", "name": "Exhaust v/v Actuator overhaul", "grp": "HCU", "unit": "EA", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-004", "name": "Cylinder lubricator overhaul", "grp": "HCU", "unit": "EA", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-005", "name": "FIVA valve overhaul (on board)", "grp": "HCU", "unit": "EA", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-006", "name": "FIVA valve overhaul (workshop)", "grp": "HCU", "unit": "EA", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-007", "name": "HCU block overhaul(shut-off valves, return oil block etc)", "grp": "HCU", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-008", "name": "Engine driven hyd. pump: Renewal", "grp": "HPS", "unit": "EA", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-009", "name": "Engine driven hyd. pump: workshop recondition", "grp": "HPS", "unit": "EA", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-011", "name": "Proportional directional control v/v renewal", "grp": "HPS", "unit": "EA", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-013", "name": "High pressure pipe of servo oil to HCU renewal", "grp": "HPS", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-014", "name": "Accumulator overhaul", "grp": "HPS", "unit": "EA", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-020", "name": "Chain Tighten", "grp": "Mechanical control gear", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-021", "name": "Main starting v/v Slow turning v/v & actuator", "grp": "Mechanical control gear", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-022", "name": "Exhaust gas bypass valve", "grp": "Mechanical control gear", "unit": "EA", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-023", "name": "MPC for EICU,CCU clean and inspection", "grp": "Electric control system", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-024", "name": "Cables, 120ohm resistors, plug, electrical screw-terminals & terminal boards check", "grp": "Electric control system", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-025", "name": "UPS, power supply A+B check", "grp": "Electric control system", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-026", "name": "low insulation check", "grp": "Electric control system", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-027", "name": "MOP, ESC, RCS check and function test", "grp": "Electric control system", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-028", "name": "Junction box check", "grp": "Electric control system", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-029", "name": "Angle Encoder check and calibration", "grp": "Tacho system", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-030", "name": "Trigger rings + Sensors MSA+MSBn calibration", "grp": "Tacho system", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-031", "name": "Pneumatic control system Overhaul", "grp": "Pneumatic control system Overhaul", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-032", "name": "Hydraulic system calibration and function test", "grp": "Hydraulic system calibration and function test", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }, { "code": "SI-033", "name": "Sea trial", "grp": "Sea trial", "unit": "set", "mt": "HYDELEC", "cycle": "5年保养" }];
/* 服务项价格（D12：维保类型+(周期)+服务项+范围，型号级>设备级） */
/* 每条带 mt(维保类型) + cycle(周期，未启用为 null) 以支持多维切换 */
const SI_LEGACY_PRICE = { "SI-001": 300, "SI-002": 450, "SI-003": 300, "SI-004": 350, "SI-005": 300, "SI-006": 1000, "SI-007": 800, "SI-008": 1000, "SI-009": 2500,  "SI-011": 350,  "SI-013": 500, "SI-014": 300,      "SI-020": 1500, "SI-021": 1500, "SI-022": 500, "SI-023": 300, "SI-024": 300, "SI-025": 300, "SI-026": 300, "SI-027": 300, "SI-028": 200, "SI-029": 1500, "SI-030": 1500, "SI-031": 1500, "SI-032": 1000, "SI-033": 800 }; // D15：原直价单价（仅作工时折算基准，不再有价格表）
/* ============================================================
   保底价（兜底）与影响系数（2026-09-11 新增，取代原基础服务费 D13/D16、D17）
   ------------------------------------------------------------
   原「基础服务费（加收，单次定额）」机制已废除（原 BFEES 已删除）。新口径：
     · 保底价：按「人工最低一天（8 小时）」计价成本兜底——
       对每一条已勾选且可计价的服务项，取其人员配置费率合计 × minH 作为该行兜底价，
       全部行兜底价求和 = 合计兜底价；与实际明细合计比较取大者（不足按兜底）。
       （每项按 8 小时计一次，不乘数量：兜底是"最少出一天工"的
         成本底线，若随数量放大则该底线恒高于实际价、取大比较失去意义。）
     · 影响系数：最终报价 = Max(合计兜底价, 明细合计) × 影响系数；
       影响系数 = 紧急系数 × 地点系数 × 提前期系数（各维度缺省 1.00，连乘）。
   三组系数与保底参数均为后台可维护配置（快照持久化，见 snapshot/restoreState）。
   ============================================================ */
/* 计价参数（pricing_param，D16）：floorOn 保底开关 / minH 最低计费工时（人工最低一天）。
   minH 与 DAY_H（"天"→小时折算，R-33）默认值相同但相互独立（业务梳理 §6.7）。 */
let PPARAMS = { floorOn: true, minH: 8 };
/* ① 是否紧急 —— 客户二选一，系数直接挂选项（urgency_level） */
let URGENT = [
  { key: 'no',  label: '不紧急', c: 1.00, note: '常规安排' },
  { key: 'yes', label: '紧急',   c: 1.20, note: '需优先调度（加班/加急排产）' }
];
/* ② 服务地点（service_location 三级树 + location_coefficient 合一）——
      地区（亚洲 / 欧洲）/ 国家 / 地点三级；
      系数按 地点 > 国家 > 地区 回溯，
      空字段 = 该维度任意（区域或国家兜底行，语义同标准工时的通配行） */
const LOCATIONS_SEED = [
  /* 亚洲 */
  { region: '亚洲',   country: '中国',   site: '舟山',   c: 0.98, note: '修船基地，配套成熟' },
  { region: '亚洲',   country: '中国',   site: '',       c: 1.00, note: '基准地区' },
  { region: '亚洲',   country: '韩国',   site: '',       c: 1.05, note: '' },
  { region: '亚洲',   country: '日本',   site: '',       c: 1.10, note: '' },
  { region: '亚洲',   country: '新加坡', site: '',       c: 1.15, note: '' },
  { region: '亚洲',   country: '',       site: '',       c: 1.20, note: '区域兜底' },
  /* 欧洲 */
  { region: '欧洲',   country: '荷兰',   site: '鹿特丹', c: 1.28, note: '' },
  { region: '欧洲',   country: '荷兰',   site: '',       c: 1.30, note: '' },
  { region: '欧洲',   country: '德国',   site: '',       c: 1.32, note: '' },
  { region: '欧洲',   country: '',       site: '',       c: 1.35, note: '区域兜底' }
];
/* 历史默认种子（仅用于迁移比对，勿改）：地区曾为 东亚 / 东南亚 / 中东 / 欧洲 / 美洲 */
const LEGACY_LOCATIONS_SEED = [
  { region: '东亚',   country: '中国',     site: '舟山', c: 0.98 },
  { region: '东亚',   country: '中国',     site: '',     c: 1.00 },
  { region: '东亚',   country: '韩国',     site: '',     c: 1.05 },
  { region: '东亚',   country: '日本',     site: '',     c: 1.10 },
  { region: '东南亚', country: '新加坡',   site: '',     c: 1.15 },
  { region: '东南亚', country: '',         site: '',     c: 1.20 },
  { region: '中东',   country: '',         site: '',     c: 1.30 },
  { region: '欧洲',   country: '',         site: '',     c: 1.35 },
  { region: '美洲',   country: '',         site: '',     c: 1.40 }
];
/* 上一版种子（含北美洲，2026-09-15 去除；仅用于迁移比对，勿改） */
const PREV_LOCATIONS_SEED = [
  { region: '亚洲',   country: '中国',   site: '舟山',   c: 0.98, note: '修船基地，配套成熟' },
  { region: '亚洲',   country: '中国',   site: '',       c: 1.00, note: '基准地区' },
  { region: '亚洲',   country: '韩国',   site: '',       c: 1.05, note: '' },
  { region: '亚洲',   country: '日本',   site: '',       c: 1.10, note: '' },
  { region: '亚洲',   country: '新加坡', site: '',       c: 1.15, note: '' },
  { region: '亚洲',   country: '',       site: '',       c: 1.20, note: '区域兜底' },
  { region: '欧洲',   country: '荷兰',   site: '鹿特丹', c: 1.28, note: '' },
  { region: '欧洲',   country: '荷兰',   site: '',       c: 1.30, note: '' },
  { region: '欧洲',   country: '德国',   site: '',       c: 1.32, note: '' },
  { region: '欧洲',   country: '',       site: '',       c: 1.35, note: '区域兜底' },
  { region: '北美洲', country: '美国',   site: '休斯顿', c: 1.34, note: '' },
  { region: '北美洲', country: '美国',   site: '',       c: 1.36, note: '' },
  { region: '北美洲', country: '加拿大', site: '',       c: 1.38, note: '' },
  { region: '北美洲', country: '',       site: '',       c: 1.40, note: '区域兜底' }
];
let LOCATIONS = LOCATIONS_SEED.map(function (x) { return Object.assign({}, x); });
/* ③ 服务时间（lead_time_coefficient）—— 客户选具体日期，系统算「距发询价的天数」落档取系数 */
let LEAD_BANDS = [
  { min: 0,  max: 2,     c: 1.25, note: '0–2 天（超紧急）' },
  { min: 3,  max: 7,     c: 1.10, note: '3–7 天' },
  { min: 8,  max: 29,    c: 1.00, note: '8–29 天（常规，基准）' },
  { min: 30, max: 99999, c: 0.95, note: '≥30 天（提前规划）' }
];
/* 影响系数解析 ---- */
function urgentOf(key) {
  const u = URGENT.find(function (x) { return x.key === key; });
  return u || URGENT[0];
}
/* 地点三级回溯：先精确命中 地点，再 国家，最后 地区（同一优先级内取第一条） */
function locResolve(region, country, site) {
  const rows = LOCATIONS.filter(function (x) { return x.region === region; });
  let hit = site ? rows.find(function (x) { return (x.site || '') === site && (!x.country || x.country === country); }) : null;
  if (!hit && country) hit = rows.find(function (x) { return !(x.site || '') && x.country === country; });
  if (!hit) hit = rows.find(function (x) { return !(x.site || '') && !(x.country || ''); });
  if (!hit) return { c: 1.00, level: '未配置', row: null };
  const level = (hit.site ? '地点级' : (hit.country ? '国家级' : '地区级'));
  return { c: hit.c, level: level, row: hit };
}
/* 级联取数（前台三级下拉 / 预览服务信息模拟器共用）：
   地区 = 去重 region；国家 = 该地区下去重非空 country；地点 = 该国家下非空 site */
function locRegions() { const out = []; LOCATIONS.forEach(function (x) { if (x.region && out.indexOf(x.region) < 0) out.push(x.region); }); return out; }
function locCountries(region) {
  const out = []; LOCATIONS.forEach(function (x) {
    if (x.region === region && x.country && out.indexOf(x.country) < 0) out.push(x.country);
  }); return out;
}
function locSites(region, country) {
  const out = []; LOCATIONS.forEach(function (x) {
    if (x.region === region && x.country === country && x.site && out.indexOf(x.site) < 0) out.push(x.site);
  }); return out;
}
/* 提前期落档（天）；负数（日期早于今天）按最紧急档处理 */
function leadBandOf(days) {
  const d = Math.max(0, Math.floor(days));
  const b = LEAD_BANDS.find(function (x) { return d >= x.min && d <= x.max; });
  return b ? { c: b.c, band: b, days: d } : { c: 1.00, band: null, days: d };
}
/* 保底价（行）：该服务项人员配置费率合计 × 最低计费工时（按一份计，R-30；开关由调用方判定） */
function floorRateOf(std) { return rateSumOf(std.crew) * (PPARAMS ? PPARAMS.minH : 8); }
/* 件数工时系数已退役（2026-09-11，D18 / R-34 作废）：
   多件作业按全额计——行金额 = 基准单价 × 数量，不再乘任何系数。
   原 COEFS / coeffOf(q) 已删除；后台不再有系数档维护，快照不再冻结 qty_coefficient。 */

/* ---- 套餐与展示规则（D9/D11/D8/R-20） ---- */
const PACKAGES = [{ "code": "PKG-STD", "name": "标准保养", "rec": true, "mt": "HYDELEC", "cycle": "5年保养", "desc": "HCU液压控制单元翻新 + 电控系统检查 + 转速系统校准 + 气动系统翻新 + 液压系统校准测试 + 试航验证", "items": [{ "kind": "labor", "ref": "SI-001", "mode": "auto_cylinder", "qty": 0 }, { "kind": "labor", "ref": "SI-002", "mode": "auto_cylinder", "qty": 0 }, { "kind": "labor", "ref": "SI-004", "mode": "auto_cylinder", "qty": 0 }, { "kind": "labor", "ref": "SI-006", "mode": "auto_cylinder", "qty": 0 }, { "kind": "labor", "ref": "SI-007", "mode": "fixed", "qty": 1 }, { "kind": "labor", "ref": "SI-023", "mode": "fixed", "qty": 1 }, { "kind": "labor", "ref": "SI-025", "mode": "fixed", "qty": 1 }, { "kind": "labor", "ref": "SI-027", "mode": "fixed", "qty": 1 }, { "kind": "labor", "ref": "SI-029", "mode": "fixed", "qty": 1 }, { "kind": "labor", "ref": "SI-031", "mode": "fixed", "qty": 1 }, { "kind": "labor", "ref": "SI-032", "mode": "fixed", "qty": 1 }, { "kind": "labor", "ref": "SI-033", "mode": "fixed", "qty": 1 }] }];
const RULES = { "pkg": [{ "level": "设备级", "dev": "601.001", "ref": null, "mt": "HYDELEC", "cycle": "5年保养", "pkg": "PKG-STD" }], "sug": [{ "level": "设备级", "dev": "601.001", "ref": null, "mt": "HYDELEC", "cycle": "5年保养", "si": "SI-008", "badge": true, "mode": "fixed", "qty": 2 }, { "level": "设备级", "dev": "601.001", "ref": null, "mt": "HYDELEC", "cycle": "5年保养", "si": "SI-009", "badge": true, "mode": "fixed", "qty": 2 }, { "level": "设备级", "dev": "601.001", "ref": null, "mt": "HYDELEC", "cycle": "5年保养", "si": "SI-011", "badge": true, "mode": "fixed", "qty": 2 }, { "level": "设备级", "dev": "601.001", "ref": null, "mt": "HYDELEC", "cycle": "5年保养", "si": "SI-013", "badge": true, "mode": "fixed", "qty": 1 }, { "level": "设备级", "dev": "601.001", "ref": null, "mt": "HYDELEC", "cycle": "5年保养", "si": "SI-014", "badge": true, "mode": "fixed", "qty": 2 }, { "level": "设备级", "dev": "601.001", "ref": null, "mt": "HYDELEC", "cycle": "5年保养", "si": "SI-020", "badge": true, "mode": "fixed", "qty": 1 }, { "level": "设备级", "dev": "601.001", "ref": null, "mt": "HYDELEC", "cycle": "5年保养", "si": "SI-021", "badge": true, "mode": "fixed", "qty": 1 }, { "level": "设备级", "dev": "601.001", "ref": null, "mt": "HYDELEC", "cycle": "5年保养", "si": "SI-022", "badge": true, "mode": "fixed", "qty": 1 }] };

const RATES = {
  active: { id: 'v2026-08', status: 'active', eff: '2026-08-01', rates: Object.assign({}, DEFAULT_RATES) }
  /* 草稿/发布机制已按业务确认移除（Q-3 默认口径：直接生效 + 操作日志 + 撤销）；
     draft 字段保留 null 仅为兼容历史持久化快照，不再有任何代码读写 */
};
/* ============================================================
   领域映射层（对齐 DDD，机型组概念退役后的口径）：
   ① SERVICE_ITEMS —— 统一服务项主体，全部按「工时标准」推导计价（D15：直价已退役）；
   ② LABOR_STANDARDS —— 标准工时聚合（服务项 + 适用范围 两级回溯）。
   适用范围仅两级：型号级（一条配置可覆盖多台型号，models 为型号名数组）
   > 设备级（dev，兜底该设备全部型号）。
   ============================================================ */
const SERVICE_ITEMS = [];
const LABOR_STANDARDS = [];
const labNameMap = {};   // name -> LAB code（同名工时服务项合并为一个服务项主体，编码稳定）
let labSeq = 0;
function headcountOf(crew) { return RANKS.reduce((s, r) => s + (crew[r] || 0), 0); }
function rateSumOf(crew, rates) { const rr = rates || RATES.active.rates; return RANKS.reduce((s, r) => s + (rr[r] || 0) * (crew[r] || 0), 0); }
function laborHoursOf(it, cyl) {
  cyl = cyl || 6;
  // IN-MC-14b：分档未命中 → 0（不可计价），不再兜底第一档
  if (it.tiers.length) { const t = it.tiers.find(t => cyl >= t.min && cyl <= t.max); return t ? t.h : 0; }
  return it.hours || 0;   // 单值工时已在解析期折算为小时
}
function buildDomainModel() {
  // ① 全部服务项统一工时标准（D15）：原直价 SI 项折算为等效「人员配置+标准工时」（设备级）。
  //    折算保持量级：hours = round(原直价单价 / 综合费率)，人员配置在三组模板中轮转。
  const CREWS = [{ P5: 1, P3: 1 }, { P4: 1, P3: 1 }, { P5: 1, P4: 1, P3: 1 }];
  SITEMS.forEach(function (s, i) {
    SERVICE_ITEMS.push({
      code: s.code, name: s.name, grp: s.grp, unit: s.unit,
      mt: s.mt || null, cycle: s.cycle || null
    });
    const crew = CREWS[i % CREWS.length];
    const hours = Math.max(1, Math.round((SI_LEGACY_PRICE[s.code] || 300) / rateSumOf(crew)));
    LABOR_STANDARDS.push({
      item: s.code, mt: s.mt || null, cycle: s.cycle || null, dev: '601.001',
      scope: '设备级', models: null, crew: crew, basis: 'unit', ref_cyl: null,
      hours: hours, unit: '小时', tiers: [],
      work: '', algorithm: '', risk: '', stated: null, computed: 1,
      warnings: [], correction: null, workKey: null, workIdx: -1
    });
  });
  // ② 型号级覆盖示例（多选型号）：大缸径 G80/G95 的 Accumulator overhaul（套餐内项目，切换示例型号即可见差价）
  LABOR_STANDARDS.push({
    item: 'SI-001', mt: 'HYDELEC', cycle: '5年保养',
    scope: '型号级', models: ['6G80ME-C9.5', '11G95ME-C9.5'], dev: '601.001',
    crew: { T5: 1, P4: 1 }, basis: 'unit', ref_cyl: null,
    hours: 5, unit: '小时', tiers: [], work: '', algorithm: '', risk: '', stated: null, computed: 2,
    warnings: [], correction: null, workKey: null, workIdx: -1
  });
}
/* 标准工时两级回溯：型号级 > 设备级（IN-MC-12，机型组级已退役）。
   给定服务项 code + 型号名，返回命中（至多一条）的标准工时，未命中返回 null。 */
let CURRENT_DEV = null;            // 当前设备；无型号时设备级工时标准回溯的兜底（当前恒成立 null）
function resolveLaborStandard(itemCode, modelName, mt, cycle) {
  const model = MODELS.find(m => m.name === modelName) || null;
  // R-32 / IN-MC-09：范围两级回溯（型号级 > 设备级）；
  // 层内先取（类型+周期）精确行，无则取「无类型/通配行」（清单导入原始，D15 demo 约定）。
  // 通配语义（R-32：未指定即通用，双向）：
  //   标准上某维度为 null = 适用该维度任意值；
  //   查询上某维度为 null = 匹配该维度任意标准（用户未指定时按通用兜底，不应让价格归 0）。
  function hitLevel(pred) {
    let r = LABOR_STANDARDS.find(s => pred(s) && (s.mt || null) === (mt || null) && (s.cycle || null) === (cycle || null));
    if (r) return { std: r, generic: false };
    r = LABOR_STANDARDS.find(s => pred(s)
      && ((s.mt || null) === (mt || null) || (s.mt || null) === null || (mt || null) === null)
      && ((s.cycle || null) === (cycle || null) || (s.cycle || null) === null || (cycle || null) === null));
    if (r) return { std: r, generic: (r.mt == null && r.cycle == null) };
    return null;
  }
  let h = hitLevel(s => s.item === itemCode && s.scope === '型号级' && (s.models || []).indexOf(modelName) >= 0);
  if (h) return { std: h.std, level: '型号级' + (h.generic ? ' · 通用' : '') };
  const devForResolve = model ? model.dev : CURRENT_DEV;
  if (devForResolve) {
    h = hitLevel(s => s.item === itemCode && s.scope === '设备级' && s.dev === devForResolve);
    if (h) return { std: h.std, level: '设备级' + (h.generic ? ' · 通用' : '') };
  }   // 设备级须归属当前设备（IN-MC-10）；无型号时退化到 CURRENT_DEV
  return null;
}
/* 服务项工具：统一按 SERVICE_ITEMS 索引 */
function siNameOf(code) { const s = SERVICE_ITEMS.find(x => x.code === code); return s ? s.name : code; }
const CATALOG = [{ "code": "6", "name": "机械设备主要部件", "en": "MACHINERY MAIN COMPONENTS", "off": false, "mts": [], "children": [{ "code": "60", "name": "推进用柴油机", "en": "DIESEL ENGINES FOR PROPULSION", "off": false, "mts": [], "children": [{ "code": "601", "name": "柴油机", "en": "DIESEL ENGINES", "off": false, "mts": [], "children": [{ "code": "601.001", "name": "主机柴油机", "en": "Main diesel engine", "off": false, "mts": ["HYDELEC", "HEALTH", "SUPV", "ENGINE_OVERHAUL", "TRBL", "REFIT", "SHOP"], "children": [], "equip": true, "empty": true, "equipName": "Main diesel engine" }] }] }, { "code": "65", "name": "发电用电动机装置", "en": "MOTOR AGGREGATES FOR MAIN ELECTRIC POWER PRODUCTION", "off": false, "mts": [], "children": [{ "code": "651", "name": "电动机装置", "en": "MOTOR AGGREGATES", "off": false, "mts": [], "children": [{ "code": "651.001", "name": "辅助柴油发电机组", "en": "Aux. diesel generator aggregates, complete", "off": false, "mts": ["HEALTH", "SUPV", "ENGINE_OVERHAUL", "TRBL", "REFIT", "SHOP"], "children": [], "equip": true, "empty": true, "equipName": "Aux. diesel generator aggregates, complete" }] }] }] }];

/* ============================================================
   跨页状态持久化（IndexedDB 主存储 · localStorage 降级 + 旧数据迁移）
   ------------------------------------------------------------
   为什么换成 IndexedDB：
     · localStorage 是同步写，整包 JSON 反复序列化会卡住主线程；
     · 且有 5MB 配额上限，目录/工时数据增长到一定量就会写不进去；
     · IndexedDB 直接存结构化对象、按磁盘配额、写入不阻塞渲染。
   代价是异步：启动改为 boot() 异步引导（见 core.js）；
   首次加载若 IndexedDB 为空，会把旧的 localStorage 快照迁移过来，老数据不丢。
   ============================================================ */
const PERSIST_KEY = 'pc_mgmt_state_v1';   // IndexedDB state store 主键 / localStorage 旧键
const IDB_NAME = 'pc_mgmt';
const IDB_STORE = 'state';
const IDB_VER = 2;

function idbOpen() {
  return new Promise(function (resolve, reject) {
    if (typeof indexedDB === 'undefined' || !indexedDB) { reject(new Error('indexedDB unavailable')); return; }
    let req;
    try { req = indexedDB.open(IDB_NAME, IDB_VER); } catch (e) { reject(e); return; }
    req.onupgradeneeded = function (e) {
      const db = req.result, ov = e.oldVersion || 0;
      if (ov < 1) db.createObjectStore(IDB_STORE);            // 首次：配置 store
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error || new Error('idb open failed')); };
    req.onblocked = function () { reject(new Error('idb blocked')); };
  });
}
function idbGet(db, store, key) {
  return new Promise(function (resolve, reject) {
    const tx = db.transaction(store, 'readonly');
    const r = tx.objectStore(store).get(key);
    r.onsuccess = function () { resolve(r.result || null); };
    r.onerror = function () { reject(r.error); };
  });
}
function idbSet(db, store, key, val) {
  return new Promise(function (resolve, reject) {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(val, key);
    tx.oncomplete = function () { resolve(true); };
    tx.onerror = function () { reject(tx.error); };
    tx.onabort = function () { reject(tx.error || new Error('idb aborted')); };
  });
}
/* 连接只建一次；不可用时（隐私模式等）回落到 localStorage */
let _idb = null, _idbTried = false, _idbRetryAt = 0;
function idbConn() {
  if (_idb) return Promise.resolve(_idb);
  if (_idbTried && Date.now() < _idbRetryAt) return Promise.resolve(null);  // 失败冷却期内不重试
  _idbTried = true; _idbRetryAt = Date.now() + 10000;                      // 10s 冷却后自动重试
  return idbOpen().then(function (db) { _idb = db; _idbTried = false; return db; })
    .catch(function () { _idb = null; return null; });
}
function lsRead() {
  try { const raw = localStorage.getItem(PERSIST_KEY); return raw ? JSON.parse(raw) : null; }
  catch (e) { return null; }
}
function lsWrite(snap) {
  try { localStorage.setItem(PERSIST_KEY, JSON.stringify(snap)); return true; } catch (e) { return false; }
}
/* 首次切到 IndexedDB 时搬走旧快照，避免老用户数据丢失 */
function migrateFromLocalStorage(db) {
  const old = lsRead();
  if (!old) return Promise.resolve(null);
  return idbSet(db, IDB_STORE, PERSIST_KEY, old).then(function () {
    try { localStorage.removeItem(PERSIST_KEY); } catch (e) { }   // 迁移成功才清旧键
    return old;
  }).catch(function () { return old; });   // 写失败也先把数据用起来
}
function loadState() {
  return idbConn().then(function (db) {
    if (!db) return { state: lsRead(), legacy: true };
    return idbGet(db, IDB_STORE, PERSIST_KEY).then(function (state) {
      if (!state) return migrateFromLocalStorage(db).then(function (m) {
        return { state: m, legacy: !!m };
      });
      return { state: state, legacy: false };
    }).catch(function () { return { state: lsRead(), legacy: true }; });
  });
}
function snapshot() {
  return {
    v: 2,
    RANK_META,
    VENDORS, MTYPES, CYCLES, SGROUPS, MODELS, SITEMS,
    SERVICE_ITEMS, LABOR_STANDARDS, PACKAGES, RULES,
    PPARAMS, URGENT, LOCATIONS, LEAD_BANDS,
    RATES, CATALOG, labSeq
  };
}
/* 多标签页同步：本页保存后通过 BroadcastChannel 通知其他同源标签页，
   收到通知的标签页弹出"可重载"提示（见 core.js 的 window.pcOnRemoteUpdate），
   不直接覆盖对方内存，避免丢失其未保存的编辑。 */
const MY_TAB = Math.random().toString(36).slice(2);
let _bc = null;
try { if (typeof BroadcastChannel !== 'undefined') _bc = new BroadcastChannel('pc_mgmt_sync'); } catch (e) { }
if (_bc) {
  _bc.onmessage = function (ev) {
    const d = ev.data || {};
    if (d.type === 'data-updated' && d.sender !== MY_TAB && typeof window.pcOnRemoteUpdate === 'function')
      window.pcOnRemoteUpdate();
  };
}
function broadcastUpdate() {
  if (_bc && _bc.postMessage) {
    try { _bc.postMessage({ type: 'data-updated', sender: MY_TAB, ts: Date.now() }); } catch (e) { }
  }
}
/* 脏标记：仅当本次会话发生过真实改动（配置编辑）才广播，
   消除「纯浏览后关页」误触发「其他标签页已更新」提示（方案 B） */
let _dirty = false;
function markDirty() { _dirty = true; }
/* 落盘：配置写入 state store；广播仅在 _dirty 且非静默时触发，并在落盘后复位。 */
function flushPersist(silent) {
  const snap = snapshot();
  return idbConn().then(function (db) {
    if (db) {
      return idbSet(db, IDB_STORE, PERSIST_KEY, snap).then(function () {
        const fire = !silent && _dirty; _dirty = false;
        if (fire) broadcastUpdate();
        return true;
      });
    }
    const ok = lsWrite(snap);
    const fire = !silent && _dirty; _dirty = false;
    if (fire) broadcastUpdate();
    return ok;
  }).catch(function () {
    const ok = lsWrite(snap);
    const fire = !silent && _dirty; _dirty = false;
    if (fire) broadcastUpdate();
    return ok;
  });
}
function restoreState(s) {
  // 同一引用时不能「先清空再回填」——那会把数组自己清空
  // （IndexedDB 取回的是克隆副本，但直接 restoreState(snapshot()) 时是同一个数组）
  function fill(arr, val) { if (arr === val) return; arr.length = 0; (val || []).forEach(x => arr.push(x)); }
  try {
    fill(VENDORS, s.VENDORS); fill(MTYPES, s.MTYPES); fill(CYCLES, s.CYCLES);
    fill(SGROUPS, s.SGROUPS); fill(MODELS, s.MODELS);
    fill(SITEMS, s.SITEMS); fill(SERVICE_ITEMS, s.SERVICE_ITEMS);
    fill(LABOR_STANDARDS, s.LABOR_STANDARDS);
    /* 件数系数已退役（D18）：历史快照的 s.COEFS 不再恢复 */
    fill(PACKAGES, s.PACKAGES); fill(CATALOG, s.CATALOG);
    /* D16/D17 配置（旧快照缺省时保留种子默认值，不回填空数组） */
    if (s.PPARAMS) PPARAMS = Object.assign({ floorOn: true, minH: 8 }, s.PPARAMS);
    if (s.URGENT) fill(URGENT, s.URGENT);
    if (s.LOCATIONS) { fill(LOCATIONS, s.LOCATIONS); migrateLocationsSeed(); }
    if (s.LEAD_BANDS) fill(LEAD_BANDS, s.LEAD_BANDS);
    Object.keys(RULES).forEach(k => { delete RULES[k]; });
    Object.keys(s.RULES || {}).forEach(k => { RULES[k] = s.RULES[k]; });
    if (s.RATES && s.RATES.active) RATES.active = s.RATES.active;
    RATES.draft = null;   // 草稿机制已移除：历史快照中的草稿一律不再恢复
    if (s.RANK_META) {
      for (const k in RANK_META) delete RANK_META[k];
      Object.keys(s.RANK_META).forEach(k => { RANK_META[k] = Object.assign({}, s.RANK_META[k]); });
    }
    refreshRanks();
    labSeq = s.labSeq || 0;
    for (const k in labNameMap) { delete labNameMap[k]; }
    SERVICE_ITEMS.forEach(x => { if (/^LAB-/.test(x.code)) labNameMap[x.name] = x.code; });
    // 机型组退役迁移：历史快照可能仍是三级结构（GROUPS/WORK/机型组级行）
    migrateLaborScopes(s.GROUPS || []);
    return true;
  } catch (e) { return false; }
}
/* 服务地点种子迁移（幂等）：地区统一为 亚洲 / 欧洲。
   仅当历史快照仍与「旧默认种子 / 上一版种子」完全一致（用户未增改过地区）时，
   整体替换为新种子；用户自行维护过的地区保持原样，不做覆盖。 */
function migrateLocationsSeed() {
  const tryReplace = function (seed) {
    if (LOCATIONS.length !== seed.length) return false;
    const same = LOCATIONS.every(function (x, i) {
      const y = seed[i];
      return x.region === y.region && (x.country || '') === y.country && (x.site || '') === y.site && x.c === y.c;
    });
    if (!same) return false;
    LOCATIONS.length = 0;
    LOCATIONS_SEED.forEach(function (x) { LOCATIONS.push(Object.assign({}, x)); });
    return true;
  };
  tryReplace(LEGACY_LOCATIONS_SEED) || tryReplace(PREV_LOCATIONS_SEED);
}
/* 机型组退役迁移（幂等）：
   ① 「机型组级」行 → 型号级多选：型号清单取该行 members 快照，缺失时回查旧 GROUPS（按 ref=组编码）；
      成员全部失效（型号已删）的行直接丢弃；
   ② 旧「型号级」行的 ref（单型号字符串）→ models 数组；
   ③ workKey/workIdx 保留——套餐明细的旧格式行指针（labor:b:g:i）仍按它解析。 */
function migrateLaborScopes(legacyGroups) {
  const byCode = {};
  (legacyGroups || []).forEach(g => { byCode[g.code] = g; });
  for (let i = LABOR_STANDARDS.length - 1; i >= 0; i--) {
    const s = LABOR_STANDARDS[i];
    if (s.scope === '机型组级') {
      const g = byCode[s.ref] || null;
      const mem = (s.members && s.members.length) ? s.members : (g ? g.members : []);
      s.models = mem.filter(function (n) { return MODELS.some(function (m) { return m.name === n; }); });
      if (!s.models.length) { LABOR_STANDARDS.splice(i, 1); continue; }
      s.scope = '型号级';
      s.dev = (MODELS.find(function (m) { return m.name === s.models[0]; }) || {}).dev || s.dev || null;
      delete s.groupName; delete s.members;
    } else if (s.scope === '型号级') {
      if (!Array.isArray(s.models)) s.models = s.ref ? [s.ref] : [];
      delete s.ref;
    }
  }
}
/* 一次性清理：旧版清单导入的编号型 LAB 种子（"1、吊缸"…"26、齿轮箱检查"）。
   名称形如 "N、" 前缀的 LAB 服务项及其标准工时一并移除；
   新版「工时标准」补录的条目（挂台账已有服务项）不受影响。 */
function purgeImportedLabSeed() {
  let n = 0;
  for (let i = SERVICE_ITEMS.length - 1; i >= 0; i--) {
    const si = SERVICE_ITEMS[i];
    if (!/^LAB-/.test(si.code) || !/^\d+、/.test(si.name)) continue;
    const code = si.code, name = si.name;
    for (let j = LABOR_STANDARDS.length - 1; j >= 0; j--) {
      if (LABOR_STANDARDS[j].item === code) LABOR_STANDARDS.splice(j, 1);
    }
    delete labNameMap[name];
    SERVICE_ITEMS.splice(i, 1);
    n++;
  }
}
/* 兼容/归一化：设备侧 mts（文档 R-07「设备挂维保类型」）统一存维保类型编码；
   清理旧版反向 MTYPES.mounts 冗余字段，并将历史以名称存储的 mts 转为编码 */
function normalizeMts() {
  const nameToCode = {}; MTYPES.forEach(t => { nameToCode[t.name] = t.code; });
  MTYPES.forEach(t => { if ('mounts' in t) delete t.mounts; });
  deviceLeaves().forEach(d => {
    if (!Array.isArray(d.mts)) d.mts = [];
    d.mts = d.mts.map(x => nameToCode[x] || x).filter(x => MTYPES.some(t => t.code === x));
  });
}
/* 异步启动：IndexedDB →（为空则迁移旧 localStorage）→ 都没有则构建领域模型。
   由 core.js 的 boot() 调用，数据就绪后才渲染首屏。 */
function initState() {
  return loadState().then(function (loaded) {
    let restored = false;
    if (loaded && loaded.state) { try { restored = restoreState(loaded.state); } catch (e) { restored = false; } }
    // 自愈：还原后若领域模型缺少 SITEMS 的设备级工时标准（历史脏持久化或 buildDomainModel 被跳过导致残留），清空并重建；否则永久 0 价格
    let _needRebuild = !restored;
    if (!_needRebuild) {
      const _devSet = new Set(LABOR_STANDARDS.filter(function (s) { return s.scope === '设备级' }).map(function (s) { return s.item }));
      _needRebuild = SITEMS.some(function (s) { return !_devSet.has(s.code) });
    }
    if (_needRebuild) { LABOR_STANDARDS.length = 0; SERVICE_ITEMS.length = 0; buildDomainModel(); }
    purgeImportedLabSeed();
    normalizeMts();
    return flushPersist(true);
  });
}

