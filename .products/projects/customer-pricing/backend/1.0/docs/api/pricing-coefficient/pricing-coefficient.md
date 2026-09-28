# 服务信息与影响系数 接口对接文档

> 版本:v1.0 | 日期:2026-09-21 | 对应后端:服务信息与影响系数模块(D16/D17)
>
> 面向前端/AI 辅助对接:每个接口给出**可复制的请求/响应 JSON 示例**。通用约定(响应包络、鉴权、环境)见 [README.md](../README.md)。
>
> **Postman 集合**:[pricing-coefficient.postman_collection.json](./pricing-coefficient.postman_collection.json) —— **27 个请求**(后台 24 + 前台 3)、响应示例、内置 `code=00000000` 断言、预置 Authorization 裸 token;导入后在集合 Variables 中按环境修改 `baseUrl`(默认 `http://localhost:8031`)。

---

## 1. 接口总览

| # | 接口 | 方法 | 路径 | 用途 | 权限点 |
|---|------|------|------|------|--------|
| 1 | 计价参数-列表 | GET | `/web/pricing-param/list` | 后台白名单参数全量 | `pricing:web:pricing-param:list` |
| 2 | 计价参数-按 key | GET | `/web/pricing-param/get/{paramKey}` | 后台按 key 详情 | `pricing:web:pricing-param:detail` |
| 3 | 计价参数-更新 | PUT | `/web/pricing-param/update/{id}` | 后台改值/改说明 | `pricing:web:pricing-param:update` |
| 4 | 服务地点-全量 | GET | `/web/service-location/list` | 后台维护视图 | `pricing:web:service-location:list` |
| 5 | 服务地点-按层级 | GET | `/web/service-location/list-by-level/{level}` | 后台按 1/2/3 级过滤 | `pricing:web:service-location:list` |
| 6 | 服务地点-详情 | GET | `/web/service-location/detail/{id}` | 后台详情 | `pricing:web:service-location:detail` |
| 7 | 服务地点-树预览 | GET | `/web/service-location/tree-preview` | 后台 3 级树组装预览 | `pricing:web:service-location:list` |
| 8 | 服务地点-新增 | POST | `/web/service-location/add` | 新增(含 IN-PC-19 层级校验) | `pricing:web:service-location:add` |
| 9 | 服务地点-更新 | PUT | `/web/service-location/update` | 重命名/排序/启停 | `pricing:web:service-location:update` |
| 10 | 服务地点-删除 | DELETE | `/web/service-location/delete/{id}` | 逻辑删除(无启用子项才允许) | `pricing:web:service-location:delete` |
| 11 | 紧急程度-列表 | GET | `/web/urgency-level/list` | 后台全量未删除 | `pricing:web:urgency-level:list` |
| 12 | 紧急程度-详情 | GET | `/web/urgency-level/detail/{code}` | 后台详情 by code | `pricing:web:urgency-level:detail` |
| 13 | 紧急程度-新增 | POST | `/web/urgency-level/add` | 首项保护(不可抢占默认项) | `pricing:web:urgency-level:add` |
| 14 | 紧急程度-更新 | PUT | `/web/urgency-level/update` | 改名/排序/启停/改系数 | `pricing:web:urgency-level:update` |
| 15 | 紧急程度-删除 | DELETE | `/web/urgency-level/delete/{code}` | 首项拒绝(已 inquiry 引用允许停用禁止删) | `pricing:web:urgency-level:delete` |
| 16 | 时间影响-列表 | GET | `/web/lead-time-coefficient/list` | 后台全量未删除 | `pricing:web:lead-time-coefficient:list` |
| 17 | 时间影响-详情 | GET | `/web/lead-time-coefficient/detail/{id}` | 后台详情 | `pricing:web:lead-time-coefficient:detail` |
| 18 | 时间影响-命中 | GET | `/web/lead-time-coefficient/hit/{leadDays}` | 按 lead_days 查命中档 | `pricing:web:lead-time-coefficient:list` |
| 19 | 时间影响-新增 | POST | `/web/lead-time-coefficient/add` | 区间完整性校验(IN-PC-08) | `pricing:web:lead-time-coefficient:add` |
| 20 | 时间影响-更新 | PUT | `/web/lead-time-coefficient/update` | 自动重校验 | `pricing:web:lead-time-coefficient:update` |
| 21 | 时间影响-删除 | DELETE | `/web/lead-time-coefficient/delete/{id}` | 逻辑删除 | `pricing:web:lead-time-coefficient:delete` |
| 22 | 地点影响-列表 | GET | `/web/location-coefficient/list` | 后台全量未删除 | `pricing:web:location-coefficient:list` |
| 23 | 地点影响-详情 | GET | `/web/location-coefficient/detail/{id}` | 后台详情 | `pricing:web:location-coefficient:detail` |
| 24 | 地点影响-新增 | POST | `/web/location-coefficient/add` | uk_location 唯一 | `pricing:web:location-coefficient:add` |
| 25 | 地点影响-更新 | PUT | `/web/location-coefficient/update` | 改系数/启停 | `pricing:web:location-coefficient:update` |
| 26 | 地点影响-删除 | DELETE | `/web/location-coefficient/delete/{id}` | 逻辑删除 | `pricing:web:location-coefficient:delete` |
| 27 | 前台服务地点树 | GET | `/web/portal/service-info/tree` | 前台 3 级级联下拉 | 登录态即可 |
| 28 | 前台紧急启用列表 | GET | `/web/portal/service-info/urgency-levels/list-enabled` | 前台下拉(status=1) | 登录态即可 |
| 29 | 前台影响系数合成 | POST | `/web/portal/service-info/pricing-coefficient/compose` | K=max(3 个 K,未命中=1.0) | 登录态即可 |

