import * as joi from 'joi';
import 'dotenv/config';

interface EnvVars {
  PORT: number;
  MONGO_URI: string;
  RABBIT_URL: string;
  R2_ENDPOINT: string;
  R2_ACCESS_KEY: string;
  R2_SECRET_KEY: string;
  R2_BUCKET: string;
  R2_PUBLIC_URL: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    MONGO_URI: joi.string().required(),
    RABBIT_URL: joi.string().required(),
    R2_ENDPOINT: joi.string().required(),
    R2_ACCESS_KEY: joi.string().required(),
    R2_SECRET_KEY: joi.string().required(),
    R2_BUCKET: joi.string().required(),
    R2_PUBLIC_URL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  host: process.env.CONTENT_MS_HOST || '0.0.0.0',
  mongoUri: envVars.MONGO_URI,
  rabbitUrl: envVars.RABBIT_URL,
  r2: {
    endpoint: envVars.R2_ENDPOINT,
    accessKey: envVars.R2_ACCESS_KEY,
    secretKey: envVars.R2_SECRET_KEY,
    bucket: envVars.R2_BUCKET,
    publicUrl: envVars.R2_PUBLIC_URL,
  },
};
