/* ============================================================
   core.js —— 工具函数 / 侧边导航 / 视图框架（所有页面共用）
   ============================================================ */
const PAGE = document.body.dataset.page || 'category';
let view = PAGE;            // 兼容原单页变量名
const $ = id => document.getElementById(id);
let _toastT=null;
/* antd message 语义图标（filled 圆形 + 白色符号） */
const MSG_ICO={
  success:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#52c41a"/><path d="m7.5 12.3 3 3 6-6.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  warning:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#faad14"/><path d="M12 6.8v6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1.3" fill="#fff"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#1677ff"/><path d="M12 10.8v6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="7.4" r="1.3" fill="#fff"/></svg>'
};
/* 无类型的 toast 按文案自动判定语义：告诫类（请/未/不能…）→ warning，其余 → success */
function msgType(msg){ return /^(请|未|不能|无法|无|不|失败|已存在|不存在|越界|超出)/.test(msg)?'warning':'success'; }
function toast(msg, undoFn){
  const t=$('toastEl');
  const ico='<span class="t-ico" aria-hidden="true">'+MSG_ICO[undoFn?'info':msgType(msg)]+'</span>';
  t.innerHTML=ico+'<span>'+esc(msg)+'</span>'+(undoFn?'<button class="tundo" id="tUndoBtn" type="button">撤销</button>':'');
  t.classList.add('show');
  if(_toastT) clearTimeout(_toastT);
  const b=$('tUndoBtn');
  if(b) b.onclick=function(){ t.classList.remove('show'); if(undoFn) undoFn(); };
  _toastT=setTimeout(()=>t.classList.remove('show'), undoFn?6000:1800);
}
/* ============================================================
   删除二次确认 + 可撤销（用户视角 P0）
   —— 所有破坏性操作统一走 askDel：先确认（说明影响面），再执行，
      成功后 toast 提供 6s 撤销入口，撤销即完整回滚（含关联数据）。
   ============================================================ */
const UNDO_STACK=[];
function undoPush(label, fn){ const h={label:label, fn:fn}; UNDO_STACK.push(h); return h; }
function undoRun(h){
  const i=UNDO_STACK.indexOf(h); if(i<0) return;
  UNDO_STACK.splice(i,1);
  h.fn(); renderView(); toast('已撤销：'+h.label);
}
function undoToast(msg, h){ toast(msg, function(){ undoRun(h); }); }
/* antd Modal.confirm 标题图标：危险确认（红叹号）/ 一般确认（蓝问号） */
const CF_ICO={
  danger:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#ff4d4f"/><path d="M12 6.8v6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1.3" fill="#fff"/></svg>',
  question:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#1677ff"/><text x="12" y="16.4" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="Arial,sans-serif">?</text></svg>'
};
let _cfOk=null;
function confirmBox(o){
  $('cfTitle').innerHTML='<span class="cf-ico" aria-hidden="true">'+(o.danger===false?CF_ICO.question:CF_ICO.danger)+'</span>'+esc(o.title||'确认操作');
  $('cfMsg').innerHTML=o.msg||'';
  const ok=$('cfOk');
  ok.textContent=o.okText||'确认';
  ok.className='btn '+(o.danger===false?'pri':'dgr');   /* antd：危险确认＝实心 danger primary */
  _cfOk=o.onOk||null;
  $('cfMask').classList.add('show');
  setTimeout(function(){ try{ ok.focus(); }catch(e){} },30);
}
function cfClose(){ $('cfMask').classList.remove('show'); _cfOk=null; }
function cfConfirm(){ const f=_cfOk; cfClose(); if(f) f(); }
function askDel(o){
  confirmBox({title:o.title, msg:o.msg, okText:o.okText||'确认删除', onOk:function(){
    const h=o.undo? undoPush(o.label, o.undo) : null;
    o.run();
    renderView();
    if(h) undoToast(o.done||(o.label+' 已删除'), h); else toast(o.done||'已删除');
  }});
}
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function money(n){ return '$' + Math.round(n).toLocaleString('en-US'); }
function hoursTxt(h, src){ return src==='天' ? h+'天' : h+'h'; }
function crewChipsHtml(crew){
  return RANKS.filter(r=>crew[r]).map(r=>{
    const m=RANK_META[r];
    return '<span class="crew-chip" style="color:'+m.fg+';background:'+m.bg+'" title="'+r+' '+m.role+'">'+r+'×'+crew[r]+'</span>';
  }).join('') || '<span class="sub">未配置</span>';
}
function mtName(code){ const t=MTYPES.find(t=>t.code===code); return t?t.name:code; }

