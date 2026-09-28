# Apifox AI 测试用例生成 · 引导提示词模板

> 版本：v1.0 | 适用：客户定价系统（项目 ID 8869726）所有接口
> 用法：在 Apifox 中选中接口 → 切到「测试用例」标签 → 点「🤖 AI 生成用例」 → 把下方 `<模块名>` 对应的整段提示词粘贴到「输入更多要求」输入框 → 点「生成」。
> 提示词已封装好项目专属规则（统一响应 / 错误码分段 / 鉴权 / 业务约束），Apifox AI 会基于接口 schema 自动生成完整等价类用例，无需再写模板规则。

---

## 🛠 通用前缀（必带 · 所有模块共用）

```
你是为船舶维保定价后端（wk-customer-pricing,端口 8031,Nacos 配置中心）编写接口自动化用例的资深测试工程师。
本项目所有接口**HTTP 状态码恒为 200**,业务成败只看响应体 code;成功 code="00000000"（msg 字段透出）,失败 code 是分段枚举中的非零字符串,前端按 code 判成败。

⚠️ 强制断言规则（必须严格遵守,不要写其他断言）:
1. 每条用例第一个断言必须是 pm.response.to.have.status(200)（断言 HTTP 状态码 200,不是 4xx/5xx）
2. 第二条断言:pm.expect(body.code).to.eql('00000000')（成功用例）或 pm.expect(body.code).to.not.eql('00000000')（异常用例,断言失败）
3. **禁止**断言 HTTP 400/401/403/404/500 等;HTTP 层永远 200
4. 失败用例要把"msg 字段包含指定关键字"作为可选第三断言
5. 字段提取:pm.collectionVariables.set('<key>', body.data.<field>) 把 id/code 等写入集合变量,供后续链式用例引用

鉴权:请求头 Authorization = {{token}}（裸 token,无 Bearer 前缀,Apifox 环境变量已预置）。
公共 Header:Content-Type: application/json（POST/PUT 必带,GET 不带）。

变量命名规范（pm.collectionVariables）:
- equipmentId / equipmentCode
- categoryId / categoryCode
- modelId / modelCode
- manufacturerId / manufacturerName
- serviceLocationId / serviceLocationCode
- urgencyCode / urgencyCoefficient
- leadTimeCoefficientId
- locationCoefficientId / locationId
- pricingParamId
```

---

## 📋 模块级提示词（按模块粘贴）

### 模块 1：设备分类树维护（`pricing:web:equipment-category:*`）
错误码分段 `8031201xx`：CATEGORY_NOT_EXIST(100) / CODE_ALREADY_EXIST(101) / PARENT_NOT_EXIST(102) / LEVEL_EXCEED_LIMIT(103) / HAS_CHILDREN(104) / STATUS_ILLEGAL(105) / SORT_SAME_PARENT_REQUIRED(106)

```
[粘贴上面的通用前缀]

【设备分类维护】
基于此接口的 schema 生成 6-8 条用例:
1. ✅ 正向-新增一级分类(parentId 留空,name 合法,期望 code 自增 + 返回 id/code)
2. ✅ 正向-新增子分类(parentId 指向已有节点,name 合法)
3. ✅ 正向-按 id 详情回显(预期 data 含完整字段)
4. ✅ 正向-重命名(name 改,nameEn 可空清空)
5. ✅ 正向-启停(status:1↔0)+ 后台树验证
6. ✅ 正向-同级排序(sortOrder 调整)+ 列表树验证
7. ✅ 正向-后台树查询(含停用节点,前端置灰用)
8. ❌ 异常-name 缺失(@NotBlank)
9. ❌ 异常-name 超 100 字符(@Size max=100)
10. ❌ 异常-parentId 指向不存在 id → 803120102
11. ❌ 异常-删除非空节点 → 803120104 (HAS_CHILDREN)
12. ❌ 异常-层级超限 → 803120103
13. ❌ 异常-status 非法(传 2) → 803120105
14. ❌ 异常-排序节点不属于同一父级 → 803120106

业务约束:code 系统生成不可传参;同一父级下 name 精确唯一;删除仅限空节点;停用后前台导航隐藏该节点及其全部子孙(查询侧内存传播);后台树仍可见。
```

---

### 模块 2：厂家字典维护（`pricing:web:manufacturer:*`）
错误码分段 `8031202xx`：NOT_EXIST(200) / CODE_ALREADY_EXIST(201) / NAME_ALREADY_EXIST(202) / STATUS_ILLEGAL(203) / REFERENCED_BY_MODEL(205)

