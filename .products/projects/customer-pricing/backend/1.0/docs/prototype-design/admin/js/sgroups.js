/* 服务项分组 —— 基础数据独立字典页（D2 服务项固有分类全局字典；原并入「服务项」的项目分组字典卡抽离为独立页） */
let sgQName = '';   // 服务项分组名过滤（输入即过滤）
function vSgroups() {
  const q = (sgQName || '').trim().toLowerCase();
  const list = q ? SGROUPS.filter(g => g.toLowerCase().includes(q)) : SGROUPS;
  return '<div class="card">'
    + '<div class="secline" style="margin-bottom:12px;display:flex;align-items:center;gap:12px;justify-content:space-between">'
    + '<span class="fgroup"><span class="fl">服务项分组</span>'
    + '<span class="qwrap"><input class="txt" id="sgQInp" placeholder="请输入" value="' + esc(sgQName) + '" style="width:200px" oninput="sgQLive(this)"><button type="button" class="qclear" role="button" aria-label="清除" title="清除" onclick="qClearClick(this)">×</button></span></span>'
    + '<button class="btn pri" type="button" onclick="openSgAdd()">＋ 新增分组</button>'
    + '</div>'
    + '<div class="t-wrap"><table class="t"><tr><th>服务项分组</th><th class="num">服务项数</th><th>操作</th></tr>'
    + (list.length ? pgSlice(list, 'sgroups').map(function (g) {
      const n = SERVICE_ITEMS.filter(function (r) { return r.grp === g; }).length;
      return '<tr><td>' + esc(g) + '</td><td class="num">' + n + '</td>'
        + '<td><button class="btn sm" type="button" data-g="' + esc(g) + '" onclick="openSgEdit(this.dataset.g)">编辑</button> '
        + '<button class="btn sm danger" type="button" data-g="' + g + '" onclick="delSGroup(this.dataset.g)">删除</button></td></tr>';
    }).join('') : '<tr><td colspan="3" class="empty-tip">没有匹配' + (q ? '「' + esc(sgQName) + '」' : '') + '的分组</td></tr>')
    + '</table></div>'
    + pagerHtml(list.length, 'sgroups')
    + '</div>';
}
function sgQLive(inp) { pgReset('sgroups'); liveFilter(inp, function (v) { sgQName = v; }); }
function bindSgroups() {
  const n = $('sgnNameInp');
  if (n) n.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sgnModalSave(); } });
}
/* —— 新增服务项分组模态窗 —— */
function openSgAdd() {
  $('sgnNameInp').value = '';
  $('sgnMask').classList.add('show');
  setTimeout(function () { try { $('sgnNameInp').focus(); } catch (e) { } }, 30);
}
function sgnModalClose() { $('sgnMask').classList.remove('show'); }
function sgnModalSave() {
  const v = $('sgnNameInp').value.trim();
  if (!v) { toast('请填写分组名'); $('sgnNameInp').focus(); return; }
  if (SGROUPS.includes(v)) { toast('分组已存在'); $('sgnNameInp').focus(); return; }
  SGROUPS.push(v);
  sgnModalClose(); renderView(); toast('分组已新增');
  flashNewRow(v);
}
function delSGroup(g) {
  const used = SERVICE_ITEMS.some(x => x.grp === g);
  if (used) { toast('仍有服务项归属「' + g + '」，不可删除'); return; }
  const gi = SGROUPS.indexOf(g);
  askDel({
    title: '删除空分组「' + g + '」？',
    msg: '将从服务项分组字典中删除 <b>' + esc(g) + '</b>。当前无服务项归属该分组，删除后新增服务项不可再选它。',
    label: '分组 ' + g,
    run: function () { SGROUPS.splice(gi, 1); },
    undo: function () { SGROUPS.splice(gi, 0, g); }
  });
}
/* —— 分组改名模态窗：改名级联同步服务项归属，可撤销 —— */
let _sg = null;   // 编辑中的原分组名
function openSgEdit(g) {
  if (SGROUPS.indexOf(g) < 0) return;
  _sg = g;
  $('sgNameInp').value = g;
  $('sgMask').classList.add('show');
  setTimeout(function () { try { $('sgNameInp').focus(); $('sgNameInp').select(); } catch (e) { } }, 30);
}
function sgModalClose() { _sg = null; $('sgMask').classList.remove('show'); }
function sgModalSave() {
  const old = _sg; if (old == null) return;
  const name = ($('sgNameInp').value || '').trim();
  if (!name) { toast('请填写分组名'); $('sgNameInp').focus(); return; }
  if (name === old) { sgModalClose(); toast('无改动'); return; }
  if (SGROUPS.indexOf(name) >= 0) { toast('分组「' + name + '」已存在'); $('sgNameInp').focus(); return; }
  /* 分组名是服务项 grp 的引用键，改名需级联同步，否则服务项归属失配 */
  let n = 0;
  SERVICE_ITEMS.forEach(function (r) { if (r.grp === old) { r.grp = name; n++; } });
  const gi = SGROUPS.indexOf(old);
  if (gi >= 0) SGROUPS[gi] = name;
  const h = undoPush('分组更名 ' + old + ' → ' + name, function () {
    SERVICE_ITEMS.forEach(function (r) { if (r.grp === name) { r.grp = old; } });
    const i2 = SGROUPS.indexOf(name);
    if (i2 >= 0) SGROUPS[i2] = old;
  });
  sgModalClose(); renderView();
  undoToast('分组已更名：' + old + ' → ' + name + '（' + n + ' 个服务项归属已同步）', h);
}
