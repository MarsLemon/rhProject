# wk-customer-pricing 数据模型（Schema）分类与目录重构计划

> 面向 **Apifox 项目 8869726（客户定价系统）** 数据模型区的目录重构方案。
> 与 `docs/api/README.md` 中五个对接模块（equipment-category / manufacturer / equipment+model / pricing-coefficient + 通用）一一对齐。
> 与 Apifox 端 4 个接口一级目录（设备分类 / 设备与型号 / 制造厂家 / 服务信息与影响系数）一一对齐。

**维护人**：根据 git config `user.name` 自动获取
**创建时间**：2026-09-23 10:57（北京时间）
**最近一次 schema 全量盘点**：2026-09-23，调用 apifox-mcp `getStructureInfo` 取得 total=112

---

## 一、目标目录结构

| 序 | 目标 schema 目录 | 对应接口一级目录（folderId） | 对应文档目录 | 期望入模数量 |
|----|------------------|-----------------------------|--------------|--------------|
| A | **设备分类** | 设备分类 (96532454) | `docs/api/equipment-category/` | 22 |
| B | **设备与型号** | 设备与型号 (96532529) | `docs/api/equipment/` + `docs/api/model/` | 26 |
| C | **制造厂家** | 制造厂家 (96532682) | `docs/api/manufacturer/` | 14 |
| D | **服务信息与影响系数** | 服务信息与影响系数 (96532734) | `docs/api/pricing-coefficient/` | 46 |
| E | **通用** | — | — | 4 |
| **合计** | | | | **112** |

校验：A(22) + B(26) + C(14) + D(46) + E(4) = **112**（与 `getStructureInfo` 返回 `total: 112` 完全吻合）

---

## 二、当前状态盘点

| 现存 schema 目录（folderId） | 当前内容 | 处理 |
|---|---|---|
| 设备 (21348516) | 316333112 EquipmentAddVo / 316333121 EquipmentCreateDto / 316333123 EquipmentVo / **316333113 EquipmentCategoryAddVo（错位）** | 重命名为「设备与型号」+ 把 113 号迁出到 A |
| 厂家 (21348531) | 空 | 重命名为「制造厂家」 |
| 通用 (21348539) | 空 | 保留「通用」 |

需新建 2 个目录：A 设备分类、D 服务信息与影响系数。

---

## 三、分类依据与边界规则

1. **以"字段语义归属"为分类依据**，不看字段命名里的 `Portal` 前缀（前台端口径也是该模块的出参）。
3. **响应包装器 `RespVo<T>` / `RespVo«T»` 跟随被包装类型**。特例：4 个无泛型实参的纯壳 → 归 E 通用。
4. **`PricingCoefficientComposeVo`** 三系数（leadTime × location × urgency）合成结果 → 归 D 影响系数（R-41 max 合成、IN-INQ-06 提交快照同源）。
5. **`.x-apifox-orders` / 中文 description 仅作交叉验证**，主依据是 schema 名称中的业务前缀。
6. **不影响接口契约**：纯目录整理，不动 schema 名称、字段、引用关系。

---

## 四、A. 设备分类（22 个）

**业务**：设备分类树维护、前台设备分类导航（含 `PortalEquipmentNavTreeVo`——节点内嵌该分类叶子下的设备列表，但本身是分类导航结构，归属分类侧）。

