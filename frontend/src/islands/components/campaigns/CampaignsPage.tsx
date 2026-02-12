import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@islands/components/ui/button';
import { Input } from '@islands/components/ui/input';
import { toast } from 'sonner';
import { useCampaigns } from '../../../hooks/useCampaigns';
import { CampaignsList } from './components/CampaignsList';
import { CampaignsListSkeleton } from './components/CampaignSkeleton';

export function CampaignsPage() {
  const { items, loading, error, fetch, updateCampaign } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }
    const query = searchQuery.toLowerCase().trim();
    return items.filter(campaign => campaign.name.toLowerCase().includes(query));
  }, [items, searchQuery]);

  const handleToggleActive = useCallback(
    async (id: number, currentState: boolean) => {
      try {
        const success = await updateCampaign(id, { is_active: !currentState });
        if (success) {
          toast.success(`Campaign ${!currentState ? 'activated' : 'deactivated'} successfully`);
        } else {
          toast.error('Failed to update campaign');
        }
      } catch (err) {
        console.error('Error toggling campaign active status:', err);
        toast.error('Failed to update campaign');
      }
    },
    [updateCampaign]
  );

  const handleViewDetails = useCallback((id: number) => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const path = `/campaigns/${id}`;
    const fullPath = baseUrl === '/' ? path : `${baseUrl.replace(/\/$/, '')}${path}`;
    window.location.href = fullPath;
  }, []);

  if (error && items.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-2">Error loading campaigns</p>
          <p className="text-sm text-slate-600">{error}</p>
          <Button onClick={() => fetch()} className="mt-4">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold text-slate-900">Campaigns</h1>

      <div
        className={
          'flex flex-col sm:flex-row items-start sm:items-center justify-between ' +
          'gap-4 bg-white border border-violet-100 rounded-lg p-4 shadow-sm'
        }
      >
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-end">
          <Button
            className={
              'bg-gradient-to-r from-violet-600 to-indigo-600 ' +
              'hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200 whitespace-nowrap'
            }
            onClick={() => {
              // TODO: Add function to add campaign
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add campaign
          </Button>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <CampaignsListSkeleton />
      ) : (
        <CampaignsList
          campaigns={filteredCampaigns}
          onToggleActive={handleToggleActive}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
}
