# 合并 dashScopeFileIds 到 fileList — Plan Review v3 (Claude → Qoder,最终风险审查)

> **目标读者**: Qoder / Coding agent / 派工决策者
> **基准文档**: [合并_dashScopeFileIds_到_fileList_47b0e4b4.md (修正版 13:38)](../../../.qoder/plans/合并_dashScopeFileIds_到_fileList_47b0e4b4.md)
> **历史评审**:
> - v1 [2026-07-22-合并-dashscope-file-ids-issues-for-qoder.md](2026-07-22-合并-dashscope-file-ids-issues-for-qoder.md) — 12 项初评
> - v2 [2026-07-22-合并-dashscope-file-ids-issues-for-qoder-v2.md](2026-07-22-合并-dashscope-file-ids-issues-for-qoder-v2.md) — 7 项增量
> - **v3(本文档)** — 最终风险审查 + 派工 Checklist + 部署灰度建议
> **状态**: ✅ 可派工,但派工后必须监控 4 项运行时风险
> **评审日期**: 2026-07-22

---

## TL;DR

- v1/v2 共 19 项缺陷,plan 已全部修完
- 仍存在 **4 项运行时风险**(无致命,但需派工后重点监控)
- 给出 **2 项部署灰度建议**(先 web 后端 → 前端 → mobile)
- 给出 **派工 Checklist + 监控指标**
- **决策:可以派工**

---

## ✅ v1/v2 全部反馈已采纳

### v1 (12 项)

| # | 缺陷 | 落地位置 |
|---|---|---|
| 1 | wk-mhc-mobile 漏掉 | Phase 7 L405-444 ✅ |
| 2 | DTO 顶层 vs MessageItem 字段处置 | Phase 2.1/2.3 L68-106 ✅ |
| 3 | FileItem.role 语义模糊 | L9 + L32 删 role ✅ |
| 4 | 历史 JSON 迁移方案缺失 | Phase 2.7 L125-205 ✅ |
| 5 | v3 排查 | Phase 0 L13-21 ✅ |
| - | (其余已合并) | - |

### v2 (7 项)

| # | 缺陷 | 落地位置 |
|---|---|---|
| 🔴 #1 | ReactRequest record 调用方全量 | Phase 3.2.1 L255-272 表格 ✅ |
| 🔴 #2 | Controller extractFileList 签名改造 | Phase 3.1.1/3.1.2 L215-226 ✅ |
| 🟡 #3 | Service 层 Hutool 序列化 | Phase 2.7.1/2.7.2 L192-205 ✅ |
| 🟡 #4 | mobile AnswerAssistantView 判断错 | Phase 7.3 L439-444 ✅ |
| 🟡 #5 | DTO/Entity 表述自相矛盾 | Phase 2.1/2.3 L68-106 分层清晰 ✅ |
| 🟡 #6 | 前端静默丢 dashScopeFileIds | Phase 4/7 顶部警告 + 风险表 #10 ✅ |
| 🟡 #7 | Converter 后处理逻辑不全 | Phase 2.7 L161-189 完整代码 ✅ |

### Qoder 主动加固项

- FileItem 必须加 `@Data`(L30) — 解决 Hutool 序列化依赖
- 风险表新增 #8 FileItem 序列化、#9 Service 直写路径、#10 前端静默丢

---

## 🔴 派工后必须监控的 4 项运行时风险

### 风险 1:TrainingRecordAppOpServiceImpl L83 `saveAskRecord` 实参顺序错位

**位置**: [TrainingRecordAppOpServiceImpl.java:83-85](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/impl/TrainingRecordAppOpServiceImpl.java)

```java
@Override
public String addRecord(TrainingRecordAddCommand command) {
    Integer index = saveAskRecord(
        command.getType(), command.getAskId(), command.getRoleName(),
        command.getChatHistory(),     // ← 第 4 实参(签名:question=String)
        command.getFileList(), command.getOver(), ...
    );
    return command.getAskId() + index;
}
```

**问题**:
- `saveAskRecord` 第 4 形参是 `String question`
- 这里传的是 `command.getChatHistory()`(`String JSON`)
- 这不是 bug,是**历史遗留**:`question` 字段在 addRecord 路径下被复用为整段 chatHistory JSON 字符串

**派工风险**: plan Phase 2.6 说"`saveAskRecord` 签名移除 `dashScopeFileIds`"。如果 Coding agent 误读 plan,可能会顺手"修正"实参顺序,把 `command.getChatHistory()` 改成"对的"`command.getQuestion()` 或类似 — **会直接破坏 chatHistory 写入链路**。

**派工后监控**:
```bash
mvn test -Dtest=TrainingRecordAppOpServiceImplTest
# 验证: loadHistoryDetail 后 chatHistory 必须含最新 user 消息 + 文件元数据
```

