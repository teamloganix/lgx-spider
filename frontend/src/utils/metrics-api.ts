import env from '@utils/env';
import type {
  FetchMetricsParams,
  MetricsListResponse,
  MetricsFilterOptions,
  MetricsStats,
} from '../types/metrics';

const baseUrl = env.PUBLIC_LGX_BACKEND_URL;

const getHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
});

function buildMetricsQueryString(params: FetchMetricsParams): string {
  const searchParams = new URLSearchParams();
  const append = (key: string, value: string | number) => {
    if (value !== '' && value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  };
  if (params.page != null) append('page', params.page);
  if (params.page_size != null) append('page_size', params.page_size);
  if (params.order) append('order', params.order);
  if (params.search) append('search', params.search);
  (params.campaign ?? []).forEach(c => append('campaign', c));
  (params.status ?? []).forEach(s => append('status', s));
  if (params.dr) append('dr', params.dr);
  if (params.domain_rating) append('domain_rating', params.domain_rating);
  if (params.org_traffic) append('org_traffic', params.org_traffic);
  if (params.org_keywords) append('org_keywords', params.org_keywords);
  if (params.org_cost) append('org_cost', params.org_cost);
  if (params.paid_traffic) append('paid_traffic', params.paid_traffic);
  if (params.paid_keywords) append('paid_keywords', params.paid_keywords);
  if (params.paid_cost) append('paid_cost', params.paid_cost);
  (params.top_country ?? []).forEach(c => append('top_country', c));
  if (params.top_traffic) append('top_traffic', params.top_traffic);
  if (params.error) append('error', params.error);
  return searchParams.toString();
}

export async function fetchMetricsListApi(
  params: FetchMetricsParams
): Promise<MetricsListResponse | { success: false; error?: unknown }> {
  const query = buildMetricsQueryString(params);
  const url = query ? `${baseUrl}/metrics?${query}` : `${baseUrl}/metrics`;
  const response = await fetch(url, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return response.json();
}

export async function fetchMetricsStatsApi(): Promise<{
  success: boolean;
  data?: MetricsStats;
}> {
  const response = await fetch(`${baseUrl}/metrics/stats`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return response.json();
}

export async function fetchMetricsFilterOptionsApi(): Promise<{
  success: boolean;
  data?: MetricsFilterOptions;
}> {
  const response = await fetch(`${baseUrl}/metrics/filter-options`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return response.json();
}

export async function fetchProcessingPausedApi(): Promise<{ success: boolean; paused?: boolean }> {
  const response = await fetch(`${baseUrl}/metrics/processing-paused`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return response.json();
}

export async function toggleProcessingApi(): Promise<{
  success: boolean;
  paused?: boolean;
  message?: string;
}> {
  const response = await fetch(`${baseUrl}/metrics/toggle-processing`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
  });
  return response.json();
}

export async function blacklistProcessedApi(
  domains: Array<{ id: number; domain: string }>
): Promise<{
  success: boolean;
  message?: string;
  archived?: number;
  blacklisted?: number;
  removed?: number;
}> {
  const response = await fetch(`${baseUrl}/metrics/blacklist-processed`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ domains }),
  });
  return response.json();
}
