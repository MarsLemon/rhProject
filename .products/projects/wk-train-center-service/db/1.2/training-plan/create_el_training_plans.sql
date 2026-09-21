-- 培训计划表结构初始化
-- 依据文档：yf-module-training-plan/年度培训计划 数据库.md
-- 说明：创建 training_plans 表

CREATE TABLE `el_training_plans` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除,1=已删除',
  `update_by` varchar(64) NOT NULL DEFAULT '' COMMENT '修改人',
  `filler_user_id` bigint(20) unsigned DEFAULT NULL COMMENT '填写人用户ID',
  `status` tinyint(4) NOT NULL COMMENT '计划状态: 1=待填写, 2=待生效, 3=已生效, 10=暂停',
  `plan_type` tinyint(4) NOT NULL COMMENT '培训计划类型: 1=年度',
  PRIMARY KEY (`id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_update_by` (`update_by`),
  KEY `idx_filler_user_id` (`filler_user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='培训计划表';
