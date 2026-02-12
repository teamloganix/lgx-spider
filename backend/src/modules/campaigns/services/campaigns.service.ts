import { Op } from 'sequelize';
import OutreachCampaign from '../models/outreach-campaign.model.ts';
import { getCartCount } from '../../carts/services/carts.service.ts';
import {
  getPendingProspectingCount,
  getCampaignBlacklistCount,
} from '../../prospecting/services/prospecting.service.ts';

export interface CampaignListItem {
  id: number;
  name: string;
  expanded_keywords: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  status: string;
  blacklist_campaign_enabled: boolean;
  blacklist_global_enabled: boolean;
  cron_add_count: number;
}

export interface CampaignDetailItem extends CampaignListItem {
  original_keywords: string;
  cart_count: number;
  pending_prospecting_count: number;
  campaign_blacklist_count: number;
}

/**
 * List all outreach campaigns from the database
 * Returns only fields needed for card display
 * @returns Array of campaign items
 */
export const listCampaigns = async (): Promise<CampaignListItem[]> => {
  const rows = await OutreachCampaign.findAll({
    attributes: [
      'id',
      'name',
      'expanded_keywords',
      'created_at',
      'updated_at',
      'is_active',
      'status',
      'blacklist_campaign_enabled',
      'blacklist_global_enabled',
      'cron_add_count',
    ],
    order: [['id', 'ASC']],
    raw: true,
  });

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    expanded_keywords: row.expanded_keywords,
    created_at: row.created_at,
    updated_at: row.updated_at,
    is_active: Boolean(row.is_active),
    status: row.status ?? 'active',
    blacklist_campaign_enabled: Boolean(row.blacklist_campaign_enabled),
    blacklist_global_enabled: Boolean(row.blacklist_global_enabled),
    cron_add_count: row.cron_add_count ?? 10,
  }));
};

/**
 * Get campaign by ID with additional counts
 * @param campaignId - Campaign ID
 * @param sessionId - Session ID (user ID) for cart count calculation
 * @returns Campaign detail item or null if not found
 */
export const getCampaignById = async (
  campaignId: number,
  sessionId: string
): Promise<CampaignDetailItem | null> => {
  const campaign = await OutreachCampaign.findByPk(campaignId, {
    attributes: [
      'id',
      'name',
      'original_keywords',
      'expanded_keywords',
      'created_at',
      'updated_at',
      'is_active',
      'status',
      'blacklist_campaign_enabled',
      'blacklist_global_enabled',
      'cron_add_count',
    ],
  });

  if (!campaign) {
    return null;
  }

  const isActive = Boolean(campaign.is_active);
  const cartCount = isActive ? await getCartCount(campaignId, sessionId) : 0;
  const pendingProspectingCount = await getPendingProspectingCount(campaign.name);
  const campaignBlacklistCount = await getCampaignBlacklistCount(campaign.name);

  return {
    id: campaign.id,
    name: campaign.name,
    original_keywords: campaign.original_keywords,
    expanded_keywords: campaign.expanded_keywords,
    created_at: campaign.created_at,
    updated_at: campaign.updated_at,
    is_active: isActive,
    status: campaign.status ?? 'active',
    blacklist_campaign_enabled: Boolean(campaign.blacklist_campaign_enabled),
    blacklist_global_enabled: Boolean(campaign.blacklist_global_enabled),
    cron_add_count: campaign.cron_add_count ?? 10,
    cart_count: cartCount,
    pending_prospecting_count: pendingProspectingCount,
    campaign_blacklist_count: campaignBlacklistCount,
  };
};

/**
 * Update campaign by ID
 * @param campaignId - Campaign ID
 * @param updateData - Data to update
 * @returns Updated campaign or null if not found
 */
export const updateCampaign = async (
  campaignId: number,
  updateData: {
    expanded_keywords?: string;
    blacklist_campaign_enabled?: boolean;
    blacklist_global_enabled?: boolean;
    cron_add_count?: number;
    is_active?: boolean;
  }
): Promise<OutreachCampaign | null> => {
  const campaign = await OutreachCampaign.findByPk(campaignId);

  if (!campaign) {
    return null;
  }

  if (updateData.expanded_keywords !== undefined) {
    campaign.expanded_keywords = updateData.expanded_keywords;
  }
  if (updateData.blacklist_campaign_enabled !== undefined) {
    campaign.blacklist_campaign_enabled = updateData.blacklist_campaign_enabled;
  }
  if (updateData.blacklist_global_enabled !== undefined) {
    campaign.blacklist_global_enabled = updateData.blacklist_global_enabled;
  }
  if (updateData.cron_add_count !== undefined) {
    campaign.cron_add_count = updateData.cron_add_count;
  }
  if (updateData.is_active !== undefined) {
    if (updateData.is_active === true) {
      await OutreachCampaign.update(
        { is_active: false },
        { where: { id: { [Op.ne]: campaignId } } }
      );
    }
    campaign.is_active = updateData.is_active;
  }

  await campaign.save();
  return campaign;
};

/**
 * Delete campaign by ID
 * @param campaignId - Campaign ID
 * @returns True if deleted, false if not found
 */
export const deleteCampaign = async (campaignId: number): Promise<boolean> => {
  const campaign = await OutreachCampaign.findByPk(campaignId);

  if (!campaign) {
    return false;
  }

  await campaign.destroy();
  return true;
};