```
[粘贴上面的通用前缀]

【厂家字典维护】
基于此接口的 schema 生成 6-8 条用例:
1. ✅ 正向-新增(name 中文 1-100 字精确唯一,返回 id+code)
2. ✅ 正向-重命名(name 改名,nameEn 允许清空)
3. ✅ 正向-启停(status:0/1)+ 前台 list-enabled 验证
4. ✅ 正向-列表(支持 keyword 模糊过滤)
5. ❌ 异常-name 缺失
6. ❌ 异常-name 重复 → 803120202 (NAME_ALREADY_EXIST)
7. ❌ 异常-name 超 100 字符
8. ❌ 异常-启停 status=2 → 803120203
9. ❌ 异常-删除被型号引用的厂家 → 803120205 (REFERENCED_BY_MODEL)
10. ❌ 异常-详情/删除 id 不存在 → 803120200

业务约束:R-03 型号-厂家多对多;R-04 价格与厂家无关(本模块不携带价格字段);停用后从启用厂家列表消失,已关联型号不受影响;中文名精确唯一。
```

---

### 模块 3：设备字典维护（`pricing:web:equipment:*`）
错误码分段 `8031203xx`：CODE_ALREADY_EXIST(301) / CATEGORY_NOT_EXIST(302) / CATEGORY_DISABLED(303) / STATUS_ILLEGAL(304) / NOT_EXIST(305) / NAME_ALREADY_EXIST(306) / NAME_ILLEGAL(307) / REFERENCED_BY_MODEL(308)

```
[粘贴上面的通用前缀]

【设备字典维护】
基于此接口的 schema 生成 8-10 条用例:
1. ✅ 正向-新增(categoryId 必填且启用,name 中文 1-100 字,code 系统生成,期望返回 id+code)
2. ✅ 正向-重命名(name 改名,nameEn 允许清空)
3. ✅ 正向-启停(status:0/1)
4. ✅ 正向-列表(扁平) / 列表(groupBy=category 嵌套树)
5. ✅ 正向-详情回显(完整字段)
6. ✅ 正向-前台 by-category(仅启用)+ 前台 nav-tree(询价嵌入页)
7. ❌ 异常-categoryId 缺失 → @NotNull
8. ❌ 异常-categoryId 不存在 → 803120302
9. ❌ 异常-父分类已停用 → 803120303
10. ❌ 异常-同分类下 name 重复 → 803120306
11. ❌ 异常-name 缺失/超长 → 803120307
12. ❌ 异常-status=2 → 803120304
13. ❌ 异常-删除被型号引用 → 803120308
14. ❌ 异常-详情/删除 id 不存在 → 803120305

业务约束:R-01 设备不参与定价;code 系统生成不可传参;name 同分类下精确唯一;停用父分类则前台 by-category 隐藏;list 关键词匹配 code/name/nameEn 不区分大小写。
```

---

### 模块 4：型号字典维护（`pricing:web:model:*`）
错误码分段 `8031204xx`：NOT_EXIST(400) / CODE_ALREADY_EXIST(401) / EQUIPMENT_NOT_EXIST(402) / EQUIPMENT_DISABLED(403) / CYLINDER_COUNT_ILLEGAL(404) / POWER_KW_ILLEGAL(405) / BORE_MM_ILLEGAL(406) / STATUS_ILLEGAL(407) / REFERENCED_BY_EQUIPMENT(408) / REFERENCED_BY_MANUFACTURER(409) / NAME_ALREADY_EXIST(410) / DEFAULT_MANUFACTURER_NOT_IN_LINKS(411) / MANUFACTURER_LINKS_EMPTY(412) / SPEC_ILLEGAL(413)

