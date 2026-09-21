# 对话片段导出/导入功能 - 修订版实施计划

## 版本信息
- **制定时间**: 2026-07-22
- **修订原因**: 根据评审经验吸取关键修正（ID 返回值、JSON 契约、错误分类、边界校验等）
- **Owner**: Claude (Review Expert)
- **状态**: 待编码实现

---

## 概述

在 **答疑助手（answer 模式，仅答疑，不含陪练）** 实现对话片段的导出/导入，核心特性：

### 导出流程
1. 顶部菜单「导出对话」→ 当前消息列表进入多选模式
2. 用户勾选若干组（每组 = 用户 + AI 成对单元）
3. 底部工具条显示「全选 / 已选 N 组 / 取消 / 导出 JSON」
4. 前端构建 JSON → 下载文件 `share-<会话概述>.json`

### 导入流程
1. 顶部菜单「导入对话」→ 选本地 `.json`
2. 前端解析+校验（错误分类中文提示）
3. 调**新增后端接口** `POST /api/wk/answer/student/import`（一次原子新建 askId + 写全部记录）
4. 后端返回新记录**主键 id**（关键修正）
5. 前端 `loadHistoryDetail(id)` 加载为当前会话，刷新历史列表
6. 可续聊，所有操作（撤回/重试/删除）正常可用

### 保真度约定
- ✅ 保留：正文 + 引用(citations) + 附件(fileList)
- ❌ 剔除：思考过程(thoughts)
- 📎 已知风险：OSS 预签名 URL 过期不在本期处理

---

## 数据契约 v2（关键修正）

文件名：`share-<overview>.json`（overview 清洗非法字符 `\ / : * ? " < > |` 与控制符，截断 ≤80 字；空则回退 `share-<timestamp>`）。

```json
{
  "version": 1,
  "source": "wk-train-center-answer",
  "overview": "会话概述",
  "exportedAt": "2026-07-22T13:20:00.000Z",
  "records": [
    { 
      "type": 20, 
      "chatHistory": "用户提问", 
      "fileList": [ { "url": "...", "dashScopeFileId": "...", "name": "..." } ] 
    },
    { 
      "type": 10, 
      "chatHistory": "AI 回答", 
      "citations": "[{\"title\":\"来源 A\",...}]",  
      "fileList": ["https://.../a.pdf"]           
    }
  ]
}
```

**字段规范：**
| 字段 | type=20 (用户) | type=10 (AI) | 说明 |
|---|---|---|---|
| `citations` | - | JSON 字符串 | 前端数组 → JSON.stringify，后端存储为 JSON 字符串 |
| `fileList` | 对象数组 `{url,dashScopeFileId,name}` | URL 字符串数组 | FileItem 反序列化器兼容双形态 |
| `thoughts` | 剔除 | 剔除 | 显式不写入 |

**校验规则：**
- version 必须为 1
- source 必须为 `wk-train-center-answer`
- records 非空且 ≤ 2000 条
- 每条 type ∈ {10, 20}，chatHistory 为字符串
- 文件总大小建议 ≤ 3MB

---

## 后端改动（wk-train-center-service / wk-module-ai）

包路径根：`com.wk.traincenter.ai`。遵循现有 DDD 分层（controller → application → domain factory/repository）与 `RespVo`/`ResponseUtils` 约定（成功码 `00000000`）。

### B1. 新增 DTO：`controller/model/AnswerImportDto.java`
```java
@Data
public class AnswerImportDto {
    @Schema(description = "会话概述")
    private String overview;
    
    @Schema(description = "对话记录列表")
    @NotEmpty(message = "导入内容不能为空")
    private List<AnswerImportRecordDto> records;
    
    public AnswerImportCommand toImportCommand() {
        // 映射逻辑
        return new AnswerImportCommand(overview, records.stream()
            .map(r -> r.toRecordCommand())
            .collect(Collectors.toList()));
    }
}
```

