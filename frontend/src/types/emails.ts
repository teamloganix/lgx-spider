export interface EmailListItem {
  id: number;
  domain: string;
  campaign_name: string;
  analyzed_at: string | null;
  link_value: number | null;
  verdict: string;
  priority: string;
  guest_posts: string;
  contact_emails: string[];
  domain_rating: number | null;
  org_traffic: number | null;
  org_keywords: number | null;
  primary_email: string | null;
}

export interface EmailsListResponse {
  success: boolean;
  data: {
    items: EmailListItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      pageSize: number;
      totalAvailable: number;
    };
  };
}

export interface EmailFilters {
  campaign?: string[];
  verdict?: string[];
  priority?: string[];
  guest_posts?: string[];
  link_value?: { min?: number; max?: number };
  traffic?: { min?: number; max?: number };
  keywords?: { min?: number; max?: number };
  domain_rating?: { min?: number; max?: number };
}

export interface FetchEmailsParams {
  page?: number;
  page_size?: number;
  order?: string;
  search?: string;
  campaign?: string[];
  verdict?: string[];
  priority?: string[];
  guest_posts?: string[];
  link_value?: string;
  traffic?: string;
  keywords?: string;
  domain_rating?: string;
}

export interface EmailFilterOptions {
  campaigns: string[];
  verdicts: string[];
  priorities: string[];
  guest_posts: string[];
}
