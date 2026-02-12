/**
 * Env config. Uses getv() for runtime access (same pattern as stl-v2).
 * Server: process.env wins; client: import.meta.env (PUBLIC_* only in Astro).
 */

const getv = (name: string, def: string): string => {
  const isServer = typeof window === 'undefined';
  if (isServer) {
    return (
      (process as { env?: Record<string, string> }).env?.[name] ??
      (import.meta.env as Record<string, string>)[name] ??
      def
    );
  }
  return (import.meta.env as Record<string, string>)[name] ?? def;
};

const defMockUser = '{"id":"1","email":"dev@loganix.com","name_f":"Soon","name_l":"Sam"}';

const env = {
  /** Application environment (dev | production) */
  APP_ENV: String(getv('APP_ENV', 'production')),

  /**
   * In dev, when set, the middleware injects this JSON as context.locals.user
   * so you can develop without real auth cookies.
   */
  MOCK_USER_JSON: String(getv('MOCK_USER_JSON', defMockUser)),

  /** Backend API base URL (e.g. http://localhost:3000 in dev when backend runs on 3000) */
  PUBLIC_API_URL: String(getv('PUBLIC_API_URL', '')).replace(/\/$/, ''),

  /** LGX Spider backend API base URL (e.g. http://localhost:17001/api/v1) */
  PUBLIC_LGX_BACKEND_URL: String(getv('PUBLIC_LGX_BACKEND_URL', '')).replace(/\/$/, ''),
};

export default env;
