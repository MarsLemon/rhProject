-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

-- 1. 新增知识点备注字段
ALTER TABLE el_sys_key_point
ADD COLUMN remark VARCHAR(500) COMMENT '描述/备注';

-- 2. 创建用户知识点掌握度统计表
CREATE TABLE `el_user_knowledge_stat` (
  `id` varchar(32) NOT NULL COMMENT 'ID',
  `user_id` varchar(32) NOT NULL COMMENT '用户ID',
  `point_code` varchar(32) NOT NULL COMMENT '知识点编码',
  `mastery_score` int(11) DEFAULT '0' COMMENT '掌握度(0-100)',
  `practice_count` int(11) DEFAULT '0' COMMENT '练习次数',
  `wrong_count` int(11) DEFAULT '0' COMMENT '错误次数',
  `update_time` datetime DEFAULT NULL COMMENT '最后更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_point` (`user_id`, `point_code`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户知识点掌握度统计表';

-- 1. 知识点表增加逻辑删除字段
ALTER TABLE el_sys_key_point
ADD COLUMN deleted INT DEFAULT 0 COMMENT '逻辑删除:0否1是';

-- 2. 知识点关联表增加逻辑删除字段
ALTER TABLE el_sys_key_point_ref
ADD COLUMN deleted INT DEFAULT 0 COMMENT '逻辑删除:0否1是';

ALTER TABLE el_sys_key_point
ADD COLUMN difficulty_level INT DEFAULT 1 COMMENT '认知难度(1-5)';

ALTER TABLE el_sys_key_point_ref
ADD COLUMN ref_level INT DEFAULT 3 COMMENT '关联强度(1-5)';