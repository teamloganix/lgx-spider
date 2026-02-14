import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Copy, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@islands/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@islands/components/ui/card';
import { Input } from '@islands/components/ui/input';
import { Textarea } from '@islands/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@islands/components/ui/dialog';
import { useEmailById } from '../../../hooks/useEmails';
import type { EmailAnalysisJson } from '../../../types/emails';
import { DEFAULT_EMAIL_PROMPT } from './utils/constants';

function parseGeneratedEmail(raw: string): { subject: string; body: string } {
  const text = raw?.trim() ?? '';
  const subjectMatch = text.match(/^SUBJECT:\s*(.+?)(?=\n|$)/im);
  const subject = subjectMatch?.[1]?.trim() ?? '';
  const bodyMatch = text.match(/BODY:\s*([\s\S]*)/im);
  const body = bodyMatch?.[1]?.trim() ?? '';
  return {
    subject: subject || (text.split(/\r?\n/)[0] ?? '').replace(/^SUBJECT:\s*/i, '').trim(),
    body: body || (subject ? '' : text.trim()),
  };
}

function toGeneratedEmailFormat(subject: string, body: string): string {
  return `SUBJECT: ${subject}\n\nBODY:\n${body}`.trim();
}

function buildPreviewLines(
  domain: string,
  campaignName: string,
  analysis: EmailAnalysisJson
): { label: string; value: string }[] {
  const linkValue =
    analysis.overall_link_value != null ? String(analysis.overall_link_value) : 'N/A';
  const verdict = analysis.link_building_recommendation?.verdict ?? 'N/A';
  const guestPosts = analysis.guest_post_analysis?.accepts_guest_posts ?? 'Unknown';
  const emails = analysis.contact_availability?.emails_found?.actual_emails ?? [];
  const contactEmails =
    emails.length === 0
      ? 'None found'
      : emails.length <= 2
        ? emails.join(', ')
        : `${emails.slice(0, 2).join(', ')} +${emails.length - 2} more`;
  const businessType = analysis.domain_analysis?.content_type ?? 'N/A';
  const primaryNiche = analysis.domain_analysis?.primary_niche ?? 'N/A';

  return [
    { label: 'Domain', value: domain },
    { label: 'Campaign', value: campaignName },
    { label: 'Link Value', value: linkValue },
    { label: 'Verdict', value: verdict },
    { label: 'Guest Posts', value: guestPosts },
    { label: 'Contact Emails', value: contactEmails },
    { label: 'Business Type', value: businessType },
    { label: 'Primary Niche', value: primaryNiche },
  ];
}

interface EmailGeneratePageProps {
  emailId: number;
}

