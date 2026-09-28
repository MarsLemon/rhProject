-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

-- ============================================================
-- 升级脚本：为课程学习记录表添加 plan_id 字段
-- 目的：支持同一课程同时用于自学和指派学习，进度独立记录
-- 影响表：el_course_learn、el_course_file_learn
-- 日期：2026-04-08
-- ============================================================

-- 1. 课程总进度表（el_course_learn）添加 plan_id 字段
ALTER TABLE `wk_train_center`.`el_course_learn`
ADD COLUMN plan_id VARCHAR(64) NULL COMMENT '培训计划ID，NULL表示自学' AFTER user_id;

ALTER TABLE `wk_train_center`.`el_course_learn`
ADD INDEX idx_course_learn_plan_id (plan_id);

-- 2. 课件学习进度表（el_course_file_learn）添加 plan_id 字段
ALTER TABLE `wk_train_center`.`el_course_file_learn`
ADD COLUMN plan_id VARCHAR(64) NULL COMMENT '培训计划ID，NULL表示自学' AFTER user_id;

ALTER TABLE `wk_train_center`.`el_course_file_learn`
ADD INDEX idx_course_file_learn_plan_id (plan_id);

-- 3. 历史数据处理：已有记录全部视为自学（plan_id 保持 NULL 即可）
-- 无需 UPDATE，因为新字段默认值为 NULL，代表"自学"语义

-- ============================================================
-- 回滚脚本（如需回滚，执行以下语句）
-- ============================================================
-- ALTER TABLE el_course_learn DROP INDEX idx_course_learn_plan_id;
-- ALTER TABLE el_course_learn DROP COLUMN plan_id;
-- ALTER TABLE el_course_file_learn DROP INDEX idx_course_file_learn_plan_id;
-- ALTER TABLE el_course_file_learn DROP COLUMN plan_id;