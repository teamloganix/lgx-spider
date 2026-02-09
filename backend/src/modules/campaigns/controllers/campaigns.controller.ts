import type { Request, Response } from 'express';
import { listCampaigns } from '../services/campaigns.service.ts';

/**
 * List campaigns for the authenticated user.
 * GET /api/v1/campaigns
 */
export const list = async (_req: Request, res: Response): Promise<Response> => {
  console.log('[campaigns.list] GET /api/v1/campaigns hit');
  try {
    const items = await listCampaigns();
    console.log('[campaigns.list] listCampaigns returned', items?.length ?? 0, 'items');
    return res.json({ success: true, items });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch campaigns',
        timestamp: new Date().toISOString(),
        path: _req.path,
      },
    });
  }
};
