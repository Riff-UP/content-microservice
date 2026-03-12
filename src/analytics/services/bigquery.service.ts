import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
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
      throw new RpcException({
        statusCode: 400,
        code: 'BAD_REQUEST',
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
      throw new RpcException({
        statusCode: 400,
        code: 'BAD_REQUEST',
        message: 'BigQuery rechazó el envío de métricas',
        detail: payload,
      });
    }

    // insertAll siempre retorna HTTP 200 — los errores de fila van en insertErrors
    const insertErrors = payload.insertErrors as unknown[] | undefined;
    if (insertErrors && insertErrors.length > 0) {
      throw new RpcException({
        statusCode: 400,
        code: 'BIGQUERY_INSERT_ERRORS',
        message: `BigQuery rechazó ${insertErrors.length} fila(s). Revisa el schema de la tabla.`,
        detail: insertErrors,
      });
    }

    return {
      insertedRows: metrics.length,
      bigQueryResponse: payload,
    };
  }
}