```
[粘贴上面的通用前缀]

【型号字典维护】
基于此接口的 schema 生成 10-12 条用例:
1. ✅ 正向-新增(equipmentId 必填且启用,name 中文 1-100 字,cylinderCount 1-20,powerKw≥0,boreMm≥0,manufacturerLinks≥1 项,code 系统生成,返回 id+code)
2. ✅ 正向-重命名(仅改中英文名)
3. ✅ 正向-切换型号归属设备(change-equipment)
4. ✅ 正向-启停 + 列表(groupBy=equipment 嵌套树)
5. ✅ 正向-详情(完整字段含 manufacturerLinks)
6. ✅ 正向-增量更新型号-厂家关联(manufacturerLinks 全量替换,defaultManufacturerId 可空)
7. ❌ 异常-equipmentId 缺失 → @NotNull
8. ❌ 异常-父设备不存在 → 803120402
9. ❌ 异常-父设备已停用 → 803120403
10. ❌ 异常-cylinderCount=0 → 803120404
11. ❌ 异常-cylinderCount=21 → 803120404
12. ❌ 异常-powerKw 负数 → 803120405
13. ❌ 异常-boreMm 负数 → 803120406
14. ❌ 异常-name 缺失或超长 → 803120413
15. ❌ 异常-manufacturerLinks 为空 → 803120412
16. ❌ 异常-defaultManufacturerId 不在 links 内 → 803120411
17. ❌ 异常-status 非法(传 2) → 803120407
18. ❌ 异常-删除被设备引用 → 803120408
19. ❌ 异常-删除被厂家引用 → 803120409

业务约束:code 系统生成不可传参;name 同设备下精确唯一;manufacturerLinks 内嵌子对象{manufacturerId, isLicense(0/1 默认 0), sortOrder(默认 99=置后)};defaultManufacturerId 必须出现在 links 内(可空表示取关联集合排序第一);至少保留一个关联厂家。
```

---

### 模块 5：服务地点维护（`pricing:web:service-location:*`）
错误码分段 `80312052x`：CODE_DUPLICATE(520) / LEVEL_INVALID(521) / PARENT_REQUIRED(522) / PARENT_FORBIDDEN(523) / LEVEL_EXCEEDED(524) / HAS_CHILDREN(525) / NOT_FOUND(526)

```
[粘贴上面的通用前缀]

【服务地点维护】
基于此接口的 schema 生成 8-10 条用例:
1. ✅ 正向-新增一级大地区(level=1,parentId=null,code 全局唯一,name 同级唯一)
2. ✅ 正向-新增国家(level=2,parentId 必填指向已有大地区)
3. ✅ 正向-新增地点(level=3,parentId 必填指向已有国家)
4. ✅ 正向-更新(重命名/排序/启停任选)
5. ✅ 正向-按层级查询启用项(list-by-level/1 + /2 + /3)
6. ✅ 正向-后台树预览(tree-preview,3 级启用树)
7. ✅ 正向-列表查询(全量含停用,后台维护视图)
8. ❌ 异常-level=4 → 803120524
9. ❌ 异常-level=0 → 803120521
10. ❌ 异常-level=2 但 parentId=null → 803120522
11. ❌ 异常-level=1 但传了 parentId → 803120523
12. ❌ 异常-code 全局重复 → 803120520
13. ❌ 异常-name 同级重复
14. ❌ 异常-code 缺失/超 50 字符 → PARAM_ILLEGAL(803120562)
15. ❌ 异常-删除有子项的节点 → 803120525
16. ❌ 异常-详情/更新/删除 id 不存在 → 803120526

业务约束:IN-MC-19 固定三级(level=1 大地区/2 国家/3 地点);code 全局唯一;name 同级唯一;前台树(tree-preview)仅启用项;删除仅限无启用子项。
```

---

### 模块 6：地点影响系数维护（`pricing:web:location-coefficient:*`）
错误码分段 `80312053x`：DUPLICATE(530) / INVALID(531) / NOT_FOUND(532)

```
[粘贴上面的通用前缀]

【地点影响系数维护】
基于此接口的 schema 生成 6-8 条用例:
1. ✅ 正向-新增(locationId 必填指向启用服务地点,coefficient>0,uk_location 唯一)
2. ✅ 正向-更新(coefficient/status)
3. ✅ 正向-列表查询(全量含停用)
4. ✅ 正向-详情回显
5. ❌ 异常-locationId 缺失 → @NotNull
6. ❌ 异常-coefficient 缺失或 ≤0 → 803120531
7. ❌ 异常-同 locationId 重复 → 803120530
8. ❌ 异常-详情/更新/删除 id 不存在 → 803120532

业务约束:uk_location 唯一(同一服务地点只能有一条系数);coefficient 建议区间 [0.5,3.0](越界告警不拒绝);删除为逻辑删除。
```

---

### 模块 7：紧急程度维护（`pricing:web:urgency-level:*`）
错误码分段 `80312054x`：CODE_INVALID(540) / COEFFICIENT_INVALID(541) / DEFAULT_LOCKED(542) / IN_USE(543) / NOT_FOUND(544)

