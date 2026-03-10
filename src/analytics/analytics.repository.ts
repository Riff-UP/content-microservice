import { Inject, Injectable } from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { ANALYTICS_PG_POOL } from './analytics.constants';
import {
  AnalyticsHealthRow,
  AnalyticsRawMetricRow,
  AnalyticsSnapshotRow,
  AnalyticsSummaryRow,
  ExperimentConfigRow,
} from './types';

@Injectable()
export class AnalyticsRepository {
  constructor(@Inject(ANALYTICS_PG_POOL) private readonly pool: Pool) {}

  async healthCheck(): Promise<AnalyticsHealthRow> {
    const result = await this.pool.query<AnalyticsHealthRow>(`
      SELECT
        NOW()::text AS now,
        current_database() AS current_database,
        EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'analytics') AS analytics_schema_exists,
        EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') AS pg_stat_statements_enabled
    `);

    return result.rows[0];
  }

  async getRawMetrics(limit = 100): Promise<AnalyticsRawMetricRow[]> {
    const result = await this.pool.query<AnalyticsRawMetricRow>(
      'SELECT * FROM analytics.vw_metrics_export LIMIT $1',
      [limit],
    );

    return result.rows;
  }

  async getSummary(): Promise<AnalyticsSummaryRow> {
    const result = await this.pool.query<AnalyticsSummaryRow>(`
      SELECT
        COUNT(*)::text AS tracked_queries,
        COALESCE(SUM(calls), 0)::text AS total_calls,
        COALESCE(ROUND(AVG(mean_exec_time_ms)::numeric, 4), 0)::text AS avg_mean_exec_time_ms,
        COALESCE(MAX(max_exec_time_ms), 0)::text AS worst_max_exec_time_ms
      FROM analytics.vw_metrics_export
    `);

    return result.rows[0];
  }

  async listSnapshots(limit = 50): Promise<AnalyticsSnapshotRow[]> {
    const result = await this.pool.query<AnalyticsSnapshotRow>(
      `
      SELECT
        id,
        snapshot_date::text,
        snapshot_type,
        sent_to_bigquery,
        sent_at::text,
        metrics_count,
        status,
        error_message,
        created_at::text
      FROM analytics.query_snapshots
      ORDER BY id DESC
      LIMIT $1
      `,
      [limit],
    );

    return result.rows;
  }

  async createSnapshot(
    snapshotType: string,
    metricsCount: number,
  ): Promise<number> {
    const result = await this.pool.query<QueryResultRow & { id: number }>(
      `
      INSERT INTO analytics.query_snapshots (snapshot_date, snapshot_type, metrics_count, status)
      VALUES (CURRENT_DATE, $1, $2, 'captured')
      RETURNING id
      `,
      [snapshotType, metricsCount],
    );

    return result.rows[0].id;
  }

  async markSnapshotSent(
    snapshotId: number,
    metricsCount: number,
  ): Promise<void> {
    await this.pool.query(
      `
      UPDATE analytics.query_snapshots
      SET sent_to_bigquery = true,
          sent_at = CURRENT_TIMESTAMP,
          metrics_count = $2,
          status = 'sent',
          error_message = NULL
      WHERE id = $1
      `,
      [snapshotId, metricsCount],
    );
  }

  async markSnapshotCaptured(
    snapshotId: number,
    metricsCount: number,
  ): Promise<void> {
    await this.pool.query(
      `
      UPDATE analytics.query_snapshots
      SET metrics_count = $2,
          status = 'captured',
          error_message = NULL
      WHERE id = $1
      `,
      [snapshotId, metricsCount],
    );
  }

  async markSnapshotFailed(
    snapshotId: number,
    errorMessage: string,
  ): Promise<void> {
    await this.pool.query(
      `
      UPDATE analytics.query_snapshots
      SET status = 'failed',
          error_message = $2
      WHERE id = $1
      `,
      [snapshotId, errorMessage],
    );
  }

  async getExperimentConfig(): Promise<ExperimentConfigRow[]> {
    const result = await this.pool.query<ExperimentConfigRow>(
      `
      SELECT
        variable_name,
        variable_value,
        description,
        updated_at::text
      FROM analytics.experiment_config
      ORDER BY variable_name ASC
      `,
    );

    return result.rows;
  }

  async upsertExperimentConfig(
    variableName: string,
    variableValue: string,
    description: string,
  ): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO analytics.experiment_config (variable_name, variable_value, description, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (variable_name)
      DO UPDATE SET
        variable_value = EXCLUDED.variable_value,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
      `,
      [variableName, variableValue, description],
    );
  }

  async executeQuery<T extends QueryResultRow = QueryResultRow>(
    query: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(query, params);
  }

  async resetPgStatStatements(): Promise<void> {
    await this.pool.query('SELECT pg_stat_statements_reset()');
  }
}
