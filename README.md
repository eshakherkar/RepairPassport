# RepairPassport

**A digital maintenance passport for household appliances.**

RepairPassport gives each household appliance (a fridge, washing machine, dishwasher, oven or boiler) its own digital passport. You upload repair bills and invoices, AI extracts the key details, and the app keeps a clear, chronological repair history that you can share with a QR code.

> **Status:** early development. The landing page and the dashboard are built and run on **fictional sample data**. There are no user accounts, database or uploads yet.

## What works now

- **Dashboard** (`/dashboard`): overview cards (appliances, repair records, active warranties with an "expiring soon" warning), an appliance preview and recent repair activity
- **Appliance list** (`/appliances`): every appliance with its location, repair count and warranty status
- **Appliance profiles** (`/appliances/<id>`): details, all warranties with today's status, and a chronological repair timeline with costs, parts, service providers and repair warranties
- **Responsive and accessible:** works from 320px phones to desktops in light and dark mode, keyboard-friendly with a skip link and visible focus outlines, colour contrast meets WCAG AA, and respects "reduce motion"

"Add appliance" and "Upload repair bill" lead to placeholder pages until those features are built.

## Why it exists

Appliance repair bills usually end up lost in a drawer or an inbox. When the appliance breaks again, nobody remembers what was fixed, which parts were replaced, what it cost or whether the repair is still under warranty. A clear maintenance history:

- helps technicians diagnose problems faster,
- shows at a glance whether a repair or part is still under warranty,
- helps decide whether to repair or replace an appliance,
- gives buyers, tenants and landlords a trustworthy record, and
- keeps appliances in use for longer, cutting waste.

## Planned features

- [ ] **Appliance profiles:** a digital profile for each household appliance (type, brand, model, purchase details). *Viewing is built; adding and editing are not.*
- [ ] **Bill and invoice uploads:** attach repair bills and invoices to the right appliance
- [ ] **AI extraction:** pull the repair date, issue, cost, replaced parts and warranty details from each uploaded bill, for the user to review
- [ ] **Repair history:** a chronological timeline of every repair and service per appliance. *The timeline is built; it shows sample data until uploads exist.*
- [ ] **QR code sharing:** generate a QR code that shares an appliance's maintenance history
- [ ] **AI assistant** *(later)*: ask questions about an appliance's history, such as "When was the dishwasher pump last replaced?"

## Tech stack

