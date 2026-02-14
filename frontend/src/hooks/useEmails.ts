import { useStore } from '@nanostores/react';
import {
  emailItems,
  emailLoading,
  emailError,
  emailPagination,
  fetchEmails,
} from '../stores/emails';
import type { FetchEmailsParams } from '../types/emails';

export function useEmails() {
  const items = useStore(emailItems);
  const loading = useStore(emailLoading);
  const error = useStore(emailError);
  const pagination = useStore(emailPagination);
  return {
    items,
    loading,
    error,
    pagination,
    fetch: fetchEmails,
  };
}

export type { FetchEmailsParams };
