import express, { type NextFunction, type Request, type Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { router } from 'express-file-routing';

import morgan from './morgan.ts';
import cors from './cors.ts';
import { incrementPendingRequests, decrementPendingRequests } from './health-state.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const routes = await router({
  directory: path.join(__dirname, '../routes'),
});

const app = express();

app.set('trust proxy', true);

app.use((_req, res, next) => {
  incrementPendingRequests();
  res.on('finish', () => decrementPendingRequests());
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors);
app.use(morgan);

app.use('/api', routes);

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  const statusCode = (err as any)?.status ?? 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED',
      message: err.message ?? 'An unexpected error occurred',
    },
  });
});

export default app;
