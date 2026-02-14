export const BASE_PAGE_SIZE_OPTIONS = [25, 50, 100, 200];
export const DEFAULT_ORDER = 'domain_rating,DESC';
export const MAX_VISIBLE = 500;

export const METRICS_COLUMN_IDS = [
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
] as const;

export type MetricsColumnId = (typeof METRICS_COLUMN_IDS)[number];

export interface MetricsColumnConfig {
  id: MetricsColumnId;
  label: string;
  visible: boolean;
  sortable: boolean;
  frozen?: boolean;
}

export const getDefaultMetricsColumns = (): MetricsColumnConfig[] => [
  { id: 'id', label: 'ID', visible: true, sortable: true, frozen: true },
  { id: 'domain', label: 'Domain', visible: true, sortable: true, frozen: true },
  { id: 'campaign_name', label: 'Campaign', visible: true, sortable: true },
  { id: 'domain_rating', label: 'DR', visible: true, sortable: true },
  { id: 'org_traffic', label: 'Org Traffic', visible: true, sortable: true },
  { id: 'org_keywords', label: 'Org Keywords', visible: true, sortable: true },
  { id: 'org_cost', label: 'Org Cost', visible: true, sortable: true },
  { id: 'paid_traffic', label: 'Paid Traffic', visible: true, sortable: true },
  { id: 'paid_keywords', label: 'Paid Keywords', visible: true, sortable: true },
  { id: 'paid_cost', label: 'Paid Cost', visible: true, sortable: true },
  { id: 'top_country', label: 'Top Country', visible: true, sortable: true },
  { id: 'top_traffic', label: 'Top Traffic', visible: true, sortable: true },
  { id: 'processing_status', label: 'Status', visible: true, sortable: true },
  { id: 'created_at', label: 'Created', visible: true, sortable: true },
  { id: 'updated_at', label: 'Updated', visible: true, sortable: true },
  { id: 'error_message', label: 'Error', visible: true, sortable: false },
];

export const ORDER_FIELD_MAP: Record<string, string> = {
  id: 'id',
  domain: 'domain',
  campaign_name: 'campaign_name',
  domain_rating: 'domain_rating',
  org_traffic: 'org_traffic',
  org_keywords: 'org_keywords',
  org_cost: 'org_cost',
  paid_traffic: 'paid_traffic',
  paid_keywords: 'paid_keywords',
  paid_cost: 'paid_cost',
  top_country: 'top_country',
  top_traffic: 'top_traffic',
  processing_status: 'processing_status',
  created_at: 'created_at',
  updated_at: 'updated_at',
};
