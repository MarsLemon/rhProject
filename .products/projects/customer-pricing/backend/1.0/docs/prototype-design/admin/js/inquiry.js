/* 客户定价单（询价受理）—— 承载前台提交的询价单，展示提交时冻结的定价快照
   口径对齐：FR-05 提交流水 / R-23 冻结快照 / IN-INQ-02 读历史单只读快照（不回查目录重算）
             / IN-INQ-03 提交后只读（本页无编辑删除入口）/ TC-INQ-05 服务信息与新价格构成展示
             （明细合计 → 合计保底价 → 计价基数 → ×影响系数 → 最终报价，D16/D17）。
   数据来源两路：
   ① 演示种子（仅内存，不落库——共享存储里只放前台真实提交，保证幂等）；
   ② 共享存储 pc_mgmt/state 的 pc_mgmt_inquiries_v1 键（前台 inquiry-store.js 写入，
      与后台配置快照 pc_mgmt_state_v1 分键，互不覆盖）。
   前台提交经 BroadcastChannel('pc_mgmt_sync') 广播 inquiry-added，本页静默刷新。 */
let inqFNo = '';          // 单号过滤
let inqFCust = '';        // 客户过滤
let inqFShip = '';        // 船名过滤
let inqFModel = '';       // 型号过滤
let inqFManu = '';        // 厂家过滤
let INQ_LIST = [];        // 种子 + 真实提交，按提交时间倒序
let INQ_STORED = [];      // 共享存储里的真实提交（原样引用）
let _inqSeeds = null;     // 种子缓存
let _inqKnownNos = {};    // 已在列表中的单号（用于跨标签页新单提示去重）

/* ---- 演示种子：静态冻结快照（目录调价不影响历史单，R-23）----
   数值按工时推导口径手写（型号级/设备级回溯），代表历史提交时刻的价格。
   v1.14：件数工时系数退役（D18/R-34 作废）——行金额 = 单价 × 数量，快照无 coef 字段。 */
