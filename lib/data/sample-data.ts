import type { Appliance, RepairRecord } from "../types";
import { DEFAULT_CURRENCY } from "../format";

/*
 * FICTIONAL SAMPLE DATA
 * ---------------------
 * Five example appliances with six repairs, which a signed-in user with an
 * empty account can load into their own account ("Load sample appliances",
 * see sample-data-actions.ts) to try the app.
 * Brands, model numbers, serial numbers and service companies are made up.
 * No real people or real personal data appear here.
 *
 * The `id` values below are only labels that link each repair to its
 * appliance while loading; the database gives every row a real ID.
 */

export const sampleAppliances: Appliance[] = [
  {
    id: "kitchen-refrigerator",
    name: "Kitchen refrigerator",
    category: "refrigerator",
    brand: "Frostline",
    model: "FL-340 Double Door",
    serialNumber: "FL340-SAMPLE-0001",
    location: "Kitchen",
    purchaseDate: "2022-03-14",
    manufacturerWarranty: {
      expiresOn: "2023-03-13",
      coverage: "Full appliance",
      provider: "Frostline",
    },
  },
  {
    id: "front-load-washing-machine",
    name: "Front-load washing machine",
    category: "washing-machine",
    brand: "AquaSpin",
    model: "AS-7 Front Load 7 kg",
    serialNumber: "AS7-SAMPLE-0002",
    location: "Utility area",
    purchaseDate: "2023-09-01",
    manufacturerWarranty: {
      expiresOn: "2025-08-31",
      coverage: "Full appliance",
      provider: "AquaSpin",
    },
  },
  {
    id: "bedroom-air-conditioner",
    name: "Bedroom air conditioner",
    category: "air-conditioner",
    brand: "Coolbreeze",
    model: "CB-15 Split 1.5 Ton",
    location: "Main bedroom",
    purchaseDate: "2024-04-20",
    manufacturerWarranty: {
      expiresOn: "2029-04-19",
      coverage: "Compressor (5 years)",
      provider: "Coolbreeze",
    },
  },
  {
    id: "kitchen-microwave",
    name: "Kitchen microwave",
    category: "microwave",
    brand: "Heatwise",
    model: "HW-25 Convection",
    serialNumber: "HW25-SAMPLE-0004",
    location: "Kitchen",
    purchaseDate: "2021-11-28",
    manufacturerWarranty: {
      expiresOn: "2022-11-27",
      coverage: "Full appliance",
      provider: "Heatwise",
    },
  },
  {
    id: "bathroom-water-heater",
    name: "Bathroom water heater",
    category: "water-heater",
    brand: "Thermora",
    model: "TH-25 Storage 25 L",
    location: "Main bathroom",
    purchaseDate: "2025-12-10",
    manufacturerWarranty: {
      expiresOn: "2027-12-09",
      coverage: "Full appliance, tank 5 years",
      provider: "Thermora",
    },
  },
];

export const sampleRepairs: RepairRecord[] = [
  {
    id: "repair-fridge-2024-06",
    applianceId: "kitchen-refrigerator",
    repairDate: "2024-06-02",
    issue: "Not cooling",
    workDone: "Refilled refrigerant gas and replaced the thermostat.",
    cost: { amount: 4850, currency: DEFAULT_CURRENCY },
    replacedParts: ["Thermostat"],
    serviceProvider: "CoolCare Appliance Services",
    repairWarranty: {
      expiresOn: "2024-12-02",
      coverage: "Thermostat and gas refill",
      provider: "CoolCare Appliance Services",
    },
    source: "manual",
  },
  {
    id: "repair-fridge-2026-08",
    applianceId: "kitchen-refrigerator",
    repairDate: "2026-08-19",
    issue: "Water leaking inside",
    workDone: "Cleared the blocked drain pipe and replaced the door gasket.",
    cost: { amount: 2300, currency: DEFAULT_CURRENCY },
    replacedParts: ["Door gasket"],
    serviceProvider: "CoolCare Appliance Services",
    repairWarranty: {
      expiresOn: "2027-02-19",
      coverage: "Door gasket",
      provider: "CoolCare Appliance Services",
    },
    source: "ai-extracted",
  },
  {
    id: "repair-washer-2025-02",
    applianceId: "front-load-washing-machine",
    repairDate: "2025-02-11",
    issue: "Door will not lock",
    workDone: "Replaced the door lock under manufacturer warranty.",
    cost: { amount: 0, currency: DEFAULT_CURRENCY },
    replacedParts: ["Door lock assembly"],
    serviceProvider: "AquaSpin Authorised Service Centre",
    source: "manual",
  },
  {
    id: "repair-washer-2026-10",
    applianceId: "front-load-washing-machine",
    repairDate: "2026-10-05",
    issue: "Drum not spinning",
    workDone: "Replaced the worn drive belt and tested all wash cycles.",
    cost: { amount: 3200, currency: DEFAULT_CURRENCY },
    replacedParts: ["Drive belt"],
    serviceProvider: "QuickFix Home Appliances",
    repairWarranty: {
      expiresOn: "2026-12-05",
      coverage: "Drive belt",
      provider: "QuickFix Home Appliances",
    },
    source: "ai-extracted",
  },
  {
    id: "repair-ac-2026-05",
    applianceId: "bedroom-air-conditioner",
    repairDate: "2026-05-10",
    issue: "Annual service",
    workDone: "Cleaned filters and coils, checked gas pressure.",
    cost: { amount: 1200, currency: DEFAULT_CURRENCY },
    replacedParts: [],
    serviceProvider: "Coolbreeze Service Centre",
    source: "manual",
  },
  {
    id: "repair-microwave-2026-11",
    applianceId: "kitchen-microwave",
    repairDate: "2026-11-08",
    issue: "Not heating",
    workDone: "Replaced the magnetron and high-voltage fuse.",
    cost: { amount: 3900, currency: DEFAULT_CURRENCY },
    replacedParts: ["Magnetron", "High-voltage fuse"],
    serviceProvider: "QuickFix Home Appliances",
    repairWarranty: {
      expiresOn: "2027-02-08",
      coverage: "Magnetron",
      provider: "QuickFix Home Appliances",
    },
    source: "needs-review",
  },
];
