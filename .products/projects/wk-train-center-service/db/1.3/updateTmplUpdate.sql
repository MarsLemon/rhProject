ALTER TABLE `wk_train_center`.`el_tmpl` ADD COLUMN update_by VARCHAR(64) COMMENT '更新人';
ALTER TABLE `wk_train_center`.`el_tmpl` ADD COLUMN update_time DATETIME COMMENT '更新时间';

ALTER TABLE `wk_train_center`.`el_msg_tmpl`
    ADD COLUMN `image_url` VARCHAR(255) COMMENT '预览大图链接' AFTER `template`;

ALTER TABLE `wk_train_center`.`el_msg_tmpl`
    ADD COLUMN `button_name` VARCHAR(255) COMMENT '按钮名称' AFTER `image_url`;

ALTER TABLE `wk_train_center`.`el_msg_tmpl`
    ADD COLUMN `jump_url` VARCHAR(255) COMMENT '按钮跳转链接' AFTER `button_name`;
