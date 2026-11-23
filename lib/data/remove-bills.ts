import type { createClient } from "../supabase/server";

/**
 * Deletes bill files from Storage after their repairs are gone. A failure is
 * ignored: the repair is already deleted and the file is private either way.
 */
export async function removeBills(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paths: (string | null)[],
): Promise<void> {
  const files = paths.filter((p): p is string => Boolean(p));
  if (files.length > 0) await supabase.storage.from("bills").remove(files);
}
