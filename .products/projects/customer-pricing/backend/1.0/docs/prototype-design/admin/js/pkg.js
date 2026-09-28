/* 套餐配置 —— 由全模块版拆分生成 */
/* ============================================================
   视图：套餐配置（D9/D11）
   ============================================================ */
let pkgSel = 0;
let pkgQ = '';            // 套餐名称查询关键字
function pkgItemLabel(ref){
  const std=laborStdOfRef(ref.ref);
  return std ? siNameOf(std.item) : (ref.ref||'');
}
/* labor 服务项引用解析：ref 形如 "labor:brand:group:idx"（旧格式行指针，迁移行仍带 workKey/workIdx）或 LAB/SI code。
   统一映射到标准工时聚合 LABOR_STANDARDS 的某一行（按适用范围两级回溯）。 */
function laborStdOfRef(ref){
  if(!ref) return null;
  if(typeof ref==='string' && ref.indexOf(':')>=0){
    const p=ref.split(':');
    if(p[0]==='labor') return LABOR_STANDARDS.find(s=>s.workKey===(p[1]+':'+p[2]) && s.workIdx===(+p[3])) || null;
  }
  // LAB code：返回该服务项命中的第一条标准工时
  return LABOR_STANDARDS.find(s=>s.item===ref) || null;
}
/* 数量来源解析（R-14/7.3）：fixed=默认值 / auto_cylinder=缸数 / auto_per_2cylinder=CEIL(缸数/2) */
function qtyOfMode(mode, qty, cyl){
  if(mode==='auto_cylinder') return cyl;
  if(mode==='auto_per_2cylinder') return Math.ceil(cyl/2);
  return qty;
}
function pkgItemPrice(ref, cyl, mt, cycle, modelName){
  cyl=cyl||6;
  // D15：统一工时标准推导；R-32：按型号上下文两级回溯（型号级 > 设备级）
  const q = qtyOfMode(ref.mode, ref.qty, cyl);
  if(typeof ref.ref==='string' && ref.ref.indexOf(':')>=0 && ref.ref.split(':')[0]==='labor'){
    const std=laborStdOfRef(ref.ref);            // 行指针（旧格式）直接取行
    if(!std) return 0;
    const H=laborHoursOf(std,cyl);
    return H ? rateSumOf(std.crew)*H*q : 0;   // 分档未命中=不可计价（IN-MC-14b）；v1.14 去件数系数
  }
  const r=resolveLaborStandard(ref.ref, modelName, mt, cycle);
  if(!r) return 0;                                // 两级未命中=不可计价（IN-MC-12）
  const H=laborHoursOf(r.std,cyl);
  return H ? rateSumOf(r.std.crew)*H*q : 0;   // v1.14 去件数系数（D18）：行金额 = 基准单价 × 数量
}
/* 明细行展示用：返回 {std, level} 命中层级 */
function pkgResolved(ref, cyl, mt, cycle, modelName){
  if(typeof ref.ref==='string' && ref.ref.indexOf(':')>=0 && ref.ref.split(':')[0]==='labor'){
    const std=laborStdOfRef(ref.ref);
    return std?{std:std, level:'型号级'}:null;
  }
  return resolveLaborStandard(ref.ref, modelName, mt, cycle);
}
/* 自愈：清理历史坏引用（形如 SI-001:undefined:undefined —— 早期版本把服务项编码误拼成旧格式行指针）。
   仅静默修复，不写审计（渲染期调用，避免递归触发重绘）。 */
