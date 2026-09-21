---
name: record-sheet-edit-卡死
description: Angular CVA + 表单嵌套场景 formControlName 点路径引发无限循环 / 同步抛错的硬规律
metadata:
  type: project
---

# 现象
新建编辑页(record-sheet-edit)加载/操作时浏览器标签卡死,CPU 100%。
参照物(完工报告编辑页 service-report-fiva-edit)同样表单结构,完全没事。

# 根因三层(按致命度)

## ❌ 致命 1:`formControlName` 用了点路径字符串
```html
<!-- 错 -->
<wk-fiva-temp-oss-upload formControlName="curveImages.dynamicNew.imageUrls">
<!-- 对 -->
<tr formGroupName="curveImages"><tr formGroupName="dynamicNew">
  <wk-fiva-temp-oss-upload formControlName="imageUrls">
```

Angular formControlName **不支持点路径**。它会在当前 formGroup 下新建一个字符串名 FormControl,接管失败 → emitValue 与 form.get(path).value 结构对不上 → `lastEmittedJson` 字符串比较永不命中 → propagateChange 每次都触发 → formControl.setValue → writeValue 又被调 → 死循环。

## ⚠️ 严重 2:CVA 组件初值 `[[]]` 触发同步抛错
`imageUrls: [[]]` 初值让 writeValue([[]]) 走 `nzxType=1` 分支 → `addFiles([transformFile([])])` → transformFile 里 `item.url` 读 undefined → **TypeError**。同步抛错阻塞主线程 = 卡死。
照片 6 个 FormArray 初值 `[[]]` 同理(虽然 formControlName 写法正确,但初值坑同样致命)。

## ⚠️ 较轻 3:多实例同步 init 雪崩
N 个 CVA 上传实例同时 ngOnInit → 各自 HTTP `credential` → 各自 `new OSSClient()` → 各自 `timer(5min)`。10 个实例 = 10 次同步初始化阻塞首屏。

# 完工报告为什么没事
- 完全不用 `<wk-fiva-temp-oss-upload>`,用 `<wk-ocr-upload-input>`(单实例)
- formControlName 全部走嵌套 formGroupName
- 表单初值走 `[]` / `null`,不是 `[[]]`

# 修复手法
1. **点路径 → 多层 formGroupName 嵌套**:同 table 用 `<tr formGroupName="父">` + `<ng-container formGroupName="子">`(ng-container 跨 td 兄弟合法,Angular template 而非浏览器解析);跨 table 用 `<ng-container formGroupName="父">` 包整个新 `<tbody>` 或 `<table>`
2. **emitValue `isWriting` 顺序**:addFiles 之后才设 `isWriting=false` → 同步订阅触发期间 isWriting=true 失效 → emitValue 不该被拦住。把 `isWriting=false` 移出 if,统一在 writeValue 末尾关闭。
3. **初值 `[[]]` → `[]`**:所有 CVA 列表 FormControl 用 `[]`,不用 `[[]]`。

# 防卡死自检清单(Angular 表单 + CVA)
- [ ] 同一 formGroup 嵌套层里,formControlName 都是叶子名字,无点
- [ ] **多层 formGroupName 必须连续嵌套**:子组 tr 必须在父组的 formGroupName 容器内(ng-container / table / tbody);跨 table 时必须显式包 ng-container 重建父组上下文
- [ ] 列表 FormControl 初值是 `[]` 不是 `[[]]`
- [ ] 同一页面 CVA 上传实例 ≤ 5;超 5 个考虑懒加载 / 复用
- [ ] writeValue → clearAll → addFiles 顺序里,isWriting 在最末尾关闭

# 反模式
- ❌ 凭印象答 "CVA 都有 lastEmittedJson 防循环,不可能死循环" → 实际防不住**结构不对**的 value
- ❌ 初值用 `[[]]` 表达"空 FormArray" → 实际是"单元素数组",`isEmpty([[]])` = false
- ❌ 新开 `<table>` 就直接写 `<tr formGroupName="子组">`,以为 Angular 会自动继承父 formGroupName 上下文 → 跨 table/formGroupName 边界,父组上下文断了,要显式 ng-container 重建

# 关联
- `libs/service-report/src/service-report-fiva/components/temp-oss-upload/` — 问题源组件
- `remotes/trade-center/src/app/construction-management/my-work-order/service-report/record-sheet-edit/` — 新建页主战场
- `Thinkpad/22-entities-实体档案/agent-经验库/4-frontend.md` — 前端通用经验库(待同步本案例)