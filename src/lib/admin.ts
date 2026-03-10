/** Shared admin utility — used in AuthModal + AdminPage */

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',').map((e: string) => e.trim()).filter(Boolean)

/**
 * Returns true if the email has admin access.
 * Dev fallback: if VITE_ADMIN_EMAILS is empty, everyone is admin.
 */
export function isAdminUser(email?: string | null): boolean {
  if (!email) return false
  if (ADMIN_EMAILS.length === 0) return true
  return ADMIN_EMAILS.includes(email)
}
