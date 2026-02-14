export const BASE_PAGE_SIZE_OPTIONS = [25, 50, 100, 200];
export const DEFAULT_ORDER = 'analyzed_at,DESC';

export const EMAIL_COLUMN_IDS = [
  'domain',
  'campaign_name',
  'link_value',
  'verdict',
  'priority',
  'contact_emails',
  'guest_posts',
  'domain_rating',
  'org_traffic',
  'org_keywords',
  'analyzed_at',
  'actions',
] as const;

export type EmailColumnId = (typeof EMAIL_COLUMN_IDS)[number];

export interface EmailColumnConfig {
  id: EmailColumnId;
  label: string;
  visible: boolean;
  frozen?: boolean;
  sortable: boolean;
}

export const getDefaultEmailColumns = (): EmailColumnConfig[] => [
  { id: 'domain', label: 'Domain', visible: true, frozen: true, sortable: true },
  { id: 'campaign_name', label: 'Campaigns', visible: true, frozen: false, sortable: true },
  { id: 'link_value', label: 'Link Value', visible: true, frozen: false, sortable: true },
  { id: 'verdict', label: 'Verdict', visible: true, frozen: false, sortable: true },
  { id: 'priority', label: 'Priority', visible: true, frozen: false, sortable: true },
  { id: 'contact_emails', label: 'Contact Emails', visible: true, frozen: false, sortable: false },
  { id: 'guest_posts', label: 'Guest Posts', visible: true, frozen: false, sortable: true },
  { id: 'domain_rating', label: 'DR', visible: true, frozen: false, sortable: true },
  { id: 'org_traffic', label: 'Traffic', visible: true, frozen: false, sortable: true },
  { id: 'org_keywords', label: 'Keywords', visible: true, frozen: false, sortable: true },
  { id: 'analyzed_at', label: 'Analyzed', visible: true, frozen: false, sortable: true },
  { id: 'actions', label: 'Actions', visible: true, frozen: true, sortable: false },
];

export const ORDER_FIELD_MAP: Record<string, string> = {
  domain: 'domain',
  campaign_name: 'campaign_name',
  link_value: 'link_value',
  verdict: 'verdict',
  priority: 'priority',
  guest_posts: 'guest_posts',
  domain_rating: 'domain_rating',
  org_traffic: 'org_traffic',
  org_keywords: 'org_keywords',
  analyzed_at: 'analyzed_at',
};
