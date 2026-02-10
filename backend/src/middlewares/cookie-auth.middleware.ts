import type { Request as Req, Response, NextFunction } from 'express';
import env from '../utils/env.ts';

/* eslint-disable no-unused-vars */
declare module 'express-serve-static-core' {
  interface Request {
    user?:
      | {
          id?: string;
          name_f?: string;
          name_l?: string;
          email?: string;
          [key: string]: unknown;
        }
      | undefined;
  }
}
/* eslint-enable no-unused-vars */

/**
 * Replicates PHP auth: read shared .loganix.com cookies (staff_name, tag_user_id, etc.)
 * and set req.user. When no cookies, fall back to fake user in dev if DEV_FAKE_USER_ID is set.
 */
type AuthCookies = {
  staff_name?: string;
  tag_user_id?: string;
  staff_user_level?: string;
  staff_email?: string;
};

export default function cookieAuthMiddleware(req: Req, _res: Response, next: NextFunction): void {
  req.user = undefined;

  const cookies = req.cookies as AuthCookies | undefined;
  const staffName = cookies?.staff_name;
  const tagUserId = cookies?.tag_user_id;
  const staffUserLevel = cookies?.staff_user_level;

  if (staffName != null && String(staffName).trim() !== '') {
    const nameStr = decodeURIComponent(String(staffName).trim());
    const parts = nameStr.split(/\s+/);
    const nameF = parts[0] ?? '';
    const nameL = parts.slice(1).join(' ') ?? '';

    req.user = {
      ...(tagUserId != null && tagUserId !== '' && { id: tagUserId }),
      name_f: nameF,
      name_l: nameL,
      ...(cookies?.staff_email != null && { email: cookies.staff_email }),
      ...(staffUserLevel != null && staffUserLevel !== '' && { staff_user_level: staffUserLevel }),
    };
    next();
    return;
  }

  const fakeId = env.DEV_FAKE_USER_ID;
  if (fakeId != null && String(fakeId).trim() !== '') {
    req.user = { id: String(fakeId).trim() };
  }

  next();
}
