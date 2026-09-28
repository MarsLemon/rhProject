/* 维保类型 —— 由全模块版拆分生成 */
/* ============================================================
   视图：维保类型（保养周期字典已从本页隐藏，周期数据仍供其他页作为选项使用）
   —— 维保类型的新增 / 编辑统一在模态窗内完成（名称 / 保养周期 / 适用设备挂载）；
      表格只做只读展示，避免行内边改边存带来的误触与半途状态。
      周期字典仍是页内字典，与维保类型无关（D10：5年/10年是周期，不是类型）。
   ============================================================ */
let mtQName = '';   // 维保类型名称过滤（输入即过滤）
function vMtype() {
  const q = (mtQName || '').trim().toLowerCase();
  const list = MTYPES.filter(function (t) { return !q || t.name.toLowerCase().indexOf(q) >= 0; });
  return '<div class="card"><div class="cardbar">'
    + '<span class="fgroup"><span class="fl">维保类型</span>'
    + '<span class="qwrap"><input class="txt" id="mtQInp" placeholder="请输入" value="' + esc(mtQName) + '" style="width:200px" oninput="mtQLive(this)"><button type="button" class="qclear" role="button" aria-label="清除" title="清除" onclick="qClearClick(this)">×</button></span></span>'
    + '<button class="btn pri sm" type="button" onclick="openMtModal()">新增</button></div>'
    + '<div class="t-wrap"><table class="t"><tr><th>编码</th><th>维保类型</th><th>保养周期</th><th>适用设备</th><th>操作</th></tr>'
    + (list.length ? list.map(t => {
      const mounted = deviceLeaves().filter(d => (d.mts || []).includes(t.code));
      return '<tr><td><code class="k">' + t.code + '</code></td><td><b>' + esc(t.name) + '</b></td>'
        // 保养周期列：有值即启用（不再额外打「启用」标签），无值＝未启用
        + '<td>' + (t.cycle ? CYCLES.map(c => '<span class="tag info">' + esc(c) + '</span>').join(' ') : '<span class="sub">未启用</span>') + '</td>'
        + '<td>' + (mounted.length
          ? mounted.map(d => '<span class="crew-chip" style="color:var(--sub);background:var(--chip);font-size:11.5px;padding:3px 8px">' + esc(d.name) + '</span>').join('')
          : '<span class="tag bad">⚠ 未挂载（前台不可见）</span>') + '</td>'
        + '<td><button class="btn sm" type="button" onclick="openMtEdit(\'' + t.code + '\')">编辑</button> <button class="btn sm danger" type="button" onclick="delMtype(\'' + t.code + '\')">删除</button></td></tr>';
    }).join('')
      : '<tr><td colspan="5"><div class="empty-tip">没有匹配' + (q ? '「' + esc(mtQName) + '」' : '') + '的维保类型</div></td></tr>')
    + '</table></div>'
    + '</div>';
}
/* 维保类型名称「输入即过滤」（core.js liveFilter；清除按钮由 qClearClick 处理） */
function mtQLive(inp) { liveFilter(inp, function (v) { mtQName = v; }); }
/* ============================================================
   维保类型模态窗：新增 / 编辑共用（草稿态，保存才落库）
   ============================================================ */
