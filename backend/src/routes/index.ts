import { Router } from 'express';
import mongoose from 'mongoose';
import { adminRouter } from './admin.routes';
import { authRouter } from './auth.routes';
import { publicRouter } from './public.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({ data: { status: dbReady ? 'ok' : 'degraded', database: dbReady } });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/', publicRouter);