内嵌/同包 `AnswerImportRecordDto`：
```java
@Data
public class AnswerImportRecordDto {
    @Schema(description = "类型 10AI/20 用户")
    @NotNull
    private Integer type;
    
    @Schema(description = "对话正文")
    @NotBlank
    private String chatHistory;
    
    @Schema(description = "引用来源 (JSON 字符串)")
    private String citations;  // ← 字符串格式
    
    @Schema(description = "文件列表")
    private List<FileItem> fileList;
    
    public AnswerRecordCommand toRecordCommand() {
        AnswerRecordCommand cmd = new AnswerRecordCommand();
        cmd.setType(type);
        cmd.setChatHistory(chatHistory);
        cmd.setCitations(citations);
        cmd.setFileList(fileList);
        return cmd;
    }
}
```

### B2. 新增 Command：`domain/command/AnswerImportCommand.java`
```java
@Data
public class AnswerImportCommand {
    private String overview;
    private List<AnswerRecordCommand> records;
    
    public AnswerImportCommand(String overview, List<AnswerRecordCommand> records) {
        this.overview = overview;
        this.records = records;
    }
}
```

### B3. Service 接口新增方法：`application/AnswerRecordAppOpService.java`
```java
/** 批量导入：新建会话并原子写入全部记录，返回新记录主键 id */
String importSession(AnswerImportCommand command);
```

### B4. Service 实现：**关键修正（返回主键 id）** `application/impl/AnswerRecordAppOpServiceImpl.java`
```java
@Override
@Transactional
public String importSession(AnswerImportCommand command) {
    if (command == null || command.getRecords() == null || command.getRecords().isEmpty()) {
        throw new ServiceException("导入内容为空");
    }
    
    if (command.getRecords().size() > 2000) {
        throw new ServiceException("最多支持导入 2000 条对话记录");
    }
    
    for (int i = 0; i < command.getRecords().size(); i++) {
        AnswerRecordCommand rec = command.getRecords().get(i);
        if (rec.getType() != 10 && rec.getType() != 20) {
            throw new ServiceException("第" + (i + 1) + "条记录的类型无效：" + rec.getType());
        }
        if (rec.getChatHistory() == null || rec.getChatHistory().isBlank()) {
            throw new ServiceException("第" + (i + 1) + "条记录的正文不能为空");
        }
    }
    
    String askId = System.currentTimeMillis() + UserUtils.getUserId();
    AnswerRecord domain = null;
    
    for (AnswerRecordCommand rec : command.getRecords()) {
        rec.setAskId(askId);
        if (domain == null) {
            domain = answerRecordFactory.create(rec);   // 首条初始化会话
        } else {
            answerRecordFactory.edit(domain, rec);       // 其余追加记录
        }
    }
    
    if (StringUtils.isNotBlank(command.getOverview())) {
        domain.setOverview(command.getOverview());
    }
    
    answerRecordRepository.save(domain);              // ★ 单次 insert
    
    // ★ 关键修正：getRecord(id) 按主键查询，必须返回主键 id
    AnswerRecord saved = answerRecordRepository.findByAskId(askId);
    if (saved == null || saved.getId() == null) {
        throw new ServiceException("导入后无法获取会话 ID");
    }
    return saved.getId();
}
```

### B5. Controller 新增端点：`controller/WkAnswerStudentController.java`
```java
@Operation(summary = "答疑记录 - 导入对话")
@LogInject(title = "答疑记录 - 导入对话", logType = LogType.ANSWER)
@PostMapping("/import")
public RespVo<String> importSession(@RequestBody @Valid AnswerImportDto dto) {
    return ResponseUtils.success(answerRecordAppOpService.importSession(dto.toImportCommand()));
}
```

---

## 前端改动（wk-train-center-ui）

模块根：`src/views/web/ai/components/AiAssistant/`。选择状态由 **AnswerAssistantView** 持有，逐级下传；所有选择 UI 用 `v-if="selectMode"` 包裹，**非该特性路径 DOM 与行为保持字节级不变**。

