import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import bodyParser from 'body-parser';
import { logger } from '../utils/logger';
import morgan from 'morgan';

const log = logger.extend('express-loader');

export const expressLoader = () => {
  try {
    const app = express();
    app.use(helmet());
    app.use(cors({ exposedHeaders: 'x-auth-token' }));
    app.use(compression());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(morgan('tiny'));

    log('Express initialized ...');

    return app;
  } catch (e) {
    log('Failed to configure express');
    throw e;
  }
};
