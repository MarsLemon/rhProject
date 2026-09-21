-- ----------------------------
-- 1. 添加 bailian_file_id 字段
-- ----------------------------
ALTER TABLE el_course_file 
ADD COLUMN bailian_file_id VARCHAR(64) NULL COMMENT '百炼文件ID';

-- ----------------------------
-- 2. 添加 bailian_index_job_id 字段
-- ----------------------------
ALTER TABLE el_course_file 
ADD COLUMN bailian_index_job_id VARCHAR(64) NULL COMMENT '百炼索引任务ID';

-- ----------------------------
-- 3. 添加 bailian_sync_status 字段
-- 设置默认值为 'PENDING'，现有数据会自动填充该默认值
-- ----------------------------
ALTER TABLE el_course_file 
ADD COLUMN bailian_sync_status VARCHAR(20) DEFAULT 'PENDING' NULL COMMENT '百炼同步状态: PENDING-待同步, IMPORTED-已导入, PARSED-已解析, INDEXING-索引中, SUCCESS-成功, FAILED-失败';

-- ----------------------------
-- 4. 再次确认历史数据
-- 虽然 DEFAULT 会自动处理，但为了双重保险，显式更新旧数据（可选）
-- ----------------------------
UPDATE el_course_file 
SET bailian_sync_status = 'PENDING' 
WHERE bailian_sync_status IS NULL;
