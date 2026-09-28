/* ============================================================
   components.js —— 「组件规范」页：Ant Design 组件对照 + 设计令牌演示
   本页是全站 UI 的活体规范：每个演示块标注对应的 antd 组件名与令牌，
   所有示例均复用全站真实组件类（.btn/.t/.tag/.zone/.sw/…），改样式即全站生效。
   ============================================================ */

/* ---- 色板 swatch ---- */
function _swatch(name, v, dark){
  return '<div style="flex:1;min-width:104px"><div style="height:44px;border-radius:8px 8px 0 0;background:'+v+(dark?'':'')+';border:1px solid rgba(0,0,0,.06);border-bottom:none"></div>'
    +'<div style="border:1px solid rgba(0,0,0,.06);border-top:none;border-radius:0 0 8px 8px;padding:6px 10px;background:#fff"><b style="font-size:12.5px">'+name+'</b><div style="font-size:11.5px;color:var(--text-3);font-family:ui-monospace,Consolas,monospace">'+v+'</div></div></div>';
}

function vComponents(){
  let h='';

  /* ================= 0. 定位说明 ================= */
  h+='<div class="alert info"><span class="a-ico"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#1677ff"/><path d="M12 10.8v6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="7.4" r="1.3" fill="#fff"/></svg></span>'
    +'<span class="a-txt">本页对应 <b>ant.design/design.md</b> 设计价值观（自然 / 确定性 / 意义感 / 生长性）在本 demo 的落地：全站 UI 按 <b>antd v6 默认 Algorithm 派生令牌</b>实现（assets/style.css），每个业务页面使用的组件见页尾「组件对照总表」。</span></div>';

  /* ================= 1. 设计令牌 ================= */
  h+='<div class="card"><h2>设计令牌 Design Tokens <span class="sub">antd v6 seed token → derived token（style.css :root）</span></h2>'
    +'<div class="sec"><b>主色与语义色 Color</b>'
    +'<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">'
    +_swatch('Primary','#1677ff')+_swatch('Primary Hover','#4096ff')+_swatch('Primary Active','#0958d9')
    +_swatch('Success','#52c41a')+_swatch('Warning','#faad14')+_swatch('Error','#ff4d4f')
    +'</div></div>'
    +'<div class="sec"><b>中性色板 Neutral</b>'
    +'<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">'
    +_swatch('Text .88','rgba(0,0,0,.88)')+_swatch('Text-2 .65','rgba(0,0,0,.65)')+_swatch('Text-3 .45','rgba(0,0,0,.45)')+_swatch('Text-4 .25','rgba(0,0,0,.25)')
    +_swatch('Border','#d9d9d9')+_swatch('Split','#f0f0f0')+_swatch('Bg Layout','#f5f5f5')+_swatch('Bg Spot','#fafafa')
    +'</div></div>'
    +'<div class="secline" style="gap:24px;flex-wrap:wrap"><span class="fl">圆角：</span>'
    +'<span class="formula">borderRadius 6（控件）</span><span class="formula">borderRadiusLG 8（卡片/弹窗）</span>'
    +'<span class="fl" style="margin-left:12px">控件高度：</span><span class="formula">controlHeight 32 / SM 24</span>'
    +'<span class="fl" style="margin-left:12px">字体：</span><span class="formula">system-ui 栈 · 14px / 1.5715</span></div>'
    +'</div>';

  /* ================= 2. Button ================= */
  h+='<div class="card"><h2>Button 按钮 <span class="sub">.btn（primary / default / danger / link / small / disabled）</span></h2>'
    +'<div class="secline"><button class="btn pri" onclick="demoToast(\'success\')">主要按钮</button>'
    +'<button class="btn" onclick="demoToast(\'info\')">默认按钮</button>'
    +'<button class="btn danger" onclick="demoToast(\'warning\')">危险描边</button>'
    +'<button class="btn dgr" onclick="demoToast(\'warning\')">危险实心</button>'
    +'<button class="btn link" onclick="demoToast(\'info\')">链接按钮</button>'
    +'<button class="btn" disabled>禁用</button>'
    +'<button class="btn pri sm">小按钮 SM</button>'
    +'<button class="btn sm danger">小危险</button></div>'
    +'<div class="sub" style="margin-top:10px">悬停 primary→#4096FF / active→#0958D9；危险实心仅用于确认框主按钮（antd primary danger），表格行内删除用描边 danger。</div>'
    +'</div>';

  /* ================= 3. Tag / Badge ================= */
  h+='<div class="card"><h2>Tag 标签 · Badge 徽标 <span class="sub">.tag（预设色）· .nbadge（菜单计数）</span></h2>'
    +'<div class="secline">'
    +'<span class="tag info">处理中 processing</span><span class="tag ok">成功 success</span>'
    +'<span class="tag warn">警告 warning</span><span class="tag bad">错误 error</span>'
    +'<span class="tag gray">默认 default</span><span class="tag draft">草稿 gold</span></div>'
    +'<div class="secline"><span class="fl">Badge：</span>'
    +'<span class="nav-it" style="width:auto;height:32px;padding:0 14px;display:inline-flex;pointer-events:none"><span>待处理</span><span class="nbadge">3</span></span>'
    +'<span class="nav-it" style="width:auto;height:32px;padding:0 14px;display:inline-flex;pointer-events:none"><span>工时标准</span><span class="nbadge gray">33</span></span></div>'
    +'</div>';

  /* ================= 4. 数据录入 ================= */
  h+='<div class="card"><h2>数据录入 <span class="sub">Input / TextArea / Select / TreeSelect / DatePicker / InputNumber / Radio / Checkbox / Switch</span></h2>'
    +'<div class="grid2">'
    +'<div><div class="form-item"><label>Input 输入框（hover #4096FF · focus #1677FF + 光圈）</label><input class="txt" placeholder="请输入"></div>'
    +'<div class="form-item"><label>TextArea 文本域</label><textarea placeholder="备注说明（最多 200 字）"></textarea></div>'
    +'<div class="form-item"><label>Select 选择器（assets/sel.js · 服务信息同款，清除 / 键盘巡航 / 空态）</label>'
    +'<select id="demoSel" style="max-width:100%"><option value="">请选择维保类型</option><option>液压和电控系统保养</option><option>健康检查</option><option>监工服务</option></select></div>'
    +'<div class="form-item"><label>TreeSelect 树选择（全站复用 TS 组件）</label><div>'+TS.html('demoTs')+'</div></div>'
    +'<div class="form-item" style="margin-bottom:0"><label>DatePicker 日期选择（assets/dp.js · 服务时间同款，含清除 / 今天 / 下限置灰）</label>'
    +'<input class="txt" id="demoDp" style="max-width:220px" placeholder="请选择日期"></div></div>'
    +'<div><div class="form-item"><label>InputNumber 步进器（.stepper）</label>'
    +'<span class="stepper"><button type="button" aria-label="减少" onclick="demoStep(this,-1)">−</button><span class="v" id="demoStepV">6</span><button type="button" aria-label="增加" onclick="demoStep(this,1)">＋</button></span>'
    +'<span class="sub" style="margin-left:8px">缸数限 1–20（R-05 越界修正 + toast 提示）</span></div>'
    +'<div class="form-item"><label>Radio.Group 单选组</label><div class="radio-row">'
    +'<label><input type="radio" name="dRadio" checked>按缸数</label><label><input type="radio" name="dRadio">整台</label><label><input type="radio" name="dRadio">按件数</label></div></div>'
    +'<div class="form-item"><label>Checkbox 多选</label><label style="display:inline-flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" style="accent-color:var(--p)" checked>设为推荐</label></div>'
    +'<div class="form-item"><label>Switch 开关</label><label class="sw"><input type="checkbox" checked><i></i><span class="sub">在客户视图中展示</span></label></div>'
    +'<div class="form-item" style="margin-bottom:0"><label>状态反馈（行内编辑 = 失焦即存）</label>'
    +'<input class="txt" style="max-width:220px" value="Accumulator overhaul" oninput="flashSave(this)"><div class="sub" style="margin-top:6px">编辑后出现绿色闪示 = 已自动保存（flashSave）</div></div></div>'
    +'</div>';

  /* ================= 5. Table ================= */
  h+='<div class="card"><h2>Table 表格 <span class="sub">.t / .t-wrap（thead #FAFAFA · 行 hover · radius 8 · 操作列）</span></h2>'
    +'<div class="t-wrap"><table class="t">'
    +'<tr><th>服务项</th><th>维保类型</th><th>单位</th><th class="num">基准工时</th><th>状态</th><th>操作</th></tr>'
    +'<tr><td>Accumulator overhaul</td><td><span class="tag info">液压和电控</span></td><td>EA</td><td class="num">3h</td><td><span class="tag ok">已配置</span></td>'
    +'<td><button class="btn link sm" onclick="demoToast(\'info\')">查看工时标准</button><button class="btn sm danger" onclick="demoAskDel()">删除</button></td></tr>'
    +'<tr class="hl-row"><td>FIVA valve overhaul (on board)</td><td><span class="tag info">液压和电控</span></td><td>EA</td><td class="num">6h</td><td><span class="tag warn">缺口</span></td>'
    +'<td><button class="btn link sm" onclick="demoToast(\'info\')">去配工时</button></td></tr>'
    +'<tr><td>UPS, power supply A+B check</td><td><span class="tag info">液压和电控</span></td><td>set</td><td class="num">2h</td><td><span class="tag ok">已配置</span></td>'
    +'<td><button class="btn link sm" onclick="demoToast(\'info\')">查看工时标准</button></td></tr>'
    +'</table></div><div class="sub" style="margin-top:10px">行 class="hl-row" = 当前行高亮（左蓝条 + primaryBgHover 底），行内编辑时由 JS 标注。</div></div>';

  /* ================= 6. Segmented / Pagination ================= */
  h+='<div class="card"><h2>Segmented 分段控制 · Pagination 分页 <span class="sub">.seg / .pager</span></h2>'
    +'<div class="secline"><div class="seg" id="demoSeg">'
    +'<button class="seg-it on" onclick="demoSeg(this)">按缸数</button><button class="seg-it" onclick="demoSeg(this)">整台</button><button class="seg-it" onclick="demoSeg(this)">按件数</button></div>'
    +'<span class="sub">工时标准 / 方案预览的「计价口径」切换用此组件</span></div>'
    +'<div class="pager" style="justify-content:flex-start;margin-top:14px">'
    +'<button class="pg" disabled>‹</button><button class="pg on" onclick="demoPager(this)">1</button>'
    +'<button class="pg" onclick="demoPager(this)">2</button><button class="pg" onclick="demoPager(this)">3</button>'
    +'<button class="pg" onclick="demoPager(this)">›</button><span style="font-size:13px">共 33 条</span></div>'
    +'</div>';

  /* ================= 7. Steps / Statistic / Descriptions ================= */
  h+='<div class="card"><h2>Steps · Statistic · Descriptions <span class="sub">.steps / .stat / .desc（方案预览页同款）</span></h2>'
    +'<div class="steps" style="margin-bottom:18px">'
    +'<div class="step-it finish"><span class="step-no"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span><span class="step-tt">基础数据</span></div>'
    +'<div class="step-it finish"><span class="step-no"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span><span class="step-tt">目录定价</span></div>'
    +'<div class="step-it process"><span class="step-no">3</span><span class="step-tt">套餐与展示</span></div>'
    +'<div class="step-it"><span class="step-no">4</span><span class="step-tt">方案预览验证</span></div></div>'
    +'<div class="grid2"><div><div class="stats-row">'
    +'<div class="stat"><div class="stat-l">服务项总数</div><div class="stat-v">33</div></div>'
    +'<div class="stat"><div class="stat-l">工时标准</div><div class="stat-v">33<span class="stat-s">条</span></div></div>'
    +'<div class="stat"><div class="stat-l">待补缺口</div><div class="stat-v" style="color:var(--warning-text)">2<span class="stat-s">项</span></div></div></div></div>'
    +'<div class="desc"><span class="desc-l">型号</span><span class="desc-v">6S60MC-C · 6 缸</span>'
    +'<span class="desc-l">计价口径</span><span class="desc-v">每缸 × 缸数</span>'
    +'<span class="desc-l">项保底价</span><span class="desc-v">$1,680（综合费率 210 × 8h · 按一份计）</span></div></div>'
    +'</div>';

  /* ================= 8. Alert / Empty ================= */
  h+='<div class="card"><h2>Alert 提醒 · Empty 空状态 <span class="sub">.alert（语义四色）· .empty-tip</span></h2>'
    +'<div class="alert info"><span class="a-ico">'+MSG_ICO.info+'</span><span class="a-txt">信息提醒：当前上下文共 <b>33</b> 个服务项，其中 31 项已有工时标准。</span></div>'
    +'<div class="alert warn"><span class="a-ico">'+MSG_ICO.warning+'</span><span class="a-txt">警告提醒：2 个服务项两级回溯未命中，客户预览将出现<b>不可计价缺口</b>。</span></div>'
    +'<div class="alert err"><span class="a-ico"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#ff4d4f"/><path d="M12 6.8v6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1.3" fill="#fff"/></svg></span><span class="a-txt">错误提醒：费率卡存在 0 值，计价结果不可用。</span></div>'
    +'<div class="empty-tip">Empty 空状态：暂无数据（表格占位 / TreeSelect notFound 同款）</div>'
    +'</div>';

  /* ================= 9. 反馈：message / Modal / Drawer ================= */
  h+='<div class="card"><h2>反馈 <span class="sub">message（toast）· Modal.confirm · Drawer</span></h2>'
    +'<div class="secline"><button class="btn" onclick="demoToast(\'success\')">message · 成功</button>'
    +'<button class="btn" onclick="demoToast(\'warning\')">message · 警告</button>'
    +'<button class="btn" onclick="demoToast(\'undo\')">message · 撤销（6s）</button>'
    +'<button class="btn" onclick="demoConfirm()">Modal.confirm · 一般确认</button>'
    +'<button class="btn danger" onclick="demoAskDel()">Modal.confirm · 删除确认</button>'
    +'<button class="btn" onclick="demoDrawerOpen()">Drawer 抽屉</button></div>'
    +'<div class="sub" style="margin-top:10px">message 顶部居中白底 + 语义图标；全站键盘协议：Esc 关最上层弹层、Enter 提交（core.js 统一处理）。</div></div>';

  /* ================= 10. 组件对照总表 ================= */
  const MAP=[
    ['全站布局','Layout（Sider + Header）、Menu、Breadcrumb、Badge','所有页面（aside / topbar / nav）'],
    ['设备分类树','Tree、Modal、Form、Input','category'],
    ['设备与型号','Table、Modal、TreeSelect、InputNumber（步进器）、Tag','models'],
    ['制造厂家 / 项目分组','Table、Input（快捷新增）、Modal.confirm、message','vendors / sgroups'],
    ['维保类型与周期','Modal、Form、Radio.Group','mtype'],
    ['服务项','Table、Modal（查看工时标准）、Select、message、Popconfirm','sitems'],
    ['工时标准','Drawer、Form、Table、Segmented（查询切换）、Alert（缺口清单）、Select 多选（MSEL，适用型号）','labor'],
    ['职级费率','Table（聚合编辑）、InputNumber、Popconfirm','rates'],
    ['保底参数（D16）','Form（行内开关 + 数字输入）、Table（人员配置推导示例）','bfee'],
    ['套餐配置','Drawer、Select、Table（过滤计数）、Input','pkg'],
    ['展示规则','Table、Modal、Switch','rule'],
    ['方案预览','Descriptions、Steps、Table、Button（深链跳转）、Statistic','preview'],
    ['组件规范','全部组件的活体演示','components']
  ];
  h+='<div class="card"><h2>组件对照总表 <span class="sub">业务页面 → 可使用的 antd 组件（正式工程直接按此清单引入 antd）</span></h2>'
    +'<div class="t-wrap"><table class="t"><tr><th style="width:170px">模块 / 页面</th><th>建议使用的 antd 组件</th><th style="width:130px">本 demo 页面</th></tr>'
    +MAP.map(r=>'<tr><td><b>'+r[0]+'</b></td><td>'+r[1]+'</td><td><code class="k">'+r[2]+'.html</code></td></tr>').join('')
    +'</table></div>'
    +'<details class="hint"><summary>正式工程落地建议</summary><div class="hint-body">'
    +'① 交互骨架照搬：本 demo 的类名与 DOM 结构已按 antd DOM 约定组织（btn / t / form-item / cfbox…），迁入 React + antd 时按对照表替换即可；'
    +'② 令牌迁移：style.css :root 的变量与 antd v6 token 一一对应，可直接写进 ConfigProvider theme.token；'
    +'③ 保留三条全站交互约定：Esc/Enter 键盘协议、liveFilter 输入即过滤、flashSave/flashNewRow 操作反馈（antd 下用 message + Table rowClassName 实现）。'
    +'</div></details></div>';

  return h;
}

