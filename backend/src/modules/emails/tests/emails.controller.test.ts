import { describe, expect, test, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { list, filterOptions } from '../controllers/emails.controller.ts';
import * as emailsService from '../services/emails.service.ts';
import type { GetFilterOptionsResult } from '../services/emails.service.ts';

vi.mock('express-validator', async () => {
  const actual = await vi.importActual('express-validator');
  return {
    ...actual,
    validationResult: vi.fn(),
  };
});

vi.mock('../services/emails.service.ts', () => ({
  getEmailsList: vi.fn(),
  getFilterOptions: vi.fn(),
}));

const mockValidationResult = vi.mocked(validationResult);
const mockedGetEmailsList = vi.mocked(emailsService.getEmailsList);
const mockedGetFilterOptions = vi.mocked(emailsService.getFilterOptions);

describe('Emails Controller - Unit Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockJson = vi.fn().mockReturnThis();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      json: mockJson,
      status: mockStatus,
    };
    mockReq = {
      query: {},
      path: '/api/v1/emails',
    };
    vi.clearAllMocks();
  });

  describe('list', () => {
    test('should return emails list with pagination', async () => {
      const mockResult = {
        success: true,
        data: {
          items: [
            {
              id: 1,
              domain: 'example.com',
              campaign_name: 'Campaign A',
              analyzed_at: '2026-01-21T00:00:00.000Z',
              link_value: 85,
              verdict: 'APPROVE',
              priority: 'High',
              guest_posts: 'Yes',
              contact_emails: ['help@example.com'],
              domain_rating: 45,
              org_traffic: 10000,
              org_keywords: 500,
              primary_email: 'help@example.com',
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
      mockedGetEmailsList.mockResolvedValue(mockResult);

      await list(mockReq as Request, mockRes as Response);

      expect(mockedGetEmailsList).toHaveBeenCalledWith(mockReq.query);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    test('should return 422 when validation fails', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'page_size must be one of: 25, 50, 100, 200' }],
      } as any);

      await list(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Input validation failed',
          }),
        })
      );
      expect(mockedGetEmailsList).not.toHaveBeenCalled();
    });

    test('should return 500 when service throws', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedGetEmailsList.mockRejectedValue(new Error('DB error'));

      await list(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch emails',
          }),
        })
      );
    });
  });

  describe('filterOptions', () => {
    test('should return filter options', async () => {
      const mockResult: GetFilterOptionsResult = {
        success: true,
        data: {
          campaigns: ['Campaign A', 'Campaign B'],
          verdicts: ['APPROVE', 'REJECT', 'REVIEW'],
          priorities: ['Low', 'Medium', 'High'],
          guest_posts: ['yes', 'no', 'unknown'],
        },
      };
      mockedGetFilterOptions.mockResolvedValue(mockResult);

      await filterOptions(mockReq as Request, mockRes as Response);

      expect(mockedGetFilterOptions).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    test('should return 500 when service throws', async () => {
      mockedGetFilterOptions.mockRejectedValue(new Error('DB error'));

      await filterOptions(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch filter options',
          }),
        })
      );
    });
  });
});
