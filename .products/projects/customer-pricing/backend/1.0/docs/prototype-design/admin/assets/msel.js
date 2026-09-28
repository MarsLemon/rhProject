/* ============================================================
   msel.js —— Select 多选（Ant Design 风格 · 静态自绘版）
   ------------------------------------------------------------
   供 工时标准新增抽屉「适用型号」等复用，对齐 antd Select v5 multiple：
     · 触发器：min-height 32px、border #d9d9d9 / hover #4096FF / 聚焦 #1677FF+光圈；
       已选项渲染为可单独移除的 tag（半透明底 + 小叉），内联输入即搜；
       有值 hover 显示清除（清空全部）；箭头 open 旋转 180°；
     · 面板：radius 8 + 三段式阴影，选项 28px 行高、hover #F5F5F5、
       选中浅底 + 右侧主色对勾；空态「暂无数据」；越界自动翻转；
     · 交互：点选项即勾选/取消（面板不关，antd 同款）；Backspace 删除最后一个 tag；
       ↑↓ 巡航、Enter 勾选；Esc / 外点关闭；点击已展开面板的输入框不收起；
     · 用法：MSEL.mount(el, { options, value, placeholder, onChange, emptyText })
       options / value 可传数组或取值函数；onChange(next) 回传选中项副本。
       容器被重建（如抽屉重绘）后需重新 mount，从最新外部状态重新取值。
   ============================================================ */
