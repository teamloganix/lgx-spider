import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@islands/components/ui/dialog';
import { Button } from '@islands/components/ui/button';
import { SelectDropdown } from '@islands/components/ui/select-dropdown/select-dropdown';
import { SelectMinMax } from '@islands/components/ui/select-min-max/select-min-max';
import type { MetricsFilters, MetricsFilterOptions } from '../../../../types/metrics';

const ERROR_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'with', label: 'With error' },
  { value: 'without', label: 'Without error' },
];

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MetricsFilters;
  onApplyFilters: (_filters: MetricsFilters) => void;
  filterOptions: MetricsFilterOptions | null;
}

export function FilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  filterOptions,
}: FilterModalProps) {
  const [local, setLocal] = useState<MetricsFilters>(filters);

  useEffect(() => {
    if (isOpen) setLocal(filters);
  }, [isOpen, filters]);

  const handleApply = () => {
    onApplyFilters(local);
    onClose();
  };

  const handleClear = () => {
    setLocal({});
  };

  const hasActiveFilters =
    (local.campaign?.length ?? 0) > 0 ||
    (local.status?.length ?? 0) > 0 ||
    local.dr != null ||
    local.org_traffic != null ||
    local.org_keywords != null ||
    local.org_cost != null ||
    local.paid_traffic != null ||
    local.paid_keywords != null ||
    local.paid_cost != null ||
    (local.top_country ?? []).length > 0 ||
    local.top_traffic != null ||
    (local.error != null && local.error !== 'any');

  const campaigns = filterOptions?.campaigns ?? [];
  const campaignOptions = campaigns.map(c => ({ value: c, label: c }));
  const statuses = filterOptions?.statuses ?? [];
  const statusOptions = statuses.map(s => ({
    value: s,
    label: s.charAt(0).toUpperCase() + s.slice(1),
  }));
  const topCountries = filterOptions?.top_countries ?? [];
  const topCountryOptions = topCountries.map(c => ({ value: c, label: c }));

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col p-0 overflow-hidden border-slate-200">
        <DialogHeader className="bg-background px-4 sm:px-6 pt-4 pb-2 sm:pt-6 shrink-0 rounded-t-lg">
          <DialogTitle className="text-slate-900 text-left">Filter metrics</DialogTitle>
          <p className="text-sm text-slate-500 font-normal text-left">
            Refine your search results using the filters below
          </p>
        </DialogHeader>

        <div className="px-4 sm:px-6 overflow-y-auto flex-1 min-h-0 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">Criteria</h3>
            <div className="flex flex-wrap gap-2">
              {campaignOptions.length > 0 && (
                <SelectDropdown
                  label="Campaigns"
                  options={campaignOptions}
                  value={local.campaign ?? []}
                  onValueChange={v =>
                    setLocal(prev => ({
                      ...prev,
                      campaign: v.length ? v : undefined,
                    }))
                  }
                  placeholder="Select"
                  showSearch
                />
              )}
              <SelectDropdown
                label="Status"
                options={statusOptions}
                value={local.status ?? []}
                onValueChange={v =>
                  setLocal(prev => ({
                    ...prev,
                    status: v.length ? v : undefined,
                  }))
                }
                placeholder="Select"
                showSearch={false}
              />
              <SelectDropdown
                label="Error"
                options={ERROR_OPTIONS}
                value={local.error ? [local.error] : []}
                onValueChange={v =>
                  setLocal(prev => ({
                    ...prev,
                    error: (v[0] as 'any' | 'with' | 'without') ?? undefined,
                  }))
                }
                placeholder="Any"
                showSearch={false}
                singleSelect
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">Domain & traffic</h3>
            <div className="flex flex-wrap gap-2">
              <SelectMinMax
                label="DR"
                value={local.dr}
                onValueChange={v => setLocal(prev => ({ ...prev, dr: v }))}
                maxInputMax={100}
              />
              <SelectMinMax
                label="Org Traffic"
                value={local.org_traffic}
                onValueChange={v => setLocal(prev => ({ ...prev, org_traffic: v }))}
              />
              <SelectMinMax
                label="Org Keywords"
                value={local.org_keywords}
                onValueChange={v => setLocal(prev => ({ ...prev, org_keywords: v }))}
              />
              <SelectMinMax
                label="Org Cost"
                value={local.org_cost}
                onValueChange={v => setLocal(prev => ({ ...prev, org_cost: v }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">Paid</h3>
            <div className="flex flex-wrap gap-2">
              <SelectMinMax
                label="Paid Traffic"
                value={local.paid_traffic}
                onValueChange={v => setLocal(prev => ({ ...prev, paid_traffic: v }))}
              />
              <SelectMinMax
                label="Paid Keywords"
                value={local.paid_keywords}
                onValueChange={v => setLocal(prev => ({ ...prev, paid_keywords: v }))}
              />
              <SelectMinMax
                label="Paid Cost"
                value={local.paid_cost}
                onValueChange={v => setLocal(prev => ({ ...prev, paid_cost: v }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">Top country</h3>
            <div className="flex flex-wrap gap-2">
              {topCountryOptions.length > 0 && (
                <SelectDropdown
                  label="Top Country"
                  options={topCountryOptions}
                  value={local.top_country ?? []}
                  onValueChange={v =>
                    setLocal(prev => ({
                      ...prev,
                      top_country: v.length ? v : undefined,
                    }))
                  }
                  placeholder="Select"
                  showSearch
                />
              )}
              <SelectMinMax
                label="Top Traffic"
                value={local.top_traffic}
                onValueChange={v => setLocal(prev => ({ ...prev, top_traffic: v }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter
          className={
            'mt-auto shrink-0 bg-background border-t ' +
            'px-4 sm:px-6 pt-3 sm:pt-4 pb-3 sm:pb-4 flex-row gap-2 justify-end rounded-b-lg'
          }
        >
          <Button
            variant="outline"
            size="sm"
            disabled={!hasActiveFilters}
            className="flex-initial w-auto"
            onClick={handleClear}
          >
            <X className="h-3 w-3 mr-1 text-red-400" />
            Clear All
          </Button>
          <Button
            size="sm"
            className="flex-initial w-auto bg-violet-600 hover:bg-violet-700"
            onClick={handleApply}
          >
            Apply filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
