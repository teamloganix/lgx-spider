/// <reference types="astro/client" />
/* eslint-disable no-unused-vars */

interface ImportMetaEnv {
  readonly STL_V2_BACKEND_URL: string;
  readonly VERSION: string;
  readonly JWT_SECRET: string;
  readonly JWT_COOKIE_NAME: string;
  readonly JWT_COOKIE_TTL_MS: string;
  readonly JWT_COOKIE_SAMESITE: 'Lax' | 'Strict' | 'None' | string;
  readonly JWT_COOKIE_SECURE: 'true' | 'false' | string;
  readonly JWT_REDIRECT_URL: string;
  readonly LOGOUT_REDIRECT_URL: string;
  readonly DEV: string;
  readonly MOCK_USER_JSON: string;
  readonly HMAC_SECRET_KEY?: string;
  readonly PUBLIC_SENTRY_DSN?: string;
  readonly SENTRY_ENVIRONMENT?: string;
  readonly SENTRY_RELEASE?: string;
  readonly APP_ENV?: string;
  readonly PUBLIC_GA_ENABLED?: string;
  readonly PUBLIC_GA_ID?: string;
  readonly PUBLIC_GTM_ID?: string;
  readonly PUBLIC_HOTJAR_ID?: string;
  readonly PUBLIC_INTERCOM_APP_ID?: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

declare namespace App {
  interface Locals {
    user?: Record<string, unknown> & { id?: string };
  }
}

export {};
