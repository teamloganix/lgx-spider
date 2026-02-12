import type { Response, NextFunction } from 'express';
import env from '../utils/env.ts';

/**
 * Fake auth middleware for development.
 * Sets req.user with a fixed fake user when DEV_FAKE_USER_ID is set.
 * In production, replace with real JWT auth.
 */
export default (req: import('express').Request, _res: Response, next: NextFunction): void => {
  const fakeId = env.DEV_FAKE_USER_ID ?? 'fake-user-1';
  req.user = { id: fakeId };
  next();
};
