import { describe, expect, test, beforeEach, vi } from 'vitest';
import * as campaignsOpenRouter from '../../../utils/open-router/campaigns-open-router.ts';
import OutreachCampaign from '../models/outreach-campaign.model.ts';

vi.mock('../../carts/services/carts.service.ts', () => ({ getCartCount: vi.fn() }));
vi.mock('../../prospecting/services/prospecting.service.ts', () => ({
  getPendingProspectingCount: vi.fn(),
  getCampaignBlacklistCount: vi.fn(),
}));

vi.mock('../../../utils/open-router/campaigns-open-router.ts', () => ({
  expandKeywordsForCampaign: vi.fn(),
}));

vi.mock('../models/outreach-campaign.model.ts', () => ({
  default: {
    update: vi.fn(),
    create: vi.fn(),
  },
}));

const { createCampaign } = await import('../services/campaigns.service.ts');

const mockedExpand = vi.mocked(campaignsOpenRouter.expandKeywordsForCampaign);
const mockedUpdate = vi.mocked(OutreachCampaign.update);
const mockedCreate = vi.mocked(OutreachCampaign.create);

describe('Campaigns Service - createCampaign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedExpand.mockResolvedValue('kw1, kw2, kw3');
    mockedUpdate.mockResolvedValue([0]);
    mockedCreate.mockResolvedValue({
      id: 1,
      name: 'Test',
      original_keywords: 'a\nb',
      expanded_keywords: 'kw1, kw2, kw3',
      is_active: true,
      status: 'active',
      blacklist_campaign_enabled: true,
      blacklist_global_enabled: true,
      cron_add_count: 10,
      created_at: new Date(),
      updated_at: new Date(),
    } as any);
  });

  test('should normalize keywords, expand, deactivate others if active, then create', async () => {
    const result = await createCampaign({
      name: 'Test Campaign',
      original_keywords: '  fashion  \n\n  e-commerce  \n  fashion  ',
      is_active: true,
    });

    expect(mockedExpand).toHaveBeenCalledWith('fashion\ne-commerce');
    expect(mockedUpdate).toHaveBeenCalledWith({ is_active: false }, { where: {} });
    expect(mockedCreate).toHaveBeenCalledWith({
      name: 'Test Campaign',
      original_keywords: 'fashion\ne-commerce',
      expanded_keywords: 'kw1, kw2, kw3',
      is_active: true,
      status: 'active',
      blacklist_campaign_enabled: true,
      blacklist_global_enabled: true,
      cron_add_count: 10,
    });
    expect(result.id).toBe(1);
    expect(result.name).toBe('Test');
  });

  test('should not call update when is_active is false', async () => {
    await createCampaign({
      name: 'Inactive',
      original_keywords: 'foo',
      is_active: false,
    });

    expect(mockedUpdate).not.toHaveBeenCalled();
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Inactive',
        is_active: false,
        blacklist_campaign_enabled: true,
        blacklist_global_enabled: true,
        cron_add_count: 10,
      })
    );
  });

  test('should throw when keyword expansion fails (no campaign created)', async () => {
    mockedExpand.mockRejectedValue(new Error('OpenRouter failed: 500'));

    await expect(
      createCampaign({
        name: 'Test',
        original_keywords: 'x',
      })
    ).rejects.toThrow('OpenRouter failed: 500');

    expect(mockedCreate).not.toHaveBeenCalled();
  });
});
