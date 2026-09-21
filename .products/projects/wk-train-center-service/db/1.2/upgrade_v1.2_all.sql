-- ============================================================
-- 版本: 1.2 数据库变更脚本
-- 数据库: wk_train_center
-- 生成日期: 2026-04-15
-- 说明: 整合1.2版本所有DDL变更（排除诊断类SELECT脚本）
-- ============================================================

-- ============================================================
-- 模块: 系统配置 (sys)
-- ============================================================

-- 1. 系统配置表添加系统Icon字段
ALTER TABLE `wk_train_center`.`el_cfg_base`
ADD COLUMN system_icon VARCHAR(255) DEFAULT NULL COMMENT '系统Icon';

-- 2. 用户表添加职务和工号字段
ALTER TABLE `wk_train_center`.`el_sys_user` 
ADD COLUMN `function_id` VARCHAR(50) NULL COMMENT '职务Id' AFTER `dept_code`;

ALTER TABLE `wk_train_center`.`el_sys_user` 
ADD COLUMN `job_number` VARCHAR(50) NULL COMMENT '工号' AFTER `function_id`;

-- 3. 角色表添加角色编码字段
ALTER TABLE `wk_train_center`.`el_sys_role`
ADD COLUMN role_code VARCHAR(50) COMMENT '角色编码';

-- 为现有角色设置编码
UPDATE `wk_train_center`.`el_sys_role` SET role_code = 'lecturer' WHERE role_name = '教师';
UPDATE `wk_train_center`.`el_sys_role` SET role_code = 'student' WHERE role_name = '学员';
UPDATE `wk_train_center`.`el_sys_role` SET role_code = 'admin' WHERE role_name = '管理员';

ALTER TABLE `wk_train_center`.`el_sys_role`
ADD UNIQUE INDEX uk_role_code (role_code);

-- ============================================================
-- 模块: 部门管理 (depart)
-- ============================================================

-- 1. 部门表添加系统部门编号字段
ALTER TABLE `wk_train_center`.`el_sys_depart`
ADD COLUMN `dept_no` varchar(128) DEFAULT NULL COMMENT '系统部门编号' AFTER `dept_code`;