| 序号 | entityId | schema 名称 |
|---|---|---|
| 1 | 316333113 | EquipmentCategoryAddVo |
| 2 | 316333114 | EquipmentCategoryChangeStatusDto |
| 3 | 316333115 | EquipmentCategoryCreateDto |
| 4 | 316333116 | EquipmentCategoryDetailVo |
| 5 | 316333117 | EquipmentCategoryRenameDto |
| 6 | 316333118 | EquipmentCategorySortDto |
| 7 | 316333119 | EquipmentCategoryTreeNodeVo |
| 8 | 316333145 | PortalEquipmentCategoryPathVo |
| 9 | 316333146 | PortalEquipmentCategoryTreeNodeVo |
| 10 | 316333147 | PortalEquipmentNavTreeVo |
| 11 | 316333154 | RespVoEquipmentCategoryAddVo |
| 12 | 316333155 | RespVoEquipmentCategoryDetailVo |
| 13 | 316333158 | RespVoListEquipmentCategoryTreeNodeVo |
| 14 | 316333163 | RespVoListPortalEquipmentCategoryPathVo |
| 15 | 316333164 | RespVoListPortalEquipmentCategoryTreeNodeVo |
| 16 | 316333165 | RespVoListPortalEquipmentNavTreeVo |
| 17 | 316427336 | RespVo«EquipmentCategoryAddVo» |
| 18 | 316427337 | RespVo«EquipmentCategoryDetailVo» |
| 19 | 316427340 | RespVo«List«EquipmentCategoryTreeNodeVo»» |
| 20 | 316427345 | RespVo«List«PortalEquipmentCategoryPathVo»» |
| 21 | 316427346 | RespVo«List«PortalEquipmentCategoryTreeNodeVo»» |
| 22 | 316427347 | RespVo«List«PortalEquipmentNavTreeVo»» |

---

## 五、B. 设备与型号（26 个）

**业务**：设备字典维护、型号字典维护（含型号-厂家多对多 IN-EQ-04）、前台设备按分类列表、前台型号下拉。

| 序号 | entityId | schema 名称 |
|---|---|---|
| 1 | 316333112 | EquipmentAddVo |
| 2 | 316333120 | EquipmentChangeStatusDto |
| 3 | 316333121 | EquipmentCreateDto |
| 4 | 316333122 | EquipmentRenameDto |
| 5 | 316333123 | EquipmentVo |
| 6 | 316333137 | ModelAddVo |
| 7 | 316333138 | ModelChangeEquipmentDto |
| 8 | 316333139 | ModelChangeStatusDto |
| 9 | 316333140 | ModelCreateDto |
| 10 | 316333141 | ModelDetailVo |
| 11 | 316333142 | ModelRenameDto |
| 12 | 316333143 | ModelUpdateManufacturersDto |
| 13 | 316333144 | PortalEquipmentByCategoryVo |
| 14 | 316333149 | PortalModelVo |
| 15 | 316333153 | RespVoEquipmentAddVo |
| 16 | 316333156 | RespVoEquipmentVo |
| 17 | 316333162 | RespVoListPortalEquipmentByCategoryVo |
| 18 | 316333167 | RespVoListPortalModelVo |
| 19 | 316333176 | RespVoModelAddVo |
| 20 | 316333177 | RespVoModelDetailVo |
| 21 | 316427335 | RespVo«EquipmentAddVo» |
| 22 | 316427338 | RespVo«EquipmentVo» |
| 23 | 316427344 | RespVo«List«PortalEquipmentByCategoryVo»» |
| 24 | 316427349 | RespVo«List«PortalModelVo»» |
| 25 | 316427358 | RespVo«ModelAddVo» |
| 26 | 316427359 | RespVo«ModelDetailVo» |

---

## 六、C. 制造厂家（14 个）

**业务**：厂家字典维护、型号-厂家关联、前台启用厂家下拉。

| 序号 | entityId | schema 名称 |
|---|---|---|
| 1 | 316333130 | ManufacturerAddVo |
| 2 | 316333131 | ManufacturerChangeStatusDto |
| 3 | 316333132 | ManufacturerCreateDto |
| 4 | 316333133 | ManufacturerLinkDto |
| 5 | 316333134 | ManufacturerLinkVo |
| 6 | 316333135 | ManufacturerRenameDto |
| 7 | 316333136 | ManufacturerVo |
| 8 | 316333148 | PortalManufacturerVo |
| 9 | 316333161 | RespVoListManufacturerVo |
| 10 | 316333166 | RespVoListPortalManufacturerVo |
| 11 | 316333175 | RespVoManufacturerAddVo |
| 12 | 316427343 | RespVo«List«ManufacturerVo»» |
| 13 | 316427348 | RespVo«List«PortalManufacturerVo»» |
| 14 | 316427357 | RespVo«ManufacturerAddVo» |

---

## 七、D. 服务信息与影响系数（46 个）

**业务**：服务地点维护、紧急程度维护、地点影响系数维护、时间影响系数维护、计价参数维护、D16/D17 合成影响系数 R-41。

