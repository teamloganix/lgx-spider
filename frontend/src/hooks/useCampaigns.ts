import { useStore } from '@nanostores/react';
import {
  campaignsData,
  campaignsLoading,
  campaignsError,
  campaignDetailData,
  campaignDetailLoading,
  campaignDetailError,
  fetchCampaigns,
  fetchCampaignById,
  updateCampaign,
  deleteCampaign,
  createCampaign,
} from '../stores/campaigns';

export const useCampaigns = () => {
  const items = useStore(campaignsData);
  const loading = useStore(campaignsLoading);
  const error = useStore(campaignsError);
  const detailData = useStore(campaignDetailData);
  const detailLoading = useStore(campaignDetailLoading);
  const detailError = useStore(campaignDetailError);

  return {
    items,
    loading,
    error,
    fetch: fetchCampaigns,
    detailData,
    detailLoading,
    detailError,
    getCampaignDetail: (campaignId: number) => detailData[campaignId] || null,
    isCampaignDetailLoading: (campaignId: number) => detailLoading[campaignId] || false,
    getCampaignDetailError: (campaignId: number) => detailError[campaignId] || null,
    fetchCampaignById,
    updateCampaign,
    deleteCampaign,
    createCampaign,
  };
};
