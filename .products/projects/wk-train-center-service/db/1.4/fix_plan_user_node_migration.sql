-- ============================================================
-- 修复：管理员编辑任务后学员节点解锁状态丢失问题
-- 描述：为 el_plan_user_node 表添加 ref_id 和 node_type 冗余字段
--       用于管理员编辑任务后仍能匹配学员的节点解锁记录
-- ============================================================

-- 1. 添加 ref_id 字段（关联对象ID，冗余字段）
ALTER TABLE `wk_train_center`.`el_plan_user_node` 
ADD COLUMN `ref_id` VARCHAR(64) DEFAULT NULL COMMENT '关联对象ID（冗余字段，用于管理员编辑任务后仍能匹配' 
AFTER `node_id`;

-- 2. 添加 node_type 字段（节点类型，冗余字段）
ALTER TABLE `wk_train_center`.`el_plan_user_node` 
ADD COLUMN `node_type` VARCHAR(32) DEFAULT NULL COMMENT '节点类型（冗余字段，用于管理员编辑任务后仍能匹配' 
AFTER `ref_id`;

-- 3. 为历史数据填充 ref_id 和 node_type（基于 node_id 关联 el_plan_node 表）
UPDATE `wk_train_center`.`el_plan_user_node` pun 
INNER JOIN `wk_train_center`.`el_plan_node` pn ON pun.node_id = pn.id
SET 
    pun.ref_id = pn.ref_id,
    pun.node_type = pn.node_type
WHERE pun.ref_id IS NULL OR pun.node_type IS NULL;

-- 4. 添加索引以优化查询性能
CREATE INDEX idx_plan_user_node_ref_type ON `wk_train_center`.`el_plan_user_node` (`plan_id`, `user_id`, `ref_id`, `node_type`);

-- 5. 验证迁移结果
-- SELECT 
--     'el_plan_user_node' AS table_name,
--     COUNT(*) AS total_records,
--     SUM(CASE WHEN ref_id IS NOT NULL THEN 1 ELSE 0 END) AS ref_id_filled,
--     SUM(CASE WHEN node_type IS NOT NULL THEN 1 ELSE 0 END) AS node_type_filled
-- FROM `el_plan_user_node`;
