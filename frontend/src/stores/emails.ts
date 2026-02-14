import { atom } from 'nanostores';
import { fetchEmailsApi } from '@utils/emails-api';
import type { EmailListItem, EmailsListResponse, FetchEmailsParams } from '../types/emails';

export const emailItems = atom<EmailListItem[]>([]);
export const emailLoading = atom<boolean>(false);
export const emailError = atom<string | null>(null);
export const emailPagination = atom<EmailsListResponse['data']['pagination'] | null>(null);

export async function fetchEmails(params: FetchEmailsParams = {}): Promise<void> {
  try {
    emailLoading.set(true);
    emailError.set(null);
    const res = (await fetchEmailsApi(params)) as EmailsListResponse;
    if (res?.success && res?.data) {
      emailItems.set(res.data.items ?? []);
      emailPagination.set(res.data.pagination ?? null);
    } else {
      emailItems.set([]);
      emailPagination.set(null);
    }
  } catch (err) {
    console.error('Error fetching emails:', err);
    emailError.set('Failed to fetch emails');
    emailItems.set([]);
    emailPagination.set(null);
  } finally {
    emailLoading.set(false);
  }
}
