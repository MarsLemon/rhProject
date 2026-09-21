# P1 AI 助手学员端接入 diff（AiButtonGroup + WebAiPptGeneratorButton + SparringDialog）

> **创建**: 2026-06-25
> **关联审计**: [v3-migration-audit-2026-06-25.md](./v3-migration-audit-2026-06-25.md) §2 P1
> **主人决定**: 全量 (A + B + C)，D 拖拽按钮跳过（v3 简化设计合理）

---

## 0. 真实状态（命令核查）

| v3 文件 | 大小 | 状态 |
|---|---|---|
| `views/web/ai/AiAssistant.vue` | 4667B | ✅ 完整 |
| `views/web/ai/components/AiAssistant/base/AiAssistantShell.vue` | 13640B | ✅ 完整 |
| `views/web/ai/components/AiAssistant/modes/answer/AnswerAssistantView.vue` | 完整 | ✅ 完整 |
| `views/web/ai/components/AiAssistant/modes/training/TrainingAssistantView.vue` | 270 行 | ✅ 完整 |
| `views/web/ai/components/AiAssistant/modes/training/TrainingRoleBar.vue` | 313 行 | ✅ 完整 |
| `views/web/ai/components/SparringDialog.vue` | 缺失 | ❌ 缺 |
| `views/web/course/components/AIPPT/WebAiPptGeneratorButton.vue` | 缺失 | ❌ 缺 |
| `views/web/course/components/AIPPT/WebAddCourseFileDialog.vue` | 54 行骨架 | ⚠️ 已迁基础，postForm OK |
| `components/AiButtonGroup/index.vue` | 3202B | ⚠️ 演示版，需接入 |
| `utils/ai/bailian.ts` | 完整 | ✅ AI 百炼 API 已具备 |
| `stores/modules/ai.ts` | 完整 | ✅ Pinia ai store 已具备 |
| `api/client/ai/apps.ts` | 完整 | ✅ AI_APPS 常量已具备 |

---

## 1. 影响清单（CLAUDE.md §1 + workflow-cross-module-check）

| 改动面 | 文件 | 类型 | 影响 |
|---|---|---|---|
| v3 学员端 AI | `views/web/course/components/AIPPT/WebAiPptGeneratorButton.vue` | 新建 | AI 课件生成弹窗入口 |
| v3 学员端 AI | `views/web/ai/components/SparringDialog.vue` | 新建 | 陪练弹窗（包 TrainingAssistantView） |
| v3 全局组件 | `components/AiButtonGroup/index.vue` | 重写 | 接入 AiAssistant + 触发 PPT/Sparring |
| 后端 | 不动 | - | - |
| v2 | 不动 | - | - |
| Wiki | 不动 | - | - |

**业务主域联动**: CLAUDE.md §1 "AI 答疑" 域 → 课程/学习记录。本期只做前端组件接入，不改 API；后续接入真实 AI 流式响应另开 PR。

**不做的事**:
- v2 拖拽浮动按钮 + 边缘吸附（511 行）—— v3 设计选择跳过
- v3 admin/course/components/File/AiPptGenerator 169B 空壳（admin 端不在本 PR 范围，留给 admin 完整迁移 PR）

---

## 2. 3 个文件改动

### 2.1 新建 WebAiPptGeneratorButton.vue（学员端 AI 课件生成）

**File**: `wk-train-center-ui-v3/src/views/web/course/components/AIPPT/WebAiPptGeneratorButton.vue`
**v2 参考**: `wk-train-center-ui/src/views/web/course/components/AIPPT/WebAiPptGeneratorButton.vue`

