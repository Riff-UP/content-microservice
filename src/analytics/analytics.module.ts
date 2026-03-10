import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { envs } from '../config';
import { ANALYTICS_PG_POOL } from './analytics.constants';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsBootstrapService } from './services/analytics-bootstrap.service';
import { AnalyticsPoolLifecycleService } from './services/analytics-pool-lifecycle.service';
import { BigQueryService } from './services/bigquery.service';
import { MetricsService } from './services/metrics.service';
import { OAuthService } from './services/oauth.service';
import { SnapshotService } from './services/snapshot.service';
import { WorkloadService } from './services/workload.service';

@Module({
  controllers: [AnalyticsController],
  providers: [
    {
      provide: ANALYTICS_PG_POOL,
      useFactory: () =>
        new Pool({
          connectionString: envs.analytics.dbUrl,
          ssl: envs.analytics.dbSsl ? { rejectUnauthorized: false } : undefined,
        }),
    },
    AnalyticsRepository,
    AnalyticsBootstrapService,
    AnalyticsPoolLifecycleService,
    MetricsService,
    WorkloadService,
    OAuthService,
    BigQueryService,
    SnapshotService,
  ],
})
export class AnalyticsModule {}
