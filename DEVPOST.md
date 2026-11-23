# RepairPassport — Devpost submission text

## Elevator pitch (one line)

A digital maintenance passport for household appliances: every repair, bill and warranty in one place, shareable with a QR code that tells a buyer, tenant or technician at a glance what they're dealing with.

## Inspiration

Appliance repair bills end up lost in drawers and inboxes. When a fridge breaks again, nobody remembers what was replaced, what it cost or whether the repair is still under warranty. When a washing machine is sold second-hand or left in a rented flat, its history disappears completely. Cars have service books; household appliances have nothing.

## What it does

RepairPassport gives each household appliance its own passport:

- **Appliance profiles** with type, brand, model, serial number, location, purchase date and manufacturer warranty.
- **A chronological repair timeline**: date, problem, work done, cost in rupees, replaced parts, service provider and any repair warranty. Each entry says where it came from (**Owner-entered** or **Read by AI**).
- **Bills stored with their repairs**: upload a photo or PDF; it is kept privately and opened through a short-lived link only the owner can use.
- **Warranty tracking**: active, ending soon (30 days) and expired, for both manufacturer and repair warranties, with a dashboard count of what's expiring.
- **Repair or replace?** guidance: total repair spend and age compared with a typical new price and lifespan for that kind of appliance (*Worth repairing*, *Keep an eye on it*, *Consider replacing*), clearly labelled as estimates.
- **QR-code sharing**: a read-only page for a technician, tenant or second-hand buyer, which opens with a **before-you-buy summary** (age against typical lifespan, number and cost of repairs, warranty cover today and an overall condition read). It hides the owner, serial number and bills, states that records are owner-entered and not independently verified, and the owner can stop sharing at any time.
- **A printable passport card** with the key facts and the QR code, to stick on the appliance.
- **One-click demo**: a private guest account pre-filled with five fictional appliances, so judges can try everything without signing up.

## What works in the public demo — and what doesn't

Working and tested on the live site: the one-click demo, sign-up / sign-in / password reset, adding, editing and deleting appliances and repairs, bill upload with manual entry, warranty states, repair-or-replace guidance, the printable passport, QR sharing with the before-you-buy summary, and stopping a share.

**Not active in the demo: AI bill reading.** The code is built (Claude reads a bill photo or PDF into the repair form for the owner to check), but it needs a paid Anthropic API key, so the public demo runs with it switched off and the upload page asks you to type the details instead. It has not yet been run against real bills. We say this openly rather than fake it.

## How we built it

- **Next.js 16** (App Router, Server Components and Server Actions) with **React 19**, **TypeScript** and **Tailwind CSS 4**, deployed on **Vercel**.
- **Supabase**: Postgres with **Row Level Security** on every table so each account only reaches its own rows, a private Storage bucket with per-user folders for bills, anonymous sign-in for the demo, and a nightly scheduled job that deletes demo guests after two days.
- The public share page reads data through a single database function that returns only the appliance matching an unguessable token, without private fields.
- All form input is validated on the server (dates, rupee amounts like "₹4,850.50", parts lists, warranty dates), with 53 automated tests (Vitest) for the rules, money, dates, warranties, bill handling and sign-in safety.
- Accessible by design: labelled form fields, keyboard-friendly dialogs, a skip link, dark mode and layouts tested down to 320-pixel phones.

## Challenges we ran into

- **Honesty about AI.** It's tempting to show AI in a demo. Without a free API key we chose to switch it off visibly, remove "Read by AI" labels from the sample data and say so in the app, rather than simulate it.
- **Public sharing without leaking private data.** Sharing a history publicly while keeping everything else locked down needed a dedicated database function rather than loosening the security rules.
- **A one-click demo that stays safe.** Guest accounts had to be fully isolated, cleaned up automatically, and never replace a real user's session.
- **Bot protection versus a smooth demo.** We built Cloudflare Turnstile protection, but it blocked some real browsers, so we switched it off for judging; the code is ready to switch back on.

## Accomplishments we're proud of

- A complete, deployed product rather than a mock-up, with data privacy enforced in the database.
- The before-you-buy summary: the same records become useful to the next owner, not just the current one.
- Repair-or-replace guidance that nudges people toward repairing when it makes sense, which keeps appliances in use and out of landfill.

## What we learned

Server-side validation and database-level security matter more than front-end checks; honesty in a demo builds more trust than a flashy feature; and small details (warranty boundaries, rupee formats, phone layouts) decide whether a product feels finished.

## What's next (not built yet)

- Switching on AI bill reading with an API key, and testing it on real bills.
- **Technician-verified repairs**: a one-time link where the repair shop confirms the work, shown as a "Verified by technician" badge.
- **Ownership transfer**: hand an appliance's passport to its next owner when selling or moving out.
- An AI assistant to answer questions such as "When was the dishwasher pump last replaced?"
- Email reminders before warranties expire.

## Try it

- Live demo: https://repairpassport-esha.vercel.app (click **Try the demo, no sign-up**)
- Code: https://github.com/eshakherkar/RepairPassport