/* ---- 解析：规则命中链（R-20：型号级 > 设备级 两级回溯） ---- */
function resolveRules(kind, modelName, mt, cycle){
  const list=RULES[kind];
  const m=MODELS.find(m=>m.name===modelName)||null;
  const dev=m?m.dev:null;
  // IN-MC-10：设备级规则必须属于当前型号所在设备；型号级唯一命中
  const f=r=>r.mt===mt && (r.cycle||null)===(cycle||null);
  const hit = {level:null, rows:[]};
  let r = list.find(x=>f(x)&&x.level==='型号级'&&x.ref===modelName);
  if(r){ hit.level='型号级'; hit.rows=[r]; return hit; }
  const rows = list.filter(x=>f(x)&&x.level==='设备级'&&x.dev===dev);
  if(rows.length){ hit.level='设备级'; hit.rows=rows; }
  return hit;
}

/* ---- 巡检统计（仅侧边栏角标用得到 std） ---- */
function stats(){
  return {std:LABOR_STANDARDS.length};
}
/* ---- antd 风格线性图标（16px，stroke 1.7，跟随 currentColor） ---- */
const NAV_ICONS={
  category:'<path d="M9 3.5h6v5H9z"/><path d="M3 15.5h6v5H3z"/><path d="M15 15.5h6v5H15z"/><path d="M12 8.5v4M6 15.5v-3h12v3"/>',
  models:'<ellipse cx="12" cy="5.5" rx="8" ry="2.8"/><path d="M4 5.5v13c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8v-13"/><path d="M4 12c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8"/>',
  vendors:'<path d="M4 9.5 5.5 4h13L20 9.5"/><path d="M4.5 9.5a2.3 2.3 0 0 0 4.5.1 2.3 2.3 0 0 0 4.5 0 2.3 2.3 0 0 0 4.5 0 2.3 2.3 0 0 0 2-.1"/><path d="M5.5 12.8V20h13v-7.2M9.5 20v-4.5h5V20"/>',
  mtype:'<path d="M3.5 12V4.5a1 1 0 0 1 1-1H12l8.5 8.5-8.5 8.5L3.5 12Z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
  sitems:'<path d="M8.5 6h12M8.5 12h12M8.5 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke-width="2.4"/>',
  sgroups:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  labor:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  rates:'<circle cx="12" cy="12" r="9"/><path d="M9 9.3c.5-1.1 1.7-1.8 3-1.7 1.6.1 2.7 1 2.7 2.2 0 2.9-5.7 1.8-5.7 4.7 0 1.3 1.2 2.2 2.9 2.2 1.4 0 2.6-.6 3-1.7M12 6.2v11.6"/>',
  bfee:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
  icoef:'<path d="M19 5 5 19"/><circle cx="7.5" cy="7.5" r="2.6"/><circle cx="16.5" cy="16.5" r="2.6"/>',
  pkg:'<rect x="3.5" y="8" width="17" height="12.5" rx="1.5"/><path d="M3.5 12h17M12 8v12.5"/><path d="M12 8c-2.5 0-4.5-.6-4.5-2.2C7.5 4.2 9.5 3.6 10.5 4.6c1 1 1.5 3.4 1.5 3.4Zm0 0c2.5 0 4.5-.6 4.5-2.2 0-1.6-2-2.2-3-1.2-1 1-1.5 3.4-1.5 3.4Z"/>',
  rule:'<path d="M4 8h14M15 4.5 18.5 8 15 11.5M20 16H6M9 12.5 5.5 16 9 19.5"/>',
  preview:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  inquiry:'<path d="M6.5 3.5h7L19 9v11.5H6.5z"/><path d="M13 3.5V9h6"/><path d="M9.5 13h5.5M9.5 16.5h5.5"/>',
  components:'<circle cx="12" cy="12" r="9"/><circle cx="8.2" cy="9.2" r="1.2" fill="currentColor" stroke="none"/><circle cx="14.8" cy="7.8" r="1.2" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.5" cy="14" r="1.2" fill="currentColor" stroke="none"/>'
};
function navSvg(k){ return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+NAV_ICONS[k]+'</svg>'; }
/* 导航即流程：菜单统一收纳为两个分组——「基础数据」（定价依赖的主数据 / 维保目录）
   与「定价配置」（工时 / 费率 / 保底参数 / 影响系数 / 套餐 / 规则 / 方案预览端到端验证）；
   制造厂家 / 项目分组作为独立字典页置于「基础数据」（与设备、服务项同级）；件数系数已随 D18 退役（2026-09-11，原「费率与系数」页更名为「职级费率」，仅保留职级费率卡）；
   「设计规范」收纳 antd 组件对照页（components） */