| Technology | What it's used for |
| --- | --- |
| [Next.js](https://nextjs.org) (App Router) | The web framework: pages, routing and the server |
| [React](https://react.dev) | Building the user interface from components |
| [TypeScript](https://www.typescriptlang.org) | JavaScript with types, which catches mistakes before the code runs |
| [Tailwind CSS](https://tailwindcss.com) | Styling with small utility classes |
| [ESLint](https://eslint.org) | Checking code for common problems |
| [Lucide React](https://lucide.dev) | Icons |

## Getting started

You need [Node.js](https://nodejs.org) (which includes npm) installed.

```bash
# 1. Install dependencies (only needed once, or after package.json changes)
npm install

# 2. Set up environment variables (see "Environment variables and secrets" below)
cp .env.example .env.local   # then fill in your Supabase values
npm run check:supabase

# 3. Start the development server
npm run dev
```

Then open <http://localhost:3000> in your browser. The page reloads automatically when you save a file. Press `Ctrl + C` in the terminal to stop the server.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server with live reload |
| `npm run lint` | Checks the code with ESLint |
| `npx tsc --noEmit` | Type-checks the code with TypeScript |
| `npm run build` | Creates an optimised production build |
| `npm run start` | Runs the production build (after `npm run build`) |
| `npm run check:supabase` | Checks `.env.local` and the connection to Supabase |

## Project structure

```text
app/
  layout.tsx            Root layout: <html>, fonts, global styles, metadata
  globals.css           Global styles and colour tokens for Tailwind
  (marketing)/          Route group for public pages (brackets keep it out of the URL)
    layout.tsx          Marketing header and footer
    page.tsx            The landing page (/)
  (app)/                Route group for the dashboard app
    layout.tsx          App shell: sidebar (desktop), top bar with tabs (phones)
    error.tsx           "Something went wrong" page with Try again
    dashboard/          /dashboard
    appliances/         /appliances and /appliances/new
      [applianceId]/    /appliances/kitchen-refrigerator etc.: appliance profile and repair timeline
    repairs/upload/     /repairs/upload
components/
  logo.tsx              RepairPassport wordmark
  site-header.tsx       Marketing navigation bar
  site-footer.tsx       Marketing footer
  app-shell/            App navigation, primary actions, sample data notice
  appliances/           ApplianceCard, ApplianceList, ApplianceIcon, WarrantyBadge,
                        ApplianceDetails, ApplianceWarranties, RepairTimeline, RecordSourceBadge
  dashboard/            StatCard, OverviewStats, RecentRepairs
  ui/                   Reusable building blocks: Badge, ButtonLink (+ shared button styles),
                        PageHeader, Panel, EmptyState
lib/
  types.ts              Data shapes: Appliance, RepairRecord, warranties
  warranty.ts           Warranty rules: active / expiring soon / expired, appliance cover
  appliance-categories.ts  Display names for appliance categories
  format.ts             Date and money formatting (locale and currency settings)
  data/
    appliances.ts       Data functions the pages call (getAppliances, getDashboardStats…)
    mock-data.ts        Fictional sample appliances and repairs, used until there is a database
  supabase/
    server.ts           Supabase client for server code (reads the user's session cookies)
    client.ts           Supabase client for browser code
    env.ts              Reads and checks the Supabase environment variables
    database.types.ts   GENERATED table types, regenerate after each migration
    type-checks.ts      Fails the build if lib/types.ts and the database drift apart
public/                 Static files served as-is (images, icons)
scripts/
  check-supabase.mjs    Connection check (npm run check:supabase)
supabase/
  migrations/           Database changes, applied in order (see "Database" below)
```

## Database

The database is PostgreSQL, hosted by Supabase. Its structure is defined by the SQL files in `supabase/migrations/`, applied in filename order. Never change the database by hand: add a new migration instead, so the history stays in Git.

| Table | Contents |
| --- | --- |
| `appliances` | One row per household appliance: name, category, brand, model, serial number, location, purchase date and manufacturer warranty |
| `repairs` | One row per repair or service: appliance, date, issue, work done, cost (INR), replaced parts, service provider, repair warranty and where the details came from (`manual`, `ai-extracted`, `needs-review`) |

**Security.** Every row has a `user_id` owner. Signed-out visitors have no access. Row Level Security lets signed-in users see, add, change and delete only their own rows, and a repair can only be attached to the same user's appliance.

**After adding a migration:** regenerate `lib/supabase/database.types.ts` (Supabase dashboard → API Docs, or the Supabase CLI / connector) and run `npx tsc --noEmit`.

## Environment variables and secrets

RepairPassport uses [Supabase](https://supabase.com) for its database and (soon) sign-in. It needs two environment variables:

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | The Supabase project URL, e.g. `https://abcdefghijklmnop.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The project's **publishable** key (`sb_publishable_…`), safe for the browser because Row Level Security protects the data |

To set them up:

1. Copy `.env.example` to `.env.local`.
2. Fill in both values from your Supabase project (**Connect**, or **Project Settings → API Keys**).
3. Run `npm run check:supabase` to confirm the connection (it never prints the key).

Rules:

- real values live only in `.env.local`, which Git ignores;
- never commit API keys, passwords or tokens;
- never use the Supabase **secret** key (`sb_secret_…`) in this app's environment variables; the app refuses it.

## License

No license has been chosen yet. Until one is added, all rights are reserved by the author.
