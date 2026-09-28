-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

-- =============================================
-- 课件管理列表课程资源分类显示问题诊断脚本
-- =============================================

-- 1. 检查课件表中cat_id字段的分布情况
SELECT '课件分类ID统计' AS '诊断项', COUNT(*) AS '总数', SUM(
        CASE
            WHEN cat_id IS NULL
            OR cat_id = '' THEN 1
            ELSE 0
        END
    ) AS '无分类', SUM(
        CASE
            WHEN cat_id IS NOT NULL
            AND cat_id != '' THEN 1
            ELSE 0
        END
    ) AS '有分类'
FROM `wk_train_center`.`el_course_file`
WHERE (
        bailian_sync_status IS NULL
        OR bailian_sync_status != 'DELETING'
    );

-- 2. 查看无分类的课件记录
SELECT
    id,
    title,
    cat_id,
    file_type,
    create_time
FROM `wk_train_center`.`el_course_file`
WHERE (
        cat_id IS NULL
        OR cat_id = ''
    )
    AND (
        bailian_sync_status IS NULL
        OR bailian_sync_status != 'DELETING'
    )
ORDER BY create_time DESC
LIMIT 10;

-- 3. 检查course_catalog字典是否存在
SELECT '课程资源分类字典检查' AS '诊断项', COUNT(*) AS '字典值数量'
FROM `wk_train_center`.`el_sys_dic_value`
WHERE
    dic_code = 'course_catalog';

-- 4. 查看course_catalog字典的详细内容
SELECT
    id,
    dic_code,
    dic_value,
    title,
    parent_id,
    sort
FROM `wk_train_center`.`el_sys_dic_value`
WHERE
    dic_code = 'course_catalog'
ORDER BY sort, id;

-- 5. 检查有cat_id但字典翻译失败的课件
SELECT cf.id, cf.title, cf.cat_id, sdv.title AS '字典标题', sdv.dic_value AS '字典值'
FROM `wk_train_center`.`el_course_file` cf
    LEFT JOIN `wk_train_center`.`el_sys_dic_value` sdv ON cf.cat_id = sdv.id
    AND sdv.dic_code = 'course_catalog'
WHERE
    cf.cat_id IS NOT NULL
    AND cf.cat_id != ''
    AND sdv.id IS NULL
    AND (
        cf.bailian_sync_status IS NULL
        OR cf.bailian_sync_status != 'DELETING'
    )
LIMIT 10;

-- =============================================
-- 修复方案（根据实际情况选择执行）
-- =============================================

-- 方案1: 如果course_catalog字典不存在，插入基础字典数据
-- 注意：执行前请确认是否真的缺少字典数据
/*
INSERT INTO `wk_train_center`.`el_sys_dic_value` (id, dic_code, dic_value, title, parent_id, sort, create_time, update_time) VALUES
(REPLACE(UUID(), '-', ''), 'course_catalog', 'DEFAULT', '默认分类', '0', 0, NOW(), NOW());
*/

-- 方案2: 批量更新无分类的课件，分配到默认分类
-- 注意：需要先确认默认分类的ID
/*
UPDATE `wk_train_center`.`el_course_file` 
SET cat_id = (SELECT id FROM `wk_train_center`.`el_sys_dic_value` WHERE dic_code = 'course_catalog' AND parent_id = '0' LIMIT 1)
WHERE (cat_id IS NULL OR cat_id = '')
AND (bailian_sync_status IS NULL OR bailian_sync_status != 'DELETING');
*/

-- 方案3: 检查并修复孤立的cat_id引用
/*
UPDATE `wk_train_center`.`el_course_file` cf
LEFT JOIN `wk_train_center`.`el_sys_dic_value` sdv ON cf.cat_id = sdv.id AND sdv.dic_code = 'course_catalog'
SET cf.cat_id = NULL
WHERE sdv.id IS NULL 
AND cf.cat_id IS NOT NULL 
AND cf.cat_id != '';
*/