**改为（Composition API + Element Plus）**:
```vue
<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      width="90%"
      top="5vh"
      :close-on-click-modal="false"
      title="AI 智能生成课件"
      @close="handleClose"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="课件主题">
          <el-input
            v-model="form.topic"
            placeholder="例如:新员工入职培训"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="课件大纲">
          <el-input
            v-model="form.outline"
            type="textarea"
            :rows="6"
            placeholder="可输入大致大纲,留空将由 AI 自动生成"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="课件页数">
          <el-input-number v-model="form.pageCount" :min="3" :max="30" />
        </el-form-item>
        <el-form-item label="生成风格">
          <el-select v-model="form.style" placeholder="请选择">
            <el-option label="商务" value="business" />
            <el-option label="教育" value="education" />
            <el-option label="科技" value="tech" />
            <el-option label="简约" value="minimal" />
          </el-select>
        </el-form-item>
      </el-form>

      <div v-if="generating" style="margin-top: 16px">
        <el-progress :percentage="progress" :status="progressStatus" />
        <div style="margin-top: 8px; color: #909399; font-size: 12px">{{ progressText }}</div>
      </div>

      <template #footer>
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" :loading="generating" @click="handleGenerate">开始生成</el-button>
      </template>
    </el-dialog>

    <WebAddCourseFileDialog
      v-model="uploadVisible"
      :post-form-poros="resultForm"
      @upload-finish="onUploadFinish"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 学员端 AI 课件生成弹窗
 *
 * 决策记录:
 * - props.visible + emit('update:visible') 走 v-model
 * - 生成逻辑走 v3 utils/ai/bailian.ts（百炼 API），本期仅做 UI 骨架 + mock 进度
 *   真实接入留 TODO: 接 aiGeneratePpt API（百炼）
 * - 生成完成后跳到 WebAddCourseFileDialog 让用户填课件信息（与 v2 一致）
 */
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import WebAddCourseFileDialog from './WebAddCourseFileDialog.vue'

const props = withDefaults(
  defineProps<{
    visible?: boolean
  }>(),
  { visible: false }
)

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'ppt-generated', file: Record<string, unknown>): void
}>()

const dialogVisible = ref(props.visible)
const generating = ref(false)
const progress = ref(0)
const progressText = ref('')
const progressStatus = ref<'success' | 'exception' | ''>('')
const uploadVisible = ref(false)

interface PptForm {
  topic: string
  outline: string
  pageCount: number
  style: string
}

const form = reactive<PptForm>({
  topic: '',
  outline: '',
  pageCount: 10,
  style: 'education'
})

interface CourseFileForm {
  id?: string | number
  title?: string
  fileType?: string
  fileUrl?: string
  fileSize?: number
}

const resultForm = reactive<CourseFileForm>({})

watch(
  () => props.visible,
  (v) => {
    dialogVisible.value = v
  }
)

watch(dialogVisible, (v) => emit('update:visible', v))

function handleClose() {
  if (generating.value) {
    ElMessage.warning('生成中，请稍候...')
    return
  }
  dialogVisible.value = false
}

function resetForm() {
  form.topic = ''
  form.outline = ''
  form.pageCount = 10
  form.style = 'education'
  progress.value = 0
  progressText.value = ''
  progressStatus.value = ''
}

async function handleGenerate() {
  if (!form.topic.trim()) {
    ElMessage.warning('请输入课件主题')
    return
  }
  generating.value = true
  progress.value = 0
  progressStatus.value = ''

  // TODO: 真实接入 aiGeneratePpt API（百炼流式响应）
  // 本期 mock: 模拟进度 + 直接构造结果
  const steps = [
    { pct: 20, text: '正在分析主题...' },
    { pct: 45, text: '生成大纲结构...' },
    { pct: 70, text: '渲染幻灯片...' },
    { pct: 95, text: '整合资源...' }
  ]

  for (const step of steps) {
    await sleep(800)
    progress.value = step.pct
    progressText.value = step.text
  }
  await sleep(500)
  progress.value = 100
  progressText.value = '生成完成！'
  progressStatus.value = 'success'

  // mock 结果: 构造一个待上传的课件
  Object.assign(resultForm, {
    title: form.topic,
    fileType: '11', // doc
    fileUrl: `mock-ai-ppt-${Date.now()}.pptx`,
    fileSize: 1024 * 1024
  })

  ElMessage.success('课件生成成功！请填写课件信息')
  dialogVisible.value = false
  uploadVisible.value = true
  generating.value = false
  resetForm()
}

function onUploadFinish(file: Record<string, unknown>) {
  emit('ppt-generated', file)
  uploadVisible.value = false
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
</script>
```

**Commit**: `feat(course): 新建学员端 WebAiPptGeneratorButton AI 课件生成弹窗（API 联调 TODO）`

---

### 2.2 新建 SparringDialog.vue（学员端陪练弹窗）

**File**: `wk-train-center-ui-v3/src/views/web/ai/components/SparringDialog.vue`
**v2 参考**: `wk-train-center-ui/src/views/web/ai/components/SparringDialog.vue`

