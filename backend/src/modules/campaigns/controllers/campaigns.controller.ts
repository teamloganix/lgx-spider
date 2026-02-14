import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  listCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  type CreateCampaignInput,
} from '../services/campaigns.service.ts';

/**
 * Create a new campaign.
 * POST /api/v1/campaigns
 */
export const create = async (req: Request, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        fields: errors.array(),
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }

  try {
    const body = req.body as {
      name: string;
      original_keywords: string;
      is_active?: boolean;
      blacklist_campaign_enabled?: boolean;
      blacklist_global_enabled?: boolean;
    };

    const input: CreateCampaignInput = {
      name: body.name,
      original_keywords: body.original_keywords,
    };
    if (body.is_active !== undefined) input.is_active = body.is_active;
    if (body.blacklist_campaign_enabled !== undefined) {
      input.blacklist_campaign_enabled = body.blacklist_campaign_enabled;
    }
    if (body.blacklist_global_enabled !== undefined) {
      input.blacklist_global_enabled = body.blacklist_global_enabled;
    }

    const campaign = await createCampaign(input);

    return res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    console.error('Error in create:', error);
    let message = error instanceof Error ? error.message : 'Failed to create campaign';
    if (message.includes('OPENROUTER_API_KEY') || message.includes('OPENROUTER_ENDPOINT')) {
      message = 'Failed to create campaign';
    }
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};

/**
 * List campaigns for the authenticated user.
 * GET /api/v1/campaigns
 */
export const list = async (req: Request, res: Response): Promise<Response> => {
  console.log('[campaigns.list] GET /api/v1/campaigns hit');
  try {
    const items = await listCampaigns();
    console.log('[campaigns.list] listCampaigns returned', items?.length ?? 0, 'items');
    return res.json({ success: true, data: { items } });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch campaigns',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};

/**
 * Get campaign by ID with additional counts.
 * GET /api/v1/campaigns/:id
 */
export const getById = async (req: Request, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        fields: errors.array(),
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }

  try {
    const { id } = req.params as { id: string };
    const campaignId = parseInt(id, 10);

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }

    const sessionId = String(userId);
    const campaign = await getCampaignById(campaignId, sessionId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Campaign not found',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }

    return res.json({ success: true, data: campaign });
  } catch (error) {
    console.error('Error in getById:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch campaign details',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};

/**
 * Update campaign by ID.
 * PUT /api/v1/campaigns/:id
 */
export const update = async (req: Request, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        fields: errors.array(),
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }

  try {
    const { id } = req.params as { id: string };
    const campaignId = parseInt(id, 10);

    const body = req.body as {
      expanded_keywords?: string;
      blacklist_campaign_enabled?: boolean;
      blacklist_global_enabled?: boolean;
      cron_add_count?: number;
      is_active?: boolean;
    };

    const updateData: typeof body = {};

    if (body.expanded_keywords !== undefined) {
      updateData.expanded_keywords = body.expanded_keywords;
    }
    if (body.blacklist_campaign_enabled !== undefined) {
      updateData.blacklist_campaign_enabled = Boolean(body.blacklist_campaign_enabled);
    }
    if (body.blacklist_global_enabled !== undefined) {
      updateData.blacklist_global_enabled = Boolean(body.blacklist_global_enabled);
    }
    if (body.cron_add_count !== undefined) {
      updateData.cron_add_count = parseInt(String(body.cron_add_count), 10);
    }
    if (body.is_active !== undefined) {
      updateData.is_active = Boolean(body.is_active);
    }

    const campaign = await updateCampaign(campaignId, updateData);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Campaign not found',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }

    return res.json({ success: true, data: campaign });
  } catch (error) {
    console.error('Error in update:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update campaign',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};

/**
 * Delete campaign by ID.
 * DELETE /api/v1/campaigns/:id
 */
export const remove = async (req: Request, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        fields: errors.array(),
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }

  try {
    const { id } = req.params as { id: string };
    const campaignId = parseInt(id, 10);

    const deleted = await deleteCampaign(campaignId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Campaign not found',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }

    return res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error in remove:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete campaign',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};
