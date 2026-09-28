-- ============================================================
-- STATUS:
--   dev: 未执行
--   stage: 未执行
--   pro: 未执行
-- ============================================================
-- SUMMARY: 一键延期+一键补考 DML（节点去重 + 数据迁移 + 模板 + 补考授权存量导入 + 修复 + 验证）
-- TABLES: el_plan_user_node, el_plan_user, el_msg_tmpl, el_msg_tmpl_prop, el_plan_makeup, el_exam_record
-- 注意: 升级环境专用（el_plan_user 旧版有 extend_count 字段）；新装环境跳过 extend_count UPDATE 段

DELETE FROM `wk_train_center`.`el_plan_user_node`
WHERE
    id IN (
        SELECT id
        FROM (
                SELECT id, ROW_NUMBER() OVER (
                        PARTITION BY
                            user_id, plan_id, node_id
                        ORDER BY id ASC
                    ) AS rn
                FROM `wk_train_center`.`el_plan_user_node`
            ) t
        WHERE
            t.rn > 1
    );

UPDATE `wk_train_center`.`el_plan_user`
SET
    extend_deadline_count = extend_count
WHERE
    extend_count > 0;

INSERT IGNORE INTO
    `wk_train_center`.`el_msg_tmpl` (
        `id`,
        `title`,
        `template`,
        `image_url`,
        `button_name`,
        `jump_url`,
        `im_enable`,
        `im_on`,
        `sms_enable`,
        `sms_on`,
        `sms_tmpl`,
        `social_enable`,
        `social_on`,
        `email_enable`,
        `email_on`,
        `email_tmpl`
    )
VALUES (
        'PLAN_DELAY_PREPARE',
        '培训延期通知',
        '您参加的培训：${title}，截止时间已延期至${date}，请合理安排时间！',
        'https://test-winkong-file-service-read.oss-cn-qingdao.aliyuncs.com/dev/AI-training/AI-training/tempFile//2026/4/27/1777283398772-37717863.jpg',
        '查看详情',
        'http://sbp.mobile.winkong.develop/device-redirect?redirect_pc=/remotes-train-center&redirect_mobile=/smart-training/page/entryway/redirect&target_mobile=/smart-training/page/train-center/train-detail&redirect=/pages/plan/detail&id={?}',
        1,
        1,
        1,
        0,
        '',
        0,
        0,
        1,
        0,
        ''
    );

INSERT INTO
    `wk_train_center`.`el_msg_tmpl_prop` (`tmpl_id`, `prop`, `remark`)
SELECT 'PLAN_DELAY_PREPARE', 'title', '培训名称'
FROM DUAL
WHERE
    NOT EXISTS (
        SELECT 1
        FROM `wk_train_center`.`el_msg_tmpl_prop`
        WHERE
            `tmpl_id` = 'PLAN_DELAY_PREPARE'
            AND `prop` = 'title'
    );

INSERT INTO
    `wk_train_center`.`el_msg_tmpl_prop` (`tmpl_id`, `prop`, `remark`)
SELECT 'PLAN_DELAY_PREPARE', 'date', '新截止时间'
FROM DUAL
WHERE
    NOT EXISTS (
        SELECT 1
        FROM `wk_train_center`.`el_msg_tmpl_prop`
        WHERE
            `tmpl_id` = 'PLAN_DELAY_PREPARE'
            AND `prop` = 'date'
    );

INSERT IGNORE INTO
`wk_train_center`.`el_plan_makeup` (
        `plan_id`,
        `exam_id`,
        `user_id`,
        `chance_override`,
        `add_count`,
        `create_time`,
        `update_time`
    )
SELECT er.plan_id, er.exam_id, er.user_id, er.chance_override, GREATEST(
        er.chance_override - IFNULL(ex.chance, 0), 0
    ), er.create_time, er.update_time
FROM `wk_train_center`.`el_exam_record` er
    LEFT JOIN `wk_train_center`.`el_exam` ex ON ex.id = er.exam_id
WHERE
    er.plan_id IS NOT NULL
    AND er.chance_override IS NOT NULL;

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

INSERT IGNORE INTO
`wk_train_center`.`el_plan_user_node` (
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

INSERT IGNORE INTO
    `wk_train_center`.`el_plan_user_node` (
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
    er.id IS NULL
    AND pun.id IS NULL;
