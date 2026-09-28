# 📖 FilterTreeLayout 组合布局组件使用指南

**文件路径:** `src/components/ComponentsBase/FilterTreeLayout.vue`  
**适用场景:** 列表页 + 筛选条件 + 树形分类的三栏布局

---

## 🎯 组件功能特点

- ✅ **左侧固定树面板** - 可折叠分类选择器
- ✅ **顶部操作按钮区** - 支持动态渲染按钮
- ✅ **中部筛选搜索区** - 多条件组合筛选
- ✅ **下部表格列表区** - 自适应内容区域
- ✅ **响应式布局** - 自动适应不同屏幕尺寸

---

## 📝 基本用法示例

### 示例 1: 课件管理页面 (完整版)

```vue
<!-- src/views/admin/course/file.vue -->
<template>
  <FilterTreeLayout 
    :tree-config="treeConfig"
    :action-buttons="actionButtons"
    @search="handleSearch"
    @reset="handleReset"
    @tree-change="handleTreeChange"
  >
    <!-- 自定义筛选条件 -->
    <template #filters="{ params }">
      <el-form-item label="课件类型">
        <DicListSelect 
          v-model="params.fileType" 
          dic-code="course_file_type"
          placeholder="全部类型"
        />
      </el-form-item>
      
      <el-form-item label="课件状态">
        <DicListSelect 
          v-model="params.state" 
          dic-code="course_state"
          placeholder="全部状态"
        />
      </el-form-item>
      
      <el-form-item label="课件名称">
        <el-input 
          v-model="params.keyword" 
          placeholder="输入关键字搜索"
          clearable
          prefix-icon="Search"
        />
      </el-form-item>
    </template>
    
    <!-- 自定义内容区 (表格) -->
    <template #content="{ listQuery }">
      <DataTable
        ref="tableRef"
        :columns="tableColumns"
        :data="tableData"
        :loading="loading"
        :pagination="paginationConfig"
        @page-change="handlePageChange"
        @row-click="handleRowClick"
      >
        <template #status="{ row }">
          <DictTag type="dic" opt-key="course_state" :value="row.status" tag />
        </template>
      </DataTable>
    </template>
  </FilterTreeLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import FilterTreeLayout from '@/components/ComponentsBase/FilterTreeLayout.vue'
import DicListSelect from '@/components/ComponentsBase/FormDicListSelect.vue'
import DataTable from '@/components/ComponentsBase/DataTable/index.vue'
import DictTag from '@/components/ComponentsBase/DictTag.vue'
import { courseApi } from '@/api/admin/course/course'

// ==================== Tree 配置 ====================
const treeConfig = {
  dicCode: 'course_catalog',
  title: '分类筛选'
}

// ==================== Action Buttons 配置 ====================
const actionButtons = [
  {
    label: '添加',
    type: 'primary',
    icon: 'Plus',
    click: () => console.log('添加课件')
  },
  {
    label: '修改',
    type: 'warning',
    icon: 'Edit',
    click: () => console.log('修改课件')
  },
  {
    label: '删除',
    type: 'danger',
    icon: 'Delete',
    click: () => console.log('删除课件')
  }
]

// ==================== Table 配置 ====================
const tableColumns = [
  { prop: 'title', label: '课件名称', minWidth: 200 },
  { prop: 'fileType_dictText', label: '课件类型', width: 120 },
  { prop: 'createBy_dictText', label: '创建人', width: 120 },
  { prop: 'createTime', label: '创建时间', width: 180 },
  { prop: 'status_dictText', label: '状态', width: 100 },
  { label: '操作', width: 200, slot: 'action' }
]

const paginationConfig = {
  total: 0,
  current: 1,
  pageSize: 10,
  pageSizeOptions: [10, 20, 30, 50],
  showSizeChanger: true,
  showTotal: true
}

// ==================== State 管理 ====================
const loading = ref(false)
const tableData = ref([])

// ==================== Event Handlers ====================

// 树节点点击处理
const handleTreeChange = (node: any) => {
  console.log('Selected tree node:', node)
  // 可选：自动触发查询
  // setTimeout(() => handleSearch(), 300)
}

// 查询处理
const handleSearch = async (params: any) => {
  loading.value = true
  try {
    const res = await courseApi.getPaging({
      ...params,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    })
    tableData.value = res.records
    paginationConfig.total = res.total
  } finally {
    loading.value = false
  }
}

// 重置处理
const handleReset = () => {
  console.log('Reset form')
  handleSearch({})
}

// 分页变更
const handlePageChange = (current: number, pageSize: number) => {
  paginationConfig.current = current
  paginationConfig.pageSize = pageSize
  handleSearch(queryParams)
}

// 行点击
const handleRowClick = (row: any) => {
  router.push(`/admin/course/file/edit?id=${row.id}`)
}
</script>
```

---

## ⚙️ Props 参数说明

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| treeConfig | object | ❌ | `{ dicCode: '', title: '分类筛选' }` | 树形配置对象 |
| actionButtons | Array | ❌ | `[]` | 操作按钮数组 |
| defaultFields | Array | ❌ | `[]` | 默认筛选字段 |

### treeConfig 详细属性

```typescript
interface TreeConfig {
  dicCode?: string                    // 字典编码 (如: course_catalog)
  title?: string                       // 面板标题 (默认:'分类筛选')
  component?: any                      // 自定义树组件
  props?: Record<string, any>         // 树组件额外属性
}
```

### actionButtons 详细属性

```typescript
interface ActionButton {
  label: string                        // 按钮文字
  type?: 'primary' | 'success' | 'warning' | 'danger'
  icon?: any                           // Element Plus 图标
  props?: Record<string, any>         // 额外属性
  click?: Function                     // 点击事件
}
```

