-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

CREATE TABLE `el_training_record` (
                                      `id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '主键id',
                                      `user_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户id',
                                      `role_name` varchar(128) COLLATE utf8mb4_general_ci NOT NULL COMMENT '角色名称',
                                      `score` text COLLATE utf8mb4_general_ci COMMENT '打分结果',
                                      `training_time` datetime NOT NULL COMMENT '陪练时间',
                                      `chat_history` json NOT NULL COMMENT '聊天记录',
                                      PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='陪练助手陪练记录表';

CREATE TABLE `el_training_role` (
                                    `id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'id',
                                    `role_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '角色名称',
                                    `tone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '语气',
                                    `background` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '背景描述',
                                    `requirement` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '陪练要求(包含开场白/问答方向/难度等)',
                                    `eval_criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '评估标准',
                                    `state` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '状态:0=未发布,1=已发布',
                                    `progress` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '进度：0未提交 1已提交',
                                    `create_time` datetime DEFAULT NULL COMMENT '创建时间',
                                    `update_time` datetime DEFAULT NULL COMMENT '更新时间',
                                    `create_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '创建人',
                                    `update_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '修改人',
                                    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='AI陪练角色表';

ALTER TABLE `wk_train_center`.`el_training_record`
    ADD COLUMN `ask_id` varchar(128) NULL COMMENT '单次对话id' AFTER `user_id`;

ALTER TABLE `wk_train_center`.`el_training_record`
    ADD COLUMN `overview` text NULL COMMENT '概述' AFTER `training_time`;

CREATE TABLE `el_answer_record` (
                                    `id` varchar(64) COLLATE utf8mb4_general_ci NOT NULL COMMENT '主键id',
                                    `user_id` varchar(128) COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户id',
                                    `ask_id` varchar(128) COLLATE utf8mb4_general_ci NOT NULL COMMENT '单次对话id',
                                    `answer_time` datetime NOT NULL COMMENT '答疑时间',
                                    `overview` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '概述',
                                    `chat_history` json NOT NULL COMMENT '聊天记录',
                                    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='答疑助手-对话记录';