| 序号 | entityId | schema 名称 | 子域 |
|---|---|---|---|
| 1 | 316333124 | LeadTimeCoefficientCreateDto | 时间系数 |
| 2 | 316333125 | LeadTimeCoefficientUpdateDto | 时间系数 |
| 3 | 316333126 | LeadTimeCoefficientVo | 时间系数 |
| 4 | 316333127 | LocationCoefficientCreateDto | 地点系数 |
| 5 | 316333128 | LocationCoefficientUpdateDto | 地点系数 |
| 6 | 316333129 | LocationCoefficientVo | 地点系数 |
| 7 | 316333150 | PricingCoefficientComposeVo | 三系数合成 K |
| 8 | 316333151 | PricingParamUpdateDto | 计价参数 |
| 9 | 316333152 | PricingParamVo | 计价参数 |
| 10 | 316333184 | ServiceLocationCreateDto | 服务地点 |
| 11 | 316333185 | ServiceLocationTreeBo | 服务地点 |
| 12 | 316333186 | ServiceLocationTreeVo | 服务地点 |
| 13 | 316333187 | ServiceLocationUpdateDto | 服务地点 |
| 14 | 316333188 | ServiceLocationVo | 服务地点 |
| 15 | 316333189 | UrgencyLevelBo | 紧急程度 |
| 16 | 316333190 | UrgencyLevelCreateDto | 紧急程度 |
| 17 | 316333191 | UrgencyLevelUpdateDto | 紧急程度 |
| 18 | 316333192 | UrgencyLevelVo | 紧急程度 |
| 19 | 316333157 | RespVoLeadTimeCoefficientVo | 时间系数 |
| 20 | 316333159 | RespVoListLeadTimeCoefficientVo | 时间系数 |
| 21 | 316333160 | RespVoListLocationCoefficientVo | 地点系数 |
| 22 | 316333168 | RespVoListPricingParamVo | 计价参数 |
| 23 | 316333169 | RespVoListServiceLocationTreeBo | 服务地点 |
| 24 | 316333170 | RespVoListServiceLocationTreeVo | 服务地点 |
| 25 | 316333171 | RespVoListServiceLocationVo | 服务地点 |
| 26 | 316333172 | RespVoListUrgencyLevelBo | 紧急程度 |
| 27 | 316333173 | RespVoListUrgencyLevelVo | 紧急程度 |
| 28 | 316333174 | RespVoLocationCoefficientVo | 地点系数 |
| 29 | 316333178 | RespVoPricingCoefficientComposeVo | 三系数合成 K |
| 30 | 316333179 | RespVoPricingParamVo | 计价参数 |
| 31 | 316333180 | RespVoServiceLocationVo | 服务地点 |
| 32 | 316333181 | RespVoUrgencyLevelVo | 紧急程度 |
| 33 | 316427339 | RespVo«LeadTimeCoefficientVo» | 时间系数 |
| 34 | 316427341 | RespVo«List«LeadTimeCoefficientVo»» | 时间系数 |
| 35 | 316427342 | RespVo«List«LocationCoefficientVo»» | 地点系数 |
| 36 | 316427350 | RespVo«List«PricingParamVo»» | 计价参数 |
| 37 | 316427351 | RespVo«List«ServiceLocationTreeBo»» | 服务地点 |
| 38 | 316427352 | RespVo«List«ServiceLocationTreeVo»» | 服务地点 |
| 39 | 316427353 | RespVo«List«ServiceLocationVo»» | 服务地点 |
| 40 | 316427354 | RespVo«List«UrgencyLevelBo»» | 紧急程度 |
| 41 | 316427355 | RespVo«List«UrgencyLevelVo»» | 紧急程度 |
| 42 | 316427356 | RespVo«LocationCoefficientVo» | 地点系数 |
| 43 | 316427360 | RespVo«PricingCoefficientComposeVo» | 三系数合成 K |
| 44 | 316427361 | RespVo«PricingParamVo» | 计价参数 |
| 45 | 316427362 | RespVo«ServiceLocationVo» | 服务地点 |
| 46 | 316427363 | RespVo«UrgencyLevelVo» | 紧急程度 |

---

## 八、E. 通用（4 个）

