import limiter from '../../../utils/limiter.ts';
import { listValidators } from '../../../modules/metrics/validators/metrics.validator.ts';
import { list } from '../../../modules/metrics/controllers/metrics.controller.ts';

export const get = [limiter, ...listValidators, list];
