import type { MetricsFilters } from '../types/metrics';

const LIST_PARAM_KEYS = ['page', 'page_size', 'order', 'search'] as const;

export function filtersToUrlParams(filters: MetricsFilters): URLSearchParams {
  const params = new URLSearchParams();
  (filters.campaign ?? []).forEach(c => params.append('campaign', c));
  (filters.status ?? []).forEach(s => params.append('status', s));
  if (filters.dr != null) {
    const { min, max } = filters.dr;
    if (min != null && max != null) params.set('dr', `${min},${max}`);
    else if (min != null) params.set('dr', String(min));
    else if (max != null) params.set('dr', `0,${max}`);
  }
  if (filters.org_traffic != null) {
    const { min, max } = filters.org_traffic;
    if (min != null && max != null) params.set('org_traffic', `${min},${max}`);
    else if (min != null) params.set('org_traffic', String(min));
    else if (max != null) params.set('org_traffic', `0,${max}`);
  }
  if (filters.org_keywords != null) {
    const { min, max } = filters.org_keywords;
    if (min != null && max != null) params.set('org_keywords', `${min},${max}`);
    else if (min != null) params.set('org_keywords', String(min));
    else if (max != null) params.set('org_keywords', `0,${max}`);
  }
  if (filters.org_cost != null) {
    const { min, max } = filters.org_cost;
    if (min != null && max != null) params.set('org_cost', `${min},${max}`);
    else if (min != null) params.set('org_cost', String(min));
    else if (max != null) params.set('org_cost', `0,${max}`);
  }
  if (filters.paid_traffic != null) {
    const { min, max } = filters.paid_traffic;
    if (min != null && max != null) params.set('paid_traffic', `${min},${max}`);
    else if (min != null) params.set('paid_traffic', String(min));
    else if (max != null) params.set('paid_traffic', `0,${max}`);
  }
  if (filters.paid_keywords != null) {
    const { min, max } = filters.paid_keywords;
    if (min != null && max != null) params.set('paid_keywords', `${min},${max}`);
    else if (min != null) params.set('paid_keywords', String(min));
    else if (max != null) params.set('paid_keywords', `0,${max}`);
  }
  if (filters.paid_cost != null) {
    const { min, max } = filters.paid_cost;
    if (min != null && max != null) params.set('paid_cost', `${min},${max}`);
    else if (min != null) params.set('paid_cost', String(min));
    else if (max != null) params.set('paid_cost', `0,${max}`);
  }
  (filters.top_country ?? []).forEach(c => params.append('top_country', c));
  if (filters.top_traffic != null) {
    const { min, max } = filters.top_traffic;
    if (min != null && max != null) params.set('top_traffic', `${min},${max}`);
    else if (min != null) params.set('top_traffic', String(min));
    else if (max != null) params.set('top_traffic', `0,${max}`);
  }
  if (filters.error && filters.error !== 'any') {
    params.set('error', filters.error === 'with' ? 'true' : 'false');
  }
  return params;
}

function parseRange(value: string): { min: number; max: number } | null {
  const parts = value
    .trim()
    .split(',')
    .map(p => parseFloat(p.trim()));
  if (parts.length >= 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
    return { min: parts[0], max: parts[1] };
  }
  if (parts.length === 1 && !Number.isNaN(parts[0])) {
    return { min: parts[0], max: parts[0] };
  }
  return null;
}

