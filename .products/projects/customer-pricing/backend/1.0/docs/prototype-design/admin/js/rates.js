/* 费率 —— 职级费率卡（直接生效 + 撤销 + 留痕，Q-3 默认口径）
   件数系数卡已随「件数工时系数退役」（2026-09-11，D18 / R-34 作废）移除：
   行金额 = 基准单价 × 数量，多件不再折减。
   草稿/发布机制已按业务确认移除：调薪直接行内编辑生效卡，失焦即存，
   6 秒内可撤销；全表推导价实时跟随，历史询价走价格快照（R-36）。 */
function vRates(){
  const a=RATES.active;
  let h = '<div class="card"><h2>职级费率 <span class="cardact"><button class="btn pri" type="button" onclick="openAddRank()">＋ 新增职级</button></span></h2>'
   +'<div class="t-wrap"><table class="t"><tr><th>职级</th><th>定位</th><th class="num">单价$/h</th><th>操作</th></tr>'
   + RANKS.map(function(r){
      return '<tr><td><span class="dot" style="background:'+RANK_META[r].bg+';box-shadow:inset 0 0 0 2.5px '+RANK_META[r].fg+'"></span><b>'+r+'</b></td>'
       +'<td>'+RANK_META[r].role+'</td>'
       +'<td class="num">$'+a.rates[r]+'</td>'
       +'<td><button class="btn sm" type="button" onclick="openRtEdit(\''+r+'\')">编辑</button> '
       +'<button class="btn sm danger" type="button" disabled title="职级费率固定，不可删除">删除</button></td></tr>';
    }).join('')
   +'</table></div>'
   +'</div>';
  return h;   // 件数系数卡已随 D18 退役（2026-09-11）
}
/* 费率卡：行内编辑已收为「编辑」按钮弹窗（与项目分组一致），删除因职级固定禁用 */
function bindRates(){ /* 本页仅费率卡；件数系数卡已退役 */ }
/* —— 费率编辑模态：改完即存 + 可撤销 —— */
let _rtRk=null;
function openRtEdit(rk){
  const a=RATES.active;
  if(!(rk in a.rates)) return;
  _rtRk=rk;
  $('rtRankLbl').textContent=rk;
  $('rtRoleInp').value=RANK_META[rk].role;
  $('rtRateInp').value=a.rates[rk];
  $('rtMask').classList.add('show');
  setTimeout(function(){ try{ $('rtRateInp').focus(); $('rtRateInp').select(); }catch(e){} },30);
}
function rtModalClose(){ _rtRk=null; $('rtMask').classList.remove('show'); }
function rtModalSave(){
  const rk=_rtRk; if(rk==null) return;
  const a=RATES.active; const oldRate=a.rates[rk]; const oldRole=RANK_META[rk].role;
  let v=parseFloat($('rtRateInp').value);
  let role=($('rtRoleInp').value||'').trim();
  if(!role){ toast('请填写定位'); return; }
  if(isNaN(v)||v<0){ toast('费率须为不小于 0 的数字'); return; }
  if(v===oldRate && role===oldRole){ rtModalClose(); return; }
  a.rates[rk]=v; RANK_META[rk].role=role;
  const h=undoPush('费率/定位 '+rk, function(){ a.rates[rk]=oldRate; RANK_META[rk].role=oldRole; renderView(); toast('已回滚 '+rk); });
  rtModalClose(); renderView(); flushPersist();
  undoToast(rk+' 费率/定位已更新，全站展示实时跟随', h);
}
/* —— 新增职级：弹窗 + 配色自动分配 + 落盘 + 可撤销 —— */
const _RANK_PALETTE=[ {fg:'#2f54eb',bg:'#f0f5ff'},{fg:'#1677ff',bg:'#e6f4ff'},{fg:'#13c2c2',bg:'#e6fffb'},{fg:'#52c41a',bg:'#f6ffed'},{fg:'#d48806',bg:'#fffbeb'},{fg:'#8c8c8c',bg:'#fafafa'},{fg:'#eb2f96',bg:'#fff0f6'},{fg:'#722ed1',bg:'#f9f0ff'},{fg:'#fa541c',bg:'#fff2e8'},{fg:'#fa8c16',bg:'#fff7e6'} ];
function openAddRank(){
  $('arKeyInp').value=''; $('arRoleInp').value=''; $('arRateInp').value='40';
  $('arMask').classList.add('show');
  setTimeout(function(){ try{ $('arKeyInp').focus(); }catch(e){} },30);
}
function arModalClose(){ $('arMask').classList.remove('show'); }
function arModalSave(){
  const a=RATES.active;
  const key=($('arKeyInp').value||'').trim().toUpperCase();
  const role=($('arRoleInp').value||'').trim();
  let v=parseFloat($('arRateInp').value);
  if(!/^[A-Za-z][A-Za-z0-9]*$/.test(key)){ toast('职级代号须为字母开头、字母数字组成'); return; }
  if(key in a.rates){ toast('职级代号已存在'); return; }
  if(!role){ toast('请填写定位'); return; }
  if(isNaN(v)||v<0){ toast('费率须为不小于 0 的数字'); return; }
  const _arPal=_RANK_PALETTE[Object.keys(RANK_META).length % _RANK_PALETTE.length];
  RANK_META[key]={role:role,fg:_arPal.fg,bg:_arPal.bg};
  a.rates[key]=v;
  refreshRanks();
  const h=undoPush('新增职级 '+key, function(){ delete RANK_META[key]; delete a.rates[key]; refreshRanks(); renderView(); toast('已回滚新增 '+key); });
  arModalClose(); renderView(); flushPersist();
  undoToast(key+' 职级已新增，全站人员配置/工时卡实时跟随', h);
}
