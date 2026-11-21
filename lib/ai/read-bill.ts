// Only imported by Server Actions, so the API key never reaches the browser.
import Anthropic from "@anthropic-ai/sdk";
import { BILL_FIELDS, toBillFormValues, type BillMediaType } from "../bill";
import type { RepairFormValues } from "../repair-validation";

const SCHEMA = {
  type: "object",
  properties: Object.fromEntries(
    Object.entries(BILL_FIELDS).map(([key, description]) => [key, { type: "string", description }]),
  ),
  required: Object.keys(BILL_FIELDS),
  additionalProperties: false,
};

const PROMPT = `This is a repair bill or invoice for a household appliance in India.
Fill in each field from the bill. Use an empty string for anything the bill does not show; never guess.
Amounts are in Indian rupees (₹).`;

/** True when the server has an Anthropic API key, so bills can be read by AI. */
export function canReadBills(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Asks Claude to read a bill (photo or PDF) and returns the repair details as
 * form values for the user to check. Returns null if Claude couldn't help.
 */
export async function readBillWithAI(
  data: string,
  mediaType: BillMediaType,
): Promise<RepairFormValues | null> {
  const client = new Anthropic();
  const file =
    mediaType === "application/pdf"
      ? ({ type: "document", source: { type: "base64", media_type: mediaType, data } } as const)
      : ({ type: "image", source: { type: "base64", media_type: mediaType, data } } as const);

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      // If the request is declined, Anthropic retries it on a suitable fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content: [file, { type: "text", text: PROMPT }] }],
    });

    if (response.stop_reason !== "end_turn") return null;
    const text = response.content.find((block) => block.type === "text");
    return text ? toBillFormValues(JSON.parse(text.text)) : null;
  } catch (error) {
    // The user can still type the details in; log the reason for debugging.
    console.error("Reading the bill with AI failed:", error);
    return null;
  }
}
