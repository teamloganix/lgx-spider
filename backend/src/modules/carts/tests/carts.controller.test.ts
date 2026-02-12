import { describe, expect, test, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  getCartsHandler,
  deleteBulkCartsHandler,
  processCartsHandler,
} from '../controllers/carts.controller.ts';
import * as cartsService from '../services/carts.service.ts';
import OutreachCart from '../models/outreach-cart.model.ts';

vi.mock('express-validator', async () => {
  const actual = await vi.importActual('express-validator');
  return {
    ...actual,
    validationResult: vi.fn(),
  };
});

vi.mock('../services/carts.service.ts', () => ({
  getCarts: vi.fn(),
  processCarts: vi.fn(),
}));

vi.mock('../models/outreach-cart.model.ts', () => ({
  default: {
    destroy: vi.fn(),
  },
}));

const mockValidationResult = vi.mocked(validationResult);
const mockedGetCarts = vi.mocked(cartsService.getCarts);
const mockedProcessCarts = vi.mocked(cartsService.processCarts);
const mockedOutreachCartDestroy = vi.mocked(OutreachCart.destroy);

describe('Carts Controller - Unit Tests', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockJson: any;
  let mockStatus: any;

  beforeEach(() => {
    mockJson = vi.fn().mockReturnThis();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      json: mockJson,
      status: mockStatus,
    };
    mockReq = {
      user: { id: 'user-123' },
      query: {},
      body: {},
      path: '/api/v1/carts',
    };
    vi.clearAllMocks();
  });

  describe('getCartsHandler', () => {
    test('should return cart list successfully', async () => {
      const mockCartsResponse = {
        success: true,
        user_id: 'user-123',
        data: {
          items: [
            {
              id: 1,
              session_id: 'user-123',
              domain: 'example.com',
              keywords: null,
              similarity_score: 95.5,
              spider_id: null,
              campaign_id: 1,
              added_at: '2024-01-01T00:00:00.000Z',
            },
          ],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRecords: 1,
            pageSize: 25,
            totalAvailable: 1,
          },
        },
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);

      mockedGetCarts.mockResolvedValue(mockCartsResponse);

      await getCartsHandler(mockReq as Request, mockRes as Response);

      expect(mockedGetCarts).toHaveBeenCalledWith(mockReq.query, 'user-123');
      expect(mockJson).toHaveBeenCalledWith(mockCartsResponse);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    test('should return 422 when validation fails', async () => {
      const validationErrors = [
        { msg: 'Page size must be one of: 25, 50, 100, 200', path: 'page_size' },
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors,
      } as any);

      await getCartsHandler(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          fields: validationErrors,
          timestamp: expect.any(String),
          path: '/api/v1/carts',
        },
      });
      expect(mockedGetCarts).not.toHaveBeenCalled();
    });

    test('should return 401 when user is not authenticated', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockReq.user = undefined;

      await getCartsHandler(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          timestamp: expect.any(String),
          path: '/api/v1/carts',
        },
      });
      expect(mockedGetCarts).not.toHaveBeenCalled();
    });

    test('should return 500 when service throws', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedGetCarts.mockRejectedValue(new Error('DB error'));

      await getCartsHandler(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch cart items',
          timestamp: expect.any(String),
          path: '/api/v1/carts',
        },
      });
    });
  });

  describe('deleteBulkCartsHandler', () => {
    test('should delete cart items successfully', async () => {
      mockReq.body = { ids: [1, 2, 3] };
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedOutreachCartDestroy.mockResolvedValue(3 as any);

      await deleteBulkCartsHandler(mockReq as Request, mockRes as Response);

      expect(mockedOutreachCartDestroy).toHaveBeenCalledWith({
        where: { id: [1, 2, 3], session_id: 'user-123' },
      });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          message: 'Cart items deleted successfully',
          deletedCount: 3,
          ids: [1, 2, 3],
        },
      });
      expect(mockStatus).not.toHaveBeenCalled();
    });

    test('should filter invalid ids and keep valid ones', async () => {
      mockReq.body = { ids: [1, -1, 0, 2, NaN] };
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedOutreachCartDestroy.mockResolvedValue(2 as any);

      await deleteBulkCartsHandler(mockReq as Request, mockRes as Response);

      expect(mockedOutreachCartDestroy).toHaveBeenCalledWith({
        where: { id: [1, 2], session_id: 'user-123' },
      });
    });

    test('should return 400 when no valid ids after filtering', async () => {
      mockReq.body = { ids: [-1, 0, NaN] };
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);

      await deleteBulkCartsHandler(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'No valid IDs provided',
          timestamp: expect.any(String),
          path: '/api/v1/carts',
        },
      });
      expect(mockedOutreachCartDestroy).not.toHaveBeenCalled();
    });

    test('should return 422 when validation fails', async () => {
      const validationErrors = [{ msg: 'ids must be a non-empty array', path: 'ids' }];
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors,
      } as any);

      await deleteBulkCartsHandler(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockedOutreachCartDestroy).not.toHaveBeenCalled();
    });

    test('should return 401 when user is not authenticated', async () => {
      mockReq.user = undefined;
      mockReq.body = { ids: [1, 2] };
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);

      await deleteBulkCartsHandler(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockedOutreachCartDestroy).not.toHaveBeenCalled();
    });

    test('should return 500 when destroy throws', async () => {
      mockReq.body = { ids: [1, 2] };
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedOutreachCartDestroy.mockRejectedValue(new Error('DB error'));

      await deleteBulkCartsHandler(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete cart items',
          timestamp: expect.any(String),
          path: '/api/v1/carts',
        },
      });
    });
  });

  describe('processCartsHandler', () => {
    test('should process cart successfully', async () => {
      const mockProcessResult = {
        success: true,
        skipped: 0,
        inserted: 5,
        insertedPerCampaign: [{ campaign_id: 1, count: 5 }],
      };

      mockedProcessCarts.mockResolvedValue(mockProcessResult);

      await processCartsHandler(mockReq as Request, mockRes as Response);

      expect(mockedProcessCarts).toHaveBeenCalledWith('user-123');
      expect(mockJson).toHaveBeenCalledWith(mockProcessResult);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    test('should return 401 when user is not authenticated', async () => {
      mockReq.user = undefined;

      await processCartsHandler(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          timestamp: expect.any(String),
          path: '/api/v1/carts',
        },
      });
      expect(mockedProcessCarts).not.toHaveBeenCalled();
    });

    test('should return 500 when service throws', async () => {
      mockedProcessCarts.mockRejectedValue(new Error('Transaction failed'));

      await processCartsHandler(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process cart',
          timestamp: expect.any(String),
          path: '/api/v1/carts',
        },
      });
    });
  });
});
