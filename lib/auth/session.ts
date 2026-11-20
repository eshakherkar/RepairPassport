import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
};

/**
 * Who is signed in, or null. SERVER ONLY.
 *
 * Uses Supabase's getClaims(), which VERIFIES the session token's signature.
 * Never trust getSession() for this: it just reads the cookie, and cookies
 * can be forged. `cache` makes repeated calls in one request share a result.
 *
 * This reads cookies, so components that call it must sit inside <Suspense>.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Only check during a real visit. With Partial Prefetching, Next.js can
  // pre-build a page's shell with the session cookies available, and
  // getClaims() reads the clock (to check expiry), which isn't allowed
  // while pre-building. Who's signed in should be checked fresh anyway.
  await connection();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;

  const { sub, email } = data.claims;
  return { id: sub, email: typeof email === "string" ? email : null };
});

/** Like getCurrentUser, but sends signed-out visitors to the sign-in page. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}
