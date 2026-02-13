import limiter from '../../../utils/limiter.ts';
import fakeAuthMiddleware from '../../../middlewares/fake-auth.middleware.ts';
import { createBody } from '../../../modules/campaigns/validators/campaigns.validator.ts';
import { list, create } from '../../../modules/campaigns/controllers/campaigns.controller.ts';

export const get = [limiter, list];
export const post = [fakeAuthMiddleware, ...createBody, limiter, create];
