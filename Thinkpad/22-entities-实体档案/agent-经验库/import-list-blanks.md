---
name: shared-experiences-2026-07-17-import-list-blanks
description: 导入题型多空答案不应 String.join 拼成单条;填空题脏数据诊断用 content 含逗号 + tag 全 1 + rows=1 三特征
metadata:
  type: feedback
---

# 教训:导入题型多空答案禁止 join 单条 + 填空题脏数据诊断三特征

## 一句话

**任何多空/多选项/多关键词题型的导入/保存路径,答案必须 N 条入库,严禁 `String.join(",", list)` 拼成单条 content 入库。** 脏数据诊断三特征:**content 含逗号 AND tag 全为 "1" AND 同一 qu_id 行数=1**。

## 触发场景

- Excel/JSON 导入填空题、简答题关键词、多空单选等题型
- 解析层把 N 个候选答案拼成一条写库("节省行数"反模式)
- 用户报"导入后答案合并成一格"

## 反模式 vs 正模式

### ❌ 反模式(String.join 拼单条)

```java
// 老代码 FillImportParserImpl (commit 97482bf 前)
List<String> answers = new ArrayList<>();
for (String b : blanks) {
    if (StringUtils.isNotBlank(b)) {
        answers.add(b.trim());
    }
}
QuAnswerDTO ans = new QuAnswerDTO();
ans.setTag("A");
ans.setContent(String.join(",", answers));   // ★ 多空拼一条
ans.setIsRight(true);
List<QuAnswerDTO> answerList = new ArrayList<>();
answerList.add(ans);
```

后果:DB 里 `el_qu_answer.content = "黄铜,白铜,青铜"` 一条记录,前端表单读回时显示"1 个空含 3 答案";后端 QuAnswerServiceImpl 又会把 tag 改写成 "1",丢失原始语义。

### ✅ 正模式(每空独立一条 + scoreRate 拆分)

```java
int blankCount = answers.size();
int baseRate = 100 / blankCount;
int remainder = 100 - baseRate * blankCount;
List<QuAnswerDTO> answerList = new ArrayList<>(blankCount);
for (int i = 0; i < blankCount; i++) {
    QuAnswerDTO ans = new QuAnswerDTO();
    ans.setTag(String.valueOf((char) ('A' + i)));
    ans.setContent(answers.get(i));
    ans.setIsRight(true);
    ans.setScoreRate(i == 0 ? baseRate + remainder : baseRate);
    answerList.add(ans);
}
```

每空独立一条记录,scoreRate 均分 100,余数加第一项,前端按行展示按空评分。

## 决策树

```
"导入/保存题型时,多个答案怎么存?"
  ├─ 多空(填空)/多关键词(简答)/多选项(单选多选判断)
  │    └─ 每答案/每空/每关键词一条 QuAnswerDTO
  │         + tag 用 A/B/C 或 1/2/3
  │         + content 存单一答案内容(不带分隔符)
  └─ 单条文本(题干/解析/图片)
       └─ 直接存 content 字段
```

## 填空题脏数据诊断三特征

DB 出现 `el_qu_answer` 表填空题合并写入时,几乎同时满足:

| 特征 | 原因 |
|---|---|
| `content LIKE '%,%' OR content LIKE '%，%'` | 老 bug `String.join(",", ...)` 写入 |
| `tag = '1'`(且 qu_id 下唯一) | QuAnswerServiceImpl 第 103 行 `setTag(String.valueOf((i+1)))` 0-based+1 覆盖 |
| `COUNT(*) GROUP BY qu_id = 1` | 单条 join 记录,无独立空 |

**诊断 SQL 模板** 放在 `db/mobile-1.1/ai/diag_fill_answer_joined.sql`,主人已选"仅给干跑 SQL" → 全 SELECT 不写。

## 必须做的自检清单

- [ ] 任何 `parse(List<...ImportDTO>)` 方法,N 个候选字段必须循环生成 N 个 QuAnswerDTO
- [ ] 禁止 `String.join`、`Arrays.toString`、`+` 直接拼接候选答案 content
- [ ] 禁止手工设 tag="A" 后就让多个答案共用同一条记录
- [ ] saveAll 路径不能再有 `setTag(String.valueOf((i+1)))` 这种隐式覆盖(如确需,改显式 caller 传 tag)
- [ ] 填空题导入后立刻跑诊断 SQL 三特征,直到返回 0 行

## 命中历史

- 2026-07-17 [填空题导入 join bug](.products/projects/wk-train-center-service/db/mobile-1.1/ai/diag_fill_answer_joined.sql) — 老 FillImportParserImpl 第 62-66 行 String.join → 写脏数据;主人截图 `变宽,漂移` 单条 join
- 2026-06-22 commit 97482bf 修了导入层,但生产脏数据未清洗,需 SQL 兜底

## 红线

**禁止**:任何导入/批量保存路径用 `String.join(",", list)` 把多答案拼成单条

**禁止**:tag 全 '1' 的填空题单条记录视为合法数据 — 必是 join 脏数据