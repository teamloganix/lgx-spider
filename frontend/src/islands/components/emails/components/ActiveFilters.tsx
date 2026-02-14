import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@islands/components/ui/badge';
import type { EmailFilters } from '../../../../types/emails';

interface ActiveFiltersProps {
  filters: EmailFilters;
  onRemoveFilter: (_key: keyof EmailFilters, _value?: string) => void;
  totalRecords: number;
  totalAvailable: number;
}

export function ActiveFilters({
  filters,
  onRemoveFilter,
  totalRecords,
  totalAvailable,
}: ActiveFiltersProps) {
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

  (filters.verdict ?? []).forEach(v => {
    badges.push(
      <Badge key={`verdict-${v}`} variant="secondary" className="gap-1">
        Verdict: {v}
        <button
          type="button"
          className="ml-1 hover:text-red-500 focus:outline-none cursor-pointer"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onRemoveFilter('verdict', v);
          }}
          aria-label={`Remove verdict ${v}`}
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  });

  (filters.priority ?? []).forEach(p => {
    badges.push(
      <Badge key={`priority-${p}`} variant="secondary" className="gap-1">
        Priority: {p}
        <button
          type="button"
          className="ml-1 hover:text-red-500 focus:outline-none cursor-pointer"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onRemoveFilter('priority', p);
          }}
          aria-label={`Remove priority ${p}`}
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  });

  (filters.guest_posts ?? []).forEach(g => {
    badges.push(
      <Badge key={`guest_posts-${g}`} variant="secondary" className="gap-1">
        Guest posts: {g}
        <button
          type="button"
          className="ml-1 hover:text-red-500 focus:outline-none cursor-pointer"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onRemoveFilter('guest_posts', g);
          }}
          aria-label={`Remove guest posts ${g}`}
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  });

  if (
    filters.link_value != null &&
    (filters.link_value.min != null || filters.link_value.max != null)
  ) {
    const { min, max } = filters.link_value;
    const text =
      min != null && max != null
        ? `Link value: ${min}-${max}`
        : min != null
          ? `Link value: ≥${min}`
          : `Link value: ≤${max}`;
    badges.push(
      <Badge key="link_value" variant="secondary" className="gap-1">
        {text}
        <button
          type="button"
          className="ml-1 hover:text-red-500 focus:outline-none cursor-pointer"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onRemoveFilter('link_value');
          }}
          aria-label="Remove link value filter"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  }

  if (filters.traffic != null && (filters.traffic.min != null || filters.traffic.max != null)) {
    const { min, max } = filters.traffic;
    const text =
      min != null && max != null
        ? `Traffic: ${min}-${max}`
        : min != null
          ? `Traffic: ≥${min}`
          : `Traffic: ≤${max}`;
    badges.push(
      <Badge key="traffic" variant="secondary" className="gap-1">
        {text}
        <button
          type="button"
          className="ml-1 hover:text-red-500 focus:outline-none cursor-pointer"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onRemoveFilter('traffic');
          }}
          aria-label="Remove traffic filter"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  }

  if (filters.keywords != null && (filters.keywords.min != null || filters.keywords.max != null)) {
    const { min, max } = filters.keywords;
    const text =
      min != null && max != null
        ? `Keywords: ${min}-${max}`
        : min != null
          ? `Keywords: ≥${min}`
          : `Keywords: ≤${max}`;
    badges.push(
      <Badge key="keywords" variant="secondary" className="gap-1">
        {text}
        <button
          type="button"
          className="ml-1 hover:text-red-500 focus:outline-none cursor-pointer"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onRemoveFilter('keywords');
          }}
          aria-label="Remove keywords filter"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  }

  if (
    filters.domain_rating != null &&
    (filters.domain_rating.min != null || filters.domain_rating.max != null)
  ) {
    const { min, max } = filters.domain_rating;
    const text =
      min != null && max != null
        ? `DR: ${min}-${max}`
        : min != null
          ? `DR: ≥${min}`
          : `DR: ≤${max}`;
    badges.push(
      <Badge key="domain_rating" variant="secondary" className="gap-1">
        {text}
        <button
          type="button"
          className="ml-1 hover:text-red-500 focus:outline-none cursor-pointer"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onRemoveFilter('domain_rating');
          }}
          aria-label="Remove DR filter"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
        Emails found: {totalRecords} of {totalAvailable}
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
