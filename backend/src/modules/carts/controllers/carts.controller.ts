import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { getCarts, processCarts } from '../services/carts.service.ts';
import OutreachCart from '../models/outreach-cart.model.ts';

/**
 * GET /api/v1/carts
 * List cart items with pagination, filtering, and ordering
 */
export const getCartsHandler = async (req: Request, res: Response): Promise<Response> => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        fields: result.array(),
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }

  try {
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
    const responseData = await getCarts(req.query as any, sessionId);

    return res.json(responseData);
  } catch (error) {
    console.error('Error in getCarts:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch cart items',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};

/**
 * DELETE /api/v1/carts/bulk
 * Delete multiple cart items by IDs (only items owned by the user)
 */
export const deleteBulkCartsHandler = async (req: Request, res: Response): Promise<Response> => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        fields: result.array(),
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }

  try {
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
    const { ids } = req.body as { ids: number[] };

    const idsNum = ids
      .map((id: number) => Number(id))
      .filter((id: number) => !Number.isNaN(id) && id >= 1);

    if (idsNum.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'No valid IDs provided',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }

    const deleted = await OutreachCart.destroy({
      where: {
        id: idsNum,
        session_id: sessionId,
      },
    });

    return res.json({
      success: true,
      data: {
        message: 'Cart items deleted successfully',
        deletedCount: deleted,
        ids: idsNum,
      },
    });
  } catch (error) {
    console.error('Error in deleteBulkCarts:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete cart items',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};

/**
 * POST /api/v1/carts/process
 * Process cart: move domains to prospecting, clear cart
 */
export const processCartsHandler = async (req: Request, res: Response): Promise<Response> => {
  try {
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
    const result = await processCarts(sessionId);

    return res.json(result);
  } catch (error) {
    console.error('Error in processCarts:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process cart',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }
};
