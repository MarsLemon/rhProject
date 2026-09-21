-- ============================================================
-- 版本: 1.5.1
-- 模块: plan
-- 用途: 一键延期+一键补考功能 DML 数据迁移（仅升级环境执行）
-- 影响表: el_plan_user, el_msg_tmpl, el_msg_tmpl_prop, el_plan_makeup
-- 创建日期: 2026-08-04
-- 作者: TODO
-- 审核人: qoder:claude-sonnet-4.5
-- 审核日期: 2026-08-04
-- ============================================================
-- 强制规范（AI 和人都要遵守）：
--   1. 所有 DDL 必须使用 `wk_train_center`.`table_name` 完整限定
--   2. SQL 按"表"分块：每块前用 `-- ============== 表名 ==============`
--   3. 块首注明操作类型：`-- ALTER: ADD COLUMN` / `-- UPDATE: 数据回填`
--   4. 头部"影响表"必须与正文实际操作的表去重后一致
-- ============================================================

-- ============== el_plan_user ==============
-- UPDATE: 数据迁移（extend_count → extend_deadline_count，仅升级环境）

-- 执行条件：此 DML 仅在升级环境执行（旧版本已存在 extend_count 字段）
-- 新装环境：跳过此 DML（新装环境 1.1 DDL 执行后无 extend_count 字段，执行会报 unknown column 错误）

-- 目前无需执行
UPDATE `wk_train_center`.`el_plan_user`
SET
    extend_deadline_count = extend_count
WHERE
    extend_count > 0;

-- 后续版本：可考虑下线 extend_count 字段（ALTER TABLE `wk_train_center`.`el_plan_user` DROP COLUMN extend_count;）
-- ============== el_msg_tmpl ==============
-- INSERT: 新增培训延期通知模板（仿照 PLAN_PREPARE，幂等可重复执行）

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

-- ============== el_msg_tmpl_prop ==============
-- INSERT: 模板可用参数（title / date，幂等可重复执行）

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
-- ============== el_plan_makeup ==============
-- INSERT: 迁移存量补考授权（el_exam_record.chance_override → el_plan_makeup，幂等可重复执行）
-- 说明：add_count 为近似值（原记录未存追加次数，按 chance_override 与考试基础上限的差额估算），
--       校验链只依赖 chance_override，不受影响；无存量授权数据的新环境可跳过

INSERT IGNORE INTO
    `wk_train_center`.`el_plan_makeup` (
        `id`,
        `plan_id`,
        `exam_id`,
        `user_id`,
        `chance_override`,
        `add_count`,
        `create_time`,
        `update_time`
    )
SELECT er.id, er.plan_id, er.exam_id, er.user_id, er.chance_override, GREATEST(
        er.chance_override - IFNULL(ex.chance, 0), 0
    ), er.create_time, er.update_time
FROM `wk_train_center`.`el_exam_record` er
    LEFT JOIN `wk_train_center`.`el_exam` ex ON ex.id = er.exam_id
WHERE
    er.plan_id IS NOT NULL
    AND er.chance_override IS NOT NULL;