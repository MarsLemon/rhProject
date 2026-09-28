/* 保底参数（pricing_param · D16/R-30）—— 取代原「基础服务费」（D13 已作废）
   ----------------------------------------------------------------
   原页面按 设备+类型(+周期) 配置固定加收金额；新口径下保底价不落配置金额，
   由「各已勾选服务项的人员配置综合费率 × 最低计费工时」逐项推导（R-30），
   本页只维护两个全局参数：
     · floorOn 保底开关（关闭后 最终报价 = 明细合计 × 影响系数）
     · minH    最低计费工时（人工最低一天，默认 8 小时）
   「天」→小时折算（hours_per_day，R-33）与 minH 默认值相同但相互独立：
   demo 中标准工时的"天"在解析期已按 8h 固定折算，故此处只读展示。 */
function vBfee(){
  const minH = PPARAMS.minH;
  /* 推导示例：现有工时标准里的全部人员配置模板（去重）→ 该配置的项保底价 */
  const seen = {}; const crews = [];
  LABOR_STANDARDS.forEach(function(s){
    const key = RANKS.map(function(r){ return s.crew[r] ? r + '×' + s.crew[r] : ''; }).filter(Boolean).join('+');
    if (!key || seen[key]) return;
    seen[key] = 1;
    crews.push({ key: key, crew: s.crew, rate: rateSumOf(s.crew) });
  });
  crews.sort(function(a,b){ return b.rate - a.rate; });

  return '<div class="card"><h2>保底参数</h2>'
   +'<div class="zone q"><div class="secline" style="flex-wrap:wrap;align-items:center;gap:16px">'
   +'<label style="display:flex;align-items:center;gap:6px;cursor:pointer">'
   +'<input type="checkbox" id="bfFloorOn" '+(PPARAMS.floorOn?'checked':'')+' onchange="bfFloorOnChange(this.checked)">'
   +'<b>保底价生效</b></label>'
   +'<span class="fgroup"><span class="fl">最低计费工时</span>'
   +'<input class="n" id="bfMinH" type="number" min="0.5" step="0.5" value="'+minH+'" style="width:88px" onchange="bfMinHChange(this.value)"> <span class="sub">小时</span></span>'
   +'<span class="fgroup"><span class="fl">「天」→小时</span><b>'+DAY_H+' h</b> <span class="sub">只读</span></span>'
   +'</div></div></div>'

   +'<div class="card"><h2>项保底价示例（按人员配置）</h2>'
   +'<div class="t-wrap"><table class="t"><tr><th>人员配置</th><th class="num">综合费率 $/h</th><th class="num">项保底价（× '+minH+'h）</th></tr>'
   +(crews.length ? crews.map(function(c){
      return '<tr><td>'+crewChipsHtml(c.crew)+'</td>'
       +'<td class="num">$'+c.rate+'</td>'
       +'<td class="num"><b>'+money(c.rate*minH)+'</b></td></tr>';
    }).join('')
    : '<tr><td colspan="3"><div class="empty-tip">暂无工时标准——请先在「工时标准」页新建人员配置。</div></td></tr>')
   +'</table></div>'
   +'</div>';
}
function bindBfee(){
  const inp=$('bfMinH');
  if(inp) inp.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); inp.blur(); } });
}
/* 开关与最低计费工时：改完即存（失败回滚提示） */
function bfFloorOnChange(on){
  const old=PPARAMS.floorOn;
  PPARAMS.floorOn=!!on;
  renderView(); flushPersist();
  toast(on?'保底价已启用':'保底价已关闭');
}
function bfMinHChange(v){
  const n=parseFloat(v);
  if(isNaN(n)||n<=0){ toast('最低计费工时须为正数'); renderView(); return; }
  const old=PPARAMS.minH;
  PPARAMS.minH=n;
  renderView(); flushPersist();
  toast('最低计费工时已更新为 '+n+'h');
}
