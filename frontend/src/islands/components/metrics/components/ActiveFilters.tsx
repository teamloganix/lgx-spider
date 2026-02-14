import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@islands/components/ui/badge';
import type { MetricsFilters } from '../../../../types/metrics';
import { MAX_VISIBLE } from '../utils/config';

interface ActiveFiltersProps {
  filters: MetricsFilters;
  onRemoveFilter: (_key: keyof MetricsFilters, _value?: string) => void;
  totalRecords: number;
}

function rangeText(
  range: { min?: number; max?: number } | undefined,
  label: string
): string | null {
  if (!range || (range.min == null && range.max == null)) return null;
  const { min, max } = range;
  if (min != null && max != null) return `${label}: ${min}-${max}`;
  if (min != null) return `${label}: ≥${min}`;
  if (max != null) return `${label}: ≤${max}`;
  return null;
}

export function ActiveFilters({ filters, onRemoveFilter, totalRecords }: ActiveFiltersProps) {
  const badges: React.ReactNode[] = [];

  (filters.campaign ?? []).forEach(c => {
    badges.push(
      <Badge key={`campaign-${c}`} variant="secondary" className="gap-1">
        Campaign: {c}
        <button
          type="button"
          className="ml-1 hover:text-red-500 focus:outline-none cursor-pointer"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onRemoveFilter('campaign', c);
          }}
          aria-label={`Remove campaign ${c}`}
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  });

  (filters.status ?? []).forEach(s => {
    badges.push(
      <Badge key={`status-${s}`} variant="secondary" className="gap-1">
        Status: {s}
        <button
          type="button"
          className="ml-1 hover:text-red-500 focus:outline-none cursor-pointer"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onRemoveFilter('status', s);
          }}
          aria-label={`Remove status ${s}`}
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  });

  const drText = rangeText(filters.dr, 'DR');
  if (drText) {
    badges.push(
      <Badge key="dr" variant="secondary" className="gap-1">
        {drText}
        <button
          type="button"
          className="ml-1 hover:text-red-500 focus:outline-none cursor-pointer"
          onClick={() => onRemoveFilter('dr')}
          aria-label="Remove DR filter"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  }

  const rangeKeys: { key: keyof MetricsFilters; label: string }[] = [
    { key: 'org_traffic', label: 'Org Traffic' },
    { key: 'org_keywords', label: 'Org Keywords' },
    { key: 'org_cost', label: 'Org Cost' },
    { key: 'paid_traffic', label: 'Paid Traffic' },
    { key: 'paid_keywords', label: 'Paid Keywords' },
    { key: 'paid_cost', label: 'Paid Cost' },
    { key: 'top_traffic', label: 'Top Traffic' },
  ];
  rangeKeys.forEach(({ key, label }) => {
    const val = filters[key] as { min?: number; max?: number } | undefined;
    const text = rangeText(val, label);
    if (text) {
      badges.push(
        <Badge key={key} variant="secondary" className="gap-1">
          {text}
          <button
            type="button"
            className="ml-1 hover:text-red-500 focus:outline-none cursor-pointer"
            onClick={() => onRemoveFilter(key)}
            aria-label={`Remove ${label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      );
    }
  });

  (filters.top_country ?? []).forEach(c => {
    badges.push(
      <Badge key={`top_country-${c}`} variant="secondary" className="gap-1">
        Top Country: {c}
        <button
          type="button"
          className="ml-1 hover:text-red-500 focus:outline-none cursor-pointer"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onRemoveFilter('top_country', c);
          }}
          aria-label={`Remove top country ${c}`}
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  });

  if (filters.error && filters.error !== 'any') {
    const label = filters.error === 'with' ? 'With error' : 'Without error';
    badges.push(
      <Badge key="error" variant="secondary" className="gap-1">
        Error: {label}
        <button
          type="button"
          className="ml-1 hover:text-red-500 focus:outline-none cursor-pointer"
          onClick={() => onRemoveFilter('error')}
          aria-label="Remove error filter"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
        Metrics found: {totalRecords} of {MAX_VISIBLE}
      </span>
      {badges.length > 0 && (
        <>
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {badges}
        </>
      )}
    </div>
  );
}
