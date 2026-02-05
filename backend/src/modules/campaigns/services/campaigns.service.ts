import OutreachCampaign from '../models/outreach-campaign.model.ts';

export interface CampaignItem {
  id: number;
  name: string;
  original_keywords: string;
  expanded_keywords: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  status: string;
  blacklist_campaign_enabled: boolean;
  blacklist_global_enabled: boolean;
  cron_add_count: number;
}

/**
 * List all outreach campaigns from the database
 * @returns Array of campaign items
 */
export const listCampaigns = async (): Promise<CampaignItem[]> => {
  const rows = await OutreachCampaign.findAll({
    order: [['id', 'ASC']],
    raw: true,
  });

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    original_keywords: row.original_keywords,
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