```
[粘贴上面的通用前缀]

【紧急程度维护】
基于此接口的 schema 生成 8-10 条用例:
1. ✅ 正向-新增(code normal/urgent,coefficient>0,sortOrder 默认 0)
2. ✅ 正向-更新(改名/系数/启停)
3. ✅ 正向-按 code 详情
4. ✅ 正向-列表查询(全量含停用)
5. ❌ 异常-code 非法(非 normal/urgent 字符串) → 803120540
6. ❌ 异常-code 缺失 → @NotBlank
7. ❌ 异常-coefficient 缺失或 ≤0 → 803120541
8. ❌ 异常-修改默认项(默认项=sortOrder 最小) → 803120542 (DEFAULT_LOCKED, BR-PC-06b)
9. ❌ 异常-删除默认项 → 803120542
10. ❌ 异常-删除被询价单引用的项 → 803120543 (IN_USE,允许停用不得删除)
11. ❌ 异常-code 不存在 → 803120544

业务约束:code 仅允许 normal/urgent;BR-PC-06b 默认项(sortOrder 最小)不可改名/删;BR-PC-07b 被询价引用的项允许停用、不得删除;coefficient 建议区间 [0.5,3.0]。
```

---

### 模块 8：时间影响系数维护（`pricing:web:lead-time-coefficient:*`）
错误码分段 `80312055x`：RANGE_INVALID(550) / RANGE_OVERLAP(551) / NOT_COVER_ZERO(552) / NO_INFINITE(553) / COEFFICIENT_INVALID(554) / NOT_FOUND(555)

```
[粘贴上面的通用前缀]

【时间影响系数维护】
基于此接口的 schema 生成 8-10 条用例:
1. ✅ 正向-新增首档(minDays=0,maxDays=3,coefficient>0,IN-PC-08 区间完整性)
2. ✅ 正向-新增中间档(0~3 已存在,新增 4~7)
3. ✅ 正向-新增末档(maxDays=NULL=∞)
4. ✅ 正向-命中区间查询(hit/{leadDays}=5 返回 4~7)
5. ✅ 正向-更新(修改区间/系数/状态)
6. ❌ 异常-minDays<0 → 803120550
7. ❌ 异常-maxDays<minDays → 803120550
8. ❌ 异常-区间与已有交叠 → 803120551 (RANGE_OVERLAP)
9. ❌ 异常-区间存在空洞 → 803120551 (IN-MC-18 不重叠+全覆盖)
10. ❌ 异常-首档不从 0 起 → 803120552
11. ❌ 异常-无 maxDays=NULL 末档 → 803120553
12. ❌ 异常-coefficient≤0 → 803120554
13. ❌ 异常-id 不存在 → 803120555
14. ✅ 正向-前台/引擎命中区间查询(hit/0/5/100 → 返对应档)

业务约束:IN-PC-08 区间完整性由 Service 校验;IN-MC-18 不重叠+全覆盖 [0,∞);minDays≥0;maxDays≥minDays 或 NULL;coefficient>0;命中查询按 leadDays 落入区间返项。
```

---

### 模块 9：计价参数维护（`pricing:web:pricing-param:*`）
错误码分段 `80312051x`：KEY_INVALID(510) / VALUE_TYPE_INVALID(511) / VALUE_OUT_OF_RANGE(512) / NOT_FOUND(513)

```
[粘贴上面的通用前缀]

【计价参数维护】
基于此接口的 schema 生成 5-7 条用例:
1. ✅ 正向-查询全部启用参数(list)
2. ✅ 正向-按 paramKey 查询(get/min_billable_hours)
3. ✅ 正向-按 id 更新(updateValue,paramValue 匹配数字/布尔正则)
4. ❌ 异常-paramValue 不匹配正则(传入字符串"abc") → PARAM_ILLEGAL(803120562)
5. ❌ 异常-paramValue 缺失 → @NotBlank
6. ❌ 异常-白名单外的 paramKey → 803120510 (仅允许 min_billable_hours/floor_enabled/hours_per_day)
7. ❌ 异常-paramValue 与 value_type 不匹配(数字字段传"true") → 803120511
8. ❌ 异常-越界(min_billable_hours 传负数/floor_enabled 传 2) → 803120512
9. ❌ 异常-id/paramKey 不存在 → 803120513

业务约束:白名单 param_key 仅 min_billable_hours/floor_enabled/hours_per_day;paramValue 必须匹配 ^[0-9]+(\.[0-9]+)?$ | ^true$ | ^false$ | ^[01]$;min_billable_hours>0;floor_enabled∈{0,1};hours_per_day>0;D16/R-30 保底价推导依据。
```

