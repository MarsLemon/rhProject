-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

-- ============================================================
-- 修复：去掉培训计划节点的「必须学习」概念
-- 描述：删除 el_plan_node.required 字段
--       管理端不再展示「必学」勾选（前端 form.vue 等已清理）
--       学员端不再有「必学项目」统计概念（已统一为「项目数」= 非陪练节点总数）
--       配合 PR（详见 fix-plans/20260615-unlock-flow-required-button-removed-vulns.md）：
--         - 后端：PlanNode 实体 / PlanNodeDTO / PlanNodeMapper.xml 移除 required 字段
--         - 后端：PlanUserMapper.xml / PlanUserNodeClientMapper.xml 移除 `required=1` 过滤
--         - 后端：PlanPreCheckMapper.xml 移除 nd.required 列
--         - 前端：删除 3 处 `required = false` 强制赋值
--         - 前端：管理端列表「必学项目」列名改为「项目数」
--
-- 兼容说明：
--   MySQL 8.0.29+ 支持 `DROP COLUMN IF EXISTS`（dev 8.0.31 已验证）
--   MySQL 8.0.0 - 8.0.28 不支持 IF EXISTS 子句（会报 ERROR 1064）
--   为兼容老 MySQL,本脚本用 stored procedure + information_schema 模式:
--   - 先 SELECT 检查列是否存在
--   - 仅在存在时执行 DROP
--   - 适用于 MySQL 5.7+ / 8.0+ 全版本
-- ============================================================

-- 1. 用存储过程安全删除（兼容 MySQL 5.7 - 8.0.x 全版本）
DROP PROCEDURE IF EXISTS drop_column_if_exists;
DELIMITER //
CREATE PROCEDURE drop_column_if_exists()
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = 'wk_train_center'
          AND TABLE_NAME   = 'el_plan_node'
          AND COLUMN_NAME  = 'required'
    ) THEN
        ALTER TABLE `wk_train_center`.`el_plan_node`
        DROP COLUMN `required`;
    ELSE
        -- 列已不存在,跳过(幂等)
        SELECT 'el_plan_node.required 列已不存在,跳过 DROP' AS note;
    END IF;
END //
DELIMITER ;

CALL drop_column_if_exists();
DROP PROCEDURE drop_column_if_exists;

-- 2. 验证：表结构应该没有 required 列
-- SHOW COLUMNS FROM `wk_train_center`.`el_plan_node` LIKE 'required';
-- 期望：Empty set（无结果）

-- 3. 验证：历史数据无残留查询（直接查应该报错，因为列已删除）
-- SELECT id, required FROM `wk_train_center`.`el_plan_node` LIMIT 1;
-- 期望：ERROR 1054 (42S22): Unknown column 'required' in 'field list'

-- 4. 回滚脚本（如需重新启用 required 字段,执行以下语句）
-- ALTER TABLE `wk_train_center`.`el_plan_node`
-- ADD COLUMN `required` TINYINT(1) DEFAULT 0 COMMENT '是否必须完成（历史字段，2026-06-17 已废弃）' AFTER `title`;
