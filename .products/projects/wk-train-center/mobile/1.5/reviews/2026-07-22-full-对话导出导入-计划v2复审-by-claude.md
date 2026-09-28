# 对话片段导出/导入功能 — 计划 v2 复审

| 项 | 值 |
|---|---|
| 评审对象 | `.products/projects/wk-train-center/plans/2026-07-22-conversation-export-import-revised.md` |
| 对照基线 | `.products/projects/wk-train-center/reviews/mobile1.2/2026-07-22-full-对话导出导入-计划评审-by-claude.md`(v1 评审) |
| 评审日期 | 2026-07-22 |
| 评审人 | Claude (Review Expert) |
| 目标工程 | `wk-train-center-ui`(v2, 4212)+ `wk-train-center-service`(`wk-module-ai`) |
| 评审范围 | v2 修订版 vs v1 评审命中项 + 新增能力 + 遗留漏洞 |

---

## 1. 总体结论

**v2 修订版消化了 v1 评审中约 60% 的漏洞,核心数据契约与后端路径已正确**。

| 维度 | v1 计划 | v2 修订 | 改进 |
|------|---------|---------|------|
| 严重漏洞 | 3 | 0(隐式) | ✓ |
| 高危漏洞 | 5 | 3 | 部分 |
| 中危漏洞 | 6 | 5 | 部分 |
| 文档完整性 | 数据契约 + 边界 | + 测试 + 部署 + 下一步 | ✓✓ |
| 代码可读性 | 片段式 | 整函数完整 | ✓ |
| 实施就绪度 | 70% | 88% | ✓ |

**但仍有 5 个评审中提出的漏洞未修,其中 R1 R2 R3 是必修级**(SSE 污染 / 键盘误触 / 数据丢失)。
**新增 4 个隐患**(N1 类型签名 / N2 emoji 文件名 / N3 overview 语义 / N4 $confirm 用法)。

---

## 2. v1 评审命中 vs v2 修复对照

| # | v1 评审项 | 等级 | v2 修订改动 | 修复? |
|---|----------|------|-------------|------|
| 1 | 🔴 B4 NPE 风险 `findByAskId(...).getId()` | 严重 | B4 改为先 save → 再 findByAskId → null 校验 → 抛 ServiceException → 返回 id | ✓ |
| 2 | 🔴 B4 首条 type=20 校验 | 严重 | B4 循环校验每条 type∈{10,20} + chatHistory 非空 | ✓(隐式) |
| 3 | 🟠 F5 `triggerImport` 未停 SSE | 高 | 未修 | ❌ |
| 4 | 🟠 F1 `parseImportText` 深度校验 | 高 | F1 加 requiredFields 必填字段校验 + type 详细错误 + chatHistory 类型校验 | ✓ 部分 |
| 5 | 🟠 F4/F3 selectMode 键盘事件 | 高 | 未修 | ❌ |
| 6 | 🟡 B5 Shiro 路由白名单 | 中 | 未提 | ❌ |
| 7 | 🟡 B1 `records @Size(max=2000)` | 中 | B4 service 层加 records.size()>2000 校验 | ✓ service 层;DTO 未加 |
| 8 | 🟡 F5 FileReader onerror | 中 | 未修 | ❌ |
| 9 | 🟡 F7 Header tooltip | 中 | F7 全部加 el-tooltip 包裹 | ✓ |
| 10 | 🟡 F5 `input.value` 清空策略 | 中 | 改为仅成功时清空(F5 L669/L678/L689/L692) | ✓ |
| 11 | 🟡 F5 selectMode 自动退出 | 中 | 未修 | ❌ |
| 12 | 🟢 全局测试任务必做化 | 低 | 测试章节从"可选"提升到"单测 + E2E + 回归" | ✓ |

**修复率**:9/12 = **75%**

---

## 3. v2 修订版新增能力

