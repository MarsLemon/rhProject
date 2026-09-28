-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

-- =============================================
-- 补充：题库模块表添加逻辑删除字段
-- 数据库: wk_train_center
-- 说明：考试阅卷相关查询中使用了这些表的 deleted 字段
-- =============================================

-- 1. 题目表 el_qu
ALTER TABLE `wk_train_center`.`el_qu`
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_qu` ADD INDEX `idx_deleted`(`deleted`);

-- 2. 题目答案表 el_qu_answer
ALTER TABLE `wk_train_center`.`el_qu_answer`
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `score_rate`;
ALTER TABLE `wk_train_center`.`el_qu_answer` ADD INDEX `idx_deleted`(`deleted`);

-- =============================================
-- 执行完毕提示
-- =============================================
-- 影响表数量: 2 个
-- 新增字段: deleted (tinyint, 默认0, 0=未删除, 1=已删除)
-- 新增索引: idx_deleted
-- =============================================
