import type { Request, Response } from 'express';
import { getPendingRequests, isHealthy } from '../utils/health-state.ts';

const handler = async (_req: Request, res: Response): Promise<void> => {
  res.setHeader('X-Pending-Requests', String(getPendingRequests()));
  if (isHealthy()) {
    res.status(200).send('ok');
  } else {
    res.status(503).send('shutting down');
  }
};

export const get = [handler];
