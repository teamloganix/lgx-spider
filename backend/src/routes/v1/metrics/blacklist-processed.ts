import limiter from '../../../utils/limiter.ts';
import { blacklistProcessedBody } from '../../../modules/metrics/validators/metrics.validator.ts';
import { blacklistProcessed } from '../../../modules/metrics/controllers/metrics.controller.ts';

export const post = [limiter, ...blacklistProcessedBody, blacklistProcessed];
