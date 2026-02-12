import OutreachProspecting from '../models/outreach-prospecting.model.ts';

/**
 * Get pending prospecting count for a campaign
 * Counts records where campaign_name matches and processing_status is 'pending'
 * @param campaignName - Campaign name
 * @returns Count of pending prospecting items
 */
export const getPendingProspectingCount = async (campaignName: string): Promise<number> => {
  const count = await OutreachProspecting.count({
    where: {
      campaign_name: campaignName,
      processing_status: 'pending',
    },
  });

  return count;
};

/**
 * Get campaign blacklist count
 * Counts all records for a campaign_name (regardless of status)
 * @param campaignName - Campaign name
 * @returns Total count of prospecting items for the campaign
 */
export const getCampaignBlacklistCount = async (campaignName: string): Promise<number> => {
  const count = await OutreachProspecting.count({
    where: {
      campaign_name: campaignName,
    },
  });

  return count;
};
