-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

-- 收集计划-培训计划关联表结构初始化
-- 依据文档：yf-module-training-plan/年度培训计划 数据库.md
-- 说明：创建 collection_training_plan_relations 表

CREATE TABLE `el_training_plan_collection_relations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `collection_id` bigint(20) unsigned NOT NULL COMMENT '收集计划ID',
  `training_plan_id` bigint(20) unsigned NOT NULL COMMENT '培训计划ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_collection_plan` (`collection_id`,`training_plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收集计划-培训计划关联表';
