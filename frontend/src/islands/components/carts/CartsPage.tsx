import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useCarts } from '../../../hooks/useCarts';
import { ActionsBar } from './components/ActionsBar';
import { SearchBar } from './components/SearchBar';
import { CartsList } from './components/CartsList';
import { getDefaultColumns, DEFAULT_ORDER, type CartColumn } from './config';

const SEARCH_DEBOUNCE_MS = 500;

export function CartsPage() {
  const {
    items,
    loading,
    pagination,
    fetch,
    delete: deleteCarts,
    process: processCarts,
  } = useCarts();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [columns, setColumns] = useState<CartColumn[]>(() => getDefaultColumns());
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>({ key: 'similarity_score', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [processingMetrics, setProcessingMetrics] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchCarts = useCallback(() => {
    const order = sortConfig
      ? `${sortConfig.key},${sortConfig.direction.toUpperCase()}`
      : DEFAULT_ORDER;
    fetch({
      page: currentPage,
      page_size: pageSize,
      domain: debouncedSearch.trim() || undefined,
      order,
    });
  }, [fetch, currentPage, pageSize, debouncedSearch, sortConfig]);

  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [items]);

  const totalPages = pagination?.totalPages ?? 1;
  const totalCount = pagination?.totalRecords ?? items.length;

  const avgSimilarity =
    items.length > 0
      ? items.reduce((sum, i) => sum + (i.similarity_score ?? 0), 0) / items.length
      : null;

  const bestMatch = items.length > 0 ? Math.max(...items.map(i => i.similarity_score ?? 0)) : null;

  const allSelected = items.length > 0 && items.every(i => selectedIds.has(i.id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRemoveSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await deleteCarts(ids, {
      page: currentPage,
      page_size: pageSize,
      domain: debouncedSearch.trim() || undefined,
      order: sortConfig ? `${sortConfig.key},${sortConfig.direction.toUpperCase()}` : DEFAULT_ORDER,
    });
    setSelectedIds(new Set());
  };

  const handleClearCart = async () => {
    const ids = items.map(i => i.id);
    if (ids.length === 0) return;
    await deleteCarts(ids, {
      page: 1,
      page_size: pageSize,
      domain: debouncedSearch.trim() || undefined,
      order: sortConfig ? `${sortConfig.key},${sortConfig.direction.toUpperCase()}` : DEFAULT_ORDER,
    });
    setSelectedIds(new Set());
    setCurrentPage(1);
  };

  const handleProcessMetrics = async () => {
    if (processingMetrics) return;
    setProcessingMetrics(true);
    try {
      const res = await processCarts({
        page: 1,
        page_size: pageSize,
        domain: debouncedSearch.trim() || undefined,
        order: sortConfig
          ? `${sortConfig.key},${sortConfig.direction.toUpperCase()}`
          : DEFAULT_ORDER,
      });
      if (res?.inserted != null && res.inserted > 0) {
        toast.success(`Moved ${res.inserted} domains to prospecting.`);
      } else if (res?.inserted === 0) {
        toast.info('No domains were moved. All items may have been skipped.');
      } else {
        toast.error('Failed to process cart.');
      }
      setSelectedIds(new Set());
      setCurrentPage(1);
    } catch {
      toast.error('Failed to process cart.');
    } finally {
      setProcessingMetrics(false);
    }
  };

  const handleSort = (columnId: string) => {
    const dir = sortConfig?.key === columnId && sortConfig?.direction === 'desc' ? 'asc' : 'desc';
    setSortConfig({ key: columnId, direction: dir });
    setCurrentPage(1);
  };

  const handleDeleteItem = async (id: number) => {
    await deleteCarts([id], {
      page: currentPage,
      page_size: pageSize,
      domain: debouncedSearch.trim() || undefined,
      order: sortConfig ? `${sortConfig.key},${sortConfig.direction.toUpperCase()}` : DEFAULT_ORDER,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <ActionsBar
        allSelected={allSelected}
        selectedCount={selectedIds.size}
        totalCount={totalCount}
        onSelectAll={handleSelectAll}
        onRemoveSelected={handleRemoveSelected}
        onClearCart={handleClearCart}
        onProcessMetrics={handleProcessMetrics}
        avgSimilarity={avgSimilarity}
        bestMatch={bestMatch}
        loading={loading}
        processMetricsDisabled={totalCount === 0 || processingMetrics}
      />
      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <CartsList
        items={items}
        columns={columns}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onColumnsChange={setColumns}
        onSort={handleSort}
        sortConfig={sortConfig}
        onDeleteItem={handleDeleteItem}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
        }}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
      />
    </div>
  );
}