const NAVS = [
  {sec:'基础数据'},
  {id:'category', icon:navSvg('category'), name:'设备分类树'},
  {id:'models', icon:navSvg('models'), name:'设备与型号'},
  {id:'vendors', icon:navSvg('vendors'), name:'制造厂家'},
  {id:'mtype',  icon:navSvg('mtype'), name:'维保类型'},
  {id:'sitems', icon:navSvg('sitems'), name:'服务项'},
  {id:'sgroups', icon:navSvg('sgroups'), name:'服务项分组'},
  {sec:'定价配置'},
  {id:'labor',  icon:navSvg('labor'), name:'工时标准'},
  {id:'rates',  icon:navSvg('rates'), name:'职级费率'},
  {id:'bfee',   icon:navSvg('bfee'),  name:'保底参数'},
  {id:'icoef',  icon:navSvg('icoef'), name:'影响系数'},
  {id:'pkg',    icon:navSvg('pkg'),   name:'套餐配置'},
  {id:'rule',   icon:navSvg('rule'),  name:'展示规则'},
  {id:'preview', icon:navSvg('preview'), name:'方案预览'},
  {sec:'询价受理'},
  {id:'inquiry', icon:navSvg('inquiry'), name:'客户定价单'},
  {sec:'设计规范'},
  {id:'components', icon:navSvg('components'), name:'组件规范'}
];
function renderNav(){
  const st=stats();
  /* hidden 机制保留备用：置 hidden:true 的页面与深链仍可达，仅不出现在侧边菜单；
     分组下若无任何可见项，则分组标题一并隐藏（当前无隐藏项） */
  const secVisible={}; let curSec=null;
  NAVS.forEach(function(n){
    if(n.sec){ curSec=n.sec; secVisible[curSec]=false; }
    else if(!n.hidden && curSec) secVisible[curSec]=true;
  });
  $('nav').innerHTML = NAVS.filter(function(n){ return !n.hidden; }).map(n=>{
    if(n.sec) return secVisible[n.sec] ? '<div class="nav-sec">'+n.sec+'</div>' : '';
    let badge='';
    if(n.id==='labor') badge='<span class="nbadge gray">'+st.std+'</span>';
    /* 用真实 <a> 链接而非 div onclick：键盘可达、可中键新开标签页 */
    const href = n.id.indexOf('?')>=0 ? n.id.replace(/\?/, '.html?') : n.id + '.html';
    return '<a class="nav-it'+(view===n.id?' on':'')+'" href="'+href+'"'+(view===n.id?' aria-current="page"':'')+'><span aria-hidden="true">'+n.icon+'</span>'+n.name+badge+'</a>';
  }).join('');
}
function go(id){ if(id === view) return; location.href = (id.indexOf('?')>=0 ? id.replace(/\?/, '.html?') : id + '.html'); }   // 拆分后 = 页面跳转（支持 ?query 深链）
/* ---- 重绘不丢焦点 / 不跳滚动（用户视角 P0） ----
   整页 innerHTML 重绘前记录滚动位置与焦点元素，重绘后原样还原；
   文本 / 数字输入框不抢回焦点，避免打断连续录入。 */
function uiSnapshot(){
  const y=window.pageYOffset||document.documentElement.scrollTop||0;
  const a=document.activeElement;
  let sel=null, isText=false;
  if(a && a!==document.body && $('content') && $('content').contains(a)){
    isText = a.tagName==='TEXTAREA' || (a.tagName==='INPUT' && /^(text|number|search|date|datetime-local)$/.test((a.type||'').toLowerCase()));
    if(a.id) sel='#'+a.id;
    else {
      const d=a.dataset||{};
      for(const k in d){ sel=a.tagName.toLowerCase()+'[data-'+k+'="'+d[k]+'"]'; break; }
    }
  }
  return {y:y, sel:sel, isText:isText};
}
function uiRestore(s){
  if(!s) return;
  window.scrollTo(0, s.y);
  if(!s.sel || s.isText) return;
  let el=null;
  try{ el=document.querySelector(s.sel); }catch(e){ el=null; }
  if(!el || typeof el.focus!=='function') return;
  try{ el.focus({preventScroll:true}); }catch(e){ el.focus(); }
}
function renderView(opt){
  opt=opt||{};
  const _snap = opt.top? null : uiSnapshot();
  $('viewTitle').textContent = (NAVS.find(n=>n.id===view)||{}).name||'设备分类树';
  const c=$('content');
  const cap = view.charAt(0).toUpperCase() + view.slice(1);
  const vFn = (typeof window['v'+cap] === 'function') ? window['v'+cap] : null;
  const bFn = (typeof window['bind'+cap] === 'function') ? window['bind'+cap] : null;
  if(!vFn){ c.innerHTML = '<div class="card"><h2>视图未找到：'+esc(view)+'</h2></div>'; return; }
  c.innerHTML = vFn();
  if(bFn) bFn();
  renderNav();   // 任何变更（增删改、撤销）后同步刷新侧边栏数字角标（工时标准等）
  if(opt.top) window.scrollTo(0,0); else uiRestore(_snap);
}
function catFind(code, node){
  node = node || {children:CATALOG};
  for(const ch of (node.children||[])){
    if(ch.code===code) return ch;
    const f=catFind(code, ch);
    if(f) return f;
  }
  return null;
}
function catParentOf(code, node){
  node = node || {children:CATALOG};
  for(const ch of (node.children||[])){
    if(ch.code===code) return node;
    const p=catParentOf(code, ch);
    if(p) return p;
  }
  return null;
}
function devNameOf(code){ const d=deviceLeaves().find(x=>x.code===code); return d? d.name : code; }
function closeDrawer(){ $('mask').classList.remove('show'); $('drawer').classList.remove('show'); }
$('mask').onclick=()=>{ closeDrawer(); };
$('cfCancel').onclick=cfClose;
$('cfOk').onclick=cfConfirm;
/* ---- 模态窗统一键盘协议：Esc 关闭最上层模态；Enter 提交（焦点已在按钮上时交给原生，避免双触发） ----
   关闭函数按名延迟解析：core.js 先于页面 js 加载，直接引用会 ReferenceError */
