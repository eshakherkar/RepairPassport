-- Repair bills (uploaded files) and public, read-only share links.

-- 1. Each repair can point to its bill in Storage: "<user id>/<file name>".
alter table public.repairs
  add column bill_path text
  check (bill_path is null or char_length(bill_path) <= 300);

-- 2. An appliance is shared when it has a share token (an unguessable UUID).
alter table public.appliances
  add column share_token uuid unique;

-- 3. A private bucket for bill files: images and PDFs up to 4 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bills', 'bills', false, 4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- Users can only touch files inside their own folder (named after their user id).
create policy "Users can upload their own bills"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'bills' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can read their own bills"
  on storage.objects for select to authenticated
  using (bucket_id = 'bills' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can delete their own bills"
  on storage.objects for delete to authenticated
  using (bucket_id = 'bills' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 4. The public share page: given a share token, return that one appliance
-- and its repairs. Runs with the owner's rights (security definer) so
-- signed-out visitors can read it, but it only ever returns the appliance
-- whose token matches, and never the owner, serial number or bill files.
create function public.get_shared_appliance(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'appliance',
      to_jsonb(a) - 'user_id' - 'share_token' - 'serial_number',
    'repairs',
      coalesce(
        (select jsonb_agg(to_jsonb(r) - 'user_id' - 'bill_path' order by r.repair_date desc)
         from public.repairs r
         where r.appliance_id = a.id),
        '[]'::jsonb
      )
  )
  from public.appliances a
  where a.share_token = p_token;
$$;

revoke execute on function public.get_shared_appliance(uuid) from public;
grant execute on function public.get_shared_appliance(uuid) to anon, authenticated;
