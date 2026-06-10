# 试题导入模板多 Sheet 改造方案

## Context（背景与目标）

### 当前问题
当前系统路径 `/admin/repo/qu` 中的试题导入功能使用单一 Sheet 模板（`试题导入模板 (1).xlsx`），所有题型（单选、多选、填空、简答、判断、组合题、不定项）混杂在同一张表中，用户需要记忆字段含义，UX 较差且容易填错。

### 改造目标
按用户提供的真实文件 `蓝鳍集训一阶段考试题（总）.xlsx` 作为参考，将模板改造为 **6 个 Sheet 页**：

| Sheet 顺序 | Sheet 名 | 题型 | 字段定义 |
|---|---|---|---|
| 1 | 原模板-批量导入 | 混合题型 | 保留原 15 列：题型/是否组合项/难易程度/章节/题干/选项A-H/答案/解析 |
| 2 | 单选题 | 单选 | 序号/导入题库/题目/正确答案/选项A-H/知识点/难度/答案解析 |
| 3 | 多选题 | 多选 | 同上 |
| 4 | 填空题 | 填空 | 序号/导入题库/题目/空1-空6/知识点/难度/答案解析 |
| 5 | 简答题 | 简答 | 序号/导入题库/题目/关键词1-关键词7/知识点/难度/答案解析 |
| 6 | 判断题 | 判断 | 序号/导入题库/题目/正确答案/知识点/难度/答案解析 |

### 关键约束（用户已确认）
1. **答案格式**：字母格式（如 `A`、`B`、`A,C,D`），填空题写入"有序/无序"
2. **导入策略**：每个 Sheet 独立解析逻辑（每种题型一个 DTO）
3. **新字段处理**：『导入题库』『知识点』需要**实际解析并存储到数据库**
4. **兼容性**：**不兼容旧模板**，直接替换资源文件并提示用户升级

## 改造范围

### 后端（核心改造）
**新增 5 个 DTO + 扩展 ImportExcel 工具 + 改造 QuController/QuServiceImpl/QuConvert**

### 前端（无需修改）
`ImportExcel.vue` 通用组件已经支持任意 Excel 文件上传，前端 `index.vue` 也已传入正确的 `action` 和 `template`，**前端代码 0 修改**。

### 数据库
**无需修改表结构**——知识点关联通过现有 `el_sys_key_point_ref` 表 + `SysKeyPointRefService.saveAll(SysObjType.QU, ...)` 实现。

## 关键文件清单

| 文件 | 操作 | 说明 |
|---|---|---|
| `yf-ability/src/main/java/com/yf/ability/excel/ImportExcel.java` | 修改 | 扩展支持按 Sheet 索引解析 |
| `yf-module-repo/.../qu/dto/import/RadioImportDTO.java` | 新建 | 单选题 DTO |
| `yf-module-repo/.../qu/dto/import/MultiImportDTO.java` | 新建 | 多选题 DTO |
| `yf-module-repo/.../qu/dto/import/FillImportDTO.java` | 新建 | 填空题 DTO |
| `yf-module-repo/.../qu/dto/import/SaqImportDTO.java` | 新建 | 简答题 DTO |
| `yf-module-repo/.../qu/dto/import/JudgeImportDTO.java` | 新建 | 判断题 DTO |
| `yf-module-repo/.../qu/controller/QuController.java` | 修改 | 改造 importFile 调用 |
| `yf-module-repo/.../qu/service/impl/QuServiceImpl.java` | 修改 | 改造 importExcel 接收方式 |
| `yf-module-repo/.../qu/utils/QuConvert.java` | 修改 | 增加多 Sheet 解析 + 知识点/题库解析 |
| `yf-module-repo/src/main/resources/excel/repo_qu_tmpl.xlsx` | 替换 | 新多 Sheet 模板 |

## 详细实施步骤

### Task 1：扩展 `ImportExcel` 工具类支持多 Sheet 解析

