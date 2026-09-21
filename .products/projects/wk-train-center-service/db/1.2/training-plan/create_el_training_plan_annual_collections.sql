-- 年度培训计划收集表结构初始化
-- 依据文档：yf-module-training-plan/年度培训计划 数据库.md
-- 说明：创建 annual_training_plan_collections 表

CREATE TABLE `el_training_plan_annual_collections` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(64) NOT NULL DEFAULT '' COMMENT '创建人',
  `update_by` varchar(64) NOT NULL DEFAULT '' COMMENT '修改人',
  `filler_user_ids` json NOT NULL COMMENT '填写人用户ID数组 (多选)',
  `fill_start_at` datetime NOT NULL COMMENT '填写起始时间',
  `fill_end_at` datetime NOT NULL COMMENT '填写结束时间',
  `dispatch_at` datetime NOT NULL COMMENT '任务分发时间',
  `status` tinyint(4) NOT NULL COMMENT '任务状态: 1=待提交, 2=已提交, 3=已分发, 4=已完成, 10=分发暂停',
  `deleted_at` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除,1=已删除',
  `plan_year` int(4) NOT NULL COMMENT '所属年度',
  `subject` varchar(200) NOT NULL COMMENT '年度培训计划主题',
  `description` varchar(500) DEFAULT NULL COMMENT '年度培训计划说明',
  `course_custom_fields` json DEFAULT NULL COMMENT '课程自定义字段',
  PRIMARY KEY (`id`),
  KEY `idx_plan_year` (`plan_year`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='年度培训计划收集表';
