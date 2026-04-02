import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../analytics.repository';
import {
  AnalyticsRawMetricRow,
  AnalyticsSnapshotRow,
  BigQueryMetricRow,
  ExperimentConfigRow,
  HypothesisMetricSummary,
  HypothesisSummaryResponse,
  HypothesisWindowStats,
} from '../types';

export interface HypothesisSummaryPayload {
  from?: string;
  to?: string;
  split?: string;
  threshold?: number | string;
  thresholdUsed?: number | string;
}

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

  async getHypothesisSummary(
    payload: HypothesisSummaryPayload = {},
  ): Promise<HypothesisSummaryResponse> {
    const from = this.parseDate(payload.from, 'from');
    const to = this.parseDate(payload.to, 'to');

    if (from.getTime() >= to.getTime()) {
      throw new Error('El parámetro from debe ser menor que to');
    }

    const split = this.resolveSplitDate(payload.split, from, to);
    if (split.getTime() <= from.getTime() || split.getTime() >= to.getTime()) {
      throw new Error('El split debe estar entre from y to');
    }

    const threshold = this.parseThreshold(payload.threshold, payload.thresholdUsed);
    const [preRaw, postRaw] = await Promise.all([
      this.analyticsRepository.getHypothesisWindowStats(from, split),
      this.analyticsRepository.getHypothesisWindowStats(split, to),
    ]);

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      split: split.toISOString(),
      thresholdUsed: threshold,
      metrics: {
        visibility: this.buildMetricSummary(preRaw, postRaw, 'visibility', threshold),
        interaction: this.buildMetricSummary(preRaw, postRaw, 'interaction', threshold),
        users: this.buildMetricSummary(preRaw, postRaw, 'users', threshold),
      },
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

  private parseDate(value: string | undefined, fieldName: string): Date {
    if (!value) {
      throw new Error(`Se requiere el parámetro ${fieldName}`);
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Fecha inválida para ${fieldName}`);
    }

    return date;
  }

  private resolveSplitDate(split: string | undefined, from: Date, to: Date): Date {
    if (!split || split === 'midpoint') {
      return new Date((from.getTime() + to.getTime()) / 2);
    }

    const splitDate = new Date(split);
    if (Number.isNaN(splitDate.getTime())) {
      throw new Error('Split inválido. Usa midpoint o una fecha ISO válida');
    }

    return splitDate;
  }

  private parseThreshold(
    threshold: number | string | undefined,
    thresholdUsed: number | string | undefined,
  ): number {
    const parsed = Number.parseFloat(String(threshold ?? thresholdUsed ?? 15));
    if (Number.isNaN(parsed) || parsed < 0) {
      return 15;
    }

    return parsed;
  }

  private buildMetricSummary(
    preRaw: HypothesisWindowStats,
    postRaw: HypothesisWindowStats,
    key: keyof HypothesisWindowStats,
    threshold: number,
  ): HypothesisMetricSummary {
    const pre = this.parseFloatSafe(preRaw[key]);
    const post = this.parseFloatSafe(postRaw[key]);
    const changePercent = this.computeChangePercent(pre, post);

    return {
      pre,
      post,
      changePercent,
      meetsThreshold: changePercent >= threshold,
    };
  }

  private computeChangePercent(pre: number, post: number): number {
    if (pre === 0) {
      if (post === 0) {
        return 0;
      }

      return 100;
    }

    const percent = ((post - pre) / pre) * 100;
    return Number.parseFloat(percent.toFixed(2));
  }
}