-- 2. 创建部门职务表
CREATE TABLE `wk_train_center`.`el_sys_depart_function` (
    `id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'id',
    `dept_Id` varchar(64) COLLATE utf8mb4_general_ci NOT NULL COMMENT '部门id',
    `dept_code` varchar(128) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '部门编码',
    `dept_no` varchar(128) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '系统部门编号',
    `function_no` varchar(128) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '职务编号',
    `function_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT '职务名称',
    `function_nature` tinyint DEFAULT NULL COMMENT '职务性质 1:主管,2:副主管,3:成员',
    `function_type` tinyint DEFAULT NULL COMMENT '职务类别 1:工程技术人员,2:信息技术人员,3:商务人员,4:运营人员,5:后勤保障人员,6: 其他',
    `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '创建人',
    `update_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '修改人',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='部门职务';

-- 3. 用户表添加职务Id字段（已在上面添加，此处跳过避免重复）

-- ============================================================
-- 模块: 课程管理 (course)
-- ============================================================

-- 1. 课程模块 el_course 相关表添加逻辑删除字段
-- 课程表 el_course
ALTER TABLE `wk_train_center`.`el_course` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_course` ADD INDEX `idx_deleted`(`deleted`);

-- 课件信息表 el_course_file
ALTER TABLE `wk_train_center`.`el_course_file` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `bailian_index_job_id`;
ALTER TABLE `wk_train_center`.`el_course_file` ADD INDEX `idx_deleted`(`deleted`);

-- 课程学习记录表 el_course_learn
ALTER TABLE `wk_train_center`.`el_course_learn` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_course_learn` ADD INDEX `idx_deleted`(`deleted`);

-- 课件学习表 el_course_file_learn
ALTER TABLE `wk_train_center`.`el_course_file_learn` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_course_file_learn` ADD INDEX `idx_deleted`(`deleted`);

-- 课程评论表 el_course_comment
ALTER TABLE `wk_train_center`.`el_course_comment` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_course_comment` ADD INDEX `idx_deleted`(`deleted`);

-- 课程问答表 el_course_qa
ALTER TABLE `wk_train_center`.`el_course_qa` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `state`;
ALTER TABLE `wk_train_center`.`el_course_qa` ADD INDEX `idx_deleted`(`deleted`);

-- 2. 考试模块 el_exam 相关表添加逻辑删除字段
-- 考试表 el_exam
ALTER TABLE `wk_train_center`.`el_exam` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_exam` ADD INDEX `idx_deleted`(`deleted`);

-- 考试申请表 el_exam_apply
ALTER TABLE `wk_train_center`.`el_exam_apply` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `audit_used`;
ALTER TABLE `wk_train_center`.`el_exam_apply` ADD INDEX `idx_deleted`(`deleted`);

-- 考试参与表 el_exam_join
ALTER TABLE `wk_train_center`.`el_exam_join` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `create_time`;
ALTER TABLE `wk_train_center`.`el_exam_join` ADD INDEX `idx_deleted`(`deleted`);

-- 考试记录表 el_exam_record
ALTER TABLE `wk_train_center`.`el_exam_record` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_time`;
ALTER TABLE `wk_train_center`.`el_exam_record` ADD INDEX `idx_deleted`(`deleted`);

-- 考试发证规则表 el_exam_cert
ALTER TABLE `wk_train_center`.`el_exam_cert` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `cert_id`;
ALTER TABLE `wk_train_center`.`el_exam_cert` ADD INDEX `idx_deleted`(`deleted`);

-- 考试积分规则表 el_exam_points
ALTER TABLE `wk_train_center`.`el_exam_points` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `points`;
ALTER TABLE `wk_train_center`.`el_exam_points` ADD INDEX `idx_deleted`(`deleted`);

-- 试卷表 el_paper
ALTER TABLE `wk_train_center`.`el_paper` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_paper` ADD INDEX `idx_deleted`(`deleted`);

-- 考试模板表 el_tmpl
ALTER TABLE `wk_train_center`.`el_tmpl` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `create_time`;
ALTER TABLE `wk_train_center`.`el_tmpl` ADD INDEX `idx_deleted`(`deleted`);

-- 3. 学习任务(培训计划)模块 el_plan 相关表添加逻辑删除字段
-- 培训计划表 el_plan
ALTER TABLE `wk_train_center`.`el_plan` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_plan` ADD INDEX `idx_deleted`(`deleted`);

-- 培训计划分组表 el_plan_group
ALTER TABLE `wk_train_center`.`el_plan_group` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `end_time`;
ALTER TABLE `wk_train_center`.`el_plan_group` ADD INDEX `idx_deleted`(`deleted`);

-- 培训计划节点表 el_plan_node
ALTER TABLE `wk_train_center`.`el_plan_node` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `end_time`;
ALTER TABLE `wk_train_center`.`el_plan_node` ADD INDEX `idx_deleted`(`deleted`);

-- 培训计划参与人员表 el_plan_user
ALTER TABLE `wk_train_center`.`el_plan_user` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `state`;
ALTER TABLE `wk_train_center`.`el_plan_user` ADD INDEX `idx_deleted`(`deleted`);

-- 培训计划人员节点进度表 el_plan_user_node
ALTER TABLE `wk_train_center`.`el_plan_user_node` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `process_tag`;
ALTER TABLE `wk_train_center`.`el_plan_user_node` ADD INDEX `idx_deleted`(`deleted`);

-- 培训收藏表 el_plan_user_fav
ALTER TABLE `wk_train_center`.`el_plan_user_fav` 
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `user_id`;
ALTER TABLE `wk_train_center`.`el_plan_user_fav` ADD INDEX `idx_deleted`(`deleted`);

-- 4. 课程模块遗漏表添加逻辑删除字段
-- 课程引用课件表 el_course_ref_file
ALTER TABLE `wk_train_center`.`el_course_ref_file`
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `course_id`;
ALTER TABLE `wk_train_center`.`el_course_ref_file` ADD INDEX `idx_deleted`(`deleted`);

-- 课程引用目录表 el_course_ref_dir
ALTER TABLE `wk_train_center`.`el_course_ref_dir`
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `course_id`;
ALTER TABLE `wk_train_center`.`el_course_ref_dir` ADD INDEX `idx_deleted`(`deleted`);

-- 课程学习加入表 el_course_join
ALTER TABLE `wk_train_center`.`el_course_join`
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `create_time`;
ALTER TABLE `wk_train_center`.`el_course_join` ADD INDEX `idx_deleted`(`deleted`);

-- 课程直播表 el_course_live
ALTER TABLE `wk_train_center`.`el_course_live`
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_time`;
ALTER TABLE `wk_train_center`.`el_course_live` ADD INDEX `idx_deleted`(`deleted`);

-- 5. 题库模块表添加逻辑删除字段
-- 题目表 el_qu
ALTER TABLE `wk_train_center`.`el_qu`
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `update_by`;
ALTER TABLE `wk_train_center`.`el_qu` ADD INDEX `idx_deleted`(`deleted`);

-- 题目答案表 el_qu_answer
ALTER TABLE `wk_train_center`.`el_qu_answer`
ADD COLUMN `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除, 1=已删除' AFTER `score_rate`;
ALTER TABLE `wk_train_center`.`el_qu_answer` ADD INDEX `idx_deleted`(`deleted`);

-- 6. 课程学习记录表添加 plan_id 字段
-- 课程总进度表（el_course_learn）添加 plan_id 字段
ALTER TABLE `wk_train_center`.`el_course_learn`
ADD COLUMN plan_id VARCHAR(64) NULL COMMENT '培训计划ID，NULL表示自学' AFTER user_id;

ALTER TABLE `wk_train_center`.`el_course_learn`
ADD INDEX idx_course_learn_plan_id (plan_id);

-- 课件学习进度表（el_course_file_learn）添加 plan_id 字段
ALTER TABLE `wk_train_center`.`el_course_file_learn`
ADD COLUMN plan_id VARCHAR(64) NULL COMMENT '培训计划ID，NULL表示自学' AFTER user_id;

ALTER TABLE `wk_train_center`.`el_course_file_learn`
ADD INDEX idx_course_file_learn_plan_id (plan_id);

-- ============================================================
-- 模块: 课程问答 (course_qa)
-- ============================================================

-- 1. 增加讲师 ID 字段
ALTER TABLE `wk_train_center`.`el_course_qa`
ADD COLUMN `lecturer_id` VARCHAR(32) COMMENT '讲师 ID（课程讲师）' AFTER `course_id`;

-- 2. 创建索引，优化查询性能
ALTER TABLE `wk_train_center`.`el_course_qa`
ADD INDEX `idx_lecturer_id` (`lecturer_id`);

-- 3. 回填历史数据（根据课程表关联讲师 ID）
UPDATE `wk_train_center`.`el_course_qa` qa
INNER JOIN `wk_train_center`.`el_course` c ON qa.`course_id` = c.`id`
SET
    qa.`lecturer_id` = c.`lecturer_id`
WHERE
    qa.`lecturer_id` IS NULL;

-- ============================================================
-- 模块: 培训计划 (training-plan)
-- ============================================================

-- 1. 创建培训计划表
CREATE TABLE `el_training_plans` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除,1=已删除',
  `update_by` varchar(64) NOT NULL DEFAULT '' COMMENT '修改人',
  `filler_user_id` bigint(20) unsigned DEFAULT NULL COMMENT '填写人用户ID',
  `status` tinyint(4) NOT NULL COMMENT '计划状态: 1=待填写, 2=待生效, 3=已生效, 10=暂停',
  `plan_type` tinyint(4) NOT NULL COMMENT '培训计划类型: 1=年度',
  PRIMARY KEY (`id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_update_by` (`update_by`),
  KEY `idx_filler_user_id` (`filler_user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='培训计划表';

-- 2. 创建年度培训计划收集表
CREATE TABLE `el_training_plan_annual_collections` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(64) NOT NULL DEFAULT '' COMMENT '创建人',
  `update_by` varchar(64) NOT NULL DEFAULT '' COMMENT '修改人',
  `filler_user_ids` json NOT NULL COMMENT '填写人用户ID数组 (多选)',
  `fill_start_at` datetime NOT NULL COMMENT '填写起始时间',
  `fill_end_at` datetime NOT NULL COMMENT '填写结束时间',
  `dispatch_at` datetime NOT NULL COMMENT '任务分发时间',
  `status` tinyint(4) NOT NULL COMMENT '任务状态: 1=待提交, 2=已提交, 3=已分发, 4=已完成, 10=分发暂停',
  `deleted_at` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除,1=已删除',
  `plan_year` int(4) NOT NULL COMMENT '所属年度',
  `subject` varchar(200) NOT NULL COMMENT '年度培训计划主题',
  `description` varchar(500) DEFAULT NULL COMMENT '年度培训计划说明',
  `course_custom_fields` json DEFAULT NULL COMMENT '课程自定义字段',
  PRIMARY KEY (`id`),
  KEY `idx_plan_year` (`plan_year`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='年度培训计划收集表';

-- 3. 以下 ALTER 语句为旧版本迁移补丁，已在上方 CREATE TABLE 中包含完整字段定义，
--    对全新库直接执行 CREATE TABLE 即可，无需再执行以下 ALTER，统一注释掉。
-- （若在已存在旧结构表的环境升级，可选择性取消注释执行）

-- -- 如已存在 update_time 请忽略此语句
-- ALTER TABLE `el_training_plan_annual_collections`
--   ADD COLUMN `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间' AFTER `create_time`;

-- -- 如已存在 update_by 请忽略此语句
-- ALTER TABLE `el_training_plan_annual_collections`
--   ADD COLUMN `update_by` varchar(64) NOT NULL DEFAULT '' COMMENT '修改人' AFTER `create_by`;

-- -- 将 deleted_at 从 datetime 改为 tinyint(1) 逻辑删除位：0=未删除,1=已删除
-- -- 若已为 tinyint(1) 可忽略以下语句
-- ALTER TABLE `el_training_plan_annual_collections`
--   ADD COLUMN `deleted_at_new` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记：0=未删除,1=已删除';
-- UPDATE `el_training_plan_annual_collections`
--   SET `deleted_at_new` = CASE WHEN `deleted_at` IS NULL THEN 0 ELSE 1 END;
-- ALTER TABLE `el_training_plan_annual_collections`
--   DROP COLUMN `deleted_at`,
--   CHANGE COLUMN `deleted_at_new` `deleted_at` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记：0=未删除,1=已删除';

-- -- 索引兼容：如不存在则添加
-- ALTER TABLE `el_training_plan_annual_collections`
--   ADD INDEX `idx_deleted_at`(`deleted_at`);

-- 4. 创建收集计划-培训计划关联表
CREATE TABLE `el_training_plan_collection_relations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `collection_id` bigint(20) unsigned NOT NULL COMMENT '收集计划ID',
  `training_plan_id` bigint(20) unsigned NOT NULL COMMENT '培训计划ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_collection_plan` (`collection_id`,`training_plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收集计划-培训计划关联表';

-- 5. 创建培训计划-培训课程关联表
CREATE TABLE `el_training_plan_course_relations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `training_plan_id` bigint(20) unsigned NOT NULL COMMENT '培训计划ID',
  `training_course_id` bigint(20) unsigned NOT NULL COMMENT '培训课程ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_plan_course` (`training_plan_id`,`training_course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='培训计划-培训课程关联表';

-- 6. 创建培训课程表
CREATE TABLE `el_training_plan_courses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `record_uploader_id` bigint(20) unsigned NOT NULL COMMENT '培训记录上传人ID (单选)',
  `internal_lecturer_id` bigint(20) unsigned DEFAULT NULL COMMENT '内部讲师ID',
  `external_lecturer_name` varchar(100) DEFAULT NULL COMMENT '外部讲师姓名',
  `location` varchar(200) DEFAULT NULL COMMENT '场地',
  `equipment` varchar(200) DEFAULT NULL COMMENT '设备',
  `collaborator_user_id` bigint(20) unsigned DEFAULT NULL COMMENT '协同人员ID (单选)',
  `planned_start_date` date NOT NULL COMMENT '计划培训开始日期',
  `planned_end_date` date NOT NULL COMMENT '计划培训结束日期',
  `custom_fields` json DEFAULT NULL COMMENT '课程自定义字段',
  `collection_id` bigint(20) unsigned NOT NULL COMMENT '关联的收藏计划ID',
  `status` tinyint(4) NOT NULL COMMENT '状态: 10=待完成, 20=按时完成, 21=延时完成, 22=未完成',
  `deleted_at` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0=未删除,1=已删除',
  PRIMARY KEY (`id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_record_uploader_id` (`record_uploader_id`),
  KEY `idx_internal_lecturer_id` (`internal_lecturer_id`),
  KEY `idx_collection_id` (`collection_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='培训课程表';

-- 7. 为陪练记录表添加学习任务关联字段
ALTER TABLE `wk_train_center`.`el_training_record`
    ADD COLUMN `plan_id` VARCHAR(64) NULL COMMENT '学习计划id(学习任务中的陪练)' AFTER `overview`,
    ADD COLUMN `node_ref_id` VARCHAR(64) NULL COMMENT '节点引用id(学习任务中的陪练)' AFTER `plan_id`;

-- 为查询性能添加索引
CREATE INDEX `idx_plan_node` ON `wk_train_center`.`el_training_record` (`plan_id`, `node_ref_id`);

-- ============================================================
-- 模块: 讲师管理 (lecturer)
-- ============================================================
-- 已在系统配置模块中处理角色编码相关变更

-- ============================================================
-- 执行完毕
-- ============================================================
-- 总影响表数量: 约35+ 个
-- 主要变更:
-- 1. 系统配置: 3个字段新增，3个UPDATE
-- 2. 部门管理: 1个字段新增，1个新表创建
-- 3. 课程模块: 26个表添加逻辑删除字段，2个表添加plan_id字段
-- 4. 课程问答: 1个字段新增，1个索引创建，1个UPDATE
-- 5. 培训计划: 6个新表创建，2个字段新增，1个索引创建
-- ============================================================
