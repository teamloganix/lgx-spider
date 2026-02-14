import env from '@utils/env';
import type {
  FetchEmailsParams,
  EmailFilterOptions,
  EmailByIdResponse,
  GenerateEmailRequest,
  GenerateEmailResponse,
  SaveGenerationRequest,
} from '../types/emails';

const baseUrl = env.PUBLIC_LGX_BACKEND_URL;

const getHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
});

function buildEmailsQueryString(params: FetchEmailsParams): string {
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
  (params.verdict ?? []).forEach(v => append('verdict', v));
  (params.priority ?? []).forEach(p => append('priority', p));
  (params.guest_posts ?? []).forEach(g => append('guest_posts', g));
  if (params.link_value) append('link_value', params.link_value);
  if (params.traffic) append('traffic', params.traffic);
  if (params.keywords) append('keywords', params.keywords);
  if (params.domain_rating) append('domain_rating', params.domain_rating);
  return searchParams.toString();
}

export async function fetchEmailsApi(params: FetchEmailsParams): Promise<unknown> {
  const query = buildEmailsQueryString(params);
  const url = query ? `${baseUrl}/emails?${query}` : `${baseUrl}/emails`;
  const response = await fetch(url, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return response.json();
}

export async function fetchEmailFilterOptionsApi(): Promise<{
  success: boolean;
  data?: EmailFilterOptions;
}> {
  const response = await fetch(`${baseUrl}/emails/filter-options`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return response.json();
}

export async function fetchEmailByIdApi(id: number): Promise<EmailByIdResponse> {
  const response = await fetch(`${baseUrl}/emails/${id}`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return response.json();
}

export async function generateEmailApi(
  id: number,
  body: GenerateEmailRequest
): Promise<GenerateEmailResponse> {
  const response = await fetch(`${baseUrl}/emails/${id}/generate`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return response.json();
}

export async function saveGenerationApi(
  id: number,
  body: SaveGenerationRequest
): Promise<{ success: boolean }> {
  const response = await fetch(`${baseUrl}/emails/${id}/generations`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return response.json();
}
