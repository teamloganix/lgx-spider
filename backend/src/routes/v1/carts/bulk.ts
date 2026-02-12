import limiter from '../../../utils/limiter.ts';
import fakeAuthMiddleware from '../../../middlewares/fake-auth.middleware.ts';
import { deleteBulkCartsHandler } from '../../../modules/carts/controllers/carts.controller.ts';
import { bulkDeleteValidators } from '../../../modules/carts/validators/cart.validator.ts';

export const del = [fakeAuthMiddleware, ...bulkDeleteValidators, limiter, deleteBulkCartsHandler];
