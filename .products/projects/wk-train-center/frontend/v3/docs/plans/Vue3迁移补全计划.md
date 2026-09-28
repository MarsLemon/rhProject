# Vue3 迁移补全计划

> 版本：v1.1  作者：AI助手  更新：2026-05-22

---

## 十、ComponentsTable 组件迁移与优化

### 10.1 组件清单

| 组件 | 功能 | 状态 | 说明 |
|------|------|------|------|
| DataTable | 数据表格 | ✅ 完成 | 配置+插槽混合模式、Composable 设计 |
| DataGrid | 卡片网格 | ✅ 完成 | 响应式列数、卡片操作 |
| DetailLink | 详情链接 | ✅ 完成 | target、Tooltip |
| DateTimePicker | 日期选择 | ✅ 完成 | 完整 Props 配置 |
| TimeRangePicker | 时间范围 | ✅ 完成 | 自定义配置支持 |
| Avatar | 头像 | ✅ 完成 | 懒加载、预览 |
| Captcha | 验证码 | ✅ 完成 | 可配置接口 |
| ElTreeSelect | 树形选择 | ✅ 完成 | README 文档 |

### 10.2 设计模式应用

| 组件 | 核心设计模式 | 说明 |
|------|-------------|------|
| DataTable | 策略模式 + 外观模式 | Composable 分离关注点 |
| DataGrid | 组合模式 + 观察者模式 | 子组件可组合、防抖查询 |
| DetailLink | 策略模式 | 权限检查、路由跳转策略 |

### 10.3 DataTable 核心接口

#### ColumnDef 接口（配置列）
```typescript
interface ColumnDef {
  prop: string              // 列唯一标识
  label?: string             // 列标题
  show?: boolean             // 是否显示
  width?: string | number    // 列宽度
  minWidth?: string | number // 最小宽度
  fixed?: 'left' | 'right' // 固定位置
  align?: 'left' | 'center' | 'right'  // 对齐方式
  sortable?: boolean          // 是否可排序
  formatter?: (row, column, cellValue, index) => any  // 格式化函数
  slot?: string              // 自定义插槽名称
  className?: string        // 列类名
  cellClassName?: string    // 单元格类名
}
```

#### RowAction 接口（行操作）
```typescript
interface RowAction {
  key: string               // 按钮唯一标识
  label: string             // 按钮文字
  type?: 'primary' | 'success' | 'warning' | 'danger'
  permission?: string       // 权限标识
  icon?: Component          // 图标组件
  disabled?: boolean | ((row) => boolean)   // 是否禁用
  hidden?: boolean | ((row) => boolean)    // 是否隐藏
  click?: (row, id) => boolean | void   // 点击回调
}
```

### 10.4 DataGrid 核心接口

#### ResponsiveCols 接口（响应式列数）
```typescript
interface ResponsiveCols {
  xs?: number  // <576px
  sm?: number  // ≥576px
  md?: number  // ≥768px
  lg?: number  // ≥992px
  xl?: number  // ≥1200px
}
```

#### CardAction 接口（卡片操作）
```typescript
interface CardAction {
  key: string               // 按钮唯一标识
  label: string             // 按钮文字
  type?: 'primary' | 'success' | 'warning' | 'danger'
  icon?: Component          // 图标组件
  hidden?: boolean | ((item) => boolean)
  click?: (item) => void
}
```

### 10.5 文件结构

```
src/components/ComponentsBase/ComponentsTable/
├── DataTable/
│   ├── DataTable.vue              # 主组件
│   ├── DataTableToolbar.vue       # 工具栏
│   ├── DataTable.styles.scss      # 样式
│   ├── MultiSelectPanel.vue       # 多选面板
│   ├── useTableSelection.ts        # 选择逻辑
│   ├── useTableQuery.ts           # 查询逻辑
│   ├── useTableActions.ts         # 操作逻辑
│   └── README.md                  # 文档
├── DataGrid/
│   ├── index.vue                  # 主组件
│   ├── DataGrid.styles.scss       # 样式
│   └── README.md                  # 文档
└── DetailLink/
    ├── index.vue                  # 主组件
    └── README.md                  # 文档
```

### 10.6 使用示例

#### DataTable 配置列 + 自定义插槽
```vue
<DataTable :options="tableOptions">
  <template #status-cell="{ row, value }">
    <el-tag :type="value === 1 ? 'success' : 'danger'">
      {{ value === 1 ? '启用' : '禁用' }}
    </el-tag>
  </template>
</DataTable>

<script setup>
const tableOptions = {
  listUrl: '/api/list',
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'name', label: '名称' },
    { prop: 'status', label: '状态', slot: 'status-cell' }
  ],
  rowActions: [
    { key: 'edit', label: '编辑', type: 'primary' },
    { key: 'delete', label: '删除', type: 'danger' }
  ]
}
</script>
```