const MODAL_CLOSERS={cfMask:'cfClose', ruleMask:'ruleModalClose', pkgMask:'pkgModalClose',
                     siMask:'siModalClose', modelMask:'modelModalClose',
                     mtMask:'mtModalClose',
                     rtMask:'rtModalClose',
                     icoLocMask:'icLocClose', icoLeadMask:'icLeadClose',
                     catAddMask:'catAddClose'};
function topModal(){
  const order=['siMask','mtMask','pkgMask','ruleMask','modelMask','rtMask','icoLocMask','icoLeadMask','catAddMask','cfMask'];   // cfMask（确认框）永远最上
  for(let i=order.length-1;i>=0;i--){ const m=$(order[i]); if(m&&m.classList.contains('show')) return m; }
  return null;
}
/* 键盘交互的最上层浮层：模态优先，其次抽屉（antd Modal/Drawer 的焦点圈定范围） */
function topLayer(){
  const m=topModal();
  if(m) return m;
  const d=$('drawer');
  return (d && d.classList.contains('show')) ? d : null;
}
/* 焦点圈定（antd Modal 行为）：Tab 在浮层内循环，杜绝焦点"跑到"遮罩底层 */
function focusablesIn(box){
  return Array.prototype.filter.call(
    box.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'),
    function(x){ return x.offsetParent!==null; }
  );
}
function trapTab(e){
  const box=topLayer();
  if(!box) return;
  const items=focusablesIn(box);
  if(!items.length) return;
  const a=document.activeElement;
  if(!box.contains(a)){ e.preventDefault(); items[0].focus(); return; }
  const first=items[0], last=items[items.length-1];
  if(e.shiftKey && a===first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && a===last){ e.preventDefault(); first.focus(); }
}
/* 树选择键盘交互（antd TreeSelect 同款协议）：触发器 Enter/Space/↓ 开合；
   面板内 ↑↓ 巡航可见选项、Enter 选中、Esc 关闭并把焦点还回触发器。
   返回 true 表示事件已消费，阻断后续全局协议 */
function tsKeydown(e){
  const t=e.target;
  if(!t || !t.closest) return false;
  const trig=t.closest('.tree-trigger');
  if(trig){
    if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'){ e.preventDefault(); TS.toggle(trig.id.replace(/Trig$/,''),e); return true; }
    return false;
  }
  const sel=t.closest('.tree-sel');
  if(!sel) return false;
  const id=sel.id.replace(/Sel$/,'');
  const p=$(''+id+'Panel');
  if(!p || !p.classList.contains('show')) return false;
  if(e.key==='Escape'){
    if(topModal()) return false;             // 确认框等模态在最上层时，Esc 交给模态协议
    TS.close(id);
    const tg=$(''+id+'Trig'); if(tg) tg.focus();
    return true;
  }
  const opts=Array.prototype.filter.call(p.querySelectorAll('[data-ts-pick]'), function(x){ return x.offsetParent!==null; });
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
    e.preventDefault();
    if(!opts.length) return true;
    const i=opts.indexOf(document.activeElement);
    let n;
    if(i<0) n=(e.key==='ArrowDown')?0:opts.length-1;
    else{ n=i+((e.key==='ArrowDown')?1:-1); if(n<0)n=opts.length-1; if(n>=opts.length)n=0; }
    opts[n].focus();
    return true;
  }
  if((e.key==='Enter'||e.key===' ') && opts.indexOf(document.activeElement)>=0){
    e.preventDefault();
    TS.pick(id, document.activeElement.getAttribute('data-ts-pick'), e);
    return true;
  }
  return false;
}
document.addEventListener('keydown',function(e){
  if(tsKeydown(e)) return;
  if(e.key==='Tab'){ trapTab(e); return; }
  const m=topModal();
  if(m){
    if(e.key==='Escape'){ e.preventDefault(); const fn=window[MODAL_CLOSERS[m.id]]; if(fn) fn(); return; }
    if(e.key==='Enter'){
      const a=document.activeElement;
      if(a&&a.tagName==='BUTTON') return;                    // 按钮上的 Enter 走原生 click
      e.preventDefault();
      if(m.id==='cfMask'){ cfConfirm(); return; }
      const pri=m.querySelector('.cfacts .btn.pri');         // 表单模态：Enter＝点主按钮
      if(pri) pri.click();
    }
    return;
  }
  if(e.key==='Escape') closeDrawer();
});
/* ---- 浮层打开时锁定背景滚动（antd Modal 行为）----
   MutationObserver 监听各页 show class 切换，零侵入：页面 JS 仍只写 classList */
