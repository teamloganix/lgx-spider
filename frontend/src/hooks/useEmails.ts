import { useStore } from '@nanostores/react';
import {
  emailItems,
  emailLoading,
  emailError,
  emailPagination,
  fetchEmails,
  emailByIdData,
  emailByIdLoading,
  emailByIdError,
  emailGenerateLoading,
  emailSavePromptLoading,
  emailSaveEmailLoading,
  fetchEmailById,
  generateEmail,
  saveGeneration,
} from '../stores/emails';
import type { FetchEmailsParams, GenerateEmailRequest } from '../types/emails';

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

export function useEmailById() {
  const data = useStore(emailByIdData);
  const loading = useStore(emailByIdLoading);
  const error = useStore(emailByIdError);
  const generateLoading = useStore(emailGenerateLoading);
  const savePromptLoading = useStore(emailSavePromptLoading);
  const saveEmailLoading = useStore(emailSaveEmailLoading);
  return {
    data,
    loading,
    error,
    generateLoading,
    savePromptLoading,
    saveEmailLoading,
    fetchEmailById,
    generateEmail,
    saveGeneration,
  };
}

export type { FetchEmailsParams, GenerateEmailRequest };
