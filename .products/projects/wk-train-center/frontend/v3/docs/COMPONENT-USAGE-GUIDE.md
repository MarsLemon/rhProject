# 📖 VesselKeeper 组件使用示例

**文件路径:** `wk-train-center-ui-v3/src/components/ComponentsBase/CommonButtons`

---

## 🎯 组件列表

1. ✅ **ExportButton.vue** - 导出按钮 (已迁移)
2. ✅ **ImportButton.vue** - 导入按钮 (已迁移)  
3. ⏸️ **DictTag.vue** - 智能字典标签 (已迁移)
4. ⏸️ WarningButton.vue - 警告确认按钮

---

## 1️⃣ ExportButton - 导出按钮组件

### 基本用法

```vue
<template>
  <div class="action-toolbar">
    <!-- 基础导出 -->
    <ExportButton 
      api="/api/course/file/export"
      :params="queryParams"
      @data-back="handleRefresh"
    />
    
    <!-- 带禁用状态 -->
    <ExportButton 
      api="/api/exam/record/export"
      :params="{ examId: currentExamId }"
      :disabled="!currentExamId"
    />
  </div>
</template>

<script setup lang="ts">
import ExportButton from '@/components/ComponentsBase/CommonButtons/ExportButton.vue'

const queryParams = reactive({
  fileType: '',
  state: '',
  catId: ''
})

const handleRefresh = (params: any) => {
  console.log('刷新列表:', params)
}
</script>
```

### Props 参数说明

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| api | string | ✅ | - | 导出接口路径 |
| params | Record<string,any> | ❌ | {} | 查询参数 |
| disabled | boolean | ❌ | false | 是否禁用 |

### Events 事件

| 事件名 | 回调参数 | 说明 |
|--------|----------|------|
| dataBack | [params: Record] | 导出成功后触发，可通知父组件刷新 |
| success | [] | 导出成功时的特殊回调 |

### 优势特性

- ✅ **自动清理空参数** - null/undefined/'' 自动过滤
- ✅ **防重复点击** - 防止多次请求
- ✅ **loading 状态管理** - 按钮自动显示 loading 图标
- ✅ **国际化支持** - 所有文字多语言适配
- ✅ **错误提示** - 统一错误消息展示

---

## 2️⃣ ImportButton - 导入按钮组件

### 基本用法

```vue
<template>
  <div class="action-toolbar">
    <!-- 方式 1: 使用 OSS 模板 URL -->
    <ImportButton 
      template-url="course_import_template.xlsx"
      template-name="课件导入模板.xlsx"
      @upload-data-back="handleUpload"
    />
    
    <!-- 方式 2: 从接口获取模板 -->
    <ImportButton 
      get-template-url="/api/course/import/template"
      template-name="course_import.xlsx"
      accept=".xlsx,.xls"
    />
    
    <!-- 带前置校验 -->
    <ImportButton 
      :is-error="validateBeforeImport"
      label="批量导入"
    />
  </div>
</template>

<script setup lang="ts">
import ImportButton from '@/components/ComponentsBase/CommonButtons/ImportButton.vue'

// 前置校验函数
const validateBeforeImport = () => {
  if (!userHasPermission) {
    ElMessage.warning('没有导入权限')
    return true // 阻止操作
  }
  return false
}

// 上传处理
const handleUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  await uploadApi(formData).then(() => {
    ElMessage.success('导入成功')
    // 刷新列表
  })
}
</script>
```

### Props 参数说明

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| templateUrl | string | ❌ | - | OSS 模板文件 ID |
| getTemplateUrl | string | ❌ | - | 从 API 获取模板的接口 |
| templateName | string | ❌ | 'template.xlsx' | 下载的文件名 |
| label | string | ❌ | 'common.import' | 自定义按钮文字 |
| disabled | boolean | ❌ | false | 是否禁用 |
| accept | string | ❌ | '.xlsx,.xls' | 允许的文件类型 |
| isError | Function | ❌ | - | 前置校验函数 |

### Events 事件

| 事件名 | 回调参数 | 说明 |
|--------|----------|------|
| uploadDataBack | [file: File] | 上传文件后触发，由父组件处理上传逻辑 |

### 优势特性

- ✅ **Popover 面板设计** - 一键切换"下载模板"和"上传文件"
- ✅ **文件大小校验** - 最大 1MB，超出提示
- ✅ **文件格式校验** - 仅支持 .xlsx/.xls
- ✅ **多语言支持** - 所有提示文本国际化
- ✅ **拖拽上传** - Element Plus Upload 原生支持

---

## 3️⃣ DictTag - 智能字典渲染器

### 基本用法

```vue
<template>
  <el-table :data="tableData">
    <el-table-column prop="status" label="状态">
      <template #default="{ row }">
        <!-- 单值显示 -->
        <DictTag type="dic" opt-key="course_state" :value="row.status" tag />
        
        <!-- 多值显示 -->
        <DictTag 
          type="enum" 
          opt-key="priority_level" 
          :arr-value="['high','medium']" 
          tag 
        />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import DictTag from '@/components/ComponentsBase/DictTag.vue'
</script>
```