function repairPkgRefs(){
  let n=0;
  PACKAGES.forEach(function(p){
    (p.items||[]).forEach(function(r){
      if(typeof r.ref==='string' && r.ref.indexOf(':undefined')>=0){
        const head=r.ref.split(':')[0];
        if(/^(SI-|LAB-)/.test(head)){ r.ref=head; n++; }
      }
    });
  });
  return n;
}
function vPkg(){
  repairPkgRefs();
  // 空态守卫：套餐全部删除后仍可正常渲染（可新建），不再因 PACKAGES[pkgSel] 越界报错
  if(!PACKAGES.length){
    return '<div class="card"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px">'
     +'<span class="cardact"><button class="btn pri sm" onclick="openPkgModal()">新增</button></span></div>'
     +'<div class="empty-tip">暂无套餐。删除套餐不影响建议项规则；引用该套餐的展示规则需先删除。</div></div>';
  }
  if(pkgSel>=PACKAGES.length) pkgSel=0;   // 选中索引越界时收敛
  const kw=(pkgQ||'').trim().toLowerCase();
  const list=PACKAGES.map((x,i)=>({p:x,i})).filter(o=> !kw || o.p.name.toLowerCase().indexOf(kw)>=0);
  return '<div class="card"><div class="zone q"><div class="secline" style="margin-bottom:0">'
   +'<span class="fgroup"><span class="fl">套餐名称</span>'
   +'<span class="qwrap"><input class="txt" id="pkgQ" placeholder="请输入" value="'+esc(pkgQ)+'" style="width:200px" oninput="pkgQLive(this)"><button type="button" class="qclear" role="button" aria-label="清除" title="清除" onclick="qClearClick(this)">×</button></span></span>'
   +'<span style="flex:1"></span>'
   +'<span class="cardact"><button class="btn pri sm" onclick="openPkgModal()">新增</button></span></div></div>'
   +'<div class="t-wrap"><table class="t"><tr><th>编码</th><th>套餐名称</th><th>维保类型</th><th>保养周期</th><th>推荐</th><th>明细</th><th></th></tr>'
   + (list.length ? pgSlice(list, 'pkg').map(function(o){
      const x=o.p, i=o.i;
      return '<tr>'
     +'<td><code class="k">'+x.code+'</code></td>'
     +'<td><b>'+esc(x.name)+'</b></td>'
     +'<td>'+mtName(x.mt)+'</td>'
     +'<td class="sub">'+(x.cycle?x.cycle:'—')+'</td>'
     +'<td>'+(x.rec?'<span class="tag on">推荐</span>':'<span class="sub">—</span>')+'</td>'
     +'<td class="num">'+x.items.length+' 项</td>'
     +'<td><button class="btn sm" onclick="event.stopPropagation();pkgOpenDrawer('+i+')">编辑</button>'
     +' <button class="btn sm danger" onclick="event.stopPropagation();delPkg('+i+')">删除</button></td></tr>';
    }).join('')
    : '<tr><td colspan="7"><div class="empty-tip">无匹配套餐</div></td></tr>')
   +'</table></div>'
   + pagerHtml(list.length, 'pkg')
   +'</div>';
}
function bindPkg(){
  // 套餐名 / 推荐 / 明细统一在「编辑」抽屉内维护（pkgRenameDrawer / pkgToggleRec / 组装明细）
}
/* 套餐模态窗：仅用于新建（名称+类型+周期）；编辑（名称/推荐/明细）统一在「编辑」抽屉完成 */
function openPkgModal(){
  const mt=$('npMt'), cs=$('npCycle'), nm=$('npName');
  if(mt) mt.innerHTML=MTYPES.map(t=>'<option value="'+t.code+'">'+esc(t.name)+'</option>').join('');
  if(cs) cs.innerHTML=CYCLES.map(c=>'<option>'+esc(c)+'</option>').join('');
  if(nm) nm.value='';
  const ttl=$('pkgModalTitle'); if(ttl) ttl.innerHTML='新增套餐配置<button type="button" class="cfclose" aria-label="关闭" onclick="pkgModalClose()">×</button>';
  const ok=$('npOk'); if(ok) ok.textContent='保存';
  npCycleSync();
  $('pkgMask').classList.add('show');
  setTimeout(function(){ try{ $('npName').focus(); }catch(e){} },30);
}
function pkgModalClose(){ $('pkgMask').classList.remove('show'); }
/* 所选类型启用周期时显示「保养周期」整行（IN-MC-09），未启用则隐藏 */
function npCycleSync(){
  const t=MTYPES.find(t=>t.code===$('npMt').value);
  const cs=$('npCycle'); if(!cs) return;
  const row=cs.closest?cs.closest('.secline'):null;
  const show=t&&t.cycle;
  if(row) row.style.display=show?'':'none'; else cs.style.display=show?'':'none';
  if(show){
    cs.innerHTML=CYCLES.map(c=>'<option>'+esc(c)+'</option>').join('');
    if(CYCLES.indexOf(cs.value)<0) cs.value=CYCLES[0];
  }
}
/* 模态窗确认：仅新建（编辑已收进「编辑」抽屉） */
function pkgSave(){
  const nm=$('npName');
  const name=(nm?nm.value:'').trim();
  if(!name){ toast('请填写套餐名'); if(nm) nm.focus(); return; }
  const mt=$('npMt').value;
  const t=MTYPES.find(t=>t.code===mt);
  const cyc=(t&&t.cycle)?((($('npCycle')||{}).value)||CYCLES[0]):null;
  let n=PACKAGES.length+1, code;
  do{ code='PKG-'+String(n).padStart(3,'0'); n++; }while(PACKAGES.find(p=>p.code===code));
  PACKAGES.push({code:code, name:name, rec:false, mt:mt, cycle:cyc, desc:'', items:[]});
  pkgModalClose();
  pkgSel=PACKAGES.length-1;
  renderView(); toast('套餐已创建，点「编辑」组装明细');
  flashNewRow(code);
}
/* 编辑抽屉内的名称 / 推荐：失焦·勾选即存（与抽屉明细「修改即时生效」同范式） */
function pkgRenameDrawer(pi, inp){
  const p=PACKAGES[pi]; if(!p) return;
  const v=(inp.value||'').trim();
  if(!v){ toast('套餐名称不能为空'); inp.value=p.name; return; }
  if(PACKAGES.some(function(x,i){ return i!==pi && x.name===v; })){ toast('套餐名称已存在'); inp.value=p.name; return; }
  if(v!==p.name){ p.name=v; renderView(); flashSave(inp); toast('套餐名称已保存'); }
}
function pkgToggleRec(pi, inp){
  const p=PACKAGES[pi]; if(!p) return;
  p.rec=inp.checked; renderView();
  toast(p.rec?'已标记推荐':'已取消推荐');
}
function pkgQLive(inp){ pgReset('pkg'); liveFilter(inp, function(v){ pkgQ=v.trim(); }); }
function delPkg(i){
  if(typeof i==='number') i=+i; else i=pkgSel;      // 支持从列表行直接删除指定套餐
  closeDrawer();                                    // 防止抽屉正打开该套餐导致索引错位
  const p=PACKAGES[i]; if(!p) return;
  if(RULES.pkg.some(r=>r.pkg===p.code)){ toast('被展示规则引用，先删除对应规则'); return; }
  const pi=i;
  pkgSel=i;
  askDel({title:'删除套餐「'+p.name+'」？',
    msg:'将删除套餐 <b>'+esc(p.name)+'</b>（<code class="k">'+p.code+'</code>）及其 '+p.items.length+' 条组装明细。建议项规则不受影响。',
    label:'套餐 '+p.code,
    run:function(){ PACKAGES.splice(pi,1); pkgSel=0; },
    undo:function(){ PACKAGES.splice(pi,0,p); }});
}
/* ---- 组装明细抽屉：从列表行「编辑明细」打开（右滑抽屉，复用 core.js 的 mask/Esc 关闭） ---- */
let pkgDrawerIdx=-1;
/* 从已有服务项中选择（纯下拉，不创建新服务项） */
function pkgAddOptionsHtml(){
  return SERVICE_ITEMS.length
    ? SERVICE_ITEMS.map(x=>'<option value="labor:'+x.code+'">'+esc(x.name)+'</option>').join('')
    : '<option value="">（暂无可选项）</option>';
}
function pkgOpenDrawer(i){
  if(typeof i==='number') pkgSel=+i;      // 抽屉关闭后列表仍定位到该套餐
  pkgDrawerIdx=pkgSel;
  renderPkgDrawer();
  $('mask').classList.add('show');
  $('drawer').classList.add('show');
}
function renderPkgDrawer(){
  const pi=pkgDrawerIdx, p=PACKAGES[pi];
  if(!p){ closeDrawer(); return; }
  const items=p.items||[];
  const rows=items.map((r,ii)=>{
      return '<tr><td style="max-width:220px;overflow:hidden">'+esc(pkgItemLabel(r))+'</td>'
       +'<td><select class="select" style="width:100%;min-width:0;max-width:100%" onchange="pkgSetMode('+pi+','+ii+',this.value)">'
       +'<option value="fixed" '+(r.mode==='fixed'?'selected':'')+'>固定值</option>'
       +'<option value="auto_cylinder" '+(r.mode==='auto_cylinder'?'selected':'')+'>按缸数自动</option>'
       +'<option value="auto_per_2cylinder" '+(r.mode==='auto_per_2cylinder'?'selected':'')+'>每2缸自动</option></select></td>'
       +'<td class="num">'+(r.mode==='fixed'
          ?'<input class="n" type="number" min="1" value="'+r.qty+'" onchange="pkgSetQty('+pi+','+ii+',this.value)">'
          :(r.mode==='auto_per_2cylinder'?'<span class="sub">=⌈缸数/2⌉</span>':'<span class="sub">=缸数</span>'))+'</td>'
       +'<td><button class="btn sm danger" onclick="pkgRemoveItem('+pi+','+ii+')">移除</button></td></tr>';
    }).join('');
  $('drawer').innerHTML=
   '<div class="dhead"><b>编辑套餐</b><span class="tag gray">'+p.code+'</span>'
   +'<span style="flex:1"></span><button class="btn" onclick="closeDrawer()">✕</button></div>'
   +'<div class="dbody" style="overflow-x:hidden">'
   +'<div class="secline" style="margin-bottom:10px"><span class="fgroup"><span class="fl">套餐名称</span>'
   +'<input class="txt" id="pkgNameInp" value="'+esc(p.name)+'" style="max-width:220px" onchange="pkgRenameDrawer('+pi+',this)"></span>'
   +'<label style="display:inline-flex;gap:6px;align-items:center;cursor:pointer;font-size:12px;color:var(--sub)"><input type="checkbox" style="accent-color:var(--accent)" '+(p.rec?'checked':'')+' onchange="pkgToggleRec('+pi+',this)"> 推荐</label></div>'
   +'<div class="secline" style="margin-bottom:10px"><span class="fgroup"><span class="fl">选择已有服务项</span>'
   +'<select class="select" id="pkgAddSel" style="max-width:260px">'+pkgAddOptionsHtml()+'</select>'
   +'<button class="btn pri sm" onclick="pkgAddItem()">新增</button></span></div>'
   +'<div class="t-wrap" style="overflow-x:hidden"><table class="t" style="table-layout:fixed"><colgroup><col style="width:42%"><col style="width:30%"><col style="width:14%"><col style="width:14%"></colgroup><tr><th>服务项</th><th>数量来源</th><th class="num">数量</th><th></th></tr>'
   + (rows || '<tr><td colspan="4"><div class="empty-tip">暂无明细。</div></td></tr>')
   +'</table></div>'

   +'</div>'
   +'<div class="dfoot"><span class="sub">共 '+items.length+' 项 · 修改即时生效</span>'
   +'<span style="flex:1"></span><button class="btn pri" onclick="closeDrawer()">完成</button></div>';
}
function pkgSetMode(pi, ii, v){
  const it=PACKAGES[pi].items[ii]; if(!it) return;
  it.mode=v; renderPkgDrawer(); renderView();
}
function pkgSetQty(pi, ii, v){
  const it=PACKAGES[pi].items[ii]; if(!it) return;
  it.qty=Math.max(1,parseInt(v)||1); renderPkgDrawer(); renderView();
}
function pkgRemoveItem(pi, ii){
  const p=PACKAGES[pi], it=p.items[ii]; if(!it) return;
  const label=pkgItemLabel(it);
  askDel({title:'移除明细「'+label+'」？',
    msg:'将从套餐 <code class="k">'+p.code+'</code> 中移除该明细行，套餐小计相应减少。',
    label:'明细 '+label, done:'已移除明细',
    run:function(){ p.items.splice(ii,1); renderPkgDrawer(); },
    undo:function(){ p.items.splice(ii,0,it); renderPkgDrawer(); }});
}
function pkgAddItem(){
  const pi=(typeof pkgDrawerIdx==='number' && PACKAGES[pkgDrawerIdx])?pkgDrawerIdx:pkgSel;
  const p=PACKAGES[pi]; if(!p) return;
  const v=$('pkgAddSel').value;
  if(!v){ toast('请先选择服务项'); return; }
  const parts=v.split(':');
  if(parts[0]==='labor' && parts.length===2 && /^(SI-|LAB-)/.test(parts[1])){
    // 服务项主体引用（SI- / LAB- 均可）：标准工时按适用范围两级回溯（型号级 > 设备级，R-32）
    p.items.push({kind:'labor', ref:parts[1], mode:'fixed', qty:1});
  } else if(parts.length===4){
    // 兼容旧格式行指针 labor:brand:group:idx
    p.items.push({kind:'labor', ref:parts[1]+':'+parts[2]+':'+parts[3], mode:'fixed', qty:1});
  } else {
    toast('无法识别的服务项引用：'+esc(v)); return;
  }
  renderPkgDrawer(); renderView();
  const rows=document.querySelectorAll('#drawer tr');
  for(let i=rows.length-1;i>=0;i--){                    // 抽屉内明细行闪烁定位（新行在最后）
    if(rows[i].textContent.indexOf(pkgItemLabel(p.items[p.items.length-1]))>=0){
      rows[i].classList.add('row-new');
      rows[i].scrollIntoView({block:'nearest'});
      setTimeout(function(){ rows[i].classList.remove('row-new'); },2400);
      break;
    }
  }
}

