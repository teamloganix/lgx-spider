import { atom } from 'nanostores';
import { fetchMetricsListApi } from '@utils/metrics-api';
import type { MetricsListItem, MetricsListResponse, FetchMetricsParams } from '../types/metrics';

export const metricsItems = atom<MetricsListItem[]>([]);
export const metricsLoading = atom<boolean>(false);
export const metricsError = atom<string | null>(null);
export const metricsPagination = atom<MetricsListResponse['data']['pagination'] | null>(null);

export async function fetchMetrics(params: FetchMetricsParams = {}): Promise<void> {
  try {
    metricsLoading.set(true);
    metricsError.set(null);
    const res = (await fetchMetricsListApi(params)) as MetricsListResponse;
    if (res?.success && res?.data) {
      metricsItems.set(res.data.items ?? []);
      metricsPagination.set(res.data.pagination ?? null);
    } else {
      metricsItems.set([]);
      metricsPagination.set(null);
    }
  } catch (err) {
    console.error('Error fetching metrics:', err);
    metricsError.set('Failed to fetch metrics');
    metricsItems.set([]);
    metricsPagination.set(null);
  } finally {
    metricsLoading.set(false);
  }
}