let _scrollLocked=false;
function anyLayerOpen(){
  const d=$('drawer'); if(d&&d.classList.contains('show')) return true;
  const mk=$('mask'); if(mk&&mk.classList.contains('show')) return true;
  const masks=document.querySelectorAll('.cfmask');
  for(let i=0;i<masks.length;i++){ if(masks[i].classList.contains('show')) return true; }
  return false;
}
function updateScrollLock(){
  const open=anyLayerOpen();
  if(open===_scrollLocked) return;
  _scrollLocked=open;
  document.documentElement.classList.toggle('modal-open', open);
}
if(window.MutationObserver){
  new MutationObserver(updateScrollLock).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
}
window.addEventListener('load', updateScrollLock);
/* ---- 操作反馈三件套（用户视角 P0） ----
   ① flashSave：行内编辑（改完即存，无保存按钮）给出绿色边框闪示，替代"只有一闪而过的 toast"；
   ② flashNewRow：新增/重绘后定位并闪烁新行，用户不用在一屏表格里找"我刚加的那条"；
   ③ liveFilter：关键词"输入即过滤"（220ms 停顿防抖），重绘后把焦点和光标放回过滤框继续输入。 */
function flashSave(el){
  const e=(typeof el==='string')?document.querySelector(el):el;
  if(!e) return;
  e.classList.add('saved');
  setTimeout(function(){ e.classList.remove('saved'); },1200);
}
function flashNewRow(label){
  requestAnimationFrame(function(){
    /* 行内编辑表格的名称存在 <input value> 里（不是 textContent），须一并纳入匹配 */
    function rowText(r){
      let s=r.textContent||'';
      r.querySelectorAll('input,select').forEach(function(el){ s+=' '+(el.value||'')+' '+(el.selectedOptions&&el.selectedOptions[0]?el.selectedOptions[0].textContent:''); });
      return s;
    }
    const rows=document.querySelectorAll('#content tr, #drawer tr');
    for(let i=0;i<rows.length;i++){
      if(rowText(rows[i]).indexOf(label)>=0){
        rows[i].classList.add('row-new');
        try{ rows[i].scrollIntoView({block:'nearest',behavior:'smooth'}); }catch(e){}
        setTimeout(function(){ rows[i].classList.remove('row-new'); },2400);
        return;
      }
    }
  });
}
let _lfT=null;
function liveFilter(inp, apply){
  apply(inp.value);
  clearTimeout(_lfT);
  const id=inp.id, pos=inp.value.length;
  _lfT=setTimeout(function(){
    renderView();
    const el=$(id);
    if(el && document.activeElement!==el){        // innerHTML 重绘会打断输入，恢复焦点与光标
      el.focus();
      try{ el.setSelectionRange(pos,pos); }catch(e){}
    }
  },220);
}
/* 查询输入框清除按钮（antd Input allowClear 同款交互）：清空并走「输入即过滤」 */
function qClearClick(a){
  const inp=a.parentElement && a.parentElement.querySelector('input');
  if(!inp) return;
  inp.value='';
  inp.dispatchEvent(new Event('input',{bubbles:true}));
}
/* ---- 列表分页（Ant Design Pagination 同款） ----
   分页态存于全局 PAGES，每视图一个 key；翻页即整页重绘 renderView，
   与「重绘不丢焦点 / 不跳滚动」协议天然兼容。视图内 rows.map(...) 改为
   pgSlice(rows, KEY).map(...)，并在 </table> 后追加 pagerHtml(rows.length, KEY)；
   任意筛选变更（输入即过滤 / 下拉切换 / 重置）时调用 pgReset(KEY) 回到第 1 页。 */
