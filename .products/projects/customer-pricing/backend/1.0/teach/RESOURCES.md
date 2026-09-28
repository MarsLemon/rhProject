# 学习资源清单

## 一手资料(主公自己的项目)

### 代码(只读,用于理解业务)

| 路径                                                                               | 用途                                    |
| ---------------------------------------------------------------------------------- | --------------------------------------- |
| `Backend/supply/wk-sd-supply-api/src/main/java/com/wk/sd/cost/constant/`           | 枚举与常量(阶段/部门/成本类型/定价方法) |
| `Backend/supply/wk-sd-supply-api/src/main/java/com/wk/sd/cost/service/sale/`       | 销售定价核心(报价、定价入口)            |
| `Backend/supply/wk-sd-supply-api/src/main/java/com/wk/sd/cost/service/production/` | 生产部 9 项成本实现                     |
| `Backend/supply/wk-sd-supply-api/src/main/java/com/wk/sd/cost/service/foundation/` | 基础数据(汇率、售价区间系数)            |

### 已有文档(参考)

| 路径                                                                                         | 用途                    |
| -------------------------------------------------------------------------------------------- | ----------------------- |
| `.products\docs\teach\cost-accounting\reference\cost-accounting-flow.md`                     | 已生成的 Mermaid 流程图 |
| `.products/projects/...` 业务域决策                                                          | 业务域约束              |
| `Backend/customer-pricing/docs/reports/customer-pricing-cost-accounting-reference-report.md` | 已出具的借鉴报告        |

## 参考资料(可读可跳)

| 资源                            | 用途                                       |
| ------------------------------- | ------------------------------------------ |
| [《工业品定价方法》](通用参考)  | 成本加成 / 市场导向 / 边际成本等定价法理论 |
| [《项目管理 5 阶段》](通用参考) | 需求 → 设计 → 生产 → 交付 → 售后的通用框架 |
| [《多级审批机制》](通用参考)    | 治理结构与售价区间设计                     |

## 学习产出

### 课程(lessons/)

按主题分 lesson,一个 lesson 一个 HTML 文件,纯业务讲解。

### 速查表(reference/)

- 5 阶段速查
- 16 项成本矩阵速查
- 6 种定价法对照速查
- 4 级审批对照速查
- 9 状态流转速查
- 跨币种 + 汇率快照速查

### 学习记录(learning-records/)

每次 lesson 完成后,记录学到的关键洞察与疑问。
