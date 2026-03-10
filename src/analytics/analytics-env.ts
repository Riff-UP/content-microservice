import 'dotenv/config';

export interface AnalyticsRuntimeConfig {
  enabled: boolean;
  dbUrl: string;
  dbSsl: boolean;
  projectId: string;
  projectIdNumeric: number;
  projectType: string;
  dbEngine: string;
  dbVersion: string;
  indexStrategy: string;
  registeredEmail: string;
  registeredDate: string;
  autoReset: boolean;
  callbackUrl: string;
  accessToken: string;
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
  bigQueryProjectId: string;
  bigQueryDataset: string;
  bigQueryTable: string;
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

const dbUrl = (process.env.ANALYTICS_DB_URL ?? '').trim();

export const analyticsEnv: AnalyticsRuntimeConfig = {
  enabled: dbUrl.length > 0,
  dbUrl,
  dbSsl: parseBoolean(process.env.ANALYTICS_DB_SSL, false),
  projectId: process.env.ANALYTICS_PROJECT_ID || 'content-ms',
  projectIdNumeric: parseNumber(process.env.ANALYTICS_PROJECT_ID_NUMERIC, 0),
  projectType: process.env.ANALYTICS_PROJECT_TYPE || 'SOCIAL_NETWORK',
  dbEngine: process.env.ANALYTICS_DB_ENGINE || 'POSTGRESQL',
  dbVersion: process.env.ANALYTICS_DB_VERSION || '16',
  indexStrategy: process.env.ANALYTICS_INDEX_STRATEGY || 'BASELINE_INDEX',
  registeredEmail: process.env.ANALYTICS_REGISTERED_EMAIL || '',
  registeredDate: process.env.ANALYTICS_REGISTERED_DATE || '',
  autoReset: parseBoolean(process.env.ANALYTICS_AUTO_RESET, false),
  callbackUrl:
    process.env.ANALYTICS_CALLBACK_URL ||
    'http://localhost:3004/analytics/auth/google/callback',
  accessToken: process.env.ANALYTICS_ACCESS_TOKEN || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
  bigQueryProjectId: process.env.BIGQUERY_PROJECT_ID || 'data-from-software',
  bigQueryDataset: process.env.BIGQUERY_DATASET || 'benchmarking_warehouse',
  bigQueryTable: process.env.BIGQUERY_TABLE || 'daily_query_metrics',
};
