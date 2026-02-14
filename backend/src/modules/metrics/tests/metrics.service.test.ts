import { describe, expect, test, beforeEach, vi } from 'vitest';
import sequelize from '../../../utils/database.ts';
import OutreachProspecting from '../../prospecting/models/outreach-prospecting.model.ts';
import OutreachSettings from '../../settings/models/outreach-settings.model.ts';
import OutreachArchive from '../../archives/models/outreach-archive.model.ts';
/* eslint-disable-next-line max-len */
import OutreachGlobalBlacklist from '../../global-blacklist/models/outreach-global-blacklist.model.ts';
import {
  getMetricsList,
  getMetricsStats,
  getMetricsFilterOptions,
  toggleProcessing,
  getProcessingPaused,
  blacklistProcessedDomains,
} from '../services/metrics.service.ts';

const mockTransaction = {
  commit: vi.fn(),
  rollback: vi.fn(),
};

vi.mock('../../../utils/database.ts', () => ({
  default: {
    query: vi.fn(),
    transaction: vi.fn(),
  },
}));

vi.mock('../../prospecting/models/outreach-prospecting.model.ts', () => ({
  default: {
    count: vi.fn(),
    findAll: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock('../../settings/models/outreach-settings.model.ts', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../archives/models/outreach-archive.model.ts', () => ({
  default: {
    create: vi.fn(),
  },
}));

vi.mock('../../global-blacklist/models/outreach-global-blacklist.model.ts', () => ({
  default: {
    findOrCreate: vi.fn(),
  },
}));

const mockQuery = vi.mocked(sequelize.query);
const mockTransactionFn = vi.mocked(sequelize.transaction);
const mockProspectingCount = vi.mocked(OutreachProspecting.count);
const mockProspectingFindAll = vi.mocked(OutreachProspecting.findAll);
const mockProspectingDestroy = vi.mocked(OutreachProspecting.destroy);
const mockSettingsFindOne = vi.mocked(OutreachSettings.findOne);
const mockSettingsCreate = vi.mocked(OutreachSettings.create);
const mockArchiveCreate = vi.mocked(OutreachArchive.create);
const mockBlacklistFindOrCreate = vi.mocked(OutreachGlobalBlacklist.findOrCreate);

describe('Metrics Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransactionFn.mockResolvedValue(mockTransaction as any);
    mockTransaction.commit.mockResolvedValue(undefined);
    mockTransaction.rollback.mockResolvedValue(undefined);
  });

  describe('getMetricsList', () => {
    test('should return paginated list with default page and pageSize', async () => {
      mockProspectingCount.mockResolvedValue(10);
      const mockRows = [
        {
          id: 1,
          domain: 'example.com',
          campaign_name: 'Campaign A',
          domain_rating: 50,
          org_traffic: 1000,
          org_keywords: 500,
          org_cost: 100.5,
          paid_traffic: 10,
          paid_keywords: 5,
          paid_cost: 20.0,
          org_traffic_top_by_country: [['us', 500]],
          processing_status: 'completed',
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-02'),
          error_message: null,
        },
      ];
      mockProspectingFindAll.mockResolvedValue(mockRows as any);

      const result = await getMetricsList({});

      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(1);
      const item = result.data.items[0]!;
      expect(item.domain).toBe('example.com');
      expect(item.top_country).toBe('US');
      expect(item.top_traffic).toBe(500);
      expect(result.data.pagination.currentPage).toBe(1);
      expect(result.data.pagination.pageSize).toBe(25);
      expect(result.data.pagination.totalAvailable).toBe(10);
    });

    test('should apply search filter', async () => {
      mockProspectingCount.mockResolvedValue(0);
      mockProspectingFindAll.mockResolvedValue([]);

      await getMetricsList({ search: 'test' });

      expect(mockProspectingFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ domain: expect.anything() }),
        })
      );
    });

    test('should cap at 500 records', async () => {
      const fiveHundred = Array.from({ length: 500 }, (_, i) => ({
        id: i + 1,
        domain: `domain${i}.com`,
        campaign_name: 'C',
        domain_rating: null,
        org_traffic: null,
        org_keywords: null,
        org_cost: null,
        paid_traffic: null,
        paid_keywords: null,
        paid_cost: null,
        org_traffic_top_by_country: null,
        processing_status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
        error_message: null,
      }));
      mockProspectingCount.mockResolvedValue(1000);
      mockProspectingFindAll.mockResolvedValue(fiveHundred as any);

      const result = await getMetricsList({ page: 1, page_size: 25 });

      expect(result.data.items).toHaveLength(25);
      expect(result.data.pagination.totalRecords).toBe(500);
      expect(result.data.pagination.totalAvailable).toBe(1000);
    });
  });

  describe('getMetricsStats', () => {
    test('should return aggregate stats', async () => {
      mockQuery.mockResolvedValue([
        {
          total: 100,
          pending: 20,
          processing: 5,
          completed: 70,
          failed: 5,
        },
      ] as any);

      const result = await getMetricsStats();

      expect(result.success).toBe(true);
      expect(result.data.total).toBe(100);
      expect(result.data.pending).toBe(20);
      expect(result.data.processing).toBe(5);
      expect(result.data.completed).toBe(70);
      expect(result.data.failed).toBe(5);
    });
  });

  describe('getMetricsFilterOptions', () => {
    test('should return campaigns, top_countries, statuses', async () => {
      mockProspectingFindAll
        .mockResolvedValueOnce([{ campaign_name: 'A' }, { campaign_name: 'B' }] as any)
        .mockResolvedValueOnce([
          { org_traffic_top_by_country: [['us', 100]] },
          { org_traffic_top_by_country: [['de', 200]] },
        ] as any);

      const result = await getMetricsFilterOptions();

      expect(result.success).toBe(true);
      expect(result.data.campaigns).toEqual(['A', 'B']);
      expect(result.data.statuses).toEqual(['pending', 'processing', 'completed', 'failed']);
      expect(result.data.top_countries).toContain('US');
      expect(result.data.top_countries).toContain('DE');
    });
  });

  describe('toggleProcessing', () => {
    test('should set paused to true when currently false', async () => {
      const existingRow = {
        setting_key: 'processing_paused',
        setting_value: '0',
        update: vi.fn().mockResolvedValue(undefined),
      };
      mockSettingsFindOne.mockResolvedValue(existingRow as any);

      const result = await toggleProcessing();

      expect(result.success).toBe(true);
      expect(result.paused).toBe(true);
      expect(result.message).toContain('paused');
      expect(existingRow.update).toHaveBeenCalledWith({ setting_value: '1' });
    });

    test('should set paused to false when currently true', async () => {
      const existingRow = {
        setting_key: 'processing_paused',
        setting_value: '1',
        update: vi.fn().mockResolvedValue(undefined),
      };
      mockSettingsFindOne.mockResolvedValue(existingRow as any);

      const result = await toggleProcessing();

      expect(result.paused).toBe(false);
      expect(existingRow.update).toHaveBeenCalledWith({ setting_value: '0' });
    });

    test('should create setting when not exists', async () => {
      mockSettingsFindOne.mockResolvedValue(null);
      mockSettingsCreate.mockResolvedValue({} as any);

      const result = await toggleProcessing();

      expect(result.paused).toBe(true);
      expect(mockSettingsCreate).toHaveBeenCalledWith({
        setting_key: 'processing_paused',
        setting_value: '1',
      });
    });
  });

  describe('getProcessingPaused', () => {
    test('should return true when setting_value is 1', async () => {
      mockSettingsFindOne.mockResolvedValue({ setting_value: '1' } as any);
      expect(await getProcessingPaused()).toBe(true);
    });

    test('should return false when setting_value is 0 or missing', async () => {
      mockSettingsFindOne.mockResolvedValue({ setting_value: '0' } as any);
      expect(await getProcessingPaused()).toBe(false);
      mockSettingsFindOne.mockResolvedValue(null);
      expect(await getProcessingPaused()).toBe(false);
    });
  });

  describe('blacklistProcessedDomains', () => {
    test('should return zeros when domains array is empty', async () => {
      const result = await blacklistProcessedDomains([]);
      expect(result.success).toBe(true);
      expect(result.archived).toBe(0);
      expect(result.blacklisted).toBe(0);
      expect(result.removed).toBe(0);
      expect(mockTransactionFn).not.toHaveBeenCalled();
    });

    test('should archive, blacklist, and remove in transaction', async () => {
      const domains = [{ id: 1, domain: 'example.com' }];
      const row = {
        id: 1,
        domain: 'example.com',
        campaign_name: 'C',
        domain_rating: 50,
        org_traffic: 1000,
        org_keywords: 100,
        org_cost: 10,
        paid_cost: 5,
        paid_keywords: 10,
        paid_traffic: 20,
        org_traffic_top_by_country: '[["us",100]]',
        processing_status: 'completed',
        error_message: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockProspectingFindAll.mockResolvedValue([row] as any);
      mockArchiveCreate.mockResolvedValue({} as any);
      mockBlacklistFindOrCreate.mockResolvedValue([{} as any, true]);
      mockProspectingDestroy.mockResolvedValue(1);

      const result = await blacklistProcessedDomains(domains);

      expect(mockTransactionFn).toHaveBeenCalled();
      expect(mockArchiveCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          original_prospecting_id: 1,
          domain: 'example.com',
          campaign_name: 'C',
        }),
        { transaction: mockTransaction }
      );
      expect(mockBlacklistFindOrCreate).toHaveBeenCalledWith({
        where: { domain: 'example.com' },
        defaults: { domain: 'example.com' },
        transaction: mockTransaction,
      });
      expect(mockProspectingDestroy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
          transaction: mockTransaction,
        })
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.archived).toBe(1);
      expect(result.removed).toBe(1);
    });

    test('should rollback on error', async () => {
      mockProspectingFindAll.mockRejectedValue(new Error('DB error'));

      await expect(blacklistProcessedDomains([{ id: 1, domain: 'x.com' }])).rejects.toThrow(
        'DB error'
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