**改为（直接包 TrainingAssistantView）**:
```vue
<template>
  <el-dialog
    v-model="dialogVisible"
    width="90%"
    top="5vh"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    custom-class="sparring-ai-dialog"
  >
    <template #title>
      <div class="sparring-dialog-title">
        <span>AI 陪练 - {{ sparringRole?.roleName || '智能陪练' }}</span>
        <div class="title-actions">
          <el-icon class="dialog-close-btn" @click="handleClose">
            <Close />
          </el-icon>
        </div>
      </div>
    </template>

    <div class="sparring-dialog-content">
      <TrainingAssistantView
        v-if="dialogVisible"
        ref="trainingView"
        :app-id="appId"
        :preset-role="sparringRole"
        :plan-id="planId"
        :node-ref-id="nodeRefId"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * AI 陪练弹窗
 *
 * 决策记录:
 * - 内部直接引用 TrainingAssistantView（v3 已完整实现 270 行），不重复逻辑
 * - 角色信息透传给 TrainingAssistantView，由其内部状态管理
 * - 关闭按钮置顶右侧，与 v2 风格一致
 */
import { ref, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'
import TrainingAssistantView from './AiAssistant/modes/training/TrainingAssistantView.vue'

const props = withDefaults(
  defineProps<{
    visible?: boolean
    appId?: string
    sparringRole?: Record<string, unknown> | null
    planId?: string
    nodeRefId?: string
  }>(),
  {
    visible: false,
    appId: '',
    sparringRole: null,
    planId: '',
    nodeRefId: ''
  }
)

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'close'): void
}>()

const dialogVisible = ref(props.visible)

watch(
  () => props.visible,
  (v) => {
    dialogVisible.value = v
  }
)

watch(dialogVisible, (v) => emit('update:visible', v))

function handleClose() {
  dialogVisible.value = false
  emit('close')
}
</script>

<style scoped lang="scss">
.sparring-dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 16px;

  .title-actions {
    display: flex;
    gap: 12px;
  }

  .dialog-close-btn {
    cursor: pointer;
    font-size: 18px;
    color: #909399;

    &:hover {
      color: #409eff;
    }
  }
}

.sparring-dialog-content {
  min-height: 60vh;
}
</style>
```

**Commit**: `feat(ai): 新建学员端 SparringDialog 陪练弹窗（包 TrainingAssistantView）`

---

### 2.3 重写 AiButtonGroup/index.vue（接入完整 AI + PPT + Sparring）

**File**: `wk-train-center-ui-v3/src/components/AiButtonGroup/index.vue`
**现状**: 3202B 演示版（静态气泡）
**目标**: 接入 AiAssistant + 触发 PPT + 触发 Sparring

**改为（保留静态按钮设计，扩展菜单触发）**:
```vue
<template>
  <ClientOnly>
    <div v-if="!isExamMode" class="ai-button-group">
      <!-- 主按钮 -->
      <div class="ai-float-btn" :class="{ expanded }" @click="togglePanel">
        <el-icon v-if="!expanded"><ChatDotRound /></el-icon>
        <el-icon v-else><Close /></el-icon>
      </div>

      <!-- 展开菜单 -->
      <transition name="slide-expand">
        <div v-if="expanded" class="ai-menu-list">
          <div class="ai-menu-item" @click="handleMenuClick('courseware')">
            <el-icon><Document /></el-icon>
            <span>AI 课件助手</span>
          </div>
          <div class="ai-menu-item" @click="handleMenuClick('answer')">
            <el-icon><QuestionFilled /></el-icon>
            <span>答疑小助手</span>
          </div>
          <div class="ai-menu-item" @click="handleMenuClick('training')">
            <el-icon><Mic /></el-icon>
            <span>陪练小助手</span>
          </div>
        </div>
      </transition>

      <!-- AI 答疑弹窗 -->
      <AiAssistant
        v-model="aiAssistantVisible"
        default-mode="answer"
        @close="aiAssistantVisible = false"
      />

      <!-- AI 陪练弹窗 -->
      <SparringDialog v-model="sparringVisible" />

      <!-- AI 课件生成弹窗 -->
      <WebAiPptGeneratorButton v-model="pptVisible" @ppt-generated="onPptGenerated" />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
/**
 * AI 助手浮动按钮（学员端）
 *
 * 决策记录:
 * - v3 简化成静态气泡（跳过 v2 拖拽 511 行），符合 Element Plus 风格
 * - 三个菜单: AI 课件 / 答疑 / 陪练（与 v2 AiButtonGroup 三个菜单一致）
 * - 接入 AiAssistant（已完整 4667B） + 新建 SparringDialog + 新建 WebAiPptGeneratorButton
 * - 考试模式下隐藏（从 store 取 isExamMode，与 v2 行为一致）
 */
import { ref, computed } from 'vue'
import { ChatDotRound, Close, Document, QuestionFilled, Mic } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/modules/app'
import AiAssistant from '@/views/web/ai/AiAssistant.vue'
import SparringDialog from '@/views/web/ai/components/SparringDialog.vue'
import WebAiPptGeneratorButton from '@/views/web/course/components/AIPPT/WebAiPptGeneratorButton.vue'

defineOptions({ name: 'AiButtonGroup' })

const appStore = useAppStore()

const expanded = ref(false)
const aiAssistantVisible = ref(false)
const sparringVisible = ref(false)
const pptVisible = ref(false)
const aiAssistantMode = ref<'answer' | 'training'>('answer')

// 考试模式下隐藏 AI 助手（v2 store.getters.isExamMode 等价物）
const isExamMode = computed(() => {
  return (appStore as { isExamMode?: boolean }).isExamMode === true
})

function togglePanel() {
  expanded.value = !expanded.value
}

function handleMenuClick(type: 'courseware' | 'answer' | 'training') {
  expanded.value = false

  if (type === 'courseware') {
    // AI 课件生成
    pptVisible.value = true
  } else if (type === 'answer') {
    // 答疑助手
    aiAssistantMode.value = 'answer'
    aiAssistantVisible.value = true
  } else if (type === 'training') {
    // 陪练助手（弹 SparringDialog 而不是 AiAssistant）
    sparringVisible.value = true
  }
}

function onPptGenerated(file: Record<string, unknown>) {
  // TODO: 课件生成完成后，刷新学员课件列表 / 跳转课件页
  console.log('PPT generated:', file)
}
</script>

<style lang="scss" scoped>
.ai-button-group {
  position: fixed;
  right: 20px;
  bottom: 100px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.ai-float-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s;
  font-size: 24px;

  &:hover {
    transform: scale(1.1);
  }

  &.expanded {
    background: #909399;
  }
}

.ai-menu-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-menu-item {
  width: 130px;
  height: 40px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #303133;
  font-size: 13px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-primary);
    color: #fff;
    transform: translateX(-5px);
  }

  .el-icon {
    font-size: 16px;
  }
}

// 菜单展开动画
.slide-expand-enter-active,
.slide-expand-leave-active {
  transition: all 0.3s ease;
  transform-origin: bottom right;
}

.slide-expand-enter,
.slide-expand-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>
```

