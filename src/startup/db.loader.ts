import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import { config } from '../utils/config';

const log = logger.extend('db-loader');

export const dbLoader = async () => {
  try {
    await mongoose.connect(config.DATABASE_URL as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    log('Connected to database ...');
  } catch (e) {
    log('Failed to connect to database');
    throw e;
  }
};
