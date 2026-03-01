import * as joi from 'joi';
import 'dotenv/config';

interface EnvVars {
  PORT: number;
  TCP_PORT: number;
  CONTENT_MS_HOST: string;
  MONGO_URI: string;
  RABBIT_URL: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    TCP_PORT: joi.number().required(),
    CONTENT_MS_HOST: joi.string().required(),
    MONGO_URI: joi.string().required(),
    RABBIT_URL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  tcpPort: envVars.TCP_PORT,
  host: process.env.CONTENT_MS_HOST || '0.0.0.0',
  mongoUri: envVars.MONGO_URI,
  rabbitUrl: envVars.RABBIT_URL,
};
