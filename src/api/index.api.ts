import { Express } from 'express';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import profileRoutes from './routes/profile.route';
import postRoutes from './routes/post.route';
import uploadRoutes from './routes/upload.route';

export const getApi = (app: Express) => {
  app.use('/api', authRoutes);
  app.use('/api', userRoutes);
  app.use('/api', profileRoutes);
  app.use('/api', postRoutes);
  app.use('/api', uploadRoutes);
};
