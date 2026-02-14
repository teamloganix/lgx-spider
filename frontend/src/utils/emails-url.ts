import type { EmailFilters } from '../types/emails';

const LIST_PARAM_KEYS = ['page', 'page_size', 'order', 'search'] as const;

export function filtersToUrlParams(filters: EmailFilters): URLSearchParams {
  const params = new URLSearchParams();
  (filters.campaign ?? []).forEach(c => params.append('campaign', c));
  (filters.verdict ?? []).forEach(v => params.append('verdict', v));
  (filters.priority ?? []).forEach(p => params.append('priority', p));
  (filters.guest_posts ?? []).forEach(g => params.append('guest_posts', g));
  if (filters.link_value != null) {
    const { min, max } = filters.link_value;
    if (min != null && max != null) params.set('link_value', `${min},${max}`);
    else if (min != null) params.set('link_value', String(min));
    else if (max != null) params.set('link_value', `0,${max}`);
  }
  if (filters.traffic != null) {
    const { min, max } = filters.traffic;
    if (min != null && max != null) params.set('traffic', `${min},${max}`);
    else if (min != null) params.set('traffic', String(min));
    else if (max != null) params.set('traffic', `0,${max}`);
  }
  if (filters.keywords != null) {
    const { min, max } = filters.keywords;
    if (min != null && max != null) params.set('keywords', `${min},${max}`);
    else if (min != null) params.set('keywords', String(min));
    else if (max != null) params.set('keywords', `0,${max}`);
  }
  if (filters.domain_rating != null) {
    const { min, max } = filters.domain_rating;
    if (min != null && max != null) params.set('domain_rating', `${min},${max}`);
    else if (min != null) params.set('domain_rating', String(min));
    else if (max != null) params.set('domain_rating', `0,${max}`);
  }
  return params;
}

function parseRange(value: string): { min: number; max: number } | null {
  const parts = value
    .trim()
    .split(',')
    .map(p => parseInt(p.trim(), 10));
  if (parts.length >= 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
    return { min: parts[0], max: parts[1] };
  }
  if (parts.length === 1 && !Number.isNaN(parts[0])) {
    return { min: parts[0], max: parts[0] };
  }
  return null;
}

export function getFiltersFromUrl(search: string = ''): EmailFilters {
  const searchString = typeof window !== 'undefined' && !search ? window.location.search : search;
  const params = new URLSearchParams(searchString);
  const filters: EmailFilters = {};
  const campaigns = params.getAll('campaign').filter(Boolean);
  if (campaigns.length) filters.campaign = campaigns;
  const verdicts = params.getAll('verdict').filter(Boolean);
  if (verdicts.length) filters.verdict = verdicts;
  const priorities = params.getAll('priority').filter(Boolean);
  if (priorities.length) filters.priority = priorities;
  const guestPosts = params.getAll('guest_posts').filter(Boolean);
  if (guestPosts.length) filters.guest_posts = guestPosts;
  const linkValue = params.get('link_value');
  if (linkValue) {
    const range = parseRange(linkValue);
    if (range) filters.link_value = range;
  }
  const traffic = params.get('traffic');
  if (traffic) {
    const range = parseRange(traffic);
    if (range) filters.traffic = range;
  }
  const keywords = params.get('keywords');
  if (keywords) {
    const range = parseRange(keywords);
    if (range) filters.keywords = range;
  }
  const domainRating = params.get('domain_rating');
  if (domainRating) {
    const range = parseRange(domainRating);
    if (range) filters.domain_rating = range;
  }
  return filters;
}

export interface EmailListParams {
  page: number;
  page_size: number;
  order: string;
  search: string;
}

export function getListParamsFromUrl(search: string = ''): EmailListParams {
  const searchString = typeof window !== 'undefined' && !search ? window.location.search : search;
  const params = new URLSearchParams(searchString);
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1);
  const pageSize = Math.max(1, parseInt(params.get('page_size') ?? '25', 10) || 25);
  const order = params.get('order') ?? 'analyzed_at,DESC';
  const searchQuery = params.get('search') ?? '';
  return { page, page_size: pageSize, order, search: searchQuery };
}

export function updateUrlWithFilters(
  filters: EmailFilters,
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
  ['campaign', 'verdict', 'priority', 'guest_posts'].forEach(key => {
    filterParams.getAll(key).forEach(v => params.append(key, v));
  });
  ['link_value', 'traffic', 'keywords', 'domain_rating'].forEach(key => {
    const v = filterParams.get(key);
    if (v) params.set(key, v);
  });
  const qs = params.toString();
  const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
  window.history.replaceState({}, '', newUrl);
}

export function hasActiveFilters(filters: EmailFilters): boolean {
  if ((filters.campaign ?? []).length > 0) return true;
  if ((filters.verdict ?? []).length > 0) return true;
  if ((filters.priority ?? []).length > 0) return true;
  if ((filters.guest_posts ?? []).length > 0) return true;
  if (filters.link_value != null) return true;
  if (filters.traffic != null) return true;
  if (filters.keywords != null) return true;
  if (filters.domain_rating != null) return true;
  return false;
}
