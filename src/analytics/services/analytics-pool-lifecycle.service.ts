import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Pool } from 'pg';
import { ANALYTICS_PG_POOL } from '../analytics.constants';

@Injectable()
export class AnalyticsPoolLifecycleService implements OnApplicationShutdown {
  constructor(@Inject(ANALYTICS_PG_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