let _mt = null;   // {mode:'new'|'edit', code, devs:[]} —— devs 是草稿：挂载增删只改草稿，保存时才写入设备 mts
function mtOf(code) { return MTYPES.find(t => t.code === code) || null; }
/* 该类型的配置引用面（删除拦截 / 取消挂载提示用） */
function mtRefs(code) {
  const refs = [];
  const nStd = LABOR_STANDARDS.filter(s => s.mt === code).length;
  if (nStd) refs.push('标准工时（' + nStd + ' 条）');
  if (PACKAGES.some(p => p.mt === code)) refs.push('套餐');
  if (RULES.pkg.concat(RULES.sug).some(r => r.mt === code)) refs.push('展示/建议规则');
  return refs;
}
/* IN-MC-09：仍带周期配置的引用——关闭周期前必须清空 */
function mtCycleRefs(code) {
  const refs = [];
  if (RULES.pkg.concat(RULES.sug).some(r => r.mt === code && r.cycle)) refs.push('展示/建议规则');
  const nStd = LABOR_STANDARDS.filter(s => s.mt === code && s.cycle).length;
  if (nStd) refs.push('标准工时（' + nStd + ' 条）');
  return refs;
}
function openMtModal() {
  _mt = { mode: 'new', code: null, devs: [] };
  $('mtTitle').textContent = '新增维保类型';
  $('mtNameInp').value = '';
  $('mtCycleInp').checked = false;
  $('mtOk').textContent = '保存';
  mtRenderModal();
  $('mtMask').classList.add('show');
  setTimeout(function () { try { $('mtNameInp').focus(); } catch (e) { } }, 30);
}
function openMtEdit(code) {
  const t = mtOf(code); if (!t) return;
  _mt = {
    mode: 'edit', code: code,
    devs: deviceLeaves().filter(d => (d.mts || []).includes(code)).map(d => d.code)
  };
  $('mtTitle').textContent = '编辑维保类型';
  $('mtNameInp').value = t.name;
  $('mtCycleInp').checked = !!t.cycle;
  $('mtOk').textContent = '保存';
  mtRenderModal();
  $('mtMask').classList.add('show');
  setTimeout(function () { try { $('mtNameInp').focus(); $('mtNameInp').select(); } catch (e) { } }, 30);
}
function mtModalClose() { _mt = null; $('mtMask').classList.remove('show'); }
/* 模态窗内区重绘：周期项预览 + 适用设备草稿（不影响已填的名称） */
function mtRenderModal() {
  if (!_mt) return;
  const on = $('mtCycleInp').checked;
  const leaves = deviceLeaves();
  $('mtDevBox').innerHTML = _mt.devs.map(function (dc) {
    const d = catFind(dc);
    return '<span class="crew-chip" style="color:var(--sub);background:var(--chip);font-size:11.5px;padding:3px 8px">' + esc(d ? d.name : dc)
      + ' <a style="color:var(--error);cursor:pointer;text-decoration:none" data-dc="' + dc + '" onclick="mtDevDel(this.dataset.dc)" title="取消挂载">×</a></span>';
  }).join('')
    + (leaves.length > _mt.devs.length
      ? ' <select class="select" style="max-width:180px" onchange="mtDevAdd(this.value);this.selectedIndex=0">'
      + '<option value="">＋适用设备</option>'
      + leaves.filter(d => _mt.devs.indexOf(d.code) < 0).map(d => '<option value="' + d.code + '">' + esc(d.name) + '</option>').join('')
      + '</select>' : '');
  /* 关闭周期的实时预警：有带周期引用时不允许关闭（IN-MC-09），提前告知而不是等保存报错 */
  let warn = '';
  if (_mt.mode === 'edit') {
    const t = mtOf(_mt.code);
    if (t && t.cycle && !on) {
      const r = mtCycleRefs(_mt.code);
      if (r.length) warn = '<div style="color:var(--gold-text)">不可关闭：' + r.join('、') + ' 仍带周期配置（IN-MC-09），需先清理这些配置。</div>';
    }
  }
  $('mtTip').innerHTML = warn;
}
function mtDevAdd(dc) {
  if (!_mt || !dc) return;
  if (!catFind(dc) || _mt.devs.indexOf(dc) >= 0) return;
  _mt.devs.push(dc);
  mtRenderModal();
}
function mtDevDel(dc) {
  if (!_mt) return;
  const d = catFind(dc);
  function doIt() { _mt.devs = _mt.devs.filter(x => x !== dc); mtRenderModal(); }
  if (_mt.mode === 'edit') {
    const refs = mtRefs(_mt.code);
    if (refs.length) {
      confirmBox({
        title: '取消挂载？', okText: '取消挂载', danger: false,
        msg: '草稿中将把维保类型 <b>' + esc((mtOf(_mt.code) || {}).name) + '</b> 从设备 <b>' + esc(d ? d.name : dc) + '</b> 上取消挂载（保存后生效）；'
          + '前台该设备的类型下拉不再出现此类型。该类型名下仍有 ' + refs.join('、') + '，相关配置保留但不再命中。',
        onOk: doIt
      });
      return;
    }
  }
  doIt();
}
function mtModalSave() {
  if (!_mt) return;
  const name = ($('mtNameInp').value || '').trim();
  if (!name) { toast('请填写维保类型名称'); $('mtNameInp').focus(); return; }
  const cycle = !!$('mtCycleInp').checked;
  if (_mt.mode === 'new') return mtSaveNew(name, cycle);
  return mtSaveEdit(name, cycle);
}
function mtSaveNew(name, cycle) {
  if (MTYPES.some(t => t.name === name)) { toast('维保类型名称已存在'); $('mtNameInp').focus(); return; }
  let n = MTYPES.length + 1, code;
  do { code = 'MT-' + String(n).padStart(3, '0'); n++; } while (MTYPES.find(t => t.code === code));
  const devs = _mt.devs.slice();
  MTYPES.push({ code: code, name: name, cycle: cycle });
  devs.forEach(function (dc) { const d = catFind(dc); if (d) (d.mts = d.mts || []).push(code); });
  mtModalClose(); renderView(); flashNewRow(name);
  toast('类型已新增' + (cycle ? '（已启用周期：其规则/工时/费用必须带周期 IN-MC-09）' : ''));
}
function mtSaveEdit(name, cycle) {
  const t = mtOf(_mt.code); if (!t) { mtModalClose(); return; }
  if (MTYPES.some(x => x.name === name && x.code !== t.code)) { toast('维保类型名称已存在'); $('mtNameInp').focus(); return; }
  if (!cycle && t.cycle) {
    const r = mtCycleRefs(t.code);
    if (r.length) { toast('不可关闭保养周期：' + r.join('、') + ' 仍带周期配置（IN-MC-09），先清理后再关闭'); return; }
  }
  const parts = [];
  if (name !== t.name) {
    t.name = name; parts.push('名称');
  }
  if (cycle !== !!t.cycle) {
    t.cycle = cycle;
    parts.push(cycle ? '启用周期' : '关闭周期');
  }
  /* 适用设备：草稿 vs 现存求差集，一次性落库 + 可撤销（撤销回滚全部设备的 mts 快照） */
  const cur = deviceLeaves().filter(d => (d.mts || []).includes(t.code)).map(d => d.code);
  const add = _mt.devs.filter(c => cur.indexOf(c) < 0);
  const del = cur.filter(c => _mt.devs.indexOf(c) < 0);
  let undoH = null;
  if (add.length || del.length) {
    const snap = deviceLeaves().map(function (d) { return { d: d, mts: (d.mts || []).slice() }; });
    add.forEach(function (c) { const d = catFind(c); if (d) (d.mts = d.mts || []).push(t.code); });
    del.forEach(function (c) { const d = catFind(c); if (d) d.mts = (d.mts || []).filter(x => x !== t.code); });
    const names = add.concat(del).map(function (c) { const d = catFind(c); return d ? d.name : c; });
    undoH = undoPush('维保类型 ' + t.name + ' 的适用设备变更', function () {
      snap.forEach(function (s) { s.d.mts = s.mts.slice(); });
    });
    parts.push('适用设备 ＋' + add.length + '／－' + del.length);
  }
  mtModalClose(); renderView();
  let msg = parts.length ? '已保存：' + parts.join('、') : '无改动';
  if (undoH) undoToast(msg, undoH); else toast(msg);
}
function delMtype(code) {
  const i = MTYPES.findIndex(t => t.code === code); if (i < 0) return;
  const t = MTYPES[i];
  const refs = mtRefs(code);
  if (refs.length) { toast('被引用：' + refs.join('、') + '——不可删除，可改停用'); return; }
  /* 设备挂载快照：删除时解挂，撤销时原样恢复 */
  const snap = deviceLeaves().filter(d => (d.mts || []).includes(code)).map(d => ({ d: d, mts: (d.mts || []).slice() }));
  askDel({
    title: '删除维保类型「' + t.name + '」？',
    msg: '将删除维保类型 <b>' + esc(t.name) + '</b>（<code class="k">' + t.code + '</code>）及其在 ' + snap.length + ' 台设备上的挂载关系；前台该类型下拉不再出现。',
    label: '维保类型 ' + t.name,
    run: function () {
      MTYPES.splice(i, 1);
      snap.forEach(function (s) { s.d.mts = s.d.mts.filter(x => x !== code); });
    },
    undo: function () {
      MTYPES.splice(i, 0, t);
      snap.forEach(function (s) { s.d.mts = s.mts.slice(); });
    }
  });
}

