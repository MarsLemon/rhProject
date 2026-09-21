-- 培训课程表结构初始化
-- 依据文档：yf-module-training-plan/年度培训计划 数据库.md
-- 说明：创建 training_courses 表

CREATE TABLE `el_training_plan_courses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `record_uploader_id` bigint(20) unsigned NOT NULL COMMENT '培训记录上传人ID (单选)',
  `internal_lecturer_id` bigint(20) unsigned DEFAULT NULL COMMENT '内部讲师ID',
  `external_lecturer_name` varchar(100) DEFAULT NULL COMMENT '外部讲师姓名',
  `location` varchar(200) DEFAULT NULL COMMENT '场地',
  `equipment` varchar(200) DEFAULT NULL COMMENT '设备',
  `collaborator_user_id` bigint(20) unsigned DEFAULT NULL COMMENT '协同人员ID (单选)',
  `planned_start_date` date NOT NULL COMMENT '计划培训开始日期',
  `planned_end_date` date NOT NULL COMMENT '计划培训结束日期',
  `custom_fields` json DEFAULT NULL COMMENT '课程自定义字段',
  `collection_id` bigint(20) unsigned NOT NULL COMMENT '关联的收藏计划ID',
  `status` tinyint(4) NOT NULL COMMENT '状态: 10=待完成, 20=按时完成, 21=延时完成, 22=未完成',
  `deleted_at` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除,1=已删除',
  PRIMARY KEY (`id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_record_uploader_id` (`record_uploader_id`),
  KEY `idx_internal_lecturer_id` (`internal_lecturer_id`),
  KEY `idx_collection_id` (`collection_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='培训课程表';
