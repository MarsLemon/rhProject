-- Active: 1774491168883@@192.168.124.90@13306@wk_train_center
-- Active: 1774491351546@@127.0.0.1@3306@wk_train_center
-- ============================================================
-- 模块：课程问答
-- 功能：增加讲师 ID 字段，用于数据权限控制
-- 作者：AI Assistant
-- 日期：2026-03-26
-- 版本：1.2
-- ============================================================

-- 1. 增加 lecturer_id 字段
ALTER TABLE `wk_train_center`.`el_course_qa`
ADD COLUMN `lecturer_id` VARCHAR(32) COMMENT '讲师 ID（课程讲师）' AFTER `course_id`;

-- 2. 创建索引，优化查询性能
ALTER TABLE `wk_train_center`.`el_course_qa`
ADD INDEX `idx_lecturer_id` (`lecturer_id`);

-- 3. 回填历史数据（根据课程表关联讲师 ID）
UPDATE `wk_train_center`.`el_course_qa` qa
INNER JOIN `wk_train_center`.`el_course` c ON qa.`course_id` = c.`id`
SET
    qa.`lecturer_id` = c.`lecturer_id`
WHERE
    qa.`lecturer_id` IS NULL;

-- 4. 验证数据（可选，用于检查是否有空值）
-- SELECT COUNT(*) FROM `wk_train_center`.`el_course_qa` WHERE `lecturer_id` IS NULL;