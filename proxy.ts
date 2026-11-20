import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16 "proxy" (called "middleware" in older versions): runs before
 * each matching request. Here it keeps the Supabase session fresh and
 * guards the signed-in pages. See lib/supabase/proxy.ts.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Every path except static files and images, which don't need sign-in.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
