import { useStore } from '@nanostores/react';
import {
  cartItems,
  cartLoading,
  cartError,
  cartPagination,
  fetchCarts,
  deleteCarts,
  processCarts,
} from '../stores/carts';

export const useCarts = () => {
  const items = useStore(cartItems);
  const loading = useStore(cartLoading);
  const error = useStore(cartError);
  const pagination = useStore(cartPagination);

  return {
    items,
    loading,
    error,
    pagination,
    fetch: fetchCarts,
    delete: deleteCarts,
    process: processCarts,
  };
};
