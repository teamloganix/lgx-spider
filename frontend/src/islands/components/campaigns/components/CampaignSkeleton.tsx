import React from 'react';
import { Card, CardContent, CardHeader } from '@islands/components/ui/card';

export function CampaignSkeleton() {
  return (
    <Card className="h-full flex flex-col border border-violet-100">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
        <div className="flex gap-1.5 mt-2">
          <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-0">
        <div className="space-y-3 flex-1">
          <div className="space-y-1.5">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-violet-100">
          <div className="h-9 bg-gray-200 rounded flex-1 animate-pulse" />
          <div className="h-9 bg-gray-200 rounded flex-1 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function CampaignsListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <CampaignSkeleton key={index} />
      ))}
    </div>
  );
}
