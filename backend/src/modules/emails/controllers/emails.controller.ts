import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  getEmailsList,
  getFilterOptions,
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
