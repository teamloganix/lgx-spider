import { atom } from 'nanostores';
import { api } from '@utils/api';
import type { CartItem, CartResponse, ProcessCartsResponse } from '../types/cart';

export const cartItems = atom<CartItem[]>([]);
export const cartLoading = atom<boolean>(false);
export const cartError = atom<string | null>(null);
export const cartPagination = atom<{
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  totalAvailable: number;
} | null>(null);

export interface FetchCartsParams {
  page?: number;
  page_size?: number;
  domain?: string;
  order?: string;
}

export const fetchCarts = async (params: FetchCartsParams = {}): Promise<void> => {
  try {
    cartLoading.set(true);
    cartError.set(null);

    const searchParams: Record<string, string | number> = {};
    if (params.page != null) searchParams.page = params.page;
    if (params.page_size != null) searchParams.page_size = params.page_size;
    if (params.domain) searchParams.domain = params.domain;
    if (params.order) searchParams.order = params.order;

    const queryString = new URLSearchParams(
      Object.entries(searchParams).map(([k, v]) => [k, String(v)])
    ).toString();
    const url = queryString ? `/carts?${queryString}` : '/carts';

    const res = (await api.get(url)) as CartResponse;
    if (res?.success && res?.data) {
      cartItems.set(res.data.items ?? []);
      cartPagination.set(res.data.pagination ?? null);
    } else {
      cartItems.set([]);
      cartPagination.set(null);
    }
  } catch (err) {
    console.error('Error fetching cart data:', err);
    cartError.set('Failed to fetch cart data');
    cartItems.set([]);
    cartPagination.set(null);
  } finally {
    cartLoading.set(false);
  }
};

export const deleteCarts = async (
  ids: number[],
  refetchParams?: FetchCartsParams
): Promise<void> => {
  try {
    cartError.set(null);
    await api.delete('/carts/bulk', { ids });
    await fetchCarts(refetchParams ?? {});
  } catch (err) {
    console.error('Error deleting cart items:', err);
    cartError.set('Failed to delete cart items');
    throw err;
  }
};

export const processCarts = async (
  refetchParams?: FetchCartsParams
): Promise<ProcessCartsResponse | null> => {
  try {
    cartError.set(null);
    const res = (await api.post<ProcessCartsResponse>('/carts/process')) as ProcessCartsResponse;
    if (res?.success) {
      await fetchCarts(refetchParams ?? { page: 1 });
      return res;
    }
    return null;
  } catch (err) {
    console.error('Error processing cart:', err);
    cartError.set('Failed to process cart');
    throw err;
  }
};
