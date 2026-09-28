/* 方案预览 —— 选一台型号做端到端验证：配置覆盖缺口 + 客户视角计价预览
   回答运营的核心问题：「这台型号上线了吗？客户选它会看到什么、预算多少？哪里还缺？」
   口径对齐：§8.3 价格健康巡检 / FR-03 定价引擎 / R-19 合计公式 / D8 建议项不计价
             / D16 保底价（R-30）/ D17 服务信息与影响系数（R-38～R-41）。
   计价复用 pkg.js 的解析函数（pkgResolved / qtyOfMode），与本页同载。 */
let cuModel = null;   // null = 全部型号总表；型号名 = 单型号详情
let cuNotice = null;  // 深链 ?pkg 未命中时的提示
let cuCombo = null;   // 方案预览详情中当前选中的维保类型场景索引（null = 默认第一个）
let cuSug = {};       // 各类型场景下已勾选的可选项：{ comboIdx: { sugRowKey: true } }
let cuPkg = {};       // 各类型场景下套餐分组的展开/折叠状态：{ comboIdx: { pkgCode: false=收起 } }
let cuSvc = null;     // 服务信息模拟器（D17，订单级）：{urg, region, country, site, date}；null = 默认值
/* 深链：preview.html?model=型号名 直达指定型号；preview.html?pkg=套餐编码 跳到命中该套餐的型号
   （其他页可带上下文跳转） */
function cuApplyDeepLink(){
  try{
    cuNotice=null;
    const p=new URLSearchParams(location.search);
    const mo=p.get('model');
    if(mo && MODELS.some(m=>m.name===mo)){
      cuModel=mo;
    } else {
      const pk=p.get('pkg');
      if(pk){
        const r=RULES.pkg.find(x=>x.pkg===pk);
        const target = r && (r.level==='型号级' ? r.ref
          : (r.dev ? (MODELS.find(m=>m.dev===r.dev)||{}).name : null));
        if(target && MODELS.some(m=>m.name===target)) cuModel=target;
        else cuNotice='套餐「'+pk+'」尚未被任何展示规则引用，客户侧不会展示该套餐。';
      }
    }
    if(cuModel) history.replaceState(null,'', location.pathname);
  }catch(e){}
}
function cuOpen(name){ cuModel=name; cuCombo=null; cuSug={}; cuPkg={}; renderView({top:true}); }
function cuBack(){ cuModel=null; cuCombo=null; cuSug={}; cuPkg={}; renderView({top:true}); }
function cuToggleSug(i, k){ if(!cuSug[i]) cuSug[i]={}; cuSug[i][k]=!cuSug[i][k]; renderView(); }
function cuTogglePkg(i, code){ if(!cuPkg[i]) cuPkg[i]={}; cuPkg[i][code]=(cuPkg[i][code]===false)?true:false; renderView(); }
/* (类型, 周期) 组合：设备挂载的类型展开（启用周期的类型按周期字典逐档，R-28） */
function cuCombos(dev){
  const out=[];
  (dev.mts||[]).forEach(function(code){
    const t=MTYPES.find(function(x){ return x.code===code; });
    if(!t) return;
    if(t.cycle) CYCLES.forEach(function(c){ out.push({mt:code, cycle:c}); });
    else out.push({mt:code, cycle:null});
  });
  return out;
}
/* 保底价（D16/R-30）：项保底价 = 该项人员配置综合费率 × 最低计费工时
   （按一份计：不乘数量、不看实际标准工时；开关关闭 = 0。v1.14 去件数系数） */
