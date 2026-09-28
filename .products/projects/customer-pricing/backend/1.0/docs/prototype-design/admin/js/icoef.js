/* 影响系数（D17 / R-38～R-41）—— 紧急程度 / 服务地点与地点系数 / 时间系数 三块维护
   ----------------------------------------------------------------
   影响系数 = Max(紧急系数, 地点系数, 时间系数)（取三者最大值，各维度未配置 = 1.0，IN-MC-16，Q-9 已决）；
   只作用于订单级最终报价 = Max(合计保底价, 明细合计) × K（R-19/R-41）。
   地点行 = service_location 三级树 + location_coefficient 合一（demo 数据模型）：
   空国家+空地点 = 该地区「区域兜底行」；国家非空地点空 = 国家级；均有 = 地点级。
   解析回溯 地点级 > 国家级 > 地区级（locResolve，IN-MC-19）。 */
function coefValid(c){ return !isNaN(c) && c > 0; }
function coefWarn(c){ return (c < 0.5 || c > 3.0) ? ' <span class="tag warn" title="越出建议区间 [0.5, 3.0]">越建议区间</span>' : ''; }
/* 时间档展示文案：末档（结束天留空）不体现无穷，显示为「N 天+」（展示口径，数据仍存 99999） */
function leadRangeText(b){
  if(b.max>=99999) return (b.min===0?'不限天数':b.min+' 天+');
  return (b.min===0?'当天':b.min+' 天') + ' – ' + b.max+' 天';
}
function leadSpanText(b){ return b.max>=99999 ? '≥'+b.min : '['+b.min+', '+b.max+']'; }

function vIcoef(){
  /* ① 紧急程度字典（urgency_level）：第一行 = 默认取值（sort_order 最小） */
  const urRows = URGENT.map(function(u, i){
    const def = i === 0;
    return '<tr'+(def?' style="background:var(--zone)"':'')+'>'
     +'<td><input class="txt" style="width:110px" value="'+esc(u.label)+'" '+(def?'readonly title="默认取值（sort_order 最小），不可改名"':'')+' onchange="icUrLabelChange('+i+', this.value)"></td>'
     +'<td class="num"><input class="n" type="number" min="0.1" step="0.05" style="width:88px" value="'+u.c+'" onchange="icUrCChange('+i+', this.value)">'
     +(def?' <span class="tag info">默认</span>':'')+'</td>'
     +'<td><input class="txt" style="width:200px" value="'+esc(u.note||'')+'" placeholder="说明（选填）" onchange="icUrNoteChange('+i+', this.value)"></td>'
     +'<td>'+(def ? '<span class="sub">默认项不可删</span>'
              : '<button class="btn sm danger" type="button" onclick="icUrDel('+i+')">删除</button>')+'</td></tr>';
  }).join('');

  /* ② 服务地点（三级树 + 系数合一） */
  const locRows = LOCATIONS.map(function(x, i){
    const lvl = x.site ? '地点级' : (x.country ? '国家级' : '地区兜底');
    const lvlTag = x.site ? '<span class="tag ok">'+lvl+'</span>' : (x.country ? '<span class="tag info">'+lvl+'</span>' : '<span class="tag gray">'+lvl+'</span>');
    return '<tr><td><b>'+esc(x.region)+'</b></td>'
     +'<td>'+(x.country ? esc(x.country) : '<span class="sub">（任意 = 区域兜底）</span>')+'</td>'
     +'<td>'+(x.site ? esc(x.site) : '<span class="sub">—</span>')+'</td>'
     +'<td>'+lvlTag+'</td>'
     +'<td class="num"><b>×'+x.c.toFixed(2)+'</b>'+coefWarn(x.c)+'</td>'
     +'<td class="sub">'+esc(x.note||'')+'</td>'
     +'<td><button class="btn sm" type="button" onclick="icLocOpen('+i+')">编辑</button> '
     +'<button class="btn sm danger" type="button" onclick="icLocDel('+i+')">删除</button></td></tr>';
  }).join('');

  /* ③ 时间系数（lead_time_coefficient）：天数区间，须从 0 天起全覆盖且不重叠（IN-MC-18） */
  const bands = LEAD_BANDS.slice().sort(function(a,b){ return a.min-b.min; });
  const leadRows = bands.map(function(b){
    const idx = LEAD_BANDS.indexOf(b);
    return '<tr><td><b>'+leadRangeText(b)+'</b></td>'
     +'<td class="num">'+leadSpanText(b)+'</td>'
     +'<td class="num"><b>×'+b.c.toFixed(2)+'</b>'+coefWarn(b.c)+'</td>'
     +'<td class="sub">'+esc(b.note||'')+'</td>'
     +'<td><button class="btn sm" type="button" onclick="icLeadOpen('+idx+')">编辑</button> '
     +'<button class="btn sm danger" type="button" onclick="icLeadDel('+idx+')">删除</button></td></tr>';
  }).join('');
  /* 区间完整性巡检（保存时逐档校验，这里给常显结论） */
  let gap = null;
  if (bands.length && bands[0].min !== 0) gap = '首档须从 0 天起';
  for (let i = 1; i < bands.length && !gap; i++) {
    if (bands[i].min !== bands[i-1].max + 1) gap = '第 '+(i+1)+' 档与上一档不连续';
  }
  if (!gap && (!bands.length || bands[bands.length-1].max < 99999)) gap = '末档须不设结束天（留空）';
  const leadHealth = gap
    ? '<span class="tag bad">区间不完整：'+gap+'（未覆盖天数按 1.0 计）</span>'
    : '';

  return ''
   +'<div class="card"><h2>紧急程度 <span class="sub">前台可选值</span>'
   +'<span class="cardact"><button class="btn" type="button" onclick="icUrAdd()">＋ 新增取值</button></span></h2>'
   +'<div class="t-wrap"><table class="t"><tr><th>取值</th><th class="num">紧急系数</th><th>说明</th><th>操作</th></tr>'
   +urRows
     +'</table></div>'
     +'</div>'

   +'<div class="card"><h2>服务地点与地点系数'
   +'<span class="cardact"><button class="btn" type="button" onclick="icLocOpen(-1)">＋ 新增地点/系数</button></span></h2>'
   +'<div class="t-wrap"><table class="t"><tr><th>地区</th><th>国家</th><th>地点</th><th>层级</th><th class="num">地点系数</th><th>说明</th><th>操作</th></tr>'
   +locRows
   +'</table></div>'
   +'</div>'

   +'<div class="card"><h2>时间系数 <span class="sub">按距询价天数落档</span>'
   +'<span class="cardact"><button class="btn" type="button" onclick="icLeadOpen(-1)">＋ 新增档位</button></span></h2>'
   +(leadHealth ? '<div class="t-wrap" style="margin-bottom:8px">'+leadHealth+'</div>' : '')
   +'<div class="t-wrap"><table class="t"><tr><th>档位</th><th class="num">区间 [min, max]</th><th class="num">时间系数</th><th>说明</th><th>操作</th></tr>'
   +leadRows
   +'</table></div>'
   +'</div>';
}
function bindIcoef(){ /* 行内编辑 onchange 即存，无需绑定 */ }

