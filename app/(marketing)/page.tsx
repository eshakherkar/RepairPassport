import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  History,
  MessageCircleQuestion,
  QrCode,
  Receipt,
  Refrigerator,
  ScanText,
  ShieldCheck,
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Marks a feature that is on the roadmap rather than in the first release. */
  planned?: boolean;
};

const features: Feature[] = [
  {
    icon: Refrigerator,
    title: "A profile for every appliance",
    description:
      "Give your fridge, washing machine, oven or boiler its own passport with brand, model and purchase details.",
  },
  {
    icon: Receipt,
    title: "Upload repair bills",
    description:
      "Keep every repair bill and invoice with the appliance it belongs to, instead of in a drawer.",
  },
  {
    icon: ScanText,
    title: "AI reads the paperwork",
    description:
      "AI extracts the repair date, issue, cost, replaced parts and warranty details from each bill.",
  },
  {
    icon: History,
    title: "Chronological repair history",
    description:
      "See every repair and service for an appliance on one timeline, newest first.",
  },
  {
    icon: QrCode,
    title: "Share with a QR code",
    description:
      "Generate a QR code so a technician, landlord or buyer can view an appliance's maintenance history.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Ask about an appliance",
    description:
      "Ask an AI assistant questions such as when the washing machine was last repaired.",
    planned: true,
  },
];

const steps = [
  {
    icon: Refrigerator,
    title: "Add an appliance",
    description:
      "Create a passport for a household appliance in a few details.",
  },
  {
    icon: Receipt,
    title: "Upload a repair bill",
    description:
      "AI pulls out the date, issue, cost, parts and warranty, ready for you to check.",
  },
  {
    icon: ShieldCheck,
    title: "Keep and share its history",
    description:
      "Track repairs and warranty cover over time, and share it with a QR code.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:pb-24">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand">
            Free to try · sign up in seconds
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            A digital maintenance passport for your household appliances.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-pretty text-muted">
            Upload repair bills and RepairPassport uses AI to turn them into a
            clear repair history for each appliance, with dates, issues,
            costs, replaced parts and warranty details, ready to share with a
            QR code.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 font-medium text-background transition-colors hover:bg-brand-hover"
            >
              Try it free
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 font-medium transition-colors hover:bg-surface"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        aria-labelledby="features-heading"
        className="scroll-mt-16 border-y border-border bg-surface"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <h2
            id="features-heading"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Every appliance&apos;s repairs, bills and warranties in one record
          </h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description, planned }) => (
              <li
                key={title}
                className="rounded-xl border border-border bg-background p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  {planned && (
                    <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted">
                      Coming later
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16 sm:px-6 lg:py-24"
      >
        <h2
          id="how-heading"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          How it works
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-brand">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-muted">
                  Step {index + 1}
                </p>
                <h3 className="mt-1 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
