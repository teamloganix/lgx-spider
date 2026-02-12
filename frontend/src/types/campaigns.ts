export type CampaignStatus = 'active' | 'paused' | 'completed';

export interface CampaignListItem {
  id: number;
  name: string;
  expanded_keywords: string;
  created_at: Date | string;
  updated_at: Date | string;
  is_active: boolean;
  status: CampaignStatus;
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

export interface CampaignsResponse {
  success: boolean;
  items: CampaignListItem[];
}

export interface CampaignDetailResponse {
  success: boolean;
  item: CampaignDetailItem;
}

export interface UpdateCampaignPayload {
  expanded_keywords?: string;
  blacklist_campaign_enabled?: boolean;
  blacklist_global_enabled?: boolean;
  cron_add_count?: number;
  is_active?: boolean;
}
