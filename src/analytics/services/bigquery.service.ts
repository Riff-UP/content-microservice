import { BadRequestException, Injectable } from '@nestjs/common';
import { envs } from '../../config';
import { BigQueryMetricRow } from '../types';

@Injectable()
export class BigQueryService {
  async validateToken(token: string) {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(token)}`,
    );

    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      throw new BadRequestException({
        message: 'Token inválido o expirado para BigQuery',
        detail: payload,
      });
    }

    return payload;
  }

  async insertMetrics(metrics: BigQueryMetricRow[], token: string) {
    if (!metrics.length) {
      return { insertedRows: 0 };
    }

    const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${envs.analytics.bigQueryProjectId}/datasets/${envs.analytics.bigQueryDataset}/tables/${envs.analytics.bigQueryTable}/insertAll`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rows: metrics.map((metric, index) => ({
          insertId: `${metric.queryid}-${metric.snapshot_date}-${index}`,
          json: metric,
        })),
      }),
    });

    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      throw new BadRequestException({
        message: 'BigQuery rechazó el envío de métricas',
        detail: payload,
      });
    }

    return {
      insertedRows: metrics.length,
      bigQueryResponse: payload,
    };
  }
}
