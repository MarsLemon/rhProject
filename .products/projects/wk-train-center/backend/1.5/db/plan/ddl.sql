-- ============================================================
-- STATUS:
--   dev: 未执行
--   stage: 未执行
--   pro: 未执行
-- ============================================================
-- SUMMARY: 一键延期+一键补考 DDL（学员个人截止时间字段 + 补考授权表 + 节点唯一索引）
-- TABLES: el_plan_user, el_paper, el_exam_record, el_plan_makeup, el_plan_user_node
-- 执行顺序: 必须先跑 dml.sql 的 DELETE 去重，再跑本文件 ADD UNIQUE KEY（否则 ALTER 会失败）

ALTER TABLE `wk_train_center`.`el_plan_user`
ADD COLUMN deadline DATETIME DEFAULT NULL COMMENT '学员个人截止时间（延期时设置，优先于 Plan.endTime）';

ALTER TABLE `wk_train_center`.`el_plan_user`
ADD COLUMN extend_deadline_count INT DEFAULT 0 COMMENT '延期截止时间次数';

ALTER TABLE `wk_train_center`.`el_plan_user`
ADD COLUMN extend_makeup_count INT DEFAULT 0 COMMENT '延期补考次数';

ALTER TABLE `wk_train_center`.`el_paper`
ADD COLUMN is_makeup TINYINT(1) DEFAULT 0 COMMENT '是否补考试卷（0=正考，1=补考）';

ALTER TABLE `wk_train_center`.`el_exam_record`
ADD COLUMN plan_id VARCHAR(64) DEFAULT NULL COMMENT '培训ID（关联培训计划）';

ALTER TABLE `wk_train_center`.`el_exam_record`
ADD COLUMN is_makeup TINYINT(1) DEFAULT 0 COMMENT '是否补考试卷';

ALTER TABLE `wk_train_center`.`el_exam_record`
ADD COLUMN chance_override INT DEFAULT NULL COMMENT '考试机会覆盖值（补考时设置，优先于 Exam.chance，NULL=使用全局值）';

CREATE TABLE IF NOT EXISTS `wk_train_center`.`el_plan_makeup` (
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
plan_id VARCHAR(64) NOT NULL COMMENT '培训 ID',
exam_id VARCHAR(64) NOT NULL COMMENT '考试 ID',
user_id VARCHAR(64) NOT NULL COMMENT '用户 ID',
    chance_override INT DEFAULT NULL COMMENT '考试机会覆盖值',
    add_count INT DEFAULT 0 COMMENT '累计追加的补考次数',
    create_time DATETIME DEFAULT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (id),
UNIQUE KEY idx_plan_exam_user_unique (plan_id, exam_id, user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '培训补考授权表';

ALTER TABLE `wk_train_center`.`el_plan_user_node`
ADD UNIQUE KEY `idx_plan_user_node_unique` (
    `user_id`,
    `plan_id`,
    `node_id`
);