> 实际 29 个端点(后台 26 + 前台 3);Postman 集合按 5 套字典 + 前台共 27 个 `item` 目录折叠。

---

## 2. 业务口径速记

| 项 | 说明 |
|---|---|
| D16/R-30 保底价 | 项保底价 = 综合费率 × `pricing_param.min_billable_hours`(默认 8);**按一份计**(不乘数量);合计 = Σ 已勾选服务项 |
| D17 影响系数 | K = max(紧急K, 地点K, 时间K);Q-9 已决(2026-09-18 业务拍板:取最大值,非连乘) |
| R-38 紧急程度 | 字典含紧急系数,默认 `normal`(1.0) |
| R-39 服务地点 | 三级树:大地区 > 国家 > 地点,必填到国家、地点选填 |
| R-40 服务时间 | 具体日期;IN-INQ-05 服务日期 ≥ 提交日期;后端兜底异常/负值按最紧急档 |
| R-41 影响系数合成 | 见 D17 |
| IN-PC-06b 首项锁定 | 紧急程度 sortOrder 最小者(默认 normal)不可改名/删 |
| IN-PC-07b 停用保护 | 已被 inquiry 引用的字典取值允许停用、不得删除 |
| IN-PC-08 区间完整性 | lead_time_coefficient 区间不重叠+全覆盖 [0,∞);首档 min=0;末档 max=NULL |
| IN-PC-13 越界告警 | 系数建议区间 [0.5, 3.0] 越界保存告警不拒绝 |
| IN-PC-19 层级固定 | service_location 固定三级(level=1/2/3) |

---

## 3. 错误码段位(8031205xx,第 5 段)

| 段 | code | 含义 |
|---|---|---|
| 通用 | `803120500` | 通用错误 |
| pricing_param | `803120510` | 参数键名非法 |
|  | `803120511` | 参数值类型与 value_type 不匹配 |
|  | `803120512` | 参数值越界 |
|  | `803120513` | 参数键不存在 |
| service_location | `803120520` | 编码/同级名称重复 |
|  | `803120521` | 层级非法(非 1/2/3) |
|  | `803120522` | level≥2 必须 parent_id |
|  | `803120523` | level=1 大地区不允许 parent_id |
|  | `803120524` | 层级超过 3(IN-PC-19) |
|  | `803120525` | 存在启用子节点,不允许删除 |
|  | `803120526` | 服务地点不存在 |
| location_coefficient | `803120530` | uk_location 重复 |
|  | `803120531` | 地点系数非法 |
|  | `803120532` | 地点系数不存在 |
| urgency_level | `803120540` | code 非法(非 normal/urgent) |
|  | `803120541` | 紧急系数非法 |
|  | `803120542` | 首项不可改名/删(BR-PC-06b) |
|  | `803120543` | 已被 inquiry 引用,禁止删除(BR-PC-07b) |
|  | `803120544` | 紧急 code 不存在 |
| lead_time_coefficient | `803120550` | 区间非法(min<0 / max<min) |
|  | `803120551` | 区间存在交叠/空洞(IN-PC-08) |
|  | `803120552` | 首档必须从 0 天起 |
|  | `803120553` | 末档必须存在 max_days=NULL |
|  | `803120554` | 时间系数非法 |
|  | `803120555` | 时间档 id 不存在 |
| 跨字段 | `803120560` | 服务日期早于提交日(IN-INQ-05) |
|  | `803120561` | 服务地点大地区级为必填(R-21) |