/* ---------- ① 紧急程度：行内编辑 + 新增/删除 ---------- */
function icUrSave(i, part, val){
  const u = URGENT[i]; if(!u) return;
  if(part==='label'){ const v=(val||'').trim(); if(!v){ toast('取值名称不能为空'); renderView(); return; } if(URGENT.some(function(x,j){ return j!==i && x.label===v; })){ toast('取值名称重复'); renderView(); return; } u.label=v; }
  if(part==='note'){ u.note=(val||'').trim(); }
  if(part==='c'){ const c=parseFloat(val); if(!coefValid(c)){ toast('系数须为正数'); renderView(); return; } u.c=c; }
  renderView(); flushPersist();
  toast('紧急程度已保存：'+u.label+' ×'+u.c.toFixed(2));
}
function icUrLabelChange(i,v){ icUrSave(i,'label',v); }
function icUrNoteChange(i,v){ icUrSave(i,'note',v); }
function icUrCChange(i,v){ icUrSave(i,'c',v); }
function icUrAdd(){
  URGENT.push({ key:'lv'+(URGENT.length+1)+'_'+Date.now()%1000, label:'特急', c:1.50, note:'' });
  renderView(); flushPersist();
  flashNewRow('特急');
  toast('已新增取值「特急」');
}
function icUrDel(i){
  if(i===0){ toast('默认取值（第一行）不可删除'); return; }
  const u=URGENT[i];
  askDel({title:'删除紧急程度「'+u.label+'」？',
    msg:'删除后前台不再出现该选项；已提交询价单不受影响。',
    label:'紧急程度 '+u.label, done:'已删除 '+u.label,
    run:function(){ URGENT.splice(i,1); },
    undo:function(){ URGENT.splice(i,0,u); }});
}

