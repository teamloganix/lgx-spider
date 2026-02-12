import limiter from '../../../utils/limiter.ts';
import fakeAuthMiddleware from '../../../middlewares/fake-auth.middleware.ts';
import { idParam, updateBody } from '../../../modules/campaigns/validators/campaigns.validator.ts';
import {
  getById,
  update,
  remove,
} from '../../../modules/campaigns/controllers/campaigns.controller.ts';

export const get = [fakeAuthMiddleware, ...idParam, limiter, getById];
export const put = [fakeAuthMiddleware, ...idParam, ...updateBody, limiter, update];
export const del = [fakeAuthMiddleware, ...idParam, limiter, remove];
