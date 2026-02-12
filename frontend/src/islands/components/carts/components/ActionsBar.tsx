import React, { useState } from 'react';
import { Button } from '@islands/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@islands/components/ui/dialog';
import { Trash2, BarChart3 } from 'lucide-react';

interface ActionsBarProps {
  allSelected: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onRemoveSelected: () => void;
  onClearCart: () => void;
  onProcessMetrics: () => void;
  avgSimilarity: number | null;
  bestMatch: number | null;
  loading: boolean;
  processMetricsDisabled?: boolean;
}

export function ActionsBar({
  allSelected,
  selectedCount,
  totalCount,
  onSelectAll,
  onRemoveSelected,
  onClearCart,
  onProcessMetrics,
  avgSimilarity,
  bestMatch,
  loading,
  processMetricsDisabled = false,
}: ActionsBarProps) {
  const [removeSelectedOpen, setRemoveSelectedOpen] = useState(false);
  const [clearCartOpen, setClearCartOpen] = useState(false);
  const [processMetricsOpen, setProcessMetricsOpen] = useState(false);

  const handleRemoveSelected = () => {
    setRemoveSelectedOpen(false);
    onRemoveSelected();
  };

  const handleClearCart = () => {
    setClearCartOpen(false);
    onClearCart();
  };

  const handleProcessMetricsConfirm = () => {
    setProcessMetricsOpen(false);
    onProcessMetrics();
  };

  return (
    <>
      <div
        className={
          'flex flex-col sm:flex-row items-start sm:items-center ' +
          'justify-between gap-4 bg-white border border-violet-100 rounded-lg p-4 shadow-sm'
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-violet-200 hover:bg-violet-50"
            onClick={onSelectAll}
          >
            {allSelected ? 'Unselect All' : 'Select All'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-violet-200 hover:bg-violet-50"
            onClick={() => setRemoveSelectedOpen(true)}
            disabled={selectedCount === 0 || loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-violet-200 hover:bg-violet-50"
            onClick={() => setClearCartOpen(true)}
            disabled={totalCount === 0 || loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-violet-200 hover:bg-violet-50"
            onClick={() => setProcessMetricsOpen(true)}
            disabled={processMetricsDisabled || loading}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Process Metrics
          </Button>
        </div>
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <span>
            Avg Similarity:{' '}
            <strong>{avgSimilarity != null ? avgSimilarity.toFixed(1) : '—'}</strong>
          </span>
          <span>
            Best Match: <strong>{bestMatch != null ? bestMatch.toFixed(1) : '—'}</strong>
          </span>
        </div>
      </div>

      <Dialog open={removeSelectedOpen} onOpenChange={setRemoveSelectedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Selected Items</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedCount} item(s) from the cart?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveSelectedOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveSelected}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clearCartOpen} onOpenChange={setClearCartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Cart</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove all items from the cart?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearCartOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearCart}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={processMetricsOpen} onOpenChange={setProcessMetricsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Metrics</DialogTitle>
            <DialogDescription>
              Process all domains in cart? This will move them to prospecting and clear the cart.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessMetricsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessMetricsConfirm}>Process</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
