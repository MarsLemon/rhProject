---
title: 4-frontend 经验库
created: 2026-07-09
updated: 2026-07-09
type: meta
tags: [meta, master, frontend]
owner: 沈超
agent: 小马(架构师)
---

agent: 小马(架构师)
owner: 沈超

# 4-frontend 经验库

> **本类涵盖**:Vue2/3、Angular、H5、PPT、UX、前端测试
> **适用**: frontend-only
> **绝对不写业务细节**——只写"如何让前端开发变强"的通用能力教训。

## 📋 经验索引(按能力维度)

| 维度        | 数量 | 简述   |
| ----------- | ---- | ------ |
| 🔍 资料检索 | 0    | 待补充 |
| ❓ 反问澄清 | 0    | 待补充 |
| 🔧 实现     | 1    | Angular CVA 卡死三源 |
| ✅ 验证     | 0    | 待补充 |
| 🤝 协作     | 0    | 待补充 |
| 🛡 边界     | 0    | 待补充 |
| 📝 表达     | 0    | 待补充 |

## 💡 经验条目

### [2026-08-12] 🔧 实现 — Angular CVA + formControlName 点路径 / 初值 [[]] / 多实例 init 三大卡死源

**能力维度**: 🔧 实现(Angular 表单 + ControlValueAccessor)
**触发**: 新建编辑页加载卡死,CPU 100%;参照页(同结构)正常
**抽象教训**:
1. `formControlName` **不支持点路径**,必须用嵌套 `<tr formGroupName="...">`,否则 CVA 接管失败 → emitValue 与 form.get(path).value 结构错位 → 防循环 JSON 比对永不命中 → 死循环
2. CVA 列表 FormControl 初值必须是 `[]` 不是 `[[]]`;`[[]]` 走 `isEmpty=false` 分支 → `addFiles([transformFile([])])` → `transformFile` 同步读 undefined 抛错 → 卡死
3. N 个 CVA 上传实例同时 ngOnInit → 各自 HTTP/OSS client/timer,主线程首屏阻塞;N>5 必崩

**反模式**:
- ❌ `formControlName="parent.child.field"` 偷懒写法
- ❌ `imageUrls: [[]]` 当 FormArray 初值
- ❌ `isWriting=false` 写在 `addFiles` 同步块内(subscribe 触发期间 isWriting 已 false,防不住)
- ❌ ng-container formGroupName 跨 td 兄弟(table 里 ng-container 行为不稳)

**正模式**:
- ✅ `<tr formGroupName="x"><tr formGroupName="y"><td><cva formControlName="leaf">` 三层嵌套
- ✅ `imageUrls: []` 初值
- ✅ `isWriting=false` 统一在 writeValue 末尾关闭,与 addFiles 同步块分离
- ✅ 同步阻塞的 HTTP 初始化放 ngAfterViewInit 之后或延后到用户交互时

**适用**: frontend-only(Angular)
**复用计数**: 1(首发,待后续案例验证)
**状态**: 🟡 待验证(等用户验收新建页不卡 + 保存成功)

<!--
模板参考:
## [YYYY-MM-DD] [能力维度] — [经验标题]

**能力维度**: ...
**触发**: ...
**抽象教训**: ...
**反模式**: ...
**正模式**: ...
**适用**: frontend-only
**复用计数**: N(≥3 自动升 🟢)
**状态**: 🟡 待验证 / 🟢 已验证 / 🔴 已废弃
-->

## 📦 合并自

- `vue2-experiences.md`(0 条,空壳,内容见 `7-archive/vue2-experiences.md`)
- `vue3-experiences.md`(0 条,空壳,内容见 `7-archive/vue3-experiences.md`)
- `angular-experiences.md`(0 条,空壳,内容见 `7-archive/angular-experiences.md`)
- `h5-experiences.md`(0 条,空壳,内容见 `7-archive/h5-experiences.md`)
- `ppt-experiences.md`(0 条,空壳,内容见 `7-archive/ppt-experiences.md`)
- `ux-designer-specialist-experiences.md`(0 条,空壳,内容见 `7-archive/ux-designer-specialist-experiences.md`)
- `frontend-test-experiences.md`(0 条,空壳,内容见 `7-archive/frontend-test-experiences.md`)
