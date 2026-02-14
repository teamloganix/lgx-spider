import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  getEmailsList,
  getFilterOptions,
  getEmailById as getEmailByIdService,
  generateEmail as generateEmailService,
  saveGeneration as saveGenerationService,
  type GetEmailsQuery,
} from '../services/emails.service.ts';

/**
 * GET /api/v1/emails
 * List outreach emails with pagination, filters, and ordering
 */
export const list = async (req: Request, res: Response): Promise<Response> => {
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
    const query = req.query as unknown as GetEmailsQuery;
    const result = await getEmailsList(query);
    return res.json(result);
  } catch (err) {
    console.error('Error in emails list:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch emails',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};

/**
 * GET /api/v1/emails/filter-options
 * Return filter options (campaigns, verdicts, priorities, guest_posts)
 */
export const filterOptions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await getFilterOptions();
    return res.json(result);
  } catch (err) {
    console.error('Error in emails filter-options:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch filter options',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};

/**
 * GET /api/v1/emails/:id
 * Get outreach email by id with analysis_json and latest generated email (if any).
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
    const id = parseInt((req.params as { id: string }).id, 10);
    const data = await getEmailByIdService(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Email not found',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error in emails getById:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch email',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};

/**
 * POST /api/v1/emails/:id/generate
 * Generate outreach email via AI and save to outreach_email_generations.
 */
export const generate = async (req: Request, res: Response): Promise<Response> => {
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
    const id = parseInt((req.params as { id: string }).id, 10);
    const { prompt, analysis } = req.body as { prompt: string; analysis: Record<string, unknown> };

    const email = await getEmailByIdService(id);
    if (!email) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Email not found',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }

    // When analysis is empty (e.g. no analysis_json on record), give the AI at least domain and campaign
    const analysisPayload =
      Object.keys(analysis).length > 0
        ? analysis
        : { domain: email.domain, campaign_name: email.campaign_name };

    const generatedEmail = await generateEmailService(id, email.domain, prompt, analysisPayload);
    return res.json({ success: true, email: generatedEmail });
  } catch (err) {
    console.error('Error in emails generate:', err);
    const message =
      err instanceof Error && (err.message.includes('OPENROUTER') || err.message.includes('AI'))
        ? 'Failed to generate email'
        : err instanceof Error
          ? err.message
          : 'Failed to generate email';
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
 * PUT /api/v1/emails/:id/generations
 * Update the latest generated email (e.g. after user edits) for this email_id.
 */
export const saveGeneration = async (req: Request, res: Response): Promise<Response> => {
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
    const id = parseInt((req.params as { id: string }).id, 10);
    const body_ = req.body as { generated_email?: string; prompt_used?: string };
    const updates: { generated_email?: string; prompt_used?: string } = {};
    if (body_.generated_email !== undefined && String(body_.generated_email).trim() !== '') {
      updates.generated_email = body_.generated_email;
    }
    if (body_.prompt_used !== undefined && String(body_.prompt_used).trim() !== '') {
      updates.prompt_used = body_.prompt_used;
    }

    const updated = await saveGenerationService(id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'No generated email found for this email',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Error in emails saveGeneration:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to save generated email',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};
