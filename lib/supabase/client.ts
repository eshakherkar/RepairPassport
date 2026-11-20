import { createBrowserClient } from "@supabase/ssr";
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
  return createBrowserClient(url, publishableKey);
}
