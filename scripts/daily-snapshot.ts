import 'dotenv/config';
import { Pool } from 'pg';
import { analyticsEnv } from '../src/analytics/analytics-env';
import { AnalyticsRepository } from '../src/analytics/analytics.repository';
import { TriggerSnapshotDto } from '../src/analytics/dto/trigger-snapshot.dto';
import { BigQueryService } from '../src/analytics/services/bigquery.service';
import { MetricsService } from '../src/analytics/services/metrics.service';
import { OAuthService } from '../src/analytics/services/oauth.service';
import { SnapshotService } from '../src/analytics/services/snapshot.service';
import { WorkloadService } from '../src/analytics/services/workload.service';

async function main() {
  if (!analyticsEnv.dbUrl) {
    throw new Error('ANALYTICS_DB_URL no está configurado');
  }

  const payload: TriggerSnapshotDto = {
    accessToken: process.env.ANALYTICS_ACCESS_TOKEN,
    executeWorkload: process.env.EXECUTE_WORKLOAD === 'true',
    iterations: Number.parseInt(process.env.WORKLOAD_ITERATIONS ?? '10', 10),
    limit: Number.parseInt(process.env.ANALYTICS_SNAPSHOT_LIMIT ?? '200', 10),
    resetStatsBeforeRun: process.env.RESET_STATS_BEFORE_RUN === 'true',
  };

  const pool = new Pool({
    connectionString: analyticsEnv.dbUrl,
    ssl: analyticsEnv.dbSsl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const repository = new AnalyticsRepository(pool);
    const metricsService = new MetricsService(repository);
    const workloadService = new WorkloadService(repository);
    const oauthService = new OAuthService();
    const bigQueryService = new BigQueryService();
    const snapshotService = new SnapshotService(
      repository,
      metricsService,
      workloadService,
      oauthService,
      bigQueryService,
    );

    const result = await snapshotService.generateAndSendSnapshot(payload);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await pool.end();
  }
}

void main().catch((error) => {
  console.error('daily-snapshot falló:', error);
  process.exit(1);
});
