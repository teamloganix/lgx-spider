export interface MetricsListItem {
  id: number;
  domain: string;
  campaign_name: string;
  domain_rating: number | null;
  org_traffic: number | null;
  org_keywords: number | null;
  org_cost: number | null;
  paid_traffic: number | null;
  paid_keywords: number | null;
  paid_cost: number | null;
  top_country: string | null;
  top_traffic: number | null;
  processing_status: string;
  created_at: string;
  updated_at: string;
  error_message: string | null;
}

export interface MetricsListResponse {
  success: boolean;
  data: {
    items: MetricsListItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      pageSize: number;
      totalAvailable: number;
    };
  };
}

export interface MetricsStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface MetricsFilterOptions {
  campaigns: string[];
  top_countries: string[];
  statuses: string[];
}

export interface MetricsFilters {
  campaign?: string[];
  status?: string[];
  dr?: { min?: number; max?: number };
  org_traffic?: { min?: number; max?: number };
  org_keywords?: { min?: number; max?: number };
  org_cost?: { min?: number; max?: number };
  paid_traffic?: { min?: number; max?: number };
  paid_keywords?: { min?: number; max?: number };
  paid_cost?: { min?: number; max?: number };
  top_country?: string[];
  top_traffic?: { min?: number; max?: number };
  error?: 'any' | 'with' | 'without';
}

export interface FetchMetricsParams {
  page?: number;
  page_size?: number;
  order?: string;
  search?: string;
  campaign?: string[];
  status?: string[];
  dr?: string;
  domain_rating?: string;
  org_traffic?: string;
  org_keywords?: string;
  org_cost?: string;
  paid_traffic?: string;
  paid_keywords?: string;
  paid_cost?: string;
  top_country?: string[];
  top_traffic?: string;
  error?: string;
}
