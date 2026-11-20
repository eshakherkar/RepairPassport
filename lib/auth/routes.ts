/**
 * Which addresses need sign-in, and where people go after signing in.
 * Used by proxy.ts (before pages load) and by the sign-in actions.
 */

/** Pages that require a signed-in user. Everything under them too. */
export const PROTECTED_PATH_PREFIXES = ["/dashboard", "/appliances", "/repairs"];

/** Sign-in and sign-up pages: signed-in users are sent to the dashboard. */
export const AUTH_PAGES = ["/sign-in", "/sign-up"];

export const DEFAULT_AFTER_SIGN_IN = "/dashboard";

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedPath(pathname: string) {
  return PROTECTED_PATH_PREFIXES.some((prefix) => matches(pathname, prefix));
}

export function isAuthPage(pathname: string) {
  return AUTH_PAGES.some((page) => matches(pathname, page));
}

/**
 * Makes a "where to go next" value safe to redirect to.
 * Only paths on this site are allowed (e.g. "/appliances/123"). Anything
 * else, such as "https://evil.example" or "//evil.example", falls back to
 * the dashboard. This prevents "open redirect" tricks in sign-in links.
 */
export function safeNextPath(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_AFTER_SIGN_IN;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return DEFAULT_AFTER_SIGN_IN;
  }
  return value;
}
