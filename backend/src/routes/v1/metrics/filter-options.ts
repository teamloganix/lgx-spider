import limiter from '../../../utils/limiter.ts';
import { filterOptions } from '../../../modules/metrics/controllers/metrics.controller.ts';

export const get = [limiter, filterOptions];
