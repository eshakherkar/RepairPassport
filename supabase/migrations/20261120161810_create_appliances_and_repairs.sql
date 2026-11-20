-- RepairPassport: appliances and repairs
-- =====================================
-- Creates the two main tables. Every row belongs to one signed-in user
-- (`user_id`), and Row Level Security (RLS) makes sure each person can only
-- see and change their own rows.
--
-- The columns mirror the TypeScript types in lib/types.ts.

-- 1. Allowed values ----------------------------------------------------------
-- Enums: the database rejects anything not in these lists.

create type public.appliance_category as enum (
  'refrigerator',
  'washing-machine',
  'dishwasher',
  'oven',
  'microwave',
  'air-conditioner',
  'water-heater',
  'water-purifier',
  'other'
);

-- Where a repair record's details came from (see RecordSource in lib/types.ts).
create type public.record_source as enum (
  'manual',
  'ai-extracted',
  'needs-review'
);

-- 2. Keep `updated_at` current -----------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3. appliances --------------------------------------------------------------

create table public.appliances (
  id uuid primary key default gen_random_uuid(),
  -- Filled in automatically with the signed-in user's ID.
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 100),
  category public.appliance_category not null,
  brand text not null check (char_length(trim(brand)) between 1 and 100),
  model text not null check (char_length(trim(model)) between 1 and 100),
  serial_number text check (serial_number is null or char_length(serial_number) <= 100),
  location text not null check (char_length(trim(location)) between 1 and 100),
  purchase_date date not null,
  -- Manufacturer warranty (optional).
  manufacturer_warranty_expires_on date,
  manufacturer_warranty_coverage text check (char_length(manufacturer_warranty_coverage) <= 200),
  manufacturer_warranty_provider text check (char_length(manufacturer_warranty_provider) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- The three warranty fields are all filled in, or all empty.
  constraint appliances_warranty_complete check (
    (manufacturer_warranty_expires_on is null
      and manufacturer_warranty_coverage is null
      and manufacturer_warranty_provider is null)
    or
    (manufacturer_warranty_expires_on is not null
      and manufacturer_warranty_coverage is not null
      and manufacturer_warranty_provider is not null)
  ),
  -- Lets repairs point at (id, user_id) together, so a repair can never be
  -- attached to someone else's appliance (see repairs_appliance_fk below).
  constraint appliances_id_user_id_key unique (id, user_id)
);

create index appliances_user_id_idx on public.appliances (user_id);

create trigger appliances_set_updated_at
  before update on public.appliances
  for each row execute function public.set_updated_at();

-- 4. repairs -----------------------------------------------------------------

create table public.repairs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  appliance_id uuid not null,
  repair_date date not null,
  issue text not null check (char_length(trim(issue)) between 1 and 200),
  work_done text not null default '' check (char_length(work_done) <= 2000),
  -- Money in rupees, with paise allowed (e.g. 4850.00).
  cost_amount numeric(12, 2) not null default 0 check (cost_amount >= 0),
  cost_currency text not null default 'INR' check (cost_currency = 'INR'),
  replaced_parts text[] not null default '{}',
  service_provider text not null check (char_length(trim(service_provider)) between 1 and 200),
  -- Warranty on this repair (optional).
  repair_warranty_expires_on date,
  repair_warranty_coverage text check (char_length(repair_warranty_coverage) <= 200),
  repair_warranty_provider text check (char_length(repair_warranty_provider) <= 200),
  source public.record_source not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint repairs_warranty_complete check (
    (repair_warranty_expires_on is null
      and repair_warranty_coverage is null
      and repair_warranty_provider is null)
    or
    (repair_warranty_expires_on is not null
      and repair_warranty_coverage is not null
      and repair_warranty_provider is not null)
  ),
  -- The repair's appliance must belong to the same user as the repair.
  -- Deleting an appliance deletes its repairs too.
  constraint repairs_appliance_fk foreign key (appliance_id, user_id)
    references public.appliances (id, user_id) on delete cascade
);

create index repairs_user_id_idx on public.repairs (user_id);
create index repairs_appliance_id_repair_date_idx
  on public.repairs (appliance_id, repair_date desc);

create trigger repairs_set_updated_at
  before update on public.repairs
  for each row execute function public.set_updated_at();

-- 5. Who may use the tables at all (grants) ----------------------------------
-- Signed-out visitors (anon) get nothing. Signed-in users (authenticated)
-- may read and write, but only the rows RLS allows (next section).

revoke all on table public.appliances, public.repairs from public, anon;
grant select, insert, update, delete
  on table public.appliances, public.repairs to authenticated;

-- The trigger helper is internal; nobody needs to call it directly.
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- 6. Which rows each user may use (Row Level Security) -----------------------
-- `(select auth.uid())` is the signed-in user's ID. Wrapping it in `select`
-- is Supabase's recommended form: it's worked out once per query, not per row.

alter table public.appliances enable row level security;
alter table public.repairs enable row level security;

create policy "Users can view their own appliances"
  on public.appliances for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own appliances"
  on public.appliances for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own appliances"
  on public.appliances for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own appliances"
  on public.appliances for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can view their own repairs"
  on public.repairs for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own repairs"
  on public.repairs for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own repairs"
  on public.repairs for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own repairs"
  on public.repairs for delete to authenticated
  using ((select auth.uid()) = user_id);
