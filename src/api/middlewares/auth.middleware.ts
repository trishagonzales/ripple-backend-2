import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from '../../utils/errorHandler';
import { config } from '../../utils/config';
import { UserService } from '../../services/User.service';

export const auth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) throw new HttpError('Access denied.', 401);

    jwt.verify(token, config.JWT_KEY as string, (err: any, decoded: any) => {
      if (err) throw new HttpError('Invalid token.', 400);
      const user = new UserService(decoded.userId);
      req.user = user;
      next();
    });
  } catch (e) {
    next(e);
  }
};
