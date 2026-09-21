-- 为el_sys_role_menu表添加data_scope字段
-- 用于支持菜单级别的数据权限控制
CREATE TABLE el_sys_role_menu_backup AS
SELECT
  *
FROM
  el_sys_role_menu;

-- 1. 添加data_scope字段
ALTER TABLE el_sys_role_menu
ADD COLUMN data_scope INT(11) DEFAULT NULL COMMENT '数据权限:1=本人,2=本部门,3=本部门及以下,4=全部';

-- 2. 从角色表继承数据权限到角色菜单关系表
-- 为每个角色菜单关系记录设置与角色相同的数据权限
UPDATE el_sys_role_menu rm
INNER JOIN el_sys_role r ON rm.role_id = r.id
SET
  rm.data_scope = r.data_scope;

-- 3. 添加索引以优化查询性能
CREATE INDEX idx_role_menu_scope ON el_sys_role_menu (role_id, menu_id, data_scope);

-- 查询验证
SELECT
  rm.id,
  rm.role_id,
  r.role_name,
  rm.menu_id,
  m.meta_title AS menu_name,
  rm.data_scope,
  r.data_scope AS role_data_scope
FROM
  el_sys_role_menu rm
  INNER JOIN el_sys_role r ON rm.role_id = r.id
  LEFT JOIN el_sys_menu m ON rm.menu_id = m.id
ORDER BY
  rm.role_id,
  rm.menu_id
LIMIT
  20;
