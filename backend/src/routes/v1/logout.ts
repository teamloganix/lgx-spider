import type { Request, Response } from 'express';

/**
 * POST /api/v1/logout
 * Confirms logout on the backend. The frontend should call this route, then clear
 * cookies (staff_name, tag_user_id, etc.) and redirect to sso.lgnx.ca.
 */
export const post = (req: Request, res: Response): void => {
  res.status(200).json({ ok: true });
};