function inqSeeds() {
  if (_inqSeeds) return _inqSeeds;
  function d(daysAgo, h, m) { const t = new Date(Date.now() - daysAgo * 86400000); t.setHours(h, m, 0, 0); return t; }
  function no(t) { const p = 'IQ' + t.getFullYear() + ('0' + (t.getMonth() + 1)).slice(-2) + ('0' + t.getDate()).slice(-2) + '-'; return p + '0001'; }
  function txt(t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2) + ' ' + ('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2); }
  const mk = function (t, src, o) { const x = Object.assign({ at: t.getTime(), atTxt: txt(t), no: no(t), src: src, currency: 'USD', remarks: '', modelCustom: false, manufacturerCustom: false }, o); return x; };
  function L(type, name, unit, unitPrice, qty, labor) {
    /* v1.14 去件数系数：行金额 = 单价 × 数量（多件不再折减） */
    return { type: type, name: name, unit: unit, unitPrice: unitPrice, qty: qty, amount: Math.round(unitPrice * qty), labor: labor || null };
  }
  /* 服务信息冻结快照（D17）：提交时刻解析三维系数（此后调系数规则不影响本单，IN-INQ-06） */
  function S(t, urgKey, region, country, site, leadDays) {
    const u = urgentOf(urgKey);
    const l = locResolve(region, country, site);
    const b = leadBandOf(leadDays);
    const d = new Date(t.getTime() + leadDays * 86400000);
    const iso = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    return {
      urgKey: urgKey, urgency: u.label, urgC: u.c,
      region: region, country: country, site: site || '',
      locC: l.c, locLevel: l.level,
      locTxt: region + (country ? ' · ' + country : '') + (site ? ' · ' + site : ''),
      serviceDate: iso, leadDays: leadDays, leadC: b.c, leadNote: b.note || ''
    };
  }
  /* 新价格构成推导（D16）：保底价由快照内 labor.rateSum × 8h 逐项求和（按一份计，R-30）；
     无 labor 的旧种子给显式 floorTotal；最终报价 = Max(保底, 明细) × 三维系数（R-19） */
  function F(x) {
    x.floorHours = x.floorHours || (typeof PPARAMS !== 'undefined' ? PPARAMS.minH : 8);
    if (x.floorTotal == null) {
      let f = 0, n = 0;
      (x.lines || []).forEach(function (l) { if (l.labor) { f += l.labor.rateSum * x.floorHours; n++; } });
      x.floorTotal = f; x.floorN = n;
    }
    x.floorShortfall = Math.max(0, x.floorTotal - (x.detailTotal || 0));
    x.pricingBase = Math.max(x.floorTotal, x.detailTotal || 0);
    const s = x.svc || {};
    x.coefficient = Math.max(s.urgC || 1, s.locC || 1, s.leadC || 1);
    x.grand = Math.round(x.pricingBase * x.coefficient);
    return x;
  }
  const DEV = '601.001';
  const t1 = d(1, 10, 24), t2 = d(3, 16, 5), t3 = d(5, 9, 41), t4 = d(8, 14, 12), t5 = d(10, 11, 3);
  _inqSeeds = [
    /* ① PC 提交：标准保养 + 可选项，完整推导要素（型号级 SI-001 覆盖示例）；
       紧急 1.20 / 新加坡 1.15 / 距询价 3 天 1.10 → K = Max(1.20, 1.15, 1.10) = 1.20 */
    mk(t1, 'PC', {
      customer: { name: '华洋航运（香港）', phone: '+852 9123 4567', email: 'ops@huayang-glory.com' },
      shipName: 'MV HUAYANG GLORY', deviceName: '主机柴油机', deviceCode: DEV,
      modelName: '6G80ME-C9.5', cyl: 6, manufacturer: 'HD HYUNDAI',
      maintTypeCode: 'HYDELEC', maintTypeName: '液压和电控系统保养', cycle: '5年保养',
      stdPkg: { name: '标准保养', subtotal: 10680 },
      lines: [
        L('package', 'Accumulator overhaul', 'EA', 630, 6, { level: '型号级', crew: 'T5×1+P4×1', rateSum: 126, hours: 5 }),
        L('package', 'FIVA valve overhaul (on board)', 'EA', 328, 6, { level: '设备级', crew: 'P4×1+P3×1', rateSum: 82, hours: 4 }),
        L('package', 'HCU block overhaul(shut-off valves, return oil block etc)', 'set', 828, 1, { level: '设备级', crew: 'P5×1+P3×1', rateSum: 92, hours: 9 }),
        L('package', 'MPC for EICU,CCU clean and inspection', 'set', 328, 1, { level: '设备级', crew: 'P4×1+P3×1', rateSum: 82, hours: 4 }),
        L('package', 'Angle Encoder check and calibration', 'set', 1476, 1, { level: '设备级', crew: 'P4×1+P3×1', rateSum: 82, hours: 18 }),
        L('package', 'Pneumatic control system Overhaul', 'set', 1472, 1, { level: '设备级', crew: 'P5×1+P3×1', rateSum: 92, hours: 16 }),
        L('package', 'Sea trial', 'set', 828, 1, { level: '设备级', crew: 'P5×1+P4×1+P3×1', rateSum: 138, hours: 6 }),
        L('optional', 'Engine driven hyd. pump: Renewal', 'EA', 984, 2, { level: '设备级', crew: 'P4×1+P3×1', rateSum: 82, hours: 12 }),
        L('optional', 'Proportional directional control v/v renewal', 'EA', 328, 2, { level: '设备级', crew: 'P4×1+P3×1', rateSum: 82, hours: 4 })
      ],
      detailTotal: 13304,
      svc: S(t1, 'yes', '亚洲', '新加坡', '', 3),
      remarks: '预计 10 月中旬进坞，请提前确认档期。'
    }),
    /* ② H5 提交：简化快照（无推导要素，保底价按快照冻结值展示），游客未登录；
       不紧急 × 中国 × 距询价 45 天 → K = 0.95（远期让利档） */
    mk(t2, 'H5', {
      customer: null,
      shipName: '', deviceName: '主机柴油机', deviceCode: DEV,
      modelName: '5G60ME-C9.5', cyl: 5, manufacturer: 'CSSC',
      maintTypeCode: 'HYDELEC', maintTypeName: '液压和电控系统保养', cycle: '5年保养',
      stdPkg: { name: '标准保养', subtotal: 4810 },
      lines: [
        L('package', 'Accumulator overhaul', 'EA', 276, 5, null),
        L('package', 'F.O. booster overhaul', 'EA', 410, 5, null),
        L('package', 'Exhaust v/v Actuator overhaul', 'EA', 276, 5, null),
        L('optional', 'Pump shaft clean and inspection', 'set', 276, 1, null)
      ],
      floorTotal: 2640, floorN: 5,
      detailTotal: 5086,
      svc: S(t2, 'no', '亚洲', '中国', '', 45)
    }),
    /* ③ PC 提交：未收录厂家/型号（R-25 自定义文本快照）+ 健康检查（无周期）；
       小单触发保底：明细 $788 < 合计保底价 $2,496（3 项 × 8h）→ 计价基数 = 保底价 */
    mk(t3, 'PC', {
      customer: { name: 'Ocean Ship Management', phone: '+86 21 5888 6666', email: 'service@ocean-sm.cn' },
      shipName: 'MV PACIFIC HOPE', deviceName: '主机柴油机', deviceCode: DEV,
      modelName: '7UEC85LSII', modelCustom: true, cyl: 7, manufacturer: 'MHI', manufacturerCustom: true,
      maintTypeCode: 'HEALTH', maintTypeName: '健康检查', cycle: null,
      stdPkg: { name: '健康检查基础项', subtotal: 604 },
      lines: [
        L('package', 'low insulation check', 'set', 328, 1, { level: '设备级 · 通用', crew: 'P4×1+P3×1', rateSum: 82, hours: 4 }),
        L('package', 'MOP, ESC, RCS check and function test', 'set', 276, 1, { level: '设备级 · 通用', crew: 'P5×1+P4×1+P3×1', rateSum: 138, hours: 2 }),
        L('optional', 'Junction box check', 'set', 184, 1, { level: '设备级 · 通用', crew: 'P5×1+P3×1', rateSum: 92, hours: 2 })
      ],
      detailTotal: 788,
      svc: S(t3, 'no', '亚洲', '中国', '', 20),
      remarks: '请提供健康检查后的详细报告，包含所有测量数据。'
    }),
    /* ④ H5 提交：10 年保养 + 大缸数（v1.14：多件全额计，无折减档）；紧急 × 韩国 × 10 天 → K = 1.26 */
    mk(t4, 'H5', {
      customer: { name: '青岛海西重工', phone: '+86 532 8765 4321', email: 'tech@qdhaixi.com' },
      shipName: 'MV NEW OCEAN', deviceName: '主机柴油机', deviceCode: DEV,
      modelName: '7RT-flex84T-D', cyl: 7, manufacturer: 'HME(STX)',
      maintTypeCode: 'HYDELEC', maintTypeName: '液压和电控系统保养', cycle: '10年保养',
      stdPkg: { name: '标准保养（10年）', subtotal: 11270 },
      lines: [
        L('package', 'Accumulator overhaul', 'EA', 276, 7, null),
        L('package', 'Cylinder lubricator overhaul', 'EA', 368, 7, null),
        L('package', 'FIVA valve overhaul (workshop)', 'EA', 966, 7, null)
      ],
      floorTotal: 2208, floorN: 3,
      detailTotal: 11270,
      svc: S(t4, 'yes', '亚洲', '韩国', '', 10)
    }),
    /* ⑤~⑫：循环复制拉开时间梯度（凑足分页演示量 >10 条）；紧急 × 中国 × 15 天 → K = 1.20 */
    mk(t5, 'PC', {
      customer: { name: '华洋航运（香港）', phone: '+852 9123 4567', email: 'ops@huayang-glory.com' },
      shipName: 'MV HUAYANG STAR', deviceName: '主机柴油机', deviceCode: DEV,
      modelName: '6G80ME-C9.5', cyl: 6, manufacturer: 'MITSUI',
      maintTypeCode: 'HYDELEC', maintTypeName: '液压和电控系统保养', cycle: '5年保养',
      stdPkg: { name: '标准保养', subtotal: 5772 },
      lines: [
        L('package', 'Accumulator overhaul', 'EA', 276, 6, { level: '设备级', crew: 'P5×1+P3×1', rateSum: 92, hours: 3 }),
        L('package', 'F.O. booster overhaul', 'EA', 410, 6, { level: '设备级', crew: 'P4×1+P3×1', rateSum: 82, hours: 5 }),
        L('package', 'HCU block overhaul(shut-off valves, return oil block etc)', 'set', 828, 2, { level: '设备级', crew: 'P5×1+P3×1', rateSum: 92, hours: 9 }),
        L('optional', 'Engine driven hyd. pump: workshop recondition', 'EA', 276, 2, { level: '设备级', crew: 'P5×1+P3×1', rateSum: 92, hours: 3 })
      ],
      detailTotal: 6324,
      svc: S(t5, 'yes', '亚洲', '中国', '', 15)
    })
  ];
  /* 统一推导新价格构成（保底/基数/系数/最终报价，F 见上） */
  _inqSeeds.forEach(F);
  /* 复制 ⑤ 生成 ⑥~⑫（改单号日期与序号，凑分页量；服务信息按各自提交时间重冻结） */
  const extra = [];
  for (var i = 1; i <= 7; i++) {
    const t = d(10 + i * 2, 9 + (i % 8), (i * 7) % 60);
    const c = JSON.parse(JSON.stringify(_inqSeeds[4]));
    c.at = t.getTime(); c.atTxt = txt(t); c.no = no(t);
    c.customer = { name: '演示客户 ' + i, phone: '+86 21 6000 00' + (10 + i), email: 'demo' + i + '@example.com' };
    c.shipName = 'MV DEMO ' + (i + 10);
    c.svc = S(t, c.svc.urgKey, c.svc.region, c.svc.country, c.svc.site, c.svc.leadDays);
    F(c);
    extra.push(c);
  }
  _inqSeeds = _inqSeeds.concat(extra);
  return _inqSeeds;
}
function inqMerge() {
  const all = inqSeeds().concat(INQ_STORED);
  all.sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
  INQ_LIST = all;
  _inqKnownNos = {};
  INQ_LIST.forEach(function (r) { if (r && r.no) _inqKnownNos[r.no] = true; });
}
/* ---- 共享存储读取（复用 data.js 的 idbConn/idbGet；localStorage 降级） ---- */
function inqLsFallback() {
  try { const raw = localStorage.getItem('pc_mgmt_inquiries_v1'); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
}
function inqReadStored() {
  return idbConn().then(function (db) {
    if (!db) return inqLsFallback();
    return idbGet(db, IDB_STORE, 'pc_mgmt_inquiries_v1').then(function (v) { return v || []; })
      .catch(function () { return inqLsFallback(); });
  }).catch(function () { return inqLsFallback(); });
}
/* notify=true：跨标签页收到新单时提示（初始加载静默） */
function inqReload(notify) {
  const knownBefore = notify ? Object.assign({}, _inqKnownNos) : null;
  return inqReadStored().then(function (stored) {
    INQ_STORED = Array.isArray(stored) ? stored : [];
    inqMerge();
    if (notify) {
      const fresh = INQ_STORED.filter(function (r) { return r && r.no && !knownBefore[r.no]; });
      if (fresh.length) toast('已收到新询价单：' + fresh.map(function (r) { return r.no; }).join('、'));
    }
    if (PAGE === 'inquiry') renderView();
  }).catch(function () { });
}
/* 跨标签页：前台提交（inquiry-added）→ 静默刷新 + 轻提示（与 data-updated 横幅互不影响） */
try {
  if (typeof BroadcastChannel !== 'undefined') {
    const _inqBc = new BroadcastChannel('pc_mgmt_sync');
    _inqBc.onmessage = function (ev) {
      const d = ev.data || {};
      if (d.type === 'inquiry-added') inqReload(true);
    };
  }
} catch (e) { }

/* ---- 列表视图 ---- */
/* 独立筛选：各字段各自匹配自己的列（包含、不区分大小写） */
function inqHit(v, hay) {
  v = (v || '').trim().toLowerCase();
  return !v || String(hay || '').toLowerCase().indexOf(v) >= 0;
}
function inqMatch(r) {
  return inqHit(inqFNo, r.no)
    && inqHit(inqFCust, r.customer ? r.customer.name : '')
    && inqHit(inqFShip, r.shipName)
    && inqHit(inqFModel, r.modelName)
    && inqHit(inqFManu, r.manufacturer);
}
function inqSrcTag(src) {
  return src === 'PC' ? '<span class="tag info">前台 PC</span>' : '<span class="tag gray">前台 H5</span>';
}
function vInquiry() {
  const list = INQ_LIST.filter(inqMatch);
  function cell(r) {
    const cust = r.customer ? esc(r.customer.name) : '<span class="sub">—</span>';
    const ship = r.shipName ? esc(r.shipName) : '<span class="sub">—</span>';
    const model = esc(r.modelName) + (r.cyl ? '<span class="sub">（' + r.cyl + '缸）</span>' : '')
      + (r.modelCustom ? '<span class="tag gray" style="margin-left:4px">自定义</span>' : '');
    const manu = esc(r.manufacturer) + (r.manufacturerCustom ? '<span class="tag gray" style="margin-left:4px">自定义</span>' : '');
    const mt = esc(r.maintTypeName || '') + (r.cycle ? '<span class="sub"> · ' + esc(r.cycle) + '</span>' : '');
    const grandCell = '<b>' + money(r.grand || 0) + '</b>'
      + (r.floorShortfall > 0 ? '<span class="tag warn" style="margin-left:4px" title="明细合计不足，按合计保底价托底（R-30）">保底</span>' : '')
      + (r.coefficient != null && Math.abs(r.coefficient - 1) > 1e-9 ? '<span class="sub" style="margin-left:4px" title="影响系数（取 Max(紧急,地点,时间)）">×' + r.coefficient.toFixed(2) + '</span>' : '');
    return '<tr>'
      + '<td><b>' + esc(r.no) + '</b></td>'
      + '<td>' + cust + '</td>'
      + '<td>' + ship + '</td>'
      + '<td>' + model + '</td>'
      + '<td>' + manu + '</td>'
      + '<td>' + mt + '</td>'
      + '<td class="num">' + grandCell + '</td>'
      + '<td>' + inqSrcTag(r.src) + '</td>'
      + '<td class="sub">' + esc(r.atTxt || '') + '</td>'
      + '<td><button class="btn sm" type="button" data-no="' + esc(r.no) + '" onclick="inqOpenDrawer(this.dataset.no)">查看</button></td>'
      + '</tr>';
  }
  function fgroup(label, id, val, ph, handler) {
    return '<span class="fgroup"><span class="fl">' + label + '</span>'
      + '<span class="qwrap"><input class="txt" id="' + id + '" placeholder="' + ph + '" value="' + esc(val) + '" style="width:150px" oninput="' + handler + '(this)"><button type="button" class="qclear" role="button" aria-label="清除" title="清除" onclick="qClearClick(this)">×</button></span></span>';
  }
  return '<div class="card">'
    + '<div class="zone q"><div class="secline" style="margin-bottom:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
    + fgroup('单号', 'inqFNoInp', inqFNo, '请输入', 'inqFNoLive')
    + fgroup('客户', 'inqFCustInp', inqFCust, '请输入', 'inqFCustLive')
    + fgroup('船名', 'inqFShipInp', inqFShip, '请输入', 'inqFShipLive')
    + fgroup('型号', 'inqFModelInp', inqFModel, '请输入', 'inqFModelLive')
    + fgroup('厂家', 'inqFManuInp', inqFManu, '请输入', 'inqFManuLive')
    + '<span style="flex:1"></span>'
    + '<button class="btn sm" type="button" onclick="inqQReset()">重置</button>'
    + '</div></div>'
    + '<div class="t-wrap"><table class="t"><tr><th>询价单号</th><th>客户</th><th>船舶</th><th>型号（缸数）</th><th>厂家</th><th>维保类型</th><th class="num">最终报价</th><th>来源</th><th>提交时间</th><th>操作</th></tr>'
    + (list.length
      ? pgSlice(list, 'inquiry').map(cell).join('')
      : '<tr><td colspan="10" class="empty-tip">没有符合条件的询价单</td></tr>')
    + '</table></div>'
    + pagerHtml(list.length, 'inquiry')
    + '</div>';
}
function inqFNoLive(inp) { pgReset('inquiry'); liveFilter(inp, function (v) { inqFNo = v; }); }
function inqFCustLive(inp) { pgReset('inquiry'); liveFilter(inp, function (v) { inqFCust = v; }); }
function inqFShipLive(inp) { pgReset('inquiry'); liveFilter(inp, function (v) { inqFShip = v; }); }
function inqFModelLive(inp) { pgReset('inquiry'); liveFilter(inp, function (v) { inqFModel = v; }); }
function inqFManuLive(inp) { pgReset('inquiry'); liveFilter(inp, function (v) { inqFManu = v; }); }
function inqQReset() { inqFNo = inqFCust = inqFShip = inqFModel = inqFManu = ''; pgReset('inquiry'); renderView(); }

/* ---- 详情抽屉：冻结快照（只读；IN-INQ-02 读快照不回查目录） ---- */
function inqOpenDrawer(no) {
  const r = INQ_LIST.find(function (x) { return x.no === no; });
  if (!r) { toast('未找到询价单：' + no); return; }
  function info(label, val) { return '<div class="secline" style="margin-bottom:8px"><span class="fl" style="min-width:72px">' + label + '</span><span style="flex:1">' + (val || '<span class="sub">—</span>') + '</span></div>'; }
  const cust = r.customer
    ? esc(r.customer.name) + '<span class="sub">' + esc(r.customer.phone || '') + (r.customer.email ? ' · ' + esc(r.customer.email) : '') + '</span>'
    : '<span class="sub">游客提交（正式系统取登录态快照）</span>';
  const model = esc(r.modelName) + (r.cyl ? '（' + r.cyl + '缸）' : '') + (r.modelCustom ? ' <span class="tag gray">自定义文本</span>' : '');
  const manu = esc(r.manufacturer) + (r.manufacturerCustom ? ' <span class="tag gray">自定义文本</span>' : '');
  const mt = esc(r.maintTypeName || '') + (r.cycle ? ' · ' + esc(r.cycle) : '');
  const pkg = r.stdPkg ? esc(r.stdPkg.name) : '—';
  /* 服务信息（D17，TC-INQ-05）：旧快照无 svc 时整体不渲染 */
  const s = r.svc || null;
  const svcRows = s ? ''
      + info('是否紧急', '<b>' + esc(s.urgency) + '</b> × ' + (s.urgC || 1).toFixed(2))
      + info('服务地点', '<b>' + esc(s.locTxt) + '</b> × ' + (s.locC || 1).toFixed(2) + '（' + esc(s.locLevel) + '）')
      + info('服务时间', '<b>' + esc(s.serviceDate) + '</b>（距询价 ' + s.leadDays + ' 天 × ' + (s.leadC || 1).toFixed(2) + '）')
    : '';

  const rows = (r.lines || []).map(function (l, i) {
    const typeTag = l.type === 'package'
      ? '<span class="tag ok">套餐</span>'
      : '<span class="tag gray">可选</span>';
    const labor = l.labor
      ? '<div class="sub" style="margin-top:2px">工时构成：' + esc(l.labor.level) + ' · ' + esc(l.labor.crew) + ' · $' + l.labor.rateSum + '/h × ' + l.labor.hours + 'h</div>'
      : '';
    return '<tr>'
      + '<td class="sub">' + (i + 1) + '</td>'
      + '<td>' + typeTag + '</td>'
      + '<td style="max-width:230px">' + esc(l.name) + labor + '</td>'
      + '<td class="sub">' + esc(l.unit || '') + '</td>'
      + '<td class="num">' + money(l.unitPrice || 0) + '</td>'
      + '<td class="num">' + l.qty + '</td>'
      + '<td class="num"><b>' + money(l.amount || 0) + '</b></td>'
      + '</tr>';
  }).join('');

  const optTotal = (r.lines || []).filter(function (l) { return l.type !== 'package'; })
    .reduce(function (s, l) { return s + (l.amount || 0); }, 0);
  function sumRow(label, val, strong) {
    return '<div style="display:flex;justify-content:flex-end;gap:16px;padding:3px 0;' + (strong ? 'border-top:1px solid var(--border);margin-top:6px;padding-top:7px;font-weight:600' : '') + '">'
      + '<span class="sub">' + label + '</span><span style="min-width:86px;text-align:right">' + val + '</span></div>';
  }
  $('drawer').innerHTML =
    '<div class="dhead"><b>' + esc(r.no) + '</b>' + inqSrcTag(r.src) + '<span class="tag ok">已提交 · 只读</span>'
    + '<span style="flex:1"></span><button class="btn" onclick="closeDrawer()">✕</button></div>'
    + '<div class="dbody">'
    + '<div class="card" style="box-shadow:none;border:1px solid var(--border);margin-bottom:14px;padding:12px 4px">'
    + info('客户', cust)
    + info('船舶', r.shipName ? esc(r.shipName) : '')
    + info('设备', esc(r.deviceName || ''))
    + info('型号 / 缸数', model)
    + info('制造厂家', manu)
    + info('维保类型', mt)
    + info('套餐', pkg)
    + svcRows
    + info('提交时间', esc(r.atTxt || ''))
    + (r.remarks ? info('补充说明', esc(r.remarks)) : '')
    + '</div>'
    + '<div class="t-wrap"><table class="t"><tr><th>#</th><th>类型</th><th>服务项</th><th>单位</th><th class="num">单价</th><th class="num">数量</th><th class="num">行金额</th></tr>'
    + (rows || '<tr><td colspan="7"><div class="empty-tip">快照无明细。</div></td></tr>')
    + '</table></div>'
    + '<div style="margin-top:12px">'
    + (r.stdPkg ? sumRow('套餐小计（' + esc(r.stdPkg.name) + '）', money(r.stdPkg.subtotal || 0)) : '')
    + sumRow('可选项合计', money(optTotal))
    + sumRow('明细合计', money(r.detailTotal || 0))
    + (r.floorTotal != null
        ? sumRow('合计保底价（' + (r.floorN || 0) + ' 项 × ' + (r.floorHours || 8) + 'h · 按一份计）', money(r.floorTotal || 0))
          + (r.floorShortfall > 0 ? sumRow('保底补足额（明细不足，按保底托底）', '<span style="color:var(--gold-text)">' + money(r.floorShortfall) + '</span>') : '')
          + sumRow('计价基数 = Max(合计保底价, 明细合计)', money(r.pricingBase || 0))
          + sumRow('影响系数（紧急 ' + (s ? (s.urgC || 1).toFixed(2) : '1.00') + ' × 地点 ' + (s ? (s.locC || 1).toFixed(2) : '1.00') + ' × 时间 ' + (s ? (s.leadC || 1).toFixed(2) : '1.00') + '）', '×' + (r.coefficient || 1).toFixed(4))
          + sumRow('最终报价（' + esc(r.currency || 'USD') + '）', money(r.grand || 0), true)
        : /* 旧口径快照（D13 基础服务费）兼容展示 */
        sumRow('基础服务费（订单级一次）', money(r.baseFee || 0))
        + sumRow('预算合计（' + esc(r.currency || 'USD') + '）', money(r.grand || 0), true))
    + '</div>'
    + '</div>'
    + '<div class="dfoot"><span class="sub">冻结快照 · 目录调价不影响历史单（R-23）</span>'
    + '<span style="flex:1"></span><button class="btn pri" onclick="closeDrawer()">关闭</button></div>';
  $('mask').classList.add('show');
  $('drawer').classList.add('show');
}
/* 初始装载：boot() 渲染首屏前先给种子，装载完成（含真实提交）后重绘 */
inqMerge();
inqReload(false);
