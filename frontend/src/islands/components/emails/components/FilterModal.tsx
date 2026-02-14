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
import type { EmailFilters, EmailFilterOptions } from '../../../../types/emails';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: EmailFilters;
  onApplyFilters: (_filters: EmailFilters) => void;
  filterOptions: EmailFilterOptions | null;
}

const VERDICT_OPTIONS = [
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REJECT', label: 'Reject' },
  { value: 'REVIEW', label: 'Review' },
];

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

const GUEST_POSTS_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' },
];

export function FilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  filterOptions,
}: FilterModalProps) {
  const [local, setLocal] = useState<EmailFilters>(filters);

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
    (local.verdict?.length ?? 0) > 0 ||
    (local.priority?.length ?? 0) > 0 ||
    (local.guest_posts?.length ?? 0) > 0 ||
    local.link_value != null ||
    local.traffic != null ||
    local.keywords != null ||
    local.domain_rating != null;

  const campaigns = filterOptions?.campaigns ?? [];
  const campaignOptions = campaigns.map(c => ({ value: c, label: c }));

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent
        className={'max-w-2xl max-h-[92vh] flex flex-col p-0 overflow-hidden border-slate-200'}
      >
        <DialogHeader
          className={'bg-background px-4 sm:px-6 pt-4 pb-2 sm:pt-6 shrink-0 rounded-t-lg'}
        >
          <DialogTitle className="text-slate-900 text-left">Filter emails</DialogTitle>
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
                  showSearch={true}
                />
              )}
              <SelectDropdown
                label="Verdict"
                options={VERDICT_OPTIONS}
                value={local.verdict ?? []}
                onValueChange={v =>
                  setLocal(prev => ({
                    ...prev,
                    verdict: v.length ? v : undefined,
                  }))
                }
                placeholder="Select"
                showSearch={false}
              />
              <SelectDropdown
                label="Priority"
                options={PRIORITY_OPTIONS}
                value={local.priority ?? []}
                onValueChange={v =>
                  setLocal(prev => ({
                    ...prev,
                    priority: v.length ? v : undefined,
                  }))
                }
                placeholder="Select"
                showSearch={false}
              />
              <SelectDropdown
                label="Guest posts"
                options={GUEST_POSTS_OPTIONS}
                value={local.guest_posts ?? []}
                onValueChange={v =>
                  setLocal(prev => ({
                    ...prev,
                    guest_posts: v.length ? v : undefined,
                  }))
                }
                placeholder="Select"
                showSearch={false}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">Link budget and placement</h3>
            <div className="flex flex-wrap gap-2">
              <SelectMinMax
                label="Link value"
                value={local.link_value}
                onValueChange={v => setLocal(prev => ({ ...prev, link_value: v }))}
              />
              <SelectMinMax
                label="Traffic"
                value={local.traffic}
                onValueChange={v => setLocal(prev => ({ ...prev, traffic: v }))}
              />
              <SelectMinMax
                label="Keywords"
                value={local.keywords}
                onValueChange={v => setLocal(prev => ({ ...prev, keywords: v }))}
              />
              <SelectMinMax
                label="DR"
                value={local.domain_rating}
                onValueChange={v => setLocal(prev => ({ ...prev, domain_rating: v }))}
                maxInputMax={100}
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
