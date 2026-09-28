-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

-- =============================================
-- 课程、考试、学习任务相关表添加逻辑删除字段
-- 数据库: wk_train_center
-- =============================================

-- ---------------------------------------------
-- 课程模块 el_course 相关表
-- ---------------------------------------------

-- 1. 课程表 el_course
ALTER TABLE `wk_train_center`.`el_course` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_course` ADD INDEX `idx_deleted`(`deleted`);

-- 2. 课件信息表 el_course_file
ALTER TABLE `wk_train_center`.`el_course_file` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `bailian_index_job_id`;
ALTER TABLE `wk_train_center`.`el_course_file` ADD INDEX `idx_deleted`(`deleted`);

-- 3. 课程学习记录表 el_course_learn
ALTER TABLE `wk_train_center`.`el_course_learn` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_course_learn` ADD INDEX `idx_deleted`(`deleted`);

-- 4. 课件学习表 el_course_file_learn
ALTER TABLE `wk_train_center`.`el_course_file_learn` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_course_file_learn` ADD INDEX `idx_deleted`(`deleted`);

-- 5. 课程评论表 el_course_comment
ALTER TABLE `wk_train_center`.`el_course_comment` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_course_comment` ADD INDEX `idx_deleted`(`deleted`);

-- 6. 课程问答表 el_course_qa
ALTER TABLE `wk_train_center`.`el_course_qa` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `state`;
ALTER TABLE `wk_train_center`.`el_course_qa` ADD INDEX `idx_deleted`(`deleted`);

-- ---------------------------------------------
-- 考试模块 el_exam 相关表
-- ---------------------------------------------

-- 7. 考试表 el_exam
ALTER TABLE `wk_train_center`.`el_exam` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_exam` ADD INDEX `idx_deleted`(`deleted`);

-- 8. 考试申请表 el_exam_apply
ALTER TABLE `wk_train_center`.`el_exam_apply` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `audit_used`;
ALTER TABLE `wk_train_center`.`el_exam_apply` ADD INDEX `idx_deleted`(`deleted`);

-- 9. 考试参与表 el_exam_join
ALTER TABLE `wk_train_center`.`el_exam_join` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `create_time`;
ALTER TABLE `wk_train_center`.`el_exam_join` ADD INDEX `idx_deleted`(`deleted`);

-- 10. 考试记录表 el_exam_record
ALTER TABLE `wk_train_center`.`el_exam_record` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_time`;
ALTER TABLE `wk_train_center`.`el_exam_record` ADD INDEX `idx_deleted`(`deleted`);

-- 11. 考试发证规则表 el_exam_cert
ALTER TABLE `wk_train_center`.`el_exam_cert` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `cert_id`;
ALTER TABLE `wk_train_center`.`el_exam_cert` ADD INDEX `idx_deleted`(`deleted`);

-- 12. 考试积分规则表 el_exam_points
ALTER TABLE `wk_train_center`.`el_exam_points` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `points`;
ALTER TABLE `wk_train_center`.`el_exam_points` ADD INDEX `idx_deleted`(`deleted`);

-- 13. 试卷表 el_paper
ALTER TABLE `wk_train_center`.`el_paper` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_paper` ADD INDEX `idx_deleted`(`deleted`);

-- 14. 考试模板表 el_tmpl
ALTER TABLE `wk_train_center`.`el_tmpl` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `create_time`;
ALTER TABLE `wk_train_center`.`el_tmpl` ADD INDEX `idx_deleted`(`deleted`);

-- ---------------------------------------------
-- 学习任务(培训计划)模块 el_plan 相关表
-- ---------------------------------------------

-- 15. 培训计划表 el_plan
ALTER TABLE `wk_train_center`.`el_plan` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_plan` ADD INDEX `idx_deleted`(`deleted`);

-- 16. 培训计划分组表 el_plan_group
ALTER TABLE `wk_train_center`.`el_plan_group` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `end_time`;
ALTER TABLE `wk_train_center`.`el_plan_group` ADD INDEX `idx_deleted`(`deleted`);

-- 17. 培训计划节点表 el_plan_node
ALTER TABLE `wk_train_center`.`el_plan_node` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `end_time`;
ALTER TABLE `wk_train_center`.`el_plan_node` ADD INDEX `idx_deleted`(`deleted`);

-- 18. 培训计划参与人员表 el_plan_user
ALTER TABLE `wk_train_center`.`el_plan_user` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `state`;
ALTER TABLE `wk_train_center`.`el_plan_user` ADD INDEX `idx_deleted`(`deleted`);

-- 19. 培训计划人员节点进度表 el_plan_user_node
ALTER TABLE `wk_train_center`.`el_plan_user_node` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `process_tag`;
ALTER TABLE `wk_train_center`.`el_plan_user_node` ADD INDEX `idx_deleted`(`deleted`);

-- 20. 培训收藏表 el_plan_user_fav
ALTER TABLE `wk_train_center`.`el_plan_user_fav` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `user_id`;
ALTER TABLE `wk_train_center`.`el_plan_user_fav` ADD INDEX `idx_deleted`(`deleted`);

-- =============================================
-- 执行完毕提示
-- =============================================
-- 影响表数量: 20 个
-- 新增字段: deleted (tinyint, 默认0, 0=未删除, 1=已删除)
-- 新增索引: idx_deleted
-- =============================================
