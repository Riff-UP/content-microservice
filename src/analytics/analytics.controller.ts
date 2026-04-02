import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcExceptionHelper } from '../common';
// AnalyticsController es una superficie interna RPC/TCP.
// El frontend nunca debe llamar a content-ms directamente; el acceso público
// debe entrar por client/front-gateway y traducirse a estos message patterns.
import { AnalyticsRepository } from './analytics.repository';
import { TriggerSnapshotDto } from './dto/trigger-snapshot.dto';
import { TriggerWorkloadDto } from './dto/trigger-workload.dto';
import { UpsertExperimentConfigDto } from './dto/upsert-experiment-config.dto';
import { HypothesisSummaryPayload } from './services/metrics.service';
import { MetricsService } from './services/metrics.service';
import { OAuthService } from './services/oauth.service';
import { SnapshotService } from './services/snapshot.service';
import { WorkloadService } from './services/workload.service';

interface AnalyticsLimitPayload {
  limit?: number | string;
}

interface AnalyticsGoogleAuthPayload {
  state?: string;
}

interface AnalyticsGoogleCodePayload {
  code?: string;
}

@Controller()
export class AnalyticsController {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly metricsService: MetricsService,
    private readonly workloadService: WorkloadService,
    private readonly snapshotService: SnapshotService,
    private readonly oauthService: OAuthService,
  ) {}

  @MessagePattern('getAnalyticsHealth')
  @MessagePattern('content.analytics.health')
  health() {
    return this.analyticsRepository.healthCheck();
  }

  @MessagePattern('getAnalyticsSummary')
  @MessagePattern('content.analytics.summary')
  summary() {
    return this.metricsService.getSummary();
  }

  @MessagePattern('getAnalyticsHypothesisSummary')
  @MessagePattern('content.analytics.hypothesis.summary')
  hypothesisSummary(@Payload() payload: HypothesisSummaryPayload = {}) {
    return this.metricsService.getHypothesisSummary(payload);
  }

  @MessagePattern('findAnalyticsMetrics')
  @MessagePattern('content.analytics.metrics')
  metrics(@Payload() payload?: AnalyticsLimitPayload) {
    return this.metricsService.getRawMetrics(
      this.parseLimit(payload?.limit, 100),
    );
  }

  @MessagePattern('findAnalyticsSnapshots')
  @MessagePattern('content.analytics.snapshots')
  snapshots(@Payload() payload?: AnalyticsLimitPayload) {
    return this.metricsService.listSnapshots(
      this.parseLimit(payload?.limit, 50),
    );
  }

  @MessagePattern('getAnalyticsConfig')
  @MessagePattern('content.analytics.config')
  config() {
    return this.metricsService.getExperimentConfig();
  }

  @MessagePattern('upsertAnalyticsConfig')
  @MessagePattern('content.analytics.config.upsert')
  upsertConfig(@Payload() dto: UpsertExperimentConfigDto) {
    return this.metricsService.upsertExperimentConfig(
      dto.variableName,
      dto.variableValue,
      dto.description ?? '',
    );
  }

  @MessagePattern('runAnalyticsWorkload')
  @MessagePattern('content.analytics.workload.run')
  async runWorkload(@Payload() dto: TriggerWorkloadDto = {}) {
    if (dto.resetStats) {
      await this.workloadService.resetStats();
    }

    return this.workloadService.runSyntheticWorkload(dto.iterations ?? 10);
  }

  @MessagePattern('triggerAnalyticsSnapshot')
  @MessagePattern('content.analytics.snapshot')
  snapshot(@Payload() dto: TriggerSnapshotDto = {}) {
    return this.snapshotService.generateAndSendSnapshot(dto);
  }

  @MessagePattern('exportAnalyticsSnapshot')
  @MessagePattern('content.analytics.export')
  export(@Payload() dto: TriggerSnapshotDto = {}) {
    return this.snapshotService.generateAndSendSnapshot(dto);
  }

  @MessagePattern('getAnalyticsGoogleAuthUrl')
  @MessagePattern('content.analytics.auth.google')
  authGoogle(@Payload() payload?: AnalyticsGoogleAuthPayload) {
    return {
      url: this.oauthService.getAuthorizationUrl(payload?.state),
    };
  }

  @MessagePattern('exchangeAnalyticsGoogleCode')
  @MessagePattern('content.analytics.auth.google.callback')
  authGoogleCallback(@Payload() payload: AnalyticsGoogleCodePayload) {
    if (!payload?.code) {
      RpcExceptionHelper.badRequest('Se requiere el campo code');
    }

    return this.oauthService.exchangeCodeForTokens(payload.code);
  }

  private parseLimit(
    value: number | string | undefined,
    fallback: number,
  ): number {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
  }
}