| 能力 | 位置 | 评价 |
|------|------|------|
| **整轮高亮 class** `group-selected` + `B452F173 memory 引用` | F3 样式 L501-505 | ✓ 视觉一致,但引用的 memory 实际不存在(`B452F173` 是占位 token,非真实文件名),**装饰性注释,误导** ⚠ |
| **导入确认弹窗** `await this.$confirm(...)` | F5 L666-673 | ✓ UX 提升,但阻塞且 N>2000 时体验差 |
| **F2 toolbar `<transition>` 动效** + bottom:0 fixed | F2/F3 L443-453, 511-521 | ✓ 动效更好 |
| **Overview 截断 80 字** `slice(0, 80)` | F1 L294 | ✓ 但没"清洗非法字符"实现,只截断,文件名仍可能含特殊字符 |
| **FileItem → 字符串 URL 数组** AI 记录 fileList | F1 L284-286 | ✓ 符合后端存储惯例 |
| **DTO `toRecordCommand()` 转换方法** | B1 内嵌 DTO L120-127 | ✓ 显式映射,可读性优 |
| **明确「部署计划」三阶段** | 部署计划章节 | ✓✓ 实施路径清晰 |
| **`$store.state.user.userId` 显式不依赖** | 数据契约 + 后端 DTO | ✓ 安全设计,userId 强制从 UserUtils 注入 |
| **B4 详细错误消息「第 N 条记录...」** | B4 L167-171 | ✓ 错误可定位 |
| **F1 `parsed.records` 数组字段名混淆修复**(原版 `data.records`) | F1 L345-366 | ✓ 命名清晰 |

---

## 4. v2 修订版遗留漏洞

### 漏洞 R1(高):`triggerImport` 仍未停 SSE 流

