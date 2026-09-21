-- ============================================================
-- 版本: 1.5.1
-- 模块: plan
-- 用途: 一键延期+一键补考功能 DDL 变更
-- 影响表: el_plan_user, el_paper, el_exam_record, el_plan_makeup
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
-- ALTER: ADD COLUMN deadline, extend_deadline_count, extend_makeup_count

-- el_plan_user: 学员个人截止时间
ALTER TABLE `wk_train_center`.`el_plan_user`
ADD COLUMN deadline DATETIME DEFAULT NULL COMMENT '学员个人截止时间（延期时设置，优先于 Plan.endTime）';

-- el_plan_user: 延期截止时间次数
ALTER TABLE `wk_train_center`.`el_plan_user`
ADD COLUMN extend_deadline_count INT DEFAULT 0 COMMENT '延期截止时间次数';

-- el_plan_user: 延期补考次数
ALTER TABLE `wk_train_center`.`el_plan_user`
ADD COLUMN extend_makeup_count INT DEFAULT 0 COMMENT '延期补考次数';

-- ============== el_paper ==============
-- ALTER: ADD COLUMN is_makeup
ALTER TABLE `wk_train_center`.`el_paper`
ADD COLUMN is_makeup TINYINT(1) DEFAULT 0 COMMENT '是否补考试卷（0=正考，1=补考）';

-- ============== el_exam_record ==============
-- ALTER: ADD COLUMN plan_id, is_makeup, chance_override

-- el_exam_record: 培训ID（关联培训计划）
ALTER TABLE `wk_train_center`.`el_exam_record`
ADD COLUMN plan_id VARCHAR(64) DEFAULT NULL COMMENT '培训ID（关联培训计划）';

-- el_exam_record: 是否补考试卷
ALTER TABLE `wk_train_center`.`el_exam_record`
ADD COLUMN is_makeup TINYINT(1) DEFAULT 0 COMMENT '是否补考试卷（0=正考，1=补考）';

-- el_exam_record: 考试机会覆盖值
-- 注意：plan_id / chance_override 已废弃不再写入（历史兼容保留列），
-- 补考授权改由 el_plan_makeup 按任务隔离存储，存量数据迁移见 dml-extend-makeup.sql
ALTER TABLE `wk_train_center`.`el_exam_record`
ADD COLUMN chance_override INT DEFAULT NULL COMMENT '考试机会覆盖值（补考时设置，优先于 Exam.chance，NULL=使用全局值）';

-- ============== el_plan_makeup ==============
-- CREATE TABLE: 补考授权表（按任务隔离的考试机会覆盖，补考机会的唯一事实来源）
CREATE TABLE IF NOT EXISTS `wk_train_center`.`el_plan_makeup` (
    id VARCHAR(64) NOT NULL COMMENT 'ID',
    plan_id VARCHAR(64) NOT NULL COMMENT '培训ID',
    exam_id VARCHAR(64) NOT NULL COMMENT '考试ID',
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    chance_override INT DEFAULT NULL COMMENT '考试机会覆盖值（补考时设置，优先于 Exam.chance，NULL=使用全局值）',
    add_count INT DEFAULT 0 COMMENT '累计追加的补考次数',
    create_time DATETIME DEFAULT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_plan_exam_user (plan_id, exam_id, user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '培训补考授权表';
-- 注意：新增字段都是可选的（DEFAULT 0 或 NULL），不影响现有结构
