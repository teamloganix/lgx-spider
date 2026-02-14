import limiter from '../../../utils/limiter.ts';
import { filterOptions } from '../../../modules/emails/controllers/emails.controller.ts';

export const get = [limiter, filterOptions];
