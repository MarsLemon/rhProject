/* 工时标准 —— 由全模块版拆分生成（机型组退役后重写）
   ============================================================
   适用范围两级（原三级回溯中的「机型组级」已退役）：
   ① 型号级：一条配置可覆盖多台型号（models 为型号名数组，新增时多选）；
   ② 设备级：兜底该设备全部型号（dev）。
   回溯解析见 data.js resolveLaborStandard（型号级 > 设备级，IN-MC-12）。
   ============================================================ */
/* R-32：工时上下文 = 维保类型 +（周期）；上下文切换见「工时标准」视图筛选 */
let laborSelMt = 'HYDELEC';
let laborSelCycle = null;
let laborScope = '型号级';              // '型号级' | '设备级'
let laborRefModel = MODELS.length?MODELS[0].name:'';   // 型号级筛选：型号名；''=全部型号
let laborDev = '601.001';
let laborQName = '';   // 工时标准页过滤：服务项名（独立控件）
let laborQCode = '';   // 深链定位过滤（labor?si=CODE）：查询区无入口，仅深链设置、重置清空
/* 新增表单草稿：服务项 / 人员配置（按职级步进）/ 工时 / 型号多选，录入即校验 */
let laborAddItem = SERVICE_ITEMS.length?SERVICE_ITEMS[0].code:'';
let laborAddCrew = {T4:1, P3:2};
let laborAddHours = 6;
let laborAddModels = [];     // 型号级多选草稿（型号名集合，保存才落库；MSEL 多选控件回写）
function laborMtObj(){ return MTYPES.find(t=>t.code===laborSelMt) || null; }
/* 维保类型变更：选到「无类型」或「无周期类型」时清空周期，并安全重绘（避免 __NONE__ 触发 find().cycle 抛错） */
function laborMtChange(){
  const m = MTYPES.find(t=>t.code===laborSelMt);
  laborSelCycle = (m && m.cycle) ? laborSelCycle : null;
  pgReset('labor'); renderView();
}
function laborCycleVal(){
  const t=laborMtObj();
  return (t && t.cycle) ? (laborSelCycle || CYCLES[0]) : null;
}
/* 新增表单「人员配置」：与编辑抽屉一致的按职级步进器（紧凑版），避免手填格式错误 */
function laborAddStep(r,d){
  laborAddCrew[r]=Math.max(0,(laborAddCrew[r]||0)+d);
  if(laborAddCrew[r]===0) delete laborAddCrew[r];
  if(drawerSrc==='add') renderLaborAddDrawer();
  else renderView();
}
function addCrewHtml(){
  return RANKS.map(function(r){
    return '<span class="cstep"><span class="dot" title="'+RANK_META[r].role+'" style="background:'+RANK_META[r].bg+';box-shadow:inset 0 0 0 2.5px '+RANK_META[r].fg+'"></span>'
      +'<b>'+r+'</b>'
      +'<span class="stepper sm"><button type="button"'+((laborAddCrew[r]||0)<=0?' disabled':'')+' onclick="laborAddStep(\''+r+'\',-1)">−</button><span class="v">'+(laborAddCrew[r]||0)+'</span><button type="button" onclick="laborAddStep(\''+r+'\',1)">＋</button></span></span>';
  }).join('');
}
/* 服务项名「输入即过滤」：停顿 220ms 后重绘并恢复焦点（core.js liveFilter） */
function laborQNameLive(inp){ pgReset('labor'); liveFilter(inp, function(v){ laborQName=v; clearLaborHi(); }); }
/* ---- 型号级视图行：按当前上下文（范围筛选 + 类型 + 周期 + 关键词）过滤 LABOR_STANDARDS ---- */
function laborRows(kind){
  const isModel=(kind==='型号级');
  const refVal=isModel?laborRefModel:null;
  const qn=(laborQName||'').trim().toLowerCase();
  const qc=(laborQCode||'').trim().toLowerCase();
  return LABOR_STANDARDS.filter(function(s){
    if(s.scope!==kind) return false;
    if(isModel){ if(refVal && (s.models||[]).indexOf(refVal)<0) return false; }
    else if(s.dev!==laborDev) return false;
    if((s.mt||null)!==(laborMtObj()?laborSelMt:null)) return false;
    if((s.cycle||null)!==(laborCycleVal()||null)) return false;
    if(qn && siNameOf(s.item).toLowerCase().indexOf(qn)<0) return false;
    if(qc && s.item.toLowerCase().indexOf(qc)<0) return false;
    return true;
  });
}
/* 型号级行展示型号清单（超过 3 台折叠计数，title 全量提示） */
function modelsTxtOf(row){
  const ms=row.models||[];
  if(!ms.length) return '<span class="tag bad">未选型号</span>';
  const show=ms.slice(0,3).map(function(n){ return esc(n); }).join('、');
  return '<span class="sub" title="'+esc(ms.join('、'))+'">'+show+(ms.length>3?(' 等 <b>'+ms.length+'</b> 台'):'')+'</span>';
}
function vLabor(){
  applyLaborDeepLink();
  // 服务项草稿可能在 SERVICE_ITEMS 为空时初始化，确保它指向有效服务项
  if(!laborAddItem || !SERVICE_ITEMS.some(x=>x.code===laborAddItem)){
    laborAddItem = SERVICE_ITEMS.length ? SERVICE_ITEMS[0].code : '';
  }
  // 型号筛选收敛：型号已删 / 空表时回落
  if(laborRefModel && !MODELS.some(function(m){return m.name===laborRefModel;}))
    laborRefModel = MODELS.length?MODELS[0].name:'';
  const cyc=laborCycleVal();
  const mtObj=laborMtObj();
  const ctxMt=mtObj?laborSelMt:null, ctxCyc=cyc||null;
  const kind=(laborScope==='设备级')?'设备级':'型号级';
  const isModel=(kind==='型号级');
  const rows=laborRows(kind);
  /* 分区化（与「保底参数」页同一模式）：① 查询区=决定看哪个范围；② 表单区=新增配置；
     避免「筛选控件 + 新增表单」同排堆砌被误读为同一个表单 */
  const scopeSel='<span class="fgroup"><span class="fl">适用范围</span><select class="select" id="laborScopeSel" style="min-width:110px" onchange="laborScope=this.value;pgReset(\'labor\');renderView()">'
   +[['型号级','型号级'],['设备级','设备级']].map(sv=>'<option value="'+sv[0]+'"'+(laborScope===sv[0]?' selected':'')+'>'+sv[1]+'</option>').join('')+'</select></span>';
  const scopeCtl=isModel
    ? '<span class="fgroup"><span class="fl">型号</span><select class="select" id="laborModelSel" style="min-width:200px" onchange="laborRefModel=this.value;pgReset(\'labor\');renderView()">'
      +'<option value=""'+(laborRefModel?'':' selected')+'>全部型号</option>'
      + MODELS.map(m=>'<option'+(laborRefModel===m.name?' selected':'')+'>'+esc(m.name)+'</option>').join('')+'</select></span>'
    : '<span class="fgroup"><span class="fl">设备</span><select class="select" id="laborDevSel" style="min-width:220px" onchange="laborDev=this.value;pgReset(\'labor\');renderView()">'
      + deviceLeaves().map(d=>'<option value="'+d.code+'"'+(laborDev===d.code?' selected':'')+'>'+esc(d.name)+'</option>').join('')+'</select></span>';
  return '<div class="card">'
   +'<div class="zone q"><div class="secline">'+scopeSel+scopeCtl
   +'<span class="fgroup"><span class="fl">维保类型</span>'
   +'<select class="select" id="laborMtSel" style="min-width:190px" onchange="laborSelMt=this.value;laborMtChange()">'
   +'<option value="__NONE__" '+(mtObj?'':'selected')+'>（无类型 · 通用兜底）</option>'
   + MTYPES.map(t=>'<option value="'+t.code+'"'+(ctxMt===t.code?' selected':'')+'>'+esc(t.name)+'</option>').join('')
   +'</select></span>'
   +(mtObj&&mtObj.cycle
     ? '<span class="fgroup"><span class="fl">保养周期</span><select class="select" id="laborCycleSel" style="min-width:120px" onchange="laborSelCycle=this.value;pgReset(\'labor\');renderView()">'
       + CYCLES.map(c=>'<option'+(c===ctxCyc?' selected':'')+'>'+c+'</option>').join('')+'</select></span>'
     : '<span class="tag gray">无周期（IN-MC-09）</span>')
   +'<span class="fgroup"><span class="fl">服务项名</span><span class="qwrap"><input class="txt" id="laborQNameInp" placeholder="请输入" value="'+esc(laborQName)+'" style="width:130px" oninput="laborQNameLive(this)"><button type="button" class="qclear" role="button" aria-label="清除" title="清除" onclick="qClearClick(this)">×</button></span></span>'
   +'<span style="flex:1"></span>'
   +'<button class="btn sm" type="button" onclick="resetLaborView()">重置</button>'
   +'</div></div>'
   +'</div>'
   +'<div class="card">'
   +'<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px"><span class="cardact"><button class="btn pri" onclick="openLaborAddDrawer()">新增</button></span></div>'
   +'<div class="t-wrap"><table class="t"><tr><th>服务项</th><th>服务项分组</th><th>适用范围</th><th>人员配置</th><th class="num">单价 $/h</th><th class="num">标准工时</th><th>计价基准</th><th></th></tr>'
   + (rows.length? pgSlice(rows, 'labor').map(function(r){
      const li=LABOR_STANDARDS.indexOf(r);
      const hc=headcountOf(r.crew), R=rateSumOf(r.crew);
      const si=(SERVICE_ITEMS.find(x=>x.code===r.item)||{});
      const hrs = r.tiers.length ? ('<b>'+r.tiers.length+'</b> 档（'+r.tiers.map(t=>t.min+'-'+t.max+'缸 '+hoursTxt(t.h,t.src)).join(' / ')+'）')
                                  : (r.hours? hoursTxt(r.hours,r.unit):'<span class="tag bad">未配置</span>');
      return '<tr'+(r.item===window.__laborHi?' class="hl-row"':'')+'><td style="max-width:230px"><b>'+esc(siNameOf(r.item))+'</b></td>'
       +'<td><span class="tag gray">'+(si.grp||'未分组')+'</span></td>'
       /* 适用范围列不再单独标层级：查询区已选范围，下方型号/设备名即信息 */
       +'<td><div style="max-width:250px">'+(isModel?modelsTxtOf(r):'<span class="sub">'+esc(devNameOf(r.dev))+'</span>')+'</div></td>'
       +'<td>'+crewChipsHtml(r.crew)+(hc!==r.stated&&r.stated?'<span class="tag warn" style="margin-left:4px">栏头'+r.stated+'人</span>':'')+'</td>'
       +'<td class="num"><b>'+Math.round(R)+'</b></td><td class="num">'+hrs+'</td>'
       +'<td><span class="tag gray">'+(BASIS_LABEL[r.basis]||r.basis)+'</span></td>'
       +'<td><button class="btn sm" onclick="openDrawerLS('+li+')">编辑</button> <button class="btn sm danger" onclick="delLaborScoped('+li+')">删除</button></td></tr>';
    }).join('')
    : '<tr><td colspan="8"><div class="empty-tip">暂无配置数据。</div></td></tr>')
   +'</table></div></div>'
   + pagerHtml(rows.length, 'labor');
}
/* 新增：统一走右侧抽屉（范围/上下文沿用查询区，型号级多选型号） */
function addLaborScoped(){
  const code=SERVICE_ITEMS.some(x=>x.code===laborAddItem)?laborAddItem:(SERVICE_ITEMS.length?SERVICE_ITEMS[0].code:'');
  const crew=Object.assign({},laborAddCrew);
  const hours=laborAddHours;
  if(!code){ toast('请选择服务项'); return; }
  if(!Object.keys(crew).length){ toast('人员配置至少一个职级（点 − 调整）'); return; }
  if(!(hours>0)){ toast('请填写有效工时'); return; }
  const isModel=(laborScope!=='设备级');
  const si=SERVICE_ITEMS.find(x=>x.code===code);
  const ctxMt=mtObjVal(), ctxCyc=(laborSelMt==='__NONE__')?null:laborCycleVal();
  if(isModel){
    if(!laborAddModels.length){ toast('请至少选择一台型号'); return; }
    // 回溯唯一命中：同（服务项+类型+周期）下，一台型号至多一条型号级配置
    const dupModels=laborAddModels.filter(function(mn){
      return LABOR_STANDARDS.some(function(s){
        return s.scope==='型号级' && s.item===code && (s.mt||null)===(ctxMt||null) && (s.cycle||null)===(ctxCyc||null)
          && (s.models||[]).indexOf(mn)>=0;
      });
    });
    if(dupModels.length){
      toast('以下型号在该上下文已有型号级配置，先在列表中删除或改并到那条配置：'+dupModels.join('、'));
      return;
    }
    const first=(MODELS.find(function(m){return m.name===laborAddModels[0];})||{});
    LABOR_STANDARDS.push({ item:code, mt:ctxMt, cycle:ctxCyc,
      scope:'型号级', models:laborAddModels.slice(), dev:first.dev||laborDev,
      crew:crew, basis:'unit', ref_cyl:null, hours:hours, unit:'小时', tiers:[],
      work:'', algorithm:'', risk:'', stated:null, computed:headcountOf(crew),
      warnings:[], correction:null, workKey:null, workIdx:-1 });
    renderView(); toast('已新增（覆盖 '+laborAddModels.length+' 台型号），套餐计价实时生效');
    flashNewRow(siNameOf(code));
    return true;
  }
  LABOR_STANDARDS.push({ item:code, mt:ctxMt, cycle:ctxCyc,
    scope:'设备级', models:null, dev:laborDev,
    crew:crew, basis:'unit', ref_cyl:null, hours:hours, unit:'小时', tiers:[],
    work:'', algorithm:'', risk:'', stated:null, computed:headcountOf(crew),
    warnings:[], correction:null, workKey:null, workIdx:-1 });
  renderView(); toast('已新增，套餐计价实时生效');
  flashNewRow(siNameOf(code));
  return true;
}
function mtObjVal(){ return (laborSelMt==='__NONE__')?null:laborSelMt; }
function delLaborScoped(li){
  const r=LABOR_STANDARDS[li]; if(!r) return;
  askDel({title:'删除该条工时配置？',
    msg:'将删除 <b>'+esc(siNameOf(r.item))+'</b> 的'+esc(r.scope)+'配置（'+(r.scope==='型号级'?esc((r.models||[]).join('、')||'—'):esc(devNameOf(r.dev)))+(r.mt?' · '+esc(mtName(r.mt)):'')+(r.cycle?' + '+esc(r.cycle):'')+'）。删除后该范围的价格回溯到下一层级（设备级），或变为不可计价。',
    label:r.scope+'配置 '+siNameOf(r.item),
    run:function(){ LABOR_STANDARDS.splice(li,1); },
    undo:function(){ LABOR_STANDARDS.splice(li,0,r); }});
}
function applyLaborDeepLink(){
  const p=new URLSearchParams(location.search);
  const code=p.get('si'); if(!code) return;
  const si=SERVICE_ITEMS.find(x=>x.code===code); if(!si) return;
  window.__laborHi=code; window.__laborHiName=si.name; laborQCode=code;
  // 按计价优先级定位（型号级 > 设备级）
  const modelStd=LABOR_STANDARDS.find(s=>s.item===code && s.scope==='型号级');
  if(modelStd){
    laborScope='型号级';
    laborSelMt=modelStd.mt||'__NONE__';
    laborSelCycle=modelStd.cycle||null;
    laborRefModel=(modelStd.models&&modelStd.models.length)?modelStd.models[0]:'';
  } else {
    const devStd=LABOR_STANDARDS.find(s=>s.item===code && s.scope==='设备级');
    if(devStd){
      laborScope='设备级';
      laborSelMt=devStd.mt||'__NONE__';
      laborSelCycle=devStd.cycle||null;
      if(devStd.dev) laborDev=devStd.dev;
    } else {
      laborScope='型号级'; laborSelMt='__NONE__'; laborSelCycle=null; laborRefModel='';
    }
  }
  const _u=new URLSearchParams(location.search); _u.delete('si');
  const _qs=_u.toString();
  history.replaceState(null,'', location.pathname + (_qs?('?'+_qs):'') + location.hash);
  toast('已在「工时标准」定位服务项 '+code);
}
function clearLaborHi(){ window.__laborHi=null; window.__laborHiName=''; }
function resetLaborView(){
  laborQName=''; laborQCode=''; window.__laborHi=null; window.__laborHiName='';
  laborScope='型号级'; laborSelMt='HYDELEC'; laborSelCycle=null;
  laborRefModel=MODELS.length?MODELS[0].name:''; laborDev='601.001';
  pgReset('labor'); renderView(); toast('已重置筛选与定位');
}
/* 新增工时：统一收进右侧抽屉（与编辑共用 .drawer），上下文沿用当前维护范围 */
function openLaborAddDrawer(){
  if(!SERVICE_ITEMS.length){ toast('请先到「服务项」创建服务项'); return; }
  if(!laborAddItem || !SERVICE_ITEMS.some(x=>x.code===laborAddItem)) laborAddItem=SERVICE_ITEMS[0].code;
  drawerSrc='add';
  if(!laborAddModels.length && laborScope==='型号级' && laborRefModel) laborAddModels=[laborRefModel];
  renderLaborAddDrawer();
  $('mask').classList.add('show'); $('drawer').classList.add('show');
}
function renderLaborAddDrawer(){
  const mtObj=laborMtObj();
  const cyc=laborCycleVal();
  const isModel=(laborScope!=='设备级');
  // 范围默认值保护：切换范围后若下拉项不存在则回落至首项
  if(isModel){ if(laborRefModel && !MODELS.some(function(m){return m.name===laborRefModel;})) laborRefModel=MODELS.length?MODELS[0].name:''; }
  else { const lv=deviceLeaves(); if(!lv.some(function(d){return d.code===laborDev;}) && lv.length) laborDev=lv[0].code; }
  const hc=headcountOf(laborAddCrew), R=rateSumOf(laborAddCrew);
  const crewHtml=RANKS.map(function(r){
    return '<div class="secline"><span class="dot" style="background:'+RANK_META[r].bg+';box-shadow:inset 0 0 0 2.5px '+RANK_META[r].fg+'"></span>'
      +'<b style="width:28px">'+r+'</b><span class="sub" style="width:96px">'+RANK_META[r].role+'</span>'
      +'<span class="stepper"><button type="button" aria-label="减少'+r+'"'+((laborAddCrew[r]||0)<=0?' disabled':'')+' onclick="laborAddStep(\''+r+'\',-1)">−</button><span class="v">'+(laborAddCrew[r]||0)+'</span><button type="button" aria-label="增加'+r+'" onclick="laborAddStep(\''+r+'\',1)">＋</button></span>'
      +'<span class="sub">× $'+RATES.active.rates[r]+'/h</span>'
      +'<b class="num" style="margin-left:auto">'+((RATES.active.rates[r]||0)*(laborAddCrew[r]||0))+' $/h</b></div>';
  }).join('');
  // 适用范围下拉
  const scopeSel='<select class="select" id="laborDrScopeSel" onchange="laborScope=this.value;renderLaborAddDrawer()">'
    +[['型号级','型号级'],['设备级','设备级']].map(function(sv){return '<option value="'+sv[0]+'"'+(laborScope===sv[0]?' selected':'')+'>'+sv[1]+'</option>';}).join('')+'</select>';
  // 范围明细：型号级=多选池；设备级=单选下拉
  let rangeHtml='';
  if(isModel){
    /* 适用型号：antd 风格多选（MSEL，assets/msel.js），抽屉渲染完成后挂载 */
    rangeHtml='<div class="sec"><b>适用型号（可多选）</b><div id="laborModelMs"></div></div>';
  } else {
    rangeHtml='<div class="sec"><b>设备</b><select class="select" onchange="laborDev=this.value;renderLaborAddDrawer()">'
      + deviceLeaves().map(function(d){return '<option value="'+d.code+'"'+(laborDev===d.code?' selected':'')+'>'+esc(d.name)+'</option>';}).join('')+'</select>'
      +'<span class="sub" style="margin-left:6px">兜底该设备全部型号（型号级未配置时回溯到这层）</span></div>';
  }
  // 维保类型 / 保养周期
  const mtSel='<select class="select" onchange="laborSelMt=this.value;{var m=MTYPES.find(function(t){return t.code===laborSelMt;});laborSelCycle=(m&&m.cycle)?laborSelCycle:null;}renderLaborAddDrawer()">'
    +'<option value="__NONE__" '+(mtObj?'':'selected')+'>（无类型 · 通用兜底）</option>'
    + MTYPES.map(function(t){return '<option value="'+t.code+'"'+(t.code===laborSelMt&&mtObj?' selected':'')+'>'+esc(t.name)+'</option>';}).join('')+'</select>';
  let cycHtml='';
  if(mtObj&&mtObj.cycle){
    cycHtml='<div class="sec"><b>保养周期</b><select class="select" onchange="laborSelCycle=this.value;renderLaborAddDrawer()">'
      + CYCLES.map(function(c){return '<option'+(c===cyc?' selected':'')+'>'+c+'</option>';}).join('')+'</select></div>';
  }
  $('drawer').innerHTML =
   '<div class="dhead"><b>＋ 新增工时标准</b>'
   +'<span style="flex:1"></span><button class="btn" onclick="closeDrawer()">✕</button></div>'
   +'<div class="dbody">'
   +'<div class="sec"><b>适用范围</b>'+scopeSel+'</div>'
   + rangeHtml
   +'<div class="sec"><b>维保类型</b>'+mtSel+'</div>'
   + cycHtml
   +'<div class="sec"><b>服务项</b><select class="select" id="laborAddSel" onchange="laborAddItem=this.value">'
     + SERVICE_ITEMS.map(function(x){ return '<option value="'+x.code+'"'+(laborAddItem===x.code?' selected':'')+'>'+esc(x.name)+'</option>'; }).join('')
     +'</select></div>'
   +'<div class="sec"><b>人员配置</b>'+crewHtml
     +'<div class="secline"><span class="tag gray">构成合计 '+hc+' 人</span><b style="margin-left:auto">综合费率 <span class="num">'+Math.round(R)+' $/h</span></b></div></div>'
   +'<div class="sec"><b>标准工时</b><div class="secline"><input class="n" type="number" step="0.5" value="'+laborAddHours+'" onchange="laborAddHours=+this.value;renderLaborAddDrawer()"> 小时</div></div>'

   +'</div>'
   +'<div class="dfoot"><button class="btn pri" onclick="laborAddSubmitDrawer()">＋ 配置工时</button>'
     +'<button class="btn" onclick="closeDrawer()">取消</button></div>';
  /* 适用型号多选：抽屉每次重绘后重新挂载（MSEL 从 laborAddModels 重新取值） */
  const msBox=$('laborModelMs');
  if(msBox && window.MSEL){
    MSEL.mount(msBox, {
      options: function(){ return MODELS.map(function(m){ return m.name; }); },
      value: function(){ return laborAddModels.slice(); },
      placeholder: '请选择型号',
      onChange: function(next){ laborAddModels=next; }
    });
  }
}
function laborAddSubmitDrawer(){
  if(addLaborScoped()) closeDrawer();
}
function bindLabor(){
  if(window.__laborHi){ const el=document.querySelector('.hl-row'); if(el) el.scrollIntoView({block:'center'}); }
}
let drawerIdx=-1, draft=null, drawerSrc='ls';
/* 抽屉草稿：DDD 标准工时聚合根成员 = 人员配置 / 标准工时 / 计件基准 / 缸数分档 / 工作内容·算法·风险说明 */
function draftFrom(src){
  return { crew:Object.assign({},src.crew), basis:src.basis, hours:src.hours, unit:src.unit,
           tiers:src.tiers.map(t=>Object.assign({},t)),
           work:src.work||'', algorithm:src.algorithm||'', risk:src.risk||'' };
}
function openDrawerLS(li){
  drawerSrc='ls';
  drawerIdx=li;
  const src=LABOR_STANDARDS[li];
  if(!src){ toast('该条工时已不存在，请刷新后重试'); return; }   // 索引错位保护
  draft=draftFrom(src);
  renderDrawer();
  $('mask').classList.add('show'); $('drawer').classList.add('show');
}
function drawerRow(){
  return LABOR_STANDARDS[drawerIdx];
}
function renderDrawer(){
  const it=drawerRow();
  if(!it) return;
  const nm=siNameOf(it.item||'');
  const isModel=(it.scope==='型号级');
  const hc=headcountOf(draft.crew), R=rateSumOf(draft.crew);
  const tiered=draft.basis==='engine'||draft.basis==='engine_tiered';
  const sampleCyl = it.ref_cyl || 6;
  let sampleH;
  if(tiered){ const t=draft.tiers.find(t=>sampleCyl>=t.min&&sampleCyl<=t.max)||draft.tiers[0]; sampleH=t?t.h:0; }
  else sampleH=(draft.hours||0)*(draft.unit==='天'?DAY_H:1);
  $('drawer').innerHTML =
   '<div class="dhead"><b>编辑工时标准</b>'
   +'<span style="flex:1"></span><button class="btn" onclick="closeDrawer()">✕</button></div>'
   +'<div class="dbody">'
   +'<div class="sec"><b>计价基准（决定前台件数推导）</b><div class="radio-row">'
   +[['unit','单件 · 可调'],['cylinder','每缸 × 缸数'],['two_cylinder','每 2 缸一档'],['engine','整台工程（档位/固定）']]
     .map(o=>'<label><input type="radio" name="basis" value="'+o[0]+'" '+(draft.basis===o[0]?'checked':'')+' onchange="draft.basis=this.value;renderDrawer()">'+o[1]+'</label>').join('')
   +'</div>'+(it.basis!==draft.basis?'<div class="tag warn" style="margin-top:6px;display:inline-block">清单原口径：'+(BASIS_LABEL[it.basis]||it.basis)+'——修改将改变前台数量推导</div>':'')+'</div>'
   +'<div class="sec"><b>人员配置</b>'
   + RANKS.map(r=>'<div class="secline"><span class="dot" style="background:'+RANK_META[r].bg+';box-shadow:inset 0 0 0 2.5px '+RANK_META[r].fg+'"></span>'
     +'<b style="width:28px">'+r+'</b><span class="sub" style="width:96px">'+RANK_META[r].role+'</span>'
     +'<span class="stepper"><button type="button" aria-label="减少'+r+'"'+((draft.crew[r]||0)<=0?' disabled':'')+' onclick="stepCrew(\''+r+'\',-1)">−</button><span class="v">'+(draft.crew[r]||0)+'</span><button type="button" aria-label="增加'+r+'" onclick="stepCrew(\''+r+'\',1)">＋</button></span>'
     +'<span class="sub">× $'+RATES.active.rates[r]+'/h</span>'
     +'<b class="num" style="margin-left:auto">'+((RATES.active.rates[r]||0)*(draft.crew[r]||0))+' $/h</b></div>').join('')
   +'<div class="secline" style="margin-top:8px"><span class="tag '+(it.stated&&hc!==it.stated?'warn':'gray')+'">构成合计 '+hc+' 人</span>'
   +(it.stated&&hc!==it.stated?'<span class="tag warn">与清单栏头 '+it.stated+' 人不一致——计费以构成为准</span>':'')
   +'<b style="margin-left:auto">综合费率 <span class="num">'+Math.round(R)+' $/h</span></b></div></div>'
   +'<div class="sec"><b>标准工时'+(tiered?'（按缸数分档，须覆盖所选型号缸数范围）':'')+'</b>'
   +(tiered
     ? draft.tiers.map((t,ti)=>'<div class="secline"><span class="sub">缸数</span>'
        +'<input class="n" style="text-align:center" type="number" value="'+t.min+'" onchange="draft.tiers['+ti+'].min=+this.value"> ~ '
        +'<input class="n" style="text-align:center" type="number" value="'+t.max+'" onchange="draft.tiers['+ti+'].max=+this.value"> 缸'
        +'<input class="n" type="number" step="0.5" value="'+t.h+'" onchange="draft.tiers['+ti+'].h=+this.value">'
        +'<span class="sub">小时（原文 '+t.src+'）</span>'
        +'<button class="btn danger" style="margin-left:auto" onclick="draft.tiers.splice('+ti+',1);renderDrawer()">删除档</button></div>').join('')
       +'<button class="btn" onclick="draft.tiers.push({min:(draft.tiers.length?draft.tiers[draft.tiers.length-1].max+1:6),max:(draft.tiers.length?draft.tiers[draft.tiers.length-1].max+2:8),h:8,src:\'小时\'});renderDrawer()">＋ 增加缸数档</button>'
     : '<div class="secline"><input class="n" type="number" step="0.5" value="'+(draft.hours||0)+'" onchange="draft.hours=+this.value;renderDrawer()">'
       +'<select class="select" onchange="draft.unit=this.value;renderDrawer()"><option value="小时" '+(draft.unit!=='天'?'selected':'')+'>小时</option><option value="天" '+(draft.unit==='天'?'selected':'')+'>天（×8h）</option></select>'
       +'<span class="formula">= '+sampleH+'h</span></div>')
   +'</div>'
   +(it.correction?'<div class="sec"><b>数据修订单</b><div class="tag ok">✓ '+esc(it.correction.note)+'</div><div class="sub" style="margin-top:5px">原文留痕：'+esc(it.hours_raw)+'</div></div>':'')
   +'<div class="dfoot"><button class="btn pri" onclick="saveDrawer()">保存并生效</button>'
   +'<button class="btn" onclick="closeDrawer()">取消</button>'
   +'</div>';
}
function stepCrew(r,d){
  draft.crew[r]=Math.max(0,(draft.crew[r]||0)+d);
  if(draft.crew[r]===0) delete draft.crew[r];
  renderDrawer();
}
function saveDrawer(){
  const it=drawerRow(); if(!it) return;
  const nm=siNameOf(it.item||'');
  // IN-MC-13a：人员配置至少一条（计费以构成为依据）
  if(headcountOf(draft.crew)<1){ toast('人员配置至少一条（IN-MC-13a）'); return; }
  // IN-MC-14b：缸数分档 min≤max 且区间不重叠
  const tiers=draft.tiers.slice().sort((a,b)=>a.min-b.min);
  for(let i=0;i<tiers.length;i++){
    const t=tiers[i];
    if(!(t.min>=1) || t.min>t.max){ toast('第'+(i+1)+'档缸数区间无效（须 1≤min≤max）'); return; }
    if(i>0 && t.min<=tiers[i-1].max){ toast('缸数分档区间不得重叠（IN-MC-14b）'); return; }
  }
  // 分档模式下单值工时不允许为 0
  if(!tiers.length && !((draft.hours||0)>0)){ toast('标准工时必须大于 0'); return; }
  const diffs=[];
  const oldHc=headcountOf(it.crew), newHc=headcountOf(draft.crew);
  if(oldHc!==newHc) diffs.push('构成 '+oldHc+'→'+newHc+' 人（'+RANKS.filter(r=>(it.crew[r]||0)!==(draft.crew[r]||0)).map(r=>r+'×'+(it.crew[r]||0)+'→'+(draft.crew[r]||0)).join(' ')+'）');
  if(it.basis!==draft.basis) diffs.push('基准 '+(BASIS_LABEL[it.basis]||it.basis)+'→'+(BASIS_LABEL[draft.basis]||draft.basis));
  const oldH=it.tiers.length?it.tiers.map(t=>t.h).join('/'):(it.hours+'h');
  // 单位归一：内部一律存小时（原文口径留痕在 hours_raw）
  if(draft.unit==='天'){ draft.hours=(draft.hours||0)*DAY_H; draft.unit='小时'; }
  const newH=draft.tiers.length?draft.tiers.map(t=>t.h).join('/'):(draft.hours+'h');
  if(oldH!==newH) diffs.push('工时 '+oldH+'→'+newH);
  it.crew=Object.assign({},draft.crew);
  it.basis=draft.basis; it.hours=draft.hours; it.unit=draft.unit;
  it.tiers=draft.tiers.map(t=>Object.assign({},t));
  it.work=draft.work||''; it.algorithm=draft.algorithm||''; it.risk=draft.risk||'';
  if(newHc===it.stated && it.warnings.includes('headcount_mismatch')){
    it.warnings=it.warnings.filter(w=>w!=='headcount_mismatch');
  }
  it.computed=newHc;
  closeDrawer(); renderView(); toast('已保存');
}
