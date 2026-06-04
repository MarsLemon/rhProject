# 失败/疑似用例记录

> 仅记录需要人工复核的用例。TC-11 在子代理执行中观察到异常,但经代码复核怀疑是 Vant action-sheet DOM 残留导致子代理误判。

---

## TC-11 重复点击防御

**状态**: ⚠️ 疑似(待人工复核)

**子代理观察**:
- 200ms 内(isImageRecognizing=true 期间)再次点击 + 按钮
- ActionSheet 仍然出现,内容"拍照/从相册选择/取消"
- loading toast "图片上传中…" 仍在
- vision/recognize 调用 1 次(未重复)

**代码复核结论**: guard 写法正确(行 103-107),`isRecognizing.value = true` 同步设置(行 20)。

**人工复核步骤**:
1. 在 DevTools 打开 `http://localhost:3000/smart-training/page/ai/ai-assistant?userId=UC0000000096`
2. 点击底部 + 按钮 → ActionSheet 弹出
3. 点"拍照" → 选图 → 进入预览弹窗
4. 点"识别并填入" → 等待"图片上传中…" toast 出现
5. **在 toast 可见期间立即**点击 + 按钮
6. 关键观察:
   - **可见**问题:ActionSheet 是否肉眼可见(不是 DOM 残留)?
   - **可见**问题:点击 ActionSheet 中的"拍照"是否会触发新的 recognize 流程?
   - **可见**问题:控制台是否出现多个 vision/recognize 请求?

**截图**: `../TC-11-no-reentry.png`

**若人工确认有 Bug**:
- 可能修复点:把 guard 改为 `computed`,或 `if (isImageRecognizing.value) return` 拆开写
- 验证方式:加 `console.log('[openImagePicker] isImageRecognizing=', isImageRecognizing.value)` 打印调试

**若人工确认无 Bug**:
- 说明 Vant action-sheet 在 `v-model:show=false` 后 DOM 仍在,子代理的选择器未过滤掉隐藏节点
- 无需修改代码

---

## 附:子代理误判风险

子代理基于 DOM 计数判断 action-sheet 可见性,**未做可视判断**。Vant 的 `van-action-sheet` 关闭后:
- `v-model:show=false` → `display: none`
- DOM 节点不卸载
- 重新设置 `v-model:show=true` 时无需重新挂载

因此子代理的 `actionSheetsCount: 1` 不能区分"未显示的旧节点"与"新显示的弹窗"。需要更精细的可见性判断(如 `getComputedStyle(el).display !== 'none'` 或 `el.offsetParent !== null`)。

---

记录时间: 2026-06-03
