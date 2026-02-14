import limiter from '../../../utils/limiter.ts';
import { toggleProcessingHandler } from '../../../modules/metrics/controllers/metrics.controller.ts';

export const post = [limiter, toggleProcessingHandler];
