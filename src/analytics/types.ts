export interface AnalyticsQueryDefinition {
  queryName: string;
  category: string;
  description: string;
  sql: string;
}

export interface AnalyticsHealthRow {
  now: string;
  current_database: string;
  analytics_schema_exists: boolean;
  pg_stat_statements_enabled: boolean;
}

export interface AnalyticsSummaryRow {
  tracked_queries: string;
  total_calls: string;
  avg_mean_exec_time_ms: string;
  worst_max_exec_time_ms: string;
}

export interface AnalyticsRawMetricRow {
  project_id_text: string;
  project_id_numeric: number | string;
  snapshot_date: Date | string;
  query_name: string | null;
  category: string | null;
  queryid: string | null;
  dbid: number | string | null;
  userid: number | string | null;
  query: string | null;
  calls: number | string | null;
  total_exec_time_ms: number | string | null;
  mean_exec_time_ms: number | string | null;
  min_exec_time_ms: number | string | null;
  max_exec_time_ms: number | string | null;
  stddev_exec_time_ms: number | string | null;
  rows_returned: number | string | null;
  shared_blks_hit: number | string | null;
  shared_blks_read: number | string | null;
  shared_blks_dirtied: number | string | null;
  shared_blks_written: number | string | null;
  temp_blks_read: number | string | null;
  temp_blks_written: number | string | null;
  ingestion_timestamp: Date | string;
}

export interface BigQueryMetricRow {
  project_id: number;
  snapshot_date: string;
  query_name: string;
  category: string;
  queryid: string;
  dbid: number;
  userid: number;
  query: string;
  calls: number;
  total_exec_time_ms: number;
  mean_exec_time_ms: number;
  min_exec_time_ms: number;
  max_exec_time_ms: number;
  stddev_exec_time_ms: number;
  rows_returned: number;
  shared_blks_hit: number;
  shared_blks_read: number;
  shared_blks_dirtied: number;
  shared_blks_written: number;
  temp_blks_read: number;
  temp_blks_written: number;
  ingestion_timestamp: string;
}

export interface AnalyticsSnapshotRow {
  id: number;
  snapshot_date: string;
  snapshot_type: string;
  sent_to_bigquery: boolean;
  sent_at: string | null;
  metrics_count: number;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface ExperimentConfigRow {
  variable_name: string;
  variable_value: string;
  description: string | null;
  updated_at: string;
}

export interface SnapshotExecutionResult {
  snapshotId: number;
  metricsCount: number;
  sentToBigQuery: boolean;
  workloadExecuted: boolean;
  workloadIterations: number;
  tokenValidated: boolean;
}
