import { describe, expect, test, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  list,
  filterOptions,
  getById,
  generate,
  saveGeneration,
} from '../controllers/emails.controller.ts';
import * as emailsService from '../services/emails.service.ts';
import type { GetFilterOptionsResult, GetEmailsListResult } from '../services/emails.service.ts';

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
  getEmailById: vi.fn(),
  generateEmail: vi.fn(),
  saveGeneration: vi.fn(),
}));

const mockValidationResult = vi.mocked(validationResult);
const mockedGetEmailsList = vi.mocked(emailsService.getEmailsList);
const mockedGetFilterOptions = vi.mocked(emailsService.getFilterOptions);
const mockedGetEmailById = vi.mocked(emailsService.getEmailById);
const mockedGenerateEmail = vi.mocked(emailsService.generateEmail);
const mockedSaveGeneration = vi.mocked(emailsService.saveGeneration);

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
      const mockResult: GetEmailsListResult = {
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

  describe('getById', () => {
    test('should return email data with analysis and generated_email when found', async () => {
      mockReq.params = { id: '123' };
      const mockData = {
        id: 123,
        domain: 'example.com',
        campaign_name: 'Campaign A',
        analysis_json: { overall_link_value: 80 },
        analyzed_at: '2026-01-21T00:00:00.000Z',
        generated_email: 'SUBJECT: Hi\n\nBODY: Hello world',
        prompt_used: null,
      };
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedGetEmailById.mockResolvedValue(mockData);

      await getById(mockReq as Request, mockRes as Response);

      expect(mockedGetEmailById).toHaveBeenCalledWith(123);
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: mockData });
      expect(mockStatus).not.toHaveBeenCalled();
    });

    test('should return 404 when email not found', async () => {
      mockReq.params = { id: '999' };
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedGetEmailById.mockResolvedValue(null);

      await getById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'RESOURCE_NOT_FOUND',
            message: 'Email not found',
          }),
        })
      );
    });

    test('should return 422 when validation fails', async () => {
      mockReq.params = { id: 'invalid' };
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'id must be a positive integer' }],
      } as any);

      await getById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockedGetEmailById).not.toHaveBeenCalled();
    });
  });

  describe('generate', () => {
    test('should return generated email when service succeeds', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = {
        prompt: 'Write an email.\n\n**Website Analysis Data:**',
        analysis: { domain_analysis: {}, link_building_recommendation: {} },
      };
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedGetEmailById.mockResolvedValue({
        id: 1,
        domain: 'example.com',
        campaign_name: 'Campaign A',
        analysis_json: {},
        analyzed_at: null,
        generated_email: null,
        prompt_used: null,
      });
      const mockGenerated = 'SUBJECT: Guest post\n\nBODY: Hi, I would like to contribute...';
      mockedGenerateEmail.mockResolvedValue(mockGenerated);

      await generate(mockReq as Request, mockRes as Response);

      expect(mockedGetEmailById).toHaveBeenCalledWith(1);
      expect(mockedGenerateEmail).toHaveBeenCalledWith(
        1,
        'example.com',
        mockReq.body.prompt,
        mockReq.body.analysis
      );
      expect(mockJson).toHaveBeenCalledWith({ success: true, email: mockGenerated });
      expect(mockStatus).not.toHaveBeenCalled();
    });

    test('should return 404 when email not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { prompt: 'Write email', analysis: { foo: 1 } };
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedGetEmailById.mockResolvedValue(null);

      await generate(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockedGenerateEmail).not.toHaveBeenCalled();
    });

    test('should return 500 and generic message on OpenRouter/AI error', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { prompt: 'Write', analysis: { x: 1 } };
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedGetEmailById.mockResolvedValue({
        id: 1,
        domain: 'example.com',
        campaign_name: 'A',
        analysis_json: {},
        analyzed_at: null,
        generated_email: null,
        prompt_used: null,
      });
      mockedGenerateEmail.mockRejectedValue(new Error('OPENROUTER_API_KEY must be set'));

      await generate(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Failed to generate email',
          }),
        })
      );
    });
  });

  describe('saveGeneration', () => {
    test('should return success when update succeeds', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { generated_email: 'SUBJECT: x\n\nBODY: y' };
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedSaveGeneration.mockResolvedValue(true);

      await saveGeneration(mockReq as Request, mockRes as Response);

      expect(mockedSaveGeneration).toHaveBeenCalledWith(1, {
        generated_email: 'SUBJECT: x\n\nBODY: y',
      });
      expect(mockJson).toHaveBeenCalledWith({ success: true });
      expect(mockStatus).not.toHaveBeenCalled();
    });

    test('should return 404 when no generation exists for email', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { generated_email: 'SUBJECT: x\n\nBODY: y' };
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);
      mockedSaveGeneration.mockResolvedValue(false);

      await saveGeneration(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'No generated email found for this email',
          }),
        })
      );
    });

    test('should return 422 when validation fails', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = {};
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'At least one of generated_email or prompt_used is required' }],
      } as any);

      await saveGeneration(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockedSaveGeneration).not.toHaveBeenCalled();
    });
  });
});
