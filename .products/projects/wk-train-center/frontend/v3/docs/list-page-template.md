# WK-Train-Center-V3 列表页面完整模板

## 📋 概述

这是 **wk-train-center-ui-v3** 项目中最常用的列表页面布局方案，包含：
- 左侧树形分类选择器
- 顶部筛选搜索区域  
- 数据表格 + 分页功能
- 导出/导入业务按钮
- 权限控制的操作按钮

---

## 🏗️ 核心组件

| 组件 | 作用 | 位置 |
|------|------|------|
| **DataTable** | 数据表格（自动分页、批量操作） | `@/components/ComponentsBase` |
| **DicTree** | 字典树形选择器 | `@/components/ComponentsBase` |
| **DicListSelect** | 字典下拉选择 | `@/components/ComponentsBase` |
| **DetailLink** | 详情链接跳转 | `@/components/ComponentsBase` |
| **ExportButton** | 导出按钮 | `@/components/ComponentsBase` |
| **ImportButton** | 导入按钮 | `@/components/ComponentsBase` |

---

## 💻 完整模板代码

```vue
<template>
  <div>
    <!-- 
      ============== 左右布局（有分类筛选） ==============
    -->
    <el-row :gutter="16">
      
      <!-- 左侧：树形分类 (5 列宽) -->
      <el-col :span="5" style="height: calc(100vh - 120px)">
        <el-card shadow="hover">
          <template #header>
            <span><el-icon><Folder /></el-icon>分类筛选</span>
          </template>
          <DicTree 
            ref="treeRef" 
            v-model="listQuery.params.catId" 
            dic-code="your_catalog_code" 
          />
        </el-card>
      </el-col>
      
      <!-- 右侧：主内容区 (19 列宽) -->
      <el-col :span="19" style="height: calc(100vh - 120px); overflow-y: auto">
        
        <!-- 顶部工具栏和筛选区 -->
        <el-card shadow="never" class="mb-8">
          
          <!-- ========== 操作按钮行 ========== -->
          <div class="action-toolbar">
            
            <!-- AI 生成按钮 (可选) -->
            <el-button
              v-permission="['your:feature']"
              type="primary"
              :icon="MagicStick"
              @click="showAiGenerator"
            >
              AI 生成
            </el-button>
            
            <!-- 添加按钮 -->
            <el-button type="success" :icon="Plus" @click="handleAdd">
              添加
            </el-button>
            
            <!-- 修改按钮 -->
            <el-button type="warning" :icon="Edit" @click="handleMultiEdit">
              修改
            </el-button>
            
            <!-- 删除按钮 -->
            <el-button type="danger" :icon="Delete" @click="handleBatchDelete">
              删除
            </el-button>
            
            <!-- 批量导出 -->
            <ExportButton 
              api="/api/your-module/export"
              :params="listQuery.params"
              @data-back="refreshList"
            />
            
            <!-- 批量导入 -->
            <ImportButton 
              template-url="template.xlsx"
              template-name="导入模板.xlsx"
              @upload-data-back="handleImport"
            />
          </div>

          <!-- ========== 筛选条件行 ========== -->
          <el-form :inline="true" :model="listQuery.params">
            
            <!-- 1. 字典下拉选择 -->
            <el-form-item label="类型">
              <DicListSelect 
                v-model="listQuery.params.type" 
                dic-code="your_type_dict" 
                placeholder="全部类型"
                size="default"
                style="width: 140px"
              />
            </el-form-item>
            
            <!-- 2. 状态选择 -->
            <el-form-item label="状态">
              <DicListSelect 
                v-model="listQuery.params.state" 
                dic-code="your_state_dict" 
                placeholder="全部状态"
                size="default"
                style="width: 140px"
              />
            </el-form-item>
            
            <!-- 3. 文本搜索框 -->
            <el-form-item label="名称">
              <el-input
                v-model="listQuery.params.title"
                placeholder="输入关键字搜索"
                clearable
                prefix-icon="Search"
                style="width: 200px"
              />
            </el-form-item>
            
            <!-- 4. 时间范围选择 -->
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="listQuery.params.startTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetime"
                placeholder="开始时间"
                size="default"
                style="width: 200px"
              />
              ~
              <el-date-picker
                v-model="listQuery.params.endTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetime"
                placeholder="结束时间"
                size="default"
                style="width: 200px"
              />
            </el-form-item>
            
            <!-- 5. 查询 / 重置按钮 -->
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleTableReset">
                搜索
              </el-button>
              <el-button :icon="RefreshRight" @click="handleTableReset">
                重置
              </el-button>
            </el-form-item>
            
          </el-form>
          
        </el-card>

        <!-- ========== 数据表格 ========== -->
        <DataTable
          ref="pagingTableRef"
          :options="options"
          :list-query="listQuery"
          @reset="handleTableReset"
          @add="handleAdd"
          @edit="handleEdit"
          @multi-actions="handleMultiActions"
          @delete="handleDeleteConfirm"
        >
          <template #data-columns>
            
            <!-- ① 序号列 -->
            <el-table-column label="#" type="index" width="60" align="center" />
            
            <!-- ② ID 列 -->
            <el-table-column label="ID" prop="id" width="100" align="center" />
            
            <!-- ③ 文本列（可链接）-->
            <el-table-column label="名称" prop="title" min-width="200" show-overflow-tooltip>
              <template #default="scope">
                <DetailLink
                  :id="scope.row.id"
                  :title="scope.row.title"
                  permission="your:update"
                  @click="handleEdit(scope.row)"
                />
              </template>
            </el-table-column>
            
            <!-- ④ 字典值显示 -->
            <el-table-column label="类型" prop="type_dictText" align="center" width="120" />
            
            <!-- ⑤ 自定义状态标签 -->
            <el-table-column label="状态" prop="state_dictText" align="center" width="100">
              <template #default="scope">
                <el-tag :type="getStateTagType(scope.row.state)">
                  {{ scope.row.state_dictText }}
                </el-tag>
              </template>
            </el-table-column>
            
            <!-- ⑥ 创建信息 -->
            <el-table-column label="创建人" prop="createBy_dictText" align="center" width="100" />
            <el-table-column label="创建时间" prop="createTime" align="center" width="160" />
            
            <!-- ⑦ 操作列 -->
            <el-table-column label="操作" fixed="right" align="center" width="200">
              <template #default="scope">
                <el-button
                  v-permission="['your:update']"
                  type="primary"
                  text
                  bg
                  size="small"
                  @click="handleEdit(scope.row)"
                >
                  编辑
                </el-button>
                
                <el-button
                  v-permission="['your:delete']"
                  type="danger"
                  text
                  bg
                  size="small"
                  @click="handleDeleteConfirm(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
            
          </template>
        </DataTable>
        
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Search, RefreshRight, Edit, Delete, MagicStick, Folder 
} from '@element-plus/icons-vue'
import { 
  DataTable, DicTree, DicListSelect, DetailLink,
  ExportButton, ImportButton
} from '@/components/ComponentsBase'

defineOptions({ name: 'YourModuleList' })

const router = useRouter()
const pagingTableRef = ref<InstanceType<typeof DataTable> | null>(null)
const treeRef = ref<InstanceType<typeof DicTree> | null>(null)

// ========== 查询参数配置 ==========
const listQuery = ref({
  current: 1,           // 当前页码
  size: 10,            // 每页条数
  params: {
    catId: '',         // 分类 ID（来自树）
    type: '',          // 类型筛选
    state: '',         // 状态筛选
    title: '',         // 名称搜索
    startTime: '',     // 开始时间
    endTime: ''        // 结束时间
  } as Record<string, unknown>
})

// ========== 表格配置选项 ==========
const options = {
  multi: true,  // 是否开启多选
  
  // 添加配置
  add: { 
    enable: true, 
    permission: 'your:add',
    router: { name: 'YourForm' }
  },
  
  // 编辑配置
  edit: { 
    enable: true, 
    permission: 'your:update',
    router: { name: 'YourForm', query: { id: '$id' } }
  },
  
  // 删除配置
  delete: { 
    enable: true, 
    permission: 'your:delete',
    url: '/api/your-module/delete'
  },
  
  // 列表接口地址
  listUrl: '/api/your-module/paging'
}

// ========== 方法定义 ==========

// 1. 刷新/重置列表
function handleTableReset() {
  pagingTableRef.value?.getList()
}

// 2. 点击添加按钮
function handleAdd() {
  router.push({ name: 'YourForm' })
}

// 3. 点击编辑按钮
function handleEdit(row: any) {
  router.push({ 
    name: 'YourForm', 
    query: { id: row.id } 
  })
}

// 4. 批量删除确认
async function handleDeleteConfirm(row: any) {
  try {
    await ElMessageBox.confirm('确定删除该记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 调用删除 API（需要从后端获取真实接口）
    const res = await deleteApi(row.id)
    if (res.code === '200') {
      ElMessage.success('删除成功')
      handleTableReset()
    }
  } catch {
    // 用户取消删除
  }
}

// 5. 批量操作回调
function handleMultiActions(action: string, rows: any[]) {
  switch (action) {
    case 'export':
      // 导出逻辑由 ExportButton 自动处理
      break
      
    case 'import':
      // 导入逻辑由 ImportButton 自动处理
      break
      
    case 'batch-delete':
      // 批量删除多行
      ElMessageBox.confirm(`确定删除选中的 ${rows.length} 条记录吗？`, '提示', {
        type: 'warning'
      }).then(async () => {
        const ids = rows.map((r: any) => r.id)
        const res = await batchDeleteApi(ids)
        if (res.code === '200') {
          ElMessage.success('批量删除成功')
          handleTableReset()
        }
      })
      break
      
    default:
      console.log('未处理的批量操作:', action)
  }
}

// 6. 刷新列表（供子组件或弹窗调用）
function refreshList() {
  pagingTableRef.value?.getList()
}

// 7. 获取状态标签颜色
function getStateTagType(state: number): string {
  const map: Record<number, string> = {
    0: 'success',   // 正常 → 绿色
    1: 'warning',   // 审核中 → 橙色
    2: 'danger',    // 禁用 → 红色
    3: 'info'       // 其他 → 灰色
  }
  return map[state] || 'info'
}

// 8. 显示 AI 生成弹窗（示例）
function showAiGenerator() {
  // TODO: 打开 AI 生成对话框
  ElMessage.info('AI 生成功能开发中...')
}

// 9. 处理导入成功
function handleImport(file: File) {
  // TODO: 上传文件到服务器并解析
  ElMessage.success(`文件 ${file.name} 已准备好`)
}

// 10. 批量修改
function handleMultiEdit() {
  const selected = pagingTableRef.value?.getSelection()
  if (!selected || selected.length === 0) {
    ElMessage.warning('请先选择要编辑的记录')
    return
  }
  if (selected.length !== 1) {
    ElMessage.error('只能选中一条记录进行编辑')
    return
  }
  router.push({ 
    name: 'YourForm', 
    query: { id: selected[0].id } 
  })
}

// ========== 生命周期钩子 ==========

onActivated(() => {
  // Vue KeepAlive 激活时刷新列表
  pagingTableRef.value?.refresh()
})
</script>

<style scoped>
/* 底部间距 */
.mb-8 {
  margin-bottom: 32px;
}

/* 操作按钮组 */
.action-toolbar {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  margin-bottom: 8px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .action-toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
```

