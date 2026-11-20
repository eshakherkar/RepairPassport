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

# 2. Start the development server
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
public/                 Static files served as-is (images, icons)
```

## Environment variables and secrets

This project doesn't need any environment variables yet. When it does:

- put real values in a `.env.local` file, which Git ignores;
- never commit API keys, passwords or tokens;
- document the variable *names* (without real values) in a `.env.example` file.

## License

No license has been chosen yet. Until one is added, all rights are reserved by the author.
