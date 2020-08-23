import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncWrap = (routeHandler: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await routeHandler(req, res, next);
    } catch (e) {
      next(e);
    }
  };
};