### F1. 新增纯函数模块：`shared/conversationTransfer.js`
```javascript
const SHARE_VERSION = 1;
const SHARE_SOURCE = 'wk-train-center-answer';

/**
 * 构建消息组（user→ai 配对）
 * 跳过 isWelcome 和 role==='system'
 */
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
            // 如果 AI 仍 loading，暂不加入组
            if (!msg.loading) {
                groups.push({
                    key: `group-${lastUserIndex}`,
                    userIndex: lastUserIndex,
                    aiIndex: i,
                    userMsg,
                    aiMsg: msg
                });
                lastUserIndex = -1;  // 重置，避免连续 user 情况
            }
        }
    }
    
    return groups;
}

/** 构建导出 payload（剔除 thoughts）*/
export function buildExportPayload(messages, selectedKeys) {
    const groups = buildGroups(messages);
    const records = [];
    
    for (const group of groups) {
        if (!selectedKeys.has(group.key)) continue;
        
        // User 消息
        const userRec = {
            type: 20,
            chatHistory: group.userMsg.content,
            fileList: Array.isArray(group.userMsg.file_list) 
                ? group.userMsg.file_list.map(f => ({
                    url: f.url || f.rawUrl || f.viewUrl || '',
                    dashScopeFileId: f.dashScopeFileId || null,
                    name: f.name || ''
                }))
                : []
        };
        records.push(userRec);
        
        // AI 消息
        const aiRec = {
            type: 10,
            chatHistory: group.aiMsg.content,
            citations: Array.isArray(group.aiMsg.citations) 
                ? JSON.stringify(group.aiMsg.citations)  // ← 字符串化
                : undefined,
            fileList: Array.isArray(group.aiMsg.fileList)
                ? group.aiMsg.fileList.filter(url => url)  // ← URL 数组
                : []
        };
        records.push(aiRec);
    }
    
    if (records.length === 0) return null;
    
    const firstUser = records.find(r => r.type === 20);
    const overview = firstUser ? firstUser.chatHistory.trim().slice(0, 80) : '对话分享';
    
    return {
        version: SHARE_VERSION,
        source: SHARE_SOURCE,
        overview,
        exportedAt: new Date().toISOString(),
        records
    };
}

/** 文件名清洗 */
export function sanitizeFileName(name) {
    const cleaned = name.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '-').trim();
    return cleaned || 'share-' + Date.now();
}

/** 触发下载 */
export function downloadPayload(payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sanitizeFileName(payload.overview) + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

/** 导入文本解析，抛带中文 message 的错误 */
export function parseImportText(text) {
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch (e) {
        throw new Error('文件格式错误，无法解析为 JSON');
    }
    
    const requiredFields = ['version', 'source', 'overview', 'records'];
    for (const field of requiredFields) {
        if (!(field in parsed)) {
            throw new Error('文件格式错误：缺少必需字段 "' + field + '"');
        }
    }
    
    if (parsed.version !== SHARE_VERSION) {
        throw new Error('不是有效的对话分享文件（版本不兼容）');
    }
    if (parsed.source !== SHARE_SOURCE) {
        throw new Error('不支持的文件类型');
    }
    
    if (!Array.isArray(parsed.records) || parsed.records.length === 0) {
        throw new Error('文件中没有可导入的对话记录');
    }
    
    if (parsed.records.length > 2000) {
        throw new Error('文件过大或对话条数过多（上限 2000 条）');
    }
    
    for (let i = 0; i < parsed.records.length; i++) {
        const r = parsed.records[i];
        if (r.type !== 10 && r.type !== 20) {
            throw new Error(`第${i+1}条记录的类型无效：${r.type}`);
        }
        if (typeof r.chatHistory !== 'string') {
            throw new Error(`第${i+1}条记录的正文格式错误`);
        }
    }
    
    return {
        overview: (parsed.overview || '').trim(),
        records: parsed.records  // citations 已经是字符串，直接返回
    };
}
```

