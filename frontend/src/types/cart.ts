export interface CartItem {
  id: number;
  session_id: string;
  domain: string;
  keywords: string | null;
  similarity_score: number | null;
  spider_id: number | null;
  campaign_id: number | null;
  added_at: string;
}

export interface ProcessCartsResponse {
  success: boolean;
  skipped: number;
  inserted: number;
  insertedPerCampaign: Array<{ campaign_id: number; count: number }>;
}

export interface CartPagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  totalAvailable: number;
}

export interface CartResponse {
  success: boolean;
  user_id: string;
  data: {
    items: CartItem[];
    pagination: CartPagination;
  };
}
