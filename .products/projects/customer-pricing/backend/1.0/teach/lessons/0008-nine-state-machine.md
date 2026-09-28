# Lesson 0008:一个项目的 9 个状态

<div class="meta">主题:9 状态流转 | 难度:★★☆ | 阅读时间:6 分钟</div>

---

## 一句话

**每个项目从"发起"到"完成"必须经过 9 个状态,顺序流转,不能跳。状态卡在哪,谁该动,一目了然。**

---

## 9 个状态

```
① 发起项目完成        launched
       ↓
② 生产表规格厂商完成   waiting-cost      ← 生产部填完 9 项成本
       ↓
③ 销售成本统计提交    costing          ← 销售汇总中
       ↓
④ 销售成本统计提交完成 cost-complete   ← 汇总完成
       ↓
⑤ 销售部门制定定价    waiting-price    ← 等待销售开始定价
       ↓
⑥ 销售部门制定定价中  pricing          ← 销售编辑中
       ↓
⑦ 销售部门制定定价提交 set-price-submit
       ↓
⑧ 销售部门制定定价提交完成 set-price-complete
       ↓
⑨ 项目完成            complete
```

---

## 状态机图

<div class="flow">

发起项目 ─→ launched
              ↓
         waiting-cost      ← 状态卡这:生产部该填成本了
              ↓
         costing           ← 状态卡这:销售在汇总
              ↓
         cost-complete
              ↓
         waiting-price     ← 状态卡这:销售该开始定价了
              ↓
         pricing           ← 状态卡这:销售在编辑报价
              ↓
         set-price-submit
              ↓
         set-price-complete
              ↓
         complete          ← 项目完成 ✓
</div>

---

## 每个状态的"看护人"

| 状态 | 谁该动 | 在干什么 |
|---|---|---|
| launched | 销售 | 刚发起项目,等各部门接手 |
| **waiting-cost** | **生产/采购** | 各部门该填自己的那部分成本 |
| costing | 销售 | 销售在汇总 16 项成总成本 |
| cost-complete | — | 中间过渡态 |
| **waiting-price** | **销售** | 销售该开始定价(选方法) |
| **pricing** | **销售** | 销售在编辑报价(初步+修正) |
| set-price-submit | — | 销售提交,等审批 |
| **set-price-complete** | **领导层** | 4 级审批中 |
| complete | — | 项目完成 |

---

## 关键状态转换点

### 转换 1:launched → waiting-cost

**触发**:销售发起项目完成

**关键动作**:
- 生产部、采购部、销售部各自开始填自己那部分成本
- **互不等待**,并行填

---

### 转换 2:waiting-cost → costing

**触发**:16 项成本全部提交完成

**关键动作**:
- 销售开始触发"汇总"操作
- 系统按汇率快照折算 + 求和

---

### 转换 3:costing → waiting-price

**触发**:总成本汇总完成

**关键动作**:
- 销售准备开始定价
- **这一步同时触发"汇率快照锁定"**(详见 [Lesson 0005](./0005-total-cost-aggregation.md))

---

### 转换 4:waiting-price → pricing

**触发**:销售主动"开始定价"

**关键动作**:
- 销售选一种主方法 + 附加项
- 开始填各方法需要的字段

---

### 转换 5:pricing → set-price-submit

**触发**:销售提交报价

**关键动作**:
- 报价从"编辑态"变"待审批态"
- 4 级审批开始

---

### 转换 6:set-price-submit → set-price-complete

**触发**:4 级审批都通过

**关键动作**:
- 总裁填了实际售价
- 项目最终总报价确定

---

### 转换 7:set-price-complete → complete

**触发**:项目关闭

**关键动作**:
- 项目归档
- 不能再改任何数据

---

## 为什么需要状态机

| 不需要状态机 | 需要状态机 |
|---|---|
| 谁都能改任何数据 | 谁在哪个状态能干什么,清晰 |
| 出问题不知道卡在哪 | 看状态就知道卡哪、谁该动 |
| 没有"提交"概念 | 有明确"提交 → 审批 → 完成"节点 |
| 数据无 | 审计、可追溯 |

> **关键洞察**:**状态机不是为了"管控",是为了"协作清晰"** — 让各部门知道"下一步该我做什么"。

---

## 状态机的"红线"

**严格规则**:
- ❌ 不能跳状态(必须按顺序流转)
- ❌ 不能回到前一个状态(项目一旦提交,不能"反悔")
- ✅ 只能在当前状态做"该状态允许的操作"

**例外**:
- ✅ 总裁可以"打回"(从 set-price-complete 回 pricing)
- ✅ 但打回需要明确理由,留 audit trail

---

## 关键认知

| # | 要点 |
|---|---|
| 1 | 9 状态严格按顺序流转 |
| 2 | 每状态都有明确的"看护人"(该谁动) |
| 3 | **汇率快照在 waiting-price → pricing 时锁定** |
| 4 | 总裁可"打回",但留 audit |
| 5 | 状态机的本质是**协作清晰**,不是管控 |

---

## 自测题

<div class="quiz">

**Q1. 项目卡在 waiting-cost 状态,谁该动?**

- A. 销售
- B. 生产/采购
- C. 总裁
- D. 谁都不该动,系统坏了

<details>
<summary>显示答案</summary>
<div class="quiz-answer">
<strong>B</strong> — waiting-cost 状态 = 等待成本填完,是<strong>生产部和采购部</strong>该动的时候。销售已经发起了,在等各部门填成本。
</div>
</details>

</div>

<div class="quiz">

**Q2. 汇率快照在哪两个状态之间锁定?**

- A. launched → waiting-cost
- B. waiting-cost → costing
- C. waiting-price → pricing
- D. pricing → set-price-submit

<details>
<summary>显示答案</summary>
<div class="quiz-answer">
<strong>C</strong> — waiting-price → pricing(销售开始定价的那一刻)锁定。<strong>锁定后</strong>这单的汇率不再变。
</div>
</details>

</div>

<div class="quiz">

**Q3. 状态机能跳着走吗?**

- A. 能,紧急情况下可以
- B. 不能,严格按顺序

<details>
<summary>显示答案</summary>
<div class="quiz-answer">
<strong>B</strong> — 严格按顺序流转,不能跳。<strong>唯一例外</strong>:可以"打回"(从后状态回前状态),但要留 audit。
</div>
</details>

</div>

---

<div class="ask">
下一步:<strong>Lesson 0009 — 完整经营例子</strong>(把所有东西串起来,跑一个真实场景)
</div>

<div class="nav">
<a href="./0007-four-level-approval.md">← Lesson 0007</a>
<a href="./0009-complete-example.md">Lesson 0009:完整例子 →</a>
</div>