import { atom } from 'nanostores';
import { api } from '@utils/api';
import type {
  CampaignsResponse,
  CampaignDetailResponse,
  CampaignListItem,
  CampaignDetailItem,
  UpdateCampaignPayload,
  CreateCampaignPayload,
  CreateCampaignResponse,
} from '../types/campaigns';

export const campaignsData = atom<CampaignListItem[]>([]);
export const campaignsLoading = atom<boolean>(false);
export const campaignsError = atom<string | null>(null);

export const campaignDetailData = atom<Record<number, CampaignDetailItem | null>>({});
export const campaignDetailLoading = atom<Record<number, boolean>>({});
export const campaignDetailError = atom<Record<number, string | null>>({});

export const fetchCampaigns = async (): Promise<void> => {
  try {
    campaignsLoading.set(true);
    campaignsError.set(null);

    const response = (await api.get('/campaigns')) as CampaignsResponse;
    if (response?.success && response?.data?.items) {
      campaignsData.set(response.data.items);
    } else {
      campaignsData.set([]);
    }
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    campaignsError.set('Failed to fetch campaigns');
    campaignsData.set([]);
  } finally {
    campaignsLoading.set(false);
  }
};

export const fetchCampaignById = async (campaignId: number): Promise<void> => {
  try {
    campaignDetailLoading.set({
      ...campaignDetailLoading.get(),
      [campaignId]: true,
    });
    campaignDetailError.set({
      ...campaignDetailError.get(),
      [campaignId]: null,
    });

    const response = (await api.get(`/campaigns/${campaignId}`)) as CampaignDetailResponse;
    if (response?.success && response?.data) {
      campaignDetailData.set({
        ...campaignDetailData.get(),
        [campaignId]: response.data,
      });
    } else {
      campaignDetailData.set({
        ...campaignDetailData.get(),
        [campaignId]: null,
      });
    }
  } catch (err) {
    console.error('Error fetching campaign details:', err);
    campaignDetailError.set({
      ...campaignDetailError.get(),
      [campaignId]: 'Failed to fetch campaign details',
    });
  } finally {
    campaignDetailLoading.set({
      ...campaignDetailLoading.get(),
      [campaignId]: false,
    });
  }
};

export const updateCampaign = async (
  campaignId: number,
  payload: UpdateCampaignPayload
): Promise<boolean> => {
  try {
    campaignDetailError.set({
      ...campaignDetailError.get(),
      [campaignId]: null,
    });

    const response = (await api.put(`/campaigns/${campaignId}`, payload)) as {
      success: boolean;
      data?: CampaignDetailItem;
    };

    if (response?.success) {
      const currentList = campaignsData.get();
      const updatedList = currentList.map(campaign => {
        if (campaign.id === campaignId) {
          return { ...campaign, ...payload };
        }
        if (payload.is_active === true) {
          return { ...campaign, is_active: false };
        }
        return campaign;
      });
      campaignsData.set(updatedList);

      await fetchCampaignById(campaignId);

      return true;
    }
    return false;
  } catch (err) {
    console.error('Error updating campaign:', err);
    campaignDetailError.set({
      ...campaignDetailError.get(),
      [campaignId]: 'Failed to update campaign',
    });
    return false;
  }
};

export const createCampaign = async (
  payload: CreateCampaignPayload
): Promise<CampaignListItem | null> => {
  try {
    campaignsError.set(null);

    const response = (await api.post('/campaigns', payload)) as CreateCampaignResponse & {
      error?: { message?: string };
    };

    if (response?.success && response?.data?.id != null) {
      const currentList = campaignsData.get();
      campaignsData.set([...currentList, response.data as CampaignListItem]);

      return response.data as CampaignListItem;
    }

    const errMsg = response?.error?.message ?? 'Failed to create campaign';
    campaignsError.set(errMsg);
    return null;
  } catch (err) {
    console.error('Error creating campaign:', err);
    const message = err instanceof Error ? err.message : 'Failed to create campaign';
    campaignsError.set(message);
    return null;
  }
};

export const deleteCampaign = async (campaignId: number): Promise<boolean> => {
  try {
    const response = (await api.delete(`/campaigns/${campaignId}`)) as {
      success: boolean;
    };

    if (response?.success) {
      const currentList = campaignsData.get();
      campaignsData.set(currentList.filter(campaign => campaign.id !== campaignId));

      const currentDetails = campaignDetailData.get();
      const updatedDetails = { ...currentDetails };
      delete updatedDetails[campaignId];
      campaignDetailData.set(updatedDetails);

      return true;
    }
    return false;
  } catch (err) {
    console.error('Error deleting campaign:', err);
    return false;
  }
};
