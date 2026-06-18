---
title: Import Template Mismatch
created: 2026-06-11
updated: 2026-06-11
type: fix-plan
severity: high
status: fixed
tags: [fix-plan, qu, backend]
learned: Excel 模板列名变化必须同步 DTO @ExcelField;字段严格相等匹配,新模板前要 importDryRun
fixed_in: 待主人 commit 后回填
confidence: high
---

# 修复：试题导入「未发现可导入的试题数据」错误

## Context（背景与问题）

用户上传 `蓝鳍集训一阶段考试题（总）.xlsx` 通过 `/admin/repo/qu` 页面导入试题时，后端抛出「未发现可导入的试题数据！」（[QuImportApplicationServiceImpl.java:106](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/java/com/wk/traincenter/qu/application/impl/QuImportApplicationServiceImpl.java#L106)），同时用户访问 `http://localhost:4212/admin/repo/...xlsx` 看到 404。

**根因（已验证）**：

1. **「未发现试题」**：用户 Excel 使用**新模板格式**（列名带"（必填）"装饰、含"导入题库"列、"选项"作为合并表头占位符），而后端 5 个 `*ImportDTO` 的 `@ExcelField(title=...)` 仍是**旧模板列名**（`题目`、`正确答案`、`难度` 等）。`ImportExcel.getDataListBySheet` 在 [ImportExcel.java:219](file:///e:/rhProject/wk-train-center-service/yf-ability/src/main/java/com/yf/ability/excel/ImportExcel.java#L219) 的 `fieldMap.containsKey(key)` 严格相等匹配中把这些列全部丢弃，导致 5 个 DTO 的关键字段（`content`、`answer` 等）全部为 `null`。各 Parser 的"题目为空即跳过"逻辑把全部题目丢弃 → `allList.isEmpty() == true` → 触发 ServiceException。

2. **新模板使用"双表头"**：用户文件 Row 2 是占位行（"选项"重复 11 次），Row 3 才是真正的列名（A/B/C/D/...），需要 `headerNum=2`。

3. **404 URL**：用户把 Windows 本地文件路径直接粘到浏览器访问，命中 Vue dev server（端口 4212），与导入功能无关。**用户已确认：仅诊断说明，不修改代码。**

**目标**：让用户上传任意符合新模板格式的 xlsx 都能正常导入，并保证下载的模板 `repo_qu_tmpl.xlsx` 与 DTO 完全一致。

---

## 修复任务清单

### Task 1：升级 RadioImportDTO（单选题）

**文件**：[RadioImportDTO.java](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/java/com/wk/traincenter/qu/dto/importdto/RadioImportDTO.java)

修改 `@ExcelField(title=...)` 与新模板 Row 3 列名完全一致，并新增 `importRepoName` 字段（仅日志，不持久化）。

```java
@ExcelField(title = "序号（必填）", sort = 1)     private Integer idx;
@ExcelField(title = "导入题库（必填）", sort = 2)  private String importRepoName;  // 新增，仅日志
@ExcelField(title = "题目(必填)", sort = 3)        private String content;
@ExcelField(title = "正确答案(必填)", sort = 4)    private String answer;
@ExcelField(title = "A", sort = 5)                 private String itemA;
@ExcelField(title = "B", sort = 6)                 private String itemB;
@ExcelField(title = "C", sort = 7)                 private String itemC;
@ExcelField(title = "D", sort = 8)                 private String itemD;
@ExcelField(title = "E(勿删)", sort = 9)            private String itemE;
@ExcelField(title = "F(勿删)", sort = 10)           private String itemF;
@ExcelField(title = "G(勿删)", sort = 11)           private String itemG;
@ExcelField(title = "H(勿删)", sort = 12)           private String itemH;
@ExcelField(title = "I(勿删)", sort = 13)           private String itemI;
@ExcelField(title = "J(勿删)", sort = 14)           private String itemJ;
@ExcelField(title = "K(勿删)", sort = 15)           private String itemK;
@ExcelField(title = "L(勿删)", sort = 16)           private String itemL;
@ExcelField(title = "知识点", sort = 17)            private String pointNames;
@ExcelField(title = "难度*(必填)", sort = 18)       private String quLevel;
@ExcelField(title = "答案解析", sort = 19)          private String analysis;
```

### Task 2：升级 MultiImportDTO（多选题）

**文件**：[MultiImportDTO.java](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/java/com/wk/traincenter/qu/dto/importdto/MultiImportDTO.java)

字段结构与 Task 1 完全一致（单选题 vs 多选题只有答案格式不同）。

### Task 3：升级 JudgeImportDTO（判断题）

**文件**：[JudgeImportDTO.java](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/java/com/wk/traincenter/qu/dto/importdto/JudgeImportDTO.java)

判断题列结构：`序号（必填）、题目(必填)、正确答案(必填)、知识点、难度*(必填)、答案解析`。共 6 个字段。

### Task 4：升级 FillImportDTO（填空题）

**文件**：[FillImportDTO.java](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/java/com/wk/traincenter/qu/dto/importdto/FillImportDTO.java)

填空题列结构（新模板）：
- `序号（必填）`、`导入题库（必填）`、`题目(必填)` → 保留
- `填空项 × 12 列` → 旧模板是 `空1-空12`，列名必须改为 `填空项`（共 12 列）
- 新增 `作答上传图片` 列（**仅占位字段，本次先不解析图片**，仅做字段占位避免列被丢弃）
- `知识点`、`难度*(必填)`、`答案解析`

**注意**：新模板填空题每个空用 `a/b{/}b/c{/}{/}c` 格式（3 个备选用 `/` 分隔，`{/}` 防误判）。本次**仅修列头**，填空答案解析逻辑（如 `FillImportParserImpl` 取 `blank1` 第一个非空值）保持原样。**多备选答案解析作为后续优化项**。

### Task 5：升级 SaqImportDTO（简答题）

**文件**：[SaqImportDTO.java](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/java/com/wk/traincenter/qu/dto/importdto/SaqImportDTO.java)

简答题列结构：
- `序号（必填）`、`导入题库（必填）`、`题目(必填)`
- `关键词 × 12 列`（新模板列名统一为 `关键词`，而非 `关键词1-关键词12`）
- 新增 `作答上传图片` 列（同 Task 4 占位）
- `知识点`、`难度*(必填)`、`答案解析`

### Task 6：调整 ImportExcel 解析起始行

**文件**：[QuImportApplicationServiceImpl.java:67](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/java/com/wk/traincenter/qu/application/impl/QuImportApplicationServiceImpl.java#L67)

新模板有"双表头"（Row 2 是占位，Row 3 是真正列名），需将 `headerNum` 从默认 `1` 改为 `2`：

```java
// 原代码（L67）
ImportExcel excel = new ImportExcel(command.getFile());
// 改为
ImportExcel excel = new ImportExcel(command.getFile(), 2);  // headerNum=2 → 从 Excel 第 3 行（0-indexed=2）读表头
```

**原理**：新模板的 Row 1 是"单选题说明..."等说明文字，Row 2 是"选项"合并表头占位行，Row 3 才是真正的列名。`headerNum=2` 让 ImportExcel 跳过 Row 1 和 Row 2，从 Row 3 提取表头。同时因为 `addToList` 要求"非全空才加入"，Row 1/Row 2 的内容会被识别为"全空"或因 `headerMap` 不存在而提前 return。

### Task 7：替换下载模板资源

**文件**：[wk-modules/wk-module-qu/src/main/resources/excel/repo_qu_tmpl.xlsx](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/resources/excel/repo_qu_tmpl.xlsx)

用一份与新模板完全一致的结构重新生成该 xlsx（可用用户提供的 `蓝鳍集训一阶段考试题（总）.xlsx` 作为参考）。`WkQuImportController.downloadTemplate` 直接把这个文件流回给浏览器，必须保证：

- Row 1 是说明文字
- Row 2 是占位行（"选项"重复）
- Row 3 是真正列头：`序号（必填）、导入题库（必填）、题目(必填)、正确答案(必填)、A、B、C、D、E(勿删)…、知识点、难度*(必填)、答案解析`
- 每个 Sheet 按同样规则（单选题 / 多选题 / 判断题 / 填空题 / 简答题）

### Task 8：填空题答案解析升级（建议同步实施）

**文件**：[FillImportParserImpl.java](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/java/com/wk/traincenter/qu/domain/parser/impl/FillImportParserImpl.java)

新模板填空题每个空支持 3 个备选答案（用 `/` 分隔 + `{/}` 防误判）。当前 `FillImportParserImpl` 仅取 `blank1` 第一个非空值，**会丢失 2 个备选答案**。建议：

- 解析每个空时按 `/` 拆分（注意 `{/}` 是分隔符标记），生成 1-3 个备选答案
- 取第一个非空值作为主答案，其余作为备选答案列表存入 QuDetailDTO

**说明**：该 Task 为"建议同步实施"，若工作量评估后可拆分为独立 PR，本次仅做核心 DTO 升级。

---

## 关键修改文件路径

| 文件 | 修改 |
|------|------|
| [RadioImportDTO.java](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/java/com/wk/traincenter/qu/dto/importdto/RadioImportDTO.java) | 调整 `@ExcelField(title=...)` 18 个字段 |
| [MultiImportDTO.java](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/java/com/wk/traincenter/qu/dto/importdto/MultiImportDTO.java) | 同上，18 个字段 |
| [JudgeImportDTO.java](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/java/com/wk/traincenter/qu/dto/importdto/JudgeImportDTO.java) | 6 个字段 |
| [FillImportDTO.java](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/java/com/wk/traincenter/qu/dto/importdto/FillImportDTO.java) | 调整列名为"填空项"，新增"作答上传图片" |
| [SaqImportDTO.java](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/java/com/wk/traincenter/qu/dto/importdto/SaqImportDTO.java) | 列名统一为"关键词"，新增"作答上传图片" |
| [QuImportApplicationServiceImpl.java:67](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/java/com/wk/traincenter/qu/application/impl/QuImportApplicationServiceImpl.java#L67) | `headerNum=2` |
| [repo_qu_tmpl.xlsx](file:///e:/rhProject/wk-train-center-service/wk-modules/wk-module-qu/src/main/resources/excel/repo_qu_tmpl.xlsx) | 替换资源文件 |

---

## 验证方法

### 步骤 1：启动后端服务

```bash
cd e:\rhProject\wk-train-center-service
mvn spring-boot:run -pl wk-modules/wk-module-qu
```

### 步骤 2：下载模板对齐验证

浏览器访问 `http://localhost:8101/api/wk/qu/import/template`（需先登录获取 token），下载 `repo_qu_tmpl.xlsx`。

用 Excel 打开，确认：
- Row 3 列头 = `序号（必填）、导入题库（必填）、题目(必填)、正确答案(必填)、A、B、C、D、E(勿删)…、知识点、难度*(必填)、答案解析`
- 5 个 Sheet 都按此结构

### 步骤 3：导入用户文件

启动前端：

```bash
cd e:\rhProject\wk-train-center-ui
npm run dev
```

浏览器访问 `http://localhost:4212/admin/repo/qu`：
1. 选择一个测试题库
2. 点击「导入」
3. 上传 `蓝鳍集训一阶段考试题（总）.xlsx`
4. 预期：弹出「数据导入成功！」，列表新增 25 道单选题、40 道多选题、29 道判断题、2 道填空题、2 道简答题

### 步骤 4：日志验证

后端日志应输出（不再输出"未发现试题"）：

```
[试题导入] 单选题 Sheet 解析条数：25
[试题导入] 多选题 Sheet 解析条数：40
[试题导入] 判断题 Sheet 解析条数：29
[试题导入] 填空题 Sheet 解析条数：2
[试题导入] 简答题 Sheet 解析条数：2
[试题导入] 解析完成，总计 98 条待入库
[试题导入] 入库完成，成功 98 条，失败 0 条
```

### 步骤 5：异常路径验证

故意上传一个列名被改坏的 xlsx（如 Row 3 改成 `XXX, YYY, ZZZ`）：

预期：后端日志输出 `[单选导入] 跳过空题目，序号=null` 警告，前端弹出"未发现可导入的试题数据！"（与之前一致），但**用户能明确知道是模板问题**（已记录改进项）。

---

## 关联风险

### 风险 1：填空题多备选答案未支持

**问题**：新模板填空题每个空支持 3 个备选答案（`a/b{/}b/c`），当前 `FillImportParserImpl` 仅取第一个非空值，会丢失 2/3 的答案。

**缓解**：本次修复后填空题仍能成功导入（仅主答案入库）。完整多答案解析建议作为 Task 8 同步实施，或拆分为独立 PR。

### 风险 2：图片列未处理

**问题**：新模板填空题/简答题新增"作答上传图片"列，后端当前没有"导入时上传图片"流程。

**缓解**：本次在 DTO 中占位 `@ExcelField(title = "作答上传图片") String imageUrl` 字段但不解析，图片列会被丢弃但不影响题目导入。

### 风险 3：多选题重复题

**问题**：用户文件多选题存在重复题（第 31/36 题、第 34/39 题、第 25/40 题几乎相同）。

**缓解**：本次修复后这些重复题都会成功入库。建议业务方在导入前手动 dedup，或后续在 `QuImportRepositoryImpl.saveAll` 入口按 `content` 哈希去重（需产品确认）。

### 风险 4：旧模板用户的数据兼容性

**问题**：路径 1 改了 DTO 列头，之前用旧模板录入的 xlsx 重新导入会失败（列名不匹配）。

**缓解**：因为 `repo_qu_tmpl.xlsx` 已替换为新模板，运营方后续都应使用新模板；旧模板的历史数据不影响已入库数据。

### 风险 5：yf-ability 模块的 ImportExcel 修改

**说明**：本次未修改 [ImportExcel.java](file:///e:/rhProject/wk-train-center-service/yf-ability/src/main/java/com/yf/ability/excel/ImportExcel.java)，仅修改调用方传入的 `headerNum`。这保证 `yf-ability` 模块对其他项目零影响。

---

## 不在本计划范围

1. **404 URL 体验优化**（用户已确认不修改）
2. **填空题多答案解析完整实现**（建议拆分为独立 PR）
3. **导入时图片上传流程**（需要新设计后端存储与访问逻辑）
4. **导入题目去重检查**（需产品确认策略）
5. **错误提示细化**（"未发现试题" → "模板列名不匹配"，可在 Task 6 同步实施）
