import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@islands/components/ui/dialog';
import { Button } from '@islands/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface BlacklistConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedCount: number;
  onConfirm: () => void;
  loading: boolean;
}

export function BlacklistConfirmModal({
  isOpen,
  onClose,
  completedCount,
  onConfirm,
  loading,
}: BlacklistConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle className="text-slate-900 text-left">
              Blacklist processed domains?
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-2 px-1">
          <p className="text-sm text-slate-700">
            Are you sure you want to blacklist all <strong>{completedCount}</strong> processed
            domains?
          </p>
          <p className="text-sm text-slate-500">
            This will add them to the global blacklist and remove them from this view permanently.
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onConfirm} disabled={loading}>
            {loading ? 'Blacklisting...' : 'Confirm'}
          </Button>
          <Button
            size="sm"
            className="bg-violet-600 hover:bg-violet-700"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
