import { describe, expect, test, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { list, create, getById, update, remove } from '../controllers/campaigns.controller.ts';
import * as campaignsService from '../services/campaigns.service.ts';

vi.mock('express-validator', async () => {
  const actual = await vi.importActual('express-validator');
  return {
    ...actual,
    validationResult: vi.fn(),
  };
});

vi.mock('../services/campaigns.service.ts', () => ({
  listCampaigns: vi.fn(),
  getCampaignById: vi.fn(),
  createCampaign: vi.fn(),
  updateCampaign: vi.fn(),
  deleteCampaign: vi.fn(),
}));

const mockValidationResult = vi.mocked(validationResult);
const mockedListCampaigns = vi.mocked(campaignsService.listCampaigns);
const mockedGetCampaignById = vi.mocked(campaignsService.getCampaignById);
const mockedCreateCampaign = vi.mocked(campaignsService.createCampaign);
const mockedUpdateCampaign = vi.mocked(campaignsService.updateCampaign);
const mockedDeleteCampaign = vi.mocked(campaignsService.deleteCampaign);

describe('Campaigns Controller - Unit Tests', () => {
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
      params: {},
      query: {},
      body: {},
      path: '/api/v1/campaigns',
    };
    vi.clearAllMocks();
  });

  describe('create', () => {
    test('should create campaign and return 201 with item', async () => {
      mockReq.body = {
        name: 'New Campaign',
        original_keywords: 'fashion, e-commerce',
        is_active: true,
        blacklist_campaign_enabled: true,
        blacklist_global_enabled: true,
      };
      mockReq.path = '/api/v1/campaigns';

      const mockCreated = {
        id: 1,
        name: 'New Campaign',
        original_keywords: 'fashion, e-commerce',
        expanded_keywords: 'fashion, e-commerce, clothing, retail',
        is_active: true,
        status: 'active',
        blacklist_campaign_enabled: true,
        blacklist_global_enabled: true,
        cron_add_count: 10,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedCreateCampaign.mockResolvedValue(mockCreated as any);

      await create(mockReq as Request, mockRes as Response);

      expect(mockedCreateCampaign).toHaveBeenCalledWith({
        name: 'New Campaign',
        original_keywords: 'fashion, e-commerce',
        is_active: true,
        blacklist_campaign_enabled: true,
        blacklist_global_enabled: true,
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockCreated,
      });
    });

    test('should return 422 when validation fails', async () => {
      mockReq.body = { name: '' };
      mockReq.path = '/api/v1/campaigns';
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'name is required', path: 'name' }],
      } as any);

      await create(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          fields: [{ msg: 'name is required', path: 'name' }],
          timestamp: expect.any(String),
          path: '/api/v1/campaigns',
        },
      });
      expect(mockedCreateCampaign).not.toHaveBeenCalled();
    });

    test('should return 500 when createCampaign throws (e.g. AI failure)', async () => {
      mockReq.body = {
        name: 'New Campaign',
        original_keywords: 'fashion',
      };
      mockReq.path = '/api/v1/campaigns';
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedCreateCampaign.mockRejectedValue(new Error('AI returned empty keyword expansion'));

      await create(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI returned empty keyword expansion',
          timestamp: expect.any(String),
          path: '/api/v1/campaigns',
        },
      });
    });
  });

  describe('list', () => {
    test('should return campaigns list successfully', async () => {
      const mockCampaigns = [
        {
          id: 1,
          name: 'Test Campaign',
          expanded_keywords: 'keyword1, keyword2',
          created_at: new Date('2024-01-01T00:00:00.000Z'),
          updated_at: new Date('2024-01-02T00:00:00.000Z'),
          is_active: true,
          status: 'active',
          blacklist_campaign_enabled: true,
          blacklist_global_enabled: true,
          cron_add_count: 10,
        },
      ];

      mockedListCampaigns.mockResolvedValue(mockCampaigns);

      await list(mockReq as Request, mockRes as Response);

      expect(mockedListCampaigns).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: { items: mockCampaigns },
      });
      expect(mockStatus).not.toHaveBeenCalled();
    });

    test('should return 500 when service throws', async () => {
      mockedListCampaigns.mockRejectedValue(new Error('DB error'));

      await list(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch campaigns',
          timestamp: expect.any(String),
          path: '/api/v1/campaigns',
        },
      });
    });
  });

  describe('getById', () => {
    test('should return campaign details successfully', async () => {
      mockReq.params = { id: '1' };
      mockReq.path = '/api/v1/campaigns/1';

      const mockCampaign = {
        id: 1,
        name: 'Test Campaign',
        original_keywords: 'keyword1',
        expanded_keywords: 'keyword1, keyword2',
        created_at: new Date('2024-01-01T00:00:00.000Z'),
        updated_at: new Date('2024-01-02T00:00:00.000Z'),
        is_active: true,
        status: 'active',
        blacklist_campaign_enabled: true,
        blacklist_global_enabled: true,
        cron_add_count: 10,
        cart_count: 5,
        pending_prospecting_count: 10,
        campaign_blacklist_count: 25,
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedGetCampaignById.mockResolvedValue(mockCampaign);

      await getById(mockReq as Request, mockRes as Response);

      expect(mockedGetCampaignById).toHaveBeenCalledWith(1, 'user-123');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockCampaign,
      });
      expect(mockStatus).not.toHaveBeenCalled();
    });

    test('should return 422 when validation fails', async () => {
      mockReq.params = { id: 'invalid' };
      mockReq.path = '/api/v1/campaigns/invalid';
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'id must be a positive integer', path: 'id' }],
      } as any);

      await getById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          fields: [{ msg: 'id must be a positive integer', path: 'id' }],
          timestamp: expect.any(String),
          path: '/api/v1/campaigns/invalid',
        },
      });
      expect(mockedGetCampaignById).not.toHaveBeenCalled();
    });

    test('should return 401 when user is not authenticated', async () => {
      mockReq.params = { id: '1' };
      mockReq.path = '/api/v1/campaigns/1';
      mockReq.user = undefined;
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);

      await getById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          timestamp: expect.any(String),
          path: '/api/v1/campaigns/1',
        },
      });
      expect(mockedGetCampaignById).not.toHaveBeenCalled();
    });

    test('should return 404 when campaign not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.path = '/api/v1/campaigns/999';
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedGetCampaignById.mockResolvedValue(null);

      await getById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Campaign not found',
          timestamp: expect.any(String),
          path: '/api/v1/campaigns/999',
        },
      });
    });
  });

  describe('update', () => {
    test('should update campaign successfully', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = {
        expanded_keywords: 'new keywords',
        is_active: false,
      };
      mockReq.path = '/api/v1/campaigns/1';

      const mockUpdatedCampaign = {
        id: 1,
        name: 'Test Campaign',
        expanded_keywords: 'new keywords',
        is_active: false,
        save: vi.fn(),
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedUpdateCampaign.mockResolvedValue(mockUpdatedCampaign as any);

      await update(mockReq as Request, mockRes as Response);

      expect(mockedUpdateCampaign).toHaveBeenCalledWith(1, {
        expanded_keywords: 'new keywords',
        is_active: false,
      });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedCampaign,
      });
      expect(mockStatus).not.toHaveBeenCalled();
    });

    test('should return 422 when validation fails', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { cron_add_count: 'invalid' };
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [
          { msg: 'cron_add_count must be an integer between 0 and 9999', path: 'cron_add_count' },
        ],
      } as any);

      await update(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockedUpdateCampaign).not.toHaveBeenCalled();
    });

    test('should return 404 when campaign not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.path = '/api/v1/campaigns/999';
      mockReq.body = { is_active: true };
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedUpdateCampaign.mockResolvedValue(null);

      await update(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Campaign not found',
          timestamp: expect.any(String),
          path: '/api/v1/campaigns/999',
        },
      });
    });
  });

  describe('remove', () => {
    test('should delete campaign successfully', async () => {
      mockReq.params = { id: '1' };
      mockReq.path = '/api/v1/campaigns/1';

      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedDeleteCampaign.mockResolvedValue(true);

      await remove(mockReq as Request, mockRes as Response);

      expect(mockedDeleteCampaign).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {},
      });
      expect(mockStatus).not.toHaveBeenCalled();
    });

    test('should return 422 when validation fails', async () => {
      mockReq.params = { id: 'invalid' };
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'id must be a positive integer', path: 'id' }],
      } as any);

      await remove(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockedDeleteCampaign).not.toHaveBeenCalled();
    });

    test('should return 404 when campaign not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.path = '/api/v1/campaigns/999';
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedDeleteCampaign.mockResolvedValue(false);

      await remove(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Campaign not found',
          timestamp: expect.any(String),
          path: '/api/v1/campaigns/999',
        },
      });
    });
  });
});
