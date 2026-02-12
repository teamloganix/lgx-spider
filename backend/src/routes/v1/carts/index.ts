import limiter from '../../../utils/limiter.ts';
import fakeAuthMiddleware from '../../../middlewares/fake-auth.middleware.ts';
import { getCartsHandler } from '../../../modules/carts/controllers/carts.controller.ts';
import { getValidators } from '../../../modules/carts/validators/cart.validator.ts';

export const get = [fakeAuthMiddleware, ...getValidators, limiter, getCartsHandler];
