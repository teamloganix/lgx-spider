import React from 'react';
import type { MetricsStats } from '../../../../types/metrics';

interface StatsRowProps {
  stats: MetricsStats | null;
}

export function StatsRow({ stats }: StatsRowProps) {
  if (!stats) {
    return (
      <div className="text-sm text-slate-500">Loading stats...</div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="font-medium text-slate-700">Total: {stats.total}</span>
      <span className="text-slate-400">|</span>
      <span className="text-amber-600 font-medium">Pending: {stats.pending}</span>
      <span className="text-slate-400">|</span>
      <span className="text-blue-600 font-medium">Processing: {stats.processing}</span>
      <span className="text-slate-400">|</span>
      <span className="text-green-600 font-medium">Completed: {stats.completed}</span>
      <span className="text-slate-400">|</span>
      <span className="text-red-600 font-medium">Failed: {stats.failed}</span>
    </div>
  );
}
