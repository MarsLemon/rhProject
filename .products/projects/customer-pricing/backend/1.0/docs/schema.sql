-- 设备分类树（仅导航，R-01：叶子=设备，不参与定价）
CREATE TABLE IF NOT EXISTS `wk_customer_pricing`.`wk_equipment_category`
(
    `id`              BIGINT                                                        NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `parent_id`       BIGINT                                                        NULL     DEFAULT NULL COMMENT '父节点id，NULL=一级分类',
    `code`            VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci  NOT NULL COMMENT '分类编码，系统按层级自动生成，全局唯一',
    `name`            VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分类中文名',
    `name_en`         VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL     DEFAULT NULL COMMENT '分类英文名，中英双语搜索用',
    `level`           INT                                                           NOT NULL COMMENT '层级深度：1=一级分类，服务端计算',
    `sort_order`      INT                                                           NOT NULL DEFAULT 0 COMMENT '同级排序号，升序',
    `status`          TINYINT                                                       NOT NULL DEFAULT 1 COMMENT '业务状态：1启用 0停用，停用后前台导航隐藏该节点及其子孙',
    `state`           TINYINT                                                       NOT NULL DEFAULT 1 COMMENT '数据状态：1.启用 2.冻结 3.删除',
    `create_time`     DATETIME                                                      NULL     DEFAULT NULL COMMENT '创建时间',
    `create_operator` JSON                                                          NULL     DEFAULT NULL COMMENT '创建人快照',
    `update_time`     DATETIME                                                      NULL     DEFAULT NULL COMMENT '更新时间',
    `update_operator` JSON                                                          NULL     DEFAULT NULL COMMENT '更新人快照',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code_state` (`code`, `state`),
    KEY `idx_parent` (`parent_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT ='设备分类树（仅导航，叶子=设备）';

-- 厂家字典（R-03：型号-厂家多对多的全局字典；R-04：价格与厂家无关）
CREATE TABLE IF NOT EXISTS `wk_customer_pricing`.`wk_manufacturer`
(
    `id`              BIGINT                                                        NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `code`            VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci  NOT NULL COMMENT '厂家编码，系统生成（M+4位序号），全局唯一',
    `name`            VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '厂家中文名，精确唯一',
    `name_en`         VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL     DEFAULT NULL COMMENT '厂家英文名',
    `status`          TINYINT                                                       NOT NULL DEFAULT 1 COMMENT '业务状态：1启用 0停用，停用后不出现在启用厂家列表',
    `state`           TINYINT                                                       NOT NULL DEFAULT 1 COMMENT '数据状态：1.启用 2.冻结 3.删除',
    `create_time`     DATETIME                                                      NULL     DEFAULT NULL COMMENT '创建时间',
    `create_operator` JSON                                                          NULL     DEFAULT NULL COMMENT '创建人快照',
    `update_time`     DATETIME                                                      NULL     DEFAULT NULL COMMENT '更新时间',
    `update_operator` JSON                                                          NULL     DEFAULT NULL COMMENT '更新人快照',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code_state` (`code`, `state`),
    KEY `idx_name` (`name`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT ='厂家字典';

-- 设备（分类叶子下的具体可维保设备；不参与定价，R-01）
CREATE TABLE IF NOT EXISTS `wk_customer_pricing`.`wk_equipment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `category_id` BIGINT NOT NULL COMMENT '所属分类id（FK→wk_equipment_category.id）',
    `code` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '设备编码，系统按 父分类code.3位序号 生成，全局唯一（BR-EQ01）',
    `name` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '设备中文名',
    `name_en` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '设备英文名，中英双语搜索用',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '业务状态：1启用 0停用，停用后前台不可见（BR-EQ04）',
    `state` TINYINT NOT NULL DEFAULT 1 COMMENT '数据状态：1.启用 2.冻结 3.删除',
    `create_time` DATETIME NULL DEFAULT NULL COMMENT '创建时间',
    `create_operator` JSON NULL DEFAULT NULL COMMENT '创建人快照',
    `update_time` DATETIME NULL DEFAULT NULL COMMENT '更新时间',
    `update_operator` JSON NULL DEFAULT NULL COMMENT '更新人快照',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code_state` (`code`, `state`),
    UNIQUE KEY `uk_category_name` (`category_id`, `name`) COMMENT '同分类下中文名精确唯一（BR-EQ-10）',
    KEY `idx_category` (`category_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '设备（分类叶子下的具体可维保设备；不参与定价）';

-- 型号（设备下的具体机型；不参与定价，R-01；含缸数属性，D3）
CREATE TABLE IF NOT EXISTS `wk_customer_pricing`.`wk_model`
(
    `id`                      BIGINT                          NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `code`                    VARCHAR(50)                     NOT NULL COMMENT '型号编码，系统生成 MOD+4位序号，全局唯一（BR-MOD-01）',
    `equipment_id`            BIGINT                          NOT NULL COMMENT '所属设备id（FK→wk_equipment.id）',
    `default_manufacturer_id` BIGINT                          NULL     DEFAULT NULL COMMENT '默认厂家id（FK→wk_manufacturer.id，IN-EQ-04 必属关联集合）',
    `name`                    VARCHAR(100)                    NOT NULL COMMENT '型号中文名',
    `name_en`                 VARCHAR(200)                    NULL     DEFAULT NULL COMMENT '型号英文名',
    `mark`                    VARCHAR(50)                     NULL     DEFAULT NULL COMMENT 'mark/版本号（如 C9.7），选填',
    `cylinder_count`          INT                             NOT NULL COMMENT '缸数，1-20（R-05/D3）',
    `power_kw`                DECIMAL(10,2)                   NULL     DEFAULT NULL COMMENT '功率kW（可选维度）',
    `bore_mm`                 INT                             NULL     DEFAULT NULL COMMENT '缸径mm（可选维度）',
    `status`                  TINYINT                         NOT NULL DEFAULT 1 COMMENT '业务状态：1启用 0停用',
    `state`                   TINYINT                         NOT NULL DEFAULT 1 COMMENT '数据状态：1.启用 2.冻结 3.删除',
    `create_time`             DATETIME                        NULL     DEFAULT NULL COMMENT '创建时间',
    `create_operator`         JSON                            NULL     DEFAULT NULL COMMENT '创建人快照',
    `update_time`             DATETIME                        NULL     DEFAULT NULL COMMENT '更新时间',
    `update_operator`         JSON                            NULL     DEFAULT NULL COMMENT '更新人快照',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code_state` (`code`, `state`),
    UNIQUE KEY `uk_equipment_name` (`equipment_id`, `name`) COMMENT '同设备下中文名精确唯一（BR-MOD-14）',
    KEY `idx_equipment` (`equipment_id`),
    KEY `idx_default_manufacturer` (`default_manufacturer_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT ='型号（设备下的具体机型；含缸数属性）';

-- 型号-厂家关联（多对多；含授权生产标记 + 展示排序）
CREATE TABLE IF NOT EXISTS `wk_customer_pricing`.`wk_model_manufacturer`
(
    `id`              BIGINT  NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `model_id`        BIGINT  NOT NULL COMMENT '型号id（FK→wk_model.id）',
    `manufacturer_id` BIGINT  NOT NULL COMMENT '厂家id（FK→wk_manufacturer.id）',
    `is_license`      TINYINT NOT NULL DEFAULT 0 COMMENT '1=授权生产 0=自有（BR-MOD-10）',
    `sort_order`      INT     NOT NULL DEFAULT 99 COMMENT '展示排序，升序；默认 99=置后（BR-MOD-10）',
    `create_time`     DATETIME NULL DEFAULT NULL COMMENT '创建时间',
    `create_operator` JSON     NULL DEFAULT NULL COMMENT '创建人快照',
    `update_time`     DATETIME NULL DEFAULT NULL COMMENT '更新时间',
    `update_operator` JSON     NULL DEFAULT NULL COMMENT '更新人快照',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_model_manufacturer` (`model_id`, `manufacturer_id`),
    KEY `idx_manufacturer` (`manufacturer_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT ='型号-厂家关联（多对多；含授权生产标记 + 展示排序）';

-- 服务信息与影响系数（v1.4 落地版本，对齐 DDL §3.26~3.30 + 《开发需求文档》v1.11 §6.2.25-29）
-- 计价参数（单租户单行配置 + value_type 解析；D16/R-30）
CREATE TABLE IF NOT EXISTS `wk_customer_pricing`.`wk_pricing_param`
(
    `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `param_key`    VARCHAR(50)  NOT NULL COMMENT '参数键(min_billable_hours/floor_enabled/hours_per_day)',
    `param_value`  VARCHAR(200) NOT NULL COMMENT '参数值(数字或布尔字符串,按 value_type 解析)',
    `value_type`   VARCHAR(20)  NOT NULL DEFAULT 'string' COMMENT '值类型:int/decimal/bool/string(后端解析用)',
    `remark`       VARCHAR(500) DEFAULT NULL COMMENT '说明',
    `state`        TINYINT      NOT NULL DEFAULT 1 COMMENT '1.启用 2.冻结 3.删除',
    `create_time`  DATETIME     DEFAULT NULL,
    `create_operator` JSON      DEFAULT NULL,
    `update_time`  DATETIME     DEFAULT NULL,
    `update_operator` JSON      DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_param_key_state` (`param_key`, `state`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT ='计价参数(单行全局配置,D16/v2.5)';

-- 服务地点三级树（大地区 > 国家 > 地点，IN-MC-19 固定三级；D17/R-39）
CREATE TABLE IF NOT EXISTS `wk_customer_pricing`.`wk_service_location`
(
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `parent_id`   BIGINT       DEFAULT NULL COMMENT '父节点id(大地区=NULL)',
    `level`       TINYINT      NOT NULL COMMENT '1=大地区 2=国家 3=地点',
    `code`        VARCHAR(50)  NOT NULL COMMENT '编码(全局唯一)',
    `name`        VARCHAR(100) NOT NULL COMMENT '名称',
    `name_en`     VARCHAR(100) DEFAULT NULL COMMENT '英文名(前台双语展示)',
    `sort_order`  INT          NOT NULL DEFAULT 0 COMMENT '同级展示排序',
    `status`      TINYINT      NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用(停用级联隐藏其全部子孙)',
    `state`       TINYINT      NOT NULL DEFAULT 1 COMMENT '1.启用 2.冻结 3.删除',
    `create_time` DATETIME     DEFAULT NULL,
    `create_operator` JSON     DEFAULT NULL,
    `update_time` DATETIME     DEFAULT NULL,
    `update_operator` JSON     DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code_state` (`code`, `state`),
    KEY `idx_parent` (`parent_id`),
    KEY `idx_level_status` (`level`, `status`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT ='服务地点(三级树:大地区>国家>地点,D17/v2.5)';

-- 地点影响系数（任一 level 都可配；解析 地点级>国家级>大地区级，未命中=1.0；D17/R-41/IN-MC-17）
CREATE TABLE IF NOT EXISTS `wk_customer_pricing`.`wk_location_coefficient`
(
    `id`           BIGINT         NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `location_id`  BIGINT         NOT NULL COMMENT '服务地点 id(国家/地点/大地区级均可;区域兜底)',
    `coefficient`  DECIMAL(6,4)   NOT NULL DEFAULT 1.0000 COMMENT '系数(>0;建议区间[0.5,3.0]越界保存告警)',
    `remark`       VARCHAR(200)   DEFAULT NULL COMMENT '说明(如"远地差旅投入高")',
    `status`       TINYINT        NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用(停用视为该行不生效,回退1.0)',
    `state`        TINYINT        NOT NULL DEFAULT 1 COMMENT '1.启用 2.冻结 3.删除',
    `create_time`  DATETIME       DEFAULT NULL,
    `create_operator` JSON        DEFAULT NULL,
    `update_time`  DATETIME       DEFAULT NULL,
    `update_operator` JSON        DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_location` (`location_id`),
    KEY `idx_status` (`status`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT ='地点影响系数(地点级>国家级>大地区级,D17/v2.5)';

-- 紧急程度字典（含紧急系数；首项 sort_order 最小为默认项，不可改名/删；D17/R-38/IN-MC-16）
CREATE TABLE IF NOT EXISTS `wk_customer_pricing`.`wk_urgency_level`
(
    `code`        VARCHAR(20)   NOT NULL COMMENT '枚举值(normal/urgent,PK 字符串)',
    `name`        VARCHAR(50)   NOT NULL COMMENT '名称(不紧急/紧急)',
    `coefficient` DECIMAL(6,4)  NOT NULL DEFAULT 1.0000 COMMENT '紧急系数(>0;建议区间[0.5,3.0])',
    `sort_order`  INT           NOT NULL DEFAULT 0 COMMENT '展示排序;最小者为默认项(锁定,BR-MOD3-06b)',
    `status`      TINYINT       NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用(停用回退 normal,BR-MOD3-07b)',
    `state`       TINYINT       NOT NULL DEFAULT 1 COMMENT '1.启用 2.冻结 3.删除',
    `create_time` DATETIME      DEFAULT NULL,
    `create_operator` JSON      DEFAULT NULL,
    `update_time` DATETIME      DEFAULT NULL,
    `update_operator` JSON      DEFAULT NULL,
    PRIMARY KEY (`code`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT ='紧急程度字典(含紧急系数,D17/v2.5)';

-- 时间影响系数（距询价天数区间；不重叠+全覆盖[0,+∞)，IN-MC-18；D17/R-40）
CREATE TABLE IF NOT EXISTS `wk_customer_pricing`.`wk_lead_time_coefficient`
(
    `id`          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `min_days`    INT           NOT NULL COMMENT '天数下限(含),从 0 起',
    `max_days`    INT           DEFAULT NULL COMMENT '天数上限(含,NULL=无上限/∞)',
    `coefficient` DECIMAL(6,4)  NOT NULL DEFAULT 1.0000 COMMENT '时间系数(>0;建议区间[0.5,3.0])',
    `remark`      VARCHAR(200)  DEFAULT NULL COMMENT '说明(如"7 天内加急排产")',
    `status`      TINYINT       NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用',
    `state`       TINYINT       NOT NULL DEFAULT 1 COMMENT '1.启用 2.冻结 3.删除',
    `create_time` DATETIME      DEFAULT NULL,
    `create_operator` JSON      DEFAULT NULL,
    `update_time` DATETIME      DEFAULT NULL,
    `update_operator` JSON      DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_min_max` (`min_days`, `max_days`),
    KEY `idx_status` (`status`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT ='时间影响系数(距询价天数区间,D17/v2.5)';

-- M3 初始化数据（4 档 lead_time 严格对齐 demo [0,2]/[3,7]/[8,29]/[30,∞) + 紧急 2 档
INSERT IGNORE INTO `wk_customer_pricing`.`wk_pricing_param` (`param_key`, `param_value`, `value_type`, `remark`) VALUES
  ('min_billable_hours', '8', 'decimal', '最低计费工时(保底价按一份计 × 此值,默认 8h;R-30/D16)'),
  ('floor_enabled',      '1', 'bool',    '保底开关:1=启用(保底公式生效),0=禁用(计价基数=明细合计;DDL v2.30 §3.30 注释)'),
  ('hours_per_day',      '8', 'decimal', '"天"→小时折算(标准工时模块消费,默认 8h/天;R-33)');

INSERT IGNORE INTO `wk_customer_pricing`.`wk_urgency_level` (`code`, `name`, `coefficient`, `sort_order`) VALUES
  ('normal', '不紧急', 1.0000, 1),
  ('urgent', '紧急',   1.2000, 2);

INSERT IGNORE INTO `wk_customer_pricing`.`wk_lead_time_coefficient` (`min_days`, `max_days`, `coefficient`, `remark`) VALUES
  (0, 2,    1.2500, '0–2 天超紧急:加班赶工、挤排产'),
  (3, 7,    1.1000, '一周内:加急安排'),
  (8, 29,   1.0000, '常规提前期(基准),不打折不加价'),
  (30, NULL, 0.9500, '远期需求(≥30 天):可统筹排班');