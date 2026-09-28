/* ============================================================
   sel.js —— Select 选择器（Ant Design 风格 · 静态自绘版）
   ------------------------------------------------------------
   供 后台 preview 服务信息模拟器 / 前台 PC / 前台 H5 / 组件规范 共用，
   替换浏览器原生 <select>（原生下拉面板不可控，不符合 antd 规范）。
   约定（对齐 antd Select v5/v6 默认主题）：
     · 触发器：32px 高、border #d9d9d9 / hover #4096FF / open #1677FF+光圈，
       右侧箭头（open 旋转 180°），有值 hover 显示圆形清除（allowClear，可用 cfg 关闭）；
     · 面板：radius 8 + 三段式阴影，选项 28px 行高、hover #F5F5F5、
       选中加粗 + 右侧主色对勾、禁用置灰；空态「暂无数据」；越界自动翻到上方；
     · 键盘：Enter/Space/↓ 开合（焦点在触发器），面板内 ↑↓ 巡航、Enter 选中、
       Esc/Tab 关闭（与 core.js 树选择同款协议）；
     · 数据源：升级既有原生 <select>（隐藏保结构），选项每次打开时现读；
       选中后向原生 select 派发 'change'（既有级联监听零改动）；
       值为空且文案含「请选择」的 option 视为占位（触发器灰显、不进面板）。
   用法：SEL.mount(el) 升级；SEL.mount(el, { allowClear: false }) 去掉 hover 清除按钮（前台客户侧）；
       页面重建 el.options 后调 SEL.syncAll() 刷新触发器。
   ============================================================ */