| 序号 | entityId | schema 名称 | 说明 |
|---|---|---|---|
| 1 | 316348030 | RespVoBoolean | 通用 Boolean 响应包装 |
| 2 | 316348031 | RespVo? | 名称异常（带问号），建议重命名为 `RespVoObject` |
| 3 | 316333182 | RespVo«boolean» | 与 316348030 同义，建议合并 |
| 4 | 316333183 | RespVo«object» | 通用对象响应包装 |

---

## 九、命名重复/同义 schema 提醒（共 18 对，去重建议独立 task）

由于 Apifox 历史导入过程产生了**两套命名规范的同名模型**，建议后续发起一次独立清理任务（不在本次目录整理范围内）：

| 旧式命名（316333xxx） | 新式命名（316427xxx） | 数量 |
|---|---|---|
| `RespVo<X>` | `RespVo«X»` | 18 对 |

> 同名不同实体的例外：`RespVoListServiceLocationTreeBo` (316333169) 与 `RespVoListServiceLocationTreeVo` (316333170) **不是重复**，分别包装 `ServiceLocationTreeBo` 与 `ServiceLocationTreeVo`，不可合并。

---

## 十、人工执行清单（Apifox UI 操作手册）

> ⚠️ 这一步必须在 Apifox Web 端手动完成，因为 apifox-mcp 不支持 schema 文件夹创建/移动/重命名（实测结果）。

### 第 1 步：清理/新建文件夹

1.1 在 Apifox 数据模型区右键 → 新建文件夹，依次创建：
- `设备分类`（模块 ID 8623100）
- `设备与型号`（模块 ID 8623100）
- `制造厂家`（模块 ID 8623100）
- `服务信息与影响系数`（模块 ID 8623100）
- `通用`（模块 ID 8623100）

1.2 现存目录处理：
- 把 `设备 (21348516)` **重命名**为 `设备与型号`
- 把 `厂家 (21348531)` **重命名**为 `制造厂家`
- 把 `通用 (21348539)` 保留（继续使用同名文件夹）

### 第 2 步：错位模型迁移（仅 1 个）

- 把 `设备 (21348516)` 中的 **316333113 EquipmentCategoryAddVo** 拖入新建的 `设备分类`

### 第 3 步：批量归位

按本文档第四至八节中的 entityId 列表，使用 Apifox 数据模型区的**多选 + 拖拽**：
- 选中第四节 22 个 entityId → 拖入 `设备分类`
- 选中第五节 26 个 entityId → 拖入 `设备与型号`
- 选中第六节 14 个 entityId → 拖入 `制造厂家`
- 选中第七节 46 个 entityId → 拖入 `服务信息与影响系数`
- 选中第八节 4 个 entityId → 拖入 `通用`

> Apifox 数据模型列表默认按 `updatedAt desc` 排序，可结合关键字筛选后多选拖拽（如筛选 `EquipmentCategory` 一并归 A）。

### 第 4 步：验收

执行以下校验脚本（任何 MCP 客户端可用）：

```bash
# 期望每个目录返回对应数量
getStructureInfo(entityType=schema, folderId=<新目录ID>)
# A 设备分类 → 22
# B 设备与型号 → 26
# C 制造厂家 → 14
# D 服务信息与影响系数 → 46
# E 通用 → 4
```

或运行 `apifox-mcp`：

```text
getStructureInfo projectId=8869726 entityType=schema folderId=<A-新ID>
getStructureInfo projectId=8869726 entityType=schema folderId=<B-新ID>
getStructureInfo projectId=8869726 entityType=schema folderId=<C-新ID>
getStructureInfo projectId=8869726 entityType=schema folderId=<D-新ID>
getStructureInfo projectId=8869726 entityType=schema folderId=<E-新ID>
```

### 第 5 步：交付后续

- 在 `docs/plans/README.md` 看板追加一行：`Apifox schema 5 类目录重构 ✅`
- 视情况对 18 对 `RespVo<X>` / `RespVo«X»` 重复发起去重任务（独立 task，本次不动 schema 字段）

---

## 十一、变更文件清单

- 新建 `docs/api/schema-classification.md`（本文档）
- 不修改任何 `.java`、不修改任何 `docs/api/*/*.md`、不修改 schema 内容（纯目录整理）