import { describe, expect, test, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  list,
  stats,
  filterOptions,
  processingPaused,
  toggleProcessingHandler,
  blacklistProcessed,
} from '../controllers/metrics.controller.ts';
import * as metricsService from '../services/metrics.service.ts';

vi.mock('express-validator', async () => {
  const actual = await vi.importActual('express-validator');
  return {
    ...actual,
    validationResult: vi.fn(),
  };
});

vi.mock('../services/metrics.service.ts', () => ({
  getMetricsList: vi.fn(),
  getMetricsStats: vi.fn(),
  getMetricsFilterOptions: vi.fn(),
  getProcessingPaused: vi.fn(),
  toggleProcessing: vi.fn(),
  blacklistProcessedDomains: vi.fn(),
}));

const mockValidationResult = vi.mocked(validationResult);
const mockedGetMetricsList = vi.mocked(metricsService.getMetricsList);
const mockedGetMetricsStats = vi.mocked(metricsService.getMetricsStats);
const mockedGetMetricsFilterOptions = vi.mocked(metricsService.getMetricsFilterOptions);
const mockedGetProcessingPaused = vi.mocked(metricsService.getProcessingPaused);
const mockedToggleProcessing = vi.mocked(metricsService.toggleProcessing);
const mockedBlacklistProcessedDomains = vi.mocked(metricsService.blacklistProcessedDomains);

describe('Metrics Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockJson = vi.fn().mockReturnThis();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    mockRes = { json: mockJson, status: mockStatus };
    mockReq = { query: {}, body: {}, path: '/api/v1/metrics' };
    vi.clearAllMocks();
  });

  describe('list', () => {
    test('should return metrics list on success', async () => {
      mockValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any);
      const data = {
        success: true as const,
        data: {
          items: [
            {
              id: 1,
              domain: 'x.com',
              campaign_name: 'C',
              domain_rating: null,
              org_traffic: null,
              org_keywords: null,
              org_cost: null,
              paid_traffic: null,
              paid_keywords: null,
              paid_cost: null,
              top_country: null,
              top_traffic: null,
              processing_status: 'completed',
              created_at: '2024-01-01T00:00:00.000Z',
              updated_at: '2024-01-01T00:00:00.000Z',
              error_message: null,
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
      mockedGetMetricsList.mockResolvedValue(data);

      await list(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(data);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    test('should return 422 when validation fails', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid', path: 'page' }],
      } as any);

      await list(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockedGetMetricsList).not.toHaveBeenCalled();
    });

    test('should return 500 on service error', async () => {
      mockValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any);
      mockedGetMetricsList.mockRejectedValue(new Error('DB error'));

      await list(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'INTERNAL_SERVER_ERROR' }),
        })
      );
    });
  });

  describe('stats', () => {
    test('should return stats on success', async () => {
      const data = {
        success: true as const,
        data: { total: 100, pending: 20, processing: 5, completed: 70, failed: 5 },
      };
      mockedGetMetricsStats.mockResolvedValue(data);

      await stats(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(data);
    });
  });

  describe('filterOptions', () => {
    test('should return filter options on success', async () => {
      const data = {
        success: true as const,
        data: {
          campaigns: ['A'],
          top_countries: ['US'],
          statuses: ['pending', 'processing', 'completed', 'failed'],
        },
      };
      mockedGetMetricsFilterOptions.mockResolvedValue(data);

      await filterOptions(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(data);
    });
  });

  describe('processingPaused', () => {
    test('should return paused state', async () => {
      mockedGetProcessingPaused.mockResolvedValue(true);

      await processingPaused(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith({ success: true, paused: true });
    });
  });

  describe('toggleProcessingHandler', () => {
    test('should return toggle result', async () => {
      const data = {
        success: true as const,
        paused: true,
        message: 'Processing paused successfully',
      };
      mockedToggleProcessing.mockResolvedValue(data);

      await toggleProcessingHandler(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(data);
    });
  });

  describe('blacklistProcessed', () => {
    test('should return 422 when validation fails', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'domains required', path: 'domains' }],
      } as any);

      await blacklistProcessed(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockedBlacklistProcessedDomains).not.toHaveBeenCalled();
    });

    test('should call service and return result on success', async () => {
      mockValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any);
      mockReq.body = { domains: [{ id: 1, domain: 'x.com' }] };
      const data = {
        success: true as const,
        message: 'Done',
        archived: 1,
        blacklisted: 1,
        removed: 1,
      };
      mockedBlacklistProcessedDomains.mockResolvedValue(data);

      await blacklistProcessed(mockReq as Request, mockRes as Response);

      expect(mockedBlacklistProcessedDomains).toHaveBeenCalledWith([{ id: 1, domain: 'x.com' }]);
      expect(mockJson).toHaveBeenCalledWith(data);
    });
  });
});