(function () {
  if (window.SEL) return;

  var CSS = ''
   + '.selwrap{position:relative;display:inline-flex;width:100%;min-width:0;vertical-align:middle}'
   + '.selwrap .sel-native{display:none!important}'
   + '.sel-trig{position:relative;display:flex;align-items:center;width:100%;min-height:32px;padding:2px 30px 2px 11px;background:#fff;'
   +   'border:1px solid #d9d9d9;border-radius:6px;font-size:14px;color:rgba(0,0,0,.88);cursor:pointer;outline:none;box-sizing:border-box;'
   +   'transition:border-color .2s,box-shadow .2s;text-align:left}'
   + '.sel-trig:hover{border-color:#4096ff}'
   + '.sel-trig.open,.sel-trig:focus-visible{border-color:#1677ff;box-shadow:0 0 0 2px rgba(5,145,255,.1)}'
   + '.sel-label{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
   + '.sel-label.ph{color:rgba(0,0,0,.25)}'
   + '.sel-arrow{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;color:rgba(0,0,0,.45);transition:transform .2s;pointer-events:none}'
   + '.selwrap.open .sel-arrow{transform:translateY(-50%) rotate(180deg)}'
   + '.sel-clr{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,.45);'
   +   'color:#fff;display:none;align-items:center;justify-content:center;cursor:pointer}'
   + '.sel-clr:hover{background:rgba(0,0,0,.88)}'
   + '.selwrap.has-val:hover .sel-clr{display:flex}'
   + '.selwrap.has-val:hover .sel-arrow{display:none}'
   + '.selwrap.no-clr .sel-clr{display:none!important}'
   + '.selwrap.no-clr.has-val:hover .sel-arrow{display:flex}'
   + '.sel-panel{position:absolute;top:calc(100% + 4px);left:0;z-index:1055;min-width:100%;width:max-content;max-width:320px;background:#fff;border-radius:8px;'
   +   'box-shadow:0 6px 16px 0 rgba(0,0,0,.08),0 3px 6px -4px rgba(0,0,0,.12),0 9px 28px 8px rgba(0,0,0,.05);padding:4px;user-select:none;'
   +   'font:14px/1.5714 system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:rgba(0,0,0,.88)}'
   + '.sel-search{padding:2px 2px 6px}'
   + '.sel-search input{width:100%;height:28px;padding:0 8px;border:1px solid #d9d9d9;border-radius:6px;outline:none;font-size:13px;box-sizing:border-box}'
   + '.sel-search input:focus{border-color:#1677ff}'
   + '.sel-list{max-height:256px;overflow:auto}'
   + '.sel-opt{display:flex;align-items:center;gap:6px;min-height:28px;padding:5px 8px;border-radius:6px;cursor:pointer;color:rgba(0,0,0,.88)}'
   + '.sel-opt:hover,.sel-opt.on{background:#f5f5f5}'
   + '.sel-opt.selc{font-weight:600}'
   + '.sel-opt .sel-check{margin-left:auto;display:flex;color:#1677ff}'
   + '.sel-opt.dis{color:rgba(0,0,0,.25);cursor:not-allowed;background:transparent}'
   + '.sel-empty{padding:12px 8px;color:rgba(0,0,0,.45);text-align:center;font-size:13px}';

  var ARROW = '<svg viewBox="0 0 1024 1024" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"/></svg>';
  var CHECK = '<svg viewBox="64 64 896 896" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/></svg>';
  var CLR = '<svg viewBox="0 0 1024 1024" width="8" height="8" fill="currentColor" aria-hidden="true"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"/></svg>';

  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  function isPh(o) { return o.value === '' && /请选择/.test(o.text); }
  function optsOf(el, q) {
    var out = [];
    Array.prototype.forEach.call(el.options, function (o) {
      if (isPh(o)) return;
      if (q && o.text.toLowerCase().indexOf(q.toLowerCase()) < 0) return;
      out.push({ v: o.value, t: o.text, dis: !!o.disabled });
    });
    return out;
  }
  function labelOf(el) {
    var o = el.selectedOptions && el.selectedOptions[0];
    if (!o) return { t: '', ph: true };
    if (isPh(o)) return { t: o.text, ph: true };
    return { t: o.text, ph: false };
  }
  function curWrap(el) { return el.closest('.selwrap'); }

  function close(wrap) {
    if (!wrap) return;
    wrap.classList.remove('open');
    var t = wrap._trig; if (t) t.setAttribute('aria-expanded', 'false');
    var p = wrap.querySelector('.sel-panel'); if (p) p.remove();
  }
  function closeAll(except) {
    document.querySelectorAll('.selwrap.open').forEach(function (w) { if (w !== except) close(w); });
  }
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.selwrap.open').forEach(function (w) { if (!w.contains(e.target)) close(w); });
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openWrap) close(openWrap); });
  var openWrap = null;

  function renderPanel(wrap) {
    var el = wrap._el, st = wrap._st;
    var panel = wrap.querySelector('.sel-panel');
    if (!panel) { panel = document.createElement('div'); panel.className = 'sel-panel'; panel.setAttribute('role', 'listbox'); wrap.appendChild(panel); }
    panel.innerHTML = '';
    if (st.search) {
      var sb = document.createElement('div'); sb.className = 'sel-search';
      sb.innerHTML = '<input type="text" placeholder="请输入">';
      var inp = sb.querySelector('input');
      inp.value = st.q;
      inp.addEventListener('input', function () { st.q = this.value; renderList(wrap); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); st.act = 0; navKeys(wrap, e); } e.stopPropagation(); });
      panel.appendChild(sb);
    }
    var list = document.createElement('div'); list.className = 'sel-list'; panel.appendChild(list);
    fillList(wrap, list);
    return list;
  }
  function fillList(wrap, list) {
    var el = wrap._el, st = wrap._st;
    var opts = optsOf(el, st.q);
    var val = el.value;
    list.innerHTML = '';
    if (!opts.length) { var em = document.createElement('div'); em.className = 'sel-empty'; em.textContent = '暂无数据'; list.appendChild(em); st.act = -1; return; }
    if (st.act >= opts.length) st.act = opts.length - 1;
    opts.forEach(function (o, i) {
      var row = document.createElement('div');
      row.className = 'sel-opt' + (o.v === val ? ' selc' : '') + (i === st.act ? ' on' : '') + (o.dis ? ' dis' : '');
      row.setAttribute('role', 'option');
      row.setAttribute('aria-selected', o.v === val ? 'true' : 'false');
      var tx = document.createElement('span'); tx.textContent = o.t; row.appendChild(tx);
      if (o.v === val) { var ck = document.createElement('span'); ck.className = 'sel-check'; ck.innerHTML = CHECK; row.appendChild(ck); }
      if (!o.dis) {
        row.addEventListener('click', function (e) { e.stopPropagation(); pick(wrap, o.v); });
        row.addEventListener('mousemove', function () { st.act = i; Array.prototype.forEach.call(list.children, function (c, j) { c.classList.toggle('on', j === i); }); });
      }
      list.appendChild(row);
    });
  }
  function pick(wrap, v) {
    var el = wrap._el;
    close(wrap);
    if (el.value === v) return;
    el.value = v;
    sync(el);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function openPanel(wrap) {
    if (wrap.classList.contains('open')) return;
    closeAll();
    var el = wrap._el;
    wrap._st = { q: '', act: -1, search: !!(wrap._cfg && wrap._cfg.showSearch) };
    renderPanel(wrap);
    wrap.classList.add('open');
    wrap._trig.setAttribute('aria-expanded', 'true');
    openWrap = wrap;
    var panel = wrap.querySelector('.sel-panel');
    var r = panel.getBoundingClientRect(), vw = window.innerWidth || document.documentElement.clientWidth, vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.right > vw - 8) { panel.style.left = 'auto'; panel.style.right = '0'; }
    if (r.bottom > vh - 8) { panel.style.top = 'auto'; panel.style.bottom = 'calc(100% + 4px)'; }
  }
  function navKeys(wrap, e) {
    var list = wrap.querySelector('.sel-list'); if (!list) return;
    var opts = Array.prototype.filter.call(list.children, function (c) { return c.classList.contains('sel-opt') && !c.classList.contains('dis'); });
    if (!opts.length) return;
    var st = wrap._st;
    var vis = optsOf(wrap._el, st.q).filter(function (o) { return !o.dis; });
    if (e.key === 'ArrowDown') { e.preventDefault(); st.act = Math.min(st.act + 1, vis.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); st.act = Math.max(st.act - 1, 0); }
    else if (e.key === 'Enter') { e.preventDefault(); if (vis[st.act]) pick(wrap, vis[st.act].v); return; }
    Array.prototype.forEach.call(list.children, function (c, j) {
      var o = optsOf(wrap._el, st.q)[j];
      var vi = vis.indexOf(o);
      c.classList.toggle('on', vi === st.act);
      if (vi === st.act && c.scrollIntoView) c.scrollIntoView({ block: 'nearest' });
    });
  }

  function mount(el, cfg) {
    if (!el || el.dataset.sel) return;
    el.dataset.sel = '1';
    el.classList.add('sel-native');
    var wrap = document.createElement('span');
    wrap.className = 'selwrap';
    wrap._el = el;
    wrap._cfg = cfg || {};
    var noClr = wrap._cfg.allowClear === false;   // 前台客户侧：不显示清除按钮，hover 保留箭头
    if (noClr) wrap.classList.add('no-clr');
    if (el.style.cssText) { wrap.style.cssText = el.style.cssText; el.style.cssText = ''; }

    var trig = document.createElement('div');
    trig.className = 'sel-trig';
    trig.setAttribute('tabindex', '0');
    trig.setAttribute('role', 'combobox');
    trig.setAttribute('aria-haspopup', 'listbox');
    trig.setAttribute('aria-expanded', 'false');
    var label = document.createElement('span'); label.className = 'sel-label';
    var arrow = document.createElement('span'); arrow.className = 'sel-arrow'; arrow.innerHTML = ARROW;
    var clr = document.createElement('span'); clr.className = 'sel-clr'; clr.setAttribute('role', 'button'); clr.setAttribute('aria-label', '清除'); clr.innerHTML = CLR;
    trig.appendChild(label); trig.appendChild(arrow);
    if (!noClr) trig.appendChild(clr);
    wrap.appendChild(trig);
    wrap._trig = trig; wrap._label = label; wrap._clr = clr;

    trig.addEventListener('click', function (e) { e.stopPropagation(); if (wrap.classList.contains('open')) close(wrap); else openPanel(wrap); });
    /* 注意：不要在 focus 时自动展开——物理点击的 focus 先于 click 到达，会"开了又关"（与 dp.js 同款教训）；
       键盘由下方 keydown 的 Enter/Space/↓ 打开（antd 同款：Tab 聚焦不展开） */
    clr.addEventListener('click', function (e) {
      e.stopPropagation();
      var hasEmpty = Array.prototype.some.call(el.options, function (o) { return o.value === ''; });
      if (!el.value || !hasEmpty) return;
      el.value = '';
      sync(el);
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    trig.addEventListener('keydown', function (e) {
      var keys = ['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Escape', 'Tab'];
      if (keys.indexOf(e.key) < 0) return;
      e.stopPropagation();   // 阻断页面级 Enter 提交等全局快捷键
      if (e.key === 'Tab' || e.key === 'Escape') { close(wrap); return; }
      if (!wrap.classList.contains('open')) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); openPanel(wrap); }
        return;
      }
      e.preventDefault();
      navKeys(wrap, e);
    });
    el.addEventListener('change', function () { sync(el); });

    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);
    sync(el);
  }
  function sync(el) {
    var wrap = curWrap(el);
    if (!wrap) return;
    var L = labelOf(el);
    wrap._label.textContent = L.t;
    wrap._label.classList.toggle('ph', L.ph);
    wrap.classList.toggle('has-val', !L.ph);
    if (wrap.classList.contains('open')) fillList(wrap, wrap.querySelector('.sel-list'));
  }
  function syncAll() { document.querySelectorAll('select[data-sel]').forEach(sync); }

  window.SEL = { mount: mount, sync: sync, syncAll: syncAll };
})();
