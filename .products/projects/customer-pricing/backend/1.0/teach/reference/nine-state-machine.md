# 9 状态流转速查表

## 9 状态顺序

```
① launched               发起项目完成
② waiting-cost           生产表规格厂商完成
③ costing                销售成本统计提交
④ cost-complete          销售成本统计提交完成
⑤ waiting-price          销售部门制定定价
⑥ pricing                销售部门制定定价中
⑦ set-price-submit       销售部门制定定价提交
⑧ set-price-complete     销售部门制定定价提交完成
⑨ complete               项目完成
```

## 关键转换点

| 转换 | 触发 | 关键动作 |
|---|---|---|
| launched → waiting-cost | 销售发起完成 | 3 部门开始填成本 |
| waiting-cost → costing | 16 项成本全部提交 | 销售触发汇总 |
| costing → waiting-price | 总成本汇总完成 | — |
| **waiting-price → pricing** | 销售开始定价 | **汇率快照锁定** |
| pricing → set-price-submit | 销售提交报价 | 4 级审批开始 |
| set-price-submit → set-price-complete | 4 级全部通过 | 总裁填最终售价 |
| set-price-complete → complete | 项目关闭 | 归档 |

## 看护人

| 状态 | 谁该动 |
|---|---|
| waiting-cost | 生产 + 采购 |
| costing / pricing | 销售 |
| set-price-* | 领导层 |

## 红线

- ❌ 不能跳状态
- ✅ 总裁可"打回",留 audit