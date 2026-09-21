-- 为陪练记录表添加学习任务关联字段
-- 用于支持学习任务中的陪练历史按任务节点隔离
ALTER TABLE `wk_train_center`.`el_training_record`
    ADD COLUMN `plan_id` VARCHAR(64) NULL COMMENT '学习计划id(学习任务中的陪练)' AFTER `overview`,
    ADD COLUMN `node_ref_id` VARCHAR(64) NULL COMMENT '节点引用id(学习任务中的陪练)' AFTER `plan_id`;

-- 为查询性能添加索引
CREATE INDEX `idx_plan_node` ON `wk_train_center`.`el_training_record` (`plan_id`, `node_ref_id`);
