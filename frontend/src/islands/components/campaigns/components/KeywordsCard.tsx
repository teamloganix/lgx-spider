import React, { useState, useMemo } from 'react';
import { Edit3, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';

interface KeywordsCardProps {
  keywords: string;
  onUpdate: (_keywords: string) => Promise<boolean>;
  disabled?: boolean;
}

export function KeywordsCard({ keywords, onUpdate, disabled = false }: KeywordsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedKeywords, setEditedKeywords] = useState(keywords);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    setEditedKeywords(keywords);
    setHasChanges(false);
  }, [keywords]);

  const keywordCount = useMemo(() => {
    if (!editedKeywords.trim()) return 0;
    return editedKeywords.split(',').filter(k => k.trim()).length;
  }, [editedKeywords]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onUpdate(editedKeywords.trim());
      if (success) {
        setIsEditing(false);
        setHasChanges(false);
        toast.success('Keywords updated successfully');
      } else {
        toast.error('Failed to update keywords');
      }
    } catch (err) {
      console.error('Error updating keywords:', err);
      toast.error('Failed to update keywords');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedKeywords);
      toast.success('Keywords copied to clipboard');
    } catch (err) {
      console.error('Error copying keywords:', err);
      toast.error('Failed to copy');
    }
  };

  const handleChange = (value: string) => {
    setEditedKeywords(value);
    setHasChanges(value.trim() !== keywords.trim());
  };

  return (
    <Card className="border border-violet-100 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-slate-600" />
            <CardTitle className="text-lg">Keywords</CardTitle>
          </div>
          {isEditing && (
            <div className="text-sm text-slate-600">
              {keywordCount} {keywordCount === 1 ? 'keyword' : 'keywords'}
            </div>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-1">Edit your campaign keywords</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={editedKeywords}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setIsEditing(true)}
          disabled={disabled || isSaving}
          placeholder="Enter keywords separated by commas"
          className="min-h-[350px] resize-y"
        />
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm text-slate-600">
            Total: {keywordCount} {keywordCount === 1 ? 'keyword' : 'keywords'}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCopy} disabled={disabled || isSaving}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving || disabled}
              className={
                'bg-gradient-to-r from-violet-600 to-indigo-600 ' +
                'hover:from-violet-700 hover:to-indigo-700'
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Update'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
