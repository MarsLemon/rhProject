ALTER TABLE `wk_train_center`.`el_plan_node`
ADD COLUMN `check_rules_json` text COMMENT '防呆规则快照JSON' AFTER `file_durations_json`;


CREATE TABLE `wk_train_center`.`el_sys_role_menu_backup_20260710` AS
SELECT *
FROM el_sys_role_menu;


DROP TABLE `wk_train_center`.`el_sys_role_menu_backup`;

UPDATE `wk_train_center`.`el_sys_role_menu` rm
INNER JOIN `wk_train_center`.`el_sys_role` r ON rm.role_id = r.id
SET
rm.data_scope = r.data_scope
WHERE
r.data_scope IS NOT NULL
    AND rm.data_scope <> r.data_scope;