export function EmailGeneratePage({ emailId }: EmailGeneratePageProps) {
  const {
    data,
    loading,
    error,
    generateLoading,
    savePromptLoading,
    saveEmailLoading,
    fetchEmailById,
    generateEmail,
    saveGeneration,
  } = useEmailById();

  const [prompt, setPrompt] = useState(DEFAULT_EMAIL_PROMPT);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [lastSavedEmailContent, setLastSavedEmailContent] = useState('');
  const [lastSavedPrompt, setLastSavedPrompt] = useState('');
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [resetPromptConfirmOpen, setResetPromptConfirmOpen] = useState(false);
  const [pendingGenerate, setPendingGenerate] = useState(false);
  const skipNextSyncFromDataRef = useRef(false);

  useEffect(() => {
    fetchEmailById(emailId);
  }, [emailId, fetchEmailById]);

  useEffect(() => {
    if (skipNextSyncFromDataRef.current) {
      skipNextSyncFromDataRef.current = false;
      return;
    }
    const hasGeneratedEmail = data?.generated_email != null && data.generated_email.trim() !== '';
    const savedPrompt =
      data?.prompt_used != null && data.prompt_used.trim() !== ''
        ? data.prompt_used
        : DEFAULT_EMAIL_PROMPT;

    if (hasGeneratedEmail) {
      const { subject: s, body: b } = parseGeneratedEmail(data!.generated_email!);
      setSubject(s);
      setBody(b);
      setLastSavedEmailContent(toGeneratedEmailFormat(s, b));
      setLastSavedPrompt(savedPrompt);
      setPrompt(savedPrompt);
    } else {
      setSubject('');
      setBody('');
      setLastSavedEmailContent('');
      setLastSavedPrompt(savedPrompt);
      setPrompt(savedPrompt);
    }
  }, [data?.generated_email, data?.prompt_used]);

  const handleBack = useCallback(() => {
    const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '') || '';
    window.location.href = `${base}/emails`;
  }, []);

  const doGenerate = useCallback(async () => {
    if (!data) return;
    setReplaceConfirmOpen(false);
    setPendingGenerate(false);
    const hasExisting = data.generated_email != null && data.generated_email.trim() !== '';
    if (hasExisting) {
      await saveGeneration(data.id, { prompt_used: prompt });
    }
    const analysis =
      data.analysis_json && typeof data.analysis_json === 'object'
        ? (data.analysis_json as Record<string, unknown>)
        : {};
    const res = await generateEmail(data.id, { prompt, analysis });
    if (res?.success && res?.email) {
      const { subject: s, body: b } = parseGeneratedEmail(res.email);
      const newContent = toGeneratedEmailFormat(s, b);
      setSubject(s);
      setBody(b);
      setLastSavedEmailContent(newContent);
      setLastSavedPrompt(prompt);
      skipNextSyncFromDataRef.current = true;
      toast.success('Email generated');
    } else {
      toast.error('Failed to generate email');
    }
  }, [data, prompt, generateEmail, saveGeneration]);

  const handleGenerate = useCallback(async () => {
    if (!data) return;
    const hasExisting = data.generated_email != null && data.generated_email.trim() !== '';
    if (hasExisting) {
      setPendingGenerate(true);
      setReplaceConfirmOpen(true);
      return;
    }
    await doGenerate();
  }, [data, doGenerate]);

  const handleSavePrompt = useCallback(async () => {
    if (!data) return;
    const ok = await saveGeneration(data.id, { prompt_used: prompt });
    if (ok) {
      setLastSavedPrompt(prompt);
      toast.success('Prompt saved');
    } else {
      toast.error('Failed to save prompt');
    }
  }, [data, prompt, saveGeneration]);

  const handleResetPrompt = useCallback(() => {
    setPrompt(DEFAULT_EMAIL_PROMPT);
    setResetPromptConfirmOpen(false);
    toast.success('Prompt reset to default');
  }, []);

  const handleSaveEmail = useCallback(async () => {
    if (!data) return;
    const full = toGeneratedEmailFormat(subject, body);
    const ok = await saveGeneration(data.id, { generated_email: full });
    if (ok) {
      setLastSavedEmailContent(full);
      toast.success('Email saved');
    } else {
      toast.error('Failed to save email');
    }
  }, [data, subject, body, saveGeneration]);

  const currentEmailContent = toGeneratedEmailFormat(subject, body);
  const hasEmailChanged = currentEmailContent !== lastSavedEmailContent;
  const hasPromptChanged = prompt !== lastSavedPrompt;
  const hasGenerationRow = lastSavedEmailContent !== '';
  const canSavePrompt = hasPromptChanged;
  const canSaveEmail = hasGenerationRow && hasEmailChanged;

  const copySubject = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(subject);
      toast.success('Subject copied');
    } catch {
      toast.error('Failed to copy');
    }
  }, [subject]);

  const copyBody = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(body);
      toast.success('Body copied');
    } catch {
      toast.error('Failed to copy');
    }
  }, [body]);

  const copyFullEmail = useCallback(async () => {
    const full = toGeneratedEmailFormat(subject, body);
    try {
      await navigator.clipboard.writeText(full);
      toast.success('Email copied');
    } catch {
      toast.error('Failed to copy');
    }
  }, [subject, body]);

  const copyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success('Prompt copied');
    } catch {
      toast.error('Failed to copy');
    }
  }, [prompt]);

  if (loading || (!data && !error)) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[280px]">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
          <p className="text-sm font-medium">Loading email...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
            aria-label="Back to email list"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-semibold text-slate-900">Generate Outreach Email</h1>
        </div>
        <p className="text-red-600">{error ?? 'Email not found'}</p>
      </div>
    );
  }

  const previewLines = buildPreviewLines(data.domain, data.campaign_name, data.analysis_json);
  const isGenerateDisabled = generateLoading;
  const showBlock3 = generateLoading || subject.trim() !== '' || body.trim() !== '';

  return (
    <div className="p-6 space-y-6">
      <Dialog open={replaceConfirmOpen} onOpenChange={setReplaceConfirmOpen}>
        <DialogContent
          onPointerDownOutside={e => pendingGenerate && e.preventDefault()}
          onEscapeKeyDown={e => pendingGenerate && e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Replace existing email?</DialogTitle>
            <DialogDescription>
              This email already has generated content. Generating again will replace it. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplaceConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doGenerate} disabled={generateLoading}>
              {generateLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Replace & Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetPromptConfirmOpen} onOpenChange={setResetPromptConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset prompt?</DialogTitle>
            <DialogDescription>
              This will replace the current prompt with the default template. Your changes will be
              lost and will not be saved; the default template will not be saved either. You can
              recover the previously saved content by reloading the page. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPromptConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPrompt} className="bg-violet-600 hover:bg-violet-700">
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
            aria-label="Back to email list"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-semibold text-slate-900">
            Generate Outreach Email:{' '}
            <span className="no-underline hover:no-underline">{data.domain}</span>
          </h1>
        </div>
      </div>

      {/* Block 1 & 2 side by side – AI Prompt gets more width */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6">
        <Card className="border border-violet-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">AI Prompt</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={copyPrompt}
                aria-label="Copy prompt"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => setResetPromptConfirmOpen(true)}
                className="shrink-0"
              >
                <RotateCcw className="h-4 w-4 mr-0.5" />
                Reset prompt
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {generateLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-0.5" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-0.5" />
                )}
                Generate Email
              </Button>
              <Button
                size="default"
                onClick={handleSavePrompt}
                disabled={savePromptLoading || !canSavePrompt}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {savePromptLoading && <Loader2 className="h-4 w-4 animate-spin mr-0.5" />}
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Enter your prompt..."
              className="min-h-[420px] resize-y font-mono text-sm"
            />
          </CardContent>
        </Card>

        <Card className="border border-violet-100 shadow-sm h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Analysis Data Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <ul className="space-y-2 text-sm">
              {previewLines.map(({ label, value }) => (
                <li key={label} className="flex flex-wrap gap-x-2">
                  <span className="font-medium text-slate-600">{label}:</span>
                  <span className="text-slate-900 break-words">{value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Block 3 – only when there is generated content or we are generating */}
      {showBlock3 && (
        <Card className="border border-violet-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Generated Email</CardTitle>
              {!generateLoading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={copyFullEmail}
                  aria-label="Copy email"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {generateLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Loader2 className="h-10 w-10 animate-spin text-violet-600 mb-4" />
                <p className="font-medium">Generating Personalized Email</p>
                <p className="text-sm mt-1">
                  AI is analyzing the data and crafting your outreach email...
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">Subject</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={copySubject}
                      aria-label="Copy subject"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Subject line"
                    className="font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">Body</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={copyBody}
                      aria-label="Copy body"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Email body"
                    className="min-h-[360px] resize-y"
                  />
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleGenerate}
                    disabled={isGenerateDisabled}
                  >
                    {generateLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-0.5" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-0.5" />
                    )}
                    Generate Another
                  </Button>
                  <Button
                    size="default"
                    onClick={handleSaveEmail}
                    disabled={saveEmailLoading || !canSaveEmail}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {saveEmailLoading && <Loader2 className="h-4 w-4 animate-spin mr-0.5" />}
                    Save
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
