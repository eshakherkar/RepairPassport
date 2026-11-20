import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_AFTER_SIGN_IN,
  isAuthPage,
  isProtectedPath,
} from "@/lib/auth/routes";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

/**
 * Runs before every page (called from proxy.ts). It:
 * 1. refreshes the Supabase sign-in session if it's about to expire, and
 *    passes the fresh cookies to both the page and the browser, so people
 *    aren't randomly signed out;
 * 2. sends signed-out visitors away from protected pages, and signed-in
 *    users away from the sign-in/sign-up pages.
 *
 * This is a fast, "optimistic" check. Pages and server actions still check
 * the user themselves (see lib/auth/session.ts): never rely on proxy alone.
 *
 * Based on Supabase's official Next.js example.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value),
        );
      },
    },
  });

  // Supabase: do not run code between createServerClient and getClaims(),
  // or users may be randomly signed out.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

  if (!signedIn && isProtectedPath(pathname)) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    signInUrl.search = "";
    // Come back here after signing in.
    signInUrl.searchParams.set("next", `${pathname}${search}`);
    return redirectKeepingSession(signInUrl, supabaseResponse);
  }

  if (signedIn && isAuthPage(pathname)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = DEFAULT_AFTER_SIGN_IN;
    dashboardUrl.search = "";
    return redirectKeepingSession(dashboardUrl, supabaseResponse);
  }

  // Must return supabaseResponse itself: it carries any refreshed cookies.
  return supabaseResponse;
}

/**
 * A redirect that keeps the refreshed session cookies and cache headers,
 * as Supabase's docs require when returning a different response.
 */
function redirectKeepingSession(url: URL, from: NextResponse) {
  const response = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = from.headers.get(header);
    if (value) response.headers.set(header, value);
  }
  return response;
}
