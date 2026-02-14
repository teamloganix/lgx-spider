import limiter from '../../../utils/limiter.ts';
import { processingPaused } from '../../../modules/metrics/controllers/metrics.controller.ts';

export const get = [limiter, processingPaused];
