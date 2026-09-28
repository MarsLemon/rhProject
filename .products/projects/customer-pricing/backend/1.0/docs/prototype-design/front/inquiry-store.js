/* ============================================================
   inquiry-store.js —— 前台询价提交 → 后台「客户定价单」共享存储
   ------------------------------------------------------------
   与后台管理（assets/data.js）同库同 store（pc_mgmt / state）但分键：
     · 配置快照  key = pc_mgmt_state_v1      （后台维护，data.js 读写）
     · 询价提交  key = pc_mgmt_inquiries_v1  （本脚本读写，只追加）
   分键避免前台提交与后台配置编辑互相覆盖整包快照。
   IndexedDB 不可用（隐私模式等）时降级 localStorage 同键。
   提交成功后经 BroadcastChannel('pc_mgmt_sync') 广播 inquiry-added，
   后台询价页收到后静默刷新列表（与既有 data-updated 横幅机制互不影响）。
   ============================================================ */
var INQ_STORE_KEY = 'pc_mgmt_inquiries_v1';
var INQ_IDB_NAME = 'pc_mgmt';
var INQ_IDB_STORE = 'state';
var INQ_IDB_VER = 2;   // 与 admin/assets/data.js 保持一致，否则互相打不开对方的库

function inqIdbOpen() {
  return new Promise(function (resolve, reject) {
    if (typeof indexedDB === 'undefined' || !indexedDB) { reject(new Error('indexedDB unavailable')); return; }
    var req;
    try { req = indexedDB.open(INQ_IDB_NAME, INQ_IDB_VER); } catch (e) { reject(e); return; }
    req.onupgradeneeded = function () {
      if (!req.result.objectStoreNames.contains(INQ_IDB_STORE)) req.result.createObjectStore(INQ_IDB_STORE);
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error || new Error('idb open failed')); };
    req.onblocked = function () { reject(new Error('idb blocked')); };
  });
}
/* 版本落后（后台将来升库）时按当前版本重开一次，只读写不建表 */
function inqIdbConn() {
  return inqIdbOpen().catch(function () { return inqIdbOpenVerless(); });
}
function inqIdbOpenVerless() {
  return new Promise(function (resolve, reject) {
    var req;
    try { req = indexedDB.open(INQ_IDB_NAME); } catch (e) { reject(e); return; }
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error || new Error('idb open failed')); };
  });
}
function inqIdbGet(db) {
  return new Promise(function (resolve, reject) {
    var r = db.transaction(INQ_IDB_STORE, 'readonly').objectStore(INQ_IDB_STORE).get(INQ_STORE_KEY);
    r.onsuccess = function () { resolve(r.result || null); };
    r.onerror = function () { reject(r.error); };
  });
}
function inqIdbSet(db, val) {
  return new Promise(function (resolve, reject) {
    var tx = db.transaction(INQ_IDB_STORE, 'readwrite');
    tx.objectStore(INQ_IDB_STORE).put(val, INQ_STORE_KEY);
    tx.oncomplete = function () { resolve(true); };
    tx.onerror = function () { reject(tx.error); };
    tx.onabort = function () { reject(tx.error || new Error('idb aborted')); };
  });
}
function inqLsRead() {
  try { var raw = localStorage.getItem(INQ_STORE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function inqLsWrite(list) {
  try { localStorage.setItem(INQ_STORE_KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
}
var INQStore = {
  /* 读取全部已提交询价（数组，时间升序存储） */
  list: function () {
    return inqIdbConn().then(function (db) {
      if (!db) return inqLsRead() || [];
      return inqIdbGet(db).then(function (v) { return v || []; })
        .catch(function () { return inqLsRead() || []; });
    }).catch(function () { return inqLsRead() || []; });
  },
  /* 追加一条提交记录；resolve(record)——失败也 resolve（降级 localStorage），demo 提交不因存储问题中断 */
  save: function (record) {
    return this.list().then(function (list) {
      list.push(record);
      return inqIdbConn().then(function (db) {
        if (db) return inqIdbSet(db, list);
        return inqLsWrite(list);
      }).catch(function () { return inqLsWrite(list); });
    }).then(function () {
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          var bc = new BroadcastChannel('pc_mgmt_sync');
          bc.postMessage({ type: 'inquiry-added', no: record.no, ts: Date.now() });
          setTimeout(function () { try { bc.close(); } catch (e) { } }, 500);
        }
      } catch (e) { }
      return record;
    });
  },
  /* 工单号：IQ + YYYYMMDD + 4 位当日序号（全局唯一，IN-INQ-04） */
  nextNo: function (list) {
    var d = new Date();
    var ymd = '' + d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
    var prefix = 'IQ' + ymd + '-';
    var max = 0;
    (list || []).forEach(function (r) {
      if (r && typeof r.no === 'string' && r.no.indexOf(prefix) === 0) {
        var n = parseInt(r.no.slice(prefix.length), 10);
        if (!isNaN(n) && n > max) max = n;
      }
    });
    return prefix + ('0000' + (max + 1)).slice(-4);
  },
  /* 提交时刻的时间戳 + 展示文本 */
  stamp: function () {
    var d = new Date();
    function p(n) { return ('0' + n).slice(-2); }
    return {
      at: d.getTime(),
      atTxt: d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
    };
  }
};
