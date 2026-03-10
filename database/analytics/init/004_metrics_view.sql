CREATE OR REPLACE FUNCTION analytics.normalize_sql(sql_text TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
    SELECT regexp_replace(lower(trim(both ';' from coalesce(sql_text, ''))), '\s+', ' ', 'g');
$$;

CREATE OR REPLACE VIEW analytics.vw_metrics_export AS
SELECT
    COALESCE((SELECT variable_value FROM analytics.experiment_config WHERE variable_name = 'project_id' LIMIT 1), 'content-ms')::TEXT AS project_id_text,
    COALESCE((SELECT variable_value FROM analytics.experiment_config WHERE variable_name = 'project_id_numeric' LIMIT 1), '0')::INT AS project_id_numeric,
    CURRENT_DATE::DATE AS snapshot_date,
    q.query_name,
    q.category,
    pgs.queryid::TEXT AS queryid,
    pgs.dbid::BIGINT AS dbid,
    pgs.userid::BIGINT AS userid,
    pgs.query::TEXT AS query,
    pgs.calls::BIGINT AS calls,
    pgs.total_exec_time::DOUBLE PRECISION AS total_exec_time_ms,
    pgs.mean_exec_time::DOUBLE PRECISION AS mean_exec_time_ms,
    pgs.min_exec_time::DOUBLE PRECISION AS min_exec_time_ms,
    pgs.max_exec_time::DOUBLE PRECISION AS max_exec_time_ms,
    pgs.stddev_exec_time::DOUBLE PRECISION AS stddev_exec_time_ms,
    pgs.rows::BIGINT AS rows_returned,
    pgs.shared_blks_hit::BIGINT AS shared_blks_hit,
    pgs.shared_blks_read::BIGINT AS shared_blks_read,
    pgs.shared_blks_dirtied::BIGINT AS shared_blks_dirtied,
    pgs.shared_blks_written::BIGINT AS shared_blks_written,
    pgs.temp_blks_read::BIGINT AS temp_blks_read,
    pgs.temp_blks_written::BIGINT AS temp_blks_written,
    CURRENT_TIMESTAMP AS ingestion_timestamp
FROM pg_stat_statements pgs
LEFT JOIN analytics.queries q
    ON analytics.normalize_sql(q.query_text) = analytics.normalize_sql(pgs.query)
WHERE pgs.calls > 0
  AND q.id IS NOT NULL
ORDER BY pgs.calls DESC, q.query_name ASC;

