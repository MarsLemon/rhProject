-- ============================================================
-- STATUS:
--   dev: 已执行
--   stage: 已执行
--   pro: 已执行
-- ============================================================

-- Active: 1780627858548@@rm-m5e6ilu15j9sq6s774o.mysql.rds.aliyuncs.com@3306@wk_train_center
-- ============================================================
-- DDL 工单：el_repo 增加 (title, create_by) 唯一索引
-- 模块：repo（题库）
-- 背景：试题导入支持「按文件名查找/新建题库」。el_repo.title 此前无唯一约束，
--       同名并发导入会产生重复题库，且按名匹配结果不确定。增加 (title, create_by)
--       唯一索引后，同一用户不会拥有同名题库，导入按名匹配结果确定。
-- 影响表：el_repo（结构）；el_qu / el_sys_key_point_ref（存量去重时的数据归并）
-- 提交方式：Yearning DDL 工单
-- 注意：create_by 可空，MySQL 唯一索引允许多个 (title, NULL) 共存（历史匿名数据不受约束）。
-- ============================================================

-- ------------------------------------------------------------
-- 步骤 0｜预检：查看存量同名同创建人重复（执行前先看，应为空才可直达步骤 3）
-- ------------------------------------------------------------
SELECT
    title,
    create_by,
    COUNT(*) AS cnt,
    GROUP_CONCAT(
        id
        ORDER BY create_time, id
    ) AS repo_ids
FROM el_repo
GROUP BY
    title,
    create_by
HAVING
    cnt > 1;

-- ------------------------------------------------------------
-- 步骤 1｜存量去重（仅当步骤 0 有结果时执行；保留最早创建的题库，其余软删除）
--   1.1 把重复题库下的试题归并到「保留库」（同组 create_time 最早者）
-- ------------------------------------------------------------
UPDATE el_qu q
JOIN (
    SELECT r.id AS dup_id, k.keep_id
    FROM
        el_repo r
        JOIN (
            SELECT title, create_by, MIN(create_time) AS min_ct
            FROM el_repo
            WHERE
                deleted = 0
            GROUP BY
                title,
                create_by
            HAVING
                COUNT(*) > 1
        ) g ON g.title = r.title
        AND (
            (
                g.create_by IS NULL
                AND r.create_by IS NULL
            )
            OR g.create_by = r.create_by
        )
        JOIN el_repo k ON k.title = r.title
        AND (
            (
                k.create_by IS NULL
                AND r.create_by IS NULL
            )
            OR k.create_by = r.create_by
        )
        AND k.create_time = g.min_ct
        AND k.id <> r.id
    WHERE
        r.deleted = 0
) m ON m.dup_id = q.repo_id
SET
    q.repo_id = m.keep_id
WHERE
    q.deleted = 0;

--   1.2 软删除重复题库（保留最早一条）
UPDATE el_repo r
JOIN (
    SELECT title, create_by, MIN(create_time) AS min_ct
    FROM el_repo
    WHERE
        deleted = 0
    GROUP BY
        title,
        create_by
    HAVING
        COUNT(*) > 1
) g ON g.title = r.title
AND (
    (
        g.create_by IS NULL
        AND r.create_by IS NULL
    )
    OR g.create_by = r.create_by
)
SET
    r.deleted = 1
WHERE
    r.deleted = 0
    AND r.create_time > g.min_ct;

-- ------------------------------------------------------------
-- 步骤 2｜复核：确认无残留重复（应为空），再执行步骤 3
-- ------------------------------------------------------------
SELECT title, create_by, COUNT(*) AS cnt
FROM el_repo
GROUP BY
    title,
    create_by
HAVING
    cnt > 1;
-- ------------------------------------------------------------
-- 步骤 3｜DDL：增加唯一索引
-- ------------------------------------------------------------
ALTER TABLE `wk_train_center`.`el_repo`
ADD UNIQUE INDEX uniq_uk_repo_title_create_by (title, create_by) COMMENT '唯一索引：题库标题与创建人';