function bindComponents(){
  /* TreeSelect 演示实例：复用全站 TS 组件（含搜索 / 全部 / 可清除） */
  TS.specs.demoTs={value:'601.001', allOption:true, allLabel:'全部设备', clearable:true, clearValue:'all',
    onPick:function(v){ toast(v==='all'?'TreeSelect 已选：全部设备':'TreeSelect 已选：'+devNameOf(v)); }};
  /* DatePicker 演示实例：复用 assets/dp.js（服务时间控件同款；下限 = 今天，演示置灰） */
  const dpEl=document.getElementById('demoDp');
  if(dpEl && window.DP){
    dpEl.min=new Date().getFullYear()+'-'+('0'+(new Date().getMonth()+1)).slice(-2)+'-'+('0'+new Date().getDate()).slice(-2);
    DP(dpEl);
    dpEl.addEventListener('change', function(){ if(this.value) toast('DatePicker 已选：'+this.value); });
  }
  /* Select 演示实例：复用 assets/sel.js（服务信息下拉同款） */
  const selEl=document.getElementById('demoSel');
  if(selEl && window.SEL){
    SEL.mount(selEl);
    selEl.addEventListener('change', function(){ if(this.value) toast('Select 已选：'+this.value); });
  }
}

/* ---- 演示交互 ---- */
function demoToast(type){
  if(type==='undo'){ const h=undoPush('演示撤销对象', function(){ toast('演示：撤销逻辑已执行'); }); undoToast('演示删除成功（6 秒内可撤销）', h); return; }
  toast(type==='warning'?'请先选择维保类型再配置工时（演示警告）':'配置已保存（演示成功）');
}
function demoConfirm(){
  confirmBox({title:'确认执行该操作？', msg:'这是 <b>antd Modal.confirm</b> 一般确认样式：蓝色问号图标 + 主色确认按钮。', okText:'确认', danger:false, onOk:function(){ toast('已确认（演示）'); }});
}
function demoAskDel(){
  askDel({title:'删除服务项「Accumulator overhaul」？',
    msg:'将从服务项台账删除 <b>Accumulator overhaul</b>，其工时标准与覆盖配置一并失效。',
    label:'演示服务项', run:function(){}, undo:function(){}, done:'演示删除成功'});
}
function demoStep(btn,d){
  const v=$('demoStepV'); let n=parseInt(v.textContent,10)+d;
  if(n<1){ n=1; toast('缸数不能小于 1（R-05：1–20）'); }
  if(n>20){ n=20; toast('缸数不能超过 20（R-05：1–20）'); }
  v.textContent=n;
  btn.disabled=(d<0&&n<=1);
}
function demoSeg(el){
  el.parentNode.querySelectorAll('.seg-it').forEach(function(b){ b.classList.remove('on'); });
  el.classList.add('on');
}
function demoPager(el){
  el.parentNode.querySelectorAll('.pg').forEach(function(b){ if(b.textContent!=='‹'&&b.textContent!=='›') b.classList.remove('on'); });
  el.classList.add('on');
}
function demoDrawerOpen(){
  $('drawer').innerHTML='<div class="dhead"><b>Drawer 抽屉</b><button class="cfclose" aria-label="关闭" onclick="demoDrawerClose()">×</button></div>'
    +'<div class="dbody"><div class="alert info"><span class="a-ico">'+MSG_ICO.info+'</span><span class="a-txt">antd Drawer：宽 700px，头部 16/24 内边距，右侧滑出，Esc 可关闭。</span></div>'
    +'<div class="form-item"><label>抽屉内表单（工时标准页同款）</label><input class="txt" placeholder="基准工时（h）"></div>'
    +'<div class="form-item"><label>职级费率</label><select class="select" style="max-width:100%"><option>T4 主修技师 · $68/h</option><option>P5 熟练技工 · $56/h</option></select></div></div>'
    +'<div class="dfoot"><button class="btn" onclick="demoDrawerClose()">取消</button><button class="btn pri" onclick="demoDrawerClose();toast(\'工时标准已保存\')">保存</button></div>';
  $('mask').classList.add('show');
  $('drawer').classList.add('show');
}
function demoDrawerClose(){ closeDrawer(); }
