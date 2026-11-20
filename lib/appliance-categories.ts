import type { ApplianceCategory } from "./types";

/** Human-readable names for each appliance category. */
export const applianceCategoryLabels: Record<ApplianceCategory, string> = {
  refrigerator: "Refrigerator",
  "washing-machine": "Washing machine",
  dishwasher: "Dishwasher",
  oven: "Oven",
  microwave: "Microwave",
  "air-conditioner": "Air conditioner",
  "water-heater": "Water heater",
  "water-purifier": "Water purifier",
  other: "Other appliance",
};
