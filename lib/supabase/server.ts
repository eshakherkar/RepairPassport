import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

/**
 * Supabase client for code that runs on the SERVER:
 * Server Components, Server Actions and Route Handlers.
 *
 * It reads the signed-in user's session from cookies, so the database
 * knows who is asking and Row Level Security can apply their rules.
 * Create a new client for each request (don't share one between users).
 *
 * Based on Supabase's official Next.js guide.
 */
export async function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  // <Database> tells TypeScript the exact tables and columns.
  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components can't write cookies. This is safe to ignore
          // once proxy.ts refreshes sessions (added with sign-in, Stage 3).
        }
      },
    },
  });
}