function cuFloorOf(res){
  if(!res || !res.std) return 0;
  if(!PPARAMS.floorOn) return 0;
  return rateSumOf(res.std.crew) * PPARAMS.minH;
}
/* ---- 服务信息模拟器（D17）：默认 不紧急 / 第一个地区+国家 / 两周后 ---- */
function cuSvcIso(t){ return t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2); }
function cuSvcDefault(){
  const r0 = locRegions()[0] || '';
  const c0 = locCountries(r0)[0] || '';
  const d = new Date(Date.now() + 14*86400000);
  return { urg: (URGENT[0]||{}).key || 'no', region: r0, country: c0, site: '', date: cuSvcIso(d) };
}
function cuSvcEnsure(){ if(!cuSvc) cuSvc = cuSvcDefault(); return cuSvc; }
/* 距询价天数 = 服务日期 − 今天（自然日，当天 = 0；过去日期按 0 兜底，R-40） */
function cuLeadDaysOf(svc){
  const d = new Date((svc.date||'') + 'T00:00:00');
  if(isNaN(d.getTime())) return 0;
  const now = new Date(); now.setHours(0,0,0,0);
  return Math.max(0, Math.round((d - now)/86400000));
}
/* 三维合成：K = Max(紧急, 地点, 时间)（取最大值，各未命中 = 1.0，R-41，Q-9 已决） */
function cuCoefOf(svc){
  const u = urgentOf(svc.urg);
  const l = locResolve(svc.region, svc.country, svc.site);
  const days = cuLeadDaysOf(svc);
  const b = leadBandOf(days);
  const locTxt = svc.region + (svc.country ? ' · '+svc.country : '') + (svc.site ? ' · '+svc.site : '');
  return {
    u: u, l: l, days: days, band: b,
    k: Math.max(u.c, l.c, b.c),
    txt: '影响系数取最大：紧急「'+u.label+'」'+u.c.toFixed(2)+' / 地点「'+locTxt+'」'+l.c.toFixed(2)+'（'+l.level+'） / 距询价 '+days+' 天 '+b.c.toFixed(2)+' → Max = '+Math.max(u.c, l.c, b.c).toFixed(4)
  };
}
/* 套餐明细引用 → 服务项编码（兼容 labor:CODE 行指针旧格式与纯编码两种 ref） */
function cuItemCode(ref){
  const s=String(ref||'');
  return (s.indexOf(':')>=0 && s.split(':')[0]==='labor') ? s.split(':')[1] : s;
}
/* 单个「类型(+周期)」场景的完整推导 */
function cuScene(model, combo){
  const hitP=resolveRules('pkg', model.name, combo.mt, combo.cycle);
  const hitS=resolveRules('sug', model.name, combo.mt, combo.cycle);
  const gmap={}; const miss=[];
  (hitP.rows||[]).forEach(function(r){
    const pkg=PACKAGES.find(function(p){ return p.code===r.pkg; })||{};
    if(!gmap[r.pkg]) gmap[r.pkg]={code:r.pkg, name:pkg.name||r.pkg, items:[]};
    const g=gmap[r.pkg];
    (pkg.items||[]).forEach(function(it){
      const code=cuItemCode(it.ref);
      const q=qtyOfMode(it.mode, it.qty, model.cyl);
      const res=pkgResolved(it, model.cyl, combo.mt, combo.cycle, model.name);
      if(!res){ miss.push({code:code, name:siNameOf(code), why:'两级未命中（IN-MC-12）', q:q}); return; }
      const H=laborHoursOf(res.std, model.cyl);
      if(!H){ miss.push({code:code, name:siNameOf(code), why:'缸数分档未命中（IN-MC-14b）', q:q}); return; }
      const unit=rateSumOf(res.std.crew)*H;                 // 基准单价（v1.14 去件数系数，R-33）
      g.items.push({name:siNameOf(code), q:q, unit:unit, amt:unit*q, level:res.level, floor:cuFloorOf(res)});
    });
  });
  const groups=Object.keys(gmap).map(function(k){
    const g=gmap[k]; g.amt=g.items.reduce(function(s,l){ return s+l.amt; }, 0); return g;
  });
  const sum=groups.reduce(function(s,g){ return s+g.amt; }, 0);
  /* 合计保底价（R-30）：套餐内各可计价项的项保底价之和（建议项在详情视图按勾选追加） */
  const floorSum=groups.reduce(function(s,g){ return s+g.items.reduce(function(x,l){ return x+l.floor; }, 0); }, 0);
  return {hitP:hitP, hitS:hitS, groups:groups, miss:miss, sum:sum, floorSum:floorSum};
}
function vPreview(){
  cuApplyDeepLink();
  if(cuModel && !MODELS.some(function(x){ return x.name===cuModel; })) cuModel=null;   // 型号已删 → 回总表
  if(!MODELS.length){
    return '<div class="card"><div class="empty-tip">暂无型号。</div></div>';
  }
  const notice = (cuNotice && !cuModel)
    ? '<div class="card" style="border-left:3px solid var(--gold-text)"><div class="sub">'+cuNotice+'</div></div>'
    : '';
  return notice + (cuModel ? cuDetailView() : cuSummaryView());
}
/* 单台型号方案预览统计（总表行数据） */
function cuStats(m){
  const dev=catFind(m.dev);
  const combos=cuCombos(dev);
  const scenes=combos.map(function(c){ return cuScene(m, c); });
  const nOk=scenes.filter(function(s){ return s.hitP.level && !s.miss.length; }).length;
  const nWarn=scenes.filter(function(s){ return s.hitP.level && s.miss.length; }).length;
  const nBad=scenes.filter(function(s){ return !s.hitP.level; }).length;
  const missTotal=scenes.reduce(function(n,s){ return n+s.miss.length; }, 0);
  return {m:m, dev:dev, n:combos.length, nOk:nOk, nWarn:nWarn, nBad:nBad, missTotal:missTotal};
}
/* 一级视图：全部型号方案预览总表（有缺口的排前面，点行进详情） */
function cuSummaryView(){
  const rows=MODELS.map(cuStats);
  const isProblem=function(r){ return r.n===0 || r.nWarn>0 || r.nBad>0; };
  const ordered=rows.filter(isProblem).concat(rows.filter(function(r){ return !isProblem(r); }));
  const nReady=rows.length-rows.filter(isProblem).length;
  const trs=ordered.map(function(r){
    const st = r.n===0 ? '<span class="tag gray">未挂载类型</span>'
      : (r.nBad===0 && r.nWarn===0) ? '<span class="tag ok">✓ '+r.nOk+'/'+r.n+'</span>'
      : '<span class="tag '+(r.nBad?'bad':'warn')+'">'+r.nOk+'/'+r.n+'（'
        +[r.nWarn?r.nWarn+' 个类型场景有缺口':'', r.nBad?r.nBad+' 个类型场景无规则':''].filter(Boolean).join('，')+'）</span>';
    return '<tr style="cursor:pointer" onclick="cuOpen(\''+esc(r.m.name)+'\')">'
     +'<td><b>'+esc(r.m.name)+'</b></td>'
     +'<td class="sub">'+esc(r.dev?r.dev.name:'—')+'</td>'
     +'<td class="num">'+r.m.cyl+'</td>'
     +'<td class="num">'+r.n+'</td>'
     +'<td>'+st+'</td>'
     +'<td>'+(r.missTotal?'<span class="tag warn">'+r.missTotal+' 行不可计价</span>':'<span class="sub">—</span>')+'</td>'
     +'<td><button class="btn sm" type="button" onclick="event.stopPropagation();cuOpen(\''+esc(r.m.name)+'\')">方案预览 →</button></td></tr>';
  }).join('');
  return '<div class="card"><h2>全部型号方案预览总表 <span class="sub">有缺口的型号排在前面</span>'
   +'<span class="cardact">'
   +'<span class="tag ok">'+nReady+' 台就绪</span>'
   +(rows.length-nReady?'<span class="tag warn">'+(rows.length-nReady)+' 台待处理</span>':'')
   +'</span></h2>'
   +'<div class="t-wrap"><table class="t"><tr><th>型号</th><th>设备</th><th class="num">缸数</th><th class="num">类型场景</th><th>预览结论</th><th>缺口</th><th></th></tr>'
   +trs
   +'</table></div>'
   +'<div class="sub" style="margin-top:8px">类型场景 = 设备挂载的「维保类型(+周期)」组合；结论按套餐规则命中与逐行工时回溯（§8.3 巡检口径）汇总。</div>'
   +'</div>';
}
/* 服务信息模拟器（D17，订单级）：模拟客户提交的 紧急/服务地点/服务时间，
   实时观察三维系数与最终报价——只重算「影响系数 → 最终报价」，不改明细行 */
