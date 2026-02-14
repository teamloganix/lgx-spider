import React, { useState, useEffect, useCallback } from 'react';
import { useEmails } from '../../../hooks/useEmails';
import { fetchEmailFilterOptionsApi } from '../../../utils/emails-api';
import type { FetchEmailsParams, EmailFilters, EmailFilterOptions } from '../../../types/emails';
import { getDefaultEmailColumns, DEFAULT_ORDER, ORDER_FIELD_MAP } from './utils/config';
import type { EmailColumnConfig } from './utils/config';
import { ControlsBar } from './components/ControlsBar';
import { EmailsTable } from './components/EmailsTable';
import { FilterModal } from './components/FilterModal';
import { ActiveFilters } from './components/ActiveFilters';
import {
  getFiltersFromUrl,
  getListParamsFromUrl,
  updateUrlWithFilters,
} from '../../../utils/emails-url';

const DEBOUNCE_MS = 500;

function parseOrder(order: string): { field: string; dir: 'ASC' | 'DESC' } {
  const [field, dir] = order.split(',');
  return {
    field: field ?? 'analyzed_at',
    dir: (dir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC',
  };
}

function filtersToApiParams(filters: EmailFilters): Partial<FetchEmailsParams> {
  const out: Partial<FetchEmailsParams> = {};
  if ((filters.campaign ?? []).length) out.campaign = filters.campaign;
  if ((filters.verdict ?? []).length) out.verdict = filters.verdict;
  if ((filters.priority ?? []).length) out.priority = filters.priority;
  if ((filters.guest_posts ?? []).length) out.guest_posts = filters.guest_posts;
  if (filters.link_value != null) {
    const { min, max } = filters.link_value;
    if (min != null && max != null) out.link_value = `${min},${max}`;
    else if (min != null) out.link_value = `${min},9999`;
    else if (max != null) out.link_value = `0,${max}`;
  }
  if (filters.traffic != null) {
    const { min, max } = filters.traffic;
    if (min != null && max != null) out.traffic = `${min},${max}`;
    else if (min != null) out.traffic = `${min},999999999`;
    else if (max != null) out.traffic = `0,${max}`;
  }
  if (filters.keywords != null) {
    const { min, max } = filters.keywords;
    if (min != null && max != null) out.keywords = `${min},${max}`;
    else if (min != null) out.keywords = `${min},999999999`;
    else if (max != null) out.keywords = `0,${max}`;
  }
  if (filters.domain_rating != null) {
    const { min, max } = filters.domain_rating;
    if (min != null && max != null) out.domain_rating = `${min},${max}`;
    else if (min != null) out.domain_rating = `${min},100`;
    else if (max != null) out.domain_rating = `0,${max}`;
  }
  return out;
}

export function EmailsPage() {
  const { items, loading, pagination, fetch: fetchEmails } = useEmails();

  const [filters, setFilters] = useState<EmailFilters>(() =>
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
  const [columns, setColumns] = useState<EmailColumnConfig[]>(() => getDefaultEmailColumns());
  const [filterOptions, setFilterOptions] = useState<EmailFilterOptions | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const { field: sortField, dir: sortDir } = parseOrder(order);

  useEffect(() => {
    fetchEmailFilterOptionsApi().then(res => {
      if (res?.success && res?.data) setFilterOptions(res.data);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    const apiFilters = filtersToApiParams(filters);
    const params: FetchEmailsParams = {
      page: currentPage,
      page_size: pageSize,
      order,
      search: debouncedSearch || undefined,
      ...apiFilters,
    };
    fetchEmails(params);
  }, [currentPage, pageSize, order, debouncedSearch, filters, fetchEmails]);

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
    setColumns(cols => cols.map(c => (c.id === columnId ? { ...c, visible: !c.visible } : c)));
  }, []);

  const handleResetColumns = useCallback(() => {
    setColumns(getDefaultEmailColumns());
  }, []);

  const handleApplyFilters = useCallback((newFilters: EmailFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  }, []);

  const handleRemoveFilter = useCallback((key: keyof EmailFilters, value?: string) => {
    setFilters(prev => {
      const next = { ...prev };
      if (key === 'campaign' || key === 'verdict' || key === 'priority' || key === 'guest_posts') {
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
        <h1 className="text-2xl font-semibold text-slate-900">Emails</h1>

        <ActiveFilters
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          totalRecords={pag.totalRecords}
          totalAvailable={pag.totalAvailable}
        />

        <ControlsBar
          searchQuery={search}
          onSearchChange={setSearch}
          columns={columns}
          onToggleColumnVisibility={handleToggleColumn}
          onResetColumns={handleResetColumns}
          onOpenFilters={() => setIsFilterModalOpen(true)}
        />

        <EmailsTable
          items={items}
          columns={columns}
          onColumnsChange={setColumns}
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
    </div>
  );
}
