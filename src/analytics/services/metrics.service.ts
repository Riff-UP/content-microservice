import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../analytics.repository';
import {
  AnalyticsRawMetricRow,
  AnalyticsSnapshotRow,
  BigQueryMetricRow,
  ExperimentConfigRow,
} from '../types';

@Injectable()
export class MetricsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  getRawMetrics(limit = 100): Promise<AnalyticsRawMetricRow[]> {
    return this.analyticsRepository.getRawMetrics(limit);
  }

  async getSummary(): Promise<{
    trackedQueries: number;
    totalCalls: number;
    avgMeanExecTimeMs: number;
    worstMaxExecTimeMs: number;
  }> {
    const summary = await this.analyticsRepository.getSummary();

    return {
      trackedQueries: this.parseIntSafe(summary.tracked_queries),
      totalCalls: this.parseIntSafe(summary.total_calls),
      avgMeanExecTimeMs: this.parseFloatSafe(summary.avg_mean_exec_time_ms),
      worstMaxExecTimeMs: this.parseFloatSafe(summary.worst_max_exec_time_ms),
    };
  }

  getExperimentConfig(): Promise<ExperimentConfigRow[]> {
    return this.analyticsRepository.getExperimentConfig();
  }

  async upsertExperimentConfig(
    variableName: string,
    variableValue: string,
    description: string,
  ): Promise<ExperimentConfigRow[]> {
    await this.analyticsRepository.upsertExperimentConfig(
      variableName,
      variableValue,
      description,
    );

    return this.getExperimentConfig();
  }

  listSnapshots(limit = 50): Promise<AnalyticsSnapshotRow[]> {
    return this.analyticsRepository.listSnapshots(limit);
  }

  async getMetricsForBigQuery(limit = 200): Promise<BigQueryMetricRow[]> {
    const rawMetrics = await this.analyticsRepository.getRawMetrics(limit);
    return rawMetrics.map((metric) => this.transformMetric(metric));
  }

  validateMetrics(metrics: BigQueryMetricRow[]): {
    valid: boolean;
    missingFields: string[];
    total: number;
  } {
    const missing: string[] = [];

    for (const metric of metrics) {
      if (!metric.project_id && metric.project_id !== 0) {
        missing.push('project_id');
      }

      if (!metric.snapshot_date) {
        missing.push('snapshot_date');
      }
    }

    return {
      valid: missing.length === 0,
      missingFields: [...new Set(missing)],
      total: metrics.length,
    };
  }

  private transformMetric(metric: AnalyticsRawMetricRow): BigQueryMetricRow {
    return {
      project_id: this.parseIntSafe(metric.project_id_numeric),
      snapshot_date: this.formatDateOnly(metric.snapshot_date),
      query_name: metric.query_name || '',
      category: metric.category || '',
      queryid: metric.queryid || '',
      dbid: this.parseIntSafe(metric.dbid),
      userid: this.parseIntSafe(metric.userid),
      query: metric.query || '',
      calls: this.parseIntSafe(metric.calls),
      total_exec_time_ms: this.parseFloatSafe(metric.total_exec_time_ms),
      mean_exec_time_ms: this.parseFloatSafe(metric.mean_exec_time_ms),
      min_exec_time_ms: this.parseFloatSafe(metric.min_exec_time_ms),
      max_exec_time_ms: this.parseFloatSafe(metric.max_exec_time_ms),
      stddev_exec_time_ms: this.parseFloatSafe(metric.stddev_exec_time_ms),
      rows_returned: this.parseIntSafe(metric.rows_returned),
      shared_blks_hit: this.parseIntSafe(metric.shared_blks_hit),
      shared_blks_read: this.parseIntSafe(metric.shared_blks_read),
      shared_blks_dirtied: this.parseIntSafe(metric.shared_blks_dirtied),
      shared_blks_written: this.parseIntSafe(metric.shared_blks_written),
      temp_blks_read: this.parseIntSafe(metric.temp_blks_read),
      temp_blks_written: this.parseIntSafe(metric.temp_blks_written),
      ingestion_timestamp: this.formatTimestamp(metric.ingestion_timestamp),
    };
  }

  private parseIntSafe(value: string | number | null | undefined): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private parseFloatSafe(value: string | number | null | undefined): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const parsed = Number.parseFloat(String(value));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private formatDateOnly(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    return date.toISOString().slice(0, 10);
  }

  private formatTimestamp(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    const iso = date.toISOString();
    return iso.slice(0, 19).replace('T', ' ');
  }
}
