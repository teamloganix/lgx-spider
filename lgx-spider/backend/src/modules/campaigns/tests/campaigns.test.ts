/* eslint-disable max-classes-per-file */
import { describe, expect, test, beforeEach, vi } from 'vitest';
import OutreachCampaign from '../models/outreach-campaign.model.ts';
import { listCampaigns } from '../services/campaigns.service.ts';

vi.mock('../models/outreach-campaign.model.ts', () => ({
  default: {
    findAll: vi.fn(),
  },
}));

const mockFindAll = vi.mocked(OutreachCampaign.findAll);

const mockCampaignRow = {
  id: 1,
  name: 'Test Campaign',
  original_keywords: 'keyword1, keyword2',
  expanded_keywords: 'keyword1, keyword2, keyword3',
  created_at: new Date('2024-01-01T00:00:00.000Z'),
  updated_at: new Date('2024-01-02T00:00:00.000Z'),
  is_active: 1,
  status: 'active',
  blacklist_campaign_enabled: 1,
  blacklist_global_enabled: 1,
  cron_add_count: 10,
};

describe('Campaigns Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listCampaigns', () => {
    test('should return campaigns list successfully', async () => {
      const mockRows = [
        { ...mockCampaignRow },
        {
          ...mockCampaignRow,
          id: 2,
          name: 'Second Campaign',
          is_active: 0,
          status: 'paused',
        },
      ];

      mockFindAll.mockResolvedValue(mockRows as any);

      const result = await listCampaigns();

      expect(mockFindAll).toHaveBeenCalledWith({
        order: [['id', 'ASC']],
        raw: true,
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        name: 'Test Campaign',
        original_keywords: 'keyword1, keyword2',
        expanded_keywords: 'keyword1, keyword2, keyword3',
        created_at: mockCampaignRow.created_at,
        updated_at: mockCampaignRow.updated_at,
        is_active: true,
        status: 'active',
        blacklist_campaign_enabled: true,
        blacklist_global_enabled: true,
        cron_add_count: 10,
      });
      expect(result[1]).toEqual({
        id: 2,
        name: 'Second Campaign',
        original_keywords: 'keyword1, keyword2',
        expanded_keywords: 'keyword1, keyword2, keyword3',
        created_at: mockCampaignRow.created_at,
        updated_at: mockCampaignRow.updated_at,
        is_active: false,
        status: 'paused',
        blacklist_campaign_enabled: true,
        blacklist_global_enabled: true,
        cron_add_count: 10,
      });
    });

    test('should return empty array when no campaigns exist', async () => {
      mockFindAll.mockResolvedValue([]);

      const result = await listCampaigns();

      expect(mockFindAll).toHaveBeenCalledWith({
        order: [['id', 'ASC']],
        raw: true,
      });
      expect(result).toEqual([]);
    });

    test('should map tinyint to boolean correctly', async () => {
      mockFindAll.mockResolvedValue([
        {
          ...mockCampaignRow,
          is_active: 0,
          blacklist_campaign_enabled: 0,
          blacklist_global_enabled: 0,
        },
      ] as any);

      const result = await listCampaigns();

      expect(result).toHaveLength(1);
      expect(result[0]!.is_active).toBe(false);
      expect(result[0]!.blacklist_campaign_enabled).toBe(false);
      expect(result[0]!.blacklist_global_enabled).toBe(false);
    });

    test('should propagate database errors', async () => {
      mockFindAll.mockRejectedValue(new Error('DB connection failed'));

      await expect(listCampaigns()).rejects.toThrow('DB connection failed');
    });
  });
});
