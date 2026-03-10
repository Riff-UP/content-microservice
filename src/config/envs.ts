import * as joi from 'joi';
import 'dotenv/config';

interface EnvVars {
  PORT: number;
  TCP_PORT: number;
  CONTENT_MS_HOST: string;
  MONGO_URI: string;
  RABBIT_URL: string;
  R2_ENDPOINT: string;
  R2_ACCESS_KEY: string;
  R2_SECRET_KEY: string;
  R2_BUCKET: string;
  R2_PUBLIC_URL: string;
  ANALYTICS_DB_URL?: string;
  ANALYTICS_DB_SSL?: boolean;
  ANALYTICS_PROJECT_ID?: string;
  ANALYTICS_PROJECT_ID_NUMERIC?: number;
  ANALYTICS_PROJECT_TYPE?: string;
  ANALYTICS_DB_ENGINE?: string;
  ANALYTICS_DB_VERSION?: string;
  ANALYTICS_INDEX_STRATEGY?: string;
  ANALYTICS_REGISTERED_EMAIL?: string;
  ANALYTICS_REGISTERED_DATE?: string;
  ANALYTICS_AUTO_RESET?: boolean;
  ANALYTICS_CALLBACK_URL?: string;
  ANALYTICS_ACCESS_TOKEN?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
  BIGQUERY_PROJECT_ID?: string;
  BIGQUERY_DATASET?: string;
  BIGQUERY_TABLE?: string;
}

interface AnalyticsEnvConfig {
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

interface AppEnvConfig {
  port: number;
  tcpPort: number;
  host: string;
  mongoUri: string;
  rabbitUrl: string;
  r2: {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
    publicUrl: string;
  };
  analytics: AnalyticsEnvConfig;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    TCP_PORT: joi.number().required(),
    CONTENT_MS_HOST: joi.string().required(),
    MONGO_URI: joi.string().required(),
    RABBIT_URL: joi.string().required(),
    R2_ENDPOINT: joi.string().required(),
    R2_ACCESS_KEY: joi.string().required(),
    R2_SECRET_KEY: joi.string().required(),
    R2_BUCKET: joi.string().required(),
    R2_PUBLIC_URL: joi.string().required(),
    ANALYTICS_DB_URL: joi.string().allow('').optional(),
    ANALYTICS_DB_SSL: joi
      .boolean()
      .truthy('true')
      .falsy('false')
      .default(false),
    ANALYTICS_PROJECT_ID: joi.string().default('content-ms'),
    ANALYTICS_PROJECT_ID_NUMERIC: joi.number().default(0),
    ANALYTICS_PROJECT_TYPE: joi.string().default('SOCIAL_NETWORK'),
    ANALYTICS_DB_ENGINE: joi.string().default('POSTGRESQL'),
    ANALYTICS_DB_VERSION: joi.string().default('16'),
    ANALYTICS_INDEX_STRATEGY: joi.string().default('BASELINE_INDEX'),
    ANALYTICS_REGISTERED_EMAIL: joi.string().allow('').optional(),
    ANALYTICS_REGISTERED_DATE: joi.string().allow('').optional(),
    ANALYTICS_AUTO_RESET: joi
      .boolean()
      .truthy('true')
      .falsy('false')
      .default(false),
    ANALYTICS_CALLBACK_URL: joi.string().uri().allow('').optional(),
    ANALYTICS_ACCESS_TOKEN: joi.string().allow('').optional(),
    GOOGLE_CLIENT_ID: joi.string().allow('').optional(),
    GOOGLE_CLIENT_SECRET: joi.string().allow('').optional(),
    GOOGLE_REFRESH_TOKEN: joi.string().allow('').optional(),
    BIGQUERY_PROJECT_ID: joi.string().default('data-from-software'),
    BIGQUERY_DATASET: joi.string().default('benchmarking_warehouse'),
    BIGQUERY_TABLE: joi.string().default('daily_query_metrics'),
  })
  .unknown(true);

const validationResult = envSchema.validate(process.env);
const error = validationResult.error;

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars = validationResult.value as EnvVars;
const analyticsDbUrl = envVars.ANALYTICS_DB_URL?.trim() ?? '';

export const envs: AppEnvConfig = {
  port: envVars.PORT,
  tcpPort: envVars.TCP_PORT,
  host: envVars.CONTENT_MS_HOST || '0.0.0.0',
  mongoUri: envVars.MONGO_URI,
  rabbitUrl: envVars.RABBIT_URL,
  r2: {
    endpoint: envVars.R2_ENDPOINT,
    accessKey: envVars.R2_ACCESS_KEY,
    secretKey: envVars.R2_SECRET_KEY,
    bucket: envVars.R2_BUCKET,
    publicUrl: envVars.R2_PUBLIC_URL,
  },
  analytics: {
    enabled: analyticsDbUrl.length > 0,
    dbUrl: analyticsDbUrl,
    dbSsl: Boolean(envVars.ANALYTICS_DB_SSL),
    projectId: envVars.ANALYTICS_PROJECT_ID || 'content-ms',
    projectIdNumeric: Number(envVars.ANALYTICS_PROJECT_ID_NUMERIC ?? 0),
    projectType: envVars.ANALYTICS_PROJECT_TYPE || 'SOCIAL_NETWORK',
    dbEngine: envVars.ANALYTICS_DB_ENGINE || 'POSTGRESQL',
    dbVersion: envVars.ANALYTICS_DB_VERSION || '16',
    indexStrategy: envVars.ANALYTICS_INDEX_STRATEGY || 'BASELINE_INDEX',
    registeredEmail: envVars.ANALYTICS_REGISTERED_EMAIL || '',
    registeredDate: envVars.ANALYTICS_REGISTERED_DATE || '',
    autoReset: Boolean(envVars.ANALYTICS_AUTO_RESET),
    callbackUrl:
      envVars.ANALYTICS_CALLBACK_URL ||
      'http://localhost:3004/analytics/auth/google/callback',
    accessToken: envVars.ANALYTICS_ACCESS_TOKEN || '',
    googleClientId: envVars.GOOGLE_CLIENT_ID || '',
    googleClientSecret: envVars.GOOGLE_CLIENT_SECRET || '',
    googleRefreshToken: envVars.GOOGLE_REFRESH_TOKEN || '',
    bigQueryProjectId: envVars.BIGQUERY_PROJECT_ID || 'data-from-software',
    bigQueryDataset: envVars.BIGQUERY_DATASET || 'benchmarking_warehouse',
    bigQueryTable: envVars.BIGQUERY_TABLE || 'daily_query_metrics',
  },
};