### F2. 新增展示组件：`components/ConversationSelectToolbar.vue`
```vue
<template>
  <div class="select-toolbar">
    <el-checkbox v-model="allSelected" @change="$emit('select-all', $event)">全选</el-checkbox>
    <span class="count">已选择 {{ selectedCount }} 组对话</span>
    <el-button @click="$emit('cancel')">取消</el-button>
    <el-button type="primary" :disabled="selectedCount === 0" @click="$emit('export')">
      导出 JSON
    </el-button>
  </div>
</template>

<script>
export default {
  props: {
    selectedCount: { type: Number, default: 0 },
    totalGroups: { type: Number, default: 0 },
    allSelected: { type: Boolean, default: false }
  },
  emits: ['select-all', 'cancel', 'export']
};
</script>

<style scoped>
.select-toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  color: #fff;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  border-top: 1px solid #333;
}

.count {
  flex: 1;
  text-align: center;
}
</style>
```

### F3: AiMessageList.vue **整轮高亮增强**
```vue
<template>
  <div class="ai-message-list-root">
  <div ref="chatBody" class="chat-body" ...>
    <div
      v-for="(msg, index) in messages"
      :key="index"
      :class="[
        'message-item', 
        msg.role, 
        isSelectedGroupIndex(index) ? 'group-selected' : ''
      ]"
      :data-msg-index="index"
    >
      <!-- 仅在 selectMode 下显示勾选圈 -->
      <div v-if="selectMode" class="group-checkbox" @click.stop="toggleGroup(msg.groupKey)">
        <input type="checkbox" :checked="isSelectedKey(msg.groupKey)">
      </div>
      
      <!-- 原有头像/内容区域 -->
      ...
    </div>
  </div>
  
  <!-- 底部工具条 -->
  <transition name="toolbar-fade">
    <ConversationSelectToolbar
      v-if="selectMode"
      :selected-count="selectedCount"
      :total-groups="totalGroups"
      :all-selected="allSelected"
      @select-all="handleSelectAll"
      @cancel="exitSelectMode"
      @export="handleExport"
    />
  </transition>
  </div>
</template>

<script>
import { buildGroups } from './shared/conversationTransfer';

export default {
  props: {
    messages: { type: Array, required: true },
    selectMode: { type: Boolean, default: false },
    selectedGroupKeys: { type: Array, default: () => [] }
  },
  computed: {
    groups() {
      return buildGroups(this.messages);
    },
    selectedCount() {
      return this.selectedGroupKeys.length;
    },
    allSelected() {
      return this.groups.length > 0 && 
             this.selectedGroupKeys.every(k => this.selectedGroupKeys.includes(k));
    }
  },
  methods: {
    isSelectedGroupIndex(index) {
      const group = this.groups.find(g => g.userIndex === index || g.aiIndex === index);
      return group && this.selectedGroupKeys.includes(group.key);
    },
    toggleGroup(key) {
      this.$emit('toggle-group', key);
    },
    handleSelectAll(checked) {
      this.$emit('toggle-all', checked);
    },
    exitSelectMode() {
      this.$emit('exit-select-mode');
    },
    handleExport() {
      this.$emit('export');
    }
  }
};
</script>

<style scoped>
/* 整组高亮：覆盖 B452F173 memory（整轮对话单元高亮规范）*/
.message-item.group-selected.user,
.message-item.group-selected.ai {
  background-color: var(--color-primary-light-6, rgba(0, 47, 167, 0.08));
  border-left: 3px solid var(--color-primary, #002FA7);
}

.group-checkbox {
  margin-right: 8px;
  cursor: pointer;
}

.toolbar-fade-enter-active,
.toolbar-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toolbar-fade-enter-from,
.toolbar-fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
```

### F4: shared/AiChatPanel.vue
```vue
<template>
  <div class="chat-messages-body">
    <AiMessageList
      :messages="messages"
      :loading="isLoading"
      :message-actions-disabled="messageActionsDisabled"
      v-bind="selectModeProps"
      @toggle-group="$emit('toggle-group', $event)"
      @toggle-all="$emit('toggle-all', $event)"
      @export="$emit('export-selection')"
      @exit-select-mode="$emit('exit-select-mode')"
    />

    <!-- 条件渲染 InputArea 或 Toolbar -->
    <AiInputArea
      v-if="!hideInput && !selectMode"
      ...
    />
    <!-- Toolbar 由 AiMessageList 内部渲染，此处透传事件即可 -->
  </div>
</template>

<script>
export default {
  props: {
    selectMode: { type: Boolean, default: false },
    selectedGroupKeys: { type: Array, default: () => [] }
  },
  computed: {
    selectModeProps() {
      return {
        selectMode: this.selectMode,
        selectedGroupKeys: this.selectedGroupKeys
      };
    }
  }
};
</script>
```

