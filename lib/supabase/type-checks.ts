/**
 * Compile-time checks that the app's own types (lib/types.ts) still match
 * the database (lib/supabase/database.types.ts).
 *
 * Nothing here runs. If a migration adds or renames an appliance category
 * or record source and lib/types.ts isn't updated (or the other way round),
 * `npx tsc --noEmit` and `npm run build` fail and point to this file.
 */
import type { ApplianceCategory, RecordSource } from "../types";
import type { Enums } from "./database.types";

/** Resolves to `true` only when A and B contain exactly the same values. */
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

const categoriesMatch: Same<ApplianceCategory, Enums<"appliance_category">> = true;
const sourcesMatch: Same<RecordSource, Enums<"record_source">> = true;

// Exported only so linters don't flag the constants as unused.
export const typeChecks = { categoriesMatch, sourcesMatch };