/* ---------- ② 服务地点与系数：弹窗增/改 ---------- */
let _icLocIdx = null;
let _icLocDraft = null;
function icLocOpen(i){
  _icLocIdx = (typeof i==='number' && i>=0) ? i : -1;
  const x = _icLocIdx>=0 ? LOCATIONS[_icLocIdx] : null;
  _icLocDraft = x ? { region:x.region, country:x.country||'', site:x.site||'', c:x.c, note:x.note||'' }
                  : { region:'', country:'', site:'', c:1.00, note:'' };
  $('icoLocTitle').textContent = _icLocIdx>=0 ? '编辑服务地点 / 系数' : '新增服务地点 / 系数';
  const regions = locRegions();
  const regionOpts = regions.map(function(r){ return '<option'+(r===_icLocDraft.region?' selected':'')+'>'+esc(r)+'</option>'; }).join('')
    + '<option value="__new__">＋ 新增地区…</option>';
  $('icoLocBody').innerHTML =
     '<div class="form">'
     +'<div class="form-item"><label><em class="form-req">*</em>地区</label>'
     +'<div style="display:flex;gap:8px">'
     +'<select class="select" id="icLocRegion" style="flex:1;min-width:0" onchange="icLocRegionChange(this.value)">'+regionOpts+'</select>'
     +'<input class="txt" id="icLocRegionNew" placeholder="请输入" style="flex:1;min-width:0;display:none">'
     +'</div></div>'
     +'<div class="form-item"><label>国家</label>'
     +'<input class="txt" id="icLocCountry" placeholder="留空 = 该地区区域兜底行" value="'+esc(_icLocDraft.country)+'"></div>'
     +'<div class="form-item"><label>地点</label>'
     +'<input class="txt" id="icLocSite" placeholder="具体港口/厂区/城市；国家级留空" value="'+esc(_icLocDraft.site)+'"></div>'
     +'<div class="form-item"><label><em class="form-req">*</em>地点系数</label>'
     +'<input class="txt" id="icLocC" type="number" min="0.1" step="0.05" style="width:160px" value="'+_icLocDraft.c+'"></div>'
     +'<div class="form-item"><label>说明</label>'
     +'<input class="txt" id="icLocNote" value="'+esc(_icLocDraft.note)+'"></div>'
     +'</div>';
  $('icoLocMask').classList.add('show');
  setTimeout(function(){ try{ $('icLocRegion').focus(); }catch(e){} },30);
}
function icLocRegionChange(v){
  const inp=$('icLocRegionNew');
  if(inp) inp.style.display = (v==='__new__') ? '' : 'none';
}
function icLocClose(){ $('icoLocMask').classList.remove('show'); _icLocIdx=null; _icLocDraft=null; }
function icLocSubmit(){
  let region = $('icLocRegion').value;
  if(region==='__new__'){
    region = ($('icLocRegionNew').value||'').trim();
    if(!region){ toast('请填写新地区名称'); return; }
    if(locRegions().indexOf(region)>=0){ toast('地区已存在：'+region+'（请直接选择）'); return; }
  }
  const country = ($('icLocCountry').value||'').trim();
  const site = ($('icLocSite').value||'').trim();
  const c = parseFloat($('icLocC').value);
  const note = ($('icLocNote').value||'').trim();
  if(!region){ toast('请选择或填写地区'); return; }
  if(site && !country){ toast('地点级必须归属国家'); return; }
  if(!coefValid(c)){ toast('系数须为正数'); $('icLocC').focus(); return; }
  if((c<0.5||c>3.0)) toast('系数越出建议区间 [0.5, 3.0]，已保存并告警');
  const dup = LOCATIONS.some(function(x,j){
    return j!==_icLocIdx && x.region===region && (x.country||'')===country && (x.site||'')===site;
  });
  if(dup){ toast('该地区下已存在同层级行——请编辑那一行'); return; }
  const row = { region:region, country:country, site:site, c:c, note:note };
  if(_icLocIdx>=0){
    Object.assign(LOCATIONS[_icLocIdx], row);
    icLocClose(); renderView(); flushPersist();
    toast('已保存：'+region+(country?' · '+country:'')+(site?' · '+site:'')+' ×'+c.toFixed(2));
  } else {
    LOCATIONS.push(row);
    icLocClose(); renderView(); flushPersist();
    flashNewRow(region+(country?' · '+country:'')+(site?' · '+site:''));
    toast('已新增：'+region+(country?' · '+country:'')+(site?' · '+site:'')+' ×'+c.toFixed(2));
  }
}
function icLocDel(i){
  const x=LOCATIONS[i]; if(!x) return;
  askDel({title:'删除该地点系数行？',
    msg:'将删除 <b>'+esc(x.region)+(x.country?' · '+esc(x.country):'')+(x.site?' · '+esc(x.site):'')+' ×'+x.c.toFixed(2)+'</b>。'
      +(x.country?'':'（这是<b>区域兜底行</b>，删除后该地区未配国家将回退 1.0）'),
    label:'地点系数 '+x.region+(x.country||'')+(x.site||''), done:'已删除',
    run:function(){ LOCATIONS.splice(i,1); },
    undo:function(){ LOCATIONS.splice(i,0,x); }});
}

