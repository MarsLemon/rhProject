/* ============================================================
   dp.js —— DatePicker 日期选择（Ant Design 风格 · 静态自绘版）
   ------------------------------------------------------------
   供 后台 preview 服务信息模拟器 / 前台 PC / 前台 H5 共用，
   替换浏览器原生 <input type="date">（原生控件外观不可控，不符合 antd 风）。
   约定（对齐 antd DatePicker v5/v6 默认主题）：
     · 触发器：输入框 + 右侧日历图标；有值时 hover 显示清除（allowClear）；
     · 面板：头部 年月 + 上/下月 · 上/下年 导航；周日开头周表头；42 格日网格；
       当月外日期弱化、今天高亮主色、选中反白主色底、下限之前置灰不可选；
       底部「今天」快捷键；
     · 选择/清除后向 input 派发 'change' 事件（页面既有监听零改动）；
     · 可选下限每次打开时从 input.min（YYYY-MM-DD）现读；
     · 点击面板外 / Esc 关闭；面板越界自动右对齐或翻到上方。
   用法：DP(inputEl)；输入框会被置为只读文本框并包一层 .dp 容器。
   ============================================================ */
(function () {
  if (window.DP) return;

  var CSS = ''
   + '.dp{position:relative;display:inline-flex;align-items:center}'
   + '.dp .dp-input{padding-right:30px;cursor:pointer;caret-color:transparent}'
   + '.dp-ico,.dp-clr{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:16px;height:16px;display:flex;align-items:center;justify-content:center;color:rgba(0,0,0,.45)}'
   + '.dp-ico{pointer-events:none}'
   + '.dp-clr{display:none;pointer-events:auto;cursor:pointer;border-radius:50%;background:rgba(0,0,0,.45);color:#fff}'
   + '.dp-clr:hover{background:rgba(0,0,0,.88)}'
   + '.dp.has-val:hover .dp-ico{display:none}'
   + '.dp.has-val:hover .dp-clr{display:flex}'
   + '.dp-panel{position:absolute;top:calc(100% + 4px);left:0;z-index:1060;width:auto;min-width:254px;background:#fff;border-radius:8px;'
   +   'box-shadow:0 6px 16px 0 rgba(0,0,0,.08),0 3px 6px -4px rgba(0,0,0,.12),0 9px 28px 8px rgba(0,0,0,.05);padding:8px;'
   +   'font:14px/1.5714 system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:rgba(0,0,0,.88);user-select:none}'
   + '.dp-head{display:flex;align-items:center;gap:2px;padding:0 2px;height:32px}'
   + '.dp-nav{width:24px;height:24px;border:0;background:transparent;border-radius:6px;color:rgba(0,0,0,.88);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}'
   + '.dp-nav:hover{background:rgba(0,0,0,.06)}'
   + '.dp-title{flex:1;text-align:center;font-weight:600;color:rgba(0,0,0,.88)}'
   + '.dp-week,.dp-days{display:grid;grid-template-columns:repeat(7,34px)}'
   + '.dp-week th{height:28px;font-size:12px;font-weight:400;color:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center}'
   + '.dp-cell{height:30px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;color:rgba(0,0,0,.88)}'
   + '.dp-cell:hover{background:rgba(0,0,0,.06)}'
   + '.dp-cell.out{color:rgba(0,0,0,.25)}'
   + '.dp-cell.today{color:#1677ff;font-weight:600}'
   + '.dp-cell.sel{background:#1677ff;color:#fff;font-weight:600}'
   + '.dp-cell.sel:hover{background:#4096ff}'
   + '.dp-cell.dis{color:rgba(0,0,0,.25);cursor:not-allowed;background:transparent}'
   + '.dp-foot{display:flex;justify-content:flex-start;padding:6px 8px 2px;border-top:1px solid #f0f0f0;margin-top:6px}'
   + '.dp-today{color:#1677ff;cursor:pointer;border:0;background:transparent;padding:0;font-size:14px}'
   + '.dp-today:hover{text-decoration:underline}';

  var CAL_SVG = '<svg viewBox="64 64 896 896" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H184c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h696c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zm-40 656H184V460h656v380zM184 392V256h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v136H184z"/></svg>';
  var CLR_SVG = '<svg viewBox="0 0 1024 1024" width="10" height="10" fill="currentColor" aria-hidden="true"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"/></svg>';
  function chev(n) { /* n=1 单箭头（月），n=2 双箭头（年）；dir 由调用方翻转 */
    var paths = n === 2 ? '<path d="M13 4 8 9l5 5"/><path d="M8 4 3 9l5 5"/>' : '<path d="M10.5 4 5.5 9l5 5"/>';
    return '<svg viewBox="0 0 16 18" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  var L1 = chev(1), L2 = chev(2);
  function flip(svg) { return '<span style="display:inline-flex;transform:scaleX(-1)">' + svg + '</span>'; }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  var TODAY = fmt(new Date());

  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  function closeAll(except) {
    document.querySelectorAll('.dp.open').forEach(function (w) {
      if (w !== except) w.classList.remove('open');
      var p = w.querySelector('.dp-panel'); if (p) p.remove();
    });
  }
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.dp.open').forEach(function (w) {
      if (!w.contains(e.target)) { w.classList.remove('open'); var p = w.querySelector('.dp-panel'); if (p) p.remove(); }
    });
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  window.DP = function (input) {
    if (!input || input.dataset.dp) return;
    input.dataset.dp = '1';
    input.type = 'text';
    input.setAttribute('readonly', 'readonly');
    input.classList.add('dp-input');
    if (!input.getAttribute('placeholder')) input.setAttribute('placeholder', 'YYYY-MM-DD');

    var wrap = document.createElement('span');
    wrap.className = 'dp';
    wrap.style.width = input.style.width || '100%';
    input.style.width = '100%';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    var ico = document.createElement('span'); ico.className = 'dp-ico'; ico.innerHTML = CAL_SVG; wrap.appendChild(ico);
    var clr = document.createElement('span'); clr.className = 'dp-clr'; clr.setAttribute('role', 'button'); clr.setAttribute('aria-label', '清除'); clr.innerHTML = CLR_SVG; wrap.appendChild(clr);

    function syncVal() { wrap.classList.toggle('has-val', !!input.value); }

    function minStr() { return parse(input.min) ? input.min : null; }

    function render(panel, view) {
      var min = minStr();
      panel.innerHTML = '';
      var head = document.createElement('div'); head.className = 'dp-head';
      function nav(svg, fn, label) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'dp-nav';
        b.innerHTML = svg; b.setAttribute('aria-label', label);
        b.onclick = function (e) { e.stopPropagation(); fn(); render(panel, view); };
        return b;
      }
      var shift = function (dm, dy) { return function () { var d = new Date(view.y + dy, view.m + dm, 1); view.y = d.getFullYear(); view.m = d.getMonth(); }; };
      head.appendChild(nav(L2, shift(0, -1), '上一年'));
      head.appendChild(nav(L1, shift(-1, 0), '上个月'));
      var t = document.createElement('span'); t.className = 'dp-title'; t.textContent = view.y + '年' + (view.m + 1) + '月';
      head.appendChild(t);
      head.appendChild(nav(flip(L1), shift(1, 0), '下个月'));
      head.appendChild(nav(flip(L2), shift(0, 1), '下一年'));
      panel.appendChild(head);

      var week = document.createElement('div'); week.className = 'dp-week';
      ['日', '一', '二', '三', '四', '五', '六'].forEach(function (w) {
        var th = document.createElement('th'); th.textContent = w; week.appendChild(th);
      });
      panel.appendChild(week);

      var days = document.createElement('div'); days.className = 'dp-days';
      var first = new Date(view.y, view.m, 1);
      var start = new Date(view.y, view.m, 1 - first.getDay());
      var sel = input.value;
      for (var i = 0; i < 42; i++) {
        (function (d) {
          var s = fmt(d);
          var c = document.createElement('div'); c.className = 'dp-cell'; c.textContent = d.getDate();
          if (d.getMonth() !== view.m) c.classList.add('out');
          if (s === TODAY) c.classList.add('today');
          if (s === sel) c.classList.add('sel');
          if (min && s < min) { c.classList.add('dis'); c.classList.remove('sel', 'today'); }
          else c.onclick = function (e) { e.stopPropagation(); input.value = s; syncVal(); closeAll(); input.dispatchEvent(new Event('change', { bubbles: true })); };
          days.appendChild(c);
        })(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
      }
      panel.appendChild(days);

      var foot = document.createElement('div'); foot.className = 'dp-foot';
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'dp-today'; btn.textContent = '今天';
      if (min && TODAY < min) btn.disabled = true;
      btn.onclick = function (e) { e.stopPropagation(); input.value = TODAY; syncVal(); closeAll(); input.dispatchEvent(new Event('change', { bubbles: true })); };
      foot.appendChild(btn);
      panel.appendChild(foot);
    }

    function open() {
      if (wrap.classList.contains('open')) return;   // 幂等：focus 与 click 会在同一次物理点击内先后到达
      closeAll();
      var d = parse(input.value) || new Date();
      var panel = document.createElement('div'); panel.className = 'dp-panel';
      wrap.appendChild(panel);
      wrap.classList.add('open');
      render(panel, { y: d.getFullYear(), m: d.getMonth() });
      /* 越界翻转：右侧放不下改右对齐；下方放不下翻到触发器上方 */
      var r = panel.getBoundingClientRect(), vw = window.innerWidth || document.documentElement.clientWidth, vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.right > vw - 8) { panel.style.left = 'auto'; panel.style.right = '0'; }
      if (r.bottom > vh - 8) { panel.style.top = 'auto'; panel.style.bottom = 'calc(100% + 4px)'; }
    }

    ico.addEventListener('click', function (e) { e.stopPropagation(); if (wrap.classList.contains('open')) closeAll(); else open(); });
    input.addEventListener('click', function (e) { e.stopPropagation(); open(); });
    input.addEventListener('focus', function () { open(); });
    clr.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!input.value) return;
      input.value = ''; syncVal(); closeAll();
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    syncVal();
  };
})();
