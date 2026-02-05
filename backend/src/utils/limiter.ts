import { rateLimit } from 'express-rate-limit';
import type { Request } from 'express';
import env from './env.ts';

const keygen = (req: Request): string => {
  const userId = (req as any).user?.id as string | undefined;
  if (userId) return `user:${userId}`;
  return req.get('cf-connecting-ip') ?? req.ip ?? 'x';
};

export default rateLimit({
  windowMs: env.LIMITER_WINDOW * 1000,
  limit: env.LIMITER_LIMIT,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Rate limit reached' },
  keyGenerator: keygen,
});