function cuSvcCardHtml(){
  const svc=cuSvcEnsure();
  const today=cuSvcIso(new Date());
  const regions=locRegions();
  const countries=svc.region ? locCountries(svc.region) : [];
  const sites=(svc.region && svc.country) ? locSites(svc.region, svc.country) : [];
  const co=cuCoefOf(svc);
  function optList(arr, cur, emptyLabel){
    let h=emptyLabel?('<option value=""'+(cur?'':' selected')+'>'+emptyLabel+'</option>'):'';
    arr.forEach(function(x){ h+='<option'+(x===cur?' selected':'')+'>'+esc(x)+'</option>'; });
    return h;
  }
  return '<div class="zone q"><div class="secline" style="flex-wrap:wrap;gap:10px">'
   +'<span class="fgroup"><span class="fl">是否紧急</span><select class="select svc-sel" onchange="cuSvcSet(\'urg\', this.value)">'
   + URGENT.map(function(u){ return '<option value="'+u.key+'"'+(u.key===svc.urg?' selected':'')+'>'+esc(u.label)+' ×'+u.c.toFixed(2)+'</option>'; }).join('')
   +'</select></span>'
   +'<span class="fgroup"><span class="fl">服务地点</span>'
   +'<select class="select svc-sel" onchange="cuSvcSet(\'region\', this.value)">'+regions.map(function(r){ return '<option'+(r===svc.region?' selected':'')+'>'+esc(r)+'</option>'; }).join('')+'</select>'
   +' <select class="select svc-sel" onchange="cuSvcSet(\'country\', this.value)">'+optList(countries, svc.country, '')+'</select>'
   +' <select class="select svc-sel" onchange="cuSvcSet(\'site\', this.value)">'+optList(sites, svc.site, '地点选填')+'</select></span>'
   +'<span class="fgroup"><span class="fl">服务时间</span><input type="date" class="txt" id="cuSvcDate" style="width:150px" min="'+today+'" value="'+esc(svc.date)+'" onchange="cuSvcSet(\'date\', this.value)"></span>'
   +'<span style="flex:1"></span>'
   +'<span class="tag info" title="'+esc(co.txt)+'">影响系数 K = '+co.k.toFixed(4)+'</span>'
   +'<button class="btn sm" type="button" onclick="cuSvcReset()">重置</button>'
   +'</div>'
   +'<div class="sub" style="margin-top:6px">'+esc(co.txt)+'　（地点回溯：地点级 &gt; 国家级 &gt; 地区级，留空维度任意；维护入口 <a href="icoef.html" style="color:var(--accent)">影响系数</a>）</div>'
   +'</div>';
}
function cuSvcSet(part, v){
  const svc=cuSvcEnsure();
  if(part==='urg') svc.urg=v;
  if(part==='region'){ svc.region=v; svc.country=locCountries(v)[0]||''; svc.site=''; }
  if(part==='country'){ svc.country=v; svc.site=''; }
  if(part==='site') svc.site=v;
  if(part==='date') svc.date=v;
  renderView();
}
function cuSvcReset(){ cuSvc=cuSvcDefault(); renderView(); }
/* 二级视图：单型号详情 */
function cuDetailView(){
  const m=MODELS.find(function(x){ return x.name===cuModel; });
  const dev=catFind(m.dev);
  const combos=cuCombos(dev);
  const scenes=combos.map(function(c){ return cuScene(m, c); });
  const nOk=scenes.filter(function(s){ return s.hitP.level && !s.miss.length; }).length;
  const nWarn=scenes.filter(function(s){ return s.hitP.level && s.miss.length; }).length;
  const nBad=scenes.filter(function(s){ return !s.hitP.level; }).length;

  const sel='<div class="zone q">'
   +'<div class="secline"><span class="fgroup"><span class="fl">型号</span>'
   +'<select class="select" id="cuModelSel">'
   + deviceLeaves().map(function(d){
       const ms=MODELS.filter(function(x){ return x.dev===d.code; });
       if(!ms.length) return '';
       return '<optgroup label="'+esc(d.name)+'">'
         + ms.map(function(x){ return '<option'+(x.name===cuModel?' selected':'')+'>'+esc(x.name)+'</option>'; }).join('')
         +'</optgroup>';
     }).join('')
   +'</select></span>'
   +'<span class="tag gray">'+m.cyl+' 缸（代表值）</span>'
   +'<span class="tag gray">默认厂家 '+esc(m.dv)+'</span>'
   +'</div></div>';

  /* ② 档案与结论 */
  const verdict = combos.length===0
    ? '<span class="tag bad">设备未挂载维保类型</span><div class="sub" style="margin-top:4px">该设备前台无类型可选。</div>'
    : (nBad===0 && nWarn===0
        ? '<span class="tag ok">✓ '+nOk+' 个类型场景全部可计价</span>'
        : '<span class="tag '+(nBad?'bad':'warn')+'">'
          + [nOk+' 个完整可计价', nWarn?nWarn+' 个有缺口':'', nBad?nBad+' 个无套餐规则':'']
              .filter(Boolean).join(' · ')+'（共 '+combos.length+' 个类型场景）</span>');
  const profile='<div class="card"><h2>预览结论 <span class="sub">客户在这台型号上能算出价吗</span></h2>'
   +'<div class="ov-grid" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">'
   +'<div>'
   +'<div class="chain" style="line-height:2.1">'
   +'<div>分类路径：<b>'+esc(devicePath(m.dev))+'</b></div>'
   +'<div>类型场景：<b>'+combos.length+'</b> 个（= 维保类型(+周期) 组合，启用周期的类型按周期展开）</div>'
   +'<div>关联厂家：<b>'+m.vendors.length+'</b> 家 · 默认 '+esc(m.dv)+'（价格与厂家无关）</div>'
   +'</div></div>'
   +'<div style="border-left:1px solid var(--line);padding-left:18px">'
   +'<div style="margin-bottom:8px">'+verdict+'</div>'
   +(nWarn ? '<div class="sub">有缺口 = 套餐内部分明细行工时未命中，该行<b>不可计价</b>、不计入合计（客户侧隐藏或置灰）。</div>' : '')
   +(nBad ? '<div class="sub">无套餐规则 = 该类型场景前台提示「暂无维保方案数据」并引导咨询（R-26）。</div>' : '')
   +'<div class="sub" style="margin-top:6px">口径：基准单价=Σ(费率×人数)×工时；行金额=基准单价×数量（v1.14 起多件不再折减）；明细合计=套餐小计+已选建议项；计价基数=Max(合计保底价, 明细合计)；最终报价=计价基数×影响系数（D8 建议项默认不勾选不计价）。</div>'
   +'</div></div></div>';

  /* ③ 维保类型下拉（选哪个展示哪个）+ 选中场景的客户视角预览 */
  const comboSel = combos.length ? '<div class="zone q"><div class="secline"><span class="fgroup"><span class="fl">维保类型</span>'
    +'<select class="select" id="cuComboSel">'
    + combos.map(function(c, i){
        const s=scenes[i];
        const mtObj=MTYPES.find(function(t){ return t.code===c.mt; });
        const label=esc(mtObj?mtObj.name:c.mt)+(c.cycle?' · '+esc(c.cycle):'');
        const st = !s.hitP.level ? '✗ 无套餐规则' : (s.miss.length ? '⚠ 有缺口' : '✓ 完整');
        const picked = (cuCombo!==null && cuCombo===i) || (cuCombo===null && i===0);
        return '<option value="'+i+'"'+(picked?' selected':'')+'>'+st+'　'+label+'</option>';
      }).join('')
    +'</select></span></div></div>' : '';
  const blockArr=combos.map(function(c, i){
    const s=scenes[i];
    const mtObj=MTYPES.find(function(t){ return t.code===c.mt; });
    const head=esc(mtObj?mtObj.name:c.mt)+(c.cycle?' · '+esc(c.cycle):'');
    if(!s.hitP.level){
      return '<div class="card"><h2>'+head+' <span class="tag bad">无套餐规则</span></h2>'
       +'<div class="empty-tip">前台该类型场景提示「暂无维保方案数据」并引导客户咨询（R-26）。'
       +' <a href="rule.html" style="color:var(--accent)">去配规则 →</a></div></div>';
    }
    /* 可选项（建议项）：勾选即按同口径计入预算（D8），已勾选项同时计入保底（R-30 只看已勾选） */
    const sugPriced=(s.hitS.rows||[]).map(function(r, k){
      const code=r.si;
      const res=pkgResolved({ref:code}, m.cyl, c.mt, c.cycle, m.name);
      if(!res) return {code:code, name:siNameOf(code), ok:false, why:'两级未命中（IN-MC-12）', key:k};
      const H=laborHoursOf(res.std, m.cyl);
      if(!H) return {code:code, name:siNameOf(code), ok:false, why:'缸数分档未命中（IN-MC-14b）', key:k};
      const q=qtyOfMode(r.mode, r.qty, m.cyl);
      const unit=rateSumOf(res.std.crew)*H;
      return {code:code, name:siNameOf(code), q:q, unit:unit, amt:unit*q, level:res.level, floor:cuFloorOf(res), ok:true, key:k};
    });
    const ck=cuSug[i]||{};
    let sugCheckedN=0, sugCheckedAmt=0, sugCheckedFloor=0;
    sugPriced.forEach(function(x){ if(x.ok && ck[x.key]){ sugCheckedN++; sugCheckedAmt+=x.amt; sugCheckedFloor+=x.floor; } });
    /* 价格构成（D16/D17）：明细合计 → 合计保底价 → 计价基数 → × 影响系数 → 最终报价 */
    const detail=s.sum+sugCheckedAmt;
    const floorTotal=s.floorSum+sugCheckedFloor;
    const pkgFloorN=s.groups.reduce(function(n,g){ return n+g.items.length; }, 0);
    const floorN=pkgFloorN+sugCheckedN;
    const base=Math.max(floorTotal, detail);
    const shortfall=Math.max(0, floorTotal-detail);
    const co=cuCoefOf(cuSvcEnsure());
    const grand=Math.round(base*co.k*100)/100;
    const floorOn=PPARAMS.floorOn;
    const nLines=s.groups.reduce(function(n,g){ return n+g.items.length; }, 0);
    const missHtml=s.miss.length
      ? '<div style="margin-top:10px"><b style="font-size:13px;color:var(--gold-text)">⚠ '+s.miss.length+' 行不可计价</b>'
        +'<div class="t-wrap" style="margin-top:6px"><table class="t"><tr><th>服务项</th><th class="num">数量</th><th>原因</th><th></th></tr>'
        + s.miss.map(function(x){
            return '<tr><td>'+esc(x.name)+'</td><td class="num">'+x.q+'</td><td><span class="tag bad">'+esc(x.why)+'</span></td>'
             +'<td><button class="btn sm" onclick="go(\'labor?si='+encodeURIComponent(x.code)+'\')">补工时 →</button></td></tr>';
          }).join('')
        +'</table></div></div>'
      : '';
    const sugHtml=sugPriced.length
      ? '<div style="margin-top:10px"><b style="font-size:13px">可选项（建议项，勾选即计入预算）</b>'
        +'<div style="margin-top:6px">'
        + sugPriced.map(function(x){
            if(!x.ok) return '<label style="display:flex;align-items:center;gap:6px;padding:4px 0;opacity:.6"><span class="tag bad">'+esc(x.name)+'</span><span class="sub">不可计价：'+esc(x.why)+'</span></label>';
            return '<label style="display:flex;align-items:center;gap:6px;padding:4px 0"><input type="checkbox" '+(ck[x.key]?'checked':'')+' onchange="cuToggleSug('+i+','+x.key+')">'
              +'<span>'+esc(x.name)+'</span>'
              +'<span class="sub">'+x.q+' × '+money(x.unit)+' = '+money(x.amt)+'</span></label>';
          }).join('')
        +'</div></div>'
      : '';
    /* 套餐分组（可折叠）：点套餐名展开具体服务项 */
    const pkgHtml=s.groups.map(function(g){
      const open = !(cuPkg[i] && cuPkg[i][g.code]===false);
      const body = g.items.length
        ? '<table class="t"><tr><th>服务项</th><th class="num">数量</th><th>工时命中</th><th class="num">基准单价</th><th class="num">行金额</th><th class="num">项保底价</th></tr>'
          + g.items.map(function(l){
              return '<tr><td style="max-width:230px">'+esc(l.name)+'</td>'
                +'<td class="num">'+l.q+'</td><td><span class="tag gray">'+esc(l.level)+'</span></td>'
                +'<td class="num">'+money(l.unit)+'</td><td class="num"><b>'+money(l.amt)+'</b></td>'
                +'<td class="num">'+(floorOn? '<span class="sub" title="按一份计：人员配置综合费率 × '+PPARAMS.minH+'h（不乘数量）">'+money(l.floor)+'</span>' : '<span class="sub">—</span>')+'</td></tr>';
            }).join('')
          +'<tr><td colspan="5" style="text-align:right;color:var(--sub)">套餐小计</td><td class="num"><b>'+money(g.amt)+'</b></td></tr>'
          +'</table>'
        : '<div class="sub" style="padding:6px 0">该套餐下无可计价服务项</div>';
      return '<div class="pkg-sec" style="margin-top:10px;border:1px solid var(--line);border-radius:8px;overflow:hidden">'
        +'<div class="pkg-head" style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:9px 12px;background:var(--zone)" onclick="cuTogglePkg('+i+',\''+esc(g.code)+'\')">'
        +'<span style="width:14px;display:inline-block">'+ (open?'▾':'▸') +'</span>'
        +'<b>'+esc(g.name)+'</b>'
        +'<span class="sub">'+(g.items.length?g.items.length+' 项':'无计价项')+'</span>'
        +'<span style="margin-left:auto" class="tag info">'+money(g.amt)+'</span>'
        +'</div>'
        + (open ? '<div class="pkg-body" style="padding:0 12px 10px"><div class="t-wrap">'+body+'</div></div>' : '')
        +'</div>';
    }).join('');
    return '<div class="card"><h2>'+head
     +' <span class="tag '+(s.miss.length?'warn':'ok')+'">'+(s.miss.length?('⚠ '+s.miss.length+' 行不可计价'):('✓ '+nLines+' 行可计价'))+'</span>'
     +' <span class="sub">规则命中 '+esc(s.hitP.level)+(sugPriced.length?(' · 可选项 '+sugPriced.length+' 条'):'')+'</span>'
     +'</h2>'
     + (s.groups.length ? pkgHtml : '<div class="sub" style="padding:8px 0">该类型场景未命中任何套餐。</div>')
     +'<div class="t-wrap" style="margin-top:10px"><table class="t">'
     +'<tr><td colspan="5" style="text-align:right;color:var(--sub)">明细合计'+(s.miss.length?'（仅含可计价行）':'')+(sugCheckedN?('（含已选建议项 '+sugCheckedN+' 项）'):'')+'</td><td class="num"><b>'+money(detail)+'</b></td></tr>'
     +'<tr><td colspan="5" style="text-align:right;color:var(--sub)">合计保底价'+(floorOn?('（'+floorN+' 项 × '+PPARAMS.minH+'h · 按一份计）'):'')+'</td>'
     +(floorOn?'<td class="num">'+money(floorTotal)+'</td>':'<td class="num"><span class="sub">保底已关闭</span></td>')+'</tr>'
     +(floorOn && shortfall>0 ? '<tr><td colspan="5" style="text-align:right;color:var(--gold-text)">保底补足额（明细不足，按保底托底）</td><td class="num" style="color:var(--gold-text)">'+money(shortfall)+'</td></tr>' : '')
     +'<tr><td colspan="5" style="text-align:right;color:var(--sub)">计价基数 = Max(合计保底价, 明细合计)</td><td class="num"><b>'+money(base)+'</b></td></tr>'
     +'<tr><td colspan="5" style="text-align:right;color:var(--sub)">影响系数（取 Max(紧急, 地点, 时间)）</td><td class="num" title="'+esc(co.txt)+'"><b>×'+co.k.toFixed(4)+'</b></td></tr>'
     +'<tr><td colspan="5" style="text-align:right;font-weight:600">最终报价（估算，非成交价）</td><td class="num"><b style="color:var(--accent)">'+money(grand)+'</b></td></tr>'
     +'</table></div>'
     + missHtml + sugHtml
     +'</div>';
  });
  const selIdx = (cuCombo!==null && cuCombo < combos.length) ? cuCombo : 0;
  const shown = combos.length ? blockArr[selIdx] : '';

  return '<div style="margin-bottom:12px"><button class="btn sm" type="button" onclick="cuBack()">← 全部型号总表</button></div>'
   + sel + cuSvcCardHtml() + profile + comboSel
   + shown
;
}
function bindPreview(){
  const sel=$('cuModelSel');
  if(sel) sel.addEventListener('change', function(){ cuModel=sel.value; cuCombo=null; renderView(); });
  const cs=$('cuComboSel');
  if(cs) cs.addEventListener('change', function(){ cuCombo=parseInt(cs.value,10); renderView(); });
  const ds=$('cuSvcDate');
  if(ds && window.DP) DP(ds);   // 服务时间：antd 风格 DatePicker（每次重绘后重新挂载，旧面板随 DOM 一起销毁）
  if(window.SEL) document.querySelectorAll('#content select.svc-sel').forEach(function(el){ SEL.mount(el); });   // 服务信息下拉：antd 风格 Select（重绘后重挂载）
}
