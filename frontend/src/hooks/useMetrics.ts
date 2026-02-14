import { useStore } from '@nanostores/react';
import {
  metricsItems,
  metricsLoading,
  metricsError,
  metricsPagination,
  fetchMetrics,
} from '../stores/metrics';
import type { FetchMetricsParams } from '../types/metrics';

export function useMetrics() {
  const items = useStore(metricsItems);
  const loading = useStore(metricsLoading);
  const error = useStore(metricsError);
  const pagination = useStore(metricsPagination);
  return {
    items,
    loading,
    error,
    pagination,
    fetch: fetchMetrics,
  };
}

export type { FetchMetricsParams };
