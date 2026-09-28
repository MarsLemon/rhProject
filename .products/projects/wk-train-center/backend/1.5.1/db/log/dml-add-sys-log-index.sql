-- ============================================
-- DML: 操作日志表索引验证和说明数据
-- ============================================
-- 版本：1.5.1
-- 日期：2026-08-27
-- 作者：Qoder AI
-- 用途：索引创建后验证 + 性能分析数据准备
-- 影响表：el_sys_log
-- 依赖：无
-- 审核人：qoder:<model>
-- 审核日期：2026-08-27
-- ============================================

-- ============== 性能分析 SQL (DML) ==============
-- EXPLAIN: 查询计划分析（用于验证索引是否生效）
-- 说明：执行后可观察 key、type、rows 字段判断索引使用情况
EXPLAIN SELECT * FROM el_sys_log 
WHERE title LIKE '%删除课件%' 
ORDER BY create_time DESC 
LIMIT 10;

-- 期望输出字段说明：
-- | id | select_type | table | partitions | type | possible_keys | key | key_len | ref | rows | Extra |
-- | ---| ----------- | ----- | ---------- | ---- | ------------- | --- | ----- | --- | ---- | ----- |
-- | 1  | SIMPLE      | el_sys_log | NULL   | range| idx_sys_log_title | idx_sys_log_title | 3072 | NULL | 几百行 | Using index condition; Using filesort |

-- ============== 数据量统计 (DML) ==============
-- COUNT(*): 统计表总记录数（仅用于评估，非修改操作）
-- 说明：用于了解表规模，辅助评估索引效果
SELECT COUNT(*) AS total_rows
FROM el_sys_log;

-- ============== 历史数据示例 (DML) ==============
-- SELECT: 查看最近 10 条日志数据（仅用于验证，非修改操作）
-- 说明：可选执行，用于确认数据结构符合预期
-- 注意：real_name 需要从 el_sys_user 表 JOIN 获取
-- log_type_dictText 需要从 el_sys_log_type 表 JOIN 获取
SELECT lg.id, lg.title, lg.log_type, lg.user_id, lg.ip, lg.create_time
FROM el_sys_log lg
ORDER BY lg.create_time DESC
LIMIT 10;
