-- ============================================================
-- STATUS:
--   dev: 未执行
--   stage: 未执行
--   pro: 未执行
-- ============================================================
-- SUMMARY: 操作日志表索引（title 搜索 + 复合查询性能）
-- TABLES: el_sys_log

CREATE INDEX idx_sys_log_title ON el_sys_log(title);

CREATE INDEX idx_sys_log_create_time ON el_sys_log(create_time);

CREATE INDEX idx_sys_log_user_time ON el_sys_log(user_id, create_time);
