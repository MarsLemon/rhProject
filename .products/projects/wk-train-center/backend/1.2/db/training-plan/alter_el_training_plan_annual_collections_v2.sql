-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

-- 对 annual_training_plan_collections 表进行字段名调整，使其与系统统一的自动填充字段保持一致
-- 将 created_at 重命名为 create_time，新增 update_time 字段

ALTER TABLE `el_training_plan_annual_collections`
  CHANGE COLUMN `created_at` `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';

-- 如已存在 update_time 请忽略此语句
ALTER TABLE `annual_training_plan_collections`
  ADD COLUMN `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间' AFTER `create_time`; 

-- 将 creator_id 调整为 create_by，并新增 update_by 字段
ALTER TABLE `annual_training_plan_collections`
  CHANGE COLUMN `creator_id` `create_by` varchar(64) NOT NULL DEFAULT '' COMMENT '创建人';

-- 如已存在 update_by 请忽略此语句
ALTER TABLE `annual_training_plan_collections`
  ADD COLUMN `update_by` varchar(64) NOT NULL DEFAULT '' COMMENT '修改人' AFTER `create_by`;

-- 将 deleted_at 从 datetime 改为 tinyint(1) 逻辑删除位：0=未删除,1=已删除
-- 若已为 tinyint(1) 可忽略以下语句
ALTER TABLE `annual_training_plan_collections`
  ADD COLUMN `deleted_at_new` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记：0=未删除,1=已删除';

UPDATE `annual_training_plan_collections`
  SET `deleted_at_new` = CASE WHEN `deleted_at` IS NULL THEN 0 ELSE 1 END;

ALTER TABLE `annual_training_plan_collections`
  DROP COLUMN `deleted_at`,
  CHANGE COLUMN `deleted_at_new` `deleted_at` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记：0=未删除,1=已删除';

-- 索引兼容：如不存在则添加
ALTER TABLE `annual_training_plan_collections`
  ADD INDEX `idx_deleted_at`(`deleted_at`);
