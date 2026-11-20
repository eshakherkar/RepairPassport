import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

/**
 * Supabase client for code that runs in the BROWSER (Client Components).
 * Only ever uses the publishable key; Row Level Security decides what it
 * can read or change.
 *
 * Based on Supabase's official Next.js guide.
 */
export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  // <Database> tells TypeScript the exact tables and columns.
  return createBrowserClient<Database>(url, publishableKey);
}