(function () {
  if (window.MSEL) return;

  var CSS = ''
   + '.mswrap{position:relative;display:block;width:100%;font:14px/1.5714 system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}'
   + '.ms-sel{position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:4px;min-height:32px;padding:3px 30px 3px 7px;background:#fff;'
   +   'border:1px solid #d9d9d9;border-radius:6px;color:rgba(0,0,0,.88);cursor:pointer;box-sizing:border-box;transition:border-color .2s,box-shadow .2s}'
   + '.ms-sel:hover{border-color:#4096ff}'
   + '.ms-sel.open,.ms-sel:focus-within{border-color:#1677ff;box-shadow:0 0 0 2px rgba(5,145,255,.1)}'
   + '.ms-tag{display:inline-flex;align-items:center;gap:3px;height:24px;max-width:100%;padding:0 3px 0 8px;background:rgba(0,0,0,.06);'
   +   'border-radius:4px;font-size:13px;color:rgba(0,0,0,.88);transition:background-color .2s}'
   + '.ms-tag:hover{background:rgba(0,0,0,.12)}'
   + '.ms-tag .t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
   + '.ms-tag .x{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:2px;color:rgba(0,0,0,.45);cursor:pointer}'
   + '.ms-tag .x:hover{color:rgba(0,0,0,.88)}'
   + '.ms-input{flex:1;min-width:56px;height:24px;padding:0;border:none;outline:none;background:transparent;font:inherit;color:rgba(0,0,0,.88)}'
   + '.ms-input::placeholder{color:rgba(0,0,0,.25)}'
   + '.ms-arrow{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;color:rgba(0,0,0,.45);transition:transform .2s;pointer-events:none}'
   + '.mswrap.open .ms-arrow{transform:translateY(-50%) rotate(180deg)}'
   + '.ms-clr{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,.45);'
   +   'color:#fff;display:none;align-items:center;justify-content:center;cursor:pointer}'
   + '.ms-clr:hover{background:rgba(0,0,0,.88)}'
   + '.mswrap.has-val:hover .ms-clr{display:flex}'
   + '.mswrap.has-val:hover .ms-arrow{display:none}'
   + '.ms-panel{position:absolute;top:calc(100% + 4px);left:0;z-index:1055;min-width:100%;width:max-content;max-width:340px;background:#fff;border-radius:8px;'
   +   'box-shadow:0 6px 16px 0 rgba(0,0,0,.08),0 3px 6px -4px rgba(0,0,0,.12),0 9px 28px 8px rgba(0,0,0,.05);padding:4px;user-select:none;color:rgba(0,0,0,.88)}'
   + '.ms-list{max-height:256px;overflow:auto}'
   + '.ms-opt{display:flex;align-items:center;gap:6px;min-height:28px;padding:5px 8px;border-radius:6px;cursor:pointer}'
   + '.ms-opt:hover{background:#f5f5f5}'
   + '.ms-opt.on{background:#f5f5f5}'
   + '.ms-opt.selc{background:rgba(0,0,0,.06)}'
   + '.ms-opt .ms-check{margin-left:auto;display:flex;color:#1677ff}'
   + '.ms-empty{padding:12px 8px;color:rgba(0,0,0,.45);text-align:center;font-size:13px}';

  var ARROW = '<svg viewBox="0 0 1024 1024" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"/></svg>';
  var CHECK = '<svg viewBox="64 64 896 896" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/></svg>';
  var CLR = '<svg viewBox="0 0 1024 1024" width="8" height="8" fill="currentColor" aria-hidden="true"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"/></svg>';

  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  var OPEN = null;   // 当前展开的实例（全局单选：打开新面板时收起旧的）

  function mount(el, cfg) {
    if (!el || el.dataset.msel) return;
    el.dataset.msel = '1';
    cfg = cfg || {};
    var getOptions = (typeof cfg.options === 'function') ? cfg.options : function () { return cfg.options || []; };
    var values = (typeof cfg.value === 'function' ? cfg.value() : (cfg.value || [])).slice();

    el.classList.add('mswrap');
    el.innerHTML = '';
    var trig = document.createElement('div');
    trig.className = 'ms-sel';
    var input = document.createElement('input');
    input.className = 'ms-input';
    input.type = 'text';
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    var arrow = document.createElement('span'); arrow.className = 'ms-arrow'; arrow.innerHTML = ARROW;
    var clr = document.createElement('span'); clr.className = 'ms-clr'; clr.setAttribute('role', 'button'); clr.setAttribute('aria-label', '清除'); clr.innerHTML = CLR;
    trig.appendChild(input); trig.appendChild(arrow); trig.appendChild(clr);
    el.appendChild(trig);

    var open = false, q = '', actIdx = -1;
    var inst = { wrap: el, close: closePanel };

    function change() { if (cfg.onChange) cfg.onChange(values.slice()); }
    function visOpts() {
      var kw = (q || '').trim().toLowerCase();
      return getOptions().filter(function (n) { return !kw || String(n).toLowerCase().indexOf(kw) >= 0; });
    }
    function renderTags() {
      Array.prototype.forEach.call(el.querySelectorAll('.ms-tag'), function (t) { t.remove(); });
      values.forEach(function (v) {
        var tag = document.createElement('span'); tag.className = 'ms-tag';
        var t = document.createElement('span'); t.className = 't'; t.textContent = v;
        var x = document.createElement('span'); x.className = 'x'; x.setAttribute('role', 'button'); x.setAttribute('aria-label', '移除'); x.innerHTML = CLR;
        x.addEventListener('click', function (e) { e.stopPropagation(); toggle(v); });
        tag.appendChild(t); tag.appendChild(x);
        trig.insertBefore(tag, input);
      });
      input.placeholder = values.length ? '' : (cfg.placeholder || '');
      el.classList.toggle('has-val', values.length > 0);
    }
    function fillList() {
      var list = el.querySelector('.ms-list'); if (!list) return;
      var opts = visOpts();
      if (actIdx >= opts.length) actIdx = opts.length - 1;
      list.innerHTML = '';
      if (!opts.length) {
        var em = document.createElement('div'); em.className = 'ms-empty'; em.textContent = cfg.emptyText || '暂无数据';
        list.appendChild(em); return;
      }
      opts.forEach(function (n, i) {
        var selc = values.indexOf(n) >= 0;
        var row = document.createElement('div');
        row.className = 'ms-opt' + (selc ? ' selc' : '') + (i === actIdx ? ' on' : '');
        row.setAttribute('role', 'option');
        row.setAttribute('aria-selected', selc ? 'true' : 'false');
        var tx = document.createElement('span'); tx.textContent = n; row.appendChild(tx);
        if (selc) { var ck = document.createElement('span'); ck.className = 'ms-check'; ck.innerHTML = CHECK; row.appendChild(ck); }
        row.addEventListener('click', function (e) { e.stopPropagation(); toggle(n); });
        row.addEventListener('mousemove', function () {
          actIdx = i;
          Array.prototype.forEach.call(list.children, function (c, j) { c.classList.toggle('on', j === i); });
        });
        list.appendChild(row);
      });
      var act = list.children[actIdx];
      if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest' });
    }
    function toggle(v) {
      var k = values.indexOf(v);
      if (k >= 0) values.splice(k, 1); else values.push(v);
      renderTags(); change();
      if (open) fillList();
    }
    function openPanel() {
      if (open) return;
      if (OPEN && OPEN.wrap !== el) OPEN.close();
      var panel = document.createElement('div');
      panel.className = 'ms-panel';
      panel.setAttribute('role', 'listbox');
      panel.setAttribute('aria-multiselectable', 'true');
      var list = document.createElement('div'); list.className = 'ms-list'; panel.appendChild(list);
      el.appendChild(panel);
      open = true; actIdx = -1;
      el.classList.add('open'); trig.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
      OPEN = inst;
      fillList();
      try { input.focus(); } catch (e2) { }
      /* 越界翻转：贴近最近滚动容器（抽屉 .dbody）或视口底 / 右时翻向另一侧 */
      var host = el.closest('.dbody');
      var limit = host ? host.getBoundingClientRect().bottom : (window.innerHeight || document.documentElement.clientHeight);
      var vw = window.innerWidth || document.documentElement.clientWidth;
      var r = panel.getBoundingClientRect();
      if (r.bottom > limit - 8) { panel.style.top = 'auto'; panel.style.bottom = 'calc(100% + 4px)'; }
      if (r.right > vw - 8) { panel.style.left = 'auto'; panel.style.right = '0'; }
    }
    function closePanel() {
      if (!open) return;
      open = false;
      el.classList.remove('open'); trig.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
      var p = el.querySelector('.ms-panel'); if (p) p.remove();
      if (OPEN === inst) OPEN = null;
    }

    trig.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.ms-tag')) return;   // tag 与 × 自行处理
      if (e.target === input) { if (!open) openPanel(); return; }    // 点输入框：保持/打开
      if (open) closePanel(); else openPanel();                      // 点空白 / 箭头：开合
    });
    clr.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!values.length) return;
      values.length = 0;
      renderTags(); change();
      if (open) fillList();
    });
    input.addEventListener('input', function () {
      q = input.value;
      actIdx = -1;
      if (!open) { openPanel(); return; }
      fillList();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (open) { e.stopPropagation(); closePanel(); } return; }
      if (e.key === 'Backspace' && input.value === '' && values.length) {
        e.preventDefault();
        values.splice(values.length - 1, 1);
        renderTags(); change();
        if (open) fillList();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!open) { openPanel(); return; }
        var opts = visOpts();
        if (!opts.length) return;
        var d = e.key === 'ArrowDown' ? 1 : -1;
        actIdx = (actIdx < 0) ? (d > 0 ? 0 : opts.length - 1) : Math.max(0, Math.min(actIdx + d, opts.length - 1));
        fillList();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!open) { openPanel(); return; }
        var vis = visOpts();
        if (actIdx < 0 && vis.length === 1) actIdx = 0;   // 仅剩一项时回车直接选中
        if (vis[actIdx]) toggle(vis[actIdx]);
        return;
      }
    });

    renderTags();
  }

  document.addEventListener('click', function (e) {
    if (OPEN && !OPEN.wrap.contains(e.target)) OPEN.close();
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && OPEN) OPEN.close();
  });

  window.MSEL = { mount: mount };
})();
