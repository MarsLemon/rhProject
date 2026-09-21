-- =============================================
-- 补充：课程模块遗漏表添加逻辑删除字段
-- 数据库: wk_train_center
-- 说明：这些表在 alter_all_tables_add_deleted.sql 中遗漏
-- =============================================

-- 1. 课程引用课件表 el_course_ref_file
ALTER TABLE `wk_train_center`.`el_course_ref_file`
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `course_id`;
ALTER TABLE `wk_train_center`.`el_course_ref_file` ADD INDEX `idx_deleted`(`deleted`);

-- 2. 课程引用目录表 el_course_ref_dir
ALTER TABLE `wk_train_center`.`el_course_ref_dir`
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `course_id`;
ALTER TABLE `wk_train_center`.`el_course_ref_dir` ADD INDEX `idx_deleted`(`deleted`);

-- 3. 课程学习加入表 el_course_join
ALTER TABLE `wk_train_center`.`el_course_join`
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `create_time`;
ALTER TABLE `wk_train_center`.`el_course_join` ADD INDEX `idx_deleted`(`deleted`);

-- 4. 课程直播表 el_course_live
ALTER TABLE `wk_train_center`.`el_course_live`
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_time`;
ALTER TABLE `wk_train_center`.`el_course_live` ADD INDEX `idx_deleted`(`deleted`);

-- =============================================
-- 执行完毕提示
-- =============================================
-- 影响表数量: 4 个
-- 新增字段: deleted (tinyint, 默认0, 0=未删除, 1=已删除)
-- 新增索引: idx_deleted
-- =============================================