### Props 参数说明

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| type | 'dic'\|'enum'\|'api' | ✅ | - | 数据类型 |
| optKey | string | ✅ | - | 字典 key / 枚举 key / API key |
| value | string\|number | ❌ | - | 单个值 |
| arrValue | string[] | ❌ | - | 多个值数组 |
| tag | boolean | ❌ | false | 是否显示为 Tag 样式 |
| mut | boolean | ❌ | false | 是否多选模式 |

### 效果对比

| type | optKey | 效果 |
|------|--------|------|
| 'dic' | 'course_state' | 正常/审核中/下架(Tag 绿色) |
| 'enum' | 'priority_level' | 高优先级/中等优先级(Tag+颜色) |
| 'api' | 'lecturer_list' | 讲师名称列表(Tag 灰色) |

### 优势特性

- ✅ **自动识别类型** - dic/enum/api 三种数据源
- ✅ **多语言映射** - 根据当前语言自动翻译
- ✅ **智能标签样式** - enum 自动应用 color/bg
- ✅ **多值拼接** - 中文分号或英文分号分隔
- ✅ **空值处理** - null/undefined 自动显示 '--'

---

## 💡 实际应用场景示例

### 场景 1: 课件管理页 - 完整的操作栏

```vue
<template>
  <div class="filter-toolbar">
    <!-- 操作按钮组 -->
    <ExportButton 
      api="/api/course/file/export"
      :params="queryParams"
      @data-back="handleRefresh"
    />
    
    <ImportButton 
      template-url="course_file_import_template.xlsx"
      @upload-data-back="handleUpload"
    />
    
    <!-- 搜索输入框 -->
    <el-input 
      v-model="queryParams.keyword"
      placeholder="搜索课件名称"
      clearable
      @keyup.enter="loadData"
    />
    
    <el-button type="primary" @click="addNew">
      <Plus />添加课件
    </el-button>
  </div>
</template>

<script setup lang="ts">
import ExportButton from '@/components/ComponentsBase/CommonButtons/ExportButton.vue'
import ImportButton from '@/components/ComponentsBase/CommonButtons/ImportButton.vue'

const queryParams = reactive({
  keyword: '',
  fileType: '',
  state: ''
})
</script>
```

### 场景 2: 表格列 - 智能数据显示

```vue
<template>
  <el-table :data="tableData">
    <el-table-column prop="title" label="课件名称" min-width="200" />
    
    <el-table-column prop="fileType" label="课件类型" width="120">
      <template #default="{ row }">
        <DictTag type="dic" opt-key="course_file_type" :value="row.fileType" tag />
      </template>
    </el-table-column>
    
    <el-table-column prop="state" label="状态" width="100">
      <template #default="{ row }">
        <DictTag 
          type="dic" 
          opt-key="course_state" 
          :value="row.state" 
          tag 
        />
      </template>
    </el-table-column>
    
    <el-table-column prop="createBy_dictText" label="创建人" width="120" />
    
    <el-table-column prop="createTime" label="创建时间" width="180">
      <template #default="{ row }">
        {{ formatTime(row.createTime) }}
      </template>
    </el-table-column>
    
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" size="small" @click="preview(row)">预览</el-button>
        <el-button type="success" size="small" @click="edit(row)">修改</el-button>
        <el-button type="danger" size="small" @click="deleteItem(row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import DictTag from '@/components/ComponentsBase/DictTag.vue'

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}
</script>
```

---

## 🔧 安装与配置

### 自动注册方式 (推荐)

在 `src/components/index.ts` 中添加:

```typescript
export { default as ExportButton } from './ComponentsBase/CommonButtons/ExportButton.vue'
export { default as ImportButton } from './ComponentsBase/CommonButtons/ImportButton.vue'
export { default as DictTag } from './ComponentsBase/DictTag.vue'
```

然后在任意页面直接使用:

```vue
<script setup lang="ts">
// 全局可访问
import { ExportButton, ImportButton, DictTag } from '@/components'
</script>
```

### 局部注册方式

在任何组件内直接 import:

```vue
<script setup lang="ts">
import ExportButton from '@/components/ComponentsBase/CommonButtons/ExportButton.vue'
import ImportButton from '@/components/ComponentsBase/CommonButtons/ImportButton.vue'
import DictTag from '@/components/ComponentsBase/DictTag.vue'
</script>
```

---

## 📊 使用统计

| 组件 | 预估使用频率 | 节省开发时间 |
|------|-------------|-------------|
| ExportButton | 每个列表页 1 次 | 约 1 小时/次 |
| ImportButton | 每个列表页 1 次 | 约 1.5 小时/次 |
| DictTag | 每列 1 次，平均每表 5-10 列 | 约 30 分钟/列 |

**总收益:** 如果项目有 100 个列表页，预计节省 **200+ 小时** 开发时间！🚀

---

## 🎨 下一步优化建议

1. **WarningButton** - 警告确认按钮 (类似"确定要删除吗？")
2. **OssUploadImg** - 图片上传组件
3. **VirtualScrollSelect** - 虚拟滚动下拉选择器
4. **DragTable** - 拖拽排序表格

这些都可以继续从 VesselKeeper 借鉴移植! 📦

---

*组件持续更新中...*
