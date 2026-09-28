-- ============================================
-- DDL: 操作日志表索引创建脚本
-- ============================================
-- 版本：1.5.1
-- 日期：2026-08-27
-- 作者：Qoder AI
-- 用途：支持按日志名称 (title) 搜索及提升复合查询性能
-- 影响表：el_sys_log
-- 依赖：无
-- 审核人：qoder:<model>
-- 审核日期：2026-08-27
-- ============================================

-- ============== idx_sys_log_title ==============
-- ALTER: ADD INDEX
-- 索引名称：idx_sys_log_title
-- 字段名称：title
-- 说明：支持日志名称模糊搜索
-- 风险：low - 小表无影响，大表可能慢 (建议评估数据量)
CREATE INDEX idx_sys_log_title ON el_sys_log(title);

-- ============== idx_sys_log_create_time ==============
-- ALTER: ADD INDEX
-- 索引名称：idx_sys_log_create_time
-- 字段名称：create_time
-- 说明：配合 LogClearJob 删除过期日志 + 分页查询 ORDER BY create_time DESC
CREATE INDEX idx_sys_log_create_time ON el_sys_log(create_time);

-- ============== idx_sys_log_user_time ==============
-- ALTER: ADD INDEX
-- 索引名称：idx_sys_log_user_time
-- 字段名称：user_id, create_time
-- 说明：查某用户的历史日志记录（复合索引）
CREATE INDEX idx_sys_log_user_time ON el_sys_log(user_id, create_time);
