import { describe, expect, test, beforeEach, vi } from 'vitest';
import OutreachCart from '../models/outreach-cart.model.ts';
import OutreachProspecting from '../models/outreach-prospecting.model.ts';
import sequelize from '../../../utils/database.ts';
import { getCarts, processCarts } from '../services/carts.service.ts';

const mockTransaction = {
  commit: vi.fn(),
  rollback: vi.fn(),
};

vi.mock('../../../utils/database.ts', () => ({
  default: {
    transaction: vi.fn(),
  },
}));

vi.mock('../models/outreach-cart.model.ts', () => ({
  default: {
    findAndCountAll: vi.fn(),
    count: vi.fn(),
    findAll: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock('../models/outreach-prospecting.model.ts', () => ({
  default: {
    findAll: vi.fn(),
    bulkCreate: vi.fn(),
  },
}));

const mockTransactionFn = vi.mocked(sequelize.transaction);
const mockFindAndCountAll = vi.mocked(OutreachCart.findAndCountAll);
const mockCount = vi.mocked(OutreachCart.count);
const mockCartFindAll = vi.mocked(OutreachCart.findAll);
const mockCartDestroy = vi.mocked(OutreachCart.destroy);
const mockProspectingFindAll = vi.mocked(OutreachProspecting.findAll);
const mockProspectingBulkCreate = vi.mocked(OutreachProspecting.bulkCreate);

describe('Carts Service - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransactionFn.mockResolvedValue(mockTransaction as any);
    mockTransaction.commit.mockResolvedValue(undefined);
    mockTransaction.rollback.mockResolvedValue(undefined);
  });

  describe('getCarts', () => {
    test('should return cart items with pagination successfully', async () => {
      const mockRows = [
        {
          id: 1,
          session_id: 'user-123',
          domain: 'example.com',
          keywords: 'test',
          similarity_score: 95.5,
          spider_id: null,
          campaign_id: 1,
          added_at: new Date('2024-01-01T00:00:00.000Z'),
        },
      ];

      mockFindAndCountAll.mockResolvedValue({ rows: mockRows, count: 1 } as any);
      mockCount.mockResolvedValue(1);

      const result = await getCarts({ page: 1, page_size: 25 }, 'user-123');

      expect(mockFindAndCountAll).toHaveBeenCalledWith({
        where: { session_id: 'user-123' },
        order: [
          ['similarity_score', 'DESC'],
          ['id', 'ASC'],
        ],
        limit: 25,
        offset: 0,
        raw: true,
      });
      expect(mockCount).toHaveBeenCalledWith({
        where: { session_id: 'user-123' },
      });
      expect(result.success).toBe(true);
      expect(result.user_id).toBe('user-123');
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0]).toEqual({
        id: 1,
        session_id: 'user-123',
        domain: 'example.com',
        keywords: 'test',
        similarity_score: 95.5,
        spider_id: null,
        campaign_id: 1,
        added_at: '2024-01-01T00:00:00.000Z',
      });
      expect(result.data.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 1,
        pageSize: 25,
        totalAvailable: 1,
      });
    });

    test('should apply domain filter when provided', async () => {
      mockFindAndCountAll.mockResolvedValue({ rows: [], count: 0 } as any);
      mockCount.mockResolvedValue(0);

      await getCarts({ domain: 'example' }, 'user-123');

      expect(mockFindAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            session_id: 'user-123',
            domain: expect.objectContaining({}),
          }),
        })
      );
    });

    test('should apply custom order when provided', async () => {
      mockFindAndCountAll.mockResolvedValue({ rows: [], count: 0 } as any);
      mockCount.mockResolvedValue(0);

      await getCarts({ order: 'domain,ASC' }, 'user-123');

      expect(mockFindAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [
            ['domain', 'ASC'],
            ['id', 'ASC'],
          ],
        })
      );
    });

    test('should return empty items when no cart data', async () => {
      mockFindAndCountAll.mockResolvedValue({ rows: [], count: 0 } as any);
      mockCount.mockResolvedValue(0);

      const result = await getCarts({}, 'user-123');

      expect(result.data.items).toEqual([]);
      expect(result.data.pagination.totalRecords).toBe(0);
    });

    test('should propagate database errors', async () => {
      mockFindAndCountAll.mockRejectedValue(new Error('DB error'));

      await expect(getCarts({}, 'user-123')).rejects.toThrow('DB error');
    });
  });

  describe('processCarts', () => {
    test('should insert new domains and clear cart', async () => {
      const cartItems = [
        {
          id: 1,
          session_id: 'user-123',
          domain: 'example.com',
          campaign_id: 1,
        },
        {
          id: 2,
          session_id: 'user-123',
          domain: 'test.com',
          campaign_id: 1,
        },
      ];

      mockCartFindAll.mockResolvedValue(cartItems as any);
      mockProspectingFindAll.mockResolvedValue([] as any);
      mockProspectingBulkCreate.mockResolvedValue([] as any);
      mockCartDestroy.mockResolvedValue(2 as any);

      const result = await processCarts('user-123');

      expect(mockTransactionFn).toHaveBeenCalled();
      expect(mockCartFindAll).toHaveBeenCalledWith({
        where: { session_id: 'user-123' },
        raw: true,
        transaction: mockTransaction,
      });
      expect(mockProspectingBulkCreate).toHaveBeenCalledWith(
        [
          { domain: 'example.com', campaign_id: 1, processing_status: 'pending' },
          { domain: 'test.com', campaign_id: 1, processing_status: 'pending' },
        ],
        { transaction: mockTransaction }
      );
      expect(mockCartDestroy).toHaveBeenCalledWith({
        where: { session_id: 'user-123' },
        transaction: mockTransaction,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.inserted).toBe(2);
      expect(result.skipped).toBe(0);
      expect(result.insertedPerCampaign).toEqual([{ campaign_id: 1, count: 2 }]);
    });

    test('should skip items with null campaign_id', async () => {
      const cartItems = [
        { id: 1, session_id: 'user-123', domain: 'example.com', campaign_id: null },
      ];

      mockCartFindAll.mockResolvedValue(cartItems as any);
      mockProspectingBulkCreate.mockResolvedValue([] as any);
      mockCartDestroy.mockResolvedValue(1 as any);

      const result = await processCarts('user-123');

      expect(mockProspectingBulkCreate).not.toHaveBeenCalled();
      expect(result.inserted).toBe(0);
      expect(result.skipped).toBe(1);
      expect(result.insertedPerCampaign).toEqual([]);
    });

    test('should skip domains that already exist in prospecting', async () => {
      const cartItems = [{ id: 1, session_id: 'user-123', domain: 'example.com', campaign_id: 1 }];
      const existing = [{ domain: 'example.com', campaign_id: 1 }];

      mockCartFindAll.mockResolvedValue(cartItems as any);
      mockProspectingFindAll.mockResolvedValue(existing as any);
      mockCartDestroy.mockResolvedValue(1 as any);

      const result = await processCarts('user-123');

      expect(mockProspectingBulkCreate).not.toHaveBeenCalled();
      expect(result.inserted).toBe(0);
      expect(result.skipped).toBe(1);
    });

    test('should clean domain (strip protocol and www)', async () => {
      const cartItems = [
        {
          id: 1,
          session_id: 'user-123',
          domain: 'https://www.example.com/path',
          campaign_id: 1,
        },
      ];

      mockCartFindAll.mockResolvedValue(cartItems as any);
      mockProspectingFindAll.mockResolvedValue([] as any);
      mockProspectingBulkCreate.mockResolvedValue([] as any);
      mockCartDestroy.mockResolvedValue(1 as any);

      await processCarts('user-123');

      expect(mockProspectingBulkCreate).toHaveBeenCalledWith(
        [{ domain: 'example.com', campaign_id: 1, processing_status: 'pending' }],
        { transaction: mockTransaction }
      );
    });

    test('should rollback transaction on error', async () => {
      mockCartFindAll.mockRejectedValue(new Error('DB error'));

      await expect(processCarts('user-123')).rejects.toThrow('DB error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    test('should handle empty cart', async () => {
      mockCartFindAll.mockResolvedValue([] as any);
      mockCartDestroy.mockResolvedValue(0 as any);

      const result = await processCarts('user-123');

      expect(mockProspectingFindAll).not.toHaveBeenCalled();
      expect(mockProspectingBulkCreate).not.toHaveBeenCalled();
      expect(result.inserted).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.insertedPerCampaign).toEqual([]);
    });
  });
});
