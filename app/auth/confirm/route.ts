import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/confirm: where the link in the confirmation email leads.
 *
 * Supabase can send two kinds of link, and this handles both:
 * - ?code=...                     (Supabase's default email template)
 * - ?token_hash=...&type=email    (Supabase's recommended server-side template)
 * Either way it swaps the one-time value for a signed-in session (saved in
 * cookies), then continues to `next` (the dashboard by default).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));

  const supabase = await createClient();
  let confirmed = false;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    confirmed = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    confirmed = !error;
  }

  // Build the redirect from this site's own address, so the one-time code
  // never stays in the browser's address bar or history.
  const destination = new URL(confirmed ? next : "/auth-error", request.nextUrl.origin);
  return NextResponse.redirect(destination);
}
