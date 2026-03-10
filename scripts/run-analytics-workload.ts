import 'dotenv/config';
import { Pool } from 'pg';
import { analyticsEnv } from '../src/analytics/analytics-env';
import { AnalyticsRepository } from '../src/analytics/analytics.repository';
import { WorkloadService } from '../src/analytics/services/workload.service';

async function main() {
  if (!analyticsEnv.dbUrl) {
    throw new Error('ANALYTICS_DB_URL no está configurado');
  }

  const iterations = Number.parseInt(
    process.env.WORKLOAD_ITERATIONS ?? '10',
    10,
  );
  const resetStats = process.env.RESET_STATS_BEFORE_RUN === 'true';

  const pool = new Pool({
    connectionString: analyticsEnv.dbUrl,
    ssl: analyticsEnv.dbSsl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const repository = new AnalyticsRepository(pool);
    const workloadService = new WorkloadService(repository);

    if (resetStats) {
      await workloadService.resetStats();
    }

    const result = await workloadService.runSyntheticWorkload(iterations);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await pool.end();
  }
}

void main().catch((error) => {
  console.error('run-analytics-workload falló:', error);
  process.exit(1);
});
