import limiter from '../../../utils/limiter.ts';
/* eslint-disable-next-line max-len */
import { toggleProcessingHandler } from '../../../modules/metrics/controllers/metrics.controller.ts';

export const post = [limiter, toggleProcessingHandler];