**文件**：`yf-ability/src/main/java/com/yf/ability/excel/ImportExcel.java`

**改造要点**：
- 把现有 `private List<String> headerList` 改为 `Map<Integer, List<String>> headerMap`（key=sheetIndex）
- 把现有 `private List<Map<String, Object>> dataList` 改为 `Map<Integer, List<Map<String, Object>>> sheetDataMap`
- `RowHandler` 中把 `rowIndex == headerNum` 改为 `rowIndex == headerNum` 时记录当前 sheet 的表头到 `headerMap`
- 数据行按 sheetIndex 分别放入 `sheetDataMap`
- 新增 `getDataListBySheet(int sheetIndex, Class<E> cls)` 方法
- 保留原 `getDataList(Class<E> cls)` 方法（向后兼容——所有 sheet 合并返回）

**关键代码片段**：
```java
private Map<Integer, List<String>> headerMap = new HashMap<>();
private Map<Integer, List<Map<String, Object>>> sheetDataMap = new HashMap<>();

private RowHandler createRowHandler() {
    return (sheetIndex, rowIndex, rowList) -> {
        // 每个 sheet 单独记录表头
        if (rowIndex == headerNum) {
            List<String> headers = new ArrayList<>();
            for (Object obj : rowList) {
                headers.add(String.valueOf(obj));
            }
            headerMap.put(sheetIndex, headers);
            return;
        }
        if (!headerMap.containsKey(sheetIndex)) {
            return;
        }
        List<String> headers = headerMap.get(sheetIndex);
        Map<String, Object> map = new HashMap<>(16);
        for (int i = 0; i < rowList.size() && i < headers.size(); i++) {
            map.put(headers.get(i), rowList.get(i));
        }
        this.addToList(map, sheetIndex);
    };
}

private void addToList(Map<String, Object> map, int sheetIndex) {
    // ... 同原逻辑，按 sheetIndex 分组
    sheetDataMap.computeIfAbsent(sheetIndex, k -> new ArrayList<>()).add(map);
}

public <E> List<E> getDataListBySheet(int sheetIndex, Class<E> cls) {
    List<Map<String, Object>> dataList = sheetDataMap.getOrDefault(sheetIndex, Collections.emptyList());
    // ... 同原 getDataList 逻辑
}
```

### Task 2：新建 5 个按题型 DTO

**目录**：`yf-module-repo/src/main/java/com/yf/repo/modules/admin/qu/dto/import/`

每个 DTO 用 `@ExcelField(title="...", sort=N)` 注解对应 Sheet 列：

#### RadioImportDTO（单选题）
```java
@ExcelField(title="序号", sort=1)        private Integer idx;
@ExcelField(title="导入题库", sort=2)    private String repoName;     // 新字段
@ExcelField(title="题目", sort=3)        private String content;
@ExcelField(title="正确答案", sort=4)    private String answer;
@ExcelField(title="选项A", sort=5)       private String itemA;
@ExcelField(title="选项B", sort=6)       private String itemB;
@ExcelField(title="选项C", sort=7)       private String itemC;
@ExcelField(title="选项D", sort=8)       private String itemD;
@ExcelField(title="选项E", sort=9)       private String itemE;
@ExcelField(title="选项F", sort=10)      private String itemF;
@ExcelField(title="选项G", sort=11)      private String itemG;
@ExcelField(title="选项H", sort=12)      private String itemH;
@ExcelField(title="知识点", sort=13)     private String pointNames;   // 新字段（逗号分隔）
@ExcelField(title="难度", sort=14)       private String quLevel;
@ExcelField(title="答案解析", sort=15)   private String analysis;
```

#### MultiImportDTO（多选题）
同 RadioImportDTO 字段。

#### FillImportDTO（填空题）
将选项 A-H 替换为空 1-空 6：
```java
@ExcelField(title="空1", sort=5) ~ 空6   private String blank1 ~ blank6;
```

