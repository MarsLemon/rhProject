# 成本核算大表 — 全流程图

> 适用范围:`wk-mhc-ui`(前端)+ `wk-sd-supply-api`(后端 `com.wk.sd.cost`)
> 组织架构来源:内部人员表
> 渲染说明:VSCode 安装 `Markdown Preview Mermaid Support` 插件即可看图;GitHub / GitLab / Typora 也支持

---

## 流程图

```mermaid
flowchart TD
    Start([项目启动]) --> S0[基础数据配置<br/>销售副总 / CEO<br/>币种·汇率·4级售价区间系数]
    S0 --> S1[发起项目<br/>国内/国外/备件销售部<br/>销售1·销售2·销售3]

    S1 --> FillCost{各部门并行填成本}

    subgraph PROD[生产部 9 项成本]
        direction TB
        FillCost --> F1[采购1/2/3<br/>施工材料 + 仓储物流]
        FillCost --> F2[绿色技术部<br/>绿色1·绿色2<br/>其他费用]
        FillCost --> F3[数智研发部<br/>开发1 + 测试1<br/>软件开发直接人工]
        FillCost --> F4[工业物联网<br/>工业1·工业2<br/>直接采购材料]
        FillCost --> F5[产品部<br/>产品1·产品2<br/>认证费用]
        FillCost --> F6[采购1/2/3<br/>施工人工 + 特殊环境附加费]
        FillCost --> F7[销售1/2/3<br/>售前人工 + 售前费用]
        FillCost --> F8[生产部其他<br/>运维成本 + 售后成本]
    end

    F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 --> Sum[系统自动汇总<br/>16项相加 + 汇率折算<br/>= 总成本]

    Sum --> Price{销售选定价法}
    Price --> P1[成本加成]
    Price --> P2[市场导向]
    Price --> P3[效用]
    Price --> P4[边际成本 / 船套]
    Price --> P5[自定义]
    Price --> P6[其他费用 / 佣金]

    P1 & P2 & P3 & P4 & P5 & P6 --> Quote[出报价<br/>勾选:计入报价 / 加入附加条款]
    Quote --> DR[部长审核<br/>国内/国外/备件销售部<br/>部长]

    DR -->|通过| L1[第 1 级审批<br/>销售1/2/3<br/>填售价]
    DR -->|打回| Price

    L1 --> L2[第 2 级审批<br/>销售部长<br/>填售价]
    L2 --> L3[第 3 级审批<br/>销售副总<br/>填售价]
    L3 --> L4[第 4 级审批<br/>CEO<br/>填售价]

    L4 --> Final{总报价<br/>确定}
    Final --> Done([项目完成])
    L4 -->|拒绝| Price

    style Start fill:#d3f261,stroke:#333
    style Done fill:#d3f261,stroke:#333
    style S0 fill:#fff4e6,stroke:#333
    style Sum fill:#e6f7ff,stroke:#333
    style Price fill:#f6ffed,stroke:#333
    style Final fill:#f6ffed,stroke:#333
    style DR fill:#fff0f6,stroke:#333
    style L1 fill:#fff0f6,stroke:#333
    style L2 fill:#fff0f6,stroke:#333
    style L3 fill:#fff0f6,stroke:#333
    style L4 fill:#fff0f6,stroke:#333
```

---

## 角色职责速查

| 角色           | 环节                        | 操作                                      |
| -------------- | --------------------------- | ----------------------------------------- |
| 销售副总 / CEO | 阶段 0                      | 配基础数据                                |
| 销售1/2/3      | 阶段 1 / 阶段 4 / 第1级审批 | 发起 + 填售前成本 + 选定价法 + 第1级售价  |
| 销售部长       | 阶段 4 部门审 / 第2级审批   | 部门审核 + 第2级售价                      |
| 销售副总       | 第3级审批                   | 第3级售价                                 |
| CEO            | 第4级审批                   | 第4级售价 + 终审                          |
| 采购1/2/3      | 阶段 2                      | 施工材料 + 仓储物流 + 施工人工 + 特殊环境 |
| 绿色1/2        | 阶段 2                      | 生产阶段其他费用                          |
| 开发1 + 测试1  | 阶段 2                      | 软件开发直接人工                          |
| 工业1/2        | 阶段 2                      | 生产阶段直接采购材料                      |
| 产品1/2        | 阶段 2                      | 认证费用                                  |

---

## 6 种定价法

| #   | 方法          | 销售要填的字段                 |
| --- | ------------- | ------------------------------ |
| 1   | 成本加成      | 计划毛利率                     |
| 2   | 市场导向      | 计划毛利率 + 市场参考价        |
| 3   | 效用          | 价值感类型 + 建议方式          |
| 4   | 边际成本      | 船套数 + 单船套成本 + 回本年限 |
| 5   | 自定义        | 名称 + 金额                    |
| 6   | 其他费用/佣金 | 名称 + 金额                    |

---

## 4 级审批关键约束

- 每级都有 **售价区间**(基础数据快照,系数 × 项目总报价)
- 每级都要填 **实际售价**(不可越级代办)
- **总裁(CEO)拍板的售价 = 项目最终总报价**

---

## 项目状态机(`CostProjectProcessStatus`)

```
launched          → 发起完成
   ↓
waiting-cost      → 生产部填完成本
   ↓
costing           → 销售汇总中
   ↓
cost-complete     → 汇总完成
   ↓
waiting-price     → 等待销售定价
   ↓
pricing           → 定价编辑中
   ↓
set-price-submit  → 定价提交
   ↓
set-price-complete→ 定价完成
   ↓
complete          → 项目完成
```