#### DataGrid 响应式 + 卡片操作
```vue
<DataGrid :options="gridOptions" @card-action="onCardAction">
  <template #data-item="{ data }">
    <ProductCard :item="data" />
  </template>
</DataGrid>

<script setup>
const gridOptions = {
  listUrl: '/api/product/list',
  responsiveCols: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
  cardActions: [
    { key: 'edit', label: '编辑', type: 'primary' },
    { key: 'delete', label: '删除', type: 'danger' }
  ]
}
</script>
```

### 10.7 代码审查修复

| 问题 | 修复内容 | 状态 |
|------|----------|------|
| `cellClassName` 未生效 | 补充 `:cell-class-name` 绑定 | ✅ |
| `getCellValue` 返回值不一致 | 统一返回 `result ?? ''` | ✅ |
| `defaultHidden` 未标注 | 标记为「预留字段」 | ✅ |

---

## 一、版本差异对比总览

| 模块 | Vue2 | Vue3 | 状态 |
|------|------|------|------|
| **api/** | 16个目录 | 3层结构 | ✅ 完成 |
| **utils/** | 31个文件 | 13个模块 | ✅ 完成 |
| **directive/** | 10个 | 10个 | ✅ 完成 |
| **bootstrap/** | 7个文件 | 4个文件 | ✅ 完成 |
| **stores/** | 6个(Vuex) | 6个(Pinia) | ✅ 完成 |

---

## 二、API 模块架构

### 2.1 三层角色结构

```
src/api/
├── admin/     # 管理端 API
├── client/    # 学员端 API
├── common/    # 通用 API（无需登录）
├── factory.ts # 工厂模式入口
├── index.ts   # 统一导出
└── types.ts   # 类型定义
```

### 2.2 工厂模式结构

```typescript
admin = {
  course: { course, file, face, live, qa },
  exam: { exam, apply, correct, record, review, watch, reviewPaper, reviewQu },
  paper: { paper, exam, capture },
  plan: { plan, annual, node, stat, user },
  qu: { qu, gen, report },
  repo: { repo, chapter, stat, train },
  ai, stat, sys, notify, tmpl
}

client = {
  activity: { list, client },
  battle: { list, client },
  course: { list, client },
  exam: { list, client, upload },
  plan: { list, client, myPlan },
  qu: { list, fav },
  repo: { list, client },
  dashboard, order, report, survey, train, book, lecturer, paper, process, ai
}

common = { ding }
```

### 2.3 调用方式

| 方式 | 示例 | 推荐度 |
|------|------|--------|
| 直接导入 | `import { getCourseList } from '@/api/admin/course/course'` | ⭐⭐⭐ |
| 工厂模式 | `admin.course.file.getFileList()` | ⭐⭐⭐ |
| 统一入口 | `import { courseApi } from '@/api'` | ⭐⭐ |

---

## 三、API 目录映射

### Vue2 → Vue3 映射

| Vue2 目录 | Vue3 目录 | 状态 |
|-----------|-----------|------|
| ability/ | common/ability/ | ✅ |
| ai/sparring.js | admin/ai/sparring.ts | ✅ |
| ai/apps.js | client/ai/apps.ts | ✅ |
| client/ | client/ | ✅ |
| course/ | admin/course/ | ✅ |
| exam/ | admin/exam/ | ✅ |
| login/ding.js | common/login/ding.ts | ✅ |
| notify/ | admin/notify/ | ✅ |
| paper/ | admin/paper/ | ✅ |
| plan/ | admin/plan/ | ✅ |
| qu/ | admin/qu/ | ✅ |
| repo/ | admin/repo/ | ✅ |
| stat/ | admin/stat/ | ✅ |
| sys/ | admin/sys/ | ✅ |
| tmpl/tmpl.js | admin/template.ts | ✅ |
| training-plan/ | admin/plan/ | ✅ |
| web/ | common/ | ✅ |

### 缺失清单（已全部完成）

| 原目录 | 功能 | 当前状态 |
|--------|------|----------|
| ability/ | 权限相关（captcha, login, sign） | ✅ 已在 common/ability/ |
| tmpl/ | 模板相关 | ✅ 已在 admin/template.ts |
| training-plan/ | 培训计划 | ✅ 已在 admin/plan/ |

---

## 四、Utils 模块

### 4.1 已迁移模块（13个）

| 模块 | 功能 | 状态 |
|------|------|------|
| ai/ | AI 配置 | ✅ |
| auth/ | 认证 | ✅ |
| common/ | 通用工具 | ✅ |
| dom/ | DOM 操作 | ✅ |
| format/ | 格式化 | ✅ |
| image/ | 图片处理 | ✅ |
| index/ | 统一导出 | ✅ |
| log/ | 日志 | ✅ |
| math/ | 数学运算 | ✅ |
| notification/ | 通知 | ✅ |
| storage/ | 存储 | ✅ |
| upload/ | 上传 | ✅ |
| validate/ | 验证 | ✅ |

### 4.2 待确认模块

| 原文件 | 功能 | 状态 |
|--------|------|------|
| echarts-config.js | ECharts配置 | ⚠️ 需安装依赖 |
| portal-switcher.js | 门户切换 | ⚠️ 待评估 |
| sse.js | Server-Sent Events | ⚠️ 待评估 |
| whisper-worker.js | 语音转文字 | ⚠️ 待评估 |

---

## 五、Directive 指令

### 5.1 已迁移（10个）

| 指令 | 功能 | 状态 |
|------|------|------|
| clipboard/ | 剪贴板 | ✅ |
| draggable/ | 拖拽 | ✅ |
| el-drag-dialog/ | 拖拽弹窗 | ✅ |
| el-table/ | 表格增强 | ✅ |
| permission/ | 权限控制 | ✅ |
| sign-html/ | HTML签名 | ✅ |
| waves/ | 波浪效果 | ✅ |
| sticky.ts | 粘性定位 | ✅ |
| trim.ts | 去除空格 | ✅ |
| index.ts | 统一导出 | ✅ |

---

## 六、Bootstrap 模块

### 6.1 已迁移（4个）

| 文件 | 功能 | 状态 |
|------|------|------|
| app-initializer.ts | 应用初始化 | ✅ |
| iframe-communication.ts | iframe通信 | ✅ |
| session-manager.ts | 会话管理 | ✅ |
| index.ts | 统一导出 | ✅ |

### 6.2 缺失清单

| 文件 | 功能 | 状态 |
|------|------|------|
| element.js | Element Plus 按需注册 | ✅ 可选（已全局引入） |

---

## 七、执行进度

### 第一阶段：核心补全 ✅ 完成

- [x] API 三层架构（admin/client/common）
- [x] API 工厂模式（factory.ts）
- [x] API 路径与 Vue2 一致性验证
- [x] Admin 模块完善（course/exam/paper/plan/qu/repo/sys/stat/notify）
- [x] Client 模块完善
- [x] Directive 补全（draggable, sign-html, trim）

### 第二阶段：工具完善 ✅ 完成

- [x] Utils 模块化重构（13个子模块）
- [x] 构建验证通过

### 第三阶段：功能测试 ⏳ 待进行

- [ ] 登录流程测试
- [ ] 权限控制测试
- [ ] 核心业务操作测试

---

## 八、当前状态总结

### ✅ 已完成

| 模块 | 说明 |
|------|------|
| API 架构 | 三层角色 + 工厂模式 |
| API 目录 | admin/client/common 分层 |
| factory.ts | 完整模块注册 |
| README.md | API 使用文档 |
| utils/ | 13个模块完成 |
| directive/ | 10个指令完成 |
| bootstrap/ | 基础结构完成 |
| stores/ | Pinia 迁移完成 |

### ⚠️ 待处理

| 模块 | 说明 | 优先级 |
|------|------|--------|
| web/repo 训练 UI | QuItemTrain/QuMarkItem 未迁移，WebTrainStart 为简化版 | 高 |
| echarts | 需 `npm install echarts` | 低 |
| dompurify | sign-html 需安装 | 中 |
| 功能测试 | 核心流程验证 | 中 |

### ✅ 学员端 web/repo（2026-05-30 更新）

| 项目 | 状态 |
|------|------|
| 路由 8 条 | ✅ 已启用 |
| 列表/详情/记录页 | ✅ 已迁移 |
| train/book/repo API | ✅ 已封装 |
| 完整训练答题 UI | ❌ 待迁移 QuItemTrain 等 |

详见 [知识库模块 Vue3 实现说明](../20260530-知识库模块-Vue3实现说明.md)

---

## 九、相关文档

| 文档 | 说明 |
|------|------|
| [API README](../src/api/README.md) | API 模块使用说明 |
| [API 详细对比](Vue2-Vue3-API详细对比.md) | API 逐项对比 |
| [知识库模块 Vue3 实现说明](../20260530-知识库模块-Vue3实现说明.md) | repo/刷题训练模块说明 |

---

*最后更新：2026-05-30*