### F5: modes/answer/AnswerAssistantView.vue
```vue
<template>
  <AssistantModeLayout :show-history="showHistory">
    <template #history>...</template>
    
    <AiChatPanel
      ref="chatPanel"
      :messages="session.state.messages"
      :loading="session.state.isLoading"
      :select-mode="selectMode"
      :selected-group-keys="selectedGroupKeys"
      @toggle-group="toggleGroup"
      @toggle-all="toggleAll"
      @export-selection="exportSelection"
      @exit-select-mode="exitSelectMode"
    />
    
    <!-- 隐藏文件输入 -->
    <input 
      type="file" 
      accept=".json,application/json" 
      ref="importInput" 
      style="display:none" 
      @change="onImportFileChange" 
    />
  </AssistantModeLayout>
</template>

<script>
import { buildExportPayload, downloadPayload, parseImportText } from '@conversationTransfer';

export default {
  data() {
    return {
      selectMode: false,
      selectedGroupKeys: [],
      session: createAnswerChatSession(this, this.appId)
    };
  },
  computed: {
    totalGroups() {
      return this.session.state.messages.length > 0 
        ? buildGroups(this.session.state.messages).length 
        : 0;
    }
  },
  methods: {
    enterSelectMode() {
      if (this.session.state.isLoading) {
        this.$message.warning('生成中暂不可选择');
        return;
      }
      this.showHistory = false;
      this.selectMode = true;
      this.selectedGroupKeys = [];
    },
    exitSelectMode() {
      this.selectMode = false;
      this.selectedGroupKeys = [];
    },
    toggleGroup(key) {
      const idx = this.selectedGroupKeys.indexOf(key);
      if (idx >= 0) {
        this.selectedGroupKeys.splice(idx, 1);
      } else {
        this.selectedGroupKeys.push(key);
      }
    },
    toggleAll(checked) {
      const keys = buildGroups(this.session.state.messages).map(g => g.key);
      this.selectedGroupKeys = checked ? [...keys] : [];
    },
    exportSelection() {
      if (this.selectedGroupKeys.length === 0) {
        this.$message.warning('请至少选择一组对话');
        return;
      }
      const payload = buildExportPayload(this.session.state.messages, new Set(this.selectedGroupKeys));
      if (!payload) {
        this.$message.warning('未找到可导出的对话');
        return;
      }
      downloadPayload(payload);
      this.exitSelectMode();
      this.$message.success('导出成功');
    },
    triggerImport() {
      this.$refs.importInput.click();
    },
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
  }
};
</script>
```

### F6: api/ai/assistant.js
```javascript
export const AnswerAssistant = {
  // ... existing methods
  
  /** 导入对话：接收 overview+records，返回新会话主键 id */
  importSession(data) {
    return post('/api/wk/answer/student/import', data);
  }
};
```

### F7: base/AiAssistantHeader.vue + views/AiAssistant.vue
```vue
<!-- Header -->
<div class="header-right">
  <el-tooltip content="新建会话" placement="bottom">
    <i class="el-icon-plus icon-btn" @click="$emit('menu', 'new')" />
  </el-tooltip>

  <el-tooltip content="历史记录" placement="bottom">
    <i class="el-icon-time icon-btn" @click="$emit('menu', 'history')" />
  </el-tooltip>

  <!-- 新增：导出/导入图标 -->
  <el-tooltip v-if="assistantMode==='answer'" content="导出对话" placement="bottom">
    <i class="el-icon-download icon-btn" @click="$emit('menu','export-conversation')"/>
  </el-tooltip>

  <el-tooltip v-if="assistantMode==='answer'" content="导入对话" placement="bottom">
    <i class="el-icon-upload2 icon-btn" @click="$emit('menu','import-conversation')"/>
  </el-tooltip>

  <el-tooltip :content="isFullScreen ? '退出全屏' : '全屏模式'" placement="bottom">
    <i
      :class="isFullScreen ? 'el-icon-aim' : 'el-icon-full-screen'"
      class="icon-btn fullscreen-btn"
      @click="$emit('menu', 'fullscreen')"
    />
  </el-tooltip>

  <i class="el-icon-close close-btn" @click="$emit('close')" />
</div>
```

