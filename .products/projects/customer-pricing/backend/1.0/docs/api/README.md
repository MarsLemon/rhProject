# wk-customer-pricing 前端接口对接文档

> 本目录存放**面向前端（含 AI 辅助对接）的接口对接文档**，与后端代码同仓维护，接口变更时同步更新。
> 文档中的 JSON 示例与后端真实返回结构一致（字段名以本文档为准）。

**目录结构（按模块分组）**：本 README 是通用约定与索引；每个业务模块一个子目录（以模块英文名命名，与后端包名一致），内含该模块的对接文档与 Postman 集合。

**工具兼容（Apifox / Postman 双端同源）**：同事使用 Postman、本人使用 Apifox，两套资产按模块同源同步落在 `docs/api/<模块>/` 下——对接文档 + Postman Collection v2.1（`*Interface对接文档.md` + `*Interface.postman_collection.json`）。Postman 集合中的 `test` 脚本即为 Apifox AI 生成测试用例的标准参照（Apifox AI 生成后须人工对照 Postman 脚本验收断言合规性）。

| 模块目录 | 覆盖接口 | 后端模块 |
|---------|---------|---------|
| [equipment-category/](./equipment-category/)（含 [对接文档](./equipment-category/设备分类接口对接文档.md) + Postman 集合） | 后台维护 7 个 + 前台导航 2 个 | equipmentcategory（设备分类树） |
| [manufacturer/](./manufacturer/)（含 [对接文档](./manufacturer/厂家接口对接文档.md) + Postman 集合） | 后台维护 5 个 + 前台启用列表 1 个 | manufacturer（厂家字典） |
| [equipment/](./equipment/)（含 [对接文档](./equipment/设备接口对接文档.md) + Postman 集合） | 后台维护 6 个 + 前台下拉/导航 2 个 | equipment（设备，R-01 不参与定价） |
| [model/](./model/)（含 [对接文档](./model/型号接口对接文档.md) + Postman 集合） | 后台维护 8 个 + 前台下拉 3 个 | model（型号，含型号-厂家多对多 + 默认厂家 IN-EQ-04） |
| [pricing-coefficient/](./pricing-coefficient/)（含 [对接文档](./pricing-coefficient/pricing-coefficient.md) + Postman 集合） | 后台维护 26 个 + 前台采集 3 个 | 服务信息与影响系数（D16/D17；影响系数 max 合成 R-41 + Q-9；保底价 D16/R-30） |

> 维保类型（maintenance-type）等模块开发完成后，在本目录下新建同名子目录追加，并更新本表。

---

## 1. 服务与环境

| 项 | 值 |
|----|----|
| 服务名 | wk-customer-pricing（客户报价/船舶维保定价后端） |
| 本地端口 | `8031`（无 context-path，路径直接挂根） |
| 协议 | HTTP/HTTPS，JSON（`Content-Type: application/json`） |
| 环境路由 | 生产/测试环境经网关按服务名路由；本机联调直连 `http://localhost:8031` |
| Swagger | 后端已配置 Swagger 注解；如环境开放可视化调试，通常在 `/swagger-ui.html`（以实际环境为准） |

**路径前缀约定**：

- `/web/**` —— PC 后台管理接口，需要登录态 + 方法级权限点；
- `/web/portal/**` —— 客户前台（询价嵌入页）接口，需要登录态，无细粒度权限点。

## 2. 统一响应包络

所有接口返回 `RespVo<T>`，HTTP 状态码一律 200，**业务成败看 `code`**：

