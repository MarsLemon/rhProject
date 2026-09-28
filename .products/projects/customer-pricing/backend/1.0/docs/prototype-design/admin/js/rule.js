/* 展示规则 —— 由全模块版拆分生成 */
/* ============================================================
   视图：展示规则（R-20 / D8）
   ============================================================ */
let ruleTab = 0, ruleEdit = null;
function vRule(){
  const rows = ruleTab===0 ? RULES.pkg : RULES.sug;
  let listHtml;
  if(ruleTab===0){
    listHtml = '<div class="t-wrap"><table class="t"><tr><th>适应范围</th><th>设备/型号</th><th>维保类型</th><th>保养周期</th><th>套餐</th><th></th></tr>'
     + pgSlice(rows, 'rule').map((r,i)=>'<tr><td><span class="tag '+(r.level==='型号级'?'info':'gray')+'">'+r.level+'</span></td>'
       +'<td class="sub">'+(r.level==='设备级'?esc(devNameOf(r.dev)):esc(r.ref))+'</td>'
       +'<td>'+mtName(r.mt)+'</td>'
       +'<td>'+(r.cycle?esc(r.cycle):'<span class="tag warn" title="该类型启用周期时规则必须带周期（IN-MC-09）">无周期</span>')+'</td>'
       +'<td><b>'+(PACKAGES.find(p=>p.code===r.pkg)||{}).name+'</b></td>'
       +'<td><button class="btn sm" onclick="editRule(0,'+i+')">编辑</button> <button class="btn sm danger" onclick="delRule(0,'+i+')">删除</button></td></tr>').join('')
     +'</table></div>'
     + pagerHtml(rows.length, 'rule');
  } else {
    listHtml = '<div class="t-wrap"><table class="t"><tr><th>适应范围</th><th>设备/型号</th><th>维保类型</th><th>保养周期</th><th>建议项</th><th>徽标</th><th>默认数量</th><th></th></tr>'
     + pgSlice(rows, 'rule').map((r,i)=>'<tr><td><span class="tag '+(r.level==='型号级'?'info':'gray')+'">'+r.level+'</span></td>'
       +'<td class="sub">'+(r.level==='设备级'?esc(devNameOf(r.dev)):esc(r.ref))+'</td>'
       +'<td>'+mtName(r.mt)+'</td>'
       +'<td>'+(r.cycle?esc(r.cycle):'<span class="tag warn">无周期</span>')+'</td>'
       +'<td><b>'+siNameOf(r.si)+'</b></td>'
       +'<td>'+(r.badge?'<span class="tag info">建议</span>':'<span class="sub">—</span>')+'</td>'
       +'<td class="num">'+(r.mode==='fixed'?r.qty:(r.mode==='auto_per_2cylinder'?'每2缸':'按缸数'))+'</td>'
       +'<td><button class="btn sm" onclick="editRule(1,'+i+')">编辑</button> <button class="btn sm danger" onclick="delRule(1,'+i+')">删除</button></td></tr>').join('')
     +'</table></div>'
     + pagerHtml(rows.length, 'rule');
  }
  return '<div>'
   +'<div class="card"><h2>'+(ruleTab===0?'套餐展示规则':'建议项规则')+(ruleTab===1?' <span class="sub">共 '+rows.length+' 条</span>':'')
   +'<span class="cardact">'
   /* 套餐 / 建议项切换对齐 antd Segmented（v6 rule 页同款）：灰底胶囊 + 选中白底凸起 */
   +'<div class="seg" role="tablist" aria-label="规则类型">'
   +'<button type="button" class="seg-it'+(ruleTab===0?' on':'')+'" aria-selected="'+(ruleTab===0)+'" onclick="ruleTab=0;pgReset(\'rule\');renderView()">套餐</button>'
   +'<button type="button" class="seg-it'+(ruleTab===1?' on':'')+'" aria-selected="'+(ruleTab===1)+'" onclick="ruleTab=1;pgReset(\'rule\');renderView()">建议项</button>'
   +'</div>'
   +'<button class="btn pri sm" onclick="openRuleModal(ruleTab,-1)">新增</button></span></h2>'
   + listHtml

   +'</div></div>';
}
/* ---- 规则新增 / 编辑模态窗 ---- */
function ruleRefSync(curRef){
  const lvl=$('nrLevel').value, ref=$('nrRef'); if(!ref) return;
  if(lvl==='设备级'){
    const devs=deviceLeaves();
    let html=devs.map((d,i)=>'<option value="'+d.code+'"'+(i===0?' selected':'')+'>'+esc(d.name)+'</option>').join('');
    if(curRef){ const d=deviceLeaves().find(x=>x.code===curRef); if(d&&!devs.some(x=>x.code===curRef)) html+='<option value="'+d.code+'" selected>'+esc(d.name)+'</option>'; }
    ref.innerHTML=html;
  } else {
    ref.innerHTML=MODELS.map(m=>'<option>'+esc(m.name)+'</option>').join('');
  }
}
/* 启用周期的类型才出现「保养周期」整行（IN-MC-09） */
function ruleCycleSync(){
  const t=MTYPES.find(t=>t.code===$('nrMt').value);
  const grp=$('nrCycleGrp'), cs=$('nrCycle'); if(!grp||!cs) return;
  if(t&&t.cycle){
    grp.style.display='';
    cs.innerHTML=CYCLES.map(c=>'<option>'+esc(c)+'</option>').join('');
    cs.value=CYCLES[0];
  } else {
    grp.style.display='none';
    cs.innerHTML='<option value="">（无周期）</option>';
    cs.value='';
  }
}
function openRuleModal(kind, i){
  ruleTab=kind;
  ruleEdit=(typeof i==='number'&&i>=0)?{kind:kind, i:i}:null;
  const isPkg=kind===0;
  $('ruleModalTitleText').textContent=(ruleEdit?'编辑':'新增')+(isPkg?'套餐展示规则':'建议项规则');
  $('nrTargetLbl').textContent=isPkg?'套餐':'建议项';
  $('nrMt').innerHTML=MTYPES.map(t=>'<option value="'+t.code+'">'+esc(t.name)+'</option>').join('');
  $('nrTarget').innerHTML=isPkg
    ? PACKAGES.map(p=>'<option value="'+p.code+'">'+esc(p.name)+'</option>').join('')
    : SERVICE_ITEMS.map(s=>'<option value="'+s.code+'">'+esc(s.name)+'</option>').join('');
  const qm=$('nrQtyModeGrp'), qn=$('nrQtyGrp');
  if(qm) qm.style.display=isPkg?'none':'';
  if(qn) qn.style.display=isPkg?'none':'';
  $('ruleOk').textContent='保存';
  const r=ruleEdit?((ruleTab===0?RULES.pkg:RULES.sug)[ruleEdit.i]):null;
  if(r){
    $('nrLevel').value=r.level; ruleRefSync(r.ref!=null?r.ref:r.dev);
    $('nrRef').value=(r.ref!=null?r.ref:(r.dev||''));
    $('nrMt').value=r.mt; ruleCycleSync();
    if(r.cycle) $('nrCycle').value=r.cycle;
    $('nrTarget').value=(isPkg?r.pkg:r.si);
    if(!isPkg){ $('nrQtyMode').value=r.mode||'fixed'; $('nrQty').value=r.qty||1; }
  } else {
    $('nrLevel').value='设备级'; ruleRefSync(null);
    ruleCycleSync();
    if(!isPkg){ $('nrQtyMode').value='fixed'; $('nrQty').value=1; }
  }
  $('ruleMask').classList.add('show');
  setTimeout(function(){ try{ $('nrLevel').focus(); }catch(e){} },30);   // 模态打开即落焦点，Esc/Enter 立即可用
}
function ruleModalClose(){ ruleEdit=null; $('ruleMask').classList.remove('show'); }
function saveRule(){ if(ruleEdit&&ruleEdit.kind===ruleTab) saveRuleEdit(); else addRule(); }
function delRule(kind, i){
  const list=(kind===0?RULES.pkg:RULES.sug); const r=list[i]; if(!r) return;
  askDel({title:'删除这条'+(kind===0?'套餐规则':'建议项规则')+'？',
    msg:'将删除 <b>'+esc(r.level)+' · '+esc(r.ref||'全设备')+' × '+esc(mtName(r.mt))+(r.cycle?' + '+esc(r.cycle):'')+'</b> 的规则；命中该场景的客户不再看到对应'+(kind===0?'套餐':'建议项')+'。',
    label:(kind===0?'套餐规则':'建议项规则'), done:'规则已删除',
    run:function(){ list.splice(i,1); },
    undo:function(){ list.splice(i,0,r); }});
}
/* 规则重复校验（IN-MC-06）：同一（范围+对象+类型+周期+目标）至多一条 */
function ruleDup(list, lvl, ref, mt, cyc, tgt, skipIdx){
  return list.some((x,i)=>i!==skipIdx && x.level===lvl && (x.ref||null)===(ref||null)
    && x.mt===mt && (x.cycle||null)===(cyc||null)
    && (ruleTab===0 ? x.pkg===tgt : x.si===tgt));
}
function readRuleForm(){
  const lvl=$('nrLevel').value, ref=$('nrRef').value||null, mt=$('nrMt').value, cyc=$('nrCycle').value||null, tgt=$('nrTarget').value;
  const t=MTYPES.find(t=>t.code===mt);
  if(t.cycle&&!cyc){ toast('该类型启用周期：规则必须带周期（IN-MC-09）'); return null; }
  if(!t.cycle&&cyc){ toast('该类型未启用周期：不得带周期'); return null; }
  let qm='fixed', qn=1;
  if(ruleTab===1){
    qm=$('nrQtyMode')?$('nrQtyMode').value:'fixed';
    qn=$('nrQty')?Math.max(1,parseInt($('nrQty').value)||1):1;
  }
  return {lvl:lvl, ref:ref, mt:mt, cyc:cyc, tgt:tgt, qm:qm, qn:qn};
}
function addRule(){
  const f=readRuleForm();
  if(!f) return;
  const list=ruleTab===0?RULES.pkg:RULES.sug;
  if(ruleDup(list, f.lvl, f.ref, f.mt, f.cyc, f.tgt, -1)){
    toast('规则重复：同一（范围+类型+周期+目标）至多一条（IN-MC-06）'); return;
  }
  const devOf = f.lvl==='设备级' ? f.ref : ((MODELS.find(m=>m.name===f.ref)||{}).dev||null);
  if(ruleTab===0) RULES.pkg.push({level:f.lvl, dev:devOf, ref:f.ref, mt:f.mt, cycle:f.cyc, pkg:f.tgt});
  else RULES.sug.push({level:f.lvl, dev:devOf, ref:f.ref, mt:f.mt, cycle:f.cyc, si:f.tgt, badge:true, mode:f.qm, qty:f.qn});
  ruleModalClose(); renderView(); toast('规则已添加');
  flashNewRow(ruleTab===0 ? ((PACKAGES.find(p=>p.code===f.tgt)||{}).name||f.tgt) : siNameOf(f.tgt));
}
function editRule(kind, i){ openRuleModal(kind, i); }
function saveRuleEdit(){
  const r=(ruleTab===0?RULES.pkg:RULES.sug)[ruleEdit.i];
  const f=readRuleForm();
  if(!f) return;
  if(ruleDup(ruleTab===0?RULES.pkg:RULES.sug, f.lvl, f.ref, f.mt, f.cyc, f.tgt, ruleEdit.i)){
    toast('规则重复：同一（范围+类型+周期+目标）至多一条（IN-MC-06）'); return;
  }
  const devOf = f.lvl==='设备级' ? f.ref : ((MODELS.find(m=>m.name===f.ref)||{}).dev||null);
  const before=JSON.stringify([r.level,r.dev,r.ref,r.mt,r.cycle,ruleTab===0?r.pkg:r.si,r.mode,r.qty]);
  r.level=f.lvl; r.dev=devOf; r.ref=f.ref; r.mt=f.mt; r.cycle=f.cyc;
  if(ruleTab===0) r.pkg=f.tgt; else { r.si=f.tgt; r.mode=f.qm; r.qty=f.qn; }
  const after=JSON.stringify([f.lvl,f.ref,f.mt,f.cyc,f.tgt,f.qm,f.qn]);
  ruleModalClose();
  if(before!==after){
    toast('规则已更新');
  } else { toast('内容未变化'); }
  renderView();
}
