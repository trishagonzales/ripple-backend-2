import { Express, Request, Response, NextFunction } from 'express';
import { logger } from './logger';

const log = logger.extend('error-handler');

export class HttpError extends Error {
  public name: string = 'HttpError';
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (app: Express) => {
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err.name === 'HttpError' && err.statusCode < 500) return res.status(err.statusCode).send(err.message);

    log(err);
    return res.status(500).send('Unexpected error occurred');
  });
};