**关键决策**:
- `appStore.isExamMode` 字段名待核 —— v3 app store 是否有这个字段？若没有则 fallback 到 false（不隐藏）
- 跳过 v2 拖拽（设计简化）
- 三个菜单动作与 v2 一致

**Commit**: `feat(ai): 接入 AiButtonGroup 完整 AI 助手 + 课件 + 陪练`

---

## 3. 验证步骤（CLAUDE.md 双绿）

```bash
cd e:/rhProject/wk-train-center-ui-v3
npm run typecheck      # 必须绿
npm run dev            # 必须启动 + curl 首页 200
```

**主人亲测**:
1. 浏览器访问学员端任一非考试页面
2. 右下角应看到 AI 气泡按钮
3. 点击展开 → 应看到 3 个菜单（AI 课件 / 答疑 / 陪练）
4. 答疑 → 弹出 AiAssistant 答疑模式
5. 陪练 → 弹出 SparringDialog（含 TrainingAssistantView）
6. AI 课件 → 弹出 WebAiPptGeneratorButton（生成 mock 进度）

---

## 4. Git 操作（本地 commit）

```bash
cd e:/rhProject/wk-train-center-ui-v3
git add src/views/web/course/components/AIPPT/WebAiPptGeneratorButton.vue \
        src/views/web/ai/components/SparringDialog.vue \
        src/components/AiButtonGroup/index.vue
git commit -m "feat: P1 学员端 AI 助手全量接入 (AiAssistant + WebAiPptGeneratorButton + SparringDialog)

- feat(course): 新建学员端 WebAiPptGeneratorButton AI 课件生成弹窗
- feat(ai): 新建学员端 SparringDialog 陪练弹窗
- feat(ai): 接入 AiButtonGroup 完整 AI 助手 (静态按钮 + 3 菜单)
- 跳过 v2 拖拽浮动按钮设计 (v3 简化合理)
- 真实 AI API 联调留 TODO (百炼流式响应)"

cd e:/rhProject
git add wk-train-center-ui-v3
git commit -m "chore: 同步 v3 子仓指针到 P1 AI 助手接入"
```

---

## 5. 风险

| 风险 | 缓解 |
|---|---|
| `appStore.isExamMode` 字段不存在 | fallback false，不隐藏 AI 助手（考试模式暂时不隐藏） |
| v3 stores 类型不完整导致 typecheck 报错 | 用 `(appStore as { isExamMode?: boolean })` 类型断言 |
| WebAiPptGeneratorButton mock 进度实际不联调 | 主人确认后下个 PR 接百炼 API |
| SparringDialog 引用 TrainingAssistantView 但 v2 用的是 sparringRole prop | v3 TrainingAssistantView 已有 `presetRole` prop，命名微调 |
| AiAssistant 4667B 是否真的完整 | 已 grep 全部 20 个组件文件存在 |
| 考试模式不隐藏 | 主人后续接 appStore.isExamMode 时再加 |

---

## 6. 待主人确认

- [ ] 同意 3 文件改动？
- [ ] 同意"跳过 v2 拖拽按钮设计"？
- [ ] 同意"考试模式暂时不隐藏 AI 助手"（fallback false）？
- [ ] 同意"AI API mock 留 TODO 后续接百炼"？

回 OK 我立刻动键盘。