/* ---------- ③ 时间系数：弹窗增/改（全表区间校验 IN-MC-18） ---------- */
let _icLeadIdx = null;
function icLeadOpen(i){
  _icLeadIdx = (typeof i==='number' && i>=0) ? i : -1;
  const b = _icLeadIdx>=0 ? LEAD_BANDS[_icLeadIdx] : null;
  const d = b ? { min:b.min, max:(b.max>=99999?null:b.max), c:b.c, note:b.note||'' } : { min:0, max:null, c:1.00, note:'' };
  $('icoLeadTitle').textContent = _icLeadIdx>=0 ? '编辑时间系数档' : '新增时间系数档';
  $('icoLeadBody').innerHTML =
     '<div class="form">'
     +'<div class="form-item"><label><em class="form-req">*</em>起始天</label><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><input class="txt" id="icLeadMin" type="number" min="0" step="1" style="width:140px" value="'+d.min+'"> <span class="sub">距询价天数（含）</span></div></div>'
     +'<div class="form-item"><label>结束天</label><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><input class="txt" id="icLeadMax" type="number" min="0" step="1" style="width:140px" placeholder="留空 = 不设上限" value="'+(d.max==null?'':d.max)+'"> <span class="sub">末档留空</span></div></div>'
     +'<div class="form-item"><label><em class="form-req">*</em>时间系数</label><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><input class="txt" id="icLeadC" type="number" min="0.1" step="0.05" style="width:140px" value="'+d.c+'"> <span class="sub">&lt; 1.0 = 远期让利</span></div></div>'
     +'<div class="form-item"><label>说明</label><input class="txt" id="icLeadNote" value="'+esc(d.note)+'"></div>'
     +'</div>';
  $('icoLeadMask').classList.add('show');
  setTimeout(function(){ try{ $('icLeadMin').focus(); }catch(e){} },30);
}
function icLeadClose(){ $('icoLeadMask').classList.remove('show'); _icLeadIdx=null; }
function icLeadSubmit(){
  const minV = $('icLeadMin').value, maxV = ($('icLeadMax').value||'').trim();
  const min = parseInt(minV,10), max = maxV==='' ? 99999 : parseInt(maxV,10);
  const c = parseFloat($('icLeadC').value);
  const note = ($('icLeadNote').value||'').trim();
  if(isNaN(min)||min<0){ toast('起始天须为非负整数'); return; }
  if(maxV!=='' && (isNaN(max)||max<min)){ toast('结束天须 ≥ 起始天'); return; }
  if(!coefValid(c)){ toast('系数须为正数'); return; }
  const cand = { min:min, max:max, c:c, note:note };
  const test = LEAD_BANDS.slice();
  if(_icLeadIdx>=0) test[_icLeadIdx]=cand; else test.push(cand);
  test.sort(function(a,b){ return a.min-b.min; });
  /* IN-MC-18：不重叠且连续覆盖 0 天起至不限 */
  if(test[0].min!==0){ toast('首档须从 0 天起'); return; }
  for(let k=1;k<test.length;k++){
    if(test[k].min!==test[k-1].max+1){ toast('档位须连续且不重叠：'+leadSpanText(test[k-1])+' 与 ['+test[k].min+', …]'); return; }
  }
  if(test[test.length-1].max<99999){ toast('末档须不设结束天（留空）'); return; }
  if(_icLeadIdx>=0){
    LEAD_BANDS[_icLeadIdx]=cand;
  } else {
    LEAD_BANDS.push(cand);
  }
  LEAD_BANDS.sort(function(a,b){ return a.min-b.min; });
  if(c<0.5||c>3.0) toast('系数越出建议区间 [0.5, 3.0]，已保存并告警');
  icLeadClose(); renderView(); flushPersist();
  toast((_icLeadIdx>=0?'档位已更新':'已新增档位')+': '+leadSpanText(cand)+' ×'+c.toFixed(2));
}
function icLeadDel(i){
  const b=LEAD_BANDS[i]; if(!b) return;
  if(LEAD_BANDS.length<=1){ toast('至少保留一档'); return; }
  askDel({title:'删除该时间系数档？',
    msg:'删除 <b>'+leadSpanText(b)+' ×'+b.c.toFixed(2)+'</b> 后若区间出现空洞，将无法保存新的档位调整；未覆盖天数按 1.0 计。',
    label:'时间档 '+leadRangeText(b), done:'已删档',
    run:function(){ LEAD_BANDS.splice(i,1); },
    undo:function(){ LEAD_BANDS.splice(i,0,b); }});
}
