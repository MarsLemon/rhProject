/* 设备与型号 —— 全局型号表：设备是过滤器（含「全部设备」）；
   查询区与新增区彻底分离（zone q / zone f），新增与编辑统一走模态窗（表格只读展示） */
let modelDev = 'all';    // 设备过滤器：'all'=全部设备；否则设备编码
let modelQName = '';     // 型号名过滤（独立控件，全局匹配）
let modelQVendor = 'all';// 厂家过滤：'all'=全部厂家；否则厂家名（VENDORS）
/* ============================================================
   视图：设备与型号
   ============================================================ */
function vModels(){
  const devs=deviceLeaves();
  if(!devs.length){
    return '<div class="card"><div class="empty-tip">暂无设备。</div></div>';
  }
  const isAll = modelDev==='all' || !devs.some(d=>d.code===modelDev);
  if(isAll) modelDev='all';
  const dev = isAll ? null : devs.find(d=>d.code===modelDev);
  const mq=(modelQName||'').trim().toLowerCase();
  const rows=MODELS.map((m,i)=>({m:m,i:i}))
    .filter(o=>(isAll||o.m.dev===modelDev)
      && (!mq || o.m.name.toLowerCase().indexOf(mq)>=0)
      && (modelQVendor==='all' || o.m.vendors.indexOf(modelQVendor)>=0));
  const scope=MODELS.filter(m=>isAll||m.dev===modelDev);
  /* 范围健康度 chips：已按需求从查询区移除（原与总览/体检同一口径） */
  return '<div class="card">'
   /* 查询区：筛选 + 统计 + 重置（只决定「看什么」，不含任何写操作） */
   +'<div class="zone q">'
   +'<div class="secline">'
   +'<span class="fgroup"><span class="fl">设备</span>'+devTreeSelHtml()+'</span>'
   +'<span class="fgroup"><span class="fl">型号名</span>'
   +'<span class="qwrap"><input class="txt" id="modelQInp" placeholder="请输入" value="'+esc(modelQName)+'" style="width:180px" oninput="modelQLive(this)"><button type="button" class="qclear" role="button" aria-label="清除" title="清除" onclick="qClearClick(this)">×</button></span></span>'
   +'<span class="fgroup"><span class="fl">厂家</span><select class="select" style="min-width:170px" onchange="modelQVendor=this.value;pgReset(\'models\');renderView()">'
   +'<option value="all">全部厂家</option>'
   + VENDORS.map(v=>'<option'+(modelQVendor===v?' selected':'')+'>'+esc(v)+'</option>').join('')
   +'</select></span>'
   +'<span style="flex:1"></span>'
   +'<button class="btn sm" type="button" onclick="modelResetQuery()">重置</button>'
   +'</div></div>'
   /* 新增区：按钮居右，去除卡片包裹（唯一入口是弹窗） */
   +'<div style="display:flex;justify-content:flex-end;margin-bottom:12px">'
   +'<button class="btn pri" type="button" onclick="openModelModal(-1)">新增</button>'
   +'</div>'
   /* ③ 只读型号表：点击行/编辑进弹窗 */
   +'<div class="t-wrap"><table class="t"><tr>'
   +(isAll?'<th>所属设备</th>':'')
   +'<th>设备型号</th>'
   +'<th class="num">缸数</th>'
   +'<th>制造厂家</th><th></th></tr>'
   + (rows.length? pgSlice(rows, 'models').map(o=>{
      const m=o.m, i=o.i;
      const dv=catFind(m.dev);
      return '<tr style="cursor:pointer" onclick="openModelModal('+i+')">'
       +(isAll?'<td class="sub">'+esc(dv?dv.name:m.dev)+'</td>':'')
       +'<td><b>'+esc(m.name)+'</b></td>'
       +'<td class="num">'+m.cyl+'</td>'
       +'<td onclick="event.stopPropagation()">'+ m.vendors.map(v=>'<span class="crew-chip" style="font-size:11.5px;padding:3px 9px;color:var(--sub);background:var(--chip)">'+esc(v)+'</span>').join(' ') +'</td>'
       +'<td><button class="btn sm" onclick="event.stopPropagation();openModelModal('+i+')">编辑</button>'
       +' <button class="btn sm danger" onclick="event.stopPropagation();delModel('+i+')">删除</button></td></tr>';
    }).join('')
    : '<tr><td colspan="'+(isAll?5:4)+'"><div class="empty-tip">'
      +((mq||modelQVendor!=='all')
        ? '没有匹配'+(mq?'「'+esc(mq)+'」':'')+(modelQVendor!=='all'?'（厂家 '+esc(modelQVendor)+'）':'')+'的型号'
        : '当前范围暂无型号')
      +'</div></td></tr>')
   +'</table></div>'
   + pagerHtml(rows.length, 'models')
   +'</div>'
}
/* 设备树选择（通用 TS 组件）：单选 + 「全部设备」根项 */
function devTreeSelHtml(){
  TS.ensure('devTree');
  Object.assign(TS.specs['devTree'], {
    allOption:true, allLabel:'全部设备', placeholder:'请选择设备',
    clearable:true, clearValue:'all', value:modelDev,
    onPick:function(c){ modelDev=c; renderView(); }
  });
  return TS.html('devTree');
}
/* 查询重置：设备回「全部」、清型号名、厂家回「全部」（只重置视图状态，不动数据） */
function modelResetQuery(){
  modelDev='all'; modelQName=''; modelQVendor='all'; pgReset('models');
  renderView(); toast('已重置筛选');
}
/* 型号名「输入即过滤」（core.js liveFilter）；厂家为下拉精确过滤 */
function modelQLive(inp){ pgReset('models'); liveFilter(inp, function(v){ modelQName=v; }); }
function bindModels(){
}
/* ============================================================
   型号新增 / 编辑模态（.cfmask 通用弹窗；Esc 关闭 / Enter 提交由 core.js 统一处理）
   弹窗内为草稿态，点「保存/新增」才落库（厂家集合草稿同范式）
   ============================================================ */
