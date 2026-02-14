import limiter from '../../../utils/limiter.ts';
import fakeAuthMiddleware from '../../../middlewares/fake-auth.middleware.ts';
import { idParam } from '../../../modules/emails/validators/emails.validator.ts';
import { getById } from '../../../modules/emails/controllers/emails.controller.ts';

export const get = [fakeAuthMiddleware, ...idParam, limiter, getById];