---

## 4. 后台接口明细

### 4.1 计价参数(`/web/pricing-param/*`)

#### 4.1.1 查询全部启用参数

```
GET /web/pricing-param/list
```

**响应 data**(示例 3 行):

```json
[
  { "id": 1, "paramKey": "min_billable_hours", "paramValue": "8", "valueType": "decimal", "remark": "..." },
  { "id": 2, "paramKey": "floor_enabled", "paramValue": "1", "valueType": "bool", "remark": "..." },
  { "id": 3, "paramKey": "hours_per_day", "paramValue": "8", "valueType": "decimal", "remark": "..." }
]
```

#### 4.1.2 更新参数值

```
PUT /web/pricing-param/update/{id}
```

**请求体**:

```json
{
  "paramValue": "8",
  "remark": "最低计费工时(保底价按一份计 × 此值,默认 8h)"
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| paramValue | 是 | 数字/布尔字符串(按 value_type 解析) |
| remark | 否 | 说明 |

**响应 data**:`null`(成功时返回 200)

---

### 4.2 服务地点(`/web/service-location/*`)

#### 4.2.1 全量未删除

```
GET /web/service-location/list
```

**响应 data**(示例):

```json
[
  { "id": 1, "parentId": null, "level": 1, "code": "ASIA", "name": "亚洲", "nameEn": "Asia", "sortOrder": 1, "status": 1 },
  { "id": 2, "parentId": 1, "level": 2, "code": "CN", "name": "中国", "nameEn": "China", "sortOrder": 1, "status": 1 },
  { "id": 3, "parentId": 2, "level": 3, "code": "ZS", "name": "舟山", "nameEn": "Zhoushan", "sortOrder": 1, "status": 1 }
]
```

#### 4.2.2 新增(IN-PC-19 固定三级)

```
POST /web/service-location/add
```

**请求体**——大地区:

```json
{
  "parentId": null,
  "level": 1,
  "code": "ASIA",
  "name": "亚洲",
  "nameEn": "Asia",
  "sortOrder": 1
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| parentId | level=1 必为 null;level≥2 必填 | 父节点 id |
| level | 是 | 1=大地区 / 2=国家 / 3=地点 |
| code | 是 | 编码(全局唯一) |
| name | 是 | 名称(同级唯一) |
| nameEn | 否 | 英文名 |
| sortOrder | 否 | 同级展示排序,默认 0 |

#### 4.2.3 树预览

```
GET /web/service-location/tree-preview
```

**响应 data**(3 级嵌套树):

```json
[
  {
    "id": 1, "parentId": null, "level": 1, "code": "ASIA", "name": "亚洲",
    "nameEn": "Asia", "sortOrder": 1, "status": 1,
    "children": [
      {
        "id": 2, "parentId": 1, "level": 2, "code": "CN", "name": "中国",
        "nameEn": "China", "sortOrder": 1, "status": 1,
        "children": [
          { "id": 3, "parentId": 2, "level": 3, "code": "ZS", "name": "舟山",
            "nameEn": "Zhoushan", "sortOrder": 1, "status": 1, "children": [] }
        ]
      }
    ]
  }
]
```

---

### 4.3 紧急程度(`/web/urgency-level/*`)

#### 4.3.1 全量未删除(含 isDefault 标识)

```
GET /web/urgency-level/list
```

**响应 data**:

```json
[
  { "code": "normal", "name": "不紧急", "coefficient": 1.0000, "sortOrder": 1, "status": 1, "isDefault": true },
  { "code": "urgent", "name": "紧急", "coefficient": 1.2000, "sortOrder": 2, "status": 1, "isDefault": false }
]
```

#### 4.3.2 新增(首项保护)

```
POST /web/urgency-level/add
```

**请求体**:

```json
{
  "code": "critical",
  "name": "极紧急",
  "coefficient": 1.5,
  "sortOrder": 3
}
```

> sortOrder=1 已被 normal 占 → sortOrder=1 → 拒绝(803120542);sortOrder=3 → 通过

---

### 4.4 时间影响系数(`/web/lead-time-coefficient/*`)

#### 4.4.1 全量未删除(按 min_days ASC)

```
GET /web/lead-time-coefficient/list
```

**响应 data**(4 档初始):

```json
[
  { "id": 1, "minDays": 0, "maxDays": 2, "coefficient": 1.2500, "remark": "0–2 天超紧急", "status": 1 },
  { "id": 2, "minDays": 3, "maxDays": 7, "coefficient": 1.1000, "remark": "一周内", "status": 1 },
  { "id": 3, "minDays": 8, "maxDays": 29, "coefficient": 1.0000, "remark": "常规提前期(基准)", "status": 1 },
  { "id": 4, "minDays": 30, "maxDays": null, "coefficient": 0.9500, "remark": "远期需求", "status": 1 }
]
```

#### 4.4.2 命中区间查询(前台/引擎调用)

```
GET /web/lead-time-coefficient/hit/{leadDays}
```

**响应 data**:`leadDays=5` → 命中 `[3, 7]` 档

```json
[
  { "id": 2, "minDays": 3, "maxDays": 7, "coefficient": 1.1000, "remark": "一周内", "status": 1 }
]
```

#### 4.4.3 新增(IN-PC-08 区间完整性)

```
POST /web/lead-time-coefficient/add
```

**请求体**:

```json
{
  "minDays": 0,
  "maxDays": 2,
  "coefficient": 1.25,
  "remark": "0–2 天超紧急"
}
```

> 若与现有区间重叠/不连续 → 拒绝 803120551;首档 min_days 必须 = 0 → 803120552;末档必须 max_days=NULL → 803120553

---

### 4.5 地点影响系数(`/web/location-coefficient/*`)

#### 4.5.1 新增(uk_location 唯一)

```
POST /web/location-coefficient/add
```

**请求体**:

```json
{
  "locationId": 2,
  "coefficient": 1.15,
  "remark": "修船基地,配套成熟"
}
```

> 同 locationId 已存在 → 拒绝 803120530;系数 ≤ 0 → 拒绝 803120531;越建议区间 [0.5,3.0] → 告警不拒绝(BR-PC-14)

---

## 5. 前台接口明细

### 5.1 服务地点 3 级树

```
GET /web/portal/service-info/tree
```

**响应 data**:同 §4.2.3 树预览结构;**仅启用项**(status=1),停用父级联隐藏其全部子孙(IN-PC-09)

### 5.2 紧急程度启用列表

```
GET /web/portal/service-info/urgency-levels/list-enabled
```

**响应 data**:`status=1` 的字典;按 sortOrder 排序

### 5.3 影响系数合成

```
POST /web/portal/service-info/pricing-coefficient/compose?urgencyCode={code}&locationId={id}&leadDays={n}
```

| 参数 | 必填 | 说明 |
|---|---|---|
| urgencyCode | 否 | 不传/null/不在字典 → 紧急K=1.0 |
| locationId | 否 | 不传/null/无匹配系数 → 地点K=1.0 |
| leadDays | 否 | 不传/null/无匹配区间 → 时间K=1.0 |

**响应 data**:

```json
{
  "urgencyCoef": 1.2000,
  "locationCoef": 1.1500,
  "leadTimeCoef": 1.0000,
  "coefficient": 1.2000
}
```

> `coefficient` = max(3 个 K),未命中维度默认 1.0(Q-9 已决)

---

## 6. 跨模块补账(本模块不涉及)

服务信息与影响系数字典不为其他模块提供引用拦截(M2 询价单落地时校验服务地点/紧急/时间有效性)。本模块**不涉及**跨模块补账。

---

## 7. 使用说明

- 集合 Variables:`baseUrl`(默认 `http://localhost:8031`)、`token`(登录态 SSO 裸 token,无 Bearer 前缀)
- 单跑任意接口:导入后 Collection Runner 选测试用例即可
- 全套断言:每个请求已内置 `pm.test("HTTP 200") + pm.test("code=00000000")`
- 写操作需先通过 §5 前台或 §4 各自 add 接口灌入数据(如 locationId/urgencyCode/leadTimeId 由前序请求 setVariables)