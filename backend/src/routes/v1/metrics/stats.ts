import limiter from '../../../utils/limiter.ts';
import { stats } from '../../../modules/metrics/controllers/metrics.controller.ts';

export const get = [limiter, stats];