---

## 🔧 使用指南

### 1. **快速替换字段**

将以下内容替换为你的实际模块：

| 占位符 | 说明 | 示例 |
|--------|------|------|
| `your:module` | 模块权限标识 | `course:file` |
| `your_catalog_code` | 分类字典编码 | `course_catalog` |
| `your_type_dict` | 类型字典编码 | `course_file_type` |
| `/api/your-module/xxx` | API 接口地址 | `/api/course/file/paging` |
| `YourForm` | 表单页面路由名 | `AdminCourseFileForm` |

### 2. **API 接口规范**

确保后端接口符合以下格式：

```typescript
// 列表接口：返回分页数据
GET /api/your-module/paging
→ { code: '200', data: { list: [], total: 100 } }

// 删除接口：单个删除
POST /api/your-module/delete
→ { code: '200', msg: '删除成功' }

// 批量删除接口（可选）
POST /api/your-module/batch-delete
→ body: { ids: [1, 2, 3] }
→ { code: '200' }
```

### 3. **权限配置**

在 `permission` 属性中指定：

```javascript
{
  permission: 'your:add'      // 需要拥有 your:add 权限才显示
}
```

权限需要在后端菜单配置中预先定义。

---

## 🎯 参考示例

实际使用的页面：
- `src/views/admin/course/file.vue` - 课件管理
- `src/views/admin/exam/exam/index.vue` - 考试管理
- `src/views/admin/plan/index.vue` - 计划管理

