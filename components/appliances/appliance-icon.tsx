import {
  AirVent,
  CookingPot,
  Droplets,
  Microwave,
  Plug,
  Refrigerator,
  ShowerHead,
  UtensilsCrossed,
  WashingMachine,
  type LucideIcon,
} from "lucide-react";
import type { ApplianceCategory } from "@/lib/types";

const categoryIcons: Record<ApplianceCategory, LucideIcon> = {
  refrigerator: Refrigerator,
  "washing-machine": WashingMachine,
  dishwasher: UtensilsCrossed, // Lucide has no dishwasher icon
  oven: CookingPot,
  microwave: Microwave,
  "air-conditioner": AirVent,
  "water-heater": ShowerHead,
  "water-purifier": Droplets,
  other: Plug,
};

/** The icon for an appliance category, in a soft green square. */
export function ApplianceIcon({ category }: { category: ApplianceCategory }) {
  const Icon = categoryIcons[category];
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}
