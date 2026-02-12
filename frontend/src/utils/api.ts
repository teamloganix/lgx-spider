import env from '@utils/env';

const baseUrl = env.PUBLIC_LGX_BACKEND_URL;

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  return headers;
};

export const api = {
  get: async (endpoint: string, params?: Record<string, string | number | null>) => {
    let url = `${baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }
    const response = await fetch(url, {
      headers: getHeaders(),
      credentials: 'include',
    });
    return response.json();
  },
  post: async <T = unknown>(endpoint: string, data?: unknown): Promise<T> => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    return response.json();
  },
  put: async <T = unknown>(endpoint: string, data?: unknown): Promise<T> => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    return response.json();
  },
  delete: async (endpoint: string, data?: { ids: number[] }) => {
    const options: globalThis.RequestInit = {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    };

    if (data !== undefined) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, options);
    return response.json();
  },
};
