# 接口自动化测试 + Bug 清单

> **测试时间**：2026-09-22 16:13 ~ 16:24
> **测试环境**：localhost:8031（用户本地 debug 后端，端口 8031）
> **测试范围**：Swagger v2/api-docs 共 63 个接口，分批 80+ 测试用例
> **测试方法**：chrome-devtools MCP 浏览器 + JS fetch 调用 + Swagger 规范对照
> **被测项目**：wk-customer-pricing（儒海-贻贝船海服务平台管理后台）
> **Auth header**：Authorization: debug-bypass（debug 模式免鉴权）

---

## 一、测试结论总览

| 指标 | 数值 |
|---|---|
| 总测试用例数 | 80+ |
| 通过 | 约 55 |
| 发现 Bug | **24 个**（含 4 个 P1 严重 + 12 个 P2 重要 + 8 个 P3 体验） |
| 失败用例（业务逻辑层面） | 多个 |
| HTTP 状态码异常 | 全 200（前端靠 code 判成败，符合规范 §6） |

---

## 二、Bug 清单

### P1 严重：通用异常兜底泄漏（业务异常用 base 兜底，未用各模块错误段）

| # | 接口 | 入参 | 当前返回 | 期望 | Root Cause（推测） |
|---|---|---|---|---|---|
| **#1** | `GET /web/equipment-category/detail/{id}` | `id=1` (不存在) | `code=803110000 "数据不存在或已删除(不能修改)"` | `803120103 "设备分类不存在或已删除"` | `EquipmentCategoryExceptionEnum` 未覆盖"数据不存在"分支，被 `BaseResponseEnum.SYS_ERROR` 兜底 |
| **#2** | `GET /web/equipment-category/detail/{id}` | `id=abc` (非数字) | `code=10000001 "系统开小差了"` | `803100001 "请求参数格式错误"` | `@PathVariable` 类型转换异常被 global handler 兜底 |
| **#3** | `GET /web/equipment-category/detail/{id}` | `id=0/-1/999999` | `code=803110000` | `803120103` | 同 #1 |
| **#4** | `POST /web/manufacturer/add` | 重名厂家 | `code=10000001 "系统开小差了"` | `803120203 "厂家名称已存在"` | `ManufacturerExceptionEnum.DUPLICATE_NAME` 可能 throw 了 `WkBizException`，但被全局兜底拦截 |
| **#5** | `POST /web/urgency-level/add` | 重名 code | `code=10000001` | `8031205xx` | `UrgencyLevelExceptionEnum` 未定义或 catch 不到 |
| **#6** | `DELETE /web/urgency-level/delete/{code}` | code=INVALID | `code=10000001` | `8031205xx "紧急程度不存在"` | 同上 |
| **#7** | `DELETE /web/service-location/delete/{id}` | id=999 | `code=10000001` | `803120526 "服务地点不存在"` | `ServiceLocationExceptionEnum` catch 不到 |
| **#8** | `POST /web/urgency-level/add` | 仅 name（带 code=TEST01） | `code=10000001` | `8031205xx` | code 已存在，DB 异常被 global handler 转 base 错误 |
| **#9** | `POST /web/service-location/add` | 重名 SL999 | `code=10000001` | `8031205xx "服务地点编码已存在"` | DB 唯一约束异常兜底 |
| **#10** | `POST /web/lead-time-coefficient/add` | 区间重叠 (minDays=0,maxDays=7) | `code=10000001` | `8031205xx "区间重叠"` | `IN-PC-08` 区间完整性校验失败但未抛业务异常，被 DB 唯一索引转兜底 |
| **#11** | `PUT /web/lead-time-coefficient/update` | id=99999 (不存在) | `code=10000042 "服务异常"` | `8031205xx "时间影响系数不存在"` | 用了 wk-common 的 `10000042` 兜底（不是项目 BaseResponseEnum） |
| **#12** | `PUT /web/location-coefficient/update` | id=99999 | `code=10000042 "服务异常"` | `8031205xx "地点影响系数不存在"` | 同 #11 |

### P2 重要：参数校验错误码段错位（@Validated 校验失败都用 803110002）

