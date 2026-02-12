/**
 * Shared logic: build user object from cookie values (staff_name, tag_user_id, etc.).
 * Used by Astro middleware (src/middleware.ts). No browser or Vite/Env deps.
 *
 * @param {{ staffName?: string; tagUserId?: string; staffUserLevel?: string; staffEmail?: string }} values
 * @returns {{ id?: string; name_f: string; name_l: string; email?: string; staff_user_level?: string } | null}
 */
export function userFromCookieValues(values) {
  const staffName = values?.staffName;
  if (staffName == null || String(staffName).trim() === '') return null;

  const nameStr = decodeURIComponent(String(staffName).trim());
  const parts = nameStr.split(/\s+/);
  const nameF = parts[0] ?? '';
  const nameL = parts.slice(1).join(' ') ?? '';

  return {
    id: values?.tagUserId ?? undefined,
    name_f: nameF,
    name_l: nameL,
    email: values?.staffEmail ?? '',
    staff_user_level: values?.staffUserLevel ?? undefined,
  };
}
