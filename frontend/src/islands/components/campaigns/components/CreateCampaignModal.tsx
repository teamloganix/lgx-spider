import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Checkbox } from '../../ui/checkbox';
import { TooltipProvider } from '../../ui/tooltip';
import { createCampaign, campaignsError } from '../../../../stores/campaigns';
import type { CreateCampaignPayload } from '../../../../types/campaigns';

const NAME_MAX = 255;
const KEYWORDS_MAX = 2000;

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (_createdId: number) => void;
}

export function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [blacklistCampaign, setBlacklistCampaign] = useState(true);
  const [blacklistGlobal, setBlacklistGlobal] = useState(true);

  const [nameDirty, setNameDirty] = useState(false);
  const [keywordsDirty, setKeywordsDirty] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const validateName = useCallback((value: string) => {
    const t = value.trim();
    if (!t) return 'Campaign name is required';
    if (t.length > NAME_MAX) return `Maximum ${NAME_MAX} characters`;
    return null;
  }, []);

  const validateKeywords = useCallback((value: string) => {
    const t = value.trim();
    if (!t) return 'Keywords are required';
    if (t.length > KEYWORDS_MAX) return `Maximum ${KEYWORDS_MAX} characters`;
    return null;
  }, []);

  const showNameError = nameDirty || submitAttempted;
  const showKeywordsError = keywordsDirty || submitAttempted;
  const nameError = showNameError ? validateName(name) : null;
  const keywordsError = showKeywordsError ? validateKeywords(keywords) : null;

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setKeywords('');
      setIsActive(true);
      setBlacklistCampaign(true);
      setBlacklistGlobal(true);
      setNameDirty(false);
      setKeywordsDirty(false);
      setSubmitAttempted(false);
      setSubmitError(null);
    }
  }, [isOpen]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameDirty(true);
    setSubmitError(null);
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setKeywords(e.target.value);
    setKeywordsDirty(true);
    setSubmitError(null);
  };

  const isFormValid =
    !validateName(name) &&
    !validateKeywords(keywords) &&
    name.trim().length > 0 &&
    keywords.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitAttempted(true);
    const nErr = validateName(name);
    const kErr = validateKeywords(keywords);
    if (nErr || kErr) return;

    setIsCreating(true);
    try {
      const payload: CreateCampaignPayload = {
        name: name.trim(),
        original_keywords: keywords.trim(),
        is_active: isActive,
        blacklist_campaign_enabled: blacklistCampaign,
        blacklist_global_enabled: blacklistGlobal,
      };

      const created = await createCampaign(payload);

      if (created?.id != null) {
        toast.success('Campaign created successfully');
        onClose();
        onSuccess?.(created.id);
      } else {
        const err = campaignsError.get();
        setSubmitError(err || 'Failed to create campaign');
        toast.error(err || 'Failed to create campaign');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create campaign';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Add a new campaign with keywords; AI will expand them for prospecting.
          </DialogDescription>
        </DialogHeader>

        <TooltipProvider>
          <form
            id="create-campaign-form"
            onSubmit={handleSubmit}
            className="px-6 pb-6 overflow-y-auto flex-1 min-h-0 space-y-4"
          >
            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {submitError}
              </p>
            )}

            <div className="space-y-2">
              <label htmlFor="create-campaign-name" className="text-sm font-medium text-slate-700">
                Campaign Name *
              </label>
              <Input
                id="create-campaign-name"
                type="text"
                placeholder="Your campaign name here."
                value={name}
                onChange={handleNameChange}
                maxLength={NAME_MAX + 1}
                autoFocus
                className={nameError ? 'border-red-300' : ''}
              />
              {nameError && <p className="text-sm text-red-600">{nameError}</p>}
              {!nameError && (
                <p className="text-xs text-slate-500">
                  {name.trim().length}/{NAME_MAX} characters
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="create-campaign-keywords"
                className="text-sm font-medium text-slate-700"
              >
                Keywords *
              </label>
              <Textarea
                id="create-campaign-keywords"
                placeholder={
                  'Enter keywords that describe your target websites, one per line:\n\n' +
                  'e-commerce fashion\nonline clothing store\nfashion retailer\n' +
                  "women's apparel\nsustainable fashion"
                }
                value={keywords}
                onChange={handleKeywordsChange}
                maxLength={KEYWORDS_MAX + 1}
                rows={6}
                className={`min-h-[120px] resize-y ${keywordsError ? 'border-red-300' : ''}`}
              />
              {keywordsError && <p className="text-sm text-red-600">{keywordsError}</p>}
              {!keywordsError && (
                <p className="text-xs text-slate-500">
                  Enter keywords that describe websites you want to find, one per line. AI will
                  expand these into ~100 related variations focused on tightly themed niches and
                  keyword intersections. {keywords.trim().length}/{KEYWORDS_MAX} characters
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:flex-nowrap md:gap-6">
              <Checkbox
                label="Set as active campaign"
                value={isActive}
                onValueChange={v => setIsActive(v === true)}
                tooltip={
                  'Only one campaign can be active at a time. ' +
                  'Active campaign is used for cart and prospecting.'
                }
              />
              <Checkbox
                label="Campaign blacklist"
                value={blacklistCampaign}
                onValueChange={v => setBlacklistCampaign(v === true)}
                tooltip="Filter out domains already prospected in this campaign"
              />
              <Checkbox
                label="Global blacklist"
                value={blacklistGlobal}
                onValueChange={v => setBlacklistGlobal(v === true)}
                tooltip="Filter out domains already prospected in any campaign"
              />
            </div>
          </form>
        </TooltipProvider>

        <div className="px-6 pb-6 pt-4 border-t shrink-0 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-campaign-form"
            className={
              'bg-gradient-to-r from-violet-600 to-indigo-600 ' +
              'hover:from-violet-700 hover:to-indigo-700'
            }
            disabled={!isFormValid || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Campaign'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
