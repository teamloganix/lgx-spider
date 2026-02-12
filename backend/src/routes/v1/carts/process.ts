import limiter from '../../../utils/limiter.ts';
import fakeAuthMiddleware from '../../../middlewares/fake-auth.middleware.ts';
import { processCartsHandler } from '../../../modules/carts/controllers/carts.controller.ts';

export const post = [fakeAuthMiddleware, limiter, processCartsHandler];