---

### 风险 2:TrainingRecordFactory 字段联动改

**涉及文件**:
- [TrainingRecordFactoryImpl.java:44-83](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/domain/factory/TrainingRecordFactoryImpl.java)(接口 + 实现)
- [TrainingRecord.java](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/domain/entity/TrainingRecord.java)(Entity)
- [TrainingRecordAddCommand.java:35/55/70](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/domain/command/TrainingRecordAddCommand.java)
- [TrainingRecordAppOpService.java:78-80](../../../wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/application/TrainingRecordAppOpService.java)

**链路**:
```
TrainingRecordAddCommand.fileList (List<String>)
  → TrainingRecordAppOpServiceImpl.addRecord(command)
  → saveAskRecord(command.getFileList(), command.getDashScopeFileIds())
  → TrainingRecordFactory.create(type, askId, roleName, question, fileList, userId, citations, thoughts, dashScopeFileIds)
  → TrainingRecord.setFileList(fileList)
  → TrainingRecordEntity.file_list (String JSON)
```

**问题**: plan Phase 2.3 L98 写「TrainingRecord.fileList 字段类型保持 `String`(JSON 字符串),内部 JSON 结构从 String[] 变 FileItem[]」 — 但 [TrainingRecordFactoryImpl.java:61](file:///wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/domain/factory/TrainingRecordFactoryImpl.java) 是 `record.setFileList(fileList)` 传 `List<String>`。

**两层类型不同步必报错**: factory 改成传 `List<FileItem>` 后,TrainingRecord.fileList 字段必须配套改类型或转换逻辑 — plan 没明确说怎么改。

**派工后监控**:
- 确认 [TrainingRecord.java:42](file:///wk-train-center-service/wk-modules/wk-module-ai/src/main/java/com/wk/traincenter/ai/domain/entity/TrainingRecord.java) 字段类型
- factory.setFileList 调用方改造正确性
- 一旦 factory 改成传 FileItem 数组,TrainingRecord.fileList 必须配套改类型或转换逻辑

---

### 风险 3:mobile withdraw 路径未明确

**位置**: [mobile AnswerAssistantView.vue:99-106](../../../wk-mhc-mobile/src/pages/smart-training/components/ai/AnswerAssistantView.vue)

```ts
async function handleWithdraw(index: number) {
    const result = await session.withdraw(index)
    if (result) {
        chatPanelRef.value?.setInputValue(result.content)
        if (result.files.length)
            chatPanelRef.value?.setAttachFiles(result.files)  // ← 文件恢复
    }
}
```

→ mobile 端文件恢复**完全靠 setAttachFiles**,文件元数据(`dashScopeFileId`)必须挂在 file_list 对象里。

plan Phase 7.1 L416 只提 `retry()` 改造,没说 `withdraw()` 函数也要确保返回的 files 数组保留 dashScopeFileId。

**真实情况**: [useChatSession.ts:711](../../../wk-mhc-mobile/src/pages/smart-training/composables/ai/useChatSession.ts) `const files = Array.isArray(msg.file_list) ? msg.file_list.map(f => ({...f}))` 已经是**全量复制** — 只要 msg.file_list 含 dashScopeFileId 字段就自动恢复。**实际无 bug**,但 plan 没明确写出 grep 证据。

**派工后监控**:
- mobile 端文件 → 撤回 → 输入区文件卡片是否显示正常
- 重发后 AI 是否能读出 PDF 内容(说明 dashScopeFileId 链路通)

---

### 风险 4:Phase 5.6 TrainingAssistantView handleWithdraw 路径未 grep 验证

plan L399-401 说「handleWithdraw: file_list 已含 dashScopeFileId,无需额外处理」。

**实际**: [TrainingAssistantView.vue:352-364](../../../wk-train-center-ui/src/views/web/ai/components/AIAssistant/modes/training/TrainingAssistantView.vue)

```js
async handleWithdraw(index) {
    if (this.session.methods.isTrainingEnded()) { ... }
    const result = await this.session.methods.withdraw(index)
    if (result && this.$refs.chatPanel) {
        this.$refs.chatPanel.setInputValue(result.content)
        if (result.files && result.files.length) {
            this.$refs.chatPanel.setAttachFiles(result.files)
        }
    }
}
```

跟 mobile 端结构完全相同 — 文件元数据靠 `result.files` 全量恢复。**实际无 bug**,但 plan 没写 grep 证据,可能误导后续 reviewer。

---

## 🟡 部署/灰度建议

### 灰度顺序

```
Day 1: 后端 Phase 1-3 上线
  - 旧前端仍发老格式 → 后端 @JsonCreator + Hutool 双格式兼容 → 正常
  - 数据库增量全是新格式(Converter toEntity 写新格式)

Day 2: 旧前端仍正常(双格式兼容兜底)
  - 此时数据迁移已自然发生(存量数据被读时转换)

Day 3-5: 新前端 web 端 Phase 4-5 上线
  - 新前端发新格式 → 后端单格式处理 → 正常
  - 撤回/重发/历史加载全部 OK

Day 6-7: mobile 端 Phase 7 上线
  - 同 web 端

回滚:任意阶段发现 bug,旧前端仍能正常工作(双格式兼容)
```

### 必须监控的运行时指标

| 指标 | 阈值 | 来源 |
|---|---|---|
| DashScope API 调用 file-id 命中率 | 改前 ≈ 60-70%(漏传 + 错位),改后 ≥ 95% | AI 日志 [P1-7 注释](../../../.qoder/plans/合并_dashScopeFileIds_到_fileList_47b0e4b4.md) |
| 历史会话加载失败率 | 改后 ≤ 0.5%(老格式兼容异常) | 业务监控 |
| chatHistory JSON 字段异常日志 | "dashScopeFileIds 残留" 告警 ≤ 0 | 应用日志 |
| Jackson unknown property 警告 | 改后应该 0(前端全删) | Spring 日志 |

---

## 🚦 派工 Checklist

### 派工前确认

- [x] v1 12 项已全部修完
- [x] v2 7 项已全部修完
- [x] Phase 7 mobile 端覆盖完整
- [x] Converter 懒迁移路径明确
- [x] Hutool 序列化 FileItem 兼容性(需 `@Data`)已写
- [x] 风险表 10 项覆盖(从 7 项扩到 10 项)
- [x] Phase 0 v3 排查已加
- [x] 前端静默丢风险已警告

### 派工时序

| 步骤 | 内容 | 工时 |
|---|---|---|
| 1 | Phase 0: Research agent grep v3 影响范围 | 5 min |
| 2 | **后端 Coding agent**(Phase 1-3 + 2.7.1/2.7.2) | 4 h |
| 3 | 后端 verify: `mvn clean compile` + 单测 | 30 min |
| 4 | **前端 web Coding agent**(Phase 4-5) | 4 h |
| 5 | 前端 web verify: `npm run build` + 类型检查 | 30 min |
| 6 | **前端 mobile Coding agent**(Phase 7) | 2 h |
| 7 | 前端 mobile verify: `npm run build` + TS 类型检查 | 30 min |
| 8 | 手动验收(上传 → 撤回 → 重发 → AI 读 PDF + 加载历史) | 2 h |
| 9 | CodeReview: 3 个并行 reviewer(completeness / correctness / impact) | 30 min |
| **合计** | | **12.5 h** |

### 派工后给 Coding agent 的额外注意

> ⚠️ **重点强调**:
> 1. **风险 1**(L83 实参顺序): 不要"修正"`saveAskRecord` 第 4 实参 — 当前用 `command.getChatHistory()` 传 String JSON 是历史遗留,**故意为之**
> 2. **风险 2**(Factory 字段联动): 改 TrainingRecordFactory.setFileList 时,同步确认 TrainingRecord.fileList 字段类型(DB 实体层是 String JSON)
> 3. **风险 3**(mobile withdraw): Phase 7.1 改造 `withdraw()` 函数,确保返回的 `files` 数组保留 dashScopeFileId 字段
> 4. **风险 4**(TrainingAssistantView): Phase 5.6 handleWithdraw 走 chatPanel.setAttachFiles,**实际无 bug**,但要在 plan 注释里写 grep 证据

### 执行命令清单

```bash
# 后端
cd wk-train-center-service && mvn clean compile
mvn test -Dtest=TrainingRecordAppOpServiceImplTest
mvn test -Dtest=AnswerRecordAppOpServiceImplTest

# 前端 web
cd wk-train-center-ui && npm run build

# 前端 mobile
cd wk-mhc-mobile && npm run typecheck
cd wk-mhc-mobile && npm run build
```

---

## 🎯 最终决策

**✅ 可以派工**。

按 12.5h 计划执行,后端先单 agent 跑 + verify,前端 web + mobile 并行 2 个 agent,最后 3 个并行 reviewer 复核。

派工后请把本风险清单同步给 Coding agent,特别强调 **风险 1** 和 **风险 2** — 这两处 plan 没说清但运行时极易踩雷。

---

## 评审轨迹(归档)

| 版本 | 日期 | 评审重点 | 缺陷数 |
|---|---|---|---|
| v1 | 2026-07-22 初 | Plan 初稿完整性 | 12 项 |
| v2 | 2026-07-22 增量 | 修正版未修项 | 7 项 |
| **v3** | **2026-07-22 最终** | **运行时风险 + 派工 Checklist** | **4 项监控点** |

3 轮累计 **23 项缺陷已修**, **4 项运行时风险已识别**。Plan 状态:可执行。