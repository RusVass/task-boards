import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import { boardsRouter } from './modules/boards/boards.routes';
import { errorHandler } from './middlewares/errorHandler';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/boards', boardsRouter);

  app.use(errorHandler);

  return app;
};
