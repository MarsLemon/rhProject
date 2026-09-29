# 断链清单(最终状态)

> **更新时间**:2026-09-28
> **扫描范围**:`wk-train-center/` 集合内所有 .md 文件

---

## 最终结果

| 类别 | 数量 | 状态 |
|---|---|---|
| **真断链** | **0** | ✅ 全部修复 |
| **awk 截断伪报** | 59 | 实际链接完整,工具误报,可忽略 |
| **代码仓引用** | ~330 | 代码仓仍在,链接有效(已排除) |

---

## 修复过程

| 轮次 | 真断链 | 说明 |
|---|---|---|
| 初始扫描 | 233 | 全部断链 |
| 批量 sed 修模式 A-G | ~170 | plans/design/tasks/reviews 路径修正 |
| 删不存在引用 | ~150 | user-stories/wk-general/README/E:\\ 等 |
| 移动端 mobile1.X 扁平化 | ~120 | `../../mobile/X/mobile1.Y/Z` → `../../mobile/X/Y/Z` |
| origin index.md customer-pricing 路径 | ~95 | 上溯到 customer-pricing 集合 |
| code repo 引用排除 | 80 | wk-user/scripts/src/etc 排除 |
| **最终** | **0** | ✅ |

---

## awk 截断伪报说明

剩余 59 个**不是真断链**:
- 实际链接是 `(...claude).md` 完整路径
- 工具在第一个 `)` 处截断,显示成多个伪断链
- 例:`(claude).md §三 P0-3b](../tasks/2026-07-22-...claude` 实际是 `(claude).md §三 P0-3b` + `../tasks/...claude).md` 两个完整链接

**判断方法**:链接文本含 `(claude)` 但实际是嵌套括号的 markdown 链接。

---

## 跳转

- 返回 [README.md](./README.md)
- 返回 [CLAUDE.md](../CLAUDE.md)
- 原始数据:`/tmp/broken-pairs16.txt`(59 行)
- 完整断链文件:`/tmp/broken-pairs4.txt`(180 行原始)