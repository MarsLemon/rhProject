-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

CREATE TABLE IF NOT EXISTS el_sys_key_point_edge (
  id VARCHAR(32) NOT NULL,
  from_code VARCHAR(32) NOT NULL,
  to_code VARCHAR(32) NOT NULL,
  relation_type VARCHAR(32) NOT NULL,
  weight INT DEFAULT 0,
  version BIGINT DEFAULT 1,
  deleted INT DEFAULT 0,
  create_time DATETIME DEFAULT NULL,
  update_time DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_edge(from_code, to_code, relation_type, version, deleted),
  KEY idx_from_type(from_code, relation_type, deleted),
  KEY idx_to_type(to_code, relation_type, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识图谱边(知识点-知识点关系)';
