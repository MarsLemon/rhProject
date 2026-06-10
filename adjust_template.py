"""
调整试题导入模板：
1. R2 表头去掉"(必填)"和"*(必填)"后缀，使其与 @ExcelField 完全匹配
2. 单选/多选 R2-R3 双行表头合并为单行 R2
3. 填空/简答 删除"作答上传图片"列
4. 简答题 R3 子表头加"(勿删)"标记对齐
5. 保留 R1 整行说明 + 10 行示例数据
"""
import openpyxl
from openpyxl.utils import get_column_letter

src = r"E:\rhProject\wk-train-center-service\wk-modules\wk-module-qu\src\main\resources\excel\repo_qu_tmpl.xlsx"
wb = openpyxl.load_workbook(src)

# 1) 单选题 18列
ws = wb["单选题"]
# 取消所有合并单元格（包括 D2:O2 选项合并等）
for mr in list(ws.merged_cells.ranges):
    ws.unmerge_cells(str(mr))
# 写新的 R2 表头（与 RadioImportDTO @ExcelField 一致）
headers_radio = ["序号", "题目", "正确答案",
                 "A", "B", "C", "D", "E(勿删)", "F(勿删)", "G(勿删)", "H(勿删)", "I(勿删)", "J(勿删)", "K(勿删)", "L(勿删)",
                 "知识点", "难度", "答案解析"]
for c, v in enumerate(headers_radio, start=1):
    ws.cell(row=2, column=c, value=v)
# 删除 R3 子表头行（单行表头无需此行）
ws.delete_rows(3, 1)
# 设置 R1 整行说明
ws.cell(row=1, column=1, value=(
    "单选题说明（说明部分请勿删除）："
    "1. 序号为必填项，请从1开始排序；"
    "2. 单选题正确答案只有一个，请填写大写A B C D E F G（半角英文大写）；"
    "3. 单选题最多支持12个选项（请勿删除/增加选项列，留空即可）；"
    "4. 知识点用竖线「|」分隔，每道题最多5个；"
    "5. 难度：1=简单 2=中等 3=困难；"
    "6. 答案解析可留空。"
))
# R1 合并 A1:R1
ws.merge_cells("A1:R1")
# 已有 4-13 行示例（10 行），不需增加

# 2) 多选题 18列
ws = wb["多选题"]
for mr in list(ws.merged_cells.ranges):
    ws.unmerge_cells(str(mr))
headers_multi = headers_radio[:]  # 字段与单选相同
for c, v in enumerate(headers_multi, start=1):
    ws.cell(row=2, column=c, value=v)
ws.delete_rows(3, 1)
ws.cell(row=1, column=1, value=(
    "多选题说明（说明部分请勿删除）："
    "1. 序号为必填项，请从1开始排序；"
    "2. 多选题正确答案至少二个，请填写大写A,B,C,D 多个用半角逗号分隔（例：A,C,D）；"
    "3. 多选题最多支持12个选项（请勿删除/增加选项列，留空即可）；"
    "4. 知识点用竖线「|」分隔，每道题最多5个；"
    "5. 难度：1=简单 2=中等 3=困难；"
    "6. 答案解析可留空。"
))
ws.merge_cells("A1:R1")

# 3) 判断题 6列
ws = wb["判断题"]
for mr in list(ws.merged_cells.ranges):
    ws.unmerge_cells(str(mr))
headers_judge = ["序号", "题目", "正确答案", "知识点", "难度", "答案解析"]
for c, v in enumerate(headers_judge, start=1):
    ws.cell(row=2, column=c, value=v)
ws.delete_rows(3, 1)
ws.cell(row=1, column=1, value=(
    "判断题说明（说明部分请勿删除）："
    "1. 序号为必填项，请从1开始排序；"
    "2. 判断题答案请填写「对」或「错」；"
    "3. 知识点用竖线「|」分隔，每道题最多5个；"
    "4. 难度：1=简单 2=中等 3=困难；"
    "5. 答案解析可留空。"
))
ws.merge_cells("A1:F1")

# 4) 填空题 17列（删除 R 列"作答上传图片"）
ws = wb["填空题"]
for mr in list(ws.merged_cells.ranges):
    ws.unmerge_cells(str(mr))
headers_fill = ["序号", "题目",
                "空1", "空2", "空3", "空4",
                "空5(勿删)", "空6(勿删)", "空7(勿删)", "空8(勿删)", "空9(勿删)", "空10(勿删)", "空11(勿删)", "空12(勿删)",
                "知识点", "难度", "答案解析"]
for c, v in enumerate(headers_fill, start=1):
    ws.cell(row=2, column=c, value=v)
ws.delete_rows(3, 1)
# 删除第18列"作答上传图片"在所有数据行
ws.delete_cols(18, 1)
# 重建 R1 说明（合并 A1:Q1 即 17列）
ws.cell(row=1, column=1, value=(
    "填空题说明（说明部分请勿删除）："
    "1. 序号为必填项，请从1开始排序；"
    "2. 填空题题目中用双中括号「【】」表示1个填空项；"
    "3. 最多支持12个填空项（空1-空12），留空即可；"
    "4. 每空可填3个备选答案（用 / 分隔），多个备选答案用 {/} 防误判；"
    "5. 知识点用竖线「|」分隔，每道题最多5个；"
    "6. 难度：1=简单 2=中等 3=困难；"
    "7. 答案解析可留空。"
))
ws.merge_cells("A1:Q1")

# 5) 简答题 17列（删除 R 列"作答上传图片"，子表头加(勿删)标记）
ws = wb["简答题"]
for mr in list(ws.merged_cells.ranges):
    ws.unmerge_cells(str(mr))
headers_saq = ["序号", "题目",
               "关键词1", "关键词2", "关键词3", "关键词4",
               "关键词5(勿删)", "关键词6(勿删)", "关键词7(勿删)", "关键词8(勿删)", "关键词9(勿删)", "关键词10(勿删)", "关键词11(勿删)", "关键词12(勿删)",
               "知识点", "难度", "答案解析"]
for c, v in enumerate(headers_saq, start=1):
    ws.cell(row=2, column=c, value=v)
ws.delete_rows(3, 1)
ws.delete_cols(18, 1)
ws.cell(row=1, column=1, value=(
    "简答题说明（说明部分请勿删除）："
    "1. 序号为必填项，请从1开始排序；"
    "2. 简答题可设置多个关键词作为系统自动阅卷依据，最多12个；"
    "3. 关键词备选用 / 分隔，多个用 {/} 防误判；"
    "4. 关键词5(勿删) ~ 关键词12(勿删) 为预留位，留空即可；"
    "5. 知识点用竖线「|」分隔，每道题最多5个；"
    "6. 难度：1=简单 2=中等 3=困难；"
    "7. 答案解析可留空。"
))
ws.merge_cells("A1:Q1")

wb.save(src)
print("调整完成！")
