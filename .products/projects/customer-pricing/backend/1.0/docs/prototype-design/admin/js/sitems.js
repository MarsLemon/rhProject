/* 服务项 —— 由全模块版拆分生成 */
/* ============================================================
   视图：服务项与分组
   ============================================================ */
let siF = { grp: 'all', qName: '', cov: 'all' };   // 名称独立筛选控件
const SI_NO_GRP = '__none__';   // 筛选值：未分组（服务项 grp 为空，D2 分组非必填）
/* 工时标准查看：模态窗（`siStdOpen`/`siStdHtml`，2026-09-15 由行内展开改为弹窗） */
/* 工时覆盖统计：单一数据源 LABOR_STANDARDS */
function laborCoverageOf(code) {
  const ls = LABOR_STANDARDS.filter(function (x) { return x.item === code; });
  if (!ls.length) return { n: 0, badge: '<span class="tag bad">⚠ 待配置</span>' };
  const nM = ls.filter(function (x) { return x.scope === '型号级'; }).length;
  const nD = ls.filter(function (x) { return x.scope === '设备级'; }).length;
  const parts = [];
  if (nM) parts.push('型号×' + nM);
  if (nD) parts.push('设备×' + nD);
  return { n: ls.length, badge: '<span class="tag ok">已配 ' + ls.length + ' 条</span> <span class="sub">' + parts.join(' · ') + '</span>' };
}
function allSi() {
  // 台账 = 服务项定义（一行一定义）；人员配置/工时配置在「工时标准」页，1:N
  // grp 为空 = 未分组（项目分组非必填，D2；未分组不影响计价与引用）
  return SERVICE_ITEMS.map(function (x) {
    return { code: x.code, name: x.name, grp: x.grp || '', unit: x.unit || '次', cov: laborCoverageOf(x.code) };
  });
}
function vSitems() {
  // 深链：sitems.html?cov=none 直达「待配工时」过滤视图（只消费一次，随后从地址栏剥离）
  try {
    const p = new URLSearchParams(location.search);
    if (p.get('cov') === 'none') { siF.cov = 'none'; history.replaceState(null, '', location.pathname); }
  } catch (e) { }
  const all = allSi();
  const kwN = (siF.qName || '').trim().toLowerCase();   // 存原文保持输入框显示，比较时统一小写
  const rows = all.filter(function (r) {
    // 分组非必填：__none__ = 只看未分组（grp 为空）
    if (siF.grp === SI_NO_GRP) { if (r.grp) return false; }
    else if (siF.grp !== 'all' && r.grp !== siF.grp) return false;
    if (kwN && r.name.toLowerCase().indexOf(kwN) < 0) return false;
    if (siF.cov === 'ok' && !r.cov.n) return false;
    if (siF.cov === 'none' && r.cov.n) return false;
    return true;
  });
  return '<div class="card">'
    + '<div class="zone q"><div class="secline" style="margin-bottom:0">'
    + '<span class="fgroup"><span class="fl">分组筛选</span>'
    + '<select class="select" id="nfGrp" style="min-width:190px"><option value="all">全部分组</option>'
    + '<option value="' + SI_NO_GRP + '"' + (siF.grp === SI_NO_GRP ? ' selected' : '') + '>未分组</option>'
    + SGROUPS.map(function (g) { return '<option ' + (siF.grp === g ? 'selected' : '') + '>' + esc(g) + '</option>'; }).join('') + '</select></span>'
    + '<span class="fgroup"><span class="fl">服务项</span><span class="qwrap"><input class="txt" id="nfQName" placeholder="请输入" value="' + esc(siF.qName || '') + '" style="width:140px" oninput="siQNameLive(this)"><button type="button" class="qclear" role="button" aria-label="清除" title="清除" onclick="qClearClick(this)">×</button></span></span>'
    + '<span style="flex:1"></span>'
    + '<button class="btn sm" type="button" onclick="siResetQuery()">重置</button>'
    + '</div>'
    + '</div></div>'
    + '<div class="card">'
    + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px"><span class="cardact"><button class="btn pri" onclick="openSiModal()">新增</button></span></div>'
    + '<div style="max-height:520px;overflow:auto"><div class="t-wrap"><table class="t"><tr><th>编码</th><th>服务项</th>'
    + '<th>单位</th><th>服务项分组</th><th>操作</th></tr>'
    + (rows.length ? pgSlice(rows, 'sitems').map(function (r) {
      return '<tr>'
        + '<td class="sub"><code class="k">' + r.code + '</code></td>'
        + '<td style="max-width:240px">'
        + '<b>' + esc(r.name) + '</b></td>'
        + '<td>' + esc(r.unit) + '</td>'
        + '<td>' + (r.grp ? esc(r.grp) : '<span class="sub">未分组</span>') + '</td>'
        + '<td><button class="btn sm" type="button" onclick="openSiEdit(\'' + esc(r.code) + '\')">编辑</button> <button class="btn sm danger" data-code2="' + r.code + '" onclick="delSi(this.dataset.code2)">删除</button> <button class="btn sm" type="button" onclick="siStdOpen(\'' + esc(r.code) + '\')" title="查看工时标准">查看工时标准</button></td></tr>';
    }).join('')
      : '<tr><td colspan="5"><div class="empty-tip">无匹配服务项</div></td></tr>')
    + '</table></div></div>'
    + pagerHtml(rows.length, 'sitems')
    + '</div>'
}
/* 工时标准：模态窗查看（原行内展开已改为弹窗，2026-09-15） */
function siStdOpen(code) {
  const item = SERVICE_ITEMS.find(x => x.code === code);
  const nm = $('siStdName');
  if (nm) nm.textContent = '工时标准：' + (item ? item.name : code);
  const body = $('siStdBody');
  if (body) body.innerHTML = siStdHtml(code);
  $('siStdMask').classList.add('show');
}
function siStdClose() { $('siStdMask').classList.remove('show'); }
/* 该服务项名下的全部标准工时（型号级/设备级），一眼回答"配了哪几层" */
function siStdHtml(code) {
  const ls = LABOR_STANDARDS.filter(function (x) { return x.item === code; });
  const ORD = { '型号级': 1, '设备级': 2 };   // 权重勿用 0：会被 ||9 兜底吞掉
  const sorted = ls.slice().sort(function (a, b) { return (ORD[a.scope] || 9) - (ORD[b.scope] || 9); });
  const rows = sorted.map(function (s) {
    const obj = s.scope === '型号级'
      ? ((s.models && s.models.length) ? esc(s.models.join('、')) : '—')
      : esc(devNameOf(s.dev));
    const mtTxt = s.mt ? '<b>' + esc(mtName(s.mt)) + '</b>' : '<span class="sub">通用（无类型）</span>';
    const cycTxt = s.cycle ? '<span class="tag info">' + esc(s.cycle) + '</span>' : '<span class="sub">—</span>';
    const hrs = (s.tiers && s.tiers.length)
      ? ('<b>' + s.tiers.length + '</b> 档（' + s.tiers.map(function (t) { return t.min + '-' + t.max + '缸 ' + hoursTxt(t.h, t.src); }).join(' / ') + '）')
      : (s.hours ? hoursTxt(s.hours, s.unit) : '<span class="tag bad">未配置</span>');
    return '<tr><td><span class="tag info">' + esc(s.scope) + '</span></td>'
      + '<td class="sub" style="max-width:260px">' + obj + '</td>'
      + '<td>' + mtTxt + '</td>'
      + '<td>' + cycTxt + '</td>'
      + '<td>' + crewChipsHtml(s.crew) + '</td>'
      + '<td class="num">' + hrs + '</td>'
      + '<td class="num"><b>' + Math.round(rateSumOf(s.crew)) + '</b> $/h</td></tr>';
  }).join('');
  return ls.length
    ? '<div class="t-wrap"><table class="t"><tr><th>适用范围</th><th>适用对象</th><th>维保类型</th><th>保养周期</th><th>人员配置</th><th>标准工时</th><th class="num">综合费率</th></tr>' + rows + '</table></div>'
    : '<div class="empty-tip">尚未配置任何工时——该服务项在客户侧不可计价（IN-MC-12）。<button class="btn sm pri" type="button" onclick="siStdClose();go(\'labor?si=' + encodeURIComponent(code) + '\')">去配工时</button></div>';
}
/* 名称「输入即过滤」（core.js liveFilter） */
function siQNameLive(inp) { pgReset('sitems'); liveFilter(inp, function (v) { siF.qName = v.trim(); }); }
/* 查询重置：分组 / 名称 / 覆盖状态全部回默认 */
function siResetQuery() { siF = { grp: 'all', qName: '', cov: 'all' }; pgReset('sitems'); renderView(); toast('已重置筛选'); }
function bindSitems() {
  const fg = $('nfGrp'); if (fg) fg.addEventListener('change', function () { siF.grp = fg.value; pgReset('sitems'); renderView(); });
  const fc = $('nfCov'); if (fc) fc.addEventListener('change', function () { siF.cov = fc.value; renderView(); });
}
function openSiModal() {
  // 分组非必填：首项「未分组」value 为空串，默认即未分组（先建项配工时、后归类）
  const sel = $('nsGrp');
  if (sel) sel.innerHTML = '<option value="">— 未分组 —</option>'
    + SGROUPS.map(function (g) { return '<option>' + esc(g) + '</option>'; }).join('');
  const u = $('nsUnit'); if (u && !u.value.trim()) u.value = '次';
  const n = $('nsName'); if (n) n.value = '';
  $('siMask').classList.add('show');
  setTimeout(function () { try { $('nsName').focus(); } catch (e) { } }, 30);
}
function siModalClose() { $('siMask').classList.remove('show'); }
/* —— 编辑模态窗：名称 / 分组 / 单位 统一在模态窗内修改 —— */
let _siEditCode = null;
function openSiEdit(code) {
  const item = SERVICE_ITEMS.find(x => x.code === code); if (!item) return;
  _siEditCode = code;
  // 分组非必填：空值（未分组）也要能选中并保存回去
  const sel = $('esGrp');
  if (sel) sel.innerHTML = '<option value=""' + (!item.grp ? ' selected' : '') + '>— 未分组 —</option>'
    + SGROUPS.map(function (g) { return '<option ' + (item.grp === g ? 'selected' : '') + '>' + esc(g) + '</option>'; }).join('');
  const n = $('esName'); if (n) n.value = item.name;
  const u = $('esUnit'); if (u) u.value = item.unit || '次';
  const tip = $('esCodeTip'); if (tip) tip.innerHTML = '';
  $('siEditMask').classList.add('show');
  setTimeout(function () { try { $('esName').focus(); $('esName').select(); } catch (e) { } }, 30);
}
function siEditClose() { _siEditCode = null; $('siEditMask').classList.remove('show'); }
function siEditSave() {
  const code = _siEditCode; if (!code) return;
  const item = SERVICE_ITEMS.find(x => x.code === code); if (!item) return;
  const name = $('esName').value.trim();
  const grp = $('esGrp').value;
  const unit = $('esUnit').value.trim() || '次';
  if (!name) { toast('名称不能为空'); $('esName').focus(); return; }
  if (SERVICE_ITEMS.some(x => x.name === name && x.code !== code)) { toast('服务项名称已存在（编码唯一 IN-MC-01）'); $('esName').focus(); return; }
  const oldName = item.name, oldUnit = item.unit || '次', oldGrp = item.grp || '';
  /* 名称（引用键）：级联同步字典映射 / SITEMS 镜像，并留痕 */
  if (name !== oldName) {
    item.name = name;
    const sm = SITEMS.find(x => x.code === code); if (sm) sm.name = name;
    if (labNameMap[oldName] === code) { delete labNameMap[oldName]; labNameMap[name] = code; }
  }
  /* 单位（D2 固有属性，不参与计价推导） */
  if (unit !== oldUnit) {
    item.unit = unit;
    const sm = SITEMS.find(x => x.code === code); if (sm) sm.unit = unit;
  }
  /* 分组（D2 固有属性，非必填：空 = 未分组） */
  if (grp !== oldGrp) {
    item.grp = grp;
    const sm = SITEMS.find(x => x.code === code); if (sm) sm.grp = grp;
  }
  siEditClose();
  renderView(); toast('已保存');
}
function addSi() {
  const name = $('nsName').value.trim();
  if (!name) { toast('请填写服务项名称'); $('nsName').focus(); return; }
  if (SERVICE_ITEMS.some(x => x.name === name)) { toast('服务项名称已存在（编码唯一 IN-MC-01）'); $('nsName').focus(); return; }
  let n = SERVICE_ITEMS.length + 1, code;
  do { code = 'LAB-' + String(n).padStart(3, '0'); n++; } while (SERVICE_ITEMS.some(x => x.code === code));
  SERVICE_ITEMS.push({
    code: code, name: name, grp: $('nsGrp').value, unit: $('nsUnit').value.trim() || '次',
    mt: null, cycle: null
  });
  siModalClose();
  renderView(); toast('定义已创建（待配置）');
  flashNewRow(name);
}
function delSi(code) {
  const item = SERVICE_ITEMS.find(x => x.code === code);
  if (!item) return;
  let nStd = LABOR_STANDARDS.filter(s => s.item === code).length;
  const nPkg = PACKAGES.filter(p => (p.items || []).some(r => r.ref === code)).length;
  const nRule = RULES.sug.filter(r => r.si === code).length;
  let warn = '';
  if (nStd || nPkg || nRule) {
    warn = '<div style="margin-top:8px;color:var(--gold-text)">注意：其名下 <b>' + nStd + '</b> 条标准工时将一并删除'
      + (nPkg ? '，且有 <b>' + nPkg + '</b> 个套餐明细引用它' : '')
      + (nRule ? '，<b>' + nRule + '</b> 条建议项规则引用它' : '') + '，相关方案将变为不可计价。</div>';
  }
  askDel({
    title: '删除服务项「' + item.name + '」？',
    msg: '将删除服务项 <b>' + esc(item.name) + '</b>（<code class="k">' + code + '</code>）及其全部标准工时配置。' + warn,
    label: '服务项 ' + item.name,
    run: function () { siRemove(code, item.name); },
    undo: function () { siRestore(code, item.name); }
  });
}
let _siBin = null;
function siRemove(code, name) {
  const bin = { item: null, sitem: null, siIdx: -1, stds: [] };
  const ii = SERVICE_ITEMS.findIndex(x => x.code === code);
  if (ii >= 0) { bin.item = SERVICE_ITEMS[ii]; SERVICE_ITEMS.splice(ii, 1); }
  const si = SITEMS.findIndex(x => x.code === code);
  if (si >= 0) { bin.sitem = SITEMS[si]; bin.siIdx = si; SITEMS.splice(si, 1); }
  for (let j = LABOR_STANDARDS.length - 1; j >= 0; j--) { if (LABOR_STANDARDS[j].item === code) { bin.stds.unshift({ i: j, o: LABOR_STANDARDS[j] }); LABOR_STANDARDS.splice(j, 1); } }
  delete labNameMap[name];
  _siBin = bin;
}
function siRestore(code, name) {
  const b = _siBin; if (!b) return;
  if (b.item && !SERVICE_ITEMS.some(x => x.code === code)) SERVICE_ITEMS.push(b.item);
  if (b.sitem && !SITEMS.some(x => x.code === code)) SITEMS.splice(Math.min(b.siIdx, SITEMS.length), 0, b.sitem);
  b.stds.forEach(function (s) { if (LABOR_STANDARDS.indexOf(s.o) < 0) LABOR_STANDARDS.splice(Math.min(s.i, LABOR_STANDARDS.length), 0, s.o); });
  labNameMap[name] = code;
  _siBin = null;
}