var PAGES = {};
function pgState(key){ if(!PAGES[key]) PAGES[key] = {page:1, size:10}; return PAGES[key]; }
function pagerGo(key, page){ pgState(key).page = page; renderView(); }
function pagerSize(key, size){ var s=pgState(key); s.size=size; s.page=1; renderView(); }
function pgReset(key){ if(PAGES[key]) PAGES[key].page = 1; }
function pgSlice(arr, key){
  var s = pgState(key);
  var pages = Math.max(1, Math.ceil(arr.length / s.size));
  if (s.page > pages) s.page = pages;
  if (s.page < 1) s.page = 1;
  var start = (s.page - 1) * s.size;
  return arr.slice(start, start + s.size);
}
function pagerHtml(total, key){
  var s = pgState(key);
  var pages = Math.max(1, Math.ceil(total / s.size));
  if (s.page > pages) s.page = pages;
  if (s.page < 1) s.page = 1;
  if (total <= s.size) return '';   // 单页不渲染分页器
  var cur = s.page, win = 2, nums = [];
  var start = Math.max(1, cur - win), end = Math.min(pages, cur + win);
  if (start > 1){ nums.push(1); if (start > 2) nums.push('...'); }
  for (var i = start; i <= end; i++) nums.push(i);
  if (end < pages){ if (end < pages - 1) nums.push('...'); nums.push(pages); }
  function go(p){ return 'onclick="pagerGo(\'' + key + '\',' + p + ')"'; }
  var prev = cur <= 1 ? '<button class="pg" disabled aria-label="上一页">‹</button>' : '<button class="pg" aria-label="上一页" ' + go(cur - 1) + '>‹</button>';
  var next = cur >= pages ? '<button class="pg" disabled aria-label="下一页">›</button>' : '<button class="pg" aria-label="下一页" ' + go(cur + 1) + '>›</button>';
  var btns = nums.map(function(n){
    if (n === '...') return '<span class="pg-dots">…</span>';
    return '<button class="pg' + (n === cur ? ' on' : '') + '" aria-label="第 ' + n + ' 页"' + (n === cur ? ' aria-current="page"' : '') + ' ' + go(n) + '>' + n + '</button>';
  }).join('');
  var sizes = [10,20,50,100].map(function(sz){ return '<option value="'+sz+'"'+(sz===s.size?' selected':'')+'>'+sz+' 条/页</option>'; }).join('');
  return '<nav class="pager" aria-label="分页">'
    + '<span class="pg-total">共 ' + total + ' 条</span>'
    + prev + btns + next
    + '<select class="pager-size" aria-label="每页条数" onchange="pagerSize(\'' + key + '\', +this.value)">' + sizes + '</select>'
    + '</nav>';
}
/* ---- 通用树选择组件（受 Ant Design TreeSelect 启发：触发器标签 + 清除 + 箭头；
   面板含搜索过滤、可展开树、选中高亮；支持单选 + 可选「全部」根项） ----
   用法：设置 TS.specs[id]（value / allOption / allLabel / clearable / clearValue / onPick），
   再调用 TS.html(id) 拼入视图；交互由全局事件委托统一分发，无需每实例绑定。 */
