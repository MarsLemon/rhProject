-- 培训计划-培训课程关联表结构初始化
-- 依据文档：yf-module-training-plan/年度培训计划 数据库.md
-- 说明：创建 training_plan_course_relations 表

CREATE TABLE `el_training_plan_courses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `training_plan_id` bigint(20) unsigned NOT NULL COMMENT '培训计划ID',
  `training_course_id` bigint(20) unsigned NOT NULL COMMENT '培训课程ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_plan_course` (`training_plan_id`,`training_course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='培训计划-培训课程关联表';
