-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

-- ============================================================
-- 修复：el_plan_user 同 (plan_id, user_id) 重复行 + 添加唯一索引兜底
-- ------------------------------------------------------------
-- 根因：
--   PlanClientServiceImpl#ensureAllNodesAvailable / #startPlan 等
--   "check-then-insert" 无锁、且 DB 无 (plan_id,user_id) 唯一约束。
--   学员高频并发触发 detail 接口（双击 / 多端打开 / 通知点击 + 直接访问）
--   会同时通过 if(exist == null) 判断各 insert 一条，造成重复行。
--   后续 selectOne 命中 2 条即抛 TooManyResultsException。
--
-- 关联代码改动（同一批 commit 一起提交）：
--   - PlanClientServiceImpl#ensureAllNodesAvailable    (yf-module-plan)
--   - PlanClientServiceImpl#startPlan                  (yf-module-plan)
--   - PlanUserClientServiceImpl#start                  (yf-module-plan)
--     三处都改为：先 ORDER BY start_time + LIMIT 1 兼容历史脏数据，
--     insert 用 try/catch DuplicateKeyException 兜底并发 race。
--
-- 关于软删除：
--   el_plan_user.deleted 字段在 v1.2 已添加（NOT NULL DEFAULT 0），
--   但 PlanUser 实体未声明该字段、未使用 @TableLogic，业务代码全工程
--   不存在向 PlanUser 写 deleted=1 / remove(...) 的逻辑。
--   因此唯一索引按 (plan_id, user_id) 即可，不必带 deleted。
--   若未来启用软删，需要：实体加 @TableLogic + 改本索引为 partial 形式。
--
-- 执行前请先备份 el_plan_user 表：
--   CREATE TABLE `wk_train_center`.`el_plan_user_bak_v1_5`
--   AS SELECT * FROM `wk_train_center`.`el_plan_user`;
-- ============================================================

-- 1. 查看重复规模（仅观察用，不修改数据）
-- SELECT plan_id, user_id, COUNT(*) AS cnt
-- FROM `wk_train_center`.`el_plan_user`
-- GROUP BY plan_id, user_id
-- HAVING cnt > 1
-- ORDER BY cnt DESC;

-- 2. 删除重复行：每组 (plan_id, user_id) 保留 start_time 最早的一条；
--    start_time 为 NULL 排到最后；并列时按 id 字典序最小的保留。
DELETE FROM `wk_train_center`.`el_plan_user`
WHERE
    id IN (
        SELECT id
        FROM (
                SELECT id, ROW_NUMBER() OVER (
                        PARTITION BY
                            plan_id, user_id
                        ORDER BY (start_time IS NULL), start_time ASC, id ASC
                    ) AS rn
                FROM `wk_train_center`.`el_plan_user`
            ) t
        WHERE
            t.rn > 1
    );

-- 3. 添加唯一索引：物理保证 (plan_id, user_id) 全表唯一，
--    作为代码层 try/catch DuplicateKeyException 的最终兜底。
ALTER TABLE `wk_train_center`.`el_plan_user`
ADD UNIQUE KEY `uk_plan_user` (`plan_id`, `user_id`);

-- 4. 验证（可选）：执行完上述清理后应为 0
-- SELECT COUNT(*) AS dup_groups FROM (
--     SELECT plan_id, user_id
--     FROM `wk_train_center`.`el_plan_user`
--     GROUP BY plan_id, user_id
--     HAVING COUNT(*) > 1
-- ) t;