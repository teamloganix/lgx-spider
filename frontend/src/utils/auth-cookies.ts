import env from '@utils/env';

/**
 * Cookies used for Loganix auth (from spider/profile/sso flow).
 * Read by Astro middleware (cookie-user.js) and backend API; cleared on logout here.
 */
export const AUTH_COOKIE_NAMES = {
  /** User display name (.loganix.com) – used for req.user */
  STAFF_NAME: 'staff_name',
  /** User level (.loganix.com) */
  STAFF_USER_LEVEL: 'staff_user_level',
  /** User id (.loganix.com) */
  TAG_USER_ID: 'tag_user_id',
  /** User type/role (.loganix.com) */
  USER_TYPE: 'UserType',
  /** Another user identifier (.loganix.com) */
  TRUID: 'truid',
  /** Loganix services proxy (.loganix.com) */
  LOGANIX_SERVICES_PROXY: '_loganix_services_proxy',
  /** Spider PHP session (spider.loganix.com) */
  PHP_SESSID: 'PHPSESSID',
  /** Hotjar session (.loganix.com) – optionally cleared on logout */
  HJ_SESSION_1895205: '_hjSessionUser_1895205',
  HJ_SESSION_6585938: '_hjSessionUser_6585938',
  HJ_SESSION_6591172: '_hjSessionUser_6591172',
} as const;

/** Cookies to clear on logout (domain .loganix.com) */
export const LOGOUT_COOKIES_SHARED_DOMAIN: readonly string[] = [
  AUTH_COOKIE_NAMES.STAFF_NAME,
  AUTH_COOKIE_NAMES.STAFF_USER_LEVEL,
  AUTH_COOKIE_NAMES.TAG_USER_ID,
  AUTH_COOKIE_NAMES.USER_TYPE,
  AUTH_COOKIE_NAMES.TRUID,
  AUTH_COOKIE_NAMES.LOGANIX_SERVICES_PROXY,
  AUTH_COOKIE_NAMES.HJ_SESSION_1895205,
  AUTH_COOKIE_NAMES.HJ_SESSION_6585938,
  AUTH_COOKIE_NAMES.HJ_SESSION_6591172,
];

/** Cookies for current host (e.g. PHPSESSID on spider.loganix.com) */
export const LOGOUT_COOKIES_CURRENT_HOST: readonly string[] = [AUTH_COOKIE_NAMES.PHP_SESSID];

const LOGOUT_REDIRECT_URL = 'https://sso.lgnx.ca';

/**
 * Removes a cookie (path=/ and optional domain).
 * For .loganix.com cookies, domain=.loganix.com is required.
 */
function clearCookie(name: string, options: { domain?: string } = {}): void {
  const domain = options.domain ? `; domain=${options.domain}` : '';
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domain}; max-age=0`;
}

/**
 * Clears in the frontend all cookies required for logout.
 * Should be called after the backend confirms logout (or in parallel).
 */
export function clearAuthCookies(): void {
  LOGOUT_COOKIES_SHARED_DOMAIN.forEach(name => {
    clearCookie(name, { domain: '.loganix.com' });
  });
  LOGOUT_COOKIES_CURRENT_HOST.forEach(name => {
    clearCookie(name);
  });
}

/**
 * Runs the logout flow: calls backend, clears cookies, redirects to SSO.
 */
export async function performLogout(): Promise<void> {
  const base = env.PUBLIC_API_URL ?? '';
  const logoutUrl = base ? `${base.replace(/\/$/, '')}/api/v1/logout` : '/api/v1/logout';

  try {
    await fetch(logoutUrl, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    // Still clear local cookies and redirect if backend fails
  }

  clearAuthCookies();
  window.location.href = LOGOUT_REDIRECT_URL;
}
