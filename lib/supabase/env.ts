/**
 * Reads the Supabase settings from environment variables (.env.local)
 * and fails with a clear message if they're missing.
 *
 * The variables are written out in full (process.env.NEXT_PUBLIC_...)
 * on purpose: Next.js only copies NEXT_PUBLIC_ values into browser code
 * when they're spelled out like this.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || url.startsWith("your-")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not set. Copy .env.example to .env.local and add your Supabase project URL.",
    );
  }
  if (!publishableKey || publishableKey.startsWith("your-")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set. Copy .env.example to .env.local and add your Supabase publishable key.",
    );
  }
  if (publishableKey.startsWith("sb_secret_")) {
    // The secret key bypasses all security rules and must never reach the browser.
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY contains a SECRET key (sb_secret_...). Use the publishable key (sb_publishable_...) instead.",
    );
  }

  return { url, publishableKey };
}