const TS = {
  specs:{}, state:{}, _docClose:null,
  ensure(id){
    if(!this.state[id]) this.state[id]={exp:new Set(), q:''};
    if(!this.specs[id]) this.specs[id]={allOption:false, allLabel:'全部', placeholder:'请选择', clearable:false,
      clearValue:null, value:'', onPick:null, showSearch:true, searchPlaceholder:'搜索设备 / 分类…', notFoundContent:'暂无数据'};
  },
  value(id){ return this.specs[id]?this.specs[id].value:''; },
  initExp(id){
    this.ensure(id);
    const st=this.state[id];
    if(st.exp.size) return;
    (function walk(ns){ (ns||[]).forEach(function(n){ if((n.children||[]).length){ st.exp.add(n.code); walk(n.children); } }); })(CATALOG);
  },
  match(n,q){ return (n.name||'').toLowerCase().indexOf((q||'').toLowerCase())>=0; },
  filtered(nodes,q){
    if(!q) return nodes;
    const out=[];
    (nodes||[]).forEach(function(n){
      const kids=TS.filtered(n.children||[], q);
      const self=TS.match(n,q);
      if(self || kids.length) out.push(Object.assign({}, n, {children: kids.length?kids:(self?n.children:[])}));
    });
    return out;
  },
  treeHtml(id, val){
    this.initExp(id);
    const st=this.state[id], spec=this.specs[id];
    const q=st.q, nodes=q?this.filtered(CATALOG,q):CATALOG, forceOpen=!!q;
    let h='';
    if(spec.allOption && !q){
      h+='<div class="tree-row ts-all'+(val==='all'?' sel':'')+'" data-ts-pick="all" tabindex="-1" role="option" aria-selected="'+(val==='all')+'"><span class="tree-caret leaf">≡</span><span class="tx">'+esc(spec.allLabel)+'</span></div>';
    }
    h+=this.rowsHtml(id, nodes, 0, val, forceOpen);
    if(!h && q) h='<div class="ts-empty">'+esc(spec.notFoundContent||'暂无数据')+'</div>';
    return h;
  },
  rowsHtml(id, nodes, depth, val, forceOpen){
    const st=this.state[id]; let h='';
    (nodes||[]).forEach(function(n){
      const kids=n.children||[], pad=8+depth*22;
      if(kids.length){
        const open=forceOpen || st.exp.has(n.code);
        h+='<div class="tree-row cat'+(open?' open':'')+'" style="padding-left:'+pad+'px">'
          +'<span class="tree-caret" data-ts-toggle="'+n.code+'">'+(open?'▾':'▸')+'</span><span class="tx">'+esc(n.name)+'</span></div>';
        if(open) h+=TS.rowsHtml(id, kids, depth+1, val, forceOpen);
      }else{
        const on=val===n.code?' sel':'';
        h+='<div class="tree-row leaf'+on+'" style="padding-left:'+pad+'px" data-ts-pick="'+n.code+'" tabindex="-1" role="option" aria-selected="'+(val===n.code)+'">'
          +'<span class="tree-caret leaf">●</span><span class="tx">'+esc(n.name)+'</span></div>';
      }
    });
    return h;
  },
  labelOf(val, spec){
    if(spec.allOption && val==='all') return spec.allLabel;
    const d=deviceLeaves().find(function(x){ return x.code===val; });
    return d? devNameOf(val) : (spec.placeholder||'请选择');
  },
  triggerInner(id){
    const spec=this.specs[id], val=spec.value;
    const showClear = spec.clearable && !(spec.allOption && val==='all');
    return '<span class="ts-label">'+esc(this.labelOf(val,spec))+'</span>'
      +(showClear?'<span class="ts-clear" data-ts-clear="1" title="清除">×</span>':'')
      +'<span class="ts-arrow">▾</span>';
  },
  panelInner(id){
    const spec=this.specs[id], q=this.state[id].q;
    const search = spec.showSearch===false ? '' :
      '<div class="ts-search"><input class="txt" id="'+id+'Search" placeholder="'+esc(spec.searchPlaceholder||'请输入')+'" value="'+esc(q)+'" oninput="TS.filter(\''+id+'\', this.value)"></div>';
    return search + '<div class="tree" id="'+id+'Tree">'+this.treeHtml(id, spec.value)+'</div>';
  },
  html(id){
    this.ensure(id);
    /* 触发器 role=combobox 可聚焦（Enter/Space/↓ 开合见全局 tsKeydown）；面板 role=listbox */
    return '<span class="tree-sel" id="'+id+'Sel"><span class="tree-trigger" id="'+id+'Trig" data-ts-trig="1" tabindex="0" role="combobox" aria-haspopup="listbox" aria-expanded="false">'+this.triggerInner(id)+'</span>'
      +'<div class="tree-panel" id="'+id+'Panel" role="listbox" aria-label="选项列表">'+this.panelInner(id)+'</div></span>';
  },
  renderTree(id){ const t=$(''+id+'Tree'); if(t) t.innerHTML=this.treeHtml(id, this.value(id)); },
  open(id){
    this.ensure(id);
    const p=$(''+id+'Panel'); if(!p) return;
    p.innerHTML=this.panelInner(id);
    p.classList.add('show');
    const tg=$(''+id+'Trig'); if(tg) tg.setAttribute('aria-expanded','true');
    const inp=$(''+id+'Search'); if(inp) inp.focus();
    const self=this;
    setTimeout(function(){
      self._docClose=function(ev){ const s=$(''+id+'Sel'); if(s && !s.contains(ev.target)) self.close(id); };
      document.addEventListener('click', self._docClose, true);
    },0);
  },
  close(id){
    const p=$(''+id+'Panel'); if(p) p.classList.remove('show');
    const tg=$(''+id+'Trig'); if(tg) tg.setAttribute('aria-expanded','false');
    if(this._docClose){ document.removeEventListener('click', this._docClose, true); this._docClose=null; }
    this.state[id].q='';
    const t=$(''+id+'Tree'); if(t) t.innerHTML=this.treeHtml(id, this.value(id));   // 关闭后恢复完整树
  },
  toggle(id, ev){
    ev.stopPropagation();
    const p=$(''+id+'Panel');
    if(p && p.classList.contains('show')) this.close(id); else this.open(id);
  },
  toggleNode(id, code, ev){
    ev.stopPropagation();
    const st=this.state[id];
    if(st.exp.has(code)) st.exp.delete(code); else st.exp.add(code);
    this.renderTree(id);
  },
  pick(id, code, ev){
    if(ev) ev.stopPropagation();
    this.specs[id].value=code;
    const cb=this.specs[id].onPick;
    this.close(id);
    if(cb) cb(code);
  },
  clear(id){
    const spec=this.specs[id];
    if(spec.clearValue==null) return;
    spec.value=spec.clearValue;
    const cb=spec.onPick;
    this.close(id);
    if(cb) cb(spec.clearValue);
  },
  filter(id, q){ this.state[id].q=q; this.renderTree(id); }
};
/* 全局事件委托：统一分发树选择交互（清除 / 展开 / 选中 / 触发器），实例间互不干扰 */
document.addEventListener('click', function(ev){
  const cl=function(sel){ return ev.target.closest && ev.target.closest(sel); };
  let el;
  if((el=cl('[data-ts-clear]'))) { TS.clear(el.closest('.tree-sel').id.replace('Sel','')); return; }
  if((el=cl('[data-ts-toggle]'))) { TS.toggleNode(el.closest('.tree-sel').id.replace('Sel',''), el.getAttribute('data-ts-toggle'), ev); return; }
  if((el=cl('[data-ts-pick]'))) { TS.pick(el.closest('.tree-sel').id.replace('Sel',''), el.getAttribute('data-ts-pick'), ev); return; }
  if((el=cl('[data-ts-trig]'))) { TS.toggle(el.closest('.tree-sel').id.replace('Sel',''), ev); return; }
});
/* 异步引导：IndexedDB 是异步的，必须等数据装进内存再渲染首屏，
   否则首帧会渲染在空数组上（原 localStorage 版是同步启动，故此处统一改为 boot()） */
