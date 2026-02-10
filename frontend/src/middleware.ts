import { defineMiddleware } from 'astro:middleware';
import env from '@utils/env';
import { userFromCookieValues } from '../express-middlewares/cookie-user.js';

/** Replicate PHP: read auth from cookies (staff_name, tag_user_id) when not using mock. */
function userFromCookies(cookies: { get: (_name: string) => { value: string } | undefined }) {
  return userFromCookieValues({
    staffName: cookies.get('staff_name')?.value,
    tagUserId: cookies.get('tag_user_id')?.value,
    staffUserLevel: cookies.get('staff_user_level')?.value,
    staffEmail: cookies.get('staff_email')?.value,
  }) as Record<string, unknown> | null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const locals = context.locals as { user?: Record<string, unknown> };

  if (env.APP_ENV === 'dev' && env.MOCK_USER_JSON) {
    try {
      locals.user = JSON.parse(env.MOCK_USER_JSON) as Record<string, unknown> & {
        id?: string;
        name_f?: string;
        name_l?: string;
        email?: string;
      };
    } catch {
      // ignore invalid MOCK_USER_JSON
    }
  }

  if (!locals.user) {
    const user = userFromCookies(context.cookies);
    if (user) locals.user = user;
  }

  return next();
});
