import { Injectable } from '@nestjs/common';
import { analyticsEnv } from '../analytics-env';
import { AnalyticsRepository } from '../analytics.repository';
import { TriggerSnapshotDto } from '../dto/trigger-snapshot.dto';
import { SnapshotExecutionResult } from '../types';
import { BigQueryService } from './bigquery.service';
import { MetricsService } from './metrics.service';
import { OAuthService } from './oauth.service';
import { WorkloadService } from './workload.service';

@Injectable()
export class SnapshotService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly metricsService: MetricsService,
    private readonly workloadService: WorkloadService,
    private readonly oauthService: OAuthService,
    private readonly bigQueryService: BigQueryService,
  ) {}

  async generateAndSendSnapshot(
    payload: TriggerSnapshotDto = {},
  ): Promise<SnapshotExecutionResult> {
    let snapshotId = 0;
    const analytics = analyticsEnv;
    const workloadIterations = payload.iterations ?? 10;
    const metricsLimit = payload.limit ?? 200;
    const executeWorkload = payload.executeWorkload ?? false;
    const shouldResetStats = payload.resetStatsBeforeRun ?? analytics.autoReset;

    try {
      if (shouldResetStats) {
        await this.analyticsRepository.resetPgStatStatements();
      }

      if (executeWorkload) {
        await this.workloadService.runSyntheticWorkload(workloadIterations);
      }

      const metrics =
        await this.metricsService.getMetricsForBigQuery(metricsLimit);
      const validation = this.metricsService.validateMetrics(metrics);

      if (!validation.valid) {
        throw new Error(
          `Métricas inválidas: ${validation.missingFields.join(', ')}`,
        );
      }

      snapshotId = await this.analyticsRepository.createSnapshot(
        executeWorkload ? 'workload' : 'manual',
        metrics.length,
      );

      const accessToken = await this.oauthService.resolveAccessToken(
        payload.accessToken,
      );

      if (!accessToken) {
        await this.analyticsRepository.markSnapshotCaptured(
          snapshotId,
          metrics.length,
        );

        return {
          snapshotId,
          metricsCount: metrics.length,
          sentToBigQuery: false,
          workloadExecuted: executeWorkload,
          workloadIterations: executeWorkload ? workloadIterations : 0,
          tokenValidated: false,
        };
      }

      await this.bigQueryService.validateToken(accessToken);
      await this.bigQueryService.insertMetrics(metrics, accessToken);
      await this.analyticsRepository.markSnapshotSent(
        snapshotId,
        metrics.length,
      );

      return {
        snapshotId,
        metricsCount: metrics.length,
        sentToBigQuery: true,
        workloadExecuted: executeWorkload,
        workloadIterations: executeWorkload ? workloadIterations : 0,
        tokenValidated: true,
      };
    } catch (error) {
      if (snapshotId > 0) {
        await this.analyticsRepository.markSnapshotFailed(
          snapshotId,
          error instanceof Error ? error.message : String(error),
        );
      }

      throw error;
    }
  }
}