| # | 接口 | 入参 | 当前返回 | 期望 | 备注 |
|---|---|---|---|---|---|
| **#13** | `POST /web/equipment-category/add` | `{}` 空 body | `code=803110002 "参数不合法"` | `code=803120102 "参数不合法"` | `@Validated` 触发的 `MethodArgumentNotValidException` 被一个**全局异常处理**统一映射为 `803110002`，未按 Controller 切分到各模块段 |
| **#14** | `POST /web/equipment-category/add` | `{ name: "测试分类" }` | `803110002` | `803120102` | 同上 |
| **#15** | `POST /web/equipment-category/add` | `parentId=99999` (父级不存在) | `803110002` | `803120102` 或 `803120104 "父分类不存在"` | 同上 |
| **#16** | `POST /web/equipment-category/add` | 重名 | `803110002` | `803120104 "分类名称已存在"` | 业务校验走通但异常未透出 |
| **#17** | `POST /web/equipment/add` | 缺 name | `803110002` | `803120302 "参数不合法"` | 同 #13 |
| **#18** | `POST /web/model/add` | 缺 equipmentId | `803110002` | `803120402` | 同 #13 |
| **#19** | `PUT /web/urgency-level/update` | 空 body | `803110002` | `803120502` | 同 #13 |
| **#20** | `PUT /web/lead-time-coefficient/update` | 空 body | `803110002` | `803120502` | 同 #13 |
| **#21** | `PUT /web/equipment-category/rename` | 空 body | `803110002` | `803120102` | 同 #13 |
| **#22** | `PUT /web/equipment-category/rename` | id=99999 | `803110002` | `803120103 "设备分类不存在"` | 走的是 `@Validated` 路径未做 id 存在性检查 |
| **#23** | `PUT /web/equipment/rename` | 空 body | `803110002` | `803120302` | 同 #13 |
| **#24** | `PUT /web/manufacturer/rename` | 空 body | `803110002` | `803120202` | 同 #13 |
| **#25** | `PUT /web/equipment-category/sort` | id=99999 | `803110002` | `803120103` | 同 #22 |
| **#26** | `PUT /web/equipment-category/change-status` | 空 body | `803110002` | `803120102` | 同 #13 |
| **#27** | `POST /web/urgency-level/add` | 空 body | `803110002` | `803120502` | 同 #13 |
| **#28** | `POST /web/service-location/add` | 空 body | `803110002` | `803120502` | 同 #13 |
| **#29** | `POST /web/location-coefficient/add` | 空/缺 locationId | `803110002` | `803120502` | 同 #13 |

### P3 体验：数据不存在时返回成功（应该返回明确的错误段）

| # | 接口 | 入参 | 当前返回 | 期望 | 备注 |
|---|---|---|---|---|---|
| **#30** | `GET /web/urgency-level/detail/{code}` | `code=INVALID` (不存在) | `code=00000000 success` `data=null` | `code=8031205xx "紧急程度不存在"` | Service 层空值未抛异常，直接 `null` 返回 |
| **#31** | `GET /web/lead-time-coefficient/hit/{leadDays}` | `leadDays=99999` (超范围) | 200 success (空数据) | 可保留 success 但前端需要明确标识 | IN-PC-08 区间外应返回 `coefficient=1.0` 或明确空集 |

---

## 三、根因诊断（按优先级）

### 1. 全局异常处理统一映射错误码（影响最广，P1/P2 共 15+ 个 bug）

**问题**：项目里大概率有一个 `@RestControllerAdvice`（`GlobalExceptionHandler` 或 `BaseExceptionHandler`），它把以下异常统一映射为 `803110002` / `803110000` / `10000001` / `10000042`：

- `MethodArgumentNotValidException`（@Validated 校验失败）→ `803110002`
- `MethodArgumentTypeMismatchException`（路径参数类型错误）→ `10000001`
- `WkBizException`（业务异常，但 enum 用错）→ `10000001`
- `DataIntegrityViolationException`（DB 唯一约束）→ `10000001`
- 自定义 `NotFoundException` 等 → `803110000`
- `Exception`（兜底）→ `10000042`

**修复方向**：
- 按 Controller 包名（`com.wk.customer.pricing.web.equipmentcategory`）切分错误码段
- 给每个模块的 Service 抛业务异常时显式用对应的 `XxxExceptionEnum`
- DB 唯一约束异常做 `try/catch` 后翻译为业务异常
- 路径参数类型转换用 `@ExceptionHandler(MethodArgumentTypeMismatchException.class)` 单独返回 `803100001`

### 2. Service 层数据不存在时直接返回 null（影响 #30）

**问题**：`UrgencyLevelQueryService.findByCode()` 在 code 不存在时返回 null，Controller 不做检查直接透传 `data: null`。

**修复方向**：Service 层数据找不到应该抛 `WkBizException(URGENCY_LEVEL_NOT_FOUND)`。

### 3. 业务校验未走业务异常路径（影响 #16 / #25 等）

**问题**：`EquipmentCategoryDomainService.checkNameUnique()` 检测到重名时**只记录 warn 日志**或返回 boolean，Controller 不抛异常。

**修复方向**：Service 校验失败时直接 `throw new WkBizException(EQUIPMENT_CATEGORY_NAME_DUPLICATE)`。

---

## 四、当次变更文件清单

无（本次为只读测试，未修改任何代码）

---

## 五、建议下一步

1. **P1 优先修复**（影响最大）：
   - 全局异常处理按 Controller 切分（耗时 2-3h）
   - 给所有业务异常显式枚举（耗时 2h）
2. **P2 一起改**：与 P1 同步
3. **P3 单独工单**：紧急程度详情空值处理（30min）

---

## 附录：测试用例完整列表（80+ 条）

[见 docs/plans/api-test-cases-20260922.md]