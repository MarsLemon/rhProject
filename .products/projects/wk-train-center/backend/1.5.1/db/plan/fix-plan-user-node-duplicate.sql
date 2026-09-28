-- ============================================================
-- 修复：el_plan_user_node 同 (user_id, plan_id, node_id) 重复行 + 添加唯一索引
-- ------------------------------------------------------------
-- 根因：
--   PlanUserServiceImpl#unlockAllPlanNodes 与 client 端
--   PlanUserNodeClientServiceImpl#saveUserNode 均是"check-then-insert"无锁、
--   且 el_plan_user_node 表无 (user_id, plan_id, node_id) 唯一约束。
--   多个 admin 并发触发同一 plan 的 extend（双击 / 多端打开 / 通知点击 + 直接访问）
--   会同时通过 existingKeys.contains 判断各 insert 一行，造成重复行。
--   后续 findMap（map.put(nodeId, node)）以 nodeId 为 key 取最后一条，重复行被静默吞掉
--   但 DB 产生脏数据。
--
-- 关联代码改动（同一批 commit 一起提交）：
--   - PlanUserNodeMapper#insertIgnoreBatch（admin 端）
--   - PlanUserNodeMapper#insertIgnore（client 端）
--   - PlanUserServiceImpl#unlockAllPlanNodes 改用 insertIgnoreBatch
--   - PlanUserNodeClientServiceImpl#saveUserNode 改用 insertIgnore
--
-- 关于 deleted：
--   el_plan_user_node.deleted 字段在 v1.2 已添加（NOT NULL DEFAULT 0），
--   实体 PlanUserNode 未声明该字段、未使用 @TableLogic，业务代码全工程
--   不存在向 PlanUserNode 写 deleted=1 的逻辑。
--   因此唯一索引按 (user_id, plan_id, node_id) 即可，不必带 deleted。
--   若未来启用软删，需要：实体加 @TableLogic + 改本索引为 partial 形式。
--
-- 执行前请先备份 el_plan_user_node 表：
--   CREATE TABLE `wk_train_center`.`el_plan_user_node_bak_v1_5_2`
--   AS SELECT * FROM `wk_train_center`.`el_plan_user_node`;
-- ============================================================

-- 1. 查看重复规模（仅观察用，不修改数据）
-- SELECT user_id, plan_id, node_id, COUNT(*) AS cnt
-- FROM `wk_train_center`.`el_plan_user_node`
-- GROUP BY user_id, plan_id, node_id
-- HAVING cnt > 1
-- ORDER BY cnt DESC;

-- 2. 删除重复行：每组 (user_id, plan_id, node_id) 保留 id 最小的一条
DELETE FROM `el_plan_user_node`
WHERE
    id IN (
        SELECT id
        FROM (
                SELECT id, ROW_NUMBER() OVER (
                        PARTITION BY
                            user_id, plan_id, node_id
                        ORDER BY id ASC
                    ) AS rn
                FROM `el_plan_user_node`
            ) t
        WHERE
            t.rn > 1
    );

-- 3. 添加唯一索引：物理保证 (user_id, plan_id, node_id) 全表唯一，
--    作为应用层 INSERT IGNORE 的最终兜底。
ALTER TABLE `wk_train_center`.`el_plan_user_node`
ADD UNIQUE KEY `uk_plan_user_node` (`user_id`, `plan_id`, `node_id`);

-- 4. 验证（可选）：执行完上述清理后应为 0
-- SELECT COUNT(*) AS dup_groups FROM (
--     SELECT user_id, plan_id, node_id
--     FROM `el_plan_user_node`
--     GROUP BY user_id, plan_id, node_id
--     HAVING COUNT(*) > 1
-- ) t;