#### SaqImportDTO（简答题）
将选项 A-H 替换为关键词 1-关键词 7：
```java
@ExcelField(title="关键词1", sort=5) ~ 关键词7  private String kw1 ~ kw7;
```

#### JudgeImportDTO（判断题）
只有 2 个选项（A=正确/B=错误）+ 正确答案 + 知识点 + 难度 + 答案解析：
```java
@ExcelField(title="选项A", sort=5)  private String itemA;  // 正确
@ExcelField(title="选项B", sort=6)  private String itemB;  // 错误
```

### Task 3：扩展 `QuConvert` 工具类

**文件**：`yf-module-repo/src/main/java/com/yf/repo/modules/admin/qu/utils/QuConvert.java`

**新增方法**：

#### `parseRadioImport(RadioImportDTO dto)` / `parseMultiImport` / `parseFillImport` / `parseSaqImport` / `parseJudgeImport`

每个方法做以下转换：
1. 题型映射：题型固定（`typeMap.get("单选题")` 等）
2. 难度映射：`levelMap.get(dto.getQuLevel())`
3. 答案提取：
   - 单选/多选/判断：`fillFromItems(itemA-H) + isAnswer(tag, answer)`
   - 填空：从 `blank1-6` 提取，空值用 `_____` 占位
   - 简答：从 `kw1-7` 提取关键词，与 content 合并
4. **知识点解析**（新增）：
   ```java
   private List<SysKeyPointRefRespDTO> parsePointNames(String pointNames) {
       if (StringUtils.isBlank(pointNames)) return Collections.emptyList();
       List<String> codes = Arrays.stream(pointNames.split(","))
               .map(String::trim).filter(StringUtils::isNotBlank).collect(Collectors.toList());
       if (codes.isEmpty()) return Collections.emptyList();
       // 批量查询 el_sys_key_point 表
       List<SysKeyPoint> kps = sysKeyPointService.listByCodes(codes);
       return kps.stream().map(kp -> {
           SysKeyPointRefRespDTO ref = new SysKeyPointRefRespDTO();
           ref.setPointCode(kp.getPointCode());
           ref.setPointName(kp.getPointName());
           ref.setId(kp.getId());
           return ref;
       }).collect(Collectors.toList());
   }
   ```
5. **导入题库解析**（新增，可选）：
   ```java
   private String parseRepoId(String repoName, String defaultRepoId) {
       if (StringUtils.isBlank(repoName)) return defaultRepoId;
       // 按名称查询 el_repo
       Repo repo = repoService.getOne(new QueryWrapper<Repo>().eq("title", repoName));
       return repo != null ? repo.getId() : defaultRepoId;
   }
   ```
6. 返回 `QuDetailDTO`（含 pointList + repoId + answerList + content）

#### 复用 `parseItemContent` / `isAnswer` / `fillItem` / `percentStart` 方法

### Task 4：改造 `QuController.importFile`

**文件**：`yf-module-repo/src/main/java/com/yf/repo/modules/admin/qu/controller/QuController.java`

