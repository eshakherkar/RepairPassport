/**
 * Rules for uploaded repair bills, shared by the upload form and the server.
 */

import type { RepairFormValues } from "./repair-validation";

/** Vercel accepts request bodies up to 4.5 MB, so bills stay under 4 MB. */
export const BILL_MAX_BYTES = 4 * 1024 * 1024;

/** File types Claude can read, mapped to the extension the file is stored with. */
export const BILL_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
} as const;

export type BillMediaType = keyof typeof BILL_TYPES;

/** Returns a problem with the file, or null if it can be uploaded. */
export function checkBillFile(file: { size: number; type: string }): string | null {
  if (file.size === 0) return "Choose a photo or PDF of the bill.";
  if (!(file.type in BILL_TYPES)) return "Upload a JPG, PNG or WebP photo, or a PDF.";
  if (file.size > BILL_MAX_BYTES) return "That file is over 4 MB. Try a smaller photo or PDF.";
  return null;
}

/** A stored bill path is "<user id>/<uuid>.<ext>", always in the user's own folder. */
const BILL_PATH = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/i;

export function isOwnBillPath(path: string, userId: string): boolean {
  return BILL_PATH.test(path) && path.startsWith(`${userId}/`);
}

/** What Claude is asked to return for a bill. Every field is a string; "" = not on the bill. */
export const BILL_FIELDS = {
  repairDate: "Date of the repair or invoice, as YYYY-MM-DD.",
  issue: "The problem in a few words, e.g. 'Not cooling'.",
  workDone: "What the technician did, in one or two sentences.",
  cost: "Total amount paid in rupees, digits only with an optional decimal point, e.g. '4850' or '4850.50'.",
  replacedParts: "Parts replaced, one per line.",
  serviceProvider: "The repair company or service centre's name.",
  warrantyExpiresOn: "Last day of any warranty on this repair, as YYYY-MM-DD. If the bill gives a length (e.g. '90 days'), work out the date from the repair date.",
  warrantyCoverage: "What that warranty covers, e.g. 'Compressor, 6 months'.",
  warrantyProvider: "Who gives that warranty, usually the service provider.",
} satisfies Record<keyof RepairFormValues, string>;

/** Turns Claude's JSON answer into form values, ignoring anything unexpected. */
export function toBillFormValues(answer: unknown): RepairFormValues {
  const data = (answer && typeof answer === "object" ? answer : {}) as Record<string, unknown>;
  const text = (key: keyof RepairFormValues) =>
    typeof data[key] === "string" ? (data[key] as string).trim() : "";
  return {
    repairDate: text("repairDate"),
    issue: text("issue"),
    workDone: text("workDone"),
    cost: text("cost"),
    replacedParts: text("replacedParts"),
    serviceProvider: text("serviceProvider"),
    warrantyExpiresOn: text("warrantyExpiresOn"),
    warrantyCoverage: text("warrantyCoverage"),
    warrantyProvider: text("warrantyProvider"),
  };
}
