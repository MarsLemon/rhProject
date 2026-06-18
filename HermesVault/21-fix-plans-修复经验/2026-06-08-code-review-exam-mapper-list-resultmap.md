---
title: Review Exam Mapper List Resultmap
created: 2026-06-08
updated: 2026-06-08
type: fix-plan
severity: blocker
status: open
tags: [fix-plan, code, backend]
learned: MyBatis resultMap 缺列会运行时炸;反向引用 SQL 必须穷举返回字段
confidence: high
---

# Exam 反向引用 SQL resultMap 缺列

- **发现时间**: 2026-06-08
- **来源**: code-review
- **关联提交/PR**: 当前 working tree（试卷反向引用 TmplController.referencedExams）
- **严重度**: 🟥 阻塞合并

## 现象

`/api/exam/tmpl/referenced-exams` 调用即抛 `ReflectionException` / MyBatis `TooManyResultsException`。

## 触发条件

1. 管理员在试卷管理点"查看关联"
2. 前端调用 `POST /api/exam/tmpl/referenced-exams`
3. MyBatis 解析 SQL 投影列 `ex.offline`、`ex.cat_id` 时，ListResultMap 缺少对应 `<result>` 映射
4. 抛 `Bean property 'offline' is not writable or has an invalid setter` 类似异常
5. 反向引用功能整体不可用

## 修复建议

`E:\rhProject\wk-train-center-service\yf-modules\yf-module-exam\src\main\resources\mapper\admin\exam\ExamMapper.xml` 在 `ListResultMap` 内补齐两列：

```xml
<result column="offline" property="offline" />
<result column="cat_id" property="catId" />
```

注意：原 SELECT 还投影了 `create_time` / `update_time` / `update_by`，resultMap 也缺，**建议一次性补齐**避免下次又踩坑。

## 相关文件

- `E:\rhProject\wk-train-center-service\yf-modules\yf-module-exam\src\main\resources\mapper\admin\exam\ExamMapper.xml`
- `E:\rhProject\wk-train-center-service\yf-modules\yf-module-exam\src\main\java\com\yf\exam\modules\admin\tmpl\controller\TmplController.java`
- `E:\rhProject\wk-train-center-service\yf-modules\yf-module-exam\src\main\java\com\yf\exam\modules\admin\tmpl\service\impl\TmplServiceImpl.java`

## 状态

- [ ] 待修复
