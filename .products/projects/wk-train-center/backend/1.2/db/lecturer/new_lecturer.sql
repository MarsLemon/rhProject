-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

ALTER TABLE `wk_train_center`.`el_sys_role`
    ADD COLUMN role_code VARCHAR(50) COMMENT '角色编码';

-- 为现有角色设置编码
UPDATE `wk_train_center`.`el_sys_role` SET role_code = 'lecturer' WHERE role_name = '教师';
UPDATE `wk_train_center`.`el_sys_role` SET role_code = 'student' WHERE role_name = '学员';
UPDATE `wk_train_center`.`el_sys_role` SET role_code = 'admin' WHERE role_name = '管理员';

ALTER TABLE `wk_train_center`.`el_sys_role`
    ADD UNIQUE INDEX uk_role_code (role_code);