function boot(){
  return Promise.resolve()
    .then(function(){ return initState(); })
    .then(function(){ renderNav(); renderView({top:true}); })
    .catch(function(e){
      // 启动失败不能白屏：退化为内存态再渲染
      try{ if(!SERVICE_ITEMS.length) buildDomainModel(); }catch(e2){}
      try{ renderNav(); renderView({top:true}); }
      catch(e3){ $('content').innerHTML = '<div class="card"><h2>数据加载失败</h2><div class="sub">'+esc(String((e && e.message) || e))+'</div></div>'; }
    });
}
/* 离开页面前落盘：pagehide / visibilitychange 比 beforeunload 更可靠
   （移动端与后台标签页常不触发 beforeunload），三个一起兜底 */
function flushOnLeave(){ try{ flushPersist(); }catch(e){} }
window.addEventListener('beforeunload', flushOnLeave);
window.addEventListener('pagehide', flushOnLeave);
document.addEventListener('visibilitychange', function(){
  if(document.visibilityState === 'hidden') flushOnLeave();
});
/* 多标签页同步：其他同源标签页保存数据后，本页弹出轻量提示，
   用户点击「重载」即拉取最新存储（不直接覆盖，避免丢失本页未保存编辑）。 */
window.pcOnRemoteUpdate = function(){
  if(document.getElementById('remoteBanner')) return;
  const el = document.createElement('div');
  el.id = 'remoteBanner';
  el.setAttribute('style', 'position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:99999;background:#e6f4ff;border:1px solid #91caff;color:#0958d9;padding:8px 12px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,.15);font:13px/1.4 system-ui,-apple-system,sans-serif;display:flex;gap:10px;align-items:center;max-width:92vw;');
  const msg = document.createElement('span'); msg.textContent = '其他标签页已更新数据，可重载查看最新';
  const btn = document.createElement('button'); btn.id = 'remoteReloadBtn'; btn.type = 'button'; btn.textContent = '重载';
  btn.setAttribute('style', 'border:1px solid #0958d9;background:#0958d9;color:#fff;border-radius:6px;padding:3px 10px;cursor:pointer;font-size:13px;');
  const x = document.createElement('button'); x.id = 'remoteCloseBtn'; x.type = 'button'; x.textContent = '×';
  x.setAttribute('style', 'border:none;background:transparent;color:#0958d9;font-size:16px;cursor:pointer;line-height:1;');
  el.appendChild(msg); el.appendChild(btn); el.appendChild(x);
  document.body.appendChild(el);
  btn.onclick = function(){
    el.remove();
    loadState().then(function(loaded){
      try{ if(loaded && loaded.state){ restoreState(loaded.state); } renderNav(); renderView({top:true}); toast('已同步其他标签页的数据'); }
      catch(e){ toast('重载失败'); }
    }).catch(function(){ toast('重载失败'); });
  };
  x.onclick = function(){ el.remove(); };
};
