/**
 * Shared types for Spider backend.
 */
export type ApiResponse<T = unknown> = {
  success: boolean;
  items?: T[];
  item?: T;
  error?: { code: string; message: string; path?: string };
};