```java
@PostMapping("/import")
public ApiRest importFile(@RequestParam("file") MultipartFile file,
                          @RequestParam("repoId") String repoId) {
    ImportExcel excel = new ImportExcel(file);
    List<QuDetailDTO> allList = new ArrayList<>();
    
    // Sheet 0: 原模板-批量导入（兼容旧格式）
    List<QuExportDTO> oldList = excel.getDataListBySheet(0, QuExportDTO.class);
    if (!oldList.isEmpty()) {
        allList.addAll(quConvert.prepareImport(oldList, repoId));
    }
    // Sheet 1: 单选题
    List<RadioImportDTO> radioList = excel.getDataListBySheet(1, RadioImportDTO.class);
    if (!radioList.isEmpty()) {
        allList.addAll(quConvert.prepareRadioImport(radioList, repoId));
    }
    // Sheet 2: 多选题
    List<MultiImportDTO> multiList = excel.getDataListBySheet(2, MultiImportDTO.class);
    if (!multiList.isEmpty()) {
        allList.addAll(quConvert.prepareMultiImport(multiList, repoId));
    }
    // Sheet 3: 填空题
    List<FillImportDTO> fillList = excel.getDataListBySheet(3, FillImportDTO.class);
    if (!fillList.isEmpty()) {
        allList.addAll(quConvert.prepareFillImport(fillList, repoId));
    }
    // Sheet 4: 简答题
    List<SaqImportDTO> saqList = excel.getDataListBySheet(4, SaqImportDTO.class);
    if (!saqList.isEmpty()) {
        allList.addAll(quConvert.prepareSaqImport(saqList, repoId));
    }
    // Sheet 5: 判断题
    List<JudgeImportDTO> judgeList = excel.getDataListBySheet(5, JudgeImportDTO.class);
    if (!judgeList.isEmpty()) {
        allList.addAll(quConvert.prepareJudgeImport(judgeList, repoId));
    }
    
    if (allList.isEmpty()) {
        throw new ServiceException("未发现可导入的试题数据！");
    }
    
    baseService.importExcel(allList, repoId);
    return super.success();
}
```

### Task 5：改造 `QuServiceImpl.importExcel`

**文件**：`yf-module-repo/src/main/java/com/yf/repo/modules/admin/qu/service/impl/QuServiceImpl.java`

改造点：
- 接收统一 `List<QuDetailDTO>`，不再调用 `quConvert.prepareImport`
- 去掉 hardcoded `int line = 3`，改为每个 `QuDetailDTO` 自带 `sourceRow` 字段
- 保留原有的 `save` 逻辑（已经在 save 时通过 `SysKeyPointRefService.saveAll` 保存知识点）

```java
@Transactional(rollbackFor = Exception.class)
@Override
public void importExcel(List<QuDetailDTO> list, String repoId) {
    for (QuDetailDTO dto : list) {
        Integer line = dto.getSourceRow();
        this.save(dto, line);
    }
}
```

并在 `QuDetailDTO` 中新增 `private Integer sourceRow;` 字段（或在 `QuConvert` 解析时记录）。

### Task 6：替换模板资源文件

**文件**：`yf-module-repo/src/main/resources/excel/repo_qu_tmpl.xlsx`

替换为新多 Sheet 版本，结构：
- Sheet 1「原模板-批量导入」：15 列（题型/是否组合项/难易程度/章节/题干/选项A-H/答案/解析）+ 1 行示例
- Sheet 2「单选题」：15 列（序号/导入题库/题目/正确答案/选项A-H/知识点/难度/答案解析）+ 1 行示例
- Sheet 3「多选题」：同单选题 + 1 行示例
- Sheet 4「填空题」：15 列（序号/导入题库/题目/空1-空6/知识点/难度/答案解析）+ 1 行示例
- Sheet 5「简答题」：15 列（序号/导入题库/题目/关键词1-关键词7/知识点/难度/答案解析）+ 1 行示例
- Sheet 6「判断题」：13 列（序号/导入题库/题目/选项A/选项B/正确答案/知识点/难度/答案解析）+ 1 行示例

每个 Sheet 添加冻结首行 + 表头加粗 + 列宽自适应。

### Task 7：在 `QuConvert` 注入新依赖

**文件**：`yf-module-repo/src/main/java/com/yf/repo/modules/admin/qu/utils/QuConvert.java`

新增依赖注入：
```java
private final SysKeyPointService sysKeyPointService;
private final RepoService repoService;
```

（如 `SysKeyPointService.listByCodes` 方法不存在，需要在 `SysKeyPointService` 中新增批量查询方法）

## 验证（Verification）

### 单元测试 / 手工验证