这些页面都使用了相同的核心组件模式，可以参考它们的实现细节。

---

## ⚙️ 组件 Props 详解

### DataTable 组件
```typescript
interface DataTableProps {
  // 表格配置选项
  options: {
    multi: boolean                        // 多选开关
    add: { enable: boolean; permission?: string; router?: object }
    edit: { enable: boolean; permission?: string; router?: object }
    delete: { enable: boolean; permission?: string; url?: string }
    listUrl: string                       // 列表接口
  }
  
  // 查询参数
  listQuery: {
    current: number                      // 当前页
    size: number                         // 每页条数
    params: Record<string, any>          // 查询条件
  }
}
```

### Emit Events
```typescript
events: {
  'reset': []                             // 重置查询
  'add': []                               // 点击添加
  'edit': [row: any]                      // 点击编辑
  'multi-actions': [action: string, rows: any[]]  // 批量操作
  'delete': [row: any]                    // 点击删除
}
```

---

## 📌 注意事项

1. **v-model 绑定**：所有 FormComponent 现在使用 `modelValue` + `update:modelValue`，而非 `value`
2. **响应式高度**：左右面板高度使用 `calc(100vh - 120px)` 适配浏览器
3. **KeepAlive 支持**：使用 `onActivated` 钩子确保页面切换后刷新数据
4. **懒加载图标**：Vue 3 必须从 `@element-plus/icons-vue` 导入图标组件
5. **TypeScript 类型**：建议为 `listQuery` 和 `options` 定义接口类型

---

## 🔄 v2 → v3 迁移要点

| Vue 2 | Vue 3 |
|-------|-------|
| `this.$refs.xxx` | `xxxRef.value` |
| `this.$message` | `ElMessage` |
| `this.$confirm` | `ElMessageBox.confirm` |
| `:visible.sync` | `v-model="visible"` |
| `<div slot="footer">` | `<template #footer>` |
| `el-icon-document` 字符串 | `<DocumentIcon />` 组件 |
| `created()` | `onMounted()` |
| `activated()` | `onActivated()` |

---

*最后更新：2026-08-11*  
*版本：V3.0*
