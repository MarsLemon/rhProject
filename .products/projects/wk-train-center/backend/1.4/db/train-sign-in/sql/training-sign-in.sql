-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

-- 培训签到主表
CREATE TABLE `wk_train_center`.`el_training_sign_in` (
    `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
    `title` varchar(255) NOT NULL COMMENT '培训主题',
    `teacher` varchar(64) DEFAULT NULL COMMENT '讲师',
    `duration` int DEFAULT NULL COMMENT '时长（分钟）',
    `location` varchar(255) DEFAULT NULL COMMENT '地点',
    `start_time` datetime DEFAULT NULL COMMENT '开始时间',
    `end_time` datetime DEFAULT NULL COMMENT '结束时间',
    `notify_users` varchar(2000) DEFAULT NULL COMMENT '通知用户ID列表，JSON格式',
    `qr_code_secret` varchar(128) DEFAULT NULL COMMENT '二维码加密串',
    `status` varchar(20) DEFAULT 'draft' COMMENT '状态：draft-待开始，signing-进行中，ended-已结束',
    `dept_code` varchar(64) DEFAULT NULL COMMENT '部门编码',
    `create_by` varchar(64) DEFAULT NULL COMMENT '创建人ID',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by` varchar(64) DEFAULT NULL COMMENT '更新人',
    `update_time` datetime DEFAULT NULL COMMENT '更新时间',
    `deleted` tinyint(1) DEFAULT 0 COMMENT '删除标记',
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '培训签到主表';

-- 培训签到记录表
CREATE TABLE `wk_train_center`.`el_training_sign_in_record` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
    `sign_in_id` bigint NOT NULL COMMENT '签到活动ID',
    `user_id` varchar(64) NOT NULL COMMENT '签到用户ID',
    `user_name` varchar(64) DEFAULT NULL COMMENT '姓名',
    `dept_name` varchar(128) DEFAULT NULL COMMENT '部门名称',
    `sign_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '签到时间',
    PRIMARY KEY (`id`),
    KEY `idx_sign_in_id` (`sign_in_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '培训签到记录表';