```json
{
  "code": "00000000",
  "msg": "success",
  "data": { }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | `"00000000"` = 成功；其余均为失败（系统错误或业务错误码，见各接口文档错误码表） |
| msg | string | 提示信息，成功为 `success`，失败为可直接 toast 展示的中文文案 |
| data | T | 业务数据，失败时可能为 null |

**前端/AI 对接判断约定**：`code === '00000000'` 视为成功；失败时直接取 `msg` 提示用户，无需按 code 细分文案（除非文档中特别说明）。

## 3. 鉴权

- 后台接口（`/web/**`）需携带平台统一登录态：请求头 **`Authorization: <JWT>`**（直接放裸 token，**不带 `Bearer ` 前缀**；Postman 集合已预置，token 过期后在集合 Variables 中替换 `token` 变量即可）；未登录/无权限由网关或权限平台拦截。
- 权限点与接口一一对应（如 `pricing:web:equipment-category:add`），由权限平台给角色授权，前端无需处理，仅需处理 403 类响应的友好提示。
- 前台接口（`/web/portal/**`）登录态可访问，无细粒度权限点。

## 4. 通用数据格式约定

| 项 | 约定 |
|----|------|
| 时间 | 出参时间字段以 `@JsonFormat` 标注为准，本模块为 `yyyy/MM/dd HH:mm:ss`（GMT+8）字符串 |
| 金额 | 两位小数（本模块无金额字段） |
| 枚举 | 出参一律为**数字码 + 语义注释**（如 `status: 1`），码表见各接口文档 |
| 布尔开关类入参 | 一律用数字码（如 status 1/0），不用 true/false |
| 空集合 | 出参集合字段空时为 `[]`（不可变空列表），不会是 null |
| 树结构 | children 嵌套数组，叶子节点 `children: []`（不会是 null） |

## 5. 联调自检清单（AI 辅助对接时逐项核对）

1. 请求路径前缀是否正确（后台 `/web/equipment-category`，前台 `/web/portal/equipment-category`）；
2. 写接口是否用对 HTTP 方法（新增 POST、更新 PUT，**不是全 POST**）；
3. 入参必填项校验与文档一致（如分类中文名 1~100 字）；
4. 响应按 `code` 判成败，`msg` 直接透出；
5. 树组件按 `children` 嵌套渲染，叶子节点 `children: []`；
6. 不要把后端生成的字段放进编辑表单（分类 `code`/`level` 服务端计算，入参传了也会被忽略）。

---

## 6. Apifox AI 辅助测试特别约定（重要 ⚠️）

### ❌ 常见误区——不要期望 HTTP 400

本项目采用自定义错误码体系：**所有接口恒返回 HTTP 200**，前端/AI 通过 `response.code` 判断成败并直接展示 `msg`。

这与业界常见的"RESTful 最佳实践"（参数错误返回 HTTP 400）**不一致**，请在 Apifox AI 生成测试用例时必须遵守以下规则：

---

### 📋 正确示例 vs 错误示例

#### ❌ 错误写法（Apifox AI 默认会这样写，但永远过不了）

```javascript
// 传入不存在的 categoryId=9999，预期业务校验失败
pm.test("expect status 400 for invalid categoryId", function () {
  pm.response.to.have.status(400); // ⚠️ 这行断言永远失败！HTTP 状态码是 200
});
```

#### ✅ 正确写法（应这样写）

```javascript
// 场景：传入不存在的 categoryId=9999，预期业务校验失败
pm.test("HTTP 200", function () { 
  pm.response.to.have.status(200); // ✅ HTTP 状态码恒为 200
});

var body = pm.response.json();
pm.test("business error code 803120302", function () { 
  pm.expect(body.code).to.eql('803120302'); // ✅ 父分类不存在的错误码段
});

pm.test("error msg is user-friendly", function () { 
  pm.expect(body.msg).to.contain('父分类不存在'); // ✅ 前端直接提示 msg
});
```

---

### 🔍 错误码分段速查表

| 模块 | 错误码段 | 示例 | 含义 |
|------|---------|------|------|
| **服务级通用** | `80311xxxx` | `803110001` | 参数非法、节点不存在等 |
| **设备分类** | `8031201xx` | `803120100` | 节点不存在 |
| | | `803120101` | 编码重复 |
| | | `803120102` | 父分类不存在 |
| **厂家** | `8031202xx` | `803120200` | 节点不存在 |
| | | `803120201` | 中文名重复 |
| **设备** | `8031203xx` | `803120300` | 节点不存在 |
| | | `803120301` | 编码重复 |
| | | `803120302` | 父分类不存在 |
| **型号** | `8031204xx` | `803120400` | 节点不存在 |
| **定价系数** | `8031205xx` | `803120500` | 节点不存在 |

> 完整枚举定义见各模块的 `*ExceptionEnum.java`（位于 `wk-customer-pricing-general/enums`）

---

### 📝 Apifox AI 引导提示词（复制粘贴使用）

当你在 Apifox 中导入本项目的接口或重新生成自动化测试用例时，请在 AI 对话框中输入以下内容：

```
【系统特殊约定——必遵守】
⚠️ 本项目所有接口恒返回 HTTP 200，不要断言 status 为 400/401/403 等
✅ 业务异常通过 response.code 字段表示（非 '00000000' 即为失败）
✅ 前端直接弹出 response.msg 作为错误提示，无需按 code 细分文案
✅ 参数校验失败同样是 200 + 业务错误码，不是 400
✅ 权限不足时也是 200 + 特定 code（如 803110201），不会返回 401

📋 错误码分段规则详见 docs/api/README.md §6
🔗 参考实现请严格遵循 docs/api/*/equipment-*/equipment-*.postman_collection.json 中的 test 脚本写法
```

---

### 💡 额外建议

1. **手动维护关键用例**：如果 Apifox AI 反复出错，建议以人工编写的 Postman 集合为主，Apifox 仅用于查看接口文档和手工跑一遍流程。

2. **在 Apifox 项目备注中永久记录**：在项目设置 → 全局变量/备注中，添加第 6 节的文字说明，让每个团队成员都能看到这个特殊约定。

3. **Postman 集合已内置正确示例**：每个模块的 `*.postman_collection.json` 文件中都包含了正确的断言写法，可以作为 AI 的训练参考资料导入。
