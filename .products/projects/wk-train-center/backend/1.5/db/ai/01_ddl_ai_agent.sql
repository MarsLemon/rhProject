-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

-- ============================================================
-- DDL 工单：AI 智能体配置控制台建表
-- 提交方式：Yearning DDL 工单
-- ============================================================

-- 主表：Agent 元数据
CREATE TABLE IF NOT EXISTS `wk_train_center`.`ai_agent` (
    pk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键 ID',
    id VARCHAR(64) NOT NULL COMMENT '智能体唯一 ID（业务方调用入口）',
    name VARCHAR(128) NOT NULL COMMENT '显示名',
    short_desc VARCHAR(64) COMMENT '简述（前端 maxlength=64 + 后端 @Size(max=64)）',
    description VARCHAR(512) COMMENT '详细用途描述',
    tags VARCHAR(255) COMMENT '标签（逗号分隔，AI 调控维度）',
    system_prompt TEXT COMMENT '系统提示词',
    stream_enabled TINYINT(1) DEFAULT 1 COMMENT '流式输出开关',
    enabled TINYINT(1) DEFAULT 1 COMMENT '启用开关',
    archived_at DATETIME COMMENT '软删除时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (pk),
    UNIQUE INDEX uniq_agent_id (id),
    INDEX idx_enabled (enabled),
    INDEX idx_tags (tags),
    INDEX idx_archived (archived_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 智能体元数据表';

-- 配置表：key-value JSON 存储
CREATE TABLE IF NOT EXISTS `wk_train_center`.`ai_agent_config` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键 ID',
    agent_id VARCHAR(64) NOT NULL COMMENT '关联 ai_agent.id',
    config_key VARCHAR(64) NOT NULL COMMENT '配置域',
    config_value TEXT NOT NULL COMMENT 'JSON 格式配置值',
    enabled TINYINT(1) DEFAULT 1 COMMENT 'enabled=0 时走 fallback',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE INDEX uniq_agent_key (agent_id, config_key),
    INDEX idx_agent_enabled (agent_id, enabled)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 智能体配置表';