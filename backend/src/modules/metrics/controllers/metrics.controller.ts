import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  getMetricsList,
  getMetricsStats,
  getMetricsFilterOptions,
  toggleProcessing,
  getProcessingPaused,
  blacklistProcessedDomains,
  type GetMetricsQuery,
} from '../services/metrics.service.ts';

/**
 * GET /api/v1/metrics
 * List outreach prospecting with pagination, filters, ordering (capped at 500).
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
    const query = req.query as unknown as GetMetricsQuery;
    const result = await getMetricsList(query);
    return res.json(result);
  } catch (err) {
    console.error('Error in metrics list:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch metrics',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};

/**
 * GET /api/v1/metrics/stats
 * Aggregate counts by processing_status.
 */
export const stats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await getMetricsStats();
    return res.json(result);
  } catch (err) {
    console.error('Error in metrics stats:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch metrics stats',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};

/**
 * GET /api/v1/metrics/filter-options
 * Return filter options (campaigns, top_countries, statuses).
 */
export const filterOptions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await getMetricsFilterOptions();
    return res.json(result);
  } catch (err) {
    console.error('Error in metrics filter-options:', err);
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
 * GET /api/v1/metrics/processing-paused
 * Return current processing paused state (for initial button state).
 */
export const processingPaused = async (req: Request, res: Response): Promise<Response> => {
  try {
    const paused = await getProcessingPaused();
    return res.json({ success: true, paused });
  } catch (err) {
    console.error('Error in metrics processing-paused:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get processing state',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};

/**
 * POST /api/v1/metrics/toggle-processing
 * Toggle processing_paused in outreach_settings.
 */
export const toggleProcessingHandler = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await toggleProcessing();
    return res.json(result);
  } catch (err) {
    console.error('Error in metrics toggle-processing:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to toggle processing',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};

/**
 * POST /api/v1/metrics/blacklist-processed
 * Archive to outreach_archive, add to outreach_global_blacklist, remove from outreach_prospecting.
 */
export const blacklistProcessed = async (req: Request, res: Response): Promise<Response> => {
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
    const { domains } = req.body as { domains: Array<{ id: number; domain: string }> };
    const result = await blacklistProcessedDomains(domains);
    return res.json(result);
  } catch (err) {
    console.error('Error in metrics blacklist-processed:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to blacklist processed domains',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};