1. **模板下载验证**
   - 在浏览器打开 `/admin/repo/qu` → 点击「导入」按钮 → 点击「下载导入模板」
   - 检查下载文件名为 `试题导入模板.xlsx`
   - 打开文件验证包含 6 个 Sheet

2. **单一 Sheet 导入验证（原模板）**
   - 在 Sheet 1 填写一条单选题：A/B/C/D 选项 + 答案 A
   - 上传并确认成功入库

3. **多 Sheet 导入验证（按题型）**
   - 在 Sheet 2「单选题」填写 3 条记录
   - 在 Sheet 3「多选题」填写 2 条记录
   - 在 Sheet 4「填空题」填写 2 条记录
   - 在 Sheet 5「简答题」填写 1 条记录
   - 在 Sheet 6「判断题」填写 1 条记录
   - 上传并确认 9 条全部入库

4. **新字段验证**
   - 在 Sheet 2 填写知识点为「A01, A0101」，导入题库留空
   - 上传后查询数据库：`el_qu` 表中题目存在，`el_sys_key_point_ref` 表中存在 2 条 `ref_type='QU'` 关联记录

5. **不兼容旧模板验证**
   - 尝试上传旧单一 Sheet 模板
   - 检查系统提示错误信息明确（由于 Sheet 0 没有题型列数据，整个解析会因 0 条数据而提示"未发现可导入的试题数据"）

6. **边界场景**
   - 上传空文件 → 提示错误
   - 上传非 xlsx → 提示格式错误
   - 题目为空 → 提示「题目不能为空」
   - 知识点不存在 → 提示「知识点 XXX 不存在」或忽略（视实现）
   - 导入题库名不存在 → 默认使用当前 repoId

### 关键文件代码路径速查
- **前端（不改）**：[index.vue](file:///e:/rhProject/wk-train-center-ui/src/views/admin/repo/qu/index.vue)、[ImportExcel.vue](file:///e:/rhProject/wk-train-center-ui/src/components/ComponentsBase/ComponentsTable/ImportExcel.vue)
- **后端核心改造**：
  - [ImportExcel.java](file:///e:/rhProject/wk-train-center-service/yf-ability/src/main/java/com/yf/ability/excel/ImportExcel.java)
  - [QuController.java](file:///e:/rhProject/wk-train-center-service/yf-modules/yf-module-repo/src/main/java/com/yf/repo/modules/admin/qu/controller/QuController.java)
  - [QuServiceImpl.java](file:///e:/rhProject/wk-train-center-service/yf-modules/yf-module-repo/src/main/java/com/yf/repo/modules/admin/qu/service/impl/QuServiceImpl.java)
  - [QuConvert.java](file:///e:/rhProject/wk-train-center-service/yf-modules/yf-module-repo/src/main/java/com/yf/repo/modules/admin/qu/utils/QuConvert.java)
  - [QuExportDTO.java](file:///e:/rhProject/wk-train-center-service/yf-modules/yf-module-repo/src/main/java/com/yf/repo/modules/admin/qu/dto/export/QuExportDTO.java)
  - [QuDetailDTO.java](file:///e:/rhProject/wk-train-center-service/yf-modules/yf-module-repo/src/main/java/com/yf/repo/modules/admin/qu/dto/ext/QuDetailDTO.java)
  - [SysKeyPointRefService.java](file:///e:/rhProject/wk-train-center-service/yf-modules/yf-module-system/src/main/java/com/yf/system/modules/kp/core/service/SysKeyPointRefService.java)
  - [SysKeyPoint.java](file:///e:/rhProject/wk-train-center-service/yf-modules/yf-module-system/src/main/java/com/yf/system/modules/kp/core/entity/SysKeyPoint.java)
- **资源文件（替换）**：
  - `e:/rhProject/wk-train-center-service/yf-modules/yf-module-repo/src/main/resources/excel/repo_qu_tmpl.xlsx`
