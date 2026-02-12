import React from 'react';
import { Eye, Power, PowerOff } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { formatDate } from '../../../../utils/helpers';
import type { CampaignListItem } from '../../../../types/campaigns';

interface CampaignCardProps {
  campaign: CampaignListItem;
  onToggleActive: (_id: number, _currentState: boolean) => void;
  onViewDetails: (_id: number) => void;
}

export function CampaignCard({ campaign, onToggleActive, onViewDetails }: CampaignCardProps) {
  const keywords = campaign.expanded_keywords
    ? campaign.expanded_keywords
        .split(',')
        .map(k => k.trim())
        .filter(Boolean)
    : [];
  const keywordsToShow = keywords.slice(0, 2);
  const remainingCount = keywords.length - 2;

  const getStatusBadgeStyle = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') {
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    }
    if (statusLower === 'paused') {
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
    if (statusLower === 'completed') {
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    }
    return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  return (
    <Card
      className={
        'h-full flex flex-col border border-violet-100 shadow-sm ' +
        'hover:shadow-md transition-shadow'
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-slate-900 flex-1 line-clamp-2 min-w-0">
            {campaign.name}
          </h3>
          {campaign.is_active && (
            <Badge className={`${getStatusBadgeStyle(campaign.status)} shrink-0`}>
              {campaign.status}
            </Badge>
          )}
        </div>

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {keywordsToShow.map((keyword, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-slate-100 text-slate-700 hover:bg-slate-100 text-xs"
              >
                {keyword}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-700 hover:bg-slate-100 text-xs"
              >
                {remainingCount >= 99 ? '99+' : `+${remainingCount}`}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0 min-w-0">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Created</span>
              <span className="font-medium text-slate-900">{formatDate(campaign.created_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Last updated</span>
              <span className="font-medium text-slate-900">{formatDate(campaign.updated_at)}</span>
            </div>
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Campaign blacklist</span>
              <Badge
                variant="secondary"
                className={
                  campaign.blacklist_campaign_enabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }
              >
                {campaign.blacklist_campaign_enabled ? 'on' : 'off'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Global blacklist</span>
              <Badge
                variant="secondary"
                className={
                  campaign.blacklist_global_enabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }
              >
                {campaign.blacklist_global_enabled ? 'on' : 'off'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Cron</span>
            <span className="font-medium text-slate-900">{campaign.cron_add_count}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-violet-100 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(campaign.id, campaign.is_active)}
            className={`flex-1 min-w-0 h-7 px-2 text-xs [&_svg]:h-3.5 [&_svg]:w-3.5 ${
              campaign.is_active
                ? 'text-green-700 border-green-200 hover:bg-green-50'
                : 'text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="min-w-0 truncate flex items-center justify-center gap-1">
              {campaign.is_active ? (
                <>
                  <Power className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Active</span>
                </>
              ) : (
                <>
                  <PowerOff className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Inactive</span>
                </>
              )}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(campaign.id)}
            className="flex-1 min-w-0 h-7 px-2 text-xs [&_svg]:h-3.5 [&_svg]:w-3.5"
          >
            <span className="min-w-0 truncate flex items-center justify-center gap-1">
              <Eye className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">View Details</span>
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