```javascript
// AiAssistant.vue handleHeaderMenu
handleHeaderMenu(command) {
  if (command === 'history') {
    const v = this.getCurrentView();
    if (v && v.toggleHistory) v.toggleHistory();
    return;
  }

  if (command === 'new') {
    // ... existing logic
    return;
  }

  // 新增：导出对话
  if (command === 'export-conversation') {
    const v = this.getCurrentView();
    if (v && v.enterSelectMode) v.enterSelectMode();
    return;
  }

  // 新增：导入对话
  if (command === 'import-conversation') {
    const v = this.getCurrentView();
    if (v && v.triggerImport) v.triggerImport();
    return;
  }

  if (command === 'fullscreen') {
    this.toggleFullScreen();
  }
}
```

---

## 测试计划 v2

### 单测（后端 JUnit）
- `importSession_returnsValidId()`：验证返回的主键 id 有效
- `importSession_rollbackOnEmptyRecords()`：空记录抛异常不回滚残留
- `importSession_indexOrder()`：3 条记录 indices 正确递增
- `importSession_citationsPreservedAsJsonString()`：citations 字符串保留

### E2E（Playwright）
1. 发送若干问题 → 得到回复
2. 点击「导出对话」→ 勾选多组 → 验证文件内容无 thoughts
3. 清空会话 → 点击「导入对话」→ 选文件
4. 验证新会话出现，每条记录有 index
5. 连续追问 → 续聊可用
6. 撤回第一条消息 → 删除成功（index 有效）
7. 历史列表刷新 → 新会话出现在顶

### 回归测试
- 正常聊天（发送/接收/撤回/重试/删除）
- 切换模式（答案/陪练互切不影响）
- 历史记录（打开/删除/修改概述）
- 非特性路径行为不变

---

## 部署计划

### 阶段 1：后端先行（优先）
1. 合并 B1-B5（DTO/Command/Service/Controller）
2. 本地启动 `wk-train-center-service`
3. Swagger 手动测试 `/api/wk/answer/student/import`
4. 发布到测试环境

### 阶段 2：前端跟进
1. 合并 F1-F7
2. 本地 `npm run dev` 验证
3. Playwright 跑 E2E
4. 发布到测试环境

### 阶段 3：联调验收
1. 前后端打通全流程
2. 性能测试（2000 条导入耗时、浏览器内存）
3. 错误场景演练（大文件/坏 JSON/超时）
4. 验收通过，准备生产发布

---

## 被否决的方案（重申）
| 方案 | 理由 |
|---|---|
| 分享 ID + el_answer_share 表 | 改用本地 JSON（用户决策） |
| 前端循环 addRecord | 改为原子 `/import` |
| 导入返回 askId | 改为返回主键 id（复用 loadHistoryDetail） |
| Web Worker 解耦解析 | 同步解析 + 合理上限即可 |
| 完整保真（含 thoughts） | 按用户决策只留 正文 + 引用 + 附件 |

---

## 假设（已确认）
- ✅ 仅答疑模式，陪练不做
- ✅ 成对分组（user→ai），欢迎语/system 排除
- ✅ 导入新建会话，不追加当前会话
- ✅ 文件名 `share-<overview>.json`，overview 清洗/空回退
- ✅ OSS URL 过期已知限制，本期不做处理

---

## 下一步行动
1. **确认后立即可编**：先后端 B1-B5
2. **并行前端 F1-F7**
3. **联调后立即 E2E**
4. **验收通过 → 生产发布**

是否需要我现在就：
- 开始编写后端代码？
- 开始编写前端代码？
- 补充 E2E 测试脚本（Playwright）？

请告诉我优先级，我会立即执行。
