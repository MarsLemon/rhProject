/* 制造厂家 —— 基础数据独立字典页（R-03 多对多全局字典；原并入「设备与型号」的厂家字典卡抽离为独立页） */
let vQName='';   // 制造厂家名过滤（输入即过滤）
function vVendors(){
  const q=(vQName||'').trim().toLowerCase();
  const list = q? VENDORS.filter(v=>v.toLowerCase().includes(q)) : VENDORS;
  return '<div class="card">'
   +'<div class="secline" style="margin-bottom:12px;display:flex;align-items:center;gap:12px;justify-content:space-between">'
   +'<span class="fgroup"><span class="fl">制造厂家</span>'
   +'<span class="qwrap"><input class="txt" id="vQInp" placeholder="请输入" value="'+esc(vQName)+'" style="width:200px" oninput="vQLive(this)"><button type="button" class="qclear" role="button" aria-label="清除" title="清除" onclick="qClearClick(this)">×</button></span></span>'
   +'<button class="btn pri" type="button" onclick="openVAdd()">＋ 新增厂家</button>'
   +'</div>'
   +'<div class="t-wrap"><table class="t"><tr><th>制造厂家</th><th class="num">关联型号数</th><th>操作</th></tr>'
   + (list.length? pgSlice(list, 'vendors').map(v=>{
      const n=MODELS.filter(m=>m.vendors.includes(v)||m.dv===v).length;
      return '<tr><td>'+esc(v)+'</td><td class="num">'+n+'</td>'
       +'<td><button class="btn sm" type="button" data-v="'+esc(v)+'" onclick="openVEdit(this.dataset.v)">编辑</button> '
       +'<button class="btn sm danger" type="button" data-v="'+v+'" onclick="delVendorDict(this.dataset.v)">删除</button></td></tr>';
    }).join('') : '<tr><td colspan="3" class="empty-tip">没有匹配'+(q?'「'+esc(vQName)+'」':'')+'的厂家</td></tr>')
   +'</table></div>'
   + pagerHtml(list.length, 'vendors')
   +'</div>';
}
function vQLive(inp){ pgReset('vendors'); liveFilter(inp, function(v){ vQName=v; }); }
function bindVendors(){
  const n=$('vnNameInp');
  if(n) n.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); vnModalSave(); } });
}
/* —— 新增厂家模态窗 —— */
function openVAdd(){
  $('vnNameInp').value='';
  $('vnMask').classList.add('show');
  setTimeout(function(){ try{ $('vnNameInp').focus(); }catch(e){} },30);
}
function vnModalClose(){ $('vnMask').classList.remove('show'); }
function vnModalSave(){
  const v=$('vnNameInp').value.trim();
  if(!v){ toast('请填写厂家名'); $('vnNameInp').focus(); return; }
  if(VENDORS.includes(v)){ toast('厂家已存在'); $('vnNameInp').focus(); return; }
  VENDORS.push(v);
  vnModalClose(); renderView(); toast('厂家已新增');
  flashNewRow(v);
}
function delVendorDict(v){
  const n=MODELS.filter(m=>m.vendors.includes(v)||m.dv===v).length;
  if(n){ toast('厂家「'+v+'」已被 '+n+' 个型号关联，请先在「设备与型号」的「制造厂家」中解除关联后再删除'); return; }
  const vi=VENDORS.indexOf(v);
  askDel({title:'删除厂家「'+v+'」？',
    msg:'将从厂家字典中删除 <b>'+esc(v)+'</b>。当前无型号关联该厂家，删除后新增 / 编辑型号时不可再选它。',
    label:'厂家 '+v,
    run:function(){ VENDORS.splice(vi,1); },
    undo:function(){ VENDORS.splice(vi,0,v); }});
}
/* —— 厂家改名模态窗：改名级联同步型号关联，可撤销 —— */
let _vd=null;   // 编辑中的原厂家名
function openVEdit(v){
  if(VENDORS.indexOf(v)<0) return;
  _vd=v;
  $('vdNameInp').value=v;
  $('vdMask').classList.add('show');
  setTimeout(function(){ try{ $('vdNameInp').focus(); $('vdNameInp').select(); }catch(e){} },30);
}
function vModalClose(){ _vd=null; $('vdMask').classList.remove('show'); }
function vModalSave(){
  const old=_vd; if(old==null) return;
  const name=($('vdNameInp').value||'').trim();
  if(!name){ toast('请填写厂家名'); $('vdNameInp').focus(); return; }
  if(name===old){ vModalClose(); toast('无改动'); return; }
  if(VENDORS.indexOf(name)>=0){ toast('厂家「'+name+'」已存在'); $('vdNameInp').focus(); return; }
  /* 厂家名是型号 vendors/dv 的引用键，改名需级联同步，否则型号关联失配 */
  const aff=[];
  MODELS.forEach(function(m){
    let ch=false;
    if(m.dv===old){ m.dv=name; ch=true; }
    const vi=(m.vendors||[]).indexOf(old);
    if(vi>=0){ m.vendors.splice(vi,1,name); ch=true; }
    if(ch && aff.indexOf(m)<0) aff.push(m);
  });
  const vi=VENDORS.indexOf(old);
  if(vi>=0) VENDORS[vi]=name;
  const n=aff.length;
  const h=undoPush('厂家更名 '+old+' → '+name, function(){
    aff.forEach(function(m){
      if(m.dv===name) m.dv=old;
      const i2=(m.vendors||[]).indexOf(name);
      if(i2>=0) m.vendors.splice(i2,1,old);
    });
    const i3=VENDORS.indexOf(name);
    if(i3>=0) VENDORS[i3]=old;
  });
  vModalClose(); renderView();
  undoToast('厂家已更名：'+old+' → '+name+'（'+n+' 个型号关联已同步）', h);
}
