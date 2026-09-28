/* 设备分类树 —— 由全模块版拆分生成 */
/* ============================================================
   视图：设备分类树（R-01：仅导航，叶子=设备）
   ============================================================ */
let catSel = null;   // 默认不选中：点击树节点后才展示节点维护表单
let catFilter = '';
const catCollapsed = {};   // 折叠的分类节点编码集合（仅 UI 状态）
/* ============================================================
   新增节点模态（复用通用 .cfmask 弹窗；Enter 提交 / Esc 关闭由 core.js 统一处理）
   统一两个入口：新建一级分类（父级=根）与新增子节点（父级=选中/hover 的分类节点）
   ============================================================ */
let catAddCtx = { parent: null };   // 提交上下文：父节点编码，null=一级分类
function catOpenAddModal(parentCode){
  catAddCtx = { parent: parentCode || null };
  const p = catAddCtx.parent ? catFind(catAddCtx.parent) : null;
  if(catAddCtx.parent && !p){ toast('父级节点不存在'); return; }
  if(p && p.equip){ toast('设备叶子下不能再挂节点'); return; }
  const isTop = !p;
  $('catAddTitle').textContent = isTop ? '新建一级分类' : '新增子节点';
  $('catAddBody').innerHTML =
    '<div class="form">'
   +(isTop ? '' : '<div class="form-item"><label>父级</label><div class="form-static">'+esc(devicePath(catAddCtx.parent))+'</div></div>')
   +(isTop ? '' : '<div class="form-item"><label>类型</label><select class="select" id="catNewType">'
      +'<option value="cat">▸ 分类节点</option><option value="dev">▣ 设备</option></select></div>')
   +'<div class="form-item"><label><em class="form-req">*</em>中文名</label><input class="txt" id="catTopName" placeholder="请输入"></div>'
   +'<div class="form-item"><label>英文名</label><input class="txt" id="catTopEn" placeholder="请输入（选填）"></div>'
   +'</div>';
  $('catAddMask').classList.add('show');
  setTimeout(function(){ try{ const el=$('catTopName'); if(el) el.focus(); }catch(e){} },30);
}
function catAddClose(){ $('catAddMask').classList.remove('show'); }
function catAddSubmit(){
  const nEl=$('catTopName'), eEl=$('catTopEn'), tEl=$('catNewType');
  const name=(nEl?nEl.value:'').trim(), en=(eEl?eEl.value:'').trim();
  const isDev = tEl ? (tEl.value==='dev') : false;   // 仅子节点模式有类型选择；一级必为分类
  if(!name){ toast('请填写中文名'); if(nEl) nEl.focus(); return; }
  if(!catAddCtx.parent){
    const code=catNextTopCode();
    if(catFind(code)){ toast('分类编码已存在（唯一约束）'); return; }
    CATALOG.push({code:code, name:name, en:en, off:false, mts:[], children:[]});
    catSel=code; catAddClose(); renderView(); toast('一级分类已创建');
    return;
  }
  const p=catFind(catAddCtx.parent);
  if(!p){ toast('父级节点不存在'); catAddClose(); return; }
  const code=p.code + '.' + String(p.children.length+1).padStart(3,'0');   // 与种子数据一致：叶子编码 3 位
  if(catFind(code)){ toast('分类编码已存在（唯一约束）'); return; }
  p.children.push({code:code, name:name, en:en, off:false, children:[], equip:isDev, empty:isDev, mts:isDev?[]:undefined});
  catSel=code; catAddClose(); renderView(); toast((isDev?'设备':'分类')+'节点已创建');
}
/* 一级分类编码：沿用现有位数规则（顶层为一位数字），取现有最大值 +1 并保证唯一 */
function catNextTopCode(){
  let max = 0;
  CATALOG.forEach(function(n){ const m=/^(\d+)$/.exec(n.code||''); if(m) max = Math.max(max, parseInt(m[1],10)); });
  let code = String(max + 1);
  while(catFind(code)) code = String(parseInt(code,10) + 1);
  return code;
}
function catToggleNode(ev, code){
  ev.stopPropagation();   // 不触发行选中
  catCollapsed[code] = !catCollapsed[code];
  catSearchRender();
}
function catModelCount(code){
  return MODELS.filter(function(m){ return m.dev===code; }).length;
}
function catVisible(n){
  if(!catFilter) return true;
  const q=catFilter.toLowerCase();
  if((n.name||'').toLowerCase().includes(q)||(n.code||'').toLowerCase().includes(q)||(n.en||'').toLowerCase().includes(q)) return true;
  return (n.children||[]).some(c=>catVisible(c));
}
function catTreeHtml(){
  /* 搜索命中高亮：截取命中片段包 <mark>（输入即过滤时一眼定位） */
  function catHl(s){
    const q=(catFilter||'').trim();
    if(!q) return esc(s);
    const str=String(s), idx=str.toLowerCase().indexOf(q.toLowerCase());
    if(idx<0) return esc(str);
    return esc(str.slice(0,idx))+'<mark>'+esc(str.slice(idx,idx+q.length))+'</mark>'+esc(str.slice(idx+q.length));
  }
  function row(n, depth){
    if(!catVisible(n)) return '';
    const sel = n.code===catSel;
    const isDev = !!n.equip;
    const hasKids = (n.children||[]).length>0;
    const collapsed = !!catCollapsed[n.code] && !catFilter;   // 搜索时忽略折叠，保证结果可见
    const caret = hasKids
      ?'<span class="tree-caret'+(isDev?'':' c-cat')+'" title="'+(collapsed?'展开':'折叠')+'" onclick="catToggleNode(event,\''+n.code+'\')">'+(collapsed?'▸':'▾')+'</span>'
      :'<span class="tree-caret leaf">'+(isDev?'▣':'·')+'</span>';
    /* 树上不展示数字引用：节点类型由 ▣ / ▾ 前缀区分；设备叶子不亮型号数徽章（型号配置在右侧编辑面板维护） */
    const tip = esc(isDev?'设备叶子':'分类节点');
    /* 分类节点行尾不展示「＋」就地加子级按钮（新增统一走卡片头 / 搜索栏按钮） */
    const tail = '';
    return '<div class="tree-row'+(sel?' sel':'')+'" style="padding-left:'+(depth*18+10)+'px" title="'+tip+'" onclick="catSel=\''+n.code+'\';renderView()">'
      +caret
      +'<div class="tx"><b style="font-size:13px">'+catHl(n.en||n.name)+'</b>'
      +(n.off?' <span class="sub">· 停用</span>':'')
      +((n.en||'')?'<div class="sub" style="font-size:11px">'+catHl(n.name)+'</div>':'')+'</div>'
      +tail+'</div>'
      +(collapsed ? '' : n.children.map(c=>row(c, depth+1)).join(''));
  }
  return CATALOG.map(n=>row(n,0)).join('');
}
function catTreeBoxHtml(){
  const html=catTreeHtml();
  return html || '<div class="empty-tip" style="padding:14px">未找到匹配「'+esc(catFilter)+'」的节点</div>';
}
function catSearchRender(){ const b=$('catTreeBox'); if(b) b.innerHTML=catTreeBoxHtml(); }
function vCategory(){
  const n=catSel?catFind(catSel):null;
  if(catSel && !n){ catSel=null; }   // 选中节点已被删除
  const treeCard = '<div class="card">'
   +'<div class="cat-search" style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'
   +'<input class="txt" id="catSearch" style="flex:1;min-width:0" placeholder="请输入" value="'+esc(catFilter)+'" oninput="catFilter=this.value;catSearchRender()">'
   +'<button class="btn sm pri" type="button" onclick="catOpenAddModal()">新增</button>'
   +'</div>'
   +'<div class="tree" id="catTreeBox">'+catTreeBoxHtml()+'</div></div>';
  if(!n){
    return '<div class="grid2 cat-grid">'+treeCard
     +'<div class="card" style="display:flex;align-items:center;justify-content:center;min-height:300px">'
     +'<div style="text-align:center;padding:30px">'
     +'<div style="font-size:34px;margin-bottom:10px;opacity:.35">⌗</div>'
     +'</div></div></div>';
  }
  const isDevLeaf = !!n.equip;
  /* 设备叶子：直接亮配置健康度并给出口（空设备/未挂类型是最常见的"没配完"状态） */
  const devChips = isDevLeaf
    ? (function(){
        const kN=(n.mts||[]).length;
        return '<div class="secline" style="margin-bottom:12px">'
         +(kN ? '' : ' <a class="btn sm" href="mtype.html">去挂载类型</a>')
         +'</div>';
      })()
    : '';
  /* 面板只做"编辑选中节点"一件事；新增子节点统一走弹窗（树上 hover ＋ / 卡片头按钮同源） */
  return '<div class="grid2 cat-grid">'+treeCard
   +'<div class="card"><h2>编辑节点'
   +(!isDevLeaf ? '<span class="cardact"><button class="btn pri sm" type="button" onclick="catOpenAddModal(\''+catSel+'\')">新增子节点</button></span>' : '')
   +'</h2>'
   +'<div class="crumb-line">'+devicePath(catSel).split(' / ').map(function(p,i,a){ return i===a.length-1?'<b>'+esc(p)+'</b>':'<span class="sub">'+esc(p)+'</span> › '; }).join('')+'</div>'
   +devChips
   +'<div class="form">'
     +'<div class="sec"><b>基本信息</b></div>'
     +'<div class="form-item"><label>名称</label><input class="txt" id="catName" value="'+esc(n.name)+'"></div>'
     +'<div class="form-item"><label>英文名</label><input class="txt" id="catEn" value="'+esc(n.en||'')+'" placeholder="请输入（选填）"></div>'
     +'<div class="form-item"><label>状态</label><div class="form-static">'+(n.off?'<span class="tag warn">已停用</span>':'<span class="tag on">启用中</span>')+'</div></div>'
   +'</div>'
   /* 状态操作独立分区：可逆的停用与不可逆的删除不混在编辑表单里 */
   +'<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:18px;padding-top:12px;border-top:1px dashed var(--line)">'
   +'<button class="btn pri sm" type="button" onclick="catRename()">保存</button>'
   +'<button class="btn sm" onclick="catToggle()">'+(n.off?'启用':'停用')+'</button>'
   +'<button class="btn sm danger" onclick="catDelete()">删除</button>'
   +'</div>'
   +'</div></div>';
}
function bindCategory(){
  const n=catFind(catSel); if(!n) return;
  const name=$('catName'), en=$('catEn');
  if(name) name.addEventListener('change',()=>catRename());
  if(en) en.addEventListener('change',()=>catRename());
}
function catRename(){
  const n=catFind(catSel);
  const name=$('catName').value.trim(), en=$('catEn').value.trim();
  if(!name){ toast('名称不能为空'); $('catName').value=n.name; return; }
  if(n.name!==name || (n.en||'')!==en){
    n.name=name; n.en=en;
    renderView();                          // 同步刷新左侧树
    flashSave('#catName'); flashSave('#catEn');   // 行内编辑即存：绿色闪示确认
  }
  /* 无变化不重绘：避免每次失焦都闪一下 */
}
function catToggle(){
  const n=catFind(catSel);
  const willOff=!n.off;
  const doIt=function(){
    n.off=willOff;
    renderView(); toast(n.off?'已停用':'已启用');
  };
  if(willOff) confirmBox({title:'停用「'+n.name+'」？',
    msg:'停用后前台分类导航将隐藏该节点（及其下级），存量询价单不受影响；可随时重新启用。',
    okText:'确认停用', danger:false, onOk:doIt});
  else doIt();
}
function catDelete(){
  const n=catFind(catSel);
  const parent=catParentOf(n.code);
  /* 注意：catParentOf 对根节点返回的是伪根对象（非 null），故一级分类按「直接挂在 CATALOG 上」判定 */
  const isTop = CATALOG.some(function(c){ return c.code===n.code; });
  if(n.children.length){ toast('存在子节点，先删除/迁移子节点'); return; }
  const mN=catModelCount(n.code);
  if(mN>0){ toast('该设备叶子下有 '+mN+' 个型号，不可删除'); return; }
  const idx=(isTop?CATALOG:parent.children).indexOf(n);
  askDel({title:'删除节点「'+n.name+'」？',
    msg:'将删除'+(isTop?'一级分类':'节点')+' <b>'+esc(n.name)+'</b>。该节点为空，不影响已配置的型号与价格；删除后前台分类导航不再出现该节点。',
    label:'节点 '+n.name,
    run:function(){
      const kept=(isTop?CATALOG:parent.children).filter(c=>c.code!==n.code);
      if(isTop){ CATALOG.splice(0, CATALOG.length, ...kept); }   // 一级分类从根节点数组中移除
      else { parent.children=kept; }
      catSel = isTop ? null : parent.code;
    },
    undo:function(){ (isTop?CATALOG:parent.children).splice(idx,0,n); }});
}
