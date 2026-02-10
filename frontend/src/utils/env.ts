/**
 * Env config. Uses static import.meta.env.* only (Vite disallows dynamic access).
 * Server: process.env wins; client: import.meta.env (PUBLIC_* only in Astro).
 */

const defMockUser = '{"id":"1","email":"dev@loganix.com","name_f":"Soon","name_l":"Sam"}';

const env = {
  /** Application environment (dev | production) */
  APP_ENV: String(
    (typeof process !== 'undefined' && process.env?.APP_ENV) ??
      import.meta.env?.APP_ENV ??
      'production'
  ),

  /**
   * In dev, when set, the middleware injects this JSON as context.locals.user
   * so you can develop without real auth cookies.
   */
  MOCK_USER_JSON: String(
    (typeof process !== 'undefined' && process.env?.MOCK_USER_JSON) ??
      import.meta.env?.MOCK_USER_JSON ??
      defMockUser
  ),

  /** Backend API base URL (e.g. http://localhost:3000 in dev when backend runs on 3000) */
  PUBLIC_API_URL: String(
    (typeof process !== 'undefined' && process.env?.PUBLIC_API_URL) ??
      import.meta.env?.PUBLIC_API_URL ??
      ''
  ).replace(/\/$/, ''),
};

export default env;