---

## 🔥 Slots 插槽说明

| 插槽名 | 作用域 | 说明 |
|--------|--------|------|
| toolbar | none | 操作工具栏插槽 |
| filters | `{ params: Object }` | 筛选条件插槽 |
| content | `{ listQuery: Object }` | 内容区域插槽 |
| extra | none | 额外内容插槽 |

### slots 使用示例

```vue
<!-- 自定义筛选 -->
<template #filters="{ params }">
  <el-form-item label="关键词">
    <el-input v-model="params.keyword" placeholder="..." />
  </el-form-item>
</template>

<!-- 自定义内容区 -->
<template #content="{ listQuery }">
  <el-table :data="tableData" v-bind="listQuery" />
</template>

<!-- 额外弹窗等 -->
<template #extra>
  <AiPptGenerator v-model="visible" />
</template>
```

---

## 🎨 Events 事件说明

| 事件名 | 回调参数 | 说明 |
|--------|----------|------|
| search | `[params: Object]` | 查询时触发，返回筛选参数 |
| reset | `[]` | 重置时触发 |
| tree-change | `[node: Object]` | 树节点点击时触发 |
| tree-update | `[value: any]` | 树值更新时触发 |
| filter-change | `[params: Object]` | 筛选条件变化时触发 |

---

## 💡 实际应用案例

### 案例 1: 考试题库管理

```vue
<template>
  <FilterTreeLayout 
    :tree-config="{ dicCode: 'exam_question_type', title: '题库分类' }"
    :action-buttons="[{ label: '添加题目', type: 'primary', icon: 'Plus' }]"
    @search="loadQuestions"
  >
    <template #filters="{ params }">
      <el-form-item label="难度">
        <el-select v-model="params.difficulty" placeholder="请选择">
          <el-option label="简单" value="1" />
          <el-option label="中等" value="2" />
          <el-option label="困难" value="3" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="题型">
        <el-select v-model="params.type" placeholder="请选择">
          <el-option label="单选题" value="single" />
          <el-option label="多选题" value="multiple" />
          <el-option label="判断题" value="judge" />
        </el-select>
      </el-form-item>
    </template>
    
    <template #content>
      <el-table :data="questions" :loading="loading">
        <el-table-column prop="content" label="题目内容" min-width="400" />
        <el-table-column prop="type_dictText" label="题型" width="100" />
        <el-table-column prop="difficulty_dictText" label="难度" width="100" />
      </el-table>
    </template>
  </FilterTreeLayout>
</template>
```

### 案例 2: 学员管理列表

```vue
<template>
  <FilterTreeLayout 
    :tree-config="{ dicCode: 'dept_organization', title: '组织架构' }"
    :action-buttons="[
      { label: '添加学员', type: 'primary', icon: 'Plus' },
      { label: '批量导入', type: 'success', icon: 'Upload' },
      { label: '导出', type: 'warning', icon: 'Download' }
    ]"
    @search="loadStudents"
  >
    <template #toolbar>
      <!-- 额外工具按钮 -->
      <el-button type="info" @click="showStatistics">查看统计</el-button>
    </template>
    
    <template #filters="{ params }">
      <el-form-item label="学员姓名">
        <el-input v-model="params.name" clearable />
      </el-form-item>
      
      <el-form-item label="学号">
        <el-input v-model="params.studentId" clearable />
      </el-form-item>
      
      <el-form-item label="入学日期">
        <el-date-picker
          v-model="params.startDate"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
    </template>
    
    <template #content>
      <DataTable 
        :data="students"
        :columns="studentColumns"
        @row-click="handleStudentClick"
      />
    </template>
  </FilterTreeLayout>
</template>
```

---

## 🔧 高级定制方案

### 方案 1: 完全自定义树组件

```vue
<FilterTreeLayout 
  :tree-config="{
    title: '自定义分类',
    component: MyCustomTree
  }"
>
  <!-- 使用方式 -->
  <MyCustomTree
    v-model="selectedCatId"
    :options="customTreeData"
    @change="handleTreeChange"
  />
</FilterTreeLayout>
```

### 方案 2: 动态操作按钮

```vue
<template #toolbar>
  <!-- 动态生成按钮 -->
  <template v-for="btn in dynamicButtons" :key="btn.label">
    <el-button v-bind="btn" @click="btn.click">{{ btn.label }}</el-button>
  </template>
  
  <!-- 手动添加按钮 -->
  <el-button type="primary" icon="Plus" @click="addNew">添加</el-button>
  <el-button type="success" icon="RefreshRight" @click="refresh">刷新</el-button>
</template>
```

### 方案 3: 联动筛选

```javascript
// 在组件中设置联动逻辑
watch(
  () => queryParams.catId,
  (newVal) => {
    // 当树选择改变时，自动加载二级分类
    if (newVal) {
      loadSubCategories(newVal)
    }
  }
)
```

---

## 📊 性能优化建议

1. **懒加载大数据树**: 对于大型树结构，使用异步加载
2. **防抖查询**: 对筛选输入框添加 300ms 防抖
3. **虚拟滚动**: 超过 100 条数据时使用虚拟滚动表
4. **分页缓存**: 使用 localStorage 缓存查询条件

---

## 🎯 总结优势

相比手写布局，本组件的优势:

- ✅ **零代码** - 通过配置即可实现专业布局
- ✅ **高复用** - 所有列表页统一标准
- ✅ **易维护** - 修改一个组件影响所有页面
- ✅ **可扩展** - 插槽机制支持高度定制
- ✅ **响应式** - 自动适配不同屏幕尺寸

---

*快速提升开发效率的核心组件!* 🚀
