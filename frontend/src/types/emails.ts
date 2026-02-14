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

// --- Email by ID / generation (page /emails/:id) ---

/** Shape of analysis_json for Analysis Data Preview (optional fields) */
export interface EmailAnalysisJson {
  overall_link_value?: number;
  link_building_recommendation?: { verdict?: string };
  guest_post_analysis?: { accepts_guest_posts?: string };
  contact_availability?: {
    emails_found?: { actual_emails?: string[] };
  };
  domain_analysis?: {
    content_type?: string;
    primary_niche?: string;
  };
}

export interface EmailByIdData {
  id: number;
  domain: string;
  campaign_name: string;
  analysis_json: EmailAnalysisJson;
  analyzed_at: string | null;
  generated_email: string | null;
  prompt_used?: string | null;
}

export interface EmailByIdResponse {
  success: boolean;
  data?: EmailByIdData;
}

export interface GenerateEmailRequest {
  prompt: string;
  analysis: Record<string, unknown>;
}

export interface GenerateEmailResponse {
  success: boolean;
  email?: string;
}

export interface SaveGenerationRequest {
  generated_email?: string;
  prompt_used?: string;
}