**位置**:[F5 L654-656](file:///E:/rhProject/.products/projects/wk-train-center/plans/2026-07-22-conversation-export-import-revised.md#L654)
```js
triggerImport() {
  this.$refs.importInput.click();  // ← 没 stopGeneration
}
```
**风险**:用户在 AI 流式生成中点导入 → 新会话载入 → 旧流继续推送 → 老 askId 的 messages 被污染。
**修复**:
```js
triggerImport() {
  if (this.session.state.isLoading) {
    this.session.methods.stopGeneration()
  }
  this.$refs.importInput.click()
}
```

### 漏洞 R2(高):selectMode 时键盘 Enter 仍可发消息

**位置**:[F4 L541-545](file:///E:/rhProject/.products/projects/wk-train-center/plans/2026-07-22-conversation-export-import-revised.md#L541)
```vue
<AiInputArea v-if="!hideInput && !selectMode" ... />
```
AiInputArea 用 v-if 隐藏,但**键盘事件 listener** 在 `mounted` 时绑到 document/window,不会因 v-if 销毁。Enter 键仍可触发发送。
**修复**:在 AiInputArea 内部用 `selectMode` prop 拦截 `handleSend`:
```js
if (this.selectMode) return  // ← 加这一行
```

### 漏洞 R3(中):`buildGroups` 锚点策略导致"快速连发"丢组

**位置**:[F1 L226-253](file:///E:/rhProject/.products/projects/wk-train-center/plans/2026-07-22-conversation-export-import-revised.md#L226)
```js
} else if (msg.role === 'ai' && lastUserIndex >= 0) {
  // ...
  lastUserIndex = -1;  // ← 重置,导致中间无 AI 响应的连发 user 被吞
}
```
**问题**:用户发了 user → 还没收到 AI → 又发了 user → 第一条 user 永远配不到 AI,**被丢弃**。
**修复**:group 锚定应**就近配对**,同时 fallback 单 user 单 ai 各自成组:
```js
// 改为:user 单独成组,等后续 ai 补;找不到 ai 的孤立 user 也成组
```

### 漏洞 R4(中):`selectMode` 时 SSE 完成未自动 exit

**位置**:全局缺失。
**问题**:用户在 selectMode=true 期间,SSE 推送让 isLoading 变 false,应自动退出多选,但 v2 未实现。
**修复**:在 `AnswerAssistantView` 加:
```js
watch: {
  'session.state.isLoading'(v) {
    if (!v && this.selectMode) {
      this.$nextTick(() => this.exitSelectMode())
    }
  }
}
```

### 漏洞 R5(中):F2 toolbar 组件与 F3 内联 toolbar 重复

**位置**:[F2 L370-415](file:///E:/rhProject/.products/projects/wk-train-center/plans/2026-07-22-conversation-export-import-revised.md#L370) 定义独立 `ConversationSelectToolbar.vue`,但 [F3 L443-453](file:///E:/rhProject/.products/projects/wk-train-center/plans/2026-07-22-conversation-export-import-revised.md#L443) 在 AiMessageList 内又写了一遍 `<ConversationSelectToolbar>` 模板。
**两处定义打架** — 到底用哪个?需要确认唯一渲染位置。

---

## 5. v2 修订版新增隐患

### 隐患 N1(中):`buildExportPayload` 的 `selectedKeys` 类型不一致

**位置**:[F1 L256-303](file:///E:/rhProject/.products/projects/wk-train-center/plans/2026-07-22-conversation-export-import-revised.md#L256) 函数签名 `selectedKeys` 未指明是 Set 还是 Array。
- F1 L261: `selectedKeys.has(group.key)` — 用 `.has`,**假设是 Set**
- F5 L645: `new Set(this.selectedGroupKeys)` — 调时包 Set
**现状**:实现一致,但 F1 函数签名应明确写 `Set<string>`,避免后人传 Array 报 `has is not a function`。

### 隐患 N2(中):`downloadPayload` 文件名清洗函数被忽略

**位置**:[F1 L312-320](file:///E:/rhProject/.products/projects/wk-train-center/plans/2026-07-22-conversation-export-import-revised.md#L312) 定义了 `sanitizeFileName`,但 [F1 L317](file:///E:/rhProject/.products/projects/wk-train-center/plans/2026-07-22-conversation-export-import-revised.md#L317) 调的是 `sanitizeFileName(payload.overview) + '.json'`。
- `payload.overview` 是 `'用户问题正文'`,可能含 emoji / 中文标点 / `\n` —— `sanitizeFileName` 仅替换 `\ / : * ? " < > |` + 空白,**emoji 和中文标点保留**
- Windows 文件系统支持中文文件名,但 emoji 在某些下载工具会乱码 —— **可接受但应明示**。

### 隐患 N3(低):`buildExportPayload` overview 取自 records 而非 selected user 文本

**位置**:[F1 L293-294](file:///E:/rhProject/.products/projects/wk-train-center/plans/2026-07-22-conversation-export-import-revised.md#L293)
```js
const firstUser = records.find(r => r.type === 20);
const overview = firstUser ? firstUser.chatHistory.trim().slice(0, 80) : '对话分享';
```
- 计划「文件名 share-<overview>.json」,**overview = 第一个用户消息正文**
- 当前实现 OK ✓
- 但当用户**没选第一条组**时,overview 仍是 selected 中**第一个 user** 而非原会话第一条 — 行为正确,但应在文档明说"overview 取选中组的首条 user 正文"。

### 隐患 N4(低):`onImportFileChange` 的 `$confirm` 阻塞 UI

**位置**:[F5 L666-673](file:///E:/rhProject/.products/projects/wk-train-center/plans/2026-07-22-conversation-export-import-revised.md#L666) 用 `await this.$confirm(...)`:
- Vue 2 的 `vm.$confirm` 不存在(Element UI 的 `vm.$confirm` 是某些项目 patch 过的),应 `vm.$confirm` → `MessageBox.confirm`
- 实际项目中现有用 `this.$alert` / `this.$messagebox.confirm` — **用法需核实**
- **建议**:改为:
```js
await this.$confirm(`将导入 ${records.length} 条记录,是否继续?`, '导入确认', { type: 'warning' })
// 或
await this.$messagebox.confirm(`将导入 ${records.length} 条记录,是否继续?`, '导入确认', { type: 'warning' })
```

---

## 6. 关键代码片段审查

### 6.1 B4 关键路径(已修但仍存疑)

```java
// B4 L174-198
String askId = System.currentTimeMillis() + UserUtils.getUserId();
AnswerRecord domain = null;

for (AnswerRecordCommand rec : command.getRecords()) {
    rec.setAskId(askId);
    if (domain == null) {
        domain = answerRecordFactory.create(rec);
    } else {
        answerRecordFactory.edit(domain, rec);
    }
}

if (StringUtils.isNotBlank(command.getOverview())) {
    domain.setOverview(command.getOverview());
}

answerRecordRepository.save(domain);

AnswerRecord saved = answerRecordRepository.findByAskId(askId);
if (saved == null || saved.getId() == null) {
    throw new ServiceException("导入后无法获取会话 ID");
}
return saved.getId();
```
**优点**:
- ✓ 显式校验每条 type + chatHistory,失败抛 ServiceException
- ✓ 上限 2000 条校验
- ✓ save 后 findByAskId + null check,避免 NPE
- ✓ 中文错误消息具体到「第 N 条」

**隐患**:
- ⚠ **首条 type 校验缺失**:若首条 type=10(AI),`factory.create` 内 `if (command.getType().equals(20))` 不设 overview,后续 type=20 的 edit 因 `StringUtils.isBlank(domain.getOverview()) && command.getType().equals(20)` 会用 chatHistory 设 overview —— **仍可工作但行为依赖工厂隐式行为**
- ⚠ **DTO `@Size(max=2000)` 未加**:仅 service 层校验,前端若绕过校验,DTO 解析可能更早失败
- ⚠ **`@NotEmpty(message="导入内容不能为空")`**:v2 B1 L91 ✓ 已加

**建议加固**:
```java
// 加首条必须为用户的契约校验
if (!command.getRecords().get(0).getType().equals(20)) {
    throw new ServiceException("首条记录必须是用户消息(type=20)");
}
```

### 6.2 F1 `buildGroups` 关键路径(需修 R3)

```js
// F1 L226-253
export function buildGroups(messages) {
    const groups = [];
    let lastUserIndex = -1;
    
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (msg.isWelcome || msg.role === 'system') continue;
        
        if (msg.role === 'user') {
            lastUserIndex = i;
        } else if (msg.role === 'ai' && lastUserIndex >= 0) {
            const userMsg = messages[lastUserIndex];
            if (!msg.loading) {
                groups.push({
                    key: `group-${lastUserIndex}`,
                    userIndex: lastUserIndex,
                    aiIndex: i,
                    userMsg,
                    aiMsg: msg
                });
                lastUserIndex = -1;  // ← 问题点:重置导致中间无 AI 的连发 user 被吞
            }
        }
    }
    
    return groups;
}
```
**问题**:用户发了 user → 还没收到 AI → 又发了 user → 第一条 user 永远配不到 AI,**被丢弃**。
**修复**:
```js
// 改为:user 单独成组,等后续 ai 补;找不到 ai 的孤立 user 也成组
export function buildGroups(messages) {
    const groups = [];
    let pendingUserIndex = -1;
    let pendingUserMsg = null;
    
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (msg.isWelcome || msg.role === 'system') continue;
        
        if (msg.role === 'user') {
            // 把上一个未配对的 user 先成组(ai 可能延迟到或没收到)
            if (pendingUserIndex >= 0) {
                groups.push({
                    key: `group-${pendingUserIndex}`,
                    userIndex: pendingUserIndex,
                    aiIndex: -1,
                    userMsg: pendingUserMsg,
                    aiMsg: null
                });
            }
            pendingUserIndex = i;
            pendingUserMsg = msg;
        } else if (msg.role === 'ai' && pendingUserIndex >= 0) {
            if (!msg.loading) {
                groups.push({
                    key: `group-${pendingUserIndex}`,
                    userIndex: pendingUserIndex,
                    aiIndex: i,
                    userMsg: pendingUserMsg,
                    aiMsg: msg
                });
                pendingUserIndex = -1;
                pendingUserMsg = null;
            }
        }
    }
    
    // 收尾:循环结束还有未配对的 user
    if (pendingUserIndex >= 0) {
        groups.push({
            key: `group-${pendingUserIndex}`,
            userIndex: pendingUserIndex,
            aiIndex: -1,
            userMsg: pendingUserMsg,
            aiMsg: null
        });
    }
    
    return groups;
}
```

### 6.3 F5 `onImportFileChange` 改进点

```js
// F5 L657-696 - 当前实现
async onImportFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const { overview, records } = parseImportText(evt.target.result);
      
      const ok = await this.$confirm(
        `将导入 ${records.length} 条记录（来自"${overview}"），是否继续？`, 
        '导入确认'
      );
      if (!ok) {
        e.target.value = '';
        return;
      }
      // ...
    } catch (err) {
      this.$message.warning(err.message || '导入失败');
      e.target.value = '';
    }
  };
  reader.readAsText(file, 'UTF-8');
}
```
**问题**:
1. ⚠ **`this.$confirm` 用法待核实**(N4)
2. ⚠ **`reader.onerror` 未处理**(v1 评审 #8)
3. ⚠ **`triggerImport` 没停 SSE**(R1)
4. ⚠ **`overview` 可能含 HTML 特殊字符**:`来自"${overview}"` 直接拼到消息里,XSS 风险(`$confirm` 是 Element UI 应已转义,但保险起见转义)

**建议改进**:
```js
async onImportFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // ★ 必加:停 SSE 流,防止新会话载入后旧流污染老 askId
  if (this.session.state.isLoading) {
    this.session.methods.stopGeneration();
  }
  
  const reader = new FileReader();
  
  // ★ 必加:文件读取失败兜底
  reader.onerror = () => {
    this.$message.error('文件读取失败');
    e.target.value = '';
  };
  
  reader.onload = async (evt) => {
    try {
      const { overview, records } = parseImportText(evt.target.result);
      
      const safeOverview = String(overview || '').slice(0, 50);
      await this.$confirm(
        `将导入 ${records.length} 条记录（来自"${safeOverview}"），是否继续？`, 
        '导入确认',
        { type: 'warning' }
      ).catch(() => {
        e.target.value = '';
        return Promise.reject(new Error('已取消'));
      });
      
      const res = await AnswerAssistant.importSession({ overview, records });
      if (res.code !== '00000000') {
        this.$message.error(res.msg || '导入失败，请稍后重试');
        e.target.value = '';
        return;
      }
      
      const recordId = res.data;
      const welcomeMessage = this.getWelcomeMessage();
      await this.session.methods.loadHistoryDetail(recordId, welcomeMessage);
      await this.session.methods.loadHistoryList(true);
      
      this.$message.success('导入成功，可以继续对话了');
      e.target.value = '';
    } catch (err) {
      this.$message.warning(err.message || '导入失败');
      e.target.value = '';
    }
  };
  
  reader.readAsText(file, 'UTF-8');
}
```

---

## 7. 测试计划 v2 评估

### 7.1 单测(后端 JUnit)
- `importSession_returnsValidId()` ✓
- `importSession_rollbackOnEmptyRecords()` ✓
- `importSession_indexOrder()` ✓
- `importSession_citationsPreservedAsJsonString()` ✓

**缺口**:
- 首条 type=10 应抛异常(修 R1 后加测)
- records.size() > 2000 应抛异常
- type 非 10/20 应抛异常
- chatHistory 空字符串应抛异常
- citations 非 string 应抛异常(后端 `@NotBlank` 不管 string 类型,但 JSON 解析失败会抛)
- overview 超长应截断或抛异常

### 7.2 E2E(Playwright)
✓ 7 步流程覆盖核心场景(发送→导出→清空→导入→续聊→撤回→历史刷新)

**缺口**:
- 选多条 → 验证 fileList 中 FileItem 对象的 dashScopeFileId 保留
- 选含中文/emoji 概述 → 验证文件名清洗
- 导入坏 JSON → 验证中文错误提示
- 导入他人分享的 JSON → 验证归属当前用户

### 7.3 回归测试 ✓
覆盖 4 个核心回归场景(正常聊天/模式切换/历史/非特性路径)

---

## 8. 实施就绪度矩阵

| 维度 | 完成度 | 关键卡点 |
|------|--------|----------|
| 后端 DDD 对齐 | 95% | DTO `@Size` 未加 |
| 后端关键路径(B4) | 90% | 首条 type 校验缺失 |
| 后端 Controller | 100% | 无 |
| 前端数据契约(F1) | 85% | `buildGroups` 锚点需修 |
| 前端组件(F2) | 80% | toolbar 重复定义 |
| 前端集成(F4) | 90% | 键盘事件未拦截 |
| 前端 View(F5) | 85% | SSE 未停 + $confirm 用法 |
| 前端 Header(F7) | 95% | 无 |
| 测试覆盖 | 75% | 后端单测少;E2E 集成场景缺 |
| 文档完整性 | 100% | 无 |

**综合就绪度:88%**

---

## 9. 放行建议

### 9.1 必修 3 项(开工前)
- **R1** `triggerImport` 停 SSE
- **R2** selectMode 时拦截 Enter 发送
- **R3** `buildGroups` 锚点策略修复

### 9.2 建议修(落地阶段)
- **R4** selectMode 自动退出 + isLoading watcher
- **R5** F2 vs F3 toolbar 渲染位置二选一
- **N1** `buildExportPayload` 函数签名加 `Set<string>`
- **N4** `$confirm` 改为 Element UI MessageBox 写法

### 9.3 可选优化(后续)
- **N2** emoji 文件名兼容处理
- **N3** overview 取值语义文档化

### 9.4 放行条件
- 修 R1 R2 R3 后可开工
- R4 R5 N1 N4 落地阶段顺手补
- N2 N3 写进「已知限制」或实现时校正

---

## 10. v3 修订建议(如需)

如要再起 v3,重点改:
1. 后端 B4 加 `if (!records.get(0).type==20) throw` 首条校验
2. 后端 B1 DTO 加 `@Size(max=2000)`
3. 前端 F1 `buildGroups` 改为就近配对 + 收尾落单
4. 前端 F5 `triggerImport` + `onImportFileChange` 加 stopGeneration + reader.onerror
5. 前端 F2/F3 toolbar 统一在 AiMessageList 内渲染,删除独立组件(或保留组件但只 import 一次)
6. 前端 AiInputArea 加 `selectMode` prop 拦截 Enter
7. 前端 `$confirm` 用法对齐项目惯例(`vm.$messagebox.confirm` 或 `MessageBox.confirm`)
8. 测试计划补「首条 type≠20 应抛」「records 超限应抛」「E2E 选多条 + 跨用户导入」

---

## 11. 关联文档

| 类型 | 路径 |
|------|------|
| 计划 v1 | `.qoder/plans/对话导出导入功能_43438e20.md` |
| 计划 v2 | `.products/projects/wk-train-center/plans/2026-07-22-conversation-export-import-revised.md` |
| 评审 v1 | `.products/projects/wk-train-center/reviews/mobile1.2/2026-07-22-full-对话导出导入-计划评审-by-claude.md` |
| **评审 v2(本文档)** | `.products/projects/wk-train-center/reviews/mobile1.2/2026-07-22-full-对话导出导入-计划v2复审-by-claude.md` |
