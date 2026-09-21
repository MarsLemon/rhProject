ALTER TABLE `wk_train_center`.`el_sys_depart`
    ADD COLUMN `dept_no` varchar(128) DEFAULT NULL COMMENT '系统部门编号' AFTER `dept_code`;

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

ALTER TABLE `wk_train_center`.`el_sys_user`
    ADD COLUMN `function_id` varchar(128) DEFAULT NULL COMMENT '职务Id' AFTER `dept_code`;