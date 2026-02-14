import { atom } from 'nanostores';
import {
  fetchEmailsApi,
  fetchEmailByIdApi,
  generateEmailApi,
  saveGenerationApi,
} from '@utils/emails-api';
import type {
  EmailListItem,
  EmailsListResponse,
  FetchEmailsParams,
  EmailByIdData,
  GenerateEmailRequest,
  SaveGenerationRequest,
} from '../types/emails';

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

// --- Email by ID / generation (page /emails/:id) ---

export const emailByIdData = atom<EmailByIdData | null>(null);
export const emailByIdLoading = atom<boolean>(false);
export const emailByIdError = atom<string | null>(null);
export const emailGenerateLoading = atom<boolean>(false);
export const emailSavePromptLoading = atom<boolean>(false);
export const emailSaveEmailLoading = atom<boolean>(false);

export async function fetchEmailById(id: number): Promise<void> {
  try {
    emailByIdLoading.set(true);
    emailByIdError.set(null);
    emailByIdData.set(null);
    const res = await fetchEmailByIdApi(id);
    if (res?.success && res?.data) {
      emailByIdData.set(res.data);
    } else {
      emailByIdData.set(null);
    }
  } catch (err) {
    console.error('Error fetching email by id:', err);
    emailByIdError.set('Failed to load email');
    emailByIdData.set(null);
  } finally {
    emailByIdLoading.set(false);
  }
}

export async function generateEmail(
  id: number,
  body: GenerateEmailRequest
): Promise<{ success: boolean; email?: string }> {
  try {
    emailGenerateLoading.set(true);
    const res = await generateEmailApi(id, body);
    if (res?.success && res?.email != null) {
      const current = emailByIdData.get();
      if (current) {
        emailByIdData.set({ ...current, generated_email: res.email });
      }
      return { success: true, email: res.email };
    }
    return { success: false };
  } catch (err) {
    console.error('Error generating email:', err);
    return { success: false };
  } finally {
    emailGenerateLoading.set(false);
  }
}

export async function saveGeneration(id: number, payload: SaveGenerationRequest): Promise<boolean> {
  const savingPrompt = payload.prompt_used !== undefined && payload.prompt_used.trim() !== '';
  const savingEmail =
    payload.generated_email !== undefined && payload.generated_email.trim() !== '';
  try {
    if (savingPrompt) emailSavePromptLoading.set(true);
    if (savingEmail) emailSaveEmailLoading.set(true);
    const res = await saveGenerationApi(id, payload);
    if (res?.success === true) {
      const current = emailByIdData.get();
      if (current && current.id === id) {
        const next: EmailByIdData = { ...current };
        if (payload.prompt_used !== undefined) next.prompt_used = payload.prompt_used;
        if (payload.generated_email !== undefined) next.generated_email = payload.generated_email;
        emailByIdData.set(next);
      }
    }
    return res?.success === true;
  } catch (err) {
    console.error('Error saving generation:', err);
    return false;
  } finally {
    if (savingPrompt) emailSavePromptLoading.set(false);
    if (savingEmail) emailSaveEmailLoading.set(false);
  }
}
