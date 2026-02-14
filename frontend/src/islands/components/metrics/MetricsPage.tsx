import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useMetrics } from '../../../hooks/useMetrics';
import {
  fetchMetricsFilterOptionsApi,
  fetchMetricsStatsApi,
  fetchProcessingPausedApi,
  toggleProcessingApi,
  blacklistProcessedApi,
  fetchMetricsListApi,
} from '../../../utils/metrics-api';
import type {
  FetchMetricsParams,
  MetricsFilters,
  MetricsFilterOptions,
  MetricsStats,
  MetricsListItem,
} from '../../../types/metrics';
import {
  getDefaultMetricsColumns,
  DEFAULT_ORDER,
  ORDER_FIELD_MAP,
  MAX_VISIBLE,
} from './utils/config';
import type { MetricsColumnConfig } from './utils/config';
import {
  getFiltersFromUrl,
  getListParamsFromUrl,
  updateUrlWithFilters,
} from '../../../utils/metrics-url';
import { ControlsBar } from './components/ControlsBar';
import { MetricsTable } from './components/MetricsTable';
import { FilterModal } from './components/FilterModal';
import { ActiveFilters } from './components/ActiveFilters';
import { StatsRow } from './components/StatsRow';
import { BlacklistConfirmModal } from './components/BlacklistConfirmModal';

const DEBOUNCE_MS = 500;

