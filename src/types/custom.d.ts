import { UserService } from '../services/User.service';

declare global {
  namespace Express {
    export interface Request {
      user: UserService;
    }
  }
}
