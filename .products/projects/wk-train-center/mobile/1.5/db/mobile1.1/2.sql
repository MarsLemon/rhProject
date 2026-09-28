-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

ALTER TABLE `wk_train_center`.`el_answer_record`
ADD COLUMN `file_list` TEXT COMMENT '用户消息附件列表(JSON数组字符串)';

ALTER TABLE `wk_train_center`.`el_training_record`
ADD COLUMN `file_list` TEXT COMMENT '用户消息附件列表(JSON数组字符串)';

ALTER TABLE `wk_train_center`.`el_answer_record`
ADD COLUMN `suggestions` TEXT COMMENT 'P3:结构化学习建议(JSON 数组)' AFTER `file_list`;