# RepairPassport

**A digital maintenance passport for household appliances.**

RepairPassport gives each household appliance (a fridge, washing machine, dishwasher, oven or boiler) its own digital passport. You upload repair bills and invoices, AI extracts the key details, and the app keeps a clear, chronological repair history that you can share with a QR code.

**Live demo:** [repairpassport-esha.vercel.app](https://repairpassport-esha.vercel.app). Click **Try the demo, no sign-up**: you get a private guest account already filled with fictional sample appliances. Or create a normal account in seconds.

> **Status:** working MVP. Each signed-in user sees only their own appliances, repairs and bills (Row Level Security). Built for LaunchPad Hacks.

### Try it in 2 minutes

1. On the live site, click **Try the demo, no sign-up**. A private guest account opens on a dashboard with five fictional appliances and six repairs. (Or sign up, then click **Load sample appliances**.)
2. Look around: warranties expiring soon, repair timelines, edit or add an appliance.
3. Open an appliance and click **Upload repair bill**. Upload a photo or PDF of a bill, fill in the repair details and save. The bill is stored with the repair (**Bill** link). *(The live demo runs without an AI key, so AI bill reading is off there; with `ANTHROPIC_API_KEY` set, Claude fills the details in for you.)*
4. On the same appliance, click **Create share link**. Scan the QR code with a phone to see the read-only history.

## What works now

- **One-click demo** (**Try the demo** on the home, sign-in and sign-up pages): signs the visitor in as a private guest (Supabase anonymous sign-in), copies in the fictional sample appliances and opens the dashboard. Each guest's data is separate (Row Level Security). Guest accounts pile up over time; to clear them, run `delete from auth.users where is_anonymous and created_at < now() - interval '7 days';` in the Supabase SQL editor (their bill files stay in Storage).
- **Accounts** (`/sign-up`, `/sign-in`): email and password; new accounts are signed in straight away (Supabase's "Confirm email" setting is off, so judges can try the app without an inbox); passwords need 8+ characters including a letter and a number. **Forgot password?** on the sign-in page emails a link to choose a new one (`/forgot-password` → `/reset-password`). The dashboard pages require signing in.
- **Dashboard** (`/dashboard`): overview cards (appliances, repair records, active warranties with an "expiring soon" warning), an appliance preview and recent repair activity
- **Add appliance** (`/appliances/new`): a form for the name, type, brand, model, serial number, location, purchase date and manufacturer warranty. Answers are checked on the server; if something needs fixing, the form keeps what you typed and points to the problem.
- **Edit and delete** (`/appliances/<id>/edit`, via **Edit details** on a profile): change any detail with the same form and checks, or delete the appliance and its repair history after confirming in a pop-up
- **Log a repair** (`/appliances/<id>/repairs/new`, via **Log a repair** on a profile): the date, problem, work done, cost in rupees, replaced parts, who repaired it and any repair warranty. The repair appears in the appliance's timeline and on the dashboard straight away.
- **Upload a repair bill with AI** (`/repairs/upload`): upload a photo or PDF (up to 4 MB). Claude reads the date, problem, work done, cost, replaced parts, service provider and repair warranty, and fills in the repair form for you to check before saving. The bill is stored privately in Supabase Storage and linked from the repair. Without an AI key the upload still works and you type the details in.
- **Share with a QR code** (**Share history** on a profile): creates a read-only link (`/share/<token>`) and a QR code for a technician, landlord or buyer. No sign-in needed to view it; it hides the serial number and bills, and **Stop sharing** turns the link off.
- **Edit and delete repairs** (**Edit** beside each repair in the timeline): fix any detail or delete the repair after confirming. Repairs read by AI show **Review** instead; saving one marks it as reviewed.
- **Appliance list** (`/appliances`): every appliance with its location, repair count and warranty status
- **Appliance profiles** (`/appliances/<id>`): details, all warranties with today's status, and a chronological repair timeline with costs, parts, service providers and repair warranties
- **Responsive and accessible:** works from 320px phones to desktops in light and dark mode, keyboard-friendly with a skip link and visible focus outlines, colour contrast meets WCAG AA, and respects "reduce motion"

An empty account shows a **Load sample appliances** button, which copies five fictional appliances and six repairs into that account.

## Why it exists

Appliance repair bills usually end up lost in a drawer or an inbox. When the appliance breaks again, nobody remembers what was fixed, which parts were replaced, what it cost or whether the repair is still under warranty. A clear maintenance history:

- helps technicians diagnose problems faster,
- shows at a glance whether a repair or part is still under warranty,
- helps decide whether to repair or replace an appliance,
- gives buyers, tenants and landlords a trustworthy record, and
- keeps appliances in use for longer, cutting waste.

## Features

- [x] **Appliance profiles:** a digital profile for each household appliance (type, brand, model, purchase details). *Viewing, adding, editing and deleting are built.*
- [x] **Bill and invoice uploads:** attach repair bills and invoices to the right appliance
- [x] **AI extraction:** pull the repair date, issue, cost, replaced parts and warranty details from each uploaded bill, for the user to review
- [x] **Repair history:** a chronological timeline of every repair and service per appliance, logged by hand or from uploaded bills.
- [x] **QR code sharing:** generate a QR code that shares an appliance's maintenance history
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
| [Supabase](https://supabase.com) | Database, sign-in, Row Level Security and private bill storage |
| [Claude](https://www.anthropic.com/claude) (Anthropic API, `claude-opus-5-5`) | Reading uploaded bills into structured repair details |
| [qrcode](https://github.com/soldair/node-qrcode) | QR codes for shared histories |
| [Vitest](https://vitest.dev) | Automated tests |

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
| `npm test` | Runs the automated tests ([Vitest](https://vitest.dev)): form rules, money, dates, warranties and sign-in safety |
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
    share/[token]/      /share/<token>: public, read-only shared history (QR code target)
  (auth)/               Route group for /sign-in, /sign-up, /check-email, /auth-error
  auth/confirm/         Handles the link in confirmation emails
  (app)/                Route group for the dashboard app (requires sign-in)
    layout.tsx          App shell: sidebar (desktop), top bar with tabs (phones)
    error.tsx           "Something went wrong" page with Try again
    dashboard/          /dashboard
    appliances/         /appliances
      new/              /appliances/new: the Add appliance form
      [applianceId]/    /appliances/<id>: appliance profile and repair timeline
        edit/           /appliances/<id>/edit: edit or delete the appliance
        repairs/new/    /appliances/<id>/repairs/new: log a repair by hand
        repairs/[repairId]/edit/  edit or delete one repair
        repairs/[repairId]/bill   opens the repair's stored bill (owner only)
    repairs/upload/     /repairs/upload: upload a bill, AI fills in the repair
components/
  logo.tsx              RepairPassport wordmark
  site-header.tsx       Marketing navigation bar
  site-footer.tsx       Marketing footer
  app-shell/            App navigation, primary actions, signed-in user menu
  appliances/           ApplianceCard, ApplianceList, ApplianceIcon, WarrantyBadge, ApplianceForm,
                        RepairForm, UploadBillForm, SharePanel,
                        ApplianceDetails, ApplianceWarranties, RepairTimeline, RecordSourceBadge
  dashboard/            StatCard, OverviewStats, RecentRepairs
  ui/                   Reusable building blocks: Badge, ButtonLink (+ shared button styles),
                        PageHeader, Panel, EmptyState, TextField, TextAreaField, SelectField,
                        FormMessage, FormSection (+ FormErrors, FormActions), ConfirmDeleteButton
lib/
  types.ts              Data shapes: Appliance, RepairRecord, warranties
  warranty.ts           Warranty rules: active / expiring soon / expired, appliance cover
  appliance-categories.ts  Display names for appliance categories
  appliance-validation.ts  Rules for the appliance form (shared by the form and the server)
  repair-validation.ts     Rules for the repair form, including rupee amounts and parts lists
  format.ts             Date and money formatting (locale and currency settings)
  bill.ts               Bill rules: file types and size, storage paths, AI answer → form values
  ai/read-bill.ts       Asks Claude to read a bill (structured JSON output)
  site-origin.ts        This site's address, for email and share links
  data/
    appliances.ts       Data functions the pages call; read the signed-in user's rows from Supabase
    derive.ts           Pure calculations: stats, appliance cards, profiles, recent repairs
    mappers.ts          Database rows → app types (snake_case columns → camelCase)
    sample-data.ts      Five fictional appliances and six repairs for trying the app
    appliance-actions.ts    Add, edit and delete appliance Server Actions
    repair-actions.ts       Log, edit and delete repair Server Actions
    bill-actions.ts         Upload a bill and read it with AI
    share-actions.ts        Turn an appliance's share link on or off
    shared.ts               Loads a shared appliance for /share/<token>
    sample-data-actions.ts  "Load sample appliances" Server Action (empty accounts only)
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

## Accounts and sign-in

Sign-in uses [Supabase Auth](https://supabase.com/docs/guides/auth) with email and password.

- `proxy.ts` (Next.js 16's name for middleware) runs before each page. It refreshes the session cookie and sends signed-out visitors from `/dashboard`, `/appliances` and `/repairs` to `/sign-in?next=…`.
- `lib/auth/session.ts` checks who is signed in with `getClaims()`, which verifies the session token. Pages and server actions check again themselves; the proxy is only a first, fast check.
- `lib/auth/actions.ts` holds the sign-up, sign-in and sign-out Server Actions.
- After sign-in, users only return to pages on this site (`safeNextPath`), never to outside links.

**Supabase settings** (Dashboard → Authentication → URL Configuration): Site URL `http://localhost:3000`, and add `http://localhost:3000/**` to Redirect URLs so password-reset links can return to `/auth/confirm`. For the live site, use `https://repairpassport-esha.vercel.app` and add `https://repairpassport-esha.vercel.app/**`. Email links only work in the browser that asked for them, because Supabase's built-in email service doesn't allow changing the email templates; a custom SMTP sender would lift that.

## Database

The database is PostgreSQL, hosted by Supabase. Its structure is defined by the SQL files in `supabase/migrations/`, applied in filename order. Never change the database by hand: add a new migration instead, so the history stays in Git.

| Table | Contents |
| --- | --- |
| `appliances` | One row per household appliance: name, category, brand, model, serial number, location, purchase date and manufacturer warranty, and a `share_token` when shared |
| `repairs` | One row per repair or service: appliance, date, issue, work done, cost (INR), replaced parts, service provider, repair warranty where the details came from (`manual`, `ai-extracted`, `needs-review`) and the stored bill (`bill_path`) |
| Storage bucket `bills` | Private bill files, one folder per user (`<user id>/<file>`) |

**Security.** Every row has a `user_id` owner. Signed-out visitors have no access. Row Level Security lets signed-in users see, add, change and delete only their own rows, and a repair can only be attached to the same user's appliance. Bill files follow the same rule by folder. The one public door is `get_shared_appliance(token)`: it returns only the appliance whose unguessable share token matches, without the owner, serial number or bills.

**After adding a migration:** regenerate `lib/supabase/database.types.ts` (Supabase dashboard → API Docs, or the Supabase CLI / connector) and run `npx tsc --noEmit`.

## Environment variables and secrets

RepairPassport uses [Supabase](https://supabase.com) for its database and sign-in, and Claude to read bills. It uses three environment variables:

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | The Supabase project URL, e.g. `https://abcdefghijklmnop.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The project's **publishable** key (`sb_publishable_…`), safe for the browser because Row Level Security protects the data |
| `ANTHROPIC_API_KEY` | *Optional, server only.* An [Anthropic API key](https://console.anthropic.com) for reading bills with AI. Without it, bills still upload and the details are typed in. Each bill read costs a small amount on your Anthropic account. |

To set them up:

1. Copy `.env.example` to `.env.local`.
2. Fill in the Supabase values from your project (**Connect**, or **Project Settings → API Keys**), and optionally your Anthropic key.
   On Vercel, add the same variables under **Project → Settings → Environment Variables**, then redeploy.
3. Run `npm run check:supabase` to confirm the connection (it never prints the key).

Rules:

- real values live only in `.env.local`, which Git ignores;
- never commit API keys, passwords or tokens;
- never use the Supabase **secret** key (`sb_secret_…`) in this app's environment variables; the app refuses it.

## License

No license has been chosen yet. Until one is added, all rights are reserved by the author.