export function getFiltersFromUrl(search: string = ''): MetricsFilters {
  const searchString = typeof window !== 'undefined' && !search ? window.location.search : search;
  const params = new URLSearchParams(searchString);
  const filters: MetricsFilters = {};
  const campaigns = params.getAll('campaign').filter(Boolean);
  if (campaigns.length) filters.campaign = campaigns;
  const statuses = params.getAll('status').filter(Boolean);
  if (statuses.length) filters.status = statuses;
  const dr = params.get('dr');
  if (dr) {
    const range = parseRange(dr);
    if (range) filters.dr = range;
  }
  const orgTraffic = params.get('org_traffic');
  if (orgTraffic) {
    const range = parseRange(orgTraffic);
    if (range) filters.org_traffic = range;
  }
  const orgKeywords = params.get('org_keywords');
  if (orgKeywords) {
    const range = parseRange(orgKeywords);
    if (range) filters.org_keywords = range;
  }
  const orgCost = params.get('org_cost');
  if (orgCost) {
    const range = parseRange(orgCost);
    if (range) filters.org_cost = range;
  }
  const paidTraffic = params.get('paid_traffic');
  if (paidTraffic) {
    const range = parseRange(paidTraffic);
    if (range) filters.paid_traffic = range;
  }
  const paidKeywords = params.get('paid_keywords');
  if (paidKeywords) {
    const range = parseRange(paidKeywords);
    if (range) filters.paid_keywords = range;
  }
  const paidCost = params.get('paid_cost');
  if (paidCost) {
    const range = parseRange(paidCost);
    if (range) filters.paid_cost = range;
  }
  const topCountries = params.getAll('top_country').filter(Boolean);
  if (topCountries.length) filters.top_country = topCountries;
  const topTraffic = params.get('top_traffic');
  if (topTraffic) {
    const range = parseRange(topTraffic);
    if (range) filters.top_traffic = range;
  }
  const error = params.get('error');
  if (error === 'true') filters.error = 'with';
  else if (error === 'false') filters.error = 'without';
  return filters;
}

export interface MetricsListParams {
  page: number;
  page_size: number;
  order: string;
  search: string;
}

export function getListParamsFromUrl(search: string = ''): MetricsListParams {
  const searchString = typeof window !== 'undefined' && !search ? window.location.search : search;
  const params = new URLSearchParams(searchString);
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1);
  const pageSize = Math.max(1, parseInt(params.get('page_size') ?? '25', 10) || 25);
  const order = params.get('order') ?? 'domain_rating,DESC';
  const searchQuery = params.get('search') ?? '';
  return { page, page_size: pageSize, order, search: searchQuery };
}

export function updateUrlWithFilters(
  filters: MetricsFilters,
  listParams: { page?: number; page_size?: number; order?: string; search?: string },
  preserve: string[] = []
): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams();
  LIST_PARAM_KEYS.forEach(key => {
    const val = listParams[key];
    if (val !== undefined && val !== '') {
      if (key === 'search') params.set(key, String(val));
      else if (key === 'order') params.set(key, String(val));
      else if (key === 'page') params.set(key, String(val));
      else if (key === 'page_size') params.set(key, String(val));
    }
  });
  preserve.forEach(key => {
    const existing = new URLSearchParams(window.location.search).get(key);
    if (existing != null && !params.has(key)) params.set(key, existing);
  });
  const filterParams = filtersToUrlParams(filters);
  ['campaign', 'status', 'top_country'].forEach(key => {
    filterParams.getAll(key).forEach(v => params.append(key, v));
  });
  [
    'dr',
    'org_traffic',
    'org_keywords',
    'org_cost',
    'paid_traffic',
    'paid_keywords',
    'paid_cost',
    'top_traffic',
    'error',
  ].forEach(key => {
    const v = filterParams.get(key);
    if (v) params.set(key, v);
  });
  const qs = params.toString();
  const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
  window.history.replaceState({}, '', newUrl);
}

export function hasActiveFilters(filters: MetricsFilters): boolean {
  if ((filters.campaign ?? []).length > 0) return true;
  if ((filters.status ?? []).length > 0) return true;
  if (filters.dr != null) return true;
  if (filters.org_traffic != null) return true;
  if (filters.org_keywords != null) return true;
  if (filters.org_cost != null) return true;
  if (filters.paid_traffic != null) return true;
  if (filters.paid_keywords != null) return true;
  if (filters.paid_cost != null) return true;
  if ((filters.top_country ?? []).length > 0) return true;
  if (filters.top_traffic != null) return true;
  if (filters.error != null && filters.error !== 'any') return true;
  return false;
}
