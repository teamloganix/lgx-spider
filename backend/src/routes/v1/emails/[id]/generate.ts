import limiter from '../../../../utils/limiter.ts';
import fakeAuthMiddleware from '../../../../middlewares/fake-auth.middleware.ts';
import { idParam, generateBody } from '../../../../modules/emails/validators/emails.validator.ts';
import { generate } from '../../../../modules/emails/controllers/emails.controller.ts';

export const post = [fakeAuthMiddleware, ...idParam, ...generateBody, limiter, generate];