let mdlIdx=-1;                                  // -1=新增；否则 MODELS 索引
let mdlDraft={vendors:[], dv:''};               // 厂家集合 / 默认厂家（草稿）
function mdlDevDefault(){ return modelDev!=='all' ? modelDev : (deviceLeaves()[0]||{}).code; }
function openModelModal(i){
  mdlIdx=(typeof i==='number'&&i>=0)?i:-1;
  const m=mdlIdx>=0?MODELS[mdlIdx]:null;
  mdlDraft = m ? { vendors:m.vendors.slice(), dv:m.dv } : { vendors:[], dv:'' };
  renderModelModal();
  $('modelMask').classList.add('show');
  setTimeout(function(){ try{ $('mdName').focus(); }catch(e){} },30);
}
function modelModalClose(){ $('modelMask').classList.remove('show'); mdlIdx=-1; }
/* 厂家区单独渲染：chips 操作只重绘本区，不碰其它输入框——
   避免重绘把用户已填未存的 型号名/缸数 冲掉（草稿安全） */
function mdlVendorsHtml(){
  return (mdlDraft.vendors.length
     ? mdlDraft.vendors.map(function(v){
         return '<span class="crew-chip" style="font-size:11.5px;padding:3px 9px;color:var(--sub);background:var(--chip)">'+esc(v)
          +(mdlDraft.vendors.length>1?' <a style="color:var(--error);cursor:pointer;text-decoration:none" onclick="event.stopPropagation();mdlRmVendor(\''+esc(v)+'\')" title="移除关联">×</a>':'')
          +'</span>';
       }).join(' ')
     : '')
   +' <select class="select" style="max-width:160px" onchange="mdlAddVendor(this.value);this.selectedIndex=0">'
   +'<option value="">＋ 关联厂家…</option>'
   + VENDORS.filter(v=>!mdlDraft.vendors.includes(v)).map(v=>'<option>'+esc(v)+'</option>').join('')
   +'</select>';
}
function renderMdlVendors(){ const el=$('mdVendorArea'); if(el) el.innerHTML=mdlVendorsHtml(); }
function renderModelModal(){
  const isNew = mdlIdx<0;
  const m = isNew? null : MODELS[mdlIdx];
  const devs=deviceLeaves();
  $('modelModalTitle').textContent = isNew?'新增型号':'编辑型号';
  $('modelOk').textContent = '保存';
  $('modelModalBody').innerHTML =
   '<div class="form">'
   +'<div class="form-item"><label><em class="form-req">*</em>所属设备</label><select class="select" id="mdDev">'
   + devs.map(d=>'<option value="'+d.code+'"'+(d.code===(m?m.dev:mdlDevDefault())?' selected':'')+'>'+esc(d.name)+'</option>').join('')
   +'</select></div>'
   +'<div class="form-item"><label><em class="form-req">*</em>设备型号</label><input class="txt" id="mdName" value="'+esc(m?m.name:'')+'" placeholder="请输入"></div>'
   +'<div class="form-item"><label><em class="form-req">*</em>缸数</label><input class="txt" id="mdCyl" type="number" min="1" max="20" value="'+(m?m.cyl:6)+'" title="R-05：缸数为 1–20 整数" style="width:160px"></div>'
   /* 厂家草稿：点选默认（★）、× 移除（至少留一）；新厂家请到「制造厂家」页新增 */
   +'<div class="form-item"><label>制造厂家</label>'
   +'<div id="mdVendorArea" style="line-height:2">'+mdlVendorsHtml()+'</div></div>'
   +'</div>';
}
function mdlRmVendor(v){
  if(mdlDraft.vendors.length<=1){ toast('至少保留一个制造厂家'); return; }
  mdlDraft.vendors=mdlDraft.vendors.filter(x=>x!==v);
  renderMdlVendors();
}
function mdlAddVendor(v){
  if(!v) return;
  if(!mdlDraft.vendors.includes(v)) mdlDraft.vendors.push(v);
  renderMdlVendors();
}
/* 保存：新增 / 编辑统一入口（草稿 → 校验 → 落库 → 留痕 → 定位新行） */
function modelSave(){
  if(mdlIdx>=0) return modelSaveEdit();
  return modelSaveNew();
}
function modelSaveNew(){
  const devs=deviceLeaves();
  const devCode=$('mdDev').value;
  if(!devCode || !devs.some(d=>d.code===devCode)){ toast('请选择设备'); return; }
  const name=($('mdName').value||'').trim();
  if(!name){ toast('请填写型号名'); $('mdName').focus(); return; }
  if(MODELS.some(x=>x.name===name)){ toast('型号名已存在（编码唯一）'); $('mdName').focus(); return; }
  let cyl=parseInt($('mdCyl').value)||6;
  const rawCyl=cyl;
  if(cyl<1)cyl=1; if(cyl>20)cyl=20;                            // R-05：缸数 1–20
  if(rawCyl!==cyl) toast('缸数须为 1–20（R-05），已按 '+cyl+' 新增');
  const vendors=mdlDraft.vendors.length?mdlDraft.vendors.slice():vendorsOf(name).slice();
  MODELS.push({name:name, dev:devCode, cyl:cyl, vendors:vendors, dv:vendors[0]||''});
  modelModalClose(); renderView();
  flashNewRow(name);
  toast('型号已新增');
}
function modelSaveEdit(){
  const m=MODELS[mdlIdx];
  if(!m){ modelModalClose(); return; }
  const name=($('mdName').value||'').trim();
  if(!name){ toast('型号名不能为空'); $('mdName').focus(); return; }
  if(name!==m.name && MODELS.some(x=>x.name===name)){ toast('型号名已存在（编码唯一）'); $('mdName').focus(); return; }
  if(!mdlDraft.vendors.length){ toast('至少保留一个制造厂家'); return; }
  let cyl=parseInt($('mdCyl').value)||m.cyl;
  const rawCyl=cyl;
  if(cyl<1)cyl=1; if(cyl>20)cyl=20;
  if(rawCyl!==cyl) toast('缸数须为 1–20（R-05），已修正为 '+cyl);
  const parts=[];
  const oldName=m.name;
  /* 名称是引用键：更名级联同步（型号级工时配置 models / 型号级规则） */
  if(name!==oldName){
    LABOR_STANDARDS.forEach(s=>{
      if(s.scope==='型号级' && Array.isArray(s.models)){
        const k=s.models.indexOf(oldName); if(k>=0) s.models[k]=name;
      }
    });
    RULES.pkg.concat(RULES.sug).forEach(r=>{ if(r.level==='型号级'&&r.ref===oldName) r.ref=name; });
    if(typeof laborRefModel!=='undefined'&&laborRefModel===oldName) laborRefModel=name;
    if(typeof pvModel!=='undefined'&&pvModel===oldName) pvModel=name;
    m.name=name;
    parts.push('更名 '+oldName+' → '+name);
  }
  if(cyl!==m.cyl){ parts.push('缸数 '+m.cyl+' → '+cyl); m.cyl=cyl; }
  const devCode=$('mdDev').value;
  if(devCode!==m.dev && deviceLeaves().some(d=>d.code===devCode)){
    parts.push('设备 '+m.dev+' → '+devCode); m.dev=devCode;
  }
  const addV=mdlDraft.vendors.filter(v=>!m.vendors.includes(v));
  const rmV=m.vendors.filter(v=>!mdlDraft.vendors.includes(v));
  if(addV.length||rmV.length){
    m.vendors=mdlDraft.vendors.slice();
    parts.push('厂家 +'+addV.length+(rmV.length?(' -'+rmV.length):''));
  }
  m.dv=m.vendors[0]||'';
  if(!parts.length){ toast('内容未变化'); return; }
  modelModalClose(); renderView();
  flashNewRow(m.name);
  toast('型号已保存：'+parts.join('；'));
}
function delModel(i){
  const m=MODELS[i];
  /* 型号级工时配置联动：从 models 摘除该型号；成员清空的配置行一并删除（撤销可整体还原） */
  const emptied=[];
  let nRef=0;
  LABOR_STANDARDS.forEach(function(s){
    if(s.scope==='型号级' && Array.isArray(s.models)){
      const k=s.models.indexOf(m.name);
      if(k>=0){ s.models.splice(k,1); nRef++; if(!s.models.length) emptied.push(s); }
    }
  });
  askDel({title:'删除型号「'+m.name+'」？',
    msg:'将删除型号 <b>'+esc(m.name)+'</b>（'+m.cyl+' 缸）。'
      +(nRef?'它出现在 <b>'+nRef+'</b> 条型号级工时配置中，将同步摘除'+(emptied.length?('，其中 <b>'+emptied.length+'</b> 条因再无型号而被删除'):'')+'；':'')
      +'以「型号级」适用范围挂在它名下的展示规则等配置将不再命中。',
    label:'型号 '+m.name,
    run:function(){ MODELS.splice(i,1); for(let j=LABOR_STANDARDS.length-1;j>=0;j--){ if(emptied.indexOf(LABOR_STANDARDS[j])>=0) LABOR_STANDARDS.splice(j,1); } },
    undo:function(){
      MODELS.splice(i,0,m);
      emptied.forEach(function(s){ if(LABOR_STANDARDS.indexOf(s)<0) LABOR_STANDARDS.push(s); s.models.push(m.name); });
    }});
}
