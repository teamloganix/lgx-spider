import fakeAuthMiddleware from '../../../middlewares/fake-auth.middleware.ts';
import limiter from '../../../utils/limiter.ts';
import { list } from '../../../modules/campaigns/controllers/campaigns.controller.ts';

export const get = [fakeAuthMiddleware, limiter, list];