---

### 模块 10：前台服务信息组合查询（`/web/portal/service-info/*` · 无权限点,登录态即可）
无专用错误码段,沿用服务信息与影响系数 8031205xx

```
[粘贴上面的通用前缀]

【前台服务信息公共接口】
基于此接口的 schema 生成 6-8 条用例:
1. ✅ 正向-3 级服务地点树(GET /tree,仅启用项,3 级嵌套结构)
2. ✅ 正向-紧急程度启用列表(GET /urgency-levels/list-enabled,下拉数据)
3. ✅ 正向-合成系数(POST /pricing-coefficient/compose,urgencyCode=normal,locationId 有效,leadDays=5 → 返 urgencyCoef+locationCoef+leadTimeCoef+coefficient)
4. ✅ 正向-合成缺省(三个参数都为空 → 各子系数 1.0,合成 K=1.0)
5. ✅ 正向-合成 max 取值(三个子系数不全等 → K=max(Ku,Kl,Kt))
6. ❌ 异常-合成时所有字典为空(数据库未初始化)
7. ❌ 异常-合成时 locationId 不存在 → 系数取默认 1.0 不报错
8. ❌ 异常-合成时 leadDays 越界无命中区间 → 时间系数取默认 1.0

业务约束:三个子系数(ku 紧急 / kl 地点 / kt 时间)各自独立查表,缺省 1.0;合成 K = max(ku, kl, kt);前台实时预览,FR-10 服务信息采集项 + D17 影响系数合成。
```

---

## 🔄 联动约束（链式用例必备）

很多用例涉及跨模块依赖,**务必用 `pm.collectionVariables.get('key')` 引用而非写死 id**:

| 上游接口 | 提取变量 | 写入时机 |
|---------|---------|---------|
| 新增设备分类 add | `categoryId`, `categoryCode` | 第一条用例的 test 脚本 |
| 新增设备 add | `equipmentId`, `equipmentCode` | 第一条用例的 test 脚本 |
| 新增厂家 add | `manufacturerId`, `manufacturerName` | 第一条用例的 test 脚本 |
| 新增型号 add | `modelId`, `modelCode` | 第一条用例的 test 脚本 |
| 新增服务地点 add | `serviceLocationId`, `serviceLocationCode` | 第一条用例的 test 脚本 |
| 新增紧急程度 add | `urgencyCode`, `urgencyCoefficient` | 第一条用例的 test 脚本 |
| 新增时间系数 add | `leadTimeCoefficientId` | 第一条用例的 test 脚本 |
| 新增地点系数 add | `locationCoefficientId`, `locationId` | 第一条用例的 test 脚本 |

后续用例通过 `{{equipmentId}}` / `{{categoryId}}` / `{{modelId}}` / `{{manufacturerId}}` 等占位符引用,保证数据连贯。

---

## 🎯 用例组织建议

每个接口生成 6-10 条用例,推荐结构:
- **正向用例**（4-5 条,占比 50%）:覆盖成功路径的核心等价类(必填项边界、枚举值、典型业务值)
- **异常用例**（3-4 条,占比 30%）:覆盖参数校验、唯一性、引用保护、状态机约束
- **链式用例**（1-2 条,占比 20%）:跨接口依赖的完整链路(创建→修改→查询→删除)

---

## 📝 后续手动补充

AI 自动生成的用例覆盖 80% 场景,以下场景需要手动补充:
1. **性能用例**:并发 100/500/1000 的 RT 与错误率,AI 不会生成
2. **安全用例**:SQL 注入/XSS/越权访问,AI 不会生成
3. **业务规则**:D15~D17 业务约束的端到端链路验证(询价闭环)
4. **异常恢复**:网络中断/超时/重试场景

---

## ⚡ Apifox 使用提示

- Apifox AI 模型已支持上下文感知,会自动读取接口 DTO/响应 schema
- 提示词粘贴后立即点击「生成」,AI 会输出 6-10 条用例到列表
- 生成后可逐条点击「运行」调试,失败用例右键「添加为问题」跟踪
- 批量运行:右键文件夹 → 「批量运行」可一次跑完所有用例并生成报告

