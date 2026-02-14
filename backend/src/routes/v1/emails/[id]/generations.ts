import limiter from '../../../../utils/limiter.ts';
import fakeAuthMiddleware from '../../../../middlewares/fake-auth.middleware.ts';
import {
  idParam,
  saveGenerationBody,
} from '../../../../modules/emails/validators/emails.validator.ts';
import { saveGeneration } from '../../../../modules/emails/controllers/emails.controller.ts';

export const put = [fakeAuthMiddleware, ...idParam, ...saveGenerationBody, limiter, saveGeneration];
