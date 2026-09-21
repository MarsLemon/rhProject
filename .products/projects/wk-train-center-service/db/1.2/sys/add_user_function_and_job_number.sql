-- 为用户表添加职务和工号字段
-- 执行日期: 2026-04-14

-- 添加职务ID字段
ALTER TABLE `wk_train_center`.`el_sys_user` 
ADD COLUMN `function_id` VARCHAR(50) NULL COMMENT '职务Id' AFTER `dept_code`;

-- 添加工号字段
ALTER TABLE `wk_train_center`.`el_sys_user` 
ADD COLUMN `job_number` VARCHAR(50) NULL COMMENT '工号' AFTER `function_id`;
