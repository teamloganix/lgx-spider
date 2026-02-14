import limiter from '../../../utils/limiter.ts';
import { listValidators } from '../../../modules/emails/validators/emails.validator.ts';
import { list } from '../../../modules/emails/controllers/emails.controller.ts';

export const get = [limiter, ...listValidators, list];
