import { logger } from './logger';

const log = logger.extend('config');

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  FRONTEND_URL: process.env.FRONTEND_URL,
  BACKEND_URL: process.env.BACKEND_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_KEY: process.env.JWT_KEY,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  // SENDGRID_USER: process.env.SENDGRID_USER,
  // SENDGRID_PASS: process.env.SENDGRID_PASS,
};

try {
  let prop: keyof typeof config;
  for (prop in config) {
    if (!config[prop]) throw new Error(`${prop} not set`);
  }
} catch (e) {
  log('Config incomplete. Set the missing configurations in environment variables.');
  throw e;
}
