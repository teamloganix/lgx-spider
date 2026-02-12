import React from 'react';
import { X, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';

interface NegativeKeywordsCardProps {
  keywords?: string;
  disabled?: boolean;
}

export function NegativeKeywordsCard({
  keywords = '',
  disabled: _disabled = false,
}: NegativeKeywordsCardProps) {
  const count = keywords.trim() ? keywords.split(',').filter(k => k.trim()).length : 0;

  return (
    <Card className="border border-violet-100 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <X className="h-4 w-4 text-slate-600" />
          <CardTitle className="text-lg">Negative Keywords</CardTitle>
        </div>
        <p className="text-sm text-slate-500 mt-1">Edit your negative keywords</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={keywords}
          disabled
          placeholder="Negative keywords functionality coming soon"
          className="min-h-[350px] resize-y opacity-60"
        />
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm text-slate-600 opacity-70">
            Total: {count} {count === 1 ? 'negative keyword' : 'negative keywords'}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled title="Not available yet">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button disabled title="Not available yet" className="opacity-60">
              Update
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
