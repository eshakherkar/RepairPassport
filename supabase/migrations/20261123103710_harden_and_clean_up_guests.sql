-- Hardening for the public demo.

-- 1. Signed-in users only need to read, add, change and delete rows (which
-- Row Level Security limits to their own). Remove the extra table-level
-- permissions Supabase grants by default.
revoke truncate, trigger, references on public.appliances, public.repairs from authenticated;

-- 2. Every night, delete demo guests (anonymous users) older than 2 days.
-- Their appliances and repairs go with them (ON DELETE CASCADE).
-- shortcut: a guest's uploaded bill files stay in Storage (SQL can't delete
-- storage files); clear them from the Storage dashboard if guests start uploading many.
create extension if not exists pg_cron;

select cron.schedule(
  'delete-old-demo-guests',
  '17 3 * * *',
  $$delete from auth.users where is_anonymous and created_at < now() - interval '2 days'$$
);
