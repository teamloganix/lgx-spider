import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Power, PowerOff, Calendar, ShoppingCart, Clock, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { NumberInput } from '../ui/number-input';
import { TooltipProvider } from '../ui/tooltip';
import { formatDateTime } from '../../../utils/helpers';
import { useCampaigns } from '../../../hooks/useCampaigns';
import { KeywordsCard } from './components/KeywordsCard';
import { NegativeKeywordsCard } from './components/NegativeKeywordsCard';

interface CampaignDetailPageProps {
  campaignId?: number;
}

export function CampaignDetailPage({ campaignId: propCampaignId }: CampaignDetailPageProps) {
  const { detailData, detailLoading, detailError, fetchCampaignById, updateCampaign } =
    useCampaigns();

  const [campaignId, setCampaignId] = useState<number | null>(propCampaignId ?? null);

  useEffect(() => {
    if (campaignId != null) return;
    if (typeof window === 'undefined') return;
    const pathParts = window.location.pathname.split('/');
    const idx = pathParts.indexOf('campaigns');
    if (idx === -1 || !pathParts[idx + 1]) return;
    const id = parseInt(pathParts[idx + 1], 10);
    if (!Number.isNaN(id)) setCampaignId(id);
  }, [campaignId]);

  const campaign = campaignId != null ? (detailData[campaignId] ?? null) : null;
  const loading = campaignId != null ? (detailLoading[campaignId] ?? false) : false;
  const error = campaignId != null ? (detailError[campaignId] ?? null) : null;

  useEffect(() => {
    if (campaignId == null || campaign != null || loading) return;
    fetchCampaignById(campaignId);
  }, [campaignId, campaign, loading, fetchCampaignById]);

  const [localCronCount, setLocalCronCount] = useState<number | undefined>(
    campaign?.cron_add_count
  );

  useEffect(() => {
    if (campaign != null) setLocalCronCount(campaign.cron_add_count);
  }, [campaign]);

  const handleBack = () => {
    const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '') || '';
    window.location.href = `${base}/campaigns`;
  };

  const handleToggleActive = useCallback(async () => {
    if (campaign == null || campaignId == null) return;
    try {
      const ok = await updateCampaign(campaignId, { is_active: !campaign.is_active });
      if (ok) {
        toast.success(
          campaign.is_active
            ? 'Campaign deactivated successfully'
            : 'Campaign activated successfully'
        );
      } else {
        toast.error('Failed to update campaign');
      }
    } catch (err) {
      console.error('Error toggling campaign:', err);
      toast.error('Failed to update campaign');
    }
  }, [campaignId, campaign, updateCampaign]);

  const handleBlacklistCampaignChange = useCallback(
    async (value: boolean) => {
      if (campaignId == null) return;
      try {
        const ok = await updateCampaign(campaignId, { blacklist_campaign_enabled: value });
        if (ok) toast.success('Campaign blacklist updated');
        else toast.error('Failed to update campaign blacklist');
      } catch (err) {
        console.error('Error updating campaign blacklist:', err);
        toast.error('Failed to update campaign blacklist');
      }
    },
    [campaignId, updateCampaign]
  );

  const handleBlacklistGlobalChange = useCallback(
    async (value: boolean) => {
      if (campaignId == null) return;
      try {
        const ok = await updateCampaign(campaignId, { blacklist_global_enabled: value });
        if (ok) toast.success('Global blacklist updated');
        else toast.error('Failed to update global blacklist');
      } catch (err) {
        console.error('Error updating global blacklist:', err);
        toast.error('Failed to update global blacklist');
      }
    },
    [campaignId, updateCampaign]
  );

  const handleCronCountBlur = useCallback(async () => {
    if (campaignId == null || campaign == null) return;
    if (localCronCount === campaign.cron_add_count) return;
    try {
      const ok = await updateCampaign(campaignId, { cron_add_count: localCronCount ?? 0 });
      if (ok) toast.success('Cron add count updated');
      else {
        toast.error('Failed to update cron add count');
        setLocalCronCount(campaign.cron_add_count);
      }
    } catch (err) {
      console.error('Error updating cron add count:', err);
      toast.error('Failed to update cron add count');
      setLocalCronCount(campaign.cron_add_count);
    }
  }, [campaignId, campaign, localCronCount, updateCampaign]);

  const handleCronCountStep = useCallback(
    async (newValue: number) => {
      if (campaignId == null) return;
      try {
        const ok = await updateCampaign(campaignId, { cron_add_count: newValue });
        if (ok) toast.success('Cron add count updated');
        else {
          toast.error('Failed to update cron add count');
        }
      } catch (err) {
        console.error('Error updating cron add count:', err);
        toast.error('Failed to update cron add count');
      }
    },
    [campaignId, updateCampaign]
  );

  const handleKeywordsUpdate = useCallback(
    async (keywords: string): Promise<boolean> => {
      if (campaignId == null) return false;
      try {
        return await updateCampaign(campaignId, { expanded_keywords: keywords });
      } catch (err) {
        console.error('Error updating keywords:', err);
        return false;
      }
    },
    [campaignId, updateCampaign]
  );

  const getStatusBadgeStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active') return 'bg-green-100 text-green-800 hover:bg-green-100';
    if (s === 'inactive') return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    if (s === 'paused') return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    if (s === 'completed') return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  if (campaignId == null) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-slate-600">Invalid campaign ID</p>
          <Button onClick={handleBack} className="mt-4">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error != null) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-2">Error loading campaign</p>
          <p className="text-sm text-slate-600">{error}</p>
          <Button onClick={handleBack} className="mt-4">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  if (campaign == null) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-slate-600">Campaign not found</p>
          <Button onClick={handleBack} className="mt-4">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const data = campaign;

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-semibold text-slate-900">{data.name}</h1>
              <Badge
                className={
                  data.is_active
                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                }
              >
                is active: {String(data.is_active)}
              </Badge>
              <Badge className={getStatusBadgeStyle(data.status)}>status: {data.status}</Badge>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleToggleActive}
            className={
              data.is_active
                ? 'text-green-700 border-green-200 hover:bg-green-50'
                : 'text-gray-700 border-gray-200 hover:bg-gray-50'
            }
          >
            {data.is_active ? (
              <>
                <Power className="h-4 w-4 mr-2" />
                Active campaign
              </>
            ) : (
              <>
                <PowerOff className="h-4 w-4 mr-2" />
                Inactive campaign
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-violet-100 shadow-sm">
              <CardHeader>
                <CardTitle>Campaign Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      Created
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatDateTime(data.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      Last updated
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatDateTime(data.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-slate-400" />
                      In cart
                    </span>
                    <span className="font-medium text-slate-900">{data.cart_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      Pending Processing
                    </span>
                    <span className="font-medium text-slate-900">
                      {data.pending_prospecting_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Ban className="h-4 w-4 text-slate-400" />
                      Campaign blacklist
                    </span>
                    <span className="font-medium text-slate-900">
                      {data.campaign_blacklist_count}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-violet-100 shadow-sm">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Checkbox
                  label="Campaign blacklist"
                  value={data.blacklist_campaign_enabled}
                  onValueChange={handleBlacklistCampaignChange}
                  tooltip="Enable blacklist for this campaign"
                />
                <Checkbox
                  label="Global blacklist"
                  value={data.blacklist_global_enabled}
                  onValueChange={handleBlacklistGlobalChange}
                  tooltip="Enable global blacklist"
                />
                <div
                  className={
                    'flex items-center gap-2 border rounded-full h-10 px-3 ' +
                    'bg-white border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors w-fit'
                  }
                >
                  <NumberInput
                    value={localCronCount}
                    onChange={setLocalCronCount}
                    min={0}
                    max={9999}
                    onBlur={handleCronCountBlur}
                    onStep={handleCronCountStep}
                    placeholder="0"
                    borderless
                    className="w-20 h-8 p-0"
                  />
                  <span className="text-sm font-medium text-slate-600 shrink-0">
                    Cron Add Count
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KeywordsCard keywords={data.expanded_keywords} onUpdate={handleKeywordsUpdate} />
            <NegativeKeywordsCard />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
