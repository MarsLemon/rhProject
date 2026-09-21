-- ============================================================
-- 修复已通过学员的节点记录（延期任务中，旧任务已通过的学员自动完成节点）
-- 严格按 plan_id 隔离，通过 el_plan_user 确认学员参与
-- 执行前请备份相关表
-- ============================================================

-- 1. 更新已存在但未完成的节点记录（finished=NULL/0 → 1，仅当学员全局 passed=1）
UPDATE `wk_train_center`.`el_plan_user_node` pun
INNER JOIN `wk_train_center`.`el_plan_user` pu ON pu.plan_id = pun.plan_id
AND pu.user_id = pun.user_id
INNER JOIN `wk_train_center`.`el_plan_node` pn ON pn.id = pun.node_id
INNER JOIN `wk_train_center`.`el_exam_record` er ON er.exam_id = pn.ref_id
AND er.user_id = pun.user_id
SET
    pun.finished = 1,
    pun.finish_time = NOW()
WHERE
    er.passed = 1
    AND pu.plan_id IN (
        SELECT id
        FROM el_plan
        WHERE
            title LIKE '%延期%'
    )
    AND (
        pun.finished IS NULL
        OR pun.finished = 0
    );

-- 2. 为不存在的节点记录创建已完成记录（仅当学员参与了该延期任务且全局 passed=1）
INSERT IGNORE INTO
    `wk_train_center`.`el_plan_user_node` (
        id,
        plan_id,
        group_id,
        node_id,
        user_id,
        ref_id,
        node_type,
        unlock_time,
        start_time,
        finish_time,
        finished
    )
SELECT
REPLACE (UUID(), '-', ''),
    pu.plan_id,
    pn.group_id,
    pn.id AS node_id,
    pu.user_id,
    pn.ref_id,
    pn.node_type,
    NOW() AS unlock_time,
    NOW() AS start_time,
    NOW() AS finish_time,
    1 AS finished
FROM
    `wk_train_center`.`el_plan_user` pu
    INNER JOIN `wk_train_center`.`el_plan` p ON p.id = pu.plan_id
    AND p.title LIKE '%延期%'
    INNER JOIN `wk_train_center`.`el_plan_node` pn ON pn.plan_id = pu.plan_id
    AND pn.node_type = 'EXAM'
    INNER JOIN `wk_train_center`.`el_exam_record` er ON er.exam_id = pn.ref_id
    AND er.user_id = pu.user_id
    AND er.passed = 1
    LEFT JOIN `wk_train_center`.`el_plan_user_node` pun ON pun.plan_id = pu.plan_id
    AND pun.user_id = pu.user_id
    AND pun.node_id = pn.id
WHERE
    pun.id IS NULL;

-- 3. 为参与延期任务但未通过的学员创建未完成节点记录（finished=NULL，需要补考）
INSERT IGNORE INTO
    `wk_train_center`.`el_plan_user_node` (
        id,
        plan_id,
        group_id,
        node_id,
        user_id,
        ref_id,
        node_type,
        unlock_time,
        start_time,
        finished
    )
SELECT
REPLACE (UUID(), '-', ''),
    pu.plan_id,
    pn.group_id,
    pn.id AS node_id,
    pu.user_id,
    pn.ref_id,
    pn.node_type,
    NOW() AS unlock_time,
    NOW() AS start_time,
    0 AS finished
FROM
    `wk_train_center`.`el_plan_user` pu
    INNER JOIN `wk_train_center`.`el_plan` p ON p.id = pu.plan_id
    AND p.title LIKE '%延期%'
    INNER JOIN `wk_train_center`.`el_plan_node` pn ON pn.plan_id = pu.plan_id
    AND pn.node_type = 'EXAM'
    LEFT JOIN `wk_train_center`.`el_exam_record` er ON er.exam_id = pn.ref_id
    AND er.user_id = pu.user_id
    AND er.passed = 1
    LEFT JOIN `wk_train_center`.`el_plan_user_node` pun ON pun.plan_id = pu.plan_id
    AND pun.user_id = pu.user_id
    AND pun.node_id = pn.id
WHERE
    er.id IS NULL -- 学员未通过该考试（无 passed=1 的记录）
    AND pun.id IS NULL;

-- 4. 更新学员完成状态（state=1 正常完成，state=2 延期完成）
-- 注意：此步骤需要应用层逻辑，建议通过管理端"刷新进度"按钮触发
-- 或调用 /api/admin/plan/user/checkFinished 接口

-- 验证：查看修复后的节点记录
SELECT p.title AS plan_title, pun.user_id, pn.ref_id AS exam_id, pun.finished, pun.finish_time
FROM `wk_train_center`.`el_plan_user_node` pun
    INNER JOIN `wk_train_center`.`el_plan` p ON p.id = pun.plan_id
    INNER JOIN `wk_train_center`.`el_plan_node` pn ON pn.id = pun.node_id
WHERE
    p.title LIKE '%延期%'
ORDER BY p.title, pun.finished DESC, pun.finish_time DESC;