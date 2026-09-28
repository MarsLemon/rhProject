-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

-- ============================================================
-- 学习任务课件时长差异化配置
-- 目的：支持不同学习任务设置不同要求时长，自学免时长限制
-- 影响表：el_course_file_learn, el_plan_node
-- 日期：2026-04-20
-- ============================================================

-- ============================================================
-- Part 1: 课件学习记录表 - 添加任务级别时长和完成模式字段
-- ============================================================

-- 1.1 添加任务级别要求时长字段
ALTER TABLE `wk_train_center`.`el_course_file_learn`
ADD COLUMN `required_sec` INT DEFAULT 0 COMMENT '任务级别要求时长(秒)，0表示不设置，使用课程默认值' AFTER `plan_id`;

-- 1.2 添加完成模式字段
ALTER TABLE `wk_train_center`.`el_course_file_learn`
ADD COLUMN `finish_mode` TINYINT DEFAULT 1 COMMENT '完成模式: 1=时长模式(需达到要求时长), 2=看完即完成' AFTER `required_sec`;

-- 1.3 为历史自学记录设置完成模式（自学看完即完成）
-- 注意：ALTER TABLE 添加列时会用默认值填充现有记录，所以条件应该是 finish_mode = 1
UPDATE `wk_train_center`.`el_course_file_learn`
SET finish_mode = 2
WHERE plan_id IS NULL
  AND finish_mode = 1;

-- 如果要确认影响范围，可先执行以下查询：
-- SELECT COUNT(*) FROM el_course_file_learn WHERE plan_id IS NULL AND finish_mode = 1;

-- ============================================================
-- Part 2: 培训计划节点表 - 添加课件时长配置字段
-- ============================================================

-- 2.1 添加课件时长配置 JSON 字段
ALTER TABLE `wk_train_center`.`el_plan_node`
ADD COLUMN `file_durations_json` text COMMENT '课件时长配置JSON，格式：[{"fileId":"xxx","requiredSec":1800}]' AFTER `end_time`;

-- ============================================================
-- 回滚脚本（如需回滚，执行以下语句）
-- ============================================================
-- -- Part 1 回滚
-- ALTER TABLE el_course_file_learn DROP COLUMN required_sec;
-- ALTER TABLE el_course_file_learn DROP COLUMN finish_mode;
--
-- -- Part 2 回滚
-- ALTER TABLE el_plan_node DROP COLUMN file_durations_json;