function parseOrder(order: string): { field: string; dir: 'ASC' | 'DESC' } {
  const [field, dir] = order.split(',');
  return {
    field: field ?? 'domain_rating',
    dir: (dir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC',
  };
}

function filtersToApiParams(filters: MetricsFilters): Partial<FetchMetricsParams> {
  const out: Partial<FetchMetricsParams> = {};
  if ((filters.campaign ?? []).length) out.campaign = filters.campaign;
  if ((filters.status ?? []).length) out.status = filters.status;
  if (filters.dr != null) {
    const { min, max } = filters.dr;
    if (min != null && max != null) out.dr = `${min},${max}`;
    else if (min != null) out.dr = `${min},100`;
    else if (max != null) out.dr = `0,${max}`;
  }
  if (filters.org_traffic != null) {
    const { min, max } = filters.org_traffic;
    if (min != null && max != null) out.org_traffic = `${min},${max}`;
    else if (min != null) out.org_traffic = `${min},999999999`;
    else if (max != null) out.org_traffic = `0,${max}`;
  }
  if (filters.org_keywords != null) {
    const { min, max } = filters.org_keywords;
    if (min != null && max != null) out.org_keywords = `${min},${max}`;
    else if (min != null) out.org_keywords = `${min},999999999`;
    else if (max != null) out.org_keywords = `0,${max}`;
  }
  if (filters.org_cost != null) {
    const { min, max } = filters.org_cost;
    if (min != null && max != null) out.org_cost = `${min},${max}`;
    else if (min != null) out.org_cost = `${min},999999999`;
    else if (max != null) out.org_cost = `0,${max}`;
  }
  if (filters.paid_traffic != null) {
    const { min, max } = filters.paid_traffic;
    if (min != null && max != null) out.paid_traffic = `${min},${max}`;
    else if (min != null) out.paid_traffic = `${min},999999999`;
    else if (max != null) out.paid_traffic = `0,${max}`;
  }
  if (filters.paid_keywords != null) {
    const { min, max } = filters.paid_keywords;
    if (min != null && max != null) out.paid_keywords = `${min},${max}`;
    else if (min != null) out.paid_keywords = `${min},999999999`;
    else if (max != null) out.paid_keywords = `0,${max}`;
  }
  if (filters.paid_cost != null) {
    const { min, max } = filters.paid_cost;
    if (min != null && max != null) out.paid_cost = `${min},${max}`;
    else if (min != null) out.paid_cost = `${min},999999999`;
    else if (max != null) out.paid_cost = `0,${max}`;
  }
  if ((filters.top_country ?? []).length) out.top_country = filters.top_country;
  if (filters.top_traffic != null) {
    const { min, max } = filters.top_traffic;
    if (min != null && max != null) out.top_traffic = `${min},${max}`;
    else if (min != null) out.top_traffic = `${min},999999999`;
    else if (max != null) out.top_traffic = `0,${max}`;
  }
  if (filters.error && filters.error !== 'any') {
    out.error = filters.error === 'with' ? 'true' : 'false';
  }
  return out;
}

function buildCsv(items: MetricsListItem[]): string {
  const headers = [
    'id',
    'domain',
    'campaign_name',
    'domain_rating',
    'org_traffic',
    'org_keywords',
    'org_cost',
    'paid_traffic',
    'paid_keywords',
    'paid_cost',
    'top_country',
    'top_traffic',
    'processing_status',
    'created_at',
    'updated_at',
    'error_message',
  ];
  const escape = (v: string | number | null) => {
    if (v == null) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n'))
      return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const rows = items.map(row =>
    headers
      .map(h => escape((row as Record<string, unknown>)[h] as string | number | null))
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export function MetricsPage() {
  const { items, loading, pagination, fetch: fetchMetrics } = useMetrics();

  const [filters, setFilters] = useState<MetricsFilters>(() =>
    typeof window !== 'undefined' ? getFiltersFromUrl() : {}
  );
  const [search, setSearch] = useState(() =>
    typeof window !== 'undefined' ? getListParamsFromUrl().search : ''
  );
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [order, setOrder] = useState(() =>
    typeof window !== 'undefined' ? getListParamsFromUrl().order : DEFAULT_ORDER
  );
  const [currentPage, setCurrentPage] = useState(() =>
    typeof window !== 'undefined' ? getListParamsFromUrl().page : 1
  );
  const [pageSize, setPageSize] = useState(() =>
    typeof window !== 'undefined' ? getListParamsFromUrl().page_size : 25
  );
  const [columns, setColumns] = useState<MetricsColumnConfig[]>(() =>
    getDefaultMetricsColumns()
  );
  const [filterOptions, setFilterOptions] = useState<MetricsFilterOptions | null>(null);
  const [stats, setStats] = useState<MetricsStats | null>(null);
  const [paused, setPaused] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);
  const [blacklistLoading, setBlacklistLoading] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [completedItems, setCompletedItems] = useState<Array<{ id: number; domain: string }>>([]);

  const { field: sortField, dir: sortDir } = parseOrder(order);

  useEffect(() => {
    fetchMetricsFilterOptionsApi().then(res => {
      if (res?.success && res?.data) setFilterOptions(res.data);
    });
    fetchMetricsStatsApi().then(res => {
      if (res?.success && res?.data) setStats(res.data);
    });
    fetchProcessingPausedApi().then(res => {
      if (res?.success && res?.paused != null) setPaused(res.paused);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    const apiFilters = filtersToApiParams(filters);
    const params: FetchMetricsParams = {
      page: currentPage,
      page_size: pageSize,
      order,
      search: debouncedSearch || undefined,
      ...apiFilters,
    };
    fetchMetrics(params);
  }, [currentPage, pageSize, order, debouncedSearch, filters, fetchMetrics]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    updateUrlWithFilters(filters, {
      page: currentPage,
      page_size: pageSize,
      order,
      search: debouncedSearch || '',
    });
  }, [filters, currentPage, pageSize, order, debouncedSearch]);

  useEffect(() => {
    const onPopState = () => {
      setFilters(getFiltersFromUrl());
      const list = getListParamsFromUrl();
      setCurrentPage(list.page);
      setPageSize(list.page_size);
      setOrder(list.order);
      setSearch(list.search);
      setDebouncedSearch(list.search);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleSort = useCallback((columnId: string) => {
    const field = ORDER_FIELD_MAP[columnId] ?? columnId;
    setOrder(prev => {
      const { field: f, dir } = parseOrder(prev);
      if (f === field) {
        return `${field},${dir === 'ASC' ? 'DESC' : 'ASC'}`;
      }
      return `${field},DESC`;
    });
    setCurrentPage(1);
  }, []);

  const handleToggleColumn = useCallback((columnId: string) => {
    setColumns(cols =>
      cols.map(c => (c.id === columnId ? { ...c, visible: !c.visible } : c))
    );
  }, []);

  const handleResetColumns = useCallback(() => {
    setColumns(getDefaultMetricsColumns());
  }, []);

  const handleApplyFilters = useCallback((newFilters: MetricsFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  }, []);

  const handleRemoveFilter = useCallback((key: keyof MetricsFilters, value?: string) => {
    setFilters(prev => {
      const next = { ...prev };
      if (
        key === 'campaign' ||
        key === 'status' ||
        key === 'top_country'
      ) {
        if (value != null) {
          const arr = (next[key] ?? []).filter(x => x !== value);
          if (arr.length) next[key] = arr;
          else delete next[key];
        } else {
          delete next[key];
        }
      } else {
        delete next[key];
      }
      return next;
    });
    setCurrentPage(1);
  }, []);

  const handleToggleProcessing = useCallback(async () => {
    setToggleLoading(true);
    try {
      const res = await toggleProcessingApi();
      if (res?.success && res?.paused != null) {
        setPaused(res.paused);
        toast.success(res.message ?? (res.paused ? 'Processing paused' : 'Processing resumed'));
      } else {
        toast.error('Failed to update processing state');
      }
    } catch {
      toast.error('Failed to update processing state');
    } finally {
      setToggleLoading(false);
    }
  }, []);

  const handleBlacklistClick = useCallback(async () => {
    const apiFilters = filtersToApiParams(filters);
    const params: FetchMetricsParams = {
      page: 1,
      page_size: MAX_VISIBLE,
      order: 'processing_status,ASC',
      search: debouncedSearch || undefined,
      status: ['completed'],
      ...apiFilters,
    };
    try {
      const res = await fetchMetricsListApi(params);
      if (res?.success && res?.data) {
        const list = res.data.items ?? [];
        setCompletedCount(list.length);
        setCompletedItems(list.map(r => ({ id: r.id, domain: r.domain })));
        setIsBlacklistModalOpen(true);
      } else {
        setCompletedCount(0);
        setCompletedItems([]);
        setIsBlacklistModalOpen(true);
      }
    } catch {
      toast.error('Failed to load completed domains');
    }
  }, [filters, debouncedSearch]);

  const handleBlacklistConfirm = useCallback(async () => {
    if (completedItems.length === 0) {
      setIsBlacklistModalOpen(false);
      return;
    }
    setBlacklistLoading(true);
    try {
      const res = await blacklistProcessedApi(completedItems);
      if (res?.success) {
        toast.success(res.message ?? 'Domains blacklisted successfully');
        setIsBlacklistModalOpen(false);
        setCompletedItems([]);
        setCompletedCount(0);
        setTimeout(() => {
          load();
          fetchMetricsStatsApi().then(r => {
            if (r?.success && r?.data) setStats(r.data);
          });
        }, 1500);
      } else {
        toast.error('Failed to blacklist domains');
      }
    } catch {
      toast.error('Failed to blacklist domains');
    } finally {
      setBlacklistLoading(false);
    }
  }, [completedItems, load]);

  const handleDownloadCsv = useCallback(() => {
    const csv = buildCsv(items);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  const pag = pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    pageSize: 25,
    totalAvailable: 0,
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50 min-h-screen p-6">
      <div className="max-w-[1600px] mx-auto space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Metrics</h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <StatsRow stats={stats} />
          <div className="flex flex-wrap gap-2 items-center min-w-0">
            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              totalRecords={pag.totalRecords}
            />
          </div>
        </div>

        <ControlsBar
          searchQuery={search}
          onSearchChange={setSearch}
          columns={columns}
          onToggleColumnVisibility={handleToggleColumn}
          onResetColumns={handleResetColumns}
          onOpenFilters={() => setIsFilterModalOpen(true)}
          onPauseResume={handleToggleProcessing}
          pauseResumeLabel={paused ? 'Resume Processing' : 'Pause Processing'}
          pauseResumeLoading={toggleLoading}
          paused={paused}
          onBlacklistProcessed={handleBlacklistClick}
          blacklistLoading={false}
        />

        <MetricsTable
          items={items}
          columns={columns}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          pagination={{
            currentPage: pag.currentPage,
            totalPages: pag.totalPages,
            pageSize: pag.pageSize,
          }}
          onPageSizeChange={size => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          onFirstPage={() => setCurrentPage(1)}
          onPreviousPage={() => setCurrentPage(p => Math.max(1, p - 1))}
          onNextPage={() => setCurrentPage(p => Math.min(pag.totalPages, p + 1))}
          onLastPage={() => setCurrentPage(pag.totalPages)}
          onDownloadCsv={handleDownloadCsv}
          loading={loading}
        />
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        filterOptions={filterOptions}
      />

      <BlacklistConfirmModal
        isOpen={isBlacklistModalOpen}
        onClose={() => {
          setIsBlacklistModalOpen(false);
          setCompletedItems([]);
          setCompletedCount(0);
        }}
        completedCount={completedCount}
        onConfirm={handleBlacklistConfirm}
        loading={blacklistLoading}
      />
    </div>
  );
}
