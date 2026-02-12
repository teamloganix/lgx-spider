import React from 'react';
import { CampaignCard } from './CampaignCard';
import type { CampaignListItem } from '../../../../types/campaigns';

interface CampaignsListProps {
  campaigns: CampaignListItem[];
  onToggleActive: (_id: number, _currentState: boolean) => void;
  onViewDetails: (_id: number) => void;
}

export function CampaignsList({ campaigns, onToggleActive, onViewDetails }: CampaignsListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No campaigns found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {campaigns.map(campaign => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onToggleActive={onToggleActive}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
